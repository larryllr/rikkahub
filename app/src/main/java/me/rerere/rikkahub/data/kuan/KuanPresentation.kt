package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.os.SystemClock
import com.dokar.quickjs.quickJs
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import me.rerere.ai.core.MessageRole
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessagePart

private const val SOURCE = "kuan:form_source"
private const val GROUPS = "kuan:form_groups"
private const val HISTORY = "kuan:form_history"
private const val MAX_PRESENTATION = 256 * 1024
private val controlMarker = Regex(
    """\{@body\b|GenUI\s*\.\s*issueNewTurn|(?:<|&lt;)/?(?:box|title|radio-group|select|textarea|input|checkbox|button|AsyncImageGroup|AsyncImage|cite|formula|callout)\b|[\uE200-\uE20F]|\\u(?:\{e20[0-9a-f]\}|e20[0-9a-f])""",
    RegexOption.IGNORE_CASE,
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

private fun UIMessagePart.Text.hasKuanMarkup() = text.length <= MAX_PRESENTATION && controlMarker.containsMatchIn(text)

internal suspend fun finishKuanPresentation(context: Context, message: UIMessage): UIMessage {
    if (message.role != MessageRole.ASSISTANT) return message
    return message.copy(parts = message.parts.map { part ->
        if (part !is UIMessagePart.Text || !part.hasKuanMarkup()) {
            return@map part
        }
        val display = projectKuanPresentation(context, part.text) ?: return@map part
        val text = display.string("text") ?: part.text
        val groups = display.array("groups").orEmpty()
        val metadata = part.metadata.orEmpty().toMutableMap()
        if (groups.isNotEmpty()) {
            metadata[SOURCE] = JsonPrimitive(part.text)
            metadata[GROUPS] = requireNotNull(display["groups"])
            display.string("history")?.let { metadata[HISTORY] = JsonPrimitive(it) }
        }
        part.copy(text = text, metadata = metadata.takeIf { it.isNotEmpty() }?.let(::JsonObject))
    })
}

internal fun UIMessagePart.Text.kuanFormSource() = metadata?.string(SOURCE)
internal fun UIMessagePart.Text.kuanFormGroups() = metadata?.array(GROUPS).orEmpty().mapNotNull { it as? JsonObject }

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
                val result = evaluate<String>("JSON.stringify(KuanPresentation.project(${JsonPrimitive(source)}, $selections, $streaming))")
                if (result.length <= MAX_PRESENTATION * 2) KuanJson.parseToJsonElement(result).asObject() else null
            }
        }
    } catch (e: CancellationException) {
        throw e
    } catch (_: Exception) {
        null
    }
}
