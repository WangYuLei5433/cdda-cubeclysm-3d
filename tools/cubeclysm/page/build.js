// Builds every recipe (recipes.js) into a glTF file plus its texture atlas, handed to the runner
// (tools/cubeclysm/build.mjs) through window.save().
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import { bake } from './atlas.js';
import { loadFaces, manifest, PARTS, seedPart } from './faces.js';
import { HAIR } from './hair.js';
import { buildHumanoid } from './humanoid.js';
import { ARCHETYPES } from './archetypes.js';
import { HUMANS } from './humans.js';
import { RECIPES } from './recipes.js';
import { Prop } from './props.js';
import { TERRAIN } from './terrain.js';
import { FIELDS } from './fields.js';
import { TRAPS } from './traps.js';
import { SLAMFIRE_ITEMS } from './slamfire.js';
import { CROSSBOW_ITEMS } from './crossbow.js';
import { ROOF_ACCESS } from './roof-access.js';

const exporter = new GLTFExporter();
const b64 = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

/** The face parts' seed PNGs and manifest (written by build.mjs --seed-faces or when missing). */
window.seedFaces = () => {
  const files = [];
  for (const [cat, list] of Object.entries(PARTS)) for (const name of Object.keys(list)) files.push({ path: `${cat}/${name}.png`, data: seedPart(cat, name).toDataURL('image/png').split(',')[1] });
  return { files, manifest: manifest() };
};

window.buildAll = async (only = null) => {
  await loadFaces('/faces/');
  const out = [];
  const all = [...TERRAIN.map((r) => ({ ...r, group: r.dir ?? 'terrain' })), ...FIELDS.map((r) => ({ ...r, group: 'fields' })), ...TRAPS.map((r) => ({ ...r, group: 'traps' })), ...SLAMFIRE_ITEMS.map((r) => ({ ...r, group: 'items' })), ...CROSSBOW_ITEMS.map((r) => ({ ...r, group: 'items' })), ...ROOF_ACCESS.map((r) => ({ ...r, group: 'terrain' })), ...RECIPES.map((r) => ({ ...r, group: 'zombies' })), ...ARCHETYPES.map((r) => ({ ...r, group: 'archetypes' })), ...HUMANS.map((r) => ({ ...r, group: 'humans' }))];
  // One sample per hair style: a plain zombie wearing it, to browse the styles in the studio.
  const HAIR_NAMES = {
    bald: ['光头', 'bald', 'лысый'], buzz: ['寸头', 'buzz cut', 'ёжик'], short: ['短发', 'short', 'короткие'], messy: ['乱发', 'messy', 'растрёпанные'], spiky: ['刺头', 'spiky', 'торчком'],
    long: ['长发', 'long', 'длинные'], ponytail: ['马尾', 'ponytail', 'хвост'], bob: ['波波头', 'bob', 'каре'], mohawk: ['莫西干', 'mohawk', 'ирокез'], afro: ['爆炸头', 'afro', 'афро'],
    balding: ['地中海', 'balding', 'залысина'], bun: ['丸子头', 'bun', 'пучок'], pigtails: ['双马尾', 'pigtails', 'два хвоста'], braid: ['麻花辫', 'braid', 'коса'], sidePart: ['偏分', 'side part', 'на пробор'],
    slicked: ['背头', 'slicked back', 'зачёсанные'], undercut: ['削边', 'undercut', 'андеркат'], curtains: ['中分', 'curtains', 'пробор посередине'], dreadlocks: ['脏辫', 'dreadlocks', 'дреды'],
    topknot: ['发髻', 'top knot', 'узел'], wild: ['狂野长发', 'wild', 'дикие'], receding: ['发际线后移', 'receding', 'отступающие'],
  };
  const HAIR_COLORS = [0x2a1e18, 0x5a3a20, 0x8a5a2a, 0x1a1414, 0xb08a50, 0x6a6a68, 0x7a2a1a, 0xd0d0c8];
  Object.keys(HAIR).forEach((style, i) => {
    const [zh, en, ru] = HAIR_NAMES[style] ?? [style, style, style];
    all.push({
      id: `hair_${style}`, group: 'hair', names: { zh_CN: `发型 · ${zh}`, en: `hair · ${en}`, ru: `причёска · ${ru}` },
      body: 'standard', pose: 'stand', skin: 0x9ca393, hair: style === 'bald' ? null : HAIR_COLORS[i % HAIR_COLORS.length], hairStyle: style,
      face: { eyes: 'oily', brows: 'flat', mouth: 'frown_teeth' },
      outfit: { style: 'tshirt', top: 0x5a6a7a, sleeves: 'short', pants: 0x3a3f4a, shoes: 0x2a2a2a }, wear: {},
    });
  });
  for (const recipe of all) {
    if (only && !only.includes(recipe.id)) continue;
    let root, blocks, clips;
    if (recipe.build) {
      // Props (props.js): blocks only, no rig; a prop may set p.clip (fields: the looping FX clip).
      const p = new Prop(recipe.id, recipe.ppm);
      recipe.build(p);
      ({ root, blocks } = p);
      clips = p.clip ? [p.clip] : [];
    } else ({ root, blocks, clips } = buildHumanoid(recipe));
    const atlas = bake(blocks);
    if (recipe.batchMesh) {
      // These static models share an opaque atlas. Batch their facets for forest instancing.
      const meshes = root.children;
      const geometry = mergeGeometries(meshes.map((mesh) => mesh.geometry));
      for (const mesh of meshes) mesh.geometry.dispose();
      const material = meshes[0].material;
      root.clear();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = recipe.id + '_mesh';
      root.add(mesh);
    }
    if (recipe.batchByMaterial) {
      // Road vehicles have static root-space geometry. Keep glass in its own render pass.
      const batches = new Map();
      // The roof (blocks named roof-…) stays a node of its own, `roof`, so a viewer can lift it off.
      for (const mesh of root.children) {
        const roof = mesh.name.startsWith('block_roof');
        const key = `${mesh.material.uuid}|${roof}`;
        const group = batches.get(key) ?? { material: mesh.material, roof, geometries: [] };
        group.geometries.push(mesh.geometry);
        batches.set(key, group);
      }
      root.clear();
      const roofNode = new THREE.Group();
      roofNode.name = 'roof';
      for (const { material, roof, geometries } of batches.values()) {
        const mesh = new THREE.Mesh(mergeGeometries(geometries), material);
        mesh.name = roof ? 'roof_body' : material.transparent ? 'glazing' : 'closed_body';
        (roof ? roofNode : root).add(mesh);
        for (const geometry of geometries) geometry.dispose();
      }
      if (roofNode.children.length) root.add(roofNode);
    }
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    if (recipe.longestSide && recipe.group === 'items') {
      const longest = Math.max(size.x, size.y, size.z);
      if (!Number.isFinite(longest) || longest <= 0) throw new Error(`invalid bounds for ${recipe.id}`);
      const scale = recipe.longestSide / longest;
      root.scale.multiplyScalar(scale);
      root.position.y -= box.min.y * scale;
      root.updateMatrixWorld(true);
      box.setFromObject(root).getSize(size);
    }
    // The lowest parts (they should rest on y = 0: feet, or hands on all fours).
    const lows = [];
    root.traverse((o) => { if (o.isMesh && !/fx_/.test(o.parent?.name ?? '')) lows.push([+new THREE.Box3().setFromObject(o).min.y.toFixed(3), o.name]); });
    const low = [...new Map(lows.sort((p, q) => p[0] - q[0]).map(([y, n]) => [n, y])).entries()].slice(0, 4).map(([n, y]) => `${n} ${y}`);
    let triangles = 0;
    root.traverse((o) => { if (o.isMesh) triangles += o.geometry.attributes.position.count / 3; });
    const glb = new Uint8Array(await exporter.parseAsync(root, { binary: true, animations: clips }));
    await window.save(`${recipe.group}/${recipe.id}.glb`, b64(glb));
    // The atlas ×8, to repaint (the glb keeps the real resolution).
    const big = document.createElement('canvas');
    big.width = atlas.width * 4; big.height = atlas.height * 4;
    const ctx = big.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(atlas, 0, 0, big.width, big.height);
    await window.save(`${recipe.group}/${recipe.id}.png`, big.toDataURL('image/png').split(',')[1]);
    // Faces an engine may use on its own geometry (atlas rects, see bake()):
    //  - a wall that is one plain block (no 3D features): its face and its top (the wall's
    //    section), for connected walls thinner than a tile;
    //  - ground and roof slabs: the tile's top, e.g. for the floor under a door or window.
    const slab = blocks.find((b) => b.name === 'tile');
    const surfaceFaces = recipe.surface === 'wall' && blocks.length === 1 && blocks[0].name === 'wall' ? { side: blocks[0].atlasRects.front, top: blocks[0].atlasRects.top }
      : (recipe.surface === 'floor' || recipe.surface === 'roof') && slab ? { top: slab.atlasRects.top } : undefined;
    out.push({ id: recipe.id, ids: recipe.ids, interior: recipe.interior, group: recipe.group, names: recipe.names, bound: recipe.bound, fx: clips.length ? recipe.fx : undefined, path: `${recipe.group}/${recipe.id}.glb`, body: recipe.body, source: recipe.source, surface: recipe.surface, surfaceFaces, opening: recipe.opening, groupOf: recipe.groupOf, footprint: recipe.footprint, faceWall: recipe.faceWall, faceOut: recipe.faceOut, field: recipe.field, gear: recipe.gear ?? [], desc: recipe.desc, size: [size.x, size.y, size.z].map((n) => +n.toFixed(3)), bottom: +box.min.y.toFixed(3), low, triangles });
  }
  return out;
};
