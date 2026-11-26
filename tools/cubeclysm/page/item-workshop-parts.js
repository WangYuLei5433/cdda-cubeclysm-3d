import { IcosahedronGeometry, Vector3 } from 'three';
import { barkP, blob, coil, lump, pile, speckle, stoneP, woodP } from './item-kit.js';
import { GLASS, V, bevel, clothP, cyl, fill, flat, front, label, lid, outline, path, plasticP, poly, ring, rubber, shade, steelP, top, tube } from './common-loot-kit.js';

import { cutShape, profile } from './item-workshop-kit.js';

const steel=steelP(0xadb0ab);
const black=plasticP(0x393c42);
const cream=plasticP(0xdcd9c8);
const paper=flat(0xe0d9bf);
const wood=woodP(0xa1845e);
const green=plasticP(0x4f735d);
const glass=flat(0x9dbdbe);

function circuit(p,d) {
  const {id}=d;
  const ram=id==='RAM';
  const bread=id==='breadboard';
  const lcd=id.includes('lcd')||id==='solar_cell';
  const loose=id==='e_scrap';
  if(loose) {
    for(const [x,z,color] of [[-.30,-.14,0xb49563],[-.125,.16,0xa77965],[.177,-.207,0x8b9c8d]]) {
      cyl(p,'loose axial component','x',[x,.046,z],.043,.102,9,plasticP(color));
      for(const side of [-1,1]) tube(p,'bent lead',V(x+side*.045,.044,z),V(x+side*.116,.025,z+.014),.01,.009,7,steel);
    }
    cyl(p,'loose electrolytic capacitor','y',[.244,.075,.153],.057,.15,10,black);
    cyl(p,'capacitor cap','y',[.244,.15,.153],.048,.009,10,steel);
    bevel(p,'chip fragment',[-.09,0,-.32,.06,.051,-.23],.008,black);
    return;
  }
  const w=ram?.45:.383;
  const depth=ram?.116:bread?.241:.312;
  bevel(p,'circuit substrate',[-w,0,-depth,w,.056,depth],.019,bread?cream:green);
  if (lcd) {
    bevel(p,'panel surround',[-.375,.048,-.288,.375,.108,.282],.028,black);
    top(p,'panel glass',[-.329,-.242,.329,.237],.111,flat(id==='solar_cell'?0x526b91:0x46646a));
    if(id==='solar_cell') for(const x of [-.223,-.112,0,.112,.223])
      top(p,'cell divider',[x-.004,-.242,x+.004,.237],.113,steel);
    return;
  }
  const gold=steelP(0xbda46a);
  if(id==='processor') {
    bevel(p,'processor package',[-.212,.043,-.193,.216,.112,.193],.024,black);
    bevel(p,'heat spreader',[-.166,.103,-.149,.172,.157,.15],.021,steel);
    for(const side of [-1,1]) for(let n=0;n<10;n++) {
      const x=-.183+n*.04,z=side*.209;
      p.box('chip contact',[x-.012,.056,z-.024,x+.012,.072,z+.024],gold);
    }
    return;
  }
  if(id==='receiver'||id==='transponder') {
    const receiver=id==='receiver';
    const cover=receiver?steelP(0x9ba7a5):black;
    bevel(p,receiver?'shield can':'transponder chip',[-.283,.047,-.192,.204,.116,.159],.021,cover);
    for(const z of [-.13,-.043,.049,.128])
      cyl(p,'edge contact','x',[.331,.067,z],.021,.121,8,gold);
    if(receiver) cyl(p,'coax port','z',[.23,.104,-.298],.069,.104,10,steel,{open:true});
    else for(const z of [-.212,-.166,-.122,-.075])
      path(p,'printed antenna',[[-.33,.057,z],[-.30,.057,z+.022],[.177,.058,z+.022]],.008,gold);
    return;
  }
  if(id==='amplifier') {
    for(const x of [-.225,.225]) {
      cyl(p,'tall capacitor','y',[x,.117,-.159],.071,.145,10,black);
      cyl(p,'capacitor cap','y',[x,.196,-.159],.065,.012,10,steel);
    }
    p.box('heat sink base',[-.241,.049,-.025,.239,.087,.195],steel);
    for(const x of [-.185,-.093,0,.093,.185]) p.box('heat sink fin',[x-.013,.082,-.023,x+.013,.171,.195],steel);
    for(const x of [-.236,.231]) p.box('terminal block',[x-.056,.045,.203,x+.056,.116,.282],green);
    return;
  }
  const count=ram?5:5+d.key%3;
  for(let i=0;i<count;i++) {
    const x=ram?-.344+i*.165:-.275+(i%3)*.254;
    const z=ram?-.016:-.232+Math.floor(i/3)*.214;
    if (bread) for(let j=0;j<7;j++) {
      const xx=-.35+i*.104, zz=-.177+j*.055;
      top(p,'terminal hole',[xx-.012,zz-.01,xx+.012,zz+.01],.057,black);
    } else {
      const h=.057;
      bevel(p,'integrated component',[x-.059,h,z-.041,x+.051,h+.057,z+.042],.011,plasticP(0x44474c));
      for(const dx of [-.049,-.007,.033]) p.box('circuit pin',[x+dx,h,z+.035,x+dx+.014,h+.021,z+.087],gold);
    }
  }
  if(ram) for(let i=0;i<15;i++) {
    const x=-.388+i*.055;
    top(p,'edge contact',[x,.075,x+.018,.117],.058,gold);
  }
  if(bread) for(const z of [-.208,.206]) top(p,'supply rail',[-.316,z-.009,.315,z+.009],.058,plasticP(z<0?0xad5656:0x708aac));
}

function electronics(p,d) {
  const {id,shape,color}=d;
  const shell=plasticP(color);
  if(shape==='board'||/amplifier$|^receiver$/.test(id)) return circuit(p,d);
  if(shape==='drive') {
    const usb=id==='usb_drive_older';
    const w=usb?.128:.303;
    if(usb) bevel(p,'data case',[-w,0,-.38,w,.087,.323],.023,shell);
    else cutShape(p,'beveled memory card',[[-w,-.38],[.157,-.38],[w,-.236],[w,.328],[-w,.328],[-w,.087],[-.259,.044],[-w,.008]],.070,shell);
    if (usb) {
      p.box('USB connector',[-.096,.014,-.482,.096,.078,-.377],steel);
      for(const x of [-.048,.041]) top(p,'retaining hole',[x-.021,-.457,x+.021,-.415],.079,black);
    } else {
      for(let k=0;k<7;k++) {
        const x=-.224+k*.066;
        top(p,'gold card contact',[x,-.354,x+.036,-.235],.071,steelP(0xc8aa60));
      }
      const science=id.endsWith('science');
      top(p,'memory card sticker',[-.247,-.14,.247,.261],.072,science?(ctx,x,y,w,h)=>{
        fill(ctx,x,y,w,h,0x475b60);
        ctx.fillStyle='#e5dfce';
        ctx.textAlign='center';
        ctx.font=`bold ${Math.max(5,Math.floor(h*.29))}px monospace`;
        ctx.fillText('XEDRA',x+w*.50,y+h*.38,w*.87);
        ctx.font=`${Math.max(4,Math.floor(h*.16))}px monospace`;
        ctx.fillText('093684225108',x+w*.50,y+h*.76,w*.87);
      }:label(color,'MEMORY',d.key));
    }
    return;
  }
  if(shape==='radio'||shape==='power') {
    const game=id==='portable_game';
    const amp=id==='amplifier_head';
    const smallRadio=id==='radio';
    const h=game?.142:amp?.244:.34;
    const z=game?.225:.305;
    bevel(p,'enclosure',[-.427,0,-z,.427,h,z],.047,shell);
    const speaker=id==='stereo'||smallRadio;
    if (game) {
      bevel(p,'screen',[-.244,h-.012,-.164,.211,h+.022,.138],.017,plasticP(0x566e73));
      p.box('direction buttons',[-.361,h,-.065,-.27,h+.023,.045],black);
      for(const zz of [-.063,.042]) cyl(p,'action button','y',[.318,h+.016,zz],.037,.033,8,black);
    } else if(speaker||amp) {
      if(id==='stereo') {
        for(const x of [-.302,.302]) {
          cyl(p,'speaker surround','z',[x,.163,-z-.01],.119,.037,13,black);
          cyl(p,'speaker cone','z',[x,.163,-z-.03],.085,.017,12,steel);
          cyl(p,'speaker dust cap','z',[x,.163,-z-.043],.042,.019,10,black);
        }
        front(p,'receiver display',[-.126,.177,.126,.237],-z-.003,label(0x436066,'STEREO',d.key));
        for(const x of [-.055,.058]) cyl(p,'knob','z',[x,.101,-z-.018],.033,.044,9,black);
        return;
      }
      for(let k=0;k<6;k++) front(p,'speaker slit',[-.344,.068+k*.031,smallRadio?.08:.347,.082+k*.031],-z-.002,black);
      if(smallRadio) path(p,'radio antenna',[[.32,h,.04],[.33,h+.12,.15],[.34,h+.26,.285]],.016,steel);
      for(const x of [smallRadio?.235:-.29,.29]) cyl(p,'knob','z',[x,h-.054,-z-.011],.043,.045,9,steel);
    } else {
      front(p,'voltage and status',[-.343,h*.60,.052,h*.81],-z-.002,label(0x456263,d.name,d.key));
      for(const x of [.14,.27]) cyl(p,'socket recess','z',[x,.145,-z-.002],.047,.023,10,black);
      for(const x of [-.32,-.24,-.16]) front(p,'air vent',[x,.085,x+.042,.162],-z-.004,black);
      if(id==='power_station_portable') path(p,'handle',[[-.168,h,0],[-.135,h+.092,0],[.135,h+.092,0],[.168,h,0]],.025,black);
      if(id==='recharge_station') {
        for(const x of [-.176,.176]) {
          bevel(p,'battery docking pads',[x-.137,h-.027,-.197,x+.137,h+.005,.174],.016,black);
          for(const z of [-.127,.131]) p.box('charging contact',[x-.065,h-.012,z-.014,x+.065,h+.018,z+.014],steel);
        }
      } else if(id==='power_supply') {
        for(const x of [-.32,-.227,-.13,-.033,.066,.165,.264]) top(p,'case louvers',[x,-.149,x+.035,.209],h+.001,black);
      }
    }
    return;
  }
  if(id==='element') {
    coil(p,'steel-sheathed heating element',.371,.028,2.1,ironPaint(),{},id);
    for(const x of [-.14,.12]) tube(p,'insulated terminal',V(x,.026,.213),V(x,.029,.424),.026,.022,10,cream);
    return;
  }
  if(id==='light_bulb') {
    blob(p,'glass bulb',[.28,.268,.296],[0,.27,-.162],glass,GLASS,4,11);
    cyl(p,'white bulb base','z',[0,.252,.134],.154,.19,12,cream);
    for(const z of [.246,.284,.324,.363]) cyl(p,'threaded contact','z',[0,.25,z],.116+(z%.03),.036,12,steel);
    return;
  }
  if(id==='tuning_pegs') {
    tube(p,'metal spindle',V(-.42,.082,0),V(.36,.082,0),.043,.043,9,steel);
    bevel(p,'turning key',[.02,0,-.18,.299,.123,.18],.051,shell);
    return;
  }
  const motor=id==='motor_micro';
  cyl(p,'component body','x',[0,.189,0],motor?.183:.113,.498,12,motor?steel:cream);
  cyl(p,'terminal collar','x',[.249,.189,0],motor?.151:.105,.082,10,black);
  for(const z of (motor?[0]:[-.059,.059])) tube(p,'contact',V(.264,.188,z),V(.445,.188,z),.019,.019,7,steel);
}

const ironPaint = () => steelP(0x767a7b);

function electrical(p,d) {
  const {id}=d;
  const hose=id==='hose_garden';
  const rope=id.startsWith('rope'), wire=id.endsWith('_wire');
  const h=hose?.041:rope?.038:wire?.018:.026;
  const paint=hose?plasticP(0x59784e):rope?clothP(0xab9265):wire?steel:rubber;
  if (id==='antenna') {
    tube(p,'copper antenna',V(-.44,.034,0),V(.39,.034,.012),.035,.018,8,steelP(0xb37753));
    cyl(p,'mount','x',[.39,.041,.014],.064,.093,9,steel);
    return;
  }
  const turns=rope?(id==='rope_30'?3.12:1.55):id==='hd_tow_cable'?2.8:2.15;
  coil(p,'coiled length',.38,h,turns,paint,{},id);
  if (wire || rope) {
    if(rope) for(const x of [-.114,.112]) p.box('coiled rope tie',[x-.021,.032,-.379,x+.021,.112,-.278],clothP(0x6a654a));
    return;
  }
  for(const [i,x] of [[0,-.28],[1,.29]]) {
    if(id==='jumper_cable'||id==='hd_tow_cable') {
      const handle=id==='jumper_cable'?plasticP(i?0x9a5751:0x43474a):steel;
      path(p,'lead terminal',[[x,.043,.095],[x*.95,.062,.234],[x*.89,.072,.373],[x*.73,.074,.406]],.042,handle);
      path(p,'terminal jaw',[[x,.044,.235],[x*1.118,.044,.35],[x*.791,.044,.405]],.025,steel);
    } else {
      cyl(p,'connector shell','z',[x,h+.022,.286],h*1.45,.16,9,black);
      if(id==='cable_xlr') for(const xOff of [-.014,0,.014]) {
        cyl(p,'three-pin connector','z',[x+xOff,h+.022+Math.abs(xOff)*.64,.387],.008,.073,7,steel);
      } else {
        cyl(p,'end plug','z',[x,h+.022,.372],h*1.03,.055,9,hose?steelP(0xbb9e65):steel);
      }
    }
  }
}

function utility(p,d) {
  const {id,shape,color}=d;
  const paint=plasticP(color);
  if (shape==='umbrella') {
    const collapsed=id==='teleumbrella';
    cyl(p,'folded canopy','z',[0,.078,-.064],collapsed?.154:.087,collapsed?.62:.66,12,clothP(color),{},.057);
    tube(p,'metal tip',V(0,.078,-.364),V(0,.078,-.462),.026,.012,8,steel);
    path(p,'hook handle',[[0,.074,.28],[.005,.074,.414],[.094,.074,.45],[.146,.074,.391]],.038,rubber);
    p.box('canopy tie',[-.076,.122,-.057,.078,.145,.026],clothP(shade(color,.77)));
    return;
  }
  if (shape==='frame') {
    const pallet=id==='pallet', ladder=id.includes('stepladder'), table=id==='tourist_table';
    const body=pallet?wood:steel;
    for(const x of [-.261,.261]) p.box('longitudinal rail',[x-.043,0,-.448,x+.043,.079,.448],body);
    const slats=pallet?5:ladder?6:id==='frame'?3:9;
    for(let k=0;k<slats;k++) {
      const z=-.39+k*.78/(slats-1);
      const depth=pallet?.066:ladder?.032:.013;
      p.box('crosspiece',[-.377,.074,z-depth,.377,.114,z+depth],body);
    }
    if (id==='frame') {
      for(const x of [-.264,.264]) p.box('formed box rail',[x-.056,.035,-.438,x+.056,.124,.439],ironPaint());
      for(const z of [-.353,.343]) bevel(p,'flared crossmember',[-.371,0,z-.043,.37,.147,z+.044],.018,steel);
    }
    if(ladder) for(const side of [-1,1]) {
      const x=side*.263;
      p.box('folded rear ladder rail',[x-.031,.085,-.422,x+.031,.132,.377],ironPaint());
      bevel(p,'hinge cap',[x-.056,.038,-.44,x+.056,.164,-.336],.022,plasticP(0x777f83));
      p.box('rubber safety foot',[x-.047,.003,.377,x+.047,.101,.457],black);
    }
    if (table) {
      bevel(p,'folded table slab',[-.38,.107,-.44,.38,.155,.44],.023,paint);
      p.box('fold hinge',[-.38,.136,-.011,.38,.164,.012],steel);
    }
    if(pallet) for(const z of [-.32,0,.32]) p.box('skid',[-.378,0,z-.061,.378,.084,z+.061],wood);
    return;
  }
  if (id==='water_faucet') {
    lid(p,'mounting flange',.245,0,.066,steel);
    path(p,'cast faucet spout',[[0,.06,.07],[0,.336,.09],[0,.495,-.026],[0,.501,-.219],[0,.38,-.31]],.077,steel);
    cyl(p,'aerator','y',[0,.356,-.311],.084,.075,10,steel);
    tube(p,'cross handle',V(-.215,.425,.105),V(.215,.425,.105),.034,.034,8,steel);
    return;
  }
  if(id==='hand_pump') {
    cyl(p,'pump body','z',[0,.105,.028],.105,.56,12,paint);
    cyl(p,'piston rod','z',[0,.105,.308],.032,.24,9,steel);
    tube(p,'T grip',V(-.169,.105,.427),V(.169,.105,.427),.038,.038,9,rubber);
    path(p,'air hose',[[0,.104,-.24],[-.182,.078,-.349],[-.30,.048,-.224],[-.302,.044,.028]],.026,rubber);
    return;
  }
  bevel(p,'pump foot',[-.29,0,-.29,.29,.086,.29],.035,ironPaint());
  cyl(p,'cast pump body','x',[.04,.221,0],.191,.412,12,paint);
  cyl(p,'impeller cover','x',[-.193,.221,0],.201,.085,12,steel);
  cyl(p,'coupling','z',[.102,.23,-.173],.087,.283,10,ironPaint(),{open:true});
}

function stock(p,d) {
  const {shape,id,color}=d;
  const tint=plasticP(color);
  if(shape==='metal'||shape==='stone'||shape==='rubber') {
    const metal=shape==='metal', stone=shape==='stone';
    const gem=id==='citrine'||id==='malachite';
    const fragments=id==='shredded_rubber'||id==='copper';
    if(gem) {
      cyl(p,'faceted lower stone','y',[0,.135,0],.17,.27,7,tint,{},.396);
      cyl(p,'faceted crown','y',[0,.34,0],.396,.14,7,plasticP(shade(color,1.11)),{},.25);
      return;
    }
    if(fragments) for(const [x,z] of [[-.23,-.23],[.18,-.16],[-.15,.19],[.24,.196]]) {
      lump(p,'material fragments',[.18,.098,.16],metal?steelP(color):rubber,id+x,{},[x,0,z]);
    } else lump(p,'rough fragment',[.429,metal?.225:id==='field_stone'?.15:.208,.331],metal?steelP(color):stone?stoneP(color):rubber,id);
    return;
  }
  if(shape==='sheet'||shape==='wood'||shape==='block') {
    const clear=/glass|polycarbonate|rigid_plastic/.test(id);
    const plywood=id==='wood_sheet', foam=id.includes('styrofoam'), brick=id==='brick', screen=id==='screen_mesh';
    const h=plywood?.009:id==='steel_plate'?.039:id==='glass_sheet'?.008:id==='tempered_glass_sheet'?.013
      :clear?.019:foam?.033:shape==='wood'?.131:shape==='block'?.23:.013;
    const z=plywood?.22:brick?.219:.337;
    if(screen) {
      cyl(p,'rolled screen','x',[0,.089,.20],.089,.87,12,steel,{open:true});
      for(let x=-.41;x<=.43;x+=.04) p.box('mesh weft',[x,0,-.28,x+.01,.015,.23],steel);
      for(let z=-.28;z<.23;z+=.046) p.box('mesh warp',[-.42,.006,z,.43,.022,z+.01],steel);
      return;
    }
    const tint=id==='tempered_glass_sheet'?0x86afaa:id==='rigid_plastic_sheet'?0xb4cbd0:id==='polycarbonate_sheet'?0xa2ada1:0xa4c6c4;
    const paint=clear?flat(tint):shape==='wood'?wood:brick?stoneP(0xa26c54):foam||id.startsWith('wax')?cream:steelP(color);
    bevel(p,'stock material',[-.44,0,-z,.44,h,z],Math.min(h*.30,.018),paint,clear?GLASS:{});
    if(clear) {
      const reflection=flat(shade(tint,1.18));
      for(const x of [-.297,.252]) top(p,'edge glint',[x-.076,-z+.045,x+.076,-z+.058],h+.0008,reflection,GLASS);
    }
    return;
  }
  if(shape==='log') {
    cyl(p,'bark','x',[0,.154,0],.154,.86,14,barkP(0x78614b),{},.132);
    for(const x of [-.434,.434]) {
      cyl(p,'cut end grain','x',[x,.154,0],x<0?.151:.133,.015,14,wood);
      for(const r of [.055,.093]) cyl(p,'growth ring','x',[x*1.017,.154,0],r,.003,12,woodP(r>.06?0xb49360:0xc2a274));
    }
    return;
  }
  if(shape==='cloth') {
    const h=.036;
    const paint=clothP(color);
    if(id==='rock_wool_bat') {
      const foil=steelP(0xb2b6af);
      const exposed=speckle(id,0xb8a980,[0xa1926e,0xd4c4a0,0x918466],.58);
      bevel(p,'insulation batt',[-.429,0,-.312,.429,.135,.31],.025,exposed);
      bevel(p,'foil facing',[-.421,.112,-.304,.421,.147,.312],.014,foil,{metal:true});
      for(const x of [-.406,.405]) p.box('wrapped foil edge',[x-.020,.056,-.309,x+.020,.136,.307],foil,{metal:true});
      return;
    }
    if(id==='scrap_cotton') for(const [x,z] of [[-.19,-.21],[.12,.133],[.15,-.18]]) {
      outline(p,'irregular tailor offcut',[[x-.18,z-.11],[x+.05,z-.205],[x+.218,z-.043],[x+.123,z+.22],[x-.216,z+.14]],.031,clothP(shade(color,.97+x)),x>0?.016:0);
    } else if(id==='tanned_pelt') {
      const edge=[[-.166,-.38],[.133,-.37],[.104,-.237],[.311,-.302],[.405,-.172],[.304,-.047],[.276,.112],[.407,.245],[.321,.36],[.122,.265],[.009,.409],[-.054,.336],[-.139,.259],[-.312,.361],[-.393,.233],[-.264,.103],[-.285,-.046],[-.397,-.165],[-.305,-.284],[-.131,-.224]];
      cutShape(p,'irregular tanned hide',edge,.035,clothP(0x8c7158));
      top(p,'folded fur side',[-.136,-.21,.138,.251],.038,speckle(id,0x957c60,[0x806851,0xb29572],.47));
    } else {
      bevel(p,'folded fiber or fabric',[-.43,0,-.31,.43,h,.32],.018,paint);
      for(const z of [-.28,.12,.28]) path(p,'textile edge',[[-.42,h,z],[-.003,h+.011,z],[.42,h,z]],.007,paint);
    }
    return;
  }
  if(shape==='pipe') {
    if(id==='rebar') {
      cyl(p,'bar','x',[0,.042,0],.040,.88,12,ironPaint());
      for(let x=-.41;x<.43;x+=.064) cyl(p,'bar rib','x',[x,.047,0],.047,.018,9,steel);
    } else if(id==='pipe_fittings') {
      for(const x of [-.229,.229]) {
        cyl(p,'coupler','y',[x,.103,0],.174,.207,10,steel,{open:true});
        ring(p,'coupler rim',.123,.181,.211,steel,[x,0],10);
      }
      cyl(p,'tee side','x',[-.112,.101,0],.092,.18,9,steel,{open:true});
      cyl(p,'end cap','y',[.053,.061,.26],.108,.119,10,steel);
      ring(p,'hex end cap rim',.075,.115,.122,steel,[.053,.26],6);
    } else {
      for(const y of [0,.162]) p.box('I beam flange',[-.45,y,-.133,.45,y+.039,.133],steel);
      p.box('I beam web',[-.45,.039,-.023,.45,.164,.023],ironPaint());
    }
    return;
  }
  if(shape==='disc') {
    if(id==='bearing') blob(p,'steel ball',[.437,.437,.437],[0,.437,0],steel,{},4,12);
    else {
      const h=id.includes('grinding')?.099:.029;
      cyl(p,'abrasive edge','y',[0,h/2,0],.42,h,16,ironPaint(),{open:true});
      ring(p,'abrasive face',.075,.42,h,stoneP(0x565156),[0,0],16);
      ring(p,'mount ring',.049,.136,h+.009,steel,[0,0],12);
    }
    return;
  }
  if(shape==='fiber') {
    const plant=id==='plant_fibre';
    const tinder=id==='tinder';
    const color=plant?0xa09b73:tinder?0x937452:0xc3a366;
    pile(p,'loose bundle',tinder?.353:.422,tinder?.102:.16,woodP(color),id);
    for(let k=0;k<12;k++) {
      const x=-.29+k*.047, z=-.14+(k*13%11)*.026;
      path(p,'individual fiber',[[x,.051,z-.14],[x+.045,.117,z],[x+.13,.064,z+.19]],.012,woodP(shade(color,.80+k*.03)));
    }
    return;
  }
  if (id==='snapfastener_steel') {
    for(const x of [-.204,.204]) {
      cyl(p,'press stud','y',[x,.044,0],.176,.088,12,steel);
      ring(p,'snap rim',.062,.133,.094,steel,[x,0],12);
    }
  } else if(id==='drivebelt'||id==='seatbelt') {
    for(const r of [.22,.29,.37]) ring(p,'rolled strap',r-.053,r,.069,id==='drivebelt'?rubber:clothP(0x565658),[0,0],14);
    cyl(p,'belt core','y',[0,.028,0],.241,.056,14,rubber);
    if(id==='seatbelt') {
      bevel(p,'latch hardware',[.19,.061,-.114,.419,.124,.102],.021,steel);
      top(p,'release button',[.233,-.067,.357,.051],.126,plasticP(0xa5524e));
    }
  } else {
    p.box('zip tape',[-.44,0,-.103,.44,.029,.103],clothP(color));
    for(let k=0;k<20;k++) {
      const x=-.412+k*.043;
      p.box('interlocking tooth',[x,.027,-.029,x+.025,.054,.03],tint);
    }
    bevel(p,'slider',[-.43,.046,-.062,-.295,.092,.062],.021,steel);
  }
}

function wheel(p,d) {
  const {id}=d;
  const bicycle=id==='wheel_bicycle', metal=id==='wheel_metal';
  const depth=id==='wheel_wide'?.492:bicycle?.12:id==='wheel_motorbike'?.201:id==='wheel_small'?.271:.315;
  const axleV=depth/2;
  const radius=.445, rim=bicycle?.384:id==='wheel_small'?.22:id==='wheel_motorbike'?.328:.286, y=radius;
  cyl(p,'outer tire','z',[0,y,0],radius,depth,18,metal?steel:rubber,{open:true});
  for(const s of [-1,1]) {
    cyl(p,'rim wall','z',[0,y,s*axleV],rim,.023,18,steel,{open:true});
    for(let k=0;k<18;k++) {
      const a=k*Math.PI/9,b=(k+1)*Math.PI/9;
      const q=(r,t)=>V(Math.cos(t)*r,y+Math.sin(t)*r,s*axleV);
      poly(p,'tire sidewall',[q(rim,a),q(radius,a),q(radius,b),q(rim,b)],V(0,0,s),metal?steel:rubber);
    }
  }
  const spokes=bicycle?12:id==='wheel_motorbike'?8:6;
  for(let k=0;k<spokes;k++) {
    const a=k*Math.PI*2/spokes;
    tube(p,'spoke',V(0,y,0),V(Math.cos(a)*rim,y+Math.sin(a)*rim,0),bicycle?.012:.036,bicycle?.010:.026,7,steel);
  }
  cyl(p,'hub','z',[0,y,0],.097,depth*.86,11,steel);
  if(!metal) for(let k=0;k<18;k++) {
    const a=k*Math.PI/9;
    const parent=p.group('tread',{at:[Math.cos(a)*.428,y+Math.sin(a)*.428,0],rotZ:a});
    p.box('raised tread',[-.013,-.026,-axleV*.83,.021,.026,axleV*.83],plasticP(0x454647),{parent});
  }
}

function battery(p,d) {
  const lead=d.id==='battery_car';
  const w=d.id==='small_storage_battery'?.28:.428;
  const paint=plasticP(lead?0x535456:d.color);
  bevel(p,'battery casing',[-w,0,-.268,w,.431,.268],.041,paint);
  bevel(p,'molded terminal cover',[-w-.011,.396,-.275,w+.011,.463,.275],.028,plasticP(shade(d.color,.70)));
  for(const x of [-w*.66,w*.66]) cyl(p,'post','y',[x,.5,-.097],.051,.083,10,x>0?steelP(0xb66d63):steel);
  front(p,'rating label',[-w*.76,.099,w*.76,.331],-.269,label(d.color,lead?'12 V':'STORAGE',d.key));
}

function printed(p,d) {
  const {id,shape,color}=d;
  const note=shape==='note', map=shape==='map', tri=shape==='brochure';
  const pink=id.endsWith('_migo')?0xe2a9b8:id.endsWith('_portal')?0xd59463:color;
  const h=tri?.047:.017;
  const w=map?.44:note?.37:.32;
  const z=map?.33:note?.37:.44;
  bevel(p,'paper or card stock',[-w,0,-z,w,h,z],.006,note?plasticP(pink):paper);
  if (tri) for(const x of [-w*.978,w*.978]) p.box('folded paper edge',[x-.012,h-.012,-z,x+.012,h+.012,z],paper);
  top(p,'printed face',[-w*.94,-z*.93,w*.94,z*.94],h+.002,(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,note?pink:id==='gift_card'?color:0xe5dbbd);
    if(note) return;
    const ink=shade(color,.67);
    if(map) {
      for(let k=0;k<9;k++) fill(ctx,x+(k*17%81)*w/100,y+(k*13%74)*h/100,w*.22,h*.14,k%2?0xa9b18a:0xccbc91);
      for(let k=0;k<24;k++) fill(ctx,x+w*k/24,y+h*(.33+.19*Math.sin(k*.28)),w/22,Math.max(1,h*.06),ink);
      return;
    }
    if(id==='character_sheet') {
      fill(ctx,x+w*.10,y+h*.083,w*.79,h*.075,0x9b795b);
      for(let i=0;i<6;i++) {
        const bx=x+w*.10+(i%2)*w*.19, by=y+h*.22+Math.floor(i/2)*h*.15;
        fill(ctx,bx,by,w*.152,h*.124,0xa29882);
        fill(ctx,bx+w*.016,by+h*.017,w*.119,h*.09,0xe7ddc3);
        fill(ctx,bx+w*.052,by+h*.068,w*.043,h*.018,0x6f635c);
      }
      for(let n=0;n<9;n++) fill(ctx,x+w*.51,y+h*(.22+n*.052),w*.32,h*.012,0x92816b);
    } else if(id==='godco_flier') {
      fill(ctx,x+w*.13,y+h*.11,w*.72,h*.53,0x6f8c94);
      fill(ctx,x+w*.36,y+h*.34,w*.31,h*.058,0x8f6f54);
      fill(ctx,x+w*.43,y+h*.27,w*.18,h*.08,0x9a7d5b);
      fill(ctx,x+w*.42,y+h*.4,w*.19,h*.044,0x6b5749);
      for(let k=0;k<4;k++) fill(ctx,x+w*.19,y+h*(.465+k*.038),w*.59,h*.016,0xa9bdaf);
    } else if(tri) {
      const palette={touristmap:0x537977,mallbrochure:0x627d95,restaurantbrochure:0xa26b58,furniturebrochure:0x858653};
      const title={touristmap:'VISIT',mallbrochure:'SHOPS',restaurantbrochure:'DINING',furniturebrochure:'HOME'};
      const panel=palette[id]??color;
      label(panel,title[id]??d.name,d.key)(ctx,x+w*.098,y+h*.096,w*.80,h*.37);
      for(let k=0;k<3;k++){
        const bx=x+w*(.13+k*.255);
        fill(ctx,bx,y+h*.53,w*.20,h*.136,shade(panel,1.19));
        fill(ctx,bx,y+h*.70,w*.19,h*.023,shade(panel,.70));
      }
    } else if (id==='missing_poster_dog') {
      ctx.font=`bold ${Math.max(5,Math.floor(w*.12))}px monospace`;
      ctx.fillStyle='#514945';
      ctx.fillText('MISSING',x+w*.13,y+h*.13,w*.76);
      fill(ctx,x+w*.13,y+h*.21,w*.74,h*.49,0x919681);
      fill(ctx,x+w*.30,y+h*.39,w*.42,h*.18,0xb68e64);
      fill(ctx,x+w*.63,y+h*.29,w*.15,h*.18,0xb68e64);
      fill(ctx,x+w*.65,y+h*.25,w*.06,h*.095,0x7d614b);
      fill(ctx,x+w*.35,y+h*.55,w*.065,h*.099,0x785e4b);
      fill(ctx,x+w*.59,y+h*.55,w*.065,h*.099,0x785e4b);
      fill(ctx,x+w*.73,y+h*.342,w*.041,h*.027,0x615345);
    } else if(id==='sketch') {
      for(let j=0;j<17;j++) {
        const step=j/17;
        const lineY=y+h*(.68-.33*Math.sin(step*2.46));
        fill(ctx,x+w*(.16+step*.62),lineY,w*.049,h*.023,0x68645f);
        fill(ctx,x+w*(.16+step*.62),lineY+h*.035,w*.039,h*.01,0xa69f91);
      }
    } else if(id==='family_photo') {
      fill(ctx,x+w*.14,y+h*.17,w*.72,h*.56,id==='sketch'?0xbcbaa9:0x92a189);
      for(let j=0;j<3;j++){
        fill(ctx,x+w*(.26+j*.17),y+h*(.27+j%2*.07),w*.07,h*.09,0xcbb096);
        fill(ctx,x+w*(.24+j*.17),y+h*(.36+j%2*.07),w*.11,h*.21,shade(color,1+j*.13));
      }
    } else {
      label(color,d.name,d.key)(ctx,x+w*.064,y+h*.10,w*.87,h*(shape==='sheet'?.35:.51));
      if(id==='valentine_card') {
        for(const dx of [.35,.52]) fill(ctx,x+w*dx,y+h*.58,w*.14,h*.12,0xa6535d);
        fill(ctx,x+w*.43,y+h*.69,w*.15,h*.15,0xa6535d);
      }
    }
    if(id!=='valentine_card') for(let k=0;k<4;k++)
      fill(ctx,x+w*.14,y+h*(.76+.05*k),w*(.57-k*.08),Math.max(1,h*.015),ink);
  });
}

function plush(p,d) {
  const bear=d.id==='teddy_bear';
  const fabric=clothP(bear?0xa98767:0x718d9d);
  if(bear) {
    blob(p,'stuffed body',[.19,.244,.138],[0,.233,0],fabric,{},4,10);
    blob(p,'head',[.215,.182,.146],[0,.492,-.04],fabric,{},4,10);
    for(const x of [-.157,.157]) {
      blob(p,'ear',[.081,.086,.055],[x,.632,-.04],fabric,{},3,8);
      blob(p,'paw',[.106,.12,.14],[x*1.10,.115,-.085],fabric,{},4,9);
      blob(p,'arm',[.073,.145,.107],[x*1.31,.276,-.01],fabric,{},4,9);
      blob(p,'eye',[.026,.031,.012],[x*.58,.532,-.176],black,{},3,6);
    }
    blob(p,'muzzle',[.099,.064,.057],[0,.468,-.172],clothP(0xc2a288),{},3,8);
    blob(p,'nose',[.033,.023,.021],[0,.488,-.219],black,{},3,7);
    return;
  }
  blob(p,'plush shark body',[.215,.16,.41],[0,.16,-.076],fabric,{},4,12);
  blob(p,'white belly',[.174,.075,.36],[0,.105,-.077],clothP(0xe0dbca),{},4,10);
  outline(p,'forked fabric tail',[[-.035,.244],[-.19,.42],[-.063,.443],[.005,.368],[.133,.45],[.201,.39],[.034,.245]],.047,fabric,.120);
  for(const s of [-1,1]) {
    outline(p,'side fin',[[.124,-.139],[.39,.04],[.31,.093],[.11,.069]].map(([x,z])=>[s*x,z]),.044,fabric,.092);
    blob(p,'button eye',[.029,.028,.028],[s*.157,.217,-.353],black,{},3,7);
  }
  const fin=[[0,.233,-.10],[0,.402,.038],[0,.246,.146]].map(v=>V(...v));
  poly(p,'dorsal fin',fin,V(1,0,0),fabric);
  poly(p,'dorsal fin reverse',fin.toReversed(),V(-1,0,0),fabric);
}

function ball(p,d) {
  const id=d.id;
  const football=id==='football', baseball=id==='baseball', basketball=id==='basketball';
  const color=({football:0x9a664b,baseball:0xe0dacc,basketball:0xbb7a49,golf_ball:0xe9e4d5,pool_ball:0xa85548,bowling_ball:0x465875,marble:0x72938d})[id]??d.color;
  const r=football?.25:.434;
  const ry=football?.216:.433;
  const rz=football?.45:.434;
  const golf=id==='golf_ball';
  const surface=golf?(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0xe3e0d3);
    for(let a=1;a<w;a+=5) for(let b=1;b<h;b+=5){
      fill(ctx,x+a,y+b,2,2,0xa5a69e);
      fill(ctx,x+a+1,y+b+2,2,1,0xf6f2e4);
    }
  }:plasticP(color);
  blob(p,'ball body',[r,ry,rz],[0,ry,0],surface,id==='marble'?GLASS:{},golf?6:5,14);
  if(id==='marble') {
    path(p,'internal glass ribbon',[[-.221,.133,.041],[-.142,.293,-.055],[-.079,.583,.034],[.181,.714,.105]],.047,plasticP(0x6f9aa2));
  }
  if(football) {
    path(p,'lace strip',[[0,.394,-.193],[0,.431,0],[0,.394,.193]],.015,cream);
    for(let k=0;k<6;k++) tube(p,'cross lace',V(-.035,.431-Math.abs(k-2.5)*.006,(k-2.5)*.051),V(.035,.431-Math.abs(k-2.5)*.006,(k-2.5)*.051),.009,.009,7,cream);
  } else if (baseball||basketball) {
    const seam=plasticP(baseball?0x965c54:0x5d443c);
    for(const s of [-1,1]) {
      const points=Array.from({length:17},(_,k)=>{
        const a=k*Math.PI/8;
        const x=(baseball?Math.sin(a*2)*.125+s*.072:s*.095);
        const offset=Math.sqrt(r*r-x*x);
        return [x,ry+Math.cos(a)*offset,Math.sin(a)*offset];
      });
      path(p,'ball seam',points,baseball?.009:.014,seam);
    }
  } else if(id==='pool_ball') {
    cyl(p,'white number inset','y',[0,ry*1.95,0],.093,.027,12,cream);
    top(p,'ball number',[-.064,-.048,.064,.048],ry*1.985,label(0xe8dec6,'3',d.key));
  } else if(id==='bowling_ball') {
    for(const [x,z] of [[-.135,-.095],[.136,-.087],[.007,.137]])
      cyl(p,'finger hole','y',[x,ry*1.89,z],.049,.019,10,black);
  }
}

function tabletop(p,d) {
  const card=d.id==='deck_of_cards';
  const chess=d.id.includes('chess'), checkers=d.id.includes('checkers');
  const h=card?.15:.23, z=card?.37:.31, x=card?.26:.42;
  if(card) {
    for(let n=0;n<8;n++) bevel(p,'card stack',[-.233+n*.004,n*.014,-.365,.233+n*.004,.019+n*.014,.365],.007,cream);
    top(p,'printed playing card back',[-.206,-.323,.230,.323],.119,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0xdfd4bc);
      fill(ctx,x+w*.08,y+h*.05,w*.84,h*.90,0x7e535a);
      for(let j=0;j<5;j++) for(let i=0;i<5;i++) if((i+j)%2===0) fill(ctx,x+w*(.16+i*.143),y+h*(.11+j*.155),w*.073,h*.09,0xb77b77);
    });
    return;
  }
  if(d.id==='mahjong') {
    const shell=plasticP(0x547962), ink=flat(0x8e514c);
    bevel(p,'tile storage box',[-.435,0,-.322,.435,.075,.322],.027,shell);
    p.box('box rear lip',[-.432,.052,.293,.434,.133,.326],shell);
    for(const x of [-.417,.417]) p.box('box side',[x-.024,.052,-.31,x+.024,.139,.308],shell);
    for(let i=0;i<5;i++) for(let j=0;j<2;j++) {
      const x=-.293+i*.14,z=-.135+j*.206;
      bevel(p,'engraved mahjong tile',[x-.056,.065,z-.081,x+.056,.149,z+.081],.009,cream);
      for(let n=0;n<1+(i+j)%3;n++) top(p,'tile dots',[x-.013,z-.049+n*.030,x+.014,z-.029+n*.030],.150,ink);
    }
    bevel(p,'folded rule booklet',[-.271,.083,.208,.272,.11,.311],.006,paper);
    top(p,'rule booklet cover',[-.198,.219,.207,.301],.111,label(0x628476,'RULES',d.key));
    return;
  }
  const board=chess?woodP(0x745947):wood;
  bevel(p,'game box',[-x,0,-z,x,h,z],.031,board);
  p.box('lid seam',[-x,h*.73,-z-.006,x,h*.77,-z+.004],black);
  top(p,'checkerboard',[-.314,-.262,.314,.262],h+.002,(ctx,x,y,w,h)=>{
    for(let j=0;j<8;j++) for(let i=0;i<8;i++) fill(ctx,x+i*w/8,y+j*h/8,w/8,h/8,(i+j)%2?0x6c5146:0xd0ae80);
  });
  if(chess) {
    for(const [x,z,paint] of [[-.198,-.139,cream],[.166,.152,black]]) {
      profile(p,'turned chess king',[[0,h],[.052,h],[.052,h+.025],[.033,h+.06],[.025,h+.139],[.046,h+.16],[.028,h+.178],[0,h+.178]],paint,{at:[x,z],sides:10});
      p.box('king cross',[x-.013,h+.166,z-.009,x+.013,h+.239,z+.01],paint);
      p.box('cross arm',[x-.036,h+.199,z-.009,x+.036,h+.218,z+.01],paint);
      const rx=x+.112;
      profile(p,'rook turret',[[0,h],[.051,h],[.05,h+.028],[.032,h+.065],[.038,h+.109],[.046,h+.14],[0,h+.14]],paint,{at:[rx,z],sides:10});
      for(const dx of [-.028,.028]) p.box('rook crenellation',[rx+dx-.011,h+.135,z-.028,rx+dx+.011,h+.161,z+.027],paint);
    }
  } else if(checkers) for(const [x,z] of [[-.23,-.167],[.17,.14],[-.13,.037],[.029,.094]]) {
    const paint=plasticP(x<0?0xb45e52:0x4d4547);
    cyl(p,'round checkers token','y',[x,h+.025,z],.042,.041,12,paint);
    ring(p,'raised token edge',.028,.041,h+.048,paint,[x,z],12);
  }
}

function die(p,d) {
  const source=new IcosahedronGeometry(.445,0);
  const pos=source.getAttribute('position');
  const normals=source.getAttribute('normal');
  const color=d.id.startsWith('metal')?0x9e9caa:0x986c9b;
  for(let i=0;i<pos.count;i+=3) {
    const coords=[i,i+1,i+2].map(j=>new Vector3().fromBufferAttribute(pos,j));
    const normal=new Vector3().fromBufferAttribute(normals,i);
    const number=(i/3*9)%20+1;
    const paint=(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,i%9===0?shade(color,.86):color);
      ctx.font=`bold ${Math.max(6,Math.floor(Math.min(w,h)*.27))}px monospace`;
      ctx.fillStyle='#eee6cb';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText(String(number),x+w*.63,y+h*.63);
    };
    poly(p,'numbered die face',coords,normal,paint);
  }
  source.dispose();
}

function toy(p,d) {
  const {id,shape,color}=d;
  if(shape==='ball') return ball(p,d);
  if(shape==='plush') return plush(p,d);
  if(shape==='tabletop') return tabletop(p,d);
  if(shape==='die') return die(p,d);
  if(shape==='cone') {
    lid(p,'bowling pin sole',.133,0,.039,cream);
    blob(p,'bowling pin body',[.176,.277,.176],[0,.293,0],cream,{},4,11);
    cyl(p,'narrow neck','y',[0,.575,0],.074,.288,11,cream,{},.078);
    blob(p,'bowling pin head',[.111,.108,.109],[0,.747,0],cream,{},4,10);
    for(const y of [.581,.635]) cyl(p,'red neck stripe','y',[0,y,0],.079,.021,11,plasticP(0xa34f4d));
    return;
  }
  if(shape==='disc') {
    cyl(p,'flying disc','y',[0,.067,0],.438,.111,18,plasticP(color),{},.397);
    ring(p,'ridge',.31,.379,.124,plasticP(shade(color,.77)),[0,0],18);
    return;
  }
  if(id==='golf_tee'){
    cyl(p,'tee shaft','y',[0,.354,0],.033,.697,9,wood,{},.082);
    cyl(p,'ball seat','y',[0,.729,0],.081,.085,10,wood,{},.125);
    return;
  }
  const club=id==='golf_club', cue=id==='pool_cue';
  const handle=id==='bat_metal'||club?steel:id==='bat_nerf'?plasticP(0x5c7997):wood;
  tube(p,'tapered handle',V(0,.083,.442),V(0,.167,club?.31:-.423),.044,club||cue?.021:.109,12,handle);
  if(club) {
    tube(p,'golf shaft',V(0,.078,.37),V(.017,.082,-.353),.026,.031,9,steel);
    bevel(p,'club head',[-.04,.038,-.451,.224,.103,-.326],.022,steel);
  } else {
    cyl(p,'grip butt','z',[0,.084,.436],cue?.043:.062,.064,10,cue?wood:rubber);
    if(cue) cyl(p,'cue tip','z',[0,.168,-.428],.024,.025,10,cream);
  }
}

function home(p,d) {
  const {id,shape,color}=d;
  if(shape==='frame'||shape==='fabric') {
    const frame=shape==='frame', w=frame?.329:.445,z=frame?.44:.295;
    bevel(p,'decorative border',[-w,0,-z,w,.07,z],.023,frame?wood:clothP(color));
    const landscape=(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0x8da7a5);
      for(let k=0;k<w;k++) {
        const ridge=y+h*(.51-.22*Math.cos(k*.37));
        fill(ctx,x+k,ridge,1,h+y-ridge,0x687b70);
      }
      fill(ctx,x,y+h*.73,w,h*.27,0x8a9161);
      fill(ctx,x+w*.64,y+h*.21,w*.12,h*.12,0xe0c99c);
    };
    top(p,'decorative face',[-w*.88,-z*.88,w*.88,z*.88],.071,frame?landscape:label(0x9b865b,'WELCOME',d.key));
    return;
  }
  if(shape==='candlestick'){
    const cup=id==='chalice', brass=steelP(0xb69858);
    lid(p,'turned foot',.268,0,.079,brass);
    cyl(p,'turned stem','y',[0,.311,0],.079,.466,12,brass,{},.10);
    const r=cup?.31:.195;
    profile(p,cup?'gold bowl':'candle cup',[[0,.512],[.113,.512],[r*.66,.567],[r,.777],[r-.023,.798],[r-.05,.777],[.111,.581],[0,.581]],brass,{metal:true});
    return;
  }
  if(shape==='decor'){
    const tint=id==='sculpture_clay'?0xae7659:0x8c8c84;
    bevel(p,'plinth',[-.271,0,-.229,.271,.123,.229],.036,stoneP(tint));
    const figure=stoneP(shade(tint,1.13));
    blob(p,'carved shoulders',[.221,.204,.114],[0,.275,0],figure,{},4,8);
    blob(p,'carved head',[.123,.165,.112],[0,.543,-.005],figure,{},4,8);
    return;
  }
  if(id==='comb_lice') {
    bevel(p,'steel comb spine',[-.439,0,-.159,.439,.058,-.021],.022,steel);
    for(let k=0;k<24;k++) p.box('fine tooth',[-.405+k*.034,.009,-.025,-.391+k*.034,.045,.144],steel);
    return;
  }
  for(const s of [-1,1]) {
    const basePoints=Array.from({length:10},(_,i)=>{
      const a=(i/9-.5)*Math.PI;
      return [Math.sin(a)*.285,.087,-Math.cos(a)*.223+s*.187];
    });
    path(p,'gum arc',basePoints,.053,plasticP(0xb47e80));
    for(const [x,y,z] of basePoints) bevel(p,'denture tooth',[x-.033,y+.018,z-.037,x+.034,y+.084,z+.033],.012,cream);
  }
}

function medical(p,d) {
  const {id,color}=d;
  if(id==='stethoscope') {
    for(const side of [-1,1]) {
      path(p,'ear tube',[[side*.268,.048,-.202],[side*.251,.054,-.311],[side*.166,.047,-.411]],.024,steel);
      blob(p,'ear tip',[.037,.033,.037],[side*.165,.047,-.414],cream,{},3,8);
      path(p,'binaural tubing',[[side*.268,.048,-.202],[side*.29,.044,-.047],[side*.242,.038,.107],[side*.123,.041,.19],[0,.04,.219]],.031,rubber);
    }
    path(p,'main tube',[[0,.04,.219],[.081,.036,.333],[.214,.037,.384],[.337,.037,.309],[.352,.038,.184],[.308,.043,.09]],.029,rubber);
    cyl(p,'chestpiece','y',[.293,.044,.068],.111,.088,14,steel);
    return;
  }
  if(id==='adrenaline_injector'||id==='flu_shot') {
    const injector=id==='adrenaline_injector';
    if(!injector) bevel(p,'sealed sterile packaging',[-.24,0,-.452,.24,.063,.449],.023,paper);
    cyl(p,injector?'trainer-shaped housing':'sealed syringe body','z',[0,.117,.025],.098,.69,12,injector?plasticP(0xe4c36e):cream);
    cyl(p,'protective end','z',[0,.117,-.354],.101,.133,12,plasticP(injector?0x657c98:color));
    return;
  }
  const eye=id==='steroid_eyedrops';
  const r=eye?.225:.233;
  cyl(p,'medical bottle','y',[0,.277,0],r,.554,14,eye?cream:plasticP(id==='inj_iron'?0x9e7c3b:0xa8aeb1),eye?{}:GLASS);
  cyl(p,'tapered shoulder','y',[0,.585,0],r,.069,12,cream,{},.137);
  lid(p,'bottle cap',.141,.604,eye?.208:.105,plasticP(color));
  front(p,'medicine label',[-.119,.133,.119,.391],-r*.98,label(shade(color,.86),eye?'EYE DROPS':id==='inj_iron'?'IRON':'MORPHINE',d.key));
}

export const workshopParts = {
  electronics,electrical,utility,stock,wheel,battery,paper:printed,toy,home,medical,
};
