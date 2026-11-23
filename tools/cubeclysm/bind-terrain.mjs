// Binds the terrain built from the recipes in tools/cubeclysm/page/terrain.js (sources/cubeclysm/terrain/, after
// build.mjs) into the Cubeclysm set: copies each .glb and its atlas to models/cubeclysm/<group>/ and
// merges their entries into the set's terrain, furniture, vehicle and item entries (rebuilt ones
// replaced, new ones added, the rest and every other entry left exactly as they are).
//
//   node tools/cubeclysm/bind-terrain.mjs [--only f_locker,mp3]
//
// Terrain is modelled around its tile (origin = tile centre on the floor), so entries keep it
// (preserveOrigin). `surface` marks ground, roof and wall tiles whose texture an engine may use on
// its own geometry, and `surfaceFaces` says where in the model's atlas ({ side?, top } as
// [x, y, w, h] fractions, y down); `opening` is a window's [width, sill, head] in metres, for
// engines that cut it into a neighbouring wall.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const index = JSON.parse(readFileSync(join(ROOT, 'sources/cubeclysm/index.json'), 'utf8'));
const onlyAt = process.argv.indexOf('--only');
const only = onlyAt >= 0 ? new Set(process.argv[onlyAt + 1]?.split(',')) : null;
const built = [...(index.terrain ?? []), ...(index.furniture ?? []), ...(index.vehicles ?? []), ...(index.items ?? [])]
  .filter((model) => !only || only.has(model.id));
const hasVehicles = built.some((model) => model.group === 'vehicles');
if (!built.length || (only && built.length !== only.size)) {
  throw new Error('missing models in sources/cubeclysm/index.json (run tools/cubeclysm/build.mjs)');
}

const entries = built.map((t) => {
  const file = `models/cubeclysm/${t.group}/${t.id}.glb`;
  mkdirSync(dirname(join(ROOT, file)), { recursive: true });
  copyFileSync(join(ROOT, 'sources/cubeclysm', t.path), join(ROOT, file));
  const atlas = join(ROOT, 'sources/cubeclysm', t.path.replace(/\.glb$/, '.png'));
  if (existsSync(atlas)) copyFileSync(atlas, join(ROOT, file.replace(/\.glb$/, '.png')));
  // A group model (groupOf + footprint) is no CDDA id's own model: it binds no id, an engine
  // draws it over a group of `groupOf` tiles of that footprint.
  return { ...(t.groupOf ? { groupOf: t.groupOf, footprint: t.footprint } : { id: t.ids ?? t.id }), file, preserveOrigin: true, ...(t.surface ? { surface: t.surface } : {}), ...(t.surfaceFaces ? { surfaceFaces: t.surfaceFaces } : {}), ...(t.opening ? { opening: t.opening } : {}), ...(t.faceWall ? { faceWall: true } : {}), ...(t.faceOut ? { faceOut: true } : {}), ...(t.interior ? { interior: t.interior } : {}), author: 'cdda-cubeclysm-3d contributors', license: 'CC-BY-SA-3.0', source: t.source ?? 'tools/cubeclysm/page/terrain.js', style: 'cubeclysm' };
});

// Vehicle parts are modular: how CDDA's variants place them (vehicle-variants.js) goes beside them.
const { VEHICLE_VARIANTS } = await import('./page/vehicle-variants.js');
if (hasVehicles) writeFileSync(join(ROOT, 'models/cubeclysm/vehicles/variants.json'), `${JSON.stringify(VEHICLE_VARIANTS, null, 2)}\n`);

const setPath = join(ROOT, 'meshset.json');
const set = JSON.parse(readFileSync(setPath, 'utf8'));
// Studios and engines assemble whole vehicles from the part models with these rules.
if (hasVehicles) set.vehicleParts = 'models/cubeclysm/vehicles/variants.json';
const isTerrain = (e) => /^models\/cubeclysm\/(terrain|furniture|vehicles|items)\//.test(String(e.file ?? ''));
// Merge, never replace: sources/cubeclysm/ is git-ignored, so a checkout may hold only what was
// built on it (`build.mjs --only …`). Rebuilt models replace their entry (same file), new ones are
// appended, the others stay; an entry whose model file is gone is dropped.
const rebuilt = new Map(entries.map((e) => [e.file, e]));
const before = set.models.filter(isTerrain);
const merged = [
  ...before.map((e) => rebuilt.get(e.file) ?? e).filter((e) => existsSync(join(ROOT, e.file))),
  ...entries.filter((e) => !before.some((o) => o.file === e.file)),
];
// Bound models first, then the unbound candidates (as select.mjs orders them): terrain goes after the last bound entry.
const kept = set.models.filter((e) => !isTerrain(e));
const at = kept.findLastIndex((e) => e.id !== undefined) + 1;
set.models = [...kept.slice(0, at), ...merged, ...kept.slice(at)];
// One entry per line, as the studio writes sets.
const { models, ...head } = set;
const lines = Object.entries(head).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
lines.push(`  "models": [\n${models.map((m) => `    ${JSON.stringify(m)}`).join(',\n')}\n  ]`);
writeFileSync(setPath, `{\n${lines.join(',\n')}\n}\n`);
console.log(`${entries.length} terrain, furniture, vehicle and item models bound, ${merged.length - entries.length} kept → meshset.json (${models.length} entries in all)`);
