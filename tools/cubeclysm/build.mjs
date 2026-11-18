// Builds the Cubeclysm models from their recipes (tools/cubeclysm/page/recipes.js) in a headless
// browser (three.js, canvas textures, GLTFExporter) into sources/cubeclysm/: a .glb and its texture
// atlas (.png) per model and an index. tools/deadwood/select.mjs then binds them in the Cubeclysm set.
//
//   node tools/cubeclysm/build.mjs [--only mon_zombie,mon_zombie_cop]
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const OUT = join(ROOT, 'sources/cubeclysm');
const i = process.argv.indexOf('--only');
const only = i > 0 ? process.argv[i + 1].split(',') : null;

const TYPES = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png' };
const FACES = join(HERE, 'faces');
const mounts = [['/vendor/', join(ROOT, 'node_modules/three/build')], ['/three-addons/', join(ROOT, 'node_modules/three/examples/jsm')], ['/page/', join(HERE, 'page')], ['/faces/', FACES]];
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
  page.on('console', (m) => { if (m.type() === 'error') console.error('page:', m.text()); });
  await page.exposeFunction('save', (path, data) => {
    const file = join(OUT, path);
    if (!file.startsWith(OUT + sep)) throw new Error(`bad path ${path}`);
    mkdirSync(dirname(file), { recursive: true });
    const bytes = Buffer.from(data, 'base64');
    writeFileSync(file, bytes);
    console.log(`${(bytes.length / 1024).toFixed(0).padStart(6)} KB  ${path}`);
  });
  await page.goto(`${origin}/page/index.html`);
  // Face parts: seeded from faces.js the first time (or with --seed-faces); after that the PNGs
  // in tools/cubeclysm/faces/ are the source, so repainted parts are kept.
  // Parts new in faces.js are seeded every build; existing PNGs are kept (unless --seed-faces),
  // and parts an artist added to faces.json by hand stay listed.
  {
    const reseed = process.argv.includes('--seed-faces');
    const { files, manifest } = await page.evaluate(() => window.seedFaces());
    let added = 0;
    for (const f of files) {
      const file = join(FACES, f.path);
      if (existsSync(file) && !reseed) continue;
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, Buffer.from(f.data, 'base64'));
      added++;
    }
    const manifestFile = join(FACES, 'faces.json');
    const old = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : { parts: {} };
    for (const [cat, list] of Object.entries(old.parts ?? {})) manifest.parts[cat] = { ...list, ...manifest.parts[cat] };
    writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
    if (added) console.log(`face parts: ${added} new → ${FACES}`);
  }
  const built = await page.evaluate((o) => window.buildAll(o), only);
  // Bound recipes (zombies/) and unbound archetypes (archetypes/); a partial build (--only) keeps the rest.
  const indexFile = join(OUT, 'index.json');
  const prev = only && existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, 'utf8')) : { models: [], archetypes: [] };
  const merge = (old, now) => [...old.filter((m) => !now.some((n) => n.id === m.id)), ...now];
  writeFileSync(indexFile, `${JSON.stringify({ style: 'cubeclysm', models: merge(prev.models, built.filter((m) => m.group === 'zombies')), archetypes: merge(prev.archetypes ?? [], built.filter((m) => m.group === 'archetypes')), hair: merge(prev.hair ?? [], built.filter((m) => m.group === 'hair')), humans: merge(prev.humans ?? [], built.filter((m) => m.group === 'humans')), terrain: merge(prev.terrain ?? [], built.filter((m) => m.group === 'terrain')), furniture: merge(prev.furniture ?? [], built.filter((m) => m.group === 'furniture')), vehicles: merge(prev.vehicles ?? [], built.filter((m) => m.group === 'vehicles')), items: merge(prev.items ?? [], built.filter((m) => m.group === 'items')) }, null, 2)}\n`);
  for (const m of built) console.log(`${m.id.padEnd(22)} ${m.size.join(' × ')} m  ${m.triangles} triangles  [${m.gear.join(', ')}]`);
  console.log('next: node tools/deadwood/select.mjs (binds them in the Cubeclysm set)');
} finally {
  await browser.close();
  server.close();
}
