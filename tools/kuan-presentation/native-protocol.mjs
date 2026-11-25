import { rewriteWebInline, wirePayload, wireReferenceSeparator } from './inline-protocol.mjs';

const MAX_BLOCKS = 96;
const slotPattern = /^DIL\d{1,9}$/u;
const idPattern = /^[A-Za-z0-9_.:-]{1,128}$/u;
const anchor = /\uE100KUAN_BLOCK_(\d+)\uE101/gu;
const superDigits = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const list = (value, max) => Array.isArray(value) ? value.slice(0, max) : [];
const label = (value, max = 500) => typeof value === 'string' && value.length <= max
  ? value.replace(/[\u0000-\u001f\u007f\uE000-\uF8FF]/gu, ' ').trim() : '';
const turn = value => typeof value === 'string' && value.length <= 4000
  && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\uE000-\uF8FF]/u.test(value) ? value.trim() : '';
const md = text => text.replace(/[\\[\]<>&*_|]/gu, '\\$&');
const id = value => typeof value === 'string' && idPattern.test(value) ? value : '';
const part = value => typeof value === 'number' && Number.isFinite(value) ? String(value) : label(value);

// QuickJS has no browser URL global. The app validates every resolved URI
// with OkHttp as well, and never treats unsigned private pointers as URLs.
export function publicNativeURL(value) {
  if (typeof value !== 'string' || value.length > 8192 || /[\s\u0000-\u001f\u007f\\<>"\uE000-\uF8FF]/u.test(value)) return '';
  const match = /^https:\/\/([a-z\d.-]+)(?::443)?(?=\/|\?|#|$)/iu.exec(value);
  if (!match || !/^[a-z\d-]+(?:\.[a-z\d-]+)*\.[a-z\d-]*[a-z][a-z\d-]*$/iu.test(match[1])
      || /\.(?:local|internal|localhost|test|invalid)$/iu.test(match[1])) return '';
  const [address, fragment = ''] = value.split('#', 2);
  const queryAt = address.indexOf('?');
  const query = queryAt === -1 ? '' : address.slice(queryAt + 1);
  try {
    if ([...query.split(/[&;]/u), ...fragment.split(/[&;]/u)].some(pair => /^(?:token|access_token|authorization|signature|sig|key|api_key|x-amz-.*|x-goog-.*)$/iu
      .test(decodeURIComponent(pair.split('=', 1)[0])))) return '';
  } catch { return ''; }
  return value;
}

const filePath = /^(?:\/api\/v1)?\/kuan\/chat-assets\/asset-[a-f0-9]{32}$/u;
const generatedFile = /^\/download\/file\/[a-f0-9]{32}\/[^/?#\\]+$/u;
const fileURL = value => typeof value === 'string' && value.length <= 4096
  && (filePath.test(value) || generatedFile.test(value)) && !/[\u0000-\u001f\u007f]/u.test(value) ? value : '';
const canonicalKind = value => typeof value === 'string'
  ? value.replace(/([a-z\d])([A-Z])/gu, '$1_$2').replace(/[.-]/gu, '_').toLowerCase() : '';

const kinds = new Map(Object.entries({
  image: ['async_image', 'async_image_group', 'image_group', 'image_group_tile', 'image_tile',
    'image', 'image_v2', 'response_images_tab_tile', 'search_image', 'image_asset_pointer'],
  progress: ['loading_block', 'loading_indicator', 'pulse_indicator', 'delayed_image_gen_card', 'image_generation_call'],
  chart: ['chart', 'charts_widget_v2', 'visualize', 'pie_chart', 'segmented_bar_chart', 'plot_surface'],
  table: ['table', 'table_section', 'sports_standings', 'sports_schedule'],
  map: ['map', 'legacy_map_thumbnail'],
  products: ['product_group', 'product', 'products'],
  links: ['link', 'entity', 'webpage', 'webpage_extended', 'grouped_webpages', 'title_citation', 'mcp_source', 'citations', 'sources_footnote'],
  information: ['stock', 'tldr', 'writing_block', 'page_snapshot_prose', 'weather', 'finance', 'sports', 'calculator'],
  media: ['audio', 'video'],
  file: ['file', 'file_navlist', 'navlist', 'library_file'],
  questions: ['ask_user_input_v2', 'imagegen_ask_user_input_preview', 'questions'],
  widget: ['dil', 'presentation_dil_v1', 'genui', 'gen_ui', 'client_defined_widget', 'app_block', 'mcp_app_tool', 'skill'],
  activity: ['code_interpreter', 'function_call', 'web_search_call', 'connector_call', 'dynamic_tool_call',
    'mcp_tool_call', 'tool_use', 'tool_result'],
  silent: ['hidden', 'compaction', 'content_references_patch', 'streaming_parent_patch', 'reasoning', 'annotation'],
}).flatMap(([family, names]) => names.map(name => [name, family])));

function chart(value) {
  const style = value?.style;
  if (!['line', 'bar', 'scatter'].includes(style)) return null;
  const numeric = number => typeof number === 'number' && Number.isFinite(number);
  const axes = axis => ({ title: label(axis?.title), data: list(axis?.data, 256).map(part),
    scale: axis?.scale === 'log' ? 'log' : 'linear' });
  const series = list(value.series, 12).flatMap(item => {
    const row = { name: label(item?.name) };
    if (style === 'scatter') {
      row.points = list(item?.points, 256).filter(point => numeric(point?.x) && numeric(point?.y))
        .map(({ x, y }) => ({ x, y }));
      if (!row.points.length) return [];
    } else {
      row.values = list(item?.values, 256);
      if (!row.values.length || !row.values.every(numeric)) return [];
    }
    return [row];
  });
  return series.length ? { style, title: label(value.title), series, x_axis: axes(value.x_axis), y_axis: axes(value.y_axis) } : null;
}

function table(value) {
  const headers = list(value?.headers, 16).map(part);
  const rows = list(value?.rows, 128).flatMap(row => Array.isArray(row) ? [list(row, 16).map(part)] : []);
  return rows.length && rows.some(row => row.some(Boolean)) ? { headers, rows } : null;
}

function sources(value) {
  return list(value, 128).flatMap(item => {
    const url = publicNativeURL(item?.url);
    const file = fileURL(item?.file_url);
    if (!url && !file) return [];
    return [{ ref_id: id(item.ref_id), url: url || file, title: label(item.title), file: !!file,
      number: Number.isSafeInteger(item.number) && item.number > 0 && item.number <= 999 ? item.number : 0 }];
  });
}

function component(value, kind, streaming) {
  const tag = canonicalKind(value?.kind || kind);
  const type = kinds.get(tag) || (tag.startsWith('beacon_') ? 'information' : 'widget');
  if (type === 'silent') return null;
  const images = list(value?.images, 24).flatMap(row => {
    const url = publicNativeURL(row?.content_url ?? row?.url);
    return url ? [{ url, title: label(row.title), thumbnail: publicNativeURL(row.thumbnail ?? row.thumbnail_url),
      sourceUrl: publicNativeURL(row.source_url ?? (row.content_url ? row.url : '')) }] : [];
  });
  const links = sources(value?.links ?? value?.sources);
  const summary = label(value?.summary, 3000);
  const spec = type === 'chart' ? chart(value?.chart) : null;
  const data = table(value?.table);
  const url = type === 'file' ? fileURL(value?.file_url) : publicNativeURL(value?.url);
  const questions = type === 'questions' ? list(value?.questions, 12).flatMap(q => {
    const prompt = label(q?.question, 1200);
    const choices = list(q?.choices, 16).flatMap(option => {
      const title = label(option?.label, 160), prompt = turn(option?.prompt);
      return title && prompt ? [{ label: title, prompt }] : [];
    });
    return prompt && choices.length ? [{ question: prompt, choices }] : [];
  }) : [];
  const hasData = images.length || links.length || summary || spec || data || url || questions.length;
  const activityState = type === 'activity' && ['resolved', 'unavailable'].includes(value?.status);
  const waiting = value?.status === 'pending' || !value ||
    (type === 'progress' && value.status !== 'unavailable' && !hasData);
  const status = streaming && waiting ? 'pending'
    : hasData || activityState ? (value?.status === 'unavailable' ? 'unavailable' : 'resolved')
      : value?.status === 'unsupported' ? 'unsupported' : 'unavailable';
  return { type, status, title: label(value?.label), summary, url, images, links, chart: spec, table: data, questions };
}

function indexUnique(values, key) {
  const found = new Map();
  for (const value of values) {
    const name = key(value);
    if (!name) continue;
    const old = found.get(name);
    found.set(name, old === undefined || JSON.stringify(old) === JSON.stringify(value) ? value : null);
  }
  return found;
}

function markdownLink(text, url) {
  return '[' + md(text) + '](<' + url.replace(/[()\s]/gu, ch => encodeURIComponent(ch)) + '>)';
}

const payloadId = value => id(value?.component_id) || id(value?.resolution_id) || id(value?.__resolutionId) || id(value?.ref_id);
const payloadSlot = value => typeof value?.slot_id === 'string' && slotPattern.test(value.slot_id) ? value.slot_id : '';

export function nativeProtocol(presentation, streaming, legacyImages = []) {
  const isNative = presentation?.version === 1 && presentation.source === 'chatgpt'
    && typeof presentation.message_id === 'string' && presentation.message_id.length > 0 && presentation.message_id.length <= 128;
  const rows = isNative ? list(presentation.components, MAX_BLOCKS).filter(row => id(row?.id)) : [];
  const components = indexUnique(rows, row => row.id);
  const bindings = isNative ? list(presentation.anchors, MAX_BLOCKS).flatMap(row => {
    const slot = payloadSlot(row), component = id(row?.component_id);
    return slot && component ? [{ slot_id: slot, component_id: component }] : [];
  }) : [];
  const slots = indexUnique(bindings, row => row.slot_id);
  const refs = [...sources(isNative ? presentation.references : null),
    ...rows.filter(row => ['cite', 'sources_footnote'].includes(canonicalKind(row.kind))).flatMap(row => sources(row.sources))].slice(0, 128);
  const byRef = indexUnique(refs, ref => ref.ref_id);
  const byNumber = indexUnique(refs, ref => ref.number);
  const numbered = new Map();
  const reserved = new Set();
  for (const [number, row] of byNumber) {
    if (row && !numbered.has(row.url)) {
      numbered.set(row.url, number);
      reserved.add(number);
    }
  }
  let next = 1;
  const unavailable = new Set();
  const blocks = [];
  const add = (value, type) => {
    const block = component(value, type, streaming);
    if (!block || blocks.length >= MAX_BLOCKS) return '';
    return '\n\n\uE100KUAN_BLOCK_' + (blocks.push(block) - 1) + '\uE101\n\n';
  };
  const linked = row => {
    if (!row) return '';
    if (!numbered.has(row.url)) {
      while (reserved.has(next)) next++;
      numbered.set(row.url, next++);
    }
    const number = numbered.get(row.url);
    return markdownLink(String(number).replace(/\d/gu, digit => superDigits[Number(digit)]), row.url);
  };
  const forSlot = slot => components.get(slots.get(slot)?.component_id);
  const visit = ({ kind, slot, body }) => {
    if (kind === 'memcite') return ''; // A private-memory marker has no user-facing payload.
    if (kind === 'cite' || kind === 'i' || kind === 'filecite') {
      const data = wirePayload(body);
      const ids = Array.isArray(data) ? data.slice(0, 32) : data ? [data.ref_id] : body.split(wireReferenceSeparator);
      const resolved = [...new Set(ids.map(ref => byRef.get(id(ref)))
        .filter(row => row && (kind !== 'filecite' || row.file)))];
      return resolved.map(linked).join(' ');
    }
    if (kind === 'dil') return add(forSlot(slot), kind);
    const data = wirePayload(body);
    if (kind === 'url') {
      const [text, target] = body.split(wireReferenceSeparator);
      const url = publicNativeURL(target), title = label(text);
      return url && title ? markdownLink(title, url) : md(title);
    }
    if (kind === 'entity' && Array.isArray(data)) return md(label(data[1]) || label(data[0]));
    const keyed = components.get(payloadId(data)) || forSlot(payloadSlot(data));
    if (kind === 'image_group' && !slots.size && !payloadId(data) && Array.isArray(data?.query)) {
      const queries = list(data.query, 16).filter(query => typeof query === 'string' && query.length <= 1000);
      if (queries.some(query => legacyImages.filter(image => image.query === query).length === 1)) {
        return '<AsyncImageGroup query={' + JSON.stringify(queries) + '}/>';
      }
    }
    if ((kind === 'visualize' || kind === 'chart') && !keyed && data && (chart(data.chart ?? data) || table(data.table))) {
      return add({ kind, chart: data.chart ?? data, table: data.table, label: data.title }, kind);
    }
    if (!keyed && data && !Array.isArray(data) && kinds.has(kind) && kinds.get(kind) !== 'silent') {
      // Some complete inline packets carry declarative data themselves.
      // A query, handler, or asset pointer alone is never usable content.
      const exposed = {
        kind, label: data.title ?? data.label, summary: data.summary,
        status: data.is_loading === true ? 'pending' : 'resolved',
        chart: data.chart, table: data.table, questions: data.questions,
        images: data.images, file_url: data.file_url, url: data.url,
        links: data.links ?? data.sources ?? data.locations ?? data.products,
      };
      return add(exposed, kind);
    }
    if (keyed || kinds.has(kind) || kind.startsWith('beacon_')) return add(keyed, kind);
    if (unavailable.size < 32 && /^[a-z_][a-z0-9_]{0,63}$/u.test(kind)) unavailable.add(kind);
    return '';
  };
  const rewrite = source => {
    let prose = source.replace(anchor, '');
    if (byNumber.size) {
      prose = prose.replace(/(?<![!\\])\[[ \t]*(\d{1,3})[ \t]*\](?![ \t]*[\[(:])/gu,
        (whole, number) => byNumber.get(Number(number)) ? linked(byNumber.get(Number(number))) : whole);
    }
    // Exact attributes on an identified tag are the only direct ID binding.
    prose = prose.replace(/<([A-Z][A-Za-z0-9_]{0,63}|loading-block)\b[^<>\r\n]{0,2048}\/>/gu, (whole, kind) => {
      const match = /\s(?:__resolutionId|resolution_id|component_id)\s*=\s*\{?(?:"([A-Za-z0-9_.:-]{1,128})"|'([A-Za-z0-9_.:-]{1,128})')\}?/u.exec(whole);
      if (match && kinds.has(canonicalKind(kind))) return add(components.get(match[1] || match[2]), kind);
      if (kind === 'Cite') {
        const expression = /\srefs\s*=\s*\{(\[[^\r\n<>]{0,1024}\])\}/u.exec(whole)?.[1];
        const ids = wirePayload(expression);
        if (Array.isArray(ids)) return ids.slice(0, 32).map(value => linked(byRef.get(id(value)))).filter(Boolean).join(' ');
      }
      if (/^(?:LoadingBlock|loading-block|DelayedImageGenCard)$/u.test(kind)) return add(null, kind);
      return whole;
    });
    const knownURLs = new Set(refs.filter(row => !row.file).map(row => row.url));
    if (knownURLs.size) {
      // The separators also occur in prose, so recognize only typed source rows.
      prose = prose.replace(/^(\d{8}T\d{2}(?::\d{2}){0,2})[ \t]+([^:|\r\n]{1,120}):[ \t]*(?:\|\|\|\||::::)[ \t]*(https:\/\/[^\s<>]{1,8192})[ \t]*(?=\r?$)/gmu,
        (whole, _timestamp, title, url) => knownURLs.has(url) ? '- ' + markdownLink(title.trim(), url) : whole);
    }
    return rewriteWebInline(prose, visit, streaming);
  };
  const extract = value => {
    const placed = [];
    let text = '', cursor = 0;
    for (const hit of value.matchAll(anchor)) {
      const block = blocks[Number(hit[1])];
      if (!block) continue;
      text += value.slice(cursor, hit.index);
      placed.push({ ...block, offset: text.length });
      cursor = hit.index + hit[0].length;
    }
    return { text: text + value.slice(cursor), blocks: placed };
  };
  return { rewrite, extract, links: refs.filter(row => !row.file), unknown: () => [...unavailable] };
}
