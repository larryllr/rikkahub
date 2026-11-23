package me.rerere.rikkahub.ui.components.ai

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.kuan.KuanCatalogState

@Composable
internal fun KuanModelControl(
    signedIn: Boolean,
    state: KuanCatalogState?,
    onAccount: () -> Unit,
    onGroup: (Long) -> Unit,
    onRefresh: () -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxWidth().padding(horizontal = 8.dp)) {
        if (!signedIn) {
            TextButton(onClick = onAccount) { Text(stringResource(R.string.kuan_sign_in_action)) }
        } else {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Box(Modifier.weight(1f)) {
                    val name = state?.groups?.firstOrNull { it.id == state.groupId }?.name
                    TextButton(
                        onClick = { expanded = true },
                        enabled = !state?.groups.isNullOrEmpty() && state?.busy != true,
                    ) {
                        Text(
                            text = name?.let { stringResource(R.string.kuan_group_name, it) }
                                ?: stringResource(R.string.kuan_group),
                            maxLines = 1, overflow = TextOverflow.Ellipsis,
                        )
                    }
                    DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                        state?.groups.orEmpty().forEach { group ->
                            DropdownMenuItem(
                                text = { Text(group.name, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                                onClick = { expanded = false; onGroup(group.id) },
                            )
                        }
                    }
                }
                TextButton(enabled = state?.busy != true, onClick = onRefresh) { Text(stringResource(R.string.kuan_refresh)) }
            }
            if (state?.busy == true) LinearProgressIndicator(Modifier.fillMaxWidth())
            else if (state?.error != null) Text(state.error, color = MaterialTheme.colorScheme.error)
            else if (state?.groups?.isEmpty() == true) Text(stringResource(R.string.kuan_no_group))
        }
    }
}
