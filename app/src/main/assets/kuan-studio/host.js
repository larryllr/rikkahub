const pageOrigin = location.origin;
const assets = "/assets/image-workbench/20260906e/";
let port;
let serial = 0;
let modelOptions = {};
const pending = new Map();
const root = document.getElementById("root");
const zh = navigator.language.toLowerCase().startsWith("zh");
root.textContent = zh ? "正在加载专业生图…" : "Loading Image Studio…";

function connect(event) {
  if (event.data !== "kuan-studio-connect" || event.ports.length !== 1 || port) return;
  port = event.ports[0];
  window.removeEventListener("message", connect);
  port.onmessage = ({ data }) => {
    const reply = JSON.parse(data);
    const entry = pending.get(reply.id);
    if (!entry) return;
    pending.delete(reply.id);
    entry.signal?.removeEventListener("abort", entry.abort);
    if (reply.ok) entry.resolve(reply.result);
    else entry.reject(new Error(reply.error));
  };
  start().catch(() => {
    root.textContent = zh ? "专业生图加载失败，请返回后重试。" : "Image Studio could not load. Go back and try again.";
  });
}
window.addEventListener("message", connect);

function call(action, payload = {}, signal) {
  if (signal?.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));
  const id = ++serial;
  return new Promise((resolve, reject) => {
    const abort = () => {
      pending.delete(id);
      port.postMessage(JSON.stringify({ id, action: "cancel" }));
      reject(new DOMException("Aborted", "AbortError"));
    };
    pending.set(id, { resolve, reject, signal, abort });
    signal?.addEventListener("abort", abort, { once: true });
    port.postMessage(JSON.stringify({ id, action, payload }));
  });
}

function validate(size, model) {
  const dimensions = /^([1-9]\d{0,4})x([1-9]\d{0,4})$/u.exec(size);
  if (!dimensions) return zh ? "请输入有效的图片尺寸" : "Enter a valid image size";
  const [, width, height] = dimensions.map(Number);
  const { supported_image_sizes: fixed, image_constraints: limits = {} } = modelOptions[model] || {};
  const bounded = (key) => Number.isFinite(limits[key]) && limits[key] > 0;
  if (Array.isArray(fixed) && fixed.includes(size)) return "";
  if ((Array.isArray(fixed) && limits.custom_sizes !== true)
    || (bounded("max_width") && width > limits.max_width)
    || (bounded("max_height") && height > limits.max_height)
    || (bounded("width_multiple") && width % limits.width_multiple)
    || (bounded("height_multiple") && height % limits.height_multiple)
    || (bounded("max_aspect_ratio") && Math.max(width, height) / Math.min(width, height) > limits.max_aspect_ratio)
    || (bounded("min_pixels") && width * height < limits.min_pixels)
    || (bounded("max_pixels") && width * height > limits.max_pixels)) {
    return zh ? "当前模型不支持这个图片尺寸" : "This model does not support that image size";
  }
  return "";
}

async function start() {
  const { mountStudio } = await import("/kuan-studio/studio.js");
  root.removeAttribute("role");
  mountStudio(root, {
    async initialize() {
      const info = await call("initialize");
      modelOptions = info.modelOptions;
      return info;
    },
    validate,
    generate: ({ signal, ...payload }) => call("generate", payload, signal),
    generationStatus: (taskId) => call("generationStatus", {taskId}),
    stopGeneration: (taskId) => call("stopGeneration", {taskId}),
    profile: () => call("profile"),
    async pickFiles() {
      const { files } = await call("pick");
      return Promise.all(files.map(async ({ url, name }) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(zh ? "无法读取参考图，请重新选择" : "Could not read the selected image");
        const blob = await response.blob();
        return new File([blob], name, { type: blob.type });
      }));
    },
    back: () => void call("back"),
    download: (url, name, { fallbackUrl } = {}) => call("download", {
      url: new URL(url, pageOrigin).href, name, fallback: fallbackUrl || undefined,
    }),
  }, { assetBase: assets, native: true });
}
