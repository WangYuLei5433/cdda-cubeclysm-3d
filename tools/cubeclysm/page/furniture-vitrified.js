// Black-glass furniture and figures from the vitrified locations. Use actual recesses,
// splinters, and separate frozen objects where the catalog describes them.
import { FURNITURE } from './furniture.js';
import { FURNITURE_BATCH } from './furniture-batch.js';
import {
  K, box, cyl, hollowTube, tray, cabinet, legs, lead, borePanel, family, flat, glass, grid, layers, fill,
  sides,
} from './furniture-extra-kit.js';

const onyx = K.steelP(0x2b2e36);
const edge = K.steelP(0x444752);
const deep = K.stoneP(0x20212b);
const sand = K.stoneP(0x252126);
const smokeGlass = glass(0x757885);
const gleam = { metal: true };

function solid(p, name, dims, pos, paint = onyx) {
  box(p, name, dims, paint, pos, gleam);
}

function splinter(p, name, [x, y, z], height, w, translucent = false) {
  K.hull(p, name, [K.V(x - .61 * w, y, z - .5 * w), K.V(x + .65 * w, y, z - .4 * w),
    K.V(x + .31 * w, y, z + .73 * w), K.V(x - .56 * w, y, z + .29 * w),
    K.V(x + .31 * w, y + height, z - .3 * w), K.V(x - .5 * w, y + height * .55, z + .5 * w)],
  translucent ? smokeGlass : edge, translucent ? K.GLASS : gleam);
}

const sourceRecipes = new Map([...FURNITURE, ...FURNITURE_BATCH].map((r) => [r.id.slice(2), r]));
function petrify(p, id) {
  const start = p.blocks.length;
  sourceRecipes.get(id).build(p);
  for (const block of p.blocks.slice(start)) {
    const paint = block.paint;
    block.glow = false;
    if (block.glass) block.paint = smokeGlass;
    else {
      block.metal = !block.cutout;
      block.paint = (ctx, x, y, w, h, face) => {
        paint(ctx, x, y, w, h, face);
        const img = ctx.getImageData(x, y, w, h);
        for (let i = 0; i < img.data.length; i += 4) {
          const gray = (img.data[i] * 2 + img.data[i + 1] * 3 + img.data[i + 2]) / 6;
          const v = Math.round(22 + gray * .15);
          img.data[i] = v;
          img.data[i + 1] = v + 1;
          img.data[i + 2] = v + 7;
        }
        ctx.putImageData(img, x, y);
      };
    }
  }
}

const furnitureBases = {
  bathtub: 'bathtub', bed: 'bed', birdbath: 'birdbath', counter: 'counter', cupboard: 'cupboard', desk: 'desk',
  fireplace: 'fireplace', firering: 'firering', oven: 'gas_oven', planter: 'planter', rack: 'rack_l', sink: 'sink',
  table: 'table',
};

function frozenFire(p, y, height, size) {
  for (let i = 0; i < 8; i++) {
    const a = i * 2.4, r = size * (.27 + p.r() * .56);
    splinter(p, 'translucent-frozen-flame', [Math.cos(a) * r, y, Math.sin(a) * r - .115],
      height * (.44 + p.r() * .61), .087, true);
  }
}

function basic(p, id) {
  const kind = id.slice('vitrified_'.length);
  if (kind === 'armchair' || kind === 'sofa') {
    const armchair = kind === 'armchair';
    const w = armchair ? .76 : .992;
    K.bevel(p, 'black-glass-upholstered-plinth', [-w / 2, .048, -.407, w / 2, .366, .386], .038, onyx, gleam);
    for (const x of [-w * .391, w * .391]) for (const z of [-.316, .285]) {
      solid(p, 'hard-glass-sofa-foot', [.083, .063, .078], [x, 0, z], deep);
    }
    for (let i = 0; i < (armchair ? 1 : 2); i++) {
      const x = armchair ? 0 : (i - .5) * w * .46;
      const span = armchair ? .255 : w * .225;
      K.bevel(p, 'overstuffed-glassy-seat-cushion', [x - span, .331, -.366, x + span, .497, .195], .047, edge, gleam);
      K.bevel(p, 'cold-glass-back-cushion', [x - span, .435, .165, x + span, .837, .382], .049, onyx, gleam);
    }
    if (armchair) for (const x of [-.313, .313]) {
      K.bevel(p, 'overstuffed-glass-arm-cushion', [x - .065, .352, -.358, x + .065, .632, .231], .039, edge, gleam);
    }
    return;
  }
  if (kind === 'floor_lamp') {
    cyl(p, 'black-glass-lamp-foot', 'y', [0, .031, 0], .171, .061, onyx, .157, 10);
    cyl(p, 'thin-glass-standard', 'y', [0, .755, 0], .027, 1.46, edge, .019);
    K.cyl(p, 'translucent-glass-lampshade', 'y', [0, 1.545, 0], .219, .282, 12,
      glass(0x666c7a), { glass: true, open: true }, .141);
    hollowTube(p, 'rolled-glass-shade-bottom-rim', 'y', [0, 1.408, 0], .222, .211, .019, edge, 12);
    hollowTube(p, 'rolled-glass-shade-top-rim', 'y', [0, 1.689, 0], .146, .135, .018, edge, 12);
    K.blob(p, 'dim-glass-bulb', [.061, .073, .059], [0, 1.527, 0], glass(0x9d9baf), K.GLASS, 4, 8);
    return;
  }
  if (kind === 'shower') {
    solid(p, 'dark-glass-drain-tray', [.79, .079, .83], [0, 0, 0]);
    for (const x of [-.371, .371]) solid(p, 'black-glass-enclosure-jamb', [.044, 1.83, .042], [x, .08, .346], edge);
    box(p, 'translucent-shower-back', [.76, 1.78, .049], smokeGlass, [0, .083, .365], K.GLASS);
    box(p, 'translucent-shower-side', [.026, 1.77, .733], glass(0x555662), [.381, .082, 0], K.GLASS);
    lead(p, 'glass-shower-riser', [[0, .594, .334], [0, 1.77, .334], [0, 1.81, .187]], .019, edge);
    cyl(p, 'porous-shower-head', 'y', [0, 1.77, .187], .112, .059, edge, .084, 10);
    for (let i = 0; i < 12; i++) {
      const a = i * 2.4;
      const x = Math.cos(a) * .094, z = Math.sin(a) * .086;
      const y = .56 + (i % 4) * .125;
      lead(p, 'black-glass-shower-stream', [[x * .70, 1.748, .188 + z * .70], [x, 1.28, .180 + z],
        [x * 1.24, y, .175 + z * 1.29]], .007, edge);
      for (const k of [0, .27]) K.blob(p, 'pearl-like-frozen-shower-droplet', [.016, .033, .016],
        [x * (1.24 - k * .37), y + .051 + k, .175 + z * (1.23 - k * .40)], smokeGlass, K.GLASS, 3, 6);
    }
    return;
  }
  if (kind === 'toilet') {
    K.bevel(p, 'black-glass-pedestal', [-.142, 0, -.169, .142, .275, .169], .032, onyx, gleam);
    K.blob(p, 'molded-onyx-bowl', [.208, .151, .279], [0, .336, -.092], onyx, gleam, 4, 10);
    K.blob(p, 'fused-shut-glass-lid', [.214, .042, .267], [0, .448, -.103], edge, gleam, 3, 12);
    solid(p, 'tank-to-bowl-joining-piece', [.316, .159, .153], [0, .335, .142]);
    K.bevel(p, 'glassy-closed-cistern', [-.216, .411, .133, .216, .758, .322], .033, onyx, gleam);
    solid(p, 'glassy-cistern-rim', [.422, .024, .206], [0, .742, .225], edge);
    return;
  }
  if (kind === 'bench') {
    for (const x of [-.321, .32]) solid(p, 'black-glass-bench-foot', [.155, .391, .325], [x, 0, 0]);
    K.bevel(p, 'low-cracked-bench-slab', [-.485, .363, -.226, .485, .467, .226], .018,
      layers(onyx, (ctx, x, y, w, h) => {
        for (let i = 0; i < 11; i++) {
          const j = Math.round(h * .38 + Math.sin(i * .85) * h * .20);
          fill(ctx, x + w * .12 + i * w * .068, y + j, 2, 1, 0x62616a);
        }
      }), gleam);
    return;
  }
  if (kind === 'chair') {
    legs(p, .466, .432, .444, onyx, .055);
    solid(p, 'thin-semi-transparent-seat', [.459, .019, .427], [0, .438, 0], edge);
    for (const x of [-.204, .204]) solid(p, 'glass-back-upright', [.037, .44, .039], [x, .442, .194]);
    solid(p, 'fragile-back-panel', [.403, .198, .025], [0, .655, .191], edge);
    splinter(p, 'crunching-seat-fracture', [-.13, .458, -.094], .039, .06, true);
    return;
  }
  if (kind === 'locker') {
    K.bevel(p, 'fused-glass-locker', [-.303, 0, -.236, .303, 1.792, .236], .025, onyx, gleam);
    for (const y of [1.43, .233]) solid(p, 'glassy-locker-vent', [.28, .085, .012], [0, y, -.243],
      layers(edge, grid(0x282a33, 1, 4)));
    solid(p, 'fused-locker-handle', [.081, .122, .028], [.181, .95, -.254], edge);
    return;
  }
  if (kind === 'box') {
    tray(p, 'razor-edged-black-glass-box', [.708, .617, .704], edge, [0, 0, 0], .016);
    for (const x of [-.355, .355]) solid(p, 'thin-obsidean-edge', [.014, .014, .711], [x, .616, 0], edge);
    return;
  }
  if (kind === 'bookcase' || kind === 'bookcase_talker') {
    cabinet(p, [.90, 1.72, .46], onyx, [.383, .758, 1.123]);
    for (const [i, y] of [.059, .428, .803, 1.172].entries()) {
      for (let j = 0; j < 10; j++) {
        if (kind.endsWith('talker') && i === 2 && j === 5) continue;
        const x = -.367 + j * .0805;
        solid(p, 'fused-inscribed-book-spine', [.068, .204 + (j % 3) * .039, .286], [x, y, -.041],
          layers(j % 2 ? edge : onyx, sides(['front'], grid(0x717079, 2, 5))));
      }
    }
    return;
  }
  if (kind === 'flower') {
    lead(p, 'bowed-wispy-glass-stem', [[0, .006, 0], [.012, .218, .005], [.038, .384, -.02],
      [.081, .42, -.12]], .012, edge);
    for (const [x, y, z] of [[.015, .14, .005], [.027, .248, -.008], [.038, .31, -.01]]) {
      splinter(p, 'translucent-glass-barb', [x + .02, y, z + .017], .085, .051, true);
    }
    for (let i = 0; i < 6; i++) {
      const g = p.group('translucent-glass-petal', { at: [.084, .411, -.12], rotY: i * Math.PI / 3 });
      K.pane(p, 'bent-petal', [K.V(0, 0, 0), K.V(.107, .036, .019),
        K.V(.122, -.024, .072), K.V(.041, -.057, .057)], .012, smokeGlass, { parent: g, glass: true });
    }
    return;
  }
  if (kind === 'doll') {
    solid(p, 'black-glass-sofa-base', [.83, .28, .62], [0, 0, 0]);
    K.bevel(p, 'hard-glass-cushion', [-.408, .27, -.299, .408, .44, .293], .037, onyx, gleam);
    K.bevel(p, 'glass-sofa-back', [-.408, .42, .208, .408, .84, .331], .029, edge, gleam);
    K.lump(p, 'featureless-plush-torso', [.154, .07, .188], K.clothP(0x987d74), id, {}, [.06, .429, -.058]);
    K.lump(p, 'empty-plush-head', [.078, .074, .078], K.clothP(0x9b8175), id + '-head', {}, [.06, .446, -.252]);
    return;
  }
  petrify(p, furnitureBases[kind]);
  if (kind === 'bathtub') {
    lead(p, 'frozen-onyx-pouring-column', [[.373, .57, 0], [.354, .499, -.025], [.338, .282, -.011],
      [.328, .137, .008]], .029, edge);
    for (const r of [.067, .103]) hollowTube(p, 'onyx-tub-splash-ripple', 'y', [.328, .119, .009], r, r - .009, .018, edge, 8);
  } else if (kind === 'bed' || kind === 'planter' || kind === 'rack') {
    const baseY = kind === 'bed' ? .53 : kind === 'planter' ? .223 : .85;
    if (kind === 'bed') for (let i = 0; i < 4; i++) {
      const x = -.422 + i * .197;
      K.pane(p, 'raised-rumpled-cover', [K.V(x, .53, -.44), K.V(x + .184, .57, -.38),
        K.V(x + .190, .552, .226), K.V(x + .04, .61, .293)], .023, i % 2 ? edge : onyx, gleam);
    }
    const count = kind === 'bed' ? 7 : 10;
    for (let i = 0; i < count; i++) {
      const x = (p.r() - .5) * .71, z = (p.r() - .5) * .46, y = baseY + (kind === 'rack' ? (i % 3 - 1) * .4 : 0);
      if (kind === 'planter') lead(p, 'twisted-frozen-sprout', [[x, y, z], [x - .046, y + .15, z + .026], [x + .028, y + .23, z]],
        .016, edge);
      splinter(p, kind === 'bed' ? 'splintered-blanket-fold' : 'fused-glass-miscellany', [x, y, z],
        .062 + p.r() * .11, .055 + p.r() * .044);
    }
  } else if (kind === 'birdbath') {
    K.blob(p, 'glass-bird-body', [.10, .068, .127], [.031, .752, -.03], smokeGlass, K.GLASS, 3, 8);
    K.blob(p, 'raised-glass-bird-head', [.057, .063, .056], [.017, .852, -.097], edge, gleam, 3, 8);
    lead(p, 'bird-bill', [[.017, .841, -.138], [.024, .837, -.191]], .019, edge);
  } else if (kind === 'counter' || kind === 'desk') {
    const y = kind === 'counter' ? .90 : .79;
    solid(p, 'fused-paper-and-notes', [.19, .017, .15], [-.195, y, .043], edge);
    for (let i = 0; i < 5; i++) {
      const x = .068 + i * .055;
      lead(p, kind === 'desk' ? 'glass-pens' : 'fused-utensils', [[x, y + .019, -.137], [x + .022, y + .022, .042]],
        .011, edge);
    }
    cyl(p, 'fused-glass-cup', 'y', [.236, y + .043, .115], .068, .086, edge, .061);
  } else if (kind === 'fireplace' || kind === 'firering' || kind === 'oven') {
    frozenFire(p, kind === 'firering' ? .021 : kind === 'fireplace' ? .106 : .899,
      kind === 'firering' ? .40 : kind === 'fireplace' ? .509 : .323, kind === 'oven' ? .224 : .31);
  } else if (kind === 'sink') {
    const centerZ = -.054;
    cyl(p, 'black-glass-pool', 'y', [0, .875, centerZ], .147, .013, deep, undefined, 14);
    for (const r of [.061, .103, .143]) {
      hollowTube(p, 'frozen-concentric-sink-ripple', 'y', [0, .885, centerZ], r, r - .008, .015, edge, 10);
    }
    splinter(p, 'splash-point', [0, .881, centerZ], .103, .046, true);
  } else if (kind === 'table') {
    for (const [x, z, w] of [[-.197, .140, .103], [.219, -.253, .153], [.099, .314, .066]]) {
      K.blob(p, 'shallow-frozen-spill', [w, .018, w * .67], [x, .761, z], smokeGlass, K.GLASS, 3, 8);
    }
  }
}

function hingedGlass(p, id) {
  const kind = id.slice('vitrified_'.length);
  const fridge = kind === 'fridge', dresser = kind === 'dresser', mail = kind === 'mailbox';
  const laundry = kind === 'washer' || kind === 'dryer';
  if (laundry) {
    const washer = kind === 'washer';
    solid(p, 'appliance-base', [.593, .094, .612], [0, 0, 0], edge);
    solid(p, 'dark-appliance-worktop', [.604, .096, .621], [0, .766, 0]);
    solid(p, 'dark-appliance-back', [.599, .672, .035], [0, .094, .291]);
    for (const x of [-.286, .286]) solid(p, 'dark-appliance-side', [.036, .68, .603], [x, .09, 0]);
    solid(p, 'dead-control-panel', [.516, .055, .024], [0, .783, -.319], edge);
    const mid = .429;
    borePanel(p, 'solid-glass-door-fascia', [-.287, .095, .287, .763], [0, mid, -.306], .187, flat(0x2e3036), gleam);
    hollowTube(p, 'recessed-drum-rim', 'z', [0, mid, -.316], .221, .176, .066, edge, 12);
    hollowTube(p, 'recessed-drum-wall', 'z', [0, mid, -.105], .181, .16, .367, onyx, 12);
    cyl(p, 'deep-drum-back', 'z', [0, mid, .079], .165, .012, deep, undefined, 12);
    if (washer) cyl(p, 'drum-filled-with-black-sand', 'z', [0, mid - .016, -.265], .16, .019, sand, undefined, 12);
    if (washer) {
      const spill = p.group('spill-edge', { at: [0, 0, -.339] });
      K.crumple(p, 'spilled-black-sand', .249, .115, .078, sand, id, { parent: spill });
      box(p, 'black-sand-lip', [.167, .035, .085], sand, [0, 0, 0], { parent: spill });
    } else {
      const door = p.group('hanging-glass-dryer-door', { at: [-.229, .422, -.342], rotY: 1.24 });
      K.cyl(p, 'glazed-dryer-door', 'z', [.20, 0, 0], .179, .043, 12, smokeGlass, { parent: door, glass: true });
      for (let i = 0; i < 7; i++) splinter(p, 'shattered-laundry-fragment', [(p.r() - .5) * .22, .28 + i % 3 * .044, -.365],
        .07 + p.r() * .04, .041, true);
    }
    return;
  }
  const w = fridge ? .71 : dresser ? .88 : mail ? .372 : .71;
  const h = fridge ? 1.78 : dresser ? 1.61 : mail ? .242 : .87;
  const d = fridge ? .66 : dresser ? .61 : mail ? .505 : .635;
  const y = mail ? .85 : 0;
  if (mail) {
    solid(p, 'mailbox-post', [.082, .87, .08], [0, 0, .064]);
    solid(p, 'mailbox-bottom', [w, .028, d], [0, y, 0]);
    solid(p, 'mailbox-back', [w, h, .026], [0, y, d / 2 - .013]);
    for (const x of [-w / 2 + .013, w / 2 - .013]) solid(p, 'mailbox-side', [.026, h, d], [x, y, 0]);
    solid(p, 'mailbox-roof', [w + .036, .069, d], [0, y + h, 0], edge);
    for (let i = 0; i < 5; i++) solid(p, 'sharp-stacked-envelope', [.12, .017, .16], [(i % 2 ? -.035 : .045), y + .034 + i * .02, -.11], edge);
    const flap = p.group('opened-mailbox-flap', { at: [0, y, -d / 2], rotX: -1.24 });
    box(p, 'dropped-mailbox-door', [w, h, .027], onyx, [0, 0, 0], { parent: flap, metal: true });
    return;
  }
  cabinet(p, [w, h, d], onyx, fridge ? [.363, .69, 1.044, 1.384] : dresser ? [.14] : [.42]);
  if (dresser) {
    for (const side of [-1, 1]) {
      const pivot = p.group('partly-open-glass-cabinet-door', { at: [side * .411, .08, -.304], rotY: -side * (side < 0 ? .22 : .63) });
      box(p, 'glassy-door-stile', [.072, 1.47, .042], onyx, [-side * .04, 0, 0], { parent: pivot, metal: true });
      box(p, 'glassy-opaque-door-panel', [.294, 1.407, .036], edge, [-side * .215, .03, 0], { parent: pivot, metal: true });
      box(p, 'small-door-pull', [.039, .108, .036], onyx, [-side * .348, .658, -.034], { parent: pivot });
    }
    solid(p, 'fused-clothes-hanger-rail', [.726, .031, .041], [0, 1.40, -.063], edge);
    for (let i = 0; i < 7; i++) {
      const x = -.306 + i * .095;
      lead(p, 'rigid-glass-hanger', [[x, 1.401, -.069], [x + .01, 1.323, -.068], [x, 1.284, -.158]],
        .012, edge);
      K.pane(p, 'rigid-folded-garment', [K.V(x, 1.258, -.16), K.V(x + .019, 1.226, .089),
        K.V(x + .017, .865 + (i % 3) * .086, .064), K.V(x, .866 + (i % 3) * .085, -.135)],
        .022, i % 2 ? onyx : edge, gleam);
    }
    return;
  }
  const door = p.group('ajar-onyx-door', { at: [-w / 2 + .031, .06, -d / 2 + (fridge ? .15 : .16)],
    rotY: fridge ? .83 : 0, rotX: fridge ? 0 : -1.29 });
  box(p, 'glassy-door-slab', [w - .057, fridge ? h - .118 : .45, .061], onyx, [(w - .057) / 2, 0, 0], { parent: door, metal: true });
  box(p, 'glassy-handle', [.039, .14, .052], edge, [w * .76, fridge ? h * .59 : .40, -.039], { parent: door });
  if (fridge) {
    for (const y of [.401, .733, 1.089, 1.424]) for (const x of [-.192, -.047, .131]) {
      cyl(p, 'fused-food-protrusion', 'y', [x, y + (x < 0 ? .049 : .083), -.054], x < 0 ? .065 : .044, x < 0 ? .098 : .165,
        x > 0 ? edge : onyx, undefined, 7);
    }
  } else {
    for (let i = 0; i < 7; i++) cyl(p, 'plate-buried-in-black-sand', 'x', [-.243 + i * .077, .493, -.048], .105, .022, edge, undefined, 9);
    solid(p, 'black-sand-covered-rack', [.571, .055, .41], [0, .42, -.069], sand);
  }
}

function burstHeater(p, id) {
  const h = 1.318, r = .29;
  cyl(p, 'black-glass-heater-base', 'y', [0, .041, 0], r, .082, edge, .276, 10);
  hollowTube(p, 'hollow-burst-heater-cylinder', 'y', [0, h / 2 + .065, 0], r, .23, h, onyx, 12);
  for (let i = 0; i < 11; i++) {
    const a = i * Math.PI * 2 / 11;
    const x = Math.cos(a) * .273, z = Math.sin(a) * .273;
    if (i % 3 !== 1) splinter(p, 'shattered-heater-top-rim', [x, h + .062, z], .084 + (i % 3) * .064, .104, true);
    if (i % 3 !== 0) lead(p, 'black-sand-rivulet', [[x, h + .06, z], [x * 1.04, h * .63, z * 1.02],
      [x * 1.02, h * .51, z * 1.04]], .024, sand);
  }
  K.pile(p, 'spilled-black-sand', .364, .092, sand, id);
}

// Joint endpoints for one statue per description. Every figure is modeled as vitrified glass.
const poses = {
  1: { hip: [0, .91, .09], head: [.035, 1.47, .344], footR: [.225, .408, -.355],
    knees: [[-.118, .465, -.075], [.17, .706, -.181]], arms: [[-.392, 1.12, -.116], [.312, 1.27, -.233]] },
  2: { arms: [[-.035, 1.525, -.254], [.073, 1.54, -.236]], elbows: [[-.21, 1.124, -.195], [.224, 1.115, -.207]] },
  3: { scale: .62, smile: true, hip: [0, .848, .023], head: [0, 1.47, 0], arms: [[-.226, .83, -.031], [.19, .843, .049]] },
  4: { hip: [0, .373, .11], head: [0, 1.082, -.045], footL: [-.11, .062, .291], footR: [.11, .062, .291],
    knees: [[-.116, .105, -.215], [.119, .105, -.215]], arms: [[-.04, .786, -.335], [.038, .786, -.335]] },
  5: { hip: [.029, .91, .036], head: [.099, 1.57, .025], arms: [[.08, 1.364, -.456], [.112, 1.306, -.377]] },
  6: { hip: [.11, .89, .013], head: [.263, 1.516, .068], arms: [[-.247, .988, -.062], [.445, 1.076, -.056]] },
  7: { arms: [[-.038, 1.393, -.119], [.082, 1.357, -.139]], drops: true },
  8: { hollow: true, arms: [[-.207, .832, -.056], [.215, .822, .073]] },
  9: { hip: [.015, .78, .16], head: [.018, 1.171, -.285], arms: [[-.075, .908, -.195], [.088, .92, -.181]] },
  10: { jagged: true, head: [.037, 1.58, .065], arms: [[-.241, .925, -.107], [.247, .793, -.071]] },
  11: { hip: [0, .72, .06], head: [0, 1.444, -.22], footL: [-.255, .055, -.212], footR: [.251, .055, .339],
    arms: [[-.233, 1.21, -.385], [.241, 1.353, -.305]], openMouth: true },
  12: { hip: [.03, .49, .18], head: [.025, 1.041, -.183], footL: [-.151, .059, .023], footR: [.143, .058, .278],
    knees: [[-.167, .263, -.249], [.154, .272, -.181]], arms: [[-.223, .816, -.401], [.222, .828, -.405]] },
  13: { hip: [0, .81, .12], head: [.035, 1.225, -.356], split: true, arms: [[-.191, .798, -.418], [.182, .877, -.424]] },
  14: { hip: [0, .912, .014], head: [.02, 1.608, .108], arms: [[-.327, .913, .016], [.311, .983, .046]], openMouth: true },
  15: { hip: [0, .771, .094], head: [-.057, 1.325, -.186],
    elbows: [[-.27, .657, -.209], [.221, .896, -.09]], arms: [[-.272, .065, -.321], [.183, .781, -.269]], jagged: true },
};

function glassedBody(p, id) {
  const o = poses[+id.split('_').at(-1)];
  const sc = o.scale ?? 1;
  const v = (coords) => coords.map((x) => x * sc);
  const hip = o.hip ?? [0, .908, .035], head = o.head ?? [0, 1.577, -.034];
  const neck = [head[0], head[1] - .165, head[2] + .044];
  const shoulder = [(hip[0] + neck[0] * 3) / 4, neck[1] - .05, neck[2] * .89 + hip[2] * .11];
  const gl = o.jagged ? edge : onyx;
  for (const [i, s] of [-1, 1].entries()) {
    const foot = (i ? o.footR : o.footL) ?? [s * .104, .06, i ? .045 : -.044];
    const knee = o.knees?.[i] ?? [s * .116, (hip[1] + foot[1]) * .51, foot[2] - .056];
    const legTop = [hip[0] + s * .103, hip[1] - (o.split ? .161 : 0), hip[2]];
    lead(p, 'faceted-glass-leg', [v(foot), v(knee), v(legTop)], .071 * sc, gl, gleam);
    const [x, y, z] = v(foot);
    K.bevel(p, 'solid-glass-foot', [x - .063 * sc, Math.max(0, y - .06 * sc), z - .091 * sc,
      x + .063 * sc, y + .043 * sc, z + .068 * sc], .011, onyx, gleam);
    const arm = o.arms[i];
    const shoulderSide = [shoulder[0] + s * .164, shoulder[1], shoulder[2]];
    const elbow = o.elbows?.[i] ?? [(shoulderSide[0] + arm[0]) * .5 + s * .041,
      (shoulderSide[1] + arm[1]) * .5 - .09, (shoulderSide[2] + arm[2]) * .5 + .035];
    lead(p, 'angular-glass-arm', [v(shoulderSide), v(elbow), v(arm)], .049 * sc, gl, gleam);
    K.blob(p, 'glass-hand', [.041 * sc, .064 * sc, .033 * sc], v(arm), edge, gleam, 3, 5);
  }
  lead(p, 'angular-torso', [v([hip[0], hip[1] + (o.split ? .145 : 0), hip[2]]), v(shoulder)], .153 * sc, gl, gleam);
  lead(p, 'vitrified-neck', [v(shoulder), v(neck), v([head[0], head[1] + .012, head[2]])], .066 * sc, gl, gleam);
  const [x, y, z] = v(head);
  if (o.hollow) {
    hollowTube(p, 'smooth-scooped-head-recess', 'z', [x, y, z + .017], .134, .077, .179, edge, 10);
    cyl(p, 'smooth-recess-interior', 'z', [x, y, z + .087], .093, .03, deep, undefined, 9);
  } else {
    K.lump(p, 'angular-black-glass-head', [.122 * sc, .141 * sc, .105 * sc], gl, id + '-face', gleam, [x, y - .114 * sc, z]);
    if (o.openMouth || o.smile) {
      K.blob(p, o.smile ? 'small-glass-smile' : 'dark-frozen-scream-recess', [.036 * sc, (o.smile ? .0095 : .038) * sc, .012],
        [x, y - .030 * sc, z - .090 * sc], deep, { metal: true }, 3, 8);
    }
    if (id.endsWith('_15')) for (const [xx, yy] of [[-.065, .025], [.047, .054]]) {
      const eye = p.group('misaligned-glassy-eye', { at: [x + xx, y + yy, z - .093], rotZ: -.20 });
      box(p, 'faint-eye-facet', [.031, .016, .012], edge, [0, 0, 0], { parent: eye, metal: true });
    }
  }
  if (o.drops) for (let i = 0; i < 5; i++) {
    K.blob(p, 'connected-glass-droplet', [.023, .033, .025], [-.02 + i * .043, 1.371 - i * .014, -.161 - i * .037],
      smokeGlass, K.GLASS, 3, 5);
  }
}

export const VITRIFIED_FURNITURE = [
  ...family(basic, `vitrified_armchair vitrified_bathtub vitrified_bed vitrified_bench vitrified_birdbath vitrified_bookcase
    vitrified_bookcase_talker vitrified_box vitrified_chair vitrified_counter vitrified_cupboard vitrified_desk vitrified_doll
    vitrified_fireplace vitrified_firering vitrified_floor_lamp vitrified_flower vitrified_locker vitrified_oven vitrified_planter
    vitrified_rack vitrified_shower vitrified_sink vitrified_sofa vitrified_table vitrified_toilet`),
  ...family(hingedGlass, 'vitrified_dishwasher vitrified_dresser vitrified_dryer vitrified_fridge vitrified_mailbox vitrified_washer'),
  ...family(burstHeater, 'vitrified_water_heater'),
  ...family(glassedBody, Object.keys(poses).map((n) => 'glassedbody_' + n).join(' ')),
].map((r) => ({ ...r, source: 'tools/cubeclysm/page/furniture-vitrified.js' }));
