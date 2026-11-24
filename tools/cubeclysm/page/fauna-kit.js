// Shared organic surfaces and articulated shapes for Cubeclysm fauna.
import { V, add, hull, pane } from './lowpoly.js';
import { blob, tube, fill, flat, shade, rng, speckle } from './item-kit.js';

export { V, blob, hull, flat, shade };
export const sides = [-1, 1];
export const ink = flat(0x17151a);
export const ivory = flat(0xe0d3b4);
export const fur = (color, seed) => speckle(seed, color, [shade(color, .82), shade(color, 1.17)], .27);

export function chain(p, name, joints, radii, paint, facets = 6) {
  for (let i = 1; i < joints.length; i++) {
    tube(p, name + i, V(...joints[i - 1]), V(...joints[i]), radii[i - 1], radii[i], facets, paint);
  }
}

/** A tapered organic part with a continuous surface and a consistent paint coordinate per facet. */
export function skin(p, name, profile, paint, facets = 10, level = false) {
  const points = profile.map(([x, y, z]) => V(x, y, z));
  const rings = profile.map(([, , , width, height], i) => {
    const c = points[i];
    const d = points[Math.min(i + 1, points.length - 1)].clone().sub(points[Math.max(0, i - 1)]).normalize();
    const h = (Math.abs(d.x) > .93 ? V(0, 0, 1) : V(1, 0, 0)).addScaledVector(d, Math.abs(d.x) > .93 ? -d.z : -d.x).normalize();
    if (level) h.set(d.z, 0, -d.x).normalize();
    const v = d.clone().cross(h);
    return Array.from({ length: facets }, (_, k) => {
      const a = k * Math.PI * 2 / facets;
      return c.clone().addScaledVector(h, Math.cos(a) * width).addScaledVector(v, Math.sin(a) * height);
    });
  });
  const faces = [];
  const push = (points, side, out) => {
    const [a, b, c, d = c] = points;
    const normal = b.clone().sub(a).cross(c.clone().sub(a));
    faces.push({
      p: normal.dot(out) < 0 ? [...points].reverse() : points,
      side, wm: Math.max(.005, a.distanceTo(b), c.distanceTo(d)), hm: Math.max(.005, b.distanceTo(c), a.distanceTo(d)),
    });
  };
  for (let k = 0; k < facets; k++) {
    const l = (k + 1) % facets;
    push([points[0], rings[0][k], rings[0][l]], 'cap', points[0].clone().sub(points[1]));
    for (let i = 1; i < points.length; i++) {
      const a = rings[i - 1][k], b = rings[i - 1][l], c = rings[i][l], d = rings[i][k];
      const out = a.clone().add(b).add(c).add(d).addScaledVector(points[i - 1], -2).addScaledVector(points[i], -2);
      push([a, b, c, d], `${i - 1}:${k}`, out);
    }
    const j = points.length - 1;
    push([points[j], rings[j][k], rings[j][l]], 'cap', points[j].clone().sub(points[j - 1]));
  }
  add(p, name, faces, paint);
}

/** Markings follow the body rather than restarting on every triangle. */
export function markings(id, back, belly, kind = '', accent = shade(back, .55), facets = 10) {
  return (ctx, x, y, w, h, label) => {
    const [i, j] = label.split(':').map(Number);
    const u = Math.sin((j + .5) * Math.PI * 2 / facets);
    const surface = u < -.06 ? belly : back;
    const rand = rng(`${id}-${label}`);
    fill(ctx, x, y, w, h, surface);
    for (let k = 0; k < w * h * .15; k++) {
      fill(ctx, x + Math.floor(rand() * w), y + Math.floor(rand() * h), 1, 1, shade(surface, .8 + rand() * .39));
    }
    if (kind === 'bands' && i % 2 === 0) fill(ctx, x, y + h * .21, w, Math.max(1, h * .28), accent);
    if (kind === 'stripe' && u > .75) fill(ctx, x, y, w, h, accent);
    if (kind === 'lines' && j % 2 === 0) fill(ctx, x + w * .2, y, Math.max(1, w * .2), h, accent);
    if (kind === 'rings' && i % 2 === 0) fill(ctx, x, y, w, h, accent);
    if (kind === 'spots' || kind === 'patches' || kind === 'static' || kind === 'palette' || kind === 'calico' || kind === 'calico-kitten') {
      const calico = kind==='calico'||kind==='calico-kitten';
      const colors = calico ? (kind==='calico'?[0xb56b3c,0x302b33,0xd8c9b7]:[0xb39473,0x746e73,0xe0d1bf]) : kind === 'palette' ? [0x49b8a9, 0xfa574e, 0xe7d340, 0x7d65dc] : kind === 'static' ? [0x242126, 0xf1f0e8, 0x5e6769] : [accent, shade(accent, 1.3)];
      const count = kind === 'static' ? 8 : kind === 'patches' || calico ? 2 : 4;
      const size = kind === 'patches' || calico ? .47 : kind === 'static' ? .12 : .23;
      for (let k = 0; k < count; k++) {
        const a = Math.floor(rand() * w), b = Math.floor(rand() * h);
        fill(ctx, x + a, y + b, Math.min(w - a, Math.max(1, w * size)), Math.min(h - b, Math.max(1, h * size)), colors[Math.floor(rand() * colors.length)]);
      }
    }
  };
}

export function eye(p, name, [x, y, z], r, color = 0x292126, slit = false) {
  const s = Math.sign(x) || 1;
  blob(p, name, [r * .57, r, r], [x, y, z], flat(color), {}, 3, 7);
  blob(p, name + '-pupil', [r * .19, r * .65, r * (slit ? .2 : .56)], [x + s * r * .48, y, z - r * .12], ink, {}, 2, 6);
  if (color !== 0x090809) blob(p, name + '-reflection', [r * .13, r * .18, r * .18], [x + s * r * .6, y + r * .34, z - r * .31], flat(0xe4d9bc), {}, 2, 5);
}

export function blade(p, name, a, b, c, d, paint, thick = .014, options = {}) {
  pane(p, name, [a, b, c, d].map((q) => V(...q)), thick, paint, options);
}

export function solidVolume(blocks) {
  let volume = 0;
  for (const { faces } of blocks) {
    if (!faces) continue;
    let signed = 0;
    for (const { p } of faces) for (let k = 1; k < p.length - 1; k++) {
      signed += p[0].dot(p[k].clone().cross(p[k + 1]));
    }
    volume += Math.abs(signed) / 6;
  }
  return volume;
}
