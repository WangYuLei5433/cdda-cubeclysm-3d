// Small shared parts for the remaining CDDA furniture recipes.
import { flat, glass, grid, layers, masonry, sides } from './props.js';
import { fill } from './paint.js';
import * as K from './item-kit.js';
import { add } from './lowpoly.js';
import { box, cyl, hoop, tray, hollowTube, panel, label, legs, casework } from './furniture-batch.js';

export { flat, glass, grid, layers, masonry, sides, fill, K, box, cyl, hoop, tray, hollowTube, panel, label, legs, casework };
export const wood = K.woodP(0x98714b);
export const darkWood = K.woodP(0x5a3d2b);
export const iron = K.steelP(0x474e51);
export const steel = K.steelP(0xa9b0af);
export const cream = K.plasticP(0xe0e2d7);
export const black = flat(0x252a2e);
export const copper = K.steelP(0xad764f);
export const stone = K.stoneP(0x82877c);
export const glassBlue = glass(0xb6d8dd);

export function lead(p, name, points, r, paint, opts = {}) {
  for (let i = 1; i < points.length; i++) {
    K.tube(p, name + '-' + i, K.V(...points[i - 1]), K.V(...points[i]), r, r * .95, 5, paint, opts);
  }
}

export function tank(p, name, x, z, r, h, color, y = 0) {
  cyl(p, name + '-shell', 'y', [x, y + h * .5, z], r, h, color, r * .97, 10);
  for (const level of [.16, .84]) cyl(p, name + '-band-' + level, 'y', [x, y + h * level, z], r + .008, .026, iron, undefined, 10);
  cyl(p, name + '-cap', 'y', [x, y + h + .021, z], r * .29, .046, steel, undefined, 8);
}

export function vents(p, name, w, h, x, y, z) {
  box(p, name, [w, h, .019], layers(iron, sides(['front'], grid(0x242d2f, 1, 9))), [x, y, z]);
}

export function cabinet(p, [w, h, d], paint, levels = []) {
  casework(p, w, h, d, paint, [0, ...levels, h - .035]);
}

export function display(p, name, w, h, x, y, z, color = 0x688e80) {
  box(p, name, [w, h, .021], layers(flat(color), grid(0x3f5757, 6, 4)), [x, y, z]);
}

export function bearingWheel(p, name, [x, y, z], r, paint, phase = 0) {
  hollowTube(p, name + '-rim', 'z', [x, y, z], r, r * .88, .049, paint, 12);
  cyl(p, name + '-hub', 'z', [x, y, z], r * .17, .085, iron, undefined, 8);
  for (let i = 0; i < 6; i++) {
    const a = phase + i * Math.PI / 3;
    lead(p, name + '-spoke', [[x, y, z], [x + Math.cos(a) * (r - .02), y + Math.sin(a) * (r - .02), z]], .018, paint);
  }
}

// A front sheet with a real circular opening, wound toward −Z.
export function borePanel(p, name, [x0, y0, x1, y1], [cx, cy, z], radius, paint, opts = {}) {
  const turns = Math.PI * 2;
  const angles = Array.from({ length: 16 }, (_, i) => i * turns / 16);
  for (const x of [x0, x1]) for (const y of [y0, y1]) angles.push((Math.atan2(y - cy, x - cx) + turns) % turns);
  angles.sort((a, b) => a - b);
  const pt = (a, outer) => {
    const dx = Math.cos(a), dy = Math.sin(a);
    const distance = outer
      ? Math.min(((dx < 0 ? x0 : x1) - cx) / dx, ((dy < 0 ? y0 : y1) - cy) / dy)
      : radius;
    return K.V(cx + dx * distance, cy + dy * distance, z);
  };
  add(p, name, angles.map((a, i) => {
    const b = angles[(i + 1) % angles.length];
    return { side: 'front', p: [pt(a, true), pt(a, false), pt(b, false), pt(b, true)], wm: .07, hm: .07 };
  }), paint, opts);
}

export function recipe(id, build, extra = {}) {
  return { id: 'f_' + id, dir: 'furniture', ppm: 48, ...extra, build: (p) => build(p, id) };
}

export const family = (build, names, opts) => names.trim().split(/\s+/).map((id) => recipe(id, build, opts));
