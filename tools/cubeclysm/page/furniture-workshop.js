import {
  K, box, cyl, hollowTube, tray, legs, tank, display, label, vents, lead, bearingWheel, family,
  flat, glass, grid, layers, masonry, sides, wood, darkWood, iron, steel, black, copper, stone,
} from './furniture-extra-kit.js';
import { robotArm } from './furniture-medical.js';

const rust = K.steelP(0x745c4c);
const enamel = K.steelP(0x657d73);
const yellow = K.steelP(0xb1894d);
const clay = K.stoneP(0xa47452);
const ash = K.stoneP(0x484240);

function anvil(p, id) {
  const log = id === 'anvil_ingot' || id === 'anvil_scavenged';
  const bronze = id === 'anvil_bronze';
  const heavy = id === 'anvil_heavy';
  const crude = id === 'anvil_crude';
  const camp = id === 'camp_anvil';
  const width = heavy ? .85 : log ? .65 : crude || camp ? .56 : .72;
  const depth = heavy ? .36 : crude || camp ? .25 : .29;
  const y = heavy ? .522 : log ? .57 : camp ? .27 : crude ? .242 : .406;
  const top = y + (heavy ? .123 : .083);
  const face = bronze ? copper : steel;
  const body = bronze ? K.steelP(0xa08650) : crude ? rust : iron;
  if (log) {
    cyl(p, 'heavy-split-log-stand', 'y', [0, y / 2, 0], .245, y, K.barkP(0x76563b), .225, 10);
    for (const h of [.094, y - .12]) cyl(p, 'log-banding', 'y', [0, h, 0], .241, .037, iron, .232, 10);
  } else {
    for (const x of [-width * .241, width * .22]) K.bevel(p, 'flared-anvil-foot',
      [x - .098, 0, -depth * .53, x + .098, .095, depth * .53], .023, body);
    K.hull(p, 'tapered-anvil-waist', [
      ...[-.28, .274].flatMap((x) => [-.404, .404].map((z) => K.V(x * width, .072, z * depth))),
      ...[-.16, .166].flatMap((x) => [-.273, .273].map((z) => K.V(x * width, y * .55, z * depth))),
      ...[-.22, .21].flatMap((x) => [-.39, .39].map((z) => K.V(x * width, y + .014, z * depth))),
    ], body);
  }
  if (id === 'anvil_ingot') {
    K.bevel(p, 'steel-ingot-with-flat-face', [-.206, y, -.136, .163, y + .155, .136], .021, steel);
    for (const z of [-.17, .164]) box(p, 'smaller-shaping-insert', [.236, .056, .064], body, [0, y + .004, z]);
    return;
  }
  if (id === 'anvil_scavenged') {
    K.bevel(p, 'machined-scavenged-part', [-.225, y, -.143, .205, y + .116, .134], .024, body);
    box(p, 'polished-scavenged-striking-face', [.404, .028, .192], face, [-.005, y + .105, -.004]);
    box(p, 'sawn-stepped-machine-flange', [.142, .098, .056], body, [.154, y + .019, .135]);
    return;
  }
  // The heel contains two bores. Split the heel along its width so the squares
  // and polygons around the bores do not lay geometry over either aperture.
  const hx = -width * .319, hz = depth * .215;
  const px = -width * .317, pz = -depth * .210;
  const floor = y, height = top - y, rr = heavy ? .024 : .017, half = heavy ? .027 : .019;
  const heel0 = -width * .478, heel1 = -width * .183;
  const widthFace = width * .68;
  for (const [a, b] of [[heel1, width * .291], [heel0, hx - half], [hx + half, heel1]]) {
    box(p, 'continuous-anvil-striking-face', [b - a, height, depth], face, [(a + b) / 2, floor, 0]);
  }
  for (const [a, b] of [[hz + half, depth / 2], [pz + rr, hz - half], [-depth / 2, pz - rr]]) {
    box(p, 'heel-hole-outside', [half * 2, height, b - a], face, [hx, floor, (a + b) / 2]);
  }
  for (const sign of [-1, 1]) {
    K.hull(p, 'round-hole-corner-liner', [
      ...[floor, top].flatMap((yy) => [K.V(px + sign * half, yy, pz - rr), K.V(px + sign * half, yy, pz + rr),
        K.V(px + sign * rr * .69, yy, pz + rr), K.V(px + sign * rr * .69, yy, pz - rr),
        K.V(px + sign * rr, yy, pz)]),
    ], face);
  }
  K.hull(p, 'curving-tapered-anvil-horn', [
    K.V(width * .22, y, -depth * .37), K.V(width * .22, y, depth * .37),
    K.V(width * .22, top, -depth * .455), K.V(width * .22, top, depth * .455),
    K.V(width * .406, top - .015, -depth * .216), K.V(width * .406, top - .015, depth * .216),
    K.V(width * .514, top - .046, 0), K.V(width * .429, y + .015, 0),
  ], body);
  if (!camp && !crude) box(p, 'forging-step', [widthFace * .164, .028, depth * .752], body, [width * .271, top - .031, 0]);
}
function hotShop(p, id) {
  const kiln = id.includes('kiln') || id.startsWith('arcfurnace');
  const full = id.endsWith('_full');
  const portable = id.includes('portable');
  const arc = id.startsWith('arcfurnace');
  const electric = id === 'steel_kiln';
  const exodii = id === 'exodii_kiln';
  const rock = id.startsWith('kiln_') && !id.includes('metal') && !portable || id === 'forge_rock';
  const clayKiln = id === 'clay_kiln';
  const artisan = id.startsWith('forge_artisan');
  if (kiln && (arc || electric || exodii)) {
    const h = electric ? .76 : exodii ? 1.46 : .94;
    const w = electric || exodii ? .95 : .81;
    const heatPaint = exodii ? K.steelP(0x6d7770) : electric ? enamel : steel;
    legs(p, w, .81, .095, iron, .073);
    K.bevel(p, 'insulated-heating-chamber', [-w / 2, .09, -.392, w / 2, h, .392], .038, heatPaint);
    const g = p.group('kiln-access-hinge', { at: [-w * .37, .184, -.416], rotY: full ? 0 : arc ? .35 : .23 });
    box(p, 'heating-chamber-door', [w * .56, h * .56, .078], iron, [w * .285, 0, 0], { parent: g });
    box(p, 'door-draw-latch', [.053, .071, .048], steel, [w * .51, h * .29, -.059], { parent: g });
    display(p, 'heat-controller', w * .19, .078, w * .328, h * .65, -.413, full ? 0x9d814e : 0x577771);
    vents(p, 'thermal-slotted-intake', w * .28, .157, w * .294, h * .284, -.405);
    if (arc || exodii) {
      for (const x of [-w * .29, 0, w * .29]) cyl(p, 'insulated-service-terminal', 'y', [x, h + .058, .092], .054, .127, iron, .046);
      lead(p, 'shielded-supply-line', [[w * .28, h + .12, .092], [w * .37, h + .17, .19], [w * .41, h * .92, .32]], .022, black);
    }
    return;
  }

  const firebrick = masonry(id, { brick: 0x946550, mortar: 0x88796b, rows: 5, cols: 5 });
  if (rock || clayKiln) {
    const radius = clayKiln ? .378 : .41;
    cyl(p, 'kiln-hearth-block', 'y', [0, .088, 0], radius, .176, clayKiln ? clay : stone, undefined, 10);
    const y = clayKiln ? .435 : .35;
    for (let i = 0; i < 10; i++) {
      if (i === 6 || i === 7 || i === 8) continue;
      const a = i * 2 * Math.PI / 10;
      const g = p.group('masonry-chamber-sector', { at: [Math.cos(a) * .295, .165, Math.sin(a) * .295], rotY: -a });
      box(p, 'chamber-wall', [.117, y * .8, .218], clayKiln ? clay : firebrick, [0, 0, 0], { parent: g });
    }
    if (kiln) {
      cyl(p, 'chamfered-clay-vault', 'y', [0, y + .085, .037], radius * .943, .205, clayKiln ? clay : firebrick, radius * .54, 10);
      hollowTube(p, 'kiln-vent', 'y', [0, y + .269, .091], .087, .048, .181, clayKiln ? clay : stone, 8);
    }
    if (full || !kiln) {
      const chamber = p.group('chamber-floor', { at: [0, .175, -.067] });
      K.pile(p, full ? 'loaded-charcoal-or-wood' : 'forge-coal-firebed', .197, full ? .131 : .095, ash, id, { parent: chamber });
      if (full) for (const x of [-.107, .104]) box(p, 'loaded-charcoal-split-wood', [.073, .070, .23],
        darkWood, [x, .176, -.107]);
    }
    return;
  }
  const radius = portable ? .225 : .32;
  const topY = portable ? .59 : kiln ? .84 : .91;
  if (kiln) {
    const h = topY - .139;
    legs(p, radius * 1.67, radius * 1.55, .149, iron, .055);
    cyl(p, 'sealed-charcoal-chamber', 'y', [0, .14 + h * .5, .016], radius, h, full ? rust : steel, radius * .96, 12);
    cyl(p, 'kiln-ring-lid', 'y', [0, topY + .018, .016], radius + .018, .048, iron, undefined, 10);
    box(p, 'kiln-lid-latch', [.083, .057, .035], steel, [0, topY - .051, -radius]);
    if (full) box(p, 'loaded-kiln-indicator', [.072, .029, .015], flat(0xb69258), [.103, topY - .052, -radius]);
    if (portable) for (const s of [-1, 1]) {
      const x = s * radius;
      lead(p, 'foldaway-kiln-carry-handle', [[x, topY - .142, -.092], [x + s * .071, topY - .112, -.075],
        [x + s * .071, topY - .112, .109], [x, topY - .142, .114]], .017, iron);
    }
    hollowTube(p, 'gas-vent-neck', 'y', [.078, topY + .086, .094], .058, .034, .112, steel, 8);
  } else {
    legs(p, .79, .64, .742, iron, .063);
    tray(p, 'forge-firepot', [.82, .16, .69], iron, [0, .735, 0], .051);
    const pot = p.group('firepot-contents', { at: [0, .783, -.011] });
    K.crumple(p, 'dark-coal-bed', .218, .222, .064, ash, id, { parent: pot });
    lead(p, 'forge-air-pipe', [[.15, .684, .021], [.335, .669, .021], [.395, .619, .164]], .039, steel);
    if (artisan) {
      for (const x of [-.29, .29]) lead(p, 'wall-fed-forge-pipe', [[x, .78, .25], [x, 1.23, .31], [x, 1.23, .483]], .024, copper);
      const lit = id.endsWith('_1');
      box(p, 'artisan-control', [.164, .172, .085], enamel, [.31, 1, .262]);
      display(p, 'forge-status', .112, .066, .31, 1.079, .203, lit ? 0x907956 : 0x435654);
      if (lit) for (let i = 0; i < 4; i++) {
        cyl(p, 'hot-embers', 'y', [-.11 + i * .075, .847 + .008 * (i % 3), -.03], .052, .027, K.stoneP(i % 2 ? 0xbd7546 : 0xb18b52));
      }
    }
  }
}

function barrelPlant(p, id) {
  const woodVat = id.includes('_wood');
  const ferment = id.startsWith('fvat');
  const compost = id.startsWith('compost');
  const full = id.endsWith('full');
  const churn = id === 'butter_churn';
  const still = id === 'still';
  const mixture = id === 'chemical_mixer';
  const radius = ferment ? .233 : churn ? .164 : compost ? .455 : mixture ? .34 : .291;
  const height = ferment ? .56 : churn ? .72 : compost ? 1.65 : mixture ? .960 : 1.13;
  const finish = woodVat ? wood : still ? copper : compost ? enamel : steel;
  const ground = churn ? .16 : 0;
  if (churn) {
    legs(p, .47, .43, .154, iron, .045);
    box(p, 'churn-stand-platform', [.443, .039, .408], iron, [0, .147, 0]);
  }
  if (ferment && !full) {
    cyl(p, 'vat-base', 'y', [0, .024, 0], radius, .048, finish, undefined, 10);
    hollowTube(p, 'empty-fermenting-vessel', 'y', [0, height / 2, 0], radius, radius - .028, height, finish, 10);
    cyl(p, 'removed-vat-lid', 'y', [.293, .023, .15], radius * .77, .044, woodVat ? wood : iron, undefined, 10);
  } else {
    tank(p, 'vessel', 0, 0, radius, height, finish, ground);
    if (woodVat) for (const y of [.116, .462]) cyl(p, 'wood-vat-band', 'y', [0, y, 0], radius + .012, .036, iron);
  }
  if (compost) {
    for (const x of [-.22, .22]) lead(p, 'digester-return-pipe', [[x, .273, -.32], [x, 1.29, -.36], [x * .63, 1.37, -.40]],
      .031, steel);
    box(p, 'digester-charge-status', [.161, .074, .015], label(full ? 'LOADED' : 'EMPTY', 0xded7a2, 0x535b4c), [0, .90, -.446], { ppm: 112 });
    box(p, 'level-sight-glass-window', [.062, .474, .026], black, [.142, .293, -.43]);
    box(p, 'liquid-level', [.034, full ? .36 : .043, .008], flat(0x96904e), [.142, .315, -.448]);
    box(p, 'sight-glass-cover', [.052, .446, .011], glass(0x9caaa0), [.142, .306, -.455], K.GLASS);
  } else if (churn) {
    box(p, 'pedal', [.139, .039, .177], iron, [.048, .051, -.216]);
    lead(p, 'pedal-driven-linkage', [[.07, .061, -.167], [.203, .242, -.146], [.192, .879, .004], [.08, .903, .008]], .018, iron);
  } else if (still) {
    tank(p, 'separate-condenser', .304, .051, .11, .665, steel, .048);
    lead(p, 'arched-metal-tube', [[0, 1.18, 0], [.058, 1.25, 0], [.245, 1.232, .05], [.304, .759, .05]], .027, copper);
  } else if (mixture || !ferment) {
    box(p, 'top-mixer-motor', [.319, .182, .271], iron, [0, height, 0]);
    if (!mixture) {
      tank(p, 'lab-reactor-receiver', .307, .083, .113, .641, steel);
      lead(p, 'wrapped-reactor-pipes', [[0, height + .10, .04], [.29, height + .14, .05], [.31, .707, .083]], .022, copper);
    } else display(p, 'agitator-status', .15, .069, .111, height + .046, -.147);
  } else if (full) {
    box(p, 'charged-vat-tag', [.115, .054, .019], label('FULL', 0xd8d5ac, 0x65513b), [-.032, .336, -.228], { ppm: 128 });
  }
}

function rack(p, id) {
  const metal = id.startsWith('metal_');
  const smoke = id.includes('smoking');
  const active = id.endsWith('active');
  const paint = metal ? steel : wood;
  if (id === 'hanging_meathook' || id.startsWith('hoist_')) {
    const chain = id.endsWith('chain') || id === 'hanging_meathook';
    box(p, 'overhead-anchor', [.299, .061, .191], iron, [0, 1.93, 0]);
    if (id === 'hoist_pulley' || id === 'hoist_chain') {
      cyl(p, 'pulley-tackle', 'z', [0, 1.73, 0], .135, .13, steel, undefined, 9);
      cyl(p, 'pulley-axle', 'z', [0, 1.73, -.069], .046, .053, iron);
    }
    for (const x of chain ? [0] : [-.074, .071]) {
      const hangY = chain ? 1.05 : .833;
      if (chain) for (let i = 0; i < 12; i++) {
        const y = 1.95 - i * .077;
        const s = i % 2 === 0;
        box(p, 'heavy-chain-link', [s ? .044 : .019, .079, s ? .019 : .044], steel, [x, y - .076, 0]);
      } else lead(p, 'hanging-rope-loop', [[x, 1.82, 0], [x, hangY + .10, .02], [x * .68, hangY, .015]], .016, K.clothP(0x9d895e));
    }
    lead(p, 'forged-meat-hook', [[0, 1.09, 0], [0, .943, 0], [.070, .905, 0], [.121, .953, 0], [.103, .997, 0]], .018, iron);
    return;
  }
  for (const x of [-.377, .377]) for (const z of [-.211, .211]) {
    lead(p, 'A-frame-trestle', [[x, .021, z], [x * .91, smoke ? 1.22 : 1.62, z * .22]], metal ? .033 : .049, paint);
    box(p, 'trestle-foot', [.114, .048, .099], paint, [x, 0, z]);
  }
  const top = smoke ? 1.23 : 1.62;
  box(p, 'crossbeam', [.878, .061, .090], paint, [0, top, 0]);
  if (!smoke) {
    for (const x of [-.19, .167]) lead(p, 'suspended-hook', [[x, top, 0], [x, top - .187, 0],
      [x + .087, top - .193, 0], [x + .104, top - .119, 0]], .014, iron);
    return;
  }
  for (const y of [.50, .74, .98]) for (const z of [-.167, -.087, .001, .082, .167]) {
    box(p, 'smoker-tray-lath', [.711, .025, .034], metal ? iron : darkWood, [0, y, z]);
  }
  tray(p, 'charcoal-pan', [.55, .079, .34], iron, [0, .136, 0], .021);
  if (active) {
    const coalPan = p.group('charcoal-pan-contents', { at: [0, .155, 0] });
    K.pile(p, 'warm-coals', .165, .06, K.stoneP(0x9b6846), id, { parent: coalPan });
    for (let i = 0; i < 5; i++) {
      K.blob(p, 'drifting-smoke-wisp', [.143, .110, .132], [(i % 3 - 1) * .09, 1.16 + i * .086, .02],
        flat(0xa1a79e), { haze: true }, 3, 6);
    }
  }
}

function hangingLine(p, id) {
  const web = id === 'web_up';
  const vine = id === 'vine_up';
  const paint = web ? K.clothP(0xb5b8a7) : vine ? K.barkP(0x526e42) : K.knitP(0xa38b61);
  lead(p, 'suspended-climb-line', [[-.07, .011, -.041], [.023, .261, -.032], [-.008, .85, -.003],
    [.025, 1.43, .024], [.021, 1.98, .007]], web ? .022 : vine ? .043 : .023, paint);
  if (vine || web) for (let i = 0; i < 5; i++) {
    const s = i % 2 ? 1 : -1, y = .43 + i * .282;
    lead(p, 'side-fiber', [[0, y, 0], [s * .082, y + .079, -.032], [s * .155, y + .136, .02]],
      web ? .008 : .016, paint);
  }
}

function mechanical(p, id) {
  const wheel = id.startsWith('spinwheel') || id.startsWith('water_mill') || id.startsWith('wind_mill');
  const bellows = id === 'bellows';
  if (wheel || bellows) {
    const spun = id.startsWith('spinwheel');
    const wind = id.startsWith('wind_mill');
    const active = id.endsWith('active');
    if (bellows) {
      const leather = K.clothP(0x5f4b3c);
      box(p, 'bellows-lower-board', [.621, .064, .453], wood);
      for (let i = 0; i < 7; i++) box(p, 'leather-bellows-fold', [.523 - i * .028, .045, .383 - i * .018], leather, [0, .061 + i * .034, .007]);
      const g = p.group('bellows-top-hinge', { at: [0, .287, -.014], rotX: -.23 });
      box(p, 'bellows-lifting-board', [.59, .053, .46], wood, [0, 0, 0], { parent: g });
      lead(p, 'bellows-lever', [[.28, .317, .09], [.427, .346, .13]], .029, wood);
      cyl(p, 'bellows-tapered-nozzle', 'z', [0, .15, -.259], .028, .14, iron, .049);
      return;
    }
    const y = spun ? .65 : wind ? 1.09 : .70;
    const r = spun ? .357 : wind ? .451 : .426;
    const paint = spun ? wood : darkWood;
    for (const x of [-.31, .31]) box(p, 'driveframe-upright', [.083, y, .119], paint, [x, 0, .16]);
    box(p, 'driveframe-bed', [.767, .067, .52], wood, [0, 0, .008]);
    box(p, 'shaft-support-beam', [.711, .081, .108], wood, [0, y - .045, .16]);
    const z = -.118;
    cyl(p, 'continuous-drive-shaft', 'z', [0, y, .032], .047, .327, iron, undefined, 8);
    if (wind) {
      cyl(p, 'windmill-wooden-shaft-hub', 'z', [0, y, z], .109, .126, wood, .079);
      for (let i = 0; i < 4; i++) {
        const g = p.group('windmill-sail', { at: [0, y, z], rotZ: (active ? .44 : .15) + i * Math.PI / 2 });
        box(p, 'sail-spar', [.059, r, .037], wood, [0, .034, 0], { parent: g });
        box(p, 'canvas-sail', [.182, .305, .021], layers(K.clothP(0xc4b799), grid(0x8b795e, 3, 4)),
          [.092, .131, -.025], { parent: g });
      }
    } else {
      bearingWheel(p, 'spoked-drivewheel', [0, y, z], r, paint, active ? .4 : 0);
      if (!spun) for (let i = 0; i < 10; i++) {
        const a = i * 2 * Math.PI / 10 + (active ? .31 : 0);
        const g = p.group('paddlewheel-slat', { at: [Math.cos(a) * r, y + Math.sin(a) * r, z], rotZ: a });
        box(p, 'water-paddle', [.107, .076, .194], wood, [0, -.030, 0], { parent: g });
      }
    }
    if (spun) {
      box(p, 'spinning-wheel-treadle', [.28, .064, .292], wood, [0, .088, -.11]);
      box(p, 'fiber-spindle-mount', [.197, .074, .142], darkWood, [.288, .46, .116]);
      cyl(p, 'fiber-loaded-bobbin', 'x', [.31, .583, .015], .052, .160,
        K.knitP(id.endsWith('leather') ? 0x84553d : id.endsWith('cordage') ? 0x9f8557 : 0xc0b5a0), .045);
    } else {
      const offset = wind ? .168 : .154;
      box(p, 'millstone-bed', [.472, .196, .235], stone, [.102, .066, offset]);
      cyl(p, 'paired-horizontal-millstones', 'y', [.11, .333, offset], .198, .145, stone, .182, 12);
      for (const k of [-1, 1]) {
        const taper = p.group('grain-hopper-side', { at: [.11 + k * .111, .465, offset], rotZ: -k * .23 });
        box(p, 'funnel-board', [.031, .144, .216], wood, [0, 0, 0], { parent: taper });
      }
      box(p, 'grain-hopper-rear', [.228, .137, .028], wood, [.11, .467, offset + .109]);
      box(p, 'grain-in-feed-hopper', [.173, .028, .178], K.stoneP(0xb1a06e), [.11, .486, offset]);
      const chute = p.group('flour-outlet', { at: [.338, .244, offset - .017], rotZ: -.27 });
      box(p, 'sloping-flour-chute', [.186, .037, .119], wood, [0, 0, 0], { parent: chute });
      if (!active) box(p, 'engaged-shaft-brake', [.141, .151, .073], iron, [.235, y - .148, -.137]);
      else box(p, 'released-brake-handle', [.048, .159, .046], steel, [.358, y - .175, -.009]);
    }
    return;
  }
  if (id === 'manual_tire_changer') {
    box(p, 'floor-anchoring-plate', [.62, .072, .57], iron);
    cyl(p, 'tire-changer-post', 'y', [0, .53, 0], .086, .941, enamel, .059);
    cyl(p, 'wheel-clamping-table', 'y', [0, .73, 0], .271, .067, iron, undefined, 10);
    for (const x of [-.168, .168]) box(p, 'clamp-jaw', [.095, .073, .12], steel, [x, .76, 0]);
    lead(p, 'clamp-lever', [[0, .918, 0], [.239, .97, -.108], [.396, .969, -.175]], .024, steel);
    box(p, 'integrated-pump-pedal', [.126, .031, .209], black, [.197, .087, -.123]);
    return;
  }
  if (id === 'scutch_breaker' || id === 'beverly_shear') {
    const shear = id === 'beverly_shear';
    const paint = shear ? steel : wood;
    legs(p, .79, .53, .704, shear ? iron : wood);
    box(p, shear ? 'mounting-bed' : 'wooden-breaker-bed', [.85, .073, .57], paint, [0, .703, 0]);
    for (const x of [-.276, .278]) box(p, 'breaker-hinge-post', [.094, .239, .113], paint, [x, .77, .104]);
    if (shear) {
      box(p, 'solid-shear-throat', [.39, .26, .207], iron, [.045, .769, .08]);
      K.pane(p, 'short-guillotine-blade', [K.V(-.16, .793, -.048), K.V(.10, .862, -.048), K.V(.11, .978, -.048),
        K.V(-.17, .91, -.048)], .028, steel);
      lead(p, 'long-shear-lever', [[.13, 1.025, .079], [.401, 1.26, .08], [.416, 1.35, .029]], .028, iron);
    } else {
      box(p, 'hinged-wooden-fiber-beam', [.74, .114, .112], wood, [0, .96, .10]);
      for (let i = 0; i < 11; i++) box(p, 'nail-comb-tooth', [.014, .085, .021], iron, [-.32 + i * .064, .845, -.09]);
    }
    return;
  }
  const hydraulic = id === 'hydraulic_press' || id === 'oil_press_industrial';
  const hammer = id.endsWith('hammer');
  const mill = id === 'mill_vertical';
  const screw = id === 'screw_press';
  const w = screw ? .64 : .79;
  const topY = mill ? 1.65 : hammer ? 1.61 : 1.42;
  const color = screw ? wood : hammer ? iron : enamel;
  box(p, 'press-plinth', [w, .119, .63], iron);
  for (const x of [-w * .43, w * .43]) box(p, 'press-frame-upright', [.100, topY - .11, .143], color, [x, .11, .104]);
  box(p, 'press-crosshead', [w, .125, .29], color, [0, topY - .035, .09]);
  box(p, mill ? 'adjustable-mill-bed' : 'workpiece-bed', [w * .81, .101, .432], steel, [0, .65, -.012]);
  cyl(p, mill ? 'vertical-spindle' : 'press-ram', 'y', [0, (topY + .91) / 2, -.005], .079, topY - .87, steel, .066);
  if (mill) {
    box(p, 'mill-motor-head', [.38, .258, .33], enamel, [0, 1.496, .12]);
    cyl(p, 'mill-cutter-chuck', 'y', [0, 1.04, -.005], .056, .146, iron, .045);
  } else if (hammer) {
    box(p, 'suspended-hammer-head', [.265, .209, .205], iron, [0, 1.019, -.015]);
    if (id === 'power_hammer') tank(p, 'integrated-pneumatic-cylinder', .307, .260, .134, .805, yellow, .137);
  } else if (screw) {
    cyl(p, 'screw-cross-handle', 'x', [0, topY + .147, .079], .033, .535, iron);
    for (const y of [.976, 1.086, 1.196, 1.316]) cyl(p, 'press-screw-thread', 'y', [0, y, -.004], .087, .039, iron);
    tray(p, 'pressed-liquid-tray', [.42, .099, .35], wood, [0, .75, -.038]);
  } else if (hydraulic) {
    lead(p, 'return-hose', [[.168, topY, .123], [.39, 1.27, .157], [.344, .332, .08]], .024, black);
    box(p, 'hydraulic-power-pack', [.235, .334, .238], iron, [.158, .119, .075]);
    if (id === 'oil_press_industrial') tray(p, 'oil-collecting-pan', [.44, .112, .371], steel, [0, .72, -.047]);
  }
}

function utilities(p, id) {
  if (id === 'ground_cable' || id.includes('electrical_conduit')) {
    const tube = id !== 'ground_cable';
    const strange = id.startsWith('LIXA');
    if (tube) {
      box(p, 'conduit-anchor', [.253, .061, .51], iron);
      if (strange) K.cyl(p, 'see-through-conduit-casing', 'z', [0, .121, 0], .121, .925, 9,
        glass(0x8bb2a4), { glass: true, open: true });
      else hollowTube(p, 'open-ended-conduit-casing', 'z', [0, .121, 0], .121, .084, .925, steel, 9);
    }
    for (let i = 0; i < (tube ? 4 : 6); i++) {
      const x = (i - 2.4) * (tube ? .031 : .066);
      const points = tube ? [[x, .111, -.477], [x + .013, .117, 0], [x * .96, .108, .477]]
        : [[x, .026, -.47], [x + .071, .032, -.224], [x - .064, .054, .014], [x + .09, .037, .25], [x + .037, .022, .47]];
      lead(p, 'heavy-electrical-cable', points, tube ? .016 : .027,
        K.plasticP(strange ? 0x8ccd9c : [0x464c4b, 0x745745, 0x4d6064][i % 3]), strange ? { glow: true } : {});
    }
  } else if (id === 'metal_detector') {
    for (const x of [-.373, .373]) {
      box(p, 'detector-foot', [.146, .078, .358], iron, [x, 0, 0]);
      box(p, 'walk-through-light-column', [.119, 1.93, .218], steel, [x, .07, .014]);
    }
    box(p, 'detector-upper-crosspiece', [.859, .163, .218], steel, [0, 1.836, .014]);
    display(p, 'offline-detector-display', .223, .060, .223, 1.888, -.103, 0x485551);
  } else if (id === 'capacitor') {
    box(p, 'capacitor-bank-base', [.82, .081, .59], iron);
    for (const x of [-.241, 0, .241]) {
      cyl(p, 'heavy-capacitor-can', 'y', [x, .44, 0], .105, .72, steel, .09, 10);
      cyl(p, 'terminal-cap', 'y', [x, .821, 0], .047, .070, iron);
      lead(p, 'bus-lead', [[x, .852, 0], [x, .957, .06], [.21, .942, .198], [.33, .728, .19]], .021, black);
    }
  } else if (id === 'robotic_arm') {
    box(p, 'robot-arm-bolted-base', [.66, .111, .56], iron);
    cyl(p, 'robot-arm-slew-bearing', 'y', [0, .204, 0], .203, .175, steel, .177);
    robotArm(p, 'industrial-assembly-arm', [[0, .28, 0], [-.286, .884, .05], [.063, 1.495, .158],
      [.286, 1.304, -.205], [.181, 1.038, -.29]], yellow, 1.33);
  } else if (id === 'nuclear_fuel_cell') {
    box(p, 'bundled-rod-shipping-frame', [.77, .081, .73], iron);
    for (const x of [-.24, -.08, .08, .24]) for (const z of [-.165, 0, .165]) {
      cyl(p, 'metal-rod', 'y', [x, .724, z], .047, 1.287, steel, .042, 7);
    }
    for (const y of [.19, .74, 1.28]) {
      for (const z of [-.223, .223]) box(p, 'assembly-spacer-grid', [.61, .051, .059], iron, [0, y, z]);
      for (const x of [-.286, .286]) box(p, 'assembly-spacer-edge', [.052, .052, .431], steel, [x, y, 0]);
    }
  } else if (id === 'compact_ASRG_containment') {
    K.bevel(p, 'shielded-generator-containment', [-.443, 0, -.373, .443, .919, .373], .059, iron);
    for (const x of [-.313, .313]) box(p, 'armored-edge-rib', [.088, .798, .072], steel, [x, .071, -.368]);
    box(p, 'radiation-warning-plate', [.38, .161, .02], label('CAUTION', 0x332c1c, 0xc6a34b), [0, .568, -.419], { ppm: 144 });
    for (const x of [-.18, .18]) cyl(p, 'sealed-top-access-port', 'y', [x, .962, .102], .072, .113, steel, .053);
  } else {
    const broken = id.endsWith('_o');
    box(p, 'console-stand', [.364, .745, .395], iron);
    box(p, 'flow-control-desk', [.618, .166, .498], steel, [0, .745, -.063]);
    box(p, 'gas-monitor-head', [.564, .368, .293], enamel, [0, .904, .109]);
    if (!broken) {
      for (const x of [-.161, 0, .168]) {
        cyl(p, 'flow-dial-bezel', 'z', [x, .922, -.068], .041, .015, steel, undefined, 8);
        cyl(p, 'flow-dial-face', 'z', [x, .922, -.080], .029, .011, K.paperP(0xb8beaa), undefined, 8);
      }
    }
    display(p, 'flow-monitor-screen', .446, .196, 0, .984, -.05, broken ? 0x505954 : 0x638a73);
    if (broken) lead(p, 'exposed-console-cable', [[.12, .94, -.055], [.281, .816, -.226], [.312, .763, -.276]], .014, rust);
    else for (const x of [-.132, .016, .167]) cyl(p, 'gas-console-wheel', 'y', [x, .933, -.182], .038, .048, iron);
  }
}

function terrarium(p) {
  const earth = K.stoneP(0x645841);
  box(p, 'vivarium-plinth', [.62, .072, .59], darkWood);
  box(p, 'vivarium-soil', [.54, .077, .51], earth, [0, .071, 0]);
  for (const x of [-.276, .276]) for (const z of [-.259, .259]) box(p, 'vivarium-corner-frame', [.036, .63, .037], wood, [x, .082, z]);
  box(p, 'vivarium-front-glass', [.525, .535, .013], glass(0xa6c2bd), [0, .152, -.26], K.GLASS);
  box(p, 'vivarium-side-glass', [.015, .535, .485], glass(0xa6c2bd), [.279, .152, 0], K.GLASS);
  box(p, 'vivarium-vented-lid', [.59, .033, .549], layers(wood, grid(0x706452, 9, 8)), [0, .709, 0]);
  for (const x of [-.18, .164]) lead(p, 'unfamiliar-plant', [[x, .14, .033], [x + .035, .255, .095],
    [x * .82, .359, .06]], .021, K.knitP(0x668949));
  K.blob(p, 'oversized-firefly-body', [.048, .041, .095], [-.028, .454, -.058], K.clothP(0x585249), {}, 3, 7);
  K.blob(p, 'firefly-luminous-abdomen', [.048, .044, .054], [-.028, .444, -.13], flat(0xc1cc76), { glow: true }, 3, 7);
  for (const s of [-1, 1]) {
    K.pane(p, 'firefly-wing', [K.V(-.028, .465, -.027), K.V(s * .139, .514, .016),
      K.V(s * .093, .459, -.097)], .009, glass(0xb5c9a3), K.GLASS);
  }
}

export const WORKSHOP_FURNITURE = [
  ...family(anvil, 'anvil anvil_bronze anvil_crude anvil_heavy anvil_ingot anvil_scavenged camp_anvil'),
  ...family(hotShop, 'arcfurnace_empty arcfurnace_full clay_kiln exodii_kiln forge forge_artisan_0 forge_artisan_1 forge_rock kiln_empty kiln_full kiln_metal_empty kiln_metal_full kiln_portable_empty kiln_portable_full steel_kiln'),
  ...family(barrelPlant, 'compost_empty compost_full fvat_empty fvat_full fvat_wood_empty fvat_wood_full still butter_churn chemical_mixer catalytic_cracking_reactor'),
  ...family(rack, 'butcher_rack hanging_meathook hoist_chain hoist_pulley hoist_rope metal_butcher_rack metal_smoking_rack metal_smoking_rack_active smoking_rack smoking_rack_active'),
  ...family(hangingLine, 'rope_up vine_up web_up'),
  ...family(mechanical, 'bellows beverly_shear drophammer hydraulic_press manual_tire_changer mill_vertical oil_press_industrial power_hammer screw_press scutch_breaker spinwheel spinwheel_cordage spinwheel_leather water_mill water_mill_active wind_mill wind_mill_active'),
  ...family(utilities, 'aut_gas_console aut_gas_console_o capacitor compact_ASRG_containment electrical_conduit ground_cable metal_detector nuclear_fuel_cell robotic_arm LIXA_electrical_conduit'),
  ...family(terrarium, 'firefly_terrarium'),
].map((r) => ({ ...r, source: 'tools/cubeclysm/page/furniture-workshop.js' }));
