package me.rerere.rikkahub.data.kuan

import java.io.IOException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.buffer
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.ai.core.MessageRole
import me.rerere.ai.core.ReasoningLevel
import me.rerere.ai.provider.BuiltInTools
import me.rerere.ai.provider.EmbeddingGenerationParams
import me.rerere.ai.provider.EmbeddingGenerationResult
import me.rerere.ai.provider.ImageEditParams
import me.rerere.ai.provider.ImageGenerationParams
import me.rerere.ai.provider.Model
import me.rerere.ai.provider.Provider
import me.rerere.ai.provider.ProviderSetting
import me.rerere.ai.provider.TextGenerationParams
import me.rerere.ai.provider.TextGenerationResult
import me.rerere.ai.provider.providers.openai.OpenAIProvider
import me.rerere.ai.provider.providers.openai.OpenAIWire
import me.rerere.ai.provider.stream.SseEvent
import me.rerere.ai.ui.ImageGenerationItem
import me.rerere.ai.ui.StreamChunk
import me.rerere.ai.ui.StreamChunkHandler
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessageAnnotation
import me.rerere.ai.ui.UIMessagePart
import me.rerere.ai.ui.finishReasoning
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources

internal class KuanProvider(
    private val api: KuanApi,
    private val session: KuanSession,
    private val catalog: KuanCatalog,
    private val assets: KuanAssets,
    private val jobs: KuanJobs,
) : Provider<ProviderSetting.OpenAI> {
    private val wire = OpenAIWire(api.client)
    private val standard = OpenAIProvider(api.client)

    override suspend fun listModels(providerSetting: ProviderSetting.OpenAI): List<Model> = providerSetting.models

    override suspend fun streamText(
        providerSetting: ProviderSetting.OpenAI,
        messages: List<UIMessage>,
        params: TextGenerationParams,
    ): Flow<StreamChunk> = flow {
        val (route, resolved) = catalog.resolve(providerSetting, params.model)
        val epoch = session.state.value.epoch
        val canonical = resolved.models.first { it.id == params.model.id }
        val updated = params.copy(
            model = canonical.copy(tools = canonical.tools.intersect(params.model.tools) - BuiltInTools.ImageGeneration),
            customHeaders = emptyList(),
            customBody = emptyList(),
            reasoningLevel = ReasoningLevel.AUTO,
            tools = if (route.lane == KuanLane.WEB) emptyList() else params.tools,
        )
        val cleanMessages = messages.map { message ->
            message.copy(parts = message.parts.filterNot { it is UIMessagePart.Reasoning || it is UIMessagePart.ServerTool })
        }
        val prepared = assets.attach(route.scope, cleanMessages)
        if (!session.isCurrent(route.scope, epoch)) throw KuanHttpError(401)
        val body = wire.streamingBody(resolved, prepared, updated).toMutableMap()
        val effort = params.providerReasoningEffort?.takeIf { it in canonical.serverReasoningLevels.orEmpty() }
        if (resolved.useResponseApi) {
            val existingReasoning = (body["reasoning"] as? JsonObject)?.minus("effort").orEmpty()
            val reasoning = if (effort == null) existingReasoning else existingReasoning + ("effort" to JsonPrimitive(effort))
            if (reasoning.isEmpty()) body.remove("reasoning") else body["reasoning"] = JsonObject(reasoning)
        } else if (effort == null) body.remove("reasoning_effort") else body["reasoning_effort"] = JsonPrimitive(effort)
        body.remove("include")
        body["store"] = JsonPrimitive(false)
        body["x_kuanapi_chat"] = buildJsonObject {
            put("version", 1)
            put("web_only", route.lane == KuanLane.WEB)
            if (route.lane == KuanLane.WEB) put("allow_web_downgrade", true)
        }
        val url = if (resolved.useResponseApi) "/v1/responses" else "/v1/chat/completions"
        if (updated.backgroundTarget?.messageId != null) {
            val protocol = if (resolved.useResponseApi) "responses" else "chat_completions"
            emitAll(jobs.start(route, resolved.apiKey, protocol, updated, JsonObject(body)))
        } else {
            val request = api.request(
                url, "POST", resolved.apiKey,
                JsonObject(body).toString().toRequestBody(KuanApi.JSON_TYPE),
                headers = mapOf("Accept" to "text/event-stream"),
            )
            val decoder = KuanStreamDecoder(wire, resolved.useResponseApi)
            emitAll(directEvents(request, decoder, route.scope, epoch))
        }
    }.flowOn(Dispatchers.IO)

    private fun directEvents(request: Request, decoder: KuanStreamDecoder, scope: String, epoch: Long): Flow<StreamChunk> = callbackFlow {
        val listener = object : EventSourceListener() {
            override fun onEvent(source: EventSource, id: String?, type: String?, data: String) {
                try {
                    if (!session.isCurrent(scope, epoch)) throw KuanHttpError(401)
                    decoder.accept(data, id, type).forEach { chunk -> trySend(chunk) }
                    if (decoder.terminated) close()
                } catch (error: Exception) {
                    close(error)
                }
            }

            override fun onClosed(source: EventSource) {
                if (!decoder.terminated) close(KuanProtocolError("The reply stream closed before completion"))
                else close()
            }

            override fun onFailure(source: EventSource, error: Throwable?, response: Response?) {
                close(response?.let { KuanHttpError(it.code) } ?: IOException("Kuan API stream connection failed"))
            }
        }
        val source = EventSources.createFactory(api.client).newEventSource(request, listener)
        awaitClose { source.cancel() }
    }.buffer(Channel.UNLIMITED)

    override suspend fun generateText(
        providerSetting: ProviderSetting.OpenAI,
        messages: List<UIMessage>,
        params: TextGenerationParams,
    ): TextGenerationResult {
        var handler = StreamChunkHandler(params.model)
        var message = UIMessage(role = MessageRole.ASSISTANT, parts = emptyList())
        var finish: StreamChunk.Finish? = null
        streamText(providerSetting, messages, params).collect { chunk ->
            if (chunk == StreamChunk.ResetAttempt) {
                message = message.copy(parts = emptyList(), annotations = emptyList(), usage = null)
                handler = StreamChunkHandler(params.model)
                finish = null
                return@collect
            }
            message = handler.handle(listOf(message), chunk).single()
            if (chunk is StreamChunk.Finish) finish = chunk
        }
        return TextGenerationResult(
            finish?.responseId.orEmpty(), finish?.model ?: params.model.modelId,
            message.finishReasoning(), finish?.finishReason, message.usage,
        )
    }

    override suspend fun generateEmbedding(
        providerSetting: ProviderSetting.OpenAI,
        params: EmbeddingGenerationParams,
    ): EmbeddingGenerationResult = standard.generateEmbedding(
        catalog.resolve(providerSetting, params.model).second,
        params.copy(customHeaders = emptyList(), customBody = emptyList()),
    )

    override suspend fun generateImage(providerSetting: ProviderSetting, params: ImageGenerationParams): Flow<ImageGenerationItem> =
        standard.generateImage(
            catalog.resolve(providerSetting as ProviderSetting.OpenAI, params.model).second,
            params.copy(customHeaders = emptyList(), customBody = emptyList()),
        )

    override suspend fun editImage(providerSetting: ProviderSetting, params: ImageEditParams): Flow<ImageGenerationItem> =
        standard.editImage(
            catalog.resolve(providerSetting as ProviderSetting.OpenAI, params.model).second,
            params.copy(customHeaders = emptyList(), customBody = emptyList()),
        )
}

internal class KuanStreamDecoder(wire: OpenAIWire, private val responses: Boolean) {
    private val parser = wire.streamDecoder(responses)
    private val nativeReply = KuanNativeReply()
    private var hasFinish = false
    private var imageId = 0
    var terminated = false
        private set

    fun accept(data: String, id: String? = null, type: String? = null): List<StreamChunk> {
        if (terminated) return emptyList()
        if (data == "[DONE]") {
            if (!hasFinish) throw KuanProtocolError("The response ended without a completion reason")
            terminated = true
            val finalChunks = parser.accept(SseEvent(id = id, event = type, data = data)).chunks
            return nativeReply.finish(finalChunks)
        }
        val row = runCatching { KuanJson.parseToJsonElement(data) as? JsonObject }.getOrNull()
            ?: throw KuanProtocolError("Invalid event in the Kuan API stream")
        val event = row.string("type")
        if (event in setOf("response.failed", "error") || row.containsKey("error")) {
            val code = (row.obj("error") ?: row.obj("response")?.obj("error"))?.string("code")
            throw KuanProtocolError("The provider could not complete this reply" +
                (code?.takeIf { it.matches(Regex("[a-zA-Z0-9_.-]{1,64}")) }?.let { ": $it" } ?: ""))
        }
        if (event == "image_generation.completed") {
            val url = row.string("url").orEmpty()
            val mime = url.substringBefore(";base64,").removePrefix("data:")
            if (mime !in setOf("image/png", "image/jpeg", "image/webp") || !url.contains(";base64,")) return emptyList()
            val image = "kuan-image-${imageId++}"
            return listOf(
                StreamChunk.ImageStart(image, mime), StreamChunk.ImageSnapshot(image, url.substringAfter(";base64,")),
                StreamChunk.ImageEnd(image), StreamChunk.ServerToolEnd("kuan-image-progress", status = me.rerere.ai.ui.ServerToolStatus.COMPLETED),
            )
        }
        if (event == "response.image_generation_call.in_progress" && row.string("stage") != null) {
            return listOf(StreamChunk.ServerToolStart("kuan-image-progress", "image_generation", metadata = row))
        }
        if (event?.startsWith("kuan.") == true) return emptyList()
        if (responses && event == "response.done") {
            return accept(JsonObject(row + ("type" to JsonPrimitive("response.completed"))).toString(), id, type)
        }
        if (responses && event in setOf("response.completed", "response.incomplete")) hasFinish = true
        if (!responses) {
            val choice = row.array("choices")?.firstOrNull() as? JsonObject
            if (choice?.string("finish_reason") != null) hasFinish = true
            choice?.obj("delta")?.let { nativeReply.accept(row.string("message_id"), it) }
        }
        return parser.accept(SseEvent(id = id, event = type, data = data)).chunks
    }
}

private class KuanNativeReply {
    private var messageId: String? = null
    private var markdown: Pair<String, String>? = null
    private var sources: Pair<String, List<UIMessageAnnotation.UrlCitation>>? = null

    fun accept(id: String?, delta: JsonObject) {
        if (!delta.string("content").isNullOrEmpty() && id != null) messageId = id
        delta.obj("kuan_native_markdown")?.let { snapshot ->
            if (snapshot.string("source") != "chatgpt" || snapshot.string("format") != "text/markdown") return@let
            val key = snapshot.replyId() ?: return@let
            val text = snapshot.string("text")?.takeIf { it.length in 1..MAX_PRESENTATION } ?: return@let
            markdown = key to text
        }
        delta.obj("kuan_native_presentation")?.let { snapshot ->
            if (snapshot.string("source") != "chatgpt" || snapshot.int("version") != 1) return@let
            val key = snapshot.replyId() ?: return@let
            val references = snapshot.array("components").orEmpty().asSequence().take(96)
                .filterIsInstance<JsonObject>().filter { it.string("kind") == "Cite" }
                .flatMap { it.array("sources").orEmpty().asSequence().take(32) }
                .mapNotNull { readKuanCitation(it, native = true) }.distinctBy { it.url }.take(128).toList()
            sources = key to references
        }
    }

    fun finish(chunks: List<StreamChunk>): List<StreamChunk> = buildList {
        val snapshot = markdown?.takeIf { messageId == null || it.first == messageId }?.second
        if (snapshot != null) {
            // Use a metadata-only event so the regular text stream is never concatenated with a snapshot.
            val id = "kuan-terminal-presentation"
            add(StreamChunk.TextStart(id, buildJsonObject { put(KUAN_NATIVE_MARKDOWN, snapshot) }))
            add(StreamChunk.TextEnd(id))
        }
        sources?.takeIf { messageId == null || it.first == messageId }?.second?.takeIf { it.isNotEmpty() }?.let {
            add(StreamChunk.Annotations(it))
        }
        addAll(chunks)
    }

    private fun JsonObject.replyId() = string("message_id")?.takeIf { it.length in 1..128 }
}
