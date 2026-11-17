// Cubeclysm faces, mixed from parts: eyes, brows, mouth and marks (scars, blood, dirt…). Each part
// is a PNG of its own in tools/cubeclysm/faces/<category>/<name>.png, listed in faces.json, so an
// artist can repaint one part or add another; a recipe picks parts by name.
//
// Parts are painted with key colours that are filled in per zombie when the face is composed:
//   magenta #ff00ff → the eye colour        green #00ff00 → the eye sockets (skin, darker)
//   blue    #0000ff → brows (hair, darker)  red   #ff0000 → wrinkles and lids (skin, darker)
// The drawings below seed the PNGs (build.mjs --seed-faces); after that the PNGs are the source.

export const FACE_PX = 128;

/** Where each category sits on the face, as fractions [x0, y0, x1, y1] of the front. */
export const SLOTS = {
  brows: [0.06, 0.24, 0.94, 0.4],
  eyes: [0.06, 0.36, 0.94, 0.6],
  mouth: [0.14, 0.6, 0.86, 0.92],
  marks: [0, 0, 1, 1],
};
/** Parts that need another slot. */
const SLOT_OF = { 'mouth/jawless': [0.08, 0.58, 0.92, 1] };
/** Marks drawn under the eyes and mouth (stains on the skin); the rest go on top. */
const UNDER = new Set(['bruise', 'rot', 'veins', 'stubble', 'coal_dust', 'h_full_beard', 'h_goatee', 'h_freckles', 'h_blush', 'h_mole', 'h_wrinkles', 'h_nose', 'h_dimples']);

const K = { eye: '#ff00ff', socket: '#00ff00', brow: '#0000ff', lid: '#ff0000' };
const TEETH = '#ddd6bc', DARK = '#1e0b0a', BLOOD = '#7a1010', INK = '#141010';
const ell = (c, x, y, rx, ry, fill) => { c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
const line = (c, pts, color, width) => { c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); };
/** The two eye centres in the eyes slot. */
const EYES = (w) => [w * 0.295, w * 0.705];

/** Part drawings (c: 2D context, w × h: the part's pixel size). */
export const PARTS = {
  eyes: {
    oily(c, w, h) { for (const x of EYES(w)) { ell(c, x, h / 2, w * 0.1, h * 0.4, K.socket); ell(c, x, h / 2, w * 0.062, h * 0.3, INK); ell(c, x - w * 0.02, h * 0.38, w * 0.014, h * 0.06, '#ffffff'); } },
    empty(c, w, h) { for (const x of EYES(w)) { ell(c, x, h / 2, w * 0.11, h * 0.42, K.socket); ell(c, x, h * 0.52, w * 0.078, h * 0.34, INK); } },
    glow(c, w, h) { for (const x of EYES(w)) { ell(c, x, h / 2, w * 0.1, h * 0.4, K.socket); ell(c, x, h / 2, w * 0.058, h * 0.28, K.eye); ell(c, x, h / 2, w * 0.016, h * 0.08, '#ffffff'); } },
    wide(c, w, h) {
      for (const x of EYES(w)) {
        ell(c, x, h / 2, w * 0.11, h * 0.42, '#e8e4d0'); ell(c, x, h / 2, w * 0.03, h * 0.12, INK);
        line(c, [[x - w * 0.1, h * 0.45], [x - w * 0.05, h * 0.5]], '#b03030', 1.5); line(c, [[x + w * 0.1, h * 0.55], [x + w * 0.05, h * 0.5]], '#b03030', 1.5);
      }
    },
    narrow(c, w, h) { for (const x of EYES(w)) { ell(c, x, h / 2, w * 0.1, h * 0.3, K.socket); c.fillStyle = INK; c.fillRect(x - w * 0.07, h * 0.44, w * 0.14, h * 0.12); } },
    squint_angry(c, w, h) {
      for (const [i, x] of EYES(w).entries()) {
        ell(c, x, h / 2, w * 0.1, h * 0.38, K.socket); ell(c, x, h * 0.55, w * 0.06, h * 0.26, INK);
        const s = i ? 1 : -1;
        c.fillStyle = K.lid; c.beginPath(); c.moveTo(x - w * 0.11, h * (s < 0 ? 0.1 : 0.5)); c.lineTo(x + w * 0.11, h * (s < 0 ? 0.5 : 0.1)); c.lineTo(x + w * 0.11, 0); c.lineTo(x - w * 0.11, 0); c.closePath(); c.fill();
      }
    },
    uneven(c, w, h) { const [a, b] = EYES(w); ell(c, a, h / 2, w * 0.12, h * 0.46, K.socket); ell(c, a, h / 2, w * 0.085, h * 0.36, INK); ell(c, b, h * 0.55, w * 0.08, h * 0.26, K.socket); ell(c, b, h * 0.55, w * 0.04, h * 0.16, INK); },
    one_eyed(c, w, h) {
      const [a, b] = EYES(w);
      ell(c, a, h / 2, w * 0.1, h * 0.4, K.socket); ell(c, a, h / 2, w * 0.062, h * 0.3, INK);
      ell(c, b, h / 2, w * 0.1, h * 0.42, '#3a0808'); ell(c, b, h / 2, w * 0.06, h * 0.28, '#140303');
      c.fillStyle = BLOOD; c.fillRect(b - w * 0.02, h * 0.75, w * 0.04, h * 0.25);
    },
    cloudy(c, w, h) { for (const x of EYES(w)) { ell(c, x, h / 2, w * 0.1, h * 0.4, K.socket); ell(c, x, h / 2, w * 0.065, h * 0.3, '#c8ccc4'); ell(c, x, h / 2, w * 0.022, h * 0.1, '#8a908a'); } },
    hungry(c, w, h) { for (const x of EYES(w)) { ell(c, x, h / 2, w * 0.12, h * 0.46, K.socket); ell(c, x, h / 2, w * 0.085, h * 0.38, INK); ell(c, x - w * 0.03, h * 0.36, w * 0.022, h * 0.09, '#ffffff'); ell(c, x + w * 0.025, h * 0.62, w * 0.01, h * 0.04, '#ffffff'); } },
  },
  brows: {
    angry(c, w, h) { for (const [a, b] of [[0.12, 0.42], [0.88, 0.58]]) line(c, [[w * a, h * 0.25], [w * b, h * 0.75]], K.brow, h * 0.28); },
    sad(c, w, h) { for (const [a, b] of [[0.12, 0.42], [0.88, 0.58]]) line(c, [[w * a, h * 0.7], [w * b, h * 0.25]], K.brow, h * 0.24); },
    flat(c, w, h) { for (const [a, b] of [[0.14, 0.42], [0.86, 0.58]]) line(c, [[w * a, h * 0.5], [w * b, h * 0.5]], K.brow, h * 0.26); },
    raised(c, w, h) { for (const [a, m, b] of [[0.14, 0.27, 0.42], [0.86, 0.73, 0.58]]) line(c, [[w * a, h * 0.7], [w * m, h * 0.15], [w * b, h * 0.6]], K.brow, h * 0.2); },
    furrowed(c, w, h) { for (const [a, b] of [[0.1, 0.44], [0.9, 0.56]]) line(c, [[w * a, h * 0.15], [w * b, h * 0.8]], K.brow, h * 0.38); line(c, [[w * 0.5, h * 0.4], [w * 0.5, h * 0.95]], K.lid, 2); },
    uneven(c, w, h) { line(c, [[w * 0.12, h * 0.25], [w * 0.42, h * 0.75]], K.brow, h * 0.28); line(c, [[w * 0.86, h * 0.6], [w * 0.72, h * 0.15], [w * 0.58, h * 0.55]], K.brow, h * 0.22); },
    none() {},
  },
  mouth: {
    frown_teeth(c, w, h) { c.fillStyle = DARK; c.fillRect(w * 0.2, h * 0.25, w * 0.6, h * 0.32); c.fillStyle = TEETH; c.fillRect(w * 0.3, h * 0.25, w * 0.09, h * 0.12); c.fillRect(w * 0.55, h * 0.25, w * 0.09, h * 0.12); },
    gape(c, w, h) { ell(c, w / 2, h * 0.5, w * 0.17, h * 0.38, DARK); ell(c, w / 2, h * 0.68, w * 0.1, h * 0.12, '#5a1a1e'); },
    snarl(c, w, h) {
      c.fillStyle = DARK; c.fillRect(w * 0.08, h * 0.2, w * 0.84, h * 0.46);
      c.fillStyle = TEETH; for (let k = 0; k < 8; k++) { c.fillRect(w * (0.1 + k * 0.1), h * 0.2, w * 0.075, h * 0.15); c.fillRect(w * (0.12 + k * 0.1), h * 0.51, w * 0.07, h * 0.15); }
      line(c, [[w * 0.02, h * 0.1], [w * 0.1, h * 0.2]], K.lid, 2); line(c, [[w * 0.98, h * 0.1], [w * 0.9, h * 0.2]], K.lid, 2);
    },
    small_open(c, w, h) { ell(c, w / 2, h * 0.45, w * 0.1, h * 0.2, DARK); },
    gnaw(c, w, h) { c.fillStyle = DARK; c.fillRect(w * 0.22, h * 0.22, w * 0.56, h * 0.3); c.fillStyle = TEETH; c.fillRect(w * 0.3, h * 0.22, w * 0.08, h * 0.1); c.fillRect(w * 0.6, h * 0.22, w * 0.08, h * 0.1); c.fillStyle = BLOOD; c.fillRect(w * 0.18, h * 0.5, w * 0.64, h * 0.14); c.fillRect(w * 0.3, h * 0.6, w * 0.07, h * 0.36); c.fillRect(w * 0.62, h * 0.6, w * 0.05, h * 0.26); },
    stitched(c, w, h) { line(c, [[w * 0.18, h * 0.42], [w * 0.82, h * 0.42]], INK, 2.5); for (let k = 0; k < 6; k++) line(c, [[w * (0.24 + k * 0.105), h * 0.25], [w * (0.24 + k * 0.105), h * 0.6]], INK, 1.5); },
    grin(c, w, h) {
      c.fillStyle = DARK; c.beginPath(); c.moveTo(w * 0.08, h * 0.15); c.quadraticCurveTo(w * 0.5, h * 0.95, w * 0.92, h * 0.15); c.quadraticCurveTo(w * 0.5, h * 0.45, w * 0.08, h * 0.15); c.fill();
      c.fillStyle = TEETH; for (let k = 0; k < 6; k++) c.fillRect(w * (0.22 + k * 0.095), h * 0.32, w * 0.07, h * 0.14);
    },
    drool(c, w, h) { ell(c, w / 2, h * 0.38, w * 0.14, h * 0.2, DARK); c.fillStyle = '#d8c020'; c.fillRect(w * 0.44, h * 0.48, w * 0.06, h * 0.5); ell(c, w * 0.47, h * 0.95, w * 0.05, h * 0.06, '#d8c020'); },
    grimace(c, w, h) { c.fillStyle = DARK; c.fillRect(w * 0.15, h * 0.3, w * 0.7, h * 0.26); line(c, [[w * 0.17, h * 0.43], [w * 0.27, h * 0.33], [w * 0.37, h * 0.53], [w * 0.47, h * 0.33], [w * 0.57, h * 0.53], [w * 0.67, h * 0.33], [w * 0.77, h * 0.53], [w * 0.83, h * 0.43]], TEETH, 2.5); },
    jawless(c, w, h) {
      c.fillStyle = '#2a0707'; c.beginPath(); c.moveTo(w * 0.08, h * 0.04); c.lineTo(w * 0.92, h * 0.04); c.lineTo(w * 0.98, h); c.lineTo(w * 0.02, h); c.closePath(); c.fill();
      c.fillStyle = TEETH; for (const tx of [0.14, 0.27, 0.62, 0.75]) c.fillRect(w * tx, h * 0.04, w * 0.08, h * 0.12);
      c.fillStyle = '#7a2a30'; c.fillRect(w * 0.4, h * 0.3, w * 0.2, h * 0.62);
    },
  },
  marks: {
    scar_cheek(c, w, h) { line(c, [[w * 0.7, h * 0.56], [w * 0.92, h * 0.74]], K.lid, 3); for (let k = 0; k < 4; k++) { const t = 0.15 + k * 0.23, x = w * (0.7 + 0.22 * t), y = h * (0.56 + 0.18 * t); line(c, [[x - 4, y + 4], [x + 4, y - 4]], K.lid, 1.5); } },
    scar_eye(c, w, h) { line(c, [[w * 0.27, h * 0.22], [w * 0.36, h * 0.66]], K.lid, 3.5); for (let k = 0; k < 4; k++) { const y = h * (0.28 + k * 0.1), x = w * (0.28 + k * 0.02); line(c, [[x - 4, y], [x + 5, y + 1]], K.lid, 1.5); } },
    blood_mouth(c, w, h) { c.fillStyle = BLOOD; c.fillRect(w * 0.24, h * 0.8, w * 0.07, h * 0.2); c.fillRect(w * 0.66, h * 0.8, w * 0.05, h * 0.14); c.fillRect(w * 0.45, h * 0.88, w * 0.12, h * 0.12); },
    blood_forehead(c, w, h) { c.fillStyle = BLOOD; c.fillRect(w * 0.6, 0, w * 0.1, h * 0.3); c.fillRect(w * 0.64, h * 0.3, w * 0.05, h * 0.18); c.fillRect(w * 0.55, h * 0.05, w * 0.06, h * 0.12); },
    bruise(c, w, h) { ell(c, w * 0.32, h * 0.47, w * 0.17, h * 0.13, 'rgba(70,40,90,0.55)'); ell(c, w * 0.3, h * 0.5, w * 0.1, h * 0.07, 'rgba(60,30,60,0.45)'); },
    rot(c, w, h) { ell(c, w * 0.78, h * 0.4, w * 0.12, h * 0.1, 'rgba(70,90,40,0.6)'); ell(c, w * 0.2, h * 0.75, w * 0.09, h * 0.08, 'rgba(70,90,40,0.55)'); ell(c, w * 0.8, h * 0.42, w * 0.03, h * 0.03, '#2a0a0a'); },
    veins(c, w, h) { for (const [x0, dir] of [[0.08, 1], [0.92, -1]]) line(c, [[w * x0, h * 0.2], [w * (x0 + dir * 0.06), h * 0.35], [w * (x0 + dir * 0.02), h * 0.5], [w * (x0 + dir * 0.08), h * 0.7]], '#d8c020', 2); },
    bandage(c, w, h) { c.fillStyle = '#e4e0d4'; c.beginPath(); c.moveTo(0, h * 0.1); c.lineTo(w, h * 0.02); c.lineTo(w, h * 0.16); c.lineTo(0, h * 0.24); c.closePath(); c.fill(); ell(c, w * 0.7, h * 0.11, w * 0.06, h * 0.04, BLOOD); },
    coal_dust(c, w, h) { c.fillStyle = 'rgba(30,28,26,0.55)'; for (const [x, y, s] of [[0.1, 0.5, 0.2], [0.65, 0.62, 0.25], [0.3, 0.8, 0.3], [0.75, 0.25, 0.18], [0.05, 0.15, 0.15]]) c.fillRect(w * x, h * y, w * s, h * s * 0.7); },
    stubble(c, w, h) { c.fillStyle = 'rgba(40,36,32,0.6)'; for (let i = 0; i < 70; i++) { const x = 0.2 + ((i * 37) % 60) / 100, y = 0.74 + ((i * 53) % 24) / 100; c.fillRect(w * x, h * y, 2, 2); } },
  },
};

// ── Human faces (h_…): the same slots and keys, drawn for the living ───────────────────────
// Eyes have white sclera and an iris in the key colour (the recipe's `eye`: brown, blue, green…);
// brows and facial hair take the hair colour (blue key); lids and lines the skin's (red key).
const SCLERA = '#f2efe6', PUPIL = '#141010';
const iris = (c, x, y, rx, ry) => { ell(c, x, y, rx, ry, SCLERA); ell(c, x, y, rx * 0.62, ry * 0.86, K.eye); ell(c, x, y, rx * 0.3, ry * 0.42, PUPIL); ell(c, x - rx * 0.25, y - ry * 0.3, rx * 0.14, ry * 0.18, '#ffffff'); };
const LIP = '#a8505a';
Object.assign(PARTS.eyes, {
  h_dot(c, w, h) { for (const x of EYES(w)) { ell(c, x, h / 2, w * 0.045, h * 0.24, PUPIL); ell(c, x - w * 0.012, h * 0.4, w * 0.012, h * 0.06, '#ffffff'); } },
  h_iris(c, w, h) { for (const x of EYES(w)) iris(c, x, h / 2, w * 0.075, h * 0.3); },
  h_almond(c, w, h) { for (const x of EYES(w)) { c.fillStyle = SCLERA; c.beginPath(); c.moveTo(x - w * 0.09, h / 2); c.quadraticCurveTo(x, h * 0.12, x + w * 0.09, h * 0.45); c.quadraticCurveTo(x, h * 0.82, x - w * 0.09, h / 2); c.fill(); ell(c, x, h * 0.48, w * 0.04, h * 0.25, K.eye); ell(c, x, h * 0.48, w * 0.018, h * 0.12, PUPIL); line(c, [[x - w * 0.09, h / 2], [x, h * 0.16], [x + w * 0.09, h * 0.42]], PUPIL, 2); } },
  h_tired(c, w, h) { for (const x of EYES(w)) { iris(c, x, h * 0.45, w * 0.07, h * 0.24); line(c, [[x - w * 0.08, h * 0.8], [x, h * 0.88], [x + w * 0.08, h * 0.8]], K.lid, 2); line(c, [[x - w * 0.085, h * 0.3], [x + w * 0.085, h * 0.3]], K.lid, 3); } },
  h_narrow(c, w, h) { for (const x of EYES(w)) { iris(c, x, h / 2, w * 0.075, h * 0.26); c.fillStyle = K.lid; c.fillRect(x - w * 0.09, h * 0.18, w * 0.18, h * 0.22); line(c, [[x - w * 0.085, h * 0.4], [x + w * 0.085, h * 0.4]], PUPIL, 2); } },
  h_wide(c, w, h) { for (const x of EYES(w)) iris(c, x, h / 2, w * 0.09, h * 0.4); },
  h_lashes(c, w, h) { for (const x of EYES(w)) { iris(c, x, h * 0.55, w * 0.075, h * 0.3); line(c, [[x - w * 0.085, h * 0.4], [x, h * 0.22], [x + w * 0.085, h * 0.36]], PUPIL, 3); for (const dx of [0.05, 0.075, 0.095]) line(c, [[x + w * dx - w * 0.01, h * 0.32], [x + w * dx + w * 0.012, h * 0.16]], PUPIL, 1.5); } },
  h_happy(c, w, h) { for (const x of EYES(w)) line(c, [[x - w * 0.07, h * 0.6], [x, h * 0.32], [x + w * 0.07, h * 0.6]], PUPIL, 3); },
  h_wink(c, w, h) { const [a, b] = EYES(w); iris(c, a, h / 2, w * 0.075, h * 0.3); line(c, [[b - w * 0.07, h * 0.5], [b, h * 0.62], [b + w * 0.07, h * 0.5]], PUPIL, 3); },
  h_heavy_lids(c, w, h) { for (const x of EYES(w)) { iris(c, x, h * 0.55, w * 0.07, h * 0.24); c.fillStyle = K.lid; c.beginPath(); c.moveTo(x - w * 0.09, h * 0.2); c.lineTo(x + w * 0.09, h * 0.2); c.lineTo(x + w * 0.09, h * 0.5); c.quadraticCurveTo(x, h * 0.38, x - w * 0.09, h * 0.56); c.closePath(); c.fill(); } },
});
Object.assign(PARTS.brows, {
  h_thin(c, w, h) { for (const [a, b] of [[0.16, 0.4], [0.84, 0.6]]) line(c, [[w * a, h * 0.55], [w * ((a + b) / 2), h * 0.4], [w * b, h * 0.5]], K.brow, h * 0.14); },
  h_thick(c, w, h) { for (const [a, b] of [[0.13, 0.42], [0.87, 0.58]]) line(c, [[w * a, h * 0.55], [w * b, h * 0.5]], K.brow, h * 0.32); },
  h_arched(c, w, h) { for (const [a, m, b] of [[0.14, 0.3, 0.42], [0.86, 0.7, 0.58]]) line(c, [[w * a, h * 0.7], [w * m, h * 0.25], [w * b, h * 0.45]], K.brow, h * 0.18); },
  h_bushy(c, w, h) { for (const [a, b] of [[0.11, 0.43], [0.89, 0.57]]) { line(c, [[w * a, h * 0.5], [w * b, h * 0.45]], K.brow, h * 0.42); for (let k = 0; k < 5; k++) line(c, [[w * (a + (b - a) * k / 5), h * 0.3], [w * (a + (b - a) * (k + 0.5) / 5), h * 0.1]], K.brow, 2); } },
  h_unibrow(c, w, h) { line(c, [[w * 0.14, h * 0.55], [w * 0.5, h * 0.62], [w * 0.86, h * 0.55]], K.brow, h * 0.3); },
  h_worried(c, w, h) { for (const [a, b] of [[0.14, 0.42], [0.86, 0.58]]) line(c, [[w * a, h * 0.65], [w * b, h * 0.3]], K.brow, h * 0.2); },
  h_stern(c, w, h) { for (const [a, b] of [[0.13, 0.43], [0.87, 0.57]]) line(c, [[w * a, h * 0.4], [w * b, h * 0.62]], K.brow, h * 0.28); },
});
Object.assign(PARTS.mouth, {
  h_smile(c, w, h) { line(c, [[w * 0.3, h * 0.3], [w * 0.5, h * 0.55], [w * 0.7, h * 0.3]], PUPIL, 3); },
  h_grin(c, w, h) { c.fillStyle = DARK; c.beginPath(); c.moveTo(w * 0.24, h * 0.25); c.quadraticCurveTo(w * 0.5, h * 0.85, w * 0.76, h * 0.25); c.closePath(); c.fill(); c.fillStyle = '#f4f0e6'; c.fillRect(w * 0.27, h * 0.25, w * 0.46, h * 0.14); },
  h_neutral(c, w, h) { line(c, [[w * 0.36, h * 0.42], [w * 0.64, h * 0.42]], PUPIL, 3); },
  h_smirk(c, w, h) { line(c, [[w * 0.34, h * 0.45], [w * 0.58, h * 0.45], [w * 0.68, h * 0.3]], PUPIL, 3); },
  h_sad(c, w, h) { line(c, [[w * 0.32, h * 0.55], [w * 0.5, h * 0.35], [w * 0.68, h * 0.55]], PUPIL, 3); },
  h_talk(c, w, h) { ell(c, w / 2, h * 0.45, w * 0.1, h * 0.18, DARK); ell(c, w / 2, h * 0.55, w * 0.06, h * 0.07, '#a04050'); },
  h_lips(c, w, h) { c.fillStyle = LIP; c.beginPath(); c.moveTo(w * 0.32, h * 0.42); c.quadraticCurveTo(w * 0.42, h * 0.24, w * 0.5, h * 0.33); c.quadraticCurveTo(w * 0.58, h * 0.24, w * 0.68, h * 0.42); c.quadraticCurveTo(w * 0.5, h * 0.7, w * 0.32, h * 0.42); c.fill(); line(c, [[w * 0.33, h * 0.42], [w * 0.67, h * 0.42]], '#6a2a32', 1.5); },
  h_gritted(c, w, h) { c.fillStyle = '#f4f0e6'; c.fillRect(w * 0.28, h * 0.3, w * 0.44, h * 0.22); line(c, [[w * 0.28, h * 0.41], [w * 0.72, h * 0.41]], PUPIL, 1.5); for (let k = 1; k < 5; k++) line(c, [[w * (0.28 + k * 0.088), h * 0.3], [w * (0.28 + k * 0.088), h * 0.52]], PUPIL, 1); c.strokeStyle = PUPIL; c.lineWidth = 2; c.strokeRect(w * 0.28, h * 0.3, w * 0.44, h * 0.22); },
});
Object.assign(PARTS.marks, {
  h_mustache(c, w, h) { c.fillStyle = K.brow; c.beginPath(); c.moveTo(w * 0.32, h * 0.7); c.quadraticCurveTo(w * 0.4, h * 0.6, w * 0.5, h * 0.64); c.quadraticCurveTo(w * 0.6, h * 0.6, w * 0.68, h * 0.7); c.lineTo(w * 0.62, h * 0.72); c.lineTo(w * 0.5, h * 0.68); c.lineTo(w * 0.38, h * 0.72); c.closePath(); c.fill(); },
  h_goatee(c, w, h) { c.fillStyle = K.brow; c.fillRect(w * 0.42, h * 0.84, w * 0.16, h * 0.14); c.fillRect(w * 0.36, h * 0.66, w * 0.28, h * 0.04); },
  h_full_beard(c, w, h) { c.fillStyle = K.brow; c.beginPath(); c.moveTo(0, h * 0.5); c.lineTo(w * 0.12, h * 0.5); c.lineTo(w * 0.22, h * 0.8); c.lineTo(w * 0.78, h * 0.8); c.lineTo(w * 0.88, h * 0.5); c.lineTo(w, h * 0.5); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill(); c.fillRect(w * 0.32, h * 0.66, w * 0.36, h * 0.05); },
  h_freckles(c, w, h) { c.fillStyle = 'rgba(140,80,40,0.7)'; for (const [x, y] of [[0.24, 0.6], [0.3, 0.64], [0.27, 0.68], [0.34, 0.6], [0.76, 0.6], [0.7, 0.64], [0.73, 0.68], [0.66, 0.6], [0.5, 0.58]]) c.fillRect(w * x, h * y, 2, 2); },
  h_blush(c, w, h) { ell(c, w * 0.24, h * 0.66, w * 0.08, h * 0.04, 'rgba(220,100,110,0.3)'); ell(c, w * 0.76, h * 0.66, w * 0.08, h * 0.04, 'rgba(220,100,110,0.3)'); },
  h_mole(c, w, h) { ell(c, w * 0.68, h * 0.74, w * 0.015, h * 0.015, '#3a2018'); },
  h_wrinkles(c, w, h) { for (const y of [0.18, 0.22]) line(c, [[w * 0.3, h * y], [w * 0.7, h * y]], K.lid, 1.5); for (const s of [-1, 1]) { line(c, [[w * (0.5 + s * 0.34), h * 0.44], [w * (0.5 + s * 0.4), h * 0.48]], K.lid, 1.5); line(c, [[w * (0.5 + s * 0.15), h * 0.62], [w * (0.5 + s * 0.2), h * 0.74]], K.lid, 1.5); } },
  h_scar_lip(c, w, h) { line(c, [[w * 0.58, h * 0.6], [w * 0.55, h * 0.82]], K.lid, 2.5); },
  h_eyeliner(c, w, h) { for (const [x, s] of [[0.32, -1], [0.68, 1]]) line(c, [[w * (x - 0.08), h * 0.42], [w * (x + 0.09 * s), h * 0.38], [w * (x + 0.12 * s), h * 0.35]], PUPIL, 2); },
  h_dimples(c, w, h) { for (const x of [0.33, 0.67]) line(c, [[w * x, h * 0.7], [w * x, h * 0.74]], K.lid, 2); },
  h_nose(c, w, h) { line(c, [[w * 0.5, h * 0.5], [w * 0.47, h * 0.6], [w * 0.52, h * 0.61]], K.lid, 2); },
});

export const slotOf = (category, name) => SLOT_OF[`${category}/${name}`] ?? SLOTS[category];

/** The manifest written next to the PNGs (faces.json). */
export function manifest() {
  const parts = {};
  for (const [cat, list] of Object.entries(PARTS)) parts[cat] = Object.fromEntries(Object.keys(list).map((n) => [n, { file: `${cat}/${n}.png`, slot: slotOf(cat, n), ...(cat === 'marks' ? { layer: UNDER.has(n) ? 'under' : 'over' } : {}) }]));
  return { px: FACE_PX, keys: { eye: K.eye, socket: K.socket, brow: K.brow, lid: K.lid }, parts };
}

/** Draw one part from its seed drawing into a canvas of its slot size. */
export function seedPart(category, name) {
  const [x0, y0, x1, y1] = slotOf(category, name);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round((x1 - x0) * FACE_PX); canvas.height = Math.round((y1 - y0) * FACE_PX);
  PARTS[category][name](canvas.getContext('2d'), canvas.width, canvas.height);
  return canvas;
}

// ── Composing (from the PNGs) ───────────────────────────────────────────────────────────────
let loaded = null;

/** Load faces.json and every part PNG (before building any model). */
export async function loadFaces(base = '/faces/') {
  const m = await (await fetch(`${base}faces.json`)).json();
  const images = {};
  for (const [cat, list] of Object.entries(m.parts)) for (const [name, p] of Object.entries(list)) images[`${cat}/${name}`] = { ...p, cat, image: await createImageBitmap(await (await fetch(base + p.file)).blob()) };
  loaded = { m, images };
  return Object.fromEntries(Object.entries(m.parts).map(([cat, list]) => [cat, Object.keys(list)]));
}

const hexRgb = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
const darker = (hex, k) => hexRgb(hex).map((v) => Math.round(v * k));

/** A part with its key colours filled in. */
function tinted(part, colors) {
  const c = document.createElement('canvas');
  c.width = part.image.width; c.height = part.image.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(part.image, 0, 0);
  const img = ctx.getImageData(0, 0, c.width, c.height), d = img.data;
  // A pixel belongs to a key by its hue, not only its exact value: the antialiased edge of a
  // magenta iris against white sclera is pink, and must take the eye colour too.
  const keyOf = (r, g, b) => {
    if (r > 140 && b > 140 && g < 0.6 * Math.min(r, b)) return colors.eye;
    if (g > 140 && r < 0.6 * g && b < 0.6 * g) return colors.socket;
    if (b > 140 && r < 0.6 * b && g < 0.6 * b) return colors.brow;
    if (r > 200 && g < 60 && b < 60) return colors.lid;
    return null;
  };
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const to = keyOf(d[i], d[i + 1], d[i + 2]);
    if (to) { d[i] = to[0]; d[i + 1] = to[1]; d[i + 2] = to[2]; }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Compose a face on the head's front (x, y, w, h in atlas pixels) from a recipe's face:
 * { eyes, brows, mouth, marks: [...] }, coloured by the zombie's skin, hair and eyes.
 */
export function composeFace(ctx, x, y, w, h, { skin, hair, eye = 0x0a0a0a, face }) {
  if (!loaded) throw new Error('faces not loaded (loadFaces)');
  const colors = { eye: hexRgb(eye), socket: darker(skin, 0.55), brow: hair === null || hair === undefined ? darker(skin, 0.35) : darker(hair, 0.75), lid: darker(skin, 0.62) };
  // `face.lift` moves a category up (negative) or down, in face heights (eyes pushed up into the forehead).
  const lift = face.lift ?? {};
  const put = (key) => {
    const p = loaded.images[key];
    if (!p) throw new Error(`face part ${key} is not in faces.json`);
    const [x0, y0, x1, y1] = p.slot, dy = lift[key.split('/')[0]] ?? 0;
    ctx.drawImage(tinted(p, colors), Math.round(x + x0 * w), Math.round(y + (y0 + dy) * h), Math.round((x1 - x0) * w), Math.round((y1 - y0) * h));
  };
  const marks = face.marks ?? [];
  for (const mk of marks) if (loaded.images[`marks/${mk}`]?.layer === 'under') put(`marks/${mk}`);
  put(`eyes/${face.eyes ?? 'oily'}`);
  put(`brows/${face.brows ?? 'flat'}`);
  put(`mouth/${face.mouth ?? 'frown_teeth'}`);
  for (const mk of marks) if (loaded.images[`marks/${mk}`]?.layer !== 'under') put(`marks/${mk}`);
}
