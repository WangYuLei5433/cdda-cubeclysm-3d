import { blob, can, lump, pile, woodP } from './item-kit.js';
import { GLASS, V, bevel, cyl, flat, front, label, lid, paperP, path, plasticP, ring, rubber, shade, steelP, top, tube } from './common-loot-kit.js';
import { cutShape, profile, oval } from './item-workshop-kit.js';
import { workshopGoods } from './item-workshop-goods.js';

const steel=steelP(0xa3a8a8);
const slate=plasticP(0x4c5259);
const cream=plasticP(0xe5ddc9);
const glass=flat(0xa2c2c4);
const dryGrass=woodP(0xb3a16e);

const beverageColors = {
  purple_drink:0x8b628e, tomato_juice:0xad5749, rootbeer:0x7b5343, zerocola:0x565267, colamdew:0x799050,
  drink_hard_seltzer:0x81969b, zeroorange:0xc7874c, lemonlime:0x7b9555, foodplace_zero_drink:0x658c91,
  india_pale_ale:0xa3854f, wine_barley:0x925f4d, imperial_stout:0x584144, stout:0x635049,
  european_pilsner:0xb59b52, belgian_ale:0x9c6e51, hb_beer:0xa97750, vodka:0xa0bdc3, moonshine:0xb2c5b0,
  mead:0xc3a363, dandelion_wine:0xafb967, fruit_wine:0x9b5962, royal_jelly:0xd6b976, water_mineral:0x6691a5, sparkling:0x82a7aa,
};
function drink(p,d) {
  const {id,shape,name,key}=d;
  const color=beverageColors[id]??d.color;
  if(shape==='soda') {
    can(p,{r:.229,h:.842,label:plasticP(color),ring:true});
    cyl(p,'rolled seam','y',[0,.83,0],.237,.022,14,steel,{open:true});
    const titles={purple_drink:'GRAPE',zerocola:'COLA ZERO',colamdew:'ENERGY COLA',zeroorange:'TROFICA ZERO',
      foodplace_zero_drink:'FOODPLACE',drink_hard_seltzer:'HARD SELTZER',rootbeer:'ROOT BEER',lemonlime:'LEMON LIME'};
    front(p,'readable printed beverage label',[-.106,.266,.106,.633],-.231,label(shade(color,.78),titles[id]??name,key));
    for(const y of [.106,.699]) cyl(p,'printed rim stripe','y',[0,y,0],.23,.017,14,plasticP(shade(color,1.3)),{open:true});
    return;
  }
  if(shape==='water' && id==='water_mineral') {
    profile(p,'clear mineral-water bottle',[[0,0],[.173,0],[.207,.06],[.21,.64],[.17,.736],[.088,.778],[.088,.831],[.065,.831],[.066,.76],[.179,.615],[.178,.062],[0,.062]],glass,GLASS);
    lid(p,'blue cap',.098,.806,.063,plasticP(color));
    front(p,'mineral water label',[-.10,.267,.10,.542],-.208,label(color,name,key));
    return;
  }
  if(id==='royal_jelly') {
    const wax=plasticP(0xd3b682), inside=plasticP(0xe4d0a0);
    const shell=oval(0,0,.416,.373,6);
    cutShape(p,'six-sided wax cell',shell,.244,wax,0,[oval(0,0,.314,.281,6)]);
    cutShape(p,'milky jelly inside',oval(0,0,.315,.282,6),.186,inside,.020);
    for(const [x,z] of [[-.084,.04],[.112,-.061]]) blob(p,'jelly surface',[.078,.019,.069],[x,.203,z],plasticP(0xf2dbb0),{},3,9);
    return;
  }
  if(id==='moonshine') {
    const liquid=plasticP(0xc7cbb8);
    profile(p,'glass preserving jar',[[0,0],[.272,0],[.31,.044],[.313,.532],[.262,.598],[.233,.651],[.209,.652],[.265,.562],[.279,.06],[0,.06]],glass,GLASS);
    profile(p,'jar contents',[[0,.046],[.278,.046],[.278,.418],[0,.418]],liquid,{sides:14});
    lid(p,'metal jar lid',.249,.629,.061,steel);
    front(p,'jar label',[-.122,.204,.122,.449],-.31,label(color,name,key));
    return;
  }
  const beer=shape==='beer'||id==='wine_barley';
  const wine=shape==='wine'&&!beer, vodka=id==='vodka', water=shape==='water';
  const r=wine?.154:beer?.186:vodka?.224:.19;
  const shoulder=beer?.58:.656;
  const neck=beer?.072:vodka?.067:.082;
  const glassColor=beer?0x775840:wine?(id==='fruit_wine'?0x71604c:0x79805a):vodka?0xa7c2c3:id==='tomato_juice'?0xb15a49:0xa4c2ad;
  const body=plasticP(glassColor);
  profile(p,'bottle silhouette',[[0,0],[r*.86,0],[r,.054],[r,shoulder-.07],[r*.93,shoulder-.025],[r*.75,shoulder+.026],[neck,shoulder+.103],[neck,.829],[0,.829]],body,{sides:vodka?10:14,...(vodka||water?GLASS:{})});
  lid(p,wine?'foil cap':'bottle closure',neck*1.11,.812,.073,plasticP(wine?shade(color,.72):shade(color,.84)));
  front(p,'drink label',[-r*.56,.219,r*.56,.493],-r*.987,label(color,name,key));
  if(beer) cyl(p,'neck band','y',[0,.753,0],neck*1.07,.06,12,plasticP(color),{open:true});
}

function food(p,d) {
  const {id,family,key,color}=d;
  if(family==='grain') {
    const corn=id==='dry_corn';
    for(let k=0;k<20;k++){
      const a=k*2.39996,r=.39*Math.sqrt((k+.2)/20);
      const dye=corn?[0xc6a256,0xd8b362,0xb59249][k%3]:[0xa28a60,0x7f7954,0xb69b70,0x6b684f][k%4];
      blob(p,corn?'dent corn kernel':'loose seed or grain',[corn?.062:.045,.035,.062],[Math.cos(a)*r,.034+k%3*.012,Math.sin(a)*r*.81],plasticP(dye),{},3,7);
    }
    return;
  }
  if(family==='cake') {
    const cocoa=paperP(0x775544), custard=plasticP(0xe6d2ad), biscuit=paperP(0xb78f64);
    const edge=[[-.374,-.245],[.272,-.25],[.37,-.175],[.355,.223],[-.336,.241],[-.382,.184]];
    for(const [h,t,paint] of [[0,.08,biscuit],[.075,.064,custard],[.132,.058,biscuit],[.186,.073,custard],[.252,.024,cocoa]])
      cutShape(p,'tiramisu layer',edge,t,paint,h);
    return;
  }
  if(family==='slab') {
    const tint=id==='royal_beef'?0xaa684f:id==='meat_pickled'?0xab8179:0x82564a;
    const meat=plasticP(tint);
    const points=[[-.396,-.23],[.176,-.336],[.371,-.194],[.392,.186],[.218,.331],[-.325,.31],[-.42,.094]];
    cutShape(p,'cut meat surface',points,.222,meat);
    cutShape(p,'outer glaze or rind',points.map(([x,z])=>[x*.96,z*.97]),.038,plasticP(id==='royal_beef'?0xb58647:shade(tint,.77)),.21);
    for(const z of [-.131,-.025,.094]) path(p,'rind grain',[[ -.328,.248,z],[-.067,.254,z+.031],[.302,.248,z+.061]],.008,plasticP(shade(tint,.84)));
    return;
  }
  if(family==='breakfast') {
    if(id==='hardtack') {
      for(const [x,z] of [[-.192,-.122],[.179,.117]]) {
        bevel(p,'hard biscuit',[x-.169,0,z-.147,x+.169,.065,z+.147],.023,paperP(0xbc995f));
        for(const dx of [-.077,0,.077]) for(const dz of [-.066,0,.066])
          cyl(p,'biscuit docking pit','y',[x+dx,.067,z+dz],.013,.006,7,plasticP(0x775d42));
      }
    } else if(id==='scrambled_eggs') {
      profile(p,'small dish',[[0,0],[.298,0],[.417,.057],[.433,.083],[.399,.089],[.276,.037],[0,.037]],cream,{sides:16});
      for(let k=0;k<14;k++){
        const a=k*2.4,r=.307*Math.sqrt((k+.2)/14);
        lump(p,'scrambled egg curd',[.095,.067,.078],plasticP(k%3?0xd7b15a:0xe9c575),id+k,{},[Math.cos(a)*r,.04,Math.sin(a)*r]);
      }
    } else {
      const pancake=paperP(0xb08657);
      for(let n=0;n<3;n++) cyl(p,'chocolate pancake','y',[n*.012,.045+n*.078,n*.02],.422-n*.012,.077,14,pancake);
      for(const [x,z] of [[-.173,-.139],[.081,.141],[.2,-.047],[-.063,.102],[-.224,.05]])
        blob(p,'baked-in chocolate chip',[.027,.009,.029],[x,.24,z],plasticP(0x653e34),{},3,7);
      blob(p,'maple syrup',[.195,.014,.128],[.028,.247,-.012],plasticP(0x986337),{},3,11);
    }
    return;
  }
  if(family==='meal') {
    if(id==='chips') {
      for(let k=0;k<12;k++){
        const a=k*2.4,r=.303*Math.sqrt((k+.3)/12);
        const [x,z]=[Math.cos(a)*r,Math.sin(a)*r];
        const pieces=oval(x,z,.112,.089,8);
        cutShape(p,'individual crisp',pieces,.013,paperP(k%2?0xd6a451:0xc99c57),.004+k%4*.027);
      }
    } else if(id==='sauce_pesto') {
      profile(p,'condiment jar',[[0,0],[.265,0],[.29,.053],[.282,.558],[.244,.609],[0,.609]],plasticP(0x74804e),{sides:14});
      lid(p,'sealed lid',.257,.589,.06,steel);
      front(p,'basil label',[-.151,.171,.153,.461],-.285,label(0x758254,'PESTO',key));
    } else {
      const noodles=id==='spaghetti_bolognese';
      profile(p,'serving dish',[[0,0],[.265,0],[.39,.071],[.434,.12],[.411,.134],[.355,.093],[.255,.048],[0,.048]],cream,{sides:16});
      if(noodles) {
        for(let k=0;k<11;k++){
          const t=(k-5)*.048;
          path(p,'loose pasta strand',[[t,.087,-.271],[t-.031,.105,-.172],[t+.052,.131,-.061],[t-.014,.13,.047],[t+.036,.112,.17],[t-.011,.087,.256]],.017,paperP(0xd3b777));
        }
        for(const [x,z] of [[-.125,-.073],[.126,-.133],[.089,.098],[-.15,.093],[.01,.011]]) blob(p,'tomato ragù',[.085,.036,.073],[x,.139,z],plasticP(0xa85442),{},3,8);
      } else {
        pile(p,'rice serving',.318,.119,paperP(0xe1d6a9),id);
        for(const [x,z] of [[-.22,-.12],[0,-.166],[.09,.105],[.192,-.046],[-.143,.174]]) bevel(p,'tofu cube',[x-.049,.088,z-.048,x+.049,.177,z+.048],.012,plasticP(0xcfad72));
      }
    }
    return;
  }
  if(family==='can') {
    can(p,{r:.353,h:.487,label:label(0x62888e,'CHOPPED CLAMS',key),ring:true});
    return;
  }
  if(family==='bottle') {
    bevel(p,'chocolate milk carton',[-.21,0,-.19,.21,.677,.19],.027,paperP(0xb48768));
    cutShape(p,'compressed carton fold',[[ -.21,-.19],[.21,-.19],[.21,.19],[-.21,.19]],.077,paperP(0xe0c29d),.659);
    lid(p,'milk cap',.062,.733,.054,cream);
    front(p,'chocolate milk printing',[-.182,.142,.181,.556],-.192,label(0x805948,'CHOCOLATE MILK',key));
    return;
  }
  if(family==='fodder') {
    bevel(p,'tied hay bundle',[-.411,0,-.243,.409,.31,.242],.06,dryGrass);
    for(const x of [-.212,.212]) path(p,'bundle binding',[[x,.025,-.247],[x,.278,-.238],[x,.318,.204],[x,.025,.25]],.016,woodP(0x877450));
    return;
  }
  if(family==='sausage') return workshopGoods.sausage(p,{...d,color:0xab775b});
  if(id==='stomach_large') {
    blob(p,'curved stomach tissue',[.32,.194,.26],[-.067,.19,.019],plasticP(0xb88982),{},4,12);
    path(p,'thick outlet fold',[[.138,.183,-.066],[.238,.194,-.189],[.347,.103,-.303]],.064,plasticP(0x9e736f));
    path(p,'surface crease',[[-.295,.191,-.104],[-.163,.318,-.065],[.012,.339,.044]],.016,plasticP(0xc1958b));
  } else if(id==='fish_pickled') {
    const outline=oval(0,0,.421,.291,12);
    cutShape(p,'opened can base',outline,.039,steel);
    cutShape(p,'rolled tin sidewall',outline,.146,steel,.036,[oval(0,0,.382,.253,12)]);
    cutShape(p,'briny surface',oval(0,0,.38,.25,12),.027,plasticP(0xb0ab82),.049);
    for(const z of [-.112,.106]) {
      cutShape(p,'pickled fillet',[[-.298,z-.075],[.069,z-.079],[.264,z-.026],[.241,z+.076],[-.178,z+.067]],.068,plasticP(0xc6aa94),.075);
      path(p,'fish skin edge',[[ -.253,.137,z-.054],[.03,.138,z-.06],[.202,.138,z-.029]],.013,plasticP(0x7b8374));
    }
  } else {
    for(const [x,z] of [[-.19,-.135],[.173,-.09],[-.054,.18],[.212,.161]]) {
      cutShape(p,'dried mushroom slice',oval(x,z,.112,.152,8),.04,paperP(0x9f7958));
      path(p,'dried gill streak',[[x-.064,.041,z],[x+.038,.042,z+.067]],.007,plasticP(0x6f5545));
    }
  }
}

function vessel(p,d) {
  const {id,shape,color}=d;
  const paint=plasticP(color);
  if(id==='fish_bowl') {
    profile(p,'rounded open fish bowl',[[0,0],[.194,0],[.289,.072],[.39,.201],[.408,.395],[.358,.549],[.269,.626],[.264,.654],[.238,.652],[.242,.608],[.333,.52],[.379,.388],[.363,.204],[.264,.089],[.191,.041],[0,.041]],glass,{...GLASS,sides:18});
    cyl(p,'filled water surface','y',[0,.477,0],.339,.006,18,flat(0xb1caca),GLASS);
    ring(p,'waterline glint',.312,.345,.481,flat(0xa9c7c7),[0,0],18);
    const scales=plasticP(0xce8d57), fin=plasticP(0xbc7350), horn=plasticP(0xcabb9b);
    blob(p,'Hoss the goldfish',[.159,.075,.074],[-.022,.322,-.113],scales,{},4,10);
    bevel(p,'forked tail',[.094,.28,-.14,.209,.364,-.092],.022,fin);
    for(const z of [-.15,-.08]) {
      path(p,'tiny antler',[[ -.126,.352,z],[-.143,.398,z-.01],[-.186,.428,z-.02]],.009,horn);
      path(p,'antler point',[[ -.145,.397,z-.01],[-.131,.418,z-.022]],.008,horn);
    }
    blob(p,'fish eye',[.016,.017,.01],[-.138,.341,-.165],slate,{},3,7);
    bevel(p,'gift tag',[-.178,.076,-.306,.018,.195,-.276],.011,paperP(0xcbbb96));
    front(p,'gift lettering',[-.155,.091,-.004,.177],-.308,label(0x968767,'TO ED / HOSS',d.key));
  } else if(id==='pet_carrier') {
    bevel(p,'pet carrier tray',[-.421,0,-.318,.421,.119,.313],.046,paint);
    bevel(p,'vented shell',[-.397,.114,-.29,.397,.482,.287],.108,plasticP(shade(color,1.22)));
    front(p,'open door shade',[-.29,.153,.29,.374],-.298,slate);
    for(const x of [-.26,-.169,-.082,0,.082,.169,.26]) tube(p,'carrier door bar',V(x,.152,-.31),V(x,.367,-.31),.012,.012,6,steel);
    path(p,'carrying handle',[[ -.201,.475,0],[-.127,.577,0],[.127,.577,0],[.20,.475,0]],.032,slate);
  } else if(id==='coffeepot') {
    profile(p,'tapered glass coffee carafe',[[0,0],[.218,0],[.298,.052],[.305,.151],[.255,.412],[.224,.466],[.196,.475],[.199,.439],[.231,.387],[.268,.139],[.255,.087],[0,.063]],glass,GLASS);
    cutShape(p,'pour lip',[[ -.211,-.092],[-.343,0],[-.211,.092],[-.18,.068],[-.18,-.07]],.032,glass,.447);
    lid(p,'black coffee carafe lid',.212,.471,.056,slate);
    path(p,'handle',[[.215,.435,0],[.373,.452,0],[.397,.358,0],[.365,.209,0],[.276,.179,0]],.039,slate);
    for(let n=0;n<5;n++) front(p,'measure mark',[-.103,.114+n*.054,-.031,.121+n*.054],-.291+n*.009,cream);
  } else if(id==='aluminum_pan'||id==='oven_broiler_pan') {
    const roasting=id==='oven_broiler_pan';
    if(roasting) {
      bevel(p,'roasting tray floor',[-.43,0,-.29,.43,.052,.29],.024,steel);
      for(const x of [-.422,.422]) p.box('tray wall',[x-.024,0,-.289,x+.024,.129,.29],steel);
      for(const z of [-.277,.277]) p.box('tray wall',[-.419,0,z-.023,.419,.129,z+.023],steel);
      for(let n=0;n<9;n++) p.box('drain grill',[-.35+n*.087,.073,-.231,-.314+n*.087,.094,.231],steel);
    } else {
      profile(p,'shallow aluminum pan',[[0,0],[.327,0],[.391,.045],[.413,.124],[.386,.133],[.355,.061],[0,.047]],steel,{metal:true});
      path(p,'pan handle',[[.367,.076,0],[.485,.079,0],[.561,.068,0]],.043,slate);
    }
  } else if(id.includes('pot')) {
    const metal=id.includes('copper')?steelP(0xa76f53):steel;
    profile(p,'open metal pot',[[0,0],[.289,0],[.331,.059],[.359,.477],[.377,.502],[.339,.511],[.307,.466],[.28,.07],[0,.07]],metal,{metal:true});
    for(const s of [-1,1]) path(p,'pot handle',[[s*.336,.414,-.109],[s*.451,.417,-.074],[s*.451,.418,.075],[s*.336,.417,.108]],.029,metal);
  } else if(shape==='tank') {
    profile(p,'empty canister body',[[0,0],[.253,0],[.27,.052],[.272,.61],[.218,.71],[.118,.76],[0,.76]],paint);
    lid(p,'threaded lid',.131,.731,.084,slate);
  } else workshopGoods.vessel(p,d);
}

function cylinder(p,d) {
  const {id}=d;
  const scuba=d.id.includes('scuba');
  const tiny=/butane|smoxygen/.test(d.id);
  const color=scuba?0x859497:d.id.includes('oxygen')?0x688674:0xb69767;
  const r=id==='small_scuba_tank'?.185:tiny?.19:scuba?.238:.167;
  const body=steelP(color);
  profile(p,'gas cylinder',[[0,0],[r*.79,0],[r,.043],[r,.67],[r*.88,.744],[r*.41,.79],[0,.79]],body,{metal:true});
  lid(p,'valve collar',r*.45,.765,.099,steel);
  if(scuba||!tiny) tube(p,'external valve wheel',V(-.10,.842,0),V(.104,.842,0),.035,.035,10,slate);
  if(id==='butane_can') lid(p,'recessed refill nozzle',.03,.858,.048,cream);
  if(id==='oxygen_tank'||id==='smoxygen_tank'){
    cyl(p,'regulator dial shell','z',[.092,.791,-.042],.047,.051,10,steel);
    path(p,'looped delivery hose',[[.113,.816,.029],[.247,.721,.037],[.286,.471,.012],[.254,.256,-.064],[.215,.191,-.167]],.021,slate);
    bevel(p,'packed oxygen face mask',[.118,.105,-.286,.341,.296,-.133],.054,glass,GLASS);
    path(p,'mask elastic',[[.135,.163,-.206],[.103,.124,-.342],[.242,.109,-.377],[.346,.138,-.301],[.333,.194,-.199]],.015,slate);
  }
  front(p,'cylinder markings',[-r*.52,.279,r*.52,.573],-r*.987,label(color,scuba?'DIVE':d.name,d.key));
}

function lab(p,d) {
  const {id,shape,color}=d;
  const paint=plasticP(color);
  if(shape==='microscope') {
    const stereo=id.includes('dissecting');
    bevel(p,'weighted base',[-.297,0,-.237,.312,.081,.251],.033,paint);
    path(p,'curved support',[[.14,.068,.131],[.204,.244,.144],[.185,.493,.104],[.052,.628,.026]],.063,paint);
    bevel(p,'sample stage',[-.224,.199,-.171,.156,.251,.145],.021,slate);
    for(const x of stereo?[-.082,.056]:[-.022]) {
      tube(p,'inclined eyepiece',V(x,.492,-.06),V(x,.746,.097),.047,.053,10,steel);
      cyl(p,'rubber eyecup','y',[x,.747,.097],.061,.046,10,slate);
    }
    for(const x of [-.101,.029,.117]) tube(p,'short objective lens',V(x,.309,-.036),V(x,.429,-.026),.024,.037,8,steel);
    cyl(p,'focus knob','x',[.242,.315,.147],.067,.051,10,slate);
    return;
  }
  if(id.includes('filter_paper')) {
    const folded=id.includes('quantitative');
    for(let i=0;i<3;i++) cutShape(p,'filter paper sheet',oval(i*.029,-i*.013,.37,.36,16),.009,paperP(folded?0xe5dfce:0xd4c7a7),i*.012);
    return;
  }
  if(id==='cuvettes') {
    p.box('cuvette carrier',[-.395,0,-.23,.395,.075,.23],slate);
    for(const x of [-.255,-.084,.084,.255]) {
      p.box('square cell base',[x-.069,.043,-.069,x+.069,.078,.069],glass,GLASS);
      for(const sign of [-1,1]){
        const z=sign*.063;
        p.box('glass cell wall',[x-.069,.076,z-.008,x+.069,.349,z+.008],glass,GLASS);
        p.box('glass cell wall',[x+z-.008,.076,-.069,x+z+.008,.349,.069],glass,GLASS);
      }
    }
    return;
  }
  if(id==='burette'||id==='funnel_separation') {
    if(id==='burette'){
      cyl(p,'graduated glass tube','z',[0,.062,0],.064,.777,12,glass,GLASS);
      for(let n=0;n<12;n++) top(p,'graduation tick',[-.034,-.35+n*.056,.024+n%2*.014,-.344+n*.056],.126,slate);
      tube(p,'outlet tip',V(0,.059,.39),V(0,.042,.479),.027,.012,10,glass,GLASS);
      tube(p,'stopcock handle',V(-.125,.077,.328),V(.129,.077,.328),.026,.026,8,cream);
    } else {
      profile(p,'pear-shaped separatory funnel',[[.032,.077],[.062,.168],[.198,.401],[.179,.521],[.086,.598],[.07,.729],[.051,.729],[.061,.586],[.155,.513],[.17,.406],[.047,.171]],glass,GLASS);
      lid(p,'funnel stopper',.079,.717,.061,cream);
      tube(p,'stopcock',V(-.106,.123,0),V(.127,.123,0),.027,.027,9,steel);
      lid(p,'protective ring stand',.17,0,.045,slate);
    }
    return;
  }
  if(shape==='flask'){
    bevel(p,'basic kit carrying tray',[-.42,0,-.325,.42,.068,.325],.022,slate);
    profile(p,'clear bench flask',[[0,.069],[.148,.069],[.160,.097],[.108,.239],[.054,.289],[.05,.372],[.033,.372],[.039,.283],[.129,.103],[0,.097]],glass,{...GLASS,sides:12,at:[-.208,-.118]});
    profile(p,'small measuring cup',[[0,.068],[.104,.068],[.119,.248],[.098,.251],[.088,.092],[0,.092]],glass,{...GLASS,sides:12,at:[.175,-.121]});
    path(p,'coiled clear hose',[[ -.086,.091,.149],[-.257,.091,.141],[-.249,.089,.251],[-.049,.09,.265],[.083,.094,.19],[-.022,.092,.14]],.014,glass,GLASS);
    bevel(p,'clear safety glasses', [ .105,.078,.107,.336,.131,.156],.015,glass,GLASS);
    for(const x of [.114,.325]) path(p,'glasses temple',[[x,.098,.154],[x,.102,.227],[x+(.22-x)*.2,.088,.291]],.011,slate);
    return;
  }
  if(id==='analytical_set_basic'){
    bevel(p,'portable instrument kit tray',[-.435,0,-.333,.436,.083,.334],.032,slate);
    bevel(p,'compact digital balance',[-.326,.079,-.253,-.016,.123,.032],.018,cream);
    cyl(p,'scale platform','y',[-.171,.132,-.118],.091,.021,12,steel);
    bevel(p,'instrument housing',[.044,.081,-.248,.335,.219,.011],.025,plasticP(color));
    p.box('sample slot',[.122,.214,-.204,.258,.227,-.111],slate);
    for(const x of [-.272,-.144,-.015,.114]) bevel(p,'sampling cell',[x-.037,.083,.102,x+.039,.216,.174],.009,glass,GLASS);
    return;
  }
  if(id==='melting_point') {
    bevel(p,'instrument hot plate',[-.396,0,-.307,.396,.127,.306],.037,slate);
    bevel(p,'upright heating block',[-.142,.12,-.096,.218,.48,.205],.032,steel);
    cyl(p,'inspection viewport','z',[.035,.376,-.109],.099,.077,12,slate);
    cyl(p,'magnifying lens','z',[.035,.376,-.149],.073,.015,12,glass,GLASS);
    front(p,'front control strip',[-.261,.041,.237,.104],-.31,label(color,'TEMP',d.key));
    return;
  }
  if(id==='balance_small') {
    bevel(p,'weighted scale foot',[-.433,0,-.183,.43,.062,.182],.018,steel);
    bevel(p,'balance support',[-.201,.048,-.108,-.074,.343,.086],.024,slate);
    path(p,'pan linkage',[[ -.136,.273,0],[-.304,.26,0],[-.322,.311,0]],.025,steel);
    profile(p,'weighing pan',[[0,.31],[.122,.31],[.162,.341],[.148,.359],[.12,.342],[0,.335]],steel,{at:[-.309,0],sides:14});
    for(const [n,z] of [-.089,0,.089].entries()){
      p.box('scale rule beam',[-.134,.229,z-.018,.346,.259,z+.018],steel);
      const x=.055+n*.108;
      bevel(p,'sliding mass',[x-.037,.211,z-.034,x+.038,.277,z+.035],.009,slate);
    }
    p.box('end pointer', [.346,.229,-.009,.433,.254,.01],steel);
    return;
  }
  const spin=id==='microcentrifuge'||id==='vortex';
  const low=id==='gelbox';
  const h=low?.17:spin?.30:.37;
  bevel(p,'instrument housing',[-.403,0,-.307,.403,h,.314],.054,paint);
  bevel(p,'instrument control panel',[-.326,.065,-.326,.333,h-.029,-.298],.013,slate);
  front(p,'instrument readout',[-.225,.093,-.02,h-.053],-.327,label(0x5b7472,d.name,d.key));
  cyl(p,'control knob','z',[.198,h*.47,-.331],.048,.031,10,steel);
  if(spin) {
    const centrifuge=id==='microcentrifuge';
    cyl(p,centrifuge?'rotor lid':'rubber tube cup','y',[0,h+.036,.035],centrifuge?.226:.131,.086,14,centrifuge?cream:rubber);
    if(centrifuge) for(const x of [-.149,.149]) bevel(p,'lid hinge',[x-.044,h,.196,x+.044,h+.062,.266],.012,steel);
  } else if(id==='ph_meter') {
    path(p,'probe cable',[[.345,.093,.13],[.465,.078,.229],[.467,.039,.355],[.301,.028,.434],[.066,.029,.40]],.017,slate);
    tube(p,'glass pH probe',V(.061,.056,.382),V(-.279,.062,.382),.025,.017,9,glass,GLASS);
    tube(p,'reference probe',V(.103,.056,.307),V(-.253,.057,.307),.023,.015,9,glass,GLASS);
    cyl(p,'sealed reference cup','y',[-.244,.082,.15],.071,.156,11,cream);
    lid(p,'reference cup closure',.075,.146,.024,steel);
  } else if(id==='gelbox') {
    bevel(p,'electrophoresis tray',[-.267,h-.02,-.173,.264,h+.101,.199],.023,glass,GLASS);
    for(const x of [-.196,.196]) path(p,'terminal wire',[[x,h+.067,.103],[x*1.48,h+.049,.258],[x*1.75,h-.058,.301]],.019,x<0?slate:plasticP(0xb25956));
  } else {
    bevel(p,'sample lid',[-.263,h-.012,-.13,.236,h+.055,.196],.022,slate);
    if(id==='analytical_set_basic') {
      cyl(p,'sample vial','y',[.263,h+.082,.17],.064,.165,12,glass,GLASS);
      cyl(p,'vial stopper','y',[.263,h+.165,.17],.065,.039,10,cream);
    }
  }
}

function medical(p,d) {
  if(d.id==='bifocal_transition_contacts_weekly'){
    bevel(p,'hinged case bottom',[-.435,0,-.234,.435,.064,.235],.028,cream);
    for(const x of [-.219,.219]) {
      profile(p,'lens compartment',[[0,.062],[.139,.062],[.158,.073],[.169,.132],[.138,.137],[.128,.082],[0,.081]],plasticP(0x8fa8a1),{at:[x,.004]});
      blob(p,'soft contact lens',[.096,.023,.095],[x,.092,.004],glass,GLASS,3,12);
      cyl(p,'open screw lid','y',[x,.036,.344],.148,.069,14,plasticP(x<0?0x7b9aab:0xaba5a5));
    }
  } else {
    profile(p,'opaque medicine bottle',[[0,0],[.228,0],[.251,.04],[.252,.53],[.17,.617],[.13,.633],[0,.633]],plasticP(0x80604d));
    lid(p,'sealed cap',.144,.627,.099,cream);
    front(p,'hydrogen peroxide label',[-.124,.097,.124,.431],-.251,label(0x9e8267,'PEROXIDE',d.key));
  }
}
function supplyBox(p,d) {
  bevel(p,'medical kit case',[-.432,0,-.293,.435,.082,.291],.031,slate);
  p.box('back hinge',[-.362,.068,.218,.362,.119,.283],steel);
  for(const x of [-.29,-.104,.084,.273]) {
    cyl(p,'sealed medical canister','z',[x,.117,-.025],.062,.403,12,cream);
    cyl(p,'colored safety cap','z',[x,.117,-.227],.062,.041,12,plasticP(x<0?0x65867f:0x92748b));
  }
}
function wrapper(p,d) {
  bevel(p,'thin discarded wrapper',[-.424,0,-.182,.423,.046,.181],.017,paperP(0xc8ad81));
  top(p,'printed protein bar wrapper',[-.379,-.158,.383,.158],.048,label(0x805c46,'DAIZOOM PROTEIN',d.key));
  top(p,'manufacturer line',[-.252,.079,.26,.145],.05,label(0xa18460,'SOYPELUSA',d.key));
  for(const x of [-.411,.396]) p.box('crimped wrapper end',[x-.019,.006,-.191,x+.019,.05,.188],paperP(0x99765a));
}

export const supplyGoods={
  drink,vessel,cylinder,lab,medical,box:supplyBox,bag:wrapper,
  grain:food,cake:food,slab:food,breakfast:food,meal:food,can:food,bottle:food,fodder:food,sausage:food,cutlets:food,
  aquarium(p,d){
    workshopGoods.aquarium(p,{...d,id:'aquarium_medium'});
    for(const z of [-.28,.28]) p.box('reinforced aquarium frame',[-.46,.027,z-.016,.46,.063,z+.016],slate);
    for(const x of [-.441,.441]) for(const z of [-.282,.282]) p.box('corner support',[x-.014,0,z-.016,x+.014,.533,z+.016],slate);
  },
};
