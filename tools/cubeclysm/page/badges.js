import { ShapeUtils, Vector2 } from 'three';
import { V, add, poly } from './lowpoly.js';
import { cyl, fill, flat, plasticP, shade, speckle, steelP, tube } from './item-kit.js';

function radialOutline(count, outer, inner = outer) {
  return Array.from({ length: count }, (_, i) => {
    const angle = i * 2 * Math.PI / count - Math.PI / 2;
    const radius = i % 2 === 0 ? outer : inner;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  });
}

const oval = radialOutline(20,.48).map(([x,y]) => [x*.86,y]);
const shield = [[-.34,-.42],[0,-.36],[.34,-.42],[.42,-.24],[.39,.115],[.26,.33],[0,.49],[-.26,.33],[-.39,.115],[-.42,-.24]];
const tacticalShield = [[-.30,-.45],[.30,-.45],[.43,-.31],[.43,.14],[.34,.33],[0,.46],[-.34,.33],[-.43,.14],[-.43,-.31]];
const eagleShield = [[-.46,-.46],[-.22,-.41],[-.09,-.36],[.06,-.49],[.16,-.43],[.17,-.36],[.46,-.46],
  [.39,-.26],[.34,-.20],[.37,.04],[.32,.25],[.19,.39],[0,.48],[-.19,.39],[-.32,.25],[-.37,.04],[-.34,-.20],[-.39,-.26]];
const nameTag = [[-.45,-.29],[.45,-.29],[.50,-.23],[.50,.23],[.45,.29],[-.45,.29],[-.50,.23],[-.50,-.23]];
const filmClip = [[-.30,-.49],[.25,-.49],[.37,-.32],[.37,.40],[.30,.49],[-.30,.49],[-.37,.40],[-.37,-.40]];
const leaf = [[0,-.50],[.24,-.28],[.34,-.08],[.31,.17],[.17,.36],[-.03,.49],[-.25,.31],[-.34,.11],[-.29,-.15],[-.14,-.34]];

const styles = {
  badge_deputy: { contour:radialOutline(10,.49,.276), color:0x989995, field:0x595b52, size:.060, panel:[.49,.31,0], metal:true, hub:.24 },
  badge_detective: { contour:shield, color:0xb59854, field:0x795c2b, size:.062, panel:[.57,.50,-.01], metal:true },
  badge_doctor: { contour:nameTag, color:0xd7e1d9, field:0xe2e8df, size:.085, panel:[.88,.49,0] },
  badge_fbi: { contour:eagleShield, color:0xc4a257, field:0x67512f, size:.065, panel:[.51,.50,.045], crest:true, metal:true },
  badge_foodkid: { contour:radialOutline(10,.50,.283), color:0xd7a340, field:0xb55535, size:.072, panel:[.50,.35,0], hub:.24 },
  badge_marshal: { contour:oval, color:0xc6ced0, field:0x394e5b, size:.060, panel:[.43,.33,0], overlay:radialOutline(10,.43,.232), metal:true, hub:.23 },
  badge_swat: { contour:tacticalShield, color:0xa4afb3, field:0x39424b, size:.062, panel:[.60,.57,-.02], metal:true },
  jade_brooch: { contour:leaf, color:0x447b60, field:0x689b76, size:.043, panel:[.46,.58,.015], jade:true },
  pin_badge: { contour:radialOutline(20,.49), color:0xa8a7a2, field:0xad644e, size:.032, panel:[.57,.58,0], metal:true },
  rad_badge: { contour:filmClip, color:0x58788e, field:0xd1dad1, size:.063, panel:[.60,.76,.045], film:true },
};
export const hasBadge = (id) => Object.hasOwn(styles,id);

function plate(p, name, outline, size, bottom, top, paint, opts) {
  const contour = outline.map(([x,v]) => new Vector2(x,v));
  const triangles = ShapeUtils.triangulateShape(contour, []);
  const ring = (scale,y) => outline.map(([x,v]) => V(x*size*scale,y,-v*size*scale));
  const lower = ring(.955,bottom);
  const edge = ring(1,top-.00065);
  const upper = ring(.963,top);
  const faces = [];
  function face(points, outward, surface) {
    if (points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).dot(outward)<0) points.reverse();
    faces.push({ p:points, side:surface, wm:points[0].distanceTo(points[1]), hm:points[1].distanceTo(points[2]) });
  }
  for (let i=0;i<outline.length;i++) {
    const next=(i+1)%outline.length;
    const normal=edge[i].clone().add(edge[next]).setY(0);
    face([lower[i],lower[next],edge[next],edge[i]],normal,'edge');
    face([edge[i],edge[next],upper[next],upper[i]],normal.clone().setY(.1),'bevel');
  }
  for (const tri of triangles) {
    face(tri.map(i=>lower[i]),V(0,-1,0),'back');
    face(tri.map(i=>upper[i]),V(0,1,0),'face');
  }
  add(p,name,faces,paint,opts);
}

function polygon(ctx, color, points) {
  ctx.fillStyle=color;
  ctx.beginPath();
  points.forEach(([x,y], i) => i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y));
  ctx.closePath();
  ctx.fill();
}

function disc(ctx, color, x, y, radius) {
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.arc(x,y,radius,0,Math.PI*2);
  ctx.fill();
}

function word(ctx, label, x, y, size, color, width = 92) {
  ctx.fillStyle=color;
  ctx.font=`bold ${size}px sans-serif`;
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(label,x,y,width);
}

const pale = '#e9dfc3';
const gold = '#e7c982';
const silver = '#e0e7e5';

const art = {
  badge_deputy(ctx) {
    word(ctx,'DEPUTY',50,42,29,silver,85);
    word(ctx,'SHERIFF',50,71,17,'#b9c2ba',73);
    fill(ctx,26,19,48,3,0xb8c1b9);
  },
  badge_detective(ctx) {
    disc(ctx,gold,48,33,21);
    disc(ctx,'#795c2b',48,33,14);
    polygon(ctx,gold,[[60,43],[75,61],[69,67],[54,48]]);
    word(ctx,'DETECTIVE',50,82,22,gold,92);
  },
  badge_doctor(ctx) {
    fill(ctx,0,0,100,33,0x386d6d);
    word(ctx,'DOCTOR',61,17,22,'#eeeee5',65);
    fill(ctx,10,10,14,11,0xe5eee4);
    fill(ctx,14,5,6,21,0xe5eee4);
    fill(ctx,6,42,26,48,0x9cb0ae);
    disc(ctx,'#527274',19,56,6);
    polygon(ctx,'#527274',[[9,85],[11,71],[27,71],[30,85]]);
    for (const [y,w] of [[50,52],[63,43],[77,33]]) fill(ctx,39,y,w,4,0x597574);
  },
  badge_fbi(ctx) {
    word(ctx,'FBI',50,13,28,gold,72);
    disc(ctx,gold,42,41,8);
    polygon(ctx,gold,[[35,49],[48,49],[59,76],[27,76],[31,58],[20,56],[20,50]]);
    fill(ctx,49,51,25,4,0xe7c982);
    fill(ctx,67,43,3,19,0xe7c982);
    fill(ctx,56,43,29,3,0xe7c982);
    polygon(ctx,gold,[[51,55],[65,55],[62,62],[55,62]]);
    polygon(ctx,gold,[[77,55],[91,55],[87,62],[81,62]]);
    word(ctx,'JUSTICE',50,89,17,pale,78);
  },
  badge_foodkid(ctx) {
    word(ctx,'FOODKID',50,26,24,'#fff0b9',96);
    polygon(ctx,'#ffc45f',[[26,57],[34,45],[44,42],[60,42],[69,46],[74,57]]);
    fill(ctx,26,60,48,6,0x744331);
    fill(ctx,30,66,40,4,0x86a35b);
    polygon(ctx,'#ffc45f',[[27,72],[73,72],[68,82],[32,82]]);
  },
  badge_marshal(ctx) {
    const mark = radialOutline(10,21,9).map(([x,y])=>[x+50,y+29]);
    polygon(ctx,silver,mark);
    word(ctx,'MARSHAL',50,70,25,silver,92);
  },
  badge_swat(ctx) {
    word(ctx,'SWAT',50,28,35,silver,90);
    for (const y of [49,65]) polygon(ctx,silver,[[15,y],[50,y+13],[85,y],[85,y+10],[50,y+23],[15,y+10]]);
  },
  jade_brooch(ctx) {
    ctx.strokeStyle='#b3caa1';
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(44,98);
    ctx.quadraticCurveTo(61,65,55,5);
    for (const [x,y,v] of [[11,24,42],[18,53,65],[29,76,83],[88,22,35],[94,49,57],[87,74,78]]) {
      ctx.moveTo(55,v);
      ctx.quadraticCurveTo(47+x*.17,y+8,x,y);
    }
    ctx.stroke();
  },
  pin_badge(ctx) {
    disc(ctx,'#ead7a9',50,49,43);
    polygon(ctx,'#3d536c',[[49,30],[72,23],[72,58],[64,60],[64,36],[57,38],[57,68],[49,71]]);
    disc(ctx,'#3d536c',44,68,12);
    disc(ctx,'#3d536c',60,59,11);
    polygon(ctx,'#ad644e',[[29,20],[34,29],[44,30],[35,36],[37,46],[29,40],[21,46],[23,36],[14,30],[24,29]]);
  },
  rad_badge(ctx) {
    fill(ctx,0,0,100,26,0x41637a);
    word(ctx,'DOSIMETER',50,14,17,'#e2e5da',94);
    fill(ctx,9,35,82,29,0x34413d);
    fill(ctx,15,40,70,19,0x71975e);
    fill(ctx,17,42,66,4,0x9fbb76);
    [0x71975e,0x6687a5,0xc7ad53,0xc37a46,0xa85b53].forEach((color,i)=>fill(ctx,10+i*17,71,13,8,color));
    word(ctx,'FILM TEST',50,90,13,'#365368',90);
  },
};

export function drawBadge(p,id) {
  const style=styles[id];
  const { contour, color, field, size, metal }=style;
  const plateOpts={ppm:840, metal};
  const casing=metal?steelP(style.overlay?shade(color,.69):color):plasticP(color);
  const enamel=style.jade
    ? speckle('jade flecks',field,[0x538367,0x84aa82,0x689779],.26)
    : plasticP(field);
  plate(p,'beveled badge body',contour,size,.002,.006,casing,plateOpts);
  if (style.overlay) plate(p,'raised silver star',style.overlay,size,.0057,.0075,steelP(color),plateOpts);
  if (style.hub) {
    const top=style.overlay?.0085:.0074;
    cyl(p,'raised enamel medallion','y',[0,top-.00065,0],style.hub*size,.0013,18,enamel,{ppm:900});
  } else {
    plate(p,'recessed face',contour,size*.875,.0059,.0071,enamel,{ppm:840});
  }

  if (style.crest) {
    const wings=[[-.35,-.399],[-.13,-.326],[-.016,-.349],[.084,-.464],[.144,-.407],
      [.112,-.326],[.351,-.399],[.265,-.269],[.065,-.209],[-.073,-.21],[-.278,-.27]];
    plate(p,'raised eagle crest',wings,size,.0069,.0083,steelP(shade(color,1.16)),plateOpts);
  }
  if (id === 'badge_deputy') {
    const stud=steelP(0xb1b4ad);
    for (let i=0;i<contour.length;i+=2) {
      const [x,v]=contour[i];
      cyl(p,'rounded star tip','y',[x*size*.91,.0059,-v*size*.91],size*.030,.0018,8,stud,plateOpts);
    }
  }

  if (style.film) {
    p.box('lapel clip slot',[-.012,.007,.024,.012,.0079,.0264],flat(0x344d60));
  }

  const [width,height,center] = style.panel.map(v=>v*size);
  const plane=style.overlay?.00868:style.hub?.00755:.00726;
  const near=-center-height*.5, far=-center+height*.5;
  const corners=[V(width*.5,plane,near),V(-width*.5,plane,near),V(-width*.5,plane,far),V(width*.5,plane,far)];
  poly(p,'original printed emblem',corners,V(0,1,0),(ctx,x,y,w,h)=>{
    ctx.translate(x,y);
    ctx.scale(w/100,h/100);
    art[id](ctx);
  },{cutout:true,ppm: style.film || id === 'badge_doctor' ? 1750 : 2100});

  const pin=steelP(metal?0x848887:0x777e7b);
  for (const x of [-.19,.19]) {
    p.box('back pin mount',[(x-.044)*size,0,-.032*size,(x+.044)*size,.0023,.032*size],pin,{ppm:740});
  }
  tube(p,'lapel pin',V(-size*.192,.00112,0),V(size*.192,.00112,0),.00074,.00074,7,pin,{ppm:740});
}
