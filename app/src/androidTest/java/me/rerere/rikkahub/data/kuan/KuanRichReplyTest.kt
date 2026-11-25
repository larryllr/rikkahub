package me.rerere.rikkahub.data.kuan

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import me.rerere.ai.core.MessageRole
import me.rerere.ai.provider.providers.openai.OpenAIWire
import me.rerere.ai.ui.StreamChunk
import me.rerere.ai.ui.StreamChunkHandler
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessagePart
import me.rerere.rikkahub.data.datastore.Settings
import me.rerere.rikkahub.ui.components.message.MessagePartsBlock
import me.rerere.rikkahub.ui.context.LocalSettings
import okhttp3.OkHttpClient
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

internal const val KUAN_TEST_IMAGE_PNG =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l2cAAAAASUVORK5CYII="

@RunWith(AndroidJUnit4::class)
class KuanRichReplyTest {
    @get:Rule val compose = createComposeRule()
    private val context get() = InstrumentationRegistry.getInstrumentation().targetContext

    @Test
    fun partialMarkdownAndRichStateSurviveReplayAndHistory() = runBlocking {
        val decoder = KuanStreamDecoder(OpenAIWire(OkHttpClient()), responses = false)
        val handler = StreamChunkHandler()
        var message = UIMessage(role = MessageRole.ASSISTANT, parts = emptyList())
        fun send(event: String) {
            for (chunk in decoder.accept(event)) message = handler.handle(listOf(message), chunk).single()
        }
        fun body(text: String, id: String = "m1") = """{"id":"wire","message_id":"$id","model":"web",
          "choices":[{"index":0,"delta":{"content":${JsonPrimitive(text)}}}]}"""
        fun update(id: String, rev: Int, state: String, label: String) = """{"id":"wire","message_id":"$id","model":"web",
          "choices":[{"index":0,"delta":{"kuan_native_presentation":{"version":1,"source":"chatgpt","message_id":"$id",
          "revision":$rev,"anchors":[{"slot_id":"DIL0","component_id":"web-map"}],
          "components":[{"id":"web-map","kind":"map","status":"$state","label":"$label",
          "url":"https://example.com/museum"}]}}}]}"""

        send(update("m1", 1, "pending", "Updating"))
        send(body("Opening. \uE000DI"))
        val first = KuanPresentationPreview(context).render(message)
        assertFalse(first.parts.filterIsInstance<UIMessagePart.Text>().any { "DIL" in it.text })
        send(body("L0\uE001 End. \uE200cite\uE202turn0search0\n\nPreserved."))
        send(update("m2", 99, "resolved", "Wrong message"))
        send(update("m1", 3, "resolved", "Correct museum"))
        send(update("m1", 2, "pending", "Late stale revision"))
        send(update("m1", 3, "pending", "Duplicate"))
        val live = KuanPresentationPreview(context).render(message).parts.filterIsInstance<UIMessagePart.Text>().single()
        assertEquals("Correct museum", live.kuanRichBlocks().single().string("title"))
        send("""{"id":"wire","model":"web","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}""")
        send("[DONE]")
        val final = finishKuanPresentation(context, message)
        val reopened = KuanJson.decodeFromString<UIMessage>(KuanJson.encodeToString(UIMessage.serializer(), final))
        val part = reopened.parts.filterIsInstance<UIMessagePart.Text>().single()
        assertEquals(live.kuanRichBlocks(), part.kuanRichBlocks())
        assertEquals(live.text, part.text)
        assertTrue(part.text.endsWith("Preserved."))
        assertFalse(part.text.contains('\uE200'))
        assertEquals(reopened, finishKuanPresentation(context, reopened))
    }

    @Test
    fun visibleChartFileAndQuestionAreIndependentNativeBlocks() {
        val snapshot = KuanJson.parseToJsonElement("""{"version":1,"source":"chatgpt","message_id":"reply","revision":1,
          "anchors":[{"slot_id":"DIL2","component_id":"c"},{"slot_id":"DIL0","component_id":"q"},{"slot_id":"DIL1","component_id":"f"}],
          "components":[{"id":"q","kind":"ask_user_input_v2","status":"resolved",
            "questions":[{"question":"Which period?","choices":[{"label":"One week","prompt":"Show one week"}]}]},
          {"id":"f","kind":"file","status":"resolved","label":"Report.py","file_url":"/kuan/chat-assets/asset-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},
          {"id":"c","kind":"charts_widget_v2","status":"resolved","chart":{"style":"bar","title":"Real chart",
            "x_axis":{"data":["Monday","Tuesday"]},"series":[{"values":[1,3]}]}}]}""") as JsonObject
        val finished = runBlocking { finishKuanPresentation(context, UIMessage(role = MessageRole.ASSISTANT, parts = listOf(
            UIMessagePart.Text("Before.\uE000DIL2\uE001\n\n\uE000DIL1\uE001\n\n\uE000DIL0\uE001After.",
                JsonObject(mapOf(KUAN_WEB_MESSAGE_ID to JsonPrimitive("reply")))),
            UIMessagePart.Text("", JsonObject(mapOf(KUAN_WEB_MESSAGE_ID to JsonPrimitive("reply"), KUAN_WEB_PRESENTATION to snapshot))),
        ))) }
        var clicked = ""
        compose.setContent {
            MaterialTheme {
                CompositionLocalProvider(LocalSettings provides Settings()) {
                    Column {
                        MessagePartsBlock(assistant = null, role = MessageRole.ASSISTANT, model = null, parts = finished.parts,
                            annotations = finished.annotations, loading = false, onFollowUp = { clicked = it })
                    }
                }
            }
        }
        compose.onNodeWithText("Real chart").assertIsDisplayed()
        compose.onNodeWithText("Report.py").assertIsDisplayed()
        compose.onNodeWithText("Which period?").assertIsDisplayed()
        compose.onNodeWithText("One week").performClick()
        compose.runOnIdle { assertEquals("Show one week", clicked) }
    }

    @Test
    fun imagePayloadNeedsBytesOrAnOwnedServerResolution() {
        val b64 = KUAN_TEST_IMAGE_PNG
        fun event(id: String, result: String) = JsonObject(mapOf("item" to JsonObject(mapOf(
            "id" to JsonPrimitive(id), "type" to JsonPrimitive("image_generation_call"), "result" to JsonPrimitive(result),
        ))))
        val images = KuanGeneratedImages()
        for ((id, data) in listOf("bare" to b64, "data" to "data:image/png;base64,$b64")) {
            val row = event(id, data)
            val chunks = images.accept("response.output_item.done", row).orEmpty()
            assertEquals(b64, chunks.filterIsInstance<StreamChunk.ImageSnapshot>().single().data)
            assertTrue(images.accept("response.output_item.done", row).orEmpty().isEmpty())
        }
        for ((id, pointer) in listOf("ordinary" to "file-service://file_x", "sediment" to "sediment://file_y")) {
            val chunks = images.accept("response.output_item.done", event(id, pointer)).orEmpty()
            assertTrue(chunks.none { it is StreamChunk.ImageSnapshot })
        }
        assertEquals(2, images.finish().filterIsInstance<StreamChunk.ServerToolEnd>().size)
    }

    @Test
    fun oldSavedProjectionWithAnUnparsedSlotIsNotConsideredFinished() = runBlocking {
        val metadata = JsonObject(mapOf(
            "kuan:presentation_v2" to JsonPrimitive(true),
            "kuan:layout_v2" to JsonPrimitive(true),
        ))
        val original = UIMessage(role = MessageRole.ASSISTANT, parts = listOf(
            UIMessagePart.Text("Before.\uE000DIL1\uE001After.", metadata),
        ))
        val projected = finishKuanPresentation(context, original)
        val part = projected.parts.filterIsInstance<UIMessagePart.Text>().single()
        assertEquals("unavailable", part.kuanRichBlocks().single().string("status"))
        assertFalse(part.text.contains("DIL1"))
        assertTrue(part.text.contains("After."))
    }
}
