// Packs the real generated pages into a single offline review file.
// It uses the same HTML/CSS/JS as dist, with no network dependencies.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const projects = JSON.parse(await readFile(path.join(root, 'data/projects.json'), 'utf8'));
const routes = ['/', '/resume/', ...projects.map(p => '/work/' + p.slug + '/')];
const css = await readFile(path.join(dist, 'styles.css'), 'utf8');
const js = await readFile(path.join(dist, 'main.js'), 'utf8');
const bundle = {};
for (const route of routes) {
  let html = await readFile(path.join(dist, route.slice(1), 'index.html'), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  html = html.replace(/<link rel="stylesheet"[^>]+>/, () => `<style>${css}</style>`)
    .replace(/<script src="[^\"]+" defer><\/script>/, () => '')
    .replace(/<link rel="icon"[^>]+>/, '');
  const images = [...html.matchAll(/src="([^\"]+\.(?:png|svg))"/g)];
  for (const m of images) {
    const data = await readFile(path.resolve(dist, route.slice(1), m[1]));
    const type = m[1].endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    html = html.replace(m[0], `src="data:${type};base64,${data.toString('base64')}"`);
  }
  const bridge = `document.addEventListener('click',function(ev){const a=ev.target.closest('a');if(!a)return;const href=a.getAttribute('href');if(!href||/^(https?:|mailto:)/.test(href))return;const u=new URL(href,'https://portfolio.invalid${route}');ev.preventDefault();if(u.pathname===${JSON.stringify(route)}&&u.hash){document.getElementById(decodeURIComponent(u.hash.slice(1)))?.scrollIntoView({behavior:'smooth'});return;}parent.postMessage({type:'portfolio-navigate',path:u.pathname+u.hash},'*')});window.addEventListener('message',function(ev){if(ev.source===parent&&ev.data?.type==='portfolio-anchor'){document.getElementById(ev.data.id)?.scrollIntoView()}});`;
  html = html.replace('</body>', () => `<script>${js}\n${bridge}</script></body>`);
  bundle[route] = {html,title};
}
const json = JSON.stringify(bundle).replace(/</g,'\\u003c');
const viewer = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Jonatan Manurung — Portfolio preview</title><style>html,body{margin:0;width:100%;height:100%;background:#191b19}iframe{display:block;width:100%;height:100%;border:0}</style></head><body><iframe id="portfolio" title="Jonatan Manurung portfolio"></iframe><script type="application/json" id="pages">${json}</script><script>
const pages=JSON.parse(document.getElementById('pages').textContent);const frame=document.getElementById('portfolio');
function render(){const raw=location.hash.slice(1)||'/';const split=raw.indexOf('#');const route=split<0?raw:raw.slice(0,split);const anchor=split<0?'':raw.slice(split+1);const page=pages[route]||pages['/'];document.title=page.title;frame.onload=()=>{if(anchor)frame.contentWindow.postMessage({type:'portfolio-anchor',id:decodeURIComponent(anchor)},'*')};frame.srcdoc=page.html;}
window.addEventListener('message',ev=>{if(ev.source!==frame.contentWindow||ev.data?.type!=='portfolio-navigate')return;if(typeof ev.data.path==='string'&&pages[ev.data.path.split('#')[0]])location.hash=ev.data.path;});window.addEventListener('hashchange',render);render();
</script></body></html>`;
await writeFile(path.join(root, 'START-HERE.html'), viewer);
console.log('Created START-HERE.html — all four portfolio pages, usable offline.');
