import { ShapeUtils, Vector2 } from 'three';
import { add } from './lowpoly.js';
import { V, fur, shade, skin } from './fauna-kit.js';

// [distance behind the peduncle, height relative to the peduncle].
const outlines = {
  fish_brook_trout: [[0,.19],[.43,.57],[.87,.75],[.99,.49],[.91,.09],[.90,-.32],[.96,-.64],[.67,-.64],[.25,-.36],[0,-.19]],
  fish_bullhead: [[0,.2],[.47,.48],[.80,.57],[.99,.39],[1.04,.08],[.98,-.28],[.79,-.52],[.49,-.51],[0,-.19]],
  fish_goldfish: [[0,.16],[.42,.55],[.94,.90],[1.07,.83],[.96,.48],[.72,.065],[.99,-.38],
    [1.04,-.68],[.86,-.69],[.45,-.49],[0,-.16]],
  fish_lbass: [[0,.19],[.43,.53],[.94,.67],[1.02,.49],[.88,.04],[1.00,-.56],[.73,-.58],[.31,-.37],[0,-.19]],
  fish_pike: [[0,.17],[.44,.52],[1,.77],[.92,.56],[.53,.05],[.94,-.57],[.96,-.72],[.63,-.56],[0,-.17]],
  fish_salmon: [[0,.18],[.44,.60],[.96,.79],[1,.60],[.68,.04],[.99,-.61],[.90,-.72],[.59,-.59],[0,-.18]],
  fish_whitefish: [[0,.15],[.43,.60],[1.05,.83],[.91,.56],[.47,.03],[.91,-.59],[.98,-.75],[.58,-.56],[0,-.16]],
  ocean_zhark: [[0,.16],[.19,.52],[.48,1.12],[.78,1.28],[.72,.84],[.47,.19],[.68,-.39],[.69,-.83],
    [.49,-.77],[.23,-.39],[0,-.14]],
  zhark: [[0,.18],[.25,.57],[.68,1.03],[.99,1.11],[.89,.79],[.53,.17],[.66,-.38],[.63,-.74],
    [.45,-.63],[.19,-.34],[0,-.18]],
};

export function fishTail(p, id, w, h, length, y, base, paint) {
  const shark=id==='ocean_zhark'||id==='zhark';
  const amber=id==='fish_goldfish';
  const rootZ=length*.716, rootY=y+.031;
  const reach=length*(amber?.61:shark?.52:.42);
  const radius=fur(shade(base,1.05),id+'-peduncle');
  skin(p,'attached-caudal-peduncle',[[.021,y+.024,length*.61,w*.30,h*.32],
    [.035,rootY,rootZ+.067,w*.203,h*.235],[.053,rootY+.012,rootZ+.164,w*.132,h*.158]],radius,8);

  const outline=outlines[id].map(([z,y])=>new Vector2(z,y));
  const plates = [1,-1].map(side=>outline.map(({x,y})=>V(
    .040 + .123*x + side*(.017-.010*x),rootY+h*y,rootZ+reach*x)));
  const faces=[];
  function push(points, out, side) {
    const [a,b,c,d=c]=points,n=b.clone().sub(a).cross(c.clone().sub(a));
    faces.push({p:n.dot(out)<0?[...points].reverse():points,side,
      wm:Math.max(.01,a.distanceTo(b),c.distanceTo(d)),
      hm:Math.max(.01,b.distanceTo(c),a.distanceTo(d))});
  }
  const tris=ShapeUtils.triangulateShape(outline,[]);
  for (const [index,points] of plates.entries()) {
    for (const [i,tri] of tris.entries()) push(tri.map(k=>points[k]),V(index?-1:1,0,0),'ray'+i);
  }
  const [right,left]=plates;
  for(let j=0;j<outline.length;j++){
    const k=(j+1)%outline.length, a=outline[j], b=outline[k];
    push([right[j],right[k],left[k],left[j]],V(0,b.x-a.x,a.y-b.y),'edge');
  }
  add(p,'continuous-caudal-fin', faces, paint);
}
