import { cyl, flat } from './item-kit.js';
import { identity } from './common-loot-kit.js';
import { READING_COLLECTION_DATA } from './reading-collection-data.js';
import { readingIllustration, rect } from './reading-collection-art.js';

const palettes = [
  ['#272f45', '#f8e8c8', '#e0a358', '#536681'],
  ['#4c293b', '#f4dec4', '#d89176', '#785064'],
  ['#233e38', '#f4e8c6', '#d9ad60', '#53786d'],
  ['#48332b', '#fff0d1', '#d28c43', '#926c55'],
  ['#273748', '#eaf2e2', '#79bbbc', '#4c7084'],
  ['#36334d', '#f8e8cf', '#c6a2c5', '#666186'],
  ['#6a332d', '#fce7be', '#e9ac7e', '#9c5e49'],
  ['#363d2c', '#f6ecd6', '#c9ac69', '#6b7151'],
  ['#24292d', '#f5e7ce', '#b09a73', '#595e5e'],
  ['#695044', '#fff2da', '#daba78', '#99816b'],
];
const olive = ['#444b36', '#fff1cf', '#d1ad62', '#666e50'];
const blueprint = ['#254568', '#e2eff0', '#aee0d6', '#477696'];
const laboratory = ['#234e55', '#eff3e0', '#aaca8d', '#438089'];
const paperFormats = new Set(['sheet','scrap','sticky','poster','report','roll','folder','blueprint','pamphlet','card']);
const dimensions = {
  sheet: [.258,.71], scrap: [.095,.65], sticky: [.076,.98], poster: [.36,.72],
  report: [.26,.73], roll: [.24,.26], folder: [.297,.77], blueprint: [.27,.74],
  pamphlet: [.21,.68], card: [.135,.72], scroll: [.48,.76],
};

function palette(item) {
  const { color, key, motif, format } = item;
  let colors = palettes[(key >>> 5) % palettes.length];
  if (format === 'blueprint') colors = blueprint;
  if (motif === 'field') colors = olive;
  if (motif === 'restricted') colors = ['#3f2c2e','#f5e8ce','#d98455','#77565b'];
  if (motif === 'lab' || motif === 'circuit') colors = laboratory;
  if (format === 'album') colors = ['#4d3a32','#edddbc','#b89461','#826755'];
  if (item.surface === 'photocopy') colors = ['#dedbd0','#343537','#575858','#aca99f'];
  if (motif === 'heart') colors = ['#e8c1ba','#5d2942','#a93b63','#f9e1cc'];
  return color ? ['#' + color, ...colors.slice(1)] : colors;
}

function canvas() {
  const sheet = document.createElement('canvas');
  sheet.width = 112;
  sheet.height = 152;
  return sheet;
}

function grain(ctx, item, w, h) {
  const { key, surface } = item;
  ctx.globalAlpha = surface ? .23 : .085;
  const inks = surface === 'grass' ? ['#c7bf78','#303725'] : ['#f6e7c6','#20191b'];
  rect(ctx, inks[0], 1, 1, w - 2, 1);
  for (let i = 0; i < 190; i++) {
    const x = (key + i * 313 + (i % 5) * 61) % w;
    const y = ((key >>> 12) + i * 223 + (i % 7) * 37) % h;
    const size = surface === 'grass' ? 9 + i % 9 : 1 + i % 3;
    rect(ctx, inks[i % 2], x, y, surface === 'grass' ? 1 : size, surface === 'grass' ? size : 1);
  }
  ctx.globalAlpha = 1;
}

function title(ctx, text, [x, y, w, h], ink, font, center = false) {
  let size = 22;
  let rows;
  for (; size >= 8; size--) {
    ctx.font = `bold ${size}px ${font}`;
    rows = [''];
    for (const word of text.split(/\s+/)) {
      const last = rows.length - 1;
      const next = rows[last] ? rows[last] + ' ' + word : word;
      if (rows[last] && ctx.measureText(next).width > w) rows.push(word);
      else rows[last] = next;
    }
    if (rows.length * (size + 1) <= h) break;
  }
  const maxLines = Math.max(1, Math.floor(h / (size + 1)));
  if (rows.length > maxLines) rows = [...rows.slice(0, maxLines - 1), rows.slice(maxLines - 1).join(' ')];
  ctx.fillStyle = ink;
  ctx.textAlign = center ? 'center' : 'left';
  rows.forEach((row, i) =>
    ctx.fillText(row, center ? x + w / 2 : x, y + i * (size + 1), w));
  ctx.textAlign = 'left';
}

function typeset(ctx, item, x, y, w, rows, ink, gap = 5) {
  for (let j = 0; j < rows; j++) {
    const length = .48 + (((item.key >>> (j * 3)) + j * 7) % 50) / 100;
    rect(ctx, ink, x, y + j * gap, Math.round(w * length), j % 5 === 0 ? 2 : 1);
  }
}

function art(ctx, item, colors, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(w / 64, h / 40);
  readingIllustration(ctx, item, colors);
  ctx.restore();
}

const coverLayouts = [
  { title: [12,16,88,51], art: [11,74,90,55], center: true, frame: true },
  { title: [10,94,92,47], art: [0,0,112,81], center: false, band: 82 },
  { title: [17,13,88,49], art: [15,73,89,61], center: false, spine: true },
  { title: [10,8,92,45], art: [0,65,112,70], center: false, inset: true },
  { title: [14,92,84,49], art: [20,11,72,62], center: true, frame: true },
  { title: [10,12,92,49], art: [9,68,94,59], center: false, band: 61 },
];

function coverImage(item, colors, back = false) {
  const sheet = canvas();
  const ctx = sheet.getContext('2d');
  const [base, ink, accent, mid] = colors;
  ctx.textBaseline = 'top';
  const bare = item.motif === 'blank';
  const background = bare ? '#39302b' : item.surface === 'cardboard' ? '#997c58' : base;
  const writing = item.surface === 'vellum' ? '#48382d' : ink;
  rect(ctx, background, 0, 0, 112, 152);
  grain(ctx, item, 112, 152);
  if (bare) return sheet;
  if (back) {
    if (item.format === 'album') {
      rect(ctx, accent, 14, 15, 84, 115);
      rect(ctx, '#ddc9ac', 16, 17, 80, 111);
      for (const [x, y] of [[24,27],[24,83],[60,56]]) {
        rect(ctx, '#f0e3c8', x, y, 29, 35);
        art(ctx, { ...item, motif: 'portrait' }, colors, x + 3, y + 3, 23, 24);
      }
      return sheet;
    }
    rect(ctx, mid, 12, 15, 88, 1);
    typeset(ctx, item, 13, 26, 82, 7, writing);
    art(ctx, item, colors, 14, 69, 52, 32);
    typeset(ctx, item, 70, 74, 29, 4, writing);
    rect(ctx, accent, 13, 120, 24, 4);
    rect(ctx, '#e9decc', 66, 118, 33, 16);
    for (let i = 0; i < 13; i++) rect(ctx, '#524a42', 69 + i * 2, 121, 1 + ((item.key >>> i) & 1), 10);
    return sheet;
  }
  if (item.motif === 'panic') {
    rect(ctx, '#a64a32', 7, 7, 98, 138);
    rect(ctx, '#433844', 10, 10, 92, 132);
    title(ctx, item.coverTitle, [11, 46, 90, 81], '#fff0ba', 'rounded, Arial', true);
    return sheet;
  }
  const layout = coverLayouts[(item.key >>> 10) % coverLayouts.length];
  if (layout.frame) {
    ctx.strokeStyle = accent;
    ctx.strokeRect(4.5, 4.5, 103, 143);
    for (const [x, y] of [[7,7],[99,7],[7,139],[99,139]]) rect(ctx, accent, x, y, 6, 6);
  }
  if (layout.band) rect(ctx, accent, 0, layout.band, 112, 3);
  if (layout.spine) rect(ctx, accent, 0, 0, 7, 152);
  if (layout.inset) rect(ctx, mid, 7, 6, 98, 48);
  art(ctx, item, colors, ...layout.art);
  const font = item.motif === 'frog' || item.format === 'notebook' ? 'cursive'
    : item.format === 'hardcover' || layout.center ? 'Georgia' : 'Arial';
  title(ctx, item.coverTitle ?? item.name, layout.title, writing, font, layout.center);
  if (item.motif === 'restricted') {
    rect(ctx, '#7a3029', 16, 134, 80, 11);
    title(ctx, 'RESTRICTED', [18, 136, 76, 10], '#fff0d2', 'monospace', true);
  } else {
    rect(ctx, accent, 13, 137, 17, 2);
    rect(ctx, mid, 33, 137, 15 + item.key % 27, 1);
  }
  return sheet;
}

function paperImage(item, colors, back) {
  const sheet = canvas();
  const ctx = sheet.getContext('2d');
  const { key, id, format, motif } = item;
  const graph = format === 'blueprint';
  const sealed = format === 'folder';
  const sticky = format === 'sticky';
  const poster = format === 'poster';
  const thermal = ['trace','weather'].includes(motif);
  const background = graph ? colors[0] : sticky ? colors[0] : sealed ? '#caae77' : format === 'card' ? '#eec5c3'
    : poster ? '#f2ead3' : thermal ? '#e6e8d7' : '#e8dcc2';
  const foreground = graph ? colors[1] : '#373b38';
  ctx.textBaseline = 'top';
  rect(ctx, background, 0, 0, 112, 152);
  grain(ctx, item, 112, 152);
  if (back && !['card','pamphlet','report','sheet'].includes(format)) return sheet;
  if (motif === 'scroll') {
    for (let c = 0; c < 3; c++) {
      for (let j = 0; j < 19; j++) {
        const row = Array.from({ length: 9 }, (_, k) => 'אבדהוזטיכלמנסעפצקרשת'[(key + c * 3 + j * 7 + k * 5) % 19]).join('');
        ctx.font = 'bold 5px serif';
        ctx.fillStyle = '#544136';
        ctx.fillText(row, 8 + c * 33, 17 + j * 6, 29);
      }
    }
    return sheet;
  }
  if (format === 'roll') {
    for (let i = 0; i < 12; i++) {
      rect(ctx, '#b6bbaa', 7 + i * 8, 4, 1, 144);
      typeset(ctx, item, 9 + i * 8, 12 + i % 3, 8, 17, foreground, 7);
    }
    return sheet;
  }
  if (sticky || format === 'scrap') {
    for (let j = 0; j < 5; j++) {
      const width = 37 + ((key >>> (j * 5)) % 38);
      ctx.save();
      ctx.translate(14, 39 + j * 13);
      ctx.rotate(((key >>> j) % 7 - 3) * Math.PI / 140);
      typeset(ctx, item, 0, 0, width, 2, foreground, 3);
      ctx.restore();
    }
    if (motif === 'crayon') art(ctx, item, ['#cec29f','#b65345','#688c6f','#d6bf8d'], 12, 15, 87, 104);
    return sheet;
  }
  if (format === 'card') {
    art(ctx, item, colors, 3, 23, 106, 85);
    title(ctx, back ? 'WITH LOVE' : 'BE MY VALENTINE', [10, 108, 92, 30], '#682a45', 'Georgia', true);
    return sheet;
  }
  if (poster) {
    title(ctx, id.startsWith('missing') ? 'MISSING' : 'COMING SOON', [5, 7, 102, 25], '#79392b', 'Arial', true);
    art(ctx, item, colors, 11, 36, 90, 68);
    typeset(ctx, item, 20, 115, 78, 4, foreground);
    return sheet;
  }

  const letterhead = motif === 'xedra' ? 'XEDRA' : id.startsWith('LIXA') ? 'LIXA'
    : id.startsWith('HEW') ? 'HEW / FIELD RECORD' : graph ? 'DESIGN ARCHIVE' : '';
  if (letterhead) {
    rect(ctx, graph ? colors[2] : '#445857', 7, 7, 98, 12);
    title(ctx, letterhead, [10, 8, 92, 10], graph ? colors[0] : '#f8f0da', 'monospace');
  }
  const headingY = letterhead ? 22 : 10;
  title(ctx, item.name, [9, headingY, 94, 55 - headingY], foreground, thermal ? 'monospace' : 'Arial');
  if (motif === 'check') {
    for (let i = 0; i < 9; i++) {
      ctx.strokeStyle = foreground;
      ctx.strokeRect(9, 52 + i * 9, 6, 6);
      if (i < 3) rect(ctx, '#aa5141', 11, 54 + i * 9, 3, 3);
      typeset(ctx, item, 22, 55 + i * 9, 74 - i % 4 * 5, 1, foreground);
    }
  } else {
    const isForm = motif === 'character';
    if (isForm) {
      ctx.strokeStyle = foreground;
      for (let i = 0; i < 9; i++) ctx.strokeRect(9 + i % 3 * 31, 53 + Math.floor(i / 3) * 18, 28, 15);
    } else {
      const artColors = graph ? colors : thermal ? ['#bfcdba','#313a36','#8b554a','#a8b8a8'] : colors;
      if (id === 'recipe_atomic_battery' && !back) {
        for (let i = 0; i < 8; i++) {
          ctx.font = 'bold 7px monospace';
          ctx.fillStyle = '#54534d';
          const glyphs = Array.from({ length: 15 }, (_, k) => '0&$X%|#F<>'[((key >>> (k * 3)) + i * 3 + k * 7) % 10]).join('');
          ctx.fillText(glyphs, 9, 58 + i * 5, 94);
        }
      } else {
        art(ctx, item, artColors, 9, 56, 94, 42);
      }
    }
    typeset(ctx, item, 9, 107, 43, 5, foreground);
    typeset(ctx, item, 59, 107, 42, 5, foreground);
  }
  if (motif === 'sign' || sealed) {
    ctx.fillStyle = '#9c523d';
    ctx.font = 'italic 8px Georgia';
    ctx.fillText(motif === 'sign' ? 'Agreed and signed' : 'FILE COPY', 62, 138, 42);
  }
  return sheet;
}

function paintFaces(item) {
  const colors = palette(item);
  const bespokePaper = paperFormats.has(item.format);
  const picture = bespokePaper ? paperImage : coverImage;
  const front = picture(item, colors, false);
  const back = picture(item, colors, true);
  const page = item.surface === 'vellum' ? '#d9c487' : '#ebe1c6';
  return {
    front, back, colors, page,
    edge(ctx, x, y, w, h, side) {
      const cloth = item.motif === 'blank' ? '#39302b' : colors[0];
      rect(ctx, cloth, x, y, w, h);
      if (side === 'left' && h >= 7 && !bespokePaper && item.motif !== 'blank') {
        rect(ctx, colors[2], x + w * .08, y, Math.max(1, w * .018), h);
        rect(ctx, colors[2], x + w * .9, y, Math.max(1, w * .018), h);
        title(ctx, item.coverTitle ?? item.name, [x + w * .13, y + h * .18, w * .74, h], colors[1], 'Arial', true);
      }
    },
  };
}

function layer(p, name, x, y, z, w, h, l, images) {
  p.box(name, [x - w/2,y,z - l/2,x + w/2,y + h,z + l/2], (ctx,u,v,width,height,side) => {
    if (side === 'top' && images.front) ctx.drawImage(images.front, u, v, width, height);
    else if (side === 'bottom' && images.back) ctx.drawImage(images.back, u, v, width, height);
    else if (images.edge) images.edge(ctx,u,v,width,height,side);
    else rect(ctx, images.page, u, v, width, height);
  });
}

function binding(p, item, w, h, l, images, center = 0, y = 0, depth = 0) {
  const { format, motif } = item;
  const hard = ['hardcover','binder','clasp','album','set'].includes(format);
  const board = Math.min(h * .22, hard ? .003 : .0012);
  const inset = hard ? Math.min(.003, w * .035) : .0005;
  const pageEdges = { page: images.page, edge(ctx,x,y,w,h) {
    rect(ctx, images.page, x, y, w, h);
    for (let j = 2; j < h; j += 3) rect(ctx, '#c6b999', x, y + j, w, 1);
  }};
  layer(p,'back cover',center,y,depth,w,board,l,{...images,front:null});
  layer(p,'page block',center,y + board,depth,w - inset * 2,h - 2 * board,l - inset * 2,pageEdges);
  layer(p,'front cover',center,y + h - board,depth,w,board,l,{...images,back:null});
  const width = Math.min(w * .076, format === 'binder' ? .016 : .009);
  layer(p,'spine',center - w/2 + width/2,y + board,depth,width,h - 2 * board,l, { edge(ctx,x,y,w,h,side) {
    if (side !== 'left') return rect(ctx, images.colors[0],x,y,w,h);
    images.edge(ctx,x,y,w,h,side);
  }});
  if (format === 'spiral') {
    for (let i = 0; i < 8; i++) {
      const z = depth + l * (-.42 + .12 * i);
      p.box('binding loop', [center-w/2, y+h*.5,z-.0015,center-w/2+width*1.35,y+h+.0015,z+.0015],flat(0x646467));
    }
  }
  if (format === 'clasp') {
    for (const z of [-.24*l,.23*l]) {
      const metal = motif === 'blank' ? 0x806d53 : 0x9e6c43;
      p.box('clasp', [center+w*.34,y+h*.39,depth+z-.008,center+w*.5,y+h+.002,depth+z+.008],flat(metal),{metal:true});
    }
  }
}

function readingObject(p, item) {
  const { format, volume, length } = item;
  const images = paintFaces(item);
  const paper = paperFormats.has(format);
  const [nominal, aspect] = dimensions[format] ?? [volume > 5000 ? .4 : volume > 1500 ? .255 : volume < 420 ? .177 : .208, .68];
  const l = length || (format === 'roll' ? Math.min(.43,.10 + Math.sqrt(volume) * .047) : nominal);
  const w = l * aspect;
  const h = volume / (1e6 * l * w);
  if (format === 'scroll') {
    const radius = Math.sqrt(volume / (1e6 * l * 2 * Math.PI));
    for (const x of [-radius * 1.16, radius * 1.16]) {
      cyl(p, 'parchment coil', 'z', [x,radius,0], radius, l * .81, 12, flat(0xd3bd91), {}, radius, 0);
      cyl(p, 'wooden roller', 'z', [x,radius,0], radius * .38, l, 8, flat(0x694a37));
    }
    layer(p, 'exposed parchment', 0, radius * 1.50, 0, radius * 2, .0015, l * .81, {
      front: paperImage({...item, format:'sheet'}, images.colors, false), page:images.page,
    });
  } else if (format === 'set') {
    // Show each set as a stack with separate boards and page blocks.
    for (let i = 0; i < 3; i++) binding(p,item,w,h/3,l,images,0,i*h/3);
  } else if (paper) {
    if (format === 'report') {
      layer(p,'offset bottom sheets',-.002,0,.002,w-.004,h*.40,l-.004,{page:images.page});
      layer(p,'middle sheets',.002,h*.4,-.002,w-.004,h*.35,l-.004,{page:'#d5c6a8'});
      layer(p,'report cover',0,h*.75,0,w,h*.25,l,images);
    } else {
      layer(p,'printed paper',0,0,0,w,h,l,images);
      if (format === 'folder') p.box('file tab',[w*.12,h*.4,-l*.51,w*.43,h,-l*.49],flat(0xcaae77));
      if (format === 'roll') cyl(p,'curled end','x',[0,h*.85,-l*.46],h*.85,w,8,flat(0xd8dccb),{},h*.85,0);
      if (format === 'pamphlet' || format === 'card') {
        layer(p,'folded edge',-w*.48,h*.81,0,w*.04,h*.23,l,{page:images.page});
      }
    }
  } else {
    binding(p,item,w,h,l,images);
  }
}

export const READING_COLLECTION = READING_COLLECTION_DATA.map(([
  id, name, zh, volume, mm, format, motif, color, surface, coverTitle,
]) => {
  const item = { id, name, volume, length: mm / 1000, format, motif, color, surface, coverTitle, key: identity(id) >>> 0 };
  return {
    id, names: { en: name, ...(zh && { zh_CN: zh }) }, group: 'items', ppm: 730,
    source: 'tools/cubeclysm/page/reading-collection.js',
    build: (p) => readingObject(p, item),
  };
});
