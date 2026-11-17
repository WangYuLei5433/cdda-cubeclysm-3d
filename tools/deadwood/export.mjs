// Exports DEADWOOD — Last Light's Frisson models as complete glTF files, built by the game's
// own assembly code (MIT) in a headless browser, so every part sits, mirrors and is coloured
// exactly as in the game: survivors, zombies (by kind and head), weapons and pickups.
//
//   node tools/deadwood/export.mjs --source <deadwood-open checkout> [--out sources/deadwood/export]
//
// The checkout needs public/*.js and public/frisson/ (a sparse checkout is enough). Nothing
// outside this machine is requested: the page may only reach the local server.
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { chromium } from 'playwright';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const source = resolve(arg('source', ''));
const out = resolve(ROOT, arg('out', 'sources/deadwood/export'));
if (!existsSync(join(source, 'public/frisson/survivors.glb'))) {
  console.error('--source must be a deadwood-open checkout with public/frisson/');
  process.exit(1);
}

const TYPES = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.glb': 'model/gltf-binary', '.json': 'application/json', '.png': 'image/png' };
const mounts = [
  ['/vendor/', join(ROOT, 'node_modules/three/build')],
  ['/three-addons/', join(ROOT, 'node_modules/three/examples/jsm')],
  ['/export/', join(HERE, 'page')],
  // The Cubeclysm builder's modules and face parts (shared face library).
  ['/cubeclysm/', join(HERE, '../cubeclysm/page')],
  ['/faces/', join(HERE, '../cubeclysm/faces')],
  ['/', join(source, 'public')],
];
const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  for (const [prefix, dir] of mounts) {
    if (!path.startsWith(prefix)) continue;
    const file = normalize(join(dir, path.slice(prefix.length)));
    if (!file.startsWith(dir + sep) || !existsSync(file) || !statSync(file).isFile()) break;
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
    return;
  }
  res.writeHead(404).end();
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.route('**/*', (route) => (route.request().url().startsWith(origin) ? route.continue() : route.abort()));
  page.on('pageerror', (e) => console.error('page error:', e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error(`page ${m.type()}:`, m.text()); });
  await page.exposeFunction('saveModel', (path, data) => {
    const file = join(out, path);
    if (!file.startsWith(out + sep)) throw new Error(`bad path ${path}`);
    mkdirSync(dirname(file), { recursive: true });
    const bytes = Buffer.from(data, 'base64');
    writeFileSync(file, bytes);
    console.log(`${(bytes.length / 1024).toFixed(0).padStart(7)} KB  ${path}`);
  });
  const only = arg('only', '');
  await page.goto(`${origin}/export/index.html${only ? `?only=${encodeURIComponent(only)}` : ''}`);
  const files = await page.evaluate(() => window.exportAll());
  const commit = (() => {
    try { return execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { return 'unknown'; }
  })();
  const index = { source: 'https://github.com/cedricbernadac/deadwood-open', commit, license: 'CC-BY-4.0', attribution: '"DEADWOOD — Last Light" by Cédric Bernadac, CC BY 4.0', files: files.map(({ path, info }) => ({ path, ...info })) };
  writeFileSync(join(out, only ? `index-${only}.json` : 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
  // The pool's own unbound meshset.json: every exported model, for browsing in the studio.
  const { readdirSync, readFileSync } = await import('node:fs');
  const pool = [...new Set(readdirSync(out).filter((f) => /^index(-.+)?\.json$/.test(f)).flatMap((f) => JSON.parse(readFileSync(join(out, f), 'utf8')).files.map((x) => x.path)))].sort();
  const set = (name, files) => `${JSON.stringify({ name, format_version: 1, models: files.map((file) => ({ file })) }, null, 1)}\n`;
  writeFileSync(join(out, 'meshset.json'), set('DEADWOOD 参考 (unbound)', pool.filter((f) => !f.startsWith('cubeclysm/'))));
  // Cubeclysm candidates are listed in the library's own Cubeclysm set (select.mjs), not here.
  console.log(`${files.length} models → ${out}`);
} finally {
  await browser.close();
  server.close();
}
