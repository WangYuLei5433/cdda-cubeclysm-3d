// Cubeclysm items and furniture, batch 3 (asked for by name: fire extinguisher, training dummies,
// dust masks, Uzi, gasoline lantern, plastic jerrycan, lighter, hinge). One model per CDDA id,
// after its description (quoted in `desc`, CDDA 7136388) and its size: items at real size lying
// or standing on the ground (origin = the item's centre on the ground), furniture standing in
// its tile.
import * as THREE from 'three';

import { V, bevel, cyl, flat, hull, layers, pane, speckle, fill, shade, STEEL, GLASS, tube, loop, blob, woodP, steelP, plasticP, clothP, band } from './item-kit.js';

// --- training dummies -------------------------------------------------------------------------
// "A hand-made humanoid figure … made from wood and has some duct tape to mark the striking points"
// / "covered in scrap armor and looks on guard". 1.75 m figure on a post; the item is the same
// figure lying on its back with its post, the furniture stands with the post in the ground.

const WOOD = 0x9a7048, TAPE = 0xb8bcc0, SCRAP = [0x7a7c80, 0x6a6c70, 0x8a7a6a];
const tape = (hex = WOOD) => layers(woodP(hex), (ctx, x, y, w, h) => { fill(ctx, x, y + Math.round(h * .42), w, Math.max(1, Math.round(h * .16)), TAPE); });
const scrap = (k) => layers(speckle(`scrap${k}`, SCRAP[k % 3], [shade(SCRAP[k % 3], 1.1), shade(SCRAP[k % 3], .85), 0x8a4a22], .3), (ctx, x, y, w, h) => {
  for (const [rx, ry] of [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]]) fill(ctx, x + rx, y + ry, 1, 1, 0xd0d0cc);
});

/**
 * The figure, standing, its feet (the post's top) at y = `base`: post, torso, head, arms. `guard`
 * raises the forearms in front of the face; `armor` adds scrap plates over torso, head and arms.
 */
function dummy(p, { base, armor = false, guard = false, parent }) {
  const o = { parent };
  const b = (name, box, paint, opts = {}) => bevel(p, name, [box[0], box[1] + base, box[2], box[3], box[4] + base, box[5]], .008, paint, { ...o, ...opts });
  b('post', [-.05, -base, -.05, .05, .82, .05], woodP(0x7a5434));
  b('hips', [-.17, .82, -.1, .17, 1.0, .1], woodP(WOOD));
  b('torso', [-.2, 1.0, -.12, .2, 1.45, .12], tape());
  b('neck', [-.05, 1.45, -.05, .05, 1.53, .05], woodP(WOOD));
  b('head', [-.11, 1.53, -.11, .11, 1.75, .11], tape());
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -.3 : .2, x1 = s < 0 ? -.2 : .3;
    b(`upper${s}`, [x0, 1.12, -.05, x1, 1.44, .05], tape());
    if (guard) b(`fore${s}`, [x0 + s * -.02, 1.28, -.32, x1 + s * -.02, 1.38, -.04], woodP(WOOD)); // forearms up, toward the front (−Z)
    else b(`fore${s}`, [x0, .86, -.05, x1, 1.12, .05], tape());
  }
  if (!armor) return;
  // Scrap plates: chest and back, a face plate with a slit, shoulder plates, forearm guards.
  b('chest', [-.22, 1.06, -.15, .22, 1.42, -.12], scrap(0), STEEL);
  b('back', [-.22, 1.06, .12, .22, 1.42, .15], scrap(1), STEEL);
  b('belly', [-.19, .88, -.13, .19, 1.04, -.1], scrap(2), STEEL);
  b('faceplate', [-.12, 1.55, -.14, .12, 1.74, -.11], layers(scrap(1), (ctx, x, y, w, h) => fill(ctx, x + Math.round(w * .15), y + Math.round(h * .35), Math.round(w * .7), Math.max(1, Math.round(h * .1)), 0x1a1a1a)), STEEL);
  b('helmet', [-.13, 1.72, -.13, .13, 1.79, .13], scrap(0), STEEL);
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -.33 : .18, x1 = s < 0 ? -.18 : .33;
    b(`pauldron${s}`, [x0, 1.36, -.08, x1, 1.48, .08], scrap(2), STEEL);
    if (guard) b(`guard${s}`, [x0 + s * -.02, 1.27, -.34, x1 + s * -.02, 1.4, -.24], scrap(s < 0 ? 0 : 1), STEEL);
  }
}

/** The item: the figure lying on its back, post first along −x (1.8 m long in all). */
function lyingDummy(p, opts) {
  // Standing figure → lying on its back: its up (+y) → +x, its front (−z) → up (+y), its
  // right (+x) → −z (a rotation, not a mirror). Lifted so its back (z up to `back`) rests on y = 0.
  const back = opts.armor ? .15 : .12;
  const g = p.group('lying', { at: [-.9, back, 0] });
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(0, 0, -1), V(1, 0, 0), V(0, -1, 0)));
  dummy(p, { ...opts, base: 0, parent: g });
}

// --- the recipes --------------------------------------------------------------------------------

const RED = 0xc22a22;
const BLUE_P = 0x2a5ac8;

const ITEMS_3 = [
  { id: 'extinguisher', desc: 'An emergency fire extinguisher containing five gallons of fire-retardant foam.  Useful for putting out adjacent fires.  (20 L, longest side 50 cm, 7 kg: a red cylinder 22 cm across standing, valve head with lever and gauge, hose and nozzle, white label.)', build: (p) => {
    const red = layers(speckle('ext-red', RED, [shade(RED, 1.08), shade(RED, .92)], .15), (ctx, x, y, w, h) => {
      // White label with black lines on the front half.
      fill(ctx, x + Math.round(w * .1), y + Math.round(h * .35), Math.round(w * .3), Math.round(h * .3), 0xf0eee8);
      for (let j = 0; j < 4; j++) fill(ctx, x + Math.round(w * .13), y + Math.round(h * (.39 + j * .06)), Math.round(w * .24), 1, 0x2a2a2a);
    });
    cyl(p, 'tank', 'y', [0, .2, 0], .11, .4, 14, red, STEEL);
    cyl(p, 'dome', 'y', [0, .42, 0], .11, .04, 14, flat(RED), STEEL, .08);
    cyl(p, 'base', 'y', [0, .006, 0], .112, .012, 14, flat(0x2a2a2a));
    cyl(p, 'valve', 'y', [0, .455, 0], .025, .03, 8, steelP(0xb0b4b8), STEEL);
    bevel(p, 'head', [-.03, .47, -.035, .03, .49, .035], .004, flat(0x1e1e20));
    bevel(p, 'lever', [-.015, .49, -.04, .015, .5, .1], .003, steelP(0xb8bcc0), STEEL);
    bevel(p, 'handle', [-.015, .445, .02, .015, .455, .1], .003, steelP(0xb8bcc0), STEEL);
    cyl(p, 'gauge', 'z', [.035, .47, -.035], .014, .008, 10, layers(flat(0xf4f4f0), (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h / 2), Math.round(w / 2), 1, 0x2a8a2a)));
    // Hose from the head round the tank to the nozzle clipped on its side.
    tube(p, 'hose1', V(-.03, .47, 0), V(-.1, .42, -.05), .009, .009, 6, flat(0x1a1a1a));
    tube(p, 'hose2', V(-.1, .42, -.05), V(-.12, .2, -.03), .009, .009, 6, flat(0x1a1a1a));
    cyl(p, 'nozzle', 'y', [-.12, .15, -.03], .014, .09, 8, flat(0x1a1a1a), {}, .02);
  } },

  { id: 'training_dummy_light', desc: 'A hand-made humanoid figure, useful for training in close quarters combat.  This one is made from wood and has some duct tape to mark the striking points.  Use the construction menu (* by default) to embed it into the ground for training.  (80 L, 50 kg: the 1.75 m wooden figure lying on its back with its post, duct tape round head, chest and arms.)', build: (p) => {
    lyingDummy(p, {});
  } },
  { id: 'training_dummy_heavy', desc: 'A hand-made humanoid figure, useful for training in close quarters combat.  This one is covered in scrap armor and looks on guard.  Use the construction menu (* by default) to embed it into the ground for training.  (80 L, 55 kg: the figure lying on its back, scrap plates bolted over chest, back, face and shoulders, forearms raised in guard.)', build: (p) => {
    lyingDummy(p, { armor: true, guard: true });
  } },

  // "A simple piece of cotton that straps over the mouth": a cupped white pad with two elastic loops.
  ...[['mask_dust', 1, '(100 ml: a white cotton pad 15 × 10 cm with two elastic straps, lying.)'], ['xl_mask_dust', 1.3, '(XL size of the same mask: 20 × 13 cm, larger loops.)']].map(([id, s, size]) => ({ id, desc: `A simple piece of cotton that straps over the mouth.  Provides a small amount of protection from airborne illness and dust.  ${size}`, build: (p) => {
    const cotton = layers(clothP(0xf2f2ee), (ctx, x, y, w, h) => { for (let j = 2; j < h; j += 3) fill(ctx, x, y + j, w, 1, 0xe2e2dc); });
    blob(p, 'pad', [.075 * s, .022 * s, .05 * s], [0, .012 * s, 0], cotton, {}, 3, 10);
    bevel(p, 'nosewire', [-.03 * s, .028 * s, -.048 * s, .03 * s, .032 * s, -.042 * s], .001, steelP(0xc8ccd0), STEEL);
    for (const z of [-.025 * s, .025 * s]) loop(p, `strap${z}`, [0, .003, z], .085 * s, .0025, flat(0xe8e6e0), {}, 12);
  } })),

  { id: 'uzi', desc: 'The Uzi 9x19mm has enjoyed immense popularity, selling more units than any other submachine gun.  It is widely used as a personal defense weapon, or as a primary weapon by elite frontline forces.  (Longest side 480 mm, 3.5 kg: boxy stamped receiver, pistol grip in the middle with the magazine through it, short barrel, folding stock open, lying on its side.)', build: (p) => {
    const black = speckle('uzi', 0x2a2b2e, [0x323336, 0x242528], .2);
    const g = p.group('gun', { at: [0, .025, 0], rotX: Math.PI / 2 }); // lying on its left side
    const o = { ...STEEL, parent: g };
    // Gun axis along x, up = +y before the turn.
    bevel(p, 'receiver', [-.12, -.03, -.025, .14, .035, .025], .004, black, o);
    bevel(p, 'topcover', [-.1, .035, -.02, .12, .045, .02], .003, layers(black, (ctx, x, y, w, h) => { for (let i = 2; i < w; i += 5) fill(ctx, x + i, y, 1, h, 0x1a1a1c); }), o);
    bevel(p, 'cocking', [.03, .045, -.006, .05, .057, .006], .002, flat(0x1a1a1c), o);
    cyl(p, 'barrel', 'x', [.17, .01, 0], .009, .07, 8, flat(0x1e1f22), o);
    bevel(p, 'frontsight', [.13, .045, -.008, .145, .07, .008], .002, black, o);
    // Pistol grip with the magazine running through it, a trigger guard in front.
    bevel(p, 'grip', [-.02, -.13, -.02, .03, -.03, .02], .005, layers(flat(0x1e1e20), (ctx, x, y, w, h) => { for (let j = 1; j < h; j += 3) fill(ctx, x, y + j, w, 1, 0x2e2e30); }), o);
    bevel(p, 'magazine', [-.012, -.2, -.013, .022, -.13, .013], .003, flat(0x34363a), o);
    bevel(p, 'magbase', [-.016, -.21, -.016, .026, -.2, .016], .002, flat(0x1a1a1c), o);
    hull(p, 'triggerguard', [V(.035, -.03, -.006), V(.035, -.03, .006), V(.075, -.03, -.006), V(.075, -.03, .006), V(.04, -.075, -.006), V(.04, -.075, .006), V(.075, -.07, -.006), V(.075, -.07, .006)], black, o);
    bevel(p, 'trigger', [.045, -.06, -.003, .052, -.035, .003], .001, flat(0x1a1a1c), o);
    // Folding metal stock, open: two struts to a butt plate.
    for (const z of [-.015, .015]) tube(p, `strut${z}`, V(-.12, .015, z), V(-.27, -.01, z), .005, .005, 5, steelP(0x3a3b3e), o);
    bevel(p, 'buttplate', [-.29, -.06, -.025, -.27, .03, .025], .003, flat(0x1e1e20), o);
  } },

  // A small gasoline lantern: fuel fount, pump, glass globe in a wire guard, vented hood, bail.
  ...[['gasoline_lantern', false, 'Use it to turn it on.'], ['gasoline_lantern_on', true, 'It is turned on.  Use it to turn it off.']].map(([id, on, use]) => ({ id, desc: `A small gasoline-powered lantern.  It does not provide much light, but it lasts a long time.  ${use}  (750 ml, 1.4 kg: a 30 cm yellow-enamelled lantern, ${on ? 'the mantle glowing, warm light through the globe' : 'the globe clear, the mantle white and unlit'}.)`, build: (p) => {
    const yellow = speckle('lantern', 0xd8b030, [0xe0bc40, 0xc8a028], .15);
    cyl(p, 'fount', 'y', [0, .045, 0], .07, .09, 12, band(yellow, 0x8a6a1a, .7, .8), STEEL, .065);
    cyl(p, 'pump', 'x', [.07, .06, 0], .007, .04, 6, steelP(0xc8ccd0), STEEL);
    cyl(p, 'collar', 'y', [0, .1, 0], .055, .02, 12, steelP(0xb8bcc0), STEEL);
    cyl(p, 'globe', 'y', [0, .165, 0], .045, .11, 12, on ? flat(0xfff0b8) : flat(0xe4f2f6), on ? { glow: true } : GLASS);
    blob(p, 'mantle', [.014, .022, .014], [0, .16, 0], flat(on ? 0xfff8e0 : 0xf2f0e8), on ? { glow: true } : {}, 3, 6);
    for (let k = 0; k < 4; k++) { const a = (k / 4) * 2 * Math.PI + .4; tube(p, `guard${k}`, V(Math.cos(a) * .05, .11, Math.sin(a) * .05), V(Math.cos(a) * .05, .225, Math.sin(a) * .05), .0018, .0018, 4, steelP(0x9a9ea2), STEEL); }
    cyl(p, 'hood', 'y', [0, .235, 0], .06, .025, 12, yellow, STEEL, .03);
    cyl(p, 'vent', 'y', [0, .255, 0], .028, .015, 10, layers(flat(0x8a6a1a), (ctx, x, y, w, h) => { for (let i = 1; i < w; i += 3) fill(ctx, x + i, y, 1, h, 0x2a2a2a); }), STEEL);
    // Wire bail handle, folded up.
    tube(p, 'bail1', V(-.03, .26, 0), V(-.02, .3, 0), .0018, .0018, 4, steelP(0x9a9ea2), STEEL);
    tube(p, 'bail2', V(-.02, .3, 0), V(.02, .3, 0), .0018, .0018, 4, steelP(0x9a9ea2), STEEL);
    tube(p, 'bail3', V(.02, .3, 0), V(.03, .26, 0), .0018, .0018, 4, steelP(0x9a9ea2), STEEL);
  } })),

  { id: 'jerrycan', desc: 'A bulky plastic jerrycan, meant to carry fuel, but can carry other liquids in a pinch.  (10.5 L, longest side 33 cm: a green plastic can 33 × 16 × 26 cm standing, three-bar handle, spout cap, X-ribbed sides.)', build: (p) => {
    const green = layers(plasticP(0x3a7a3a), (ctx, x, y, w, h, side) => {
      if (side !== 'left' && side !== 'right') return;
      // The X-shaped stiffening ribs on the broad sides.
      for (let t = 0; t < Math.min(w, h); t++) {
        const a = Math.round((t * w) / Math.min(w, h)), b = Math.round((t * h) / Math.min(w, h));
        fill(ctx, x + a, y + b, 2, 1, 0x2e622e);
        fill(ctx, x + w - 1 - a, y + b, 2, 1, 0x2e622e);
      }
    });
    bevel(p, 'body', [-.08, 0, -.165, .08, .25, .165], .012, green);
    for (const z of [-.06, 0, .06]) bevel(p, `bar${z}`, [-.012, .25, z - .01, .012, .29, z + .01], .003, plasticP(0x3a7a3a));
    bevel(p, 'grip', [-.014, .28, -.08, .014, .3, .08], .004, plasticP(0x3a7a3a));
    cyl(p, 'spout', 'y', [0, .262, -.13], .02, .03, 10, plasticP(0x3a7a3a));
    cyl(p, 'cap', 'y', [0, .282, -.13], .024, .018, 10, plasticP(0x1e1e20));
  } },

  { id: 'lighter', desc: 'A disposable plastic lighter, capable of creating a small flame with the flick of a finger.  Allows you to use various drugs like cigarettes, light explosives like Molotov cocktails, or light nearby items on fire.  (14 ml: an 8 cm blue plastic lighter lying on its side, aluminium hood, flint wheel.)', build: (p) => {
    bevel(p, 'body', [-.04, 0, -.012, .025, .024, .012], .003, layers(flat(0x2a5ac8), (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * .55), w, Math.max(1, Math.round(h * .2)), 0x6a8ae0)), GLASS);
    bevel(p, 'fuel', [-.036, .002, -.009, .02, .012, .009], .002, flat(0x5a7ad8), GLASS);
    bevel(p, 'hood', [.025, .001, -.011, .042, .023, .011], .002, steelP(0xc8ccd0), STEEL);
    cyl(p, 'wheel', 'y', [.033, .012, 0], .007, .01, 10, layers(flat(0x5a5c60), (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 2) fill(ctx, x + i, y, 1, h, 0x3a3c40); }), STEEL);
    bevel(p, 'button', [.02, .022, -.006, .03, .026, .006], .001, flat(0x1e1e20));
  } },

  { id: 'hinge', desc: 'A small metal hinge with two metal plates with screw holes.  Useful for making doors or chests.  (A 10 cm butt hinge lying opened flat: two steel leaves, three screw holes each, the knuckle and pin between them.)', build: (p) => {
    const leaf = layers(steelP(0xb0bcc4), (ctx, x, y, w, h, side) => {
      if (side !== 'top') return;
      for (const t of [.2, .5, .8]) { const cx = x + Math.round(w * .55), cy = y + Math.round(h * t); fill(ctx, cx - 1, cy - 1, 3, 3, 0x2a2c30); }
    });
    for (const s of [-1, 1]) bevel(p, `leaf${s}`, [s < 0 ? -.045 : .006, 0, -.05, s < 0 ? -.006 : .045, .003, .05], .001, leaf, STEEL);
    cyl(p, 'knuckle', 'z', [0, .005, 0], .0055, .1, 8, steelP(0x9aa4ac), STEEL);
    for (const z of [-.052, .052]) cyl(p, `pin${z}`, 'z', [0, .005, z], .006, .004, 8, flat(0x7a848c), STEEL);
  } },
];

const FURNITURE_3 = [
  { id: 'f_training_dummy_light', desc: 'A hand-made humanoid figure, useful for training in close quarters combat.  This one is made from wood and has some duct tape to mark the striking points.  It has been erected in the ground on its post.  (A 1.75 m wooden figure on its post, duct tape round head, chest and arms.)', build: (p) => {
    dummy(p, { base: 0 });
    pane(p, 'earth', [V(-.12, .004, -.12), V(.12, .004, -.12), V(.12, .004, .12), V(-.12, .004, .12)], .006, speckle('dummy-earth', 0x5e4a34, [0x6a5440, 0x4e3e2c], .5));
  } },
  { id: 'f_training_dummy_heavy', desc: 'A hand-made humanoid figure, useful for training in close quarters combat.  This one is covered in scrap armor and looks on guard.  It has been erected in the ground on its post.  (The figure on its post, scrap plates over chest, back, face and shoulders, forearms raised in guard.)', build: (p) => {
    dummy(p, { base: 0, armor: true, guard: true });
    pane(p, 'earth', [V(-.12, .004, -.12), V(.12, .004, -.12), V(.12, .004, .12), V(-.12, .004, .12)], .006, speckle('dummy-earth', 0x5e4a34, [0x6a5440, 0x4e3e2c], .5));
  } },
];

export const ITEMS3 = [
  ...ITEMS_3.map((r) => ({ ...r, dir: 'items', ppm: 512, source: 'tools/cubeclysm/page/items3.js' })),
  ...FURNITURE_3.map((r) => ({ ...r, dir: 'furniture', ppm: 64, source: 'tools/cubeclysm/page/items3.js' })),
];
