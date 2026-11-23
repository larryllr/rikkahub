package me.rerere.rikkahub.ui.pages.quickstart

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import me.rerere.rikkahub.R
import me.rerere.rikkahub.Screen
import me.rerere.rikkahub.data.kuan.KuanSession
import me.rerere.rikkahub.ui.context.LocalNavController
import org.koin.compose.koinInject

@Composable
fun QuickStartCard(modifier: Modifier = Modifier) {
    val navController = LocalNavController.current
    val session by koinInject<KuanSession>().state.collectAsStateWithLifecycle()
    QuickStartHeroCard(
        title = stringResource(R.string.kuan_app_name),
        icon = {
            Image(
                painter = painterResource(R.drawable.kuan_logo),
                contentDescription = null,
                modifier = Modifier.size(40.dp).clip(MaterialTheme.shapes.small),
            )
        },
        modifier = modifier,
    ) {
        Column(
            modifier = Modifier.align(Alignment.End),
            horizontalAlignment = Alignment.End,
        ) {
            Button(onClick = { navController.navigate(Screen.KuanAccount) }) {
                val label = if (session.profile == null) R.string.kuan_sign_in_action else R.string.kuan_account
                Text(stringResource(label))
            }
            TextButton(onClick = { navController.navigate(Screen.QuickStart) }) {
                Text(stringResource(R.string.kuan_custom_setup))
            }
        }
    }
}
