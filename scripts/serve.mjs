import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 4173);
const build = () => { const r = spawnSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { stdio: 'inherit' }); if (r.status !== 0) throw new Error('Build failed'); };
build();
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.json':'application/json' };
const server = http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  const target = path.resolve(dist, '.' + pathname);
  if (target !== dist && !target.startsWith(dist + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  try {
    let file = target;
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { Location: pathname + '/' }); res.end(); return; }
      file = path.join(file, 'index.html');
    }
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' }); res.end(bytes);
  } catch {
    res.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' });
    const html = await readFile(path.join(dist, '404.html'), 'utf8');
    res.end(html.replace('<head>', '<head><base href="/">'));
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
let pending;
const watchers = ['data','public'].map(folder => watch(path.join(root, folder), { recursive:true }, () => { clearTimeout(pending); pending = setTimeout(() => { try { build(); } catch (err) { console.error(err.message); } }, 180); }));
function stop() { watchers.forEach(w => w.close()); clearTimeout(pending); server.close(() => process.exit()); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
