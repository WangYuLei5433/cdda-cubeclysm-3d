import { COMMON_LOOT_DATA } from './common-loot-data.js';
import { colorFor, identity } from './common-loot-kit.js';
import { objects } from './common-loot-objects.js';
import { packaging } from './common-loot-packaging.js';
import { wear } from './common-loot-wear.js';

const builders = { ...objects, ...packaging, ...wear };
const source = 'tools/cubeclysm/page/common-loot.js';
const details = new Set(['money', 'jewel', 'med']);
export const COMMON_LOOT = Object.entries(COMMON_LOOT_DATA).flatMap(([family, rows]) => {
  const build = builders[family];
  if (!build) throw new Error(`missing model builder for ${family}`);
  return rows.map(([id, name, length, volume]) => {
    const key = identity(id);
    const model = { id, name, length, volume, key, color: colorFor(id) };
    const ppm = details.has(family) ? 1024 : length && length > .32 ? 192 : 320;
    return {
      id, source, dir: 'items', ppm, longestSide: length,
      desc: `${name} (CDDA${length ? `, longest side ${length * 1000} mm` : ''}${volume ? `, volume ${volume} ml` : ''}).`,
      build: (p) => build(p, model),
    };
  });
});
