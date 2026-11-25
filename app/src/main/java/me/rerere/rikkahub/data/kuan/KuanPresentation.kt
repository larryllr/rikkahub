package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.os.SystemClock
import com.dokar.quickjs.quickJs
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import me.rerere.ai.core.MessageRole
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessageAnnotation
import me.rerere.ai.ui.UIMessagePart
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull

private const val SOURCE = "kuan:form_source"
private const val GROUPS = "kuan:form_groups"
private const val HISTORY = "kuan:form_history"
private const val PROJECTED = "kuan:presentation_v2"
private const val LAYOUT_PROJECTED = "kuan:layout_v2"
private const val INLINE_IMAGES = "kuan:inline_images"
internal const val KUAN_NATIVE_MARKDOWN = "kuan:native_markdown"
internal const val MAX_PRESENTATION = 256 * 1024
private val imageMarker = Regex("""<AsyncImage(?:Group)?(?=[\s/>]|$)|(?:\uE200|\\u(?:\{e200\}|e200))image_group""")
private val sourceHeading = Regex(
    """^[ \t]{0,3}(?:#{1,6}[ \t]+)?(?:\*\*|__)?(?:\u6765\u6e90|\u53c2\u8003\u6765\u6e90|\u53c2\u8003\u8d44\u6599|\u5f15\u7528\u6765\u6e90|sources?|references?|citations?)(?=[:\uff1a*_\s]|$)""",
    setOf(RegexOption.IGNORE_CASE, RegexOption.MULTILINE),
)
private val scriptLock = Mutex()
@Volatile private var bundledScript: String? = null

internal class KuanPresentationPreview(private val context: Context) {
    private data class Projection(val source: String, val visible: String, val at: Long)

    private val projections = mutableMapOf<Int, Projection>()

    suspend fun render(message: UIMessage): UIMessage {
        if (message.role != MessageRole.ASSISTANT) return message
        return message.copy(parts = message.parts.joinSplitKuanPresentation(withImages = false).mapIndexed { index, part ->
            if (part !is UIMessagePart.Text || !part.text.hasKuanMarkup(streaming = true)) return@mapIndexed part
            val now = SystemClock.elapsedRealtime()
            val previous = projections[index]?.takeIf { part.text.startsWith(it.source) }
            val visible = when {
                previous?.source == part.text -> previous.visible
                previous != null && now - previous.at < 200 -> previous.visible
                else -> {
                    val parsed = projectKuanPresentation(context, part.text, streaming = true)?.string("text")
                    val text = parsed ?: previous?.visible ?: part.text
                    projections[index] = Projection(part.text, text, now)
                    text
                }
            }
            part.copy(text = visible)
        })
    }
}

private fun String.hasKuanMarkup(streaming: Boolean = false) =
    length <= MAX_PRESENTATION && (kuanPresentationTag.containsMatchIn(this) ||
        kuanPresentationControl.containsMatchIn(this) || streaming && kuanPresentationPartialTag.containsMatchIn(this))

private fun String.hasVisibleKuanTag(): Boolean {
    if (length > MAX_PRESENTATION) return false
    var tag = kuanPresentationTag.find(this) ?: return false
    for (code in kuanPresentationCode.findAll(this)) {
        if (tag.range.first < code.range.first) return true
        if (tag.range.first <= code.range.last) tag = kuanPresentationTag.find(this, code.range.last + 1) ?: return false
    }
    return true
}

private fun UIMessagePart.Text.needsProjection(): Boolean {
    val meta = metadata
    if (meta?.flag(PROJECTED) == true) {
        return meta.flag(LAYOUT_PROJECTED) != true && text.hasVisibleKuanTag()
    }
    return kuanFormSource() != null || nativeMarkdown() != null || text.hasKuanMarkup() ||
        text.length <= MAX_PRESENTATION && sourceHeading.containsMatchIn(text)
}

internal fun UIMessage.needsKuanPresentation() =
    role == MessageRole.ASSISTANT && (
        parts.any { it is UIMessagePart.Text && it.needsProjection() } ||
            parts.joinSplitKuanPresentation(withImages = false) !== parts
        )

internal suspend fun finishKuanPresentation(context: Context, message: UIMessage): UIMessage {
    if (!message.needsKuanPresentation()) return message
    val citations = message.annotations.toMutableList()
    val images = JsonArray(message.parts.filterIsInstance<UIMessagePart.ServerTool>().flatMap { it.webCards() }
        .mapNotNull { card ->
            val query = card.query ?: return@mapNotNull null
            val first = card.images.firstOrNull() ?: return@mapNotNull null
            JsonObject(mapOf("query" to JsonPrimitive(query), "url" to JsonPrimitive(first.url)))
        }.distinct().take(16))
    val parts = message.parts.joinSplitKuanPresentation(withImages = images.isNotEmpty())
    val textIndices = parts.indices.filter { parts[it] is UIMessagePart.Text }
    val snapshotIndex = textIndices.lastOrNull { index -> (parts[index] as UIMessagePart.Text).nativeMarkdown() != null }
    val regular = textIndices.filter { index -> (parts[index] as UIMessagePart.Text).text.isNotBlank() }
    val snapshot = snapshotIndex?.let { (parts[it] as UIMessagePart.Text).nativeMarkdown() }
    // A metadata-only terminal frame can arrive after the original text part closed.
    // Replace a single text part, never append a second copy of the answer.
    val target = when (regular.size) {
        0 -> snapshotIndex
        1 -> regular.single()
        else -> null
    }
    val projectedParts = parts.mapIndexedNotNull { index, part ->
        if (part !is UIMessagePart.Text || !part.needsProjection() && (index != target || snapshot == null)) {
            return@mapIndexedNotNull part
        }
        if (index == snapshotIndex && index != target && part.text.isEmpty()) return@mapIndexedNotNull null
        // Reproject stored display text without rebuilding existing interactions or image anchors.
        val previouslyProjected = part.metadata?.flag(PROJECTED) == true
        val raw = if (previouslyProjected) part.text else part.kuanFormSource() ?: part.text
        val native = snapshot.takeIf { index == target }
        var source = if (native != null && raw.length <= MAX_PRESENTATION && !raw.hasKuanMarkup() &&
            !(native.length < raw.length && raw.startsWith(native))) native else raw
        val rich = source.hasKuanMarkup()
        var display = if (rich || sourceHeading.containsMatchIn(source)) {
            projectKuanPresentation(context, source, plain = !rich, images = images) ?: return@mapIndexedNotNull part
        } else null
        if (source == native && source != raw && display?.array("inlineImages").orEmpty().isNotEmpty()) {
            val flattened = display?.string("history")?.whitespaceNormalized()
            if (!flattened.isNullOrEmpty() && raw.whitespaceNormalized().startsWith("$flattened ")) {
                // Media markup can make a shorter terminal snapshot longer than the complete streamed answer.
                source = raw
                display = if (sourceHeading.containsMatchIn(raw)) projectKuanPresentation(context, raw, plain = true) else null
            }
        }
        val text = display?.string("text") ?: source
        val groups = display?.array("groups").orEmpty()
        val history = part.metadata?.string(HISTORY) ?: display?.string("history")
        citations += display?.array("links").orEmpty().mapNotNull { readKuanCitation(it) }
        if (native != null && native != source && sourceHeading.containsMatchIn(native)) {
            citations += projectKuanPresentation(context, native, plain = true)?.array("links").orEmpty().mapNotNull { readKuanCitation(it) }
        }
        val metadata = part.metadata.orEmpty().toMutableMap()
        metadata.remove(KUAN_NATIVE_MARKDOWN)
        metadata.remove(HISTORY)
        metadata[PROJECTED] = JsonPrimitive(true)
        metadata[LAYOUT_PROJECTED] = JsonPrimitive(true)
        display?.array("inlineImages")?.takeIf { it.isNotEmpty() }?.let { inserted ->
            metadata[INLINE_IMAGES] = JsonArray((part.metadata?.array(INLINE_IMAGES).orEmpty() + inserted).distinct().take(16))
        }
        if (!previouslyProjected) {
            metadata.remove(SOURCE)
            metadata.remove(GROUPS)
        }
        if (groups.isNotEmpty() && metadata[SOURCE] == null) {
            metadata[SOURCE] = JsonPrimitive(source)
            metadata[GROUPS] = requireNotNull(display?.get("groups"))
        }
        if (history != null && history != text) metadata[HISTORY] = JsonPrimitive(history)
        part.copy(text = text, metadata = JsonObject(metadata))
    }
    return message.copy(parts = projectedParts, annotations = citations.distinctBy {
        (it as? UIMessageAnnotation.UrlCitation)?.let { citation -> citation.url.toHttpUrlOrNull()?.toString() ?: citation.url } ?: it
    })
}

private val projectionWhitespace = Regex("\\s+")
private fun String.whitespaceNormalized() = trim().replace(projectionWhitespace, " ")

// Search/reasoning frames can split one streamed Markdown document in the middle of a tag.
private fun List<UIMessagePart>.joinSplitKuanPresentation(withImages: Boolean): List<UIMessagePart> {
    if (any { it !is UIMessagePart.Text && it !is UIMessagePart.Reasoning &&
            it !is UIMessagePart.ServerTool && it !is UIMessagePart.Notice }) return this
    val text = filterIsInstance<UIMessagePart.Text>().filter { it.text.isNotEmpty() }
    if (text.size < 2 || text.sumOf { it.text.length.toLong() } > MAX_PRESENTATION ||
        text.any { !it.metadata.isNullOrEmpty() }) return this
    val joined = text.joinToString("") { it.text }
    val hasImageAnchor = imageMarker.containsMatchIn(joined) || withImages && any {
        it is UIMessagePart.Text && it.nativeMarkdown()?.let(imageMarker::containsMatchIn) == true
    }
    if (!hasImageAnchor && !joined.hasVisibleKuanTag()) return this
    var replaced = false
    return mapNotNull { part ->
        if (part !is UIMessagePart.Text || part.text.isEmpty()) part
        else if (replaced) null
        else part.copy(text = joined).also { replaced = true }
    }
}

private fun UIMessagePart.Text.nativeMarkdown() = metadata?.string(KUAN_NATIVE_MARKDOWN)?.takeIf { it.length in 1..MAX_PRESENTATION }

internal fun UIMessagePart.Text.kuanFormSource() = metadata?.string(SOURCE)
internal fun UIMessagePart.Text.kuanFormGroups() = metadata?.array(GROUPS).orEmpty().mapNotNull { it as? JsonObject }
internal fun UIMessagePart.Text.inlineKuanWebImages(): List<String> =
    metadata?.array(INLINE_IMAGES).orEmpty().asSequence().take(16)
        .mapNotNull { (it as? JsonPrimitive)?.contentOrNull }.toList()

internal fun readKuanCitation(value: JsonElement, native: Boolean = false): UIMessageAnnotation.UrlCitation? {
    val row = value as? JsonObject ?: return null
    val raw = row.string("url")
    val url = (if (native) publicKuanPresentationUrl(raw)?.toHttpUrlOrNull() else kuanPresentationUrl(raw)) ?: return null
    val title = row.string("title").orEmpty().filterNot(Char::isISOControl).trim().take(500).ifBlank { url.host }
    return UIMessageAnnotation.UrlCitation(title = title, url = url.toString())
}

private fun kuanPresentationUrl(raw: String?) =
    raw?.takeIf { it.length in 1..8192 && it.none { ch -> ch <= '\u001f' || ch == '\\' } }
        ?.toHttpUrlOrNull()?.takeIf { it.username.isEmpty() && it.password.isEmpty() }

internal fun publicKuanPresentationUrl(raw: String?): String? {
    val url = kuanPresentationUrl(raw) ?: return null
    if (!url.isHttps || url.port != 443 || '.' !in url.host || url.host.substringAfterLast('.').none(Char::isLetter) ||
            url.host.substringAfterLast('.') in setOf("local", "internal", "localhost") ||
            url.queryParameterNames.any { it.lowercase().let { name ->
                name in setOf("token", "access_token", "authorization", "signature") || name.startsWith("x-amz-")
            } }
    ) return null
    return url.toString()
}

internal fun UIMessage.withKuanQuestionHistory(): UIMessage {
    if (role != MessageRole.ASSISTANT) return this
    return copy(parts = parts.map { part ->
        val original = (part as? UIMessagePart.Text)?.metadata?.string(HISTORY)
        if (original == null) part else part.copy(text = original)
    })
}

internal suspend fun projectKuanPresentation(
    context: Context,
    source: String,
    selections: JsonObject = JsonObject(emptyMap()),
    streaming: Boolean = false,
    plain: Boolean = false,
    images: JsonArray = JsonArray(emptyList()),
): JsonObject? = withContext(Dispatchers.Default) {
    if (source.length > MAX_PRESENTATION) return@withContext null
    try {
        val script = bundledScript ?: scriptLock.withLock {
            bundledScript ?: withContext(Dispatchers.IO) {
                context.assets.open("kuan-presentation.js").bufferedReader().use { it.readText() }
            }.also { bundledScript = it }
        }
        quickJs(Dispatchers.Default) {
            memoryLimit = 32L * 1024 * 1024
            maxStackSize = 256L * 1024
            // Budget trusted engine startup separately from parsing model-supplied data.
            evaluationTimeoutMillis = 2_000L
            evaluate<Unit>(script)
            evaluationTimeoutMillis = 400L
            val result = evaluate<String>("JSON.stringify(KuanPresentation.project(${JsonPrimitive(source)}, $selections, $streaming, $plain, $images))")
            if (result.length <= MAX_PRESENTATION * 2) KuanJson.parseToJsonElement(result).asObject() else null
        }
    } catch (e: CancellationException) {
        throw e
    } catch (_: Exception) {
        null
    }
}
