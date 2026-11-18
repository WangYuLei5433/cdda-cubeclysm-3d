// Binds monsters built from recipes (tools/cubeclysm/page/recipes.js → sources/cubeclysm/zombies/,
// after build.mjs) into the Cubeclysm set: copies each named .glb and its atlas to
// models/cubeclysm/monsters/ and adds or replaces only those ids' entries in meshset.json (every
// other entry is left as it is). Unlike tools/deadwood/select.mjs it never touches other models.
//
//   node tools/cubeclysm/bind-monsters.mjs mon_zombie_rot mon_zombie_brainless …
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ids = process.argv.slice(2);
if (!ids.length) throw new Error('usage: node tools/cubeclysm/bind-monsters.mjs <id>…');
const setPath = join(ROOT, 'meshset.json');
const set = JSON.parse(readFileSync(setPath, 'utf8'));
const built = new Map((JSON.parse(readFileSync(join(ROOT, 'sources/cubeclysm/index.json'), 'utf8')).models ?? []).map((m) => [m.id, m]));
const isMonster = (e) => String(e.file ?? '').startsWith('models/cubeclysm/monsters/');
for (const id of ids) {
  const src = join(ROOT, 'sources/cubeclysm/zombies', `${id}.glb`);
  if (!existsSync(src)) throw new Error(`not built: ${src}`);
  const file = `models/cubeclysm/monsters/${id}.glb`;
  copyFileSync(src, join(ROOT, file));
  if (existsSync(src.replace(/\.glb$/, '.png'))) copyFileSync(src.replace(/\.glb$/, '.png'), join(ROOT, file.replace(/\.glb$/, '.png')));
  const entry = { id, file, author: 'cdda-cubeclysm-3d contributors', license: 'CC-BY-SA-3.0', source: built.get(id)?.source ?? 'tools/cubeclysm/page/recipes.js', style: 'cubeclysm' };
  const at = set.models.findIndex((e) => e.file === file);
  if (at >= 0) set.models[at] = entry;
  else set.models.splice(set.models.findLastIndex(isMonster) + 1, 0, entry);
}
const { models, ...head } = set;
const lines = Object.entries(head).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
lines.push(`  "models": [\n${models.map((m) => `    ${JSON.stringify(m)}`).join(',\n')}\n  ]`);
writeFileSync(setPath, `{\n${lines.join(',\n')}\n}\n`);
console.log(`${ids.length} monsters bound → meshset.json (${models.length} entries in all)`);
