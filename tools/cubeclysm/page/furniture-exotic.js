import {
  K, box, cyl, hollowTube, tray, legs, tank, cabinet, display, label, lead, family,
  flat, glass, grid, layers, fill, iron, steel, cream, black, copper,
} from './furniture-extra-kit.js';

const chitin = K.stoneP(0x7c726a);
const dull = K.steelP(0x525a59);
const purple = K.steelP(0x594958);
const pink = flat(0xad649b);
const jade = flat(0x94bc80);
const resin = glass(0xc6a867);
const oxide = K.steelP(0x876451);
const strangeInk = layers(K.steelP(0x81745d), grid(0x4e554c, 9, 4));

function glyph(ctx, x, y, w, h) {
  fill(ctx, x, y, w, h, 0x58635a);
  for (let j = 2; j < h - 2; j += 4) for (let i = 3; i < w - 3; i += 5) {
    fill(ctx, x + i, y + j, i % 3 + 1, 1, 0xb5a982);
    fill(ctx, x + i * .98, y + j - 1, 1, 3, 0x8da39b);
  }
}

function saucer(p, [x, y, z], radius, paint = steel) {
  const support = p.group('tilted-dish', { at: [x, y, z], rotX: -.46, rotZ: .15 });
  const r = radius;
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI / 5, b = (i + 1) * Math.PI / 5;
    const at = (t, d, yy) => K.V(Math.cos(t) * d, yy, Math.sin(t) * d);
    K.pane(p, 'parabolic-facet', [at(a, r, .13), at(b, r, .13), at(b, r * .24, .011), at(a, r * .24, .011)],
      .017, paint, { parent: support });
  }
  box(p, 'dish-feed-support', [.038, .202, .044], iron, [0, .006, 0], { parent: support });
  K.cyl(p, 'dish-feed', 'y', [0, .218, 0], .062, .054, 8, dull, { parent: support });
}

function organic(p, id) {
  if (id === 'absence') {
    K.crumple(p, 'void-rim', .445, .442, .004, flat(0x382e3d), id);
    K.crumple(p, 'lightless-void', .418, .417, .008, flat(0x111116), id);
    return;
  }
  if (id.startsWith('alien_pod')) {
    const clean = id.endsWith('resin');
    const organ = id.endsWith('organ');
    const gel = clean ? 0xb6ae65 : organ ? 0x829879 : 0x8d9562;
    lead(p, 'arched-suspension-stalk', [[-.29, .021, .115], [-.256, .53, .092], [-.141, 1.05, .065],
      [.013, 1.29, .065], [.04, 1.15, .009]], .044, chitin);
    K.blob(p, 'translucent-pod-membrane', [.216, .391, .209], [.035, .805, .015], glass(gel), K.GLASS, 5, 9);
    if (organ) {
      for (const x of [-.050, .094]) K.blob(p, 'obscured-organ-outline', [.062, .103, .061], [x, .822, -.021], K.clothP(0x795958), {}, 3, 6);
      lead(p, 'faint-preserved-strand', [[-.049, .745, .004], [.04, .684, .017], [.099, .766, .021]], .022, chitin);
    } else K.blob(p, clean ? 'clear-resin-core' : 'opaque-mucus-core', [.139, .263, .120],
      [.035, .734, .027], clean ? resin : K.stoneP(0x768057), clean ? K.GLASS : {}, 3, 8);
    for (const x of [-.166, .237]) lead(p, 'membrane-vein', [[.035, 1.145, 0], [x, .889, -.05], [.045, .414, .037]],
      .015, K.clothP(0x786f55));
    return;
  }
  const stalk = id === 'alien_tendril' || id === 'alien_zapper';
  const tube = id === 'alien_gasper' || id.startsWith('nm_tube');
  const glow = id.includes('emitter') || id === 'alien_gasper';
  if (tube) {
    const color = id === 'alien_gasper' ? K.stoneP(0x68805f) : K.stoneP(0x805e5d);
    K.blob(p, 'central-fleshy-column', [.29, .976, .246], [0, .987, 0], color, {}, 6, 9);
    const green = id === 'alien_gasper';
    cyl(p, 'flared-floor-root', 'y', [0, .083, 0], .277, .166, color, .177, 10);
    cyl(p, 'flared-ceiling-root', 'y', [0, 1.923, .015], .171, .154, color, .276, 10);
    if (!green) for (const x of [-.166, .166]) {
      lead(p, 'decayed-hanging-side-fold', [[x * .67, 1.94, .042], [x, 1.411, -.07], [x * 1.41, .91, -.078],
        [x * .79, .463, .041], [x, .069, .124]], .034, K.stoneP(0x695557));
    }
    for (const y of [.302, .625, .939, 1.234, 1.533]) {
      cyl(p, 'thickened-ring-of-hide', 'y', [0, y, 0], .228 + Math.sin(y * 1.7) * .042, .084, color, undefined, 9);
      cyl(p, 'recessed-mouth-port', 'z', [0, y, -.256], .073, .038, black, .051, 8);
    }
    if (glow) for (let i = 0; i < 5; i++) {
      const a = i * 2.4;
      K.blob(p, 'released-spore', [.047, .043, .036], [.28 * Math.cos(a), .407 + i * .241, -.199 + .081 * Math.sin(a)],
        flat(0x9da461), { glow: true }, 3, 6);
    }
  } else if (stalk) {
    const shock = id.endsWith('zapper');
    K.crumple(p, 'rooted-flesh', .25, .254, .126, chitin, id);
    lead(p, 'arching-spine', [[0, .053, 0], [-.087, .51, .038], [.078, .89, -.028],
      [.051, 1.25, -.051], [.184, 1.62, -.074]], shock ? .032 : .041, shock ? iron : chitin);
    for (const s of [-1, 1]) {
      lead(p, 'luminous-feeler', [[.05, 1.06, -.036], [.12 + s * .12, 1.40, -.087],
        [.146 + s * .17, 1.65, -.096]], .014, jade, { glow: true });
    }
    if (shock) lead(p, 'branch-of-light', [[.032, .59, .047], [.204, .83, -.04], [.13, 1.05, -.062],
      [.311, 1.34, -.095]], .011, flat(0x9aafd2), { glow: true });
  } else if (id === 'alien_table') {
    const flesh = K.stoneP(0x887462);
    K.pile(p, 'wide-fleshy-ground-anchor', .39, .23, flesh, id);
    K.bevel(p, 'flat-organic-slab', [-.40, .218, -.39, .40, .58, .39], .086, flesh);
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4;
      const x = Math.cos(a), z = Math.sin(a);
      lead(p, 'curled-accessory-limb', [[x * .27, .36, z * .27], [x * .39, .65, z * .4],
        [x * .35, .77, z * .33]], .042, chitin);
    }
  } else {
    const soft = id === 'alien_anemone';
    const flesh = soft ? K.clothP(0xcac0ae) : K.stoneP(0x816965);
    K.pile(p, soft ? 'white-anemone-base' : 'piled-alien-scar-tissue', soft ? .264 : .385, .20, flesh, id);
    if (soft) {
      K.blob(p, 'folded-white-anemone-column', [.178, .186, .162], [0, .219, 0], flesh, {}, 5, 9);
      cyl(p, 'rippled-mouth-collar', 'y', [0, .346, .006], .177, .077, K.clothP(0xb4ad9e), .167, 12);
    }
    for (let i = 0; i < (soft ? 12 : 7); i++) {
      const a = i * 2.4;
      const x = Math.cos(a), z = Math.sin(a);
      const y = soft ? .52 + .24 * p.r() : .31 + .12 * p.r();
      const joint = soft ? [[x * .119, .371, z * .113], [x * .168 - z * .021, y * .80, z * .16 + x * .023],
        [x * .253, y, z * .259], [x * .295 + z * .03, y - .040, z * .28]]
        : [[x * .085, .115, z * .085], [x * .126, y * .69, z * .126], [x * .22, y, z * .22]];
      lead(p, 'curved-tentacle', joint, soft ? .017 : .041, flesh);
      if (!soft) cyl(p, 'scar-orifice', 'y', [x * .21, y, z * .21], .036, .025, black, .031);
    }
  }
}

function plant(p, id) {
  const meadow = id.startsWith('alien_weed');
  const grass = id.startsWith('nm_nether_grass');
  const high = id.endsWith('tall');
  const lily = id.endsWith('lily');
  const frost = id === 'string_dimension_dead_flower';
  const crystal = id === 'crystalline_flower';
  const sparse = id.endsWith('_3');
  const coils = id === 'alien_weed_1';
  const tangled = id === 'nm_nether_patchwork';
  const lichen = id.endsWith('lichen');
  const height = sparse ? 1.12 : lily ? 1.68 : high ? 1.46 : lichen ? .21 : grass ? .92 : .52;
  const count = sparse ? 1 : lily ? 2 : high ? 11 : lichen ? 11 : meadow ? 7 : 6;
  const stalkColor = frost ? 0x5b646f : crystal ? 0x688a91 : grass ? 0x54738b : lichen ? 0xa7834e
    : meadow ? id.endsWith('_1') ? 0x9b6547 : id.endsWith('_2') ? 0x9caeb8 : 0x7d4248 : 0x796352;
  const stalk = crystal ? glass(stalkColor) : K.knitP(stalkColor);
  if (!meadow) K.crumple(p, 'root-substrate', lichen ? .455 : .31, lichen ? .428 : .29, .076,
    K.stoneP(lichen ? 0x8a7549 : frost ? 0x52545b : 0x74635b), id);
  for (let i = 0; i < count; i++) {
    const a = i * 2.4 + .26;
    const r = i ? .17 + p.r() * .16 : .01, x = r * Math.cos(a), z = r * Math.sin(a);
    const h = height * (.64 + p.r() * .36);
    const stemWidth = sparse ? .098 : lily ? .053 : grass ? .031 : .021;
    if (coils) {
      const curl = Array.from({ length: 10 }, (_, k) => {
        const a = k * .82 + i * .72, r = .051 + k * .003;
        return [x * .75 + Math.cos(a) * r, .016 + h * k / 9, z * .75 + Math.sin(a) * r];
      });
      lead(p, 'tightly-coiled-yellow-red-stalk', curl, stemWidth, stalk);
      for (const k of [2, 5, 8]) {
        const [xx, yy, zz] = curl[k];
        K.pane(p, 'jagged-side-leaf', [K.V(xx, yy, zz), K.V(xx + .077, yy + .05, zz - .035),
          K.V(xx + .117, yy + .125, zz + .061), K.V(xx + .017, yy + .046, zz + .039)], .013,
          K.knitP((i + k) % 2 ? 0x9d6650 : 0xc09253));
      }
      continue;
    }
    lead(p, 'segmented-plant-stem', [[x * .65, .011, z * .65], [x * .62, h * .41, z - .032],
      [x + .021, h * .77, z * .91], [x, h, z]], stemWidth, stalk);
    if (grass) {
      for (const k of [.31, .56, .81]) {
        const u = (i % 2 ? -1 : 1) * (grass ? .082 : .115);
        lead(p, 'angled-blade', [[x, h * k, z], [x + u, h * (k + .12), z + .031],
          [x + u * 1.46, h * (k + .17), z - .032]], .016, stalk);
      }
    }
    if (meadow && id.endsWith('_2')) {
      for (const y of [.44, .68, .89]) K.blob(p, 'white-stem-globe', [.029, .035, .03], [x, h * y, z], cream, {}, 3, 6);
    } else if (!grass) {
      const petal = crystal ? glass(0x9cd4d9) : K.clothP(frost ? 0x282931 : lily ? 0xa92d39 : lichen ? 0xb97e45
        : sparse ? 0x786149 : tangled ? [0xb98a61, 0x98505f, 0x839984, 0xc2a767][i % 4] : 0xa78868);
      const r = lily ? .257 : sparse ? .183 : .099;
      for (let k = 0; k < (lily ? 7 : 5); k++) {
        const b = k * Math.PI * 2 / (lily ? 7 : 5);
        const pet = p.group('sharp-petal', { at: [x, h, z], rotY: b, rotZ: (i % 3 - 1) * .13 });
        K.pane(p, 'folded-petal', [K.V(0, 0, 0), K.V(r * .46, .037, r * (lily ? .38 : .28)), K.V(r, frost ? -.019 : .073, 0),
          K.V(r * .46, .027, -r * (lily ? .38 : .30))], .015, petal, crystal ? { parent: pet, glass: true } : { parent: pet });
        if (lily) K.pane(p, 'raised-inner-blood-red-petal', [K.V(.012, .012, 0), K.V(.089, .055, .035),
          K.V(.133, .125, 0), K.V(.082, .047, -.036)], .014, K.clothP(0xc6494f), { parent: pet });
      }
      if (lily) cyl(p, 'golden-lily-stamen-cluster', 'y', [x, h + .069, z], .050, .109, K.clothP(0xad8052), .031);
      if (tangled) lead(p, 'mixed-weedy-runner', [[x, .112, z], [x - .122, .218, z - .033],
        [x - .168, h * .51, z + .195]], .018, stalk);
    }
  }
}

function blackCrystal(p, at, color, size, opts = {}) {
  const [x, y, z] = at;
  const r = size * .20;
  K.hull(p, 'jagged-crystal-spire', [K.V(x - r, y, z - r), K.V(x + r, y, z - r),
    K.V(x + r * .72, y, z + r), K.V(x - r, y, z + r), K.V(x + r * .29, y + size, z - r * .57),
    K.V(x - r * .84, y + size * .49, z + r * .48)], color, opts);
}

function monument(p, id) {
  const injured = id.startsWith('impaled');
  const officer = id.endsWith('officer');
  const collapsed = id.includes('heartless');
  if (id === 'empty_spike' || injured) {
    K.pile(p, 'crystal-footing', .29, .13, purple, id);
    blackCrystal(p, [0, .07, 0], glass(0x846d91), injured ? 1.44 : 1.64, K.GLASS);
    for (const x of [-.16, .18]) blackCrystal(p, [x, 0, .066], glass(0x98769b), .59, K.GLASS);
    if (!injured) return;
    const armor = K.steelP(officer ? 0x707882 : 0x666d58);
    const body = p.group('armored-silhouette', { at: [0, .94, .045], rotZ: officer ? .26 : -.31, rotX: -.39 });
    K.bevel(p, 'armor-torso', [-.23, -.095, -.13, .23, .387, .129], .047, armor, { parent: body });
    box(p, 'helmeted-head', [.209, .22, .20], armor, [0, .405, 0], { parent: body });
    box(p, 'tinted-helmet-visor', [.145, .042, .013], black, [0, .503, -.103], { parent: body });
    for (const s of [-1, 1]) {
      lead(p, 'armored-leg', [[s * .105, -.055, 0], [s * .154, -.31, -.065], [s * .143, -.626, .053]], .069, armor, { parent: body });
      lead(p, 'armored-arm', [[s * .19, .318, 0], [s * .26, .146, -.091], [s * .218, -.10, -.133]], .048, armor, { parent: body });
    }
    return;
  }
  if (collapsed) {
    K.pile(p, 'rusted-spilled-plating', .40, .23, oxide, id);
    for (let i = 0; i < 7; i++) {
      const g = p.group('fallen-armored-panel', { at: [(p.r() - .5) * .60, .084 + p.r() * .073, (p.r() - .5) * .49],
        rotX: .12 + p.r() * .30, rotY: p.r() * Math.PI });
      box(p, 'disconnected-rusted-armor', [.31, .051, .213], oxide, [0, 0, 0], { parent: g });
    }
    return;
  }
  K.crumple(p, 'ancient-root-bed', .38, .35, .09, K.stoneP(0x615640), id);
  for (const [x, z] of [[-.146, .267], [.147, -.247]]) {
    K.bevel(p, 'grounded-rusted-knight-boot', [x - .085, .006, z - .108, x + .085, .126, z + .118], .025, oxide);
  }
  lead(p, 'knee-down-rear-leg', [[-.146, .107, .265], [-.142, .108, .017], [-.105, .547, .112]], .078, oxide);
  K.blob(p, 'grounded-kneepad', [.086, .074, .081], [-.143, .088, .010], oxide, {}, 3, 8);
  lead(p, 'planted-forward-leg', [[.149, .114, -.249], [.183, .414, -.259], [.106, .547, .109]], .085, oxide);
  const body = p.group('leaning-knight-torso', { at: [0, .47, .075], rotX: -.28 });
  K.bevel(p, 'rusted-knight-breastplate', [-.227, 0, -.117, .223, .472, .139], .060, oxide, { parent: body });
  const skull = p.group('bowed-helmet', { at: [.008, .903, -.136], rotX: -.49 });
  K.bevel(p, 'heavy-bowed-knight-helmet', [-.142, -.074, -.124, .142, .171, .096], .041, oxide, { parent: skull });
  box(p, 'inset-blank-visor', [.192, .040, .016], black, [0, .056, -.132], { parent: skull });
  box(p, 'buried-memorial-silhouette', [.083, .876, .096], dull, [0, 0, -.317]);
  for (const s of [-1, 1]) lead(p, 'knight-gripping-the-buried-prop', [[s * .196, .839, -.007], [s * .278, .704, -.143],
    [s * .071, .762, -.318]], .055, oxide);
  lead(p, 'overgrowth-between-plates', [[-.15, .33, -.004], [-.191, .57, -.088], [.016, .61, -.119],
    [.177, .851, -.092]], .025, K.knitP(0x727346));
}

function portal(p, id) {
  const inert = id.endsWith('_inert');
  if (id.startsWith('portal_dungeon_reward')) {
    K.crumple(p, 'portal-scar-base', .37, .32, .033, purple, id);
    for (const x of [-.172, .032, .179]) blackCrystal(p, [x, .012, .087 * Math.sign(x)], glass(inert ? 0x7b6c73 : 0xa3a7b7),
      x === .032 ? 1.36 : .84, inert ? K.GLASS : { haze: true, glow: true });
  } else {
    const floor = id.includes('floor');
    const warped = id.startsWith('string');
    if (floor) {
      hollowTube(p, 'floor-portal-metal-ring', 'y', [0, .062, 0], .438, .345, .124, warped ? purple : dull, 12);
      cyl(p, 'charred-portal-residue', 'y', [0, .011, 0], .356, .021, K.stoneP(0x2e292a), undefined, 12);
    } else if (id === 'exodii_portal_tower') {
      for (const x of [-.343, .343]) for (const z of [-.299, .299]) {
        box(p, 'tower-foot', [.11, .074, .108], steel, [x, 0, z]);
        lead(p, 'triangulated-tower-upright', [[x, .056, z], [x * .63, 1.45, z * .68], [x * .56, 1.89, z * .61]], .031, purple);
        lead(p, 'heat-stained-crossbrace', [[x, .16, z], [-x * .76, .989, z * .78], [x * .64, 1.49, z * .66]],
          .019, K.steelP(z < 0 ? 0x6b737a : 0x746759));
      }
      box(p, 'tower-top-device', [.401, .205, .367], dull, [0, 1.77, 0]);
    } else {
      box(p, 'portal-ring-cradle', [.75, .106, .63], iron);
      hollowTube(p, 'upright-cabled-portal-ring', 'z', [0, .563, .036], .441, .335, .135, dull, 12);
      K.crumple(p, 'burned-footprint', .293, .24, .013, black, id);
    }
    const wired = id === 'exodii_portal_enclosure';
    if (wired) for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5;
      const x = Math.cos(a) * .394, y = .562 + Math.sin(a) * .394;
      lead(p, 'attached-power-cable', [[x, y, .078], [x * 1.06, .28, .245], [x * .75, .069, .36]], .012, i % 2 ? oxide : black);
    }
  }
}

function alienPower(p, id) {
  const pylon = id.includes('pylon');
  const inert = id.endsWith('inert');
  const variant = pylon ? 5 : +id.at(-1);
  const h = variant === 1 ? 1.24 : variant === 2 ? 1.17 : variant === 3 ? 1.49 : variant === 4 ? 1.58 : 1.86;
  const r = variant === 2 ? .408 : variant === 5 ? .272 : .319;
  box(p, 'industrial-power-footing', [.84, .082, .78], iron);
  if (variant === 2) {
    K.blob(p, 'steel-plated-power-sphere', [r, .47, r], [0, .63, .016], steel, { metal: true }, 5, 12);
    box(p, 'bolted-inscribed-lead-plate', [.399, .161, .035], glyph, [0, .516, -.388], { ppm: 105 });
  } else {
    tank(p, 'exodii-power-core', 0, .054, r, h - .16, variant === 4 ? K.steelP(0x74655c) : variant === 1 ? steel : dull, .08);
    if (variant === 1) {
      box(p, 'Mavrik-nameplate-metal', [.438, .198, .050], K.steelP(0x786e5a), [0, .694, -.261]);
      for (const [i, text] of ['MAVRIK 10–101', 'СТАBИЛИТИ', 'SAФETИ'].entries()) {
        box(p, 'Mavrik-mixed-script-inscription', [.405, .043, .012], label(text, 0xd6c4a1, 0x5a5b50),
          [0, .824 - i * .053, -.293], { ppm: 150 });
      }
    } else if (variant === 3) {
      for (const s of [-1, 1]) lead(p, 'twisted-core-pipe', [[s * .269, .13, -.208], [s * .383, .551, -.159],
        [s * .263, .721, .233], [s * .364, 1.15, .201], [s * .113, 1.48, .106]], .045, s === 1 ? copper : steel);
    } else if (variant === 4) cyl(p, 'wide-flat-top-saucer', 'y', [0, 1.59, .054], .447, .111, dull, .397, 12);
    else {
      for (let i = 0; i < 13; i++) {
        cyl(p, 'thick-copper-turn', 'y', [0, .22 + i * .12, .054], r + .026, .061,
          inert ? oxide : copper, undefined, 10);
      }
      if (!inert) cyl(p, 'powered-core-cap', 'y', [0, 1.887, .054], .15, .058, jade);
    }
  }
  for (const x of [-.27, .27]) lead(p, 'grounded-generator-cable', [[x * .76, .17, -.176], [x, .044, -.307],
    [x * 1.36, .029, -.445]], .019, black);
}

function exodiiFixture(p, id) {
  const light = id.includes('lamp');
  if (light) {
    const thin = id.includes('warped'), nether = id.startsWith('nl_');
    const base = thin ? .027 : .33, x = nether ? -.038 : 0;
    box(p, thin ? 'flattened-lamp-foot' : 'area-light-foot', [.35, .078, base], dull, [x, 0, 0]);
    lead(p, 'curved-grown-metal-standard', [[x - .11, .061, 0], [x - .11, .712, 0], [x - .054, 1.331, 0],
      [x + .237, 1.504, 0], [x + .289, 1.332, 0]], thin ? .016 : .035, purple);
    if (thin) box(p, 'two-dimensional-glowing-bulb', [.177, .286, .016], jade, [x + .283, 1.091, 0], { glow: true });
    else K.blob(p, 'green-glowing-bulb', [.103, .138, .104], [x + .282, 1.23, 0], jade, { glow: true }, 4, 8);
    if (nether) {
      for (const z of [-.069, .069]) lead(p, 'grown-metal-bulb-guard', [[x + .291, 1.336, z * .41],
        [x + .372, 1.269, z], [x + .349, 1.161, z], [x + .262, 1.122, z * .48]], .017, dull);
      box(p, 'nether-lamp-ballast', [.174, .117, .235], dull, [x - .059, .079, .021]);
    }
    return;
  }
  if (id === 'exodii_signpost' || id === 'lixa_whiteboard') {
    const white = id === 'lixa_whiteboard';
    for (const x of [-.284, .284]) box(p, 'signboard-post', [.058, white ? 1.51 : 1.62, .057], iron, [x, 0, .09]);
    box(p, 'framed-sign', [.89, .583, .058], white ? cream : oxide, [0, .895, .058]);
    const notation = (ctx, x, y, w, h) => {
      fill(ctx, x, y, w, h, white ? 0xd0d8cc : 0x8f8872);
      for (let i = 2; i < w - 3; i++) {
        const j = Math.round((Math.sin(i * .29) + Math.sin(i * .121)) * h * .11);
        fill(ctx, x + i, y + h * .69 + j, 1, 1, white ? 0x526a62 : 0x544f41);
      }
      for (let i = 0; i < 8; i++) {
        fill(ctx, x + w * .11 + i * w * .1, y + h * (.12 + i % 3 * .05), 2, h * .20, 0x756853);
      }
    };
    box(p, white ? 'dense-equations-and-waveforms' : 'trade-pictographs-and-map', [.811, .512, .015],
      notation, [0, .929, .02], { ppm: 128 });
    return;
  }
  if (id === 'exodii_charger' || id === 'exodii_charger_cheap' || id === 'exodii_botrack') {
    const cheap = id.endsWith('cheap'), rack = id.endsWith('botrack');
    const w = cheap || rack ? .95 : .73;
    box(p, 'charging-plinth', [w, .123, .651], iron);
    for (const x of [-w * .45, w * .45]) {
      box(p, 'station-frame', [.067, 1.74, .193], cheap ? oxide : steel, [x, .111, .191]);
    }
    box(p, 'overhead-station-beam', [w, .099, .227], dull, [0, 1.79, .183]);
    if (rack) {
      for (let i = 0; i < 11; i++) box(p, 'cage-bars', [.018, 1.61, .021], steel, [-.428 + i * .0856, .13, -.319]);
      for (const y of [.30, .79, 1.37]) box(p, 'equipment-hanging-rod', [.854, .032, .031], steel, [0, y, .08]);
      for (const x of [-.269, .038, .288]) {
        box(p, 'robot-limb-clamping-bracket', [.102, .063, .091], steel, [x, 1.375, .079]);
        lead(p, 'clamped-robot-limb', [[x, 1.342, .07], [x * .83, .923, -.044], [x + .043, .592, .014]], .057, dull);
        cyl(p, 'robot-limb-joint', 'z', [x * .82, .935, -.05], .078, .072, purple);
      }
      box(p, 'clamped-robot-chassis-shell', [.325, .247, .135], oxide, [-.123, 1.462, .06]);
      box(p, 'chassis-blank-interface', [.18, .094, .026], black, [-.14, 1.534, -.021]);
      for (const x of [-.222, .084, .251]) box(p, 'robot-clamp-lock', [.041, .073, .028], dull, [x, .772, -.295]);
    } else {
      for (const x of cheap ? [-.248, .246] : [0]) {
        box(p, 'cyborg-cradle-backplate', [cheap ? .354 : .49, cheap ? .87 : 1.19, .117], cheap ? oxide : dull,
          [x, .268, .154]);
        box(p, 'nutrient-and-power-dock', [.183, .216, .147], steel, [x, 1.23, .066]);
        lead(p, 'dock-nutrient-line', [[x, 1.38, -.024], [x - .05, 1.172, -.126], [x - .136, .791, -.147]], .022, purple);
        lead(p, 'dock-power-line', [[x + .09, 1.36, .015], [x + .125, 1.191, -.09], [x + .124, .852, -.139]], .019, black);
      }
    }
    return;
  }
  const scanner = id === 'exodii_scanner' || id === 'xedra_antenna';
  const phone = id === 'xedra_mobile_weather_station';
  const locator = id === 'exodii_locator_antenna';
  box(p, 'antenna-mount', [phone ? .50 : .63, .089, phone ? .39 : .56], iron);
  const h = locator ? 2.28 : phone ? 1.30 : 1.19;
  if (phone) {
    legs(p, .49, .43, .403, steel, .044);
    box(p, 'weatherproof-case', [.493, .375, .369], black, [0, .402, .031]);
    display(p, 'analysis-computer', .263, .095, -.057, .633, -.161, 0x587a75);
    box(p, 'weather-station-plaque', [.303, .043, .011], label('X.E.D.R.A.', 0xa0ada2, 0x323c3a), [.011, .496, -.159], { ppm: 144 });
    box(p, 'weather-printer-paper-slot', [.152, .027, .025], iron, [.119, .531, -.165]);
    box(p, 'short-thermal-paper-strip', [.093, .084, .011], K.printP(0xc9c8ae, 0x747d6e),
      [.119, .447, -.177]);
    for (const xx of [-.163, .163]) lead(p, 'storage-case-back-strap', [[xx, .467, .205],
      [xx, .54, .251], [xx, .69, .25], [xx, .731, .206]], .018, K.clothP(0x465047));
  } else box(p, 'electronics-enclosure', [.345, .321, .322], id.startsWith('xedra') ? black : dull, [0, .087, .057]);
  cyl(p, 'telescoping-antenna-mast', 'y', [0, h / 2 + .087, .095], .033, h, steel, .026);
  if (scanner) {
    saucer(p, [0, h + .03, -.019], id.startsWith('xedra') ? .29 : .402, id.startsWith('xedra') ? flat(0x34383a) : glyph);
    cyl(p, 'scanner-azimuth-motor', 'y', [0, h - .011, .095], .091, .125, dull);
    if (id === 'xedra_antenna') K.cyl(p, 'faint-antenna-back-status-LED', 'z',
      [.079, h - .020, .172], .018, .021, 7, flat(0x6f9a67), { glow: true });
  } else {
    for (const y of locator ? [1.77, 2.13] : [.964, 1.192]) box(p, 'antenna-crosspiece', [.591, .031, .031], steel, [0, y, .093]);
    for (const x of [-.23, .23]) box(p, 'antenna-cross-sensor', [.057, .082, .127], id === 'scrap_antenna' ? oxide : black,
      [x, h * .79 + .067, .073]);
    if (phone) cyl(p, 'weather-anemometer-cap', 'y', [0, 1.433, .08], .083, .042, cream, .068);
  }
}

function machines(p, id) {
  if (id.includes('printer')) {
    const big = id.endsWith('large');
    const w = big ? .97 : .73, h = big ? 1.67 : 1.39;
    box(p, 'fabricator-plinth', [w, .094, .68], iron);
    for (const x of [-w * .44, w * .44]) for (const z of [-.254, .253]) {
      box(p, 'fabricator-column', [.055, h, .07], steel, [x, .086, z]);
    }
    box(p, 'fabrication-deck', [w - .10, .083, .532], layers(dull, grid(0x393f3c, 2, 7)), [0, .52, .032]);
    for (const x of [-w * .32, w * .32]) box(p, 'nozzle-guide-column', [.026, h - .67, .046], steel, [x, .595, .184]);
    if (big) for (const x of [-.350, .327]) lead(p, 'thick-rear-electrical-cable', [[x, .21, .262],
      [x, .134, .34], [x * .98, .078, .456], [x * .67, .072, .477]], .024, black);
    box(p, 'overhead-nozzle-gantry', [w, .106, .549], dull, [0, h - .341, .041]);
    cyl(p, 'downward-print-head', 'y', [.036, h - .444, -.025], .062, .259, steel, .082);
    if (big) for (const x of [-.247, 0, .247]) {
      cyl(p, 'wire-spool', 'x', [x, h - .105, .065], .145, .136, copper, .132, 10);
      cyl(p, 'spool-end-flange', 'x', [x + .078, h - .105, .065], .156, .026, iron, undefined, 10);
      lead(p, 'wire-feed', [[x, h - .02, .04], [x * .7, h - .233, -.194], [.036, h - .44, -.026]], .014, copper);
    } else {
      tray(p, 'component-output-hopper', [.47, .096, .433], steel, [0, .598, -.026], .021);
      for (const [i, x] of [-.185, -.056, .075, .159].entries()) {
        box(p, 'printed-electronic-product', [.073, .033 + (i % 2) * .041, .115], i % 2 ? purple : dull, [x, .624, -.044]);
        lead(p, 'printer-nozzle-feed', [[x, h - .136, .224], [x, h - .22, .07], [0, h - .448, -.02]], .017, copper);
      }
    }
  } else if (id.includes('pump')) {
    const ex = id.startsWith('exodii');
    box(p, 'machine-base', [.91, .081, .716], iron);
    tank(p, 'pump-receiver', -.184, .049, ex ? .247 : .284, ex ? 1.06 : 1.33, ex ? oxide : dull, .08);
    for (const z of [-.163, .184]) {
      cyl(p, 'pump-housing', 'x', [.22, .322, z], .133, .253, steel, .117, 10);
      lead(p, 'tank-adapter-and-return-pipe', [[-.09, .926, z], [.326, .925, z], [.344, .572, z], [.229, .404, z]],
        ex ? .054 : .040, ex ? oxide : iron);
    }
  } else if (id === 'string_dimension_housing_imploded') {
    K.lump(p, 'collapsed-dense-metal-ball', [.402, .382, .395], dull, id);
    for (const s of [-1, 1]) lead(p, 'buckled-edge', [[s * .313, .148, -.184], [s * .20, .381, -.349],
      [s * .085, .516, -.29]], .034, steel);
  } else if (id === 'string_dimension_housing') {
    K.bevel(p, 'dense-dimension-housing', [-.391, 0, -.341, .39, 1.29, .34], .048, dull);
    box(p, 'armored-access-door', [.663, .98, .087], iron, [0, .142, -.352]);
    box(p, 'thick-gold-plaque', [.368, .176, .030], K.steelP(0xa88d53), [.051, .842, -.397]);
    box(p, 'dark-otherworldly-engraving', [.317, .119, .007], glyph, [.051, .871, -.413], { ppm: 128 });
    lead(p, 'heavy-door-lever', [[-.22, .54, -.407], [-.23, .453, -.471], [-.062, .432, -.462]], .026, steel);
  } else if (id === 'string_nuclear_fuel_cell') {
    box(p, 'lead-container-cradle', [.79, .104, .51], iron);
    cyl(p, 'massive-sealed-lead-tube', 'x', [0, .341, .065], .251, .855, dull, .249, 12);
    for (const x of [-.306, .293]) cyl(p, 'tube-reinforcement-collar', 'x', [x, .341, .065], .268, .053, steel, undefined, 12);
    box(p, 'inscrutable-tube-glyphs', [.425, .164, .015], glyph, [0, .266, -.177], { ppm: 112 });
  } else if (id === 'melchior_unit') {
    box(p, 'suspended-array-footing', [.68, .074, .58], iron);
    for (const x of [-.298, .298]) box(p, 'array-suspension-frame', [.058, 1.69, .056], iron, [x, .067, .163]);
    box(p, 'array-suspension-crosspiece', [.68, .064, .13], steel, [0, 1.71, .152]);
    for (let i = 0; i < 7; i++) {
      const r = .105 + i * .041, y = .408 + i * .172;
      cyl(p, 'suspended-platter', 'y', [0, y, 0], r, .061, i % 2 ? copper : steel, r * .96, 10);
    }
    for (const x of [-.158, .158]) lead(p, 'platter-cabling', [[x * .21, .389, .021],
      [x, .95, .126], [x * 1.62, 1.49, .202], [x * 1.60, 1.749, .155]], .024, copper);
  } else {
    const boxOpen = id === 'nl_powerbox_o';
    const powerbox = id.startsWith('nl_powerbox');
    const lx = id.startsWith('LIXA');
    const w = powerbox ? .636 : .826;
    cabinet(p, [w, powerbox ? 1.156 : 1.37, .57], powerbox ? K.steelP(0x5a6655) : dull, [.238]);
    if (!boxOpen && !lx) {
      box(p, 'welded-rusted-utility-cover', [.602, 1.13, .026], K.steelP(0x565e4e), [0, .017, -.295]);
      lead(p, 'organic-twisting-weld-seam', [[-.30, .61, -.318], [-.111, .622, -.316], [.113, .594, -.315], [.30, .624, -.316]], .011, oxide);
    } else {
      const flesh = K.stoneP(0x715653), wiring = K.plasticP(0x806c54);
      for (let i = 0; i < 7; i++) {
        const x = -.26 + i * .087;
        lead(p, lx ? 'every-wiring-strand' : 'oily-organic-tissue-and-wire', [[x, .161, -.076],
          [x * .5, .381, -.183], [x + .032, .782, -.07], [x, 1.10, -.114]], lx ? .013 : .042, lx ? wiring : flesh);
      }
      for (const x of [-.23, .19]) box(p, 'connection-sockets', [.155, .210, .057],
        layers(lx ? K.steelP(0x597162) : dull, grid(0x798c7b, 5, 7)), [x, .484, -.217]);
      if (lx) box(p, 'transparent-electronic-casing', [w - .08, 1.18, .026], glass(0x9cbea7), [0, .061, -.284], K.GLASS);
    }
  }
}

function weird(p, id) {
  if (id === 'vent_inert' || id === 'tall_vent_pipe') {
    const tall = id.startsWith('tall');
    if (tall) {
      hollowTube(p, 'stacked-thick-vent-pipe', 'y', [0, 1, 0], .326, .243, 2, iron, 10);
      for (const y of [.071, .997, 1.965]) hollowTube(p, 'sturdy-vent-flange', 'y', [0, y, 0], .356, .243, .055, steel, 10);
    } else {
      tray(p, 'vent-base-frame', [.76, .069, .74], iron, [0, 0, 0], .035);
      for (let i = 0; i < 10; i++) box(p, 'steel-grate-bar', [.691, .049, .027], steel, [0, .03, -.311 + i * .069]);
    }
    return;
  }
  if (id === 'metal_crate_o_string_warped') {
    const glow = { haze: true, glow: true };
    for (const x of [-.424, .424]) box(p, 'magenta-light-plane', [.009, .635, .72], pink, [x, .02, .045], glow);
    box(p, 'magenta-back-plane', [.848, .635, .009], pink, [0, .02, .402], glow);
    box(p, 'magenta-floor-plane', [.85, .008, .72], pink, [0, 0, .045], glow);
    for (const y of [.251, .408]) box(p, 'thin-magenta-shelf-plane', [.842, .011, .68], pink, [0, y, .039], glow);
    return;
  }
  if (id === 'utility_shelf_string_warped') {
    for (const [i, y] of [.049, .62, 1.20].entries()) {
      const x = -.288 + i * .285;
      box(p, 'floating-shelf-section', [.368, .088, .54], dull, [x, y, .033]);
      for (const z of [-.187, .22]) box(p, 'severed-upright', [.045, .245, .047], steel, [x + .158, y - .049, z]);
    }
    return;
  }
  if (id.startsWith('string_dimension_distress_beacon')) {
    const stage = +id.at(-1);
    box(p, 'distress-beacon-pedestal', [.592, .85, .64], dull);
    K.blob(p, 'bulbous-monitor-shell', [.353, .312, .297], [0, 1.032, .054], purple, {}, 4, 10);
    box(p, 'garbled-monitor-display', [.465, .292, .031], layers(flat(0x4b5862), grid(0x6f8181, 8, 9)),
      [0, .916, -.237]);
    if (stage === 3) box(p, 'topological-map-overlay', [.414, .246, .011], glyph, [0, .943, -.258], { ppm: 144 });
    else for (const x of stage === 2 ? [-.103, .103] : [0]) {
      K.cyl(p, 'glowing-circle', 'z', [x, 1.068, -.262], .057, .011, 10, jade, { glow: true });
    }
    return;
  }
  if (id === 'nl_water_cooler') {
    box(p, 'scrap-water-cooler-base', [.547, .914, .445], dull);
    box(p, 'black-dispensing-recess', [.291, .249, .023], black, [0, .453, -.233]);
    box(p, 'drinks-compartment-flap', [.276, .106, .033], steel, [0, .591, -.244]);
    K.blob(p, 'bulbous-black-glass-reservoir', [.255, .289, .227], [0, 1.158, .015], glass(0x545759),
      { metal: true }, 5, 10);
    return;
  }
  if (id === 'nl_boiler' || id === 'nl_safehouse_boiler') {
    const cloud = id === 'nl_boiler';
    box(p, 'boiler-anchor-plate', [.853, .116, .78], iron);
    if (cloud) {
      K.blob(p, 'obscured-internal-object', [.305, .58, .27], [0, .877, .010], chitin, {}, 4, 10);
      K.cyl(p, 'yellowed-clouded-housing', 'y', [0, 1.03, 0], .389, 1.831, 12,
        glass(0x9e925e, { frost: true }), K.GLASS, .376);
      for (const y of [.151, 1.91]) cyl(p, 'thick-bolted-boiler-ring', 'y', [0, y, 0], .41, .109, iron, undefined, 10);
    } else {
      K.blob(p, 'pot-bellied-boiler', [.394, .572, .352], [0, .694, .040], dull, {}, 5, 10);
      for (const x of [-.24, 0, .236]) cyl(p, 'unmarked-eye-like-gauge', 'z', [x, 1.014, -.29], .061, .06, steel);
      box(p, 'hinged-combustion-cage', [.52, .363, .066], layers(iron, grid(0x6b746a, 8, 6)), [0, .281, -.306]);
      lead(p, 'copper-coiled-return', [[.24, .92, .19], [.352, 1.14, .255], [.16, 1.22, .308], [.089, .89, .373], [.187, .634, .353]],
        .036, copper);
      K.blob(p, 'bulbous-rear-battery', [.143, .173, .147], [.109, .562, .394], black, {}, 4, 7);
      lead(p, 'side-crank', [[.308, .51, -.044], [.436, .536, -.056], [.456, .623, -.156]], .026, iron);
    }
    return;
  }
  if (id.startsWith('nl_')) {
    const climb = id === 'nl_climbing_vine';
    K.crumple(p, 'rooted-labyrinth-plant-base', .34, .319, .073, K.stoneP(0x666b4f), id);
    for (let i = 0; i < (climb ? 9 : 7); i++) {
      const a = i * 2.4;
      const x = Math.cos(a) * .295, z = Math.sin(a) * .29, y = climb ? 1.99 : .39 + (i % 5) * .09;
      lead(p, climb ? 'fraying-wire-like-vine' : 'reed-shaped-plumbing-pipe', [[x, .019, z],
        [x * .61, y * .37, z + .055], [x * .75 + .026, y * .67, z - .062], [x * .96, y, z]],
        climb ? .027 : .048, K.steelP(i % 2 ? 0x637856 : 0x736953));
      if (!climb) cyl(p, 'hollow-cut-reed-tip', 'y', [x * .96, y, z], .031, .015, black, undefined, 6);
    }
    return;
  }
  // The unfolding boundary is a thin rippling view into a tunnel.
  const tunnel = (ctx, x, y, w, h) => {
    fill(ctx, x, y, w, h, 0x20252b);
    const rings = Array.from({ length: 11 }, (_, i) => {
      const t = i / 11, a = w * (.477 - t * .446), b = h * (.48 - t * .431);
      const xx = x + w * (.48 + Math.sin(i * .26) * .041), yy = y + h * (.48 - Math.sin(i * .17) * .05);
      return [[xx - a, yy - b * .93], [xx + a * .97, yy - b], [xx + a * .93, yy + b * .91], [xx - a * 1.01, yy + b]];
    });
    for (let i = 0; i < rings.length - 1; i++) for (let side = 0; side < 4; side++) {
      const j = (side + 1) % 4;
      const points = [rings[i][side], rings[i][j], rings[i + 1][j], rings[i + 1][side]];
      ctx.beginPath();
      ctx.moveTo(...points[0]);
      for (const pt of points.slice(1)) ctx.lineTo(...pt);
      ctx.closePath();
      ctx.fillStyle = [['#62676b','#475958','#766b60','#485b5d'], ['#454651','#35484b','#60564c','#3d4a56']][i % 2][side];
      ctx.fill();
    }
    for (let i = 0; i < w; i += 2) {
      const yy = y + h * .70 + Math.sin(i * .32) * h * .02;
      fill(ctx, x + i, yy, 2, 1, 0x6d8383);
    }
  };
  box(p, 'towering-unfolding-tunnel-boundary', [.956, 1.9, .023], tunnel, [0, 0, 0], { ppm: 128 });
  for (const s of [-1, 1]) lead(p, 'wave-edge', [[s * .464, .008, .024], [s * .478, .645, -.028],
    [s * .441, 1.32, .029], [s * .464, 1.901, -.017]], .014, purple);
}

export const EXOTIC_FURNITURE = [
  ...family(organic, 'absence alien_anemone alien_gasper alien_pod alien_pod_organ alien_pod_resin alien_scar alien_table alien_tendril alien_zapper nm_tube nm_tube_emitter'),
  ...family(plant, 'crystalline_flower string_dimension_dead_flower alien_weed_1 alien_weed_2 alien_weed_3 nm_nether_grass nm_nether_grass_tall nm_nether_lichen nm_nether_lily nm_nether_patchwork'),
  ...family(monument, 'dead_exodii dead_exodii_heartless empty_spike impaled_officer impaled_soldier'),
  ...family(portal, 'exodii_floor_portal_enclosure exodii_portal_enclosure exodii_portal_tower string_dimension_floor_portal_enclosure portal_dungeon_reward_increaser portal_dungeon_reward_increaser_inert'),
  ...family(alienPower, 'exodii_generator_1 exodii_generator_2 exodii_generator_3 exodii_generator_4 string_dimension_pylon string_dimension_pylon_inert'),
  ...family(exodiiFixture, 'exodii_botrack exodii_charger exodii_charger_cheap exodii_lamp exodii_lamp_string_warped exodii_locator_antenna exodii_scanner exodii_signpost scrap_antenna xedra_antenna xedra_mobile_weather_station nl_exodii_lamp lixa_whiteboard'),
  ...family(machines, 'exodii_printer_large exodii_printer_small exodii_pump string_dimension_pump string_dimension_housing string_dimension_housing_imploded string_nuclear_fuel_cell melchior_unit nl_powerbox nl_powerbox_o LIXA_machinery_electronic'),
  ...family(weird, 'vent_inert tall_vent_pipe metal_crate_o_string_warped utility_shelf_string_warped nl_water_cooler nl_boiler nl_safehouse_boiler nl_climbing_vine nl_pipe_plant string_dimension_distress_beacon_1 string_dimension_distress_beacon_2 string_dimension_distress_beacon_3 LIXA_unfold_barrier'),
].map((r) => ({ ...r, source: 'tools/cubeclysm/page/furniture-exotic.js' }));
