import { blob, woodP } from './item-kit.js';
import { bevel, cyl, front, GLASS, label, path, plasticP, rubber, shade, steelP, top, tube, V } from './common-loot-kit.js';
import { cutShape, oval, profile } from './item-workshop-kit.js';
import { supplyMachinery } from './item-supply-machinery.js';

const steel=steelP(0x9ea5a7);
const dark=steelP(0x5e686d);
const brass=steelP(0xb59559);
const ivory=plasticP(0xe6d8b6);
const wood=woodP(0xa17a50);
const glass=plasticP(0x9cb7b2);

function shaft(p,d) {
  const {id}=d;
  if(id==='motor'){
    cyl(p,'long electric motor casing','x',[-.065,.233,0],.229,.535,16,dark);
    cyl(p,'rear fan cover','x',[-.347,.235,0],.233,.08,16,steel);
    for(let j=0;j<14;j++){
      const a=j*Math.PI*2/14,y=.233+.23*Math.sin(a),z=.23*Math.cos(a);
      path(p,'longitudinal cooling fin',[[-.305,y,z],[.174,y,z]],.015,steel);
    }
    cyl(p,'end bell','x',[.23,.23,0],.178,.112,14,steel);
    cyl(p,'smooth drive shaft','x',[.344,.23,0],.062,.175,12,dark);
    bevel(p,'terminal box',[-.169,.37,-.081,.086,.538,.101],.023,plasticP(0x59665e));
    bevel(p,'cast mounting feet',[-.234,0,-.211,.166,.077,.208],.021,dark);
    return;
  }
  if(/alternator|compressor/.test(id)){
    if(id==='alternator_bicycle'){
      cyl(p,'bicycle dynamo casing','x',[0,.182,0],.167,.438,14,steel);
      cyl(p,'knurled roller','x',[.265,.182,0],.123,.152,14,dark);
      bevel(p,'mounting tab',[-.235,0,-.151,.095,.072,.16],.018,dark);
    } else {
      supplyMachinery.vehicle(p,{...d,shape:'alternator',id:id==='hd_compressor'?'compressor':id});
      if(id==='alternator_truck') bevel(p,'terminal block',[-.132,.416,-.19,.131,.546,.015],.028,rubber);
    }
    return;
  }
  if(id.includes('steam')){
    const small=id.endsWith('small'),r=small?.166:.216;
    bevel(p,'engine bed',[-.442,0,-.33,.44,.061,.329],.027,dark);
    cyl(p,'cylindrical boiler','x',[-.116,r+.061,-.053],r,.586,14,dark);
    for(const x of [-.289,-.062,.087]) cyl(p,'boiler band','x',[x,r+.061,-.052],r+.007,.028,14,brass,{open:true});
    for(const [x,h] of [[.101,.193],[.206,.24],[.31,.287]]){
      cyl(p,'triple-expansion cylinder','y',[x,h*.5+.072,.193],.062,h,10,steel);
      path(p,'steam pipe',[[x,h+.061,.189],[x,h+.099,.122],[x*.54,r+.08,.001]],.019,brass);
    }
    cyl(p,'flywheel','x',[.402,.211,.017],.169,.048,14,steel);
    if(!small) {
      bevel(p,'condenser block',[-.367,.077,-.321,.309,.158,-.232],.018,steel);
      for(const x of [-.307,-.187,-.066,.054,.177,.293]) path(p,'visible condenser fin',[[x,.157,-.319],[x,.157,-.231]],.008,brass);
    }
    return;
  }
  const type=id.match(/^v([268])/)?.[1]??'1';
  const count=Math.ceil(Number(type)/2), banks=type==='1'?[0]:[-1,1];
  const half=type==='1'?.273:type==='2'?.313:.395;
  const paint=id.endsWith('diesel')?steelP(0x697b70):dark;
  bevel(p,'ribbed cast engine housing',[-half,0,-.17,half,.268,.171],.048,paint);
  for(const side of banks){
    const group=p.group('cylinder bank',{at:[0,.258,side*.121],rotX:side*.41});
    bevel(p,'valve cover',[-half+.04,.025,-.113,half-.035,.16,.109],.026,steel,{parent:group});
    for(let i=0;i<count;i++){
      const x=(i-(count-1)/2)*(.57/count);
      const z=side*.239;
      path(p,'bank exhaust branch',[[x,.285,z*.82],[x,.234,z*1.18],[x+.029,.153,z*1.19],[x+.044,.134,z]],.023,brass);
      p.box('cast cover rib',[x-.022,.146,-.096,x+.024,.183,.095],dark,{parent:group});
    }
  }
  cyl(p,'crank pulley','x',[half+.021,.144,0],.111,.072,14,dark);
  cyl(p,'pulley hub','x',[half+.059,.145,0],.047,.028,10,steel);
  if(type==='1') cyl(p,'single-cylinder air intake','y',[-.089,.383,.064],.111,.092,12,rubber);
}
function rig(p,d) {
  const {id,shape}=d;
  if(shape==='wheel') {
    if(!id.includes('caster')) return supplyMachinery.wheel(p,d);
    for(const x of [-.239,.238]) {
      const r=id.endsWith('large')?.156:.119;
      cyl(p,'caster wheel','x',[x,r,0],r,.129,14,rubber);
      cyl(p,'axle rivet','x',[x,r,0],.048,.172,12,steel);
      for(const sign of [-1,1]) bevel(p,'swivel yoke',[x+sign*.094-.024,.098,-.063,x+sign*.094+.024,r*2+.037,.069],.015,steel);
      cyl(p,'pivot stem','y',[x,r*2+.051,0],.059,.115,12,steel);
    }
    return;
  }
  if(shape==='motor') return shaft(p,d);
  if(id==='headlight_reinforced') {
    supplyMachinery.vehicle(p,{...d,shape:'light'});
    for(const x of [-.304,-.158,.002,.16,.305])
      path(p,'metal protective cage',[[x,.432,-.176],[x,.396,-.3],[x,.124,-.309],[x,.042,-.19]],.018,dark);
    return;
  }
  if(id==='ground_solar_panel') {
    const parent=p.group('array rack',{at:[0,.039,0],rotX:-.21});
    for(const x of [-.231,.228]) for(const z of [-.162,.163]){
      bevel(p,'panel frame',[x-.222,0,z-.155,x+.222,.035,z+.155],.012,steel,{parent});
      top(p,'blue photovoltaic cells',[x-.201,z-.138,x+.2,z+.14],.037,(ctx,l,t,w,h)=>{
        ctx.fillStyle='#405e80';ctx.fillRect(l,t,w,h);ctx.fillStyle='#8b9ca6';
        for(let j=1;j<5;j++)ctx.fillRect(l+j*w/5,t,Math.max(1,w*.016),h);
        for(let j=1;j<4;j++)ctx.fillRect(l,t+j*h/4,w,Math.max(1,h*.022));
      },{parent});
    }
    for(const x of [-.277,.275]) path(p,'rear folding kickstand',[[x,.041,-.28],[x,.143,.212],[x,.016,.342]],.017,steel);
    return;
  }
  if(id==='saddle') {
    cutShape(p,'padded saddle',[[-.162,-.424],[.139,-.424],[.153,-.211],[.363,.145],[.349,.328],[.141,.412],[-.148,.41],[-.353,.329],[-.368,.161],[-.162,-.212]],.122,rubber,.082);
    for(const x of [-.097,.097]) path(p,'saddle rail and spring',[[x,.098,-.204],[x,.047,-.071],[x,.026,.207],[x*1.71,.111,.328]],.023,steel);
    return;
  }
  if(id==='seat_bench') {
    bevel(p,'padded seat bench',[-.439,0,-.276,.438,.166,.234],.066,plasticP(0x666b6a));
    bevel(p,'upholstered seat back',[-.439,.063,.143,.437,.428,.264],.058,plasticP(0x646c6b));
    for(const x of [-.275,0,.275]) path(p,'stitched upholstery channel',[[x,.171,-.207],[x,.171,.138],[x,.318,.14],[x,.403,.142]],.012,rubber);
    return;
  }
  if(id==='v_airjack_item') {
    const group=p.group('jack axis',{at:[0,.155,0],rotZ:-Math.PI/2});
    profile(p,'metal extendable air pylon',[[0,-.39],[.151,-.39],[.151,-.326],[.114,-.292],[.114,.167],[.097,.222],[.091,.354],[.132,.367],[.132,.418],[0,.418]],steel,{parent:group,sides:12});
    for(const x of [-.174,.009,.177]) cyl(p,'bellows rib','x',[x,.155,0],.126,.029,14,rubber,{open:true});
    return;
  }
  if(id==='evaporator_coil') {
    const points=Array.from({length:14},(_,i)=>[i%4<2?-.389:.389,.07+Math.floor(i/4)*.048,-.279+i*.041]);
    path(p,'snaking evaporator tubing',points,.026,brass);
    for(let i=0;i<12;i++) p.box('cooling fin',[-.329+i*.058,0,-.267,-.315+i*.058,.113,.29],steel);
    return;
  }
  bevel(p,'plow crossbar',[-.431,.072,-.111,.427,.14,.036],.021,dark);
  for(const x of [-.257,0,.255]){
    cutShape(p,'curved blade',[[x-.112,-.132],[x+.076,-.148],[x+.119,.021],[x+.052,.288],[x-.074,.349],[x-.138,.266]],.07,steel,.019);
    path(p,'plow strut',[[x,.138,-.106],[x,.151,.067],[x,.082,.229]],.022,dark);
  }
  for(const x of [-.384,.383]) cyl(p,'depth wheel','x',[x,.13,.171],.117,.069,12,rubber);
}
function hand(p,d) {
  const {id,name,key,color}=d;
  if(id==='ruler'||id==='shed_stick'){
    cutShape(p,id==='ruler'?'15 cm ruler':'weaving shed stick',[[-.441,-.081],[.413,-.084],[.453,.005],[.411,.082],[-.442,.083]],.039,id==='ruler'?plasticP(0xb1ad68):wood);
    if(id==='ruler') for(let k=0;k<31;k++){
      const x=-.408+k*.0275;
      top(p,'measurement tick',[x,-.075,x+.008,k%2?.016:.052],.041,k%10?dark:rubber);
    }
    return;
  }
  if(id==='sieve_steel'||id==='crucible'){
    const sieve=id==='sieve_steel',r=sieve?.407:.299,h=sieve?.176:.513;
    profile(p,sieve?'stainless sieve ring':'tapered refractory crucible',[[r*.7,0],[r*.83,0],[r*.9,.057],[r,h-.033],[r,h],[r*.873,h],[r*.761,.07],[sieve?r*.7:0,.065],[sieve?r*.7:0,0]],sieve?steel:dark);
    if(sieve) for(let j=-6;j<=6;j++){
      const a=j*.048,b=Math.sqrt(.339**2-a**2);
      path(p,'sieve wire mesh',[[-b,.078,a],[b,.078,a]],.005,steel);
      path(p,'crossed sieve wire',[[a,.085,-b],[a,.085,b]],.005,steel);
    }
    return;
  }
  if(id==='paint_brush') {
    bevel(p,'wooden handle',[-.442,0,-.088,.009,.098,.087],.039,wood);
    bevel(p,'crimped ferrule',[-.054,.014,-.186,.114,.131,.182],.027,steel);
    cutShape(p,'wide brush bristles',[[.09,-.177],[.412,-.195],[.448,-.139],[.431,.152],[.383,.191],[.09,.172]],.083,plasticP(0xa78458),.025);
    for(const z of [-.14,-.092,-.044,0,.048,.097,.143]) path(p,'bristle separation',[[.152,.11,z],[.432,.11,z*.93]],.008,woodP(0x796044));
    return;
  }
  if(id==='scissors_wavy'||id==='metalworking_tongs'){
    const scissors=id==='scissors_wavy';
    for(const s of [-1,1]){
      if(scissors) cutShape(p,'finger loop',oval(-.272,s*.136,.131,.101,12),.066,plasticP(s>0?0x6c8d78:0x5b827e),.014,[oval(-.267,s*.135,.077,.056,10)]);
      path(p,'long lever arm',[[-.328,.047,s*.153],[-.161,.061,s*.092],[.045,.076,s*.015],[.304,.073,-s*.091],[.399,.068,-s*.129]],scissors?.032:.038,steel);
      if(scissors) path(p,'wavy craft edge',Array.from({length:9},(_,k)=>[.075+k*.041,.076,-s*(.009+k*.013+Math.sin(k*1.6)*.011)]),.025,steel);
    }
    cyl(p,'pivot pin','y',[.052,.082,0],.05,.04,11,dark);
    return;
  }
  if(id==='lifestraw'||id==='whistle_multitool'){
    const straw=id==='lifestraw';
    cyl(p,'plastic tool body','x',[0,.103,0],.105,.705,14,plasticP(straw?0x597f94:0x83925d));
    for(const x of [-.366,.367]) cyl(p,'end collar','x',[x,.106,0],.109,.093,12,ivory);
    if(!straw) for(const x of [-.127,.139]){
      cyl(p,'round instrument inset','y',[x,.206,0],.069,.028,12,rubber);
      cyl(p,'instrument lens','y',[x,.225,0],.053,.021,12,glass,{glass:true});
    }
    return;
  }
  if(id==='swage'){
    for(const [x,z,c] of [[-.232,-.13,steel],[.01,.142,dark],[.233,-.102,steel]]){
      bevel(p,'metal swage block',[x-.143,0,z-.144,x+.143,.137,z+.145],.026,c);
      top(p,'impression mark',[x-.075,z-.07,x+.075,z+.07],.139,rubber);
    }
    return;
  }
  if(id==='water_purifier'){
    bevel(p,'portable filter body',[-.324,0,-.202,.277,.277,.2],.055,plasticP(0x687f6a));
    path(p,'filter inlet and outlet hose',[[.231,.133,.109],[.397,.139,.152],[.425,.153,.266],[.291,.109,.312],[.051,.074,.262]],.028,rubber);
    top(p,'purifier control panel',[-.25,-.127,.116,.115],.28,label(0x4d6c67,name,key));
    return;
  }
  if(id==='drift'||id==='hotcut'){
    for(const z of id==='drift'?[-.168,0,.163]:[0]){
      tube(p,'hardened tool shaft',V(-.393,.052,z),V(.197,.051,z),.062,.051,8,dark);
      tube(p,'tapered working tip',V(.166,.051,z),V(.418,.048,z),.05,.016,8,steel);
    }
    return;
  }
  if(id==='puller'){
    path(p,'impact puller handle',[[-.418,.049,.017],[-.071,.061,.03],[.235,.087,.041]],.04,plasticP(0x6f8f80));
    cyl(p,'hollow polymer head','z',[.237,.101,.042],.092,.423,14,plasticP(0x6f8f80));
    for(const z of [-.17,.251]) cyl(p,'cap','z',[.238,.104,z],.096,.052,11,dark);
    return;
  }
  const folding=id==='utility_knife_folding',hook=id==='ny_hook',pole=id==='brush_pole';
  const grip=folding?plasticP(color):hook?dark:wood;
  tube(p,'tool handle',V(-.426,.064,0),V(.259,.064,0),folding?.064:.04,folding?.067:.035,10,grip);
  if(hook) for(const s of [-1,1]) path(p,'steel hook',[[.215,.059,0],[.319,.058,s*.092],[.418,.056,s*.086],[.393,.056,s*.026]],.028,steel);
  else if(pole||folding) cutShape(p,'steel working end',[[.095,-.046],[.37,-.076],[.473,-.012],[.402,.1],[.31,.122],[.277,.035],[.12,.034]],.039,steel,.046);
  else {
    bevel(p,'glass cutter head',[.24,.027,-.075,.414,.105,.076],.016,steel);
    cyl(p,'small scoring wheel','z',[.406,.053,.001],.04,.076,10,dark);
  }
}
function device(p,d) {
  const {id,name,key,color}=d;
  if(id==='memory_card_unread'){
    cutShape(p,'memory card shell',[[-.322,-.383],[.206,-.387],[.335,-.212],[.335,.374],[-.322,.373]],.071,rubber);
    top(p,'capacity label',[-.263,-.169,.253,.31],.075,label(0x66727b,'MEMORY CARD',key));
    for(let j=0;j<8;j++) p.box('gold contact',[-.25+j*.064,.051,-.369,-.214+j*.064,.073,-.237],brass);
    return;
  }
  if(id==='radio_car'){
    bevel(p,'toy car body',[-.347,.077,-.209,.34,.239,.204],.061,plasticP(0xa55b46));
    bevel(p,'windscreen cabin',[-.103,.187,-.138,.185,.334,.131],.047,plasticP(0x627b82));
    for(const x of [-.228,.226])for(const z of [-.218,.211]){
      cyl(p,'rubber toy tire','z',[x,.104,z],.102,.077,12,rubber);
      cyl(p,'toy wheel hub','z',[x,.102,z+Math.sign(z)*.038],.053,.021,10,steel);
    }
    path(p,'antenna',[[.231,.23,.125],[.253,.403,.159],[.31,.504,.201]],.011,rubber);
    return;
  }
  if(id==='wrapped_rad_badge'){
    bevel(p,'foil sealed badge bag',[-.379,0,-.3,.379,.074,.3],.028,steel);
    top(p,'sealed badge notice',[-.307,-.235,.306,.233],.077,label(0xa09256,'DOSIMETER',key));
    for(const x of [-.365,.365]) path(p,'laminated seal',[[x,.062,-.269],[x,.07,.26]],.011,dark);
    return;
  }
  if(/lighter/.test(id)){
    const refill=id.startsWith('ref_');
    bevel(p,'lighter body',[-.233,0,-.147,.231,.511,.151],.041,plasticP(color));
    bevel(p,'metal lighter cover',[-.185,.419,-.107,.182,.635,.113],.024,steel);
    if(refill) {
      cyl(p,'slender lighter nose','y',[.065,.721,0],.043,.243,11,dark);
      path(p,'trigger guard',[[-.138,.466,-.111],[-.132,.448,-.252],[-.129,.292,-.252],[-.128,.258,-.132]],.025,plasticP(color));
      bevel(p,'trigger',[-.166,.358,-.201,-.084,.434,-.124],.017,rubber);
    } else {
      bevel(p,'charging port cover',[-.079,.035,-.158,.077,.085,-.123],.008,rubber);
      path(p,'hinged lid separation',[[-.172,.524,-.111],[.164,.524,-.112]],.011,dark);
    }
    return;
  }
  const controller=id==='remotevehcontrol', emf=id==='emf_detector';
  const w=controller?.292:emf?.154:.246, z=controller?.337:.413;
  bevel(p,'handheld electronics housing',[-w,0,-z,w,.156,z],.037,plasticP(shade(color,.81)));
  bevel(p,'screen recess',[-w*.81,.132,-z+.044,w*.81,.169,-.047],.021,rubber);
  top(p,'display and markings',[-w*.66,-z+.073,w*.66,-.071],.171,label(0x526962,name,key));
  for(const x of [-w*.58,0,w*.58]){
    cyl(p,'rubber function button','y',[x,.165,.084],.032,.023,9,ivory);
    if(controller) cyl(p,'second control','y',[x,.164,.199],.033,.024,9,rubber);
  }
  if(id==='electrohack') for(const x of [-.155,-.077,.001,.078,.156]) bevel(p,'hardware port',[x-.023,.022,z-.013,x+.023,.077,z+.021],.006,steel);
  if(controller) path(p,'short antenna',[[w*.75,.084,-z],[w*.81,.09,-z-.118]],.023,rubber);
}
function cabinet(p,d) {
  const {id,name,key,color}=d;
  if(id==='oven_controls') {
    bevel(p,'stove control fascia',[-.425,0,-.147,.425,.108,.142],.024,steel);
    top(p,'LCD display',[-.104,-.081,.117,.084],.11,label(0x515c5c,'CLOCK',key));
    for(const x of [-.325,-.227,.229,.327]) cyl(p,'stove control knob','y',[x,.113,.009],.049,.052,12,dark);
    return;
  }
  if(id==='oven_door'||id==='oven_stovetop'){
    bevel(p,'enameled stove panel',[-.424,0,-.318,.424,.081,.321],.024,dark);
    if(id==='oven_door'){
      bevel(p,'glass oven viewing window',[-.337,.036,-.23,.337,.085,.22],.022,glass);
      path(p,'door bar handle',[[-.338,.076,-.22],[-.308,.173,-.22],[.312,.173,-.22],[.336,.076,-.22]],.022,steel);
    } else for(const x of [-.203,.203]) for(const z of [-.152,.15]) {
      cutShape(p,'removed burner inset',oval(x,z,.118,.106),.008,steel,.079,[oval(x,z,.082,.073)]);
      cyl(p,'exposed circular recess','y',[x,.078,z],.084,.012,12,rubber);
    }
    return;
  }
  const oven=id==='oven_cabinet',freezer=id==='minifreezer';
  const h=oven?.637:freezer?.733:.677;
  const w=oven?.372:.335, z=.256, coat=plasticP(oven?0x707879:0xc2c3b4);
  if(oven) {
    for(const x of [-w,w]) bevel(p,'bare steel cabinet side',[x-.033,0,-z,x+.033,h,z],.018,coat);
    p.box('rear wall',[-w,0,z-.056,w,h,z+.025],coat);
    p.box('cabinet floor',[-w,0,-z,w,.067,z],steel);
    p.box('bare steel top',[-w,h-.04,-z,w,h+.012,z],coat);
    for(const y of [.228,.406]) for(const x of [-w,w]) p.box('internal shelf rail',[x-.046,y,-z,x+.046,y+.03,z],steel);
    return;
  }
  bevel(p,'insulated appliance body',[-w,0,-z,w,h,z],.052,coat);
  bevel(p,'gasket and door',[-w+.012,.038,-z-.064,w-.011,h-.029,-z],.038,coat);
  path(p,'capped appliance handle',[[-.218,.476,-.327],[-.219,.52,-.35],[-.219,.647,-.35]],.021,steel);
  if(freezer) {
    front(p,'freezer badge',[.067,.547,.256,.643],-.322,label(0x74858b,'FREEZER',key));
    for(const y of [.082,.116,.15]) path(p,'compressor grille',[[-.251,y,-.322],[.258,y,-.322]],.009,dark);
  }
}
function bench(p,d) {
  const {id,name,key,color}=d;
  const paint=plasticP(color);
  if(/oven_|minifreezer|minifridge/.test(id)) return cabinet(p,d);
  if(id==='anvil'){
    bevel(p,'anvil foot',[-.264,0,-.189,.25,.079,.189],.025,dark);
    bevel(p,'solid anvil waist',[-.218,.056,-.121,.218,.262,.121],.041,dark);
    cutShape(p,'anvil face and long horn',[[-.451,-.031],[-.251,-.14],[.059,-.154],[.417,-.132],[.419,.147],[-.17,.151],[-.385,.059]],.13,steel,.214,[oval(.295,.059,.055,.043,4),oval(.165,-.059,.028,.028,9)]);
    return;
  }
  if(id==='fan'||id==='electric_spinwheel') {
    const fan=id==='fan';
    bevel(p,'counterweighted base',[-.316,0,-.224,.314,.081,.224],.039,dark);
    path(p,'vertical stand',[[0,.061,.038],[0,.235,.037],[0,.47,.023]],.049,paint);
    cyl(p,'drive housing','z',[0,.474,.002],fan?.092:.147,.158,12,steel);
    const parent=p.group('upright wheel',{at:[0,.471,-.091],rotX:-Math.PI/2});
    const r=fan?.322:.353;
    profile(p,fan?'fan outer cage':'drive wheel rim',[[r-.029,-.059],[r,-.059],[r,.047],[r-.024,.059],[r-.029,-.059]],steel,{parent,sides:18});
    for(let j=0;j<(fan?5:8);j++){
      const a=j*Math.PI*2/(fan?5:8),x=Math.cos(a),z=Math.sin(a);
      tube(p,'radial wire or spoke',V(0,.05,0),V(x*r,.05,z*r),.012,.012,7,steel,{parent});
      if(fan){
        const blade=p.group('blade axis',{parent,rotY:-a});
        p.box('impeller paddles',[.071,-.016,-.036,.268,.012,.053],paint,{parent:blade});
      }
    }
    if(!fan) cyl(p,'spindle with wound yarn','x',[.055,.198,-.104],.071,.405,12,ivory);
    else {
      for(const rr of [.134,.217,.279]) profile(p,'circular wire guard',[[rr-.005,.043],[rr+.004,.043],[rr+.004,.056],[rr-.005,.056],[rr-.005,.043]],steel,{parent,sides:20});
      cyl(p,'center cap','z',[0,.472,-.154],.072,.046,12,paint);
    }
    return;
  }
  if(id==='arbor_press'||id==='can_sealer'||id==='belt_grinder') {
    bevel(p,'cast base',[-.35,0,-.245,.35,.079,.245],.036,dark);
    const grinder=id==='belt_grinder';
    if(id==='can_sealer'){
      bevel(p,'upright support',[-.277,.079,.054,-.126,.58,.193],.026,paint);
      bevel(p,'cast gearbox head',[-.271,.499,-.128,.213,.633,.175],.039,steel);
      cyl(p,'round sealing head','y',[.095,.469,-.076],.097,.092,14,steel);
      cyl(p,'tin size adapter','y',[.096,.184,-.076],.153,.059,14,dark);
      cyl(p,'display tin can','y',[.094,.322,-.076],.133,.216,14,steel);
      path(p,'rotating crank',[[.212,.568,0],[.329,.572,0],[.386,.571,-.158],[.475,.571,-.158]],.026,dark);
      return;
    }
    bevel(p,'upright frame',[-.248,.068,-.194,-.069,.685,.174],.047,paint);
    bevel(p,'cantilever head',[-.232,.541,-.165,.189,.677,.166],.036,paint);
    if(grinder) {
      for(const y of [.218,.594]) cyl(p,'abrasive belt roller','z',[.108,y,0],.113,.199,14,steel);
      path(p,'abrasive belt edge',[[.221,.214,-.081],[.219,.598,-.081],[.13,.692,-.081],[.038,.61,-.081],[.01,.219,-.081],[.105,.11,-.081],[.22,.215,-.081]],.023,rubber);
      bevel(p,'tool rest',[.081,.277,-.182,.374,.332,.164],.015,steel);
    } else {
      cyl(p,'vertical press shaft','y',[.136,.375,0],.049,.387,10,steel);
      cyl(p,'round die or tin holder','y',[.136,.105,0],.117,.074,12,steel);
      path(p,'hand lever',[[.109,.591,-.097],[.252,.641,-.197],[.434,.704,-.196]],.027,dark);
      cyl(p,'handgrip','x',[.409,.692,-.196],.036,.133,10,rubber);
    }
    return;
  }
  if(id==='rotovap'){
    bevel(p,'instrument base',[-.408,0,-.281,.407,.095,.276],.037,paint);
    cyl(p,'lift support','y',[-.233,.369,.124],.045,.564,12,steel);
    tube(p,'angled glass condenser',V(-.204,.611,.13),V(.061,.469,-.076),.083,.067,13,glass,GLASS);
    for(const [x,y,z,r] of [[.159,.353,-.156,.137],[-.274,.288,.043,.113]]) {
      blob(p,'round bottom flask',[r,r,r],[x,y,z],glass,GLASS,5,12);
      cyl(p,'glass flask neck','y',[x,y+r, z],r*.36,.133,11,glass,GLASS);
    }
    bevel(p,'heater and control panel',[.025,.094,-.235,.321,.214,.017],.022,dark);
    return;
  }
  if(id==='autoclave'){
    bevel(p,'autoclave housing',[-.402,0,-.313,.4,.484,.305],.062,steel);
    cyl(p,'round pressure chamber door','z',[-.062,.248,-.327],.208,.097,16,dark);
    cyl(p,'round door face','z',[-.062,.248,-.383],.175,.025,16,steel);
    path(p,'door latch grip',[[-.203,.248,-.397],[.079,.248,-.397]],.028,rubber);
    front(p,'status panel',[.203,.19,.346,.379],-.316,label(color,'STEAM',key));
    return;
  }
  if(id==='vac_mold'||id==='mobile_weather_station'){
    bevel(p,'rugged equipment case',[-.42,0,-.279,.421,.254,.27],.052,id==='mobile_weather_station'?plasticP(0xc7aa53):paint);
    bevel(p,id==='vac_mold'?'upper platen':'removable lid',[-.413,.239,-.279,.413,.353,.268],.028,steel);
    if(id==='vac_mold') {
      for(const x of [-.233,-.115,0,.115,.232]) for(const z of [-.147,-.04,.07,.174])
        cyl(p,'platen suction perforation','y',[x,.355,z],.014,.006,8,rubber);
    } else {
      path(p,'handle',[[-.188,.17,-.265],[-.101,.169,-.376],[.117,.169,-.376],[.187,.177,-.267]],.023,rubber);
      top(p,'weather equipment legend',[-.277,-.186,.274,.194],.356,label(0x75827b,'WEATHER KIT',key));
    }
    return;
  }
  if(id==='portable_generator'){
    bevel(p,'fuel tank',[-.303,.332,-.226,.311,.467,.218],.044,paint);
    lidOnTank(p);
    cyl(p,'generator output body','x',[.056,.205,0],.173,.511,14,steel);
    front(p,'output socket panel',[-.251,.091,.196,.29],-.17,label(0x686e68,'GENERATOR',key));
    for(const z of [-.265,.259]) path(p,'protective carry cage',[[-.4,.027,z],[-.401,.484,z],[-.27,.552,z],[.29,.552,z],[.4,.482,z],[.4,.03,z],[-.4,.027,z]],.025,dark);
    return;
  }
  bevel(p,'pump skid base',[-.407,0,-.24,.404,.064,.238],.026,dark);
  cyl(p,'electric pump drive','x',[.048,.205,.045],.145,.496,14,steel);
  bevel(p,'pump chamber',[-.363,.055,-.175,-.09,.311,.174],.043,paint);
  if(id==='recovery_pump'){
    bevel(p,'ventilated recovery case',[.034,.084,-.19,.363,.337,.211],.047,plasticP(0x628176));
    for(const y of [.144,.187,.23,.273]) path(p,'recovery cooling grille',[[.102,y,-.197],[.29,y,-.197]],.01,dark);
  }
  for(const x of [-.092,-.01,.073,.151,.229]) cyl(p,'cooling rib','x',[x,.205,.045],.149,.018,14,dark,{open:true});
  path(p,'carrying handle',[[-.247,.297,-.017],[-.185,.432,-.017],[.123,.432,-.017],[.26,.293,-.017]],.025,rubber);
  for(const x of [-.277,-.165]) cyl(p,'external threaded port','y',[x,.345,-.089],.036,.098,11,brass);
}
function lidOnTank(p) {
  cyl(p,'visible fuel cap','y',[.132,.479,.035],.074,.047,12,rubber);
}
function kit(p,d) {
  const {id,name,key,color}=d;
  if(id==='sandbox_kit'){
    profile(p,'sand bucket',[[0,0],[.224,0],[.237,.027],[.294,.384],[.274,.396],[.255,.358],[.209,.04],[0,.04]],plasticP(0xa96859));
    path(p,'plastic carry handle',[[-.282,.318,0],[-.301,.505,0],[-.188,.597,0],[.17,.604,0],[.302,.503,0],[.281,.351,0]],.023,ivory);
    for(const x of [-.089,.108]) path(p,'toy handle',[[x,.077,.059],[x,.28,.044],[x*.8,.581,-.079]],.024,plasticP(x<0?0x69918a:0xc5a34d));
    cutShape(p,'spade head',[[-.18,-.169],[-.024,-.176],[-.04,-.024],[-.12,.02],[-.188,-.031]],.031,plasticP(0x70988a),.558);
    for(const x of [.062,.112,.162]) path(p,'rake teeth',[[x,.575,-.134],[x,.568,-.047],[x,.519,-.025]],.015,plasticP(0xc7a450));
    return;
  }
  if(id==='wash_kit'){
    bevel(p,'wood-frame washboard',[-.329,0,-.399,.329,.087,.399],.026,wood);
    bevel(p,'metal washing surface',[-.224,.066,-.263,.224,.101,.281],.009,steel);
    for(let j=0;j<12;j++) path(p,'corrugated panel',[[-.218,.101,-.251+j*.045],[.213,.101,-.251+j*.045]],.016,steel);
    bevel(p,'wooden scrubbing brush',[.05,.109,-.08,.368,.189,.094],.02,wood);
    return;
  }
  bevel(p,'equipment tray',[-.426,0,-.301,.426,.101,.3],.034,plasticP(shade(color,.84)));
  top(p,'lid label',[-.371,-.265,-.018,.245],.104,label(color,name,key));
  if(id==='tire_repair_kit'){
    for(const z of [-.17,.008,.173]){
      path(p,'coiled tire plug cord',[[.024,.125,z],[.348,.127,z-.038],[.371,.124,z+.031],[.059,.126,z+.07]],.019,brass);
    }
    cyl(p,'glue tube','x',[.205,.181,-.196],.055,.309,11,steel);
    return;
  }
  if(id==='engineering_engine_kit'){
    bevel(p,'display base for engine parts',[.031,.095,-.204,.387,.129,.214],.015,wood);
    cyl(p,'miniature flywheel','z',[.259,.272,.035],.134,.05,13,brass);
    cyl(p,'miniature demonstration cylinder','x',[.138,.191,-.121],.069,.223,12,steel);
    path(p,'link arm',[[.076,.164,.017],[.172,.221,.012],[.259,.272,.011]],.015,steel);
    return;
  }
  if(id==='engineering_robotics_kit'){
    bevel(p,'small robot chassis',[.023,.099,-.07,.319,.181,.133],.023,plasticP(0x74898a));
    for(const x of [.079,.254])for(const z of [-.101,.161]) cyl(p,'robot wheel','z',[x,.143,z],.063,.047,11,rubber);
    bevel(p,'robot control board',[.109,.174,-.04,.245,.199,.083],.006,plasticP(0x618478));
    return;
  }
  for(const [x,z] of [[.086,-.179],[.266,-.176],[.09,.021],[.274,.096],[.115,.189]]){
    bevel(p,'educational component',[x-.056,.09,z-.064,x+.059,.193,z+.061],.015,plasticP(shade(color,1.22)));
    cyl(p,'peg or wheel','y',[x,.181,z],.03,.051,9,steel);
  }
}
function shop(p,d) {
  const draw={bench,hand,device,kit}[d.shape];
  draw(p,d);
}

export const marketShop={rig,shop};
