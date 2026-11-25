import { blob, pile, rng, stoneP } from './item-kit.js';
import { V, bevel, clothP, cyl, flat, label, outline, paperP, path, plasticP, shade, top, tube } from './common-loot-kit.js';
import { produce } from './item-expansion-produce.js';
import { soup } from './item-expansion-soups.js';

const shell = (p, name, ratios, color, at = [0, 0, 0]) => {
  const [x, y, z] = ratios;
  blob(p, name, ratios, [at[0], at[1] + y, at[2]], plasticP(color), {}, 5, 10);
};

function crumbs(p,d) {
  const r = rng(d.id);
  if (/^spicebush_berries/.test(d.id)) {
    produce.berries(p,d);
    return;
  }
  if (d.id==='sprinkles') {
    const colors=[0xd37067,0x7195a1,0xcfaa52,0x87a665,0xbc83ad];
    for(let i=0;i<19;i++) {
      const x=(r()-.5)*.75,z=(r()-.5)*.75;
      tube(p,'colored sugar strand',V(x,.028,z),V(x+.044,.028,z+.021),.018,.018,6,plasticP(colors[i%colors.length]));
    }
    return;
  }
  if(d.id==='chem_agar') {
    for(let i=0;i<10;i++) {
      const a=i*2.4, dist=.34*Math.sqrt(i/10), x=Math.cos(a)*dist, z=Math.sin(a)*dist;
      outline(p,'clear agar flake',[[x-.067,z],[x-.025,z-.045],[x+.07,z-.019],[x+.043,z+.051]],.012,plasticP(shade(0xd1dcd0,.88+r()*.16)),.006*(i%4));
    }
    return;
  }
  if(d.id==='corn'||d.id==='popcorn_cob') return produce.corn(p,d);
  if(d.id==='empty_corn_cob') {
    cyl(p,'cob core','x',[0,.15,0],.14,.90,10,plasticP(0xb69b62),{},.093);
    return;
  }
  if (d.family === 'powder') {
    pile(p,'loose material',.46,.18,stoneP(d.color),d.id);
    return;
  }
  const seed = d.family === 'seed';
  for (let i=0;i<(seed?9:12);i++) {
    const a=i*2.4, dist=.37*Math.sqrt(i/12), size=(seed?.05:.08)+r()*.043;
    const black=d.id==='seed_canola';
    const color=black?0x3f3837:d.color;
    shell(p,'grain '+i,[size,size*(black?.83:seed?.43:.69),size*(black?1.04:seed?1.44:1.1)],shade(color,.74+r()*.42),[Math.sin(a)*dist,0,Math.cos(a)*dist]);
  }
}

function bread(p,d) {
  const round = /bun|roll/.test(d.name.toLowerCase());
  const flatBread = /flatbread|tortilla/.test(d.name.toLowerCase());
  const cracker = d.family === 'cracker';
  const crust=plasticP(flatBread?0xc5a373:0xa47745);
  const x=round?.39:.31, y=flatBread||cracker?.09:.29, z=.48;
  if(/tortilla/.test(d.id)) cyl(p,'round flatbread','y',[0,.023,0],.46,.046,14,crust);
  else bevel(p,'baked crust',[-x,0,-z,x,y,z],.06,crust);
  if(!flatBread && !cracker) for (let k=-1;k<=1;k++) {
    const cz=k*.23;
    path(p,'scored seam '+k,[[-x*.67,y,cz-.052],[0,y+.011,cz],[x*.65,y,cz+.060]],.023,plasticP(0xd6ad77));
  }
  if (cracker) for(let k=0;k<8;k++) {
    const x=(k%4-1.5)*.125,z=(Math.floor(k/4)-.5)*.25;
    cyl(p,'docking mark','y',[x,y+.001,z],.022,.004,6,flat(0x7c6243));
  }
}

function meat(p,d) {
  const n=d.name.toLowerCase(), cooked=/cooked|fried|deviled|onion/.test(n);
  const color = cooked ? 0x81533f : /tainted|putrid/.test(n) ? 0x687054 : /mi-go/.test(n) ? 0xc97893 : /poultry|fish|lobster|mollusk/.test(n) ? 0xcc8b78 : 0xa4514d;
  if (/desiccated/.test(n)) {
    outline(p,'drained strip of muscle',[[-.44,-.08],[-.30,-.16],[.28,-.11],[.47,.019],[.32,.17],[-.31,.145]],.065,plasticP(0x704944));
    for(let k=0;k<4;k++) path(p,'wrinkled muscle fiber',[[-.35,.065,-.073+k*.047],[-.10,.081,-.052+k*.047],[.34,.067,-.032+k*.046]],.012,plasticP(0x875d4d));
    return;
  }
  if (/heart/.test(n)) {
    shell(p,'muscular body',[.32,.29,.45],color);
    for(const x of [-.14,.05,.17]) tube(p,'vessel',V(x,.39,-.22),V(x,.61,-.38),.064,.051,7,plasticP(shade(color,1.15)));
    return;
  }
  if (/kidney/.test(n)) {
    path(p,'curved kidney',[[-.23,.15,-.28],[.11,.17,-.31],[.26,.17,0],[.18,.16,.26],[-.11,.14,.34]],.14,plasticP(color));
    return;
  }
  const thin = /fillet|liver/.test(n);
  const h=thin?.14:.23;
  outline(p,thin?'fillet or lobe':'cut of meat',[[-.42,-.24],[-.12,-.43],[.40,-.21],[.48,.16],[.14,.40],[-.42,.33]],h,plasticP(color));
  path(p,cooked?'browned edge':'pale outer edge',[[-.41,h,-.22],[-.14,h,-.40],[.21,h,-.27],[.39,h,-.15]],.027,plasticP(cooked?0x684635:0xd8b091));
}

function sandwich(p,d) {
  const bun=/burger|\bsub\b/.test(d.name.toLowerCase());
  const bread=plasticP(0xc9a36e);
  if(bun) {
    bevel(p,'bottom bread',[-.44,0,-.41,.44,.11,.41],.08,bread);
    bevel(p,'top bun',[-.44,.28,-.42,.44,.45,.42],.11,bread);
  } else {
    const slice=[[-.42,-.34],[-.21,-.45],[.41,-.40],[.44,.37],[-.37,.40]];
    outline(p,'lower slice',slice,.10,bread);
    outline(p,'upper slice',slice,.12,bread,.25);
  }
  const n=d.name.toLowerCase();
  const filling=/cheese/.test(n)?0xe3b259:/jelly/.test(n)||d.id==='sandwich_pbj'?0x94546e:/fluff|egg salad/.test(n)?0xded0a8:/vegg/.test(n)?0x9f5540:/chicken|fish/.test(n)?0xc59170:0x8b5948;
  p.box('filling',[-.42,.106,-.35,.42,.235,.37],plasticP(filling));
  if (/cheese|reuben|vegg|deluxe/.test(n)) p.box('second filling',[-.39,.206,-.39,.40,.241,.40],plasticP(/cheese|reuben/.test(n)?0xe6b365:0x768a4a));
  if (/grilled/.test(n)) for (const x of [-.19,0,.19]) p.box('toasted stripe',[x-.016,.371,-.27,x+.018,.376,.24],plasticP(0xa47643));
}

function pouch(p,d) {
  const color = d.family==='ration'?0x9e8959:d.color;
  bevel(p,'sealed flexible pouch',[-.31,0,-.46,.31,.15,.46],.05,plasticP(color));
  for(const z of [-.44,.44]) p.box('sealing strip',[-.32,.018,z-.025,.32,.060,z+.025],plasticP(shade(color,.65)));
  top(p,'printed panel',[-.22,-.34,.22,.34],.151,label(shade(color,.8),d.name,d.key));
}

export const food = {
  grain:crumbs, seed:crumbs,
  powder:crumbs, bread, cracker:bread, meat, sandwich, ration:pouch,
  egg: (p,d)=>shell(p,'egg shell',[.35,.33,.48],d.id==='egg_robin'?0x87bac9:d.color),
  mushroom(p,d) {
    if(d.id==='mushroom_ketchup') {
      const condiment=plasticP(0x785549);
      cyl(p,'condiment bottle','y',[0,.37,0],.19,.74,12,condiment);
      cyl(p,'flared neck','y',[0,.784,0],.19,.088,12,condiment,{},.081);
      cyl(p,'sealed cap','y',[0,.853,0],.086,.057,10,plasticP(0xd6ccb0));
      return;
    }
    cyl(p,'stem','y',[0,.17,0],.11,.34,8,plasticP(0xdac6a9),.085);
    if (/morel/.test(d.id)) {
      shell(p,'conical honeycomb cap',[.248,.29,.229],0x987948,[0,.26,0]);
      for(let k=0;k<18;k++) {
        const a=k*2.4, y=.38+(k%6)*.062, r=.17+(k%3)*.021;
        blob(p,'dark pit',[.044,.034,.041],[Math.cos(a)*r,y,Math.sin(a)*r],plasticP(0x6c5134),{},3,7);
      }
      return;
    }
    shell(p,'cap',[.43,.17,.41],d.color,[0,.28,0]);
    cyl(p,'gill underside','y',[0,.291,0],.35,.035,12,paperP(0xd2ba95));
  },
  bowl:soup,
  tablet(p,d) {
    const long = /naproxen|tramadol|caplet/.test(d.id);
    if(long) bevel(p,'oblong tablet',[-.43,0,-.23,.43,.21,.23],.10,plasticP(d.color));
    else cyl(p,'pressed tablet','y',[0,.11,0],.43,.22,12,paperP(d.color));
    top(p,'score',[-.019,-.19,.019,.19],.221,flat(shade(d.color,.66)));
  },
};

