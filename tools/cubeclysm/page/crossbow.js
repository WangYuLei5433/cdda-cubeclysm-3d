// The wood crossbow and its aluminum broadhead bolt, as items and as the weapon in the crossbow
// trap (traps.js).
//
// CDDA (7136388): crossbow "wood crossbow": "An all-wood hunting crossbow. It is not powerful
// enough to deal with zombies, but it may still be used for hunting." 6450 ml, longest side 86 cm,
// all wood. bolt_steel "aluminum broadhead bolt": "A fletched aluminum crossbow bolt with a bladed
// tip. Useful for maximizing damage to the target." 300 mm.
//
// Drawn: an 86 cm wooden stock (a tiller with a groove for the bolt, a deeper butt), a wooden prod
// 66 cm across lashed to its front, a cotton string, and a wooden nut and trigger lever — no metal
// anywhere, as the description says. Rest state: string straight across; cocked: string drawn back
// over the nut, a bolt in the groove. Muzzle (the prod) toward −Z, lying flat: origin = the centre
// of the item on the ground.
import { V, flat, hull, layers, speckle, fill, shade, tube, woodP } from './item-kit.js';

const WOOD = 0x8a5a32, PROD_WOOD = 0x6e4426;
const STRING = flat(0xe8e0c8);

/** A straight bar from a to b: `w` wide (sideways, in the ground plane) and `t` thick (up). */
function bar(p, name, a, b, w, t, paint, opts) {
  const d = b.clone().sub(a).normalize(), side = V(-d.z, 0, d.x).multiplyScalar(w / 2), up = V(0, t / 2, 0);
  const pts = [];
  for (const q of [a, b]) for (const s of [-1, 1]) for (const u of [-1, 1]) pts.push(q.clone().addScaledVector(side, s).addScaledVector(up, u));
  hull(p, name, pts, paint, opts);
}

/** Layout along z (front −z): prod at −0.32, nut at 0.02, trigger 0.05…0.1, butt 0.18…0.5. */
const Z = { front: -0.36, prod: -0.32, nut: 0.02, grip: 0.18, butt: 0.5 };
const SPAN = 0.33;

/** The crossbow. `cocked`: string on the nut and a bolt loaded. */
export function crossbow(p, { cocked = false, parent = p.root, at = [0, 0, -0.07], rotX = 0 } = {}) {
  const g = p.group('crossbow', { at, rotX, parent }), o = { parent: g };
  const stock = woodP(WOOD), groove = layers(woodP(WOOD), (ctx, x, y, w, h, side) => { if (side === 'top') fill(ctx, x + Math.floor(w / 2) - 1, y, 2, h, shade(WOOD, 0.55)); });
  const y0 = 0.06; // the tiller's centre height when lying flat (the trigger lever just touches the ground)
  // Tiller (fore-stock) with the bolt groove on top.
  p.box('tiller', [-0.024, y0 - 0.025, Z.front, 0.024, y0 + 0.025, Z.grip], groove, o);
  // Butt: deeper, sloping down to the shoulder.
  hull(p, 'butt', [V(-0.022, y0 - 0.025, Z.grip), V(0.022, y0 - 0.025, Z.grip), V(-0.022, y0 + 0.025, Z.grip), V(0.022, y0 + 0.025, Z.grip),
    V(-0.02, 0, Z.butt), V(0.02, 0, Z.butt), V(-0.02, y0 + 0.03, Z.butt), V(0.02, y0 + 0.03, Z.butt)], stock, o);
  // Prod: two limbs from the centre, swept back a little toward the tips, lashed to the tiller.
  const prod = woodP(PROD_WOOD), py = y0 + 0.012, tip = (s) => V(s * SPAN, py, Z.prod + 0.06);
  for (const s of [-1, 1]) {
    const mid = V(s * SPAN * 0.55, py, Z.prod + 0.012);
    bar(p, 'prod limb', V(0, py, Z.prod), mid, 0.034, 0.022, prod, o);
    bar(p, 'prod limb', mid, tip(s), 0.026, 0.016, prod, o);
    p.box('nock', [s * SPAN - 0.008, py - 0.012, Z.prod + 0.052, s * SPAN + 0.008, py + 0.012, Z.prod + 0.068], woodP(shade(PROD_WOOD, 0.8)), o);
  }
  for (const z of [Z.prod - 0.02, Z.prod + 0.02]) p.box('prod lashing', [-0.028, y0 - 0.028, z - 0.008, 0.028, y0 + 0.036, z + 0.008], layers(STRING, (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 3) fill(ctx, x + i, y, 1, h, 0xb8ae90); }), o);
  // Nut (a wooden block that holds the drawn string) and the trigger lever under the stock.
  p.box('nut', [-0.02, y0 + 0.025, Z.nut - 0.015, 0.02, y0 + 0.042, Z.nut + 0.015], woodP(shade(WOOD, 0.75)), o);
  hull(p, 'trigger', [V(-0.006, y0 - 0.025, 0.05), V(0.006, y0 - 0.025, 0.05), V(-0.006, y0 - 0.025, 0.065), V(0.006, y0 - 0.025, 0.065), V(-0.006, y0 - 0.06, 0.1), V(0.006, y0 - 0.06, 0.1)], woodP(shade(WOOD, 0.75)), o);
  // String: straight across at rest; drawn back onto the nut when cocked.
  const drawn = cocked ? V(0, y0 + 0.034, Z.nut - 0.012) : V(0, py, Z.prod + 0.064);
  for (const s of [-1, 1]) tube(p, 'string', tip(s).add(V(0, 0, 0.004)), drawn, 0.0025, 0.0025, 4, STRING, o);
  if (cocked) bolt(p, { parent: g, at: [0, y0 + 0.031, Z.nut - 0.012 - 0.15] });
  return g;
}

/**
 * The bolt, lying along z with its centre at `at` (tip toward −z): an aluminium shaft, three
 * plastic vanes at the back, a bladed steel broadhead. 300 mm.
 */
export function bolt(p, { parent = p.root, at = [0, 0.008, 0], ry = 0 } = {}) {
  const g = p.group('bolt', { at, rotY: ry, parent }), o = { parent: g };
  const alu = layers(speckle('alu', 0xb8bec4, [0xd0d6dc, 0xa0a6ac], 0.25), (ctx, x, y, w) => fill(ctx, x, y, w, 1, 0xe0e6ea));
  tube(p, 'shaft', V(0, 0, -0.12), V(0, 0, 0.15), 0.0042, 0.0042, 6, alu, { ...o, metal: true });
  // Broadhead: a ferrule and three blades meeting at the point.
  tube(p, 'ferrule', V(0, 0, -0.135), V(0, 0, -0.12), 0.0035, 0.0045, 6, flat(0x6a6e72), { ...o, metal: true });
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2, r = V(Math.cos(a), Math.sin(a), 0);
    hull(p, 'blade', [V(0, 0, -0.15), V(0, 0, -0.12), r.clone().multiplyScalar(0.011).add(V(0, 0, -0.123)), r.clone().multiplyScalar(0.001).add(V(0, 0, -0.135))], flat(0xc8ccd0), { ...o, metal: true });
  }
  // Vanes: three, one cock vane in orange.
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 2, r = V(Math.cos(a), Math.sin(a), 0);
    hull(p, 'vane', [r.clone().multiplyScalar(0.004).add(V(0, 0, 0.1)), r.clone().multiplyScalar(0.004).add(V(0, 0, 0.145)), r.clone().multiplyScalar(0.013).add(V(0, 0, 0.13)), r.clone().multiplyScalar(0.0045).add(V(0, 0, 0.12))], flat(k ? 0x2a2a2a : 0xe8641a), o);
  }
  return g;
}

export const CROSSBOW_ITEMS = [
  { id: 'crossbow', desc: 'An all-wood hunting crossbow. It is not powerful enough to deal with zombies, but it may still be used for hunting. (86 cm stock, 66 cm prod; strung, not drawn.)', build: (p) => crossbow(p) },
  { id: 'bolt_steel', desc: 'A fletched aluminum crossbow bolt with a bladed tip. Useful for maximizing damage to the target. (300 mm.)', build: (p) => bolt(p, { at: [0, 0.013, 0.0075] }) },
].map((r) => ({ ...r, dir: 'items', ppm: 512, source: 'tools/cubeclysm/page/crossbow.js' }));
