import { blob, can, lump, speckle, woodP } from './item-kit.js';
import { bevel, clothP, cyl, fill, front, GLASS, label, lid, paperP, path, plasticP, rubber, shade, steelP, top, tube, V } from './common-loot-kit.js';
import { cutShape, oval, profile } from './item-workshop-kit.js';
import { supplyGoods } from './item-supply-goods.js';
import { reading } from './item-expansion-reading.js';

const wood=woodP(0x99704c);
const darkWood=woodP(0x65483a);
const steel=steelP(0xa5afb1);
const brass=steelP(0xb39458);
const ivory=plasticP(0xe0d6bc);
const green=clothP(0x666e52);

function strings(p,d) {
  const {id}=d,banjo=id==='banjo',electric=id==='guitar_electric',violin=id==='violin';
  const body=banjo?oval(-.154,0,.284,.274,16):[
    [-.467,-.119],[-.408,-.228],[-.271,-.262],[-.154,-.193],[-.049,-.174],[.059,-.212],[.197,-.135],
    [.201,.102],[.086,.215],[-.055,.185],[-.139,.16],[-.255,.252],[-.408,.236],[-.468,.126],
  ];
  const edge=electric?plasticP(0x733f48):wood;
  cutShape(p,'contoured instrument body',body,violin?.089:.119,edge);
  if(!electric) cutShape(p,banjo?'stretched drum head':'soundboard',body.map(([x,z])=>[x*.913-.01,z*.9]),.014,banjo?ivory:woodP(violin?0xae754b:0xc79962),violin?.082:.115);
  const neckAt=violin?.118:.139,z=violin?.038:.041;
  const tip=banjo?.667:violin?.46:.633;
  const bridgeX=violin?-.235:-.267;
  bevel(p,'neck and headstock',[.063,neckAt-.089,-z,tip,neckAt+.007,z],.018,darkWood);
  bevel(p,'tuning head',[tip-.067,neckAt-.084,-.082,tip+.056,neckAt+.018,.086],.018,edge);
  if(banjo) profile(p,'silver banjo rim',[[.271,.103],[.287,.103],[.29,.117],[.276,.134]],steel,{at:[-.154,0],sides:16});
  if(violin) {
    for(const s of [-1,1]) path(p,'violin f sound hole',[[-.221,.101,s*.124],[-.15,.101,s*.154],[-.08,.103,s*.118],[-.125,.106,s*.095]],.013,darkWood);
    path(p,'resting bow',[[-.395,.033,.281],[-.127,.052,.342],[.154,.055,.354],[.436,.048,.377]],.012,wood);
    path(p,'bow hair',[[-.39,.031,.284],[.436,.032,.377]],.007,ivory);
  } else if(electric) {
    for(const x of [-.177,-.109,-.039]) bevel(p,'pickup and bridge',[x-.023,.118,-.066,x+.024,.149,.073],.011,ivory);
    for(const x of [-.32,-.256]) cyl(p,'volume or tone knob','y',[x,.135,.134],.027,.028,10,ivory);
  } else if(!banjo) cyl(p,'round sound hole','y',[-.123,.129,0],.083,.005,14,darkWood);
  bevel(p,'string bridge',[-.284,neckAt-.01,-.083,-.251,neckAt+.038,.083],.008,ivory);
  for(const z0 of (violin?[-.024,-.008,.008,.024]:[-.03,-.017,-.005,.007,.018,.03])) path(p,'instrument string',[[bridgeX,neckAt+.038,z0],[tip-.17,neckAt+.018,z0*.68],[tip+.029,neckAt+.021,z0*.52]],.0034,steel);
  if(!violin) for(let j=0;j<9;j++){
    const x=.08+j*(tip-.186)/9;
    path(p,'metal fret',[[x,neckAt+.008,-z],[x,neckAt+.008,z]],.004,steel);
  }
  for(const x of [tip-.05,tip-.012,tip+.027]) for(const s of [-1,1]) cyl(p,'tuning key','z',[x,neckAt-.031,s*.087],.013,.075,8,steel);
  if(!banjo&&!violin) path(p,'carrying strap',[[-.414,.035,.128],[-.343,.025,.306],[.064,.026,.327],[.371,.027,.236],[.424,.036,.07]],.018,clothP(0x665b50));
}
function winds(p,d) {
  const {id}=d;
  const flute=id==='flute',clarinet=id==='clarinet',sax=id==='saxophone',tuba=id==='tuba';
  if(flute||clarinet) {
    const paint=flute?steel:darkWood;
    tube(p,'long keyed instrument body',V(-.411,.081,0),V(.374,.081,0),.044,clarinet?.057:.047,12,paint);
    for(let k=0;k<9;k++){
      const x=-.268+k*.074;
      cyl(p,'silver finger key','y',[x,.127,k%2?.039:-.015],.025,.022,8,steel);
      cyl(p,'tube ferrule','x',[x,.081,0],.048,.011,10,steel,{open:true});
    }
    if(clarinet) profile(p,'flared bell',[[.045,.33],[.06,.383],[.09,.447],[.127,.474],[.101,.477],[.057,.417]],darkWood,{parent:p.group('bell axis',{at:[0,.12,0],rotZ:-Math.PI/2})});
    else cyl(p,'tone hole collar','y',[-.303,.132,0],.032,.013,11,steel);
    return;
  }
  const pipe=sax?.063:tuba?.069:.032;
  const line=sax?[[-.398,.105,-.185],[-.266,.122,-.251],[-.129,.099,-.19],[.107,.092,-.01],[.329,.092,.157],[.32,.119,.297],[.166,.17,.303],[.105,.275,.259]]:tuba?[[-.31,.11,-.326],[-.13,.1,-.32],[.19,.102,-.258],[.344,.106,-.097],[.358,.124,.183],[.185,.13,.308],[-.162,.136,.31],[-.295,.155,.186],[-.21,.231,.011]]:[[-.43,.11,-.125],[.281,.11,-.124],[.382,.112,-.048],[.356,.112,.085],[.216,.111,.126],[-.23,.113,.124],[-.29,.112,.007],[-.198,.118,-.051],[.169,.126,-.049]];
  path(p,'bent brass tubing',line,pipe,brass,{metal:true});
  const [x,y,z]=line.at(-1);
  const parent=p.group('flared bell axis',{at:[x,y,z],rotZ:tuba?.12:sax?-.48:-Math.PI/2});
  const r=tuba?.226:sax?.168:.127;
  profile(p,'open flared bell',[[pipe*.8,0],[pipe,.08],[r*.63,.148],[r,.216],[r*1.02,.227],[r*.86,.225],[r*.6,.165],[pipe*.71,.077],[pipe*.69,0]],brass,{parent,sides:14,metal:true});
  for(let j=0;j<(sax?7:3);j++){
    const x0=sax?-.162+j*.064:-.158+j*.094,z0=sax?-.166+j*.051:-.089;
    cyl(p,sax?'saxophone key':'piston valve','y',[x0,.151,z0],sax?.024:.043,.108,11,brass);
    cyl(p,'finger button','y',[x0,.218,z0],.035,.018,9,ivory);
  }
  if(tuba||sax) path(p,'dark carrying strap',[[-.299,.031,-.067],[-.347,.034,.143],[-.242,.031,.357],[.031,.039,.398],[.221,.043,.31]],.019,clothP(0x55504a));
}
function board(p,d) {
  const {id,name,key,color}=d;
  if(id==='jackstraws') {
    cyl(p,'printed cardboard tube','x',[0,.141,0],.142,.805,14,paperP(0xbe9e71));
    cyl(p,'tube cap','x',[-.401,.141,0],.146,.056,14,plasticP(color));
    for(const [j,c] of [0xb56866,0x768a5c,0xc2a457,0x5e8292,0xa27492].entries())
      path(p,'colored pick-up stick',[[.081,.024,.149+j*.041],[.438,.026,.164+j*.039]],.009,plasticP(c));
    top(p,'tube wordmark',[-.309,-.053,.319,.053],.285,label(color,'JACKSTRAWS',key));
    return;
  }
  if(id==='deck_of_tarot_cards') {
    for(const [x,z,y] of [[-.14,-.078,0],[.12,.043,.052],[-.044,.118,.074]]) {
      bevel(p,'glossy cardstock stack',[x-.177,y,z-.255,x+.177,y+.052,z+.255],.013,paperP(0xe4d7b7));
      top(p,'original tarot card print',[x-.162,z-.239,x+.162,z+.24],y+.054,label(0x5f526f,'TAROT',key));
    }
    return;
  }
  if(id==='poppirate') {
    profile(p,'toy barrel',[[0,0],[.202,0],[.246,.096],[.274,.241],[.249,.411],[.207,.452],[.169,.451],[.191,.33],[0,.33]],wood,{sides:14});
    for(const y of [.13,.352]) cyl(p,'barrel hoop','y',[0,y,0],.264,.045,14,steel,{open:true});
    blob(p,'pirate head',[.121,.139,.115],[0,.501,0],plasticP(0xbb8b61),{},4,10);
    bevel(p,'pirate hat',[-.184,.587,-.074,.184,.66,.089],.026,plasticP(0x51444c));
    for(const x of [-.119,.111]) cyl(p,'toy sword slot','z',[x,.243,-.244],.031,.017,9,rubber);
    return;
  }
  const timber=/backgammon|mancala|tangram|chaturanga|domino|^go$/.test(id);
  const material=timber?darkWood:paperP(shade(color,.75));
  const border=timber?wood:paperP(shade(color,1.24));
  const z=id==='mancala'?.213:.297;
  bevel(p,'game case',[-.434,0,-z,.434,.127,z],.031,material);
  bevel(p,'fitted lid',[-.437,.103,-z-.003,.435,.161,z+.006],.021,border);
  if(timber){
    if(id==='mancala') {
      for(const x of [-.307,-.193,-.071,.071,.193,.307]) for(const y of [-.091,.091])
        cyl(p,'dark carved pit','y',[x,.162,y],.035,.008,10,darkWood);
    } else if(id==='domino') {
      for(const [x,y] of [[-.225,-.1],[-.043,.048],[.179,-.082]]) {
        bevel(p,'wooden domino',[x-.069,.159,y-.11,x+.069,.188,y+.11],.008,ivory);
        for(const dx of [-.034,.034]) for(const dz of [-.063,0,.06]) cyl(p,'domino pip','y',[x+dx,.19,y+dz],.008,.005,7,darkWood);
      }
    } else if(id==='tangram') {
      for(const [x,z,c] of [[-.251,-.11,0x9d5251],[-.043,-.15,0x5d799a],[.22,-.1,0xc2a361],[.17,.088,0x769168]]) cutShape(p,'painted puzzle piece',[[x-.103,z-.062],[x+.117,z-.061],[x+.03,z+.13]],.023,woodP(c),.159);
    } else if(id==='backgammon') {
      for(const s of [-1,1]) for(let k=0;k<6;k++){
        const x=-.344+k*.133;
        cutShape(p,'inlaid triangular point',[[x-.05,s*.259],[x+.05,s*.259],[x,s*.039]],.009,k%2?woodP(0xb18454):woodP(0x925547),.162);
      }
    } else {
      const rows=id==='go'?9:8;
      for(let k=0;k<=rows;k++){
        const x=-.315+k*.63/rows,z=-.237+k*.474/rows;
        top(p,'board grid',[x-.004,-.238,x+.004,.238],.164,darkWood);
        top(p,'board grid',[-.315,z-.004,.315,z+.004],.164,darkWood);
      }
      for(const [x,z,t] of [[-.163,-.036,ivory],[.041,.113,rubber],[.171,-.119,ivory]]) cyl(p,'game counter','y',[x,.174,z],.034,.029,10,t);
    }
    for(const x of [-.198,.197]) bevel(p,'small catch',[x-.049,.062,-z-.031,x+.048,.116,-z+.015],.009,brass);
    return;
  }
  if(id==='rummy') {
    for(const [i,[x,z]] of [[-.25,-.085],[-.08,-.11],[.09,-.079],[.245,-.119],[.125,.13]].entries()){
      bevel(p,'numbered rummy tile',[x-.037,.159,z-.052,x+.037,.191,z+.052],.008,ivory);
      top(p,'tile numeral',[x-.027,z-.041,x+.027,z+.041],.193,label([0xa55e53,0x526d87,0x657a59][i%3],String(i+1),key));
    }
    top(p,'rummy rules cover',[-.343,.038,-.084,.185],.164,label(color,'RUMMY-O',key));
    return;
  }
  top(p,'original board game package artwork',[-.402,-z+.031,.398,z-.027],.164,(ctx,x,y,w,h)=>{
    label(color,name,key)(ctx,x,y,w,h);
    const paint=[shade(color,.65),shade(color,1.3),0xd9b980];
    if(/ludo|snakesnladders|jigsaw/.test(id)){
      const num=id==='jigsaw'?6:5, cell=Math.min(w*.075,h*.114);
      for(let i=0;i<num*num;i++){
        const px=x+w*.51+(i%num)*cell,py=y+h*.19+Math.floor(i/num)*cell;
        fill(ctx,px,py,cell*.94,cell*.94,paint[(i+(i%5))%3]);
        if(id==='jigsaw') fill(ctx,px+cell*.68,py+cell*.34,cell*.43,cell*.25,paint[(i+(i%5))%3]);
      }
      return;
    }
    for(let k=0;k<7;k++){
      ctx.fillStyle='#'+paint[(k+key)%paint.length].toString(16).padStart(6,'0');
      const px=x+w*(.34+k*.076),py=y+h*(.66+((key>>k)&3)*.047);
      ctx.beginPath();ctx.moveTo(px,py-h*.081);ctx.lineTo(px+w*.048,py);ctx.lineTo(px,py+h*.082);ctx.lineTo(px-w*.046,py);ctx.closePath();ctx.fill();
    }
  });
}
function hobby(p,d) {
  const {id,shape}=d;
  if(shape==='strings') return strings(p,d);
  if(shape==='winds') return winds(p,d);
  if(shape==='board') return board(p,d);
  if(id==='incense') {
    cyl(p,'incense coating','x',[-.078,.028,0],.028,.668,9,woodP(0x907052));
    cyl(p,'exposed wood tip','x',[.351,.019,0],.014,.203,8,wood);
    return;
  }
  if(id==='curler_hair') {
    const group=p.group('roller axis',{at:[0,.199,0],rotZ:Math.PI/2});
    profile(p,'hollow plastic hair roller',[[.114,-.358],[.197,-.358],[.207,-.331],[.207,.333],[.192,.359],[.11,.359],[.114,-.358]],plasticP(0xb67c92),{parent:group,sides:14});
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6;
      tube(p,'roller ridge',V(.209*Math.cos(a),-.322,.209*Math.sin(a)),V(.209*Math.cos(a),.323,.209*Math.sin(a)),.012,.012,7,plasticP(0xcf9bab),{parent:group});
    }
    return;
  }
  if(id.includes('carpet')) {
    const parent=p.group('roll axis',{at:[0,.168,0],rotZ:Math.PI/2});
    const c=id.startsWith('p_')?0x765c89:0xa75a55;
    profile(p,'rolled carpet',[[.029,-.422],[.169,-.422],[.175,-.397],[.175,.397],[.171,.423],[.032,.423],[.029,-.422]],clothP(c),{parent});
    for(const x of [-.425,.425]) for(const r of [.068,.102,.138]) cyl(p,'coiled pile edge','x',[x,.168,0],r,.009,14,clothP(shade(c,.68+r)),{open:true});
    p.box('rolled carpet flap',[-.379,0,.047,.414,.022,.284],clothP(c));
    return;
  }
  if(id==='indoor_volleyball') {
    blob(p,'regulation volleyball',[.412,.412,.412],[0,.407,0],clothP(0xe7dcc8),{},8,18);
    for(let i=0;i<3;i++){
      const a=i*Math.PI*2/3;
      const pts=Array.from({length:9},(_,j)=>{
        const t=(j/8)*2.65+.245;return [.415*Math.sin(t)*Math.cos(a),.407+.415*Math.cos(t),.415*Math.sin(t)*Math.sin(a)];
      });
      path(p,'stitched panel seam',pts,.008,clothP(0xa6a8aa));
    }
    return;
  }
  if(id==='pet_carrier_wooden') {
    bevel(p,'wooden carrier floor',[-.439,0,-.291,.439,.084,.291],.027,wood);
    bevel(p,'covered top',[-.438,.431,-.295,.438,.501,.294],.027,wood);
    for(const x of [-.422,.422]) for(const z of [-.257,.247]) p.box('wooden corner brace',[x-.023,.071,z-.028,x+.023,.438,z+.028],darkWood);
    for(const z of [-.278,.278]) for(const x of [-.252,-.077,.097,.274]) p.box('wooden ventilation slat',[x-.055,.078,z-.019,x+.054,.438,z+.019],wood);
    for(const z of [-.185,-.061,.061,.183]) cyl(p,'metal door bars','y',[.44,.252,z],.018,.336,8,steel);
    path(p,'top handle',[[-.15,.499,0],[-.091,.573,0],[.092,.573,0],[.151,.499,0]],.022,steel);
    return;
  }
  if(id==='cot') {
    bevel(p,'stretched canvas sling',[-.441,.25,-.21,.441,.284,.21],.016,green);
    for(const z of [-.222,.222]) path(p,'aluminum side rail',[[-.461,.253,z],[.462,.253,z]],.024,steel);
    for(const x of [-.318,.001,.303]) for(const s of [-1,1]) path(p,'folding leg',[[x,.244,s*.212],[x+.058,.014,-s*.191]],.023,steel);
    return;
  }
  if(id==='folded_inflatable_boat') {
    for(const [y,z] of [[0,-.034],[.087,.029],[.171,-.041]]) bevel(p,'compressed layers of rubber raft',[-.392,y,z-.187,.393,y+.113,z+.187],.043,plasticP(0x687166));
    for(const x of [-.187,.205]) path(p,'packing strap',[[x,.022,-.242],[x,.244,-.217],[x,.278,.144],[x,.045,.219]],.023,green);
    for(const z of [-.305,.286]){
      cyl(p,'section of stowed oar','x',[0,.044,z],.026,.788,9,wood);
      cutShape(p,'oar blade',[[.246,z-.044],[.387,z-.073],[.455,z-.052],[.452,z+.051],[.386,z+.068],[.246,z+.043]],.032,wood,.016);
    }
    return;
  }
  if(id==='inflatable_dragon') {
    const pGreen=plasticP(0x6f9566), wing=plasticP(0xa36965);
    blob(p,'inflatable body',[.27,.233,.221],[0,.21,.024],pGreen,{},5,12);
    blob(p,'inflatable dragon head',[.158,.144,.156],[0,.465,-.176],pGreen,{},5,11);
    blob(p,'rounded dragon muzzle',[.12,.067,.118],[0,.444,-.275],plasticP(0x93a766),{},4,10);
    for(const s of [-1,1]){
      cutShape(p,'vinyl wing',[[s*.112,-.137],[s*.402,-.099],[s*.382,.222],[s*.092,.134]],.039,wing,.205);
      blob(p,'inflatable eye',[.026,.035,.03],[s*.076,.511,-.247],ivory,{},3,8);
      blob(p,'inflatable paw',[.099,.058,.119],[s*.146,.055,-.043],pGreen,{},4,9);
    }
    path(p,'vinyl tail',[[0,.143,.184],[.112,.121,.286],[.208,.126,.365],[.281,.184,.397]],.058,pGreen);
    return;
  }
  if(id==='menorah') {
    bevel(p,'brass pedestal',[-.166,0,-.111,.166,.046,.111],.02,brass);
    for(let k=-4;k<=4;k++){
      const x=k*.099;
      path(p,'candelabrum branch',[[0,.057,0],[x*.51,.109+Math.abs(k)*.023,0],[x,.226,0],[x,k===0?.42:.353,0]],.019,brass);
      cyl(p,'candle socket','y',[x,k===0?.4:.351,0],.038,.035,10,brass);
      cyl(p,'wax candle','y',[x,k===0?.465:.413,0],.024,.111,9,ivory);
    }
    return;
  }
  if(id==='oil_lamp_clay') {
    const clay=plasticP(0xa5674e);
    profile(p,'wheel-thrown clay reservoir',[[0,0],[.169,0],[.227,.062],[.238,.142],[.204,.223],[.024,.223],[0,.206]],clay,{scale:[1,1.21]});
    cutShape(p,'pinched wick spout',[[-.103,-.228],[-.077,-.347],[.026,-.413],[.107,-.338],[.092,-.201]],.076,clay,.114);
    path(p,'unlit wick',[[.015,.195,-.266],[.029,.206,-.374]],.024,rubber);
    return;
  }
  for(const z of [-.096,.101]){
    tube(p,'disassembled tapered rod',V(-.425,.048,z),V(.449,.048,z),z<0?.032:.018,.01,9,z<0?darkWood:steel);
    for(const x of [-.097,.097,.284]) cyl(p,'fishing line guide','z',[x,.062,z],.023,.017,8,steel,{open:true});
  }
}
const paintColors={purple:0x805a90,green:0x638258,orange:0xbb7845,red:0xaa4c4c,pink:0xbf738b,yellow:0xc5a44d,brown:0x8d624b,white:0xe3dfd3,black:0x4c474c,gray:0x868b8a,blue:0x567ba1,cyan:0x59a4a6,blond:0xc8aa6f};
function stock(p,d) {
  const {id,shape,color,key,name}=d;
  if(shape==='paint'||shape==='dye') {
    const tint=paintColors[id.split('_').at(-1)]??color;
    if(shape==='dye'){
      bevel(p,'squeeze bottle',[-.24,0,-.153,.24,.582,.153],.062,plasticP(tint));
      lid(p,'pointed dispenser',.097,.555,.129,ivory);
      profile(p,'dispenser tip',[[.094,.651],[.052,.718],[.018,.778],[0,.778]],ivory);
      front(p,'salon dye label',[-.188,.16,.192,.485],-.157,label(tint,name,key));
    } else {
      can(p,{r:.326,h:.48,label:plasticP(tint),ring:false});
      lid(p,'paint bucket lid',.344,.45,.044,steel);
      path(p,'wire carry bail',[[-.325,.345,0],[-.348,.455,.04],[-.24,.593,.055],[0,.631,.057],[.238,.592,.054],[.346,.455,.04],[.325,.345,0]],.011,steel);
      front(p,'paint label',[-.22,.105,.22,.374],-.331,label(tint,name,key));
    }
    return;
  }
  if(shape==='tank'){
    if(id!=='30gal_drum_aluminum') return supplyGoods.cylinder(p,d);
    profile(p,'large aluminum tank',[[0,0],[.271,0],[.302,.041],[.302,.79],[.273,.834],[0,.834]],steel,{sides:16,metal:true});
    for(const y of [.126,.424,.725]) cyl(p,'rolled reinforcing seam','y',[0,y,0],.314,.046,16,steel,{open:true});
    for(const x of [-.142,.143]) cyl(p,'raised fill cap','y',[x,.835,-.025],.061,.037,10,brass);
    return;
  }
  if(id==='thread'){
    cyl(p,'sewing thread spool','x',[0,.198,0],.176,.579,14,clothP(0xbdb09d));
    for(const x of [-.306,.306]) cyl(p,'wooden spool flange','x',[x,.197,0],.205,.058,14,wood);
    for(let k=0;k<13;k++) cyl(p,'wound thread strand','x',[-.271+k*.043,.198,0],.183,.011,14,clothP(0xd8c7af),{open:true});
    path(p,'loose end',[[.058,.034,.106],[.215,.018,.243],[.301,.016,.213],[.429,.015,.263]],.009,ivory);
    return;
  }
  if(id==='napkin'){
    cutShape(p,'folded paper napkin',[[-.408,-.294],[.318,-.295],[.412,.217],[.232,.313],[-.361,.289]],.024,paperP(0xe0d7c8));
    cutShape(p,'folded upper layer',[[-.408,-.294],[.315,-.294],[.225,.304]],.013,paperP(0xebe2d3),.024);
    return;
  }
  if(/skull/.test(id)){
    const canine=id==='skull_canis',bone=plasticP(0xd5c5a7);
    blob(p,'bone cranium',[.283,.224,.263],[0,.24,canine?.038:.11],bone,{},5,12);
    bevel(p,'facial skeleton',[-.205,.032,canine?-.42:-.325,.205,.249,.096],.064,bone);
    for(const x of [-.114,.115]) blob(p,'recessed eye socket',[.068,.064,.037],[x,.207,canine?-.253:-.304],rubber,{},4,9);
    for(let j=0;j<6;j++){
      const x=-.137+j*.054;
      p.box('small exposed tooth',[x-.021,.061,canine?-.413:-.337,x+.021,.124,canine?-.387:-.304],ivory);
    }
    return;
  }
  if(id==='bone'){
    tube(p,'bone shaft',V(-.31,.088,-.036),V(.302,.098,.031),.071,.063,10,ivory);
    for(const x of [-.325,.326]) for(const z of [-.065,.068]) blob(p,'joint end',[.094,.093,.072],[x,.095,z],ivory,{},4,9);
    return;
  }
  if(id==='sinew'||id==='endochitin'){
    const tint=plasticP(id==='sinew'?0xb3927e:0x886f55);
    for(const z of [-.111,-.035,.063,.14]) path(p,'tough curved strand',[[-.404,.034,z-.03],[-.178,.04,z-.08],[.068,.057,z],[.312,.04,z+.073],[.405,.023,z+.044]],.021,tint);
    return;
  }
  if(id.startsWith('art_')){
    if(id==='art_pin') {
      cyl(p,'thin pin shaft','x',[.035,.041,.006],.027,.762,10,steel);
      blob(p,'dark pinhead',[.093,.085,.09],[-.376,.085,.005],rubber,{},4,10);
    } else if(id==='art_duocylinder') {
      const points=Array.from({length:25},(_,i)=>{const t=i*Math.PI/12;return [.348*Math.cos(t),.13+.081*Math.sin(t*3),.33*Math.sin(t)];});
      path(p,'undulating ring',points,.049,steelP(0x748e83));
    } else if(id==='art_pyramid') {
      const parent=p.group('tetrahedral face angle',{rotY:.36});
      profile(p,'regular tetrahedron',[[0,0],[.405,0],[0,.573]],plasticP(0xa38565),{parent,sides:3,metal:true});
    } else profile(p,'translucent crystal',[[0,0],[.128,.012],[.265,.195],[.242,.452],[.137,.592],[0,.664]],plasticP(0x89a8ae),{sides:6,...GLASS});
    return;
  }
  if(id==='yrax_sensor'){
    blob(p,'engraved sensor sphere',[.324,.326,.323],[0,.328,0],steelP(0xa3aa9c),{metal:true},6,14);
    for(const [x,z] of [[-.138,-.189],[.026,-.239],[.176,-.161]]) bevel(p,'black glass screen',[x-.055,.411,z-.053,x+.065,.552,z+.017],.013,rubber);
    return;
  }
  if(id==='yrax_metal'){
    const row=[[-.407,.031],[-.281,.081],[-.151,.122],[0,.146],[.152,.124],[.285,.088],[.411,.037]];
    for(let k=0;k<row.length-1;k++){
      const [x0,y0]=row[k],[x1,y1]=row[k+1];
      bevel(p,'one curved alloy plate facet',[0,0,-.274,x1-x0+.014,.036,.275],.006,steelP(shade(0xc0c6c3,.89+(k%3)*.069)),{parent:p.group('facet',{at:[x0,y0,0],rotZ:Math.atan2(y1-y0,x1-x0)})});
    }
    return;
  }
  if(id==='yrax_robotics'){
    bevel(p,'compact mechanical module',[-.327,0,-.199,.326,.271,.193],.059,darkWood);
    for(const z of [-.224,.217]) for(const x of [-.258,-.115,.043,.198]){
      bevel(p,'interlocking metal casing',[x-.067,.095,z-.064,x+.079,.243,z+.06],.012,brass);
      cyl(p,'hinge pin','x',[x,.168,z],.036,.148,10,steel);
    }
    path(p,'segmented metal feed',[[.283,.173,0],[.397,.199,.032],[.429,.23,.167]],.056,steel);
    return;
  }
  if(id==='yrax_electronics'){
    for(let k=0;k<13;k++){
      const x=-.34+k*.056;
      path(p,'interlaced metallic strip',[[x,.023,-.298],[x+.025,.089,-.119],[x+.034,.13,.085],[x+.01,.051,.301]],.018,brass);
    }
    for(const z of [-.21,-.106,0,.105,.208]) path(p,'cross-weave strips',[[-.35,.069,z],[.046,.116,z],[.39,.075,z]],.018,steelP(0xba9e66));
    return;
  }
  const chunks=id==='ruined_chunks', metal=id==='yrax_scrap';
  for(const [j,[x,z]] of [[-.234,-.117],[.148,-.161],[-.053,.091],[.245,.13],[-.188,.234]].entries()){
    const c=chunks?[0x765648,0x956d57,0xa18c70][j%3]:metal?0x89958e:id.includes('chitin')?0x8c7758:0x505057;
    lump(p,'individual irregular fragment',[.124,.084+j%3*.029,.11],speckle(id,c,[shade(c,.73),shade(c,1.19)],.34),key+j,{metal},[x,0,z]);
    if(metal&&j%2) blob(p,'small metallic sphere',[.054,.052,.054],[x,.142,z],steel,{},4,9);
  }
}
function paper(p,d) {
  const {id,key}=d;
  if(id==='letter') {
    bevel(p,'folded private letter envelope',[-.416,0,-.27,.416,.039,.271],.018,paperP(0xd8c6a6));
    cutShape(p,'envelope flap',[[-.4,-.247],[.401,-.249],[.002,.098]],.011,paperP(0xe0d1b3),.038);
    return;
  }
  if (id==='childnote') {
    cutShape(p,'child’s ragged paper note',[[-.328,-.403],[.287,-.414],[.347,.326],[.272,.382],[.07,.353],[-.315,.407]],.02,paperP(0xe1d3b7));
    top(p,'handwritten colored marks',[-.259,-.318,.253,.26],.024,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0xe8dbbd);
      ctx.strokeStyle='#777387';ctx.lineWidth=Math.max(1,.035*w);
      for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(x+w*.09,y+h*(.12+j*.157));ctx.lineTo(x+w*(.42+j%3*.16),y+h*(.135+j*.155));ctx.stroke();}
    });
    return;
  }
  cutShape(p,'annotated scrap of paper',[[-.413,-.178],[.391,-.16],[.409,.159],[.296,.191],[.067,.165],[-.331,.18],[-.418,.108]],.02,paperP(0xddd1b8));
  top(p,'two handwritten character sequences',[-.339,-.098,.323,.112],.023,(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0xe2d3b8);
    ctx.fillStyle='#5d5862';ctx.font='bold '+Math.max(4,Math.round(h*.29))+'px monospace';
    ctx.fillText('1D9K QRS9 84B2',x+w*.025,y+h*.37,w*.95);
    ctx.fillText('N7WX HF62 S5K2',x+w*.025,y+h*.79,w*.95);
  });
}
const editions = {
  holybook_corpus:['#5d5366','soft','ornament'],holybook_egypt1:['#7b6048','hard','ornament'],
  holybook_havamal:['#4e625f','hard','mountains'],holybook_kallisti:['#73534e','soft','occult'],
  holybook_maya:['#5e7157','hard','ornament'],holybook_pastafarian:['#8c643e','soft','tide'],
  holybook_quran:['#3b594a','hard','ornament'],holybook_sutras:['#875e4c','hard','ornament'],
  holybook_talmud:['#654852','hard','ornament'],holybook_wicca1:['#534962','hard','occult'],
  holybook_east:['#3c5866','hard','ornament'],mycenacean_hymns:['#685646','hard','ornament'],
  reference_firstaid2:['#3b5b65','hard','medicine'],textbook_arthropod:['#5c694c','hard','diagram'],
  textbook_botany:['#536d50','hard','local'],textbook_fireman:['#824f47','hard','flame'],
  carpentry_book:['#726345','hard','tools'],brewing_cookbook:['#7d6849','soft','table'],
  preserving_juice:['#79514c','soft','table'],recipe_lab_elec:['#4b5766','hard','circuit'],
  schematics_nursebot:['#48677d','soft','diagram'],vacuum_sealing:['#535d70','soft','diagram'],
};
function book(p,d) {
  const {id,shape,key}=d;
  if(shape==='scroll'){
    cutShape(p,'laid out parchment scroll',[[-.313,-.348],[.333,-.349],[.321,.355],[-.302,.354]],.029,paperP(0xdfc79f));
    for(const x of [-.32,.32]){
      cyl(p,'wooden scroll rod','z',[x,.071,0],.043,.863,12,darkWood);
      cyl(p,'rolled parchment','z',[x,.073,0],.065,.698,14,paperP(0xe3cca4));
    }
    top(p,'ink columns',[-.227,-.308,.223,.306],.032,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0xe0c79d);
      for(let a=0;a<4;a++) for(let b=0;b<13;b++) fill(ctx,x+w*(.044+a*.243),y+h*(.08+b*.066),w*(.11+(a+b)%3*.028),Math.max(1,h*.014),0x635148);
    });
    return;
  }
  const rules = id.startsWith('manual_');
  const [base,detail,art]=editions[id]??(rules?[['#576053','#5c5274','#664a47','#405e68'][key%4],'soft','court']:['#664753','hard','ornament']);
  const hardcover=detail==='hard';
  const formats=rules?['masthead','spineBand','illustratedTop','twoTone']:['framed','emblem','spineBand','twoTone'];
  const cover={palette:[base,'#f1e5c5','#c79761','#a38b78'],art,label:''};
  if(id==='holybook_east'){
    const bookCloth=parseInt(base.slice(1),16);
    for(let stack=0;stack<5;stack++) for(let layer=0;layer<10;layer++){
      const x=(stack-2)*.173,z=(stack%2)*.048,y=layer*.042;
      const cover=clothP(shade(bookCloth,.87+(layer%4)*.073));
      p.box('individual volume pages',[x-.072,y+.006,z-.294,x+.072,y+.037,z+.297],paperP(0xd9c8a5));
      p.box('individual volume bottom board',[x-.08,y,z-.306,x+.08,y+.006,z+.302],cover);
      p.box('individual volume top board',[x-.08,y+.035,z-.306,x+.08,y+.041,z+.302],cover);
      p.box('individual volume spine',[x-.08,y,z-.305,x+.08,y+.041,z-.282],cover);
      if(layer%2===1) front(p,'gold spine tooling',[x-.052,y+.014,x+.052,y+.03],z-.307,label(0x75614b,String(stack*10+layer+1),key+layer));
    }
    return;
  }
  if(id==='textbook_arthropod') {
    const volumes=3;
    for(let i=0;i<volumes;i++){
      const x=(i-(volumes-1)/2)*(.755/volumes);
      bevel(p,'bound volume page block',[x-.052,0,-.294,x+.052,.54-i%3*.025,.315],.013,paperP(0xdfd0ad));
      p.box('clothbound spine',[x-.063,.013,-.323,x+.063,.553-i%3*.025,-.286],clothP(shade(parseInt(base.slice(1),16),.88+i*.045)));
      front(p,'numbered spine',[x-.049,.224,x+.049,.43],-.324,label(parseInt(base.slice(1),16),String(i+1),key+i));
      p.box('book boards',[x-.067,0,-.326,x+.065,.019,.326],clothP(parseInt(base.slice(1),16)));
    }
    return;
  }
  const thickness=/carpentry|talmud|firstaid|lab_elec|catechism3/.test(id)?.151:hardcover?.094:.047;
  reading(p,{...d,detail},{cover,layout:formats[key%4],width:rules?.616:.67,length:.916,thickness});
  if(id==='recipe_lab_elec') for(const z of [-.247,-.016,.226]) path(p,'ring binder loop',[[-.289,.043,z],[-.336,.082,z],[-.281,.116,z]],.012,steel);
}

export const marketProps={book,hobby,paper,stock};
