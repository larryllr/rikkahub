package me.rerere.rikkahub.ui.pages.mediacreation

import android.content.ContentResolver
import android.net.Uri
import android.provider.OpenableColumns
import android.webkit.WebResourceResponse
import java.io.FilterInputStream
import java.io.IOException
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.rikkahub.data.kuan.KuanProtocolError
import me.rerere.rikkahub.data.kuan.KuanStudio
import me.rerere.rikkahub.data.kuan.STUDIO_PAGE
import me.rerere.rikkahub.data.kuan.archiveName

internal class StudioReferences(
    private val resolver: ContentResolver,
    private val studio: KuanStudio,
) {
    private data class Source(val uri: Uri, val mime: String, val name: String)
    private val selected = ConcurrentHashMap<String, Source>()

    suspend fun issue(uris: List<Uri>) = withContext(Dispatchers.IO) {
        studio.requireOwner()
        if (uris.size > 6) throw KuanProtocolError("最多添加 6 张参考图")
        val sources = uris.distinct().map { uri ->
            require(uri.scheme == ContentResolver.SCHEME_CONTENT)
            val mime = resolver.getType(uri)?.lowercase()?.takeIf { it in ACCEPTED }
                ?: throw KuanProtocolError("请选择 PNG、JPG、WebP 或 GIF 图片")
            val info = resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE), null, null, null)
                ?.use { data -> if (data.moveToFirst()) data.getString(0) to data.getLong(1) else null }
            if (info != null && info.second > LIMIT) throw KuanProtocolError("单张参考图不能超过 20 MB")
            Source(uri, mime, archiveName(info?.first, "reference." + mime.substringAfter('/')))
        }
        studio.requireOwner()
        selected.clear()
        buildJsonObject {
            put("files", buildJsonArray {
                sources.forEach { source ->
                    val id = UUID.randomUUID().toString()
                    selected[id] = source
                    add(buildJsonObject {
                        put("name", source.name)
                        put("url", "${STUDIO_PAGE}reference/$id")
                    })
                }
            })
        }
    }

    fun open(id: String): WebResourceResponse? {
        studio.requireOwner()
        val source = selected.remove(id) ?: return null
        val input = resolver.openInputStream(source.uri) ?: return null
        val stream = object : FilterInputStream(input) {
            private var remaining = LIMIT
            private fun used(count: Long) {
                remaining -= count
                if (remaining < 0) throw IOException("Reference image exceeds 20 MB")
            }

            override fun read(): Int = super.read().also { if (it >= 0) used(1) }
            override fun read(b: ByteArray, off: Int, len: Int): Int =
                super.read(b, off, len).also { if (it > 0) used(it.toLong()) }
        }
        return WebResourceResponse(source.mime, null, 200, "OK", mapOf("Cache-Control" to "no-store"), stream)
    }

    fun clear() = selected.clear()

    private companion object {
        val ACCEPTED = setOf("image/png", "image/jpeg", "image/webp", "image/gif")
        const val LIMIT = 20L * 1024 * 1024
    }
}
