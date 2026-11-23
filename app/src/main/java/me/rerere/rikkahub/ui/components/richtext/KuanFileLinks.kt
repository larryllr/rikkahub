package me.rerere.rikkahub.ui.components.richtext

import android.net.Uri
import android.content.Intent
import androidx.core.content.FileProvider
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.UriHandler
import androidx.compose.ui.res.stringResource
import androidx.core.net.toUri
import java.io.IOException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.kuan.KuanFileLink
import me.rerere.rikkahub.data.kuan.KuanFiles
import me.rerere.rikkahub.data.kuan.SavedKuanFile
import me.rerere.rikkahub.data.kuan.kuanFileLink
import me.rerere.rikkahub.data.kuan.kuanUiMessage
import me.rerere.rikkahub.ui.context.LocalToaster
import me.rerere.ui.toast.ToastType
import org.koin.compose.koinInject

@Composable
internal fun KuanFileLinks(content: @Composable () -> Unit) {
    val delegate = LocalUriHandler.current
    val context = LocalContext.current
    val toaster = LocalToaster.current
    val scope = rememberCoroutineScope()
    val files = koinInject<KuanFiles>()
    var selected by remember { mutableStateOf<KuanFileLink.Owned?>(null) }
    var saved by remember { mutableStateOf<SavedKuanFile?>(null) }
    var busy by remember { mutableStateOf(false) }
    var failure by remember { mutableStateOf<String?>(null) }
    val export = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/octet-stream")) { uri: Uri? ->
        val source = saved?.file
        if (uri != null && source != null) scope.launch {
            try {
                withContext(Dispatchers.IO) {
                    val out = context.contentResolver.openOutputStream(uri)
                        ?: throw IOException("Destination is unavailable")
                    out.use { output -> source.inputStream().use { it.copyTo(output) } }
                }
                toaster.show(context.getString(R.string.kuan_file_saved), type = ToastType.Success)
            } catch (cause: CancellationException) {
                throw cause
            } catch (_: Exception) {
                toaster.show(context.getString(R.string.kuan_file_save_failed), type = ToastType.Error)
            }
        }
    }
    val handler = remember(delegate, toaster, context, scope, files) { object : UriHandler {
        override fun openUri(uri: String) {
            when (val link = kuanFileLink(uri)) {
                null -> delegate.openUri(uri)
                KuanFileLink.Unshared -> toaster.show(context.getString(R.string.kuan_file_not_shared), type = ToastType.Error)
                is KuanFileLink.Owned -> {
                    selected = link
                    saved = null
                    failure = null
                    scope.launch {
                        val cached = files.cached(link)
                        if (selected == link && !busy && saved == null) saved = cached
                    }
                }
            }
        }
    } }
    CompositionLocalProvider(LocalUriHandler provides handler, content = content)

    val link = selected ?: return
    val output = saved
    AlertDialog(
        onDismissRequest = { if (!busy) selected = null },
        title = { Text(output?.name ?: link.fileName.ifBlank { stringResource(R.string.kuan_attachment) }) },
        text = when {
            busy -> ({ LinearProgressIndicator() })
            failure != null -> ({ Text(failure.orEmpty()) })
            else -> null
        },
        confirmButton = {
            if (output != null) {
                TextButton(onClick = {
                    try {
                        val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", output.file)
                        val intent = Intent(Intent.ACTION_VIEW).setDataAndType(uri, output.mime)
                            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        context.startActivity(Intent.createChooser(intent, null))
                    } catch (_: Exception) {
                        toaster.show(context.getString(R.string.kuan_file_save_failed), type = ToastType.Error)
                    }
                }) {
                    Text(stringResource(R.string.kuan_open_file))
                }
            } else {
                TextButton(enabled = !busy, onClick = {
                    busy = true
                    failure = null
                    scope.launch {
                        try {
                            saved = files.save(link)
                        } catch (cause: CancellationException) {
                            throw cause
                        } catch (cause: Exception) {
                            failure = cause.kuanUiMessage()
                        } finally {
                            busy = false
                        }
                    }
                }) { Text(stringResource(R.string.kuan_download_file)) }
            }
        },
        dismissButton = {
            if (output != null) {
                TextButton(onClick = { export.launch(output.name) }) { Text(stringResource(R.string.kuan_save_as)) }
            } else {
                TextButton(enabled = !busy, onClick = { selected = null }) { Text(stringResource(android.R.string.cancel)) }
            }
        },
    )
}
