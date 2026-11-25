// Render built Cubeclysm models in cdda-voxel-studio, turned to show the face, as one contact sheet.
//
//   node preview.mjs --out sheet.png mon_zombie_spitter mon_zombie_corrosive
//   node preview.mjs --heads --out heads.png mon_zombie_spitter      (zoomed on the heads)
//
// Models face −Z (north) by the library standard and the studio's front camera looks at +Z, so
// they are shown through a temporary mesh set that turns them 150° (a three-quarter front view).
// The set is linked into the studio's vendor/mesh as zz-preview and removed afterwards; the studio
// dev server is started on port 5182 if it is not already running (and stopped again if started
// here). Reads models from models/cubeclysm/monsters/ (after npm run bind) or, with
// --group <dir>, from sources/cubeclysm/<dir>/ (zombies, archetypes, humans, hair).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync, lstatSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = process.env.LIB ?? resolve(HERE, '../../../..');
const STUDIO = process.env.STUDIO ?? resolve(LIB, '../cdda-voxel-studio');
const PORT = 5182;

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const heads = args.includes('--heads') && args.splice(args.indexOf('--heads'), 1);
const out = resolve(flag('--out') ?? 'preview.png');
const group = flag('--group');
const ids = args;
if (!ids.length) { console.error('usage: node preview.mjs [--heads] [--group zombies] --out sheet.png <id>...'); process.exit(1); }

const { chromium } = await import(join(STUDIO, 'node_modules/playwright/index.mjs'));
const src = group ? join(LIB, 'sources/cubeclysm', group) : join(LIB, 'models/cubeclysm/monsters');
const set = join(LIB, '.preview');
const link = join(STUDIO, 'vendor/mesh/zz-preview');

rmSync(set, { recursive: true, force: true });
mkdirSync(set, { recursive: true });
symlinkSync(src, join(set, 'm'));
writeFileSync(join(set, 'meshset.json'), JSON.stringify({ name: 'preview', models: ids.map((id) => ({ file: `m/${id}.glb`, rotY: 150 })) }));
try { lstatSync(link); unlinkSync(link); } catch { /* none */ }
symlinkSync(set, link);

const up = async () => { try { return (await fetch(`http://127.0.0.1:${PORT}/`)).ok; } catch { return false; } };
let server = null;
if (!(await up())) {
  server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: STUDIO, stdio: 'ignore', detached: true });
  for (let i = 0; i < 60 && !(await up()); i++) await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: 2 });
  const shots = [];
  for (const id of ids) {
    if (!existsSync(join(src, `${id}.glb`))) { console.error(`missing ${join(src, id)}.glb`); continue; }
    await page.goto(`http://127.0.0.1:${PORT}/?kind=vox&id=${encodeURIComponent(`mesh:zz-preview:m/${id}.glb`)}&lang=zh_CN`);
    await page.waitForFunction('Boolean(window.__editor?.ready && window.__editor.measure)', null, { timeout: 60000 });
    await page.evaluate(() => { document.querySelector('[data-view="front"]').click(); for (const k of ['wall', 'person', 'bbox', 'grid']) { const b = document.querySelector(`[data-toggle="${k}"]`); if (b?.classList.contains('on')) b.click(); } });
    await page.waitForTimeout(600);
    const box = await page.locator('#ed-canvas').boundingBox();
    let clip = { x: 560, y: 120, width: 420, height: 560 };
    if (heads) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.32);
      for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -300); await page.waitForTimeout(60); }
      await page.waitForTimeout(500);
      clip = { x: box.x + box.width * 0.3, y: box.y + 60, width: box.width * 0.4, height: box.height * 0.55 };
    }
    const m = await page.evaluate('window.__editor.measure');
    shots.push([id, (await page.screenshot({ clip })).toString('base64'), m?.height?.toFixed?.(2)]);
  }
  const cols = Math.min(shots.length, 4);
  const html = `<body style="margin:0;background:#9da3a6;display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;font:13px sans-serif">${shots.map(([id, b, h]) => `<div><img style="width:100%" src="data:image/png;base64,${b}"><div style="text-align:center;padding:2px">${id}${h ? ` · ${h} m` : ''}</div></div>`).join('')}</body>`;
  const p2 = await browser.newPage({ viewport: { width: 1200, height: 400 } });
  await p2.setContent(html);
  await p2.screenshot({ path: out, fullPage: true });
  console.log(`wrote ${out} (${shots.length} models)`);
} finally {
  await browser.close();
  try { unlinkSync(link); } catch { /* gone */ }
  rmSync(set, { recursive: true, force: true });
  if (server) process.kill(-server.pid);
}
