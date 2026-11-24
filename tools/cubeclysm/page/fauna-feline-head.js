import { fill } from './paint.js';
import { V, blob, chain, flat, fur, hull, markings, shade, sides, skin } from './fauna-kit.js';

const proportions = {
  cat:             [1.00,.89,1.01,.72,1.07],
  cat_bengal:      [1.01,.96,1.05,.69,1.02],
  cat_black:       [1.06,.84,1.06,.74,1.05],
  cat_calico:      [1.02,.83,1.01,.72,1.00],
  cat_chonker:     [1.13,.85,1.03,.61,1.05],
  cat_devon_rex:   [.96,.84,.92,1.29,1.58],
  cat_isherwood:   [.99,.91,.99,.73,1.02],
  cat_longhair:    [1.05,.84,1.05,.65,1.01],
  cat_maine_coon:  [1.07,1.05,1.06,.84,1.19],
  cat_persian:     [1.17,.60,1.14,.43,.92],
  cat_siamese:     [.86,1.08,.92,.86,1.30],
  cat_sphynx:      [.93,.91,.98,1.17,1.53],
  cat_tabby:       [1.03,.88,1.02,.73,1.04],
  bobcat:          [1.07,.84,1.03,.67,1.07],
  cougar:          [1.06,1.12,.97,.53,.90],
  tiger:           [1.13,1.14,1.05,.48,.90],
};

function facialPaint(id, type, base) {
  const stripes=type==='tiger'||type==='cat_tabby';
  const pattern=type==='cat_calico'?'calico':type==='cat_bengal'||type==='bobcat'?'spots':'';
  const ground=markings(id+'-skull',base,shade(base,.82),pattern,shade(base,.53),12);
  return (ctx,x,y,w,h,side)=>{
    ground(ctx,x,y,w,h,side);
    if (!stripes || side==='cap') return;
    const [i,j]=side.split(':').map(Number);
    for(let col=0;col<w;col++){
      const a=(j+(col+.5)/w)*Math.PI/6;
      const altitude=Math.sin(a);
      if (altitude<-.61) continue;
      const f=type==='tiger'?.84:.52;
      const c=.38+.18*Math.cos(a*2.9+(j<5?.45:0));
      const thick=Math.max(1,Math.floor(h*(i===1?.24:.16)*f));
      if(i===0||i===2||type==='tiger'&&i===3) fill(ctx,x+col,y+Math.floor(h*c),1,thick,shade(base,.27));
    }
  };
}

export function felineHead(p, { id, type, x=0, y, z, radius: r, base, under, iris, young=false, infection }) {
  const [width,reach,height,earHeight,earWidth]=proportions[type];
  const tiger=type==='tiger', bobcat=type==='bobcat', cougar=type==='cougar', big=tiger||bobcat||cougar;
  const hairless=type==='cat_sphynx', rex=type==='cat_devon_rex', persian=type==='cat_persian', siamese=type==='cat_siamese';
  const at=(dx,dy,dz)=>[x+dx*r,y+dy*r,z+dz*r];
  const band=(dx,dy,dz,w,h)=>[...at(dx,dy,dz),w*r,h*r];
  const furColor=siamese?0x4d3d3f:base;
  const coat=fur(furColor,id+'-cheeks');
  const pale=fur(tiger||cougar?0xece2cf:siamese?0x74605c:type==='cat_black'?0x3d343c:under,id+'-muzzle');
  const trim=fur(tiger?0x31272a:shade(furColor,.63),id+'-ear-back');
  const pink=fur(hairless?0xb47773:0xa67c78,id+'-inner-ear');
  const nosePaint=flat(tiger?0x8e6663:siamese?0x403237:hairless?0x976667:0x6b4c4c);
  const eyeliner=flat(0x30262b);
  const pupil=flat(infection?0x120d15:0x241c20);
  const head=facialPaint(id,type,furColor);
  skin(p,'wide-cheekbones-and-rounded-cranium',[
    band(0,-.08,-.751,.57*width,.53*height),band(0,.018,-.54,.91*width,.77*height),
    band(0,.044,-.19,1.04*width,.92*height),band(0,.08,.34,.99*width,.98*height),
    band(0,.024,.77,.73*width,.74*height),band(0,-.09,1.01,.40*width,.48*height),
  ],head,12);

  skin(p,'feline-nasal-bridge',[
    band(0,-.24,-reach,.32*width,.22),band(0,-.095,-reach*.82,.414*width,.35),
    band(0,.062,-.65,.46*width,.41),band(0,.12,-.38,.55*width,.48),
  ],coat,9);
  const jawDrop=infection==='maw'?.42:0;
  skin(p,'rounded-mandible',[
    band(0,-.47-jawDrop,-reach*.98,.36*width,.20),band(0,-.53-jawDrop*.72,-reach*.71,.56*width,.26),
    band(0,-.48-jawDrop*.36,-.43,.72*width,.29),band(0,-.35,.18,.78*width,.34),
  ],pale,10);
  if(infection==='maw') {
    blob(p,'dark-open-mouth',[.49*r,.27*r,.32*r],at(0,-.57,-reach*.74),eyeliner,{},3,9);
  }
  hull(p,'triangular-feline-nose',[
    V(...at(-.32,-.18,-reach-.075)),V(...at(.32,-.18,-reach-.075)),V(...at(0,-.42,-reach-.103)),
    V(...at(0,-.075,-reach+.085)),V(...at(0,-.31,-reach+.037)),
  ],nosePaint);
  chain(p,'small-philtrum',[at(0,-.39,-reach-.075),at(0,-.50,-reach-.057),at(.21,-.55-jawDrop*.25,-reach*.95)],
    [.021*r,.024*r,.008*r],eyeliner,5);

  for(const s of sides){
    blob(p,'rounded-whisker-pad'+s,[.34*r,.245*r,(persian?.26:.34)*r],
      at(s*.34*width,-.359,-reach*.86),pale,{},4,9);
    if(tiger||cougar||bobcat) {
      skin(p,'pale-swept-cheek'+s,[band(s*.53,-.44,-.76,.35,.18),band(s*.74,-.38,-.34,.33,.27),
        band(s*.89,-.22,.02,.28,.26),band(s*.86,-.14,.46,.109,.16)],pale,8);
    }
    const sx=s*(persian?.55:.59)*width;
    const eyeY=tiger?.385:persian?.285:.304, eyeZ=tiger?-.718:persian?-.682:-.704;
    const ring=young||rex?1.14:1;
    if (tiger) blob(p,'cream-eye-surround'+s,[.278*r,.199*r,.063*r],
      at(sx,eyeY+.047,eyeZ+.034),pale,{},3,8);
    const blobEye=(name,rad,atPart,paint)=>blob(p,name+s,rad.map(n=>n*r*ring),at(...atPart),paint,{},3,9);
    blobEye('almond-eye-rim',[.232,.177,.105],[sx,eyeY,eyeZ],eyeliner);
    blobEye('colored-iris',[.143,.141,.066],[sx-s*.023,eyeY+.011,eyeZ-.081],flat(infection?0x1a121a:iris));
    blobEye('feline-pupil',[big?.079:.048,big?.079:.110,.033],[sx-s*.030,eyeY+.010,eyeZ-.132],pupil);
    if(!infection) blobEye('eye-catchlight',[.027,.027,.015],[sx-s*.011,eyeY+.065,eyeZ-.155],flat(0xefe5cd));
    // The upper brow lies close to the skull and preserves the forward-set feline gaze.
    chain(p,'upper-lid'+s,[at(sx-s*.20,eyeY+.102,eyeZ-.015),at(sx-s*.04,eyeY+.220,eyeZ+.012),
      at(sx+s*.164,eyeY+.150,eyeZ+.031)],[.025*r,.039*r,.019*r],coat,6);
    if (infection==='hindlegs') chain(p,'oily-eye-runoff'+s,[at(sx,eyeY-.093,eyeZ-.071),at(sx+s*.028,-.04,eyeZ-.070),
      at(sx+s*.065,-.30,eyeZ-.020)],[.061*r,.044*r,.013*r],pupil,6);
    if (infection==='maw') chain(p,'visible-canine'+s,[at(s*.40,-.445,-reach*.96),at(s*.392,-.73,-reach*.98)],
      [.075*r,.009*r],pale,6);
    for(let k=0;k<3;k++) {
      const dy=-.31-k*.097, dz=-reach*.90+k*.102;
      const rest=tiger?.20:.15;
      chain(p,'fine-whisker'+s+k,[at(s*.51,dy,dz),at(s*(.95+rest),dy+.15-k*.066,dz-.29),
        at(s*(1.36+rest),dy-.031-k*.054,dz-.21)],[.021*r,.014*r,.003*r],pale,4);
    }

    const ex=s*(persian?.69:.75)*width, ey=.76, ez=tiger||cougar?.36:.20;
    const tipX=ex+s*earWidth*(big?.40:.35);
    if (tiger||cougar||persian) {
      skin(p,'rounded-ear'+s,[band(ex,ey,ez,.29,.23),band(ex+s*.19,ey+earHeight*.52,ez+.095,.35*earWidth,.255),
        band(tipX,ey+earHeight*.92,ez+.173,.253*earWidth,.168),
        band(tipX,ey+earHeight*1.21,ez+.204,.087,.060)],trim,9);
      blob(p,'ear-bowl'+s,[.205*r,.256*r,.075*r],at(ex+s*.197,ey+earHeight*.65,ez-.101),pink,{},3,8);
      if(tiger) blob(p,'white-ear-spot'+s,[.160*r,.179*r,.048*r],at(ex+s*.233,ey+earHeight*.68,ez+.317),pale,{},3,9);
    } else {
      const outer=[at(ex+s*.40*earWidth,ey+.09,ez-.067),at(ex-s*.40*earWidth,ey+.06,ez-.093),
        at(tipX,ey+earHeight,ez+.072),at(ex,ey+.238,ez+.333)];
      hull(p,'curved-triangular-ear'+s,outer.map(q=>V(...q)),trim);
      const c=V(...at(ex+s*.093,ey+earHeight*.38,ez-.056));
      const liner=outer.slice(0,3).map(q=>c.clone().lerp(V(...q),.61));
      hull(p,'inset-ear-skin'+s,[...liner.map(q=>q.setZ(q.z-.048*r)),c.clone().add(V(0,0,.047*r))],pink);
      if (bobcat||type==='cat_maine_coon') chain(p,'ear-tuft'+s,[outer[2],at(tipX+s*.085,ey+earHeight+.22,ez+.094)],
        [.061*r,.005*r],trim,5);
    }
  }

  if(type==='cat_tabby'||tiger){
    const brow=type==='cat_tabby'?[[ -.45,.46],[-.24,.67],[0,.49],[.24,.67],[.45,.46]]
      : [[-.48,.52],[-.26,.69],[0,.60],[.26,.72],[.48,.54]];
    chain(p,type==='cat_tabby'?'forehead-tabby-M':'tiger-forehead-crown',
      brow.map(([x,y])=>at(x,y,-.66+(y-.46)*.43)),
      [.026*r,.038*r,.034*r,.038*r,.026*r],flat(shade(furColor,.30)),5);
  }
  if (hairless) for(let i=0;i<3;i++){
    const yy=.45+i*.112, zz=-.53+i*.042;
    chain(p,'wrinkled-brow'+i,[at(-.53,yy-.069,zz),at(0,yy,zz-.067),at(.53,yy-.068,zz)],
      [.023*r,.033*r,.019*r],coat,5);
  }
}
