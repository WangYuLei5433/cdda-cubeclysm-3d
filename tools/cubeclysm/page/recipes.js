// Cubeclysm zombies, batch 1: the core zombies of CDDA. Faces are mixed from parts (faces.js:
// eyes, brows, mouth, marks), hair is a 3D style (hair.js). Each recipe follows the monster's CDDA
// description (quoted in `desc`, CDDA 7136388): its body type, clothes, wear, face and the 3D
// gear or odd features it needs. Built by humanoid.js, painted by paint.js.

const CORPSE = 0x9ca393;

export const RECIPES = [
  {
    id: 'mon_zombie', desc: 'A human body, swaying as it moves, an unstoppable rage visible in its oily black eyes.',
    body: 'standard', pose: 'reach', skin: CORPSE, hair: 0x3a2a1e, face: { eyes: 'oily', brows: 'angry', mouth: 'frown_teeth', marks: ['scar_cheek'] }, hairStyle: 'messy',
    outfit: { style: 'shirt', top: 0x5f6f86, sleeves: 'long', pants: 0x3a3f4a, shoes: 0x2a211a },
    wear: { tears: 0.6, blood: 0.5 },
  },
  {
    id: 'mon_zombie_fat', desc: 'Stumbling as it moves, this corpse of an overweight human regards its surroundings with an empty black gaze.',
    body: 'fat', pose: 'reach', skin: 0xa3a08e, hair: 0x5a4a3a, face: { eyes: 'empty', brows: 'sad', mouth: 'gape', marks: ['stubble'] }, hairStyle: 'balding',
    outfit: { style: 'tshirt', top: 0xa45a3c, sleeves: 'short', pants: 0x4a5568, shoes: 0x3a3a3a },
    wear: { tears: 0.4, blood: 0.4 }, gear: ['belly'],
  },
  {
    id: 'mon_zombie_tough', desc: 'This was once an athletic human, now a brutal monster. Its facial features are twisted into an expression of pure rage.',
    body: 'tough', pose: 'hunched', skin: 0x99a08c, hair: 0x1e1a18, face: { eyes: 'squint_angry', brows: 'furrowed', mouth: 'snarl', marks: ['scar_eye', 'bruise'] }, hairStyle: 'buzz',
    outfit: { style: 'tank', top: 0x2c2c2c, sleeves: 'none', pants: 0x3c4048, shoes: 0xd8d8d8 },
    wear: { tears: 0.3, blood: 0.5 },
  },
  {
    id: 'mon_zombie_child', desc: 'It was only a child, and little is different about it now aside from the hungry look in its eyes.',
    body: 'child', pose: 'reach', skin: 0xa8ab9c, hair: 0x8a5a2a, face: { eyes: 'hungry', brows: 'raised', mouth: 'small_open', marks: ['blood_mouth'] }, hairStyle: 'bob',
    outfit: { style: 'tshirt', top: 0xd8b040, sleeves: 'short', pants: 0x4a6aa0, shoes: 0xc04040 },
    wear: { tears: 0.3, blood: 0.3 }, gear: ['backpack'],
  },
  {
    id: 'mon_zombie_runner', desc: 'This recently-risen body moves quickly, darting its head back and forth and gnawing at its hands.',
    body: 'lanky', pose: 'hunched', skin: 0xbfa996, hair: 0x2a1e18, face: { eyes: 'wide', brows: 'angry', mouth: 'gnaw', marks: ['blood_mouth'] }, hairStyle: 'spiky',
    outfit: { style: 'hoodie', top: 0x4a5a8a, sleeves: 'long', pants: 0x2a2a30, shoes: 0xd0d0d0 },
    wear: { tears: 0.3, blood: 0.6, bloodyHands: true },
  },
  {
    id: 'mon_zombie_crawler', desc: 'This human corpse drags itself along slowly with its arms. Its legs are damaged beyond repair.',
    body: 'crawler', skin: CORPSE, hair: 0x4a3a2a, face: { eyes: 'uneven', brows: 'sad', mouth: 'grimace', marks: ['blood_forehead', 'rot'] }, hairStyle: 'messy',
    outfit: { style: 'shirt', top: 0x8a7a5a, sleeves: 'long', pants: 0x3a3f4a, shoes: 0x2a211a },
    wear: { tears: 0.8, blood: 0.8 },
  },
  {
    id: 'mon_zombie_brute', desc: "This zombie's entire body bulges with distended muscles and swollen, festering wounds.",
    body: 'brute', pose: 'hunched', skin: 0x8f8a78, hair: null, face: { eyes: 'narrow', brows: 'furrowed', mouth: 'snarl', marks: ['rot', 'scar_cheek'] }, hairStyle: 'bald', eye: 0x200a0a,
    outfit: { style: 'tank', top: 0x4a4038, sleeves: 'none', pants: 0x3a3530, shoes: 0x6e6a5c },
    wear: { wounds: 0.4, tears: 0.6, blood: 0.5 }, gear: ['hump', 'muscles'],
  },
  {
    id: 'mon_zombie_hulk', desc: 'A human corpse swollen to the size of six men, with arms as wide as trash cans.',
    body: 'giant', pose: 'hunched', skin: 0x857a6a, hair: null, face: { eyes: 'narrow', brows: 'furrowed', mouth: 'grimace', marks: ['bruise'] }, hairStyle: 'bald', eye: 0x200a0a,
    outfit: { style: 'tank', top: 0x857a6a, sleeves: 'none', pants: 0x3a332c, shoes: 0x6a5f50 },
    wear: { wounds: 0.45, blood: 0.3 }, gear: ['lumps', 'muscles', 'hump'],
  },
  {
    id: 'mon_zombie_cop', desc: 'A human body covered by a weather-beaten and badly damaged set of police gear.',
    body: 'standard', pose: 'reach', skin: CORPSE, hair: 0x2a2018, face: { eyes: 'one_eyed', brows: 'flat', mouth: 'frown_teeth', marks: ['blood_forehead'] }, hairStyle: 'short',
    outfit: { style: 'uniform', top: 0x1f2b45, sleeves: 'long', pants: 0x1a2236, shoes: 0x111111, belt: 0x111111 },
    wear: { tears: 0.7, blood: 0.6 }, gear: ['policeCap', 'badge', 'dutyBelt', 'radio'],
  },
  {
    id: 'mon_zombie_fireman', desc: 'A decaying human body clad in tattered firefighting gear. It staggers aimlessly, reeking of smoke and decay. Its protective mask prevents it from attempting to bite you.',
    body: 'standard', bulk: 0.04, pose: 'stand', skin: CORPSE, hair: null, face: { eyes: 'cloudy', brows: 'flat', mouth: 'stitched', marks: ['coal_dust'] }, hairStyle: 'bald',
    outfit: { style: 'coat', top: 0x8a7440, sleeves: 'long', pants: 0x8a7440, shoes: 0x1a1a1a, gloves: 0x3a3020, stripes: 0xd8d020, straps: 0x222222 },
    wear: { tears: 0.6, blood: 0.2, soot: 0.8 }, gear: ['fireHelmet', 'fireMask', 'airTank'],
  },
  {
    id: 'mon_zombie_soldier', desc: 'Once a soldier, it is dressed head to toe in combat gear and carries itself rather steadily for a zombie.',
    body: 'standard', pose: 'stand', skin: CORPSE, hair: 0x2a2018, face: { eyes: 'oily', brows: 'flat', mouth: 'grimace', marks: ['scar_eye'] }, hairStyle: 'buzz',
    outfit: { style: 'uniform', top: 0x5a6040, camo: [0x5a6040, 0x3e4430, 0x7a7050, 0x2e3226], sleeves: 'long', pants: 0x5a6040, shoes: 0x2a2418, gloves: 0x2e2e28 },
    wear: { tears: 0.3, blood: 0.4 }, gear: ['combatHelmet', 'tacticalVest', 'kneePads'],
  },
  {
    id: 'mon_zombie_hazmat', desc: 'This zombie is completely encased in a protective suit that apparently failed to protect it from whatever this infection is.',
    body: 'standard', bulk: 0.05, pose: 'stand', skin: CORPSE, hair: null, face: { eyes: 'cloudy', brows: 'sad', mouth: 'gape' }, hairStyle: 'bald',
    outfit: { style: 'suit', top: 0xd8c020, sleeves: 'long', pants: 0xd8c020, shoes: 0x2a2a2a, gloves: 0x2a2a2a },
    wear: { tears: 0.25, blood: 0.3 }, gear: ['hazmatHood'],
  },
  {
    id: 'mon_zombie_shrieker', desc: 'An elongated human body with a swollen chest and a gaping hole where its jaw used to be.',
    body: 'elongated', pose: 'hunched', skin: 0xb0b0a0, hair: 0x3a3028, face: { eyes: 'wide', brows: 'raised', mouth: 'jawless' }, hairStyle: 'long',
    outfit: { style: 'tshirt', top: 0x6a5a6a, sleeves: 'short', pants: 0x3a3a44, shoes: 0x2a2a2a },
    wear: { tears: 0.6, blood: 0.6 }, gear: ['chestSwell', 'jawStumps'],
  },
  {
    id: 'mon_zombie_acidic', desc: 'A sickly-looking zombie. Its skin looks especially thin, with a sticky, yellow fluid flowing through the clearly visible veins.',
    body: 'standard', pose: 'reach', skin: 0xb8b47a, hair: 0x4a4030, face: { eyes: 'glow', brows: 'sad', mouth: 'drool', marks: ['veins'] }, hairStyle: 'balding', eye: 0x8a7a10,
    outfit: { style: 'shirt', top: 0x7a7a6a, sleeves: 'short', pants: 0x4a4a3a, shoes: 0x2a2a2a },
    wear: { veins: 0xd8c020, tears: 0.5, blood: 0.2 }, gear: ['drips'],
  },
  {
    id: 'mon_zombie_miner', desc: "This zombie's face, hands, work clothes, and miner's helmet are fully covered with stains of coal dust.",
    body: 'standard', pose: 'stand', skin: 0x8e9286, hair: 0x2a2420, face: { eyes: 'oily', brows: 'angry', mouth: 'grin', marks: ['coal_dust', 'bandage'] }, hairStyle: 'short',
    outfit: { style: 'coveralls', top: 0x34405a, sleeves: 'long', pants: 0x34405a, shoes: 0x2a2218, gloves: 0x5a4a32, stripes: 0xd89a20 },
    wear: { soot: 1, tears: 0.4, blood: 0.2 }, gear: ['minerHelmet', 'lampBattery'],
  },
  {
    id: 'mon_zombie_medical', desc: 'This shambling corpse is dressed like a medical professional. It was either a doctor, or only played one on TV.',
    body: 'standard', pose: 'reach', skin: CORPSE, hair: 0x5a4a3a, hairStyle: 'sidePart',
    face: { eyes: 'oily', brows: 'flat', mouth: 'frown_teeth', marks: ['blood_mouth'] },
    outfit: { style: 'labcoat', top: 0xeceae4, shirt: 0x4a7aa0, sleeves: 'long', pants: 0x4a7aa0, shoes: 0xd8d8d8, gloves: 0xd8e4ea },
    wear: { blood: 0.7, tears: 0.3 }, gear: ['coatTails', 'stethoscope', 'idBadge', 'maskDown', 'glasses'],
  },
  // ── Mutants with effects (fx: a looping "FX" clip, independent of the rig) ────────────────
  {
    id: 'mon_beekeeper', desc: 'A deformed human body, its skin transformed into one thick, calloused envelope of scar tissue.',
    body: 'standard', pose: 'hunched', skin: 0x8a5a48, hair: null, face: { eyes: 'narrow', brows: 'furrowed', mouth: 'stitched', marks: ['scar_cheek', 'scar_eye'] },
    outfit: { style: 'tank', top: 0x8a5a48, sleeves: 'none', pants: 0x3a3028, shoes: 0x6a4a3a },
    wear: { scab: true, tears: 0.6 }, gear: ['scabPlates'], fx: ['scabFlakes'],
  },
  {
    id: 'mon_boomer', desc: 'A rotund human body, bloated beyond belief and layered in rolls of fat. It emits a horrible odor, and a putrid pink sludge dribbles from its mouth.',
    body: 'bloated', pose: 'reach', skin: 0xa0a088, hair: 0x4a3a2a, hairStyle: 'balding', face: { eyes: 'empty', brows: 'sad', mouth: 'gape', marks: ['rot', 'stubble'] },
    outfit: { style: 'tank', top: 0xa0a088, sleeves: 'none', pants: 0x4a4a52, shoes: 0x5a5448 },
    wear: { wounds: 0.3, tears: 0.6 }, gear: ['fatRolls'], fx: ['sludge', 'stench', 'heave'],
  },
  {
    id: 'mon_zombie_gasbag', desc: 'With its gray skin swollen to near-rupture with putrid gas, this cyst-covered zombie looks like it could violently burst under the slightest of disturbances.',
    body: 'bloated', pose: 'stand', skin: 0x8a8c84, hair: null, face: { eyes: 'narrow', brows: 'sad', mouth: 'grimace', marks: ['rot', 'veins'] },
    outfit: { style: 'tank', top: 0x8a8c84, sleeves: 'none', pants: 0x3a3a3e, shoes: 0x6a6c64 },
    wear: { veins: 0x6a6e60, tears: 0.6 }, gear: ['cysts'], fx: ['cystPulse', 'gasLeak'],
  },
  {
    id: 'mon_skeleton', desc: "A monstrous overgrowth of ossified tissue has replaced this zombie's rotting skin with an organic armor of dense bone. Large clumps of black goo seep from its joints as it shambles aimlessly.",
    body: 'lanky', pose: 'reach', skin: 0xd8d0b8, hair: null, eye: 0x0a0a0a, face: { eyes: 'empty', brows: 'none', mouth: 'grimace' },
    outfit: { style: 'tank', top: 0xd8d0b8, sleeves: 'none', pants: 0x2a2826, shoes: 0xd8d0b8 },
    wear: { bone: true, tears: 0.8 }, skull: true, gear: ['skeletalBody'], fx: ['goo'],
  },
  {
    id: 'mon_skeleton_brute', desc: "Distorted outgrowths of calcified bone plates cover this zombie's rotten skin. Joints and cracks around its body ooze with black goo.",
    body: 'brute', pose: 'hunched', skin: 0xd8d0b8, hair: null, face: { eyes: 'empty', brows: 'none', mouth: 'snarl' },
    outfit: { style: 'tank', top: 0xd8d0b8, sleeves: 'none', pants: 0x2a2826, shoes: 0xd8d0b8 },
    wear: { bone: true, tears: 0.8 }, skull: true, boneScale: 1.7, gear: ['skeletalBody', 'boneSpikes', 'calcified'], fx: ['goo'],
  },
];

// ── Batch 2: variants. Each starts from the recipe of its base zombie and changes what its own
// description changes: `outfit`, `wear` and `face` merge over the base's; `gear`/`fx` replace the
// base's when given, `more`/`moreFx` add to them and `drop` removes some.
const recipeOf = (id) => RECIPES.find((r) => r.id === id);
function variant(baseId, o) {
  const b = recipeOf(baseId);
  const { more = [], drop = [], moreFx = [], ...rest } = o;
  return {
    ...b, ...rest, base: baseId,
    outfit: o.newOutfit ? o.newOutfit : { ...b.outfit, ...o.outfit },
    wear: { ...b.wear, ...o.wear },
    face: { ...b.face, ...o.face },
    gear: [...(o.gear ?? b.gear ?? []).filter((g) => !drop.includes(g)), ...more],
    fx: [...(o.fx ?? b.fx ?? []), ...moreFx],
  };
}
const PRISON = { prison: true, top: 0xe8e6de, pants: 0xe8e6de, shoes: 0x2a2a2a };
const NAVY = 0x1c2638;
const BLACKOPS = [0x1e1f22, 0x2c2e32, 0x141416, 0x3a3c40];

RECIPES.push(
  // Prisoners: black-and-white stripes, tattoos, broken cuffs.
  variant('mon_zombie', {
    id: 'mon_zombie_prisoner', desc: 'Apparently this zombie was doing time when the Cataclysm struck. It wears black and white striped prisoner clothes, and tattoos can be seen on its decaying skin.',
    hair: 0x1e1a18, hairStyle: 'buzz', face: { eyes: 'oily', brows: 'furrowed', mouth: 'snarl', marks: ['scar_cheek', 'stubble'] },
    newOutfit: { style: 'shirt', sleeves: 'short', ...PRISON }, wear: { tattoos: 1 }, gear: ['cuffs'],
  }),
  variant('mon_zombie_brute', { id: 'mon_zombie_prisoner_brute', desc: 'This muscular zombie wears black and white striped prisoner clothes.', newOutfit: { style: 'tank', sleeves: 'none', ...PRISON }, wear: { tattoos: 0.8 }, more: ['cuffs'] }),
  variant('mon_zombie_fat', { id: 'mon_zombie_prisoner_fat', desc: 'This fat zombie wears black and white striped prisoner clothes.', hairStyle: 'buzz', newOutfit: { style: 'tshirt', sleeves: 'short', ...PRISON }, wear: { tattoos: 0.7 }, more: ['cuffs'] }),
  variant('mon_zombie_tough', { id: 'mon_zombie_prisoner_tough', desc: 'This tough-looking zombie wears black and white striped prisoner clothes.', hairStyle: 'undercut', newOutfit: { style: 'tank', sleeves: 'none', ...PRISON }, wear: { tattoos: 1 }, more: ['cuffs'] }),
  // Military.
  variant('mon_zombie_soldier', {
    id: 'mon_zombie_milbase_personnel', desc: 'This undead soldier is adorned in standard military fatigues. It carries itself rather steadily for a zombie.',
    hairStyle: 'short', face: { eyes: 'empty', brows: 'flat', mouth: 'frown_teeth', marks: ['bruise'] }, outfit: { gloves: undefined, dogtags: true }, gear: ['patrolCap'],
  }),
  variant('mon_zombie_soldier', {
    id: 'mon_zombie_sailor', desc: "Still dressed in the ragged remains of deep blue naval fatigues… The US Navy's insignia is embroidered on the shredded sleeve and shoulder of its bloodied jacket, the dead crewman's battered cap is beaten into the remains of its fractured skull and its inky black eyes are scanning the area around it as dark ooze drips from its limply hanging maw.",
    pose: 'reach', hairStyle: 'short', face: { eyes: 'oily', brows: 'sad', mouth: 'gape', marks: ['blood_forehead', 'bruise'] },
    newOutfit: { style: 'uniform', top: 0x26365a, sleeves: 'long', pants: 0x26365a, shoes: 0x1a1a1a, patch: NAVY }, wear: { tears: 0.8, blood: 0.6 }, gear: ['sailorCap'], fx: ['blackOoze'],
  }),
  variant('mon_zombie_soldier', {
    id: 'mon_zombie_officer', desc: 'Dressed in the shredded blue dress uniform of a naval officer… horrific wounds exposed to the air and large portions of flesh and muscle ripped from its glistening skeleton.',
    pose: 'reach', hairStyle: 'sidePart', hair: 0x5a5a5a, face: { eyes: 'oily', brows: 'flat', mouth: 'jawless', marks: ['rot', 'blood_mouth'] },
    newOutfit: { style: 'formal', top: NAVY, shirt: 0xe8e6e0, tie: 0x111111, sleeves: 'long', pants: NAVY, shoes: 0x111111, patch: 0x1a1a1a },
    wear: { tears: 0.9, wounds: 0.6, blood: 0.6 }, gear: ['officerCap', 'tornChest'], fx: ['blackOoze'],
  }),
  variant('mon_zombie_soldier', {
    id: 'mon_zombie_kevlar_0', desc: 'This zombie dons a uniform with heavy, bulletproof materials sewn in. Peculiarly, the uniform seems to have fused to its skin in certain places, its flesh gripping the edges of its gear as though the body were trying to absorb it.',
    bulk: 0.04, face: { eyes: 'narrow', brows: 'furrowed', mouth: 'grimace', marks: ['veins'] }, wear: { meld: 0.7 }, gear: ['combatHelmet', 'kevlarPlates', 'meldLumps', 'kneePads'],
  }),
  variant('mon_zombie_soldier', { id: 'mon_zombie_soldier_lixa_police', desc: 'Once a soldier, it is dressed head to toe in combat gear and carries itself rather steadily for a zombie. Over its uniform is a vest reading "military police".', outfit: { text: 'MP' } }),
  variant('mon_zombie_soldier', {
    id: 'mon_zombie_soldier_acid_1', desc: 'This staggering soldier wears a burnt gas mask, now fused to its face. Through the melted, bile-encrusted ruination of the mask protrudes some sort of hardened, fleshy proboscis, with steaming corrosive fluid leaking from the end.',
    pose: 'hunched', skin: 0xa8a47a, wear: { acid: 0.5, soot: 0.5 }, gear: ['combatHelmet', 'tacticalVest', 'fusedGasMask'], fx: ['proboscisAcid'],
  }),
  variant('mon_zombie_soldier', {
    id: 'mon_zombie_soldier_acid_2', desc: "This zombie wears what appears to have once been a soldier's uniform and armor, now a series of cracked and melted plates that have fused to its skin and thickened hide. Its face and arms blister with strange, mutated tubes that pulse and drip with acid.",
    body: 'tough', pose: 'hunched', skin: 0xa0a070, hair: null, hairStyle: 'bald', eye: 0x8a7a10, face: { eyes: 'glow', brows: 'furrowed', mouth: 'drool', marks: ['veins', 'rot'] },
    wear: { veins: 0xd8c020, acid: 0.6, meld: 0.5 }, gear: ['meltedPlates', 'acidTubes'], fx: ['tubeDrip'],
  }),
  variant('mon_zombie_soldier', {
    id: 'mon_zombie_soldier_blackops_1', desc: "This soldier zombie's skin radiates a sort of shadowy smoke that obscures its outline, making its camouflage even harder to see against the background. In the darkness it would be nigh invisible.",
    skin: 0x6a6e68, outfit: { top: BLACKOPS[0], pants: BLACKOPS[0], camo: BLACKOPS, shoes: 0x111111, gloves: 0x111111 }, gear: ['combatHelmet', 'nvg', 'balaclava', 'tacticalVest', 'kneePads'], fx: ['shadowSmoke'],
  }),
  variant('mon_zombie_soldier', {
    id: 'mon_zombie_soldier_blackops_2', desc: 'Fragments of visible uniform hint that this monstrosity was once a soldier. Anything human is invisible, hidden inside a sheath of living shadow. It moves with preternatural fluidity and grace.',
    body: 'lanky', pose: 'hunched', skin: 0x1a1a22, hair: null, hairStyle: 'bald', eye: 0xc8d8ff, face: { eyes: 'glow', brows: 'none', mouth: 'grimace', marks: [] },
    outfit: { top: BLACKOPS[0], pants: BLACKOPS[0], camo: BLACKOPS, shoes: 0x111111, gloves: 0x111111 }, wear: { shadow: 0.85, blood: 0 }, gear: ['shadowWisps'], fx: ['shadowSmoke', 'wispSway'],
  }),
  variant('mon_zombie_soldier', {
    id: 'mon_XEDRA_soldier', desc: 'A figure in combat gear, distorted and shattered like broken glass. They thrash around as they move, an expression of shock and anguish frozen on their face.',
    pose: 'crooked', skin: 0xb0b4b0, face: { eyes: 'wide', brows: 'sad', mouth: 'gape', marks: [] }, wear: { shards: 1, blood: 0.1 }, more: ['glassShards'], fx: ['shardJitter'],
  }),
  // Firefighter.
  variant('mon_zombie_fireman', {
    id: 'mon_zombie_nomex', desc: 'This zombie was a firefighter in its past life, still donned in its turnout equipment - said equipment has melded with its flesh, with the tough, flame resistant fibers becoming incorporated into its skin as armor and body mass.',
    bulk: 0.08, pose: 'hunched', face: { eyes: 'narrow', brows: 'furrowed', mouth: 'grimace', marks: ['coal_dust', 'veins'] }, wear: { meld: 0.8 }, gear: ['fireHelmet', 'airTank', 'meldLumps'],
  }),
  // Brute with hammers.
  variant('mon_zombie_brute', {
    id: 'mon_zombie_hammer_hands', desc: 'This brute of a zombie is covered in rusted metal detritus. Chunks of metal smashed through its arms have deformed them into hammers.',
    // CDDA: 62.5 L, an ordinary zombie's volume (its name says brute; its size does not).
    body: 'tough', skin: 0x8a8070, wear: { rust: 0.35 }, gear: ['hammerFists', 'metalShards'],
  }),
  // Medical.
  variant('mon_zombie_brute', {
    id: 'mon_zombie_medical_brute', desc: 'A former doctor of some sort, though its uniform has been torn apart. You assume the oversized muscles that cover it to be the culprit.',
    newOutfit: { style: 'labcoat', top: 0xeceae4, shirt: 0x4a7aa0, sleeves: 'none', pants: 0x4a7aa0, shoes: 0xd8d8d8 }, wear: { tears: 1, blood: 0.8 }, more: ['coatTails', 'idBadge', 'stethoscope'],
  }),
  variant('mon_zombie_acidic', {
    id: 'mon_zombie_medical_acidic', desc: "This is the body of a doctor or nurse of some kind. It's hard to tell now that most of its clothing has corroded away from whatever vile acid its secreting.",
    hairStyle: 'bun', newOutfit: { style: 'scrubs', top: 0x6a9ab0, sleeves: 'short', pants: 0x6a9ab0, shoes: 0xd8d8d8 }, wear: { acid: 1, tears: 0.8 }, more: ['maskDown', 'idBadge'], fx: ['acidHands'],
  }),
  variant('mon_skeleton', {
    id: 'mon_skeleton_medical', desc: 'A malformed armor of misshapen bone has grown over this zombie, having pushed what remains of the skin out of the way. The clothes of a medical worker are still draped over it.',
    outfit: { drape: 0x5a8aa8 }, more: ['drapedScrubs', 'stethoscope', 'bonePlates'],
  }),
  // Others.
  variant('mon_zombie', {
    id: 'mon_zombie_wretched', desc: 'A degenerate corpse, shambling as it walks. Various pieces of trash and waste materials have melded into the black goo leaking from its skin.',
    pose: 'crooked', skin: 0x7a7a68, hair: 0x2a2420, hairStyle: 'receding', eye: 0x0a0a0a, face: { eyes: 'empty', brows: 'sad', mouth: 'drool', marks: ['rot', 'veins'] },
    newOutfit: { style: 'tshirt', top: 0x5a5448, sleeves: 'short', pants: 0x3a3a34, shoes: 0x2a2a24 }, wear: { tears: 0.9, blood: 0.2, soot: 0.6 }, gear: ['trash'], fx: ['goo', 'blackOoze'],
  }),
  variant('mon_zombie', {
    id: 'mon_zombie_resort_dancer', desc: 'This zombie is rather sleek and scantily clothed.',
    body: 'female', skin: 0xb0a898, hair: 0x6a3a1a, hairStyle: 'ponytail', eye: 0x0a0a0a, face: { eyes: 'hungry', brows: 'raised', mouth: 'small_open', marks: ['blood_mouth'] },
    newOutfit: { style: 'tank', top: 0xc03080, sequins: 0xf060b0, sleeves: 'none', pants: 0x1a1a1a, shorts: true, shoes: 0xc02040 }, wear: { tears: 0.3, blood: 0.4 }, gear: ['earrings'],
  }),
  variant('mon_zombie', {
    id: 'mon_zombie_resort_staff', desc: '(no description in CDDA; a resort worker: polo shirt with the resort logo, name tag, khaki shorts, sun visor.)',
    hairStyle: 'short', face: { eyes: 'oily', brows: 'flat', mouth: 'grimace', marks: ['blood_mouth'] },
    newOutfit: { style: 'tshirt', top: 0x2a8a8a, logo: 0xf0c040, sleeves: 'short', pants: 0xc8b48a, shorts: true, shoes: 0xe8e8e8 }, wear: { tears: 0.5, blood: 0.5 }, gear: ['visorCap'],
  }),
);

// ── Batch 3: military, armoured and acid. Sizes checked against CDDA (commit 7136388): `volume`
// decides the size class; the body type is picked so the model's volume follows it.
const MARPAT = [0x5a5e3e, 0x3a3c2a, 0x7a6e4c, 0x2a2a22];
const EGA = 0xc9a33a; // eagle, globe and anchor
RECIPES.push(
  // 62.5 L, medium: an ordinary body inside the exoskeleton.
  variant('mon_zombie_soldier', {
    id: 'mon_zombie_armored', desc: 'Despite being encased in a what was once a nigh-impenetrable combat exoskeleton, something still managed to kill this soldier.',
    pose: 'stand', hair: null, hairStyle: 'bald', outfit: { top: 0x2c3034, pants: 0x2c3034, camo: undefined, gloves: 0x24282c, shoes: 0x24282c, steel: 0x6a747e }, wear: { blood: 0.25, tears: 0 }, gear: ['exoSuit'],
  }),
  // 72.5 L, medium (a little over a normal zombie): the tough body, not the brute's.
  variant('mon_zombie_tough', {
    id: 'mon_zombie_kevlar_1', desc: "This zombie was once wearing some kind of uniform with heavy, bulletproof materials sewn in. At this point it's impossible to tell what kind of uniform it was: the monster's skin has grown over the fabric, splitting and tearing it to shreds, turning the remaining Kevlar and other bits of armor material into part of its hide. Its hands have similarly fused into large, leathery cudgels.",
    skin: 0x8a8670, hair: null, hairStyle: 'bald', face: { eyes: 'narrow', brows: 'furrowed', mouth: 'snarl', marks: ['veins', 'scar_cheek'] },
    newOutfit: { style: 'tank', top: 0x4a5038, sleeves: 'none', pants: 0x4a5038, shoes: 0x2a2418 }, wear: { tears: 1, meld: 0.9, wounds: 0.4 }, gear: ['kevlarHide', 'cudgelHands'],
  }),
  // 875 L, huge: the hulk's giant body; arms dragged behind as bone clubs.
  variant('mon_zombie_hulk', {
    id: 'mon_zombie_kevlar_2', desc: "This zombie was once wearing some kind of now long-shredded uniform with heavy, bulletproof materials sewn in. It has grown into a hulking, leatherbacked beast, its mutated skin taking on a strange texture similar to the Kevlar bits embedded in it. Its arms have twisted into enormous clubs of misshapen bone that it drags on the ground behind it.",
    pose: 'drag', skin: 0x7a7660, newOutfit: { style: 'tank', top: 0x7a7660, sleeves: 'none', pants: 0x3a3e2e, shoes: 0x5a5444 }, wear: { meld: 0.7, wounds: 0.4 }, gear: ['hump', 'kevlarHide', 'boneClubs'],
  }),
  // 62.5 L.
  variant('mon_zombie_soldier', {
    id: 'mon_zombie_marine', desc: 'Dressed head to toe in naval combat equipment and with Marine insignia embroidered on its gear, this lurching corpse still retains its physical fitness in death. From underneath its helmet, its inky black eyes scan the area around it.',
    face: { eyes: 'oily', brows: 'angry', mouth: 'frown_teeth', marks: ['scar_cheek'] }, outfit: { top: MARPAT[0], pants: MARPAT[0], camo: MARPAT, insignia: EGA, patch: 0x141414 },
  }),
  // 140 L, large: the brute body, on all fours.
  variant('mon_zombie_brute', {
    id: 'mon_zombie_marine_upgrade', desc: "Lumbering about on all fours, this mutated beast's dagger-like claws clack against the ground as it predatorially moves: thick strands of exposed muscle tissue running across its rotting body. The addition of its new bulk has caused the skin along its arms and back to split, and the brute's teeth have extended into spikes of bone. The Marine insignias on the remains of the creature's pulverized gear are the only testaments to the soldier that this hulking abomination used to be.",
    pose: 'prowl', skin: 0x8a8270, face: { eyes: 'narrow', brows: 'furrowed', mouth: 'snarl', marks: ['rot'] },
    clawLength: 0.3,
    newOutfit: { style: 'tank', top: 0x8a8270, sleeves: 'none', pants: MARPAT[0], camo: MARPAT, shoes: 0x2a2418, insignia: EGA }, wear: { wounds: 0.5, tears: 0.9 }, gear: ['hump', 'splitSkin', 'claws', 'boneTeeth', 'gearScraps'],
  }),
);
RECIPES.push(
  variant('mon_zombie_marine_upgrade', {
    id: 'mon_bestial_stalker', desc: "Lumbering about on all fours… The military insignias on the remains of the creature's pulverized gear are the only testaments to the soldier that this hulking abomination used to be.",
    skin: 0x948e7c, outfit: { top: 0x948e7c, pants: 0x5a6040, camo: [0x5a6040, 0x3e4430, 0x7a7050, 0x2e3226], insignia: 0xd8d0b0 },
  }),
  // 62.5 L.
  variant('mon_zombie', {
    id: 'mon_zombie_military_pilot', desc: 'Once a pilot, it is wearing a flight suit and a sturdy-looking flight helmet. The head twitches and adjusts constantly, following any and every source of movement.',
    pose: 'stand', hair: null, hairStyle: 'bald', face: { eyes: 'wide', brows: 'raised', mouth: 'frown_teeth', marks: ['blood_mouth'] },
    newOutfit: { style: 'coveralls', top: 0x7a8262, sleeves: 'long', pants: 0x7a8262, shoes: 0x1e1a14, gloves: 0x3a3428, patch: 0x2a3a6a, helmet: 0xb4b8b6, helmetStripe: 0x2a3a6a, gsuit: 0x4e5640 }, wear: { tears: 0.4, blood: 0.4 }, gear: ['flightHelmet', 'pilotKit'],
  }),
  // Test-only id: the soldier, unchanged.
  variant('mon_zombie_soldier', { id: 'mon_zombie_soldier_no_weakpoints', desc: 'This zombie soldier is used by hardcoded dps logic and for testing purposes only. (Same look as the zombie soldier.)' }),
  // 62.5 L.
  variant('mon_zombie_cop', {
    id: 'mon_zombie_swat', desc: 'This zombie was part of a specialized unit of law enforcement. It still wears a battered armor with the SWAT logo emblazoned on the front. The protective mask makes its head a difficult target, but also prevents it from biting you.',
    pose: 'stand', bulk: 0.03, hair: null, hairStyle: 'bald', face: { eyes: 'cloudy', brows: 'flat', mouth: 'stitched' },
    newOutfit: { style: 'uniform', top: 0x1e2024, sleeves: 'long', pants: 0x1e2024, shoes: 0x111111, gloves: 0x141414, vest: 0x26292e, helmet: 0x1a1c1e, text: 'SWAT', textFront: true },
    wear: { tears: 0.5, blood: 0.5 }, gear: ['combatHelmet', 'swatMask', 'tacticalVest', 'kneePads', 'dutyBelt', 'radio'],
  }),
  // 108.5 L, large: the bloated body.
  variant('mon_zombie_acidic', {
    id: 'mon_zombie_corrosive', desc: 'This zombie has swollen to immense proportions, but still manages to hold itself together with semi-congealed acid all over its bloated, leathery body. It moves clumsily, but spits from a large reserve of acid with uncanny accuracy.',
    body: 'bloated', pose: 'reach', skin: 0x9a9468, hair: null, hairStyle: 'bald', face: { eyes: 'glow', brows: 'sad', mouth: 'drool', marks: ['veins', 'rot'] },
    newOutfit: { style: 'tank', top: 0x9a9468, sleeves: 'none', pants: 0x4a4a3a, shoes: 0x6a6650 }, wear: { veins: 0xc8c030, wounds: 0.3, tears: 0.6 }, gear: ['acidGel'], fx: ['cystPulse', 'gelDrip'],
  }),
  // 62.5 L.
  variant('mon_zombie_acidic', {
    id: 'mon_zombie_spitter', desc: 'A hunched human body with its eyes pushed up into its forehead and drooping cheeks, most of its face is occupied by a puckered mouth. Its stomach is swollen and nearly translucent, with a sickly yellow tint.',
    pose: 'hunched', skin: 0xb0ac86, hair: null, hairStyle: 'bald', face: { eyes: 'wide', brows: 'raised', mouth: 'small_open', marks: ['veins'], lift: { eyes: -0.22, brows: -0.2 } },
    newOutfit: { style: 'tank', top: 0x6a6a5a, sleeves: 'none', pants: 0x4a4a3a, shoes: 0x2a2a2a }, wear: { veins: 0xc8c030, tears: 0.8 }, gear: ['puckerMouth', 'translucentBelly'], fx: ['stomachPulse'],
  }),
);

// ── Batch 4: the burnt (zed_burned.json) and the children (zed_children.json). Sizes checked
// against CDDA (commit 7136388).
const CHAR = 0x3a302a; // charred skin (the crust itself is painted by wear.char)
RECIPES.push(
  // 62.5 L, medium.
  {
    id: 'mon_zombie_scorched', desc: 'A heavily burned zombie that still reeks of charred meat.  Its now leathery flesh has mended into patches, giving it a more armored appearance.',
    body: 'standard', pose: 'reach', skin: CHAR, hair: null, hairStyle: 'bald', eye: 0xd86a20, face: { eyes: 'glow', brows: 'none', mouth: 'frown_teeth', marks: ['rot'] },
    outfit: { style: 'tank', top: 0x5a4a3a, sleeves: 'none', pants: 0x2e2a26, shoes: 0x1e1a18 },
    wear: { char: 0.85, tears: 1, soot: 0.8 }, gear: ['charPlates'], fx: ['charSmoke'],
  },
);
RECIPES.push(
  // 62.5 L: the scorched zombie with metal fragments sticking out of its body.
  variant('mon_zombie_scorched', {
    id: 'mon_zombie_scorched_rust', desc: 'A heavily burned zombie that still reeks of charred meat.  Its now leathery flesh has mended into patches, giving it a more armored appearance.  This one appears to have metal fragments sticking out of its body.',
    pose: 'hunched', face: { eyes: 'narrow', brows: 'furrowed', mouth: 'snarl', marks: ['scar_cheek'] }, newOutfit: { style: 'shirt', top: 0x3a4a5a, sleeves: 'short', pants: 0x3a3430, shoes: 0x1e1a18 }, more: ['metalShards'],
  }),
  // 100 L, medium: the brute body under a cracked shell of melted skin.
  {
    id: 'mon_zombie_scorched_brute', desc: 'An oversized charred human form.  The remains of its burnt and blackened musculature are clearly visible between the cracks of the shell formed from its melted skin.',
    body: 'brute', pose: 'hunched', skin: 0x4a221c, hair: null, hairStyle: 'bald', eye: 0xd86a20, face: { eyes: 'glow', brows: 'furrowed', mouth: 'snarl', marks: ['rot'] },
    outfit: { style: 'tank', top: 0x4a221c, sleeves: 'none', pants: 0x2a2420, shoes: 0x1e1a18 },
    wear: { char: 0.6, tears: 1, wounds: 0.5 }, gear: ['charShell'], fx: ['charSmoke'],
  },
);
RECIPES.push(
  // 100 L: the scorched brute with metal fragments.
  variant('mon_zombie_scorched_brute', {
    id: 'mon_zombie_fiend_rust', desc: 'An oversized charred human form.  The remains of its burnt and blackened musculature are clearly visible between the cracks of the shell formed from its melted skin.  This one appears to have metal fragments sticking out of its body.',
    face: { eyes: 'narrow', mouth: 'grimace', marks: ['scar_eye'] }, more: ['metalShards'],
  }),
  // 62.5 L, medium: an ordinary body with unnaturally long arms dragging behind it.
  {
    id: 'mon_zombie_scorched_lasher', desc: 'A heavily burned corpse with unnaturally long arms dragging behind it as it moves.  The burnt scar tissue covering it gives it a mildly armored appearance.',
    body: 'standard', proportions: { upperArm: 0.66, forearm: 0.66, hand: 0.15, armW: 0.11, armD: 0.11 }, pose: 'trail', skin: CHAR, hair: null, hairStyle: 'bald', eye: 0xd86a20,
    face: { eyes: 'wide', brows: 'none', mouth: 'gape', marks: ['rot'] },
    outfit: { style: 'tank', top: 0x3a3430, sleeves: 'none', pants: 0x2a2622, shoes: 0x1e1a18 },
    wear: { char: 0.9, tears: 1 }, gear: ['charPlates'], fx: ['charSmoke'],
  },
  // 875 L, huge: the giant body knuckle-walking like a gorilla on long arms. The horns and the
  // flames are not in CDDA's description: added at the user's request.
  {
    id: 'mon_zombie_fiend', desc: 'A monstrous burnt vaguely humanoid creature, walking around on its knuckles like a gorilla.  Tattered and blackened strands of muscle fibers dangle all around its body, with patches of fused melded skin and bone visible between.  Its forelimbs end in lengthy skeletal claws.',
    body: 'giant', proportions: { upperArm: 0.66, forearm: 0.6, thigh: 0.45, shin: 0.4, head: 0.42, headDrop: 0.04, hunch: 0.1 }, pose: 'knuckle', skin: 0x3a221c, hair: null, hairStyle: 'bald', eye: 0xd86a20,
    face: { eyes: 'glow', brows: 'furrowed', mouth: 'snarl', marks: ['rot'] },
    outfit: { style: 'tank', top: 0x3a221c, sleeves: 'none', pants: 0x2a201c, shoes: 0x3a221c },
    wear: { char: 1, wounds: 0.5, bone: true }, gear: ['charShell', 'calcified', 'muscleStrands', 'claws', 'horns'], horns: { style: 'curved', size: 1.8 }, fx: ['strandSway', 'flames', 'charSmoke'],
  },
  // 31.25 L, small: a child, burnt and emaciated, the clothes still clinging to it.
  {
    id: 'mon_zombie_child_scorched', desc: 'A diminutive humanoid figure, its body ravaged by fire into a blackened, charred shell.  Its leathery flesh has mended in patches, and the tattered clothing is still clinging to its emaciated frame making it clear it once was - and still is - the body of a child.',
    body: 'child', proportions: { torsoW: 0.29, armW: 0.08, armD: 0.08, legW: 0.1 }, pose: 'reach', skin: CHAR, hair: null, hairStyle: 'bald', eye: 0xd86a20,
    face: { eyes: 'hungry', brows: 'none', mouth: 'small_open', marks: ['rot'] },
    outfit: { style: 'tshirt', top: 0x6a5a8a, sleeves: 'short', pants: 0x3a4a6a, shoes: 0x2a2a2a },
    wear: { char: 0.8, tears: 1, soot: 1 }, gear: ['charPlates'], fx: ['charSmoke'],
  },
  // 31.25 L. Same description as mon_zombie_child: told apart by the dress and the pigtails.
  variant('mon_zombie_child', {
    id: 'mon_zombie_child_base', desc: "It was only a child, and little is different about it now aside from the hungry look in its eyes.  You'd be hard-pressed to not feel like you were killing an actual child by putting it down.",
    skin: 0xa4a898, hair: 0x2a1e18, hairStyle: 'pigtails', face: { eyes: 'hungry', brows: 'sad', mouth: 'gnaw', marks: ['blood_mouth', 'bruise'] },
    newOutfit: { style: 'dress', top: 0x5a8ac0, sleeves: 'short', pants: 0xa4a898, shoes: 0x8a3a3a, skirt: 0.24 }, wear: { tears: 0.4, blood: 0.4 }, gear: ['skirt'],
  }),
  // 31.25 L: massive gaping jaws.
  variant('mon_zombie_child', {
    id: 'mon_zombie_anklebiter', desc: 'This horrifying little mutated wretch looks to have once been a child, but its massive gaping jaws are now far more suggestive of a predatory beast.',
    pose: 'hunched', skin: 0x949a86, hair: 0x3a2a1e, hairStyle: 'messy', face: { eyes: 'squint_angry', brows: 'angry', mouth: 'gape', marks: ['veins'] },
    newOutfit: { style: 'tshirt', top: 0x4a7a4a, sleeves: 'short', pants: 0x5a5048, shoes: 0x2a2a2a }, wear: { tears: 0.7, blood: 0.7, bloodyHands: true }, gear: ['bigJaw'],
  }),
  // 31.25 L: blackened skin and massive eyes; creeping low with splayed limbs like a spider.
  variant('mon_zombie_child', {
    id: 'mon_zombie_creepy', desc: 'What was once a child is now a mutant beast with blackened skin and massive eyes.  This abomination\'s vile form makes a mockery of its human origin.',
    pose: 'creep', bulk: 0.02, proportions: { upperArm: 0.24, forearm: 0.22, thigh: 0.26, shin: 0.24 }, skin: 0x1e1c20, hair: null, hairStyle: 'bald', face: { eyes: 'empty', brows: 'none', mouth: 'snarl' }, bigEyes: { color: 0xd8d0a0, size: 0.36 },
    newOutfit: { style: 'tshirt', top: 0x1e1c20, sleeves: 'none', pants: 0x3a3438, shoes: 0x1e1c20 }, wear: { tears: 1, wounds: 0.3 }, gear: ['bigEyes'],
  }),
  // 31.25 L: twitching and flailing in spasms (the twitching needs body animation: a frozen spasm
  // here). "Heavily mutated": bone spurs breaking out of the joints and spine, a swollen throat sac.
  variant('mon_zombie_child', {
    id: 'mon_zombie_shriekling', desc: 'This heavily mutated child zombie twitches and flails its limbs in painful-looking spasms as it runs about.',
    pose: 'flail', skin: 0xb0a490, hair: 0xb08a50, hairStyle: 'wild', face: { eyes: 'wide', brows: 'raised', mouth: 'gape', marks: ['veins', 'bruise'] },
    newOutfit: { style: 'tshirt', top: 0x2a8a8a, sleeves: 'short', pants: 0x3a3a4a, shoes: 0xe0e0e0 }, wear: { tears: 0.8, blood: 0.5, wounds: 0.4, veins: 0x7a3a4a }, gear: ['boneSpurs', 'throatSac'], fx: ['sacPulse'],
  }),
  // 31.25 L: swollen and gooey, arms out for a hug.
  variant('mon_zombie_child', {
    id: 'mon_zombie_snotgobbler', desc: "This swollen, gooey-looking mutant child looks bad, even for a zombie.  Maybe that's why it seems to want a hug so badly.",
    bulk: 0.03, skin: 0xa0ac7a, hair: 0x6a5a3a, hairStyle: 'short', face: { eyes: 'oily', brows: 'sad', mouth: 'drool', marks: ['rot'] },
    newOutfit: { style: 'tshirt', top: 0xe0c040, sleeves: 'short', pants: 0x7a5a8a, shoes: 0x3a6a3a }, wear: { veins: 0x7a9a30, tears: 0.6, acid: 0.5 }, gear: ['belly', 'drips'], fx: ['snot'],
  }),
  // 31.25 L: crouching, huge black eyes, clawed fingertips.
  variant('mon_zombie_child', {
    id: 'mon_zombie_sproglodyte', desc: "This crouching child-mutant's face is dominated by a pair of huge black eyes, and its fingertips end in sharp claws.",
    pose: 'crouch', bulk: 0.02, skin: 0x8a8c80, hair: null, hairStyle: 'bald', face: { eyes: 'empty', brows: 'none', mouth: 'small_open' }, bigEyes: { color: 0x050505, size: 0.4 },
    newOutfit: { style: 'tank', top: 0x6a6458, sleeves: 'none', pants: 0x4a4438, shorts: true, shoes: 0x8a8c80 }, wear: { tears: 1, blood: 0.3 }, gear: ['bigEyes', 'claws'],
  }),
  // 31.25 L: skin stretched over tiny brittle bones (the skeletal body: the volume reads low by design).
  variant('mon_zombie_child', {
    id: 'mon_zombie_waif', desc: 'Undeath has not been kind to the children of the apocalypse.  This one is little more than a reanimated membrane of skin stretched across tiny brittle bones.',
    pose: 'reach', skin: 0xc8bca8, boneScale: 0.6, hair: 0x4a3a2a, hairStyle: 'long', face: { eyes: 'empty', brows: 'sad', mouth: 'gape', marks: ['veins'] },
    newOutfit: { style: 'tshirt', top: 0xc8bca8, sleeves: 'none', pants: 0xc8bca8, shoes: 0xc8bca8 }, wear: {}, gear: ['skeletalBody', 'skinMembrane'],
  }),
  // 31.25 L: lying on its back, the ribcage arched into a hive.
  variant('mon_zombie_child', {
    id: 'mon_zombie_wretch', desc: "Lethargically resting on its back, this hideous mass of sagging flesh and writhing organs, which used to be a child, twitches feebly as its midsection churns.  Almost bursting from its skin, the child's ribcage has arched outward, forming a hive-like construct covered by severely stretched epidermis.  Through the wretched organism's taut abdominal flesh, you witness small forms swarming within its ribcage—its guts roiling as new beings are sculpted from pilfered flesh and bone.  The creature's limbs rest haphazardly on the ground, contorted in ways that suggest the absence of bones or any interior construct.",
    pose: 'supine', skin: 0xb09a8e, hair: 0x5a4a3a, hairStyle: 'messy', face: { eyes: 'cloudy', brows: 'sad', mouth: 'gape', marks: ['veins', 'rot'] },
    newOutfit: { style: 'tshirt', top: 0x8aa0b0, sleeves: 'short', pants: 0x5a6a7a, shoes: 0x4a4a4a }, wear: { tears: 1, wounds: 0.4, blood: 0.4 }, gear: ['ribHive'], fx: ['swarm', 'hivePulse'],
  }),
);



// ── Batch 5: electric (zed_electric.json), explosive (zed_explosive.json) and ferrous
// (zed_ferrous.json). Sizes checked against CDDA (commit 7136388).
const ZAP = 0xcfeeff;
RECIPES.push(
  // 62.5 L, medium: pale blue flesh crackling with electricity.
  variant('mon_zombie', {
    id: 'mon_zombie_electric', desc: 'A human body with pale blue flesh, crackling with electrical energy.',
    pose: 'reach', skin: 0x9ab4c8, hair: 0x2a2e38, hairStyle: 'short', eye: 0x60c8ff, face: { eyes: 'glow', brows: 'angry', mouth: 'grimace', marks: ['veins'] },
    newOutfit: { style: 'shirt', top: 0x3a4a6a, sleeves: 'short', pants: 0x2a2e38, shoes: 0x1e1e22 }, wear: { tears: 0.6, veins: 0x6a9ad8 }, gear: ['arcs'], arcs: { size: 0.8, n: 3 }, fx: ['sparks', 'arcFlicker'],
  }),
  // 62.5 L: a very pale body, its hair standing on end with static.
  variant('mon_zombie', {
    id: 'mon_zombie_static', desc: 'A very pale dead body with the worst case of static hair you have ever seen.  Sparks of electricity frequently jump off it, lighting it up in the dark.  You might not want to touch it with your bare hands, or anything conductive.',
    pose: 'reach', skin: 0xd8d8d0, hair: 0xe0d8b0, hairStyle: 'bald', eye: 0x60c8ff, face: { eyes: 'wide', brows: 'raised', mouth: 'grin', marks: ['veins'] },
    newOutfit: { style: 'tshirt', top: 0xa8b0b8, sleeves: 'short', pants: 0x4a5060, shoes: 0x2a2a2a }, wear: { tears: 0.5, blood: 0.3 }, gear: ['staticHair'], fx: ['sparks'],
  }),
  // 100 L, medium: the brute body, scarred all over by the lightning arcing out of it.
  variant('mon_zombie_brute', {
    id: 'mon_zombie_brute_shocker', desc: 'A huge beast covered in visible scarring from the lightning bolts that arc out of its body.  Being near it, you can hear a slight humming, like that of an electrical transformer.',
    skin: 0x8a9098, eye: 0x60c8ff, face: { eyes: 'glow', brows: 'furrowed', mouth: 'snarl', marks: ['scar_cheek'] },
    newOutfit: { style: 'tank', top: 0x8a9098, sleeves: 'none', pants: 0x2a2e38, shoes: 0x3a3e44 }, wear: { lichtenberg: 0xd0e8f8, tears: 0.7 }, gear: ['hump', 'muscles', 'arcs'], arcs: { size: 1.2 }, fx: ['sparks', 'arcFlicker'],
  }),
  // 62.5 L: a glowing white silhouette inside a pulsing field of lightning.
  variant('mon_zombie', {
    id: 'mon_zombie_nullfield', desc: 'This zombie is visible only as a glowing white silhouette that you have to squint to see, cloaked in a crackling field of lightning that pulses like a beating heart.  It walks slowly and deliberately, the thunderstorm surrounding it eagerly jumping to anything conductive within its grasp.',
    pose: 'stand', glowAll: true, skin: 0xe8f4ff, hair: null, hairStyle: 'bald', eye: 0xb0e0ff, face: { eyes: 'empty', brows: 'none', mouth: 'small_open' },
    newOutfit: { style: 'tank', top: 0xe8f4ff, sleeves: 'none', pants: 0xdceeff, shoes: 0xdceeff }, wear: { blood: 0, tears: 0 }, gear: ['arcs'], arcs: { size: 1.6, color: 0xbfe0ff }, fx: ['fieldPulse', 'sparks'],
  }),
  // 108.5 L, large: the boomer's bloated body, the ribcage open.
  variant('mon_boomer', {
    id: 'mon_boomer_claymore', desc: "This zombie's exposed ribcage is encircled by swollen lungs and other organs.  You would prefer to be far away when they burst.",
    skin: 0xa09a88, face: { eyes: 'narrow', brows: 'sad', mouth: 'grimace', marks: ['rot'] }, hairStyle: 'bald', hair: null,
    newOutfit: { style: 'tank', top: 0x5a6a5a, sleeves: 'none', pants: 0x4a4a52, shoes: 0x5a5448 }, wear: { wounds: 0.4, tears: 1 }, gear: ['lungRibs'], fx: ['cystPulse', 'stench'],
  }),
  // 108.5 L: a ball of flesh and fat, vestigial limbs, bulging eyes, a gaping maw oozing black sludge.
  variant('mon_boomer', {
    id: 'mon_boomer_glutton', desc: 'A large, grotesque ball of flesh and fat.  Seemingly vestigial limbs flop around haphazardly as it rolls across the ground.  You occasionally catch a glimpse of bulging eyes and a distended gaping maw oozing some sort of black sludge.',
    pose: 'blob', ball: 0.85, skin: 0xb0a48a, hair: null, hairStyle: 'bald', face: { eyes: 'empty', brows: 'none', mouth: 'gape', marks: ['rot'] }, bigEyes: { color: 0xe8e0c0, size: 0.3 },
    newOutfit: { style: 'tank', top: 0xb0a48a, sleeves: 'none', pants: 0xb0a48a, shoes: 0xb0a48a }, wear: { wounds: 0.4 }, gear: ['fleshBall', 'bigEyes', 'bigJaw'], fx: ['blackOoze', 'heave'],
  }),
  // 108.5 L: the boomer firmed up, muscle under hardened skin; its bile has changed colour.
  variant('mon_boomer', {
    id: 'mon_boomer_huge', desc: 'This boomer, normally swollen and ready to burst, has strengthened and solidified.  The bile dribbling from its mouth also appears to have changed…',
    pose: 'hunched', skin: 0x948c76, hair: null, hairStyle: 'bald', face: { eyes: 'narrow', brows: 'furrowed', mouth: 'drool', marks: ['scar_cheek', 'veins'] },
    newOutfit: { style: 'tank', top: 0x5a5048, sleeves: 'none', pants: 0x3a3a40, shoes: 0x4a4438 }, wear: { wounds: 0.3, tears: 0.8, veins: 0xa8b830 }, gear: ['muscles', 'scabPlates'], fx: ['bile'],
  }),
  // 108.5 L: the gasbag in pyjamas, stumbling, swollen with a bluish sweet gas.
  variant('mon_zombie_gasbag', {
    id: 'mon_zombie_relax_gasbag', desc: 'A zombie swollen with a bluish, oddly sweet smelling gas.  It stumbles around even more than regular zombies, as if heavily intoxicated.',
    pose: 'stagger', skin: 0x98a0a8, hair: 0x5a4a3a, hairStyle: 'messy', face: { eyes: 'cloudy', brows: 'sad', mouth: 'drool' }, cystColor: 0x8aa8d0, gasColor: 0x8ab0e0,
    newOutfit: { style: 'shirt', top: 0xa8c0e0, stripes: undefined, plaid: [0xa8c0e0, 0x7a98c8], sleeves: 'long', pants: 0xa8c0e0, shoes: 0x8a6a5a }, wear: { veins: 0x6a7ab0, tears: 0.4 },
  }),
  // 108.5 L: blistered, rashy, face caked in mucus, leaking orange pepper gas.
  variant('mon_zombie_gasbag', {
    id: 'mon_zombie_tear_gasbag', desc: 'A bloated corpse, its ballooning skin blistered and rashy and its face caked in mucus.  The off-color orange gas that occasionally leaks from it makes your eyes water and smells faintly of pepper.',
    skin: 0xb09888, face: { eyes: 'squint_angry', brows: 'sad', mouth: 'grimace', marks: ['rot'] }, cystColor: 0xd89070, gasColor: 0xe08a3a,
    wear: { rash: 0.8, tears: 0.6 }, more: ['drips'], moreFx: ['mucus'],
  }),
  // 62.5 L: impaled with rusted metal, the rust spreading over the skin.
  variant('mon_zombie', {
    id: 'mon_zombie_rust', desc: 'A zombie impaled with a multitude of metal fragments, each covered with a thick layer of rust that seems to propagate to other parts of its body.  You can\'t remember the last time you got a tetanus shot, so it would be best not to let this thing touch you.',
    pose: 'reach', skin: 0x9a8a74, hair: 0x3a2a1e, hairStyle: 'short', face: { eyes: 'oily', brows: 'angry', mouth: 'frown_teeth', marks: ['rot'] },
    newOutfit: { style: 'coveralls', top: 0x4a5a6a, sleeves: 'long', pants: 0x4a5a6a, shoes: 0x2a2420 }, wear: { rust: 0.8, tears: 0.6, blood: 0.4 }, gear: ['impaled', 'metalShards'],
  }),
  // 108.5 L, large: the brute body; rusted metal plates showing through ruptures like armour.
  variant('mon_zombie_brute', {
    id: 'mon_zombie_plated', desc: 'Ruptures in this zombie\'s skin expose fragments of metal arranged like armor underneath.  Black sludge can be seen in places where the rust has receded.',
    skin: 0x8a8070, bulk: 0.03, face: { eyes: 'narrow', brows: 'furrowed', mouth: 'grimace', marks: ['rot'] },
    newOutfit: { style: 'tank', top: 0x8a8070, sleeves: 'none', pants: 0x3a3630, shoes: 0x2a2420 }, wear: { rust: 0.4, wounds: 0.3 }, gear: ['rustArmor'], fx: ['goo'],
  }),
  // 62.5 L: rusted metal fused into the back like a shell, the spine pushed aside.
  variant('mon_zombie', {
    id: 'mon_zombie_shell', desc: 'Jagged fragments of rust-bitten metal have fused into this zombie\'s flesh and displaced parts of its spine.',
    pose: 'hunched', skin: 0x948470, hair: null, hairStyle: 'bald', face: { eyes: 'uneven', brows: 'sad', mouth: 'grimace', marks: ['rot'] },
    newOutfit: { style: 'tank', top: 0x6a5a4a, sleeves: 'none', pants: 0x3a3630, shoes: 0x2a2420 }, wear: { rust: 0.5, tears: 0.8 }, gear: ['rustShell'],
  }),
  // 62.5 L: covered in long rusty spikes.
  variant('mon_zombie', {
    id: 'mon_zombie_urchin', desc: 'A spiked horror of a zombie covered in long, rusty spikes.  A walking tetanus infection waiting to happen.',
    pose: 'reach', skin: 0x8e8270, hair: null, hairStyle: 'bald', face: { eyes: 'squint_angry', brows: 'angry', mouth: 'snarl', marks: ['rot', 'scar_eye'] },
    newOutfit: { style: 'tank', top: 0x5a4a3e, sleeves: 'none', pants: 0x3a3630, shoes: 0x2a2420 }, wear: { rust: 0.6, tears: 0.9, blood: 0.3 }, gear: ['rustSpikes'],
  }),
);
