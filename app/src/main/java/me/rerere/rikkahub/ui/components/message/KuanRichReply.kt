package me.rerere.rikkahub.ui.components.message

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import kotlinx.serialization.json.JsonObject
import me.rerere.hugeicons.HugeIcons
import me.rerere.hugeicons.stroke.File02
import me.rerere.hugeicons.stroke.Link01
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.kuan.array
import me.rerere.rikkahub.data.kuan.flag
import me.rerere.rikkahub.data.kuan.kuanRichFileUrl
import me.rerere.rikkahub.data.kuan.kuanRichImages
import me.rerere.rikkahub.data.kuan.kuanRichTable
import me.rerere.rikkahub.data.kuan.publicKuanPresentationUrl
import me.rerere.rikkahub.data.kuan.string
import me.rerere.rikkahub.ui.components.richtext.MarkdownBlock
import me.rerere.ui.charts.ChartCard
import me.rerere.ui.charts.ChartSpec

@Composable
internal fun KuanRichReplyBlock(block: JsonObject, loading: Boolean, onAnswer: ((String) -> Unit)?) {
    val type = block.string("type")
    val status = block.string("status")
    val label = stringResource(when (type) {
        "image", "progress" -> R.string.kuan_rich_image
        "chart" -> R.string.kuan_rich_chart
        "table" -> R.string.kuan_rich_table
        "map" -> R.string.kuan_rich_map
        "products" -> R.string.kuan_rich_products
        "links" -> R.string.kuan_rich_links
        "file" -> R.string.kuan_attachment
        "media" -> R.string.kuan_rich_media
        "questions" -> R.string.kuan_rich_questions
        "activity" -> R.string.kuan_reply_tools
        else -> R.string.kuan_rich_content
    })
    val title = block.string("title").orEmpty()
    val summary = block.string("summary").orEmpty()
    val images = remember(block) { block.kuanRichImages().distinctBy { it.url } }
    val spec = remember(block) { block["chart"]?.let { ChartSpec.fromJson(it) } }
    val table = remember(block) { block.kuanRichTable() }
    val questions = block.array("questions").orEmpty().filterIsInstance<JsonObject>()
    val links = buildList {
        val top = block.string("url")
        val target = if (type == "file") top.kuanRichFileUrl() else publicKuanPresentationUrl(top)
        if (target != null) add(Triple(target, title.ifBlank { label }, type == "file"))
        for (row in block.array("links").orEmpty().take(32).filterIsInstance<JsonObject>()) {
            val file = row.flag("file")
            val url = if (file) row.string("url").kuanRichFileUrl() else publicKuanPresentationUrl(row.string("url"))
            if (url != null) add(Triple(url, row.string("title").orEmpty().ifBlank { label }, file))
        }
    }.distinctBy { it.first }
    val anyData = images.isNotEmpty() || spec != null || table != null || links.isNotEmpty() || questions.isNotEmpty() || summary.isNotBlank()
    Column(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
        if (title.isNotBlank() && spec?.title != title && links.none { it.second == title }) {
            Text(title, style = MaterialTheme.typography.titleSmall)
        }
        if (summary.isNotBlank()) Text(summary)
        if (images.isNotEmpty()) KuanWebIllustration(images)
        if (spec != null) ChartCard(spec = spec)
        if (table != null && spec == null) MarkdownBlock(content = table)
        val uri = LocalUriHandler.current
        for ((url, name, file) in links) {
            TextButton(onClick = { runCatching { uri.openUri(url) } }) {
                Icon(
                    if (file) HugeIcons.File02 else HugeIcons.Link01,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp).padding(end = 2.dp),
                )
                Text(name, modifier = Modifier.padding(start = 6.dp))
            }
        }
        for (question in questions) {
            Text(question.string("question").orEmpty(), style = MaterialTheme.typography.titleSmall)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                for (choice in question.array("choices").orEmpty().filterIsInstance<JsonObject>()) {
                    val prompt = choice.string("prompt") ?: continue
                    val name = choice.string("label") ?: continue
                    FilledTonalButton(enabled = !loading && onAnswer != null, onClick = { onAnswer?.invoke(prompt) }) {
                        Text(name)
                    }
                }
            }
        }
        if (status == "pending" && loading || !anyData) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                val pending = status == "pending" && loading
                if (pending) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                Text(
                    stringResource(when {
                        pending -> R.string.kuan_rich_pending
                        status == "unsupported" -> R.string.kuan_rich_unsupported
                        status == "resolved" -> R.string.kuan_rich_completed
                        else -> R.string.kuan_rich_unavailable
                    }, label),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
