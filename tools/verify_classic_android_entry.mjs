import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const [scriptPath, manifestPath] = process.argv.slice(2);
const updateScript = readFileSync(scriptPath);
const manifest = readFileSync(manifestPath);
const shelf = readFileSync(new URL('../distribution/android.html', import.meta.url));
const logo = readFileSync(new URL('../app/src/main/res/drawable-nodpi/kuan_logo.png', import.meta.url));

const fixture = `<!DOCTYPE html><html lang="zh-CN"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Classic settings fixture</title><main class="kuan-settings-body"></main>
<output id="manual"></output><script>
window.KuanAndroid = {
  resourceStatus: () => JSON.stringify({appVersion:"1.6.10", automatic:true, message:"current"}),
  checkResourceUpdate: () => {document.getElementById("manual").textContent="Classic resource check called";}
};
</script><script src="/updates.js"></script></html>`;

createServer((req, res) => {
  const path = new URL(req.url, 'http://127.0.0.1').pathname;
  const result = {
    '/': ['text/html; charset=UTF-8', fixture],
    '/updates.js': ['application/javascript; charset=UTF-8', updateScript],
    '/downloads/mobile-latest.json': ['application/json', manifest],
    '/downloads/android.html': ['text/html; charset=UTF-8', shelf],
    '/downloads/mobile-native/2.0.2/logo.png': ['image/png', logo],
  }[path];
  if (!result) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': result[0], 'Cache-Control': 'no-store' }).end(result[1]);
}).listen(5236, '127.0.0.1', () => console.log('Classic settings fixture: http://127.0.0.1:5236/'));
