import { colorFor, identity } from './common-loot-kit.js';
import { supplyReading } from './item-supply-reading.js';
import { ITEM_SUPPLY_DATA } from './item-supply-data.js';
import { supplyGoods } from './item-supply-goods.js';
import { supplyMachinery } from './item-supply-machinery.js';
import { supplyProps } from './item-supply-props.js';
import { supplyWear } from './item-supply-wear.js';
import { workshopGoods } from './item-workshop-goods.js';
import { workshopParts } from './item-workshop-parts.js';
import { workshopTools } from './item-workshop-tools.js';
import { workshopWear } from './item-workshop-wear.js';
import { REDRAWN } from './item-redraw.js';

const source = 'tools/cubeclysm/page/item-supply.js';
const builders = {
  ...workshopGoods, ...workshopParts, ...workshopTools, ...workshopWear,
  ...supplyGoods, ...supplyMachinery, ...supplyProps, ...supplyWear, book: supplyReading,
};
const aspects = {
  accessory: 2.85, armor: 2.65, book: 2.47, carry: 2.03, cloth: 3.1, coat: 4.75, cylinder: 2.7,
  dress: 4.8, drink: 2.6, electrical: 3.2, glasses: 2.90, gloves: 3.04, handle: 4.9,
  handtool: 3.25, headwear: 2.52, intimates: 3.4, mask: 2.40, meter: 2.82, paper: 3.96,
  pants: 4.92, pin: 4.6, shoe: 3.03, suit: 5.42, watch: 2.87,
};
const referenceSpans = {
  aquarium_large:1.22, beach_volleyball:.211, clock:.29, coin_dollar:.0265,
  coin_gold:.0327, coin_silver:.0406, cowl_wool:.28, disc_golf:.214, fanblade_metal:.30,
  gasdiscount_gold:.0856, gasdiscount_platinum:.0856, gasdiscount_silver:.0856,
  hat_hunting:.289, id_science:.0856, id_science_transport_1:.091, lab_postit_bio:.076,
  lab_postit_blob:.076, lab_postit_tech:.076, lightstrip_inactive:.354, magic_8_ball:.101,
  microscope:.36, pocketwatch:.056, puck:.0762, shuttlecock:.086, ukulele:.583,
};
const detailed = new Set(['accessory','electronics','medical','paper','watch']);

export const ITEM_SUPPLY = Object.entries(ITEM_SUPPLY_DATA).flatMap(([family, rows]) => {
  const draw = builders[family];
  if (!draw) throw new Error(`Unknown item family: ${family}`);
  return rows.map(([id, name, zh, volume, mm, hex, shape]) => {
    const longestSide = mm ? mm/1000 : referenceSpans[id] ?? Math.cbrt(volume/1e6)*(aspects[family]??1.90);
    const item = { id, name, volume, family, shape, detail: shape, key: identity(id), color: hex ? parseInt(hex,16) : colorFor(id) };
    return {
      id, source, group: 'items', longestSide,
      ppm: family==='book' ? 530 : detailed.has(family) ? 115 : 67,
      names: { en:name, ...(zh ? { zh_CN:zh } : {}) },
      build: (prop) => (REDRAWN[id] ?? draw)(prop,item),
    };
  });
});
