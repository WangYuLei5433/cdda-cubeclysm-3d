import { barkP, blob, denimP, loop, lump, pile, speckle, woodP } from './item-kit.js';
import { GLASS, V, bevel, clothP, cyl, fill, flat, front, hull, label, lid, paperP, path, plasticP, poly, ring, rubber, shade, steelP, top, tube } from './common-loot-kit.js';
import { add } from './lowpoly.js';
import { drawSprayPaint } from './common-loot-canned.js';
import { wovenPolySack } from './plastic-bags.js';

const steel = steelP(0xa6abad);
const paper = paperP(0xddd6c5);
const seal = plasticP(0x42464b);

const castMetals={
  aluminum:[0xb8c2c9,'AL'], brass:[0xb79b52,'BR'], bronze:[0xa26d47,'BZ'],
  budget_steel:[0x767c80,'BS'], copper:[0xb9714c,'CU'], gold:[0xd6aa43,'AU'],
  hc_steel:[0x81888d,'HC'], iron:[0x66676a,'FE'], lc_steel:[0xa0aaac,'LC'],
  lead:[0x757688,'PB'], mc_steel:[0x939ca0,'MC'], platinum:[0xa5aebc,'PT'],
  silver:[0xc5c9cf,'AG'], steel:[0x90989d,'ST'], tin:[0x9ba6a7,'SN'], zinc:[0xadb5ac,'ZN'],
};

function castIngot(p,d,metal) {
  const [color,stamp]=castMetals[metal];
  const bullion=/^(gold|silver|platinum)$/.test(metal);
  const width=bullion?.237:.281;
  const height=bullion?.263:.238;
  // Four octagonal rings. The broad mold face steps inward into the sloping walls
  // and the top shoulder before meeting the flat stamped face.
  const rim=(y,length,depth,cut)=>[
    [-length+cut,y,depth],[length-cut,y,depth],[length,y,depth-cut],[length,y,-depth+cut],
    [length-cut,y,-depth],[-length+cut,y,-depth],[-length,y,-depth+cut],[-length,y,depth-cut],
  ].map(coords=>V(...coords));
  const rings=[
    rim(0,.474,width-.017,.049),
    rim(.033,.494,width,.058),
    rim(height-.038,.424,width-.063,.049),
    rim(height,.384,width-.101,.041),
  ];
  const faces=[];
  const face=(points,side)=>{
    faces.push({p:points,side,wm:points[0].distanceTo(points[1]),hm:points[1].distanceTo(points[2])});
  };
  for(let ring=0;ring<rings.length-1;ring++) {
    const lower=rings[ring], upper=rings[ring+1];
    for(let i=0;i<lower.length;i++) {
      const next=(i+1)%lower.length;
      face([lower[i],lower[next],upper[next],upper[i]],
        ring===0?'casting foot':ring===2?'shoulder':'sloping wall');
    }
  }
  const base=rings[0], crown=rings.at(-1);
  for(let i=1;i<base.length-1;i++) face([base[0],base[i+1],base[i]],'underside');
  // A single UV rectangle carries the marks. It extends between the clipped cast ends.
  face([crown[0],crown[1],crown[4],crown[5]],'stamp');
  face([crown[1],crown[2],crown[3],crown[4]],'top end');
  face([crown[5],crown[6],crown[7],crown[0]],'top end');

  add(p,'one-piece cast ingot',faces,(ctx,x,y,w,h,side)=>{
    const lit=side==='shoulder'?1.16:side==='stamp'||side==='top end'?1.09:side==='casting foot'?.83:1;
    const tone=shade(color,lit);
    speckle(d.id+side,tone,[shade(tone,.92),shade(tone,1.05)],bullion?.12:.25)(ctx,x,y,w,h);
    if(side==='sloping wall') {
      fill(ctx,x,y+h-1,w,1,shade(tone,.91));
      return;
    }
    if(side!=='stamp') return;
    ctx.translate(x+w/2,y+h/2);
    ctx.rotate(Math.PI);
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font='bold '+Math.floor(h*.51)+'px monospace';
    const imprint=(label,px,py,maxWidth)=>{
      ctx.fillStyle='#'+shade(tone,1.22).toString(16).padStart(6,'0');
      ctx.fillText(label,px,py+1,maxWidth);
      ctx.fillStyle='#'+shade(tone,.66).toString(16).padStart(6,'0');
      ctx.fillText(label,px,py,maxWidth);
    };
    imprint(stamp,-w*.08,0,w*.38);
    ctx.font='bold '+Math.floor(h*.29)+'px monospace';
    imprint(d.volume===1000?'1 L':'10 L',w*.22,h*.07,w*.24);
  },{metal:true,ppm:120});
}

function bar(p,d) {
  const metal=d.id.match(/^(?:10|1)l_(.+)$/)?.[1];
  if(d.family==='ingot'&&castMetals[metal]) return castIngot(p,d,metal);
  const rod=d.family==='rod', post=d.family==='wood';
  const round=/round|pole|rod/.test(d.id+' '+d.name.toLowerCase());
  const paint=post?woodP(d.color):steelP(d.color);
  const material=post?{}:{metal:true};
  if(round) {
    const stock = d.family==='ingot';
    const r = rod ? ((/brazing/.test(d.id) ? .0032 : .003) * .49 / d.length) : stock ? .095 : .042;
    if (rod && /welding|brazing/.test(d.id)) {
      cyl(p,'flux coating','x',[-.039,r,0],r,.902,10,stoneRod(d.color),{...material,open:true});
      cyl(p,'bare grip end','x',[.451,r,0],r,.078,10,paint,material);
      cyl(p,'coated tip','x',[-.489,r,0],r,.002,10,stoneRod(d.color),material);
    } else cyl(p, 'round stock', 'x', [0,r,0], r, .98, 10, paint, material);
  } else {
    const timber = /post/.test(d.id) ? [.1016,.1016] : /plank/.test(d.id) ? [.0508,.1016] : null;
    const thickness = timber ? timber[0]*.96/d.length : post ? .11 : .13;
    const width = timber ? timber[1]*.48/d.length : post ? .083 : .23;
    bevel(p,post?'cut board':'cast stock',[-.48,0,-width,.48,thickness,width],Math.min(.037,thickness*.18),paint,material);
    if (!post) top(p,'stock markings',[-.27,-.13,.28,.13],thickness+.001,label(shade(d.color,.71),d.name,d.key));
  }
}
const stoneRod = (c) => speckle('rod'+c,shade(c,.71),[shade(c,.64),shade(c,.8)],.34);

function reel(p,d) {
  const name=d.name.toLowerCase(), empty=d.family==='emptySpool';
  const hose=d.family==='hose';
  if(hose || (!empty && !/welding/.test(name))) {
    const color=hose?rubber:steelP(d.color);
    for(let k=0;k<3;k++) loop(p,'coil '+k,[0,.045+k*.046,0],.35-k*.055,.041,color,{},12);
    path(p,'loose end',[[.19,.04,-.25],[.36,.08,-.24],[.47,.08,-.36]],.036,color);
    if(hose) cyl(p,'brass coupling','z',[.47,.08,-.38],.049,.12,8,steelP(0xb69347));
    return;
  }
  const core=empty?plasticP(d.color):seal;
  cyl(p,'reel hub','y',[0,.19,0],.166,.30,12,core,{open:true});
  if(!empty) for(let k=0;k<7;k++) cyl(p,'winding '+k,'y',[0,.071+k*.036,0],.31+(k%2)*.016,.036,12,steelP(d.color),{open:true});
  for(const y of [.036,.344]) loop(p,'flange',[0,y,0],.337,.042,core,{},12);
  for(const angle of [0,Math.PI/2,Math.PI,1.5*Math.PI]) {
    for(const y of [.036,.344]) tube(p,'spoke',V(Math.cos(angle)*.14,y,Math.sin(angle)*.14),V(Math.cos(angle)*.34,y,Math.sin(angle)*.34),.029,.025,6,core);
  }
}

function vessel(p,d) {
  const raw=d.name.toLowerCase();
  const liquidTank=d.family==='tank', drum=d.family==='drum';
  const isJar=d.family==='jar';
  const metal=d.detail==='metal'||liquidTank;
  const wood=d.detail==='wood';
  const clear=d.detail==='glass';
  const paint=metal?steelP(d.color):wood?woodP(d.color):clear?plasticP(0xb0cbc1):plasticP(d.color);
  const opts=clear?GLASS:metal?{metal:true}:{};
  const pills=/pill|supplement/.test(raw);
  const r=drum?.33:isJar||pills?.29:liquidTank?.18:.22;
  const body=liquidTank?.78:drum?.78:isJar?.65:.69;
  cyl(p,'walls','y',[0,body*.5,0],r,body,12,paint,{...opts,open:true});
  lid(p,'foot',r,.0,.042,paint);
  if(drum) {
    for(const y of [.045,.23,.55,.755]) loop(p,'hoop',[0,y,0],r,.022,paint,opts,12);
    lid(p,'lid',r*.99,.756,.039,paint);
    lid(p,'bung',.060,.794,.022,steel);
  } else if(liquidTank) {
    cyl(p,'rounded shoulder','y',[0,.794,0],r,.064,12,paint,opts,r*.57);
    lid(p,'valve housing',r*.57,.821,.070,steel);
    p.box('handle',[-.09,.88,-.022,.09,.913,.022],seal);
  } else {
    const mouth = isJar||pills ? r*.82 : /glue/.test(raw)?r*.33:r*.49;
    cyl(p,'shoulder','y',[0,body+.05,0],r,.10,12,paint,opts,mouth);
    cyl(p,'neck','y',[0,body+.104,0],mouth,.055,12,paint,opts);
    lid(p,'rim or cap',mouth*1.07,body+.128,.042,clear?steel:seal);
  }
}

function boxedSurvivalKit(p) {
  const kraft=paperP(0xb28a59);
  const lidPaper=paperP(0xc8a575);
  p.box('kraft cardboard carton',[-.486,0,-.309,.486,.298,.309],kraft);
  p.box('lid fold seam',[-.487,.272,-.310,.487,.291,.310],paperP(0x8b633e));
  bevel(p,'folded cardboard lid',[-.492,.284,-.315,.492,.331,.315],.008,lidPaper);

  const cover=[V(.468,.3315,-.290),V(-.468,.3315,-.290),V(-.468,.3315,.290),V(.468,.3315,.290)];
  poly(p,'ultimate survival kit cover',cover,V(0,1,0),(ctx,x,y,w,h)=>{
    lidPaper(ctx,x,y,w,h);
    const dark=0x414b3a;
    fill(ctx,x+w*.045,y+h*.074,w*.91,h*.66,dark);
    fill(ctx,x+w*.045,y+h*.734,w*.91,h*.040,0xb75f35);
    ctx.fillStyle='#ead7a8';
    ctx.textAlign='left';
    ctx.textBaseline='middle';
    ctx.font=`bold ${Math.floor(h*.105)}px sans-serif`;
    ctx.fillText('ULTIMATE',x+w*.10,y+h*.259,w*.53);
    ctx.font=`bold ${Math.floor(h*.189)}px sans-serif`;
    ctx.fillText('SURVIVAL KIT',x+w*.10,y+h*.493,w*.58);

    ctx.save();
    ctx.translate(x+w*.814,y+h*.406);
    const radius=h*.177;
    ctx.lineWidth=Math.max(1,h*.022);
    ctx.strokeStyle='#d1b98b';
    ctx.beginPath();
    ctx.arc(0,0,radius,0,Math.PI*2);
    ctx.stroke();
    ctx.fillStyle='#dc8c55';
    ctx.beginPath();
    ctx.moveTo(radius*.34,-radius*.69);
    ctx.lineTo(radius*.26,radius*.10);
    ctx.lineTo(-radius*.34,radius*.69);
    ctx.lineTo(-radius*.26,-radius*.10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.font=`bold ${Math.floor(h*.079)}px sans-serif`;
    ctx.fillStyle='#414b3a';
    ctx.fillText('EMERGENCY EQUIPMENT',x+w*.05,y+h*.874,w*.72);
    fill(ctx,x+w*.797,y+h*.838,w*.155,h*.058,dark);
  },{ppm:180});
  front(p,'printed front panel',[-.458,.045,.458,.241],-.3095,(ctx,x,y,w,h)=>{
    kraft(ctx,x,y,w,h);
    fill(ctx,x+w*.020,y+h*.28,w*.019,h*.45,0xb75f35);
    ctx.fillStyle='#414b3a';
    ctx.textBaseline='middle';
    ctx.font=`bold ${Math.floor(h*.42)}px sans-serif`;
    ctx.fillText('SURVIVAL KIT',x+w*.06,y+h*.52,w*.60);
    for(let i=0;i<9;i++) if(i%4!==2) {
      fill(ctx,x+w*(.80+i*.017),y+h*.34,w*.009,h*.37,0x5c4835);
    }
  },{ppm:150});
}

function container(p,d) {
  if (d.id==='large_survival_kit_box') return boxedSurvivalKit(p);
  const n=d.name.toLowerCase();
  if (d.family==='sack') {
    if(d.id==='bag_durasack'||d.id==='bag_durasack_cement') return wovenPolySack(p,d);
    if(d.id==='heavy_punching_bag_sack') {
      const leather=clothP(0x4e3d39);
      cyl(p,'long cylindrical leather bag','x',[0,.094,0],.094,.89,12,leather);
      for(const z of [-.064,0,.064]) path(p,'hanging tab',[[.39,.142,z],[.444,.187,z],[.49,.187,z]],.016,steel);
      return;
    }
    const material=/paper/.test(n)?paperP(0xb0996b):clothP(d.color);
    bevel(p,'sack body',[-.33,0,-.44,.33,.27,.45],.094,material);
    bevel(p,'gathered opening',[-.18,.043,-.52,.18,.152,-.40],.033,material);
    p.box('closure tie',[-.142,.133,-.485,.142,.162,-.455],clothP(0x827257));
    if(/cement|charcoal|50lb/.test(d.id)) top(p,'sack print',[-.245,-.26,.245,.32],.271,label(shade(d.color,.59),d.name,d.key));
    return;
  }
  if(/carton/.test(n)) {
    const material=paperP(d.color);
    p.box('carton',[-.26,0,-.24,.26,.74,.24],material);
    cyl(p,'folded gable','x',[0,.73,0],.24,.52,4,material,{},.24);
    p.box('pressed top seam',[-.25,.806,-.018,.25,.856,.018],material);
    front(p,'printed panel',[-.21,.13,.21,.66],-.241,label(d.color,d.name,d.key));
    return;
  }
  const cardboard = d.detail==='paper'||/cardboard/.test(n);
  const folded=/folded/.test(n), wooden=d.detail==='wood';
  const paint=cardboard?paperP(0xaa8a5b):wooden?woodP(0x876342):d.detail==='metal'?steelP(d.color):plasticP(d.color);
  const h=folded?.067:.39;
  bevel(p,folded?'collapsed box':'container body',[-.48,0,-.37,.48,h,.37],folded?.015:.047,paint);
  if(cardboard) {
    top(p,'fold or seam',[-.46,-.019,.46,.022],h+.001,flat(0x816843));
    if(/reinforced/.test(n)) for(const x of [-.32,.32]) top(p,'reinforcing strap',[x-.025,-.34,x+.025,.34],h+.002,steel);
  } else {
    bevel(p,'lid',[-.486,h-.023,-.376,.486,h+.025,.376],.021,paint);
    for(const x of [-.24,.24]) p.box('latch',[x-.04,h-.08,-.394,x+.04,h+.006,-.366],steel);
  }
  if(/aid|survival|maker|stem|robot/.test(n)) top(p,'case label',[-.30,-.21,.30,.21],h+.027,label(d.color,d.name,d.key));
}

function hollow(p,d) {
  const d0=d.family;
  const isTube=d0==='tubeContainer', isFoil=d0==='foil';
  if (isTube && d.id!=='tube_welding_rod') {
    const body=plasticP(d.color);
    bevel(p,'flattened flexible squeeze body',[-.48,0,-.18,.27,.17,.18],.064,body);
    bevel(p,'tapered neck',[.24,.022,-.119,.36,.143,.119],.039,body);
    cyl(p,'screw cap','x',[.409,.075,0],.064,.105,10,seal);
    p.box('crimped tail',[-.49,.023,-.186,-.448,.052,.186],body);
    top(p,'printed panel',[-.40,-.108,.20,.119],.171,label(d.color,d.name,d.key));
    return;
  }
  const material=d0==='pipe'?steelP(d.color):isFoil?steelP(0xbcbdc0):isTube?plasticP(d.color):paperP(0xaa8d62);
  const r=d0==='pipe'?.062:isFoil?.13:.16;
  const thick=d0==='pipe'?.014:.025;
  const surface=isTube?{...GLASS,open:true}:{open:true};
  cyl(p,'outer wall','x',[0,r,0],r,.96,12,material,surface);
  if(!isTube) cyl(p,'inside of tube','x',[0,r,0],r-thick,.952,12,material,{open:true});
  for(const side of [-1,1]) cyl(p,'rolled rim','x',[side*.475,r,0],r+thick*.39,.023,12,material,{open:true});
  if(isFoil) p.box('loose foil edge',[-.44,.001,.02,.44,.009,.28],material);
  if(isTube) {
    cyl(p,'threaded end cap','x',[.475,r,0],r*1.05,.063,12,seal);
    cyl(p,'sealed clear base','x',[-.464,r,0],r,.029,12,material,GLASS);
  }
}

function flatStock(p,d) {
  const f=d.family, n=d.name.toLowerCase();
  const h=f==='metalSheet'?.012:f==='sandpaper'?.009:.033;
  const color=/denim/.test(d.id)?0x526a80:/canvas/.test(d.id)?0xa89d7d:d.color;
  const paint=f==='metalSheet'?steelP(color):f==='sandpaper'?speckle('abrasive',0xa68b64,[0x75624b,0xceb184],.65):/denim/.test(d.id)?denimP(color):clothP(color);
  const width=/^sheet_(felt|canvas)$/.test(d.id)?.235:.43;
  p.box('flat stock',[-width,0,-.47,width,h,.47],paint);
  if(f==='sandpaper') p.box('paper backing',[-.43,0,-.47,.43,.003,.47],paper);
  if(f==='textile') {
    if(d.id.includes('patchwork')) top(p,'stitched patchwork',[-width+.012,-.455,width-.012,.455],h+.001,(ctx,x,y,w,h)=>{
      for(let row=0;row<5;row++) for(let col=0;col<4;col++) {
        const x0=x+col*w/4,y0=y+row*h/5;
        fill(ctx,x0,y0,w/4,h/5,shade(color,.72+((row*11+col*17+d.key)%8)*.082));
        fill(ctx,x0,y0,Math.max(1,w*.015),h/5,shade(color,.70));
      }
    });
    for (const z of [-.34,.40]) top(p,'edge crease',[-width+.02,z,width-.02,z+.022],h+.002,flat(shade(d.color,.73)));
    if (/felt|rag|cloth/.test(n)) p.box('folded corner',[-width+.03,h,-.42,-.12,h+.014,-.22],paint);
  }
}

const simpleCylinder = (name,r,h,color) => (p) => cyl(p,name,'y',[0,h/2,0],r,h,12,plasticP(color));

function drill(p,d) {
  const yellow=plasticP(d.color);
  const ribbed=plasticP(0x282b2e);
  const trim=plasticP(0x53565a);
  const brightSteel=steelP(0xbfc3c5);
  const darkSteel=steelP(0x6e767d);
  const sidePrism=(name,shape,halfDepth,paint)=>hull(p,name,
    shape.flatMap(([x,y])=>[V(x,y,-halfDepth),V(x,y,halfDepth)]),paint);

  bevel(p,'removable slide battery',[-.435,0,-.171,-.048,.130,.171],.030,ribbed);
  bevel(p,'yellow battery shoe',[-.392,.117,-.149,-.090,.184,.149],.021,yellow);
  bevel(p,'battery release latch',[-.077,.035,-.070,-.043,.089,.070],.009,plasticP(0x9b4a35));
  for (const sign of [-1,1]) {
    const z=sign*.169;
    for (const x of [-.374,-.328,-.282]) {
      p.box('battery case rib',[x,.035,z-.006,x+.016,.089,z+.006],trim);
    }
  }

  sidePrism('angled pistol grip',[[-.333,.157],[-.178,.161],[-.150,.309],[-.096,.455],
    [-.069,.581],[-.214,.620],[-.318,.501],[-.371,.229]],.105,yellow);
  sidePrism('rubber grip overmold',[[-.349,.177],[-.211,.177],[-.173,.325],[-.143,.444],
    [-.188,.480],[-.309,.438],[-.369,.240]],.113,rubber);
  sidePrism('curved drill trigger',[[-.133,.452],[-.062,.476],[-.029,.436],
    [-.045,.383],[-.085,.358],[-.102,.395]],.069,ribbed);
  bevel(p,'forward reverse selector',[-.163,.488,-.117,-.074,.523,.117],.007,trim);

  bevel(p,'yellow motor housing',[-.411,.534,-.153,.146,.796,.153],.046,yellow);
  bevel(p,'black rear motor cap',[-.439,.561,-.132,-.380,.771,.132],.031,ribbed);
  bevel(p,'top speed selector',[-.221,.782,-.052,-.100,.819,.052],.010,trim);
  for (const sign of [-1,1]) {
    const z=sign*.153;
    for (const x of [-.365,-.333,-.301,-.269]) {
      p.box('rear cooling vent',[x,.614,z-.003,x+.014,.717,z+.003],ribbed);
    }
    cyl(p,'case screw','z',[.092,.599,z],.015,.008,7,darkSteel);
  }

  const axisHeight=.666;
  cyl(p,'clutch collar','x',[.174,axisHeight,0],.128,.079,12,trim,{},.121);
  cyl(p,'knurled keyless chuck','x',[.250,axisHeight,0],.108,.084,10,ribbed,{},.083);
  for(let k=0;k<10;k++) {
    const a=k*Math.PI/5;
    const surface=(x,r)=>V(x,axisHeight+r*Math.cos(a),r*Math.sin(a));
    tube(p,'chuck grip spline',surface(.220,.101),surface(.290,.083),.008,.006,5,trim);
  }
  cyl(p,'steel chuck nose','x',[.310,axisHeight,0],.064,.040,10,brightSteel,{},.045);
  cyl(p,'drill bit shank','x',[.405,axisHeight,0],.023,.164,8,darkSteel);
  const helix=Array.from({length:13},(_,i)=>{
    const a=i*Math.PI/4;
    return [.337+i*.012,axisHeight+.020*Math.cos(a),.020*Math.sin(a)];
  });
  path(p,'visible silver spiral flute',helix,.007,brightSteel);
  cyl(p,'tapered drill tip','x',[.491,axisHeight,0],.024,.035,8,brightSteel,{},.003);
  for (const [i,x] of [-.302,-.246].entries()) {
    cyl(p,'spare bit holder','y',[x,.159,.141],.025,.037,8,ribbed);
    cyl(p,'spare drill bit','y',[x,.193+i*.015,.141],.012,.092+i*.03,8,brightSteel,{},.008);
  }
}

function tool(p,d) {
  const id=d.family;
  const body=plasticP(d.color);
  if(id==='reciprocating') {
    bevel(p,'motor housing',[-.35,.075,-.19,.21,.33,.19],.065,body);
    bevel(p,'rubberized grip',[-.30,0,-.13,-.10,.149,.13],.05,rubber);
    bevel(p,'battery shoe',[-.37,0,-.171,-.042,.078,.171],.022,seal);
    p.box('shoe',[.18,.011,-.14,.24,.31,.14],steel);
    p.box('blade',[.23,.15,-.029,.50,.186,.029],steel);
    return;
  }
  if(id==='cutters') {
    for(const s of [-1,1]) {
      tube(p,'handle',V(-.42,.05,.24*s),V(.15,.056,.051*s),.041,.035,7,body);
      tube(p,'jaw',V(.095,.06,.065*s),V(.43,.061,.034*s),.072,.048,7,steel);
    }
    cyl(p,'hinge','y',[.19,.065,0],.085,.13,10,steel);
    return;
  }
  bevel(p,'LCD screen housing',[-.49,.065,-.050,.49,.604,.045],.025,seal);
  front(p,'flat dark LCD panel',[-.459,.099,.459,.573],-.051,flat(0x485961));
  p.box('stand neck',[-.072,.025,.012,.072,.113,.095],seal);
  bevel(p,'stand foot',[-.148,0,-.093,.148,.034,.139],.014,rubber);
  p.box('indicator',[.425,.077,-.054,.445,.086,-.050],flat(0x6b9b75));
}

export const objects = {
  rod:bar, wood:bar, ingot:bar, wire:reel, emptySpool:reel, hose:reel, pipe:hollow,
  foil:hollow, cardboardTube:hollow, tubeContainer:hollow,
  bottle:vessel, jar:vessel, drum:vessel, tank:vessel, box:container, sack:container,
  metalSheet:flatStock, sandpaper:flatStock, textile:flatStock,
  reciprocating:tool, drill, television:tool, cutters:tool,
  scrap: (p,d)=>lump(p,'irregular metal',[.43,.24,.33],steelP(d.color),d.id,{metal:true}),
  twig(p,d) {
    const paint=barkP(d.color);
    path(p,'branch',[[-.47,.05,-.08],[-.17,.063,.017],[.09,.058,-.035],[.44,.046,.057]],.044,paint);
    tube(p,'side fork',V(.05,.052,-.03),V(.21,.079,-.24),.038,.016,7,paint);
  },
  concrete(p,d) {
    pile(p,'premixed cement and aggregate',.47,.20,speckle(d.id,0x9d9b91,[0x77766b,0xb5b2a8],.67),d.id);
  },
  button(p,d) {
    ring(p,'raised button lip',.31,.44,.109,plasticP(d.color));
    cyl(p,'button face','y',[0,.047,0],.415,.093,12,plasticP(d.color));
    for(const x of [-.14,.14]) for(const z of [-.14,.14]) cyl(p,'thread hole','y',[x,.094,z],.052,.003,8,seal);
  },
  battery(p,d) {
    if (d.id==='it_handheld_battery_mount') {
      p.box('open mounting plate',[-.31,0,-.40,.31,.075,.40],seal);
      for (const x of [-.27,.27]) p.box('guide rail',[x-.02,.074,-.40,x+.02,.190,.40],seal);
      p.box('controller',[-.14,.074,.19,.14,.145,.35],plasticP(0x477156));
      for (const x of [-.1,.10]) path(p,'wire harness',[[x,.12,.20],[x*1.7,.11,-.17],[x*1.9,.08,-.43]],.023,plasticP(x<0?0xaa5340:0x563e42));
      return;
    }
    if (/motorbike|atomic/.test(d.id)) {
      const atomic=d.id.includes('atomic');
      bevel(p,'rectangular power cell',[-.44,0,-.25,.44,.45,.25],.044,atomic?steel:seal);
      bevel(p,'terminal cover',[-.445,.42,-.253,.445,.51,.253],.025,plasticP(d.color));
      for(const x of [-.28,.28]) cyl(p,'terminal','y',[x,.545,0],.087,.071,10,steel);
      if(atomic) front(p,'power marking',[-.35,.13,.35,.37],-.252,label(0x715a4b,d.name,d.key));
      return;
    }
    const coin=/coin|button|light_minus/.test(d.id);
    const r=coin?.45:.163, h=coin?.12:.83;
    cyl(p,'cell casing','y',[0,h*.5,0],r,h,12,steel);
    cyl(p,'insulating sleeve','y',[0,h*.47,0],r+.003,h*.79,12,plasticP(d.color),{open:true});
    lid(p,'positive terminal',r*.5,h,h*.075,steel);
  },
  spray:drawSprayPaint,
  bubble(p) {
    const clear=plasticP(0xc0d2d2);
    p.box('film',[-.45,0,-.40,.45,.021,.40],clear,GLASS);
    for(let i=0;i<5;i++) for(let j=0;j<4;j++) blob(p,'inflated cell',[.064,.033,.064],[(i-2)*.17,.05,(j-1.5)*.17],clear,GLASS,3,7);
  },
  pad(p) {
    const textile=clothP(0xeae3d8);
    bevel(p,'absorbent body',[-.178,0,-.46,.178,.089,.46],.07,textile);
    p.box('side wings',[-.295,.015,-.128,.295,.045,.11],textile);
    top(p,'embossed channel',[-.11,-.324,.11,.323],.09,paperP(0xdad6cc));
  },
  tampon(p) {
    cyl(p,'plastic applicator','x',[-.06,.115,0],.115,.61,12,plasticP(0xe7b4bc));
    cyl(p,'exposed cotton tip','x',[.259,.115,0],.105,.066,10,clothP(0xe7dfce),{},.055);
    cyl(p,'inner plunger','x',[-.408,.115,0],.067,.192,10,plasticP(0xe5cfce));
  },
  earplug(p) {
    for(const s of [-1,1]) cyl(p,'foam earplug','x',[.04*s,.105,s*.19],.105,.43,10,plasticP(0xcc8250),{},.085);
  },
  duck(p) {
    const vinyl=plasticP(0xe1bb48);
    blob(p,'duck body',[.29,.23,.42],[0,.23,.08],vinyl);
    blob(p,'duck head',[.185,.18,.18],[0,.48,-.16],vinyl);
    bevel(p,'orange bill',[-.115,.40,-.415,.115,.485,-.271],.025,plasticP(0xd9773f));
    for(const x of [-.164,.164]) blob(p,'painted eye',[.023,.028,.028],[x,.515,-.218],rubber,{},3,6);
  },
  blister(p) {
    bevel(p,'backing card',[-.38,0,-.46,.38,.044,.46],.031,steelP(0xaeb9b8));
    for(const z of [-.28,0,.28]) for(const x of [-.18,.18]) blob(p,'empty blister',[.107,.059,.10],[x,.075,z],plasticP(0xc4d1ce),GLASS,3,8);
  },
  candle(p) {
    simpleCylinder('wax',.24,.74,0xe8dfc1)(p);
    tube(p,'wick',V(0,.737,0),V(.016,.799,-.009),.016,.013,6,seal);
  },
  floss(p,d) {
    bevel(p,'plastic floss dispenser',[-.32,0,-.42,.32,.18,.42],.085,plasticP(0xe6ded0));
    p.box('flip lid seam',[-.285,.149,-.251,.285,.18,-.222],plasticP(0x9aaba2));
    top(p,'floss label',[-.235,-.141,.235,.284],.181,label(0x568579,d.name,d.key));
  },
};

