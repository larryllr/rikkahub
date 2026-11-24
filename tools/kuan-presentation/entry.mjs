import {
  extractKuanRichInteractions,
  normalizeKuanRichDisplayText,
  normalizeKuanRichHistoryText,
  splitKuanRichCitationSection,
} from './web-presentation.mjs';

export function project(source, selections = {}, streaming = false, plain = false) {
  const groups = streaming || plain ? [] : extractKuanRichInteractions(source, selections);
  const history = streaming ? null : plain ? source : normalizeKuanRichHistoryText(source);
  const visible = !plain && (streaming || groups.length)
    ? normalizeKuanRichDisplayText(source, null, streaming)
    : history ?? source;
  if (streaming) return { text: visible, groups, history, links: [] };
  const { body, links } = splitKuanRichCitationSection(visible);
  return { text: body, groups, history, links };
}
