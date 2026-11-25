// Shared shapes and paints for item models (items.js, items2.js): low-poly bodies with painted
// textures, real size, lying on the ground (origin = the item's centre on the ground).
import { flat, layers, speckle } from './props.js';
import { fill, rng, shade } from './paint.js';
import { V, bevel, cyl, hull, pane } from './lowpoly.js';

export { V, bevel, cyl, hull, pane, flat, layers, speckle, fill, rng, shade };
export const STEEL = { metal: true }, GLASS = { glass: true }, CUT = { cutout: true };

// --- paints -------------------------------------------------------------------------------------

export const woodP = (hex) => layers(speckle(`wood${hex}`, hex, [shade(hex, 1.08), shade(hex, .9)], .3), (ctx, x, y, w, h) => {
  const r = rng(`grain${hex}${w}${h}`);
  for (let j = 1; j < h; j += 3) if (r() < .6) fill(ctx, x, y + j, w, 1, shade(hex, .82));
});
export const barkP = (hex) => layers(speckle(`bark${hex}`, hex, [shade(hex, .8), shade(hex, 1.12)], .55), (ctx, x, y, w, h) => {
  const r = rng(`barkline${hex}${w}`);
  for (let i = 0; i < w; i += 2) if (r() < .35) fill(ctx, x + i, y, 1, h, shade(hex, .7));
});
export const knitP = (hex) => layers(flat(hex), (ctx, x, y, w, h) => { for (let j = 0; j < h; j += 2) for (let i = (j / 2) % 2; i < w; i += 2) fill(ctx, x + i, y + j, 1, 1, shade(hex, .9)); });
export const clothP = (hex) => speckle(`cloth${hex}`, hex, [shade(hex, 1.05), shade(hex, .93)], .35);
export const denimP = (hex) => layers(flat(hex), (ctx, x, y, w, h) => { for (let j = 0; j < h; j++) for (let i = j % 3; i < w; i += 3) fill(ctx, x + i, y + j, 1, 1, shade(hex, .82)); });
export const steelP = (hex = 0xc4c8cc) => layers(speckle(`steel${hex}`, hex, [shade(hex, 1.08), shade(hex, .9)], .25), (ctx, x, y, w) => fill(ctx, x, y, w, 1, shade(hex, 1.2)));
export const plasticP = (hex) => speckle(`plastic${hex}`, hex, [shade(hex, 1.05), shade(hex, .96)], .12);
export const stoneP = (hex) => speckle(`stone${hex}`, hex, [shade(hex, 1.15), shade(hex, .82), shade(hex, .95)], .55);
export const paperP = (hex = 0xf2f0e8) => speckle(`paper${hex}`, hex, [shade(hex, .97)], .1);
/** Lines of print on paper. */
export const printP = (hex = 0xf2f0e8, ink = 0x8a8a8a) => layers(flat(hex), (ctx, x, y, w, h) => { for (let j = 3; j < h - 2; j += 3) fill(ctx, x + 3, y + j, Math.round((w - 6) * (.5 + ((j * 37) % 50) / 100)), 1, ink); });
/** A band across a face (a label, a stripe) between fractions a and b of its height. */
export const band = (base, hex, a, b) => layers(typeof base === 'number' ? flat(base) : base, (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * a), w, Math.max(1, Math.round(h * (b - a))), hex));

// --- shapes -------------------------------------------------------------------------------------

/** A tapered tube from a to b (radius r0 → r1), `sides` facets. */
export function tube(p, name, a, b, r0, r1, sides, paint, opts = {}) {
  const axis = b.clone().sub(a).normalize();
  const u = Math.abs(axis.y) < .9 ? V(0, 1, 0).cross(axis).normalize() : V(1, 0, 0).cross(axis).normalize();
  const w = axis.clone().cross(u);
  const ring = (c, r) => Array.from({ length: sides }, (_, k) => { const t = (k * 2 * Math.PI) / sides; return c.clone().addScaledVector(u, Math.cos(t) * r).addScaledVector(w, Math.sin(t) * r); });
  hull(p, name, [...ring(a, r0), ...ring(b, r1)], paint, opts);
}
/** A low mound of loose stuff. */
export function pile(p, name, r, h, paint, seed, opts = {}) {
  const rand = rng(seed), pts = [];
  for (let k = 0; k < 9; k++) { const a = (k / 9) * 2 * Math.PI + rand() * .3, rr = r * (.8 + rand() * .3); pts.push(V(Math.cos(a) * rr, 0, Math.sin(a) * rr * .85)); }
  for (let k = 0; k < 6; k++) { const a = (k / 6) * 2 * Math.PI + rand(), rr = r * (.4 + rand() * .2); pts.push(V(Math.cos(a) * rr, h * (.55 + rand() * .2), Math.sin(a) * rr * .85)); }
  pts.push(V((rand() - .5) * r * .2, h, (rand() - .5) * r * .2));
  hull(p, name, pts, paint, opts);
}
/** An irregular lump of radii [rx, ry, rz], resting on the ground at `at`. */
export function lump(p, name, [rx, ry, rz], paint, seed, opts = {}, at = [0, 0, 0]) {
  const rand = rng(seed), pts = [];
  for (let k = 0; k < 16; k++) {
    const u = rand() * 2 - 1, t = rand() * 2 * Math.PI, s = Math.sqrt(1 - u * u), k2 = .82 + rand() * .3;
    pts.push(V(at[0] + Math.cos(t) * s * rx * k2, ry + u * ry * k2, at[2] + Math.sin(t) * s * rz * k2));
  }
  const minY = Math.min(...pts.map((q) => q.y));
  hull(p, name, pts.map((q) => V(q.x, q.y - minY + at[1], q.z)), paint, opts);
}
/** A plain box of whole quads (printed packaging: the print runs straight across each face). */
export function qbox(p, name, [x0, y0, z0, x1, y1, z1], paint, opts = {}) {
  const P = (x, y, z) => V(x, y, z);
  const F = [
    [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]],
    [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]],
    [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],
  ];
  // Each face is wound counter-clockwise from outside; pane() would add thickness, so build facets here.
  for (const [k, f] of F.entries()) pane(p, `${name}${k}`, f.map((q) => P(...q)), .0001, paint, opts);
}
/** A ring (finger loop, washer) of radius R and wire r in the ground plane at c. */
export function loop(p, name, c, R, r, paint, opts = {}, n = 10) {
  for (let k = 0; k < n; k++) {
    const a0 = (k / n) * 2 * Math.PI, a1 = ((k + 1) / n) * 2 * Math.PI;
    tube(p, `${name}${k}`, V(c[0] + Math.cos(a0) * R, c[1], c[2] + Math.sin(a0) * R), V(c[0] + Math.cos(a1) * R, c[1], c[2] + Math.sin(a1) * R), r, r, 5, paint, opts);
  }
}
/** A smooth-ish ellipsoid (fruit, nuts, beads) of radii [rx, ry, rz] centred at c. */
export function blob(p, name, [rx, ry, rz], c, paint, opts = {}, rings = 4, sides = 8) {
  const pts = [];
  for (let i = 0; i <= rings; i++) {
    const a = (i / rings) * Math.PI - Math.PI / 2, y = Math.sin(a), r = Math.cos(a);
    for (let k = 0; k < (r < .01 ? 1 : sides); k++) { const t = (k / sides) * 2 * Math.PI; pts.push(V(c[0] + Math.cos(t) * r * rx, c[1] + y * ry, c[2] + Math.sin(t) * r * rz)); }
  }
  hull(p, name, pts, paint, opts);
}
/** A thin flat sheet lying on the ground (paper, cloth), slightly turned. */
export function sheet(p, name, w, d, t, paint, opts = {}, y = 0) {
  pane(p, name, [V(-w / 2, y + t / 2, -d / 2), V(w / 2, y + t / 2, -d / 2), V(w / 2, y + t / 2, d / 2), V(-w / 2, y + t / 2, d / 2)], t, paint, opts);
}
/** A crumpled sheet (foil, wrap, paper): a ragged outline puffed up in the middle. */
export function crumple(p, name, rx, rz, h, paint, seed, opts = {}) {
  const r = rng(seed), pts = [];
  for (let k = 0; k < 12; k++) { const a = (k / 12) * 2 * Math.PI; pts.push(V(Math.cos(a) * rx * (.85 + r() * .2), 0, Math.sin(a) * rz * (.85 + r() * .2))); }
  for (let k = 0; k < 7; k++) { const a = r() * 2 * Math.PI; pts.push(V(Math.cos(a) * rx * .5 * r(), h * (.4 + r() * .6), Math.sin(a) * rz * .5 * r())); }
  hull(p, name, pts, paint, opts);
}
/** A flat handle (cutlery, tools) from x0 to x1, widening from w0 to w1, `t` thick. */
export const flatHandle = (p, name, x0, x1, w0, w1, t, paint, opts) => hull(p, name, [V(x0, 0, -w0), V(x0, 0, w0), V(x1, 0, -w1), V(x1, 0, w1), V(x0, t, -w0), V(x0, t, w0), V(x1, t, -w1), V(x1, t, w1)], paint, opts);
/** A coil of wire or string: rings of short straight pieces. */
export function coil(p, name, R, r, turns, paint, opts = {}, seed = name) {
  const rand = rng(seed);
  for (let t = 0; t < turns; t++) {
    const rr = R * (.85 + rand() * .3), y = r + t * r * 1.6, n = 10;
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * 2 * Math.PI + t, a1 = ((k + 1) / n) * 2 * Math.PI + t;
      tube(p, `${name}${t}-${k}`, V(Math.cos(a0) * rr, y, Math.sin(a0) * rr * .9), V(Math.cos(a1) * rr, y, Math.sin(a1) * rr * .9), r, r, 4, paint, opts);
    }
  }
}

/**
 * A book lying flat: covers, page block, spine. `cover` paints the front (a title band and a
 * motif); paperback by default, `hard` gives thicker boards that overhang the pages.
 */
export function book(p, {
  L = .18, W = .11, T = .03, color, title = 0xf0e8d0, motif = null, hard = false, pages = 0xf0ead6,
  frontPaint, backPaint, spinePaint,
}) {
  const b = hard ? .004 : .0012, o = hard ? .003 : 0;
  const cover = layers(flat(color), (ctx, x, y, w, h) => {
    fill(ctx, x + Math.round(w * .12), y + Math.round(h * .62), Math.round(w * .76), Math.max(2, Math.round(h * .12)), title);
    fill(ctx, x + Math.round(w * .2), y + Math.round(h * .2), Math.round(w * .6), 1, shade(color, 1.3));
    motif?.(ctx, x, y, w, h);
  });
  bevel(p, 'pages', [-L / 2 + o, b, -W / 2 + o, L / 2 - o, T - b, W / 2 - o * 2], .001, layers(flat(pages), (ctx, x, y, w, h) => { for (let j = 1; j < h; j += 2) fill(ctx, x, y + j, w, 1, shade(pages, .9)); }));
  pane(p, 'back', [V(-L / 2, b / 2, -W / 2), V(L / 2, b / 2, -W / 2), V(L / 2, b / 2, W / 2), V(-L / 2, b / 2, W / 2)], b, backPaint ?? flat(shade(color, .9)));
  // The front cover faces up: its paint reads from the spine side.
  pane(p, 'front', [V(-L / 2, T - b / 2, W / 2), V(L / 2, T - b / 2, W / 2), V(L / 2, T - b / 2, -W / 2), V(-L / 2, T - b / 2, -W / 2)], b, frontPaint ?? cover);
  const spine = [-L / 2, 0, W / 2 - b * 1.5, L / 2, T, W / 2 + b * .5];
  if (spinePaint) p.box('spine', spine, spinePaint);
  else bevel(p, 'spine', spine, b * .4, band(color, title, .35, .55));
}

/**
 * A folded garment lying flat: a soft slab w × d × h with a fold line, plus details:
 * collar, buttons, pocket, hood, waistband, legs (folded trousers show two legs).
 */
export function folded(p, { w = .28, d = .22, h = .03, paint, color, collar = null, buttons = 0, pocket = null, hood = false, waist = null, legs = false, stripe = null }) {
  const c = color;
  bevel(p, 'body', [-w / 2, 0, -d / 2, w / 2, h, d / 2], Math.min(.012, h * .4), paint);
  bevel(p, 'fold', [-w / 2 + .01, h - .002, -.002, w / 2 - .01, h + .001, .002], .0005, flat(shade(c, .8)));
  if (stripe) bevel(p, 'stripe', [-w / 2 + .004, h - .001, -d * .25, w / 2 - .004, h + .0015, -d * .1], .0005, flat(stripe));
  if (collar) {
    // The neckline at the middle of the top edge: a band round the neck hole, collar points for shirts with buttons.
    const z = -d / 2;
    for (let k = 0; k < 7; k++) {
      const a0 = Math.PI * (k / 7), a1 = Math.PI * ((k + 1) / 7);
      tube(p, `neck${k}`, V(Math.cos(a0) * .055, h + .003, z + Math.sin(a0) * .05), V(Math.cos(a1) * .055, h + .003, z + Math.sin(a1) * .05), .006, .006, 5, flat(collar));
    }
    pane(p, 'neckhole', [V(-.05, h + .0005, z), V(.05, h + .0005, z), V(.03, h + .0005, z + .04), V(-.03, h + .0005, z + .04)], .001, flat(shade(c, .55)));
    if (buttons) for (const s of [-1, 1]) hull(p, `point${s}`, [V(s * .01, h + .006, z + .045), V(s * .06, h + .006, z + .01), V(s * .045, h + .006, z + .07), V(s * .01, h + .011, z + .045), V(s * .06, h + .011, z + .01), V(s * .045, h + .011, z + .07)], flat(collar));
  }
  for (let k = 0; k < buttons; k++) cyl(p, `button${k}`, 'y', [0, h + .002, -d / 2 + .08 + k * .035], .005, .003, 6, flat(shade(c, .7)));
  if (pocket) bevel(p, 'pocket', [-w / 2 + .04, h, -d / 2 + .08, -w / 2 + .09, h + .003, -d / 2 + .13], .001, flat(pocket));
  if (hood) hull(p, 'hood', [V(-.08, h, -d / 2 - .01), V(.08, h, -d / 2 - .01), V(-.07, h, -d / 2 + .07), V(.07, h, -d / 2 + .07), V(-.07, h + .02, -d / 2), V(.07, h + .02, -d / 2), V(0, h + .025, -d / 2 + .05)], paint);
  if (waist) bevel(p, 'waist', [-w / 2, 0, -d / 2 - .002, w / 2, h + .002, -d / 2 + .03], .004, flat(waist));
  if (legs) bevel(p, 'seam', [-.001, h - .001, -d / 2 + .03, .001, h + .0015, d / 2 - .01], .0003, flat(shade(c, .7)));
}

/** An upright can (drink, food): body with a label, rims, a lid. */
export function can(p, { r, h, label, lid = 0xc4c8cc, ring = false }) {
  cyl(p, 'body', 'y', [0, h / 2, 0], r, h - .006, 14, label, { metal: false });
  cyl(p, 'bottom', 'y', [0, .002, 0], r * .96, .004, 14, steelP(lid), STEEL);
  cyl(p, 'top', 'y', [0, h - .002, 0], r * .96, .004, 14, steelP(lid), STEEL);
  if (ring) bevel(p, 'tab', [-.008, h, -.005, .008, h + .0015, .012], .001, steelP(lid), STEEL);
}
