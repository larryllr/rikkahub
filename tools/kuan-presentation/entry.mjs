import {
  extractKuanRichInteractions,
  mapKuanRichProse,
  normalizeKuanRichHistoryText,
  projectKuanNativeImages,
  splitKuanRichCitationSection,
} from './web-presentation.mjs';
import { nativeProtocol } from './native-protocol.mjs';

export function project(source, selections = {}, streaming = false, plain = false, images = [], presentation = null) {
  const protocol = nativeProtocol(presentation, streaming, images);
  const input = plain && !presentation ? source : mapKuanRichProse(source, protocol.rewrite);
  const fullLayout = !plain && source.length <= 256 * 1024;
  const groups = streaming || !fullLayout ? [] : extractKuanRichInteractions(input, selections);
  const { text: visible, placed } = plain
    ? { text: input, placed: new Map() }
    : projectKuanNativeImages(input, images, streaming, groups.length > 0);
  const inlineImages = body => [...placed].filter(([, image]) => body.includes(image)).map(([url]) => url);
  const section = streaming ? { body: visible, links: [] } : splitKuanRichCitationSection(visible);
  const { text, blocks } = protocol.extract(section.body);
  const history = streaming ? null : plain ? source : protocol.extract(
    fullLayout ? normalizeKuanRichHistoryText(input) : visible,
  ).text;
  const links = [...section.links, ...protocol.links.map(({ url, title }) => ({ url, title }))];
  return { text, blocks, groups, history, links, inlineImages: inlineImages(text), unknown: protocol.unknown() };
}
