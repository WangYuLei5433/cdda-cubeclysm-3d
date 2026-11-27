// Illustrations are drawn at a fixed pixel resolution, then packed by atlas.js.
import { paintCoverMotif } from './item-cover-motifs.js';

export function rect(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function dot(ctx, color, x, y, radius) {
  for (let j = -radius; j <= radius; j++) {
    const dx = Math.floor(Math.sqrt(radius * radius - j * j));
    rect(ctx, color, x - dx, y + j, 2 * dx + 1, 1);
  }
}

function poly(ctx, color, points) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const [x, y] of points) ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, color, points, weight = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = weight;
  ctx.beginPath();
  for (const [x, y] of points) ctx.lineTo(x, y);
  ctx.stroke();
}

function rosette(ctx, count, ink, accent, background, radius = 18) {
  const points = [];
  for (let i = 0; i < count * 2; i++) {
    const angle = i * Math.PI / count - Math.PI / 2;
    const r = i % 2 ? radius * .65 : radius;
    points.push([32 + r * Math.cos(angle), 20 + r * Math.sin(angle)]);
  }
  poly(ctx, ink, points);
  dot(ctx, background, 32, 20, 9);
  dot(ctx, accent, 32, 20, 4);
}

function figure(ctx, x, pose, ink) {
  dot(ctx, ink, x + pose[0][0], 9 + pose[0][1], 4);
  const points = pose.map(([u, v]) => [x + u, 15 + v]);
  line(ctx, ink, [points[0], points[1], points[2]], 5);
  line(ctx, ink, [points[3], points[0], points[4]], 3);
  line(ctx, ink, [points[5], points[2], points[6]], 4);
}

const poses = {
  grapple: [[3,0],[0,5],[-3,11],[11,3],[13,9],[-13,19],[5,22]],
  strike: [[0,0],[-1,5],[-4,10],[-10,5],[16,0],[-13,20],[7,19]],
  staff: [[1,0],[0,5],[-2,11],[-8,5],[11,8],[-14,21],[12,18]],
  sword: [[0,0],[1,5],[0,11],[-5,4],[10,3],[-11,21],[9,20]],
  dance: [[2,9],[0,13],[-7,16],[-12,20],[12,5],[-18,20],[8,-4]],
};

const legacyArt = {
  radio: 'broadcast', map: 'map', city: 'city', portrait: 'portrait',
  photo: 'photo', circuit: 'circuit', occult: 'occult', flame: 'flame', archive: 'handbook',
  lab: 'lab', mystery: 'mystery', movie: 'comicsInk',
  flight: 'broadcast', paper: 'poetry', field: 'archery',
};

/** Paint a 64×40 cover illustration. Technical marks are decorative, without dimensions. */
export function readingIllustration(ctx, item, colors) {
  const { motif, key, id } = item;
  const [base, ink, accent, mid] = colors;
  const r = (offset, length) => (key >>> offset) % length;
  rect(ctx, base, 0, 0, 64, 40);
  if (motif in poses) {
    rect(ctx, mid, 0, 29, 64, 11);
    dot(ctx, accent, 43, 17, 13);
    figure(ctx, 27, poses[motif], ink);
    if (motif === 'grapple') {
      ctx.save();
      ctx.translate(64, 3);
      ctx.scale(-1, 1);
      figure(ctx, 18, poses.grapple, accent);
      ctx.restore();
    } else if (motif === 'staff' || motif === 'sword') {
      line(ctx, accent, motif === 'staff' ? [[12, 33], [53, 8]] : [[34, 22], [56, 3]], 3);
    }
    return;
  }
  if (legacyArt[motif] && paintCoverMotif(ctx, legacyArt[motif], colors, key)) return;
  switch (motif) {
    case 'cross':
      poly(ctx, mid, [[15,38],[15,14],[22,7],[32,2],[42,7],[49,14],[49,38]]);
      rect(ctx, ink, 29, 6, 6, 28);
      rect(ctx, ink, 21, 14, 22, 5);
      rect(ctx, accent, 23, 35, 18, 2);
      break;
    case 'star':
      for (const sign of [-1, 1]) line(ctx, ink, [[32,20+sign*16],[17,20-sign*8],[47,20-sign*8],[32,20+sign*16]], 2);
      break;
    case 'ninefold':
    case 'arabesque':
    case 'occult':
      rosette(ctx, { ninefold: 9, arabesque: 8, occult: 5 }[motif], ink, accent, base);
      break;
    case 'lotus':
      poly(ctx, accent, [[32,3],[41,17],[32,34],[23,17]]);
      poly(ctx, ink, [[6,14],[23,18],[32,34],[41,18],[58,14],[52,26],[41,34],[23,34],[12,26]]);
      break;
    case 'knot':
    case 'woven':
    case 'parchment':
      for (let j = 0; j < 4; j++) {
        const x = 8 + j * 12;
        line(ctx, j % 2 ? ink : accent, [[x,33],[x+11,20],[x,7],[x-5,20],[x+11,33]], 3);
      }
      line(ctx, mid, [[3,5],[61,5]], 2);
      line(ctx, mid, [[3,35],[61,35]], 2);
      break;
    case 'bamboo':
    case 'tablet':
      rect(ctx, accent, 13, 3, 38, 34);
      for (let j = 0; j < 6; j++) {
        if (motif === 'bamboo') rect(ctx, base, 14 + j * 6, 4, 1, 32);
        for (let i = 0; i < 4; i++) {
          const x = 16 + j * 6, y = 8 + i * 7;
          line(ctx, base, [[x,y],[x+3,y+1],[x+1,y+3]], 1);
        }
      }
      break;
    case 'mountains':
    case 'sun':
    case 'moon':
    case 'pyramid':
    case 'stele':
    case 'temple':
    case 'wave': {
      rect(ctx, mid, 0, 0, 64, 40);
      const x = 18 + r(5, 29);
      dot(ctx, accent, x, 12, 8);
      if (motif === 'moon') dot(ctx, mid, x + 5, 9, 7);
      if (motif === 'wave') {
        poly(ctx, base, [[0,40],[0,30],[10,26],[19,28],[31,15],[40,14],[46,20],[43,23],[39,19],[34,24],[54,32],[64,27],[64,40]]);
        line(ctx, ink, [[1,34],[17,33],[29,24],[36,24],[48,33],[62,33]]);
      } else if (motif === 'stele' || motif === 'temple' || motif === 'pyramid') {
        const steps = motif === 'pyramid' ? 5 : 4;
        for (let i = 0; i < steps; i++) {
          rect(ctx, i % 2 ? base : ink, 4 + i * 5, 34 - i * 5, 56 - i * 10, 5);
        }
        if (motif === 'temple') rect(ctx, accent, 26, 12, 12, 12);
        if (motif === 'stele') rect(ctx, base, 27, 6, 10, 15);
      } else {
        poly(ctx, base, [[0,35],[12,22],[19,30],[34,16],[49,30],[54,25],[64,34],[64,40],[0,40]]);
        poly(ctx, ink, [[26,23],[34,16],[43,25],[35,22],[32,25]]);
      }
      break;
    }
    case 'frog':
      dot(ctx, mid, 32, 26, 12);
      dot(ctx, accent, 23, 13, 7);
      dot(ctx, accent, 41, 13, 7);
      dot(ctx, ink, 23, 13, 3);
      dot(ctx, ink, 41, 13, 3);
      line(ctx, ink, [[18,25],[24,29],[39,29],[46,25]]);
      break;
    case 'crane':
      poly(ctx, ink, [[7,6],[28,20],[41,16],[46,7],[55,8],[61,13],[50,12],[44,25],[32,31],[20,28]]);
      line(ctx, accent, [[30,28],[24,37],[12,37]]);
      break;
    case 'dragon':
    case 'snake':
    case 'spiral':
    case 'pasta': {
      const paths = [[8,25],[18,30],[29,25],[29,13],[43,8],[53,16],[49,27],[39,29],[36,22],[42,17]];
      line(ctx, accent, paths, motif === 'dragon' ? 6 : 4);
      line(ctx, ink, paths.slice(2, 8), 1);
      if (motif === 'dragon' || motif === 'snake' || motif === 'pasta') dot(ctx, ink, 42, 16, 2);
      break;
    }
    case 'claw':
      for (const x of [19, 28, 37]) poly(ctx, ink, [[x,36],[x+6,9],[x+11,3],[x+8,23]]);
      break;
    case 'heart':
      dot(ctx, accent, 23, 14, 10);
      dot(ctx, accent, 41, 14, 10);
      poly(ctx, accent, [[14,17],[50,17],[32,36]]);
      rect(ctx, ink, 21, 9, 4, 3);
      break;
    case 'plants':
    case 'fungus':
      for (const [x, y] of [[15,24],[32,12],[48,21]]) {
        line(ctx, ink, [[32,37],[x, y]], 2);
        if (motif === 'fungus') {
          dot(ctx, accent, x, y - 4, 8);
          rect(ctx, base, x - 9, y - 2, 18, 4);
        } else {
          poly(ctx, accent, [[x-9,y-4],[x,y-9],[x+5,y-6],[x+5,y+2],[x,y+7]]);
        }
      }
      break;
    case 'bug':
      for (const sign of [-1, 1]) {
        for (let i = 0; i < 3; i++) line(ctx, ink, [[32,15+i*5],[32+sign*12,9+i*9],[32+sign*18,8+i*11]]);
      }
      dot(ctx, accent, 32, 16, 6);
      dot(ctx, accent, 32, 25, 9);
      line(ctx, base, [[32,20],[32,34]]);
      break;
    case 'tea':
    case 'table':
    case 'cake':
      dot(ctx, mid, 32, 21, 18);
      if (motif === 'tea') {
        rect(ctx, ink, 21, 12, 22, 20);
        rect(ctx, accent, 24, 17, 16, 12);
        rect(ctx, ink, 23, 8, 18, 4);
      } else if (motif === 'cake') {
        rect(ctx, accent, 17, 19, 30, 10);
        rect(ctx, ink, 17, 18, 30, 3);
        for (const x of [24, 32, 40]) rect(ctx, ink, x, 12, 2, 7);
      } else {
        dot(ctx, ink, 32, 20, 13);
        dot(ctx, accent, 32, 20, 9);
        for (const [x,y] of [[29,15],[36,17],[33,23],[27,23]]) dot(ctx, mid, x, y, 2);
      }
      break;
    case 'cat':
    case 'dog': {
      const cat = motif === 'cat';
      dot(ctx, accent, 32, 23, 13);
      for (const x of [22, 42]) poly(ctx, accent, [[x-6, cat?5:23],[x-4,cat?2:9],[x+4,cat?13:10],[x+7,23]]);
      for (const x of [27,37]) dot(ctx, base, x, 21, 2);
      dot(ctx, base, 32, 27, 2);
      break;
    }
    case 'lock':
      line(ctx, ink, [[22,20],[22,8],[26,4],[38,4],[42,8],[42,20]], 4);
      rect(ctx, accent, 19, 18, 26, 17);
      dot(ctx, base, 32, 24, 3);
      rect(ctx, base, 31, 25, 2, 5);
      break;
    case 'hood':
    case 'suit':
      poly(ctx, accent, motif === 'hood'
        ? [[20,35],[19,11],[27,5],[41,5],[49,18],[44,31],[46,35]]
        : [[20,5],[44,5],[53,15],[49,23],[43,19],[43,37],[33,37],[32,24],[31,37],[21,37],[21,19],[15,23],[11,15]]);
      line(ctx, ink, [[27,9],[38,9],[43,17],[37,22],[27,21],[24,15],[27,9]]);
      break;
    case 'robot':
      rect(ctx, accent, 21, 12, 22, 16);
      rect(ctx, ink, 24, 15, 15, 7);
      for (const x of [26,34]) dot(ctx, base, x, 18, 2);
      if (/skitter|dispatch/.test(id)) {
        for (const x of [18,26,35,43]) line(ctx, ink, [[32,25],[x,26],[x-3,35]]);
      } else if (/searchlight/.test(id)) {
        dot(ctx, ink, 42, 14, 6);
        line(ctx, ink, [[47,12],[59,7],[59,22],[47,17]]);
      } else {
        for (const x of [23,40]) dot(ctx, ink, x, 30, 5);
      }
      break;
    case 'bike':
      for (const x of [15,49]) {
        dot(ctx, ink, x, 27, 9);
        dot(ctx, base, x, 27, 7);
      }
      line(ctx, accent, [[15,27],[24,13],[34,27],[15,27],[26,14],[42,14],[49,27],[41,8],[47,8]], 2);
      break;
    case 'court':
      rect(ctx, mid, 5, 6, 54, 29);
      line(ctx, ink, [[7,8],[57,8],[57,33],[7,33],[7,8]]);
      line(ctx, ink, [[32,8],[32,33]]);
      dot(ctx, accent, 42, 17, 6);
      break;
    case 'crayon':
      line(ctx, accent, [[6,23],[15,10],[24,21],[24,34],[8,35],[6,23],[24,22]], 3);
      dot(ctx, ink, 42, 15, 4);
      line(ctx, ink, [[42,20],[42,29],[37,34],[42,28],[47,35],[42,25],[49,22]], 2);
      break;
    case 'shelter':
    case 'farm':
      poly(ctx, accent, [[9,18],[32,5],[55,18],[51,18],[51,35],[13,35],[13,18]]);
      rect(ctx, base, 26, 21, 13, 14);
      line(ctx, ink, [[22,14],[32,8],[43,14]]);
      break;
    case 'orbit':
      dot(ctx, mid, 37, 19, 14);
      dot(ctx, accent, 37, 17, 10);
      line(ctx, ink, [[8,30],[14,25],[50,13],[59,13],[57,17],[20,31],[8,30]]);
      for (let i = 0; i < 7; i++) rect(ctx, ink, (i*19+key)%61, (i*11+4)%39, 1, 1);
      break;
    case 'stitch':
      for (let x = 0; x < 8; x++) for (let y = 0; y < 5; y++) {
        rect(ctx, (x+y)%2 ? mid : accent, x*8, y*8, 8, 8);
      }
      line(ctx, ink, [[14,31],[42,7],[47,5],[43,10],[15,33]], 2);
      break;
    case 'xedra':
    case 'labdoc':
      rect(ctx, mid, 4, 3, 56, 34);
      rect(ctx, base, 6, 5, 52, 30);
      for (let j = 0; j < 3; j++) {
        rect(ctx, accent, 10, 10+j*7, 7+r(j*4,10), 3);
        rect(ctx, ink, 35, 10+j*7, 9+r(j*3,8), 1);
      }
      dot(ctx, ink, 28, 20, 7);
      dot(ctx, base, 28, 20, 5);
      break;
    case 'trace':
    case 'chart':
    case 'weather':
    case 'diagram':
    case 'restricted':
    case 'restrictedDoc':
    case 'medical':
    case 'medicalDoc':
    case 'character':
    case 'tools':
    case 'focus':
    case 'code':
    case 'fracture': {
      for (let i = 0; i < 8; i++) rect(ctx, mid, i * 8, 0, 1, 40);
      for (let i = 0; i < 5; i++) rect(ctx, mid, 0, i * 8, 64, 1);
      if (motif.startsWith('medical')) {
        rect(ctx, accent, 26, 6, 12, 28);
        rect(ctx, accent, 18, 14, 28, 12);
      } else if (motif.startsWith('restricted')) {
        poly(ctx, accent, [[32,3],[54,35],[10,35]]);
        rect(ctx, base, 30, 13, 4, 11);
        rect(ctx, base, 30, 27, 4, 4);
      } else if (motif === 'tools') {
        line(ctx, ink, [[15,31],[42,12],[40,7],[45,5],[51,12],[48,17],[42,16]], 5);
        line(ctx, accent, [[14,8],[44,34]], 4);
      } else if (motif === 'focus') {
        rosette(ctx, 4, ink, accent, base, 16);
      } else {
        const points = Array.from({ length: 9 }, (_, i) => [i * 8, 8 + ((key >>> (i * 3)) + i * 13) % 26]);
        line(ctx, accent, points, 2);
        if (motif === 'weather' || motif === 'chart') points.slice(1, 8).forEach(([x,y]) => dot(ctx, ink, x, y, 2));
      }
      break;
    }
    default:
      for (let i = 0; i < 6; i++) rect(ctx, i % 2 ? accent : ink, 8, 6 + i * 5, 20 + r(i * 3, 32), 2);
  }
}
