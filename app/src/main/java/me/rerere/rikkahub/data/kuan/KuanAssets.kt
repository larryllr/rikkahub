package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.net.Uri
import java.io.File
import java.net.URLEncoder
import java.security.MessageDigest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessagePart
import me.rerere.rikkahub.data.files.FileFolders
import me.rerere.rikkahub.data.files.FilesManager
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody

internal class KuanAssets(
    private val context: Context,
    private val session: KuanSession,
    private val api: KuanApi,
    private val files: FilesManager,
) {
    private val lock = Mutex()
    private val uploads = LinkedHashMap<List<Any>, Pair<Long, String>>()
    private val assetPattern = Regex("asset-[a-f0-9]{32}")
    private val maxBytes = 96L * 1024 * 1024

    suspend fun attach(scope: String, messages: List<UIMessage>): List<UIMessage> = withContext(Dispatchers.IO) {
        messages.map { message ->
            message.copy(parts = message.parts.map { part ->
                when (part) {
                    is UIMessagePart.Document -> part.copy(url = upload(scope, part.url, part.fileName, part.mime))
                    is UIMessagePart.Image -> {
                        val url = if (part.url.startsWith("file:")) {
                            upload(scope, part.url, null, null)
                        } else if (part.url.startsWith("$KUAN_ORIGIN/")) {
                            part.url
                        } else {
                            throw KuanProtocolError("Save this image to the device and attach the original")
                        }
                        part.copy(url = url)
                    }
                    else -> part
                }
            })
        }
    }

    private suspend fun upload(scope: String, value: String, name: String?, mime: String?): String {
        val uri = Uri.parse(value)
        if (uri.scheme != "file" || !uri.authority.isNullOrEmpty()) throw KuanProtocolError("Attachment original is unavailable")
        val file = File(uri.path ?: throw KuanProtocolError("Attachment original is unavailable")).canonicalFile
        val permitted = listOf(FileFolders.UPLOAD, FileFolders.TOOL_OUTPUTS, FileFolders.MEDIA_CREATION).any {
            file.toPath().startsWith(context.filesDir.resolve(it).canonicalFile.toPath())
        }
        if (!permitted || !file.isFile) throw KuanProtocolError("Attachment original is missing from this conversation")
        if (file.length() !in 1..maxBytes) throw KuanProtocolError("An attachment is empty or exceeds 96 MiB")
        val relative = file.relativeTo(context.filesDir.canonicalFile).invariantSeparatorsPath
        val record = files.getByRelativePath(relative)
        val finalName = (name ?: record?.displayName ?: file.name).take(240)
        val finalMime = mime?.takeIf { '*' !in it } ?: record?.mimeType ?: "application/octet-stream"
        val canonicalMime = finalMime.toMediaTypeOrNull() ?: "application/octet-stream".toMediaTypeOrNull()
        val cacheKey = listOf(scope, relative, file.lastModified(), file.length(), finalName, finalMime)
        return lock.withLock {
            val now = System.currentTimeMillis()
            uploads[cacheKey]?.takeIf { it.first > now }?.let { return@withLock it.second }
            val hash = MessageDigest.getInstance("SHA-256")
            file.inputStream().use { input ->
                val bytes = ByteArray(65536)
                while (true) {
                    val count = input.read(bytes)
                    if (count < 0) break
                    hash.update(bytes, 0, count)
                }
            }
            val expected = hash.digest().joinToString("") { "%02x".format(it) }
            val uploaded = session.authorized(scope) { access ->
                api.exchange(api.request(
                    "$KUAN_API/kuan/chat-assets",
                    "POST",
                    access,
                    file.asRequestBody(canonicalMime),
                    mapOf("X-Kuan-Filename" to URLEncoder.encode(finalName, "UTF-8").replace("+", "%20")),
                )).asObject()
            }
            val id = uploaded.string("id")?.takeIf(assetPattern::matches)
                ?: throw KuanProtocolError("Attachment receipt has no valid identifier")
            if (uploaded.string("sha256") != expected || uploaded.long("size") != file.length()) {
                throw KuanProtocolError("The server did not receive the complete original attachment")
            }
            "kuan-asset://$id".also {
                uploads[cacheKey] = (now + 3600_000) to it
                while (uploads.size > 512) uploads.remove(uploads.keys.first())
            }
        }
    }
}
