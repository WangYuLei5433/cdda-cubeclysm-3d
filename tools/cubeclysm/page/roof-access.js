// Ladders, skylights and grates: the roof terrain of CDDA's roof palette (mapgen_palettes/
// roof_palette.json: `v` t_ladder_down, `o` t_glass_roof, `#` t_grate) that had no model, and the
// ladders below and through them. One tile, origin = the tile centre on the floor, a level is LEVEL
// (2 m) high and a slab SLAB thick, as the stairs in terrain.js.
//
// CDDA (7136388):
//  t_ladder_up "A ladder leading up." · t_ladder_down "A ladder leading down." · t_ladder_up_down
//  "A ladder leading up and down." (both look like t_ladder_up_down) · t_glass_roof "skylight": "A
//  giant sheet of glass inserted into the roof to let light pass through." · t_grate "metal grate":
//  "A walkway that can be used as a protective covering over drains, or even as a filter."
//
// The ladder is one fixed steel ladder: two rails and round rungs every 30 cm, standing in the
// middle of the tile and running up through a 60 cm hatch in the floor above. Up: the ladder on a
// floor slab, its top reaching into the hatch. Down: the hatch — the floor round a framed opening,
// a raised curb, the lid swung open, the rails rising as grab bars above it and the ladder going
// down out of sight. Up and down: both, the ladder running through.
import { LEVEL, SLAB, border, flat, glass, layers, sides, speckle } from './props.js';
import { cyl } from './item-kit.js';
import { fill, shade } from './paint.js';

const STEEL = speckle('ladder:steel', 0x9aa0a4, [0xa8aeb2, 0x8a9094], 0.2);
const RUNG = speckle('ladder:rung', 0xb0b6ba, [0xc0c6ca, 0x9aa0a4], 0.2);
const CURB = speckle('ladder:curb', 0x6a6e72, [0x7a7e82, 0x5a5e62], 0.3);
/** A neutral floor round the hatch (concrete deck): ladders stand in barns, towers and on roofs. */
const DECK = layers(speckle('ladder:deck', 0x8a8a86, [0x96968e, 0x7e7e78], 0.4), sides(['top'], border(0x6e6e6a)));
const H = 0.3; // half the hatch

/** The ladder from y0 to y1: rails at x = ±0.2, rungs every 0.3 m, against the hatch's −Z edge. */
function ladder(p, y0, y1, z = -0.16) {
  for (const x of [-0.2, 0.2]) p.box('rail', [x - 0.018, y0, z - 0.03, x + 0.018, y1, z + 0.03], STEEL, { metal: true });
  for (let y = y0 + 0.3; y < y1 - 0.05; y += 0.3) cyl(p, 'rung', 'x', [0, y, z], 0.014, 0.37, 6, RUNG, { metal: true });
}

/** A floor slab with a framed hatch in the middle (lining going down into the floor). */
function hatchFloor(p) {
  for (const [name, b] of Object.entries({ n: [-0.5, -0.5, 0.5, -H], s: [-0.5, H, 0.5, 0.5], w: [-0.5, -H, -H, H], e: [H, -H, 0.5, H] })) {
    p.box(`deck ${name}`, [b[0], 0, b[1], b[2], SLAB, b[3]], DECK, { ppm: 32 });
  }
  for (const [name, b] of Object.entries({ n: [-H, -H, H, -H + 0.02], s: [-H, H - 0.02, H, H], w: [-H, -H, -H + 0.02, H], e: [H - 0.02, -H, H, H] })) {
    p.box(`lining ${name}`, [b[0], -0.25, b[1], b[2], SLAB, b[3]], CURB, { ppm: 32, metal: true });
  }
}

/** The hatch's raised curb and its lid, open against the +Z side. */
function hatchTop(p) {
  const c = 0.04, h = 0.14;
  for (const [name, b] of Object.entries({ n: [-H - c, -H - c, H + c, -H], s: [-H - c, H, H + c, H + c], w: [-H - c, -H, -H, H], e: [H, -H, H + c, H] })) {
    p.box(`curb ${name}`, [b[0], SLAB, b[1], b[2], SLAB + h, b[3]], CURB, { metal: true });
  }
  // The lid, hinged on the +Z curb and standing up, its underside (insulated) toward the hatch.
  p.box('lid', [-H - c, SLAB + h, H + c - 0.035, H + c, SLAB + h + 2 * H + 2 * c, H + c], layers(CURB, sides(['front'], (ctx, x, y, w, hh) => fill(ctx, x + 2, y + 2, w - 4, hh - 4, 0xd8d4c4))), { metal: true });
  for (const x of [-0.22, 0.22]) p.box('hinge', [x - 0.03, SLAB + h - 0.01, H + c - 0.05, x + 0.03, SLAB + h + 0.03, H + c + 0.01], flat(0x3a3e42), { metal: true });
}

/** Grab bars: the rails carried on above the hatch, bent over, so one can step off holding on. */
function grabBars(p, y0, z = -0.16) {
  for (const x of [-0.2, 0.2]) {
    p.box('grab bar', [x - 0.018, y0, z - 0.018, x + 0.018, y0 + 1.0, z + 0.018], STEEL, { metal: true });
    p.box('grab bar top', [x - 0.018, y0 + 0.98, z - 0.018, x + 0.018, y0 + 1.0, z + 0.2], STEEL, { metal: true });
  }
}

export const ROOF_ACCESS = [
  { id: 't_ladder_up', desc: 'A ladder leading up.  (A fixed steel ladder on a concrete floor, rising a level to the hatch in the floor above.)', build: (p) => {
    p.box('tile', [-0.5, 0, -0.5, 0.5, SLAB, 0.5], DECK, { ppm: 32 });
    ladder(p, SLAB, LEVEL + SLAB);
  } },
  { id: 't_ladder_down', desc: 'A ladder leading down.  (The hatch at the top of a fixed steel ladder: a framed opening in the floor, a raised curb, the lid swung open, grab bars above, the ladder going down through it.)', build: (p) => {
    hatchFloor(p);
    hatchTop(p);
    grabBars(p, SLAB);
    ladder(p, -LEVEL + SLAB, SLAB);
  } },
  { id: 't_ladder_up_down', desc: 'A ladder leading up and down.  (A fixed steel ladder running through a framed hatch in the floor, on up to the hatch of the level above.)', build: (p) => {
    hatchFloor(p);
    ladder(p, -LEVEL + SLAB, LEVEL + SLAB);
  } },
  { id: 't_glass_roof', desc: 'A giant sheet of glass inserted into the roof to let light pass through.  (A roof slab whose whole face is a framed pane: an aluminium frame round the tile and a glazing bar across, so neighbouring skylights join into one long one.)', build: (p) => {
    const frame = speckle('skylight:frame', 0xb4b8bc, [0xc0c4c8, 0xa4a8ac], 0.2), f = 0.04;
    for (const [name, b] of Object.entries({ n: [-0.5, -0.5, 0.5, -0.5 + f], s: [-0.5, 0.5 - f, 0.5, 0.5], w: [-0.5, -0.5 + f, -0.5 + f, 0.5 - f], e: [0.5 - f, -0.5 + f, 0.5, 0.5 - f] })) {
      p.box(`frame ${name}`, [b[0], 0, b[1], b[2], SLAB + 0.01, b[3]], frame, { metal: true });
    }
    p.box('glazing bar', [-0.5 + f, 0, -0.012, 0.5 - f, SLAB + 0.008, 0.012], frame, { metal: true });
    p.box('pane', [-0.5 + f, SLAB - 0.012, -0.5 + f, 0.5 - f, SLAB - 0.004, 0.5 - f], glass(0x9ac8d8), { glass: true, ppm: 64 });
  } },
  { id: 't_grate', desc: 'A walkway that can be used as a protective covering over drains, or even as a filter.  (A steel bar grating set flush in a frame: bearing bars across, cross rods every 10 cm, the dark below showing between.)', build: (p) => {
    const bars = (ctx, x, y, w, h) => {
      ctx.clearRect(x, y, w, h);
      for (let j = 0; j < h; j += 4) fill(ctx, x, y + j, w, 2, 0x6a6e72);
      for (let i = 0; i < w; i += 12) fill(ctx, x + i, y, 2, h, 0x7a7e82);
      fill(ctx, x, y, w, 2, 0x5a5e62); fill(ctx, x, y + h - 2, w, 2, 0x5a5e62); fill(ctx, x, y, 2, h, 0x5a5e62); fill(ctx, x + w - 2, y, 2, h, 0x5a5e62);
    };
    p.box('grating', [-0.5, SLAB - 0.03, -0.5, 0.5, SLAB, 0.5], (ctx, x, y, w, h, side) => (side === 'top' || side === 'bottom' ? bars(ctx, x, y, w, h) : fill(ctx, x, y, w, h, 0x5a5e62)), { cutout: true, ppm: 128 });
    // The drain under it: a dark sump a little below the floor.
    p.box('sump', [-0.48, -0.2, -0.48, 0.48, -0.18, 0.48], flat(shade(0x2a2622, 1)), { ppm: 16 });
  } },
].map((r) => ({ ...r, dir: 'terrain', source: 'tools/cubeclysm/page/roof-access.js' }));
