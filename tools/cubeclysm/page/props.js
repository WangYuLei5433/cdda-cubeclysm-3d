// Cubeclysm props: terrain and furniture built from painted blocks (atlas.js), the same way the
// creatures are. One tile = 1 m; a z-level (wall, door, window) is LEVEL high, as in the studio's
// reference wall; walls, doors and windows are WALL_T thick (Cataclysm-Vox's wall thickness).
// Ground and roof tiles are slabs whose top face is the tile; walls are full blocks whose faces are
// the wall surface (engines that draw their own wall geometry take the texture).
import * as THREE from 'three';

import { block } from './atlas.js';
import { css, fill, mix, rng, shade } from './paint.js';

export const LEVEL = 2.0;
export const WALL_T = 0.2;
export const SLAB = 0.05;

const B = (x0, y0, z0, x1, y1, z1) => new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));

// --- painters: (ctx, x, y, w, h, side) on one face of a block --------------------------------

/** Flat colour. */
export const flat = (hex) => (ctx, x, y, w, h) => fill(ctx, x, y, w, h, hex);

/** Pixel noise over a base colour: each pixel picks one of the `tones`. */
export const speckle = (seed, base, tones, density = 0.35) => (ctx, x, y, w, h, side) => {
  fill(ctx, x, y, w, h, base);
  const r = rng(`${seed}:${side}`);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (r() > density) continue;
    ctx.fillStyle = css(tones[Math.floor(r() * tones.length)]);
    ctx.fillRect(x + i, y + j, 1, 1);
  }
};

/** Compose painters: each draws over the previous. */
export const layers = (...ps) => (ctx, x, y, w, h, side) => { for (const p of ps) p?.(ctx, x, y, w, h, side); };

/** Only on some sides (others get `other`). */
export const sides = (which, p, other) => (ctx, x, y, w, h, side) => (which.includes(side) ? p : other)?.(ctx, x, y, w, h, side);

/** Cracks: short jagged dark lines. */
export const cracks = (seed, hex, n) => (ctx, x, y, w, h, side) => {
  const r = rng(`${seed}:cracks:${side}`);
  ctx.fillStyle = css(hex);
  for (let k = 0; k < n; k++) {
    let cx = x + r() * w, cy = y + r() * h;
    const len = 3 + Math.floor(r() * Math.max(4, w * 0.35));
    for (let s = 0; s < len; s++) {
      ctx.fillRect(Math.floor(cx), Math.floor(cy), 1, 1);
      cx += r() < 0.5 ? 1 : (r() < 0.5 ? 0 : -1);
      cy += r() < 0.6 ? 1 : 0;
      if (cx < x || cx >= x + w || cy >= y + h) break;
    }
  }
};

/** Horizontal courses of bricks or blocks with mortar lines, offset every other row. */
export const masonry = (seed, { brick, mortar, rows, cols, tones = [] }) => (ctx, x, y, w, h, side) => {
  fill(ctx, x, y, w, h, mortar);
  const r = rng(`${seed}:mas:${side}`);
  const rh = h / rows, cw = w / cols;
  for (let j = 0; j < rows; j++) {
    const off = j % 2 ? cw / 2 : 0;
    for (let i = -1; i <= cols; i++) {
      const bx = Math.round(x + i * cw + off), by = Math.round(y + j * rh);
      const x0 = Math.max(x, bx + 1), x1 = Math.min(x + w, Math.round(bx + cw));
      if (x1 <= x0) continue;
      const tone = tones.length && r() < 0.5 ? tones[Math.floor(r() * tones.length)] : brick;
      fill(ctx, x0, by + 1, x1 - x0, Math.max(1, Math.round(rh) - 1), tone);
    }
  }
};

/** Planks: vertical (or horizontal) boards with dark seams and a few knots. */
export const planks = (seed, { wood, seam, n, vertical = true, tones = [] }) => (ctx, x, y, w, h, side) => {
  const r = rng(`${seed}:planks:${side}`);
  const along = vertical ? w : h;
  const step = along / n;
  for (let i = 0; i < n; i++) {
    const tone = tones.length ? tones[Math.floor(r() * tones.length)] : wood;
    const a = Math.round(i * step), b = Math.round((i + 1) * step);
    if (vertical) fill(ctx, x + a, y, b - a, h, tone); else fill(ctx, x, y + a, w, b - a, tone);
    if (vertical) fill(ctx, x + a, y, 1, h, seam); else fill(ctx, x, y + a, w, 1, seam);
    // Grain and knots.
    for (let k = 0; k < 3; k++) {
      const gx = vertical ? x + a + 1 + Math.floor(r() * Math.max(1, b - a - 2)) : x + Math.floor(r() * w);
      const gy = vertical ? y + Math.floor(r() * h) : y + a + 1 + Math.floor(r() * Math.max(1, b - a - 2));
      fill(ctx, gx, gy, vertical ? 1 : 3, vertical ? 3 : 1, shade(tone, 0.85));
    }
  }
};

/** A grid of panel seams (concrete forms, tiles). */
export const grid = (hex, cols, rows) => (ctx, x, y, w, h) => {
  for (let i = 1; i < cols; i++) fill(ctx, x + Math.round((i * w) / cols), y, 1, h, hex);
  for (let j = 1; j < rows; j++) fill(ctx, x, y + Math.round((j * h) / rows), w, 1, hex);
};

/** A border of `t` pixels. */
export const border = (hex, t = 1) => (ctx, x, y, w, h) => {
  fill(ctx, x, y, w, t, hex); fill(ctx, x, y + h - t, w, t, hex); fill(ctx, x, y, t, h, hex); fill(ctx, x + w - t, y, t, h, hex);
};

/** Glass: a tint with diagonal highlight streaks. */
export const glass = (tint, { frost = false } = {}) => (ctx, x, y, w, h) => {
  fill(ctx, x, y, w, h, tint);
  if (frost) { const r = rng(`frost${w}x${h}`); for (let j = 0; j < h; j += 1) for (let i = 0; i < w; i += 1) if (r() < 0.25) fill(ctx, x + i, y + j, 1, 1, shade(tint, 1.08)); return; }
  ctx.fillStyle = css(mix(tint, 0xffffff, 0.55));
  for (let k = 0; k < 2; k++) {
    const s = Math.max(1, Math.round(Math.min(w, h) * 0.06));
    for (let t = 0; t < Math.min(w, h) * 0.5; t++) ctx.fillRect(x + Math.round(w * (0.18 + k * 0.22)) + t, y + Math.round(h * 0.15) + t, s, 1);
  }
};

/** Chain-link mesh: a diamond lattice of wire, the rest left transparent (cut-out blocks). */
export const chainlink = (wire) => (ctx, x, y, w, h) => {
  ctx.clearRect(x, y, w, h);
  const s = Math.max(4, Math.round(Math.min(w, h) / 10));
  ctx.fillStyle = css(wire);
  for (let j = -h; j < w + h; j += s) for (let t = 0; t < h; t++) {
    const a = j + t, b = j + h - t;
    if (a >= 0 && a < w) ctx.fillRect(x + a, y + t, 1, 1);
    if (b >= 0 && b < w) ctx.fillRect(x + b, y + t, 1, 1);
  }
};

/** Leaves: a canopy colour broken up by lighter and darker leaf clumps. */
export const foliage = (seed, base, light, dark) => layers(
  speckle(seed, base, [light, dark, shade(base, 1.1)], 0.45),
  (ctx, x, y, w, h, side) => {
    const r = rng(`${seed}:clumps:${side}`);
    for (let k = 0; k < Math.max(3, (w * h) / 60); k++) {
      const cx = x + Math.floor(r() * w), cy = y + Math.floor(r() * h), s = 2 + Math.floor(r() * 3);
      fill(ctx, cx, cy, Math.min(s, x + w - cx), Math.min(s - 1, y + h - cy), r() < 0.5 ? light : dark);
    }
  },
);

/** Bark: vertical streaks. */
/** `plates`: true (fissures in the dark tone) or a colour for the fissures. */
export const bark = (seed, base, { dark = shade(base, 0.7), light = shade(base, 1.2), plates = false } = {}) => (ctx, x, y, w, h, side) => {
  fill(ctx, x, y, w, h, base);
  const r = rng(`${seed}:bark:${side}`);
  for (let i = 0; i < w; i += 2) {
    const len = 2 + Math.floor(r() * h * 0.5), at = Math.floor(r() * h);
    fill(ctx, x + i, y + at, 1, Math.min(len, h - at), r() < 0.6 ? dark : light);
  }
  // Plated bark: short, broken horizontal fissures (not full lines, which read as bricks).
  if (plates) for (let j = 2; j < h; j += 4 + Math.floor(r() * 3)) for (let i = 0; i < w;) {
    const len = 2 + Math.floor(r() * 4);
    if (r() < 0.6) fill(ctx, x + i, y + j, Math.min(len, w - i), 1, plates === true ? dark : plates);
    i += len + 1 + Math.floor(r() * 3);
  }
};

// --- builder ------------------------------------------------------------------------------------

/** A prop under construction: blocks hung on groups, baked by build.js. */
export class Prop {
  constructor(id, ppm = 64) {
    this.id = id;
    this.ppm = ppm;
    this.root = new THREE.Group();
    this.root.name = id;
    this.blocks = [];
    this.r = rng(id);
  }

  /** A block on `parent` (default: the root), box in that parent's space. */
  box(name, [x0, y0, z0, x1, y1, z1], paint, opts = {}) {
    const b = block(opts.parent ?? this.root, name, B(x0, y0, z0, x1, y1, z1), paint, { ppm: opts.ppm ?? this.ppm, metal: opts.metal, glow: opts.glow, cutout: opts.cutout, glass: opts.glass });
    this.blocks.push(b);
    return b;
  }

  /** A child group (for hinged or rotated parts). */
  group(name, { at = [0, 0, 0], rotY = 0, rotX = 0, rotZ = 0, parent = this.root } = {}) {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(...at);
    g.rotation.set(rotX, rotY, rotZ);
    parent.add(g);
    return g;
  }
}
