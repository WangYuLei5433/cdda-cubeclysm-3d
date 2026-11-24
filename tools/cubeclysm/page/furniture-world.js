import {
  K, box, cyl, hollowTube, tray, legs, lead, label, family,
  flat, glass, grid, layers, masonry, sides, fill, wood, darkWood, iron, steel, cream,
  black, stone, glassBlue,
} from './furniture-extra-kit.js';

const straw = K.knitP(0xb6995a);
const leaf = K.knitP(0x557443);
const brick = K.paperP(0xb0885b);

const moundColors = {
  clay: 0x98705c, glass: 0x71867b, gravel: 0x7c786e, pebble: 0x9b9c8b,
  rock: 0x696d6b, rock_large: 0x828279, sand: 0xb7a27a,
};

function mound(p, id) {
  const [type, stage] = id.split('_mound_');
  const height = { short: .43, mid: 1.31, tall: 2.10 }[stage];
  const tone = moundColors[type];
  const paint = K.stoneP(tone);
  const points = [];
  const base = type === 'sand' || type === 'gravel' ? .48 : .447;
  const upper = type === 'clay' ? .245 : type.startsWith('rock') || type === 'glass' ? .197 : .123;
  for (const [y, radius] of [[0, base], [height * .27, base * .95], [height * .64, .328], [height * .93, upper]]) {
    for (let i = 0; i < 9; i++) {
      const a = (i + .19 * p.r()) * Math.PI * 2 / 9;
      const r = radius * (.86 + p.r() * .14);
      points.push(K.V(Math.cos(a) * r, y, Math.sin(a) * r));
    }
  }
  points.push(K.V(.035, height, -.025));
  K.hull(p, 'heaped-' + type, points, paint);
  if (type === 'sand' || type === 'clay') {
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4;
      K.lump(p, 'slumped-edge', [.12, .04, .083], paint, id + i, {}, [Math.cos(a) * .32, 0, Math.sin(a) * .32]);
    }
    return;
  }
  for (let i = 0; i < 17; i++) {
    const a = i * 2.4;
    const y = i < 9 ? 0 : height * (.15 + (i % 4) * .18);
    const r = i < 9 ? .38 : .392 - (y / height) * .19;
    const size = type === 'rock_large' ? .145 : type === 'rock' ? .086 : type === 'pebble' ? .060 : .034;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (type === 'glass') {
      const chip = i < 9 ? .15 : .21;
      K.pane(p, 'jutting-shard', [K.V(x - .041, y, z), K.V(x + .056, y, z + .024),
        K.V(x - .021, y + chip + p.r() * .091, z + .069)], .011,
        i % 3 === 0 ? K.steelP(0x9abdb6) : glass(i % 2 ? 0xd3dec8 : 0x8ebeb5), i % 3 === 0 ? K.STEEL : K.GLASS);
    } else {
      const material = type === 'pebble' ? K.stoneP([0xa5a593, 0x757b71, 0xb1a698][i % 3]) : paint;
      K.lump(p, 'loose-' + type, [size, size * (type === 'pebble' ? .36 : .6), size * .8], material, id + i, {}, [x, y, z]);
    }
  }
}

function sticks(p, id) {
  const length = id.includes('long') ? .91 : .55;
  const height = id.endsWith('tall') ? 2.08 : id.endsWith('mid') ? 1.35 : .44;
  const n = Math.round(height / .148);
  for (let row = 0; row < n; row++) {
    for (const x of [-.29, -.11, .09, .28]) {
      const y = (row + .42) * height / n;
      const twist = ((row * 3) % 5 - 2) * .040;
      const z = (p.r() - .5) * (length > .8 ? .045 : .22);
      const tip = z + length * (.40 + p.r() * .10);
      const bark = K.barkP(row % 3 === 0 ? 0x78573f : 0x5c4939);
      lead(p, 'stacked-stick', [[x, y, z - length / 2], [x + twist * .8, y + .032, z + .028], [x + twist, y + .014, tip]],
        .046 + p.r() * .016, bark);
      if ((row + Math.floor((x + .29) * 12)) % 4 === 0) {
        const s = x < 0 ? -1 : 1;
        K.tube(p, 'short-fork-on-branch', K.V(x, y + .024, z + .033),
          K.V(x + s * .071, y + .061, z + .155), .026, .019, 4, bark);
      }
    }
  }
  if (height > 1) for (const x of [-.37, .36]) box(p, 'stack-retaining-stake', [.071, height, .071], wood, [x, 0, -.063]);
}

function shore(p, id) {
  if (id === 'beach_log') {
    const bleach = K.barkP(0xc3b49a);
    hollowTube(p, 'hollow-driftwood', 'z', [0, .17, 0], .166, .114, .71, bleach, 8);
    for (const s of [-1, 1]) {
      lead(p, 'twisted-root', [[s * .11, .12, -.14], [s * .21, .095, -.29], [s * .34, .045, -.34]], .048, bleach);
      lead(p, 'split-branch', [[s * .13, .23, .15], [s * .24, .37, .22], [s * .312, .42, .33]], .042, bleach);
    }
  } else {
    for (let i = 0; i < 14; i++) {
      const a = i * 2.39, r = .36 * p.r() + .035;
      const x = r * Math.cos(a), z = r * Math.sin(a);
      const paint = K.knitP([0x55664b, 0x795f45, 0x8a7751][i % 3]);
      K.pane(p, 'stranded-seaweed', [K.V(x - .05, .011, z), K.V(x + .10, .016, z - .073),
        K.V(x + .067, .038, z + .061)], .019, paint);
    }
    box(p, 'driftwood-chip', [.15, .042, .041], wood, [.12, 0, .23]);
  }
}

const seaPlants = {
  algae_green: [0x598446, .16, 11, .034], algae_red: [0x884a57, .20, 8, .041],
  bladderwrack: [0x767249, .31, 7, .061], kelp_sugar: [0x75603b, 2.38, 3, .113],
  sea_lettuce: [0x6c9651, .20, 7, .089], sea_anemone: [0xc78c6f, .36, 12, .024],
};
function marine(p, id) {
  if (id === 'sea_sponge') {
    const sponge = K.stoneP(0xa88960);
    for (const [x, z, r, h] of [[0, 0, .13, .33], [-.136, .079, .093, .229], [.151, -.069, .102, .190]]) {
      hollowTube(p, 'porous-sponge-lobe', 'y', [x, h / 2, z], r, r * .54, h, sponge, 7);
      for (let i = 0; i < 3; i++) K.lump(p, 'sponge-knot', [.052, .05, .044], sponge, id + x + i, {}, [x + .09, .025 + i * .045, z]);
    }
    return;
  }
  const [c, height, count, breadth] = seaPlants[id];
  const paint = K.knitP(c);
  const anemone = id === 'sea_anemone';
  if (anemone) cyl(p, 'polyp-body', 'y', [0, .08, 0], .144, .16, K.clothP(0xa86d5a), .175, 10);
  for (let i = 0; i < count; i++) {
    const a = i * 2.39996;
    const x = Math.cos(a), z = Math.sin(a), h = height * (.68 + p.r() * .34);
    const base = anemone ? .118 : 0;
    if (anemone) {
      lead(p, 'tide-tentacle', [[x * .079, base, z * .079], [x * .121 - z * .018, h * .58, z * .121 + x * .018],
        [x * .175, h * .88, z * .175], [x * .234, h, z * .228]], breadth * .77, paint);
      if (i % 2 === 0) K.blob(p, 'colored-tentacle-tip', [.017, .023, .017], [x * .234, h, z * .228],
        K.clothP(0xe2a68a), {}, 3, 5);
    } else {
      const offset = id === 'kelp_sugar' ? .23 : .19;
      const kelp = id === 'kelp_sugar';
      const sections = [[.038, .009, breadth * .18, 0], [.11, .27 * h, breadth * .74, -.026],
        [.16, .49 * h, breadth, .035], [.19, .77 * h, breadth * .57, -.018], [offset, h, breadth * .08, .019]];
      const at = ([r, y, w, bend], s) => K.V(x * r - z * (s * w + bend), y, z * r + x * (s * w + bend));
      for (let j = 1; j < sections.length; j++) {
        K.pane(p, 'wavy-leaflike-frond', [at(sections[j - 1], -1), at(sections[j - 1], 1),
          at(sections[j], 1), at(sections[j], -1)], kelp ? .012 : .017, paint);
      }
      if (kelp || id === 'sea_lettuce') lead(p, 'frond-midrib', sections.map(([r, y, w, bend]) =>
        [x * r - z * bend, y, z * r + x * bend]), .008, K.knitP(kelp ? 0x8c744d : 0x85a369));
      if (id === 'bladderwrack') {
        K.blob(p, 'air-bladder', [.029, .035, .027], [x * .16, h * .57, z * .16], K.plasticP(0x9a8947), {}, 3, 6);
        K.blob(p, 'air-bladder-tip', [.021, .025, .021], [x * .183, h * .83, z * .183], paint, {}, 3, 6);
      }
    }
  }
}

function topiary(p, id) {
  const green = K.knitP(0x567c44);
  const bright = K.knitP(0x66894e);
  const tuft = (name, at, radii, paint = green) => K.lump(p, name, radii, paint, id + name + at.join(), {}, at);
  cyl(p, 'trunk', 'y', [0, .26, 0], .067, .51, darkWood, .050);
  if (id === 'topiary_abstract') {
    for (let i = 0; i < 15; i++) {
      const h = i / 14;
      const a = h * Math.PI * 4.3;
      const r = .219 * (1 - h * .63);
      tuft('spiral-pruned-leaf-crown', [r * Math.cos(a), .281 + h * 1.17, r * Math.sin(a)],
        [.169 - h * .056, .084, .159 - .044 * h], i % 3 ? green : bright);
    }
    cyl(p, 'leafy-rooted-spiral-core', 'y', [0, .862, 0], .132, 1.13, green, .044);
    return;
  }
  const dragon = id === 'topiary_dragon';
  tuft('long-four-legged-body', [0, .553, .022], [.243, .202, .328]);
  for (const x of [-.143, .143]) for (const z of [-.212, .20]) {
    lead(p, 'leafy-four-legged-silhouette', [[x * .99, .68, z * .85], [x * 1.21, .444, z + .034], [x * 1.19, .29, z - .018]],
      .073, green);
    tuft('pruned-paw', [x * 1.16, .254, z - .029], [.077, .047, .096], bright);
  }
  const headY = dragon ? 1.332 : .966;
  lead(p, 'pruned-neck', [[0, .768, -.191], [0, .969, -.254], [0, headY + .04, -.26]], dragon ? .103 : .124, green);
  tuft('sculpted-head', [.028, headY, -.279], [.177, .132, .161], bright);
  tuft('sculpted-snout', [.041, headY + .035, -.405], [.115, .076, .079]);
  if (dragon) {
    for (const s of [-1, 1]) {
      K.pane(p, 'long-pruned-dragon-wing', [K.V(s * .106, .879, -.058), K.V(s * .434, 1.49, .122),
        K.V(s * .408, 1.028, .359), K.V(s * .188, .874, .245)], .089, green);
      lead(p, 'swept-dragon-wing-bone', [[s * .147, .883, .014], [s * .315, 1.185, .094], [s * .413, 1.437, .134]], .032, bright);
      lead(p, 'leafy-dragon-horn', [[s * .095, 1.509, -.226], [s * .116, 1.635, -.165]], .028, green);
    }
  } else {
    for (const x of [-.094, .097]) tuft('pruned-animal-ear', [x, headY + .207, -.253], [.057, .102, .064]);
  }
  lead(p, 'arched-pruned-tail', [[.043, .737, .241], [.209, .82, .382], [.329, dragon ? 1.097 : .927, .351]], .065, green);
}

function rustic(p, id) {
  if (id === 'beaver_dam') {
    const bark = K.barkP(0x665341);
    K.pile(p, 'packed-dam-mud', .45, .32, K.stoneP(0x584d3d), id);
    for (let i = 0; i < 13; i++) {
      const y = .15 + (i % 5) * .105, z = (p.r() - .5) * .54;
      lead(p, 'interlocked-beaver-branch', [[-.43, y - .055, z], [.07, y, z * .5], [.43, y - .029, z + .075]], .048, bark);
    }
  } else if (id === 'glowingbulb') {
    K.pile(p, 'root-hill', .25, .13, darkWood, id);
    cyl(p, 'bulb-stem', 'y', [0, .25, 0], .035, .43, leaf);
    K.blob(p, 'onion-shaped-green-bulb', [.132, .17, .127], [0, .50, 0], flat(0x7dac57), { glow: true }, 4, 8);
    for (const s of [-1, 1]) lead(p, 'leaf-shoot', [[0, .24, 0], [s * .15, .35, .065], [s * .25, .53, .07]], .019, leaf);
  } else if (id === 'midden') {
    hollowTube(p, 'open-root-midden', 'y', [0, .11, 0], .41, .236, .22, darkWood, 10);
    box(p, 'dark-recess', [.39, .017, .36], black);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      lead(p, 'midden-root', [[Math.cos(a) * .43, .045, Math.sin(a) * .43],
        [Math.cos(a + .18) * .32, .22, Math.sin(a + .18) * .32]], .037, wood);
    }
  } else if (id === 'brambles') {
    for (let i = 0; i < 11; i++) {
      const x = -.443 + i * .087;
      lead(p, 'tangled-wall-root', [[x, .005, -.09], [x * .71 + .07, .49, .085], [x * .83 - .087, 1.13, -.10],
        [x + .015, 1.83 - (i % 3) * .15, .045]], .045, i % 2 ? darkWood : wood);
      lead(p, 'sideways-thorn', [[x, .66 + (i % 4) * .21, .015], [x + .041, .75 + (i % 4) * .21, -.155]], .017, darkWood);
    }
  } else {
    const height = id.endsWith('adult') ? 2.33 : id.endsWith('sapling') ? 1.30 : .34;
    const trunk = K.barkP(id.endsWith('adult') ? 0x645242 : 0x614839);
    const adult = id.endsWith('adult');
    lead(p, 'gnarled-trunk', [[0, .004, 0], [.038, height * .25, -.019],
      [-.089, height * .54, .043], [.030, height * .76, -.102], [.058, height, .02]], .086 * Math.min(1, height), trunk);
    if (adult) for (const s of [-1, 1]) {
      lead(p, 'exposed-splayed-root', [[.019, .273, .024], [s * .116, .104, -.045], [s * .286, .02, s * .122]], .047, trunk);
    }
    for (const s of [-1, 1]) {
      const end = [s * Math.min(.351, height * .38), height * (s < 0 ? .94 : 1.02), s * .081];
      lead(p, 'upturned-branch', [[-.034, height * .47, .023], [end[0] * .68, height * .64, end[2]],
        [end[0] * 1.08, height * .75, end[2] - .039], end], .046 * Math.min(1, height), trunk);
      K.lump(p, 'bud-cluster', [height * .060, height * .035, height * .07], leaf, id + s, {}, [end[0], end[1] - .015, end[2]]);
    }
  }
}

function salvage(p, id) {
  if (id === 'scrap_bridge') {
    for (const x of [-.32, .32]) box(p, 'bridge-stringer', [.092, .092, .997], iron, [x, 0, 0]);
    for (let i = 0; i < 5; i++) {
      const z = -.399 + i * .20;
      box(p, 'riveted-deck-plate', [.94, .044, .198], K.steelP(i % 2 ? 0x7d837e : 0x666e6c), [0, .091, z]);
      for (const x of [-.421, .422]) cyl(p, 'bridge-rivet', 'y', [x, .136, z], .017, .013, iron, undefined, 6);
    }
    return;
  }
  if (id === 'cardboard_fort' || id === 'pillow_fort') {
    const paper = id === 'cardboard_fort';
    const liner = K.knitP(paper ? 0x9f6b65 : 0x62728a);
    if (paper) {
      box(p, 'tipped-carton-floor', [.84, .033, .82], brick);
      box(p, 'blanket-lining', [.77, .07, .72], liner, [0, .032, 0]);
      box(p, 'carton-back', [.84, .65, .035], brick, [0, .032, .39]);
      for (const x of [-.40, .40]) box(p, 'carton-side', [.039, .65, .82], brick, [x, .03, 0]);
      box(p, 'carton-top', [.84, .045, .82], brick, [0, .66, 0]);
      K.pane(p, 'half-drawn-plastic-sheet', [K.V(-.406, .64, -.42), K.V(.04, .64, -.42),
        K.V(-.18, .26, -.435), K.V(-.395, .13, -.435)], .016, glassBlue, K.GLASS);
    } else {
      box(p, 'blanket-floor', [.89, .048, .82], liner);
      for (const s of [-1, 1]) for (const [i, z] of [-.28, 0, .272].entries()) {
        const x = s * (.322 - i * .012);
        K.bevel(p, 'piled-pillow', [x - .132, .036, z - .139, x + .132, .29, z + .143], .046,
          K.clothP(i % 2 ? 0xb68e81 : 0xc4bfa3));
      }
      box(p, 'draped-quilt', [.74, .108, .53], layers(liner, grid(0x8e99a5, 5, 4)), [0, .30, .123]);
    }
    return;
  }
  if (id === 'reactor_meltdown') {
    K.pile(p, 'fused-slag-mound', .451, .36, K.stoneP(0x484746), id);
    for (let i = 0; i < 8; i++) {
      const a = i * 2.4;
      K.lump(p, 'slag-cinder', [.099, .052, .086], K.stoneP(i % 2 ? 0x61584c : 0x3d4143), id + i, {},
        [Math.cos(a) * .35, 0, Math.sin(a) * .35]);
    }
    lead(p, 'fused-remnant', [[-.34, .05, .19], [-.09, .304, -.04], [.17, .253, -.31]], .037, iron);
    return;
  }
  const alloy = K.steelP(0x949d9a);
  const scorched = K.steelP(0x5b6260);
  for (const sign of [-1, 1]) {
    K.hull(p, 'creased-wing-spar-offcut', [K.V(sign * .37, .005, -.31), K.V(sign * .025, 0, -.226),
      K.V(sign * .065, .015, .234), K.V(sign * .39, .06, .254), K.V(sign * .275, .117, -.23),
      K.V(sign * .128, .12, .215)], scorched);
  }
  K.pane(p, 'folded-aircraft-wing-skin', [K.V(-.414, .157, -.335), K.V(.062, .276, -.112), K.V(.157, .185, .279),
    K.V(-.227, .034, .193)], .038, layers(alloy, sides(['front', 'back'], grid(0x505c59, 7, 4))));
  for (let i = 0; i < 6; i++) {
    const g = p.group('buckled-aircraft-skin', { at: [(p.r() - .5) * .54, .12 + p.r() * .25, (p.r() - .5) * .53],
      rotY: p.r() * Math.PI, rotX: p.r() * .7 - .35, rotZ: p.r() * .7 - .35 });
    box(p, 'torn-riveted-panel', [.33, .031, .215], layers(K.steelP(i % 2 ? 0x929a97 : 0x8b6150), grid(0x4f5859, 4, 2)), [0, 0, 0], { parent: g });
  }
  hollowTube(p, 'exposed-turbine-intake', 'z', [.263, .161, -.041], .164, .116, .42, alloy, 10);
  cyl(p, 'deep-dark-intake', 'z', [.263, .161, .089], .121, .037, iron, undefined, 10);
  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7 + .08;
    lead(p, 'broken-turbine-blade', [[.263, .161, -.226], [.263 + Math.cos(angle) * .099, .161 + Math.sin(angle) * .099, -.207]], .014, scorched);
  }
}

function trailer(p, id) {
  const oak = K.woodP(0xa98962);
  const red = K.knitP(0x9d5147);
  const padded = K.knitP(0x829394);
  const suffix = id.slice('bullettrailer_'.length);
  if (suffix.startsWith('bed_')) {
    box(p, 'platform-bed-frame', [.94, .34, 1], oak);
    K.bevel(p, 'quilted-double-mattress', [-.45, .341, -.5, .45, .52, .5], .029,
      layers(K.clothP(0xbcac98), grid(0x9e8274, 7, 6)));
    if (suffix === 'bed_head') {
      box(p, 'curved-trailer-headboard', [.944, .44, .074], oak, [0, .34, .46]);
      for (const x of [-.21, .21]) K.bevel(p, 'pillow', [x - .17, .52, .17, x + .17, .635, .385], .034, cream);
    } else box(p, 'tucked-in-bedspread', [.923, .137, .61], padded, [0, .432, -.173]);
  } else if (suffix.startsWith('table_')) {
    const top = suffix === 'table_top', bottom = suffix === 'table_bottom';
    box(p, 'convertible-table-section', [.76, .054, 1], oak, [0, .71, 0]);
    if (top || bottom) {
      cyl(p, 'demountable-table-post', 'y', [0, .359, top ? .27 : -.26], .048, .718, steel);
      cyl(p, 'floor-mount', 'y', [0, .018, top ? .27 : -.26], .125, .036, iron);
    } else {
      box(p, 'table-slide-track', [.45, .067, .994], steel, [0, .644, 0]);
      box(p, 'middle-pedestal', [.108, .646, .096], steel);
    }
  } else if (suffix === 'sign_danabakery') {
    box(p, 'plywood-sign-post', [.076, 1.42, .072], darkWood);
    box(p, 'red-spraypaint-lettering', [.90, .47, .041], label("DANA'S BAKERY", 0xa63431, 0xbda47b), [0, 1.04, -.038], { ppm: 128 });
  } else if (suffix === 'minisofa') {
    box(p, 'folding-sofa-plinth', [.91, .30, .53], iron);
    K.bevel(p, 'coarse-red-seat', [-.454, .30, -.276, .454, .48, .252], .039, red);
    K.bevel(p, 'coarse-red-back', [-.453, .442, .185, .453, .822, .313], .038, red);
    for (const x of [-.452, .452]) box(p, 'folding-hinge', [.025, .085, .244], steel, [x, .394, .083]);
  } else if (suffix === 'toilet') {
    cyl(p, 'plastic-discharge-base', 'y', [0, .17, .02], .17, .34, cream, .188, 10);
    K.blob(p, 'compact-toilet-bowl', [.221, .15, .270], [0, .35, -.034], cream, {}, 3, 10);
    cyl(p, 'closed-seat-lid', 'y', [0, .482, -.050], .207, .040, K.plasticP(0xf0ebe0), .194, 10);
    box(p, 'foot-flush-pedal', [.077, .049, .095], steel, [.177, .038, -.126]);
  } else if (suffix === 'desk') {
    legs(p, .69, .465, .704, darkWood);
    box(p, 'desk-top', [.73, .052, .48], oak, [0, .703, 0]);
    for (const x of [-.30, .30]) box(p, 'bookcase-upright', [.045, .475, .23], oak, [x, .75, .114]);
    for (const y of [.856, 1.183]) box(p, 'desk-bookshelf', [.605, .041, .225], oak, [0, y, .114]);
    for (let i = 0; i < 6; i++) box(p, 'small-book', [.036, .15 + i % 3 * .026, .14], K.clothP([0x854c41, 0x597663, 0xa3865d][i % 3]),
      [-.24 + i * .05, .899, .122]);
  } else {
    const sink = suffix === 'sink';
    box(p, 'fitted-lower-cabinet', [.84, .76, .5], layers(oak, sides(['front'], grid(0x735338, 3, 2))));
    if (sink) {
      tray(p, 'stainless-steel-basin', [.62, .097, .41], steel, [0, .76, -.025], .025);
      lead(p, 'sink-faucet', [[.203, .79, .148], [.203, 1.02, .148], [0, 1.02, .035], [0, .96, -.066]], .020, steel);
    } else {
      box(p, 'trailer-counter', [.89, .055, .54], cream, [0, .76, -.02]);
      box(p, 'fitted-microwave', [.45, .265, .32], steel, [-.166, .815, .065]);
      box(p, 'microwave-window', [.32, .153, .013], black, [-.202, .867, -.102]);
      box(p, 'wall-cupboard', [.32, .39, .32], oak, [.248, .815, .071]);
    }
  }
}

function decorations(p, id) {
  if (id === 'bitts' || id === 'cleat') {
    box(p, 'bolted-mooring-base', [.67, .065, .29], iron);
    for (const x of [-.27, .27]) {
      cyl(p, 'anchor-bolt', 'y', [x, .074, 0], .031, .023, steel, undefined, 6);
      if (id === 'bitts') {
        cyl(p, 'mooring-post', 'y', [x * .76, .266, 0], .089, .41, iron, .073);
        cyl(p, 'mooring-post-cap', 'y', [x * .76, .474, 0], .112, .072, steel, .085);
      }
    }
    if (id === 'cleat') {
      box(p, 'cleat-pedestal', [.166, .139, .11], steel, [0, .065, 0]);
      lead(p, 'two-cleat-horns', [[-.297, .279, 0], [-.181, .224, 0], [.173, .224, 0], [.297, .275, 0]], .044, iron);
    }
  } else if (id === 'lighthouse_light') {
    cyl(p, 'lamp-plinth', 'y', [0, .054, 0], .262, .108, iron, .223);
    for (let i = 0; i < 8; i++) {
      const g = p.group('radial-heatsink', { at: [0, .11, 0], rotY: i * Math.PI / 4 });
      for (const y of [.038, .147, .252]) box(p, 'heat-dissipation-fin', [.069, .056, .282], steel, [0, y, .18], { parent: g });
    }
    cyl(p, 'LED-lamp-barrel', 'y', [0, .34, 0], .204, .48, iron);
    cyl(p, 'optical-lens', 'y', [0, .603, 0], .184, .061, glass(0xd5e6e4), .144, 12);
  } else if (id === 'shackle') {
    box(p, 'anchor-bolts-plate', [.41, .043, .24], iron);
    for (const s of [-1, 1]) {
      lead(p, 'heavy-chain', [[0, .059, 0], [s * .151, .043, .04], [s * .218, .052, .161], [s * .28, .057, .246]], .022, steel);
      hollowTube(p, 'iron-cuff', 'y', [s * .292, .070, .249], .063, .041, .064, iron, 8);
    }
  } else if (id === 'winter_wreath' || id === 'decorative_tree') {
    const colors = [0xaa5949, 0xc7a554, 0x729da4];
    if (id === 'winter_wreath') {
      hollowTube(p, 'spruce-wreath', 'z', [0, 1.37, .431], .301, .185, .104, leaf, 12);
      box(p, 'wreath-hook', [.039, .104, .04], steel, [0, 1.64, .453]);
    } else {
      for (const [y, r] of [[.49, .43], [.87, .34], [1.23, .245], [1.54, .15]]) {
        cyl(p, 'evergreen-tier', 'y', [0, y, 0], r, .51, leaf, r * .33, 9);
      }
      cyl(p, 'tree-trunk', 'y', [0, .225, 0], .075, .45, darkWood);
      box(p, 'tree-stand', [.43, .072, .41], iron);
    }
    for (let i = 0; i < 12; i++) {
      const a = i * 2.4;
      const y = id === 'winter_wreath' ? 1.37 + Math.sin(a) * .241 : .425 + i * .086;
      const r = id === 'winter_wreath' ? .241 : .41 - i * .024;
      const x = Math.cos(a) * r, z = id === 'winter_wreath' ? .369 : Math.sin(a) * r;
      K.blob(p, 'winter-ornament', [.047, .044, .044], [x, y, z], K.plasticP(colors[i % 3]), {}, 3, 6);
    }
  } else if (id === 'battlefield_cross') {
    K.pile(p, 'memorial-earth', .344, .125, K.stoneP(0x665844), id);
    for (const x of [-.105, .103]) K.bevel(p, 'empty-memorial-boot', [x - .073, 0, -.205, x + .073, .182, .105], .019, K.clothP(0x4e493c));
    box(p, 'inert-buried-memorial-silhouette', [.083, .83, .084], wood, [0, .09, .014]);
    box(p, 'memorial-crosspiece', [.224, .057, .081], iron, [0, .57, .014]);
    K.blob(p, 'resting-helmet', [.192, .112, .195], [0, .98, 0], K.stoneP(0x62684d), {}, 3, 9);
  } else {
    const keeper = id === 'highlands_gatekeeper_statue';
    const dark = K.stoneP(0x514f50);
    box(p, 'stone-plinth', [.61, .195, .48], stone);
    K.bevel(p, 'eroded-robed-figure', [-.234, .19, -.148, .234, 1.43, .178], .060, dark);
    K.lump(p, 'weathered-head', [.139, .171, .124], dark, id, {}, [0, 1.38, -.023]);
    if (keeper) {
      lead(p, 'upward-pointing-arm', [[.19, 1.18, 0], [.304, 1.43, -.04], [.293, 1.83, -.11]], .063, dark);
      lead(p, 'outstretched-arm', [[-.198, 1.22, -.055], [-.36, 1.17, -.29], [-.387, 1.27, -.368]], .055, dark);
      lead(p, 'censer-chains', [[-.386, 1.273, -.368], [-.426, 1.05, -.37], [-.365, .99, -.39]], .009, steel);
      cyl(p, 'bronze-censer', 'y', [-.393, .947, -.366], .066, .097, K.steelP(0xa17a4d), .084);
      for (const x of [-.094, .094]) lead(p, 'carved-horn', [[x, 1.59, 0], [x * 1.6, 1.73, .023]], .028, dark);
    }
  }
}

function sarcophagus(p, id) {
  const imperial = id.startsWith('imperial');
  const open = id.endsWith('_o');
  const tint = imperial ? 0xb0a389 : 0x85877f;
  const body = K.stoneP(tint);
  const relief = K.stoneP(imperial ? 0x8f7e62 : 0x777b74);
  box(p, 'stone-pedestal', [.94, .08, .99], stone);
  tray(p, 'carved-stone-coffin', [.865, .514, .94], body, [0, .08, 0], .082);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    if (open && imperial && i % 3 === 1) continue;
    const z = -.334 + i * .216;
    const center = s * .439, foremost = s * .458;
    K.pane(p, imperial ? 'marching-stone-relief' : 'hunched-mourner-relief', [K.V(center, .171, z - .057),
      K.V(center, .171, z + .052), K.V(foremost, .388, z + (imperial ? .048 : .070)),
      K.V(foremost, .388, z - .036)], .028, relief);
    K.blob(p, i === 0 && imperial ? 'veiled-procession-head' : 'carved-relief-head', [.018, .043, .032],
      [foremost, i === 0 && imperial ? .449 : .433, z + (imperial ? 0 : .015)], i === 0 && imperial ? body : relief, {}, 3, 6);
    if (imperial) lead(p, 'raised-forward-arm-in-relief', [[center, .334, z + .019], [foremost, .317, z + .078],
      [foremost, .371, z + .093]], .015, relief);
    else lead(p, 'mourner-arms-in-relief', [[center, .357, z - .025], [foremost, .314, z + .013],
      [foremost, .375, z + .057]], .016, relief);
  }
  if (!open) K.bevel(p, 'sealed-heavy-lid', [-.444, .592, -.48, .444, .735, .48], .029, body);
  else {
    const fragment = p.group('crooked-split-lid-piece', { at: [imperial ? -.14 : .025, .186, .232],
      rotY: imperial ? -.24 : .067, rotZ: imperial ? .24 : -.17 });
    K.hull(p, 'fractured-heavy-slab', [K.V(-.261, 0, -.15), K.V(.29, .012, -.14), K.V(.261, .021, .172),
      K.V(-.27, 0, .173), K.V(-.269, .11, -.147), K.V(.12, .118, -.193), K.V(.286, .139, .085),
      K.V(-.231, .131, .176)], body, { parent: fragment });
    for (let i = 0; i < (imperial ? 9 : 5); i++) {
      const x = (p.r() - .5) * .71;
      const z = i < 3 ? .52 - p.r() * .06 : (p.r() - .5) * .61;
      K.lump(p, 'broken-carving-fragment', [.069, .046, .056], relief, id + i, {}, [x, i < 3 ? 0 : .162, z]);
    }
  }
}

function eggs(p, id) {
  const broken = id === 'egg_sacke';
  const great = id === 'egg_sackws';
  const r = great ? .35 : .257;
  const silk = K.clothP(broken ? 0x9b8972 : 0xb9b1a0);
  K.pile(p, 'silken-egg-nest', r + .052, great ? .22 : .12, silk, id);
  const membrane = glass(broken ? 0xb1a084 : 0xd3c7ad);
  for (let i = 0; i < (broken ? 6 : 10); i++) {
    const a = i * Math.PI / 5, b = a + Math.PI / 5;
    const at = (angle, radius, y) => K.V(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    K.pane(p, 'draped-translucent-silk-membrane', [at(a, r * 1.02, .065), at(b, r * 1.02, .065),
      at(b, r * .62, great ? .301 : .213), at(a, r * .63, great ? .30 : .211)], .009, membrane, K.GLASS);
  }
  for (let i = 0; i < (great ? 12 : 8); i++) {
    const a = i * 2.39996;
    const x = Math.cos(a) * r * (.32 + .55 * p.r()), z = Math.sin(a) * r * (.32 + .55 * p.r());
    const size = great ? .112 : id === 'egg_sackbw' ? .086 : .069;
    if (broken && i > 3) {
      K.pane(p, 'split-shell-fragment', [K.V(x - .048, .08, z), K.V(x + .051, .08, z),
        K.V(x, .16, z + .04)], .017, silk);
    } else K.blob(p, 'round-off-white-egg', [size, size * 1.24, size * .98], [x, size * 1.24 + (i % 3) * .071, z],
      K.clothP(i % 2 ? 0xd3c6a7 : 0xbdb29a), {}, great ? 4 : 3, great ? 8 : 7);
  }
  if (!broken) for (const s of [-1, 1]) {
    lead(p, 'bundling-silk-strand', [[s * r, .054, 0], [s * r * .65, .25, -.13], [0, great ? .39 : .30, -.10]], .014, silk);
  }
}

function emitter(p, id) {
  if (id === 'swamp_gas') {
    K.crumple(p, 'murky-water-pool', .44, .42, .02, K.plasticP(0x66734d), id);
    for (let i = 0; i < 6; i++) {
      const x = -.27 + i * .096;
      K.blob(p, 'swamp-bubble', [.028, .028, .028], [x, .034, (p.r() - .5) * .49], glass(0xb7bd84), K.GLASS, 3, 6);
    }
    return;
  }
  const fog = id.startsWith('fog');
  const air = id.includes('cold') ? 0xb3c7d5 : id.includes('hot') ? 0xc2a79a : id.includes('toxic') ? 0x91a55c : 0xc9d0cb;
  if (!fog) {
    box(p, 'floor-vent-frame', [.74, .035, .66], iron);
    box(p, 'dark-duct-opening', [.602, .007, .52], black, [0, .035, 0]);
    for (let i = 0; i < 8; i++) box(p, 'metal-grate-slat', [.62, .031, .033], steel, [0, .042, -.238 + i * .068]);
    if (id.endsWith('rad_leak')) return;
  }
  const blast = id.endsWith('blast') || id.endsWith('belch');
  const breath = id === 'fog_breather';
  const haze = flat(breath ? 0xd2dbd9 : air);
  for (let i = 0; i < (fog ? 7 : blast ? 8 : 5); i++) {
    const a = i * 2.39, r = fog ? (breath ? .239 : .162) : .106 + i * .013;
    const y = fog ? .089 + i * (breath ? .025 : .009) : .149 + i * (blast ? .057 : .022);
    K.blob(p, fog ? 'overlapping-water-vapor' : 'soft-edged-vent-plume',
      [fog ? .204 : .145 + i * .008, fog ? .057 : .099, fog ? .159 : .125],
      [Math.cos(a) * r, y, Math.sin(a) * r], haze, { haze: true }, 4, 8);
  }
}

function siteMarker(p, id) {
  const clear = id === 'stook_empty';
  const paint = K.stoneP(clear ? 0x7f6d45 : 0x6d5d47);
  K.crumple(p, clear ? 'cleared-grain-drying-place' : 'cleared-crafting-soil', .426, .41, .019, paint, id);
  for (let i = 0; i < 5; i++) {
    const g = p.group('scattered-edge-stem', { at: [-.29 + i * .13, 0, .23 - i * .05], rotY: i * .57 });
    box(p, 'cut-stem', [.108, .026, .018], clear ? straw : wood, [0, 0, 0], { parent: g });
  }
}

function internalMarker(p) {
  const clear = (ctx, x, y, w, h) => ctx.clearRect(x, y, w, h);
  box(p, 'non-rendering-catalog-marker', [.03, .001, .03], clear, [0, 0, 0], K.CUT);
}

function oddments(p, id) {
  if (id === 'metal_trashcan') {
    const zinc = K.steelP(0x7d8583);
    cyl(p, 'steel-bin-bottom', 'y', [0, .024, 0], .157, .048, iron);
    hollowTube(p, 'open-corrugated-trashcan', 'y', [0, .238, 0], .173, .148, .43, zinc, 10);
    hollowTube(p, 'rolled-metal-bin-rim', 'y', [0, .456, 0], .183, .148, .034, steel, 10);
    for (const x of [-.165, .165]) box(p, 'bin-side-grip', [.053, .037, .107], iron, [x, .349, 0]);
  } else if (id === 'm224_mortar') {
    // Stylized static game prop, drawn as a generic angled tube on a base and bipod.
    K.bevel(p, 'inert-display-base', [-.281, 0, -.19, .281, .062, .21], .027, iron);
    const pipe = p.group('angled-display-tube', { at: [0, .077, .157], rotX: -.59 });
    K.cyl(p, 'olive-tube', 'y', [0, .465, 0], .057, .91, 10, K.steelP(0x5c634e), { parent: pipe, open: true });
    K.cyl(p, 'dark-recess', 'y', [0, .846, 0], .054, .02, 10, black, { parent: pipe });
    for (const s of [-1, 1]) lead(p, 'display-brace', [[s * .294, .017, -.33], [s * .151, .348, -.191], [0, .49, -.13]], .024, iron);
  } else {
    const cloth = layers(K.knitP(0x696b65), grid(0x474e45, 4, 7));
    box(p, 'worn-swivel-seat-base', [.44, .085, .39], iron);
    cyl(p, 'seat-swivel', 'y', [0, .187, 0], .105, .21, steel);
    K.bevel(p, 'waterlogged-seat-cushion', [-.25, .26, -.22, .25, .43, .228], .043, cloth);
    K.bevel(p, 'mildewed-contoured-seat-back', [-.236, .397, .125, .237, .93, .263], .043, cloth);
    for (const x of [-.222, .222]) box(p, 'sunken-seat-bolster', [.063, .10, .40], cloth, [x, .391, 0]);
  }
}

export const WORLD_FURNITURE = [
  ...family(mound, Object.keys(moundColors).flatMap((kind) => ['short','mid','tall'].map((s) => kind + '_mound_' + s)).join(' ')),
  ...family(sticks, 'stick_long_stack_mid stick_long_stack_short stick_long_stack_tall stick_stack_mid stick_stack_short stick_stack_tall'),
  ...family(shore, 'beach_log beach_seaweed'),
  ...family(marine, Object.keys(seaPlants).concat('sea_sponge').join(' ')),
  ...family(topiary, 'topiary_abstract topiary_animal topiary_dragon'),
  ...family(rustic, 'beaver_dam brambles glowingbulb midden mutant_tree_adult mutant_tree_sapling mutant_tree_sprout'),
  ...family(salvage, 'cardboard_fort pillow_fort plane_wreckage reactor_meltdown scrap_bridge'),
  ...family(trailer, 'bullettrailer_bed_foot bullettrailer_bed_head bullettrailer_cabinet bullettrailer_desk bullettrailer_minisofa bullettrailer_sign_danabakery bullettrailer_sink bullettrailer_table_bottom bullettrailer_table_middle bullettrailer_table_top bullettrailer_toilet'),
  ...family(decorations, 'bitts cleat decorative_tree highlands_gatekeeper_statue highlands_holy_statue lighthouse_light shackle battlefield_cross'),
  ...family(decorations, 'winter_wreath', { faceWall: true }),
  ...family(sarcophagus, 'highland_sarcophagus highland_sarcophagus_o imperial_sarcophagus imperial_sarcophagus_o'),
  ...family(eggs, 'egg_sackbw egg_sackcs egg_sacke egg_sackws'),
  ...family(emitter, 'fog fog_breather swamp_gas vent_cold_air2_blast vent_cold_air2_stream vent_hot_air2_blast vent_hot_air2_stream vent_rad_leak vent_toxic_belch vent_toxic_leak'),
  ...family(siteMarker, 'ground_crafting_spot stook_empty'),
  ...family(internalMarker, 'clear fake_bench_hands no_item region_flower region_flower_decorative region_forest region_forest_dense region_forest_water region_lake_bed region_ocean_bed region_plain region_water_plant region_weed'),
  ...family(oddments, 'metal_trashcan m224_mortar sunkenhelicopter_seat_rotating'),
].map((r) => ({ ...r, source: 'tools/cubeclysm/page/furniture-world.js' }));
