package me.rerere.rikkahub.data.kuan

import kotlin.uuid.Uuid
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import me.rerere.ai.core.MessageRole
import me.rerere.ai.provider.Model
import me.rerere.ai.provider.ModelType
import me.rerere.ai.provider.ProviderSetting
import me.rerere.ai.provider.TextGenerationParams
import me.rerere.ai.provider.providers.openai.OpenAIWire
import me.rerere.ai.ui.StreamChunk
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessageAnnotation
import me.rerere.ai.ui.UIMessagePart
import me.rerere.rikkahub.utils.UpdateDownload
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class KuanContractsTest {
    private val owner = Uuid.random().toString()
    private val group = KuanGroup(12, "aggregate", "openai")
    private val wire = OpenAIWire(OkHttpClient())

    @Test
    fun catalogUsesAuthorizationMetadataAndNewIdsWithoutNameLists() {
        val data = KuanJson.parseToJsonElement(
            """
            {"data":[
              {"id":"future-native-42","display_name":"Future Work","priority":3},
              {"id":"future-web-99","kuan_chatgpt_web":true,"priority":2,
                "supported_reasoning_levels":[{"effort":"medium"}]},
              {"id":"new-admin","kuan_chatgpt_web":true,"kuan_admin_only":true,"priority":1},
              {"id":"team-art","output_modalities":["image"]},
              {"id":"hidden","visibility":"hide"},
              {"id":"missing-route","supported_in_api":false}
            ]}
            """.trimIndent(),
        ) as JsonObject
        val user = managedModels(data, owner, group, false)
        assertEquals(listOf("future-web-99"), user.first().models.map { it.modelId })
        assertEquals(listOf("medium"), user.first().models.first().serverReasoningLevels)
        assertEquals(listOf("future-native-42", "team-art"), user.last().models.map { it.modelId })
        assertEquals(ModelType.IMAGE, user.last().models.last().type)
        val admin = managedModels(data, owner, group, true)
        assertEquals(listOf("new-admin", "future-web-99"), admin.first().models.map { it.modelId })
        assertEquals(user.first().models.first().id, admin.first().models.last().id)
        val other = managedModels(data, owner, group.copy(id = 13), false)
        assertNotEquals(user.first().models.first().id, other.first().models.first().id)
        assertTrue(user.all { it.apiKey.isEmpty() && it.customHeaders.isEmpty() })
    }

    @Test
    fun originalFileHandleSurvivesBothWireEncodersAlongsideText() {
        val reference = "kuan-asset://asset-" + "a".repeat(32)
        val doc = UIMessagePart.Document(reference, "source.py", "text/x-python")
        val message = UIMessage(role = MessageRole.USER, parts = listOf(UIMessagePart.Text("Read the original"), doc))
        val params = TextGenerationParams(model = Model(modelId = "future-native"))
        val provider = ProviderSetting.OpenAI(baseUrl = KUAN_V1)
        val completions = wire.streamingBody(provider, listOf(message), params)
        val parts = completions["messages"]!!.jsonArray[0].jsonObject["content"]!!.jsonArray
        val file = parts[1].jsonObject["file"]!!.jsonObject
        assertEquals(reference, file["file_data"]!!.jsonPrimitive.content)
        assertEquals("source.py", file["filename"]!!.jsonPrimitive.content)
        val response = wire.streamingBody(provider.copy(useResponseApi = true), listOf(message.copy(parts = listOf(doc))), params)
        val event = response["input"]!!.jsonArray[0].jsonObject["content"]!!.jsonArray[0].jsonObject
        assertEquals("input_file", event["type"]!!.jsonPrimitive.content)
        assertEquals(reference, event["file_data"]!!.jsonPrimitive.content)
    }

    @Test
    fun cleanCompletionAndPrematureDoneAreNotEquivalent() {
        val decoder = KuanStreamDecoder(wire, false)
        val deltas = decoder.accept(
            """{"id":"x","model":"future","choices":[{"delta":{"content":"Hello"},"finish_reason":null}]}""",
        )
        assertTrue(deltas.any { it is StreamChunk.TextDelta && it.text == "Hello" })
        assertFalse(decoder.terminated)
        decoder.accept("""{"id":"x","model":"future","choices":[{"delta":{},"finish_reason":"stop"}]}""")
        assertTrue(decoder.accept("[DONE]").any { it is StreamChunk.Finish })
        assertTrue(decoder.terminated)
        assertEquals(emptyList<StreamChunk>(), decoder.accept("[DONE]"))
        val truncated = runCatching { KuanStreamDecoder(wire, false).accept("[DONE]") }.exceptionOrNull()
        assertTrue(truncated is KuanProtocolError)
    }

    @Test
    fun nativeMetadataFramesPreserveRawDeltasAndOnlyAttachMatchingPublicSources() {
        val decoder = KuanStreamDecoder(wire, false)
        val content = decoder.accept(
            """{"id":"x","message_id":"answer","choices":[{"delta":{"content":"Streamed answer"}}]}""",
        )
        assertEquals("Streamed answer", content.filterIsInstance<StreamChunk.TextDelta>().single().text)
        assertTrue(decoder.accept(
            """{"id":"x","choices":[{"delta":{"kuan_native_markdown":{"source":"chatgpt","format":"text/markdown","message_id":"answer","text":"Corrected answer"}}}]}""",
        ).isEmpty())
        assertTrue(decoder.accept(
            """{"id":"x","choices":[{"delta":{"kuan_native_presentation":{"source":"chatgpt","version":1,"message_id":"answer","components":[
                {"id":"one","kind":"Cite","sources":[{"url":"https://example.com/doc","title":"Source"},
                    {"url":"https://private.example.com/?access_token=redacted","title":"Not public"},
                    {"url":"https://127.0.0.1/","title":"Not public"},
                    {"url":"https://example.com/doc","title":"Duplicate"}]}]}}}]}""".replace("\n", ""),
        ).isEmpty())
        decoder.accept("""{"id":"x","choices":[{"finish_reason":"stop","delta":{}}]}""")
        val terminal = decoder.accept("[DONE]")
        assertEquals(
            "Corrected answer",
            terminal.filterIsInstance<StreamChunk.TextStart>().single().metadata?.string(KUAN_NATIVE_MARKDOWN),
        )
        assertEquals(
            listOf(UIMessageAnnotation.UrlCitation("Source", "https://example.com/doc")),
            terminal.filterIsInstance<StreamChunk.Annotations>().single().annotations,
        )
        assertTrue(terminal.none { it is StreamChunk.TextDelta })
        assertTrue(terminal.last() is StreamChunk.Finish)
    }

    @Test
    fun untrustedUpdateDownloadCannotSwitchOriginsOrOmitDigest() {
        val manifest = "https://updates.example.test/native/manifest.json".toHttpUrl()
        val release = UpdateDownload(
            "kuan.apk", "https://updates.example.test/native/kuan.apk",
            bytes = 13_000_000L, sha256 = "a".repeat(64), abi = "arm64-v8a",
        )
        assertTrue(release.validFor(manifest))
        assertFalse(release.copy(url = "http://updates.example.test/native/kuan.apk").validFor(manifest))
        assertFalse(release.copy(url = "https://mirror.example.test/native/kuan.apk").validFor(manifest))
        assertFalse(release.copy(bytes = -1).validFor(manifest))
        assertFalse(release.copy(sha256 = "").validFor(manifest))
    }
}
