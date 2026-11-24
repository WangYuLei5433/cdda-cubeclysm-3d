import { CatmullRomCurve3 } from 'three';
import { V, fur, skin } from './fauna-kit.js';

// Centres relative to the root, with the cross-section radius in the last column.
// The first station sits inside the rump. The next station carries it through the
// body at a shallow angle so the exposed tail grows out of the spine.
const profiles = {
  dog: [[0,0,0,.052],[.004,.008,.136,.051],[.024,-.035,.275,.040],[.057,-.139,.402,.026],[.082,-.244,.464,.008]],
  dog_auscattle: [[0,0,0,.046],[0,-.006,.116,.047],[.009,-.066,.240,.035],[.039,-.204,.334,.026],[.070,-.338,.396,.006]],
  dog_bcollie: [[0,0,0,.042],[.013,-.022,.126,.050],[.035,-.1,.238,.061],[.061,-.218,.334,.056],[.101,-.292,.440,.034],[.145,-.258,.512,.008]],
  dog_beagle: [[0,0,0,.033],[.006,.012,.111,.035],[.019,.050,.237,.030],[.033,.119,.342,.025],[.053,.205,.431,.018],[.058,.267,.480,.008]],
  dog_boxer: [[0,0,0,.040],[.002,.008,.122,.041],[.012,-.043,.223,.032],[.035,-.144,.308,.025],[.059,-.250,.395,.016],[.085,-.283,.456,.005]],
  dog_bull: [[0,0,0,.043],[.009,-.009,.115,.043],[.030,-.042,.225,.037],[.075,-.102,.318,.029],[.118,-.197,.389,.019],[.137,-.281,.429,.007]],
  dog_chihuahua: [[0,0,0,.026],[.002,.029,.113,.032],[.012,.116,.187,.033],[.035,.207,.193,.027],[.054,.265,.141,.020],[.068,.264,.080,.010]],
  dog_dachshund: [[0,0,0,.037],[.003,.002,.148,.036],[.016,-.034,.267,.027],[.032,-.077,.380,.020],[.066,-.112,.471,.014],[.098,-.107,.509,.005]],
  dog_gpyrenees: [[0,0,0,.053],[.004,-.034,.122,.063],[.040,-.146,.250,.076],[.082,-.275,.382,.070],
    [.131,-.344,.470,.044],[.181,-.315,.540,.012]],
  dog_gshepherd: [[0,0,0,.046],[.008,-.021,.124,.050],[.025,-.104,.245,.046],[.061,-.232,.332,.038],[.093,-.379,.385,.023],[.125,-.397,.443,.008]],
  dog_pitbullmix: [[0,0,0,.039],[.007,.003,.128,.043],[.021,-.033,.245,.032],[.052,-.141,.346,.021],[.078,-.273,.403,.006]],
  dog_rottweiler: [[0,0,0,.049],[0,.014,.114,.052],[.015,.014,.241,.043],[.046,-.062,.357,.031],[.073,-.179,.440,.019],[.095,-.240,.469,.007]],
  dog_samoyed: [[0,0,0,.049],[.015,.034,.122,.063],[.047,.143,.182,.081],[.085,.250,.158,.103],
    [.137,.305,.055,.108],[.204,.287,-.088,.086],[.243,.242,-.228,.051],[.217,.182,-.316,.013]],
  dog_wad: [[0,0,0,.041],[.008,-.010,.136,.046],[.028,-.058,.280,.054],[.067,-.132,.413,.054],
    [.101,-.167,.521,.035],[.135,-.164,.567,.009]],
  dog_skeleton: [[0,0,0,.041],[.018,-.004,.120,.040],[.044,-.064,.246,.028],[.077,-.173,.350,.019],[.109,-.251,.408,.006]],
  dog_zombie_brute: [[0,0,0,.059],[.015,-.015,.133,.054],[.054,-.128,.250,.042],[.106,-.209,.331,.026],[.153,-.224,.378,.009]],
  dog_zombie_hulk: [[0,0,0,.067],[.013,-.007,.117,.066],[.046,-.048,.206,.055],[.075,-.137,.263,.034],[.094,-.234,.275,.012]],
  dog_zombie_rot: [[0,0,0,.048],[.018,.008,.136,.049],[.059,-.048,.245,.043],[.102,-.124,.324,.026],[.143,-.151,.367,.008]],
};

export function dogTail(p, type, { y, z, depth, pup, paint }) {
  const key = type === 'dog_zombie_cop' ? 'dog_gshepherd' : type;
  const anchors = profiles[key] ?? profiles.dog;
  const length = pup ? .76 : 1;
  const girth = pup ? .82 : 1;
  const rootY = y + depth * .19;
  const rootZ = z * .79;
  const spline = new CatmullRomCurve3(anchors.map(([x,dy,dz]) => V(x*length,rootY+dy*length,rootZ+dz*length)));
  const count = (anchors.length - 1) * 3;
  const segments = Array.from({ length: count + 1 }, (_, i) => {
    const at = i / 3;
    const lower = Math.min(Math.floor(at), anchors.length - 2);
    const t = at - lower;
    const radius = (anchors[lower][3] * (1 - t) + anchors[lower + 1][3] * t) * girth;
    const point = spline.getPoint(i / count);
    return [...point, radius, radius * .89];
  });
  const tipped = key === 'dog_beagle' || key === 'dog_bcollie';
  const pale = fur(0xe8deca, type + '-tail-tip');
  const tailPaint = (ctx, x, y, w, h, side) => {
    const ring = Number.parseInt(side, 10);
    // The start cap is buried in the rump. Only the tip and its last rings are white.
    const brush = tipped && (ring >= count-3 || side === 'cap') ? pale : paint;
    brush(ctx,x,y,w,h,side);
  };
  skin(p, 'tail-following-spine', segments, tailPaint, 8);
}
