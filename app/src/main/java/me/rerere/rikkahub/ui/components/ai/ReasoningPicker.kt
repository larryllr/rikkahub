package me.rerere.rikkahub.ui.components.ai

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialShapes
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SheetValue
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.SliderState
import androidx.compose.material3.Text
import androidx.compose.material3.rememberBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.graphics.shapes.RoundedPolygon
import kotlinx.coroutines.flow.drop
import me.rerere.ai.core.ReasoningLevel
import me.rerere.hugeicons.HugeIcons
import me.rerere.hugeicons.stroke.Idea
import me.rerere.hugeicons.stroke.Idea01
import me.rerere.rikkahub.R
import me.rerere.ui.components.ToggleSurface
import me.rerere.ui.icons.ReasoningHigh
import me.rerere.ui.icons.ReasoningLow
import me.rerere.ui.icons.ReasoningMedium
import kotlin.math.roundToInt

private val levels = ReasoningLevel.entries
private data class SliderEffort(val key: String?, val visual: ReasoningLevel, val label: String? = null)

@Composable
fun ReasoningButton(
    modifier: Modifier = Modifier,
    onlyIcon: Boolean = false,
    reasoningLevel: ReasoningLevel,
    onUpdateReasoningLevel: (ReasoningLevel) -> Unit,
    availableLevels: List<ReasoningLevel> = levels,
) {
    val selected = reasoningLevel.takeIf { it in availableLevels } ?: availableLevels.firstOrNull() ?: ReasoningLevel.AUTO
    val options = remember(availableLevels) { availableLevels.map { SliderEffort(it.effort, it) } }
    ReasoningSelector(options, selected.effort, modifier, onlyIcon) { onUpdateReasoningLevel(it.visual) }
}

@Composable
internal fun ManagedReasoningButton(
    efforts: List<String>,
    selection: String?,
    onSelect: (String?) -> Unit,
) {
    val options = remember(efforts) {
        val offered = efforts.filter { it != "auto" }.distinct()
        listOf(SliderEffort(null, ReasoningLevel.AUTO)) + offered.mapIndexed { index, effort ->
            val visual = ReasoningLevel.entries.firstOrNull { it.effort == effort }
                ?: when {
                    index == 0 -> ReasoningLevel.LOW
                    index == offered.lastIndex -> ReasoningLevel.HIGH
                    else -> ReasoningLevel.MEDIUM
                }
            SliderEffort(effort, visual,
                if (visual.effort == effort) null else effort.replace('_', ' ').replaceFirstChar { it.titlecase() })
        }
    }
    if (options.size > 1) ReasoningSelector(options, selection, Modifier, true) { onSelect(it.key) }
}

@Composable
private fun ReasoningSelector(
    options: List<SliderEffort>,
    selection: String?,
    modifier: Modifier,
    onlyIcon: Boolean,
    onSelect: (SliderEffort) -> Unit,
) {
    var showPicker by remember { mutableStateOf(false) }
    val selected = options.firstOrNull { it.key == selection } ?: options.firstOrNull() ?: return
    if (showPicker && options.size > 1) {
        ReasoningSlider(
            options = options,
            selected = selected,
            onDismissRequest = { showPicker = false },
            onSelect = onSelect,
        )
    }

    ToggleSurface(
        checked = selected.visual.isEnabled,
        onClick = { if (options.size > 1) showPicker = true },
        modifier = modifier,
    ) {
        Row(
            modifier = Modifier.padding(vertical = 8.dp, horizontal = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier.size(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(selected.visual.icon(), null)
            }
            if (!onlyIcon) Text(stringResource(R.string.setting_provider_page_reasoning))
        }
    }
}

@Composable
fun ReasoningPicker(
    reasoningLevel: ReasoningLevel,
    onDismissRequest: () -> Unit = {},
    onUpdateReasoningLevel: (ReasoningLevel) -> Unit,
    availableLevels: List<ReasoningLevel> = levels,
) {
    val options = remember(availableLevels) { availableLevels.map { SliderEffort(it.effort, it) } }
    ReasoningSlider(options, SliderEffort(reasoningLevel.effort, reasoningLevel), onDismissRequest) {
        onUpdateReasoningLevel(it.visual)
    }
}

@Composable
private fun ReasoningSlider(
    options: List<SliderEffort>,
    selected: SliderEffort,
    onDismissRequest: () -> Unit,
    onSelect: (SliderEffort) -> Unit,
) {
    val levelCount = options.size
    if (levelCount < 2) return
    val levelShapes = remember(options) { options.map { it.visual.shape() } }
    val currentIndex = options.indexOf(selected).coerceAtLeast(0)
    val sliderState = remember(options) {
        SliderState(
            value = currentIndex.toFloat(),
            trackRange = 0f..(levelCount - 1).toFloat(),
            steps = (levelCount - 2).coerceAtLeast(0),
        )
    }
    val interactionSource = remember { MutableInteractionSource() }
    val hapticFeedback = LocalHapticFeedback.current
    // 拖动过程中就跟随滑块预览，松手后才真正提交
    val index = sliderState.value.roundToInt().coerceIn(0, levelCount - 1)
    val preview = options[index]
    val previewLevel = preview.visual

    LaunchedEffect(currentIndex) {
        sliderState.value = currentIndex.toFloat()
    }

    LaunchedEffect(sliderState) {
        snapshotFlow { sliderState.value.roundToInt() }
            .drop(1)
            .collect { hapticFeedback.performHapticFeedback(HapticFeedbackType.SegmentTick) }
    }

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        sheetState = rememberBottomSheetState(initialValue = SheetValue.Hidden, enabledValues = setOf(SheetValue.Hidden, SheetValue.Expanded)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            PickerValueHeader(
                title = stringResource(R.string.reasoning_picker_title),
                value = index,
                hint = stringResource(R.string.reasoning_picker_hint),
                label = { options[it].label ?: options[it].visual.label() },
            ) {
                // 等级越高形状越「激烈」
                PickerHero(
                    shapes = levelShapes,
                    index = index,
                    icon = previewLevel.icon(),
                    containerColor = when {
                        !previewLevel.isEnabled -> MaterialTheme.colorScheme.surfaceContainerHighest
                        previewLevel >= ReasoningLevel.HIGH -> MaterialTheme.colorScheme.primary
                        else -> MaterialTheme.colorScheme.primaryContainer
                    },
                    contentColor = when {
                        !previewLevel.isEnabled -> MaterialTheme.colorScheme.onSurfaceVariant
                        previewLevel >= ReasoningLevel.HIGH -> MaterialTheme.colorScheme.onPrimary
                        else -> MaterialTheme.colorScheme.onPrimaryContainer
                    },
                )
            }

            Slider(
                state = sliderState,
                onValueChange = { sliderState.value = it },
                onValueChangeFinished = {
                    val snappedIndex = sliderState.value.roundToInt().coerceIn(0, levelCount - 1)
                    sliderState.value = snappedIndex.toFloat()
                    onSelect(options[snappedIndex])
                },
                modifier = Modifier.fillMaxWidth(),
                interactionSource = interactionSource,
                thumb = {
                    SliderDefaults.Thumb(
                        interactionSource = interactionSource,
                        isVertical = false,
                        thumbSize = DpSize(4.dp, 52.dp),
                    )
                },
                track = { sliderState ->
                    SliderDefaults.Track(
                        sliderState = sliderState,
                        trackCornerSize = 12.dp,
                        modifier = Modifier.height(40.dp),
                    )
                }
            )
        }
    }
}

private fun ReasoningLevel.icon(): ImageVector = when (this) {
    ReasoningLevel.OFF -> HugeIcons.Idea
    ReasoningLevel.AUTO -> HugeIcons.Idea01
    ReasoningLevel.LOW -> ReasoningLow
    ReasoningLevel.MEDIUM -> ReasoningMedium
    ReasoningLevel.HIGH -> ReasoningHigh
    ReasoningLevel.XHIGH -> ReasoningHigh
    ReasoningLevel.MAX -> ReasoningHigh
}

private fun ReasoningLevel.shape(): RoundedPolygon = when (this) {
    ReasoningLevel.OFF -> MaterialShapes.Circle
    ReasoningLevel.AUTO -> MaterialShapes.Cookie4Sided
    ReasoningLevel.LOW -> MaterialShapes.Cookie6Sided
    ReasoningLevel.MEDIUM -> MaterialShapes.Cookie7Sided
    ReasoningLevel.HIGH -> MaterialShapes.Cookie9Sided
    ReasoningLevel.XHIGH -> MaterialShapes.Cookie12Sided
    ReasoningLevel.MAX -> MaterialShapes.SoftBurst
}

@Composable
private fun ReasoningLevel.label(): String = when (this) {
    ReasoningLevel.OFF -> stringResource(R.string.reasoning_off)
    ReasoningLevel.AUTO -> stringResource(R.string.reasoning_auto)
    ReasoningLevel.LOW -> stringResource(R.string.reasoning_light)
    ReasoningLevel.MEDIUM -> stringResource(R.string.reasoning_medium)
    ReasoningLevel.HIGH -> stringResource(R.string.reasoning_heavy)
    ReasoningLevel.XHIGH -> stringResource(R.string.reasoning_xhigh)
    ReasoningLevel.MAX -> stringResource(R.string.reasoning_max)
}

@Composable
@Preview(showBackground = true)
private fun ReasoningPickerPreview() {
    MaterialTheme {
        var level by remember { mutableStateOf(ReasoningLevel.AUTO) }
        ReasoningPicker(
            reasoningLevel = level,
            onUpdateReasoningLevel = { level = it }
        )
    }
}
