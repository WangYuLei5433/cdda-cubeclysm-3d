// Common unmodelled loot from the CDDA item census. Dimensions are metres.
import {
  GLASS, V, band, bevel, blob, clothP, cyl, denimP, fill, flat, hull, layers, lump,
  pane, paperP, plasticP, printP, shade, speckle, steelP, stoneP, tube, woodP,
} from './item-kit.js';
import { poly } from './lowpoly.js';

const graphite = plasticP(0x343a3e);
const nickel = steelP(0x979ea0);
const ink = flat(0x212829);
const kraft = paperP(0xad875e);
const item = (id, desc, longest, build, ppm = 384) => ({ id, desc, longest, build, ppm });
const top = (p, name, [x0, z0, x1, z1], y, paint, opts) =>
  pane(p, name, [V(x0, y, z1), V(x1, y, z1), V(x1, y, z0), V(x0, y, z0)], .0004, paint, opts);

function badge(base, stripe) {
  return layers(base, (ctx, x, y, w, h) => {
    fill(ctx, x, y, w, Math.max(1, Math.round(h * .21)), stripe);
  });
}

function diskPaint(color, rim, detail) {
  return (ctx, x, y, w, h) => {
    for (let j = 0; j < h; j++) {
      const dy = (j + .5) / h * 2 - 1;
      const edge = Math.sqrt(Math.max(0, 1 - dy * dy)) * w / 2;
      const line = Math.floor(edge * 2);
      fill(ctx, x + Math.floor((w - line) / 2), y + j, line, 1, rim);
      if (line > 4 && j > 1 && j < h - 2) fill(ctx, x + Math.floor((w - line) / 2) + 2, y + j, line - 4, 1, color);
    }
    detail?.(ctx, x, y, w, h);
  };
}

function ringSurface(p, name, y, inner, outer, paint) {
  for (let k = 0; k < 16; k++) {
    const a = k * Math.PI / 8, b = (k + 1) * Math.PI / 8;
    const point = (r, angle) => V(Math.cos(angle) * r, y, Math.sin(angle) * r);
    poly(p, `${name} ${k}`, [point(inner, a), point(outer, a), point(outer, b), point(inner, b)], V(0, 1, 0), paint);
  }
}

function pliers(p) {
  for (const s of [-1, 1]) {
    const shaped = (name, outline, bottom, height, paint) => {
      hull(p, `${name} ${s}`, outline.flatMap(([x, z]) => [V(s * x, bottom, z), V(s * x, height, z)]), paint);
    };
    shaped('forged jaw', [[.003,-.078],[.012,-.081],[.02,-.05],[.016,-.018],[.002,-.008]], .002, .015, nickel);
    for (let k = 0; k < 5; k++) {
      const z = -.074 + k * .006;
      p.box(`grip tooth ${s} ${k}`, [s * .004 - .0013, .008, z, s * .004 + .0013, .014, z + .002], nickel);
    }
    shaped('grip', [[.005,-.018],[.017,-.014],[.037,.083],[.015,.089],[.008,.031]], 0, .015, plasticP(0x375953));
    shaped('neck', [[0,-.027],[.015,-.023],[.021,.017],[.008,.024]], .003, .019, nickel);
  }
  cyl(p, 'adjustable pivot', 'y', [0,.019,-.017], .009, .004, 10, steelP(0x626b6b));
}

function xacto(p) {
  cyl(p, 'precision grip', 'x', [-.012,.0095,0], .009, .072, 10, steelP(0x919ca1));
  cyl(p, 'knurled collar', 'x', [.025,.0096,0], .0096, .012, 12,
    layers(nickel, (ctx, x, y, w, h) => {
      for (let j = 1; j < h; j += 2) fill(ctx, x, y + j, w, 1, 0x5d686b);
    }));
  hull(p, 'craft blade', [[.03,.002],[.052,-.002],[.041,-.006],[.03,-.005]].flatMap(([x,z]) =>
    [V(x,.007,z), V(x,.009,z)]), steelP(0xc9d0cf));
}

function laptop(p) {
  const frame = plasticP(0x485963);
  bevel(p, 'lower chassis', [-.161,0,-.108,.161,.011,.108], .004, graphite);
  bevel(p, 'graphite display lid', [-.161,.011,-.108,.161,.020,.108], .003, frame);
  for (const x of [-.102,.102]) cyl(p, `hinge ${x}`, 'x', [x,.011,-.105], .005, .052, 8, graphite);
  top(p, 'maker emblem', [-.017,-.018,.017,.018], .0204, flat(0x92a0a3));
  for (const z of [-.065,-.034,.018]) p.box(`socket ${z}`, [.160,.003,z,.162,.007,z+.013], ink);
}

function screwdriver(p) {
  const grip = plasticP(0x9b392d);
  cyl(p, 'fluted red handle', 'x', [-.03,.012,0], .013, .059, 8, grip, {}, .0105);
  cyl(p, 'rubber neck', 'x', [.001,.012,0], .0105, .007, 8, graphite);
  cyl(p, 'steel shaft', 'x', [.027,.012,0], .0036, .048, 8, nickel);
  cyl(p, 'cross tip', 'x', [.055,.012,0], .0036, .007, 4, steelP(0x546060), {}, .0024);
}

function stapler(p) {
  bevel(p, 'non-slip foot', [-.08,0,-.022,.08,.012,.022], .004, graphite);
  p.box('staple channel', [-.065,.018,-.013,.074,.035,.013], nickel);
  const upper = p.group('hinged lid', { at:[-.066,.026,0],rotZ:.07 });
  bevel(p, 'red top cap', [0,0,-.022,.145,.023,.022], .007, plasticP(0x9e463c), { parent:upper });
  p.box('striker plate', [.048,.010,-.012,.069,.013,.012], nickel);
  cyl(p, 'hinge pin', 'z', [-.062,.022,0], .006, .047, 10, nickel);
}

function extinguisher(p) {
  const red = plasticP(0xa5362a), dark = plasticP(0x25292a);
  cyl(p, 'cylinder', 'y', [0,.134,0], .057, .246, 12, red);
  cyl(p, 'foot ring', 'y', [0,.011,0], .058, .022, 12, dark);
  cyl(p, 'shoulder', 'y', [0,.276,0], .057, .039, 12, red, {}, .032);
  cyl(p, 'valve', 'y', [0,.31,0], .022, .035, 10, nickel);
  p.box('squeeze grip', [-.036,.337,-.012,.065,.35,.009], dark);
  p.box('upper lever', [-.034,.380,-.01,.066,.400,.011], dark);
  p.box('lever pivot', [-.036,.319,-.012,-.012,.386,.012], dark);
  cyl(p, 'short horn', 'x', [-.057,.323,0], .02, .065, 10, dark, {}, .010);
  pane(p, 'white instruction label', [V(.022,.095,-.058), V(-.022,.095,-.058), V(-.022,.217,-.058), V(.022,.217,-.058)],
    .001, printP(0xe4ded0,0x657477));
  cyl(p, 'pressure dial', 'z', [0,.322,-.024], .013, .008, 12, plasticP(0xccba7b));
}

function tapeMeasure(p) {
  bevel(p, 'rubber case', [-.041,0,-.036,.041,.034,.036], .008, graphite);
  bevel(p, 'yellow case halves', [-.039,.003,-.035,.039,.038,.035], .007, plasticP(0xeab541));
  top(p, 'round maker badge', [-.020,-.018,.020,.018], .0386, diskPaint(0x363d3f,0xc88f2d), { cutout:true });
  p.box('tape mouth', [.033,.001,-.015,.043,.009,.015], graphite);
  p.box('metal end hook', [.042,.003,-.011,.048,.011,.011], nickel);
  bevel(p, 'thumb lock', [.011,.037,-.012,.032,.046,.012], .003, graphite);
}

function glassJar(p) {
  const glass = flat(0xb7d3ca);
  cyl(p, 'thick base', 'y', [0,.007,0], .073,.014, 14, glass, GLASS);
  cyl(p, 'glass wall', 'y', [0,.088,0], .073,.158, 14, glass, { ...GLASS, open:true });
  cyl(p, 'shoulder', 'y', [0,.175,0], .073,.016, 14, glass, { ...GLASS, open:true }, .056);
  cyl(p, 'gold sealing lid', 'y', [0,.191,0], .058,.017, 14, steelP(0xb09056));
  ringSurface(p, 'lid rim', .1997, .052, .057, flat(0xc2a066));
  pane(p, 'blank label strip', [V(.024,.046,-.074),V(-.024,.046,-.074),V(-.024,.086,-.074),V(.024,.086,-.074)], .001,
    printP(0xd3c0a0,0x857760));
}

function bottle(p) {
  const film = flat(0xa6c2b4);
  cyl(p, 'moulded base', 'y', [0,.012,0], .042,.024, 12, film, GLASS, .049);
  cyl(p, 'clear PET sides', 'y', [0,.127,0], .051,.21, 12, film, { ...GLASS, open:true });
  cyl(p, 'rounded shoulder', 'y', [0,.261,0], .051,.059, 12, film, { ...GLASS, open:true }, .014);
  cyl(p, 'red cap', 'y', [0,.300,0], .0145,.020, 12, plasticP(0xa44038));
  cyl(p, 'soda label', 'y', [0,.146,0], .052,.075, 12,
    band(plasticP(0xa03932), 0xdbd1b8,.44,.55), { open:true });
}

function yoghurtCup(p) {
  const white = plasticP(0xe7e8df);
  cyl(p, 'cup base', 'y', [0,.004,0], .029,.008, 12, white);
  cyl(p, 'flared cup', 'y', [0,.037,0], .029,.065, 12,
    band(white,0x6e90a7,.32,.66), { cutout:true,open:true }, .038);
  ringSurface(p, 'rolled lip', .0695,.035,.040, white);
  cyl(p, 'inner bottom', 'y', [0,.008,0], .029,.002, 12, flat(0xcdd2ca));
}

function foldedBox(p) {
  p.box('bottom folded blank', [-.4,0,-.205,.4,.009,.205], kraft);
  p.box('top folded blank', [-.389,.009,-.202,.399,.017,.2], kraft);
  for (const x of [-.227,.207]) p.box(`score ${x}`, [x,.017,-.199,x+.003,.0176,.199], flat(0x795f44));
  for (const z of [-.201,.204]) p.box(`corrugated edge ${z}`, [-.397,.002,z,.397,.012,z+.001], band(kraft,0x725338,.55,.74));
  top(p, 'shipping sticker', [.045,-.085,.160,-.022], .0177, printP(0xd8c8a9,0x5e574b));
}

function seasoningBottle(p) {
  const glass = flat(0xb8c6ac);
  bevel(p, 'square bottle', [-.033,0,-.033,.033,.137,.033], .008, glass, GLASS);
  cyl(p, 'neck', 'y', [0,.147,0], .024,.029, 12, glass, GLASS);
  cyl(p, 'large green screw cap', 'y', [0,.168,0], .027,.024, 12, plasticP(0x465d43));
  pane(p, 'paper spice label', [V(.028,.041,-.034), V(-.028,.041,-.034), V(-.028,.113,-.034), V(.028,.113,-.034)],
    .0008, badge(printP(0xd6cfac,0x666547),0x677949));
}

function aidPouch(p) {
  const nylon = clothP(0x61715b), dark = clothP(0x34423c);
  bevel(p, 'trauma kit pouch', [-.083,0,-.105,.083,.059,.105], .015, nylon);
  bevel(p, 'front flap', [-.076,.050,-.091,.076,.067,.066], .008, dark);
  for (const x of [-.059,.051]) p.box(`webbing ${x}`, [x,.061,-.074,x+.009,.069,.053], clothP(0x7e846a));
  tube(p, 'zipper pull', V(.072,.050,.043), V(.087,.046,.075), .004,.004,5,nickel);
  top(p, 'medical patch', [-.026,-.034,.026,.024], .0689, layers(flat(0x949984), (ctx,x,y,w,h) => {
    fill(ctx, x+Math.floor(w*.4), y+Math.floor(h*.19), Math.ceil(w*.2), Math.ceil(h*.62), 0x913b34);
    fill(ctx, x+Math.floor(w*.19), y+Math.floor(h*.4), Math.ceil(w*.62), Math.ceil(h*.2), 0x913b34);
  }));
}

function usb(p) {
  bevel(p, 'blue body', [-.025,0,-.008,.013,.009,.008], .0025, plasticP(0x436989));
  p.box('USB-A connector', [.012,.002,-.006,.025,.007,.006], nickel);
  p.box('connector slot', [.023,.003,-.004,.0254,.006,.004], graphite);
  top(p, 'activity dot', [-.017,-.003,-.013,.001], .0093, flat(0x82a875));
}

function roll(p, r, h, outer, inner, core) {
  const options = { open:true,cutout:true };
  cyl(p, 'outer roll', 'y', [0,h/2,0], r,h,16,outer,options);
  cyl(p, 'paper core', 'y', [0,h/2,0], inner,h,16,core,options);
  ringSurface(p, 'wound layers', h,inner,r,outer);
  ringSurface(p, 'cardboard lip', h+.0004,inner,inner+.003,core);
}

function cell(p) {
  const jacket = band(plasticP(0x2e413e),0xc89758,.67,1);
  cyl(p, 'wrapped alkaline cell', 'x', [-.0007,.0073,0], .0073,.0486,12,jacket);
  cyl(p, 'positive terminal', 'x', [.0242,.0073,0], .003,.002,10,nickel);
  cyl(p, 'negative end', 'x', [-.0248,.0073,0], .00715,.001,10,nickel);
}

function toothbrush(p) {
  const teal = plasticP(0x417879);
  bevel(p, 'curved plastic handle', [-.09,0,-.008,.041,.013,.008], .005, teal);
  tube(p, 'raised neck', V(.027,.008,0), V(.068,.012,0), .006,.004,8,teal);
  bevel(p, 'brush head', [.06,.007,-.008,.09,.018,.008], .003, teal);
  for (let x = .063; x < .087; x += .004) {
    for (const z of [-.005,0,.005]) {
      p.box(`bristle tuft ${x} ${z}`, [x,.016,z-.0013,x+.0024,.024,z+.0013], plasticP(z ? 0xd5d8c7 : 0xa1bab1));
    }
  }
}

function cuttingBoard(p) {
  bevel(p, 'maple board', [-.205,0,-.124,.205,.026,.124], .009, woodP(0xc19462));
  top(p, 'cutting face', [-.197,-.117,.197,.117], .0265, layers(woodP(0xc79665), (ctx,x,y,w,h) => {
    fill(ctx,x+4,y+5,w-8,1,0x8a6545);
    fill(ctx,x+4,y+h-6,w-8,1,0x8a6545);
    for (let i=0;i<7;i++) fill(ctx,x+Math.floor(w*(.25+i*.068)),y+Math.floor(h*.35),1,Math.floor(h*(.2+i%3*.055)),0xa5764e);
  }));
}

function pan(p) {
  const cast = speckle('cast iron',0x414344,[0x505351,0x303131],.45);
  cyl(p, 'cast iron bottom', 'y', [-.066,.009,0], .124,.018, 16, cast);
  cyl(p, 'flared wall', 'y', [-.066,.033,0], .124,.048, 16, cast, { open:true,cutout:true }, .139);
  const rim = p.group('rim centre', { at:[-.066,0,0] });
  for (let k=0;k<16;k++) {
    const a=k*Math.PI/8, b=(k+1)*Math.PI/8;
    tube(p,`rim ${k}`,V(Math.cos(a)*.139,.057,Math.sin(a)*.139),
      V(Math.cos(b)*.139,.057,Math.sin(b)*.139),.003,.003,4,cast,{ parent:rim });
  }
  bevel(p, 'integral handle', [.058,.033,-.019,.205,.055,.019], .009, cast);
  top(p, 'handle eye', [.176,-.007,.194,.007], .0555, flat(0x232827));
}

function coin(p, r, copper) {
  const face = copper ? 0xaa6d47 : 0xa5a7a0, rim = copper ? 0xc28a63 : 0xc7cbc4;
  cyl(p, 'coin blank', 'y', [0,.0009,0], r,.0018, 20, steelP(rim));
  const faceHeight = .0021;
  poly(p, 'embossed portrait', [V(-r,faceHeight,r), V(r,faceHeight,r), V(r,faceHeight,-r), V(-r,faceHeight,-r)], V(0,1,0), diskPaint(face,rim,(ctx,x,y,w,h) => {
    const relief = shade(face,1.23), shadow = shade(face,.68);
    const left = Math.floor(w * (copper ? .41 : .34));
    fill(ctx,x+left,y+Math.floor(h*.26),Math.ceil(w*.24),Math.ceil(h*.34),relief);
    fill(ctx,x+Math.floor(w*.29),y+Math.floor(h*.59),Math.ceil(w*.39),Math.ceil(h*.14),shadow);
    fill(ctx,x+Math.floor(w*.32),y+Math.floor(h*.55),Math.ceil(w*.33),Math.ceil(h*.15),relief);
    fill(ctx,x+Math.floor(w*(copper ? .63 : .27)),y+Math.floor(h*.42),Math.ceil(w*.1),Math.ceil(h*.09),relief);
  }), { cutout:true });
}

function blanket(p) {
  const blue = clothP(0x675e68);
  bevel(p,'bottom fold',[-.235,0,-.168,.235,.043,.168],.017,blue);
  bevel(p,'upper fold',[-.225,.039,-.161,.228,.087,.165],.018,blue);
  top(p,'woven stripes',[-.214,-.146,.213,.151],.0875,
    layers(blue,(ctx,x,y,w,h) => {
      for (const j of [.12,.2,.74,.82]) fill(ctx,x,y+Math.floor(h*j),w,Math.max(1,Math.round(h*.024)),0xa58a83);
    }));
}

function denimShorts(p) {
  const blue = denimP(0x54738a);
  p.box('seat',[-.158,0,-.158,.158,.018,.017],blue);
  for (const side of [-1,1]) {
    const shape = [[.008,-.015],[.157,-.026],[.167,.153],[.031,.182]];
    hull(p,`hemmed leg ${side}`,shape.flatMap(([x,z])=>[V(side*x,0,z),V(side*x,.018,z)]),blue);
    const x=side*.091;
    top(p,`pocket stitching ${side}`,[x-.042,-.113,x+.042,-.044],.0185,
      badge(denimP(0x496680),0xa4825e));
  }
  p.box('waistband',[-.162,0,-.16,.162,.022,-.125],denimP(0x435e72));
  cyl(p,'brass button','y',[0,.022,-.131],.005,.003,8,steelP(0xa58956));
}

function garlic(p) {
  const skin= speckle('garlic paper',0xe2d7bb,[0xb5a48f,0xeedec8,0xd0bac1],.43);
  for (let k=0;k<5;k++) {
    const a=k*2*Math.PI/5;
    blob(p,`clove ${k}`,[.015,.022,.014],[Math.cos(a)*.013,.022,Math.sin(a)*.013],skin,{},3,7);
  }
  cyl(p,'dry stalk','y',[0,.042,0],.007,.032,7,paperP(0xcdbb98),{},.004);
}

function matchbox(p) {
  p.box('cardboard sleeve',[-.026,0,-.018,.025,.014,.018],paperP(0x9b6040));
  p.box('sliding drawer',[.022,.002,-.016,.032,.011,.016],kraft);
  top(p,'striking strip',[-.024,.012,.024,.017],.0144,speckle('striker',0x7e4e3c,[0xa18065,0x4e3229],.66));
  top(p,'printed cover',[-.022,-.014,.022,.011],.0144,badge(printP(0xdfc898,0x695849),0x9c4532));
  for (const z of [-.008,0,.008]) {
    p.box(`match ${z}`, [.023,.011,z-.0008,.031,.0128,z+.0008], woodP(0xd4b182));
    cyl(p,`match tip ${z}`,'x',[.031,.012,z],.0015,.002,6,flat(0x833c35));
  }
}

function belt(p) {
  const leather = clothP(0x674839);
  for (let k=0;k<16;k++) {
    const a=k*Math.PI/8, b=(k+1)*Math.PI/8;
    const point=(t)=>V(Math.cos(t)*.064,.017,Math.sin(t)*.043);
    tube(p,`leather band ${k}`,point(a),point(b),.012,.012,4,leather);
  }
  p.box('tail',[.009,.002,-.055,.106,.011,-.027],leather);
  for (const x of [.070,.081,.093]) cyl(p,`belt hole ${x}`,'y',[x,.011,-.04],.0025,.001,8,flat(0x392921));
  for (const z of [-.016,.016]) p.box(`buckle rail ${z}`,[-.044,.025,z-.004,-.004,.032,z+.004],nickel);
  for (const x of [-.043,-.005]) p.box(`buckle end ${x}`,[x-.004,.025,-.02,x+.004,.032,.02],nickel);
  p.box('buckle tongue',[-.029,.031,-.003,-.002,.035,.003],nickel);
}

export const CARRY_PROPS = [
  item('flint', 'An angular chunk of blue-grey flint with a chalky cortex.', .08, (p) => {
    const paint = speckle('flint',0x525c67,[0x37444d,0x909082,0x687580],.52);
    lump(p,'flint nodule',[.048,.023,.031],paint,'chipped flint');
  }, 640),
  item('jar_3l_glass_sealed', 'Three-litre canning jar with a gold screw lid.', .20, glassJar),
  item('bottle_twoliter', 'Two-litre clear soda bottle with a red cap.', .31, bottle),
  item('cup_plastic_yoghurt', 'Vacuum-formed dairy cup with a blue band and open mouth.', null, yoghurtCup),
  item('box_medium_folded', 'Flattened double-wall carton with scored folds.', .80, foldedBox, 160),
  item('bottle_glass_seasoning', 'Half-litre glass spice jar with a green cap.', .18, seasoningBottle),
  item('ifak_pouch', 'Olive zip pouch with webbing and a first-aid patch.', null, aidPouch),
  item('pliers', 'Slip-joint pliers with forged jaws and two green grips.', .17, pliers, 640),
  item('xacto', 'A small metal craft knife with a knurled collar.', .10, xacto, 768),
  item('stapler', 'A red desk stapler with a visible metal channel.', .16, stapler),
  item('laptop', 'A slim graphite laptop, closed, with hinges and side ports.', .322, laptop),
  item('screwdriver', 'A small Phillips screwdriver with a fluted red handle.', .12, screwdriver, 640),
  item('sm_extinguisher', 'A compact red CO₂ extinguisher with black horn and squeeze lever.', .40, extinguisher),
  item('usb_drive', 'A blue USB thumb drive with a metal USB-A connector.', .05, usb, 960),
  item('tape_measure', 'A yellow retracting tape measure with rubber corners.', null, tapeMeasure, 640),
  item('duct_tape', 'A wide roll of silver duct tape around a cardboard core.', .125,
    (p) => roll(p,.0625,.050,clothP(0x888f8c),.036,kraft)),
  item('light_battery_cell', 'A dark green alkaline cell with a copper stripe.', .05, cell, 960),
  item('toothbrush_plain', 'A teal plastic toothbrush with soft ivory bristles.', .18, toothbrush, 640),
  item('cutting_board', 'A scored maple cutting board with a shallow edge groove.', .41, cuttingBoard, 240),
  item('pan', 'A cast-iron skillet with a low flared wall and integral handle.', .41, pan, 240),
  item('coin_quarter', 'A silver quarter with a raised Washington profile.', null, (p) => coin(p,.01213,false), 2048),
  item('coin_penny', 'A copper penny with a raised Lincoln profile.', null, (p) => coin(p,.009525,true), 2048),
  item('blanket', 'A folded woven blanket with muted burgundy stripes.', null, blanket, 240),
  item('shorts_denim', 'Blue denim shorts with turned hems and a brass button.', null, denimShorts, 288),
  item('garlic', 'A pale bulb with distinct cloves and a dry stalk.', null, garlic, 640),
  item('toilet_paper', 'A white roll of tissue with a hollow kraft core.', null,
    (p) => roll(p,.052,.098,paperP(0xe3ded2),.022,kraft)),
  item('ref_matches', 'A small open cardboard matchbox with a textured striker.', null, matchbox, 960),
  item('leather_belt', 'A brown coiled leather belt with a square metal buckle.', null, belt, 384),
].map(({ longest, ...recipe }) => ({
  ...recipe,
  dir: 'items',
  desc: longest ? `${recipe.desc} (CDDA longest side: ${Math.round(longest * 1000)} mm.)` : recipe.desc,
  source: 'tools/cubeclysm/page/carry-props.js',
}));
