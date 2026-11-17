// Cubeclysm, the library's main character style: every body part of a DEADWOOD character or
// zombie becomes a box sized to the part, textured from a pixel atlas. Clothes are the original
// colours under each cell (a ray cast inward), reduced to a few flat blocks; heads are cubes on a
// short neck with a printed toy-figure face. The DEADWOOD originals stay as the reference.
//   - the head is square (width = depth);
//   - hands are separate mitten blocks (a zombie's forearm-and-hand mesh is cut in two);
//   - a zombie's one-piece leg is cut into thigh, shin and foot;
//   - overlays on a part (hair, eyes, clothes over skin) are sampled with it, not boxed apart.
import * as THREE from 'three';

import { composeFace } from '/cubeclysm/faces.js';

const CELL = 0.05;
/** Texture pixels per cell: body parts stay chunky, heads get room for a drawn face. */
const BODY_PX = 4;
const HEAD_PX = 16;
/** Flat colours per part (k-means over its cells): big colour blocks, not shading. */
const COLORS_PER_PART = 4;
/** Head side as a share of the torso's width (Unturned-like: the head is narrower than the shoulders). */
const HEAD_OF_TORSO = 0.76;
const HEAD_MAX = 0.38;
/** The neck between torso and head: height (m) and width as a share of the head. */
const NECK = 0.02;
const NECK_OF_HEAD = 0.62;
/** Zombie legs are about 10 cm longer than the survivors': shortened from the hip down. */
const ZOMBIE_LEG = 0.8;
const raycaster = new THREE.Raycaster();

/** Per-axis 3–97 % range of the vertices (parent space) whose y lies in [y0, y1). */
function partBounds(points, y0 = -Infinity, y1 = Infinity) {
  const sel = points.filter((p) => p.y >= y0 && p.y < y1);
  if (sel.length < 4) return null;
  const range = (axis) => {
    const v = sel.map((p) => p[axis]).sort((a, b) => a - b);
    return [v[Math.floor(v.length * 0.03)], v[Math.ceil(v.length * 0.97) - 1]];
  };
  const [x, y, z] = ['x', 'y', 'z'].map(range);
  return new THREE.Box3(new THREE.Vector3(x[0], y[0], z[0]), new THREE.Vector3(x[1], y[1], z[1]));
}

/** Vertices of meshes in the space of `parent`. */
function pointsIn(meshes, parent) {
  const inv = parent.matrixWorld.clone().invert();
  const out = [];
  for (const m of meshes) {
    const pos = m.geometry.attributes.position, mat = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
    for (let i = 0; i < pos.count; i++) out.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mat));
  }
  return out;
}

/** The colour a mesh shows at a ray hit: its face's vertex colours times the material colour. */
function hitColor(hit) {
  const m = hit.object, mat = [m.material].flat()[hit.face.materialIndex ?? 0] ?? [m.material].flat()[0];
  const c = new THREE.Color(1, 1, 1);
  const col = m.geometry.attributes.color;
  if (col && mat.vertexColors) {
    const a = new THREE.Color().fromBufferAttribute(col, hit.face.a), b = new THREE.Color().fromBufferAttribute(col, hit.face.b), d = new THREE.Color().fromBufferAttribute(col, hit.face.c);
    c.setRGB((a.r + b.r + d.r) / 3, (a.g + b.g + d.g) / 3, (a.b + b.b + d.b) / 3);
  }
  if (mat.color) c.multiply(mat.color);
  return c;
}

const FACES = [
  { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] }, { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] }, { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
];

/**
 * A box (parent space) as a grid of flat-coloured quads; each cell's colour is cast from just
 * outside the box straight in at `targets` (world space). Cells that hit nothing take the
 * colour of the nearest cell that did (then the part's average).
 */
function gridBox(box, parent, targets, { cells = 0, paint = null } = {}) {
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const faces = [];
  const world = parent.matrixWorld, normalM = new THREE.Matrix3().getNormalMatrix(world);
  const quads = [];
  for (const [fi, f] of FACES.entries()) {
    const n = new THREE.Vector3(...f.n), u = new THREE.Vector3(...f.u), v = new THREE.Vector3(...f.v);
    const ext = (a) => Math.abs(a.x) * size.x + Math.abs(a.y) * size.y + Math.abs(a.z) * size.z;
    const du = ext(u), dv = ext(v), depth = ext(n);
    const nu = cells || Math.max(1, Math.round(du / CELL)), nv = cells || Math.max(1, Math.round(dv / CELL));
    const origin = center.clone().addScaledVector(n, depth / 2);
    const F = (a, b) => origin.clone().addScaledVector(u, (a - 0.5) * du).addScaledVector(v, (b - 0.5) * dv);
    const face = { p: [F(0, 0), F(1, 0), F(1, 1), F(0, 1)], nu, nv, cells: new Array(nu * nv) };
    faces.push(face);
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const a = origin.clone().addScaledVector(u, (i / nu - 0.5) * du).addScaledVector(v, (j / nv - 0.5) * dv);
        const corner = (di, dj) => a.clone().addScaledVector(u, (di * du) / nu).addScaledVector(v, (dj * dv) / nv);
        const mid = corner(0.5, 0.5);
        if (paint) {
          quads.push({ face, i, j, c: paint(fi, i, j, nu, nv), mid });
          continue;
        }
        // Cast from a little outside the face, straight in, through the whole part.
        const from = mid.clone().addScaledVector(n, 0.06).applyMatrix4(world);
        const dir = n.clone().negate().applyMatrix3(normalM).normalize();
        raycaster.set(from, dir);
        raycaster.far = depth + 0.12;
        const hit = raycaster.intersectObjects(targets, false)[0];
        quads.push({ face, i, j, c: hit ? hitColor(hit) : null, mid });
      }
    }
  }
  const hits = quads.filter((q) => q.c);
  if (!paint) quantize(hits.map((q) => q.c), COLORS_PER_PART);
  const avg = hits.length ? hits.reduce((s, q) => s.add(q.c), new THREE.Color(0, 0, 0)).multiplyScalar(1 / hits.length) : new THREE.Color(0.6, 0.6, 0.6);
  for (const q of quads) {
    if (!q.c) {
      let best = null, bd = Infinity;
      for (const h of hits) { const d = h.mid.distanceToSquared(q.mid); if (d < bd) { bd = d; best = h; } }
      q.c = best && bd < 0.01 ? best.c : avg;
    }
    q.face.cells[q.j * q.face.nu + q.i] = q.c;
  }
  return faces;
}

/**
 * Turn the blocks' painted faces into textured boxes: every face becomes one quad whose pixels
 * (one per cell) go into a single atlas per model, drawn with nearest filtering, so faces and
 * clothes are a 2D pixel texture an artist can repaint.
 */
function textureBlocks(blocks) {
  const faces = blocks.flatMap((b) => b.faces);
  for (const f of faces) { f.scale ??= BODY_PX; f.w = f.nu * f.scale; f.h = f.nv * f.scale; }
  const W = 512, GUT = 2;
  let x = 0, y = 0, row = 0;
  for (const f of [...faces].sort((a, b) => b.h - a.h)) {
    const w = f.w + 2 * GUT, h = f.h + 2 * GUT;
    if (x + w > W) { x = 0; y += row; row = 0; }
    f.at = [x + GUT, y + GUT];
    x += w; row = Math.max(row, h);
  }
  const H = 2 ** Math.ceil(Math.log2(Math.max(8, y + row)));
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  for (const f of faces) {
    const k = f.scale;
    for (let i = 0; i < f.nu; i++) {
      for (let j = 0; j < f.nv; j++) {
        ctx.fillStyle = `#${f.cells[j * f.nu + i].getHexString()}`;
        const row = f.nv - 1 - j;
        // Edge cells also fill the gutter, so nothing bleeds in at the seams.
        const x0 = f.at[0] + i * k - (i === 0 ? GUT : 0), y0 = f.at[1] + row * k - (row === 0 ? GUT : 0);
        const w = k + (i === 0 ? GUT : 0) + (i === f.nu - 1 ? GUT : 0), h = k + (row === 0 ? GUT : 0) + (row === f.nv - 1 ? GUT : 0);
        ctx.fillRect(x0, y0, w, h);
      }
    }
    if (f.draw) { ctx.save(); ctx.beginPath(); ctx.rect(f.at[0], f.at[1], f.w, f.h); ctx.clip(); f.draw(ctx, f.at[0], f.at[1], f.w, f.h); ctx.restore(); }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.flipY = false;
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.LinearFilter;
  map.generateMipmaps = false;
  map.name = 'blocky-atlas';
  const material = new THREE.MeshStandardMaterial({ name: 'blocky', map, roughness: 0.9, metalness: 0 });
  for (const b of blocks) {
    const pos = [], uv = [];
    for (const f of b.faces) {
      const [px, py] = f.at;
      const uvOf = [[px, py + f.h], [px + f.w, py + f.h], [px + f.w, py], [px, py]].map(([a, c]) => [a / W, c / H]);
      for (const k of [0, 1, 2, 0, 2, 3]) { pos.push(f.p[k].x, f.p[k].y, f.p[k].z); uv.push(...uvOf[k]); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    b.mesh.geometry = g;
    b.mesh.material = material;
  }
  return canvas;
}

/** Reduce colours in place to k flat ones (k-means in RGB, deterministic start). */
function quantize(colors, k) {
  if (colors.length <= k) return;
  const sorted = [...colors].sort((a, b) => a.getHSL({}).l - b.getHSL({}).l);
  let centers = Array.from({ length: k }, (_, i) => sorted[Math.floor(((i + 0.5) / k) * sorted.length)].clone());
  const near = (c) => { let bi = 0, bd = Infinity; centers.forEach((m, i) => { const d = (m.r - c.r) ** 2 + (m.g - c.g) ** 2 + (m.b - c.b) ** 2; if (d < bd) { bd = d; bi = i; } }); return bi; };
  for (let it = 0; it < 8; it++) {
    const sum = centers.map(() => [0, 0, 0, 0]);
    for (const c of colors) { const s = sum[near(c)]; s[0] += c.r; s[1] += c.g; s[2] += c.b; s[3]++; }
    centers = centers.map((m, i) => (sum[i][3] ? new THREE.Color(sum[i][0] / sum[i][3], sum[i][1] / sum[i][3], sum[i][2] / sum[i][3]) : m));
  }
  for (const c of colors) c.copy(centers[near(c)]);
}

/** The colour `targets` show along a ray (parent space point and direction), or null. */
function sample(parent, targets, point, dir, far = 1) {
  raycaster.set(point.clone().applyMatrix4(parent.matrixWorld), dir.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(parent.matrixWorld)).normalize());
  raycaster.far = far;
  const hit = raycaster.intersectObjects(targets, false)[0];
  return hit ? hitColor(hit) : null;
}

const median = (colors) => {
  const ok = colors.filter(Boolean).sort((a, b) => a.getHSL({}).l - b.getHSL({}).l);
  return ok.length ? ok[Math.floor(ok.length / 2)].clone() : null;
};

/**
 * A square head in the blocky style: an 8 × 8 grid per face painted from a template (hair on top
 * and at the back, a fringe, two eye cells, a mouth), its colours taken from the original head:
 * skin from the cheeks, hair (or hood, cap) from the crown, eyes from the eye mesh's glow.
 */
function headColors(box, parent, targets) {
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const front = (x, y) => sample(parent, targets, new THREE.Vector3(c.x + x * size.x, box.min.y + y * size.y, box.min.z - 0.1), new THREE.Vector3(0, 0, 1), size.z + 0.2);
  const crown = (x, z) => sample(parent, targets, new THREE.Vector3(c.x + x * size.x, box.max.y + 0.1, c.z + z * size.z), new THREE.Vector3(0, -1, 0), size.y * 0.6);
  // A zombie's skin is its head-skin material (the colour its arms and hands have too); a
  // survivor's head is one vertex-coloured mesh, so its skin is read off the cheeks.
  const skinMesh = targets.find((m) => m.name === 'zombieHeadSkin');
  const skinMat = skinMesh && [skinMesh.material].flat()[0];
  const avgVertex = (m) => {
    const col = m?.geometry.attributes.color;
    if (!col) return new THREE.Color(1, 1, 1);
    const sum = new THREE.Color(0, 0, 0);
    for (let i = 0; i < col.count; i++) sum.add(new THREE.Color().fromBufferAttribute(col, i));
    return sum.multiplyScalar(1 / col.count);
  };
  const skin = (skinMat?.color ? skinMat.color.clone().multiply(skinMat.vertexColors ? avgVertex(skinMesh) : new THREE.Color(1, 1, 1)) : null)
    ?? median([front(-0.22, 0.3), front(0.22, 0.3), front(0, 0.2), front(-0.18, 0.4), front(0.18, 0.4)]) ?? new THREE.Color(0xc59b78);
  const hair = median([crown(0, 0), crown(-0.2, 0.1), crown(0.2, 0.1), crown(0, 0.25)]) ?? skin.clone().multiplyScalar(0.5);
  const eyesMesh = targets.find((m) => /eye/i.test(m.name));
  const eyeMat = eyesMesh && [eyesMesh.material].flat()[0];
  const eye = eyeMat?.emissive && eyeMat.emissive.getHex() ? eyeMat.emissive.clone().multiplyScalar(Math.min(1.5, eyeMat.emissiveIntensity ?? 1)) : eyeMat?.color ? eyeMat.color.clone() : new THREE.Color(0x221a16);
  return { skin, hair, eye, zombie: Boolean(eyesMesh) };
}

function headBlock(box, parent, targets, colors = headColors(box, parent, targets), faceSpec = null) {
  const { skin, hair, eye, zombie } = colors;
  // FACES: 0 +X, 1 −X, 2 top, 3 bottom, 4 back (+Z), 5 front (−Z); j counts rows from the bottom.
  const paint = (face, i, j, nu, nv) => {
    const top = nv - 1 - j;
    if (face === 2) return hair;
    if (face === 3) return skin;
    if (face === 4) return top <= 4 ? hair : skin;
    if (face === 0 || face === 1) return top <= 1 ? hair : skin;
    return top === 0 ? hair : skin;
  };
  const faces = gridBox(box, parent, targets, { cells: 8, paint });
  for (const f of faces) f.scale = HEAD_PX;
  // Zombies get a face mixed from the shared parts (tools/cubeclysm/faces, by head type);
  // survivors keep the printed toy-figure face.
  faces[5].draw = faceSpec
    ? (ctx, x, y, w, h) => { drawFringe(ctx, x, y, w, h, hair); composeFace(ctx, x, y, w, h, { skin: skin.getHex(), hair: hair.getHex(), eye: eye.getHex(), face: faceSpec }); }
    : (ctx, x, y, w, h) => drawFace(ctx, x, y, w, h, { skin, hair, eye, zombie });
  return faces;
}

const css = (c) => `#${c.getHexString()}`;
const shade = (c, k) => c.clone().multiplyScalar(k);

/** The fringe: hair coming down over the forehead in a few rounded locks. */
function drawFringe(ctx, x, y, w, h, hair) {
  const X = (f) => x + f * w, Y = (f) => y + f * h;
  ctx.fillStyle = css(hair);
  ctx.beginPath();
  ctx.moveTo(X(0), Y(0));
  ctx.lineTo(X(1), Y(0));
  ctx.lineTo(X(1), Y(0.2));
  for (let k = 5; k >= 0; k--) ctx.quadraticCurveTo(X((k + 0.5) / 6), Y(0.24 + (k % 2) * 0.03), X(k / 6), Y(0.16 + (k % 2 ? 0.02 : 0.04)));
  ctx.closePath();
  ctx.fill();
}

/**
 * A printed toy-figure face on the head's front (x, y, w, h in atlas pixels): a fringe, brows,
 * eyes with a highlight and a smile; for zombies sunken glowing eyes, a scowl, a ragged mouth
 * with teeth and a stitched scar.
 */
function drawFace(ctx, x, y, w, h, { skin, hair, eye, zombie }) {
  const X = (f) => x + f * w, Y = (f) => y + f * h;
  const ink = zombie ? '#1b1412' : '#1d1a19';
  // Fringe: the hair comes down over the forehead in a few rounded locks.
  ctx.fillStyle = css(hair);
  ctx.beginPath();
  ctx.moveTo(X(0), Y(0));
  ctx.lineTo(X(1), Y(0));
  ctx.lineTo(X(1), Y(0.26));
  for (let k = 5; k >= 0; k--) ctx.quadraticCurveTo(X((k + 0.5) / 6), Y(0.3 + (k % 2) * 0.04), X(k / 6), Y(0.2 + (k % 2 ? 0.02 : 0.05)));
  ctx.closePath();
  ctx.fill();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (!zombie) {
    // Brows, eyes with a white glint, a smile, light cheeks.
    ctx.strokeStyle = css(shade(hair, 0.7));
    ctx.lineWidth = h * 0.035;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(X(0.5 + s * 0.27), Y(0.37)); ctx.quadraticCurveTo(X(0.5 + s * 0.19), Y(0.33), X(0.5 + s * 0.1), Y(0.36)); ctx.stroke(); }
    for (const s of [-1, 1]) {
      ctx.fillStyle = ink;
      ctx.beginPath(); ctx.ellipse(X(0.5 + s * 0.17), Y(0.48), w * 0.05, h * 0.07, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(X(0.5 + s * 0.17 - 0.015), Y(0.455), w * 0.016, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(214, 110, 100, 0.25)';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(X(0.5 + s * 0.28), Y(0.62), w * 0.07, h * 0.04, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = ink;
    ctx.lineWidth = h * 0.035;
    ctx.beginPath(); ctx.arc(X(0.5), Y(0.6), w * 0.15, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
    return;
  }
  // Zombie: dark sockets with a glowing eye, a scowl, bags under the eyes.
  ctx.strokeStyle = ink;
  ctx.lineWidth = h * 0.04;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(X(0.5 + s * 0.3), Y(0.33)); ctx.lineTo(X(0.5 + s * 0.08), Y(0.4)); ctx.stroke(); }
  for (const s of [-1, 1]) {
    ctx.fillStyle = css(shade(skin, 0.35));
    ctx.beginPath(); ctx.ellipse(X(0.5 + s * 0.18), Y(0.49), w * 0.09, h * 0.075, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = css(eye);
    ctx.beginPath(); ctx.arc(X(0.5 + s * 0.18), Y(0.49), w * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(X(0.5 + s * 0.18), Y(0.49), w * 0.012, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = css(shade(skin, 0.6));
    ctx.lineWidth = h * 0.02;
    ctx.beginPath(); ctx.arc(X(0.5 + s * 0.18), Y(0.55), w * 0.07, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  }
  // A ragged open mouth with a few teeth.
  ctx.fillStyle = '#2a0f0e';
  ctx.beginPath();
  ctx.moveTo(X(0.3), Y(0.68));
  ctx.lineTo(X(0.7), Y(0.66));
  ctx.lineTo(X(0.66), Y(0.8));
  ctx.lineTo(X(0.52), Y(0.77));
  ctx.lineTo(X(0.4), Y(0.82));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d9d2b8';
  for (const [tx, tw] of [[0.36, 0.05], [0.45, 0.04], [0.58, 0.05]]) ctx.fillRect(X(tx), Y(0.675), w * tw, h * 0.045);
  // A stitched scar across one cheek.
  ctx.strokeStyle = css(shade(skin, 0.45));
  ctx.lineWidth = h * 0.018;
  ctx.beginPath(); ctx.moveTo(X(0.72), Y(0.58)); ctx.lineTo(X(0.9), Y(0.72)); ctx.stroke();
  for (let k = 0; k < 3; k++) { const t = 0.2 + k * 0.3; const cx = 0.72 + 0.18 * t, cy = 0.58 + 0.14 * t; ctx.beginPath(); ctx.moveTo(X(cx - 0.03), Y(cy + 0.03)); ctx.lineTo(X(cx + 0.03), Y(cy - 0.03)); ctx.stroke(); }
}

const MATERIAL = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.9, metalness: 0 });

/** How a part's mesh is cut along its height: [name, from, to] as fractions of the height, 0 = bottom. */
const CUTS = {
  zombieHand: [['forearm', 0.3, 1], ['hand', 0, 0.3]],
  zombieLeg: [['thigh', 0.55, 1], ['shin', 0.14, 0.55], ['foot', 0, 0.14]],
};
const HEADS = /^(survivorHead|zombieHeadSkin)$/;

/** Rebuild `root` (a survivor or zombie from the game, before baking) as blocks. */
export function blockify(root, { face = null } = {}) {
  root.updateMatrixWorld(true);
  const blocks = [];
  // The torso's width sets the head's size.
  // The torso's width sets the head's size; its top (world height) is where the neck starts.
  let torsoWidth = 0, torsoTop = -Infinity;
  root.traverse((o) => {
    if (o.isMesh && /Torso$/.test(o.name)) {
      const b = partBounds(pointsIn([o], o.parent));
      if (!b) return;
      torsoWidth = Math.max(torsoWidth, b.max.x - b.min.x);
      const c = b.getCenter(new THREE.Vector3());
      torsoTop = Math.max(torsoTop, o.parent.localToWorld(new THREE.Vector3(c.x, b.max.y, c.z)).y);
    }
  });
  const byParent = new Map();
  root.traverse((o) => { if (o.isMesh && o.visible) { if (!byParent.has(o.parent)) byParent.set(o.parent, []); byParent.get(o.parent).push(o); } });
  for (const [parent, meshes] of byParent) {
    // Overlays (mostly inside a bigger mesh's bounds) are sampled with it.
    const items = meshes.map((m) => ({ m, box: partBounds(pointsIn([m], parent)) ?? new THREE.Box3() }))
      .sort((a, b) => b.box.getSize(new THREE.Vector3()).length() - a.box.getSize(new THREE.Vector3()).length());
    const clusters = [];
    for (const it of items) {
      const vol = (b) => { const s = b.getSize(new THREE.Vector3()); return Math.max(s.x * s.y * s.z, 1e-9); };
      const host = clusters.find((c) => { const i = c.box.clone().intersect(it.box); return !i.isEmpty() && vol(i) / vol(it.box) > 0.6; });
      if (host) host.meshes.push(it.m);
      else clusters.push({ main: it.m, box: it.box, meshes: [it.m] });
    }
    for (const c of clusters) {
      // The head joint's biggest part is the head, whatever its mesh is called.
      const isHead = HEADS.test(c.main.name) || (parent.name === 'head' && c === clusters[0]);
      let headTone;
      const pts = pointsIn([c.main], parent);
      const full = partBounds(pts);
      if (!full) continue;
      const cuts = CUTS[c.main.name] && full.max.y - full.min.y > 0.4 ? CUTS[c.main.name] : [[c.main.name, 0, 1]];
      const h = full.max.y - full.min.y;
      for (const [name, a, b] of cuts) {
        const box = partBounds(pts, full.min.y + a * h - 1e-6, full.min.y + b * h + 1e-6);
        if (!box) continue;
        // Segments meet exactly at their cuts (no gap at the knee or the wrist).
        if (a > 0) box.min.y = full.min.y + a * h;
        if (b < 1) box.max.y = full.min.y + b * h;
        if (c.main.name === 'zombieLeg') {
          // Shorter legs, still hanging from the hip.
          box.min.y = full.max.y - (full.max.y - box.min.y) * ZOMBIE_LEG;
          box.max.y = full.max.y - (full.max.y - box.max.y) * ZOMBIE_LEG;
        }
        if (isHead) {
          // Colours are read off the original head (its full size, hair included).
          headTone = headColors(box.clone(), parent, c.meshes);
          // A cube on a short neck: hair and hats are painted on, they do not make it taller.
          const own = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
          const s = Math.min(HEAD_MAX, torsoWidth ? torsoWidth * HEAD_OF_TORSO : own) / 2, cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
          // The head sits a neck's height above the torso (not at the original chin, which floats
          // well above the shoulders once the head is a smaller cube).
          const base = Number.isFinite(torsoTop) ? parent.worldToLocal(parent.localToWorld(new THREE.Vector3(cx, 0, cz)).setY(torsoTop)).y : box.min.y;
          const y0 = base + NECK;
          const neck = new THREE.Box3(new THREE.Vector3(cx - s * NECK_OF_HEAD, base - 0.03, cz - s * NECK_OF_HEAD), new THREE.Vector3(cx + s * NECK_OF_HEAD, y0 + 0.01, cz + s * NECK_OF_HEAD));
          box.min.set(cx - s, y0, cz - s); box.max.set(cx + s, y0 + 2 * s, cz + s);
          const neckBlock = new THREE.Mesh(new THREE.BufferGeometry(), MATERIAL);
          neckBlock.name = 'block_neck';
          const headSkin = headTone.skin;
          blocks.push({ mesh: neckBlock, faces: gridBox(neck, parent, c.meshes, { cells: 2, paint: () => headSkin }) });
          parent.add(neckBlock);
        }
        const block = new THREE.Mesh(new THREE.BufferGeometry(), MATERIAL);
        block.name = `block_${name}`;
        blocks.push({ mesh: block, faces: isHead ? headBlock(box, parent, c.meshes, headTone, face) : gridBox(box, parent, c.meshes) });
        parent.add(block);
      }
    }
    for (const m of meshes) parent.remove(m);
  }
  root.userData.atlas = textureBlocks(blocks);
  return root;
}
