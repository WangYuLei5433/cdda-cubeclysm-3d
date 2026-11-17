// Cubeclysm painting: clothes, skin details and faces drawn on a block's face (x, y, w, h in atlas
// pixels). Everything is deterministic: a seeded generator per model, part and side.

export const css = (hex) => `#${hex.toString(16).padStart(6, '0')}`;
export const shade = (hex, k) => {
  const c = (s) => Math.max(0, Math.min(255, Math.round(((hex >> s) & 255) * k)));
  return (c(16) << 16) | (c(8) << 8) | c(0);
};
export const mix = (a, b, t) => {
  const c = (s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return (c(16) << 16) | (c(8) << 8) | c(0);
};

/** A small deterministic generator (mulberry32) seeded from a string. */
export function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function fill(ctx, x, y, w, h, hex) {
  ctx.fillStyle = css(hex);
  ctx.fillRect(x, y, w, h);
}

/** Blocky blobs (a few overlapping rectangles), the way the style draws stains and patches. */
export function blobs(ctx, x, y, w, h, hex, n, size, r) {
  ctx.fillStyle = css(hex);
  for (let i = 0; i < n; i++) {
    const cx = x + r() * w, cy = y + r() * h, s = Math.max(2, size * (0.5 + r()));
    for (let k = 0; k < 3; k++) ctx.fillRect(Math.round(cx + (r() - 0.5) * s), Math.round(cy + (r() - 0.5) * s), Math.round(s * (0.4 + r() * 0.6)), Math.round(s * (0.3 + r() * 0.5)));
  }
}

/** Blood: dark red stains with drips running down. */
export function blood(ctx, x, y, w, h, n, r) {
  const px = Math.max(2, Math.round(Math.min(w, h) * 0.06));
  blobs(ctx, x, y, w, h, 0x5a0d0d, n, px * 3, r);
  ctx.fillStyle = css(0x6e1111);
  for (let i = 0; i < n; i++) { const dx = x + r() * w, dy = y + r() * h * 0.7; ctx.fillRect(Math.round(dx), Math.round(dy), px, Math.round(px * (2 + r() * 5))); }
}

/** Tears in clothes: ragged holes that show the skin under them. */
export function tears(ctx, x, y, w, h, n, skin, r) {
  for (let i = 0; i < n; i++) {
    const tw = w * (0.12 + r() * 0.18), th = h * (0.08 + r() * 0.14), tx = x + r() * (w - tw), ty = y + r() * (h - th);
    ctx.fillStyle = css(shade(skin, 0.9));
    ctx.fillRect(Math.round(tx), Math.round(ty), Math.round(tw), Math.round(th));
    ctx.fillStyle = css(shade(skin, 0.6));
    ctx.fillRect(Math.round(tx), Math.round(ty), Math.round(tw), Math.max(1, Math.round(th * 0.2)));
  }
}

/** Veins: thin branching lines (the acidic zombie's yellow fluid shows through its skin). */
export function veins(ctx, x, y, w, h, hex, n, r) {
  ctx.strokeStyle = css(hex);
  ctx.lineWidth = Math.max(1, Math.round(Math.min(w, h) * 0.035));
  ctx.lineCap = 'square';
  for (let i = 0; i < n; i++) {
    let px = x + r() * w, py = y + r() * h * 0.3;
    ctx.beginPath(); ctx.moveTo(px, py);
    for (let k = 0; k < 5; k++) { px += (r() - 0.5) * w * 0.25; py += h * (0.1 + r() * 0.12); ctx.lineTo(px, py); }
    ctx.stroke();
  }
}

/** Festering wounds: dark red openings rimmed with yellow-green pus. */
export function wounds(ctx, x, y, w, h, n, r) {
  for (let i = 0; i < n; i++) {
    const s = Math.max(4, Math.min(w, h) * (0.12 + r() * 0.12)), wx = x + r() * (w - s), wy = y + r() * (h - s);
    ctx.fillStyle = css(0x9a9a3a); ctx.fillRect(Math.round(wx - 2), Math.round(wy - 2), Math.round(s + 4), Math.round(s * 0.7 + 4));
    ctx.fillStyle = css(0x4a0b0b); ctx.fillRect(Math.round(wx), Math.round(wy), Math.round(s), Math.round(s * 0.7));
  }
}

/** Camouflage: blotches of the given colours. */
export function camo(ctx, x, y, w, h, colors, r) {
  for (const c of colors.slice(1)) blobs(ctx, x, y, w, h, c, Math.ceil((w * h) / 900), Math.min(w, h) * 0.18, r);
}

/** Plaid: crossing bands of two colours over the base (a flannel shirt). */
export function plaid(ctx, x, y, w, h, [a, b]) {
  const step = Math.max(6, Math.round(Math.min(w, h) / 4));
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < w; i += step) fill(ctx, x + i, y, Math.max(2, step * 0.35), h, a);
  for (let j = 0; j < h; j += step) fill(ctx, x, y + j, w, Math.max(2, step * 0.35), a);
  ctx.globalAlpha = 0.8;
  for (let i = step / 2; i < w; i += step) fill(ctx, x + i, y, 1, h, b);
  for (let j = step / 2; j < h; j += step) fill(ctx, x, y + j, w, 1, b);
  ctx.globalAlpha = 1;
}

const line2 = (ctx, x0, y0, x1, y1, hex) => { ctx.strokeStyle = css(hex); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };

/** Stitches: a seam of crossed stitches across a face of skin (sewn-up wounds). */
export function stitches(ctx, x, y, w, h, r) {
  const x0 = x + r() * w * 0.4, y0 = y + r() * h * 0.5, x1 = x0 + w * (0.3 + r() * 0.4), y1 = y0 + h * (0.1 + r() * 0.3);
  line2(ctx, x0, y0, x1, y1, 0x3a2020);
  for (let k = 1; k < 6; k++) { const t = k / 6, cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t; line2(ctx, cx - 3, cy - 3, cx + 3, cy + 3, 0x1a1010); }
}

/** Scab: thick crusted plates of scar tissue with dark cracks between them. */
export function scabs(ctx, x, y, w, h, base, r) {
  const n = Math.max(3, Math.round((w * h) / 260));
  for (let i = 0; i < n; i++) {
    const pw = w * (0.18 + r() * 0.22), ph = h * (0.14 + r() * 0.2), px = x + r() * (w - pw), py = y + r() * (h - ph);
    fill(ctx, px, py, pw, ph, shade(base, 0.7 + r() * 0.25));
    fill(ctx, px, py, pw, Math.max(1, ph * 0.18), shade(base, 1.15));
    ctx.strokeStyle = css(shade(base, 0.35)); ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  }
}

/** Bone armour: off-white plates with hairline cracks and black goo seeping from the seams. */
export function bone(ctx, x, y, w, h, r) {
  fill(ctx, x, y, w, h, 0xd8d0b8);
  const n = Math.max(2, Math.round((w * h) / 400));
  for (let i = 0; i < n; i++) { const px = x + r() * w, py = y + r() * h; ctx.strokeStyle = css(0x9a9078); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (r() - 0.5) * w * 0.4, py + r() * h * 0.3); ctx.lineTo(px + (r() - 0.5) * w * 0.4, py + r() * h * 0.5); ctx.stroke(); }
  for (let i = 0; i < n; i++) { const px = x + r() * w, py = y + r() * h * 0.7; fill(ctx, px, py, Math.max(2, w * 0.06), Math.max(3, h * (0.08 + r() * 0.15)), 0x141014); }
  fill(ctx, x, y + h * 0.9, w, h * 0.1, 0xb8ae94);
}

/** Exposed muscle: dark red with fibres running along it and pale sinew at the ends. */
export function muscle(ctx, x, y, w, h, r) {
  fill(ctx, x, y, w, h, 0x7a2622);
  ctx.globalAlpha = 0.6;
  for (let i = 1; i < w; i += 3) fill(ctx, x + i, y, 1, h, i % 2 ? 0x5a1a18 : 0x9a3a32);
  ctx.globalAlpha = 1;
  fill(ctx, x, y, w, Math.max(1, h * 0.1), 0xc8b8a0);
  fill(ctx, x, y + h * 0.9, w, h * 0.1, 0xc8b8a0);
  blobs(ctx, x, y, w, h, 0x141014, 1, Math.min(w, h) * 0.2, r);
}

/** A skull's face: empty eye sockets, the nasal cavity and a row of teeth on bare bone. */
export function skull(ctx, x, y, w, h) {
  fill(ctx, x, y, w, h, 0xd8d0b8);
  const X = (f) => x + f * w, Y = (f) => y + f * h;
  ctx.fillStyle = '#100c0c';
  for (const cx of [0.3, 0.7]) { ctx.beginPath(); ctx.ellipse(X(cx), Y(0.42), w * 0.14, h * 0.13, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(X(0.5), Y(0.52)); ctx.lineTo(X(0.44), Y(0.66)); ctx.lineTo(X(0.56), Y(0.66)); ctx.closePath(); ctx.fill();
  fill(ctx, X(0.24), Y(0.76), w * 0.52, h * 0.14, 0x100c0c);
  for (let k = 0; k < 7; k++) fill(ctx, X(0.25 + k * 0.073), Y(0.76), w * 0.06, h * 0.06, 0xe8e0c8);
  for (let k = 0; k < 7; k++) fill(ctx, X(0.25 + k * 0.073), Y(0.84), w * 0.06, h * 0.05, 0xe8e0c8);
  ctx.strokeStyle = '#9a9078'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0.62), Y(0.05)); ctx.lineTo(X(0.55), Y(0.2)); ctx.lineTo(X(0.6), Y(0.28)); ctx.stroke();
  fill(ctx, X(0.66), Y(0.5), w * 0.05, h * 0.18, 0x141014);
}

/** Tattoos: blue-green ink (bands, a star, a skull) on bare skin. */
export function tattoos(ctx, x, y, w, h, r) {
  ctx.fillStyle = 'rgba(40,70,80,0.75)';
  const kind = Math.floor(r() * 3);
  if (kind === 0) { for (let k = 0; k < 2; k++) ctx.fillRect(x, y + h * (0.3 + k * 0.15), w, Math.max(2, h * 0.05)); }
  else if (kind === 1) { const cx = x + w * (0.3 + r() * 0.4), cy = y + h * (0.3 + r() * 0.4), s = Math.min(w, h) * 0.18; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, rad = i % 2 ? s * 0.45 : s; ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } ctx.closePath(); ctx.fill(); }
  else { const cx = x + w * 0.5, cy = y + h * 0.5, s = Math.min(w, h) * 0.2; ctx.fillRect(cx - s, cy - s, s * 2, s * 1.4); ctx.fillStyle = 'rgba(200,190,170,0.9)'; ctx.fillRect(cx - s * 0.6, cy - s * 0.5, s * 0.4, s * 0.4); ctx.fillRect(cx + s * 0.2, cy - s * 0.5, s * 0.4, s * 0.4); }
}

/** Flesh grown over cloth: raw patches spreading from the seams (gear melding into the body). */
export function meld(ctx, x, y, w, h, skin, r) {
  blobs(ctx, x, y, w, h, shade(skin, 0.85), 2, Math.min(w, h) * 0.3, r);
  blobs(ctx, x, y, w, h, 0x8a3a34, 1, Math.min(w, h) * 0.15, r);
}

/** Burnt: a charred black crust with grey ash and raw red cracks where it split (scorched zombies). */
export function char(ctx, x, y, w, h, r) {
  fill(ctx, x, y, w, h, 0x302822);
  blobs(ctx, x, y, w, h, 0x4a3e34, 3, Math.min(w, h) * 0.25, r);
  blobs(ctx, x, y, w, h, 0x6a645c, 2, Math.min(w, h) * 0.12, r);
  ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.05);
  for (let i = 0; i < Math.max(3, Math.round((w * h) / 350)); i++) {
    ctx.strokeStyle = css(i % 2 ? 0x7a2418 : 0x9a3a1e);
    let px = x + r() * w, py = y + r() * h;
    ctx.beginPath(); ctx.moveTo(px, py);
    for (let k = 0; k < 3; k++) { px += (r() - 0.5) * w * 0.5; py += r() * h * 0.3; ctx.lineTo(px, py); }
    ctx.stroke();
  }
}

/** Living shadow: the surface dark and smoky, a faint sheen where it moves. */
export function shadow(ctx, x, y, w, h, r) {
  ctx.globalAlpha = 0.8; fill(ctx, x, y, w, h, 0x101016); ctx.globalAlpha = 1;
  blobs(ctx, x, y, w, h, 0x2a2a38, 3, Math.min(w, h) * 0.3, r);
  for (let i = 0; i < 3; i++) fill(ctx, x + r() * w, y + r() * h, 1, Math.max(2, h * 0.3), 0x4a4a6a);
}

/** Shattered glass: pale crack lines splitting the surface into shards. */
export function shards(ctx, x, y, w, h, r) {
  ctx.strokeStyle = 'rgba(220,235,245,0.8)'; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); let px = x + r() * w, py = y + r() * h; ctx.moveTo(px, py); for (let k = 0; k < 3; k++) { px += (r() - 0.5) * w * 0.6; py += (r() - 0.5) * h * 0.6; ctx.lineTo(px, py); } ctx.stroke(); }
}

/** Rust: orange-brown corrosion over metal. */
export function rust(ctx, x, y, w, h, r) {
  blobs(ctx, x, y, w, h, 0x8a4a22, 3, Math.min(w, h) * 0.3, r);
  blobs(ctx, x, y, w, h, 0x5a2e14, 2, Math.min(w, h) * 0.15, r);
}

/** Horizontal bands at fractions of the height (reflective stripes, belts). */
export function band(ctx, x, y, w, h, hex, at, thick) {
  fill(ctx, x, Math.round(y + h * at), w, Math.max(2, Math.round(h * thick)), hex);
}

/**
 * The colour a body part shows on its faces, from the outfit:
 *   torso: top; arms: sleeves (long / short / none); hands: gloves or skin; legs: pants; feet: shoes.
 * `region` is where on the part a face pixel row lies (0 = top of the part, 1 = bottom).
 */
export function baseColor(outfit, skin, part) {
  const top = outfit.top ?? skin, pants = outfit.pants ?? skin;
  switch (part) {
    case 'torso': case 'chest': return top;
    case 'upper_arm': return outfit.sleeves === 'none' ? skin : top;
    case 'forearm': return outfit.sleeves === 'long' ? top : skin;
    case 'hand': return outfit.gloves ?? skin;
    case 'thigh': return pants;
    case 'shin': return outfit.shorts ? skin : pants;
    case 'foot': return outfit.shoes ?? shade(skin, 0.7);
    default: return skin;
  }
}

/** Garment details drawn over the base colour of a part's face. */
export function garment(ctx, x, y, w, h, side, part, outfit, skin, r) {
  const style = outfit.style ?? 'shirt';
  const front = side === 'front', back = side === 'back';
  if (part === 'torso') {
    if (outfit.camo) camo(ctx, x, y, w, h, outfit.camo, r);
    if (front && ['shirt', 'tshirt', 'tank'].includes(style)) {
      // Neckline showing the skin.
      ctx.fillStyle = css(skin);
      ctx.beginPath(); ctx.moveTo(x + w * 0.38, y); ctx.lineTo(x + w * 0.62, y); ctx.lineTo(x + w * 0.5, y + h * (style === 'tank' ? 0.2 : 0.12)); ctx.closePath(); ctx.fill();
    }
    if (front && style === 'shirt') { ctx.fillStyle = css(shade(outfit.top, 0.7)); for (let k = 0; k < 4; k++) ctx.fillRect(Math.round(x + w * 0.49), Math.round(y + h * (0.2 + k * 0.17)), 2, 2); }
    if (front && style === 'hoodie') { fill(ctx, x + w * 0.25, y + h * 0.6, w * 0.5, h * 0.22, shade(outfit.top, 0.8)); fill(ctx, x + w * 0.42, y + h * 0.02, 2, h * 0.2, 0xdddddd); fill(ctx, x + w * 0.57, y + h * 0.02, 2, h * 0.2, 0xdddddd); }
    if (front && style === 'uniform') {
      fill(ctx, x + w * 0.49, y, 2, h, shade(outfit.top, 0.65));
      for (const px of [0.14, 0.62]) { fill(ctx, x + w * px, y + h * 0.18, w * 0.24, h * 0.2, shade(outfit.top, 0.82)); fill(ctx, x + w * px, y + h * 0.18, w * 0.24, 2, shade(outfit.top, 0.6)); }
      ctx.fillStyle = css(shade(outfit.top, 1.25)); ctx.fillRect(x + w * 0.4, y, w * 0.2, h * 0.06);
    }
    if (style === 'coat') {
      if (front) fill(ctx, x + w * 0.48, y, Math.max(2, w * 0.04), h, shade(outfit.top, 0.6));
      band(ctx, x, y, w, h, shade(outfit.top, 0.75), 0.92, 0.08);
    }
    if (style === 'coveralls' && (front || back)) {
      if (front) { fill(ctx, x + w * 0.49, y, 2, h * 0.92, 0x8a8a8a); for (const px of [0.15, 0.63]) { fill(ctx, x + w * px, y + h * 0.16, w * 0.22, h * 0.18, shade(outfit.top, 0.8)); fill(ctx, x + w * px, y + h * 0.16, w * 0.22, 2, shade(outfit.top, 0.6)); } }
      band(ctx, x, y, w, h, shade(outfit.top, 0.75), 0.88, 0.04);
    }
    if (style === 'suit' && front) { fill(ctx, x + w * 0.49, y, 2, h * 0.9, 0x555555); for (const px of [0.2, 0.75]) fill(ctx, x + w * px, y + h * 0.1, 1, h * 0.8, shade(outfit.top, 0.75)); }
    if (outfit.straps && (front || back)) { for (const px of [0.18, 0.7]) fill(ctx, x + w * px, y, w * 0.12, h, outfit.straps); band(ctx, x, y, w, h, outfit.straps, 0.55, 0.07); }
    if (!['coat', 'suit', 'coveralls', 'gown', 'dress', 'labcoat'].includes(style) && outfit.pants && !outfit.overalls) band(ctx, x, y, w, h, shade(outfit.belt ?? outfit.pants, 0.7), 0.9, 0.1);
  }
  if (part === 'torso') {
    // Patterns and garments over the base colour.
    if (outfit.plaid && side !== 'top' && side !== 'bottom') plaid(ctx, x, y, w, h, outfit.plaid);
    if (front && style === 'formal') {
      fill(ctx, x + w * 0.36, y, w * 0.28, h * 0.62, outfit.shirt ?? 0xe8e8e0);
      ctx.fillStyle = css(shade(outfit.top, 0.75)); ctx.beginPath(); ctx.moveTo(x + w * 0.36, y); ctx.lineTo(x + w * 0.5, y + h * 0.62); ctx.lineTo(x + w * 0.36, y + h * 0.62); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + w * 0.64, y); ctx.lineTo(x + w * 0.5, y + h * 0.62); ctx.lineTo(x + w * 0.64, y + h * 0.62); ctx.closePath(); ctx.fill();
      for (const k of [0.68, 0.8]) fill(ctx, x + w * 0.47, y + h * k, w * 0.06, w * 0.06, shade(outfit.top, 0.6));
    }
    if (style === 'labcoat') {
      // An open white coat: the scrubs (outfit.shirt) showing down the middle, lapels, a breast
      // pocket with pens.
      if (front) {
        fill(ctx, x + w * 0.36, y, w * 0.28, h, outfit.shirt ?? 0x4a7aa0);
        ctx.fillStyle = css(skin); ctx.beginPath(); ctx.moveTo(x + w * 0.4, y); ctx.lineTo(x + w * 0.6, y); ctx.lineTo(x + w * 0.5, y + h * 0.18); ctx.closePath(); ctx.fill();
        for (const [a, b] of [[0.36, 0.3], [0.64, 0.7]]) { ctx.strokeStyle = css(shade(outfit.top, 0.8)); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w * a, y); ctx.lineTo(x + w * b, y + h * 0.35); ctx.stroke(); }
        fill(ctx, x + w * 0.12, y + h * 0.3, w * 0.18, h * 0.14, shade(outfit.top, 0.92)); fill(ctx, x + w * 0.12, y + h * 0.3, w * 0.18, 1, shade(outfit.top, 0.75));
        fill(ctx, x + w * 0.15, y + h * 0.24, 2, h * 0.1, 0x2a4ab0); fill(ctx, x + w * 0.2, y + h * 0.25, 2, h * 0.09, 0x1a1a1a);
      }
      if (back) fill(ctx, x + w * 0.49, y + h * 0.6, 1, h * 0.4, shade(outfit.top, 0.8));
    }
    if (front && style === 'cardigan') { fill(ctx, x + w * 0.42, y, w * 0.16, h, outfit.shirt ?? 0xd8d0c0); for (let k = 0; k < 5; k++) fill(ctx, x + w * 0.39, y + h * (0.12 + k * 0.17), 3, 3, shade(outfit.top, 0.55)); }
    if (front && style === 'gown') { blobs(ctx, x, y, w, h, shade(outfit.top, 0.8), Math.ceil((w * h) / 600), 3, r); fill(ctx, x + w * 0.4, y, w * 0.2, h * 0.06, shade(outfit.top, 0.75)); }
    if (front && style === 'scrubs') { ctx.fillStyle = css(skin); ctx.beginPath(); ctx.moveTo(x + w * 0.36, y); ctx.lineTo(x + w * 0.64, y); ctx.lineTo(x + w * 0.5, y + h * 0.24); ctx.closePath(); ctx.fill(); fill(ctx, x + w * 0.6, y + h * 0.3, w * 0.2, h * 0.14, shade(outfit.top, 0.85)); }
    if (style === 'leather') { if (front) { fill(ctx, x + w * 0.49, y, 2, h * 0.92, 0x9a9a9a); fill(ctx, x + w * 0.3, y, w * 0.4, h * 0.12, shade(outfit.top, 1.4)); } band(ctx, x, y, w, h, shade(outfit.top, 0.7), 0.9, 0.08); }
    if (front && outfit.tie) { fill(ctx, x + w * 0.46, y + h * 0.04, w * 0.08, h * 0.08, outfit.tie); fill(ctx, x + w * 0.465, y + h * 0.1, w * 0.07, h * 0.42, outfit.tie); }
    if (outfit.overalls && (front || back)) {
      fill(ctx, x + w * 0.24, y + h * 0.42, w * 0.52, h * 0.58, outfit.overalls);
      for (const px of [0.24, 0.66]) fill(ctx, x + w * px, y, w * 0.1, h * 0.45, outfit.overalls);
      if (front) { fill(ctx, x + w * 0.24, y + h * 0.4, w * 0.1, w * 0.1, 0xc0b060); fill(ctx, x + w * 0.66, y + h * 0.4, w * 0.1, w * 0.1, 0xc0b060); fill(ctx, x + w * 0.38, y + h * 0.5, w * 0.24, h * 0.16, shade(outfit.overalls, 0.85)); }
    }
    if (front && outfit.dogtags) { line2(ctx, x + w * 0.4, y, x + w * 0.5, y + h * 0.3, 0xb0b0b0); line2(ctx, x + w * 0.6, y, x + w * 0.5, y + h * 0.3, 0xb0b0b0); fill(ctx, x + w * 0.47, y + h * 0.3, w * 0.07, h * 0.08, 0xc8c8c8); }
  }
  // Prison stripes: black and white bands across every clothed part.
  if (outfit.prison && side !== 'top' && side !== 'bottom' && baseColor(outfit, skin, part) !== skin && part !== 'foot' && part !== 'hand') {
    const step = Math.max(4, Math.round(h / (part === 'torso' ? 8 : 4)));
    for (let j = 0; j < h; j += step * 2) fill(ctx, x, y + j, w, step, 0x1a1a1a);
  }
  // A sleeve insignia (a navy patch, a unit badge).
  if (outfit.patch && part === 'upper_arm' && (side === 'left' || side === 'right')) { fill(ctx, x + w * 0.25, y + h * 0.15, w * 0.5, h * 0.3, outfit.patch); fill(ctx, x + w * 0.35, y + h * 0.22, w * 0.3, h * 0.16, 0xd8c060); }
  // Lettering across the back and chest of a vest ("MP").
  if (outfit.text && part === 'torso' && (side === 'front' || side === 'back')) { ctx.fillStyle = '#f0f0f0'; ctx.font = `bold ${Math.round(h * 0.22)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(outfit.text, x + w / 2, y + h * (side === 'back' ? 0.4 : 0.55)); }
  // A logo and a name tag (a polo shirt).
  if (outfit.logo && part === 'torso' && side === 'front') { fill(ctx, x + w * 0.62, y + h * 0.2, w * 0.14, h * 0.1, outfit.logo); fill(ctx, x + w * 0.2, y + h * 0.22, w * 0.18, h * 0.07, 0xf0f0f0); }
  // Sequins: glints of colour all over (a dancer's top).
  if (outfit.sequins && (part === 'torso' || part === 'thigh') && baseColor(outfit, skin, part) !== skin) { const rr = rng(`sequins|${part}|${side}|${w}`); for (let i = 0; i < (w * h) / 30; i++) fill(ctx, x + rr() * w, y + rr() * h, 2, 2, rr() < 0.5 ? outfit.sequins : 0xfff0c0); }
  if (outfit.plaid && (part === 'upper_arm' || part === 'forearm') && baseColor(outfit, skin, part) !== skin && side !== 'top' && side !== 'bottom') plaid(ctx, x, y, w, h, outfit.plaid);
  if (outfit.overalls && (part === 'thigh' || part === 'shin') && side !== 'top' && side !== 'bottom') { if (part === 'thigh' && side === 'front') fill(ctx, x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.2, shade(outfit.overalls, 0.85)); }
  if (outfit.tapedHands && part === 'hand') { for (let k = 0; k < 4; k++) fill(ctx, x, y + h * (0.1 + k * 0.22), w, h * 0.12, 0xe0dcd0); }
  if (part === 'upper_arm' || part === 'forearm') {
    if (outfit.camo && baseColor(outfit, skin, part) !== skin) camo(ctx, x, y, w, h, outfit.camo, r);
    if (part === 'forearm' && outfit.sleeves === 'long') fill(ctx, x, y + h * 0.85, w, h * 0.15, shade(outfit.top, 0.75));
    if (part === 'upper_arm' && outfit.sleeves === 'short') fill(ctx, x, y + h * 0.8, w, h * 0.2, skin);
  }
  if ((part === 'thigh' || part === 'shin') && outfit.camo && outfit.pants === outfit.camo[0]) camo(ctx, x, y, w, h, outfit.camo, r);
  if (part === 'foot') { fill(ctx, x, y + h * 0.75, w, h * 0.25, shade(baseColor(outfit, skin, 'foot'), 0.55)); }
  if (outfit.stripes && ['torso', 'upper_arm', 'forearm', 'thigh', 'shin'].includes(part) && side !== 'top' && side !== 'bottom') {
    // Reflective trim: a yellow band edged in silver.
    const at = part === 'torso' ? [0.62, 0.86] : part === 'shin' ? [0.3] : [0.55];
    for (const a of at) { band(ctx, x, y, w, h, 0xc8c8c0, a - 0.02, 0.1); band(ctx, x, y, w, h, outfit.stripes, a, 0.06); }
  }
}
