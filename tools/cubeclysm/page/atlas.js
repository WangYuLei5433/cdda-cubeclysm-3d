// Cubeclysm texturing: every block is a box whose six faces are painted into one atlas per model
// (nearest filtering, so the pixels stay crisp). A face gets pixels in proportion to its real size
// (PPM pixels per metre), so a torso has room for pockets and badges and a hand stays small.
import * as THREE from 'three';

export const PPM = 160;

/** Box faces: outward normal, and the image's right (u) and up (v) as seen from outside. */
const FACES = [
  { side: 'right', n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
  { side: 'left', n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { side: 'top', n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  { side: 'bottom', n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { side: 'back', n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { side: 'front', n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
];

/** The faces of a box (parent space): corners bottom-left, bottom-right, top-right, top-left. */
function boxFaces(box) {
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  return FACES.map((f) => {
    const n = new THREE.Vector3(...f.n), u = new THREE.Vector3(...f.u), v = new THREE.Vector3(...f.v);
    const ext = (a) => Math.abs(a.x) * size.x + Math.abs(a.y) * size.y + Math.abs(a.z) * size.z;
    const du = ext(u), dv = ext(v), depth = ext(n);
    const o = c.clone().addScaledVector(n, depth / 2);
    const P = (a, b) => o.clone().addScaledVector(u, (a - 0.5) * du).addScaledVector(v, (b - 0.5) * dv);
    return { side: f.side, p: [P(0, 0), P(1, 0), P(1, 1), P(0, 1)], wm: du, hm: dv };
  });
}

/**
 * A block: `box` (THREE.Box3 in `parent` space) painted by `paint(ctx, x, y, w, h, side)`.
 * Returns the block so callers can keep it; bake() turns all blocks into textured meshes.
 */
export function block(parent, name, box, paint, { ppm = PPM, glow = false, metal = false, cutout = false, glass = false, tint = false, haze = false, glowCut = false } = {}) {
  return { parent, name, box, paint, ppm, glow, metal, cutout, glass, tint, haze, glowCut };
}

/** Bake blocks into meshes with one shared atlas texture. Returns the atlas canvas. */
export function bake(blocks) {
  const GUT = 2, W = 1024;
  const faces = [];
  for (const b of blocks) {
    // Polygonal props can supply wound triangles or quads with dimensions in metres.
    for (const f of b.faces ?? boxFaces(b.box)) {
      f.w = Math.max(2, Math.round(f.wm * b.ppm));
      f.h = Math.max(2, Math.round(f.hm * b.ppm));
      f.block = b;
      faces.push(f);
    }
  }
  let x = 0, y = 0, row = 0;
  for (const f of [...faces].sort((a, b) => b.h - a.h)) {
    if (x + f.w + 2 * GUT > W) { x = 0; y += row; row = 0; }
    f.at = [x + GUT, y + GUT];
    x += f.w + 2 * GUT;
    row = Math.max(row, f.h + 2 * GUT);
  }
  const H = 2 ** Math.ceil(Math.log2(Math.max(16, y + row)));
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  for (const f of faces) {
    const [fx, fy] = f.at;
    ctx.save();
    ctx.beginPath(); ctx.rect(fx, fy, f.w, f.h); ctx.clip();
    f.block.paint(ctx, fx, fy, f.w, f.h, f.side);
    ctx.restore();
    // Gutters repeat the edge pixels, so nothing bleeds in at the seams.
    ctx.drawImage(canvas, fx, fy, f.w, 1, fx, fy - GUT, f.w, GUT);
    ctx.drawImage(canvas, fx, fy + f.h - 1, f.w, 1, fx, fy + f.h, f.w, GUT);
    ctx.drawImage(canvas, fx, fy - GUT, 1, f.h + 2 * GUT, fx - GUT, fy - GUT, GUT, f.h + 2 * GUT);
    ctx.drawImage(canvas, fx + f.w - 1, fy - GUT, 1, f.h + 2 * GUT, fx + f.w, fy - GUT, GUT, f.h + 2 * GUT);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.flipY = false;
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.LinearFilter;
  map.generateMipmaps = false;
  map.name = 'cubeclysm-atlas';
  const material = new THREE.MeshStandardMaterial({ name: 'cubeclysm', map, roughness: 0.9, metalness: 0 });
  // Glowing blocks (a headlamp's lens): the same atlas as their light.
  const glowing = new THREE.MeshStandardMaterial({ name: 'cubeclysm-glow', map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 1, roughness: 0.5, metalness: 0 });
  // Bare metal (armour plates): the same atlas, a little metallic and glossy.
  const metallic = new THREE.MeshStandardMaterial({ name: 'cubeclysm-metal', map, roughness: 0.42, metalness: 0.35 });
  // Cut-out blocks (chain-link mesh, leaves with gaps): pixels left transparent are holes.
  const cutout = new THREE.MeshStandardMaterial({ name: 'cubeclysm-cutout', map, roughness: 0.9, metalness: 0, alphaTest: 0.5, side: THREE.DoubleSide });
  // Glass: the atlas colour, see-through.
  const glassy = new THREE.MeshStandardMaterial({ name: 'cubeclysm-glass', map, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.45, depthWrite: false });
  // Tintable paint (a vehicle's body): a light neutral atlas colour an engine multiplies by the
  // material's colour (white = as painted), so one model takes any paint job.
  const paint = new THREE.MeshStandardMaterial({ name: 'cubeclysm-paint', map, roughness: 0.55, metalness: 0.15 });
  // Haze (smoke, gas, mist): the atlas colour, see-through and matte; overlapping puffs build up density.
  const haze = new THREE.MeshStandardMaterial({ name: 'cubeclysm-haze', map, roughness: 1, metalness: 0, transparent: true, opacity: 0.38, depthWrite: false });
  // Glowing haze (an electric cloud, plasma, glowing spores): see-through and lit by itself.
  const hazeGlow = new THREE.MeshStandardMaterial({ name: 'cubeclysm-haze-glow', map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 1, roughness: 1, metalness: 0, transparent: true, opacity: 0.5, depthWrite: false });
  // Glowing cut-out (a pool of light, a smear of congealed light): lit by itself, with holes.
  const glowCut = new THREE.MeshStandardMaterial({ name: 'cubeclysm-glow-cutout', map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 1, roughness: 0.6, metalness: 0, alphaTest: 0.5, side: THREE.DoubleSide });
  for (const b of blocks) {
    const pos = [], uv = [], normals = [];
    // Where each face of the block sits in the atlas, [x, y, w, h] as fractions, y down (image
    // rows): engines that draw a wall with their own geometry take its faces from here.
    b.atlasRects = {};
    for (const f of faces.filter((g) => g.block === b)) {
      const [px, py] = f.at;
      b.atlasRects[f.side] = [px / W, py / H, f.w / W, f.h / H].map((n) => +n.toFixed(6));
      const uvs = [[px, py + f.h], [px + f.w, py + f.h], [px + f.w, py], [px, py]].map(([a, c]) => [a / W, c / H]);
      for (const k of f.p.length === 3 ? [0, 1, 2] : [0, 1, 2, 0, 2, 3]) {
        pos.push(...f.p[k]);
        uv.push(...uvs[k]);
        if (f.normals) normals.push(...f.normals[k]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (normals.length === pos.length) g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    else g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, b.haze ? (b.glow ? hazeGlow : haze) : b.glowCut ? glowCut : b.glow ? glowing : b.tint ? paint : b.metal ? metallic : b.cutout ? cutout : b.glass ? glassy : material);
    mesh.name = `block_${b.name}`;
    b.parent.add(mesh);
  }
  return canvas;
}
