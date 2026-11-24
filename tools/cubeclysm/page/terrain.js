// Cubeclysm terrain, batch 1 (the census's "phase 1": ground, roofs, walls, doors, windows, fences,
// trees and shrubs up to 90% of what players see; docs/census.zh.md). One model per CDDA id, after
// its CDDA description (quoted in `desc`, CDDA 7136388). Sizes: props.js (1 m tiles, LEVEL-high
// walls, doors and windows WALL_T thick, spanning x, facing −Z).
import { LEVEL, SLAB, WALL_T, bark, border, chainlink, cracks, flat, glass, grid, layers, masonry, planks, sides, speckle } from './props.js';
import { V, cyl, hull } from './item-kit.js';
import { poly } from './lowpoly.js';
import { fill, rng, shade } from './paint.js';
import { FLOWERS, LOW_FURN, TREES } from './vegetation.js';
import { FURNITURE } from './furniture.js';
import { FURNITURE_BATCH } from './furniture-batch.js';
import { VEHICLES } from './vehicles.js';
import { ROAD_VEHICLES } from './road-vehicles.js';
import { ITEMS } from './items.js';
import { ITEMS2 } from './items2.js';
import { ITEMS3 } from './items3.js';
import { ITEMS4 } from './items4.js';
import { INVENTORY_PROPS } from './inventory-props.js';
import { SHELTER_PROPS } from './shelter-props.js';
import { CARRY_PROPS } from './carry-props.js';
import { COMMON_LOOT } from './common-loot.js';

const T = WALL_T / 2;

// --- ground and roofs: a slab whose top face is the tile -----------------------------------------

/** A roof tile with the rain gutter on its −Z edge: a thin open channel on brackets. */
const gutter = (p) => {
  p.box('tile', [-0.5, 0, -0.5, 0.5, SLAB, 0.5], speckle('t_gutter_roof', 0x4a4a4c, [0x545456, 0x404042], 0.4), { ppm: 32 });
  p.box('trough', [-0.5, SLAB, -0.5, 0.5, SLAB + 0.08, -0.38], layers(flat(0xd8d8d4), sides(['top'], (ctx, x, y, w, h) => fill(ctx, x, y + 1, w, h - 2, 0x9a9a96))), { metal: true });
  for (const x of [-0.3, 0.3]) p.box(`bracket${x}`, [x - 0.02, SLAB, -0.4, x + 0.02, SLAB + 0.1, -0.34], flat(0xb0b0aa), { metal: true });
};

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

/**
 * Pixel-art grass sprites: blades 1 px wide rising from the bottom edge, darker at the root and
 * lighter at the tip, some leaning; `heads` puts a seed head on the tallest. Unpainted pixels stay
 * transparent (holes in the cutout material).
 */
const bladesP = (seed, { n, base, mid, tip, heads = null, minH = .45 }) => (ctx, x, y, w, h) => {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const bx = Math.floor(r() * w), bh = Math.max(3, Math.round(h * (minH + r() * (1 - minH))));
    const lean = r() < .55 ? (r() < .5 ? -1 : 1) : 0, step = 2 + Math.floor(r() * 3), wide = r() < .3;
    let xx = bx;
    for (let j = 0; j < bh; j++) {
      const t = j / bh, c = t < .3 ? base : t < .7 ? mid : tip;
      xx = bx + lean * Math.floor(j / step);
      if (xx < 0 || xx >= w) break;
      fill(ctx, x + xx, y + h - 1 - j, wide && t < .5 ? 2 : 1, 1, c);
    }
    if (heads && bh > h * .8 && xx >= 0 && xx < w) fill(ctx, x + Math.max(0, xx - (r() < .5 ? 1 : 0)), y + h - bh - 1, 2, 3, heads);
  }
};
/** One upright sprite quad on the tile, centred at (cx, cz), facing along angle a. */
const sprite = (p, name, cx, cz, a, wd, ht, paint) => {
  const dx = Math.cos(a) * wd / 2, dz = Math.sin(a) * wd / 2;
  const bl = V(cx - dx, SLAB, cz - dz), br = V(cx + dx, SLAB, cz + dz), tr = V(cx + dx, SLAB + ht, cz + dz), tl = V(cx - dx, SLAB + ht, cz - dz);
  const out = br.clone().sub(bl).cross(tr.clone().sub(bl));
  poly(p, name, [bl, br, tr, tl], out, paint, { cutout: true, ppm: 48 });
};
/**
 * Block-game style grass: the tile's ground slab, a big X of two crossed sprites on its diagonals,
 * and three smaller crossed clumps round it, each with its own blades.
 */
const crossGrass = (id, ground, ht, look) => (p) => {
  p.box('tile', [-0.5, 0, -0.5, 0.5, SLAB, 0.5], ground, { ppm: 32 });
  const cross = (name, cx, cz, a, wd, h, n) => {
    sprite(p, `${name}a`, cx, cz, a, wd, h, bladesP(`${id}${name}a`, { ...look, n }));
    sprite(p, `${name}b`, cx, cz, a + Math.PI / 2, wd, h, bladesP(`${id}${name}b`, { ...look, n }));
  };
  cross('x', 0, 0, Math.PI / 4, 1.1, ht, Math.round(look.n * 1.1));
  const r = rng(`${id}:clumps`);
  for (const [k, [cx, cz]] of [[-.28, .22], [.26, .3], [.2, -.3]].entries()) cross(`c${k}`, cx, cz, r() * Math.PI, .34, ht * (.6 + r() * .3), Math.round(look.n * .4));
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
  { id: 't_grass', desc: 'An area of hardy Kentucky bluegrass about ankle high.  (Block-game style: crossed pixel-art sprites of green blades up to 20 cm on a grass slab.)', build: crossGrass('t_grass', speckle('t_grass', ...GRASS, 0.55), .2, { n: 62, base: 0x4a7a34, mid: 0x62963e, tip: 0x88be54 }) },
  { id: 't_pavement', desc: 'A segment of asphalt, slowly degrading from cracks, frost heaves, and lack of maintenance.', build: slab(asphalt('t_pavement')) },
  { id: 't_forestfloor', desc: 'Covered in twigs and lots of brown, decaying leaves.', build: slab(layers(speckle('t_forestfloor', 0x5a4128, [0x6e4e2c, 0x7a5a30, 0x8a4a22, 0x4a3420, 0x9a6a2a], 0.6), (ctx, x, y, w, h, side) => {
    if (side !== 'top') return;
    const r = rng('twigs');
    for (let k = 0; k < 5; k++) { const tx = x + Math.floor(r() * (w - 6)), ty = y + Math.floor(r() * h); fill(ctx, tx, ty, 4 + Math.floor(r() * 4), 1, 0x3a2a18); }
  })) },
  { id: 't_grass_dead', desc: "An area of long, shaggy grass that hasn't been cut recently.  (Block-game style: crossed pixel-art sprites of dry straw-coloured blades up to 38 cm, seed heads on the tallest, on a dry slab.)", build: crossGrass('t_grass_dead', speckle('t_grass_dead', 0x8f8040, [0xa29248, 0x7a6c36, 0xb0a058, 0x6a5e30], 0.55), .38, { n: 48, base: 0x7a6a32, mid: 0xa08c48, tip: 0xc8b474, heads: 0xe2d092, minH: .35 }) },
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
  { id: 't_grass_long', desc: 'An area of long, shaggy grass about shin high.  (Block-game style: crossed pixel-art sprites of green blades up to 40 cm, a few pale seed heads on the tallest, on a grass slab.)', build: crossGrass('t_grass_long', speckle('t_grass_long', ...GRASS, 0.55), .4, { n: 56, base: 0x3e6a2c, mid: 0x588c3a, tip: 0x7eb04c, heads: 0xc8c47a, minH: .35 }) },
  { id: 't_gutter', faceOut: true, desc: 'Channels water from the roof towards the ground, it looks flimsy.  (On the roof edge, the trough at −Z: an engine turns −Z to the open side.)', build: (p) => gutter(p) },
  { id: 't_gutter_drop', faceOut: true, desc: 'A spot in the gutter where the water flows into a downspout.  It looks flimsy.  You may be able to climb down here.  (The gutter at −Z with an outlet in the trough; from it the pipe drops, bends back to the wall face and runs down into the downspout beside the wall.)', build: (p) => {
    gutter(p);
    p.box('outlet', [-0.05, SLAB + 0.079, -0.48, 0.05, SLAB + 0.081, -0.4], flat(0x2a2a2c));
    // Down from the trough, back to the wall face (0.13 m out from the wall's centre) and down
    // the wall into the downspout of the tile beside it.
    const alu = flat(0xdcdcd8);
    p.box('spout', [-0.045, -0.12, -0.48, 0.045, SLAB + 0.02, -0.4], alu, { metal: true });
    p.box('offset', [-0.045, -0.2, -0.48, 0.045, -0.12, -0.13], alu, { metal: true });
    p.box('drop', [-0.045, -0.45, -0.21, 0.045, -0.12, -0.13], alu, { metal: true });
  } },
  { id: 't_gutter_downspout', faceWall: true, desc: 'A length of gutter running from the roof to the ground, you could place a container underneath it to collect rainwater.  It looks flimsy.  (Against the wall at −Z (an engine turns it to the wall beside it; the wall face stands 0.37 m past the tile edge): a white aluminium downspout down the wall on straps, from just under the roof (the gutter drop above brings the water to it), kicking out at the foot into the downspout funnel (tr_downspout_funnel, part of this tile); bare earth round it, as left when it is bashed.)', build: (p) => {
    p.box('tile', [-0.5, 0, -0.5, 0.5, SLAB, 0.5], speckle('t_downspout_dirt', 0x6e5236, [0x7a5c3c, 0x5e4630, 0x846446], 0.5), { ppm: 32 });
    const alu = layers(flat(0xdcdcd8), sides(['front', 'back'], (ctx, x, y, w, h) => fill(ctx, x + Math.floor(w / 2), y, 1, h, 0xb8b8b4)));
    const zw = -0.87, d = 0.08;
    p.box('pipe', [-0.045, 0.34, zw + 0.01, 0.045, LEVEL - 0.15, zw + 0.01 + d], alu, { metal: true });
    // The kick-out at the foot: a short run away from the wall, the outlet over the funnel.
    p.box('elbow', [-0.045, 0.24, zw + 0.01, 0.045, 0.34, zw + 0.01 + d], alu, { metal: true });
    p.box('shoe', [-0.045, 0.24, zw + 0.01 + d, 0.045, 0.32, -0.5], alu, { metal: true });
    for (const y of [0.75, 1.5]) p.box(`strap${y}`, [-0.06, y, zw, 0.06, y + 0.04, zw + 0.02 + d], flat(0x9a9a96), { metal: true });
    // The funnel under the outlet (tr_downspout_funnel), a container's mouth for rainwater.
    cyl(p, 'funnel', 'y', [0, SLAB + 0.09, -0.42], 0.035, 0.14, 10, layers(flat(0x8a8e92), sides(['top'], (ctx, x, y, w, h) => fill(ctx, x, y, w, h, 0x3a3e42))), { metal: true }, 0.13);
  } },
  { id: 't_pavement_y', desc: 'Streaks of carefully aligned yellow paint mark the road to inform drivers not to cross.', build: slab(layers(asphalt('t_pavement_y'), roadStripe)) },
  { id: 't_concrete', desc: 'A newer segment of poured concrete with surface finishes for aesthetics and resistance to freeze-thaw cycles.', build: slab(layers(speckle('t_concrete', 0xb4b4ae, [0xbcbcb6, 0xacaca6], 0.25), sides(['top'], (ctx, x, y, w, h) => { for (let j = 2; j < h; j += 4) fill(ctx, x, y + j, w, 1, 0xa8a8a2); }))) },
];

const ROOFS = [
  { id: 't_shingle_flat_roof', desc: 'A flat section of rooftop covered with shingles.', build: slab(masonry('t_shingle_flat_roof', { brick: 0x3e6a3a, mortar: 0x24401f, rows: 8, cols: 4, tones: [0x447240, 0x386234, 0x4a7a44] })) },
  { id: 't_flat_roof', desc: 'A flat, gray section of rooftop.', build: slab(layers(speckle('t_flat_roof', 0x5c5c5e, [0x666668, 0x525254, 0x707072], 0.6), sides(['top'], border(0x48484a)))) },
];

// --- walls: one tile, one level, full block --------------------------------------------------------

/** A wall block; `top` paints its top face (the section, below) instead of the face paint. */
const wall = (paint, { top, ...opts } = {}) => {
  const painter = top ? (ctx, x, y, w, h, side) => (side === 'top' ? top : paint)(ctx, x, y, w, h, side) : paint;
  return (p) => p.box('wall', [-0.5, 0, -0.5, 0.5, LEVEL, 0.5], painter, { ppm: 32, ...opts });
};

// --- wall tops: the cut through the wall ------------------------------------------------------------
// With the floor above cut away (Cataclysm-Vox's dollhouse view inside buildings) the camera looks
// down on the tops of the walls. A top drawn like the faces reads as more wall surface; it is drawn
// as a section, as on a floor plan: the finish of the faces as a thin edge all round (a wall tile can
// face any way), a dark cut line, and the structure inside, darker than the faces.

/** Section: `core` inside, `finish`-coloured edge and a dark cut line round it. */
const section = (core, finish) => (ctx, x, y, w, h) => {
  core(ctx, x, y, w, h, 'top');
  const e = Math.max(1, Math.round(w / 16));
  border(shade(finish, 0.55), e + 1)(ctx, x, y, w, h);
  border(finish, e)(ctx, x, y, w, h);
};

/** Timber-frame wall (painted walls): gypsum board inside the finish, studs across a dark cavity. */
const studCore = (id) => (ctx, x, y, w, h) => {
  fill(ctx, x, y, w, h, 0x4a3c2c);
  const g = Math.max(1, Math.round(w / 12));
  border(0xb8b2a6, g)(ctx, x + 2, y + 2, w - 4, h - 4);
  const r = rng(`${id}:studs`);
  const s = Math.max(2, Math.round(w / 6));
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    const cx = x + Math.round(((i + 1) * w) / 4 - s / 2), cy = y + Math.round(((j + 1) * h) / 4 - s / 2);
    fill(ctx, cx, cy, s, s, r() < 0.5 ? 0x8a6238 : 0x7e5830);
  }
};

/** Poured concrete: dark grey with aggregate; reinforced adds rebar ends on a grid. */
const concreteCore = (id, hex, rebar = false) => layers(
  speckle(`${id}:core`, shade(hex, 0.62), [shade(hex, 0.7), shade(hex, 0.55), shade(hex, 0.78)], 0.45),
  rebar ? (ctx, x, y, w, h) => { for (let j = 1; j < 4; j++) for (let i = 1; i < 4; i++) fill(ctx, x + Math.round((i * w) / 4) - 1, y + Math.round((j * h) / 4) - 1, 2, 2, 0x3a2a22); } : null,
);

/** Concrete block: blocks in courses, each with two hollow cells. */
const blockCore = (hex) => (ctx, x, y, w, h) => {
  const body = shade(hex, 0.66), cell = shade(hex, 0.38), mortar = shade(hex, 0.5);
  fill(ctx, x, y, w, h, mortar);
  const rows = 2, cols = 2, bw = w / cols, bh = h / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const bx = Math.round(x + i * bw) + 1, by = Math.round(y + j * bh) + 1, cw = Math.round(bw) - 2, ch = Math.round(bh) - 2;
    fill(ctx, bx, by, cw, ch, body);
    for (const k of [0, 1]) fill(ctx, bx + Math.round(cw * (0.1 + k * 0.44)), by + Math.round(ch * 0.25), Math.round(cw * 0.36), Math.round(ch * 0.5), cell);
  }
};

/** Brick seen from above: the bond (stretchers and headers), a shade darker than the face. */
const brickCore = (id, brick, mortar, tones) => masonry(`${id}:top`, { brick: shade(brick, 0.8), mortar: shade(mortar, 0.7), rows: 4, cols: 2, tones: tones.map((t) => shade(t, 0.8)) });

/** Plank wall seen from above: the board ends and the beam behind them. */
const timberCore = (id) => layers(
  planks(`${id}:top`, { wood: 0x6e4a2a, seam: 0x3a2614, n: 5, vertical: true, tones: [0x6e4a2a, 0x664426, 0x7a5230] }),
  (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * 0.42), w, Math.max(2, Math.round(h * 0.16)), 0x4a3018),
);

const plaster = (id, hex) => layers(speckle(id, hex, [shade(hex, 1.04), shade(hex, 0.95), shade(hex, 0.9)], 0.3), sides(['front', 'back', 'left', 'right'], (ctx, x, y, w, h) => fill(ctx, x, y + h - 3, w, 3, shade(hex, 0.72))));
const concrete = (id, hex) => layers(speckle(id, hex, [shade(hex, 1.05), shade(hex, 0.93)], 0.35), sides(['front', 'back', 'left', 'right'], grid(shade(hex, 0.78), 1, 2)));
const formTies = (hex) => sides(['front', 'back', 'left', 'right'], (ctx, x, y, w, h) => { for (let j = 1; j < 4; j++) for (let i = 1; i < 3; i++) fill(ctx, x + Math.round((i * w) / 3), y + Math.round((j * h) / 4), 2, 2, hex); });
const cinder = (id, hex) => masonry(id, { brick: hex, mortar: shade(hex, 0.8), rows: 10, cols: 2, tones: [shade(hex, 0.97), shade(hex, 1.03)] });

const PAINT = { w: 0xe6e4dc, gray: 0xa4a4a0, g: 0x5e8a54, y: 0xd8c050, b: 0x4a6aa8, black: 0x262628 };


// --- batch 2 walls: the rest of the census (docs/census/walls.csv) -------------------------------------

/** CDDA's paint colours for the painted walls of batch 2 (c_brown, c_red, c_light_red, …). */
const PAINT2 = { brown: 0x7a5636, r: 0xa83c32, orange: 0xcc7430, P: 0xd894ac, p: 0x7c4c9a, cyan: 0x4aa6ae, cream: 0xe2d6b8 };
const FACES = ['front', 'back', 'left', 'right'];

/** A painted timber-frame wall (as t_wall_w): plaster faces, studs and gypsum in section. */
const paintedWall = (id, hex, desc) => ({ id, desc, build: wall(plaster(id, hex), { top: section(studCore(id), hex) }) });
/** A painted reinforced concrete wall (as t_strconc_wall_w). */
const paintedStrconc = (id, hex, desc) => ({ id, desc, build: wall(layers(concrete(id, hex), formTies(shade(hex, 0.82))), { top: section(concreteCore(id, 0x8e8e8a, true), hex) }) });

const LOG = 0x7a5432;
/** Horizontal logs: each a light middle, a darker rim and a dark chink below. */
const logs = (id, wood = LOG, n = 7) => (ctx, x, y, w, h, side) => {
  const r = rng(`${id}:logs:${side}`);
  for (let j = 0; j < n; j++) {
    const a = Math.round((j * h) / n), b = Math.round(((j + 1) * h) / n), tone = shade(wood, 0.9 + r() * 0.2);
    fill(ctx, x, y + a, w, b - a, shade(tone, 0.8));
    fill(ctx, x, y + a + 1, w, Math.max(1, b - a - 3), tone);
    fill(ctx, x, y + a + Math.round((b - a) / 2) - 1, w, 1, shade(tone, 1.12));
    fill(ctx, x, y + b - 1, w, 1, 0x3a2a1a);
  }
};
/** Log ends (a log wall's section): rings round a dark heart, in dark chinking. */
const logEnds = (wood = LOG, n = 3) => (ctx, x, y, w, h) => {
  fill(ctx, x, y, w, h, 0x3a2a1a);
  const s = w / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const cx = Math.round(x + i * s), cy = Math.round(y + j * s), cs = Math.round(s);
    fill(ctx, cx + 1, cy + 1, cs - 2, cs - 2, shade(wood, 1.18));
    fill(ctx, cx + Math.round(cs * 0.3), cy + Math.round(cs * 0.3), Math.max(1, Math.round(cs * 0.4)), Math.max(1, Math.round(cs * 0.4)), shade(wood, 0.85));
  }
};

/** Steel sheet: near-uniform with a dark sealant line round each face. */
const steelSheet = (id, hex) => layers(speckle(id, hex, [shade(hex, 1.05), shade(hex, 0.95)], 0.15), sides(FACES, border(shade(hex, 0.55))));
/** Corrugated steel: vertical ribs (light crest, dark trough) in a dark frame. */
const corrugated = (hex) => (ctx, x, y, w, h, side) => {
  if (side === 'top' || side === 'bottom') return fill(ctx, x, y, w, h, shade(hex, 0.6));
  for (let i = 0; i < w; i++) fill(ctx, x + i, y, 1, h, i % 4 < 2 ? shade(hex, 1.12) : shade(hex, 0.78));
  fill(ctx, x, y, w, 2, 0x4a4a4c);
  fill(ctx, x, y + h - 2, w, 2, 0x4a4a4c);
};
/** Scrap plates: overlapping sheets of mixed greys with rivets; `rust` adds rust and wire ties. */
const patchwork = (id, tones, { rust = false } = {}) => (ctx, x, y, w, h, side) => {
  const r = rng(`${id}:patch:${side}`);
  fill(ctx, x, y, w, h, shade(tones[0], 0.7));
  for (let k = 0; k < 7; k++) {
    const pw = Math.round(w * (0.35 + r() * 0.4)), ph = Math.round(h * (0.2 + r() * 0.3));
    const px = x + Math.floor(r() * (w - pw + 1)), py = y + Math.floor(r() * (h - ph + 1)), tone = tones[k % tones.length];
    fill(ctx, px, py, pw, ph, shade(tone, 0.6));
    fill(ctx, px + 1, py + 1, pw - 2, ph - 2, tone);
    for (const [rx, ry] of [[px + 2, py + 2], [px + pw - 3, py + 2], [px + 2, py + ph - 3], [px + pw - 3, py + ph - 3]]) fill(ctx, rx, ry, 1, 1, 0xc8c8c4);
    if (rust) for (let q = 0; q < (pw * ph) / 6; q++) if (r() < 0.5) fill(ctx, px + 1 + Math.floor(r() * (pw - 2)), py + 1 + Math.floor(r() * (ph - 2)), 1, 1, r() < 0.5 ? 0x8a4a22 : 0x6a3a1a);
  }
  if (rust) for (let k = 0; k < 4; k++) fill(ctx, x + Math.floor(r() * (w - 3)), y + Math.floor(r() * (h - 2)), 3, 1, 0xb0b0aa);
};
/** Rubble stone: irregular stones of uneven length in rough courses, wide mortar. */
const stones = (id, base, mortar, rows = 7) => (ctx, x, y, w, h, side) => {
  const r = rng(`${id}:stones:${side}`);
  fill(ctx, x, y, w, h, mortar);
  const rh = h / rows;
  for (let j = 0; j < rows; j++) {
    let i = -Math.floor(r() * 4);
    while (i < w) {
      const len = 3 + Math.floor(r() * Math.max(3, w / 3));
      const x0 = Math.max(x, x + i + 1), x1 = Math.min(x + w, x + i + len);
      if (x1 > x0) fill(ctx, x0, Math.round(y + j * rh) + 1, x1 - x0, Math.max(1, Math.round(rh) - 1 - Math.floor(r() * 2)), shade(base, 0.82 + r() * 0.3));
      i += len;
    }
  }
};
/** Natural rock: mottled stone with cracks. */
const rockFace = (id, hex) => layers(speckle(id, hex, [shade(hex, 1.12), shade(hex, 0.86), shade(hex, 0.74)], 0.55), cracks(id, shade(hex, 0.5), 4));
/** Earth, packed or rammed; `glisten` adds a damp sheen. */
const earth = (id, hex, glisten = false) => layers(speckle(id, hex, [shade(hex, 1.1), shade(hex, 0.88), shade(hex, 0.78)], 0.5),
  glisten ? (ctx, x, y, w, h, side) => { const r = rng(`${id}:sheen:${side}`); for (let k = 0; k < (w * h) / 40; k++) fill(ctx, x + Math.floor(r() * w), y + Math.floor(r() * h), 1, 1, 0xd8cc9a); } : null);
/** Wasp paper: wavy bands of grey and beige pulp, with glossy saliva. */
const waspPaper = (id) => (ctx, x, y, w, h, side) => {
  const r = rng(`${id}:paper:${side}`);
  const tones = [0xd8d4c8, 0xc4beb0, 0xb0aa9c, 0xe4e0d6, 0x9e988a];
  let tone = tones[0];
  for (let j = 0; j < h; j++) {
    if (r() < 0.45) tone = tones[Math.floor(r() * tones.length)];
    const wave = Math.round(Math.sin((j / h) * 9 + r()) * 2);
    fill(ctx, x, y + j, w, 1, tone);
    fill(ctx, x + Math.max(0, Math.round(w / 2) + wave * 3), y + j, Math.max(1, Math.round(w / 3)), 1, shade(tone, 0.9));
  }
  for (let k = 0; k < (w * h) / 50; k++) fill(ctx, x + Math.floor(r() * w), y + Math.floor(r() * h), 1, 1, 0xf4f2e8);
};
/** Stakes (palisade): vertical logs side by side, bark-dark seams, a cable band. */
const stakes = (id, n = 5) => layers(planks(`${id}:stakes`, { wood: 0x7e5634, seam: 0x3a2614, n, vertical: true, tones: [0x7e5634, 0x744e2e, 0x8a603a] }),
  sides(FACES, (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * 0.3), w, Math.max(1, Math.round(h * 0.03)), 0x2a2a2a)));
/** Glass with wire mesh embedded (reinforced glass). */
const wired = (tint) => layers(glass(tint), (ctx, x, y, w, h) => {
  const s = Math.max(3, Math.round(Math.min(w, h) / 12));
  for (let i = s; i < w; i += s) fill(ctx, x + i, y, 1, h, shade(tint, 0.6));
  for (let j = s; j < h; j += s) fill(ctx, x, y + j, w, 1, shade(tint, 0.6));
});

/**
 * A glass wall: a frame round panes (as t_wall_glass). `pane` paints the glass, `t` its half
 * thickness; `alarm` adds a glass-break sensor and its wire on the frame.
 */
const glassWall = ({ frame = 0x9aa0a4, pane = glass(0xa8d4e0), t = 0.02, alarm = false, edge = null } = {}) => (p) => {
  const al = flat(frame);
  p.box('sill', [-0.5, 0, -0.08, 0.5, 0.08, 0.08], al, { metal: true });
  p.box('head', [-0.5, LEVEL - 0.08, -0.08, 0.5, LEVEL, 0.08], al, { metal: true });
  for (const x of [-0.5, 0.46]) p.box(`mullion${x}`, [x, 0.08, -0.08, x + 0.04, LEVEL - 0.08, 0.08], al, { metal: true });
  p.box('pane', [-0.46, 0.08, -t, 0.46, LEVEL - 0.08, t], edge ? (ctx, x, y, w, h, side) => (FACES.includes(side) && (side === 'left' || side === 'right') || side === 'top' || side === 'bottom' ? edge : pane)(ctx, x, y, w, h, side) : pane, { glass: true });
  if (alarm) {
    p.box('alarm-sensor', [0.3, LEVEL - 0.26, -0.06, 0.38, LEVEL - 0.18, -0.03], flat(0xf4f4f0));
    p.box('alarm-wire', [0.33, LEVEL - 0.18, -0.055, 0.35, LEVEL - 0.08, -0.045], flat(0x2a2a2a));
  }
};

const PAL_H = LEVEL - 0.3;
/** Sharpened stake tips standing on a palisade block of height `h` (a grid of n × n stakes). */
const stakeTips = (p, h, n = 4) => {
  const s = 1 / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const cx = -0.5 + (i + 0.5) * s, cz = -0.5 + (j + 0.5) * s, a = s * 0.42, b = s * 0.2;
    p.box(`tip${i}${j}`, [cx - a, h, cz - a, cx + a, h + 0.14, cz + a], flat(0x7e5634));
    p.box(`point${i}${j}`, [cx - b, h + 0.14, cz - b, cx + b, h + 0.28, cz + b], flat(0x9a7048));
  }
};
/** A wall with an embrasure: a cross-shaped firing slit through it, 0.24 m wide, at chest height. */
const embrasureWall = (paint, top, height) => (p) => {
  const y0 = 1.05, y1 = 1.35, g = 0.12;
  p.box('below', [-0.5, 0, -0.5, 0.5, y0, 0.5], paint, { ppm: 32 });
  p.box('above', [-0.5, y1, -0.5, 0.5, height, 0.5], (ctx, x, y, w, h, side) => (side === 'top' ? top : paint)(ctx, x, y, w, h, side), { ppm: 32 });
  for (const [x0, x1] of [[-0.5, -g], [g, 0.5]]) for (const [z0, z1] of [[-0.5, -g], [g, 0.5]]) p.box(`pier${x0}${z0}`, [x0, y0, z0, x1, y1, z1], paint, { ppm: 32 });
};

/** Raised veins in a grid with knots where they cross, on all four faces (overgrown wall). */
const veins = (p) => {
  const v = flat(0x7a2238), knot = flat(0xa8445a), d = 0.035;
  for (const [axis, sign] of [['z', -1], ['z', 1], ['x', -1], ['x', 1]]) {
    const at = (u0, y0, u1, y1, out) => (axis === 'z'
      ? [u0, y0, sign < 0 ? -0.5 - out : 0.5, u1, y1, sign < 0 ? -0.5 : 0.5 + out]
      : [sign < 0 ? -0.5 - out : 0.5, y0, u0, sign < 0 ? -0.5 : 0.5 + out, y1, u1]);
    for (const y of [0.55, 1.35]) p.box(`vein-h${axis}${sign}${y}`, at(-0.5, y - 0.025, 0.5, y + 0.025, d), v);
    for (const u of [-0.22, 0.26]) p.box(`vein-v${axis}${sign}${u}`, at(u - 0.025, 0, u + 0.025, LEVEL, d), v);
    for (const y of [0.55, 1.35]) for (const u of [-0.22, 0.26]) p.box(`knot${axis}${sign}${y}${u}`, at(u - 0.06, y - 0.06, u + 0.06, y + 0.06, d + 0.05), knot);
  }
};
/** Fungal tendrils piercing straight through the wall and out of both faces. */
const tendrils = (p) => {
  const flesh = speckle('fungus-tendril', 0x9a8c6a, [0xa89a76, 0x847658, 0xb4a888], 0.4), tip = flat(0x5a5040);
  // "Several thick, large tendrils": five, 0.2–0.3 m across, through both axes.
  for (const [k, [axis, u, y]] of [['x', -0.22, 0.55], ['z', 0.2, 1.0], ['x', 0.24, 1.5], ['z', -0.26, 1.7], ['x', 0.0, 0.25]].entries()) {
    const t = 0.1 + (k % 3) * 0.025;
    // Two segments, the second a little off line: grown, not built.
    const seg = (a0, a1, du, dy) => (axis === 'x' ? [a0, y + dy - t, u + du - t, a1, y + dy + t, u + du + t] : [u + du - t, y + dy - t, a0, u + du + t, y + dy + t, a1]);
    p.box(`tendril${k}a`, seg(-0.72, 0.05, 0, 0), flesh);
    p.box(`tendril${k}b`, seg(0.05, 0.7, 0.04, 0.05), flesh);
    p.box(`tendril${k}tip`, seg(0.7, 0.8, 0.04, 0.05), tip);
  }
};

const WALLS = [
  { id: 't_concrete_wall', desc: 'An aesthetically pleasing design with simple lines, this type of concrete was used with a weaker chemical mixture in order to have faster setting time.', build: wall(concrete('t_concrete_wall', 0x5e5e5c), { top: section(concreteCore('t_concrete_wall', 0x5e5e5c), 0x5e5e5c) }) },
  { id: 't_nether_glass_wall', desc: 'An endless expanse of black glass.  It perfectly reflects the darkness around it.', build: wall(layers(flat(0x0c0c12), glass(0x0c0c12)), { metal: true, top: section(flat(0x050508), 0x0c0c12) }) },
  { id: 't_wall_w', desc: 'A wall, painted white.', build: wall(plaster('t_wall_w', PAINT.w), { top: section(studCore('t_wall_w'), PAINT.w) }) },
  { id: 't_brick_wall', desc: 'A solid brick wall, sturdy enough to support a roof with enough walls and to keep out any unwanted visitors.', build: wall(masonry('t_brick_wall', { brick: 0x9a4a32, mortar: 0xb8ac98, rows: 26, cols: 4, tones: [0x8a4030, 0xa45438, 0x7e3a2a] }), { top: section(brickCore('t_brick_wall', 0x9a4a32, 0xb8ac98, [0x8a4030, 0xa45438, 0x7e3a2a]), 0x9a4a32) }) },
  { id: 't_strconc_wall_w', desc: 'A reinforced concrete wall, painted white.', build: wall(layers(concrete('t_strconc_wall_w', PAINT.w), formTies(0xbcbab2)), { top: section(concreteCore('t_strconc_wall_w', 0x8e8e8a, true), PAINT.w) }) },
  { id: 't_concrete_wall_w', desc: 'A concrete wall, painted white.', build: wall(concrete('t_concrete_wall_w', PAINT.w), { top: section(concreteCore('t_concrete_wall_w', 0x8e8e8a), PAINT.w) }) },
  { id: 't_wall_gray', desc: 'A wall, painted gray.', build: wall(plaster('t_wall_gray', PAINT.gray), { top: section(studCore('t_wall_gray'), PAINT.gray) }) },
  { id: 't_wall_g', desc: 'A wall, painted green.', build: wall(plaster('t_wall_g', PAINT.g), { top: section(studCore('t_wall_g'), PAINT.g) }) },
  { id: 't_sconc_wall_w', desc: 'A simple concrete wall, painted white.', build: wall(cinder('t_sconc_wall_w', PAINT.w), { top: section(blockCore(0x9a9a94), PAINT.w) }) },
  { id: 't_wall_wood', desc: 'A finished wall of planks and support beams, capable of supporting an upper level or roof.  Highly flammable.', build: wall(layers(planks('t_wall_wood', { wood: 0x9a6a3e, seam: 0x5a3a20, n: 10, vertical: false, tones: [0x9a6a3e, 0x8e6238, 0xa4744a] }), sides(['front', 'back', 'left', 'right'], (ctx, x, y, w, h) => { fill(ctx, x, y, 3, h, 0x6a4626); fill(ctx, x + w - 3, y, 3, h, 0x6a4626); })), { top: section(timberCore('t_wall_wood'), 0x9a6a3e) }) },
  { id: 't_concrete_wall_gray', desc: 'A concrete wall, painted gray.', build: wall(concrete('t_concrete_wall_gray', PAINT.gray), { top: section(concreteCore('t_concrete_wall_gray', 0x8e8e8a), PAINT.gray) }) },
  { id: 't_strconc_wall_gray', desc: 'A reinforced concrete wall, painted gray.', build: wall(layers(concrete('t_strconc_wall_gray', PAINT.gray), formTies(0x8a8a86)), { top: section(concreteCore('t_strconc_wall_gray', 0x8e8e8a, true), PAINT.gray) }) },
  { id: 't_wall_glass', desc: "A barrier made of glass, it's nothing complicated, and looks extremely fragile.", build: (p) => {
    // Aluminium frame, glass panes between the mullions.
    const al = flat(0x9aa0a4);
    p.box('sill', [-0.5, 0, -0.08, 0.5, 0.08, 0.08], al, { metal: true });
    p.box('head', [-0.5, LEVEL - 0.08, -0.08, 0.5, LEVEL, 0.08], al, { metal: true });
    for (const x of [-0.5, 0.46]) p.box(`mullion${x}`, [x, 0.08, -0.08, x + 0.04, LEVEL - 0.08, 0.08], al, { metal: true });
    p.box('pane', [-0.46, 0.08, -0.02, 0.46, LEVEL - 0.08, 0.02], glass(0xa8d4e0), { glass: true });
  } },
  { id: 't_wall_y', desc: 'A wall, painted yellow.', build: wall(plaster('t_wall_y', PAINT.y), { top: section(studCore('t_wall_y'), PAINT.y) }) },
  { id: 't_wall_b', desc: 'A wall, painted blue.', build: wall(plaster('t_wall_b', PAINT.b), { top: section(studCore('t_wall_b'), PAINT.b) }) },
  { id: 't_sconc_wall_gray', desc: 'A simple concrete wall, painted gray.', build: wall(cinder('t_sconc_wall_gray', PAINT.gray), { top: section(blockCore(0x9a9a94), PAINT.gray) }) },
  // CDDA's colour for it is yellow (a data slip); the description says black.
  { id: 't_wall_black', desc: 'A wall, painted black.', build: wall(plaster('t_wall_black', PAINT.black), { top: section(studCore('t_wall_black'), PAINT.black) }) },
  { id: 't_strconc_wall', desc: 'An extremely resilient wall, filled with concrete and rebar.', build: wall(layers(concrete('t_strconc_wall', 0x7c7c78), formTies(0x5a5a56)), { top: section(concreteCore('t_strconc_wall', 0x7c7c78, true), 0x7c7c78) }) },
  // Batch 2 (docs/census/walls.csv): the walls left after batch 1, each after its CDDA description.
  paintedWall('t_wall_brown', PAINT2.brown, 'A wall, painted brown.'),
  paintedWall('t_wall_r', PAINT2.r, 'A wall, painted red.'),
  paintedWall('t_wall_orange', PAINT2.orange, 'A wall, painted orange.'),
  paintedWall('t_wall_P', PAINT2.P, 'A wall, painted pink.'),
  paintedWall('t_wall_p', PAINT2.p, 'A wall, painted purple.'),
  paintedWall('t_wall_cyan', PAINT2.cyan, 'A wall, painted cyan.'),
  // The bare standard wall: cream paint, studs and insulation behind the drywall.
  paintedWall('t_wall', PAINT2.cream, 'A standard wall consisting of a wooden support structure filled with insulation and drywalled.  Painted a neutral off-white or cream color, it could use some more vibrant paint.  Looks flammable.'),
  paintedStrconc('t_strconc_wall_b', PAINT.b, 'A reinforced concrete wall, painted blue.'),
  paintedStrconc('t_strconc_wall_orange', PAINT2.orange, 'A reinforced concrete wall, painted orange.'),
  paintedStrconc('t_strconc_wall_black', PAINT.black, 'A reinforced concrete wall, painted black.'),
  { id: 't_sconc_wall', desc: 'A durable and uniform concrete wall, quite drab without decoration.  More than capable of supporting a roof, as well as keeping out most anything, save for vehicles.', build: wall(cinder('t_sconc_wall', 0xa0a09a), { top: section(blockCore(0xa0a09a), 0xa0a09a) }) },
  { id: 't_concrete_wall_flesh', desc: 'A concrete wall overgrown by a grotesque grid of veins and knotted flesh.', build: (p) => {
    wall(layers(concrete('t_concrete_wall_flesh', 0x6e6466), speckle('t_concrete_wall_flesh:stain', 0x6e6466, [0x7a4a52, 0x6a3a44], 0.12)), { top: section(concreteCore('t_concrete_wall_flesh', 0x6e6466), 0x7a2238) })(p);
    veins(p);
  } },
  { id: 't_rock_wall', desc: 'A sturdy stone wall.', build: wall(stones('t_rock_wall', 0x9a9890, 0x6a6862), { top: section(stones('t_rock_wall:top', 0x7a7872, 0x4a4844, 4), 0x9a9890) }) },
  { id: 't_wall_log', desc: 'A tall wall of timber suitable for housing and insulating from the weather.  Quite flammable.', build: wall(logs('t_wall_log'), { top: section(logEnds(), shade(LOG, 0.8)) }) },
  { id: 't_wall_metal', desc: 'An industrially fabricated thick sheet carefully positioned and joined seamlessly with perimeter sealant, this wall is capable of resisting extreme elements as well as hostile forces.  Blast load rated and extremely fire-retardant, breaching it will require specialized tools or an industrial vehicle.', build: wall(steelSheet('t_wall_metal', 0x8a9298), { metal: true, top: section(speckle('t_wall_metal:core', 0x4e5458, [0x565c60, 0x464c50], 0.3), 0x8a9298) }) },
  { id: 't_wall_metal_corrugated', desc: 'A wall made from a thin sheet of corrugated steel held in a frame, weather- and windproof but not very insulating or durable.', build: wall(corrugated(0x9aa2a8), { metal: true, top: section(layers(flat(0x2a2a2c), grid(0x6a6a6c, 2, 2)), 0x9aa2a8) }) },
  { id: 't_scrap_wall', desc: "A relatively simple wall made of cobbled-together scrap metal.  It's still capable of blocking intruders and supporting a roof with adjacent walls.", build: wall(patchwork('t_scrap_wall', [0x6a6c6e, 0x7c7e80, 0x5a5c5e, 0x84868a]), { metal: true, top: section(layers(flat(0x2a2a2c), grid(0x5a5c5e, 2, 3)), 0x6a6c6e) }) },
  { id: 't_junk_wall', desc: 'A wall of rusty scrap metal bolted and wire-tied to a sturdy frame.  Very fashionable in post-apocalyptic shantytowns.  Can support a roof.', build: wall(patchwork('t_junk_wall', [0x6a5a4a, 0x7a6a5a, 0x5e5a56, 0x8a5a3a], { rust: true }), { metal: true, top: section(layers(flat(0x2a2622), grid(0x6a4a2a, 2, 3)), 0x7a5a3e) }) },
  { id: 't_wall_dirt', desc: 'A solid wall of compressed dirt, mixed with… something to keep it stable.  Its surface glistens slightly, and it smells like rotten milk.', build: wall(earth('t_wall_dirt', 0x6e5236, true), { top: section(earth('t_wall_dirt:top', 0x5a4430), 0x6e5236) }) },
  { id: 't_soil', desc: 'Solid earth (underground; no description in CDDA beyond its name).', build: wall(earth('t_soil', 0x5e4a34), { top: section(earth('t_soil:top', 0x4e3e2c), 0x5e4a34) }) },
  { id: 't_paper', desc: 'A huge wall of ambiguous pulpy matter, covered in sticky wasp saliva.  You could smash it down effortlessly.', build: wall(waspPaper('t_paper'), { top: section(waspPaper('t_paper:top'), 0xc4beb0) }) },
  { id: 't_fungus_wall', desc: 'Several thick, large tendrils of fungus perforate the wall here, piercing straight through it from the outside.  Despite the apparent damage, the wall is still structurally sound.', build: (p) => {
    wall(layers(concrete('t_fungus_wall', 0x3e3e40), cracks('t_fungus_wall', 0x222224, 3)), { top: section(concreteCore('t_fungus_wall', 0x5a5a5c), 0x3e3e40) })(p);
    tendrils(p);
  } },
  { id: 't_rock_red', desc: 'A wall of red stone.', build: wall(rockFace('t_rock_red', 0x9a4a3a), { top: section(rockFace('t_rock_red:top', 0x6e3428), 0x9a4a3a) }) },
  { id: 't_rock_blue', desc: 'A wall of blue stone.', build: wall(rockFace('t_rock_blue', 0x4a5a8a), { top: section(rockFace('t_rock_blue:top', 0x34405e), 0x4a5a8a) }) },
  { id: 't_rock_green', desc: 'A wall of green stone.', build: wall(rockFace('t_rock_green', 0x4a7a4a), { top: section(rockFace('t_rock_green:top', 0x345634), 0x4a7a4a) }) },
  { id: 't_wall_wood_chipped', desc: "A wall of aligned planks that's starting to crack and break open.  Some replacement wood and a number of nails could patch this up quick.", build: wall(layers(planks('t_wall_wood_chipped', { wood: 0x9a6a3e, seam: 0x5a3a20, n: 10, vertical: false, tones: [0x9a6a3e, 0x8e6238, 0xa4744a] }), cracks('t_wall_wood_chipped', 0x2a1a0e, 5), sides(FACES, (ctx, x, y, w, h, side) => {
    // Broken-out plank ends: dark gaps where the wall is opening up.
    const r = rng(`chipped:${side}`);
    for (let k = 0; k < 3; k++) fill(ctx, x + Math.floor(r() * (w - 6)), y + Math.floor(r() * (h - 3)), 4 + Math.floor(r() * 4), 2, 0x1e140a);
  })), { top: section(layers(timberCore('t_wall_wood_chipped'), cracks('t_wall_wood_chipped:top', 0x1e140a, 2)), 0x9a6a3e) }) },
  { id: 't_palisade', desc: 'An age-old type of fortification consisting of hefty lumber staked into the ground and cabled together.', build: (p) => {
    p.box('stakes', [-0.5, 0, -0.5, 0.5, PAL_H, 0.5], (ctx, x, y, w, h, side) => (side === 'top' ? section(logEnds(0x7e5634, 4), 0x7e5634) : stakes('t_palisade'))(ctx, x, y, w, h, side), { ppm: 32 });
    stakeTips(p, PAL_H);
  } },
  { id: 't_palisade_embrasure', desc: 'An age-old type of fortification consisting of hefty lumber staked into the ground and cabled together.  This section in particular has an embrasure, so you can shoot or use reach weapons through it while staying safe.', build: (p) => {
    embrasureWall(stakes('t_palisade_embrasure'), section(logEnds(0x7e5634, 4), 0x7e5634), PAL_H)(p);
    stakeTips(p, PAL_H);
  } },
  { id: 't_embrasure_log', desc: 'This timber wall has a hole that lets you shoot through and use reach weapons against enemies on the other side, while also protecting you.  Quite flammable.', build: embrasureWall(logs('t_embrasure_log'), section(logEnds(), shade(LOG, 0.8)), LEVEL) },
  // Columns and supports stand inside a tile: their own cross-section is the plan view.
  { id: 't_column', desc: 'A concrete column.', build: (p) => p.box('column', [-0.3, 0, -0.3, 0.3, LEVEL, 0.3], (ctx, x, y, w, h, side) => (side === 'top' ? section(concreteCore('t_column', 0x9a9a96), 0xb4b4ae) : layers(speckle('t_column', 0xb4b4ae, [0xbcbcb6, 0xa8a8a2], 0.3), grid(0x9a9a94, 1, 4)))(ctx, x, y, w, h, side), { ppm: 32 }) },
  { id: 't_little_column', desc: 'A small support column.', build: (p) => p.box('column', [-0.16, 0, -0.16, 0.16, LEVEL, 0.16], (ctx, x, y, w, h, side) => (side === 'top' ? section(concreteCore('t_little_column', 0x9a9a96), 0xb4b4ae) : speckle('t_little_column', 0xb4b4ae, [0xbcbcb6, 0xa8a8a2], 0.3))(ctx, x, y, w, h, side), { ppm: 32 }) },
  { id: 't_support_l', desc: 'A heavy-duty metal support beam.', build: (p) => {
    // A wide-flange (H) section on a base plate.
    const steel = steelSheet('t_support_l', 0x8a9096);
    p.box('base', [-0.3, 0, -0.3, 0.3, 0.04, 0.3], steel, { metal: true });
    for (const z of [-0.22, 0.17]) p.box(`flange${z}`, [-0.22, 0.04, z, 0.22, LEVEL, z + 0.05], steel, { metal: true });
    p.box('web', [-0.03, 0.04, -0.17, 0.03, LEVEL, 0.17], steel, { metal: true });
  } },
  // Glass walls (as t_wall_glass): lab glass in a white frame, wired and laminated glass thicker.
  { id: 't_wall_glass_lab', desc: "A barrier made of glass, it's nothing complicated, and looks extremely fragile.  Some contain glass break sensors or window sensors that trigger an alarm if the glass is damaged.", build: glassWall({ frame: 0xe4e4e0 }) },
  { id: 't_wall_glass_alarm', desc: "A barrier made of glass, it's nothing complicated, and looks extremely fragile.  Some contain glass break sensors or window sensors that trigger an alarm if the glass is damaged.", build: glassWall({ alarm: true }) },
  { id: 't_reinforced_glass', desc: 'A thicker pane of glass with thin metal wires embedded throughout, strengthening the structural properties.  Still weaker than other types of walls, and not made to support a roof either.', build: glassWall({ pane: wired(0x9ccad6), t: 0.03, frame: 0x7a8086 }) },
  { id: 't_reinforced_glass_lab', desc: 'A thicker pane of glass with thin metal wires embedded throughout, strengthening the structural properties.  Still weaker than other types of walls, and not made to support a roof either.  Not the type of glass to stop a bullet, you realize.', build: glassWall({ pane: wired(0x9ccad6), t: 0.03, frame: 0xe4e4e0 }) },
  { id: 't_laminated_glass', desc: 'A laminated glass barrier, composed of layers of glass and plastic held together by an interlayer.', build: glassWall({ pane: glass(0x9cd0c4), t: 0.035, edge: (ctx, x, y, w, h) => { const b = Math.max(1, Math.round(Math.min(w, h) / 3)); fill(ctx, x, y, w, h, 0x9cd0c4); fill(ctx, x + b, y, Math.max(1, w - 2 * b), h, 0xe8ecd8); } }) },
];

// --- stairs (CDDA's up and down stairs are one flight: the up tile below, the down tile above) -----
// The up tile carries the whole flight, a level high in ten steps rising toward −Z; the down tile
// is the opening above it with guard rails (its steps are the flight of the tile below, seen
// through the opening), open at −Z where the flight arrives.

const STEPS = 10;
const treadP = layers(planks('stairs:tread', { wood: 0x9a6a3a, seam: 0x5a3a1e, n: 3, vertical: false, tones: [0x9a6a3a, 0x8e6034, 0xa47444] }), sides(['top'], (ctx, x, y, w, h) => fill(ctx, x, y, w, Math.max(1, Math.round(h * .15)), 0x5a3a1e)));
const stringerP = speckle('stairs:stringer', 0x6e4a2a, [0x7a5432, 0x62422a], .3);
const railP = speckle('stairs:rail', 0x8a5e36, [0x9a6a3e, 0x7a5230], .3);
const floorP = layers(planks('stairs:floor', { wood: 0x9a6a3a, seam: 0x5a3a1e, n: 4, vertical: false, tones: [0x9a6a3a, 0x8e6034, 0xa47444] }), sides(['top'], grid(0x5a3a1e, 2, 1)));
const concreteP = speckle('stairs:concrete', 0xa0a09a, [0xa8a8a2, 0x96968e], .35);
const pipeP = speckle('stairs:pipe', 0x9aa0a4, [0xa8aeb2, 0x8a9094], .2);

/** A slanted board from (z0, y0) to (z1, y1) between x0 and x1, `t` deep (a stringer, a rail). */
const slant = (p, name, x0, x1, [z0, y0], [z1, y1], t, paint, opts) => {
  const pts = [];
  for (const x of [x0, x1]) for (const d of [0, t]) pts.push(V(x, y0 - d, z0), V(x, y1 - d, z1));
  hull(p, name, pts, paint, opts);
};

/** Guard rails round an opening: posts and two rails on the given sides of [x0, z0]–[x1, z1]. */
const guardRails = (p, [x0, z0, x1, z1], which, paint, { post = .05, rail = .04, opts = {} } = {}) => {
  const H = .95;
  const lines = { e: [[x1, z0], [x1, z1]], w: [[x0, z0], [x0, z1]], s: [[x0, z1], [x1, z1]], n: [[x0, z0], [x1, z0]] };
  const posts = new Set();
  for (const side of which) {
    const [[ax, az], [bx, bz]] = lines[side];
    for (const [px, pz] of [[ax, az], [bx, bz]]) posts.add(`${px},${pz}`);
    for (const y of [H, H * .5]) p.box(`rail-${side}-${y}`, [Math.min(ax, bx) - rail / 2, y - rail / 2, Math.min(az, bz) - rail / 2, Math.max(ax, bx) + rail / 2, y + rail / 2, Math.max(az, bz) + rail / 2], paint, opts);
  }
  for (const k of posts) { const [px, pz] = k.split(',').map(Number); p.box(`post${k}`, [px - post / 2, 0, pz - post / 2, px + post / 2, H + post / 2, pz + post / 2], paint, opts); }
};

/** Balustrade round an opening: newel posts at the corners, a handrail on top, balusters below. */
const balustrade = (p, [x0, z0, x1, z1], which, paint) => {
  const H = .92, r = .05, b = .025, newel = .08, gap = .11;
  const lines = { e: [[x1, z0], [x1, z1]], w: [[x0, z0], [x0, z1]], s: [[x0, z1], [x1, z1]], n: [[x0, z0], [x1, z0]] };
  const posts = new Set();
  for (const side of which) {
    const [[ax, az], [bx, bz]] = lines[side];
    posts.add(`${ax},${az}`); posts.add(`${bx},${bz}`);
    p.box(`hand-${side}`, [Math.min(ax, bx) - r / 2, H - r, Math.min(az, bz) - r / 2, Math.max(ax, bx) + r / 2, H, Math.max(az, bz) + r / 2], paint);
    p.box(`shoe-${side}`, [Math.min(ax, bx) - r / 2, SLAB, Math.min(az, bz) - r / 2, Math.max(ax, bx) + r / 2, SLAB + .04, Math.max(az, bz) + r / 2], paint);
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / gap) - 1);
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      p.box(`bal-${side}${i}`, [x - b / 2, SLAB + .04, z - b / 2, x + b / 2, H - r, z + b / 2], paint);
    }
  }
  for (const k of posts) {
    const [px, pz] = k.split(',').map(Number);
    p.box(`newel${k}`, [px - newel / 2, 0, pz - newel / 2, px + newel / 2, H + .04, pz + newel / 2], paint);
    p.box(`cap${k}`, [px - newel / 2 - .015, H + .04, pz - newel / 2 - .015, px + newel / 2 + .015, H + .07, pz + newel / 2 + .015], paint);
  }
};

/** The flight going down through the opening: the same flight as the up tile of the level below
 *  (top step flush with this floor at −Z, the foot a level down at +Z), a hair narrower and lower
 *  so that, when the level below is drawn too, its own flight covers this one without flicker. */
const descent = (p, tread, stringer, opts = {}) => {
  const run = 1 / STEPS, rise = LEVEL / STEPS, e = .004, base = -LEVEL + SLAB;
  for (let i = 0; i < STEPS; i++) p.box(`down${i}`, [-.4, base, .5 - (i + 1) * run, .4, base + (i + 1) * rise - e, .5 - i * run], tread, { ppm: 32, ...opts });
  for (const s of [-1, 1]) slant(p, `dstringer${s}`, s < 0 ? -.42 : .4, s < 0 ? -.4 : .42, [.5, base + .28], [-.5, SLAB - e], .3, stringer, opts);
};

/** The opening at the top of a flight: floor strips beside it, joists lining it, rails round it. */
const stairwell = (p, { floor, lining, rails, railOpts }) => {
  const W = .42;
  for (const s of [-1, 1]) p.box(`floor${s}`, [s < 0 ? -.5 : W, 0, -.5, s < 0 ? -W : .5, SLAB, .5], floor, { ppm: 32 });
  // The cut floor's depth inside the opening (joists), so it does not read as paper.
  for (const s of [-1, 1]) p.box(`lining${s}`, [s < 0 ? -W : W - .02, -.25, -.5, s < 0 ? -W + .02 : W, SLAB, .5], lining, { ppm: 32 });
  p.box('lining-s', [-W, -.25, .48, W, SLAB, .5], lining, { ppm: 32 });
  if (rails) guardRails(p, [-W, -.5, W, .5], ['e', 'w', 's'], rails, railOpts);
};

// --- the 2×2 stairwell: a spiral stair ---------------------------------------------------------
// CDDA's apartment blocks, megastores and mines put their stairs in a 2×2 well (four `<` below,
// four `>` above). Two metres square is too small for a straight or dog-leg flight a level high,
// but just right for a spiral: twelve wedge treads round a centre pole, a full turn, the first
// tread at +Z (where the well opens), the last flush with the floor above at 330°, a landing plate
// from it to the well's +Z edge. Engines draw these over the four tiles of such a group (meshset
// `groupOf` + `footprint`), turned so +Z faces the open side; the origin is the group's centre.

const SPIRAL = { n: 12, r0: .09, r1: .9, tread: .05, pole: .07 };
const sp = (θ, r) => [Math.sin(θ) * r, Math.cos(θ) * r];

/** The spiral's treads, `dy` below this level and `inset` narrower/lower (the copy seen from above). */
const spiralTreads = (p, paint, { dy = 0, inset = 0, opts = {} } = {}) => {
  const { n, r0, r1, tread } = SPIRAL, step = (2 * Math.PI) / n, rise = LEVEL / n;
  for (let i = 0; i < n; i++) {
    const θ = i * step, top = dy + (i + 1) * rise - inset * .1, R = r1 - inset;
    const pts = [];
    for (const y of [top - tread, top]) {
      for (const a of [θ - step / 2, θ + step / 2]) { const [x, z] = sp(a, r0); pts.push(V(x, y, z)); }
      for (const a of [θ - step / 2, θ, θ + step / 2]) { const [x, z] = sp(a, R); pts.push(V(x, y, z)); }
    }
    hull(p, `tread${dy ? 'd' : ''}${i}`, pts, paint, { ppm: 32, ...opts });
  }
};

/** The outer balusters and the helical handrail, over treads 0 … n−2 (the last is the landing). */
const spiralRail = (p, paint, opts = {}) => {
  const { n, r1 } = SPIRAL, step = (2 * Math.PI) / n, rise = LEVEL / n, H = .9, b = .025, R = r1 - .04;
  for (let i = 0; i < n - 1; i++) {
    const [x, z] = sp(i * step, R), h = (i + 1) * rise;
    p.box(`sbal${i}`, [x - b / 2, h, z - b / 2, x + b / 2, h + H, z + b / 2], paint, opts);
    if (i === n - 2) continue;
    const [x2, z2] = sp((i + 1) * step, R), h2 = h + rise, t = .025, pts = [];
    for (const [px, py, pz] of [[x, h + H, z], [x2, h2 + H, z2]]) for (const dx of [-t, t]) for (const dy of [-t, t]) for (const dz of [-t, t]) pts.push(V(px + dx, py + dy, pz + dz));
    hull(p, `shand${i}`, pts, paint, opts);
  }
};

/** Rails along straight segments [[ax, az], [bx, bz]]: posts at the ends, a handrail and balusters. */
const railRun = (p, segs, paint, { metal = false } = {}) => {
  const H = .92, r = .05, b = .025, post = .07, gap = .11, opts = metal ? { metal: true } : {};
  segs.forEach(([[ax, az], [bx, bz]], k) => {
    p.box(`rr-hand${k}`, [Math.min(ax, bx) - r / 2, H - r, Math.min(az, bz) - r / 2, Math.max(ax, bx) + r / 2, H, Math.max(az, bz) + r / 2], paint, opts);
    for (const [px, pz] of [[ax, az], [bx, bz]]) p.box(`rr-post${k}${px},${pz}`, [px - post / 2, 0, pz - post / 2, px + post / 2, H + .04, pz + post / 2], paint, opts);
    const len = Math.hypot(bx - ax, bz - az), m = Math.max(0, Math.round(len / gap) - 1);
    for (let i = 1; i <= m; i++) { const t = i / (m + 1), x = ax + (bx - ax) * t, z = az + (bz - az) * t; p.box(`rr-bal${k}-${i}`, [x - b / 2, SLAB, z - b / 2, x + b / 2, H - r, z + b / 2], paint, opts); }
  });
};

const SPIRAL_STAIRS = [
  { id: 't_stairs_up_2x2', groupOf: 't_stairs_up', footprint: [2, 2], desc: 'A flight of stairs leading up.  (The 2×2 stairwell of the level below a `>` group: a wooden spiral stair, twelve wedge treads round a centre pole in a full turn, a level high, balusters and a helical handrail on the outer edge; the first tread at +Z; a plank floor under it.)', build: (p) => {
    p.box('tile', [-1, 0, -1, 1, SLAB, 1], floorP, { ppm: 32 });
    cyl(p, 'pole', 'y', [0, LEVEL / 2, 0], SPIRAL.pole, LEVEL, 8, stringerP);
    spiralTreads(p, treadP);
    spiralRail(p, railP);
  } },
  { id: 't_stairs_down_2x2', groupOf: 't_stairs_down', footprint: [2, 2], desc: 'A flight of stairs leading down.  (The 2×2 stairwell over a spiral stair: the well open in the floor with joists lining it, a landing plate from the top tread to the +Z edge, the pole rising to a newel, a balustrade round the well except at the landing; the spiral itself goes down through the well.)', build: (p) => {
    const E = .98;
    for (const [k, b] of Object.entries({ n: [-1, -.25, -1, 1, SLAB, -E], s: [-1, -.25, E, 1, SLAB, 1], w: [-1, -.25, -1, -E, SLAB, 1], e: [E, -.25, -1, 1, SLAB, 1] })) p.box(`lining-${k}`, b, stringerP, { ppm: 32 });
    p.box('landing', [-.75, -.08, .55, -.05, SLAB, 1], floorP, { ppm: 32 });
    cyl(p, 'pole-top', 'y', [0, .5, 0], SPIRAL.pole, 1.0, 8, stringerP);
    p.box('pole-cap', [-.09, 1.0, -.09, .09, 1.05, .09], railP);
    railRun(p, [[[-E, -E], [E, -E]], [[E, -E], [E, E]], [[-E, -E], [-E, E]], [[-E, E], [-.75, E]], [[-.05, E], [E, E]]], railP);
    // The landing's inner edges, toward the open well.
    railRun(p, [[[-.05, .55], [-.05, E]]], railP);
    spiralTreads(p, treadP, { dy: -LEVEL, inset: .02 });
  } },
];

const STAIRS = [
  { id: 't_stairs_up', desc: 'A flight of stairs leading up.  (Indoor wooden stairs: a level (2 m) in ten steps across the tile, rising toward −Z, stringers both sides, a balustrade (newel, balusters, handrail) on each side.)', build: (p) => {
    p.box('tile', [-.5, 0, -.5, .5, SLAB, .5], floorP, { ppm: 32 });
    const run = 1 / STEPS, rise = LEVEL / STEPS;
    for (let i = 0; i < STEPS; i++) p.box(`step${i}`, [-.42, SLAB, .5 - (i + 1) * run, .42, SLAB + (i + 1) * rise, .5 - i * run], treadP, { ppm: 32 });
    for (const s of [-1, 1]) slant(p, `stringer${s}`, s < 0 ? -.47 : .42, s < 0 ? -.42 : .47, [.5, .28], [-.5, LEVEL + .2], .3, stringerP);
    // Balustrades on both sides: a newel at the foot, a baluster on every tread and a handrail
    // 0.9 m over the nosings, reaching the floor above at the height of the stairwell's rails.
    const H = .9, b = .025, x = .445, railAt = (z) => SLAB + (.5 - z) * LEVEL + H;
    for (const s of [-1, 1]) {
      p.box(`newel${s}`, [s * x - .035, 0, .41, s * x + .035, railAt(.45) + .06, .48], railP);
      slant(p, `handrail${s}`, s * x - .03, s * x + .03, [.45, railAt(.45)], [-.5, railAt(-.5)], .05, railP);
      for (let i = 1; i < STEPS; i++) {
        const z = .5 - (i + .5) * run;
        p.box(`baluster${s}-${i}`, [s * x - b / 2, SLAB + (i + 1) * rise, z - b / 2, s * x + b / 2, railAt(z) - .05, z + b / 2], railP);
      }
    }
  } },
  { id: 't_stairs_down', desc: 'A flight of stairs leading down.  (Indoors: the wooden flight going down through an opening in the floor, joists lining it, a balustrade (newels, handrail, balusters) on three sides, open where the flight arrives.)', build: (p) => {
    stairwell(p, { floor: floorP, lining: stringerP, rails: null });
    balustrade(p, [-.42, -.44, .42, .44], ['e', 'w', 's'], railP);
    descent(p, treadP, stringerP);
  } },
  { id: 't_stairs_down_no_roof', desc: 'A flight of stairs leading down.  (Outdoors, no roof over it: concrete steps going down through an opening in a concrete edge, galvanized pipe railings on three sides.)', build: (p) => {
    stairwell(p, { floor: concreteP, lining: concreteP, rails: pipeP, railOpts: { post: .045, rail: .035, opts: { metal: true } } });
    descent(p, concreteP, concreteP);
  } },
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
const DOMESTIC = [0.84, 1.0, 1.72];
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

/**
 * Duct tape over the glass, outside (−Z): overlapping strips from sill to head, their ends a
 * little ragged, so the window reads blocked out ("covers this window, blocking sunlight").
 */
const taped = (p, id, w, y0, y1, z = -0.06) => {
  const r = rng(`${id}:tape`), strip = 0.05, tapeP = speckle(`${id}:tape`, 0x8e9094, [0x9a9ca0, 0x828488], 0.25);
  for (let y = y0, k = 0; y < y1 - 0.01; y += strip * 0.85, k++) {
    const l = -w / 2 + r() * 0.03, rr = w / 2 - r() * 0.03;
    p.box(`tape${k}`, [l, y, z - 0.004, rr, Math.min(y1, y + strip), z], tapeP);
  }
};
/** The shop window (t_window): one big sheet in a dark metal frame. */
const SHOP = [1, 0.3, 1.95];
const shopWindow = (id, { alarm = false, tape = false } = {}) => (p) => {
  casing(p, 1, 0.3, 1.95, flat(0x3a3e42), 0.035, { metal: true });
  pane(p, 'sheet', 0.93, 0.335, 1.915);
  if (alarm) sensor(p, 1, 1.95);
  if (tape) taped(p, id, 0.93, 0.335, 1.915);
};
/** A sliding window (slider) with duct tape over its glass. */
const tapedSlider = (id, size, opts) => (p) => {
  slider(id, size, opts)(p);
  taped(p, id, size[0] - 0.08, size[1] + 0.04, size[2] - 0.04);
};
// CDDA turns a curtained window into t_window_no_curtains when its curtains are torn down, so the
// window without curtains keeps the curtained window's size (its description calls it "smaller";
// a window that shrinks as its curtains come down would be wrong).
const NO_CURTAINS = ' (Same size as the curtained window: CDDA turns that window into this one when its curtains are torn down.)';

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
  { id: 't_window_no_curtains', desc: `A closed smaller window typically found in residential homes.${NO_CURTAINS}`, build: slider('t_window_no_curtains', DOMESTIC) },
  { id: 't_window_open', desc: 'A window with fancy curtains on the inside … It\'s open and you can crawl through.', build: slider('t_window_open', DOMESTIC, { curtain: 'open', open: true }) },
  { id: 't_window_no_curtains_open', desc: "A smaller window typically found in residential homes.  It's open and can be crawled through.", build: slider('t_window_no_curtains_open', DOMESTIC, { open: true }) },
  // Batch 2: the other states of the same windows (alarmed, open, taped), each after its description.
  { id: 't_window_open_alarm', desc: 'A window with fancy curtains on the inside that can be drawn closed to block visibility and shut out any light.  It is open. (alarmed: a glass-break sensor on the frame)', build: slider('t_window_open_alarm', DOMESTIC, { curtain: 'open', open: true, alarm: true }) },
  { id: 't_window_no_curtains_alarm', desc: `A closed smaller window typically found in residential homes.  You could install a curtain. (alarmed)${NO_CURTAINS}`, build: slider('t_window_no_curtains_alarm', DOMESTIC, { alarm: true }) },
  { id: 't_window_no_curtains_open_alarm', desc: `A smaller window typically found in residential homes.  It's open and can be crawled through. (alarmed)${NO_CURTAINS}`, build: slider('t_window_no_curtains_open_alarm', DOMESTIC, { open: true, alarm: true }) },
  { id: 't_window_alarm', desc: 'A giant sheet of glass inserted into a window, typically found on the side of shops to showcase goods. (alarmed: a glass-break sensor on the frame)', build: shopWindow('t_window_alarm', { alarm: true }) },
  { id: 't_window_domestic_taped', desc: 'A window with fancy curtains on the inside.  This one has been blocked out with duct tape.', build: tapedSlider('t_window_domestic_taped', DOMESTIC, { curtain: 'open' }) },
  { id: 't_window_no_curtains_taped', desc: `A smaller window typically found in residential homes.  This one has been blocked out with duct tape.${NO_CURTAINS}`, build: tapedSlider('t_window_no_curtains_taped', DOMESTIC, {}) },
  { id: 't_window_taped', desc: 'Duct tape covers this window, blocking sunlight and visibility.  You could remove the duct tape.', build: shopWindow('t_window_taped', { tape: true }) },
  { id: 't_window_alarm_taped', desc: 'Duct tape covers this window, blocking out any sunlight and visibility.  You could remove the duct tape. (alarmed)', build: shopWindow('t_window_alarm_taped', { alarm: true, tape: true }) },
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
const OPENING = { t_window: SHOP, t_window_alarm: SHOP, t_window_taped: SHOP, t_window_alarm_taped: SHOP, t_reinforced_glass_shutter_open: [0.9, 0.6, 1.7] };
const openings = (list) => list.map((e) => ({ ...e, opening: OPENING[e.id] ?? DOMESTIC }));

/** Phase-1 terrain, each with the kind of surface an engine may take its texture for. */
export const TERRAIN = [...tag(GROUND, 'floor'), ...tag(ROOFS, 'roof'), ...tag(WALLS, 'wall'), ...DOORS, ...openings(WINDOWS), ...FENCES, ...TREES, ...FLOWERS, ...LOW_FURN, ...FURNITURE, ...FURNITURE_BATCH, ...VEHICLES, ...ROAD_VEHICLES, ...ITEMS, ...ITEMS2, ...STAIRS, ...SPIRAL_STAIRS, ...ITEMS3, ...ITEMS4, ...INVENTORY_PROPS, ...SHELTER_PROPS, ...CARRY_PROPS, ...COMMON_LOOT].map((e) => ({ ppm: 64, ...e }));
