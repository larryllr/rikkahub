package me.rerere.rikkahub.ui.components.message

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.LinkAnnotation
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withLink
import androidx.compose.ui.unit.dp
import me.rerere.ai.provider.Model
import me.rerere.ai.ui.UIMessageAnnotation
import me.rerere.hugeicons.HugeIcons
import me.rerere.hugeicons.stroke.Cancel01
import me.rerere.hugeicons.stroke.Image01
import me.rerere.hugeicons.stroke.Link01
import me.rerere.hugeicons.stroke.Search01
import me.rerere.hugeicons.stroke.Sparkles
import me.rerere.hugeicons.stroke.Tools
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.kuan.KuanWebImage
import me.rerere.rikkahub.data.model.Assistant
import me.rerere.rikkahub.ui.components.ui.ChainOfThought
import me.rerere.ui.components.Tooltip
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull

private enum class ReplyDetail { SEARCH, REASONING, TOOLS, SOURCES, IMAGES }

private val searchTools = setOf("search_web", "web_search", "open_url", "google_search", "url_context", "web_fetch")

private fun ThinkingStep.detail(): ReplyDetail = when (this) {
    is ThinkingStep.ReasoningStep -> ReplyDetail.REASONING
    is ThinkingStep.ToolStep -> if (!tool.isPending && tool.toolName in searchTools) ReplyDetail.SEARCH else ReplyDetail.TOOLS
    is ThinkingStep.ServerToolStep ->
        if (tool.toolName.removePrefix("kuan_").removeSuffix("_call") in searchTools) ReplyDetail.SEARCH else ReplyDetail.TOOLS
    is ThinkingStep.NoticeStep -> ReplyDetail.TOOLS
}

@Composable
internal fun ChatReplyActivity(
    steps: List<ThinkingStep>,
    annotations: List<UIMessageAnnotation>,
    extraImages: List<KuanWebImage> = emptyList(),
    loading: Boolean = false,
    model: Model? = null,
    assistant: Assistant? = null,
    onToolApproval: ((String, Boolean, String) -> Unit)? = null,
    onToolAnswer: ((String, String) -> Unit)? = null,
) {
    val grouped = remember(steps) { steps.groupBy { it.detail() } }
    val links = remember(annotations) {
        annotations.filterIsInstance<UIMessageAnnotation.UrlCitation>().mapNotNull { citation ->
            val uri = citation.url.toHttpUrlOrNull()
                ?.takeIf { it.username.isEmpty() && it.password.isEmpty() } ?: return@mapNotNull null
            citation.copy(title = citation.title.ifBlank { uri.host }, url = uri.toString())
        }.distinctBy { it.url }
    }
    if (grouped.isEmpty() && links.isEmpty() && extraImages.isEmpty()) return
    var selected by remember { mutableStateOf<ReplyDetail?>(null) }
    val waiting = grouped[ReplyDetail.TOOLS].orEmpty().any { it is ThinkingStep.ToolStep && it.tool.isPending }
    val searchLabel = stringResource(R.string.use_web_search)
    val reasoningLabel = stringResource(R.string.kuan_reply_reasoning)
    val toolsLabel = stringResource(R.string.kuan_reply_tools)
    val sourcesLabel = stringResource(R.string.citations_count, links.size)
    val imagesLabel = stringResource(R.string.kuan_web_images, extraImages.size)
    Row(Modifier.padding(start = 2.dp), verticalAlignment = Alignment.CenterVertically) {
        if (ReplyDetail.SEARCH in grouped) {
            ReplyDetailButton(HugeIcons.Search01, searchLabel) { selected = ReplyDetail.SEARCH }
        }
        if (ReplyDetail.REASONING in grouped) {
            ReplyDetailButton(HugeIcons.Sparkles, reasoningLabel) { selected = ReplyDetail.REASONING }
        }
        if (ReplyDetail.TOOLS in grouped) {
            ReplyDetailButton(
                HugeIcons.Tools,
                if (waiting) stringResource(R.string.kuan_reply_pending) else toolsLabel,
                waiting = waiting,
            ) { selected = ReplyDetail.TOOLS }
        }
        if (links.isNotEmpty()) {
            ReplyDetailButton(HugeIcons.Link01, sourcesLabel) { selected = ReplyDetail.SOURCES }
        }
        if (extraImages.isNotEmpty()) {
            ReplyDetailButton(HugeIcons.Image01, imagesLabel) { selected = ReplyDetail.IMAGES }
        }
    }

    selected?.let { detail ->
        val stepsToShow = grouped[detail].orEmpty().let { steps ->
            if (detail != ReplyDetail.TOOLS || !waiting) steps
            else steps.partition { it is ThinkingStep.ToolStep && it.tool.isPending }.let { (pending, rest) -> pending + rest }
        }
        val title = when (detail) {
            ReplyDetail.SEARCH -> searchLabel
            ReplyDetail.REASONING -> reasoningLabel
            ReplyDetail.TOOLS -> toolsLabel
            ReplyDetail.SOURCES -> sourcesLabel
            ReplyDetail.IMAGES -> imagesLabel
        }
        ModalBottomSheet(
            onDismissRequest = { selected = null },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        ) {
            Row(
                Modifier.fillMaxWidth().padding(start = 20.dp, end = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(title, Modifier.weight(1f), style = MaterialTheme.typography.titleMedium)
                IconButton(onClick = { selected = null }) {
                    Icon(HugeIcons.Cancel01, contentDescription = stringResource(R.string.kuan_reply_close_details))
                }
            }
            Column(
                Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp)
                    .padding(bottom = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                when (detail) {
                    ReplyDetail.SOURCES -> links.forEachIndexed { index, link ->
                        Text(
                            text = buildAnnotatedString {
                                append("${index + 1}. ")
                                withLink(LinkAnnotation.Url(link.url)) { append(link.title) }
                            },
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary,
                        )
                    }
                    ReplyDetail.IMAGES -> KuanWebIllustration(extraImages)
                    else -> ChainOfThought(
                        steps = stepsToShow,
                        collapsedVisibleCount = Int.MAX_VALUE,
                        cardColors = CardDefaults.cardColors(containerColor = Color.Transparent),
                    ) { step ->
                        when (step) {
                            is ThinkingStep.ReasoningStep -> key(step.reasoning.createdAt) {
                                ChatMessageReasoningStep(step.reasoning, model, assistant, openedByUser = true)
                            }
                            is ThinkingStep.ToolStep -> key(step.tool.toolCallId) {
                                ChatMessageToolStep(
                                    tool = step.tool,
                                    loading = loading && !step.tool.isExecuted,
                                    assistant = assistant,
                                    onToolApproval = onToolApproval,
                                    onToolAnswer = onToolAnswer,
                                )
                            }
                            is ThinkingStep.ServerToolStep -> key(step.tool.toolCallId) {
                                ChatMessageServerToolStep(step.tool, initiallyExpanded = detail == ReplyDetail.SEARCH)
                            }
                            is ThinkingStep.NoticeStep -> ChatMessageNoticeStep(step.notice)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ReplyDetailButton(icon: ImageVector, label: String, waiting: Boolean = false, open: () -> Unit) {
    Tooltip(tooltip = { Text(label) }) {
        IconButton(onClick = open, modifier = Modifier.size(44.dp)) {
            BadgedBox(badge = { if (waiting) Badge() }) {
                Icon(
                    icon,
                    contentDescription = label,
                    modifier = Modifier.size(19.dp),
                    tint = if (waiting) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
