import { V, blob, hull, flat, shade, sides, ink, fur, chain, skin, markings, eye, blade } from './fauna-kit.js';

// [silhouette, back, breast, crown, wing, bill, identifying parts]
const birds = {
  bluejay: ['song',0x466daf,0xe0e3e4,0x597fbd,0x315495,0x2f3036,{ crest:.18,bar:0xd6dfe5,mask:0x293047 }],
  cardinal: ['song',0xb42e3a,0xbd303d,0xe44647,0x872d3b,0xd96c45,{ crest:.22,mask:0x292429,billDepth:.105 }],
  chickadee: ['song',0x827e79,0xd3c6b0,0x282631,0x666878,0x323139,{ cheek:0xe4e0d1,bib:0x39353d }],
  chicken: ['fowl',0x976043,0xc19363,0xac713f,0x764431,0xc9a65f,{ comb:true,arch:true }],
  coot: ['rail',0x454552,0x54545f,0x24242d,0x3b3a44,0xe3dacb,{ shield:0xe6dfd4,toes:0x78815a,iris:0xa74240 }],
  cormorant: ['diver',0x383236,0x343039,0x28252b,0x473c3d,0x9b8c65,{ hook:true,bib:0xd68d38,spread:true,web:true }],
  crow_mutant: ['heavy',0x353040,0x514056,0x292537,0x332b3d,0x2d2830,{ hook:true,burly:1.45,distorted:true }],
  crow_mutant_small: ['heavy',0x2d2a37,0x483747,0x333040,0x353040,0x352a32,{ hook:true,burly:1.25,distorted:true }],
  duck: ['duck',0x797c74,0x59433b,0x326447,0x7b7771,0xd2ab4f,{ web:true,collar:0xe5dfcc,bar:0x495bb5,cheek:0x386b4c }],
  duck_domestic: ['duck',0xdfdfd4,0xf1ede1,0xf2eadc,0xe6dfd7,0xd08a49,{ web:true }],
  goose: ['goose',0xd5d3ca,0xe1dcd1,0xeae4d9,0xc0bdb6,0xd98039,{ web:true,toes:0xc17e4c }],
  goose_canadian: ['goose',0x807364,0xa29683,0x25252b,0x62574d,0x2d2932,{ web:true,neck:0x292830,cheek:0xe4ddcd,toes:0x484048 }],
  grebe: ['diver',0x695351,0xa8644a,0x30303a,0x575052,0x48414c,{ crest:.08,cheek:0xd5a153,web:true,iris:0xba4940 }],
  grouse: ['fowl',0x846248,0xc6a987,0xa78763,0x775744,0x6f5445,{ fan:true,bar:0x463938,crest:.065 }],
  guinea_fowl: ['fowl',0x626171,0x696675,0x879fb1,0x575965,0xc8b8a0,{ spots:true,casque:true,wattle:true }],
  hummingbird: ['hover',0x367857,0xbec4b0,0x477853,0x304c48,0x262a31,{ bib:0xc03a59,needle:true,spread:true }],
  moorhen: ['rail',0x66564d,0x474752,0x2c2b34,0x51413c,0xb23f37,{ shield:0xce493d,tip:0xd8bd59,bar:0xe3d9c9,toes:0x9d9e58 }],
  pheasant: ['fowl',0xa06340,0xbd834e,0x286653,0x7f5141,0xc4a168,{ collar:0xe1dac4,mask:0xb2413a,longTail:true,bar:0xd8b779 }],
  pigeon: ['plump',0x848698,0x9a8a99,0x777b8d,0x626778,0x54515c,{ cere:true,bib:0x517a6b,bar:0x343642,iris:0xbd7651 }],
  raven: ['corvid',0x272733,0x373542,0x27252f,0x303040,0x211e29,{ hook:true,rough:true }],
  robin: ['song',0x665b52,0xa64d36,0x4f4642,0x514843,0xcda24a,{ bib:0xc66846,eyeRing:0xcaad95 }],
  sparrow: ['song',0x826045,0xb0a298,0x806c62,0x644939,0x675049,{ bib:0x393133,bar:0xcbb395,cheek:0xb8aaa0 }],
  turkey_domestic: ['fowl',0xe1d9c4,0xd3cab7,0x9e89a3,0xd4ccbb,0xb78e76,{ burly:1.36,turkey:true,fan:true,wattle:true,neck:0xa96465 }],
  waxwing: ['song',0x9c8472,0xc0aa89,0xaa8c72,0x625b66,0x302b34,{ crest:.21,mask:0x2c2631,tailTip:0xe2c255,bar:0xc04444 }],
  woodpecker: ['song',0x32303a,0xdfd9c9,0x3a3340,0x312e3a,0x4c4650,{ bars:true,mask:0xddd4c3,nape:0xc34345,needle:true,longTail:true }],
};
const profiles = {
  song:[.255,.44,.40,.102,.102,.185,.16], plump:[.29,.46,.42,.145,.13,.22,.14],
  fowl:[.35,.58,.51,.275,.125,.27,.16], duck:[.31,.38,.53,.16,.14,.15,.30],
  goose:[.35,.41,.56,.55,.13,.22,.24], diver:[.315,.38,.55,.51,.113,.24,.21],
  rail:[.26,.49,.44,.13,.13,.28,.17], hover:[.19,.45,.28,.07,.10,.13,.33],
  corvid:[.27,.51,.49,.15,.135,.28,.245], heavy:[.32,.52,.51,.11,.145,.36,.28],
};
// Adult profiles: chest width, chest height, chest length, exposed neck, head radius, shin, bill length.
export function bird(p, id) {
  const chick=id.endsWith('_chick');
  const parent=id.replace(/_chick$/,'');
  const water=['coot','cormorant','duck','duck_domestic','goose','goose_canadian','grebe','moorhen'].includes(parent);
  const dark=['crow','grouse','pheasant','pigeon','raven','turkey','turkey_domestic'].includes(parent);
  const yellow=['chicken','guinea_fowl'].includes(parent);
  const lobed = parent==='coot'||parent==='grebe';
  const adult = birds[parent];
  const sprout = adult?.[6] ?? {};
  const juvenileProfile = adult ? profiles[adult[0]] : profiles.corvid;
  const [kind,body,belly,headColor,wing,bill,traits]=chick
    ? ['plump',water?0x8f7351:dark?0x645148:yellow?0xb8a05a:0x89817d,water||yellow?0xd7b975:0xaa9a88,
      water?0xb09062:dark?0x735e4f:yellow?0xd7b76a:0x918680,water?0x806548:dark?0x5e4b43:0x78675c,water?0xa18150:0x8c6850,{
        web:water&&!lobed,billDepth:sprout.hook?.043:sprout.billDepth?.073:undefined,
        hook:sprout.hook,needle:sprout.needle,toes:sprout.toes,
        cheek:water?0xc7a76f:undefined,spots:yellow||dark,
      }]
    : birds[id];
  const [w0,h0,l0,n0,r0,leg0,bl0]=chick ? juvenileProfile : profiles[kind];
  const aberrant=id==='crow_mutant', mutant=traits.distorted;
  const w=w0*(chick?1.06:traits.burly??1), h=h0*(chick?.81:traits.burly??1);
  const length=l0*(chick?.74:1), n=n0*(chick?.25:1), r=r0*(chick?1.29:1), leg=leg0*(chick?(water?.50:.62):aberrant?.55:mutant?.72:1);
  const y=leg+h*.76, hy=y+h*.35+n, hz=-length*.65-n*.34;
  const bodyPaint=markings(id,body,belly,traits.spots?'spots':'',chick?shade(body,.79):0xc1bdaf);
  const soft=fur(body,id), crown=fur(headColor,id+'-head'), flight=fur(wing,id+'-wing'), billPaint=fur(bill,id+'-bill');
  const toes=fur(traits.toes??(traits.web?0xbc7b48:kind==='corvid'?0x423b48:0x9a7553),id+'-foot');
  skin(p,'streamlined-body',[[0,y+h*.16,-length*.77,w*.60,h*.37],[0,y,-length*.46,w*.95,h*.51],
    [0,y-.025,0,w,h*.55],[0,y+.012,length*.52,w*.75,h*.42],[0,y+.067,length*.89,w*.35,h*.21]],bodyPaint);
  skin(p,'bent-neck',[[0,y+h*.13,-length*.50,w*.62,h*.41],[0,hy-n*.70,-length*.75,r*.72,r*.77],
    [0,hy-n*.37,hz+.10,r*.57,r*.59],[0,hy+.015,hz+.045,r*.78,r*.74]],fur(traits.neck??headColor,id+'-neck'),8);
  blob(p,'head',[r,r*(chick?.95:.88),r*1.04],[0,hy,hz],crown,{},4,9);
  if (traits.bib) blob(p,'throat-patch',[r*.78,r*1.06,r*.61],[0,hy-r*.58,hz-r*.45],fur(traits.bib,id+'-bib'),{},3,8);
  if (traits.collar) {
    skin(p,'neck-ring',[[0,hy-r*1.41,hz+.081,r*.65,r*.62],[0,hy-r*1.18,hz+.068,r*.75,r*.72],
      [0,hy-r*.92,hz+.052,r*.72,r*.69]],fur(traits.collar,id+'-neck-ring'),8);
  }
  if (mutant) {
    blob(p,'overhanging-carrion-gut',[w*.89,h*(aberrant?.61:.46),length*.63],[.031,y-h*.20,-length*.24],fur(aberrant?0x4e3c4a:0x443343,id+'-gut'),{},4,9);
    const torn=fur(0x564653,id+'-feather');
    for (let i=0;i<(aberrant?6:4);i++){
      const x=(i%2===0?1:-1)*w*(.56+i*.041), yy=y+h*(.32-i*.025), z=-length*.16+i*.079;
      hull(p,'broken-pin-feather'+i,[V(x*.86,yy-.028,z),V(x*.74,yy+.022,z+.08),V(x*1.14,yy+.163,z+.17),V(x*1.02,yy-.006,z+.18)],torn);
    }
  }
  const wb=r*(traits.web?.67:traits.needle?.20:traits.billDepth?.58:.50), bl=bl0*(chick?.56:mutant?1.22:id==='raven'?1.16:1), by=hy-r*.14;
  const bz=hz-r*.70, bd=traits.billDepth??(traits.web?.039:traits.needle?.025:kind==='corvid'||traits.hook?.074:.055);
  skin(p,'upper-bill',[[0,by,bz-bl,wb*(traits.web?.70:.08),bd*.17],
    [0,by+bd*.34,bz-bl*.77,wb*(traits.web?.92:.35),bd*.59],[0,by+bd*.14,bz-.009,wb,bd]],billPaint,8);
  skin(p,'lower-bill',[[0,by-bd*.27,bz-bl*.94,wb*(traits.web?.61:.055),bd*.14],
    [0,by-bd*.44,bz-bl*.55,wb*.69,bd*.35],[0,by-bd*.51,bz,wb*.90,bd*.39]],fur(shade(bill,.70),id+'-lower-bill'),7);
  if (traits.hook) chain(p,'hooked-tip',[[0,by+.018,bz-bl*.78],[0,by+.011,bz-bl*.98],[0,by-bd*.53,bz-bl*1.05]],[bd*.48,bd*.28,.003],billPaint,6);
  if (traits.tip) blob(p,'bill-tip',[wb*.64,bd*.40,.029],[0,by,bz-bl*.88],flat(traits.tip),{},3,7);
  if (traits.cere||traits.shield) blob(p,'bill-base',[wb*.88,bd*(traits.shield?1.65:.75),.043],[0,by+bd*.75,bz+.01],flat(traits.shield??0xcdbcb6),{},3,7);
  if (traits.crest) {
    const tall=traits.crest, swept=id==='waxwing'?.18:id==='bluejay'?.111:.077;
    skin(p,'layered-feather-crest',[[0,hy+r*.64,hz-r*.12,r*.65,r*.18],
      [0,hy+r*.91,hz+.040,r*.52,r*.23],[0,hy+r*.89+tall*.56,hz+swept*.79,r*.31,r*.16],
      [.011,hy+r*.79+tall,hz+swept,.012,.011]],crown,8);
  }
  if (id==='raven') for(let i=-2;i<=2;i++){
    const x=i*r*.26;
    hull(p,'shaggy-throat-feather'+i,[V(x-.023,hy-r*.44,hz-r*.78),V(x+.026,hy-r*.41,hz-r*.72),
      V(x,hy-r*(1.37+Math.abs(i)*.08),hz-r*.47),V(x+.018,hy-r*.72,hz-r*.36)],crown);
  }
  if (traits.casque) hull(p,'bony-casque',[V(-.048,hy+r*.77,hz),V(.04,hy+r*.74,hz),V(0,hy+r*1.67,hz+.088),V(.035,hy+r*.76,hz+.119),V(-.043,hy+r*.72,hz+.11)],flat(0x967051));
  if (traits.nape) blob(p,'red-nape',[.071,.057,.067],[0,hy+r*.54,hz+r*.67],flat(traits.nape),{},3,7);
  if (traits.comb) for(let i=0;i<5;i++){
    const a=hz-.087+i*.047;
    hull(p,'comb-point'+i,[V(-.022,hy+r*.61,a-.033),V(.023,hy+r*.61,a+.025),V(.017,hy+r+(.12-i*.011),a+.027),V(-.018,hy+r*.95,a+.044)],flat(0xb84a45));
  }
  if (traits.comb||traits.wattle) {
    for(const s of sides) blob(p,'wattle'+s,[.055,.102,.048],[s*.039,hy-r*.82,hz-r*.60],fur(0xba605d,'wattle'),{},3,8);
  }
  if (traits.turkey) {
    chain(p,'drooping-snood',[[0,hy+.055,bz+.045],[.036,hy+.039,bz-.025],[.071,hy-.09,bz-.071],[.060,hy-.156,bz-.075]],[.059,.041,.034,.014],fur(0xb87579,id),7);
    blob(p,'neck-caruncles',[.094,.184,.11],[0,hy-.22,hz-.019],fur(0xb26b71,id+'-neck'),{},4,9);
  }
  for (const s of sides) {
    if (traits.mask||traits.cheek) blob(p,'face-marking'+s,[r*.19,r*(traits.cheek?.40:.36),r*.63],[s*r*.80,hy+.011,hz-r*.15],flat(traits.mask??traits.cheek),{},3,8);
    if (id==='pigeon') {
      const sheen=fur(s===1?0x67746d:0x5c556d,id+'-neck-sheen');
      skin(p,'iridescent-neck-bib'+s,[[s*r*.49,hy-r*.38,hz-r*.35,r*.36,.047],
        [s*r*.71,hy-r*.87,hz-r*.31,r*.38,.049],[s*r*.58,hy-r*1.29,hz-.02,r*.22,.032]],sheen,8);
    }
    if (id==='grebe') {
      const crest=fur(0xb38851,id+'-ear-tuft');
      for(let k=0;k<3;k++) hull(p,'swept-grebe-ear-tuft'+s+k,[V(s*r*.64,hy+r*.24,hz-.041+k*.024),
        V(s*r*.49,hy+r*.63,hz+.016+k*.027),V(s*r*.99,hy+r*.83+k*.014,hz+.14+k*.039),V(s*r*.71,hy+r*.29,hz+.108+k*.029)],crest);
    }
    if (traits.eyeRing) blob(p,'eye-ring'+s,[r*.19,r*.32,r*.32],[s*r*.89,hy+r*.16,hz-r*.21],flat(traits.eyeRing),{},3,8);
    eye(p,'eye'+s,[s*r*(traits.mask||traits.cheek?1.01:.91),hy+r*.16,hz-r*.22],r*(chick?.27:traits.distorted?.28:.19),traits.iris??(traits.distorted?0x944c43:0x4e3d37));
    if (traits.spread) {
      const a=[s*w*.58,y+h*.24,-length*.18], b=[s*(w+.32),y+h*.64,-length*.28], c=[s*(w+.58),y+h*.31,length*.36];
      for(let k=0;k<6;k++){
        const t=k/6, tip=[c[0]-s*t*.38,c[1]-t*.13,c[2]+t*.23];
        blade(p,'spread-primary'+s+k,a,b,tip,[tip[0]-s*.11,tip[1]-.026,tip[2]+.043],k%2?flight:soft,.016);
      }
    } else {
      const nx=s*w*.78, k=chick?.67:1;
      skin(p,'folded-wing'+s,[[nx*.83,y+h*.24,-length*.5,w*.21,h*.15],[nx,y+h*.05,-length*.22,w*.27,h*.33*k],
        [nx*1.02,y+.009,length*.28,w*.23,h*.27*k],[nx*.92,y+.016,length*.63,w*.14,h*.16*k],
        [nx*.52,y+.032,length*1.06,w*.033,h*.032]],markings(id+'-wing',wing,shade(wing,.81),traits.spots?'spots':traits.bar||traits.bars?'bands':'',traits.bar??(chick?shade(wing,1.15):0xc3c1ba),8),8);
      if (!chick) for(let i=0;i<4;i++){
        const a=[nx*(1.04-i*.123),y+h*(.17+i*.065),length*.14], b=[a[0]+s*.065,a[1]-.068,a[2]+.075],
          c=[a[0]*.7,a[1]-.086,length*(.96+i*.035)], d=[a[0]*.66,a[1]-.023,length*(1.03+i*.035)];
        blade(p,'folded-primary'+s+i,a,b,c,d,i%2?flight:soft,.017);
      }
    }
    const fx=s*w*(traits.distorted?.58:.44), fz=length*(kind==='diver'?.49:kind==='duck'?.22:.07)+s*.035;
    const ankle=[fx,.063,fz-.018], ball=[fx,.023,fz-.068];
    chain(p,'shin'+s,[[fx,y-h*.30,fz+.027],[fx,leg*.54,fz+.024],ankle,ball],[.028,.027,.020,.017],toes,5);
    if (traits.web&&!lobed) {
      blade(p,'webbed-foot'+s,[fx-.09,.023,fz-.202],[fx+.078,.023,fz-.204],[fx+.054,.024,fz-.12],ball,toes,.044);
    }
    for(let i=-1;i<=1;i++){
      const tip=[fx+i*.079,.013,fz-(traits.web||lobed?.205:.187)];
      chain(p,'toe'+s+i,[ball,[fx+i*.048,.018,fz-.142],tip],[.019,.014,.006],toes,5);
      if(lobed) for(let j=1;j<=2;j++){
        const t=j*.29;
        blob(p,'paddle-lobe'+s+i+j,[.022,.013,.044],[fx+(tip[0]-fx)*t,.015,ball[2]+(tip[2]-ball[2])*t],toes,{},2,6);
      }
    }
    if (id==='woodpecker'||id==='woodpecker_chick') {
      chain(p,'rear-gripping-toe'+s,[ball,[fx-s*.039,.019,fz+.043],[fx-s*.065,.009,fz+.075]],[.021,.013,.004],toes,5);
    }
  }
  const aquatic=['duck','goose','rail','diver'].includes(kind);
  const fan=traits.fan, sickles=traits.arch, pheasant=traits.longTail&&id==='pheasant';
  const fork=id==='hummingbird', stiff=id==='woodpecker'||id==='cormorant';
  const count=fan?11:pheasant?7:chick?3:7;
  const start=length*.67, lift=fan?.74:sickles?.63:kind==='rail'?.43:.13;
  const reach=chick?.94:pheasant?2.94:stiff?1.76:aquatic?1.075:fan?1.39:sickles?1.45:1.28;
  const spread=w*(fan?1.56:sickles?.48:fork?.56:aquatic?.27:chick?.24:.42);
  const featherWidth=w*(fan?.195:pheasant?.12:sickles?.126:chick?.14:.108);
  const tip=traits.tailTip && fur(traits.tailTip,id+'-yellow-wingtip');
  for(let i=0;i<count;i++){
    const q=2*i/(count-1)-1, side=Math.abs(q);
    const x=q*spread, yy=y+h*(lift-(fan?.36:sickles?.19:0)*side**1.6);
    const zz=length*(reach-(pheasant?.82:fan?.18:chick?.10:.105)*side+(fork?.21*side:0));
    const at=[q*w*.22,y+h*.20,start];
    const pigment=i%2?flight:fur(shade(wing,1.13),id+'-tail-coverts');
    const tailPaint=(ctx,x,y,w,h,face)=>(tip&&face.startsWith('3:')?tip:pigment)(ctx,x,y,w,h,face);
    skin(p,'overlapping-tail-feather'+i,[
      [...at,featherWidth*.26,.009],
      [x*.36,y+h*(sickles?.48:.24),start+(zz-start)*.33,featherWidth*.64,.014],
      [x*.73,yy+(sickles?h*.20:0),start+(zz-start)*.72,featherWidth,.012],
      [x*.955,yy+(sickles?h*.08:0),start+(zz-start)*.95,featherWidth*.81,.008],
      [x,yy,zz,featherWidth*(fan?.66:.28),.004],
    ],tailPaint,6);
  }
}
