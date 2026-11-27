// Repaint the original prop faces before baking. The source recipes still own geometry and UVs.
import { identity } from './common-loot-kit.js';
import { paintCoverMotif } from './item-cover-motifs.js';
import { CLASSIC_JACKETS } from './classic-reading-data.js';
import { readingIllustration, rect } from './reading-collection-art.js';

const jackets = new Map(CLASSIC_JACKETS.map(([id, name, motif, options]) => [id, { id, name, motif, key: identity(id), ...options }]));
const colors = {
  night: ['#252732','#eedfbe','#c86453','#595b70'],
  red: ['#622f38','#f4e7be','#d49c54','#a7625c'],
  field: ['#3f5037','#efe4bd','#a6a470','#788866'],
  gray: ['#464b55','#f5eee3','#b36555','#777d83'],
  horror: ['#211e29','#f5d6bf','#bc4838','#654551'],
  yellow: ['#e9ad4e','#35252d','#a33643','#f2cc79'],
  sunset: ['#773c3e','#fff2cb','#ea9457','#b66352'],
  photocopy: ['#dedbd0','#292a2d','#6a646a','#b3aeb0'],
  rose: ['#7f425b','#fde4bf','#ec8d95','#b46a84'],
  folder: ['#8e7454','#fff0c6','#caac78','#5a5948'],
  violet: ['#3f345d','#f4e3c5','#b2a3d3','#696fa1'],
  ocean: ['#22505d','#f6e6c2','#cf904c','#548980'],
};
const editions = ['night','red','field','gray','sunset','rose','violet','ocean'];

function lettering(ctx, value, x, y, w, h, { color, family = 'Georgia', bold = true, max = 21, center = false }) {
  if (!value) return;
  let rows, size = max;
  for (; size >= 6; size--) {
    ctx.font = `${bold ? 'bold ' : ''}${size}px ${family}`;
    rows = [''];
    for (const word of value.split(/\s+/)) {
      const at = rows.length - 1;
      const next = rows[at] ? rows[at] + ' ' + word : word;
      if (rows[at] && ctx.measureText(next).width > w) rows.push(word);
      else rows[at] = next;
    }
    if (rows.length * (size + 1) <= h) break;
  }
  const maxRows = Math.max(1, Math.floor(h / (size + 1)));
  if (rows.length > maxRows) rows = [...rows.slice(0, maxRows - 1), rows.slice(maxRows - 1).join(' ')];
  ctx.fillStyle = color;
  ctx.textAlign = center ? 'center' : 'left';
  rows.forEach((row, i) => ctx.fillText(row, x + (center ? w / 2 : 0), y + i * (size + 1), w));
  ctx.textAlign = 'left';
}

function paperGrain(ctx, key, w, h, surface) {
  const density = surface === 'leather' ? 405 : surface === 'copier' || surface === 'faded' ? 240 : 135;
  ctx.globalAlpha = surface === 'copier' ? .26 : .14;
  for (let i = 0; i < density; i++) {
    const x = (key + i * 131 + (i % 7) * 61) % w;
    const y = ((key >>> 12) + i * 223 + (i % 11) * 43) % h;
    rect(ctx, i % 2 ? '#f4e7ca' : '#2d2229', x, y, i % 4 === 0 ? 3 : 1, 1);
  }
  ctx.globalAlpha = 1;
}

function polygon(ctx, color, points) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const [x, y] of points) ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
}

function illustration(ctx, item, palette) {
  const { motif, key } = item;
  const [base, ink, accent, mid] = palette;
  rect(ctx, base, 0, 0, 64, 40);
  if (motif === 'house') {
    rect(ctx, mid, 0, 22, 64, 18);
    polygon(ctx, base, [[0,35],[15,29],[29,31],[39,25],[64,31],[64,40],[0,40]]);
    polygon(ctx, ink, [[15,23],[32,10],[49,23],[45,23],[45,34],[19,34],[19,23]]);
    rect(ctx, mid, 21, 22, 22, 11);
    rect(ctx, accent, 26, 24, 4, 5);
    rect(ctx, base, 35, 26, 5, 8);
  } else if (motif === 'skull') {
    polygon(ctx, accent, [[20,6],[43,6],[47,12],[47,24],[40,27],[40,34],[24,34],[24,27],[17,24],[17,12]]);
    rect(ctx, base, 22, 15, 8, 7);
    rect(ctx, base, 34, 15, 8, 7);
    rect(ctx, base, 30, 24, 4, 3);
    for (const x of [27,31,35]) rect(ctx, base, x, 30, 1, 4);
  } else if (motif === 'diamond') {
    polygon(ctx, ink, [[12,14],[20,7],[44,7],[52,14],[32,34]]);
    polygon(ctx, mid, [[12,14],[52,14],[32,34],[22,15],[32,7],[44,15],[32,34]]);
    polygon(ctx, accent, [[27,14],[34,14],[31,23]]);
  } else if (motif === 'wire') {
    for (const y of [12, 26]) {
      rect(ctx, mid, 0, y, 64, 2);
      for (let x = 4; x < 64; x += 8) {
        polygon(ctx, ink, [[x-3,y-3],[x+3,y+3],[x+2,y+5],[x-4,y-2]]);
        rect(ctx, accent, x-1, y-1, 2, 3);
      }
    }
  } else if (motif === 'glove') {
    polygon(ctx, accent, [[15,12],[24,5],[42,5],[49,11],[48,21],[41,28],[38,37],[25,37],[23,27],[16,25],[12,20]]);
    rect(ctx, ink, 25, 27, 14, 2);
    rect(ctx, base, 28, 33, 8, 3);
    rect(ctx, mid, 23, 10, 16, 4);
  } else if (motif === 'hat') {
    polygon(ctx, accent, [[11,22],[21,26],[23,13],[29,10],[37,13],[43,10],[46,24],[55,20],[52,31],[33,34],[15,29]]);
    polygon(ctx, ink, [[23,22],[44,21],[44,25],[24,26]]);
  } else if (motif === 'ball') {
    polygon(ctx, ink, [[24,5],[39,5],[49,15],[49,25],[39,35],[24,35],[14,25],[14,15]]);
    polygon(ctx, base, [[32,12],[39,17],[36,26],[27,26],[24,17]]);
    polygon(ctx, base, [[14,15],[21,15],[23,23],[18,28],[14,25]]);
    polygon(ctx, base, [[49,15],[42,15],[40,23],[46,28],[49,25]]);
    polygon(ctx, mid, [[27,26],[36,26],[39,35],[24,35]]);
  } else if (motif === 'graphicMemoir') {
    rect(ctx, ink, 1, 1, 62, 38);
    rect(ctx, mid, 3, 3, 27, 34);
    rect(ctx, accent, 32, 3, 29, 17);
    rect(ctx, mid, 32, 22, 29, 15);
    polygon(ctx, base, [[6,32],[9,20],[11,14],[20,10],[25,18],[25,26],[27,32]]);
    polygon(ctx, ink, [[12,17],[22,16],[23,21],[19,27],[14,23]]);
    for (const [x,y,w,h] of [[35,11,5,8],[41,7,7,12],[50,11,7,8]]) rect(ctx,base,x,y,w,h);
    for (const x of [36,43,50]) rect(ctx,ink,x,27,5,1);
    rect(ctx,ink,38,31,17,1);
  } else if (motif === 'road') {
    rect(ctx, mid, 0, 0, 64, 23);
    polygon(ctx, base, [[0,26],[26,21],[35,20],[64,27],[64,40],[0,40]]);
    polygon(ctx, ink, [[29,22],[35,22],[53,40],[14,40]]);
    polygon(ctx, base, [[32,24],[34,27],[33,27],[31,24]]);
    rect(ctx, base, 32, 33, 2, 4);
  } else if (motif === 'salt') {
    paintCoverMotif(ctx, 'tide', palette, key);
    // Original silhouettes echo the couple on the in-game jacket.
    polygon(ctx, ink, [[23,12],[28,11],[33,14],[33,19],[38,23],[34,31],[22,30],[19,23],[24,18]]);
    polygon(ctx, accent, [[39,15],[45,15],[49,20],[46,24],[49,33],[37,33],[36,25],[40,22]]);
    rect(ctx, base, 38, 27, 9, 5);
  } else if (motif === 'fracture') {
    rect(ctx, mid, 0, 0, 64, 19);
    polygon(ctx, accent, [[0,26],[28,14],[29,25],[16,32],[28,40],[0,40]]);
    polygon(ctx, ink, [[38,15],[64,23],[64,40],[36,40],[27,33],[42,28]]);
  } else if (motif === 'paint') {
    polygon(ctx, accent, [[0,11],[16,8],[20,15],[39,14],[33,19],[49,26],[31,22],[17,36],[14,24],[0,28]]);
    polygon(ctx, '#a2473f', [[46,0],[53,12],[64,12],[64,23],[51,20],[57,37],[44,30],[45,19],[34,16]]);
    polygon(ctx, '#a99c88', [[0,33],[13,34],[19,40],[0,40]]);
    for (let i = 0; i < 22; i++) rect(ctx, i % 2 ? '#a2473f' : accent, (i * 29 + key) % 64, (i * 13) % 40, 1 + i % 3, 1);
  } else if (motif === 'comic' || motif === 'panels' || motif === 'satire') {
    rect(ctx, mid, 0, 0, 64, 40);
    for (const [x,y,w,h] of [[3,3,24,16],[30,3,31,16],[3,22,58,15]]) {
      rect(ctx, ink, x, y, w, h);
      rect(ctx, accent, x+1, y+1, w-2, h-2);
      polygon(ctx, base, [[x+5,y+h-3],[x+w*.55,y+3],[x+w-4,y+h-3]]);
    }
    rect(ctx, ink, 36, 6, 19, 6);
    rect(ctx, base, 39, 8, 12, 1);
  } else if (motif === 'armor') {
    polygon(ctx, mid, [[11,40],[16,30],[24,25],[18,22],[18,11],[25,6],[40,6],[48,13],[48,22],[42,26],[49,30],[54,40]]);
    polygon(ctx, ink, [[21,11],[27,7],[40,7],[46,14],[46,23],[39,28],[26,25],[21,21]]);
    rect(ctx, base, 24, 15, 19, 3);
    rect(ctx, accent, 26, 25, 14, 2);
  } else if (motif === 'award') {
    const points = Array.from({length:10},(_,i) => {
      const angle = i*Math.PI/5-Math.PI/2;
      const radius = i%2 ? 8 : 17;
      return [32+radius*Math.cos(angle),19+radius*Math.sin(angle)];
    });
    polygon(ctx,accent,points);
  } else if (motif === 'stage') {
    rect(ctx, mid, 7, 3, 50, 34);
    polygon(ctx, accent, [[13,4],[28,4],[24,16],[17,30],[9,33],[9,12]]);
    polygon(ctx, accent, [[51,4],[36,4],[40,16],[47,30],[55,33],[55,12]]);
    polygon(ctx, ink, [[24,13],[40,13],[43,20],[37,33],[27,33],[21,20]]);
    rect(ctx, base, 25, 21, 14, 3);
  } else if (['news','directory','label','tabs'].includes(motif)) {
    rect(ctx, ink, 5, 2, 54, 36);
    rect(ctx, mid, 9, 6, 46, 5);
    for (const x of [9,34]) for (let i = 0; i < 6; i++) rect(ctx, base, x, 15 + i * 3, 12 + (i * 3 + key) % 8, 1);
  } else {
    const alias = { ruins:'city', tale:'fantasy', swordCity:'samurai', night:'mystery', craft:'local', laurel:'handbook' };
    const art = alias[motif] ?? motif;
    if (!paintCoverMotif(ctx, art, palette, key)) readingIllustration(ctx, { ...item, motif: art }, palette);
  }
}

function jacketImage(item, palette, back) {
  const sheet = document.createElement('canvas');
  sheet.width = 120;
  sheet.height = 160;
  const ctx = sheet.getContext('2d');
  const [base, ink, accent, mid] = palette;
  const W = sheet.width;
  const H = sheet.height;
  const glossy = item.surface === 'gloss' || /^(mag_|.*zine)/.test(item.id);
  const bound = item.surface === 'leather' || /hard_|^holybook|classic_literature|plays_book|poetry_book|collector_book/.test(item.id);
  ctx.textBaseline = 'top';
  rect(ctx, base, 0, 0, W, H);
  paperGrain(ctx, item.key, W, H, item.surface);

  const panel = (x, y, w, h, motif = item.motif) => {
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(w/64,h/40);
    illustration(ctx,{ ...item, motif },palette);
    ctx.restore();
  };
  if (item.motif === 'paint') {
    panel(0,0,W,H);
    paperGrain(ctx, item.key, W, H, 'leather');
  } else if (back && item.back === 'copy') {
    rect(ctx, ink, 8, 11, W-16, H-22);
    lettering(ctx,item.text,14,18,W-28,H-37,{color:base,max:12,bold:false});
  } else if (back && item.back === 'family') {
    for (const [y, phase] of [[11,'EARLY YEARS'],[83,'BACK IN THE KITCHEN']]) {
      rect(ctx, ink, 14, y, 92, 64);
      rect(ctx, mid, 19, y+5, 82, 44);
      for (const x of [24,50,76]) {
        rect(ctx, '#d8aa85', x, y+7, 20, 12);
        rect(ctx, base, x+9, y+12, 2, 5);
      }
      rect(ctx, accent, 21, y+38, 78, 9);
      for (const [x, height, shirt] of [[30,25,base],[52,y < 20 ? 14 : 25,accent],[75,27,'#675a50']]) {
        const top = y + 39 - height;
        polygon(ctx, shirt, [[x-1,y+41],[x+1,top+12],[x+11,top+12],[x+16,y+41]]);
        rect(ctx, '#ba8869', x+3, top+5, 8, 9);
        rect(ctx, '#51413d', x+2, top+2, 10, 5);
      }
      lettering(ctx,phase,20,y+50,81,12,{color:base,max:8,family:'Arial',center:true});
    }
  } else if (back) {
    panel(10,14,42,30);
    for (let k = 0; k < 14; k++) {
      const x = k < 6 ? 59 : 11;
      const y = k < 6 ? 15 + k * 5 : 53 + (k-6)*7;
      rect(ctx, ink, x, y, (W - x - 12) * (.62 + ((item.key >>> (k*3)) % 30)/100), 1);
    }
    rect(ctx, '#e5d9bc', 73, 127, 36, 18);
    for (let i=0; i<13; i++) rect(ctx,'#49403b',76+i*2,129,1+((item.key>>>i)&1),12);
  } else {
    const artAbove = !glossy && !bound && (item.key & 1);
    if (bound) {
      ctx.strokeStyle=accent;
      ctx.strokeRect(5.5,5.5,W-11,H-11);
      ctx.strokeRect(8.5,8.5,W-17,H-17);
    }
    if (glossy) {
      rect(ctx, accent, 0, 0, W, 7);
      rect(ctx, accent, 0, H-10, W, 10);
      rect(ctx, mid, W-12, 7, 12, H-17);
    }
    panel(bound?12:7,artAbove?10:67,bound?96:106,artAbove?87:63);
    lettering(ctx,item.title ?? item.name,11,artAbove?101:14,98,artAbove?38:46,{color:ink,family:glossy?'Arial':'Georgia',center:bound});
    if (item.credit) lettering(ctx,item.credit,10,artAbove?92:54,100,13,{color:ink,max:9,center:true,family:'Arial'});
    if (item.band) {
      rect(ctx, accent, 0, 137, W, 12);
      lettering(ctx,item.band,4,139,112,10,{color:base,max:8,center:true,family:'Arial'});
    } else {
      rect(ctx, accent, 11, 143, 28, 2);
      rect(ctx, mid, 43, 144, 18 + item.key % 31, 1);
    }
    if (item.surface === 'copier') {
      for (let y = 18; y < 150; y += 16) {
        rect(ctx, '#373638', 4, y, 4, 4);
        rect(ctx, '#777477', 0, y+1, 6, 2);
      }
    }
    if (item.surface === 'copier' || item.surface === 'faded') paperGrain(ctx, item.key, W, H, item.surface);
  }
  return sheet;
}

const newspaperStories = new Map([
  ['newspaper_memorial',['IN MEMORIAM','A LIFE REMEMBERED','portrait']],
  ['newest_newspaper',['EVENING EDITION','EVACUATION ALERT','city']],
  ['weeks_old_newspaper',['THE DAILY RECORD','SURGEON GENERAL: DEAD ARE STAYING DEAD','medical']],
  ['months_old_newspaper',['THE DAILY RECORD','EVACS UNSTOCKED: TRUTH OR FICTION?','archive']],
  ['one_year_old_newspaper',['REGIONAL WEEKLY','READY FOR THE WORST','local']],
  ['years_old_newspaper',['MORNING NEWS','GOVERNMENT SCIENCE BOOST','city']],
  ['many_years_old_newspaper',['THE CHRONICLE','ATOMIC DEREGULATION','archive']],
]);

function frontPage(id, story) {
  const [masthead, headline, motif] = story;
  const paper = document.createElement('canvas');
  paper.width = 150;
  paper.height = 180;
  const ctx = paper.getContext('2d');
  const key = identity(id);
  const aged = /years_old|one_year/.test(id);
  const stock = aged ? '#c5b38f' : '#ede0c3';
  const ink = '#373b37';
  const x = 9;
  ctx.textBaseline = 'top';
  rect(ctx,stock,0,0,150,180);
  paperGrain(ctx,key,150,180,'copier');
  lettering(ctx,masthead,x,8,132,23,{color:ink,center:true,max:18});
  rect(ctx,ink,x,33,132,2);
  lettering(ctx,headline,x,40,132,27,{color:ink,max:16,center:true});
  ctx.save();
  ctx.translate(x,70);
  ctx.scale(1.25,1.32);
  illustration(ctx,{id,key,motif},['#7b796a','#c8bea2','#a19984','#aca692']);
  ctx.restore();
  for (const col of [9,54,99]) for (let i=0; i<15; i++) {
    const y = 70 + i*6;
    if (col < 99 && y < 129) continue;
    rect(ctx,ink,col,y,35-((key>>>(i*3))%13),1);
  }
  return paper;
}

function survivorNote() {
  const sheet = document.createElement('canvas');
  sheet.width=100;
  sheet.height=70;
  const ctx=sheet.getContext('2d');
  rect(ctx,'#d7c9a8',0,0,100,70);
  paperGrain(ctx,1538,100,70,'copier');
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(7+i*3,15+i*13);
    ctx.rotate(i%2 ? .11 : -.085);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#51463e';
    for (let j = 0; j < 7 - i % 3; j++) {
      const x = j * 11;
      ctx.beginPath();
      ctx.moveTo(x,0);
      ctx.lineTo(x+2,(i+j)%2 ? -4 : -1);
      ctx.lineTo(x+4,2);
      ctx.lineTo(x+6,-2);
      ctx.lineTo(x+9,1);
      ctx.stroke();
    }
    ctx.restore();
  }
  return sheet;
}

function imageOnFace(block, image, face, turn = false, edge) {
  const old = block.paint;
  block.paint = (ctx,x,y,w,h,side) => {
    if (side !== face) return edge ? rect(ctx,edge,x,y,w,h) : old(ctx,x,y,w,h,side);
    if (turn) {
      ctx.translate(x,y+h);
      ctx.rotate(-Math.PI/2);
      ctx.drawImage(image,0,0,h,w);
    } else ctx.drawImage(image,x,y,w,h);
  };
}

export function repaintClassicReading(prop) {
  const {id,blocks} = prop;
  const item = jackets.get(id);
  const block = (name) => {
    const found = blocks.find((part) => part.name === name);
    if (!found) throw new Error(`${id}: missing reading face ${name}`);
    return found;
  };
  if (item) {
    const palette = colors[item.palette ?? editions[(item.key >>> 6) % editions.length]];
    imageOnFace(block('front'),jacketImage(item,palette,false),'front',true,palette[0]);
    imageOnFace(block('back'),jacketImage(item,palette,true),'front',true,palette[0]);
    const spine = block('spine');
    spine.paint = (ctx,x,y,w,h,side) => {
      rect(ctx,palette[0],x,y,w,h);
      if (side === 'back' && h >= 5) {
        rect(ctx,palette[2],x+3,y,1,h);
        rect(ctx,palette[2],x+w-4,y,1,h);
        ctx.textBaseline='middle';
        ctx.font=`bold ${Math.min(11,h-1)}px Arial`;
        ctx.fillStyle=palette[1];
        ctx.fillText(item.title ?? item.name,x+6,y+h/2,Math.max(1,w-12));
      }
    };
  } else if (newspaperStories.has(id)) {
    imageOnFace(block('front page'),frontPage(id,newspaperStories.get(id)),'front');
  } else if (id === 'survnote') {
    imageOnFace(block('handwritten lines'),survivorNote(),'poly');
  }
}
