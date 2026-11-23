// Cubeclysm items, batch 4 (asked for by name: toilet brush, trash can, whistles, protein ration,
// plastic tupperware, smartphones, mail carrier hat, envelope). One model per CDDA id, after its
// description (quoted in `desc`, CDDA 7136388) and its size: real size, lying or standing on the
// ground (origin = the item's centre on the ground), front toward −Z.
import { V, bevel, cyl, flat, hull, layers, pane, speckle, fill, shade, STEEL, GLASS, tube, loop, blob, qbox, woodP, steelP, plasticP, clothP } from './item-kit.js';
import { poly } from './lowpoly.js';

/** A flat rectangle facing up at height y (a screen, a label), its paint reading with +x to the right and −z up. */
const top = (p, name, [x0, z0, x1, z1], y, paint, opts = {}) => pane(p, name, [V(x0, y, z1), V(x1, y, z1), V(x1, y, z0), V(x0, y, z0)], .0004, paint, opts);
/** A rectangle at fractions [a, b, c, d] of a face. */
const rect = (ctx, x, y, w, h, [a, b, c, d], hex) => fill(ctx, x + Math.round(w * a), y + Math.round(h * b), Math.max(1, Math.round(w * c)), Math.max(1, Math.round(h * d)), hex);

// --- smartphones ----------------------------------------------------------------------------------
// "A popular, fancy smartphone": 15 × 7.3 × 0.85 cm (111 ml, longest side 15 cm), lying face up,
// long side along −z, graphite back and aluminium frame, the screen showing what the id is doing.

const PHONE = { L: .15, W: .073, T: .0085 };
const SCREENS = {
  // Off: a black glass with a diagonal sheen.
  off: (ctx, x, y, w, h) => { fill(ctx, x, y, w, h, 0x0e1014); for (let t = 0; t < Math.min(w, h) * .6; t++) fill(ctx, x + Math.round(w * .55) + t, y + t, 2, 1, 0x1c2026); },
  // Locked: the lock screen, a padlock over a big clock on a blue wallpaper.
  locked: (ctx, x, y, w, h, side, torch = false) => {
    fill(ctx, x, y, w, h, 0x1e3a6e);
    for (let j = 0; j < h; j++) fill(ctx, x, y + j, w, 1, shade(0x1e3a6e, 1.15 - j / h * .45));
    rect(ctx, x, y, w, h, [.44, .05, .12, .035], 0xf0f0f0); // padlock body
    rect(ctx, x, y, w, h, [.46, .03, .08, .02], 0xc8c8c8); // shackle
    for (const k of [0, 1, 3, 4]) rect(ctx, x, y, w, h, [.12 + k * .16, .14, .11, .1], 0xf4f4f4); // the clock's digits
    rect(ctx, x, y, w, h, [.47, .16, .04, .02], 0xf4f4f4); rect(ctx, x, y, w, h, [.47, .21, .04, .02], 0xf4f4f4); // colon
    rect(ctx, x, y, w, h, [.25, .28, .5, .02], 0xb8c8e8); // date
    rect(ctx, x, y, w, h, [.33, .955, .34, .012], 0xf0f0f0); // home bar
    // Flashlight and camera buttons at the bottom; the flashlight lit when it is on.
    if (torch) {
      // Flashlight on: its button lit yellow-white, a yellow torch badge in the status bar.
      rect(ctx, x, y, w, h, [.05, .83, .24, .1], 0xffd84a);
      rect(ctx, x, y, w, h, [.08, .845, .18, .07], 0xfff6d0);
      rect(ctx, x, y, w, h, [.145, .86, .05, .045], 0x2a2a2a);
      rect(ctx, x, y, w, h, [.06, .012, .14, .018], 0xffd84a);
    } else {
      rect(ctx, x, y, w, h, [.08, .86, .18, .07], 0x3a4a6a);
      rect(ctx, x, y, w, h, [.14, .875, .06, .04], 0xd8d8d8);
    }
    rect(ctx, x, y, w, h, [.74, .86, .18, .07], 0x3a4a6a);
    rect(ctx, x, y, w, h, [.79, .88, .08, .03], 0xd8d8d8);
  },
  // Flashlight app: a lit torch button on a dark screen.
  torch: (ctx, x, y, w, h) => {
    fill(ctx, x, y, w, h, 0x101216);
    rect(ctx, x, y, w, h, [.3, .3, .4, .3], 0xfff6d0);
    rect(ctx, x, y, w, h, [.42, .36, .16, .12], 0xffffff);
    rect(ctx, x, y, w, h, [.45, .48, .1, .07], 0xd8d0b0);
    rect(ctx, x, y, w, h, [.2, .72, .6, .03], 0x3a3e46);
    rect(ctx, x, y, w, h, [.2, .72, .45, .03], 0xf0e8c0);
  },
  // Music player: album cover, title, progress bar, play controls.
  music: (ctx, x, y, w, h) => {
    fill(ctx, x, y, w, h, 0x2a1838);
    for (let j = 0; j < h; j++) fill(ctx, x, y + j, w, 1, shade(0x2a1838, 1 + j / h * .4));
    rect(ctx, x, y, w, h, [.12, .1, .76, .38], 0xe8783a); // album cover
    rect(ctx, x, y, w, h, [.3, .18, .4, .2], 0xf2c04a);
    rect(ctx, x, y, w, h, [.42, .22, .16, .12], 0x2a1838);
    rect(ctx, x, y, w, h, [.12, .54, .6, .03], 0xf4f4f4); // title
    rect(ctx, x, y, w, h, [.12, .59, .4, .02], 0xa898b8); // artist
    rect(ctx, x, y, w, h, [.12, .66, .76, .012], 0x5a4a6a); rect(ctx, x, y, w, h, [.12, .66, .45, .012], 0xf4f4f4); // progress
    rect(ctx, x, y, w, h, [.18, .74, .1, .06], 0xd8d0e0); rect(ctx, x, y, w, h, [.72, .74, .1, .06], 0xd8d0e0); // skip
    rect(ctx, x, y, w, h, [.42, .72, .05, .1], 0xffffff); rect(ctx, x, y, w, h, [.53, .72, .05, .1], 0xffffff); // pause
    rect(ctx, x, y, w, h, [.33, .955, .34, .012], 0xd0d0d0);
  },
};

function phone(p, screen, glow) {
  const { L, W, T } = PHONE;
  bevel(p, 'graphite bumper', [-W / 2, 0, -L / 2, W / 2, T, L / 2], .0035, plasticP(0x3c4246));
  for (const x of [-W / 2, W / 2]) {
    p.box(`brushed rail ${x}`, [x - .0004, .003, -.061, x + .0004, .006, .061], steelP(0x698687));
  }
  top(p, 'black glass border', [-W / 2 + .003, -L / 2 + .002, W / 2 - .003, L / 2 - .002], T + .0003, flat(0x151c25));
  top(p, 'screen', [-W / 2 + .005, -L / 2 + .009, W / 2 - .005, L / 2 - .006], T + .0009, layers(flat(0), screen), glow ? { glow: true } : {});
  top(p, 'earpiece', [-.011, -L / 2 + .004, .011, -L / 2 + .006], T + .0009, flat(0x54606a));
  cyl(p, 'selfie lens', 'y', [.019, T + .0008, -L / 2 + .006], .0017, .0005, 8, flat(0x40505c));
  p.box('USB charging socket', [-.006, .003, L / 2 - .0005, .006, .006, L / 2 + .0005], flat(0x181c20));
  for (const z of [-.042, -.025]) bevel(p, `volume ${z}`, [-W / 2 - .001, .003, z, -W / 2 + .0002, .006, z + .011], .0003, steelP(0x7f9a98));
  bevel(p, 'power', [W / 2 - .0002, .003, -.046, W / 2 + .001, .006, -.027], .0003, plasticP(0xc59260));
}

const PHONE_DESC = 'A popular, fancy smartphone.  Capable of taking photos with its integrated camera and illuminating an area with its flashlight app, assuming it has enough charge.  The smartphone also has a clock app that includes an alarm and an app for tracking consumed calories.  Runs on a small, rechargeable power cell compatible with a Unified Power Supply.';
const LOCKED_DESC = 'A popular, fancy smartphone.  Sadly for you, its previous user used its security features, rendering you unable to use most of its qualities.  You are still able to check the time and use a flashlight.  Runs on a small, rechargeable power cell compatible with a Unified Power Supply.';
const PHONES = [
  { id: 'smart_phone', desc: `${PHONE_DESC}  (111 ml, longest side 15 cm: a 15 × 7.3 cm phone lying face up, graphite bumper, the screen off.)`, build: (p) => phone(p, SCREENS.off, false) },
  { id: 'smart_phone_flashlight', desc: `${PHONE_DESC}  (copy-from smart_phone, flashlight on: the same phone, the screen lit with the flashlight app's glowing torch button.)`, build: (p) => phone(p, SCREENS.torch, true) },
  { id: 'smart_phone_locked', desc: `${LOCKED_DESC}  (The same phone lying face up, the lock screen lit: padlock, clock, the flashlight and camera buttons.)`, build: (p) => phone(p, SCREENS.locked, true) },
  { id: 'smart_phone_locked_flashlight', desc: `${LOCKED_DESC}  (copy-from smart_phone_locked, flashlight on: the lock screen with its flashlight button lit.)`, build: (p) => phone(p, (ctx, x, y, w, h, side) => SCREENS.locked(ctx, x, y, w, h, side, true), true) },
  { id: 'smartphone_music', desc: 'This phone is playing music, steadily raising your morale.  You can\'t hear anything else while you\'re listening.  (copy-from smart_phone: the same phone lying face up, the music player lit: album cover, track title, progress bar, pause button.)', build: (p) => phone(p, SCREENS.music, true) },
];

// --- whistles -------------------------------------------------------------------------------------

/** A referee whistle lying on its side: the round chamber, the flat mouthpiece toward +x, the air slot on top, a ring at the back. */
function whistle(p, { metal, opts, r = .011, len = .03 }) {
  cyl(p, 'chamber', 'y', [0, r * .75, 0], r, r * 1.5, 12, metal, opts);
  bevel(p, 'mouth', [0, r * .2, -r * .55, len + .004, r * 1.3, r * .55], .002, metal, opts);
  top(p, 'slot', [r * .2, -r * .3, r * .75, r * .3], r * 1.5 + .0002, flat(0x1a1a1a));
  top(p, 'blowhole', [len - .002, -r * .3, len + .0035, r * .3], r * 1.3 + .0002, flat(0x2a2a2a));
  loop(p, 'ring', [-r - .004, .0015, 0], .005, .0012, steelP(0xb8bcc0), STEEL, 8);
}

const WHISTLES = [
  { id: 'whistle', desc: 'A simple metal whistle, with a cord to wear it around your neck.  (10 ml, 25 g: a 5 cm chrome referee whistle lying on its side, its cotton neck cord in a loose loop.)', build: (p) => {
    whistle(p, { metal: steelP(0xd0d4d8), opts: STEEL });
    // The neck cord: a loose loop of cotton cord trailing from the ring.
    const cord = flat(0x2a3a6a);
    const pts = [];
    for (let k = 0; k <= 14; k++) { const a = (k / 14) * 2 * Math.PI; pts.push(V(-.075 + Math.cos(a) * .058 + (k % 2) * .004, .002, Math.sin(a) * .05)); }
    for (let k = 0; k < 14; k++) tube(p, `cord${k}`, pts[k], pts[k + 1], .0018, .0018, 4, cord);
    tube(p, 'tail', V(-.02, .002, 0), V(-.016, .002, 0), .002, .002, 4, cord);
  } },
  { id: 'dog_whistle', desc: 'A small whistle.  When blown into, it produces a high tone that causes nearby friendly dogs to either follow you closely and stop attacking, or start attacking enemies if they are currently docile.  (5 ml, 22 g: a slim 6.5 cm steel pipe whistle lying down, mouthpiece, sound slot, tuning screw cap at the far end, key ring.)', build: (p) => {
    const st = steelP(0xc8ccd0), y = .005;
    cyl(p, 'pipe', 'x', [0, y, 0], .0045, .05, 10, st, STEEL);
    cyl(p, 'mouth', 'x', [.031, y, 0], .0035, .012, 10, st, STEEL, .003);
    top(p, 'slot', [.012, -.0018, .019, .0018], y + .0046, flat(0x1a1a1a));
    // Knurled tuning cap: yellow-brass, the CDDA colour of the item.
    cyl(p, 'cap', 'x', [-.029, y, 0], .0052, .01, 10, layers(steelP(0xc8a848), (ctx, x0, y0, w, h) => { for (let i = 0; i < w; i += 2) fill(ctx, x0 + i, y0, 1, h, 0x9a7a2a); }), STEEL);
    loop(p, 'ring', [-.044, .0012, 0], .009, .0011, steelP(0xb8bcc0), STEEL, 10);
  } },
  { id: 'dog_whistle_wood', desc: 'A whistle carved out of hardwood.  When blown into, it produces a high tone that causes nearby friendly dogs to either follow you closely and stop attacking, or start attacking enemies if they are currently docile.  (20 ml, 50 g: an 8 cm carved hardwood whistle lying down, tapered mouthpiece, the cut sound notch, a leather thong through the hole at the back.)', build: (p) => {
    const wood = woodP(0x7a4a28), y = .0075;
    cyl(p, 'body', 'x', [-.005, y, 0], .0075, .055, 8, wood);
    cyl(p, 'mouth', 'x', [.031, y, 0], .0065, .018, 8, wood, {}, .005);
    // The sound notch: a dark wedge cut into the top.
    hull(p, 'notch', [V(.008, y + .0072, -.003), V(.008, y + .0072, .003), V(.016, y + .0072, -.003), V(.016, y + .0072, .003), V(.016, y + .004, -.003), V(.016, y + .004, .003)], flat(0x2a180c));
    cyl(p, 'end', 'x', [-.034, y, 0], .0068, .004, 8, woodP(0x5a3418));
    loop(p, 'thong', [-.05, .0015, 0], .014, .0014, flat(0x6a4a2a), {}, 10);
  } },
];

// --- the rest -------------------------------------------------------------------------------------

const ITEMS_4 = [
  { id: 'brush_toilet', desc: 'Zombies cannot be intimidated or humiliated, so this stiff brush is only useful for scouring toilet bowls.  (500 ml, 160 g: a 38 cm white toilet brush lying down, plastic handle with a hanging hole, steel wire stem, round head of stiff white bristles.)', build: (p) => {
    const white = plasticP(0xf0f0ec);
    // Bristle head: a fat round brush, rows of stiff bristle tufts, its twisted wire core poking out.
    const bristles = layers(speckle('toiletbrush', 0xe8e8e2, [0xd8d8d0, 0xf4f4f0], .5), (ctx, x, y, w, h) => { for (let i = 1; i < w; i += 3) fill(ctx, x + i, y, 1, h, 0xc8c8c0); });
    cyl(p, 'head', 'x', [.12, .042, 0], .042, .09, 10, bristles);
    cyl(p, 'tip', 'x', [.166, .042, 0], .004, .006, 6, steelP(0xb8bcc0), STEEL);
    // Steel stem into the handle, the handle resting on the ground at its far end.
    tube(p, 'stem', V(.075, .042, 0), V(-.02, .022, 0), .0035, .0035, 6, steelP(0xb8bcc0), STEEL);
    tube(p, 'handle', V(-.02, .022, 0), V(-.215, .009, 0), .009, .009, 8, white);
    tube(p, 'collar', V(-.026, .0225, 0), V(-.005, .024, 0), .0105, .0105, 8, plasticP(0xd8d8d4));
    top(p, 'hole', [-.208, -.004, -.196, .004], .0185, flat(0x3a3a3a));
  } },

  { id: 'trashcan', desc: 'A big trashcan in which you can store, you guessed it, trash.  Made out of plastic, so it\'s watertight but fragile and won\'t survive if you try to carry something really heavy in it.  (56 L, longest side 51 cm, 1 kg: a light grey round plastic bin 51 cm tall, tapering out toward the top, rolled rim, two side grips, ribs round the body, open.)', build: (p) => {
    const grey = layers(plasticP(0xb8bcbe), (ctx, x, y, w, h) => { for (const t of [.18, .5, .82]) fill(ctx, x, y + Math.round(h * t), w, 1, 0x989c9e); });
    // Tapered wall, double-sided so the inside shows through the open top.
    cyl(p, 'wall', 'y', [0, .245, 0], .165, .49, 16, grey, { cutout: true, open: true }, .2);
    cyl(p, 'bottom', 'y', [0, .006, 0], .165, .012, 16, plasticP(0xa0a4a6));
    cyl(p, 'inside', 'y', [0, .0125, 0], .155, .001, 16, flat(0x5a5e60));
    cyl(p, 'rim', 'y', [0, .5, 0], .208, .022, 16, plasticP(0xc4c8ca), { cutout: true, open: true }, .21);
    cyl(p, 'lip', 'y', [0, .5, 0], .2, .022, 16, plasticP(0xa8acae), { cutout: true, open: true }, .2);
    // Side grips under the rim, left and right.
    for (const s of [-1, 1]) bevel(p, `grip${s}`, [s < 0 ? -.235 : .19, .43, -.06, s < 0 ? -.19 : .235, .455, .06], .006, plasticP(0xa8acae));
  } },

  { id: 'protein_bar_evac', desc: 'SoyPelusa ran a highly successful crowdfunding campaign for their signature protein bar, dubbed "DaiZoom."  A person can live on one of these bars, three times a day, presumably forever.  After backers received their product, a single flaw was found: most consumers found starvation preferable to the flavor.  Warehouses of the product went unsold as the company went bankrupt, providing the perfect opportunity for FEMA to scoop them up and stock the evac shelters.  (170 ml, 180 g: a 14 × 5 × 2.4 cm bar in a green foil wrapper, crimped seals at both ends, the DaiZoom label and a FEMA ration stencil.)', build: (p) => {
    const G = 0x3e7a3a;
    const wrap = layers(speckle('daizoom', G, [shade(G, 1.06), shade(G, .94)], .15), (ctx, x, y, w, h) => {
      if (w < h * 1.6) return; // only the broad faces carry the print
      rect(ctx, x, y, w, h, [.08, .15, .52, .7], 0xf2e6b8); // the label
      rect(ctx, x, y, w, h, [.12, .25, .44, .18], 0xd8402a); // "DaiZoom" banner
      for (let k = 0; k < 3; k++) rect(ctx, x, y, w, h, [.12, .52 + k * .1, .4 - k * .08, .05], 0x4a4030); // print
      rect(ctx, x, y, w, h, [.68, .25, .24, .5], 0x2a4a28); // the FEMA stencil box
      rect(ctx, x, y, w, h, [.72, .35, .16, .08], 0xe8e8d8);
      rect(ctx, x, y, w, h, [.72, .55, .16, .08], 0xe8e8d8);
    });
    qbox(p, 'bar', [-.07, 0, -.025, .07, .024, .025], wrap);
    // Crimped seals: thin ribbed fins at both ends.
    const crimp = layers(steelP(shade(G, 1.1)), (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 2) fill(ctx, x + i, y, 1, h, shade(G, .75)); });
    for (const s of [-1, 1]) pane(p, `seal${s}`, [V(s * .07, .012, -.026), V(s * .085, .012, -.026), V(s * .085, .012, .026), V(s * .07, .012, .026)], .0015, crimp);
  } },

  { id: 'bowl_plastic', desc: 'A piece of plastic tupperware with a matching watertight lid.  Holds 750 mL of liquid.  (1.46 L, longest side 20 cm: a 20 × 14 × 7 cm clear plastic box, tapering toward the bottom, its blue snap lid on with a pull tab and four clip flaps.)', build: (p) => {
    // Clear, frosted body, wider at the top.
    const body = [];
    for (const [y, a, b] of [[0, .088, .058], [.06, .1, .07]]) for (const sx of [-1, 1]) for (const sz of [-1, 1]) body.push(V(sx * a, y, sz * b));
    hull(p, 'tub', body, layers(flat(0xdfe8ea), (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * .55), w, Math.max(1, Math.round(h * .08)), 0xc4d4d8)));
    // Blue snap lid with a raised centre panel and a pull tab at one corner.
    const blue = plasticP(0x3a7ac8);
    bevel(p, 'lid', [-.1, .06, -.07, .1, .068, .07], .004, blue);
    bevel(p, 'panel', [-.08, .068, -.05, .08, .071, .05], .002, plasticP(0x4a8ad8));
    hull(p, 'tab', [V(.096, .062, .064), V(.11, .062, .078), V(.096, .067, .064), V(.11, .066, .078), V(.104, .062, .056), V(.104, .066, .056)], blue);
    // Clip flaps folded down on each side.
    for (const [x, z, w, d] of [[0, -.072, .04, .003], [0, .072, .04, .003], [-.102, 0, .003, .03], [.102, 0, .003, .03]]) bevel(p, `clip${x}${z}`, [x - w / 2, .048, z - d / 2, x + w / 2, .068, z + d / 2], .001, blue);
  } },

  { id: 'postman_hat', desc: 'A traditional mail carrier\'s cap, with the US postal service logo embroidered on the front above the plastic brim.  A symbol of a bygone world.  (750 ml, 90 g: a navy-blue cotton cap with a stiff peaked crown, black plastic brim forward (−Z), the embroidered white-and-red eagle logo on the front, a button on top.)', build: (p) => {
    const navy = 0x1e2c5a, cloth = clothP(navy);
    // Crown: wider at the top than the headband, a slightly raised front, like a service cap.
    const pts = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a);
      pts.push(V(c * .095, 0, s * .1), V(c * .1, .06, s * .105), V(c * .085, s < 0 ? .1 : .085, s * .09));
    }
    hull(p, 'crown', pts, cloth);
    cyl(p, 'band', 'y', [0, .018, 0], .0975, .036, 16, flat(0x111a3a), {}, .0985);
    // Embroidered patch on the front: the eagle's head over the stripes.
    const patch = layers(flat(navy), (ctx, x, y, w, h) => {
      rect(ctx, x, y, w, h, [.1, .1, .8, .8], 0xf2f2f2);
      rect(ctx, x, y, w, h, [.2, .2, .55, .3], 0x1e2c5a);
      rect(ctx, x, y, w, h, [.65, .3, .2, .1], 0xd8b030); // beak
      rect(ctx, x, y, w, h, [.42, .28, .08, .08], 0xf2f2f2); // eye
      for (let k = 0; k < 3; k++) rect(ctx, x, y, w, h, [.15, .58 + k * .1, .7, .05], 0xc82a2a); // the red stripes
    });
    pane(p, 'logo', [V(-.035, .042, -.106), V(.035, .042, -.106), V(.033, .087, -.094), V(-.033, .087, -.094)], .002, patch);
    // Black plastic brim, a stiff half-ellipse forward, tipped slightly down.
    const brim = [];
    for (let k = 0; k <= 10; k++) { const a = Math.PI + (k / 10) * Math.PI, c = Math.cos(a), s = Math.sin(a); brim.push(V(c * .095, .01, s * .1 - .002), V(c * .095, .014, s * .1 - .002), V(c * .085, -.006 + .01, s * .1 - .07 * Math.abs(s) * .9 - .003)); }
    hull(p, 'brim', brim.map((q) => V(q.x, Math.max(q.y, .002), Math.min(q.z, -.002))), plasticP(0x141416));
    cyl(p, 'button', 'y', [0, .087, .004], .008, .005, 8, flat(0x111a3a));
  } },

  { id: 'envelope', desc: 'A flat paper container with a sealable flap, used to enclose a letter or other paper goods.  (80 ml, longest side 241 mm: a #10 white envelope 24 × 10.5 cm lying back up, its flap folded open with the glue strip, the side folds showing.)', build: (p) => {
    const L = .241, W = .105, T = .003, white = 0xf2f0e8;
    const back = layers(speckle('envelope', white, [shade(white, .97)], .1), (ctx, x, y, w, h) => {
      // The side and bottom folds that make the back: a V from both lower corners up to the middle.
      for (let i = 0; i < w; i++) {
        const t = i < w / 2 ? i / (w / 2) : (w - i) / (w / 2);
        fill(ctx, x + i, y + Math.round(h * (1 - t * .55)), 1, 1, 0xc8c4b8);
      }
    });
    top(p, 'back', [-L / 2, -W / 2, L / 2, W / 2], T, back);
    bevel(p, 'body', [-L / 2, 0, -W / 2, L / 2, T - .0003, W / 2], .0006, flat(white));
    // The open flap: a trapezoid lying flat beyond the top edge (−z), the glue strip along its edge.
    const flap = layers(flat(shade(white, .98)), (ctx, x, y, w, h) => { for (let i = 0; i < w; i++) { const t = Math.min(i, w - 1 - i) / (w * .18); if (t < 1) fill(ctx, x + i, y + Math.round(h * t * .9), 1, 1, 0xc8c4b8); } rect(ctx, x, y, w, h, [.24, .74, .52, .14], 0xe0d8a8); });
    pane(p, 'flap', [V(-L / 2, .0006, -W / 2), V(L / 2, .0006, -W / 2), V(L / 2 - .045, .0006, -W / 2 - .05), V(-L / 2 + .045, .0006, -W / 2 - .05)], .0008, flap);
  } },
];

// 1.25 L in CDDA. Modelled at typical DSLR dimensions with the zoom lens attached.
function professionalCamera(p) {
  const body = plasticP(0x34373b);
  const trim = plasticP(0x22252a);
  const grip = speckle('camera rubber', 0x303035, [0x424248, 0x24262a], .65);
  const lensX = -.010, lensY = .046;

  bevel(p, 'magnesium chassis', [-.071, 0, -.010, .068, .080, .059], .007, body);
  bevel(p, 'moulded hand grip', [.039, .001, -.035, .075, .081, .052], .009, grip);
  bevel(p, 'lens-side shoulder', [-.074, .015, -.014, -.055, .071, .052], .005, grip);
  hull(p, 'pentaprism housing', [
    V(-.039, .074, -.012), V(.025, .074, -.012), V(.025, .074, .052), V(-.039, .074, .052),
    V(-.029, .102, .003), V(.016, .102, .003), V(.016, .106, .042), V(-.029, .106, .042),
  ], body);
  bevel(p, 'built-in flash diffuser', [-.023, .087, -.009, .010, .095, -.003], .0015, flat(0xc6c8bd));
  p.box('hot shoe rail left', [-.020, .104, .015, -.015, .109, .037], steelP(0x8b8b89));
  p.box('hot shoe rail right', [-.001, .104, .015, .004, .109, .037], steelP(0x8b8b89));
  p.box('hot shoe plate', [-.015, .104, .013, -.001, .106, .034], trim);
  cyl(p, 'mode dial', 'y', [-.051, .081, .031], .011, .009, 12, grip);
  cyl(p, 'mode dial cap', 'y', [-.051, .086, .031], .008, .002, 12, flat(0x55575a));
  cyl(p, 'shutter release', 'y', [.057, .080, -.023], .0065, .005, 12, steelP(0x898c8b));
  p.box('top status LCD', [.034, .080, .007, .060, .081, .033], flat(0x71817b));

  cyl(p, 'lens mount', 'z', [lensX, lensY, -.012], .037, .010, 16, steelP(0x666b69));
  cyl(p, 'fixed lens barrel', 'z', [lensX, lensY, -.037], .034, .039, 18, body);
  const ridgedRing = layers(grip, (ctx, x, y, w, h, side) => {
    if (!side.startsWith('side')) return;
    for (let j = 1; j < h; j += 2) fill(ctx, x, y + j, w, 1, 0x222329);
  });
  cyl(p, 'ribbed zoom collar', 'z', [lensX, lensY, -.040], .0365, .022, 18, ridgedRing);
  cyl(p, 'extended lens tube', 'z', [lensX, lensY, -.067], .0305, .035, 18, trim);
  cyl(p, 'ribbed focus collar', 'z', [lensX, lensY, -.069], .032, .012, 18, ridgedRing);
  cyl(p, 'front glass', 'z', [lensX, lensY, -.083], .023, .004, 20, flat(0x344752));
  cyl(p, 'lens bezel', 'z', [lensX, lensY, -.086], .032, .007, 20, trim, { open: true });
  // The inner wall slopes toward the recessed glass. Its open ends leave the optical surface visible.
  cyl(p, 'inner aperture wall', 'z', [lensX, lensY, -.086], .025, .007, 20, trim,
    { open: true, cutout: true }, .022);
  const point = (r, k) => {
    const a = (k + .5) * Math.PI / 10;
    return V(lensX + r * Math.cos(a), lensY + r * Math.sin(a), -.0896);
  };
  for (let k = 0; k < 20; k++) {
    poly(p, `lens front rim ${k}`, [point(.025,k), point(.032,k), point(.032,k+1), point(.025,k+1)], V(0, 0, -1),
      flat(k % 5 === 0 ? 0x626b6e : 0x414449));
  }
  pane(p, 'coating reflection', [V(lensX-.014,.054,-.0852), V(lensX-.004,.065,-.0852),
    V(lensX+.012,.061,-.0852), V(lensX+.003,.051,-.0852)], .0002, flat(0x526a74));

  bevel(p, 'optical viewfinder eyecup', [-.032, .077, .050, .014, .102, .065], .004, grip);
  p.box('viewfinder glass', [-.023, .083, .063, .006, .093, .066], flat(0x485c64));
  bevel(p, 'rear screen frame', [-.055, .016, .057, .025, .065, .064], .003, trim);
  pane(p, 'rear LCD', [V(-.050,.021,.0645), V(.020,.021,.0645), V(.020,.060,.0645), V(-.050,.060,.0645)],
    .0008, layers(flat(0x283139), (ctx, x, y, w, h) => {
      for (let j = 0; j < h; j++) {
        const left = Math.round(w * (.58 - j / h * .37));
        fill(ctx, x + left, y + j, w - left, 1, 0x35414a);
      }
    }));
  cyl(p, 'rear command wheel', 'z', [.043, .031, .061], .010, .005, 12, grip);
  cyl(p, 'selection button', 'z', [.043, .031, .064], .004, .002, 10, steelP(0x777d7e));
  for (const y of [.051, .062, .071]) cyl(p, `rear button ${y}`, 'z', [.041, y, .060], .0035, .003, 8, trim);
  p.box('side port cover', [-.074, .024, .005, -.070, .061, .032], trim);
}

const CAMERAS = [{
  id: 'camera_pro',
  desc: 'A 35 mm digital SLR with a zoom lens, an optical viewfinder, a rear LCD and a built-in flash. Typical DSLR dimensions estimated from the 1250 ml CDDA item.',
  build: professionalCamera,
  batchByMaterial: true,
}];

export const ITEMS4 = [...ITEMS_4, ...WHISTLES, ...PHONES, ...CAMERAS].map((r) => ({ ...r, dir: 'items', ppm: 512, source: 'tools/cubeclysm/page/items4.js' }));
