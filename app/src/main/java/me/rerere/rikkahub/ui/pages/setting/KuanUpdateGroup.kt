package me.rerere.rikkahub.ui.pages.setting

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import me.rerere.rikkahub.BuildConfig
import me.rerere.rikkahub.R
import me.rerere.rikkahub.ui.components.ui.CardGroup
import me.rerere.rikkahub.utils.DownloadState
import me.rerere.rikkahub.utils.UiState
import me.rerere.rikkahub.utils.UpdateChecker
import org.koin.compose.koinInject

@Composable
internal fun KuanUpdateGroup() {
    if (BuildConfig.IS_PLAY_STORE) return
    val checker = koinInject<UpdateChecker>()
    val result by checker.updateState.collectAsStateWithLifecycle()
    val download by checker.updates.collectAsStateWithLifecycle()
    val context = LocalContext.current
    CardGroup(title = { Text(stringResource(R.string.kuan_update)) }) {
        item(
            onClick = if (checker.configured) ({ checker.refresh() }) else null,
            trailingContent = { Text(BuildConfig.VERSION_NAME) },
        ) { Text(stringResource(if (checker.configured) R.string.kuan_check_update else R.string.kuan_no_update_channel)) }
        if (checker.configured) {
            when (val state = result) {
                is UiState.Loading -> formItem { LinearProgressIndicator(Modifier.fillMaxWidth()) }
                is UiState.Error -> item { Text(stringResource(R.string.kuan_update_failed)) }
                is UiState.Success -> {
                    if (state.data.versionCode <= BuildConfig.VERSION_CODE.toLong()) {
                        item { Text(stringResource(R.string.kuan_latest)) }
                    } else if (state.data.downloads.isEmpty()) {
                        item { Text(stringResource(R.string.kuan_no_compatible_update)) }
                    } else {
                        state.data.downloads.forEach { entry ->
                            item(onClick = { checker.downloadUpdate(context, entry) }) {
                                Text(stringResource(R.string.kuan_download_update, state.data.version, entry.abi))
                            }
                        }
                    }
                }
                else -> Unit
            }
        }
        when (val state = download) {
            is DownloadState.Downloading -> formItem { LinearProgressIndicator(progress = { state.progress }, modifier = Modifier.fillMaxWidth()) }
            DownloadState.PermissionNeeded -> item { Text(stringResource(R.string.kuan_update_permission)) }
            DownloadState.Failed -> item { Text(stringResource(R.string.kuan_update_failed)) }
            DownloadState.Ready -> item { Text(stringResource(R.string.kuan_update_ready)) }
            else -> Unit
        }
    }
}
