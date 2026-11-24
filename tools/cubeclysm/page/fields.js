// Cubeclysm fields: CDDA field types (fd_*) that CDDA draws (display_field), one model per look
// stage. A field covers one tile: origin = the tile centre on the floor, the tile spans x, z in
// [-0.5, 0.5]. What CDDA calls intensity changes the look (blood splatter → stain → pool), so each
// distinct intensity name is a model of its own (fields-data.js says which intensity shows which).
//
// What a field is made of follows how much it does:
//  - small traces (stains, splatter, dust, footprints) are cut-out decals: a painted layer a
//    millimetre thick, the floor showing through its holes;
//  - things with a shape (gibs, rubble, webs, bees, vents, portals) are 3D blocks;
//  - dangerous or moving fields (fire, gas, smoke, electricity, acid, plasma, rifts) also get the
//    looping FX clip (fx.js convention: 2.4 s, only fx_* nodes move).
//
// Several fields can share a tile (blood under smoke under fire), so each kind keeps to its own
// layer and they stack without fighting:
//  - ground decals sit at their own height slot (SLOT): no two kinds share a plane, the upper
//    one's holes show the lower one;
//  - debris lies on the floor (above every decal), off-centre, never covering the whole tile;
//  - webs hang from 0.3 m up, gas and smoke are see-through puffs (haze material, no depth
//    writes) from the floor up to 1.7 m, light and fire glow (emissive) in the middle of the tile.
// The model's layer is written to meshset.json (`field.layer`) for engines that order or cull them.
import * as THREE from 'three';

import { FX_CLIP } from './fx.js';
import { STAGES } from './fields-data.js';
import { blob, lump, tube } from './item-kit.js';
import { V, hull, pane } from './lowpoly.js';
import { css, fill, mix, rng, shade } from './paint.js';
import { flat, layers, speckle } from './props.js';

const PERIOD = 2.4, STEPS = 24, TAU = Math.PI * 2;

/** Ground decal slots, bottom to top (y = slot × SLOT_Y above the floor). */
export const SLOT = { scorch: 1, dust: 2, earth: 3, water: 4, oil: 5, blood: 6, goo: 7, light: 8, print: 9, mark: 10 };
const SLOT_Y = 0.0015;

// CDDA colour names → the colours the decals and puffs use.
const C = {
  red: 0x8a1212, light_red: 0xd8483a, green: 0x3d8a2a, light_green: 0x8ad040, blue: 0x2f5fd0, light_blue: 0x7fb4ff,
  cyan: 0x40c8d8, magenta: 0xc040c8, pink: 0xe08ab0, yellow: 0xe8c838, brown: 0x6a4a2a, white: 0xeeeeea,
  light_gray: 0xa8a8a4, dark_gray: 0x4a4a4c,
};

// --- animation --------------------------------------------------------------------------------

/** The FX clip of one model: fx_* nodes and their looping tracks. */
export function anim(p) {
  const tracks = [], r = rng(`${p.id}|fx`);
  let n = 0;
  const node = (name, at = [0, 0, 0], parent = p.root) => {
    const g = new THREE.Group();
    g.name = `fx_${name}_${n++}`;
    g.position.set(...at);
    parent.add(g);
    return g;
  };
  /** f(u) → { p: [dx, dy, dz] from the node's place, s: scale (number or [x, y, z]), rx/ry/rz: turn }. */
  const track = (g, phase, f) => {
    const times = [], pos = [], scl = [], rot = [];
    let turns = false;
    for (let i = 0; i <= STEPS; i++) {
      const u = (i / STEPS + phase) % 1, o = f(u), d = o.p ?? [0, 0, 0], s = o.s ?? 1;
      times.push((i / STEPS) * PERIOD);
      pos.push(g.position.x + d[0], g.position.y + d[1], g.position.z + d[2]);
      scl.push(...(Array.isArray(s) ? s : [s, s, s]).map((k) => Math.max(0.001, k)));
      if (o.rx !== undefined || o.ry !== undefined || o.rz !== undefined) turns = true;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0));
      rot.push(q.x, q.y, q.z, q.w);
    }
    tracks.push(new THREE.VectorKeyframeTrack(`${g.name}.position`, times, pos), new THREE.VectorKeyframeTrack(`${g.name}.scale`, times, scl));
    if (turns) tracks.push(new THREE.QuaternionKeyframeTrack(`${g.name}.quaternion`, times, rot));
  };
  return { r, node, track, done: () => { if (tracks.length) p.clip = new THREE.AnimationClip(FX_CLIP, PERIOD, tracks); } };
}

/** 0 → 1 → 0 over the loop: grows in by `a`, fades from `b`. */
export const env = (u, a = 0.15, b = 0.75) => (u < a ? u / a : u > b ? Math.max(0, (1 - u) / (1 - b)) : 1);
/** On for `duty` of each of k flashes. */
export const blink = (u, k, duty) => ((u * k) % 1 < duty ? 1 : 0);

// --- painters ---------------------------------------------------------------------------------

/**
 * Only the top face is painted; the rest is left transparent (cut-out). (The bottom face is a
 * mirror image a millimetre below, and cut-outs are double-sided: painting it too would show
 * every asymmetric mark twice, mirrored.)
 */
const faceUp = (paint) => (ctx, x, y, w, h, side) => {
  ctx.clearRect(x, y, w, h);
  if (side === 'top') paint(ctx, x, y, w, h);
};
/** Only a pane's two faces are painted (webs, mirrors). */
const faces2 = (paint) => (ctx, x, y, w, h, side) => {
  ctx.clearRect(x, y, w, h);
  if (side === 'front' || side === 'back') paint(ctx, x, y, w, h);
};

/** A blot with a wobbly edge: centre (cx, cy) and radii in fractions of the face. */
export function splotch(ctx, X, Y, W, H, cx, cy, rx, ry, hex, r, wob = 0.3) {
  const k1 = 2 + Math.floor(r() * 3), k2 = 5 + Math.floor(r() * 3), p1 = r() * TAU, p2 = r() * TAU;
  ctx.fillStyle = css(hex);
  const x0 = Math.max(0, Math.floor((cx - rx * 1.4) * W)), x1 = Math.min(W, Math.ceil((cx + rx * 1.4) * W));
  const y0 = Math.max(0, Math.floor((cy - ry * 1.4) * H)), y1 = Math.min(H, Math.ceil((cy + ry * 1.4) * H));
  for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) {
    const dx = ((i + 0.5) / W - cx) / rx, dy = ((j + 0.5) / H - cy) / ry, a = Math.atan2(dy, dx);
    const edge = 1 + wob * (0.6 * Math.sin(k1 * a + p1) + 0.4 * Math.sin(k2 * a + p2));
    if (dx * dx + dy * dy < edge * edge) ctx.fillRect(X + i, Y + j, 1, 1);
  }
}

/**
 * Liquid on the floor. kind: splatter (a blot and flung drops), stain (overlapping blots, dark
 * rim), pool (one wide puddle with wet glints), trail (a wavy smear across the tile), streak (a
 * long smear), glob (stain with a raised bead added by the builder).
 */
export const liquid = (seed, { base, rim = shade(base, 0.72), glint = mix(base, 0xffffff, 0.45), kind, size = 1, sheen = null }) => (ctx, X, Y, W, H) => {
  const r = rng(seed);
  const blot = (cx, cy, rad, ry = rad, wob = 0.3) => {
    splotch(ctx, X, Y, W, H, cx, cy, rad * 1.12, ry * 1.12, rim, r, wob);
    splotch(ctx, X, Y, W, H, cx, cy, rad, ry, base, r, wob);
  };
  const drops = (n, spread, cx = 0.5, cy = 0.5) => {
    for (let k = 0; k < n; k++) {
      const a = r() * TAU, d = spread * (0.4 + r() * 0.6), s = (0.012 + r() * 0.02) * size;
      splotch(ctx, X, Y, W, H, cx + Math.cos(a) * d, cy + Math.sin(a) * d, s, s, base, r, 0.1);
    }
  };
  const glints = (n, cx, cy, spread) => {
    for (let k = 0; k < n; k++) fill(ctx, X + Math.round((cx + (r() - 0.5) * spread) * W), Y + Math.round((cy + (r() - 0.5) * spread) * H), 1 + Math.floor(r() * 2), 1, glint);
  };
  const cx = 0.42 + r() * 0.16, cy = 0.42 + r() * 0.16;
  if (kind === 'splatter') { blot(cx, cy, 0.09 * size); drops(10, 0.3 * size, cx, cy); glints(2, cx, cy, 0.08); }
  if (kind === 'stain' || kind === 'glob') {
    for (let k = 0; k < 3; k++) blot(cx + (r() - 0.5) * 0.22, cy + (r() - 0.5) * 0.22, (0.12 + r() * 0.08) * size);
    drops(8, 0.36 * size, cx, cy); glints(4, cx, cy, 0.2);
  }
  if (kind === 'pool') {
    blot(0.5, 0.5, 0.36 * size, 0.33 * size, 0.18);
    for (let k = 0; k < 3; k++) blot(0.5 + (r() - 0.5) * 0.5, 0.5 + (r() - 0.5) * 0.5, 0.12 * size, 0.1 * size);
    splotch(ctx, X, Y, W, H, 0.5, 0.5, 0.22 * size, 0.2 * size, shade(base, 0.86), r, 0.2);
    glints(12, 0.45, 0.42, 0.4);
  }
  if (kind === 'trail' || kind === 'streak') {
    const n = 14, wide = (kind === 'trail' ? 0.07 : 0.05) * size, ph = r() * TAU;
    for (let k = 0; k <= n; k++) {
      const t = k / n, along = kind === 'trail' ? [0.5 + Math.sin(t * Math.PI * 1.5 + ph) * 0.12, 0.04 + t * 0.92] : [0.18 + t * 0.64, 0.25 + t * 0.5];
      blot(along[0], along[1], wide * (0.8 + r() * 0.4), wide * (0.8 + r() * 0.4), 0.15);
    }
    glints(6, 0.5, 0.5, 0.6);
  }
  if (sheen) for (let k = 0; k < 18; k++) fill(ctx, X + Math.round((0.3 + r() * 0.4) * W), Y + Math.round((0.3 + r() * 0.4) * H), 2, 1, sheen[k % sheen.length]);
};

/** Grains and grime: scattered pixels and small clumps, denser in patches. */
export const grime = (seed, tones, density, clumps = 0) => (ctx, X, Y, W, H) => {
  const r = rng(seed);
  const centres = Array.from({ length: 3 }, () => [0.2 + r() * 0.6, 0.2 + r() * 0.6]);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const near = Math.min(...centres.map(([cx, cy]) => Math.hypot(i / W - cx, j / H - cy)));
    const edge = 1 - Math.max(Math.abs((i + 0.5) / W - 0.5), Math.abs((j + 0.5) / H - 0.5)) * 2;
    if (r() < density * Math.max(0, 1.3 - near * 2.6) * Math.min(1, edge * 3)) fill(ctx, X + i, Y + j, 1, 1, tones[Math.floor(r() * tones.length)]);
  }
  for (let k = 0; k < clumps; k++) fill(ctx, X + Math.floor(r() * (W - 3)), Y + Math.floor(r() * (H - 3)), 2 + Math.floor(r() * 2), 1 + Math.floor(r() * 2), tones[0]);
};

/** A web: spokes from a hub and a spiral, on a transparent face; `thick` adds matted patches. */
const webPaint = (seed, strand, { spokes = 9, rings = 6, thick = false, stars = null } = {}) => (ctx, X, Y, W, H) => {
  const r = rng(seed), cx = 0.3 + r() * 0.4, cy = 0.3 + r() * 0.4, R = 0.75;
  const dot = (u, v, hex = strand) => { if (u >= 0 && u < 1 && v >= 0 && v < 1) fill(ctx, X + Math.floor(u * W), Y + Math.floor(v * H), 1, 1, hex); };
  const line = (u0, v0, u1, v1) => { const n = Math.ceil(Math.hypot((u1 - u0) * W, (v1 - v0) * H)); for (let t = 0; t <= n; t++) dot(u0 + ((u1 - u0) * t) / n, v0 + ((v1 - v0) * t) / n); };
  const angles = Array.from({ length: spokes }, (_, k) => (k / spokes) * TAU + (r() - 0.5) * 0.3);
  for (const a of angles) line(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R);
  for (let k = 1; k <= rings; k++) {
    const d = (k / rings) * 0.55 * (0.9 + r() * 0.2);
    for (let s = 0; s < spokes; s++) {
      const a0 = angles[s], a1 = angles[(s + 1) % spokes] + (s + 1 === spokes ? TAU : 0);
      line(cx + Math.cos(a0) * d, cy + Math.sin(a0) * d, cx + Math.cos(a1) * d * 0.97, cy + Math.sin(a1) * d * 0.97);
    }
  }
  if (thick) for (let k = 0; k < 5; k++) splotch(ctx, X, Y, W, H, cx + (r() - 0.5) * 0.6, cy + (r() - 0.5) * 0.6, 0.06 + r() * 0.06, 0.04 + r() * 0.05, mix(strand, 0x808080, 0.15), r, 0.5);
  if (stars) for (let k = 0; k < 24; k++) dot(r(), r(), stars[k % stars.length]);
};

// --- building blocks --------------------------------------------------------------------------

/** A decal on the floor at its slot: `size` wide (square), centred at `at`. */
export function decal(p, name, slot, paint, { glow = false, size = 1, at = [0, 0], ppm = 64, parent } = {}) {
  const y = SLOT[slot] * SLOT_Y, h = size / 2;
  p.box(name, [at[0] - h, y, at[1] - h, at[0] + h, y + 0.001, at[1] + h], faceUp(paint), { cutout: !glow, glowCut: glow, ppm, parent });
}

/** Translucent puffs that rise, drift and thin out (gas, smoke, mist). */
export function puffs(p, A, { tones, n, height, size = 0.34, spread = 0.36, drift = 0.08, swirl = 0, glow = false, low = 0.02, rise = 0.6, holes = 0.35 }) {
  for (let i = 0; i < n; i++) {
    const s = size * (0.75 + A.r() * 0.5), y = low + s / 2 + A.r() * Math.max(0, height - s) * 0.55;
    const g = A.node('puff', [(A.r() - 0.5) * 2 * spread, y, (A.r() - 0.5) * 2 * spread]);
    const tone = tones[i % tones.length];
    p.box('puff', [-s / 2, -s / 2, -s / 2, s / 2, s / 2, s / 2], hazeP(`${p.id}puff${i}`, tone, holes), { parent: g, haze: true, glow, ppm: 24 });
    const ph = A.r() * TAU, up = Math.min(rise * height * 0.5, Math.max(0.05, height - y - s / 2));
    A.track(g, i / n, (u) => ({
      p: [Math.sin(u * TAU + ph) * drift + Math.cos(u * TAU * 0.5 + ph) * swirl, up * u, Math.cos(u * TAU + ph) * drift + Math.sin(u * TAU * 0.5 + ph) * swirl],
      s: env(u, 0.2, 0.7) * (0.85 + u * 0.4),
      ...(swirl ? { ry: u * TAU * 0.25 } : {}),
    }));
  }
}

/**
 * Haze: a speckled colour with pixels knocked out, more towards the edges of the face, so puffs
 * read as pixel smoke rather than glass boxes (the haze material multiplies this alpha in).
 */
export const hazeP = (seed, tone, holes = 0.35) => (ctx, X, Y, W, H, side) => {
  const r = rng(`${seed}:${side}`);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const edge = Math.max(Math.abs((i + 0.5) / W - 0.5), Math.abs((j + 0.5) / H - 0.5)) * 2;
    if (r() < holes + edge * edge * 0.5) continue;
    const k = r();
    fill(ctx, X + i, Y + j, 1, 1, k < 0.25 ? shade(tone, 1.12) : k < 0.45 ? shade(tone, 0.9) : tone);
  }
};

/** A static low blanket of haze (dense gas hugging the floor). */
function blanket(p, tone, h, { glow = false, w = 0.92 } = {}) {
  p.box('blanket', [-w / 2, 0.01, -w / 2, w / 2, h, w / 2], hazeP(`${p.id}blanket`, tone, 0.45), { haze: true, glow, ppm: 20 });
}

/**
 * Fire: tongues of flame rooted on the floor (a block that stretches and shrinks from its base,
 * yellow inside, orange, red tips), and licks that break off the top, rise and go out.
 */
export function flames(p, A, { n, height, width = 0.5, size = 0.12, colors = [0xffe070, 0xffa22a, 0xe8461a], at = [0, 0, 0] }) {
  for (let i = 0; i < n; i++) {
    const x = (A.r() - 0.5) * width, z = (A.r() - 0.5) * width, centre = 1 - Math.min(1, Math.hypot(x, z) / (width * 0.7 + 1e-6));
    const s = size * (0.7 + A.r() * 0.5), tall = height * (0.35 + 0.65 * centre) * (0.7 + A.r() * 0.4);
    const g = A.node('tongue', [at[0] + x, at[1], at[2] + z]);
    const c = i % 3;
    p.box('tongue', [-s / 2, 0, -s / 2, s / 2, tall * 0.55, s / 2], flat(colors[Math.min(2, c + (centre < 0.3 ? 1 : 0))]), { parent: g, glow: true });
    p.box('tongue tip', [-s * 0.3, tall * 0.55, -s * 0.3, s * 0.3, tall, s * 0.3], flat(colors[Math.min(2, c + 1)]), { parent: g, glow: true });
    const k = 2 + Math.floor(A.r() * 3), ph = A.r() * TAU;
    A.track(g, A.r(), (u) => ({ s: [1 + 0.1 * Math.sin(u * TAU * k + ph), 0.75 + 0.3 * Math.sin(u * TAU * k + ph) + 0.1 * Math.sin(u * TAU * 7), 1 + 0.1 * Math.cos(u * TAU * k + ph)] }));
  }
  for (let i = 0; i < Math.ceil(n / 2); i++) {
    const s = size * 0.5, g = A.node('lick', [at[0] + (A.r() - 0.5) * width * 0.6, at[1] + height * 0.45, at[2] + (A.r() - 0.5) * width * 0.6]);
    p.box('lick', [-s / 2, 0, -s / 2, s / 2, s * 1.4, s / 2], flat(colors[1 + (i % 2)]), { parent: g, glow: true });
    const sway = 0.03 * A.r(), ph = A.r() * TAU;
    A.track(g, i / Math.ceil(n / 2), (u) => ({ p: [Math.sin(u * TAU * 2 + ph) * sway, height * 0.6 * u, 0], s: env(u, 0.15, 0.4) * (1 - u * 0.5) }));
  }
}

/** Glowing motes that drift and twinkle (embers, sparkles, light, spores). */
export function motes(p, A, { n, color, size = 0.025, spread = 0.4, low = 0.05, height = 1, rise = 0.3, twinkle = 0, glow = true, fall = false }) {
  for (let i = 0; i < n; i++) {
    const g = A.node('mote', [(A.r() - 0.5) * 2 * spread, low + A.r() * height, (A.r() - 0.5) * 2 * spread]);
    const c = Array.isArray(color) ? color[i % color.length] : color;
    p.box('mote', [-size / 2, -size / 2, -size / 2, size / 2, size / 2, size / 2], flat(c), { parent: g, glow });
    const dx = (A.r() - 0.5) * 0.15, dz = (A.r() - 0.5) * 0.15, k = 3 + Math.floor(A.r() * 4);
    A.track(g, A.r(), (u) => ({ p: [dx * u, (fall ? -1 : 1) * rise * u, dz * u], s: env(u, 0.1, 0.8) * (twinkle ? (blink(u, k, twinkle) ? 1 : 0.15) : 1) }));
  }
}

/** A jagged arc of lightning between two points, flashing on and off. */
export function arc(p, A, from, to, { color = 0xbfe8ff, segs = 5, jag = 0.08, k = 3, duty = 0.55, r = 0.014, glow = true }) {
  const g = A.node('arc');
  let prev = V(...from);
  for (let s = 1; s <= segs; s++) {
    const t = s / segs, q = V(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t);
    if (s < segs) q.add(V((A.r() - 0.5) * jag * 2, (A.r() - 0.5) * jag * 2, (A.r() - 0.5) * jag * 2));
    tube(p, 'bolt', prev, q, r, r, 4, flat(color), { parent: g, glow });
    prev = q;
  }
  const ph = A.r();
  A.track(g, ph, (u) => ({ s: blink(u, k, duty) ? 1 : 0.001 }));
}

/** Liquid on the floor as a decal (and a raised bead or film for the thicker stages). */
function liquidField(p, slot, opts, { glow = false, bead = null } = {}) {
  decal(p, 'liquid', slot, liquid(p.id, opts), { glow });
  if (bead) {
    const r = rng(`${p.id}bead`);
    for (let k = 0; k < bead.n; k++) blob(p, 'bead', [bead.r * (0.7 + r() * 0.6), bead.r * 0.45, bead.r * (0.7 + r() * 0.6)], [(r() - 0.5) * 0.35, SLOT[slot] * SLOT_Y + bead.r * 0.2, (r() - 0.5) * 0.35], flat(bead.color), { glow: bead.glow }, 3, 7);
  }
}

/** Little bubbles rising from a liquid and popping (acid fizzing, sludge). */
export function bubbles(p, A, { n, color, spread = 0.3, rise = 0.12, size = 0.03 }) {
  for (let i = 0; i < n; i++) {
    const g = A.node('bubble', [(A.r() - 0.5) * 2 * spread, 0.012, (A.r() - 0.5) * 2 * spread]);
    p.box('bubble', [-size / 2, 0, -size / 2, size / 2, size, size / 2], speckle(`${p.id}b${i}`, color, [shade(color, 1.25)], 0.3), { parent: g, haze: true });
    A.track(g, i / n + A.r() * 0.2, (u) => ({ p: [0, rise * u * u, 0], s: u < 0.6 ? 0.3 + u : u < 0.8 ? 1.2 : 0.001 }));
  }
}

/** A floor vent: a steel grate in a frame, a little raised (vents of gas, fire, acid, shock). */
function vent(p, tint = 0x5a5c5e) {
  const frame = speckle(`${p.id}frame`, tint, [shade(tint, 1.15), shade(tint, 0.85)], 0.3);
  const grate = layers(flat(shade(tint, 0.35)), (ctx, x, y, w, h) => { for (let j = 1; j < h; j += 3) fill(ctx, x + 1, y + j, w - 2, 1, shade(tint, 1.25)); });
  p.box('vent frame', [-0.26, 0, -0.26, 0.26, 0.04, 0.26], frame, { metal: true });
  p.box('vent grate', [-0.21, 0.04, -0.21, 0.21, 0.046, 0.21], grate, { metal: true, ppm: 96 });
  p.box('vent soot', [-0.36, SLOT.scorch * SLOT_Y, -0.36, 0.36, SLOT.scorch * SLOT_Y + 0.001, 0.36], faceUp(grime(`${p.id}soot`, [shade(tint, 0.5), 0x2a2a2a], 0.25)), { cutout: true, ppm: 64 });
}

// --- the fields -------------------------------------------------------------------------------

const SMOKE = { '': 0xb8b8b4, light_gray: 0x9a9a98, dark_gray: 0x4c4c4e };
/** Gas: stage 0 is a thin haze, 1 a cloud, 2 a thick cloud hugging the floor. */
function gasField(p, A, stage, tones, { glow = false, swirl = 0, extra } = {}) {
  const n = [5, 9, 14][stage], height = [0.9, 1.35, 1.7][stage];
  if (stage === 2) blanket(p, tones[0], 0.5, { glow });
  puffs(p, A, { tones, n, height, size: [0.28, 0.36, 0.44][stage], swirl, glow });
  extra?.(p, A);
}
const tonesOf = (base) => [base, shade(base, 1.12), mix(base, 0xffffff, 0.2)];

/** Smoke-like gases: their stage colour from CDDA, tinted by `tint`. */
const smokeLike = (tint, amount = 0.25) => (p, A, stage, st) => {
  const base = mix(SMOKE[st.colors[stage]] ?? SMOKE[''], tint, amount);
  gasField(p, A, stage, tonesOf(base));
};
/** Toxic-looking gases (hazy cloud → coloured gas → thick coloured gas). */
const toxic = (pal, opts = {}) => (p, A, stage, st) => gasField(p, A, stage, tonesOf(pal[stage] ?? C[st.colors[stage]] ?? 0xc8c8b8), opts);
/** Incense: one thin curling wisp of coloured smoke. */
const incense = (hex) => (p, A) => {
  // A ribbon of scented smoke curling up from the floor: small dense puffs on a slow helix.
  const tones = [hex, mix(hex, 0xffffff, 0.3), shade(hex, 0.85)];
  for (let i = 0; i < 14; i++) {
    const t = i / 14, a = t * TAU * 1.5, s = 0.07 + t * 0.12, g = A.node('wisp', [Math.cos(a) * (0.05 + t * 0.15), 0.08 + t * 1.3, Math.sin(a) * (0.05 + t * 0.15)]);
    p.box('wisp', [-s / 2, -s / 2, -s / 2, s / 2, s / 2, s / 2], hazeP(`${p.id}w${i}`, tones[i % 3], 0.15), { parent: g, haze: true, ppm: 32 });
    A.track(g, t, (u) => ({ p: [Math.cos(a + u * TAU) * 0.04, 0.12 * Math.sin(u * TAU), Math.sin(a + u * TAU) * 0.04], s: 0.85 + 0.25 * Math.sin(u * TAU + i) }));
  }
};

const BLOOD = (base, slot = 'blood') => (p, A, stage) => liquidField(p, slot, { base, kind: ['splatter', 'stain', 'pool'][stage] });

/** Gibs: chunks on a splash of their liquid. */
function gibs(p, A, stage, { liquidBase, chunk, alt, shapes }) {
  liquidField(p, 'blood', { base: liquidBase, kind: ['splatter', 'stain', 'pool'][stage], size: 0.8 + stage * 0.2 });
  const r = rng(`${p.id}gib`), n = [4, 7, 11][stage];
  // The heap (stage 3): a mound the pieces lie on and around.
  if (stage === 2) lump(p, 'heap', [0.16, 0.07, 0.13], chunk, `${p.id}heap`, {}, [0, 0, 0]);
  for (let k = 0; k < n; k++) {
    const a = r() * TAU, d = (0.08 + r() * 0.24) * (0.8 + stage * 0.15);
    shapes(p, k, r, [Math.cos(a) * d, stage === 2 && d < 0.15 ? 0.05 : 0, Math.sin(a) * d], k % 3 ? chunk : alt, stage);
  }
}
const meatP = (hex) => speckle(`meat${hex}`, hex, [shade(hex, 1.2), shade(hex, 0.75), 0xe8d0c0], 0.35);

const FIELD = {
  // Liquids --------------------------------------------------------------------------------
  fd_blood: BLOOD(0x7a0e0e),
  fd_blood_insect: BLOOD(0x4a7a1a),
  fd_blood_invertebrate: BLOOD(0x9a9a8e),
  fd_blood_veggy: (p, A, stage) => liquidField(p, 'blood', { base: [0x8ab030, 0x7a9a28, 0xa07a20][stage], kind: ['splatter', 'stain', 'pool'][stage] }, { bead: stage === 2 ? { n: 3, r: 0.03, color: 0xb08a28 } : null }),
  // Bile: a sickly yellow-green (the user's call; CDDA gives only a pink map symbol, no colour in words).
  fd_bile: (p, A, stage) => liquidField(p, 'goo', { base: [0xb8c840, 0xa8bc38, 0x98b030][stage], rim: 0x6a7a1a, glint: 0xf0f8b0, kind: ['splatter', 'stain', 'pool'][stage] }),
  fd_bile_adv: (p, A, stage) => {
    // Thick bile that gives off a little light: a raised film with glowing flecks.
    liquidField(p, 'goo', { base: [0xa8c030, 0x98b028, 0x88a020][stage], rim: 0x5a6a14, glint: 0xf0ffa0, kind: ['splatter', 'stain', 'pool'][stage] }, { bead: { n: 2 + stage * 2, r: 0.035, color: 0x90a828 } });
    motes(p, A, { n: 3 + stage * 3, color: 0xe8ff80, size: 0.018, spread: 0.25, low: 0.01, height: 0.02, rise: 0.04, twinkle: 0.5 });
  },
  fd_acid: (p, A, stage) => {
    // Dangerous: it fizzes.
    liquidField(p, 'goo', { base: [0x9ae040, 0x8ad030, 0x58b020][stage], rim: 0x4a8a18, glint: 0xe8ffb0, kind: ['splatter', 'streak', 'pool'][stage] });
    bubbles(p, A, { n: 3 + stage * 3, color: 0xc8ff70, spread: 0.12 + stage * 0.1 });
    if (stage === 2) puffs(p, A, { tones: [0xd0f0a0], n: 3, height: 0.4, size: 0.12, spread: 0.2 });
  },
  fd_slime: (p, A, stage) => liquidField(p, 'goo', { base: [0x9ad060, 0x8ac050, 0x5a9a30][stage], kind: ['trail', 'stain', 'pool'][stage] }, { bead: stage ? { n: stage * 2, r: 0.03, color: 0x8ac858 } : null }),
  fd_sap: (p, A, stage) => liquidField(p, 'goo', { base: [0xe0b030, 0xc89828, 0x8a5a20][stage], kind: ['splatter', 'glob', 'pool'][stage] }, { bead: stage === 1 ? { n: 3, r: 0.05, color: 0xd8a830 } : stage === 2 ? { n: 2, r: 0.04, color: 0x9a6a28 } : null }),
  fd_sludge: (p, A, stage) => {
    // A crawling sludge trail that burns: grey-black, slow bubbles.
    liquidField(p, 'goo', { base: [0x8a8a84, 0x4a4a48, 0x3a3a38][stage], rim: 0x2a2a28, kind: 'trail', size: 1 + stage * 0.5 }, { bead: stage ? { n: stage * 2, r: 0.04, color: 0x3a3a36 } : null });
    bubbles(p, A, { n: 2 + stage * 2, color: 0x6a6a64, spread: 0.2, rise: 0.06 });
  },
  fd_dirty_water: (p, A, stage) => liquidField(p, 'water', { base: [0x8a8676, 0x7a7466, 0x5a564a][stage], glint: 0xc8d0d0, kind: ['splatter', 'stain', 'pool'][stage] }),
  fd_mechanical_fluid: (p, A, stage) => liquidField(p, 'oil', { base: [0x3a3632, 0x2e2a28, 0x1e1c1a][stage], glint: 0x8a8a8a, kind: ['splatter', 'stain', 'pool'][stage], sheen: [0x6a3a8a, 0x2a6a8a, 0x8a7a2a] }),
  fd_congealed_light: (p, A, stage) => {
    // Light gone solid: a glowing smear that pulses (dangerous).
    decal(p, 'light', 'light', liquid(p.id, { base: [0xb040b8, 0xc06890, 0xc8b0d0][stage], rim: [0x702878, 0x904070, 0x9070b0][stage], glint: 0xffffff, kind: ['streak', 'streak', 'pool'][stage] }), { glow: true });
    const g = A.node('glow', [0, 0.02, 0]);
    blob(p, 'light bead', [0.05 + stage * 0.03, 0.02, 0.05 + stage * 0.03], [0, 0, 0], flat([0xf0a0f8, 0xffc8e8, 0xffffff][stage]), { parent: g, glow: true }, 3, 8);
    A.track(g, 0, (u) => ({ s: 1 + 0.25 * Math.sin(u * TAU * 2) }));
    motes(p, A, { n: 4 + stage * 3, color: 0xffd8ff, size: 0.02, spread: 0.3, low: 0.02, height: 0.1, rise: 0.25, twinkle: 0.6 });
  },
  fd_blood_footprint_n: (p) => footprints(p, 0),
  fd_blood_footprint_e: (p) => footprints(p, 1),
  fd_blood_footprint_s: (p) => footprints(p, 2),
  fd_blood_footprint_w: (p) => footprints(p, 3),

  // Gibs and debris (3D) ----------------------------------------------------------------------
  fd_gibs_flesh: (p, A, stage) => gibs(p, A, stage, {
    liquidBase: 0x7a0e0e, chunk: meatP(0xa8322a), alt: meatP(0xd0786a),
    shapes: (p, k, r, at, paint, st) => (k % 4 === 3 ? tube(p, 'bone', V(at[0], at[1] + 0.016, at[2]), V(at[0] + 0.1, at[1] + 0.016, at[2] + (r() - 0.5) * 0.06), 0.014, 0.012, 5, flat(0xeae2cc)) : lump(p, 'flesh', [0.045 + r() * 0.035 + st * 0.012, 0.025 + r() * 0.02, 0.04 + r() * 0.03], paint, `${p.id}${k}`, {}, at)),
  }),
  fd_gibs_insect: (p, A, stage) => gibs(p, A, stage, {
    liquidBase: 0x4a7a1a, chunk: speckle('chitin', 0x5a4a2a, [0x7a6a3a, 0x3a2a1a], 0.4), alt: speckle('organ', 0xc8b048, [0x9a8a30, 0xe8d070], 0.4),
    shapes: (p, k, r, at, paint, st) => {
      const y = at[1];
      if (k % 3 === 0) { const a = V(at[0], y + 0.012, at[2]), b = a.clone().add(V(0.09, 0.06, 0.03)), c = b.clone().add(V(0.1, -0.06, -0.02)); tube(p, 'leg', a, b, 0.013, 0.011, 5, paint); tube(p, 'leg', b, c, 0.011, 0.005, 5, paint); return; }
      if (k % 3 === 1) { hull(p, 'shard', [V(at[0], y, at[2]), V(at[0] + 0.09, y, at[2] + 0.02), V(at[0] + 0.03, y, at[2] + 0.09), V(at[0] + 0.035, y + 0.025, at[2] + 0.035)], paint); return; }
      blob(p, 'organ', [0.04 + st * 0.012, 0.022, 0.032], [at[0], y + 0.02, at[2]], paint, {}, 3, 7);
    },
  }),
  fd_gibs_invertebrate: (p, A, stage) => {
    gibs(p, A, stage, {
      liquidBase: 0x9a9a8e, chunk: speckle('goo', 0xb8b0a0, [0xd0c8b8, 0x8a8478], 0.4), alt: speckle('goo2', 0x7a746a, [0x9a9488], 0.4),
      shapes: (p, k, r, at, paint, st) => blob(p, 'goo', [0.045 + r() * 0.03 + st * 0.012, 0.022 + r() * 0.012, 0.045 + r() * 0.03], [at[0], at[1] + 0.018, at[2]], paint, {}, 3, 7),
    });
    // Still quivering.
    const g = A.node('quiver', [0.05, 0, -0.05]);
    blob(p, 'quiver', [0.04 + stage * 0.015, 0.025, 0.04], [0, 0.02, 0], speckle('q', 0xa8a090, [0xc8c0b0], 0.4), { parent: g }, 3, 8);
    A.track(g, 0, (u) => ({ s: [1 + 0.08 * Math.sin(u * TAU * 3), 1 - 0.1 * Math.sin(u * TAU * 3), 1 + 0.08 * Math.sin(u * TAU * 3)] }));
  },
  fd_gibs_veggy: (p, A, stage) => {
    decal(p, 'sap', 'blood', liquid(p.id, { base: 0x8ab030, kind: 'splatter', size: 0.8 }));
    const r = rng(`${p.id}veg`), leaf = speckle('leaf', 0x4a8a2a, [0x6aa83a, 0x3a6a20], 0.35), twig = speckle('twig', 0x6a4a2a, [0x8a6a3a], 0.3);
    const n = [6, 12, 26][stage];
    for (let k = 0; k < n; k++) {
      const x = (r() - 0.5) * (0.6 + stage * 0.12), z = (r() - 0.5) * (0.6 + stage * 0.12), a = r() * TAU, l = 0.04 + r() * 0.04 + stage * 0.015, y = 0.004 + (stage === 2 ? (k / n) * 0.06 : 0);
      // Branches lie across each other (a tangle), resting on what is under them.
      if (k % 3 === 0 || (stage === 2 && k % 3 === 1 && k < 14)) {
        const len = 0.1 + stage * 0.1, cx = Math.max(-0.45 + len / 2, Math.min(0.45 - len / 2, x)), cz = Math.max(-0.45 + len / 2, Math.min(0.45 - len / 2, z)), dx = Math.cos(a) * len / 2, dz = Math.sin(a) * len / 2, rr = 0.007 + stage * 0.004;
        tube(p, 'twig', V(cx - dx, y + rr, cz - dz), V(cx + dx, y + rr + (stage ? r() * 0.025 : 0), cz + dz), rr, rr * 0.75, 5, twig);
      }
      else hull(p, 'leaf', [V(x, y, z), V(x + Math.cos(a) * l, y + 0.006, z + Math.sin(a) * l), V(x + Math.cos(a + 1.2) * l * 0.5, y + 0.004, z + Math.sin(a + 1.2) * l * 0.5), V(x + Math.cos(a - 1.2) * l * 0.5, y + 0.002, z + Math.sin(a - 1.2) * l * 0.5)], leaf);
    }
  },
  fd_rubble: (p) => {
    decal(p, 'grit', 'dust', grime(p.id, [0x6a6a66, 0x8a8a84, 0x4a4a48], 0.3, 20));
    const r = rng(`${p.id}rock`), stone = speckle('rubble', 0x7a7a74, [0x9a9a94, 0x5a5a56], 0.5);
    for (let k = 0; k < 9; k++) lump(p, 'rock', [0.05 + r() * 0.07, 0.03 + r() * 0.05, 0.05 + r() * 0.07], stone, `${p.id}${k}`, {}, [(r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6]);
  },
  fd_churned_earth: (p) => {
    decal(p, 'loose soil', 'earth', grime(p.id, [0x5a3e22, 0x6e4e2e, 0x48301a], 0.55, 30));
    const r = rng(`${p.id}clod`), soil = speckle('soil', 0x5e4226, [0x7a5632, 0x44301c], 0.5);
    for (let k = 0; k < 5; k++) lump(p, 'mound', [0.1 + r() * 0.08, 0.035 + r() * 0.03, 0.08 + r() * 0.07], soil, `${p.id}m${k}`, {}, [(r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5]);
    for (let k = 0; k < 10; k++) lump(p, 'clod', [0.02, 0.015, 0.02], soil, `${p.id}c${k}`, {}, [(r() - 0.5) * 0.8, 0, (r() - 0.5) * 0.8]);
  },
  fd_splinters: (p) => {
    decal(p, 'sawdust', 'dust', grime(p.id, [0xb08a5a, 0x8a6a40, 0xc8a070], 0.22, 12));
    const r = rng(`${p.id}sliver`), wood = speckle('sliver', 0xa07a4a, [0xc09a62, 0x7a5a34], 0.4);
    for (let k = 0; k < 14; k++) {
      const x = (r() - 0.5) * 0.7, z = (r() - 0.5) * 0.7, a = r() * TAU, l = 0.05 + r() * 0.12, w = 0.006 + r() * 0.012;
      const d = V(Math.cos(a), 0, Math.sin(a)), s = V(-d.z, 0, d.x).multiplyScalar(w);
      hull(p, 'sliver', [V(x, 0, z), V(x, 0, z).add(s), V(x, 0, z).addScaledVector(d, l), V(x, 0.008, z).addScaledVector(d, l * 0.3).add(s), V(x, 0.006, z)], wood);
    }
  },
  fd_fungal_splinters: (p, A) => {
    // Fungal debris (dangerous): pale fungal chunks that shed a little spore dust.
    decal(p, 'spore dust', 'dust', grime(p.id, [0xc8c4b0, 0xa8a490, 0xe0dcc8], 0.25, 10));
    const r = rng(`${p.id}f`), fungus = speckle('fungal', 0xd0ccb8, [0xa8a088, 0xe8e4d4, 0x8a8a6a], 0.45);
    for (let k = 0; k < 10; k++) lump(p, 'fungal chunk', [0.025 + r() * 0.03, 0.015 + r() * 0.02, 0.02 + r() * 0.03], fungus, `${p.id}${k}`, {}, [(r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6]);
    motes(p, A, { n: 6, color: 0xd8d4c0, size: 0.018, spread: 0.3, low: 0.03, height: 0.1, rise: 0.25, glow: false });
  },
  fd_dust: (p, A, stage) => decal(p, 'dust', 'dust', grime(p.id, stage ? [0x7a6046, 0x5a4632, 0x9a7e5e] : [0x9a8266, 0x8a7458], stage ? 0.4 : 0.18, stage ? 25 : 6)),
  fd_spores: (p, A, stage) => {
    // Spore dust (dangerous): a grey film and spores hanging in the air.
    decal(p, 'spores', 'dust', grime(p.id, [0xb8b8a8, 0x9a9a8a, 0xd0d0c0], stage ? 0.38 : 0.2, stage ? 18 : 6));
    motes(p, A, { n: 8 + stage * 8, color: [0xd8d8c4, 0xb8b8a0], size: 0.016, spread: 0.42, low: 0.05, height: 0.7, rise: 0.2, glow: false });
  },

  // Webs ---------------------------------------------------------------------------------------
  fd_web: (p, A, stage) => webs(p, stage, 0xe8e8e0, { thick: stage === 2 }),
  fd_web_nostick: (p, A, stage) => webs(p, stage, 0xd0d0cc, { thin: true }),
  fd_void_web: (p, A) => {
    // Starlit webs: dark strands that twinkle.
    webs(p, 1, 0x8a90c8, { stars: [0xffffff, 0xc8d8ff] });
    motes(p, A, { n: 10, color: [0xffffff, 0xd8e0ff], size: 0.016, spread: 0.4, low: 0.3, height: 1.3, rise: 0.02, twinkle: 0.35 });
  },

  // Fire ---------------------------------------------------------------------------------------
  fd_fire: (p, A, stage) => {
    decal(p, 'scorch', 'scorch', grime(p.id, [0x1e1a18, 0x2e2622, 0x3a2e26], 0.6 + stage * 0.15, 10));
    const r = rng(`${p.id}embers`);
    for (let k = 0; k < 3 + stage * 3; k++) lump(p, 'ember', [0.025, 0.012, 0.02], flat(k % 2 ? 0xff6a1a : 0xc83a10), `${p.id}e${k}`, { glow: true }, [(r() - 0.5) * 0.4, 0, (r() - 0.5) * 0.4]);
    flames(p, A, { n: [5, 10, 18][stage], height: [0.3, 0.7, 1.4][stage], width: [0.25, 0.5, 0.8][stage], size: [0.08, 0.12, 0.16][stage] });
    motes(p, A, { n: 4 + stage * 4, color: [0xffc040, 0xff7a20], size: 0.018, spread: 0.3, low: 0.1, height: 0.4, rise: 0.6 + stage * 0.3 });
    if (stage === 2) puffs(p, A, { tones: [0x4a4644, 0x5a5654], n: 4, height: 1.9, size: 0.3, spread: 0.25, low: 1.1, rise: 0.4 });
  },
  fd_fire_FAKE: (p, A, stage) => {
    // An illusory fire: golden and glittering, burns nothing (no scorch, no smoke).
    const gold = [0xfff0a0, 0xffd050, 0xffa830];
    if (stage === 0) motes(p, A, { n: 14, color: gold, size: 0.022, spread: 0.3, low: 0.02, height: 0.2, rise: 0.25, twinkle: 0.5 });
    if (stage === 1) motes(p, A, { n: 24, color: gold, size: 0.02, spread: 0.35, low: 0.9, height: 0.6, rise: 0.9, twinkle: 0.4, fall: true });
    if (stage === 2) flames(p, A, { n: 20, height: 1.7, width: 0.9, size: 0.15, colors: gold });
  },
  fd_flame_burst: (p, A) => {
    // A burst of fire: a fast, short jet.
    flames(p, A, { n: 14, height: 1.1, width: 0.6, size: 0.15, colors: [0xffe070, 0xff8a1a, 0xff4a10] });
    motes(p, A, { n: 10, color: [0xffd060, 0xff8a20], size: 0.02, spread: 0.35, low: 0.1, height: 0.6, rise: 0.8 });
  },
  fd_acid_vent: (p, A) => {
    // Acid welling up through a vent: a fizzing green pool round the grate, spurts of acid.
    decal(p, 'acid pool', 'goo', liquid(p.id, { base: 0x8ad030, rim: 0x4a8a18, glint: 0xe8ffb0, kind: 'pool', size: 1.1 }));
    vent(p, 0x5a6a4a);
    bubbles(p, A, { n: 8, color: 0xc8ff70, spread: 0.3 });
    for (let k = 0; k < 6; k++) {
      const g = A.node('spurt', [(A.r() - 0.5) * 0.2, 0.05, (A.r() - 0.5) * 0.2]), dx = (A.r() - 0.5) * 0.4, dz = (A.r() - 0.5) * 0.4;
      p.box('spurt', [-0.02, -0.02, -0.02, 0.02, 0.02, 0.02], flat(0x9ae040), { parent: g });
      A.track(g, k / 6, (u) => ({ p: [dx * u, 0.35 * 4 * u * (1 - u), dz * u], s: env(u, 0.05, 0.9) }));
    }
  },
  fd_gas_vent: (p, A) => { vent(p, 0x5a5e50); puffs(p, A, { tones: tonesOf(0x9ad050), n: 10, height: 1.5, size: 0.3, spread: 0.15, drift: 0.12, rise: 1 }); },
  fd_smoke_vent: (p, A) => { vent(p, 0x4a4a4c); puffs(p, A, { tones: tonesOf(0x707070), n: 10, height: 1.6, size: 0.32, spread: 0.15, drift: 0.12, rise: 1 }); },
  fd_fire_vent: (p, A) => { vent(p, 0x4a4442); flames(p, A, { n: 12, height: 1.0, width: 0.3, size: 0.12 }); },
  fd_incendiary: (p, A, stage) => {
    // Smoke, then airborne incendiary: reddish smoke with burning particles in it.
    gasField(p, A, stage ? 1 : 0, tonesOf(0x8a5a52));
    if (stage) motes(p, A, { n: 18, color: [0xff5a1a, 0xffa030], size: 0.024, spread: 0.4, low: 0.1, height: 1.2, rise: 0.3, twinkle: 0.6 });
  },

  // Electricity and light ------------------------------------------------------------------------
  fd_electricity: (p, A, stage) => electric(p, A, stage),
  fd_shock_vent: (p, A) => { vent(p, 0x4a525a); for (let k = 0; k < 4; k++) arc(p, A, [0, 0.05, 0], [(A.r() - 0.5) * 0.6, 0.3 + A.r() * 0.5, (A.r() - 0.5) * 0.6], { k: 3 + k, segs: 5 }); motes(p, A, { n: 8, color: 0xd8f0ff, size: 0.02, spread: 0.2, low: 0.05, height: 0.3, rise: 0.1, twinkle: 0.4 }); },
  fd_plasma: (p, A, stage) => {
    // Plasma: a glowing ball of hot gas, brighter by stage.
    const color = [0xd050d8, 0xf088c8, 0xfff0ff][stage], g = A.node('plasma', [0, 0.55, 0]);
    blob(p, 'plasma core', [0.08 + stage * 0.05, 0.08 + stage * 0.05, 0.08 + stage * 0.05], [0, 0, 0], flat(color), { parent: g, glow: true }, 4, 8);
    A.track(g, 0, (u) => ({ s: 1 + 0.18 * Math.sin(u * TAU * 3), p: [0, 0.03 * Math.sin(u * TAU), 0] }));
    puffs(p, A, { tones: [mix(color, 0xffffff, 0.2), color], n: 4 + stage * 3, height: 1.1, size: 0.18 + stage * 0.06, spread: 0.2, low: 0.3, glow: true, rise: 0.3 });
  },
  fd_laser: (p, A, stage) => {
    // A beam of light across the tile (along x), shimmering; faint glimmer is just motes.
    const color = [0x6a8aff, 0x9ac8ff, 0xffffff][stage];
    if (stage) {
      const g = A.node('beam', [0, 1.0, 0]), t = 0.02 + stage * 0.02;
      p.box('beam', [-0.5, -t / 2, -t / 2, 0.5, t / 2, t / 2], flat(color), { parent: g, glow: true });
      p.box('beam halo', [-0.5, -t * 1.5, -t * 1.5, 0.5, t * 1.5, t * 1.5], flat(mix(color, 0x4060ff, 0.3)), { parent: g, haze: true, glow: true });
      A.track(g, 0, (u) => ({ s: [1, 1 + 0.3 * Math.sin(u * TAU * 6), 1 + 0.3 * Math.sin(u * TAU * 6)] }));
    }
    motes(p, A, { n: 6 + stage * 6, color, size: 0.016, spread: 0.45, low: 0.85, height: 0.3, rise: 0.03, twinkle: 0.4 });
  },
  fd_dazzling: (p, A) => {
    // Dazzling light: a hot white-yellow core throwing flickering rays.
    const g = A.node('core', [0, 0.9, 0]);
    blob(p, 'core', [0.1, 0.1, 0.1], [0, 0, 0], flat(0xfff8d0), { parent: g, glow: true }, 4, 8);
    A.track(g, 0, (u) => ({ s: 1 + 0.2 * Math.sin(u * TAU * 4) }));
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU, e = (k % 2 ? 0.3 : -0.2), d = V(Math.cos(a), e, Math.sin(a)).normalize();
      const ray = A.node('ray', [0, 0.9, 0]);
      tube(p, 'ray', V(0, 0, 0).addScaledVector(d, 0.12), V(0, 0, 0).addScaledVector(d, 0.45), 0.012, 0.004, 4, flat(k % 2 ? 0xffe070 : 0xff9070), { parent: ray, glow: true });
      A.track(ray, k / 8, (u) => ({ s: blink(u, 4, 0.5) ? 1 : 0.3 }));
    }
  },
  fd_biolum: (p, A, stage) => {
    // Bioluminescence: glowing flecks on the floor and in the air (cyan → blue).
    const color = [0x40e0e8, 0x50d0f0, 0x4080ff][stage];
    decal(p, 'glow flecks', 'light', grime(p.id, [color, mix(color, 0xffffff, 0.4)], 0.04 + stage * 0.05, 4 + stage * 4), { glow: true });
    motes(p, A, { n: 6 + stage * 8, color: [color, mix(color, 0xffffff, 0.5)], size: 0.02 + stage * 0.006, spread: 0.42, low: 0.05, height: 0.4 + stage * 0.4, rise: 0.15, twinkle: 0.6 });
  },
  fd_spotlight: (p) => {
    // A spotlight's pool of light on the floor.
    decal(p, 'light pool', 'light', (ctx, X, Y, W, H) => {
      const r = rng(p.id);
      // Bright in the middle, thinning to a dither at the edge of the beam.
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
        const d = Math.hypot((i + 0.5) / W - 0.5, (j + 0.5) / H - 0.5) / 0.44;
        if (d < 1 && r() < (d < 0.6 ? 0.9 : 0.9 * (1 - d) / 0.4)) fill(ctx, X + i, Y + j, 1, 1, d < 0.35 ? 0xd8c890 : d < 0.7 ? 0xc0a860 : 0xa08848);
      }
    }, { glow: true });
  },
  fd_twisting_mass_dust: (p, A) => motes(p, A, { n: 22, color: [0xff40ff, 0xd040e0, 0xffa0ff], size: 0.02, spread: 0.42, low: 0.1, height: 1.3, rise: 0.15, twinkle: 0.4 }),

  // Gas, smoke, mist ----------------------------------------------------------------------------
  fd_smoke: smokeLike(0x808080, 0),
  fd_cigsmoke: smokeLike(0xb8a888, 0.25),
  fd_weedsmoke: smokeLike(0x98b088, 0.3),
  fd_cracksmoke: smokeLike(0xd8d0c8, 0.3),
  fd_methsmoke: smokeLike(0xb8c8e0, 0.35),
  fd_toxic_gas: toxic([0xc8d0a8, 0x9ad050, 0x68b030], { swirl: 0.05 }),
  fd_tear_gas: toxic([0xd8dcc0, 0xc8e090, 0xa8c860], { swirl: 0.05 }),
  fd_nuke_gas: toxic([0xc8d0b0, 0x98e060, 0x60c840], { glow: false, swirl: 0.04, extra: (p, A) => motes(p, A, { n: 6, color: 0xb0ff60, size: 0.014, spread: 0.4, low: 0.1, height: 1.2, rise: 0.1, twinkle: 0.3 }) }),
  fd_relax_gas: toxic([0xd8d0d4, 0xe8b0c8, 0x98d8e0]),
  fd_fungal_haze: toxic([0xc8ccc4, 0x90d0d8, 0x60b8c8], { extra: (p, A) => motes(p, A, { n: 10, color: 0xd8e8e0, size: 0.014, spread: 0.4, low: 0.1, height: 1.2, rise: 0.1, glow: false }) }),
  fd_hallucinogenic_spores: toxic([0xd0c8e0, 0xa8e070, 0x70c040], { swirl: 0.1, extra: (p, A) => motes(p, A, { n: 10, color: [0xff80ff, 0x80ffff, 0xffff80], size: 0.016, spread: 0.4, low: 0.1, height: 1.3, rise: 0.15, twinkle: 0.5 }) }),
  fd_fungicidal_gas: toxic([0xd0d0cc, 0xb0b4b0, 0x7a7e7a]),
  fd_insecticidal_gas: toxic([0xd4d0c4, 0xb4b0a0, 0x80786a]),
  fd_pollen_triffid: (p, A, stage) => gasField(p, A, stage, tonesOf([0xd8d8b8, 0xc8d870][stage]), { extra: (p, A) => motes(p, A, { n: 10 + stage * 8, color: [0xf0e060, 0xd8e040], size: 0.016, spread: 0.42, low: 0.1, height: 1.3, rise: 0.12, glow: false }) }),
  fd_swamp_gas: (p, A) => { blanket(p, 0x8a9468, 0.25); puffs(p, A, { tones: tonesOf(0x8a9468), n: 7, height: 0.9, size: 0.32, rise: 0.5 }); },
  fd_fog: (p, A, stage) => {
    // Mist → fog → dense fog: white, wide and low, drifting sideways.
    if (stage) blanket(p, 0xe0e4e4, [0.3, 0.3, 0.8][stage], { w: 1 });
    puffs(p, A, { tones: [0xe8ecec, 0xd8dcdc], n: [5, 9, 14][stage], height: [0.8, 1.3, 1.7][stage], size: [0.36, 0.44, 0.5][stage], spread: 0.32, drift: 0.14, rise: 0.15 });
  },
  fd_labyrinth_fog: (p, A) => { blanket(p, 0xf0f0f0, 0.35, { w: 1 }); puffs(p, A, { tones: [0xf4f4f4, 0xe4e4e8], n: 10, height: 1.5, size: 0.42, spread: 0.32, swirl: 0.14, rise: 0.1 }); },
  fd_labyrinth_fog_perm: (p, A) => { blanket(p, 0xeceef2, 0.45, { w: 1 }); puffs(p, A, { tones: [0xeef0f4, 0xdcdfe6], n: 12, height: 1.7, size: 0.44, spread: 0.32, swirl: 0.16, rise: 0.08 }); },
  fd_extinguisher: (p, A, stage) => {
    // Extinguisher mist: white clouds with powder settling out of them.
    gasField(p, A, stage, [0xf4f4f4, 0xe4e4e4, 0xffffff]);
    decal(p, 'powder', 'dust', grime(p.id, [0xf0f0f0, 0xe0e0dc], 0.1 + stage * 0.12, 6));
    motes(p, A, { n: 6 + stage * 5, color: 0xffffff, size: 0.014, spread: 0.4, low: 0.3, height: 1, rise: 0.4, glow: false, fall: true });
  },
  fd_hot_air_sauna: (p, A) => { blanket(p, 0xdfe6ea, 0.3); puffs(p, A, { tones: [0xe4ecf0, 0xd4dde4], n: 14, height: 1.7, size: 0.32, spread: 0.34, swirl: 0.08, rise: 0.5, holes: 0.2 }); },
  fd_black_incense: (p, A) => { blanket(p, 0x3a3a3c, 0.4); puffs(p, A, { tones: [0x2e2e30, 0x48484a], n: 12, height: 1.6, size: 0.4, swirl: 0.12 }); },
  fd_incense: incense(0xe0d070),
  fd_blue_incense: incense(0x6a8ae0),
  fd_green_incense: incense(0x6ab860),
  fd_red_incense: incense(0xd05a50),
  fd_yellow_incense: incense(0xe8d040),
  fd_purple_incense: incense(0xa060c8),
  fd_tindalos_gas: (p, A, stage) => gasField(p, A, stage, tonesOf([0xb8c0c4, 0x70c8d0, 0xd890c0][stage]), { glow: stage > 0, swirl: 0.08 }),
  fd_nm_monster_gas_1: (p, A) => { puffs(p, A, { tones: [0x9ae878, 0xc8f0a0], n: 9, height: 1.4, size: 0.32, glow: true, swirl: 0.06 }); motes(p, A, { n: 14, color: [0xd8ff90, 0xa0f070], size: 0.02, spread: 0.4, low: 0.1, height: 1.3, rise: 0.12, twinkle: 0.5 }); },
  fd_nm_monster_gas_2: (p, A) => puffs(p, A, { tones: [0x88e0c8, 0xb0f0e0], n: 10, height: 1.4, size: 0.34, glow: true, swirl: 0.06 }),
  fd_scarlet_sea_wave: (p, A, stage) => {
    // Breaking ripple → wave → redcap: red crests rolling across the tile (along x).
    const n = [2, 3, 4][stage], h = [0.06, 0.16, 0.3][stage];
    for (let k = 0; k < n; k++) {
      const g = A.node('crest', [-0.3, 0, 0]);
      // A wedge: a long gentle back rising to a steep face, as wide as the tile.
      hull(p, 'crest', [V(-0.2, 0, -0.42), V(-0.2, 0, 0.42), V(0.06, 0, -0.42), V(0.06, 0, 0.42), V(0.02, h, -0.38), V(0.02, h, 0.38), V(0.06, h * 0.8, -0.4), V(0.06, h * 0.8, 0.4)], speckle(`crest${k}`, 0xd8483a, [0xf07060, 0xb83028], 0.4), { parent: g, haze: true, glow: true });
      if (stage === 2) hull(p, 'redcap', [V(-0.02, h, -0.36), V(-0.02, h, 0.36), V(0.08, h, -0.36), V(0.08, h, 0.36), V(0.04, h + 0.06, -0.3), V(0.04, h + 0.06, 0.3)], speckle(`cap${k}`, 0xffd0c8, [0xffffff], 0.4), { parent: g, haze: true, glow: true });
      A.track(g, k / n, (u) => ({ p: [0.7 * u, 0, 0], s: [1, env(u, 0.3, 0.7), 1] }));
    }
  },

  // Portals, rifts, anomalies ------------------------------------------------------------------
  fd_fatigue: (p, A, stage) => {
    // Odd ripple → swirling air → tear in reality.
    if (stage < 2) {
      for (let k = 0; k < (stage ? 10 : 5); k++) {
        const g = A.node('ripple', [0, 0.5 + A.r() * 0.8, 0]), R = 0.15 + A.r() * 0.25, a0 = A.r() * TAU;
        p.box('ripple', [-0.05, -0.05, -0.05, 0.05, 0.05, 0.05], flat(stage ? 0x707074 : 0xb8b8bc), { parent: g, haze: true, ppm: 16 });
        A.track(g, 0, (u) => ({ p: [Math.cos(a0 + u * TAU * (stage ? 1 : 0.5)) * R, 0.05 * Math.sin(u * TAU * 2), Math.sin(a0 + u * TAU * (stage ? 1 : 0.5)) * R], s: 0.8 + 0.3 * Math.sin(u * TAU * 3) }));
      }
      return;
    }
    const g = A.node('tear', [0, 0.95, 0]);
    hull(p, 'tear', [V(0, -0.75, 0), V(0.07, -0.25, 0.01), V(-0.05, 0.2, 0.01), V(0.04, 0.75, 0), V(-0.02, 0.1, -0.01), V(0.02, -0.3, -0.01)], flat(0x140814), { parent: g });
    hull(p, 'tear glow', [V(0, -0.82, 0), V(0.12, -0.25, 0), V(-0.09, 0.2, 0), V(0.06, 0.82, 0), V(-0.03, 0.1, 0.005), V(0.03, -0.3, -0.005)], flat(0xe040e8), { parent: g, haze: true, glow: true });
    A.track(g, 0, (u) => ({ s: [1 + 0.25 * Math.sin(u * TAU * 2), 1, 1] }));
    motes(p, A, { n: 12, color: [0xff60ff, 0xffffff], size: 0.02, spread: 0.3, low: 0.2, height: 1.4, rise: 0.1, twinkle: 0.5 });
  },
  fd_tindalos_rift: (p, A, stage) => {
    // Angular ripple → angular rift → fractal fissure: sharp-cornered shards that will not keep still.
    const color = [0xc0c0c4, 0x58585c, 0xd040d8][stage], n = [5, 9, 14][stage];
    for (let k = 0; k < n; k++) {
      const g = A.node('angle', [(A.r() - 0.5) * 0.7, 0.2 + A.r() * 1.3, (A.r() - 0.5) * 0.7]), s = 0.05 + A.r() * 0.08 + stage * 0.02;
      hull(p, 'angle', [V(0, 0, 0), V(s, 0, 0), V(0, s * 1.6, 0), V(s * 0.3, s * 0.4, s * 0.5)], flat(color), { parent: g, haze: stage < 2, glow: stage === 2 });
      const k2 = 3 + Math.floor(A.r() * 4), a = 0.04 + stage * 0.02;
      A.track(g, A.r(), (u) => ({ p: [Math.sin(u * TAU * k2) * a, Math.sin(u * TAU * (k2 + 2)) * a * 0.6, Math.cos(u * TAU * (k2 + 1)) * a], ry: Math.round(u * 4) * (Math.PI / 2), s: blink(u, k2, 0.8) ? 1 : 0.4 }));
    }
    if (stage === 2) arc(p, A, [0, 0.1, 0], [0.05, 1.6, -0.05], { color: 0xf080ff, segs: 8, jag: 0.14, k: 2, duty: 0.6, r: 0.012 });
  },
  fd_meadow_portal: (p, A) => {
    // A swirling portal: a standing ring of magenta light turning round a dark centre.
    const g = A.node('portal', [0, 1.0, 0]);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * TAU, R = 0.42;
      p.box('ring', [Math.cos(a) * R - 0.045, Math.sin(a) * R * 1.6 - 0.045, -0.03, Math.cos(a) * R + 0.045, Math.sin(a) * R * 1.6 + 0.045, 0.03], flat(k % 2 ? 0xe050e8 : 0xff90ff), { parent: g, glow: true });
    }
    A.track(g, 0, (u) => ({ rz: u * TAU * 0.25, s: [1 + 0.05 * Math.sin(u * TAU * 2), 1, 1] }));
    const core = A.node('portal core', [0, 1.0, 0]);
    blob(p, 'vortex', [0.32, 0.6, 0.02], [0, 0, 0], flat(0x5a1a6a), { parent: core, haze: true, glow: true }, 4, 10);
    A.track(core, 0, (u) => ({ s: 1 + 0.08 * Math.sin(u * TAU * 3) }));
    motes(p, A, { n: 12, color: [0xff80ff, 0xffffff], size: 0.02, spread: 0.35, low: 0.3, height: 1.4, rise: 0.15, twinkle: 0.5 });
  },
  fd_portal_cracked_mirror: (p, A) => {
    // A cracked mirror hanging in the air, its edges glowing magenta.
    const g = A.node('mirror', [0, 1.0, 0]);
    const glassP = layers(flat(0x9ab0c0), (ctx, x, y, w, h) => {
      const r = rng('mirror');
      for (let k = 0; k < 6; k++) { let cx = x + w / 2, cy = y + h / 2; const a = r() * TAU; for (let s = 0; s < w; s++) { cx += Math.cos(a) + (r() - 0.5); cy += Math.sin(a) + (r() - 0.5); if (cx < x || cx >= x + w || cy < y || cy >= y + h) break; fill(ctx, Math.floor(cx), Math.floor(cy), 1, 1, 0xf0f8ff); } }
    });
    pane(p, 'mirror', [V(-0.3, -0.55, 0), V(0.3, -0.55, 0), V(0.3, 0.55, 0), V(-0.3, 0.55, 0)], 0.02, glassP, { parent: g, metal: true, ppm: 96 });
    for (const [x0, y0, x1, y1] of [[-0.33, -0.58, 0.33, -0.55], [-0.33, 0.55, 0.33, 0.58], [-0.33, -0.58, -0.3, 0.58], [0.3, -0.58, 0.33, 0.58]]) p.box('edge', [x0, y0, -0.015, x1, y1, 0.015], flat(0xe050e8), { parent: g, glow: true });
    A.track(g, 0, (u) => ({ p: [0, 0.04 * Math.sin(u * TAU), 0], ry: 0.15 * Math.sin(u * TAU) }));
    for (let k = 0; k < 5; k++) {
      const s = A.node('shard', [(A.r() - 0.5) * 0.7, 0.5 + A.r() * 1.0, (A.r() - 0.5) * 0.3]), z = 0.04 + A.r() * 0.05;
      hull(p, 'shard', [V(0, 0, 0), V(z, 0, 0), V(0, z * 1.5, 0), V(z * 0.3, z * 0.4, 0.008)], flat(0xc0d4e0), { parent: s, metal: true });
      A.track(s, A.r(), (u) => ({ p: [0, 0.05 * Math.sin(u * TAU), 0], ry: u * TAU }));
    }
  },
  fd_LIXA_decompression: (p, A) => {
    // Decompressed space: dark, glittering air drawn inward.
    puffs(p, A, { tones: [0x2a1a3a, 0x3a2a4a], n: 10, height: 1.6, size: 0.36, swirl: 0.12, glow: true });
    for (let k = 0; k < 14; k++) {
      const a = A.r() * TAU, R = 0.3 + A.r() * 0.15, y = 0.2 + A.r() * 1.3, g = A.node('drawn', [0, y, 0]);
      p.box('mote', [-0.01, -0.01, -0.01, 0.01, 0.01, 0.01], flat(0xf0e8ff), { parent: g, glow: true });
      A.track(g, A.r(), (u) => ({ p: [Math.cos(a + u * 3) * R * (1 - u), 0, Math.sin(a + u * 3) * R * (1 - u)], s: env(u, 0.1, 0.85) }));
    }
  },

  // Bees and markers --------------------------------------------------------------------------
  fd_bee_swarm: (p, A, stage) => {
    // A few bees → a swarm → a cloud: bees circling, each on its own loop.
    // Bees are drawn about 2.5 times their size, to be seen at the default view distance.
    const n = [5, 14, 28][stage], H = [0.6, 1.0, 1.4][stage];
    const body = layers(flat(0xe0b020), (ctx, x, y, w, h) => { for (let i = 1; i < w; i += 3) fill(ctx, x + i, y, 1, h, 0x2a2010); });
    for (let k = 0; k < n; k++) {
      const g = A.node('bee', [(A.r() - 0.5) * 0.2, 0.25 + A.r() * H, (A.r() - 0.5) * 0.2]), R = 0.12 + A.r() * 0.3, a0 = A.r() * TAU, dir = A.r() < 0.5 ? 1 : -1, laps = 1 + Math.floor(A.r() * 2), bob = 0.04 + A.r() * 0.06;
      p.box('bee body', [-0.035, -0.02, -0.02, 0.035, 0.02, 0.02], body, { parent: g, ppm: 300 });
      p.box('bee head', [0.035, -0.014, -0.014, 0.052, 0.014, 0.014], flat(0x2a2010), { parent: g, ppm: 300 });
      for (const z of [-0.03, 0.03]) p.box('bee wing', [-0.018, 0.02, z - 0.016, 0.016, 0.026, z + 0.016], flat(0xdfeef4), { parent: g, ppm: 300 });
      A.track(g, 0, (u) => { const a = a0 + dir * u * TAU * laps; return { p: [Math.cos(a) * R, Math.sin(u * TAU * 3 + a0) * bob, Math.sin(a) * R], ry: -dir * a - (dir > 0 ? Math.PI / 2 : -Math.PI / 2) }; });
    }
  },
  fd_direction: (p, A) => {
    // "Detected something": a faint ring spreading over the floor, like a sound heard.
    for (let k = 0; k < 2; k++) {
      const g = A.node('ring', [0, SLOT.mark * SLOT_Y, 0]);
      for (let s = 0; s < 12; s++) { const a = (s / 12) * TAU; p.box('ring', [Math.cos(a) * 0.2 - 0.03, 0, Math.sin(a) * 0.2 - 0.03, Math.cos(a) * 0.2 + 0.03, 0.004, Math.sin(a) * 0.2 + 0.03], flat(0xd8d8d0), { parent: g, haze: true, glow: true, ppm: 32 }); }
      A.track(g, k / 2, (u) => ({ s: [0.3 + u * 2, 1, 0.3 + u * 2] }));
    }
  },
  fd_push_items: (p, A) => {
    // A force that shoves things off the tile: a low swirl of air.
    for (let k = 0; k < 6; k++) {
      const g = A.node('gust', [0, 0.08 + A.r() * 0.25, 0]), a0 = (k / 6) * TAU;
      p.box('gust', [-0.06, -0.015, -0.015, 0.06, 0.015, 0.015], flat(0xd8e0e4), { parent: g, haze: true, ppm: 32 });
      A.track(g, 0, (u) => { const a = a0 + u * TAU, R = 0.15 + u * 0.3; return { p: [Math.cos(a) * R, 0, Math.sin(a) * R], ry: -a, s: env(u, 0.1, 0.7) }; });
    }
  },
  fd_construction_site: (p) => {
    // A planned construction: corner stakes with orange flagging tape and a chalk outline.
    decal(p, 'chalk line', 'mark', (ctx, X, Y, W, H) => { const b = Math.round(W * 0.1); for (const [x, y, w, h] of [[b, b, W - 2 * b, 1], [b, H - b, W - 2 * b, 1], [b, b, 1, H - 2 * b], [W - b, b, 1, H - 2 * b + 1]]) for (let i = 0; i < Math.max(w, h); i += 2) fill(ctx, X + x + (w > 1 ? i : 0), Y + y + (h > 1 ? i : 0), 1, 1, 0xf0f0e8); });
    const wood = speckle('stake', 0xb08a5a, [0xc8a070, 0x8a6a40], 0.3);
    for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [0.4, 0.4], [-0.4, 0.4]]) {
      p.box('stake', [x - 0.015, 0, z - 0.015, x + 0.015, 0.3, z + 0.015], wood);
      p.box('flag tape', [x - 0.018, 0.24, z - 0.018, x + 0.018, 0.27, z + 0.018], flat(0xff6a1a));
      p.box('tape tail', [x + 0.018, 0.2, z - 0.004, x + 0.03, 0.27, z + 0.004], flat(0xff7a2a));
    }
  },
};

/** Webs strung across the tile: cobwebs in a corner → webs → thick webs (stage 0–2). */
function webs(p, stage, strand, { thick = false, thin = false, stars = null } = {}) {
  const paint = (k) => faces2(webPaint(`${p.id}${k}`, strand, { spokes: thin ? 6 : 9, rings: thin ? 3 : thick ? 9 : 6, thick, stars }));
  const sheets = [
    [V(-0.5, 0.3, -0.5), V(0.5, 0.3, 0.5), V(0.5, 1.8, 0.5), V(-0.5, 1.8, -0.5)],
    [V(0.5, 0.3, -0.5), V(-0.5, 0.3, 0.5), V(-0.5, 1.8, 0.5), V(0.5, 1.8, -0.5)],
    [V(-0.5, 0.05, -0.2), V(0.5, 0.05, -0.2), V(0.5, 1.2, 0.1), V(-0.5, 1.2, 0.1)],
  ];
  if (stage === 0) {
    // Cobwebs: a corner web up high and one low.
    pane(p, 'cobweb', [V(-0.5, 1.2, -0.1), V(-0.1, 1.2, -0.5), V(-0.1, 1.8, -0.5), V(-0.5, 1.8, -0.1)], 0.002, paint(0), { cutout: true, ppm: 128 });
    pane(p, 'cobweb low', [V(0.5, 0.0, 0.15), V(0.15, 0.0, 0.5), V(0.15, 0.4, 0.5), V(0.5, 0.4, 0.15)], 0.002, paint(1), { cutout: true, ppm: 128 });
    return;
  }
  for (let k = 0; k < (stage === 1 ? 2 : 3); k++) pane(p, `web ${k}`, sheets[k], 0.002, paint(k), { cutout: true, ppm: thin ? 64 : 80 });
}

/** One bloody footprint pair heading `dir` (0 north / −z, 1 east, 2 south, 3 west). */
function footprints(p, dir) {
  decal(p, 'footprints', 'print', (ctx, X, Y, W, H) => {
    const r = rng(p.id);
    const put = (fx, fy, hex) => {
      // (fx, fy): across, ahead (fractions, 0 = centre); turned to the heading. Image up is north.
      const [a, b] = [[fx, -fy], [fy, fx], [-fx, fy], [-fy, -fx]][dir];
      const i = Math.floor((0.5 + a) * W), j = Math.floor((0.5 + b) * H);
      if (i >= 0 && i < W && j >= 0 && j < H) fill(ctx, X + i, Y + j, 1, 1, hex);
    };
    for (const [side, ahead] of [[-0.09, -0.18], [0.09, 0.14]]) {
      for (let v = -0.13; v <= 0.13; v += 1 / H) for (let u = -0.05; u <= 0.05; u += 1 / W) {
        const sole = v > -0.03 && (u / 0.045) ** 2 + ((v - 0.05) / 0.09) ** 2 < 1, heel = v <= -0.05 && (u / 0.038) ** 2 + ((v + 0.09) / 0.04) ** 2 < 1;
        if ((sole || heel) && r() < 0.93) put(side + u, ahead + v, r() < 0.3 ? 0x5a0a0a : 0x7a1010);
      }
    }
  });
}

/** Sparks → electric crackle → electric cloud. */
function electric(p, A, stage) {
  const lit = true;
  const color = [0xd8f0ff, 0x80e8ff, 0x6a9aff][stage];
  motes(p, A, { n: 6 + stage * 4, color, size: 0.022, spread: 0.35, low: 0.05, height: 0.8 + stage * 0.4, rise: 0.05, twinkle: 0.35, glow: lit });
  for (let k = 0; k < stage * 3; k++) arc(p, A, [(A.r() - 0.5) * 0.7, 0.02, (A.r() - 0.5) * 0.7], [(A.r() - 0.5) * 0.7, 0.5 + A.r() * 1.0, (A.r() - 0.5) * 0.7], { color: mix(color, 0xffffff, 0.5), segs: 6, jag: 0.09, k: 2 + k, glow: lit });
  if (stage === 2) puffs(p, A, { tones: [0x4a6ad8, 0x6a8af0], n: 7, height: 1.5, size: 0.36, glow: lit, swirl: 0.06 });
}

/** Layer of a field's model, for engines (see the header). */
function layerOf(id, phase) {
  if (/footprint|^fd_(blood|bile|acid|slime|sap|sludge|dirty_water|mechanical_fluid|dust|spores|spotlight)/.test(id) && !/vent/.test(id)) return 'ground';
  if (/gibs|rubble|churned|splinters|construction|vent/.test(id)) return 'debris';
  if (/web/.test(id)) return 'hang';
  if (/fire|flame|electric|plasma|laser|dazzling|biolum|congealed|twisting|portal|mirror|rift|fatigue|LIXA|incendiary/.test(id)) return 'glow';
  return phase === 'liquid' ? 'ground' : 'air';
}

/** Every visible field, one recipe per look stage: fd_x (stage 1), fd_x__2, fd_x__3. */
export const FIELDS = Object.entries(STAGES).flatMap(([id, st]) => {
  const make = FIELD[id];
  if (!make) throw new Error(`no Cubeclysm field model for ${id}`);
  return st.names.map((name, stage) => ({
    id: stage ? `${id}__${stage + 1}` : id,
    desc: `${id} (${st.zh}): ${name}`,
    names: { zh_CN: st.names.length > 1 ? `${st.zh} · ${stage + 1}` : st.zh, en: name },
    field: { of: id, stage: stage + 1, stages: st.names.length, map: st.map, layer: layerOf(id, st.phase) },
    ppm: 64,
    build: (p) => { const A = anim(p); make(p, A, stage, st); A.done(); },
    source: 'tools/cubeclysm/page/fields.js',
  }));
});
