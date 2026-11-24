package me.rerere.rikkahub.ui.components.message

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import me.rerere.hugeicons.HugeIcons
import me.rerere.hugeicons.stroke.Image01
import me.rerere.hugeicons.stroke.Link01
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.kuan.KuanWebImage
import me.rerere.rikkahub.ui.components.ui.ImagePreviewDialog
import me.rerere.ui.components.Tooltip

@Composable
internal fun KuanWebIllustration(images: List<KuanWebImage>, modifier: Modifier = Modifier) {
    if (images.isEmpty()) return
    val uriHandler = LocalUriHandler.current
    var preview by remember(images) { mutableStateOf<Int?>(null) }
    val pager = rememberPagerState { images.size }
    val current = images[pager.currentPage.coerceIn(images.indices)]
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(2.dp)) {
        BoxWithConstraints(Modifier.fillMaxWidth()) {
            val height = (maxWidth * (2f / 3)).coerceIn(128.dp, 360.dp)
            if (images.size == 1) {
                IllustrationImage(current, Modifier.fillMaxWidth().height(height)) { preview = 0 }
            } else {
                HorizontalPager(
                    state = pager,
                    modifier = Modifier.fillMaxWidth().height(height),
                    key = { images[it].url },
                ) { index ->
                    IllustrationImage(images[index], Modifier.fillMaxSize()) { preview = index }
                }
            }
        }
        if (current.title.isNotBlank() || current.source != null || images.size > 1) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(start = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    current.title,
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                if (images.size > 1) {
                    Text(
                        text = "${pager.currentPage + 1}/${images.size}",
                        modifier = Modifier.padding(horizontal = 6.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                current.source?.let { url ->
                    val label = stringResource(R.string.kuan_web_image_source)
                    Tooltip(tooltip = { Text(label) }) {
                        IconButton(onClick = { runCatching { uriHandler.openUri(url) } }) {
                            Icon(HugeIcons.Link01, contentDescription = label, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }
    }
    preview?.let { selected ->
        ImagePreviewDialog(remember(images) { images.map { it.url } }, initialPage = selected) { preview = null }
    }
}

@Composable
private fun IllustrationImage(image: KuanWebImage, modifier: Modifier, onOpen: () -> Unit) {
    var url by remember(image) { mutableStateOf(image.url) }
    var failed by remember(image) { mutableStateOf(false) }
    Box(
        modifier.clip(MaterialTheme.shapes.small)
            .background(MaterialTheme.colorScheme.surfaceContainerLow)
            .clickable(onClickLabel = stringResource(R.string.kuan_web_open_image), onClick = onOpen),
        contentAlignment = Alignment.Center,
    ) {
        AsyncImage(
            model = url,
            contentDescription = image.title.ifBlank { stringResource(R.string.kuan_web_open_image) },
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Fit,
            onError = {
                val fallback = image.thumbnail
                if (fallback != null && url != fallback) url = fallback else failed = true
            },
        )
        if (failed) {
            Icon(HugeIcons.Image01, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
