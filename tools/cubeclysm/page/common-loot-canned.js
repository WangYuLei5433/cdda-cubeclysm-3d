import { add } from './lowpoly.js';
import { V, cyl, fill, flat, lid, path, steelP, tube } from './common-loot-kit.js';

const labels = {
  can_tomato: { title:'TOMATO', base:0x9b3f33, accent:0xc55a46, food:paintTomatoIcon },
  can_corn: { title:'CORN', base:0x4d713c, accent:0x738f46, food:corn },
  can_beans: { title:'BEANS', base:0x426777, accent:0x638c98, food:beans },
  can_peach: { title:'PEACHES', base:0xa35644, accent:0xcf7e4d, food:peachSlices },
  can_pineapple: { title:'PINEAPPLE', titleWidth:65, base:0x48694c, accent:0x6d8c59, food:pineappleRings },
  apple_canned: { title:'FRUIT MIX', titleWidth:62, base:0x986048, accent:0xb77752, food:fruitMix },
  can_coconut: { title:'COCONUT', base:0x57707e, accent:0x7491a1, food:coconutMilk },
};

const otherLabels = {
  can_food: { title:'TUNA', base:0x355e82, accent:0x5889a7, food:tuna },
  can_medium: { title:'SOUP', base:0x9e483d, accent:0xbe6d52, food:soup },
  can_food_big: labels.can_beans,
  can_drink: { title:'SODA', base:0x973d40, accent:0xc66459, food:fizz },
  cola: { title:'COLA', base:0x993d42, accent:0xcc6257, food:fizz },
  beer: { title:'BEER', base:0x947037, accent:0xcdab55, food:mug },
  pale_ale: { title:'PALE ALE', titleWidth:58, base:0x416a52, accent:0x77935d, food:hops },
  spray_can: { title:'PAINT', base:0x516777, accent:0x8aa1a8, food:spray },
};

function polygon(ctx,color,points) {
  ctx.fillStyle=color;
  ctx.beginPath();
  for(const [i,[x,y]] of points.entries()) {
    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fill();
}

function peachSlices(ctx) {
  polygon(ctx,'#a05e3e',[[23,43],[36,34],[53,34],[67,43],[66,58],[57,69],[46,75],[32,71],[21,60]]);
  polygon(ctx,'#f1ab53',[[27,42],[41,36],[55,39],[63,47],[58,56],[47,62],[35,56],[25,50]]);
  polygon(ctx,'#e68944',[[26,52],[36,59],[48,64],[62,59],[57,70],[46,74],[34,69],[26,61]]);
  polygon(ctx,'#f8c76f',[[29,44],[40,40],[51,42],[46,48],[35,51],[29,48]]);
}

function pineappleRings(ctx) {
  for(const [x,y] of [[50,46],[41,61]]) {
    ctx.beginPath();
    ctx.ellipse(x,y,21,12,-.21,0,Math.PI*2);
    ctx.fillStyle='#ad773a';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x,y-3,20,10,-.21,0,Math.PI*2);
    ctx.fillStyle='#ebbc58';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x,y-3,7,3.5,-.21,0,Math.PI*2);
    ctx.fillStyle='#7f6a46';
    ctx.fill();
  }
}

function fruitMix(ctx) {
  polygon(ctx,'#9d4135',[[19,49],[33,42],[48,44],[52,56],[44,69],[30,70],[20,63]]);
  polygon(ctx,'#dda65a',[[40,42],[55,36],[67,43],[66,57],[54,64],[43,56]]);
  polygon(ctx,'#83a05c',[[39,62],[50,55],[61,58],[62,69],[54,73],[42,70]]);
  fill(ctx,27,48,10,4,0xda7851);
  fill(ctx,47,41,12,4,0xedc578);
  fill(ctx,46,61,9,3,0xa9b874);
}

function coconutMilk(ctx) {
  polygon(ctx,'#77604b',[[17,52],[24,39],[38,35],[53,42],[57,56],[50,68],[37,71],[25,65]]);
  polygon(ctx,'#ad835d',[[21,49],[27,42],[38,39],[45,42],[43,51],[34,58],[24,57]]);
  polygon(ctx,'#715347',[[36,58],[41,49],[57,46],[68,50],[73,57],[67,69],[57,75],[44,71]]);
  polygon(ctx,'#eddfb7',[[39,57],[48,51],[58,50],[68,54],[69,59],[62,65],[48,67],[41,63]]);
  polygon(ctx,'#b89d78',[[49,57],[57,54],[63,56],[62,60],[54,62],[49,60]]);
}

function tuna(ctx) {
  polygon(ctx,'#385b73',[[15,43],[28,50],[40,39],[56,42],[67,51],[73,56],[64,62],[54,66],[40,66],[28,59],[15,66],[18,56]]);
  polygon(ctx,'#688da1',[[28,54],[39,43],[55,46],[67,55],[50,54],[40,59]]);
  fill(ctx,60,51,4,4,0xf1e5b9);
  fill(ctx,61,52,2,2,0x344650);
}

function soup(ctx) {
  polygon(ctx,'#825441',[[21,51],[67,51],[63,63],[55,69],[33,69],[25,62]]);
  polygon(ctx,'#bd5c45',[[21,51],[27,46],[61,46],[67,51],[60,57],[29,57]]);
  for(const x of [31,44,56]) polygon(ctx,'#9e7757',[[x,44],[x-2,40],[x+3,37],[x+1,33],[x+6,37],[x+2,41]]);
  fill(ctx,32,70,24,2,0x9a6a52);
}

function fizz(ctx) {
  polygon(ctx,'#913c37',[[35,40],[49,40],[49,46],[54,51],[54,68],[51,72],[33,72],[30,68],[30,51],[35,46]]);
  polygon(ctx,'#d27556',[[37,47],[45,47],[49,53],[49,67],[36,67],[34,54]]);
  fill(ctx,34,37,15,3,0x674637);
  fill(ctx,58,52,6,6,0xbe6246);
  fill(ctx,60,42,4,4,0xbe6246);
  fill(ctx,23,48,4,4,0xbe6246);
}

function mug(ctx) {
  polygon(ctx,'#936b38',[[49,46],[64,46],[68,51],[66,61],[60,65],[49,65]]);
  fill(ctx,53,50,9,10,0xeadeba);
  polygon(ctx,'#c28a38',[[27,42],[55,42],[55,66],[51,72],[31,72],[27,66]]);
  fill(ctx,33,51,4,15,0xe4b350);
  polygon(ctx,'#f4e5b9',[[24,43],[25,39],[31,37],[36,39],[41,35],[47,39],[54,38],[59,44],[56,48],[47,46],[36,49],[26,47]]);
}

function hops(ctx) {
  polygon(ctx,'#426943',[[40,35],[55,43],[59,55],[53,65],[44,73],[33,68],[26,59],[29,46]]);
  for(let row=0;row<4;row++) for(const sign of [-1,1]) {
    const y=42+row*6,x=43+sign*(row===0?7:10);
    polygon(ctx,row%2?'#86a35b':'#779452',[[x-6,y],[x+1,y-3],[x+7,y+1],[x+3,y+7],[x-3,y+5]]);
  }
  polygon(ctx,'#4a6741',[[41,38],[43,31],[47,33],[46,40]]);
}

function spray(ctx) {
  polygon(ctx,'#385061',[[32,70],[28,64],[28,47],[33,40],[39,40],[39,34],[49,34],[49,40],[55,47],[55,65],[52,70]]);
  fill(ctx,33,49,17,13,0x96a9ad);
  fill(ctx,49,35,4,3,0x334653);
  for(const [x,y] of [[57,33],[62,36],[64,30],[69,35],[68,39]]) fill(ctx,x,y,2,2,0xba715e);
}

export function paintTomatoIcon(ctx) {
  polygon(ctx,'#a1372c',[[18,51],[22,41],[31,36],[48,36],[57,43],[63,53],[61,64],[53,70],[31,70],[22,65]]);
  polygon(ctx,'#d65039',[[18,48],[23,40],[32,36],[46,36],[54,41],[56,52],[54,64],[48,68],[30,67],[22,60]]);
  polygon(ctx,'#eb7451',[[22,47],[27,42],[33,40],[36,44],[29,48],[27,56],[22,55]]);
  polygon(ctx,'#477246',[[28,39],[36,36],[40,31],[44,31],[44,36],[51,38],[48,42],[43,40],[39,44],[37,39]]);
  polygon(ctx,'#742e2a',[[52,61],[60,58],[67,61],[69,66],[66,71],[58,73],[51,69]]);
  polygon(ctx,'#c44534',[[52,60],[57,58],[64,59],[67,64],[64,70],[57,71],[51,67]]);
  polygon(ctx,'#4c7543',[[56,59],[59,56],[63,57],[63,60],[67,61],[63,64],[59,62],[54,63]]);
}

function corn(ctx) {
  ctx.save();
  ctx.translate(41,54);
  ctx.rotate(-.54);
  polygon(ctx,'#ab752f',[[-24,-8],[-16,-12],[14,-12],[23,-7],[24,2],[19,10],[-16,12],[-24,7]]);
  for(let row=0;row<4;row++) for(let col=0;col<7;col++) {
    if((row===0||row===3)&&col===6) continue;
    const x=-17+col*6, y=-10+row*5;
    fill(ctx,x,y,5,4,row<2?0xf3c45b:0xe4a843);
    if((row+col)%2===0) fill(ctx,x+1,y,2,1,0xffde80);
  }
  polygon(ctx,'#52753c',[[-27,7],[-24,-10],[-18,-2],[-10,2],[2,12],[-15,13],[-25,11]]);
  polygon(ctx,'#789548',[[-27,6],[-25,-3],[-17,6],[-7,10],[-16,11],[-24,9]]);
  ctx.restore();
  polygon(ctx,'#d59739',[[53,63],[57,60],[62,62],[62,67],[57,69],[52,67]]);
  polygon(ctx,'#ebba54',[[59,70],[63,67],[68,69],[68,74],[64,76],[59,74]]);
}

function beans(ctx) {
  const bean=(x,y,angle,body,highlight)=>{
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    polygon(ctx,'#592e29',[[-12,-7],[-6,-11],[5,-11],[12,-5],[12,3],[6,9],[-2,9],[-4,5],[0,0],[-3,-2],[-8,1],[-12,-3]]);
    polygon(ctx,body,[[-10,-7],[-5,-9],[4,-9],[10,-4],[10,2],[5,7],[-1,7],[-2,5],[2,-1],[-2,-4],[-8,-1]]);
    polygon(ctx,highlight,[[-8,-7],[-4,-9],[2,-8],[5,-5],[2,-4],[-2,-6]]);
    ctx.restore();
  };
  bean(33,47,-.35,'#a55343','#d18462');
  bean(53,53,.73,'#944338','#bd6a53');
  bean(38,65,.21,'#a65747','#d48461');
}

function wrapArt(info) {
  const canvas=document.createElement('canvas');
  canvas.width=88;
  canvas.height=88;
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  fill(ctx,0,0,88,88,0xc0c2b9);
  fill(ctx,0,6,88,76,info.base);
  fill(ctx,0,9,88,2,info.accent);
  fill(ctx,9,29,70,46,0xeadeba);
  fill(ctx,9,29,70,2,0xefedce);
  fill(ctx,9,74,70,1,0xbca57d);
  info.food(ctx);
  ctx.fillStyle='#f5ebcf';
  ctx.textBaseline='middle';
  ctx.textAlign='center';
  ctx.font='bold 13px sans-serif';
  ctx.fillText(info.title,44,21,info.titleWidth??73);
  return canvas;
}

function wrapCan(p,r,h,graphic) {
  const sides=12, half=sides/2;
  const corner=(i,y)=>{
    const angle=(i+.5)*2*Math.PI/sides;
    return V(r*Math.cos(angle),y,r*Math.sin(angle));
  };
  const faces=Array.from({length:sides},(_,i)=>{
    const q=[corner(i+1,0),corner(i,0),corner(i,h),corner(i+1,h)];
    return {p:q,side:i,wm:q[0].distanceTo(q[1]),hm:h};
  });
  const bare=steelP(0xaeb8b7);
  add(p,graphic?'illustrated wraparound can label':'unprinted aluminum wall',faces,(ctx,x,y,w,h,i)=>{
    if(!graphic) {
      bare(ctx,x,y,w,h,i);
      return;
    }
    const slice=graphic.width/half;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(graphic,(half-1-i%half)*slice,0,slice,graphic.height,x,y,w,h);
  },{ppm:1024});
}

function tabOnTop(p,r,h) {
  const metal=steelP(0xb9c0bc), tab=steelP(0xdbe0d9);
  const hole=Array.from({length:13},(_,i)=>{
    const a=i*2*Math.PI/12;
    return [Math.cos(a)*r*.24,h+.0027,r*(.22+Math.sin(a)*.30)];
  });
  path(p,'raised metal pull ring',hole,.0020,tab);
  tube(p,'pull tab hinge',V(0,h+.002,r*.004),V(0,h+.0017,-r*.17),.0031,.0025,8,metal);
  cyl(p,'pull tab rivet','y',[0,h+.002,-r*.14],.0026,.0035,9,tab);
}

function drinkOpening(angle) {
  return [.36*Math.cos(angle),-.40+.26*Math.sin(angle)];
}

function pullTop(p,r,h,drink=false) {
  const metal=steelP(0xb9c0bc);
  lid(p,'rolled steel base',r+.001,0,.004,metal);
  lid(p,'rolled steel top',r+.001,h-.004,.004,metal);
  lid(p,'recessed easy-open panel',r*.89,h-.0003,.0004,steelP(0xa0a8a3));
  const score=drink?Array.from({length:13},(_,i)=>drinkOpening(i*Math.PI/6))
    :[[-.68,.38],[-.78,.02],[-.65,-.45],[-.30,-.76],[.25,-.79],[.65,-.53],[.79,-.07],
      [.71,.32],[.45,.61],[.19,.66],[0,.53],[-.26,.71],[-.48,.58],[-.68,.38]];
  path(p,'scored lid opening',score.map(([x,z])=>[r*x,h+.00045,r*z]),.00066,flat(0x666e6b));
  tabOnTop(p,r,h);
}

function addBand(p,name,count,pointFor,paint) {
  const faces=Array.from({length:count},(_,i)=>{
    const q=pointFor(i,i+1);
    return {p:q,side:i,wm:q[0].distanceTo(q[1]),hm:q[1].distanceTo(q[2])};
  });
  add(p,name,faces,paint,{ppm:390});
}

function openTop(p,r,h) {
  // Quads span from the real opening to the rim, leaving empty space under the drinking hole.
  const count=16;
  const section=(i)=>{
    const angle=i*2*Math.PI/count;
    const [x,z]=drinkOpening(angle);
    const dx=Math.cos(angle),dz=Math.sin(angle);
    const dot=-.40*dz;
    const t=-dot+Math.sqrt(dot*dot+1-.40**2);
    return [V(r*x,h,r*z),V(r*t*dx,h,r*(-.40+t*dz))];
  };
  addBand(p,'open drink lid with actual aperture',count,(i,next)=>{
    const [ai,ao]=section(i),[bi,bo]=section(next);
    return [ai,bi,bo,ao];
  },steelP(0xaab3b0));
  addBand(p,'shadowed drinking aperture rim',count,(i,next)=>{
    const [a]=section(i),[b]=section(next);
    const lower=v=>V(v.x*.91,h-.0033,-r*.40+(v.z+r*.40)*.91);
    return [b,a,lower(a),lower(b)];
  },steelP(0x586261));
  tabOnTop(p,r,h);
}

export function drawEmptyCan(p,id,r,h,drink=false) {
  const info=otherLabels[id];
  wrapCan(p,r,h,info&&wrapArt(info));
  const metal=steelP(0x9ca7a6), inside=steelP(0x737e7e), count=12;
  const point=(i,radius,y)=>{
    const a=(i+.5)*Math.PI*2/count;
    return V(radius*Math.cos(a),y,radius*Math.sin(a));
  };
  lid(p,'rolled steel base',r+.001,0,.004,metal);
  addBand(p,'uncovered empty can interior',count,(i,next)=>[
    point(i,r*.95,.003),point(next,r*.95,.003),point(next,r*.95,h),point(i,r*.95,h),
  ],inside);
  if(drink) {
    lid(p,'dark recessed interior base',r*.92,.004,.001,flat(0x505958));
    openTop(p,r,h);
  }
  addBand(p,'rolled open rim',count,(i,next)=>[
    point(i,r*.94,h),point(next,r*.94,h),point(next,r*1.028,h+.0017),point(i,r*1.028,h+.0017),
  ],steelP(0xc3c9bf));
}

export function drawDrinkCan(p,id,r,h) {
  wrapCan(p,r,h,wrapArt(otherLabels[id]));
  pullTop(p,r,h,true);
}

export function drawSprayPaint(p) {
  const r=.030,h=.192,metal=steelP(0xb3bbb8);
  wrapCan(p,r,h,wrapArt(otherLabels.spray_can));
  lid(p,'rolled aerosol base',r+.001,0,.003,metal);
  cyl(p,'curved aerosol shoulder','y',[0,h-.001,0],r,.012,12,metal,{},.021);
  lid(p,'spray valve collar',.012,h+.005,.004,metal);
  lid(p,'paint spray actuator',.0095,h+.008,.009,flat(0xc4c8b8));
  cyl(p,'black spray nozzle aperture','z',[0,h+.012,-.009],.0029,.0018,9,flat(0x353b3e));
}

export function drawCannedFood(p,d,r,h) {
  const info=labels[d.id];
  if(!info) return false;
  wrapCan(p,r,h,wrapArt(info));
  pullTop(p,r,h);
  return true;
}

