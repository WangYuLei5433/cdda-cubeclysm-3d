// Copies the strictly bound models (tools/deadwood/mapping.json) from the exported pool into
// models/cubeclysm/ (the main style: characters and zombies, with their texture atlases) and
// models/deadwood/ (weapons and items), and writes their entries into meshset.json (other entries
// are kept).
//
//   node tools/deadwood/select.mjs [--pool sources/deadwood/export]
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const i = process.argv.indexOf('--pool');
const pool = resolve(ROOT, i > 0 ? process.argv[i + 1] : 'sources/deadwood/export');
const mapping = JSON.parse(readFileSync(join(ROOT, 'tools/deadwood/mapping.json'), 'utf8'));
const index = JSON.parse(readFileSync(join(pool, 'index.json'), 'utf8'));

const CREDIT = { author: 'Cédric Bernadac', license: 'CC-BY-4.0', source: `https://github.com/cedricbernadac/deadwood-open/tree/${index.commit}` };
const PLACEMENT = ['height', 'fit', 'scale', 'rotY', 'offset'];

// Every zombie built from a recipe (tools/cubeclysm) is for its own id: bind those mapping.json
// does not list yet (a recipe is the decision to model that object).
const builtIndex = join(ROOT, 'sources/cubeclysm/index.json');
if (existsSync(builtIndex)) {
  const listed = new Set(Object.values(mapping).filter(Array.isArray).flat().flatMap((m) => [m.id].flat()));
  for (const b of JSON.parse(readFileSync(builtIndex, 'utf8')).models) {
    if (listed.has(b.id)) continue;
    mapping.monsters.push({ id: b.id, pool: `cubeclysm-new:${b.path}`, file: `monsters/${b.id}.glb`, style: 'cubeclysm', why: b.desc });
    console.log(`+ ${b.id} (recipe)`);
  }
}

const entries = [];
for (const group of ['characters', 'monsters', 'items']) {
  for (const m of mapping[group]) {
    // `pool` is a path in the pool, or "<set>:<file>" as the studio's Try on copies it
    // (set "cubeclysm" = the pool's cubeclysm/ folder, "deadwood-pool" = the pool itself).
    // ("cubeclysm-new" = sources/cubeclysm/, the models built from recipes by tools/cubeclysm/build.mjs.)
    const [, set, rel] = /^([\w-]+):(.+)$/.exec(m.pool) ?? [null, null, m.pool];
    const built = set === 'cubeclysm-new';
    const path = set === 'cubeclysm' ? `cubeclysm/${rel}` : rel;
    const style = m.style ?? (built || path.startsWith('cubeclysm/') ? 'cubeclysm' : undefined);
    const from = built ? join(ROOT, 'sources/cubeclysm', rel) : join(pool, path);
    if (!existsSync(from)) throw new Error(`${m.pool} is not in the pool (run tools/deadwood/export.mjs)`);
    const file = `models/${style ?? 'deadwood'}/${m.file}`;
    mkdirSync(dirname(join(ROOT, file)), { recursive: true });
    copyFileSync(from, join(ROOT, file));
    // A Cubeclysm model's texture atlas (to repaint) goes beside it.
    const atlas = from.replace(/\.glb$/, '.png');
    if (existsSync(atlas)) copyFileSync(atlas, join(ROOT, file.replace(/\.glb$/, '.png')));
    const entry = { id: m.id, file };
    for (const k of PLACEMENT) if (m[k] !== undefined) entry[k] = m[k];
    entries.push(built
      ? { ...entry, author: 'cdda-cubeclysm-3d contributors', license: 'CC-BY-SA-3.0', source: 'tools/cubeclysm/page/recipes.js', style: 'cubeclysm' }
      : { ...entry, ...CREDIT, ...(style === 'cubeclysm' ? { style: 'cubeclysm', note: 'Cubeclysm restyle of a DEADWOOD — Last Light model' } : {}) });
  }
}

// Unbound Cubeclysm candidates (the DEADWOOD characters and zombies restyled): copied from the
// pool into models/cubeclysm/candidates/ when it is there, listed in the same set (no id: they bind
// nothing, they are there to browse and to try on).
const CAND = join(ROOT, 'models/cubeclysm/candidates');
const poolCubeclysm = join(pool, 'cubeclysm');
// Zombie candidates are the archetypes built from recipes (tools/cubeclysm/page/archetypes.js),
// each dressed as what its name says; the DEADWOOD-restyled zombies no longer are.
const archetypes = existsSync(builtIndex) ? JSON.parse(readFileSync(builtIndex, 'utf8')).archetypes ?? [] : [];
if (archetypes.length) {
  rmSync(join(CAND, 'zombies'), { recursive: true, force: true });
  mkdirSync(join(CAND, 'zombies'), { recursive: true });
  for (const a of archetypes) copyFileSync(join(ROOT, 'sources/cubeclysm', a.path), join(CAND, 'zombies', `${a.id}.glb`));
}
// Hair style samples (one plain zombie per style), to browse the styles.
const hairSamples = existsSync(builtIndex) ? JSON.parse(readFileSync(builtIndex, 'utf8')).hair ?? [] : [];
if (hairSamples.length) {
  rmSync(join(CAND, 'hair'), { recursive: true, force: true });
  mkdirSync(join(CAND, 'hair'), { recursive: true });
  for (const a of hairSamples) copyFileSync(join(ROOT, 'sources/cubeclysm', a.path), join(CAND, 'hair', `${a.id}.glb`));
}
// Humans (tools/cubeclysm/page/humans.js): the bound player / NPC models, and the survivors as
// the character candidates (the DEADWOOD-restyled survivors no longer are).
const humans = existsSync(builtIndex) ? JSON.parse(readFileSync(builtIndex, 'utf8')).humans ?? [] : [];
const survivors = humans.filter((h) => !h.bound);
if (survivors.length) {
  rmSync(join(CAND, 'characters'), { recursive: true, force: true });
  mkdirSync(join(CAND, 'characters'), { recursive: true });
  for (const a of survivors) copyFileSync(join(ROOT, 'sources/cubeclysm', a.path), join(CAND, 'characters', `${a.id}.glb`));
}
const archetypeNames = new Map([...archetypes, ...hairSamples, ...survivors].map((a) => [`${a.id}.glb`, a.names]));
if (existsSync(poolCubeclysm) && !survivors.length) {
  for (const dir of ['characters']) {
    if (!existsSync(join(poolCubeclysm, dir))) continue;
    mkdirSync(join(CAND, dir), { recursive: true });
    for (const f of readdirSync(join(poolCubeclysm, dir))) if (f.endsWith(".glb")) copyFileSync(join(poolCubeclysm, dir, f), join(CAND, dir, f));
  }
}
// Display names for the unbound candidates (they have no CDDA id to take a name from).
const KIND = { walker: ['行尸', 'walker', 'бродяга'], runner: ['奔跑者', 'runner', 'бегун'], brute: ['壮汉', 'brute', 'громила'], crawler: ['爬行者', 'crawler', 'ползун'] };
const FAMILY = { rodeurs: ['游荡者', 'wanderer', 'бродяга'], enrages: ['狂暴者', 'enraged', 'бешеный'], revenants: ['亡魂', 'revenant', 'призрак'] };
const WHO = {
  elder: ['老者', 'elder', 'старик'], widow: ['寡妇', 'widow', 'вдова'], teen: ['少年', 'teen', 'подросток'], bride: ['新娘', 'bride', 'невеста'], undertaker: ['殡葬工', 'undertaker', 'гробовщик'],
  crone: ['老妪', 'crone', 'старуха'], drowned: ['溺亡者', 'drowned', 'утопленник'], farmhand: ['农场工', 'farmhand', 'батрак'], farmer: ['农夫', 'farmer', 'фермер'], hermit: ['隐士', 'hermit', 'отшельник'],
  sewn: ['缝合者', 'sewn', 'сшитый'], cracked: ['裂颅者', 'cracked', 'треснувший'], crooked: ['佝偻者', 'crooked', 'кривой'], fury: ['狂怒者', 'fury', 'ярость'], fever: ['热病者', 'fever', 'горячка'],
  grinder: ['磨牙者', 'grinder', 'скрежет'], brawler: ['斗殴者', 'brawler', 'драчун'], heavy: ['重型', 'heavy', 'тяжёлый'], lanky: ['瘦高者', 'lanky', 'долговязый'], torn: ['撕裂者', 'torn', 'рваный'],
  screamer: ['尖叫者', 'screamer', 'крикун'], soldier: ['士兵', 'soldier', 'солдат'], miner: ['矿工', 'miner', 'шахтёр'], surgeon: ['外科医生', 'surgeon', 'хирург'],
  oldman: ['老头', 'old man', 'старик'], oldwoman: ['老太', 'old woman', 'старуха'],
};
const SURVIVOR = { father: ['父亲', 'father', 'отец'], daughter: ['女儿', 'daughter', 'дочь'], max: ['马克斯', 'Max', 'Макс'], lea: ['莉娅', 'Lea', 'Леа'], sam: ['山姆', 'Sam', 'Сэм'], man: ['男人', 'man', 'мужчина'], woman: ['女人', 'woman', 'женщина'], elder: ['老人', 'elder', 'старик'], raider: ['掠夺者', 'raider', 'рейдер'] };
function candidateNames(dir, f) {
  const base = f.replace(/\.glb$/, '');
  const pick = (i) => {
    if (dir === 'characters') { const w = SURVIVOR[base.replace(/^survivor_/, '')]; return w ? `${['幸存者', 'survivor', 'выживший'][i]} · ${w[i]}` : null; }
    const [kind, family, ...rest] = base.split('_'), who = WHO[rest.join('')] ?? WHO[rest.at(-1)];
    if (!KIND[kind] || !FAMILY[family]) return null;
    return i === 0 ? `${KIND[kind][0]} · ${FAMILY[family][0]}${who ? `（${who[0].replace(/者$/, '')}）` : ''}` : `${KIND[kind][i]} · ${FAMILY[family][i]}${who ? ` (${who[i]})` : ''}`;
  };
  const zh = pick(0);
  return zh ? { names: { zh_CN: zh, en: pick(1), ru: pick(2) } } : {};
}

const candidates = existsSync(CAND)
  ? ['characters', 'zombies', 'hair'].flatMap((dir) => (existsSync(join(CAND, dir)) ? readdirSync(join(CAND, dir)).filter((f) => f.endsWith('.glb')).sort().map((f) => (archetypeNames.has(f)
    ? { file: `models/cubeclysm/candidates/${dir}/${f}`, names: archetypeNames.get(f), author: 'cdda-cubeclysm-3d contributors', license: 'CC-BY-SA-3.0', source: `tools/cubeclysm/page/${{ hair: 'hair', characters: 'humans' }[dir] ?? 'archetypes'}.js`, style: 'cubeclysm' }
    : { file: `models/cubeclysm/candidates/${dir}/${f}`, ...candidateNames(dir, f), ...CREDIT, style: 'cubeclysm', note: 'Cubeclysm restyle of a DEADWOOD — Last Light model (unbound)' })) : []))
  : [];

const setPath = join(ROOT, 'meshset.json');
const set = existsSync(setPath) ? JSON.parse(readFileSync(setPath, 'utf8')) : { name: 'Cubeclysm', format_version: 1, match: 'exact', models: [] };
const kept = set.models.filter((e) => !/^models\/(deadwood|cubeclysm)\//.test(String(e.file ?? '')));
set.models = [...kept, ...entries, ...candidates];
// One entry per line, as the studio writes sets (formatModelSet).
const { models, ...head } = set;
const lines = Object.entries(head).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
lines.push(`  "models": [\n${models.map((m) => `    ${JSON.stringify(m)}`).join(',\n')}\n  ]`);
writeFileSync(setPath, `{\n${lines.join(',\n')}\n}\n`);
console.log(`${entries.length} models bound, ${candidates.length} unbound candidates → meshset.json`);
