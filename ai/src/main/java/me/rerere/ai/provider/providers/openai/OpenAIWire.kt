package me.rerere.ai.provider.providers.openai

import kotlinx.serialization.json.JsonObject
import me.rerere.ai.provider.ProviderSetting
import me.rerere.ai.provider.TextGenerationParams
import me.rerere.ai.provider.stream.StreamChunkDecoder
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.util.KeyRoulette
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient

/** The protocol codecs are also used by first-party transports that persist SSE events. */
class OpenAIWire(client: OkHttpClient) {
    private val completions = ChatCompletionsAPI(client, KeyRoulette.default())
    private val responses = ResponseAPI(client)

    fun streamingBody(provider: ProviderSetting.OpenAI, messages: List<UIMessage>, params: TextGenerationParams): JsonObject =
        if (provider.useResponseApi) {
            responses.buildRequestBody(resolveResponseProviderCapabilities(provider.baseUrl.toHttpUrl().host), messages, params, true)
        } else {
            completions.buildChatCompletionRequest(messages, params, provider, stream = true)
        }

    fun streamDecoder(responses: Boolean): StreamChunkDecoder =
        if (responses) ResponseApiStreamDecoder() else ChatCompletionsStreamDecoder()
}

internal fun String.isKuanAssetRef() = matches(Regex("kuan-asset://asset-[a-f0-9]{32}"))
