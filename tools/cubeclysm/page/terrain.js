// Cubeclysm terrain, batch 1 (the census's "phase 1": ground, roofs, walls, doors, windows, fences,
// trees and shrubs up to 90% of what players see; docs/census.zh.md). One model per CDDA id, after
// its CDDA description (quoted in `desc`, CDDA 7136388). Sizes: props.js (1 m tiles, LEVEL-high
// walls, doors and windows WALL_T thick, spanning x, facing −Z).
import { LEVEL, SLAB, WALL_T, bark, border, chainlink, cracks, flat, glass, grid, layers, masonry, planks, sides, speckle } from './props.js';
import { fill, rng, shade } from './paint.js';
import { FLOWERS, LOW_FURN, TREES } from './vegetation.js';
import { FURNITURE } from './furniture.js';
import { VEHICLES } from './vehicles.js';
import { ROAD_VEHICLES } from './road-vehicles.js';
import { ITEMS } from './items.js';
import { ITEMS2 } from './items2.js';

const T = WALL_T / 2;

// --- ground and roofs: a slab whose top face is the tile -----------------------------------------

const slab = (paint, extra) => (p) => {
  p.box('tile', [-0.5, 0, -0.5, 0.5, SLAB, 0.5], paint, { ppm: 32 });
  extra?.(p);
};

/** Grass blades: thin upright blocks scattered over the tile. */
const tufts = (n, height, colors) => (p) => {
  for (let i = 0; i < n; i++) {
    const x = -0.45 + p.r() * 0.9, z = -0.45 + p.r() * 0.9, h = height * (0.6 + p.r() * 0.5), c = colors[i % colors.length];
    p.box(`blade${i}`, [x, SLAB, z, x + 0.04, SLAB + h, z + 0.04], flat(c), { ppm: 32 });
  }
};

const GRASS = [0x4f7d3a, [0x5a8a40, 0x45702f, 0x649648, 0x3f6a2c]];
const ASPHALT = [0x3c3c3e, [0x343436, 0x46464a, 0x4c4a48, 0x2e2e30]];
const asphalt = (id) => layers(speckle(id, ...ASPHALT, 0.5), cracks(id, 0x222224, 2));

const roadStripe = (ctx, x, y, w, h, side) => {
  if (side !== 'top') return;
  const t = Math.max(1, Math.round(h * 0.05));
  fill(ctx, x, y + Math.round(h / 2) - t - 1, w, t, 0xd8b030);
  fill(ctx, x, y + Math.round(h / 2) + 1, w, t, 0xd8b030);
};

const GROUND = [
  { id: 't_grass', desc: 'An area of hardy Kentucky bluegrass about ankle high.', build: slab(speckle('t_grass', ...GRASS, 0.55), tufts(10, 0.08, [0x5a8a40, 0x4a7a36])) },
  { id: 't_pavement', desc: 'A segment of asphalt, slowly degrading from cracks, frost heaves, and lack of maintenance.', build: slab(asphalt('t_pavement')) },
  { id: 't_forestfloor', desc: 'Covered in twigs and lots of brown, decaying leaves.', build: slab(layers(speckle('t_forestfloor', 0x5a4128, [0x6e4e2c, 0x7a5a30, 0x8a4a22, 0x4a3420, 0x9a6a2a], 0.6), (ctx, x, y, w, h, side) => {
    if (side !== 'top') return;
    const r = rng('twigs');
    for (let k = 0; k < 5; k++) { const tx = x + Math.floor(r() * (w - 6)), ty = y + Math.floor(r() * h); fill(ctx, tx, ty, 4 + Math.floor(r() * 4), 1, 0x3a2a18); }
  })) },
  { id: 't_grass_dead', desc: "An area of long, shaggy grass that hasn't been cut recently.", build: slab(speckle('t_grass_dead', 0x8f8040, [0xa29248, 0x7a6c36, 0xb0a058, 0x6a5e30], 0.55), tufts(14, 0.22, [0xa29248, 0x8a7a3e, 0xb4a45a])) },
  { id: 't_dirt', desc: '(no description in CDDA: bare earth)', build: slab(speckle('t_dirt', 0x6e5236, [0x7a5c3c, 0x5e4630, 0x846446, 0x50402c], 0.5)) },
  { id: 't_sidewalk', desc: 'An area of common poured concrete, damaged by frost heaves and large cracks due to lack of maintenance.', build: slab(layers(speckle('t_sidewalk', 0xa8a8a2, [0xb2b2ac, 0x9c9c96, 0xa0a09a], 0.4), sides(['top'], border(0x7e7e78)), cracks('t_sidewalk', 0x6a6a64, 3))) },
  { id: 't_floor', desc: 'Interlocking wooden tiles that are more than likely treated against fire, with wooden posts and beams that can support a roof.', build: slab(layers(planks('t_floor', { wood: 0x9a6a3a, seam: 0x5a3a1e, n: 4, vertical: false, tones: [0x9a6a3a, 0x8e6034, 0xa47444] }), sides(['top'], grid(0x5a3a1e, 2, 1)))) },
  { id: 't_nether_glass_floor', desc: 'An endless expanse of black glass.  It perfectly reflects the darkness around it.', build: (p) => p.box('tile', [-0.5, 0, -0.5, 0.5, SLAB, 0.5], layers(flat(0x0c0c12), glass(0x0c0c12)), { ppm: 32, metal: true }) },
  { id: 't_thconc_floor', desc: 'A bare and cold concrete floor that can support a roof.', build: slab(layers(speckle('t_thconc_floor', 0x8e8e8a, [0x969692, 0x868682], 0.3), sides(['top'], grid(0x7a7a76, 2, 2)))) },
  { id: 't_water_moving_dp', desc: 'The streaming water looks deep here.', build: slab(layers(speckle('t_water_moving_dp', 0x2a5a8a, [0x30669a, 0x245080, 0x3a74a8], 0.4), (ctx, x, y, w, h, side) => {
    if (side !== 'top') return;
    const r = rng('ripples');
    for (let k = 0; k < 6; k++) fill(ctx, x + Math.floor(r() * (w - 8)), y + Math.floor(r() * h), 5 + Math.floor(r() * 5), 1, 0x8ab4d8);
  })) },
  { id: 't_grass_long', desc: 'An area of long, shaggy grass about shin high.', build: slab(speckle('t_grass_long', ...GRASS, 0.55), tufts(22, 0.32, [0x5a8a40, 0x4a7a36, 0x6a9a48, 0x3f6a2c])) },
  { id: 't_gutter', desc: 'Channels water from the roof towards the ground, it looks flimsy.', build: (p) => {
    p.box('tile', [-0.5, 0, -0.5, 0.5, SLAB, 0.5], speckle('t_gutter_roof', 0x4a4a4c, [0x545456, 0x404042], 0.4), { ppm: 32 });
    // The gutter: a thin open channel along the roof edge, on brackets.
    p.box('trough', [-0.5, SLAB, -0.5, 0.5, SLAB + 0.08, -0.38], layers(flat(0xd8d8d4), sides(['top'], (ctx, x, y, w, h) => fill(ctx, x, y + 1, w, h - 2, 0x9a9a96))), { metal: true });
    for (const x of [-0.3, 0.3]) p.box(`bracket${x}`, [x - 0.02, SLAB, -0.4, x + 0.02, SLAB + 0.1, -0.34], flat(0xb0b0aa), { metal: true });
  } },
  { id: 't_pavement_y', desc: 'Streaks of carefully aligned yellow paint mark the road to inform drivers not to cross.', build: slab(layers(asphalt('t_pavement_y'), roadStripe)) },
  { id: 't_concrete', desc: 'A newer segment of poured concrete with surface finishes for aesthetics and resistance to freeze-thaw cycles.', build: slab(layers(speckle('t_concrete', 0xb4b4ae, [0xbcbcb6, 0xacaca6], 0.25), sides(['top'], (ctx, x, y, w, h) => { for (let j = 2; j < h; j += 4) fill(ctx, x, y + j, w, 1, 0xa8a8a2); }))) },
];

const ROOFS = [
  { id: 't_shingle_flat_roof', desc: 'A flat section of rooftop covered with shingles.', build: slab(masonry('t_shingle_flat_roof', { brick: 0x3e6a3a, mortar: 0x24401f, rows: 8, cols: 4, tones: [0x447240, 0x386234, 0x4a7a44] })) },
  { id: 't_flat_roof', desc: 'A flat, gray section of rooftop.', build: slab(layers(speckle('t_flat_roof', 0x5c5c5e, [0x666668, 0x525254, 0x707072], 0.6), sides(['top'], border(0x48484a)))) },
];

// --- walls: one tile, one level, full block --------------------------------------------------------

const wall = (paint, opts = {}) => (p) => p.box('wall', [-0.5, 0, -0.5, 0.5, LEVEL, 0.5], paint, { ppm: 32, ...opts });

const plaster = (id, hex) => layers(speckle(id, hex, [shade(hex, 1.04), shade(hex, 0.95), shade(hex, 0.9)], 0.3), sides(['front', 'back', 'left', 'right'], (ctx, x, y, w, h) => fill(ctx, x, y + h - 3, w, 3, shade(hex, 0.72))));
const concrete = (id, hex) => layers(speckle(id, hex, [shade(hex, 1.05), shade(hex, 0.93)], 0.35), sides(['front', 'back', 'left', 'right'], grid(shade(hex, 0.78), 1, 2)));
const formTies = (hex) => sides(['front', 'back', 'left', 'right'], (ctx, x, y, w, h) => { for (let j = 1; j < 4; j++) for (let i = 1; i < 3; i++) fill(ctx, x + Math.round((i * w) / 3), y + Math.round((j * h) / 4), 2, 2, hex); });
const cinder = (id, hex) => masonry(id, { brick: hex, mortar: shade(hex, 0.8), rows: 10, cols: 2, tones: [shade(hex, 0.97), shade(hex, 1.03)] });

const PAINT = { w: 0xe6e4dc, gray: 0xa4a4a0, g: 0x5e8a54, y: 0xd8c050, b: 0x4a6aa8, black: 0x262628 };

const WALLS = [
  { id: 't_concrete_wall', desc: 'An aesthetically pleasing design with simple lines, this type of concrete was used with a weaker chemical mixture in order to have faster setting time.', build: wall(concrete('t_concrete_wall', 0x5e5e5c)) },
  { id: 't_nether_glass_wall', desc: 'An endless expanse of black glass.  It perfectly reflects the darkness around it.', build: wall(layers(flat(0x0c0c12), glass(0x0c0c12)), { metal: true }) },
  { id: 't_wall_w', desc: 'A wall, painted white.', build: wall(plaster('t_wall_w', PAINT.w)) },
  { id: 't_brick_wall', desc: 'A solid brick wall, sturdy enough to support a roof with enough walls and to keep out any unwanted visitors.', build: wall(masonry('t_brick_wall', { brick: 0x9a4a32, mortar: 0xb8ac98, rows: 26, cols: 4, tones: [0x8a4030, 0xa45438, 0x7e3a2a] })) },
  { id: 't_strconc_wall_w', desc: 'A reinforced concrete wall, painted white.', build: wall(layers(concrete('t_strconc_wall_w', PAINT.w), formTies(0xbcbab2))) },
  { id: 't_concrete_wall_w', desc: 'A concrete wall, painted white.', build: wall(concrete('t_concrete_wall_w', PAINT.w)) },
  { id: 't_wall_gray', desc: 'A wall, painted gray.', build: wall(plaster('t_wall_gray', PAINT.gray)) },
  { id: 't_wall_g', desc: 'A wall, painted green.', build: wall(plaster('t_wall_g', PAINT.g)) },
  { id: 't_sconc_wall_w', desc: 'A simple concrete wall, painted white.', build: wall(cinder('t_sconc_wall_w', PAINT.w)) },
  { id: 't_wall_wood', desc: 'A finished wall of planks and support beams, capable of supporting an upper level or roof.  Highly flammable.', build: wall(layers(planks('t_wall_wood', { wood: 0x9a6a3e, seam: 0x5a3a20, n: 10, vertical: false, tones: [0x9a6a3e, 0x8e6238, 0xa4744a] }), sides(['front', 'back', 'left', 'right'], (ctx, x, y, w, h) => { fill(ctx, x, y, 3, h, 0x6a4626); fill(ctx, x + w - 3, y, 3, h, 0x6a4626); }))) },
  { id: 't_concrete_wall_gray', desc: 'A concrete wall, painted gray.', build: wall(concrete('t_concrete_wall_gray', PAINT.gray)) },
  { id: 't_strconc_wall_gray', desc: 'A reinforced concrete wall, painted gray.', build: wall(layers(concrete('t_strconc_wall_gray', PAINT.gray), formTies(0x8a8a86))) },
  { id: 't_wall_glass', desc: "A barrier made of glass, it's nothing complicated, and looks extremely fragile.", build: (p) => {
    // Aluminium frame, glass panes between the mullions.
    const al = flat(0x9aa0a4);
    p.box('sill', [-0.5, 0, -0.08, 0.5, 0.08, 0.08], al, { metal: true });
    p.box('head', [-0.5, LEVEL - 0.08, -0.08, 0.5, LEVEL, 0.08], al, { metal: true });
    for (const x of [-0.5, 0.46]) p.box(`mullion${x}`, [x, 0.08, -0.08, x + 0.04, LEVEL - 0.08, 0.08], al, { metal: true });
    p.box('pane', [-0.46, 0.08, -0.02, 0.46, LEVEL - 0.08, 0.02], glass(0xa8d4e0), { glass: true });
  } },
  { id: 't_wall_y', desc: 'A wall, painted yellow.', build: wall(plaster('t_wall_y', PAINT.y)) },
  { id: 't_wall_b', desc: 'A wall, painted blue.', build: wall(plaster('t_wall_b', PAINT.b)) },
  { id: 't_sconc_wall_gray', desc: 'A simple concrete wall, painted gray.', build: wall(cinder('t_sconc_wall_gray', PAINT.gray)) },
  // CDDA's colour for it is yellow (a data slip); the description says black.
  { id: 't_wall_black', desc: 'A wall, painted black.', build: wall(plaster('t_wall_black', PAINT.black)) },
  { id: 't_strconc_wall', desc: 'An extremely resilient wall, filled with concrete and rebar.', build: wall(layers(concrete('t_strconc_wall', 0x7c7c78), formTies(0x5a5a56))) },
];

// --- doors: a frame and a panel ------------------------------------------------------------------

const DOOR_H = 1.92, JAMB = 0.07, PANEL_T = 0.045;

const frame = (p, paint, { metal = false } = {}) => {
  for (const s of [-1, 1]) p.box(`jamb${s}`, [s < 0 ? -0.5 : 0.5 - JAMB, 0, -T, s < 0 ? -0.5 + JAMB : 0.5, LEVEL, T], paint, { metal });
  p.box('head', [-0.5 + JAMB, DOOR_H, -T, 0.5 - JAMB, LEVEL, T], paint, { metal });
};

/** A raised-panel wooden door face. */
const woodDoor = (id, wood) => layers(planks(id, { wood, seam: shade(wood, 0.75), n: 3, tones: [wood, shade(wood, 0.95)] }), sides(['front', 'back'], (ctx, x, y, w, h) => {
  for (const [py, ph] of [[0.08, 0.36], [0.52, 0.4]]) {
    const rx = x + Math.round(w * 0.16), ry = y + Math.round(h * py), rw = Math.round(w * 0.68), rh = Math.round(h * ph);
    fill(ctx, rx, ry, rw, rh, shade(wood, 1.06));
    border(shade(wood, 0.7))(ctx, rx, ry, rw, rh);
  }
}));

const PW = 0.5 - JAMB;
/** Panel (x −PW…PW, y 0…DOOR_H) on a hinge at x = −PW, swung by `swing` radians. */
const panel = (p, paint, { swing = 0, opts = {} } = {}) => {
  const g = p.group('hinge', { at: [-PW, 0, 0], rotY: swing });
  p.box('panel', [0, 0, -PANEL_T / 2, 2 * PW, DOOR_H, PANEL_T / 2], paint, { parent: g, ...opts });
  return g;
};
/** Hardware on both faces of a panel (x in panel space, from the hinge). */
const fitting = (p, g, name, [x, y], [w, h], paint, { depth = 0.025, metal = true, glow = false, faces = [-1, 1] } = {}) => {
  for (const s of faces) p.box(`${name}${s}`, [x - w / 2, y - h / 2, s < 0 ? -PANEL_T / 2 - depth : PANEL_T / 2, x + w / 2, y + h / 2, s < 0 ? -PANEL_T / 2 : PANEL_T / 2 + depth], paint, { parent: g, metal, glow });
};

const BRASS = flat(0xc8a040), STEEL = flat(0x8a9096), DARK = flat(0x202022);
const WOOD = 0x8a5a32, RAW = 0xa88250;
const knob = (p, g) => fitting(p, g, 'knob', [2 * PW - 0.1, 0.95], [0.05, 0.05], BRASS, { depth: 0.05 });
const keyhole = (p, g, y = 0.85) => fitting(p, g, 'keyhole', [2 * PW - 0.1, y], [0.04, 0.07], layers(BRASS, (ctx, x, yy, w, h) => fill(ctx, x + Math.floor(w / 2) - 1, yy + Math.floor(h / 3), 2, Math.max(2, Math.floor(h / 2)), 0x101010)), { depth: 0.012 });
const woodenDoor = (id, extra) => (p) => {
  frame(p, flat(shade(WOOD, 0.85)));
  const g = panel(p, woodDoor(id, WOOD));
  knob(p, g);
  extra?.(p, g);
};

const steelDoor = (id) => layers(speckle(id, 0x7a8086, [0x868c92, 0x6e7478, 0x8e9498], 0.35), sides(['front', 'back'], (ctx, x, y, w, h) => {
  const r = rng(`${id}:rivets`);
  for (let j = 3; j < h; j += 9) for (const i of [3, w - 4]) fill(ctx, x + i, y + j, 1, 1, 0x4a4e52);
  for (let k = 0; k < 3; k++) fill(ctx, x + Math.floor(r() * w * 0.5), y + Math.floor(r() * h * 0.8), Math.floor(w * 0.4), 1, 0x5a5e62);
}));
const galvanized = (id) => layers(speckle(id, 0xa4b0b8, [0xb4c0c6, 0x96a2aa, 0xbcc6cc], 0.5), sides(['front', 'back'], border(0x7a868e, 2)));

const slidingGlass = (paint, frameHex) => (p) => {
  frame(p, flat(frameHex), { metal: true });
  // Two panes on separate tracks, each a framed sheet of glass.
  for (const [x0, x1, z0, z1, name] of [[-PW, 0.04, -0.05, -0.01, 'fixed'], [-0.04, PW, 0.01, 0.05, 'slider']]) {
    p.box(`${name}-glass`, [x0 + 0.03, 0.05, z0, x1 - 0.03, DOOR_H - 0.03, z1], paint, { glass: true });
    for (const [a, b] of [[x0, x0 + 0.03], [x1 - 0.03, x1]]) p.box(`${name}-stile${a}`, [a, 0, z0, b, DOOR_H, z1], flat(frameHex), { metal: true });
    p.box(`${name}-rail`, [x0, 0, z0, x1, 0.05, z1], flat(frameHex), { metal: true });
    p.box(`${name}-top`, [x0, DOOR_H - 0.03, z0, x1, DOOR_H, z1], flat(frameHex), { metal: true });
  }
  p.box('track', [-PW, 0, -0.06, PW, 0.015, 0.06], flat(shade(frameHex, 0.7)), { metal: true });
};

const DOORS = [
  { id: 't_door_c', desc: "A standard wooden door that doesn't look very resilient.  It'd probably burn easily, too.", build: woodenDoor('t_door_c') },
  { id: 't_door_o', desc: '… This one is wide open.', build: (p) => {
    frame(p, flat(shade(WOOD, 0.85)));
    const g = panel(p, woodDoor('t_door_o', WOOD), { swing: Math.PI / 2 });
    knob(p, g);
  } },
  { id: 't_door_metal_locked', desc: 'A galvanized steel door, forged to withstand punishment and impede anyone or anything.  Typically used in conjunction with automated electronic locking systems.', build: (p) => {
    frame(p, flat(0x6a747a), { metal: true });
    const g = panel(p, galvanized('t_door_metal_locked'));
    fitting(p, g, 'pushbar', [PW, 1.0], [0.6, 0.05], STEEL, { depth: 0.06 });
    // The electronic lock: a card reader on the jamb with a red light.
    p.box('reader', [0.5 - JAMB + 0.005, 1.1, -T - 0.03, 0.5 - 0.005, 1.26, -T], flat(0x26282a), { metal: true });
    p.box('reader-led', [0.5 - JAMB + 0.02, 1.22, -T - 0.035, 0.5 - 0.02, 1.24, -T - 0.03], flat(0xe02020), { glow: true });
  } },
  { id: 't_door_glass_frosted_lab_c', desc: 'A sliding door of frosted white glass.', build: slidingGlass(glass(0xe8eef0, { frost: true }), 0xd4d8da) },
  { id: 't_door_locked_interior', desc: '… This one has an extra keyhole, so it\'s likely locked.', build: woodenDoor('t_door_locked_interior', (p, g) => keyhole(p, g)) },
  { id: 't_door_glass_c', desc: 'A sliding glass door, clear enough that an animal or a particularly dumb person could slam right into it.  This one is closed.', build: slidingGlass(glass(0xa8d8e4), 0x8a9094) },
  { id: 't_door_locked', desc: '… This one has a deadbolt keyhole, so it\'s likely locked.', build: woodenDoor('t_door_locked', (p, g) => fitting(p, g, 'deadbolt', [2 * PW - 0.1, 1.15], [0.06, 0.06], layers(BRASS, (ctx, x, y, w, h) => fill(ctx, x + Math.floor(w / 2) - 1, y + 1, 2, h - 2, 0x101010)), { depth: 0.02 })) },
  { id: 't_door_frame', desc: 'An empty door frame made from planks and nails.', build: (p) => {
    const nails = (ctx, x, y, w, h) => { for (let j = 4; j < h; j += 12) fill(ctx, x + Math.floor(w / 2), y + j, 1, 1, 0x3a3a3a); };
    frame(p, layers(planks('t_door_frame', { wood: RAW, seam: shade(RAW, 0.7), n: 1, vertical: false }), nails));
    p.box('sill', [-0.5 + JAMB, 0, -T, 0.5 - JAMB, 0.03, T], flat(shade(RAW, 0.9)));
  } },
  { id: 't_door_b', desc: 'A trashed wooden door, with a large hole in the middle that you can see right through.  The doorknob is so messed up that it can\'t be opened anymore.', build: (p) => {
    frame(p, flat(shade(WOOD, 0.85)));
    const g = p.group('hinge', { at: [-PW, 0, 0] });
    const paint = woodDoor('t_door_b', shade(WOOD, 0.92));
    const [h0, h1, v0, v1] = [0.24, 0.62, 0.62, 1.38]; // the hole, in panel x and y
    const W = 2 * PW, Z = PANEL_T / 2;
    for (const [n, box] of [['below', [0, 0, -Z, W, v0, Z]], ['above', [0, v1, -Z, W, DOOR_H, Z]], ['left', [0, v0, -Z, h0, v1, Z]], ['right', [h1, v0, -Z, W, v1, Z]]]) p.box(n, box, paint, { parent: g });
    // Splinters sticking into the hole.
    const r = rng('t_door_b:splinters');
    for (let k = 0; k < 7; k++) {
      const y = v0 + 0.05 + r() * (v1 - v0 - 0.1), left = k % 2 === 0, len = 0.05 + r() * 0.1;
      p.box(`splinter${k}`, [left ? h0 : h1 - len, y, -0.01, left ? h0 + len : h1, y + 0.03, 0.01], flat(RAW), { parent: g });
    }
    // The mangled knob, bent down and hanging.
    const k = p.group('knob-bent', { at: [W - 0.1, 0.95, -Z], rotZ: 0.9, parent: g });
    p.box('knob', [-0.02, -0.08, -0.04, 0.02, 0, 0], BRASS, { parent: k, metal: true });
  } },
  { id: 't_chaingate_c', desc: 'A gate for a chain link fence with a latch system to stay closed.', build: (p) => {
    const pipe = flat(0x9aa4aa), H = 1.8;
    for (const x of [-0.5, 0.44]) p.box(`post${x}`, [x, 0, -0.03, x + 0.06, H + 0.05, 0.03], pipe, { metal: true });
    const g = p.group('gate', { at: [-0.44, 0, 0] });
    const W = 0.86;
    for (const [n, b] of [['top', [0, H - 0.04, -0.02, W, H, 0.02]], ['bottom', [0, 0.06, -0.02, W, 0.1, 0.02]], ['l', [0, 0.06, -0.02, 0.04, H, 0.02]], ['r', [W - 0.04, 0.06, -0.02, W, H, 0.02]], ['brace', [0, 0.9, -0.02, W, 0.94, 0.02]]]) p.box(n, b, pipe, { parent: g, metal: true });
    p.box('mesh', [0.04, 0.1, -0.005, W - 0.04, H - 0.04, 0.005], chainlink(0xb4bcc0), { parent: g, cutout: true });
    p.box('latch', [W - 0.04, 1.2, -0.04, W + 0.06, 1.28, 0.04], flat(0x6a7276), { parent: g, metal: true });
  } },
  { id: 't_door_locked_alarm', desc: '… This one has an extra keyhole, so it\'s likely locked.  …it has an alarm…', build: woodenDoor('t_door_locked_alarm', (p, g) => {
    keyhole(p, g);
    // A magnetic alarm contact on the head of the frame and on the door's top corner.
    p.box('contact-frame', [0.5 - JAMB - 0.12, DOOR_H - 0.06, -T - 0.025, 0.5 - JAMB - 0.04, DOOR_H, -T], flat(0xf0f0ec));
    fitting(p, g, 'contact', [2 * PW - 0.08, DOOR_H - 0.06], [0.08, 0.04], flat(0xf0f0ec), { faces: [-1], metal: false });
  }) },
  { id: 't_door_metal_pickable', desc: 'An extremely resilient door made of assorted steel, carved and pounded into shape.  This one has an extra keyhole, so it\'s likely locked.', build: (p) => {
    frame(p, flat(0x5a5e62), { metal: true });
    const g = panel(p, steelDoor('t_door_metal_pickable'));
    fitting(p, g, 'handle', [2 * PW - 0.1, 1.0], [0.04, 0.14], STEEL, { depth: 0.05 });
    keyhole(p, g, 0.88);
    fitting(p, g, 'patch', [0.3, 1.45], [0.26, 0.2], flat(0x6a6e72), { depth: 0.008 });
  } },
  { id: 't_door_elocked', desc: '… This one has a deadbolt electronic lock, so it\'s likely locked.', build: woodenDoor('t_door_elocked', (p, g) => {
    fitting(p, g, 'keypad', [2 * PW - 0.1, 1.18], [0.08, 0.13], layers(flat(0x2a2c2e), (ctx, x, y, w, h) => { for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) fill(ctx, x + 1 + Math.round((i * (w - 2)) / 3), y + Math.round(h * 0.35) + Math.round((j * h * 0.55) / 3), 1, 1, 0x9a9a9a); }), { depth: 0.03 });
    fitting(p, g, 'keypad-led', [2 * PW - 0.1, 1.235], [0.02, 0.012], flat(0x30e040), { depth: 0.032, glow: true });
  }) },
  { id: 't_door_metal_c', desc: 'An extremely resilient door made of assorted steel, carved and pounded into shape.', build: (p) => {
    frame(p, flat(0x5a5e62), { metal: true });
    const g = panel(p, steelDoor('t_door_metal_c'));
    fitting(p, g, 'handle', [2 * PW - 0.1, 1.0], [0.04, 0.14], STEEL, { depth: 0.05 });
    fitting(p, g, 'patch', [0.5, 0.5], [0.3, 0.24], flat(0x6a6e72), { depth: 0.008 });
    fitting(p, g, 'patch2', [0.24, 1.5], [0.2, 0.3], flat(0x727678), { depth: 0.008 });
  } },
  { id: 't_door_locked_peep', desc: 'A regular door made of ordinary wood, except this one has a peephole.', build: woodenDoor('t_door_locked_peep', (p, g) => {
    keyhole(p, g);
    fitting(p, g, 'peephole', [PW, 1.52], [0.035, 0.035], layers(BRASS, (ctx, x, y, w, h) => fill(ctx, x + 1, y + 1, w - 2, h - 2, 0x101418)), { depth: 0.015 });
  }) },
];

// --- windows: a wall unit (sill, header, piers) with a frame, glass and curtains ---------------------

const TRIM = 0xecebe4;

/** Frame members around the opening, `t` thick. */
const casing = (p, w, y0, y1, paint, t = 0.04, opts = {}) => {
  p.box('sill', [-w / 2, y0, -T - 0.02, w / 2, y0 + t, T], paint, opts);
  p.box('lintel', [-w / 2, y1 - t, -T, w / 2, y1, T], paint, opts);
  for (const s of [-1, 1]) p.box(`stile${s}`, [s < 0 ? -w / 2 : w / 2 - t, y0, -T, s < 0 ? -w / 2 + t : w / 2, y1, T], paint, opts);
};
const pane = (p, name, w, y0, y1, z = 0, paint = glass(0xa8d4e0), cx = 0) => p.box(name, [cx - w / 2, y0, z - 0.01, cx + w / 2, y1, z + 0.01], paint, { glass: true });

/** Fancy curtains on the inside (+Z): tied back at the sides, or drawn across. */
const FABRIC = 0x8a2a2e;
const fancy = (id) => layers(planks(id, { wood: FABRIC, seam: shade(FABRIC, 0.7), n: 6, tones: [FABRIC, shade(FABRIC, 0.88)] }), (ctx, x, y, w, h) => { fill(ctx, x, y + h - 3, w, 2, 0xc8a040); });
const curtains = (p, id, w, y0, y1, drawn) => {
  const z0 = T + 0.02, z1 = T + 0.07;
  p.box('rod', [-w / 2 - 0.06, y1 + 0.02, z0, w / 2 + 0.06, y1 + 0.05, z1], flat(0x6a5030));
  if (drawn) {
    for (const s of [-1, 1]) p.box(`curtain${s}`, [s < 0 ? -w / 2 - 0.04 : 0, y0 - 0.05, z0, s < 0 ? 0 : w / 2 + 0.04, y1 + 0.02, z1], fancy(`${id}${s}`));
  } else {
    for (const s of [-1, 1]) {
      const a = s < 0 ? -w / 2 - 0.06 : w / 2 - 0.08, b = a + 0.14;
      p.box(`curtain${s}`, [a, y0 - 0.05, z0, b, y1 + 0.02, z1 + 0.02], fancy(`${id}${s}`));
      p.box(`tie${s}`, [a - 0.005, (y0 + y1) / 2, z0 - 0.005, b + 0.005, (y0 + y1) / 2 + 0.04, z1 + 0.025], flat(0xc8a040));
    }
  }
};
const sensor = (p, w, y1) => {
  p.box('alarm-sensor', [w / 2 - 0.16, y1 - 0.14, -0.065, w / 2 - 0.1, y1 - 0.08, -0.04], flat(0xf4f4f0));
  p.box('alarm-wire', [w / 2 - 0.14, y1 - 0.08, -0.055, w / 2 - 0.13, y1 - 0.04, -0.05], flat(0x2a2a2a));
};

// Horizontal sliders: two sashes on two tracks; open = the inner sash slid behind the outer one.
// Domestic windows are wider than tall; the "smaller" ones (CDDA's description) are smaller.
// Sizes are ours (CDDA has none): opening width × sill and head height, in metres.
const DOMESTIC = [0.84, 1.0, 1.72], SMALL = [0.6, 1.15, 1.65];
const slider = (id, [w, y0, y1], { curtain = null, open = false, alarm = false } = {}) => (p) => {
  casing(p, w, y0, y1, flat(TRIM));
  const iw = w - 0.08, half = iw / 2 + 0.02, a = y0 + 0.04, b = y1 - 0.04, st = 0.035;
  /** A sash: glass in a frame, from x0 to x0 + half, on the track at depth z. */
  const sash = (name, x0, z) => {
    pane(p, `${name}-glass`, half - 2 * st, a + st, b - st, z, glass(0xa8d4e0), x0 + half / 2);
    for (const [n, box] of [['top', [x0, b - st, z - 0.015, x0 + half, b, z + 0.015]], ['bottom', [x0, a, z - 0.015, x0 + half, a + st, z + 0.015]], ['l', [x0, a, z - 0.015, x0 + st, b, z + 0.015]], ['r', [x0 + half - st, a, z - 0.015, x0 + half, b, z + 0.015]]]) p.box(`${name}-${n}`, box, flat(TRIM));
    return x0;
  };
  // Panes are drawn at their sash's centre: shift them there.
  const fixedX = iw / 2 - half, slideX = open ? fixedX - 0.02 : -iw / 2;
  sash('fixed', fixedX, -0.03);
  sash('slider', slideX, 0.03);
  p.box('track', [-w / 2 + 0.04, a - 0.012, -0.05, w / 2 - 0.04, a, 0.05], flat(shade(TRIM, 0.8)));
  if (curtain) curtains(p, id, w, y0, y1, curtain === 'drawn');
  if (alarm) sensor(p, w, y1);
};

const WINDOWS = [
  { id: 't_window_domestic', desc: 'A closed window with fancy curtains on the inside that can be drawn closed to block visibility and shut out any light.', build: slider('t_window_domestic', DOMESTIC, { curtain: 'open' }) },
  { id: 't_curtains', desc: 'A closed window with fancy curtains that have been drawn shut, blocking sunlight and visibility.', build: slider('t_curtains', DOMESTIC, { curtain: 'drawn' }) },
  { id: 't_window', desc: 'A giant sheet of glass inserted into a window, typically found on the side of shops to showcase goods.', build: (p) => {
    casing(p, 1, 0.3, 1.95, flat(0x3a3e42), 0.035, { metal: true });
    pane(p, 'sheet', 0.93, 0.335, 1.915);
  } },
  { id: 't_window_domestic_alarm', desc: 'A closed window with fancy curtains on the inside … (alarmed)', build: slider('t_window_domestic_alarm', DOMESTIC, { curtain: 'open', alarm: true }) },
  { id: 't_window_frame', desc: "A wooden window frame filled with shattered glass.  You'll probably get hurt if you crawl through the sharp and jagged shards.", build: (p) => {
    const [w, y0, y1] = DOMESTIC;
    casing(p, w, y0, y1, planks('t_window_frame', { wood: RAW, seam: shade(RAW, 0.7), n: 1, vertical: false }));
    // Jagged shards left in the frame: stepped glass teeth along each edge.
    const r = rng('t_window_frame:shards');
    const iw = w - 0.08;
    for (let k = 0; k < 9; k++) {
      const x = -iw / 2 + (k / 8) * (iw - 0.08), len = 0.06 + r() * 0.22;
      p.box(`shard-b${k}`, [x, y0 + 0.04, -0.008, x + 0.06 + r() * 0.04, y0 + 0.04 + len, 0.008], glass(0xb8dce4), { glass: true });
      const len2 = 0.04 + r() * 0.16;
      p.box(`shard-t${k}`, [x, y1 - 0.04 - len2, -0.008, x + 0.05 + r() * 0.04, y1 - 0.04, 0.008], glass(0xb8dce4), { glass: true });
    }
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const y = y0 + 0.1 + k * 0.18, len = 0.05 + r() * 0.12;
      p.box(`shard-s${s}${k}`, [s < 0 ? -iw / 2 : iw / 2 - len, y, -0.008, s < 0 ? -iw / 2 + len : iw / 2, y + 0.12, 0.008], glass(0xb8dce4), { glass: true });
    }
  } },
  { id: 't_curtains_alarm', desc: 'A closed window with fancy curtains that have been drawn shut … (alarmed)', build: slider('t_curtains_alarm', DOMESTIC, { curtain: 'drawn', alarm: true }) },
  { id: 't_window_empty', desc: 'An empty window frame made of planks and nails.', build: (p) => {
    const [w, y0, y1] = DOMESTIC;
    casing(p, w, y0, y1, layers(planks('t_window_empty', { wood: RAW, seam: shade(RAW, 0.7), n: 1, vertical: false }), (ctx, x, y, ww, h) => { for (let i = 3; i < ww; i += 10) fill(ctx, x + i, y + Math.floor(h / 2), 1, 1, 0x3a3a3a); }));
  } },
  { id: 't_window_no_curtains', desc: 'A closed smaller window typically found in residential homes.', build: slider('t_window_no_curtains', SMALL) },
  { id: 't_window_open', desc: 'A window with fancy curtains on the inside … It\'s open and you can crawl through.', build: slider('t_window_open', DOMESTIC, { curtain: 'open', open: true }) },
  { id: 't_window_no_curtains_open', desc: "A smaller window typically found in residential homes.  It's open and can be crawled through.", build: slider('t_window_no_curtains_open', SMALL, { open: true }) },
  { id: 't_reinforced_glass_shutter_open', desc: "Hanging metal shutters that haven't been deployed, exposing the reinforced glass.", build: (p) => {
    const w = 0.9, y0 = 0.6, y1 = 1.7;
    casing(p, w, y0, y1, flat(0x4a4e52), 0.05, { metal: true });
    // Thick wired glass.
    p.box('glass', [-w / 2 + 0.05, y0 + 0.05, -0.03, w / 2 - 0.05, y1 - 0.05, 0.03], layers(glass(0x9ac8d4), (ctx, x, y, ww, h) => { for (let i = 0; i < ww; i += 6) fill(ctx, x + i, y, 1, h, 0x6a8a94); for (let j = 0; j < h; j += 6) fill(ctx, x, y + j, ww, 1, 0x6a8a94); }), { glass: true });
    // The rolled-up shutter in its box above the window, and its guide rails.
    p.box('shutter-box', [-w / 2 - 0.04, y1, -T - 0.14, w / 2 + 0.04, y1 + 0.18, -T], layers(flat(0x6a6e72), (ctx, x, y, ww, h) => { for (let j = 2; j < h; j += 3) fill(ctx, x, y + j, ww, 1, 0x5a5e62); }), { metal: true });
    for (const s of [-1, 1]) p.box(`rail${s}`, [s * (w / 2) - 0.03, y0, -T - 0.06, s * (w / 2) + 0.03, y1, -T], flat(0x5a5e62), { metal: true });
  } },
];

// --- fences: a straight run along x, centred on the tile ---------------------------------------------

const post = (p, name, x, h, paint, t = 0.06, opts = {}) => p.box(name, [x - t / 2, 0, -t / 2, x + t / 2, h, t / 2], paint, opts);
const rail = (p, name, y, t, paint, d = 0.04, opts = {}) => p.box(name, [-0.5, y, -d / 2, 0.5, y + t, d / 2], paint, opts);

const FENCES = [
  { id: 't_chainfence', desc: "A tall fence made of woven wires.  There aren't any gaps big enough for you to fit through.", build: (p) => {
    const pipe = flat(0x9aa4aa), H = 1.8;
    post(p, 'post', 0, H + 0.04, pipe, 0.06, { metal: true });
    rail(p, 'top-rail', H - 0.04, 0.04, pipe, 0.04, { metal: true });
    p.box('mesh', [-0.5, 0.02, -0.005, 0.5, H - 0.04, 0.005], chainlink(0xb4bcc0), { cutout: true });
  } },
  { id: 't_privacy_fence', desc: 'A rather stout fence made of planks and fence posts, it is tall enough to prevent people from seeing into your yard.', build: (p) => {
    const H = 1.8, wood = 0x8a6440;
    post(p, 'post', 0, H, flat(shade(wood, 0.8)), 0.1);
    for (const y of [0.3, 1.45]) p.box(`rail${y}`, [-0.5, y, 0.05, 0.5, y + 0.08, 0.1], flat(shade(wood, 0.85)));
    p.box('boards', [-0.5, 0.02, -0.05, 0.5, H, 0.05], planks('t_privacy_fence', { wood, seam: shade(wood, 0.65), n: 7, tones: [wood, shade(wood, 0.93), shade(wood, 1.06)] }));
  } },
  { id: 't_concrete_railing', desc: 'A section of cemented concrete railing.', build: (p) => {
    const c = speckle('t_concrete_railing', 0xa6a6a0, [0xb0b0aa, 0x9a9a94], 0.35);
    rail(p, 'base', 0, 0.15, c, 0.26);
    rail(p, 'cap', 0.86, 0.12, c, 0.28);
    for (let i = 0; i < 5; i++) { const x = -0.4 + i * 0.2; p.box(`baluster${i}`, [x - 0.045, 0.15, -0.045, x + 0.045, 0.86, 0.045], c); }
  } },
  { id: 't_railing', desc: 'A section of wooden railing.', build: (p) => {
    const wood = 0xa07446, w = planks('t_railing', { wood, seam: shade(wood, 0.7), n: 1, vertical: false });
    post(p, 'post', 0, 1.05, flat(shade(wood, 0.85)), 0.09);
    rail(p, 'top', 0.95, 0.07, w, 0.08);
    rail(p, 'bottom', 0.12, 0.05, w, 0.05);
    for (let i = 0; i < 6; i++) { const x = -0.42 + i * 0.168; if (Math.abs(x) < 0.06) continue; p.box(`spindle${i}`, [x - 0.02, 0.17, -0.02, x + 0.02, 0.95, 0.02], flat(wood)); }
  } },
  { id: 't_fence', desc: "A barrier made of wood, it's nothing complicated.  Mildly suggests where not to go.", build: (p) => {
    const wood = 0x8a5e36;
    for (const y of [0.25, 0.75]) p.box(`rail${y}`, [-0.5, y, 0.02, 0.5, y + 0.07, 0.06], flat(shade(wood, 0.85)));
    for (let i = 0; i < 6; i++) {
      const x = -0.42 + i * 0.168;
      p.box(`picket${i}`, [x - 0.04, 0.03, -0.02, x + 0.04, 1.0, 0.02], planks(`t_fence${i}`, { wood, seam: shade(wood, 0.7), n: 1 }));
      p.box(`point${i}`, [x - 0.02, 1.0, -0.02, x + 0.02, 1.06, 0.02], flat(wood));
    }
  } },
  { id: 't_metal_railing', desc: 'A section of metal railing.', build: (p) => {
    const steel = flat(0x3e4246);
    post(p, 'post', 0, 1.05, steel, 0.05, { metal: true });
    rail(p, 'top', 1.0, 0.05, steel, 0.05, { metal: true });
    rail(p, 'mid', 0.5, 0.03, steel, 0.03, { metal: true });
    rail(p, 'bottom', 0.08, 0.03, steel, 0.03, { metal: true });
    for (let i = 0; i < 8; i++) { const x = -0.44 + i * 0.125; if (Math.abs(x) < 0.04) continue; p.box(`bar${i}`, [x - 0.012, 0.11, -0.012, x + 0.012, 1.0, 0.012], steel, { metal: true }); }
  } },
  { id: 't_splitrail_fence', desc: 'A rather stout fence made of planks and fence posts, suitable for containing livestock like horses, cows and pigs.', build: (p) => {
    const wood = 0x7a5a3a, log = bark('t_splitrail_fence', wood);
    post(p, 'post', 0, 1.25, log, 0.14);
    for (const y of [0.3, 0.68, 1.06]) p.box(`rail${y}`, [-0.5, y, -0.06, 0.5, y + 0.11, 0.04], planks(`splitrail${y}`, { wood: shade(wood, 1.1), seam: shade(wood, 0.7), n: 2, vertical: false }));
  } },
];

const tag = (list, surface) => list.map((e) => ({ ...e, surface }));

/** Each window's opening [width, sill height, head height] (m): engines cut the wall around it. */
const OPENING = { t_window: [1, 0.3, 1.95], t_reinforced_glass_shutter_open: [0.9, 0.6, 1.7], t_window_no_curtains: SMALL, t_window_no_curtains_open: SMALL };
const openings = (list) => list.map((e) => ({ ...e, opening: OPENING[e.id] ?? DOMESTIC }));

/** Phase-1 terrain, each with the kind of surface an engine may take its texture for. */
export const TERRAIN = [...tag(GROUND, 'floor'), ...tag(ROOFS, 'roof'), ...tag(WALLS, 'wall'), ...DOORS, ...openings(WINDOWS), ...FENCES, ...TREES, ...FLOWERS, ...LOW_FURN, ...FURNITURE, ...VEHICLES, ...ROAD_VEHICLES, ...ITEMS, ...ITEMS2].map((e) => ({ ppm: 64, ...e }));
