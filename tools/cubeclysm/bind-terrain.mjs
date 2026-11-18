// Binds the terrain built from the recipes in tools/cubeclysm/page/terrain.js (sources/cubeclysm/terrain/, after
// build.mjs) into the Cubeclysm set: copies each .glb and its atlas to models/cubeclysm/<group>/ and
// replaces only the set's terrain and furniture entries (every other entry is left exactly as it is).
//
//   node tools/cubeclysm/bind-terrain.mjs
//
// Terrain is modelled around its tile (origin = tile centre on the floor), so entries keep it
// (preserveOrigin). `surface` marks ground, roof and wall tiles whose texture an engine may use on
// its own geometry; `opening` is a window's [width, sill, head] in metres, for engines that cut it
// into a neighbouring wall.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const index = JSON.parse(readFileSync(join(ROOT, 'sources/cubeclysm/index.json'), 'utf8'));
const built = [...(index.terrain ?? []), ...(index.furniture ?? []), ...(index.vehicles ?? []), ...(index.items ?? [])];
if (!built.length) throw new Error('no terrain in sources/cubeclysm/index.json (run tools/cubeclysm/build.mjs)');

const entries = built.map((t) => {
  const file = `models/cubeclysm/${t.group}/${t.id}.glb`;
  mkdirSync(dirname(join(ROOT, file)), { recursive: true });
  copyFileSync(join(ROOT, 'sources/cubeclysm', t.path), join(ROOT, file));
  const atlas = join(ROOT, 'sources/cubeclysm', t.path.replace(/\.glb$/, '.png'));
  if (existsSync(atlas)) copyFileSync(atlas, join(ROOT, file.replace(/\.glb$/, '.png')));
  return { id: t.ids ?? t.id, file, preserveOrigin: true, ...(t.surface ? { surface: t.surface } : {}), ...(t.opening ? { opening: t.opening } : {}), ...(t.interior ? { interior: t.interior } : {}), author: 'cdda-cubeclysm-3d contributors', license: 'CC-BY-SA-3.0', source: t.source ?? 'tools/cubeclysm/page/terrain.js', style: 'cubeclysm' };
});

// Vehicle parts are modular: how CDDA's variants place them (vehicle-variants.js) goes beside them.
const { VEHICLE_VARIANTS } = await import('./page/vehicle-variants.js');
if (index.vehicles?.length) writeFileSync(join(ROOT, 'models/cubeclysm/vehicles/variants.json'), `${JSON.stringify(VEHICLE_VARIANTS, null, 2)}\n`);

const setPath = join(ROOT, 'meshset.json');
const set = JSON.parse(readFileSync(setPath, 'utf8'));
// Studios and engines assemble whole vehicles from the part models with these rules.
if (index.vehicles?.length) set.vehicleParts = 'models/cubeclysm/vehicles/variants.json';
const isTerrain = (e) => /^models\/cubeclysm\/(terrain|furniture|vehicles|items)\//.test(String(e.file ?? ''));
// Bound models first, then the unbound candidates (as select.mjs orders them): terrain goes after the last bound entry.
const kept = set.models.filter((e) => !isTerrain(e));
const at = kept.findLastIndex((e) => e.id !== undefined) + 1;
set.models = [...kept.slice(0, at), ...entries, ...kept.slice(at)];
// One entry per line, as the studio writes sets.
const { models, ...head } = set;
const lines = Object.entries(head).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
lines.push(`  "models": [\n${models.map((m) => `    ${JSON.stringify(m)}`).join(',\n')}\n  ]`);
writeFileSync(setPath, `{\n${lines.join(',\n')}\n}\n`);
console.log(`${entries.length} terrain, furniture, vehicle and item models bound → meshset.json (${models.length} entries in all)`);
