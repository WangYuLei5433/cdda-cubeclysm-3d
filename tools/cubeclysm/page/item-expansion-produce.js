import { V, add, poly } from './lowpoly.js';
import { blob, rng, speckle } from './item-kit.js';
import { bevel, cyl, flat, outline, path, plasticP, shade, tube } from './common-loot-kit.js';

// Faceted skin with a continuous profile. Each band's color follows the surface,
// leaving the fruit recognisable from above without relying on a stem sprite.
function blend(a,b,weight) {
  return [16,8,0].reduce((rgb,shift)=>{
    const from=(a>>shift)&255, to=(b>>shift)&255;
    return rgb|(Math.round(from+(to-from)*weight)<<shift);
  },0);
}

function skin(p, name, profile, [width, depth], color, options = {}) {
  const { sides = 12, ribs = 0, lean = 0, at = [0,0,0], stripe = 0 } = options;
  const faces = [];
  const point = ([y, r], i) => {
    const a = i * 2 * Math.PI / sides;
    const ripple = ribs ? 1 + .13 * Math.cos(a * ribs) : 1;
    return V(at[0] + width*r*ripple*Math.cos(a) + y*lean, at[1] + y, at[2] + depth*r*ripple*Math.sin(a));
  };
  const face = (points, normal, side) => {
    if (points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).dot(normal) < 0) points.reverse();
    faces.push({ p:points, side, wm:points[0].distanceTo(points[1]), hm:points[1].distanceTo(points[2]) });
  };
  for (let k=0;k<sides;k++) {
    const a=(k+.5)*2*Math.PI/sides;
    for(let j=0;j<profile.length-1;j++) {
      const lower=profile[j],upper=profile[j+1];
      const dy=upper[0]-lower[0], dr=upper[1]-lower[1];
      const outward=V(dy*Math.cos(a),-dr*(width+depth)*.5,dy*Math.sin(a));
      face([point(lower,k),point(lower,k+1),point(upper,k+1),point(upper,k)],outward,[k,j]);
    }
    for(const [j,up] of [[0,-1],[profile.length-1,1]]) {
      const [h]=profile[j];
      face([point(profile[j],k),point(profile[j],k+1),V(at[0]+h*lean,at[1]+h,at[2])],V(0,up,0),[k,j]);
    }
  }
  const [base, blush = base, pores = shade(base, .83)] = color;
  add(p,name,faces,(ctx,x,y,w,h,[k,j])=>{
    const arc=Math.max(0,Math.cos((k+.35*j)*Math.PI*2/sides));
    const tone=stripe ? (k%3===0 ? blush : base) : blend(base,blush,arc*arc*.86);
    speckle(name+k+'-'+j,tone,[shade(tone,1.13),pores],.14)(ctx,x,y,w,h);
  });
}

const stem=(p,y,x=0,z=0)=>tube(p,'woody stem',V(x,y,z),V(x+.037,y+.083,z-.027),.027,.016,6,flat(0x655038));
function leaf(p, name, origin, direction, width, rise, colors) {
  const [x,y,z]=origin, [dx,dz]=direction;
  const L=Math.hypot(dx,dz), px=-dz/L*width,pz=dx/L*width;
  const start=V(x,y,z), tip=V(x+dx,y+rise,z+dz);
  const mid=V(x+dx*.52,y+rise*.57+.018,z+dz*.52);
  for(const s of [-1,1]) {
    const a=V(x+dx*.32+s*px*.73,y+rise*.26,z+dz*.32+s*pz*.73);
    const b=V(x+dx*.64+s*px,y+rise*.56,z+dz*.64+s*pz);
    poly(p,name+' blade',[start,a,b,mid],V(0,1,0),plasticP(shade(colors[0],s<0?.91:1.04)),{cutout:true});
    poly(p,name+' tip',[b,tip,mid],V(0,1,0),plasticP(shade(colors[0],s<0?.94:1.1)),{cutout:true});
  }
  tube(p,name+' vein',start.clone().add(V(0,.004,0)),tip.clone().add(V(0,.004,0)),Math.min(.011,width*.09),.003,5,flat(colors[1]));
}

const appleProfile=[[0,.51],[.06,.72],[.24,1],[.53,1.05],[.69,.78],[.65,.34]];
const roundProfile=[[0,.47],[.11,.80],[.35,1],[.59,.83],[.70,.43]];
const regular = {
  apple: [appleProfile,[.38,.37],[0xb84632,0xd77b3d,0xa74430]],
  crabapple: [appleProfile,[.34,.33],[0x98613a,0xb95a48,0x785333]],
  guayaba: [[[0,.29],[.14,.82],[.45,1],[.65,.88],[.78,.35]],[.34,.30],[0x99a65d,0xc4bd6d,0x839454]],
  kiwi: [[[0,.48],[.09,.85],[.25,1],[.44,.84],[.51,.51]],[.36,.48],[0x8b6744,0xaa8558,0x583e29]],
  mango: [[[0,.40],[.15,.77],[.43,1],[.65,.84],[.72,.46]],[.31,.42],[0xdba045,0xb95739,0xc18c38]],
  mayapple: [[[0,.42],[.14,.72],[.40,.94],[.62,.80],[.71,.37]],[.33,.36],[0xb9ab51,0xd1c46d,0xaa9c47]],
  peach: [roundProfile,[.37,.35],[0xe3a66a,0xcc6657,0xce9057]],
  plums: [[[0,.43],[.15,.82],[.42,1],[.64,.75],[.71,.40]],[.31,.34],[0x715092,0x996081,0x583d75]],
  grapefruit: [roundProfile,[.41,.39],[0xe3a458,0xf2bc69,0xc48343]],
  melon: [[[0,.53],[.14,.85],[.40,1],[.66,.84],[.73,.48]],[.42,.43],[0xad9c66,0xc3af77,0xe5ce93]],
  pomegranate: [roundProfile,[.36,.36],[0xa53d46,0xca6255,0x82313a]],
  tomato: [[[0,.67],[.09,.90],[.26,1.05],[.41,.91],[.47,.58]],[.41,.39],[0xdb4c35,0xe37139,0xbc3f2e]],
  bell_pepper: [[[0,.59],[.13,.86],[.42,.90],[.62,1],[.72,.74],[.69,.44]],[.35,.34],[0x428343,0x679947,0x387039]],
  pumpkin: [[[0,.63],[.12,.91],[.31,1],[.52,.94],[.63,.66],[.61,.29]],[.43,.42],[0xdb8335,0xec9b42,0xb7632b]],
};
function whole(p,d) {
  const id=d.id;
  if(id==='grapefruit') { skin(p,id,...regular[id]); return; }
  if(id==='apricot') {
    for(const [x,z] of [[-.23,-.10],[.14,.05],[.30,-.20],[0,.29]]) skin(p,'apricot',roundProfile.map(([h,r])=>[h*.58,r]),[.19,.17],[0xe49a45,0xc86536],{at:[x,0,z]});
    return;
  }
  if(id==='watermelon') {
    skin(p,'striped rind',[[0,.52],[.14,.82],[.36,1],[.58,.86],[.72,.52]],[.40,.48],[0x6b8c49,0x3d6644],{stripe:1,sides:18});
    return;
  }
  if(id==='pineapple') {
    skin(p,'oval pineapple skin',[[0,.67],[.15,.94],[.40,1],[.62,.88],[.71,.62]],[.29,.29],[0xa17e39,0xc49b51]);
    for(let j=0;j<4;j++) for(let k=0;k<10;k++) {
      const a=(k+j*.5)*Math.PI/5, x=Math.cos(a),z=Math.sin(a);
      const c=V(x*(.271+j*.004),.11+j*.153,z*(.271+j*.004)), t=V(-z,0,x).multiplyScalar(.076);
      poly(p,'pineapple eye',[c.clone().add(V(0,-.067,0)),c.clone().add(t),c.clone().add(V(0,.07,0)),c.clone().sub(t)],V(x,0,z),plasticP(j%2?0xd0a750:0xb98d41));
    }
    for(let k=0;k<9;k++) {
      const a=k*2.4, r=k<5?.29:.15;
      leaf(p,'spear-shaped crown',[0,.68,0],[Math.cos(a)*r,Math.sin(a)*r],.058,k<5?.22:.36,[0x507b4d,0x92a56c]);
    }
    return;
  }
  if(id==='lemon') {
    skin(p,'tapering lemon rind',[[0,.24],[.09,.62],[.22,.91],[.44,1],[.64,.67],[.72,.25]],[.27,.31],[0xddb83e,0xf3cf58,0xc49a29],{lean:.17});
    return;
  }
  if(id==='garlic_clove') {
    skin(p,'single curved garlic clove',[[0,.68],[.12,.98],[.27,.87],[.41,.50],[.49,.13]],[.22,.28],[0xe3d5af,0xf4e7cc,0xc8ba8e],{lean:.43});
    return;
  }
  if(/cucumber|gherkin|zucchini|chili/.test(id)) {
    const chili=id==='chili_pepper', small=id==='gherkin';
    pod(p,chili?'curved chili':id,
      chili?[[-.45,.07,-.07,.036],[-.31,.075,.084,.071],[-.12,.09,.12,.107],[.18,.118,.06,.118],[.37,.125,-.012,.067]]:
        [[-.44,.09,0,.067],[-.33,.14,-.03,.125],[-.12,.15,-.04,.144],[.18,.15,.02,small?.137:.156],[.43,.10,.04,.067]],
      chili?[0xc03b32,0xea694a]:[0x417445,0x74a254],true);
    return;
  }
  const [profile,dim,colors]=regular[id];
  const ribs=id==='pumpkin'?6:id==='bell_pepper'?3:id==='tomato'?5:0;
  skin(p,id,profile,dim,colors,{ribs,lean:id==='mango'?.15:0});
  const [y]=profile.at(-1);
  if(id==='pomegranate') {
    for(let k=0;k<5;k++) {
      const a=k*Math.PI*2/5;
      tube(p,'dried calyx',V(0,y,0),V(.065*Math.cos(a),y+.071,.065*Math.sin(a)),.032,.010,5,flat(0x743641));
    }
  } else if(/tomato|bell_pepper/.test(id)) {
    for(let k=0;k<5;k++) {
      const a=k*Math.PI*2/5;
      leaf(p,'green calyx',[0,y+.015,0],[Math.cos(a)*.15,Math.sin(a)*.15],.036,-.057,[0x4c743c,0x70934a]);
    }
    stem(p,y);
  } else if (/apple|peach|plums|pumpkin/.test(id)) stem(p,y);
}
function pod(p,name,points,colors,greenStem) {
  for(let i=0;i<points.length-1;i++) {
    const [x,y,z,r]=points[i],[nx,ny,nz,nr]=points[i+1];
    tube(p,name+' '+i,V(x,y,z),V(nx,ny,nz),r,nr,9,speckle(name+i,colors[i%2?1:0],[shade(colors[0],.88),colors[1]],.18));
  }
  if(greenStem) {
    const [x,y,z]=points.at(-1);
    tube(p,'green peduncle',V(x,y,z),V(x+.105,y+.056,z-.04),.035,.020,6,flat(0x5f753d));
  }
}
function banana(p) {
  const points=[[-.43,.085,-.10,.031],[-.35,.092,.04,.072],[-.17,.10,.17,.090],[.04,.103,.19,.095],[.26,.091,.106,.090],[.41,.112,-.039,.056]];
  pod(p,'yellow curved peel',points,[0xe1b746,0xedcd60],false);
  tube(p,'green-brown stem',V(.40,.11,-.044),V(.48,.161,-.125),.044,.027,7,flat(0x938244));
  tube(p,'dark blossom end',V(-.43,.085,-.10),V(-.456,.08,-.116),.027,.018,5,flat(0x654731));
}
function pieces(p,d) {
  const id=d.id;
  if(/chunks/.test(id)) {
    const pineapple=id.includes('pineapple'), color=pineapple?0xe1bf5c:0xe69560;
    for(const [i,[x,z]] of [[-.26,-.18],[.11,-.23],[.27,.14],[-.24,.24]].entries()) {
      outline(p,'irregular fruit chunk',[[x-.13,z-.09],[x+.054,z-.15],[x+.17,z-.024],[x+.086,z+.106],[x-.086,z+.13]],.13+i%3*.039,plasticP(shade(color,.90+i*.07)));
    }
    return;
  }
  if(id==='pumpkin_cut') {
    for(const x of [-.24,.22]) {
      outline(p,'rind',[ [x-.22,-.18],[x+.13,-.27],[x+.26,.04],[x+.09,.24],[x-.24,.07] ],.055,plasticP(0xc07631));
      outline(p,'orange edible flesh',[[x-.20,-.164],[x+.16,-.219],[x+.23,.031],[x+.074,.205],[x-.215,.053]],.13,plasticP(0xec9e4a),.052);
    }
    return;
  }
  if(/pepper/.test(id)) {
    const red=id.includes('chili'), paint=plasticP(red?0xcf4635:0x538f44);
    for(const [i,[x,z]] of [[-.23,.03],[.13,-.19],[.28,.18]].entries()) {
      const s=red?.68:1;
      path(p,'hollow sliced pepper',[[x-.12*s,.071,z-.13],[x-.045*s,.080,z+.087],[x+.105*s,.063,z+.13]],.065*s,paint);
      if(i!==1) tube(p,'pale inner rib',V(x-.09*s,.091,z-.109),V(x+.016*s,.096,z+.075),.021,.013,6,flat(0xe8cf9c));
    }
    return;
  }
  for(const [i,[x,z]] of [[-.23,-.16],[.10,-.27],[.22,.13],[-.16,.23]].entries()) {
    cyl(p,'thin dark-green skin','y',[x,.053+i%2*.037,z],.174,.10,14,plasticP(0x3d7540));
    cyl(p,'pale green cucumber section','y',[x,.104+i%2*.037,z],.153,.006,14,plasticP(0xb6cb8b));
    for(let k=0;k<3;k++) {
      const a=k*Math.PI*2/3;
      blob(p,'cucumber seed',[.019,.005,.027],[x+.055*Math.cos(a),.111+i%2*.037,z+.055*Math.sin(a)],flat(0xe3dbab),{},3,6);
    }
  }
}
const berryColors={
  blackberries:[0x382f4c,0x59536d], blueberries:[0x4e6389,0x8798ad], chokeberries:[0x43334c,0x70546f],
  cranberries:[0xa83547,0xd36a66], elderberries:[0x382d49,0x655872], grapes:[0x718d57,0xa7b476],
  hobbleberries:[0x772e4c,0xab4f63], huckleberries:[0x3f547b,0x7583ac], m_stellatum_berries:[0xa1473c,0xb8704e],
  mulberries:[0x55354b,0x8d5065], nannyberries:[0x424852,0x708089], raspberries:[0xaf4657,0xd27576],
  strawberries:[0xbf3937,0xe06550], spicebush_berries:[0xa94437,0xca6751],spicebush_berries_smoked:[0x783d36,0x986555],
};
function berries(p,d) {
  const id=d.id, color=berryColors[id];
  const aggregate=/blackberr|raspberr|mulberr/.test(id), straw=id==='strawberries', grape=id==='grapes';
  const rand=rng(id);
  for(let k=0;k<(straw?4:grape?9:7);k++) {
    const theta=k*2.4,r=.31*Math.sqrt(k/7), x=Math.cos(theta)*r,z=Math.sin(theta)*r;
    const s=(straw?.153:grape?.108:.091)+rand()*.029;
    if(aggregate) {
      for(let i=0;i<10;i++) {
        const a=i*Math.PI*2/5, h=(i<5?.072:.113);
        const reach=s*(i<5?.57:.35);
        blob(p,'individual drupelet',[s*.44,s*.43,s*.43],[x+Math.cos(a)*reach,h,z+Math.sin(a)*reach],plasticP(shade(color[i%2],.93+rand()*.13)),{},3,6);
      }
    } else if(straw) {
      skin(p,'tapered strawberry with seeds',[[0,.30],[.09,.67],[.22,1],[.28,.63]],[s,s*.87],[...color,0xe2ae77],{at:[x,0,z],sides:10});
      for(let i=0;i<4;i++) {
        const a=i*Math.PI/2;
        leaf(p,'strawberry calyx',[x,.279,z],[Math.cos(a)*s*.67,Math.sin(a)*s*.67],.03,-.037,[0x548140,0x788f4b]);
      }
    } else {
      blob(p,'individual berry',[s,s*.80,grape?s*1.16:s],[x,s*.8,z],plasticP(shade(color[0],.91+rand()*.2)),{},4,9);
      if(/blue|huckle/.test(id)) cyl(p,'dusty blossom crown','y',[x,s*1.58,z],s*.36,.01,6,flat(color[1]));
    }
  }
  if(grape) path(p,'branching grape stem',[[.045,.16,-.20],[-.031,.21,-.08],[.020,.19,.12],[.168,.14,.24]],.016,flat(0x7e7246));
}

function roots(p,d) {
  const id=d.id;
  if(id==='lotus_rhizome') {
    const base=plasticP(0xbda071), flesh=plasticP(0xe7d5aa);
    cyl(p,'lotus skin','x',[0,.201,0],.201,.77,12,base);
    cyl(p,'cut lotus face','x',[.388,.201,0],.183,.009,12,flesh);
    for(let i=0;i<7;i++) {
      const a=i*Math.PI*2/7;
      cyl(p,'dark air channel','x',[.395,.204+.104*Math.cos(a),.104*Math.sin(a)],.030,.004,8,flat(0x64523b));
    }
    return;
  }
  const palette={carrot:[0xdd7d39,0xbb5d2d],carrot_wild:[0xd5c09a,0xa5916e],chicory_raw:[0xb49a70,0x947249],
    dahlia_root:[0xac8060,0x906345],horseradish_root:[0xc5ae81,0x9d845c],raw_burdock:[0xa27c56,0x795b45],
    salsify_raw:[0xb89a72,0x8b694b],sugar_beet:[0xd0b48d,0xa99068],radish_taproot:[0xb84556,0xd7616a]};
  const color=palette[id];
  const thin=/burdock|salsify/.test(id), bulb=id==='sugar_beet'||id==='radish_taproot';
  if(bulb) {
    skin(p,'round taproot',[[0,.48],[.11,.80],[.29,1],[.46,.79],[.53,.40]],[.29,.30],color);
    path(p,'slender trailing root',[[.12,.055,-.12],[.34,.021,-.19],[.48,.014,-.20]],.022,flat(color[1]));
    for(let k=0;k<3;k++) leaf(p,'radish or beet greens',[0,.48,0],[.13+(k-1)*.15,.15-k*.075],.067,.16,[0x678349,0x9d9e58]);
    return;
  }
  pod(p,'tapering root',[[ -.45,.055,.019,.018],[-.26,.082,.031,thin?.058:.085],[.10,.125,0,thin?.087:.128],[.41,.159,-.02,thin?.112:.159]],color,false);
  for(let k=0;k<3;k++) leaf(p,'trimmed leaf stalk',[.41,.145,-.025],[.12, (k-1)*.16],.039,.073,[0x67864a,0x859f5b]);
}

function leaves(p,d) {
  const id=d.id, head=id.endsWith('_head');
  const dark=id.includes('kale'), dry=/tea|withered/.test(id);
  const colors=id==='tea_raw'?[0x735038,0x9c7852]:id==='withered'?[0xa0834b,0xb09561]:
    dark?[0x49774b,0x8da36c]:id.includes('lettuce')?[0x87aa54,0xbdc77b]:[0x5a844d,0x8da86d];
  if(head) {
    skin(p,'inner head',[[0,.60],[.15,.84],[.35,1],[.55,.91],[.66,.36]],[.28,.27],colors);
    for(let ring=0;ring<2;ring++) for(let k=0;k<7;k++) {
      const a=(k+ring*.45)*Math.PI*2/7;
      const P=(r,h,t)=>V(r*Math.cos(a+t),h,r*Math.sin(a+t));
      const lower=ring===0?.12:.33, upper=ring===0?.47:.61;
      const shadeColor=shade(colors[0],.87+(k%4)*.068+ring*.07);
      const outward=V(Math.cos(a),.64,Math.sin(a));
      const paint=plasticP(shadeColor);
      const base=P(.21,lower,0), mid=P(ring?.303:.323,lower+.16,0), tip=P(.22,upper+.03,0);
      for(const side of [-1,1]) {
        const edge=P(ring?.295:.326,lower+.15,side*.35);
        const lip=P(.26,upper,side*.35);
        poly(p,'overlapping cabbage leaf',[base,edge,lip,mid],outward,paint,{cutout:true});
        poly(p,'curled cabbage margin',[mid,lip,tip],outward,plasticP(shade(shadeColor,1.11)),{cutout:true});
      }
      tube(p,'leaf rib',mid,tip,.006,.002,5,flat(colors[1]));
    }
    return;
  }
  const shredded=id==='lettuce'||id==='cabbage';
  for(let k=0;k<(dry||shredded?11:7);k++) {
    const a=k*2.4,x=Math.cos(a),z=Math.sin(a),len=(dry?.19:shredded?.27:.37)*(1+k%3*.18);
    const u=Math.cos(a+1.45),v=Math.sin(a+1.45);
    const spread=shredded?.15:dry?.10:.12;
    leaf(p,shredded?'cut leafy ribbon':'veined leaf',[x*spread,.017+k*.009,z*spread],[u*len,v*len],
      dry?.056:shredded?.034:id==='grape_leaves'?.143:.107,.023+(k%3)*.026,[shade(colors[0],.88+(k%5)*.065),colors[1]]);
  }
}

function cornEar(p,d) {
  const popcorn=d.id==='popcorn_cob';
  const axis=popcorn?.115:.144;
  const profile=popcorn
    ? [[-.44,.046],[-.37,.073],[-.26,.095],[-.08,.097],[.11,.091],[.28,.073],[.40,.051],[.47,.021]]
    : [[-.44,.050],[-.37,.084],[-.26,.111],[-.08,.119],[.11,.115],[.28,.096],[.40,.069],[.47,.028]];
  const cobPaint=plasticP(popcorn?0xbe964f:0xceab5e);
  const sectionRadius=x=>{
    const pair=profile.findIndex(([position])=>position>=x);
    const [a,r0]=profile[Math.max(0,pair-1)], [b,r1]=profile[Math.max(1,pair)];
    return r0+(r1-r0)*(x-a)/(b-a);
  };
  for(let i=1;i<profile.length;i++) {
    const [a,r0]=profile[i-1],[b,r1]=profile[i];
    cyl(p,'tapered cob beneath the kernels','x',[(a+b)/2,axis,0],r0,b-a,14,cobPaint,{},r1);
  }
  const rand=rng(d.id);
  const corner=popcorn
    ? [[-.50,-.16],[-.34,-.46],[.28,-.49],[.50,-.18],[.50,.18],[.28,.49],[-.34,.46],[-.50,.16]]
    : [[-.50,-.30],[-.31,-.50],[.31,-.50],[.50,-.30],[.50,.30],[.31,.50],[-.31,.50],[-.50,.30]];
  const palette=popcorn
    ? [0xc78a31,0xd9a23a,0xc78c2c,0xe6af49,0xd49b36,0xe5b04e]
    : [0xdfab3d,0xeeb845,0xe3a837,0xf0c257,0xe6b24d,0xf0c95f];
  const kernels=[];
  const face=(points,out,tone)=>{
    if(points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).dot(out)<0) points.reverse();
    kernels.push({p:points,side:tone,wm:points[0].distanceTo(points[1]),hm:points[1].distanceTo(points[2])});
  };
  const rowCount=popcorn?14:12, angular=2*Math.PI/rowCount;
  const cols=popcorn?20:17;
  const pitch=popcorn?.0414:.049, kernelLength=popcorn?.041:.047;
  for(let row=0;row<rowCount;row++) {
    const turn=row*angular;
    const outward=V(0,Math.cos(turn),Math.sin(turn));
    for(let col=0;col<cols;col++) {
      const x=-.401+(col+.50+(row%2)*.38)*pitch;
      const radius=sectionRadius(x);
      const nearTip=x>.365;
      const tone=palette[Math.floor(rand()*palette.length)];
      const halfDepth=nearTip?.75:1;
      const make=(scale,raise)=>corner.map(([u,v])=>{
        const ax=x+u*kernelLength*scale*halfDepth;
        const a=turn+v*angular*.94*scale;
        const r=sectionRadius(ax)+raise;
        return V(ax,axis+r*Math.cos(a),r*Math.sin(a));
      });
      const height=popcorn?(nearTip?.012:.017):(nearTip?.017:.023);
      const base=make(1,-.006), crown=make(popcorn?.69:.77,height);
      for(let j=0;j<corner.length;j++) {
        const next=(j+1)%corner.length;
        const normal=base[j].clone().add(base[next]).multiplyScalar(.5).sub(V(x,axis+radius*Math.cos(turn),radius*Math.sin(turn)));
        face([base[j],base[next],crown[next],crown[j]],normal.addScaledVector(outward,.017),shade(tone,.92));
      }
      face([crown[0],crown[1],crown[6],crown[7]],outward,tone);
      face([crown[1],crown[2],crown[5],crown[6]],outward,shade(tone,1.045));
      face([crown[2],crown[3],crown[4],crown[5]],outward,tone);
    }
  }
  add(p,popcorn?'small amber popcorn kernels in tight rows':'plump kernels in close staggered rows',kernels,(ctx,x,y,w,h,tone)=>{
    ctx.fillStyle='#'+tone.toString(16).padStart(6,'0');
    ctx.fillRect(x,y,w,h);
  },{ppm:45});

  if(popcorn) {
    tube(p,'dry cut stem',V(-.515,.083,0),V(-.41,.106,0),.025,.037,8,plasticP(0xa78c61));
    leaf(p,'folded dry husk',[-.49,.079,-.023],[.29,-.104],.052,-.022,[0xb29961,0xd8bd82]);
    leaf(p,'short inner husk',[-.47,.087,.022],[.23,.095],.041,.034,[0xa18d59,0xc8ad76]);
    return;
  }

  tube(p,'pale cut stem',V(-.51,.082,0),V(-.405,.118,0),.028,.045,9,plasticP(0xa6a263));
  leaf(p,'green husk under the cob',[-.48,.073,-.032],[.41,-.160],.107,-.018,[0x608745,0x94ae61]);
  leaf(p,'peeled husk curling left',[-.49,.078,.030],[.35,.23],.090,.011,[0x487039,0x7f9a50]);
  leaf(p,'inner pale husk fold',[-.47,.105,.016],[.28,.099],.055,.095,[0x829a4e,0xaec36f]);
  for(let i=0;i<4;i++) {
    const z=(i-1.5)*.016;
    tube(p,'fine silk at the tapered tip',V(.449,axis+.010,z*.5),V(.50+i*.008,axis+.012+i*.007,z),.003,.0015,5,flat(0xcb9b58));
  }
}

export const produce = {
  banana, berries, root:roots, leaves, corn:cornEar,
  fruit:(p,d)=>d.id.includes('chunks')?pieces(p,d):whole(p,d),
  produce:(p,d)=>d.id.endsWith('_cut')?pieces(p,d):whole(p,d),
};

