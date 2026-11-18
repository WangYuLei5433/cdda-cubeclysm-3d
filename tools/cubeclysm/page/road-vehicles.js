// Original road vehicles for the game catalog. Closed exterior meshes use shared body sections;
// the engine's mounts, doors, obstacles and cargo still come from the existing vehicle layout.
import { flat, speckle } from './props.js';
import { shade } from './paint.js';
import { V, bevel, cyl, hull, poly } from './lowpoly.js';

const SOURCE = 'tools/cubeclysm/page/road-vehicles.js';
const TRIM = flat(0x282a2a);
const LINER = flat(0x232322);
const STEEL = flat(0x93928a);
const RUBBER = speckle('road-tyre', 0x262726, [0x2d2e2b, 0x202120], .3);
const GLASS = flat(0x577173);
const GLASS_OPTIONS = { glass: true };
const lerp = (a, b, t) => a + (b - a) * t;
// The cabin is open inside (floor, inner walls, bulkheads), so the interior parts placed by the
// vehicle's CDDA layout show through the glass: inner walls stand at IN × the body's half width.
const IN = .86;
const CARPET = speckle('road-carpet', 0x3a3936, [0x403f3b, 0x34332f], .4);
/** The cabin floor's height for a spec (the interior parts stand on it). */
export const floorOf = (s) => +((s.tire ?? .32) * .73 + .06).toFixed(3);

function carShell(p, s, coat) {
  const length = s.length, width = s.width / 2;
  const radius = s.tire ?? .32, sill = radius * .73, belt = s.belt;
  const z = (f) => (f - .5) * length;
  const wz = (s.axles ?? [.20, .79]).map(z);
  const arch = radius * 1.11;
  const zs = new Set([0, .048, .14, s.cabin[0], .42, .63, .86, s.cabin[3], .956, 1].map(z));
  // Add samples on tyre circles so the fenders wrap rather than slicing through the tyre tread.
  for (const axle of wz) for (let i = -5; i <= 5; i++) {
    const t = axle + i / 5 * arch;
    if (t > z(0) && t < z(1)) zs.add(t);
  }
  const span = [...zs].sort((a, b) => a - b);
  const section = (d) => {
    const f = d / length + .5;
    const taper = f < .24 ? lerp(s.nose ?? .78, 1, Math.min(1, f / .24) ** .69)
      : f > .83 ? lerp(1, s.tail ?? .87, (f - .83) / .17) : 1;
    const drop = f < s.cabin[0]
      ? lerp(s.noseDrop ?? .13, 0, f / s.cabin[0])
      : f > s.cabin[3] ? lerp(0, s.tailDrop ?? .075, (f - s.cabin[3]) / (1 - s.cabin[3])) : 0;
    return { w: width * taper, y: belt - drop };
  };
  const archHeight = (d) => {
    const nearest = Math.min(...wz.map((axle) => Math.abs(d - axle)));
    return nearest > arch ? sill : Math.max(sill, radius + Math.sqrt(arch ** 2 - nearest ** 2));
  };
  const sideAt = (side, d) => {
    const { w, y } = section(d);
    const floor = Math.min(y - .075, archHeight(d));
    return [
      V(w * side * .83, floor, d),
      V(w * side, Math.min(y - .057, floor + .10), d),
      V(w * side * .964, y - .049, d),
      V(w * side * .922, y, d),
    ];
  };
  const up = V(0, 1, 0);
  const floorY = floorOf(s), inCabin = (d) => d > z(s.cabin[0]) && d < z(s.cabin[3]);
  function bodyPanel(name, vs, normal, paint = coat) { poly(p, name, vs, normal, paint, { ppm: 35 }); }
  for (let i = 1; i < span.length; i++) {
    const a = span[i - 1], b = span[i], d = (a + b) / 2;
    const ends = [-1, 1].map((side) => [sideAt(side, a), sideAt(side, b)]);
    for (const [j, [start, end]] of ends.entries()) {
      const side = j === 0 ? -1 : 1;
      for (let k = 0; k < 3; k++) bodyPanel('fender', [start[k], end[k], end[k + 1], start[k + 1]], V(side, 0, 0));
      // Wheel wells and underside are lined, including on the hidden side of the fender.
      bodyPanel('wheel-well', [start[0], end[0], V(end[0].x * .62, sill, b), V(start[0].x * .62, sill, a)], V(0, -1, 0), LINER);
    }
    const [[leftA, leftB], [rightA, rightB]] = ends;
    const isBed = s.bed && d > z(s.cabin[3]);
    const deck = [leftA[3], leftB[3], rightB[3], rightA[3]];
    if (isBed) {
      bodyPanel('bed-deck', deck.map((pt) => V(pt.x * .89, belt - .255, pt.z)), up, LINER);
    } else if (d < z(s.cabin[0])) {
      const ridge = (pt) => V(pt.x * .63, pt.y + Math.sin(Math.PI * (.5 + pt.z / length) / s.cabin[0]) * .035, pt.z);
      const [noseLeft, rearLeft, rearRight, noseRight] = deck;
      const [ra, rb, rc, rd] = deck.map(ridge);
      bodyPanel('hood-skin', [ra, rb, rc, rd], up);
      bodyPanel('hood-crease', [noseLeft, rearLeft, rb, ra], up);
      bodyPanel('hood-crease', [rd, rc, rearRight, noseRight], up);
    } else if (inCabin(d)) {
      // Open cabin: a sill along each side, the inner wall down to the floor, the floor.
      const inner = (pt, y = pt.y) => V(pt.x * IN, y, pt.z);
      for (const [j, [start, end]] of ends.entries()) {
        bodyPanel('cabin-sill', [start[3], end[3], inner(end[3]), inner(start[3])], up);
        bodyPanel('cabin-wall', [inner(start[3]), inner(end[3]), inner(end[3], floorY), inner(start[3], floorY)], V(j === 0 ? 1 : -1, 0, 0), LINER);
      }
      bodyPanel('cabin-floor', [inner(leftA[3], floorY), inner(leftB[3], floorY), inner(rightB[3], floorY), inner(rightA[3], floorY)], up, CARPET);
    } else {
      bodyPanel('body-deck', deck, up);
    }
    if (isBed) for (const [j, [start, end]] of ends.entries()) {
      bodyPanel('bed-inner', [start[3], end[3], V(end[3].x * .89, belt - .255, b), V(start[3].x * .89, belt - .255, a)], V(j === 0 ? 1 : -1, 0, 0));
    }
    bodyPanel('underbody', [V(leftA[0].x * .62, sill, a), V(rightA[0].x * .62, sill, a), V(rightB[0].x * .62, sill, b), V(leftB[0].x * .62, sill, b)], V(0, -1, 0), LINER);
  }
  // Cabin bulkheads (front: the firewall under the dash; rear: behind the load space) and the
  // wheel wells where an axle passes under the open cabin.
  for (const [f, dir] of [[s.cabin[0], 1], [s.cabin[3], -1]]) {
    const d = z(f), { w, y } = section(d);
    bodyPanel('cabin-bulkhead', [V(-w * .922 * IN, floorY, d), V(w * .922 * IN, floorY, d), V(w * .922 * IN, y, d), V(-w * .922 * IN, y, d)], V(0, 0, dir), LINER);
  }
  for (const axle of wz) if (inCabin(axle)) for (const side of [-1, 1]) {
    const w = section(axle).w * .922 * IN, x0 = side * w, x1 = side * (w - (s.tireWidth ?? .21) - .08);
    bevel(p, 'wheel-hump', [Math.min(x0, x1), floorY - .01, axle - arch, Math.max(x0, x1), radius * 2 + .04, axle + arch], .03, LINER);
  }
  if (s.bed) for (const f of [s.cabin[3], 1]) {
    const d = z(f);
    const a = sideAt(-1, d)[3], b = sideAt(1, d)[3];
    bodyPanel('bed-end-wall', [a, b, V(b.x * .89, belt - .255, d), V(a.x * .89, belt - .255, d)], V(0, 0, f === 1 ? -1 : 1));
  }
  for (const f of [0, 1]) {
    const d = z(f), dir = f ? 1 : -1;
    const [left, right] = [-1, 1].map((side) => sideAt(side, d));
    for (let k = 0; k < 3; k++) bodyPanel(f ? 'tail-panel' : 'nose-panel', [left[k], right[k], right[k + 1], left[k + 1]], V(0, 0, dir));
    const { w, y } = section(d);
    const bumperY = sill + .13;
    const bumperW = w * .93;
    const loZ = d + (f ? -.056 : -.047), hiZ = d + (f ? .047 : .056);
    bevel(p, 'bumper', [-bumperW, bumperY - .065, loZ, bumperW, bumperY + .044, hiZ], .024, s.chrome ? STEEL : TRIM);
    const lampY = y - .13;
    const outside = d + dir * .025;
    const depth = [Math.min(outside, d - dir * .012), Math.max(outside, d - dir * .012)];
    for (const side of [-1, 1]) {
      const x = side * w * .70, half = w * .202;
      bevel(p, 'lamp-housing', [x - half, lampY - .054, depth[0], x + half, lampY + .049, depth[1]], .014, TRIM);
      bevel(p, f ? 'tail-light' : 'headlight', [x - half * .82, lampY - .035, depth[0] + (f ? .025 : -.008), x + half * .82, lampY + .031, depth[1] + (f ? .008 : -.025)], .009, flat(f ? 0x914d39 : 0xd5cfb2));
      if (!f) {
        const marker = side * w * .884;
        bevel(p, 'turn-signal', [marker - .027, lampY - .044, d - .032, marker + .027, lampY + .025, d + .008], .008, flat(0xb78643));
      }
    }
    if (f) {
      const plateZ = d + .02;
      bevel(p, 'rear-plate', [-.115, lampY - .042, plateZ, .115, lampY + .03, plateZ + .009], .004, flat(0xadaa91));
    } else {
      bevel(p, 'grille', [-w * .48, lampY - .062, d - .034, w * .48, lampY + .046, d + .015], .013, TRIM);
      for (let i = 0; i < 3; i++) {
        const y = lampY - .037 + i * .028;
        bevel(p, 'grille-slat', [-w * .43, y, d - .041, w * .43, y + .007, d - .03], .002, flat(0x666962));
      }
    }
  }
  const seam = flat(shade(s.color, .59));
  const rocker = flat(shade(s.color, .76));
  function sidePoint(side, d, y) {
    const points = sideAt(side, d);
    const k = points.findIndex((pt, i) => i > 0 && pt.y >= y);
    const a = points[Math.max(0, k - 1)], b = points[Math.max(1, k)];
    const x = lerp(a.x, b.x, Math.max(0, Math.min(1, (y - a.y) / (b.y - a.y))));
    return V(x + side * .0025, y, d);
  }
  for (const side of [-1, 1]) {
    const normal = V(side, 0, 0);
    const [front, , , rear] = s.cabin;
    const stops = [front + .018, ...(s.windows ?? [.52]).filter((t) => t > .22 && t < .76).slice(0, 2).map((t) => lerp(front, rear, t)), rear - .010];
    for (const fraction of stops) {
      const d = z(fraction);
      const a = d - .0035, b = d + .0035;
      const top = belt - .019, bottom = Math.min(top - .028, Math.max(sill + .065, archHeight(d) + .023));
      bodyPanel('door-seam', [sidePoint(side, a, bottom), sidePoint(side, b, bottom), sidePoint(side, b, top), sidePoint(side, a, top)], normal, seam);
    }
    for (let i = 1; i < span.length; i++) {
      const a = span[i - 1], b = span[i];
      if (a < z(.09) || b > z(.92)) continue;
      const at = (d) => section(d).y - (s.stripe ? .145 : .134);
      const h = s.stripe ? .036 : .017;
      if ([a, b].some(d => at(d) - h < archHeight(d) + .04)) continue;
      bodyPanel('body-molding', [sidePoint(side, a, at(a)), sidePoint(side, b, at(b)), sidePoint(side, b, at(b) - h), sidePoint(side, a, at(a) - h)], normal, s.stripe ? flat(s.stripe) : rocker);
    }
  }
  // Hood and boot shut lines are laid on the actual deck slope.
  const seamAcross = (f, portion) => {
    const a = z(f), b = a + .006;
    const at = (side, d) => V(side * section(d).w * portion, section(d).y + .003, d);
    bodyPanel('deck-seam', [at(-1, a), at(-1, b), at(1, b), at(1, a)], up, seam);
  };
  // A shallow dark trim strip where the hood meets the nose.
  const { w: noseWidth, y: noseY } = section(z(0));
  const noseZ = z(0) - .002;
  bodyPanel('hood-shut-line', [V(-noseWidth * .88, noseY - .020, noseZ), V(noseWidth * .88, noseY - .020, noseZ),
    V(noseWidth * .88, noseY - .014, noseZ), V(-noseWidth * .88, noseY - .014, noseZ)], V(0, 0, -1), seam);
  if (!s.bed) seamAcross(Math.min(.977, Math.max(.91, s.cabin[3] + .014)), .88);
  const wheelWidth = s.tireWidth ?? .21;
  for (const d of wz) for (const side of [-1, 1]) {
    const x = side * (section(d).w - wheelWidth * .51);
    const rings = [[-.5, .89], [-.34, 1], [.34, 1], [.5, .89]];
    const wheel = rings.flatMap(([offset, r]) => Array.from({ length: 12 }, (_, i) => {
      const a = i * Math.PI / 6;
      return V(x + wheelWidth * offset, radius + Math.cos(a) * r * radius, d + Math.sin(a) * r * radius);
    }));
    hull(p, 'tire', wheel, RUBBER, { ppm: 24 });
    cyl(p, 'rim', 'x', [x, radius, d], radius * .64, wheelWidth + .012, 12, STEEL, { ppm: 27 });
    cyl(p, 'hub', 'x', [x, radius, d], radius * .25, wheelWidth + .026, 8, flat(0xb7b7a6), { ppm: 30 });
  }
  return { z, section, sideAt };
}

function cabin(p, s, tone, body) {
  const [front, crownFront, crownRear, back] = s.cabin;
  const roofY = s.height;
  const pitch = s.topWidth ?? .83;
  const roofRim = .048;
  const solidRear = s.solidRear ?? 1;
  const at = (side, fraction, top) => {
    const d = body.z(fraction), { w, y } = body.section(d);
    return top ? V(side * w * pitch, roofY - roofRim, d) : V(side * w * .922, y, d);
  };
  // Bottom and top windscreen, side glass and rear glass all re-use these same four rails.
  const bottom = [at(-1, front, false), at(1, front, false), at(1, back, false), at(-1, back, false)];
  const top = [at(-1, crownFront, true), at(1, crownFront, true), at(1, crownRear, true), at(-1, crownRear, true)];
  const pillarWidth = Math.min(.16, .069 / (body.z(back) - body.z(front)));
  for (let side = 0; side < 4; side++) {
    const next = (side + 1) % 4;
    const frontFace = side === 0, backFace = side === 2;
    const normal = frontFace || backFace ? V(0, .22, frontFace ? -1 : 1) : V(side === 1 ? 1 : -1, .15, 0);
    const along = (t, y) => bottom[side].clone().lerp(bottom[next], t)
      .lerp(top[side].clone().lerp(top[next], t), y);
    const surface = (name, a, b, low, high, color, options = {}) => {
      poly(p, name, [along(a, low), along(b, low), along(b, high), along(a, high)], normal, color, { ppm: 32, ...options });
    };
    const cuts = frontFace || backFace ? [] : (s.windows ?? [.52]).map((fraction) => side === 1 ? fraction : 1 - fraction).sort((a, b) => a - b);
    const edge = frontFace || backFace ? .042 : pillarWidth;
    const tallLower = s.van && !frontFace && !backFace ? .19 : .045;
    surface('window-sill', 0, 1, 0, tallLower, tone);
    surface('window-header', 0, 1, .94, 1, tone);
    surface('corner-pillar', 0, edge, tallLower, .94, tone);
    surface('corner-pillar', 1 - edge, 1, tallLower, .94, tone);
    let last = edge;
    function panel(a, b) {
      // Van/load-body panels can be solid. Passenger glass stays in one plane between narrow pillars.
      const distance = side === 3 ? 1 - (a + b) / 2 : (a + b) / 2;
      const metal = (backFace ? s.panelBack : !frontFace && distance > solidRear);
      surface(metal ? 'cargo-panel' : 'glass', a, b, tallLower, .94, metal ? tone : GLASS, metal ? {} : GLASS_OPTIONS);
    }
    for (const cut of cuts) {
      const half = pillarWidth * .45;
      panel(last, cut - half);
      surface('window-post', cut - half, cut + half, tallLower, .94, TRIM);
      last = cut + half;
    }
    panel(last, 1 - edge);
    if (backFace && s.panelBack) {
      const seam = [along(.497, .09), along(.503, .09), along(.503, .91), along(.497, .91)];
      for (const pt of seam) pt.z += .004;
      poly(p, 'rear-door-seam', seam, normal, flat(shade(s.color, .66)), { ppm: 26 });
    }
    if (!frontFace && !backFace) {
      // A short neutral handle and mirror on each side. No seam between separate glass tiles.
      const dir = side === 1 ? 1 : -1;
      const handleZ = body.z(lerp(front, back, s.windows?.[0] ? s.windows[0] * .81 : .41));
      const { w, y } = body.section(handleZ);
      const x = dir * w * .958;
      bevel(p, 'door-handle', [x - .024, y - .105, handleZ - .053, x + .024, y - .082, handleZ + .053], .008, s.chrome ? STEEL : TRIM);
      const mirrorZ = body.z(lerp(front, crownFront, .25));
      const mirrorX = dir * body.section(mirrorZ).w;
      for (const [name, x0, x1, y0, y1, depth] of [
        ['mirror-stem', 0, .094, .029, .053, .032],
        ['mirror-housing', .062, .176, .05, .121, .061],
      ]) {
        const xs = [mirrorX + dir * x0, mirrorX + dir * x1].sort((a, b) => a - b);
        bevel(p, name, [xs[0], s.belt + y0, mirrorZ - depth / 2, xs[1], s.belt + y1, mirrorZ + depth / 2], .009, TRIM);
      }
    }
  }
  const outer = top.map((pt) => V(pt.x * .971, roofY, pt.z));
  const inner = outer.map((pt) => V(pt.x * .78, roofY + .028, pt.z * .83 + (body.z(crownFront) + body.z(crownRear)) * .085));
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    const normal = [V(0, .4, -1), V(1, .4, 0), V(0, .4, 1), V(-1, .4, 0)][i];
    poly(p, 'roof-rail', [top[i], top[j], outer[j], outer[i]], normal, tone, { ppm: 33 });
    poly(p, 'roof-bevel', [outer[i], outer[j], inner[j], inner[i]], V(0, 1, 0), tone, { ppm: 34 });
  }
  poly(p, 'roof-skin', inner, V(0, 1, 0), tone, { ppm: 32 });
  poly(p, 'roof-liner', top, V(0, -1, 0), LINER, { ppm: 26 });

  if (s.beacon) {
    const d = body.z(lerp(crownFront, crownRear, .3));
    bevel(p, 'roof-beacon-base', [-.39, roofY + .01, d - .075, .39, roofY + .07, d + .075], .017, TRIM);
    for (const side of [-1, 1]) {
      const x = side * .24;
      bevel(p, 'roof-beacon', [x - .145, roofY + .051, d - .06, x + .145, roofY + .117, d + .06], .026, flat(side < 0 ? 0x8a4a42 : 0x496c88));
    }
  }
}

const sedan = { length: 4.56, width: 1.78, belt: .86, height: 1.375, cabin: [.282, .444, .677, .811], color: 0x8d4138, chrome: true, windows: [.53] };
const coupe = { ...sedan, length: 4.36, width: 1.78, belt: .82, height: 1.29, cabin: [.304, .473, .641, .807], color: 0x53666b, windows: [.68] };
const hatch = { ...sedan, length: 3.91, width: 1.70, belt: .86, height: 1.43, cabin: [.264, .421, .855, .953], color: 0xb1a47d, chrome: false };
const wagon = { ...sedan, length: 4.69, width: 1.80, belt: .85, height: 1.45, cabin: [.268, .411, .870, .957], color: 0x596952, windows: [.37, .69] };
const suv = { ...wagon, length: 4.87, width: 1.90, belt: 1.04, height: 1.77, tire: .40, tireWidth: .26, cabin: [.262, .373, .886, .967], nose: .83, tail: .94, color: 0x536667, chrome: false };
const pickup = { ...suv, length: 5.06, width: 1.92, belt: 1.01, height: 1.69, cabin: [.254, .372, .564, .616], bed: true, color: 0x8e6e55, windows: [] };
const van = { ...suv, length: 4.85, belt: 1.12, height: 1.94, tire: .35, cabin: [.182, .332, .902, .972], color: 0x83928a, windows: [.28, .56, .80], van: true };
const box = { ...van, length: 5.96, width: 2.11, belt: 1.30, height: 2.52, cabin: [.138, .275, .938, .978], color: 0xb5aea0, solidRear: .34, panelBack: true, tire: .42 };
const bus = { ...van, length: 9.72, width: 2.42, belt: 1.57, height: 2.85, cabin: [.120, .153, .938, .973], nose: .92, tail: .96, noseDrop: .15, color: 0x6e7c78, windows: [.16, .30, .44, .56, .70, .84], tire: .49, tireWidth: .29, axles: [.22, .75, .86] };
const truck = { ...box, length: 7.12, width: 2.32, belt: 1.34, height: 2.52, cabin: [.193, .269, .437, .484], color: 0x62717a, solidRear: 1, panelBack: false, tire: .48, tireWidth: .3, axles: [.19, .69, .84], windows: [] };
const armored = { ...suv, length: 5.18, width: 2.18, belt: 1.31, height: 1.97, cabin: [.228, .327, .816, .92], color: 0x666650, nose: .85, tire: .47, tireWidth: .32, solidRear: .54, panelBack: true, windows: [.41, .62], topWidth: .87 };

// Each model binds only the CDDA vehicles with its body (checked against their blueprints: `car`
// is CDDA's station wagon, `car_sedan` the sedan). Vehicles with a body of their own (helicopters,
// APCs, the Beetle, tandem motorcycles, the Wienermobile…) stay unbound until they get a model.
const lineup = [
  ['sedan', sedan, 'car_sedan car_sedan_diesel_i4 car_sedan_diesel_v6 car_sedan_electric car_sedan_luxury_electric car_sedan_luxury_v6 car_sedan_sports_electric car_sedan_sports_v12 car_sedan_sports_v6 car_sedan_v8 car_fbi'],
  ['town', { ...sedan, length: 4.90, width: 1.87, cabin: [.304, .465, .685, .812], color: 0x515658 }, 'car_town car_town_budget car_town_budget_superior car_town_diesel car_town_diesel_budget'],
  ['coupe', coupe, 'car_coupe car_coupe_diesel_i4 car_coupe_diesel_v6 car_coupe_electric car_coupe_luxury_electric car_coupe_luxury_v6'],
  ['sports', { ...coupe, length: 4.37, width: 1.86, height: 1.17, cabin: [.301, .499, .620, .827], nose: .73, belt: .73, color: 0x997849, chrome: false }, 'car_coupe_muscle car_coupe_sports_electric car_coupe_sports_v12 car_coupe_sports_v6 car_racing_electric car_sports car_sports_electric car_super_electric car_super_electric_alt car_super_v12'],
  ['compact', hatch, 'car_hatch car_hatch_diesel car_hatch_rack car_mini'],
  ['micro', { ...hatch, length: 3.04, width: 1.48, height: 1.38, belt: .79, tire: .27, cabin: [.25, .439, .823, .943], color: 0x9d7359, windows: [] }, 'car_micro car_micro_electric car_micro_hybrid scompact scompact_electric scompact_hybrid scompact_tandem_electric_hboard scompact_tandem_electric_stow scompact_tandem_hboard scompact_tandem_stow'],
  ['tourer', wagon, 'car_shootingbrake_electric car_shootingbrake_long_electric car_shootingbrake_long_v12 car_shootingbrake_long_v8 car_shootingbrake_v12 car_shootingbrake_v8 car car_anmlcmpt car_diesel car_luxury car_mayhem_tire_change car_rack car_hybrid car_hybrid_rack electric_car'],
  ['limo', { ...sedan, length: 6.28, width: 1.83, cabin: [.200, .308, .727, .837], color: 0x4c4c4f, windows: [.25, .51, .76] }, 'limousine'],
  ['hearse', { ...wagon, length: 5.48, color: 0x424347, solidRear: .39, windows: [.35, .64] }, 'hearse'],
  ['police', { ...sedan, color: 0x657a86, stripe: 0xd0cabc, beacon: true }, 'policecar policecar_k9'],
  ['suv', suv, 'suv suv_electric suv_electric_rack 4x4_car 4x4_car_diesel'],
  ['police_suv', { ...suv, color: 0x6d7f87, stripe: 0xd0cabc, beacon: true }, 'policesuv policesuv_k9 police_k9tpt'],
  ['pickup', pickup, 'pickup pickup_corpses pickup_technical FM_early_pickup'],
  ['crew_pickup', { ...pickup, length: 5.61, cabin: [.235, .337, .621, .667], color: 0x71857d, windows: [.55] }, '4seat_pickup extended_pickup'],
  ['minivan', van, 'van_mini van_mini_hybrid van_full-size van_full-size_hybrid hippie_van'],
  ['cargo_van', { ...van, length: 5.12, color: 0xb6b09a, windows: [.30], solidRear: .31, panelBack: true }, 'van_cargo animalctrl'],
  ['camper', { ...van, height: 2.22, color: 0x9d8a6c, solidRear: .74 }, 'van_camper van_motorhome traveler_van_motorhome'],
  ['ambulance', { ...box, color: 0xa9a597, stripe: 0x8e5245, beacon: true }, 'ambulance'],
  ['delivery', box, 'cube_van cube_van_cheap fridge_van food_truck food_truck_delivery_mission food_truck_taco icecream_truck'],
  ['rv', { ...box, length: 7.36, width: 2.38, height: 2.72, color: 0xb4a594, windows: [.22, .46, .73], solidRear: .85 }, 'rv lux_rv meth_lab'],
  ['city_bus', bus, 'bus bus_rack bus_tour bus_prison'],
  ['school_bus', { ...bus, length: 8.68, cabin: [.165, .219, .932, .974], color: 0xa38546, stripe: 0x403d30, nose: .82, axles: [.22, .80] }, 'schoolbus'],
  ['truck', { ...truck, bed: true, color: 0x696b51 }, 'tatra_truck military_cargo_truck military_cargo_truck_b'],
  ['flatbed', { ...truck, length: 8.3, cabin: [.166, .248, .351, .399], belt: 1.24, height: 2.45, bed: true, axles: [.16, .69, .79] }, 'flatbed_truck'],
  ['semi', { ...truck, length: 6.75, cabin: [.205, .310, .52, .551], height: 2.80, color: 0x806850, axles: [.2, .73, .86] }, 'semi_truck semi_truck_scenario'],
  ['tow', { ...truck, length: 6.34, cabin: [.236, .349, .510, .56], belt: 1.20, height: 2.34, bed: true, color: 0xa48848, axles: [.2, .78] }, 'underlift_tow_truck underlift_tow_truck_lack_wheels'],
  ['fire_engine', { ...box, length: 7.96, width: 2.32, height: 2.73, color: 0x8d4840, stripe: 0xd3c7a8, beacon: true, axles: [.19, .72, .83], nose: .89 }, 'fire_engine fire_truck'],
  ['armored', armored, 'humvee humvee_gl humvee_tow armored_car armored_car_xedra_vanguard'],
  ['armored_van', { ...box, color: 0x565d55, cabin: [.164, .299, .933, .976], nose: .89 }, 'prisoner_van_1 security_van truck_swat'],
];

export const ROAD_VEHICLES = lineup.map(([name, spec, ids]) => ({
  id: `vehicle_${name}`,
  ids: ids.split(' '),
  dir: 'vehicles',
  source: SOURCE,
  // Where the interior parts go (engines and the studio place the CDDA layout's cabin parts in
  // the shell): the cabin floor, the shell's length and width in metres.
  interior: { floor: floorOf(spec), length: spec.length, width: spec.width },
  batchByMaterial: true,
  build(p) {
    const color = spec.color;
    const coat = speckle(`coat-${name}`, color, [shade(color, .965), shade(color, 1.035)], .14);
    const body = carShell(p, spec, coat);
    cabin(p, spec, coat, body);
  },
}));
