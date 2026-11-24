import { CatmullRomCurve3 } from 'three';
import { fill, rng, shade } from './paint.js';
import { V, blob, chain, flat, fur, sides, skin } from './fauna-kit.js';

function ramHorn(p, s, y, z, paint) {
  // One continuous horn, swept back from the crown, rounded down and then forward.
  const path=[[s*.143,y+.130,z+.057],[s*.249,y+.199,z+.130],
    [s*.340,y+.131,z+.221],[s*.365,y-.004,z+.232],
    [s*.352,y-.142,z+.154],[s*.329,y-.150,z+.020],
    [s*.315,y-.055,z-.081],[s*.292,y+.052,z-.060]];
  const curve=new CatmullRomCurve3(path.map(pt=>V(...pt)));
  const rings=Array.from({length:22},(_,i)=>{
    const t=i/21,r=.092*(1-t)**.62+.006;
    return [...curve.getPoint(t),r,r*.76];
  });
  const grooved=(ctx,x,y,w,h,side)=>{
    paint(ctx,x,y,w,h,side);
    const ring=Number.parseInt(side,10);
    if (ring%3===1) fill(ctx,x,y+Math.floor(h*.22),w,Math.max(1,Math.floor(h*.19)),0x917c63);
  };
  skin(p,'spiral-ram-horn'+s,rings,grooved,9);
}

export function domesticSheep(p, lamb) {
  const id=lamb?'lamb':'ram';
  const fleece=fur(0xe0d5bc,id+'-fleece');
  const under=fur(0xc5b89e,id+'-flank');
  const face=fur(0x71645d,id+'-face');
  const snout=fur(0x9e8578,id+'-muzzle');
  const hoof=fur(0x443b38,id+'-hoof');
  const inner=fur(0x9a7370,id+'-ear');
  const horn=fur(0xc3aa87,id+'-horn');
  const y=lamb?.49:.60,w=lamb?.226:.288,d=lamb?.216:.275,length=lamb?.405:.514;
  const hy=y+.160, hz=-length-.178;
  const r=lamb?.124:.143, mz=hz-(lamb?.145:.181);
  const random=rng(id+'-wool-layout');

  skin(p,'thick-fleece-body',[[0,y+.047,-length*1.08,w*.52,d*.65],
    [0,y+.064,-length*.76,w*.88,d*.96],[0,y+.041,-length*.34,w,d],
    [0,y+.030,length*.17,w*.995,d*.98],[0,y+.040,length*.64,w*.89,d*.80],
    [0,y+.066,length*.91,w*.53,d*.59],[0,y+.071,length*1.02,w*.31,d*.34]],fleece,12);
  // Small overlapping locks follow the body's existing contour instead of forming rows of lumps.
  for(let row=0;row<7;row++) for(let col=0;col<7;col++){
    const longitudinal=(row+.37+.31*random())/7;
    const a=(col+.15+random()*.66)*Math.PI/6;
    const taper=.71+.27*Math.sin(Math.PI*longitudinal);
    const scale=.79+.36*random();
    const x=Math.cos(a)*w*taper, yy=y+.043+Math.sin(a)*d*taper;
    const z=-length*.83+length*1.70*longitudinal;
    blob(p,'overlapping-wool-lock'+row+'-'+col,[.080*scale,.070*scale,.102*scale],[x,yy,z],
      col===0||col===6?under:fleece,{},3,7);
  }
  skin(p,'woolly-neck',[[0,y+.01,-length*.67,w*.68,d*.73],[0,y+.073,-length*.97,r*1.19,r*1.18],
    [0,hy-.038,hz+.113,r*.82,r*.80]],fleece,10);
  skin(p,'sheep-face',[[0,hy-.054,mz,r*.46,r*.37],[0,hy-.047,mz+.047,r*.58,r*.54],
    [0,hy+.010,hz-.047,r*.75,r*.76],[0,hy+.045,hz+.040,r*.91,r*.86],
    [0,hy+.005,hz+.124,r*.64,r*.66]],face,10);
  blob(p,'short-rounded-muzzle',[r*.56,r*.36,.063],[0,hy-.056,mz+.024],snout,{},3,9);
  blob(p,'darker-nose',[r*.46,r*.20,.024],[0,hy-.037,mz-.022],hoof,{},3,8);
  chain(p,'mouth',[[0,hy-.048,mz-.045],[0,hy-.092,mz-.040],[-.042,hy-.102,mz-.032]],
    [.005,.007,.003],hoof,5);

  for(let i=-2;i<=2;i++){
    blob(p,'forehead-fleece'+i,[.054,.051,.055],[i*.042,hy+r*.86-.007*Math.abs(i),hz-.024+i*.004],
      fleece,{},3,7);
  }
  for(const s of sides){
    const x=s*r*.77;
    blob(p,'warm-eye'+s,[.018,.026,.027],[x,hy+.037,hz-.061],flat(0x815f40),{},3,8);
    blob(p,'horizontal-pupil'+s,[.006,.008,.020],[x+s*.015,hy+.036,hz-.065],flat(0x302626),{},2,7);
    const earY=hy+.056, earZ=hz+.04;
    skin(p,'outward-ear'+s,[[s*r*.68,earY,earZ,.044,.035],
      [s*(r+.043),earY+.017,earZ+.013,.059,.034],
      [s*(r+.130),earY-.005,earZ+.041,.044,.023],
      [s*(r+.186),earY-.025,earZ+.076,.010,.009]],face,8,true);
    skin(p,'ear-lining'+s,[[s*(r+.012),earY+.012,earZ-.024,.022,.015],
      [s*(r+.066),earY+.022,earZ-.018,.036,.018],
      [s*(r+.133),earY-.002,earZ+.011,.018,.014]],inner,7,true);
    if(!lamb) ramHorn(p,s,hy,hz,horn);

    for(const rear of [false,true]){
      const z=(rear?length*.65:-length*.66)+s*.042, x=s*w*.64;
      const knee=[x*1.03,y*(rear?.60:.57),z+(rear?-.039:.015)];
      const ankle=[x*1.05,y*.26,z+(rear?.059:.014)];
      const toe=[x*1.055,.064,z-.011];
      skin(p,'compact-leg'+s+rear,[[x*.81,y+.045,z,.095,.112],[...knee,.053,.059],
        [...ankle,.036,.038],[...toe,.041,.043]],face,8);
      for(const k of sides) blob(p,'cloven-hoof'+s+rear+k,[.025,.052,.059],
        [toe[0]+k*.025,.052,toe[2]-.013],hoof,{},3,7);
    }
  }
  skin(p,'short-woolly-tail',[[0,y+.099,length*.81,.048,.044],[.014,y+.070,length*1.06,.042,.039],
    [.025,y+.011,length*1.17,.026,.029],[.033,y-.040,length*1.19,.012,.015]],fleece,8);
}
