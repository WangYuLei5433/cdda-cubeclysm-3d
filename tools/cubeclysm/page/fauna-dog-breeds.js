import { fill } from './paint.js';
import { dogTail } from './fauna-dog-tail.js';
import { blob, chain, eye, fur, markings, sides, skin } from './fauna-kit.js';

const breeds = {
  dog_beagle: {
    shoulder: .49, width: .161, depth: .181, length: .92, waist: .84, rump: .94,
    head: .134, muzzle: .177, ear: .258, paw: .052,
    coat: 0xa56538, underside: 0xe9ddc6, face: 0xac7144, chest: 0xebe2d1,
  },
  dog_boxer: {
    shoulder: .67, width: .207, depth: .240, length: .96, waist: .72, rump: .87,
    head: .169, muzzle: .119, ear: .168, paw: .061,
    coat: 0xa36a41, underside: 0xbd8961, face: 0xa97955, chest: 0xe6d5bf,
  },
  dog_bull: {
    shoulder: .53, width: .243, depth: .223, length: 1.02, waist: .78, rump: .88,
    head: .192, muzzle: .116, ear: .158, paw: .073,
    coat: 0xdfd5c1, underside: 0xe9dece, face: 0xe4dbcc, chest: 0xe9e1d2,
  },
};

function saddle(id, base, belly) {
  const paint = markings(id, base, belly, '', undefined, 12);
  const black = 0x3e3434;
  return (ctx, x, y, w, h, side) => {
    paint(ctx, x, y, w, h, side);
    if (side === 'cap') return;
    const [ring, edge] = side.split(':').map(Number);
    for (let col = 0; col < w; col++) {
      const turn = (edge + (col + .5) / w) * Math.PI / 6;
      const depth = Math.sin(turn);
      // Shorter near the sides and slightly uneven where black meets tan.
      if (depth < -.22 || ring === 0 || ring >= 4) continue;
      const edgeY = Math.floor((.16 + .09 * Math.cos(turn * 2)) * h);
      if (ring === 3) fill(ctx, x+col, y+edgeY, 1, h-edgeY, black);
      else fill(ctx, x+col, y, 1, h-(ring===1?edgeY:0), black);
    }
  };
}

export function domesticDogBreed(p, id) {
  const pup = id.endsWith('_pup');
  const type = pup ? id.slice(0, -4) : id;
  const breed = breeds[type];
  if (!breed) return false;

  const beagle = type === 'dog_beagle';
  const boxer = type === 'dog_boxer';
  const { width: w, depth: d, waist, rump, coat: tone, underside, face, chest } = breed;
  const height = breed.shoulder * (pup ? .73 : 1);
  const z = breed.length * (pup ? .448 : .51);
  const r = breed.head * (pup ? 1.16 : 1);
  const hz = -z - (pup ? .111 : .171);
  const hy = height + (beagle ? .145 : .164);
  const nz = hz - breed.muzzle * (pup ? .84 : 1);
  const ny = hy - (beagle ? .055 : .054);
  const main = fur(tone, id + '-coat');
  const head = fur(face, id + '-crown');
  const cream = fur(chest, id + '-cream');
  const mask = fur(beagle ? chest : boxer ? 0x423536 : 0x91827a, id + '-snout');
  const dark = fur(0x383136, id + '-nose');

  const torsoPaint = beagle ? saddle(id, tone, underside) :
    markings(id, tone, underside, boxer ? '' : 'patches', 0xa7795d, 12);
  skin(p, 'chest-waist-and-rump', [
    [0,height+.005,-z*1.08,w*.70,d*.66],
    [0,height+.028,-z*.82,w*.86,d*.92],
    [0,height-.011,-z*.38,w,d],
    [0,height-.017,z*.11,w*waist,d*(boxer?.69:.84)],
    [0,height-.013,z*.52,w*rump,d*.77],
    [0,height-.014,z*.86,w*rump*.81,d*.61],
    [0,height+.008,z*1.03,w*.29,d*.32],
  ], torsoPaint, 12);
  skin(p, 'neck-and-shoulders', [
    [0,height-.018,-z*.74,w*.74,d*.77],[0,height+.078,-z*.97,r*.91,d*.62],
    [0,hy-.024,hz+.098,r*.69,r*.67],
  ], main, 10);
  skin(p, 'white-bib', [
    [0,height-d*.57,-z*.91,w*.45,d*.20],[0,height-d*.28,-z*1.07,r*.63,d*.21],
    [0,hy-.118,hz+.113,r*.36,r*.15],
  ], cream, 8);

  skin(p, 'skull-and-cheeks', [
    [0,ny+.03,nz+.039,r*.63,r*.52],[0,hy-.008,hz-.059,r*.95,r*.78],
    [0,hy+.03,hz+.024,r,r*.78],[0,hy+.018,hz+.132,r*.82,r*.77],
    [0,hy-.027,hz+.175,r*.51,r*.56],
  ], head, 12);
  skin(p, 'muzzle', [
    [0,ny,nz-.038,r*.58,r*.29],[0,ny+.005,nz+.005,r*(beagle?.62:.82),r*.47],
    [0,ny+.025,hz-.035,r*.75,r*.49],
  ], mask, 10);
  blob(p, 'nose', [r*.42,r*.23,.031], [0,ny+r*.16,nz-.042], dark, {}, 3, 8);
  chain(p, 'closed-mouth', [[-r*.60,ny-r*.14,nz+.041],[0,ny-r*.29,nz-.025],[r*.60,ny-r*.14,nz+.041]],
    [.006,.009,.006], dark, 5);
  if (beagle || boxer) {
    skin(p, 'forehead-blaze', [[0,ny+.05,nz+.03,.025,.027],[0,hy+r*.49,hz-.057,.036,.036],
      [0,hy+r*.77,hz-.009,.022,.028],[0,hy+r*.75,hz+.071,.009,.013]], cream, 8);
  }

  for (const s of sides) {
    eye(p, 'brown-eye'+s, [s*r*.93,hy+r*.19,hz-.062], r*(pup?.26:.22), 0x765441);
    const e = breed.ear*(pup?1.03:1), y = hy+r*.55, x=s*r*.67, at=hz+.053;
    if (beagle || boxer) {
      skin(p, 'folded-ear'+s, [[x,y,at,.045,.049],[x+s*e*.25,y+e*.085,at+.008,e*.22,e*.19],
        [x+s*e*.32,y-e*.34,at-.035,e*.31,e*.115],[x+s*e*.33,y-e*.83,at-e*.26,e*.25,e*.11],
        [x+s*e*.28,y-e*.99,at-e*.24,e*.095,e*.064]], fur(beagle?0xa0613e:0x835436,id+'-ear'), 8);
    } else {
      skin(p, 'rose-ear'+s, [[x,y,at,.056,.053],[x+s*.052,y+.065,at+.003,.055,.049],
        [x+s*.093,y+.084,at+.032,.048,.033],[x+s*.118,y+.057,at+.053,.017,.013]], head, 8);
      blob(p, 'ear-fold'+s, [.026,.025,.030], [x+s*.081,y+.066,at-.004], fur(0xbf9786,id+'-ear'), {}, 3, 7);
    }

    for (const rear of [false,true]) {
      const stride = s*(pup?.023:.038);
      const sx=s*w*(rear?.63:.67), jointZ=(rear?z*.72:-z*.79)+stride;
      const foot=breed.paw*(pup?.93:1);
      const thigh = [sx*.74,height+.027,jointZ,foot*(rear?1.46:1.24),foot*(rear?1.79:1.40)];
      const knee = [sx,height*(rear?.61:.57),jointZ+(rear?-.081:.019),foot*1.02,foot*1.18];
      const ankle = [sx*1.03,height*.27,jointZ+(rear?.068:.018),foot*.60,foot*.65];
      const toe=[sx*1.04,foot*.57,jointZ+(rear?.030:-.025)];
      const paint=(ctx,x,y,w,h,part) => (beagle && !part.startsWith('0:') || boxer && part.startsWith('3:') ? cream : main)(ctx,x,y,w,h,part);
      skin(p,(rear?'hind-leg':'front-leg')+s,[thigh,knee,ankle,[...toe,foot*.73,foot*.79]],paint,8);
      blob(p,'grounded-paw'+s+rear,[foot*.95,toe[1],foot*1.24],[toe[0],toe[1],toe[2]-foot*.29],beagle||boxer?cream:main,{},3,8);
    }
  }

  dogTail(p, type, { y: height, z, depth: d, pup, paint: main });
  return true;
}
