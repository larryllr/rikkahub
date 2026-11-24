import {
  extractKuanRichInteractions,
  normalizeKuanRichHistoryText,
  projectKuanNativeImages,
  splitKuanRichCitationSection,
} from './web-presentation.mjs';

export function project(source, selections = {}, streaming = false, plain = false, images = []) {
  const groups = streaming || plain ? [] : extractKuanRichInteractions(source, selections);
  const history = streaming ? null : plain ? source : normalizeKuanRichHistoryText(source);
  const { text: visible, placed } = plain
    ? { text: source, placed: new Map() }
    : projectKuanNativeImages(source, images, streaming, groups.length > 0);
  const inlineImages = body => [...placed].filter(([, image]) => body.includes(image)).map(([url]) => url);
  if (streaming) return { text: visible, groups, history, links: [], inlineImages: inlineImages(visible) };
  const { body, links } = splitKuanRichCitationSection(visible);
  return { text: body, groups, history, links, inlineImages: inlineImages(body) };
}
