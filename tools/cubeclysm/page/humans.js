// Cubeclysm humans: the player and NPC models (bound to cataclysm-3d's player_* / npc_* ids) and
// nine survivors to browse and try on. Faces are mixed from the human face parts (faces.js, h_…):
// eye shapes with a coloured iris, brows, mouths, facial hair and marks, on varied skin tones.

const SKIN = { light: 0xf0cdb0, fair: 0xe4b892, medium: 0xc8946a, tan: 0xa8744e, brown: 0x80563a, dark: 0x5a3c2a };
const IRIS = { brown: 0x5a3a20, blue: 0x3a6ab0, green: 0x3a8a4a, grey: 0x6a7a8a, hazel: 0x8a6a30, dark: 0x2a1a10 };
const n = (zh, en, ru) => ({ zh_CN: zh, en, ru });

export const HUMANS = [
  {
    id: 'human_male', bound: ['player_male', 'npc_male'], body: 'standard', pose: 'stand', skin: SKIN.fair, hair: 0x4a3020, hairStyle: 'short', eye: IRIS.brown,
    face: { eyes: 'h_iris', brows: 'h_thick', mouth: 'h_neutral', marks: ['h_nose', 'stubble'] },
    outfit: { style: 'coat', top: 0x4a5236, sleeves: 'long', pants: 0x3a4a6a, shoes: 0x3a2a1a, gloves: 0x3a3028 },
    wear: { tears: 0.15, soot: 0.2 }, gear: ['backpack'],
  },
  {
    id: 'human_female', bound: ['player_female', 'npc_female'], body: 'female', pose: 'stand', skin: SKIN.medium, hair: 0x2a1a12, hairStyle: 'ponytail', eye: IRIS.green,
    face: { eyes: 'h_lashes', brows: 'h_arched', mouth: 'h_lips', marks: ['h_nose'] },
    outfit: { style: 'hoodie', top: 0x6a6e74, sleeves: 'long', pants: 0x5a5440, shoes: 0x3a2a1a },
    wear: { tears: 0.15, soot: 0.2 }, gear: ['backpack'],
  },
  {
    id: 'survivor_father', names: n('幸存者 · 父亲', 'survivor · father', 'выживший · отец'), body: 'standard', pose: 'stand', skin: SKIN.light, hair: 0x6a4a2a, hairStyle: 'short', beard: 0x6a4a2a, eye: IRIS.blue,
    face: { eyes: 'h_tired', brows: 'h_stern', mouth: 'h_neutral', marks: ['h_wrinkles', 'h_nose'] },
    outfit: { style: 'shirt', top: 0x8a2a2a, plaid: [0x3a1010, 0x1a1a1a], sleeves: 'long', pants: 0x3c5a8a, shoes: 0x4a3420 },
    wear: { tears: 0.2 }, gear: ['beard'],
  },
  {
    id: 'survivor_daughter', names: n('幸存者 · 女儿', 'survivor · daughter', 'выживший · дочь'), body: 'teen', pose: 'stand', skin: SKIN.light, hair: 0xc8a050, hairStyle: 'pigtails', eye: IRIS.blue,
    face: { eyes: 'h_wide', brows: 'h_thin', mouth: 'h_smile', marks: ['h_freckles', 'h_blush'] },
    outfit: { style: 'tshirt', top: 0xd87890, sleeves: 'short', pants: 0x4a6aa0, shoes: 0xe8e8e8 },
    wear: {}, gear: ['backpack'],
  },
  {
    id: 'survivor_max', names: n('幸存者 · 马克斯', 'survivor · Max', 'выживший · Макс'), body: 'tough', pose: 'stand', skin: SKIN.tan, hair: 0x1a1410, hairStyle: 'buzz', eye: IRIS.dark,
    face: { eyes: 'h_narrow', brows: 'h_bushy', mouth: 'h_smirk', marks: ['h_scar_lip'] },
    outfit: { style: 'tank', top: 0x3a4030, sleeves: 'none', pants: 0x4a4a38, shoes: 0x2a2418, dogtags: true },
    wear: { soot: 0.2 },
  },
  {
    id: 'survivor_lea', names: n('幸存者 · 莉娅', 'survivor · Lea', 'выживший · Леа'), body: 'female', pose: 'stand', skin: SKIN.brown, hair: 0x1a1210, hairStyle: 'afro', eye: IRIS.hazel,
    face: { eyes: 'h_almond', brows: 'h_arched', mouth: 'h_lips', marks: ['h_eyeliner', 'h_mole'] },
    outfit: { style: 'leather', top: 0x5a3020, sleeves: 'long', pants: 0x1e1e24, shoes: 0x1a1a1a },
    wear: {},
  },
  {
    id: 'survivor_sam', names: n('幸存者 · 山姆', 'survivor · Sam', 'выживший · Сэм'), body: 'lanky', pose: 'stand', skin: SKIN.medium, hair: 0x5a3a20, hairStyle: 'curtains', eye: IRIS.grey,
    face: { eyes: 'h_iris', brows: 'h_worried', mouth: 'h_talk', marks: ['h_freckles'] },
    outfit: { style: 'hoodie', top: 0x3a6a4a, sleeves: 'long', pants: 0x3a3a44, shoes: 0xd0d0d0 },
    wear: {}, gear: ['glasses'],
  },
  {
    id: 'survivor_man', names: n('幸存者 · 男人', 'survivor · man', 'выживший · мужчина'), body: 'standard', pose: 'stand', skin: SKIN.dark, hair: 0x141010, hairStyle: 'receding', eye: IRIS.dark,
    face: { eyes: 'h_dot', brows: 'h_thick', mouth: 'h_grin', marks: ['h_goatee'] },
    outfit: { style: 'shirt', top: 0x3a5a8a, sleeves: 'long', pants: 0x2a2a30, shoes: 0x2a2018, overalls: 0x6a5a3a },
    wear: { soot: 0.2 },
  },
  {
    id: 'survivor_woman', names: n('幸存者 · 女人', 'survivor · woman', 'выживший · женщина'), body: 'female', pose: 'stand', skin: SKIN.fair, hair: 0x9a3a1a, hairStyle: 'bob', eye: IRIS.blue,
    face: { eyes: 'h_lashes', brows: 'h_thin', mouth: 'h_smile', marks: ['h_dimples', 'h_blush'] },
    outfit: { style: 'cardigan', top: 0x7a8a6a, shirt: 0xe0d8c8, sleeves: 'long', pants: 0x4a4a5a, shoes: 0x5a3a2a },
    wear: {},
  },
  {
    id: 'survivor_elder', names: n('幸存者 · 老人', 'survivor · elder', 'выживший · старик'), body: 'standard', pose: 'hunched', skin: SKIN.light, hair: 0xd8d8d0, hairStyle: 'balding', eye: IRIS.grey,
    face: { eyes: 'h_heavy_lids', brows: 'h_bushy', mouth: 'h_sad', marks: ['h_mustache', 'h_wrinkles'] },
    outfit: { style: 'cardigan', top: 0x6a5a48, shirt: 0xd8d0c0, sleeves: 'long', pants: 0x5a5a5e, shoes: 0x3a2a1a },
    wear: {}, gear: ['glasses', 'cane'],
  },
  {
    id: 'survivor_raider', names: n('幸存者 · 掠夺者', 'survivor · raider', 'выживший · рейдер'), body: 'standard', pose: 'stand', skin: SKIN.tan, hair: 0x2a1a12, hairStyle: 'mohawk', eye: IRIS.brown, bandana: 0x8a1a1a,
    face: { eyes: 'h_narrow', brows: 'h_stern', mouth: 'h_gritted', marks: ['h_scar_lip'] },
    outfit: { style: 'leather', top: 0x1e1c1c, sleeves: 'long', pants: 0x2a2a30, shoes: 0x1a1a1a, gloves: 0x1a1a1a, straps: 0x3a3028 },
    wear: { soot: 0.3, blood: 0.2 }, gear: ['faceBandana'],
  },
];
