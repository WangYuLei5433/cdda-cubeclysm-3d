import { blob, woodP } from './item-kit.js';
import { GLASS, V, bevel, clothP, cyl, fill, flat, front, label, lid, path, plasticP, ring, rubber, shade, steelP, top, tube } from './common-loot-kit.js';
import { cutShape, oval, profile } from './item-workshop-kit.js';
import { workshopParts } from './item-workshop-parts.js';
import { workshopTools } from './item-workshop-tools.js';

const steel=steelP(0xa3a8a5), dark=plasticP(0x47484b), iron=steelP(0x696d72), ivory=plasticP(0xe0d6bf);
const brass=steelP(0xad9265), glass=flat(0xa3bdba), wood=woodP(0xaa8b60);

function appliance(p,d){
  const {id,color,shape}=d, paint=plasticP(color);
  if(id==='chipper'){
    tube(p,'palm handle',V(0,.085,-.021),V(.03,.072,.403),.075,.071,10,wood);
    cyl(p,'steel ferrule','z',[0,.078,-.039],.077,.089,11,steel);
    cutShape(p,'flat scraping edge',[[ -.049,-.057],[.052,-.057],[.119,-.416],[.103,-.443],[-.086,-.446],[-.106,-.413]],.035,steel,.047);
    return;
  }
  if(id==='UPS_OFF'){
    bevel(p,'portable power pack shell',[-.303,0,-.42,.303,.17,.42],.05,plasticP(0x616853));
    bevel(p,'rubber top rail',[-.233,.138,-.387,.234,.197,.389],.035,dark);
    bevel(p,'recessed port panel',[-.229,.042,-.444,.23,.139,-.406],.022,dark);
    for(const x of [-.15,.01,.147]) cyl(p,'recessed socket','z',[x,.093,-.447],.038,.035,10,iron,{open:true});
    path(p,'folded carry strap',[[ -.254,.082,.23],[-.358,.06,.338],[-.236,.021,.461],[.233,.021,.461],[.358,.06,.338],[.254,.083,.23]],.025,clothP(0x484b42));
    return;
  }
  if(id==='pressure_cooker'||id==='slow_cooker'){
    const slow=id==='slow_cooker';
    const r=slow?.38:.318;
    profile(p,'cooker body',[[0,0],[r*.76,0],[r,.061],[r,.48],[r*.91,.539],[0,.539]],slow?paint:steel,{scale:[1,slow?.73:1]});
    profile(p,'domed cooking lid',[[0,.504],[r,.503],[r,.54],[r*.77,.589],[r*.37,.61],[0,.61]],slow?glass:steel,{scale:[1,slow?.73:1],...(slow?GLASS:{})});
    lid(p,'lid knob or valve',.064,.603,.073,dark);
    if(!slow) {
      for(const z of [-.081,.081]) p.box('interlocking lid handle',[.267,.477,z-.029,.508,.545,z+.025],dark);
      cyl(p,'steam weight','y',[-.149,.599,-.061],.031,.073,10,steel);
    }
    for(const x of [-.344,.344]) path(p,'side handle',[[x,.351,-.09],[x*1.35,.355,-.059],[x*1.35,.355,.068],[x,.351,.096]],.029,dark);
    if(slow) front(p,'temperature scale',[-.099,.172,.099,.282],-.279,label(color,'LOW HIGH',d.key));
    return;
  }
  if(id==='pastaextruder'){
    bevel(p,'clamp foot',[-.298,0,-.228,.296,.083,.228],.028,iron);
    cyl(p,'extruder barrel','x',[.02,.317,0],.192,.552,14,steel);
    cyl(p,'perforated end plate','x',[.31,.32,0],.156,.058,14,brass);
    for(let k=0;k<8;k++){
      const a=k*Math.PI/4;
      cyl(p,'dark die opening','x',[.345,.32+.099*Math.cos(a),.099*Math.sin(a)],.019,.012,7,dark);
    }
    profile(p,'feeding hopper',[[.081,.422],[.183,.577],[.205,.6],[.17,.606],[.065,.443]],steel,{at:[-.129,0]});
    path(p,'hand crank',[[ -.252,.317,0],[-.357,.318,0],[-.357,.488,-.088],[-.477,.49,-.089]],.027,steel);
    return;
  }
  if(id==='food_processor'){
    bevel(p,'motor base',[-.265,0,-.289,.265,.211,.289],.053,paint);
    profile(p,'clear processing bowl',[[0,.191],[.228,.191],[.26,.223],[.256,.575],[.227,.575],[.228,.234],[0,.234]],glass,GLASS);
    lid(p,'gray lid',.263,.572,.044,dark);
    cyl(p,'feed tube','y',[.017,.663,.074],.09,.121,10,glass,{...GLASS,open:true});
    path(p,'bowl handle',[[.226,.551,0],[.351,.537,0],[.361,.383,0],[.236,.338,0]],.030,dark);
    return;
  }
  if(id==='dehydrator'||id==='char_smoker'){
    const round=id==='char_smoker';
    if(round) {
      profile(p,'barrel smoker',[[0,.102],[.237,.102],[.298,.163],[.302,.647],[.276,.753],[.137,.802],[0,.808]],iron,{sides:14});
      for(const x of [-.193,.193]) for(const z of [-.158,.158]) tube(p,'smoker leg',V(x,.197,z),V(x*1.15,0,z*1.12),.031,.023,8,iron);
      bevel(p,'smoker door',[-.176,.254,-.322,.179,.539,-.281],.023,dark);
      path(p,'lid handle',[[ -.104,.795,0],[-.072,.863,0],[.079,.863,0],[.104,.795,0]],.026,steel);
    } else {
      for(let n=0;n<5;n++) bevel(p,'vented drying tray',[-.336,n*.086,-.26,.336,n*.086+.069,.26],.027,n%2?ivory:paint);
      for(let n=0;n<4;n++) front(p,'vent',[-.232,.095+n*.086,.23,.116+n*.086],-.263,dark);
      bevel(p,'dehydrator upper case',[-.325,.409,-.256,.326,.515,.256],.045,ivory);
    }
    return;
  }
  if(id==='vac_sealer'){
    bevel(p,'vacuum sealer shell',[-.44,0,-.186,.44,.155,.18],.05,paint);
    p.box('front latch seam',[-.385,.049,-.191,.386,.065,-.173],dark);
    p.box('seal bar',[-.38,.129,-.153,.382,.153,-.107],dark);
    for(const x of [.13,.212,.296]) cyl(p,'membrane key','y',[x,.157,.045],.026,.011,8,ivory);
    return;
  }
  if(id==='gas_forge'){

      for(const x of [-.26,.26]) p.box('forge support foot',[x-.063,0,-.276,x+.063,.089,.276],iron);
      cyl(p,'forge shell','z',[0,.27,0],.25,.602,12,iron,{open:true});
      cyl(p,'refractory lining','z',[0,.27,-.036],.179,.446,12,ivory,{open:true});
      const parent=p.group('opening',{at:[0,.27,-.303],rotX:Math.PI/2});
      profile(p,'molded forge mouth',[[.173,-.025],[.235,-.026],[.253,.004],[.233,.025],[.173,.024],[.173,-.025]],ivory,{parent,sides:12});
      tube(p,'burner housing',V(.073,.397,.044),V(.194,.64,.077),.046,.056,9,steel);
    return;
  }
  if(id==='hotplate_induction'||id==='esbit_stove'||id==='propane_cooker') {
    const induction=id==='hotplate_induction', camp=id==='esbit_stove';
    bevel(p,'stove base',[-.413,0,-.3,.413,induction?.092:.11,.30],.029,induction?dark:iron);
    if(induction) {
      top(p,'glass cooktop',[-.378,-.271,.374,.261],.094,plasticP(0x333640));
      ring(p,'induction zone print',.198,.219,.097,flat(0x818488),[-.032,.017],18);
      top(p,'touch control strip',[-.143,-.266,.211,-.222],.099,label(color,'POWER',d.key));
    } else if(camp) {
      for(const x of [-.327,.327]) bevel(p,'fold-out pot support',[x-.036,.091,-.239,x+.036,.261,.232],.017,steel);
      bevel(p,'fuel tray',[-.17,.094,-.116,.172,.124,.116],.014,dark);
    } else {
      lid(p,'cooker burner',.182,.093,.075,steel);
      for(const x of [-.213,.213]) for(const z of [-.177,.177])
        tube(p,'pan support',V(x,.189,z),V(x*.50,.189,z*.50),.031,.028,8,iron);
      bevel(p,'valve cover',[.252,.043,-.299,.4,.127,-.211],.022,paint);
    }
    return;
  }
  if(shape==='lamp'){
    if(id==='smart_lamp') {
      bevel(p,'weighted lamp base',[-.22,0,-.209,.22,.065,.211],.032,paint);
      path(p,'adjustable stem',[[0,.054,.135],[0,.392,.12],[0,.642,.074],[0,.705,-.114]],.031,steel);
      bevel(p,'flat lamp head',[-.206,.65,-.318,.206,.738,-.048],.029,paint);
      return;
    }
    const propane=id==='propane_lantern';
    if(!propane){
      profile(p,'turned brass lamp base',[[0,0],[.192,0],[.229,.044],[.216,.124],[.133,.193],[.11,.364],[.139,.398],[0,.398]],brass,{metal:true});
      profile(p,'shaped glass chimney',[[.108,.389],[.151,.487],[.138,.547],[.078,.644],[.073,.749],[.056,.749],[.052,.637],[.115,.538],[.13,.487],[.093,.4]],glass,GLASS);
      path(p,'rounded brass handle',[[.128,.351,.034],[.281,.357,.04],[.29,.206,.041],[.188,.159,.033]],.029,brass);
      bevel(p,'lamp connection collar',[-.074,.317,-.158,.074,.374,-.107],.013,brass);
      return;
    }
    lid(p,'fuel base',propane?.24:.268,0,.217,paint);
    cyl(p,'glass globe','y',[0,.426,0],.148,.443,14,glass,GLASS);
    lid(p,'lantern roof',.191,.641,.083,iron);
    for(const x of [-.183,.183]) path(p,'globe guard',[[x,.208,0],[x*1.11,.322,0],[x*1.11,.55,0],[x,.663,0]],.021,steel);
    path(p,'bail handle',[[-.156,.663,0],[-.146,.817,0],[.147,.818,0],[.154,.664,0]],.019,steel);
    return;
  }
  workshopTools.appliance(p,d);
}

function engine(p,d){
  const {id,shape,color}=d;
  const paint=plasticP(color);
  if(shape==='engine'){
    const four=id==='i4_combustion';
    bevel(p,'cast engine block',[-.365,0,-.247,.344,.313,.245],.044,iron);
    bevel(p,'head cover',[-.354,.279,-.203,.336,.411,.199],.039,steel);
    for(const x of four?[-.252,-.082,.082,.246]:[-.188,.02,.196])
      path(p,'manifold branch',[[x,.254,-.223],[x,.249,-.304],[x,.169,-.343],[x,.141,-.312]],.025,brass);
    cylinderPulley(p,[.361,.173,0],.139);
    for(const x of [-.25,-.08,.09,.249]) p.box('cover ridge',[x-.029,.404,-.141,x+.029,.424,.152],iron);
  } else if(shape==='alternator'){
    const small=id==='motor_tiny', compressor=id==='compressor';
    cyl(p,'vented cast body','x',[0,.242,0],small?.22:.284,compressor?.589:.44,14,steel);
    for(let n=0;n<12;n++){
      const a=n*Math.PI/6;
      const r=small?.215:.283;
      tube(p,'cooling rib',V(-.224,.242+r*Math.sin(a),r*Math.cos(a)),V(.222,.242+r*Math.sin(a),r*Math.cos(a)),.017,.017,7,iron);
    }
    cylinderPulley(p,[.26,.242,0],small?.109:.15);
    bevel(p,'mounting foot',[-.217,0,-.25,.213,.07,.249],.023,iron);
    if(compressor) path(p,'service tube',[[ -.142,.47,.042],[-.144,.55,.146],[.083,.55,.178],[.228,.522,.17]],.025,brass);
  } else if(shape==='solar') {
    const folding=id==='folding_solar_panel_v2';
    const panels=folding?[-.218,.218]:[0];
    if(folding) {
      for(const z of [-.207,.205]) cyl(p,'panel hinge barrel','z',[0,.067,z],.026,.082,10,iron);
      path(p,'suitcase carrying handle',[[.392,.04,-.124],[.478,.045,-.088],[.478,.045,.086],[.394,.04,.123]],.021,dark);
    }
    for(const x of panels){
      const w=folding?.211:.44;
      bevel(p,'solar panel frame',[x-w,0,-.304,x+w,.067,.304],.019,steel);
      top(p,'laminated blue cells',[x-w+.023,-.276,x+w-.023,.277],.07,(ctx,x,y,w,h)=>{
        fill(ctx,x,y,w,h,0x516782);
        for(let k=1;k<5;k++) fill(ctx,x+k*w/5,y,1,h,0xa2aabb);
        for(let j=1;j<8;j++) fill(ctx,x,y+j*h/8,w,1,0x8a98a8);
      });
    }
  } else if(shape==='exhaust') {
    bevel(p,'oval muffler',[-.277,0,-.163,.3,.273,.165],.083,steel);
    path(p,'bent exhaust inlet',[[ -.249,.128,0],[-.389,.129,-.024],[-.459,.124,-.145]],.055,iron);
    path(p,'outlet tube',[[.281,.142,.018],[.409,.138,.027],[.465,.134,.105]],.042,iron);
  } else if(shape==='light') {
    const flood=id==='floodlight';
    bevel(p,'light housing',[-.339,.004,-.192,.339,.465,.175],.069,dark);
    bevel(p,'fluted glass lens',[-.288,.092,-.244,.288,.413,-.174],.041,glass,GLASS);
    for(const x of [-.176,-.084,0,.084,.176]) front(p,'reflector line',[x-.012,.119,x+.012,.382],-.247,ivory);
    if(flood) path(p,'pivot bracket',[[-.335,.223,.043],[-.383,.06,.069],[-.271,.012,.091],[.272,.014,.092],[.383,.062,.073],[.335,.22,.043]],.024,iron);
  } else if(id==='hand_paddles'){
    for(const x of [-.221,.221]){
      tube(p,'oar handle',V(x,.041,.444),V(x,.042,-.164),.035,.028,9,wood);
      cutShape(p,'wide paddle blade',[[x-.024,-.137],[x-.11,-.264],[x-.098,-.446],[x-.039,-.478],[x+.063,-.468],[x+.102,-.394],[x+.088,-.266],[x+.026,-.142]],.042,wood,.014);
    }
  } else if(shape==='pedal') {
    tube(p,'crank axle',V(-.288,.149,0),V(.289,.149,0),.052,.052,9,steel);
    const sprocket=p.group('sprocket axis',{at:[.075,.15,0],rotZ:Math.PI/2});
    const teeth=Array.from({length:48},(_,i)=>{const a=i*Math.PI/24,r=i%3===1?.15:.13;return [r*Math.cos(a),r*Math.sin(a)];});
    profile(p,'crank chain ring',[[.079,-.018],[.139,-.018],[.139,.018],[.079,.018],[.079,-.018]],steel,{sides:16,parent:sprocket});
    for(const [x,z] of teeth.filter((_,i)=>i%3===1)) tube(p,'chain-ring tooth',V(.075,.15+x*.89,z*.89),V(.075,.15+x,z),.009,.007,7,steel);
    for(const s of [-1,1]){
      path(p,'crank arm',[[s*.28,.089,0],[s*.336,.079,s*.197],[s*.38,.072,s*.315]],.03,steel);
      bevel(p,'rubber pedal',[s*.36-.088,.018,s*.304-.069,s*.36+.088,.108,s*.304+.069],.025,rubber);
    }
  } else {
    p.box('wire basket base',[-.374,0,-.268,.374,.039,.268],iron);
    for(const z of [-.273,.273]) {
      for(let n=0;n<9;n++) tube(p,'basket wire',V(-.36+n*.09,.025,z),V(-.39+n*.097,.277,z*1.15),.015,.015,7,steel);
      tube(p,'rolled top rail',V(-.399,.282,z*1.16),V(.399,.282,z*1.16),.021,.021,8,steel);
    }
    for(const x of [-.393,.393]) tube(p,'end top rail',V(x,.282,-.316),V(x,.282,.316),.02,.02,8,steel);
  }
}

function cylinderPulley(p,at,r){
  cyl(p,'drive pulley','x',at,r,.084,14,iron);
  cyl(p,'hub centre','x',[at[0]+.051,at[1],at[2]],r*.46,.036,10,steel);
}
function wheel(p,d) {
  const {id,color}=d;
  const rim=id.startsWith('wheel_rim'), tire=id.startsWith('tire_');
  const flat=id.startsWith('deflated');
  const offroad=id.endsWith('_or');
  const bike=id.includes('bicycle'), woodWheel=id==='wheel_wood', caster=id==='wheel_skate', wide=id.includes('wide');
  if(caster){
    const c=plasticP(0xc18d63);
    profile(p,'solid polyurethane skate wheel',[[.073,0],[.319,0],[.397,.043],[.416,.112],[.416,.27],[.389,.335],[.282,.36],[.087,.36],[.073,.309],[.073,0]],c,{sides:18});
    profile(p,'metal bearing sleeve',[[.075,.012],[.135,.012],[.141,.334],[.075,.334]],steel,{sides:14});
    return;
  }
  if(id==='wheel_mount_medium'){
    bevel(p,'wheel mounting bracket',[-.326,0,-.249,.327,.093,.248],.03,iron);
    for(const x of [-.212,.212]) bevel(p,'bearing support',[x-.058,.079,-.162,x+.058,.279,.165],.025,steel);
    tube(p,'mount axle',V(-.334,.212,0),V(.335,.212,0),.046,.046,9,iron);
    return;
  }
  const parent=p.group('wheel',{at:[0,0,0],rotX:Math.PI*.46});
  const radius=flat?.409:.441, inner=bike?.373:rim?.351:.268;
  const half=wide?.23:bike?(offroad?.096:.057):offroad?.156:.12;
  const tread=woodWheel?wood:rim?steel:rubber;
  const section=[[inner,-half*.77],[inner+.047,-half],[radius*.94,-half],[radius,-half*.67],[radius,half*.68],[radius*.95,half],[inner+.043,half],[inner,half*.75],[inner,-half*.77]];
  profile(p,'wheel cross section',section,tread,{parent,sides:18,scale:flat?[1,.74]:[1,1]});
  if(!tire){
    for(let n=0;n<(bike?12:6);n++){
      const a=n*Math.PI*2/(bike?12:6);
      tube(p,'radial spoke',V(0,0,0),V(inner*Math.cos(a),0,inner*Math.sin(a)*(flat?.74:1)),woodWheel?.041:bike?.009:.033,bike?.009:.024,8,rim||!woodWheel?steel:wood,{parent});
    }
    cyl(p,'wheel hub','y',[0,0,0],caster?.142:.077,half*1.9,12,steel,{parent});
  }
  if(!/slick|rim|wood/.test(id)) for(let n=0;n<18;n++){
    const a=n*Math.PI/9;
    const x=Math.cos(a)*radius*.982,z=Math.sin(a)*radius*.982*(flat?.74:1);
    const treadParent=p.group('lug',{parent,at:[x,0,z],rotY:-a});
    if(offroad){
      for(const y of [-half*.66,half*.66])
        p.box('raised off-road stud',[-.016,y-half*.25,-.022,.039,y+half*.24,.022],rubber,{parent:treadParent});
      if(n%2===0) p.box('center block',[-.014,-half*.24,-.036,.041,half*.24,.035],rubber,{parent:treadParent});
    } else p.box('tread block',[-.012,-half*.65,-.024,.018,half*.66,.024],plasticP(shade(color,.64)),{parent:treadParent});
  }
}

function electronics(p,d) {
  const {id,color,shape}=d, paint=plasticP(color);
  if(id==='camera'){
    bevel(p,'camera body',[-.379,.006,-.167,.379,.465,.166],.057,dark);
    bevel(p,'shutter housing',[-.149,.421,-.08,.161,.512,.122],.036,dark);
    cyl(p,'lens barrel','z',[.04,.232,-.215],.169,.187,14,iron);
    cyl(p,'lens recess','z',[.04,.232,-.312],.137,.031,14,dark);
    cyl(p,'camera lens','z',[.04,.232,-.329],.105,.016,14,glass,GLASS);
    cyl(p,'shutter button','y',[.252,.47,.012],.038,.024,9,steel);
    front(p,'flash window',[.189,.342,.294,.419],-.172,ivory);
    p.box('optical viewfinder',[-.156,.355,-.183,-.091,.417,-.16],glass);
    p.box('rear screen',[-.238,.126,.165,.228,.359,.17],plasticP(0x657b7c));
  } else if(id==='cell_phone'){
    bevel(p,'phone body',[-.221,0,-.432,.221,.079,.432],.028,paint);
    bevel(p,'phone face',[-.194,.071,-.394,.194,.084,.389],.006,dark);
    top(p,'small LCD',[-.16,-.277,.16,.008],.085,plasticP(0x677c78));
    for(let i=0;i<3;i++) for(let j=0;j<4;j++) p.box('number key',[-.154+i*.109,.084,.061+j*.071,-.078+i*.109,.102,.106+j*.071],iron);
  } else if(id==='two_way_radio'||id==='radiocontrol'){
    const radio=id==='two_way_radio';
    bevel(p,'handheld control body',[-.284,0,-.291,.285,.126,.413],.048,paint);
    tube(p,'antenna',V(.131,.073,-.265),V(.185,.077,-.482),.025,.011,8,iron);
    if(radio){
      top(p,'display',[-.203,-.202,.183,-.095],.128,plasticP(0x778d83));
      for(let j=0;j<5;j++) top(p,'speaker grille',[-.184,.009+j*.037,.178,.022+j*.037],.128,dark);
    } else {
      cyl(p,'recessed joystick gate','y',[-.126,.132,.026],.102,.027,11,dark);
      tube(p,'control stick',V(-.126,.131,.026),V(-.154,.224,.047),.027,.021,8,steel);
      for(const [i,z] of [-.16,-.054,.06,.171].entries())
        cyl(p,'colored remote button','y',[.139,.136,z],.037,.039,9,plasticP([0xab5450,0xd1ad61,0x698874,0x62829a][i]));
    }
  } else if(id==='diesel_generator'){
    bevel(p,'engine generator housing',[-.339,.052,-.248,.342,.471,.248],.043,paint);
    for(const x of [-.391,.391]) path(p,'generator roll frame',[[x,.026,-.32],[x,.027,.32],[x,.551,.323],[x,.551,-.319],[x,.026,-.32]],.026,iron);
    for(const x of [-.173,0,.173]) front(p,'socket and switch',[x-.051,.112,x+.051,.235],-.253,dark);
    lid(p,'fuel cap',.062,.468,.033,steel);
  } else if(id==='mixer_music'){
    bevel(p,'mixing desk',[-.43,0,-.315,.43,.115,.316],.032,dark);
    for(let n=0;n<7;n++){
      const x=-.348+n*.113;
      top(p,'slider channel',[x-.009,-.086,x+.009,.242],.116,iron);
      p.box('slider cap',[x-.025,.109,.021+n%3*.054,x+.025,.143,.067+n%3*.054],ivory);
      for(const z of [-.245,-.173]) cyl(p,'channel trim knob','y',[x,.127,z],.024,.031,8,n%2?paint:steel);
    }
  } else if(id==='hand_crank_charger'){
    bevel(p,'dynamo shell',[-.319,0,-.267,.319,.251,.267],.058,paint);
    path(p,'folding crank',[[.164,.254,0],[.249,.299,.03],[.418,.309,.084]],.032,iron);
    cyl(p,'crank grip','y',[.419,.346,.084],.041,.092,9,dark);
    front(p,'charging display',[-.171,.083,.157,.18],-.271,label(color,'CHARGE',d.key));
  } else if(id==='lightstrip_inactive'){
    const points=Array.from({length:32},(_,i)=>{const a=i*.49,r=.10+i*.0095;return [r*Math.cos(a),.024,r*Math.sin(a)];});
    path(p,'coiled flexible LED strip',points,.021,ivory);
    for(const [i,[x,y,z]] of points.entries())
      p.box('colored LED package',[x-.016,y+.01,z-.012,x+.016,y+.027,z+.012],plasticP([0xc78876,0xe0c279,0x82a487,0x889db1][i%4]));
    const [x,y,z]=points.at(-1);
    path(p,'power lead',[[x,y,z],[x-.065,.025,z+.11],[x-.161,.025,z+.169]],.012,dark);
  } else if(id==='reading_light'){
    bevel(p,'spring clip base',[-.139,0,-.232,.139,.069,.185],.027,paint);
    path(p,'flexible light neck',[[0,.052,.143],[0,.253,.125],[0,.563,.025],[0,.611,-.134]],.023,iron);
    bevel(p,'book light head',[-.19,.552,-.284,.19,.642,-.081],.04,paint);
    front(p,'clear light window',[-.126,.566,.126,.617],-.285,ivory);
  } else if(id==='motor_small') engine(p,{...d,shape:'alternator'});
  else if(id==='glowplug') {
    tube(p,'plug shaft',V(0,.058,-.438),V(0,.058,.39),.041,.045,9,steel);
    for(const z of [-.102,-.058,-.014,.03,.074]) cyl(p,'thread collar','z',[0,.057,z],.061,.018,10,steel);
    cyl(p,'hex body','z',[0,.059,.144],.081,.107,6,iron);
  } else workshopParts.electronics(p,{...d,shape});
}

function utility(p,d){
  const {id,shape,color}=d,paint=plasticP(color);
  if(shape==='stand'){
    if(id==='stand_flyer'){
      bevel(p,'freestanding leaflet base',[-.35,0,-.187,.35,.049,.187],.016,iron);
      p.box('upright sign back',[-.31,.038,-.038,.31,.647,.015],paint);
      front(p,'display placard',[-.279,.137,.28,.587],-.04,label(color,'FLYERS',d.key));
      p.box('document shelf',[-.304,.109,-.157,.305,.147,-.027],steel);
    } else if(id==='guitar_stand') {
      path(p,'folding upright',[[0,0,.286],[0,.056,.248],[0,.437,.02],[0,.588,-.101]],.03,iron);
      for(const x of [-.256,.256]){
        path(p,'support foot',[[0,.063,.237],[x,.039,.093],[x*1.35,.031,-.241]],.037,dark);
        path(p,'padded guitar rest',[[0,.202,.006],[x,.186,-.098],[x,.225,-.174]],.037,rubber);
      }
    } else {
      tube(p,'microphone stand pole',V(0,.042,0),V(0,.832,0),.025,.019,9,steel);
      for(let i=0;i<3;i++){
        const a=i*Math.PI*2/3;
        tube(p,'tripod leg',V(0,.098,0),V(.31*Math.cos(a),.026,.31*Math.sin(a)),.022,.022,8,dark);
      }
      tube(p,'tilted boom',V(-.22,.84,0),V(.272,.892,0),.023,.021,8,iron);
    }
  } else if(shape==='compact'){
    const bicycle=id==='horn_bicycle';
    const parent=p.group('horn',{at:[0,.162,0],rotZ:-Math.PI/2});
    profile(p,'flared horn',[[.032,-.034],[.052,.035],[.092,.184],[.171,.313],[.176,.331],[.151,.33],[.076,.173],[.032,.035]],bicycle?brass:paint,{parent,sides:14});
    if(bicycle) blob(p,'rubber bulb',[.163,.132,.132],[-.192,.151,0],rubber,{},4,12);
    else cyl(p,'horn base cylinder','y',[-.141,.169,0],.139,.338,12,paint);
  } else if(id==='stepladder'){
    for(const x of [-.245,.245]){
      bevel(p,'wooden ladder rail',[x-.038,0,-.445,x+.038,.091,.44],.015,wood);
      bevel(p,'folded rear brace',[x-.029,.076,-.34,x+.029,.135,.453],.013,wood);
      bevel(p,'folding hinge',[x-.047,.102,-.377,x+.048,.161,-.321],.014,steel);
    }
    for(const z of [-.295,-.165,-.036,.091,.219,.349])
      bevel(p,'wide wooden step',[-.241,.058,z-.037,.243,.116,z+.037],.01,wood);
  } else if(id==='loom_frame'){
    for(const x of [-.345,.345]) p.box('wooden uprights',[x-.043,0,-.437,x+.043,.09,.434],wood);
    for(const z of [-.412,.412]) p.box('wooden cross rails',[-.374,0,z-.044,.374,.101,z+.044],wood);
    for(let n=0;n<15;n++){
      const x=-.295+n*.042;
      tube(p,'loom warp strand',V(x,.076,-.382),V(x,.079,.383),.006,.006,6,ivory);
    }
    bevel(p,'partially woven cloth',[-.278,.068,-.353,.277,.086,-.067],.007,clothP(0xa69777));
    bevel(p,'wooden shuttle',[-.278,.078,.05,.278,.13,.113],.013,wood);
  } else if(id==='hdframe'||id==='xlframe') {
    const heavy=id==='hdframe';
    for(const x of [-.289,.289]) bevel(p,'longitudinal frame rail',[x-(heavy?.062:.037),0,-.443,x+(heavy?.062:.037),heavy?.152:.078,.443],.02,iron);
    for(const z of [-.355,.355]) tube(p,'cross brace',V(-.317,.055,z),V(.317,.055,z),heavy?.055:.034,heavy?.055:.034,9,steel);
    path(p,'diagonal structural member',[[ -.267,.056,-.338],[0,.056,0],[.267,.056,.338]],heavy?.048:.032,iron);
    if(heavy) for(const x of [-.29,.29]) for(const z of [-.327,.329]) bevel(p,'reinforced anchor',[x-.071,.119,z-.078,x+.071,.185,z+.078],.022,steel);
  } else if(id==='pump_complex'){
    bevel(p,'cast pump base',[-.395,0,-.271,.395,.081,.271],.031,iron);
    bevel(p,'reinforced pump housing',[-.264,.075,-.229,.266,.367,.229],.043,steel);
    cyl(p,'pump drive shaft','x',[.307,.222,0],.102,.171,12,iron);
    for(const z of [-.158,.17]){
      path(p,'external pipe return',[[ -.182,.296,z],[-.284,.433,z],[.081,.451,z],[.231,.309,z]],.033,brass);
      cyl(p,'threaded coupling','y',[-.186,.368,z],.044,.091,9,steel);
    }
    for(const x of [-.241,-.081,.079,.238]) p.box('case cooling rib',[x-.02,.356,-.203,x+.02,.401,.206],iron);
  } else if(id==='tent_pole') {
    for(const x of [-.071,.071]){
      tube(p,'collapsed tent pole segment',V(x,.036,-.436),V(x,.036,.419),.032,.027,8,steel);
      for(const z of [-.201,.089,.29]) cyl(p,'pole joint','z',[x,.036,z],.037,.052,8,iron);
    }
  } else if(id==='folded_skateboard_generic') {
    bevel(p,'wood laminate deck',[-.162,.101,-.407,.162,.147,.407],.041,wood);
    for(const z of [-.374,.373]) bevel(p,'upturned deck end',[-.146,.128,z-.061,.146,.176,z+.065],.031,wood);
    top(p,'grip tape',[-.137,-.365,.138,.365],.15,dark);
    for(const z of [-.239,.239]){
      cyl(p,'skate axle','x',[0,.068,z],.029,.29,10,steel);
      for(const x of [-.138,.138]) cyl(p,'skate wheel','x',[x,.067,z],.064,.06,12,paint);
    }
  } else workshopParts.utility(p,{...d,id:id==='stepladder'?'aluminum_stepladder':id});
}

function powerTool(p,d) {
  const electric=d.id.startsWith('elec');
  const paint=plasticP(electric?0x63828a:0xbb8252);
  bevel(p,'chainsaw housing',[-.448,0,-.197,-.016,.272,.197],.072,paint);
  path(p,'handle',[[-.408,.186,0],[-.427,.334,0],[-.233,.367,0],[-.049,.245,0]],.039,rubber);
  bevel(p,'saw bar',[-.031,.066,-.087,.472,.132,.09],.030,steel);
  for(const z of [-.093,.093]) for(let k=0;k<10;k++){
    const x=.004+k*.046;
    p.box('chain link',[x,.074,z-.018,x+.029,.109,z+.018],iron);
  }
  if(electric) {
    bevel(p,'removable battery casing',[-.469,.033,-.143,-.344,.179,.147],.027,dark);
    p.box('orange release button',[-.429,.173,-.056,-.362,.201,.057],plasticP(0xb57d4c));
  }
  else lid(p,'fuel cap',.046,.271,.035,dark);
}

function meter(p,d){
  const {id,color}=d;
  if(id==='hygrometer'){
    bevel(p,'plastic humidity gauge',[-.351,0,-.301,.351,.114,.301],.037,plasticP(color));
    bevel(p,'LCD recess',[-.267,.108,-.209,.266,.127,.123],.017,dark);
    top(p,'humidity display',[-.229,-.167,.228,.084],.128,label(0x627e72,'54% RH',d.key));
    for(const x of [-.105,0,.105]) cyl(p,'small mode button','y',[x,.121,.207],.036,.021,9,ivory);
    return;
  }
  const round=id==='barometer'||id==='pressure_gauge';
  if(round){
    const paint=id==='barometer'?plasticP(color):steel;
    cyl(p,'dial body','y',[0,.061,-.043],.368,.122,16,paint);
    cyl(p,'dial face','y',[0,.125,-.043],.317,.015,16,ivory);
    for(let n=0;n<11;n++){
      const a=Math.PI*(.2+n*.16);
      tube(p,'scale tick',V(.279*Math.cos(a),.136,-.043+.279*Math.sin(a)),V(.3*Math.cos(a),.136,-.043+.3*Math.sin(a)),.006,.006,6,iron);
    }
    tube(p,'needle',V(0,.139,-.043),V(-.148,.139,-.196),.013,.005,7,dark);
    if(id==='pressure_gauge') cyl(p,'mounting thread','z',[0,.056,.354],.071,.16,9,brass);
  } else {
    workshopTools.meter(p,d);
    if(id==='geiger_off') {
      for(const z of [.155,.19,.225]) top(p,'speaker slot',[-.152,z,-.064,z+.008],.143,dark);
      bevel(p,'detector probe',[-.27,0,-.395,-.21,.062,.282],.022,steel);
    }
  }
}

export const supplyMachinery={ appliance,vehicle:engine,wheel,electronics,utility,powerTool,meter };
