// Cubeclysm animals, low-poly with painted textures (humanoids stay in the block style of
// humanoid.js). Real size after the CDDA volume and description, standing on the ground, the head
// towards −Z like every monster. Static models for now (no rig or clips).
import { Ray } from 'three';

import { GLASS, STEEL, V, blob, bevel, cyl, fill, flat, hull, layers, rng, shade, speckle, tube } from './item-kit.js';
import { add, poly } from './lowpoly.js';
import { mix } from './paint.js';

// --- paints -------------------------------------------------------------------------------------
const chitin = (hex) => speckle(`chitin${hex}`, hex, [shade(hex, 1.2), shade(hex, .8)], .3);

// --- shapes -------------------------------------------------------------------------------------
/** A limb through joints [hip, knee, ankle, foot] with radii; each segment a tapered tube. */
function limb(p, name, pts, radii, paint, sides = 5) {
  for (let i = 0; i + 1 < pts.length; i++) tube(p, `${name}${i}`, V(...pts[i]), V(...pts[i + 1]), radii[i], radii[i + 1], sides, paint);
  // A ball at every bend, so the segments join without a gap on the outside of the joint.
  for (let i = 0; i < pts.length; i++) blob(p, `${name}-joint${i}`, [radii[i] * 1.12, radii[i] * 1.12, radii[i] * 1.12], pts[i], paint, {}, 3, sides + 1);
}
/** A body of rings along Z: [[z, y, rx, ry], …], each ring `sides` points round its centre. */
function rings(p, name, list, paint, sides = 8) {
  const pts = [];
  for (const [z, y, rx, ry] of list) for (let k = 0; k < sides; k++) { const a = (k / sides) * 2 * Math.PI; pts.push(V(Math.cos(a) * rx, y + Math.sin(a) * ry, z)); }
  hull(p, name, pts, paint);
}

// Connected rings follow the actual silhouette, including a tucked waist or a bent joint.
// The first radius runs across X; the second runs perpendicular to the centerline.
function loft(p, name, profile, paint, sides = 8, ppm = 160) {
  const centers = profile.map(([x, y, z]) => V(x, y, z));
  const rings = centers.map((center, i) => {
    const axis = centers[Math.min(i + 1, centers.length - 1)].clone()
      .sub(centers[Math.max(0, i - 1)]).normalize();
    const across = V(1, 0, 0).addScaledVector(axis, -axis.x).normalize();
    const up = axis.clone().cross(across);
    const [, , , rx, ry] = profile[i];
    return Array.from({ length: sides }, (_, j) => {
      const a = 2 * Math.PI * j / sides;
      return center.clone().addScaledVector(across, Math.cos(a) * rx).addScaledVector(up, Math.sin(a) * ry);
    });
  });
  const faces = [];
  function face(points, side, centersAtCorners) {
    const [a, b, c, d = c] = points;
    const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    const normals = centersAtCorners
      ? points.map((point, i) => normal.clone().lerp(point.clone().sub(centersAtCorners[i]).normalize(), .48).normalize())
      : points.map(() => normal);
    faces.push({ p: points, side, normals, wm: Math.max(a.distanceTo(b), c.distanceTo(d)), hm: Math.max(b.distanceTo(c), a.distanceTo(d)) });
  }
  for (let j = 0; j < sides; j++) {
    const k = (j + 1) % sides;
    face([centers[0], rings[0][k], rings[0][j]], 'end');
    for (let i = 1; i < rings.length; i++) {
      face([rings[i - 1][j], rings[i - 1][k], rings[i][k], rings[i][j]], `${i - 1}:${j}`,
        [centers[i - 1], centers[i - 1], centers[i], centers[i]]);
    }
    face([rings.at(-1)[j], rings.at(-1)[k], centers.at(-1)], 'end');
  }
  add(p, name, faces, paint, { ppm });
  return faces;
}

const textured = (seed, color, dark, light, density = .32) =>
  speckle(seed, color, [dark, light, mix(color, dark, .43)], density);

function plumage(seed, shadow, bronze) {
  return (ctx, x, y, w, h, face) => {
    const r = rng(`${seed}:${face}`);
    const color = mix(shadow, bronze, .12 + r() * .23);
    fill(ctx, x, y, w, h, color);
    for (let i = 0; i < w * h / 7.5; i++) {
      const px = Math.floor(r() * w), py = Math.floor(r() * h);
      const tone = mix(color, r() > .27 ? bronze : shadow, .14 + r() * .35);
      fill(ctx, x + px, y + py, 1 + Math.floor(r() * 3), 1, tone);
    }
  };
}

// A shaped feather (quill to tip) with a shallow raised shaft, rounded corners and real overlaps.
function feather(p, name, from, to, width, outward, paint) {
  const a = V(...from), tip = V(...to), n = V(...outward);
  const across = tip.clone().sub(a).cross(n).normalize();
  const stations = [[0, .17], [.29, .51], [.81, .48], [1, .29]].map(([t, span]) => {
    const center = a.clone().lerp(tip, t);
    return [
      center.clone().addScaledVector(across, -width * span),
      center.clone().addScaledVector(n, Math.sin(t * Math.PI) * width * .12),
      center.clone().addScaledVector(across, width * span),
    ];
  });
  for (let i = 1; i < stations.length; i++) {
    const prev = stations[i - 1], next = stations[i];
    for (let k = 0; k < 2; k++) {
      poly(p, name, [prev[k], prev[k + 1], next[k + 1], next[k]], n, paint(i - 1, k), { ppm: 205 });
    }
    poly(p, name + '-reverse', [prev[0], prev[2], next[2], next[0]], n.clone().negate(), paint(i - 1, 0), { ppm: 115 });
  }
}

function birdFeet(p, name, scale, anchors, base) {
  const paint = textured(name + '-scales', base, shade(base, .74), shade(base, 1.21));
  const lengths = [-.57, -.12, .45, Math.PI + .25];
  anchors.forEach(([hip, hock, foot], i) => {
    const x = foot[0], z = foot[1], r = scale * .13;
    loft(p, `leg-${i}`, [
      [...hip, r * 2, r * 1.75], [...hock, r, r * .92],
      [x, scale * .48, z + .1 * scale, r * .72, r * .69],
      [x, r, z, r, r * .96],
    ], paint, 6);
    lengths.forEach((angle, j) => {
      const reach = scale * [1.05, 1.37, 1.07, .73][j];
      const dx = Math.sin(angle) * reach, dz = -Math.cos(angle) * reach;
      // Horizontal toe cross-sections meet the ground at y=0, with shorter, darker claws.
      const root = V(x, r * .84, z), joint = V(x + dx * .58, r * .59, z + dz * .58);
      const end = V(x + dx * .88, r * .48, z + dz * .88);
      tube(p, `toe-${i}-${j}-base`, root, joint, r * .81, r * .54, 4, paint);
      tube(p, `toe-${i}-${j}-tip`, joint, end, r * .55, r * .42, 4, paint);
      const tip = V(x + dx, 0, z + dz);
      hull(p, `claw-${i}-${j}`, [
        end.clone().add(V(-r * .32, 0, 0)), end.clone().add(V(r * .32, 0, 0)),
        end.clone().add(V(0, r * .45, 0)), tip,
      ], flat(shade(base, .64)));
    });
  });
}

function birdsEye(p, name, x, y, z, r, ring, iris, dir) {
  blob(p, name + '-socket', [r * .42, r * 1.11, r * 1.21], [x, y, z], flat(ring), {}, 3, 8);
  blob(p, name, [r * .28, r * .82, r * .88], [x + dir * r * .32, y, z - r * .07], flat(iris), {}, 3, 8);
  blob(p, name + '-glint', [r * .10, r * .15, r * .15], [x + dir * r * .57, y + r * .30, z - r * .24], flat(0xc7bda1), {}, 2, 6);
}

function crow(p) {
  const cowl = plumage('crow-cowl', 0x1e2024, 0x3a4351);
  const back = plumage('crow-back', 0x23272a, 0x394954);
  loft(p, 'breast-and-back', [[0,.164,-.102,.019,.028], [0,.146,-.069,.045,.058], [0,.142,-.016,.059,.062],
    [0,.142,.043,.054,.048], [0,.132,.095,.038,.026], [0,.123,.132,.020,.013]], back, 10);
  loft(p, 'neck', [[0,.155,-.057,.041,.04], [0,.177,-.088,.035,.037], [0,.205,-.105,.027,.029], [0,.217,-.117,.026,.024]], cowl, 9);
  loft(p, 'head', [[0,.216,-.088,.023,.022], [0,.225,-.109,.032,.032], [0,.226,-.133,.029,.027], [0,.217,-.155,.018,.016]], cowl, 10, 225);
  loft(p, 'upper-bill', [[0,.212,-.142,.015,.010], [0,.213,-.166,.012,.009], [0,.210,-.195,.007,.006], [0,.203,-.215,.001,.0015]], flat(0x2d2b2a), 7);
  loft(p, 'lower-bill', [[0,.201,-.145,.012,.005], [0,.199,-.178,.008,.0035], [0,.201,-.208,.002,.001]], flat(0x1b1a1a), 6);
  for (const s of [-1,1]) {
    birdsEye(p, `eye-${s}`, s * .028,.231,-.137,.0057,0x413a34,0x101216,s);
    const colors = [0x273039, 0x2a3039, 0x23272d, 0x23282d, 0x20252a];
    for (let i = 0; i < 5; i++) {
      const from = [s * (.046 - i * .0011), .166 - i * .011, -.047 + i * .017];
      const to = [s * (.037 - i * .002), .122 - i * .004, .167 - i * .010];
      feather(p, `primary-${s}-${i}`, from, to, .024, [s,.32,0], (_, facet) => flat(shade(colors[i], facet ? 1.12 : .93)));
    }
    loft(p, `wing-coverts-${s}`, [[s * .037,.153,-.066,.010,.018],[s * .047,.156,-.036,.014,.029],
      [s * .053,.147,.010,.013,.026],[s * .050,.143,.055,.007,.020],[s * .043,.131,.101,.004,.009]], cowl, 7);
  }
  for (let i = -2; i <= 2; i++) {
    feather(p, `tail-${i}`, [i*.0065,.130,.105], [i*.014,.110 - Math.abs(i)*.002,.240-Math.abs(i)*.0026],
      .023, [0,1,0], (_, side) => flat(side ? 0x2a3035 : 0x222529));
  }
  birdFeet(p, 'crow', .028, [
    [[-.024,.097,-.012],[-.026,.062,.006],[-.028,-.009]],
    [[.024,.100,.002],[.030,.065,.023],[.033,.008]],
  ], 0x403d39);
}

function turkey(p) {
  const bronze = plumage('turkey-bronze', 0x3f3028, 0x795d44);
  const slate = textured('turkey-head', 0x647e97, 0x4d657f, 0x8194a5, .42);
  const skin = textured('turkey-neck', 0x954d4f, 0x743f49, 0xac6c6b, .46);
  const caruncle = textured('turkey-wattle', 0xa84f4d, 0x883b45, 0xbd7164);
  loft(p, 'breast-and-rump', [[0,.510,-.263,.035,.08],[0,.508,-.200,.109,.149],[0,.522,-.089,.162,.177],
    [0,.530,.052,.176,.152],[0,.548,.196,.146,.117],[0,.557,.290,.084,.066],[0,.568,.332,.043,.039]], bronze, 11);
  loft(p, 'neck-base-feathers', [[0,.550,-.184,.093,.086],[0,.613,-.220,.074,.067],[0,.664,-.247,.043,.048]], bronze, 9);
  loft(p, 'bare-neck', [[0,.610,-.224,.046,.043],[0,.663,-.254,.039,.037],[0,.714,-.270,.024,.025],
    [0,.779,-.275,.023,.024],[0,.823,-.308,.026,.024]], skin, 9, 195);
  loft(p, 'head', [[0,.816,-.280,.022,.027],[0,.843,-.304,.035,.036],[0,.844,-.329,.031,.029],
    [0,.832,-.354,.019,.018]], slate, 10, 225);
  loft(p, 'beak', [[0,.826,-.349,.016,.010],[0,.827,-.367,.014,.008],[0,.817,-.393,.004,.003]], flat(0xb0a184), 7);
  loft(p, 'snood', [[0,.856,-.343,.009,.011],[0,.848,-.365,.008,.008],[.003,.829,-.374,.007,.006],
    [.007,.812,-.374,.004,.004]], caruncle, 7);
  for (const s of [-1,1]) {
    birdsEye(p, `eye-${s}`, s * .031,.851,-.330,.0088,0xa48780,0x221b17,s);
    blob(p, `cheek-skin-${s}`, [.009,.015,.021], [s*.026,.821,-.311], skin, {}, 3, 7);
  }
  loft(p, 'wattle', [[0,.811,-.307,.016,.012],[0,.777,-.307,.022,.016],
    [0,.742,-.293,.014,.014],[0,.719,-.282,.005,.006]], caruncle, 8);
  for (const [i,y,z] of [[0,.738,-.301],[1,.708,-.297],[2,.685,-.289],[3,.663,-.282]]) {
    blob(p, `caruncle-${i}`, [.013 - i*.001,.013,.011], [(i%2 ? -.008 : .009),y,z], caruncle, {}, 2, 7);
  }
  loft(p, 'beard', [[0,.545,-.244,.014,.013],[0,.503,-.266,.010,.007],[.006,.461,-.285,.006,.004],
    [.009,.432,-.275,.002,.003]], plumage('beard',0x25201c,0x3d342d), 6);
  const barred = (i, side) => (ctx,x,y,w,h) => {
    const base = side ? 0x493b34 : 0x41342d;
    fill(ctx,x,y,w,h,base);
    const bars = i === 1 ? 4 : 2;
    for (let j = 0; j < bars; j++) {
      const at = Math.floor((j + .36) * h / bars);
      fill(ctx,x,y+at,w,Math.max(1, Math.floor(h / (bars*3.5))), j % 2 ? 0x987e66 : 0xb49b7a);
    }
  };
  for (const s of [-1,1]) {
    for (let i = 0; i < 6; i++) {
      feather(p, `barred-wing-${s}-${i}`, [s*(.130+i*.005),.581-i*.023,-.141+i*.026],
        [s*(.131-i*.003),.510-i*.017,.343-i*.016], .049,[s,.27,0],barred);
    }
    // Layer bronze coverts at the shoulder over the barred flight feathers.
    for (let i = 0; i < 6; i++) {
      const z = -.144+i*.054, y = .595 + Math.sin((i+.2)*Math.PI/6)*.049;
      feather(p, `coverts-${s}-${i}`, [s*(.126 - i*.002),y,z],
        [s*(.180 - Math.abs(i-2)*.003),y-.085,z+.080], .060,[s,.42,0],
        (zone, side) => flat(shade(i%2 ? 0x75523b : 0x6e513b, zone===2 ? .83 : side ? 1.09 : .96)));
    }
  }
  // The wild turkey carries an overlapping, partly spread tail in its relaxed stance.
  for (let i = -5; i <= 5; i++) {
    const f=i/5, side=Math.abs(f);
    feather(p, `tail-feather-${i}`, [i*.014,.560,.255],
      [f*.284,.736-side*.088,.604-side*.086], .067, [0,1,-.28], (zone, side) => (ctx,x,y,w,h) => {
        fill(ctx,x,y,w,h,shade(0x634731,side ? 1.09 : .93));
        if (zone === 2) {
          fill(ctx,x,y+Math.floor(h*.51),w,Math.max(1,Math.round(h*.20)),0x312823);
          fill(ctx,x,y,w,Math.max(1,Math.round(h*.19)),0xa3855f);
        }
      });
  }
  birdFeet(p, 'turkey', .065, [
    [[-.080,.399,.015],[-.086,.217,.061],[-.091,.015]],
    [[.082,.402,.046],[.089,.222,.093],[.098,.050]],
  ], 0xa38a7d);
}

function zombieDog(p) {
  const coat = (ctx,x,y,w,h,face) => {
    const r = rng('dog-coat:' + face);
    const row = Number(face.split(':')[1]);
    // The spine and underside have distinct coat colours; short hairs follow the section.
    const base = Number.isFinite(row) ? mix(0x5c5449,0x898171, .20 + .54 * Math.abs(Math.sin(row*Math.PI/10))) : 0x6c6354;
    fill(ctx,x,y,w,h,base);
    for (let i = 0; i < w*h/6; i++) {
      const c = mix(base,r()>.58 ? 0xa69a83 : 0x453c34,.16 + r()*.36);
      fill(ctx,x+Math.floor(r()*w),y+Math.floor(r()*h),1,1+Math.floor(r()*4),c);
    }
  };
  const shank = textured('dog-shank',0x6c6256,0x544b40,0x8c8270);
  const muzzle = textured('dog-muzzle',0x514940,0x38302b,0x746556,.46);
  const wound = textured('dog-exposed-hide',0x7a443e,0x53302f,0x9d6759,.52);
  const gums = flat(0x522d30);
  const bone = flat(0xad9c81);
  const torso = loft(p,'torso', [[0,.485,-.329,.060,.087],[0,.477,-.255,.105,.141],[0,.469,-.154,.129,.153],
    [0,.469,-.046,.114,.136],[.002,.487,.088,.085,.095],[.003,.482,.190,.085,.089],[.010,.464,.283,.105,.109],
    [.012,.457,.331,.074,.076],[.011,.464,.366,.031,.044]],coat,10);
  loft(p,'neck',[[0,.481,-.252,.098,.096],[-.010,.526,-.323,.088,.102],[-.022,.560,-.400,.073,.078],
    [-.026,.592,-.467,.056,.057]],coat,10);
  loft(p,'skull',[[-.024,.603,-.398,.048,.063],[-.026,.612,-.451,.066,.066],[-.027,.605,-.497,.065,.058],
    [-.026,.579,-.533,.055,.042],[-.025,.566,-.587,.036,.026],[-.024,.557,-.638,.028,.020]],coat,10);
  loft(p,'muzzle',[[-.025,.555,-.520,.049,.023],[-.025,.550,-.568,.037,.021],[-.024,.547,-.626,.029,.018],
    [-.023,.546,-.645,.024,.015]],muzzle,9);
  loft(p,'lower-jaw',[[-.022,.538,-.460,.031,.020],[-.024,.511,-.510,.039,.022],[-.024,.488,-.565,.029,.017],
    [-.024,.490,-.618,.023,.012]],muzzle,8);
  loft(p,'mouth-interior',[[-.022,.536,-.481,.031,.019],[-.024,.509,-.531,.022,.016],
    [-.024,.500,-.591,.014,.004]],gums,7);
  blob(p,'nose',[.026,.017,.015],[-.023,.553,-.647],muzzle,{},3,8);
  for (const s of [-1,1]) {
    const x = -.025 + s*.054;
    blob(p,`eye-socket-${s}`,[.013,.017,.019],[x,.609,-.500],muzzle,{},3,8);
    blob(p,`clouded-eye-${s}`,[.006,.008,.009],[x+s*.010,.609,-.502],flat(s<0?0xb8b0a0:0x9a887c),{},3,8);
    tube(p,`upper-canine-${s}`,V(-.024+s*.031,.535,-.598),V(-.024+s*.026,.510,-.593),.006,.0018,5,bone);
    tube(p,`lower-canine-${s}`,V(-.024+s*.022,.497,-.581),V(-.024+s*.024,.513,-.583),.004,.0014,5,bone);
  }
  const ear = (name, points, lining) => {
    hull(p,name,points.map(q=>V(...q)),coat);
    poly(p,name+'-lining',lining.map(q=>V(...q)),V(0,0,-1),textured(name+'-hide',0x805d52,0x5d4340,0xa47768),{ppm:190});
  };
  ear('erect-ear',[[.008,.640,-.474],[.060,.636,-.438],[.050,.753,-.440],[.016,.719,-.447],[.026,.659,-.412]],
    [[.021,.654,-.467],[.049,.651,-.449],[.045,.728,-.445]]);
  ear('torn-ear',[[-.057,.645,-.474],[-.104,.645,-.443],[-.127,.697,-.464],[-.104,.710,-.455],[-.077,.718,-.448],[-.082,.661,-.409]],
    [[-.068,.654,-.470],[-.108,.656,-.457],[-.104,.702,-.459]]);

  // Ray-project the ragged wound and ribs onto the actual flank so there is no floating patch.
  const ray = new Ray(V(-1,0,0),V(1,0,0));
  const triangles = torso.flatMap(({p:pts})=>pts.length===3?[pts]:[[pts[0],pts[1],pts[2]],[pts[0],pts[2],pts[3]]]);
  function hide(y,z,depth) {
    ray.origin.y=y; ray.origin.z=z;
    let x = Infinity;
    const hitPoint = V(0, 0, 0);
    for (const [a, b, c] of triangles) {
      const hit = ray.intersectTriangle(a, b, c, false, hitPoint);
      if (hit) x=Math.min(x,hit.x);
    }
    if (!Number.isFinite(x)) throw new Error('Flank patch point must sit inside the torso silhouette');
    return V(x-depth,y,z);
  }
  const outline = [[.502,-.223],[.537,-.176],[.527,-.126],[.554,-.092],[.531,-.050],[.516,-.012],
    [.447,.009],[.410,-.026],[.419,-.071],[.381,-.112],[.402,-.158],[.420,-.211]];
  const center = hide(.472,-.119,.009);
  outline.forEach(([y,z],i)=>{
    const [ny,nz]=outline[(i+1)%outline.length];
    poly(p,'flank-wound',[center,hide(y,z,.007),hide(ny,nz,.007)],V(-1,0,0),wound,{ppm:205});
  });
  [-.168,-.118,-.072].forEach((z,i)=>{
    const a=hide(.515-i*.006,z,.012), b=hide(.478,z+.014,.016), c=hide(.427+i*.009,z+.024,.012);
    tube(p,'rib-upper',a,b,.0045,.0055,5,bone);
    tube(p,'rib-lower',b,c,.0056,.0032,5,bone);
  });
  for (const s of [-1,1]) {
    const f = s===1 ? .044 : -.023;
    const hind = s===1 ? .032 : -.020;
    loft(p,`foreleg-${s}`,[[s*.071,.492,-.229,.055,.065],[s*.092,.346,-.207+f*.42,.040,.038],
      [s*.096,.236,-.231+f,.026,.030],[s*.089,.076,-.246+f,.019,.022],[s*.089,.028,-.252+f,.023,.023]],shank,8);
    loft(p,`hindleg-${s}`,[[s*.066,.486,.258,.069,.071],[s*.101,.377,.231+hind*.45,.048,.055],
      [s*.092,.294,.172+hind,.033,.034],[s*.097,.151,.321+hind,.022,.023],
      [s*.090,.070,.285+hind,.016,.018],[s*.091,.029,.255+hind,.021,.019]],shank,8);
    for (const [name,x,z,scale] of [
      ['front',s*.089,-.261+f,1],['hind',s*.091,.250+hind,.91],
    ]) {
      bevel(p,`paw-${name}-${s}`,[x-.028*scale,0,z-.038*scale,x+.028*scale,.046*scale,z+.026*scale],.012,muzzle);
      for (const digit of [-1,0,1]) {
        tube(p,'claw',V(x+digit*.014*scale,.011,z-.032*scale),V(x+digit*.015*scale,.005,z-.043*scale),.0038,.001,4,muzzle);
      }
    }
  }
  loft(p,'lowered-tail',[[.010,.482,.319,.030,.037],[.008,.460,.387,.028,.029],[.024,.386,.443,.021,.023],
    [.055,.310,.491,.014,.015],[.087,.287,.528,.008,.012],[.106,.300,.562,.0025,.0035]],coat,7);
}

// --- recipes ------------------------------------------------------------------------------------
export const ANIMALS = [
  {
    id: 'mon_zombie_dog', desc: 'The deformed, animated corpse of a canine; a sinewy beast which can easily outpace its two-legged friends.  (30 L, small: a large dog, 60 cm at the shoulder; patchy grey-brown fur, raw muscle and ribs showing.)',
    build: zombieDog, batchMesh: true,
  },
  {
    id: 'mon_crow', desc: 'Sleek and glossy feathers cover this dark bird.  Its pointed bill and more streamlined body distinguish it from the larger, stouter raven.  (0.6 L, tiny: 45 cm from bill to tail, standing.)',
    build: crow, batchMesh: true,
  },
  {
    id: 'mon_turkey', desc: 'A large and colorful game bird native to the forests of North America.  Its head and beak are covered in fleshy protuberances.  (8 L, small: about 90 cm tall; bronze feathers, a bare red-and-blue head with snood and wattle.)',
    build: turkey, batchMesh: true,
  },
  {
    id: 'mon_ant_acid_small', desc: 'A dog-sized mutant brown ant with a swollen abdomen that ends with a small orifice at the tip.  Glistening liquid drips out periodically.  (30 L, small: 90 cm long.)',
    build: (p) => {
      const shell = chitin(0x6a3a1e);
      // Head with elbowed antennae and mandibles; thorax; the narrow waist; the swollen gaster.
      blob(p, 'head', [.09, .08, .1], [0, .3, -.38], shell, {}, 3, 8);
      for (const s of [-1, 1]) {
        limb(p, `antenna${s}`, [[s * .03, .33, -.42], [s * .1, .46, -.5], [s * .14, .4, -.66]], [.008, .006, .004], shell, 4);
        // Rooted inside the head, curving forward and in.
        hull(p, `mandible${s}`, [V(s * .02, .27, -.4), V(s * .06, .28, -.4), V(s * .02, .3, -.42), V(s * .015, .25, -.55), V(s * .035, .28, -.56), V(s * .055, .26, -.47)], chitin(0x3a2010));
        cyl(p, `eye${s}`, 'x', [s * .085, .33, -.4], .025, .012, 6, flat(0x0a0a0a));
      }
      rings(p, 'thorax', [[-.3, .3, .06, .06], [-.18, .32, .08, .08], [-.06, .3, .06, .07]], shell, 7);
      // The waist: a narrow stalk from inside the thorax into the gaster, with its node.
      tube(p, 'petiole', V(0, .3, -.1), V(0, .3, .1), .03, .03, 6, shell);
      blob(p, 'node', [.04, .05, .035], [0, .31, 0], shell, {}, 2, 6);
      rings(p, 'gaster', [[.04, .3, .1, .1], [.18, .3, .19, .17], [.34, .28, .17, .16], [.46, .25, .07, .07]], layers(chitin(0x7a4426), (ctx, x, y, w, h) => { for (let j = 0; j < h; j += 5) fill(ctx, x, y + j, w, 1, 0x4a2410); }), 9);
      cyl(p, 'orifice', 'z', [0, .25, .465], .02, .02, 6, flat(0x2a1a0a));
      // One hanging drop and a small puddle mark the drip without a rigid strand in the air.
      blob(p, 'drop', [.016, .022, .016], [0, .228, .47], flat(0x9ad040), GLASS, 2, 6);
      blob(p, 'puddle', [.07, .004, .06], [0, .004, .5], flat(0x8ac030), GLASS, 2, 8);
      // Six legs from the thorax, each three segments, splayed.
      for (const s of [-1, 1]) for (const [k, z, a] of [[0, -.26, -.6], [1, -.18, 0], [2, -.1, .6]]) {
        // Ant legs: short femur up to a low knee, the tibia and foot down to the ground.
        const x1 = s * .17, z1 = z + Math.sin(a) * .14, x2 = s * .27, z2 = z + Math.sin(a) * .26;
        limb(p, `leg${s}${k}`, [[s * .06, .29, z], [x1, .34, z1], [x2, .1, z2], [x2 + s * .03, .01, z2 + Math.sin(a) * .04]], [.022, .016, .012, .008], shell, 5);
      }
    },
  },
  {
    id: 'mon_blob', desc: 'A black blob of viscous goo, oozing across the ground like a glob of living oil.  (62.5 L, medium: a glossy black mound about 90 cm across, drops beside it.)',
    build: (p) => {
      const oil = speckle('oil', 0x0e0e12, [0x1a1a24, 0x24243a, 0x080808], .3);
      // A connected, asymmetric dome with a flat base. Three low tendrils reach past its rim.
      const random = rng('blob-outline');
      const rim = Array.from({ length: 13 }, (_, i) => {
        const angle = i * Math.PI * 2 / 13;
        const radius = .83 + random() * .25;
        return V(Math.cos(angle) * .51 * radius, 0, Math.sin(angle) * .42 * radius);
      });
      hull(p, 'ooze-body', [...rim,
        ...rim.map((q, i) => V(q.x * .85, .084 + Math.sin(i * .97) * .023, q.z * .74)),
        ...rim.map((q, i) => V(q.x * .46 - .036, .156 + Math.sin(i * .80 + .5) * .047, q.z * .49 + .015)),
        V(-.105,.217,.054), V(.099,.200,-.067),
      ],oil,STEEL);
      for (const [i, x, z, r] of [[0,-.436,.205,.089],[1,.389,-.179,.074],[2,-.153,-.377,.065]]) {
        hull(p,`ooze-trail-${i}`,[
          ...Array.from({ length: 8 }, (_, j) => {
            const a = j * Math.PI / 4;
            return V(x + Math.cos(a) * r, 0, z + Math.sin(a) * r * .62);
          }),
          V(x*.94,.025,z*.92), V(x*.88,.017,z*1.05),
        ],oil,STEEL);
      }
    },
  },
].map((r) => ({ ...r, ppm: 160, source: 'tools/cubeclysm/page/animals.js' }));

