// Cubeclysm effects: small looping animations that go with a model (drips, flakes, puffs, pulses),
// independent of the rig. Each effect particle is a node of its own (fx_…) placed on the part it
// comes from, so it follows that part, but the animation only moves the fx nodes: it never
// touches a joint. All effects of a model are one looping glTF clip named "FX", which an engine
// can play on top of any body animation (or not at all).
import * as THREE from 'three';

import { block } from './atlas.js';
import { fill, rng, shade } from './paint.js';

export const FX_CLIP = 'FX';
const PERIOD = 2.4;
const STEPS = 24;

const B = (x0, y0, z0, x1, y1, z1) => new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));

/**
 * The effects of one model: add particles to parts with the helpers below, then `clip()` gives
 * the looping animation of all of them.
 */
export function effects(seed) {
  const tracks = [], blocks = [], r = rng(`${seed}|fx`);
  let count = 0;

  /** A particle node at `at` on `parent`, its block centred on the node. */
  function particle(parent, kind, at, size, color, glow = false, haze = false) {
    const g = new THREE.Group();
    g.name = `fx_${kind}_${count++}`;
    g.position.copy(at);
    parent.add(g);
    const h = size / 2;
    const paint = (ctx, x, y, w, hh) => {
      if (!haze) {
        fill(ctx, x, y, w, hh, color);
        fill(ctx, x, y, w, Math.max(1, hh * 0.3), shade(color, 1.25));
        return;
      }
      for (let row = 0; row < hh; row++) for (let col = 0; col < w; col++) {
        const radius = Math.hypot((col + .5) / w - .5, (row + .5) / hh - .5) * 2;
        ctx.globalAlpha = Math.max(0, 1 - radius ** 2) * (.63 + r() * .37);
        fill(ctx, x + col, y + row, 1, 1, shade(color, 1.18 - radius * .41));
      }
      ctx.globalAlpha = 1;
    };
    blocks.push(block(g, g.name, B(-h, -h, -h, h, h, h), paint, { glow, haze }));
    return g;
  }

  /** Sample f(u) (u: 0..1 through the loop, shifted by phase) into position and scale tracks. */
  function animate(node, phase, f) {
    const times = [], pos = [], scl = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = (i / STEPS) * PERIOD, u = (i / STEPS + phase) % 1, { p, s } = f(u);
      times.push(t);
      pos.push(node.position.x + p.x, node.position.y + p.y, node.position.z + p.z);
      scl.push(s, s, s);
    }
    tracks.push(new THREE.VectorKeyframeTrack(`${node.name}.position`, times, pos));
    tracks.push(new THREE.VectorKeyframeTrack(`${node.name}.scale`, times, scl));
  }

  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  return {
    blocks,
    /** Drops that swell, fall `drop` metres and vanish (sludge, goo, acid). */
    drip(parent, at, { color, size = 0.035, drop = 0.35, n = 2 }) {
      for (let i = 0; i < n; i++) {
        const node = particle(parent, 'drip', at.clone().add(v((r() - 0.5) * 0.04, 0, (r() - 0.5) * 0.02)), size, color);
        animate(node, i / n + r() * 0.2, (u) => ({ p: v(0, -drop * Math.max(0, (u - 0.25) / 0.75) ** 2, 0), s: u < 0.25 ? 0.3 + (u / 0.25) * 0.7 : u > 0.92 ? Math.max(0.05, (1 - u) / 0.08) : 1 }));
      }
    },
    /** Flakes that drop off a surface, drifting as they fall (scab, plaster). */
    flake(parent, at, { color, size = 0.03, drop = 0.6, n = 3 }) {
      for (let i = 0; i < n; i++) {
        const dx = (r() - 0.5) * 0.15, dz = (r() - 0.5) * 0.15;
        const node = particle(parent, 'flake', at.clone().add(v((r() - 0.5) * 0.06, (r() - 0.5) * 0.06, 0)), size, color);
        animate(node, i / n, (u) => ({ p: v(dx * u + Math.sin(u * 9) * 0.02, -drop * u, dz * u), s: u > 0.85 ? Math.max(0.05, (1 - u) / 0.15) : 1 }));
      }
    },
    /** Puffs that rise and spread out (gas, stench). */
    puff(parent, at, { color, size = 0.06, rise = 0.5, n = 3, haze = false }) {
      for (let i = 0; i < n; i++) {
        const dx = (r() - 0.5) * 0.25, dz = (r() - 0.5) * 0.25;
        const node = particle(parent, 'puff', at.clone().add(v((r() - 0.5) * 0.1, 0, (r() - 0.5) * 0.1)), size, color, false, haze);
        animate(node, i / n, (u) => ({ p: v(dx * u, rise * u, dz * u), s: u < 0.2 ? u / 0.2 : 1 + u * 1.2 - (u > 0.8 ? (u - 0.8) * 10 : 0) }));
      }
    },
    /**
     * Flames: glowing tongues of fire that flicker up from a surface, swaying, shrinking and
     * going out (yellow at the core, orange, a red tip). Emissive, so they light up in the dark.
     */
    flame(parent, at, { size = 0.06, rise = 0.25, n = 3 }) {
      const colors = [0xffd040, 0xff8a1a, 0xe8401a];
      for (let i = 0; i < n; i++) {
        const dx = (r() - 0.5) * 0.06, sway = 0.015 + r() * 0.02, k = 2 + Math.floor(r() * 3);
        const node = particle(parent, 'flame', at.clone().add(v((r() - 0.5) * size, 0, (r() - 0.5) * size)), size * (1 - i * 0.18), colors[i % colors.length], true);
        animate(node, i / n + r() * 0.15, (u) => ({ p: v(dx * u + Math.sin(u * Math.PI * 2 * k) * sway, rise * u, Math.cos(u * Math.PI * 2 * k) * sway * 0.5), s: u < 0.12 ? u / 0.12 : Math.max(0.05, 1 - (u - 0.12) / 0.88) * (1 + 0.15 * Math.sin(u * 40)) }));
      }
    },
    /**
     * Sparks: tiny glowing points that jump about a spot, each flashing on and off at random
     * places within `spread` (electricity crackling off a body).
     */
    spark(parent, at, { color = 0xbfe8ff, size = 0.025, spread = 0.12, n = 3 }) {
      for (let i = 0; i < n; i++) {
        const node = particle(parent, 'spark', at.clone(), size, color, true);
        const offs = Array.from({ length: STEPS + 1 }, () => v((r() - 0.5) * spread * 2, (r() - 0.5) * spread * 2, (r() - 0.5) * spread * 2));
        const on = Array.from({ length: STEPS + 1 }, () => r() < 0.45);
        animate(node, i / n, (u) => { const k = Math.min(STEPS, Math.floor(u * STEPS)); return { p: offs[k], s: on[k] ? 1 : 0.02 }; });
      }
    },
    /** Flicker a node on and off (an arc of lightning): visible for `duty` of each of `k` flashes per loop. */
    flicker(node, { k = 3, duty = 0.35, phase = 0 } = {}) {
      animate(node, phase, (u) => ({ p: v(0, 0, 0), s: (u * k) % 1 < duty ? 1 : 0.02 }));
    },
    /** Swell and shrink a node that is already part of the model (a cyst, a belly). */
    pulse(node, { amount = 0.15, phase = 0 } = {}) {
      animate(node, phase, (u) => ({ p: v(0, 0, 0), s: 1 + amount * Math.sin(u * Math.PI * 2) }));
    },
    /** Shudder in place: quick small offsets (a shard of glass that will not stay put). */
    jitter(node, { amount = 0.03, phase = 0 } = {}) {
      const k = Math.floor(r() * 5) + 3;
      animate(node, phase, (u) => ({ p: v(Math.sin(u * Math.PI * 2 * k) * amount, Math.sin(u * Math.PI * 2 * (k + 2)) * amount * 0.6, Math.cos(u * Math.PI * 2 * (k + 1)) * amount * 0.5), s: 1 }));
    },
    /** Sway and swell slowly (a wisp of smoke, a tendril). Scale only moves along its own axes uniformly. */
    sway(node, { amount = 0.2, phase = 0 } = {}) {
      animate(node, phase, (u) => ({ p: v(Math.sin(u * Math.PI * 2) * 0.03, 0, Math.cos(u * Math.PI * 2) * 0.03), s: 1 + amount * Math.sin(u * Math.PI * 4) }));
    },
    clip: () => (tracks.length ? new THREE.AnimationClip(FX_CLIP, PERIOD, tracks) : null),
    /** A node of its own for a feature that will pulse (its blocks go on this node). */
    node(parent, name, at) {
      const g = new THREE.Group();
      g.name = `fx_${name}_${count++}`;
      g.position.copy(at);
      parent.add(g);
      return g;
    },
  };
}
