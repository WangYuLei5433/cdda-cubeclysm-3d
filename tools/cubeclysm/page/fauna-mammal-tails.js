import { CatmullRomCurve3 } from 'three';
import { V, fur, markings, skin } from './fauna-kit.js';

// Interpolate the centreline and both radii together. Every profile starts within
// the rump and carries the same closed skin all the way through the tip.
function curvedTail(p, name, anchors, paint, tip, stripes = 0) {
  const curve = new CatmullRomCurve3(anchors.map(([x,y,z])=>V(x,y,z)));
  const count = (anchors.length - 1) * 3;
  const rings = Array.from({length:count+1},(_,i)=>{
    const j=Math.min(Math.floor(i/3),anchors.length-2), t=i/3-j;
    const width=anchors[j][3]*(1-t)+anchors[j+1][3]*t;
    const depth=anchors[j][4]*(1-t)+anchors[j+1][4]*t;
    return [...curve.getPoint(i/count),width,depth];
  });
  const tailPaint = (ctx,x,y,w,h,side)=>{
    const i=Number.parseInt(side,10);
    const color = stripes
      ? Number.isInteger(i) && Math.floor(i*stripes/count*2)%2===1
      : Number.isInteger(i) && i>=count-3;
    (tip && color ? tip : paint)(ctx,x,y,w,h,side);
  };
  skin(p,name,rings,tailPaint,10);
}

export function mammalTail(p, { id, type, style, y, z, depth, length, rise, coat, light }) {
  const root=y+depth*.12, origin=z*.78;
  const make = (name, profile, paint = coat, tip, stripes) => curvedTail(
    p, name, profile.map(([x,dy,dz,w,h=w])=>[x,root+dy,origin+dz,w,h]), paint, tip, stripes,
  );
  if (type==='beaver') {
    const l=length, drop=Math.min(depth*1.44,root-.055);
    const scale=fur(0x58433a,id+'-paddle-scales');
    make('beaver-paddle',[[0,0,0,.070,.049],[.013,-drop*.22,l*.24,.077,.044],
      [.055,-drop*.61,l*.47,.152,.041],[.083,-drop*.875,l*.72,.193,.041],
      [.111,-drop,l*.96,.128,.032],[.119,-drop,l*1.07,.026,.014]],scale);
    return;
  }
  if (type==='otter') {
    make('muscular-otter-tail',[[0,0,0,.091,.072],[.012,-.029,length*.27,.080,.065],
      [.046,-.072,length*.57,.067,.048],[.112,-.139,length*.83,.041,.034],
      [.169,-.151,length*1.01,.009,.012]]);
    return;
  }
  if (style==='bare') {
    const l=length, thick=type==='opossum'?.043:type==='muskrat'?.028:.027;
    const pink=fur(type==='cat_sphynx'?0xab827d:type==='muskrat'?0x624e45:0xa18377,id+'-exposed-tail');
    const flatten=type==='muskrat'?1.44:.89;
    const stretch=type==='opossum'?.22:.12, drop=Math.min(root*.70,l*.32);
    make('tapered-bare-tail',[[0,0,0,thick,thick*flatten],[.006,-drop*.22,l*.20,thick*.89,thick*flatten*.91],
      [l*.057,-drop*.82,l*.47,thick*.70,thick*flatten*.73],[l*stretch,-drop,l*.73,thick*.43,thick*flatten*.48],
      [l*(stretch+.17),-drop*.88,l*.92,thick*.24,thick*flatten*.25],
      [l*(stretch+.30),-drop*.72,l*.91,.004,.005]],pink);
    return;
  }
  if (style==='bob' || style==='flag') {
    const rabbit=/rabbit|hare/.test(type);
    const l=rabbit ? length+.060 : Math.min(length,.25), r=(rabbit?.37:.29)*l;
    const deer=style==='flag' && /deer/.test(type);
    const lift=type==='goat'?.145:deer?.082:rabbit?.033:.013;
    const paint = rabbit || deer ? light : coat;
    make(rabbit?'cottontail-tuft':'short-tapered-tail',
      [[0,0,0,r*.75,r],[0,lift*.22,l*.39,r,r*1.02],[.016,lift,l*.79,r*.76,r*.73],
        [.024,lift*.84,l*1.03,r*.15,r*.23]],paint);
    return;
  }
  if (style==='curl') {
    const l=length;
    make('bristled-boar-tail',[[0,0,0,.028],[.005,-.018,l*.48,.026],[.021,-.045,l*.83,.022],
      [.038,-.033,l*1.03,.021],[.051,-.005,l*1.09,.011]],coat);
    return;
  }
  if (style==='switch') {
    const horse=type==='horse', upper=horse ? 0x46342e : 0x59504b;
    const hair=fur(id==='zombie_horse_black'?0x231f26:upper,id+'-tail-hair');
    const drop=Math.min(y*.82,horse?.83:.67);
    make(horse?'hanging-horse-tail':'hanging-switch',
      [[0,0,0,.049,.048],[.014,-drop*.13,.137,.044,.046],[.047,-drop*.40,.222,horse?.081:.032,horse?.077:.033],
       [.075,-drop*.69,.255,horse?.075:.027,horse?.071:.029],
       [.118,-drop*.94,.303,horse?.056:.051,horse?.060:.047],
       [.156,-drop*1.10,.352,.013,.018]],horse?hair:coat,hair);
    return;
  }
  const squirrel=type.startsWith('squirrel'), fox=type.startsWith('fox_'), skunk=type==='skunk';
  if (squirrel || skunk) {
    const l=length, up=Math.max(.32,rise);
    const width=squirrel?.118:.113;
    const edge=fur(skunk?0xe5dfce:type==='squirrel_red'?0x93684e:0x7e7469,id+'-tail-edge');
    const plume=skunk?markings(id+'-tail-stripe',0x28232b,0x302733,'stripe',0xe3dbc8):coat;
    make(squirrel?'arced-squirrel-plume':'curved-skunk-plume',
      [[0,0,0,.042,.041],[.018,up*.12,l*.23,.056,.062],[.056,up*.43,l*.43,width*.79,width],
        [.086,up*.79,l*.49,width,width*1.05],[.133,up*.96,l*.37,width*.83,width],
        [.193,up,l*.13,width*.38,width*.54],[.209,up*.87,-l*.01,.013,.020]],plume,edge);
    return;
  }
  if (style==='brush' && (fox||['wolf','coyote'].includes(type))) {
    const l=length*(fox?1.14:1);
    const tip=type==='fox_red'?fur(0xe6d9c2,id+'-tail-tip'):type==='fox_gray'?fur(0x413332,id+'-tail-tip'):undefined;
    const r=fox?.106:.083, dip=fox?.036:-.15;
    make('brush-tapered-tail',[[0,0,0,.045],[.016,dip*.22,l*.24,r*.71],
      [.040,dip*.57,l*.57,r],[.072,dip*.88,l*.82,r*.75],[.103,dip,l*1.04,.012]],coat,tip);
    return;
  }
  const animalCat=/^cat(?:_|$)|cougar|tiger/.test(type);
  const ringed=style==='rings';
  const l=length*(type==='tiger'?1.34:animalCat?1.10:1);
  const r=type==='raccoon'?.093:animalCat?(style==='brush'?.078:.046):.047;
  const lift=animalCat && type!=='tiger' ? rise : Math.max(-root*.54, rise*.51);
  const tipColor=type==='cat_siamese'?0x49383a:type==='tiger'?0x362a2c:0x4b4034;
  const main=type==='cat_siamese'?fur(tipColor,id+'-points'):coat;
  const tip=ringed||type==='weasel'?fur(tipColor,id+'-tail-marking'):undefined;
  make('curved-tapered-tail',[[0,0,0,r*.83],[.014,lift*.08,l*.22,r],
    [.048,lift*.32,l*.51,r*.87],[.095,lift*.82,l*.79,r*.64],[.151,lift,l*.96,r*.29],
    [.170,lift*.96,l*1.02,.009]],main,tip,ringed?4:0);
}
