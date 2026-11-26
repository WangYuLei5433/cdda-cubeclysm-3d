// Redrawn items: ids whose family builder produced a model that did not match the CDDA
// description (checked against experimental-2026-11-14). Each entry replaces the family
// builder for that one id; item-workshop.js, item-supply.js and item-market.js look here first.
import { V, bevel, clothP, cyl, hull, path, plasticP, ring, shade, steelP, top, tube } from './common-loot-kit.js';
import { blob } from './item-kit.js';
import { cutShape, oval, profile } from './item-workshop-kit.js';

const METAL = { metal: true };
const brass = steelP(0xc9a558);
const steel = steelP(0xb9bec2);
const cream = clothP(0xe8e1cf);
const black = plasticP(0x2d2e31);

/** Pistol holster lying on its back: wide mouth at -z, barrel sleeve down to +z. */
function holster(p, { leather, edge, thread, nylon }) {
  const body = [[-.2,-.4],[.2,-.4],[.24,-.31],[.22,-.17],[.13,-.11],[.12,.38],[.06,.45],[-.06,.45],[-.12,.38],[-.13,-.08],[-.19,-.16]];
  cutShape(p, 'molded holster body', body, .15, leather);
  cutShape(p, 'trigger guard bulge', [[.12,-.17],[.2,-.17],[.2,-.06],[.12,-.03]], .17, leather);
  bevel(p, 'holster mouth', [-.19,.11,-.42,.19,.17,-.36], .02, edge);
  // Belt loop folded behind the mouth.
  bevel(p, 'belt loop', [-.17,.0,-.5,.17,.06,-.33], .02, edge);
  path(p, 'thumb-break strap', [[-.2,.16,-.3],[-.04,.2,-.33],[.12,.19,-.32],[.22,.16,-.27]], .022, edge);
  cyl(p, 'strap snap', 'y', [.13,.2,-.32], .03, .02, 10, nylon ? black : steelP(0xc2a46a), METAL);
  if (nylon) bevel(p, 'plastic retention buckle', [-.08,.15,-.26,.08,.19,-.2], .01, black);
  const stitch = body.map(([x, z]) => [x * .9, .152, z * .94]);
  path(p, 'edge stitching', [...stitch, stitch[0]], .006, thread);
}

/** Pair of knee-high gaiters laid side by side. */
function gaiters(p, d) {
  const nylon = clothP(d.color), canvas = clothP(0x6d6655), trim = plasticP(0x2b2b2e);
  for (const s of [-1, 1]) {
    const x = s * .2;
    const shape = [[x-.17,-.45],[x+.17,-.45],[x+.14,.1],[x+.15,.3],[x+.19,.44],[x-.19,.44],[x-.15,.3],[x-.14,.1]];
    cutShape(p, 'nylon gaiter shell', shape, .07, nylon);
    cutShape(p, 'canvas lower panel', [[x-.15,.18],[x+.15,.18],[x+.15,.3],[x+.19,.44],[x-.19,.44],[x-.15,.3]], .075, canvas);
    path(p, 'front hook-and-loop closure', [[x,.08,-.44],[x,.085,.43]], .02, trim);
    path(p, 'top drawcord', [[x-.17,.075,-.43],[x,.085,-.47],[x+.17,.075,-.43]], .012, trim);
    cyl(p, 'cord lock', 'y', [x+.09,.09,-.46], .025, .03, 8, trim);
    path(p, 'instep strap', [[x-.17,.04,.42],[x-.1,.0,.5],[x+.1,.0,.5],[x+.17,.04,.42]], .018, trim);
    bevel(p, 'lace hook', [x-.02,.07,.43,x+.02,.1,.48], .006, steelP(0x8d9094), METAL);
  }
}

/** Upright jackhammer: T handles on top, motor body, chisel point at the ground. */
function jackhammer(p, d) {
  const electric = d.id === 'elec_jackhammer';
  const body = plasticP(electric ? 0xd2a32e : 0xb5463a), dark = plasticP(0x2f3033);
  cyl(p, 'chisel bit', 'y', [0,.17,0], .022, .3, 8, steel, METAL);
  hull(p, 'chisel point', [V(-.022,.02,-.022),V(.022,.02,-.022),V(.022,.02,.022),V(-.022,.02,.022),V(0,0,0)], steel, METAL);
  cyl(p, 'tool retainer', 'y', [0,.34,0], .055, .06, 10, dark);
  cyl(p, 'percussion barrel', 'y', [0,.45,0], .075, .18, 12, steelP(0x7d8288), METAL);
  bevel(p, 'motor housing', [-.13,.52,-.11,.13,.74,.11], .03, body);
  if (electric) {
    for (const y of [.57,.62,.67]) bevel(p, 'cooling vent', [-.135,y,-.06,-.125,y+.02,.06], .003, dark);
    path(p, 'power cord', [[.13,.62,.05],[.24,.55,.12],[.28,.3,.2],[.2,.04,.26],[-.05,.02,.3],[-.25,.02,.2]], .016, dark);
  } else {
    bevel(p, 'fuel tank', [-.12,.74,-.1,.12,.8,.1], .025, plasticP(0xd8d2c4));
    cyl(p, 'fuel cap', 'y', [.07,.815,.05], .025, .03, 8, dark);
    cyl(p, 'pull starter', 'x', [.15,.62,0], .06, .04, 12, dark);
    path(p, 'muffler pipe', [[-.13,.58,.08],[-.18,.56,.08],[-.18,.5,.08]], .02, steelP(0x6c6a66), METAL);
  }
  cyl(p, 'handle stem', 'y', [0,.86,0], .03, .14, 8, steelP(0x6e7378), METAL);
  cyl(p, 'T handle bar', 'x', [0,.93,0], .025, .5, 8, steelP(0x6e7378), METAL);
  for (const s of [-1, 1]) cyl(p, 'rubber grip', 'x', [s*.19,.93,0], .035, .13, 10, dark);
  bevel(p, 'throttle lever', [.12,.88,-.04,.2,.9,-.01], .006, dark);
}

/** Corset laid face down, showing boning and back lacing. */
function corset(p, d) {
  const waist = d.id === 'corset_waist';
  const leather = plasticP(0x2b2729), bone = plasticP(0x4a4346), eyelet = steelP(0xb7b9b4);
  const shape = waist
    ? [[-.25,-.3],[0,-.27],[.25,-.3],[.19,-.08],[.18,.06],[.27,.3],[0,.34],[-.27,.3],[-.18,.06],[-.19,-.08]]
    : [[-.3,-.36],[-.15,-.44],[0,-.37],[.15,-.44],[.3,-.36],[.21,-.08],[.2,.06],[.3,.36],[0,.44],[-.3,.36],[-.2,.06],[-.21,-.08]];
  cutShape(p, 'leather corset body', shape, .06, leather);
  const top = waist ? -.27 : -.36, bottom = waist ? .3 : .38;
  for (const x of [-.22,-.15,-.08,.08,.15,.22]) {
    const w = (z) => Math.abs(z) < .1 ? .7 : 1;
    path(p, 'steel boning channel', [[x*w(top),.062,top+.03],[x*.72,.063,0],[x*w(bottom),.062,bottom-.03]], .009, bone);
  }
  for (let k = 0; k < 7; k++) {
    const z = top + .05 + k * (bottom - top - .1) / 6;
    for (const s of [-1, 1]) cyl(p, 'lacing eyelet', 'y', [s*.035,.062,z], .014, .006, 8, eyelet, METAL);
    if (k < 6) {
      const z2 = top + .05 + (k + 1) * (bottom - top - .1) / 6;
      path(p, 'crossed lace', [[-.035,.07,z],[.035,.07,z2]], .006, cream);
      path(p, 'crossed lace', [[.035,.07,z],[-.035,.07,z2]], .006, cream);
    }
  }
  path(p, 'lace bow', [[0,.07,.02],[.08,.075,.06],[.03,.07,.1],[0,.07,.02],[-.08,.075,.06],[-.03,.07,.1],[0,.07,.02]], .008, cream);
  path(p, 'lace tails', [[0,.07,.02],[.04,.068,.17]], .006, cream);
}

/** Half ellipsoid resting on the ground, centred at [x, z]. */
function dome(p, name, [rx, ry, rz], [x, z], paint, opts = {}, rings = 4, sides = 12) {
  const pts = [];
  for (let i = 0; i <= rings; i++) {
    const a = (i / rings) * Math.PI / 2, y = Math.sin(a) * ry, r = Math.cos(a);
    for (let k = 0; k < (r < .01 ? 1 : sides); k++) { const t = (k / sides) * 2 * Math.PI; pts.push(V(x + Math.cos(t) * r * rx, y, z + Math.sin(t) * r * rz)); }
  }
  hull(p, name, pts, paint, opts);
}

export const REDRAWN = {
  bootstrap(p) {
    // CDDA: "A small concealed holster worn on the ankle."
    const leather = plasticP(0x2e2d2f);
    bevel(p, 'elastic ankle band', [-.48,0,-.04,.48,.03,.2], .015, plasticP(0x55534f));
    bevel(p, 'hook-and-loop end tab', [.33,.025,-.035,.48,.045,.195], .01, plasticP(0x3d3c3a));
    cutShape(p, 'pistol pocket', [[-.3,-.16],[.16,-.16],[.16,-.04],[.05,.0],[.03,.28],[-.13,.28],[-.15,.06],[-.3,.06]], .11, leather, .03);
    path(p, 'retention strap', [[-.12,.15,-.17],[-.12,.16,.0],[-.05,.15,.08]], .02, leather);
    cyl(p, 'strap snap', 'y', [-.06,.16,.06], .025, .02, 10, steelP(0xa6a7a3), METAL);
  },
  holster(p) {
    // CDDA: "A leather strap worn on the hip for holding pistol-sized guns."
    holster(p, { leather: plasticP(0x7a5034), edge: plasticP(0x5d3b26), thread: clothP(0xd2b98a) });
  },
  nylon_holster(p) {
    // CDDA: "Holster made from nylon, rather than leather."
    holster(p, { leather: clothP(0x3b3d41), edge: clothP(0x2b2c2f), thread: clothP(0x5c5f63), nylon: true });
  },
  obi_gi(p) {
    // CDDA: "A broad, black obi gi." Tied in a square knot with both tails hanging.
    const obi = clothP(0x2a292c), seam = clothP(0x4a484c);
    cutShape(p, 'wrapped belt', oval(0, -.1, .44, .27, 18), .03, obi, 0, [oval(0, -.1, .33, .17, 18)]);
    cutShape(p, 'second wrap', oval(0, -.08, .42, .25, 18), .03, obi, .03, [oval(0, -.08, .32, .16, 18)]);
    for (const [rx, rz] of [[.385,.22],[.37,.21]]) {
      const ring = oval(0, -.09, rx, rz, 18).map(([x, z]) => [x, .062, z]);
      path(p, 'stitched rows', [...ring, ring[0]], .004, seam);
    }
    bevel(p, 'square knot', [-.08,.04,.07,.08,.12,.2], .03, obi);
    for (const s of [-1, 1]) {
      cutShape(p, 'hanging tail', [[s*.03,.17],[s*.1,.17],[s*.2,.47],[s*.11,.49]], .03, obi, .02);
      path(p, 'stitched rows', [[s*.065,.055,.2],[s*.15,.055,.47]], .005, seam);
    }
  },
  armor_junk_plate(p) {
    // CDDA: "An extremely heavy suit of ornamental armor.  The metal shows signs of rust and
    // corrosion, and the leather straps are tattered."  Laid on its back: gorget, domed
    // breastplate with an etched ridge, pauldrons, faulds and tassets, rust and torn straps.
    const plate = steelP(0xa19d94), rust = plasticP(0x8b5536), worn = plasticP(0x5c4030);
    dome(p, 'domed breastplate', [.22,.16,.25], [0,-.04], plate, METAL, 5, 14);
    path(p, 'etched center ridge', [[0,.158,-.2],[0,.165,-.04],[0,.15,.1]], .01, brass, METAL);
    for (const s of [-1, 1]) path(p, 'gilded border', [[s*.05,.14,-.24],[s*.17,.1,-.17],[s*.21,.05,-.02],[s*.17,.06,.13]], .008, brass, METAL);
    cutShape(p, 'gorget', [...oval(0, -.3, .17, .09, 14).filter(([, z]) => z <= -.27), [.17,-.27]], .07, plate);
    cutShape(p, 'gorget collar', oval(0, -.33, .1, .05, 12), .1, plate, 0, [oval(0, -.33, .065, .03, 10)]);
    for (const s of [-1, 1]) {
      dome(p, 'pauldron', [.13,.09,.13], [s*.3,-.2], plate, METAL, 3, 10);
      dome(p, 'pauldron lame', [.12,.07,.07], [s*.32,-.06], plate, METAL, 3, 10);
      cyl(p, 'ornamental rivet', 'y', [s*.3,.095,-.2], .022, .012, 8, brass, METAL);
    }
    for (const [k, w] of [[0,.23],[1,.215],[2,.2]]) bevel(p, 'fauld lame', [-w,0,.17+k*.065,w,.075-k*.012,.235+k*.065], .015, plate, METAL);
    for (const s of [-1, 1]) cutShape(p, 'tasset', [[s*.03,.36],[s*.2,.36],[s*.18,.49],[s*.05,.49]], .045, plate);
    for (const [x, z, r] of [[-.11,-.12,.045],[.09,.03,.04],[-.04,.12,.03],[.15,-.12,.03]]) {
      const y = .16 * Math.sqrt(Math.max(0, 1 - (x / .22) ** 2 - ((z + .04) / .25) ** 2));
      blob(p, 'rust patch', [r,.008,r*.8], [x,y,z], rust, {}, 2, 7);
    }
    for (const x of [-.12,.1]) top(p, 'rust streak', [x-.03,.18,x+.03,.25], .066, rust);
    path(p, 'tattered side strap', [[-.21,.04,-.02],[-.32,.025,.05],[-.37,.015,.15],[-.34,.01,.19]], .016, worn);
    path(p, 'tattered side strap', [[.21,.04,-.06],[.33,.025,-.01],[.39,.015,-.03]], .016, worn);
    path(p, 'torn strap end', [[.1,.05,.37],[.07,.03,.45],[.03,.015,.5]], .014, worn);
  },
  art_snake(p, d) {
    // "winding, flexible rod" (artifact): a sinuous rod, thick at the middle.
    const paint = steelP(d.color);
    const n = 16, pts = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n, x = -.48 + t * .96;
      pts.push([x, .045, .1 * Math.sin(t * Math.PI * 3)]);
    }
    for (let k = 0; k < n; k++) {
      const t = k / n, r = .022 + .022 * Math.sin(Math.PI * (t + .5 / n));
      tube(p, `winding rod ${k}`, V(...pts[k]), V(...pts[k + 1]), r, r, 8, paint, METAL);
    }
    blob(p, 'rounded tip', [.026,.026,.026], pts[n], paint, METAL, 3, 8);
    blob(p, 'rounded tip', [.026,.026,.026], pts[0], paint, METAL, 3, 8);
  },
  camelbak(p, d) {
    // CDDA: "A slim and lightweight insulated plastic bladder ... a capped mouth for filling
    // with liquid, with a hose that allows the wearer to drink hands-free."
    const bladder = plasticP(0x4f6e86), edge = plasticP(0x3b5468), hose = plasticP(0x2f3134);
    cutShape(p, 'flat hydration bladder', [[-.17,-.36],[.17,-.36],[.2,-.32],[.2,.26],[.16,.3],[-.16,.3],[-.2,.26],[-.2,-.32]], .045, edge);
    bevel(p, 'filled bladder', [-.17,.02,-.31,.17,.08,.25], .03, bladder);
    cyl(p, 'wide fill cap', 'y', [0,.09,-.24], .07, .04, 12, hose);
    bevel(p, 'hanging slot', [-.08,.044,-.355,.08,.05,-.33], .005, hose);
    path(p, 'drinking hose', [[.1,.05,.3],[.14,.03,.38],[.28,.025,.42],[.36,.025,.3],[.34,.025,.05],[.3,.025,-.15],[.34,.025,-.32]], .018, hose);
    cyl(p, 'bite valve', 'z', [.34,.03,-.36], .025, .06, 8, plasticP(0x2f6b8f));
  },
  golf_bag(p, d) {
    // CDDA: "A tall canvas and plastic bag with fold-out legs ... straps to be worn on the back
    // and a slot for an umbrella."  Stands upright on its base, legs folded out.
    const canvas = clothP(d.color), trim = plasticP(0x2e2f31), panel = clothP(shade(d.color, .78));
    profile(p, 'canvas bag tube', [[0,0],[.13,0],[.14,.04],[.14,.82],[.15,.84],[.15,.87],[.12,.87],[.12,.84],[0,.84]], canvas, { sides: 12, scale: [1,.85] });
    ring(p, 'molded top cuff', .1, .155, .87, trim, [0,0], 12);
    bevel(p, 'top divider', [-.12,.82,-.008,.12,.87,.008], .003, trim);
    bevel(p, 'long apparel pocket', [-.07,.12,.1,.07,.7,.16], .025, panel);
    bevel(p, 'ball pocket', [-.09,.18,-.17,.09,.38,-.11], .025, panel);
    cyl(p, 'umbrella slot', 'y', [.11,.6,.1], .025, .3, 8, trim);
    for (const [x, z, h, head] of [[-.05,-.04,1,'driver'],[.04,-.05,.95,'iron'],[-.03,.05,.93,'iron'],[.05,.04,.97,'putter']]) {
      cyl(p, 'club shaft', 'y', [x,.86+(h-.86)/2,z], .009, h-.86+.04, 6, steel, METAL);
      cyl(p, 'club grip cover', 'y', [x,h,z], .03, .05, 8, head === 'driver' ? plasticP(0x7b2e2e) : trim);
    }
    for (const s of [-1, 1]) path(p, 'fold-out stand leg', [[s*.07,.55,-.12],[s*.13,.3,-.25],[s*.18,.0,-.37]], .012, steel, METAL);
    path(p, 'backpack strap', [[-.12,.68,.08],[-.17,.55,.15],[-.16,.32,.12],[-.12,.25,.08]], .02, trim);
    path(p, 'backpack strap', [[.12,.68,.08],[.17,.55,.15],[.16,.32,.12],[.12,.25,.08]], .02, trim);
    ring(p, 'base bumper', .0, .14, .002, trim, [0,0], 12);
  },
  veil_wedding(p) {
    // CDDA: "A lacy white wedding veil."  Sheer tulle gathered on a comb, scalloped lace edge.
    const tulle = clothP(0xf3efe6), lace = clothP(0xfbf9f3), pearl = plasticP(0xf4f0e8);
    const outline = [[-.1,-.42],[.1,-.42],[.24,-.2],[.36,.1],[.42,.38],[.28,.44],[.12,.4],[0,.45],[-.12,.4],[-.28,.44],[-.42,.38],[-.36,.1],[-.24,-.2]];
    cutShape(p, 'sheer tulle veil', outline, .012, tulle);
    for (const z of [-.05,.12,.28]) {
      const w = .2 + z * .45;
      path(p, 'gathered tulle fold', [[-w,.015,z],[-w*.35,.025,z+.02],[w*.35,.025,z+.02],[w,.015,z]], .01, tulle);
    }
    const edge = [[.42,.38],[.28,.44],[.12,.4],[0,.45],[-.12,.4],[-.28,.44],[-.42,.38]];
    path(p, 'scalloped lace border', edge.map(([x, z]) => [x, .018, z]), .016, lace);
    for (const s of [-1, 1]) path(p, 'lace side border', [[s*.1,.018,-.4],[s*.24,.018,-.2],[s*.36,.018,.1],[s*.42,.018,.38]], .012, lace);
    for (const [x, z] of [[-.2,.33],[0,.36],[.2,.33],[-.3,.2],[.3,.2]]) blob(p, 'lace flower', [.03,.006,.03], [x,.02,z], lace, {}, 2, 8);
    bevel(p, 'veil comb', [-.13,.0,-.47,.13,.04,-.4], .01, steelP(0xc8c5bd), METAL);
    for (const x of [-.1,-.05,0,.05,.1]) blob(p, 'pearl', [.02,.02,.02], [x,.05,-.435], pearl, {}, 3, 8);
  },
  tallit_gadol(p) {
    // CDDA: "A large prayer shawl worn by observant Jews."  Folded white wool with dark
    // stripes near both ends, an embroidered neckband and fringes on the four corners.
    const wool = clothP(0xeeeadc), stripe = clothP(0x26375a), atarah = clothP(0xc9c2a7);
    bevel(p, 'folded prayer shawl', [-.42,0,-.3,.42,.07,.3], .02, wool);
    for (const s of [-1, 1]) for (const [x0, w] of [[.25,.025],[.31,.05],[.385,.02]]) {
      const a = s * x0, b = s * (x0 + w);
      top(p, 'woven stripe', [Math.min(a, b), -.3, Math.max(a, b), .3], .071, stripe);
    }
    bevel(p, 'embroidered neckband', [-.17,.06,-.31,.17,.09,-.22], .01, atarah);
    for (let k = 0; k < 5; k++) path(p, 'neckband embroidery', [[-.15+k*.075,.092,-.29],[-.115+k*.075,.092,-.24]], .006, steelP(0xb9b5a8), METAL);
    for (const x of [-.4,.4]) for (const z of [-.28,.28]) {
      const sx = Math.sign(x), sz = Math.sign(z);
      for (const k of [-1, 0, 1])
        path(p, 'knotted tzitzit fringe', [[x,.05,z],[x+sx*.04,.03,z+sz*.03+k*.015],[x+sx*.09,.015,z+sz*.05+k*.025]], .006, wool);
      blob(p, 'fringe knot', [.012,.012,.012], [x+sx*.04,.03,z+sz*.03], wool, {}, 2, 6);
    }
  },
  nun_habit(p) {
    // CDDA: "A dark piece of clerical clothing.  Typically worn by Christian nuns."
    // Laid out flat: full-length habit with bell sleeves, black veil over a white coif,
    // white collar, cord belt and a wooden rosary.
    const habit = clothP(0x2b282e), veil = clothP(0x1c1a1f), white = clothP(0xeeeae0), wood = plasticP(0x6b4a32);
    cutShape(p, 'full-length habit', [[-.14,-.3],[.14,-.3],[.17,-.2],[.19,.1],[.26,.47],[-.26,.47],[-.19,.1],[-.17,-.2]], .04, habit);
    for (const s of [-1, 1]) cutShape(p, 'bell sleeve', [[s*.15,-.29],[s*.38,-.1],[s*.43,.04],[s*.3,.08],[s*.17,-.06]], .035, habit, .005);
    cutShape(p, 'black veil', [[-.13,-.49],[.13,-.49],[.18,-.37],[.17,-.2],[-.17,-.2],[-.18,-.37]], .02, veil, .04);
    cutShape(p, 'white coif band', [[-.12,-.48],[.12,-.48],[.13,-.43],[-.13,-.43]], .012, white, .06);
    cutShape(p, 'white collar', [[-.13,-.31],[.13,-.31],[.16,-.23],[0,-.17],[-.16,-.23]], .012, white, .06);
    path(p, 'cord belt', [[-.19,.05,.08],[0,.052,.09],[.19,.05,.08]], .01, clothP(0x1a1a1c));
    path(p, 'belt cord end', [[.06,.052,.09],[.08,.05,.2],[.07,.048,.3]], .008, clothP(0x1a1a1c));
    for (let k = 0; k <= 10; k++) blob(p, 'rosary bead', [.009,.009,.009], [-.1+k*.012,.05,.09+Math.sin(k/10*Math.PI)*.12], wood, {}, 2, 6);
    bevel(p, 'rosary cross', [-.042,.045,.21,-.032,.056,.27], .002, wood);
    bevel(p, 'rosary cross', [-.055,.045,.225,-.019,.056,.235], .002, wood);
  },
  binder_top(p) {
    // CDDA: "A binder, meant to bind the chest close to the body to keep a person's chest flat."
    // Short compression tank top: racer straps, double front panel, side hook-and-eye closure.
    const fabric = clothP(0xc7a98c), panel = clothP(0xb3957a), edge = clothP(0x9a7f68);
    cutShape(p, 'compression tank top', [[-.26,.3],[.26,.3],[.25,-.04],[.19,-.17],[.16,-.3],[.17,-.43],[.07,-.43],[.06,-.27],[0,-.22],[-.06,-.27],[-.07,-.43],[-.17,-.43],[-.16,-.3],[-.19,-.17],[-.25,-.04]], .05, fabric);
    cutShape(p, 'double-layer front panel', [[-.2,-.05],[-.08,-.14],[0,-.1],[.08,-.14],[.2,-.05],[.21,.2],[-.21,.2]], .012, panel, .05);
    path(p, 'neckline binding', [[-.07,.056,-.42],[-.06,.058,-.27],[0,.06,-.22],[.06,.058,-.27],[.07,.056,-.42]], .008, edge);
    for (const s of [-1, 1]) path(p, 'armhole binding', [[s*.17,.056,-.43],[s*.16,.056,-.3],[s*.19,.056,-.17],[s*.25,.056,-.04]], .008, edge);
    path(p, 'hem binding', [[-.26,.055,.29],[.26,.055,.29]], .008, edge);
    for (let k = 0; k < 6; k++) cyl(p, 'hook-and-eye', 'y', [.235,.058,-.02+k*.05], .008, .006, 6, steelP(0xc3c4c0), METAL);
  },
  candlestick(p) {
    // CDDA: "A brass candlestick with a gold finish." Round foot, baluster stem, drip pan, socket.
    profile(p, 'brass candlestick', [
      [0,0],[.24,0],[.25,.02],[.2,.05],[.1,.08],[.06,.1],[.055,.18],[.08,.22],[.055,.26],[.04,.5],
      [.07,.56],[.04,.62],[.035,.8],[.18,.84],[.19,.86],[.06,.87],[.06,.97],[.045,.97],[.045,.9],[0,.9],
    ], brass, { sides: 14, metal: true });
  },
  cow_bell(p) {
    // CDDA: "A cow bell." Flared sheet-metal bell on a leather collar strap, clapper inside.
    const iron = steelP(0x6e655b), rim = steelP(0xb59559), strap = plasticP(0x6e4a30);
    const q = (w, d, y) => [V(-w,y,-d),V(w,y,-d),V(w,y,d),V(-w,y,d)];
    hull(p, 'flared bell body', [...q(.16,.11,0), ...q(.11,.07,.62)], iron, METAL);
    hull(p, 'bell crown', [...q(.11,.07,.62), ...q(.08,.05,.68)], iron, METAL);
    for (const y of [.005]) bevel(p, 'brass mouth rim', [-.165,y,-.115,.165,y+.04,.115], .006, rim, METAL);
    blob(p, 'iron clapper', [.05,.05,.05], [0,.08,0], steelP(0x46413c), METAL, 3, 8);
    path(p, 'clapper wire', [[0,.13,0],[0,.6,0]], .01, steelP(0x46413c), METAL);
    path(p, 'hanging loop', [[-.05,.68,0],[-.05,.78,0],[.05,.78,0],[.05,.68,0]], .018, iron, METAL);
    path(p, 'leather collar strap', [[-.42,.6,-.02],[-.22,.86,-.02],[0,.82,-.02],[.22,.86,-.02],[.42,.6,-.02]], .03, strap);
  },
  saxophone(p) {
    // CDDA: "A brass alto saxophone with a neck strap."  Lying on its side: neck and mouthpiece,
    // straight body, U bow and an upturned flared bell.
    const r = .085, y = (rad) => rad;
    const seg = (name, a, b, r0, r1) => tube(p, name, V(a[0], y(Math.max(r0, r1)), a[1]), V(b[0], y(Math.max(r0, r1)), b[1]), r0, r1, 10, brass, METAL);
    seg('mouthpiece', [-.44,-.36], [-.36,-.39], .018, .022);
    seg('neck', [-.36,-.39], [-.22,-.4], .024, .028);
    seg('neck bend', [-.22,-.4], [-.14,-.34], .03, .036);
    seg('body tube', [-.14,-.34], [-.1,.22], .04, .065);
    seg('U bow', [-.1,.22], [-.04,.34], .065, .07);
    seg('U bow', [-.04,.34], [.07,.36], .07, .075);
    seg('U bow', [.07,.36], [.14,.27], .075, .08);
    seg('bell tube', [.14,.27], [.16,.0], .08, .09);
    tube(p, 'flared bell', V(.16,.1,0), V(.17,.11,-.12), .09, .15, 14, brass, METAL);
    ring(p, 'bell rim', .13, .155, .11, brass, [.17,-.12], 14);
    tube(p, 'mouthpiece tip', V(-.47,.02,-.35), V(-.44,.02,-.36), .012, .018, 8, plasticP(0x1f1f22));
    for (let k = 0; k < 8; k++) {
      const t = k / 7, x = -.135 + t * .035, z = -.28 + t * .45, rr = .04 + t * .025;
      cyl(p, 'pearl key', 'y', [x+.02,2*rr+.005,z], .022, .012, 10, plasticP(0xece6d6));
    }
    path(p, 'key rods', [[-.08,.12,-.3],[-.04,.16,.18]], .006, brass, METAL);
    path(p, 'neck strap', [[-.2,.06,-.42],[-.26,.01,-.48],[-.12,.01,-.5],[0,.01,-.46],[.02,.01,-.38]], .015, plasticP(0x2c2c2f));
  },
  bearing(p) {
    // CDDA: "A steel ball bearing, useful as ammunition for a slingshot."  A handful of balls.
    const ball = steelP(0xc9cdd1);
    for (const [x, z, y] of [[0,0,0],[-.24,-.05,0],[.22,.06,0],[-.08,.24,0],[.12,-.24,0],[-.18,-.3,0],[.3,-.12,0],[.06,.02,.2],[-.12,.1,.18]])
      blob(p, 'steel ball', [.11,.11,.11], [x,.11+y,z], ball, METAL, 4, 10);
  },
  gaiter_boot_heavy: gaiters,
  jackhammer,
  elec_jackhammer: jackhammer,
  corset,
  corset_waist: corset,
  hammock(p) {
    // CDDA: "A large sheet of cloth with ropes on two sides."  Rolled canvas, both rope ends
    // gathered into a ring.
    const canvas = clothP(0xddd3bd), rope = clothP(0xb19a71), ringP = steelP(0x9a9a96);
    cyl(p, 'rolled canvas', 'z', [0,.08,0], .08, .56, 12, canvas);
    for (const [z, c] of [[-.18,0x7a5d8e],[-.06,0x4f7d8c],[.06,0xb5704b],[.18,0x7a5d8e]]) cyl(p, 'woven stripe', 'z', [0,.08,z], .082, .04, 12, clothP(c));
    for (const s of [-1, 1]) {
      for (const k of [-2, -1, 0, 1, 2]) path(p, 'suspension rope', [[k*.03,.08+k*.012,s*.28],[k*.02,.06,s*.36],[0,.04,s*.43]], .006, rope);
      cyl(p, 'rope whipping', 'z', [0,.04,s*.43], .015, .03, 8, rope);
      ring(p, 'hanging ring', .025, .045, .02, ringP, [0,s*.47], 10);
    }
  },
};
