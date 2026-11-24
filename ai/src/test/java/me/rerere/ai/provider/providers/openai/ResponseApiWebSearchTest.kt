package me.rerere.ai.provider.providers.openai

import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive
import me.rerere.ai.provider.BuiltInTools
import me.rerere.ai.provider.Model
import me.rerere.ai.provider.ModelAbility
import me.rerere.ai.provider.TextGenerationParams
import me.rerere.ai.provider.stream.SseEvent
import me.rerere.ai.ui.ServerToolMetadata
import me.rerere.ai.ui.ServerToolStatus
import me.rerere.ai.ui.StreamChunkHandler
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessagePart
import me.rerere.ai.ui.metadataAs
import me.rerere.ai.ui.webSearchPresentation
import okhttp3.OkHttpClient
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ResponseApiWebSearchTest {
    @Test
    fun terminalSourcesUpdateOneSearchWithoutDuplicatingTheAnswer() {
        val decoder = ResponseApiStreamDecoder()
        val handler = StreamChunkHandler()
        val payloads = listOf(
            """{"type":"response.output_item.added","item":{"type":"web_search_call","id":"ws_1","status":"in_progress"}}""",
            """{"type":"response.web_search_call.searching","item_id":"ws_1"}""",
            """{"type":"response.output_item.done","item":{"type":"web_search_call","id":"ws_1","status":"completed","action":{"type":"search","query":"Android documentation"}}}""",
            """{"type":"response.output_text.delta","item_id":"msg_1","delta":"See the documentation."}""",
            """{"type":"response.completed","response":{"status":"completed","output":[
                {"type":"web_search_call","id":"ws_1","status":"completed",
                  "action":{"type":"search","query":"Android documentation","sources":[
                    {"type":"url","url":"https://developer.android.com/","title":"Android Developers"},
                    {"type":"url","url":"https://developer.android.com/"},
                    {"type":"url","url":"javascript:alert(1)"},
                    {"type":"url","url":"https://name:password@example.com/"},
                    {"type":"url","url":{"unexpected":true}}
                  ]}},
                {"type":"message","id":"msg_1","content":[{"type":"output_text","text":"See the documentation."}]}
            ]}}""",
        )
        var messages = listOf(UIMessage.user("Find the docs"))
        val results = payloads.map { payload ->
            decoder.accept(SseEvent(data = payload)).also { result ->
                result.chunks.forEach { messages = handler.handle(messages, it) }
            }
        }
        assertFalse(results.first().completed)
        assertTrue(results.last().completed)
        val parts = messages.last().parts
        assertEquals("See the documentation.", parts.filterIsInstance<UIMessagePart.Text>().single().text)
        val tool = parts.filterIsInstance<UIMessagePart.ServerTool>().single()
        assertEquals(ServerToolStatus.COMPLETED, tool.status)
        val presentation = requireNotNull(tool.webSearchPresentation())
        assertEquals(listOf("Android documentation"), presentation.queries)
        assertEquals("Android Developers", presentation.sources.single().title)
        assertEquals("https://developer.android.com/", presentation.sources.single().url)
        assertEquals(tool.input, tool.metadataAs<ServerToolMetadata>()?.call?.get("action"))
    }

    @Test
    fun terminalSnapshotClosesSearchWithoutSourcesOrItemDone() {
        val decoder = ResponseApiStreamDecoder()
        val handler = StreamChunkHandler()
        var messages = listOf(UIMessage.user("Search"))
        listOf(
            """{"type":"response.web_search_call.searching","item_id":"ws_1"}""",
            """{"type":"response.completed","response":{"status":"completed","output":[
                {"type":"web_search_call","id":"ws_1","status":"completed","action":{"type":"search","query":"Compose"}}
            ]}}""",
        ).forEach { payload ->
            decoder.accept(SseEvent(data = payload)).chunks.forEach { messages = handler.handle(messages, it) }
        }
        val tool = messages.last().parts.filterIsInstance<UIMessagePart.ServerTool>().single()
        assertEquals(ServerToolStatus.COMPLETED, tool.status)
        assertEquals(listOf("Compose"), tool.webSearchPresentation()?.queries)
    }

    @Test
    fun onlyTheOfficialSearchRequestOptsInToSourceExpansion() {
        val api = ResponseAPI(OkHttpClient())
        val model = Model(
            modelId = "gpt-5",
            abilities = listOf(ModelAbility.REASONING),
            tools = setOf(BuiltInTools.Search),
        )
        fun includes(host: String, selected: Model) = api.buildRequestBody(
            resolveResponseProviderCapabilities(host),
            listOf(UIMessage.user("Search")),
            TextGenerationParams(model = selected),
            stream = true,
        )["include"]!!.jsonArray.map { it.jsonPrimitive.content }
        assertEquals(
            listOf("reasoning.encrypted_content", "web_search_call.action.sources"),
            includes("api.openai.com", model),
        )
        assertEquals(listOf("reasoning.encrypted_content"), includes("example.com", model))
        assertEquals(listOf("reasoning.encrypted_content"), includes("api.openai.com", model.copy(tools = emptySet())))
    }
}
