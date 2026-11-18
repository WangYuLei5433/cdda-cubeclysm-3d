// Low-poly building blocks for hard-surface props (vehicles): flat-shaded facets baked into the
// same nearest-neighbour atlas as the block props. A part is a list of facets (triangles or
// quads, wound counter-clockwise seen from outside) pushed straight into the prop's blocks.
import { Vector3 } from 'three';
import { ConvexHull } from 'three/addons/math/ConvexHull.js';

export const V = (x, y, z) => new Vector3(x, y, z);

function facet(points, side) {
  const [a, b, c, d = c] = points;
  return { p: points, side, wm: Math.max(a.distanceTo(b), c.distanceTo(d), .01), hm: Math.max(b.distanceTo(c), a.distanceTo(d), .01) };
}
/** Wind a polygon so its normal points along `out`. */
function orient(points, out) {
  const n = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));
  return n.dot(out) < 0 ? [...points].reverse() : points;
}
/** Push facets as one part. opts: parent, at (subtracted from every point: the parent's origin), tint, glass, metal, glow, cutout, ppm. */
export function add(p, name, faces, paint, opts = {}) {
  if (opts.at) { const o = V(...opts.at); for (const f of faces) f.p = f.p.map((q) => q.clone().sub(o)); }
  p.blocks.push({ parent: opts.parent ?? p.root, name, faces, paint, ppm: opts.ppm ?? p.ppm ?? 64, tint: opts.tint, glass: opts.glass, metal: opts.metal, glow: opts.glow, cutout: opts.cutout });
}

/** The convex hull of points, as triangles. */
export function hull(p, name, points, paint, opts = {}) {
  const h = new ConvexHull().setFromPoints(points);
  const faces = h.faces.map((f, i) => {
    const vs = [];
    let e = f.edge;
    do { vs.push(e.head().point.clone()); e = e.next; } while (e !== f.edge);
    return facet(orient(vs, f.normal), `h${i}`);
  });
  add(p, name, faces, paint, opts);
}
/** A box with every edge chamfered by `b`. */
export function bevel(p, name, [x0, y0, z0, x1, y1, z1], b, paint, opts = {}) {
  const pts = [];
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) {
    const sx = x === x0 ? b : -b, sy = y === y0 ? b : -b, sz = z === z0 ? b : -b;
    pts.push(V(x + sx, y, z + sz), V(x, y + sy, z + sz), V(x + sx, y + sy, z));
  }
  hull(p, name, pts, paint, opts);
}
/**
 * A cylinder (prism of `sides`) along `axis` ('x' | 'y' | 'z') through `c`; r0 at the low end, r1 at
 * the high end. Built from whole side quads and two capped ends, so a texture (a label, threads)
 * runs straight along each side. opts.open leaves the ends off (a label round a bottle).
 */
export function cyl(p, name, axis, c, r0, len, sides, paint, opts = {}, r1 = r0, turn = Math.PI / sides) {
  const at = (t, r, k) => {
    const a = turn + (k * 2 * Math.PI) / sides, u = Math.cos(a) * r, w = Math.sin(a) * r;
    return axis === 'x' ? V(c[0] + t, c[1] + u, c[2] + w) : axis === 'y' ? V(c[0] + u, c[1] + t, c[2] + w) : V(c[0] + u, c[1] + w, c[2] + t);
  };
  const dir = axis === 'x' ? V(1, 0, 0) : axis === 'y' ? V(0, 1, 0) : V(0, 0, 1);
  const centre = V(...c), faces = [];
  for (let k = 0; k < sides; k++) {
    const q = [at(-len / 2, r0, k), at(-len / 2, r0, k + 1), at(len / 2, r1, k + 1), at(len / 2, r1, k)];
    const mid = q.reduce((s, v) => s.add(v), V(0, 0, 0)).multiplyScalar(.25);
    const out = mid.clone().sub(centre); out.addScaledVector(dir, -out.dot(dir));
    faces.push(facet(orient(q, out), `side${k}`));
  }
  for (const [t, r, sgn] of opts.open ? [] : [[-len / 2, r0, -1], [len / 2, r1, 1]]) {
    if (r <= 0) continue;
    const mid = centre.clone().addScaledVector(dir, t);
    for (let k = 0; k < sides; k++) faces.push(facet(orient([mid, at(t, r, k), at(t, r, k + 1)], dir.clone().multiplyScalar(sgn)), `end${sgn}`));
  }
  add(p, name, faces, paint, opts);
}
/** A thin panel through four corner points (any order round the edge), `t` thick along its normal. */
export function pane(p, name, corners, t, paint, opts = {}) {
  // Whole quads (not hull triangles), so a texture (wire mesh, gauges) runs straight across each face.
  const n = corners[1].clone().sub(corners[0]).cross(corners[2].clone().sub(corners[0])).normalize();
  const h = n.clone().multiplyScalar(t / 2), A = corners.map((q) => q.clone().add(h)), B = corners.map((q) => q.clone().sub(h));
  const faces = [facet(orient(A, n), 'front'), facet(orient(B, n.clone().negate()), 'back')];
  const c = corners.reduce((s, q) => s.add(q), V(0, 0, 0)).multiplyScalar(1 / corners.length);
  for (let i = 0; i < corners.length; i++) {
    const j = (i + 1) % corners.length, mid = corners[i].clone().add(corners[j]).multiplyScalar(.5);
    faces.push(facet(orient([A[i], A[j], B[j], B[i]], mid.sub(c)), `edge${i}`));
  }
  add(p, name, faces, paint, opts);
}
/** A flat polygon (convex, 3–4 points) wound to face `out`. */
export function poly(p, name, points, out, paint, opts = {}) {
  add(p, name, [facet(orient(points, out), 'poly')], paint, opts);
}

/**
 * Sweep a closed profile along a path in the ground plane. The profile is [d, y] points: d is the
 * offset inward (towards `centre`) from the path, y the height. The path is [x, z] points; corners
 * are mitred. Ends are open (body pieces meet their neighbours there); opts.caps closes them.
 */
export function sweep(p, name, profile, path, paint, opts = {}) {
  const [cx, cz] = opts.centre ?? [0, 0];
  const segN = [];
  for (let i = 0; i + 1 < path.length; i++) {
    const [ax, az] = path[i], [bx, bz] = path[i + 1];
    let nx = -(bz - az), nz = bx - ax;
    const l = Math.hypot(nx, nz); nx /= l; nz /= l;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (nx * (cx - mx) + nz * (cz - mz) < 0) { nx = -nx; nz = -nz; }
    segN.push([nx, nz]);
  }
  const mit = path.map((_, i) => {
    const a = segN[Math.max(0, i - 1)], b = segN[Math.min(segN.length - 1, i)];
    let mx = a[0] + b[0], mz = a[1] + b[1];
    const l = Math.hypot(mx, mz); mx /= l; mz /= l;
    const k = mx * a[0] + mz * a[1];
    return [mx / k, mz / k];
  });
  const at = (i, [d, y]) => V(path[i][0] + mit[i][0] * d, y, path[i][1] + mit[i][1] * d);
  // Profile winding: outward normal of each profile edge in (d, y) space.
  let area = 0;
  for (let k = 0; k < profile.length; k++) { const [d0, y0] = profile[k], [d1, y1] = profile[(k + 1) % profile.length]; area += d0 * y1 - d1 * y0; }
  const faces = [];
  for (let i = 0; i + 1 < path.length; i++) {
    const [nx, nz] = segN[i];
    for (let k = 0; k < profile.length; k++) {
      const a = profile[k], b = profile[(k + 1) % profile.length];
      let od = b[1] - a[1], oy = -(b[0] - a[0]);
      if (area < 0) { od = -od; oy = -oy; }
      // +d runs along the inward normal n, so a profile direction (od, oy) is n·od + up·oy in 3D.
      const out = V(nx * od, oy, nz * od);
      faces.push(facet(orient([at(i, a), at(i + 1, a), at(i + 1, b), at(i, b)], out), `s${i}-${k}`));
    }
  }
  if (opts.caps) {
    const cd = profile.reduce((s, q) => s + q[0], 0) / profile.length, cy = profile.reduce((s, q) => s + q[1], 0) / profile.length;
    for (const [i, j] of [[0, 1], [path.length - 1, path.length - 2]]) {
      const out = V(path[i][0] - path[j][0], 0, path[i][1] - path[j][1]);
      const mid = at(i, [cd, cy]);
      for (let k = 0; k < profile.length; k++) faces.push(facet(orient([mid, at(i, profile[k]), at(i, profile[(k + 1) % profile.length])], out), `cap${i}-${k}`));
    }
  }
  add(p, name, faces, paint, opts);
}
