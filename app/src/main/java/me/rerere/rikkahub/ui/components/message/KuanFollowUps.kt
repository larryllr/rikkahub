package me.rerere.rikkahub.ui.components.message

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import me.rerere.ai.ui.UIMessagePart
import me.rerere.hugeicons.HugeIcons
import me.rerere.hugeicons.stroke.ArrowDown01
import me.rerere.rikkahub.R
import me.rerere.rikkahub.data.kuan.array
import me.rerere.rikkahub.data.kuan.kuanFormGroups
import me.rerere.rikkahub.data.kuan.kuanFormSource
import me.rerere.rikkahub.data.kuan.obj
import me.rerere.rikkahub.data.kuan.projectKuanPresentation
import me.rerere.rikkahub.data.kuan.string

@Composable
internal fun KuanFollowUps(part: UIMessagePart.Text, onAnswer: ((String) -> Unit)?) {
    val source = remember(part.metadata) { part.kuanFormSource() } ?: return
    val groups = remember(part.metadata) { part.kuanFormGroups() }
    if (groups.isEmpty()) return
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val selections = remember(source) { mutableStateMapOf<String, JsonPrimitive>() }
    var resolving by remember(source) { mutableStateOf(false) }
    var unresolved by remember(source) { mutableStateOf(false) }
    val currentAnswer by rememberUpdatedState(onAnswer)
    val enabled = onAnswer != null && !resolving

    Column(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        for (group in groups) {
            val groupId = group.string("id") ?: continue
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                val question = group.string("question").orEmpty()
                if (question.isNotBlank()) {
                    Text(
                        text = question,
                        style = MaterialTheme.typography.titleSmall,
                        modifier = Modifier.semantics { heading() },
                    )
                }
                val fields = group.array("fields").orEmpty().filterIsInstance<JsonObject>()
                for ((key, choices) in fields.groupBy { it.string("key") }) {
                    if (key == null) continue
                    val field = choices.first()
                    val value = selections[key] ?: field["value"] as? JsonPrimitive
                    FollowUpField(field, choices, value, enabled) {
                        selections[key] = it
                        unresolved = false
                    }
                }
                val buttons = group.array("buttons").orEmpty().filterIsInstance<JsonObject>()
                if (buttons.isNotEmpty()) FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    for (button in buttons) {
                        val label = button.string("label") ?: continue
                        val actionId = button.string("id") ?: continue
                        FilledTonalButton(
                            enabled = enabled,
                            onClick = {
                                if (currentAnswer == null || resolving) return@FilledTonalButton
                                resolving = true
                                unresolved = false
                                val selected = JsonObject(selections.toMap())
                                scope.launch {
                                    try {
                                        val prompt = if (selected.isEmpty()) button.string("prompt") else {
                                            projectKuanPresentation(context, source, selected)?.array("groups").orEmpty()
                                                .filterIsInstance<JsonObject>().firstOrNull { it.string("id") == groupId }
                                                ?.array("buttons").orEmpty().filterIsInstance<JsonObject>()
                                                .firstOrNull { it.string("id") == actionId }?.string("prompt")
                                        }
                                        if (prompt.isNullOrBlank()) unresolved = true else currentAnswer?.invoke(prompt)
                                    } finally {
                                        resolving = false
                                    }
                                }
                            },
                        ) { Text(label) }
                    }
                }
            }
        }
        if (unresolved) {
            Text(
                stringResource(R.string.kuan_follow_up_unresolved),
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
            )
        }
    }
}

@Composable
private fun FollowUpField(
    field: JsonObject,
    choices: List<JsonObject>,
    value: JsonPrimitive?,
    enabled: Boolean,
    onChange: (JsonPrimitive) -> Unit,
) {
    val label = field.string("label").orEmpty()
    when (field.string("kind")) {
        "select" -> {
            val options = field.array("options").orEmpty().filterIsInstance<JsonObject>()
            val displayValue = options.firstOrNull { (it["value"] as? JsonPrimitive)?.content == value?.content }
                ?.string("label") ?: value?.contentOrNull?.takeIf { it.isNotBlank() }
                ?: stringResource(R.string.kuan_follow_up_select)
            if (label.isNotBlank()) Text(label, style = MaterialTheme.typography.bodyMedium)
            var expanded by remember { mutableStateOf(false) }
            Box {
                OutlinedButton(onClick = { expanded = true }, enabled = enabled) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(displayValue, modifier = Modifier.weight(1f, fill = false))
                        Icon(HugeIcons.ArrowDown01, contentDescription = null)
                    }
                }
                DropdownMenu(expanded = enabled && expanded, onDismissRequest = { expanded = false }) {
                    for (option in options) {
                        val choice = option["value"] as? JsonPrimitive ?: continue
                        val caption = option.string("label") ?: continue
                        DropdownMenuItem(text = { Text(caption) }, onClick = {
                            expanded = false
                            onChange(choice)
                        })
                    }
                }
            }
        }
        "radio" -> {
            if (label.isNotBlank()) Text(label, style = MaterialTheme.typography.bodyMedium)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                for (item in choices) {
                    val option = item.obj("option") ?: continue
                    val choice = option["value"] as? JsonPrimitive ?: continue
                    val caption = option.string("label") ?: continue
                    FilterChip(
                        selected = choice.content == value?.content,
                        onClick = { onChange(choice) },
                        label = { Text(caption) },
                        enabled = enabled,
                    )
                }
            }
        }
        "checkbox" -> {
            val checked = value?.booleanOrNull == true
            Row(
                modifier = Modifier.toggleable(checked, enabled = enabled, role = Role.Checkbox) { onChange(JsonPrimitive(it)) }
                    .padding(horizontal = 4.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Checkbox(checked = checked, onCheckedChange = null, enabled = enabled)
                if (label.isNotBlank()) Text(label)
            }
        }
        "text", "textarea" -> OutlinedTextField(
            value = value?.contentOrNull.orEmpty(),
            onValueChange = { if (it.length <= 500) onChange(JsonPrimitive(it)) },
            modifier = Modifier.fillMaxWidth(),
            enabled = enabled,
            label = if (label.isBlank()) null else { { Text(label) } },
            singleLine = field.string("kind") == "text",
            maxLines = if (field.string("kind") == "text") 1 else 5,
        )
    }
}
