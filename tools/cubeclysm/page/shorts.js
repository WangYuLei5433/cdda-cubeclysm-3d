import { V, bevel, clothP, cyl, denimP, flat, knitP, plasticP, shade, speckle, steelP } from './item-kit.js';
import { path } from './common-loot-kit.js';
import { add, poly } from './lowpoly.js';

const cuts = {
  casual: { width: .398, length: .395, thickness: .026, rise: .48, legWidth: .94, gap: .14 },
  cargo: { width: .421, length: .465, thickness: .029, rise: .46, legWidth: .99, gap: .15 },
  basketball: { width: .415, length: .485, thickness: .024, rise: .435, legWidth: 1.06, gap: .15 },
  compression: { width: .347, length: .347, thickness: .016, rise: .49, legWidth: .82, gap: .15 },
  boxer: { width: .345, length: .285, thickness: .019, rise: .51, legWidth: 1.01, gap: .13 },
  boy: { width: .325, length: .214, thickness: .015, rise: .60, legWidth: .84, gap: .16 },
  hot: { width: .365, length: .250, thickness: .022, rise: .61, legWidth: .94, gap: .18 },
  swimming: { width: .373, length: .345, thickness: .021, rise: .52, legWidth: 1.03, gap: .17 },
  denim: { width: .383, length: .370, thickness: .029, rise: .48, legWidth: .94, gap: .15 },
};

const boxer = { cut: 'boxer', waistColor: 0xc1c9cb, fly: true };
export const shortsStyles = {
  shorts: { cut: 'casual', color: 0xb29a70, closure: 'belt' },
  shorts_cargo: { cut: 'cargo', color: 0x858670, closure: 'belt', cargo: true },
  b_shorts: { cut: 'basketball', color: 0x268f9f, closure: 'drawstring', stripe: 0xe7e2d2, hem: 0x28747f },
  under_armor_shorts: { cut: 'compression', color: 0x383d45, fabric: 'stretch', hem: 0x2b3037, stitching: 0x777c82 },
  boxer_shorts: { ...boxer, color: 0x6e8698 },
  xlboxer_shorts: { ...boxer, color: 0x556b80, scale: 1.14 },
  xsboxer_shorts: { ...boxer, color: 0x9d896f, waistColor: 0xd7cab0, scale: .86 },
  boy_shorts: { cut: 'boy', color: 0x9a929f, waistColor: 0x595366, hem: 0x63596b },
  trunks: { cut: 'swimming', color: 0x3e6597, closure: 'drawstring', stripe: 0x76a8bd, hem: 0x355780 },
  hot_pants: { cut: 'hot', color: 0xc16069, closure: 'belt' },
  hot_pants_leather: { cut: 'hot', color: 0x614a3e, fabric: 'leather', closure: 'belt', stitching: 0x957459 },
  hot_pants_fur: { cut: 'hot', color: 0x886747, fabric: 'fur', waistColor: 0x694e35, hem: 0xae916a, cuff: .13 },
  shorts_denim: { cut: 'denim', color: 0x587d9d, fabric: 'denim', closure: 'belt', hem: 0x8c9fac, cuff: .115, stitching: 0xac895d },
  postman_shorts: { cut: 'casual', color: 0x364c69, closure: 'belt', stitching: 0x506887 },
  santa_shorts: { cut: 'casual', color: 0xa94042, waistColor: 0x8c3137, hem: 0xe8dfc9, cuff: .15 },
};

function bodyPaint(color, fabric) {
  switch (fabric) {
    case 'denim': return denimP(color);
    case 'leather': return speckle('leather grain', color, [shade(color, .91), shade(color, 1.09)], .24);
    case 'fur': return speckle('fur fibers', color, [shade(color, .73), shade(color, 1.20)], .50);
    case 'stretch': return plasticP(color);
    default: return clothP(color);
  }
}

// Each half starts at the center of the waist and separates below the crotch.
// Thin front and back panels leave real openings along the waist and cuffs.
export function drawShorts(p, id) {
  const style = shortsStyles[id];
  const { width, length, thickness, rise, legWidth, gap } = cuts[style.cut];
  const { color, fabric, closure, scale = 1, cuff = .055 } = style;
  const hip = width * scale / 2;
  const depth = length * scale;
  const loft = thickness * scale;
  const waist = closure === 'belt' ? .86 : .82;
  const across = [0, .24, .52, .78, 1];
  const folds = [.65, .95, 1, .82, .52];
  const sections = [
    { t: 0, inner: 0, outer: waist, loft: .67 },
    { t: .105, inner: 0, outer: waist + .018, loft: .82 },
    { t: .255, inner: 0, outer: .96, loft: 1 },
    { t: rise, inner: 0, outer: 1, loft: .77 },
    { t: rise + (1 - rise) * .47, inner: gap * .57, outer: (1 + legWidth) * .5, loft: .94 },
    { t: 1 - cuff, inner: gap * .93, outer: legWidth, loft: .72 },
    { t: 1, inner: gap, outer: legWidth * .986, loft: .65 },
  ];
  const cloth = bodyPaint(color, fabric);
  const hemColor = style.hem ?? shade(color, .86);
  const trim = {
    cloth,
    reverse: bodyPaint(shade(color, .89), fabric),
    seam: bodyPaint(shade(color, .82), fabric),
    waist: (closure === 'belt' ? bodyPaint : knitP)(style.waistColor ?? shade(color, .80), fabric),
    hem: bodyPaint(hemColor, fabric),
    lining: flat(id === 'trunks' ? 0xa9b8bc : shade(color, .52)),
  };
  const opts = { ppm: 315 };
  const faces = [];

  function panelPoint(side, j, i, front) {
    const { t, inner, outer, loft: fullness } = sections[j];
    const u = across[i];
    const leg = Math.max(0, (t - rise) / (1 - rise));
    const curve = leg * (.027 * (u - .58) + side * .012);
    const hemRipple = j >= sections.length - 2 ? .0025 * Math.sin((i + side * .32) * 2.1) : 0;
    const y = front ? loft * fullness * folds[i] + hemRipple : i === 2 && j === 2 ? 0 : .0018 * scale;
    return V(side * hip * (inner + u * (outer - inner)), y, depth * (t + curve - .5));
  }

  function face(points, outward, finish) {
    const normal = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));
    if (normal.dot(outward) < 0) points.reverse();
    faces.push({
      p: points, side: finish,
      wm: points[0].distanceTo(points[1]),
      hm: points[1].distanceTo(points[2]),
    });
  }

  for (const side of [-1, 1]) {
    const upper = sections.map((_, j) => across.map((_, i) => panelPoint(side, j, i, true)));
    const lower = sections.map((_, j) => across.map((_, i) => panelPoint(side, j, i, false)));
    const last = sections.length - 1;
    for (let j = 0; j < last; j++) {
      const finish = j === 0 ? 'waist' : j === last - 1 ? 'hem' : 'cloth';
      for (let i = 0; i < across.length - 1; i++) {
        face([upper[j][i], upper[j][i+1], upper[j+1][i+1], upper[j+1][i]], V(0,1,0), finish);
        face([lower[j][i], lower[j][i+1], lower[j+1][i+1], lower[j+1][i]], V(0,-1,0), finish === 'cloth' ? 'reverse' : finish);
      }
      const edge = across.length - 1;
      face([lower[j][edge], lower[j+1][edge], upper[j+1][edge], upper[j][edge]], V(side,0,0), finish === 'cloth' ? 'seam' : finish);
      if (j >= 3) face([lower[j][0], lower[j+1][0], upper[j+1][0], upper[j][0]], V(-side,0,0), finish === 'cloth' ? 'seam' : finish);
    }

    for (const [j, direction, finish] of [[0,-1,'waist'], [last,1,'hem']]) {
      const inset = direction * -.026 * depth;
      for (let i = 0; i < across.length - 1; i++) {
        const a = upper[j][i], b = upper[j][i+1], c = lower[j][i+1], d = lower[j][i];
        const aIn = a.clone().lerp(d, .18).add(V(0,0,inset));
        const bIn = b.clone().lerp(c, .18).add(V(0,0,inset));
        const cIn = c.clone().lerp(b, .15).add(V(0,0,inset));
        const dIn = d.clone().lerp(a, .15).add(V(0,0,inset));
        const opening = V(0,0,direction);
        face([a,b,bIn,aIn], opening, finish);
        face([d,c,cIn,dIn], opening, finish);
        face([aIn,bIn,cIn,dIn], opening, 'lining');
      }
    }
  }
  add(p, 'sewn shorts with open waist and cuffs', faces, (ctx,x,y,w,h,finish) => trim[finish](ctx,x,y,w,h), opts);

  function onFabric(side, t, u, lift = .0012) {
    const next = sections.findIndex(({ t: station }, i) => i > 0 && station >= t);
    const acrossNext = across.findIndex((station, i) => i > 0 && station >= u);
    const alongFraction = (t - sections[next-1].t) / (sections[next].t - sections[next-1].t);
    const acrossFraction = (u - across[acrossNext-1]) / (across[acrossNext] - across[acrossNext-1]);
    const rowPoint = (j) => panelPoint(side,j,acrossNext-1,true).lerp(panelPoint(side,j,acrossNext,true),acrossFraction);
    return rowPoint(next-1).lerp(rowPoint(next),alongFraction).add(V(0,lift,0));
  }

  const stitch = style.stitching ?? shade(color, .64);
  function sewnLine(name, side, coords, tone, radius = .0012, lift = .0012) {
    const positions = coords.map(([t,u]) => onFabric(side,t,u,lift).toArray());
    path(p,name,positions,radius*scale,flat(tone),opts);
  }

  if (style.stripe) {
    const stations = sections.slice(1).map(({ t }) => t);
    for (const side of [-1,1]) {
      for (let j = 1; j < stations.length; j++) {
        const a = stations[j-1], b = stations[j];
        const width = id === 'trunks' ? .14 : .09;
        const points = [onFabric(side,a,.93-width),onFabric(side,a,.93),
          onFabric(side,b,.93),onFabric(side,b,.93-width)];
        poly(p,'contrast side stripe',points,V(0,1,0),flat(style.stripe),opts);
      }
    }
  }

  if (closure === 'belt') {
    for (const side of [-1,1]) {
      for (const u of [.22,.73]) {
        sewnLine('belt loop',side,[[.014,u],[.062,u],[.127,u]],shade(color,.91),.0034,.0025);
      }
      sewnLine('front pocket opening',side,[[.119,.75],[.178,.63],[.24,.60],[.32,.71]],shade(color,.57),.0021);
      sewnLine('pocket topstitch',side,[[.12,.79],[.18,.67],[.24,.64],[.322,.75]],stitch,.0011);
    }
    const button = onFabric(1,.062,.027);
    cyl(p,'waist button','y',button.toArray(),.0051*scale,.0028*scale,8,steelP(fabric === 'denim' ? 0xb28b53 : 0x8e765a),opts);
  }
  if (closure === 'belt' || style.fly) {
    sewnLine('curved fly seam',1,[[.11,.035],[.21,.070],[.32,.062],[.41,.008]],stitch);
  }

  if (closure === 'drawstring') {
    const cord = id === 'trunks' ? 0xd9d2bc : 0xece4d2;
    for (const side of [-1,1]) {
      sewnLine('drawstring loop',side,[[.071,.019],[.047,.102],[.082,.155],[.115,.065],[.081,.019]],cord,.0021,.0025);
      sewnLine('drawstring end',side,[[.081,.019],[.137,.06],[.207 + side*.017,.104]],cord,.0021,.0027);
    }
  }

  if (style.cargo) {
    for (const side of [-1,1]) {
      const { x,y,z } = onFabric(side,.674,.70);
      const pocket = clothP(shade(color,.83));
      bevel(p,'gusseted cargo pocket',[x-.041,y-.01,z-.037,x+.041,y+.009,z+.039],.004,pocket,opts);
      bevel(p,'cargo pocket flap',[x-.045,y+.006,z-.043,x+.045,y+.013,z-.017],.0025,clothP(shade(color,.94)),opts);
      cyl(p,'cargo pocket snap','y',[x,y+.013,z-.021],.004,.002,8,flat(0x555344),opts);
    }
  }

  if (style.cut === 'compression') {
    for (const side of [-1,1]) {
      sewnLine('flatlock compression seam',side,[[.11,.88],[.255,.86],[rise,.83],[.73,.79],[.945,.81]],stitch);
    }
  }
}
