import { Parser } from 'acorn';
import jsx from 'acorn-jsx';

const parser = Parser.extend(jsx()), unknown = Symbol('unsupported');
const options = { ecmaVersion: 'latest', sourceType: 'module', preserveParens: true };
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
const escape = value => String(value).replace(/[&<>"']/gu, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const scalar = value => value === null || ['string', 'number', 'boolean'].includes(typeof value);

// Read bounded data only. No globals, assignment, arbitrary calls or JS execution.
function data(node, env, budget) {
  if (!node || --budget.steps < 0) return unknown;
  const read = child => data(child, env, budget);
  switch (node.type) {
    case 'ParenthesizedExpression': return read(node.expression);
    case 'Literal': return node.regex || node.bigint ? unknown : node.value;
    case 'Identifier': return env.has(node.name) ? env.get(node.name) : unknown;
    case 'ArrayExpression': {
      if (node.elements.length > 64) return unknown;
      const values = node.elements.map(read);
      return values.includes(unknown) ? unknown : values;
    }
    case 'ObjectExpression': {
      if (node.properties.length > 32) return unknown;
      const object = Object.create(null);
      for (const p of node.properties) {
        if (p.type !== 'Property' || p.kind !== 'init' || p.method) return unknown;
        const key = p.computed ? read(p.key) : p.key.name ?? p.key.value, value = read(p.value);
        if (typeof key !== 'string' || forbidden.has(key) || value === unknown) return unknown;
        object[key] = value;
      }
      return object;
    }
    case 'MemberExpression': {
      const object = read(node.object), key = node.computed ? read(node.property) : node.property.name;
      if (object === unknown || object == null || forbidden.has(String(key))) return unknown;
      if (key === 'length' && (Array.isArray(object) || typeof object === 'string')) return object.length;
      return typeof object === 'object' && Object.hasOwn(object, key) ? object[key] : unknown;
    }
    case 'TemplateLiteral': {
      let result = node.quasis[0].value.cooked;
      for (let i = 0; i < node.expressions.length; i++) {
        const value = read(node.expressions[i]);
        if (!scalar(value)) return unknown;
        result += String(value ?? '') + node.quasis[i + 1].value.cooked;
      }
      return result.length <= 16000 ? result : unknown;
    }
    case 'UnaryExpression': {
      const value = read(node.argument);
      if (!scalar(value)) return unknown;
      if (node.operator === '!') return !value;
      return node.operator === '-' && typeof value === 'number' ? -value : unknown;
    }
    case 'BinaryExpression': {
      const a = read(node.left), b = read(node.right);
      if (!scalar(a) || !scalar(b)) return unknown;
      if (node.operator === '+') return String(a + b).length <= 16000 ? a + b : unknown;
      if (node.operator === '===') return a === b;
      if (node.operator === '!==') return a !== b;
      return unknown;
    }
    case 'LogicalExpression': {
      const a = read(node.left);
      if (a === unknown) return unknown;
      if (node.operator === '&&') return a ? read(node.right) : a;
      if (node.operator === '||') return a ? a : read(node.right);
      return node.operator === '??' ? a == null ? read(node.right) : a : unknown;
    }
    case 'ConditionalExpression': {
      const condition = read(node.test);
      return condition === unknown ? unknown : read(condition ? node.consequent : node.alternate);
    }
    case 'CallExpression': {
      if (node.callee.type !== 'MemberExpression' || node.callee.computed || node.callee.property.name !== 'join' || node.arguments.length > 1) return unknown;
      const list = read(node.callee.object), separator = node.arguments.length ? read(node.arguments[0]) : ',';
      if (!Array.isArray(list) || !list.every(scalar) || typeof separator !== 'string') return unknown;
      const result = list.join(separator);
      return result.length <= 16000 ? result : unknown;
    }
    default: return unknown;
  }
}

export function declarativeValue(source, env = new Map()) {
  if (typeof source !== 'string' || source.length > 65536) return undefined;
  try {
    const node = parser.parseExpressionAt(source, 0, options);
    if (source.slice(node.end).trim()) return undefined;
    const result = data(node, env, { steps: 4096 });
    return result === unknown ? undefined : result;
  } catch { return undefined; }
}

function remember(body, env) {
  if (body.length > 65536) return;
  try {
    for (const statement of parser.parse(body, options).body) {
      if (statement.type !== 'VariableDeclaration') continue;
      for (const d of statement.declarations) {
        const init = d.init;
        if (d.id.type === 'Identifier') {
          const value = data(init, env, { steps: 4096 });
          if (value !== unknown) env.set(d.id.name, value);
        } else if (d.id.type === 'ArrayPattern' && init?.type === 'CallExpression'
            && init.callee.type === 'MemberExpression' && !init.callee.computed
            && init.callee.object.name === 'DIL' && init.callee.property.name === 'useState') {
          const value = data(init.arguments[0], env, { steps: 4096 });
          if (value !== unknown && d.id.elements[0]?.type === 'Identifier') env.set(d.id.elements[0].name, value);
        }
      }
    }
  } catch { /* A partial declaration is not executable content. */ }
}

function substitute(node, source, locals) {
  const constant = data(node, locals, { steps: 4096 });
  if (constant !== unknown) return JSON.stringify(constant);
  const edits = [];
  const walk = (item, parent, key) => {
    if (!item || typeof item !== 'object') return;
    if (item.type === 'Identifier' && locals.has(item.name)
        && !(parent?.type === 'MemberExpression' && key === 'property' && !parent.computed)
        && !(parent?.type === 'Property' && key === 'key' && !parent.computed)) {
      edits.push([item.start - node.start, item.end - node.start, JSON.stringify(locals.get(item.name))]); return;
    }
    if (item.type === 'ArrowFunctionExpression' && item.params.length) return;
    for (const [childKey, child] of Object.entries(item)) {
      if (Array.isArray(child)) child.forEach(value => walk(value, item, childKey));
      else if (child && typeof child === 'object') walk(child, item, childKey);
    }
  };
  walk(node);
  let output = source.slice(node.start, node.end);
  for (const [start, end, value] of edits.sort((a, b) => b[0] - a[0])) output = output.slice(0, start) + value + output.slice(end);
  return output;
}

function markup(node, source, env, locals, budget) {
  if (!node || --budget.steps < 0) return null;
  const scope = new Map([...env, ...locals]);
  const render = (child, local = locals) => markup(child, source, env, local, budget);
  if (node.type === 'ParenthesizedExpression') return render(node.expression);
  if (node.type === 'JSXText') return node.value;
  if (node.type === 'JSXExpressionContainer') return render(node.expression);
  if (node.type === 'JSXEmptyExpression') return '';
  if (node.type === 'JSXFragment') {
    const children = node.children.map(child => render(child));
    return children.includes(null) ? null : children.join('');
  }
  if (node.type === 'JSXElement') {
    const opening = node.openingElement;
    if (opening.name.type !== 'JSXIdentifier' || ++budget.elements > 512) return null;
    const name = opening.name.name;
    let attrs = '';
    for (const attr of opening.attributes) {
      if (attr.type !== 'JSXAttribute' || attr.name.type !== 'JSXIdentifier') return null;
      attrs += ' ' + attr.name.name;
      if (attr.value?.type === 'Literal') attrs += '=' + JSON.stringify(attr.value.value);
      else if (attr.value?.type === 'JSXExpressionContainer') attrs += '={' + substitute(attr.value.expression, source, locals) + '}';
      else if (attr.value) return null;
    }
    if (opening.selfClosing) return '<' + name + attrs + '/>';
    const children = node.children.map(child => render(child));
    return children.includes(null) ? null : '<' + name + attrs + '>' + children.join('') + '</' + name + '>';
  }
  if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && !node.callee.computed
      && node.callee.property.name === 'map' && node.arguments.length === 1) {
    const values = data(node.callee.object, scope, budget), callback = node.arguments[0];
    if (!Array.isArray(values) || values.length > 64 || callback.type !== 'ArrowFunctionExpression'
        || callback.params.length < 1 || callback.params.length > 2 || !callback.params.every(param => param.type === 'Identifier')) return null;
    const body = callback.body.type === 'BlockStatement' && callback.body.body.length === 1
      && callback.body.body[0].type === 'ReturnStatement' ? callback.body.body[0].argument : callback.body;
    const children = values.map((value, index) => {
      const next = new Map(locals); next.set(callback.params[0].name, value);
      if (callback.params[1]) next.set(callback.params[1].name, index);
      return render(body, next);
    });
    return children.includes(null) ? null : children.join('');
  }
  if (node.type === 'ConditionalExpression') {
    const condition = data(node.test, scope, budget);
    return condition === unknown ? null : render(condition ? node.consequent : node.alternate);
  }
  const value = data(node, scope, budget);
  return scalar(value) ? value == null || typeof value === 'boolean' ? '' : escape(value) : null;
}

export function expandDeclarativeForms(source, { balanced, tagEnd }) {
  if (!/\{@body\b|<radio-group\b/u.test(source)) return source;
  const env = new Map(), budget = { steps: 8192, elements: 0 };
  let output = '', cursor = 0;
  while (cursor < source.length) {
    const char = source[cursor];
    if (char === '<' && /[A-Za-z/]/u.test(source[cursor + 1] || '')) {
      const end = tagEnd(source, cursor); output += source.slice(cursor, end); cursor = end; continue;
    }
    if (source.startsWith('{@body', cursor)) {
      const end = balanced(source, cursor);
      remember(source.slice(cursor + 6, end - 1), env);
      output += source.slice(cursor, end); cursor = end; continue;
    }
    if (char === '{') {
      const end = balanced(source, cursor), expression = source.slice(cursor + 1, end - 1);
      try {
        if (expression.length > 65536 || source[end - 1] !== '}') throw Error('Incomplete or oversized expression');
        const node = parser.parseExpressionAt(expression, 0, options);
        if (!expression.slice(node.end).trim() && (node.type.startsWith('JSX') || /\.map\s*\(/u.test(expression) || node.type === 'Identifier' && env.has(node.name))) {
          const result = markup(node, expression, env, new Map(), budget);
          output += result === null || result.length > 262144 ? '<text>此交互暂不支持，请直接回复你的选择。</text>' : result;
          cursor = end; continue;
        }
      } catch { /* Withhold partial rich expressions while streaming. */ }
      if (/\.map\s*\(/u.test(expression) || /^\s*[^\n]*=>/u.test(expression)) {
        if (source[end - 1] === '}') output += '<text>此交互暂不支持，请直接回复你的选择。</text>';
        cursor = end; continue;
      }
    }
    output += char; cursor++;
  }
  return output;
}
