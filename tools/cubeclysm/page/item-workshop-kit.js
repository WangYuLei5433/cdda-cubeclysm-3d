import { ShapeUtils, Vector2 } from 'three';
import { add, V } from './lowpoly.js';

function face(points, normal, side) {
  const [a, b, c, d = c] = points;
  const actual = b.clone().sub(a).cross(c.clone().sub(a));
  return {
    p: actual.dot(normal) < 0 ? [...points].reverse() : points,
    side,
    wm: Math.max(a.distanceTo(b), c.distanceTo(d), .01),
    hm: Math.max(b.distanceTo(c), a.distanceTo(d), .01),
  };
}

/** Extrude the traced outline of a flat prop, including any actual cutouts. */
export function cutShape(p, name, boundary, depth, paint, y = 0, holes = []) {
  const asVectors = (points) => points.map(([x, z]) => new Vector2(x, z));
  const contour = asVectors(boundary);
  const cutouts = holes.map(asVectors);
  const triangles = ShapeUtils.triangulateShape(contour, cutouts);
  const points = [contour, ...cutouts].flat();
  const faces = [];
  for (const [i, triangle] of triangles.entries()) {
    const [a, b, c] = triangle.map(j => points[j]);
    const area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    if (Math.abs(area) < 1e-10) continue;
    for (const [height, sign] of [[y, -1], [y + depth, 1]]) {
      faces.push(face([a,b,c].map(v => V(v.x, height, v.y)), V(0, sign, 0), `cap-${sign}-${i}`));
    }
  }
  for (const [loopIndex, loop] of [contour, ...cutouts].entries()) {
    const sign = (ShapeUtils.isClockWise(loop) ? -1 : 1) * (loopIndex === 0 ? 1 : -1);
    for (const [i, a] of loop.entries()) {
      const b = loop[(i + 1) % loop.length];
      const vertices = [V(a.x, y, a.y), V(b.x, y, b.y), V(b.x, y + depth, b.y), V(a.x, y + depth, a.y)];
      faces.push(face(vertices, V(sign * (b.y - a.y), 0, sign * (a.x - b.x)), `edge-${loopIndex}-${i}`));
    }
  }
  add(p, name, faces, paint);
}

/** Revolve a cross section around Y. Travel up the exterior, over the rim and down the inside. */
export function profile(p, name, section, paint, { sides = 14, at = [0, 0], scale = [1, 1], ...material } = {}) {
  const faces = [];
  for (let i = 0; i < section.length - 1; i++) {
    const [r0, y0] = section[i];
    const [r1, y1] = section[i + 1];
    if (r0 === 0 && r1 === 0) continue;
    const point = (r, y, angle) => V(at[0] + r * Math.cos(angle) * scale[0], y, at[1] + r * Math.sin(angle) * scale[1]);
    for (let j = 0; j < sides; j++) {
      const a = Math.PI * 2 * j / sides;
      const b = Math.PI * 2 * (j + 1) / sides;
      const angle = (a + b) / 2;
      const normal = V((y1 - y0) * Math.cos(angle), r0 - r1, (y1 - y0) * Math.sin(angle));
      const points = [point(r0, y0, a), point(r0, y0, b), point(r1, y1, b), point(r1, y1, a)];
      if (r0 === 0) points.splice(0, 1);
      if (r1 === 0) points.pop();
      faces.push(face(points, normal, `profile-${i}-${j}`));
    }
  }
  add(p, name, faces, paint, material);
}

export function oval(x, z, rx, rz, sides = 10) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = i * Math.PI * 2 / sides;
    return [x + rx * Math.cos(angle), z + rz * Math.sin(angle)];
  });
}
