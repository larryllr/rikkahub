const IMAGE_EXTENSIONS = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

export function downloadName(name, mime) {
  let result = String(name || 'kuanapi-file').replace(/[\x00-\x1f\x7f<>:"/\\|?*\u202a-\u202e\u2066-\u2069]/g, '_').trim();
  result = result.replace(/[. ]+$/g, '').slice(0, 180) || 'kuanapi-file';
  const extension = IMAGE_EXTENSIONS[mime];
  if (extension && /\.(?:png|jpe?g|webp|gif|avif)$/i.test(result)) result = result.replace(/\.[^.]+$/, '.' + extension);
  return result;
}

async function blobBytes(blob) {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(reader.error||new Error('文件读取失败。'));reader.readAsArrayBuffer(blob);
  });
}

export async function downloadedMime(blob) {
  const head = new Uint8Array(await blobBytes(blob.slice(0, 16)));
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return 'image/png';
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  const ascii = String.fromCharCode(...head);
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'image/webp';
  if (ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a')) return 'image/gif';
  if (ascii.slice(4, 8) === 'ftyp' && /avif|avis/.test(ascii.slice(8))) return 'image/avif';
  if (/^\s*<(?:!doctype|html|head|body)/i.test(ascii)) return 'text/html';
  const declared = blob.type.split(';', 1)[0].toLowerCase();
  return declared.startsWith('image/') ? 'application/octet-stream' : declared || 'application/octet-stream';
}

function nativeFiles() {
  const bridge = globalThis.KuanAndroid;
  if (!bridge) return null;
  const methods = ['fileSaveCapability', 'hasDownloadedFile', 'beginFileSave', 'appendFileSave', 'finishFileSave', 'abortFileSave', 'openDownloadedFile'];
  if (!methods.every(name => typeof bridge[name] === 'function') || bridge.fileSaveCapability() < 1)
    throw new Error('当前软件不支持本机文件保存，请更新软件后重试。');
  return bridge;
}

async function encodedChunk(blob) {
  const bytes = new Uint8Array(await blobBytes(blob));
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 32768)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return btoa(binary);
}

async function galleryPermission(bridge, signal) {
  const id='gallery-'+(crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(16).slice(2));
  await new Promise((resolve,reject)=>{
    const cleanup=()=>{clearTimeout(timer);globalThis.removeEventListener('kuan:gallery-permission',reply);signal.removeEventListener('abort',aborted);};
    const reply=event=>{if(event.detail?.id!==id)return;cleanup();event.detail.granted?resolve():reject(new Error('未允许保存到系统相册；原图仍保留在本机，可授权后重试。'));};
    const aborted=()=>{cleanup();reject(signal.reason||new DOMException('Aborted','AbortError'));};
    const timer=setTimeout(()=>{cleanup();reject(new Error('等待相册权限确认超时，请重试。'));},60000);
    globalThis.addEventListener('kuan:gallery-permission',reply);signal.addEventListener('abort',aborted,{once:true});
    if(signal.aborted){aborted();return;}
    try{if(bridge.requestGalleryPermission(id)){cleanup();resolve();}}
    catch(error){cleanup();reject(error);}
  });
}

export function createStudioDownloader({ ownerId, getOwner = () => ownerId, timeoutMs = 120000 } = {}) {
  const active = new Map();
  let disposed = false;
  const assertOwner = () => {
    if (disposed || !ownerId || String(getOwner()) !== String(ownerId))
      throw new DOMException('Download account changed or page closed', 'AbortError');
  };
  const check = error => { if (error) throw new Error(String(error)); };
  const download = (value, requestedName, { fallbackUrl } = {}) => {
    const identity = String(value);
    if (active.has(identity)) return active.get(identity).promise;
    const controller = new AbortController();
    const operation = (async () => {
      assertOwner();
      const url = new URL(identity, location.href);
      if (!['https:', 'http:', 'blob:', 'data:'].includes(url.protocol)) throw new Error('不支持的下载地址。');
      if (url.protocol === 'http:' && location.protocol === 'https:') {
        if (url.host !== location.host) throw new Error('拒绝通过不安全的 HTTP 链接下载文件。');
        url.protocol = 'https:';
      }
      const bridge = nativeFiles();
      const album=bridge&&/\.(?:png|jpe?g|webp|gif|avif)$/i.test(requestedName);
      if(album&&(!['gallerySaveCapability','requestGalleryPermission','saveDownloadedImageToGallery','openDownloadedImageFromGallery'].every(name=>typeof bridge[name]==='function')||bridge.gallerySaveCapability()<1))
        throw new Error('保存到系统相册需要新版安卓安装包，请先更新软件。');
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(url.href+(fallbackUrl?'\n'+fallbackUrl:'')));
      const key = String(ownerId) + ':image-studio:' + Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
      const saveAlbum=async openExisting=>{
        await galleryPermission(bridge,controller.signal);assertOwner();
        const result=JSON.parse(bridge.saveDownloadedImageToGallery(key));
        if(result.error)throw new Error(result.error);
        if(!result.saved||!result.album)throw new Error('相册保存未得到确认，请重试。');
        if(openExisting&&result.alreadySaved){bridge.openDownloadedImageFromGallery(key);return {...result,opened:true};}
        return result;
      };
      assertOwner();
      if (bridge?.hasDownloadedFile(key)) {
        if(album)return saveAlbum(true);
        bridge.openDownloadedFile(key);
        return { opened: true, saved: true };
      }
      let timer, timedOut=false;
      const throwIfAborted=()=>{
        if(controller.signal.aborted)throw timedOut?new DOMException('下载超时，请重试。','TimeoutError')
          :controller.signal.reason||new DOMException('Aborted','AbortError');
      };
      try {
        timer = setTimeout(() => {timedOut=true;controller.abort();}, timeoutMs);
        let blob, mime;
        const sources = [url.href];
        if (fallbackUrl) {
          const fallback = new URL(fallbackUrl);
          if (fallback.origin !== 'https://raw.githubusercontent.com' || !fallback.pathname.startsWith('/freestylefly/awesome-gpt-image-2/'))
            throw new Error('无效的图库原图来源。');
          sources.push(fallback.href);
        }
        for (const [index, source] of sources.entries()) {
          try {
            const sourceUrl = new URL(source);
            const response = await fetch(source, { signal: controller.signal,
              credentials: sourceUrl.origin === location.origin ? 'same-origin' : 'omit', referrerPolicy: 'no-referrer' });
            if (!response.ok) throw new Error(`文件下载失败（HTTP ${response.status}）。`);
            if (response.url && location.protocol === 'https:' && new URL(response.url).protocol === 'http:')
              throw new Error('下载被重定向到不安全的 HTTP 地址。');
            blob = await response.blob();
            assertOwner(); throwIfAborted();
            if (!blob.size) throw new Error('下载返回了空文件。');
            mime = await downloadedMime(blob);
            if (mime === 'text/html' || mime === 'application/xhtml+xml') throw new Error('下载返回了网页或登录页，没有返回原文件。');
            if (/\.(?:png|jpe?g|webp|gif|avif)$/i.test(requestedName) && !mime.startsWith('image/'))
              throw new Error('下载没有返回有效的原图。');
            break;
          } catch (error) {
            throwIfAborted();
            if (disposed || String(getOwner()) !== String(ownerId) || index === sources.length - 1) throw error;
          }
        }
        const name = downloadName(requestedName, mime);
        if (bridge) {
          check(bridge.beginFileSave(key, name, mime, blob.size));
          try {
            for (let offset = 0; offset < blob.size; offset += 262144) {
              assertOwner(); throwIfAborted();
              check(bridge.appendFileSave(key, await encodedChunk(blob.slice(offset, offset + 262144))));
              await new Promise(resolve => setTimeout(resolve, 0));
            }
            assertOwner(); throwIfAborted();
            check(bridge.finishFileSave(key));
            if (!bridge.hasDownloadedFile(key)) throw new Error('本机文件保存未能确认，请重试。');
            if(album)return {...await saveAlbum(false),name};
            return { saved: true, name };
          } catch (error) {
            try { bridge.abortFileSave(key); } catch {}
            throw error;
          }
        }
        const local = URL.createObjectURL(blob), anchor = document.createElement('a');
        anchor.href = local; anchor.download = name; anchor.rel = 'noopener';
        try { document.body.appendChild(anchor); anchor.click(); }
        finally { anchor.remove(); setTimeout(() => URL.revokeObjectURL(local), 60000); }
        return { started: true, name };
      } finally { clearTimeout(timer); }
    })();
    const promise = operation.finally(() => { if (active.get(identity)?.promise === promise) active.delete(identity); });
    active.set(identity, { promise, controller });
    return promise;
  };
  download.dispose = () => { disposed = true; for (const operation of active.values()) operation.controller.abort(); };
  return download;
}
