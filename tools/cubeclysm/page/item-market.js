import { colorFor, identity } from './common-loot-kit.js';
import { ITEM_MARKET_DATA } from './item-market-data.js';
import { marketFood } from './item-market-food.js';
import { marketProps } from './item-market-props.js';
import { marketShop } from './item-market-shop.js';
import { marketWear } from './item-market-wear.js';
import { REDRAWN } from './item-redraw.js';

const source = 'tools/cubeclysm/page/item-market.js';
const builders = { ...marketFood, ...marketProps, ...marketShop, ...marketWear };
const aspect = {
  armor:2.72, book:2.52, carry:2.11, cloth:3.18, coat:4.69, dress:4.76,
  face:2.51, foot:2.66, handwear:3.10, head:2.57, jewel:2.78, marketDrink:2.58,
  pants:4.52, paper:3.58, suit:5.22, wallet:2.31,
};
const referenceSpans = {
  acoustic_guitar:.995, banjo:.94, clarinet:.67, flute:.67, guitar_electric:1.02,
  indoor_volleyball:.21, ruler:.15, saxophone:.67, trumpet:.49, tuba:.86, violin:.59, wallet_photo:.081,
};
const detailed = new Set(['jewel','paper','wallet','face']);

export const ITEM_MARKET = Object.entries(ITEM_MARKET_DATA).flatMap(([family, rows]) => {
  const draw = builders[family];
  if (!draw) throw new Error(`Unknown item family: ${family}`);
  return rows.map(([id, name, zh, volume, mm, hex, shape]) => {
    const longestSide = mm ? mm/1000 : referenceSpans[id] ?? Math.cbrt(volume/1e6)*(aspect[family]??1.91);
    const item = { id, name, volume, family, shape, key: identity(id), color: hex ? parseInt(hex,16) : colorFor(id) };
    return {
      id, source, group: 'items', longestSide,
      ppm: family==='book' ? 195 : detailed.has(family) ? 170 : 78,
      names: { en:name, ...(zh ? { zh_CN:zh } : {}) },
      build: (prop) => (REDRAWN[id] ?? draw)(prop,item),
    };
  });
});
