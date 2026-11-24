package me.rerere.rikkahub.ui.pages.chat

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.CancellationException
import me.rerere.ai.provider.Model
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.kuan.KuanCatalog
import me.rerere.rikkahub.data.kuan.KuanRoute
import me.rerere.rikkahub.data.kuan.kuanUiMessage
import org.koin.compose.koinInject

@Composable
internal fun KuanChatImageDialog(
    route: KuanRoute,
    onDismiss: () -> Unit,
    onSubmit: (model: String, prompt: String) -> Unit,
) {
    val catalog: KuanCatalog = koinInject()
    val defaultPrompt = stringResource(R.string.kuan_chat_image_prompt)
    var prompt by rememberSaveable { mutableStateOf(defaultPrompt) }
    var models by remember { mutableStateOf<List<Model>?>(null) }
    var selected by remember { mutableStateOf<Model?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var modelMenu by remember { mutableStateOf(false) }
    LaunchedEffect(route) {
        try {
            val found = catalog.imageModels(route.scope, route.groupId)
            models = found
            selected = found.firstOrNull()
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (failure: Exception) {
            error = failure.kuanUiMessage()
        }
    }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.kuan_chat_image)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = prompt,
                    onValueChange = { if (it.length <= 12_000) prompt = it },
                    label = { Text(stringResource(R.string.kuan_chat_image_instruction)) },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 5,
                )
                when {
                    error != null -> Text(error.orEmpty(), color = MaterialTheme.colorScheme.error)
                    models == null -> CircularProgressIndicator()
                    models.isNullOrEmpty() -> Text(stringResource(R.string.kuan_chat_image_no_models))
                    else -> Box {
                        OutlinedButton(onClick = { modelMenu = true }) {
                            Text(selected?.displayName.orEmpty(), maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                        DropdownMenu(expanded = modelMenu, onDismissRequest = { modelMenu = false }) {
                            models.orEmpty().forEach { item ->
                                DropdownMenuItem(
                                    text = { Text(item.displayName, maxLines = 2, overflow = TextOverflow.Ellipsis) },
                                    onClick = { selected = item; modelMenu = false },
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                enabled = selected != null && prompt.isNotBlank(),
                onClick = { selected?.let { onSubmit(it.modelId, prompt.trim()) } },
            ) { Text(stringResource(R.string.kuan_chat_image_send)) }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) } },
    )
}
