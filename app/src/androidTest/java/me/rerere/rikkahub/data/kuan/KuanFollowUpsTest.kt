package me.rerere.rikkahub.data.kuan

import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.test.assertIsNotDisplayed
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import java.util.concurrent.atomic.AtomicReference
import kotlin.uuid.Uuid
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.ai.core.MessageRole
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessageAnnotation
import me.rerere.ai.ui.UIMessagePart
import me.rerere.rikkahub.R
import me.rerere.rikkahub.ui.components.message.ChatMessageCitations
import me.rerere.rikkahub.ui.components.message.KuanFollowUps
import me.rerere.rikkahub.ui.hooks.ChatInputState
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class KuanFollowUpsTest {
    @get:Rule val compose = createComposeRule()

    @Test
    fun rendersActualQuestionsAndSubmitsOnlyTheSelectedAnswer() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val source = "[Before](https://example.com/before)\n\n" +
            "<box><title>Language</title>{@body const [a,setA]=DIL.useState(\"Kotlin\")}" +
            "<select value={a} onChange={setA}><option value=\"Kotlin\">Kotlin</option><option value=\"Java\">Java</option></select>" +
            "<title>Target</title>{@body const [b,setB]=DIL.useState(\"Phone\")}" +
            "<select value={b} onChange={setB}><option value=\"Phone\">Phone</option><option value=\"Tablet\">Tablet</option></select>" +
            "<button onClick={()=>GenUI.issueNewTurn(a+\" / \"+b)}>Continue</button></box>\n\n" +
            "[After](https://example.com/after)"
        val raw = UIMessage(role = MessageRole.ASSISTANT, parts = listOf(UIMessagePart.Text(source)))
        val finished = runBlocking { finishKuanPresentation(context, raw) }
        val part = finished.parts.single() as UIMessagePart.Text
        assertTrue(part.text.contains("[Before](https://example.com/before)"))
        assertTrue(part.text.contains("[After](https://example.com/after)"))
        assertTrue((finished.withKuanQuestionHistory().parts.single() as UIMessagePart.Text).text.contains("Language"))

        val sent = AtomicReference<String?>(null)
        val input = ChatInputState()
        compose.setContent {
            MaterialTheme { KuanFollowUps(part) { input.answerFollowUp(it, canSend = true, sent::set) } }
        }
        compose.onNodeWithText("Language").assertIsDisplayed()
        compose.onNodeWithText("Target").assertIsDisplayed()
        compose.onNodeWithText("Kotlin").performClick()
        compose.onNodeWithText("Java").performClick()
        compose.onNodeWithText("Phone").performClick()
        compose.onNodeWithText("Tablet").performClick()
        compose.onNodeWithText("Continue").performClick()
        compose.waitUntil(5000) { sent.get() != null }
        assertEquals("Java / Tablet", sent.get())
        compose.runOnIdle {
            assertTrue(input.isEmpty())
            sent.set(null)
            input.setMessageText("My draft")
            input.messageContent = listOf(UIMessagePart.Document("file:///fixture.txt", "fixture.txt", "text/plain"))
        }
        compose.onNodeWithText("Continue").performClick()
        compose.waitUntil(5000) { input.textContent.text.toString() == "My draft\nJava / Tablet" }
        assertEquals(null, sent.get())
        compose.runOnIdle {
            val attachment = input.messageContent.single() as UIMessagePart.Document
            assertEquals("fixture.txt", attachment.fileName)
            input.clearInput()
            input.messageContent = listOf(attachment)
        }
        compose.onNodeWithText("Continue").performClick()
        compose.waitUntil(5000) { input.textContent.text.toString() == "Java / Tablet" }
        assertEquals(null, sent.get())
        compose.runOnIdle {
            input.editingMessage = Uuid.random()
            assertEquals(false, input.answerFollowUp("Do not overwrite", canSend = true, sent::set))
            assertEquals("Java / Tablet", input.textContent.text.toString())
        }
    }

    @Test
    fun classicSourceListsBecomeCollapsedCitationsAndKeepHistoryAndOwnedLinks() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val owned = "http://ai.larryllr.cc.cd/download/file/" + "a".repeat(32) + "/example.py"
        val original = "Read [ordinary link](https://example.com/page).\n\n" +
            "Sources:\n- [Official guide](https://example.com/source)\n- [Download code]($owned)"
        val raw = UIMessage(
            role = MessageRole.ASSISTANT,
            parts = listOf(UIMessagePart.Text(original)),
            annotations = listOf(UIMessageAnnotation.UrlCitation("Official guide", "https://example.com/source")),
        )
        val finished = runBlocking { finishKuanPresentation(context, raw) }
        assertEquals("Read [ordinary link](https://example.com/page).", (finished.parts.single() as UIMessagePart.Text).text)
        assertEquals(original, (finished.withKuanQuestionHistory().parts.single() as UIMessagePart.Text).text)
        assertEquals(2, finished.annotations.size)
        assertTrue(kuanFileLink((finished.annotations.last() as UIMessageAnnotation.UrlCitation).url) is KuanFileLink.Owned)
        assertEquals(finished, runBlocking { finishKuanPresentation(context, finished) })
        assertEquals(raw.copy(role = MessageRole.USER), runBlocking { finishKuanPresentation(context, raw.copy(role = MessageRole.USER)) })

        compose.setContent { MaterialTheme { ChatMessageCitations(finished.annotations) } }
        val toggle = compose.onNodeWithText(context.getString(R.string.citations_count, 2))
        toggle.assertIsDisplayed()
        compose.onNodeWithText("1. Official guide").assertIsNotDisplayed()
        toggle.performClick()
        compose.onNodeWithText("1. Official guide").assertIsDisplayed()
        compose.onNodeWithText("2. Download code").assertIsDisplayed()
        toggle.performClick()
        compose.waitForIdle()
        compose.onNodeWithText("1. Official guide").assertIsNotDisplayed()
    }

    @Test
    fun terminalSnapshotDoesNotDuplicateTextHideTheQuestionOrDropTheTail() = runBlocking {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val raw = "<box><title>Which file?</title><button onClick={()=>GenUI.issueNewTurn(\"Use A\")}>File A</button></box>"
        val snapshot = UIMessagePart.Text("", buildJsonObject {
            put(KUAN_NATIVE_MARKDOWN, JsonPrimitive("Plain alternative\n\nReferences:\n- [A](https://example.com/a)"))
        })
        val message = UIMessage(role = MessageRole.ASSISTANT, parts = listOf(UIMessagePart.Text(raw), snapshot))
        val finished = finishKuanPresentation(context, message)
        val form = finished.parts.single() as UIMessagePart.Text
        assertEquals("Which file?", form.kuanFormGroups().single().string("question"))
        assertEquals("https://example.com/a", (finished.annotations.single() as UIMessageAnnotation.UrlCitation).url)
        assertEquals("Plain alternative", (finishKuanPresentation(context, message.copy(parts = listOf(snapshot)))
            .parts.single() as UIMessagePart.Text).text)

        val prefix = snapshot.copy(metadata = buildJsonObject { put(KUAN_NATIVE_MARKDOWN, "Keep the beginning") })
        val full = "Keep the beginning and all of the ending."
        val plain = finishKuanPresentation(context, message.copy(parts = listOf(UIMessagePart.Text(full), prefix)))
        assertEquals(full, (plain.parts.single() as UIMessagePart.Text).text)
    }
}
