package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.graphics.BitmapFactory
import android.util.Base64
import java.io.File
import java.io.IOException
import java.util.UUID
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.awaitCancellation
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.ai.provider.ModelType
import me.rerere.common.http.await
import okhttp3.Call
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody
import okhttp3.RequestBody.Companion.toRequestBody

internal const val STUDIO_LOCAL_ORIGIN = "https://appassets.androidplatform.net"
internal const val STUDIO_PAGE = "$STUDIO_LOCAL_ORIGIN/kuan-studio/"
internal const val STUDIO_ASSETS = "/assets/image-workbench/20260906e/"
internal const val STUDIO_SCRIPT = "studio.js"
internal const val STUDIO_STYLE = "studio.css"
internal const val STUDIO_SOURCE = "freestylefly/awesome-gpt-image-2"
internal const val STUDIO_REVISION = "63e6176fa01be51c000108dacd72716d3e46784b"
internal val STUDIO_LIBRARY = setOf("cases.json", "content-version.json", "style-library.json", "comparison.json",
    "templates.md", "style-library.zip", "LICENSE.txt")
private const val MAX_IMAGE_BODY = 60L * 1024 * 1024
private const val MAX_IMAGE_FILE = 32L * 1024 * 1024
private val dataImage = Regex("^data:image/(png|jpeg|webp|gif);base64,")
private val storedImage = Regex("[a-f0-9]{32}\\.(png|jpg|webp|gif)")
private val galleryPath = Regex("""(?:thumbs|images|comparison)/[a-zA-Z0-9_-][a-zA-Z0-9_./-]*\.(?:png|webp|jpe?g|gif)""", RegexOption.IGNORE_CASE)

internal data class StudioImage(val file: File, val mime: String)

internal class KuanStudio(
    private val context: Context,
    private val session: KuanSession,
    private val catalog: KuanCatalog,
    private val api: KuanApi,
    private val scope: String,
    private val epoch: Long,
    private val group: KuanGroup,
) {
    @Volatile private var allowedModels = emptySet<String>()
    private val directory = File(context.filesDir, "kuan-studio/$scope")
    private val imageClient = api.client.newBuilder().readTimeout(5, TimeUnit.MINUTES).build()

    fun requireOwner() {
        if (!session.isCurrent(scope, epoch)) throw KuanHttpError(401)
    }

    suspend fun initialize(): JsonObject {
        requireOwner()
        val profile = session.profile()
        requireOwner()
        val key = catalog.key(scope, group.id)
        val current = api.json("/v1/models?kuan_chat=1", bearer = key, envelope = false).asObject()
        requireOwner()
        val models = managedModels(current, scope, group, profile.admin)
            .flatMap { it.models }.filter { it.type == ModelType.IMAGE }.mapTo(linkedSetOf()) { it.modelId }
        allowedModels = models
        val rows = current.array("data").orEmpty().filterIsInstance<JsonObject>()
            .filter { it.string("id") in models }
        return buildJsonObject {
            put("userId", scope)
            put("baseUrl", KUAN_V1)
            put("groupName", group.name)
            put("balance", profile.balance?.toDoubleOrNull() ?: 0.0)
            put("models", buildJsonArray { models.forEach { add(JsonPrimitive(it)) } })
            put("modelOptions", JsonObject(rows.associate { row ->
                row.string("id").orEmpty() to JsonObject(row.filterKeys { it in setOf("supported_image_sizes", "image_constraints") })
            }))
        }
    }

    suspend fun profile(): JsonObject {
        requireOwner()
        val balance = session.profile().balance?.toDoubleOrNull() ?: 0.0
        requireOwner()
        return buildJsonObject { put("balance", balance) }
    }

    suspend fun generate(input: JsonObject): JsonObject = withContext(Dispatchers.IO) {
        requireOwner()
        val request = studioImageRequest(input, allowedModels)
        val key = catalog.key(scope, group.id)
        requireOwner()
        val raw = api.request(
            request.path, "POST", key, request.body.toString().toRequestBody(KuanApi.JSON_TYPE),
            headers = mapOf("X-KuanAPI-Request-Normalized" to "1"),
        )
        val responseData = imageClient.newCall(raw).readStudioResponse { response ->
            when {
                !response.isSuccessful -> {
                    val source = response.body.source()
                    val payload = if (source.request(8193L)) null else readStudioJson(source.readUtf8())
                    val detail = payload?.obj("error")?.string("message") ?: payload?.string("message")
                    throw KuanProtocolError(detail?.replace(key, "[redacted]")?.trim()?.take(300)?.ifBlank { null }
                        ?: "生图请求失败（HTTP ${response.code}）")
                }
                response.body.source().request(MAX_IMAGE_BODY + 1) -> throw KuanProtocolError("图片响应太大")
                else -> Triple(
                    readStudioJson(response.body.source().readUtf8()) ?: throw KuanProtocolError("无法读取图片响应"),
                    response.header("x-request-id"),
                    request.body.string("output_format").orEmpty(),
                )
            }
        }
        requireOwner()
        val (payload, requestId, format) = responseData
        val results = studioImages(payload, format).take(4)
        if (results.isEmpty()) throw KuanProtocolError("接口未返回图片")
        val urls = results.map { result ->
            requireOwner()
            val image = if (result.startsWith("data:")) storeDataImage(result) else fetchImage(result)
            "${STUDIO_PAGE}result/${image.file.name}"
        }
        requireOwner()
        buildJsonObject {
            put("images", buildJsonArray { urls.forEach { add(JsonPrimitive(it)) } })
            requestId?.take(200)?.let { put("requestId", it) }
            payload.array("data")?.filterIsInstance<JsonObject>()?.firstNotNullOfOrNull { it.string("revised_prompt") }
                ?.take(12000)?.let { put("revisedPrompt", it) }
        }
    }

    fun result(name: String): StudioImage? {
        if (!session.isCurrent(scope, epoch) || !storedImage.matches(name)) return null
        val file = File(directory, name)
        return if (file.isFile) StudioImage(file, imageMime(file.extension)) else null
    }

    fun publicAsset(value: String): Response? {
        val target = studioPublicImage(value) ?: return null
        val response = api.client.newCall(imageGet(target)).execute()
        return try {
            if (validatedImageType(response) != null) response else { response.close(); null }
        } catch (error: Exception) {
            response.close()
            throw error
        }
    }

    suspend fun downloadable(url: String): StudioImage = withContext(Dispatchers.IO) {
        requireOwner()
        if (url.startsWith("${STUDIO_PAGE}result/")) {
            result(url.substringAfter("${STUDIO_PAGE}result/")) ?: throw IOException("Image is missing")
        } else {
            val target = studioPublicImage(url) ?: throw KuanProtocolError("图片不是已发布的案例原图")
            fetchImage(target)
        }
    }

    private fun storeDataImage(value: String): StudioImage {
        val mime = dataImage.find(value)?.groupValues?.get(1) ?: throw KuanProtocolError("不支持的图片格式")
        val encoded = value.substringAfter(',')
        if (encoded.length > (MAX_IMAGE_FILE * 4 / 3) + 8) throw KuanProtocolError("图片文件太大")
        val data = Base64.decode(encoded, Base64.DEFAULT)
        if (data.size !in 1..MAX_IMAGE_FILE) throw KuanProtocolError("图片文件大小无效")
        return storeImage(mime) { it.writeBytes(data) }
    }

    private suspend fun fetchImage(value: String): StudioImage {
        val target = value.toHttpUrlOrNull() ?: throw IOException("Invalid image address")
        val allowed = target.host == "kuanapi.kuankuan.de5.net" ||
            target.host == "ai.larryllr.cc.cd" || target.host.endsWith(".oaiusercontent.com")
        if (!secureStudioUrl(target) || !allowed) {
            throw KuanProtocolError("图片地址不在允许的下载来源")
        }
        return fetchImage(target)
    }

    private suspend fun fetchImage(target: HttpUrl): StudioImage =
        api.client.newCall(imageGet(target)).readStudioResponse { response ->
            if (!response.isSuccessful) throw KuanHttpError(response.code)
            val type = validatedImageType(response)
                ?: throw KuanProtocolError("下载内容不是图片")
            writeBody(type.substringAfter('/'), response.body)
        }

    private suspend fun writeBody(mime: String, body: ResponseBody): StudioImage {
        directory.mkdirs()
        val temporary = File.createTempFile("studio-", ".part", directory)
        try {
            val expected = body.contentLength()
            val length = body.byteStream().use { input ->
                temporary.outputStream().use { output -> copyKuanBytes(input, output, MAX_IMAGE_FILE) }
            }
            if (length == 0L || expected >= 0L && length != expected) throw KuanProtocolError("图片下载不完整")
            return finishImage(temporary, mime)
        } finally {
            temporary.delete()
        }
    }

    private fun storeImage(mime: String, write: (File) -> Unit): StudioImage {
        directory.mkdirs()
        val temporary = File.createTempFile("studio-", ".part", directory)
        try {
            write(temporary)
            return finishImage(temporary, mime)
        } finally {
            temporary.delete()
        }
    }

    private fun finishImage(temporary: File, reportedType: String): StudioImage {
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(temporary.absolutePath, bounds)
        val mime = bounds.outMimeType ?: throw KuanProtocolError("图片内容无效")
        val ext = when (mime) {
            "image/png" -> "png"
            "image/jpeg" -> "jpg"
            "image/webp" -> "webp"
            "image/gif" -> "gif"
            else -> throw KuanProtocolError("不支持的图片格式")
        }
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0 || reportedType.replace("jpg", "jpeg") != mime.substringAfter('/')) {
            throw KuanProtocolError("图片格式与返回类型不符")
        }
        requireOwner()
        val destination = File(directory, UUID.randomUUID().toString().replace("-", "") + "." + ext)
        check(temporary.renameTo(destination)) { "Could not save the image" }
        return StudioImage(destination, mime)
    }
}

private suspend fun <T> Call.readStudioResponse(read: suspend (Response) -> T): T = coroutineScope {
    // Keep cancellation attached to the call until the response body is consumed.
    val abort = launch(start = CoroutineStart.UNDISPATCHED) {
        try {
            awaitCancellation()
        } finally {
            this@readStudioResponse.cancel()
        }
    }
    try {
        await().use { read(it) }
    } finally {
        abort.cancel()
    }
}

private fun imageGet(url: HttpUrl) = Request.Builder().url(url).header("Accept", "image/*").build()

private fun secureStudioUrl(url: HttpUrl) =
    url.isHttps && url.port == 443 && url.username.isEmpty() && url.password.isEmpty()

internal fun studioPublicImage(value: String): HttpUrl? {
    val url = value.toHttpUrlOrNull() ?: return null
    if (!secureStudioUrl(url) || url.query != null || url.fragment != null || ".." in url.encodedPath) return null
    fun validPath(prefix: String, directory: String? = null): Boolean {
        val path = url.encodedPath.removePrefix(prefix)
        return path != url.encodedPath && (directory == null || path.startsWith(directory)) && galleryPath.matches(path)
    }
    return when {
        url.host == "appassets.androidplatform.net" && validPath(STUDIO_ASSETS) ->
            (KUAN_ORIGIN + url.encodedPath).toHttpUrlOrNull()
        url.host == "raw.githubusercontent.com" && validPath("/$STUDIO_SOURCE/$STUDIO_REVISION/data/", "images/") -> url
        else -> null
    }
}

private fun validatedImageType(response: Response): String? {
    if (!response.isSuccessful || response.body.contentLength() > MAX_IMAGE_FILE) return null
    val type = response.body.contentType()?.toString()?.substringBefore(';')
    val peek = response.body.source().peek()
    if (!peek.request(12)) return null
    val header = peek.readByteString(12)
    return when (type) {
        "image/png" -> type.takeIf { header.hex().startsWith("89504e470d0a1a0a") }
        "image/jpeg" -> type.takeIf { header.hex().startsWith("ffd8ff") }
        "image/webp" -> type.takeIf { header.substring(0, 4).utf8() == "RIFF" && header.substring(8).utf8() == "WEBP" }
        "image/gif" -> type.takeIf { header.utf8().let { it.startsWith("GIF87a") || it.startsWith("GIF89a") } }
        else -> null
    }
}

internal data class StudioImageRequest(val path: String, val body: JsonObject)

internal fun studioImageRequest(input: JsonObject, allowedModels: Set<String>): StudioImageRequest {
    val model = input.string("model")?.takeIf { it in allowedModels }
        ?: throw KuanProtocolError("请选择当前分组支持的生图模型")
    val prompt = input.string("prompt")?.trim()?.takeIf { it.isNotEmpty() && it.length <= 32000 }
        ?: throw KuanProtocolError("提示词为空或太长")
    val size = input.string("size")?.takeIf { it.matches(Regex("[1-9]\\d{0,4}x[1-9]\\d{0,4}")) }
        ?: throw KuanProtocolError("图片尺寸无效")
    val format = input.string("outputFormat")?.takeIf { it in setOf("png", "jpeg", "webp") } ?: "png"
    val quality = input.string("quality")?.takeIf { it in setOf("auto", "low", "medium", "high", "standard", "hd") } ?: "auto"
    val references = input.array("referenceImages").orEmpty().map {
        (it as? JsonPrimitive)?.takeIf { value ->
            value.isString && dataImage.containsMatchIn(value.content)
        }?.content ?: throw KuanProtocolError("请重新选择本地参考图")
    }
    if (references.size > 6 || references.sumOf { it.length.toLong() } > 88L * 1024 * 1024) {
        throw KuanProtocolError("参考图数量或大小超出限制")
    }
    return StudioImageRequest(
        if (references.isEmpty()) "/v1/images/generations" else "/v1/images/edits",
        buildJsonObject {
            put("model", model)
            put("prompt", prompt)
            put("size", size)
            put("quality", quality)
            put("n", (input.int("count") ?: 1).coerceIn(1, 4))
            put("output_format", format)
            put("response_format", "b64_json")
            val compression = (input.int("outputCompression") ?: 0).coerceIn(0, 100)
            if (format != "png" && compression > 0) put("output_compression", compression)
            if (references.isNotEmpty()) {
                put("images", buildJsonArray { references.forEach { add(buildJsonObject { put("image_url", it) }) } })
                put("input_fidelity", "high")
            }
        },
    )
}

internal fun studioImages(payload: JsonObject, format: String): List<String> = buildList {
    fun addImage(row: JsonObject, result: Boolean, inherited: String = format) {
        val url = row.string("url") ?: row.string("image_url")
        if (!url.isNullOrBlank()) add(url.trim())
        else {
            val data = row.string("b64_json") ?: row.string("result").takeIf { result }
            val mime = row.string("output_format")?.takeIf { it in setOf("png", "jpeg", "webp") } ?: inherited
            if (!data.isNullOrBlank()) add(if (data.startsWith("data:image/")) data else "data:image/$mime;base64,$data")
        }
    }
    payload.array("data").orEmpty().filterIsInstance<JsonObject>().forEach { addImage(it, false) }
    payload.array("output").orEmpty().filterIsInstance<JsonObject>().forEach { row ->
        addImage(row, row.string("type")?.contains("image") == true)
        row.array("content").orEmpty().filterIsInstance<JsonObject>().forEach {
            addImage(it, (it.string("type") ?: row.string("type")).orEmpty().contains("image"), row.string("output_format") ?: format)
        }
    }
}.distinct()

private fun imageMime(extension: String) = "image/" + extension.replace("jpg", "jpeg")

private fun readStudioJson(raw: String): JsonObject? =
    runCatching { KuanJson.parseToJsonElement(raw) as? JsonObject }.getOrNull()
