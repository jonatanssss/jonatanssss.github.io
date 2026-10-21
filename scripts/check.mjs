import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
async function walk(dir) { const entries = await readdir(dir, {withFileTypes:true}); return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir,e.name)) : path.join(dir,e.name)))).flat(); }
const pages = (await walk(dist)).filter(p => p.endsWith('.html'));
let links = 0;
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  assert(html.includes('<html lang="en">'), `English document language: ${page}`);
  assert.equal((html.match(/<h1[ >]/g)||[]).length, 1, `One main heading: ${page}`);
  assert(/<title>[^<]+<\/title>/.test(html), `Page title: ${page}`);
  assert(/name="description" content="[^"]+"/.test(html), `Description: ${page}`);
  for (const m of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const href = m[1]; if (/^(https?:|mailto:|data:|\/)/.test(href)) continue;
    let dest = path.resolve(path.dirname(page), href);
    if (href.endsWith('/')) dest = path.join(dest, 'index.html');
    await access(dest).catch(() => { throw new Error(`Broken local reference ${href} in ${page}`); }); links++;
  }
  for (const m of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${m[1]}"`), `Missing anchor #${m[1]} in ${page}`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) assert(/alt="[^"]*"/.test(m[0]), `Image needs alt text: ${page}`);
  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert(/rel="noopener noreferrer"/.test(m[0]), `External link protection: ${page}`);
}
console.log(`Checked ${pages.length} pages and ${links} local references: no missing files, anchors, titles, or image descriptions.`);
const portablePath = path.resolve(dist, '../START-HERE.html');
try {
  const portable = await readFile(portablePath, 'utf8');
  const packed = portable.match(/<script type="application\/json" id="pages">([\s\S]*?)<\/script>/);
  assert(packed, 'Portable page bundle is present');
  const bundle = JSON.parse(packed[1]);
  assert.equal(Object.keys(bundle).length, 4, 'Portable bundle contains four main pages');
  for (const [route, page] of Object.entries(bundle)) {
    assert(!/<(?:img|script)[^>]+src="(?!data:)/.test(page.html), `Portable asset is self-contained: ${route}`);
    for (const m of page.html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(m[1], { filename: route });
    for (const m of page.html.matchAll(/href="([^"]+)"/g)) {
      const href = m[1]; if (/^(https?:|mailto:)/.test(href)) continue;
      const target = new URL(href, 'https://portfolio.invalid' + route);
      assert(bundle[target.pathname], `Offline route exists: ${href} from ${route}`);
      if (target.hash) assert(bundle[target.pathname].html.includes(`id="${target.hash.slice(1)}"`), `Offline anchor exists: ${href}`);
    }
  }
  for (const m of portable.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(m[1], {filename:'portable-viewer'});
  console.log('Checked offline bundle: four routes, embedded assets, internal navigation targets, and JavaScript syntax.');
} catch (err) { if (err.code !== 'ENOENT') throw err; }
