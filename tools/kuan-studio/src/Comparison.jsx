import React, { useState } from 'react';
import { ArrowDownToLine, Columns2, ChevronsLeftRight, Copy, Plus } from 'lucide-react';
import { imageUrl, textFor, sourceImageUrl } from './library.js';

export default function Comparison({ data, assetBase, language, usePrompt, download, onNotice }) {
  const [index, setIndex] = useState(0), [layout, setLayout] = useState('side'), [position, setPosition] = useState(50);
  const item = data.cases[index], zh = language === 'zh';
  const picture = (path, label) => {
    const url = imageUrl(assetBase, path);
    return <figure key={path + label}><img src={url} alt={label} draggable="false" onError={event => {
      const fallback = sourceImageUrl(assetBase, url, data.revision);
      if (fallback && !event.currentTarget.dataset.originalSource) { event.currentTarget.dataset.originalSource = '1'; event.currentTarget.src = fallback; }
    }}/><figcaption><span>{label}</span>{layout === 'side' && <button type="button" className="kw-icon" aria-label={zh ? '下载对比原图' : 'Download comparison original'}
      onClick={() => download(url, path.split('/').pop())}><ArrowDownToLine size={17}/></button>}</figcaption></figure>;
  };
  return <section className="kw-comparison">
    <header><h2>{textFor(item.title, language)}</h2><select aria-label={zh ? '选择对比案例' : 'Comparison case'} value={index}
      onChange={event => { setIndex(Number(event.target.value)); setPosition(50); }}>{data.cases.map((row, i) =>
      <option key={row.id} value={i}>{textFor(row.title, language)}</option>)}</select></header>
    <p className="kw-comparison-notice">{item.result
      ? (zh ? '上游作者单次复现记录，原图条件未知，不代表本服务实测。' : 'One recreation by the upstream author; original conditions are unknown. Not a benchmark of this service.')
      : (zh ? '交互示意：两侧使用同一图片，不代表模型对比实测。' : 'Interface demo: both sides use the same image, not a model benchmark.')}</p>
    <div className="kw-comparison-modes" role="group" aria-label={zh ? '对比方式' : 'Comparison layout'}>
      <button type="button" className="kw-secondary" aria-pressed={layout === 'side'} onClick={() => setLayout('side')}><Columns2 size={17}/>{zh ? '并排' : 'Side by side'}</button>
      <button type="button" className="kw-secondary" aria-pressed={layout === 'slider'} onClick={() => setLayout('slider')}><ChevronsLeftRight size={17}/>{zh ? '滑动' : 'Slider'}</button>
    </div>
    {layout === 'slider' && <div className="kw-comparison-actions">{[item.image, item.result?.image || item.image].map((path,index) =>
      <button type="button" className="kw-secondary" key={index} onClick={() => download(imageUrl(assetBase,path),path.split('/').pop())}><ArrowDownToLine size={17}/>
        {zh ? (index ? '下载右侧原图' : '下载左侧原图') : (index ? 'Download right original' : 'Download left original')}</button>)}</div>}
    <div className={`kw-comparison-images is-${layout}`} style={{ '--comparison-position': position + '%' }}>
      {picture(item.image, zh ? '图库原图' : 'Gallery original')}
      {picture(item.result?.image || item.image, item.result ? textFor(item.result.label, language) : (zh ? '交互示意' : 'Interface demo'))}
      {layout === 'slider' && <input type="range" min="0" max="100" value={position} aria-label={zh ? '调整对比分界位置' : 'Comparison divider'}
        onChange={event => setPosition(Number(event.target.value))}/>}
    </div>
    <p>{textFor(item.focus, language)}</p>
    <label className="kw-field">{zh ? '完整提示词' : 'Complete prompt'}<textarea readOnly value={item.prompt} rows="7"/></label>
    <div className="kw-comparison-actions"><button type="button" className="kw-generate" onClick={() => usePrompt(item.prompt, item)}><Plus size={17}/>{zh ? '使用提示词' : 'Use prompt'}</button>
      <button type="button" className="kw-secondary" onClick={async () => { try { await navigator.clipboard.writeText(item.prompt); onNotice(zh ? '已复制' : 'Copied'); } catch { onNotice(zh ? '复制失败，请选择文本后复制' : 'Select the prompt and copy manually'); } }}><Copy size={17}/>{zh ? '复制' : 'Copy'}</button></div>
    {item.result && <dl className="kw-comparison-parameters">{item.result.parameters[language].map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>}
  </section>;
}
