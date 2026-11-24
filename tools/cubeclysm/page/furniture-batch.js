// Furniture silhouettes and state variants for the 7136388 catalog. Measurements are in
// metres from the tile centre, with the front on −Z. CDDA max_volume is storage capacity;
// it informs the footprint of containers, while seats and fixtures use real-world dimensions.
import { border, cracks, flat, glass, grid, layers, masonry, sides, speckle } from './props.js';
import { fill, shade } from './paint.js';
import * as K from './item-kit.js';
import { poly } from './lowpoly.js';

const wood = K.woodP(0x926743);
const darkWood = K.woodP(0x573725);
const steel = K.steelP(0x9da8af);
const iron = K.steelP(0x424b52);
const black = flat(0x222931);
const chrome = K.steelP(0xbcc8cd);
const brass = flat(0xb89548);
const cream = K.plasticP(0xe1e3d7);
const upholstery = K.clothP(0x395b6e);
const concrete = K.stoneP(0x93958d);
const straw = K.knitP(0xbca353);
const pane = glass(0xbbdde1);
const front = (painter) => sides(['front'], painter);
const top = (painter) => sides(['top'], painter);

function legs(p, w, d, h, paint, t = .045) {
  for (const x of [-w / 2 + t, w / 2 - t]) {
    for (const z of [-d / 2 + t, d / 2 - t]) {
      p.box(`leg-${x}-${z}`, [x - t / 2, 0, z - t / 2, x + t / 2, h, z + t / 2], paint);
    }
  }
}

function box(p, name, [w, h, d], paint, [x, y, z] = [0, 0, 0], opts) {
  p.box(name, [x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2], paint, opts);
}

function cyl(p, name, axis, at, radius, length, paint, tip, n = 8) {
  K.cyl(p, name, axis, at, radius, length, n, paint, {}, tip);
}

// An open, faceted tube. A thin annulus caps each end without blocking the bore.
function hollowTube(p, name, axis, center, outer, inner, length, paint, n = 8) {
  const [x, y, z] = center;
  const point = (i, r, t) => {
    const angle = (i + .5) * 2 * Math.PI / n;
    const u = Math.cos(angle) * r, v = Math.sin(angle) * r;
    return axis === 'y' ? K.V(x + u, y + t, z + v) : K.V(x + u, y + v, z + t);
  };
  for (let i = 0; i < n; i++) {
    const j = i + 1, lo = -length / 2, hi = length / 2;
    for (const [face, a, b, c, d] of [
      ['outer', [i, outer, lo], [j, outer, lo], [j, outer, hi], [i, outer, hi]],
      ['inner', [i, inner, lo], [j, inner, lo], [j, inner, hi], [i, inner, hi]],
      ['near-rim', [i, outer, lo], [j, outer, lo], [j, inner, lo], [i, inner, lo]],
      ['far-rim', [i, outer, hi], [j, outer, hi], [j, inner, hi], [i, inner, hi]],
    ]) {
      const corners = [point(...a), point(...b), point(...c), point(...d)];
      const axial = axis === 'y' ? K.V(0, 1, 0) : K.V(0, 0, 1);
      const radial = corners[0].clone().add(corners[1]).multiplyScalar(.5).sub(K.V(x, y, z));
      radial.addScaledVector(axial, -radial.dot(axial));
      const normal = face === 'outer' ? radial : face === 'inner' ? radial.negate()
        : face === 'near-rim' ? axial.negate() : axial;
      poly(p, `${name}-${face}-${i}`, corners, normal.normalize(), face === 'inner' ? iron : paint);
    }
  }
}

function label(text, foreground, background) {
  return (ctx, x, y, w, h) => {
    fill(ctx, x, y, w, h, background);
    if (w < 5 || h < 4) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 1, y, w - 2, h);
    ctx.clip();
    ctx.fillStyle = `#${foreground.toString(16).padStart(6, '0')}`;
    ctx.font = `bold ${Math.max(4, Math.floor(h * .66))}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2, w - 2);
    ctx.restore();
  };
}

function hoop(p, name, points, radius, paint) {
  for (let i = 1; i < points.length; i++) {
    K.tube(p, `${name}-${i}`, K.V(...points[i - 1]), K.V(...points[i]), radius, radius, 5, paint);
  }
}

function dish(p, name, r, depth, paint, parent) {
  const count = 12;
  const point = (i, radius, y) => K.V(Math.cos(i * 2 * Math.PI / count) * radius, y, Math.sin(i * 2 * Math.PI / count) * radius);
  for (let i = 0; i < count; i++) {
    K.pane(p, `${name}-outer-facet`, [point(i, r, depth), point(i + 1, r, depth),
      point(i + 1, r * .51, depth * .22), point(i, r * .51, depth * .22)], .015, paint, { parent });
    K.pane(p, `${name}-inner-facet`, [point(i, r * .51, depth * .22), point(i + 1, r * .51, depth * .22),
      point(i + 1, .048, 0), point(i, .048, 0)], .014, paint, { parent });
  }
  K.cyl(p, `${name}-hub`, 'y', [0, 0, 0], .054, .031, 8, chrome, { parent });
}

function tray(p, name, [w, h, d], paint, [x, y, z] = [0, 0, 0], t = .035) {
  box(p, `${name}-base`, [w, t, d], paint, [x, y, z]);
  for (const side of [-1, 1]) {
    box(p, `${name}-end-${side}`, [w, h - t, t], paint, [x, y + t, z + side * (d - t) / 2]);
    box(p, `${name}-side-${side}`, [t, h - t, d - 2 * t], paint, [x + side * (w - t) / 2, y + t, z]);
  }
}

function casework(p, w, h, d, paint, levels, trim = paint) {
  box(p, 'back', [w, h, .04], paint, [0, 0, d / 2 - .02]);
  for (const x of [-(w - .06) / 2, (w - .06) / 2]) box(p, `side-${x}`, [.06, h, d - .04], trim, [x, 0, -.02]);
  for (const [i, y] of levels.entries()) box(p, `shelf-${i}`, [w - .12, .04, d - .04], paint, [0, y, -.02]);
}

function hinged(p, name, w, h, y, z, paint, angle = 0, glazing = false) {
  const pivot = p.group(name, { at: [-w / 2, y, z], rotY: angle });
  const opts = { parent: pivot, glass: glazing };
  if (glazing) {
    for (const x of [.019, w - .019]) box(p, 'door-stile', [.038, h, .044], chrome, [x, 0, 0], { parent: pivot });
    for (const y of [0, h - .033]) box(p, 'door-rail', [w - .076, .033, .043], chrome, [w / 2, y, 0], { parent: pivot });
    box(p, 'glass', [w - .076, h - .066, .017], paint, [w / 2, .033, 0], opts);
  } else box(p, 'door', [w, h, .035], paint, [w / 2, 0, 0], opts);
  box(p, 'pull', [.037, .13, .04], chrome, [w - .09, h * .49, -.035], { parent: pivot });
}

function panel(p, name, w, h, y, z, color = 0x759b84) {
  const display = layers(flat(color), border(0x20282e, 2), grid(shade(color, .8), 3, 5));
  box(p, name, [w, h, .025], display, [0, y, z]);
}

function chair(p, id) {
  if (id === 'logstool') {
    cyl(p, 'trunk', 'y', [0, .21, 0], .19, .42, sides(['end1'], K.woodP(0xc29a64), K.barkP(0x69503a)), .17);
    return;
  }
  if (id === 'beanbag') {
    K.lump(p, 'beanbag', [.37, .22, .35], K.clothP(0x973e4f), id);
    return;
  }
  if (id === 'barstool' || id === 'barber_chair') {
    const barber = id === 'barber_chair';
    const y = barber ? .55 : .72;
    cyl(p, 'plinth', 'y', [0, .03, 0], barber ? .26 : .21, .06, chrome);
    cyl(p, 'pedestal', 'y', [0, y / 2, 0], .055, y, steel);
    box(p, 'footrest-brace', [.078, .047, barber ? .21 : .135], steel, [0, .19, barber ? -.105 : -.065]);
    cyl(p, 'foot-rest', 'x', [0, .212, -.13], .026, .35, chrome);
    if (barber) {
      cyl(p, 'hydraulic-collar', 'y', [0, .30, 0], .083, .085, iron);
      box(p, 'hydraulic-pedal', [.09, .034, .155], chrome, [.105, .132, .09]);
      box(p, 'pedal-link', [.12, .026, .038], iron, [.078, .135, .047]);
    }
    if (barber) {
      box(p, 'seat', [.49, .1, .48], upholstery, [0, y, 0]);
      box(p, 'backrest', [.46, .48, .11], upholstery, [0, y + .06, .2]);
      box(p, 'footplate', [.31, .055, .13], iron, [0, .2, -.22]);
      for (const x of [-.26, .26]) box(p, `arm-${x}`, [.075, .12, .36], iron, [x, y + .16, -.01]);
    } else cyl(p, 'leather-seat', 'y', [0, y + .04, 0], .205, .08, K.clothP(0x4d352e));
    return;
  }

  const bench = id.startsWith('bench');
  const deck = id === 'deckchair';
  const airline = id === 'seat_airplane';
  const folding = id === 'chair_folding' || deck;
  const w = bench ? .98 : airline ? .55 : deck ? .57 : .45;
  const d = deck ? .93 : .45;
  const y = deck ? .31 : .43;
  const frame = id === 'chair_black' ? K.woodP(0x353638) : id === 'chair_white' ? K.woodP(0xe4e2d7)
    : ['bench_park', 'chair_folding', 'chair_plywood', 'seat_airplane'].includes(id) ? iron : wood;
  const seat = deck ? K.clothP(0x507b68) : airline ? upholstery : id === 'chair_folding' ? K.plasticP(0x26282a)
    : id === 'chair_plywood' ? K.woodP(0xc79c67) : id === 'bench_park' ? wood : frame;
  if (folding) {
    for (const x of [-w / 2, w / 2]) {
      for (const s of [-1, 1]) K.tube(p, `folding-leg-${x}-${s}`, K.V(x, .025, s * d * .34), K.V(x, y, -s * d * .37), .024, .024, 4, frame);
    }
  } else if (id === 'bench_wooden') {
    for (const x of [-.36, .36]) box(p, `trestle-${x}`, [.12, y, .35], wood, [x, 0, 0]);
  } else legs(p, w, d, y, frame);
  if (id === 'bench_park') {
    for (const z of [-.171, -.057, .057, .171]) box(p, 'seat-slat', [w, .045, .106], seat, [0, y, z]);
    box(p, 'slat-frame', [w - .10, .038, d - .045], iron, [0, y - .038, 0]);
  } else box(p, 'seat', [w, airline ? .095 : .045, d], seat, [0, y, 0]);

  if (id === 'bench_wooden') return;
  for (const x of [-w / 2 + .035, w / 2 - .035]) box(p, `upright-${x}`, [.035, .4, .05], frame, [x, y, d / 2 - .03]);
  if (deck) {
    const back = p.group('reclined-back', { at: [0, y, .05], rotX: .61 });
    box(p, 'canvas-sling', [w - .06, .52, .022], seat, [0, 0, 0], { parent: back });
    for (const x of [-w / 2 + .012, w / 2 - .012]) box(p, `sling-rail-${x}`, [.038, .56, .05], wood, [x, 0, 0], { parent: back });
  } else if (airline) {
    box(p, 'upholstered-back', [w, .56, .10], seat, [0, y, .19]);
    for (const x of [-.243, .243]) cyl(p, 'seat-fold-hinge', 'x', [x, y + .06, .143], .039, .09, iron);
    box(p, 'lap-belt', [.45, .012, .045], black, [0, y + .095, -.03]);
    box(p, 'buckle', [.08, .025, .055], steel, [0, y + .107, -.03]);
    for (const x of [-.27, .27]) box(p, `armrest-${x}`, [.055, .05, .36], iron, [x, y + .18, 0]);
  } else if (id === 'chair_plywood' || id === 'chair_folding') {
    box(p, 'back-panel', [w, .23, .035], seat, [0, y + .17, d / 2]);
  } else {
    for (const z of [.19, .31]) box(p, `back-slat-${z}`, [w, .075, .037], seat, [0, y + z, d / 2]);
  }
}

function bed(p, id) {
  if (id.startsWith('hammock')) {
    const net = id.endsWith('net');
    const paint = net ? K.knitP(0xe4d8b4) : K.clothP(0xb89968);
    for (const s of [-1, 1]) {
      box(p, `post-${s}`, [.075, 1.1, .075], wood, [0, 0, s * .464]);
      for (const x of [-.19, 0, .19]) {
        K.tube(p, `cord-${s}-${x}`, K.V(0, 1.065, s * .43), K.V(x, .73, s * .32), .011, .011, 4, paint);
      }
      const sling = p.group(`sling-${s}`, { at: [0, .58, 0], rotX: -s * .44 });
      if (!net) box(p, 'fabric', [.39, .028, .35], paint, [0, 0, s * .16], { parent: sling });
      else {
        for (const x of [-.19, -.095, 0, .095, .19]) box(p, `warp-${x}`, [.013, .02, .35], paint, [x, 0, s * .16], { parent: sling });
        for (const z of [.06, .14, .22, .31]) box(p, `weft-${z}`, [.39, .016, .013], paint, [0, .014, s * z], { parent: sling });
      }
    }
    return;
  }
  if (id === 'straw_bed') {
    K.crumple(p, 'straw-bedding', .40, .47, .16, straw, id);
    for (let i = 0; i < 23; i++) {
      const g = p.group('loose-stem', { at: [(p.r() - .5) * .68, .012, (p.r() - .5) * .84], rotY: p.r() * Math.PI });
      box(p, 'dry-straw', [.08 + p.r() * .06, .017, .011], i % 2 ? straw : K.woodP(0xcaac60), [0, 0, 0], { parent: g });
    }
    return;
  }
  const bunk = id.includes('bunkbed');
  const count = id === 'triple_bunkbed' ? 3 : bunk ? 2 : 1;
  const framed = !id.endsWith('mattress');
  const down = id.includes('down');
  const w = bunk ? .78 : .87;
  const d = .99;
  const height = framed ? (bunk ? .24 : id === 'makeshift_bed' ? .25 : .35) : 0;
  const spacing = count === 3 ? .72 : 1.02;
  const frameHeight = count === 1 ? height : height + (count - 1) * spacing + .31;
  const mattress = layers(K.clothP(down ? 0xe9dcbf : id === 'makeshift_bed' ? 0x917e68 : 0xb4c1ba), grid(0x9b9b84, 5, 6));
  if (framed) legs(p, w, d, frameHeight, wood, .06);
  for (let level = 0; level < count; level++) {
    const y = height + level * spacing;
    if (framed) {
      for (const x of [-w / 2 + .025, w / 2 - .025]) box(p, `side-rail-${level}-${x}`, [.05, .10, d], wood, [x, y - .10, 0]);
      for (const z of [-.39, -.195, 0, .195, .39]) box(p, `slat-${level}-${z}`, [w - .08, .03, .09], wood, [0, y - .03, z]);
    }
    if (id !== 'bed_frame') {
      if (id === 'makeshift_bed') {
        for (let i = 0; i < 4; i++) {
          const z = -.46 + i * .23;
          K.bevel(p, 'stuffed-mattress-section', [-w / 2 + .04, y, z, w / 2 - .04, y + [.105, .135, .115, .091][i], z + .236], .028, mattress);
        }
      } else K.bevel(p, `mattress-${level}`, [-w / 2 + .03, y, -.48, w / 2 - .03, y + (down ? .17 : .115), .48], .02, mattress);
    }
  }
  if (bunk) {
    for (const x of [-.34, -.12]) box(p, `ladder-upright-${x}`, [.037, frameHeight, .045], wood, [x, 0, -.495]);
    for (let y = .2; y < frameHeight; y += .23) box(p, `ladder-rung-${y}`, [.23, .036, .045], wood, [-.23, y, -.495]);
  }
}

function table(p, id) {
  const fancy = id === 'table_fancy';
  const portable = id === 'tourist_table';
  const w = portable ? .73 : .98;
  const d = portable ? .52 : .72;
  const h = portable ? .65 : .75;
  const frame = fancy ? darkWood : iron;
  if (portable) {
    for (const x of [-.30, .30]) for (const s of [-1, 1]) {
      K.tube(p, `folding-brace-${x}-${s}`, K.V(x, .022, s * .21), K.V(x, h, -s * .18), .022, .022, 4, frame);
    }
  } else legs(p, w, d, h, frame, fancy ? .09 : .055);
  const topPaint = id === 'metal_table' ? layers(steel, top(cracks('scrap-metal', 0x596368, 7))) : fancy ? darkWood : steel;
  box(p, 'tabletop', [w, .052, d], topPaint, [0, h, 0]);
  if (fancy) box(p, 'embroidered-runner', [.28, .006, d + .016], layers(K.clothP(0x9d4350), border(0xc69953)), [0, h + .052, 0]);
  if (portable) box(p, 'fold-line', [.012, .003, d], iron, [0, h + .052, 0]);
}

function casket(p, open) {
  const widthAt = [[-.49, .237], [-.28, .33], [.13, .352], [.49, .29]];
  const outlines = [
    ...widthAt.map(([z, w]) => K.V(-w, 0, z)),
    ...widthAt.toReversed().map(([z, w]) => K.V(w, 0, z)),
  ];
  const raised = (v, y) => K.V(v.x, y, v.z);
  const solidPlate = (name, shape, thickness, paint, opts) => K.hull(p, name,
    shape.flatMap((v) => [raised(v, v.y - thickness / 2), raised(v, v.y + thickness / 2)]), paint, opts);
  solidPlate('casket-floor', outlines.map((v) => raised(v, .032)), .064, darkWood);
  for (const [i, point] of outlines.entries()) {
    const next = outlines[(i + 1) % outlines.length];
    K.pane(p, 'tapered-wood-panel', [raised(point, .025), raised(next, .025), raised(next, .43), raised(point, .43)], .038, darkWood);
  }
  const lid = open ? p.group('open-casket-lid', { at: [-.345, .431, 0], rotZ: 1.21 }) : null;
  const lidCorners = outlines.map((v) => K.V(v.x + (open ? .345 : 0), open ? .035 : .465, v.z));
  solidPlate('tapered-lid', lidCorners, .066, wood, lid ? { parent: lid } : {});
  for (const s of [-1, 1]) for (const z of [-.19, .17]) {
    box(p, 'carry-handle', [.046, .047, .152], brass, [s * (z < 0 ? .335 : .348), .224, z]);
  }
}

function crate(p, id) {
  const metal = id.startsWith('metal_') || id.startsWith('foot_locker');
  const military = id.includes('military');
  const coffin = id.startsWith('coffin');
  const pallet = id.startsWith('pallet');
  const foot = id.startsWith('foot_locker');
  const chest = id === 'chest';
  const cardboard = id.startsWith('cardboard');
  const open = id.endsWith('_o') || id.endsWith('_open');
  if (coffin) return casket(p, open);
  const w = foot ? .58 : cardboard ? .74 : chest ? .79 : .96;
  const d = foot ? .39 : cardboard ? .74 : chest ? .53 : .89;
  const h = foot ? .31 : cardboard ? .70 : military ? 1.24 : metal ? 1.02 : pallet ? .88 : chest ? .59 : .76;
  const paint = military ? K.steelP(0x58634c) : id.endsWith('aluminum') ? chrome : metal ? steel : cardboard ? K.paperP(0xae8451) : wood;
  if (pallet) {
    for (const x of [-.36, 0, .36]) box(p, `skid-${x}`, [.13, .11, d], wood, [x, 0, 0]);
    box(p, 'deck', [w, .05, d], wood, [0, .11, 0]);
    const wrap = K.plasticP(0x4e5750);
    if (open) {
      for (const x of [-.22, .22]) for (const z of [-.19, .19]) {
        box(p, 'exposed-carton', [.42, h - .20, .36], K.paperP(0xae8859), [x, .16, z]);
      }
      box(p, 'cover-back', [w - .015, h - .15, .021], wrap, [0, .16, d / 2 - .013]);
      for (const [i, x] of [-.44, .44].entries()) {
        box(p, 'cover-side', [.022, h - .15, d - .04], wrap, [x, .16, 0]);
        const z = -d / 2;
        K.pane(p, 'torn-cover-flap', [K.V(x, .78, z), K.V(x, .28, z), K.V(x * .37, .43 + .13 * i, z),
          K.V(x * .70, .56, z - .028)], .012, wrap);
      }
    } else box(p, 'watertight-cover', [w - .04, h - .16, d - .04], wrap, [0, .16, 0]);
    for (const x of [-.28, .28]) box(p, `tie-down-${x}`, [.05, h - .13, d - .015], black, [x, .16, 0]);
    return;
  }
  if (open) {
    if (id === 'metal_crate_o') {
      box(p, 'storage-base', [w, .104, d], paint);
      box(p, 'storage-back', [w, h * .78, .052], paint, [0, .1, d / 2 - .027]);
      for (const y of [.27, .57]) box(p, 'interior-shelf', [w - .105, .04, d - .12], iron, [0, y, 0]);
      for (const s of [-1, 1]) {
        const panel = p.group('side-panel-hinge', { at: [s * (w / 2 - .09), .10, d / 2 - .06], rotY: -s * .15 });
        box(p, 'swung-out-side', [.049, h * .79, d * .75], paint, [0, 0, -d * .36], { parent: panel });
      }
      const lid = p.group('metal-lid-hinge', { at: [0, h * .875, d / 2 - .03], rotX: 1.39 });
      box(p, 'raised-lid', [w, .057, d * .91], paint, [0, 0, -d * .44], { parent: lid });
    } else {
      tray(p, 'open-interior', [w, h * (military ? .52 : .9), d], paint);
      if (military) {
        for (const x of [-.26, .26]) for (const z of [-.22, .22]) {
          box(p, 'engine-mount-base', [.15, .045, .12], iron, [x, .035, z]);
          box(p, 'engine-mount-bracket', [.049, .105, .13], steel, [x, .077, z]);
          cyl(p, 'mount-bolt', 'x', [x, .147, z], .024, .080, chrome, undefined, 6);
        }
      } else {
        // The wooden lid was pried off. Leave a gap and rest its lower edge on the floor.
        const loose = p.group('detached-leaning-lid', { at: [0, .018, d / 2 + .035], rotX: -.14 });
        box(p, 'pried-off-lid', [w, .78, .035], wood, [0, 0, 0], { parent: loose });
        for (const x of [-.33, .33]) box(p, 'lid-cleat', [.067, .72, .031], darkWood, [x, .036, .031], { parent: loose });
      }
    }
  } else {
    box(p, 'container', [w, h - .06, d], paint);
    box(p, 'lid', [w + .015, .06, d + .012], paint, [0, h - .06, 0]);
  }
  if (chest) {
    box(p, 'overhanging-lid', [w + .045, .061, d + .036], darkWood, [0, h - .025, 0]);
    for (const x of [-.23, .23]) box(p, 'lid-strapping', [.06, .070, d + .045], iron, [x, h - .025, 0]);
  }
  if (military && !open) for (const x of [-.39, .39]) for (const z of [-.35, .35]) {
    cyl(p, 'lid-bolt', 'y', [x, h + .012, z], .035, .024, chrome, undefined, 6);
  }
  if (id === 'metal_crate_c' || id === 'metal_crate_r') {
    for (const x of [-.40, .40]) for (const y of [.16, .37, .60, .82, .96]) {
      cyl(p, 'face-rivet', 'z', [x, y, -d / 2 - .013], .023, .015, chrome, undefined, 6);
    }
  }
  if (!cardboard && !open) {
    if (id !== 'metal_crate_r') box(p, 'latch', [foot ? .075 : .1, .092, .028], chest ? brass : metal ? chrome : iron, [0, h - .115, -d / 2]);
    for (const x of [-w * .4, w * .4]) {
      box(p, `front-reinforcement-${x}`, [.044, h - .09, .02], metal ? iron : darkWood, [x, .04, -d / 2]);
    }
  }
  if (cardboard) {
    box(p, 'packing-tape', [.082, .006, d], flat(0xc2a572), [0, h, 0]);
    for (const z of [-d / 2, d / 2]) {
      box(p, 'double-wall-fold', [w - .034, .043, .012], layers(K.paperP(0x987147), grid(0xc49a68, 27, 2)), [0, h - .10, z]);
    }
  }
}

function safe(p, id) {
  const tall = id.startsWith('gun');
  const w = tall ? .65 : .62;
  const h = tall ? 1.62 : .68;
  const d = tall ? .51 : .60;
  const paint = K.steelP(id.endsWith('_mj') ? 0x374d48 : id.endsWith('_l') || id.endsWith('_ml') ? 0x394a5d : 0x596169);
  casework(p, w, h, d, paint, [0, h - .04, tall ? .32 : .35]);
  const open = id.endsWith('_o');
  const door = p.group('safe-door', { at: [-w / 2 + .05, .055, -d / 2 + (open ? .063 : 0)], rotY: open ? 1.32 : 0 });
  box(p, 'armored-door', [w - .10, h - .11, .074], paint, [(w - .10) / 2, 0, 0], { parent: door });
  const opts = { parent: door };
  if (id === 'gun_safe_el') {
    box(p, 'keypad', [.105, .124, .028], layers(black, grid(0xaab2ad, 3, 4)), [w * .63, h * .57, -.047], opts);
  } else {
    const x = w * .61, y = h * .62;
    const jammed = id.endsWith('_mj');
    K.cyl(p, 'numbered-dial-ring', 'z', [x, y, -.042], .059, .023, 10, chrome, opts);
    K.cyl(p, jammed ? 'damaged-combination-dial' : 'combination-dial', 'z', [x + (jammed ? .018 : 0), y, -.065],
      jammed ? .024 : .039, .033, jammed ? 6 : 10, jammed ? iron : black, opts);
    if (jammed) box(p, 'bent-dial-axis', [.031, .015, .06], chrome, [x - .01, y - .015, -.073], opts);
  }
  if (open) for (const y of [h * .21, h * .46, h * .70]) {
    K.cyl(p, 'retracted-door-bolt', 'x', [w - .09, y, 0], .024, .024, 6, chrome, opts);
  }
  box(p, 'handle', [.13, .026, .028], chrome, [w * .6, h * .46, -.057], { parent: door });
}

function cabinet(p, id) {
  const ark = id === 'torah_ark';
  const fire = id.startsWith('fireman');
  const broken = id.endsWith('_b');
  const open = id.endsWith('_o');
  const paint = ark ? darkWood : fire ? K.steelP(0xa43b37) : steel;
  const w = ark ? .7 : .62;
  const h = fire ? 1.31 : 1.72;
  const d = fire ? .33 : .47;
  casework(p, w, h, d, paint, fire ? [0, h - .04] : [0, h - .04, .43, .83, 1.23]);
  if (fire) {
    box(p, 'tool-backing', [.44, .68, .03], iron, [0, .45, .13]);
    box(p, 'long-tool', [.037, .53, .035], wood, [.12, .52, .10]);
    box(p, 'tool-head', [.19, .085, .06], steel, [.075, .99, .09]);
  }
  if (ark) {
    hinged(p, 'carved-doors', w - .1, h - .17, .08, -d / 2, layers(paint, border(0xb88e52, 2), front((ctx, x, y, sw, sh) => {
      const gold = 0xc39151;
      fill(ctx, x + sw * .474, y + sh * .34, sw * .052, sh * .35, gold);
      fill(ctx, x + sw * .33, y + sh * .68, sw * .34, Math.max(1, sh * .018), gold);
      for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
        const tip = .18 + i * .035;
        for (let k = 0; k <= 5; k++) {
          fill(ctx, x + sw * (.5 + side * tip * k / 5), y + sh * (.42 + i * .063 - k * .016), Math.max(1, sw * .061), 2, gold);
        }
      }
      for (const [dx, dy] of [[.36, .28], [.47, .25], [.56, .30], [.65, .36], [.26, .37]]) {
        fill(ctx, x + sw * dx, y + sh * dy, Math.max(1, sw * .066), Math.max(1, sh * .026), gold);
      }
    })));
    box(p, 'carved-cornice', [w + .08, .083, d + .04], darkWood, [0, h, 0]);
  } else if (!broken) {
    hinged(p, 'glass-door', w - .1, h - .12, .06, -d / 2, pane, open ? .30 : 0, true);
  } else {
    for (const x of [-.247, .247]) box(p, 'remaining-door-stile', [.031, 1.16, .033], chrome, [x, .067, -.165]);
    for (const y of [.068, 1.196]) box(p, 'remaining-door-rail', [.495, .031, .033], chrome, [0, y, -.165]);
    for (const s of [-1, 1]) {
      K.pane(p, 'jagged-tempered-glass', [K.V(s * .230, .10, -.173), K.V(s * .079, .10, -.173),
        K.V(s * .164, .244, -.173), K.V(s * .23, .47 + .16 * s, -.173)], .012, pane, K.GLASS);
    }
  }
}

function display(p, id) {
  box(p, 'wood-cabinet', [.97, .69, .63], layers(darkWood, front(grid(0x33271e, 2, 2))));
  tray(p, 'velvet-bed', [.95, .115, .61], K.clothP(0x71323f), [0, .69, 0], .025);
  const unlocked = id.endsWith('_o');
  for (const x of [-.466, .466]) {
    if (unlocked) box(p, 'side-glass', [.019, .19, .60], pane, [x, .8, 0], K.GLASS);
    else K.pane(p, 'side-glass-remnant', [K.V(x, .8, -.29), K.V(x, .8, .26), K.V(x, .93, .26), K.V(x, .85, .057)], .012, pane, K.GLASS);
  }
  box(p, 'back-glass', [.91, unlocked ? .19 : .12, .017], pane, [0, .8, .295], K.GLASS);
  if (unlocked) {
    const lid = p.group('glass-lid-hinge', { at: [0, .99, .3], rotX: .95 });
    box(p, 'open-glass-lid', [.94, .016, .58], pane, [0, 0, -.28], { parent: lid, glass: true });
  } else {
    K.pane(p, 'glass-shard', [K.V(-.42, .807, -.295), K.V(-.14, .807, -.295), K.V(-.42, .976, -.295)], .012, pane, K.GLASS);
  }
}

function rack(p, id) {
  if (id === 'clothing_rail') {
    for (const x of [-.43, .43]) {
      box(p, `caster-base-${x}`, [.06, .075, .52], steel, [x, .065, 0]);
      for (const z of [-.22, .22]) cyl(p, `wheel-${x}-${z}`, 'x', [x, .042, z], .042, .04, black);
      box(p, `upright-${x}`, [.038, 1.5, .038], chrome, [x, .14, 0]);
    }
    box(p, 'hanging-rail', [.90, .036, .036], chrome, [0, 1.64, 0]);
    return;
  }
  const locked = id === 'rack_l';
  const paint = locked ? steel : wood;
  casework(p, .94, 1.58, .52, paint, locked ? [.01] : [.01, .43, .85, 1.27], locked ? iron : darkWood);
  for (const y of [.43, .85, 1.27]) {
    if (locked) {
      const incline = p.group('inclined-shelf', { at: [0, y, 0], rotX: -.22 });
      box(p, 'sloped-display-tray', [.82, .036, .494], steel, [0, 0, 0], { parent: incline });
      box(p, 'retainer', [.84, .068, .022], iron, [0, .005, -.237], { parent: incline });
      box(p, 'fastener-lock', [.049, .055, .025], brass, [.35, .04, -.256], { parent: incline });
    } else {
      box(p, 'shelf-edge', [.87, .065, .037], paint, [0, y, -.265]);
      for (const x of [-.44, .44]) box(p, 'binding-cord', [.075, .045, .04], straw, [x, y, -.264]);
    }
  }
}

function tank(p, id) {
  const water = id.startsWith('water_heater');
  const huge = id === 'standing_tank' || id === 'storage_tank';
  const rubber = id === '432gal_drum_rubber';
  const broken = id.endsWith('_smashed');
  const fuel = id.startsWith('diesel_') || id.startsWith('gas_');
  const color = id.startsWith('diesel') ? 0x6c7250 : 0xaa5541;
  const paint = broken ? K.steelP(id.startsWith('diesel') ? 0x79765a : 0x8a5f51) : rubber ? K.clothP(0x323635) : fuel ? K.steelP(color) : water ? cream : id === 'wood_keg' ? wood : steel;
  if (fuel) {
    const r = broken ? .26 : .34;
    for (const z of [-.28, .25]) box(p, `saddle-${z}`, [.51, .156, .16], iron, [0, 0, z]);
    const cy = r + .08;
    if (broken) {
      // A missing sector exposes the dark interior, with a jagged edge along the tear.
      const ring = (i, z, radius) => {
        const a = i * Math.PI * 2 / 11;
        return K.V(Math.cos(a) * radius, cy + Math.sin(a) * radius, z);
      };
      for (let i = 0; i < 11; i++) {
        if (i !== 1 && i !== 2 && i !== 3) {
          K.pane(p, 'dented-shell-panel', [ring(i, -.43, r), ring(i + 1, -.43, r),
            ring(i + 1, .44, r * .91), ring(i, .44, r * .91)], .018, paint);
        }
      }
      cyl(p, 'crushed-endcap', 'z', [0, cy - .01, .431], r * .9, .027, paint);
      cyl(p, 'dark-endcap', 'z', [0, cy - .027, -.43], r * .84, .028, iron);
      for (const i of [1, 4]) {
        const a = ring(i, -.41, r), b = ring(i, .23, r), c = ring(i + (i === 1 ? .49 : -.52), -.14, r + .085);
        K.pane(p, 'peeled-metal-edge', [a, b, c], .018, K.steelP(0x8d7461));
      }
      const scrap = p.group('detached-fragment', { at: [.314, .015, -.225], rotY: .36, rotZ: .18 });
      box(p, 'torn-fragment', [.22, .028, .29], paint, [0, 0, 0], { parent: scrap });
    } else {
      cyl(p, 'tank', 'z', [0, cy, 0], r, .89, paint, r, 10);
      box(p, 'inspection-cap', [.16, .066, .18], chrome, [0, cy + r * .93, -.16]);
    }
    return;
  }
  const h = id === 'storage_tank' ? 1.94 : huge ? 1.76 : id === 'water_heater_family' ? 1.51 : water ? 1.23 : rubber ? .68 : .75;
  const r = id === 'storage_tank' ? .485 : huge || rubber ? .455 : water ? .285 : .27;
  cyl(p, 'tank-shell', 'y', [0, h / 2, 0], r, h, paint, rubber ? r * .86 : r, 10);
  for (const y of [h * .22, h * .78]) cyl(p, `reinforcing-band-${y}`, 'y', [0, y, 0], r + .015, .041, rubber ? black : iron, undefined, 10);
  cyl(p, 'valve', 'y', [.12, h + .03, 0], .037, .06, brass);
  if (water) {
    box(p, 'burner-access', [.21, .17, .036], steel, [0, .16, -r]);
    for (const x of [-.125, .125]) box(p, `outlet-${x}`, [.038, .13, .038], x < 0 ? K.steelP(0xb87845) : chrome, [x, h, 0]);
  }
  if (rubber) {
    box(p, 'flammable-stencil', [.56, .009, .19], label('FLAMMABLE', 0xe8c746, 0x343533), [0, h, -.095], { ppm: 112 });
    for (const x of [-.28, .28]) {
      box(p, 'D-ring-tab', [.111, .025, .084], black, [x, h - .009, .11]);
      hoop(p, 'D-ring', [[x - .036, h + .026, .11], [x + .036, h + .026, .11], [x + .031, h + .068, .11],
        [x, h + .084, .11], [x - .031, h + .068, .11], [x - .036, h + .026, .11]], .008, chrome);
    }
  }
}

function fridge(p, id) {
  const chest = id.startsWith('chest') || id === 'freezer' || id === 'display_freezer';
  const display = id.startsWith('display_') || id.startsWith('glass_');
  const compact = id.includes('mini');
  const heavy = id.startsWith('heavy_duty');
  const w = compact ? .49 : id.endsWith('double') || id.startsWith('display') ? .98 : heavy ? .84 : .76;
  const h = chest ? (compact ? .66 : .88) : compact ? .63 : heavy ? 1.84 : 1.69;
  const d = compact ? .47 : heavy ? .77 : .66;
  const frozen = id.includes('freezer');
  const paint = heavy ? frozen ? K.steelP(0x9fb3c4) : chrome : frozen ? K.steelP(0xa4b8c7) : cream;
  casework(p, w, h, d, paint, chest ? [0] : [0, h - .04, h * .27, h * .51, h * .74]);
  if (chest) {
    box(p, 'front-panel', [w - .10, h - .06, .045], paint, [0, 0, -d / 2 + .018]);
    if (display) {
      for (const x of [-w / 2 + .025, w / 2 - .025]) box(p, 'lid-side', [.05, .052, d], iron, [x, h - .052, 0]);
      for (const z of [-d / 2 + .025, d / 2 - .025]) box(p, 'lid-rail', [w - .10, .052, .05], iron, [0, h - .052, z]);
      box(p, 'glass-display', [w - .10, .013, d - .10], pane, [0, h - .014, 0], K.GLASS);
    } else box(p, 'lid', [w, .052, d], paint, [0, h - .052, 0]);
    box(p, 'lid-handle', [.23, .047, .033], iron, [0, h - .058, -d / 2 - .022]);
  } else {
    const two = id.endsWith('double');
    for (const x of two ? [-w / 4, w / 4] : [0]) {
      const doorW = two ? w / 2 - .013 : w - .07;
      box(p, `door-${x}`, [doorW, h - .14, .035], display ? pane : paint, [x, .11, -d / 2], display ? K.GLASS : {});
      box(p, `pull-${x}`, [.034, compact ? .13 : .31, .033], iron, [x + (x < 0 ? 1 : -1) * doorW * .38, h * .58, -d / 2 - .028]);
    }
    box(p, 'vent-kickplate', [w - .06, .095, .04], layers(iron, grid(0x252d32, 13, 2)), [0, .015, -d / 2]);
    if (heavy) panel(p, 'thermostat', .13, .055, h - .09, -d / 2, frozen ? 0x6b91aa : 0x7e9c89);
  }
}

function appliance(p, id) {
  if (id === 'sink_gravity' || id === 'eyewash') {
    const eye = id === 'eyewash';
    const h = eye ? .98 : .74;
    if (eye) cyl(p, 'pedestal', 'y', [0, h / 2, 0], .049, h, K.steelP(0xd9aa34));
    else legs(p, .57, .46, h, steel);
    tray(p, 'basin', [eye ? .36 : .57, .105, .42], eye ? K.steelP(0x79a76e) : chrome, [0, h, 0], .025);
    for (const x of eye ? [-.075, .075] : [0]) {
      box(p, `supply-${x}`, [.04, .15, .04], chrome, [x, h + .025, .15]);
      box(p, `spout-${x}`, [.04, .03, .15], chrome, [x, h + .15, .087]);
    }
    if (eye) {
      box(p, 'valve-extension', [.16, .034, .048], steel, [.215, h + .016, .145]);
      box(p, 'push-handle', [.085, .125, .043], K.steelP(0xe5ac26), [.293, h - .02, .145]);
      box(p, 'upright-notice', [.034, .28, .038], steel, [0, h + .10, .186]);
      box(p, 'do-not-drink-notice', [.31, .124, .02], label('DO NOT DRINK', 0xf2efe1, 0xa64537), [0, h + .32, .18], { ppm: 112 });
    } else {
      box(p, 'reservoir-stand', [.046, .44, .046], steel, [-.247, h, .184]);
      box(p, 'reservoir-stand', [.046, .44, .046], steel, [.247, h, .184]);
      box(p, 'reservoir-shelf', [.53, .04, .26], steel, [0, h + .41, .184]);
      box(p, 'gravity-reservoir', [.41, .24, .22], cream, [0, h + .45, .184]);
      cyl(p, 'hand-pump-column', 'y', [.335, .53, .138], .035, 1.06, iron);
      cyl(p, 'hand-pump-body', 'y', [.335, 1.063, .138], .071, .198, K.steelP(0x66827c));
      hoop(p, 'hand-pump-lever', [[.335, 1.14, .14], [.37, 1.19, -.012], [.37, 1.29, -.21]], .019, iron);
      cyl(p, 'pump-grip', 'x', [.37, 1.29, -.21], .024, .108, wood);
      box(p, 'supply-pipe', [.14, .03, .035], chrome, [.27, 1.29, .151]);
      cyl(p, 'reservoir-outlet', 'y', [-.085, h + .325, .171], .018, .25, chrome);
      box(p, 'water-in-basin', [.48, .004, .33], flat(0x769eab), [0, h + .027, 0]);
    }
    return;
  }
  if (id === 'air_filter') {
    box(p, 'housing', [.68, .71, .24], steel);
    box(p, 'pleated-filter', [.58, .60, .035], layers(cream, grid(0x777e74, 18, 2)), [0, .056, -.13]);
    return;
  }
  if (id === 'water_purifier') {
    box(p, 'base', [.55, .06, .39], iron);
    box(p, 'manifold', [.54, .12, .36], K.steelP(0x425e73), [0, .72, 0]);
    for (const [i, x] of [-.17, 0, .17].entries()) {
      cyl(p, `filter-${i}`, 'y', [x, .37, -.06], .074, .61, i === 1 ? K.plasticP(0x81adbf) : cream);
      cyl(p, `filter-cap-${i}`, 'y', [x, .68, -.06], .08, .085, iron);
    }
    panel(p, 'monitor', .17, .052, .754, -.183, 0x7da7ad);
    return;
  }
  if (id === 'deep_fryer') {
    legs(p, .69, .63, .62, steel, .065);
    tray(p, 'frying-well', [.69, .28, .62], chrome, [0, .62, 0]);
    for (const x of [-.16, .16]) tray(p, `mesh-basket-${x}`, [.24, .12, .37], layers(steel, grid(0x515b62, 12, 12)), [x, .80, 0], .018);
    return;
  }
  const oven = id.startsWith('gas_oven');
  const furnace = id === 'home_furnace';
  const oxygen = id === 'oxygen_concentrator';
  const shredder = id === 'shredder';
  const w = oven ? .75 : shredder || oxygen ? .39 : .60;
  const d = oven ? .68 : shredder || oxygen ? .31 : .62;
  const h = furnace ? 1.24 : shredder || oxygen ? .63 : .85;
  const paint = oven ? iron : furnace ? K.steelP(0x8c9185) : shredder ? K.plasticP(0x69706d) : cream;
  box(p, 'housing', [w, h, d], paint);
  if (oven) {
    panel(p, 'oven-window', .52, .36, .28, -d / 2 - .009, 0x443d38);
    box(p, 'oven-handle', [.54, .035, .047], chrome, [0, .69, -d / 2 - .034]);
    for (const [i, x] of [-.25, -.125, 0, .125, .25].entries()) cyl(p, `burner-knob-${i}`, 'z', [x, .78, -d / 2 - .021], .022, .04, black);
    for (const x of [-.186, .186]) for (const z of [-.159, .159]) {
      cyl(p, `burner-${x}-${z}`, 'y', [x, .866, z], .106, .03, black);
      box(p, `grate-${x}-${z}`, [.215, .015, .027], steel, [x, .881, z]);
    }
    if (id.endsWith('combo')) {
      for (const x of [-.347, .347]) box(p, `microwave-support-${x}`, [.045, .59, .045], steel, [x, .85, .29]);
      box(p, 'microwave', [.66, .28, .37], chrome, [0, 1.30, .11]);
      panel(p, 'microwave-window', .43, .19, 1.34, -.082, 0x252b30);
      box(p, 'microwave-keypad', [.08, .16, .015], layers(black, grid(0x86929a, 3, 5)), [.255, 1.35, -.084]);
    }
  } else if (furnace) {
    box(p, 'chimney-flue', [.27, .46, .24], steel, [.11, h, .09]);
    box(p, 'louvered-access', [.46, .47, .025], layers(steel, grid(0x3f4644, 1, 14)), [0, .14, -d / 2]);
    panel(p, 'gas-service-plate', .20, .13, .87, -d / 2, 0x9c8e65);
  } else if (shredder) {
    box(p, 'shredder-head', [w + .025, .104, d + .02], cream, [0, h, 0]);
    box(p, 'paper-slot', [.24, .005, .018], black, [0, h + .104, 0]);
    box(p, 'basket-window', [.15, .25, .009], black, [0, .21, -d / 2]);
  } else {
    box(p, 'handle-or-panel', [w * .8, .052, .036], iron, [0, h * .85, -d / 2]);
    if (oxygen) panel(p, 'flow-control', .21, .21, .25, -d / 2, 0x73968d);
    else box(p, 'dishwasher-door', [w - .06, .59, .025], layers(chrome, border(0x777e7b)), [0, .065, -d / 2]);
  }
}

// Unbranded Japanese drink machines: full-width sample rows, individual selection
// buttons, hot/cold strips, and a recessed retrieval bay below the payment controls.
const vendingDrinks = [
  // [can/bottle, body, wrap, label stripe]
  ['can', 0xbac1bd, 0x518dad, 0xe2e7d6],
  ['bottle', 0xb8d4da, 0x5ba5b4, 0xf2f1e0],
  ['can', 0xbdc0b7, 0xb8534c, 0xf2e0cb],
  ['bottle', 0x86a56a, 0x448154, 0xdce3b8],
  ['can', 0xb8b7ad, 0xe0a94c, 0x7c4f37],
  ['bottle', 0xbb9463, 0xd2bc73, 0x706749],
  ['can', 0xb8b5a3, 0x483834, 0xbe9666],
  ['can', 0xb8b7ae, 0x7d493a, 0xe0caa7],
  ['can', 0xced0c4, 0xe6dac0, 0x736355],
];

function vendingDrink(p, name, drink, x, y) {
  const [kind, body, wrap, stripe] = drink;
  const z = -.237;
  const can = kind === 'can';
  const height = can ? .129 : .158;
  const radius = can ? .038 : .034;
  const painted = layers(K.steelP(body), K.band(body, wrap, .18, .82),
    (ctx, x, y, w, h, face) => {
      if (face.startsWith('side')) fill(ctx, x, y + h * .43, w, Math.max(1, h * .13), stripe);
    });
  cyl(p, `${name}-${kind}`, 'y', [x, y + height / 2, z], radius, height, painted, radius, 6);
  if (can) {
    cyl(p, `${name}-pull-tab`, 'y', [x, y + height + .004, z], .019, .009, chrome, undefined, 5);
  } else {
    cyl(p, `${name}-shoulder`, 'y', [x, y + height + .012, z], radius, .025, K.plasticP(body), .017, 6);
    cyl(p, `${name}-cap`, 'y', [x, y + height + .029, z], .019, .014, K.plasticP(stripe), undefined, 6);
  }
}

function vending(p, id) {
  const reinforced = id.includes('reinforced');
  const off = id.endsWith('_off');
  const broken = id === 'vending_o';
  const network = id.includes('networked');
  const accent = reinforced ? network ? 0x94673e : 0x8f4b46 : network ? 0x40786c : 0x326c96;
  const enamel = K.steelP(broken ? 0xd5d5c6 : reinforced ? 0xe4dfd0 : 0xeceee4);
  const stripe = K.steelP(accent);
  const seal = K.plasticP(0x31383a);
  const lit = !off && !broken;
  const glassPaint = glass(off ? 0x7a969c : 0xc9e2e7);
  const w = .94, h = 1.86, d = .69;
  const faceZ = -.352;

  box(p, 'recessed-kickplate', [.849, .113, .62], iron);
  box(p, 'enamel-back', [w, h - .10, .055], enamel, [0, .10, .317]);
  for (const x of [-.433, .433]) {
    box(p, 'enamel-side', [.074, h - .10, d - .05], enamel, [x, .10, -.025]);
    box(p, 'painted-side-stripe', [.007, .108, d - .10], stripe, [Math.sign(x) * .472, .273, .005]);
  }
  K.bevel(p, 'rounded-enamel-cap', [-.472, 1.77, -.351, .472, h, .344], .024, enamel);
  box(p, 'header-colour-band', [.844, .112, .044], stripe, [0, 1.689, faceZ]);
  box(p, 'drink-header', [.52, .077, .009], label('飲料  DRINKS', 0xf5f3e0, accent), [-.10, 1.706, faceZ - .025], { ppm: 128 });
  // Front case and door rebate surround the display instead of masking its depth.
  box(p, 'display-backlight-panel', [.843, .895, .03], lit ? flat(0xcbd8cc) : K.steelP(0x6c7778), [0, .79, -.025]);
  for (const x of [-.421, .421]) box(p, 'display-rebate', [.038, .886, .038], seal, [x, .796, faceZ]);
  box(p, 'top-display-frame', [.858, .044, .064], enamel, [0, 1.646, faceZ]);
  box(p, 'bottom-display-frame', [.858, .040, .064], enamel, [0, .768, faceZ]);
  if (lit) {
    box(p, 'window-light', [.762, .016, .023], flat(0xe3ecdd), [0, 1.63, -.225], { glow: true });
  }

  for (const [row, y] of [1.409, 1.128, .846].entries()) {
    box(p, `selection-button-rail-${row}`, [.771, .027, .023], seal, [0, y - .055, faceZ - .01]);
    const warm = row === 2;
    const trim = warm ? 0xaa4a40 : 0x387ba9;
    box(p, `sample-shelf-${row}`, [.811, .020, .34], off ? K.steelP(0x707e81) : enamel, [0, y, -.173]);
    if (!broken) {
      const face = label(warm ? 'あたたかい' : 'つめたい', 0xedece1, off ? shade(trim, .57) : trim);
      box(p, `temperature-strip-${row}`, [.766, .039, .024], face, [0, y - .023, faceZ - .014], { ppm: 144 });
    }
    for (let col = 0; col < 6; col++) {
      const x = (col - 2.5) * .122;
      if (!broken) {
        const items = warm ? [6, 7, 8, 7, 6, 8] : row ? [1, 4, 5, 3, 0, 2] : [0, 1, 2, 3, 4, 5];
        vendingDrink(p, `sample-${row}-${col}`, vendingDrinks[items[col]], x, y + .028);
      }
      const idle = warm ? 0xc68264 : 0x9ab8c2;
      const key = broken || off ? 0x555d58 : idle;
      if (!broken || col % 3 !== row) {
        box(p, `selection-button-${row}-${col}`, [.052, .013, .012], flat(key),
          [x, y - .049, faceZ - .023], { glow: lit });
      }
    }
  }

  if (broken) {
    const door = p.group('bent-display-door', { at: [-.414, .80, faceZ + .007], rotY: .35, rotZ: -.036 });
    const options = { parent: door };
    box(p, 'bent-hinge-side', [.039, .829, .038], stripe, [.023, 0, 0], options);
    box(p, 'hanging-top-frame', [.72, .041, .042], enamel, [.361, .805, 0], options);
    box(p, 'hanging-bottom-frame', [.56, .043, .041], stripe, [.282, 0, 0], options);
    K.pane(p, 'jagged-lower-glass', [K.V(.04, .046, -.012), K.V(.47, .046, -.012),
      K.V(.23, .182, -.012), K.V(.04, .35, -.012)], .012, glassPaint, { ...options, glass: true });
    K.pane(p, 'jagged-upper-glass', [K.V(.042, .805, -.012), K.V(.32, .805, -.012),
      K.V(.16, .703, -.012), K.V(.042, .55, -.012)], .012, glassPaint, { ...options, glass: true });
    hoop(p, 'exposed-panel-wire', [[.319, .781, -.327], [.316, .728, -.396],
      [.345, .665, -.386], [.361, .693, -.351]], .010, K.plasticP(0x9c5d47));
  } else {
    // The clear panes sit behind the button ledges. A shallow horizontal split gives each row a frame.
    for (const y of [.856, 1.138, 1.419]) box(p, 'sample-glazing', [.784, .221, .015], glassPaint, [0, y, faceZ + .024], K.GLASS);
  }

  // Split the lower fascia around the retrieval cavity. The flap is inside the frame.
  box(p, 'lower-service-panel', [.854, .283, .058], enamel, [0, .484, faceZ]);
  box(p, 'painted-bottom-band', [.854, .098, .073], stripe, [0, .105, faceZ]);
  box(p, 'right-lower-return', [.425, .28, .058], enamel, [-.214, .203, faceZ]);
  box(p, 'left-lower-return', [.089, .28, .058], enamel, [.382, .203, faceZ]);
  box(p, 'retrieval-inner-floor', [.339, .031, .190], seal, [.171, .211, -.289]);
  box(p, 'retrieval-inner-back', [.339, .225, .032], black, [.171, .242, -.221]);
  box(p, 'retrieval-frame-top', [.348, .045, .055], seal, [.168, .454, faceZ - .018]);
  box(p, 'retrieval-frame-bottom', [.348, .040, .063], seal, [.168, .205, faceZ - .018]);
  const flap = p.group('push-flap-hinge', { at: [.17, .449, -.367], rotX: broken ? -.78 : -.14 });
  box(p, 'retrieval-push-flap', [.315, .17, .021], K.plasticP(broken ? 0x444d4b : 0x323d3e), [0, -.17, 0], { parent: flap });
  box(p, 'retrieval-caption', [.185, .034, .009], label('取出口', 0xecebdd, 0x354345), [.171, .458, -.399], { ppm: 144 });

  const paymentX = -.275;
  box(p, 'payment-face', [.227, .251, .051], seal, [paymentX, .499, faceZ - .03]);
  const display = off || broken ? 0x41484a : 0x63836d;
  box(p, 'payment-display', [.134, .050, .014], label(lit ? '130' : '', 0xe4e9bc, display),
    [paymentX + .018, .672, faceZ - .062], { ppm: 160, glow: lit });
  box(p, 'cash-card-slot', [.138, .020, .027], flat(0x182223), [paymentX + .015, .618, faceZ - .064]);
  box(p, 'card-slot-trim', [.162, .011, .016], chrome, [paymentX + .015, .607, faceZ - .070]);
  box(p, 'change-return', [.092, .032, .023], iron, [paymentX + .021, .537, faceZ - .060]);
  if (network) {
    box(p, 'contactless-reader', [.048, .055, .035], layers(K.plasticP(0x456759), border(0xc2d0ae, 1)),
      [paymentX - .070, .561, faceZ - .069], { glow: lit });
  }
  if (reinforced) {
    const armor = K.steelP(0x797d78);
    for (const x of [-.427, .427]) {
      box(p, 'bolted-display-stile', [.047, .91, .059], armor, [x, .785, faceZ - .035]);
      for (const y of [.822, 1.092, 1.381, 1.646]) {
        cyl(p, 'stile-bolt', 'z', [x, y, faceZ - .068], .015, .013, chrome, undefined, 6);
      }
    }
    for (const y of [1.102, 1.383]) box(p, 'reinforced-crossbar', [.854, .020, .043], armor, [0, y, faceZ - .030]);
  }
}

function electronics(p, id) {
  if (id.endsWith('server')) {
    const large = id === 'balthazar_server';
    const w = large ? .92 : .62;
    casework(p, w, 1.86, .76, iron, [0, .12, 1.8]);
    for (let y = .17; y < 1.79; y += .14) {
      box(p, `rack-unit-${y}`, [w - .16, .114, .55], layers(steel, front(grid(0x3a4648, 14, 2))), [0, y, -.045]);
      box(p, `status-light-${y}`, [.026, .024, .015], flat(large ? 0xa1b76d : 0x476359), [w * .3, y + .048, -.331]);
    }
    if (large) {
      for (const x of [-.23, .23]) box(p, `coolant-feed-${x}`, [.067, .12, .48], chrome, [x, 1.86, .035]);
    } else {
      for (const y of [.64, 1.20]) {
        box(p, 'rack-laptop-keyboard', [.35, .018, .27], layers(black, top(grid(0x7f8b8f, 12, 5))), [0, y, -.232]);
        box(p, 'rack-laptop-screen', [.35, .19, .026], glass(0x384950), [0, y + .018, -.12]);
      }
    }
    return;
  }
  const atm = id.startsWith('atm');
  const broken = id === 'console_broken_table';
  const control = id === 'control_station';
  const on = !id.endsWith('_off') && !broken;
  const paint = atm ? K.steelP(0x7f897e) : K.steelP(control ? 0x646c56 : 0x485e72);
  const w = control ? .96 : atm ? .66 : .58;
  const stand = atm ? .98 : .85;
  if (broken) legs(p, .65, .49, stand, iron);
  else box(p, 'pedestal', [w * .87, stand, .52], paint);
  box(p, 'control-deck', [w, .093, .53], paint, [0, stand, -.025]);
  box(p, 'input-panel', [w * .72, .027, .145], layers(black, grid(0x7a8990, 13, 4)), [0, stand + .093, -.16]);
  box(p, 'screen-housing', [w * .94, .36, .24], paint, [0, stand + .091, .12]);
  panel(p, 'display', w * .83, .245, stand + .15, -.01, on ? atm ? 0x6c8cad : 0x74a387 : 0x354149);
  if (broken) {
    const fractured = cracks('terminal', 0xc4ceca, 7);
    box(p, 'fractured-screen', [w * .81, .23, .006], layers(black, front(fractured)), [0, stand + .16, -.026]);
    const board = layers(flat(0x485e4c), grid(0x9d994e, 11, 5), cracks('backplane', 0x463d32, 3));
    const shard = p.group('shattered-board', { at: [.18, stand + .095, -.218], rotY: .51 });
    box(p, 'circuit-board-remnant', [.128, .014, .104], board, [0, 0, 0], { parent: shard });
    box(p, 'broken-chip', [.047, .009, .044], black, [0, .013, .01], { parent: shard });
  }
  if (atm) {
    box(p, 'cash-slot', [.27, .047, .05], black, [0, .66, -.27]);
    if (on) {
      box(p, 'cracked-screen-glass', [w * .82, .24, .006],
        layers(flat(0x547996), front(cracks('atm-screen-cracks', 0xa7bab9, 5))), [0, stand + .152, -.024]);
      box(p, 'dented-service-panel', [.35, .22, .023],
        layers(paint, front(cracks('atm-dents', 0x54544e, 6))), [0, .31, -.267]);
    }
  }
}

const generatorMetal = K.steelP(0xa3acaa);
const enginePaint = K.steelP(0x454b49);
const rubber = K.plasticP(0x282c2c);

function generatorGrille(ctx, x, y, w, h) {
  fill(ctx, x, y, w, h, 0x292f2d);
  for (let j = 2; j < h - 1; j += 3) {
    fill(ctx, x + 1, y + j, w - 2, 1, 0x65716d);
  }
}

function generatorPanel(p, width, height, x, y, z, { running = false, sealed = false, compact = false } = {}) {
  const casing = K.steelP(sealed ? 0x383e32 : 0x3b4548);
  box(p, 'recessed-output-panel', [width, height, .035], layers(casing, border(0x222b2b, 1)), [x, y, z]);
  const scale = width / .32;
  const frontZ = z - .023;
  box(p, 'output-panel-legend', [width * .83, .025, .006], label('AC OUTPUT', 0xdbe1cf, sealed ? 0x383e32 : 0x3b4548),
    [x, y + height - .040, frontZ], { ppm: 144 });
  const socket = (ctx, px, py, w, h) => {
    fill(ctx, px, py, w, h, 0x424847);
    fill(ctx, px + w * .29, py + h * .31, Math.max(1, w * .17), Math.max(1, h * .35), 0x1c2322);
    fill(ctx, px + w * .55, py + h * .32, Math.max(1, w * .16), Math.max(1, h * .35), 0x1c2322);
    fill(ctx, px + w * .43, py + h * .67, Math.max(1, w * .13), Math.max(1, h * .12), 0x1c2322);
  };
  for (const off of [-.112, -.038]) {
    const sx = x + off * scale;
    const socketY = y + height * .42;
    K.cyl(p, 'receptacle-surround', 'z', [sx, socketY, frontZ], .029 * scale, .019, 8,
      sealed ? K.plasticP(0x525b46) : enginePaint, {});
    if (sealed) box(p, 'socket-cover-hinge', [.041 * scale, .012, .020], iron, [sx, socketY + .020, frontZ - .003]);
    else box(p, 'grounded-receptacle-face', [.043 * scale, .039, .008],
      sides(['front'], socket, enginePaint), [sx, socketY - .019, frontZ - .013], { ppm: 200 });
  }
  const meterW = (compact ? .055 : .076) * scale;
  box(p, 'output-meter', [meterW, .035, .017], layers(flat(running ? 0x718a6e : 0x414e49), border(0x2b3536)),
    [x + .079 * scale, y + height * .37, frontZ - .004]);
  box(p, 'protected-breaker', [.040 * scale, .020, .014], flat(0x9a5d4c), [x + .074 * scale, y + .017, frontZ - .006]);
  box(p, 'status-indicator', [.016 * scale, .011, .009], flat(running ? 0xa3c66b : 0x596351),
    [x + .131 * scale, y + height * .56, frontZ - .006], { glow: running });
}

function portableGenerator(p) {
  const blue = K.plasticP(0x3c6f87);
  const darkBlue = K.plasticP(0x2a4755);
  const w = .67, d = .40;
  for (const x of [-.23, .23]) box(p, 'anti-vibration-foot', [.117, .061, .337], rubber, [x, 0, 0]);
  K.bevel(p, 'molded-inverter-casing', [-w / 2, .05, -d / 2, w / 2, .492, d / 2], .043, blue);
  K.bevel(p, 'contrasting-service-cover', [-.305, .078, -.225, .304, .430, -.187], .021, darkBlue);
  generatorPanel(p, .305, .167, .128, .192, -.24, { compact: true });
  box(p, 'recoil-starter-grille', [.145, .177, .026], sides(['front'], generatorGrille, darkBlue), [-.175, .184, -.231]);
  box(p, 'pull-start-handle', [.093, .026, .025], rubber, [-.181, .334, -.253]);
  box(p, 'inverter-label', [.244, .040, .009], label('INVERTER', 0xe6e5d5, 0x2a4755), [.119, .375, -.232], { ppm: 144 });
  for (const x of [-.139, .139]) box(p, 'molded-handle-upright', [.075, .102, .09], blue, [x, .477, .016]);
  K.bevel(p, 'carry-handle', [-.177, .558, -.030, .177, .607, .062], .014, blue);
  box(p, 'rubber-handle-grip', [.176, .023, .095], rubber, [0, .58, .016]);
  cyl(p, 'knurled-fuel-cap', 'y', [-.210, .507, .078], .051, .035, rubber, .045, 10);
  box(p, 'rear-vent', [.396, .175, .014], sides(['back'], generatorGrille, darkBlue), [-.038, .18, .201]);
  cyl(p, 'rear-exhaust-outlet', 'z', [.199, .136, .210], .038, .033, iron, .030);
}

function openFrameGenerator(p, broken) {
  const d = .66;
  const frame = broken ? K.steelP(0x785b47) : K.steelP(0x3e4646);
  const tankPaint = K.steelP(0xb56a41);
  for (const z of [-.27, .27]) box(p, 'base-frame-rail', [.891, .065, .061], frame, [-.018, .054, z]);
  for (const x of [-.356, .32]) {
    box(p, 'crossmember', [.070, .054, d - .055], frame, [x, .055, 0]);
    box(p, 'anti-vibration-foot', [.136, .057, .095], rubber, [x, 0, -.257]);
  }
  if (!broken) {
    for (const z of [-.267, .267]) {
      hoop(p, 'bent-safety-cage', [[-.417, .09, z], [-.417, .673, z], [-.355, .748, z],
        [.337, .748, z], [.413, .675, z], [.413, .09, z]], .024, frame);
    }
    for (const x of [-.360, .345]) box(p, 'top-frame-crossbar', [.043, .044, d - .08], frame, [x, .708, 0]);
    K.bevel(p, 'pressed-steel-fuel-tank', [-.356, .565, -.244, .358, .733, .250], .024, tankPaint);
    cyl(p, 'fuel-cap', 'y', [.19, .751, .085], .051, .043, rubber, .044, 10);
    box(p, 'fuel-level-window', [.085, .010, .028], layers(flat(0x7a8580), grid(0x3e4847, 5, 1)), [.075, .733, .072]);
    box(p, 'tank-stencil', [.265, .052, .012], label('12 kW', 0xeee5d1, 0xb56a41), [.069, .617, -.248], { ppm: 144 });
  } else {
    for (const z of [-.27, .27]) {
      hoop(p, 'bent-safety-cage', [[-.412, .08, z], [-.396, .51, z], [-.287, .579, z + .017],
        [-.063, .550, z + .044], [.078, .459, z + .020]], .023, frame);
      hoop(p, 'broken-cage-post', [[.380, .087, z], [.397, .239, z + .017], [.344, .334, z + .043]], .023, frame);
    }
    const tank = p.group('buckled-tank-remnant', { at: [-.196, .482, .065], rotZ: -.24, rotY: .15 });
    K.bevel(p, 'dented-tank-remnant', [-.163, 0, -.12, .106, .125, .133], .028,
      layers(frame, cracks('worn-fuel-cover', 0x454040, 8)), { parent: tank });
  }

  box(p, 'crankcase', [.289, .263, .302], enginePaint, [-.162, .145, .035]);
  box(p, 'sump', [.240, .065, .25], rubber, [-.162, .112, .035]);
  for (const y of [.404, .431, .458, .485, .512]) {
    box(p, 'cylinder-head-cooling-fin', [.238, .013, .247], generatorMetal, [-.179, y, .047]);
  }
  box(p, 'cylinder-head-core', [.142, .127, .171], iron, [-.179, .395, .043]);
  box(p, 'rocker-cover', [.165, .042, .16], enginePaint, [-.185, .519, .050]);
  const exhaust = [[-.205, .454, .151], [-.266, .466, .198], [-.319, .471, .207]];
  hoop(p, 'exhaust-manifold', exhaust, .023, K.steelP(0x856558));
  box(p, 'heat-shielded-muffler', [.171, .094, .083], layers(iron, grid(0x65716d, 7, 3)), [-.234, .397, .210]);

  K.cyl(p, 'alternator-body', 'x', [.174, .273, .026], .130, .30, 10, generatorMetal, { metal: true }, .122);
  for (const y of [.190, .245, .30, .354]) {
    box(p, 'alternator-cooling-rib', [.265, .010, .023], iron, [.176, y, -.084 - Math.max(0, .037 - Math.abs(y - .27) * .34)]);
  }
  cyl(p, 'alternator-end-flange', 'x', [.316, .273, .026], .127, .027, iron, undefined, 10);
  box(p, 'alternator-mount', [.223, .052, .218], rubber, [.168, .115, .021]);

  if (broken) {
    cyl(p, 'exposed-copper-windings', 'x', [.334, .273, .026], .085, .047, K.steelP(0xae7351), .078, 10);
    for (let i = 0; i < 8; i++) {
      const turn = p.group('exposed-winding-slot', { at: [.355, .273, .026], rotX: i * Math.PI / 4 });
      box(p, 'visible-copper-loop', [.026, .033, .016], K.steelP(0xbf845f), [0, .055, 0], { parent: turn });
    }
    cyl(p, 'exposed-alternator-shaft', 'x', [.374, .273, .026], .030, .077, steel, undefined, 8);
    box(p, 'empty-panel-bracket', [.247, .126, .036], layers(iron, border(0x171d1d, 2)), [.220, .359, -.184]);
    const wiring = [[.167, .458, -.175], [.179, .391, -.259], [.254, .321, -.281], [.298, .275, -.236]];
    hoop(p, 'pulled-loose-wire', wiring, .012, K.plasticP(0x9e5a44));
    hoop(p, 'torn-cable-tail', [[.273, .435, -.176], [.303, .346, -.248], [.280, .312, -.285]], .010, K.plasticP(0x86826c));
  } else {
    K.cyl(p, 'recoil-starter-housing', 'z', [-.168, .305, -.147], .114, .073, 12,
      sides(['end-1'], generatorGrille, enginePaint), {});
    cyl(p, 'recoil-starter-centre', 'z', [-.168, .305, -.191], .037, .012, generatorMetal);
    box(p, 'starter-pull-grip', [.088, .027, .030], rubber, [-.273, .368, -.192]);
    generatorPanel(p, .314, .168, .193, .362, -.244);
    for (const x of [-.349, .350]) {
      K.cyl(p, 'transport-tire', 'x', [x, .112, .238], .112, .090, 12, rubber, {}, .112);
      cyl(p, 'pressed-steel-wheel-hub', 'x', [x + Math.sign(x) * .05, .112, .238], .054, .024, generatorMetal);
    }
    hoop(p, 'folding-transport-handle', [[-.378, .487, -.268], [-.428, .591, -.268], [-.428, .591, .177],
      [-.378, .487, .177]], .018, frame);
  }
}

function enclosedGenerator(p, id) {
  const military = id === 'military_generator';
  const backup = id === 'active_backup_generator';
  const w = backup ? .72 : .963, d = backup ? .475 : .68;
  const roof = backup ? .648 : military ? .690 : .754;
  const casingColor = backup ? 0xb0af9a : military ? 0x696d4c : 0xc7954c;
  const panelColor = backup ? 0x939985 : military ? 0x585e43 : 0xc18c48;
  const camo = (base) => layers(K.steelP(base), (ctx, x, y, w, h) => {
    for (const [u, v, a, b, color] of [[.05, .24, .27, .18, 0x454d39], [.29, .36, .25, .21, 0x454d39],
      [.60, .67, .27, .23, 0x9a835f], [.49, .53, .19, .18, 0x9a835f], [.75, .15, .17, .22, 0x4e5640]]) {
      fill(ctx, x + w * u, y + h * v, w * a, h * b, color);
    }
  });
  const paint = military ? camo(casingColor) : K.steelP(casingColor);
  const z = -d / 2;
  if (backup) {
    box(p, 'concrete-mounting-base', [w + .055, .066, d + .06], concrete);
    box(p, 'isolation-sill', [w - .033, .093, d - .04], rubber, [0, .065, 0]);
  } else {
    if (military) {
      for (const side of [-1, 1]) {
        box(p, 'skid-rail', [w - .023, .071, .078], iron, [0, 0, side * (d / 2 - .072)]);
        for (const x of [-w * .34, w * .34]) box(p, 'skid-post', [.075, .086, .065], iron, [x, .07, side * (d / 2 - .074)]);
      }
    } else {
      for (const side of [-1, 1]) {
        const z = side * .299;
        K.cyl(p, 'worksite-trailer-wheel', 'z', [-.211, .124, z], .124, .076, 12, rubber, {});
        cyl(p, 'trailer-wheel-hub', 'z', [-.211, .124, z + side * .041], .066, .014, generatorMetal, undefined, 10);
        box(p, 'wheel-arch', [.290, .027, .085], K.steelP(casingColor), [-.211, .25, z]);
      }
      box(p, 'trailer-crossmember', [.73, .059, .48], iron, [0, .124, 0]);
      box(p, 'parking-jack', [.047, .143, .047], steel, [.396, .015, 0]);
      box(p, 'parking-jack-foot', [.122, .026, .117], iron, [.396, 0, 0]);
    }
    box(p, 'reinforced-base', [w, .105, d], enginePaint, [0, .134, 0]);
  }
  const base = backup ? .141 : .230;
  const topY = roof - .075;
  box(p, 'enclosure-back', [w - .035, topY - base, .055], paint, [0, base, d / 2 - .028]);
  for (const x of [-(w - .043) / 2, (w - .043) / 2]) {
    box(p, 'enclosure-side', [.041, topY - base, d - .023], paint, [x, base, 0]);
  }
  K.bevel(p, 'enclosure-roof', [-w / 2, topY, z, w / 2, roof, d / 2], .019, K.steelP(casingColor));
  K.bevel(p, 'service-door', [-w * .45, base + .014, z - .024, w * .45, topY, z + .031], .010, K.steelP(panelColor));
  if (military) {
    box(p, 'camouflaged-access-panel', [w * .871, topY - base - .041, .010], camo(panelColor),
      [0, base + .026, z - .025]);
    box(p, 'camouflaged-roof-plate', [w - .046, .006, d - .046], paint, [0, roof, 0]);
  }
  const radX = backup ? -.187 : -.246;
  const radW = backup ? .259 : .332;
  const radH = topY - base - .091;
  box(p, 'radiator-bezel', [radW, radH, .026], iron, [radX, base + .032, z - .028]);
  box(p, 'recessed-radiator-face', [radW - .036, radH - .036, .010], sides(['front'], generatorGrille, black),
    [radX, base + .047, z - .044]);
  for (const x of [radX - radW * .28, radX + radW * .28]) {
    box(p, 'radiator-vertical-guard', [.017, radH - .018, .017], generatorMetal, [x, base + .041, z - .053]);
  }
  const controlX = backup ? .150 : .226;
  generatorPanel(p, backup ? .260 : .326, .156, controlX, base + .057, z - .049, { running: backup, sealed: military });
  const mark = backup ? 'STANDBY' : military ? 'FIELD POWER' : 'DIESEL';
  box(p, 'service-identification', [backup ? .209 : .258, .041, .009], label(mark, 0xf0ead5, panelColor),
    [controlX, topY - .076, z - .039], { ppm: 144 });
  for (const x of [-w * .42, w * .42]) box(p, 'service-door-latch', [.035, .052, .023], iron, [x, topY - .101, z - .035]);

  const sideRibs = sides(['front'], generatorGrille, iron);
  const grille = p.group('side-radiator', { at: [w / 2 + .009, base + .054, .055], rotY: -Math.PI / 2 });
  box(p, 'side-vent', [d * .58, topY - base - .128, .016], sideRibs, [0, 0, 0], { parent: grille });
  if (backup) {
    box(p, 'automatic-transfer-box', [.041, .141, .147], enginePaint, [-w / 2 - .012, base + .132, .074]);
    hoop(p, 'flexible-transfer-conduit', [[-.369, base + .133, .07], [-.395, base + .075, .068],
      [-.392, base + .015, .026], [-.355, base + .012, -.022]], .012, rubber);
    box(p, 'back-exhaust-pocket', [.16, .105, .024], iron, [-.191, .389, d / 2 + .003]);
    cyl(p, 'low-profile-exhaust', 'z', [-.195, .424, d / 2 + .028], .028, .047, enginePaint);
  } else {
    const exhaustX = military ? -.251 : -.284;
    const exhaustH = military ? .129 : .233;
    cyl(p, 'exhaust-stack', 'y', [exhaustX, roof + exhaustH / 2, .178], .033, exhaustH, iron, undefined, 8);
    cyl(p, 'exhaust-heat-shield', 'y', [exhaustX, roof + exhaustH * .30, .178], .044, exhaustH * .61, generatorMetal, .042, 8);
    box(p, 'exhaust-rain-cap', [.093, .013, .095], iron, [exhaustX, roof + exhaustH, .184]);
    for (const x of [-w * .22, w * .22]) {
      hoop(p, 'lifting-eye', [[x - .049, roof - .005, -.032], [x - .036, roof + .065, -.032],
        [x + .036, roof + .065, -.032], [x + .049, roof - .005, -.032]], .012, iron);
    }
    if (!military) {
      for (const x of [-.333, .333]) {
        box(p, 'amber-site-reflector', [.052, .024, .015], flat(0xd69142), [x, .205, z - .013]);
      }
    }
  }
}

function generator(p, id) {
  if (id === 'portable_generator') return portableGenerator(p);
  if (id === '12000_gasoline_generator' || id === 'generator_broken') return openFrameGenerator(p, id === 'generator_broken');
  return enclosedGenerator(p, id);
}

function compressor(p, id) {
  const portable = id === 'air_compressor';
  const heavy = !portable;
  const w = portable ? .63 : .97;
  const d = portable ? .47 : .62;
  const paint = K.steelP(0xc6a14d);
  box(p, 'skid', [w, .095, d], iron);
  const radius = heavy ? .247 : .205;
  cyl(p, 'pressure-tank', 'x', [0, radius + .075, 0], radius, w - .05, paint, radius * .92, 10);
  box(p, 'motor', [w * .62, heavy ? .265 : .18, .29], iron, [0, radius * 2 + .046, 0]);
  cyl(p, 'gauge', 'z', [0, radius * 2 + .171, -.155], .052, .04, cream);
  if (heavy) {
    box(p, 'compressor-control', [.21, .237, .198], steel, [.30, .57, .083]);
    box(p, 'pressure-line', [.37, .049, .047], chrome, [.124, .792, .10]);
    box(p, 'outlet-coupler', [.094, .073, .081], brass, [-.395, .38, -.025]);
  }
  if (portable) for (const x of [-w / 2 + .02, w / 2 - .02]) {
    cyl(p, `wheel-${x}`, 'x', [x, .084, .16], .089, .064, black);
    cyl(p, `wheel-hub-${x}`, 'x', [x + Math.sign(x) * .036, .084, .16], .036, .014, steel);
  }
}

function hearth(p, id) {
  if (id === 'firering') {
    for (let i = 0; i < 9; i++) {
      const a = i * 2 * Math.PI / 9;
      K.lump(p, `ring-stone-${i}`, [.11, .079, .093], concrete, `${id}-${i}`, {}, [.26 * Math.cos(a), 0, .26 * Math.sin(a)]);
    }
    K.crumple(p, 'ash-bed', .20, .20, .023, K.stoneP(0x443c38), id);
    return;
  }
  if (id.startsWith('fireplace') || id === 'clay_oven') {
    const clay = id === 'clay_oven';
    const stone = id === 'fireplace_stone';
    if (clay) {
      const clayBody = K.stoneP(0xa87c54);
      const firebrick = masonry(id, { brick: 0xa9654b, mortar: 0xc09d79, rows: 6, cols: 5 });
      box(p, 'clay-foundation', [.82, .13, .65], clayBody);
      box(p, 'firebrick-oven-floor', [.64, .06, .52], firebrick, [0, .13, -.035]);
      box(p, 'firebrick-oven-back', [.71, .46, .1], firebrick, [0, .16, .249]);
      for (const x of [-.31, .31]) box(p, 'clay-side-wall', [.19, .37, .59], clayBody, [x, .13, .013]);
      for (const [i, x] of [-.25, -.14, 0, .14, .25].entries()) {
        box(p, 'stepped-clay-vault', [.16, .21, .58], clayBody, [x, [.49, .57, .61, .57, .49][i], .018]);
      }
      hollowTube(p, 'clay-flue', 'y', [0, .961, .158], .116, .072, .35, clayBody, 8);
      return;
    }
    const m = masonry(id, { brick: stone ? 0x777a73 : 0x9a5647, mortar: stone ? 0x525753 : 0xaa9786, rows: 8, cols: stone ? 4 : 7 });
    box(p, 'hearth', [.98, .105, .71], m);
    for (const x of [-.35, .35]) box(p, `pier-${x}`, [.245, .63, .61], m, [x, .105, .027]);
    box(p, 'firebox-back', [.7, .61, .13], K.stoneP(0x463831), [0, .105, .256]);
    box(p, 'lintel', [.97, .16, .64], m, [0, .735, .035]);
    box(p, 'mantel', [.99, .075, .68], stone ? concrete : darkWood, [0, .895, .025]);
    box(p, 'chimney', [.64, 1.03, .38], m, [0, .97, .155]);
    return;
  }
  if (id === 'solar_cooker') {
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      const x = Math.cos(a), z = Math.sin(a);
      box(p, `tripod-foot-${i}`, [.072, .041, .072], iron, [x * .325, 0, z * .325]);
      K.tube(p, `tripod-leg-${i}`, K.V(x * .325, .032, z * .325), K.V(x * .105, .63, z * .105), .024, .024, 4, steel);
    }
    const reflector = p.group('solar-reflector', { at: [0, .615, 0] });
    dish(p, 'reflector', .416, .148, K.steelP(0xd0d7d5), reflector);
    box(p, 'reflector-mount', [.24, .058, .20], iron, [0, .59, 0]);
    for (const x of [-.115, .115]) {
      box(p, 'pot-support', [.028, .037, .42], iron, [x, .773, 0]);
      box(p, 'pot-support-peg', [.038, .137, .04], steel, [x, .642, .146]);
    }
    box(p, 'pot-rest', [.26, .032, .23], black, [0, .81, 0]);
    return;
  }
  if (id === 'woodstove' || id === 'portable_stove') {
    const portable = id === 'portable_stove';
    const w = portable ? .33 : .58;
    const h = portable ? .25 : .61;
    const d = portable ? .34 : .53;
    if (portable) {
      for (const x of [-.111, .111]) for (const s of [-1, 1]) {
        box(p, 'folding-foot', [.061, .027, .062], steel, [x, 0, s * .14]);
        hoop(p, 'folding-leg', [[x, .018, s * .14], [x, .104, s * .092]], .021, steel);
        cyl(p, 'hinge-pin', 'x', [x, .123, s * .094], .024, .068, chrome, undefined, 6);
      }
    } else legs(p, w, d, .115, iron, .04);
    box(p, 'firebox', [w, h, d], iron, [0, .115, 0]);
    box(p, 'firebox-door', [w * .64, h * .65, .042], layers(black, front(grid(0x687179, 1, 6))), [0, .15, -d / 2]);
    box(p, 'door-latch', [.054, .027, .041], chrome, [w * .27, .23, -d / 2 - .02]);
    cyl(p, 'flue', 'y', [0, h + .24, d * .26], portable ? .038 : .065, .25, black);
    return;
  }
  const barrel = id.includes('firebarrel');
  const raised = id === 'brazier';
  const hobo = id === 'hobo_stove';
  const r = hobo ? .061 : id.startsWith('55') ? .30 : id.startsWith('30') ? .253 : raised ? .33 : .12;
  const h = hobo ? .108 : id.startsWith('55') ? .87 : id.startsWith('30') ? .62 : raised ? .145 : .21;
  const y = raised ? .34 : 0;
  const paint = K.steelP(barrel ? 0x7d5146 : 0x645950);
  const vents = barrel || id === 'makeshift_brazier' || hobo;
  if (raised) legs(p, .45, .45, y, iron, .04);
  cyl(p, 'base', 'y', [0, y + .02, 0], r, .04, iron);
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI / 5;
    const g = p.group(`rim-segment-${i}`, { at: [.94 * r * Math.cos(a), y, .94 * r * Math.sin(a)], rotY: Math.PI / 2 - a });
    const opts = { parent: g };
    const w = r * .605, t = Math.max(.004, r * .06);
    if (vents && i % 2 === 0) {
      const holeY = h * .21, holeH = h * .13, edge = w * .30;
      box(p, 'lower-side', [w, holeY, t], paint, [0, 0, 0], opts);
      box(p, 'upper-side', [w, h - holeY - holeH, t], paint, [0, holeY + holeH, 0], opts);
      for (const x of [-(w - edge) / 2, (w - edge) / 2]) box(p, 'vent-edge', [edge, holeH, t], paint, [x, holeY, 0], opts);
    } else box(p, 'sidewall', [w, h, t], paint, [0, 0, 0], opts);
  }
  if (barrel) for (const y of [h * .37, h * .73]) {
    hollowTube(p, 'rolled-drum-band', 'y', [0, y, 0], r * .976, r * .94, h * .036, paint, 10);
  }
  if (id === 'makeshift_brazier') {
    hoop(p, 'bucket-handle', [[-.122, h * .76, 0], [-.11, h + .05, 0], [-.056, h + .10, 0],
      [.056, h + .10, 0], [.11, h + .05, 0], [.122, h * .76, 0]], .007, steel);
  }
}

function barrier(p, id) {
  if (id === 'lane') {
    box(p, 'lane-post', [.094, .94, .094], wood);
    box(p, 'reflector', [.099, .079, .018], flat(0xe4c275), [0, .79, -.05]);
    return;
  }
  if (id.startsWith('hesco')) {
    const levels = id.endsWith('wall') ? 2 : 1;
    for (let i = 0; i < levels; i++) {
      const mesh = layers(K.clothP(0x92846a), grid(0x4b5146, 10, 10), border(0x55594e, 2));
      box(p, `wire-cage-${i}`, [.98, .998, .86], layers(mesh, top(K.stoneP(0xaa9979))), [0, i, 0]);
    }
    return;
  }
  if (id.includes('bag')) {
    const courses = id.endsWith('_half') ? 3 : 9;
    const paint = K.clothP(id.startsWith('earth') ? 0x77654d : id.startsWith('gravel') ? 0x82807a : 0xb4a179);
    for (let i = 0; i < courses; i++) {
      const offset = i % 2 === 0;
      const units = offset ? [[-.33, .33], [0, .33], [.33, .33]] : [[-.41, .17], [-.165, .33], [.165, .33], [.41, .17]];
      for (const [x, w] of units) {
        const y = i * .207;
        K.bevel(p, `bag-${i}-${x}`, [x - w / 2, y, -.22, x + w / 2 - .005, y + .211, .22], .035, paint);
      }
    }
    return;
  }
  if (id === 'showjump') {
    for (const y of [.44, .73]) {
      for (let i = 0; i < 5; i++) cyl(p, `painted-rail-${y}-${i}`, 'x', [-.4 + i * .2, y, 0], .042, .2, i % 2 ? K.woodP(0x925247) : cream);
    }
    for (const x of [-.46, .46]) box(p, `support-${x}`, [.063, .78, .19], cream, [x, 0, 0]);
    return;
  }
  if (id === 'showjump_end') {
    for (const x of [-.23, .23]) box(p, `wing-post-${x}`, [.082, 1.25, .088], cream, [x, 0, 0]);
    for (const y of [.20, .42, .64, .88]) box(p, `wing-board-${y}`, [.53, .105, .046], wood, [0, y, 0]);
    box(p, 'foot', [.59, .06, .48], cream);
    return;
  }
  for (const x of [-.34, .34]) {
    for (const s of [-1, 1]) K.tube(p, `trestle-${x}-${s}`, K.V(x, .027, s * .25), K.V(x, .91, 0), .031, .031, 4, wood);
    for (const s of [-1, 1]) box(p, `foot-${x}-${s}`, [.07, .053, .082], wood, [x, 0, s * .25]);
  }
  const tape = layers(K.woodP(0xd0b08b), (ctx, x, y, w, h) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if ((i + j) % 16 < 8) fill(ctx, x + i, y + j, 1, 1, 0xcb6f33);
    }
  });
  for (const y of [.41, .74]) box(p, `reflective-board-${y}`, [.99, .175, .065], tape, [0, y, -.065]);
}

function tent(p, id) {
  const open = id.endsWith('_o') || id.endsWith('_open');
  if (id.startsWith('counter_gate')) {
    const hinge = p.group('gate-hinge', { at: [-.46, 0, 0], rotY: open ? 1.45 : 0 });
    box(p, 'post', [.082, .93, .085], darkWood, [-.46, 0, 0]);
    box(p, 'swing-gate', [.83, .67, .053], layers(wood, border(0x593921, 2)), [.45, .23, 0], { parent: hinge });
    return;
  }
  const large = id.startsWith('large_');
  const cardboard = id.startsWith('cardboard');
  const skin = id.includes('skin_');
  const beaded = id.startsWith('beaded_');
  const curtain = id.startsWith('curtain');
  const door = id.includes('_door');
  const divider = id === 'room_divider';
  const h = large ? 1.91 : curtain || divider ? 1.76 : 1.52;
  const cloth = skin ? K.clothP(0xaa855e) : divider ? K.clothP(0xb2aa92) : curtain ? K.clothP(0xc3c3b4) : K.clothP(large ? 0x5a6c74 : 0x52747e);
  const support = skin || cardboard || beaded ? wood : steel;
  if (cardboard) {
    const carton = layers(K.paperP(0xaa8253), border(0x72583e), front(grid(0xb5976f, 2, 1)));
    if (door) {
      for (const x of [-.418, .418]) for (let row = 0; row < 5; row++) {
        box(p, 'packed-side-carton', [.159, .288, .255], carton, [x, row * .290, .014 * (row % 2)]);
      }
      box(p, 'header-carton', [.676, .175, .246], carton, [0, 1.45, .012]);
      const flap = p.group('folded-cardboard-hinge', { at: [-.335, .025, -.125], rotY: open ? 1.42 : 0 });
      box(p, 'door-cut-from-carton', [.663, 1.413, .041], carton, [.335, 0, 0], { parent: flap });
      box(p, 'folded-door-edge', [.055, 1.35, .047], K.paperP(0x8c6744), [.626, .044, -.012], { parent: flap });
      box(p, 'door-pull', [.088, .062, .047], K.clothP(0x65574b), [.528, .69, -.035], { parent: flap });
    } else {
      for (let row = 0; row < 6; row++) {
        const courses = row % 2 ? [[-.410, .168], [-.165, .326], [.165, .326], [.410, .168]]
          : [[-.329, .327], [0, .327], [.329, .327]];
        for (const [x, w] of courses) box(p, 'packed-wall-carton', [w, .246, .25], carton, [x, row * .248, .014 * (row % 2)]);
      }
    }
    return;
  }
  for (const x of [-.473, .473]) box(p, `support-${x}`, [.046, h, .056], support, [x, 0, .015]);
  box(p, 'top-rail', [.97, .036, .041], support, [0, h - .036, .016]);
  if (beaded) {
    for (let i = 0; i < 11; i++) {
      const x = open ? -.426 + i * .073 / 10 : -.424 + i * .0848;
      const depth = open ? -.05 + i * .009 : .01;
      const beads = layers(wood, grid(0xe0aa63, 1, 22));
      const width = open ? .035 : .081;
      box(p, `bead-strand-${i}`, [width, h - .077 - (i % 3) * .024, .034], beads, [x, .05 + (i % 3) * .024, depth]);
    }
  } else {
    const pieces = divider ? 3 : 8;
    for (let i = 0; i < pieces; i++) {
      const step = open ? .021 : .91 / pieces;
      const x = (open ? -.44 : -.455) + (i + .5) * step;
      const fold = i % 2 === 0;
      const d = curtain || open ? .065 : .037;
      box(p, `fabric-fold-${i}`, [step + .006, h - .071, d], layers(cloth, border(skin ? 0x765738 : 0x5d696a)), [x, .03, fold ? -.028 : .015]);
    }
    if (open) box(p, 'tie-back', [.19, .047, .084], darkWood, [-.356, h * .48, -.008]);
    else if (door) {
      box(p, 'flap-overlap', [.093, h - .11, .043], layers(cloth, border(0x433e35)), [0, .05, -.058]);
      box(p, 'pull-tab', [.047, .104, .022], skin ? darkWood : iron, [.039, h * .43, -.087]);
    }
  }
  if (divider) for (const x of [-.40, 0, .40]) box(p, `foot-${x}`, [.056, .038, .32], iron, [x, 0, 0]);
}

function mat(p, id) {
  const cardboard = id.startsWith('cardboard');
  const skin = id.includes('skin') || id === 'leather_tarp';
  const canvas = id === 'canvas_floor';
  const woven = id === 'fiber_mat';
  const color = cardboard ? 0xad865a : id === 'leather_tarp' ? 0x896441 : skin ? 0xa37954 : woven ? 0xbfaa67 : canvas ? 0xa4ab9e
    : id === 'plastic_groundsheet' ? 0x577998 : id === 'fema_groundsheet' ? 0x5d6350 : 0x637f62;
  const sheet = woven ? K.knitP(color) : cardboard ? K.paperP(color) : K.clothP(color);
  const w = id.startsWith('large') || canvas || cardboard ? .995 : .94;
  const paint = layers(sheet, border(shade(color, .72), 2), grid(shade(color, .88), cardboard ? 3 : 2, cardboard ? 4 : 2));
  if (id === 'cardboard_roof') {
    for (let i = 0; i < 5; i++) {
      for (const x of [-.329, 0, .329]) box(p, 'overlapping-roof-carton', [.324, .077, .226], paint, [x, i * .045, -.385 + i * .19]);
    }
    const roof = p.group('sloping-waterproof-cover', { at: [0, .17, 0], rotX: -.232 });
    box(p, 'plastic-cover', [.96, .015, .98], layers(K.plasticP(0x686f64), top(grid(0x858779, 3, 3))), [0, 0, 0], { parent: roof });
  } else {
    const h = skin || woven ? .018 : .014;
    if (id === 'cardboard_floor') box(p, 'plastic-underlay', [w, .007, w], K.plasticP(0x68766e));
    box(p, 'sheet', [w - (cardboard ? .022 : 0), h, w - (cardboard ? .022 : 0)], paint, [0, cardboard ? .007 : 0, 0]);
    if (id === 'cardboard_floor') for (const x of [-.16, .16]) {
      box(p, 'duct-tape-seam', [.028, .005, w - .024], K.clothP(0x8c948c), [x, h + .007, 0]);
    }
    if (id.includes('center_groundsheet')) {
      box(p, 'reinforced-centre-seam', [.034, .003, w - .06], sheet, [0, h, 0]);
    }
    if (!woven && !cardboard && id !== 'leather_tarp') for (const x of [-w / 2 + .04, w / 2 - .04]) {
      for (const z of [-w / 2 + .04, w / 2 - .04]) box(p, `corner-fastener-${x}-${z}`, [.027, .008, .023], skin ? darkWood : iron, [x, .011, z]);
    }
  }
}

function pile(p, id) {
  if (id === 'hay') {
    box(p, 'bale', [.89, .72, .77], straw);
    for (const x of [-.28, .25]) box(p, `bale-twine-${x}`, [.026, .729, .785], darkWood, [x, 0, 0]);
    return;
  }
  if (id.startsWith('boulder')) {
    const medium = id.includes('medium');
    K.lump(p, 'chalk-streaked-rock', medium ? [.43, .35, .43] : [.34, .24, .32], layers(concrete, cracks(id, 0xc9ccbb, 8)), id);
    return;
  }
  const dirt = id.startsWith('dirtmound');
  const h = id.endsWith('_tall') ? 2.19 : id.endsWith('_pile') && dirt ? 1.36 : dirt ? .49 : id === 'ash' ? .09 : .34;
  const color = id === 'ash' ? 0x79776f : id === 'rubble_volc' ? 0xa7a9a0 : id === 'wreckage' ? 0x626d70 : id === 'leaves_pile' ? 0xa16d3c : id === 'woodchips' ? 0xa98456 : 0x786041;
  const paint = K.stoneP(color);
  if (dirt && h > 1) {
    const points = [];
    for (const [y, radius] of [[0, .465], [h * .23, .461], [h * .71, .32], [h * .94, .196]]) {
      for (let i = 0; i < 8; i++) {
        const angle = (i + p.r() * .38) * Math.PI / 4;
        const r = radius * (.83 + p.r() * .18);
        points.push(K.V(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
    }
    points.push(K.V(-.043, h, .016));
    K.hull(p, 'heaped-earth', points, paint);
    return;
  }
  if (id === 'rubble_landfill') {
    K.pile(p, 'trash-and-dirt', .46, .40, paint, id);
    K.lump(p, 'grass-cap', [.22, .055, .185], K.stoneP(0x687d45), id, {}, [0, .26, .015]);
  } else if (id !== 'wreckage') K.pile(p, 'mound', .45, h, paint, id);
  if (!dirt && id !== 'ash') {
    for (let i = 0; i < 9; i++) {
      const a = i * 2.39996;
      const r = i % 2 ? .38 : .25;
      const x = r * Math.cos(a), z = r * Math.sin(a);
      if (id === 'wreckage') {
        const scrap = p.group('bent-sheet-metal', { at: [x * .62, .039 + Math.floor(i / 3) * .074, z * .62], rotY: a, rotZ: (i % 3 - 1) * .26 });
        const metal = i % 2 ? K.steelP(0x784f3b) : steel;
        box(p, 'panel-offcut', [.255 + i % 3 * .04, .035, .194], metal, [0, 0, 0], { parent: scrap });
        const fold = p.group('torn-fold', { parent: scrap, at: [0, .008, .089], rotX: -.65 });
        box(p, 'folded-edge', [.224, .029, .108], metal, [0, 0, .042], { parent: fold });
        if (i < 3) box(p, 'scrap-underlayer', [.235, .069, .125], iron, [x * .45, 0, z * .48]);
      } else {
        const detail = id === 'rubble_landfill' ? K.stoneP([0x526341, 0x665c4a, 0x9a9281][i % 3]) : paint;
        K.lump(p, `debris-${i}`, [.075, .036 + (i % 3) * .013, .069], detail, `${id}-${i}`, {}, [x, 0, z]);
      }
    }
  }
}

function stack(p, id) {
  const pallet = id.startsWith('pallet');
  const tall = id.endsWith('_tall');
  const mid = id.endsWith('_mid');
  const plank = id.includes('plank');
  const brick = id.includes('brick') || id.includes('adobe');
  const metal = id.includes('pipe') || id.includes('rebar');
  const cement = id === 'pallet_cement';
  const pipe = id.startsWith('pipe');
  const h = tall ? 2.11 : mid ? 1.34 : pallet ? .82 : .51;
  const courses = tall ? 9 : mid ? 6 : 3;
  const y0 = pallet ? .14 : 0;
  const course = (h - y0) / courses;
  const paint = cement ? K.paperP(0xaeb0a3) : id.includes('adobe') ? K.stoneP(0xb28962) : brick ? K.stoneP(0xa45a4c) : metal ? steel : wood;
  if (pallet) {
    for (const x of [-.36, 0, .36]) box(p, `runner-${x}`, [.12, .105, .89], darkWood, [x, 0, 0]);
    box(p, 'pallet-top', [.96, .035, .92], wood, [0, .105, 0]);
  }
  for (let row = 0; row < courses; row++) {
    const y = y0 + row * course;
    if (plank || brick || cement) {
      for (const x of [-.32, 0, .32]) {
        for (const z of brick || cement ? [-.22, .22] : [0]) {
          const w = brick || cement ? .312 : .30;
          box(p, `course-${row}-${x}-${z}`, [w, course - .009, brick || cement ? .421 : .94], paint, [x, y, z]);
        }
      }
    } else for (const x of [-.33, -.11, .11, .33]) {
      const r = Math.min(course / 2 + .001, .115);
      if (pipe) {
        // Six faces keep the largest stack within the furniture triangle budget.
        hollowTube(p, 'open-ended-pipe', 'z', [x, y + r, row % 2 ? .018 : -.015], r, r * .72, .90, steel, 6);
        continue;
      }
      const end = metal ? layers(iron, border(0xb9c2c4, 2)) : K.woodP(0xc59c66);
      const bundle = id.includes('rebar');
      cyl(p, `bundle-${row}-${x}`, 'z', [x, y + r, row % 2 ? .018 : -.015], r, .9,
        sides(['end-1', 'end1'], end, bundle ? layers(paint, grid(0x586269, 15, 3)) : paint),
        undefined, bundle ? 6 : 8);
      if (id.includes('rebar')) {
        for (const s of [-1, 1]) box(p, `bundle-band-${row}-${x}-${s}`, [.16, .035, .028], iron, [x, y + r * 1.68, s * .25]);
      }
    }
  }
  if (pallet) {
    const wrap = sides(['front', 'back', 'left', 'right'], layers(flat(0xd0dacf), grid(0xa0ad9e, 1, 8)), flat(0xe0e7db));
    box(p, 'stretch-wrap', [.962, h - y0, .909], wrap, [0, y0, 0], { glass: true });
  }
  if (pallet || id === 'stack_plank') for (const x of [-.29, .29]) {
    const strap = pallet ? K.plasticP(0x7c8378) : K.clothP(0x614b37);
    for (const z of [-.449, .449]) box(p, `packaging-${x}-${z}`, [.042, h - y0, .023], strap, [x, y0, z]);
    box(p, `top-strap-${x}`, [.046, .019, .93], strap, [x, h - .002, 0]);
  }
}

function mycelium(p, id) {
  const mass = id === 'fungal_mass';
  const tangle = id === 'fungal_tangle';
  const count = mass ? 13 : tangle ? 14 : 10;
  const shade = mass ? 0x736e63 : tangle ? 0xa69a87 : 0xaaa391;
  const cord = K.stoneP(shade);
  K.crumple(p, 'mycelial-mat', mass ? .469 : .35, mass ? .469 : .35, mass ? .062 : .14, cord, id);
  for (let i = 0; i < count; i++) {
    const t = i * 2.39996;
    const y = mass ? .06 + p.r() * .055 : (tangle ? .96 : .47) * (.52 + p.r() * .49);
    const r = mass ? .44 : .34;
    hoop(p, 'intertwined-fungal-strand', [
      [Math.cos(t) * r, .026, Math.sin(t) * r],
      [Math.cos(t + .38) * r * .70, y * .61, Math.sin(t + .38) * r * .73],
      [Math.cos(t + 1.17) * r * .56, y, Math.sin(t + 1.17) * r * .58],
      [Math.cos(t + 2.15) * r * .87, y * (mass ? .53 : .81), Math.sin(t + 2.15) * r * .85],
    ], mass ? .036 : .029 + .017 * p.r(), cord);
  }
}

const flowerShapes = {
  asparagus_wild: [0x94a769, .63, .035, 8, 'shoot'],
  burdock: [0x8a547c, .72, .088, 5, 'thistle'],
  carrot_wild: [0xe4e3ce, .55, .10, 5, 'umbrella'],
  chicory: [0x6c8dc7, .52, .08, 5, 'daisy'],
  datura: [0xe6e2cd, .57, .095, 3, 'trumpet'],
  dogbane: [0xdcbfb9, .73, .037, 7, 'spike'],
  fireweed: [0xb65b91, .87, .062, 6, 'raceme'],
  jerusalem_artichoke: [0xdcab38, 1.13, .105, 4, 'sun'],
  maianthemum_stellatum: [0xede7d0, .31, .040, 7, 'star'],
  mustard: [0xe7c343, .63, .047, 7, 'raceme'],
  mutpoppy: [0xc44755, .55, .106, 4, 'trumpet'],
  salsify: [0xa36db2, .68, .073, 4, 'daisy'],
  selfheal: [0x89529c, .29, .042, 6, 'spike'],
  sunflower: [0xe7b93d, 1.34, .142, 3, 'sun'],
  thistle: [0xa46c9c, .56, .054, 4, 'thistle'],
  wild_rice: [0xc6b274, .84, .033, 8, 'shoot'],
  wild_sarsaparilla: [0xd5c5a0, .43, .055, 5, 'umbrella'],
  wintergreen: [0xa84447, .21, .031, 8, 'berry'],
  flower_fungal: [0x9c9b8d, .52, .071, 4, 'thistle'],
  flower_marloss: [0x68c0c6, .51, .069, 5, 'thistle'],
  plant_harvest: [0xb9a74c, .57, .048, 5, 'berry'],
  plant_mature: [0x8f9c51, .45, .045, 5, 'shoot'],
  plant_unharvested_overgrown: [0xa68b50, .68, .037, 9, 'shoot'],
  planter_harvest: [0xc08a54, .54, .047, 5, 'berry'],
  planter_unharvested_overgrown: [0x9a8146, .41, .04, 10, 'shoot'],
};

function plant(p, id) {
  if (id.startsWith('fungal_')) return mycelium(p, id);
  const planter = id.startsWith('planter');
  const planted = planter || id.startsWith('plant_');
  const fungus = id.includes('fungal') || id.includes('marloss');
  const base = planter ? .24 : planted ? .04 : 0;
  if (planter) {
    tray(p, 'slatted-planter', [.84, .25, .73], layers(wood, grid(0x513921, 6, 3)));
    box(p, 'planter-soil', [.765, .04, .655], K.stoneP(0x61503a), [0, .20, 0]);
  } else if (planted) {
    K.pile(p, 'disturbed-soil', id.includes('overgrown') ? .40 : .23, .06, K.stoneP(0x6c573c), id);
  }
  if (id === 'mutpoppy') {
    K.pile(p, 'stirred-soil', .24, .085, K.stoneP(0x6a5741), id);
    for (let i = 0; i < 5; i++) {
      const a = i * 2.39996;
      const x = Math.cos(a), z = Math.sin(a);
      hoop(p, 'exposed-twisted-root', [[0, .041, 0], [x * .12, .074, z * .10], [x * .20 + .034, .039, z * .18], [x * .274, .012, z * .26]], .020, K.barkP(0x7b4c47));
    }
  }
  if (id === 'planter') return;
  if (id.endsWith('_seed')) {
    for (const x of [-.12, 0, .12]) box(p, `seed-${x}`, [.028, .018, .034], straw, [x, base, 0]);
    return;
  }
  if (id === 'lilypad') {
    for (const [i, x] of [-.26, .02, .22].entries()) {
      const paint = K.knitP(i === 1 ? 0x6f8950 : 0x526e48);
      const pt = (dx, z) => K.V(x + dx, .0155, z);
      const centre = pt(-.035, 0);
      const edge = [pt(.06, -.02), pt(.13, -.09), pt(.03, -.15), pt(-.10, -.10), pt(-.13, .055), pt(0, .11), pt(.12, .065)];
      for (let k = 0; k < edge.length - 1; k++) {
        K.pane(p, 'notched-leaf-facet', [centre, edge[k], edge[k + 1]], .031, paint);
      }
    }
    return;
  }
  if (id === 'stook_full') {
    for (const s of [-1, 1]) for (const x of [-.29, -.10, .10, .29]) {
      K.tube(p, `sheaf-${s}-${x}`, K.V(x, .031, s * .33), K.V(x * .69, .83, s * .029), .085, .047, 5, straw);
    }
    return;
  }
  const [color, height, radius, count, type] = flowerShapes[id];
  const r = p.r;
  const petals = K.clothP(color);
  const wilted = id === 'planter_unharvested_overgrown';
  const foliage = fungus ? K.clothP(0x898a7c) : K.clothP(wilted ? 0x837647
    : id === 'wild_sarsaparilla' ? 0x9b5b35 : id === 'wintergreen' ? 0x496943 : 0x517642);
  for (let i = 0; i < count; i++) {
    const a = i * 2.39996;
    const spread = i ? (wilted ? .30 : id.includes('overgrown') ? .24 : planted ? .18 : .21) * (.4 + r()) : 0;
    const x = Math.cos(a) * spread;
    const z = Math.sin(a) * spread;
    const h = height * (i ? .54 + .39 * r() : 1);
    const stem = fungus ? .024 : .012 + radius * .065;
    K.tube(p, `stem-${i}`, K.V(x * .60, base + .002, z * .60), K.V(x, base + h, z), stem, stem * .61, 4, foliage);
    if (fungus) hoop(p, 'fungal-tendril', [[x * .59, .015, z * .60], [x * .73 + .028, h * .3, z * .75],
      [x * .85 - .021, h * .63, z * .86 + .036], [x + radius * .70, h * .91, z + .024]], .015, K.stoneP(0x77776f));
    for (const s of [-1, 1]) {
      const t = s > 0 ? .55 : .32;
      const leaf = p.group(`leaf-${i}-${s}`, { at: [x * (.60 + .40 * t), base + h * t, z * (.60 + .40 * t)],
        rotY: a + s * 1.18, rotZ: wilted ? -s * .87 : s * .31 });
      const broad = type === 'sun' || type === 'berry' || id === 'burdock';
      const w = broad ? Math.min(.249, .12 + radius) : Math.min(.145, .043 + radius * .91);
      const depth = w * (broad ? .44 : .23);
      K.pane(p, 'pointed-leaf', [K.V(0, 0, 0), K.V(s * w * .43, .01, -depth),
        K.V(s * w, .03, 0), K.V(s * w * .47, .01, depth)], .012, foliage, { parent: leaf });
    }
    if (type === 'sun') {
      const face = p.group('flower-disc', { at: [x, base + h, z], rotX: -.28, rotY: i * .19 - .19 });
      for (let k = 0; k < 9; k++) {
        const angle = k * Math.PI * 2 / 9;
        const petal = p.group('ray-petal', { parent: face, rotZ: angle });
        box(p, 'yellow-petal', [radius * .33, radius * .47, .019], petals, [0, radius * .66, 0], { parent: petal });
      }
      K.cyl(p, 'seed-head', 'z', [0, 0, 0], radius * .71, .042, 10,
        K.stoneP(id === 'sunflower' ? 0x493b31 : 0x826844), { parent: face });
    } else if (type === 'star' || type === 'daisy' || type === 'umbrella') {
      for (let petal = 0; petal < 5; petal++) {
        const b = petal * 2 * Math.PI / 5;
        const leaf = p.group(`petal-${i}-${petal}`, { at: [x + Math.cos(b) * radius * .54, base + h, z + Math.sin(b) * radius * .54], rotY: -b });
        box(p, 'petal', [radius * .80, .015, radius * .43], petals, [0, 0, 0], { parent: leaf });
      }
      cyl(p, `flower-centre-${i}`, 'y', [x, base + h + .012, z], radius * .34, .025, straw, undefined, 6);
    } else if (type === 'raceme') {
      const levels = i % 2 + 3;
      for (let k = 0; k < levels; k++) {
        const angle = k * 2.39 + a;
        const y = base + h - radius * 1.27 * k;
        const dx = Math.cos(angle) * radius * .50, dz = Math.sin(angle) * radius * .50;
        box(p, 'raceme-blossom', [radius * .69, radius * .55, radius * .55], petals, [x + dx, y, z + dz]);
      }
    } else if (type === 'trumpet') {
      const y = base + h;
      cyl(p, 'narrow-flower-tube', 'y', [x, y, z], radius * .22, radius * .70, petals, radius * .4, 6);
      for (let k = 0; k < 6; k++) {
        const sector = p.group('trumpet-petal', { at: [x, y + radius * .30, z], rotY: k * Math.PI / 3 });
        K.pane(p, 'flared-petal', [K.V(-radius * .18, 0, radius * .28), K.V(radius * .18, 0, radius * .28),
          K.V(radius * .49, radius * .43, radius * 1.12), K.V(-radius * .49, radius * .43, radius * 1.12)], .012, petals, { parent: sector });
      }
    } else {
      const size = type === 'shoot' || type === 'spike' ? radius * 2.9 : radius * .84;
      const berry = type === 'berry';
      cyl(p, `flower-head-${i}`, 'y', [x, base + h + size * .29, z], radius, size,
        petals, berry ? radius * .91 : radius * .53, 6);
      if (type === 'thistle' && !fungus) for (let k = 0; k < 4; k++) {
        const g = p.group('bristly-flower', { at: [x, base + h, z], rotY: k * Math.PI / 2, rotZ: .28 });
        box(p, 'bristled-bract', [.017, radius * .83, radius * .49], k % 2 ? petals : foliage, [0, .006, radius * .88], { parent: g });
      }
    }
    if (id === 'maianthemum_stellatum' && i % 2 === 0) {
      box(p, 'crimson-berry-cluster', [.043, .024, .032], K.plasticP(0x9c3e49), [x + .014, h - .055, z -.012]);
    }
  }
}

function roof(p, id) {
  if (id === 'chimney') {
    const brick = masonry(id, { brick: 0xa36351, mortar: 0xb0a293, rows: 7, cols: 3,
      tones: [0x955140, 0xae6a53, 0x9d5847] });
    const soot = masonry(`${id}-flue`, { brick: 0x302a27, mortar: 0x413631, rows: 7, cols: 2,
      tones: [0x282525, 0x3b302b] });
    const cap = K.stoneP(0xafada2);
    const clay = K.stoneP(0x91624d);
    const burntClay = K.stoneP(0x4f3830);

    // Build the stack, flashing, crown and clay liner as four walls around the same bore.
    // There is no base, lid or atlas decal over the opening.
    const flue = (name, width, depth, base, rise, outside, inside, rim = outside) => {
      const opening = .302;
      const tx = (width - opening) / 2;
      const tz = (depth - opening) / 2;
      for (const s of [-1, 1]) {
        const wallFinish = (face) => sides([face], inside, sides(['top'], rim, outside));
        box(p, `${name}-end-${s}`, [width, rise, tz], wallFinish(s < 0 ? 'back' : 'front'),
          [0, base, s * (depth - tz) / 2], { ppm: 96 });
        box(p, `${name}-side-${s}`, [tx, rise, opening], wallFinish(s < 0 ? 'right' : 'left'),
          [s * (width - tx) / 2, base, 0], { ppm: 96 });
      }
    };
    flue('roof-flashing', .714, .687, 0, .030, iron, soot);
    flue('brick-stack', .559, .534, .03, .578, brick, soot);
    flue('overhanging-crown', .647, .621, .608, .066, cap, soot);
    flue('raised-clay-flue', .376, .376, .674, .071, clay, soot, burntClay);
    return;
  }
  if (id === 'roof_turbine_vent') {
    box(p, 'flashing', [.55, .055, .55], steel);
    cyl(p, 'duct', 'y', [0, .19, 0], .17, .27, iron);
    for (let i = 0; i < 9; i++) {
      const a = i * Math.PI * 2 / 9;
      const g = p.group(`turbine-vane-${i}`, { at: [Math.cos(a) * .205, .27, Math.sin(a) * .205], rotY: -a, rotZ: .11 });
      box(p, 'vane', [.078, .21, .135], steel, [0, 0, 0], { parent: g });
    }
    cyl(p, 'crown', 'y', [0, .5, 0], .216, .053, chrome, .17);
    return;
  }
  if (id === 'solar_unit_v2' || id === 'satellite') {
    const solar = id === 'solar_unit_v2';
    box(p, 'mounting-foot', [.48, .068, .49], iron);
    cyl(p, 'mast', 'y', [0, .24, 0], .05, .39, steel);
    const bracket = p.group('tilt-mount', { at: [0, .50, 0], rotX: solar ? -.44 : .51 });
    if (solar) {
      box(p, 'frame', [.94, .054, .79], chrome, [0, 0, 0], { parent: bracket });
      box(p, 'mono-crystalline-cells', [.902, .012, .752], layers(flat(0x263b62), grid(0x889fac, 8, 7), border(0xa2b1b8)), [0, .054, 0], { parent: bracket });
    } else {
      box(p, 'mast-to-dish-coupling', [.092, .086, .092], steel, [0, .419, 0]);
      dish(p, 'parabolic-dish', .455, .137, cream, bracket);
      box(p, 'feed-arm', [.042, .37, .045], chrome, [0, -.01, 0], { parent: bracket });
      box(p, 'receiver', [.13, .061, .094], iron, [0, .36, 0], { parent: bracket });
    }
    return;
  }
  box(p, 'mounting-plate', [.36, .065, .38], iron);
  const y = id === 'cellphone_booster' ? 1.16 : .76;
  cyl(p, 'antenna-mast', 'y', [0, y / 2, 0], .025, y, chrome);
  if (id === 'TV_antenna') {
    box(p, 'boom', [.037, .035, .93], iron, [0, y - .06, 0]);
    for (let i = 0; i < 7; i++) cyl(p, `cross-element-${i}`, 'x', [0, y - .035, -.405 + i * .132], .008, .82 - i * .073, chrome, undefined, 6);
  } else if (id === 'cellphone_booster') {
    box(p, 'signal-panel', [.26, .42, .097], cream, [0, y - .31, -.046]);
    box(p, 'junction', [.18, .26, .135], steel, [0, .18, .02]);
  } else {
    box(p, 'wind-pointer', [.046, .039, .73], steel, [0, y - .032, 0]);
    K.pane(p, 'tail-fin', [K.V(0, y - .008, .14), K.V(0, y - .008, .36), K.V(0, y + .17, .36)], .02, iron);
    for (const a of [0, Math.PI / 2]) {
      const compass = p.group(`compass-${a}`, { at: [0, y - .17, 0], rotY: a });
      box(p, 'axis', [.54, .02, .018], chrome, [0, 0, 0], { parent: compass });
    }
  }
}

function streets(p, id) {
  if (id === 'bike_rack') {
    for (const x of [-.34, .34]) box(p, 'anchor-plate', [.15, .027, .16], steel, [x, 0, 0]);
    hoop(p, 'inverted-U', [[-.34, .025, 0], [-.34, .66, 0], [-.299, .738, 0], [-.223, .775, 0],
      [.223, .775, 0], [.299, .738, 0], [.34, .66, 0], [.34, .025, 0]], .037, chrome);
    return;
  }
  if (id === 'rotary_clothesline') {
    cyl(p, 'pole', 'y', [0, .85, 0], .035, 1.7, steel);
    box(p, 'footing', [.24, .06, .23], concrete);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      const arm = p.group(`arm-${i}`, { at: [0, 1.65, 0], rotY: a + Math.PI / 4 });
      box(p, 'frame', [.035, .042, .63], chrome, [0, 0, .31], { parent: arm });
      for (const r of [.21, .39, .57]) {
        K.tube(p, `line-${i}-${r}`, K.V(Math.cos(a + Math.PI / 4) * r, 1.688, Math.sin(a + Math.PI / 4) * r),
          K.V(Math.cos(a + Math.PI * .75) * r, 1.688, Math.sin(a + Math.PI * .75) * r), .006, .006, 4, cream);
      }
    }
    return;
  }
  const traffic = id === 'traffic_light';
  const utility = id === 'utility_pole';
  const indoor = id.startsWith('indoor');
  const wooden = id.includes('wooden') || utility;
  const h = traffic ? 3.38 : utility ? 5.7 : indoor ? 2.5 : wooden ? 5 : 6;
  const radius = utility ? .114 : traffic ? .064 : indoor ? .026 : .041;
  cyl(p, 'pole', 'y', [0, h / 2, 0], radius, h, wooden ? K.barkP(0x795b40) : steel, radius * .65);
  if (traffic) {
    box(p, 'mounting-arm', [.45, .045, .11], iron, [.20, 2.91, 0]);
    box(p, 'signal-housing', [.27, .70, .23], K.steelP(0x776437), [.30, 2.47, -.025]);
    for (const [i, color] of [0x80322d, 0xa88937, 0x3f704d].entries()) {
      const y = 3.03 - i * .20;
      cyl(p, `signal-lens-${i}`, 'z', [.30, y, -.155], .065, .035, flat(color));
      box(p, `lens-hood-${i}`, [.18, .035, .14], black, [.30, y + .062, -.18]);
    }
  } else if (utility) {
    box(p, 'crossarm', [.93, .087, .10], wood, [0, h - .47, 0]);
    for (const x of [-.395, 0, .395]) cyl(p, `insulator-${x}`, 'y', [x, h - .33, 0], .044, .13, cream);
  } else {
    if (indoor) cyl(p, 'weighted-base', 'y', [0, .035, 0], .22, .07, wooden ? darkWood : iron);
    cyl(p, 'finial', 'y', [0, h - .025, 0], .045, .05, brass, .02);
    box(p, 'halyard', [.012, h - .25, .012], K.clothP(0xb7af93), [.048, .22, 0]);
  }
}

function sign(p, id) {
  const warning = id === 'sign_warning';
  const board = id.startsWith('board_map');
  const paint = board ? steel : wood;
  const y = board ? .94 : .99;
  for (const x of warning ? [0] : [-.31, .31]) box(p, `post-${x}`, [.05, y + .30, .064], paint, [x, 0, .04]);
  if (warning) {
    K.pane(p, 'red-outline', [K.V(-.29, y, 0), K.V(.29, y, 0), K.V(0, y + .50, 0)], .025, flat(0xa5423f));
    K.pane(p, 'white-triangle', [K.V(-.22, y + .047, -.017), K.V(.22, y + .047, -.017), K.V(0, y + .43, -.017)], .01, cream);
    box(p, 'warning-mark', [.035, .13, .012], black, [0, y + .154, -.027]);
    box(p, 'warning-dot', [.035, .035, .012], black, [0, y + .092, -.027]);
  } else {
    const face = board
      ? layers(K.paperP(0xc7caaa), grid(0x969b84, 6, 4), cracks(id, 0x6d9278, 12))
      : layers(K.stoneP(0x9e7953), border(0x60422e, 2));
    box(p, 'frame', [.83, .60, .063], paint, [0, y, 0]);
    box(p, 'notice-surface', [.75, .51, .012], face, [0, y + .046, -.037]);
    if (!board) for (const [i, x] of [-.21, -.01, .22].entries()) {
      box(p, `notice-${i}`, [.14, .22, .004], K.printP(i % 2 ? 0xdbd6b6 : 0xe3e0d3), [x, y + .15 + i * .043, -.046]);
    }
    if (board && !id.endsWith('_b')) {
      box(p, 'protective-glass', [.75, .51, .019], pane, [0, y + .046, -.048], K.GLASS);
      cyl(p, 'map-panel-lock', 'z', [.39, y + .284, -.041], .022, .031, brass, undefined, 6);
    }
    if (board && id.endsWith('_b')) K.pane(p, 'glass-remnant', [K.V(.15, y + .047, -.047), K.V(.375, y + .047, -.047), K.V(.375, y + .29, -.047)], .01, pane, K.GLASS);
  }
}

function sculpture(p, id) {
  if (id === 'slab' || id === 'grave_head') {
    const upright = id === 'grave_head';
    if (upright) {
      box(p, 'plinth', [.59, .10, .40], concrete);
      K.bevel(p, 'headstone', [-.25, .1, -.094, .25, .79, .105], .035, layers(concrete, front(K.printP(0x8e918a, 0x5d625d))));
    } else K.bevel(p, 'stone-slab', [-.44, 0, -.34, .44, .25, .34], .027, concrete);
    return;
  }
  if (id === 'birdbath' || id === 'gazing_ball') {
    const bath = id === 'birdbath';
    cyl(p, 'plinth', 'y', [0, .05, 0], .237, .10, concrete, .20);
    cyl(p, 'pedestal', 'y', [0, .34, 0], .112, .48, concrete, .081);
    if (bath) {
      cyl(p, 'bowl-underside', 'y', [0, .65, 0], .15, .14, concrete, .32);
      hollowTube(p, 'raised-stone-rim', 'y', [0, .732, 0], .319, .271, .047, concrete, 10);
      cyl(p, 'rainwater', 'y', [0, .724, 0], .274, .012, flat(0x72938b), undefined, 10);
    } else K.blob(p, 'mirrored-globe', [.228, .228, .228], [0, .787, 0], glass(0xa8bcc4), K.STEEL, 5, 10);
    return;
  }
  if (id === 'bigmirror_b' || id === 'styling_station') {
    const salon = id === 'styling_station';
    const width = salon ? .79 : .56;
    const y = salon ? .87 : .08;
    const h = salon ? .85 : 1.66;
    if (salon) {
      casework(p, .90, .81, .46, cream, [0, .29, .58]);
      box(p, 'countertop', [.95, .06, .51], wood, [0, .81, 0]);
    } else {
      for (const x of [-.21, .21]) box(p, `foot-${x}`, [.066, .08, .37], steel, [x, 0, 0]);
    }
    for (const x of [-(width - .04) / 2, (width - .04) / 2]) box(p, `frame-side-${x}`, [.04, h, .052], chrome, [x, y, .18]);
    for (const k of [0, h - .045]) box(p, `frame-end-${k}`, [width, .045, .052], chrome, [0, y + k, .18]);
    if (salon) box(p, 'mirror', [width - .069, h - .068, .012], glass(0xbacdd5), [0, y + .034, .158]);
    else for (const x of [-width / 2 + .04, width / 2 - .04]) {
      K.pane(p, `mirror-shard-${x}`, [K.V(x, y + .043, .156), K.V(-x * .33, y + .043, .156),
        K.V(x, y + (x < 0 ? .92 : .49), .156)], .008, glass(0xbacdd5), K.GLASS);
    }
    return;
  }
  if (id === 'sand_castle') {
    const sand = K.stoneP(0xc5ad75);
    K.pile(p, 'packed-sand', .4, .16, sand, id);
    box(p, 'keep', [.38, .27, .38], sand, [0, .08, 0]);
    for (const x of [-.24, .24]) for (const z of [-.22, .22]) {
      cyl(p, `turret-${x}-${z}`, 'y', [x, .145, z], .09, .29, sand);
      cyl(p, `turret-top-${x}-${z}`, 'y', [x, .31, z], .108, .056, sand);
    }
    box(p, 'gate', [.092, .103, .009], K.stoneP(0x8e7e51), [0, .115, -.194]);
    return;
  }
  const mannequin = id === 'mannequin';
  const memorial = id === 'grave_monument';
  const rise = mannequin ? .054 : memorial ? .32 : .26;
  const material = mannequin ? K.woodP(0xb38a59) : K.stoneP(0x82857c);
  box(p, 'plinth', [mannequin ? .42 : .64, rise, mannequin ? .37 : .51], mannequin ? darkWood : concrete);
  for (const s of [-1, 1]) {
    box(p, `foot-${s}`, [.112, .09, .21], material, [s * .099, rise, -.032]);
    box(p, `leg-${s}`, [.122, .69, .14], material, [s * .095, rise + .081, .008]);
    const arm = p.group(`arm-${s}`, { at: [s * .187, rise + 1.22, .02], rotZ: s * (mannequin ? .20 : .33) });
    box(p, 'arm', [.092, .48, .109], material, [0, -.43, 0], { parent: arm });
  }
  K.bevel(p, 'torso', [-.193, rise + .73, -.10, .193, rise + 1.24, .12], .034, material);
  box(p, 'neck', [.09, .084, .10], material, [0, rise + 1.24, .01]);
  K.bevel(p, 'head', [-.11, rise + 1.316, -.105, .11, rise + 1.55, .104], .026, material);
  if (memorial) box(p, 'engraved-plaque', [.39, .156, .02], layers(brass, front(K.printP(0x9d865d, 0x554c37))), [0, .08, -.26]);
}

function game(p, id) {
  if (id.startsWith('archery') || id === 'target') {
    if (id === 'target') {
      box(p, 'foot', [.52, .056, .37], iron);
      hoop(p, 'target-pipe-frame', [[-.204, .039, .044], [-.204, 1.10, .044],
        [-.147, 1.295, .044], [.147, 1.295, .044], [.204, 1.10, .044], [.204, .039, .044]], .023, chrome);
      const paint = layers(K.steelP(0x626d65), cracks('chipped-silhouette', 0x333d39, 9));
      const z = -.012;
      const silhouette = [[-.119, .65], [.119, .65], [.216, 1.13], [.134, 1.27], [-.134, 1.27], [-.216, 1.13]];
      K.hull(p, 'silhouette-torso', silhouette.flatMap(([x, y]) => [K.V(x, y, z - .015), K.V(x, y, z + .015)]), paint);
      box(p, 'neck', [.10, .096, .031], iron, [0, 1.244, z]);
      K.bevel(p, 'silhouette-head', [-.093, 1.322, z - .017, .093, 1.53, z + .017], .012, paint);
      for (const [y, r] of [[1.013, .144], [1.431, .061]]) {
        for (const [i, f] of [1, .72, .47, .23].entries()) {
          cyl(p, 'painted-bullseye-ring', 'z', [0, y, -.028 - i * .0009], r * f, .0014,
            flat(i % 2 ? 0x9d6a52 : 0xc5b795), undefined, 10);
        }
      }
      for (const [x, y] of [[-.163, 1.142], [.104, 1.2], [.098, .953], [-.081, .857], [.05, 1.476], [-.024, 1.407]]) {
        cyl(p, 'impact-dent', 'z', [x, y, -.034], .012, .006, black, undefined, 5);
      }
    } else {
      const hay = id.endsWith('bale');
      box(p, 'target-block', [.77, .79, .52], hay ? straw : K.paperP(0xad8555));
      for (const [i, r] of [.262, .205, .146, .087, .042].entries()) {
        cyl(p, `scoring-ring-${i}`, 'z', [0, .43, -.264 - i * .007], r, .009, flat([0xe2ddc8, 0x394247, 0x557b9b, 0xae4946, 0xe8c05b][i]), undefined, 12);
      }
    }
    return;
  }
  if (id === 'arcade_machine' || id === 'pinball_machine') {
    const pinball = id.startsWith('pinball');
    const red = K.steelP(pinball ? 0x943949 : 0x52746a);
    if (pinball) {
      legs(p, .64, .88, .69, chrome, .051);
      box(p, 'cabinet', [.65, .25, .91], red, [0, .69, 0]);
      box(p, 'playfield', [.58, .024, .75], layers(flat(0x42706c), grid(0x8fba9a, 5, 6)), [0, .94, -.05]);
      for (const x of [-.16, .16]) cyl(p, `bumper-${x}`, 'y', [x, .981, .12], .051, .064, brass);
      for (const [x, z, side] of [[-.098, -.27, 1], [.098, -.27, -1]]) {
        const flipper = p.group('flipper', { at: [x, .973, z], rotY: side * .37 });
        box(p, 'flipper-paddle', [.123, .026, .046], cream, [0, 0, 0], { parent: flipper });
      }
      hoop(p, 'wire-ball-track', [[-.23, .966, .015], [-.25, .984, .22], [-.21, .992, .289], [-.102, .979, .298]], .012, chrome);
      box(p, 'glass-cover', [.61, .016, .78], pane, [0, 1.029, -.05], K.GLASS);
      box(p, 'backbox', [.66, .39, .13], red, [0, .94, .39]);
      panel(p, 'scoreboard', .54, .19, 1.06, .315, 0x70516e);
    } else {
      const sideArt = sides(['left', 'right'], layers(K.clothP(0x597c74), cracks('arcade-scuffs', 0x2d4d48, 9), (ctx, x, y, w, h) => {
        for (let i = 0; i < w; i++) {
          const offset = Math.round(i * .48);
          fill(ctx, x + i, y + h * .46 - offset, 1, Math.max(2, h * .10), 0xc77845);
          fill(ctx, x + i, y + h * .57 - offset, 1, Math.max(2, h * .05), 0xe2bc6b);
        }
      }), red);
      box(p, 'lower-cabinet', [.68, .84, .62], sideArt);
      box(p, 'upper-cabinet', [.68, .88, .48], red, [0, .84, .06]);
      panel(p, 'arcade-screen', .51, .38, 1.056, -.189, 0x4d5d69);
      box(p, 'marquee', [.57, .135, .026], layers(K.clothP(0xa26c4a), grid(0xe4bd71, 8, 2)), [0, 1.51, -.19]);
      box(p, 'control-deck', [.67, .085, .28], iron, [0, .83, -.227]);
      cyl(p, 'joystick', 'y', [-.19, .966, -.25], .018, .103, chrome);
      cyl(p, 'joystick-cap', 'y', [-.19, 1.027, -.25], .036, .044, flat(0xbe4d47));
      for (const x of [.02, .13, .24]) cyl(p, `button-${x}`, 'y', [x, .928, -.25], .031, .024, straw);
    }
    return;
  }
  if (id === 'piano' || id === 'organ' || id === 'speaker_cabinet') {
    const speaker = id === 'speaker_cabinet';
    const organ = id === 'organ';
    if (speaker) {
      box(p, 'case', [.47, .83, .38], darkWood);
      for (const [y, r] of [[.28, .151], [.63, .111]]) {
        cyl(p, `speaker-rim-${y}`, 'z', [0, y, -.199], r + .02, .024, iron, undefined, 10);
        cyl(p, `speaker-cone-${y}`, 'z', [0, y, -.215], r, .018, K.clothP(0x4d5356), undefined, 10);
        cyl(p, `dust-cap-${y}`, 'z', [0, y, -.226], r * .35, .017, black);
      }
    } else {
      const cabinet = organ ? darkWood : K.woodP(0x39312b);
      box(p, 'body', [.97, organ ? 1.25 : 1.14, .31], cabinet, [0, 0, .196]);
      box(p, 'key-bed', [.97, .10, .26], cabinet, [0, .70, -.078]);
      for (let i = 0; i < 20; i++) {
        const x = -.443 + i * .0465;
        box(p, `ivory-key-${i}`, [.045, .025, .212], cream, [x, .80, -.073]);
        if (i % 7 !== 2 && i % 7 !== 6 && i < 19) box(p, `ebony-key-${i}`, [.025, .035, .125], black, [x + .023, .82, -.028]);
      }
      if (organ) for (let i = 0; i < 9; i++) {
        const h = .65 - Math.abs(i - 4) * .100;
        cyl(p, `organ-pipe-${i}`, 'y', [-.374 + i * .0935, 1.25 + h / 2, .15], .035, h, chrome);
      } else for (const x of [-.09, 0, .09]) box(p, `pedal-${x}`, [.047, .027, .125], brass, [x, .10, -.012]);
    }
    return;
  }
  if (id === 'dancing_pole' || id === 'punching_bag' || id === 'parkour_bars') {
    if (id === 'dancing_pole') {
      cyl(p, 'floor-flange', 'y', [0, .022, 0], .118, .044, chrome);
      cyl(p, 'pole', 'y', [0, 1, 0], .028, 2, chrome);
      cyl(p, 'ceiling-flange', 'y', [0, 1.981, 0], .115, .038, chrome);
    } else if (id === 'punching_bag') {
      box(p, 'ceiling-bracket', [.24, .052, .22], steel, [0, 1.95, 0]);
      for (let i = 0; i < 8; i++) {
        const y = 1.536 + i * .053;
        const a = i % 2 ? .024 : 0;
        const b = i % 2 ? 0 : .024;
        hoop(p, 'steel-chain-link', [[-a, y, -b], [0, y + .018, 0], [a, y, b],
          [a, y - .031, b], [0, y - .047, 0], [-a, y - .031, -b], [-a, y, -b]], .006, steel);
      }
      cyl(p, 'leather-bag', 'y', [0, 1.0, 0], .172, 1.05, K.clothP(0x594339), .153, 10);
    } else {
      legs(p, .95, .93, 1.82, K.steelP(0x507f90), .067);
      for (const x of [-.41, .41]) box(p, `overhead-rail-${x}`, [.059, .059, .90], iron, [x, 1.81, 0]);
      for (const z of [-.35, -.12, .12, .35]) cyl(p, `rung-${z}`, 'x', [0, 1.842, z], .021, .85, chrome);
      for (const y of [.48, .78, 1.08, 1.38]) {
        cyl(p, 'side-ladder-rung', 'z', [-.407, y, 0], .020, .794, steel);
      }
      hoop(p, 'diagonal-rail', [[.407, .81, -.391], [.407, 1.59, .391]], .023, steel);
    }
    return;
  }
  if (id === 'dive_block' || id === 'roulette_table' || id === 'ball_mach') {
    if (id === 'dive_block') {
      box(p, 'base', [.41, .057, .44], steel);
      box(p, 'support', [.24, .38, .24], cream, [0, .057, .025]);
      box(p, 'non-slip-platform', [.54, .09, .57], layers(K.plasticP(0x698ca4), grid(0xa2b7bc, 10, 10)), [0, .437, 0]);
    } else if (id === 'roulette_table') {
      legs(p, .93, .77, .73, darkWood, .079);
      box(p, 'felt-table', [.98, .077, .8], layers(K.clothP(0x387158), top(grid(0x7ba37b, 8, 4))), [0, .73, 0]);
      cyl(p, 'wheel-base', 'y', [-.25, .820, 0], .215, .026, darkWood, .198, 12);
      hollowTube(p, 'raised-wheel-rim', 'y', [-.25, .843, 0], .212, .181, .062, darkWood, 12);
      const slot = (i, r, y) => K.V(-.25 + Math.cos(i * Math.PI / 12) * r, y, Math.sin(i * Math.PI / 12) * r);
      for (let i = 0; i < 24; i++) {
        K.pane(p, 'colour-slot', [slot(i, .177, .847), slot(i + 1, .177, .847),
          slot(i + 1, .086, .814), slot(i, .086, .814)], .008, flat(i === 0 ? 0x518573 : i % 2 ? 0x9c4a45 : 0x393839));
      }
      cyl(p, 'brass-spindle', 'y', [-.25, .854, 0], .027, .09, brass, .015, 8);
    } else {
      box(p, 'wheeled-base', [.55, .105, .5], iron);
      box(p, 'motor-housing', [.49, .43, .37], K.steelP(0x677d56), [0, .105, .025]);
      tray(p, 'hopper', [.43, .19, .37], cream, [0, .535, .025]);
      for (const x of [-.15, .15]) cyl(p, `roller-${x}`, 'z', [x, .39, -.21], .09, .077, black);
    }
    return;
  }
  const mill = id.startsWith('treadmill');
  const mechanical = id.endsWith('mechanical');
  const weight = id === 'exercise';
  if (weight) {
    for (const x of [-.39, .39]) {
      box(p, `upright-${x}`, [.062, .93, .082], iron, [x, 0, .19]);
      box(p, `stabilizer-${x}`, [.10, .058, .42], iron, [x, 0, .17]);
      cyl(p, `weight-${x}`, 'x', [x * .87, .862, .1], .15, .073, black);
    }
    cyl(p, 'barbell', 'x', [0, .862, .1], .023, .936, chrome);
    box(p, 'bench-pedestal', [.17, .39, .47], steel);
    box(p, 'bench-pad', [.28, .079, .89], upholstery, [0, .39, -.036]);
  } else if (mill) {
    if (mechanical) {
      box(p, 'front-deck-support', [.55, .142, .10], steel, [0, 0, -.39]);
      box(p, 'rear-deck-support', [.54, .066, .11], steel, [0, 0, .389]);
    } else box(p, 'deck', [.59, .112, .98], iron);
    const deck = p.group('incline', { rotX: mechanical ? .13 : 0, at: [0, .112, 0] });
    box(p, 'running-belt', [.47, .035, .9], layers(black, grid(0x5c6465, 1, 20)), [0, 0, 0], { parent: deck });
    if (mechanical) for (const x of [-.263, .263]) {
      box(p, 'inclined-side-rail', [.058, .073, .919], steel, [x, -.018, 0], { parent: deck });
    }
    for (const x of [-.27, .27]) {
      box(p, `runner-upright-${x}`, [.046, .97, .052], steel, [x, .1, -.409]);
      box(p, `handgrip-${x}`, [.05, .048, .38], iron, [x, .97, -.23]);
    }
    panel(p, 'training-console', .42, .14, 1.04, -.41, mechanical ? 0x8c8d71 : 0x678784);
  } else {
    box(p, 'rower-rail', [.12, .12, .95], chrome, [0, .23, 0]);
    box(p, 'front-stand', [.49, .24, .12], iron, [0, 0, -.386]);
    box(p, 'rear-stand', [.34, .24, .11], iron, [0, 0, .359]);
    cyl(p, 'resistance-wheel', 'x', [0, .33, -.34], .182, .21, mechanical ? chrome : iron, undefined, 10);
    box(p, 'sliding-seat', [.31, .08, .21], upholstery, [0, .35, .18]);
    for (const x of [-.165, .165]) box(p, `foot-plate-${x}`, [.096, .038, .19], iron, [x, .28, -.183]);
    box(p, 'pull-handle', [.32, .043, .035], chrome, [0, .48, -.212]);
    if (mechanical) {
      cyl(p, 'resistance-adjuster', 'z', [0, .425, -.167], .043, .054, brass, undefined, 7);
      box(p, 'mechanical-scale', [.118, .062, .021], layers(cream, grid(0x62716b, 6, 1)), [0, .457, -.20]);
    } else {
      box(p, 'console-stem', [.03, .22, .043], iron, [0, .38, -.449]);
      panel(p, 'rower-display', .198, .095, .588, -.444, 0x697f76);
    }
  }
}

function work(p, id) {
  const machine = id.startsWith('machinery');
  const color = { bandsaw: 0x547b77, drill_press: 0x8c514b, heavy_lathe: 0x608b84, jointer: 0x746479,
    mitresaw: 0x55868d, planer: 0x9b9a86, router: 0x627e56, tablesaw: 0x9a6253,
    machinery_light: 0x555f5d, machinery_heavy: 0x697272, machinery_old: 0x825c47, machinery_electronic: 0x708283 };
  const paint = K.steelP(color[id]);
  if (machine) {
    const heavy = id.endsWith('heavy');
    const electro = id.endsWith('electronic');
    const w = heavy ? .94 : .76;
    box(p, 'workshop-base', [w, .11, .66], iron);
    box(p, 'main-housing', [w * .77, heavy ? 1.30 : .70, .58], paint, [0, .11, .045]);
    if (electro) {
      panel(p, 'instrument-display', .39, .225, .825, -.221, 0x66817d);
      box(p, 'instrument-head', [.51, .31, .28], paint, [0, .78, -.057]);
      box(p, 'vented-access', [.5, .39, .027], layers(iron, grid(0x7f9390, 3, 9)), [0, .19, -.247]);
    } else {
      cyl(p, 'motor', 'x', [0, heavy ? 1.43 : .835, .05], heavy ? .17 : .13, w * .63, paint);
      cyl(p, 'drive-wheel', 'x', [w * .33, heavy ? 1.43 : .835, .05], heavy ? .24 : .177, .067, iron);
      box(p, 'vented-cover', [w * .59, .32, .035], layers(paint, grid(id.endsWith('old') ? 0x4e3a32 : 0x3d494c, 1, 9)), [0, .23, -.253]);
    }
    return;
  }
  const press = id === 'drill_press';
  const band = id === 'bandsaw';
  const lathe = id === 'heavy_lathe';
  const h = lathe ? .83 : band || press ? .65 : .80;
  const w = lathe || id === 'jointer' ? .97 : band || press ? .59 : .74;
  const d = lathe ? .58 : .64;
  if (lathe || press) box(p, 'pedestal', [w * .79, h, d * .82], paint);
  else legs(p, w, d, h, iron, .06);
  box(p, 'machine-table', [w, .072, d], chrome, [0, h, 0]);
  if (press || band) {
    box(p, 'column', [band ? .19 : .085, .80, .13], paint, [band ? -.21 : .15, h, .175]);
    box(p, 'drive-head', [.47, .21, .38], paint, [0, h + .63, .03]);
    if (press) {
      cyl(p, 'chuck', 'y', [-.06, h + .57, -.07], .046, .12, iron);
      cyl(p, 'drill-bit', 'y', [-.06, h + .452, -.07], .011, .113, chrome);
      cyl(p, 'feed-handle', 'x', [.25, h + .69, -.12], .018, .26, chrome);
    } else box(p, 'continuous-blade', [.013, .56, .024], iron, [.10, h + .07, -.09]);
  } else if (lathe) {
    for (const x of [-.34, .35]) box(p, `headstock-${x}`, [.21, .37, .38], paint, [x, h + .071, 0]);
    cyl(p, 'chuck', 'x', [-.192, h + .29, 0], .109, .123, iron);
    cyl(p, 'tailstock', 'x', [.195, h + .29, 0], .034, .11, chrome);
    box(p, 'tool-carriage', [.21, .10, .40], iron, [0, h + .085, -.032]);
  } else if (id.endsWith('saw')) {
    const mitre = id === 'mitresaw';
    cyl(p, 'circular-blade', 'x', [.015, h + (mitre ? .23 : .06), -.065], mitre ? .166 : .129, .016, chrome, undefined, 12);
    if (mitre) {
      box(p, 'blade-guard', [.12, .145, .31], paint, [.033, h + .24, -.032]);
      cyl(p, 'rotating-base', 'y', [.026, h + .077, -.006], .253, .042, steel, undefined, 10);
      box(p, 'pivot-stanchion', [.094, .259, .079], paint, [.028, h + .101, .21]);
      for (const x of [-.018, .076]) box(p, 'sliding-arm-rail', [.027, .027, .35], chrome, [x, h + .331, .103]);
      box(p, 'blade-motor', [.133, .114, .143], paint, [.092, h + .25, .055]);
    }
    box(p, 'fence', [.043, .067, .55], iron, [-w * .27, h + .072, 0]);
  } else if (id === 'planer') {
    box(p, 'planer-head', [.48, .29, .43], paint, [0, h + .07, .04]);
    box(p, 'stock-feed', [.35, .12, .026], black, [0, h + .115, -.187]);
  } else {
    box(p, 'guide', [w * .8, .095, .035], paint, [0, h + .071, .18]);
    if (id === 'router') cyl(p, 'router-bit', 'y', [0, h + .099, 0], .026, .064, iron);
    else cyl(p, 'cutter-head', 'z', [0, h + .071, 0], .038, .39, iron);
  }
}

function ladder(p, id) {
  const aluminum = id.startsWith('aluminum');
  const paint = aluminum ? chrome : wood;
  for (const x of [-.25, .25]) for (const s of [-1, 1]) {
    K.tube(p, `ladder-rail-${x}-${s}`, K.V(x, .029, s * .34), K.V(x, 1.20, s * .038), .031, .031, 4, paint);
    box(p, `ladder-foot-${x}-${s}`, [.072, .037, .078], aluminum ? black : darkWood, [x, 0, s * .34]);
  }
  for (let i = 1; i <= 5; i++) {
    const y = i * .222;
    box(p, `rung-${i}`, [.49, .044, .09], paint, [0, y, -.34 + y * .252]);
  }
  box(p, 'top-step', [.57, .05, .24], aluminum ? K.plasticP(0xc7a043) : darkWood, [0, 1.19, 0]);
}

// Each listed ID gets its own mesh and texture atlas. Geometry is shared only at recipe level.
const families = new Map([
  [chair, `barstool barber_chair bench_park bench_wooden chair_black chair_folding chair_plywood
    chair_white deckchair logstool seat_airplane beanbag`],
  [bed, `bed_down bed_frame bunkbed bunkbed_down down_mattress floor_mattress hammock hammock_net
    makeshift_bed straw_bed triple_bunkbed`],
  [table, `metal_table tourist_table table_fancy`],
  [crate, `cardboard_box_large_reinforced chest coffin_c coffin_o crate_c crate_o foot_locker
    foot_locker_aluminum metal_crate_c metal_crate_military metal_crate_military_o metal_crate_o
    metal_crate_r pallet_belted pallet_belted_open`],
  [safe, `gun_safe_el gunsafe_c gunsafe_mj gunsafe_ml gunsafe_o safe_c safe_l safe_o`],
  [cabinet, `fireman_cabinet fireman_cabinet_b fireman_cabinet_o glass_cabinet torah_ark`],
  [display, `displaycase_b displaycase_o`],
  [rack, `clothing_rail rack_l rack_primitive`],
  [tank, `432gal_drum_rubber diesel_tank diesel_tank_smashed gas_tank gas_tank_smashed standing_tank
    storage_tank water_heater water_heater_family wood_keg`],
  [fridge, `chest_minifreezer display_freezer display_fridge freezer glass_freezer glass_fridge_double
    heavy_duty_freezer heavy_duty_fridge minifreezer minifridge`],
  [appliance, `dishwasher deep_fryer gas_oven gas_oven_microwave_combo home_furnace air_filter
    oxygen_concentrator water_purifier shredder sink_gravity eyewash`],
  [electronics, `atm atm_off balthazar_server console console_broken_table control_station server`],
  [vending, `vending_c vending_c_networked vending_c_off vending_o vending_reinforced
    vending_reinforced_networked vending_reinforced_off`],
  [generator, `12000_gasoline_generator active_backup_generator diesel_generator military_generator
    portable_generator generator_broken`],
  [compressor, `air_compressor hd_compressor_unit`],
  [hearth, `30gal_firebarrel 55gal_firebarrel brazier clay_oven fireplace fireplace_stone firering
    hobo_stove makeshift_brazier portable_stove solar_cooker woodstove`],
  [barrier, `barricade_road earthbag_half earthbag_wall gravelbag_half gravelbag_wall hesco_barrier
    hesco_wall lane sandbag_half sandbag_wall showjump showjump_end`],
  [tent, `beaded_door beaded_door_o canvas_door canvas_door_o canvas_wall cardboard_door cardboard_door_o
    cardboard_wall large_canvas_door large_canvas_door_o large_canvas_wall large_skin_door
    large_skin_door_o large_skin_wall room_divider skin_door skin_door_o skin_wall counter_gate_c
    counter_gate_o curtain curtain_open`],
  [mat, `canvas_floor cardboard_floor cardboard_roof center_groundsheet fema_groundsheet fiber_mat
    groundsheet large_groundsheet large_skin_groundsheet leather_tarp plastic_groundsheet
    skin_center_groundsheet skin_groundsheet`],
  [pile, `ash dirtmound_pile dirtmound_shallow dirtmound_tall leaves_pile rubble_landfill rubble_volc hay
    woodchips wreckage boulder_medium_volc boulder_small_volc`],
  [stack, `adobe_stack_mid adobe_stack_short adobe_stack_tall brick_stack_mid brick_stack_short
    brick_stack_tall log_stack_mid log_stack_short log_stack_tall pipe_stack_mid pipe_stack_short
    pipe_stack_tall plank_stack_mid plank_stack_short plank_stack_tall rebar_stack_mid
    rebar_stack_short rebar_stack_tall stack_plank pallet_brick pallet_brick_adobe pallet_cement`],
  [plant, `asparagus_wild burdock carrot_wild chicory datura dogbane fireweed jerusalem_artichoke lilypad
    maianthemum_stellatum mustard mutpoppy salsify selfheal sunflower thistle wild_rice
    wild_sarsaparilla wintergreen flower_fungal flower_marloss fungal_clump fungal_mass
    fungal_tangle plant_harvest plant_mature plant_seed plant_unharvested_overgrown planter
    planter_seed planter_harvest planter_unharvested_overgrown stook_full`],
  [roof, `cellphone_booster chimney roof_turbine_vent TV_antenna wind_vane satellite solar_unit_v2`],
  [streets, `bike_rack flagpole wooden_flagpole indoor_flagpole indoor_flagpole_wooden traffic_light
    utility_pole rotary_clothesline`],
  [sign, `board_map board_map_b bulletin sign_warning`],
  [sculpture, `bigmirror_b birdbath gazing_ball mannequin sand_castle statue styling_station grave_head
    grave_monument slab`],
  [game, `arcade_machine archery_target_bale archery_target_box ball_mach dancing_pole dive_block
    ergometer ergometer_mechanical exercise organ parkour_bars piano pinball_machine punching_bag
    roulette_table speaker_cabinet target treadmill treadmill_mechanical`],
  [work, `bandsaw drill_press heavy_lathe jointer mitresaw planer router tablesaw machinery_electronic
    machinery_heavy machinery_light machinery_old`],
  [ladder, `aluminum_stepladder ladder`],
]);

export const FURNITURE_BATCH = Array.from(families).flatMap(([build, list]) =>
  list.split(/\s+/).map((name) => ({
    id: `f_${name}`,
    dir: 'furniture',
    ppm: 48,
    source: 'tools/cubeclysm/page/furniture-batch.js',
    faceWall: name.startsWith('curtain') || name === 'styling_station',
    build: (p) => build(p, name),
  })),
);
