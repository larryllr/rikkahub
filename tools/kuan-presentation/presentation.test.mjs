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

test('rich media resolves at the exact tag or private-token position without a footer', () => {
  const first = 'https://images.example.com/first.png';
  const second = 'https://images.example.com/second.png';
  const source = 'Opening.\n\n<AsyncImageGroup query={["site"]}/>\n\n### CUDA\n\nA section.\n\n'
    + '\uE200image_group\uE202{"query":["chip","missing"]}\uE201\n\nConclusion.';
  const images = [
    { query: 'chip', url: second },
    { query: 'site', url: first },
    { query: 'unrelated', url: 'https://images.example.com/unused.png' },
  ];
  const result = project(source, {}, false, false, images);
  assert.match(result.text, /Opening\.[\s\S]*first\.png[\s\S]*### CUDA[\s\S]*second\.png[\s\S]*Conclusion\.$/u);
  assert.deepEqual(result.inlineImages, [first, second]);
  assert.match(result.history, /Opening\.[\s\S]*CUDA[\s\S]*Conclusion\./u);
  assert.doesNotMatch(result.history, /first\.png|second\.png|image_group/u);
  assert.equal(project(source, {}, true).text.includes('AsyncImage'), false);
  assert.equal(project(source, {}, true).text.includes('\u56fe\u7247'), false);
});

test('image instructions cannot invent a URL and Markdown examples remain byte-for-byte', () => {
  const code = '\u0060'.repeat(3) + 'jsx\n<AsyncImage query="site" />\n' + '\u0060'.repeat(3);
  const bare = '\u0060<AsyncImage query="site" />\u0060';
  const source = code + '\n\n' + bare + '\n\n<AsyncImage query="site" />\n\nEnd.';
  const result = project(source, {}, false, false, [{ query: 'site', url: 'javascript:alert(1)' }]);
  assert.equal(result.text, code + '\n\n' + bare + '\n\nEnd.');
  assert.deepEqual(result.inlineImages, []);
});

test('grid and grid-item lay out both pieces of prose without touching real code', () => {
  const code = '\u0060'.repeat(3) + 'jsx\n<grid-item>Example code</grid-item>\n' + '\u0060'.repeat(3);
  for (const grid of [
    '<grid columns={2} gap={2}><grid-item>**Training**\n\nLearn patterns.</grid-item><grid-item>**Inference**\n\nUse patterns.</grid-item></grid>',
    '&lt;grid columns={2}&gt;&lt;grid-item&gt;**Training**\n\nLearn patterns.&lt;/grid-item&gt;&lt;grid-item&gt;**Inference**\n\nUse patterns.&lt;/grid-item&gt;&lt;/grid&gt;',
  ]) {
    const result = project('Comparison\n\n' + grid + '\n\n' + code + '\n\nNext paragraph.');
    assert.equal(result.text, 'Comparison\n\n**Training**\n\nLearn patterns.\n\n**Inference**\n\nUse patterns.\n\n' + code + '\n\nNext paragraph.');
    assert.equal(project(grid, {}, true).text, result.text.split(code)[0].replace('Comparison\n\n', '').trimEnd());
  }
});
