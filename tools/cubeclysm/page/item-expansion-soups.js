import { add, V } from './lowpoly.js';
import { blob, rng, speckle } from './item-kit.js';
import { cyl, flat, outline, path, plasticP, shade } from './common-loot-kit.js';

// Liquid color and visible ingredients follow the CDDA soup descriptions and recipes.
// Clarified stocks have surface sheen only. The instant soups are shown prepared in cups.
const recipes = {
  broth: [0xa7a15a, 'stoneware', 'clear', []],
  broth_bone: [0xdec58f, 'porcelain', 'gel', []],
  broth_meat: [0x98623c, 'earthenware', 'clear', []],
  hellfire_stew: [0x8d633e, 'enamel', 'thick', [['hardtack',7]]],
  soup_blood: [0x583533, 'stoneware', 'flour', []],
  soup_chicken: [0xc78f3b, 'porcelain', 'clear', [['flatNoodle',4],['chicken',5]]],
  soup_fish: [0xa99268, 'enamel', 'clear', [['fish',4]]],
  soup_instant_chicken_noodle_prepared: [0xba8c44, 'chickenCup', 'clear', [['instantNoodle',5],['chicken',4]]],
  soup_instant_vegetable_prepared: [0x9b9c56, 'vegetableCup', 'clear', [['instantNoodle',4],['greens',5],['carrot',4]]],
  soup_lobsterstew: [0xe6ac83, 'porcelain', 'cream', [['lobster',5]]],
  soup_meat: [0x69412d, 'earthenware', 'clear', [['meat',7]]],
  soup_mushroom: [0x948c86, 'stoneware', 'thick', [['mushroom',5]]],
  soup_three_sisters: [0x93634a, 'earthenware', 'thick', [['pumpkin',4],['beans',6],['corn',8],['rice',9]]],
  soup_tomato: [0xbf4531, 'porcelain', 'puree', []],
  soup_veggy: [0x997842, 'stoneware', 'clear', [['carrot',5],['greens',5],['potato',4]]],
  soup_woods: [0x77804d, 'campGreen', 'clear', [['meat',5],['greens',5],['carrot',3]]],
  soup_woods_egg: [0xb2a359, 'campBlue', 'clear', [['egg',3],['greens',5],['carrot',3]]],
};

const vessels = {
  stoneware: [.33, 0xc0ad8c, 0xf1dec0, 0x7d8067],
  porcelain: [.29, 0xe0d9c9, 0xf0e6d3, 0x647b80],
  earthenware: [.34, 0x915e48, 0xb88c68, 0x603f36],
  enamel: [.29, 0xbac3b7, 0xe1dfc5, 0x515e5c],
  campGreen: [.33, 0x7d805b, 0xc2bf98, 0x48514a],
  campBlue: [.33, 0x7c9298, 0xd7d6ba, 0x4c6570],
  chickenCup: [.56, 0xe6c779, 0xece2cb, 0x9d563f],
  vegetableCup: [.56, 0xaab064, 0xece2cb, 0x557553],
};

function container(p, name) {
  const [height, body, lining, edge] = vessels[name];
  const cup=name.endsWith('Cup');
  const sideCount=20, rim=.46;
  const profile=cup
    ? [[0,.309],[.033,.320],[height-.02,.438],[height,.469],[height,.425],[height-.08,.392]]
    : [[0,.226],[.027,.254],[height*.23,.326],[height*.61,.415],[height-.016,rim],[height,.464],[height,.432],[height-.076,.386]];
  const rings=profile.map(([y,r])=>Array.from({length:sideCount},(_,i)=>{
    const a=(i+.5)*Math.PI*2/sideCount;
    return V(r*Math.cos(a),y,r*Math.sin(a));
  }));
  const faces=[];
  const face=(vertices,side)=>faces.push({
    p:vertices,side,wm:vertices[0].distanceTo(vertices[1]),hm:vertices[1].distanceTo(vertices[2]),
  });
  for(let j=0;j<rings.length-1;j++) for(let i=0;i<sideCount;i++) {
    const next=(i+1)%sideCount;
    const side=j===rings.length-3?'lip':j===rings.length-2?'lining':'outside'+j;
    face([rings[j][next],rings[j][i],rings[j+1][i],rings[j+1][next]],side);
  }
  for(let i=0;i<sideCount;i++) face([V(0,0,0),rings[0][i],rings[0][(i+1)%sideCount]],'bottom');
  add(p,cup?'tapered instant soup cup':'deep open soup bowl',faces,(ctx,x,y,w,h,side)=>{
    const color=side==='lip'?edge:side==='lining'?lining:body;
    const paint=speckle(name+side,color,[shade(color,1.04),shade(color,.94)],.14);
    paint(ctx,x,y,w,h,side);
    if (cup&&side==='outside1') {
      const bandY=y+Math.round(h*.59);
      flat(edge)(ctx,x,bandY,w,Math.max(1,Math.round(h*.24)));
    }
  });
  return { y:height-(cup?.067:.061), radius:cup?.412:.411 };
}

const ingredients = {
  chicken: [0xe3c390, .047], meat: [0x754832, .054], carrot: [0xd47b41, .038],
  potato: [0xd6ba82, .042], pumpkin: [0xdb8b3f, .059],
};
function garnish(p, part, x, y, z, turn) {
  const cos=Math.cos(turn), sin=Math.sin(turn);
  const point=(u,v,w)=>[x+u*cos-w*sin,y+v,z+u*sin+w*cos];
  const polygon=(name, points, height, paint, off=0)=>outline(p,name,
    points.map(([u,w])=>{const [a,,b]=point(u,0,w); return [a,b];}),height,paint,y+off);
  const stroke=(name, points, thickness, color)=>path(p,name,points.map(q=>point(...q)),thickness,plasticP(color));
  const bit=(name,radii,u,v,w,color)=>blob(p,name,radii,point(u,v,w),plasticP(color),{},3,7);

  if(ingredients[part]) {
    const [color,r]=ingredients[part];
    const h=part==='carrot'?.023:.038;
    const shape=part==='carrot'?[[-r,0],[-r*.63,-r*.77],[r*.5,-r*.81],[r,r*.06],[r*.23,r*.44],[-r*.58,r*.43]]
      :[[-r,-r*.58],[r*.74,-r*.77],[r,r*.47],[r*.26,r*.76],[-r*.68,r*.61]];
    polygon(part+' piece',shape,h,plasticP(color));
    return;
  }
  switch(part) {
    case 'flatNoodle':
      stroke('wide ribbon noodle',[[-.105,.010,-.033],[-.053,.014,.021],[.007,.020,.014],[.028,.014,-.024],[.091,.012,-.018]],.016,0xeed08a);
      break;
    case 'instantNoodle':
      stroke('thin wavy instant noodle',[[-.082,.013,0],[-.057,.014,-.028],[-.03,.016,0],[-.006,.017,-.025],[.025,.015,.003],[.05,.012,-.024],[.078,.009,.005]],.010,0xe7cd82);
      break;
    case 'fish':
      polygon('pale fish fillet',[[-.086,-.022],[-.043,-.043],[.054,-.032],[.088,.007],[.042,.049],[-.047,.037]],.028,plasticP(0xe8d9ac));
      stroke('silvery skin edge',[[-.073,.021,-.022],[-.018,.027,-.040],[.061,.024,-.027]],.010,0x8b928c);
      break;
    case 'lobster':
      stroke('curved pink lobster meat',[[-.078,.011,-.026],[-.042,.026,.008],[0,.037,.025],[.045,.021,.001],[.068,.010,-.036]],.024,0xc76346);
      for(const u of [-.039,.014,.047]) bit('cream colored lobster flesh',[.020,.013,.015],u,.034,.006,0xf0d2aa);
      break;
    case 'mushroom':
      polygon('mushroom cap slice',[[-.065,-.01],[-.061,-.037],[-.03,-.06],[.033,-.06],[.061,-.033],[.064,-.01]],.028,plasticP(0x64574f));
      polygon('pale mushroom stem',[[-.021,-.019],[.021,-.019],[.018,.054],[-.022,.049]],.022,plasticP(0xc5b2a1));
      break;
    case 'hardtack':
      polygon('browned broken hardtack',[[-.055,-.032],[.025,-.052],[.062,-.025],[.056,.025],[-.028,.05],[-.058,.024]],.028,plasticP(0xc99962));
      bit('dark toasted crumb',[.011,.005,.010],-.012,.028,.012,0x805636);
      bit('pepper speck',[.006,.004,.006],.024,.030,-.012,0x53392b);
      break;
    case 'greens':
      polygon('folded greens',[[-.048,0],[-.019,-.033],[.024,-.038],[.052,-.013],[.023,.034],[-.022,.022]],.016,plasticP(0x526e42));
      stroke('leaf vein',[[-.041,.008,0],[-.006,.017,-.005],[.043,.010,-.010]],.005,0x8c9b5b);
      break;
    case 'beans':
      stroke('dark kidney bean',[[-.025,.013,0],[-.012,.018,-.016],[.012,.020,-.017],[.022,.015,0]],.016,0x80413e);
      break;
    case 'corn':
      bit('golden kernel',[.018,.019,.017],0,.012,0,0xe7bb55);
      break;
    case 'rice':
      stroke('wild rice grain',[[-.02,.010,0],[.021,.014,.005]],.006,0x493d35);
      break;
    case 'egg':
      bit('cut boiled egg white',[.063,.023,.046],0,.014,0,0xeee6cc);
      bit('yellow yolk center',[.030,.012,.025],0,.035,0,0xe0ae49);
      break;
  }
}

function surface(p,id,style,color,y,radius) {
  const cloud=style==='gel'||style==='cream'||style==='flour'||style==='thick';
  cyl(p,'shaded liquid meniscus','y',[0,y-.007,0],radius,.012,20,plasticP(shade(color,.82)));
  const base=speckle(id+' soup',color,[shade(color,.95),shade(color,1.06)],style==='clear'?.12:.27);
  cyl(p,'soup surface','y',[0,y,0],radius-.024,.004,20,base);
  const rand=rng(id+' sheen');
  const sheen=style==='flour'?shade(color,1.12):shade(color,cloud?1.14:1.19);
  const count=style==='puree'?5:style==='flour'?10:7;
  for(let k=0;k<count;k++) {
    const angle=k*2.4,r=.306*Math.sqrt((k+.6)/count), x=Math.cos(angle)*r,z=Math.sin(angle)*r;
    const len=style==='puree'?.059:style==='gel'?.067:.030+rand()*.018;
    const direction=angle+1.57;
    const dx=Math.cos(direction)*len,dz=Math.sin(direction)*len;
    const midX=x+Math.cos(angle)*.016,midZ=z+Math.sin(angle)*.016;
    path(p,style==='flour'?'flour clump on brown soup':'surface sheen',
      [[x-dx,y+.002,z-dz],[midX,y+.004,midZ],[x+dx,y+.002,z+dz]],cloud?.007:.004,flat(sheen));
  }
}

export function soup(p,d) {
  const [color,vessel,style,toppings]=recipes[d.id];
  const {y,radius}=container(p,vessel);
  surface(p,d.id,style,color,y,radius);
  const count=toppings.reduce((sum,[,amount])=>sum+amount,0);
  const rand=rng(d.id);
  const positions=Array.from({length:count},(_,i)=>{
    const angle=i*2.4+.4;
    const radius=.30*Math.sqrt((i+.55)/count);
    return [radius*Math.cos(angle),radius*Math.sin(angle),rand()*6.283];
  });
  // Interleave ingredient types so the first listed one does not all sit in the center.
  const portions=toppings.flatMap(([type,amount])=>Array.from({length:amount},(_,i)=>({type,order:(i+.5)/amount})));
  portions.sort((a,b)=>a.order-b.order);
  for(const [i,{type}] of portions.entries()) {
    const [x,z,angle]=positions[i];
    garnish(p,type,x,y+.002,z,angle);
  }
}

