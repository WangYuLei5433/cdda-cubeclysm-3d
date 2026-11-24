import { ShapeUtils, Vector2 } from 'three';
import { add } from './lowpoly.js';
import { V, blob, chain, eye, flat, fur, sides, skin } from './fauna-kit.js';

// The web and tines form a single concave shape. The widened palm cups upward
// and back, as in the National Park Service's moose identification reference.
const antlerOutline = [
  [.02,.02],[.17,.0],[.42,.037],[.62,.121],[.78,.256],[.96,.436],
  [.854,.359],[.902,.600],[.769,.452],[.784,.729],[.657,.515],
  [.608,.765],[.532,.538],[.425,.674],[.395,.472],[.284,.550],
  [.265,.375],[.191,.317],[.120,.390],[.094,.260],
].map(([x,y])=>new Vector2(x,y));
const antlerTriangles = ShapeUtils.triangulateShape(antlerOutline, []);

function palm(p, s, center, boost, paint) {
  const [cx,cy,cz] = center;
  const f = boost * (s===1 ? .965 : 1);
  const surfaces = [1,-1].map(side => antlerOutline.map(({ x,y }) => {
    const z = .21*x*x + .22*y + .091*Math.sin(x*2.33);
    const thickness = .022 + .020 * Math.sin(Math.PI*Math.min(.97,y/.78)) * Math.sin(Math.PI*x*.9);
    return V(s*(cx+x*f),cy+y*f,cz+(z+side*thickness)*f);
  }));
  const faces = [];
  const face = (points, out, shade) => {
    const [a,b,c,d=c]=points;
    const n=b.clone().sub(a).cross(c.clone().sub(a));
    faces.push({
      p:n.dot(out)<0?[...points].reverse():points, side:shade,
      wm:Math.max(.012,a.distanceTo(b),c.distanceTo(d)),
      hm:Math.max(.012,b.distanceTo(c),a.distanceTo(d)),
    });
  };
  for (const [i,points] of surfaces.entries()) {
    for (const tri of antlerTriangles) face(tri.map(k=>points[k]),V(0,0,i?-1:1),i?'front':'back');
  }
  const [back,rim]=surfaces;
  for (let j=0;j<rim.length;j++) {
    const i=(j+1)%rim.length, a=antlerOutline[j], b=antlerOutline[i];
    face([back[j],back[i],rim[i],rim[j]],V(s*(b.y-a.y),a.x-b.x,0),'edge');
  }
  add(p,'palmated-antler'+s,faces,paint);
  chain(p,'antler-beam'+s,[[s*(cx-.042),cy-.024,cz+.016],[s*(cx+.148*f),cy+.102*f,cz+.066*f],
    [s*(cx+.341*f),cy+.169*f,cz+.154*f]], [.075*f,.081*f,.060*f],paint,8);
  chain(p,'front-brow-tine'+s,[[s*(cx+.124*f),cy+.081*f,cz+.025*f],
    [s*(cx+.251*f),cy+.147*f,cz-.092*f],[s*(cx+.292*f),cy+.200*f,cz-.238*f],
    [s*(cx+.350*f),cy+.390*f,cz-.261*f]], [.052*f,.052*f,.032*f,.008*f],paint,7);
}

export function moose(p, id) {
  const young=id.endsWith('_calf');
  const tusked=id.startsWith('tusked_');
  const coat=fur(young?0x88593d:tusked?0x544132:0x503a2c,id+'-coat');
  const mantle=fur(young?0x85553b:0x463329,id+'-shoulders');
  const muzzle=fur(young?0x9d775a:0x765941,id+'-muzzle');
  const legs=fur(young?0xa0856d:0x958575,id+'-legs');
  const hoof=fur(0x343035,id+'-hoof');
  const antler=fur(tusked?0xb9a58b:0xb49876,id+'-antler');
  const y=young?1.118:1.32, z=young?.73:.93, w=young?.239:.348, d=young?.277:.352;
  // High front shoulders slope into a narrower, lower hindquarter.
  skin(p,'shoulder-hump-and-rump', [
    [0,y+.055,-z*.93,w*.67,d*.96],[0,y+.12,-z*.70,w*.98,d*1.24],
    [0,y+.057,-z*.32,w*1.04,d*1.14],[0,y-.076,z*.21,w,d*.98],
    [0,y-.119,z*.63,w*.87,d*.83],[0,y-.111,z*.88,w*.57,d*.58],
    [0,y-.127,z*1.02,w*.29,d*.31],
  ],coat,12);
  const hz=-z-.420, hy=y+.223, f=young?.89:1;
  skin(p,'heavy-neck',[[0,y+.037,-z*.66,w*.77,d*.92],[0,y+.088,-z*.96,.248*f,.335*f],
    [0,hy+.008,hz+.182,.218*f,.253*f],[0,hy+.024,hz+.079,.142*f,.162*f]],mantle,12);
  skin(p,'long-descending-face',[[0,hy-.191*f,hz-.402*f,.120*f,.103*f],
    [0,hy-.128*f,hz-.278*f,.153*f,.152*f],[0,hy+.004,hz-.093*f,.166*f,.184*f],
    [0,hy+.057*f,hz+.090*f,.189*f,.204*f],[0,hy+.018*f,hz+.199*f,.136*f,.169*f]],coat,12);
  skin(p,'broad-overhanging-muzzle',[[0,hy-.236*f,hz-.498*f,.101*f,.092*f],
    [0,hy-.200*f,hz-.466*f,.161*f,.125*f],[0,hy-.160*f,hz-.374*f,.168*f,.130*f],
    [0,hy-.137*f,hz-.279*f,.133*f,.101*f]],muzzle,12);
  skin(p,'lower-jaw',[[0,hy-.299*f,hz-.443*f,.086*f,.049*f],[0,hy-.274*f,hz-.290*f,.117*f,.070*f],
    [0,hy-.190*f,hz-.075*f,.138*f,.114*f],[0,hy-.095*f,hz+.138*f,.150*f,.130*f]],coat,9);
  const bell=young?.57:1;
  skin(p,'hanging-throat-bell',[[0,hy-.148,hz+.12,.098*f,.108*f],[.011,hy-.340,hz+.179,.097*f,.132*f],
    [.030,hy-.340-.23*bell,hz+.248,.057*f,.083*f],[.038,hy-.338-.334*bell,hz+.302,.012*f,.024*f]],mantle,9);

  for (const s of sides) {
    eye(p,'brown-eye'+s,[s*.166*f,hy+.093*f,hz-.086*f],young?.034:.035,0x5c432d);
    blob(p,'moose-nostril'+s,[.027*f,.025*f,.035*f],[s*.136*f,hy-.193*f,hz-.414*f],flat(0x49382f),{},3,7);
    skin(p,'long-outspread-ear'+s,[[s*.139*f,hy+.158*f,hz+.136*f,.064*f,.064*f],
      [s*.246*f,hy+.215*f,hz+.207*f,.073*f,.072*f],
      [s*.360*f,hy+.284*f,hz+.272*f,.053*f,.048*f],
      [s*.425*f,hy+.337*f,hz+.288*f,.011*f,.015*f]],coat,8,true);
    skin(p,'pale-inner-ear'+s,[[s*.202*f,hy+.188*f,hz+.136*f,.028*f,.018*f],
      [s*.297*f,hy+.242*f,hz+.209*f,.053*f,.028*f],
      [s*.391*f,hy+.304*f,hz+.249*f,.022*f,.017*f]],muzzle,8,true);

    if (!young) palm(p,s,[.17,hy+.186,hz+.042],tusked?1.18:.95,antler);
    if (tusked) {
      const stem=young?.45:1;
      const start=hy-.232*f, sz=hz-.388*f;
      chain(p,'underslung-tusk'+s,[[s*.121*f,start,sz],[s*(.158+.048*stem),start-.194*stem,sz-.018*stem],
        [s*(.176+.053*stem),start-.172*stem,sz-.146*stem],[s*(.184+.054*stem),start-.100*stem,sz-.249*stem]],
        [.067*stem,.049*stem,.036*stem,.008*stem],antler,8);
    }

    for (const rear of [false,true]) {
      const step=s*(young?.076:.086), tz=(rear?z*.70:-z*.71)+step;
      const x=s*w*(rear?.65:.70);
      const knee=[x*1.03,(rear?.65:.58)*y,tz+(rear?-.16:.025)];
      const hock=[x*(rear?1.10:.99),(rear?.40:.29)*y,tz+(rear?.106:.004)];
      const hoofZ=tz+(rear?.038:-.027);
      const upper=rear?.130:.112, shin=young?.044:.055;
      const color=(ctx,x,y,w,h,face)=> (face.startsWith('0:')?coat:legs)(ctx,x,y,w,h,face);
      skin(p,(rear?'hind-leg':'front-leg')+s,[
        [x*.75,y+(rear?-.006:.124),tz,upper*.92,upper*1.42],
        [...knee,upper*.67,upper*.78],[...hock,shin,shin*1.12],
        [x*1.08,.128,hoofZ+.011,shin*.82,shin*.88],
        [x*1.08,.064,hoofZ,shin,shin*1.21],
      ],color,9);
      for (const j of sides) blob(p,'long-cloven-hoof'+s+rear+j,[shin*.66,.059,shin*1.48],
        [x*1.08+j*shin*.60,.059,hoofZ-.029],hoof,{},3,8);
    }
  }
  skin(p,'short-rump-tail',[[0,y-.048,z*.90,.056,.048],[.018,y-.106,z*1.018,.071,.052],
    [.035,y-.146,z*1.098,.026,.021]],coat,8);
}
