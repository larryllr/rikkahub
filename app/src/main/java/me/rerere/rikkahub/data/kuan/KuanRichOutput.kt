package me.rerere.rikkahub.data.kuan

import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import me.rerere.ai.ui.UIMessagePart

internal const val KUAN_WEB_MESSAGE_ID = "kuan:web_message_id"
internal const val KUAN_WEB_PRESENTATION = "kuan:web_presentation"
internal const val KUAN_RICH_BLOCKS = "kuan:rich_blocks"
internal const val MAX_RICH_SNAPSHOT = 256 * 1024

internal fun String.kuanWebMessageId() = takeIf { it.matches(Regex("[A-Za-z0-9_.:-]{1,128}")) }

internal fun Iterable<UIMessagePart>.kuanRichSnapshots(): Map<String, JsonObject> =
    filterIsInstance<UIMessagePart.Text>().mapNotNull { part ->
        val metadata = part.metadata ?: return@mapNotNull null
        val snapshot = metadata.obj(KUAN_WEB_PRESENTATION) ?: return@mapNotNull null
        val id = metadata.string(KUAN_WEB_MESSAGE_ID) ?: return@mapNotNull null
        if (id != snapshot.string("message_id")) null else id to snapshot
    }.toMap()

internal fun UIMessagePart.Text.kuanRichBlocks(): List<JsonObject> =
    metadata?.array(KUAN_RICH_BLOCKS).orEmpty().asSequence().take(96)
        .filterIsInstance<JsonObject>().filter { it.int("offset")?.let { offset -> offset in 0..text.length } == true }
        .sortedBy { it.int("offset") }.toList()

internal fun JsonObject.kuanRichImages(): List<KuanWebImage> =
    array("images").orEmpty().asSequence().take(24).filterIsInstance<JsonObject>().mapNotNull {
        val url = publicKuanPresentationUrl(it.string("url")) ?: return@mapNotNull null
        KuanWebImage(url, publicKuanPresentationUrl(it.string("thumbnail")), it.string("title").orEmpty(),
            publicKuanPresentationUrl(it.string("sourceUrl")))
    }.toList()

internal fun String?.kuanRichFileUrl(): String? {
    val value = this ?: return null
    return value.takeIf { value.startsWith('/') && !value.startsWith("//") && '?' !in value && '#' !in value &&
        kuanFileLink(value) is KuanFileLink.Owned }
}

internal fun JsonObject.kuanRichTable(): String? {
    val table = obj("table") ?: return null
    fun cells(value: JsonArray) = value.take(16).map {
        (it as? JsonPrimitive)?.contentOrNull.orEmpty().take(500)
            .replace(Regex("[\\r\\n]+"), " ").let { value ->
                buildString {
                    for (ch in value) {
                        if (ch in "\\|[]<>*_") append('\\')
                        append(ch)
                    }
                }
            }
    }
    val header = cells(table.array("headers") ?: JsonArray(emptyList()))
    val rows = table.array("rows").orEmpty().take(128).filterIsInstance<JsonArray>().map(::cells)
    val width = maxOf(header.size, rows.maxOfOrNull { it.size } ?: 0)
    if (width == 0 || rows.isEmpty()) return null
    fun line(values: List<String>) = List(width) { values.getOrNull(it).orEmpty() }.joinToString(" | ", "| ", " |")
    return (listOf(line(header), line(List(width) { "---" })) + rows.map(::line)).joinToString("\n")
}
