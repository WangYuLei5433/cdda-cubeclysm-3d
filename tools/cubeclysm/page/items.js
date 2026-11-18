// Cubeclysm items, batch 1: the census's visible items up to 50% (docs/census.zh.md), low-poly with
// painted textures. One model per CDDA id, after its description (CDDA data: description, volume,
// longest side, material). Real size, lying on the ground as they would be dropped (origin = the
// item's centre on the ground). Piles (a handful of leaves, sand, seeds, scrap…) are one pile.
import { flat, layers, speckle } from './props.js';
import { fill, rng, shade } from './paint.js';
import { V, bevel, cyl, hull, pane } from './lowpoly.js';

// --- paints -------------------------------------------------------------------------------------

/** Wood with grain lines along the face. */
const woodP = (hex) => layers(speckle(`wood${hex}`, hex, [shade(hex, 1.08), shade(hex, .9)], .3), (ctx, x, y, w, h) => {
  const r = rng(`grain${hex}${w}${h}`);
  for (let j = 1; j < h; j += 3) if (r() < .6) fill(ctx, x, y + j, w, 1, shade(hex, .82));
});
const barkP = (hex) => layers(speckle(`bark${hex}`, hex, [shade(hex, .8), shade(hex, 1.12)], .55), (ctx, x, y, w, h) => {
  const r = rng(`barkline${hex}${w}`);
  for (let i = 0; i < w; i += 2) if (r() < .35) fill(ctx, x + i, y, 1, h, shade(hex, .7));
});
/** Knitted fabric: rows of stitches. */
const knitP = (hex) => layers(flat(hex), (ctx, x, y, w, h) => { for (let j = 0; j < h; j += 2) for (let i = (j / 2) % 2; i < w; i += 2) fill(ctx, x + i, y + j, 1, 1, shade(hex, .88)); });
const steelP = (hex = 0xc4c8cc) => layers(speckle(`steel${hex}`, hex, [shade(hex, 1.08), shade(hex, .9)], .25), (ctx, x, y, w) => fill(ctx, x, y, w, 1, shade(hex, 1.2)));
const plasticP = (hex) => speckle(`plastic${hex}`, hex, [shade(hex, 1.05), shade(hex, .96)], .12);
const stoneP = (hex) => speckle(`stone${hex}`, hex, [shade(hex, 1.15), shade(hex, .82), shade(hex, .95)], .55);
const STEEL = { metal: true }, GLASS = { glass: true }, CUT = { cutout: true };

// --- shapes -------------------------------------------------------------------------------------

/** A tapered tube from a to b (radius r0 → r1), `sides` facets. */
function tube(p, name, a, b, r0, r1, sides, paint, opts = {}) {
  const axis = b.clone().sub(a).normalize();
  const u = Math.abs(axis.y) < .9 ? V(0, 1, 0).cross(axis).normalize() : V(1, 0, 0).cross(axis).normalize();
  const w = axis.clone().cross(u);
  const ring = (c, r) => Array.from({ length: sides }, (_, k) => { const t = (k * 2 * Math.PI) / sides; return c.clone().addScaledVector(u, Math.cos(t) * r).addScaledVector(w, Math.sin(t) * r); });
  hull(p, name, [...ring(a, r0), ...ring(b, r1)], paint, opts);
}
/** A low mound of loose stuff: an irregular ring on the ground, a smaller one above, a peak. */
function pile(p, name, r, h, paint, seed, opts = {}) {
  const rand = rng(seed), pts = [];
  for (let k = 0; k < 9; k++) { const a = (k / 9) * 2 * Math.PI + rand() * .3, rr = r * (.8 + rand() * .3); pts.push(V(Math.cos(a) * rr, 0, Math.sin(a) * rr * .85)); }
  for (let k = 0; k < 6; k++) { const a = (k / 6) * 2 * Math.PI + rand(), rr = r * (.4 + rand() * .2); pts.push(V(Math.cos(a) * rr, h * (.55 + rand() * .2), Math.sin(a) * rr * .85)); }
  pts.push(V((rand() - .5) * r * .2, h, (rand() - .5) * r * .2));
  hull(p, name, pts, paint, opts);
}
/** An irregular lump (rock, metal chunk) of radii [rx, ry, rz] resting on the ground. */
function lump(p, name, [rx, ry, rz], paint, seed, opts = {}, at = [0, 0, 0]) {
  const rand = rng(seed), pts = [];
  for (let k = 0; k < 16; k++) {
    const u = rand() * 2 - 1, t = rand() * 2 * Math.PI, s = Math.sqrt(1 - u * u), k2 = .82 + rand() * .3;
    pts.push(V(at[0] + Math.cos(t) * s * rx * k2, at[1] + ry + u * ry * k2, at[2] + Math.sin(t) * s * rz * k2));
  }
  const minY = Math.min(...pts.map((q) => q.y));
  hull(p, name, pts.map((q) => V(q.x, q.y - minY + at[1], q.z)), paint, opts);
}
/** A pair of socks lying flat: two L-shaped socks (leg, bent at the heel, foot), side by side. */
function socks(p, { leg, color, band, toe, thick = .022, ribs = false }) {
  const knit = ribs ? layers(knitP(color), (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 3) fill(ctx, x + i, y, 1, h, shade(color, .8)); }) : knitP(color);
  for (const [k, z] of [[0, -.03], [1, .03]]) {
    const g = p.group(`sock${k}`, { at: [0, k * thick * .85, z], rotY: k ? .1 : -.05 });
    const o = { parent: g };
    bevel(p, `leg${k}`, [-leg, 0, -.026, 0, thick, .026], .009, knit, o);
    if (band) bevel(p, `band${k}`, [-leg - .002, 0, -.027, -leg + .02, thick * 1.04, .027], .006, flat(band), o);
    bevel(p, `heel${k}`, [-.022, 0, -.028, .012, thick * .95, .03], .011, flat(toe), o);
    // The foot turns about 100° at the heel and tapers to the toe.
    const f = p.group(`foot${k}`, { at: [0, 0, .004], rotY: -1.75, parent: g });
    hull(p, `foot${k}`, [V(0, 0, -.026), V(0, 0, .026), V(.085, 0, -.024), V(.085, 0, .022), V(0, thick * .9, -.026), V(0, thick * .9, .026), V(.085, thick * .85, -.024), V(.085, thick * .85, .022)], knit, { parent: f });
    hull(p, `toe${k}`, [V(.08, 0, -.024), V(.08, 0, .022), V(.112, 0, -.012), V(.112, 0, .01), V(.08, thick * .85, -.024), V(.08, thick * .85, .022), V(.112, thick * .6, -.012), V(.112, thick * .6, .01)], flat(toe), { parent: f });
  }
}
/** A flat cutlery handle from x0 to x1, `w` wide, lying at height y. */
const handle = (p, name, x0, x1, w, t, paint, opts) => hull(p, name, [V(x0, 0, -w * .6), V(x0, 0, w * .6), V(x1, 0, -w), V(x1, 0, w), V(x0, t, -w * .6), V(x0, t, w * .6), V(x1, t, -w), V(x1, t, w)], paint, opts);

// --- recipes ------------------------------------------------------------------------------------

const RECIPES = [
  { id: 'leaves', desc: 'Some ordinary, mostly dry leaves.  They have very few uses and are thus (almost) only good for burning.  (A handful, 100 ml: a loose scatter of dry leaves.)', build: (p) => {
    const r = rng('leaves'), tones = [0x8a7a3a, 0x9a6a2a, 0x6a7a30, 0xa08040, 0x7a5a26];
    for (let k = 0; k < 9; k++) {
      const a = r() * 2 * Math.PI, d = r() * .06, L = .07 + r() * .03, W = .035 + r() * .015, c = tones[k % tones.length];
      const g = p.group(`leaf${k}`, { at: [Math.cos(a) * d, .002 + k * .0025, Math.sin(a) * d], rotY: r() * 2 * Math.PI, rotX: (r() - .5) * .3 });
      // A pointed oval blade, slightly cupped along the midrib.
      const blade = [V(0, 0, L / 2), V(W * .42, .003, L * .2), V(W / 2, .004, -L * .08), V(W * .3, .002, -L * .38), V(0, 0, -L / 2), V(-W * .3, .002, -L * .38), V(-W / 2, .004, -L * .08), V(-W * .42, .003, L * .2)];
      hull(p, `leaf${k}`, blade.flatMap((q) => [q, V(q.x, q.y + .0015, q.z)]), speckle(`leaf${k}`, c, [shade(c, .88), shade(c, 1.08)], .25), { parent: g });
    }
  } },
  { id: 'glass_shard', desc: 'A broken shard of glass covered in sharp edges.  You could use it as a weapon, but you might want to wear gloves.  (30 ml: a jagged triangle of window glass, with two chips beside it.)', build: (p) => {
    const glass = flat(0xbfe4ea);
    for (const [k, pts] of [[0, [[-.05, -.02], [.05, -.03], [-.01, .045]]], [1, [[.05, .01], [.08, .035], [.055, .045]]], [2, [[-.07, .03], [-.05, .05], [-.075, .055]]]]) {
      const t = .004;
      hull(p, `shard${k}`, pts.flatMap(([x, z]) => [V(x, 0, z), V(x, t, z)]), glass, GLASS);
    }
  } },
  { id: 'pipe_cpvc', desc: 'White polyvinyl chloride pipe, commonly used for household plumbing, but also in many another applications.  (1.75 L in CDDA: a 1.2 m length of 4 cm pipe.)', build: (p) => {
    const white = layers(plasticP(0xece8dc), (ctx, x, y, w, h) => { for (let i = 4; i < w - 20; i += 40) fill(ctx, x + i, y + Math.round(h * .3), 14, 1, 0x5a6a8a); });
    cyl(p, 'pipe', 'x', [0, .021, 0], .021, 1.2, 10, white);
    for (const s of [-1, 1]) cyl(p, `bore${s}`, 'x', [s * .6, .021, 0], .016, .004, 10, flat(0x3a3832));
  } },
  { id: 'twig', desc: 'A small, slender branch.  Makes passable firewood but is not useful for much else.  (100 ml: 35 cm with a side shoot.)', build: (p) => {
    const bark = barkP(0x6a4a2e);
    tube(p, 'main', V(-.17, .006, 0), V(.02, .006, .01), .006, .005, 6, bark);
    tube(p, 'tip', V(.02, .006, .01), V(.18, .005, -.005), .005, .003, 6, bark);
    tube(p, 'shoot', V(.0, .005, .008), V(.11, .004, .075), .004, .002, 5, bark);
  } },
  { id: 'stick_common', desc: 'A respectable length of wood, just big enough to wrap your hand around.  It\'s a little bent, and that makes it useless for most things you\'d want to make with it.  (Longest side 130 cm in CDDA, about 4.5 cm thick, a slight bend.)', build: (p) => {
    const bark = barkP(0x5e4128), pts = [V(-.65, .022, 0), V(-.15, .023, .028), V(.3, .022, .012), V(.65, .019, -.03)];
    for (let i = 0; i + 1 < pts.length; i++) tube(p, `seg${i}`, pts[i], pts[i + 1], .022 - i * .002, .021 - i * .002, 7, bark);
    for (const [k, x] of [[0, -.4], [1, .18]]) lump(p, `knot${k}`, [.012, .008, .012], barkP(0x4a3220), `knot${k}`, {}, [x, .034, .02]);
    cyl(p, 'end', 'x', [.651, .019, -.03], .016, .002, 7, woodP(0xb08a5a));
  } },
  { id: 'lead', desc: 'A soft, dull metal used since ancient times.  Due to its malleability, it has a wide variety of uses including the manufacture of ammunition.  (Counted in small units; a few dull grey lumps.)', build: (p) => {
    const lead = speckle('lead', 0x5a5e62, [0x6a6e72, 0x4a4e52], .35);
    for (const [k, at] of [[0, [0, 0, 0]], [1, [.035, 0, .02]], [2, [-.03, 0, .025]], [3, [.01, .012, .012]]]) lump(p, `lump${k}`, [.016, .009, .013], lead, `lead${k}`, STEEL, at);
  } },
  { id: 'seed_corn', desc: 'A pile of dried corn, designated for planting.  It could just as easily become food.  (83 ml: a small heap of yellow kernels.)', build: (p) => {
    pile(p, 'heap', .06, .03, layers(flat(0xd8b030), (ctx, x, y, w, h) => { for (let j = 0; j < h; j += 3) for (let i = (j / 3) % 2 ? 1 : 0; i < w; i += 3) fill(ctx, x + i, y + j, 2, 2, 0xe8c850); for (let j = 1; j < h; j += 6) for (let i = 2; i < w; i += 6) fill(ctx, x + i, y + j, 1, 1, 0xa8801a); }), 'corn');
  } },
  { id: 'splinter', desc: 'A splintered piece of wood, could be used as a skewer or for kindling.  (Longest side 30 cm: a long jagged sliver.)', build: (p) => {
    const wood = woodP(0xb89060);
    hull(p, 'sliver', [V(-.15, 0, -.012), V(-.15, 0, .01), V(-.15, .014, -.006), V(.05, 0, -.016), V(.05, 0, .016), V(.05, .018, 0), V(.15, 0, .002), V(.15, .006, 0)], wood);
    hull(p, 'jag', [V(-.15, 0, -.012), V(-.15, .014, -.006), V(-.19, .004, -.02), V(-.17, .008, .004), V(-.16, 0, .01)], wood);
  } },
  { id: 'socks', desc: 'Socks.  Put \'em on your feet.  (A pair, folded: white cotton crew socks with grey heels and toes.)', build: (p) => { socks(p, { leg: .14, color: 0xece8e0, band: 0xb8b4ac, toe: 0xb8b4ac }); } },
  { id: 'socks_ankle', desc: 'Short socks, commonly used for sports.  These are designed to protect your feet from friction, not temperature.  (A pair of short light grey ankle socks with a stripe.)', build: (p) => { socks(p, { leg: .05, color: 0xc8c8c8, band: 0x3a6ab0, toe: 0x9a9a9a, thick: .018 }); } },
  { id: 'socks_wool', desc: 'Warm socks made of wool.  (A pair of thick blue ribbed wool socks.)', build: (p) => { socks(p, { leg: .16, color: 0x3a5a8a, band: 0x2a3e64, toe: 0x2a3e64, thick: .03, ribs: true }); } },
  { id: 'rock', desc: 'A rock the size of a baseball.  Makes a decent melee weapon, and is also good for throwing at enemies.  (≈ 7.5 cm across, 250 ml.)', build: (p) => { lump(p, 'rock', [.04, .03, .036], stoneP(0x8a8780), 'rock'); } },
  { id: 'box_small', desc: 'A small cardboard box.  No bigger than a foot in dimension.  Can be folded.  (Longest side 21 cm, 2.25 L: 21 × 13 × 8 cm, taped shut.)', build: (p) => {
    const card = layers(speckle('card', 0xb08a58, [0xa07c4c, 0xbc9664], .3), (ctx, x, y, w, h) => { for (let i = 1; i < w; i += 4) fill(ctx, x + i, y, 1, h, 0xa47e50); });
    bevel(p, 'box', [-.105, 0, -.065, .105, .08, .065], .003, card);
    bevel(p, 'tape', [-.11, .079, -.012, .11, .0815, .012], .001, flat(0xc8a878));
    bevel(p, 'seam', [-.104, .0795, -.001, .104, .0812, .001], .0003, flat(0x6a5030));
  } },
  { id: 'file', desc: 'Several documents containing all kinds of information, customer data, and charts, kept together in a manila folder.  Pretty useless now.  (A letter-size folder with papers.)', build: (p) => {
    const manila = speckle('manila', 0xd8bc84, [0xccb078, 0xe0c890], .2);
    const text = layers(flat(0xf0eee6), (ctx, x, y, w, h) => { for (let j = 3; j < h - 2; j += 3) fill(ctx, x + 3, y + j, Math.round((w - 6) * (.5 + ((j * 37) % 50) / 100)), 1, 0x8a8a8a); });
    pane(p, 'back', [V(-.155, .002, -.118), V(.155, .002, -.118), V(.155, .002, .118), V(-.155, .002, .118)], .002, manila);
    const sheets = p.group('sheets', { at: [.01, .0045, -.006], rotY: .06 });
    pane(p, 'paper', [V(-.14, 0, -.108), V(.14, 0, -.108), V(.14, 0, .108), V(-.14, 0, .108)], .0015, text, { parent: sheets });
    pane(p, 'front', [V(-.155, .006, -.118), V(.155, .006, -.118), V(.155, .006, .1), V(-.155, .006, .1)], .002, manila);
    pane(p, 'tab', [V(.02, .006, .1), V(.1, .006, .1), V(.1, .006, .122), V(.02, .006, .122)], .002, manila);
  } },
  { id: 'material_sand', desc: 'A handful of New England sand.  If you had a stoked furnace, you could turn it into glass.  Otherwise, it\'s only good for making cement.  (A small heap.)', build: (p) => {
    pile(p, 'heap', .07, .028, speckle('sand', 0xc8b088, [0xd8c098, 0xb09870, 0x9a8a6a], .6), 'sand');
  } },
  { id: 'spoon', desc: 'Do not try to bend the spoon.  That is impossible.  (Longest side 19 cm, steel.)', build: (p) => {
    handle(p, 'handle', -.095, .035, .007, .004, steelP(), STEEL);
    const bowl = [];
    for (let k = 0; k < 10; k++) { const a = (k / 10) * 2 * Math.PI; bowl.push(V(.065 + Math.cos(a) * .03, .012, Math.sin(a) * .02), V(.065 + Math.cos(a) * .018, 0, Math.sin(a) * .011)); }
    hull(p, 'bowl', bowl, steelP(), STEEL);
  } },
  { id: 'bag_plastic_small', desc: 'A small, open plastic bag.  Essentially trash.  (A crumpled, thin, half-clear bag.)', build: (p) => {
    // A flattened, crumpled bag: a ridged outline, a low puffed middle, the handle loops at one end.
    const r = rng('bagsmall'), pts = [];
    for (let k = 0; k < 12; k++) { const a = (k / 12) * 2 * Math.PI; pts.push(V(Math.cos(a) * .085 * (.9 + r() * .15), 0, Math.sin(a) * .06 * (.9 + r() * .15))); }
    for (let k = 0; k < 6; k++) { const a = (k / 6) * 2 * Math.PI + r(); pts.push(V(Math.cos(a) * .045, .012 + r() * .01, Math.sin(a) * .03)); }
    hull(p, 'bag', pts, flat(0xe8ecee), GLASS);
    for (const s of [-1, 1]) tube(p, `handle${s}`, V(.07, .004, s * .025), V(.12, .003, s * .035), .004, .004, 4, flat(0xd8dcde));
    tube(p, 'loop', V(.12, .003, -.035), V(.12, .003, .035), .004, .004, 4, flat(0xd8dcde));
  } },
  { id: 'bottle_plastic_small', desc: 'A watertight plastic bottle, holds 250 mL of liquid.  (Longest side 14 cm: clear, a printed label, a blue cap.)', build: (p) => {
    cyl(p, 'body', 'y', [0, .05, 0], .025, .1, 10, flat(0xdcecf0), GLASS);
    cyl(p, 'shoulder', 'y', [0, .11, 0], .025, .02, 10, flat(0xdcecf0), GLASS, .012);
    cyl(p, 'neck', 'y', [0, .126, 0], .011, .012, 8, flat(0xdcecf0), GLASS);
    cyl(p, 'cap', 'y', [0, .135, 0], .013, .01, 8, plasticP(0x2a5ab0));
    cyl(p, 'label', 'y', [0, .06, 0], .0255, .04, 10, layers(flat(0xf0f0f0), (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * .35), w, Math.round(h * .3), 0x3a8ad0)), { open: true });
  } },
  { id: 'bottle_plastic', desc: 'A watertight plastic bottle, holds 500 mL of liquid.  Some may be factory-sealed to increase shelf life.  (Longest side 22 cm: clear blue-tinted, label, white cap.)', build: (p) => {
    cyl(p, 'body', 'y', [0, .075, 0], .033, .15, 12, flat(0xcfe8ee), GLASS);
    cyl(p, 'shoulder', 'y', [0, .165, 0], .033, .03, 12, flat(0xcfe8ee), GLASS, .013);
    cyl(p, 'neck', 'y', [0, .19, 0], .013, .02, 8, flat(0xcfe8ee), GLASS);
    cyl(p, 'cap', 'y', [0, .205, 0], .015, .014, 8, plasticP(0xeeeeee));
    cyl(p, 'label', 'y', [0, .09, 0], .0335, .06, 12, layers(flat(0x2a7ab8), (ctx, x, y, w, h) => { fill(ctx, x, y + Math.round(h * .4), w, Math.round(h * .2), 0xf0f0f0); }), { open: true });
  } },
  { id: 'cotton_patchwork', desc: 'A 6-inch square cotton patch, suitable for repairing and tailoring clothing.  (15 cm square, stitched edge.)', build: (p) => {
    pane(p, 'patch', [V(-.076, .0015, -.076), V(.076, .0015, -.076), V(.076, .0015, .076), V(-.076, .0015, .076)], .003, layers(knitP(0xeeeae0), (ctx, x, y, w, h) => { for (let i = 1; i < w; i += 3) { fill(ctx, x + i, y + 1, 1, 1, 0x9a948a); fill(ctx, x + i, y + h - 2, 1, 1, 0x9a948a); } for (let j = 1; j < h; j += 3) { fill(ctx, x + 1, y + j, 1, 1, 0x9a948a); fill(ctx, x + w - 2, y + j, 1, 1, 0x9a948a); } }));
  } },
  { id: 'scrap', desc: 'A bulky assortment of small bits of scrap steel useful in all kinds of crafting.  (Bent plate offcuts, a bar end and a bracket.)', build: (p) => {
    const rusty = speckle('scrap', 0x8a8c8e, [0x9a6a4a, 0x6a6c6e, 0xa2a4a6], .45), r = rng('scrap');
    for (let k = 0; k < 4; k++) {
      const g = p.group(`plate${k}`, { at: [(r() - .5) * .08, .002 + k * .004, (r() - .5) * .06], rotY: r() * 3, rotZ: (r() - .5) * .4 });
      const w = .03 + r() * .03, d = .02 + r() * .02;
      hull(p, `plate${k}`, [V(-w, 0, -d), V(w * .8, 0, -d * .7), V(w, 0, d), V(-w * .6, 0, d * .9), V(-w, .003, -d), V(w * .8, .003, -d * .7), V(w, .003, d), V(-w * .6, .003, d * .9)], rusty, { parent: g, metal: true });
    }
    tube(p, 'bar', V(-.05, .008, .03), V(.04, .008, .045), .007, .007, 6, rusty, STEEL);
    bevel(p, 'bracket', [.02, 0, -.04, .05, .025, -.035], .002, rusty, STEEL);
  } },
  { id: 'bag_zipper', desc: 'A resealable, watertight transparent plastic bag roomy enough to hold a sandwich.  Known generically as a Ziploc bag, it can be sealed and opened with a press-tight seal.  (A flat clear bag with its seal strip.)', build: (p) => {
    pane(p, 'bag', [V(-.09, .003, -.08), V(.09, .003, -.08), V(.09, .003, .07), V(-.09, .003, .07)], .006, flat(0xe4eef2), GLASS);
    bevel(p, 'seal', [-.09, 0, .068, .09, .007, .08], .002, layers(flat(0x3a6ad0), (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h / 2), w, 1, 0xd8e4f8)));
    pane(p, 'label', [V(-.07, .0065, -.06), V(-.02, .0065, -.06), V(-.02, .0065, -.035), V(-.07, .0065, -.035)], .0005, layers(flat(0xf4f4f4), (ctx, x, y, w, h) => { for (let j = 2; j < h; j += 3) fill(ctx, x + 2, y + j, w - 4, 1, 0x9aa4c8); }));
  } },
  { id: 'knife_butter', desc: 'A dull knife, absolutely worthless in combat.  Excellent for spreading soft things on bread.  (Longest side 21 cm: a round-ended steel blade and handle.)', build: (p) => {
    handle(p, 'handle', -.105, -.01, .008, .005, steelP(), STEEL);
    hull(p, 'blade', [V(-.01, 0, -.006), V(-.01, 0, .006), V(.08, 0, -.009), V(.08, 0, .01), V(.1, 0, .002), V(.096, 0, -.008), V(-.01, .0025, -.006), V(-.01, .0025, .006), V(.08, .0025, -.009), V(.08, .0025, .01), V(.1, .0025, .002), V(.096, .0025, -.008)], steelP(0xd0d4d8), STEEL);
  } },
  { id: 'fork', desc: 'A fork, if you stab something with it, you eat it right away.  Wait… nevermind.  (Longest side 21 cm: steel, four tines.)', build: (p) => {
    handle(p, 'handle', -.105, .03, .007, .004, steelP(), STEEL);
    hull(p, 'head', [V(.03, 0, -.006), V(.03, 0, .006), V(.06, 0, -.012), V(.06, 0, .012), V(.03, .004, -.006), V(.03, .004, .006), V(.06, .004, -.012), V(.06, .004, .012)], steelP(), STEEL);
    for (let k = 0; k < 4; k++) { const z = -.0105 + k * .007; bevel(p, `tine${k}`, [.06, 0, z - .0015, .105, .003, z + .0015], .0005, steelP(), STEEL); }
  } },
  { id: 'nuts_bolts', desc: 'A matching nut and bolt.  Useful for securing objects together.  (Longest side 40 mm: a hex bolt and its nut beside it.)', build: (p) => {
    const zinc = steelP(0xb8bcb0);
    cyl(p, 'head', 'x', [-.017, .008, 0], .0085, .006, 6, zinc, STEEL);
    cyl(p, 'shank', 'x', [.002, .008, 0], .004, .034, 8, layers(zinc, (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 2) fill(ctx, x + i, y, 1, h, 0x8a8e84); }), STEEL);
    cyl(p, 'nut', 'y', [.005, .003, .022], .008, .006, 6, zinc, STEEL);
    cyl(p, 'hole', 'y', [.005, .0035, .022], .0035, .0062, 8, flat(0x2a2a2a));
  } },
  { id: 'knife_small', desc: 'A small kitchen knife (CDDA: small kitchen knife; longest side 25 cm): a pointed steel blade and a black handle with rivets.', build: (p) => {
    handle(p, 'handle', -.125, -.015, .01, .012, plasticP(0x1e1e20));
    for (const x of [-.1, -.07, -.04]) cyl(p, `rivet${x}`, 'y', [x, .012, 0], .002, .001, 6, steelP(), STEEL);
    hull(p, 'blade', [V(-.015, 0, -.009), V(-.015, 0, .012), V(.09, 0, .008), V(.125, 0, -.004), V(-.015, .003, -.009), V(-.015, .003, .012), V(.09, .003, .008), V(.125, .003, -.004)], layers(steelP(0xd4d8dc), (ctx, x, y, w) => fill(ctx, x, y, w, 1, 0xf0f4f8)), STEEL);
  } },
];

export const ITEMS = RECIPES.map((r) => ({ ...r, dir: 'items', ppm: 512, source: 'tools/cubeclysm/page/items.js' }));
