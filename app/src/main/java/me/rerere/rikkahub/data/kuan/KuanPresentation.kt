package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.os.SystemClock
import com.dokar.quickjs.quickJs
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import me.rerere.ai.core.MessageRole
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessageAnnotation
import me.rerere.ai.ui.UIMessagePart
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull

private const val SOURCE = "kuan:form_source"
private const val GROUPS = "kuan:form_groups"
private const val HISTORY = "kuan:form_history"
private const val PROJECTED = "kuan:presentation_v2"
internal const val KUAN_NATIVE_MARKDOWN = "kuan:native_markdown"
internal const val MAX_PRESENTATION = 256 * 1024
private val controlMarker = Regex(
    """\{@body\b|GenUI\s*\.\s*issueNewTurn|__dil\.jsx[s]?\s*\(|(?:<|&lt;)/?(?:box|title|heading|radio-group|select|textarea|input|checkbox|button|AsyncImageGroup|AsyncImage|cite|formula|callout)\b|[\uE200-\uE20F]|\\u(?:\{e20[0-9a-f]\}|e20[0-9a-f])""",
    RegexOption.IGNORE_CASE,
)
private val sourceHeading = Regex(
    """^[ \t]{0,3}(?:#{1,6}[ \t]+)?(?:\*\*|__)?(?:\u6765\u6e90|\u53c2\u8003\u6765\u6e90|\u53c2\u8003\u8d44\u6599|\u5f15\u7528\u6765\u6e90|sources?|references?|citations?)(?=[:\uff1a*_\s]|$)""",
    setOf(RegexOption.IGNORE_CASE, RegexOption.MULTILINE),
)

internal class KuanPresentationPreview(private val context: Context) {
    private data class Projection(val source: String, val visible: String, val at: Long)

    private val projections = mutableMapOf<Int, Projection>()

    suspend fun render(message: UIMessage): UIMessage {
        if (message.role != MessageRole.ASSISTANT) return message
        return message.copy(parts = message.parts.mapIndexed { index, part ->
            if (part !is UIMessagePart.Text || !part.hasKuanMarkup()) return@mapIndexed part
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

private fun String.hasKuanMarkup() = length <= MAX_PRESENTATION && controlMarker.containsMatchIn(this)

private fun UIMessagePart.Text.hasKuanMarkup() = text.hasKuanMarkup()

private fun UIMessagePart.Text.needsProjection() =
    metadata?.flag(PROJECTED) != true && (
        kuanFormSource() != null || nativeMarkdown() != null ||
            text.hasKuanMarkup() || text.length <= MAX_PRESENTATION && sourceHeading.containsMatchIn(text)
        )

internal fun UIMessage.needsKuanPresentation() =
    role == MessageRole.ASSISTANT && parts.any { it is UIMessagePart.Text && it.needsProjection() }

internal suspend fun finishKuanPresentation(context: Context, message: UIMessage): UIMessage {
    if (!message.needsKuanPresentation()) return message
    val citations = message.annotations.toMutableList()
    val parts = message.parts
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
        val raw = part.kuanFormSource() ?: part.text
        val native = snapshot.takeIf { index == target }
        val source = if (native != null && raw.length <= MAX_PRESENTATION && !raw.hasKuanMarkup() &&
            !(native.length < raw.length && raw.startsWith(native))) native else raw
        val rich = source.hasKuanMarkup()
        val display = if (rich || sourceHeading.containsMatchIn(source)) {
            projectKuanPresentation(context, source, plain = !rich) ?: return@mapIndexedNotNull part
        } else null
        val text = display?.string("text") ?: source
        val groups = display?.array("groups").orEmpty()
        val history = display?.string("history")
        citations += display?.array("links").orEmpty().mapNotNull { readKuanCitation(it) }
        if (native != null && native != source && sourceHeading.containsMatchIn(native)) {
            citations += projectKuanPresentation(context, native, plain = true)?.array("links").orEmpty().mapNotNull { readKuanCitation(it) }
        }
        val metadata = part.metadata.orEmpty().toMutableMap()
        metadata.remove(KUAN_NATIVE_MARKDOWN)
        metadata.remove(SOURCE)
        metadata.remove(GROUPS)
        metadata.remove(HISTORY)
        metadata[PROJECTED] = JsonPrimitive(true)
        if (groups.isNotEmpty()) {
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

private fun UIMessagePart.Text.nativeMarkdown() = metadata?.string(KUAN_NATIVE_MARKDOWN)?.takeIf { it.length in 1..MAX_PRESENTATION }

internal fun UIMessagePart.Text.kuanFormSource() = metadata?.string(SOURCE)
internal fun UIMessagePart.Text.kuanFormGroups() = metadata?.array(GROUPS).orEmpty().mapNotNull { it as? JsonObject }

internal fun readKuanCitation(value: JsonElement, native: Boolean = false): UIMessageAnnotation.UrlCitation? {
    val row = value as? JsonObject ?: return null
    val raw = row.string("url")?.takeIf { it.length in 1..8192 && it.none { ch -> ch <= '\u001f' || ch == '\\' } } ?: return null
    val url = raw.toHttpUrlOrNull()?.takeIf { it.username.isEmpty() && it.password.isEmpty() } ?: return null
    if (native && (!url.isHttps || '.' !in url.host || url.host.substringAfterLast('.').none(Char::isLetter) ||
            url.host.substringAfterLast('.') in setOf("local", "internal", "localhost") ||
            url.queryParameterNames.any { it.lowercase().let { name ->
                name in setOf("token", "access_token", "authorization", "signature") || name.startsWith("x-amz-")
            } })
    ) return null
    val title = row.string("title").orEmpty().filterNot(Char::isISOControl).trim().take(500).ifBlank { url.host }
    return UIMessageAnnotation.UrlCitation(title = title, url = url.toString())
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
): JsonObject? = withContext(Dispatchers.Default) {
    if (source.length > MAX_PRESENTATION) return@withContext null
    try {
        withTimeoutOrNull(500L) {
            val script = context.assets.open("kuan-presentation.js").bufferedReader().use { it.readText() }
            quickJs(Dispatchers.Default) {
                memoryLimit = 32L * 1024 * 1024
                maxStackSize = 256L * 1024
                evaluationTimeoutMillis = 400L
                // Only this bundled parser is executable. The model reply and field values are serialized data.
                evaluate<Unit>(script)
                val result = evaluate<String>("JSON.stringify(KuanPresentation.project(${JsonPrimitive(source)}, $selections, $streaming, $plain))")
                if (result.length <= MAX_PRESENTATION * 2) KuanJson.parseToJsonElement(result).asObject() else null
            }
        }
    } catch (e: CancellationException) {
        throw e
    } catch (_: Exception) {
        null
    }
}
