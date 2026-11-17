// Runs in the export page (tools/deadwood/export.mjs). Installs DEADWOOD's Frisson parts,
// builds every model with the game's own code, brings it to the library's conventions and
// hands back binary glTF files:
//   - 1 unit = 1 m, +Y up, the model facing -Z (north), standing on its own origin;
//   - joints named after the library's humanoid rig (head, shoulders, upper_arm.L, thigh.R…),
//     so the parts can be animated as rigid blocks;
//   - flat-shaded (non-indexed, face normals): the blocky look survives without the game's shader;
//   - game-only helpers (health markers, muzzle flash, weapon holders) removed.
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

import { installParts } from '/frisson/index.js';
import * as heads from '/frisson/heads.js';
import * as bodies from '/frisson/bodies.js';
import * as survivors from '/frisson/survivors.js';
import * as weapons from '/frisson/weapons.js';
import * as pickups from '/frisson/pickups.js';
import { WEAPON_TYPES } from '/frisson/weapon-recipes.js';
import { createGroundWeapon, createSurvivor } from '/world.js';
import { createZombie } from '/zombies.js';
import { blockify } from '/export/cubeclysm.js';
import { loadFaces } from '/cubeclysm/faces.js';

const exporter = new GLTFExporter();

/** Flat shading baked into the geometry; every material a plain vertex-coloured standard one. */
function bake(root) {
  const geometries = new Map();
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isMesh) return;
    let g = geometries.get(o.geometry);
    if (!g) {
      g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.deleteAttribute('normal');
      g.computeVertexNormals();
      for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'color', 'uv'].includes(name)) g.deleteAttribute(name);
      geometries.set(o.geometry, g);
    }
    o.geometry = g;
    const convert = (m) => {
      const out = new THREE.MeshStandardMaterial({
        name: m.name || 'deadwood',
        color: m.color ? m.color.clone() : 0xffffff,
        vertexColors: Boolean(g.attributes.color),
        roughness: m.roughness ?? 0.9,
        metalness: m.metalness ?? 0,
        transparent: Boolean(m.transparent),
        opacity: m.opacity ?? 1,
      });
      if (m.map) out.map = m.map;
      if (m.emissive && m.emissive.getHex() !== 0) {
        out.emissive = m.emissive.clone();
        out.emissiveIntensity = m.emissiveIntensity ?? 1;
      }
      return out;
    };
    o.material = Array.isArray(o.material) ? o.material.map(convert) : convert(o.material);
    o.castShadow = o.receiveShadow = false;
  });
  // The game's runtime state lives in userData; the exporter would write it all as extras.
  root.traverse((o) => {
    o.userData = {};
    if (o.isMesh) {
      o.geometry.userData = {};
      for (const m of [o.material].flat()) m.userData = {};
    }
  });
}

/** Remove objects by name pattern (game-only helpers). */
function strip(root, pattern) {
  const doomed = [];
  root.traverse((o) => { if (o !== root && pattern.test(o.name)) doomed.push(o); });
  for (const o of doomed) o.parent?.remove(o);
  // Empty groups left behind are harmless; invisible meshes are dropped.
  const hidden = [];
  root.traverse((o) => { if (o.isMesh && !o.visible) hidden.push(o); });
  for (const o of hidden) o.parent?.remove(o);
}

const named = (o, name) => { if (o) o.name = name; };

async function glb(object) {
  const data = await exporter.parseAsync(object, { binary: true, onlyVisible: true });
  const bytes = new Uint8Array(data);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function measure(object) {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object, true);
  const size = box.getSize(new THREE.Vector3());
  let triangles = 0;
  object.traverse((o) => { if (o.isMesh) triangles += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
  return { size: [size.x, size.y, size.z].map((n) => +n.toFixed(3)), bottom: +box.min.y.toFixed(3), triangles: Math.round(triangles) };
}

async function emit(files, path, object, info) {
  const entry = { path, info: { ...info, ...measure(object) } };
  bake(object);
  await window.saveModel(path, await glb(object));
  files.push(entry);
}

// ── Survivors ────────────────────────────────────────────────────────────────────────────
// Cloth is the model's grey times the player colour: one fixed colour per character here.
const SURVIVOR_COLORS = { Father: 0x5c7a8a, Daughter: 0x8a5c6e, Max: 0x6a7a4c, Lea: 0x7a5a8a, Sam: 0x4c6a7a, Man: 0x6a6258, Woman: 0x7a6a5a, Elder: 0x5a5a62, Raider: 0x3a3a38 };

function rigSurvivor(s) {
  const d = s.userData;
  named(s, 'root');
  named(d.body, 'body');
  named(d.head, 'head');
  named(d.aim, 'shoulders');
  d.arms?.forEach((a, i) => named(a, i === 0 ? 'upper_arm.L' : 'upper_arm.R'));
  d.legs?.forEach((a, i) => named(a, i === 0 ? 'thigh.L' : 'thigh.R'));
  d.knees?.forEach((a, i) => named(a, i === 0 ? 'shin.L' : 'shin.R'));
  if (d.holder) d.holder.parent?.remove(d.holder);
}

// ── Zombies ──────────────────────────────────────────────────────────────────────────────
function rigZombie(z) {
  const d = z.userData;
  named(z, 'root');
  named(d.body, 'body');
  named(d.head, 'head');
  named(d.leftArm, 'upper_arm.L');
  named(d.rightArm, 'upper_arm.R');
  named(d.leftLeg, 'thigh.L');
  named(d.rightLeg, 'thigh.R');
  if (d.healthMarker) d.healthMarker.parent?.remove(d.healthMarker);
}

function zombieTags(z) {
  let head = null;
  const bodyParts = new Set();
  z.traverse((o) => {
    if (o.userData?.headVariant) head = o.userData.headVariant;
    if (o.userData?.bodyVariant) bodyParts.add(o.userData.bodyVariant);
  });
  return { head, body: [...bodyParts].sort() };
}

window.exportAll = async () => {
  await installParts({ variant: {} }, [heads, bodies, survivors, weapons, pickups]);
  const files = [];
  if (new URLSearchParams(location.search).get('only') === 'cubeclysm') return exportCubeclysm(files);

  // Survivors: each character of survivors.glb, unarmed, no backpack.
  for (const [look, color] of Object.entries(SURVIVOR_COLORS)) {
    const raider = look === 'Raider';
    const s = createSurvivor(color, { backpack: false, weapon: null, raider, identity: { id: `export-${look}`, look } });
    const character = s.userData.character ?? null;
    if (!character || (!raider && character !== look)) continue;
    rigSurvivor(s);
    strip(s, /flash|muzzle/i);
    await emit(files, `characters/survivor_${look.toLowerCase()}.glb`, s, { kind: 'survivor', character });
  }

  // Zombies: one model per (kind, head), the first id that draws that head.
  for (const kind of ['walker', 'runner', 'brute', 'crawler']) {
    const seen = new Set();
    for (let id = 1; id <= 600; id++) {
      const z = createZombie(kind, false, 100, id);
      const tags = zombieTags(z);
      const key = tags.head ?? 'none';
      if (seen.has(key)) continue;
      seen.add(key);
      rigZombie(z);
      z.scale.setScalar(1);
      strip(z, /health|marker|crown/i);
      const name = (tags.head ?? 'plain').replace(/^FrissonHead_/, '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      await emit(files, `zombies/${kind}_${name}.glb`, z, { kind: 'zombie', zombieKind: kind, seed: id, ...tags });
    }
  }

  // Weapons: the game's ground pose (the held build without hands, lying on its side, dressed
  // for the ground), without the pickup halo.
  for (const type of WEAPON_TYPES) {
    let root;
    try { root = createGroundWeapon(type); } catch { continue; }
    root.name = type;
    strip(root, /pickupHalo|flash|muzzle|smoke/i);
    await emit(files, `weapons/${type}.glb`, root, { kind: 'weapon', type });
  }

  // Pickups: each root of pickups.glb as it is (no game assembly needed).
  const pickupFile = await (await fetch('/frisson/pickups.glb')).arrayBuffer();
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const gltf = await new GLTFLoader().parseAsync(pickupFile, '/frisson/');
  for (const root of [...gltf.scene.children]) {
    if (!/_Full$/.test(root.name)) continue;
    const name = root.name.replace(/^FrissonPickup_/, '').replace(/_Full$/, '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    root.position.set(0, 0, 0);
    const holder = new THREE.Group();
    holder.name = name;
    holder.add(root);
    await emit(files, `items/pickup_${name}.glb`, holder, { kind: 'pickup', root: root.name });
  }
  return files;
};

// ── Cubeclysm: the library's main style (cubeclysm.js) ───────────────────────────────────
/** The model's texture atlas as a PNG next to it (scaled ×8 for painting; the glb keeps 1 px per cell). */
async function saveAtlas(path, root) {
  const atlas = root.userData.atlas;
  const big = document.createElement('canvas');
  big.width = atlas.width * 8; big.height = atlas.height * 8;
  const ctx = big.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(atlas, 0, 0, big.width, big.height);
  await window.saveModel(path, big.toDataURL('image/png').split(',')[1]);
}

/**
 * Every survivor and every zombie (build × head) in the Cubeclysm style, mirroring the pool's
 * paths under cubeclysm/ (cubeclysm/characters/survivor_man.glb ↔ characters/survivor_man.glb),
 * each with its texture atlas as a PNG beside it.
 */
/**
 * Faces for the DEADWOOD heads, mixed from the shared face parts (tools/cubeclysm/faces): each head
 * type its own expression, after its name. Eye colours come from the original head (glowing eyes).
 */
const FACE_BY_HEAD = {
  RodeursHermit: { eyes: 'cloudy', brows: 'sad', mouth: 'grimace', marks: ['stubble', 'rot'] },
  RodeursWidow: { eyes: 'empty', brows: 'sad', mouth: 'stitched', marks: ['bruise'] },
  RodeursFarmer: { eyes: 'oily', brows: 'flat', mouth: 'frown_teeth', marks: ['stubble'] },
  RodeursElder: { eyes: 'cloudy', brows: 'raised', mouth: 'gape', marks: ['rot'] },
  RodeursTeen: { eyes: 'hungry', brows: 'angry', mouth: 'small_open', marks: ['blood_mouth'] },
  RodeursCrooked: { eyes: 'uneven', brows: 'uneven', mouth: 'grimace', marks: ['scar_cheek'] },
  RodeursSewn: { eyes: 'narrow', brows: 'flat', mouth: 'stitched', marks: ['scar_eye', 'scar_cheek'] },
  RodeursCracked: { eyes: 'one_eyed', brows: 'sad', mouth: 'frown_teeth', marks: ['blood_forehead'] },
  EnragesScreamer: { eyes: 'wide', brows: 'raised', mouth: 'gape', marks: ['blood_mouth'] },
  EnragesGrinder: { eyes: 'squint_angry', brows: 'furrowed', mouth: 'grimace', marks: ['scar_cheek'] },
  EnragesBrawler: { eyes: 'squint_angry', brows: 'angry', mouth: 'snarl', marks: ['bruise', 'blood_forehead'] },
  EnragesHeavy: { eyes: 'narrow', brows: 'furrowed', mouth: 'snarl', marks: ['stubble'] },
  EnragesLanky: { eyes: 'wide', brows: 'angry', mouth: 'gnaw', marks: ['blood_mouth'] },
  EnragesFury: { eyes: 'glow', brows: 'angry', mouth: 'snarl', marks: ['scar_eye'] },
  EnragesTorn: { eyes: 'one_eyed', brows: 'furrowed', mouth: 'grimace', marks: ['rot', 'blood_mouth'] },
  EnragesFever: { eyes: 'glow', brows: 'sad', mouth: 'drool', marks: ['veins'] },
  RevenantsUndertaker: { eyes: 'cloudy', brows: 'flat', mouth: 'stitched' },
  RevenantsDrowned: { eyes: 'cloudy', brows: 'sad', mouth: 'gape', marks: ['rot'] },
  RevenantsMiner: { eyes: 'oily', brows: 'angry', mouth: 'grin', marks: ['coal_dust'] },
  RevenantsBride: { eyes: 'empty', brows: 'raised', mouth: 'small_open', marks: ['blood_forehead'] },
  RevenantsSoldier: { eyes: 'narrow', brows: 'flat', mouth: 'grimace', marks: ['scar_eye'] },
  RevenantsCrone: { eyes: 'cloudy', brows: 'uneven', mouth: 'gape', marks: ['rot', 'bruise'] },
  RevenantsSurgeon: { eyes: 'oily', brows: 'flat', mouth: 'stitched', marks: ['scar_cheek'] },
  RevenantsFarmhand: { eyes: 'hungry', brows: 'raised', mouth: 'frown_teeth', marks: ['blood_mouth'] },
};

async function exportCubeclysm(files) {
  await loadFaces('/faces/');
  for (const [look, color] of Object.entries(SURVIVOR_COLORS)) {
    const raider = look === 'Raider';
    const s = createSurvivor(color, { backpack: false, weapon: null, raider, identity: { id: `export-${look}`, look } });
    const character = s.userData.character ?? null;
    if (!character || (!raider && character !== look)) continue;
    rigSurvivor(s);
    strip(s, /flash|muzzle/i);
    blockify(s);
    const path = `cubeclysm/characters/survivor_${look.toLowerCase()}`;
    await saveAtlas(`${path}.png`, s);
    await emit(files, `${path}.glb`, s, { kind: 'survivor', character, style: 'cubeclysm' });
  }
  for (const kind of ['walker', 'runner', 'brute', 'crawler']) {
    const seen = new Set();
    for (let id = 1; id <= 600; id++) {
      const z = createZombie(kind, false, 100, id);
      const tags = zombieTags(z);
      const key = tags.head ?? 'none';
      if (seen.has(key)) continue;
      seen.add(key);
      rigZombie(z);
      z.scale.setScalar(1);
      strip(z, /health|marker|crown/i);
      blockify(z, { face: FACE_BY_HEAD[tags.head] ?? { eyes: 'oily', brows: 'angry', mouth: 'frown_teeth' } });
      const name = (tags.head ?? 'plain').replace(/^FrissonHead_/, '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      const path = `cubeclysm/zombies/${kind}_${name}`;
      await saveAtlas(`${path}.png`, z);
      await emit(files, `${path}.glb`, z, { kind: 'zombie', zombieKind: kind, seed: id, ...tags, style: 'cubeclysm' });
    }
  }
  return files;
}
