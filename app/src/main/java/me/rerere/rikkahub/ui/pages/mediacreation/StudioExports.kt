package me.rerere.rikkahub.ui.pages.mediacreation

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import java.util.Locale
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.kuan.KuanProtocolError
import me.rerere.rikkahub.data.kuan.KuanStudio
import me.rerere.rikkahub.data.kuan.STUDIO_ASSETS
import me.rerere.rikkahub.data.kuan.STUDIO_LOCAL_ORIGIN
import me.rerere.rikkahub.data.kuan.archiveName

internal class StudioExports(
    private val context: Context,
    private val studio: KuanStudio,
    owner: String,
) {
    private val receipts = context.getSharedPreferences("kuan-studio-exports-$owner", Context.MODE_PRIVATE)
    private val saving = Mutex()

    suspend fun download(
        url: String,
        fallback: String?,
        requestedName: String?,
        chooseDocument: suspend (String, String) -> Uri?,
    ) = saving.withLock {
        studio.requireOwner()
        val document = studioGuide(url)
        val mime = document?.second ?: receipts.getString("$url:mime", null)
        val existing = receipts.getString(url, null)?.let(Uri::parse)
        if (existing != null && mime != null && canRead(existing)) {
            studio.requireOwner()
            open(existing, mime)
            return@withLock buildJsonObject {
                put("saved", true)
                put("album", document == null)
                put("opened", true)
            }
        }
        if (document != null) {
            val (name, type) = document
            val uri = chooseDocument(name, type)
                ?: return@withLock buildJsonObject { put("cancelled", true) }
            studio.requireOwner()
            withContext(Dispatchers.IO) {
                context.assets.open("kuan-studio/library/$name").use { input ->
                    val bytes = requireNotNull(context.contentResolver.openOutputStream(uri, "wt"))
                        .use { output -> input.copyTo(output) }
                    check(bytes > 0)
                }
                runCatching {
                    context.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
            }
            remember(url, uri, type)
        } else {
            val image = try {
                studio.downloadable(url)
            } catch (failure: java.io.IOException) {
                if (fallback == null) throw failure
                studio.downloadable(fallback)
            } catch (failure: KuanProtocolError) {
                if (fallback == null) throw failure
                studio.downloadable(fallback)
            }
            studio.requireOwner()
            val name = archiveName(requestedName, "KuanAPI_${System.currentTimeMillis()}")
            val uri = saveMediaToGallery(context, image.file, image.mime, name, album = "\u5bbdapi")
            if (uri != null) remember(url, uri, image.mime)
        }
        buildJsonObject {
            put("saved", true)
            put("album", document == null)
        }
    }

    private fun remember(url: String, uri: Uri, mime: String) {
        receipts.edit().putString(url, uri.toString()).putString("$url:mime", mime).apply()
    }

    private suspend fun canRead(uri: Uri): Boolean = withContext(Dispatchers.IO) {
        uri.scheme == "content" && runCatching {
            context.contentResolver.openFileDescriptor(uri, "r")?.use { it.statSize != 0L } ?: false
        }.getOrDefault(false)
    }

    private fun open(uri: Uri, mime: String) {
        val intent = Intent(Intent.ACTION_VIEW).setDataAndType(uri, mime)
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        try {
            context.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            throw KuanProtocolError(context.getString(R.string.kuan_studio_no_file_handler))
        }
    }
}

private val guides = mapOf(
    "templates.md" to "text/plain",
    "style-library.zip" to "application/zip",
    "LICENSE.txt" to "text/plain",
)

internal fun studioGuide(url: String): Pair<String, String>? {
    val prefix = STUDIO_LOCAL_ORIGIN + STUDIO_ASSETS
    if (!url.startsWith(prefix)) return null
    val name = url.removePrefix(prefix)
    return guides[name]?.let { name to it }
}
