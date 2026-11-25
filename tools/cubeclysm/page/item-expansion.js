import { blob, denimP, knitP, loop, woodP } from './item-kit.js';
import { V, bevel, clothP, cyl, fill, flat, label, outline, paperP, path, plasticP, shade, steelP, top, tube } from './common-loot-kit.js';
import { colorFor, identity } from './common-loot-kit.js';
import { wear } from './common-loot-wear.js';
import { ITEM_EXPANSION_DATA } from './item-expansion-data.js';
import { reading } from './item-expansion-reading.js';
import { produce } from './item-expansion-produce.js';
import { food } from './item-expansion-food.js';
import { objects } from './item-expansion-objects.js';

function jewelry(p,d) {
  const n=d.name.toLowerCase(), metal=steelP(d.color);
  const extraStones={alexandrite:0x678374,aquamarine:0x83bbcc,citrine:0xc4a35c,peridot:0x9da95b,tourmaline:0xaa667c};
  const [extraGem]=n.split(' ');
  const gem=d.detail ? parseInt(d.detail,16) : (extraStones[extraGem]??null);
  const set=(x,z,s=.085)=> {
    cyl(p,'polished setting','y',[x,s*.4,z],s*1.20,s*.75,8,metal);
    blob(p,'faceted stone',[s,s*.76,s],[x,s*.99,z],plasticP(gem??shade(d.color,1.25)),{},3,6);
  };
  const clasp=(x,z,s=.065)=>cyl(p,'clasp','y',[x,s*.42,z],s,s*.84,8,metal);
  if(d.family==='ring') {
    loop(p,'band',[0,.054,0],.337,.055,metal,{},12);
    if(d.id==='ring_engagement') {
      for(const x of [-.079,0,.079]) blob(p,'cluster diamond',[.058,.045,.056],[x,.107,-.311],plasticP(0xe2e6e9),{},3,6);
    } else if(gem!==null || /signet/.test(n)) set(0,-.316,.108);
  } else if(d.family==='earring') {
    if(/lip ring|nose ring/.test(n)) {
      clasp(0,.054,.26);
      tube(p,'short single post',V(0,.13,.05),V(0,.39,.05),.061,.056,7,metal);
      set(0,.05,.152);
      return;
    }
    if(/stud/.test(n) || gem!==null && !/dangl|hoop|drop/.test(n)) {
      for(const x of [-.22,.22]) {
        clasp(x,.147,.112);
        set(x,-.06,.13);
        tube(p,'post',V(x,.08,.13),V(x,.08,-.072),.037,.036,6,metal);
      }
    } else for(const x of [-.23,.23]) {
      loop(p,'earring loop',[x,.030,0],.157,.032,metal,{},9);
      if(gem!==null || /bead|charm|drop|dangl/.test(n)) set(x,-.18,.085);
    }
  } else if(d.family==='brooch') {
    const guard=/badge/.test(n);
    outline(p,'face plate',guard?[[-.30,-.32],[0,-.44],[.29,-.32],[.25,.18],[0,.40],[-.26,.18]]:[[-.34,-.19],[.28,-.22],[.37,.09],[.17,.25],[-.32,.18]],.095,metal);
    if(gem!==null) set(0,0,.15);
    else top(p,'enamel emblem',[-.18,-.17,.18,.14],.097,label(shade(d.color,.63),d.name,d.key));
  } else {
    const necklace=d.family==='necklace';
    const radius=necklace?.44:.363;
    const bead=/bead|pearl|woven|chain/.test(n);
    const wooden=d.id==='bead_necklace';
    const paint=wooden||/woven/.test(n)?clothP(wooden?0x645240:d.color):metal;
    loop(p,necklace?'necklace chain':'bracelet band',[0,.026,0],radius,necklace?.023:.036,paint,{},14);
    clasp(0,radius,.05);
    if(bead) for(let k=0;k<14;k++) {
      const a=k*Math.PI/7;
      const beadPaint=wooden?woodP(shade(0x946e47,.89+(k%4)*.11)):plasticP(gem??shade(d.color,.89+(k%4)*.11));
      blob(p,'bead',[.040,.035,.041],[Math.cos(a)*radius,.035,Math.sin(a)*radius],beadPaint,{},3,6);
    }
    if (/locket/.test(n)) {
      bevel(p,'hinged locket',[-.087,.001,-radius-.135,.087,.083,-radius+.020],.033,metal);
      top(p,'locket rim',[-.041,-radius-.101,.041,-radius-.012],.084,flat(shade(d.color,1.18)));
    } else if(gem!==null&&!bead || /charm|pendant|amulet|medallion/.test(n)) {
      set(0,-radius-.028,.089);
    }
  }
}

function shoes(p,d) {
  const n=d.name.toLowerCase(), boot=d.detail==='boot', slipper=d.detail==='slipper';
  const turnout=d.id==='boots_bunker';
  const cuff=/thigh.high/.test(n)?.72:/knee.high|rubber/.test(n)||turnout?.53:boot?.39:.21;
  const hide=/denim/.test(n)?denimP(d.color):/fur/.test(n)?clothP(d.color):plasticP(d.color);
  const dark=plasticP(shade(d.color,.61));
  for(const x of [-.224,.224]) {
    const sole=/wooden|clog|birchbark/.test(n)?plasticP(0xa38054):flat(0x3d3839);
    bevel(p,'shaped sole',[x-.14,0,-.46,x+.14,.074,.39],.041,sole);
    bevel(p,'vamp and toe',[x-.136,.062,-.439,x+.136,.192,.12],.058,hide);
    if(!slipper) {
      bevel(p,'shaft',[x-.123,.065,.0,x+.123,cuff,.36],.043,hide);
      p.box('opening',[x-.095,cuff-.001,.067,x+.095,cuff+.002,.304],dark);
      if(!/rubber|western|thigh.high|knee.high/.test(n)) for(let k=0;k<3;k++) {
        const z=-.115+k*.043;
        tube(p,'lace',V(x-.064,.199,z),V(x+.064,.199,z),.009,.008,5,clothP(0xc4b8a4));
      }
      if(/fur|winter/.test(n)) bevel(p,'cuff trim',[x-.135,cuff-.034,.011,x+.135,cuff+.021,.351],.026,clothP(0xc6b39d));
    }
    if(/steeltoed/.test(n)||turnout) top(p,'reinforced toe panel',[x-.082,-.395,x+.082,-.310],.193,steelP(0x74767a));
    if(turnout) p.box('visible cuff stripe',[x-.112,cuff-.062,-.004,x+.112,cuff-.041,.018],clothP(0xc4b85e));
  }
}

function belt(p,d) {
  const textile=clothP(d.color);
  if(d.id.startsWith('judo_belt_')) {
    loop(p,'rolled cloth sash',[0,.048,0],.29,.049,textile,{},12);
    path(p,'free end',[[.16,.053,-.22],[.29,.025,-.31],[.48,.023,-.26]],.026,textile);
    return;
  }
  loop(p,'rolled belt',[0,.056,0],.31,.055,textile,{},12);
  const frame=steelP(0xa9a8a2);
  for(const x of [-.14,.14]) p.box('buckle upright',[x-.022,.02,-.45,x+.022,.115,-.345],frame);
  for(const z of [-.435,-.354]) p.box('buckle bridge',[-.145,.085,z-.021,.145,.112,z+.021],frame);
  p.box('tongue',[-.013,.091,-.448,.013,.110,-.342],frame);
  if(/tool|police|fireman|webbing/.test(d.id)) {
    for(const a of [1.65,2.34,3.03,3.79]) {
      const x=Math.sin(a)*.31,z=-Math.cos(a)*.31;
      p.box('gear keeper',[x-.041,.074,z-.026,x+.041,.138,z+.026],clothP(shade(d.color,.59)));
    }
  }
}

function goggles(p,d) {
  const welding=d.id==='goggles_welding', snow=d.id==='iggaak';
  const frame=plasticP(d.color);
  for(const x of [-.218,.218]) {
    bevel(p,'eyepiece',[x-.18,.015,-.19,x+.18,.23,.084],.061,frame);
    frontLens(p,x,welding?0x3a423d:snow?0x252223:0x5c8291,snow?.030:.10);
  }
  p.box('bridge',[-.09,.07,-.19,.09,.146,-.07],frame);
  path(p,'elastic back strap',[[-.36,.095,.02],[-.39,.028,.28],[-.26,.021,.40],[.27,.021,.40],[.38,.03,.29],[.37,.095,.02]],.035,clothP(0x545057));
}
const frontLens = (p,x,color,h)=>bevel(p,'lens',[x-.132,.124-h/2,-.205,x+.132,.124+h/2,-.184],.012,plasticP(color));

function brace(p,d) {
  const fabric=clothP(d.color);
  for(const x of [-.225,.225]) {
    bevel(p,'neoprene forearm sleeve',[x-.18,0,-.45,x+.18,.20,.45],.095,fabric);
    for(const z of [-.34,.34]) p.box('elastic opening',[x-.165,.12,z-.035,x+.165,.203,z+.035],knitP(shade(d.color,.7)));
  }
}

function pack(p,d) {
  if (!d.id.startsWith('duffel')) return wear.pack(p,d);
  const fabric=clothP(d.color), strap=clothP(shade(d.color,.61));
  bevel(p,'soft duffel bag',[-.47,0,-.24,.47,.34,.24],.13,fabric);
  for(const x of [-.24,.24]) {
    p.box('webbing belt',[x-.031,.30,-.20,x+.031,.345,.20],strap);
    path(p,'carrying strap',[[x,.34,-.17],[x,.46,-.079],[x,.462,.079],[x,.34,.17]],.021,strap);
  }
  p.box('zipper seam',[-.38,.34,-.012,.38,.349,.012],strap);
}

function scarf(p,d) {
  const stretched=/long/.test(d.id), head=/headwrap/.test(d.id);
  const fabric=/knit/.test(d.id)?knitP(d.color):clothP(d.color);
  const width=head?.22:.136,length=stretched?.46:.36;
  const folded=d.id.includes('loose');
  if(head) {
    const parts=[[-.33,-.24],[-.07,-.40],[.29,-.27],[.22,.09],[-.25,.13]];
    outline(p,'triangular wrap',parts,.023,fabric);
    path(p,'tied ends',[[-.26,.019,.05],[.02,.062,.17],[.32,.029,.33]],.056,fabric);
  } else {
    bevel(p,folded?'loose folded scarf':'woven scarf',[-width,0,-length,width,.041,length],.019,fabric);
    if(folded) p.box('overlapping fold',[-width*.67,.038,-length*.68,width*.90,.061,length*.77],fabric);
    if(d.id.includes('patchwork')) top(p,'stitched cloth panels',[-width*.85,-length*.87,width*.85,length*.87],folded?.062:.042,(ctx,x,y,w,h)=>{
      for(let k=0;k<8;k++) fill(ctx,x+((k%2)*w/2),y+Math.floor(k/2)*h/4,w/2,h/4,shade(d.color,.74+(k*19%40)/100));
    });
    for(let k=0;k<7;k++) {
      const x=(k-3)*width*.23;
      p.box('fringe',[x-.008,0,length-.008,x+.008,.014,length+.047],fabric);
    }
  }
}

function pants(p,d) {
  if(d.id!=='striped_pants') return wear.pants(p,d);
  const paint=(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0xe1dfd3);
    for(let k=0;k<6;k++) fill(ctx,x,y+h*k/6,w,h/12,0x36343a);
  };
  p.box('striped waist',[-.24,0,-.43,.24,.055,-.19],paint);
  for(const x of [-.125,.125]) bevel(p,'striped leg',[x-.107,0,-.21,x+.107,.044,.44],.016,paint);
}

function shirt(p,d) {
  if(!['shirt_straw','cheerleader_top_short','combat_shirt'].includes(d.id)) return wear.shirt(p,d);
  const straw=d.id==='shirt_straw', cheers=d.id==='cheerleader_top_short';
  const base=straw?0xaa955c:cheers?0xb65051:0x566149;
  const paint=straw?woodP(base):clothP(base);
  const bottom=cheers?.21:.40;
  outline(p,'torso',[[-.19,-.20],[-.12,-.30],[-.07,-.176],[.07,-.176],[.12,-.30],[.19,-.20],[.21,bottom],[-.21,bottom]],straw?.093:.044,paint);
  if(cheers) {
    top(p,'Cheers lettering',[-.158,-.118,.158,.031],.046,label(0xa04b49,'CHEERS',2));
    return;
  }
  const camo=(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0x7d7e55);
    for(let k=0;k<11;k++) fill(ctx,x+w*((k*17%41)/50),y+h*((k*11%37)/47),w*.18,h*.16, k%2?0x504c39:0xa09062);
  };
  for(const s of [-1,1]) {
    outline(p,'sleeve',[[.145,-.212],[.248,-.263],[.44,straw?-.077:.29],[.345,straw?.003:.36],[.176,-.081]].map(([x,z])=>[x*s,z]),straw?.087:.071,straw?paint:camo);
    if(!straw) {
      const x=.246*s;
      top(p,'shoulder pocket',[x-.048,-.117,x+.048,-.019],.073,clothP(0x625d44));
    }
  }
}

const reused={pack,pants,shirt,scarf};
const shapes={...food,...produce,...objects,...reused,book:reading,magazine:reading,
  ring:jewelry,necklace:jewelry,bracelet:jewelry,earring:jewelry,brooch:jewelry,
  boots:shoes,belt,goggles,brace};

const volumeAspects={
  book:2.47, magazine:3.42, paper:5.8, boots:1.98, pants:2.35, shirt:2.3, scarf:2.64,
  textile:3.15, metalSheet:3.50, sandpaper:3.9, twig:3.1, rod:7.3, pipe:4.8, hose:2.8,
  belt:2.4, egg:1.53, banana:3.20, berries:1.72, root:2.28, leaves:1.68, bread:1.76,
  wire:1.78, necklace:3.45, ring:1.78, bracelet:2.0, earring:1.87, blister:2.54,
  bottle:2.1, jar:1.53, drum:1.44, tank:2.27, box:1.68, battery:2.58, cardboardTube:3.2,
  foil:3.6, tablet:1.45, powder:1.9, seed:1.75, ration:2.00,
};
const asMeters=(id,family,ml,mm)=>{
  // CDDA gives these coin cells a 1 mm inventory length but calls out 2032 batteries.
  if (id==='light_minus_battery_cell' || id==='light_minus_disposable_cell') return .020;
  if (mm) return mm/1000;
  // These ears have volume but no authored length in CDDA.
  if (id==='corn') return .178;
  if (id==='popcorn_cob') return .162;
  if (/^sheet_(canvas|felt)$/.test(id)) return .6096;
  return Math.cbrt(ml/1e6)*(volumeAspects[family]??1.81);
};
const source='tools/cubeclysm/page/item-expansion.js';

export const ITEM_EXPANSION=Object.entries(ITEM_EXPANSION_DATA).flatMap(([family,rows])=>{
  const shape=shapes[family];
  if(!shape) throw new Error('Unknown item shape '+family);
  return rows.map(([id,name,zh,volume,mm,color,detail])=>{
    const length=asMeters(id,family,volume,mm);
    const item={id,name,volume,length,family,key:identity(id),color:color?parseInt(color,16):colorFor(id),detail};
    return {
      id, source, group:'items', ppm:shape===reading?530:reused[family]&&family!=='scarf'?110:54, longestSide:length,
      names:{en:name,...(zh?{zh_CN:zh}:{})}, build:(p)=>shape(p,item),
    };
  });
});

