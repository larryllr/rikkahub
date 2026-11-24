package me.rerere.ai.ui

import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull

data class WebSearchSource(val url: String, val title: String)

data class WebSearchPresentation(
    val queries: List<String>,
    val sources: List<WebSearchSource>,
)

/** Display-only projection. The original action is retained unchanged for protocol replay. */
fun UIMessagePart.ServerTool.webSearchPresentation(): WebSearchPresentation? {
    if (toolName.removeSuffix("_call") != "web_search") return null
    val action = input as? JsonObject ?: return WebSearchPresentation(emptyList(), emptyList())
    val queries = sequenceOf(action["query"], action["pattern"]) +
        (action["queries"] as? JsonArray).orEmpty().asSequence().take(12)
    val sources = sequenceOf(action) +
        (action["sources"] as? JsonArray).orEmpty().asSequence().filterIsInstance<JsonObject>().take(64)
    return WebSearchPresentation(
        queries = queries.mapNotNull { it.label() }.distinct().take(8).toList(),
        sources = sources.mapNotNull { source ->
            val raw = (source["url"] as? JsonPrimitive)?.takeIf { it.isString }?.content
                ?.takeIf { it.length in 1..8192 && it.none { char -> char.isISOControl() || char == '\\' } }
                ?: return@mapNotNull null
            val url = raw.toHttpUrlOrNull()?.takeIf { it.username.isEmpty() && it.password.isEmpty() }
                ?: return@mapNotNull null
            WebSearchSource(url = url.toString(), title = source["title"].label() ?: url.host)
        }.distinctBy { it.url }.take(32).toList(),
    )
}

private fun JsonElement?.label(): String? =
    (this as? JsonPrimitive)?.takeIf { it.isString }?.content
        ?.filterNot(Char::isISOControl)?.trim()?.take(500)?.takeIf { it.isNotBlank() }
