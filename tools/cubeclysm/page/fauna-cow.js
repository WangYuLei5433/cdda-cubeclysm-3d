import { fill, rng, shade } from './paint.js';
import { blob, chain, eye, flat, fur, sides, skin } from './fauna-kit.js';

// The coat runs across the whole barrel. A few large, uneven patches carry the Holstein
// pattern at tile distance. Their edges continue across the rings instead of restarting per face.
const patches = [
  // [fraction round the barrel, fraction along the spine, width, length, phase]
  [.035, .23, .138, .244, .2],
  [.85, .52, .093, .139, 1.5],
  [.093, .80, .114, .204, 2.2],
  [.519, .73, .135, .235, 3.1],
  [.421, .22, .095, .156, 1.1],
  [.264, .53, .093, .210, 2.7],
];

function coat(ctx, x, y, w, h, face) {
  const [row, facet] = face.split(':').map(Number);
  const random = rng('cow-coat-' + face);
  fill(ctx, x, y, w, h, 0xe9e4d9);
  if (face === 'cap') return;
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) {
    const u = (facet + (dx + .5) / w) / 12;
    // U points round a section of the body, while V points toward the rump.
    const v = (row + 1 - (dy + .5) / h) / 6;
    const black = patches.some(([center, length, radius, span, phase]) => {
      const angle = ((u - center + 1.5) % 1) - .5;
      const du = angle / radius, dv = (v - length) / span;
      const a = Math.atan2(dv, du);
      return du * du + dv * dv < 1 + .24 * Math.cos(a * 3 + phase) + .13 * Math.sin(a * 5 - phase);
    });
    if (black) fill(ctx, x + dx, y + dy, 1, 1, shade(0x3b3535, .95 + random() * .12));
    else if (random() < .14) fill(ctx, x + dx, y + dy, 1, 1, shade(0xe9e4d9, .95 + random() * .095));
  }
}

export function dairyCow(p) {
  const white = fur(0xe9e4d9, 'cow-cream');
  const dark = fur(0x3b3535, 'cow-charcoal');
  const hoof = fur(0x564c49, 'cow-hoof');
  const muzzle = fur(0xc98c83, 'cow-muzzle');
  const pink = fur(0xdba59a, 'cow-ear');
  const udder = fur(0xcf9a8e, 'cow-udder');

  skin(p, 'deep-dairy-barrel', [
    [0, 1.02, -.94, .27, .30],
    [0, 1.09, -.73, .40, .40],
    [0, 1.06, -.43, .46, .46],
    [0, 1.035, .03, .52, .49],
    [0, 1.065, .53, .48, .43],
    [0, 1.10, .79, .39, .34],
    [0, 1.095, .94, .23, .24],
  ], coat, 12);
  skin(p, 'relaxed-neck', [
    [0, 1.03, -.56, .35, .36],
    [0, 1.085, -.88, .276, .335],
    [0, 1.16, -1.13, .222, .234],
    [0, 1.205, -1.32, .180, .175],
  ], white, 10);
  skin(p, 'soft-jawline', [
    [0, 1.11, -1.62, .14, .075],
    [0, 1.10, -1.47, .169, .106],
    [0, 1.08, -1.27, .188, .123],
  ], white, 10);
  skin(p, 'forehead-and-cheeks', [
    [0, 1.15, -1.67, .174, .099],
    [0, 1.18, -1.55, .188, .127],
    [0, 1.225, -1.43, .23, .19],
    [0, 1.24, -1.22, .208, .183],
    [0, 1.21, -1.10, .167, .13],
  ], white, 12);
  skin(p, 'rounded-pink-muzzle', [
    [0, 1.145, -1.815, .137, .060],
    [0, 1.15, -1.782, .194, .097],
    [0, 1.155, -1.696, .208, .104],
    [0, 1.17, -1.615, .165, .092],
  ], muzzle, 12);
  chain(p, 'resting-mouth', [[-.156,1.108,-1.762],[-.087,1.09,-1.808],[0,1.083,-1.821],
    [.087,1.09,-1.808],[.156,1.108,-1.762]], [.004,.009,.009,.009,.004], flat(0x9c625b), 5);

  blob(p, 'udder', [.261,.193,.294], [0,.645,.525], udder, {}, 4, 10);
  for (const s of sides) {
    for (const z of [.43,.68]) {
      chain(p, 'teat-'+s+'-'+z, [[s*.116,.539,z],[s*.126,.459,z+.004],[s*.122,.409,z+.009]], [.041,.034,.024], udder, 7);
    }

    const ear = s === -1 ? dark : white;
    const lift = s === -1 ? .055 : .012;
    const earShape = [[s*.16,1.31,-1.255,.074,.079],[s*.253,1.39+lift,-1.22,.122,.070],
      [s*.394,1.40+lift,-1.174,.124,.055],[s*.50,1.36+lift,-1.161,.077,.040],[s*.54,1.345+lift,-1.169,.020,.018]];
    skin(p, 'outspread-ear'+s, earShape, ear, 9, true);
    skin(p, 'ear-lining'+s, [
      [s*.263,1.394+lift,-1.302,.054,.029],[s*.375,1.396+lift,-1.265,.083,.037],
      [s*.47,1.369+lift,-1.231,.040,.021],[s*.506,1.357+lift,-1.201,.013,.011],
    ], pink, 8, true);

    if (s < 0) {
      blob(p, 'soft-eye-patch', [.049,.096,.144], [-.184,1.283,-1.405], dark, {}, 3, 10);
    }
    eye(p, 'brown-eye'+s, [s*(s<0?.23:.212),1.286,-1.438], .044, 0x674f40);
    blob(p, 'small-nostril'+s, [.037,.017,.010], [s*.108,1.179,-1.808], flat(0x93605b), {}, 3, 8);

    for (const rear of [false,true]) {
      const z = (rear?.67:-.66) + s*.045;
      const x = s*(rear?.306:.266);
      skin(p, (rear?'hind-leg':'front-leg')+s, [
        [x*(rear?.87:1),rear?1.16:1.06,z,.161,rear?.172:.166],
        [x*1.04,.76,z+(rear?-.139:.004),rear?.130:.114,.147],
        [x*1.03,.50,z+(rear?.080:.022),.106,.101],
        [x*1.02,.25,z+(rear?.045:.010),.073,.075],
        [x*1.02,.108,z+.011,.074,.076],
      ], (s>0)===rear ? white : dark, 9);
      for (const half of sides) {
        blob(p, 'cloven-hoof-'+s+'-'+rear+'-'+half, [.044,.067,.107],
          [x*1.02+half*.044,.067,z-.030], hoof, {}, 3, 8);
      }
    }
  }

  skin(p, 'loose-tail', [
    [0,1.204,.87,.056,.052],[.035,1.078,.996,.049,.041],[.091,.827,1.040,.039,.040],
    [.144,.573,1.094,.032,.033],[.222,.410,1.128,.025,.026],
  ], white, 8);
  skin(p, 'tail-tuft', [
    [.175,.501,1.101,.033,.037],[.216,.407,1.123,.052,.049],
    [.264,.301,1.155,.045,.049],[.313,.251,1.197,.016,.020],
  ], dark, 8);
}
