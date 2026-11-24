import test from 'node:test';
import assert from 'node:assert/strict';
import {filterCases, placeholders, fillPlaceholders, imageUrl, compareModels, cleanDraft, publicTask} from '../src/library.js';
test('combined gallery filters and favorites preserve all source cases', () => {
  const cases = [{id:1,title:'紫色海报',prompt:'purple poster',category:'Poster',sourceLabel:'Author',styles:['3D'],scenes:['Tech']},
    {id:2,title:'Portrait',prompt:'photo',category:'People',sourceLabel:'B',styles:['Realistic'],scenes:[]}];
  assert.equal(filterCases(cases).length, 2);
  assert.deepEqual(filterCases(cases,{query:'紫色 poster',style:'3D',scene:'Tech',favoritesOnly:true,favorites:[1]}).map(v=>v.id),[1]);
  assert.equal(filterCases(cases,{category:'Missing'}).length,0);
});
test('template variables preserve unfilled text and do not interpret regex or replacement syntax', () => {
  const prompt='[主题] [尺寸/颜色] [主题]';
  assert.deepEqual(placeholders(prompt),['主题','尺寸/颜色']);
  assert.equal(fillPlaceholders(prompt,{'主题':'$& city'}),'$& city [尺寸/颜色] $& city');
});
test('all visual assets stay on the deployed local content root', () => {
  assert.equal(imageUrl('/studio/','/images/category-covers/ui.jpg',true),'/studio/thumbs/category-covers/ui.webp');
  assert.equal(imageUrl('/studio/','https://evil.test/image.jpg'),'');
  assert.equal(imageUrl('/studio/','/images/../../key'),'');
});
test('model ordering is numeric, dynamic and not a fixed name allowlist', () => {
  assert.deepEqual(['gpt-image-2','gpt-image-12','gpt-image-2.5','gpt-image-1.5'].sort(compareModels),['gpt-image-12','gpt-image-2.5','gpt-image-2','gpt-image-1.5']);
});
test('credentials cannot enter persisted drafts or task history', () => {
  assert(!('apiKey' in cleanDraft({apiKey:'secret',baseUrl:'https://private.test',prompt:'hello'})));
  assert(!('apiKey' in publicTask({id:'1',userId:'12',apiKey:'secret'})));
  assert(!('baseUrl' in publicTask({id:'1',baseUrl:'https://private.test'})));
});
