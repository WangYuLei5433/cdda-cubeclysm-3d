import { woodP } from './item-kit.js';
import { GLASS, V, bevel, clothP, cyl, flat, front, label, lid, outline, path, plasticP, ring, rubber, shade, steelP, top, tube } from './common-loot-kit.js';

import { cutShape, profile } from './item-workshop-kit.js';

const steel=steelP(0x9ea5a5);
const iron=steelP(0x656a6e);
const wood=woodP(0xa27c50);
const cream=plasticP(0xdfdcca);
const dark=plasticP(0x3f4249);

function longHandle(p,d) {
  const {id,shape}=d;
  const short = id==='g_shovel'||id==='hatchet';
  const composite = /plastic|folded|rubber|futuristic/.test(id);
  const head = plasticP(d.color);
  if (shape==='bar') {
    const hooked=id==='crowbar';
    const cast = id==='chisel';
    if(id==='metal_file') {
      for(const [x,w] of [[-.215,.041],[0,.047],[.192,.023]]) {
        bevel(p,'file handle',[x-.069,0,.091,x+.069,.103,.423],.031,wood);
        cutShape(p,'tapered abrasive file',[[x-w,.103],[x+w,.103],[x+w*.44,-.417],[x-w*.49,-.398]],.044,iron,.029);
        for(let n=0;n<9;n++) {
          const z=-.341+n*.045;
          path(p,'abrasive ridges',[[x-w*.49,.073,z],[x+w*.52,.073,z+.013]],.004,steel);
        }
      }
      return;
    }
    if(cast) {
      bevel(p,'solid chisel shaft',[-.079,0,-.235,.079,.117,.425],.028,iron);
      cutShape(p,'flat chisel edge',[[-.067,-.18],[.067,-.18],[.11,-.411],[.099,-.456],[-.1,-.456],[-.111,-.411]],.043,steel,.016);
      return;
    }
    const material=cast||hooked?iron:steel;
    const x=hooked?.033:cast?.076:.048;
    path(p,'steel shaft',[[0,x,-.33],[0,x,-.08],[.004,x,.325]],x,material);
    if (hooked) {
      path(p,'curved end',[[0,x,-.31],[0,x,-.416],[.10,x,-.442],[.16,x,-.374]],.033,material);
      outline(p,'flattened pry tip',[[-.048,.25],[.046,.25],[.067,.458],[-.069,.458]],.025,steel);
    } else {
      cyl(p,'hand grip','z',[0,x,.265],x*.93,.39,10,id==='awl_steel'?wood:dark,{});
      tube(p,'working tip',V(0,x,-.30),V(0,x,-.46),x,x*.26,8,steel);
    }
    return;
  }
  const gripRadius = short?.044:.027;
  const assetGrip = composite?iron:wood;
  const start = shape==='edge'&&id==='sickle'?-.16:shape==='shovel'?-.225:-.30;
  if (shape==='axe') {
    path(p,'curved wooden haft',[[0,.055,start],[-.011,.053,-.141],[-.031,.058,.25],[.01,.057,short?.36:.462]],gripRadius,wood);
  } else if(id==='mop_folded') {
    tube(p,'collapsed mop tube',V(0,.063,-.319),V(0,.063,.442),.028,.028,9,iron);
    cyl(p,'locking sleeve','z',[0,.061,.084],.046,.109,10,head);
    cyl(p,'cap grip','z',[0,.061,.373],.046,.143,10,rubber);
  } else {
    tube(p,'handle',V(0,.062,start),V(0,.05,.455),gripRadius,gripRadius*.8,9,assetGrip);
  }
  if (shape==='shovel') {
    const w=id==='shovel_snow_plastic'?.32:id==='g_shovel'?.12:.128;
    const snow=id==='shovel_snow_plastic';
    const plate = snow ? [[-w,-.24],[-w,-.452],[w,-.452],[w,-.24],[w*.43,-.199],[-w*.43,-.199]]
      : [[-w,-.235],[-w*.96,-.399],[-w*.48,-.464],[0,-.497],[w*.48,-.464],[w*.96,-.399],[w,-.235],[.032,-.197],[-.032,-.197]];
    cutShape(p,'dished shovel head',plate,.029,snow?head:steel);
    tube(p,'socket',V(0,.044,-.18),V(0,.046,-.367),.041,.024,8,snow?head:steel);
    for(const x of [-w*.88,w*.88]) path(p,'raised scoop edge',[[x,.031,-.249],[x,.052,-.381],[x*.79,.043,-.451]],.012,snow?head:steel);
    if(snow) for(const x of [-.145,-.072,.070,.145]) path(p,'molded scoop rib',[[x,.031,-.28],[x*.93,.035,-.411]],.009,head);
    if(!short) path(p,'D handle',[[0,.05,.382],[-.083,.048,.409],[-.074,.046,.514],[.074,.046,.514],[.083,.048,.409],[0,.05,.382]],.019,assetGrip);
  } else if (shape==='rake'||shape==='fork') {
    const fork=shape==='fork';
    const material=composite?head:iron;
    const count=fork?4:10;
    const width=fork?.19:.30;
    path(p,'tooth crossbar',[[-width,.061,-.33],[0,.082,-.287],[width,.061,-.33]],.024,material);
    for(let n=0;n<count;n++) {
      const x=(n/(count-1)-.5)*width*2;
      tube(p,'tine',V(x,.061,-.323),V(x,.035,-.455),.022,.007,7,material);
    }
  } else if (shape==='broom') {
    if(id==='plunger_futuristic') {
      for(let n=0;n<4;n++) cyl(p,'accordion rib','z',[0,.165,-.27-n*.049],.107+n*.017,.054,12,rubber);
    } else if(id==='broom') {
      bevel(p,'broom head',[-.241,.012,-.419,.241,.081,-.262],.029,wood);
      for(let n=0;n<17;n++) {
        const x=(n-8)*.028;
        path(p,'straw brush tuft',[[x,.048,-.327],[x*1.074,.023,-.469]],.014,woodP(0xc4aa73));
      }
    } else {
      const folded = id==='mop_folded';
      bevel(p,'mop yarn collar',[-.111,.024,-.343,.111,.139,-.236],.029,folded?head:iron);
      for(let n=0;n<14;n++) {
        const x=(n-6.5)*.017;
        path(p,'loose mop strand',[[x,.073,-.336],[x*1.51,.046,-.384],[x*1.76,.034,-.446],[x*2.2,.016,-.482+n%4*.027]],.012,clothP(n%3?0xd5cec1:0xb7ad9d));
      }
    }
  } else {
    const shapes = {
      axe:[[-.11,-.377],[.061,-.377],[.184,-.432],[.263,-.462],[.321,-.417],[.361,-.343],[.364,-.254],[.326,-.177],[.195,-.223],[.061,-.281],[-.11,-.273]],
      pick:[[-.397,-.186],[-.316,-.326],[-.153,-.392],[.056,-.405],[.238,-.346],[.392,-.202],[.216,-.271],[.072,-.319],[-.091,-.321],[-.247,-.283]],
      hammer:[[-.22,-.385],[.223,-.385],[.233,-.226],[-.231,-.226]],
      hoe:[[-.21,-.395],[.22,-.395],[.19,-.28],[.047,-.253],[-.052,-.253],[-.197,-.28]],
      edge:id==='sickle'
        ? [[-.035,-.14],[.018,-.29],[.138,-.428],[.296,-.446],[.423,-.347],[.465,-.205],[.408,-.096],[.419,-.279],[.291,-.362],[.163,-.338],[.074,-.249],[.037,-.125]]
        : [[-.055,-.251],[.079,-.385],[.212,-.429],[.379,-.407],[.488,-.317],[.326,-.354],[.193,-.345],[.078,-.297],[.010,-.203]],
    };
    const blade = shape==='hammer'?iron:steel;
    const h = shape==='hammer'?id.endsWith('heavy')?.151:.12:shape==='edge'?.026:.054;
    cutShape(p,shape==='hammer'?'hammer head':'forged tool head',shapes[shape],h,blade,.026);
    if(shape==='hammer') for(const x of [-.216,.216]) bevel(p,'striking face',[x-.031,.016,-.393,x+.031,h+.032,-.222],.015,steel);
    if(shape==='axe') {
      bevel(p,'forged eye',[-.119,.007,-.387,.067,.098,-.258],.028,iron);
      path(p,'polished axe edge',[[.272,.068,-.451],[.315,.069,-.413],[.35,.069,-.34],[.354,.069,-.257],[.324,.069,-.19]],.009,steelP(0xc8cbca));
    }
    if(id==='scythe') tube(p,'side handle',V(.009,.068,.134),V(-.152,.103,.163),.026,.021,8,wood);
  }
}

function wrench(p,d) {
  const {id}=d;
  const pipe=id==='wrench_48';
  const set=id.includes('_set');
  const x=set?-.11:0;
  const metal=pipe?iron:steel;
  if(set) bevel(p,'socket tray',[-.42,0,-.46,.42,.042,.46],.021,dark);
  outline(p,'wrench handle',[[x-.059,-.219],[x+.069,-.219],[x+.079,.41],[x-.070,.45]],.056,pipe?plasticP(0x9a5346):steel,.033);
  if (set) {
    if (id==='socket_screwdriver_set') {
      bevel(p,'screwdriver grip',[x-.079,.041,-.083,x+.079,.15,.405],.041,rubber);
      cyl(p,'socket screwdriver shaft','z',[x,.098,-.218],.029,.294,10,steel);
      cyl(p,'socket drive collar','z',[x,.098,-.348],.054,.081,10,iron);
    } else {
      cyl(p,'ratchet drive','y',[x,.068,-.25],.104,.078,10,steel);
    }
    for(let n=0;n<5;n++) {
      const r=.036+n*.007;
      cyl(p,'loose socket','y',[.225,.084,-.30+n*.144],r,.095,10,steel,{open:true});
      ring(p,'socket mouth',r*.62,r,.134,steel,[.225,-.30+n*.144],10);
    }
  } else {
    const large=id==='wrench_large';
    const head=pipe?[[-.158,-.172],[-.163,-.365],[-.128,-.442],[.045,-.449],[.046,-.369],[-.052,-.365],[-.047,-.253],[.142,-.246],[.155,-.189]]
      : [[-.101,-.192],[-.166,-.294],[-.147,-.418],[-.084,-.468],[-.037,large?-.467:-.402],[-.083,-.341],[-.033,-.297],[.099,-.328],[.14,-.236],[.071,-.188]];
    cutShape(p,pipe?'hook jaw':'fixed crescent jaw',head.map(([a,b])=>[x+a,b]),.073,metal,.026);
    const jaw=large?.197:.157;
    p.box('adjustable jaw',[x+.05,.025,pipe?-.326:-.407,x+jaw,.104,-.238],metal);
    cyl(p,'knurled adjustment','x',[x+.066,.083,-.252],.046,.091,10,iron);
  }
}

function handtool(p,d) {
  const {id,shape}=d;
  const color=plasticP(d.color);
  if(shape==='wrench') return wrench(p,d);
  if (shape==='shears') {
    const pliers=id==='pliers_locking';
    const sprung=/^(forged_)?shears$/.test(id);
    const kevlar=id==='kevlar_shears';
    for (const s of [-1,1]) {
      const edge=[[.008,-.11],[.13,-.05],[pliers?.106:.061,pliers?-.266:-.432],[.006,-.40]];
      outline(p,pliers?'jaw':'blade',edge.map(([x,z])=>[x*s,z]),.052,steel,.02);
      const grip=sprung?iron:color;
      path(p,'handle',[[0,.045,-.012],[s*.108,.047,.15],[s*.222,.045,pliers?.417:.321]],pliers?.042:.041,grip);
      if(kevlar) path(p,'finger loop',[[s*.113,.043,.177],[s*.244,.044,.201],[s*.289,.045,.359],[s*.233,.045,.405],[s*.135,.044,.363],[s*.108,.042,.246]],.028,grip);
    }
    cyl(p,'pivot','y',[0,.062,-.052],.048,.057,10,iron);
    if(sprung) path(p,'bow spring',[[-.221,.044,.309],[-.19,.044,.415],[-.083,.044,.476],[.083,.044,.476],[.19,.044,.415],[.221,.044,.309]],id==='forged_shears'?.037:.025,iron);
    if(pliers) cyl(p,'adjustment screw','z',[.205,.045,.401],.034,.139,10,steel);
    return;
  }
  if(shape==='clamp') {
    if(id==='clamp') {
      path(p,'C frame',[[.248,.087,-.286],[-.18,.087,-.31],[-.32,.087,-.22],[-.32,.087,.228],[-.19,.087,.342],[.25,.087,.315]],.058,iron);
      tube(p,'threaded screw',V(.233,.08,.432),V(.233,.08,-.13),.031,.031,9,steel);
      tube(p,'sliding T handle',V(.09,.08,.422),V(.38,.08,.422),.018,.018,7,steel);
    } else {
      bevel(p,'fixed vise base',[-.35,0,-.27,.35,.097,.29],.039,color);
      for(const x of [-.223,.22]) {
        bevel(p,'vise jaw',[x-.12,.087,-.21,x+.12,.369,.218],.031,color);
        p.box('jaw face',[x-.126,.327,-.207,x+.126,.38,.212],steel);
      }
      tube(p,'slide screw',V(-.24,.185,.009),V(.42,.185,.009),.054,.054,9,iron);
      tube(p,'sliding crank',V(.419,.076,-.17),V(.419,.29,.18),.024,.024,8,steel);
    }
    return;
  }
  if(shape==='saw') {
    path(p,'bow frame',[[-.43,.04,.076],[-.38,.043,-.10],[-.225,.044,-.287],[.252,.044,-.292],[.395,.044,-.10],[.445,.043,.073]],.035,color);
    p.box('tensioned blade',[-.44,.022,.069,.44,.067,.126],steel);
    for(let n=0;n<19;n++) {
      const x=-.41+n*.045;
      outline(p,'saw tooth',[[x,.118],[x+.021,.149],[x+.04,.118]],.032,steel,.025);
    }
    bevel(p,'end grip',[.35,.014,-.074,.478,.092,.14],.026,rubber);
    return;
  }
  if(shape==='jack') {
    const bottle=id==='jack';
    bevel(p,'jack base',[-.31,0,-.24,.31,.079,.24],.029,iron);
    if (bottle) {
      lid(p,'hydraulic body',.222,.065,.477,color);
      lid(p,'lift piston',.075,.498,.20,steel);
      lid(p,'support pad',.114,.68,.055,iron);
      tube(p,'pump handle',V(.147,.169,-.03),V(.34,.30,-.03),.029,.029,8,steel);
    } else {
      for(const z of [-.13,.13]) path(p,'lifting linked arm',[[-.43,.251,z],[0,.091,z],[.43,.251,z],[0,.412,z],[-.43,.251,z]],.041,color);
      tube(p,'lead screw',V(-.456,.252,0),V(.46,.252,0),.025,.025,8,steel);
      p.box('top saddle',[-.101,.384,-.18,.101,.451,.18],iron);
    }
    return;
  }
  if(shape==='bits') {
    if(id==='needle_curved') {
      path(p,'curved needle',[[-.37,.025,-.19],[-.394,.025,.116],[-.198,.025,.31],[.14,.025,.318],[.379,.025,.144],[.427,.025,-.085]],.025,steel);
      ring(p,'needle eye',.028,.047,.025,steel,[-.365,-.208],9);
    } else for(const z of [-.13,.13]) {
      tube(p,'wooden knitting needle',V(-.442,.030,z),V(.419,.030,z),.031,.019,8,wood);
      cyl(p,'rounded stop','x',[-.442,.055,z],.054,.054,9,wood);
    }
    return;
  }
  if(shape==='kit') {
    bevel(p,'recessed kit tray',[-.43,0,-.45,.43,.073,.45],.034,dark);
    if(id==='tailors_kit') {
      for(const x of [-.22,0,.22]) {
        cyl(p,'thread spool','y',[x,.148,.07],.084,.164,12,color);
        for(const y of [.077,.225]) cyl(p,'spool end','y',[x,y,.07],.102,.028,12,cream);
      }
      for(const x of [-.13,.10]) tube(p,'sewing needle',V(x,.079,-.24),V(x+.20,.079,-.29),.011,.008,7,steel);
      for(const x of [-.21,-.107]) {
        ring(p,'scissor grip',.038,.063,.089,iron,[x,.251],10);
        path(p,'folded scissor blade',[[x,.093,.227],[-.157,.099,.127],[-.15,.098,-.04]],.015,steel);
      }
      for(const x of [.221,.302]) ring(p,'thimble rim',.023,.035,.117,steel,[x,.243],10);
      cyl(p,'thimble','y',[.261,.108,.228],.042,.073,10,steel,{},.024);
    } else if(id==='thread_cutting_set') {
      ring(p,'steel threading die',.073,.151,.091,steel,[0,.015],12);
      tube(p,'die holder',V(-.382,.095,.019),V(.382,.095,.019),.025,.025,8,steel);
      tube(p,'tap',V(.209,.096,-.30),V(-.24,.096,-.295),.024,.018,8,iron);
    } else for (const x of [-.27,-.09,.09,.27]) {
      tube(p,'screwdriver shaft',V(x,.107,-.36),V(x,.107,.16),.023,.023,8,steel);
      bevel(p,'molded grip',[x-.049,.063,.006,x+.049,.147,.37],.031,x<0?color:rubber);
    }
    return;
  }
  if(id==='knife_sharpener_handheld') {
    bevel(p,'two-slot sharpener',[-.44,0,-.146,.44,.183,.145],.049,color);
    for(const x of [-.26,-.085]) top(p,'grit slot',[x-.045,-.092,x+.045,.092],.186,rubber);
    bevel(p,'soft grip',[.105,.062,-.14,.41,.175,.15],.027,rubber);
    return;
  }
  const folding=id==='pockknife'||id==='multitool';
  bevel(p,'hand grip',[-.079,0,-.11,.079,.070,.449],.033,folding?color:steel);
  if(folding) {
    p.box('folding tool liner',[-.066,.052,-.119,.067,.077,.427],iron);
    for(const z of [-.07,.36]) cyl(p,'folding pivot','y',[0,.083,z],.026,.014,9,steel);
    if(id==='multitool') bevel(p,'second folded handle',[.084,0,-.115,.19,.066,.45],.030,steel);
  } else outline(p,'scalpel head',[[-.039,-.087],[.054,-.091],[.029,-.349],[.004,-.448],[-.043,-.363]],.018,steel,.024);
}

function appliance(p,d) {
  const {id,shape,color}=d;
  const paint=plasticP(color);
  if (shape==='coffee') {
    bevel(p,'drip tray',[-.33,0,-.34,.33,.099,.34],.03,dark);
    bevel(p,'water reservoir',[-.27,.086,.12,.27,.78,.34],.046,dark);
    bevel(p,'brew head',[-.29,.66,-.34,.29,.83,.34],.041,paint);
    const glass=flat(0xa1b6b2);
    cyl(p,'glass carafe','y',[0,.276,-.09],.218,.35,12,glass,GLASS,.154);
    lid(p,'carafe lid',.164,.451,.045,dark);
    path(p,'carafe handle',[[.128,.44,-.115],[.267,.453,-.115],[.283,.239,-.115],[.203,.203,-.115]],.026,rubber);
    p.box('power switch',[.213,.027,-.349,.275,.059,-.325],plasticP(0xc76858));
    return;
  }
  if (shape==='sewing') {
    bevel(p,'sewing base',[-.42,0,-.234,.44,.065,.234],.023,dark);
    bevel(p,'upright', [.106,.049,-.16,.35,.69,.16],.032,cream);
    bevel(p,'cantilevered arm',[-.33,.49,-.16,.35,.69,.16],.033,cream);
    bevel(p,'needle housing',[-.36,.294,-.135,-.18,.57,.135],.024,cream);
    tube(p,'presser bar',V(-.273,.088,0),V(-.273,.323,0),.018,.018,8,steel);
    p.box('presser foot',[-.323,.074,-.05,-.219,.101,.053],steel);
    cyl(p,'hand wheel','x',[.365,.55,.027],.113,.060,12,plasticP(0x7e858b));
    cyl(p,'thread spool','y',[.091,.727,.007],.056,.086,10,paint);
    return;
  }
  if (shape==='mix') {
    for(const x of [-.25,.25]) {
      path(p,'stand',[[x,.049,-.329],[x,.039,.261],[x,.456,.175],[x,.522,-.04]],.038,iron);
      cyl(p,'transport wheel','x',[x,.101,.275],.103,.094,12,rubber);
    }
    const parent=p.group('tilting drum',{at:[0,.488,-.04],rotX:.66});
    profile(p,'open mixing drum',[[0,-.134],[.218,-.134],[.288,-.101],[.299,.066],[.268,.207],[.217,.328],[.183,.337],[.235,.163],[.248,-.097],[0,-.097]],plasticP(0xb5884f),{parent,sides:16});
    p.box('drive cover',[.163,.319,-.135,.353,.535,.156],dark);
    return;
  }
  if (shape==='mower') {
    bevel(p,'mower deck',[-.324,.084,-.326,.324,.164,.265],.053,paint);
    bevel(p,'motor cover',[-.179,.162,-.191,.179,.37,.177],.041,dark);
    for(const x of [-.32,.32]) {
      for(const z of [-.237,.179]) cyl(p,'wheel','x',[x,.092,z],.091,.081,10,rubber);
      path(p,'handle bar',[[x*.76,.134,.21],[x*.86,.34,.32],[x*.68,.60,.46]],.022,steel);
    }
    tube(p,'push handle',V(-.247,.60,.46),V(.247,.60,.46),.028,.028,9,rubber);
    return;
  }
  if(shape==='lamp') {
    const oil=id==='oil_lamp';
    if(oil) {
      const brass=steelP(0xa68e60);
      profile(p,'kerosene font',[[0,0],[.24,0],[.28,.029],[.269,.128],[.197,.201],[.10,.226],[0,.226]],brass,{metal:true});
      profile(p,'open glass chimney',[[.104,.183],[.146,.253],[.164,.36],[.115,.48],[.092,.693],[.071,.693],[.086,.48],[.137,.36],[.109,.243]],flat(0xc7d0c1),{...GLASS,sides:16});
      cyl(p,'wick wheel','z',[.127,.199,-.068],.042,.025,10,brass);
      return;
    }
    lid(p,'lamp base',.273,0,.204,paint);
    cyl(p,'light enclosure','y',[0,.407,0],.195,.432,14,flat(0xc9c9ae),GLASS);
    lid(p,'lamp roof',.219,.62,.105,paint);
    for(const x of [-.21,.21]) path(p,'lamp guard',[[x,.17,0],[x*1.09,.32,0],[x*.92,.53,0],[x*.71,.65,0]],.021,iron);
    path(p,'folding handle',[[-.15,.658,0],[-.134,.859,0],[.135,.859,0],[.15,.658,0]],.022,iron);
    return;
  }
  if(shape==='workshop' && id==='metal_smoother') {
    bevel(p,'steel finishing plate',[-.42,0,-.23,.42,.034,.23],.012,steel);
    path(p,'wood handle',[[-.28,.025,0],[-.208,.15,0],[.21,.15,0],[.28,.025,0]],.041,wood);
    return;
  }
  const microwave=shape==='microwave',toast=shape==='toast',register=shape==='register';
  const round=id==='popcan_stove';
  if(round) {
    profile(p,'short can body',[[0,0],[.283,0],[.318,.049],[.318,.203],[.276,.249],[.241,.243],[.231,.086],[0,.086]],steel,{metal:true});
    ring(p,'small top rim',.136,.265,.255,steel,[0,0],14);
    ring(p,'separate simmer ring',.096,.152,.055,steel,[.349,.179],12);
    return;
  }
  const h=microwave?.49:toast?.45:shape==='plate'?.107:register?.311:.42;
  const z=shape==='plate'?.393:toast?.193:.318;
  bevel(p,'appliance housing',[-.43,0,-z,.43,h,z],.043,toast?steel:paint);
  if (toast) {
    for(const zz of [-.071,.074]) {
      p.box('rolled slot trim',[-.345,h,zz-.032,.343,h+.014,zz+.032],iron);
      top(p,'bread slot',[-.304,zz-.018,.305,zz+.018],h+.015,dark);
    }
    p.box('lever',[.409,.13,-.058,.484,.179,.069],dark);
  } else if (microwave) {
    bevel(p,'door frame',[-.401,.057,-z-.028,.244,h-.048,-z+.01],.027,dark);
    front(p,'window',[-.35,.093,.195,h-.085],-z-.031,flat(0x506062));
    p.box('vertical handle',[.201,.114,-z-.074,.241,h-.095,-z-.021],steel);
    for(let k=0;k<6;k++) front(p,'control key',[.278,.09+k*.041,.36,.114+k*.041],-z-.004,cream);
  } else if(shape==='plate') {
    const ironPlate = id==='waffleiron';
    lid(p,ironPlate?'waffle iron lid':'cast element',.251,h,.031,iron);
    if (ironPlate) {
      bevel(p,'hinged waffle iron',[-.30,h-.013,-.298,.30,h+.117,.297],.048,iron);
      path(p,'waffle iron handle',[[-.18,h+.054,-.248],[-.17,h+.047,-.438],[.17,h+.047,-.438],[.18,h+.054,-.248]],.040,rubber);
      for(const x of [-.19,.19]) cyl(p,'hinge pin','x',[x,h+.073,.291],.053,.101,10,steel);
    }
    else for(const r of [.142,.192,.211]) ring(p,'heating coil',r-.008,r,h+.033,steel,[0,0],16);
  } else if (register) {
    p.box('cash drawer',[-.404,.081,-z-.041,.405,.167,-z+.008],dark);
    bevel(p,'customer display',[.097,h-.02,.109,.375,h+.109,.25],.017,dark);
    for(let i=0;i<4;i++) for(let j=0;j<4;j++) p.box('register key',[-.298+i*.14,h,-.251+j*.072,-.225+i*.14,h+.026,-.204+j*.072],cream);
  } else {
    for(const x of [-.29,.28]) cyl(p,'control knob','z',[x,.263,-z-.02],.059,.059,10,dark);
    for(const n of [0,1,2,3]) front(p,'case vent',[-.28,.11+n*.031,.26,.125+n*.031],-z-.005,dark);
    path(p,'carry handle',[[-.16,h,0],[-.122,h+.093,0],[.122,h+.093,0],[.16,h,0]],.033,rubber);
    path(p,'coiled welding lead',[[.3,.103,-.308],[.443,.065,-.34],[.486,.033,-.25],[.465,.031,-.032],[.438,.033,.178],[.462,.033,.31]],.02,rubber);
    bevel(p,'insulated lead grip',[.396,.011,.241,.472,.071,.413],.026,rubber);
  }
}

function powerTool(p,d) {
  const {id,shape,color}=d;
  const paint=plasticP(color);
  if (id==='corded_powerdrill'||id==='cordless_impact_wrench') {
    const impact=id==='cordless_impact_wrench';
    const body=impact?paint:plasticP(0x48484d);
    bevel(p,'motor housing',[-.39,.39,-.145,.17,.62,.145],.051,body);
    bevel(p,'angled grip',[-.325,.051,-.086,-.193,.446,.086],.033,rubber);
    p.box('trigger',[-.194,.292,-.056,-.138,.416,.056],iron);
    if (impact) {
      bevel(p,'battery pack',[-.409,0,-.14,-.066,.125,.14],.033,body);
      cyl(p,'impact collar','x',[.186,.503,0],.112,.125,12,steel);
      p.box('square drive',[.237,.468,-.039,.351,.539,.039],iron);
    } else {
      cyl(p,'keyless chuck','x',[.211,.503,0],.083,.146,12,iron,{},.053);
      tube(p,'tool bit',V(.268,.503,0),V(.438,.503,0),.022,.010,9,steel);
      path(p,'power cord',[[-.263,.074,0],[-.409,.054,.082],[-.437,.025,.196],[-.337,.023,.293],[-.141,.028,.309]],.016,rubber);
      bevel(p,'cord plug',[-.176,.011,.271,-.076,.058,.352],.013,rubber);
      bevel(p,'bit holder tray',[-.112,0,.186,.275,.027,.33],.012,iron);
      for (const z of [.212,.255,.296]) tube(p,'spare drill bit',V(-.086,.038,z),V(.201,.038,z),.011,.007,8,steel);
    }
    return;
  }
  if (id==='hand_drill') {
    tube(p,'drill spindle',V(-.37,.093,0),V(.37,.093,0),.029,.029,8,steel);
    cyl(p,'crank wheel','y',[0,.134,0],.217,.043,12,iron,{open:true});
    for(const x of [-.157,.157]) tube(p,'spoke',V(0,.136,0),V(x,.136,.141),.022,.022,7,steel);
    path(p,'crank',[[-.067,.137,-.124],[-.236,.143,-.196],[-.273,.247,-.22]],.023,steel);
    cyl(p,'tail grip','x',[.307,.096,0],.072,.265,10,wood);
    return;
  }
  if (shape==='grooming'||id==='dremel') {
    const curling=id==='curling_iron', rotary=id==='dremel';
    bevel(p,'molded handheld case',[-.411,0,-.118,.212,.108,.118],.043,paint);
    if (curling||rotary) {
      cyl(p,'barrel','x',[.225,.067,0],curling?.069:.042,.398,12,curling?cream:steel,{},.033);
      if(curling) bevel(p,'hair clip',[.021,.10,-.044,.36,.157,.048],.018,steel);
      else cyl(p,'tool attachment','x',[.447,.067,0],.027,.118,9,steel);
    } else {
      bevel(p,'clipper head',[.116,.027,-.153,.423,.123,.153],.023,steel);
      for(let n=0;n<9;n++) p.box('comb tooth',[.405,.047,-.132+n*.03,.46,.072,-.118+n*.03],steel);
    }
    p.box('power switch',[-.223,.103,-.038,-.123,.129,.038],rubber);
    return;
  }
  const saw=shape==='saw',long=shape==='hammer'||shape==='trimmer',buffer=id==='polisher';
  const z=long?.14:.202;
  bevel(p,'motor body',[-.302,0,-z,.215,.226,z],.067,paint);
  path(p,'operator handle',[[-.26,.188,0],[-.26,.348,0],[-.043,.375,0],[.103,.212,0]],.046,rubber);
  for (const x of [-.22,-.14,-.06]) p.box('cooling slot',[x,.078,-z-.003,x+.036,.141,-z+.008],rubber);
  if (shape==='hammer') {
    cyl(p,'breaker barrel','x',[.232,.111,0],.096,.19,12,iron);
    tube(p,'working bit',V(.286,.111,0),V(.514,.111,0),.032,.015,8,steel);
    cyl(p,'side grip','z',[-.19,.163,.184],.057,.264,10,rubber);
    if(id==='elec_jackhammer') {
      path(p,'power cord',[[-.302,.074,.046],[-.41,.044,.15],[-.356,.028,.295],[-.218,.028,.342],[-.06,.029,.304]],.016,rubber);
      bevel(p,'power plug',[-.079,.01,.259,-.003,.051,.343],.014,rubber);
    } else cyl(p,'fuel cap','y',[-.034,.234,-.084],.056,.033,10,iron);
  } else if (shape==='trimmer') {
    p.box('bar', [.196,.073,-.059,.545,.111,.059],steel);
    for (const z of [-.061,.061]) for(let k=0;k<6;k++)
      p.box('tooth',[.233+k*.051,.074,z-.022,.257+k*.051,.102,z+.022],steel);
  } else {
    const rad=saw?.201:buffer?.20:.154;
    const y=saw?.201:.061;
    const axis=saw?'z':'y';
    const at=[.246,y,saw?.113:0];
    cyl(p,buffer?'buffing pad':'working disc',axis,at,rad,saw?.036:.071,18,buffer?clothP(0xd8ceae):steel);
    cyl(p,'center fastener',axis,at,rad*.4,saw?.054:.102,12,iron);
    if(saw) {
      bevel(p,'blade guard',[.054,.188,.074,.432,.421,.172],.084,paint);
      bevel(p,'saw base shoe',[-.264,0,-.199,.395,.032,.243],.013,steel);
    } else cyl(p,'side grip','z',[.151,.156,.198],.044,.219,10,rubber);
  }
}

function meter(p,d) {
  const t=d.id==='thermometer', digital=d.id==='multimeter';
  const h=t?.078:.135,w=t?.10:.253;
  bevel(p,'meter case',[-w,0,-.434,w,h,.425],.031,t?cream:plasticP(d.color));
  bevel(p,'display',[-w*.78,h,-.368,w*.78,h+.014,-.092],.010,plasticP(0x596d63));
  top(p,'display markings',[-w*.69,-.34,w*.69,-.13],h+.018,label(0x67796b,t?'23 C':digital?'0.00':'VOLTS',d.key));
  if(!t) {
    cyl(p,'selector','y',[0,h+.019,.099],.094,.040,12,rubber);
    for(const side of [-1,1]) {
      const x=w*.65*side;
      path(p,'probe lead',[[x,.08,.32],[x*1.64,.034,.45],[x*2.0,.035,.22],[x*1.73,.034,.08]],.017,plasticP(side>0?0xb45b55:0x45494b));
      tube(p,'probe body',V(x*1.73,.035,.083),V(x*1.61,.041,-.15),.029,.029,8,rubber);
    }
  }
}

function optics(p,d) {
  const bino=d.shape==='bino', mirror=d.id==='mirror';
  const lens=flat(mirror?0xbed0d3:0x6c9296);
  if(bino) {
    for (const x of [-.19,.19]) {
      cyl(p,'optical barrel','z',[x,.155,0],.151,.62,12,rubber,{},.119);
      cyl(p,'objective flange','z',[x,.155,-.31],.155,.084,12,dark,{open:true});
      cyl(p,'objective lens','z',[x,.155,-.348],.118,.014,12,lens);
      cyl(p,'eyecup','z',[x,.155,.33],.103,.117,12,dark,{open:true});
    }
    p.box('hinged bridge',[-.141,.114,-.135,.141,.225,.193],dark);
    path(p,'neck strap',[[-.208,.058,.221],[-.29,.022,.45],[0,.019,.48],[.29,.022,.45],[.208,.058,.221]],.018,clothP(0x63564b));
  } else {
    const r=mirror?.295:.245, z=-.185;
    cyl(p,'outer rim','y',[0,.033,z],r,.066,14,dark,{open:!mirror});
    cyl(p,'optical face','y',[0,.049,z],r-.026,.035,14,lens,mirror?{}:GLASS);
    ring(p,'raised lip',r-.035,r,.071,dark,[0,z],14);
    bevel(p,'hand grip',[-.062,0,.021,.062,.073,.454],.028,plasticP(d.color));
  }
}

export const workshopTools = { handle:longHandle, handtool, appliance, powerTool, meter, optics };
