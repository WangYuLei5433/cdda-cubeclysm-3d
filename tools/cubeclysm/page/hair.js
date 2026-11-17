// Cubeclysm hair styles: hair as 3D blocks around the cube head (head joint space: the head spans
// x, z in ±hs/2 and y from 0 to hs; its front faces −Z). Every style keeps clear of the brows and
// the face; `fringe` styles also get a painted fringe on the face (humanoid.js).
import * as THREE from 'three';

import { fill, rng, shade } from './paint.js';

const B = (x0, y0, z0, x1, y1, z1) => new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));

/** Hair texture: the colour with darker strands and a few light ones. */
const strands = (hex, seed) => (ctx, x, y, w, h, side) => {
  fill(ctx, x, y, w, h, hex);
  const r = rng(`${seed}|${side}`), step = Math.max(3, Math.round(w / 9));
  ctx.fillStyle = `#${shade(hex, 0.78).toString(16).padStart(6, '0')}`;
  for (let i = 0; i < w; i += step) ctx.fillRect(x + i + Math.floor(r() * 2), y, 1, h);
  ctx.fillStyle = `#${shade(hex, 1.25).toString(16).padStart(6, '0')}`;
  for (let i = 0; i < 4; i++) ctx.fillRect(x + r() * w, y + r() * h, 1, Math.max(2, h * 0.2));
};

/** The cap every fuller style starts from: the crown, and the back of the head down to the nape. */
function cap(H, k = 1) {
  const { hs, head, add, recipe } = H, paint = strands(recipe.hair, `${recipe.id}|hair`);
  add(head, 'hair-cap', B(-hs * 0.53 * k, hs * 0.8, -hs * 0.53 * k, hs * 0.53 * k, hs * 1.06, hs * 0.53 * k), paint);
  add(head, 'hair-back', B(-hs * 0.53 * k, hs * 0.45, hs * 0.3, hs * 0.53 * k, hs * 0.82, hs * 0.53 * k), paint);
  return paint;
}

const style = (fringe, build) => Object.assign(build, { fringe });

export const HAIR = {
  bald: style(false, () => {}),
  /** Buzz cut: a thin layer on the crown. */
  buzz: style(false, ({ hs, head, add, recipe }) => {
    add(head, 'hair-buzz', B(-hs * 0.505, hs * 0.86, -hs * 0.505, hs * 0.505, hs * 1.015, hs * 0.505), strands(recipe.hair, `${recipe.id}|hair`));
  }),
  short: style(true, (H) => { cap(H); }),
  /** Messy: short, with tufts sticking up. */
  messy: style(true, (H) => {
    const paint = cap(H), { hs, head, add, recipe } = H, r = rng(`${recipe.id}|tufts`);
    for (let i = 0; i < 6; i++) {
      const x = (r() - 0.5) * hs * 0.8, z = (r() - 0.4) * hs * 0.8, s = hs * (0.1 + r() * 0.08);
      add(head, 'hair-tuft', B(x - s / 2, hs * 1.04, z - s / 2, x + s / 2, hs * (1.08 + r() * 0.1), z + s / 2), paint);
    }
  }),
  /** Spiky: short with tall spikes. */
  spiky: style(true, (H) => {
    const paint = cap(H), { hs, head, add } = H;
    for (const [x, z] of [[-0.3, -0.25], [0, -0.3], [0.3, -0.25], [-0.25, 0.1], [0.25, 0.1], [0, 0.3]]) add(head, 'hair-spike', B(hs * (x - 0.07), hs * 1.04, hs * (z - 0.07), hs * (x + 0.07), hs * 1.26, hs * (z + 0.07)), paint);
  }),
  /** Long: down the back past the neck, locks along the sides. */
  long: style(true, (H) => {
    const paint = cap(H), { hs, head, add } = H;
    add(head, 'hair-long', B(-hs * 0.55, -hs * 0.4, hs * 0.3, hs * 0.55, hs * 0.82, hs * 0.58), paint);
    for (const s of [-1, 1]) add(head, 'hair-lock', B(s > 0 ? hs * 0.5 : -hs * 0.56, -hs * 0.15, -hs * 0.2, s > 0 ? hs * 0.56 : -hs * 0.5, hs * 0.82, hs * 0.52), paint);
  }),
  /** Ponytail: short, gathered into a tail at the back. */
  ponytail: style(true, (H) => {
    const paint = cap(H), { hs, head, add } = H;
    add(head, 'hair-tail', B(-hs * 0.1, -hs * 0.35, hs * 0.52, hs * 0.1, hs * 0.72, hs * 0.68), paint);
    add(head, 'hair-tie', B(-hs * 0.12, hs * 0.55, hs * 0.51, hs * 0.12, hs * 0.62, hs * 0.7), (ctx, x, y, w, h) => fill(ctx, x, y, w, h, 0x9a2a3a));
  }),
  /** Bob: down to the jaw on the sides and back. */
  bob: style(true, (H) => {
    const paint = cap(H), { hs, head, add } = H;
    add(head, 'hair-bob', B(-hs * 0.55, hs * 0.15, hs * 0.3, hs * 0.55, hs * 0.82, hs * 0.56), paint);
    for (const s of [-1, 1]) add(head, 'hair-side', B(s > 0 ? hs * 0.5 : -hs * 0.56, hs * 0.15, -hs * 0.36, s > 0 ? hs * 0.56 : -hs * 0.5, hs * 0.82, hs * 0.52), paint);
  }),
  /** Mohawk: a crest along the middle. */
  mohawk: style(false, ({ hs, head, add, recipe }) => {
    add(head, 'hair-mohawk', B(-hs * 0.09, hs * 0.98, -hs * 0.46, hs * 0.09, hs * 1.24, hs * 0.5), strands(recipe.hair, `${recipe.id}|hair`));
  }),
  /** Afro: a big round mass on top and behind. */
  afro: style(true, ({ hs, head, add, recipe }) => {
    const paint = strands(recipe.hair, `${recipe.id}|hair`);
    add(head, 'hair-afro', B(-hs * 0.68, hs * 0.8, -hs * 0.6, hs * 0.68, hs * 1.34, hs * 0.7), paint);
    add(head, 'hair-afro-back', B(-hs * 0.68, hs * 0.35, -hs * 0.2, hs * 0.68, hs * 0.82, hs * 0.7), paint);
  }),
  /** Bun: short, gathered into a round bun high at the back. */
  bun: style(true, (H) => {
    const paint = cap(H), { hs, head, add } = H;
    add(head, 'hair-bun', B(-hs * 0.17, hs * 0.92, hs * 0.12, hs * 0.17, hs * 1.26, hs * 0.44), paint);
  }),
  /** Pigtails: two tails at the sides, tied. */
  pigtails: style(true, (H) => {
    const paint = cap(H), { hs, head, add } = H;
    for (const s of [-1, 1]) {
      add(head, 'hair-pigtail', B(s > 0 ? hs * 0.52 : -hs * 0.7, -hs * 0.25, hs * 0.02, s > 0 ? hs * 0.7 : -hs * 0.52, hs * 0.66, hs * 0.2), paint);
      add(head, 'hair-tie', B(s > 0 ? hs * 0.51 : -hs * 0.71, hs * 0.55, 0, s > 0 ? hs * 0.71 : -hs * 0.51, hs * 0.62, hs * 0.22), (ctx, x, y, w, h) => fill(ctx, x, y, w, h, 0x3a6ab0));
    }
  }),
  /** Braid: one plait down the back, in alternating segments. */
  braid: style(true, (H) => {
    const paint = cap(H), { hs, head, add, recipe } = H, dark = strands(shade(recipe.hair, 0.8), `${recipe.id}|braid`);
    for (let k = 0; k < 6; k++) add(head, 'hair-braid', B(-hs * (k % 2 ? 0.09 : 0.11), hs * (0.55 - k * 0.16), hs * 0.52, hs * (k % 2 ? 0.09 : 0.11), hs * (0.72 - k * 0.16), hs * 0.68), k % 2 ? dark : paint);
  }),
  /** Side part: full on one side, swept over. */
  sidePart: style(true, (H) => {
    const paint = cap(H), { hs, head, add } = H;
    add(head, 'hair-sweep', B(-hs * 0.57, hs * 0.86, -hs * 0.56, -hs * 0.02, hs * 1.14, hs * 0.5), paint);
  }),
  /** Slicked back: smooth on top, longer at the nape, no fringe. */
  slicked: style(false, ({ hs, head, add, recipe }) => {
    const paint = strands(recipe.hair, `${recipe.id}|hair`);
    add(head, 'hair-slick', B(-hs * 0.52, hs * 0.84, -hs * 0.42, hs * 0.52, hs * 1.06, hs * 0.56), paint);
    add(head, 'hair-nape', B(-hs * 0.52, hs * 0.3, hs * 0.36, hs * 0.52, hs * 0.86, hs * 0.58), paint);
  }),
  /** Undercut: shaved sides, a long top falling to one side. */
  undercut: style(false, ({ hs, head, add, recipe }) => {
    const paint = strands(recipe.hair, `${recipe.id}|hair`);
    add(head, 'hair-top', B(-hs * 0.36, hs * 0.88, -hs * 0.48, hs * 0.36, hs * 1.16, hs * 0.44), paint);
    add(head, 'hair-flop', B(-hs * 0.05, hs * 0.86, -hs * 0.56, hs * 0.5, hs * 1.08, -hs * 0.2), paint);
  }),
  /** Curtains: parted in the middle, locks framing the face. */
  curtains: style(true, (H) => {
    const paint = cap(H), { hs, head, add } = H;
    for (const s of [-1, 1]) add(head, 'hair-curtain', B(s > 0 ? hs * 0.38 : -hs * 0.57, hs * 0.32, -hs * 0.57, s > 0 ? hs * 0.57 : -hs * 0.38, hs * 0.88, -hs * 0.2), paint);
  }),
  /** Dreadlocks: many thin locks hanging around the back and sides. */
  dreadlocks: style(true, (H) => {
    const paint = cap(H), { hs, head, add, recipe } = H, r = rng(`${recipe.id}|dreads`);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 1.2 - Math.PI * 0.1, x = Math.cos(a) * hs * 0.52, z = Math.abs(Math.sin(a)) * hs * 0.52 + hs * 0.02, len = hs * (0.6 + r() * 0.5);
      add(head, 'hair-dread', B(x - 0.012, hs * 0.85 - len, z - 0.012, x + 0.012, hs * 0.9, z + 0.012), paint);
    }
  }),
  /** Top knot: shaved short, a knot on the crown. */
  topknot: style(false, ({ hs, head, add, recipe }) => {
    const paint = strands(recipe.hair, `${recipe.id}|hair`);
    add(head, 'hair-buzz', B(-hs * 0.505, hs * 0.86, -hs * 0.505, hs * 0.505, hs * 1.015, hs * 0.505), paint);
    add(head, 'hair-knot', B(-hs * 0.13, hs * 1.0, -hs * 0.08, hs * 0.13, hs * 1.3, hs * 0.18), paint);
  }),
  /** Wild: long and unkempt, tufts sticking out everywhere. */
  wild: style(true, (H) => {
    HAIR.long(H);
    const { hs, head, add, recipe } = H, paint = strands(recipe.hair, `${recipe.id}|hair`), r = rng(`${recipe.id}|wild`);
    for (let i = 0; i < 9; i++) {
      const sx = r() < 0.5 ? -1 : 1, x = sx * hs * (0.45 + r() * 0.2), y = hs * (0.3 + r() * 0.8), z = hs * (r() * 0.7 - 0.1), s = hs * (0.1 + r() * 0.08);
      add(head, 'hair-wild', B(x - s / 2, y - s / 2, z - s / 2, x + s / 2, y + s / 2, z + s / 2), paint);
    }
  }),
  /** Receding: the hairline far back, the forehead bare. */
  receding: style(false, ({ hs, head, add, recipe }) => {
    const paint = strands(recipe.hair, `${recipe.id}|hair`);
    add(head, 'hair-receding', B(-hs * 0.53, hs * 0.82, -hs * 0.12, hs * 0.53, hs * 1.05, hs * 0.53), paint);
    add(head, 'hair-back', B(-hs * 0.53, hs * 0.45, hs * 0.3, hs * 0.53, hs * 0.84, hs * 0.53), paint);
  }),
  /** Balding: a horseshoe around the back and sides, the crown bare. */
  balding: style(false, ({ hs, head, add, recipe }) => {
    const paint = strands(recipe.hair, `${recipe.id}|hair`);
    add(head, 'hair-ring-back', B(-hs * 0.53, hs * 0.48, hs * 0.34, hs * 0.53, hs * 0.8, hs * 0.53), paint);
    for (const s of [-1, 1]) add(head, 'hair-ring-side', B(s > 0 ? hs * 0.5 : -hs * 0.53, hs * 0.48, -hs * 0.12, s > 0 ? hs * 0.53 : -hs * 0.5, hs * 0.8, hs * 0.53), paint);
  }),
};
