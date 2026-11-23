// Cubeclysm furniture, batch 1 (the census's furniture up to 90%; docs/census.zh.md), block style.
// One model per CDDA id, after its description (CDDA 7136388). CDDA gives furniture no size, so
// sizes are real-world typical ones inside the 1 m tile; storage volume (max_volume) sets the size
// where CDDA has it. Front faces −Z, the back (against a wall) +Z. Beds, tables, counters and sofas
// are often several tiles in a row in CDDA, so they are seamless one-tile sections (no end boards).
// Plants and rocks among the furniture are in vegetation.js (low-poly).
import { LEVEL, border, cracks, flat, glass, grid, layers, planks, sides, speckle } from './props.js';
import { fill, mix, rng, shade } from './paint.js';
import * as K from './item-kit.js';

// --- materials ----------------------------------------------------------------------------------

// Tallest indoor furniture: under the 1.92 m door head, clear of the 2 m ceiling (a level is 2 m).
const TALL = 1.85;

const WOOD = 0x8a5e38, LIGHT_WOOD = 0xb08858, DARK_WOOD = 0x5e3e24;
const wood = (id, hex = WOOD, n = 3, vertical = false) => planks(id, { wood: hex, seam: shade(hex, .72), n, vertical, tones: [hex, shade(hex, .94), shade(hex, 1.05)] });
const metal = (id, hex = 0xa0a4a8) => speckle(id, hex, [shade(hex, 1.05), shade(hex, .94)], .25);
const fabric = (id, hex) => speckle(id, hex, [shade(hex, 1.08), shade(hex, .9), shade(hex, .95)], .5);
const plastic = (hex) => layers(flat(hex), (ctx, x, y, w, h) => fill(ctx, x, y, w, 1, shade(hex, 1.12)));
const porcelain = speckle('porcelain', 0xeeeeea, [0xf6f6f2, 0xe2e2de], .15);

/** Drawer fronts: `n` rows with a handle each. */
const drawers = (n, hex, handle = 0xc8a040) => (ctx, x, y, w, h) => {
  for (let i = 0; i < n; i++) {
    const y0 = y + Math.round((i * h) / n), y1 = y + Math.round(((i + 1) * h) / n);
    fill(ctx, x, y0, w, 1, shade(hex, .65));
    fill(ctx, x + Math.round(w / 2) - 2, y0 + Math.round((y1 - y0) / 2) - 1, 4, 2, handle);
  }
};
/** Cabinet doors: `n` doors side by side, each with a knob near the meeting edge. */
const doors = (n, hex, knob = 0xc8a040) => (ctx, x, y, w, h) => {
  for (let i = 0; i < n; i++) {
    const x0 = x + Math.round((i * w) / n), x1 = x + Math.round(((i + 1) * w) / n);
    border(shade(hex, .7))(ctx, x0, y, x1 - x0, h);
    fill(ctx, i % 2 ? x0 + 2 : x1 - 4, y + Math.round(h * .4), 2, 3, knob);
  }
};
/** Paint only the front (−Z) face with `front`, the rest with `rest`. */
const front = (frontPaint, rest) => sides(['front'], frontPaint, rest);

// --- helpers ------------------------------------------------------------------------------------

/** Four legs under a top spanning x0..x1, z0..z1, `h` high, `t` thick. */
const legs = (p, [x0, z0, x1, z1], h, t, paint, opts = {}) => {
  for (const [x, z] of [[x0, z0], [x1 - t, z0], [x0, z1 - t], [x1 - t, z1 - t]]) p.box(`leg${x}${z}`, [x, 0, z, x + t, h, z + t], paint, opts);
};
/** A cabinet carcass: box with a painted front, on a recessed plinth. */
const carcass = (p, name, [x0, z0, x1, z1], h, body, frontPaint, plinth = .06) => {
  p.box(`${name}-plinth`, [x0 + .03, 0, z0 + .03, x1 - .03, plinth, z1], flat(shade(0x3a2a1e, 1)));
  p.box(name, [x0, plinth, z0, x1, h, z1], front(layers(body, frontPaint), body));
};
/** Shelves between two side panels, with things on them. */
const shelves = (p, name, [x0, z0, x1, z1], levels, t, paint, opts = {}) => levels.forEach((y, i) => p.box(`${name}${i}`, [x0, y, z0, x1, y + t, z1], paint, opts));
/** A row of books on a shelf: blocks of different heights and colours. */
const books = (p, name, [x0, x1], y, z0, z1, maxH) => {
  const r = rng(`${p.id}:${name}`), colors = [0x8a2a2a, 0x2a4a8a, 0x2a6a3a, 0xc8a040, 0x5a3a6a, 0x2a2a2a, 0xa86a2a, 0xe8e0d0];
  for (let x = x0; x < x1 - .03;) {
    const w = .025 + r() * .035, h = maxH * (.7 + r() * .3);
    if (r() < .1) { x += w; continue; }
    p.box(`${name}${x.toFixed(3)}`, [x, y, z0, Math.min(x1, x + w), y + h, z1], layers(flat(colors[Math.floor(r() * colors.length)]), (ctx, xx, yy, ww) => fill(ctx, xx, yy + 2, ww, 1, 0xe8d8a0)));
    x += w + .002;
  }
};
/** Goods on a store shelf: small boxes and cans. */
const goods = (p, name, [x0, x1], y, z0, z1, maxH) => {
  const r = rng(`${p.id}:${name}`), colors = [0xd84a2a, 0x2a6ac8, 0xe8c040, 0x3a9a4a, 0xe8e8e0, 0x8a4ac8];
  for (let x = x0; x < x1 - .06;) {
    const w = Math.min(.06 + r() * .08, x1 - x), h = maxH * (.5 + r() * .5), c = colors[Math.floor(r() * colors.length)];
    if (r() < .2) { x += w; continue; }
    p.box(`${name}${x.toFixed(3)}`, [x, y, z0 + r() * .03, x + w, y + h, z1 - r() * .03], layers(flat(c), (ctx, xx, yy, ww, hh) => fill(ctx, xx, yy + Math.round(hh * .35), ww, Math.max(1, Math.round(hh * .25)), 0xf4f4ee)));
    x += w + .01;
  }
};
/** An appliance's front: panel, seams, a small display. */
const appliance = (hex) => metal('appl', hex);
/** A round porthole door (washer, dryer). */
const porthole = (ring, glassHex) => (ctx, x, y, w, h) => {
  const cx = x + w / 2, cy = y + h * .55, r = Math.min(w, h) * .32;
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const d = Math.hypot(i, j);
    if (d <= r) fill(ctx, Math.round(cx + i), Math.round(cy + j), 1, 1, d > r - 2 ? ring : glassHex);
  }
  fill(ctx, x + 2, y + 2, w - 4, Math.round(h * .12), shade(ring, .9));
};
/** A recycle symbol: three chevrons in a triangle. */
const recycle = (hex) => (ctx, x, y, w, h) => {
  // Three arrows chasing each other round a triangle: each side a thick stroke with a gap at the
  // corner it points to, and an arrowhead there.
  const cx = x + w / 2, cy = y + h * .42, R = Math.min(w, h) * .26, t = Math.max(2, Math.round(R * .16));
  const corner = (k) => { const a = -Math.PI / 2 + (k * 2 * Math.PI) / 3; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; };
  for (let k = 0; k < 3; k++) {
    const [ax, ay] = corner(k), [bx, by] = corner((k + 1) % 3);
    for (let s = .12; s < .78; s += .01) fill(ctx, Math.round(ax + (bx - ax) * s - t / 2), Math.round(ay + (by - ay) * s - t / 2), t, t, hex);
    // Arrowhead near corner k+1: a small filled triangle across the stroke.
    const hx = ax + (bx - ax) * .8, hy = ay + (by - ay) * .8, nx = -(by - ay), ny = bx - ax, len = Math.hypot(nx, ny);
    for (let u = -1; u <= 1; u += .05) for (let v = 0; v < 1; v += .05) {
      const wdt = (1 - v) * t * 1.6;
      fill(ctx, Math.round(hx + (bx - ax) * v * .12 + (nx / len) * u * wdt), Math.round(hy + (by - ay) * v * .12 + (ny / len) * u * wdt), 1, 1, hex);
    }
  }
};

// --- recipes ------------------------------------------------------------------------------------

const RECIPES = [
  { id: 'f_table', desc: 'A standard wooden table.  You could sit down at it to eat like a civilized person.', build: (p) => {
    // A one-tile section: legs at the tile corners so a row of tables reads as one long table.
    p.box('top', [-.5, .71, -.5, .5, .75, .5], wood('f_table', WOOD, 4));
    p.box('apron', [-.46, .64, -.46, .46, .71, .46], flat(shade(WOOD, .8)));
    legs(p, [-.46, -.46, .46, .46], .64, .06, flat(shade(WOOD, .85)));
  } },
  { id: 'f_counter', desc: 'A plain wooden countertop, either free-standing or affixed to a wall.  Makes a decent surface for storage or crafting.', build: (p) => {
    p.box('top', [-.5, .86, -.32, .5, .9, .3], wood('f_counter_top', LIGHT_WOOD, 3));
    p.box('base', [-.48, .06, -.27, .48, .86, .3], front(layers(wood('f_counter', WOOD, 2), (ctx, x, y, w, h) => { fill(ctx, x + 2, y + Math.round(h * .45), w - 4, 2, shade(WOOD, .6)); }), flat(WOOD)));
    p.box('plinth', [-.48, 0, -.24, .48, .06, .3], flat(0x3a2a1e));
  } },
  { id: 'f_rack', desc: 'A sheet metal shelving unit, with the storage surfaces angled in such a way as to show off the items stored.', build: (p) => {
    // A double-sided store gondola (1750 L): a centre pegboard and shelves angled down to the front.
    const m = metal('f_rack', 0xc8ccd0);
    p.box('base', [-.5, 0, -.42, .5, .12, .42], m, { metal: false });
    p.box('spine', [-.5, .12, -.03, .5, 1.5, .03], layers(m, (ctx, x, y, w, h) => { for (let j = 3; j < h; j += 5) for (let i = 3; i < w; i += 5) fill(ctx, x + i, y + j, 1, 1, 0x7a7e82); }));
    for (const s of [-1, 1]) for (const [i, y] of [.45, .85, 1.25].entries()) {
      const g = p.group(`shelf${s}${i}`, { at: [0, y, s * .03], rotX: s * .18 });
      p.box(`shelf${s}${i}`, [-.5, 0, s < 0 ? -.36 : 0, .5, .02, s < 0 ? 0 : .36], m, { parent: g });
      goods({ ...p, box: (n, b, paint, o = {}) => p.box(n, b, paint, { ...o, parent: g }) }, `goods${s}${i}`, [-.46, .46], .02, s < 0 ? -.32 : .04, s < 0 ? -.04 : .32, .16);
    }
  } },
  { id: 'f_chair', desc: 'A simple wooden chair with four legs, a seat, and a back.', build: (p) => {
    const w = flat(shade(WOOD, .9));
    legs(p, [-.22, -.22, .22, .22], .44, .04, w);
    p.box('seat', [-.23, .44, -.23, .23, .48, .23], wood('f_chair', WOOD, 3));
    for (const x of [-.22, .18]) p.box(`post${x}`, [x, .48, .18, x + .04, .92, .22], w);
    for (const y of [.62, .78, .88]) p.box(`slat${y}`, [-.18, y, .19, .18, y + .05, .21], w);
  } },
  { id: 'f_bed', desc: 'A standard mattress on a sturdy wooden frame.', build: (p) => {
    // One tile of a bed: frame rails and a mattress section (a bed is two tiles in CDDA's houses).
    p.box('frame', [-.5, .12, -.5, .5, .3, .5], wood('f_bed_frame', DARK_WOOD, 2));
    legs(p, [-.48, -.48, .48, .48], .12, .06, flat(DARK_WOOD));
    p.box('mattress', [-.48, .3, -.5, .48, .52, .5], layers(fabric('f_bed', 0xe8e4dc), (ctx, x, y, w, h) => { for (let i = 4; i < w; i += 8) for (let j = 4; j < h; j += 8) fill(ctx, x + i, y + j, 1, 1, 0xc8c4bc); }, sides(['front', 'back', 'left', 'right'], (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h / 2), w, 1, 0x9a3a5a))));
  } },
  { id: 'f_bench', desc: 'A simple bench with wood slats nailed to a frame.', build: (p) => {
    for (const x of [-.45, .37]) p.box(`frame${x}`, [x, 0, -.2, x + .08, .4, .2], flat(shade(WOOD, .8)));
    p.box('rail', [-.45, .3, -.04, .45, .36, .04], flat(shade(WOOD, .8)));
    for (const z of [-.19, -.06, .07]) p.box(`slat${z}`, [-.5, .4, z, .5, .44, z + .11], layers(wood(`f_bench${z}`, LIGHT_WOOD, 1), (ctx, x, y, w, h) => { fill(ctx, x + 4, y + Math.round(h / 2), 1, 1, 0x3a3a3a); fill(ctx, x + w - 5, y + Math.round(h / 2), 1, 1, 0x3a3a3a); }));
  } },
  { id: 'f_desk', desc: 'A wooden desk with drawers.', build: (p) => {
    p.box('top', [-.5, .72, -.32, .5, .76, .3], wood('f_desk_top', WOOD, 3));
    carcass(p, 'pedestal', [.08, -.3, .48, .28], .72, wood('f_desk', WOOD, 1, true), drawers(3, WOOD));
    p.box('panel', [-.48, 0, -.3, -.44, .72, .28], wood('f_desk_side', WOOD, 1, true));
    p.box('modesty', [-.44, .3, .24, .08, .72, .28], wood('f_desk_back', WOOD, 2));
  } },
  { id: 'f_sofa', desc: 'A wide upholstered bench, large enough for two people to comfortably sit alongside one another, or for one person to lay down on.', build: (p) => {
    // One tile of a sofa (two or three in a row in CDDA): a seat cushion and the back cushion.
    const f = fabric('f_sofa', 0x5a6a8a);
    p.box('base', [-.5, .06, -.42, .5, .28, .45], f);
    p.box('cushion', [-.49, .28, -.42, .49, .44, .25], layers(f, sides(['top'], border(shade(0x5a6a8a, .8)))));
    p.box('back', [-.5, .28, .25, .5, .85, .45], layers(f, sides(['front'], (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * .55), w, 1, shade(0x5a6a8a, .8)))));
    for (const x of [-.45, .4]) p.box(`foot${x}`, [x, 0, -.38, x + .05, .06, .4], flat(DARK_WOOD));
  } },
  { id: 'f_cupboard', desc: 'Store your cups.  Or other things, if you\'re feeling wild.', build: (p) => {
    // A kitchen base cupboard: two doors under a worktop.
    p.box('top', [-.5, .86, -.32, .5, .9, .3], speckle('f_cupboard_top', 0xd8d4c8, [0xccc8bc, 0xe4e0d4], .3));
    carcass(p, 'body', [-.48, -.28, .48, .3], .86, flat(0x4a6a8a), doors(2, 0x4a6a8a, 0xd8d8d0));
  } },
  { id: 'f_bookcase', desc: 'A simple wooden shelf for storing dozens of books.', build: (p) => {
    // 1 m wide, 0.35 deep, TALL high (CDDA's 2000 L is a game figure, not a size).
    const w = wood('f_bookcase', WOOD, 1, true);
    for (const x of [-.5, .47]) p.box(`side${x}`, [x, 0, -.17, x + .03, TALL, .18], w);
    p.box('back', [-.47, 0, .16, .47, TALL, .18], flat(shade(WOOD, .7)));
    p.box('top', [-.5, TALL - .03, -.17, .5, TALL, .18], w);
    [0, .37, .74, 1.11, 1.48].forEach((y, i) => { p.box(`shelf${i}`, [-.47, y, -.17, .47, y + .03, .16], w); books(p, `books${i}`, [-.46, .46], y + .03, -.12, .15, .3); });
  } },
  { id: 'f_sink', desc: 'A porcelain water basin with a water tap and drain, designed to be fitted into an opening on a countertop.', build: (p) => {
    carcass(p, 'cabinet', [-.48, -.28, .48, .3], .86, flat(0xe8e4dc), doors(2, 0xe8e4dc, 0x9a9a9a));
    // The countertop around a basin set into it.
    p.box('top-l', [-.5, .86, -.32, -.24, .9, .3], speckle('f_sink_top', 0xd8d4c8, [0xccc8bc], .3));
    p.box('top-r', [.24, .86, -.32, .5, .9, .3], speckle('f_sink_top', 0xd8d4c8, [0xccc8bc], .3));
    p.box('top-f', [-.24, .86, -.32, .24, .9, -.22], speckle('f_sink_top', 0xd8d4c8, [0xccc8bc], .3));
    p.box('top-b', [-.24, .86, .14, .24, .9, .3], speckle('f_sink_top', 0xd8d4c8, [0xccc8bc], .3));
    p.box('basin', [-.24, .74, -.22, .24, .87, .14], layers(porcelain, sides(['top'], (ctx, x, y, w, h) => { fill(ctx, x + 2, y + 2, w - 4, h - 4, 0xd0d4d4); fill(ctx, x + Math.round(w / 2) - 1, y + Math.round(h / 2) - 1, 3, 3, 0x6a6a6a); })));
    p.box('tap', [-.02, .9, .16, .02, 1.08, .2], flat(0xc8ccd0), { metal: true });
    p.box('spout', [-.02, 1.04, .06, .02, 1.08, .2], flat(0xc8ccd0), { metal: true });
    for (const x of [-.1, .07]) p.box(`handle${x}`, [x, .9, .17, x + .03, .95, .2], flat(0xc8ccd0), { metal: true });
  } },
  { id: 'f_metal_bench', desc: 'A bench made of metal.  Not the most comfortable furniture you\'ve ever sat on.', build: (p) => {
    const m = flat(0x3a4a3e);
    for (const x of [-.45, .41]) { p.box(`leg${x}`, [x, 0, -.2, x + .04, .44, .2], m, { metal: true }); p.box(`back-post${x}`, [x, .44, .16, x + .04, .85, .2], m, { metal: true }); }
    for (const z of [-.2, -.1, 0, .1]) p.box(`seat${z}`, [-.5, .42, z, .5, .45, z + .07], m, { metal: true });
    for (const y of [.55, .68, .8]) p.box(`back${y}`, [-.5, y, .17, .5, y + .06, .2], m, { metal: true });
  } },
  { id: 'f_utility_shelf', desc: 'A simple heavy-duty plastic and metal shelving unit, intended to store tools and materials for easy access to workers.', build: (p) => {
    // 1500 L: 1 m × 0.5 m × 1.8 m, black plastic shelves on steel posts, a few tool boxes.
    for (const [x, z] of [[-.5, -.25], [.46, -.25], [-.5, .21], [.46, .21]]) p.box(`post${x}${z}`, [x, 0, z, x + .04, 1.8, z + .04], flat(0x8a8e92), { metal: true });
    [.08, .5, .92, 1.34, 1.76].forEach((y, i) => p.box(`shelf${i}`, [-.5, y, -.25, .5, y + .04, .25], layers(plastic(0x2a2a2c), (ctx, x, yy, w, h) => { for (let k = 3; k < w; k += 6) fill(ctx, x + k, yy, 1, h, 0x1e1e20); })));
    const r = rng('f_utility_shelf');
    [.12, .54, .96, 1.38].forEach((y, i) => { for (let k = 0; k < 2; k++) if (r() < .8) { const x = -.45 + k * .48 + r() * .05, c = [0xc83a2a, 0x2a5ac8, 0xd8a020, 0x4a4a4a][Math.floor(r() * 4)]; p.box(`bin${i}${k}`, [x, y, -.2, x + .36, y + .22 + r() * .1, .18], layers(plastic(c), front((ctx, xx, yy, w) => fill(ctx, xx + Math.round(w / 2) - 3, yy + 3, 6, 2, shade(c, .6))))); } });
  } },
  { id: 'f_street_light', desc: 'A raised light source which used to illuminate streets and their surrounding area, but it\'s useless without electricity.', build: (p) => {
    // Real street lights stand 6–9 m; like trees, compressed into two levels (4.5 m).
    const m = flat(0x6a6e72);
    p.box('base', [-.12, 0, -.12, .12, .5, .12], m, { metal: true });
    p.box('pole', [-.06, .5, -.06, .06, 4.4, .06], m, { metal: true });
    p.box('arm', [-.04, 4.3, -1.0, .04, 4.38, .04], m, { metal: true });
    p.box('head', [-.12, 4.22, -1.25, .12, 4.36, -.85], m, { metal: true });
    p.box('lens', [-.1, 4.2, -1.22, .1, 4.22, -.88], flat(0xd8d4c0));
  } },
  { id: 'f_rack_wood', desc: 'A wooden shelving unit with angled storage surfaces designed to show off whatever is stored on it.', build: (p) => {
    const w = wood('f_rack_wood', LIGHT_WOOD, 2);
    for (const x of [-.5, .46]) p.box(`side${x}`, [x, 0, -.3, x + .04, 1.5, .3], wood('f_rack_wood_side', LIGHT_WOOD, 1, true));
    p.box('back', [-.46, .1, .26, .46, 1.5, .3], w);
    for (const [i, y] of [.15, .55, .95, 1.3].entries()) {
      const g = p.group(`shelf${i}`, { at: [0, y, .26], rotX: -.2 });
      p.box(`shelf${i}`, [-.46, 0, -.5, .46, .025, 0], w, { parent: g });
      goods({ ...p, box: (n, b, paint, o = {}) => p.box(n, b, paint, { ...o, parent: g }) }, `goods${i}`, [-.44, .44], .025, -.44, -.08, .14);
    }
  } },
  { id: 'f_solar_unit', desc: 'A set of photovoltaic power generators, which turns solar radiation into useable electricity.', build: (p) => {
    // Polycrystalline panels on a tilted rack.
    const m = flat(0xa0a4a8);
    for (const [x, z, h] of [[-.45, -.4, .3], [.41, -.4, .3], [-.45, .36, .75], [.41, .36, .75]]) p.box(`post${x}${z}`, [x, 0, z, x + .04, h, z + .04], m, { metal: true });
    const g = p.group('tilt', { at: [0, .52, 0], rotX: -.55 });
    p.box('panel', [-.5, 0, -.5, .5, .04, .5], layers(flat(0x2a3a6a), (ctx, x, y, w, h, side) => { if (side !== 'top') return; const r = rng('poly'); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (r() < .3) fill(ctx, x + i, y + j, 1, 1, r() < .5 ? 0x34488a : 0x223060); grid(0xc8ccd0, 6, 10)(ctx, x, y, w, h); border(0xc8ccd0)(ctx, x, y, w, h); }), { parent: g, ppm: 96 });
  } },
  { id: 'f_armchair', desc: 'A simple upholstered chair with armrests.  Soft and fairly warm.', build: (p) => {
    const f = fabric('f_armchair', 0x4a7a4a);
    p.box('base', [-.42, .08, -.4, .42, .3, .42], f);
    p.box('cushion', [-.3, .3, -.4, .3, .45, .22], layers(f, sides(['top'], border(shade(0x4a7a4a, .8)))));
    p.box('back', [-.42, .3, .22, .42, .92, .42], f);
    for (const s of [-1, 1]) p.box(`arm${s}`, [s < 0 ? -.42 : .3, .3, -.4, s < 0 ? -.3 : .42, .62, .42], f);
    legs(p, [-.4, -.38, .4, .4], .08, .05, flat(DARK_WOOD));
  } },
  { id: 'f_dresser', desc: 'A simple wooden cabinet with a column of short drawers.', build: (p) => {
    // 2000 L of drawers: a tall chest, 0.8 × 0.5 × 1.25 m.
    carcass(p, 'chest', [-.4, -.24, .4, .26], 1.25, wood('f_dresser', WOOD, 1, true), drawers(5, WOOD));
    p.box('top', [-.42, 1.25, -.26, .42, 1.28, .27], wood('f_dresser_top', WOOD, 2));
  } },
  { id: 'f_toilet', desc: 'An invaluable fixture in any home … The standing tank may hold a moderate amount of water.', build: (p) => {
    p.box('foot', [-.12, 0, -.2, .12, .3, .12], porcelain);
    p.box('bowl', [-.19, .3, -.36, .19, .42, .14], porcelain);
    p.box('seat', [-.2, .42, -.37, .2, .44, .1], layers(flat(0xf6f6f2), sides(['top'], (ctx, x, y, w, h) => fill(ctx, x + 3, y + 3, w - 6, h - 6, 0x9ab4c0))));
    p.box('tank', [-.21, .44, .12, .21, .8, .3], porcelain);
    p.box('lid', [-.22, .8, .1, .22, .83, .31], porcelain);
    p.box('flush', [-.18, .72, .1, -.12, .74, .12], flat(0xc8ccd0), { metal: true });
  } },
  { id: 'f_stool', desc: 'A simple stool with four legs and a seat.', build: (p) => {
    legs(p, [-.16, -.16, .16, .16], .42, .035, flat(shade(WOOD, .85)));
    p.box('rung', [-.14, .15, -.14, .14, .17, .14], flat(shade(WOOD, .85)));
    p.box('seat', [-.18, .42, -.18, .18, .46, .18], wood('f_stool', WOOD, 2));
  } },
  { id: 'f_wardrobe', desc: 'A very large wooden cabinet for storing clothes, effectively an upright closet.', build: (p) => {
    carcass(p, 'body', [-.5, -.28, .5, .3], TALL - .04, wood('f_wardrobe', DARK_WOOD, 1, true), layers(doors(2, DARK_WOOD), (ctx, x, y, w, h) => fill(ctx, x + 1, y + Math.round(h * .82), w - 2, 1, shade(DARK_WOOD, .6))));
    p.box('crown', [-.5, TALL - .04, -.3, .5, TALL, .31], flat(shade(DARK_WOOD, .9)));
  } },
  { id: 'f_floor_lamp', desc: 'A light mounted on the top of a metal pole, this would be plugged into a wall socket to illuminate a room.', build: (p) => {
    p.box('base', [-.14, 0, -.14, .14, .03, .14], flat(0x2a2a2c), { metal: true });
    p.box('pole', [-.015, .03, -.015, .015, 1.5, .015], flat(0x8a8e92), { metal: true });
    p.box('shade', [-.18, 1.42, -.18, .18, 1.68, .18], layers(fabric('f_floor_lamp', 0xe8dcc0), sides(['top', 'bottom'], (ctx, x, y, w, h) => fill(ctx, x + 3, y + 3, w - 6, h - 6, 0x2a2a2a))));
    p.box('cord', [-.005, 0, -.005, .005, .01, .5], flat(0x1a1a1a));
  } },
  { id: 'f_bathtub', desc: 'An ordinary ceramic tub, with a now-functionless steel faucet and a plug fixed over the drain.', build: (p) => {
    // A 200 L tub, 1 m section of a 1.7 m tub (two tiles in CDDA's bathrooms).
    for (const [n, b] of [['f', [-.5, 0, -.38, .5, .55, -.3]], ['b', [-.5, 0, .3, .5, .55, .38]], ['l', [-.5, 0, -.3, -.42, .55, .3]], ['r', [.42, 0, -.3, .5, .55, .3]]]) p.box(n, b, porcelain);
    p.box('floor', [-.42, 0, -.3, .42, .1, .3], layers(porcelain, sides(['top'], (ctx, x, y, w, h) => { fill(ctx, x, y, w, h, 0xd8dcdc); fill(ctx, x + w - 6, y + Math.round(h / 2) - 1, 3, 3, 0x6a6a6a); })));
    p.box('faucet', [.36, .55, -.03, .46, .6, .03], flat(0xc8ccd0), { metal: true });
    p.box('plug', [.33, .1, -.02, .37, .12, .02], flat(0x2a2a2a));
  } },
  { id: 'f_trashcan', desc: 'A plastic bin for storing discarded waste as to be disposed of later.', build: (p) => {
    // 40 L kitchen bin.
    const c = 0x8ac0c8;
    p.box('bin', [-.15, 0, -.15, .15, .55, .15], layers(plastic(c), (ctx, x, y, w) => fill(ctx, x, y + 3, w, 1, shade(c, .8))));
    p.box('lid', [-.16, .55, -.16, .16, .6, .16], plastic(shade(c, .9)));
    p.box('pedal', [-.06, 0, -.19, .06, .03, -.15], flat(0x5a5e62), { metal: true });
  } },
  { id: 'f_grave_stone', desc: 'An upright slab of stone with information engraved on the face about whoever lies beneath.', build: (p) => {
    const stone = speckle('f_grave_stone', 0x8a8a86, [0x969692, 0x7e7e7a], .35);
    p.box('slab', [-.3, 0, -.08, .3, .7, .08], layers(stone, front((ctx, x, y, w, h) => { fill(ctx, x + Math.round(w * .45), y + 4, Math.max(2, Math.round(w * .1)), Math.round(h * .25), 0x5a5a56); fill(ctx, x + Math.round(w * .32), y + 8, Math.round(w * .36), 2, 0x5a5a56); for (let j = 0; j < 3; j++) fill(ctx, x + Math.round(w * .2), y + Math.round(h * (.5 + j * .1)), Math.round(w * .6), 1, 0x5a5a56); })));
    p.box('round', [-.24, .7, -.08, .24, .78, .08], stone);
    p.box('cap', [-.14, .78, -.08, .14, .82, .08], stone);
  } },
  { id: 'f_grave_stone_old', desc: 'An aged and eroded gravestone, damaged to the point of rendering the inscription illegible.', build: (p) => {
    // Older, darker stone, leaning, the top worn into steps, the carving worn away, moss at the foot.
    const stone = layers(speckle('f_grave_stone_old', 0x5e5e5a, [0x6a6a66, 0x52524e, 0x4a5a3a], .45), cracks('old-stone', 0x3a3a36, 3));
    const g = p.group('lean', { at: [0, .026, 0], rotX: .12, rotZ: -.06 }); // its low corner just touches the ground
    p.box('slab', [-.28, 0, -.08, .28, .62, .08], layers(stone, front((ctx, x, y, w, h) => { const r = rng('worn'); for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) if (r() < .4) fill(ctx, x + Math.round(w * (.2 + i * .13)), y + Math.round(h * (.45 + j * .1)), 2, 1, 0x4a4a46); })), { parent: g });
    p.box('worn-top', [-.2, .62, -.08, .16, .7, .08], stone, { parent: g });
    p.box('chip', [-.12, .7, -.08, .02, .74, .08], stone, { parent: g });
    p.box('moss', [-.3, 0, -.12, .3, .05, .1], speckle('moss', 0x4a6a2e, [0x5a7a36, 0x3a5a26], .5));
  } },
  { id: 'f_entertainment_center', desc: 'While not quite as cool by itself as the name might imply, this large wooden cabinet can store a variety of things, like a TV and media systems.', build: (p) => {
    const w = wood('f_entertainment_center', DARK_WOOD, 1, true);
    carcass(p, 'base', [-.5, -.24, .5, .3], .55, w, doors(2, DARK_WOOD));
    for (const x of [-.5, .3]) p.box(`tower${x}`, [x, .55, -.2, x + .2, 1.8, .3], front(layers(w, (ctx, xx, y, ww, h) => { for (let j = 1; j < 4; j++) fill(ctx, xx, y + Math.round((j * h) / 4), ww, 1, shade(DARK_WOOD, .6)); }), w));
    p.box('bridge', [-.3, 1.62, -.2, .3, 1.8, .3], w);
    p.box('back', [-.3, .55, .26, .3, 1.62, .3], flat(shade(DARK_WOOD, .7)));
    p.box('shelf', [-.3, 1.1, -.2, .3, 1.13, .3], w);
    books(p, 'media', [-.28, .28], 1.13, -.15, .25, .2);
    p.box('tv', [-.28, .58, -.02, .28, .98, .06], front(layers(flat(0x1a1a1e), (ctx, x, y, ww, h) => { fill(ctx, x + 2, y + 2, ww - 4, h - 4, 0x0e1014); fill(ctx, x + Math.round(ww * .6), y + 4, Math.round(ww * .25), 1, 0x2a2e36); }), flat(0x1a1a1e)));
    p.box('player', [-.18, .55, -.18, .18, .6, .2], flat(0x2a2a2c));
  } },
  // Mid-century coffee table: a rounded walnut top on four tapered, splayed legs with brass feet, a
  // magazine shelf below. On it what the description names: coffee on a coaster, tasteful books, a game.
  { id: 'f_coffee_table', desc: 'A low table usually found in living rooms, it makes an ideal surface for playing games, showing off some tasteful books, or presumably for putting coffee cups on.  No one cares if you use a coaster anymore.  (1.0 × 0.56 m, 42 cm high.)', build: (p) => {
    const WAL = 0x6a4428, wal = K.woodP(WAL), dark = K.woodP(shade(WAL, .8));
    // Top: a slab with rounded corners, a thin lighter edge band.
    const rounded = (hw, hd, r, y0, y1) => {
      const pts = [];
      for (const [cx, cz] of [[hw - r, hd - r], [-hw + r, hd - r], [-hw + r, -hd + r], [hw - r, -hd + r]]) for (let k = 0; k <= 4; k++) {
        const a = Math.atan2(cz, cx) - Math.PI / 4 + (k / 4) * Math.PI / 2;
        for (const y of [y0, y1]) pts.push(K.V(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r));
      }
      return pts;
    };
    K.hull(p, 'top', rounded(.5, .28, .08, .395, .425), wal);
    K.hull(p, 'edge', rounded(.495, .275, .078, .382, .396), dark);
    // Legs: from under the top's corners, splayed out to the floor, tapering, brass-capped.
    const at = (sx, sz, y) => K.V(sx * (.37 + .06 * (1 - y / .382)), y, sz * (.17 + .05 * (1 - y / .382)));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      K.tube(p, `leg${sx}${sz}`, at(sx, sz, .382), at(sx, sz, .03), .022, .013, 8, dark);
      const f = at(sx, sz, .015);
      K.cyl(p, `foot${sx}${sz}`, 'y', [f.x, .015, f.z], .012, .03, 8, K.steelP(0xc8a048), K.STEEL);
    }
    // Shelf rails front and back between the legs, the shelf resting on them.
    for (const sz of [-1, 1]) K.tube(p, `rail${sz}`, at(-1, sz, .12), at(1, sz, .12), .012, .012, 6, dark);
    K.bevel(p, 'shelf', [-.4, .132, -.2, .4, .15, .2], .004, K.woodP(shade(WAL, 1.15)));
    // A board game on the shelf: a red box with a yellow title band.
    K.qbox(p, 'game', [-.34, .15, -.15, -.02, .195, .1], layers(flat(0xb83a2a), (ctx, x, y, w, h) => { fill(ctx, x, y + Math.round(h * .38), w, Math.max(1, Math.round(h * .2)), 0xe8c040); fill(ctx, x + Math.round(w * .1), y + Math.round(h * .45), Math.round(w * .5), 1, 0x2a2a2a); }));
    K.bevel(p, 'magazine', [.05, .15, -.16, .3, .156, .03], .001, layers(flat(0xe8e4d8), (ctx, x, y, w, h) => { fill(ctx, x, y, w, Math.round(h * .3), 0x2a5a9a); for (let j = Math.round(h * .45); j < h - 2; j += 3) fill(ctx, x + 2, y + j, w - 4, 1, 0x8a8a8a); }));
    // Tasteful books: two stacked hardbacks at one end.
    K.bevel(p, 'book1', [-.38, .425, -.1, -.14, .455, .07], .003, layers(flat(0x2a4a3a), (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * .4), w, Math.max(1, Math.round(h * .15)), 0xd8c070)));
    K.bevel(p, 'book2', [-.35, .455, -.07, -.17, .478, .05], .003, layers(flat(0x7a2a2a), (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * .45), w, Math.max(1, Math.round(h * .12)), 0xe8e0c8)));
    // Coffee on a cork coaster: a white mug, coffee inside, a C handle.
    K.cyl(p, 'coaster', 'y', [.2, .428, -.06], .045, .006, 12, flat(0xb08a58));
    K.cyl(p, 'mug', 'y', [.2, .476, -.06], .038, .09, 12, flat(0xf0ece4));
    K.cyl(p, 'coffee', 'y', [.2, .5215, -.06], .033, .002, 12, flat(0x3a2414));
    const h = [[.236, .505], [.262, .5], [.268, .476], [.262, .452], [.236, .447]];
    for (let k = 0; k < h.length - 1; k++) K.tube(p, `handle${k}`, K.V(h[k][0], h[k][1], -.06), K.V(h[k + 1][0], h[k + 1][1], -.06), .006, .006, 5, flat(0xf0ece4));
  } },
  { id: 'f_fridge', desc: 'A standard household refrigerator.', build: (p) => {
    // 433 L: 0.8 × 0.72 × 1.8 m, freezer door on top.
    const c = 0xe8ece8;
    p.box('body', [-.4, .02, -.34, .4, 1.8, .38], front(layers(appliance(c), (ctx, x, y, w, h) => { fill(ctx, x, y + Math.round(h * .32), w, 1, shade(c, .7)); for (const yy of [.12, .5]) fill(ctx, x + 3, y + Math.round(h * yy), 2, Math.round(h * .14), 0x9a9ea2); }), appliance(c)));
  } },
  { id: 'f_console_broken', desc: 'A standalone computer terminal.  It doesn\'t seem to be working.  It\'s the broken screen and shattered circuit boards telling you that.', build: (p) => {
    const c = 0xb4b8b0;
    p.box('pedestal', [-.35, 0, -.25, .35, .8, .3], front(layers(metal('f_console', c), (ctx, x, y, w, h) => { for (let j = 6; j < h * .4; j += 3) fill(ctx, x + 4, y + j, w - 8, 1, shade(c, .7)); }), metal('f_console_s', c)));
    p.box('desk', [-.4, .8, -.35, .4, .84, .3], metal('f_console_d', shade(c, .9)));
    p.box('keyboard', [-.25, .84, -.3, .25, .87, -.12], layers(flat(0x5a5e5a), (ctx, x, y, w, h, side) => { if (side === 'top') for (let j = 1; j < h; j += 2) for (let i = 1; i < w; i += 2) fill(ctx, x + i, y + j, 1, 1, 0xc8ccc4); }));
    p.box('monitor', [-.26, .84, -.05, .26, 1.3, .28], front(layers(metal('f_console_m', c), (ctx, x, y, w, h) => { fill(ctx, x + 3, y + 3, w - 6, h - 8, 0x10140e); cracks('screen', 0x9ab89a, 5)(ctx, x + 3, y + 3, w - 6, h - 8, 'front'); }), metal('f_console_m2', c)));
    // Shattered circuit board hanging out of the opened pedestal.
    p.box('board', [.1, .3, -.3, .3, .32, -.18], layers(flat(0x2a6a3a), (ctx, x, y, w, h) => { const r = rng('pcb'); for (let i = 0; i < w * h / 6; i++) fill(ctx, x + Math.floor(r() * w), y + Math.floor(r() * h), 1, 1, r() < .5 ? 0xc8a040 : 0x1a1a1a); }));
  } },
  { id: 'f_cardboard_box', desc: 'A large box made of brown corrugated paper.  Could contain a number of things.', build: (p) => {
    // 324 L: 0.75 × 0.65 × 0.66 m, flaps taped down.
    const c = 0xb8905a;
    p.box('box', [-.375, 0, -.325, .375, .66, .325], layers(speckle('f_cardboard_box', c, [shade(c, 1.05), shade(c, .93)], .3), sides(['top'], (ctx, x, y, w, h) => { fill(ctx, x, y + Math.round(h / 2) - 2, w, 4, 0xd8c8a0); fill(ctx, x, y + Math.round(h / 2), w, 1, shade(c, .7)); }), sides(['front', 'back'], (ctx, x, y, w) => fill(ctx, x + Math.round(w / 2) - 2, y, 4, 6, 0xd8c8a0))));
  } },
  { id: 'f_tatami', desc: 'A type of mat used as a flooring material in traditional Japanese-style rooms.', build: (p) => {
    p.box('mat', [-.5, 0, -.5, .5, .05, .5], layers(speckle('f_tatami', 0xc8b878, [0xbcac6c, 0xd4c484], .5), sides(['top'], (ctx, x, y, w, h) => { for (let j = 1; j < h; j += 2) fill(ctx, x, y + j, w, 1, 0xb8a868); fill(ctx, x, y, w, 3, 0x2a3a2a); fill(ctx, x, y + h - 3, w, 3, 0x2a3a2a); })), { ppm: 64 });
  } },
  { id: 'f_filing_cabinet', desc: 'A rack of metal drawers designed to hold various files and paperwork.', build: (p) => {
    // 200 L: four drawers, 0.47 × 0.7 × 1.32 m.
    const c = 0x4a4e52;
    p.box('body', [-.235, 0, -.35, .235, 1.32, .35], front(layers(metal('f_filing', c), drawers(4, c, 0xb0b4b8), (ctx, x, y, w, h) => { for (let i = 0; i < 4; i++) fill(ctx, x + Math.round(w / 2) - 3, y + Math.round(((i + .15) * h) / 4), 6, 3, 0xe8e4dc); }), metal('f_filing_s', c)));
  } },
  { id: 'f_glass_fridge', desc: 'A modern refrigerator with a thick sheet of glass for a door, used in stores to show off the goods while keeping them cool.', build: (p) => {
    // 347 L glass-door merchandiser: 0.65 × 0.7 m, TALL high, with lit shelves of drinks.
    const c = 0xd8dce0;
    for (const [n, b] of [['l', [-.33, 0, -.35, -.29, TALL, .35]], ['r', [.29, 0, -.35, .33, TALL, .35]], ['back', [-.29, 0, .31, .29, TALL, .35]], ['base', [-.29, 0, -.35, .29, .2, .31]], ['canopy', [-.29, 1.68, -.35, .29, TALL, .31]]]) p.box(n, b, metal(`f_glass_fridge${n}`, c));
    p.box('sign', [-.29, 1.7, -.36, .29, 1.83, -.35], layers(flat(0xc82a2a), (ctx, x, y, w, h) => fill(ctx, x + 4, y + Math.round(h / 2) - 1, w - 8, 2, 0xf4f4f0)), { glow: true });
    [.3, .64, .98, 1.32].forEach((y, i) => { p.box(`shelf${i}`, [-.29, y, -.28, .29, y + .02, .3], flat(0xb8bcc0)); goods(p, `drinks${i}`, [-.27, .27], y + .02, -.24, .2, .26); });
    p.box('door', [-.29, .2, -.35, .29, 1.68, -.32], glass(0xc8e4ec), { glass: true });
    p.box('handle', [.22, .8, -.4, .25, 1.3, -.35], flat(0x9aa0a4), { metal: true });
  } },
  { id: 'f_vent_pipe', desc: 'A sort of chimney spout for a building\'s internal ventilation system.', build: (p) => {
    const m = metal('f_vent_pipe', 0x5a5e62);
    p.box('flashing', [-.22, 0, -.22, .22, .06, .22], m);
    p.box('pipe', [-.1, .06, -.1, .1, .8, .1], m, { metal: true });
    p.box('cap', [-.2, .9, -.2, .2, .96, .2], m, { metal: true });
    for (const [x, z] of [[-.12, -.12], [.09, -.12], [-.12, .09], [.09, .09]]) p.box(`strut${x}${z}`, [x, .8, z, x + .03, .9, z + .03], m);
  } },
  // Bentwood coat tree: a turned pole on four curved feet, a ball finial, two tiers of curved hooks;
  // a trench coat and a fedora hung on it.
  { id: 'f_rack_coat', desc: 'A tall wooden pole with a set of hooks used to store outdoor jackets and hats to allow easy access.  (1.8 m: a dark bentwood coat tree, a khaki trench coat hung at the front left, a fedora at the front right.)', build: (p) => {
    const WAL = 0x5a3a22, w = K.woodP(WAL), dk = K.woodP(shade(WAL, .8));
    // Pole with turned rings, a finial on top.
    K.cyl(p, 'pole', 'y', [0, .9, 0], .024, 1.6, 10, w, {}, .02);
    for (const y of [.2, 1.3, 1.7]) K.cyl(p, `ring${y}`, 'y', [0, y, 0], .032, .025, 10, dk);
    K.blob(p, 'finial', [.036, .04, .036], [0, 1.74, 0], dk, {}, 4, 10);
    // Four curved feet: out and down from the pole's base, a pad on the floor.
    const foot = [[.02, .22], [.12, .14], [.22, .06], [.3, .015]];
    for (let a = 0; a < 4; a++) {
      const g = p.group(`foot${a}`, { rotY: a * Math.PI / 2 });
      for (let k = 0; k < foot.length - 1; k++) K.tube(p, `foot${a}-${k}`, K.V(foot[k][0], foot[k][1], 0), K.V(foot[k + 1][0], foot[k + 1][1], 0), .022, .018, 8, w, { parent: g });
      K.bevel(p, `pad${a}`, [.27, 0, -.025, .33, .02, .025], .006, dk, { parent: g });
    }
    // Hooks: out from the pole, curving up to a ball tip; the upper tier on the diagonals, the lower between.
    const hook = (name, rot, y, s) => {
      const g = p.group(name, { at: [0, y, 0], rotY: rot }), pts = [[.02, 0], [.09 * s, -.018], [.14 * s, 0], [.165 * s, .05]];
      for (let k = 0; k < pts.length - 1; k++) K.tube(p, `${name}-${k}`, K.V(pts[k][0], pts[k][1], 0), K.V(pts[k + 1][0], pts[k + 1][1], 0), .011, .009, 6, w, { parent: g });
      K.blob(p, `${name}-tip`, [.014, .014, .014], [.168 * s, .062, 0], dk, { parent: g }, 3, 8);
    };
    for (let a = 0; a < 4; a++) hook(`hook${a}`, Math.PI / 4 + a * Math.PI / 2, 1.6, 1);
    for (let a = 0; a < 4; a++) hook(`low${a}`, a * Math.PI / 2, 1.4, .8);
    // A khaki trench coat hung by its collar on the front-left hook (local +x), hanging down its back to the pole.
    const coat = p.group('coat', { rotY: Math.PI * .75 }), KH = 0xa08a5a, cl = K.clothP(KH);
    K.hull(p, 'coat', [[.15, 1.6, .05], [.15, 1.6, -.05], [.22, 1.6, .05], [.22, 1.6, -.05], [.12, 1.47, .2], [.12, 1.47, -.2], [.25, 1.47, .2], [.25, 1.47, -.2], [.12, .66, .24], [.12, .66, -.24], [.27, .66, .24], [.27, .66, -.24]].map((q) => K.V(...q)), cl, { parent: coat });
    for (const s of [-1, 1]) K.tube(p, `sleeve${s}`, K.V(.2, 1.45, s * .2), K.V(.22, .86, s * .22), .045, .04, 8, K.clothP(shade(KH, .92)), { parent: coat });
    K.bevel(p, 'belt', [.115, 1.04, -.225, .265, 1.09, .225], .005, flat(shade(KH, .78)), { parent: coat });
    K.bevel(p, 'buckle', [.262, 1.035, -.03, .272, 1.095, .03], .002, K.steelP(0xb8a060), { ...K.STEEL, parent: coat });
    K.hull(p, 'collar', [[.15, 1.62, .07], [.15, 1.62, -.07], [.24, 1.6, .08], [.24, 1.6, -.08], [.25, 1.52, .13], [.25, 1.52, -.13], [.27, 1.55, 0]].map((q) => K.V(...q)), K.clothP(shade(KH, .9)), { parent: coat });
    for (let k = 0; k < 4; k++) for (const z of [-.06, .06]) K.cyl(p, `button${k}${z}`, 'x', [.272, 1.32 - k * .14, z], .009, .005, 6, flat(0x3a2a1a), { parent: coat });
    // A grey fedora on the front-right hook, its crown over the hook's tip, tilted out.
    const hat = p.group('hat', { at: [Math.cos(Math.PI / 4) * .168, 1.66, -Math.sin(Math.PI / 4) * .168], rotY: Math.PI / 4 });
    const tilt = p.group('tilt', { parent: hat, rotZ: -.9 });
    K.cyl(p, 'crown', 'y', [0, .02, 0], .068, .1, 10, K.clothP(0x5a5a5e), { parent: tilt }, .056);
    K.cyl(p, 'brim', 'y', [0, -.028, 0], .13, .008, 12, K.clothP(0x4e4e52), { parent: tilt });
    K.cyl(p, 'band', 'y', [0, -.012, 0], .07, .022, 10, flat(0x1e1e20), { parent: tilt });
  } },
  { id: 'f_workbench', desc: 'A sturdy workbench built out of metal.  It is perfect for crafting large and heavy things.', build: (p) => {
    const m = flat(0x4a5258);
    p.box('top', [-.5, .86, -.35, .5, .92, .35], layers(metal('f_workbench', 0x8a9298), cracks('bench', 0x5a6268, 3)), { metal: true });
    legs(p, [-.48, -.33, .48, .33], .86, .06, m, { metal: true });
    p.box('shelf', [-.46, .15, -.31, .46, .18, .31], metal('f_workbench_shelf', 0x6a7278));
    // A bench vise on the front corner.
    p.box('vise', [.25, .92, -.42, .45, 1.02, -.25], flat(0x2a5a9a), { metal: true });
    p.box('vise-screw', [.33, .95, -.5, .37, .99, -.42], flat(0xb0b4b8), { metal: true });
  } },
  { id: 'f_bigmirror', desc: 'A full-length mirror mounted in a sleek aluminum frame.', build: (p) => {
    const al = flat(0xc0c4c8);
    p.box('frame', [-.28, .05, .1, .28, 1.75, .14], al, { metal: true });
    p.box('glass', [-.25, .08, .095, .25, 1.72, .1], layers(flat(0xd4e0e6), (ctx, x, y, w, h) => { for (let k = 0; k < 2; k++) for (let t = 0; t < Math.min(w, h) * .5; t++) fill(ctx, x + Math.round(w * (.2 + k * .25)) + t, y + Math.round(h * .1) + t * 2, 2, 1, 0xf4f8fa); }));
    for (const s of [-1, 1]) p.box(`foot${s}`, [s * .22 - .03, 0, -.1, s * .22 + .03, .05, .2], al, { metal: true });
  } },
  { id: 'f_sign', desc: 'A simple signpost made of wood.  Basically two planks alongside each other nailed to another plank that holds them up.', build: (p) => {
    p.box('post', [-.05, 0, -.03, .05, 1.6, .03], wood('f_sign_post', WOOD, 1, true));
    for (const [i, y] of [1.15, 1.35].entries()) p.box(`plank${i}`, [-.45, y, -.06, .45, y + .19, -.03], layers(wood(`f_sign${i}`, LIGHT_WOOD, 1), (ctx, x, yy, w, h) => { fill(ctx, x + Math.round(w / 2) - 1, yy + Math.round(h / 2), 2, 1, 0x3a3a3a); for (let k = 0; k < 4; k++) fill(ctx, x + Math.round(w * (.15 + k * .17)), yy + Math.round(h * .35), Math.round(w * .1), Math.max(1, Math.round(h * .3)), 0x3a2a1e); }));
  } },
  { id: 'f_warehouse_shelf', desc: 'A huge, sturdy steel shelf for storing pallets of crates in warehouses.', build: (p) => {
    // Pallet racking: blue uprights, orange beams, pallets of crates on two levels (3500 L).
    for (const [x, z] of [[-.5, -.45], [.45, -.45], [-.5, .4], [.45, .4]]) p.box(`upright${x}${z}`, [x, 0, z, x + .05, TALL, z + .05], layers(flat(0x2a5aa8), (ctx, xx, y, w, h) => { for (let j = 3; j < h; j += 6) fill(ctx, xx + 1, y + j, 1, 2, 0x1a3a70); }), { metal: true });
    for (const y of [.86, TALL - .08]) for (const z of [-.45, .4]) p.box(`beam${y}${z}`, [-.5, y, z, .5, y + .08, z + .05], flat(0xe07a20), { metal: true });
    for (const y of [0, .94]) {
      p.box(`pallet${y}`, [-.45, y, -.42, .45, y + .12, .42], wood(`pallet${y}`, LIGHT_WOOD, 5, true));
      const r = rng(`crates${y}`);
      for (const [x, z] of [[-.43, -.4], [0, -.4], [-.43, 0], [0, 0]]) { const h = .25 + r() * .38; p.box(`crate${y}${x}${z}`, [x, y + .12, z, x + .42, y + .12 + h, z + .38], layers(speckle(`crate${x}${z}${y}`, 0xb8905a, [0xa8804a], .3), (ctx, xx, yy, w, hh) => fill(ctx, xx, yy + Math.round(hh * .3), w, 2, 0xd8c8a0))); }
    }
  } },
  { id: 'f_washer', desc: 'An appliance used to clean laundry.', build: (p) => {
    const c = 0xf0f0ec;
    p.box('body', [-.3, .02, -.3, .3, .85, .3], front(layers(appliance(c), porthole(0xb0b4b8, 0x3a5a7a), (ctx, x, y, w) => { fill(ctx, x + 3, y + 3, Math.round(w * .3), 4, 0x6a8ab0); fill(ctx, x + w - 8, y + 3, 4, 4, 0x8a8e92); }), appliance(c)));
  } },
  { id: 'f_mailbox', desc: 'A small metal box on top of a wooden post, designed to receive mail deliveries.', build: (p) => {
    p.box('post', [-.05, 0, -.05, .05, .9, .05], wood('f_mailbox_post', WOOD, 1, true));
    p.box('box', [-.1, .9, -.25, .1, 1.08, .22], metal('f_mailbox', 0x9aa0a4), { metal: true });
    p.box('roof', [-.08, 1.08, -.25, .08, 1.12, .22], metal('f_mailbox_r', 0x9aa0a4), { metal: true });
    p.box('door', [-.1, .9, -.26, .1, 1.1, -.25], flat(0x8a9094));
    p.box('flag', [.1, .96, -.05, .12, 1.15, .0], flat(0xd02a2a));
  } },
  { id: 'f_air_conditioner', desc: 'A large, blocky appliance encased in sheet metal.  This commonplace fixture is used for cooling large indoor areas.', build: (p) => {
    // An outdoor condenser: louvred sides and a fan grille on top.
    const c = 0xc8ccc8;
    p.box('pad', [-.48, 0, -.48, .48, .05, .48], flat(0x9a9a96));
    p.box('body', [-.42, .05, -.42, .42, .85, .42], layers(metal('f_ac', c), sides(['front', 'back', 'left', 'right'], (ctx, x, y, w, h) => { for (let j = 4; j < h - 3; j += 2) fill(ctx, x + 3, y + j, w - 6, 1, shade(c, .65)); }), sides(['top'], (ctx, x, y, w, h) => { const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * .42; for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) { const d = Math.hypot(i, j); if (d < R && (Math.round(d) % 3 === 0 || Math.abs(i) < 1 || Math.abs(j) < 1)) fill(ctx, Math.round(cx + i), Math.round(cy + j), 1, 1, 0x2a2a2a); } })));
  } },
  { id: 'f_oven', desc: 'A standard electric convection-based oven, commonly used for heating and cooking food.', build: (p) => {
    const c = 0x3a3e42;
    p.box('body', [-.38, 0, -.32, .38, .9, .32], front(layers(metal('f_oven', c), (ctx, x, y, w, h) => { fill(ctx, x + 4, y + Math.round(h * .3), w - 8, Math.round(h * .45), 0x1a1c1e); fill(ctx, x + 8, y + Math.round(h * .38), w - 16, Math.round(h * .25), 0x2a2018); fill(ctx, x + 4, y + Math.round(h * .26), w - 8, 2, 0xb0b4b8); }), metal('f_oven_s', c)));
    p.box('top', [-.38, .9, -.32, .38, .92, .32], layers(flat(0x1a1a1c), (ctx, x, y, w, h, side) => { if (side !== 'top') return; for (const [i, j] of [[.28, .3], [.72, .3], [.28, .7], [.72, .7]]) { const cx = x + w * i, cy = y + h * j, R = Math.min(w, h) * .15; for (let b = -R; b <= R; b++) for (let a = -R; a <= R; a++) if (Math.round(Math.hypot(a, b)) === Math.round(R) || Math.round(Math.hypot(a, b)) === Math.round(R / 2)) fill(ctx, Math.round(cx + a), Math.round(cy + b), 1, 1, 0x6a6a6a); } }));
    p.box('backguard', [-.38, .92, .26, .38, 1.05, .32], layers(metal('f_oven_b', c), front((ctx, x, y, w, h) => { for (let k = 0; k < 5; k++) fill(ctx, x + Math.round(w * (.12 + k * .18)), y + Math.round(h * .35), 3, 3, 0xd0d0d0); })));
  } },
  { id: 'f_dumpster', desc: 'A large metal dumpster that will likely not be getting picked up by the city\'s waste management any time soon.', build: (p) => {
    // 1500 L, one tile: 1 m × 0.95 m × 1.2 m, green steel with black plastic lids and side pockets.
    const c = 0x2a6a3a;
    p.box('body', [-.44, .1, -.42, .44, 1.12, .48], layers(metal('f_dumpster', c), sides(['front', 'back'], (ctx, x, y, w, h) => { for (let i = 4; i < w; i += Math.round(w / 5)) fill(ctx, x + i, y, 2, h, shade(c, .75)); }), sides(['front'], (ctx, x, y, w, h) => cracks('dumpster', 0x6a3a2a, 3)(ctx, x, y, w, h, 'front'))));
    for (const x of [-.44, 0]) p.box(`lid${x}`, [x, 1.12, -.44, x + .44, 1.18, .48], plastic(0x1e1e20));
    for (const s of [-1, 1]) p.box(`pocket${s}`, [s < 0 ? -.5 : .44, .75, -.25, s < 0 ? -.44 : .5, .9, .25], flat(shade(c, .8)), { metal: true });
    for (const [x, z] of [[-.42, -.36], [.34, -.36], [-.42, .34], [.34, .34]]) p.box(`wheel${x}${z}`, [x, 0, z, x + .08, .1, z + .08], flat(0x1a1a1a));
  } },
  { id: 'f_camp_chair', desc: 'A somewhat uncomfortable folding chair, with fabric strung across a metal frame.', build: (p) => {
    const m = flat(0x5a5e62), f = fabric('f_camp_chair', 0x2a4a7a);
    for (const s of [-1, 1]) {
      const g = p.group(`x${s}`, { at: [s * .25, 0, 0] });
      for (const r of [-.55, .55]) { const leg = p.group(`leg${s}${r}`, { at: [0, .22, 0], rotX: r, parent: g }); p.box(`leg${s}${r}`, [-.012, -.24, -.012, .012, .24, .012], m, { parent: leg, metal: true }); }
      p.box(`arm${s}`, [s * .25 - .03, .58, -.2, s * .25 + .03, .61, .18], f);
      p.box(`armpost${s}`, [s * .25 - .01, .42, -.18, s * .25 + .01, .58, -.16], m, { metal: true });
    }
    p.box('seat', [-.24, .38, -.2, .24, .42, .18], f);
    const back = p.group('back', { at: [0, .42, .18], rotX: -.18 });
    p.box('back', [-.24, 0, -.02, .24, .45, .01], f, { parent: back });
    p.box('cupholder', [.25, .56, -.22, .33, .61, -.14], flat(0x1a2a4a));
  } },
  { id: 'f_dryer', desc: 'A common household appliance used to quickly dry large batches of clothing after they have been washed.', build: (p) => {
    const c = 0xf0f0ec;
    p.box('body', [-.3, .02, -.3, .3, .85, .3], front(layers(appliance(c), porthole(0xd0d4d8, 0x5a5e62), (ctx, x, y, w) => { for (let k = 0; k < 3; k++) fill(ctx, x + w - 9 - k * 6, y + 3, 4, 4, 0x8a8e92); fill(ctx, x + 3, y + 4, Math.round(w * .2), 2, 0xd88a2a); }), appliance(c)));
    p.box('lint', [-.08, .86, -.28, .08, .87, -.2], flat(0x9a9ea2));
  } },
  { id: 'f_small_satellite_dish', desc: 'A small sheet metal disc designed to receive radio waves from orbital satellites.', build: (p) => {
    const m = flat(0xd8d8d4);
    p.box('mast', [-.03, 0, -.03, .03, .55, .03], flat(0x8a8e92), { metal: true });
    const g = p.group('dish', { at: [0, .6, 0], rotX: .6 }); // facing up and out
    p.box('dish', [-.3, -.3, -.03, .3, .3, .02], layers(m, (ctx, x, y, w, h) => { const cx = x + w / 2, cy = y + h / 2; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (Math.hypot(x + i - cx, y + j - cy) > w / 2) ctx.clearRect(x + i, y + j, 1, 1); }), { parent: g, cutout: true });
    p.box('arm', [-.015, -.25, -.33, .015, -.22, -.03], flat(0x8a8e92), { parent: g, metal: true });
    p.box('lnb', [-.04, -.27, -.4, .04, -.19, -.32], flat(0x2a2a2a), { parent: g });
  } },
  { id: 'f_recycle_bin', desc: 'A large plastic bin painted green with a \'recycle\' symbol emblazoned on it.', build: (p) => {
    // 200 L wheelie bin: 0.58 × 0.72 × 1.07 m.
    const c = 0x4a9a4a;
    p.box('bin', [-.29, .08, -.36, .29, 1.0, .36], layers(plastic(c), front(recycle(0xf4f4f0))));
    p.box('lid', [-.3, 1.0, -.38, .3, 1.07, .38], plastic(shade(c, .85)));
    for (const s of [-1, 1]) p.box(`wheel${s}`, [s < 0 ? -.29 : .21, 0, .22, s < 0 ? -.21 : .29, .16, .38], flat(0x1a1a1a));
    p.box('handle', [-.25, .98, .36, .25, 1.03, .42], plastic(shade(c, .8)));
  } },
  { id: 'f_shower', desc: 'A small enclosed ceramic room with a glass door and plumbing fixtures for cleaning oneself.', build: (p) => {
    const tile = layers(flat(0xeaeae6), grid(0xc8c8c4, 6, 12));
    p.box('tray', [-.45, 0, -.45, .45, .08, .45], layers(porcelain, sides(['top'], (ctx, x, y, w, h) => fill(ctx, x + Math.round(w / 2) - 1, y + Math.round(h / 2) - 1, 3, 3, 0x6a6a6a))));
    for (const [n, b] of [['back', [-.45, .08, .4, .45, TALL, .45]], ['l', [-.45, .08, -.45, -.4, TALL, .4]], ['r', [.4, .08, -.45, .45, TALL, .4]]]) p.box(n, b, tile);
    p.box('door', [-.4, .1, -.45, .4, TALL - .05, -.43], glass(0xd0e8ee), { glass: true });
    p.box('door-handle', [.3, .9, -.48, .33, 1.1, -.45], flat(0xc8ccd0), { metal: true });
    p.box('riser', [-.01, 1.2, .37, .01, 1.78, .4], flat(0xc8ccd0), { metal: true });
    p.box('head', [-.06, 1.74, .2, .06, 1.78, .4], flat(0xc8ccd0), { metal: true });
    p.box('valve', [-.04, 1.0, .38, .04, 1.08, .4], flat(0xc8ccd0), { metal: true });
  } },
  { id: 'f_displaycase', desc: 'A secure wooden case at about waist-height, with glass paneling on top.', build: (p) => {
    carcass(p, 'case', [-.5, -.3, .5, .3], .8, wood('f_displaycase', DARK_WOOD, 1, true), doors(2, DARK_WOOD, 0x9a9a9a));
    p.box('bed', [-.48, .8, -.28, .48, .82, .28], flat(0x6a1a2a));
    const r = rng('displaycase');
    for (let k = 0; k < 4; k++) { const x = -.38 + k * .22 + r() * .04; p.box(`item${k}`, [x, .82, -.1, x + .06 + r() * .04, .86, .05], flat([0xc8a040, 0xb0b4b8, 0x2a6ac8, 0xd84a2a][k]), { metal: true }); }
    p.box('glass', [-.5, .8, -.3, .5, 1.0, .3], glass(0xd0e8ee), { glass: true });
    p.box('rim', [-.5, 1.0, -.3, .5, 1.02, .3], layers(flat(DARK_WOOD), (ctx, x, y, w, h, side) => { if (side === 'top') { ctx.clearRect(x + 3, y + 3, w - 6, h - 6); } }), { cutout: true });
  } },
  { id: 'f_pool_table', desc: 'A large wooden table with green felt carpeting on top, and a set of symmetrical holes that carry billiard balls to an opening on one side.', build: (p) => {
    // One tile of a 2.5 m table (CDDA lays it over several tiles): felt bed, cushions, pockets.
    p.box('body', [-.5, .45, -.5, .5, .72, .5], wood('f_pool_table', DARK_WOOD, 1));
    p.box('felt', [-.42, .72, -.42, .42, .76, .42], layers(speckle('felt', 0x1e6a3a, [0x247440, 0x1a5e34], .4)));
    for (const [n, b] of [['f', [-.5, .72, -.5, .5, .8, -.42]], ['b', [-.5, .72, .42, .5, .8, .5]], ['l', [-.5, .72, -.42, -.42, .8, .42]], ['r', [.42, .72, -.42, .5, .8, .42]]]) p.box(`rail-${n}`, b, wood(`pool${n}`, DARK_WOOD, 1));
    for (const [x, z] of [[-.46, -.46], [.42, -.46], [-.46, .42], [.42, .42]]) p.box(`pocket${x}${z}`, [x, .76, z, x + .04, .81, z + .04], flat(0x0a0a0a));
    legs(p, [-.46, -.46, .46, .46], .45, .1, wood('pool-legs', DARK_WOOD, 1, true));
    for (const [x, z, c] of [[.1, .05, 0xf4f4f0], [-.15, -.1, 0xd8b020], [-.2, .15, 0xc82a2a]]) p.box(`ball${x}`, [x, .76, z, x + .05, .81, z + .05], flat(c));
  } },
];

export const FURNITURE = RECIPES.map((r) => ({ ppm: 64, ...r, dir: 'furniture', source: 'tools/cubeclysm/page/furniture.js' }));
