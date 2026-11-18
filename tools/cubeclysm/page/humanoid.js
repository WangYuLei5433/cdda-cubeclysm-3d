// Cubeclysm humanoids: a body built from boxes on the library's rig (root › body › head,
// shoulders › upper_arm.L/R › forearm › hand, thigh.L/R › shin), sized by a body type, then
// dressed with 3D gear (caps, helmets, masks, tanks, vests…) and odd features (bellies, humps,
// a missing jaw, pustules…) as blocks of their own. 1 unit = 1 m, feet on y = 0, facing −Z.
import * as THREE from 'three';

import { block } from './atlas.js';
import { effects } from './fx.js';
import { FACE_PX, composeFace } from './faces.js';
import { HAIR } from './hair.js';
import { band, baseColor, blobs, blood, bone, char, css, lichtenberg, rash, fill, garment, meld, muscle, rng, rust, scabs, shade, shadow, shards, skull, stitches, tattoos, tears, veins, wounds } from './paint.js';

/** Body types (metres). `standard` is a 1.75 m adult; the others override what differs. */
export const BODIES = {
  standard: { head: 0.3, neck: 0.02, torsoH: 0.62, torsoW: 0.46, torsoD: 0.24, thigh: 0.4, shin: 0.33, foot: 0.08, footD: 0.26, legW: 0.15, legD: 0.16, armW: 0.13, armD: 0.13, upperArm: 0.3, forearm: 0.25, hand: 0.12, handW: 0.13, hunch: 0, headDrop: 0 },
  fat: { torsoW: 0.58, torsoD: 0.36, legW: 0.19, legD: 0.2, armW: 0.16, armD: 0.16, head: 0.31, handW: 0.15 },
  tough: { torsoW: 0.54, torsoD: 0.28, torsoH: 0.64, armW: 0.17, armD: 0.16, legW: 0.17, legD: 0.18, thigh: 0.42, shin: 0.34, handW: 0.16 },
  bloated: { head: 0.3, neck: 0, torsoH: 0.66, torsoW: 0.6, torsoD: 0.44, thigh: 0.36, shin: 0.3, foot: 0.08, footD: 0.28, legW: 0.19, legD: 0.2, armW: 0.16, armD: 0.16, upperArm: 0.28, forearm: 0.25, hand: 0.13, handW: 0.17, headDrop: -0.03 },
  female: { head: 0.29, torsoH: 0.58, torsoW: 0.4, torsoD: 0.21, thigh: 0.4, shin: 0.33, foot: 0.07, footD: 0.24, legW: 0.14, legD: 0.15, armW: 0.11, armD: 0.11, upperArm: 0.28, forearm: 0.24, hand: 0.11, handW: 0.11 },
  teen: { head: 0.29, torsoH: 0.54, torsoW: 0.4, torsoD: 0.2, thigh: 0.36, shin: 0.3, foot: 0.07, footD: 0.24, legW: 0.13, legD: 0.14, armW: 0.11, armD: 0.11, upperArm: 0.27, forearm: 0.23, hand: 0.11, handW: 0.11 },
  child: { head: 0.27, torsoH: 0.38, torsoW: 0.32, torsoD: 0.17, thigh: 0.22, shin: 0.18, foot: 0.06, footD: 0.18, legW: 0.11, legD: 0.12, armW: 0.09, armD: 0.09, upperArm: 0.18, forearm: 0.15, hand: 0.09, handW: 0.1 },
  lanky: { head: 0.29, torsoW: 0.4, torsoD: 0.21, torsoH: 0.64, armW: 0.11, armD: 0.11, upperArm: 0.33, forearm: 0.28, legW: 0.13, legD: 0.14, thigh: 0.43, shin: 0.35, handW: 0.11 },
  elongated: { head: 0.28, torsoW: 0.4, torsoD: 0.22, torsoH: 0.82, armW: 0.11, armD: 0.11, upperArm: 0.34, forearm: 0.3, legW: 0.13, legD: 0.14, thigh: 0.44, shin: 0.36, handW: 0.11 },
  brute: { head: 0.3, neck: 0, torsoH: 0.74, torsoW: 0.6, torsoD: 0.34, armW: 0.19, armD: 0.19, upperArm: 0.36, forearm: 0.32, hand: 0.16, handW: 0.18, legW: 0.19, legD: 0.2, thigh: 0.42, shin: 0.36, foot: 0.1, footD: 0.32, hunch: 0.1, headDrop: -0.06 },
  giant: { head: 0.38, neck: 0, torsoH: 1.1, torsoW: 1.18, torsoD: 0.72, armW: 0.4, armD: 0.4, upperArm: 0.5, forearm: 0.48, hand: 0.3, handW: 0.42, legW: 0.36, legD: 0.38, thigh: 0.55, shin: 0.45, foot: 0.12, footD: 0.46, hunch: 0.2, headDrop: -0.12 },
};

const B = (x0, y0, z0, x1, y1, z1) => new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));
/** A box centred on x and z, from y0 to y1. */
const C = (w, y0, y1, d, x = 0, z = 0) => B(x - w / 2, y0, z - d / 2, x + w / 2, y1, z + d / 2);
const joint = (parent, name, x, y, z) => { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g; };

/** A painter that fills a block in one colour, with an optional extra drawing per side. */
export const solid = (hex, extra) => (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, hex); extra?.(ctx, x, y, w, h, side); };

/** Build a humanoid from a recipe (recipes.js). Returns the root and its blocks (baked later). */
export function buildHumanoid(recipe) {
  const b = { ...BODIES.standard, ...BODIES[recipe.body], ...(recipe.bulk ? bulkUp(BODIES[recipe.body] ?? {}, recipe.bulk) : {}), ...recipe.proportions };
  const blocks = [];
  const add = (parent, name, box, paint, opts) => { const bl = block(parent, name, box, paint, opts); blocks.push(bl); return bl; };
  const root = new THREE.Group(); root.name = 'root';
  const body = joint(root, 'body', 0, 0, 0);
  const crawler = recipe.body === 'crawler';
  const legH = crawler ? 0 : b.thigh + b.shin + b.foot;
  const torsoTop = legH + b.torsoH;
  const skin = recipe.skin;

  /** The painter of a body part: its base colour from the outfit, garment details, then wear. */
  const part = (name, extra) => (ctx, x, y, w, h, side) => {
    const r = rng(`${recipe.id}|${name}|${side}`);
    const base = baseColor(recipe.outfit, skin, name);
    fill(ctx, x, y, w, h, base);
    garment(ctx, x, y, w, h, side, name, recipe.outfit, skin, r);
    const bare = base === skin;
    const wear = recipe.wear ?? {};
    if (wear.tears && !bare && name !== 'foot' && r() < wear.tears) tears(ctx, x, y, w, h, 1 + Math.floor(r() * 2), skin, r);
    if (wear.veins && bare) veins(ctx, x, y, w, h, wear.veins, 2, r);
    if (wear.wounds && r() < wear.wounds) wounds(ctx, x, y, w, h, 1 + Math.floor(r() * 2), r);
    if (wear.blood && r() < wear.blood) blood(ctx, x, y, w, h, 2, r);
    if (wear.bloodyHands && name === 'hand') blood(ctx, x, y, w, h, 4, r);
    if (wear.stitches && bare && r() < wear.stitches) stitches(ctx, x, y, w, h, r);
    if (wear.scab && bare) scabs(ctx, x, y, w, h, skin, r);
    if (wear.bone && bare) bone(ctx, x, y, w, h, r);
    // Burnt: bare skin is a charred crust; clothes get burnt-through patches.
    if (wear.char && bare) char(ctx, x, y, w, h, r);
    else if (wear.char && r() < wear.char) blobs(ctx, x, y, w, h, 0x26201c, 2, Math.min(w, h) * 0.25, r);
    if (wear.lichtenberg && bare) lichtenberg(ctx, x, y, w, h, wear.lichtenberg, r);
    if (wear.rash && bare && r() < wear.rash) rash(ctx, x, y, w, h, r);
    if (wear.soot && r() < wear.soot) blobs(ctx, x, y, w, h, 0x2e2a26, 2 + Math.floor(wear.soot * 3), Math.min(w, h) * 0.2, r);
    if (wear.tattoos && bare && ['torso', 'upper_arm', 'forearm', 'hand'].includes(name) && side !== 'top' && side !== 'bottom' && r() < wear.tattoos) tattoos(ctx, x, y, w, h, r);
    if (wear.meld && !bare && name !== 'foot' && r() < wear.meld) meld(ctx, x, y, w, h, skin, r);
    if (wear.acid && !bare && name !== 'foot' && r() < wear.acid) { blobs(ctx, x, y, w, h, skin, 2, Math.min(w, h) * 0.28, r); blobs(ctx, x, y, w, h, 0xc8c43a, 2, Math.min(w, h) * 0.1, r); }
    if (wear.shards && !bare && r() < wear.shards) shards(ctx, x, y, w, h, r);
    if (wear.rust && r() < wear.rust) rust(ctx, x, y, w, h, r);
    if (wear.shadow && r() < wear.shadow) shadow(ctx, x, y, w, h, r);
    extra?.(ctx, x, y, w, h, side, r);
  };

  // Torso and neck.
  add(body, 'torso', C(b.torsoW, legH, torsoTop, b.torsoD), part('torso'));
  const head = joint(body, 'head', 0, torsoTop + b.neck + b.headDrop, -b.hunch);
  const hs = b.head;
  if (b.neck > 0) add(body, 'neck', C(hs * 0.62, torsoTop - 0.03, torsoTop + b.neck + 0.01, hs * 0.62, 0, -b.hunch / 2), solid(skin));
  // The head gets FACE_PX pixels across, so the face parts keep their detail on any head size.
  add(head, 'head', C(hs, 0, hs, hs), headPainter(recipe), { ppm: FACE_PX / hs });
  HAIR[recipe.hair === null ? 'bald' : recipe.hairStyle ?? 'short']?.({ head, hs, add, recipe });

  // Arms.
  const shoulders = joint(body, 'shoulders', 0, torsoTop - 0.02, 0);
  const arms = {};
  for (const [s, L] of [[-1, 'L'], [1, 'R']]) {
    const upper = joint(shoulders, `upper_arm.${L}`, s * (b.torsoW / 2 + b.armW / 2 + 0.004), 0, 0);
    add(upper, `upper_arm.${L}`, C(b.armW, -b.upperArm, 0, b.armD), part('upper_arm'));
    const fore = joint(upper, `forearm.${L}`, 0, -b.upperArm, 0);
    const fw = b.armW * (b.forearmK ?? 0.95);
    add(fore, `forearm.${L}`, C(fw, -b.forearm, 0, b.armD * 0.95), part('forearm'));
    const hand = joint(fore, `hand.${L}`, 0, -b.forearm, 0);
    add(hand, `hand.${L}`, C(b.handW, -b.hand, 0, b.armD * 1.02), part('hand'));
    arms[L] = { upper, fore, hand };
  }

  // Legs (a crawler drags two ruined stumps).
  const legs = {};
  for (const [s, L] of [[-1, 'L'], [1, 'R']]) {
    const thigh = joint(body, `thigh.${L}`, s * (b.torsoW / 2 - b.legW / 2 - 0.01), legH, 0);
    if (crawler) {
      const stump = 0.18 + (s > 0 ? 0.06 : 0);
      add(thigh, `thigh.${L}`, C(b.legW, -stump, 0, b.legD), part('thigh'));
      add(thigh, `bone.${L}`, C(0.05, -stump - 0.07, -stump, 0.05), solid(0xe8e0c8));
      add(thigh, `flesh.${L}`, C(b.legW * 0.8, -stump - 0.02, -stump + 0.005, b.legD * 0.8), solid(0x6e1a1a));
      legs[L] = { thigh };
      continue;
    }
    add(thigh, `thigh.${L}`, C(b.legW, -b.thigh, 0, b.legD), part('thigh'));
    const shin = joint(thigh, `shin.${L}`, 0, -b.thigh, 0);
    add(shin, `shin.${L}`, C(b.legW * 0.95, -b.shin, 0, b.legD * 0.95), part('shin'));
    add(shin, `foot.${L}`, B(-b.legW / 2, -b.shin - b.foot, b.legD / 2 - b.footD, b.legW / 2, -b.shin, b.legD / 2), part('foot'));
    legs[L] = { thigh, shin };
  }

  /** Drop blocks by name (a feature that replaces a part, e.g. a torn-off forearm). */
  const remove = (pred) => { for (let i = blocks.length - 1; i >= 0; i--) if (pred(blocks[i].name)) blocks.splice(i, 1); };
  const fx = effects(recipe.id);
  const H = { root, body, head, shoulders, arms, legs, b, legH, torsoTop, hs, add, remove, part, skin, recipe, fx, blocks };
  for (const g of recipe.gear ?? []) GEAR[g](H);
  // A body that glows all over (an incandescent silhouette).
  if (recipe.glowAll) for (const bl of blocks) bl.glow = true;
  for (const f of recipe.fx ?? []) FX[f](H);
  pose(H, recipe.pose ?? (crawler ? 'crawl' : 'stand'));
  blocks.push(...fx.blocks);
  const clip = fx.clip();
  return { root, blocks, clips: clip ? [clip] : [] };
}

/** Bulkier clothes (a hazmat suit, a firefighter's coat): every part a little thicker. */
function bulkUp(base, k) {
  const s = { ...BODIES.standard, ...base };
  return { torsoW: s.torsoW + k, torsoD: s.torsoD + k, armW: s.armW + k * 0.6, armD: s.armD + k * 0.6, legW: s.legW + k * 0.5, legD: s.legD + k * 0.5, handW: s.handW + k * 0.4 };
}

/** Shift the body so its lowest block rests on y = 0 (poses whose contact points are hard to solve). */
function ground(H) {
  H.root.updateMatrixWorld(true);
  let low = Infinity;
  for (const bl of H.blocks) {
    if (/^fx_(drip|flake|puff)/.test(bl.parent.name)) continue;
    low = Math.min(low, bl.box.clone().applyMatrix4(bl.parent.matrixWorld).min.y);
  }
  if (Number.isFinite(low)) H.body.position.y -= low;
}

/** Poses: standing (arms hanging), reaching (the classic shamble), crawling. */
function pose(H, name) {
  const { body, head, arms, legs } = H;
  if (name === 'reach') {
    for (const L of ['L', 'R']) { arms[L].upper.rotation.x = 1.25 + (L === 'L' ? 0.1 : -0.05); arms[L].fore.rotation.x = 0.15; }
  } else if (name === 'crawl') {
    body.rotation.x = -1.4;
    head.rotation.x = 1.15;
    // Arms stretched forward along the ground, hands level with the chest (which lies on the
    // ground): reaching down any further would prop the body up off the floor.
    for (const L of ['L', 'R']) { arms[L].upper.rotation.x = 2.6; arms[L].upper.rotation.z = (L === 'L' ? -1 : 1) * 0.15; arms[L].fore.rotation.x = 0; }
    for (const L of ['L', 'R']) legs[L].thigh.rotation.z = (L === 'L' ? -1 : 1) * 0.12;
  } else if (name === 'prowl' || name === 'knuckle') {
    // On all fours: the torso pitched forward, the knees bent, the arms reaching the ground as
    // front legs. Heights are solved from the body's own proportions so hands and feet both land.
    // `knuckle` walks on its knuckles like a gorilla: the torso more upright, on long arms.
    const { b, legH, torsoTop } = H, th = name === 'knuckle' ? -0.8 : -1.25;
    const reach = b.upperArm + b.forearm + b.hand * (name === 'knuckle' ? 1.02 : 0.85), legFull = b.thigh + b.shin;
    // The shins stay upright (feet flat); only the thighs swing forward to lower the hips.
    const hipH = Math.max(b.foot + b.shin + b.thigh * 0.15, Math.min(b.foot + legFull * 0.98, reach - (torsoTop - 0.02 - legH) * Math.cos(th)));
    const a = Math.acos(Math.min(1, (hipH - b.foot - b.shin) / b.thigh));
    body.rotation.x = th;
    body.position.set(0, hipH - legH * Math.cos(th), -legH * Math.sin(th));
    for (const L of ['L', 'R']) { legs[L].thigh.rotation.x = -th + a; legs[L].shin.rotation.x = -a; legs[L].thigh.rotation.z = (L === 'L' ? -1 : 1) * 0.1; }
    const shoulderY = hipH + (torsoTop - 0.02 - legH) * Math.cos(th);
    const phi = shoulderY < reach ? Math.acos(shoulderY / reach) : 0;
    for (const L of ['L', 'R']) { arms[L].upper.rotation.x = -th + phi; arms[L].upper.rotation.z = (L === 'L' ? -1 : 1) * 0.12; arms[L].fore.rotation.x = 0; }
    head.rotation.x = -th * 0.85;
  } else if (name === 'drag') {
    // Hunched, arms swung back so what they end in drags on the ground behind.
    for (const L of ['L', 'R']) { arms[L].upper.rotation.x = -0.3; arms[L].upper.rotation.z = (L === 'L' ? -1 : 1) * 0.1; }
  } else if (name === 'trail') {
    // Arms longer than the shoulders are high, swung back just enough that the hands drag on the
    // ground behind (the angle is solved from the arm length).
    const { b, torsoTop } = H, reach = b.upperArm + b.forearm + b.hand, shoulderY = torsoTop - 0.02;
    const a = reach > shoulderY ? Math.acos(shoulderY / reach) : 0;
    for (const L of ['L', 'R']) { arms[L].upper.rotation.x = -a; arms[L].upper.rotation.z = (L === 'L' ? -1 : 1) * 0.08; }
    head.rotation.x = 0.15;
  } else if (name === 'crouch') {
    // Squatting on flat feet: thighs swung forward, shins back, the body lowered so the feet stay
    // on the ground; arms hanging forward between the knees.
    const { b, legH } = H, a = 1.0;
    body.position.y = b.foot + (b.thigh + b.shin) * Math.cos(a) - legH;
    for (const L of ['L', 'R']) { legs[L].thigh.rotation.x = a; legs[L].shin.rotation.x = -2 * a; legs[L].thigh.rotation.z = (L === 'L' ? -1 : 1) * 0.18; }
    for (const L of ['L', 'R']) { arms[L].upper.rotation.x = 0.7; arms[L].fore.rotation.x = 0.3; }
    head.rotation.x = 0.1;
    ground(H);
  } else if (name === 'creep') {
    // Creeping like a spider or a lizard: the torso flat and low, chest down, head pushed forward;
    // upper arms and thighs splayed out sideways, elbows and knees out, forearms and shins straight
    // down to the ground. Lowered onto its hands and feet by ground().
    body.rotation.x = -Math.PI / 2 + 0.18;
    head.rotation.x = Math.PI / 2 - 0.35;
    for (const [L, s] of [['L', -1], ['R', 1]]) {
      arms[L].upper.rotation.set(0.25, 0, s * 1.95); arms[L].fore.rotation.set(Math.PI / 2 - 0.1, 0, 0);
      legs[L].thigh.rotation.set(-0.2, 0, s * 1.15); if (legs[L].shin) legs[L].shin.rotation.set(Math.PI / 2 - 0.15, 0, 0);
    }
    ground(H);
  } else if (name === 'flail') {
    // A spasm: limbs flung out at painful angles, the head wrenched to one side, one knee
    // jerked up, the body twisted; stood back on the ground by ground().
    body.rotation.set(-0.12, 0.25, -0.1);
    head.rotation.set(-0.25, -0.3, 0.45);
    arms.L.upper.rotation.set(0.4, 0, -2.3); arms.L.fore.rotation.set(1.2, 0, 0);
    arms.R.upper.rotation.set(-0.7, 0, 0.9); arms.R.fore.rotation.set(-0.3, 0, 1.0);
    legs.R.thigh.rotation.set(0.75, 0, 0.1); if (legs.R.shin) legs.R.shin.rotation.set(-1.0, 0, 0);
    legs.L.thigh.rotation.set(-0.12, 0, -0.12);
    ground(H);
  } else if (name === 'blob') {
    // A ball of flesh (fleshBall): nothing to pose, only set down on the ground.
    ground(H);
  } else if (name === 'stagger') {
    // Drunken stumbling: leaning sideways, one arm flung out for balance, the head lolling.
    body.rotation.set(-0.05, 0, 0.14);
    head.rotation.set(0.3, 0, -0.35);
    arms.L.upper.rotation.set(0.2, 0, -0.7); arms.R.upper.rotation.set(0.6, 0, 0.15);
    legs.L.thigh.rotation.set(0.15, 0, -0.12); legs.R.thigh.rotation.set(-0.1, 0, 0.05);
    ground(H);
  } else if (name === 'supine') {
    // Lying on its back, face up: the back on the ground, the neck bent so the head rests beside
    // it, the limbs lying slack and splayed at odd angles.
    const { b, hs } = H, d = b.torsoD / 2;
    body.rotation.x = Math.PI / 2;
    body.position.y = d;
    head.position.z -= hs / 2 - d;
    head.rotation.x = -0.2;
    arms.L.upper.rotation.set(-0.25, 0, -1.25); arms.L.fore.rotation.set(-0.15, 0, 0.7);
    arms.R.upper.rotation.set(-0.22, 0, 0.8); arms.R.fore.rotation.set(-0.1, 0, -1.2);
    for (const [L, z] of [['L', -0.35], ['R', 0.5]]) { legs[L].thigh.rotation.set(-0.12, 0, z); if (legs[L].shin) legs[L].shin.rotation.set(-0.08, 0, -z * 1.4); }
    ground(H);
  } else if (name === 'crooked') {
    // Bent and leaning to one side, one arm hanging lower.
    body.rotation.z = 0.12;
    body.rotation.x = -0.12;
    head.rotation.z = -0.3;
    arms.L.upper.rotation.z = -0.25; arms.R.upper.rotation.x = 0.4;
  } else if (name === 'hunched') {
    for (const L of ['L', 'R']) { arms[L].upper.rotation.z = (L === 'L' ? -1 : 1) * 0.12; arms[L].upper.rotation.x = 0.25; }
  } else {
    for (const L of ['L', 'R']) arms[L].upper.rotation.z = (L === 'L' ? -1 : 1) * 0.05;
  }
}

/** The head: hair on top and at the back (unless bald), the face on the front. */
function headPainter(recipe) {
  const { skin, hair = null } = recipe;
  return (ctx, x, y, w, h, side) => {
    fill(ctx, x, y, w, h, skin);
    if (hair !== null) {
      if (side === 'top') fill(ctx, x, y, w, h, hair);
      if (side === 'back') fill(ctx, x, y, w, h * 0.62, hair);
      if (side === 'left' || side === 'right') { fill(ctx, x, y, w, h * 0.28, hair); fill(ctx, side === 'left' ? x : x + w * 0.6, y, w * 0.4, h * 0.55, hair); }
    }
    if (recipe.wear?.scab && side !== 'front') scabs(ctx, x, y, w, h, skin, rng(`${recipe.id}|head-scab|${side}`));
    if (recipe.wear?.bone && side === 'top') bone(ctx, x, y, w, h, rng(`${recipe.id}|head-bone`));
    if (recipe.wear?.veins && side !== 'top' && side !== 'bottom' && side !== 'front') veins(ctx, x, y, w, h, recipe.wear.veins, 2, rng(`${recipe.id}|head|${side}`));
    if (recipe.wear?.lichtenberg && side !== 'front' && side !== 'top') lichtenberg(ctx, x, y, w, h, recipe.wear.lichtenberg, rng(`${recipe.id}|head-lb|${side}`));
    if (recipe.wear?.rash && side !== 'top') rash(ctx, x, y, w, h * (side === 'front' ? 0.3 : 1), rng(`${recipe.id}|head-rash|${side}`));
    if (recipe.wear?.char && side !== 'front' && side !== 'top') char(ctx, x, y, w, h, rng(`${recipe.id}|head-char|${side}`));
    if (recipe.wear?.soot && side !== 'front') blobs(ctx, x, y, w, h, 0x2e2a26, 3, Math.min(w, h) * 0.2, rng(`${recipe.id}|head-soot|${side}`));
    if (recipe.wear?.shadow && side !== 'front') shadow(ctx, x, y, w, h, rng(`${recipe.id}|head-shadow|${side}`));
    if (recipe.skull) { if (side === 'front') skull(ctx, x, y, w, h); else bone(ctx, x, y, w, h, rng(`${recipe.id}|skull|${side}`)); return; }
    if (side === 'front') {
      // A painted fringe under the 3D hair, for the styles that have one.
      if (hair !== null && HAIR[recipe.hairStyle ?? 'short']?.fringe) fill(ctx, x, y, w, h * 0.14, hair);
      composeFace(ctx, x, y, w, h, { skin, hair, eye: recipe.eye ?? 0x0a0a0a, face: recipe.face ?? {} });
    }
    if (recipe.wear?.wounds && side === 'left') wounds(ctx, x, y, w, h, 1, rng(`${recipe.id}|head-w`));
  };
}


/** Raised plates (crusts) on the torso front and back, the upper arms and the shins, each painted by `crust`. */
function crustPlates(H, crust) {
  const { b, body, legH, torsoTop, arms, legs, add, recipe } = H, r = rng(`${recipe.id}|plates`), w = b.torsoW / 2, d = b.torsoD / 2;
  for (let i = 0; i < 5; i++) { const x0 = (r() - 0.5) * w * 1.4, y0 = legH + b.torsoH * (0.1 + r() * 0.75); add(body, 'crust', B(x0 - 0.07, y0 - 0.05, -d - 0.025, x0 + 0.07, y0 + 0.05, -d + 0.01), crust); }
  for (let i = 0; i < 3; i++) { const x0 = (r() - 0.5) * w * 1.4, y0 = legH + b.torsoH * (0.2 + r() * 0.6); add(body, 'crust', B(x0 - 0.08, y0 - 0.06, d - 0.01, x0 + 0.08, y0 + 0.06, d + 0.025), crust); }
  for (const L of ['L', 'R']) { add(arms[L].upper, 'crust', C(b.armW * 1.18, -0.16, 0.02, b.armD * 1.18), crust); add(legs[L].shin, 'crust', C(b.legW * 1.12, -b.shin * 0.6, -b.shin * 0.2, b.legD * 1.12), crust); }
  void torsoTop;
}

/** A shell of plates over the chest, belly, back, shoulders and thighs, with runs dripping off the chest; `plate(key)` paints each. */
function shellPlates(H, plate) {
  const { b, body, legH, torsoTop, arms, legs, add } = H, w = b.torsoW / 2, d = b.torsoD / 2;
  add(body, 'melt-chest', B(-w * 0.9, legH + b.torsoH * 0.5, -d - 0.045, w * 0.55, torsoTop - 0.04, -d + 0.01), plate('c'));
  add(body, 'melt-belly', B(-w * 0.2, legH + b.torsoH * 0.12, -d - 0.04, w * 0.85, legH + b.torsoH * 0.48, -d + 0.01), plate('b'));
  add(body, 'melt-back', B(-w * 0.8, legH + b.torsoH * 0.3, d - 0.01, w * 0.8, torsoTop - 0.05, d + 0.045), plate('k'));
  for (const [x, y, len] of [[-w * 0.6, legH + b.torsoH * 0.5, 0.1], [-w * 0.1, legH + b.torsoH * 0.5, 0.06], [w * 0.5, legH + b.torsoH * 0.12, 0.09]]) add(body, 'slag', B(x - 0.02, y - len, -d - 0.035, x + 0.02, y, -d - 0.005), plate(`s${x}`));
  for (const L of ['L', 'R']) {
    add(arms[L].upper, `melt-pauldron.${L}`, C(b.armW * 1.3, -0.14, 0.04, b.armD * 1.3), plate(`p${L}`));
    if (legs[L].shin) add(legs[L].thigh, `melt-thigh.${L}`, B(-b.legW * 0.55, -b.thigh * 0.6, -b.legD / 2 - 0.035, b.legW * 0.55, -b.thigh * 0.1, -b.legD / 2 + 0.01), plate(`t${L}`));
  }
}

// ── Gear and features: each adds blocks to a joint ─────────────────────────────────────────
const GOLD = 0xc9a33a, BLACK = 0x1c1c1e;

export const GEAR = {
  /** Police: peaked cap with a badge, chest badge, duty belt with pouches and holster, shoulder radio. */
  policeCap(H) {
    const { hs, head, add } = H, navy = H.recipe.outfit.top;
    add(head, 'cap', B(-hs * 0.54, hs * 0.84, -hs * 0.54, hs * 0.54, hs * 1.08, hs * 0.54), solid(navy, (ctx, x, y, w, h, side) => {
      if (side !== 'top' && side !== 'bottom') band(ctx, x, y, w, h, BLACK, 0.62, 0.38);
      if (side === 'front') { fill(ctx, x + w * 0.42, y + h * 0.12, w * 0.16, h * 0.4, GOLD); fill(ctx, x + w * 0.46, y + h * 0.2, w * 0.08, h * 0.2, shade(GOLD, 0.7)); }
    }));
    add(head, 'cap-brim', B(-hs * 0.46, hs * 0.83, -hs * 0.54 - 0.075, hs * 0.46, hs * 0.865, -hs * 0.54), solid(BLACK));
  },
  badge(H) {
    const { b, body, torsoTop, add } = H;
    add(body, 'badge', B(-b.torsoW * 0.36, torsoTop - 0.21, -b.torsoD / 2 - 0.012, -b.torsoW * 0.22, torsoTop - 0.12, -b.torsoD / 2), solid(GOLD, (ctx, x, y, w, h, side) => { if (side === 'front') fill(ctx, x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4, shade(GOLD, 0.7)); }));
  },
  dutyBelt(H) {
    const { b, body, legH, add } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    add(body, 'belt', B(-w - 0.015, legH - 0.01, -d - 0.015, w + 0.015, legH + 0.06, d + 0.015), solid(BLACK, (ctx, x, y, ww, hh, side) => { if (side === 'front') fill(ctx, x + ww * 0.44, y + hh * 0.25, ww * 0.12, hh * 0.5, 0x8a8a8a); }));
    for (const px of [-0.14, 0.02]) add(body, 'pouch', B(px - 0.04, legH - 0.005, -d - 0.05, px + 0.04, legH + 0.065, -d - 0.015), solid(0x232325));
    add(body, 'holster', B(w + 0.005, legH - 0.12, -0.06, w + 0.06, legH + 0.05, 0.05), solid(0x18181a));
  },
  radio(H) {
    const { b, body, torsoTop, add } = H;
    add(body, 'radio', B(b.torsoW * 0.18, torsoTop - 0.14, -b.torsoD / 2 - 0.03, b.torsoW * 0.32, torsoTop - 0.03, -b.torsoD / 2), solid(BLACK, (ctx, x, y, w, h, side) => { if (side === 'front') fill(ctx, x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.3, 0x3a3a3a); }));
  },
  /** Firefighter: wide-brimmed helmet with a front shield, full face mask with regulator, air tank. */
  fireHelmet(H) {
    const { hs, head, add } = H, shell = 0xb8891a;
    add(head, 'helmet', B(-hs * 0.58, hs * 0.82, -hs * 0.58, hs * 0.58, hs * 1.14, hs * 0.58), solid(shell, (ctx, x, y, w, h, side) => { if (side === 'top') fill(ctx, x + w * 0.45, y, w * 0.1, h, shade(shell, 0.8)); }));
    add(head, 'helmet-brim', B(-hs * 0.72, hs * 0.8, -hs * 0.7, hs * 0.72, hs * 0.86, hs * 0.98), solid(shade(shell, 0.85)));
    add(head, 'helmet-shield', B(-hs * 0.2, hs * 0.86, -hs * 0.63, hs * 0.2, hs * 1.18, -hs * 0.58), solid(0x8a1c1c, (ctx, x, y, w, h, side) => { if (side === 'front') { fill(ctx, x + w * 0.25, y + h * 0.25, w * 0.5, h * 0.5, 0xe0d8c0); fill(ctx, x + w * 0.4, y + h * 0.35, w * 0.2, h * 0.3, 0x8a1c1c); } }));
  },
  fireMask(H) {
    const { hs, head, add } = H;
    add(head, 'mask', B(-hs * 0.44, hs * 0.1, -hs * 0.5 - 0.035, hs * 0.44, hs * 0.84, -hs * 0.5), solid(BLACK, (ctx, x, y, w, h, side) => {
      if (side !== 'front') return;
      // A clear visor: the dim face behind it, a glare across it.
      fill(ctx, x + w * 0.1, y + h * 0.08, w * 0.8, h * 0.62, 0x5a6c74);
      fill(ctx, x + w * 0.26, y + h * 0.32, w * 0.12, h * 0.1, 0x101010); fill(ctx, x + w * 0.62, y + h * 0.32, w * 0.12, h * 0.1, 0x101010);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + w * 0.16, y + h * 0.12, w * 0.14, h * 0.5);
    }));
    add(head, 'regulator', B(-hs * 0.13, hs * 0.08, -hs * 0.5 - 0.1, hs * 0.13, hs * 0.32, -hs * 0.5 - 0.03), solid(0x2a2a2c, (ctx, x, y, w, h, side) => { if (side === 'front') fill(ctx, x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4, 0x555555); }));
  },
  airTank(H) {
    const { b, body, torsoTop, add } = H, d = b.torsoD / 2;
    add(body, 'air-tank', B(-0.095, torsoTop - 0.58, d, 0.095, torsoTop - 0.06, d + 0.18), solid(0xb0b4b8, (ctx, x, y, w, h, side) => { if (side !== 'top' && side !== 'bottom') { band(ctx, x, y, w, h, 0x7a7e82, 0.1, 0.06); band(ctx, x, y, w, h, 0xd0a020, 0.8, 0.05); } }));
    add(body, 'air-valve', B(-0.03, torsoTop - 0.06, d + 0.06, 0.03, torsoTop + 0.02, d + 0.12), solid(0x333333));
  },
  /** Soldier: helmet with goggles, plate carrier with pouches, knee pads. */
  combatHelmet(H) {
    const { hs, head, add, recipe } = H, olive = recipe.outfit.helmet ?? recipe.outfit.camo?.[0] ?? 0x4a5236;
    add(head, 'helmet', B(-hs * 0.58, hs * 0.78, -hs * 0.6, hs * 0.58, hs * 1.12, hs * 0.6), solid(olive, (ctx, x, y, w, h, side) => {
      const r = rng(`${recipe.id}|helmet|${side}`);
      if (recipe.outfit.camo && !recipe.outfit.helmet) for (const c of recipe.outfit.camo.slice(1)) { ctx.fillStyle = css(c); for (let i = 0; i < 4; i++) ctx.fillRect(x + r() * w, y + r() * h, w * 0.2, h * 0.15); }
    }));
    add(head, 'goggles', B(-hs * 0.4, hs * 0.86, -hs * 0.63, hs * 0.4, hs * 0.98, -hs * 0.59), solid(0x1a1a1a, (ctx, x, y, w, h, side) => { if (side === 'front') { fill(ctx, x + w * 0.08, y + h * 0.2, w * 0.36, h * 0.6, 0x3a4a3a); fill(ctx, x + w * 0.56, y + h * 0.2, w * 0.36, h * 0.6, 0x3a4a3a); } }));
  },
  tacticalVest(H) {
    const { b, body, legH, torsoTop, add } = H, w = b.torsoW / 2, d = b.torsoD / 2, vest = H.recipe.outfit.vest ?? 0x5b5440, o = H.recipe.outfit;
    const text = H.recipe.outfit.text;
    add(body, 'vest', B(-w - 0.02, legH + b.torsoH * 0.3, -d - 0.035, w + 0.02, torsoTop - 0.05, d + 0.035), solid(vest, (ctx, x, y, ww, hh, side) => {
      if (side === 'front' || side === 'back') band(ctx, x, y, ww, hh, shade(vest, 0.75), 0.15, 0.05);
      // Lettering (a military police vest): big across the back, a small tab over the chest.
      if (text && side === 'back') { fill(ctx, x + ww * 0.1, y + hh * 0.3, ww * 0.8, hh * 0.32, 0x1a1a1a); ctx.fillStyle = '#f0f0f0'; ctx.font = `bold ${Math.round(hh * 0.26)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + ww / 2, y + hh * 0.47); }
      if (text && side === 'front' && o.textFront) { ctx.fillStyle = '#f0f0f0'; ctx.font = `bold ${Math.round(hh * 0.24)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + ww / 2, y + hh * 0.3); }
      else if (text && side === 'front') { fill(ctx, x + ww * 0.3, y + hh * 0.22, ww * 0.4, hh * 0.18, 0x1a1a1a); ctx.fillStyle = '#f0f0f0'; ctx.font = `bold ${Math.round(hh * 0.14)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + ww / 2, y + hh * 0.31); }
    }));
    // A unit insignia on the chest (Marines: eagle, globe and anchor, in gold on black).
    if (o.insignia) add(body, 'insignia', B(-w * 0.75, torsoTop - 0.16, -d - 0.04, -w * 0.4, torsoTop - 0.07, -d - 0.03), solid(0x141414, (ctx, x, y, ww, hh, side) => { if (side === 'front') { fill(ctx, x + ww * 0.3, y + hh * 0.2, ww * 0.4, hh * 0.45, o.insignia); fill(ctx, x + ww * 0.46, y + hh * 0.55, ww * 0.08, hh * 0.3, o.insignia); fill(ctx, x + ww * 0.3, y + hh * 0.75, ww * 0.4, hh * 0.08, o.insignia); } }));
    for (const px of [-0.15, -0.05, 0.05, 0.15]) add(body, 'mag-pouch', B(px - 0.04, legH + b.torsoH * 0.32, -d - 0.075, px + 0.04, legH + b.torsoH * 0.55, -d - 0.035), solid(shade(vest, 0.9), (ctx, x, y, ww, hh, side) => { if (side === 'front') fill(ctx, x, y, ww, hh * 0.25, shade(vest, 0.7)); }));
  },
  kneePads(H) {
    const { b, legs, add } = H;
    for (const L of ['L', 'R']) add(legs[L].shin, `knee-pad.${L}`, B(-b.legW / 2 - 0.01, -0.12, -b.legD / 2 - 0.03, b.legW / 2 + 0.01, 0.03, -b.legD / 2 + 0.02), solid(0x2c2c26));
  },
  /** Hazmat: a hood that encloses the head, a visor with the face dimly behind it, a respirator. */
  hazmatHood(H) {
    const { hs, head, add, recipe } = H, suit = recipe.outfit.top;
    add(head, 'hood', B(-hs * 0.62, -0.05, -hs * 0.62, hs * 0.62, hs * 1.14, hs * 0.62), solid(suit, (ctx, x, y, w, h, side) => {
      if (side === 'front') {
        fill(ctx, x + w * 0.12, y + h * 0.18, w * 0.76, h * 0.42, 0x1b2f3a);
        fill(ctx, x + w * 0.28, y + h * 0.34, w * 0.1, h * 0.07, 0x0a0a0a); fill(ctx, x + w * 0.62, y + h * 0.34, w * 0.1, h * 0.07, 0x0a0a0a);
        ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x + w * 0.16, y + h * 0.2, w * 0.1, h * 0.38);
        fill(ctx, x + w * 0.1, y + h * 0.16, w * 0.8, h * 0.03, 0x2a2a2a);
      }
      if (side !== 'top' && side !== 'bottom') band(ctx, x, y, w, h, shade(suit, 0.8), 0.92, 0.05);
    }));
    add(head, 'respirator', B(-hs * 0.15, hs * 0.04, -hs * 0.62 - 0.07, hs * 0.15, hs * 0.26, -hs * 0.62), solid(0x2a2a2a));
    for (const s of [-1, 1]) add(head, 'filter', B(s * hs * 0.32 - 0.045, hs * 0.02, -hs * 0.62 - 0.08, s * hs * 0.32 + 0.045, hs * 0.16, -hs * 0.62 - 0.01), solid(0x8a6a1e, (ctx, x, y, w, h, side) => { if (side === 'front') fill(ctx, x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.6, 0x5a4410); }));
  },
  /** Miner: a hard hat with a headlamp (its lens glows) and the lamp's battery on the belt. */
  minerHelmet(H) {
    const { hs, head, add, recipe } = H, shell = 0xd6c44a;
    const dusty = (base) => (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, base); blobs(ctx, x, y, w, h, 0x2e2a26, 3, Math.min(w, h) * 0.25, rng(`${recipe.id}|helmet|${side}`)); };
    add(head, 'helmet', B(-hs * 0.56, hs * 0.8, -hs * 0.58, hs * 0.56, hs * 1.12, hs * 0.56), dusty(shell));
    add(head, 'helmet-ridge', B(-hs * 0.07, hs * 1.12, -hs * 0.5, hs * 0.07, hs * 1.17, hs * 0.5), dusty(shade(shell, 0.9)));
    add(head, 'helmet-brim', B(-hs * 0.62, hs * 0.78, -hs * 0.72, hs * 0.62, hs * 0.83, hs * 0.62), dusty(shade(shell, 0.85)));
    add(head, 'lamp', B(-hs * 0.12, hs * 0.86, -hs * 0.7, hs * 0.12, hs * 1.04, -hs * 0.58), solid(0x2a2a2a));
    add(head, 'lamp-lens', B(-hs * 0.085, hs * 0.89, -hs * 0.72, hs * 0.085, hs * 1.01, -hs * 0.7), solid(0xfff0a8, (ctx, x, y, w, h, side) => { if (side === 'front') fill(ctx, x + w * 0.25, y + h * 0.25, w * 0.5, h * 0.5, 0xffffff); }), { glow: true });
    add(head, 'lamp-cable', B(-0.01, hs * 0.2, hs * 0.5, 0.01, hs * 0.86, hs * 0.54), solid(0x1a1a1a));
  },
  lampBattery(H) {
    const { b, body, legH, add } = H, d = b.torsoD / 2;
    add(body, 'lamp-battery', B(-0.08, legH + 0.01, d, 0.08, legH + 0.13, d + 0.06), solid(0x2a2a2c, (ctx, x, y, w, h, side) => { if (side === 'back') fill(ctx, x + w * 0.2, y + h * 0.3, w * 0.6, h * 0.15, 0xb0a040); }));
  },
  // ── Archetypes (archetypes.js): clothes and props that say who the zombie was ──────────────
  /** A long-skirted dress or robe: a skirt block from the waist down (`outfit.skirt`: length in m). */
  skirt(H) {
    const { b, body, legH, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, len = recipe.outfit.skirt ?? 0.45, c = recipe.outfit.skirtColor ?? recipe.outfit.top;
    add(body, 'skirt', B(-w - 0.03, legH - len, -d - 0.04, w + 0.03, legH + 0.06, d + 0.04), (ctx, x, y, ww, hh, side) => {
      fill(ctx, x, y, ww, hh, c);
      if (side !== 'top' && side !== 'bottom') { band(ctx, x, y, ww, hh, shade(c, 0.82), 0.9, 0.1); blood(ctx, x, y, ww, hh, 1, rng(`${recipe.id}|skirt|${side}`)); }
    });
  },
  beard(H) {
    const { hs, head, add, recipe } = H, c = recipe.beard ?? recipe.hair ?? 0x8a8a80;
    add(head, 'beard', B(-hs * 0.4, -hs * 0.28, -hs * 0.54, hs * 0.4, hs * 0.3, -hs * 0.3), solid(c, (ctx, x, y, w, h, side) => { if (side === 'front') for (let i = 0; i < w; i += 4) fill(ctx, x + i, y, 1, h, shade(c, 0.8)); }));
  },
  veil(H) {
    const { hs, head, add, recipe } = H, c = recipe.veil ?? 0x1a181e, long = recipe.veilLength ?? 0.5;
    add(head, 'veil-top', B(-hs * 0.56, hs * 0.94, -hs * 0.56, hs * 0.56, hs * 1.06, hs * 0.56), solid(c));
    add(head, 'veil-back', B(-hs * 0.58, hs * 0.94 - long, hs * 0.5, hs * 0.58, hs * 1.04, hs * 0.6), solid(c, (ctx, x, y, w, h) => { ctx.globalAlpha = 0.25; fill(ctx, x, y, w, h, 0xffffff); ctx.globalAlpha = 1; }));
    if (recipe.veilFace) add(head, 'veil-front', B(-hs * 0.52, hs * 0.55, -hs * 0.53, hs * 0.52, hs * 0.94, -hs * 0.51), (ctx, x, y, w, h) => { ctx.globalAlpha = 0.45; fill(ctx, x, y, w, h, c); ctx.globalAlpha = 1; });
  },
  strawHat(H) {
    const { hs, head, add, recipe } = H, straw = 0xd2b866;
    const weave = (ctx, x, y, w, h) => { fill(ctx, x, y, w, h, straw); for (let i = 0; i < w; i += 3) fill(ctx, x + i, y, 1, h, shade(straw, 0.85)); blobs(ctx, x, y, w, h, shade(straw, 0.7), 2, 4, rng(`${recipe.id}|straw`)); };
    add(head, 'hat-brim', B(-hs * 0.95, hs * 0.86, -hs * 0.95, hs * 0.95, hs * 0.91, hs * 0.95), weave);
    add(head, 'hat-crown', B(-hs * 0.5, hs * 0.9, -hs * 0.5, hs * 0.5, hs * 1.22, hs * 0.5), (ctx, x, y, w, h, side) => { weave(ctx, x, y, w, h); if (side !== 'top' && side !== 'bottom') band(ctx, x, y, w, h, 0x7a2a1a, 0.62, 0.22); });
  },
  glasses(H) {
    const { hs, head, add } = H;
    add(head, 'glasses', B(-hs * 0.46, hs * 0.48, -hs * 0.52, hs * 0.46, hs * 0.6, -hs * 0.5), solid(0x1a1a1a, (ctx, x, y, w, h, side) => { if (side === 'front') { fill(ctx, x + w * 0.08, y + h * 0.2, w * 0.36, h * 0.6, 0x9ab0b8); fill(ctx, x + w * 0.56, y + h * 0.2, w * 0.36, h * 0.6, 0x9ab0b8); } }));
  },
  headphones(H) {
    const { hs, head, add, recipe } = H, c = recipe.gadget ?? 0x2a2a2e;
    add(head, 'headphones-band', B(-hs * 0.58, hs * 1.0, -hs * 0.06, hs * 0.58, hs * 1.08, hs * 0.06), solid(c));
    for (const s of [-1, 1]) add(head, 'headphones-cup', B(s > 0 ? hs * 0.5 : -hs * 0.6, hs * 0.38, -hs * 0.14, s > 0 ? hs * 0.6 : -hs * 0.5, hs * 0.66, hs * 0.14), solid(c, (ctx, x, y, w, h, side) => { if (side === 'right' || side === 'left') fill(ctx, x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4, 0xc03030); }));
  },
  /** Cracked skull: a piece of the crown gone, the brain showing, bone shards around it. */
  crackedSkull(H) {
    const { hs, head, add } = H;
    add(head, 'skull-wound', B(-hs * 0.32, hs * 0.92, -hs * 0.28, hs * 0.18, hs * 1.03, hs * 0.18), solid(0x8a3a44, (ctx, x, y, w, h, side) => { if (side === 'top') for (let i = 0; i < 4; i++) fill(ctx, x + w * (0.15 + i * 0.2), y + h * 0.2, 2, h * 0.6, 0x5a1a22); }));
    for (const [x, z] of [[-0.36, -0.3], [0.2, -0.3], [-0.36, 0.2], [0.22, 0.18]]) add(head, 'skull-shard', B(hs * x, hs * 0.98, hs * z, hs * (x + 0.1), hs * 1.06, hs * (z + 0.1)), solid(0xe0d8c0));
  },
  topHat(H) {
    const { hs, head, add } = H;
    add(head, 'hat-brim', B(-hs * 0.7, hs * 0.92, -hs * 0.7, hs * 0.7, hs * 0.96, hs * 0.7), solid(0x141416));
    add(head, 'hat-crown', B(-hs * 0.45, hs * 0.95, -hs * 0.45, hs * 0.45, hs * 1.55, hs * 0.45), solid(0x18181c, (ctx, x, y, w, h, side) => { if (side !== 'top' && side !== 'bottom') band(ctx, x, y, w, h, 0x3a3a40, 0.8, 0.12); }));
  },
  /** Drowned: strands of weed hanging from the head and shoulders. */
  seaweed(H) {
    const { hs, head, body, b, torsoTop, add, recipe } = H, weed = 0x3a5a2a, r = rng(`${recipe.id}|weed`);
    for (let i = 0; i < 4; i++) { const x = (r() - 0.5) * hs * 0.8; add(head, 'weed', B(x - 0.012, hs * (0.3 + r() * 0.3), hs * 0.5, x + 0.012, hs * 1.04, hs * 0.53), solid(weed)); }
    for (const s of [-1, 1]) add(body, 'weed', B(s * b.torsoW * 0.3 - 0.015, torsoTop - 0.4, -b.torsoD / 2 - 0.012, s * b.torsoW * 0.3 + 0.015, torsoTop + 0.02, -b.torsoD / 2), solid(shade(weed, 1.2)));
  },
  bouquet(H) {
    const { arms, b, add } = H, hand = arms.R.hand;
    add(hand, 'bouquet-stems', B(-0.02, -b.hand - 0.12, -0.02, 0.02, -b.hand * 0.3, 0.02), solid(0x4a6a30));
    add(hand, 'bouquet-flowers', B(-0.07, -b.hand - 0.22, -0.07, 0.07, -b.hand - 0.11, 0.07), (ctx, x, y, w, h) => { fill(ctx, x, y, w, h, 0x6a3a40); blobs(ctx, x, y, w, h, 0xd8d0c8, 4, 4, rng('bouquet')); });
  },
  beret(H) {
    const { hs, head, add, recipe } = H, c = recipe.hat ?? 0x3a4a2a;
    add(head, 'beret', B(-hs * 0.56, hs * 0.92, -hs * 0.5, hs * 0.6, hs * 1.12, hs * 0.56), solid(c, (ctx, x, y, w, h, side) => { if (side === 'front') fill(ctx, x + w * 0.2, y + h * 0.3, w * 0.14, h * 0.4, 0xc0a040); }));
  },
  shawl(H) {
    const { b, body, torsoTop, add, recipe } = H, c = recipe.shawl ?? 0x5a3a4a, w = b.torsoW / 2, d = b.torsoD / 2;
    add(body, 'shawl', B(-w - 0.04, torsoTop - 0.28, -d - 0.03, w + 0.04, torsoTop + 0.03, d + 0.03), solid(c, (ctx, x, y, ww, hh, side) => { if (side !== 'top' && side !== 'bottom') for (let i = 0; i < ww; i += 5) fill(ctx, x + i, y + hh * 0.85, 2, hh * 0.15, shade(c, 0.7)); }));
  },
  cane(H) {
    const { arms, b, torsoTop, add } = H;
    // From the hand down to the ground (the hand hangs at shoulder height minus the arm).
    const toGround = torsoTop - 0.02 - b.upperArm - b.forearm;
    add(arms.R.hand, 'cane', B(-0.015, -toGround + 0.01, -0.015, 0.015, -b.hand * 0.4, 0.015), solid(0x4a3020));
    add(arms.R.hand, 'cane-handle', B(-0.015, -b.hand * 0.5, -0.07, 0.015, -b.hand * 0.4 + 0.02, 0.015), solid(0x4a3020));
  },
  surgicalCap(H) {
    const { hs, head, add } = H;
    add(head, 'surgical-cap', B(-hs * 0.53, hs * 0.72, -hs * 0.53, hs * 0.53, hs * 1.06, hs * 0.53), solid(0x4a8a9a, (ctx, x, y, w, h) => blobs(ctx, x, y, w, h, 0x3a7080, 3, 3, rng('cap'))));
  },
  surgicalMask(H) {
    const { hs, head, add } = H;
    add(head, 'surgical-mask', B(-hs * 0.4, hs * 0.08, -hs * 0.53, hs * 0.4, hs * 0.42, -hs * 0.5), solid(0x9ac0c8, (ctx, x, y, w, h, side) => { if (side === 'front') { for (const k of [0.3, 0.55, 0.8]) band(ctx, x, y, w, h, 0x82a8b0, k, 0.06); blood(ctx, x, y, w, h, 1, rng('mask')); } }));
    for (const s of [-1, 1]) add(head, 'mask-strap', B(s > 0 ? hs * 0.49 : -hs * 0.51, hs * 0.3, -hs * 0.5, s > 0 ? hs * 0.51 : -hs * 0.49, hs * 0.34, hs * 0.2), solid(0xe0e0e0));
  },
  truckerCap(H) {
    const { hs, head, add, recipe } = H, c = recipe.hat ?? 0x8a2a2a;
    add(head, 'cap', B(-hs * 0.53, hs * 0.82, -hs * 0.53, hs * 0.53, hs * 1.08, hs * 0.53), solid(c, (ctx, x, y, w, h, side) => { if (side === 'back' || side === 'left' || side === 'right') fill(ctx, x, y, w, h * 0.7, 0xe8e4d8); if (side === 'front') fill(ctx, x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.3, 0xe8e4d8); }));
    add(head, 'cap-bill', B(-hs * 0.42, hs * 0.82, -hs * 0.53 - 0.09, hs * 0.42, hs * 0.86, -hs * 0.53), solid(c));
  },
  bandanaNeck(H) {
    const { b, body, torsoTop, add, hs } = H;
    add(body, 'bandana', B(-hs * 0.38, torsoTop - 0.04, -b.torsoD / 2 - 0.02, hs * 0.38, torsoTop + 0.03, b.torsoD / 2 * 0.6), solid(0xa02a2a, (ctx, x, y, w, h) => blobs(ctx, x, y, w, h, 0xe0d0c0, 3, 2, rng('bandana'))));
    add(body, 'bandana-tip', B(-0.04, torsoTop - 0.12, -b.torsoD / 2 - 0.025, 0.04, torsoTop - 0.03, -b.torsoD / 2 - 0.005), solid(0xa02a2a));
  },
  /** Torn: the left forearm and hand torn away, a bone stub and ragged flesh left. */
  missingForearm(H) {
    const { arms, b, add, remove } = H;
    remove((n) => n === 'forearm.L' || n === 'hand.L');
    add(arms.L.fore, 'stub-flesh', C(b.armW * 0.95, -0.06, 0, b.armD * 0.95), solid(0x6e1a1a));
    add(arms.L.fore, 'stub-bone', C(0.04, -0.14, -0.05, 0.04), solid(0xe8e0c8));
  },
  /** Doctor: the lab coat's tails below the waist, open at the front. */
  coatTails(H) {
    const { b, body, legH, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, c = recipe.outfit.top, len = 0.42;
    const cloth = (ctx, x, y, ww, hh, side) => { fill(ctx, x, y, ww, hh, c); if (side !== 'top' && side !== 'bottom') { band(ctx, x, y, ww, hh, shade(c, 0.85), 0.92, 0.08); blood(ctx, x, y, ww, hh, 1, rng(`${recipe.id}|tails|${side}`)); } };
    add(body, 'coat-back', B(-w - 0.02, legH - len, d, w + 0.02, legH + 0.04, d + 0.025), cloth);
    for (const s of [-1, 1]) {
      add(body, 'coat-side', B(s > 0 ? w : -w - 0.025, legH - len, -d - 0.02, s > 0 ? w + 0.025 : -w, legH + 0.04, d + 0.02), cloth);
      add(body, 'coat-front', B(s > 0 ? w * 0.36 : -w - 0.02, legH - len, -d - 0.025, s > 0 ? w + 0.02 : -w * 0.36, legH + 0.04, -d), cloth);
    }
  },
  /** A stethoscope round the neck: tubes down the chest, earpieces, the chest piece. */
  stethoscope(H) {
    const { b, body, torsoTop, add } = H, d = b.torsoD / 2, tube = 0x1a1a1e, steel = 0xc0c4c8;
    add(body, 'steth-neck', B(-0.1, torsoTop - 0.015, -d - 0.02, 0.1, torsoTop + 0.01, d * 0.5), solid(tube));
    add(body, 'steth-left', B(-0.1, torsoTop - 0.28, -d - 0.02, -0.08, torsoTop, -d - 0.005), solid(tube));
    add(body, 'steth-right', B(0.08, torsoTop - 0.2, -d - 0.02, 0.1, torsoTop, -d - 0.005), solid(tube));
    add(body, 'steth-ears', B(0.07, torsoTop - 0.23, -d - 0.03, 0.13, torsoTop - 0.2, -d - 0.005), solid(steel));
    add(body, 'steth-chestpiece', B(-0.125, torsoTop - 0.33, -d - 0.035, -0.055, torsoTop - 0.27, -d - 0.005), solid(steel, (ctx, x, y, w, h, side) => { if (side === 'front') fill(ctx, x + w * 0.25, y + h * 0.25, w * 0.5, h * 0.5, 0x8a8e92); }));
  },
  /** A hospital ID badge on a lanyard. */
  idBadge(H) {
    const { b, body, torsoTop, add } = H, d = b.torsoD / 2;
    // The lanyard lies on the chest (touching it), the card hangs from it.
    add(body, 'lanyard', B(0.13, torsoTop - 0.3, -d - 0.012, 0.15, torsoTop - 0.02, -d + 0.002), solid(0x2a5ab0));
    add(body, 'badge-card', B(0.1, torsoTop - 0.4, -d - 0.016, 0.18, torsoTop - 0.29, -d - 0.006), solid(0xf0f0f0, (ctx, x, y, w, h, side) => { if (side === 'front') { fill(ctx, x + w * 0.15, y + h * 0.15, w * 0.35, h * 0.4, 0x8a9aa8); fill(ctx, x + w * 0.15, y + h * 0.65, w * 0.7, h * 0.08, 0x2a5ab0); fill(ctx, x + w * 0.15, y + h * 0.8, w * 0.5, h * 0.06, 0x3a3a3a); } }));
  },
  /** A surgical mask pulled down under the chin. */
  maskDown(H) {
    const { hs, head, add } = H;
    add(head, 'mask-down', B(-hs * 0.42, -hs * 0.08, -hs * 0.56, hs * 0.42, hs * 0.14, -hs * 0.2), solid(0x9ac0c8, (ctx, x, y, w, h, side) => { if (side === 'front') band(ctx, x, y, w, h, 0x82a8b0, 0.45, 0.12); }));
    for (const s of [-1, 1]) add(head, 'mask-strap', B(s > 0 ? hs * 0.49 : -hs * 0.51, hs * 0.05, -hs * 0.5, s > 0 ? hs * 0.51 : -hs * 0.49, hs * 0.38, hs * 0.1), solid(0xe0e0e0));
  },
  /** Raider: a bandana tied over the nose and mouth. */
  faceBandana(H) {
    const { hs, head, add, recipe } = H, c = recipe.bandana ?? 0x8a1a1a;
    add(head, 'face-bandana', B(-hs * 0.53, hs * 0.0, -hs * 0.535, hs * 0.53, hs * 0.44, hs * 0.53), solid(c, (ctx, x, y, w, h, side) => { blobs(ctx, x, y, w, h, 0xe0d0c0, 4, 2, rng(`${recipe.id}|bandana|${side}`)); if (side === 'back') fill(ctx, x + w * 0.4, y + h * 0.3, w * 0.2, h * 0.5, shade(c, 0.8)); }));
    add(head, 'bandana-knot', B(-hs * 0.08, hs * 0.1, hs * 0.53, hs * 0.08, hs * 0.3, hs * 0.62), solid(shade(c, 0.85)));
  },
  // ── Mutants: the shapes their effects come from ─────────────────────────────────────────
  /** Boomer: rolls of fat round the middle and a belly that heaves (its own fx node). */
  fatRolls(H) {
    const { b, body, legH, add, skin, recipe, fx } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    const flesh = (k) => (ctx, x, y, ww, hh, side) => { fill(ctx, x, y, ww, hh, shade(skin, k)); band(ctx, x, y, ww, hh, shade(skin, k * 0.75), 0.85, 0.15); blobs(ctx, x, y, ww, hh, shade(skin, 0.8), 2, 4, rng(`${recipe.id}|roll|${side}`)); };
    for (const [y0, y1, out] of [[0.12, 0.3, 0.06], [0.36, 0.52, 0.045]]) add(body, 'fat-roll', B(-w - out, legH + b.torsoH * y0, -d - out, w + out, legH + b.torsoH * y1, d + out), flesh(0.95));
    const belly = fx.node(body, 'belly', new THREE.Vector3(0, legH + b.torsoH * 0.32, -d));
    add(belly, 'belly', B(-w * 0.75, -b.torsoH * 0.22, -0.16, w * 0.75, b.torsoH * 0.22, 0.02), flesh(1.02));
    H.belly = belly;
  },
  /** Gasbag: cysts all over, each on a node of its own so it can swell (FX cysts). */
  cysts(H) {
    const { b, body, legH, torsoTop, arms, head, hs, add, skin, recipe, fx } = H, r = rng(`${recipe.id}|cysts`), w = b.torsoW / 2, d = b.torsoD / 2;
    const cystC = recipe.cystColor ?? shade(skin, 1.12), cyst = (ctx, x, y, ww, hh) => { fill(ctx, x, y, ww, hh, cystC); fill(ctx, x + ww * 0.25, y + hh * 0.2, ww * 0.35, hh * 0.3, 0xd8d0b0); fill(ctx, x, y + hh * 0.8, ww, hh * 0.2, shade(skin, 0.8)); };
    H.cysts = [];
    const put = (parent, at, s) => { const n = fx.node(parent, 'cyst', at); add(n, 'cyst', B(-s / 2, -s / 2, -s / 2, s / 2, s / 2, s / 2), cyst); H.cysts.push(n); };
    for (let i = 0; i < 7; i++) {
      const face = r() < 0.5 ? -1 : 1, front = r() < 0.6;
      put(body, front ? new THREE.Vector3((r() - 0.5) * w * 1.6, legH + b.torsoH * (0.15 + r() * 0.75), face * 0 - d - 0.01) : new THREE.Vector3(face * (w + 0.01), legH + b.torsoH * (0.2 + r() * 0.6), (r() - 0.5) * d), 0.07 + r() * 0.07);
    }
    for (const L of ['L', 'R']) put(arms[L].upper, new THREE.Vector3(L === 'L' ? -b.armW / 2 - 0.01 : b.armW / 2 + 0.01, -b.upperArm * 0.4, 0), 0.08);
    put(head, new THREE.Vector3(hs * 0.35, hs * 0.75, -hs * 0.5), 0.07);
    void torsoTop;
  },
  /** Scabbed: raised crusts of scar tissue on the torso, shoulders and shins. */
  scabPlates(H) {
    const { skin, recipe } = H;
    crustPlates(H, (ctx, x, y, ww, hh, side) => { fill(ctx, x, y, ww, hh, shade(skin, 0.82)); scabs(ctx, x, y, ww, hh, skin, rng(`${recipe.id}|crust|${side}${ww}`)); });
  },
  /** Scorched: burnt skin mended into raised leathery patches, like crude armour. */
  charPlates(H) {
    const { recipe } = H;
    crustPlates(H, (ctx, x, y, ww, hh, side) => { const r = rng(`${recipe.id}|charcrust|${side}${ww}`); char(ctx, x, y, ww, hh, r); scabs(ctx, x, y, ww, hh, 0x3a302a, r); });
  },
  /** Scorched brute: a cracked shell of melted, blackened skin over the chest, back, shoulders and thighs. */
  charShell(H) {
    const { recipe } = H;
    shellPlates(H, (key) => (ctx, x, y, ww, hh, side) => char(ctx, x, y, ww, hh, rng(`${recipe.id}|charshell|${key}|${side}`)));
  },
  /** Skeletal: bone armour (chest plate, pauldrons, bracers, greaves, a skull ridge) and black goo at the joints. */
  bonePlates(H) {
    const { b, body, legH, torsoTop, arms, legs, head, hs, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    const plate = (k) => (ctx, x, y, ww, hh, side) => bone(ctx, x, y, ww, hh, rng(`${recipe.id}|bone|${k}|${side}`));
    const goo = solid(0x141014, (ctx, x, y, ww, hh) => fill(ctx, x + ww * 0.2, y + hh * 0.2, ww * 0.3, hh * 0.25, 0x3a3440));
    add(body, 'chest-plate', B(-w * 0.85, legH + b.torsoH * 0.45, -d - 0.04, w * 0.85, torsoTop - 0.03, -d + 0.01), plate('chest'));
    add(body, 'ab-plate', B(-w * 0.6, legH + b.torsoH * 0.12, -d - 0.03, w * 0.6, legH + b.torsoH * 0.4, -d + 0.01), plate('abs'));
    add(body, 'back-plate', B(-w * 0.8, legH + b.torsoH * 0.3, d - 0.01, w * 0.8, torsoTop - 0.03, d + 0.04), plate('back'));
    add(body, 'neck-goo', C(hs * 0.66, torsoTop - 0.02, torsoTop + 0.04, hs * 0.66), goo);
    add(head, 'skull-ridge', B(-hs * 0.12, hs * 0.92, -hs * 0.56, hs * 0.12, hs * 1.12, hs * 0.5), plate('ridge'));
    for (const L of ['L', 'R']) {
      const sx = L === 'L' ? -1 : 1;
      add(arms[L].upper, 'pauldron', B(-b.armW * 0.75, -0.12, -b.armD * 0.75, b.armW * 0.75, 0.06, b.armD * 0.75), plate(`p${L}`));
      add(arms[L].fore, 'bracer', C(b.armW * 1.15, -b.forearm * 0.85, -b.forearm * 0.15, b.armD * 1.15), plate(`b${L}`));
      add(arms[L].fore, 'elbow-goo', C(b.armW * 1.05, -0.03, 0.03, b.armD * 1.05), goo);
      add(legs[L].shin, 'greave', B(-b.legW * 0.6, -b.shin * 0.85, -b.legD * 0.6 - 0.02, b.legW * 0.6, -b.shin * 0.1, -b.legD * 0.3), plate(`g${L}`));
      add(legs[L].shin, 'knee-goo', C(b.legW * 1.04, -0.03, 0.03, b.legD * 1.04), goo);
      void sx;
    }
  },
  /**
   * Skeletal: the body is bare bone and muscle. The solid torso and limbs are replaced by a rib
   * cage (ribs with gaps, sternum, spine, collarbone, pelvis) round dark muscle, limb bones with
   * knobbed joints and blocks of exposed muscle, bony hands and feet; black goo at the joints.
   * `recipe.boneScale` thickens everything (the brute).
   */
  skeletalBody(H) {
    const { b, body, legH, torsoTop, arms, legs, add, remove, recipe } = H, k = recipe.boneScale ?? 1, w = b.torsoW / 2, d = b.torsoD / 2;
    remove((n) => /^(torso|neck|upper_arm|forearm|hand|thigh|shin|foot)(\.|$)/.test(n));
    const BONE = (key) => (ctx, x, y, ww, hh, side) => bone(ctx, x, y, ww, hh, rng(`${recipe.id}|${key}|${side}`));
    const MEAT = (key) => (ctx, x, y, ww, hh, side) => muscle(ctx, x, y, ww, hh, rng(`${recipe.id}|${key}|${side}`));
    const goo = solid(0x141014, (ctx, x, y, ww, hh) => fill(ctx, x + ww * 0.2, y + hh * 0.2, ww * 0.3, hh * 0.25, 0x3a3440));
    // Torso: muscle and organs inside, the rib cage round them.
    add(body, 'core', C(b.torsoW * 0.5, legH + b.torsoH * 0.15, torsoTop - 0.06, b.torsoD * 0.5), MEAT('core'));
    add(body, 'spine', C(0.06 * k, legH - 0.02, torsoTop + 0.03, 0.06 * k, 0, d * 0.6), BONE('spine'));
    add(body, 'sternum', C(0.05 * k, torsoTop - b.torsoH * 0.55, torsoTop - 0.05, 0.035 * k, 0, -d + 0.02), BONE('sternum'));
    add(body, 'collarbone', B(-w - 0.01, torsoTop - 0.05, -d * 0.4, w + 0.01, torsoTop, d * 0.2), BONE('collar'));
    const ribs = 5, t = 0.028 * k;
    for (let i = 0; i < ribs; i++) {
      const y = torsoTop - 0.09 - i * (b.torsoH * 0.55) / ribs, rw = w * (0.95 - i * 0.04);
      for (const s of [-1, 1]) {
        add(body, 'rib', B(s > 0 ? 0.025 : -rw, y - t, -d, s > 0 ? rw : -0.025, y, -d + t), BONE(`rf${i}${s}`));
        add(body, 'rib', B(s > 0 ? rw - t : -rw, y - t, -d, s > 0 ? rw : -rw + t, y, d * 0.6), BONE(`rs${i}${s}`));
        add(body, 'rib', B(s > 0 ? 0 : -rw, y - t, d * 0.6 - t, s > 0 ? rw : 0, y, d * 0.6), BONE(`rb${i}${s}`));
      }
    }
    add(body, 'pelvis', B(-w * 0.78, legH - 0.05, -d * 0.55, w * 0.78, legH + 0.11, d * 0.55), (ctx, x, y, ww, hh, side) => { bone(ctx, x, y, ww, hh, rng(`${recipe.id}|pelvis|${side}`)); if (side === 'front') { fill(ctx, x + ww * 0.2, y + hh * 0.3, ww * 0.18, hh * 0.45, 0x2a1a1a); fill(ctx, x + ww * 0.62, y + hh * 0.3, ww * 0.18, hh * 0.45, 0x2a1a1a); } });
    // Arms.
    for (const L of ['L', 'R']) {
      const { upper, fore, hand } = arms[L];
      add(upper, `humerus.${L}`, C(0.05 * k, -b.upperArm, 0.02, 0.05 * k), BONE(`hum${L}`));
      add(upper, `biceps.${L}`, C(b.armW * 0.75, -b.upperArm * 0.8, -0.05, b.armD * 0.55, 0, -b.armD * 0.15), MEAT(`bic${L}`));
      add(upper, `shoulder.${L}`, C(0.09 * k, -0.06, 0.03, 0.09 * k), BONE(`sh${L}`));
      add(fore, `elbow.${L}`, C(0.08 * k, -0.04, 0.03, 0.08 * k), goo);
      for (const s of [-1, 1]) add(fore, `forearm-bone.${L}`, C(0.028 * k, -b.forearm, -0.02, 0.03 * k, s * 0.022 * k), BONE(`fa${L}${s}`));
      add(fore, `forearm-muscle.${L}`, C(b.armW * 0.6, -b.forearm * 0.55, -0.04, b.armD * 0.45, 0, b.armD * 0.12), MEAT(`fm${L}`));
      add(hand, `palm.${L}`, C(b.handW * 0.75, -b.hand * 0.45, 0, 0.035 * k), BONE(`palm${L}`));
      for (const fx of [-0.3, -0.1, 0.1, 0.3]) add(hand, `finger.${L}`, C(0.014 * k, -b.hand * 1.05, -b.hand * 0.42, 0.016 * k, fx * b.handW), BONE(`fi${L}${fx}`));
    }
    // Legs.
    for (const L of ['L', 'R']) {
      const { thigh, shin } = legs[L];
      if (!shin) continue;
      add(thigh, `femur.${L}`, C(0.06 * k, -b.thigh, 0.02, 0.06 * k), BONE(`fem${L}`));
      add(thigh, `thigh-muscle.${L}`, C(b.legW * 0.8, -b.thigh * 0.85, -0.06, b.legD * 0.55, 0, -b.legD * 0.15), MEAT(`tm${L}`));
      add(shin, `knee.${L}`, C(0.09 * k, -0.045, 0.035, 0.09 * k), goo);
      add(shin, `tibia.${L}`, C(0.05 * k, -b.shin, -0.02, 0.05 * k), BONE(`tib${L}`));
      add(shin, `calf.${L}`, C(b.legW * 0.55, -b.shin * 0.6, -0.08, b.legD * 0.4, 0, b.legD * 0.18), MEAT(`calf${L}`));
      add(shin, `foot-bone.${L}`, B(-b.legW * 0.4, -b.shin - b.foot, b.legD / 2 - b.footD * 0.9, b.legW * 0.4, -b.shin - b.foot * 0.3, b.legD / 2 - 0.02), BONE(`ft${L}`));
      add(shin, `heel.${L}`, C(0.06 * k, -b.shin - b.foot, -b.shin + 0.01, 0.06 * k, 0, b.legD * 0.2), BONE(`heel${L}`));
    }
  },
  /** Skeletal brute: distorted plates of calcified bone grown over the shoulders and back. */
  calcified(H) {
    const { b, body, legH, torsoTop, arms, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    const plate = (k) => (ctx, x, y, ww, hh, side) => bone(ctx, x, y, ww, hh, rng(`${recipe.id}|calc|${k}|${side}`));
    add(body, 'calc-back', B(-w * 0.85, legH + b.torsoH * 0.35, d * 0.6, w * 0.85, torsoTop - 0.02, d * 0.6 + 0.06), plate('back'));
    for (const L of ['L', 'R']) add(arms[L].upper, 'calc-pauldron', B(-b.armW * 0.7, -0.14, -b.armD * 0.7, b.armW * 0.7, 0.07, b.armD * 0.7), plate(`p${L}`));
  },
  /** Skeletal brute: calcified spikes jutting from the shoulders and back. */
  boneSpikes(H) {
    const { b, body, torsoTop, arms, add, recipe } = H, d = b.torsoD / 2;
    const plate = (k) => (ctx, x, y, ww, hh, side) => bone(ctx, x, y, ww, hh, rng(`${recipe.id}|spike|${k}|${side}`));
    for (const [x, y, h] of [[-0.18, -0.12, 0.2], [0, -0.06, 0.26], [0.18, -0.12, 0.2], [-0.1, -0.35, 0.16], [0.1, -0.35, 0.16]]) add(body, 'back-spike', B(x - 0.035, torsoTop + y, d + 0.03, x + 0.035, torsoTop + y + 0.07, d + 0.03 + h), plate(`b${x}${y}`));
    for (const L of ['L', 'R']) add(arms[L].upper, 'shoulder-spike', B(-0.03, 0.04, -0.03, 0.03, 0.22, 0.03), plate(`s${L}`));
  },
  // ── Variants (batch 2): the gear that sets each variant apart from its base ─────────────
  /** Prisoner: steel cuffs on both wrists, a snapped chain hanging from one. */
  cuffs(H) {
    const { b, arms, add } = H, steel = 0x8a8e92, fw = b.armW * (b.forearmK ?? 0.95), fd = b.armD * 0.95;
    const metal = solid(steel, (ctx, x, y, w, h, side) => { if (side !== 'top' && side !== 'bottom') band(ctx, x, y, w, h, 0xc8ccd0, 0.3, 0.2); });
    for (const L of ['L', 'R']) add(arms[L].fore, `cuff.${L}`, C(fw + 0.03, -b.forearm + 0.005, -b.forearm + 0.05, fd + 0.03), metal);
    for (let i = 0; i < 3; i++) {
      const y = -b.forearm - 0.01 - i * 0.045;
      add(arms.R.fore, 'chain-link', i % 2 ? C(0.014, y - 0.04, y, 0.04, 0, -fd / 2 - 0.03) : C(0.04, y - 0.04, y, 0.014, 0, -fd / 2 - 0.03), solid(shade(steel, 0.9)));
    }
  },
  /** Military: a soft patrol cap in the uniform's camo (or plain), with a short brim. */
  patrolCap(H) {
    const { hs, head, add, recipe } = H, o = recipe.outfit, c = o.cap ?? o.camo?.[0] ?? o.top;
    add(head, 'cap', B(-hs * 0.53, hs * 0.84, -hs * 0.53, hs * 0.53, hs * 1.06, hs * 0.53), solid(c, (ctx, x, y, w, h, side) => {
      const r = rng(`${recipe.id}|cap|${side}`);
      if (o.camo && !o.cap) for (const k of o.camo.slice(1)) { ctx.fillStyle = css(k); for (let i = 0; i < 3; i++) ctx.fillRect(x + r() * w, y + r() * h, w * 0.22, h * 0.18); }
      if (side !== 'top' && side !== 'bottom') band(ctx, x, y, w, h, shade(c, 0.75), 0.88, 0.1);
    }));
    add(head, 'cap-brim', B(-hs * 0.4, hs * 0.84, -hs * 0.53 - 0.07, hs * 0.4, hs * 0.88, -hs * 0.53), solid(shade(c, 0.85)));
  },
  /** Sailor: a battered navy cap beaten down into the skull, crooked, with blood from under it. */
  sailorCap(H) {
    const { hs, head, add, recipe } = H, navy = 0x1c2638;
    const tilt = joint(head, 'cap_tilt', 0, hs * 0.8, 0);
    tilt.rotation.set(0.12, 0, 0.22);
    add(tilt, 'cap', B(-hs * 0.55, -hs * 0.1, -hs * 0.55, hs * 0.55, hs * 0.16, hs * 0.55), solid(navy, (ctx, x, y, w, h, side) => {
      const r = rng(`${recipe.id}|cap|${side}`);
      blobs(ctx, x, y, w, h, shade(navy, 0.6), 2, Math.min(w, h) * 0.3, r);
      if (side === 'front') { fill(ctx, x + w * 0.3, y + h * 0.25, w * 0.4, h * 0.3, 0xd0b050); fill(ctx, x + w * 0.38, y + h * 0.32, w * 0.24, h * 0.16, navy); }
      if (side === 'top') fill(ctx, x + w * 0.2, y + h * 0.4, w * 0.5, h * 0.2, shade(navy, 0.55));
    }));
    add(tilt, 'cap-brim', B(-hs * 0.42, -hs * 0.1, -hs * 0.55 - 0.08, hs * 0.42, -hs * 0.06, -hs * 0.55), solid(shade(navy, 0.8)));
    add(head, 'cap-blood', B(hs * 0.3, hs * 0.45, -hs * 0.505, hs * 0.38, hs * 0.82, -hs * 0.49), solid(0x5a0e0e));
  },
  /** Naval officer: a white-topped peaked cap with a black band, gold badge and black visor. */
  officerCap(H) {
    const { hs, head, add } = H, white = 0xe8e6e0;
    add(head, 'cap-band', B(-hs * 0.53, hs * 0.82, -hs * 0.53, hs * 0.53, hs * 0.98, hs * 0.53), solid(BLACK, (ctx, x, y, w, h, side) => {
      if (side === 'front') { fill(ctx, x + w * 0.38, y + h * 0.1, w * 0.24, h * 0.8, GOLD); fill(ctx, x + w * 0.45, y + h * 0.25, w * 0.1, h * 0.5, 0xe0e0e0); }
    }));
    add(head, 'cap-crown', B(-hs * 0.62, hs * 0.98, -hs * 0.66, hs * 0.62, hs * 1.1, hs * 0.58), solid(white, (ctx, x, y, w, h, side) => { blobs(ctx, x, y, w, h, 0x8a2020, 1, Math.min(w, h) * 0.2, rng(`officer-cap|${side}`)); }));
    add(head, 'cap-visor', B(-hs * 0.44, hs * 0.8, -hs * 0.53 - 0.08, hs * 0.44, hs * 0.84, -hs * 0.53), solid(BLACK, (ctx, x, y, w, h, side) => { if (side === 'top') fill(ctx, x, y, w, h * 0.2, GOLD); }));
  },
  /** Officer: the chest torn open, ribs and muscle bared through the shredded jacket. */
  tornChest(H) {
    const { b, body, legH, torsoTop, add, recipe } = H, d = b.torsoD / 2, w = b.torsoW / 2;
    const y0 = legH + b.torsoH * 0.35, y1 = torsoTop - 0.1, x0 = -w * 0.15, x1 = w * 0.75;
    add(body, 'chest-wound', B(x0, y0, -d - 0.006, x1, y1, -d + 0.01), (ctx, x, y, ww, hh, side) => muscle(ctx, x, y, ww, hh, rng(`${recipe.id}|wound|${side}`)));
    for (let i = 0; i < 4; i++) {
      const y = y1 - 0.03 - i * (y1 - y0 - 0.04) / 4;
      add(body, 'bare-rib', B(x0 + 0.02, y - 0.022, -d - 0.028, x1 - 0.015, y, -d - 0.004), (ctx, x, yy, ww, hh, side) => bone(ctx, x, yy, ww, hh, rng(`${recipe.id}|rib${i}|${side}`)));
    }
    // Ragged flaps of the jacket peeled back at the edges of the wound.
    add(body, 'flap', B(x1, y0 - 0.02, -d - 0.035, x1 + 0.05, y1 + 0.02, -d - 0.005), solid(shade(recipe.outfit.top, 0.85)));
    add(body, 'flap', B(x0 - 0.05, y0 + 0.04, -d - 0.03, x0, y1, -d - 0.005), solid(shade(recipe.outfit.top, 0.9)));
  },
  /** Kevlar: heavy ballistic panels sewn into the uniform, flesh grown over their edges. */
  kevlarPlates(H) {
    const { b, body, legH, torsoTop, arms, add, skin, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, k = 0x2c3226;
    const panel = (key) => (ctx, x, y, ww, hh, side) => { fill(ctx, x, y, ww, hh, k); band(ctx, x, y, ww, hh, shade(k, 0.7), 0.5, 0.04); if (side !== 'top' && side !== 'bottom') meld(ctx, x, y, ww, hh, skin, rng(`${recipe.id}|kev|${key}|${side}`)); };
    add(body, 'kevlar-front', B(-w - 0.01, legH + b.torsoH * 0.18, -d - 0.05, w + 0.01, torsoTop - 0.03, -d), panel('f'));
    add(body, 'kevlar-back', B(-w - 0.01, legH + b.torsoH * 0.18, d, w + 0.01, torsoTop - 0.03, d + 0.05), panel('b'));
    add(body, 'kevlar-collar', B(-w * 0.7, torsoTop - 0.04, -d - 0.04, w * 0.7, torsoTop + 0.05, d + 0.04), panel('c'));
    for (const L of ['L', 'R']) add(arms[L].upper, `kevlar-shoulder.${L}`, C(b.armW * 1.35, -0.13, 0.04, b.armD * 1.35), panel(`s${L}`));
  },
  /** Gear grown into the body: lumps of raw flesh gripping the collar, cuffs, hems and edges. */
  meldLumps(H) {
    const { b, body, legH, torsoTop, arms, legs, add, skin, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, r = rng(`${recipe.id}|lumps`);
    const flesh = (key) => (ctx, x, y, ww, hh, side) => { fill(ctx, x, y, ww, hh, shade(skin, 0.9)); meld(ctx, x, y, ww, hh, skin, rng(`${recipe.id}|lump|${key}|${side}`)); veins(ctx, x, y, ww, hh, 0x6a2a2a, 1, rng(`${recipe.id}|lv|${key}|${side}`)); };
    for (const s of [-1, 1]) {
      add(body, 'meld-collar', B(s * w * 0.35 - 0.06, torsoTop - 0.1, -d - 0.07, s * w * 0.35 + 0.06, torsoTop + 0.02, -d + 0.02), flesh(`c${s}`));
      add(body, 'meld-side', B(s > 0 ? w - 0.02 : -w - 0.05, legH + b.torsoH * (0.3 + r() * 0.3), -0.06, s > 0 ? w + 0.05 : -w + 0.02, legH + b.torsoH * (0.55 + r() * 0.2), 0.08), flesh(`s${s}`));
    }
    for (const L of ['L', 'R']) {
      add(arms[L].fore, `meld-cuff.${L}`, C(b.armW * 1.25, -b.forearm + 0.01, -b.forearm + 0.07, b.armD * 1.2), flesh(`f${L}`));
      if (legs[L].shin) add(legs[L].shin, `meld-boot.${L}`, C(b.legW * 1.18, -b.shin + 0.02, -b.shin + 0.1, b.legD * 1.15), flesh(`b${L}`));
    }
  },
  /** Rust fist: hands crushed into blocks of rusted scrap, the forearms banded with it. */
  hammerFists(H) {
    const { b, arms, add, remove, recipe } = H;
    remove((n) => /^hand\./.test(n));
    const scrap = (key) => (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, 0x5e5c56); rust(ctx, x, y, w, h, rng(`${recipe.id}|scrap|${key}|${side}`)); if (side !== 'top') band(ctx, x, y, w, h, 0x3a3834, 0.2, 0.06); };
    for (const L of ['L', 'R']) {
      add(arms[L].hand, `hammer.${L}`, C(b.handW * 1.9, -b.hand * 1.9, 0.03, b.armD * 1.9), scrap(`h${L}`));
      add(arms[L].hand, `hammer-spike.${L}`, C(0.05, -b.hand * 2.2, -b.hand * 1.85, 0.05, (L === 'L' ? -1 : 1) * b.handW * 0.4), scrap(`s${L}`));
      add(arms[L].fore, `scrap-band.${L}`, C(b.armW * 1.3, -b.forearm * 0.7, -b.forearm * 0.35, b.armD * 1.3), scrap(`b${L}`));
      add(arms[L].fore, `scrap-plate.${L}`, B(-b.armW * 0.6, -b.forearm * 0.95, -b.armD / 2 - 0.04, b.armW * 0.6, -b.forearm * 0.6, -b.armD / 2 + 0.01), scrap(`p${L}`));
    }
  },
  /** Rust fist: chunks of rusted metal detritus stuck into the body. */
  metalShards(H) {
    const { b, body, legH, torsoTop, arms, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, r = rng(`${recipe.id}|shards`);
    const scrap = (key) => (ctx, x, y, ww, hh, side) => { fill(ctx, x, y, ww, hh, 0x6a665e); rust(ctx, x, y, ww, hh, rng(`${recipe.id}|chunk|${key}|${side}`)); };
    for (let i = 0; i < 6; i++) {
      const back = i >= 4, x0 = (r() - 0.5) * w * 1.5, y0 = legH + b.torsoH * (0.15 + r() * 0.75), s = 0.05 + r() * 0.06, out = 0.05 + r() * 0.07;
      add(body, 'scrap', back ? B(x0 - s / 2, y0 - s / 2, d - 0.02, x0 + s / 2, y0 + s / 2, d + out) : B(x0 - s / 2, y0 - s / 2, -d - out, x0 + s / 2, y0 + s / 2, -d + 0.02), scrap(i));
    }
    add(body, 'scrap-pipe', B(w * 0.2, torsoTop - 0.1, d - 0.02, w * 0.2 + 0.04, torsoTop + 0.25, d + 0.04), scrap('pipe'));
    for (const L of ['L', 'R']) add(arms[L].upper, `scrap.${L}`, B(-b.armW * 0.4, -0.12, -b.armD / 2 - 0.06, b.armW * 0.3, -0.03, -b.armD / 2 + 0.02), scrap(`u${L}`));
  },
  /** Black ops: a balaclava over the whole head, only the eyes showing through a slot. */
  balaclava(H) {
    const { hs, head, add, recipe } = H, c = 0x18181a;
    add(head, 'balaclava', B(-hs * 0.52, -0.01, -hs * 0.525, hs * 0.52, hs * 0.86, hs * 0.52), solid(c, (ctx, x, y, w, h, side) => {
      if (side !== 'front') return;
      fill(ctx, x + w * 0.1, y + h * 0.42, w * 0.8, h * 0.16, recipe.skin);
      for (const px of [0.28, 0.62]) { fill(ctx, x + w * px, y + h * 0.45, w * 0.12, h * 0.1, 0xe8e8e0); fill(ctx, x + w * (px + 0.03), y + h * 0.46, w * 0.06, h * 0.08, recipe.eye ?? 0x0a0a0a); }
    }));
  },
  /** Night-vision goggles flipped up on the helmet's front mount. */
  nvg(H) {
    const { hs, head, add } = H;
    add(head, 'nvg-mount', B(-hs * 0.1, hs * 0.98, -hs * 0.66, hs * 0.1, hs * 1.12, -hs * 0.58), solid(0x2a2a2a));
    add(head, 'nvg', B(-hs * 0.24, hs * 1.08, -hs * 0.82, hs * 0.24, hs * 1.22, -hs * 0.64), solid(0x1e2420));
    for (const s of [-1, 1]) add(head, 'nvg-tube', B(s * hs * 0.13 - hs * 0.07, hs * 1.1, -hs * 0.98, s * hs * 0.13 + hs * 0.07, hs * 1.2, -hs * 0.82), solid(0x161a16, (ctx, x, y, w, h, side) => { if (side === 'front') fill(ctx, x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.6, 0x3a8a3a); }), { glow: true });
  },
  /** Hunter-killer: wisps of living shadow streaming off the shoulders, back and arms (they sway: FX). */
  shadowWisps(H) {
    const { b, body, torsoTop, legH, arms, head, hs, add, fx, recipe } = H, d = b.torsoD / 2, w = b.torsoW / 2, r = rng(`${recipe.id}|wisps`);
    const smoke = (key) => (ctx, x, y, ww, hh, side) => shadow(ctx, x, y, ww, hh, rng(`${recipe.id}|wisp|${key}|${side}`));
    H.wisps = [];
    const wisp = (parent, at, size) => { const n = fx.node(parent, 'wisp', at); add(n, 'wisp', B(-size[0] / 2, 0, -size[2] / 2, size[0] / 2, size[1], size[2] / 2), smoke(H.wisps.length)); H.wisps.push(n); };
    for (let i = 0; i < 5; i++) wisp(body, new THREE.Vector3((r() - 0.5) * w * 1.6, legH + b.torsoH * (0.4 + r() * 0.55), d + 0.02), [0.05 + r() * 0.04, 0.14 + r() * 0.12, 0.04]);
    for (const L of ['L', 'R']) { wisp(arms[L].upper, new THREE.Vector3(0, 0.0, 0), [b.armW * 0.8, 0.16, b.armD * 0.8]); wisp(arms[L].fore, new THREE.Vector3((L === 'L' ? -1 : 1) * b.armW * 0.5, -b.forearm * 0.5, 0), [0.03, 0.12, 0.05]); }
    wisp(head, new THREE.Vector3(0, hs, hs * 0.2), [hs * 0.6, 0.14, hs * 0.5]);
    void torsoTop;
  },
  /** Mercenary ghost: shards of its gear split off and hanging just apart from the body (they shudder: FX). */
  glassShards(H) {
    const { b, body, legH, torsoTop, arms, legs, head, hs, add, fx, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, r = rng(`${recipe.id}|glass`);
    const cam = recipe.outfit.camo ?? [recipe.outfit.top];
    const glass = (key) => (ctx, x, y, ww, hh, side) => { fill(ctx, x, y, ww, hh, cam[Math.floor(r() * cam.length)]); shards(ctx, x, y, ww, hh, rng(`${recipe.id}|gl|${key}|${side}`)); fill(ctx, x, y, ww, Math.max(1, hh * 0.15), 0xd8e8f0); };
    H.shards = [];
    const shard = (parent, at, s) => { const n = fx.node(parent, 'shard', at); add(n, 'shard', B(-s[0] / 2, -s[1] / 2, -s[2] / 2, s[0] / 2, s[1] / 2, s[2] / 2), glass(H.shards.length)); H.shards.push(n); };
    for (let i = 0; i < 6; i++) { const side = r() < 0.5 ? -1 : 1; shard(body, new THREE.Vector3((r() - 0.5) * w * 1.6, legH + b.torsoH * (0.15 + r() * 0.8), side * (d + 0.05 + r() * 0.04)), [0.07 + r() * 0.06, 0.06 + r() * 0.08, 0.02]); }
    for (const L of ['L', 'R']) {
      const sx = L === 'L' ? -1 : 1;
      shard(arms[L].upper, new THREE.Vector3(sx * (b.armW / 2 + 0.05), -b.upperArm * 0.4, 0), [0.02, 0.09, 0.08]);
      if (legs[L].shin) shard(legs[L].thigh, new THREE.Vector3(sx * (b.legW / 2 + 0.04), -b.thigh * 0.5, -0.02), [0.02, 0.1, 0.07]);
    }
    shard(head, new THREE.Vector3(hs * 0.62, hs * 0.9, 0), [0.025, 0.08, 0.09]);
    void torsoTop;
  },
  /** Bilious soldier: a burnt gas mask fused to the face, a hard fleshy proboscis pushing out through it. */
  fusedGasMask(H) {
    const { hs, head, add, skin, recipe } = H, rubber = 0x262420;
    add(head, 'gas-mask', B(-hs * 0.47, hs * 0.06, -hs * 0.55, hs * 0.47, hs * 0.78, -hs * 0.48), solid(rubber, (ctx, x, y, w, h, side) => {
      const r = rng(`${recipe.id}|mask|${side}`);
      blobs(ctx, x, y, w, h, 0x4a3a28, 3, Math.min(w, h) * 0.25, r);
      if (side === 'front') {
        for (const px of [0.14, 0.56]) { fill(ctx, x + w * px, y + h * 0.18, w * 0.3, h * 0.26, 0x5a5a3a); ctx.strokeStyle = 'rgba(220,220,180,0.8)'; ctx.beginPath(); ctx.moveTo(x + w * (px + 0.05), y + h * 0.2); ctx.lineTo(x + w * (px + 0.2), y + h * 0.4); ctx.stroke(); }
        meld(ctx, x, y + h * 0.7, w, h * 0.3, skin, r);
        blobs(ctx, x, y + h * 0.55, w, h * 0.45, 0xb0a83a, 2, Math.min(w, h) * 0.08, r);
      }
      if (side === 'left' || side === 'right') meld(ctx, x, y, w, h, skin, r);
    }));
    for (const s of [-1, 1]) add(head, 'mask-strap', B(s > 0 ? hs * 0.49 : -hs * 0.51, hs * 0.38, -hs * 0.48, s > 0 ? hs * 0.51 : -hs * 0.49, hs * 0.48, hs * 0.5), solid(rubber));
    // The proboscis: segments stepping forward and down from where the filter was.
    const flesh = (k) => (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, shade(0x8a6a50, k)); band(ctx, x, y, w, h, shade(0x8a6a50, k * 0.7), 0.2, 0.12); veins(ctx, x, y, w, h, 0xb0a83a, 1, rng(`${recipe.id}|prob|${k}|${side}`)); };
    let z = -hs * 0.55, y = hs * 0.3, s = hs * 0.34;
    for (let i = 0; i < 5; i++) {
      add(head, 'proboscis', B(-s / 2, y - s / 2, z - 0.085, s / 2, y + s / 2, z + 0.005), flesh(1.25 - i * 0.07));
      z -= 0.08; y -= 0.03 + i * 0.018; s *= 0.82;
    }
    H.tip = { node: head, at: new THREE.Vector3(0, y - s * 0.3, z + 0.02) };
  },
  /** Caustic soldier: cracked, melted armour plates fused to the hide, sagging in drips of slag. */
  meltedPlates(H) {
    const { skin, recipe } = H;
    shellPlates(H, (key) => (ctx, x, y, ww, hh, side) => { const r = rng(`${recipe.id}|melt|${key}|${side}`); fill(ctx, x, y, ww, hh, 0x50544a); shards(ctx, x, y, ww, hh, r); blobs(ctx, x, y, ww, hh, 0x8a8a2a, 2, Math.min(ww, hh) * 0.15, r); meld(ctx, x, y + hh * 0.7, ww, hh * 0.3, skin, r); });
  },
  /** Caustic soldier: mutated tubes on the face and arms that pulse and drip acid (FX). */
  acidTubes(H) {
    const { b, arms, head, hs, add, fx, recipe } = H;
    const tube = (key) => (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, 0x8a9a4a); band(ctx, x, y, w, h, 0x5a6a2a, 0.5, 0.12); veins(ctx, x, y, w, h, 0xd8d040, 1, rng(`${recipe.id}|tube|${key}|${side}`)); };
    H.tubes = [];
    const put = (parent, at, size, tipY) => { const n = fx.node(parent, 'tube', at); add(n, 'tube', B(-size[0] / 2, tipY, -size[2] / 2, size[0] / 2, tipY + size[1], size[2] / 2), tube(H.tubes.length)); H.tubes.push({ node: n, tip: new THREE.Vector3(0, tipY, 0) }); };
    put(head, new THREE.Vector3(-hs * 0.32, hs * 0.35, -hs * 0.53), [0.035, 0.14, 0.035], -0.08);
    put(head, new THREE.Vector3(hs * 0.38, hs * 0.5, -hs * 0.53), [0.03, 0.1, 0.03], -0.07);
    for (const L of ['L', 'R']) {
      const sx = L === 'L' ? -1 : 1;
      put(arms[L].fore, new THREE.Vector3(sx * (b.armW / 2 + 0.018), -b.forearm * 0.35, 0), [0.035, 0.16, 0.035], -0.12);
      put(arms[L].upper, new THREE.Vector3(sx * (b.armW / 2 + 0.018), -b.upperArm * 0.5, -0.02), [0.03, 0.1, 0.03], -0.06);
    }
  },
  /** Sawbones: scrubs draped over the bone, hanging in ragged panels, and a stethoscope. */
  drapedScrubs(H) {
    const { b, body, legH, torsoTop, arms, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, c = recipe.outfit.drape ?? 0x5a8aa8;
    const cloth = (key) => (ctx, x, y, ww, hh, side) => { const r = rng(`${recipe.id}|drape|${key}|${side}`); fill(ctx, x, y, ww, hh, c); band(ctx, x, y, ww, hh, shade(c, 0.8), 0.1, 0.05); tears(ctx, x, y, ww, hh, 1, 0x141014, r); blood(ctx, x, y, ww, hh, 1, r); };
    add(body, 'drape-front-l', B(-w * 1.02, legH + b.torsoH * 0.35, -d - 0.05, -w * 0.15, torsoTop + 0.01, -d - 0.03), cloth('fl'));
    add(body, 'drape-front-r', B(w * 0.25, legH + b.torsoH * 0.55, -d - 0.05, w * 1.02, torsoTop + 0.01, -d - 0.03), cloth('fr'));
    add(body, 'drape-back', B(-w * 1.02, legH + b.torsoH * 0.25, d * 0.6 + 0.02, w * 1.02, torsoTop + 0.01, d * 0.6 + 0.04), cloth('b'));
    add(body, 'drape-shoulders', B(-w * 1.02, torsoTop, -d - 0.05, w * 1.02, torsoTop + 0.02, d * 0.6 + 0.04), cloth('s'));
    for (const L of ['L', 'R']) add(arms[L].upper, `drape-sleeve.${L}`, C(b.armW * 1.05, -b.upperArm * 0.45, 0.02, b.armD * 1.05), cloth(`sl${L}`));
  },
  /** Wretched puker: trash (cans, bottles, plastic bags, scraps) stuck in black goo on the body. */
  trash(H) {
    const { b, body, legH, torsoTop, arms, legs, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, r = rng(`${recipe.id}|trash`);
    const goo = solid(0x141014, (ctx, x, y, ww, hh) => { fill(ctx, x + ww * 0.2, y + hh * 0.15, ww * 0.35, hh * 0.2, 0x3a3440); });
    const can = solid(0xb02a2a, (ctx, x, y, ww, hh, side) => { if (side !== 'top' && side !== 'bottom') { band(ctx, x, y, ww, hh, 0xd0d0d0, 0.08, 0.12); band(ctx, x, y, ww, hh, 0xd0d0d0, 0.92, 0.12); fill(ctx, x + ww * 0.2, y + hh * 0.4, ww * 0.6, hh * 0.15, 0xf0f0f0); } });
    const bottle = solid(0x2a6a3a, (ctx, x, y, ww, hh, side) => { if (side !== 'top' && side !== 'bottom') fill(ctx, x + ww * 0.15, y + hh * 0.4, ww * 0.7, hh * 0.25, 0xe0d8b0); });
    const bag = solid(0xe0e0d8, (ctx, x, y, ww, hh, side) => blobs(ctx, x, y, ww, hh, 0xa8a8a0, 2, Math.min(ww, hh) * 0.2, rng(`${recipe.id}|bag|${side}`)));
    const card = solid(0x9a7a4a, (ctx, x, y, ww, hh) => fill(ctx, x, y + hh * 0.45, ww, hh * 0.1, 0x6a5030));
    const spot = (parent, x, y, z, front, item, size) => {
      const out = front ? -1 : 1;
      add(parent, 'goo', B(x - size * 0.9, y - size * 0.8, z + out * 0.035 - 0.02, x + size * 0.9, y + size * 0.8, z + out * 0.035 + 0.02), goo);
      const [sx, sy, sz] = item === can ? [0.05, 0.08, 0.05] : item === bottle ? [0.04, 0.14, 0.04] : item === bag ? [0.1, 0.08, 0.06] : [0.09, 0.07, 0.015];
      add(parent, 'trash', B(x - sx / 2 + size * 0.2, y - sy / 2, z + out * (0.03 + sz) - sz / 2, x + sx / 2 + size * 0.2, y + sy / 2, z + out * (0.03 + sz) + sz / 2), item);
    };
    spot(body, -w * 0.4, legH + b.torsoH * 0.6, -d, true, can, 0.07);
    spot(body, w * 0.45, legH + b.torsoH * 0.3, -d, true, bag, 0.08);
    spot(body, w * 0.2, legH + b.torsoH * 0.75, d, false, bottle, 0.07);
    spot(body, -w * 0.4, legH + b.torsoH * 0.35, d, false, card, 0.07);
    spot(arms.R.upper, 0, -b.upperArm * 0.5, -b.armD / 2, true, can, 0.05);
    if (legs.L.shin) spot(legs.L.thigh, 0, -b.thigh * 0.5, -b.legD / 2, true, bottle, 0.05);
    for (let i = 0; i < 4; i++) add(body, 'goo', B((r() - 0.5) * w * 1.6 - 0.04, legH + b.torsoH * r(), -d - 0.025, (r() - 0.5) * w * 1.6 + 0.04, legH + b.torsoH * r() + 0.08, -d + 0.01), goo);
    void torsoTop;
  },
  /** Small gold hoop earrings. */
  earrings(H) {
    const { hs, head, add } = H;
    for (const s of [-1, 1]) add(head, 'earring', B(s * hs * 0.5 + (s > 0 ? 0 : -0.02), hs * 0.22, -0.01, s * hs * 0.5 + (s > 0 ? 0.02 : 0), hs * 0.36, 0.01), solid(GOLD));
  },
  /** Resort staff: a sun visor (band and brim, no crown). */
  visorCap(H) {
    const { hs, head, add, recipe } = H, c = recipe.outfit.logo ?? 0xe0e0e0;
    add(head, 'visor-band', B(-hs * 0.53, hs * 0.8, -hs * 0.53, hs * 0.53, hs * 0.9, hs * 0.53), solid(c));
    add(head, 'visor', B(-hs * 0.44, hs * 0.8, -hs * 0.53 - 0.09, hs * 0.44, hs * 0.84, -hs * 0.53), solid(shade(c, 0.85)));
  },
  // ── Batch 3: military, armoured and acid ────────────────────────────────────────────────
  /**
   * Armoured: a powered combat exoskeleton of bare steel plates (bevelled, bright at the edges,
   * panel seams and rivets, scratched to bright metal, dented, bloodied), servo joints, a sealed
   * helmet with a dead visor slit, a power pack on the back. Painted to read as metal, and on the
   * metal material (atlas.js).
   */
  exoSuit(H) {
    const { b, body, legH, torsoTop, arms, legs, head, hs, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    const steel = recipe.outfit.steel ?? 0x6a747e, dark = 0x2e3438;
    const M = { metal: true };
    const plate = (key, c = steel) => (ctx, x, y, ww, hh, side) => {
      const r = rng(`${recipe.id}|exo|${key}|${side}`), e = Math.max(1, Math.round(Math.min(ww, hh) * 0.08));
      // Brushed steel: lighter towards the top, faint horizontal grain.
      fill(ctx, x, y, ww, hh, c);
      fill(ctx, x, y, ww, hh * 0.45, shade(c, 1.12));
      ctx.globalAlpha = 0.25; for (let k = 2; k < hh; k += 3) fill(ctx, x, y + k, ww, 1, shade(c, k % 2 ? 1.25 : 0.85)); ctx.globalAlpha = 1;
      // Bevel: bright top and left edges, dark bottom and right.
      fill(ctx, x, y, ww, e, shade(c, 1.7)); fill(ctx, x, y, e, hh, shade(c, 1.45));
      fill(ctx, x, y + hh - e, ww, e, shade(c, 0.5)); fill(ctx, x + ww - e, y, e, hh, shade(c, 0.6));
      if (side === 'top' || side === 'bottom') return;
      band(ctx, x, y, ww, hh, shade(c, 0.55), 0.52, 0.025);
      for (const [fx, fy] of [[0.12, 0.14], [0.88, 0.14], [0.12, 0.86], [0.88, 0.86]]) { fill(ctx, x + ww * fx - e, y + hh * fy - e, e * 2, e * 2, shade(c, 0.55)); fill(ctx, x + ww * fx - e, y + hh * fy - e, e, e, shade(c, 1.8)); }
      ctx.strokeStyle = css(0xd8e0e8); ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) { const px = x + r() * ww, py = y + r() * hh; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (r() - 0.5) * ww * 0.5, py + (r() - 0.5) * hh * 0.3); ctx.stroke(); }
      if (r() < 0.4) { const dx = x + r() * ww * 0.7, dy = y + r() * hh * 0.7; fill(ctx, dx, dy, ww * 0.18, hh * 0.14, shade(c, 0.7)); fill(ctx, dx, dy, ww * 0.18, Math.max(1, hh * 0.03), shade(c, 1.5)); }
      if (r() < (recipe.wear?.blood ?? 0.45)) blood(ctx, x, y, ww, hh, 1, r);
    };
    const servo = solid(dark, (ctx, x, y, ww, hh, side) => { if (side !== 'top' && side !== 'bottom') { fill(ctx, x + ww * 0.25, y + hh * 0.25, ww * 0.5, hh * 0.5, 0x8a949c); fill(ctx, x + ww * 0.25, y + hh * 0.25, ww * 0.5, hh * 0.1, 0xc8d0d8); fill(ctx, x + ww * 0.42, y + hh * 0.42, ww * 0.16, hh * 0.16, 0x2a2e32); } });
    // Helmet: encloses the head, a dead visor slit across the front.
    add(head, 'exo-helmet', B(-hs * 0.6, -0.03, -hs * 0.6, hs * 0.6, hs * 1.1, hs * 0.58), (ctx, x, y, ww, hh, side) => {
      plate('helm')(ctx, x, y, ww, hh, side);
      if (side === 'front') { fill(ctx, x + ww * 0.1, y + hh * 0.36, ww * 0.8, hh * 0.16, 0x101418); fill(ctx, x + ww * 0.14, y + hh * 0.38, ww * 0.3, hh * 0.04, 0x5a8aaa); shards(ctx, x + ww * 0.1, y + hh * 0.36, ww * 0.8, hh * 0.16, rng(`${recipe.id}|visor`)); fill(ctx, x + ww * 0.3, y + hh * 0.66, ww * 0.4, hh * 0.18, dark); for (let k = 0; k < 4; k++) fill(ctx, x + ww * (0.34 + k * 0.09), y + hh * 0.69, ww * 0.04, hh * 0.12, 0x6a747e); }
    }, M);
    add(head, 'exo-crest', B(-hs * 0.1, hs * 1.08, -hs * 0.5, hs * 0.1, hs * 1.16, hs * 0.5), plate('crest'), M);
    for (const s of [-1, 1]) add(head, 'exo-ear', B(s > 0 ? hs * 0.6 : -hs * 0.7, hs * 0.28, -hs * 0.22, s > 0 ? hs * 0.7 : -hs * 0.6, hs * 0.62, hs * 0.22), servo, M);
    // Torso.
    add(body, 'exo-collar', C(b.torsoW * 0.8, torsoTop - 0.03, torsoTop + 0.06, b.torsoD + 0.08), plate('collar', dark), M);
    add(body, 'exo-chest', B(-w - 0.03, legH + b.torsoH * 0.42, -d - 0.06, w + 0.03, torsoTop - 0.01, -d + 0.01), plate('chest'), M);
    for (let i = 0; i < 3; i++) { const y0 = legH + b.torsoH * (0.06 + i * 0.12); add(body, 'exo-ab', B(-w * 0.7, y0, -d - 0.045, w * 0.7, y0 + b.torsoH * 0.1, -d + 0.01), plate(`ab${i}`), M); }
    add(body, 'exo-back', B(-w - 0.02, legH + b.torsoH * 0.2, d - 0.01, w + 0.02, torsoTop - 0.01, d + 0.04), plate('back'), M);
    add(body, 'exo-pack', B(-0.15, torsoTop - b.torsoH * 0.7, d + 0.04, 0.15, torsoTop - 0.04, d + 0.17), (ctx, x, y, ww, hh, side) => { plate('pack', dark)(ctx, x, y, ww, hh, side); if (side === 'back') { for (let k = 0; k < 4; k++) fill(ctx, x + ww * 0.15, y + hh * (0.15 + k * 0.12), ww * 0.7, hh * 0.05, 0x101214); fill(ctx, x + ww * 0.4, y + hh * 0.72, ww * 0.2, hh * 0.1, 0x8a2a1a); } }, M);
    add(body, 'exo-hip', B(-w - 0.025, legH - 0.04, -d - 0.03, w + 0.025, legH + 0.05, d + 0.03), plate('hip', dark), M);
    // Arms and legs.
    for (const L of ['L', 'R']) {
      const sx = L === 'L' ? -1 : 1, { upper, fore, hand } = arms[L];
      add(upper, `exo-pauldron.${L}`, B(-b.armW * 0.78, -0.13, -b.armD * 0.78, b.armW * 0.78, 0.07, b.armD * 0.78), plate(`p${L}`), M);
      add(upper, `exo-strut.${L}`, B(sx > 0 ? b.armW / 2 : -b.armW / 2 - 0.025, -b.upperArm, -0.02, sx > 0 ? b.armW / 2 + 0.025 : -b.armW / 2, -0.12, 0.02), servo, M);
      add(fore, `exo-elbow.${L}`, C(b.armW * 1.18, -0.04, 0.04, b.armD * 1.18), servo, M);
      add(fore, `exo-gauntlet.${L}`, C(b.armW * 1.22, -b.forearm + 0.01, -0.06, b.armD * 1.22), plate(`g${L}`), M);
      add(hand, `exo-knuckles.${L}`, B(-b.handW * 0.55, -b.hand * 0.6, -b.armD * 0.6, b.handW * 0.55, -b.hand * 0.1, -b.armD * 0.35), plate(`k${L}`, dark), M);
      const { thigh, shin } = legs[L];
      if (!shin) continue;
      add(thigh, `exo-thigh.${L}`, B(-b.legW * 0.62, -b.thigh * 0.85, -b.legD * 0.62, b.legW * 0.62, -0.05, b.legD * 0.2), plate(`t${L}`), M);
      add(shin, `exo-knee.${L}`, C(b.legW * 1.2, -0.05, 0.05, b.legD * 1.2), servo, M);
      add(shin, `exo-greave.${L}`, C(b.legW * 1.22, -b.shin + 0.02, -0.06, b.legD * 1.22), plate(`s${L}`), M);
      add(shin, `exo-boot.${L}`, B(-b.legW * 0.62, -b.shin - b.foot - 0.01, b.legD / 2 - b.footD - 0.02, b.legW * 0.62, -b.shin + 0.01, b.legD / 2 + 0.02), plate(`b${L}`, dark), M);
    }
  },
  /** Kevlar brute/hulk: scraps of Kevlar and armour grown into the hide, edged with split skin. */
  kevlarHide(H) {
    const { b, body, legH, torsoTop, arms, legs, add, skin, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, r = rng(`${recipe.id}|hide`);
    const k = 0x3a3e30;
    const patch = (key) => (ctx, x, y, ww, hh, side) => { const rr = rng(`${recipe.id}|kh|${key}|${side}`); fill(ctx, x, y, ww, hh, k); band(ctx, x, y, ww, hh, shade(k, 0.7), 0.5, 0.06); meld(ctx, x, y, ww, hh, skin, rr); };
    for (let i = 0; i < 7; i++) {
      const back = i >= 4, x0 = (r() - 0.5) * w * 1.5, y0 = legH + b.torsoH * (0.1 + r() * 0.8), sw = w * (0.3 + r() * 0.35), sh = b.torsoH * (0.12 + r() * 0.14);
      add(body, 'kevlar', back ? B(x0 - sw / 2, y0 - sh / 2, d - 0.01, x0 + sw / 2, y0 + sh / 2, d + 0.025) : B(x0 - sw / 2, y0 - sh / 2, -d - 0.025, x0 + sw / 2, y0 + sh / 2, -d + 0.01), patch(i));
    }
    for (const L of ['L', 'R']) {
      add(arms[L].upper, `kevlar.${L}`, B(-b.armW * 0.58, -b.upperArm * 0.7, -b.armD * 0.58, b.armW * 0.58, -b.upperArm * 0.25, b.armD * 0.1), patch(`u${L}`));
      if (legs[L].shin) add(legs[L].thigh, `kevlar-thigh.${L}`, B(-b.legW * 0.58, -b.thigh * 0.7, -b.legD * 0.58, b.legW * 0.58, -b.thigh * 0.3, -b.legD * 0.3), patch(`t${L}`));
    }
    void torsoTop;
  },
  /** Kevlar brute: hands fused into big leathery cudgels. */
  cudgelHands(H) {
    const { b, arms, add, remove, skin, recipe } = H;
    remove((n) => /^hand\./.test(n));
    const leather = (key) => (ctx, x, y, w, h, side) => { const r = rng(`${recipe.id}|cudgel|${key}|${side}`); fill(ctx, x, y, w, h, shade(skin, 0.72)); blobs(ctx, x, y, w, h, shade(skin, 0.55), 3, Math.min(w, h) * 0.2, r); fill(ctx, x + w * 0.2, y + h * 0.3, w * 0.4, h * 0.2, 0x3a3e30); stitches(ctx, x, y, w, h, r); };
    for (const L of ['L', 'R']) {
      add(arms[L].hand, `cudgel.${L}`, C(b.handW * 1.35, -b.hand * 2.1, 0.02, b.armD * 1.35), leather(L));
      add(arms[L].hand, `cudgel-knot.${L}`, C(b.handW * 1.6, -b.hand * 1.9, -b.hand * 1.2, b.armD * 1.6), leather(`k${L}`));
    }
  },
  /** Kevlar hulk: forearms twisted into enormous clubs of misshapen bone, reaching the ground behind (pose: drag). */
  boneClubs(H) {
    const { b, arms, add, remove, torsoTop, recipe } = H;
    remove((n) => /^(forearm|hand)\./.test(n));
    const BONE = (key) => (ctx, x, y, w, h, side) => bone(ctx, x, y, w, h, rng(`${recipe.id}|club|${key}|${side}`));
    // The arm hangs 0.3 rad back (pose drag): from the elbow to the ground along the arm.
    // Less the dip of the club head's back corner, which the swing lowers by depth/2 · sin(0.3).
    const len = (torsoTop - 0.02) / Math.cos(0.3) - b.upperArm - b.armD * 0.8 * Math.sin(0.3) - 0.01;
    for (const L of ['L', 'R']) {
      const fore = arms[L].fore, sx = L === 'L' ? -1 : 1;
      add(fore, `club.${L}`, C(b.armW * 1.05, -len * 0.7, 0.02, b.armD * 1.05), BONE(`a${L}`));
      add(fore, `club-head.${L}`, C(b.armW * 1.7, -len + 0.01, -len * 0.62, b.armD * 1.6), BONE(`h${L}`));
      add(fore, `club-lump.${L}`, C(b.armW * 0.7, -len * 0.75, -len * 0.45, b.armD * 0.8, sx * b.armW * 0.75, 0), BONE(`l${L}`));
      add(fore, `club-knob.${L}`, C(b.armW * 0.6, -len * 0.4, -len * 0.25, b.armD * 0.6, 0, -b.armD * 0.6), BONE(`n${L}`));
    }
  },
  /** Bestial stalker: dagger-like claws reaching forward from each hand. `recipe.clawLength` (m). */
  claws(H) {
    const { b, arms, add, recipe } = H, len = recipe.clawLength ?? 0.17, t = Math.max(0.012, len * 0.08);
    for (const L of ['L', 'R']) for (const fx of [-0.32, 0, 0.32]) {
      add(arms[L].hand, `claw.${L}`, B(fx * b.handW - t, -b.hand * 0.95, -b.armD / 2 - len, fx * b.handW + t, -b.hand * 0.75, -b.armD / 2 + 0.02), (ctx, x, y, w, h, side) => bone(ctx, x, y, w, h, rng(`${recipe.id}|claw|${L}${fx}|${side}`)));
      if (len > 0.2) add(arms[L].hand, `claw-tip.${L}`, B(fx * b.handW - t * 0.6, -b.hand * 1.05, -b.armD / 2 - len - 0.04, fx * b.handW + t * 0.6, -b.hand * 0.88, -b.armD / 2 - len + 0.005), solid(0xece4cc));
    }
  },
  /**
   * Bestial stalker: the skin split along the back, shoulders and arms by the new bulk, wide
   * bands of red muscle bulging out through the tears, ragged pale skin at their edges.
   */
  splitSkin(H) {
    const { b, body, legH, torsoTop, arms, add, skin, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    const MEAT = (key) => (ctx, x, y, ww, hh, side) => {
      const r = rng(`${recipe.id}|split|${key}|${side}`);
      muscle(ctx, x, y, ww, hh, r);
      fill(ctx, x, y, ww, hh, 0x9a2a24); ctx.globalAlpha = 0.7; for (let i = 1; i < ww; i += 3) fill(ctx, x + i, y, 1, hh, i % 2 ? 0x6a1a18 : 0xc04a3a); ctx.globalAlpha = 1;
      // Ragged skin edges along both long sides.
      ctx.fillStyle = css(shade(skin, 1.05));
      for (let k = 0; k < hh; k += 3) { ctx.fillRect(x, y + k, Math.max(1, ww * (0.1 + r() * 0.15)), 3); ctx.fillRect(x + ww - Math.max(1, ww * (0.1 + r() * 0.15)), y + k, ww, 3); }
    };
    const t = Math.max(0.05, b.torsoW * 0.12);
    for (const x of [-w * 0.5, 0, w * 0.5]) add(body, 'split-back', B(x - t / 2, legH + b.torsoH * 0.12, d - 0.01, x + t / 2, torsoTop - 0.02, d + 0.045), MEAT(`b${x}`));
    add(body, 'split-shoulders', B(-w * 0.9, torsoTop - 0.02, -d * 0.6, w * 0.9, torsoTop + 0.035, d * 0.6), MEAT('s'));
    for (const L of ['L', 'R']) {
      const sx = L === 'L' ? -1 : 1;
      add(arms[L].upper, `split-arm.${L}`, B(sx > 0 ? b.armW / 2 - 0.01 : -b.armW / 2 - 0.035, -b.upperArm * 0.9, -b.armD * 0.3, sx > 0 ? b.armW / 2 + 0.035 : -b.armW / 2 + 0.01, -0.02, b.armD * 0.3), MEAT(`u${L}`));
      add(arms[L].fore, `split-arm.${L}`, B(-b.armW * 0.3, -b.forearm * 0.85, b.armD / 2 - 0.01, b.armW * 0.3, -0.03, b.armD / 2 + 0.035), MEAT(`f${L}`));
      add(arms[L].fore, `split-arm.${L}`, B(-b.armW * 0.3, -b.forearm * 0.85, -b.armD / 2 - 0.035, b.armW * 0.3, -0.03, -b.armD / 2 + 0.01), MEAT(`g${L}`));
    }
  },
  /** Bestial stalker: teeth grown into long spikes of bone jutting up and down from the mouth, tusks at the corners. */
  boneTeeth(H) {
    const { hs, head, add, recipe } = H, f = -hs / 2;
    const BONE = (k) => (ctx, x, y, w, h, side) => { bone(ctx, x, y, w, h, rng(`${recipe.id}|tooth|${k}|${side}`)); fill(ctx, x, y, w, h * 0.15, 0xf0ead8); };
    add(head, 'maw', B(-hs * 0.36, hs * 0.08, f - 0.015, hs * 0.36, hs * 0.34, f + 0.01), solid(0x2a0808));
    for (const [x, up, len] of [[-0.28, 1, 0.16], [-0.14, 0, 0.12], [0, 1, 0.12], [0.14, 0, 0.12], [0.28, 1, 0.16]]) {
      const y0 = up ? hs * 0.06 : hs * 0.22 - len * hs * 0.0, a = up ? hs * 0.08 : hs * 0.34;
      add(head, 'bone-tooth', up ? B(x * hs - 0.011, a, f - 0.04, x * hs + 0.011, a + len, f - 0.015) : B(x * hs - 0.011, a - len, f - 0.04, x * hs + 0.011, a, f - 0.015), BONE(`${x}`));
      void y0;
    }
    for (const s of [-1, 1]) add(head, 'tusk', B(s * hs * 0.44 - 0.016, hs * 0.02, f - 0.07, s * hs * 0.44 + 0.016, hs * 0.42, f - 0.02), BONE(`t${s}`));
  },
  /**
   * Bestial stalker: the pulverised remains of its gear: a cracked combat helmet still on the
   * skull (dome, brim, a chunk broken out), a torn plate carrier hanging off one shoulder with
   * pouches and the unit insignia, a dangling strap.
   */
  gearScraps(H) {
    const { b, body, legH, torsoTop, head, hs, add, skin, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, o = recipe.outfit;
    const cam = o.camo ?? [0x5a6040, 0x3e4430];
    const camo = (key, crack) => (ctx, x, y, ww, hh, side) => { const r = rng(`${recipe.id}|scrap|${key}|${side}`); fill(ctx, x, y, ww, hh, cam[0]); for (const c of cam.slice(1)) { ctx.fillStyle = css(c); for (let i = 0; i < 3; i++) ctx.fillRect(x + r() * ww, y + r() * hh, ww * 0.25, hh * 0.2); } fill(ctx, x, y + hh * 0.9, ww, hh * 0.1, shade(cam[0], 0.6)); if (crack) { ctx.strokeStyle = css(0x141410); ctx.lineWidth = Math.max(1, ww * 0.03); ctx.beginPath(); ctx.moveTo(x + ww * 0.6, y); ctx.lineTo(x + ww * 0.5, y + hh * 0.4); ctx.lineTo(x + ww * 0.65, y + hh * 0.7); ctx.lineTo(x + ww * 0.55, y + hh); ctx.stroke(); } };
    // The helmet: a dome over the top and back of the head with a brim; the right front quarter is gone.
    add(head, 'helmet-dome', B(-hs * 0.62, hs * 0.82, -hs * 0.6, hs * 0.2, hs * 1.16, hs * 0.64), camo('dome', true));
    add(head, 'helmet-dome', B(hs * 0.2, hs * 0.82, -hs * 0.1, hs * 0.62, hs * 1.1, hs * 0.64), camo('dome2', true));
    add(head, 'helmet-brim', B(-hs * 0.66, hs * 0.76, -hs * 0.64, hs * 0.1, hs * 0.84, hs * 0.68), camo('brim'));
    add(head, 'helmet-strap', B(-hs * 0.58, hs * 0.1, -hs * 0.1, -hs * 0.52, hs * 0.8, hs * 0.0), solid(0x2a2a22));
    add(head, 'helmet-break', B(hs * 0.2, hs * 0.92, -hs * 0.56, hs * 0.5, hs * 1.02, -hs * 0.12), solid(shade(skin, 0.7), (ctx, x, y, ww, hh) => blood(ctx, x, y, ww, hh, 1, rng(`${recipe.id}|break`))));
    // The plate carrier, torn, hanging off the left shoulder.
    add(body, 'vest-plate', B(-w * 1.02, legH + b.torsoH * 0.3, -d - 0.06, w * 0.15, torsoTop - 0.02, -d + 0.01), (ctx, x, y, ww, hh, side) => { camo('vest')(ctx, x, y, ww, hh, side); if (side === 'front') { tears(ctx, x, y, ww, hh, 2, shade(skin, 0.9), rng(`${recipe.id}|vt`)); fill(ctx, x + ww * 0.08, y + hh * 0.88, ww * 0.84, hh * 0.06, 0x1a1a14); } });
    for (const [x0, x1] of [[-w * 0.95, -w * 0.6], [-w * 0.5, -w * 0.15]]) add(body, 'vest-pouch', B(x0, legH + b.torsoH * 0.32, -d - 0.1, x1, legH + b.torsoH * 0.52, -d - 0.05), camo(`p${x0}`));
    add(body, 'vest-strap', B(-w * 0.85, legH + b.torsoH * 0.55, -d - 0.04, -w * 0.55, torsoTop + 0.02, d + 0.04), solid(0x2a2a22));
    add(body, 'dangling-strap', B(w * 0.1, legH + b.torsoH * 0.05, -d - 0.05, w * 0.18, legH + b.torsoH * 0.35, -d - 0.03), solid(0x2a2a22));
    // A torn back plate, its unit insignia showing (the chest faces the ground on all fours).
    add(body, 'back-plate', B(-w * 0.7, legH + b.torsoH * 0.45, d + 0.035, w * 0.45, torsoTop - 0.06, d + 0.075), (ctx, x, y, ww, hh, side) => { camo('back')(ctx, x, y, ww, hh, side); if (side === 'back' && o.insignia) { fill(ctx, x + ww * 0.3, y + hh * 0.2, ww * 0.4, hh * 0.6, 0x1a1a16); fill(ctx, x + ww * 0.38, y + hh * 0.28, ww * 0.24, hh * 0.24, o.insignia); fill(ctx, x + ww * 0.46, y + hh * 0.5, ww * 0.08, hh * 0.22, o.insignia); fill(ctx, x + ww * 0.33, y + hh * 0.36, ww * 0.34, hh * 0.06, o.insignia); } });
    if (o.insignia) add(body, 'insignia', B(-w * 0.75, torsoTop - 0.18, -d - 0.075, -w * 0.25, torsoTop - 0.06, -d - 0.055), solid(0x141414, (ctx, x, y, ww, hh, side) => { if (side === 'front') { fill(ctx, x + ww * 0.1, y + hh * 0.1, ww * 0.8, hh * 0.8, 0x1e1e1a); fill(ctx, x + ww * 0.3, y + hh * 0.2, ww * 0.4, hh * 0.4, o.insignia); fill(ctx, x + ww * 0.44, y + hh * 0.55, ww * 0.12, hh * 0.3, o.insignia); fill(ctx, x + ww * 0.2, y + hh * 0.3, ww * 0.6, hh * 0.08, o.insignia); } }));
  },
  /**
   * Military pilot: a sturdy flight helmet (pale shell, a coloured stripe over the top, ear cups),
   * its dark tinted visor pulled down over the eyes; the oxygen mask clipped over nose and mouth,
   * its ribbed hose running down to the connector on the chest. Colours: outfit.helmet,
   * outfit.helmetStripe.
   */
  flightHelmet(H) {
    const { b, body, torsoTop, hs, head, add, recipe } = H, o = recipe.outfit, shell = o.helmet ?? 0xb4b8b6, stripe = o.helmetStripe ?? 0x2a3a6a, d = b.torsoD / 2, f = -hs / 2;
    const SHELL = (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, shell); fill(ctx, x, y + h * 0.85, w, h * 0.15, shade(shell, 0.8)); if (side === 'top') fill(ctx, x + w * 0.4, y, w * 0.2, h, stripe); if (side === 'back') fill(ctx, x + w * 0.4, y, w * 0.2, h * 0.7, stripe); blood(ctx, x, y, w, h, 1, rng(`${recipe.id}|helm|${side}`)); };
    add(head, 'flight-helmet', B(-hs * 0.6, hs * 0.42, -hs * 0.58, hs * 0.6, hs * 1.12, hs * 0.62), SHELL);
    add(head, 'helmet-crown', B(-hs * 0.48, hs * 1.1, -hs * 0.46, hs * 0.48, hs * 1.22, hs * 0.5), SHELL);
    add(head, 'helmet-nape', B(-hs * 0.58, hs * 0.05, hs * 0.3, hs * 0.58, hs * 0.5, hs * 0.62), SHELL);
    for (const s of [-1, 1]) add(head, 'ear-cup', B(s > 0 ? hs * 0.58 : -hs * 0.7, hs * 0.18, -hs * 0.22, s > 0 ? hs * 0.7 : -hs * 0.58, hs * 0.62, hs * 0.22), solid(shade(shell, 0.85), (ctx, x, y, w, h, side) => { if (side === 'left' || side === 'right') fill(ctx, x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4, 0x2a2a2a); }));
    // The visor, down: dark smoked glass with an amber sheen, in its housing over the brow.
    add(head, 'visor-housing', B(-hs * 0.56, hs * 0.92, f - 0.06, hs * 0.56, hs * 1.08, f + 0.02), SHELL);
    add(head, 'visor', B(-hs * 0.52, hs * 0.5, f - 0.05, hs * 0.52, hs * 0.94, f - 0.01), solid(0x1a1c22, (ctx, x, y, w, h, side) => { if (side === 'front') { fill(ctx, x + w * 0.08, y + h * 0.15, w * 0.18, h * 0.5, 0x8a6a2a); fill(ctx, x + w * 0.3, y + h * 0.12, w * 0.06, h * 0.3, 0xc8a04a); fill(ctx, x, y + h * 0.88, w, h * 0.12, 0x0a0a0c); } }));
    // The oxygen mask over nose and mouth, clipped to the helmet at both cheeks.
    const RUBBER = 0x4a5040;
    add(head, 'oxygen-mask', B(-hs * 0.24, hs * 0.04, f - 0.09, hs * 0.24, hs * 0.48, f + 0.01), solid(RUBBER, (ctx, x, y, w, h, side) => { if (side === 'front') { fill(ctx, x + w * 0.3, y + h * 0.55, w * 0.4, h * 0.3, 0x1a1a1a); fill(ctx, x + w * 0.38, y + h * 0.62, w * 0.24, h * 0.14, 0x8a8a80); fill(ctx, x, y, w, h * 0.12, shade(RUBBER, 1.3)); } }));
    for (const s of [-1, 1]) add(head, 'mask-strap', B(s > 0 ? hs * 0.24 : -hs * 0.6, hs * 0.32, f - 0.02, s > 0 ? hs * 0.6 : -hs * 0.24, hs * 0.4, f + 0.02), solid(0x2a2c26, (ctx, x, y, w, h) => fill(ctx, s > 0 ? x + w * 0.8 : x, y, w * 0.2, h, 0xb0b0a8)));
    add(head, 'mask-hose', B(-hs * 0.07, -0.06, f - 0.07, hs * 0.07, hs * 0.06, f - 0.02), solid(0x2a2c26));
    const RIBS = solid(0x2a2c26, (ctx, x, y, w, h) => { for (let k = 0; k < 8; k++) fill(ctx, x, y + (h * k) / 8, w, Math.max(1, h / 20), 0x4a4c44); });
    add(body, 'oxygen-hose', B(-0.03, torsoTop - 0.26, -d - 0.05, 0.03, torsoTop + 0.04, -d - 0.005), RIBS);
    add(body, 'oxygen-connector', B(-0.05, torsoTop - 0.3, -d - 0.055, 0.05, torsoTop - 0.24, -d - 0.005), solid(0x9a9a90, (ctx, x, y, w, h) => fill(ctx, x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4, 0x2a6a3a)));
  },
  /**
   * Military pilot: a parachute harness (straps over the shoulders, a chest buckle, leg loops),
   * gold wings and a name tape on the chest, the G-suit's laced chaps with pockets on the legs.
   */
  pilotKit(H) {
    const { b, body, legH, torsoTop, legs, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, o = recipe.outfit, STRAP = 0x2a2c22, METAL = 0xb8bab0;
    const strap = solid(STRAP, (ctx, x, y, ww, hh) => { for (let k = 0; k < 4; k++) fill(ctx, x, y + (hh * k) / 4, ww, 1, shade(STRAP, 1.4)); });
    for (const s of [-1, 1]) {
      add(body, 'harness', B(s * w * 0.5 - 0.03, legH + 0.02, -d - 0.025, s * w * 0.5 + 0.03, torsoTop + 0.01, -d + 0.005), strap);
      add(body, 'harness', B(s * w * 0.5 - 0.03, torsoTop - 0.02, -d - 0.02, s * w * 0.5 + 0.03, torsoTop + 0.015, d + 0.02), strap);
      add(body, 'harness', B(s * w * 0.5 - 0.03, legH + b.torsoH * 0.3, d - 0.005, s * w * 0.5 + 0.03, torsoTop + 0.01, d + 0.02), strap);
      add(body, 'harness-buckle', B(s * w * 0.5 - 0.045, torsoTop - 0.12, -d - 0.04, s * w * 0.5 + 0.045, torsoTop - 0.06, -d - 0.02), solid(METAL));
    }
    add(body, 'chest-strap', B(-w * 0.55, legH + b.torsoH * 0.5, -d - 0.03, w * 0.55, legH + b.torsoH * 0.56, -d - 0.005), strap);
    add(body, 'chest-buckle', B(-0.04, legH + b.torsoH * 0.48, -d - 0.045, 0.04, legH + b.torsoH * 0.58, -d - 0.02), solid(METAL, (ctx, x, y, ww, hh) => fill(ctx, x + ww * 0.25, y + hh * 0.25, ww * 0.5, hh * 0.5, 0x6a6a64)));
    add(body, 'wings', B(-w * 0.48, torsoTop - 0.21, -d - 0.012, -w * 0.16, torsoTop - 0.14, -d + 0.002), solid(0x2a2c22, (ctx, x, y, ww, hh, side) => { if (side === 'front') { fill(ctx, x + ww * 0.05, y + hh * 0.35, ww * 0.9, hh * 0.25, 0xd8b040); fill(ctx, x + ww * 0.42, y + hh * 0.15, ww * 0.16, hh * 0.65, 0xd8b040); fill(ctx, x + ww * 0.1, y + hh * 0.6, ww * 0.25, hh * 0.15, 0xb08a2a); fill(ctx, x + ww * 0.65, y + hh * 0.6, ww * 0.25, hh * 0.15, 0xb08a2a); } }));
    add(body, 'name-tape', B(w * 0.16, torsoTop - 0.2, -d - 0.012, w * 0.48, torsoTop - 0.14, -d + 0.002), solid(0x2a2c22, (ctx, x, y, ww, hh, side) => { if (side === 'front') for (let k = 0; k < 5; k++) fill(ctx, x + ww * (0.1 + k * 0.17), y + hh * 0.3, ww * 0.1, hh * 0.4, 0xd8d8c8); }));
    const CHAP = o.gsuit ?? 0x4a5038;
    const lace = solid(CHAP, (ctx, x, y, ww, hh, side) => { if (side === 'front') { for (let k = 0; k < 6; k++) fill(ctx, x + ww * 0.45, y + (hh * k) / 6, ww * 0.1, hh / 12, 0xc8c8b8); } });
    for (const L of ['L', 'R']) {
      const { thigh, shin } = legs[L];
      if (!shin) continue;
      add(thigh, `gsuit.${L}`, C(b.legW * 1.16, -b.thigh * 0.95, -0.03, b.legD * 1.16), lace);
      add(thigh, `gsuit-pocket.${L}`, B(L === 'L' ? -b.legW * 0.58 - 0.04 : b.legW * 0.58, -b.thigh * 0.7, -b.legD * 0.4, L === 'L' ? -b.legW * 0.58 : b.legW * 0.58 + 0.04, -b.thigh * 0.3, b.legD * 0.4), solid(shade(CHAP, 0.85), (ctx, x, y, ww, hh) => fill(ctx, x, y, ww, hh * 0.18, shade(CHAP, 0.65))));
      add(shin, `gsuit.${L}`, C(b.legW * 1.12, -b.shin * 0.7, -0.03, b.legD * 1.12), lace);
    }
  },
  /** SWAT: a protective mask (rubber, two lenses, a filter) under a black helmet. */
  swatMask(H) {
    const { hs, head, add } = H, rubber = 0x1e2022;
    add(head, 'swat-mask', B(-hs * 0.48, hs * 0.04, -hs * 0.55, hs * 0.48, hs * 0.8, -hs * 0.46), solid(rubber, (ctx, x, y, w, h, side) => {
      if (side !== 'front') return;
      for (const px of [0.12, 0.56]) { fill(ctx, x + w * px, y + h * 0.2, w * 0.32, h * 0.28, 0x6a7478); fill(ctx, x + w * (px + 0.1), y + h * 0.28, w * 0.1, h * 0.1, 0x0a0a0a); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + w * (px + 0.03), y + h * 0.22, w * 0.05, h * 0.2); }
    }));
    add(head, 'swat-filter', B(-hs * 0.16, hs * 0.04, -hs * 0.55 - 0.08, hs * 0.16, hs * 0.26, -hs * 0.55), solid(0x2a2c2e, (ctx, x, y, w, h, side) => { if (side === 'front') { for (let k = 0; k < 3; k++) fill(ctx, x + w * 0.2, y + h * (0.25 + k * 0.2), w * 0.6, h * 0.08, 0x0a0a0a); } }));
    for (const s of [-1, 1]) add(head, 'mask-strap', B(s > 0 ? hs * 0.49 : -hs * 0.51, hs * 0.45, -hs * 0.46, s > 0 ? hs * 0.51 : -hs * 0.49, hs * 0.55, hs * 0.5), solid(rubber));
  },
  /** Corrosive: lumps of semi-congealed acid holding the bloated body together (they swell: FX cystPulse), a swollen acid sac at the throat. */
  acidGel(H) {
    const { b, body, legH, torsoTop, arms, legs, head, hs, add, fx, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, r = rng(`${recipe.id}|gel`);
    const gel = (key) => (ctx, x, y, ww, hh, side) => { fill(ctx, x, y, ww, hh, 0xb8c03a); fill(ctx, x + ww * 0.15, y + hh * 0.15, ww * 0.3, hh * 0.2, 0xf0f4a0); blobs(ctx, x, y, ww, hh, 0x8a9420, 2, Math.min(ww, hh) * 0.2, rng(`${recipe.id}|gel|${key}|${side}`)); };
    H.cysts = [];
    const put = (parent, at, s) => { const n = fx.node(parent, 'gel', at); add(n, 'gel', B(-s[0] / 2, -s[1] / 2, -s[2] / 2, s[0] / 2, s[1] / 2, s[2] / 2), gel(H.cysts.length)); H.cysts.push(n); };
    for (let i = 0; i < 6; i++) put(body, new THREE.Vector3((r() - 0.5) * w * 1.5, legH + b.torsoH * (0.1 + r() * 0.75), -d - 0.01), [0.1 + r() * 0.08, 0.06 + r() * 0.08, 0.05]);
    for (let i = 0; i < 3; i++) put(body, new THREE.Vector3((r() - 0.5) * w * 1.5, legH + b.torsoH * (0.2 + r() * 0.6), d + 0.01), [0.12, 0.08, 0.05]);
    for (const s of [-1, 1]) put(body, new THREE.Vector3(s * (w + 0.01), legH + b.torsoH * (0.3 + r() * 0.4), 0), [0.05, 0.14, 0.12]);
    for (const L of ['L', 'R']) { put(arms[L].upper, new THREE.Vector3(0, -b.upperArm * 0.5, -b.armD / 2 - 0.01), [b.armW * 0.9, 0.08, 0.04]); if (legs[L].shin) put(legs[L].thigh, new THREE.Vector3(0, -b.thigh * 0.4, -b.legD / 2 - 0.01), [b.legW * 0.9, 0.08, 0.04]); }
    put(head, new THREE.Vector3(0, hs * 0.02, -hs * 0.35), [hs * 0.7, hs * 0.28, hs * 0.4]);
    void torsoTop;
  },
  /** Spitter: the puckered mouth that fills most of the face, drooping cheeks either side. */
  puckerMouth(H) {
    const { hs, head, add, skin } = H;
    add(head, 'pucker', B(-hs * 0.22, hs * 0.06, -hs * 0.5 - 0.075, hs * 0.22, hs * 0.5, -hs * 0.5 + 0.01), solid(shade(skin, 0.92), (ctx, x, y, w, h, side) => {
      if (side !== 'front') return;
      ctx.strokeStyle = css(shade(skin, 0.6)); ctx.lineWidth = 2;
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + w / 2 + Math.cos(a) * w * 0.14, y + h / 2 + Math.sin(a) * h * 0.14); ctx.lineTo(x + w / 2 + Math.cos(a) * w * 0.45, y + h / 2 + Math.sin(a) * h * 0.45); ctx.stroke(); }
      fill(ctx, x + w * 0.38, y + h * 0.38, w * 0.24, h * 0.24, 0x2a0a0a); fill(ctx, x + w * 0.44, y + h * 0.6, w * 0.12, h * 0.15, 0xc8c040);
    }));
    for (const s of [-1, 1]) add(head, 'cheek', B(s > 0 ? hs * 0.24 : -hs * 0.48, -0.07, -hs * 0.5 - 0.035, s > 0 ? hs * 0.48 : -hs * 0.24, hs * 0.32, -hs * 0.5 + 0.01), solid(shade(skin, 0.95), (ctx, x, y, w, h, side) => { if (side === 'front') { fill(ctx, x, y + h * 0.8, w, h * 0.2, shade(skin, 0.75)); veins(ctx, x, y, w, h, shade(skin, 0.6), 1, rng(`spitter-cheek|${s}`)); } }));
  },
  /** Spitter: a swollen, nearly translucent yellow stomach (it swells: FX stomachPulse). */
  translucentBelly(H) {
    const { b, body, legH, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    const belly = H.fx.node(body, 'belly', new THREE.Vector3(0, legH + b.torsoH * 0.3, -d));
    add(belly, 'belly', B(-w * 0.8, -b.torsoH * 0.24, -0.15, w * 0.8, b.torsoH * 0.2, 0.02), (ctx, x, y, ww, hh, side) => {
      const r = rng(`${recipe.id}|belly|${side}`);
      fill(ctx, x, y, ww, hh, 0xd8d078); fill(ctx, x + ww * 0.2, y + hh * 0.2, ww * 0.6, hh * 0.5, 0xe8e4a0);
      veins(ctx, x, y, ww, hh, 0x9a8a3a, 3, r); blobs(ctx, x, y, ww, hh, 0xb8a840, 2, Math.min(ww, hh) * 0.15, r);
    });
    H.belly = belly;
  },
  /**
   * Shriekling: spurs of bone breaking out through the skin at the elbows, knees and shoulders,
   * and a ridge of spikes along the twisted spine.
   */
  boneSpurs(H) {
    const { b, body, legH, torsoTop, arms, legs, add, recipe } = H, d = b.torsoD / 2, k = Math.max(1, b.torsoW / 0.46);
    const BONE = (key) => (ctx, x, y, w, h, side) => { bone(ctx, x, y, w, h, rng(`${recipe.id}|spur|${key}|${side}`)); fill(ctx, x, y + h * 0.85, w, h * 0.15, 0x7a2a24); };
    const t = 0.035 * k;
    for (let i = 0; i < 4; i++) { const y = torsoTop - 0.04 - i * b.torsoH * 0.22, len = (0.1 - i * 0.012) * k; add(body, 'spine-spur', B(-t / 2, y - t, d - 0.01, t / 2, y + t * 0.5, d + len), BONE(`s${i}`)); }
    for (const L of ['L', 'R']) {
      const sx = L === 'L' ? -1 : 1;
      add(arms[L].fore, `elbow-spur.${L}`, B(-t / 2, -0.01, b.armD / 2 - 0.01, t / 2, t, b.armD / 2 + 0.1 * k), BONE(`e${L}`));
      add(arms[L].upper, `shoulder-spur.${L}`, B(sx > 0 ? b.armW / 2 - 0.01 : -b.armW / 2 - 0.08 * k, -0.06, -t / 2, sx > 0 ? b.armW / 2 + 0.08 * k : -b.armW / 2 + 0.01, -0.06 + t, t / 2), BONE(`h${L}`));
      if (legs[L].shin) add(legs[L].shin, `knee-spur.${L}`, B(-t / 2, -0.02, -b.legD / 2 - 0.09 * k, t / 2, t, -b.legD / 2 + 0.01), BONE(`k${L}`));
    }
    void legH;
  },
  /** Shriekling: a swollen, veined vocal sac bulging from the throat under the screaming mouth (FX sacPulse). */
  throatSac(H) {
    const { hs, head, add, skin, recipe, fx } = H, f = -hs / 2;
    const sac = fx.node(head, 'sac', new THREE.Vector3(0, -hs * 0.02, f + hs * 0.12));
    add(sac, 'throat-sac', B(-hs * 0.36, -hs * 0.34, -hs * 0.26, hs * 0.36, hs * 0.12, hs * 0.12), (ctx, x, y, w, h, side) => { const r = rng(`${recipe.id}|sac|${side}`); fill(ctx, x, y, w, h, 0xb0606a); fill(ctx, x + w * 0.2, y + h * 0.2, w * 0.5, h * 0.4, 0xc87a84); veins(ctx, x, y, w, h, 0x5a1a2a, 4, r); void skin; });
    H.sac = sac;
  },
  /**
   * Electric: bolts of lightning arcing out of the body (shoulders, sides, head, forearms), each
   * a zigzag of glowing blocks on a node of its own that flickers (FX arcFlicker) or pulses
   * (FX fieldPulse). `recipe.arcs`: { size, color, n }.
   */
  arcs(H) {
    const { b, body, legH, torsoTop, arms, head, hs, add, recipe, fx } = H, o = recipe.arcs ?? {}, k = o.size ?? 1, color = o.color ?? 0xcfeeff, w = b.torsoW / 2, d = b.torsoD / 2;
    const GLOW = solid(color, (ctx, x, y, ww, hh) => fill(ctx, x + ww * 0.3, y, ww * 0.4, hh, 0xffffff));
    H.arcs = [];
    // A bolt from `at` along direction (dx, dy) in the parent's x–y plane, `len` long, in 3 kinks.
    const bolt = (parent, at, dx, dy, len, key) => {
      const n = fx.node(parent, 'arc', at), t = 0.018 * Math.sqrt(k), seg = (len * k) / 3;
      let x = 0, y = 0;
      for (let i = 0; i < 3; i++) {
        const kink = (i % 2 ? 1 : -1) * seg * 0.45, nx = x + dx * seg - dy * kink, ny = y + dy * seg + dx * kink;
        add(n, `arc-${key}`, B(Math.min(x, nx) - t, Math.min(y, ny) - t, -t, Math.max(x, nx) + t, Math.max(y, ny) + t, t), GLOW, { glow: true });
        x = nx; y = ny;
      }
      H.arcs.push(n);
    };
    const all = [
      [body, new THREE.Vector3(-w, torsoTop - 0.05, 0), -0.8, 0.6, 0.35], [body, new THREE.Vector3(w, legH + b.torsoH * 0.5, -d), 0.9, -0.3, 0.3],
      [head, new THREE.Vector3(hs * 0.3, hs, 0), 0.4, 0.9, 0.3], [arms.L.fore, new THREE.Vector3(-b.armW / 2, -b.forearm * 0.6, 0), -1, -0.2, 0.28],
      [arms.R.fore, new THREE.Vector3(b.armW / 2, -b.forearm * 0.4, 0), 1, 0.3, 0.28], [body, new THREE.Vector3(-w, legH + b.torsoH * 0.2, d), -0.9, -0.4, 0.3],
    ];
    all.slice(0, o.n ?? all.length).forEach(([p, at, dx, dy, len], i) => bolt(p, at, dx, dy, len, i));
  },
  /** Zapper: the worst case of static hair: stiff strands standing straight out from the scalp in every direction. */
  staticHair(H) {
    const { hs, head, add, recipe } = H, r = rng(`${recipe.id}|static`), c = recipe.hair ?? 0xd8d0b8;
    const HAIR = solid(c, (ctx, x, y, w, h) => fill(ctx, x, y, w, h * 0.2, shade(c, 1.2)));
    const t = hs * 0.07;
    add(head, 'scalp', B(-hs * 0.52, hs * 0.8, -hs * 0.5, hs * 0.52, hs * 1.04, hs * 0.53), HAIR);
    for (let i = 0; i < 20; i++) { const x = (r() - 0.5) * hs * 0.95, z = (r() - 0.5) * hs * 0.95, len = hs * (0.4 + r() * 0.5); add(head, 'static-up', B(x - t, hs * 1.0, z - t, x + t, hs * 1.0 + len, z + t), HAIR); }
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const y = hs * (0.55 + r() * 0.45), z = (r() - 0.3) * hs * 0.8, len = hs * (0.35 + r() * 0.4); add(head, 'static-side', B(s > 0 ? hs * 0.5 : -hs * 0.5 - len, y - t, z - t, s > 0 ? hs * 0.5 + len : -hs * 0.5, y + t, z + t), HAIR); }
    for (let i = 0; i < 7; i++) { const x = (r() - 0.5) * hs * 0.9, y = hs * (0.55 + r() * 0.45), len = hs * (0.35 + r() * 0.4); add(head, 'static-back', B(x - t, y - t, hs * 0.5, x + t, y + t, hs * 0.5 + len), HAIR); }
  },
  /**
   * Bombardier: the ribcage laid bare, swollen pink lungs and dark organs bulging out round the
   * ribs (each on a node that swells: FX cystPulse via H.cysts).
   */
  lungRibs(H) {
    const { b, body, legH, torsoTop, add, recipe, fx } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    const y0 = legH + b.torsoH * 0.35, y1 = torsoTop - 0.06;
    const BONE = (k) => (ctx, x, y, ww, hh, side) => bone(ctx, x, y, ww, hh, rng(`${recipe.id}|lrib|${k}|${side}`));
    const LUNG = (ctx, x, y, ww, hh, side) => { const r = rng(`${recipe.id}|lung|${side}${ww}`); fill(ctx, x, y, ww, hh, 0xd88a90); blobs(ctx, x, y, ww, hh, 0xb05a64, 3, Math.min(ww, hh) * 0.15, r); veins(ctx, x, y, ww, hh, 0x7a2a3a, 3, r); fill(ctx, x + ww * 0.2, y + hh * 0.15, ww * 0.3, hh * 0.2, 0xf0b0b4); };
    add(body, 'cavity', B(-w * 0.75, y0, -d - 0.005, w * 0.75, y1, -d + 0.01), solid(0x3a0e10, (ctx, x, y, ww, hh) => blobs(ctx, x, y, ww, hh, 0x6a1a1a, 3, Math.min(ww, hh) * 0.2, rng(`${recipe.id}|cav`))));
    add(body, 'sternum', B(-0.025, y0, -d - 0.06, 0.025, y1 + 0.02, -d - 0.02), BONE('st'));
    for (let i = 0; i < 4; i++) { const y = y1 - i * (y1 - y0) / 4 - 0.02; for (const s of [-1, 1]) add(body, 'rib', B(s > 0 ? 0.02 : -w * 0.8, y - 0.022, -d - 0.05, s > 0 ? w * 0.8 : -0.02, y, -d - 0.02), BONE(`${i}${s}`)); }
    H.cysts = [];
    for (const [x, y, sz] of [[-w * 0.55, (y0 + y1) / 2 + 0.03, 0.2], [w * 0.55, (y0 + y1) / 2, 0.21], [-w * 0.95, y0 + 0.05, 0.13], [w * 0.2, y0 - 0.02, 0.15]]) {
      const n = fx.node(body, 'lung', new THREE.Vector3(x, y, -d - sz * 0.25));
      add(n, 'lung', B(-sz / 2, -sz * 0.6, -sz * 0.35, sz / 2, sz * 0.6, sz * 0.3), LUNG);
      H.cysts.push(n);
    }
  },
  /**
   * Boomer glutton: no longer a body but a great ball of flesh and fat it rolls about on; the
   * face sunk into its front (bulging eyes and a gaping maw: bigEyes, bigJaw), vestigial arms and
   * legs flopping from it. The ball swells (FX heave via H.belly). Use with pose 'blob'.
   */
  /**
   * Brainless: the face and the top of the skull torn away, a raw crater where the features were and
   * an empty, open cranium; the ears are still there.
   */
  facelessHead(H) {
    const { hs, head, add, skin, recipe } = H;
    const raw = (key) => (ctx, x, y, w, h, side) => { const r = rng(`${recipe.id}|crater|${key}|${side}`); fill(ctx, x, y, w, h, 0x3a0c10); blobs(ctx, x, y, w, h, 0x6a1a1e, 4, Math.min(w, h) * 0.18, r); blobs(ctx, x, y, w, h, 0x8a3038, 2, Math.min(w, h) * 0.1, r); };
    add(head, 'crater', B(-hs * 0.4, hs * 0.06, -hs / 2 - 0.006, hs * 0.4, hs * 0.86, -hs / 2 + 0.03), raw('f'));
    // Ragged flesh round the crater's rim.
    const rim = solid(0x8a3a44, (ctx, x, y, w, h) => blood(ctx, x, y, w, h, 2, rng(`${recipe.id}|rim${w}`)));
    add(head, 'rim', B(-hs * 0.44, hs * 0.02, -hs / 2 - 0.016, hs * 0.44, hs * 0.08, -hs / 2 + 0.01), rim);
    for (const s of [-1, 1]) add(head, 'rim', B(s > 0 ? hs * 0.38 : -hs * 0.46, hs * 0.04, -hs / 2 - 0.014, s > 0 ? hs * 0.46 : -hs * 0.38, hs * 0.84, -hs / 2 + 0.01), rim);
    // The open cranium: the skull cap gone, the cavity empty, splinters of bone round its edge.
    add(head, 'cranium', B(-hs * 0.4, hs * 0.86, -hs * 0.48, hs * 0.4, hs + 0.006, hs * 0.22), raw('t'));
    for (const [x, z] of [[-0.44, -0.4], [0.32, -0.46], [-0.44, 0.12], [0.36, 0.16], [-0.1, 0.22]]) add(head, 'skull-shard', B(hs * x, hs * 0.94, hs * z, hs * (x + 0.12), hs * 1.06, hs * (z + 0.1)), solid(0xe0d8c0));
    // The ears, intact.
    for (const s of [-1, 1]) add(head, 'ear', B(s > 0 ? hs * 0.5 : -hs * 0.5 - 0.03, hs * 0.32, -hs * 0.08, s > 0 ? hs * 0.5 + 0.03 : -hs * 0.5, hs * 0.62, hs * 0.08), solid(skin, (ctx, x, y, w, h) => fill(ctx, x + w * 0.3, y + h * 0.25, w * 0.4, h * 0.5, shade(skin, 0.7))));
  },
  /**
   * Gangrenous crawler / impaler: spider legs grown from the disjointed ribs, three pairs out of the
   * flanks. Drawn in body space as for the creep pose (chest down: the ground is towards −Z).
   */
  ribLegs(H) {
    const { b, body, legH, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, k = recipe.ribLegs ?? 1;
    const BONE = (key) => (ctx, x, y, ww, hh, side) => { bone(ctx, x, y, ww, hh, rng(`${recipe.id}|rleg|${key}|${side}`)); veins(ctx, x, y, ww, hh, 0x6a2a2a, 1, rng(`${recipe.id}|rlv|${key}|${side}`)); };
    for (let i = 0; i < 3; i++) {
      const y = legH + b.torsoH * (0.3 + i * 0.2), t = 0.035 * k;
      for (const s of [-1, 1]) {
        const out = (0.2 + (i === 1 ? 0.05 : 0)) * k, down = 0.42 * k, x0 = s * w, x1 = s * (w + out);
        add(body, `rib-leg-a${i}`, B(Math.min(x0, x1), y - t / 2, -d * 0.3 - t / 2, Math.max(x0, x1), y + t / 2, -d * 0.3 + t / 2), BONE(`a${i}${s}`));
        add(body, `rib-knee${i}`, B(x1 - t * 0.8, y - t * 0.8, -d * 0.3 - t * 0.8, x1 + t * 0.8, y + t * 0.8, -d * 0.3 + t * 0.8), BONE(`k${i}${s}`));
        add(body, `rib-leg-b${i}`, B(x1 - t / 2 + s * 0.04 * k, y - t / 2, -d * 0.3 - down, x1 + t / 2 + s * 0.04 * k, y + t / 2, -d * 0.3), BONE(`b${i}${s}`));
      }
    }
  },
  /** Gangrenous impaler: a hollow tendril reaching out from the open thorax, past the head. */
  chestTendril(H) {
    const { b, body, legH, torsoTop, add, skin, recipe, fx } = H, d = b.torsoD / 2;
    const flesh = (key) => (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, shade(skin, 0.85)); for (const at of [0.25, 0.6]) band(ctx, x, y, w, h, shade(skin, 0.62), at, 0.06); veins(ctx, x, y, w, h, 0x5a1a22, 1, rng(`${recipe.id}|ten|${key}|${side}`)); };
    const y0 = legH + b.torsoH * 0.55, t = 0.06;
    add(body, 'thorax', B(-b.torsoW * 0.3, legH + b.torsoH * 0.3, -d - 0.006, b.torsoW * 0.3, torsoTop - 0.08, -d + 0.01), solid(0x3a0e10, (ctx, x, y, w, h) => blobs(ctx, x, y, w, h, 0x7a2028, 3, Math.min(w, h) * 0.2, rng(`${recipe.id}|thx`))));
    // Out of the chest (−Z, towards the ground in the creep pose), then forward along the spine.
    add(body, 'tendril-root', B(-t / 2, y0 - t / 2, -d - 0.12, t / 2, y0 + t / 2, -d), flesh('r'));
    const tip = fx.node(body, 'tendril', new THREE.Vector3(0, y0, -d - 0.12));
    for (let i = 0; i < 4; i++) add(tip, 'tendril', B(-t / 2 + i * 0.004, i * 0.11, -t / 2 + i * 0.004, t / 2 - i * 0.004, (i + 1) * 0.11 + 0.01, t / 2 - i * 0.004), flesh(`s${i}`));
    add(tip, 'tendril-mouth', B(-t * 0.32, 0.45, -t * 0.32, t * 0.32, 0.452, t * 0.32), solid(0x1a0406));
    H.tip = tip;
  },
  /**
   * A weapon held in the right hand (recipe.weapon): 'pipe' (a length of steel pipe), 'crowbar'
   * (hooked, painted bar), 'knife' (kitchen knife). Hangs along the hand, so it follows the pose.
   */
  heldWeapon(H) {
    const { arms, b, add, recipe } = H, hand = arms.R.hand, w = recipe.weapon ?? 'pipe', y0 = -b.hand * 0.6;
    const steel = (hex) => solid(hex, (ctx, x, y, ww, hh) => { fill(ctx, x, y, ww * 0.25, hh, shade(hex, 1.25)); fill(ctx, x + ww * 0.75, y, ww * 0.25, hh, shade(hex, 0.75)); });
    if (w === 'pipe') {
      add(hand, 'pipe', B(-0.017, y0 - 0.42, -0.017, 0.017, y0 + 0.12, 0.017), steel(0x7a7e82));
      add(hand, 'pipe-end', B(-0.019, y0 - 0.44, -0.019, 0.019, y0 - 0.41, 0.019), solid(0x5a5e62, (ctx, x, y, ww, hh, side) => { if (side === 'bottom') fill(ctx, x + ww * 0.3, y + hh * 0.3, ww * 0.4, hh * 0.4, 0x1a1a1a); }));
    } else if (w === 'crowbar') {
      add(hand, 'crowbar', B(-0.012, y0 - 0.5, -0.012, 0.012, y0 + 0.1, 0.012), steel(0x2a2a2e));
      add(hand, 'crowbar-hook', B(-0.012, y0 - 0.52, -0.11, 0.012, y0 - 0.48, 0.012), steel(0x2a2a2e));
      add(hand, 'crowbar-claw', B(-0.014, y0 - 0.52, -0.13, 0.014, y0 - 0.44, -0.1), steel(0x2a2a2e));
      add(hand, 'crowbar-paint', B(-0.0125, y0 - 0.3, -0.0125, 0.0125, y0 - 0.1, 0.0125), solid(0xb8282a));
    } else if (w === 'knife') {
      add(hand, 'knife-grip', B(-0.012, y0 - 0.04, -0.016, 0.012, y0 + 0.07, 0.016), solid(0x1e1e20));
      add(hand, 'knife-blade', B(-0.004, y0 - 0.2, -0.018, 0.004, y0 - 0.04, 0.012), steel(0xc8ccd0));
    }
  },
  fleshBall(H) {
    const { b, body, head, shoulders, arms, legs, add, remove, skin, recipe, fx } = H, k = recipe.ball ?? 1;
    remove((n) => /^(torso|neck|upper_arm|forearm|hand|thigh|shin|foot)(\.|$)/.test(n));
    const W = 0.76 * k, Ht = 0.62 * k, D = 0.66 * k;
    const FLESH = (key) => (ctx, x, y, ww, hh, side) => { const r = rng(`${recipe.id}|ball|${key}|${side}`); fill(ctx, x, y, ww, hh, skin); for (const at of [0.3, 0.62]) band(ctx, x, y, ww, hh, shade(skin, 0.78), at, 0.04); blobs(ctx, x, y, ww, hh, shade(skin, 0.88), 3, Math.min(ww, hh) * 0.12, r); wounds(ctx, x, y, ww, hh, 2, r); veins(ctx, x, y, ww, hh, shade(skin, 0.6), 2, r); };
    const ball = fx.node(body, 'belly', new THREE.Vector3(0, Ht / 2, 0));
    add(ball, 'ball', B(-W / 2, -Ht / 2, -D / 2, W / 2, Ht / 2, D / 2), FLESH('b'));
    add(ball, 'ball-roll', B(-W * 0.4, Ht / 2 - 0.01, -D * 0.38, W * 0.42, Ht / 2 + 0.1 * k, D * 0.4), FLESH('t'));
    add(ball, 'ball-roll', B(-W / 2 - 0.06 * k, -Ht * 0.25, -D * 0.4, W / 2 + 0.06 * k, Ht * 0.12, D * 0.42), FLESH('s'));
    H.belly = ball;
    // The face pushed into the front of the ball.
    head.position.set(0, Ht * 0.3, -D / 2 + b.head * 0.38);
    // Vestigial limbs: short, thin, hanging off the sides and the bottom front.
    shoulders.position.set(0, Ht * 0.7, 0);
    for (const [L, s] of [['L', -1], ['R', 1]]) {
      arms[L].upper.position.set(s * (W / 2 + 0.06 * k), 0, -D * 0.1);
      add(arms[L].upper, `stub-arm.${L}`, C(b.armW * 0.7, -0.16, 0, b.armD * 0.7), H.part('upper_arm'));
      arms[L].fore.position.set(0, -0.16, 0);
      add(arms[L].fore, `stub-fore.${L}`, C(b.armW * 0.6, -0.12, 0, b.armD * 0.6), H.part('forearm'));
      arms[L].hand.position.set(0, -0.12, 0);
      add(arms[L].hand, `stub-hand.${L}`, C(b.handW * 0.7, -0.07, 0, b.armD * 0.7), H.part('hand'));
      legs[L].thigh.position.set(s * W * 0.28, Ht * 0.2, -D / 2 + 0.06);
      add(legs[L].thigh, `stub-leg.${L}`, C(b.legW * 0.7, -0.18, 0, b.legD * 0.7), H.part('thigh'));
      if (legs[L].shin) { legs[L].shin.position.set(0, -0.18, 0); add(legs[L].shin, `stub-foot.${L}`, B(-b.legW * 0.35, -0.08, -0.06, b.legW * 0.35, 0, b.legD * 0.35), H.part('foot')); }
    }
  },
  /** Rust zombie: rusted rebar and pipe driven right through the body (chest, belly, a shoulder, a thigh). */
  impaled(H) {
    const { b, body, legH, torsoTop, arms, legs, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    const BAR = (key) => (ctx, x, y, ww, hh, side) => { const r = rng(`${recipe.id}|bar|${key}|${side}`); fill(ctx, x, y, ww, hh, 0x6a5040); rust(ctx, x, y, ww, hh, r); for (let i = 0; i < hh; i += 4) fill(ctx, x, y + i, ww, 1, 0x4a3020); };
    const t = 0.022;
    for (const [x, y, len] of [[-w * 0.4, torsoTop - 0.15, 0.22], [w * 0.3, legH + b.torsoH * 0.35, 0.28]]) add(body, 'rebar', B(x - t, y - t, -d - len, x + t, y + t, d + len * 0.7), BAR(`${x}`));
    add(body, 'pipe', B(-w - 0.2, legH + b.torsoH * 0.6 - 0.03, -0.03, w + 0.12, legH + b.torsoH * 0.6 + 0.03, 0.03), BAR('pipe'));
    add(arms.R.upper, 'rebar', B(-t, -0.12 - t, -b.armD / 2 - 0.16, t, -0.12 + t, b.armD / 2 + 0.12), BAR('arm'));
    if (legs.L.shin) add(legs.L.thigh, 'rebar', B(-b.legW / 2 - 0.14, -0.2 - t, -t, b.legW / 2 + 0.1, -0.2 + t, t), BAR('leg'));
  },
  /**
   * Rust plated: the skin ruptured over plates of rusted metal arranged like armour beneath it,
   * black sludge where the rust has receded.
   */
  rustArmor(H) {
    const { skin, recipe } = H;
    shellPlates(H, (key) => (ctx, x, y, ww, hh, side) => {
      const r = rng(`${recipe.id}|rarmor|${key}|${side}`);
      fill(ctx, x, y, ww, hh, 0x6a6258); rust(ctx, x, y, ww, hh, r); rust(ctx, x, y, ww, hh, r);
      blobs(ctx, x, y, ww, hh, 0x141010, 2, Math.min(ww, hh) * 0.14, r);
      // The torn skin round the rupture.
      ctx.fillStyle = css(shade(skin, 0.9)); for (let k = 0; k < ww; k += 3) { ctx.fillRect(x + k, y, 3, Math.max(1, hh * (0.05 + r() * 0.12))); ctx.fillRect(x + k, y + hh - Math.max(1, hh * (0.05 + r() * 0.12)), 3, hh); }
    });
  },
  /**
   * Rust shell: jagged fragments of rust-bitten metal fused into the back in overlapping rows
   * like a shell, the spine shoved off to one side between them.
   */
  rustShell(H) {
    const { b, body, legH, torsoTop, arms, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, r = rng(`${recipe.id}|rshell`);
    const METAL = (key) => (ctx, x, y, ww, hh, side) => { const q = rng(`${recipe.id}|rs|${key}|${side}`); fill(ctx, x, y, ww, hh, 0x5e5850); rust(ctx, x, y, ww, hh, q); fill(ctx, x, y, ww, Math.max(1, hh * 0.08), 0x9a9288); blobs(ctx, x, y, ww, hh, 0x2a1a14, 1, Math.min(ww, hh) * 0.2, q); };
    for (let row = 0; row < 4; row++) {
      const y0 = legH + b.torsoH * (0.12 + row * 0.22), out = 0.05 + row * 0.025;
      for (let i = 0; i < 3; i++) { const x0 = -w * 0.95 + i * w * 0.66 + (r() - 0.5) * 0.04, ww = w * (0.6 + r() * 0.2), hh = b.torsoH * (0.22 + r() * 0.08); add(body, 'shell-plate', B(x0, y0, d - 0.01, x0 + ww, y0 + hh, d + out + r() * 0.03), METAL(`${row}${i}`)); }
      add(body, 'shell-shard', B(-w * 0.2 + (r() - 0.5) * w, y0 + 0.02, d + out, -w * 0.2 + (r() - 0.5) * w + 0.04, y0 + 0.08, d + out + 0.08), METAL(`s${row}`));
    }
    // The displaced spine: a knobbed ridge pushed out to the right.
    for (let i = 0; i < 6; i++) { const y = legH + 0.04 + i * b.torsoH * 0.16; add(body, 'spine', B(w * 0.55 - 0.03, y, d + 0.06, w * 0.55 + 0.03, y + 0.06, d + 0.14), (ctx, x, yy, ww, hh, side) => bone(ctx, x, yy, ww, hh, rng(`${recipe.id}|sp${i}|${side}`))); }
    for (const L of ['L', 'R']) add(arms[L].upper, `shell-pauldron.${L}`, C(b.armW * 1.3, -0.13, 0.05, b.armD * 1.3), METAL(`p${L}`));
  },
  /** Rust urchin: covered in long rusty spikes jutting out in every direction. */
  rustSpikes(H) {
    const { b, body, legH, torsoTop, arms, legs, head, hs, add, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2, r = rng(`${recipe.id}|urchin`);
    const SPIKE = (key) => (ctx, x, y, ww, hh, side) => { const q = rng(`${recipe.id}|spk|${key}|${side}`); fill(ctx, x, y, ww, hh, 0x6a4a34); rust(ctx, x, y, ww, hh, q); };
    const t = 0.018, L = recipe.spikeLength ?? 1.4;
    const spike0 = (parent, ax, at, len, key) => {
      const [x, y, z] = at, s = Math.sign(ax[1]) || 1;
      const box = ax[0] === 'x' ? B(s > 0 ? x : x - len, y - t, z - t, s > 0 ? x + len : x, y + t, z + t)
        : ax[0] === 'y' ? B(x - t, s > 0 ? y : y - len, z - t, x + t, s > 0 ? y + len : y, z + t)
        : B(x - t, y - t, s > 0 ? z : z - len, x + t, y + t, s > 0 ? z + len : z);
      add(parent, 'spike', box, SPIKE(key));
    };
    const spike = (p, ax, at, len, key) => spike0(p, ax, at, len * L, key);
    for (let i = 0; i < 10; i++) spike(body, ['z', -1], [(r() - 0.5) * w * 1.7, legH + b.torsoH * (0.1 + r() * 0.85), -d], 0.16 + r() * 0.16, `f${i}`);
    for (let i = 0; i < 10; i++) spike(body, ['z', 1], [(r() - 0.5) * w * 1.7, legH + b.torsoH * (0.1 + r() * 0.85), d], 0.18 + r() * 0.18, `b${i}`);
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) spike(body, ['x', s], [s * w, legH + b.torsoH * (0.15 + r() * 0.7), (r() - 0.5) * d], 0.14 + r() * 0.12, `s${s}${i}`);
    for (let i = 0; i < 6; i++) spike(head, ['y', 1], [(r() - 0.5) * hs * 0.8, hs, (r() - 0.5) * hs * 0.8], 0.12 + r() * 0.1, `h${i}`);
    spike(head, ['z', 1], [hs * 0.1, hs * 0.6, hs / 2], 0.14, 'hb');
    for (const [L, s] of [['L', -1], ['R', 1]]) {
      spike(arms[L].upper, ['y', 1], [0, 0.04, 0], 0.16, `sh${L}`);
      spike(arms[L].upper, ['x', s], [s * b.armW / 2, -b.upperArm * 0.5, 0], 0.14, `ua${L}`);
      spike(arms[L].fore, ['z', 1], [0, -b.forearm * 0.4, b.armD / 2], 0.14, `fa${L}`);
      if (legs[L].shin) { spike(legs[L].thigh, ['x', s], [s * b.legW / 2, -b.thigh * 0.4, 0], 0.13, `th${L}`); spike(legs[L].shin, ['z', -1], [0, -0.02, -b.legD / 2], 0.12, `kn${L}`); }
    }
  },
  /**
   * Fiend: tattered, blackened strands of muscle fibre dangling all round the body, each on a
   * node of its own so it can sway (FX strandSway).
   */
  muscleStrands(H) {
    const { b, body, legH, arms, add, recipe, fx } = H, r = rng(`${recipe.id}|strands`), w = b.torsoW / 2, d = b.torsoD / 2;
    const MEAT = (key) => (ctx, x, y, ww, hh, side) => { const q = rng(`${recipe.id}|strand|${key}|${side}`); muscle(ctx, x, y, ww, hh, q); blobs(ctx, x, y, ww, hh, 0x1e1a18, 2, Math.min(ww, hh) * 0.3, q); };
    H.strands = [];
    const hang = (parent, at, len, t, key) => { const n = fx.node(parent, 'strand', at); add(n, 'strand', B(-t / 2, -len, -t / 2, t / 2, 0, t / 2), MEAT(key)); H.strands.push(n); };
    const t = Math.max(0.03, b.torsoW * 0.06);
    for (let i = 0; i < 6; i++) hang(body, new THREE.Vector3((r() - 0.5) * w * 1.7, legH + b.torsoH * (0.15 + r() * 0.7), -d - t / 2), b.torsoH * (0.2 + r() * 0.2), t, `f${i}`);
    for (let i = 0; i < 3; i++) hang(body, new THREE.Vector3(i % 2 ? w + t / 2 : -w - t / 2, legH + b.torsoH * (0.3 + r() * 0.5), (r() - 0.5) * d), b.torsoH * (0.2 + r() * 0.15), t, `s${i}`);
    for (const L of ['L', 'R']) for (let i = 0; i < 2; i++) hang(arms[L].upper, new THREE.Vector3((L === 'L' ? -1 : 1) * (b.armW / 2 + t / 2), -b.upperArm * (0.25 + i * 0.4), (r() - 0.5) * b.armD * 0.5), b.upperArm * 0.35, t * 0.8, `a${L}${i}`);
  },
  /**
   * Horns: a pair of horns from the head, each a few blocks stepping along a blocky curve, dark
   * at the root and pale at the tip. `recipe.horns`: { style, size } (size in head sizes):
   *   curved  — out from the temples, then up (the default)
   *   ram     — out to the sides and curling down and forward past the ears
   *   stub    — thick stumps sawn off flat at the brow
   *   spire   — tall, straight up, tapering
   *   bull    — straight out sideways, the tips turning up and forward
   *   twin    — a big curved pair with a short second pair in front of it
   *   swept   — long horns sweeping back along the skull
   *   branched — a curved main horn with a prong forking off it
   *   crown   — a ring of short spikes round the top of the head
   * The size follows the body (bigger demon, bigger horns): `size` defaults to 1 for a standard
   * body and grows with the torso width. Not in CDDA's descriptions: added at the user's request.
   */
  horns(H) {
    const { b, hs, head, add, recipe } = H, o = recipe.horns ?? {}, k = (o.size ?? Math.max(1, Math.sqrt(b.torsoW / 0.46))) * hs;
    // Segments: [width, x (from the head's centre, outward), y0, y1, z (forward −)], all × k,
    // starting from the head's top (y = hs).
    const SHAPES = {
      curved: [[0.26, 0.3, -0.12, 0.14, 0], [0.21, 0.44, 0.1, 0.32, 0.02], [0.15, 0.52, 0.3, 0.5, 0.05], [0.09, 0.55, 0.48, 0.62, 0.07]],
      ram: [[0.26, 0.38, -0.14, 0.12, 0.06], [0.24, 0.58, -0.04, 0.16, 0.12], [0.2, 0.7, -0.24, 0, 0.1], [0.16, 0.68, -0.42, -0.2, -0.02], [0.11, 0.6, -0.52, -0.38, -0.14]],
      stub: [[0.3, 0.3, -0.12, 0.12, -0.08], [0.28, 0.32, 0.1, 0.2, -0.1]],
      spire: [[0.24, 0.26, -0.12, 0.2, 0.02], [0.18, 0.29, 0.18, 0.46, 0.03], [0.12, 0.31, 0.44, 0.7, 0.04], [0.06, 0.32, 0.68, 0.86, 0.04]],
      bull: [[0.24, 0.42, -0.14, 0.08, -0.04], [0.22, 0.66, -0.1, 0.1, -0.04], [0.18, 0.86, -0.06, 0.12, -0.06], [0.13, 0.96, 0.08, 0.3, -0.12], [0.08, 0.98, 0.28, 0.42, -0.18]],
      twin: [[0.26, 0.32, -0.12, 0.14, 0.08], [0.21, 0.46, 0.1, 0.32, 0.1], [0.15, 0.54, 0.3, 0.5, 0.13], [0.09, 0.57, 0.48, 0.62, 0.15],
        [0.14, 0.16, -0.08, 0.1, -0.2], [0.09, 0.18, 0.08, 0.2, -0.24]],
      swept: [[0.24, 0.3, -0.1, 0.12, 0.05], [0.2, 0.34, 0.06, 0.2, 0.25], [0.16, 0.38, 0.12, 0.26, 0.45], [0.12, 0.42, 0.2, 0.34, 0.65], [0.07, 0.44, 0.3, 0.42, 0.82]],
      branched: [[0.26, 0.3, -0.12, 0.14, 0], [0.21, 0.42, 0.1, 0.34, 0.02], [0.16, 0.48, 0.32, 0.56, 0.04], [0.1, 0.5, 0.54, 0.72, 0.05],
        [0.11, 0.6, 0.2, 0.3, -0.06], [0.07, 0.7, 0.28, 0.42, -0.1]],
      crown: [[0.12, 0.38, -0.06, 0.2, -0.3], [0.08, 0.4, 0.18, 0.3, -0.32], [0.13, 0.42, -0.06, 0.26, 0.05], [0.08, 0.44, 0.24, 0.38, 0.06], [0.12, 0.34, -0.06, 0.18, 0.35], [0.07, 0.35, 0.16, 0.28, 0.38], [0.12, 0, -0.06, 0.3, -0.34], [0.07, 0, 0.28, 0.42, -0.36]],
    };
    const segs = SHAPES[o.style ?? 'curved'];
    const tones = [0x4a362a, 0x6a5444, 0x9a8670, 0xc8bca0, 0xece4cc];
    const HORN = (tone, key, cut) => (ctx, x, y, w, h, side) => {
      fill(ctx, x, y, w, h, tone);
      band(ctx, x, y, w, h, shade(tone, 0.7), 0.3, 0.1); band(ctx, x, y, w, h, shade(tone, 0.7), 0.7, 0.1);
      blobs(ctx, x, y, w, h, shade(tone, 1.25), 1, Math.min(w, h) * 0.2, rng(`${recipe.id}|horn|${key}|${side}`));
      if (cut && side === 'top') { fill(ctx, x, y, w, h, 0xc8bca0); fill(ctx, x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4, 0x9a8e74); }
    };
    for (const s of [-1, 1]) {
      segs.forEach(([w, x, y0, y1, z], i) => {
        // The tone follows how far up the horn the block is: dark at the root, pale at the tip.
        const top = Math.max(...segs.map((g) => g[3])), d = w * k, cx = s * x * k, cz = -hs * 0.18 + z * k, tone = tones[Math.max(0, Math.min(tones.length - 1, Math.round((y1 / top) * (tones.length - 1))))];
        add(head, 'horn', B(cx - d / 2, hs + y0 * k, cz - d / 2, cx + d / 2, hs + y1 * k, cz + d / 2), HORN(o.style === 'stub' ? 0x6a5444 : tone, `${s}${i}`, o.style === 'stub' && i === segs.length - 1));
      });
    }
  },
  /**
   * Anklebiter: massive gaping jaws, the lower jaw hanging open well below the chin, the mouth
   * a dark red hole lined with teeth.
   */
  bigJaw(H) {
    const { hs, head, add, skin, recipe } = H, f = -hs / 2;
    const TEETH = 0xe0d8c0, GUM = 0x5a1414;
    add(head, 'maw', B(-hs * 0.42, -hs * 0.05, f - 0.02, hs * 0.42, hs * 0.4, f + 0.02), solid(GUM, (ctx, x, y, w, h, side) => { if (side === 'front') { fill(ctx, x + w * 0.15, y + h * 0.25, w * 0.7, h * 0.6, 0x1a0606); fill(ctx, x + w * 0.35, y + h * 0.6, w * 0.3, h * 0.25, 0x8a2a30); } }));
    add(head, 'snout', B(-hs * 0.47, hs * 0.36, f - 0.06, hs * 0.47, hs * 0.48, f + 0.01), solid(shade(skin, 0.95), (ctx, x, y, w, h, side) => { if (side === 'front') veins(ctx, x, y, w, h, shade(skin, 0.6), 1, rng(`${recipe.id}|snout`)); }));
    add(head, 'jaw', B(-hs * 0.45, -hs * 0.42, f - 0.07, hs * 0.45, -hs * 0.28, f + hs * 0.3), solid(shade(skin, 0.9), (ctx, x, y, w, h, side) => { if (side === 'top') fill(ctx, x + w * 0.1, y, w * 0.8, h * 0.8, GUM); }));
    add(head, 'jaw-hinge', B(-hs * 0.45, -hs * 0.3, f + hs * 0.18, hs * 0.45, hs * 0.05, f + hs * 0.3), solid(shade(skin, 0.85)));
    for (let i = 0; i < 6; i++) {
      const x = -hs * 0.38 + i * hs * 0.152, s = 0.016;
      add(head, 'tooth', B(x - s, hs * 0.22, f - 0.055, x + s, hs * 0.37, f - 0.025), solid(TEETH));
      add(head, 'tooth', B(x - s, -hs * 0.29, f - 0.065, x + s, -hs * 0.12, f - 0.035), solid(TEETH));
    }
  },
  /**
   * Huge eyes bulging from the face (creepy crawler, sproglodyte): too big for the face canvas,
   * so 3D blocks. `recipe.bigEyes`: { color, size (in head sizes), glint }.
   */
  bigEyes(H) {
    const { hs, head, add, skin, recipe } = H, o = recipe.bigEyes ?? {}, s = hs * (o.size ?? 0.34), color = o.color ?? 0x0a0a0a, f = -hs / 2, cy = hs * 0.52;
    for (const x of [-hs * 0.23, hs * 0.23]) {
      add(head, 'eye-socket', B(x - s / 2 - 0.012, cy - s / 2 - 0.012, f - 0.012, x + s / 2 + 0.012, cy + s / 2 + 0.012, f + 0.01), solid(shade(skin, 0.5)));
      add(head, 'big-eye', B(x - s / 2, cy - s / 2, f - 0.035, x + s / 2, cy + s / 2, f), solid(color, (ctx, xx, y, w, h, side) => { if (side === 'front' && o.glint !== false) fill(ctx, xx + w * 0.18, y + h * 0.15, w * 0.22, h * 0.22, 0xf0f0f0); }), o.glow ? { glow: true } : undefined);
    }
  },
  /**
   * Wretched hatchery: the ribcage arched outward from the belly into a hive under severely
   * stretched skin, small forms swarming inside (FX swarm) and the gut churning (FX hivePulse).
   */
  ribHive(H) {
    const { b, body, legH, torsoTop, add, skin, recipe, fx } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    const y0 = legH + b.torsoH * 0.08, y1 = torsoTop - 0.04, depth = b.torsoD * 0.9, hy = (y1 - y0) / 2;
    const SKIN = (ctx, x, y, ww, hh, side) => { const r = rng(`${recipe.id}|hive|${side}${ww}`); fill(ctx, x, y, ww, hh, shade(skin, 1.12)); veins(ctx, x, y, ww, hh, 0x8a3a44, 4, r); blobs(ctx, x, y, ww, hh, 0x3a1a20, 3, Math.min(ww, hh) * 0.12, r); };
    const BONE = (k) => (ctx, x, y, ww, hh, side) => bone(ctx, x, y, ww, hh, rng(`${recipe.id}|hiverib|${k}|${side}`));
    const hive = fx.node(body, 'hive', new THREE.Vector3(0, (y0 + y1) / 2, -d));
    add(hive, 'hive-skin', B(-w * 0.85, -hy, -depth, w * 0.85, hy, 0.01), SKIN);
    add(hive, 'hive-skin', B(-w * 0.6, -hy * 0.7, -depth - 0.05, w * 0.6, hy * 0.7, -depth + 0.01), SKIN);
    for (let i = 0; i < 4; i++) {
      const y = -hy * 0.75 + i * hy * 0.5, t = 0.022;
      add(hive, 'hive-rib', B(-w * 0.95, y - t, -depth - 0.065, w * 0.95, y + t, -depth - 0.035), BONE(`r${i}`));
      for (const s of [-1, 1]) add(hive, 'hive-rib', B(s * w * 0.95 - t, y - t, -depth - 0.05, s * w * 0.95 + t, y + t, 0), BONE(`s${i}${s}`));
    }
    H.hive = hive;
    H.swarm = [];
    const r = rng(`${recipe.id}|swarm`);
    for (let i = 0; i < 5; i++) {
      const n = fx.node(hive, 'swarm', new THREE.Vector3((r() - 0.5) * w * 1.1, (r() - 0.5) * hy * 1.2, -depth - 0.06));
      const s = 0.03 + r() * 0.015;
      add(n, 'hatchling', B(-s / 2, -s / 2, -s / 2, s / 2, s / 2, s / 2), solid(0x8a4a4a, (ctx, x, y, ww, hh) => fill(ctx, x + ww * 0.2, y + hh * 0.2, ww * 0.25, hh * 0.25, 0x1a0a0a)));
      H.swarm.push(n);
    }
  },
  /**
   * Howling waif: a membrane of skin stretched across the tiny bones (with skeletalBody): thin
   * pale sheets over the rib cage front, back and sides, the ribs showing through as shadows.
   */
  skinMembrane(H) {
    const { b, body, legH, torsoTop, add, skin, recipe } = H, w = b.torsoW / 2, d = b.torsoD / 2;
    const SHEET = (k) => (ctx, x, y, ww, hh, side) => { fill(ctx, x, y, ww, hh, skin); for (let i = 1; i < 6; i++) band(ctx, x, y, ww, hh, shade(skin, 0.72), i / 6.5, 0.035); veins(ctx, x, y, ww, hh, shade(skin, 0.6), 2, rng(`${recipe.id}|membrane|${k}|${side}`)); };
    add(body, 'membrane', B(-w * 0.92, legH + b.torsoH * 0.32, -d - 0.006, w * 0.92, torsoTop - 0.04, -d + 0.006), SHEET('f'));
    add(body, 'membrane', B(-w * 0.85, legH + b.torsoH * 0.2, d * 0.6 - 0.006, w * 0.85, torsoTop - 0.04, d * 0.6 + 0.006), SHEET('b'));
    for (const s of [-1, 1]) add(body, 'membrane', B(s > 0 ? w * 0.92 : -w * 0.92 - 0.012, legH + b.torsoH * 0.3, -d, s > 0 ? w * 0.92 + 0.012 : -w * 0.92, torsoTop - 0.05, d * 0.6), SHEET(`s${s}`));
  },
  /** Child: a small backpack. */
  backpack(H) {
    const { b, body, legH, torsoTop, add } = H, d = b.torsoD / 2, pack = 0x7a4a8e;
    add(body, 'backpack', B(-b.torsoW * 0.36, legH + b.torsoH * 0.2, d, b.torsoW * 0.36, torsoTop - 0.03, d + 0.1), solid(pack, (ctx, x, y, w, h, side) => { if (side === 'back') { fill(ctx, x + w * 0.15, y + h * 0.5, w * 0.7, h * 0.35, shade(pack, 0.8)); fill(ctx, x + w * 0.45, y + h * 0.1, w * 0.1, h * 0.1, 0xe0c040); } }));
  },
  /** Fat: a belly pushing out under a shirt that rides up. */
  belly(H) {
    const { b, body, legH, add, recipe } = H, d = b.torsoD / 2;
    add(body, 'belly', B(-b.torsoW * 0.42, legH + 0.05, -d - 0.1, b.torsoW * 0.42, legH + b.torsoH * 0.62, -d), (ctx, x, y, w, h, side) => {
      fill(ctx, x, y, w, h, recipe.skin);
      if (side === 'front' || side === 'left' || side === 'right' || side === 'top') fill(ctx, x, y, w, h * (side === 'top' ? 1 : 0.38), recipe.outfit.top);
      if (side === 'front') { fill(ctx, x + w * 0.47, y + h * 0.62, w * 0.06, h * 0.06, shade(recipe.skin, 0.6)); blood(ctx, x, y + h * 0.4, w, h * 0.6, 1, rng(`${recipe.id}|belly`)); }
    });
  },
  /** Brute: a hump of muscle on the back and swollen shoulders, with festering wounds. */
  hump(H) {
    const { b, body, torsoTop, add, skin, recipe } = H, d = b.torsoD / 2;
    const flesh = (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, skin); wounds(ctx, x, y, w, h, 2, rng(`${recipe.id}|hump|${side}`)); };
    add(body, 'hump', B(-b.torsoW * 0.32, torsoTop - 0.34, d - 0.02, b.torsoW * 0.32, torsoTop + 0.08, d + 0.14), flesh);
  },
  muscles(H) {
    const { b, arms, add, skin, recipe } = H;
    for (const L of ['L', 'R']) add(arms[L].upper, `muscle.${L}`, C(b.armW * 1.4, -b.upperArm * 0.55, 0.05, b.armD * 1.35), (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, skin); wounds(ctx, x, y, w, h, 1, rng(`${recipe.id}|muscle${L}|${side}`)); veins(ctx, x, y, w, h, shade(skin, 0.6), 1, rng(`${recipe.id}|mv${L}${side}`)); });
  },
  /** Hulk: lumps of swollen flesh on the back and arms, forearms as wide as trash cans. */
  lumps(H) {
    const { b, body, torsoTop, arms, add, skin, recipe } = H, d = b.torsoD / 2;
    const flesh = (k) => (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, shade(skin, k)); wounds(ctx, x, y, w, h, 1, rng(`${recipe.id}|lump${k}|${side}`)); };
    add(body, 'lump-back', B(-b.torsoW * 0.38, torsoTop - 0.5, d - 0.02, b.torsoW * 0.1, torsoTop + 0.1, d + 0.22), flesh(0.95));
    add(body, 'lump-back2', B(b.torsoW * 0.05, torsoTop - 0.75, d - 0.02, b.torsoW * 0.4, torsoTop - 0.3, d + 0.16), flesh(0.9));
    for (const L of ['L', 'R']) add(arms[L].fore, `fore-lump.${L}`, C(b.armW * 1.25, -b.forearm * 0.85, -b.forearm * 0.15, b.armD * 1.25), flesh(1.02));
  },
  /** Shrieker: a swollen chest, and ragged stumps where the jaw was torn away. */
  chestSwell(H) {
    const { b, body, torsoTop, add, skin, recipe } = H, d = b.torsoD / 2;
    add(body, 'chest', B(-b.torsoW * 0.36, torsoTop - 0.36, -d - 0.08, b.torsoW * 0.36, torsoTop - 0.04, -d), (ctx, x, y, w, h, side) => { fill(ctx, x, y, w, h, shade(skin, 1.05)); veins(ctx, x, y, w, h, shade(skin, 0.55), 3, rng(`${recipe.id}|chest|${side}`)); });
  },
  jawStumps(H) {
    const { hs, head, add } = H;
    for (const s of [-1, 1]) add(head, 'jaw-stump', B(s > 0 ? hs * 0.3 : -hs * 0.5, -0.05, -hs * 0.5 - 0.025, s > 0 ? hs * 0.5 : -hs * 0.3, hs * 0.18, -hs * 0.3), solid(0x7a2a2a, (ctx, x, y, w, h, side) => { if (side === 'front') fill(ctx, x, y, w, h * 0.3, 0xd9d2b8); }));
    add(head, 'tongue', B(-hs * 0.07, -0.12, -hs * 0.48, hs * 0.07, hs * 0.1, -hs * 0.36), solid(0x8a3038));
  },
  /** Acidic: yellow fluid dripping from the chin and fingers, blisters swollen with it. */
  drips(H) {
    const { hs, head, arms, add, recipe } = H, acid = recipe.wear?.veins ?? 0xd8c020;
    add(head, 'drip', B(-0.015, -0.07, -hs * 0.5 - 0.01, 0.015, 0.01, -hs * 0.5 + 0.02), solid(acid));
    for (const L of ['L', 'R']) {
      add(arms[L].hand, `drip.${L}`, B(-0.012, -H.b.hand - 0.06, -0.012, 0.012, -H.b.hand, 0.012), solid(acid));
      add(arms[L].fore, `blister.${L}`, C(0.05, -0.16, -0.1, 0.05, L === 'L' ? -H.b.armW / 2 - 0.015 : H.b.armW / 2 + 0.015), solid(shade(acid, 0.95), (ctx, x, y, w, h) => fill(ctx, x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.3, 0xf8f0a0)));
    }
  },
};

// ── Effects (fx.js): looping, independent of the rig ─────────────────────────────────────────
const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const FX = {
  /** Boomer: putrid pink sludge dribbling from the mouth. */
  sludge(H) { H.fx.drip(H.head, V(0, H.hs * 0.22, -H.hs * 0.52), { color: 0xd8849a, size: 0.045, drop: 0.55, n: 3 }); },
  /** Boomer: the stench rising off it. */
  stench(H) { H.fx.puff(H.body, V(0, H.torsoTop - 0.1, 0), { color: 0x8a9a5a, size: 0.07, rise: 0.6, n: 4 }); },
  /** The immobile flesh ball has no upright torso. Its gas starts at the upper roll. */
  lowStench(H) {
    const y = 0.68 * (H.recipe.ball ?? 1);
    H.fx.puff(H.body, V(0, y, 0.04), { color: 0x8a9a5a, size: 0.045, rise: 0.32, n: 4 });
  },
  /** Boomer: the belly heaving. */
  heave(H) { if (H.belly) H.fx.pulse(H.belly, { amount: 0.08 }); },
  /** Gasbag: the cysts swelling one after another, putrid gas leaking from some. */
  cystPulse(H) { (H.cysts ?? []).forEach((c, i) => H.fx.pulse(c, { amount: 0.25, phase: i / (H.cysts.length || 1) })); },
  gasLeak(H) { for (const c of (H.cysts ?? []).slice(0, 3)) H.fx.puff(c.parent, c.position, { color: H.recipe.gasColor ?? 0x9aa070, size: 0.05, rise: 0.4, n: 2 }); },
  /** Scabbed: flakes of scab dropping off the arms and chest. */
  scabFlakes(H) {
    for (const L of ['L', 'R']) H.fx.flake(H.arms[L].upper, V(0, -0.1, -H.b.armD / 2 - 0.01), { color: shade(H.skin, 0.75), n: 2 });
    H.fx.flake(H.body, V(0, H.legH + H.b.torsoH * 0.6, -H.b.torsoD / 2 - 0.02), { color: shade(H.skin, 0.7), n: 3 });
  },
  /** Sailor, wretched puker: black ooze dripping from the hanging mouth. */
  blackOoze(H) { H.fx.drip(H.head, V(0, H.hs * 0.2, -H.hs * 0.52), { color: 0x141014, size: 0.04, drop: 0.5, n: 3 }); },
  /** Bilious soldier: corrosive fluid leaking from the proboscis tip, steaming. */
  proboscisAcid(H) {
    if (!H.tip) return;
    H.fx.drip(H.tip.node, H.tip.at, { color: 0xc8d030, size: 0.035, drop: 0.55, n: 3 });
    H.fx.puff(H.tip.node, H.tip.at, { color: 0xd8dcc8, size: 0.04, rise: 0.35, n: 2 });
  },
  /** Caustic soldier: the tubes pulsing in turn, acid dripping from their ends. */
  tubeDrip(H) {
    (H.tubes ?? []).forEach(({ node, tip }, i) => {
      H.fx.pulse(node, { amount: 0.2, phase: i / H.tubes.length });
      if (i % 2 === 0) H.fx.drip(node, tip, { color: 0xc8d030, size: 0.025, drop: 0.3, n: 1 });
    });
  },
  /** Acid from the hands (a corroded doctor). */
  acidHands(H) { for (const L of ['L', 'R']) H.fx.drip(H.arms[L].hand, V(0, -H.b.hand - 0.01, 0), { color: 0xd8c020, size: 0.03, drop: 0.4, n: 1 }); },
  /** Black ops: shadowy smoke radiating off the skin. */
  shadowSmoke(H) {
    const c = 0x1a1a22;
    H.fx.puff(H.body, V(0, H.torsoTop - 0.05, H.b.torsoD / 2), { color: c, size: 0.08, rise: 0.4, n: 3 });
    for (const L of ['L', 'R']) H.fx.puff(H.arms[L].fore, V(0, -H.b.forearm * 0.5, 0), { color: c, size: 0.06, rise: 0.3, n: 2 });
    H.fx.puff(H.head, V(0, H.hs, 0), { color: c, size: 0.06, rise: 0.3, n: 2 });
  },
  /** Hunter-killer: the wisps of shadow swelling and swaying. */
  wispSway(H) { (H.wisps ?? []).forEach((n, i) => H.fx.sway(n, { amount: 0.25, phase: i / H.wisps.length })); },
  /** Mercenary ghost: the shards shuddering in and out of place. */
  shardJitter(H) { (H.shards ?? []).forEach((n, i) => H.fx.jitter(n, { amount: 0.03, phase: i / H.shards.length })); },
  /** Corrosive: drops of acid falling from the congealed lumps. */
  gelDrip(H) { (H.cysts ?? []).slice(0, 4).forEach((c, i) => H.fx.drip(c.parent, c.position.clone().add(V(0, -0.05, 0)), { color: 0xc8d030, size: 0.03, drop: 0.45, n: 1 + (i % 2) })); },
  /** Spitter: the swollen stomach swelling and settling. */
  stomachPulse(H) { if (H.belly) H.fx.pulse(H.belly, { amount: 0.12 }); },
  /** Scorched: thin smoke still rising off the charred body ("still reeks of charred meat"). */
  charSmoke(H) {
    const { b, legH, torsoTop } = H;
    H.fx.puff(H.body, V(0, torsoTop - 0.05, 0), { color: 0x5a5650, size: 0.045 * Math.max(1, b.torsoW / 0.46), rise: 0.3, n: 3 });
    H.fx.puff(H.body, V(b.torsoW * 0.3, legH + b.torsoH * 0.4, -b.torsoD / 2), { color: 0x6a6660, size: 0.03, rise: 0.25, n: 2 });
  },
  /** Snotgobbler: green slime dripping from the mouth and the outstretched hands. */
  snot(H) {
    const green = 0x9ab040;
    H.fx.drip(H.head, V(0, H.hs * 0.2, -H.hs * 0.52), { color: green, size: 0.035, drop: 0.4, n: 2 });
    for (const L of ['L', 'R']) H.fx.drip(H.arms[L].hand, V(0, -H.b.hand - 0.01, 0), { color: green, size: 0.028, drop: 0.35, n: 1 });
  },
  /** Burning: small flames licking up from the shoulders, back and forearms. */
  flames(H) {
    const { b, body, legH, torsoTop, arms } = H, w = b.torsoW / 2, d = b.torsoD / 2, s = 0.05 * Math.max(1, b.torsoW / 0.6);
    for (const [x, y, z] of [[-w * 0.5, torsoTop, d * 0.3], [w * 0.4, torsoTop, -d * 0.2], [0, legH + b.torsoH * 0.6, d + 0.01], [w * 0.7, legH + b.torsoH * 0.3, d + 0.01]]) H.fx.flame(body, V(x, y, z), { size: s, rise: s * 4, n: 3 });
    for (const L of ['L', 'R']) H.fx.flame(arms[L].fore, V(0, -b.forearm * 0.3, b.armD / 2 + 0.01), { size: s * 0.8, rise: s * 3, n: 2 });
  },
  /** Electric: sparks crackling off the hands, shoulders and head. */
  sparks(H) {
    const { b, arms, head, hs, torsoTop, recipe } = H, c = recipe.sparkColor ?? 0xcfeeff;
    H.fx.spark(head, V(0, hs * 1.05, 0), { color: c, spread: hs * 0.6, n: 3 });
    H.fx.spark(H.body, V(0, torsoTop, 0), { color: c, spread: b.torsoW * 0.5, n: 3 });
    for (const L of ['L', 'R']) H.fx.spark(arms[L].hand, V(0, -b.hand, 0), { color: c, spread: 0.1, n: 2 });
  },
  /** Electric: the arcs of lightning flashing on and off (arcs). */
  arcFlicker(H) { (H.arcs ?? []).forEach((n, i) => H.fx.flicker(n, { k: 2 + (i % 3), duty: 0.3, phase: i * 0.37 })); },
  /** Incandescent husk: the field of lightning swelling and fading like a beating heart (arcs). */
  fieldPulse(H) { (H.arcs ?? []).forEach((n) => H.fx.pulse(n, { amount: 0.45, phase: 0 })); },
  /** Huge boomer: its changed bile, a sickly yellow-green, dribbling from the mouth. */
  bile(H) { H.fx.drip(H.head, V(0, H.hs * 0.22, -H.hs * 0.52), { color: 0xb8c830, size: 0.045, drop: 0.55, n: 3 }); },
  /** Tearjerker: mucus dripping off the face. */
  mucus(H) { H.fx.drip(H.head, V(H.hs * 0.15, H.hs * 0.35, -H.hs * 0.52), { color: 0xd8d8a0, size: 0.03, drop: 0.4, n: 2 }); },
  /** Fiend: dangling muscle strands swaying (muscleStrands). */
  strandSway(H) { (H.strands ?? []).forEach((n, i) => H.fx.sway(n, { amount: 0.08, phase: i / H.strands.length })); },
  /** Shriekling: the throat sac swelling with each shriek (throatSac). */
  sacPulse(H) { if (H.sac) H.fx.pulse(H.sac, { amount: 0.18 }); },
  /** Wretched hatchery: the small forms swarming under the skin (ribHive). */
  swarm(H) { (H.swarm ?? []).forEach((n, i) => H.fx.jitter(n, { amount: 0.025, phase: i / H.swarm.length })); },
  /** Wretched hatchery: the midsection churning (ribHive). */
  hivePulse(H) { if (H.hive) H.fx.pulse(H.hive, { amount: 0.06 }); },
  /** Skeletal: black goo seeping from the neck, elbows and knees. */
  goo(H) {
    const black = 0x141014;
    H.fx.drip(H.body, V(H.hs * 0.2, H.torsoTop - 0.02, -H.b.torsoD / 2 - 0.02), { color: black, size: 0.035, drop: 0.4, n: 2 });
    for (const L of ['L', 'R']) {
      H.fx.drip(H.arms[L].fore, V(0, -0.02, -H.b.armD / 2 - 0.01), { color: black, size: 0.03, drop: 0.35, n: 1 });
      if (H.legs[L].shin) H.fx.drip(H.legs[L].shin, V(0, -0.02, -H.b.legD / 2 - 0.01), { color: black, size: 0.03, drop: 0.3, n: 1 });
    }
  },
};
