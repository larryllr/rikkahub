package me.rerere.rikkahub.data.kuan

import java.util.Base64
import kotlinx.serialization.json.JsonObject
import me.rerere.ai.ui.ServerToolStatus
import me.rerere.ai.ui.StreamChunk

// Service and sediment pointers are account-owned; the app accepts resolved
// image bytes, not a URL guessed from a private pointer.
internal class KuanGeneratedImages {
    private val pending = mutableSetOf<String>()
    private val visible = mutableSetOf<String>()
    private val completed = mutableSetOf<String>()

    fun accept(event: String?, row: JsonObject): List<StreamChunk>? {
        val item = row.obj("item")
        val id = (item?.string("id") ?: row.string("item_id"))?.kuanWebMessageId()
        return when {
            event == "image_generation.completed" -> {
                val result = imageResult(row.string("url")) ?: return emptyList()
                val key = id ?: "image-" + result.bytes.hashCode() + "-" + result.bytes.length
                image(key, result, terminal = true) +
                    StreamChunk.ServerToolEnd("kuan-image-progress", status = ServerToolStatus.COMPLETED)
            }
            event == "response.image_generation_call.partial_image" -> {
                val result = imageResult(row.string("partial_image_b64")) ?: return emptyList()
                if (id != null) image(id, result, terminal = false) else emptyList()
            }
            item?.string("type") != "image_generation_call" || id == null -> null
            event == "response.output_item.added" -> start(id)
            event == "response.output_item.done" -> imageResult(item.string("result"))?.let {
                image(id, it, terminal = true)
            } ?: start(id)
            else -> null
        }
    }

    fun terminal(response: JsonObject?): List<StreamChunk> = response?.array("output").orEmpty()
        .filterIsInstance<JsonObject>().filter { it.string("type") == "image_generation_call" }.flatMap { item ->
            val id = item.string("id")?.kuanWebMessageId() ?: return@flatMap emptyList()
            val result = imageResult(item.string("result")) ?: return@flatMap start(id)
            image(id, result, terminal = true)
        }

    fun finish(): List<StreamChunk> = pending.flatMap { id ->
        val stop = StreamChunk.ServerToolEnd(progressId(id), status = ServerToolStatus.FAILED)
        if (id in visible) listOf<StreamChunk>(StreamChunk.ImageEnd(id), stop) else listOf(stop)
    }.also { pending.clear() }

    private fun progressId(id: String) = "kuan:image:$id"

    private fun start(id: String): List<StreamChunk> =
        if (id in completed || pending.size >= 32 || !pending.add(id)) emptyList()
        else listOf(StreamChunk.ServerToolStart(progressId(id), "image_generation"))

    private fun image(id: String, result: ImageResult, terminal: Boolean): List<StreamChunk> = buildList {
        if (id in completed || completed.size >= 32 || id !in pending && pending.size >= 32) return@buildList
        addAll(start(id))
        if (visible.add(id)) add(StreamChunk.ImageStart(id, result.mime))
        add(StreamChunk.ImageSnapshot(id, result.bytes))
        if (terminal) {
            add(StreamChunk.ImageEnd(id))
            add(StreamChunk.ServerToolEnd(progressId(id), status = ServerToolStatus.COMPLETED))
            pending.remove(id)
            visible.remove(id)
            completed.add(id)
        }
    }
}

private data class ImageResult(val mime: String, val bytes: String)

private fun imageResult(value: String?): ImageResult? {
    if (value.isNullOrBlank() || value.length > 64 * 1024 * 1024) return null
    val data = value.startsWith("data:")
    val image = if (data) value.substringAfter(";base64,", "") else value
    if (image.length < 16 || image.length % 4 == 1 || image.any {
            it !in 'a'..'z' && it !in 'A'..'Z' && it !in '0'..'9' && it != '+' && it != '/' && it != '='
        }) return null
    val padded = image.indexOf('=')
    if (padded >= 0 && (padded < image.length - 2 || image.substring(padded).any { it != '=' } || image.length % 4 != 0)) return null
    val head = runCatching { Base64.getDecoder().decode(image.take(16)) }.getOrNull() ?: return null
    if (head.size < 12) return null
    val mime = when {
        head.copyOfRange(0, 8).contentEquals(byteArrayOf(-119, 80, 78, 71, 13, 10, 26, 10)) -> "image/png"
        head[0] == (-1).toByte() && head[1] == (-40).toByte() && head[2] == (-1).toByte() -> "image/jpeg"
        head.copyOfRange(0, 4).decodeToString() == "RIFF" && head.copyOfRange(8, 12).decodeToString() == "WEBP" -> "image/webp"
        head.copyOfRange(0, 6).decodeToString() in setOf("GIF87a", "GIF89a") -> "image/gif"
        else -> return null
    }
    if (data && value.substringBefore(";base64,") != "data:$mime") return null
    return ImageResult(mime, image)
}
