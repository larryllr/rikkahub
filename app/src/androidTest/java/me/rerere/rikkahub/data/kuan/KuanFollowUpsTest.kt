package me.rerere.rikkahub.data.kuan

import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import java.util.concurrent.atomic.AtomicReference
import kotlinx.coroutines.runBlocking
import me.rerere.ai.core.MessageRole
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessagePart
import me.rerere.rikkahub.ui.components.message.KuanFollowUps
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class KuanFollowUpsTest {
    @get:Rule val compose = createComposeRule()

    @Test
    fun rendersActualQuestionsAndDraftsTheSelectedAnswer() {
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

        val draft = AtomicReference<String?>(null)
        compose.setContent { MaterialTheme { KuanFollowUps(part, draft::set) } }
        compose.onNodeWithText("Language").assertIsDisplayed()
        compose.onNodeWithText("Target").assertIsDisplayed()
        compose.onNodeWithText("Kotlin").performClick()
        compose.onNodeWithText("Java").performClick()
        compose.onNodeWithText("Phone").performClick()
        compose.onNodeWithText("Tablet").performClick()
        compose.onNodeWithText("Continue").performClick()
        compose.waitUntil(5000) { draft.get() != null }
        assertEquals("Java / Tablet", draft.get())
    }
}
