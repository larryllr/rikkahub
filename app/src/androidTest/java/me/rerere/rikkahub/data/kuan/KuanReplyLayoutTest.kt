package me.rerere.rikkahub.data.kuan

import android.graphics.Bitmap
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.graphics.toPixelMap
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.UriHandler
import androidx.compose.ui.test.assertHasClickAction
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.captureToImage
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithContentDescription
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.unit.dp
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import coil3.ImageLoader
import coil3.SingletonImageLoader
import coil3.Uri
import coil3.asImage
import coil3.decode.DataSource
import coil3.fetch.Fetcher
import coil3.fetch.ImageFetchResult
import java.io.File
import java.util.concurrent.atomic.AtomicReference
import kotlin.time.Clock
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.ai.core.MessageRole
import me.rerere.ai.ui.ServerToolStatus
import me.rerere.ai.ui.StreamChunkHandler
import me.rerere.ai.ui.ToolApprovalState
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessageAnnotation
import me.rerere.ai.ui.UIMessagePart
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.datastore.Settings
import me.rerere.rikkahub.ui.components.message.MessagePartsBlock
import me.rerere.rikkahub.ui.context.LocalSettings
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class KuanReplyLayoutTest {
    @get:Rule val compose = createComposeRule()
    private val context get() = InstrumentationRegistry.getInstrumentation().targetContext

    @OptIn(coil3.annotation.DelicateCoilApi::class)
    @Test
    fun replyPlacesFullWidthIllustrationBetweenTextAndKeepsActivityInOneRow() {
        val url = "https://images.example.invalid/example(1).png"
        val source = "https://example.invalid/article"
        val imageTitle = "Illustration from a public source"
        val card = KuanWebCard("AsyncImage", "Photo search", images = listOf(
            KuanWebImage(url, null, imageTitle, source),
        ), query = "figure")
        val now = Clock.System.now()
        val search = UIMessagePart.ServerTool("ws", "web_search", buildJsonObject { put("query", "Real search query") },
            status = ServerToolStatus.COMPLETED)
        val reason = UIMessagePart.Reasoning("A returned reasoning summary", createdAt = now, finishedAt = now)
        val gate = UIMessagePart.Tool("gate", "write_file", "{}", approvalState = ToolApprovalState.Pending)
        val raw = UIMessage(role = MessageRole.ASSISTANT, parts = listOf(
            UIMessagePart.Text("Opening paragraph.\n\n<AsyncImage"),
            search, reason,
            UIMessagePart.Text(" query=\"figure\" />\n\nFollowing paragraph."),
        ))
        val withCards = listOf(card).toWebCardChunks("fixture").fold(raw) { message, chunk ->
            StreamChunkHandler().handle(listOf(message), chunk).single()
        }
        val result = runBlocking { finishKuanPresentation(context, withCards) }
        val text = result.parts.filterIsInstance<UIMessagePart.Text>().single()
        assertEquals(listOf(url), text.inlineKuanWebImages())
        val imagePosition = text.text.indexOf("https://images.example.invalid/example%281%29.png")
        assertTrue(imagePosition in text.text.indexOf("Opening")..text.text.indexOf("Following"))
        assertFalse((result.withKuanQuestionHistory().parts.filterIsInstance<UIMessagePart.Text>().single()).text.contains(url))

        val before = SingletonImageLoader.get(context)
        val color = 0xff29766f.toInt()
        val fixture = Bitmap.createBitmap(150, 100, Bitmap.Config.ARGB_8888).apply { eraseColor(color) }.asImage()
        val loader = ImageLoader.Builder(context).components {
            add(Fetcher.Factory<Uri> { data, _, _ ->
                if (data.toString() == url) Fetcher { ImageFetchResult(fixture, false, DataSource.MEMORY) } else null
            })
        }.build()
        SingletonImageLoader.setUnsafe(loader)
        try {
            val opened = AtomicReference<String?>()
            val authorized = AtomicReference<String?>()
            compose.setContent {
                MaterialTheme(colorScheme = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()) {
                    CompositionLocalProvider(
                        LocalSettings provides Settings(),
                        LocalUriHandler provides object : UriHandler {
                            override fun openUri(uri: String) { opened.set(uri) }
                        },
                    ) {
                        Surface(Modifier.fillMaxSize()) {
                            Column(
                                Modifier.safeDrawingPadding().padding(horizontal = 12.dp)
                                    .fillMaxWidth().verticalScroll(rememberScrollState()),
                            ) {
                                MessagePartsBlock(
                                    assistant = null,
                                    role = MessageRole.ASSISTANT,
                                    model = null,
                                    parts = result.parts.filterNot { it is UIMessagePart.ServerTool && it.toolName == KUAN_WEB_CARDS }
                                        + search.copy(toolCallId = "second_search", input = buildJsonObject {
                                            put("query", "Second search query")
                                        }) + gate,
                                    annotations = listOf(UIMessageAnnotation.UrlCitation("Reference", source)),
                                    loading = false,
                                    webCards = listOf(card),
                                    onToolApproval = { id, accepted, _ -> if (accepted) authorized.set(id) },
                                )
                            }
                        }
                    }
                }
            }
            val photo = compose.onNodeWithContentDescription(imageTitle)
            photo.assertIsDisplayed().assertHasClickAction()
            val image = photo.fetchSemanticsNode().boundsInRoot
            val opening = compose.onNodeWithText("Opening paragraph.", substring = true).fetchSemanticsNode().boundsInRoot
            val following = compose.onNodeWithText("Following paragraph.", substring = true).fetchSemanticsNode().boundsInRoot
            assertTrue(opening.bottom <= image.top && image.bottom <= following.top)
            assertTrue(image.width >= with(compose.density) { 260.dp.toPx() })
            val searchLabel = context.getString(R.string.use_web_search)
            val searchIcon = compose.onNodeWithContentDescription(searchLabel)
            val thinking = compose.onNodeWithContentDescription(context.getString(R.string.kuan_reply_reasoning))
            val pending = compose.onNodeWithContentDescription(context.getString(R.string.kuan_reply_pending))
            val citations = compose.onNodeWithContentDescription(context.getString(R.string.citations_count, 1))
            assertEquals(1, compose.onAllNodesWithContentDescription(searchLabel).fetchSemanticsNodes().size)
            val row = searchIcon.fetchSemanticsNode().boundsInRoot.top
            for (icon in listOf(thinking, pending, citations)) assertEquals(row, icon.fetchSemanticsNode().boundsInRoot.top, 1f)
            compose.onNodeWithText("Real search query").assertDoesNotExist()
            compose.onNodeWithText("A returned reasoning summary").assertDoesNotExist()
            compose.waitUntil(5000) {
                val drawn = photo.captureToImage()
                drawn.toPixelMap()[drawn.width / 2, drawn.height / 2].toArgb() == color
            }
            capture("inline-reply")
            compose.onNodeWithContentDescription(context.getString(R.string.kuan_web_image_source)).performClick()
            assertEquals(source, opened.get())
            val close = compose.onNodeWithContentDescription(context.getString(R.string.kuan_reply_close_details))
            searchIcon.performClick()
            compose.onNodeWithText("Real search query").assertExists()
            compose.onNodeWithText("Second search query").assertExists()
            close.performClick()
            thinking.performClick()
            compose.onNodeWithText("A returned reasoning summary").assertExists()
            close.performClick()
            pending.performClick()
            compose.onNodeWithContentDescription(context.getString(R.string.chat_message_tool_approve)).performClick()
            assertEquals("gate", authorized.get())
        } finally {
            SingletonImageLoader.setUnsafe(before)
            loader.shutdown()
        }
    }

    @Test
    fun oldProjectedGridKeepsContentAndCodeOnReopen() = runBlocking {
        val example = "\u0060<grid-item>example</grid-item>\u0060"
        val old = UIMessage(role = MessageRole.ASSISTANT, parts = listOf(UIMessagePart.Text(
            "Overview.\n\n<grid columns={2}><grid-item>**Training**\n\nLearn.</grid-item>" +
                "<grid-item>**Inference**\n\nRun.</grid-item></grid>\n\n$example\n\nNext.",
            buildJsonObject { put("kuan:presentation_v2", true) },
        )))
        assertTrue(old.needsKuanPresentation())
        val finished = finishKuanPresentation(context, old)
        assertEquals(
            "Overview.\n\n**Training**\n\nLearn.\n\n**Inference**\n\nRun.\n\n$example\n\nNext.",
            (finished.parts.single() as UIMessagePart.Text).text,
        )
        assertFalse(finished.needsKuanPresentation())
        assertEquals(finished, finishKuanPresentation(context, finished))
    }

    private fun capture(name: String) {
        val instrument = InstrumentationRegistry.getInstrumentation()
        if (InstrumentationRegistry.getArguments().getString("replyCapture") != "true") return
        val images = requireNotNull(context.getExternalFilesDir("reply-qa"))
        val shot = requireNotNull(instrument.uiAutomation.takeScreenshot())
        try {
            File(images, "$name.png").outputStream().use { shot.compress(Bitmap.CompressFormat.PNG, 100, it) }
        } finally {
            shot.recycle()
        }
    }
}
