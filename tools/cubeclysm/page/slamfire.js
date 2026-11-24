// The slam-fire pipe shotguns, as items and as the gun in the shotgun traps (traps.js).
//
// CDDA (7136388): slamfire_shotgun "A crude shotgun, composed of two thick steel pipes, an end cap,
// and a nail. The lack of sights make this weapon only useful at point-blank range." 2264 ml,
// longest side 65 cm, barrel 300 mm. slamfire_shotgun_d: "four thick steel pipes, two end caps,
// and two nails", 4530 ml.
//
// How it is built (and drawn): the barrel is a 3/4" pipe (a 12-gauge shell fits its bore) that
// slides inside a 1" pipe, the receiver; an end cap is screwed onto the receiver's back, and a nail
// through the cap points forward as the firing pin. Pull the barrel back sharply onto the nail and
// it fires. 300 mm of barrel stands out of the receiver; the whole gun is 64 cm. Galvanised pipe,
// threaded ends, no stock and no sights. The double is two of them side by side, held together
// with wraps of wire. Muzzle toward −Z.
import { V, cyl, flat, layers, speckle, fill, shade, tube } from './item-kit.js';

const GALV = 0x9aa0a2;
/** Galvanised pipe: a dull grey with zinc spangle and a line of rust here and there. */
const pipe = (hex = GALV) => layers(speckle(`galv${hex}`, hex, [shade(hex, 1.12), shade(hex, 0.88), 0xb4b8b8], 0.4), (ctx, x, y, w, h) => { for (let i = 3; i < w; i += 11) fill(ctx, x + i, y, 1, h, shade(hex, 0.8)); });
/** A threaded pipe end: close dark rings. */
const threads = (hex = GALV) => layers(flat(shade(hex, 0.9)), (ctx, x, y, w, h) => { for (let j = 0; j < h; j += 2) fill(ctx, x, y + j, w, 1, shade(hex, 0.62)); });

const BARREL_R = 0.0134, RECEIVER_R = 0.0167, CAP_R = 0.0205;
/** Along z (muzzle at −z): barrel −0.325…0.12, receiver −0.025…0.27, cap 0.27…0.31, nail head 0.31…0.314. */
const Z = { muzzle: -0.325, barrelEnd: 0.12, receiver: -0.025, cap: 0.27, back: 0.31 };

/** One pipe gun on its axis (y = 0 is the bore line), at x. */
function single(p, parent, x) {
  const o = { parent, metal: true };
  const mid = (a, b) => (a + b) / 2;
  cyl(p, 'barrel', 'z', [x, 0, mid(Z.muzzle, Z.barrelEnd)], BARREL_R, Z.barrelEnd - Z.muzzle, 10, pipe(), o);
  cyl(p, 'barrel thread', 'z', [x, 0, Z.muzzle + 0.012], BARREL_R + 0.0006, 0.024, 10, threads(), o);
  // The bore: a dark disc just in front of the muzzle.
  cyl(p, 'bore', 'z', [x, 0, Z.muzzle - 0.0008], BARREL_R * 0.72, 0.0016, 10, flat(0x141414), { parent });
  cyl(p, 'receiver', 'z', [x, 0, mid(Z.receiver, Z.cap)], RECEIVER_R, Z.cap - Z.receiver, 10, pipe(0x8e9496), o);
  cyl(p, 'receiver thread', 'z', [x, 0, Z.receiver + 0.01], RECEIVER_R + 0.0006, 0.02, 10, threads(0x8e9496), o);
  // The end cap: a heavier, hex-shouldered fitting screwed onto the back.
  cyl(p, 'end cap', 'z', [x, 0, mid(Z.cap, Z.back)], CAP_R, Z.back - Z.cap, 6, pipe(0x7e8486), o);
  cyl(p, 'cap rim', 'z', [x, 0, Z.cap + 0.004], CAP_R + 0.002, 0.008, 6, pipe(0x70767a), o);
  // The nail: its head flat on the cap's back (the shank runs inside, point forward).
  cyl(p, 'nail head', 'z', [x, 0, Z.back + 0.002], 0.006, 0.004, 8, flat(0x5a5a58), o);
}

/** The gun, its bore line at height `y` (lying on the ground: y = the cap's radius). */
export function slamfire(p, { double = false, parent = p.root, at = [0, CAP_R, 0], rotX = 0, rotY = 0 } = {}) {
  const g = p.group(double ? 'double slamfire' : 'slamfire', { at, rotX, rotY, parent });
  const xs = double ? [-CAP_R, CAP_R] : [0];
  for (const x of xs) single(p, g, x);
  if (double) {
    // Wraps of steel wire holding the two guns together: round the receivers and the barrels.
    const wire = flat(0x6a6e70);
    for (const z of [0.0, 0.2, -0.2]) {
      const r = z < Z.receiver ? BARREL_R + 0.0015 : RECEIVER_R + 0.0015, n = 10;
      for (const sx of [-1, 1]) for (let k = 0; k < n; k++) {
        const a0 = (k / n) * Math.PI - Math.PI / 2, a1 = ((k + 1) / n) * Math.PI - Math.PI / 2;
        tube(p, 'wire', V(sx * (CAP_R + Math.cos(a0) * r), Math.sin(a0) * r, z), V(sx * (CAP_R + Math.cos(a1) * r), Math.sin(a1) * r, z), 0.0012, 0.0012, 4, wire, { parent: g });
      }
      for (const y of [-r, r]) tube(p, 'wire', V(-CAP_R, y, z), V(CAP_R, y, z), 0.0012, 0.0012, 4, wire, { parent: g });
    }
  }
  return g;
}

export const SLAMFIRE_ITEMS = [
  { id: 'slamfire_shotgun', desc: 'A crude shotgun, composed of two thick steel pipes, an end cap, and a nail. The lack of sights make this weapon only useful at point-blank range. (65 cm, barrel 300 mm.)', build: (p) => slamfire(p) },
  { id: 'slamfire_shotgun_d', desc: 'A crude shotgun, composed of four thick steel pipes, two end caps, and two nails. The lack of sights make this weapon only useful at point-blank range. (Two of the single gun wired together.)', build: (p) => slamfire(p, { double: true }) },
].map((r) => ({ ...r, dir: 'items', ppm: 512, source: 'tools/cubeclysm/page/slamfire.js' }));
