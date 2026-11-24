package me.rerere.rikkahub.data.kuan

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.put
import me.rerere.ai.ui.ServerToolStatus
import me.rerere.ai.ui.StreamChunk
import me.rerere.ai.ui.UIMessagePart

internal const val KUAN_WEB_CARDS = "kuan.web.cards"
private val imageKinds = setOf("AsyncImageGroup", "AsyncImage", "Image")
private val linkKinds = setOf("Link", "Entity", "Map", "Chart")

@Serializable
internal data class KuanWebImage(val url: String, val thumbnail: String?, val title: String, val source: String?)

@Serializable
internal data class KuanWebCard(
    val kind: String,
    val title: String,
    val link: String? = null,
    val images: List<KuanWebImage> = emptyList(),
    val query: String? = null,
)

internal fun JsonObject.nativeWebCards(): List<KuanWebCard> {
    if (string("source") != "chatgpt" || int("version") != 1) return emptyList()
    return array("components").orEmpty().asSequence().take(96).filterIsInstance<JsonObject>().mapNotNull { component ->
        val kind = component.string("kind") ?: return@mapNotNull null
        val label = component.publicLabel("label").ifBlank { component.publicLabel("query") }
        when (kind) {
            in imageKinds -> {
                val images = component.array("images").orEmpty().asSequence().take(8)
                    .filterIsInstance<JsonObject>().mapNotNull image@{ image ->
                        val url = publicKuanPresentationUrl(image.string("url")) ?: return@image null
                        KuanWebImage(url, publicKuanPresentationUrl(image.string("thumbnail")),
                            image.publicLabel("title").ifBlank { label },
                            publicKuanPresentationUrl(image.string("source_url")))
                    }.distinctBy { it.url }.toList()
                val query = component.string("query")?.takeIf { it.length in 1..1000 && it.none(Char::isISOControl) }
                if (images.isNotEmpty()) KuanWebCard(kind, label, images = images, query = query) else null
            }
            in linkKinds -> {
                val link = publicKuanPresentationUrl(component.string("url")) ?: component.array("sources")
                    .orEmpty().asSequence().take(16).mapNotNull { readKuanCitation(it, native = true)?.url }.firstOrNull()
                if (link != null) KuanWebCard(kind, label, link) else null
            }
            else -> null
        }
    }.distinct().take(16).toList()
}

internal fun List<KuanWebCard>.toWebCardChunks(messageId: String): List<StreamChunk> = if (isEmpty()) emptyList() else listOf(
    StreamChunk.ServerToolStart("kuan.web.cards:$messageId", KUAN_WEB_CARDS),
    StreamChunk.ServerToolEnd("kuan.web.cards:$messageId", status = ServerToolStatus.COMPLETED, metadata = buildJsonObject {
        put(KUAN_WEB_CARDS, KuanJson.encodeToJsonElement(this@toWebCardChunks))
    }),
)

internal fun UIMessagePart.ServerTool.webCards(): List<KuanWebCard> {
    if (toolName != KUAN_WEB_CARDS) return emptyList()
    val value = metadata?.array(KUAN_WEB_CARDS)?.takeIf { it.size <= 16 } ?: return emptyList()
    return runCatching { KuanJson.decodeFromJsonElement<List<KuanWebCard>>(value) }.getOrDefault(emptyList())
        .mapNotNull { card ->
            val images = card.images.take(8).mapNotNull { image ->
                val url = publicKuanPresentationUrl(image.url) ?: return@mapNotNull null
                image.copy(url = url, thumbnail = publicKuanPresentationUrl(image.thumbnail),
                    source = publicKuanPresentationUrl(image.source), title = image.title.take(500))
            }
            val link = publicKuanPresentationUrl(card.link)
            if (images.isEmpty() && link == null) null else card.copy(title = card.title.take(500), link = link, images = images)
        }
}

private fun JsonObject.publicLabel(key: String) = string(key).orEmpty().filterNot(Char::isISOControl).trim().take(500)

internal class KuanWebToolStages {
    private val active = mutableMapOf<String, String>()
    private var serial = 0

    fun accept(event: String, row: JsonObject): List<StreamChunk> {
        val name = row.string("tool")?.removePrefix("kuan_")?.takeIf { it in setOf("web_search", "open_url") }
            ?: return emptyList()
        if (event == "kuan.web_tool.in_progress" && name in active) return emptyList()
        val prior = active[name]
        if (prior == null && serial >= 16) return emptyList()
        val id = prior ?: "kuan.web.tool:${serial++}"
        return buildList {
            if (prior == null) add(StreamChunk.ServerToolStart(id, name))
            if (event == "kuan.web_tool.in_progress") {
                active[name] = id
            } else {
                active.remove(name)
                val url = publicKuanPresentationUrl(row.string("url"))
                val input = url?.let { buildJsonObject { put("url", it); put("title", row.publicLabel("title")) } }
                val completed = row.string("status").let { it == null || it in setOf("ok", "partial", "completed") }
                add(StreamChunk.ServerToolEnd(id, input = input,
                    status = if (completed) ServerToolStatus.COMPLETED else ServerToolStatus.FAILED))
            }
        }
    }

    fun endUnconfirmed(): List<StreamChunk> = active.values.map { id ->
        StreamChunk.ServerToolEnd(id, status = ServerToolStatus.FAILED)
    }.also { active.clear() }
}
