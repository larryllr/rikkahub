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
