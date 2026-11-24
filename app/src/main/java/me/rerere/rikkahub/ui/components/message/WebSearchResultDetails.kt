package me.rerere.rikkahub.ui.components.message

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.LinkAnnotation
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withLink
import androidx.compose.ui.unit.dp
import me.rerere.ai.ui.WebSearchPresentation
import me.rerere.rikkahub.R
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull

@Composable
internal fun WebSearchResultDetails(result: WebSearchPresentation) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        result.queries.forEach { query ->
            Text(query, style = MaterialTheme.typography.bodySmall)
        }
        if (result.sources.isNotEmpty()) {
            Text(
                stringResource(R.string.citations_count, result.sources.size),
                style = MaterialTheme.typography.labelMedium,
            )
        }
        result.sources.forEach { source ->
            val host = source.url.toHttpUrlOrNull()?.host.orEmpty()
            Text(
                text = buildAnnotatedString {
                    withLink(LinkAnnotation.Url(source.url)) {
                        append(source.title)
                        if (host.isNotEmpty() && source.title != host) append(" \u00b7 $host")
                    }
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}
