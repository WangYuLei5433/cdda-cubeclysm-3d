import { book } from './item-kit.js';
import { paintCoverMotif } from './item-cover-motifs.js';

const designs={
  reference: { palette:['#233d56','#f1ecd9','#dda552','#527b94'], label:'REFERENCE', art:'diagram' },
  repair: { palette:['#75613c','#faf0d1','#db963d','#454c40'], label:'WORKSHOP', art:'tools' },
  food: { palette:['#e2d0a5','#44342d','#a44e34','#698664'], label:'COOKERY', art:'table' },
  field: { palette:['#334d42','#f1e5b8','#dda169','#73947b'], label:'FIELD GUIDE', art:'mountains' },
  literature: { palette:['#523c48','#f4e9d2','#c7776a','#ae9c87'], label:'FICTION', art:'horizon' },
  scienceFiction: { palette:['#212d48','#ede6d8','#c97d55','#779da6'], label:'SCIENCE FICTION', art:'orbit' },
  history: { palette:['#af7649','#fff3d5','#573633','#d4a36a'], label:'NONFICTION', art:'archive' },
  spiritual: { palette:['#473a42','#f0dbad','#be9c64','#776447'], label:'SELECTED TEXTS', art:'ornament' },
  visual: { palette:['#653747','#fff0be','#cb785b','#935e77'], label:'ILLUSTRATED', art:'print' },
  sports: { palette:['#385542','#f1e9bd','#d19b58','#66876e'], label:'TRAINING', art:'court' },
  medicine: { palette:['#345461','#f3edd6','#c56260','#73989a'], label:'HEALTH', art:'medicine' },
  craft: { palette:['#643f56','#f3e1bc','#cb8272','#916787'], label:'MADE BY HAND', art:'stitch' },
  desert: { palette:['#783e36','#f8dc9e','#d99852','#8d543c'], label:'DESERT FICTION', art:'desert' },
  sea: { palette:['#18384b','#efdfb9','#70a4ab','#53788b'], label:'SEA ADVENTURE', art:'tide' },
  western: { palette:['#654936','#fff1bf','#dd9c66','#837548'], label:'WESTERN', art:'western' },
  mystery: { palette:['#242b40','#f0e2bd','#c46759','#536383'], label:'MYSTERY', art:'mystery' },
  romance: { palette:['#713c58','#fae4b3','#d87983','#ba6d7c'], label:'ROMANCE', art:'romance' },
  dystopia: { palette:['#3b3443','#ffedc7','#d87341','#834c50'], label:'SPECULATIVE FICTION', art:'flame' },
  metropolis: { palette:['#32395c','#fae9bf','#db9174','#647ba0'], label:'CITY STORIES', art:'city' },
  chemistry: { palette:['#2d4d56','#efebd0','#dcac5d','#649483'], label:'LABORATORY SCIENCE', art:'lab' },
  circuitry: { palette:['#284943','#f2eabd','#eda751','#779a75'], label:'HARDWARE', art:'circuit' },
  radio: { palette:['#344c66','#f3e9c5','#cf886a','#7c91aa'], label:'RADIO & SIGNALS', art:'broadcast' },
  transport: { palette:['#6c3c3e','#f2e1b0','#d48e57','#72626e'], label:'ON THE ROAD', art:'drive' },
  biography: { palette:['#48434a','#f0dcb1','#c99759','#977b73'], label:'LIFE STORIES', art:'portrait' },
  travel: { palette:['#566248','#f3e6b6','#c57754','#9fa357'], label:'TRAVEL', art:'map' },
  photography: { palette:['#2e4251','#f2ead0','#d3a059','#79919d'], label:'PHOTOGRAPHY', art:'photo' },
  verse: { palette:['#4e3e54','#f2ddab','#c98d73','#897c97'], label:'SELECTED WRITING', art:'poetry' },
  home: { palette:['#586045','#f4e5be','#cb8963','#94a57a'], label:'HOME & GARDEN', art:'local' },
  directory: { palette:['#765b30','#fff3c7','#d39d44','#b4925d'], label:'REFERENCE INDEX', art:'handbook' },
  computing: { palette:['#344464','#e9e7ca','#d8915c','#758ab2'], label:'COMPUTING', art:'screen' },
  occult: { palette:['#3e2e4d','#f4dfac','#bb86b1','#8c647f'], label:'THE UNEXPLAINED', art:'occult' },
  fashion: { palette:['#773d50','#fff0d5','#db976b','#b77894'], label:'STYLE', art:'fashion' },
  dive: { palette:['#224b56','#e0efc7','#77b2a3','#456c83'], label:'DEEP WATER', art:'ocean' },
  samurai: { palette:['#7a4548','#ffedc3','#d79368','#9c6872'], label:'HISTORICAL FICTION', art:'samurai' },
  fantasy: { palette:['#314737','#efe8c2','#d1845b','#68866c'], label:'FANTASY', art:'fantasy' },
  archery: { palette:['#304943','#fff0bf','#c98155','#729685'], label:'FIELD SPORTS', art:'archery' },
  baseball: { palette:['#4d3448','#f9e8b9','#d17b6d','#7d6976'], label:'BASEBALL', art:'baseball' },
  inkComic: { palette:['#383640','#efe3bf','#c79182','#766579'], label:'GRAPHIC FICTION', art:'comicsInk' },
  waveComic: { palette:['#324b65','#faf0bd','#d99368','#738694'], label:'GRAPHIC FICTION', art:'comicsWave' },
};
const titleThemes = [
  [/archery|bowhunter|fletcher|bowyer/, 'archery'],
  [/baseball|bunting|batter up|complete guide to pitching/, 'baseball'],
  [/scifi_dune|cacti/, 'desert'],
  [/deep dive|surf|water survival|swim(?!.*sports)/, 'dive'],
  [/swash|freighter|buccaneer|sea rovers/, 'sea'],
  [/soft_west|vaquero|vendetta riders/, 'western'],
  [/crime|murdered|stalking|midnight cop/, 'mystery'],
  [/romance|ring bearer/, 'romance'],
  [/fahrenheit|brave new world|the wrong tomorrow/, 'dystopia'],
  [/metropolis|great capes/, 'metropolis'],
  [/chemistry|chem_|biodiesel|fermenting culture/, 'chemistry'],
  [/circuit|transistor|arduino|robot|advanced electronics/, 'circuitry'],
  [/radio|repeater|standpipe maintenance/, 'radio'],
  [/driving|car owner|hot rod|hotrod|car buyer|mag_(cars|barter)|under the hood/, 'transport'],
  [/autobiography|biography|a life of/, 'biography'],
  [/travelogue|travel guide|mapmaking/, 'travel'],
  [/photograph|through the lens/, 'photography'],
  [/poetic|verse|sonnet/, 'verse'],
  [/homemk|healing spaces|gardens|birdhouse|outdoor kitchens/, 'home'],
  [/phonebook|directory|language learning/, 'directory'],
  [/computer|computing|programming|how to browse|web design|mag_gaming|sicp/, 'computing'],
  [/occult|witchcraft|horoscope|psychic|crystals|beyond the veil/, 'occult'],
  [/mag_(beauty|dude|glam|porn)|glamopolitan|fashion magazine/, 'fashion'],
  [/samurai|armeast|weapeast/, 'samurai'],
  [/dnd_handbook|dragon|valkyries|dungeon master/, 'fantasy'],
];
const clothColors=['#60394b','#344c5a','#624e3d','#393a55','#4f573c','#39544c'];
const abstractComicCovers = [designs.visual, designs.inkComic, designs.waveComic];
export function coverDesign(item) {
  const {id,name,family,key}=item;
  const text=(id+' '+name).toLowerCase();
  if (/spiritual|holybook|quran|bible|scripture|torah|judaica/.test(text)) return designs.spiritual;
  const specific = titleThemes.find(([pattern]) => pattern.test(text));
  if (specific) return designs[specific[1]];
  if (/manga|comic/.test(text)) return abstractComicCovers[key%abstractComicCovers.length];
  if (/cook|bread|cuisine|baking|ferment|canning|meals|food fashions/.test(text)) return designs.food;
  if (/firstaid|first aid|emergency care|paramedic|nursing|doctor|medical|clinical/.test(text)) return designs.medicine;
  if (/tailor|sewing|clothing|fashion|needle|knit/.test(text)) return designs.craft;
  if (/sports|swimming|soccer|basketball|football|volleyball|training for|boxing|kickboxing/.test(text)) return designs.sports;
  if (/scifi|cyberiad|space|rocket|astronom|nether/.test(text)) return designs.scienceFiction;
  if (/carpent|mechanic|repair|construct|fabricat|diy|woodwork|tailor|stirling|welding/.test(text)) return designs.repair;
  if (/outdoor|surviv|camping|pitching a tent|trapper|wildlife|outdoors/.test(text)) return designs.field;
  if (/history|antholog|book_nonf_hard_(?!phil)|biography|business strategy|tall tales/.test(text)) return designs.history;
  if (/novel|paperback|book_fict|story|pulp/.test(text)) return designs.literature;
  if (family==='magazine') return designs.visual;
  return designs.reference;
}

function paletteFor(design,d) {
  if (design===designs.literature || design===designs.visual || design===designs.reference || design===designs.history) {
    const [,paper,accent,middle]=design.palette;
    return [clothColors[d.key%clothColors.length],paper,accent,middle];
  }
  return design.palette;
}

function polygon(ctx,color,points) {
  ctx.fillStyle=color;
  ctx.beginPath();
  for (const [i,[x,y]] of points.entries()) {
    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fill();
}
function disk(ctx,color,x,y,r) {
  for(let j=-r;j<=r;j++) {
    const width=Math.floor(Math.sqrt(r*r-j*j));
    rect(ctx,color,x-width,y+j,width*2+1,1);
  }
}
function rect(ctx,color,x,y,w,h) {
  ctx.fillStyle=color;
  ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}

function illustration(ctx, motif, key, colors) {
  if (paintCoverMotif(ctx, motif, colors, key)) return;
  const [dark,cream,accent,midtone]=colors;
  const x=key%13-6;
  rect(ctx,dark,0,0,64,40);
  switch(motif) {
    case 'diagram':
      for(let i=0;i<10;i++) rect(ctx,midtone,3+i*7,4,1,32);
      for(let i=0;i<5;i++) rect(ctx,midtone,3,4+i*8,59,1);
      if(key%2===0) {
        polygon(ctx,accent,[[10,29],[20,22],[31,24],[47,11],[54,11],[54,16],[48,16],[33,29],[20,27],[11,34]]);
        for(const [u,v] of [[10,30],[20,24],[33,26],[47,13],[54,13]]) rect(ctx,cream,u-1,v-1,3,3);
      } else {
        rect(ctx,accent,21,11,24,19);
        rect(ctx,dark,24,14,18,13);
        for(let i=0;i<4;i++) {
          rect(ctx,cream,14,13+i*4,7,1);
          rect(ctx,cream,45,13+i*4,7,1);
        }
      }
      break;
    case 'tools':
      polygon(ctx,cream,[[7,32],[26,12],[22,7],[25,3],[31,10],[37,7],[35,15],[29,19],[12,36]]);
      polygon(ctx,accent,[[35,6],[57,18],[58,22],[52,28],[47,26],[51,21],[33,10]]);
      rect(ctx,midtone,20,33,38,3);
      break;
    case 'table':
      rect(ctx,midtone,0,0,64,40);
      disk(ctx,cream,32+x,20,16);
      disk(ctx,dark,32+x,20,12);
      disk(ctx,accent,32+x,20,10);
      for(const [u,v] of [[27,17],[35,13],[34,23],[27,23],[38,20]]) disk(ctx,cream,u+x,v,2);
      rect(ctx,cream,54,7,2,24);
      rect(ctx,cream,51,9,8,7);
      break;
    case 'mountains':
      rect(ctx,midtone,0,0,64,40);
      disk(ctx,accent,45+x,12,6);
      polygon(ctx,cream,[[0,38],[17,13],[32,32],[41,19],[64,40]]);
      polygon(ctx,dark,[[0,38],[15,18],[22,26],[25,22],[36,39],[45,25],[64,40]]);
      rect(ctx,cream,0,38,64,2);
      break;
    case 'orbit':
      disk(ctx,midtone,35+x,20,13);
      disk(ctx,accent,32+x,18,10);
      polygon(ctx,cream,[[11,30],[14,26],[48,14],[56,13],[55,16],[16,30]]);
      for(let i=0;i<8;i++) rect(ctx,cream,(i*17+key)%62,(i*11)%36+1,1+(i%2),1);
      break;
    case 'archive':
      for(let i=0;i<6;i++) rect(ctx,cream,6+i*8,12+(i%3),4,24-i%3);
      polygon(ctx,accent,[[3,12],[30,2],[56,12]]);
      rect(ctx,cream,4,35,55,3);
      break;
    case 'ornament':
      for(const r of [17,13,8]) polygon(ctx,r===13?dark:accent,[[31,20-r],[31+r,20],[31,20+r],[31-r,20]]);
      polygon(ctx,cream,[[28,20],[31,17],[34,20],[31,23]]);
      break;
    case 'print':
      rect(ctx,midtone,0,0,64,40);
      for(let i=0;i<7;i++) polygon(ctx,i%2?cream:accent,[[31+x,16],[3+i*10,0],[9+i*10,0]]);
      polygon(ctx,dark,[[5,38],[18,27],[28,29],[37,16],[57,29],[64,38]]);
      break;
    case 'court':
      rect(ctx,midtone,4,5,56,30);
      rect(ctx,cream,7,8,50,24);
      rect(ctx,midtone,8,9,48,22);
      rect(ctx,cream,31,9,1,22);
      disk(ctx,cream,31,20,8);
      disk(ctx,midtone,31,20,7);
      disk(ctx,accent,36+x,25,5);
      break;
    case 'medicine':
      rect(ctx,midtone,0,0,64,40);
      disk(ctx,cream,20,20,13);
      rect(ctx,accent,17,12,6,16);
      rect(ctx,accent,12,17,16,6);
      polygon(ctx,cream,[[34,25],[40,25],[44,13],[48,29],[51,22],[62,22],[62,24],[52,24],[47,32],[43,20],[41,27],[34,27]]);
      break;
    case 'stitch':
      for(let j=0;j<3;j++) for(let i=0;i<5;i++) rect(ctx,[dark,accent,midtone][(i+2*j+key)%3],5+i*11,4+j*11,10,10);
      polygon(ctx,cream,[[11,34],[46,8],[50,7],[48,11],[14,36]]);
      break;
    default:
      rect(ctx,midtone,0,0,64,40);
      disk(ctx,accent,26+x,13,7);
      polygon(ctx,dark,[[0,35],[13,31],[24,34],[36,25],[48,28],[64,32],[64,40],[0,40]]);
      rect(ctx,cream,25+x,24,13,1);
  }
}
function titleLines(ctx,title,width) {
  const words=title.replace(/\s+/g,' ').trim().toUpperCase().split(' ');
  const lines=[];
  let line='';
  for(const word of words) {
    const next=line ? line+' '+word : word;
    if(line && ctx.measureText(next).width>width) {lines.push(line);line=word;}
    else line=next;
  }
  if(line) lines.push(line);
  return lines;
}

const layouts = {
  framed: { heading:[10,21,60,31], picture:[8,56,64,40], label:[10,10] },
  masthead: { heading:[8,15,64,34], picture:[6,53,68,43], label:[8,3] },
  spineBand: { heading:[13,19,60,35], picture:[12,57,62,39], label:[13,10] },
  illustratedTop: { heading:[8,69,64,34], picture:[0,0,80,54], label:[8,59] },
  fullBleed: { heading:[8,81,64,29], picture:[0,23,80,54], label:[8,9] },
  twoTone: { heading:[8,9,64,36], picture:[2,51,76,47], label:[8,103] },
  emblem: { heading:[10,69,60,33], picture:[16,30,48,32], label:[14,13], centered:true },
  columns: { heading:[8,9,64,29], picture:[9,43,62,39], label:[8,102] },
};
const artLed=['illustratedTop','fullBleed','spineBand','emblem','twoTone'];
const journalLayouts=['masthead','fullBleed','columns','twoTone','illustratedTop'];
const technical=['columns','twoTone','spineBand','framed'];
const books=['framed','emblem','illustratedTop','twoTone','spineBand'];

export function coverLayout(d, design) {
  const art=design.art;
  const choices=d.family==='magazine' ? journalLayouts
    : ['ornament','portrait','poetry','handbook'].includes(art) ? ['emblem','framed']
    : ['circuit','screen','lab','diagram','tools','drive','broadcast'].includes(art) ? technical
    : ['desert','tide','western','mystery','romance','flame','city','ocean','samurai','fantasy','orbit'].includes(art) ? artLed
    : books;
  return choices[d.key%choices.length];
}

function drawTitle(ctx, title, [x,y,width,height], { serif, centered, ink }) {
  let size=17, lines;
  do {
    ctx.font='700 '+size+'px '+(serif?'Georgia':'Arial');
    lines=titleLines(ctx,title,width);
    if(lines.length*(size+1)<=height) break;
    size--;
  } while(size>=8);
  size=Math.max(size,8);
  const limit=Math.max(1,Math.floor(height/(size+1)));
  if(lines.length>limit) lines=[...lines.slice(0,limit-1),lines.slice(limit-1).join(' ')];
  ctx.textAlign=centered?'center':'left';
  ctx.fillStyle=ink;
  for(const [i,line] of lines.entries()) ctx.fillText(line,centered?x+width/2:x,y+i*(size+1),width);
  ctx.textAlign='left';
}

function coverCanvas(d, design, colors) {
  const [dark,paper,accent,middle]=colors;
  const magazine=d.family==='magazine';
  const cover=document.createElement('canvas');
  cover.width=80;cover.height=112;
  const ctx=cover.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  const layout=coverLayout(d,design);
  const { heading, picture, label, centered }=layouts[layout];
  rect(ctx,dark,0,0,80,112);
  ctx.textBaseline='top';
  if(layout==='framed'||layout==='emblem') {
    rect(ctx,middle,4,4,72,104);
    rect(ctx,dark,5,5,70,102);
    if(layout==='emblem') {
      rect(ctx,accent,13,24,54,1);
      rect(ctx,accent,13,64,54,1);
    }
  } else if(layout==='masthead') {
    rect(ctx,accent,0,0,80,10);
    rect(ctx,accent,0,100,80,12);
  } else if(layout==='spineBand') {
    rect(ctx,accent,0,0,6,112);
    rect(ctx,middle,7,100,66,1);
  } else if(layout==='illustratedTop') {
    rect(ctx,accent,0,53,80,3);
  } else if(layout==='fullBleed') {
    rect(ctx,accent,0,0,80,21);
  } else if(layout==='twoTone') {
    rect(ctx,paper,0,0,80,47);
    rect(ctx,accent,0,47,80,3);
  } else if(layout==='columns') {
    rect(ctx,accent,9,37,62,2);
    for(const x of [9,32,54]) for(let y=0;y<3;y++) rect(ctx,middle,x,86+y*4,16+y,1);
  }
  ctx.fillStyle=layout==='masthead'||layout==='fullBleed'?dark:paper;
  ctx.font='bold 5px monospace';
  ctx.fillText(magazine?'ISSUE '+(1+d.key%97):design.label,label[0],label[1],58);
  drawTitle(ctx,d.name,heading,{
    serif:layouts[layout].centered || ['horizon','romance','mystery','tide','desert','western'].includes(design.art),
    centered,
    ink:layout==='twoTone'?dark:paper,
  });
  const [x,y,w,h]=picture;
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(w/64,h/40);
  illustration(ctx,design.art,d.key,colors);
  ctx.restore();
  if(layout==='masthead') {
    for(let k=0;k<9;k++) if((d.key>>k)&1) rect(ctx,dark,59+k*2,104,1,5);
  } else if(layout==='framed'||layout==='spineBand') {
    rect(ctx,accent,10,102,24,2);
    rect(ctx,middle,38,103,31,1);
  }
  return cover;
}

export function reading(p,d) {
  const magazine=d.family==='magazine', hard=d.detail==='hard';
  const width=magazine?.157:.137, length=.21;
  const thickness=magazine?.008:/phonebook|collector_book/.test(d.id)?.056:Math.min(.042,Math.max(.009,d.volume/25500));
  const design=coverDesign(d);
  const colors=paletteFor(design,d), [base,ink,accent,middle]=colors;
  const image=coverCanvas(d,design,colors);
  const cover=(ctx,x,y,w,h,side)=>{
    rect(ctx,base,x,y,w,h);
    if(side==='front') {
      ctx.translate(x,y+h);
      ctx.rotate(-Math.PI/2);
      ctx.drawImage(image,0,0,h,w);
    }
  };
  const spine=(ctx,x,y,w,h,side)=>{
    rect(ctx,base,x,y,w,h);
    if(side!=='back') return;
    rect(ctx,accent,x+w*.06,y,w*.045,h);
    rect(ctx,accent,x+w*.89,y,w*.045,h);
    const size=Math.min(11,h-2);
    if(size<5) return;
    ctx.fillStyle=ink;
    ctx.textBaseline='middle';
    ctx.font='bold '+size+'px sans-serif';
    ctx.fillText(d.name,x+w*.15,y+h*.51,w*.69);
  };
  const back=(ctx,x,y,w,h,side)=>{
    rect(ctx,base,x,y,w,h);
    if(side!=='front') return;
    rect(ctx,middle,x+w*.15,y+h*.18,w*.68,h*.012);
    for(let j=0;j<6;j++) rect(ctx,ink,x+w*.15,y+h*(.28+j*.061),w*(.40+((d.key+j*7)%9)*.032),Math.max(1,h*.017));
    rect(ctx,accent,x+w*.15,y+h*.77,w*.22,h*.045);
  };
  book(p,{L:length,W:width,T:thickness,hard,color:parseInt(base.slice(1),16),frontPaint:cover,backPaint:back,spinePaint:spine});
}

