// Everyday loot, laid out around its centre on the ground. Measurements are in metres.
import {
  GLASS, STEEL, V, bevel, blob, clothP, crumple, cyl, fill, flat, hull, knitP,
  layers, loop, pane, paperP, pile, plasticP, printP, rng, sheet, speckle, steelP, tube,
} from './item-kit.js';
import { openPlasticBag, pressSealBag } from './plastic-bags.js';
import { drawShorts } from './shorts.js';

const item = (id, desc, build) => ({ id, desc, build });
const top = (p, name, [x0, z0, x1, z1], y, paint, opts) =>
  pane(p, name, [V(x0, y, z1), V(x1, y, z1), V(x1, y, z0), V(x0, y, z0)], .0006, paint, opts);

function rect(ctx, x, y, w, h, [left, top, right, bottom], color) {
  const x0 = Math.round(w * left), y0 = Math.round(h * top);
  fill(ctx, x + x0, y + y0, Math.max(1, Math.round(w * right) - x0),
    Math.max(1, Math.round(h * bottom) - y0), color);
}

function mp3(p, on) {
  bevel(p, 'aluminium shell', [-.025, 0, -.045, .025, .013, .045], .003, steelP(0x58798e));
  bevel(p, 'faceplate', [-.023, .009, -.043, .023, .014, .043], .002, plasticP(0x304e64));
  top(p, 'LCD', [-.018, -.038, .018, -.005], .0145, layers(flat(on ? 0x86ad6e : 0x243339),
    (ctx, x, y, w, h) => {
      if (!on) return;
      for (const n of [0, 1, 2]) rect(ctx, x, y, w, h, [.15, .25 + n * .2, .75 - n * .13, .33 + n * .2], 0x23362c);
    }), on ? { glow: true } : GLASS);
  cyl(p, 'control wheel', 'y', [0, .014, .021], .016, .003, 12, flat(0xb0c1c8));
  cyl(p, 'play button', 'y', [0, .016, .021], .007, .002, 10, flat(0x283843));
  p.box('hold switch', [.024, .005, -.015, .027, .009, -.004], flat(0xad8861));
  cyl(p, 'headphone socket', 'z', [-.012, .006, -.045], .003, .001, 8, flat(0x181c22));
}

function lighter(p, lit) {
  const brass = steelP(0xb18d51);
  bevel(p, 'fuel tank', [-.019, 0, -.011, .019, .036, .011], .003, brass);
  p.box('engraved inset', [-.014, .005, -.0115, .014, .032, -.0105], steelP(0x927444));
  cyl(p, 'hinge', 'z', [-.019, .037, 0], .0036, .019, 8, steelP(0x80603b));
  if (!lit) {
    bevel(p, 'flip cap', [-.019, .037, -.011, .019, .054, .011], .003, brass);
    return;
  }
  bevel(p, 'open cap', [-.036, .036, -.011, -.019, .069, .011], .003, brass);
  bevel(p, 'chimney', [-.012, .033, -.008, .008, .047, .008], .002, steelP());
  for (const x of [-.008, .001]) p.box(`vent ${x}`, [x, .040, -.0085, x + .004, .044, -.0075], flat(0x473820));
  cyl(p, 'flint wheel', 'z', [.012, .039, 0], .004, .011, 10, steelP(0x63605b));
  blob(p, 'flame', [.004, .011, .004], [-.002, .054, 0], flat(0xf3a13d), { glow: true });
  blob(p, 'flame core', [.002, .006, .002], [-.002, .051, -.003], flat(0xffe9a3), { glow: true });
}

function garmentPanel(p, name, outline, height, paint) {
  hull(p, name, outline.flatMap(([x, z]) => [V(x, 0, z), V(x, height, z)]), paint);
}

function cargoTrousers(p) {
  const fabric = clothP(0x68715a);
  const end = .24;
  const height = .018;
  p.box('seat', [-.12, 0, -.105, .12, height, -.029], fabric);
  for (const side of [-1, 1]) {
    garmentPanel(p, `leg ${side}`, [[.005, -.035], [.12, -.037], [.105, end], [.024, end - .008]]
      .map(([x, z]) => [x * side, z]), height, fabric);
    const x = side * .065;
    p.box(`cuff ${side}`, [x - .039, 0, end - .013, x + .04, height + .002, end - .007], fabric);
    bevel(p, `bellows pocket ${side}`, [x - .035, height, .047, x + .035, height + .01, .111], .003, clothP(0x555e49));
    p.box(`pocket flap ${side}`, [x - .038, height + .009, .042, x + .038, height + .013, .065], clothP(0x7c8267));
    cyl(p, `snap ${side}`, 'y', [x, height + .013, .06], .003, .001, 8, flat(0x353a2e));
  }
  p.box('waistband', [-.123, 0, -.108, .123, height + .003, -.086], knitP(0x555e49));
  p.box('fly', [-.011, height, -.087, .011, height + .002, -.027], fabric);
}

function combatBoots(p) {
  const rubber = plasticP(0x282829), leather = speckle('boots', 0x414037, [0x575043, 0x33322e], .45);
  for (const [s, angle, z] of [[-1, .12, -.025], [1, -.16, .025]]) {
    const parent = p.group(`boot ${s}`, { at: [s * .075, 0, z], rotY: angle });
    const opts = { parent };
    bevel(p, 'sole', [-.061, 0, -.146, .061, .027, .125], .011, rubber, opts);
    bevel(p, 'toe', [-.057, .02, -.138, .057, .077, -.024], .018, leather, opts);
    bevel(p, 'ankle', [-.052, .022, -.052, .052, .176, .116], .014, leather, opts);
    top(p, 'dark lining', [-.047, -.045, .047, .108], .177, flat(0x252420), opts);
    for (const x of [-.055, .042]) p.box(`collar side ${x}`, [x, .173, -.053, x + .013, .193, .117], leather, opts);
    for (const z of [-.053, .103]) p.box(`collar end ${z}`, [-.042, .173, z, .042, .193, z + .014], leather, opts);
    for (let k = 0; k < 5; k++) {
      const y = .081 + k * .018, laceZ = -.065 + k * .004;
      tube(p, `laces ${k}`, V(-.025, y, laceZ), V(.025, y + .011, laceZ + .003), .0026, .0026, 5, flat(0x9d8e73), opts);
    }
    for (let k = 0; k < 6; k++) {
      const z = -.10 + k * .038;
      p.box(`tread ${k}`, [-.059, 0, z, .059, .014, z + .016], rubber, opts);
    }
  }
}

function gloves(p) {
  const leather = clothP(0x4c5144);
  for (const side of [-1, 1]) {
    const parent = p.group(`glove ${side}`, { at: [side * .071, 0, 0], rotY: side * .19 });
    const opts = { parent };
    bevel(p, 'palm', [-.042, 0, -.032, .042, .017, .052], .007, leather, opts);
    bevel(p, 'wrist strap', [-.046, .001, .031, .046, .02, .052], .004, clothP(0x2e3630), opts);
    for (let k = 0; k < 4; k++) {
      const x = -.03 + k * .02, z = [-.052, -.06, -.057, -.048][k];
      bevel(p, `finger ${k}`, [x - .008, .002, z, x + .008, .014, -.024], .003, leather, opts);
      p.box(`finger opening ${k}`, [x - .004, .005, z - .0003, x + .004, .01, z + .0003], flat(0x292924), opts);
    }
    tube(p, 'thumb', V(side * .033, .008, -.004), V(side * .059, .008, -.02), .009, .007, 6, leather, opts);
    bevel(p, 'knuckle padding', [-.03, .015, -.024, .032, .023, .006], .003, clothP(0x696c59), opts);
  }
}

function tankTop(p) {
  const cotton = knitP(0xe8e3d7);
  garmentPanel(p, 'torso', [[-.138, -.073], [.138, -.073], [.155, .16], [-.155, .158]], .01, cotton);
  for (const side of [-1, 1]) {
    garmentPanel(p, `strap ${side}`, [[.065, -.073], [.085, -.173], [.126, -.17], [.108, -.073]]
      .map(([x, z]) => [side * x, z]), .012, cotton);
  }
  top(p, 'bound hem', [-.151, .142, .151, .155], .011, clothP(0xc8c2b5));
}

function socks(p, color = 0x66798a) {
  const cotton = knitP(0xd9d4c5), accent = knitP(color);
  for (const side of [-1, 1]) {
    const parent = p.group(`sock ${side}`, { at: [side * .043, side > 0 ? .009 : 0, side * .018], rotY: side * .21 });
    const opts = { parent };
    bevel(p, 'leg', [-.037, 0, -.113, .036, .018, .021], .007, cotton, opts);
    bevel(p, 'foot', [-.039, 0, -.002, .084, .017, .073], .007, cotton, opts);
    bevel(p, 'ribbed cuff', [-.037, 0, -.114, .037, .020, -.086], .006, accent, opts);
    bevel(p, 'heel', [-.04, 0, .039, -.006, .019, .073], .005, accent, opts);
    bevel(p, 'toe', [.052, 0, .001, .085, .018, .072], .006, accent, opts);
  }
}

function trenchcoat(p) {
  const canvas = clothP(0x9e8059), trim = clothP(0x765d40);
  garmentPanel(p, 'coat body', [[-.143, -.19], [.143, -.19], [.198, .239], [-.19, .236]], .021, canvas);
  for (const s of [-1, 1]) {
    garmentPanel(p, `sleeve ${s}`, [[.117, -.182], [.188, -.141], [.231, .084], [.17, .11]]
      .map(([x, z]) => [s * x, z]), .026, canvas);
    const x = s * .094;
    bevel(p, `pocket ${s}`, [x - .035, .021, .016, x + .035, .026, .065], .002, trim);
    pane(p, `lapel ${s}`, [V(s * .019, .027, .009), V(s * .041, .027, -.196), V(s * .101, .027, -.154), V(s * .071, .027, -.072)], .004, trim);
    for (const z of [-.043, -.009, .028, .064]) cyl(p, `button ${s} ${z}`, 'y', [s * .028, .023, z], .005, .003, 8, flat(0x514136));
  }
  p.box('belt', [-.176, .021, .082, .177, .028, .107], trim);
  bevel(p, 'buckle', [-.017, .028, .078, .022, .032, .11], .002, steelP(0x78674e));
}

function watch(p) {
  const rubber = plasticP(0x30383b);
  bevel(p, 'strap', [-.012, 0, -.103, .012, .004, .087], .0014, rubber);
  bevel(p, 'case', [-.021, 0, -.024, .021, .014, .024], .003, steelP(0x64717a));
  top(p, 'digital dial', [-.016, -.016, .016, .016], .0145, layers(flat(0xa8b6a1), (ctx, x, y, w, h) => {
    for (const n of [0, 1, 2, 3]) {
      const left = .08 + n * .22;
      rect(ctx, x, y, w, h, [left, .3, left + .05, .7], 0x323f37);
      rect(ctx, x, y, w, h, [left, .62, left + .14, .7], 0x323f37);
    }
  }));
  for (const z of [.038, .051, .064, .077]) top(p, `strap hole ${z}`, [-.002, z - .002, .002, z + .002], .0045, flat(0x191f21));
  for (const x of [-.012, .012]) p.box(`buckle side ${x}`, [x - .002, 0, -.108, x + .002, .006, -.094], steelP());
  cyl(p, 'buckle crossbar', 'x', [0, .003, -.107], .002, .024, 6, steelP());
}

const silver = steelP(0x82858a), onyx = plasticP(0x20232d);
function earrings(p) {
  for (const s of [-1, 1]) {
    const x = s * .012, z = s * .005;
    loop(p, `wire ${s}`, [x, .001, z - .011], .006, .0009, silver, {}, 12);
    const heart = [[-.008, -.005], [-.004, -.008], [0, -.005], [.004, -.008], [.008, -.005], [.008, 0], [0, .009], [-.008, 0]];
    for (const side of [-1, 1]) {
      const lobe = heart.filter(([dx]) => side * dx >= 0);
      hull(p, `heart ${s} ${side}`, [...lobe.flatMap(([dx, dz]) => [V(x + dx, .001, z + dz), V(x + dx, .003, z + dz)]), V(x + side * .002, .0055, z)], onyx);
    }
  }
}

function ring(p) {
  const band = steelP(0x555961);
  loop(p, 'silver band', [0, .002, 0], .010, .0018, band, {}, 14);
  bevel(p, 'bezel', [-.006, .001, -.014, .006, .006, -.005], .0015, silver);
  hull(p, 'faceted onyx', [
    V(-.0048, .005, -.013), V(.0048, .005, -.013), V(.005, .005, -.006), V(-.005, .005, -.006),
    V(-.003, .008, -.0115), V(.003, .008, -.0115), V(.003, .008, -.0075), V(-.003, .008, -.0075),
  ], onyx);
  for (const s of [-1, 1]) {
    bevel(p, `skull ${s}`, [s * .007 - .0018, .003, -.010, s * .007 + .0018, .005, -.006], .0006, silver);
  }
}

function wallet(p) {
  const leather = speckle('wallet', 0x5f3c2c, [0x78523c, 0x4f3428], .45);
  bevel(p, 'folded lower half', [-.059, 0, -.043, .059, .008, .043], .003, leather);
  bevel(p, 'folded upper half', [-.06, .008, -.043, .058, .019, .043], .003, leather);
  top(p, 'topgrain and stitching', [-.055, -.04, .054, .04], .0195, layers(leather, (ctx, x, y, w, h) => {
    for (let i = 2; i < w - 2; i += 3) for (const j of [2, h - 3]) fill(ctx, x + i, y + j, 1, 1, 0xb18e72);
    for (let j = 2; j < h - 2; j += 3) fill(ctx, x + w - 3, y + j, 1, 1, 0xb18e72);
  }));
  p.box('keeper', [.026, .016, -.013, .063, .023, .013], clothP(0x865e46));
  cyl(p, 'snap', 'y', [.038, .024, 0], .004, .002, 8, steelP(0x9b7951));
}

const bill = layers(paperP(0xc3cda2), (ctx, x, y, w, h) => {
  rect(ctx, x, y, w, h, [.035, .075, .965, .925], 0x4e644b);
  rect(ctx, x, y, w, h, [.056, .13, .944, .87], 0xb7c59b);
  rect(ctx, x, y, w, h, [.37, .17, .63, .83], 0x667954);
  rect(ctx, x, y, w, h, [.455, .28, .545, .56], 0xc7cfad);
  rect(ctx, x, y, w, h, [.42, .54, .58, .72], 0x394e3d);
  for (const a of [.12, .82]) {
    rect(ctx, x, y, w, h, [a, .31, a + .035, .66], 0x4e644b);
    rect(ctx, x, y, w, h, [a - .02, .66, a + .056, .73], 0x4e644b);
  }
});

const newsprint = (paper, highlight) => layers(paperP(paper), (ctx, x, y, w, h) => {
  rect(ctx, x, y, w, h, [.058, .067, .94, .105], highlight);
  rect(ctx, x, y, w, h, [.058, .15, .75, .21], 0x333934);
  rect(ctx, x, y, w, h, [.065, .25, .55, .53], highlight);
  rect(ctx, x, y, w, h, [.072, .255, .54, .38], 0x9ba19b);
  rect(ctx, x, y, w, h, [.125, .31, .21, .49], 0x777e7a);
  rect(ctx, x, y, w, h, [.24, .295, .32, .46], 0x646c63);
  rect(ctx, x, y, w, h, [.33, .34, .47, .49], 0x6d7570);
  rect(ctx, x, y, w, h, [.075, .478, .542, .515], 0x828782);
  for (let line = 0; line < 16; line++) {
    const row = .26 + line * .042;
    for (const col of [.065, .345, .655]) {
      if (row < .55 && col < .6) continue;
      rect(ctx, x, y, w, h, [col, row, col + (line % 5 === 0 ? .17 : .23), row + .008], 0x777969);
    }
  }
});

function newspaper(p, paper, ink) {
  sheet(p, 'lower fold', .27, .31, .002, printP(0xd2c6a9, 0x77786c));
  p.box('interior edges', [-.13, .002, -.148, .129, .004, .151], paperP(0xc7bba1));
  pane(p, 'front page', [V(-.136, .004, .156), V(.122, .004, .15), V(.13, .008, -.152), V(-.133, .005, -.151)], .001, newsprint(paper, ink));
  pane(p, 'creased top corner', [V(.078, .007, -.151), V(.13, .008, -.152), V(.13, .006, -.094), V(.107, .015, -.127)], .0005, printP(0xdad0b6));
}

function tobacco(p) {
  const r = rng('cut tobacco');
  const leaf = speckle('shreds', 0x875a34, [0x533821, 0xb58451, 0x9b6338], .8);
  pile(p, 'loose tobacco', .036, .009, leaf, 'tobacco');
  for (let k = 0; k < 13; k++) {
    const x = (r() - .5) * .062, z = (r() - .5) * .061;
    tube(p, `shred ${k}`, V(x, .007, z), V(x + .009 * (r() - .5), .009, z + .005), .001, .0006, 4, leaf);
  }
}

function driedLeaves(p) {
  const leaf = speckle('dry green leaf', 0x626b37, [0x9a8954, 0x47542e, 0x757940], .65);
  for (const [i, x, z, w] of [[0, -.014, .005, .018], [1, .011, -.009, .014], [2, .014, .013, .012]]) {
    const parent = p.group(`leaf ${i}`, { at: [x, 0, z], rotY: i * .9 });
    crumple(p, `dried leaf ${i}`, w, w * .63, .008, leaf, `leaf ${i}`, { parent });
  }
}

export const INVENTORY_PROPS = [
  item('mp3', 'A portable MP3 player with a blue shell and control wheel.', (p) => mp3(p, false)),
  item('mp3_on', 'The same player with the LCD on.', (p) => mp3(p, true)),
  item('ref_lighter', 'A closed brass refillable lighter.', (p) => lighter(p, false)),
  item('ref_lighter_on', 'An open refillable lighter with a lit wick.', (p) => lighter(p, true)),
  item('bag_plastic', 'An open plastic bag with loose, heat-sealed film.', openPlasticBag),
  item('bag_zipper', 'A clear sandwich bag with a double press seal.', pressSealBag),
  item('tobacco', 'A small heap of loose cut tobacco.', tobacco),
  item('weed', 'Several crumpled dried green leaves.', driedLeaves),
  item('wallet', 'A brown stitched billfold with a snap closure.', wallet),
  item('money_one', 'A green banknote with a central portrait.', (p) => sheet(p, 'banknote', .156, .066, .0006, bill)),
  item('rolling_paper', 'A thin ivory rolling paper with a gum strip.', (p) => {
    pane(p, 'thin leaf', [V(-.039, .0005, .021), V(.039, .001, .02), V(.038, .002, -.023), V(-.04, .001, -.021)], .0003,
      layers(paperP(0xeee9d8), (ctx, x, y, w, h) => rect(ctx, x, y, w, h, [0, 0, 1, .14], 0xcfbf92)));
  }),
  item('boots_combat', 'A pair of laced tactical boots with lug soles.', combatBoots),
  item('boxer_shorts', 'Grey-blue boxers with contrasting elastic.', (p) => drawShorts(p,'boxer_shorts')),
  item('xlboxer_shorts', 'Oversized slate boxers with contrasting elastic.', (p) => drawShorts(p,'xlboxer_shorts')),
  item('xsboxer_shorts', 'Small taupe boxers with contrasting elastic.', (p) => drawShorts(p,'xsboxer_shorts')),
  item('pants_cargo', 'Olive cargo trousers with raised bellows pockets.', cargoTrousers),
  item('gloves_fingerless', 'Two short leather gloves with open fingertips.', gloves),
  item('tank_top', 'An ivory cotton tank with a shaped neckline.', tankTop),
  item('wristwatch', 'A digital wristwatch with a grey rubber strap.', watch),
  item('socks', 'Two overlapping crew socks with slate toes and cuffs.', socks),
  item('xlsocks', 'Oversized crew socks with brown cuffs.', (p) => { p.root.scale.setScalar(1.12); socks(p, 0x7c6555); }),
  item('xssocks', 'Small crew socks with olive cuffs.', (p) => { p.root.scale.setScalar(.87); socks(p, 0x6d7559); }),
  item('trenchcoat', 'A belted canvas trench coat with lapels and buttons.', trenchcoat),
  item('onyx_silver_earring', 'Two silver earrings with black onyx hearts.', earrings),
  item('onyx_silver_ring', 'A dark silver ring with a faceted onyx and flanking skulls.', ring),
  ...[
    ['newest_newspaper', 0xe1d8bf, 0x586765],
    ['newspaper_memorial', 0xe4d8c3, 0x764e49],
    ['many_years_old_newspaper', 0xbdaa80, 0x6d6550],
    ['years_old_newspaper', 0xc4b28c, 0x676452],
    ['one_year_old_newspaper', 0xd0bd98, 0x565e62],
    ['months_old_newspaper', 0xd8c7a5, 0x6b5e4d],
    ['weeks_old_newspaper', 0xdcd2b8, 0x5a6560],
  ].map(([id, paper, ink]) => item(id, 'Folded broadsheet with a halftone photograph and columns.', (p) => newspaper(p, paper, ink))),
].map((r) => ({
  ...r,
  dir: 'items',
  ppm: /onyx|rolling_paper/.test(r.id) ? 1800 : /boots|trenchcoat|pants_cargo|tank_top/.test(r.id) ? 256 : 512,
  source: 'tools/cubeclysm/page/inventory-props.js',
}));
