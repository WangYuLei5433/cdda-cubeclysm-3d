// Cubeclysm traps: the CDDA trap types (tr_*) that can be seen (not `always_invisible`), one model
// per id. A trap covers one tile: origin = the tile centre on the floor, x, z in [-0.5, 0.5], front
// −Z. CDDA traps have no description of their own, so a trap follows its name and the description
// of what it is built from (its `drops`: a bear trap is "a spring-loaded pair of steel jaws
// connected to a sensitive pressure plate"); sizes are real-world, small parts drawn up to 1.5×
// where they would vanish at the default view distance (noted per trap).
//
// Traps share the field layers (fields.js SLOT): marks on the floor are decals at their slot,
// the rest are blocks on the floor. Moving machines and magic (spinning blades, portals, lava,
// goo, the exposed conduit) loop the FX clip like the fields (2.4 s, only fx_* nodes move).
import { LEVEL, flat, layers, speckle } from './props.js';
import { fill, mix, rng, shade } from './paint.js';
import { V, blob, bevel, cyl, hull, lump, pane, sheet, tube, woodP, steelP, clothP, plasticP, stoneP, barkP } from './item-kit.js';
import { anim, arc, blink, bubbles, decal, grime, liquid, motes, splotch } from './fields.js';
import { slamfire } from './slamfire.js';
import { crossbow } from './crossbow.js';

const TAU = Math.PI * 2;

// --- shared parts -------------------------------------------------------------------------------

const dirtP = (seed = 'dirt') => speckle(seed, 0x6a4c30, [0x7e5c3a, 0x56391f, 0x8a6a44], 0.55);
const stringP = flat(0xe8e0c8);
const darkSteel = steelP(0x4a4e52);

/** A wooden stake driven into the ground at (x, z), `h` high. */
function stake(p, x, z, h = 0.3, r = 0.018) {
  hull(p, 'stake', [V(x - r, 0, z - r), V(x + r, 0, z - r), V(x + r, 0, z + r), V(x - r, 0, z + r), V(x - r, h, z - r), V(x + r, h, z - r), V(x + r, h, z + r), V(x - r, h, z + r), V(x, h + r * 2, z)], woodP(0x9a7448));
}
/** A taut string between two points (tripwires, snares). Drawn 3 mm thick: a real one is ~1 mm. */
const cord = (p, a, b, r = 0.003) => tube(p, 'string', V(...a), V(...b), r, r, 4, stringP);

/** A hole in the floor: a dark disc below a ring of loose dirt (and inner walls going down). */
function hole(p, { r = 0.42, rim = 0x6a4c30, inside = 0x1e140c, depth = 0.3 } = {}) {
  decal(p, 'hole', 'earth', (ctx, X, Y, W, H) => {
    const g = rng(`${p.id}hole`);
    splotch(ctx, X, Y, W, H, 0.5, 0.5, r + 0.02, r + 0.02, shade(inside, 1.6), g, 0.08);
    splotch(ctx, X, Y, W, H, 0.5, 0.5, r - 0.02, r - 0.02, inside, g, 0.08);
  });
  const n = 12;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU, x = Math.cos(a) * r, z = Math.sin(a) * r;
    lump(p, 'rim', [0.07, 0.035, 0.07], dirtP(`${p.id}rim${k}`), `${p.id}r${k}`, {}, [x, 0, z]);
    // Inner wall: a panel from the rim down, for a viewer that cuts the floor away.
    const a1 = ((k + 1) / n) * TAU, x1 = Math.cos(a1) * r, z1 = Math.sin(a1) * r;
    pane(p, 'pit wall', [V(x, 0.004, z), V(x1, 0.004, z1), V(x1 * 0.85, -depth, z1 * 0.85), V(x * 0.85, -depth, z * 0.85)], 0.01, speckle(`${p.id}wall`, shade(rim, 0.6), [shade(rim, 0.5), shade(rim, 0.7)], 0.5));
  }
}

/** A funnel (cone) on a short stand of three legs, collecting rain into a container below. */
function funnel(p, { rTop, rBottom = 0.03, h, paint, legs = 0.32, legPaint = woodP(0x8a6a44), spout = true }) {
  const top = legs + h;
  cyl(p, 'funnel', 'y', [0, legs + h / 2, 0], rBottom, h, 12, paint, { open: true }, rTop);
  cyl(p, 'funnel rim', 'y', [0, top, 0], rTop + 0.008, 0.012, 12, paint);
  if (spout) cyl(p, 'spout', 'y', [0, legs - 0.03, 0], rBottom * 0.7, 0.06, 8, paint);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * TAU + 0.5;
    tube(p, 'leg', V(Math.cos(a) * rTop * 1.1, 0, Math.sin(a) * rTop * 1.1), V(Math.cos(a) * rTop * 0.75, top - 0.02, Math.sin(a) * rTop * 0.75), 0.012, 0.01, 5, legPaint);
  }
  // The container it fills.
  cyl(p, 'bucket', 'y', [0, 0.12, 0], 0.11, 0.24, 10, plasticP(0x4a6a8a), {}, 0.13);
}

/** A sleeping pad / mattress lying on the floor. */
function pad(p, { w = 0.62, l = 0.95, t, paint, quilt = null, edge = null }) {
  const body = quilt ? layers(paint, (ctx, x, y, W, H, side) => { if (side !== 'top') return; for (let i = 6; i < W; i += 10) for (let j = 6; j < H; j += 10) fill(ctx, x + i, y + j, 1, 1, quilt); }) : paint;
  bevel(p, 'pad', [-w / 2, 0, -l / 2, w / 2, t, l / 2], Math.min(0.03, t / 3), body);
  if (edge) p.box('piping', [-w / 2 - 0.002, t * 0.45, -l / 2 - 0.002, w / 2 + 0.002, t * 0.55, l / 2 + 0.002], flat(edge));
}

/** Two sticks crossed into an X, the gun resting in the fork at `y` (a shooting rest), lashed on. */
function crutch(p, z, y, w = 0.16) {
  for (const s of [-1, 1]) tube(p, 'rest stick', V(s * w, 0, z + 0.01 * s), V(-s * w * 0.3, y + 0.05, z - 0.01 * s), 0.012, 0.011, 5, woodP(0x8a6a44));
}
/** String wound tight round a pipe of radius r at local z (a lashing), on the gun's own node. */
function lashing(p, parent, x, z, r) {
  const wound = layers(stringP, (ctx, cx, cy, w, h) => { for (let i = 0; i < w; i += 3) fill(ctx, cx + i, cy, 1, h, 0xb8ae90); });
  cyl(p, 'lashing', 'z', [x, 0, z], r + 0.0025, 0.022, 10, wound, { parent });
}

/**
 * A slam-fire shotgun trap: the pipe gun (slamfire.js, the item it drops) laid in two crossed-stick
 * rests at shin height, muzzle a little down toward the tile's front, lashed on with string. A
 * cord from its barrel runs to a tripwire across the front of the tile: a foot on the wire jerks
 * the barrel back onto the nail.
 */
function shotgunTrap(p, { double, fired = false }) {
  const y = 0.26, r = double ? 0.045 : 0.025;
  crutch(p, 0.28, y - r, double ? 0.2 : 0.16);
  crutch(p, -0.02, y - r + 0.02, double ? 0.2 : 0.16);
  const gun = slamfire(p, { double, at: [0, y, 0.08], rotX: -0.06 });
  // Lashed to the rests: round the receiver at the back rest, the barrel at the front one.
  for (const x of double ? [-0.0205, 0.0205] : [0]) { lashing(p, gun, x, 0.2, 0.0167); lashing(p, gun, x, -0.1, 0.0134); }
  // Pull cord: from a wrap round the barrel near the muzzle, forward and down to the tripwire.
  for (const x of double ? [-0.0205, 0.0205] : [0]) lashing(p, gun, x, -0.24, 0.0134);
  cord(p, [0, y - 0.0134 + 0.016, -0.16], [0, 0.07, -0.42]);
  stake(p, -0.45, -0.42, 0.12, 0.012); stake(p, 0.45, -0.42, 0.12, 0.012);
  cord(p, [-0.45, 0.07, -0.42], [0.45, 0.07, -0.42]);
  // One barrel already fired (tr_shotgun_2_1): soot at the muzzles and spent shot on the floor.
  if (fired) {
    decal(p, 'muzzle soot', 'scorch', grime(p.id, [0x2a2622, 0x3a322c, 0x4a423a], 0.7, 6), { size: 0.36, at: [0, -0.36] });
    const rr = rng(`${p.id}shot`);
    for (let k = 0; k < 10; k++) cyl(p, 'pellet', 'y', [(rr() - 0.5) * 0.5, 0.004, -0.3 - rr() * 0.15], 0.004, 0.008, 5, flat(0x5a5a5a), { metal: true });
  }
}

/**
 * A crossbow trap: the wood crossbow (crossbow.js, the item it drops), cocked with an aluminum
 * broadhead bolt in the groove, lashed in two crossed-stick rests at shin height and aimed at the
 * front of the tile. A string from its trigger lever runs to a tripwire across the front.
 */
function crossbowTrap(p) {
  const y = 0.2;
  crutch(p, 0.3, y + 0.02, 0.15);
  crutch(p, -0.12, y + 0.02, 0.15);
  const bow = crossbow(p, { cocked: true, at: [0, y, -0.04], rotX: -0.05 });
  lashing(p, bow, 0, 0.3 + 0.04, 0.026);
  lashing(p, bow, 0, -0.12 + 0.04, 0.026);
  // Trigger string: from the lever, down and forward to the middle of the tripwire.
  cord(p, [0, y + 0.0, 0.06], [0, 0.07, -0.42]);
  stake(p, -0.45, -0.42, 0.12, 0.012); stake(p, 0.45, -0.42, 0.12, 0.012);
  cord(p, [-0.45, 0.07, -0.42], [0.45, 0.07, -0.42]);
}

/** Spiky things scattered on the floor (caltrops, teeth, shards): `make(k, x, z, a)` builds one. */
function scatter(p, n, spread, make) {
  const r = rng(`${p.id}scatter`);
  for (let k = 0; k < n; k++) make(k, (r() - 0.5) * 2 * spread, (r() - 0.5) * 2 * spread, r() * TAU, r);
}
/** A caltrop: four spikes from a centre, one always pointing up. Drawn 1.5× (a real one is ~4 cm). */
function caltrop(p, x, z, a, paint, s = 0.045, opts = {}) {
  const c = V(x, s * 0.33, z), dirs = [V(0, 1, 0), V(0.94, -0.33, 0), V(-0.47, -0.33, 0.82), V(-0.47, -0.33, -0.82)];
  for (const d of dirs) {
    const q = d.clone().applyAxisAngle(V(0, 1, 0), a);
    tube(p, 'spike', c, c.clone().addScaledVector(q, s), s * 0.14, 0.002, 4, paint, opts);
  }
}

/** A portal: a standing oval ring of glowing blocks turning round a hazy core. */
function portal(p, A, { ring, core, R = 0.4, y = 1.0, ry = 1.6, motes: m = true }) {
  const g = A.node('portal', [0, y, 0]);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU;
    p.box('ring', [Math.cos(a) * R - 0.04, Math.sin(a) * R * ry - 0.04, -0.03, Math.cos(a) * R + 0.04, Math.sin(a) * R * ry + 0.04, 0.03], flat(k % 2 ? ring : mix(ring, 0xffffff, 0.4)), { parent: g, glow: true });
  }
  A.track(g, 0, (u) => ({ rz: u * TAU * 0.25 }));
  const c = A.node('portal core', [0, y, 0]);
  blob(p, 'vortex', [R * 0.8, R * ry * 0.8, 0.02], [0, 0, 0], flat(core), { parent: c, haze: true, glow: true }, 4, 10);
  A.track(c, 0, (u) => ({ s: 1 + 0.08 * Math.sin(u * TAU * 3), rz: -u * TAU * 0.5 }));
  if (m) motes(p, A, { n: 10, color: [mix(ring, 0xffffff, 0.5), 0xffffff], size: 0.02, spread: 0.35, low: y - R * ry, height: R * ry * 2, rise: 0.15, twinkle: 0.5 });
}

/** A fluorescent ceiling fixture just under the 2 m ceiling (the overhead lights a lab trap turns on). */
function ceilingLight(p, variant) {
  const y = LEVEL - 0.02, r = rng(`${p.id}light`);
  p.box('housing', [-0.32, y - 0.06, -0.1, 0.32, y, 0.1], steelP(0xd8dcd8));
  const tubes = variant % 2 ? [-0.04, 0.04] : [-0.05, 0, 0.05];
  for (const z of tubes) cyl(p, 'tube', 'x', [0, y - 0.075, z], 0.012, 0.6, 6, flat(0xf8fff4), { glow: true });
  // Each fixture its own: a numbered asset tag, and a pool of light on the floor below.
  p.box('asset tag', [0.18, y - 0.062, -0.102, 0.28, y - 0.035, -0.099], flat([0xe8c830, 0x40a0e0, 0xe06040, 0x60c060, 0xc8c8c8][variant % 5]));
  // Its light on the floor: a soft dither, thinning out from the middle.
  decal(p, 'light pool', 'light', (ctx, X, Y, W, H) => {
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const d = Math.hypot(((i + 0.5) / W - 0.5) / 0.4, ((j + 0.5) / H - 0.5) / 0.26);
      if (r() < 0.55 * (1 - d)) fill(ctx, X + i, Y + j, 1, 1, d < 0.5 ? 0xfafcf0 : 0xe8ecd8);
    }
  });
}

/** Lab doorway mechanism: a sliding door's floor track with hazard stripes (CDDA puts the door there). */
function doorTrack(p, label) {
  const hazard = (ctx, x, y, w, h) => { for (let i = -h; i < w; i += 6) for (let j = 0; j < h; j++) { const u = i + j; if (u >= 0 && u < w && ((u - i) % 6) < 3) fill(ctx, x + u, y + j, 1, 1, 0x1a1a1a); } };
  p.box('door track', [-0.5, 0, -0.06, 0.5, 0.012, 0.06], steelP(0x8a8e92), { metal: true });
  p.box('groove', [-0.48, 0.012, -0.012, 0.48, 0.014, 0.012], flat(0x2a2a2a));
  for (const z of [-0.2, 0.2]) p.box('hazard stripe', [-0.5, 0, z - 0.05, 0.5, 0.006, z + 0.05], layers(flat(0xe8c020), hazard), { ppm: 128 });
  p.box('label', [label - 0.06, 0.006, 0.26, label + 0.06, 0.008, 0.32], flat(0xf0f0f0));
}

// --- the traps ----------------------------------------------------------------------------------

const TRAP = {
  tr_alien_tree_trap_roots: (p, A) => {
    // Alien roots: dark, glossy roots breaking out of the soil in humps and diving back in,
    // knotted where they cross; they twitch.
    decal(p, 'broken soil', 'earth', grime(p.id, [0x3a2e3a, 0x4a3a44, 0x2a2228], 0.5, 20));
    const bark = speckle('alienroot', 0x3a3040, [0x5a4a64, 0x2a2030, 0x6a5a74], 0.45), r = rng(`${p.id}roots`);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI + r() * 0.4, d = V(Math.cos(a), 0, Math.sin(a)), side = V(-d.z, 0, d.x), off = (r() - 0.5) * 0.4;
      const g = A.node('root', [0, 0, 0]), n = 6, rad = 0.035 + r() * 0.02;
      let prev = null;
      for (let i = 0; i <= n; i++) {
        const t = i / n - 0.5, hump = Math.sin((i / n) * Math.PI * 2) * 0.09 + 0.02;
        const q = d.clone().multiplyScalar(t * 0.95).addScaledVector(side, off + Math.sin(i * 1.3 + k) * 0.05).add(V(0, hump, 0));
        if (prev) tube(p, 'root', prev, q, rad, rad * 0.9, 6, bark, { parent: g });
        prev = q;
      }
      for (let j = 0; j < 2; j++) lump(p, 'knot', [0.045, 0.035, 0.045], bark, `${p.id}knot${k}${j}`, { parent: g }, [d.x * (j ? 0.2 : -0.25) + side.x * off, 0, d.z * (j ? 0.2 : -0.25) + side.z * off]);
      A.track(g, k / 4, (u) => ({ s: [1, 1 + 0.15 * Math.sin(u * TAU * 2), 1] }));
    }
  },
  tr_beartrap: (p) => {
    // Open steel jaws (each a half-ring of teeth) round a pressure plate, chained to a stake.
    const jaw = steelP(0x6a6e72);
    p.root.scale.setScalar(1.3); // drawn 1.3× (the real jaws are ~30 cm across)
    p.box('base bar', [-0.2, 0, -0.025, 0.2, 0.02, 0.025], jaw, { metal: true });
    cyl(p, 'pressure plate', 'y', [0, 0.025, 0], 0.07, 0.012, 10, steelP(0x8a8e92), { metal: true });
    for (const s of [-1, 1]) {
      for (let k = 0; k <= 8; k++) {
        const a0 = (k / 9) * Math.PI, a1 = ((k + 1) / 9) * Math.PI;
        const P = (a) => V(Math.cos(a) * 0.15, 0.012, s * Math.sin(a) * 0.15);
        tube(p, 'jaw', P(a0), P(a1), 0.009, 0.009, 4, jaw, { metal: true });
        if (k % 2 === 0) { const t = P(a0 + 0.17); hull(p, 'tooth', [t.clone().add(V(-0.012, 0, 0)), t.clone().add(V(0.012, 0, 0)), t.clone().add(V(0, 0.035, -s * 0.012))], jaw, { metal: true }); }
      }
      cyl(p, 'spring', 'x', [s * 0.25, 0.02, 0], 0.018, 0.1, 8, steelP(0x9a9ea2), { metal: true });
    }
    for (let k = 0; k < 4; k++) tube(p, 'chain link', V(0.25 + k * 0.025, 0.006, 0.015 * (k % 2)), V(0.275 + k * 0.025, 0.006, 0.015 * ((k + 1) % 2)), 0.005, 0.005, 4, jaw, { metal: true });
    stake(p, 0.36, 0.0, 0.06, 0.012);
  },
  tr_beartrap_buried: (p) => {
    // Buried: a patch of turned earth; a few teeth and the chain's end show.
    decal(p, 'turned earth', 'earth', grime(p.id, [0x6a4c30, 0x56391f, 0x7e5c3a], 0.7, 20), { size: 0.6 });
    lump(p, 'mound', [0.22, 0.025, 0.2], dirtP(p.id), `${p.id}m`);
    for (let k = 0; k < 4; k++) { const a = k * 0.8 + 0.3; hull(p, 'tooth', [V(Math.cos(a) * 0.14, 0.02, Math.sin(a) * 0.14), V(Math.cos(a) * 0.14 + 0.014, 0.02, Math.sin(a) * 0.14), V(Math.cos(a) * 0.14, 0.055, Math.sin(a) * 0.14 + 0.01)], steelP(0x6a6e72), { metal: true }); }
    for (let k = 0; k < 3; k++) tube(p, 'chain link', V(0.24 + k * 0.03, 0.006, 0.02 * (k % 2)), V(0.27 + k * 0.03, 0.006, 0.02 * ((k + 1) % 2)), 0.005, 0.005, 4, steelP(0x6a6e72), { metal: true });
  },
  tr_birchbark_funnel: (p) => funnel(p, { rTop: 0.14, h: 0.14, paint: layers(barkP(0xece6da), (ctx, x, y, w, h) => { const r = rng('birch'); for (let k = 0; k < 10; k++) fill(ctx, x + Math.floor(r() * w), y + Math.floor(r() * h), 3, 1, 0x2a2a2a); }) }),
  tr_leather_funnel: (p) => funnel(p, { rTop: 0.14, h: 0.14, paint: speckle('leather', 0x7a4a28, [0x8a5a34, 0x6a3e20], 0.35) }),
  tr_makeshift_funnel: (p) => {
    // A cut-off plastic bottle, upside down.
    funnel(p, { rTop: 0.09, h: 0.18, paint: plasticP(0xd8e8a0), spout: false });
    cyl(p, 'bottle neck', 'y', [0, 0.3, 0], 0.016, 0.05, 8, plasticP(0xe8c830));
  },
  tr_funnel: (p) => funnel(p, { rTop: 0.15, h: 0.15, paint: plasticP(0xe8c030) }),
  tr_metal_funnel: (p) => funnel(p, { rTop: 0.3, h: 0.26, paint: steelP(0x6a6e72), legs: 0.4, legPaint: steelP(0x4a4e52) }),
  tr_raincatcher: (p) => {
    // A tarp hung on four sticks, sagging to a hole over a bucket.
    const tarp = speckle('tarp', 0x3a6ab0, [0x4a7ac0, 0x2a5aa0], 0.25), h = 0.9;
    for (const [x, z] of [[-0.42, -0.42], [0.42, -0.42], [0.42, 0.42], [-0.42, 0.42]]) tube(p, 'stick', V(x, 0, z), V(x * 1.02, h + 0.05, z * 1.02), 0.016, 0.012, 5, woodP(0x8a6a44));
    const c = V(0, h - 0.28, 0);
    for (const [a, b] of [[[-0.42, -0.42], [0.42, -0.42]], [[0.42, -0.42], [0.42, 0.42]], [[0.42, 0.42], [-0.42, 0.42]], [[-0.42, 0.42], [-0.42, -0.42]]]) hull(p, 'tarp', [V(a[0], h, a[1]), V(b[0], h, b[1]), c, V(a[0], h + 0.006, a[1]), V(b[0], h + 0.006, b[1]), c.clone().add(V(0, 0.006, 0))], tarp);
    for (const [x, z] of [[-0.42, -0.42], [0.42, 0.42]]) cord(p, [x, h + 0.04, z], [x, h, z]);
    cyl(p, 'bucket', 'y', [0, 0.14, 0], 0.13, 0.28, 10, plasticP(0x4a6a8a), {}, 0.15);
  },
  tr_downspout_funnel: (p) => {
    // A funnel under a house's downspout: the pipe comes down from the roof into it.
    cyl(p, 'downspout', 'y', [0.3, 1.2, 0.4], 0.04, 1.6, 4, steelP(0x8a6a4a), { metal: true });
    tube(p, 'downspout elbow', V(0.3, 0.42, 0.4), V(0.12, 0.34, 0.2), 0.04, 0.04, 4, steelP(0x8a6a4a), { metal: true });
    funnel(p, { rTop: 0.14, h: 0.1, paint: steelP(0x7a5a3a), legs: 0.24 });
  },
  tr_blade: (p, A) => {
    // A spinning blade: a long blade whirling at shin height on a shaft from the engine.
    cyl(p, 'shaft', 'y', [0, 0.2, 0], 0.02, 0.4, 8, darkSteel, { metal: true });
    const g = A.node('blade', [0, 0.32, 0]);
    for (const s of [-1, 1]) hull(p, 'blade', [V(0, -0.006, -0.03), V(0, 0.006, -0.03), V(s * 0.48, -0.004, -0.01), V(s * 0.48, 0.004, 0.02), V(0, -0.006, 0.03), V(0, 0.006, 0.03)], steelP(0xc8ccd0), { parent: g, metal: true });
    A.track(g, 0, (u) => ({ ry: -u * TAU * 4 }));
  },
  tr_engine: (p, A) => {
    // The spinning blade engine: a small electric motor on a frame, turning a shaft with two blades.
    p.box('frame', [-0.2, 0, -0.15, 0.2, 0.05, 0.15], woodP(0x7a5a3a));
    cyl(p, 'motor', 'y', [0, 0.14, 0], 0.09, 0.18, 10, steelP(0x3a5a7a), { metal: true });
    for (let k = 0; k < 6; k++) p.box('fin', [-0.095, 0.08 + k * 0.022, -0.004, 0.095, 0.088 + k * 0.022, 0.004], darkSteel, { metal: true });
    cyl(p, 'shaft', 'y', [0, 0.28, 0], 0.015, 0.1, 8, darkSteel, { metal: true });
    const g = A.node('blades', [0, 0.32, 0]);
    for (const a of [0, Math.PI / 2]) for (const s of [-1, 1]) hull(p, 'blade', [V(0, -0.005, 0), V(0, 0.005, 0), V(s * Math.cos(a) * 0.42, 0, s * Math.sin(a) * 0.42), V(s * Math.cos(a) * 0.4 - Math.sin(a) * 0.03, 0, s * Math.sin(a) * 0.4 + Math.cos(a) * 0.03)], steelP(0xc8ccd0), { parent: g, metal: true });
    A.track(g, 0, (u) => ({ ry: -u * TAU * 4 }));
    cord(p, [0.09, 0.2, 0], [0.45, 0.06, 0.3]);
  },
  tr_boobytrap: (p) => {
    // A crude explosive (a taped pipe bomb) on the floor, a string from it across the tile.
    cyl(p, 'pipe bomb', 'x', [0, 0.04, 0.2], 0.035, 0.22, 8, steelP(0x5a5e5a), { metal: true });
    for (const x of [-0.06, 0.04]) cyl(p, 'tape', 'x', [x, 0.04, 0.2], 0.037, 0.03, 8, flat(0x8a8a7a));
    for (const x of [-0.11, 0.11]) cyl(p, 'end cap', 'x', [x, 0.04, 0.2], 0.04, 0.02, 8, darkSteel, { metal: true });
    cord(p, [0.12, 0.04, 0.2], [0.45, 0.07, -0.1]);
    stake(p, -0.45, -0.1, 0.1, 0.01); stake(p, 0.45, -0.1, 0.1, 0.01);
    cord(p, [-0.45, 0.07, -0.1], [0.45, 0.07, -0.1]);
  },
  tr_bubblewrap: (p) => {
    // A sheet of bubble wrap: see-through, rows of bubbles.
    sheet(p, 'wrap', 0.8, 0.8, 0.004, flat(0xd8eef0), { glass: true });
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) blob(p, 'bubble', [0.025, 0.012, 0.025], [-0.35 + i * 0.1, 0.006, -0.35 + j * 0.1], flat(0xe8f8fa), { glass: true }, 2, 6);
  },
  tr_caltrops: (p) => scatter(p, 10, 0.36, (k, x, z, a) => caltrop(p, x, z, a, steelP(0x5a5e62), 0.045, { metal: true })),
  tr_caltrops_glass: (p) => scatter(p, 10, 0.36, (k, x, z, a) => caltrop(p, x, z, a, flat(0xc8e4e8), 0.05, { glass: true })),
  tr_caltrops_teeth: (p) => scatter(p, 10, 0.36, (k, x, z, a) => caltrop(p, x, z, a, speckle('teeth', 0xe8e0c8, [0xd8cca8, 0xf4eedc], 0.3), 0.05)),
  tr_teeth: (p) => scatter(p, 14, 0.4, (k, x, z, a, r) => {
    // Impossibly-sharp monster teeth, each a curved fang lying on its side.
    const l = 0.06 + r() * 0.05, d = V(Math.cos(a), 0, Math.sin(a));
    hull(p, 'tooth', [V(x, 0, z), V(x, 0.03, z), V(x + 0.02 * d.z, 0, z - 0.02 * d.x), V(x + d.x * l, 0.02, z + d.z * l)], speckle('fang', 0xf0e8d0, [0xd8c8a0, 0xffffff], 0.3));
  }),
  tr_glass: (p) => scatter(p, 16, 0.4, (k, x, z, a, r) => {
    const s = 0.03 + r() * 0.04;
    hull(p, 'shard', [V(x, 0, z), V(x + Math.cos(a) * s, 0, z + Math.sin(a) * s), V(x + Math.cos(a + 2) * s * 0.7, 0, z + Math.sin(a + 2) * s * 0.7), V(x, 0.008 + r() * 0.02, z)], flat(0xc8e4e8), { glass: true });
  }),
  tr_nailboard: (p) => {
    // Several pieces of wood nailed together, nails sticking straight up.
    for (let k = 0; k < 3; k++) p.box('plank', [-0.3, 0, -0.24 + k * 0.16, 0.3, 0.022, -0.1 + k * 0.16], woodP([0x9a7448, 0x8a6438, 0xa47e50][k]));
    p.box('cleat', [-0.24, 0.022, -0.26, -0.18, 0.04, 0.26], woodP(0x7a5434));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) cyl(p, 'nail', 'y', [-0.25 + i * 0.1, 0.05, -0.2 + j * 0.13], 0.004, 0.06, 4, steelP(0xa8acb0), { metal: true });
  },
  tr_cot: (p) => {
    // A military folding cot: olive canvas on a frame with X legs.
    const frame = steelP(0x4a5038);
    for (const x of [-0.34, 0.34]) p.box('side rail', [x - 0.015, 0.38, -0.48, x + 0.015, 0.41, 0.48], frame, { metal: true });
    p.box('canvas', [-0.34, 0.385, -0.48, 0.34, 0.4, 0.48], clothP(0x5a6a3a));
    for (const z of [-0.4, 0, 0.4]) for (const s of [-1, 1]) tube(p, 'leg', V(s * 0.32, 0, z), V(-s * 0.32, 0.38, z), 0.018, 0.018, 5, frame, { metal: true });
  },
  tr_mattress: (p) => pad(p, { t: 0.18, paint: speckle('mattress', 0xe8e4dc, [0xf0ece4, 0xd8d4cc], 0.2), quilt: 0xc8c4bc, edge: 0x6a7a9a }),
  tr_down_mattress: (p) => {
    pad(p, { t: 0.22, paint: speckle('down', 0xf4f2ec, [0xffffff, 0xe4e0d8], 0.25), quilt: 0xd8d4cc, edge: 0xc8b890 });
    for (let k = 0; k < 4; k++) blob(p, 'puff', [0.12, 0.03, 0.18], [-0.15 + (k % 2) * 0.3, 0.21, -0.2 + Math.floor(k / 2) * 0.4], speckle('down', 0xf4f2ec, [0xffffff], 0.2), {}, 3, 8);
  },
  tr_rollmat: (p) => {
    pad(p, { w: 0.55, l: 0.92, t: 0.012, paint: layers(speckle('foam', 0x3a5ab0, [0x4a6ac0, 0x2a4aa0], 0.25), (ctx, x, y, w, h, side) => { if (side === 'top') for (let j = 4; j < h; j += 6) fill(ctx, x, y + j, w, 1, 0x2a4a90); }) });
    cyl(p, 'rolled end', 'x', [0, 0.04, 0.44], 0.04, 0.55, 8, speckle('foam', 0x3a5ab0, [0x2a4aa0], 0.25));
  },
  tr_fur_rollmat: (p) => {
    pad(p, { w: 0.6, l: 0.92, t: 0.03, paint: speckle('fur', 0x7a5a3a, [0x9a7a52, 0x5a3e24, 0x8a6a44], 0.65) });
    for (let k = 0; k < 3; k++) lump(p, 'fur tuft', [0.09, 0.02, 0.12], speckle('fur', 0x8a6a44, [0x6a4a2a, 0xa8885e], 0.6), `${p.id}${k}`, {}, [-0.15 + k * 0.15, 0.028, -0.2 + k * 0.2]);
  },
  // Crossbow trap (CDDA drops: string_36 + crossbow + bolt_steel).
  tr_crossbow: (p) => crossbowTrap(p),
  // Shotgun traps (CDDA drops: string_36 + the gun + shot_00): tr_shotgun_1 the single slam-fire
  // pipe shotgun, tr_shotgun_2 the double, tr_shotgun_2_1 the double with one barrel already fired.
  tr_shotgun_1: (p) => shotgunTrap(p, { double: false }),
  tr_shotgun_2: (p) => shotgunTrap(p, { double: true }),
  tr_shotgun_2_1: (p) => shotgunTrap(p, { double: true, fired: true }),
  tr_dissector: (p, A) => {
    // An exposed high-energy conduit: a cable channel torn open in the floor, crackling.
    p.box('channel', [-0.5, 0, -0.08, 0.5, 0.03, 0.08], steelP(0x5a5e62), { metal: true });
    p.box('channel slot', [-0.48, 0.03, -0.04, 0.48, 0.032, 0.04], flat(0x1a1a1a));
    cyl(p, 'conduit', 'x', [0, 0.036, 0], 0.025, 1, 8, flat(0x40d8f0), { glow: true });
    for (const [x, rz] of [[-0.18, 0.5], [0.22, -0.4]]) p.box('torn cover', [x - 0.12, 0.03, 0.06, x + 0.12, 0.04, 0.18], steelP(0x6a6e72), { metal: true });
    for (let k = 0; k < 4; k++) arc(p, A, [-0.3 + k * 0.2, 0.05, 0], [-0.25 + k * 0.2 + (A.r() - 0.5) * 0.2, 0.25 + A.r() * 0.3, (A.r() - 0.5) * 0.3], { color: 0xbff4ff, k: 3 + k, segs: 4 });
    motes(p, A, { n: 8, color: 0xd8f8ff, size: 0.018, spread: 0.4, low: 0.05, height: 0.2, rise: 0.1, twinkle: 0.4 });
  },
  tr_dormant_corpse: (p) => {
    // A dormant zombie: a whole grey-green corpse (the standard 1.75 m body: 0.3 m toy head,
    // 0.62 m torso, 0.81 m legs) lying face down across the tile's diagonal, so it overhangs the
    // corners a little; torn shirt, one arm flung out ahead. It only looks dead.
    const skin = speckle('zskin', 0x8a9a7a, [0x7a8a6a, 0x9aaa8a, 0x6a5a4a], 0.4);
    const shirt = layers(speckle('zshirt', 0x5a6070, [0x4a5060, 0x6a7080], 0.35), (ctx, x, y, w, h) => { const r = rng('zrips'); for (let k = 0; k < 4; k++) fill(ctx, x + Math.floor(r() * (w - 4)), y + Math.floor(r() * (h - 3)), 3 + Math.floor(r() * 3), 2, 0x8a9a7a); for (let k = 0; k < 3; k++) fill(ctx, x + Math.floor(r() * (w - 5)), y + Math.floor(r() * (h - 4)), 4, 3, 0x5a1a14); });
    const pants = speckle('zpants', 0x3a3f4a, [0x2a2f3a, 0x4a4f5a], 0.3), shoe = flat(0x2a2422);
    const g = p.group('body', { rotY: Math.PI / 4 });
    const o = { parent: g };
    p.box('head', [-0.15, 0, -0.87, 0.15, 0.3, -0.57], skin, o);
    p.box('torso', [-0.23, 0, -0.55, 0.23, 0.24, 0.07], shirt, o);
    for (const x of [-0.11, 0.11]) { p.box('leg', [x - 0.075, 0, 0.07, x + 0.075, 0.16, 0.8], pants, o); p.box('shoe', [x - 0.075, 0, 0.8, x + 0.075, 0.2, 0.88], shoe, o); }
    p.box('arm', [0.23, 0, -0.52, 0.36, 0.13, 0.03], shirt, o);
    p.box('hand', [0.23, 0, 0.03, 0.36, 0.12, 0.15], skin, o);
    p.box('upper arm', [-0.53, 0, -0.52, -0.23, 0.13, -0.39], shirt, o);
    p.box('forearm', [-0.53, 0, -0.82, -0.4, 0.13, -0.52], skin, o);
    p.box('hand', [-0.53, 0, -0.95, -0.4, 0.12, -0.82], skin, o);
    decal(p, 'stain', 'blood', liquid(p.id, { base: 0x4a3a2a, kind: 'stain', size: 1.3 }));
  },
  tr_firewood_source: (p) => {
    // Where firewood comes from: split logs stacked by a marker stake with a green ribbon.
    for (let k = 0; k < 5; k++) cyl(p, 'log', 'x', [0, 0.05 + (k > 2 ? 0.08 : 0), -0.18 + (k % 3) * 0.1 + (k > 2 ? 0.05 : 0)], 0.045, 0.5, 6, barkP(0x6a4a2a));
    stake(p, 0.38, 0.3, 0.6);
    p.box('ribbon', [0.36, 0.5, 0.3, 0.4, 0.56, 0.36], flat(0x3ab040));
  },
  tr_glass_pit: (p) => {
    hole(p);
    const r = rng(`${p.id}g`);
    for (let k = 0; k < 14; k++) { const a = r() * TAU, d = r() * 0.32, x = Math.cos(a) * d, z = Math.sin(a) * d; hull(p, 'glass shard', [V(x, 0.004, z), V(x + 0.03, 0.004, z + 0.01), V(x + 0.01, 0.004, z + 0.03), V(x + 0.01, 0.06 + r() * 0.06, z + 0.01)], flat(0xc8e8ee), { glass: true }); }
  },
  tr_pit: (p) => hole(p),
  tr_spike_pit: (p) => {
    hole(p);
    const r = rng(`${p.id}s`);
    for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU + r(), d = 0.12 + r() * 0.18, x = Math.cos(a) * d, z = Math.sin(a) * d; tube(p, 'stake', V(x, -0.1, z), V(x * 0.9, 0.16 + r() * 0.08, z * 0.9), 0.022, 0.002, 5, woodP(0xa07a4a)); }
  },
  tr_goo: (p, A) => {
    // A goo pit: a hole brimming with black goo that heaves and bubbles.
    hole(p, { inside: 0x0e0e10 });
    const g = A.node('goo', [0, 0.008, 0]);
    blob(p, 'goo surface', [0.36, 0.012, 0.36], [0, 0, 0], speckle('goo', 0x1a1a1e, [0x2a2a30, 0x3a3a44], 0.3), { parent: g }, 3, 12);
    A.track(g, 0, (u) => ({ s: [1 + 0.03 * Math.sin(u * TAU), 1 + 0.5 * Math.sin(u * TAU * 2), 1 + 0.03 * Math.cos(u * TAU)] }));
    bubbles(p, A, { n: 6, color: 0x3a3a44, spread: 0.25, rise: 0.06, size: 0.04 });
  },
  tr_sinkhole: (p) => {
    // A sinkhole: ground sagging into a hollow, cracked round the edge.
    decal(p, 'cracks', 'earth', (ctx, X, Y, W, H) => {
      const r = rng(p.id);
      splotch(ctx, X, Y, W, H, 0.5, 0.5, 0.36, 0.34, 0x5a3e24, r, 0.15);
      splotch(ctx, X, Y, W, H, 0.5, 0.5, 0.22, 0.2, 0x3e2a16, r, 0.15);
      for (let k = 0; k < 10; k++) { let x = 0.5, y = 0.5; const a = (k / 10) * TAU; for (let s = 0; s < W * 0.45; s++) { x += Math.cos(a) / W + (r() - 0.5) / W; y += Math.sin(a) / H + (r() - 0.5) / H; fill(ctx, X + Math.floor(x * W), Y + Math.floor(y * H), 1, 1, 0x2a1a0e); } }
    });
    for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU; lump(p, 'clod', [0.05, 0.02, 0.05], dirtP(`${p.id}${k}`), `${p.id}${k}`, {}, [Math.cos(a) * 0.34, 0, Math.sin(a) * 0.34]); }
  },
  tr_landmine: (p) => {
    // An anti-personnel mine: an olive drum with a pressure fuse on top. Drawn 1.3× (real ~10 cm).
    cyl(p, 'mine', 'y', [0, 0.03, 0], 0.07, 0.06, 12, speckle('mine', 0x5a6a3a, [0x4a5a2e, 0x6a7a44], 0.25));
    cyl(p, 'fuse', 'y', [0, 0.07, 0], 0.02, 0.025, 8, darkSteel, { metal: true });
    p.box('stencil', [-0.03, 0.06, 0.04, 0.03, 0.061, 0.055], flat(0xe8e0c0));
  },
  tr_landmine_buried: (p) => {
    decal(p, 'turned earth', 'earth', grime(p.id, [0x6a4c30, 0x56391f], 0.6, 10), { size: 0.5 });
    lump(p, 'mound', [0.1, 0.02, 0.1], dirtP(p.id), `${p.id}m`);
    cyl(p, 'fuse tip', 'y', [0, 0.04, 0], 0.012, 0.02, 6, darkSteel, { metal: true });
  },
  tr_lava: (p, A) => {
    // Lava: a glowing molten pool with dark crust plates, bubbling.
    decal(p, 'lava', 'light', (ctx, X, Y, W, H) => {
      const r = rng(p.id);
      splotch(ctx, X, Y, W, H, 0.5, 0.5, 0.46, 0.46, 0xd83a10, r, 0.08);
      splotch(ctx, X, Y, W, H, 0.5, 0.5, 0.34, 0.34, 0xff7a20, r, 0.2);
      for (let k = 0; k < 6; k++) splotch(ctx, X, Y, W, H, 0.25 + r() * 0.5, 0.25 + r() * 0.5, 0.06, 0.05, 0xffd060, r, 0.3);
    }, { glow: true });
    const r = rng(`${p.id}crust`);
    for (let k = 0; k < 5; k++) { const o = V((r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6); hull(p, 'crust', [V(-0.08, 0.004, -0.06), V(0.08, 0.004, -0.05), V(0.06, 0.004, 0.07), V(-0.07, 0.004, 0.05), V(0, 0.025, 0)].map((q) => q.add(o)), speckle('crust', 0x2a1a14, [0x3a2a1e, 0x1a100c], 0.4)); }
    bubbles(p, A, { n: 6, color: 0xffa040, spread: 0.3, rise: 0.08, size: 0.05 });
    motes(p, A, { n: 6, color: [0xffa030, 0xff6a10], size: 0.02, spread: 0.35, low: 0.02, height: 0.1, rise: 0.4 });
  },
  tr_light_snare: (p) => {
    // A light snare: a bent sapling stake, a noose of cord laid on a small trigger stick.
    tube(p, 'sapling', V(0.35, 0, 0.3), V(0.1, 0.55, 0.1), 0.02, 0.01, 5, woodP(0x8a6a3a));
    cord(p, [0.1, 0.55, 0.1], [0, 0.03, -0.05]);
    for (let k = 0; k < 10; k++) { const a0 = (k / 10) * TAU, a1 = ((k + 1) / 10) * TAU; cord(p, [Math.cos(a0) * 0.08, 0.012, -0.05 + Math.sin(a0) * 0.08], [Math.cos(a1) * 0.08, 0.012, -0.05 + Math.sin(a1) * 0.08]); }
    stake(p, -0.12, -0.05, 0.08, 0.01);
    tube(p, 'trigger stick', V(-0.12, 0.06, -0.05), V(0.05, 0.03, -0.05), 0.006, 0.006, 4, woodP(0x9a7a4a));
  },
  tr_practice_target: (p) => {
    // An archery target: a straw boss with a ring face on a wooden stand.
    for (const x of [-0.25, 0.25]) tube(p, 'stand leg', V(x, 0, 0.12), V(x * 0.8, 1.22, 0.04), 0.02, 0.02, 5, woodP(0x8a6a44));
    tube(p, 'back leg', V(0, 0, 0.45), V(0, 1.12, 0.05), 0.02, 0.02, 5, woodP(0x8a6a44));
    const face = (ctx, x, y, w, h, side) => {
      fill(ctx, x, y, w, h, 0xd8c890);
      if (side !== 'front') return;
      for (const [rr, c] of [[0.48, 0xf0f0f0], [0.38, 0x2a2a2a], [0.28, 0x3a8ae0], [0.18, 0xe04030], [0.08, 0xf0d030]]) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (Math.hypot((i + 0.5) / w - 0.5, (j + 0.5) / h - 0.5) < rr) fill(ctx, x + i, y + j, 1, 1, c);
    };
    p.box('target boss', [-0.3, 0.6, -0.1, 0.3, 1.2, 0.0], face, { ppm: 96 });
  },
  tr_target_spinner: (p, A) => {
    // A spinner target: two steel plates on a pipe in a sturdy frame, swinging round when hit.
    const frame = steelP(0x6a6e72);
    for (const x of [-0.3, 0.3]) p.box('upright', [x - 0.02, 0, -0.02, x + 0.02, 0.7, 0.02], frame, { metal: true });
    for (const x of [-0.3, 0.3]) p.box('foot', [x - 0.03, 0, -0.2, x + 0.03, 0.03, 0.2], frame, { metal: true });
    cyl(p, 'pivot', 'x', [0, 0.55, 0], 0.012, 0.6, 6, frame, { metal: true });
    const g = A.node('spinner', [0, 0.55, 0]);
    cyl(p, 'oar pipe', 'y', [0, 0, 0], 0.012, 0.5, 6, frame, { parent: g, metal: true });
    p.box('plate', [-0.08, 0.12, -0.006, 0.08, 0.26, 0.006], flat(0xe8e8e0), { parent: g, metal: true });
    p.box('plate', [-0.07, -0.25, -0.006, 0.07, -0.13, 0.006], flat(0xe04030), { parent: g, metal: true });
    A.track(g, 0, (u) => ({ rx: 0.5 * Math.sin(u * TAU) * (1 - u * 0.3) }));
  },
  tr_telepad: (p, A) => {
    // A teleport pad: a metal disc with a solar cell, its coils glowing magenta.
    cyl(p, 'pad', 'y', [0, 0.02, 0], 0.36, 0.04, 16, steelP(0x7a7e82), { metal: true });
    cyl(p, 'coil ring', 'y', [0, 0.043, 0], 0.28, 0.006, 16, flat(0xe050e8), { glow: true });
    p.box('solar cell', [0.24, 0.04, 0.2, 0.42, 0.05, 0.38], layers(flat(0x1a2a5a), (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 4) fill(ctx, x + i, y, 1, h, 0x8aa0c8); }));
    const g = A.node('glow', [0, 0.05, 0]);
    cyl(p, 'glow', 'y', [0, 0.1, 0], 0.26, 0.2, 12, flat(0xe060f0), { parent: g, haze: true, glow: true, open: true });
    A.track(g, 0, (u) => ({ s: [1, 0.4 + 0.6 * Math.abs(Math.sin(u * TAU)), 1] }));
  },
  tr_temple_flood: (p) => {
    // A temple ledge: a worn stone step, cut with channels that let the water in.
    p.box('ledge', [-0.5, 0, -0.5, 0.5, 0.12, 0.1], stoneP(0xa8a49a));
    for (const x of [-0.3, 0, 0.3]) p.box('channel', [x - 0.03, 0.115, -0.5, x + 0.03, 0.122, 0.1], flat(0x5a5a56));
    p.box('lip', [-0.5, 0.12, 0.08, 0.5, 0.15, 0.12], stoneP(0xb8b4aa));
  },
  tr_thick_ice: (p) => {
    p.box('ice', [-0.5, 0, -0.5, 0.5, 0.04, 0.5], speckle('ice', 0xb8e0ec, [0xd8f0f8, 0xa0d0e0], 0.3), { glass: true });
  },
  tr_thin_ice: (p) => {
    p.box('ice', [-0.5, 0, -0.5, 0.5, 0.012, 0.5], speckle('thin ice', 0xd0ecf4, [0xe8f8fc], 0.2), { glass: true });
    decal(p, 'cracks', 'mark', (ctx, X, Y, W, H) => { const r = rng(p.id); for (let k = 0; k < 7; k++) { let x = 0.5, y = 0.5; const a = r() * TAU; for (let s = 0; s < W * 0.5; s++) { x += Math.cos(a) / W + (r() - 0.5) * 1.4 / W; y += Math.sin(a) / H + (r() - 0.5) * 1.4 / H; fill(ctx, X + Math.floor(x * W), Y + Math.floor(y * H), 1, 1, 0xf8ffff); } } });
  },
  tr_tripwire: (p) => {
    // A tripwire: a cord across the tile at ankle height between two stakes.
    stake(p, -0.46, 0.05, 0.14, 0.012); stake(p, 0.46, -0.05, 0.14, 0.012);
    cord(p, [-0.46, 0.1, 0.05], [0.46, 0.1, -0.05]);
  },
  tr_unfinished_construction: (p) => {
    // An unfinished construction: studs and a half-laid frame, tools and lumber on the floor.
    const stud = woodP(0xc8a46a);
    p.box('sole plate', [-0.48, 0, -0.04, 0.48, 0.04, 0.04], stud);
    for (const x of [-0.44, 0, 0.44]) p.box('stud', [x - 0.02, 0.04, -0.04, x + 0.02, x === 0 ? 0.9 : 1.6, 0.04], stud);
    p.box('brace', [-0.44, 0.7, -0.03, 0, 0.74, 0.03], stud);
    for (let k = 0; k < 3; k++) p.box('lumber', [-0.4, k * 0.04, 0.2 + k * 0.01, 0.35, (k + 1) * 0.04, 0.3 + k * 0.01], stud);
    decal(p, 'sawdust', 'dust', grime(p.id, [0xd8c090, 0xc8a870], 0.15, 8));
  },
  // Lab mechanisms that CDDA can reveal (visibility 99): each one its own model, told apart by detail.
  tr_concrete_wall_door_lab_res_8_NE: (p) => doorTrack(p, 0.3),
  tr_concrete_wall_door_lab_res_8_NW: (p) => doorTrack(p, -0.3),
  tr_lab_security_corridor_a: (p) => doorTrack(p, 0.15),
  tr_lab_security_corridor_b: (p) => doorTrack(p, -0.15),
  tr_light_on_MUT_SE_2: (p) => ceilingLight(p, 0),
  tr_light_on_lab_security_z0N_A: (p) => ceilingLight(p, 1),
  tr_light_on_lab_security_z0N_B: (p) => ceilingLight(p, 2),
  tr_light_on_lab_security_z0S_A: (p) => ceilingLight(p, 3),
  tr_light_on_lab_security_z0S_B: (p) => ceilingLight(p, 4),
  tr_light_on_res_8_NE: (p) => ceilingLight(p, 5),
  tr_light_on_res_8_NW: (p) => ceilingLight(p, 6),
  tr_light_on_res_8_SE: (p) => ceilingLight(p, 7),
  tr_light_on_res_8_SW: (p) => ceilingLight(p, 8),
  tr_light_on_res_8_SW_2: (p) => ceilingLight(p, 9),
  tr_microlab_portal_elevator_physics_shift: (p, A) => {
    // A shifting elevator: a magenta-lit floor plate, rings of light running along its rim.
    p.box('plate', [-0.48, 0, -0.48, 0.48, 0.02, 0.48], steelP(0x6a6a72), { metal: true });
    for (const s of [0.4, 0.28]) { const g = A.node('rim', [0, 0.021, 0]); for (const [x0, z0, x1, z1] of [[-s, -s, s, -s + 0.02], [-s, s - 0.02, s, s], [-s, -s, -s + 0.02, s], [s - 0.02, -s, s, s]]) p.box('rim light', [x0, 0, z0, x1, 0.003, z1], flat(0xe050e8), { parent: g, glow: true }); A.track(g, s, (u) => ({ s: blink(u, 2, 0.5) ? 1 : 0.001 })); }
  },
  tr_microlab_shifting_hall: (p) => shiftingHall(p, 0),
  tr_microlab_shifting_hall_2: (p) => shiftingHall(p, 1),
  // Portals ----------------------------------------------------------------------------------
  tr_portal: (p, A) => portal(p, A, { ring: 0xe060f0, core: 0x8a2a9a }),
  tr_swirling_vortex: (p, A) => portal(p, A, { ring: 0x50d060, core: 0x1a5a2a }),
  tr_portal_dungeon_entrance: (p, A) => portal(p, A, { ring: 0x60e070, core: 0x1a4a2a, R: 0.36 }),
  tr_portal_dungeon_next_level: (p, A) => portal(p, A, { ring: 0x5080f0, core: 0x1a2a6a }),
  tr_portal_dungeon_teleporter: (p, A) => portal(p, A, { ring: 0x40d0a0, core: 0x0a3a3a, R: 0.44 }),
  tr_portal_dungeon_exit: (p, A) => {
    // A hole to outside: a ragged opening full of daylight.
    const g = A.node('opening', [0, 1.0, 0]);
    hull(p, 'daylight', [V(-0.35, -0.7, 0), V(0.32, -0.72, 0), V(0.4, 0.1, 0), V(0.2, 0.68, 0), V(-0.25, 0.7, 0), V(-0.42, 0.05, 0), V(0, 0, 0.01)], flat(0xf8f4d8), { parent: g, glow: true });
    for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU; lump(p, 'edge rock', [0.07, 0.07, 0.05], stoneP(0x6a6458), `${p.id}${k}`, { parent: g }, [Math.cos(a) * 0.42, Math.sin(a) * 0.72 - 0.07, 0]); }
    A.track(g, 0, (u) => ({ s: 1 + 0.02 * Math.sin(u * TAU) }));
    motes(p, A, { n: 8, color: 0xfffae0, size: 0.016, spread: 0.3, low: 0.4, height: 1.2, rise: 0.1, twinkle: 0.5 });
  },
};

/** A shifting lab hall: floor plates that slide apart along their seams. */
function shiftingHall(p, variant) {
  for (let k = 0; k < 4; k++) {
    const z0 = -0.5 + k * 0.25;
    p.box('floor plate', [-0.5, 0, z0 + 0.005, 0.5, 0.012, z0 + 0.245], steelP([0x8a7a6a, 0x7a6a5a][variant]), { metal: true });
  }
  for (let k = 1; k < 4; k++) p.box('seam', [-0.5, 0.012, -0.5 + k * 0.25 - 0.006, 0.5, 0.013, -0.5 + k * 0.25 + 0.006], flat(0x2a2220));
  p.box('arrow', [-0.04, 0.012, variant ? 0.3 : -0.38, 0.04, 0.014, variant ? 0.38 : -0.3], flat(0xe8c020));
}

/** Every visible trap, with its official name for the index. */
export const TRAPS = Object.entries(TRAP).map(([id, make]) => ({
  id,
  desc: `${id}: CDDA trap`,
  ppm: 64,
  build: (p) => { const A = anim(p); make(p, A); A.done(); },
  source: 'tools/cubeclysm/page/traps.js',
}));
