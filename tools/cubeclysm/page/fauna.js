import { FAUNA_DATA } from './fauna-data.js';
import { mammal } from './fauna-mammals.js';
import { bird } from './fauna-birds.js';
import { herptile, fish } from './fauna-aquatic.js';
import { arthropod } from './fauna-arthropods.js';
import { V, solidVolume } from './fauna-kit.js';

import { effects } from './fx.js';

const factories = {
  mammal, bird, reptile_amphibian: herptile, fish, insect_spider: arthropod,
  'zed-animal': mammal, zanimal_upgrade: mammal,
};
const sharkIds = new Set(['zhark', 'ocean_zhark']);
// Sum of the canonical zombie's body block volumes, in game metres (CDDA 62.5 L).
const zombieVolume = .16974544895;

export const FAUNA = FAUNA_DATA.map(([id, family, en, zh_CN, ml, desc]) => ({
  id: 'mon_' + id,
  names: { en, zh_CN },
  desc,
  bound: true,
  source: 'tools/cubeclysm/page/fauna.js',
  batchByMaterial: true,
  build(p) {
    const draw = sharkIds.has(id) ? fish : factories[family];
    draw(p, id);
    const scale = Math.cbrt((zombieVolume * ml / 62500) / solidVolume(p.blocks));
    if (!Number.isFinite(scale) || scale <= 0) throw new Error('Invalid body volume for ' + id);
    let bottom = Infinity;
    for (const block of p.blocks) for (const { p: vertices } of block.faces) for (const vertex of vertices) {
      bottom = Math.min(bottom, vertex.y);
    }
    // Transform facets before baking so the atlas samples the exported size.
    for (const block of p.blocks) for (const face of block.faces) {
      face.p = face.p.map((vertex) => vertex.clone().setY(vertex.y - bottom).multiplyScalar(scale));
      face.wm *= scale;
      face.hm *= scale;
    }
    if (p.faunaFx) {
      const { kind, points, color, size, n, rise, drop } = p.faunaFx;
      const fx = effects(id);
      for (const [x, y, z] of points) {
        fx[kind](p.root, V(x * scale, (y - bottom) * scale, z * scale), {
          color, size: size * scale, n, haze: kind === 'puff', ...(rise ? { rise: rise * scale } : {}), ...(drop ? { drop: drop * scale } : {}),
        });
      }
      p.blocks.push(...fx.blocks);
      p.clip = fx.clip();
    }
  },
}));
