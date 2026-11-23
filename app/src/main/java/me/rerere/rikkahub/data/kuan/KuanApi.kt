package me.rerere.rikkahub.data.kuan

import java.io.IOException
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.longOrNull
import me.rerere.common.http.await
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody

internal const val KUAN_ORIGIN = "https://kuanapi.kuankuan.de5.net"
internal const val KUAN_V1 = "$KUAN_ORIGIN/v1"
internal const val KUAN_API = "/api/v1"
internal val KuanJson = Json { ignoreUnknownKeys = true }

internal class KuanHttpError(val status: Int, val code: String? = null) :
    IOException(listOfNotNull("Kuan API HTTP $status", code).joinToString(" · "))

internal class KuanProtocolError(message: String) : IllegalStateException(message)

internal class KuanApi(
    val client: OkHttpClient = privateClient(),
    private val origin: HttpUrl = KUAN_ORIGIN.toHttpUrl(),
) {
    private fun url(path: String): HttpUrl {
        require(path.startsWith("/") && !path.startsWith("//"))
        val target = requireNotNull(origin.resolve(path))
        require(target.scheme == origin.scheme && target.host == origin.host && target.port == origin.port)
        return target
    }

    fun request(
        path: String,
        method: String = "GET",
        bearer: String? = null,
        body: RequestBody? = null,
        headers: Map<String, String> = emptyMap(),
    ): Request {
        return Request.Builder()
            .url(url(path))
            .header("Accept", "application/json")
            .header("User-Agent", "KuanAPIAndroid/2.0 native-preview")
            .apply {
                headers.forEach { (name, value) -> header(name, value) }
                if (bearer != null) header("Authorization", "Bearer $bearer")
            }
            .method(method, body)
            .build()
    }

    suspend fun json(
        path: String,
        method: String = "GET",
        bearer: String? = null,
        body: JsonObject? = null,
        envelope: Boolean = true,
        limit: Long = 4L * 1024 * 1024,
        headers: Map<String, String> = emptyMap(),
    ): JsonElement = exchange(
        request(path, method, bearer, body?.toString()?.toRequestBody(JSON_TYPE), headers),
        envelope,
        limit,
    )

    suspend fun exchange(request: Request, envelope: Boolean = true, limit: Long = 4L * 1024 * 1024): JsonElement =
        withContext(Dispatchers.IO) {
            client.newCall(request).await().use { response ->
                val source = response.body.source()
                val maxBytes = if (response.isSuccessful) limit else 8192L
                val tooLarge = source.request(maxBytes + 1)
                val payload = if (tooLarge) null else runCatching {
                    KuanJson.parseToJsonElement(source.readUtf8()) as? JsonObject
                }.getOrNull()
                val status = payload?.int("code")
                if (!response.isSuccessful || envelope && status != null && status != 0) {
                    val reason = payload?.string("reason")
                        ?: payload?.obj("error")?.string("code")
                        ?: payload?.string("code")
                    throw KuanHttpError(
                        if (response.isSuccessful) (status?.takeIf { it in 400..599 } ?: 502) else response.code,
                        reason?.takeIf { it.matches(Regex("[a-zA-Z0-9_.-]{1,64}")) },
                    )
                }
                if (payload == null) throw KuanProtocolError("Kuan API returned unreadable or oversized data")
                if (envelope) {
                    if (status != 0 || !payload.containsKey("data")) throw KuanProtocolError("Invalid Kuan API envelope")
                    requireNotNull(payload["data"])
                } else payload
            }
        }

    companion object {
        val JSON_TYPE = "application/json".toMediaType()

        fun privateClient(): OkHttpClient = OkHttpClient.Builder()
            .followRedirects(false)
            .followSslRedirects(false)
            .retryOnConnectionFailure(false)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(80, TimeUnit.SECONDS)
            .writeTimeout(90, TimeUnit.SECONDS)
            .build()
    }
}

internal fun JsonObject.string(name: String) = (get(name) as? JsonPrimitive)?.contentOrNull
internal fun JsonObject.int(name: String) = (get(name) as? JsonPrimitive)?.intOrNull
internal fun JsonObject.long(name: String) = (get(name) as? JsonPrimitive)?.longOrNull
internal fun JsonObject.flag(name: String) = (get(name) as? JsonPrimitive)?.booleanOrNull == true
internal fun JsonObject.obj(name: String) = get(name) as? JsonObject
internal fun JsonObject.array(name: String) = get(name) as? JsonArray
internal fun JsonElement.asObject() = this as? JsonObject ?: throw KuanProtocolError("Expected a Kuan API object")
