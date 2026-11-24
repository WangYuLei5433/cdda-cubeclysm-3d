// Binds the characters and monsters built from recipes (tools/cubeclysm/build.mjs →
// sources/cubeclysm/) into the Cubeclysm set: copies each .glb and its texture atlas into
// models/cubeclysm/ and merges their entries into meshset.json. Also refreshes the unbound
// candidates (archetype zombies, hair samples, survivors) in models/cubeclysm/candidates/.
//
//   node tools/cubeclysm/select.mjs
//
// Merge, never replace: sources/cubeclysm/ is git-ignored, so a checkout may hold only part of the
// built models. Rebuilt models replace their entry (same file), new ones are added, every other
// entry (terrain, furniture, items, fields, and monsters not built here) stays as it is.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BUILT = join(ROOT, 'sources/cubeclysm');
const mapping = JSON.parse(readFileSync(join(ROOT, 'tools/cubeclysm/mapping.json'), 'utf8'));
const index = existsSync(join(BUILT, 'index.json')) ? JSON.parse(readFileSync(join(BUILT, 'index.json'), 'utf8')) : {};
const OWN = { author: 'cdda-cubeclysm-3d contributors', license: 'CC-BY-SA-3.0', style: 'cubeclysm' };

// Every zombie built from a recipe is for its own id: bind those mapping.json does not list yet
// (a recipe is the decision to model that object).
const listed = new Set([...mapping.characters, ...mapping.monsters].flatMap((m) => [m.id].flat()));
for (const b of index.models ?? []) {
  if (listed.has(b.id)) continue;
  mapping.monsters.push({ id: b.id, built: b.path, file: `monsters/${b.id}.glb`, why: b.desc });
  console.log(`+ ${b.id} (recipe)`);
}

const copy = (from, file) => {
  mkdirSync(dirname(join(ROOT, file)), { recursive: true });
  copyFileSync(from, join(ROOT, file));
  if (existsSync(from.replace(/\.glb$/, '.png'))) copyFileSync(from.replace(/\.glb$/, '.png'), join(ROOT, file.replace(/\.glb$/, '.png')));
};

const entries = [];
for (const group of ['characters', 'monsters']) {
  for (const m of mapping[group]) {
    // `built`: a path in sources/cubeclysm/ (the models built from recipes by build.mjs).
    const from = join(BUILT, m.built);
    if (!existsSync(from)) continue; // not built in this checkout: its entry stays as it is
    const file = `models/cubeclysm/${m.file}`;
    copy(from, file);
    const source = [...(index.models ?? []), ...(index.humans ?? [])].find((b) => b.path === m.built)?.source;
    entries.push({ id: m.id, file, ...OWN, source: source ?? `tools/cubeclysm/page/${m.built.startsWith('humans/') ? 'humans' : 'recipes'}.js` });
  }
}

// Unbound candidates: archetype zombies, one plain zombie per hair style, and the survivors.
const CAND = join(ROOT, 'models/cubeclysm/candidates');
const SOURCE = { zombies: 'archetypes', hair: 'hair', characters: 'humans' };
const groups = { zombies: index.archetypes ?? [], hair: index.hair ?? [], characters: (index.humans ?? []).filter((h) => !h.bound) };
const names = new Map();
for (const [dir, list] of Object.entries(groups)) {
  if (!list.length) continue;
  rmSync(join(CAND, dir), { recursive: true, force: true });
  mkdirSync(join(CAND, dir), { recursive: true });
  for (const a of list) { copyFileSync(join(BUILT, a.path), join(CAND, dir, `${a.id}.glb`)); names.set(`${dir}/${a.id}.glb`, a.names); }
}
const candidates = ['characters', 'zombies', 'hair'].flatMap((dir) => (existsSync(join(CAND, dir))
  ? readdirSync(join(CAND, dir)).filter((f) => f.endsWith('.glb')).sort().map((f) => ({ file: `models/cubeclysm/candidates/${dir}/${f}`, ...(names.get(`${dir}/${f}`) ? { names: names.get(`${dir}/${f}`) } : {}), ...OWN, source: `tools/cubeclysm/page/${SOURCE[dir]}.js` }))
  : []));

const setPath = join(ROOT, 'meshset.json');
const set = JSON.parse(readFileSync(setPath, 'utf8'));
const isCandidate = (e) => String(e.file ?? '').startsWith('models/cubeclysm/candidates/');
const rebuilt = new Map(entries.map((e) => [e.file, e]));
const bound = set.models.filter((e) => !isCandidate(e)).map((e) => rebuilt.get(e.file) ?? e);
const added = entries.filter((e) => !set.models.some((o) => o.file === e.file));
// New monsters go after the last monster; candidates (unbound) come last.
const at = bound.findLastIndex((e) => String(e.file ?? '').startsWith('models/cubeclysm/monsters/')) + 1;
const oldCandidates = set.models.filter(isCandidate);
set.models = [...bound.slice(0, at), ...added, ...bound.slice(at), ...(candidates.length ? candidates : oldCandidates)];
// One entry per line, as the studio writes sets (formatModelSet).
const { models, ...head } = set;
const lines = Object.entries(head).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
lines.push(`  "models": [\n${models.map((m) => `    ${JSON.stringify(m)}`).join(',\n')}\n  ]`);
writeFileSync(setPath, `{\n${lines.join(',\n')}\n}\n`);
console.log(`${entries.length} characters and monsters bound (${added.length} new), ${candidates.length || oldCandidates.length} unbound candidates → meshset.json`);
