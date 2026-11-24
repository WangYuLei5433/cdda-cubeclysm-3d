// Cubeclysm archetype zombies: 24 unbound models, one per archetype.
// Each one's clothes and props say who it was (a farmer has a straw hat and overalls, a
// bride a veil and a wedding dress…), so its name matches what you see. They are candidates to
// try on CDDA objects; recipes.js holds the zombies bound to CDDA ids.
//
// Families: wanderers (游荡者, shambling civilians), enraged (狂暴者, fast and furious),
// revenants (亡魂, the dead who keep what they were).

const CORPSE = 0x9ca393, PALE = 0xb0b0a0, GREY = 0x8e9286;
const n = (zh, en, ru) => ({ zh_CN: zh, en, ru });

export const ARCHETYPES = [
  // ── Wanderers ────────────────────────────────────────────────────────────────────────────
  {
    id: 'wanderer_hermit', names: n('游荡者 · 隐士', 'wanderer · hermit', 'бродяга · отшельник'),
    body: 'lanky', pose: 'hunched', skin: GREY, hair: 0x8a8a80, hairStyle: 'long', beard: 0x8a8a80,
    face: { eyes: 'cloudy', brows: 'sad', mouth: 'grimace', marks: ['rot'] },
    outfit: { style: 'coat', top: 0x5a4a36, sleeves: 'long', pants: 0x4a3e30, shoes: 0x3a2e22 },
    wear: { tears: 0.8, soot: 0.4 }, gear: ['beard'],
  },
  {
    id: 'wanderer_widow', names: n('游荡者 · 寡妇', 'wanderer · widow', 'бродяга · вдова'),
    body: 'lanky', pose: 'reach', skin: PALE, hair: 0x2a2228, hairStyle: 'bob', veil: 0x16141a, veilLength: 0.45, veilFace: true,
    face: { eyes: 'empty', brows: 'sad', mouth: 'stitched', marks: ['bruise'] },
    outfit: { style: 'dress', top: 0x1e1c22, sleeves: 'long', pants: 0x1e1c22, shoes: 0x111111, skirt: 0.6 },
    wear: { tears: 0.4, blood: 0.3 }, gear: ['skirt', 'veil'],
  },
  {
    id: 'wanderer_farmer', names: n('游荡者 · 农夫', 'wanderer · farmer', 'бродяга · фермер'),
    body: 'standard', pose: 'reach', skin: CORPSE, hair: 0x5a3a20, hairStyle: 'short',
    face: { eyes: 'oily', brows: 'flat', mouth: 'frown_teeth', marks: ['stubble'] },
    outfit: { style: 'shirt', top: 0xa03a2a, plaid: [0x5a1a14, 0x1a1a1a], sleeves: 'long', overalls: 0x3c5a8a, pants: 0x3c5a8a, shoes: 0x4a3420, gloves: 0x8a6a40 },
    wear: { tears: 0.4, blood: 0.4, soot: 0.3 }, gear: ['strawHat'],
  },
  {
    id: 'wanderer_elder', names: n('游荡者 · 老者', 'wanderer · elder', 'бродяга · старик'),
    body: 'standard', pose: 'hunched', skin: PALE, hair: 0xd0d0c8, hairStyle: 'balding',
    face: { eyes: 'cloudy', brows: 'raised', mouth: 'gape', marks: ['rot'] },
    outfit: { style: 'cardigan', top: 0x8a7a60, shirt: 0xd8d0c0, sleeves: 'long', pants: 0x5a5a5e, shoes: 0x5a3a2a },
    wear: { tears: 0.3, blood: 0.3 }, gear: ['glasses'],
  },
  {
    id: 'wanderer_teen', names: n('游荡者 · 少年', 'wanderer · teen', 'бродяга · подросток'),
    body: 'teen', pose: 'reach', skin: CORPSE, hair: 0x2a1e18, hairStyle: 'messy', gadget: 0xe0e0e0,
    face: { eyes: 'hungry', brows: 'angry', mouth: 'small_open', marks: ['blood_mouth'] },
    outfit: { style: 'hoodie', top: 0xa03030, sleeves: 'long', pants: 0x4a6aa0, shoes: 0xe8e8e8 },
    wear: { tears: 0.4, blood: 0.5 }, gear: ['headphones'],
  },
  {
    id: 'wanderer_crooked', names: n('游荡者 · 佝偻者', 'wanderer · crooked', 'бродяга · кривой'),
    body: 'standard', pose: 'crooked', skin: CORPSE, hair: 0x4a3a2a, hairStyle: 'messy',
    face: { eyes: 'uneven', brows: 'uneven', mouth: 'grimace', marks: ['scar_cheek'] },
    outfit: { style: 'tshirt', top: 0x6a7a5a, sleeves: 'short', pants: 0x4a4a52, shoes: 0x2a2a2a },
    wear: { tears: 0.7, blood: 0.5 },
  },
  {
    id: 'wanderer_sewn', names: n('游荡者 · 缝合者', 'wanderer · sewn', 'бродяга · сшитый'),
    body: 'standard', pose: 'stand', skin: PALE, hair: 0x3a3030, hairStyle: 'buzz',
    face: { eyes: 'narrow', brows: 'flat', mouth: 'stitched', marks: ['scar_eye', 'scar_cheek'] },
    outfit: { style: 'tank', top: 0xd8d4c8, sleeves: 'none', pants: 0x6a8a9a, shoes: 0x9a9a9a },
    wear: { stitches: 0.9, tears: 0.3, blood: 0.3 },
  },
  {
    id: 'wanderer_cracked', names: n('游荡者 · 裂颅者', 'wanderer · cracked skull', 'бродяга · с пробитым черепом'),
    body: 'standard', pose: 'reach', skin: CORPSE, hair: 0x3a2a1e, hairStyle: 'buzz',
    face: { eyes: 'one_eyed', brows: 'sad', mouth: 'frown_teeth', marks: ['blood_forehead'] },
    outfit: { style: 'shirt', top: 0xc8ccd8, sleeves: 'long', pants: 0x2a2e3a, shoes: 0x1a1a1a, tie: 0x6a1a2a },
    wear: { tears: 0.4, blood: 0.7 }, gear: ['crackedSkull'],
  },
  // ── Enraged ──────────────────────────────────────────────────────────────────────────────
  {
    id: 'enraged_screamer', names: n('狂暴者 · 尖叫者', 'enraged · screamer', 'бешеный · крикун'),
    body: 'lanky', pose: 'hunched', skin: PALE, hair: 0x3a3028, hairStyle: 'long',
    face: { eyes: 'wide', brows: 'raised', mouth: 'gape', marks: ['blood_mouth'] },
    outfit: { style: 'tank', top: 0x4a4a52, sleeves: 'none', pants: 0x2a2a30, shoes: 0x2a2a2a },
    wear: { veins: 0x6a3a4a, tears: 0.5, blood: 0.4 },
  },
  {
    id: 'enraged_grinder', names: n('狂暴者 · 磨牙者', 'enraged · grinder', 'бешеный · скрежет'),
    body: 'tough', pose: 'hunched', skin: CORPSE, hair: 0x1e1a18, hairStyle: 'buzz',
    face: { eyes: 'squint_angry', brows: 'furrowed', mouth: 'grimace', marks: ['scar_cheek'] },
    outfit: { style: 'coveralls', top: 0x5a5a4a, sleeves: 'long', pants: 0x5a5a4a, shoes: 0x2a2218, gloves: 0x3a3a3a },
    wear: { tears: 0.4, blood: 0.4, soot: 0.5 },
  },
  {
    id: 'enraged_brawler', names: n('狂暴者 · 斗殴者', 'enraged · brawler', 'бешеный · драчун'),
    body: 'tough', pose: 'hunched', skin: CORPSE, hair: 0x2a1e18, hairStyle: 'mohawk',
    face: { eyes: 'squint_angry', brows: 'angry', mouth: 'snarl', marks: ['bruise', 'blood_forehead'] },
    outfit: { style: 'leather', top: 0x1e1c1c, sleeves: 'long', pants: 0x2a3040, shoes: 0x1a1a1a, tapedHands: true },
    wear: { tears: 0.3, blood: 0.6 },
  },
  {
    id: 'enraged_heavy', names: n('狂暴者 · 重型', 'enraged · heavy', 'бешеный · тяжёлый'),
    body: 'fat', pose: 'hunched', skin: 0xa3a08e, hair: 0x3a2a1e, hairStyle: 'buzz',
    face: { eyes: 'narrow', brows: 'furrowed', mouth: 'snarl', marks: ['stubble'] },
    outfit: { style: 'tshirt', top: 0x3a4a3a, sleeves: 'short', pants: 0x2a2a2e, shoes: 0x2a2a2a },
    wear: { tears: 0.5, blood: 0.5 }, gear: ['belly'],
  },
  {
    id: 'enraged_lanky', names: n('狂暴者 · 瘦高者', 'enraged · lanky', 'бешеный · долговязый'),
    body: 'elongated', pose: 'reach', skin: PALE, hair: 0x2a2018, hairStyle: 'spiky',
    face: { eyes: 'wide', brows: 'angry', mouth: 'gnaw', marks: ['blood_mouth'] },
    outfit: { style: 'tshirt', top: 0x5a5a6a, sleeves: 'short', pants: 0x3a3a44, shoes: 0x2a2a2a },
    wear: { tears: 0.6, blood: 0.6, bloodyHands: true },
  },
  {
    id: 'enraged_fury', names: n('狂暴者 · 狂怒者', 'enraged · fury', 'бешеный · ярость'),
    body: 'tough', pose: 'hunched', skin: 0x9a8a80, hair: 0x1a1414, hairStyle: 'spiky', eye: 0xd02020,
    face: { eyes: 'glow', brows: 'angry', mouth: 'snarl', marks: ['scar_eye'] },
    outfit: { style: 'tank', top: 0x9a8a80, sleeves: 'none', pants: 0x2a2a30, shoes: 0x2a2a2a },
    wear: { wounds: 0.4, blood: 0.6, veins: 0x7a2a2a },
  },
  {
    id: 'enraged_torn', names: n('狂暴者 · 撕裂者', 'enraged · torn', 'бешеный · рваный'),
    body: 'standard', pose: 'hunched', skin: CORPSE, hair: 0x3a2a1e, hairStyle: 'messy',
    face: { eyes: 'one_eyed', brows: 'furrowed', mouth: 'grimace', marks: ['rot', 'blood_mouth'] },
    outfit: { style: 'shirt', top: 0x6a6a5a, sleeves: 'long', pants: 0x3a3f4a, shoes: 0x2a211a },
    wear: { tears: 1, blood: 0.8, wounds: 0.3 }, gear: ['missingForearm'],
  },
  {
    id: 'enraged_fever', names: n('狂暴者 · 热病者', 'enraged · fever', 'бешеный · горячка'),
    body: 'lanky', pose: 'hunched', skin: 0xc0a080, hair: 0x4a3a2a, hairStyle: 'messy', eye: 0xd8c020,
    face: { eyes: 'glow', brows: 'sad', mouth: 'drool', marks: ['veins'] },
    outfit: { style: 'gown', top: 0x9ab8d0, sleeves: 'short', pants: 0x9ab8d0, shoes: 0x9ab8d0 },
    wear: { veins: 0xc8a020, tears: 0.3, blood: 0.2 },
  },
  // ── Revenants ────────────────────────────────────────────────────────────────────────────
  {
    id: 'revenant_undertaker', names: n('亡魂 · 殡葬工', 'revenant · undertaker', 'призрак · гробовщик'),
    body: 'lanky', pose: 'stand', skin: PALE, hair: 0x1e1a18, hairStyle: 'short',
    face: { eyes: 'cloudy', brows: 'flat', mouth: 'stitched' },
    outfit: { style: 'formal', top: 0x16161a, shirt: 0xe0e0d8, tie: 0x0e0e10, sleeves: 'long', pants: 0x16161a, shoes: 0x0a0a0a, gloves: 0xe0e0d8 },
    wear: { tears: 0.2, soot: 0.3 }, gear: ['topHat'],
  },
  {
    id: 'revenant_drowned', names: n('亡魂 · 溺亡者', 'revenant · drowned', 'призрак · утопленник'),
    body: 'fat', pose: 'reach', skin: 0x8aa0a8, hair: 0x2a3a30, hairStyle: 'long',
    face: { eyes: 'cloudy', brows: 'sad', mouth: 'gape', marks: ['rot'] },
    outfit: { style: 'shirt', top: 0x3a5068, sleeves: 'long', pants: 0x2a3848, shoes: 0x2a2a2a },
    wear: { tears: 0.6, wounds: 0.2 }, gear: ['seaweed'],
  },
  {
    id: 'revenant_miner', names: n('亡魂 · 矿工', 'revenant · miner', 'призрак · шахтёр'),
    body: 'tough', pose: 'stand', skin: GREY, hair: 0x2a2420, hairStyle: 'short',
    face: { eyes: 'oily', brows: 'angry', mouth: 'grin', marks: ['coal_dust'] },
    outfit: { style: 'coveralls', top: 0x4a3a2a, sleeves: 'long', pants: 0x4a3a2a, shoes: 0x2a2218, gloves: 0x5a4a32, stripes: 0xd89a20 },
    wear: { soot: 1, tears: 0.4 }, gear: ['minerHelmet', 'lampBattery'],
  },
  {
    id: 'revenant_bride', names: n('亡魂 · 新娘', 'revenant · bride', 'призрак · невеста'),
    body: 'lanky', pose: 'stand', skin: PALE, hair: 0x5a3a2a, hairStyle: 'long', veil: 0xf0eee8, veilLength: 0.75,
    face: { eyes: 'empty', brows: 'raised', mouth: 'small_open', marks: ['blood_forehead'] },
    outfit: { style: 'dress', top: 0xece8e0, sleeves: 'short', pants: 0xece8e0, shoes: 0xece8e0, skirt: 0.82, gloves: 0xf4f2ec },
    wear: { blood: 0.8, tears: 0.3 }, gear: ['skirt', 'veil', 'bouquet'],
  },
  {
    id: 'revenant_soldier', names: n('亡魂 · 士兵', 'revenant · soldier', 'призрак · солдат'),
    body: 'standard', pose: 'stand', skin: CORPSE, hair: 0x2a2018, hairStyle: 'buzz', hat: 0x6a1a1a,
    face: { eyes: 'narrow', brows: 'flat', mouth: 'grimace', marks: ['scar_eye'] },
    outfit: { style: 'uniform', top: 0x4a5236, sleeves: 'long', pants: 0x4a5236, shoes: 0x2a2418, dogtags: true },
    wear: { tears: 0.5, blood: 0.5 }, gear: ['beret'],
  },
  {
    id: 'revenant_crone', names: n('亡魂 · 老妪', 'revenant · crone', 'призрак · старуха'),
    body: 'lanky', pose: 'crooked', skin: PALE, hair: 0xd8d8d0, hairStyle: 'long', shawl: 0x5a3a4a,
    face: { eyes: 'cloudy', brows: 'uneven', mouth: 'gape', marks: ['rot', 'bruise'] },
    outfit: { style: 'dress', top: 0x3a3438, sleeves: 'long', pants: 0x3a3438, shoes: 0x1a1a1a, skirt: 0.7 },
    wear: { tears: 0.4 }, gear: ['skirt', 'shawl', 'cane'],
  },
  {
    id: 'revenant_surgeon', names: n('亡魂 · 外科医生', 'revenant · surgeon', 'призрак · хирург'),
    body: 'standard', pose: 'reach', skin: CORPSE, hair: 0x3a2a1e, hairStyle: 'short',
    face: { eyes: 'oily', brows: 'flat', mouth: 'frown_teeth', marks: ['scar_cheek'] },
    outfit: { style: 'scrubs', top: 0x4a8a8a, sleeves: 'short', pants: 0x4a8a8a, shoes: 0xd8d8d8, gloves: 0xd8e4ea },
    wear: { blood: 0.9, tears: 0.2 }, gear: ['surgicalCap', 'surgicalMask'],
  },
  {
    id: 'revenant_farmhand', names: n('亡魂 · 农场工', 'revenant · farmhand', 'призрак · батрак'),
    body: 'teen', pose: 'reach', skin: CORPSE, hair: 0x8a5a2a, hairStyle: 'short', hat: 0x2a5a2a,
    face: { eyes: 'hungry', brows: 'raised', mouth: 'frown_teeth', marks: ['blood_mouth'] },
    outfit: { style: 'shirt', top: 0x5a7a9a, sleeves: 'long', pants: 0x6a5a40, shoes: 0x4a3420, gloves: 0x8a6a40 },
    wear: { tears: 0.5, blood: 0.4, soot: 0.3 }, gear: ['truckerCap', 'bandanaNeck'],
  },
];
