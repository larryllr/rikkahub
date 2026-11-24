import assert from 'node:assert/strict';
import test from 'node:test';
import { project } from './entry.mjs';

test('separate questions keep their actual options and share one submit', () => {
  const source = '<box><title>Language</title>{@body const [a,setA]=DIL.useState("Kotlin")}'
    + '<select value={a} onChange={setA}><option value="Kotlin">Kotlin</option><option value="Java">Java</option></select>'
    + '<title>Target</title>{@body const [b,setB]=DIL.useState("Phone")}'
    + '<select value={b} onChange={setB}><option value="Phone">Phone</option><option value="Tablet">Tablet</option></select>'
    + '<button onClick={()=>GenUI.issueNewTurn(a+" / "+b)}>Continue</button></box>';
  const initial = project(source);
  assert.deepEqual(initial.groups.map(group => group.question), ['Language', 'Target']);
  const selections = Object.fromEntries(initial.groups.map((group, i) => [group.fields[0].key, ['Java', 'Tablet'][i]]));
  const result = project(source, selections);
  assert.equal(result.groups[1].buttons[0].prompt, 'Java / Tablet');
  assert.equal(result.groups[1].buttons[0].id, initial.groups[1].buttons[0].id);
  assert.equal(result.text.includes('Language'), false);
  assert.match(result.history, /Language/);
  assert.match(result.history, /Target/);
});

test('source fences, formulas, citations and literal repetitions keep their bytes', () => {
  const fence = '\u0060'.repeat(3);
  const body = ['same same', '', fence + 'js', 'const value = "<button>test</button>";',
    fence, '', '$x^2$', '', '[Link](https://example.com)'].join('\n');
  assert.equal(project(body).text, body);
  assert.equal(project(body, {}, true).text, body);
  assert.deepEqual(project(body).groups, []);
});

test('unbound values and arbitrary functions do not turn into actions', () => {
  const source = '<button onClick={()=>GenUI.issueNewTurn(globalThis.evil())}>Continue</button>';
  assert.deepEqual(project(source).groups, []);
});

test('an initially empty real text field can produce a draft', () => {
  const source = '<box><title>Destination</title>{@body const [a,setA]=DIL.useState("")}'
    + '<input aria-label="City" value={a} onChange={setA}/>'
    + '<button onClick={()=>GenUI.issueNewTurn(a)}>Next</button></box>';
  const initial = project(source);
  const group = initial.groups[0];
  assert.equal(group.question, 'Destination');
  assert.equal(group.buttons[0].prompt, '');
  assert.equal(initial.text.includes('Destination'), false);
  const selected = project(source, { [group.fields[0].key]: 'Shanghai' });
  assert.equal(selected.groups[0].buttons[0].prompt, 'Shanghai');
});

test('classic source lists fold independently while inline links and source code stay in the answer', () => {
  const fence = '\u0060'.repeat(3);
  const code = [fence + 'markdown', '### Sources', '- [Example](https://example.com/in-code)', fence].join('\n');
  const paragraph = 'Read [the inline link](https://example.com/inline) and continue.';
  const source = [paragraph, '', code, '', '### \u53c2\u8003\u8d44\u6599\uff1a',
    '- [A \\[quoted\\] title](https://example.org/wiki/Part_(text) "Article")',
    '2. [B](<https://example.net/path%20with%20space>)',
    '', 'Text after the sources.', '', '**References:**', '', '- [C](https://example.com/c)',
    'A final paragraph.'].join('\n');
  const result = project(source, {}, false, true);
  assert.deepEqual(result.links, [
    { title: 'A [quoted] title', url: 'https://example.org/wiki/Part_(text)' },
    { title: 'B', url: 'https://example.net/path%20with%20space' },
    { title: 'C', url: 'https://example.com/c' },
  ]);
  assert.equal(result.text, [paragraph, code, 'Text after the sources.', 'A final paragraph.'].join('\n\n'));
  assert.equal(result.history, source);
  assert.equal(project(source, {}, true, true).text, source);
});

test('a normal list or incomplete source destination is not removed', () => {
  for (const text of [
    '- [Options](https://example.com/options)',
    '### Sources\n- [Bad](https://example.com/unclosed(foo)',
    '    Sources\n    - [Indented example](https://example.com/indented)',
    '### Sources\n- [Not a series](https://example.com/page) describes an ordinary list item.',
  ]) {
    const result = project(text, {}, false, true);
    assert.equal(result.text, text);
    assert.deepEqual(result.links, []);
  }
});

test('independent actions with identical local variable names keep their own question context', () => {
  const form = (question, start, end, label) => '<box><title>' + question + '</title>'
    + '{@body const [a,setA]=DIL.useState("' + start + '")}'
    + '<select value={a} onChange={setA}><option>' + start + '</option><option>' + end + '</option></select>'
    + '<button onClick={()=>GenUI.issueNewTurn(a)}>' + label + '</button></box>';
  const input = form('Flavor?', 'Mint', 'Lemon', 'Choose flavor') + '\n\n' + form('Size?', 'Small', 'Large', 'Choose size');
  const { groups } = project(input);
  assert.deepEqual(groups.map(group => group.question), ['Flavor?', 'Size?']);
  const [first, second] = groups.map(group => group.fields[0].key);
  assert.notEqual(first, second);
  const selected = project(input, { [first]: 'Lemon', [second]: 'Large' });
  assert.deepEqual(selected.groups.map(group => group.buttons[0].prompt), ['Lemon', 'Large']);
});
