import { V, bevel, clothP, cyl, fill, flat, hull, layers, pane, paperP, plasticP, shade, steelP, tube } from './item-kit.js';
import { poly } from './lowpoly.js';

export { V, bevel, clothP, cyl, fill, flat, hull, layers, pane, paperP, plasticP, shade, steelP, tube };
export { poly };

export const cement = steelP(0x9ca6a5);
export const rubber = plasticP(0x34383b);
export const glass = flat(0xb2cbc6);
export const GLASS = { glass: true };
export const warmPaper = paperP(0xceaf83);

const PALETTE = [0x52807e, 0x8a604d, 0x506987, 0x746887, 0x848b5c, 0x9a7250, 0x5f7176, 0xa1554e, 0x687c52, 0x466d64, 0xac8652];
export function identity(id) {
  let key = 2166136261;
  for (const letter of id) key = Math.imul(key ^ letter.charCodeAt(0), 16777619);
  return key >>> 0;
}
export const colorFor = (id) => shade(PALETTE[identity(id) % PALETTE.length], .92 + (identity(id) % 17) / 100);

export function top(p, name, [x0, z0, x1, z1], y, paint, opts = {}) {
  poly(p, name, [V(x0,y,z1), V(x1,y,z1), V(x1,y,z0), V(x0,y,z0)], V(0,1,0), paint, opts);
}
export function front(p, name, [x0, y0, x1, y1], z, paint, opts = {}) {
  poly(p, name, [V(x1,y0,z), V(x0,y0,z), V(x0,y1,z), V(x1,y1,z)], V(0,0,-1), paint, opts);
}

/** Low resolution label with a readable wordmark, one colour band and a product mark. */
export function label(color, name, key) {
  return (ctx, x, y, w, h) => {
    fill(ctx,x,y,w,h,color);
    fill(ctx,x,y+h*.72,w,h*.28,shade(color,.78));
    fill(ctx,x+w*.1,y+h*.17,w*.8,Math.max(1,h*.06),0xe5dec6);
    if (w < 9 || h < 9) return;
    const icon = key % 4;
    const size = Math.max(1, Math.round(Math.min(w,h)*.09));
    for (let i = 0; i < 4; i++) {
      const offset = (icon === 0 ? i : icon === 1 ? 3-i : icon === 2 ? (i&1) : 0) * size;
      fill(ctx, x+w*.17+i*size, y+h*.58-offset, size, size, 0xe2b875);
    }
    ctx.font = `bold ${Math.max(5,Math.floor(Math.min(h*.2,w/Math.min(name.length,10)*1.55)))}px monospace`;
    ctx.fillStyle = '#f0e7d5';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(name.toUpperCase().split(/\s+/).slice(0,2).join(' '), x+w*.1, y+h*.43, w*.8);
  };
}

export function outline(p, name, points, depth, paint, y = 0) {
  hull(p,name,points.flatMap(([x,z])=>[V(x,y,z), V(x,y+depth,z)]),paint);
}

export function ring(p, name, inner, outer, y, paint, at = [0,0], sides = 12) {
  for (let k=0;k<sides;k++) {
    const a=2*Math.PI*k/sides, b=2*Math.PI*(k+1)/sides;
    const q=(r,t)=>V(at[0]+Math.cos(t)*r,y,at[1]+Math.sin(t)*r);
    poly(p,`${name} ${k}`,[q(inner,a),q(outer,a),q(outer,b),q(inner,b)],V(0,1,0),paint);
  }
}

export function path(p, name, coords, r, paint, opts = {}) {
  coords.slice(1).forEach((b,k)=>tube(p,`${name} ${k}`,V(...coords[k]),V(...b),r,r,5,paint,opts));
}

export function lid(p, name, radius, bottom, height, paint) {
  cyl(p,name,'y',[0,bottom+height/2,0],radius,height,12,paint);
}

export function coil(p, name, r, wire, paint, turns = 1.5) {
  const points = Array.from({length:26},(_,k)=>{
    const t=k/25, a=t*Math.PI*2*turns, rr=r*(.45+.55*t);
    return [rr*Math.cos(a),wire+(k/25)*wire,rr*Math.sin(a)];
  });
  path(p,name,points,wire,paint);
}
