package me.rerere.rikkahub.data.kuan

import kotlin.uuid.Uuid
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.ai.core.MessageRole
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessagePart

private const val IMAGE_REQUEST = "kuan:image_request"

internal data class KuanChatImage(val source: Uuid, val group: Long, val model: String) {
    fun prompt(text: String) = UIMessagePart.Text(text, buildJsonObject {
        put(IMAGE_REQUEST, buildJsonObject {
            put("source", source.toString())
            put("group", group)
            put("model", model)
        })
    })

    fun context(messages: List<UIMessage>): List<UIMessage> {
        val request = messages.lastOrNull()?.takeIf { it.role == MessageRole.USER }
            ?: throw KuanProtocolError("The image request is no longer available")
        val sourceIndex = messages.indexOfFirst { it.id == source }
        if (sourceIndex < 0 || sourceIndex >= messages.lastIndex) {
            throw KuanProtocolError("The selected message is no longer in the active branch")
        }
        return messages.take(sourceIndex + 1) + request
    }
}

internal fun UIMessage.kuanChatImage(): KuanChatImage? {
    if (role != MessageRole.USER) return null
    val row = parts.filterIsInstance<UIMessagePart.Text>().firstNotNullOfOrNull { it.metadata?.obj(IMAGE_REQUEST) }
        ?: return null
    val source = row.string("source")?.let { runCatching { Uuid.parse(it) }.getOrNull() } ?: return null
    val group = row.long("group")?.takeIf { it > 0 } ?: return null
    val model = row.string("model")?.takeIf { it.length in 1..512 && it.none(Char::isWhitespace) } ?: return null
    return KuanChatImage(source, group, model)
}
