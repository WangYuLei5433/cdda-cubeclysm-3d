import { GLASS, V, fill, flat, layers, plasticP, shade } from './item-kit.js';
import { add, poly } from './lowpoly.js';
import { top } from './common-loot-kit.js';

function face(points, side) {
  return { p:points, side, wm:points[0].distanceTo(points[1]), hm:points[1].distanceTo(points[2]) };
}
function drawPanel(p, name, grid, paint, opts, lower = false) {
  const faces = [];
  for(let row=0;row<grid.length-1;row++) for(let i=0;i<grid[row].length-1;i++) {
    const q=[grid[row][i+1],grid[row][i],grid[row+1][i],grid[row+1][i+1]];
    faces.push(face(lower?q.reverse():q, row*6+i));
  }
  add(p,name,faces,paint,opts);
}

// Thin extruded ribbon lying along the plastic, rather than round cord.
function ribbon(p,name,points,width,paint) {
  const edges=points.map(([x,y,z],i)=>{
    const prev=points[Math.max(0,i-1)], next=points[Math.min(points.length-1,i+1)];
    const dx=next[0]-prev[0],dz=next[2]-prev[2],len=Math.hypot(dx,dz);
    return [V(x-dz/len*width,y,z+dx/len*width),V(x+dz/len*width,y,z-dx/len*width)];
  });
  for(let i=0;i<edges.length-1;i++) poly(p,name,[...edges[i],edges[i+1][1],edges[i+1][0]],V(0,1,0),paint,{cutout:true});
}

const xPositions=[-1,-.68,-.24,.25,.69,1];
const typicalRows=[
  // Half width, depth, top film height at the center.
  [.81,-.50,.090], [.97,-.29,.11], [1,-.04,.092], [.96,.23,.058], [.87,.47,.018],
];
const topWrinkles=[
  [0,.28,.81,1,.42,0], [0,.46,.77,1,.63,0],
  [0,.59,1,.57,.85,0], [0,.37,.73,1,.43,0], [0,.33,.71,.48,.24,0],
];
const bottomWrinkles=[
  [0,.43,.58,.86,.52,0], [0,.47,.68,.21,.55,0],
  [0,.43,.50,.21,.64,0], [0,.27,.55,.44,.43,0], [0,.12,.37,.36,.2,0],
];
const smallRows=[[.73,-.52,.092],[.96,-.32,.105],[1,-.06,.115],[.86,.19,.067],[.76,.42,.021]];
const plainRows=[[.78,-.49,.095],[.92,-.29,.108],[1,-.06,.091],[1,.24,.058],[.92,.49,.018]];

function softBag(p, { width,length,tint,seam,kind }) {
  const shopping=kind==='shopping', black=kind==='garbage', woven=kind==='woven';
  const rowShape=kind==='small'?smallRows:kind==='plain'?plainRows:typicalRows;
  const edge=flat(seam);
  const lowerTint=shade(tint,black?.68:.82);
  const film=(base)=>woven?weave(base):(_ctx,x,y,w,h,side)=>{
    const colors=black?[.96,1.01,1.025,1.065]:[.975,1,1.014,1.035];
    const shadeColor=shade(base,colors[(side*3+Math.floor(side/6))%colors.length]);
    fill(_ctx,x,y,w,h,shadeColor);
  };
  const grid=(front)=>rowShape.map(([radius,z,rise],row)=>xPositions.map((x,i)=>{
    const lift=front?topWrinkles[row][i]*rise:bottomWrinkles[row][i]*(row===0?.037:.020);
    const border=i===0||i===5;
    const warp=border?(row%2===0?.006:-.015)*Math.sign(x):.012*((i+row*2)%3-1);
    const crease=row===0?.011*(1-Math.abs(x)):.008*((i*2+row)%3-1);
    const open=1-Math.abs(x);
    const mouthRise=front&&row===0 ? .046*open : 0;
    const lipOffset=row===0?(front?.050:-.021)*open:0;
    const height=border?0:row===rowShape.length-1?.008:lift+.010+mouthRise;
    const skew=kind==='small'?(row-2)*.021:0;
    return V((x*radius*.5+warp+skew)*width,height*length,(z+crease+lipOffset)*length);
  }));
  const up=grid(true), back=grid(false);
  // Weld two films along the sides and heel. The row nearest the handles is the open mouth.
  const opts=black||woven?{cutout:true}:GLASS;
  drawPanel(p,'upper folded film',up,film(tint),opts);
  drawPanel(p,'lower bag film',back,film(lowerTint),opts,true);
  if(!black&&!woven) drawPanel(p,'shaded lining at open mouth',back.slice(0,2),film(shade(tint,.70)),GLASS);
  for(const column of [0,xPositions.length-1]) {
    ribbon(p,'heat welded side seam',up.map(row=>row[column].toArray()),width*.012,edge);
  }
  ribbon(p,'sealed bottom edge',up.at(-1).map(v=>v.toArray()),width*.012,edge);
  ribbon(p,'upper lip of open mouth',up[0].map(v=>v.toArray()),width*.009,flat(shade(seam,1.15)));
  ribbon(p,'lower lip of open mouth',back[0].map(v=>v.toArray()),width*.008,edge);
  const foldColor=flat(woven?0xb7b19e:shade(tint,black?1.47:1.075));
  for(const track of [[0,1,2,2],[4,4,3,2],[3,3,4,5]]) {
    const points=track.map((column,row)=>{
      const v=up[row][column];
      return [v.x,v.y+.0008,v.z];
    });
    ribbon(p,'fine creased reflection',points,width*(woven?.004:.005),foldColor);
  }
  if(shopping) {
    for(const sign of [-1,1]) {
      const outer=up[0][sign<0?0:5].toArray(),inner=up[0][sign<0?1:4].toArray();
      const arc=[[.415,.038,-.615],[.385,.031,-.727],[.296,.026,-.758],
        [.223,.024,-.692],[.229,.040,-.569]].map(([x,y,z])=>[sign*x*width,y*length,z*length]);
      ribbon(p,'flat loop handle',[outer,...arc,inner],width*.038,flat(0xe6e9de));
    }
    const emblem=layers(flat(0xe5e6da),(ctx,x,y,w,h)=>{
      fill(ctx,x+w*.10,y+h*.16,w*.80,h*.15,0xb2524d);
      fill(ctx,x+w*.16,y+h*.37,w*.68,h*.42,0xc26f62);
      fill(ctx,x+w*.30,y+h*.28,w*.40,h*.12,0x914d45);
      fill(ctx,x+w*.26,y+h*.46,w*.47,h*.08,0xe6c6a7);
    });
    const panel=[up[2][3],up[2][2],up[3][2],up[3][3]].map(v=>V(v.x,v.y+.001,v.z));
    poly(p,'printed grocery mark',panel,V(0,1,0),emblem,{glass:true});
  }
  if(black) for(const sign of [-1,1]) {
    const points=[[sign*.34*width,length*.02,-length*.49],[sign*.43*width,length*.028,-length*.54],
      [sign*.36*width,length*.013,-length*.60],[sign*.26*width,length*.014,-length*.63]];
    ribbon(p,'loose drawstring tape',points,width*.018,flat(0x758699));
  }
}

export function openPlasticBag(p, small=false) {
  softBag(p,small?{width:.121,length:.151,tint:0xc5d9d5,seam:0x9fbbb6,kind:'small'}
    :{width:.190,length:.238,tint:0xd5e2d0,seam:0xadc2a8,kind:'plain'});
}

export function shoppingBag(p) {
  softBag(p,{width:.266,length:.345,tint:0xe9e9df,seam:0xd6dace,kind:'shopping'});
}

export function garbageBag(p) {
  softBag(p,{width:.374,length:.435,tint:0x303644,seam:0x506071,kind:'garbage'});
}

function sealStrip(p,name,width,z0,z1,y,colors) {
  p.box(name,[-width/2,y,z0,width/2,y+.002,z1],plasticP(colors[0]));
  p.box(name+' highlight',[-width/2,y+.002,z0+.001,width/2,y+.0028,z0+.0022],flat(colors[1]));
}

export function pressSealBag(p,gallon=false) {
  const width=gallon?.268:.171,length=gallon?.273:.172;
  const tint=gallon?0xcbdce8:0xd8e5e1;
  const row=[[-.50,.80,.018],[-.42,.97,.012],[-.22,1,.023],[.04,.98,.020],[.29,.98,.018],[.48,.93,.009]];
  const points=(upper)=>row.map(([z,w,lift],j)=>xPositions.map((x,i)=>{
    const crease=(i===0||i===5)?0:lift*((i*3+j)%5)/4;
    const y=upper ? .002+(lift*.30+crease)*length : 0;
    return V(x*w*width*.5,y,z*length);
  }));
  const up=points(true),bottom=points(false);
  const film=(base)=>(ctx,x,y,w,h,k)=>fill(ctx,x,y,w,h,shade(base,[.986,1.013,1.034,1][k%4]));
  drawPanel(p,'clear creased front film',up,film(tint),GLASS);
  drawPanel(p,'clear back film',bottom,film(shade(tint,.89)),GLASS,true);
  const seams=flat(gallon?0xb2c5da:0xa1c6c0);
  for(const col of [0,5]) ribbon(p,'welded clear side edge',up.map(r=>r[col].toArray()),width*.010,seams);
  ribbon(p,'welded bottom edge',up.at(-1).map(v=>v.toArray()),width*.011,seams);
  ribbon(p,'free edge above zipper',up[0].map(v=>v.toArray()),width*.005,flat(shade(tint,1.07)));
  for(const track of [[1,1,2],[4,4,5],[0,1,2]]) {
    ribbon(p,'fine wrinkles in clear film',track.map((col,i)=>{
      const v=up[i+2][col];
      return [v.x,v.y+.00065,v.z];
    }),width*.003,flat(shade(tint,1.07)));
  }
  const pressY=.0075*length+.0018;
  const sealColor=gallon?0x4f659b:0x367da2;
  sealStrip(p,'upper press seal',width*.945,-length*.421,-length*.393,pressY,[sealColor,0xa4d1df]);
  sealStrip(p,'lower press seal',width*.945,-length*.366,-length*.348,pressY,[gallon?0x7c699f:0x6b9f8b,0xb7d7d3]);
  if(gallon) top(p,'frosted write-on patch',[-width*.36,length*.13,-width*.035,length*.26],length*.026+.002,flat(0xd7ded8),{glass:true});
}

function weave(color) {
  return (ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,color);
    for(let j=0;j<h;j+=3) {
      fill(ctx,x,y+j,w,1,shade(color,j%2?.94:.975));
      for(let i=j%2;i<w;i+=3) fill(ctx,x+i,y+j+1,1,2,shade(color,1.045));
    }
  };
}

export function wovenPolySack(p,d) {
  if(d.id==='bag_durasack') {
    softBag(p,{width:.66,length:.92,tint:0xdcd8c7,seam:0xaaa48f,kind:'woven'});
    return;
  }
  const bag=weave(0xc6c1ad), edge=weave(0xada58d);
  const outlines=[
    [[-.32,-.36],[.29,-.38],[.35,-.27],[.34,.29],[.25,.41],[-.29,.38],[-.36,.25],[-.37,-.27]],
    [[-.34,-.37],[.32,-.38],[.38,-.285],[.37,.31],[.30,.43],[-.33,.42],[-.39,.31],[-.39,-.29]],
    [[-.28,-.32],[.27,-.32],[.33,-.24],[.31,.25],[.24,.35],[-.27,.34],[-.32,.27],[-.34,-.24]],
  ];
  const rings=outlines.map((row,index)=>row.map(([x,z])=>V(x,[0,.077,.182][index],z)));
  const faces=[];
  for(let band=0;band<rings.length-1;band++) for(let i=0;i<8;i++) {
    const next=(i+1)%8;
    faces.push(face([rings[band][next],rings[band][i],rings[band+1][i],rings[band+1][next]],band));
  }
  const low=rings[0], high=rings.at(-1);
  for(let j=1;j<7;j++) {
    faces.push(face([low[0],low[j],low[j+1]],0));
    faces.push(face([high[0],high[j+1],high[j]],2));
  }
  add(p,'bulging woven cement sack',faces,bag,{ppm:90});
  ribbon(p,'folded sealed mouth',[[-.335,.13,-.32],[-.19,.168,-.345],[.11,.16,-.356],[.303,.122,-.343]],.029,edge);
  ribbon(p,'heavy stitched bottom seam',[[-.33,.080,.391],[-.15,.10,.411],[.13,.107,.421],[.297,.083,.408]],.014,edge);
  top(p,'printed cement face',[-.23,-.23,.224,.25],.183,(ctx,x,y,w,h)=>{
    ctx.translate(x+w,y+h);
    ctx.rotate(Math.PI);
    x=0; y=0;
    weave(0x6c7b73)(ctx,x,y,w,h);
    fill(ctx,x+w*.055,y+h*.065,w*.89,h*.88,0xd8d2b9);
    fill(ctx,x+w*.12,y+h*.48,w*.76,h*.035,0x7e8a79);
    ctx.fillStyle='#404f46';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font='bold '+Math.round(h*.20)+'px monospace';
    ctx.fillText('CEMENT',x+w*.50,y+h*.29,w*.76);
    for(let k=0;k<4;k++) fill(ctx,x+w*.14,y+h*(.58+k*.064),w*(.68-k%2*.10),1,0x7b8073);
  },{ppm:128});
}

