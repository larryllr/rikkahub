export const textFor = (value, language = 'zh') => typeof value === 'string' ? value : value?.[language] || value?.en || value?.zh || '';

export function labelFor(value, library, language) {
  const entry = [...(library.categories || []), ...(library.styles || []), ...(library.scenes || [])].find(item => item.value === value);
  return entry ? textFor(entry.title, language) : textFor(library.tagLabels?.[value], language) || value;
}

export function filterCases(cases, {query = '', category = '', style = '', scene = '', favoritesOnly = false, favorites = []} = {}) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const saved = new Set(favorites);
  return cases.filter(item => (!category || item.category === category)
    && (!style || item.styles.includes(style)) && (!scene || item.scenes.includes(scene))
    && (!favoritesOnly || saved.has(item.id))
    && terms.every(term => `${item.title} ${item.prompt} ${item.category} ${item.sourceLabel} ${item.styles.join(' ')} ${item.scenes.join(' ')}`.toLowerCase().includes(term)));
}

export function placeholders(prompt) {
  return [...new Set([...String(prompt).matchAll(/\[([^\[\]\n]{1,100})\]/g)].map(match => match[1]))];
}

export function fillPlaceholders(prompt, values) {
  return String(prompt).replace(/\[([^\[\]\n]{1,100})\]/g, (original, key) => String(values[key] || '').trim() || original);
}

export function imageUrl(base, path, thumbnail = false) {
  if (typeof path !== 'string' || !/^\/(?:images|comparison)\//.test(path) || path.includes('..') || /[?#\\]/.test(path)) return '';
  if (path.startsWith('/comparison/')) return base + path.slice(1);
  return base + (thumbnail ? 'thumbs/' + path.slice(8).replace(/\.[^.]+$/, '.webp') : path.slice(1));
}

export function sourceImageUrl(base, url, revision) {
  if (!/^[0-9a-f]{40}$/.test(revision || '')) return '';
  const root = new URL(base, location.href), image = new URL(url, location.href);
  if (image.origin !== root.origin || !image.pathname.startsWith(root.pathname + 'images/')) return '';
  const relative = image.pathname.slice(root.pathname.length);
  if (!/^images\/[a-zA-Z0-9_/-]+\.(?:png|jpg|jpeg|webp)$/i.test(relative) || relative.includes('..')) return '';
  return `https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/${revision}/data/${relative}`;
}

export function compareModels(a, b) {
  const av = [...a.matchAll(/\d+/g)].map(value => Number(value[0]));
  const bv = [...b.matchAll(/\d+/g)].map(value => Number(value[0]));
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    if ((av[i] || 0) !== (bv[i] || 0)) return (bv[i] || 0) - (av[i] || 0);
  }
  return a.localeCompare(b);
}

export function cleanDraft(draft) {
  const {prompt = '', model = '', size = '1024x1024', quality = 'auto', outputFormat = 'png', outputCompression = 90, count = 1, autoModel = true} = draft || {};
  return {prompt, model, size, quality, outputFormat, outputCompression, count, autoModel};
}

export async function readReference(file) {
  if (!/^image\/(png|jpeg|webp|gif)$/i.test(file.type)) throw new Error('请选择 PNG、JPG、WebP 或 GIF 图片');
  if (file.size > 20 * 1024 * 1024) throw new Error('单张参考图不能超过 20 MB');
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
  return {id: crypto.randomUUID(), name: file.name, size: file.size, dataUrl};
}

export function publicTask(task) {
  const {id, userId, prompt, createdAt, completedAt, elapsedMs, status, model, size, quality, outputFormat,
    outputCompression, count, references, images, revisedPrompt, requestId, error, caseId} = task;
  return {id, userId, prompt, createdAt, completedAt, elapsedMs, status, model, size, quality, outputFormat,
    outputCompression, count, references, images, revisedPrompt, requestId, error, caseId};
}
