const MAX_PACKET = 8192;
const START = '\uE200', END = '\uE201', SEPARATOR = '\uE202';
const SLOT_START = '\uE000', SLOT_END = '\uE001';
const citation = /^(?:i|cite|filecite|memcite)$/u;
const reference = /^(?:turn\d+[a-z_]+\d+|UM|GM|PC|\d+|user_memory|general_memory|past_conversation|user_instructions)$/iu;
const completeReference = /^(?:[\w.:-]{1,128})(?:\uE202[\w.:-]{1,128}){0,31}$/u;
export const protocolControl = /[\uE000-\uE0FF\uE102-\uF8FF]|\\u(?:\{0{0,2}e(?:00[01]|20[0-9a-f])\}|e(?:00[01]|20[0-9a-f]))|\[citefilecite\b/iu.source;

export function decodeWireDelimiters(text) {
  return text.replace(/(?<!\\)\\u(?:\{(0{0,2}e(?:00[01]|20[0-9a-f]))\}|(e(?:00[01]|20[0-9a-f])))/giu,
    (_, braced, fixed) => String.fromCharCode(parseInt(braced || fixed, 16)));
}

// Called on prose, after Markdown code has been masked. No packet can consume
// the next paragraph, another packet, or a masked literal code span.
export function rewriteWebInline(value, visit = () => '', streaming = false) {
  const text = decodeWireDelimiters(value);
  const marker = /\uE100KUAN_(?:CODE|BLOCK)_\d+\uE101|[\uE000-\uF8FF]|\[citefilecite\b/giu;
  let cursor = 0, output = '';
  for (let hit; (hit = marker.exec(text));) {
    const start = hit.index, token = hit[0];
    output += text.slice(cursor, start);
    let end = marker.lastIndex;
    if (token.length > 1 && token[0] === '\uE100') {
      output += token;
    } else if (token === SLOT_START) {
      const slot = /^DIL(\d{1,9})\uE001/u.exec(text.slice(end, end + 14));
      if (slot) {
        output += visit({ kind: 'dil', slot: 'DIL' + slot[1], start, end: end + slot[0].length });
        end += slot[0].length;
      } else {
        const partial = /^(?:D(?:I(?:L\d{0,9})?)?)?(?=$|[\s\uE000\uE200])/u.exec(text.slice(end, end + 14));
        if (partial) end += partial[0].length;
      }
    } else if (token === START) {
      const name = /^[a-z_][a-z0-9_.-]{0,63}/iu.exec(text.slice(end, end + 65));
      if (!name) { cursor = end; continue; }
      const head = end + name[0].length, kind = name[0].toLowerCase();
      if (text[head] === END) {
        end = head + 1;
        output += visit({ kind, body: '', start, end });
      } else if (text[head] === SEPARATOR) {
        const payload = head + 1;
        const look = text.slice(payload, payload + MAX_PACKET);
        const boundary = /\r?\n[ \t]*\r?\n|[\uE000\uE100\uE200]/u.exec(look)?.index ?? look.length;
        const close = look.indexOf(END);
        if (close !== -1 && close < boundary && (citation.test(kind)
          ? completeReference.test(look.slice(0, close)) || wirePayload(look.slice(0, close))
          : !/\r?\n/u.test(look.slice(0, close)) || /^[ \t]*[{[]/u.test(look))) {
          end = payload + close + 1;
          output += visit({ kind, body: look.slice(0, close), start, end });
        } else {
          end = payload;
          if (citation.test(kind)) {
            const refs = /^(?:[\w.:-]{1,128})(?:\uE202[\w.:-]{1,128}){0,31}/u.exec(look)?.[0] || '';
            const protocolRefs = refs.split(SEPARATOR);
            if (refs && protocolRefs.every(id => reference.test(id)) || streaming && refs === look) end += refs.length;
          } else if (/^[ \t]*[{[]/u.test(look)) {
            // A malformed structured packet can be discarded up to this line,
            // but unrelated text after a newline is never part of recovery.
            end += look.search(/[\r\n\uE000\uE100\uE200]/u) < 0 ? look.length : look.search(/[\r\n\uE000\uE100\uE200]/u);
          }
        }
      } else if (head === text.length || /[\r\n\uE000\uE200]/u.test(text[head])) {
        end = head;
      }
    } else if (token[0] === '[') {
      const refs = /^(?:[\s\uE202:])*((?:turn\d+[a-z_]+\d+|file[-_][\w-]+)(?:[ \uE202,]+(?:turn\d+[a-z_]+\d+|file[-_][\w-]+))*)[ \t]*(?:\]|\uE201)/iu.exec(text.slice(end, end + 1024));
      if (refs) {
        end += refs[0].length;
        output += visit({ kind: 'filecite', body: refs[1].replace(/[ ,]+/gu, SEPARATOR), start, end });
      }
    }
    cursor = end;
    marker.lastIndex = end;
  }
  return output + text.slice(cursor);
}

export function wirePayload(body) {
  if (!body || !/^[\s]*[{[]/u.test(body)) return null;
  try { return JSON.parse(body); } catch { return null; }
}

export const wireReferenceSeparator = SEPARATOR;
