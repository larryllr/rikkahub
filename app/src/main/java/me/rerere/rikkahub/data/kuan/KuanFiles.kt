package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.util.AtomicFile
import androidx.core.net.toUri
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.net.URLDecoder
import java.security.MessageDigest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import me.rerere.common.http.await
import me.rerere.rikkahub.data.files.FilesManager
import me.rerere.rikkahub.data.files.saveUploadFromUri
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.asRequestBody

internal const val MAX_LEGACY_BACKUP = 90L * 1024 * 1024
private const val MAX_ATTACHMENT = 96L * 1024 * 1024
private const val CHAT_SYNC = "$KUAN_API/kuan/chat-sync"
private val archiveMediaType = "application/vnd.kuanapi.chat-sync+zip".toMediaType()
private val assetPath = Regex("^/(?:api/v1/)?kuan/chat-assets/asset-[a-f0-9]{32}$")
private val generatedPath = Regex("^/download/file/[a-f0-9]{32}/[^/]+$")
private val baseUrl = KUAN_ORIGIN.toHttpUrl()
private val ownedDomains = setOf(baseUrl.host, "ai.larryllr.cc.cd")
private val extendedName = Regex("""(?:^|;)\s*filename\*\s*=\s*UTF-8''([^;]+)""", RegexOption.IGNORE_CASE)
private val plainName = Regex("""(?:^|;)\s*filename\s*=\s*(?:"([^"\r\n]+)"|([^;\r\n]+))""", RegexOption.IGNORE_CASE)

internal sealed interface KuanFileLink {
    data object Unshared : KuanFileLink
    data class Owned(val path: String, val fileName: String, val protected: Boolean) : KuanFileLink
}

internal fun kuanFileLink(input: String): KuanFileLink? {
    val value = input.trim()
    if (value.startsWith("sandbox:/mnt/data/")) return KuanFileLink.Unshared
    if (value.startsWith("//") || value.isEmpty()) return null
    val url = value.toHttpUrlOrNull() ?: baseUrl.resolve(value) ?: return null
    if (url.host !in ownedDomains || url.port != (if (url.isHttps) 443 else 80) ||
        url.encodedUsername.isNotEmpty() || url.encodedPassword.isNotEmpty()
    ) return null
    val path = url.encodedPath
    if (path.startsWith("/mnt/data/") || path.startsWith("/sandbox:/mnt/data/")) return KuanFileLink.Unshared
    if (assetPath.matches(path)) {
        val canonical = path.removePrefix(KUAN_API)
        return KuanFileLink.Owned(KUAN_API + canonical, "", true)
    }
    if (!generatedPath.matches(path)) return null
    return KuanFileLink.Owned(path, url.pathSegments.last(), false)
}

internal fun archiveName(value: String?, fallback: String): String =
    value.orEmpty().trim().filter { it >= ' ' && it != '\u007f' && it !in "/\\:*?\"<>|" }
        .trim(' ', '.').take(180).ifBlank { fallback }

internal fun attachmentName(header: String?, fallback: String): String {
    val encoded = extendedName.find(header.orEmpty())?.groupValues?.get(1)?.trim()
    val decoded = encoded?.let { runCatching { URLDecoder.decode(it.replace("+", "%2B"), "UTF-8") }.getOrNull() }
    val plain = plainName.find(header.orEmpty())?.groupValues?.drop(1)?.firstOrNull { it.isNotBlank() }
    return archiveName(decoded ?: plain, archiveName(fallback, "attachment"))
}

internal class KuanFiles(
    private val context: Context,
    private val session: KuanSession,
    private val api: KuanApi,
    private val files: FilesManager,
) {
    private val cacheIndex = File(context.noBackupFilesDir, "kuan-download-index")

    suspend fun cached(link: KuanFileLink.Owned): SavedKuanFile? = withContext(Dispatchers.IO) {
        val scope = session.state.value.profile?.scope
        val index = index(link, scope) ?: return@withContext null
        val id = runCatching { index.readFully().decodeToString().toLongOrNull() }.getOrNull()
            ?: return@withContext null
        val entity = files.get(id) ?: return@withContext null
        val local = files.getFile(entity)
        if (!local.isFile) return@withContext null
        SavedKuanFile(id, local, entity.displayName, entity.mimeType)
    }

    suspend fun save(link: KuanFileLink.Owned, scope: String? = null): SavedKuanFile = withContext(Dispatchers.IO) {
        val active = session.state.value.profile?.scope
        if (scope != null && scope != active) throw KuanHttpError(401)
        val temp = File.createTempFile("kuan-file-", ".tmp", context.cacheDir)
        try {
            val read = if (link.protected) {
                val owner = active ?: throw KuanHttpError(401)
                session.authorized(owner, replaySafe = true) { read(link.path, it, temp, MAX_ATTACHMENT) }
            } else {
                read(link.path, null, temp, MAX_ATTACHMENT)
            }
            val name = attachmentName(read.disposition, link.fileName)
            val entity = files.saveUploadFromUri(temp.toUri(), name, read.mime)
            // Imports keep their own file record because it is deleted with the conversation.
            if (scope == null) index(link, active)?.let { index ->
                cacheIndex.mkdirs()
                val out = index.startWrite()
                try {
                    out.write(entity.id.toString().encodeToByteArray())
                    index.finishWrite(out)
                } catch (error: Exception) {
                    index.failWrite(out)
                    throw error
                }
            }
            SavedKuanFile(entity.id, files.getFile(entity), name, read.mime)
        } finally {
            temp.delete()
        }
    }

    private fun index(link: KuanFileLink.Owned, scope: String?): AtomicFile? {
        if (link.protected && scope == null) return null
        val id = MessageDigest.getInstance("SHA-256").digest("$scope\n${link.path}".encodeToByteArray())
            .joinToString("") { "%02x".format(it) }
        return AtomicFile(File(cacheIndex, id))
    }

    suspend fun cloudArchive(scope: String, destination: File): String =
        session.authorized(scope, replaySafe = true) { token ->
            val meta = api.json("$CHAT_SYNC?meta=1", bearer = token).asObject()
            val size = meta.long("size")?.takeIf { it in 1..MAX_LEGACY_BACKUP }
                ?: throw KuanProtocolError("Invalid backup size")
            val digest = meta.string("sha256")?.takeIf { it.matches(Regex("[a-f0-9]{64}")) }
                ?: throw KuanProtocolError("Missing backup checksum")
            val archive = read(CHAT_SYNC, token, destination, MAX_LEGACY_BACKUP, allowArchive = true)
            if (archive.size != size || archive.sha256 != digest) {
                throw KuanProtocolError("The saved backup changed during download")
            }
            digest
        }

    suspend fun publishCloudArchive(scope: String, archive: File, revision: String?, digest: String) {
        require(archive.length() in 1..MAX_LEGACY_BACKUP)
        val precondition = if (revision == null) mapOf("If-None-Match" to "*") else mapOf("If-Match" to "\"$revision\"")
        val receipt = try {
            session.authorized(scope) { token ->
                api.exchange(api.request(CHAT_SYNC, "PUT", token, archive.asRequestBody(archiveMediaType), precondition)).asObject()
            }
        } catch (error: KuanHttpError) {
            if (error.status == 412) throw KuanProtocolError("The classic cloud backup changed. Sync again to merge the current version.")
            throw error
        }
        if (receipt.long("size") != archive.length() || receipt.string("sha256") != digest) {
            throw KuanProtocolError("The server did not confirm the exact cloud archive")
        }
    }

    private suspend fun read(
        path: String,
        token: String?,
        output: File,
        maximum: Long,
        allowArchive: Boolean = false,
    ): Downloaded = withContext(Dispatchers.IO) {
        val request = api.request(path, bearer = token, headers = mapOf("Accept" to "*/*"))
        api.client.newCall(request).await().use { response ->
            if (!response.isSuccessful) throw KuanHttpError(response.code)
            val mime = response.header("Content-Type").orEmpty().substringBefore(';')
                .takeIf { it.contains('/') && it.none(Char::isWhitespace) } ?: "application/octet-stream"
            val disposition = response.header("Content-Disposition")
            val expected = response.body.contentLength()
            if (expected > maximum || mime.equals("text/html", true) &&
                !disposition.orEmpty().startsWith("attachment", ignoreCase = true)
            ) throw KuanProtocolError("The response does not match a downloadable file")
            if (allowArchive && mime !in setOf("application/vnd.kuanapi.chat-sync+zip", "application/zip", "application/octet-stream")) {
                throw KuanProtocolError("The response is not a Kuan API backup")
            }
            val digest = MessageDigest.getInstance("SHA-256")
            val actual = response.body.byteStream().use { input ->
                output.outputStream().use { target -> copyKuanBytes(input, target, maximum, digest) }
            }
            if (expected >= 0 && expected != actual) throw KuanProtocolError("Incomplete file download")
            Downloaded(actual, digest.digest().joinToString("") { "%02x".format(it) }, mime, disposition)
        }
    }

    private data class Downloaded(val size: Long, val sha256: String, val mime: String, val disposition: String?)
}

internal data class SavedKuanFile(val id: Long, val file: File, val name: String, val mime: String)

internal suspend fun copyKuanBytes(input: InputStream, output: OutputStream, limit: Long, digest: MessageDigest? = null): Long {
    val buffer = ByteArray(65536)
    var size = 0L
    while (true) {
        currentCoroutineContext().ensureActive()
        val count = input.read(buffer)
        if (count < 0) return size
        size += count
        if (size > limit) throw KuanProtocolError("The file exceeds the allowed size")
        output.write(buffer, 0, count)
        digest?.update(buffer, 0, count)
    }
}
