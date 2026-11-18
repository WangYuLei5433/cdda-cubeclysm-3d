// Cubeclysm vehicle interiors and carts, low-poly.
// Whole road vehicles are tools/cubeclysm/page/road-vehicles.js. Their cabins are open; the CDDA
// cabin parts in this file (seats, controls, dashboard, seatbelts, trunk floor…) are placed inside
// them by the vehicle's part layout (vehicle-variants.js: `interior`). Ids are the studio's
// `vp_<id>`; each part is modelled at real size round its CDDA tile (origin = tile centre on the
// ground, front −Z, half tile H = .275 m; the floor at FLOOR, which engines lift to the shell's floor).
// The two carts the census sees most (shopping cart, rolling trash can) are whole models here,
// bound by vehicle id, put together from their parts (pipe frame, casters, basket or bin).
import { flat, layers, speckle } from './props.js';
import { fill, shade } from './paint.js';
import { V, bevel, cyl, hull, pane } from './lowpoly.js';

// --- dimensions (real metres) -------------------------------------------------------------------

export const TILE = .55;
const H = TILE / 2;
export const FLOOR = .3;

// --- materials ----------------------------------------------------------------------------------

const PRIMER = 0x45474b, RUBBER = 0x1e1e20, CHROME = 0xc8ccd0, TRIM = 0x26272a;
const steel = (hex) => speckle(`steel${hex}`, hex, [shade(hex, 1.06), shade(hex, .92)], .3);
const fabric = (hex) => speckle(`fab${hex}`, hex, [shade(hex, 1.1), shade(hex, .88)], .5);
const METAL = { metal: true };

// --- helpers ------------------------------------------------------------------------------------

/** A flat slab over the tile, top at y1, chamfered underneath to y0 by `inset`. */
const topSlab = (p, n, y0, y1, inset, paint, opts) => {
  const ring = (e, y) => [[-H + e, -H + e], [H - e, -H + e], [H - e, H - e], [-H + e, H - e]].map(([x, z]) => V(x, y, z));
  hull(p, n, [...ring(0, y1), ...ring(inset, y0)], paint, opts);
};
/** A car seat: rails, cushion, backrest leaning back by `lean`, optional headrest; `w` half width. */
const seat = (p, { w = .24, lean = .2, color = 0x3a3c42, head = true, bench = false } = {}) => {
  const f = fabric(color);
  bevel(p, 'rails', [-w + .04, FLOOR, -.18, w - .04, FLOOR + .05, .18], .01, steel(PRIMER), METAL);
  bevel(p, 'cushion', [-w, FLOOR + .05, -.22, w, FLOOR + .2, .2], .04, f);
  const back = p.group('back', { at: [0, FLOOR + .17, .2], rotX: lean });
  bevel(p, 'backrest', [-w, 0, -.02, w, bench ? .5 : .56, .1], .04, f, { parent: back });
  if (head) bevel(p, 'headrest', [-w * .5, bench ? .54 : .6, 0, w * .5, bench ? .7 : .76, .09], .03, f, { parent: back });
  return back;
};
/** Open wire mesh: a coarse grid of wires, the rest see-through. */
const wires = (hex, step) => (ctx, x, y, w, h) => {
  ctx.clearRect(x, y, w, h);
  for (let i = 0; i < w; i += step) fill(ctx, x + i, y, 1, h, hex);
  for (let j = 0; j < h; j += step) fill(ctx, x, y + j, w, 1, hex);
  fill(ctx, x, y + h - 1, w, 1, hex); fill(ctx, x + w - 1, y, 1, h, hex);
};

// --- cabin parts --------------------------------------------------------------------------------

const RECIPES = [
  { id: 'seat', desc: 'A soft car seat made from synthetic fabric.', build: (p) => { seat(p, { lean: .18 }); } },
  { id: 'reclining_seat', desc: 'A soft seat with an adjustable backrest, making it a reasonably comfortable place to sleep.', build: (p) => {
    seat(p, { lean: .42, color: 0x4a3e36 });
    bevel(p, 'lever', [.24, FLOOR + .08, .02, .26, FLOOR + .12, .18], .005, flat(0x1a1a1a));
  } },
  { id: 'seat_back', desc: 'A wide, flat seat like you\'d find in the back of a sedan, upholstered with soft nylon.  (One tile of the bench: full width, so benches join.)', build: (p) => { seat(p, { w: H, lean: .22, color: 0x45474e, bench: true, head: false }); } },
  { id: 'seatbelt', desc: 'A length of synthetic fiber weaved into a flat band, usually used to securely fasten passenger inside vehicles.  (Three-point belt over a seat.)', build: (p) => {
    const band = flat(0x2a2c30);
    pane(p, 'shoulder', [V(.22, FLOOR + .74, .16), V(.2, FLOOR + .76, .12), V(-.2, FLOOR + .24, -.02), V(-.18, FLOOR + .22, .02)], .006, band);
    pane(p, 'lap', [V(-.22, FLOOR + .24, -.04), V(.22, FLOOR + .24, -.04), V(.22, FLOOR + .28, -.03), V(-.22, FLOOR + .28, -.03)], .006, band);
    bevel(p, 'anchor', [.22, FLOOR + .7, .12, .26, FLOOR + .8, .18], .008, flat(0x1a1a1a));
    bevel(p, 'buckle', [-.28, FLOOR + .14, -.06, -.22, FLOOR + .28, 0], .01, layers(flat(0x1a1a1a), (ctx, x, y, w) => fill(ctx, x + 1, y + 1, w - 2, 2, 0xb82a2a)));
  } },
  { id: 'controls', desc: 'A steering wheel, accelerator, and brake pedals.  (The wheel and pedals reach forward into the tile ahead, under the windshield, as in a real car.)', build: (p) => {
    const col = p.group('column', { at: [0, .78, -.5], rotX: -.5 });
    cyl(p, 'column', 'z', [0, 0, .1], .03, .2, 6, flat(TRIM), { parent: col });
    const wh = p.group('wheel', { at: [0, 0, .2], parent: col });
    for (let k = 0; k < 10; k++) {
      const a0 = (k * 2 * Math.PI) / 10, a1 = ((k + 1) * 2 * Math.PI) / 10, r = .18, q = r - .025;
      hull(p, `rim${k}`, [V(Math.cos(a0) * r, Math.sin(a0) * r, -.015), V(Math.cos(a1) * r, Math.sin(a1) * r, -.015), V(Math.cos(a0) * r, Math.sin(a0) * r, .015), V(Math.cos(a1) * r, Math.sin(a1) * r, .015), V(Math.cos(a0) * q, Math.sin(a0) * q, 0), V(Math.cos(a1) * q, Math.sin(a1) * q, 0)], flat(0x1e1e20), { parent: wh });
    }
    bevel(p, 'spoke', [-.16, -.015, -.01, .16, .015, .01], .005, flat(TRIM), { parent: wh });
    cyl(p, 'hub', 'z', [0, -.01, 0], .05, .04, 8, flat(TRIM), { parent: wh });
    for (const [n, x, w] of [['brake', -.08, .07], ['gas', .07, .04]]) hull(p, n, [V(x, FLOOR + .02, -.62), V(x + w, FLOOR + .02, -.62), V(x, FLOOR + .12, -.66), V(x + w, FLOOR + .12, -.66), V(x, FLOOR + .02, -.6), V(x + w, FLOOR + .02, -.6)], flat(0x1a1a1a));
  } },
  { id: 'dashboard', desc: 'A vehicle instrument panel with various gauges and switches.  (Across the cabin\'s front, reaching into the tile ahead under the windshield.)', build: (p) => {
    hull(p, 'dash', [V(-H, .58, -.3), V(H, .58, -.3), V(-H, .8, -.32), V(H, .8, -.32), V(-H, .88, -.42), V(H, .88, -.42), V(-H, .92, -.7), V(H, .92, -.7), V(-H, .58, -.7), V(H, .58, -.7)], speckle('dash', 0x2e2e32, [0x343438, 0x28282c], .3));
    hull(p, 'binnacle', [V(-.2, .8, -.32), V(.06, .8, -.32), V(-.2, .9, -.4), V(.06, .9, -.4), V(-.2, .8, -.42), V(.06, .8, -.42)], flat(0x1e1e22));
    pane(p, 'gauges', [V(-.18, .81, -.335), V(.04, .81, -.335), V(.04, .87, -.37), V(-.18, .87, -.37)], .004, layers(flat(0x0a0a0c), (ctx, x, y, w, h) => { for (const k of [.28, .72]) fill(ctx, x + Math.round(w * k) - 2, y + 1, 4, Math.max(1, h - 2), 0xb0e8a0); }), { glow: true });
  } },
  { id: 'vehicle_alarm', desc: 'A bunch of electronics that make it difficult to start the vehicle without the proper key, and that will sound an alarm if you try.  The alarm can be disabled.  (A module under the dash with a red LED.)', build: (p) => {
    bevel(p, 'box', [.08, .5, -.42, .18, .57, -.33], .008, flat(0x1a1a1c));
    bevel(p, 'led', [.15, .555, -.335, .17, .57, -.325], .002, flat(0xff2a1a), { glow: true });
    for (const [i, c] of [0xd82a2a, 0x2a2a2a, 0xe8c040].entries()) cyl(p, `wire${i}`, 'y', [.1 + i * .02, .47, -.38], .005, .06, 4, flat(c));
  } },
  { id: 'stereo', desc: 'A stereo system.  When turned on, it plays music, improving your mood.  (The head unit in the dash and two door speakers.)', build: (p) => {
    bevel(p, 'unit', [-.09, .66, -.34, .09, .72, -.3], .006, flat(0x1a1a1c));
    pane(p, 'display', [V(-.04, .7, -.299), V(.04, .7, -.299), V(.04, .715, -.299), V(-.04, .715, -.299)], .002, flat(0x5ac8f0), { glow: true });
    for (const x of [-H + .05, H - .05]) cyl(p, `speaker${x}`, 'x', [x, FLOOR + .16, -.1], .07, .02, 10, flat(0x1a1a1c));
  } },
  { id: 'integrated_heater_small', desc: 'Set of tubes, that move heat from the engine into the vehicle cabin, heating it up.  (A heater core behind the dash fed by two hoses from the engine bay.)', build: (p) => {
    bevel(p, 'core', [-.12, .5, -.58, .04, .62, -.5], .006, steel(0xa86a3a), METAL);
    for (const x of [-.09, 0]) cyl(p, `hose${x}`, 'z', [x, .56, -.72], .018, .28, 6, flat(0x1a1a1a));
    bevel(p, 'duct', [-.22, .48, -.5, .22, .53, -.34], .01, flat(0x2a2a2c));
  } },
  { id: 'integrated_cooler', desc: 'A small vehicle-mounted area cooler.  (3.75 L: a compact unit under the dash with a blower outlet.)', build: (p) => {
    bevel(p, 'unit', [.06, .48, -.56, .26, .6, -.44], .01, steel(0xd8dcdc), METAL);
    bevel(p, 'outlet', [.1, .5, -.44, .22, .58, -.42], .004, layers(flat(0x2a2a2c), (ctx, x, y, w, h) => { for (let j = 1; j < h; j += 2) fill(ctx, x, y + j, w, 1, 0x4a4a4e); }));
  } },
  { id: 'trunk', desc: 'A trunk: a lockable, covered cargo space (no description in CDDA).  The carpeted load floor with tie-down hooks; its walls are the halfboards round it.', build: (p) => {
    topSlab(p, 'floor', FLOOR, FLOOR + .02, 0, fabric(0x3a3a3e));
    for (const [x, z] of [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]]) bevel(p, `hook${x}${z}`, [x - .02, FLOOR + .02, z - .02, x + .02, FLOOR + .045, z + .02], .006, steel(CHROME), METAL);
  } },
  { id: 'cargo_space', desc: 'Cargo space: an open, covered load bed with tie-downs (cargo rack; no description in CDDA).', build: (p) => {
    topSlab(p, 'bed', FLOOR, FLOOR + .02, 0, steel(0x6a6e72), METAL);
    for (let x = -H + .06; x < H; x += .11) bevel(p, `rib${x.toFixed(2)}`, [x - .015, FLOOR + .02, -H, x + .015, FLOOR + .035, H], .005, steel(0x8a8e92), METAL);
    for (const [x, z] of [[-.22, -.22], [.22, .22]]) cyl(p, `ring${x}`, 'y', [x, FLOOR + .03, z], .025, .015, 6, flat(0xd8b020));
  } },
  { id: 'aisle', desc: 'An aisle: a walkway floor of sheet metal (no description in CDDA).', build: (p) => {
    topSlab(p, 'floor', FLOOR, FLOOR + .015, 0, layers(steel(0x8a8e92), (ctx, x, y, w, h) => { for (let j = 1; j < h; j += 4) for (let i = (j % 8 === 1 ? 1 : 3); i < w; i += 4) fill(ctx, x + i, y + j, 2, 1, 0xa8acb0); }), METAL);
  } },
];

// --- carts --------------------------------------------------------------------------------------

/** The cart parts, built together into one model per cart. */
const CART_PARTS = Object.fromEntries([
  { id: 'xlframe', desc: 'A small, lightweight frame made from pipework, part of a unibody vehicle.  Other vehicle components were mounted on it, but it is now deeply integrated with them.  (The tube chassis of carts and rolling bins, on the casters, with a wire tray.)', build: (p) => {
    const tube = steel(CHROME);
    for (const x of [-.25, .25]) cyl(p, `side${x}`, 'z', [x, .2, 0], .015, .8, 6, tube, METAL);
    for (const z of [-.4, .4]) cyl(p, `end${z}`, 'x', [0, .2, z], .015, .5, 6, tube, METAL);
    pane(p, 'tray', [V(-.24, .2, -.39), V(.24, .2, -.39), V(.24, .2, .39), V(-.24, .2, .39)], .004, wires(0xc0c4c8, 4), { cutout: true });
  } },
  { id: 'wheel_caster_large', desc: 'A set of medium wheels mounted on pivots, like you\'d find on a shopping cart.  (Four 6" casters under the cart frame\'s corners.)', build: (p) => {
    for (const [x, z] of [[-.23, -.36], [.23, -.36], [-.23, .36], [.23, .36]]) {
      cyl(p, `w${x}${z}`, 'x', [x, .075, z + .02], .075, .035, 8, speckle('caster', RUBBER, [0x2a2a2c], .3));
      for (const s of [-1, 1]) bevel(p, `fork${x}${z}${s}`, [x + s * .028 - .006, .07, z - .01, x + s * .028 + .006, .18, z + .03], .002, steel(CHROME), METAL);
      cyl(p, `crown${x}${z}`, 'y', [x, .185, z], .03, .02, 6, steel(CHROME), METAL);
    }
  } },
  { id: 'integrated_trashcan', desc: 'An industrial trash can (a really big trashcan, 400 L, longest side 114 cm, made out of thick plastic) mounted as a vehicle part: the rolling trash can.  (A tapering wheelie bin on the cart frame, lid and handle at the back.)', build: (p) => {
    const green = 0x2e5a3a;
    hull(p, 'body', [V(-.26, .21, -.34), V(.26, .21, -.34), V(-.26, .21, .34), V(.26, .21, .34), V(-.31, 1.02, -.4), V(.31, 1.02, -.4), V(-.31, 1.02, .4), V(.31, 1.02, .4)], speckle('bin', green, [0x34623f, 0x285234], .25));
    hull(p, 'rim', [V(-.33, .98, -.42), V(.33, .98, -.42), V(-.33, .98, .42), V(.33, .98, .42), V(-.33, 1.03, -.42), V(.33, 1.03, -.42), V(-.33, 1.03, .42), V(.33, 1.03, .42)], flat(shade(green, .82)));
    hull(p, 'lid', [V(-.34, 1.03, -.44), V(.34, 1.03, -.44), V(-.34, 1.03, .43), V(.34, 1.03, .43), V(-.32, 1.08, -.42), V(.32, 1.08, -.42), V(-.32, 1.08, .4), V(.32, 1.08, .4)], speckle('lid', shade(green, 1.1), [shade(green, 1.15)], .2));
    cyl(p, 'handle', 'x', [0, .98, .45], .02, .56, 6, flat(shade(green, .7)));
    bevel(p, 'label', [-.12, .78, -.388, .12, .84, -.37], .004, flat(0xe8e8e0));
  } },
  { id: 'basketlg', desc: 'A large wire basket from a shopping cart.  (Wire walls .48–.95 m, narrower at the bottom, the child seat and the handle at the back.)', build: (p) => {
    const wire = wires(0xc8ccd0, 5), o = { cutout: true };
    const B = [[-.21, .48, -.42], [.21, .48, -.42], [.21, .48, .38], [-.21, .48, .38]].map((q) => V(...q));
    const T = [[-.26, .95, -.45], [.26, .95, -.45], [.28, .95, .42], [-.28, .95, .42]].map((q) => V(...q));
    pane(p, 'floor', B, .004, wire, o);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; pane(p, `wall${i}`, [B[i], B[j], T[j], T[i]], .004, wire, o); }
    for (let i = 0; i < 4; i++) { const a = T[i], b = T[(i + 1) % 4]; hull(p, `rail${i}`, [a, b].flatMap((q) => [V(q.x - .008, q.y - .008, q.z - .008), V(q.x + .008, q.y + .008, q.z + .008), V(q.x - .008, q.y + .008, q.z + .008), V(q.x + .008, q.y - .008, q.z - .008)]), steel(CHROME), METAL); }
    for (const s of [-1, 1]) cyl(p, `strut${s}`, 'y', [s * .25, .6, .4], .012, .8, 6, steel(CHROME), METAL);
    cyl(p, 'handle', 'x', [0, 1.0, .46], .02, .56, 8, flat(0xd83a2a));
    pane(p, 'seat', [V(-.2, .8, .3), V(.2, .8, .3), V(.2, .8, .4), V(-.2, .8, .4)], .01, flat(0xd83a2a));
  } },

].map((r) => [r.id, r.build]));
const cart = (id, ids, parts, desc) => ({ id, ids, desc, build: (p) => { for (const k of parts) CART_PARTS[k](p); } });
const CARTS = [
  cart('vehicle_shopping_cart', ['shopping_cart', 'grocery_cart'], ['xlframe', 'wheel_caster_large', 'basketlg'], 'Shopping Cart / Grocery Cart: a pipe frame on four casters with the wire basket (CDDA: xlframe, wheel_caster_large, basketlg).'),
  cart('vehicle_rolling_trash_can', ['rolling_trash_can'], ['xlframe', 'wheel_caster_large', 'integrated_trashcan'], 'Rolling Trash Can: the wheelie bin on its pipe frame and casters (CDDA: xlframe, wheel_caster_large, integrated_trashcan).'),
];

export const VEHICLES = [
  ...RECIPES.map((r) => ({ ...r, id: `vp_${r.id}`, dir: 'vehicles', ppm: 96, source: 'tools/cubeclysm/page/vehicles.js' })),
  ...CARTS.map((r) => ({ ...r, dir: 'vehicles', ppm: 96, source: 'tools/cubeclysm/page/vehicles.js' })),
];
