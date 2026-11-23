// One-tile scenery, centred on the map tile. Fronts face −Z.
import { V, bevel, cyl, fill, flat, hull, layers, rng, speckle, steelP, stoneP, woodP } from './item-kit.js';
import { poly } from './lowpoly.js';

function notice(ctx, x, y, { left, top, width, height, accent, map = false }) {
  const px = x + left, py = y + top;
  fill(ctx, px + 1, py + 1, width, height, 0x755333);
  fill(ctx, px, py, width, height, 0xeee4cc);
  fill(ctx, px + 2, py + 3, width - 4, 2, accent);
  fill(ctx, px + Math.floor(width / 2), py + 1, 1, 1, 0x79412d);
  if (map) {
    fill(ctx, px + 2, py + 7, width - 4, height - 10, 0xb4c7a5);
    fill(ctx, px + 3, py + 11, width - 6, 1, 0xe9e1c2);
    fill(ctx, px + 6, py + 8, 1, height - 13, 0xe9e1c2);
    fill(ctx, px + 8, py + 10, 2, 2, 0xa33d31);
    fill(ctx, px + 9, py + 12, 1, 2, 0xa33d31);
  } else {
    for (let i = 7; i < height - 2; i += 3) fill(ctx, px + 2, py + i, width - 4 - (i % 4), 1, 0x817d6b);
  }
}

function shelterBoard(p) {
  const frame = woodP(0x795439);
  const cork = speckle('cork board', 0xa97e4e, [0xc39866, 0x8d603c, 0xd8ab73], .68);
  const board = layers(cork, (ctx, x, y, w, h, side) => {
    if (side !== 'front') return;
    const notices = [
      { left: .06, top: .13, width: .22, height: .53, accent: 0x9d442f },
      { left: .325, top: .08, width: .31, height: .8, accent: 0x385f6d, map: true },
      { left: .69, top: .14, width: .24, height: .51, accent: 0x385f6d },
      { left: .715, top: .69, width: .19, height: .22, accent: 0xa38143 },
    ];
    for (const card of notices) notice(ctx, x, y, {
      ...card, left: Math.round(card.left * w), top: Math.round(card.top * h),
      width: Math.round(card.width * w), height: Math.round(card.height * h),
    });
  });
  p.box('wood backing', [-.448, 1.02, .344, .448, 1.6, .405], frame);
  p.box('pinned notices', [-.409, 1.057, .325, .409, 1.564, .345], board, { ppm: 96 });
  for (const y of [1.02, 1.565]) p.box(`rail ${y}`, [-.448, y, .304, .448, y + .041, .384], frame);
  for (const x of [-.448, .407]) p.box(`stile ${x}`, [x, 1.053, .304, x + .041, 1.568, .384], frame);
  for (const x of [-.29, .29]) {
    p.box(`upright ${x}`, [x - .028, 0, .375, x + .028, 1.55, .438], frame);
    p.box(`foot ${x}`, [x - .048, 0, .145, x + .048, .043, .465], frame);
    p.box(`bracket ${x}`, [x - .031, 1.12, .438, x + .031, 1.47, .446], steelP(0x5e574a));
  }
}

const LETTERS = {
  S: ['111', '100', '111', '001', '111'],
  T: ['111', '010', '010', '010', '010'],
  O: ['111', '101', '101', '101', '111'],
  P: ['110', '101', '110', '100', '100'],
};

function stopSign(p) {
  const post = steelP(0x7e8581);
  p.box('galvanized U-channel', [-.03, 0, .025, .03, 2.14, .074], post);
  for (const x of [-.03, .022]) p.box(`flange ${x}`, [x, 0, .065, x + .008, 2.14, .089], post);
  for (let k = 0; k < 8; k++) {
    const y = .54 + k * .13;
    p.box(`mounting hole ${k}`, [-.006, y, .024, .006, y + .015, .026], flat(0x474c4b));
  }

  const cy = 2.27, front = -.026, half = .452;
  const outline = [[-.188, -half], [.188, -half], [half, -.188], [half, .188],
    [.188, half], [-.188, half], [-half, .188], [-half, -.188]];
  hull(p, 'octagonal sign blank', [front + .008, .026].flatMap((z) => outline.map(([x, y]) => V(x, cy + y, z))), steelP(0x8b8e85));

  // Paint the border and legend on one surface, with the corners cut out.
  const paint = (ctx, x, y, w, h) => {
    const edge = 3;
    for (let row = 0; row < h; row++) {
      const slope = Math.max(0, Math.round(w * .292) - row, Math.round(w * .292) - (h - 1 - row));
      fill(ctx, x + slope, y + row, w - 2 * slope, 1, 0xe8e3d4);
      if (row >= edge && row < h - edge) {
        const inset = Math.max(edge, slope + edge + (slope > 0 ? 1 : 0));
        fill(ctx, x + inset, y + row, w - 2 * inset, 1, 0xad332d);
      }
    }
    const pixel = Math.floor(w * .049);
    const left = Math.round((w - 15 * pixel) / 2), top = Math.round((h - 5 * pixel) / 2);
    Object.values(LETTERS).forEach((rows, letter) => rows.forEach((row, j) => {
      [...row].forEach((digit, i) => {
        if (digit === '1') fill(ctx, x + left + (letter * 4 + i) * pixel, y + top + j * pixel, pixel, pixel, 0xe8e3d4);
      });
    }));
  };
  poly(p, 'reflective STOP face', [
    V(half, cy - half, front), V(-half, cy - half, front),
    V(-half, cy + half, front), V(half, cy + half, front),
  ], V(0, 0, -1), paint, { cutout: true, ppm: 144 });
  for (const y of [cy - .27, cy + .27]) cyl(p, `bolt ${y}`, 'z', [0, y, front - .0025], .014, .006, 6, steelP(0xb8b7aa));
}

function boulder(p, volcanic) {
  const r = rng('shelter field boulder');
  const points = [];
  for (const [height, rx, rz, cx, cz] of [
    [0, .37, .34, .01, 0], [.37, .53, .425, -.008, .021], [1.1, .5, .421, -.012, -.015],
    [1.62, .455, .39, .01, -.027], [1.91, .35, .31, .049, -.014], [2.105, .2, .188, -.047, .025],
  ]) {
    for (let k = 0; k < 7; k++) {
      const a = (k + .21) * Math.PI * 2 / 7;
      const scale = .87 + r() * .19;
      points.push(V(cx + Math.cos(a) * rx * scale, height + (height > 0 ? r() * .088 : 0), cz + Math.sin(a) * rz * scale));
    }
  }
  hull(p, 'weathered rock', points, layers(stoneP(volcanic ? 0x5d6263 : 0x81827b), (ctx, x, y, w, h, side) => {
    const random = rng('mineral ' + side);
    if (volcanic || random() > .67) {
      for (let j = 1; j < h - 1; j++) {
        const i = Math.round(w * (.22 + .45 * j / h));
        fill(ctx, x + i, y + j, 1 + Math.floor(random() * 2), 1, volcanic ? 0xa79778 : 0xaaa99a);
      }
    }
  }));
}

function locker(p) {
  const casing = steelP(0x535f5e), door = steelP(0x71827d), edge = flat(0x3d4a47);
  bevel(p, 'pressed steel carcass', [-.466, .052, -.265, .466, 1.827, .275], .012, casing);
  bevel(p, 'recessed base', [-.434, 0, -.23, .434, .078, .245], .009, edge);
  p.box('recessed door frame', [-.449, .095, -.282, .449, 1.779, -.259], edge);
  for (const [i, x] of [[0, -.441], [1, .008]]) {
    const paint = layers(door, (ctx, px, py, w, h, side) => {
      if (side !== 'front') return;
      for (let k = 0; k < 5; k++) {
        const j = Math.round(h * .093) + k * 3;
        fill(ctx, px + 5, py + j, w - 10, 1, 0x3d4947);
        fill(ctx, px + 5, py + j + 1, w - 10, 1, 0x81918a);
      }
    });
    bevel(p, `door ${i}`, [x, .102, -.305, x + .432, 1.768, -.279], .006, door);
    p.box(`louvred panel ${i}`, [x + .033, .139, -.308, x + .399, 1.735, -.303], paint);
    p.box(`label frame ${i}`, [x + .136, 1.43, -.311, x + .296, 1.495, -.306], casing);
    p.box(`label ${i}`, [x + .151, 1.443, -.316, x + .281, 1.482, -.310], flat(i ? 0xd1c7ae : 0xbcb6a2));
    const hx = x + .352;
    p.box(`handle recess ${i}`, [hx - .014, .84, -.315, hx + .038, 1.08, -.307], edge);
    for (const y of [.88, 1.024]) p.box(`handle mount ${i} ${y}`, [hx, y, -.347, hx + .022, y + .024, -.311], casing);
    bevel(p, `pull ${i}`, [hx, .882, -.351, hx + .022, 1.048, -.334], .004, steelP(0xa4aaa0));
    for (const y of [.28, 1.61]) p.box(`hinge ${i} ${y}`, [x - .005, y, -.327, x + .024, y + .095, -.303], casing);
  }
}

export const SHELTER_PROPS = [
  { id: 'f_bulletin_evac', desc: 'A freestanding wooden cork board with emergency notices and a refugee centre map.', faceWall: true, build: shelterBoard },
  { id: 'f_sign_stop', desc: 'An octagonal red STOP sign on a galvanised metal pole.', build: stopSign },
  { id: 'f_boulder_large', desc: 'A rounded, weathered boulder taller than a person.', build: (p) => boulder(p, false) },
  { id: 'f_boulder_large_volc', desc: 'A tall dark boulder with mineral streaks.', build: (p) => boulder(p, true) },
  { id: 'f_locker', desc: 'A tall olive-grey steel locker with two louvred doors, pull handles and nameplates.', faceWall: true, build: locker },
].map((r) => ({ ...r, dir: 'furniture', source: 'tools/cubeclysm/page/shelter-props.js' }));
