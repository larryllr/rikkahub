package me.rerere.rikkahub.ui.pages.setting

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.kuan.KuanBilling
import me.rerere.rikkahub.data.kuan.KuanBillingPrice
import me.rerere.rikkahub.data.kuan.KuanOperations
import me.rerere.rikkahub.data.kuan.KuanWebAccount
import me.rerere.rikkahub.data.kuan.KuanWebAccounts
import me.rerere.rikkahub.data.kuan.kuanUiMessage
import me.rerere.rikkahub.ui.components.ui.CardGroup

@Composable
internal fun KuanAdminTools(operations: KuanOperations) {
    var accounts by remember { mutableStateOf<KuanWebAccounts?>(null) }
    var billing by remember { mutableStateOf<KuanBilling?>(null) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var selected by remember { mutableStateOf<KuanWebAccount?>(null) }
    val scope = rememberCoroutineScope()

    fun run(block: suspend () -> Unit) {
        if (busy) return
        busy = true
        error = null
        scope.launch {
            try {
                block()
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                error = e.kuanUiMessage()
            } finally {
                busy = false
            }
        }
    }

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
        if (busy) LinearProgressIndicator(Modifier.fillMaxWidth())
        CardGroup(title = { Text(stringResource(R.string.kuan_web_accounts)) }) {
            item(onClick = if (busy) null else ({ run { accounts = operations.webAccounts() } })) {
                Text(stringResource(R.string.kuan_refresh))
            }
            accounts?.accounts?.forEach { account ->
                item(
                    onClick = if (busy) null else ({ selected = account }),
                    supportingContent = {
                        Text(stringResource(R.string.kuan_web_active, account.activeRequests) +
                            if (account.eligible) "" else " · " + stringResource(R.string.kuan_web_unavailable))
                    },
                    trailingContent = {
                        Switch(checked = account.enabled, onCheckedChange = null, enabled = !busy)
                    },
                ) {
                    Text(stringResource(R.string.kuan_web_account, account.id, account.plan), maxLines = 1,
                        overflow = TextOverflow.Ellipsis)
                }
            }
        }
        CardGroup(title = { Text(stringResource(R.string.kuan_web_pricing)) }) {
            item(onClick = if (busy) null else ({ run { billing = operations.billing() } })) {
                Text(stringResource(R.string.kuan_refresh))
            }
            billing?.let { current ->
                formItem {
                    KuanPriceEditor(current, enabled = !busy) { model, effort, price ->
                        run { billing = operations.savePrice(current, model, effort, price) }
                    }
                }
            }
        }
    }
    selected?.let { account ->
        AlertDialog(
            onDismissRequest = { selected = null },
            title = { Text(stringResource(if (account.enabled) R.string.kuan_web_disable else R.string.kuan_web_enable, account.id)) },
            confirmButton = {
                TextButton(onClick = {
                    val current = accounts
                    selected = null
                    if (current != null) run { accounts = operations.setWebAccount(current, account.id, !account.enabled) }
                }) { Text(stringResource(R.string.confirm)) }
            },
            dismissButton = {
                TextButton(onClick = { selected = null }) { Text(stringResource(R.string.cancel)) }
            },
        )
    }
}

@Composable
private fun KuanPriceEditor(
    current: KuanBilling,
    enabled: Boolean,
    onSave: (String, String, KuanBillingPrice) -> Unit,
) {
    var selected by remember { mutableStateOf("") }
    var effort by remember(selected) { mutableStateOf("") }
    val model = current.models.firstOrNull { it.id == selected }
    val price = remember(selected, effort, current.revision) { model?.let { current.price(selected, effort) } }
    var multiplier by remember(price, selected, effort) { mutableStateOf(price?.multiplier.orEmpty()) }
    var minimum by remember(price, selected, effort) { mutableStateOf(price?.minimum.orEmpty()) }

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        KuanPriceChoice(
            label = model?.name ?: stringResource(R.string.kuan_price_model),
            values = current.models.map { it.id to it.name },
            enabled = enabled,
            onSelect = { selected = it },
        )
        if (model != null) {
            val all = stringResource(R.string.kuan_price_all_efforts)
            KuanPriceChoice(
                label = effort.ifBlank { all },
                values = listOf("" to all) + model.efforts.map { it to it },
                enabled = enabled,
                onSelect = { effort = it },
            )
            OutlinedTextField(
                multiplier, { multiplier = it.take(16) },
                label = { Text(stringResource(R.string.kuan_price_multiplier)) },
                enabled = enabled, singleLine = true, modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            )
            OutlinedTextField(
                minimum, { minimum = it.take(16) },
                label = { Text(stringResource(R.string.kuan_price_minimum)) },
                enabled = enabled, singleLine = true, modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            )
            Button(
                enabled = enabled && multiplier.isNotBlank() && minimum.isNotBlank() &&
                    price != KuanBillingPrice(multiplier, minimum),
                onClick = { onSave(model.id, effort, KuanBillingPrice(multiplier, minimum)) },
            ) { Text(stringResource(R.string.kuan_save)) }
        }
    }
}

@Composable
private fun KuanPriceChoice(
    label: String,
    values: List<Pair<String, String>>,
    enabled: Boolean,
    onSelect: (String) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    Box {
        TextButton(enabled = enabled && values.isNotEmpty(), onClick = { expanded = true }) {
            Text(label, maxLines = 2, overflow = TextOverflow.Ellipsis)
        }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            values.forEach { (value, name) ->
                DropdownMenuItem(text = { Text(name) }, onClick = { expanded = false; onSelect(value) })
            }
        }
    }
}
