import { add } from './lowpoly.js';
import { V, blob, chain, eye, flat, fur, sides, skin } from './fauna-kit.js';

// The oval snout plate is built around two inset nostril cups. The openings are part of
// the muzzle geometry and stay visible with or without the atlas.
function snoutDisc(p, y, z, width, height, paint) {
  const faces = [];
  const face = (points, out, side) => {
    const [a,b,c,d = c] = points;
    const n = b.clone().sub(a).cross(c.clone().sub(a));
    faces.push({
      p: n.dot(out) < 0 ? [...points].reverse() : points,
      side, wm: Math.max(.008,a.distanceTo(b),c.distanceTo(d)),
      hm: Math.max(.008,b.distanceTo(c),a.distanceTo(d)),
    });
  };
  const front = V(0,0,-1), back = V(0,0,1);
  const arc = Array.from({ length: 11 }, (_, i) => {
    const a = i * Math.PI / 10;
    return [Math.sin(a)*width, Math.cos(a)*height];
  });
  const outline = [...arc, ...[-.69,-.35,0,.35,.69].map(v=>[0,v*height])];
  for (const s of sides) {
    const cx = width*.45, cy=height*.07;
    const center = V(s*cx,y+cy,z+.036);
    const rings = outline.map(([x, h]) => {
      const direction = Math.atan2(h-cy,x-cx);
      const nx = cx + Math.cos(direction)*width*.205;
      const nh = cy + Math.sin(direction)*height*.36;
      return [
        V(s*x*.94,y+h*.94,z+.054),
        V(s*x,y+h,z+.012),
        V(s*x*.93,y+h*.92,z),
        V(s*nx,y+nh,z+.002),
        V(s*(cx+(nx-cx)*.72),y+cy+(nh-cy)*.68,z+.034),
      ];
    });
    for (let i=0; i<rings.length; i++) {
      const a=rings[i], b=rings[(i+1)%rings.length];
      if (i<10) {
        const rim=V(s*(outline[i][0]+outline[i+1][0]),outline[i][1]+outline[i+1][1],-.011);
        face([a[0],b[0],b[1],a[1]],rim,'rim');
        face([a[1],b[1],b[2],a[2]],rim,'bevel');
      }
      face([a[2],b[2],b[3],a[3]],front,'disc');
      const inward=center.clone().sub(a[3].clone().add(b[3]).multiplyScalar(.5));
      inward.z=-.008;
      face([a[3],b[3],b[4],a[4]],inward,'recess');
      face([a[4],b[4],center],front,'inside');
      if (i<10) face([a[0],b[0],V(0,y,z+.054)],back,'base');
    }
  }
  const nostril = flat(0x552f34), inside=flat(0x352129);
  add(p,'rounded-snout-disc-with-nostrils',faces,(ctx,x,y,w,h,side) => {
    (side==='inside'?inside:side==='recess'?nostril:paint)(ctx,x,y,w,h,side);
  });
}

export function domesticPig(p, piglet) {
  const id=piglet?'piglet':'pig';
  const coat=fur(piglet?0xe4a9a4:0xd29b93,id+'-back');
  const pink=fur(piglet?0xecb2ae:0xdaa49c,id+'-face');
  const earPink=fur(0xc18181,id+'-ear');
  const muzzle=fur(0xe6a3a3,id+'-snout');
  const hoof=fur(0x6d5451,id+'-hoof');
  const h=piglet?.50:.57, w=piglet?.251:.326, d=piglet?.211:.278, z=piglet?.443:.585;
  const faceSize=piglet?1.05:1;
  const hy=h+.076, head=-z-.18*faceSize, nose=head-.266*faceSize;
  skin(p,'round-barrel',[[0,h,-z*.99,w*.55,d*.66],[0,h+.044,-z*.71,w*.89,d*.94],
    [0,h+.029,-z*.26,w,d],[0,h+.012,z*.26,w*.98,d*.93],[0,h+.022,z*.72,w*.81,d*.79],
    [0,h+.039,z*.99,w*.45,d*.52]],coat,12);
  skin(p,'short-neck',[[0,hy-.057,-z*.58,w*.61,d*.67],[0,hy-.033,-z*.90,w*.66,d*.72],
    [0,hy+.023,head+.078,.160*faceSize,.154*faceSize]],coat,10);
  skin(p,'head-and-fleshy-cheeks',[[0,hy-.073,head-.141,.137*faceSize,.094*faceSize],
    [0,hy-.021,head-.072,.178*faceSize,.133*faceSize],[0,hy+.035,head+.022,.188*faceSize,.171*faceSize],
    [0,hy+.051,head+.131,.166*faceSize,.145*faceSize],[0,hy+.025,head+.206,.110*faceSize,.101*faceSize]],pink,12);
  skin(p,'short-upturned-muzzle',[[0,hy-.061,nose+.045,.136*faceSize,.076*faceSize],
    [0,hy-.072,nose+.104,.133*faceSize,.094*faceSize],[0,hy-.050,head-.075,.154*faceSize,.104*faceSize]],pink,10);
  snoutDisc(p,hy-.063,nose,.171*faceSize,.108*faceSize,muzzle);
  chain(p,'resting-lower-lip',[[-.119,hy-.135,nose+.100],[-.057,hy-.151,nose+.074],[0,hy-.15,nose+.070],
    [.057,hy-.151,nose+.074],[.119,hy-.135,nose+.100]],[.005,.011,.012,.011,.005],flat(0xa26469),5);

  for (const s of sides) {
    eye(p,'small-brown-eye'+s,[s*.159*faceSize,hy+.077,head-.060],piglet?.035:.032,0x674438);
    skin(p,'soft-triangular-ear'+s,[[s*.112,hy+.117,head+.104,.066,.060],
      [s*.16,hy+.203,head+.092,.097,.066],[s*.218,hy+(piglet?.332:.273),head+.049,.062,.036],
      [s*.263,hy+(piglet?.372:.265),head+.004,.017,.020]],pink,9);
    skin(p,'ear-inner'+s,[[s*.143,hy+.152,head+.037,.028,.012],
      [s*.177,hy+.210,head+.023,.063,.025],[s*.226,hy+(piglet?.305:.254),head-.015,.032,.013]],earPink,8);
    for (const rear of [false,true]) {
      const x=s*w*.62, a=(rear?z*.70:-z*.72)+s*.026;
      skin(p,'short-weight-bearing-leg'+s+rear,[[x*.80,h+.017,a,.104,.129],[x,h*.63,a+(rear?-.04:.032),.081,.098],
        [x*1.03,.234,a+.012,.060,.064],[x*1.05,.085,a-.022,.062,.064]],coat,9);
      for (const k of sides) blob(p,'cleft-hoof'+s+rear+k,[.033,.055,.077],[x*1.05+k*.033,.055,a-.038],hoof,{},3,8);
    }
  }
  skin(p,'small-curled-tail',[[0,h+.105,z*.80,.033,.032],[.014,h+.136,z+.072,.034,.033],
    [.042,h+.200,z+.137,.028,.028],[.068,h+.271,z+.121,.023,.029],[.066,h+.284,z+.061,.020,.024],
    [.048,h+.245,z+.033,.018,.020],[.026,h+.211,z+.071,.009,.010]],pink,8);
}
