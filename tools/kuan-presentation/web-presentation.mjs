// Production-derived compatibility boundary; see docs/CHAT-OPENUI-20261030.md.
// Safe, declarative compatibility layer for leaked webpage rich content.
// It intentionally does not execute model-provided JavaScript.
import { declarativeValue, expandDeclarativeForms } from './declarative-forms.mjs';
const cache = new Map();
let cacheCharacters = 0;
const OPEN = { '(': ')', '[': ']', '{': '}' };
const CLOSE = new Set(Object.values(OPEN));

function safePresentationURL(value) {
  if (typeof value !== 'string' || value.length > 8192 || /[\u0000\r\n\\]/u.test(value)) return '';
  try {
    const url = new URL(value), host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || !host.includes('.')
        || /^(?:127\.|10\.|192\.168\.|169\.254\.|0\.)/u.test(host)
        || /^172\.(?:1[6-9]|2\d|3[01])\./u.test(host)
        || /\.(?:local|internal)$/u.test(host) || host === 'localhost') return '';
    for (const key of url.searchParams.keys())
      if (/^(?:token|access_token|authorization|signature|x-amz-.*)$/iu.test(key)) return '';
    return url.href;
  } catch { return ''; }
}

export function validateKuanNativePresentation(value) {
  if (value?.version !== 1 || value.source !== 'chatgpt' || typeof value.message_id !== 'string'
      || value.message_id.length > 128 || !Array.isArray(value.components)) return null;
  const text = (item, max = 1000) => typeof item === 'string' && item.length <= max ? item : '';
  const components = value.components.slice(0, 96).flatMap(item => {
    if (!item || typeof item !== 'object' || !text(item.id, 128) || !text(item.kind, 64)) return [];
    return [{ id: item.id, kind: item.kind, query: text(item.query), label: text(item.label),
      url: safePresentationURL(item.url), status: ['resolved', 'unavailable', 'pending', 'unsupported'].includes(item.status) ? item.status : 'unavailable',
      images: (Array.isArray(item.images) ? item.images : []).slice(0, 8).flatMap(image => {
        const url = safePresentationURL(image?.url);
        return url ? [{ url, thumbnail: safePresentationURL(image.thumbnail), title: text(image.title), source_url: safePresentationURL(image.source_url) }] : [];
      }),
      sources: (Array.isArray(item.sources) ? item.sources : []).slice(0, 32).flatMap(source => {
        const url = safePresentationURL(source?.url);
        return url ? [{ url, title: text(source.title), ref_id: text(source.ref_id, 128) }] : [];
      }) }];
  });
  return { version: 1, source: 'chatgpt', message_id: value.message_id, components };
}

function escapePresentationHTML(value) {
  return String(value || '').replace(/[&<>"']/gu, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

// Resolve only declarative upstream data. Match by the exact image query,
// never synthesize an image URL or execute compiled component handlers.
function resolveRichPresentation(value, presentation, streaming, history = false) {
  const components = validateKuanNativePresentation(presentation)?.components || [];
  const code = maskCode(String(value || ''), false);
  const occurrences = new Map();
  const imageMarkup = query => {
    const component = components.find(item => ['AsyncImage', 'AsyncImageGroup', 'Image'].includes(item.kind) && item.query === query);
    if (!component?.images?.length) {
      if (history) return '';
      const label = component?.status === 'pending' && streaming ? '图片加载中' : streaming ? '正在接收图片' : '未收到可显示的图片';
      return '<span class="kuan-native-media-status" role="status">' + label + '</span>';
    }
    const occurrence = occurrences.get(query) || 0;
    occurrences.set(query, occurrence + 1);
    return component.images.map((image, index) => {
      if (history) return image.source_url ? '\n[图片来源](' + image.source_url.replace(/\)/gu, '%29') + ')\n' : '';
      const title = escapePresentationHTML(image.title || query || '图片');
      const source = image.source_url ? '<a href="' + escapePresentationHTML(image.source_url) + '" target="_blank" rel="noopener noreferrer">图片来源</a>' : '';
      const key = escapePresentationHTML(query + ':' + occurrence + ':' + index);
      const signature = escapePresentationHTML(JSON.stringify([image.url, image.thumbnail, image.title, image.source_url]));
      return '\n\n<figure class="kuan-native-media" data-media-key="' + key + '" data-media-signature="' + signature + '" data-media-state="loading"><a href="' + escapePresentationHTML(image.url) + '" target="_blank" rel="noopener noreferrer"><img src="' + escapePresentationHTML(image.thumbnail || image.url) + '" alt="' + title + '" loading="lazy" decoding="async" referrerpolicy="no-referrer" width="360" height="240"><span class="kuan-native-media-error" role="status">图片未能加载，可打开原图</span></a><figcaption>' + title + source + '</figcaption></figure>\n\n';
    }).join('');
  };
  const input = code.masked;
  let output = '', cursor = 0;
  for (const match of input.matchAll(/<(AsyncImageGroup|AsyncImage|Image|Cite|Entity|Link|Map|Chart)\b/gu)) {
    const start = match.index;
    if (start < cursor) continue;
    let end = tagEnd(input, start);
    output += input.slice(cursor, start);
    if (input[end - 1] !== '>') { cursor = input.length; break; }
    const tag = input.slice(start, end), kind = match[1];
    if (kind === 'AsyncImageGroup') {
      const queries = literal(attribute(tag, 'query'));
      if (Array.isArray(queries) && queries.length <= 16 && queries.every(query => typeof query === 'string' && query.length <= 1000))
        output += queries.map(imageMarkup).join('');
      else if (!history) output += '<span class="kuan-native-media-status" role="status">未收到可显示的图片</span>';
    } else if (kind === 'AsyncImage' || kind === 'Image') {
      const raw = attribute(tag, 'query') || '';
      const query = literal(raw) ?? raw;
      const src = safePresentationURL(attribute(tag, 'src') || attribute(tag, 'url'));
      output += src ? '\n\n![' + String(query).replace(/[[\]\r\n]/gu, '') + '](' + src.replace(/\)/gu, '%29') + ')\n\n' : imageMarkup(String(query));
    } else if (kind === 'Cite') {
      const refs = literal(attribute(tag, 'refs')) || [];
      const sources = components.filter(item => item.kind === 'Cite').flatMap(item => item.sources || []);
      const links = Array.isArray(refs) ? refs.flatMap(ref => {
        const item = sources.find(source => source.ref_id === ref);
        return item ? '<a class="kuan-native-citation" href="' + escapePresentationHTML(item.url) + '" target="_blank" rel="noopener noreferrer">' + escapePresentationHTML(item.title || new URL(item.url).hostname) + '</a>' : [];
      }) : [];
      output += links.length ? '<span class="kuan-native-citations">' + links.join(' · ') + '</span>' : '';
    } else if (kind === 'Entity') {
      output += escapePresentationHTML(literal(attribute(tag, 'value')) ?? attribute(tag, 'value') ?? '');
    } else if (kind === 'Link') {
      const raw = attribute(tag, 'href') || attribute(tag, 'url') || '';
      const url = safePresentationURL(literal(raw) ?? raw);
      const close = /^([\s\S]*?)<\/Link\s*>/u.exec(input.slice(end));
      const body = !/\/\s*>$/u.test(tag) && close ? close[1].replace(/<[^>]*>/gu, '') : '';
      const label = literal(attribute(tag, 'title')) ?? attribute(tag, 'title') ?? (body || url);
      output += url ? '<a href="' + escapePresentationHTML(url) + '" target="_blank" rel="noopener noreferrer">' + escapePresentationHTML(label) + '</a>' : escapePresentationHTML(body);
      if (body && close) end += close[0].length;
    } else if (kind === 'Map' || kind === 'Chart') {
      if (!history) output += '<span class="kuan-native-media-status">此内容尚不支持交互展示</span>';
    }
    cursor = end;
  }
  output += input.slice(cursor);
  output = output.replace(/\uE200image_group\uE202([\s\S]*?)\uE201/gu, (_, raw) => {
    try { const data = JSON.parse(raw); return (Array.isArray(data.query) ? data.query : []).map(imageMarkup).join(''); }
    catch { return ''; }
  });
  output = output.replace(/\uE200cite\uE202([^\uE201]*)\uE201/gu, (_, raw) => {
    const sources = components.filter(item => item.kind === 'Cite').flatMap(item => item.sources);
    return (raw.match(/turn\d+(?:search|news|open|find|image)\d+/gu) || []).flatMap(ref => {
      const source = sources.find(item => item.ref_id === ref);
      return source ? '<a class="kuan-native-citation" href="' + escapePresentationHTML(source.url) + '" target="_blank" rel="noopener noreferrer">' + escapePresentationHTML(source.title || new URL(source.url).hostname) + '</a>' : [];
    }).join(' · ');
  });
  return code.restore(output);
}

function unquote(value) {
  const source = String(value || '').trim();
  const match = /^(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')$/su.exec(source);
  if (!match) return null;
  if (match[1] !== undefined) { try { return JSON.parse(source); } catch { return null; } }
  return match[2].replace(/\\([\\'"nrt])/g, (_, char) => ({ n: '\n', r: '\r', t: '\t' }[char] || char));
}

function literal(value) {
  const source = String(value || '').trim();
  const quoted = unquote(source);
  if (quoted !== null) return quoted;
  if (source === 'true') return true;
  if (source === 'false') return false;
  if (source === 'null') return null;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u.test(source)) return Number(source);
  if (/^[\[{]/u.test(source)) {
    try { return JSON.parse(source); } catch { /* Read bounded non-JSON literals below. */ }
  }
  return declarativeValue(source) ?? null;
}

function balanced(source, start) {
  const stack = [];
  let quote = '', escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (OPEN[char]) { stack.push(OPEN[char]); continue; }
    if (CLOSE.has(char) && stack.pop() !== char) return source.length;
    if (stack.length === 0) return index + 1;
  }
  return source.length;
}

function splitTopLevel(source, separator) {
  const parts = [];
  let cursor = 0, quote = '', escaped = false, stack = [];
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (OPEN[char]) stack.push(OPEN[char]);
    else if (CLOSE.has(char)) stack.pop();
    else if (char === separator && stack.length === 0) { parts.push(source.slice(cursor, index)); cursor = index + 1; }
  }
  parts.push(source.slice(cursor));
  return parts;
}

function evaluate(source, states) {
  let value = String(source || '').trim();
  const parsedValue = declarativeValue(value, states);
  if (parsedValue !== undefined) return parsedValue;
  if (value.startsWith('(') && balanced(value, 0) === value.length && value.endsWith(')'))
    return evaluate(value.slice(1, -1), states);
  const conditional = splitTopLevel(value, '?');
  if (conditional.length === 2) {
    const branches = splitTopLevel(conditional[1], ':');
    if (branches.length === 2) {
      const condition = evaluate(conditional[0], states);
      if (condition === null || condition === undefined) return null;
      return evaluate(condition ? branches[0] : branches[1], states);
    }
  }
  const parts = splitTopLevel(value, '+');
  if (parts.length > 1) {
    const values = parts.map(part => evaluate(part, states));
    return values.some(part => part === null || part === undefined) ? null : values.map(String).join('');
  }
  const parsed = literal(value);
  if (parsed !== null) return parsed;
  if (/^[A-Za-z_$][\w$]*$/u.test(value)) return states.get(value) ?? null;
  if (/^`(?:\\.|[^`\\])*`$/su.test(value)) {
    let invalid = false;
    const text = value.slice(1, -1).replace(/\$\{([^}]*)\}/gu, (_, expression) => {
      const name = /^\s*([A-Za-z_$][\w$]*)\s*$/u.exec(expression)?.[1];
      if (!name || !states.has(name)) { invalid = true; return ''; }
      return String(states.get(name));
    });
    return invalid ? null : text.replace(/\\([\\`nrt])/gu, (_, char) => ({ n: '\n', r: '\r', t: '\t' }[char] || char));
  }
  return null;
}

function decodeLiteralUnicodeEscapes(value) {
  return String(value || '').replace(/\\u(?:\{([0-9a-f]{1,6})\}|([0-9a-f]{4}))/giu, (match, braced, fixed) => {
    const codePoint = Number.parseInt(String(braced || fixed), 16);
    if (codePoint < 0xe200 || codePoint > 0xe20f) return match;
    return String.fromCodePoint(codePoint);
  });
}

// Native webpage Markdown uses private-use tokens for links, entities,
// citations and image groups. They are transport markers, not visible text.
// Convert only the declarative forms we understand and drop unknown markers.
function normalizeNativePresentationTokens(value) {
  return String(value || '')
    .replace(/\uE200([a-z_][\w-]*)\uE202([\s\S]*?)\uE201/gu, (whole, kind, body) => {
      const parts = body.split('\uE202');
      if (kind.toLowerCase() === 'url' && parts.length >= 2) {
        const label = parts[0].trim();
        const url = parts.slice(1).join('\uE202').trim().replace(/[)\s]/gu, '');
        if (label && /^https?:\/\//iu.test(url)) return `[${label.replace(/[\[\]]/gu, '')}](${url})`;
      }
      if (kind.toLowerCase() === 'entity') {
        try {
          const data = JSON.parse(parts.join('\uE202'));
          if (Array.isArray(data)) return String(data[1] || data[0] || '').trim();
        } catch { /* safe plain-label fallback below */ }
        return parts.join(' ').replace(/[\[\]"']/gu, ' ').replace(/\s+/gu, ' ').trim();
      }
      return '';
    })
    .replace(/\uE200(?:cite|image_group|ref|product|weather|finance|sports|calculator)\uE202[\s\S]*?\uE201/giu, '')
    .replace(/\uE200[a-z_][\w-]*\uE202[\s\S]*$/giu, '')
    .replace(/[\uE200-\uE20F]/gu, '');
}

// These markers are emitted by the web renderer, not by the user's answer.
// Keep the cleanup generic enough for new citation/image component names while
// leaving ordinary prose and real source code untouched.
const COMPLETE_PRIVATE_RICH_REFERENCE = /\uE200[\s\S]*?\uE201/gu;
const PARTIAL_PRIVATE_RICH_REFERENCE = /\uE200[\s\S]*$/u;
const ORPHAN_PRIVATE_RICH_CONTROL = /[\uE201-\uE20F]/gu;
const INTERNAL_CITATION = /[ \t]*(?:[\uE000-\uF8FF]*cite[\uE000-\uF8FF\s]*)?(?:turn\d+(?:search|news|open|find|image)\d+(?:[\uE000-\uF8FF\s,;]*)?)+[\uE000-\uF8FF]*/giu;
const PARTIAL_INTERNAL_CITATION = /(?:^|[\s\uE000-\uF8FF])(?:cite(?:[\s\uE000-\uF8FF]+turn\d+[a-z]*(?:\d*)?)?|turn\d+[a-z]*(?:\d*)?)[\uE000-\uF8FF\s,;]*$/iu;

function stripPrivateRichReferences(value) {
  return normalizeNativePresentationTokens(decodeLiteralUnicodeEscapes(value))
    .replace(COMPLETE_PRIVATE_RICH_REFERENCE, '')
    .replace(PARTIAL_PRIVATE_RICH_REFERENCE, '')
    .replace(ORPHAN_PRIVATE_RICH_CONTROL, '')
    .replace(INTERNAL_CITATION, '')
    .replace(PARTIAL_INTERNAL_CITATION, '');
}

function stripBodyDeclarations(value) {
  const source = String(value || '');
  let output = '', cursor = 0;
  for (const match of source.matchAll(/\{@body\b/giu)) {
    const start = match.index || 0;
    if (start < cursor) continue;
    output += source.slice(cursor, start);
    const end = balanced(source, start);
    cursor = end > start ? end : source.length;
    if (cursor >= source.length) break;
  }
  return output + source.slice(cursor);
}

function normalizeProtocolCodeSegment(segment) {
  const fence = /^[ \t]{0,3}(`{3,}|~{3,})([^\r\n]*)\r?\n([\s\S]*)$/u.exec(segment);
  if (!fence || !/^(?:text|plaintext|markdown|md)?$/iu.test(fence[2].trim())) return segment;
  const closing = new RegExp('\\r?\\n[ \\t]{0,3}' + fence[1][0] + '{' + fence[1].length + ',}[ \\t]*$');
  const body = fence[3].replace(closing, '');
  const fragment = body.trim();
  const partialTag = /^<\/?([A-Za-z]*)$/u.exec(fragment);
  if (fragment && '{@body'.startsWith(fragment)
      || partialTag && ['title', 'subtitle', 'heading', 'subheading'].some(name => name.startsWith(partialTag[1].toLowerCase()))) return '';
  if (/^\s*<(?:title|subtitle|heading|subheading)\b[^>]*$/iu.test(body)) return '';
  // Only an unlabelled presentation document is an accidental rich fence.
  // Explicit code languages, complete web pages and inline examples are data.
  if (!/^\s*(?:\{@body\b|<(?:title|heading|subtitle|subheading)\b[^>]*(?:size|color)\b)/iu.test(body)
      || /<!doctype|<\/?(?:html|head|body|script|style|svg)\b/iu.test(body)) return segment;
  return richMarkupText(stripBodyDeclarations(body.replace(/\r?\n[`~]{1,}$/u, ''))).replace(/\n{3,}/gu, '\n\n').trim();
}

function maskCode(source, normalizePresentation = true) {
  const saved = [];
  const masked = source.replace(/^[ \t]{0,3}(`{3,}|~{3,})[^\r\n]*(?:\r?\n|$)[\s\S]*?(?:^[ \t]{0,3}\1[ \t]*(?=\r?$)|(?![\s\S]))|(`+)[^`\r\n]*?\2(?!`)|`[^`\r\n]*(?:`|$)/gmu, segment => {
    const index = saved.push(normalizePresentation ? normalizeProtocolCodeSegment(segment) : segment) - 1;
    return `\uE100KUAN_CODE_${index}\uE101`;
  });
  return { masked, restore: value => value.replace(/\uE100KUAN_CODE_(\d+)\uE101/gu,
    (_, index) => saved[Number(index)] || '') };
}

function tagEnd(source, start) {
  let quote = '';
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '{') index = balanced(source, index) - 1;
    else if (char === '>') return index + 1;
  }
  return source.length;
}

function attribute(source, name) {
  const match = new RegExp(`\\b${name}\\s*=\\s*`, 'iu').exec(source);
  if (!match) return null;
  const start = match.index + match[0].length;
  const first = source[start];
  if (first === '"' || first === "'") {
    let end = start + 1;
    while (end < source.length) { if (source[end] === '\\') end += 2; else if (source[end++] === first) break; }
    return source.slice(start + 1, end - 1);
  }
  if (first === '{') return source.slice(start + 1, balanced(source, start) - 1);
  return source.slice(start).split(/\s|>/u, 1)[0];
}

function elementEnd(source, type, openingEnd) {
  if (type === 'input' || /\/\s*>$/u.test(source.slice(openingEnd - 3, openingEnd))) return openingEnd;
  const close = new RegExp(`<\\/${type}\\s*>`, 'iu');
  close.lastIndex = openingEnd;
  const match = close.exec(source.slice(openingEnd));
  return match ? openingEnd + match.index + match[0].length : source.length;
}

function stateDeclarations(body, states, setters) {
  const pattern = /\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*=\s*(?:DIL\.)?useState\s*\(/gu;
  for (const match of body.matchAll(pattern)) {
    const open = match.index + match[0].length - 1;
    const end = balanced(body, open);
    const initial = literal(body.slice(open + 1, end - 1));
    if (initial !== null && initial !== undefined) {
      states.set(match[1], initial);
      setters.set(match[2], match[1]);
    }
  }
}

function stateName(opening, setters) {
  const named = attribute(opening, 'name');
  if (named && /^[A-Za-z_$][\w$]*$/u.test(named)) return named;
  const value = attribute(opening, 'value') || attribute(opening, 'checked');
  const identifier = value && /^\s*([A-Za-z_$][\w$]*)\s*$/u.exec(value);
  if (identifier) return identifier[1];
  const handler = attribute(opening, 'onChange') || attribute(opening, 'onInput') || '';
  const setter = /\b([A-Za-z_$][\w$]*)\s*\(/u.exec(handler);
  return setter ? setters.get(setter[1]) || null : null;
}

function optionList(body) {
  const options = [];
  for (const item of choiceElements(body, 'option')) {
    const raw = attribute(item.opening, 'value');
    const label = controlLabel(item.body);
    const value = raw == null ? label : (literal(raw) ?? raw);
    if (label && value !== null) options.push({ value, label });
  }
  return options;
}

function choiceElements(source, type) {
  const choices = [];
  let cursor = 0;
  for (const match of source.matchAll(new RegExp('<' + type + '\\b', 'giu'))) {
    if (match.index < cursor) continue;
    const openingEnd = tagEnd(source, match.index), end = elementEnd(source, type, openingEnd);
    if (source[openingEnd - 1] !== '>' || !new RegExp('</' + type + '\\s*>$', 'iu').test(source.slice(match.index, end))) continue;
    choices.push({opening: source.slice(match.index, openingEnd), body: source.slice(openingEnd, end).replace(new RegExp('</' + type + '\\s*>$', 'iu'), '')});
    cursor = end;
    if (choices.length >= 64) break;
  }
  return choices;
}

function controlLabel(value) {
  return String(value).replace(/<[^>]*>/gu, ' ').replace(/&(amp|lt|gt|quot|#39);/gu,
    (_, entity) => ({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'"}[entity])).replace(/\s+/gu, ' ').trim();
}

function radioValue(opening, setters) {
  const raw = attribute(opening, 'value');
  if (raw !== null) return /\bvalue\s*=\s*\{/iu.test(opening) ? literal(raw) : literal(raw) ?? raw;
  const handler = attribute(opening, 'onChange') || '';
  const call = /\b([A-Za-z_$][\w$]*)\s*\(/u.exec(handler);
  if (!call || !setters.has(call[1])) return null;
  const start = call.index + call[0].length - 1, end = balanced(handler, start);
  return literal(handler.slice(start + 1, end - 1));
}

function controlField(type, opening, body, states, setters) {
  const name = stateName(opening, setters);
  if (!name || !states.has(name)) return null;
  if (type === 'radio-group') {
    const fields = [];
    for (const item of choiceElements(body, 'radio')) {
      const value = radioValue(item.opening, setters);
      const label = controlLabel(item.body);
      if (label && value !== null) fields.push({ name, label: name, kind: 'radio', value: states.get(name), option: { value, label } });
    }
    return fields.length ? fields : null;
  }
  const inputType = String(attribute(opening, 'type') || 'text').toLowerCase();
  const rawLabel = attribute(opening, 'aria-label') || attribute(opening, 'name') || name;
  const label = String(literal(rawLabel) ?? rawLabel);
  const kind = type === 'select' ? 'select' : type === 'textarea' ? 'textarea' : inputType;
  if (!['select', 'textarea', 'text', 'checkbox', 'radio'].includes(kind)) return null;
  if (kind === 'select') {
    const options = optionList(body);
    return options.length ? { name, label, kind, value: states.get(name), options } : null;
  }
  if (kind === 'radio') {
    const value = radioValue(opening, setters);
    if (value === null) return null;
    return { name, label, kind, value: states.get(name), option: { value, label: label === name ? String(value) : label } };
  }
  if (kind === 'checkbox') return { name, label, kind, value: Boolean(states.get(name)) };
  return { name, label, kind, value: String(states.get(name) ?? '') };
}

function turnExpression(handler) {
  const marker = /GenUI\s*\.\s*issueNewTurn\s*\(/iu.exec(handler || '');
  if (!marker) return null;
  const open = marker.index + marker[0].length - 1;
  const end = balanced(handler, open);
  if (handler[end - 1] !== ')') return null;
  return handler.slice(open + 1, end - 1);
}

const RICH_TITLE_TAG = '(?:title|subtitle|heading|subheading|header)';
const RICH_MATH_TAG = '(?:formula|equation|math|mathml|math-block)';

function richMarkupText(value) {
  const source = stripPrivateRichReferences(String(value || ''))
    // Some bridges HTML-escape the protocol before it reaches the client.
    .replace(/&lt;(\/?)(title|subtitle|heading|subheading|header)\b([^&]*?)&gt;/giu, '<$1$2$3>')
    .replace(/&lt;\/(title|subtitle|heading|subheading|header)\s*&gt;/giu, '</$1>');
  const titles = /^(?:title|subtitle|heading|subheading|header)$/iu;
  const wrappers = /^(?:formula|equation|math|mathml|math-block|box|text|stack|row|column|card|callout|rich-text|divider|spacer|div|section|article|form|fieldset|legend|label|badge|icon|list|list-item|radio-group|radio|button|option|Image|AsyncImage|Entity|Link|Cite|Map|Chart)$/iu;
  let text = '', cursor = 0;
  for (const match of source.matchAll(/<\/?([A-Za-z][\w.-]*)(?=[\s/>]|$)/gu)) {
    const start = match.index, name = match[1];
    const declarativeComponent = /^[A-Z][A-Za-z0-9_.-]*$/u.test(name);
    if (start < cursor || (!titles.test(name) && !wrappers.test(name) && !declarativeComponent)) continue;
    text += source.slice(cursor, start);
    const end = tagEnd(source, start);
    cursor = end;
    if (source[end - 1] !== '>') break;
    if (titles.test(name)) text += source[start + 1] === '/' ? '\n\n' : '\n\n### ';
    else if (name.toLowerCase() === 'entity' && source[start + 1] !== '/') {
      const label = attribute(source.slice(start, end), 'value');
      if (label) text += String(literal(label) ?? label);
    }
    else if (/^(?:formula|equation|math|mathml|math-block)$/iu.test(name)) text += '\n';
  }
  text += source.slice(cursor);
  // Retain '< b' inequalities, but withhold a genuine partial component name.
  text = text.replace(/<\/?([A-Za-z][\w.-]*)?$/u, (fragment, name = '') =>
    ['title', 'subtitle', 'heading', 'subheading', 'header', 'formula', 'equation', 'math', 'box', 'text', 'Cite', 'Image', 'Map', 'Chart', 'button', 'select', 'input', 'textarea', 'option']
      .some(tag => tag.toLowerCase().startsWith(name.toLowerCase())) ? '' : fragment);
  return text;
}

function referencedStates(expression, states) {
  const templates = [...String(expression || '').matchAll(/\$\{\s*([A-Za-z_$][\w$]*)\s*\}/gu)].map(match => match[1]);
  const code = String(expression || '').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/gu, '');
  return [...code.matchAll(/\b([A-Za-z_$][\w$]*)\b/gu)]
    .map(match => match[1]).concat(templates).filter(name => states.has(name));
}

// Keep source relationships instead of guessing a question from button labels.
// This reads declarative markup only; event handlers are never executed.
function interactionContexts(input, controls, restore) {
  const scopes = [], stack = [], labels = [], contexts = new Map();
  const sorted = [...controls].sort((a, b) => a.start - b.start);
  const caption = /^(?:legend|label|title|heading|subheading|header|h[1-6]|text|p)$/iu;
  const plain = value => richMarkupText(restore(value)).replace(/<[^>]*>/gu, ' ')
    .replace(/^\s*#{1,6}\s*/gmu, '').replace(/\*\*([^\n]*?)\*\*/gu, (_, text) => text.trim()).replace(/\s+/gu, ' ').trim();
  for (const match of input.matchAll(/<\/?([A-Za-z][\w.-]*)(?=[\s/>])/gu)) {
    const start = match.index;
    if (sorted.some(item => start >= item.start && start < item.end)) continue;
    const end = tagEnd(input, start), opening = input.slice(start, end);
    if (input[end - 1] !== '>') continue;
    const name = match[1].toLowerCase();
    if (opening.startsWith('</')) {
      const index = stack.findLastIndex(item => item.name === name);
      if (index < 0) continue;
      const scope = stack[index];
      scope.end = end; scope.close = start;
      if (caption.test(name)) {
        const content = plain(input.slice(scope.open, start));
        if (content && content.length <= 1200) labels.push({ ...scope, text: content });
      }
      stack.splice(index);
    } else if (!/\/\s*>$/u.test(opening) && !/^(?:input|br|hr|img)$/u.test(name)) {
      const scope = { name, start, open: end, close: input.length, end: input.length,
        parent: stack.at(-1), id: attribute(opening, 'id'),
        ariaLabel: attribute(opening, 'aria-label'), labelledBy: attribute(opening, 'aria-labelledby') };
      scopes.push(scope); stack.push(scope);
    }
  }
  for (const control of sorted) {
    const containers = scopes.filter(item => item.open <= control.start && item.end >= control.end)
      .sort((a, b) => b.start - a.start);
    let selected;
    for (const scope of containers) {
      if (scope.labelledBy) {
        const ids = scope.labelledBy.split(/\s+/u);
        const named = labels.filter(label => ids.includes(label.id));
        if (named.length) { selected = { key: 'label-' + named[0].start, question: named.map(item => item.text).join(' '), captions: named.map(item => [item.start, item.end]) }; break; }
      }
      if (scope.ariaLabel) {
        selected = { key: 'scope-' + scope.start, question: String(literal(scope.ariaLabel) ?? scope.ariaLabel) }; break;
      }
      const before = labels.filter(label => label.start >= scope.open && label.end <= control.start
        && (label.parent === scope || label.name === 'legend'));
      const label = before.at(-1);
      if (label) { selected = { key: 'label-' + label.start, question: label.text, captions: [[label.start, label.end]] }; break; }
    }
    if (!selected) {
      const previous = sorted.filter(item => item.end <= control.start).at(-1);
      const raw = input.slice(previous?.end || 0, control.start).replace(/\{@body[\s\S]*?\}(?=\s*(?:<|$))/gu, '');
      const content = plain(raw);
      if (content && content.length <= 1200) selected = { key: 'text-' + (previous?.end || 0), question: content };
      else if (previous && !raw.replace(/<[^>]*>/gu, '').trim()) selected = contexts.get(previous.start);
    }
    // No text was supplied: retain the action's exact prompt, not an invented title.
    contexts.set(control.start, selected || { key: 'unlabelled', question: '' });
  }
  return contexts;
}

function compile(value) {
  const source = String(value || '');
  if (cache.has(source)) return cache.get(source);
  const maskedResult = maskCode(source), input = expandDeclarativeForms(maskedResult.masked, { balanced, tagEnd });
  const states = new Map(), setters = new Map(), bindings = new Map(), fields = [], buttons = [], spans = [], declarations = [];
  for (const match of input.matchAll(/\{@body\b/giu)) {
    const start = match.index, end = balanced(input, start);
    if (spans.some(([from, to]) => start >= from && start < to)) continue;
    const localStates = new Map(), localSetters = new Map();
    stateDeclarations(input.slice(start, end), localStates, localSetters);
    for (const [name, value] of localStates) states.set(name, value);
    for (const [name, value] of localSetters) setters.set(name, value);
    for (const name of localStates.keys()) bindings.set(name, JSON.stringify([start, name]));
    // Each declaration extends the visible environment. Snapshots retain binding
    // identity so a later question reusing a variable cannot change an earlier one.
    declarations.push({ start, states: new Map(states), setters: new Map(setters), bindings: new Map(bindings) });
    spans.push([start, end]);
  }
  const partialBody = /\{@(?:b(?:o(?:d(?:y)?)?)?)?$/iu.exec(input);
  if (partialBody) spans.push([partialBody.index, input.length]);
  const scopeAt = start => declarations.findLast(scope => scope.start < start) || { states: new Map(), setters: new Map(), bindings: new Map() };
  for (const match of input.matchAll(/<(button|select|input|textarea|radio-group)\b/giu)) {
    const start = match.index, type = match[1].toLowerCase(), openingEnd = tagEnd(input, start);
    if (spans.some(([from, to]) => start >= from && start < to)) continue;
    if (input[openingEnd - 1] !== '>') { spans.push([start, input.length]); continue; }
    const end = elementEnd(input, type, openingEnd);
    const opening = input.slice(start, openingEnd), body = input.slice(openingEnd, end).replace(new RegExp(`</${type}\\s*>$`, 'iu'), '');
    if (type === 'button') {
      const expression = maskedResult.restore(turnExpression(attribute(opening, 'onClick') || attribute(opening, 'onPress')) || '');
      if (expression && /<\/button\s*>$/iu.test(input.slice(start, end))) {
        buttons.push({ label: body.replace(/<[^>]*>/gu, ' ').replace(/\s+/gu, ' ').trim().slice(0, 120), expression, start, end, states: scopeAt(start).states, bindings: scopeAt(start).bindings });
        spans.push([start, end]);
      } else if (end === input.length && /\b(?:onClick|onPress|block)\b/iu.test(opening)) {
        spans.push([start, end]);
      }
    } else {
      const scope = scopeAt(start);
      const field = controlField(type, opening, body, scope.states, scope.setters);
      if (field) {
        let from = start, to = end;
        if (type === 'input' && ['radio', 'checkbox'].includes(field.kind)) {
          const prefix = input.slice(0, start), labelStart = prefix.lastIndexOf('<label'), lastClose = prefix.lastIndexOf('</label');
          if (labelStart > lastClose) {
            const labelOpen = tagEnd(input, labelStart), labelEnd = input.indexOf('</label', end);
            if (labelOpen <= start && labelEnd >= end && !/<input\b/iu.test(input.slice(end, labelEnd))) {
              const label = controlLabel(richMarkupText(input.slice(labelOpen, start) + input.slice(end, labelEnd)));
              if (label) { field.label = label; if (field.option) field.option.label = label; from = labelStart; to = tagEnd(input, labelEnd); }
            }
          }
        }
        fields.push(...(Array.isArray(field) ? field : [field]).map(item => ({ ...item, binding: scope.bindings.get(item.name), start: from, end: to })));
        spans.push([from, to]);
      }
      else if (/\b(?:onChange|onInput|value|checked)\s*=/iu.test(opening)) spans.push([start, end]);
    }
  }
  for (const match of input.matchAll(/GenUI\s*\.\s*issueNewTurn\s*\(/giu)) {
    const start = match.index, end = balanced(input, start + match[0].length - 1);
    if (spans.some(([from, to]) => start >= from && start < to)) continue;
    const expression = maskedResult.restore(input.slice(start + match[0].length, end - 1));
    if (input[end - 1] === ')' && !buttons.some(button => button.expression === expression)) {
      buttons.push({ label: '', expression, start, end, states: scopeAt(start).states, bindings: scopeAt(start).bindings });
      spans.push([start, end]);
    }
  }
  spans.sort((left, right) => left[0] - right[0]);
  const merged = [];
  for (const span of spans) {
    const previous = merged.at(-1);
    if (previous && span[0] <= previous[1]) previous[1] = Math.max(previous[1], span[1]);
    else merged.push([...span]);
  }
  const rich = spans.length > 0 || new RegExp(`<(?:(?:Image|Cite|Map|Chart|${RICH_TITLE_TAG}|${RICH_MATH_TAG})|box|text|stack|row|column|divider|spacer)\\b|[\\uE200-\\uE20F]|\\\\uE2[0-9a-f]{2}|&lt;\\/?(?:${RICH_TITLE_TAG})\\b|turn\\d+(?:search|news|open|find|image)\\d+|<\\/?[A-Za-z]*$`, 'iu').test(input);
  const contexts = interactionContexts(input, fields.concat(buttons), maskedResult.restore);
  for (const field of fields) field.key = JSON.stringify([contexts.get(field.start).key, field.name]);
  const result = { states, fields, buttons, contexts };
  const projectText = (ranges, preserveLayout = false) => {
    const union = [];
    for (const [start, end] of [...ranges].sort((a, b) => a[0] - b[0])) {
      const previous = union.at(-1);
      if (previous && start <= previous[1]) previous[1] = Math.max(end, previous[1]);
      else union.push([start, end]);
    }
    let text = input;
    for (let index = union.length - 1; index >= 0; index--) text = text.slice(0, union[index][0]) + text.slice(union[index][1]);
    if (rich && !preserveLayout) text = richMarkupText(text).replace(/^[ \t]{2,}(?=\S)/gmu, '');
    return maskedResult.restore(text.replace(/\n{3,}/gu, '\n\n').trim());
  };
  result.text = projectText(merged);
  const visibleButtons = buttons.filter(button => resolvedButton(button, result, button.states, true));
  const visibleBindings = new Set(visibleButtons.flatMap(button => referencedStates(button.expression, button.states).map(name => button.bindings?.get(name))));
  const captions = fields.filter(field => visibleBindings.has(field.binding)).concat(visibleButtons)
    .flatMap(item => contexts.get(item.start)?.captions || []);
  result.displayText = captions.length ? projectText(merged.concat(captions)) : result.text;
  result.layoutSource = projectText(merged.concat(captions), true);
  if (source.length <= 256 * 1024) {
    while (cache.size && (cache.size >= 24 || cacheCharacters + source.length > 512 * 1024)) {
      const oldest = cache.keys().next().value;
      cacheCharacters -= oldest.length;
      cache.delete(oldest);
    }
    cache.set(source, result);
    cacheCharacters += source.length;
  }
  return result;
}

export function extractKuanRichFields(value) {
  return compile(value).fields.slice(0, 16).map(({ start, end, ...field }) => field);
}

function selectedStates(result, selections, button) {
  const states = new Map(button.states), context = result.contexts.get(button.start).key;
  for (const field of result.fields.filter(field => fieldBelongsToButton(field, button, result, context))) {
    // Legacy name-only selections are accepted only when the name is unambiguous.
    const unique = new Set(result.fields.filter(item => item.name === field.name).map(item => item.key)).size === 1;
    const key = Object.hasOwn(selections, field.key) ? field.key : unique ? field.name : null;
    if (key === null || !Object.hasOwn(selections, key)) continue;
    const selected = selections[key];
    if (field.kind === 'select' && field.options.some(option => String(option.value) === String(selected))) states.set(field.name, selected);
    else if (field.kind === 'radio' && String(field.option.value) === String(selected)) states.set(field.name, selected);
    else if (field.kind === 'checkbox' && typeof selected === 'boolean') states.set(field.name, selected);
    else if (['text', 'textarea'].includes(field.kind) && String(selected).length <= 500) states.set(field.name, String(selected));
  }
  return states;
}

function fieldBelongsToButton(field, button, result, context) {
  const binding = button.bindings?.get(field.name);
  return binding ? field.binding === binding : result.contexts.get(field.start).key === context;
}

function resolvedButton(button, result, states, allowEmpty = false) {
  const context = result.contexts.get(button.start).key;
  if (referencedStates(button.expression, button.states).some(name => !result.fields.some(field => field.name === name && fieldBelongsToButton(field, button, result, context)))) return null;
  const prompt = evaluate(button.expression, states);
  if (prompt == null) return null;
  const text = String(prompt).trim();
  if (text.length > 4000 || (!text && (!allowEmpty || !button.label))) return null;
  return { id: 'turn-' + button.start, label: button.label || text.slice(0, 80), prompt: text };
}

export function extractKuanRichFollowUps(value, selections = {}) {
  const result = compile(value), seen = new Set();
  return result.buttons.flatMap(button => {
    const item = resolvedButton(button, result, selectedStates(result, selections, button));
    if (!item || seen.has(item.prompt)) return [];
    seen.add(item.prompt);
    return [item];
  }).slice(0, 8);
}

export function extractKuanRichInteractions(value, selections = {}) {
  const result = compile(value), groups = new Map();
  const ensure = item => {
    const context = result.contexts.get(item.start) || { key: 'unlabelled', question: '' };
    if (!groups.has(context.key)) groups.set(context.key, { id: context.key, question: context.question, fields: [], buttons: [] });
    return groups.get(context.key);
  };
  for (const { start, end, ...field } of result.fields.slice(0, 16)) {
    const group = ensure({ start });
    group.fields.push({ ...field, label: group.question && field.label === field.name ? '' : field.label });
  }
  for (const button of result.buttons) {
    const group = ensure(button), item = resolvedButton(button, result, selectedStates(result, selections, button), true);
    if (item && group.buttons.length < 8) group.buttons.push(item);
  }
  const referenced = new Set(result.buttons.flatMap(button => resolvedButton(button, result, selectedStates(result, selections, button), true)
    ? referencedStates(button.expression, button.states).map(name => button.bindings?.get(name)).filter(Boolean) : []));
  return [...groups.values()].filter(group => group.buttons.length || group.fields.some(field => referenced.has(field.binding))).slice(0, 16);
}

export function normalizeKuanRichAssistantText(value, presentation, streaming = false) {
  return compile(resolveRichPresentation(value, presentation, streaming)).text;
}

export function normalizeKuanRichDisplayText(value, presentation, streaming = false) {
  const result = compile(resolveRichPresentation(value, presentation, streaming));
  // Keep captions visible while streaming; finished controls own them afterwards.
  return streaming ? result.text : result.displayText;
}

export function normalizeKuanRichHistoryText(value, presentation) {
  return compile(resolveRichPresentation(value, presentation, false, true)).text;
}

// Preserve semantic layout from native declarations, never their executable
// props or arbitrary CSS. Markdown leaves still use the host's normal sanitizer.
export function projectKuanRichLayout(value, presentation, streaming = false) {
  const source = compile(resolveRichPresentation(value, presentation, streaming)).layoutSource;
  if (source.length > 256 * 1024 || !/<(?:box|row|column|stack|grid|card|callout|title|heading|badge)\b/iu.test(source)) return null;
  const code = maskCode(source, false), input = code.masked;
  const root = { kind: 'stack', children: [] }, stack = [{ node: root, tag: '' }];
  let cursor = 0, nodes = 0;
  const append = text => {
    const markup = richMarkupText(text);
    let at = 0;
    const leaf = value => {
      const plain = code.restore(value).trim();
      if (plain) stack.at(-1).node.children.push({ kind: 'markdown', text: plain });
    };
    for (const figure of markup.matchAll(/<figure\b[^>]*class="kuan-native-media"[^>]*>[\s\S]*?<\/figure>/gu)) {
      leaf(markup.slice(at, figure.index)); leaf(figure[0]); at = figure.index + figure[0].length;
    }
    leaf(markup.slice(at));
  };
  for (const match of input.matchAll(/<\/?(box|row|column|stack|grid|card|callout|text|title|subtitle|heading|subheading|badge|divider|spacer)\b/giu)) {
    const start = match.index;
    if (start < cursor) continue;
    append(input.slice(cursor, start));
    const end = tagEnd(input, start), opening = input.slice(start, end), tag = match[1].toLowerCase();
    if (input[end - 1] !== '>') { cursor = input.length; break; }
    if (opening.startsWith('</')) {
      const index = stack.findLastIndex(item => item.tag === tag);
      if (index > 0) stack.splice(index);
    } else {
      if (++nodes > 256 || stack.length > 12) return null;
      const parent = stack.at(-1).node;
      const kind = /^(?:title|subtitle|heading|subheading)$/u.test(tag) ? 'heading'
        : tag === 'row' ? 'row' : tag === 'grid' ? 'grid' : tag === 'badge' ? 'badge'
        : tag === 'divider' ? 'divider' : tag === 'spacer' ? 'space'
        : (tag === 'card' || tag === 'callout' || tag === 'box' && /\bborder\b/iu.test(opening)) && parent.kind !== 'callout' ? 'callout' : 'stack';
      const node = { kind, children: [] };
      parent.children.push(node);
      if (!/\/\s*>$/u.test(opening) && !['divider', 'spacer'].includes(tag)) stack.push({ tag, node });
    }
    cursor = end;
  }
  append(input.slice(cursor));
  return nodes ? root : null;
}

export function mapKuanRichProse(value, transform) {
  const masked = maskCode(String(value || ''), false);
  return masked.restore(transform(masked.masked));
}

export function splitKuanRichCitationSection(value) {
  const original = String(value || '');
  const masked = maskCode(original, false);
  const source = masked.masked;
  const header = /(?:^|\n)[ \t]{0,3}(?:#{1,6}[ \t]+)?(?:\*\*|__)?(?:来源|参考来源|参考资料|引用来源|sources?|references?|citations?)[：:]?(?:\*\*|__)?[：:]?[ \t]*(?:#+[ \t]*)?\r?\n(?:[ \t]*\r?\n)?/giu;
  const entry = /^[ \t]{0,3}(?:[-*+]|\d+[.)])[ \t]+\[((?:\\.|[^\]\\\r\n]){1,500})\]\((?:<(https?:\/\/[^<>\s]+)>|(https?:\/\/[^\s<>]+?))(?:[ \t]+"[^"\r\n]*")?\)[ \t]*\r?(?:\n|$)$/iu;
  const ranges = [], links = [], blocks = [];
  for (const match of source.matchAll(header)) {
    const start = match.index + match[0].length;
    let end = start;
    const at = links.length;
    const lines = /[^\n]*(?:\n|$)/gu;
    lines.lastIndex = start;
    for (let line; (line = lines.exec(source)) && line[0];) {
      const link = entry.exec(line[0]);
      if (!link || links.length >= 128) break;
      const url = link[2] || link[3];
      if (url.includes('\\') || url.includes('\uE100')) break;
      // Reject an incomplete Markdown destination while the reply is streaming.
      let depth = 0;
      if (!link[2] && [...url].some(char => char === '(' ? (++depth, false) : char === ')' && --depth < 0) || depth !== 0) break;
      links.push({ title: masked.restore(link[1]).replace(/\\([\[\]\\])/gu, '$1'), url });
      end = lines.lastIndex;
    }
    if (links.length === at) continue;
    ranges.push([match.index, end]);
    blocks.push(masked.restore(source.slice(start, end).trim()));
  }
  if (!ranges.length) return { body: original, sources: '', links };
  const prose = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    prose.push(source.slice(cursor, start).trimEnd().replace(/^(?:[ \t]*\r?\n)+/u, ''));
    cursor = end;
  }
  prose.push(source.slice(cursor).replace(/^(?:[ \t]*\r?\n)+/u, ''));
  return { body: masked.restore(prose.filter(Boolean).join('\n\n')), sources: blocks.join('\n\n'), links };
}
