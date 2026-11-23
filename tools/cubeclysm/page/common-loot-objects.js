import { blob, book, crumple, loop, lump, printP, sheet, woodP } from './item-kit.js';
import {
  GLASS, V, bevel, clothP, coil, cyl, fill, flat, front, glass, label, lid, outline, pane, paperP, path,
  plasticP, ring, rubber, shade, steelP, top, tube, warmPaper,
} from './common-loot-kit.js';

const maple=woodP(0xa78054);
const nickel=steelP(0xa1aaaa);
const handles=plasticP(0x404e4d);

function utensil(p,d) {
  const i=d.id;
  const length=d.length || .22;
  const z=length*.5;
  const copper=/copper/.test(i);
  const metal=copper?steelP(0xa66e4f):i==='casserole'?plasticP(0xaf6d51):i==='funnel'?plasticP(0xa44e3d):nickel;
  if (i==='rolling_pin') {
    cyl(p,'maple roller','x',[0,.034,0],.037,length*.65,14,maple);
    for (const s of [-1,1]) tube(p,`handle ${s}`,V(s*z*.61,.034,0),V(s*z,.034,0),.014,.012,8,maple);
    return;
  }
  if (/pan|^pot$|^pot_copper$|casserole|teapot|kettle|funnel/.test(i)) {
    kitchenVessel(p,d,metal);
    return;
  }
  if (/tongs|garlic_press|can_opener/.test(i)) {
    for (const s of [-1,1]) {
      const grip=i==='tongs'?.027:.021;
      tube(p,`hinged arm ${s}`,V(s*.011,.008,-z*.48),V(s*grip,.008,z*.91),.007,.009,6,handles);
      bevel(p,`working jaw ${s}`,[s*.010-.006,.005,-z,s*.010+.006,.021,-z*.45],.003,metal);
    }
    cyl(p,'pivot','y',[0,.015,-z*.44],.009,.006,8,metal);
    if (i==='can_opener') cyl(p,'cutter wheel','y',[.015,.017,-z*.73],.013,.005,10,metal);
    if (i==='garlic_press') bevel(p,'press chamber',[-.022,.003,-z,.022,.027,-z*.56],.005,metal);
    return;
  }
  if (i==='cheese_grater') {
    bevel(p,'tapered grater',[-.037,0,-.035,.037,.103,.035],.006,metal);
    front(p,'stamped holes',[-.029,.013,.029,.095],-.036,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0x9fa7a6);
      for(let j=2;j<h-2;j+=4) for(let k=1;k<w-1;k+=4){
        fill(ctx,x+k,y+j,2,1,0x4f595b);fill(ctx,x+k,y+j+1,2,1,0xc2c5b8);
      }
    });
    path(p,'arched grip',[[-.026,.10,0],[-.024,.123,0],[.024,.123,0],[.026,.10,0]],.006,handles);
    return;
  }
  if (i==='potato_masher') {
    tube(p,'shaft',V(0,.019,.099),V(0,.023,-.064),.006,.006,6,metal);
    bevel(p,'wood grip',[-.012,0,.037,.012,.027,.116],.006,maple);
    path(p,'zigzag head',[[-.049,.015,-.074],[-.037,.015,-.091],[-.019,.015,-.056],[0,.015,-.091],[.019,.015,-.056],[.037,.015,-.091],[.049,.015,-.074]],.004,metal);
    return;
  }
  bevel(p,'handle',[-.010,0,z*.35,.010,.021,z],.006,/spatula|fork|pizza/.test(i)?maple:handles);
  tube(p,'steel shank',V(0,.010,z*.56),V(0,.012,-z*.31),.0045,.006,6,metal);
  switch(i) {
    case 'whisk':
      for(const s of [-1,1]) for(const y of [.004,.022]) {
        path(p,`wire loop ${s} ${y}`,[[0,.012,-z*.24],[s*.024,y,-z*.57],[s*.019,y,-z*.88],[0,.012,-z],[0,.012,-z*.27]],.0018,metal);
      }
      break;
    case 'carving_fork':
      p.box('fork shoulder',[-.019,.004,-z*.68,.019,.012,-z*.29],metal);
      for (const x of [-.015,.015]) tube(p,`tine ${x}`,V(x,.006,-z*.62),V(x,.007,-z+.0015),.0035,.0015,6,metal);
      break;
    case 'pizza_cutter':
      cyl(p,'rotary wheel','y',[0,.009,-z+.043],.041,.007,20,metal);
      cyl(p,'axle','y',[0,.014,-z+.043],.007,.005,8,handles);
      break;
    case 'ladle':
    case 'icecream_scoop': {
      const r=i==='ladle'?.038:.027;
      const at=[0,-z+r];
      cyl(p,'bowl bottom','y',[at[0],.004,at[1]],r*.6,.008,12,metal);
      cyl(p,'bowl lip','y',[at[0],.011,at[1]],r*.62,.015,12,metal,{cutout:true,open:true},r);
      break;
    }
    default:
      outline(p,'broad blade',[[-.010,-z*.25],[-.034,-z*.83],[-.026,-z],[.030,-z],[.034,-z*.82],[.011,-z*.25]],.005,i==='spatula'?plasticP(0xa8735a):metal,.008);
  }
}

function kitchenVessel(p,d,metal) {
  const id=d.id;
  if (id==='funnel') {
    cyl(p,'narrow stem','y',[0,.039,0],.012,.078,12,metal,{cutout:true,open:true});
    cyl(p,'open cone','y',[0,.114,0],.012,.078,14,metal,{cutout:true,open:true},.068);
    ring(p,'rim',.064,.069,.153,metal);
    return;
  }
  const pan=id.includes('pan');
  const pour=/teapot|kettle/.test(id);
  const r=pan?.104:id==='pot_copper'?.089:id==='teapot'?.061:.082;
  const h=pan?.039:id==='casserole'?.057:pour?.093:.124;
  const x=pan?-.064:0;
  const inner=/copper/.test(id)?steelP(0xb8bcb2):metal;
  cyl(p,'pressed base','y',[x,.008,0],r*.87,.016,14,metal);
  cyl(p,'vessel wall','y',[x,(h+.01)/2,0],r*.87,h-.01,14,metal,{cutout:true,open:true},r);
  if (/copper/.test(id)) {
    cyl(p,'tin-lined interior','y',[x,.017,0],r*.85,.006,14,inner);
    ring(p,'tin rim',r*.90,r,h+.0006,inner,[x,0]);
  }
  if (pan) {
    bevel(p,'handle',[.029,.025,-.017,.176,.047,.017],.007,handles);
  } else {
    lid(p,'lid',r*.97,h-.004,.01,metal);
    cyl(p,'knob','y',[0,h+.014,0],.014,.019,8,handles);
    if (pour) {
      tube(p,'spout',V(-r*.76,h*.45,0),V(-r*1.32,h*.88,0),.022,.010,8,metal);
      path(p,'insulated handle',[[r*.80,h*.31,0],[r*1.28,h*.48,0],[r*1.29,h*.99,0],[r*.70,h*1.05,0]],.009,handles);
    } else for (const s of [-1,1]) {
      path(p,`side grip ${s}`,[[s*r*.92,h*.78,-.024],[s*r*1.2,h*.78,-.027],[s*r*1.2,h*.78,.027],[s*r*.92,h*.78,.024]],.006,metal);
    }
  }
}

function grooming(p,d) {
  const id=d.id;
  if (id==='bathroom_scale') {
    bevel(p,'scale body',[-.15,0,-.138,.15,.032,.138],.018,plasticP(0xb3b8ad));
    top(p,'display',[-.047,-.105,.047,-.057],.0325,label(0x485d53,'0.0',0));
  } else if (id==='plunger_toilet') {
    cyl(p,'rubber bell','y',[0,.031,0],.077,.062,14,plasticP(0x8d5143),{},.029);
    cyl(p,'wooden shaft','y',[0,.234,0],.014,.364,10,maple);
  } else if (id==='soap_holder') {
    bevel(p,'oval base',[-.065,0,-.040,.065,.016,.040],.006,plasticP(0x8fa49d));
    for (const s of [-1,1]) bevel(p,`rim ${s}`,[-.058,.011,s*.035-.005,.058,.023,s*.035+.005],.004,plasticP(0x8fa49d));
    for(let k=0;k<6;k++) p.box(`drain ${k}`,[-.047+k*.017,.016,-.019,-.043+k*.017,.017,.019],rubber);
  } else if (id==='hair_dryer') {
    cyl(p,'blower housing','x',[0,.05,0],.037,.103,12,plasticP(shade(d.color,1.25)),{},.028);
    cyl(p,'concentrator','x',[.064,.05,0],.025,.030,10,rubber,{},.021);
    tube(p,'pistol grip',V(-.026,.045,0),V(-.052,.012,0),.024,.015,8,plasticP(d.color));
    cyl(p,'intake grille','x',[-.055,.05,0],.029,.005,10,rubber);
    path(p,'short cord',[[-.052,.012,0],[-.102,.007,.013],[-.126,.007,.054]],.003,rubber);
  } else if (id==='comb_pocket') {
    p.box('comb spine',[-.09,0,-.013,.09,.006,.002],plasticP(d.color));
    for(let k=0;k<24;k++) p.box(`tooth ${k}`,[-.086+k*.007,.001,.001,-.083+k*.007,.005,.022+(k<12?.006:0)],plasticP(d.color));
  } else if (id==='razor_blade' || id==='emery_board') {
    const length=d.length, width=id==='razor_blade'?.019:.018;
    bevel(p,'flat blade or board',[-length/2,0,-width/2,length/2,.002,width/2],.00055,
      id==='razor_blade'?nickel:paperP(0xa17361));
    if (id==='razor_blade') top(p,'centre slot',[-.011,-.002,.011,.002],.0023,rubber);
  } else {
    const brush=/hairbrush|toothbrush/.test(id);
    const hair=id==='hairbrush';
    const z=d.length?d.length/2:.079;
    const w=hair?.029:brush?.013:.025;
    bevel(p,'soft grip',[-.012,0,-z,.012,.022,z*.35],.005,plasticP(shade(d.color,1.16)));
    bevel(p,'head',[-w,.002,z*.20,w,.018,z],.005,plasticP(d.color));
    if (brush) {
      for(let a=-1;a<=1;a++) for(let b=0;b<5;b++){
        const tz=z*.34+b*(z*.13);
        p.box(`bristle ${a} ${b}`,[a*w*.57-.0017,.018,tz,a*w*.57+.0017,hair?.028:.023,tz+.0025],plasticP(hair?0x3d4240:0xd8dbca));
      }
    } else for (let k=0;k<3;k++) p.box(`shaving strip ${k}`,[-w*.8,.017,z*.43+k*.008,w*.8,.020,z*.43+k*.008+.0015],nickel);
  }
}

function handTool(p,d) {
  const id=d.id, h=d.length || .15;
  if (id.includes('extension_cable')) {
    const r=id.startsWith('long')?.123:.079;
    coil(p,'wound extension cable',r,.004,plasticP(0xaf783c),id.startsWith('long')?2.3:1.6);
    p.box('socket block',[-r*.34,0,-r*.29,r*.34,.019,-r*.06],rubber);
    for (const x of [-.013,.012]) p.box(`outlet ${x}`,[x-.005,.018,-r*.22,x+.005,.020,-r*.15],plasticP(0x67675c));
  } else if (/saw/.test(id)) {
    const hacksaw=id==='hacksaw';
    const z=h*.5;
    bevel(p,'handle',[-z,0,-.036,-z+.075,.026,.034],.008,plasticP(d.color));
    outline(p,'toothed blade',[[-z+.062,-.021],[z,-.017],[z,hacksaw?.004:.032],[-z+.055,hacksaw?.004:.055]],.003,nickel,.012);
    for(let k=0;k<14;k++) {
      const x=-z+.073 + k*(h-.078)/14;
      outline(p,`tooth ${k}`,[[x,-.019],[x+.008,-.019],[x+.004,-.026]],.003,nickel,.012);
    }
    if (hacksaw) path(p,'bow frame',[[-z+.058,.014,0],[-z+.069,.014,.060],[z-.019,.014,.056],[z-.003,.014,0]],.006,rubber);
  } else if (/wrench|scissors/.test(id)) {
    const r=id==='lug_wrench'?.014:.010;
    tube(p,'forged shank',V(-h/2+r,.008,0),V(h/2-r,.008,0),r*.65,r*.65,8,nickel);
    if(id==='scissors_medical') {
      for (const s of [-1,1]){
        loop(p,`handle eye ${s}`,[-h*.34,.004,s*.015],.014,.003,plasticP(0x48616c),{},8);
        tube(p,`blade ${s}`,V(0,.009,0),V(h/2-.004,.009,s*.021),.0045,.002,6,nickel);
      }
    } else if (id==='wrench_small') {
      const x=h/2;
      outline(p,'fixed crescent jaw',[[x-.045,-.009],[x-.028,-.023],[x,-.019],[x-.004,-.010],[x-.024,-.004]],.014,nickel,.002);
      outline(p,'sliding jaw',[[x-.037,.004],[x-.016,.011],[x-.005,.012],[x-.011,.022],[x-.029,.022]],.014,nickel,.002);
      cyl(p,'adjustment wheel','z',[x-.035,.009,.009],.007,.014,12,steelP(0x637573));
      ring(p,'handle hanging hole',.004,.009,.012,nickel,[-h/2+.009,0]);
    } else {
      cyl(p,'socket end','z',[h*.45,r,0],r*1.25,.045,10,nickel);
      tube(p,'bent extension',V(-h*.40,r,0),V(-h*.50,r,.055),r*.61,r*.65,8,nickel);
    }
  } else if (id==='eink_tablet_pc' || id==='memory_card') {
    const tablet=id==='eink_tablet_pc';
    const width=tablet?h*.60:.024, len=tablet?h:.032, t=tablet?.009:.003;
    bevel(p,'moulded shell',[-width/2,0,-len/2,width/2,t,len/2],tablet?.003:.0009,rubber);
    top(p,tablet?'e-ink display':'printed card face',[-width*.42,-len*.40,width*.42,len*.34],t+.0005,
      tablet?printP(0xb5bbb0,0x58645c):label(0x8b664c,'SD',d.key));
  } else if (id==='office_holepunch') {
    const metal=steelP(0x78908e);
    bevel(p,'paper guide base',[-.052,0,-.017,.052,.009,.017],.003,metal);
    bevel(p,'single punch housing',[-.046,.002,-.011,-.018,.036,.011],.004,metal);
    const hinge=p.group('top lever',{at:[-.040,.031,0],rotZ:.17});
    bevel(p,'spring-loaded lever',[0,0,-.018,.091,.012,.018],.003,metal,{parent:hinge});
    cyl(p,'single punch pin','y',[-.031,.020,0],.004,.016,10,nickel);
  } else if (id==='small_lighter') {
    bevel(p,'translucent tank',[-.013,0,-.009,.013,.045,.009],.004,plasticP(d.color));
    bevel(p,'metal shroud',[-.013,.042,-.009,.013,.060,.009],.003,nickel);
    cyl(p,'flint wheel','z',[.004,.054,0],.005,.018,8,rubber);
  } else {
    pencilTool(p,d,h);
  }
}

function pencilTool(p,d,h) {
  const id=d.id, light=id==='heavy_flashlight', syringe=id==='syringe', iron=id.includes('soldering');
  const r=light?.026:iron?.013:syringe?.007:.0068;
  const color=light?0x3f4948:id==='red_pen'?0xa7433c:id==='green_pen'?0x45715a:id==='glowstick'?0x638ab1:d.color;
  const body=syringe?glass:plasticP(color);
  cyl(p,'main barrel','x',[-h*.11,r,0],r,h*.74,10,body,syringe?GLASS:{});
  if (light) {
    cyl(p,'larger head','x',[h*.350,r,0],.031,h*.27,12,plasticP(color));
    cyl(p,'lamp lens','x',[h*.49,r,0],.024,.002,12,flat(0xc9d1ba));
  } else {
    cyl(p,iron?'working tip':syringe?'nozzle':'cap or tip','x',[h*.374,r,0],r*.78,h*.24,8,
      iron||syringe?nickel:plasticP(shade(color,.78)),{},r*.50);
    if (syringe) {
      cyl(p,'plunger','x',[-h*.443,r,0],.011,.004,10,plasticP(0xe2dfd0));
    } else if (id==='glowstick') {
      ring(p,'eyelet',.0025,.005,r,plasticP(shade(color,1.25)),[-h*.44,0]);
    } else if (id==='soldering_iron_portable') {
      bevel(p,'battery cap',[-h*.49,0,-.016,-h*.34,.032,.016],.004,rubber);
    } else if (iron) {
      path(p,'lead',[[-h*.46,r,0],[-h*.54,.006,.020],[-h*.50,.005,.047]],.0035,rubber);
    } else p.box('clip',[-h*.35,r*1.8,-.002,-h*.03,r*2.25,.002],plasticP(shade(color,.70)));
  }
}

function reading(p,d) {
  if(d.id==='survnote') {
    crumple(p,'crumpled note',.067,.042,.002,printP(0xd3c9ab,0x576167),d.id);
    top(p,'handwritten lines',[-.044,-.026,.045,.026],.0026,printP(0xe2d8bc,0x5d6865));
    return;
  }
  const magazine=/news|mag_|zine/.test(d.id);
  const length=d.length || (magazine?.27:.20);
  const illustrated=/mag_comic|child_book|novel_coa2|fairy_tales/.test(d.id);
  const title=label(d.color,d.name,d.key);
  const cover=illustrated ? (ctx,x,y,w,h) => {
    title(ctx,x,y,w,h);
    const color=d.id==='mag_comic'?0xd99b58:d.id==='fairy_tales'?0x829469:0xc19377;
    fill(ctx,x+w*.17,y+h*.47,w*.65,h*.38,color);
    if (d.id==='mag_comic') {
      for(let k=0;k<8;k++) fill(ctx,x+w*.50-k*.75,y+h*.49+k*h*.034,w*.10,Math.max(1,h*.045),0x7d4145);
    } else {
      fill(ctx,x+w*.47,y+h*.52,w*.12,h*.08,0xe2c9a3);
      fill(ctx,x+w*.41,y+h*.61,w*.24,h*.18,0x4c6163);
    }
  } : title;
  book(p,{ L:length,W:length*(magazine?.74:.65),T:magazine?.006:.019+Math.min(1400,d.volume||500)*.000011,
    color:d.color,hard:/hard|fairy|novel_coa2/.test(d.id),motif:cover,title:0xe3d9b8 });
}

function parts(p,d) {
  const i=d.id;
  if (i==='aluminum_foil') {
    const foil=steelP(0xb3bcb8);
    pane(p,'folded foil sheet',[V(-.067,.002,-.040),V(.066,.003,-.048),V(.058,.009,.046),V(-.066,.004,.040)],.0007,foil);
    pane(p,'overlapping foil corner',[V(.016,.010,.044),V(.058,.009,.046),V(.066,.003,-.013),V(.032,.015,.002)],.0006,steelP(0x8d9998));
    return;
  }
  if (/solder_wire|medical_tape/.test(i)) {
    const r=i==='medical_tape'?.026:.037;
    const color=i==='solder_wire'?0x747e7c:0xd0c8ae;
    cyl(p,'rolled exterior','y',[0,.019,0],r,.038,14,plasticP(color),{cutout:true,open:true});
    cyl(p,'card core','y',[0,.019,0],r*.55,.038,14,warmPaper,{cutout:true,open:true});
    ring(p,'rolled layers',r*.55,r,.038,plasticP(color));
  } else if (i==='rubber_band') {
    loop(p,'closed rubber loop',[0,.0018,0],.023,.0018,plasticP(0xae8758),{},16);
  } else if (i==='cable') {
    coil(p,'coiled length',.044,.0024,plasticP(0x454746),1.25);
  } else if (i==='chain') {
    for(let k=0;k<7;k++){
      const parent=p.group(`link ${k}`,{at:[(k-3)*.028,.015,Math.sin(k*.65)*.022],rotX:k%2?Math.PI/2:0});
      loop(p,'iron loop',[0,0,0],.014,.0032,nickel,{parent},8);
    }
  } else if (i==='pipe') {
    const parent=p.group('horizontal tube',{at:[0,.023,0],rotZ:Math.PI/2});
    cyl(p,'steel tube','y',[0,0,0],.023,.60,12,nickel,{parent,cutout:true,open:true});
    cyl(p,'dark inner wall','y',[0,0,0],.020,.599,12,steelP(0x485454),{parent,cutout:true,open:true});
    cyl(p,'inner bore shade','y',[0,0,0],.020,.006,12,flat(0x333a3d),{parent});
  } else if (i==='wood_panel' || i==='plastic_sheet') {
    const wood=i==='wood_panel', length=wood?.61:.122, z=wood?.18:.076;
    bevel(p,'sheet stock',[-length,0,-z,length,wood?.028:.004,z],wood?.009:.001,wood?maple:plasticP(d.color));
  } else if (i==='feather') {
    tube(p,'quill',V(-.074,.002,0),V(.074,.003,0),.002,.0005,6,warmPaper);
    for (const s of [-1,1]) outline(p,`vanes ${s}`,[[-.062,0],[-.029,s*.018],[.024,s*.019],[.068,0]],.002,
      printP(0xb8a490,0x6a6a64),.002);
  } else if (i.startsWith('glue')) {
    bevel(p,'glue bottle',[-.031,0,-.018,.031,.075,.018],.006,plasticP(i==='glue_strong'?0xa27b40:0xdfd3af));
    cyl(p,'nozzle cap','y',[0,.084,0],.013,.022,10,plasticP(d.color),{},.006);
    front(p,'glue label',[-.025,.022,.025,.062],-.019,label(d.color,'GLUE',d.key));
  } else {
    const base=i==='cotton_ball'?0xdfdcd0:i.includes('styrofoam')?0xd3d1c1:d.color;
    lump(p,'irregular fragment',[.039,.020,.033],plasticP(base),i);
  }
}

function food(p,d) {
  const id=d.id;
  if (id==='orange'||id==='pear'||id==='egg_bird_unfert') {
    const egg=id.startsWith('egg'), pear=id==='pear';
    const paint=plasticP(egg?0xdbc8a7:pear?0x829450:0xd5933c);
    blob(p,'main fruit or shell',[egg?.021:.034,egg?.027:.032,egg?.022:.032],[0,egg?.027:.032,0],paint,{},5,10);
    if (pear) {
      blob(p,'pear neck',[.018,.026,.018],[0,.054,0],paint,{},4,9);
      tube(p,'pear stem',V(0,.075,0),V(.004,.087,0),.0027,.0018,6,maple);
    }
    if (id==='orange') cyl(p,'stem scar','y',[0,.064,0],.005,.001,7,flat(0x788452));
  } else if (id==='bread') {
    const crust=[[-.043,.044],[.043,.044],[.043,-.024],[.033,-.044],[.012,-.051],[-.018,-.050],[-.036,-.041],[-.043,-.023]];
    outline(p,'browned crust',crust,.021,plasticP(0xa96b38));
    outline(p,'porous crumb',crust.map(([x,z])=>[x*.87,z*.88]),.001,plasticP(0xe3c592),.021);
  } else if (id==='butter') {
    bevel(p,'butter pat',[-.029,0,-.019,.029,.016,.019],.003,paperP(0xdac482));
    top(p,'butter paper',[-.026,-.016,.026,.016],.0165,label(0x9d925e,'BUTTER',d.key));
  } else if (id === 'cheese') {
    bevel(p,'yellow pressed cheese block',[-.032,0,-.019,.032,.026,.019],.003,plasticP(0xdca650));
  } else if (id === 'cheese_hard') {
    const piece=[[-.037,-.025],[.041,-.019],[-.024,.033]];
    outline(p,'cut aged cheese wedge',piece,.026,plasticP(0xd2ad67));
    path(p,'golden rind',[[.039,.014,-.018],[.008,.014,.011],[-.024,.014,.032]],.003,plasticP(0x9d7142));
  } else {
    const strips=id==='bacon';
    for(let k=0;k<3;k++){
      const y=k*.005, z=k*(strips?.024:.012)-.025;
      const paint=plasticP(strips?0xb77664:id==='bologna'?0xba8170:0xa87e65);
      if (id==='bologna') cyl(p,'round deli slice','y',[k*.012-.012,y+.003,z],.041,.006,14,paint);
      else bevel(p,'cut slice',[-.052,y,z-.017,.052,y+.006,z+.017],.002,paint);
      if(strips) top(p,'fat streak',[-.046,z-.006,.049,z+.001],y+.0064,plasticP(0xd9b3a1));
    }
  }
}

function money(p,d) {
  if (d.id.startsWith('coin')) {
    const r=d.id==='coin_dime'?.008955:.010605;
    const metal=steelP(0x9da8a3);
    cyl(p,'minted disc','y',[0,.0012,0],r,.0024,20,metal);
    ring(p,'rim',r*.82,r*.96,.0026,steelP(0xc1c4b6));
    const face=d.id==='coin_dime'?0x6d7b78:0x868b7d;
    outline(p,'raised profile',[[-r*.34,-r*.31],[r*.10,-r*.49],[r*.26,-r*.11],[r*.37,.01],
      [r*.16,r*.12],[r*.28,r*.41],[-r*.36,r*.30]],.00035,flat(face),.00238);
  } else {
    const bill=d.id.startsWith('money');
    const w=bill?.156:d.length||.084, z=bill?.033:.027;
    const number=d.id==='money_five'?'5':d.id==='money_ten'?'10':'20';
    sheet(p,'item backing',w,z*2,bill?.00055:.0011,paperP(bill?0xb5bf9a:0xd2c7a7));
    top(p,'printed face',[-w*.49,-z*.94,w*.49,z*.94],bill?.0007:.00135,
      bill ? (ctx,x,y,w,h) => {
        fill(ctx,x,y,w,h,0x58704f);
        fill(ctx,x+2,y+2,w-4,h-4,0xc5cda4);
        fill(ctx,x+w*.37,y+h*.16,w*.26,h*.68,0x708761);
        fill(ctx,x+w*.47,y+h*.27,w*.105,h*.34,0xe3daba);
        fill(ctx,x+w*.43,y+h*.57,w*.17,h*.16,0x788061);
        ctx.fillStyle='#4a6449';
        ctx.font=`bold ${Math.round(h*.35)}px monospace`;
        ctx.fillText(number,x+w*.10,y+h*.55);
        ctx.fillText(number,x+w*.74,y+h*.55);
      } : label(d.id==='fp_loyalty_card'?0xa45a79:d.color,d.name,d.key));
  }
}

function medical(p,d) {
  const id=d.id;
  if (id==='inhaler') {
    bevel(p,'blue plastic inhaler',[-.019,0,-.016,.019,.070,.016],.005,plasticP(0x527b94));
    bevel(p,'mouthpiece cap',[-.018,.003,-.041,.018,.027,-.007],.004,plasticP(0x426477));
    cyl(p,'canister','y',[0,.072,0],.014,.013,10,nickel);
  } else if (id==='medical_gauze') {
    bevel(p,'sealed sterile gauze',[-.060,0,-.046,.060,.012,.046],.004,paperP(0xe4ded0));
    for(const z of [-.037,.037]) p.box(`heat seal ${z}`,[-.053,.009,z-.002,.053,.012,z+.002],paperP(0xb6c2b8));
    top(p,'sterile gauze label',[-.047,-.026,.047,.026],.0125,label(0x587f7c,'GAUZE',d.key));
  } else if (id==='bandages') {
    cyl(p,'woven dressing roll','y',[0,.023,0],.029,.046,14,clothP(0xd9d8c6));
    ring(p,'spiral layers',.012,.026,.0465,clothP(0xb6b3a1));
    p.box('unrolled end',[-.030,.001,.010,.030,.005,.074],clothP(0xd9d8c6));
  } else if (/saline|sunscreen/.test(id)) {
    const base=plasticP(id==='saline'?0xd3ddc9:0xb4914a);
    bevel(p,'squeeze bottle',[-.027,0,-.014,.027,.101,.014],.006,base);
    lid(p,'cap',.014,.097,.021,plasticP(shade(d.color,.84)));
    front(p,'medical label',[-.021,.026,.021,.078],-.015,label(d.color,d.name,d.key));
  } else if (id==='adhesive_bandages') {
    bevel(p,'adhesive strip',[-.039,0,-.010,.039,.0019,.010],.0008,paperP(0xc39b78));
    p.box('absorbent pad',[-.013,.0018,-.007,.013,.003,.007],paperP(0xe7d6bd));
  } else if (id==='gummy_vitamins') {
    const gummy=plasticP(0xb8724e);
    blob(p,'gummy body',[.0064,.004,.0045],[0,.004,.001],gummy,{},3,8);
    blob(p,'gummy head',[.0045,.0028,.004],[0,.003,-.005],gummy,{},3,7);
    for(const x of [-.003,.003]) blob(p,`ear ${x}`,[.0019,.0018,.0019],[x,.003,-.008],gummy,{},3,7);
  } else if (id==='acetaminophen' || id==='ibuprofen') {
    const red=id==='ibuprofen';
    bevel(p,'oblong caplet',[-.009,0,-.0045,.009,.005,.0045],.0022,plasticP(red?0x9e6555:0xdbd5c5));
    if (!red) top(p,'centre score',[-.00045,-.003,.00045,.003],.00525,flat(0xaaa89c));
  } else {
    const paint=plasticP(id==='tums'?0xbbab8c:id==='aspirin'?0xdfdfd5:0x969276);
    cyl(p,'single tablet','y',[0,.003,0],id==='tums'?.0105:.007,.006,12,paint);
    top(p,'score',[-.004,-.0007,.004,.0007],.0064,plasticP(id==='aspirin'?0xb8b8a9:0x787564));
  }
}

export const objects = { kitchen:utensil, groom:grooming, tool:handTool, book:reading, parts, food, money, med:medical };
