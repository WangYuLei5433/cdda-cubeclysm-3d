// Static, metre-scale vegetation. Branch paths establish the silhouette first; crown lobes
// grow from their tips. All of the facets use the same nearest-neighbour atlas as other props.
import { Vector3 } from 'three';

import { fill, mix, rng, shade } from './paint.js';
import { flat, planks } from './props.js';

const TAU = 2 * Math.PI;
const UP = new Vector3(0, 1, 0);
const v = (x, y, z) => new Vector3(x, y, z);
const polar = (a, r, y) => v(Math.cos(a) * r, y, Math.sin(a) * r);
const sum = (a, b, k = 1) => a.clone().addScaledVector(b, k);

function facet(points, side) {
  const [a, b, c, d = c] = points;
  return { p: points, side, wm: Math.max(a.distanceTo(b), c.distanceTo(d)), hm: Math.max(b.distanceTo(c), a.distanceTo(d)) };
}

function part(p, name, faces, paint, ppm) {
  p.blocks.push({ parent: p.root, name, faces, paint, ppm });
}

// Rings advance along the shoot. "side" runs from the wide end to the narrow end in the atlas.
function shell(rings, start, end) {
  const faces = [];
  const sides = rings[0].length;
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    faces.push(facet([start, rings[0][i], rings[0][j]], 'base'));
    for (let k = 1; k < rings.length; k++) {
      faces.push(facet([rings[k - 1][j], rings[k - 1][i], rings[k][i], rings[k][j]], `side-${i}-${k}`));
    }
    const last = rings.at(-1);
    faces.push(facet([last[j], last[i], end], 'tip'));
  }
  return faces;
}

function woodPaint(seed, { base, light, dark, kind }) {
  return (ctx, x, y, w, h, side) => {
    fill(ctx, x, y, w, h, side === 'tip' && kind === 'dead' ? light : base);
    if (side === 'base' || side === 'tip') return;
    const r = rng(`${seed}:${side}`);
    if (kind === 'birch') {
      for (let i = 1; i < h; i += 3 + Math.floor(r() * 6)) {
        const start = Math.floor(r() * w);
        fill(ctx, x + start, y + i, 1 + Math.floor(r() * (w - start)), 1, r() < .65 ? dark : light);
        if (r() < .32) fill(ctx, x + start, y + i + 1, 1 + Math.floor(w * .3), 2, dark);
      }
      return;
    }
    if (kind === 'blackplates') {
      // Rectangular black plates split by narrow orange fissures.
      // Plates about 4–7 px tall and wide; the fissures between them are broken, not a full grid.
      for (let j = 0; j < h; j += 4 + Math.floor(r() * 4)) {
        for (let i = 0; i < w; i += 3 + Math.floor(r() * 4)) if (r() < .45) fill(ctx, x + i, y + j, 2 + Math.floor(r() * 3), 1, dark);
        for (let i = Math.floor(r() * 5); i < w; i += 5 + Math.floor(r() * 5)) if (r() < .5) fill(ctx, x + i, y + j + 1, 1, 2 + Math.floor(r() * 3), shade(dark, .8));
      }
      for (let k = 0; k < w * h / 30; k++) fill(ctx, x + Math.floor(r() * w), y + Math.floor(r() * h), 2, 1, light);
      return;
    }
    const spacing = kind === 'smooth' ? 4 : 2;
    for (let i = 0; i < w; i += spacing) {
      for (let j = Math.floor(r() * 7); j < h;) {
        const length = 2 + Math.floor(r() * (kind === 'shaggy' ? 18 : 10));
        const tone = r() < .55 ? dark : light;
        fill(ctx, x + i, y + j, 1, length, tone);
        if (kind === 'shaggy' && r() < .55) fill(ctx, x + i + 1, y + j + 2, 1, length - 1, mix(tone, base, .5));
        if (kind === 'plated' && r() < .48) fill(ctx, x + i, y + j, 2 + Math.floor(r() * 2), 1, dark);
        j += length + 2 + Math.floor(r() * 7);
      }
    }
  };
}

function shoot(p, name, path, bark, { sides = 6, ground = false } = {}) {
  const points = path.map(([x, y, z]) => v(x, y, z));
  const spine = points.at(-1).clone().sub(points[0]).normalize();
  const guide = Math.abs(spine.y) > .9 ? v(1, 0, 0) : v(0, 1, 0);
  const rings = points.map((point, i) => {
    const axis = points[Math.min(i + 1, points.length - 1)].clone().sub(points[Math.max(0, i - 1)]).normalize();
    if (ground && i === 0) axis.set(0, 1, 0);
    const u = guide.clone().cross(axis).normalize();
    const w = u.clone().cross(axis);
    return Array.from({ length: sides }, (_, j) => {
      const angle = (j + .17) * TAU / sides;
      const radius = path[i][3] * (j % 2 ? .92 : 1.07);
      return sum(sum(point, u, radius * Math.cos(angle)), w, radius * Math.sin(angle));
    });
  });
  part(p, name, shell(rings, points[0], points.at(-1)), woodPaint(`${p.id}:${name}`, bark), 64);
}

const colors = {
  oak: [0x4b7139, 0x5e8645, 0x72964d],
  hickory: [0x52743d, 0x66894a, 0x809651],
  blackjack: [0x405a31, 0x536d39, 0x6e8043],
  pine: [0x315a4b, 0x3f7058, 0x578062],
  birch: [0x688744, 0x809f4d, 0x96ac58],
  maple: [0x55783a, 0x789449, 0x9fa758],
  beech: [0x456949, 0x5e8455, 0x769b60],
  cottonwood: [0x507254, 0x66885e, 0x809869],
  elm: [0x537137, 0x6b883e, 0x82984b],
  shrub: [0x50763e, 0x69924b, 0x85a557],
};

const barks = {
  oak: { base: 0x76634e, light: 0x8e795c, dark: 0x4b4034 },
  hickory: { base: 0x82776a, light: 0x9e9080, dark: 0x63574a, kind: 'shaggy' },
  blackjack: { base: 0x221e1b, light: 0x36302a, dark: 0xa85a28, kind: 'blackplates' },
  pine: { base: 0x795a46, light: 0x97715a, dark: 0x563e35, kind: 'plated' },
  birch: { base: 0xd6d2b9, light: 0xb1a78c, dark: 0x51483d, kind: 'birch' },
  maple: { base: 0x827569, light: 0x948574, dark: 0x62564b },
  beech: { base: 0x92918a, light: 0xa6a59a, dark: 0x7e7b71, kind: 'smooth' },
  cottonwood: { base: 0x75695b, light: 0x958673, dark: 0x51473b },
  elm: { base: 0x796a53, light: 0x92806a, dark: 0x574937 },
  snag: { base: 0x877b69, light: 0xb59c77, dark: 0x625849, kind: 'dead' },
  dead: { base: 0x57473a, light: 0x846b52, dark: 0x382f28, kind: 'dead' },
};

// Leaf marks per species, as small pixel stamps ('#' = mark): the leaf shape each species is
// known by, small enough to read as foliage at the atlas's resolution.
const STAMPS = {
  oak: ['.#.#', '####', '.##.'], // lobed
  maple: ['#.#', '###', '.#.'], // five-pronged
  birch: ['#'], // small, airy leaves: sparse dots
  beech: ['##'], // neat ovals
  hickory: ['#..', '.#.', '..#'], // leaflets along a stalk
  cottonwood: ['#.', '##'], // triangular, glossy
  elm: ['##', '#.'], // small, dense
  blackjack: ['###', '##.'], // broad, leathery
  shrub: ['#.', '.#'],
  stone: ['#.', '..'], // grit
  fruit: [],
};

/** Leaves on one facet of a crown lobe: lit by its band (top bright, underside dark), then stamped. */
function leafPaint(seed, palette, tone, style, bands) {
  return (ctx, x, y, w, h, side) => {
    const r = rng(`${seed}:${side}`);
    const band = side.startsWith('side-') ? +side.split('-')[2] : 0;
    const light = side === 'tip' ? 1.16 : side === 'base' ? .66 : .8 + .3 * (band - 1) / Math.max(1, bands - 1);
    const green = shade(mix(palette[0], palette[1], tone), light);
    fill(ctx, x, y, w, h, green);
    const hi = shade(mix(green, palette[2], .55), 1.06), lo = shade(mix(green, palette[0], .5), .8);
    if (style === 'pine') {
      // Needle fans: short strokes splaying out from little twigs.
      for (let i = 0; i < Math.ceil(w * h / 14); i++) {
        const px = x + Math.floor(r() * w), py = y + Math.floor(r() * h), c = r() < .55 ? hi : lo, dir = r() < .5 ? 1 : -1;
        for (let j = 0; j < 3 + Math.floor(r() * 3); j++) fill(ctx, px + j * dir, py - Math.floor(j / 2), 1, 1, c);
      }
      return;
    }
    const stamp = STAMPS[style] ?? STAMPS.shrub;
    if (!stamp.length) return;
    const per = style === 'birch' ? 22 : 13;
    for (let i = 0; i < Math.ceil(w * h / per); i++) {
      const px = x + Math.floor(r() * w), py = y + Math.floor(r() * h), c = r() < .6 ? hi : lo;
      stamp.forEach((row, j) => [...row].forEach((ch, k) => { if (ch === '#' && px + k < x + w && py + j < y + h) fill(ctx, px + k, py + j, 1, 1, c); }));
      if (style === 'cottonwood' && r() < .3) fill(ctx, px, py, 1, 1, mix(green, 0xe8eedc, .6)); // glossy, silvery undersides
    }
  };
}

// An irregular polygon with a broad shoulder and a tucked-in underside. The bands have constant
// aspect ratio so adjoining facets meet cleanly. Changing the profile gives pine boughs sharper tips.
function cluster(p, name, center, [rx, ry, rz], palette, tone, { needles = false, angle = 0, sides = 8, style = needles ? 'pine' : 'shrub' } = {}) {
  const r = rng(`${p.id}:${name}`);
  const outline = Array.from({ length: sides }, (_, i) => {
    const a = i * TAU / sides + (r() - .5) * .19;
    const k = .84 + r() * .27;
    return v(Math.cos(a) * rx * k, 0, Math.sin(a) * rz * k).applyAxisAngle(UP, angle);
  });
  const profile = needles
    ? [[-.60, .47], [-.30, 1], [.28, .63]]
    : [[-.60, .56], [-.23, .95], [.29, .91], [.76, .54]];
  const rise = outline.map(() => (r() - .5) * ry * .24);
  const rings = profile.map(([y, size]) => outline.map((q, i) => sum(sum(center, q, size), v(0, y * ry + rise[i], 0))));
  const faces = shell(rings, sum(center, v(0, -.81 * ry, 0)), sum(center, v(rx * .13, ry, -rz * .09)));
  // Blend the panel normal with its radial direction to soften the bands and keep the facets visible.
  if (!needles) {
    for (const f of faces) {
      const [a, b, c] = f.p;
      const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
      f.normals = f.p.map((point) => {
        const radial = point.clone().sub(center);
        radial.y *= (rx + rz) / (2 * ry);
        return normal.clone().lerp(radial.normalize(), .64).normalize();
      });
    }
  }
  part(p, name, faces, leafPaint(`${p.id}:${name}`, palette, tone, style, profile.length - 1), 32);
}

function roots(p, bark, thickness) {
  const r = rng(`${p.id}:roots`);
  for (let i = 0; i < 4; i++) {
    const a = i * TAU / 4 + r() * .65, reach = thickness * (1.5 + r() * .6);
    const mid = polar(a, reach * .62, thickness * .38);
    const tip = polar(a + .2, reach, thickness * .14);
    shoot(p, `root-${i}`, [[0, thickness * .9, 0, thickness * .52], [...mid, thickness * .3], [...tip, thickness * .075]], bark, { sides: 5 });
  }
}

// Branch rows specify each crown lobe's centre, half-width and height independently.
function deciduous({ species, trunk, fork, lobes, fruit, flare = true, leaf = species }) {
  return (p) => {
    const bark = barks[species], palette = colors[species];
    const r = rng(p.id);
    const [lean, length, width] = trunk;
    shoot(p, 'leader', [[0, 0, 0, width], [lean * .16, .24, .015, width * .79], [lean * .66, fork, -.025, width * .63], [lean, length * .83, .08, width * .35], [lean * 1.6, length, -.04, width * .12]], bark, { sides: 8, ground: true });
    if (flare) roots(p, bark, width);
    lobes.forEach(([x, y, z, size, height], i) => {
      const name = `crown-${i}`, center = v(x, y, z);
      const startY = Math.min(y - .39, fork + r() * .64);
      const startX = lean * Math.min(1, startY / fork) * .66;
      const tip = sum(center, v(0, -.20 * height, 0));
      const joint = v(x * .51 + startX * .49, startY + (tip.y - startY) * .44, z * .43);
      const radius = width * (.32 + r() * .18);
      shoot(p, `branch-${i}`, [[startX, startY, -.02, radius], [...joint, radius * .60], [...tip, radius * .18]], bark);
      cluster(p, name, center, [size, height, size * (.75 + r() * .21)], palette, .34 + r() * .57, { angle: r() * TAU, style: leaf });
      if (i % 2 === 0) {
        const offset = polar(Math.atan2(z, x) + .35, size * .63, -height * .34);
        cluster(p, `sprig-${i}`, sum(center, offset), [size * .43, height * .50, size * .44], palette, .23 + r() * .46, { sides: 7, angle: r() * TAU, style: leaf });
      }
      if (fruit && i % 2 === 1) {
        const pos = sum(center, v(x * .16, -height * .53, z * .16));
        cluster(p, `fruit-${i}`, pos, fruit.radii, [fruit.color, shade(fruit.color, 1.12), shade(fruit.color, 1.23)], .6, { sides: 5, style: 'fruit' });
      }
    });
  };
}

const oak = deciduous({ species: 'oak', trunk: [.16, 3.49, .265], fork: 1.32,
  lobes: [[-.94, 2.79, .01, .82, .78], [.87, 2.92, -.35, .74, .77], [.41, 2.70, .79, .76, .69], [-.43, 2.71, -.76, .80, .71], [.12, 3.36, .03, .91, .64], [-.44, 3.13, .43, .72, .68]],
  fruit: { color: 0x896740, radii: [.038, .054, .037] },
});

const hickory = deciduous({ species: 'hickory', trunk: [-.13, 4.30, .19], fork: 2.07,
  lobes: [[-.66, 3.15, .22, .60, .74], [.56, 3.49, -.12, .67, .76], [.08, 3.17, .70, .55, .75], [-.34, 3.45, -.58, .67, .80], [-.13, 4.04, .04, .67, .64], [.22, 3.71, .39, .58, .61]],
  fruit: { color: 0x9a9a55, radii: [.048, .052, .045] },
});

const blackjack = deciduous({ species: 'blackjack', trunk: [.32, 2.93, .21], fork: 1.23,
  lobes: [[-.69, 2.55, .15, .60, .66], [.83, 2.70, -.09, .64, .66], [.28, 2.35, .65, .66, .57], [-.16, 2.65, -.71, .63, .62], [.42, 2.95, .04, .67, .57]],
});

const birch = deciduous({ species: 'birch', trunk: [-.15, 4.18, .114], fork: 2.04, flare: false,
  lobes: [[-.64, 3.25, .20, .43, .47], [.56, 3.49, .01, .46, .52], [.22, 2.84, .58, .40, .43], [-.38, 3.57, -.49, .47, .57], [-.29, 4.02, .06, .48, .52], [.07, 3.76, .31, .34, .39], [.41, 3.19, -.36, .35, .35]],
});

const maple = deciduous({ species: 'maple', trunk: [-.08, 3.44, .22], fork: 1.57,
  lobes: [[-.82, 2.89, -.11, .81, .69], [.82, 2.88, .25, .80, .75], [-.17, 2.66, .77, .77, .68], [.36, 2.87, -.76, .84, .70], [.01, 3.31, .04, .91, .69], [-.48, 3.15, -.40, .78, .66]],
});

const beech = deciduous({ species: 'beech', trunk: [.06, 3.17, .235], fork: 1.32,
  lobes: [[-1.02, 2.62, -.11, .86, .65], [.96, 2.64, -.18, .84, .65], [.20, 2.44, .82, .85, .61], [-.34, 2.61, -.81, .82, .68], [.11, 3.09, .04, .97, .71], [-.49, 2.72, .48, .77, .56]],
  fruit: { color: 0x8e643b, radii: [.035, .042, .034] },
});

const cottonwood = deciduous({ species: 'cottonwood', trunk: [.11, 4.20, .26], fork: 1.83,
  lobes: [[-1.04, 3.15, .18, .73, .81], [1.04, 3.62, -.16, .79, .93], [.39, 3.19, .88, .78, .78], [-.57, 3.48, -.78, .77, .84], [.14, 3.97, .08, .85, .85], [-.43, 3.87, .42, .69, .79]],
  fruit: { color: 0xd2d8bc, radii: [.050, .044, .047] },
});

const elm = deciduous({ species: 'elm', trunk: [.06, 3.93, .205], fork: 1.22,
  lobes: [[-1.13, 3.66, .05, .79, .64], [1.08, 3.77, -.15, .81, .67], [.31, 3.58, .88, .79, .59], [-.34, 3.75, -.89, .80, .65], [.05, 3.87, .02, .91, .66], [-.61, 3.61, .65, .66, .56]],
});

const sapling = deciduous({ species: 'hickory', leaf: 'shrub', trunk: [.12, 1.96, .052], fork: 1.01, flare: false,
  lobes: [[-.28, 1.52, .13, .28, .34], [.32, 1.73, -.17, .32, .32], [.05, 1.64, .31, .28, .31], [.11, 1.94, .01, .34, .31]],
});

// Eastern white pine: a straight, bare red-brown bole, then tiers of spreading boughs (wide,
// ragged-edged skirts that droop at the rim), each smaller and turned against the one below,
// ending in a spire.
function bough(p, name, centre, radius, height, tone, angle) {
  const r = rng(`${p.id}:${name}`), sides = 9;
  const jag = Array.from({ length: sides }, (_, i) => (i % 2 ? .78 : 1.04) * (.9 + r() * .2));
  const ring = (k, y) => Array.from({ length: sides }, (_, i) => {
    const a = angle + i * TAU / sides;
    const kk = k * (k > .7 ? jag[i] : 1);
    return sum(centre, v(Math.cos(a) * radius * kk, y + (k > .7 ? (r() - .5) * height * .12 : 0), Math.sin(a) * radius * kk));
  });
  // Lip (drooping rim) → rim → shoulder → apex; the underside rises to a hollow centre.
  const rings = [ring(.88, -height * .1), ring(1, height * .08), ring(.5, height * .5)];
  const faces = shell(rings, sum(centre, v(0, height * .2, 0)), sum(centre, v(0, height, 0)));
  part(p, name, faces, leafPaint(`${p.id}:${name}`, colors.pine, tone, 'pine', rings.length - 1), 32);
}

function pine(p) {
  const bark = barks.pine;
  shoot(p, 'leader', [[0, 0, 0, .19], [.01, .3, 0, .16], [.03, 1.5, -.01, .13], [.05, 3.0, .02, .085], [.05, 4.3, .01, .035], [.05, 4.75, 0, .01]], bark, { sides: 8, ground: true });
  roots(p, bark, .19);
  // Dead lower whorls: short bare stubs below the first tier.
  [[0.9, .4], [1.15, 2.6], [1.3, 4.5]].forEach(([y, a], i) => shoot(p, `stub-${i}`, [[...polar(a, .08, y), .03], [...polar(a, .38, y - .06), .008]], bark, { sides: 4 }));
  const tiers = [[1.35, 1.12, .62], [1.95, .98, .62], [2.5, .84, .6], [3.02, .68, .58], [3.5, .52, .56], [3.95, .36, .55]];
  tiers.forEach(([y, radius, height], i) => {
    // The whorl's boughs under each tier.
    for (let j = 0; j < 4; j++) { const a = i * .9 + j * TAU / 4; shoot(p, `whorl-${i}-${j}`, [[...polar(a, .05, y + .12), .045 - i * .006], [...polar(a, radius * .8, y + .04), .012]], bark, { sides: 4 }); }
    // Each tier is a few bough clusters around the trunk, not one disc: uneven heights and reach.
    const n = i < 4 ? 3 : 2;
    for (let k = 0; k < n; k++) {
      const a = i * 1.3 + k * TAU / n + (p.r() - .5) * .6, off = radius * (.32 + p.r() * .14);
      const c = sum(v(.04, y + (p.r() - .5) * .14, 0), polar(a, off, 0));
      bough(p, `tier-${i}-${k}`, c, radius * (.62 + p.r() * .14), height * (.8 + p.r() * .3), .25 + i * .1 + p.r() * .2, a);
    }
    bough(p, `tier-${i}-core`, v(.04, y + height * .25, 0), radius * .45, height * .9, .45 + i * .08, i);
  });
  bough(p, 'spire', v(.05, 4.3, 0), .2, .5, .95, .3);
}

function snag(p) {
  const bark = barks.snag;
  shoot(p, 'split-spire', [[0, 0, 0, .205], [-.02, .28, 0, .169], [-.06, 1.72, .05, .134], [.02, 2.72, .04, .095], [-.09, 3.62, -.06, .071], [-.13, 4.02, -.06, .036]], bark, { sides: 7, ground: true });
  roots(p, bark, .205);
  shoot(p, 'rising-fork', [[-.03, 1.88, .04, .095], [.34, 2.33, -.11, .07], [.65, 2.67, -.25, .039], [.72, 3.14, -.29, .018]], bark);
  shoot(p, 'side-snag', [[0, 2.68, .07, .074], [-.33, 2.94, .37, .049], [-.50, 3.26, .50, .031]], bark);
  shoot(p, 'stub', [[-.05, 1.21, .04, .066], [-.28, 1.43, -.02, .042], [-.40, 1.49, -.05, .031]], bark);
  shoot(p, 'splinter', [[-.10, 3.52, -.04, .04], [-.20, 3.76, -.09, .028], [-.22, 3.97, -.09, .006]], bark, { sides: 5 });
}

function deadTree(p) {
  const bark = barks.dead;
  shoot(p, 'crooked-stem', [[0, 0, 0, .21], [.03, .27, .015, .162], [.13, 1.18, -.07, .126], [.02, 2.01, .01, .098], [-.29, 2.62, .10, .064], [-.41, 3.07, .17, .035], [-.65, 3.42, .23, .009]], bark, { sides: 7, ground: true });
  roots(p, bark, .21);
  shoot(p, 'right-fork', [[.12, 1.4, -.04, .091], [.45, 1.78, .10, .072], [.74, 2.04, .12, .052], [.91, 2.44, .27, .034], [.86, 2.89, .39, .008]], bark);
  shoot(p, 'right-twig', [[.64, 1.98, .12, .040], [.93, 2.15, -.05, .024], [1.03, 2.46, -.13, .006]], bark, { sides: 5 });
  shoot(p, 'left-fork', [[.02, 1.93, .01, .082], [-.34, 2.14, -.30, .052], [-.63, 2.22, -.48, .038], [-.79, 2.65, -.61, .012]], bark);
  shoot(p, 'back-fork', [[-.22, 2.53, .07, .047], [-.24, 2.82, -.24, .029], [-.15, 3.19, -.51, .007]], bark, { sides: 5 });
}

function treetop(p) {
  const bark = barks.oak;
  shoot(p, 'perch-base', [[0, 0, 0, .094], [.06, .23, .02, .068], [.15, .52, .10, .040], [.30, .69, .18, .019]], bark, { ground: true });
  for (const [i, x, y, z] of [[0, -.48, .48, -.07], [1, .29, .67, .26], [2, .21, .46, -.43]]) {
    shoot(p, `perch-${i}`, [[.044, .18, .012, .057], [x * .6, y * .7, z * .6, .039], [x, y, z, .012]], bark);
    cluster(p, `perch-leaves-${i}`, v(x, y + .04, z), [.23, .16, .19], colors.oak, .35 + i * .23, { angle: i * 2, sides: 7, style: 'oak' });
  }
}

function shrub(p) {
  const bark = barks.oak;
  shoot(p, 'shrub-core', [[0, 0, 0, .032], [.015, .20, .015, .024], [.035, .42, .023, .009]], bark, { ground: true });
  const lobes = [[-.32, .38, -.08, .28], [.30, .42, .09, .28], [-.08, .30, .29, .25], [.02, .43, -.30, .26], [.07, .57, -.02, .31], [-.23, .52, .11, .22]];
  lobes.forEach(([x, y, z, size], i) => {
    shoot(p, `shrub-fork-${i}`, [[.015, .17, .015, .019], [x * .58, y * .68, z * .52, .014], [x, y, z, .005]], bark, { sides: 5 });
    cluster(p, `shrub-leaves-${i}`, v(x, y, z), [size, size * .88, size * .89], colors.shrub, .37 + p.r() * .55, { angle: p.r() * TAU, sides: 7 });
  });
}

// A narrow ridge gives each leaflet a real fold. A lower ridge closes the underside.
function blade(p, name, base, tip, width, tone) {
  const across = tip.clone().sub(base).cross(UP).normalize();
  const middle = base.clone().lerp(tip, .44);
  const left = sum(middle, across, width);
  const right = sum(middle, across, -width);
  const top = sum(middle, v(0, width * .33, 0));
  const bottom = sum(middle, v(0, -width * .12, 0));
  const faces = [
    facet([base, left, top], 'leaf'), facet([left, tip, top], 'leaf'),
    facet([tip, right, top], 'light'), facet([right, base, top], 'light'),
    facet([left, base, bottom], 'under'), facet([tip, left, bottom], 'under'),
    facet([right, tip, bottom], 'under'), facet([base, right, bottom], 'under'),
  ];
  part(p, name, faces, (ctx, x, y, w, h, side) => fill(ctx, x, y, w, h, shade(tone, side === 'light' ? 1.07 : side === 'under' ? .92 : 1)), 24);
}

function fern(p, origin = v(0, 0, 0), scale = 1, fronds = 7) {
  for (let j = 0; j < fronds; j++) {
    const a = j * TAU / fronds + (p.r() - .5) * .35;
    const out = polar(a, 1, 0), left = polar(a + TAU / 4, 1, 0);
    const length = (.36 + p.r() * .18) * scale;
    const height = (.22 + p.r() * .16) * scale;
    const point = (t) => sum(sum(origin, out, length * t), v(0, height * Math.sin(t * 1.98), 0));
    const path = [0, .22, .48, .75, .91, 1].map((t) => [...point(t), (.008 - .006 * t) * scale]);
    const tone = mix(0x497e42, 0x8ca953, p.r());
    const stem = shade(tone, .88);
    shoot(p, `frond-${j}`, path, { base: stem, dark: stem, light: stem }, { sides: 4, ground: true });
    for (let k = 0; k < 7; k++) {
      const t = .25 + k * .095;
      const center = point(t);
      const span = (.105 - .059 * t) * Math.sin(t * Math.PI) * scale;
      for (const side of [-1, 1]) {
        const end = sum(sum(center, left, span * side), out, span * .61);
        blade(p, `pinna-${j}-${k}-${side}`, center, end, span * .30, tone);
      }
    }
  }
}

function underbrush(p) {
  const bark = barks.oak;
  for (const [i, x, y, z, size, depth] of [[0, -.23, .23, -.18, .25, .22], [1, .20, .29, -.11, .30, .30], [2, .09, .16, .23, .26, .18], [3, -.19, .20, .14, .22, .19]]) {
    shoot(p, `brush-stem-${i}`, [[x * .45, 0, z * .45, .017], [x, y, z, .007]], bark, { sides: 5, ground: true });
    cluster(p, `brush-leaves-${i}`, v(x, y, z), [size, depth, size * .86], colors.shrub, .35 + p.r() * .55, { sides: 7, angle: p.r() * TAU });
  }
  for (let i = 0; i < 6; i++) {
    const angle = i * TAU / 6 + .36;
    const base = v(.26, .04, .13);
    const tip = sum(base, polar(angle, .16 + p.r() * .13, .06 + p.r() * .14));
    blade(p, `ground-leaf-${i}`, base, tip, .04, mix(0x537747, 0x839e4e, p.r()));
  }
  fern(p, v(-.30, 0, .29), .66, 5);
  for (const [i, x, z, h] of [[0, .39, .26, .105], [1, .32, .35, .070]]) {
    const stem = { base: 0xd0bc9b, light: 0xddcbae, dark: 0xaf997a };
    shoot(p, `mushroom-stem-${i}`, [[x, 0, z, h * .14], [x, h, z, h * .10]], stem, { sides: 5, ground: true });
    cluster(p, `mushroom-cap-${i}`, v(x, h, z), [h * .53, h * .25, h * .55], [0x8d583b, 0xad7550, 0xc58b57], .8, { sides: 7, style: 'fruit' });
  }
}

// --- flowers and garden plants (furniture) ---------------------------------------------------------
// Real size: they are about a person's scale. Stems are thin shoots, leaves and petals are blades,
// flower centres and buds are small clusters.

const GREEN = 0x4f7d3a;
const stemBark = (tone) => ({ base: tone, light: shade(tone, 1.12), dark: shade(tone, .86) });

/** A stem through points [x, y, z] (metres), radius `r`. */
function stem(p, name, pts, r = .006, tone = GREEN) {
  shoot(p, name, pts.map((q, i) => [...q, r * (1 - .5 * i / Math.max(1, pts.length - 1))]), stemBark(tone), { sides: 4, ground: true });
}

/** Leaves along a stem: alternating blades from points of the stem path. */
function leaves(p, name, at, { n = 4, len = .12, width = .025, tone = GREEN, droop = .3, spin = 0 } = {}) {
  for (let i = 0; i < n; i++) {
    const base = v(...at(i / Math.max(1, n - 1) * .8 + .1));
    const a = spin + i * 2.4;
    blade(p, `${name}${i}`, base, sum(base, polar(a, len, len * droop)), width, mix(tone, 0x6a9a48, (i % 3) / 4));
  }
}

/** A flower head: `n` petals radiating from `c` (cup lifts them), and a centre. */
function head(p, name, c, { n = 6, len = .04, width = .012, color, centre, cr = .01, cup = 0, tilt = 0 }) {
  for (let k = 0; k < n; k++) {
    const a = tilt + k * TAU / n;
    blade(p, `${name}-petal${k}`, c, sum(c, polar(a, len * (1 - cup * .5), len * cup)), width, mix(color, 0xffffff, (k % 2) * .08));
  }
  if (centre !== undefined) cluster(p, `${name}-centre`, c, [cr, cr * .8, cr], [centre, shade(centre, 1.1), shade(centre, 1.25)], .5, { sides: 6, style: 'fruit' });
}

const path = (pts) => (t) => {
  const f = t * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), k = f - i;
  return pts[i].map((q, j) => q + (pts[i + 1][j] - q) * k);
};

/** Clump: `count` plants scattered on the tile, each drawn by `one(origin, scale, i)`. */
function clump(p, count, spread, one) {
  for (let i = 0; i < count; i++) {
    const a = i * 2.39996 + p.r() * .5, d = spread * Math.sqrt((i + .5) / count);
    one(polar(a, d, 0), .8 + p.r() * .4, i);
  }
}

/** A low mound of foliage at the base of a clump, so a tile of flowers reads as a patch. */
function mound(p, name, r, h, tones = [0x3e6c2c, 0x4f7d3a, 0x6a9a48], style = 'shrub') {
  // Flat, spread lumps hugging the ground (not a few round balls).
  for (let k = 0; k < 5; k++) {
    const c = polar(k * TAU / 5 + .4, r * (k ? .62 : 0), h * .32);
    cluster(p, `${name}${k}`, c, [r * .42, h * .34, r * .4], tones, .3 + k * .12, { sides: 7, angle: k, style });
  }
}

function seedling(p, o = v(0, 0, 0), s = 1, name = 'sprout') {
  // A seed that has just sprouted: a short stem and two seed leaves.
  stem(p, `${name}-stem`, [[o.x, o.y, o.z], [o.x + .005, o.y + .06 * s, o.z]], .004 * s);
  const top = v(o.x + .005, o.y + .06 * s, o.z);
  for (const side of [-1, 1]) blade(p, `${name}-leaf${side}`, top, sum(top, v(side * .035 * s, .015 * s, .005)), .014 * s, 0x6aa040);
  cluster(p, `${name}-soil`, v(o.x, o.y + .011, o.z), [.04 * s, .012, .04 * s], [0x4a3626, 0x5a4230, 0x6a4e38], .5, { sides: 6, style: 'fruit' });
}

/** A slatted wooden garden planter, 0.9 m square, 0.4 m high, full of soil. */
function planter(p) {
  const wood = 0x8a6a44, H = .4;
  const slats = planks(`${p.id}-slats`, { wood, seam: shade(wood, .6), n: 1, vertical: false });
  for (const [n, b] of [['n', [-.45, 0, -.45, .45, H, -.4]], ['s', [-.45, 0, .4, .45, H, .45]], ['w', [-.45, 0, -.4, -.4, H, .4]], ['e', [.4, 0, -.4, .45, H, .4]]]) {
    // Drainage gaps: each wall is three slats.
    for (let k = 0; k < 3; k++) {
      const y0 = .02 + k * .13, y1 = y0 + .11;
      p.box(`wall-${n}${k}`, [b[0], y0, b[2], b[3], y1, b[5]], slats, { ppm: 64 });
    }
  }
  for (const [x, z] of [[-.45, -.45], [.4, -.45], [-.45, .4], [.4, .4]]) p.box(`post${x}${z}`, [x, 0, z, x + .05, H + .02, z + .05], flat(shade(wood, .8)), { ppm: 64 });
  p.box('soil', [-.4, H - .08, -.4, .4, H - .04, .4], (ctx, x, y, w, h) => { fill(ctx, x, y, w, h, 0x4a3626); const r = rng(`${p.id}soil`); for (let i = 0; i < w * h / 6; i++) fill(ctx, x + Math.floor(r() * w), y + Math.floor(r() * h), 1, 1, r() < .5 ? 0x5a4230 : 0x3a2a1e); }, { ppm: 48 });
  return H - .04;
}

const FLOWER_RECIPES = [
  { id: 'f_plant_seedling', desc: 'A seed that has just begun to sprout its first roots.', build: (p) => seedling(p) },
  { id: 'f_purple_loosestrife', desc: 'A pretty violet flower that likes water.  Unfortunately it is invasive and does not benefit the environment.', build: (p) => {
    // Upright wands, the top third crowded with magenta flower spikes.
    mound(p, 'base', .3, .35);
    clump(p, 7, .22, (o, s, i) => {
      const h = 1.0 * s, top = [o.x + .03, h, o.z];
      const at = path([[o.x, 0, o.z], [o.x + .02, h * .5, o.z], top]);
      stem(p, `wand${i}`, [[o.x, 0, o.z], [o.x + .02, h * .5, o.z], top], .007);
      leaves(p, `leaf${i}`, (t) => at(t * .6), { n: 4, len: .09, width: .018, droop: -.1, spin: i });
      for (let k = 0; k < 5; k++) {
        const y = h * (.66 + k * .07);
        cluster(p, `spike${i}-${k}`, v(o.x + .02 + .01 * (k / 5), y, o.z), [.03 - k * .003, .042, .03 - k * .003], [0x8a2a7a, 0xa83a92, 0xc85ab0], .3 + (k % 2) * .4, { sides: 5, style: 'birch' });
      }
    });
  } },
  { id: 'f_planter_seedling', desc: 'A garden planter full of soil and slatted to allow adequate drainage.  This one has a seed that has just begun to sprout its first roots.', build: (p) => {
    const y = planter(p);
    for (const [x, z] of [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2], [0, 0]]) seedling(p, v(x, y, z), 1.2, `sprout${x}${z}`);
  } },
  { id: 'f_lily', desc: 'A pretty flower that comes in a variety of colors.', build: (p) => {
    // Tall stalks with narrow leaves all the way up and trumpet flowers at the top.
    const colors = [0xe87aa0, 0xf4a0b8, 0xe05a86];
    mound(p, 'base', .22, .22);
    clump(p, 4, .14, (o, s, i) => {
      const h = .8 * s, pts = [[o.x, 0, o.z], [o.x - .02, h * .6, o.z + .01], [o.x - .01, h, o.z]];
      stem(p, `stalk${i}`, pts, .007);
      leaves(p, `leaf${i}`, path(pts), { n: 6, len: .1, width: .014, droop: .15, spin: i });
      for (let k = 0; k < 2; k++) {
        const c = v(o.x - .01 + (k ? .04 : -.03), h - k * .06, o.z + (k ? .02 : -.02));
        head(p, `bloom${i}-${k}`, c, { n: 6, len: .1, width: .03, color: colors[(i + k) % 3], centre: 0xc8a030, cr: .008, cup: .7, tilt: k });
      }
    });
  } },
  { id: 'f_dandelion', desc: 'A common weed with a yellow flower.  Produces seeds that get carried on the wind by thin, gray filaments.', build: (p) => {
    // A flat rosette of toothed leaves, flower stalks with yellow heads, and one seed clock.
    for (let k = 0; k < 10; k++) blade(p, `rosette${k}`, v(0, .01, 0), polar(k * TAU / 10 + .2, .17 + (k % 3) * .03, .025), .032, mix(0x4f7d3a, 0x6a9a48, (k % 3) / 3));
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1, top = sum(polar(a, .05, 0), v(0, .2 + i * .02, 0));
      stem(p, `stalk${i}`, [[0, 0, 0], [...top.toArray()]], .004, 0x6a8a3a);
      if (i < 2) head(p, `flower${i}`, top, { n: 14, len: .045, width: .014, color: 0xf0c020, centre: 0xe0a010, cr: .022, cup: .3, tilt: i });
      else cluster(p, 'seed-clock', top, [.035, .035, .035], [0xc8c8c0, 0xdcdcd4, 0xf0f0ea], .7, { sides: 8, style: 'birch' });
    }
  } },
  { id: 'f_flower_tulip', desc: 'A bright, colorful flower with petals forming a small cup at its top.  It can be poisonous to livestock.', build: (p) => {
    const colors = [0xd8283a, 0xf0b020, 0xe8508a, 0xf06030];
    clump(p, 7, .17, (o, s, i) => {
      const h = .4 * s, top = v(o.x, h, o.z);
      stem(p, `stem${i}`, [[o.x, 0, o.z], [o.x, h, o.z]], .005);
      for (const side of [-1, 1]) blade(p, `leaf${i}${side}`, v(o.x, .02, o.z), v(o.x + side * .07, .22 * s, o.z + .03 * side), .045, 0x5a8a50);
      // The cup: six petals standing up round a closed centre.
      head(p, `cup${i}`, top, { n: 6, len: .075, width: .034, color: colors[i % 4], cup: 1.6, tilt: i });
    });
  } },
  { id: 'f_lotus', desc: 'A lovely flower that grows on the surface of bodies of fresh water.  A traditional symbol of many Eastern cultures.', build: (p) => {
    // Round pads floating on the water and a flower held just above them.
    [[-.22, -.15, .2], [.18, .12, .24], [.2, -.24, .15], [-.15, .25, .17]].forEach(([x, z, r], i) => cluster(p, `pad${i}`, v(x, .01, z), [r, .01, r], [0x3a6a30, 0x4a7a38, 0x5e9244], .3 + i * .15, { sides: 9, style: 'beech' }));
    stem(p, 'stalk', [[0, 0, 0], [.02, .2, 0]], .008);
    head(p, 'bloom-outer', v(.02, .2, 0), { n: 8, len: .09, width: .03, color: 0xf2b8c8, cup: .7 });
    head(p, 'bloom-inner', v(.02, .21, 0), { n: 6, len: .06, width: .025, color: 0xf8d4dc, centre: 0xe8c840, cr: .02, cup: 1.4, tilt: .4 });
  } },
  { id: 'f_japanese_knotweed', desc: 'An invasive species originating from Japan.  The stem looks like it might contain some water.', build: (p) => {
    // Tall, hollow, bamboo-like canes with joints, zig-zagging, broad heart-shaped leaves.
    clump(p, 6, .28, (o, s, i) => {
      const h = 1.8 * s, pts = [[o.x, 0, o.z]];
      for (let k = 1; k <= 5; k++) pts.push([o.x + (k % 2 ? .04 : -.02) * k * .4, h * k / 5, o.z + (k % 2 ? .02 : -.03) * k * .3]);
      shoot(p, `cane${i}`, pts.map((q, k) => [...q, .016 * (1 - k / 7)]), { base: 0x6a8a3a, light: 0x8aa44a, dark: 0x8a3a30 }, { sides: 6, ground: true });
      pts.slice(1, -1).forEach((q, k) => cluster(p, `node${i}-${k}`, v(...q), [.02, .012, .02], [0x8a3a30, 0x9a4a38, 0xaa5a40], .5, { sides: 6, style: 'fruit' }));
      pts.slice(1).forEach((q, k) => { for (const side of [0, Math.PI]) blade(p, `leaf${i}-${k}-${side ? 'b' : 'a'}`, v(...q), sum(v(...q), polar(k * 2.4 + i + side + .6, .24, -.05)), .1, mix(0x4f7d3a, 0x6a9a48, (k + (side ? 1 : 0)) / 5)); });
    });
  } },
  { id: 'f_black_eyed_susan', desc: 'A mildly poisonous yellow flower with a dark ball in the middle.  Sometimes known as an ox-eye daisy.', build: (p) => {
    mound(p, 'base', .22, .2);
    clump(p, 7, .17, (o, s, i) => {
      const h = .6 * s, pts = [[o.x, 0, o.z], [o.x + .02, h * .5, o.z], [o.x + .01, h, o.z + .01]];
      stem(p, `stem${i}`, pts, .005);
      leaves(p, `leaf${i}`, (t) => path(pts)(t * .5), { n: 3, len: .09, width: .022, droop: .1, spin: i });
      head(p, `flower${i}`, v(...pts[2]), { n: 13, len: .06, width: .016, color: 0xf2b418, centre: 0x2a1a10, cr: .022, cup: -.2, tilt: i });
    });
  } },
  { id: 'f_flower_spurge', desc: 'A yellow-green flower that grows in densely-packed bushes.', build: (p) => {
    // A dense, rounded clump of stems topped with yellow-green bracts.
    mound(p, 'base', .26, .28, [0x4a7a3a, 0x5a8a44, 0x6e9a4a]);
    clump(p, 12, .2, (o, s, i) => {
      const h = .45 * s * (.8 + (i % 3) * .1), top = v(o.x * 1.1, h, o.z * 1.1);
      stem(p, `stem${i}`, [[o.x, 0, o.z], [...top.toArray()]], .004);
      leaves(p, `leaf${i}`, path([[o.x, 0, o.z], top.toArray()]), { n: 3, len: .05, width: .01, droop: .2, spin: i });
      cluster(p, `bracts${i}`, top, [.06, .035, .06], [0x9ab830, 0xb4c83a, 0xd0d850], .5, { sides: 7, style: 'birch' });
    });
  } },
  { id: 'f_bluebell', desc: 'A common bluebell flower.  Pretty.', build: (p) => {
    // Arching stems hung on one side with nodding blue bells; strap leaves at the base.
    for (let k = 0; k < 6; k++) blade(p, `strap${k}`, v(0, .005, 0), polar(k * TAU / 6, .16, .08), .015, 0x4a7a3a);
    clump(p, 6, .14, (o, s, i) => {
      const h = .3 * s, pts = [[o.x, 0, o.z], [o.x, h * .8, o.z], [o.x + .07, h, o.z + .02]];
      stem(p, `stem${i}`, pts, .004);
      for (let k = 0; k < 5; k++) {
        const q = path(pts)(.45 + k * .12);
        cluster(p, `bell${i}-${k}`, v(q[0] + .012, q[1] - .022, q[2]), [.017, .027, .017], [0x3a4ab0, 0x4a5ac8, 0x6a7ad8], .4, { sides: 6, style: 'fruit' });
      }
    });
  } },
  { id: 'f_chamomile', desc: 'A cute white flower with a yellow center, used to brew a soothing tea.', build: (p) => {
    // Feathery foliage and many small daisies.
    mound(p, 'base', .22, .14, [0x4f7d3a, 0x5e8a40, 0x76a050], 'hickory');
    clump(p, 12, .2, (o, s, i) => {
      const h = .3 * s, top = v(o.x + .02, h, o.z);
      stem(p, `stem${i}`, [[o.x, 0, o.z], [...top.toArray()]], .003);
            head(p, `daisy${i}`, top, { n: 10, len: .026, width: .009, color: 0xf6f6f0, centre: 0xe8b820, cr: .008, cup: -.2, tilt: i });
    });
  } },
  { id: 'f_dahlia', desc: 'A puffy flower with many tightly-layered petals.', build: (p) => {
    // A leafy bush with big pom-pom blooms: rings of petals packed round a dome.
    mound(p, 'base', .3, .5, [0x3e6c2c, 0x4f7d3a, 0x5e8a40], 'maple');
    clump(p, 4, .16, (o, s, i) => {
      const h = .9 * s, pts = [[o.x, 0, o.z], [o.x + .03, h * .5, o.z], [o.x + .02, h, o.z + .02]];
      stem(p, `stem${i}`, pts, .007);
      leaves(p, `leaf${i}`, path(pts), { n: 5, len: .11, width: .035, droop: .1, spin: i });
      const c = v(...pts[2]);
      cluster(p, `dome${i}`, c, [.06, .045, .06], [0x9a1e6a, 0xb82a80, 0xd04a98], .5, { sides: 8, style: 'beech' });
      for (let ring = 0; ring < 3; ring++) head(p, `ring${i}-${ring}`, sum(c, v(0, -ring * .012, 0)), { n: 10 + ring * 2, len: .06 + ring * .02, width: .022, color: mix(0xb82a80, 0xe060a8, ring / 3), cup: .9 - ring * .35, tilt: ring * .3 });
    });
  } },
  { id: 'f_planter_mature', desc: 'A garden planter full of soil and slatted to allow adequate drainage.  This one has a matured plant that should be ready for harvest before long.', build: (p) => {
    const y = planter(p);
    // A full, leafy crop with ripening fruit.
    for (const [x, z] of [[-.17, -.17], [.17, -.15], [-.15, .18], [.18, .17]]) {
      stem(p, `crop${x}${z}`, [[x, y, z], [x, y + .15, z]], .012);
      cluster(p, `foliage${x}${z}`, v(x, y + .2, z), [.2, .18, .2], [0x3e6c2c, 0x528a3a, 0x6aa048], .5, { sides: 8, style: 'maple' });
      cluster(p, `foliage-top${x}${z}`, v(x + .03, y + .34, z - .02), [.12, .11, .12], [0x4a7a34, 0x5e9440, 0x76a850], .6, { sides: 7, style: 'maple' });
      for (let k = 0; k < 3; k++) cluster(p, `fruit${x}${z}${k}`, v(x + (k - 1) * .09, y + .1 + (k % 2) * .06, z + .17), [.025, .025, .025], [0xb8281e, 0xd03a2a, 0xe85a40], .5, { sides: 6, style: 'fruit' });
    }
  } },
];

export const FLOWERS = FLOWER_RECIPES.map((recipe) => ({ ...recipe, dir: 'furniture', batchMesh: true, source: 'tools/cubeclysm/page/vegetation.js' }));

// --- furniture that grows or lies about: hedges, reeds, pot plants, rocks and rubble (low-poly) -------

/** A trimmed hedge: a squared block of foliage built from overlapping square-cut clusters. */
function hedge(p, height) {
  // A solid, square-cut core (it fills the tile so a row joins into a hedgerow) with low leafy
  // bumps on its faces and top, the way clipped box looks.
  const tones = [0x2e5a24, 0x3a6a2c, 0x4a7a34];
  const box = (name, [x0, y0, z0, x1, y1, z1], tone) => {
    const P = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]].map((q) => v(...q));
    const quads = [[0, 1, 5, 4, 'side-0-1'], [1, 2, 6, 5, 'side-1-1'], [2, 3, 7, 6, 'side-2-1'], [3, 0, 4, 7, 'side-3-1'], [4, 5, 6, 7, 'tip']];
    part(p, name, quads.map(([a, b, c, d, side]) => facet([P[a], P[d], P[c], P[b]], side)), leafPaint(`${p.id}:${name}`, tones, tone, 'elm', 2), 32); // wound outward
  };
  box('core', [-.4, .04, -.4, .4, height - .04, .4], .7);
  const r = rng(`${p.id}:bumps`);
  for (let i = 0; i < Math.round(height * 10); i++) {
    const face = i % 5, u = (r() - .5) * .8, y = .15 + r() * (height - .3);
    const c = face === 4 ? v(u * .9, height - .05, (r() - .5) * .7) : [v(u * .9, y, -.4), v(.4, y, u * .9), v(u * .9, y, .4), v(-.4, y, u * .9)][face];
    // Bumps stand out at most 0.1 m: the hedge stays inside its tile so rows join cleanly.
    cluster(p, `bump${i}`, c, [.1, .08, .1], tones, .3 + r() * .5, { sides: 5, angle: r() * TAU, style: 'elm' });
  }
  stem(p, 'trunk', [[0, 0, 0], [0, .1, 0]], .05, 0x4a3826);
}

/** A pot (`r` radius, `h` high) of terracotta with soil, returns the soil height. */
function pot(p, r, h, hex = 0xb05a3a) {
  shoot(p, 'pot', [[0, 0, 0, r * .72], [0, h * .8, 0, r * .95], [0, h, 0, r]], { base: hex, light: shade(hex, 1.12), dark: shade(hex, .82) }, { sides: 8, ground: true });
  cluster(p, 'soil', v(0, h - .01, 0), [r * .9, .012, r * .9], [0x3a2a1e, 0x4a3626, 0x2e2218], .5, { sides: 8, style: 'fruit' });
  return h;
}

const STONE = [0x7e7e7a, 0x929290, 0xa8a8a4];
/** A boulder: a big faceted rock with a few smaller facets stuck to it. */
function boulder(p, size) {
  cluster(p, 'rock', v(0, size * .42, 0), [size * .55, size * .45, size * .48], STONE, .5, { sides: 7, angle: .3, style: 'stone' });
  cluster(p, 'shoulder', v(size * .25, size * .3, -size * .12), [size * .32, size * .3, size * .3], STONE, .3, { sides: 6, angle: 1.2, style: 'stone' });
  cluster(p, 'moss', v(-size * .1, size * .82, size * .05), [size * .25, size * .06, size * .22], [0x4a6a2e, 0x5a7a36, 0x6a8a40], .5, { sides: 6, style: 'elm' });
}

/** A pile: `n` lumps of the given palettes heaped on the tile. */
function heap(p, name, n, spread, height, palettes, sizes = [.12, .26]) {
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996, d = spread * Math.sqrt((i + .5) / n), s = sizes[0] + p.r() * (sizes[1] - sizes[0]);
    const y = height * (1 - d / spread) * .7 + s * .6; // rests on the ground
    cluster(p, `${name}${i}`, sum(polar(a, d, 0), v(0, y, 0)), [s, s * .7, s * (.8 + p.r() * .3)], palettes[i % palettes.length], p.r(), { sides: 6, angle: a, style: 'stone' });
  }
}

const LOW_FURNITURE = [
  { id: 'f_hedge_short', desc: 'A shrub with small green leaves, trimmed into a squared shape.', build: (p) => hedge(p, .9) },
  { id: 'f_hedge_tall', desc: "A tall shrub with small green leaves, trimmed into a squared shape.  You can't see past this thick hedgerow.", build: (p) => hedge(p, 2.0) },
  { id: 'f_cattails', desc: 'This useful plant is available all year round.  Many parts of the plant are edible.', build: (p) => {
    // Tall reeds: strap leaves and stalks topped with brown, cigar-shaped heads.
    clump(p, 9, .3, (o, s, i) => {
      const h = 1.6 * s, top = v(o.x + .03, h, o.z);
      for (const side of [-1, 1]) blade(p, `leaf${i}${side}`, v(o.x, 0, o.z), v(o.x + side * .1, h * .85, o.z + .04 * side), .02, mix(0x5a7a3a, 0x7a9a48, (i % 3) / 3));
      if (i % 3 === 2) return;
      stem(p, `stalk${i}`, [[o.x, 0, o.z], [...top.toArray()]], .006, 0x6a8a3a);
      cluster(p, `head${i}`, sum(top, v(0, -.12, 0)), [.022, .08, .022], [0x5a3a22, 0x6a4628, 0x7a5430], .5, { sides: 6, style: 'fruit' });
    });
  } },
  { id: 'f_indoor_plant', desc: 'A small potted plant, used for decoration indoors.  It appears to have dried up and died a while ago.', build: (p) => {
    // 10 L pot; the plant has dried out: brown, drooping leaves on bare stems.
    const y = pot(p, .14, .26);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26, tip = sum(polar(a, .12, 0), v(0, y + .22 + (i % 2) * .08, 0));
      stem(p, `stem${i}`, [[0, y, 0], [...sum(polar(a, .04, 0), v(0, y + .15, 0)).toArray()], [...tip.toArray()]], .005, 0x6a5232);
      blade(p, `leaf${i}`, tip, sum(tip, polar(a + .3, .1, -.09)), .025, mix(0x8a6a3a, 0x6a5a32, i / 5));
    }
  } },
  { id: 'f_indoor_plant_y', desc: 'A decorative potted plant with a yellow flower, it looks to have wilted and died some time ago.', build: (p) => {
    const y = pot(p, .13, .24, 0xd8d4c8);
    for (let i = 0; i < 4; i++) blade(p, `leaf${i}`, v(0, y, 0), polar(i * 1.6, .16, y + .02), .03, mix(0x7a7a3a, 0x8a6a32, i / 4));
    // The flower stalk bent over, its yellow head hanging down and faded.
    stem(p, 'stalk', [[0, y, 0], [.02, y + .25, 0], [.1, y + .3, 0], [.15, y + .22, 0]], .005, 0x7a7a3a);
    head(p, 'flower', v(.15, y + .21, 0), { n: 7, len: .04, width: .014, color: 0xc8a840, centre: 0x8a6a2a, cr: .012, cup: -.8 });
  } },
  { id: 'f_boulder_small', desc: 'A big rock.  Should be easy to roll around, but too heavy to carry with you.', build: (p) => boulder(p, .55) },
  { id: 'f_boulder_medium', desc: 'A pretty big boulder, but still small enough to see and climb over.  It would be a struggle to move it.', build: (p) => boulder(p, 1.0) },
  { id: 'f_rubble', desc: 'A pile of various metals, bricks, and other building materials.  You could clear it with a shovel.', build: (p) => {
    heap(p, 'debris', 14, .3, .55, [[0x7e7a74, 0x8e8a84, 0x9e9a94], [0x9a4a32, 0xa85a3a, 0xb86a48], [0x6a6e72, 0x7a7e82, 0x8e9296], [0xa8a49c, 0xb8b4ac, 0xc8c4bc]]);
    // Bent rebar sticking out.
    for (const [i, x, z] of [[0, -.15, .1], [1, .2, -.05]]) shoot(p, `rebar${i}`, [[x, .2, z, .012], [x + .1, .5, z - .05, .01], [x + .25, .58, z - .1, .008]], { base: 0x6a4a3a, light: 0x8a5a42, dark: 0x4a3226 }, { sides: 4 });
  } },
  { id: 'f_rubble_rock', desc: 'A loose pile of rocks.  Useless?', build: (p) => heap(p, 'rock', 12, .3, .45, [STONE, [0x6e6e6a, 0x828280, 0x969694]], [.1, .22]) },
];

export const LOW_FURN = LOW_FURNITURE.map((recipe) => ({ ...recipe, dir: 'furniture', batchMesh: true, source: 'tools/cubeclysm/page/vegetation.js' }));

// Corrected sizes [height, crown width] in metres. Plants about a person's size are real size; grown
// trees are their real height compressed into CDDA's two levels (tree + treetop, 2 m each):
// h = 4.0 × (H / 22 m)^0.6, at least 2.8; crown width = the species' spread/height ratio × h,
// at most 3.6. Real heights: white pine 30 m, cottonwood 30, shagbark hickory 25, sugar maple 25,
// American elm 25, oak 22, American beech 20, paper birch 18, blackjack oak 9.
// width null = scale uniformly to the height.
const SIZE = {
  t_tree: [4.0, 3.6], t_tree_hickory: [4.3, 2.2], t_tree_blackjack: [2.8, 2.2], t_tree_pine: [4.8, 2.2],
  t_tree_birch: [3.5, 1.9], t_tree_maple: [4.3, 3.2], t_tree_beech: [3.8, 3.4], t_tree_cottonwood: [4.8, 3.6],
  t_tree_elm: [4.3, 3.6], t_tree_young: [2.6, 1.2], t_tree_hickory_dead: [3.7, null], t_tree_dead: [3.0, null],
  t_shrub: [1.0, 1.0], t_fern: [0.5, null],
};

/** Scale every facet so the model is `height` tall and `width` across (its larger horizontal extent). */
function fit(p, [height, width]) {
  const pts = p.blocks.flatMap((b) => b.faces.flatMap((f) => f.p));
  const lo = v(Infinity, Infinity, Infinity), hi = v(-Infinity, -Infinity, -Infinity);
  const seen = new Set();
  for (const q of pts) { lo.min(q); hi.max(q); }
  const sy = height / (hi.y - Math.min(0, lo.y));
  const sxz = width ? width / Math.max(hi.x - lo.x, hi.z - lo.z) : sy;
  for (const b of p.blocks) for (const f of b.faces) {
    for (const q of f.p) if (!seen.has(q)) { seen.add(q); q.set(q.x * sxz, q.y * sy, q.z * sxz); }
    if (f.normals) f.normals = f.normals.map((n) => v(n.x / sxz, n.y / sy, n.z / sxz).normalize());
    const [a, b2, c, d = c] = f.p;
    f.wm = Math.max(a.distanceTo(b2), c.distanceTo(d));
    f.hm = Math.max(b2.distanceTo(c), a.distanceTo(d));
  }
}

export const TREES = [
  { id: 't_treetop', desc: "The upper branches of a tree.  There's just enough room to perch here.", build: treetop },
  { id: 't_underbrush', desc: "Small plants and shrubs that decorate the forest.  An observant forager could obtain edible plants, acorns, eggs, and mushrooms from it.", build: underbrush },
  { id: 't_shrub', desc: "A small shrub.", build: shrub },
  { id: 't_tree', desc: "A massive deciduous tree belonging to the 'Quercus' genus, commonly found throughout the New England region.  If you look closely, you can see some acorns.", build: oak },
  { id: 't_tree_hickory', desc: "A tall deciduous tree of the 'Carya' genus.  You could look for hickory nuts if you examined the tree more closely.", build: hickory },
  { id: 't_tree_young', desc: "A relatively young sapling of an indeterminate species.", build: sapling },
  { id: 't_tree_blackjack', desc: "A deciduous tree of the genus 'Quercus', with bark cracked into rectangular black plates split by narrow orange fissures.", build: blackjack },
  { id: 't_tree_pine', desc: "A towering coniferous tree that belongs to the 'Pinus' genus, with the New England species varying from 'P. strobus', 'P. resinosa' and 'P. rigida'.", build: pine },
  { id: 't_fern', desc: "A short plant with thousands of leaves which grow in a fractal pattern from the stem.", build: fern },
  { id: 't_tree_birch', desc: "A tall deciduous tree of the 'Betula' genus, with the characteristic peeling bark.", build: birch },
  { id: 't_tree_maple', desc: "A large deciduous tree of the 'Acer' genus.  The leaves are distinctively shaped with five prongs.  It could be tapped in order to extract maple sap.", build: maple },
  { id: 't_tree_beech', desc: "A massive tree belonging to the 'Fagus' genus.  If you look closely, you can see some unharvested beech nuts.", build: beech },
  { id: 't_tree_cottonwood', desc: "A large tree belonging to the 'Populus' genus, commonly found throughout the New England region.  You see some cottonwood tree bolls that can be harvested.", build: cottonwood },
  { id: 't_tree_elm', desc: "A large tree belonging to the 'Ulmus' genus, commonly found throughout the New England region.", build: elm },
  { id: 't_tree_hickory_dead', desc: "The dead remnants of a tall deciduous tree of the 'Carya' genus.  Nothing useful can be foraged from this poor, dead tree.", build: snag },
  { id: 't_tree_dead', desc: "An indiscernible tree that has withered away due to weather, fire, or otherworldly causes.", build: deadTree },
].map((recipe) => ({
  ...recipe,
  build: SIZE[recipe.id] ? (p) => { recipe.build(p); fit(p, SIZE[recipe.id]); } : recipe.build,
  batchMesh: true, source: 'tools/cubeclysm/page/vegetation.js',
}));
