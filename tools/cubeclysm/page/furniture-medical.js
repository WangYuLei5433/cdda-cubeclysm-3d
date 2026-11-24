import {
  K, box, cyl, hollowTube, tray, legs, cabinet, lead, display, label, vents, borePanel, family,
  flat, glass, grid, layers, iron, steel, cream, black, glassBlue,
} from './furniture-extra-kit.js';

const blue = K.clothP(0x527e85);
const casing = K.steelP(0xb8c8c5);
const turquoise = K.steelP(0x658982);
const oxygen = K.steelP(0x7c957d);
const ivory = K.steelP(0xd2d4c9);

function casters(p, w, d, height = .065) {
  for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) {
    cyl(p, 'rubber-caster', 'x', [x, height / 2, z], height / 2, .044, black, undefined, 8);
    box(p, 'caster-fork', [.069, .073, .050], steel, [x, height / 2, z]);
  }
}

function screen(p, name, w, h, x, y, z, color = 0x608877) {
  box(p, name + '-bezel', [w, h, .053], iron, [x, y, z]);
  display(p, name + '-display', w - .039, h - .035, x, y + .018, z - .027, color);
}

function pad(p, name, [loX, loY, loZ, hiX, hiY, hiZ], paint = blue) {
  K.bevel(p, name, [loX, loY, loZ, hiX, hiY, hiZ], .026, paint);
}

function diagnostic(p, id) {
  if (id === 'CTscan' || id === 'MRI') {
    const mri = id === 'MRI';
    const w = mri ? .99 : .925;
    const r = mri ? .42 : .409;
    const length = mri ? .64 : .39;
    box(p, 'scanner-plinth', [w, .14, .91], turquoise);
    box(p, 'gantry-lower-shell', [w - .058, .29, length + .09], ivory, [0, .14, .1]);
    hollowTube(p, 'open-gantry-body', 'z', [0, .87, .09], r, mri ? .282 : .299, length, ivory, 14);
    hollowTube(p, 'gantry-front-bezel', 'z', [0, .87, .09 - length / 2 - .018], r * .967, mri ? .287 : .302,
      .042, mri ? turquoise : steel, 14);
    for (const x of [-.408, .408]) box(p, 'gantry-status-strip', [.058, .142, .024], turquoise,
      [x, .72, .071 - length / 2]);
    box(p, 'gantry-bed-guide', [.45, .16, .923], steel, [0, .23, -.016]);
    pad(p, 'narrow-slider', [-.186, .39, -.484, .186, .465, .46]);
    return;
  }
  if (id === 'dental_xray' || id === 'xray') {
    const dental = id === 'dental_xray';
    box(p, 'imaging-machine-plinth', [dental ? .41 : .65, .096, dental ? .41 : .66], iron, [.135, 0, .118]);
    box(p, 'telescoping-column', [.114, 1.47, .132], casing, [.35, .085, .25]);
    lead(p, 'articulated-imaging-arm', [[.35, 1.55, .25], [.265, 1.55, -.07], [.048, 1.46, -.22]],
      .052, cream);
    box(p, 'tilting-xray-head', [dental ? .185 : .258, .173, .202], casing, [.028, 1.29, -.224]);
    cyl(p, 'recessed-collimator', 'y', [.028, 1.272, -.224], dental ? .043 : .070, .068, iron, undefined, 9);
    if (!dental) {
      box(p, 'radiography-table-stand', [.415, .60, .48], steel, [0, .096, -.022]);
      pad(p, 'imaging-tabletop', [-.372, .686, -.478, .372, .786, .44], cream);
    } else {
      screen(p, 'dental-control-box', .193, .137, .349, 1.015, .148);
      box(p, 'cabled-control-button', [.055, .026, .051], flat(0xc8a355), [.213, 1.045, .158]);
    }
    return;
  }
  if (id === 'MS') {
    box(p, 'white-spectrometer-footing', [.856, .089, .685], iron);
    K.bevel(p, 'white-detector-enclosure', [-.421, .084, -.326, .421, 1.04, .326], .033, ivory);
    box(p, 'detector-access-door', [.464, .602, .051], casing, [-.156, .219, -.335]);
    box(p, 'detector-door-handle', [.079, .109, .057], steel, [-.004, .452, -.357]);
    box(p, 'sample-inlet-tray', [.303, .132, .209], iron, [.237, .427, -.264]);
    screen(p, 'mass-spectrum-monitor', .236, .151, .241, .691, -.349, 0x65788b);
    vents(p, 'spectrometer-side-vent', .19, .139, .228, .174, -.333);
    box(p, 'spectrometer-label', [.235, .045, .013], label('MS', 0xd6dcce, 0x677476), [-.205, .917, -.342], { ppm: 112 });
    return;
  }
  const nmr = id === 'NMR';
  const h = nmr ? 1.51 : 1.62;
  const r = nmr ? .331 : .252;
  box(p, 'instrument-skid', [nmr ? .888 : .732, .106, .63], iron);
  if (nmr) {
    cyl(p, 'magnet-cryostat', 'y', [0, h / 2 + .086, .038], r, h, casing, r * .94, 12);
    for (const y of [.40, .99, 1.26]) cyl(p, 'cryostat-band', 'y', [0, y, .038], r + .023, .037, steel, undefined, 12);
    lead(p, 'cryogenic-service-pipe', [[.29, .143, -.118], [.35, 1.37, -.105], [.19, 1.61, -.024]], .032, steel);
  } else {
    box(p, 'electronics-support-column', [.63, .825, .526], ivory, [0, .103, 0]);
    cyl(p, 'optics-column', 'y', [-.167, 1.15, .085], .142, .49, steel, .125, 9);
    cyl(p, 'sample-stage-housing', 'z', [-.167, .907, -.172], .101, .21, iron);
    screen(p, 'instrument-monitor', .241, .162, .184, 1.03, -.255, 0x5f837f);
  }
  box(p, 'analysis-instrument-label', [.23, .046, .015], label(nmr ? 'NMR' : 'MICROSCOPE', 0xdfe5d8, 0x505d59),
    [0, .382, nmr ? -.29 : -.275], { ppm: 128 });
  vents(p, 'lower-electronics-vent', .30, .115, .092, .173, -.288);
}

function exam(p, id) {
  if (id === 'IV_pole') {
    cyl(p, 'iv-pole', 'y', [0, .874, 0], .028, 1.747, steel);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5, x = Math.cos(a) * .24, z = Math.sin(a) * .24;
      lead(p, 'caster-leg', [[0, .122, 0], [x * .8, .075, z * .8], [x, .061, z]], .022, iron);
      cyl(p, 'iv-caster', 'x', [x, .032, z], .034, .038, black);
    }
    lead(p, 'iv-hanging-hooks', [[-.155, 1.668, 0], [-.155, 1.743, 0], [0, 1.731, 0],
      [.155, 1.743, 0], [.155, 1.668, 0]], .012, steel);
    return;
  }
  if (id === 'autodoc_couch') {
    const red = K.knitP(0x8e4549);
    const seam = K.clothP(0x673a42);
    for (const x of [-.362, .362]) for (const z of [-.277, .266]) box(p, 'sofa-foot', [.109, .067, .091], iron, [x, 0, z]);
    pad(p, 'wide-plush-sofa-base', [-.45, .063, -.386, .45, .353, .395], red);
    for (const x of [-.178, .178]) {
      pad(p, 'plush-seat-cushion', [x - .176, .335, -.359, x + .176, .498, .235], red);
      pad(p, 'plush-back-cushion', [x - .177, .426, .206, x + .177, .916, .379], red);
    }
    for (const x of [-.393, .393]) {
      pad(p, 'rounded-sofa-arm', [x - .069, .336, -.355, x + .069, .627, .374], seam);
    }
    box(p, 'single-right-leather-strap', [.145, .021, .062], K.clothP(0x584035), [-.391, .627, -.066]);
    box(p, 'strap-buckle', [.046, .017, .069], steel, [-.384, .645, -.067]);
    for (const x of [-.374, .374]) lead(p, 'surgical-overhead-rail', [[x, .439, .391], [x, 1.64, .391], [x, 1.681, -.005]], .027, steel);
    box(p, 'overhead-medical-crossbeam', [.803, .081, .114], casing, [0, 1.612, .048]);
    cyl(p, 'small-surgical-light', 'y', [-.104, 1.575, -.074], .143, .078, cream, .116, 10);
    for (const x of [.071, .254]) lead(p, 'hanging-diagnostic-probe', [[x, 1.65, .087], [x - .021, 1.505, -.136],
      [x + .021, 1.408, -.11]], .017, iron);
    return;
  }
  const chair = id === 'exam_chair';
  const couch = id.endsWith('_couch');
  const nether = id.startsWith('nl_');
  const scan = id === 'scan_bed';
  const y = chair ? .55 : scan ? .53 : .67;
  if (nether) casters(p, .48, .64);
  box(p, 'exam-equipment-base', [chair ? .59 : .64, .13, .75], nether ? iron : steel, [0, nether ? .083 : 0, 0]);
  box(p, 'lifting-column', [.252, y - .115, .42], casing, [0, .13, .035]);
  const w = chair ? .53 : scan ? .42 : .615;
  pad(p, scan ? 'narrow-patient-bed' : 'padded-exam-surface',
    [-w / 2, y, -.478, w / 2, y + .083, .461], nether ? steel : blue);
  if (scan) {
    for (const x of [-.168, .168]) box(p, 'scanner-slide-rail', [.033, .037, .864], steel, [x, y - .033, .005]);
    return;
  }
  for (const x of [-w / 2, w / 2]) {
    box(p, 'armrest-support', [.039, .108, .044], steel, [x, y + .061, .081]);
    box(p, 'padded-armrest', [.074, .062, chair ? .39 : .31], nether ? iron : blue, [x, y + .153, -.001]);
  }
  if (couch || chair) {
    const back = p.group('tilted-backrest', { at: [0, y + .041, chair ? .222 : .33], rotX: chair ? .31 : .16 });
    box(p, 'padded-backrest', [w, chair ? .62 : .355, .107], nether ? iron : blue,
      [0, 0, 0], { parent: back });
    if (nether) for (const x of [-.33, .33]) screen(p, 'burned-in-table-monitor', .166, .130, x, .491, -.308, 0x4a544d);
  }
  if (chair) {
    lead(p, 'overhead-medical-support', [[.335, .121, .303], [.335, 1.60, .305], [.107, 1.78, .051], [.034, 1.696, -.116]], .036, steel);
    cyl(p, 'overhead-exam-light', 'y', [.026, 1.681, -.117], .151, .083, cream, .119, 10);
    cyl(p, 'light-diffuser', 'y', [.026, 1.637, -.117], .121, .012, flat(0xe0e6d3), undefined, 10);
  }
}

function lifeSupport(p, id) {
  const anesthetic = id === 'anesthetic';
  const dialysis = id === 'dialysis';
  casters(p, .46, .391);
  box(p, 'trolley-base', [.56, .104, .47], steel, [0, .088, 0]);
  box(p, 'wheeled-medical-enclosure', [.49, dialysis ? .97 : .841, .399], casing, [-.023, .19, .022]);
  const h = dialysis ? 1.16 : 1.03;
  screen(p, 'medical-monitor', .385, .247, -.024, h - .26, -.208, anesthetic ? 0x7d9475 : 0x6c9996);
  vents(p, 'medical-device-intake', .21, .149, -.078, .29, -.193);
  for (const x of [-.171, -.088, -.012]) cyl(p, 'medical-control', 'z', [x, h - .295, -.222], .023, .039, steel);
  if (anesthetic) {
    box(p, 'trolley-cylinder-shelf', [.211, .036, .177], steel, [.243, .223, .129]);
    for (const x of [.217, .313]) {
      cyl(p, 'trolley-gas-cylinder', 'y', [x, .506, .129], .059, .538, oxygen, .046);
      cyl(p, 'cylinder-valve', 'y', [x, .784, .129], .025, .052, steel);
      lead(p, 'cylinder-hose', [[x, .81, .129], [x, .857, .022], [.181, .796, -.18]], .014, black);
    }
  } else if (dialysis) {
    for (const x of [.201, .292]) {
      cyl(p, 'filter-column', 'y', [x, .575, -.124], .039, .335, cream, .035);
      lead(p, 'filter-return-tube', [[x, .745, -.124], [x, .798, -.202], [.075, .663, -.225],
        [x, .385, -.163]], .011, K.plasticP(x < .25 ? 0x9c5553 : 0x516b89));
    }
  } else {
    lead(p, 'looping-breathing-circuit', [[.14, .681, -.21], [.261, .654, -.296], [.282, .47, -.24],
      [.211, .45, -.13], [.158, .58, -.097]], .029, K.plasticP(0x77a0a4));
    box(p, 'ventilation-manifold', [.148, .125, .116], iron, [.13, .538, -.174]);
  }
}

function workSurface(p, id) {
  const hood = id === 'fume_hood';
  const w = .94, d = .67;
  cabinet(p, [w, .83, d], casing, [.35]);
  box(p, 'lab-cabinet-front', [.83, .724, .041], layers(casing, grid(0x617673, 2, 2)), [0, .06, -d / 2]);
  box(p, 'chemical-resistant-countertop', [.985, .062, .71], K.plasticP(0x404b4c), [0, .825, 0]);
  if (hood) {
    const y = .885;
    box(p, 'hood-back', [.91, 1.05, .053], steel, [0, y, .322]);
    for (const x of [-.43, .43]) box(p, 'hood-side', [.072, .85, .63], cream, [x, y, .01]);
    box(p, 'hood-exhaust-canopy', [.95, .21, .664], casing, [0, 1.731, .021]);
    box(p, 'ventilated-glass-sash', [.794, .545, .025], glassBlue, [0, 1.159, -.292], K.GLASS);
    box(p, 'sash-lift-bar', [.813, .051, .051], steel, [0, 1.132, -.296]);
    vents(p, 'hood-exhaust-intake', .54, .17, 0, 1.532, .286);
  } else {
    box(p, 'service-rail', [.865, .146, .088], steel, [0, .878, .282]);
    for (const x of [-.294, -.09, .159, .31]) {
      box(p, 'outlet-faceplate', [.072, .063, .018], cream, [x, .926, .23]);
      box(p, 'outlet-slot', [.032, .013, .012], iron, [x, .946, .216]);
      box(p, 'cabinet-handle', [.078, .022, .030], steel, [x, .60, -.361]);
    }
    lead(p, 'bench-utility-fitting', [[.26, .887, .132], [.26, 1.064, .132], [.145, 1.063, -.043]], .020, K.steelP(0xa58a57));
  }
}

const instrumentColors = {
  GC: 0x829396, HPLC: 0x729591, centrifuge: 0x90a4ab, shaker: 0x8c9a83,
};
function instrument(p, id) {
  if (id === 'sample_freezer') {
    box(p, 'insulated-lab-freezer', [.810, 1.81, .71], casing);
    box(p, 'thick-freezer-door', [.735, 1.489, .058], layers(ivory, grid(0xa2ada8, 1, 2)), [0, .265, -.355]);
    box(p, 'insulated-latch', [.087, .238, .056], iron, [-.239, .94, -.408]);
    screen(p, 'cold-storage-status', .205, .107, .202, 1.55, -.402, 0x5b818e);
    vents(p, 'freezer-vent', .63, .15, 0, .066, -.362);
    return;
  }
  const color = instrumentColors[id];
  const paint = K.steelP(color);
  box(p, 'laboratory-machine-base', [.73, .075, .58], iron);
  if (id === 'centrifuge') {
    K.bevel(p, 'centrifuge-body', [-.314, .071, -.257, .314, .384, .257], .047, casing);
    cyl(p, 'rotor-cover-rim', 'y', [-.075, .39, .003], .224, .077, turquoise, undefined, 12);
    cyl(p, 'locking-rotor-cover', 'y', [-.075, .437, .003], .205, .039, cream, .169, 12);
    box(p, 'cover-latch', [.09, .047, .093], iron, [-.066, .337, -.238]);
    screen(p, 'automated-analyzer', .20, .10, .195, .216, -.264);
  } else if (id === 'shaker') {
    cabinet(p, [.704, .86, .55], casing, [.314]);
    box(p, 'incubator-glazing', [.594, .578, .022], glassBlue, [0, .124, -.29], K.GLASS);
    for (const x of [-.192, 0, .191]) cyl(p, 'shaker-carrier-vessel', 'y', [x, .413, -.054], .055, .15, glass(0x809a86), .038);
    screen(p, 'incubator-controls', .247, .089, .094, .718, -.301);
  } else {
    const liquid = id === 'HPLC';
    for (let i = 0; i < (liquid ? 3 : 2); i++) {
      const y = .076 + i * .179;
      box(p, 'stacked-analysis-module', [.63, .163, .495], paint, [0, y, 0]);
      vents(p, 'analysis-intake', .16, .069, -.162, y + .043, -.258);
      screen(p, 'analysis-panel', .20, .079, .139, y + .044, -.271, 0x678981);
    }
    if (liquid) for (const x of [-.176, .025, .188]) {
      cyl(p, 'glass-reservoir-bottle', 'y', [x, .716, -.025], .057, .206, glassBlue, .049, 10);
      lead(p, 'instrument-capillary', [[x, .835, -.025], [x, .881, .018], [.255, .645, .125]], .008, steel);
    } else {
      cyl(p, 'chromatograph-sample-tray', 'y', [.05, .51, .052], .144, .055, iron, undefined, 10);
      for (const x of [-.027, .049, .127]) cyl(p, 'sample-vial', 'y', [x, .562, -.009], .021, .067, glassBlue);
    }
  }
}

function autoclave(p, id) {
  const full = id.endsWith('_full');
  const body = K.steelP(0xa3b4b4);
  legs(p, .78, .62, .14, steel, .083);
  box(p, 'steam-sterilizer-bottom', [.78, .081, .683], body, [0, .14, .018]);
  box(p, 'steam-sterilizer-top', [.78, .122, .683], body, [0, .947, .018]);
  box(p, 'steam-sterilizer-back', [.772, .847, .041], body, [0, .207, .338]);
  for (const x of [-.368, .368]) box(p, 'steam-sterilizer-side', [.044, .767, .668], body, [x, .215, .014]);
  borePanel(p, 'solid-front-plate-with-chamber-opening', [-.381, .213, .381, .955],
    [-.073, .59, -.323], .183, flat(0xaab5b2));
  hollowTube(p, 'thick-steel-pressure-chamber-ring', 'z', [-.073, .59, -.347], .235, .176, .084, steel, 12);
  hollowTube(p, 'deep-horizontal-steam-chamber', 'z', [-.073, .59, -.120], .182, .163, .449, steel, 12);
  cyl(p, 'recessed-chamber-back', 'z', [-.073, .59, .095], .169, .031, iron, undefined, 12);
  const hinge = p.group('pressure-door-hinge', { at: [-.288, .59, -.366], rotY: full ? 0 : .88 });
  K.cyl(p, 'round-pressure-door', 'z', [.213, 0, -.025], .198, .077, 12, full ? iron : casing, { parent: hinge });
  box(p, 'mechanical-locking-crossbar', [.306, .041, .041], iron, [.213, -.025, -.083], { parent: hinge });
  K.cyl(p, 'locking-handwheel', 'z', [.213, 0, -.112], .064, .043, 9, steel, { parent: hinge });
  box(p, 'chamber-door-hinge-bracket', [.082, .185, .062], iron, [-.298, .49, -.354]);
  if (!full) for (const y of [.503, .561]) {
    box(p, 'empty-sterilizer-tray', [.251, .019, .36], steel, [-.073, y, -.124]);
  }
  screen(p, 'steam-cycle-control', .182, .108, .244, .855, -.379, full ? 0x8b8d5d : 0x628880);
  if (full) box(p, 'loaded-cycle-indicator', [.041, .025, .011], flat(0xc89a56), [.269, .813, -.40]);
}

export function robotArm(p, name, joints, paint, size = 1, tip = 'gripper') {
  const elbow = .049 * size;
  for (let i = 1; i < joints.length; i++) {
    const a = joints[i - 1], b = joints[i];
    lead(p, name + '-arm-link', [a, b], elbow * (1 - i * .09), paint);
    cyl(p, name + '-joint', 'z', a, elbow * (1.32 - i * .105), .070 * size, iron, undefined, 7);
  }
  const [x, y, z] = joints.at(-1);
  if (tip === 'scalpel') {
    box(p, 'slim-tool-holder', [.052, .074, .049], iron, [x, y - .055, z]);
    K.pane(p, 'reflective-scalpel-tool-head', [K.V(x - .012, y - .055, z), K.V(x + .012, y - .059, z),
      K.V(x + .013, y - .119, z - .015)], .008, steel);
  } else if (tip === 'disc') {
    box(p, 'rounded-tool-holder', [.062, .065, .066], iron, [x, y - .044, z]);
    cyl(p, 'disc-shaped-surgical-head', 'x', [x, y - .071, z], .058, .019, steel, undefined, 10);
    cyl(p, 'central-tool-nut', 'x', [x + .011, y - .071, z], .021, .012, iron, undefined, 8);
  } else for (const s of [-1, 1]) {
    lead(p, name + '-gripper', [[x, y, z], [x + s * .037 * size, y - .05 * size, z],
      [x + s * .018 * size, y - .097 * size, z]], .013 * size, steel);
  }
}

function autodoc(p, id) {
  const nether = id === 'nl_autodoc';
  if (nether) {
    casters(p, .61, .51);
    box(p, 'robot-caster-mounting-plate', [.713, .062, .625], iron, [0, .060, .02]);
    cyl(p, 'alien-surgical-base', 'y', [0, .381, .075], .306, .562, K.steelP(0x7b8380), .257, 12);
  } else {
    box(p, 'surgical-system-floor-base', [.72, .086, .617], steel);
    box(p, 'surgical-arm-control-pedestal', [.52, .78, .46], cream, [0, .085, .16]);
    box(p, 'surgical-safety-labels', [.293, .067, .018], label('SURGICAL ARM', 0xe8dfbd, 0x787e72), [0, .372, -.083], { ppm: 128 });
  }
  const y = nether ? .62 : .831;
  screen(p, 'surgery-terminal', .307, .242, 0, y - .271, -.232, 0x6c9085);
  for (const s of [-1, 1]) {
    robotArm(p, 'surgical-manipulator', [[s * .181, y, .17], [s * .333, y + .414, .14],
      [s * .266, y + .637, -.142], [s * .09, y + .289, -.36]], nether ? steel : cream, .98, s < 0 ? 'scalpel' : 'gripper');
  }
  if (nether) robotArm(p, 'auxiliary-tool-arm', [[0, y, .295], [.015, 1.17, .237], [.289, 1.42, -.078], [.162, 1.135, -.392]], iron, .79, 'disc');
}

export const MEDICAL_FURNITURE = [
  ...family(diagnostic, 'CTscan MRI xray dental_xray electron_microscope MS NMR'),
  ...family(exam, 'IV_pole exam_chair surgical_table scan_bed autodoc_couch nl_autodoc_couch'),
  ...family(lifeSupport, 'anesthetic dialysis ventilator'),
  ...family(workSurface, 'lab_bench fume_hood', { faceWall: true }),
  ...family(instrument, 'GC HPLC centrifuge shaker sample_freezer'),
  ...family(autoclave, 'autoclave autoclave_full'),
  ...family(autodoc, 'autodoc nl_autodoc'),
].map((r) => ({ ...r, source: 'tools/cubeclysm/page/furniture-medical.js' }));
