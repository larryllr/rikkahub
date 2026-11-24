package me.rerere.rikkahub.ui.components.message

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
import me.rerere.rikkahub.data.kuan.KuanWebCard
import me.rerere.rikkahub.ui.components.ui.ImagePreviewDialog
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull

@Composable
internal fun KuanWebReplyCards(cards: List<KuanWebCard>) {
    if (cards.isEmpty()) return
    val uriHandler = LocalUriHandler.current
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        cards.forEachIndexed { index, card ->
            key(index, card.kind, card.title) {
                if (card.images.isNotEmpty()) {
                    KuanReplyImageGroup(card)
                } else card.link?.let { url ->
                    ChatMessageFileChip(
                        text = card.title.ifBlank { url.toHttpUrlOrNull()?.host.orEmpty() },
                        onClick = { uriHandler.openUri(url) },
                        icon = { Icon(HugeIcons.Link01, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    )
                }
            }
        }
    }
}

@Composable
private fun KuanReplyImageGroup(card: KuanWebCard) {
    var expanded by remember { mutableStateOf(false) }
    var preview by remember { mutableStateOf<Int?>(null) }
    val uriHandler = LocalUriHandler.current
    val images = card.images
    val count = stringResource(R.string.kuan_web_images, images.size)
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.small,
        color = MaterialTheme.colorScheme.surfaceContainerLow,
    ) {
        Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            if (card.title.isNotBlank()) Text(card.title, style = MaterialTheme.typography.titleSmall)
            ChatMessageFileChip(
                text = count,
                onClick = { expanded = !expanded },
                icon = { Icon(HugeIcons.Image01, contentDescription = null, modifier = Modifier.size(16.dp)) },
            )
            if (expanded) LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                itemsIndexed(images, key = { _, image -> image.url }) { index, image ->
                    Column(Modifier.size(width = 154.dp, height = 170.dp)) {
                        AsyncImage(
                            model = image.thumbnail ?: image.url,
                            contentDescription = image.title.ifBlank { count },
                            modifier = Modifier.size(width = 154.dp, height = 108.dp).clip(MaterialTheme.shapes.small)
                                .clickable { preview = index },
                            contentScale = ContentScale.Fit,
                        )
                        if (image.title.isNotBlank()) Text(
                            image.title,
                            style = MaterialTheme.typography.labelMedium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        image.source?.let { url ->
                            TextButton(onClick = { uriHandler.openUri(url) }) { Text(stringResource(R.string.kuan_web_image_source)) }
                        }
                    }
                }
            }
        }
    }
    preview?.let { selected ->
        ImagePreviewDialog(images.map { it.url }, initialPage = selected) { preview = null }
    }
}
