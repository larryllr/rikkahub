import React, {useState, useEffect, useMemo, useRef, Component} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft, ArrowUpRight, ArrowDownToLine, ArrowLeftRight, BookOpen, Check, ChevronDown, ChevronUp,
  Copy, Download, Eye, EyeOff, Heart, History, Images, KeyRound, LoaderCircle, Maximize2, Moon, PanelsTopLeft,
  Plus, Search, Settings2, SlidersHorizontal, Sparkles, Square, Sun, Trash2, Upload, WandSparkles, X, RotateCcw, FileCheck2, Columns2} from 'lucide-react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {marked} from 'marked';
import DOMPurify from 'dompurify';
import {textFor, labelFor, filterCases, placeholders, fillPlaceholders, imageUrl, sourceImageUrl, compareModels, cleanDraft, readReference} from './library.js';
import {listTasks, saveTask, deleteTask, readSetting, writeSetting} from './storage.js';
import Comparison from './Comparison.jsx';
export {createStudioDownloader} from './download.js';
import './studio.css';

gsap.registerPlugin(useGSAP);
const DEFAULTS = {prompt:'',model:'',autoModel:true,size:'1024x1024',quality:'auto',outputFormat:'png',outputCompression:90,count:1};
const strings = {
  zh:{title:'图像工作台',brand:'宽api',back:'返回对话',gallery:'案例库',templates:'工业模板',history:'生成记录',guide:'风格指南',
    prompt:'提示词',promptPlaceholder:'描述你想创作的画面，或从右侧选择一个案例…',generate:'生成图像',model:'生图模型',auto:'自动 · 最新可用',
    size:'画幅',custom:'自定义',quality:'画质',format:'格式',count:'数量',refs:'参考图片',search:'搜索案例、画面、提示词…',
    all:'全部',category:'分类',style:'风格',scene:'场景',favorites:'收藏',use:'使用提示词',copy:'复制',copied:'已复制',
    connection:'连接设置',api:'API Key',base:'Base URL',connected:'已绑定当前账号',refresh:'刷新连接和模型',source:'原始出处',
    examples:'关联案例',constraints:'核心约束',pitfalls:'避坑指南',variants:'模板版本',variables:'填入变量',close:'关闭',
    old:'旧版工作台',empty:'没有匹配的内容',noHistory:'还没有生成记录',newest:'最新收录',featured:'精选优先',
    results:'个结果',stop:'停止',download:'下载原图',reference:'作为参考图',retry:'再次生成',failed:'生成失败',cancelled:'已停止',
    running:'正在生成',completed:'已完成',delete:'删除',confirm:'确认删除',network:'暂时无法连接',retryLoad:'重新连接',
    settings:'生成参数',guideDownload:'下载完整模板',credits:'内容来源',read:'查看详情',more:'加载更多',clear:'清空筛选',
    library:'完整案例、模板与风格规则',variant:'变体',favoriteOnly:'只看收藏',keep:'保留当前提示词',replace:'替换提示词',
    archive:'下载风格资料',compare:'2.5 对比',downloading:'正在下载',saved:'已保存到本机，再次点击可打开',albumSaved:'已保存到系统相册「宽api」，再次点击可打开',started:'已交给浏览器下载',openFile:'打开本机文件',selected:'已选案例',balance:'余额',storageError:'记录未能保存到此设备，请及时下载图片',
    notice:'素材与提示词来自 awesome-gpt-image-2，遵循 MIT 许可；原始作者信息保留在案例中。'},
  en:{title:'Image Studio',brand:'KuanAPI',back:'Back to chat',gallery:'Gallery',templates:'Templates',history:'History',guide:'Style guide',
    prompt:'Prompt',promptPlaceholder:'Describe your image, or choose a case from the gallery…',generate:'Generate image',model:'Image model',auto:'Auto · latest available',
    size:'Aspect ratio',custom:'Custom',quality:'Quality',format:'Format',count:'Images',refs:'Reference images',search:'Search cases, styles, prompts…',
    all:'All',category:'Category',style:'Style',scene:'Scene',favorites:'Favorites',use:'Use prompt',copy:'Copy',copied:'Copied',
    connection:'Connection',api:'API key',base:'Base URL',connected:'Current account connected',refresh:'Refresh connection & models',source:'Original source',
    examples:'Related cases',constraints:'Core constraints',pitfalls:'Pitfalls',variants:'Template versions',variables:'Fill variables',close:'Close',
    old:'Previous studio',empty:'No matching items',noHistory:'No images yet',newest:'Newest',featured:'Featured first',
    results:'results',stop:'Stop',download:'Download original',reference:'Use as reference',retry:'Generate again',failed:'Failed',cancelled:'Stopped',
    running:'Generating',completed:'Completed',delete:'Delete',confirm:'Confirm delete',network:'Unable to connect',retryLoad:'Reconnect',
    settings:'Generation settings',guideDownload:'Download full templates',credits:'Attribution',read:'View details',more:'Load more',clear:'Clear filters',
    library:'Cases, templates and style rules',variant:'Variant',favoriteOnly:'Favorites only',keep:'Keep current prompt',replace:'Replace prompt',
    archive:'Download style resources',compare:'Image 2.5',downloading:'Downloading',saved:'Saved on this device. Click again to open.',albumSaved:'Saved to the KuanAPI system album. Click again to open.',started:'Download sent to the browser',openFile:'Open local file',selected:'Selected case',balance:'Balance',storageError:'Unable to save on this device. Download your images.',
    notice:'Cases and prompts from awesome-gpt-image-2 under the MIT license. Original creators are credited on each case.'},
};

function IconButton({icon:Icon,label,onClick,active=false,...props}) {
  return <button type="button" className={`kw-icon ${active?'active':''}`} aria-label={label} title={label} onClick={onClick} {...props}><Icon size={18}/></button>;
}
function CopyButton({value,t,onNotice}) {
  const [copied,setCopied]=useState(false);
  useEffect(()=>{if(copied){const timer=setTimeout(()=>setCopied(false),1600);return()=>clearTimeout(timer);}},[copied]);
  return <IconButton icon={copied?Check:Copy} label={copied?t.copied:t.copy} onClick={async()=>{
    try {await navigator.clipboard.writeText(value);setCopied(true);} catch {onNotice('复制失败，请选择文本后复制');}
  }}/>;
}
function DeleteButton({onDelete,t}) {
  const [armed,setArmed]=useState(false);
  useEffect(()=>{if(armed){const id=setTimeout(()=>setArmed(false),3500);return()=>clearTimeout(id);}},[armed]);
  return <button type="button" className={`kw-delete ${armed?'armed':''}`} title={t.delete} aria-label={armed?t.confirm:t.delete}
    onClick={()=>armed?onDelete():setArmed(true)}><Trash2 size={16}/>{armed&&<span>{t.confirm}</span>}</button>;
}
function Thumb({item,assetBase,sourceRevision,full=false,...props}) {
  const [broken,setBroken]=useState(false);
  const [fallback,setFallback]=useState(false);
  useEffect(()=>{setBroken(false);setFallback(false);},[item.image]);
  return broken?<div className="kw-image-missing"><Images size={28}/><span>{item.title}</span></div>:
    <img src={fallback||imageUrl(assetBase,item.image,!full)} alt={item.imageAlt||item.title||''} loading={full?'eager':'lazy'} decoding="async" onError={()=>{
      const original=sourceImageUrl(assetBase,imageUrl(assetBase,item.image),sourceRevision);
      if (!fallback && original) setFallback(original); else setBroken(true);
    }} {...props}/>;
}
function App({bridge,assetBase,native}) {
  const root=useRef(null),listRef=useRef(null),fileRef=useRef(null),promptRef=useRef(null),moreRef=useRef(null);
  const controllers=useRef(new Map()),alive=useRef(true),connectionRef=useRef(null);
  const [language,setLanguage]=useState(navigator.language.toLowerCase().startsWith('zh')?'zh':'en');
  const t=strings[language];
  const defaultTheme=native&&!matchMedia('(prefers-color-scheme: dark)').matches?'light':'dark';
  const [theme,setTheme]=useState(defaultTheme),[connection,setConnection]=useState(null),[data,setData]=useState(null),[library,setLibrary]=useState(null),[comparisons,setComparisons]=useState(null);
  const [downloads,setDownloads]=useState({});
  const [error,setError]=useState(''),[notice,setNotice]=useState(''),[connecting,setConnecting]=useState(false);
  const [view,setView]=useState('gallery'),[draft,setDraft]=useState(DEFAULTS),[references,setReferences]=useState([]),[tasks,setTasks]=useState([]);
  const [favorites,setFavorites]=useState([]),[filters,setFilters]=useState({query:'',category:'',style:'',scene:'',favoritesOnly:false});
  const [sort,setSort]=useState('newest'),[limit,setLimit]=useState(30),[selected,setSelected]=useState(null),[variant,setVariant]=useState(0),[variables,setVariables]=useState({});
  const [settingsOpen,setSettingsOpen]=useState(false),[showKey,setShowKey]=useState(false),[editorOpen,setEditorOpen]=useState(false),[filtersOpen,setFiltersOpen]=useState(false);
  const [guide,setGuide]=useState(''),[preview,setPreview]=useState(null),[pendingPrompt,setPendingPrompt]=useState(null),[tick,setTick]=useState(Date.now());

  const refresh = async(initial=false)=>{
    setConnecting(true);setError('');
    try {
      const next=await bridge.initialize();
      if(!alive.current)return;
      connectionRef.current=next;setConnection(next);
      const models=[...next.models].sort(compareModels);
      if(initial){
        const saved=cleanDraft(readSetting(next.userId,'draft',DEFAULTS));
        setDraft({...saved,model:saved.autoModel||!models.includes(saved.model)?models[0]||'':saved.model});
        setTheme(readSetting(next.userId,'theme',defaultTheme));
        setFavorites(readSetting(next.userId,'favorites',[]));
        const stored=await listTasks(next.userId).catch(()=>{setNotice(t.storageError);return[];});
        if(alive.current)setTasks(stored.map(task=>task.status==='generating'?{...task,status:'cancelled',error:'页面关闭前的请求已停止；已有结果保留。'}:task));
      }else setDraft(old=>({...old,model:old.autoModel||!models.includes(old.model)?models[0]||'':old.model}));
    } catch(e){if(alive.current)setError(e.message||t.network);}
    finally{if(alive.current)setConnecting(false);}
  };
  useEffect(()=>{
    alive.current=true;
    const controller=new AbortController();
    Promise.all(['cases.json','style-library.json','content-version.json','comparison.json'].map(name=>fetch(assetBase+name,{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('内容库加载失败');return r.json();})))
      .then(([cases,styles,version,comparison])=>{setData({...cases,sourceRevision:version.revision});setLibrary(styles);setComparisons(comparison);
        const requested=new URLSearchParams(location.search).get('case');
        if(/^[1-9]\d*$/.test(requested||'')){const item=cases.cases.find(row=>String(row.id)===requested);if(item)setSelected(item);}
      }).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
    void refresh(true);
    return()=>{alive.current=false;controller.abort();controllers.current.forEach(c=>c.abort());controllers.current.clear();connectionRef.current=null;};
  },[]);
  useEffect(()=>{if(!connection)return;const timer=setTimeout(()=>{try{writeSetting(connection.userId,'draft',cleanDraft(draft));}catch{setNotice(t.storageError);}},400);return()=>clearTimeout(timer);},[draft,connection?.userId]);
  useEffect(()=>{if(!connection)return;try{writeSetting(connection.userId,'favorites',favorites);writeSetting(connection.userId,'theme',theme);}catch{setNotice(t.storageError);}},[favorites,theme,connection?.userId]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),4500);return()=>clearTimeout(timer);},[notice]);
  useEffect(()=>{if(!tasks.some(task=>task.status==='generating'))return;const timer=setInterval(()=>setTick(Date.now()),1000);return()=>clearInterval(timer);},[tasks]);
  useEffect(()=>{const handler=event=>{if(controllers.current.size){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler);},[]);
  useEffect(()=>{const handler=event=>{if(event.key==='Escape'){setPreview(null);closeSelected();setSettingsOpen(false);}};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler);},[]);
  useEffect(()=>{setLimit(30);listRef.current?.scrollTo({top:0});},[filters,sort,view]);
  useEffect(()=>{if(!moreRef.current)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))setLimit(n=>n+24);},{root:listRef.current,rootMargin:'250px'});observer.observe(moreRef.current);return()=>observer.disconnect();},[view,data,limit]);
  useEffect(()=>{if(view!=='guide'||guide)return;const c=new AbortController();fetch(assetBase+'templates.md',{signal:c.signal}).then(r=>r.text()).then(setGuide).catch(e=>{if(e.name!=='AbortError')setNotice(e.message);});return()=>c.abort();},[view,guide]);
  const cases=useMemo(()=>filterCases(data?.cases||[],{...filters,favorites}).sort((a,b)=>sort==='featured'?(Number(b.featured)-Number(a.featured)||b.id-a.id):b.id-a.id),[data,filters,favorites,sort]);
  const templates=useMemo(()=> (library?.templates||[]).filter(item=>(!filters.category||item.category===filters.category)
    && (!filters.style||item.styles?.includes(filters.style)) && (!filters.scene||item.scenes?.includes(filters.scene))
    && (!filters.query||`${textFor(item.title,language)} ${textFor(item.description,language)} ${item.variants?.map(v=>v.prompt).join(' ')}`.toLowerCase().includes(filters.query.toLowerCase()))),[library,filters,language]);
  const signature=`${view}:${filters.query}:${filters.category}:${filters.style}:${filters.scene}:${filters.favoritesOnly}:${sort}`;
  useGSAP(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const cards=root.current?.querySelectorAll('.kw-card');if(!cards?.length)return;
    gsap.fromTo(cards,{y:12,opacity:0},{y:0,opacity:1,duration:.34,stagger:{each:.018,from:'start',amount:.22},ease:'power2.out',clearProps:'transform,opacity'});
  },{scope:root,dependencies:[signature,Boolean(data)],revertOnUpdate:true});
  useGSAP(()=>{if(selected&&!matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo('.kw-inspector',{x:20,opacity:.5},{x:0,opacity:1,duration:.25,clearProps:'transform,opacity'});},
    {scope:root,dependencies:[selected?.id],revertOnUpdate:true});

  const patchDraft=value=>setDraft(old=>({...old,...value}));
  const closeSelected=()=>{setSelected(null);const url=new URL(location.href);if(url.searchParams.has('case')){url.searchParams.delete('case');history.replaceState({},'',url.pathname+url.search+url.hash);}};
  const selectItem=item=>{setSelected(item);setVariant(0);setVariables({});};
  const selectedPrompt=selected?.variants?.[variant]?.prompt||selected?.prompt||'';
  const effectivePrompt=fillPlaceholders(selectedPrompt,variables);
  const choosePrompt=(prompt,item)=>{
    if(draft.prompt.trim()&&draft.prompt!==prompt){setPendingPrompt({prompt,item});return;}
    applyPrompt(prompt,item);
  };
  const applyPrompt=(prompt,item)=>{patchDraft({prompt});setPendingPrompt(null);closeSelected();setEditorOpen(true);requestAnimationFrame(()=>{promptRef.current?.focus();if(innerWidth<700)promptRef.current?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});};
  const favorite=id=>setFavorites(old=>old.includes(id)?old.filter(value=>value!==id):[...old,id]);
  const persist=async task=>{try{await saveTask(task);}catch{if(alive.current)setNotice(t.storageError);}};
  const putTask=task=>{if(alive.current)setTasks(old=>[task,...old.filter(row=>row.id!==task.id)]);};
  const addFiles=async files=>{
    try{
      if(references.length+files.length>6)throw new Error(language==='zh'?'最多添加 6 张参考图':'Up to 6 reference images');
      if(references.reduce((sum,f)=>sum+f.size,0)+files.reduce((sum,f)=>sum+f.size,0)>64*1024*1024)throw new Error('参考图合计不能超过 64 MB');
      const loaded=await Promise.all(files.map(readReference));setReferences(old=>[...old,...loaded]);setEditorOpen(true);
    }catch(e){setNotice(e.message);}
  };
  const selectFiles=async()=>{
    if(!native){fileRef.current.click();return;}
    try{const files=await bridge.pickFiles();if(files.length)await addFiles(files);}
    catch(error){setNotice(error.message);}
  };
  const generate=async(override=null)=>{
    const active=connectionRef.current;
    if(!active||!draft.prompt.trim()&&!override)return;
    const input=override||draft;
    if(!active.models.includes(input.model)){setNotice(language==='zh'?'当前分组没有所选生图模型，请切换分组或模型。':'This group does not offer the selected image model.');return;}
    const validation=bridge.validate(input.size,input.model);
    if(validation){setNotice(validation);return;}
    const task={...cleanDraft(input),id:crypto.randomUUID(),userId:String(active.userId),createdAt:Date.now(),status:'generating',
      references:structuredClone(override?.references||references),images:[]};
    const controller=new AbortController();controllers.current.set(task.id,controller);setTick(task.createdAt);putTask(task);void persist(task);setView('history');setSelected(null);
    try{
      const result=await bridge.generate({...cleanDraft(input),referenceImages:task.references.map(ref=>ref.dataUrl),signal:controller.signal});
      if(controller.signal.aborted)throw new DOMException('Aborted','AbortError');
      if(!result.images?.length)throw new Error('接口未返回图片');
      Object.assign(task,result,{status:'completed',completedAt:Date.now(),elapsedMs:Date.now()-task.createdAt});
      putTask({...task});await persist(task);
      bridge.profile?.().then(user=>{if(alive.current)setConnection(old=>old?{...old,balance:user.balance}:old);}).catch(()=>{});
    }catch(e){Object.assign(task,{status:controller.signal.aborted?'cancelled':'failed',error:controller.signal.aborted?t.cancelled:e.message,
      completedAt:Date.now(),elapsedMs:Date.now()-task.createdAt});putTask({...task});await persist(task);}
    finally{controllers.current.delete(task.id);}
  };
  const stop=id=>{controllers.current.get(id)?.abort();setTasks(old=>old.map(task=>task.id===id?{...task,status:'cancelled',error:t.cancelled}:task));};
  const removeTask=async task=>{try{await deleteTask(connection.userId,task.id);setTasks(old=>old.filter(row=>row.id!==task.id));}catch(e){setNotice(e.message);}};
  const download=async(url,name)=>{
    if(downloads[url]==='pending')return;
    setDownloads(old=>({...old,[url]:'pending'}));
    try{const result=await bridge.download(url,name,{fallbackUrl:sourceImageUrl(assetBase,url,data?.sourceRevision)});
      if(alive.current){setDownloads(old=>({...old,[url]:result?.saved?'ready':''}));if(!result?.opened&&!result?.cancelled)setNotice(result?.album?t.albumSaved:result?.saved?t.saved:t.started);}
    }catch(e){if(alive.current){setDownloads(old=>({...old,[url]:''}));if(e.name!=='AbortError')setNotice(e.message||'下载失败');}}
  };
  const downloadButton=(url,name)=><IconButton icon={downloads[url]==='pending'?LoaderCircle:downloads[url]==='ready'?FileCheck2:ArrowDownToLine}
    label={downloads[url]==='pending'?t.downloading:downloads[url]==='ready'?t.openFile:t.download} disabled={downloads[url]==='pending'} aria-busy={downloads[url]==='pending'} onClick={()=>download(url,name)}/>;
  const reuse=async(url)=>{try{const blob=await fetch(url).then(r=>{if(!r.ok)throw new Error('图片读取失败');return r.blob();});await addFiles([new File([blob],'reference.png',{type:blob.type||'image/png'})]);setPreview(null);}catch(e){setNotice(e.message);}};
  const tabs=[['gallery',Images],['templates',PanelsTopLeft],['compare',Columns2],['history',History],['guide',BookOpen]];
  const sizeError=draft.model?bridge.validate(draft.size,draft.model):'';
  const [width,height]=draft.size.split('x');

  return <div ref={root} className="kuan-image-workbench" data-theme={theme} data-host={native?'android':undefined}>
    <header className="kw-header">
      {!native&&<div className="kw-brand"><IconButton icon={ArrowLeft} label={t.back} onClick={()=>bridge.back()}/><img src="/logo.png" alt=""/><div><strong>{t.brand}</strong><span>{t.title}</span></div></div>}
      <nav aria-label={t.title}>{tabs.map(([id,Icon])=><button type="button" key={id} className={view===id?'active':''} onClick={()=>{setView(id);closeSelected();}}><Icon size={17}/><span>{t[id]}</span>{id==='history'&&tasks.some(task=>task.status==='generating')&&<i/>}</button>)}</nav>
      <div className="kw-header-actions"><span className="kw-balance">{connection&&`$${Number(connection.balance||0).toFixed(2)}`}</span>
        <IconButton icon={theme==='dark'?Sun:Moon} label={theme==='dark'?'Light theme':'Dark theme'} onClick={()=>setTheme(theme==='dark'?'light':'dark')}/>
        <button type="button" className="kw-language" onClick={()=>setLanguage(language==='zh'?'en':'zh')}>{language==='zh'?'EN':'中'}</button>
        <IconButton icon={KeyRound} label={t.connection} active={settingsOpen} onClick={()=>{setSettingsOpen(!settingsOpen);setShowKey(false);}}/></div>
    </header>
    {settingsOpen&&<section className="kw-connection" aria-label={t.connection}>
      <div><span className={`kw-dot ${connection?'ready':''}`}/><strong>{connection?t.connected:t.network}</strong><small>{connection?.groupName}</small></div>
      <label>{t.base}<input readOnly value={connection?.baseUrl||''}/></label>
      {!native&&<label>{t.api}<span className="kw-secret"><input readOnly type={showKey?'text':'password'} value={connection?.apiKey||''}/><IconButton icon={showKey?EyeOff:Eye} label={showKey?'Hide API key':'Show API key'} onClick={()=>setShowKey(!showKey)}/></span></label>}
      <button type="button" className="kw-secondary" onClick={()=>refresh()} disabled={connecting}><RotateCcw size={16} className={connecting?'spinning':''}/>{t.refresh}</button>
      {!native&&<button type="button" className="kw-link" onClick={()=>bridge.legacy()}>{t.old}<ArrowUpRight size={14}/></button>}
    </section>}
    {error&&<div className="kw-error" role="alert"><span>{error}</span><button type="button" onClick={()=>refresh()}>{t.retryLoad}</button></div>}
    <div className="kw-layout">
      <aside className={`kw-composer ${editorOpen?'expanded':''}`}>
        <button type="button" className="kw-mobile-composer" onClick={()=>setEditorOpen(!editorOpen)}><WandSparkles size={18}/><span>{draft.prompt?draft.prompt.slice(0,42):t.prompt}</span>{editorOpen?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button>
        <div className="kw-composer-body">
          <div className="kw-section-title"><h1>{t.prompt}</h1><div><IconButton icon={Plus} label={language==='zh'?'新建提示词':'New prompt'} onClick={()=>{patchDraft({prompt:''});setReferences([]);promptRef.current?.focus();}}/><CopyButton value={draft.prompt} t={t} onNotice={setNotice}/></div></div>
          <textarea ref={promptRef} className="kw-prompt" aria-label={t.prompt} placeholder={t.promptPlaceholder} value={draft.prompt} onChange={event=>patchDraft({prompt:event.target.value})}
            onPaste={event=>{const files=[...event.clipboardData.files];if(files.length){event.preventDefault();void addFiles(files);}}}/>
          <div className="kw-prompt-meta"><span>{draft.prompt.length.toLocaleString()}</span><span>{draft.model||t.model}</span></div>
          <div className="kw-reference-area" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();void addFiles([...event.dataTransfer.files]);}}>
            <div className="kw-section-title"><h2>{t.refs}<small>{references.length}/6</small></h2><IconButton icon={Upload} label={t.refs} onClick={()=>void selectFiles()}/></div>
            {!native&&<input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={event=>{void addFiles([...event.target.files]);event.target.value='';}}/>}
            <div className="kw-refs">{references.map(ref=><div key={ref.id}><img src={ref.dataUrl} alt={ref.name}/><IconButton icon={X} label={t.delete} onClick={()=>setReferences(old=>old.filter(item=>item.id!==ref.id))}/></div>)}
              {!references.length&&<button type="button" className="kw-ref-add" aria-label={t.refs} title={t.refs} onClick={()=>void selectFiles()}><Plus size={21}/></button>}</div>
          </div>
          <div className="kw-section-title"><h2>{t.settings}</h2><SlidersHorizontal size={16}/></div>
          <label className="kw-field">{t.model}<select value={draft.autoModel?'__auto__':draft.model} onChange={e=>patchDraft({autoModel:e.target.value==='__auto__',model:e.target.value==='__auto__'?[...(connection?.models||[])].sort(compareModels)[0]||'':e.target.value})}>
            <option value="__auto__">{t.auto}</option>{(connection?.models||[]).map(model=><option key={model} value={model}>{model}</option>)}</select></label>
          <div className="kw-field"><span>{t.size}</span><div className="kw-aspects">{['1024x1024','1536x1024','1024x1536'].map((size,index)=><button type="button" key={size} className={draft.size===size?'active':''} title={size} onClick={()=>patchDraft({size})}><span className={`kw-ratio ratio-${index}`}/><small>{['1:1','3:2','2:3'][index]}</small></button>)}
            <button type="button" className={!['1024x1024','1536x1024','1024x1536'].includes(draft.size)?'active':''} onClick={()=>patchDraft({size:'1280x720'})}><Settings2 size={17}/><small>{t.custom}</small></button></div></div>
          <div className="kw-dimensions"><label><span>W</span><input aria-label="Width" type="number" step="16" min="16" value={width||''} onChange={e=>patchDraft({size:`${e.target.value}x${height||1024}`})}/></label><IconButton icon={ArrowLeftRight} label="Swap dimensions" onClick={()=>patchDraft({size:`${height}x${width}`})}/><label><span>H</span><input aria-label="Height" type="number" step="16" min="16" value={height||''} onChange={e=>patchDraft({size:`${width||1024}x${e.target.value}`})}/></label></div>
          {sizeError&&<p className="kw-field-error">{sizeError}</p>}
          <div className="kw-field-grid"><label className="kw-field">{t.quality}<select value={draft.quality} onChange={e=>patchDraft({quality:e.target.value})}>{[['auto',language==='zh'?'自动':'Auto'],['low',language==='zh'?'快速':'Fast'],['medium',language==='zh'?'标准':'Standard'],['high',language==='zh'?'精细':'High']].map(([v,label])=><option value={v} key={v}>{label}</option>)}</select></label>
            <label className="kw-field">{t.format}<select value={draft.outputFormat} onChange={e=>patchDraft({outputFormat:e.target.value})}>{['png','jpeg','webp'].map(format=><option value={format} key={format}>{format.toUpperCase()}</option>)}</select></label></div>
          {draft.outputFormat!=='png'&&<label className="kw-field">{language==='zh'?'压缩质量':'Compression quality'} · {draft.outputCompression}<input type="range" min="1" max="100" value={draft.outputCompression} onChange={e=>patchDraft({outputCompression:Number(e.target.value)})}/></label>}
          <div className="kw-count"><span>{t.count}</span><div role="group" aria-label={t.count}>{[1,2,3,4].map(n=><button type="button" key={n} className={draft.count===n?'active':''} onClick={()=>patchDraft({count:n})}>{n}</button>)}</div></div>
          <button type="button" className="kw-generate" disabled={!connection||!draft.model||!draft.prompt.trim()||Boolean(sizeError)} onClick={()=>generate()}><WandSparkles size={18}/>{t.generate}<ArrowUpRight size={16}/></button>
          <div className="kw-connection-status"><span className={`kw-dot ${connection?'ready':''}`}/><span>{connection?.groupName||t.network}</span><span>{connection?.baseUrl?new URL(connection.baseUrl).host:''}</span></div>
          {connection&&!connection.models.length&&<p role="status">{language==='zh'?'当前分组没有可用生图模型。':'No image models are available in this group.'}</p>}
        </div>
      </aside>
      <main className="kw-main" ref={listRef}>
        <div className="kw-content-heading"><div><span className="kw-eyebrow">{view==='gallery'?'PROMPT COLLECTION':view==='templates'?'PROMPT SYSTEMS':view==='history'?'YOUR CREATIONS':'REFERENCE LIBRARY'}</span><h2>{t[view]}<span>{view==='gallery'?data?.totalCases:view==='templates'?library?.templates?.length:view==='history'?tasks.length:''}</span></h2></div>
          {(view==='gallery'||view==='templates')&&<IconButton icon={SlidersHorizontal} label={t.settings} active={filtersOpen} onClick={()=>setFiltersOpen(!filtersOpen)}/>}
          {view==='history'&&<IconButton icon={Plus} label={t.generate} onClick={()=>{setEditorOpen(true);promptRef.current?.focus();}}/>}
        </div>
        {(view==='gallery'||view==='templates')&&<><div className="kw-search-row"><label className="kw-search"><Search size={17}/><input type="search" aria-label={t.search} placeholder={t.search} value={filters.query} onChange={e=>setFilters(old=>({...old,query:e.target.value}))}/></label>
          {view==='gallery'&&<IconButton icon={Heart} label={t.favoriteOnly} active={filters.favoritesOnly} onClick={()=>setFilters(old=>({...old,favoritesOnly:!old.favoritesOnly}))}/>}</div>
          <div className="kw-category-strip"><button type="button" className={!filters.category?'active':''} onClick={()=>setFilters(old=>({...old,category:''}))}>{t.all}</button>{(library?.categories||[]).map(item=><button type="button" key={item.value} className={filters.category===item.value?'active':''} onClick={()=>setFilters(old=>({...old,category:item.value}))}>{textFor(item.title,language)}</button>)}</div>
          {filtersOpen&&<div className="kw-filters">{[['style','styles'],['scene','scenes']].map(([key,collection])=><label key={key}>{t[key]}<select value={filters[key]} onChange={e=>setFilters(old=>({...old,[key]:e.target.value}))}><option value="">{t.all}</option>{(library?.[collection]||[]).map(item=><option value={item.value} key={item.value}>{textFor(item.title,language)}</option>)}</select></label>)}
            <label>{language==='zh'?'排序':'Sort'}<select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">{t.featured}</option><option value="newest">{t.newest}</option></select></label>
            <button type="button" className="kw-link" onClick={()=>setFilters({query:'',category:'',style:'',scene:'',favoritesOnly:false})}><X size={15}/>{t.clear}</button></div>}
          <div className="kw-result-count">{(view==='gallery'?cases:templates).length} {t.results}{filters.style&&<span>{labelFor(filters.style,library,language)}</span>}{filters.scene&&<span>{labelFor(filters.scene,library,language)}</span>}</div></>}
        {!data&&<div className="kw-skeletons">{Array.from({length:6},(_,i)=><div key={i}/>)}</div>}
        {view==='gallery'&&data&&<div className="kw-grid">{cases.slice(0,limit).map(item=><article className="kw-card" key={item.id}>
          <button type="button" className="kw-card-image" onClick={()=>selectItem(item)} aria-label={`${t.read}: ${item.title}`}><Thumb item={item} assetBase={assetBase} sourceRevision={data?.sourceRevision}/>{item.featured&&<span className="kw-featured"><Sparkles size={13}/></span>}</button>
          <div className="kw-card-info"><div><span>{labelFor(item.category,library,language)}</span><IconButton icon={Heart} label={t.favorites} active={favorites.includes(item.id)} onClick={()=>favorite(item.id)}/></div><h3><button type="button" onClick={()=>selectItem(item)}>{item.title}</button></h3><footer><small>{item.sourceLabel}</small><button type="button" onClick={()=>choosePrompt(item.prompt,item)}><Plus size={14}/>{t.use}</button></footer></div>
        </article>)}</div>}
        {view==='templates'&&library&&<div className="kw-grid kw-template-grid">{templates.map(item=><article className="kw-card kw-template" key={item.id}>
          <button type="button" className="kw-card-image" onClick={()=>selectItem(item)}><Thumb item={{image:item.cover,title:textFor(item.title,language)}} assetBase={assetBase} sourceRevision={data?.sourceRevision}/><span className="kw-template-number">{item.variants?.length||0} {t.variant}</span></button>
          <div className="kw-card-info"><h3><button type="button" onClick={()=>selectItem(item)}>{textFor(item.title,language)}</button></h3><p>{textFor(item.description,language)}</p><footer><span>{labelFor(item.category,library,language)}</span><button type="button" onClick={()=>selectItem(item)}>{t.read}<ArrowUpRight size={14}/></button></footer></div></article>)}</div>}
        {((view==='gallery'&&!cases.length)||(view==='templates'&&!templates.length))&&data&&<div className="kw-empty"><Search size={28}/><p>{t.empty}</p><button type="button" className="kw-secondary" onClick={()=>setFilters({query:'',category:'',style:'',scene:'',favoritesOnly:false})}>{t.clear}</button></div>}
        {view==='gallery'&&cases.length>limit&&<div ref={moreRef} className="kw-more"><button type="button" className="kw-secondary" onClick={()=>setLimit(n=>n+30)}>{t.more}</button></div>}
        {view==='history'&&<div className="kw-tasks">{!tasks.length&&<div className="kw-empty"><Images size={38}/><h3>{t.noHistory}</h3><button type="button" className="kw-secondary" onClick={()=>setView('gallery')}>{t.gallery}<ArrowUpRight size={16}/></button></div>}
          {tasks.map(task=><article key={task.id} className={`kw-task ${task.status}`}><header><span className="kw-task-status">{task.status==='generating'?<LoaderCircle size={15} className="spinning"/>:task.status==='completed'?<Check size={15}/>:<Square size={14}/>} {task.status==='generating'?t.running:t[task.status]||task.status}</span><small>{task.model} · {task.size}</small><span>{Math.floor((task.status==='generating'?tick-task.createdAt:task.elapsedMs||0)/1000)}s</span>
            {task.status==='generating'?<IconButton icon={Square} label={t.stop} onClick={()=>stop(task.id)}/>:<DeleteButton t={t} onDelete={()=>removeTask(task)}/>}</header>
            {task.status==='generating'&&!task.images.length&&<div className="kw-generating"><div className="kw-generating-frame"><i/><WandSparkles size={28}/></div><span>{t.running}…</span></div>}
            <div className="kw-task-images">{task.images.map((url,index)=><figure key={index}><button type="button" onClick={()=>setPreview({url,task,index})}><img src={url} alt={task.prompt} loading="lazy"/></button><figcaption>{downloadButton(url,`kuanapi-${task.id}-${index+1}.${task.outputFormat}`)}<IconButton icon={Plus} label={t.reference} onClick={()=>reuse(url)}/><IconButton icon={Maximize2} label={t.read} onClick={()=>setPreview({url,task,index})}/></figcaption></figure>)}</div>
            {task.error&&<p className="kw-field-error">{task.error}</p>}<details><summary>{task.prompt}</summary><pre>{task.prompt}</pre>{task.revisedPrompt&&<pre>{task.revisedPrompt}</pre>}</details>
            <footer><span>{new Date(task.createdAt).toLocaleString(language)}</span><CopyButton value={task.prompt} t={t} onNotice={setNotice}/><button type="button" className="kw-link" onClick={()=>{patchDraft(cleanDraft(task));setReferences(task.references||[]);setEditorOpen(true);promptRef.current?.focus();}}><WandSparkles size={15}/>{t.use}</button>{task.status!=='generating'&&<IconButton icon={RotateCcw} label={t.retry} onClick={()=>generate(task)}/>}</footer>
          </article>)}</div>}
        {view==='compare'&&comparisons&&<Comparison data={comparisons} assetBase={assetBase} language={language} usePrompt={choosePrompt} download={download} onNotice={setNotice}/>}
        {view==='guide'&&<div className="kw-guide"><div className="kw-guide-actions"><button type="button" className="kw-secondary" onClick={()=>download(assetBase+'templates.md','templates.md')} disabled={downloads[assetBase+'templates.md']==='pending'}><Download size={16}/>{downloads[assetBase+'templates.md']==='ready'?t.openFile:t.guideDownload}</button><button type="button" className="kw-secondary" onClick={()=>download(assetBase+'style-library.zip','style-library.zip')} disabled={downloads[assetBase+'style-library.zip']==='pending'}><BookOpen size={16}/>{downloads[assetBase+'style-library.zip']==='ready'?t.openFile:t.archive}</button></div>
          <div className="kw-markdown" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(marked.parse(guide),{FORBID_TAGS:['img','script','iframe','form'],FORBID_ATTR:['style']})}}/>
          <section className="kw-attribution"><h3>{t.credits}</h3><p>{t.notice}</p><a href="https://github.com/freestylefly/awesome-gpt-image-2" target="_blank" rel="noreferrer">freestylefly / awesome-gpt-image-2 <ArrowUpRight size={15}/></a><a href={assetBase+'LICENSE.txt'} target="_blank" rel="noreferrer">MIT License</a></section></div>}
        {view!=='guide'&&<footer className="kw-source-footer"><span>awesome-gpt-image-2</span><button type="button" onClick={()=>setView('guide')}>{t.credits}<ArrowUpRight size={12}/></button></footer>}
      </main>
      {selected&&<aside className="kw-inspector" aria-label={t.read}>
        <header><span>{selected.variants?t.templates:`#${selected.id}`}</span><IconButton icon={X} label={t.close} onClick={closeSelected}/></header>
        <div className="kw-inspector-scroll"><button type="button" className="kw-detail-image" onClick={()=>setPreview({url:imageUrl(assetBase,selected.image||selected.cover),item:selected})}><Thumb item={{...selected,image:selected.image||selected.cover,title:textFor(selected.title,language)}} assetBase={assetBase} sourceRevision={data?.sourceRevision} full/></button>
          <h2>{textFor(selected.title,language)}</h2><p className="kw-detail-description">{textFor(selected.description,language)}</p>
          <div className="kw-detail-tags">{[selected.category,...selected.styles||[],...selected.scenes||[]].map(value=><button type="button" key={value} onClick={()=>{setFilters(old=>({...old,query:labelFor(value,library,'en')}));setView('gallery');setSelected(null);}}>{labelFor(value,library,language)}</button>)}</div>
          {selected.variants&&<label className="kw-field">{t.variants}<select value={variant} onChange={e=>{setVariant(Number(e.target.value));setVariables({});}}>{selected.variants.map((item,i)=><option key={i} value={i}>{item.name} {item.language==='json'?'· JSON':''}</option>)}</select></label>}
          {placeholders(selectedPrompt).length>0&&<details className="kw-variables" open={Boolean(selected.variants)}><summary>{t.variables}<span>{placeholders(selectedPrompt).length}</span></summary>{placeholders(selectedPrompt).map(key=><label key={key}>{key}<input value={variables[key]||''} onChange={e=>setVariables(old=>({...old,[key]:e.target.value}))}/></label>)}</details>}
          <div className="kw-section-title"><h3>{t.prompt}</h3><CopyButton value={effectivePrompt} t={t} onNotice={setNotice}/></div><textarea className="kw-detail-prompt" aria-label={language==='zh'?'案例提示词':'Case prompt'} value={effectivePrompt} readOnly/>
          {selected.guidance&&<section><h3>{t.constraints}</h3><ul>{(selected.guidance[language]||selected.guidance.en||[]).map(line=><li key={line}>{line}</li>)}</ul></section>}
          {selected.pitfalls&&<section><h3>{t.pitfalls}</h3><ul>{(selected.pitfalls[language]||selected.pitfalls.en||[]).map(line=><li key={line}>{line}</li>)}</ul></section>}
          {selected.exampleCases&&<section><h3>{t.examples}</h3><div className="kw-related">{selected.exampleCases.map(id=>data.cases.find(row=>row.id===id)).filter(Boolean).map(item=><button type="button" key={item.id} title={item.title} onClick={()=>selectItem(item)}><Thumb item={item} assetBase={assetBase} sourceRevision={data?.sourceRevision}/></button>)}</div></section>}
          {selected.sourceUrl&&<a className="kw-source-link" href={selected.sourceUrl} target="_blank" rel="noreferrer">{selected.sourceLabel}<ArrowUpRight size={15}/></a>}
          {selected.githubUrl&&<a className="kw-source-link" href={selected.githubUrl} target="_blank" rel="noreferrer">{t.source}<ArrowUpRight size={15}/></a>}
        </div><footer><button type="button" className="kw-generate" disabled={!effectivePrompt} onClick={()=>choosePrompt(effectivePrompt,selected)}><Plus size={17}/>{t.use}</button></footer>
      </aside>}
    </div>
    {notice&&<div className="kw-toast" role="status"><span>{notice}</span><IconButton icon={X} label={t.close} onClick={()=>setNotice('')}/></div>}
    {pendingPrompt&&<div className="kw-replace-confirm" role="alert"><span>{language==='zh'?'输入框中已有提示词':'The editor already contains a prompt'}</span><button type="button" className="kw-secondary" onClick={()=>setPendingPrompt(null)}>{t.keep}</button><button type="button" className="kw-generate" onClick={()=>applyPrompt(pendingPrompt.prompt,pendingPrompt.item)}>{t.replace}</button></div>}
    {preview&&<div className="kw-lightbox" role="dialog" aria-modal="true" aria-label={t.read}><header><span>{preview.task?.model||textFor(preview.item?.title,language)}</span>{downloadButton(preview.url,`kuanapi-image.${preview.task?.outputFormat||'png'}`)}{preview.task&&<IconButton icon={Plus} label={t.reference} onClick={()=>reuse(preview.url)}/>}<IconButton icon={X} label={t.close} onClick={()=>setPreview(null)}/></header><img key={preview.url} src={preview.url} onError={event=>{const fallback=sourceImageUrl(assetBase,preview.url,data?.sourceRevision);if(fallback&&!event.currentTarget.dataset.originalSource){event.currentTarget.dataset.originalSource='1';event.currentTarget.src=fallback;}}} alt={preview.task?.prompt||textFor(preview.item?.title,language)||''}/></div>}
  </div>;
}

class StudioBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return{failed:true};}
  render(){return this.state.failed?<div className="kw-start-error"><h2>专业生图暂时无法打开</h2><button onClick={()=>this.props.bridge.legacy()}>打开旧版工作台</button><button onClick={()=>this.props.bridge.back()}>返回对话</button></div>:this.props.children;}
}
export function mountStudio(element,bridge,{assetBase,native=false}) {
  const root=createRoot(element);
  root.render(<StudioBoundary bridge={bridge}><App bridge={bridge} assetBase={assetBase} native={native}/></StudioBoundary>);
  return()=>root.unmount();
}
