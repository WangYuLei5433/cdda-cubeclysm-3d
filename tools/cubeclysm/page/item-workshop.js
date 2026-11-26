import { colorFor, identity } from './common-loot-kit.js';
import { ITEM_WORKSHOP_DATA } from './item-workshop-data.js';
import { workshopGoods } from './item-workshop-goods.js';
import { workshopParts } from './item-workshop-parts.js';
import { workshopTools } from './item-workshop-tools.js';
import { workshopWear } from './item-workshop-wear.js';
import { REDRAWN } from './item-redraw.js';

const builders = { ...workshopWear, ...workshopGoods, ...workshopParts, ...workshopTools };
const source = 'tools/cubeclysm/page/item-workshop.js';

// Volume supplies the scale when CDDA has no authored longest side. Flat and
// elongated objects need a larger span than compact solids of the same volume.
const aspects = {
  armor: 2.65, bag: 2.9, balloon: 2.4, battery: 1.70, bottle: 2.2, candy: 3.2,
  can: 1.55, carry: 2.00, cloth: 3.4, coat: 4.75, corset: 3.1, cylinder: 2.75,
  dress: 5.5, drink: 2.05, earphones: 3.10, egg: 2.20, electrical: 3.6,
  glasses: 2.65, gloves: 3.10, handle: 4.9, handtool: 3.3, headwear: 2.47,
  intimates: 3.4, mask: 2.40, meter: 3.0, optics: 2.7, paper: 3.9, pants: 5.27,
  pin: 3.6, pods: 2.25, rings: 13.5, sausage: 2.40, shoe: 2.9, skirt: 4.9,
  suit: 5.40, watch: 2.9,
};
const referenceSpans = {
  american_flag: 1.18, barrette: .070,
  bag_chips_small: .166, bag_chips_medium: .232, bag_chips_large: .332,
  bottle_folding: .197,
  copper_hairpin: .045, deck_of_cards: .092,
  emer_blanket: .19, family_photo: .152, flag_swimsuit: .61, frisbee: .267,
  goggles_swim: .166, hat_ball: .269, hat_boonie: .318, hat_cotton: .202,
  hat_golf: .248, hat_knit: .23, hat_newsboy: .261, holster: .205, lab_postit_migo: .076,
  lab_postit_portal: .076, leotard: .60, log: 1.4, marble: .016, memory_card_older: .032,
  memory_card_science: .032, microscope_slide: .076, nylon: .1524, pallet: 1.2192,
  pea_pods: .10, pool_ball: .057, RPG_die: .022,
  metal_RPG_die: .022, six_pack_rings: .194, speedo: .308,
  steroid_eyedrops: .062, test_tube_micro: .040, tights: .65, tophat: .294,
  usb_drive_older: .050, valentine_card: .142, water_clean: .28, water_murky: .28,
};
const detailed = new Set(['battery', 'bottle', 'electronics', 'medical', 'paper', 'watch']);

export const ITEM_WORKSHOP = Object.entries(ITEM_WORKSHOP_DATA).flatMap(([family, rows]) => {
  const build = builders[family];
  if (!build) throw new Error(`Unknown workshop model family: ${family}`);
  return rows.map(([id, name, zh, volume, millimeters, hex, shape]) => {
    const side = millimeters ? millimeters / 1000
      : referenceSpans[id] ?? Math.cbrt(volume / 1e6) * (aspects[family] ?? 1.88);
    const item = { id, name, family, shape, color: hex ? parseInt(hex, 16) : colorFor(id), key: identity(id) };
    return {
      id, source, group: 'items', longestSide: side,
      ppm: detailed.has(family) ? 150 : 66,
      names: { en: name, ...(zh ? { zh_CN: zh } : {}) },
      build: (prop) => (REDRAWN[id] ?? build)(prop, item),
    };
  });
});
