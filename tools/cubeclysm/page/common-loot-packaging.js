import { band, blob, pile, rng, speckle, stoneP } from './item-kit.js';
import { add } from './lowpoly.js';
import { drawCannedFood, drawDrinkCan, drawEmptyCan, paintTomatoIcon } from './common-loot-canned.js';
import {
  GLASS, V, bevel, cement, clothP, cyl, fill, flat, front, glass, hull, label, lid, outline,
  paperP, path, poly, plasticP, ring, rubber, shade, steelP, top, tube, warmPaper,
} from './common-loot-kit.js';

const colors = {
  milk: 0x6c8da8, milk_UHT: 0x598075,
  mayonnaise: 0xc8b886, peanutbutter: 0xa27544, jam_fruit: 0x874359,
  horseradish: 0x9c8d72, marshmallow_fluff: 0x557095, honey_mustard: 0xb79248,
  bleach: 0x376883, disinfectant: 0x68856c, pepto: 0xaa637b, dayquil: 0xb97949, nyquil: 0x52567c,
  salt: 0x68899b, flour: 0xa39573, alcohol_wipes: 0x587b87, lens_case: 0x564e65,
};
const withColor = (d) => colors[d.id] ?? d.color;

function can(p, d) {
  const { id, name, key } = d;
  if (id === 'can_cheese') {
    const cheese=plasticP(0xdaaa64);
    bevel(p,'portion of cheese spread',[-.025,0,-.021,.025,.027,.021],.008,cheese);
    path(p,'cream fold',[[-.017,.025,-.003],[-.008,.034,-.009],[.009,.030,-.004],[.017,.024,.008]],.005,cheese);
    return;
  }
  if(id==='can_food_big') return drawEmptyCan(p,id,.081,.154);
  if(id==='can_aluminum_250ml') return drawEmptyCan(p,id,.033,.104,true);
  if(['cola','beer','pale_ale'].includes(id)) return drawDrinkCan(p,id,.033,.119);
  const smallTin = id === 'nic_pouch_can';
  const r = smallTin ? .034 : .036;
  const h = smallTin ? .026 : .075;
  if(drawCannedFood(p,d,r,h)) return;
  cyl(p,'cylindrical wall','y',[0,h/2,0],r,h,12,band(plasticP(withColor(d)),0xc7b894,.24,.72),{open:true});
  lid(p,'rolled base',r+.001,0,.004,cement);
  lid(p,'rolled top',r+.001,h-.004,.004,cement);
  front(p,'printed brand',[-r*.52,h*.2,r*.52,h*.83],-r-.001,label(withColor(d),name,key));
  if (smallTin) {
    top(p,'pouch brand',[-r*.61,-r*.58,r*.61,r*.58],h+.0006,label(0x5e727e,'TYNN',key));
    ring(p,'lid accent',r-.005,r-.002,h+.0005,flat(withColor(d)));
  }
}

function bottle(p, d) {
  const { id, name, key } = d;
  const pill = id.includes('pill');
  const tubeGlue = id.includes('glue');
  const jug = /jug|bleach|ammonia/.test(id);
  const darkGlass = id.includes('glass') || /soysauce|vinegar|nyquil/.test(id);
  const r = jug ? .066 : tubeGlue ? .02 : pill ? .024 : d.length && d.length >= .17 ? .032 : .028;
  const h = d.length || (jug ? .236 : pill ? .075 : tubeGlue ? .102 : .143);
  const cap = tubeGlue ? .009 : pill ? r*.96 : jug ? r*.41 : r*.48;
  const transparent = /bottle_(glass|plastic_355)/.test(id);
  const baseColor = pill ? (id.includes('prescription') ? 0xc17f3d : 0xe1dfd4)
    : transparent ? 0xbad0c5 : darkGlass ? 0x675643 : jug ? 0xd6d7cb : shade(withColor(d),1.22);
  const body = transparent ? glass : plasticP(baseColor);
  const capPaint = plasticP(pill ? 0xded9c9 : shade(withColor(d),.72));
  if (jug) {
    bevel(p,'moulded jug',[-r,0,-r*.66,r,h*.75,r*.66],.012,body);
    bevel(p,'sloping jug shoulder',[-r*.90,h*.70,-r*.60,r*.90,h*.86,r*.60],.014,body);
    path(p,'open carry handle',[[r*.36,h*.72,r*.42],[r*.67,h*.75,r*.42],[r*.67,h*.95,r*.42],[r*.24,h*.95,r*.42],[r*.12,h*.83,r*.42]],.008,body);
  } else {
    cyl(p,'bottle body','y',[0,h*.385,0],r,h*.77,12,body,transparent ? { ...GLASS,open:true } : {});
    cyl(p,'shoulder','y',[0,h*.817,0],r,h*.095,12,body,transparent ? GLASS : {},cap*.84);
    if (transparent) lid(p,'thick base',r*.96,0,h*.06,body);
  }
  lid(p,'neck',cap*.88,h*.858,h*.09,body);
  lid(p,tubeGlue ? 'nozzle cap' : 'ribbed closure',cap,h*.92,h*.08,capPaint);
  if (id === 'liquid_soap') {
    p.box('pump head',[-.014,h,-.008,.025,h+.008,.008],capPaint);
  }
  front(p,'label',[-r*.56,h*.24,r*.56,h*.66],-r*(jug ? .67 : 1.01),label(withColor(d),name,key));
}

function barbecueBottle(p) {
  const sauce=plasticP(0x663b2c), neck=plasticP(0x754536);
  bevel(p,'wide flat squeeze bottle',[-.042,0,-.017,.042,.104,.017],.006,sauce);
  const shoulder=(y,x,z,cut)=>[
    [-x+cut,y,-z],[x-cut,y,-z],[x,y,-z+cut],[x,y,z-cut],
    [x-cut,y,z],[-x+cut,y,z],[-x,y,z-cut],[-x,y,-z+cut],
  ].map(q=>V(...q));
  hull(p,'tapered bottle shoulders',[
    ...shoulder(.096,.041,.016,.005),...shoulder(.114,.025,.014,.006),
    ...shoulder(.125,.013,.011,.004),
  ],sauce);
  lid(p,'short bottle neck',.011,.122,.012,neck);
  lid(p,'tamper band',.013,.130,.004,plasticP(0x4a3a34));
  cyl(p,'ribbed flip-top cap','y',[0,.142,0],.013,.017,14,(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0x343334);
    fill(ctx,x,y,1,h,0x595552);
  },{},.0124);
  lid(p,'cap top',.0125,.149,.002,plasticP(0x2e3030));

  const frontLabel=(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0xe2c69a);
    fill(ctx,x,y+h*.10,w,h*.36,0x7f3e32);
    fill(ctx,x+w*.09,y+h*.52,w*.82,h*.35,0x4d4139);
    // Amber embers and grate stripes make the sauce legible at a distance.
    for(let i=0;i<4;i++) fill(ctx,x+w*(.23+i*.15),y+h*.74,w*.035,h*.095,0xbd8961);
    fill(ctx,x+w*.20,y+h*.71,w*.61,h*.026,0xdeae71);
    for(const [u,v] of [[.26,.64],[.47,.58],[.65,.65]]) fill(ctx,x+w*u,y+h*v,w*.08,h*.062,0xe37943);
    ctx.fillStyle='#f7e8c3';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font='bold '+Math.round(h*.27)+'px sans-serif';
    ctx.fillText('BBQ',x+w/2,y+h*.29,w*.83);
    fill(ctx,x,y+h*.91,w,h*.042,0xa86444);
  };
  front(p,'BBQ front label',[-.031,.027,.031,.083],-.0172,frontLabel,{ppm:960});
  poly(p,'back label',[V(-.029,.028,.0172),V(.029,.028,.0172),V(.029,.079,.0172),V(-.029,.079,.0172)],V(0,0,1),(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0xe2c69a);
    fill(ctx,x+w*.10,y+h*.13,w*.77,h*.075,0x7f3e32);
    for(let i=0;i<4;i++) fill(ctx,x+w*.11,y+h*(.29+i*.103),w*(.63+i%2*.13),Math.max(1,h*.034),0x826453);
    for(let i=0;i<8;i++) if(i!==3&&i!==6) fill(ctx,x+w*(.57+i*.035),y+h*.76,w*.017,h*.13,0x4f423a);
  },{ppm:840});
}

function ketchupBottle(p) {
  // CDDA uses the inverted condiment bottle for ketchup. The broad label faces
  // are flat through the middle, with rounded shoulders narrowing to the cap.
  const profiles=[
    [.019,.016,.013,.004],[.033,.022,.016,.005],[.055,.031,.0185,.006],
    [.072,.036,.019,.006],[.123,.036,.019,.006],[.145,.033,.0178,.006],
    [.163,.029,.015,.005],[.169,.022,.012,.004],
  ];
  const rings=profiles.map(([y,x,z,c])=>[
    [-x+c,y,z],[x-c,y,z],[x,y,z-c],[x,y,-z+c],
    [x-c,y,-z],[-x+c,y,-z],[-x,y,-z+c],[-x,y,z-c],
  ].map(q=>V(...q)));
  const faces=[];
  const face=(q,side)=>faces.push({p:q,side,wm:q[0].distanceTo(q[1]),hm:q[1].distanceTo(q[2])});
  for(let j=0;j<rings.length-1;j++) for(let i=0;i<8;i++) {
    const next=(i+1)%8;
    face([rings[j][i],rings[j][next],rings[j+1][next],rings[j+1][i]],i);
  }
  for(let i=1;i<7;i++) {
    face([rings[0][0],rings[0][i+1],rings[0][i]],8);
    face([rings.at(-1)[0],rings.at(-1)[i],rings.at(-1)[i+1]],9);
  }
  add(p,'inverted red squeeze bottle',faces,(ctx,x,y,w,h,side)=>{
    const color=side===0||side===4?0xb64839:side===9?0xa33e32:0xa94234;
    plasticP(color)(ctx,x,y,w,h);
  });
  const cap=plasticP(0xe7e2cf);
  lid(p,'bottom flip cap',.0207,0,.008,cap);
  lid(p,'flip cap seam',.0204,.008,.0015,plasticP(0xc9c3b3));
  cyl(p,'ribbed cap collar','y',[0,.0144,0],.0205,.010,14,(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0xebe5d5);
    fill(ctx,x,y,1,h,0xcdc8b7);
  },{},.019);
  p.box('cap thumb notch',[-.005,.005,-.0208,.005,.013,-.0193],plasticP(0xd8d1c1));

  front(p,'ketchup tomato front label',[-.0275,.071,.0275,.121],-.01915,(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0xefe1b5);
    fill(ctx,x,y+h*.05,w,h*.29,0x8f3d31);
    fill(ctx,x,y+h*.91,w,h*.045,0x819054);
    ctx.fillStyle='#f6e9c1';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font='bold '+Math.round(h*.17)+'px sans-serif';
    ctx.fillText('KETCHUP',x+w/2,y+h*.20,w*.89);
    ctx.save();
    ctx.translate(x,y+h*.355);
    ctx.scale(w/88,h*.53/46);
    ctx.translate(0,-29);
    paintTomatoIcon(ctx);
    ctx.restore();
  },{ppm:1200});
  poly(p,'ketchup back label',[V(-.024,.075,.01915),V(.024,.075,.01915),V(.024,.118,.01915),V(-.024,.118,.01915)],V(0,0,1),(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0xe9dbb4);
    fill(ctx,x+w*.10,y+h*.10,w*.66,h*.089,0x903e32);
    for(let i=0;i<4;i++) fill(ctx,x+w*.10,y+h*(.30+i*.106),w*(.56+i%2*.22),Math.max(1,h*.030),0x8a6e57);
    for(let i=0;i<9;i++) if(i%3!==2) fill(ctx,x+w*(.52+i*.038),y+h*.76,w*.019,h*.15,0x57493d);
  },{ppm:900});
}

function jar(p, d) {
  if (d.id === 'pickle') {
    const colors=[0x627049,0x506447,0x7e8751];
    const points=[[-.05,.016,-.003],[-.034,.019,-.008],[-.015,.02,-.010],[.009,.017,-.005],[.032,.015,.003],[.05,.012,.012]];
    points.slice(1).forEach((end,k)=>tube(p,`warty cucumber ${k}`,V(...points[k]),V(...end),
      k===0?.012:.016,k===4?.011:.016,8,plasticP(colors[k%3])));
    return;
  }
  if (d.id === 'barbecue_sauce') return barbecueBottle(p);
  if (d.id === 'ketchup') return ketchupBottle(p);
  if (d.id === 'honey_mustard') {
    bottle(p,d);
    return;
  }
  const r = d.volume >= 500 ? .045 : d.volume < 200 ? .031 : .038;
  const h = d.volume >= 500 ? .138 : d.volume < 200 ? .079 : .100;
  const lidPaint = steelP(shade(withColor(d),1.13));
  lid(p,'jar contents',r*.94,.005,h*.84,plasticP(shade(withColor(d),1.17)));
  cyl(p,'glass sides','y',[0,h*.447,0],r,h*.892,14,glass,{...GLASS,open:true});
  lid(p,'thick glass base',r,0,.007,glass);
  lid(p,'lid',r*.95,h*.88,h*.12,lidPaint);
  ring(p,'rim',r*.83,r*.92,h+.0004,lidPaint);
  front(p,'wrap label',[-r*.63,h*.2,r*.63,h*.71],-r-.001,label(withColor(d),d.name,d.key));
}

function packet(p, d) {
  const { id, key } = d;
  if (id === 'thyme') {
    const stem=flat(0x69714e), leaves=plasticP(0x5d7749);
    const points=[[-.046,.002,.017],[-.021,.008,.006],[.009,.007,-.003],[.048,.002,-.014]];
    path(p,'thyme stem',points,.0014,stem);
    for(let k=0;k<9;k++) {
      const x=-.031+k*.008, z=.010-k*.0025;
      for(const side of [-1,1]) {
        const dz=(.005+(k%2)*.002)*side;
        outline(p,`leaf ${k} ${side}`,[[x-.005,z],[x-.002,z+dz],[x+.006,z+dz*.70],[x+.003,z]],.0014,leaves,.006);
      }
    }
    return;
  }
  if (id === 'tea_bag') {
    bevel(p,'paper tea pouch',[-.024,0,-.026,.024,.005,.022],.002,paperP(0xbead8b));
    path(p,'loose string',[[0,.003,.016],[.008,.002,.037],[.022,.002,.043],[.030,.002,.039]],.0009,paperP(0xe2d9bf));
    top(p,'paper tag',[.024,.033,.043,.044],.0014,label(0x687c58,'TEA',key));
    return;
  }
  if (id === 'wrapper_bar') {
    const foil=paperP(0xbdb9a9), printed=label(0x6f6756,'SNACK',key);
    outline(p,'flattened torn wrapper',[[-.055,-.015],[-.047,-.022],[.045,-.017],[.049,.007],[.031,.019],[-.042,.013]],.001,foil);
    top(p,'creased print',[-.037,-.011,.033,.009],.0014,printed);
    path(p,'folded seam',[[-.054,.001,-.014],[-.036,.004,-.015],[-.012,.002,-.018]],.0013,foil);
    return;
  }
  if (id === 'blister_pack_small') {
    p.box('foil backing',[-.051,0,-.024,.051,.0012,.024],cement);
    for (const x of [-.033,0,.033]) for (const z of [-.010,.010]) {
      cyl(p,`blister ${x} ${z}`,'y',[x,.004,z],.0064,.006,10,glass,GLASS);
    }
    return;
  }
  const isBar = /bar/.test(id);
  const isWipe = id === 'alcohol_wipes';
  const w = isBar ? .108 : isWipe ? .079 : .065;
  const z = isBar ? .018 : isWipe ? .038 : .024;
  const h = isBar ? .017 : isWipe ? .004 : .008;
  bevel(p,'soft sealed packet',[-w/2,0,-z,w/2,h,z],Math.min(.003,h*.3),paperP(shade(withColor(d),1.15)));
  if (isBar || isWipe) {
    for (const side of [-1,1]) {
      const x = side * w/2;
      p.box(`crimp ${side}`,[x-.006,.001,-z,x+.006,.003,z],paperP(shade(withColor(d),.77)));
    }
  } else {
    p.box('clipped seam',[-w*.46,.002,-z-.002,w*.46,.004,-z+.004],warmPaper);
  }
  top(p,'face print',[-w*.4,-z*.86,w*.4,z*.86],h+.0004,label(withColor(d),d.name,d.key));
}

function sack(p, d) {
  const loose={ dry_rice:0xd4cbb0, flour:0xe2dac7, dry_lentils:0x967d52, oatmeal:0xbca379, dogfood_dry:0x806048, catfood_dry:0x8b634c };
  if (d.id in loose) {
    const color=loose[d.id], random=rng(d.id);
    const r=d.id==='flour'?.032:.046;
    pile(p,'loose dry ingredients',r,.0105,stoneP(color),d.id);
    if (d.id!=='flour') for(let k=0;k<28;k++) {
      const a=random()*2*Math.PI, distance=r*Math.sqrt(random())*.90;
      const x=Math.cos(a)*distance,z=Math.sin(a)*distance*.83;
      const y=.0017+.009*(1-distance/r);
      const rice=d.id==='dry_rice';
      blob(p,`loose grain ${k}`,[rice?.0045:.0034,.0018,.0025],[x,y,z],
        paperP(shade(color,.77+random()*.35)),{},2,6);
    }
    return;
  }
  const paint=clothP(d.color);
  bevel(p,'rounded canvas sack',[-.045,0,-.058,.045,.008,.058],.0025,paint);
  p.box('stitched closure',[-.036,.001,.048,.036,.006,.066],clothP(shade(d.color,.8)));
  path(p,'cord tie',[[-.022,.005,.042],[0,.009,.053],[.018,.006,.057],[.032,.003,.071]],.0025,clothP(0xc2b088));
}

function carton(p, d) {
  const { id, key }=d;
  if (id === 'macaroni_raw') {
    for (let k=0;k<6;k++) {
      const parent=p.group(`elbow ${k}`,{at:[(k%3-1)*.021,0,(Math.floor(k/3)-.5)*.029],rotY:k*1.9});
      path(p,'curved pasta',[[-.008,.003,.005],[-.004,.005,-.003],[.002,.005,-.004],[.007,.004,.002]],.0035,paperP(0xd1ab6b),{parent});
    }
    return;
  }
  if (id === 'spaghetti_raw') {
    for (let k=0;k<8;k++) {
      const z=(k-3.5)*.003;
      tube(p,`dry strand ${k}`,V(-.102+k*.002,.002,z),V(.100-k*.001,.002,z+.003),.00145,.00145,6,paperP(0xe1b973));
    }
    return;
  }
  if (id === 'toastem') {
    bevel(p,'baked pastry',[-.044,0,-.031,.044,.010,.031],.005,paperP(0xbd884c));
    top(p,'frosting and sprinkles',[-.036,-.025,.036,.025],.0105,(ctx,x,y,w,h)=>{
      ctx.fillStyle='#dcc4a5';
      ctx.fillRect(x,y,w,h);
      ctx.fillStyle='#9d5548';
      for(let k=0;k<11;k++) ctx.fillRect(x+2+(k*11)%Math.max(1,w-4),y+2+(k*19)%Math.max(1,h-4),2,1);
    });
    return;
  }
  if (id === 'six_bottle_box') {
    const pbr=paperP(0xb09570), edge=paperP(0x9d8059);
    const w=.220,depth=.149,h=.105,t=.004;
    p.box('base',[-w/2,0,-depth/2,w/2,t,depth/2],pbr);
    for (const side of [-1,1]) {
      const x=side*w/2,z=side*depth/2;
      p.box(`short wall ${side}`,[x-t/2,0,-depth/2,x+t/2,h*.66,depth/2],pbr);
      p.box(`long wall ${side}`,[-w/2,0,z-t/2,w/2,h*.66,z+t/2],pbr);
    }
    for(const x of [-w/6,w/6]) p.box(`slot divider ${x}`,[x-t/2,0,-depth/2,x+t/2,h*.62,depth/2],edge);
    p.box('centre divider',[-w/2,0,-t/2,w/2,h*.86,t/2],edge);
    path(p,'cutout carry grip',[[-.044,h*.83,0],[-.038,h,0],[.038,h,0],[.044,h*.83,0]],.005,pbr);
    front(p,'side print',[-w*.41,.014,w*.41,.053],-depth/2-.0022,label(d.color,'SIX PACK',key));
    return;
  }
  const large = /box_(medium|large)$/.test(id);
  const folded = id.endsWith('folded');
  const eggs = /carton_egg/.test(id);
  const beverage = /carton_(946|sealed)|^milk/.test(id);
  const w = id==='carton_sealed' ? .122 : large ? (id === 'box_large' ? .91 : .51) : folded ? .3 : eggs ? .29 : beverage ? .079 : id === 'box_cigarette' ? .058 : .143;
  const depth = id==='carton_sealed' ? .116 : large ? w*.83 : folded ? .19 : eggs ? (id.endsWith('_6') ? .094 : .105) : beverage ? .068 : .064;
  const h = id==='carton_sealed' ? .128 : large ? w*.57 : folded ? .009 : eggs ? .058 : beverage ? .174 : .100;
  const color = large || folded || eggs ? 0xb09676 : withColor(d);
  const kraft = paperP(color);
  if (beverage) {
    p.box('creased carton',[-w/2,0,-depth/2,w/2,h*.87,depth/2],paperP(0xe0daca));
    outline(p,'sealed top',[[-w/2,-depth/2],[w/2,-depth/2],[w/2,depth/2],[-w/2,depth/2]],.003,paperP(shade(color,1.13)),h*.87);
    hullTop(p,w,depth,h,paperP(shade(color,1.2)));
    if (id.startsWith('carton_')) lid(p,'threaded cap',.012,h*.895,.012,plasticP(0xe2ddc8));
  } else {
    bevel(p,eggs?'pressed pulp carton':'cardboard box',[-w/2,0,-depth/2,w/2,h,depth/2],Math.min(.008,h*.2),kraft);
    if (eggs) {
      p.box('lid seam',[-w*.47,h*.46,-depth*.505,w*.47,h*.53,-depth*.49],paperP(shade(color,.67)));
      for (const x of [-.10,0,.10]) p.box(`latch ${x}`,[x-.012,h*.27,-depth*.526,x+.012,h*.55,-depth*.49],kraft);
    }
  }
  if (large || folded) {
    top(p,'packing tape',[-w*.45,-depth*.065,w*.45,depth*.065],h+.0005,paperP(0xc5ae84));
    top(p,'shipping label',[-w*.33,depth*.13,-w*.08,depth*.32],h+.0007,label(0x9c9b8e,'DELIVERY',key));
  } else if (eggs) {
    top(p,'farm label',[-w*.36,-depth*.27,w*.36,depth*.29],h+.0004,label(withColor(d),'EGGS',key));
  } else {
    front(p,'front panel',[-w*.45,h*.13,w*.45,h*.79],-depth/2-.0005,label(withColor(d),d.name,key));
  }
}

function hullTop(p,w,d,h,paint) {
  const parent=p.group('roof seam', {at:[0,h*.91,0]});
  path(p,'clipped seam',[[-w/2,h*.08,0],[w/2,h*.08,0]],.0025,paint,{parent});
  for (const s of [-1,1]) {
    const x=w/2;
    const verts=[V(-x,h*.87,s*d/2),V(x,h*.87,s*d/2),V(x,h*.99,0),V(-x,h*.99,0)];
    const ordered=s>0?verts:verts.reverse();
    p.box(`roof end ${s}`,[s*x-.001,h*.87,-d*.27,s*x+.001,h*.95,d*.27],paint);
    // Four panels share the carton ridge; both axes keep the fold visible in thumbnails.
    poly(p,`paper fold ${s}`,ordered,V(0,1,s),paint);
  }
}

function vessel(p, d, kind) {
  const glassy = d.id.includes('glass') || d.id==='tumbler_plastic';
  const metal = /pewter/.test(d.id);
  const clear=glassy ? GLASS : {cutout:true};
  const r=kind==='cup' ? .043 : kind==='plate' ? .130 : .069;
  const h=kind==='cup' ? (d.id==='glass'?.145:.091) : kind==='plate' ? .022 : .064;
  const bottom=r*.68;
  const paint=glassy ? glass : d.id==='mortar_pestle' ? stoneP(0x77796d) : metal ? cement : plasticP(/ceramic/.test(d.id)?0xe3dac5:shade(d.color,1.25));
  cyl(p,'thick foot','y',[0,.006,0],bottom,.012,12,paint,glassy?GLASS:{});
  cyl(p,'raised sides','y',[0,(h+.01)/2,0],bottom,h-.01,12,paint,{...clear,open:true},r);
  ring(p,'rolled rim',r-.0035,r,h,glassy?flat(0x9bb8b4):paint);
  if (d.id==='ceramic_cup') {
    path(p,'loop handle',[[r*.9,h*.73,0],[r*1.2,h*.73,0],[r*1.45,h*.51,0],[r*1.25,h*.30,0],[r*.79,h*.30,0]],.006,paint);
  }
  if (d.id==='mortar_pestle') {
    tube(p,'stone pestle',V(-.057,h*.78,-.018),V(.051,h*1.3,.034),.012,.014,8,steelP(0x888e85));
  }
}

function aluminumSurvivalKit(p) {
  const aluminum=speckle('pressed aluminum',0xaebcbd,[0xb4c2c2,0xa5b1b3],.16);
  const rim=steelP(0xc5d0ce);
  const latch=steelP(0x889699);
  const gasket=flat(0x353d3b);
  const metal={metal:true,ppm:240};

  bevel(p,'pressed aluminum base',[-.126,0,-.071,.126,.048,.071],.004,aluminum,metal);
  p.box('dark lid gasket',[-.125,.046,-.071,.125,.051,.071],gasket);
  bevel(p,'rolled aluminum lid',[-.128,.050,-.074,.128,.060,.074],.0035,rim,metal);
  bevel(p,'stamped lid panel',[-.110,.058,-.057,.110,.064,.057],.002,aluminum,metal);
  const badge=[V(.058,.0642,-.022),V(-.058,.0642,-.022),V(-.058,.0642,.020),V(.058,.0642,.020)];
  poly(p,'survival kit enamel badge',badge,V(0,1,0),(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0x405e55);
    fill(ctx,x,y,w,h*.13,0x859787);
    ctx.fillStyle='#f2ebd1';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font=`bold ${Math.floor(h*.29)}px sans-serif`;
    ctx.fillText('SURVIVAL KIT',x+w/2,y+h*.55,w*.88);
  },{ppm:650});

  for(const x of [-.078,.078]) {
    bevel(p,'latch mounting plate',[x-.013,.028,-.075,x+.013,.056,-.071],.001,latch,metal);
    p.box('keeper',[x-.011,.049,-.080,x+.011,.055,-.073],rim,metal);
    bevel(p,'over-center latch lever',[x-.008,.023,-.081,x+.008,.047,-.076],.0015,aluminum,metal);
    cyl(p,'latch pivot','x',[x,.043,-.078],.0034,.021,8,latch,metal);
    cyl(p,'rear hinge barrel','x',[x,.048,.073],.0036,.035,8,latch,metal);
  }
}

function travelCase(p,d) {
  if (d.id==='survival_kit_box') return aluminumSurvivalKit(p);
  const w = d.length || (d.id==='rc_car_box' ? .27 : .17);
  const z = w * (/toolbox|rc_car/.test(d.id) ? .25 : .32);
  const h = z * (/pillbox/.test(d.id) ? .47 : .73);
  const base = /toolbox/.test(d.id) ? rubber : plasticP(shade(d.color,.82));
  const lidPaint=plasticP(shade(d.color,1.16));
  bevel(p,'case base',[-w/2,0,-z,w/2,h*.68,z],.006,base);
  bevel(p,'contrasting lid',[-w/2,h*.68,-z,w/2,h,z],.005,lidPaint);
  if (/pillbox/.test(d.id)) {
    for (let k=1;k<7;k++) {
      const x=(k/7-.5)*w;
      p.box(`divider ${k}`,[x-.001,h-.002,-z*.92,x+.001,h+.001,z*.92],base);
    }
    if (d.id === 'pillbox_large') p.box('second week divider',[-w*.47,h-.002,-.002,w*.47,h+.001,.002],base);
  } else if (/toolbox/.test(d.id)) {
    for (const s of [-1,1]) p.box(`latch ${s}`,[s*w*.29-.008,h*.53,-z-.006,s*w*.29+.008,h*.79,-z+.003],cement);
    path(p,'carry handle',[[-w*.24,h,0],[-w*.19,h+.024,0],[w*.19,h+.024,0],[w*.24,h,0]],.005,lidPaint);
  } else {
    top(p,'case label',[-w*.41,-z*.66,w*.41,z*.59],h+.0005,label(d.color,d.name,d.key));
  }
}

export const packaging = {
  can, bottle, jar, sack, packet, carton, case: travelCase,
  cup: (p,d)=>vessel(p,d,'cup'),
  bowl: (p,d)=>vessel(p,d,'bowl'),
  plate: (p,d)=>vessel(p,d,'plate'),
};
