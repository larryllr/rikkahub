import {
  extractKuanRichInteractions,
  normalizeKuanRichDisplayText,
  normalizeKuanRichHistoryText,
} from './web-presentation.mjs';

export function project(source, selections = {}, streaming = false) {
  const groups = streaming ? [] : extractKuanRichInteractions(source, selections);
  const history = streaming ? null : normalizeKuanRichHistoryText(source);
  const text = streaming || groups.length
    ? normalizeKuanRichDisplayText(source, null, streaming)
    : history;
  return { text, groups, history };
}
