package me.rerere.rikkahub.ui.pages.setting

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.LargeFlexibleTopAppBar
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.kuan.KUAN_ORIGIN
import me.rerere.rikkahub.data.kuan.KuanAdminGroups
import me.rerere.rikkahub.data.kuan.KuanAuthPolicy
import me.rerere.rikkahub.data.kuan.KuanCatalog
import me.rerere.rikkahub.data.kuan.KuanOperations
import me.rerere.rikkahub.data.kuan.KuanSession
import me.rerere.rikkahub.data.kuan.kuanUiMessage
import me.rerere.rikkahub.data.kuan.string
import me.rerere.rikkahub.ui.components.nav.BackButton
import me.rerere.rikkahub.ui.components.ui.CardGroup
import me.rerere.rikkahub.ui.theme.CustomColors
import me.rerere.rikkahub.utils.openUrl
import me.rerere.rikkahub.utils.plus
import org.koin.compose.koinInject

@Composable
internal fun KuanAccountPage() {
    val session = koinInject<KuanSession>()
    val catalog = koinInject<KuanCatalog>()
    val operations = koinInject<KuanOperations>()
    val state by session.state.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val profile = state.profile
    val scroll = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var policy by remember { mutableStateOf<KuanAuthPolicy?>(null) }
    var policyLoading by remember { mutableStateOf(false) }
    var usage by remember(profile?.scope) { mutableStateOf<JsonObject?>(null) }
    var adminStats by remember(profile?.scope) { mutableStateOf<JsonObject?>(null) }
    var adminGroups by remember(profile?.scope) { mutableStateOf<KuanAdminGroups?>(null) }
    var draft by remember(profile?.scope) { mutableStateOf(emptySet<Long>()) }
    var confirm by remember { mutableStateOf(false) }

    fun run(action: suspend () -> Unit) {
        if (busy) return
        busy = true
        error = null
        scope.launch {
            try {
                action()
            } catch (cause: CancellationException) {
                throw cause
            } catch (cause: Exception) {
                error = cause.kuanUiMessage()
            } finally {
                busy = false
            }
        }
    }

    LaunchedEffect(profile?.scope, state.loading) {
        if (state.loading) return@LaunchedEffect
        if (profile == null) {
            policyLoading = true
            try {
                policy = session.policy()
            } catch (cause: CancellationException) {
                throw cause
            } catch (cause: Exception) {
                error = cause.kuanUiMessage()
            } finally {
                policyLoading = false
            }
        } else {
            run { usage = operations.usage() }
        }
    }

    Scaffold(
        modifier = Modifier.nestedScroll(scroll.nestedScrollConnection),
        containerColor = CustomColors.topBarColors.containerColor,
        topBar = {
            LargeFlexibleTopAppBar(
                title = { Text(stringResource(R.string.kuan_account)) },
                navigationIcon = { BackButton() },
                scrollBehavior = scroll,
                colors = CustomColors.topBarColors,
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
            LazyColumn(
                modifier = Modifier.widthIn(max = 660.dp).fillMaxSize(),
                contentPadding = padding + PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                if (busy || state.loading || policyLoading) {
                    item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
                }
                error?.let { errorText ->
                    item { Text(errorText, color = MaterialTheme.colorScheme.error) }
                }
                if (state.loading) return@LazyColumn
                if (profile == null) {
                    item {
                        KuanAuthForm(
                            policy = policy,
                            busy = busy || policyLoading,
                            session = session,
                            run = ::run,
                            onWebsite = { context.openUrl("$KUAN_ORIGIN/login") },
                            onReload = { run { policy = session.policy() } },
                        )
                    }
                } else {
                    item {
                        CardGroup {
                            item(
                                supportingContent = if (profile.admin) {
                                    { Text(stringResource(R.string.kuan_admin)) }
                                } else null,
                                headlineContent = { Text(profile.email, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                            )
                            item(onClick = { run { session.signOut() } }) { Text(stringResource(R.string.kuan_sign_out)) }
                        }
                    }
                    item {
                        CardGroup(title = { Text(stringResource(R.string.kuan_dashboard)) }) {
                            profile.balance?.let { balance ->
                                item(trailingContent = { Text(balance) }) { Text(stringResource(R.string.kuan_balance)) }
                            }
                            dashboardRows(usage, isAdmin = false)
                            item(onClick = { run { usage = operations.usage() } }) {
                                Text(stringResource(R.string.kuan_refresh))
                            }
                        }
                    }
                    if (profile.admin) {
                        item {
                            CardGroup(title = { Text(stringResource(R.string.kuan_admin)) }) {
                                dashboardRows(adminStats, isAdmin = true)
                                item(onClick = {
                                    run {
                                        adminStats = operations.adminStats()
                                        val groups = operations.adminGroups()
                                        adminGroups = groups
                                        draft = groups.configured
                                    }
                                }) { Text(stringResource(R.string.kuan_load_admin)) }
                            }
                        }
                        adminGroups?.let { groups ->
                            item {
                                CardGroup(title = { Text(stringResource(R.string.kuan_visible_groups)) }) {
                                    item(
                                        onClick = { draft = emptySet() },
                                        trailingContent = { Checkbox(draft.isEmpty(), onCheckedChange = null) },
                                    ) { Text(stringResource(R.string.kuan_all_allowed_groups)) }
                                    groups.available.forEach { group ->
                                        item(
                                            onClick = { draft = if (group.id in draft) draft - group.id else draft + group.id },
                                            supportingContent = { Text(group.platform, maxLines = 1) },
                                            trailingContent = { Checkbox(group.id in draft, onCheckedChange = null) },
                                        ) { Text(group.name) }
                                    }
                                    formItem {
                                        Button(enabled = !busy && draft != groups.configured, onClick = { confirm = true }) {
                                            Text(stringResource(R.string.kuan_save))
                                        }
                                    }
                                }
                            }
                        }
                        item(key = "kuanWebOperations") { KuanAdminTools(operations) }
                    }
                }
                item { KuanUpdateGroup() }
            }
        }
    }

    if (confirm && profile?.admin == true) {
        AlertDialog(
            onDismissRequest = { confirm = false },
            title = { Text(stringResource(R.string.kuan_visible_groups)) },
            text = { Text(if (draft.isEmpty()) stringResource(R.string.kuan_all_allowed_groups) else
                adminGroups?.available.orEmpty().filter { it.id in draft }.joinToString(", ") { it.name }) },
            confirmButton = {
                TextButton(onClick = {
                    val requested = draft
                    confirm = false
                    run {
                        val verified = operations.saveAdminGroups(requested)
                        adminGroups = adminGroups?.copy(configured = verified)
                        draft = verified
                        catalog.refresh(force = true)
                    }
                }) { Text(stringResource(R.string.kuan_save)) }
            },
            dismissButton = { TextButton(onClick = { confirm = false }) { Text(stringResource(android.R.string.cancel)) } },
        )
    }
}

private fun me.rerere.rikkahub.ui.components.ui.CardGroupScope.dashboardRows(data: JsonObject?, isAdmin: Boolean) {
    val rows = if (isAdmin) listOf(
        "total_users" to R.string.kuan_users,
        "total_accounts" to R.string.kuan_accounts,
        "today_requests" to R.string.kuan_today_requests,
    ) else listOf(
        "today_requests" to R.string.kuan_today_requests,
        "today_actual_cost" to R.string.kuan_today_cost,
        "total_requests" to R.string.kuan_total_requests,
        "total_actual_cost" to R.string.kuan_total_cost,
    )
    rows.forEach { (key, title) ->
        data?.string(key)?.takeIf { it.matches(Regex("[0-9.Ee+\\-]{1,40}")) }?.let { value ->
            item(trailingContent = { Text(value) }) { Text(stringResource(title)) }
        }
    }
}

@Composable
private fun KuanAuthForm(
    policy: KuanAuthPolicy?,
    busy: Boolean,
    session: KuanSession,
    run: (suspend () -> Unit) -> Unit,
    onWebsite: () -> Unit,
    onReload: () -> Unit,
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var invite by remember { mutableStateOf("") }
    var promo by remember { mutableStateOf("") }
    var register by remember { mutableStateOf(false) }
    var totp by remember { mutableStateOf(false) }
    var verificationSent by remember { mutableStateOf(false) }
    CardGroup {
        if (policy == null) {
            item(onClick = onReload) { Text(stringResource(R.string.kuan_refresh)) }
        } else if (policy.externalChallenge || policy.agreement) {
            item(onClick = onWebsite) { Text(stringResource(R.string.kuan_verify_on_site)) }
        } else formItem {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (!totp) {
                    OutlinedTextField(
                        email, { email = it; verificationSent = false },
                        label = { Text(stringResource(R.string.kuan_email)) },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true, enabled = !busy,
                    )
                    OutlinedTextField(
                        password, { password = it },
                        label = { Text(stringResource(R.string.kuan_password)) },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        singleLine = true, enabled = !busy,
                    )
                }
                if (totp || register && policy.verifyEmail) {
                    OutlinedTextField(
                        code, { code = it.filter(Char::isDigit).take(8) },
                        label = { Text(stringResource(R.string.kuan_code)) },
                        modifier = Modifier.fillMaxWidth(), enabled = !busy,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                    )
                    if (!totp) {
                        TextButton(
                            enabled = !busy && !verificationSent && email.isNotBlank(),
                            onClick = { run { session.sendVerification(email.trim()); verificationSent = true } },
                        ) { Text(stringResource(if (verificationSent) R.string.kuan_code_sent else R.string.kuan_send_code)) }
                    }
                }
                if (!totp && register && policy.invitation) {
                    OutlinedTextField(invite, { invite = it }, label = { Text(stringResource(R.string.kuan_invitation)) },
                        modifier = Modifier.fillMaxWidth(), singleLine = true, enabled = !busy)
                }
                if (!totp && register && policy.promo) {
                    OutlinedTextField(promo, { promo = it }, label = { Text(stringResource(R.string.kuan_promo)) },
                        modifier = Modifier.fillMaxWidth(), singleLine = true, enabled = !busy)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    val valid = when {
                        totp -> code.length == 6
                        email.isBlank() || password.isEmpty() -> false
                        register && (password.length < 6 || policy.verifyEmail && code.isBlank() || policy.invitation && invite.isBlank()) -> false
                        else -> true
                    }
                    Button(
                        enabled = valid && !busy,
                        onClick = {
                            run {
                                if (totp) {
                                    session.finishTotp(code)
                                    code = ""
                                    totp = false
                                } else {
                                    totp = if (register) session.register(email.trim(), password, code, invite, promo)
                                    else session.signIn(email.trim(), password)
                                    password = ""
                                }
                            }
                        },
                    ) { Text(stringResource(if (totp) R.string.kuan_verify else if (register) R.string.kuan_register else R.string.kuan_sign_in)) }
                    if (totp || policy.registration) {
                        TextButton(enabled = !busy, onClick = {
                            if (totp) totp = false else register = !register
                            password = ""
                            code = ""
                        }) { Text(stringResource(if (totp || register) R.string.kuan_sign_in else R.string.kuan_register)) }
                    }
                }
            }
        }
    }
}
