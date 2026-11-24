import test from 'node:test';
import assert from 'node:assert/strict';
import { createStudioDownloader, downloadName, downloadedMime } from '../src/download.js';
import { sourceImageUrl } from '../src/library.js';

const png = new Uint8Array(700000); png.set([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
function fixture(t) {
  const before = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis,'location',{configurable:true,value:{href:'https://kuan.example/image-studio',origin:'https://kuan.example',protocol:'https:',host:'kuan.example'}});
  const bridgeBefore = Object.getOwnPropertyDescriptor(globalThis,'KuanAndroid');
  t.after(()=>{if(before)Object.defineProperty(globalThis,'location',before);else delete globalThis.location;
    if(bridgeBefore)Object.defineProperty(globalThis,'KuanAndroid',bridgeBefore);else delete globalThis.KuanAndroid;});
  const files = new Map(), calls = [], pending = new Map(), album = new Map();
  const events = new EventTarget();
  for(const method of ['addEventListener','removeEventListener','dispatchEvent']){
    const descriptor=Object.getOwnPropertyDescriptor(globalThis,method);
    Object.defineProperty(globalThis,method,{configurable:true,value:events[method].bind(events)});
    t.after(()=>{if(descriptor)Object.defineProperty(globalThis,method,descriptor);else delete globalThis[method];});
  }
  const bridge = {fileSaveCapability:()=>1,hasDownloadedFile:key=>files.has(key),
    gallerySaveCapability:()=>1,requestGalleryPermission:()=>true,
    saveDownloadedImageToGallery(key){const alreadySaved=album.has(key);if(!alreadySaved){album.set(key,Buffer.from(files.get(key).bytes));calls.push('album');}
      return JSON.stringify({saved:true,album:true,alreadySaved,uri:'content://media/qa'});},
    openDownloadedImageFromGallery(){calls.push('open-album');},
    beginFileSave(key,name,mime,size){calls.push('begin');pending.set(key,{name,mime,size,chunks:[]});return '';},
    appendFileSave(key,value){const bytes=Buffer.from(value,'base64');assert(bytes.length<=512*1024);pending.get(key).chunks.push(bytes);return '';},
    finishFileSave(key){const file=pending.get(key);file.bytes=Buffer.concat(file.chunks);assert.equal(file.bytes.length,file.size);files.set(key,file);pending.delete(key);return '';},
    abortFileSave(key){calls.push('abort');pending.delete(key);},openDownloadedFile(){calls.push('open');}};
  Object.defineProperty(globalThis,'KuanAndroid',{configurable:true,value:bridge});
  t.mock.method(globalThis,'fetch',async()=>new Response(png,{headers:{'Content-Type':'image/png'}}));
  return {files,calls,pending,album,bridge,save:createStudioDownloader({ownerId:'user-one'})};
}
test('native save preserves complete bytes and repeated clicks open without another download', async t=>{
  const f=fixture(t);const result=await f.save('/generated.png','original.png');
  assert.equal(result.saved,true);assert.equal(result.album,true);assert.deepEqual([...f.files.values()][0].bytes,Buffer.from(png));
  assert.deepEqual([...f.album.values()][0],Buffer.from(png));
  assert.equal((await f.save('/generated.png','other-name.png')).opened,true);
  assert.equal(fetch.mock.calls.length,1);assert.deepEqual(f.calls,['begin','album','open-album']);
});

test('old APK cannot report private image storage as gallery success',async t=>{
  const f=fixture(t);delete f.bridge.gallerySaveCapability;
  await assert.rejects(f.save('/generated.png','a.png'),/新版安卓安装包/);assert.equal(fetch.mock.calls.length,0);
});

test('permission denial preserves original, then grant retries gallery without refetch',async t=>{
  const f=fixture(t);f.bridge.requestGalleryPermission=id=>{
    const event=new Event('kuan:gallery-permission');event.detail={id,granted:false};dispatchEvent(event);return false;
  };
  await assert.rejects(f.save('/generated.png','a.png'),/未允许/);
  assert.equal(f.files.size,1);assert.equal(f.album.size,0);
  f.bridge.requestGalleryPermission=()=>true;
  assert.equal((await f.save('/generated.png','a.png')).album,true);assert.equal(fetch.mock.calls.length,1);
});

test('asynchronous permission grant resumes waiting save',async t=>{
  const f=fixture(t);f.bridge.requestGalleryPermission=id=>{setTimeout(()=>{
    const event=new Event('kuan:gallery-permission');event.detail={id,granted:true};dispatchEvent(event);
  },5);return false;};
  assert.equal((await f.save('/generated.png','a.png')).album,true);assert.equal(f.album.size,1);
});

test('gallery publication failure is not success and can retry the private original',async t=>{
  const f=fixture(t),save=f.bridge.saveDownloadedImageToGallery;
  f.bridge.saveDownloadedImageToGallery=()=>JSON.stringify({error:'Gallery full'});
  await assert.rejects(f.save('/generated.png','a.png'),/Gallery full/);assert.equal(f.files.size,1);
  f.bridge.saveDownloadedImageToGallery=save;
  assert.equal((await f.save('/generated.png','a.png')).album,true);assert.equal(fetch.mock.calls.length,1);
});

test('deleting a gallery image allows export again without redownloading',async t=>{
  const f=fixture(t);await f.save('/generated.png','a.png');f.album.clear();
  const result=await f.save('/generated.png','a.png');assert.equal(result.alreadySaved,false);
  assert.equal(f.album.size,1);assert.equal(fetch.mock.calls.length,1);assert(!f.calls.includes('open-album'));
});

test('documents stay outside the image gallery and retain their extensions',async t=>{
  const f=fixture(t);fetch.mock.mockImplementation(async()=>new Response('print(1)',{headers:{'Content-Type':'text/plain'}}));
  await f.save('/example.py','example.py');await f.save('/example.py','example.py');
  assert.equal([...f.files.values()][0].name,'example.py');assert.equal(f.album.size,0);assert.deepEqual(f.calls,['begin','open']);
});

test('fake image content type cannot hide HTML or arbitrary bytes',async t=>{
  const f=fixture(t);fetch.mock.mockImplementation(async()=>new Response('<!DOCTYPE html><p>login</p>',{headers:{'Content-Type':'image/png'}}));
  await assert.rejects(f.save('/html.png','a.png'),/网页或登录页/);
  fetch.mock.mockImplementation(async()=>new Response('not a picture',{headers:{'Content-Type':'image/png'}}));
  await assert.rejects(f.save('/fake.png','a.png'),/有效的原图/);assert.equal(f.files.size,0);
});

test('leaving while permission is pending cannot export an image',async t=>{
  const f=fixture(t);let waiting;const started=new Promise(resolve=>waiting=resolve);
  f.bridge.requestGalleryPermission=()=>{waiting();return false;};
  const pending=f.save('/generated.png','a.png');await started;f.save.dispose();
  await assert.rejects(pending,{name:'AbortError'});assert.equal(f.album.size,0);
});
test('concurrent clicks share one transfer',async t=>{
  const f=fixture(t),first=f.save('/generated.png','a.png'),second=f.save('/generated.png','a.png');
  assert.equal(first,second);await first;assert.equal(f.calls.filter(x=>x==='begin').length,1);
});
test('HTML 200 response is rejected rather than saved as an image',async t=>{
  const f=fixture(t);fetch.mock.mockImplementation(async()=>new Response('<html>login</html>',{headers:{'Content-Type':'text/html'}}));
  await assert.rejects(f.save('/generated.png','a.png'),/网页或登录页/);assert.equal(f.files.size,0);assert.equal(f.calls.length,0);
});
test('missing public original can use pinned upstream bytes without sending credentials',async t=>{
  const f=fixture(t);fetch.mock.mockImplementation(async(url)=>url.startsWith('https://kuan.example')
    ?new Response('<html>fallback</html>',{headers:{'Content-Type':'text/html'}}):new Response(png,{headers:{'Content-Type':'image/png'}}));
  await f.save('/assets/images/case.png','a.png',{fallbackUrl:'https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/'+'a'.repeat(40)+'/data/images/case.png'});
  assert.equal(fetch.mock.calls.length,2);assert.equal(fetch.mock.calls[1].arguments[1].credentials,'omit');
  assert.deepEqual([...f.files.values()][0].bytes,Buffer.from(png));
});
test('HTTP and body transport failures never commit a local file',async t=>{
  const f=fixture(t);
  fetch.mock.mockImplementation(async()=>new Response('not found',{status:404}));
  await assert.rejects(f.save('/missing.png','a.png'),/404/);
  fetch.mock.mockImplementation(async()=>({ok:true,url:'',blob:async()=>{throw new Error('body disconnected');}}));
  await assert.rejects(f.save('/body.png','a.png'),/body disconnected/);assert.equal(f.files.size,0);
});
test('native transfer failure aborts partial data and surfaces the error',async t=>{
  const f=fixture(t);f.bridge.appendFileSave=()=> 'Disk full';
  await assert.rejects(f.save('/generated.png','a.png'),/Disk full/);assert.equal(f.pending.size,0);assert.equal(f.files.size,0);assert(f.calls.includes('abort'));
});
test('account change during chunk transfer cannot finish under another owner',async t=>{
  const f=fixture(t);let owner='one';const save=createStudioDownloader({ownerId:owner,getOwner:()=>owner});
  const append=f.bridge.appendFileSave;f.bridge.appendFileSave=(...args)=>{const value=append(...args);owner='two';return value;};
  await assert.rejects(save('/generated.png','a.png'),{name:'AbortError'});assert.equal(f.pending.size,0);assert.equal(f.files.size,0);
});
test('dispose cancels a pending network download',async t=>{
  const f=fixture(t);let started;
  const waiting=new Promise(resolve=>{started=resolve;});
  fetch.mock.mockImplementation(async(_url,{signal})=>{started();return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));});
  const pending=f.save('/generated.png','a.png');await waiting;f.save.dispose();
  await assert.rejects(pending,{name:'AbortError'});assert.equal(f.files.size,0);
});
test('timeout covers the response body and does not leave a completed transfer',async t=>{
  const f=fixture(t);const save=createStudioDownloader({ownerId:'one',timeoutMs:15});
  fetch.mock.mockImplementation(async(_url,{signal})=>({ok:true,url:'',blob:()=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}))}));
  await assert.rejects(save('/generated.png','a.png'),{name:'TimeoutError'});assert.equal(f.files.size,0);
});
test('incomplete older native bridges do not silently fall back to an unsupported blob link',async t=>{
  const f=fixture(t);delete f.bridge.beginFileSave;
  await assert.rejects(f.save('/generated.png','a.png'),/更新软件/);assert.equal(fetch.mock.calls.length,0);
});
test('filenames preserve document extensions and correct actual image encoding',async()=>{
  assert.equal(downloadName('example.py','text/plain'),'example.py');assert.equal(downloadName('templates.md','text/plain'),'templates.md');
  assert.equal(downloadName('picture.png','image/jpeg'),'picture.jpg');assert.equal(downloadName('../bad\u0000.png','image/webp'),'.._bad_.webp');
  assert.equal(await downloadedMime(new Blob([png],{type:'application/octet-stream'})),'image/png');
});
test('public gallery fallback is pinned and never applied to generated or foreign URLs',t=>{
  fixture(t);const revision='a'.repeat(40),base='/assets/image-workbench/release/';
  assert.equal(sourceImageUrl(base,base+'images/case17.jpg',revision),`https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/${revision}/data/images/case17.jpg`);
  assert.equal(sourceImageUrl(base,'/kuan/chat-assets/private.png',revision),'');assert.equal(sourceImageUrl(base,'https://foreign.example/images/case17.jpg',revision),'');
});
test('older WebViews do not need Blob.arrayBuffer or AbortSignal.throwIfAborted',async t=>{
  const f=fixture(t),read=Blob.prototype.arrayBuffer,descriptor=Object.getOwnPropertyDescriptor(globalThis,'FileReader');
  const bytesDescriptor=Object.getOwnPropertyDescriptor(Blob.prototype,'arrayBuffer'),abortDescriptor=Object.getOwnPropertyDescriptor(AbortSignal.prototype,'throwIfAborted');
  Object.defineProperty(Blob.prototype,'arrayBuffer',{configurable:true,value:undefined});
  Object.defineProperty(AbortSignal.prototype,'throwIfAborted',{configurable:true,value:undefined});
  t.after(()=>{Object.defineProperty(Blob.prototype,'arrayBuffer',bytesDescriptor);Object.defineProperty(AbortSignal.prototype,'throwIfAborted',abortDescriptor);});
  assert.equal(typeof Blob.prototype.arrayBuffer,'undefined');assert.equal(typeof AbortSignal.prototype.throwIfAborted,'undefined');
  Object.defineProperty(globalThis,'FileReader',{configurable:true,value:class {
    readAsArrayBuffer(blob){read.call(blob).then(value=>{this.result=value;this.onload();},error=>{this.error=error;this.onerror();});}
  }});
  t.after(()=>{if(descriptor)Object.defineProperty(globalThis,'FileReader',descriptor);else delete globalThis.FileReader;});
  await f.save('/generated.png','a.png');assert.deepEqual([...f.files.values()][0].bytes,Buffer.from(png));
});
