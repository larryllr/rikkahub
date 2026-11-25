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

test('standalone badges project from raw and bridged tags without changing the formula', () => {
  const before = '\u6240\u4ee5\uff1a';
  const answer = '\u7b54\u6848';
  const after = '$$\n\\boxed{\\frac{\\Delta U}{\\Delta I}=-r}\n$$\n\nIf $a < r$, keep the inequality.';
  for (const badge of [
    `<badge color="success" size="lg">${answer}</badge>`,
    `&lt;badge color=&quot;success&quot; size=&quot;lg&quot;&gt;${answer}&lt;/badge&gt;`,
  ]) {
    const body = `${before}\n\n${badge}\n\n${after}`;
    const expected = `${before}\n\n**${answer}**\n\n${after}`;
    const final = project(body);
    assert.equal(final.text, expected);
    assert.equal(final.history, expected);
    assert.deepEqual(final.groups, []);
    assert.equal(project(body, {}, true).text, expected);
  }
});

test('native tag detection uses complete names and holds partial tags only while streaming', () => {
  for (const tag of ['<ba', '<badge color="succ', '&l', '&lt;ba', '&lt;badge color=&quot;succ', '</bad']) {
    assert.equal(project(`Start.\n\n${tag}`, {}, true).text, 'Start.');
  }
  for (const source of ['Compare a<r', 'Literal <badge-demo> suffix', 'Literal \\<badge>']) {
    assert.equal(project(source).text, source);
  }
  const code = [
    '`<badge>demo</badge>`',
    'Show ``<badge label="`">Quoted</badge>``.',
    '```html\n<badge>Example</badge>\n````',
    '~~~html\n<badge>Tilde example</badge>\n~~~~',
  ].join('\n\n');
  assert.equal(project(`${code}\n\n<badge>Real</badge><badge>Next</badge>`).text, `${code}\n\n**Real** **Next**`);
  assert.equal(project('Read.\n\n<card><list><list-item>One</list-item></list></card>').text, 'Read.\n\nOne');
});

const slot = n => '\uE000DIL' + n + '\uE001';
const wire = (type, body) => '\uE200' + type + '\uE202' + body + '\uE201';
const presentation = (components, anchors = [], references = []) => ({
  version: 1, source: 'chatgpt', message_id: 'message-1', revision: 1, components, anchors, references,
});

test('unclosed or unknown packets do not eat later prose, whitespace or boxed math', () => {
  const tail = '\n\nKeep this paragraph.\n\n    keep these spaces\n\n$$\\boxed{x^2}$$.';
  const broken = 'Before \uE200cite\uE202turn0search0';
  for (const streaming of [true, false]) {
    const result = project(broken + tail, {}, streaming);
    assert.equal(result.text, 'Before ' + tail);
    assert.equal(project('Read ' + wire('unknown_card', '{"type":"x"}') + ' next.', {}, streaming).text, 'Read  next.');
    assert.deepEqual(project(wire('unknown_card', '')).unknown, ['unknown_card']);
  }
  const syntax = '\u0060' + wire('cite', 'turn0search0') + ' ' + slot(3) + '\u0060';
  const fenced = '\u0060'.repeat(3) + 'text\n' + wire('unknown_card', '{}') + '\n' + '\u0060'.repeat(3);
  assert.equal(project(syntax + '\n\n' + fenced + tail).text, syntax + '\n\n' + fenced + tail);
  assert.equal(project('A \\uE200cite\\uE202turn0search0\n\nB').text, 'A \n\nB');
});

test('slot and component identity survive out-of-order same-kind results', () => {
  const first = { id: 'first', kind: 'AsyncImage', query: 'same', status: 'resolved',
    images: [{ url: 'https://images.example.com/first.png' }, { url: 'https://images.example.com/second.png' }] };
  const second = { id: 'second', kind: 'AsyncImage', query: 'same', status: 'resolved',
    images: [{ url: 'https://images.example.com/third.png' }] };
  const body = 'Opening.' + slot(7) + 'Between.' + slot(1) + 'Closing.';
  const anchors = [{ slot_id: 'DIL1', component_id: 'second' }, { slot_id: 'DIL7', component_id: 'first' }];
  const projectWith = (rows, streaming = false) => project(body, {}, streaming, false, [], presentation(rows, anchors));
  const loading = projectWith([second], true);
  assert.deepEqual(loading.blocks.map(item => item.status), ['pending', 'resolved']);
  const finished = projectWith([second, first, first]);
  assert.deepEqual(finished.blocks.map(item => item.images.map(i => i.url)), [first.images.map(i => i.url), second.images.map(i => i.url)]);
  assert.deepEqual(finished, projectWith([first, second]));
  const [a, b] = finished.blocks.map(item => item.offset);
  assert.match(finished.text.slice(0, a), /Opening\./u);
  assert.match(finished.text.slice(a, b), /Between\./u);
  assert.match(finished.text.slice(b), /Closing\./u);
  const unbound = project(body, {}, false, false, [], presentation([second, first]));
  assert.deepEqual(unbound.blocks.map(item => item.status), ['unavailable', 'unavailable']);
  assert.ok(!unbound.blocks.some(item => item.images.length));
  assert.doesNotMatch(JSON.stringify(finished), /[\uE000-\uF8FF]/u);
});

test('standalone table primitives and typed charts render real data, not tokens', () => {
  const table = '<table-section><table-row><table-cell header>Name</table-cell><table-cell header>Value</table-cell></table-row>'
    + '<table-row><table-cell>H|I</table-cell><table-cell>3</table-cell></table-row></table-section>';
  const chart = wire('visualize', JSON.stringify({ style: 'bar', title: 'Downloads',
    x_axis: { data: ['Mon', 'Tue'] }, series: [{ values: [2, 7] }] }));
  const result = project('Start\n\n' + table + '\n\n' + chart + '\n\nEnd');
  assert.match(result.text, /\| Name \| Value \|\n\| --- \| --- \|\n\| H\\\|I \| 3 \|/u);
  assert.doesNotMatch(result.text, /<table-|visualize/u);
  assert.equal(result.blocks[0].chart.title, 'Downloads');
  assert.deepEqual(result.blocks[0].chart.series[0].values, [2, 7]);
  assert.equal(project(wire('visualize', '{}')).blocks[0].status, 'unavailable');
});

test('inline references resolve only matching IDs and owned file routes', () => {
  const refs = [
    { ref_id: 'turn0search1', title: 'A source', url: 'https://example.com/source', number: 2 },
    { ref_id: 'file-ref', title: 'Report', file_url: '/kuan/chat-assets/asset-' + 'a'.repeat(32), number: 3 },
    { ref_id: 'turn0search2', title: 'Credential URL', url: 'https://example.com/private?sig=hidden' },
    { ref_id: 'turn0search3', title: 'Credential fragment', url: 'https://example.com/private#access_token=hidden' },
  ];
  const input = 'Source ' + wire('cite', 'turn0search1') + ' and [2]. File ' + wire('filecite', 'file-ref')
    + ' ' + wire('memcite', 'PC\uE2024') + ' ' + wire('i', 'turn0search2') + wire('cite', 'turn0search3')
    + '\n\nNormal link [2](https://example.com/normal). Preserve |||| and :::: here.';
  const result = project(input, {}, false, false, [], presentation([], [], refs));
  assert.equal((result.text.match(/https:\/\/example\.com\/source/gu) || []).length, 2);
  assert.match(result.text, /asset-a{32}/u);
  assert.match(result.text, /\[2\]\(https:\/\/example\.com\/normal\)/u);
  assert.match(result.text, /Preserve \|\|\|\| and :::: here/u);
  assert.deepEqual(result.links, [{ title: 'A source', url: 'https://example.com/source' }]);
  assert.doesNotMatch(JSON.stringify(result), /PC|=hidden|turn0search/u);
});

test('structured questions, generic cards and progress do not run upstream handlers', () => {
  const p = presentation([
    { id: 'q', kind: 'ask_user_input_v2', status: 'resolved', questions: [
      { question: 'Select an interval', choices: [{ label: 'Week', prompt: 'Show a week' }, { label: 'Fake', handler: 'evil()' }] },
    ] },
    { id: 'm', kind: 'map', status: 'resolved', label: 'Museum',
      sources: [{ url: 'https://example.com/map', title: 'Map' }], handler: 'privateHandler' },
    { id: 'x', kind: 'app_block', status: 'unsupported', html: '<script>no</script>' },
  ], [
    { slot_id: 'DIL0', component_id: 'q' }, { slot_id: 'DIL1', component_id: 'm' }, { slot_id: 'DIL2', component_id: 'x' },
  ]);
  const input = slot(0) + slot(1) + slot(2) + wire('delayed_image_gen_card', '{}');
  const live = project(input, {}, true, false, [], p);
  assert.equal(live.blocks[3].status, 'pending');
  const final = project(input, {}, false, false, [], p);
  assert.equal(final.blocks[3].status, 'unavailable');
  assert.deepEqual(final.blocks[0].questions[0].choices, [{ label: 'Week', prompt: 'Show a week' }]);
  assert.equal(final.blocks[1].links[0].url, 'https://example.com/map');
  assert.equal(final.blocks[2].status, 'unsupported');
  assert.doesNotMatch(JSON.stringify(final), /privateHandler|<script>|evil\(\)/u);
});

test('long replies stay inside the same wire grammar instead of leaking markers', () => {
  const prefix = 'plain paragraph\n\n'.repeat(17000);
  const result = project(prefix + 'First ' + wire('cite', 'turn0search0') + '\n\nLast.' + slot(100));
  assert.ok(result.text.startsWith(prefix));
  assert.match(result.text, /First \n\nLast\./u);
  assert.doesNotMatch(result.text, /[\uE000-\uF8FF]/u);
  assert.equal(result.blocks.length, 1);
});

test('complete typed packets and structured source rows use their actual payloads', () => {
  const map = wire('map', '{"title":"Museum","locations":[{"title":"Open map","url":"https://example.com/place"}]}');
  const image = wire('image_group', '{"images":[{"content_url":"https://images.example.com/exact.png","url":"https://example.com/source"}]}');
  const ref = { ref_id: 'turn0view1', url: 'https://example.com/source', title: 'Verified source' };
  const text = 'Lead\n\n' + map + '\n\n' + image + '\n\n'
    + '20261125T14:20:37 Verified source: |||| https://example.com/source\n\n'
    + '20261125T14 Host note: :::: not a source.';
  const result = project(text, {}, false, false, [], presentation([], [], [ref]));
  assert.equal(result.blocks[0].links[0].url, 'https://example.com/place');
  assert.equal(result.blocks[1].images[0].url, 'https://images.example.com/exact.png');
  assert.match(result.text, /- \[Verified source\]\(<https:\/\/example\.com\/source>\)/u);
  assert.match(result.text, /Host note: :::: not a source\./u);
});
