import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const root = resolve(import.meta.dirname, '../..');
const sources = join(root, 'sources/cubeclysm');
const modelDir = 'models/cubeclysm';
const own = { author: 'cdda-cubeclysm-3d contributors', license: 'CC-BY-SA-3.0' };
const propGroups = ['terrain', 'furniture', 'vehicles', 'items', 'fields', 'traps'];
const propKeys = ['surface', 'surfaceFaces', 'opening', 'faceWall', 'faceOut', 'interior'];
const { values } = parseArgs({ options: { only: { type: 'string' }, characters: { type: 'boolean' } } });
const only = values.only === undefined ? null : new Set(values.only.split(',').map((id) => id.trim()));
if (only?.has('')) throw new Error('--only expects a comma-separated list of recipe IDs');
const missing = new Set(only);
const indexPath = join(sources, 'index.json');
const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, 'utf8')) : {};
const setPath = join(root, 'meshset.json');
const before = readFileSync(setPath, 'utf8');
const set = JSON.parse(before);
const updates = new Map();
const copies = new Map();

function selected(...ids) {
  if (!only) return true;
  const matched = ids.flat().filter((id) => only.has(id));
  for (const id of matched) missing.delete(id);
  return matched.length > 0;
}

function queue(path, relative, atlas = true) {
  const source = join(sources, path);
  if (!existsSync(source)) throw new Error(`Missing built model: ${source}`);
  const file = `${modelDir}/${relative}`;
  copies.set(file, source);
  const png = source.replace(/\.glb$/, '.png');
  if (atlas && existsSync(png)) copies.set(file.replace(/\.glb$/, '.png'), png);
  return file;
}

if (!values.characters) {
  const props = propGroups.flatMap((group) => index[group] ?? []);
  for (const prop of props) {
    if (prop.field || !selected(prop.id)) continue;
    const file = queue(prop.path, `${prop.group}/${prop.id}.glb`);
    const target = prop.groupOf ? { groupOf: prop.groupOf, footprint: prop.footprint } : { id: prop.ids ?? prop.id };
    const metadata = Object.fromEntries(propKeys.filter((key) => prop[key]).map((key) => [key, prop[key]]));
    updates.set(file, {
      ...target, file, preserveOrigin: true, ...metadata, ...own,
      source: prop.source ?? 'tools/cubeclysm/page/terrain.js', style: 'cubeclysm',
    });
  }
  const fields = props.filter((model) => model.field);
  for (const id of new Set(fields.map((model) => model.field.of))) {
    const stages = fields.filter((model) => model.field.of === id).sort((a, b) => a.field.stage - b.field.stage);
    if (!selected(id, stages.map((stage) => stage.id))) continue;
    const { field, source } = stages[0];
    if (stages.length !== field.stages || stages.some((stage, i) => stage.field.stage !== i + 1)) {
      throw new Error(`${id}: build all ${field.stages} stages together`);
    }
    const files = stages.map((stage) => queue(stage.path, `fields/${stage.id}.glb`));
    updates.set(files[0], {
      id, file: files[0], ...(files.length > 1 && { files }), preserveOrigin: true,
      field: { layer: field.layer, intensity: field.map }, ...own, source, style: 'cubeclysm',
    });
  }
}

const propCount = updates.size;
if (values.characters || only) {
  const mapping = JSON.parse(readFileSync(join(import.meta.dirname, 'mapping.json'), 'utf8'));
  const mapped = [...mapping.characters, ...mapping.monsters];
  const listed = new Set(mapped.flatMap(({ id }) => id));
  const monsters = index.models ?? [];
  const humans = index.humans ?? [];
  const built = new Map([...monsters, ...humans].map((model) => [model.path, model]));
  for (const model of monsters) {
    if (!listed.has(model.id)) mapped.push({ id: model.id, built: model.path, file: `monsters/${model.id}.glb` });
  }
  for (const { id, built: path, file: destination } of mapped) {
    if (!existsSync(join(sources, path)) || !selected(id, basename(path, '.glb'))) continue;
    const file = queue(path, destination);
    const fallback = path.startsWith('humans/') ? 'humans' : 'recipes';
    const source = built.get(path)?.source ?? `tools/cubeclysm/page/${fallback}.js`;
    updates.set(file, { id, file, ...own, style: 'cubeclysm', source });
  }

  const candidates = { characters: ['humans', humans.filter((model) => !model.bound)],
    zombies: ['archetypes', index.archetypes ?? []], hair: ['hair', index.hair ?? []] };
  for (const [group, [recipe, models]] of Object.entries(candidates)) {
    const dir = `candidates/${group}`;
    const metadata = { ...own, style: 'cubeclysm', source: `tools/cubeclysm/page/${recipe}.js` };
    for (const model of models.filter(({ id }) => selected(id))) {
      const file = queue(model.path, `${dir}/${model.id}.glb`, false);
      updates.set(file, { file, ...(model.names && { names: model.names }), ...metadata });
    }
  }
}

if (missing.size) throw new Error(`No built models for ${[...missing].join(', ')}. Run tools/cubeclysm/build.mjs first.`);
if (!only && !values.characters && !propCount) throw new Error('No built props. Run tools/cubeclysm/build.mjs first.');
for (const [file, source] of copies) {
  const target = join(root, file);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}
if ([...copies.keys()].some((file) => file.startsWith(`${modelDir}/vehicles/`))) {
  const { VEHICLE_VARIANTS } = await import('./page/vehicle-variants.js');
  set.vehicleParts = `${modelDir}/vehicles/variants.json`;
  writeFileSync(join(root, set.vehicleParts), `${JSON.stringify(VEHICLE_VARIANTS, null, 2)}\n`);
}

const existing = new Set(set.models.map(({ file }) => file));
const added = [...updates.values()].filter(({ file }) => !existing.has(file));
const models = set.models.map((entry) => updates.get(entry.file) ?? entry).filter(({ file }) =>
  only || !propCount || !propGroups.some((group) => file?.startsWith(`${modelDir}/${group}/`)) || existsSync(join(root, file)));
const bound = ({ id, groupOf }) => id !== undefined || groupOf;
models.splice(models.findLastIndex(bound) + 1, 0, ...added.filter(bound));
models.push(...added.filter((model) => !bound(model)));

const { models: _, ...head } = set;
const lines = Object.entries(head).map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)}`);
lines.push(`  "models": [\n${models.map((model) => `    ${JSON.stringify(model)}`).join(',\n')}\n  ]`);
const json = `{\n${lines.join(',\n')}\n}\n`;
if (before !== json) writeFileSync(setPath, json);
console.log(`${updates.size} updated → meshset.json (${models.length} entries)`);
