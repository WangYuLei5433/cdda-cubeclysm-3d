import { blob, knitP, speckle } from './item-kit.js';
import { bevel, clothP, cyl, front, GLASS, label, paperP, path, plasticP, rubber, shade, steelP, top, tube } from './common-loot-kit.js';
import { cutShape, oval, profile } from './item-workshop-kit.js';
import { supplyWear } from './item-supply-wear.js';
import { workshopWear } from './item-workshop-wear.js';

const silver=steelP(0xb1b4b2);
const gold=steelP(0xc0a265);
const white=clothP(0xe4ddce);
const black=clothP(0x3e3e43);
const red=clothP(0xb35048);
const visor=plasticP(0xa7c1b9);
const colors = {
  wetsuit_top:0x343c48, wetsuit_jacket:0x343b46, wetsuit_top_sleeved:0x38454f,
  wetsuit_thick:0x353d47, wetsuit_spring:0x403846, wetsuit_shorts:0x3d4550,
  bunker_coat:0xb09768,bunker_pants:0xb09768,jacket_eod:0x697052,trousers_eod:0x687254,
  kittel:0xeee6d2,abaya:0x36353b,plaguedoctor_robe:0x404043,grim_reaper_robe:0x323033,
  robe_wizard:0x535b7c,kariginu:0xbf9c6f,trenchcoat_steampunk:0x3f3638,gambeson_HEMA:0x7a6954,winter_jacket_army:0x78826a,
  jacket_chef:0xe6dfcc,santa_jacket:0xab4e48,santa_jacket_short:0xb04848,santa_dress_long:0xaf4b44,
  dress_wedding:0xe9e4d7,maid_dress_short:0x3d3c43,ninja_dress_sleeveless:0x42383f,
  jumpsuit_skeleton:0x38383b,flag_jumpsuit:0x546588,jumpsuit_pocketless:0xbc754b,
  fursuit:0xa67c60,clown_suit:0xb28459,santa_gloves:0xbb5550,boxing_gloves:0xb04547,
  flotation_vest:0xde8353, seabag:0x666c4c, military_poncho_heavy:0x62694d,
};
const colorOf=d=>colors[d.id]??d.color;

function coat(p,d) {
  const {id,shape}=d,color=colorOf(d);
  const fabric=clothP(color), edge=clothP(shade(color,.7));
  const holiday=shape==='holiday', long=shape==='robe', hood=/wizard|reaper|jacket_army/.test(id);
  if (shape==='cape') {
    const isCape=id==='cape_fp';
    cutShape(p,'draped fabric',[[ -.12,-.365],[.127,-.365],[.27,-.225],[.421,.427],[.186,.465],[-.214,.462],[-.414,.425],[-.25,-.216]],.041,fabric,0,isCape?[]:[oval(0,-.232,.125,.077)]);
    if(isCape) top(p,'cape emblem',[-.14,-.095,.14,.165],.045,label(0x7779a4,'Fp',d.key));
    else cutShape(p,'folded hood',oval(0,-.37,.171,.13,10),.055,fabric,.008,[oval(0,-.367,.105,.066)]);
    for (const x of [-.26,.25]) path(p,'fabric seam',[[x*.52,.048,-.213],[x,.051,.192],[x*1.27,.045,.42]],.008,edge);
    return;
  }
  const crop=shape==='shirt'||id==='santa_jacket_short';
  const end=crop?.143:id==='kittel'?.337:long?.472:.337;
  const h=/bunker|army|eod|gambeson|santa/.test(id)?.077:.048;
  if(id==='binder_top') {
    cutShape(p,'wide compression chest band',[[ -.263,-.15],[.263,-.15],[.274,.083],[.233,.19],[-.236,.19],[-.276,.084]],.057,fabric);
    for(const s of [-1,1]) cutShape(p,'sleeveless shoulder strap',[[s*.127,-.115],[s*.135,-.328],[s*.231,-.343],[s*.257,-.103]],.045,fabric);
    path(p,'flat bottom hem',[[-.23,.057,.17],[0,.059,.184],[.23,.059,.17]],.01,edge);
    return;
  }
  const base=[[-.208,-.335],[-.091,-.344],[0,-.241],[.094,-.344],[.213,-.334],[.243,-.134],[.202,-.058],[long?.292:.234,end],[0,end-.012],[-(long?.292:.234),end],[-.202,-.058],[-.245,-.134]];
  cutShape(p,'garment body',base,h,fabric);
  if (id!=='binder_top'&&id!=='santa_jacket_short') {
    const short=/cropped|^wetsuit_top$/.test(id), wide=id==='kariginu';
    for (const s of [-1,1]) {
      const points=[[.19,-.33],[.307,-.297],[short?.387:wide?.465:.44,short?-.19:wide?.30:.163],[wide?.223:.302,short?-.098:wide?.315:.238],[.173,-.105]];
      cutShape(p,'sleeve',points.map(([x,z])=>[s*x,z]),h*.88,fabric);
      if (!short) path(p,'cuff',[[s*(wide?.235:.321),h*.94,wide?.295:.223],[s*(wide?.461:.427),h*.94,wide?.29:.164]],.015,holiday?white:edge);
    }
  }
  if (hood) cutShape(p,'folded fabric hood',oval(0,-.357,.151,.131),.066,fabric,h*.45,[oval(0,-.383,.078,.058)]);
  if (id!=='binder_top') path(p,'front closure',[[.004,h+.006,-.213],[0,h+.008,.059],[0,h+.009,end-.027]],.011,holiday?white:edge);
  if (holiday||/bunker/.test(id)) {
    const stripe=holiday?white:clothP(0xdac964);
    path(p,'hem trim',[[-.22,h,end-.023],[0,h+.005,end-.024],[.22,h,end-.024]],.024,stripe);
    if(!holiday) for (const s of [-1,1]) path(p,'reflective fire service band',[[s*.256,h*.87,.014],[s*.378,h*.87,-.037]],.021,stripe);
  }
  if (/chef|kittel|trenchcoat|kariginu|wizard|plague/.test(id)) {
    const t=id==='trenchcoat_steampunk'?gold:edge;
    for(const x of id==='jacket_chef'?[-.093,.093]:[.028]) for (const z of [-.15,-.07,.01,.092,.171])
      cyl(p,'metal or cloth closure','y',[x,h+.009,z],.014,.016,8,t);
  }
  if (/army|wizard|eod|bunker/.test(id)) for(const x of [-.124,.124])
    bevel(p,'raised front pocket',[x-.07,h-.004,.065,x+.07,h+.032,.208],.012,fabric);
  if (/wetsuit/.test(id)) for(const s of [-1,1]) path(p,'bonded neoprene seam',[[s*.158,h,-.305],[s*.137,h,-.098],[s*.18,h,end-.023]],.013,clothP(0x657e92));
  if (id==='gambeson_HEMA') for (const x of [-.149,-.098,-.044,.045,.101,.15])
    path(p,'quilt stitching',[[x,h+.002,-.215],[x,h+.006,.206],[x*1.29,h+.005,end-.03]],.007,edge);
}
function suit(p,d) {
  const {id}=d,color=colorOf(d);
  if (id==='wetsuit_shorts') {
    for (const s of [-1,1])
      cutShape(p,'short neoprene leg',[[s*.01,-.25],[s*.29,-.25],[s*.378,.299],[s*.108,.36],[s*.016,.04]],.061,plasticP(color));
    path(p,'elastic waistband',[[-.3,.057,-.253],[0,.061,-.26],[.3,.057,-.253]],.022,black);
    return;
  }
  const tint=id==='fursuit'?knitP(color):clothP(color);
  const spring=id==='wetsuit_spring', clown=id==='clown_suit', short=id==='jumpsuit_pocketless';
  const topZ=-.337, crotch=.066, end=spring?.218:.461;
  cutShape(p,'one-piece torso',[[-.188,topZ],[-.067,-.346],[0,-.292],[.08,-.346],[.188,topZ],[.154,-.167],[.18,crotch],[-.18,crotch],[-.154,-.167]],.062,tint);
  for (const s of [-1,1]) {
    const alternate=clown?clothP(s>0?0x6b8197:0xaf555d):tint;
    cutShape(p,'sleeve',[[s*.152,-.326],[s*.266,-.297],[s*(short?.314:.4),short?-.2:.035],[s*(short?.218:.299),short?-.141:.075],[s*.148,-.141]],.049,alternate);
    cutShape(p,'leg',[[s*.015,.038],[s*.178,.032],[s*.188,end-.038],[s*.082,end],[s*.018,.186]],.055,alternate);
    if (id==='jumpsuit_skeleton') {
      for(const z of [-.225,-.17,-.112]) path(p,'printed rib',[[s*.027,.066,z],[s*.091,.067,z+.009],[s*.134,.067,z+.031]],.013,white);
      path(p,'printed shin bone',[[s*.105,.059,.161],[s*.12,.059,.299],[s*.124,.059,.411]],.019,white);
      path(p,'printed arm bone',[[s*.225,.054,-.249],[s*.272,.054,-.158],[s*.333,.054,.003]],.013,white);
    } else if (spring||id==='wetsuit_thick') path(p,'colored sealed stitching',[[s*.144,.068,-.305],[s*.109,.065,-.103],[s*.165,.059,.052],[s*.165,.055,end-.026]],.015,clothP(spring?0xb36b87:0x587782));
  }
  path(p,'body zip',[[0,.063,-.273],[.003,.068,-.143],[0,.064,.041]],.009,clothP(shade(color,.62)));
  if (id==='fursuit') {
    blob(p,'animal costume hood',[.153,.078,.115],[0,.083,-.379],tint,{},4,11);
    blob(p,'light snout',[.078,.043,.059],[0,.145,-.347],white,{},4,10);
    for(const x of [-.117,.117]) blob(p,'rounded costume ear',[.054,.045,.058],[x,.102,-.454],tint,{},3,9);
    path(p,'fur tail',[[.114,.035,.066],[.228,.053,.07],[.294,.083,.144],[.295,.067,.238]],.052,tint);
  } else if (clown) {
    profile(p,'ruffle collar',[[.119,.048],[.159,.059],[.163,.073],[.105,.095],[.092,.084],[.119,.048]],white,{at:[0,-.265],sides:14});
    for(const z of [-.173,-.093,-.015]) blob(p,'pom-pom button',[.043,.035,.042],[0,.084,z],red,{},3,8);
  } else if (id==='flag_jumpsuit') {
    for(const z of [-.164,-.108,-.053,-.001]) top(p,'red flag stripe',[-.143,z,.143,z+.025],.065,red);
    top(p,'blue star field',[-.149,-.222,-.014,-.113],.067,label(0x485b89,'USA',d.key));
  }
}
function dress(p,d) {
  const {id}=d,color=colorOf(d), holiday=id==='santa_dress_long', wedding=id==='dress_wedding';
  const long=/wedding|gown|santa/.test(id), sleeves=/sleeved|santa/.test(id)&&!id.includes('sleeveless');
  const body=clothP(color),fold=clothP(shade(color,.86)),w=wedding?.397:long?.295:.334,e=long?.482:.349;
  const points=[[-.164,-.357],[-.081,-.389],[0,-.271],[.077,-.389],[.162,-.354],[.174,-.194],[.118,-.069],[w,e-.055],[w*.68,e],[-w*.73,e],[-w,e-.043],[-.118,-.069],[-.175,-.194]];
  cutShape(p,'fitted dress and flared skirt',points,.05,body);
  if(sleeves) for(const s of [-1,1]) cutShape(p,'long dress sleeve',[[s*.156,-.344],[s*.232,-.318],[s*.389,-.049],[s*.31,.011],[s*.162,-.208]],.043,body);
  for(const x of [-.21,-.103,.093,.203]) path(p,'fabric fold',[[x*.22,.055,-.06],[x*.63,.057,e*.55],[x,.051,e-.021]],.009,fold);
  if(holiday||wedding||id==='maid_dress_short') {
    path(p,'bright hem trim',[[-w+.016,.051,e-.056],[-w*.68,.058,e-.012],[w*.62,.058,e-.012],[w-.015,.051,e-.058]],.018,white);
    if(id==='maid_dress_short') cutShape(p,'white apron',[[-.13,-.06],[.13,-.06],[.209,.258],[.137,.295],[-.159,.294],[-.217,.246]],.018,white,.045);
  }
  if(id.startsWith('ninja')) {
    path(p,'red sash and trim',[[-.123,.056,-.069],[.123,.056,-.069],[.214,.057,.202]],.018,red);
    top(p,'dragon embroidery',[-.115,.037,.091,.199],.06,label(0x754145,'DRAGON',d.key));
  }
}
function pants(p,d) {
  const {id}=d,color=colorOf(d);
  workshopWear.pants(p,{...d,color});
  if (id==='ski_bib'||id==='bunker_pants') {
    cutShape(p,'ski bib',[[ -.18,-.286],[.176,-.286],[.136,-.466],[-.139,-.466]],.054,clothP(color),.015);
    for (const x of [-.12,.12]) bevel(p,'adjustable suspenders',[x-.026,.043,-.514,x+.026,.073,-.395],.008,black);
  }
  if (id==='bunker_pants') for (const x of [-.15,.15])
    path(p,'reflective cuff band',[[x-.088,.091,.324],[x+.083,.093,.326]],.017,clothP(0xdacd79));
}
function head(p,d) {
  const {id}=d;
  if (id==='10gal_hat') return supplyWear.headwear(p,{...d,id:'cowboy_hat'});
  if (id==='clown_wig') {
    for(let i=0;i<23;i++){
      const a=i*2.4,r=.34*Math.sqrt(i/23);
      blob(p,'curled wig lock',[.102,.084,.093],[r*Math.cos(a),.09+(1-r)*.093,r*Math.sin(a)],knitP([0xb0474a,0xc18345,0xc3ad55,0x678952,0x5d83a1,0x906385][i%6]),{},3,8);
    }
    return;
  }
  if (/hijab|wimple|balaclava/.test(id)) {
    const dark=id==='nun_wimple'?0x38383b:id==='hijab'?d.color:0x515756;
    const body=clothP(dark);
    const contour=[[-.152,-.355],[.127,-.354],[.251,-.214],[.208,.043],[.338,.393],[.076,.458],[-.266,.399],[-.227,.095],[-.253,-.2]];
    const hole=id.includes('balaclava')?oval(0,-.071,.137,.061):oval(0,-.086,.143,.178);
    cutShape(p,'shaped face opening and fabric',contour,.069,body,0,[hole]);
    cutShape(p,'stitched face border',hole.map(([x,z])=>[x*1.16,(z+.086)*1.13-.086]),.022,id==='nun_wimple'?white:clothP(shade(dark,1.24)),.061,[hole]);
    for(const x of [-.156,.166]) path(p,'cloth folds',[[x,.071,.097],[x*.8,.073,.218],[x*1.25,.071,.386]],.012,body);
    return;
  }
  if (/wizard_hat|santa_hat/.test(id)) {
    const wizard=id.startsWith('wizard'),t=wizard?clothP(0x454f86):red;
    profile(p,wizard?'wide brim':'white fur band',[[.2,0],[wizard?.405:.294,0],[wizard?.422:.307,.044],[.219,.073],[.2,.043],[.2,0]],wizard?t:white);
    profile(p,'pointed cloth crown',[[.224,.051],[.192,.202],[.128,.422],[.07,.566],[.015,.727],[0,.729]],t);
    if(wizard) for(const [x,y,z] of [[-.107,.229,-.173],[.054,.333,-.155],[-.016,.464,-.118]]) {
      path(p,'gold stitched star',[[x-.027,y,z],[x+.024,y,z]],.009,gold);
      path(p,'gold stitched star',[[x,y-.028,z],[x,y+.026,z]],.009,gold);
    } else blob(p,'fur pom-pom',[.073,.076,.076],[.043,.715,0],white,{},4,10);
    return;
  }
  if (id==='hat_chef'||id==='straw_fedora') {
    const chef=id==='hat_chef',color=chef?0xe8dfcf:0xc4aa76,paint=chef?clothP(color):knitP(color);
    profile(p,'hat brim or band',[[.195,0],[chef?.274:.398,0],[chef?.287:.405,.073],[.249,.09],[.211,.067],[.195,0]],paint,{scale:[1,.91]});
    profile(p,'tall crown',[[.25,.071],[.245,.183],[chef?.33:.231,chef?.445:.254],[chef?.281:.193,chef?.513:.31],[.122,chef?.52:.30],[0,chef?.483:.274]],paint,{scale:[1,.87]});
    if (!chef) profile(p,'hatband',[[.249,.105],[.25,.159]],black,{scale:[1,.88]});
    return;
  }
  if (id==='helmet_plate') {
    profile(p,'riveted great helm',[[.241,0],[.321,0],[.337,.091],[.324,.52],[.289,.604],[.087,.634],[0,.63]],silver,{sides:12,scale:[1,.85],metal:true});
    front(p,'black eye slit',[-.217,.361,.222,.407],-.287,black);
    for(const x of [-.138,-.076,.071,.138]) for(const y of [.19,.248]) cyl(p,'vent rivet','z',[x,y,-.282],.013,.019,7,black);
    return;
  }
  const pick=id==='pickelhaube',hard=id==='hat_hard_hooded',paint=plasticP(hard?0xc8a343:pick?0x444346:0x67705a);
  profile(p,'helmet shell',[[.202,0],[.312,0],[.34,.127],[.294,.36],[.228,.461],[.071,.498],[0,.49]],paint,{scale:[1,.88]});
  cutShape(p,'front brim',[[ -.305,-.102],[.306,-.102],[.267,-.318],[.009,-.374],[-.259,-.327]],.041,paint,.076);
  if (pick) profile(p,'ornamental brass spike',[[.124,.449],[.084,.481],[.046,.59],[.016,.72],[0,.739]],gold,{metal:true});
  else if(hard) cutShape(p,'folded sun shield',[[-.278,.023],[.279,.024],[.288,.35],[.129,.421],[-.225,.356]],.036,clothP(0xd3ac60),.03);
  else {
    bevel(p,'armored face visor',[-.252,.116,-.301,.252,.354,-.152],.037,visor,{glass:true});
    for(const x of [-.229,.228]) bevel(p,'helmet side controls',[x-.05,.215,-.237,x+.05,.365,-.17],.018,black);
  }
}
function handwear(p,d) {
  const {id}=d, c=colorOf(d), boxing=id==='boxing_gloves';
  if (boxing) {
    for(const x of [-.221,.221]) {
      blob(p,'padded leather fist',[.195,.164,.224],[x,.151,-.11],plasticP(c),{},5,12);
      blob(p,'padded thumb',[.073,.097,.109],[x-Math.sign(x)*.122,.101,.035],plasticP(shade(c,.92)),{},4,10);
      bevel(p,'wrist closure',[x-.121,0,.065,x+.121,.141,.34],.045,plasticP(shade(c,.76)));
      top(p,'white wrist mark',[x-.078,.143,x+.08,.247],.144,label(0x765a59,'8 OZ',d.key));
    }
    return;
  }
  const neoprene=id.includes('wetsuit'), bones=id.includes('skeleton'), plated=id.includes('plate'), fingerless=id.includes('airsoft');
  for(const x of [-.225,.225]) {
    const fabric=neoprene?plasticP(0x444e5b):clothP(bones?0x363539:c);
    bevel(p,'glove palm',[x-.128,0,-.118,x+.119,.076,.255],.025,fabric);
    for(let j=0;j<4;j++) {
      const dx=(j-1.5)*.061, end=fingerless?-.19:-.366+Math.abs(j-1.4)*.045;
      bevel(p,'glove finger',[x+dx-.028,.002,end,x+dx+.029,.064,-.092],.021,fabric);
      if(bones||plated) path(p,'knuckle and finger decoration',[[x+dx,.067,end+.038],[x+dx,.068,-.13],[x+dx*.63,.081,-.027]],.013,bones?white:silver);
    }
    path(p,'glove thumb',[[x-Math.sign(x)*.103,.035,.079],[x-Math.sign(x)*.18,.033,.037],[x-Math.sign(x)*.178,.033,-.074]],.032,fabric);
    p.box('adjustable cuff',[x-.128,.017,.188,x+.119,.085,.283],id==='santa_gloves'?white:clothP(shade(c,.72)));
    if(plated||fingerless) bevel(p,'protective back pad',[x-.092,.069,-.091,x+.092,.112,.096],.024,plated?silver:black);
  }
}
function foot(p,d) {
  if (d.id==='socks_bowling') {
    for(const x of [-.214,.211]) cutShape(p,'flat disposable sock',[[x-.109,-.352],[x+.088,-.369],[x+.14,-.232],[x+.077,-.031],[x+.12,.345],[x-.064,.371],[x-.125,.096],[x-.157,-.166]],.038,white);
    return;
  }
  const armor=/plate|eod/.test(d.id),gaiter=d.id.includes('gaiter'),paint=armor?silver:clothP(d.color);
  for(const x of [-.215,.215]) {
    if(!gaiter) {
      bevel(p,'thick boot sole',[x-.171,0,-.404,x+.17,.061,.277],.051,rubber);
      bevel(p,'boot toe and foot',[x-.15,.045,-.374,x+.151,.217,.215],.056,paint);
    }
    bevel(p,gaiter?'open canvas gaiter':'boot shaft',[x-.12,gaiter?0:.09,-.013,x+.129,gaiter?.231:.368,.279],.037,paint);
    for(const z of [gaiter?.054:-.281,gaiter?.155:-.157,gaiter?.241:-.036])
      path(p,'reinforcing band',[[x-.124,gaiter?.229:.195,z],[x,gaiter?.243:.225,z],[x+.118,gaiter?.229:.195,z]],.021,armor?steelP(0x717b81):black);
  }
}
function carry(p,d) {
  const {id,shape}=d,c=colorOf(d), paint=clothP(c),edge=clothP(shade(c,.68));
  const round=/seabag|duffel/.test(id),bag=shape==='bag', narrow=/molle_papr|modular_papr/.test(id);
  const w=round?.41:bag?.289:narrow?.375:.241, z=round?.21:bag?.329:narrow?.077:.166;
  const h=round?(id==='seabag'?.398:.286):narrow?.089:bag?.24:.161;
  if (id==='modular_papr_strap'){
    bevel(p,'flexible MOLLE backing panel',[-.405,0,-.141,.401,.059,.143],.026,paint);
    for(const x of [-.27,-.095,.089,.271]) path(p,'stitched loop',[[x,.041,-.136],[x,.08,-.071],[x,.083,.05],[x,.04,.128]],.024,edge);
    return;
  }
  if(id==='military_papr_blower_off') cutShape(p,'triangular back-mounted housing',[[0,-.36],[.304,.201],[.218,.267],[-.225,.269],[-.305,.201]],.211,plasticP(c));
  else bevel(p,bag?'soft-sided bag':'pouch body',[-w,0,-z,w,h,z],round?.11:.045,bag?paint:plasticP(c));
  if (round) {
    path(p,'long metal zipper',[[-w+.051,h,.01],[w-.052,h,.01]],.015,edge);
    for(const x of [-.241,.245]) path(p,'carry handle',[[x,h,-.079],[x,h+.148,-.027],[x,h+.119,.068],[x,h,.139]],.027,edge);
    if(id==='seabag') for(const x of [-.19,.192]) path(p,'wide shoulder straps',[[x,.051,.157],[x*.88,.092,.273],[x*.71,.195,.272],[x*.84,.273,.188]],.035,edge);
  } else if (bag) {
    bevel(p,'front compartment',[-w+.052,h-.024,-.079,w-.049,h+.071,z-.05],.021,paint);
    for(const x of [-.146,.146]) path(p,'webbing strap',[[x,.03,-z],[x,.019,-z-.07],[x,.019,-z-.1],[x+Math.sign(x)*.041,.027,-.03]],.029,edge);
    if(id==='backpack_tactical_large') for(const x of [-.197,.199]) bevel(p,'padded side compartments',[x-.089,.072,-.152,x+.09,.241,.164],.032,paint);
    if(id==='chestpouch') top(p,'single closure flap',[-w+.046,-.213,w-.045,.05],h+.076,edge);
    if(/molle|tactical/.test(id)) for(const k of [0,.056,.113,.173])
      top(p,'horizontal load-webbing row',[-w+.06,k,w-.06,k+.023],h+.075,edge);
  } else {
    for (const x of [-w,w]) path(p,'buckled strap',[[x,.045,-z*.65],[x*1.28,.045,-z*.36],[x*1.36,.042,z*.37],[x,.048,z*.7]],.029,edge);
    if(id.includes('papr')) for(const x of [-.127,0,.128])
      bevel(p,'vented module',[x-.041,h-.01,-.056,x+.041,h+.051,.079],.014,black);
  }
}
function armor(p,d) {
  const {id,shape}=d;
  if(shape==='vest') {
    const c=colorOf(d);
    supplyWear.armor(p,{...d,color:c,shape:'vest'});
    if(id==='armor_riot_torso') top(p,'police identification',[-.172,-.093,.175,.085],.199,label(0x50535a,'POLICE',d.key));
    if(id==='ballistic_vest_esapi') for(const x of [-.288,.289]) bevel(p,'side plate pouch',[x-.063,.028,.05,x+.064,.121,.259],.019,clothP(c));
    if(id==='flotation_vest') for(const x of [-.141,.141])
      bevel(p,'thick high-visibility flotation pad',[x-.105,.074,-.145,x+.105,.145,.318],.044,clothP(c));
    if(id.includes('operator')) bevel(p,'shoulder radio pouch',[.134,.075,-.299,.247,.158,-.11],.025,clothP(c));
    return;
  }
  const neck=/throat|nape|neck|chin|mandible/.test(id),pair=/riot_arm|shoulder_plate/.test(id);
  if(id==='armor_junk_plate'){
    const iron=steelP(0x946a55), dull=steelP(0x776961);
    cutShape(p,'salvaged breastplate',[[ -.288,-.19],[-.181,-.366],[.181,-.366],[.29,-.189],[.224,.133],[.141,.227],[-.141,.228],[-.216,.135]],.107,iron);
    for(const x of [-.24,.24]){
      bevel(p,'rusty shoulder plate',[x-.125,.03,-.295,x+.126,.154,-.105],.04,dull);
      path(p,'worn leather strap',[[x,.082,-.22],[x*1.29,.051,.017],[x*.76,.08,.162]],.025,rubber);
    }
    for(const [i,z] of [.17,.256,.346].entries()) bevel(p,'overlapping waist plate',[-.233+i*.024,.006,z,.234-i*.025,.087-i*.011,z+.106],.029,iron);
    return;
  }
  const ceramic=/esapi|esbi|ceramic/.test(id), cloth=/nylon|canvas|kevlar|mesh|iotv/.test(id);
  const paint=cloth?clothP(d.color):ceramic?plasticP(0x6d6b59):id.includes('plastic')?rubber:silver;
  const edge=cloth?clothP(shade(d.color,.72)):rubber;
  if(neck) {
    const nape=id.includes('nape'), chin=/chin|mandible/.test(id),jaw=id.includes('mandible');
    const points=nape?[[-.383,-.238],[.403,-.238],[.332,.155],[.207,.29],[-.211,.282],[-.332,.164]]:chin?
      [[-.401,-.185],[-.298,-.208],[-.205,.056],[.17,.056],[.285,-.206],[.408,-.179],[.324,.142],[.166,.259],[-.186,.26],[-.325,.159]]:
      [[-.412,-.109],[-.309,-.232],[-.142,-.134],[.136,-.134],[.297,-.239],[.412,-.094],[.279,.175],[.132,.237],[-.132,.227],[-.28,.174]];
    if(id==='iotv_neck_plate') {
      cutShape(p,'padded two-part collar',oval(0,0,.416,.343,14),.122,paint,0,[oval(0,0,.229,.183,14)]);
      for(const x of [-.367,.365]) bevel(p,'neck insert pouch overlap',[x-.053,.094,-.113,x+.053,.153,.119],.015,edge);
      return;
    }
    cutShape(p,'curved protective guard',points,nape?.042:.071,paint);
    if(jaw) {
      cutShape(p,'full height mandible shield',[[-.284,.072],[-.212,-.008],[.213,-.009],[.288,.071],[.232,.198],[.133,.245],[-.152,.24],[-.239,.213]],.142,paint,.011);
      for(const x of [-.081,0,.081]) bevel(p,'ventilation inlet',[x-.021,.149,.093,x+.02,.158,.152],.003,steelP(0x72797a));
    }
    if(nape) {
      for(const x of [-.236,.238]) bevel(p,'nape helmet attachment',[x-.04,.03,-.277,x+.039,.063,-.135],.015,edge);
      if(id.startsWith('mesh')) for(let k=0;k<8;k++) path(p,'mesh textile rib',[[-.264,.047,-.157+k*.047],[.27,.047,-.148+k*.047]],.006,edge);
      return;
    }
    path(p,'raised binding',[[-.36,.075,-.064],[-.25,.083,.127],[-.113,.095,.177],[.156,.093,.174],[.288,.082,.099],[.369,.077,-.072]],.022,edge);
    return;
  }
  const parts=pair?[-.233,.233]:[0];
  const width=pair?.166:id.includes('esbi')?.245:id.includes('lc_arm')?.207:id.includes('lc_leg')?.257:.367;
  for(const x of parts) {
    const points=[[x-width,-.254],[x-width*.62,-.399],[x+width*.62,-.399],[x+width,-.253],[x+width,.314],[x+width*.79,.374],[x-width*.8,.374],[x-width,.313]];
    cutShape(p,'shaped protective panel',points,.087,paint);
    cutShape(p,'raised outer surface',points.map(([a,b])=>[x+(a-x)*.82,b*.91]),.025,paint,.079);
    if(/plate/.test(id)&&!id.startsWith('iotv')) top(p,'orientation marking',[x-width*.65,-.232,x+width*.65,.041],.106,label(ceramic?0x6b6957:0x657077,id==='steel_ballistic_plate'?'NIJ III A':'STRIKE FACE',d.key));
    else for(const z of [-.17,.17]) path(p,'retention strap',[[x-width,.057,z],[x,.113,z],[x+width,.058,z]],.018,edge);
    if(id.includes('destroyed')) path(p,'fracture',[[x-width*.85,.108,-.17],[x-.07,.109,-.031],[x+.043,.11,.087],[x+width*.72,.108,.179]],.015,rubber);
  }
}
function face(p,d) {
  const {id,shape}=d;
  if(id.includes('ear_plug')||id==='powered_earplugs') {
    for(const x of [-.26,.26]) {
      blob(p,'earplug tip',[.064,.058,.082],[x,.058,-.095],plasticP(id.includes('attached')?0xc3874d:0x62716a),{},4,10);
      bevel(p,'plug handle',[x-.047,.016,-.037,x+.047,.09,.071],.016,black);
    }
    if(id.includes('attached')) path(p,'retaining cord',[[-.26,.035,.07],[-.17,.029,.224],[0,.024,.324],[.165,.028,.224],[.26,.034,.07]],.012,plasticP(0x5a7690));
    return;
  }
  if (id==='eyepatch_leather'||id==='mouthpiece') {
    const patch=id==='eyepatch_leather';
    const points=oval(0,-.088,patch?.217:.333,patch?.203:.243,12);
    cutShape(p,patch?'leather eye patch':'mouthguard',points,.07,patch?rubber:plasticP(0x61929a),0,patch?[]:[oval(0,-.032,.245,.147)]);
    if (patch) path(p,'eyepatch cord',[[-.205,.044,-.064],[-.385,.041,.088],[-.267,.035,.28],[.259,.035,.266],[.379,.041,.083],[.205,.043,-.067]],.015,black);
    return;
  }
  if (id==='headgear') {
    const paint=plasticP(0xab5150);
    cutShape(p,'thick padded shell',oval(0,-.006,.374,.377,13),.135,paint,0,[oval(0,-.067,.208,.244,12)]);
    for(const x of [-.265,.268]) blob(p,'padded cheek protector',[.094,.091,.158],[x,.109,.096],paint,{},4,10);
    path(p,'arched crown strap',[[-.301,.086,.133],[-.193,.205,.212],[.004,.249,.263],[.195,.204,.212],[.302,.083,.133]],.048,paint);
    path(p,'adjustable chin strap',[[-.255,.053,.232],[-.14,.036,.318],[.139,.035,.317],[.253,.052,.234]],.024,rubber);
    return;
  }
  if (shape==='shield') {
    const sun=id==='sun_shield',lens=id.startsWith('outsert'),breach=id.endsWith('breach');
    const paint=sun?clothP(0xc7ac6c):breach?plasticP(0x788c89):visor;
    if (lens) {
      profile(p,'panoramic polycarbonate lens',[[0,.022],[.226,0],[.333,.025],[.353,.066],[.321,.098],[.194,.136],[0,.144]],paint,{scale:[1,.67],...GLASS});
      for(const x of [-.333,.335]) bevel(p,'mask lens retaining clip',[x-.02,.017,-.032,x+.022,.075,.062],.009,breach?black:silver);
      return;
    }
    const points=[[-.41,-.133],[-.243,-.311],[.236,-.311],[.411,-.136],[.342,.199],[.178,.329],[-.182,.332],[-.337,.198]];
    if(sun) cutShape(p,'sun shade',points,.042,paint);
    else if(id==='face_shield_plastic'){
      bevel(p,'larger clear face shield',[-.407,.017,-.244,.405,.109,.374],.059,paint,{glass:true});
      path(p,'rigid adjustable mounting bracket',[[-.395,.043,-.096],[-.376,.081,-.281],[-.217,.083,-.367],[.219,.083,-.367],[.373,.077,-.278],[.396,.043,-.096]],.026,rubber);
    } else bevel(p,'short curved visor',[-.397,.019,-.238,.395,.096,.266],.044,paint,{glass:true});
    path(p,'mounting rim',[[-.395,.039,-.12],[-.22,.067,-.293],[.213,.067,-.294],[.393,.039,-.127]],.022,black);
    for(const x of [-.36,.36]) bevel(p,'side clip',[x-.045,.023,-.141,x+.045,.089,-.035],.014,silver);
    return;
  }
  if (id==='scuba_regulator'||id==='military_papr_mask') {
    const diver=id==='scuba_regulator';
    if(!diver) {
      cutShape(p,'rubber face seal',[[-.31,-.118],[-.245,-.337],[.248,-.331],[.308,-.122],[.238,.251],[.001,.345],[-.237,.246]],.123,rubber);
      bevel(p,'panoramic lens',[-.239,.098,-.285,.239,.158,-.072],.04,visor,{glass:true});
    }
    for (const z of diver?[-.151,.211]:[.183]) {
      cyl(p,'round valve housing','y',[0,.112,z],diver?.149:.115,.157,14,rubber);
      cyl(p,'valve cover','y',[0,.196,z],.092,.029,11,silver);
    }
    path(p,'breathing hose',[[.104,.08,.218],[.303,.069,.259],[.421,.062,.033],[.293,.068,-.215],[.119,.089,-.203]],.032,rubber);
    return;
  }
  if(id==='goggles_nv'||id==='military_vis_aug_system'){
    const wide=id==='military_vis_aug_system';
    bevel(p,'electronic headset shroud',[-.354,.043,-.242,.352,.221,.124],.051,wide?plasticP(0x6c7472):rubber);
    bevel(p,'wide dark visor',[-.282,.094,-.286,.282,.188,-.217],.028,plasticP(0x6f8e86),{glass:true});
    if(wide) bevel(p,'forehead interface housing',[-.179,.191,-.116,.177,.298,.122],.027,steelP(0x6e7777));
    else for(const x of [-.122,.122]) cyl(p,'infrared emitter and receiver','z',[x,.134,-.292],.042,.04,10,x<0?plasticP(0x897070):visor);
    path(p,'headband',[[-.32,.071,.08],[-.342,.061,.246],[-.181,.056,.354],[.186,.057,.352],[.343,.061,.242],[.323,.07,.08]],.024,black);
    return;
  }
  if (shape==='goggles') {
    const sunglass=id==='altered_sunglasses', correction=id==='insert_vision_correction';
    const n=id==='advanced_gpnvg'?4:2;
    const gadget=!sunglass&&!correction;
    const lens=plasticP(sunglass?0xbc784e:correction?0xc0cdc3:0x829a76);
    bevel(p,'frame bridge',[gadget?-.194:-.067,gadget?.063:.047,-.072,gadget?.196:.067,gadget?.152:.063,.064],gadget?.026:.008,gadget?black:silver);
    for(let j=0;j<n;j++){
      const x=(j-(n-1)/2)*(n===4?.187:.325);
      const r=n===4?.093:.133;
      if(gadget) {
        cyl(p,'night vision tube','z',[x,.151,-.094],r,.343,12,rubber);
        cyl(p,'front optic','z',[x,.151,-.277],r*.79,.036,12,lens);
        cyl(p,'rubber eyecup','z',[x,.15,.109],r*1.1,.062,12,black);
      } else {
        cutShape(p,'rounded lens',oval(x,-.104,r,r*.88,12),.026,lens,.037);
        cutShape(p,'slender lens frame',oval(x,-.104,r+.018,r*.88+.016,12),.035,silver,.031,[oval(x,-.104,r,r*.88,12)]);
      }
    }
    path(p,'head strap or temple pieces',[[-.352,.071,.011],[-.389,.069,.264],[-.194,.074,.34],[.196,.074,.34],[.381,.069,.258],[.35,.075,.012]],gadget?.028:.013,black);

    return;
  }
  const beard=id==='santa_beard', zombie=id==='zombie_mask',c=beard?0xe5ddcd:zombie?0x809174:d.color;
  const faceOutline=[[-.308,-.122],[-.201,-.31],[.206,-.31],[.308,-.12],[.264,.118],[.164,.289],[0,.382],[-.168,.289],[-.265,.119]];
  cutShape(p,beard?'sculpted beard':zombie?'costume face':'padded boxing headgear',faceOutline,.083,beard?knitP(c):clothP(c),0,beard?[]:zombie?[oval(-.108,-.109,.057,.047),oval(.108,-.109,.057,.047)]:[oval(0,-.051,.186,.173)]);
  if(zombie) {
    blob(p,'distorted nose',[.055,.063,.061],[.016,.092,-.012],plasticP(shade(c,.75)),{},3,8);
    top(p,'torn leather mouth and seams',[-.124,.068,.132,.189],.086,label(0x5e5146,'',d.key));
  }
  if(beard) {
    for(const x of [-.163,-.065,.065,.163]) path(p,'wavy white fibers',[[x,.083,-.172],[x*.91,.088,.019],[x*.58,.093,.251]],.018,white);
    path(p,'elastic beard strap',[[-.277,.054,-.137],[-.4,.025,-.263],[-.227,.023,-.402],[.226,.029,-.399],[.4,.025,-.261],[.278,.049,-.14]],.017,white);
  }
}
function cloth(p,d) {
  const {id}=d;
  if(id==='state_flag') {
    cutShape(p,'white flag textile',[[-.451,-.294],[.404,-.294],[.409,.231],[.256,.286],[-.445,.267]],.025,white);
    top(p,'Massachusetts shield and star',[-.138,-.173,.162,.172],.029,(ctx,x,y,w,h)=>{
      ctx.fillStyle='#41618b';
      ctx.beginPath();ctx.moveTo(x+w*.11,y+h*.1);ctx.lineTo(x+w*.87,y+h*.1);ctx.lineTo(x+w*.82,y+h*.68);
      ctx.lineTo(x+w*.5,y+h*.92);ctx.lineTo(x+w*.19,y+h*.7);ctx.closePath();ctx.fill();
      ctx.fillStyle='#dfc485';ctx.fillRect(x+w*.43,y+h*.28,w*.17,h*.4);
      ctx.fillStyle='#eee4c9';ctx.fillRect(x+w*.21,y+h*.24,w*.105,h*.092);
    });
    return;
  }
  if(id==='waist_apron_long') {
    cutShape(p,'long cotton apron',[[-.23,-.346],[.245,-.346],[.366,.414],[.214,.455],[-.224,.46],[-.355,.413]],.039,clothP(d.color));
    path(p,'tied apron straps',[[-.239,.028,-.346],[-.396,.028,-.291],[-.398,.028,-.126]],.017,black);
    path(p,'tied apron straps',[[.239,.028,-.346],[.392,.028,-.291],[.395,.028,-.126]],.017,black);
    return;
  }
  const paint=id==='bellyband'?knitP(d.color):clothP(d.color);
  for(const [x,z,y] of [[0,-.082,0],[-.066,.041,.035],[.063,.139,.066]])
    bevel(p,'folded waist textile',[x-.351,y,z-.143,x+.346,y+.038,z+.149],.015,paint);
}
function jewel(p,d) {
  const {id,shape}=d;
  if(shape==='gem') {
    const color={onyx:0x424249,tourmaline:0x3c705f,garnet:0x934d53,peridot:0x95a957,sapphire:0x536ca6,alexandrite:0x698d7c,amethyst:0x8f6a9c,aquamarine:0x79a8ad,blue_topaz:0x6b97b5,ruby:0xae485b}[id];
    const sides={onyx:10,tourmaline:6,garnet:10,peridot:8,sapphire:12,alexandrite:10,amethyst:6,aquamarine:8,blue_topaz:8,ruby:12}[id];
    profile(p,'faceted cut stone',[[0,0],[.125,.018],[.364,.181],[.334,.259],[.257,.354],[0,.354]],speckle(id,color,[shade(color,1.17),shade(color,.74)],.23),{sides,scale:[1,id==='tourmaline'?.56:.82]});
    return;
  }
  if(shape==='crown') {
    const horn=id.includes('horn');
    const points=[[-.363,.039,.262],[-.377,.045,-.022],[-.258,.076,-.271],[0,.126,-.35],[.264,.074,-.273],[.38,.04,-.021],[.364,.038,.258]];
    path(p,'ornamental headband',points,.031,horn?black:silver);
    for(const x of [-.177,0,.178]){
      if(horn&&x===0) continue;
      if(horn) path(p,'red devil horn',[[x,.131,-.315],[x*1.06,.243,-.304],[x*1.2,.357,-.318]],.041,red);
      else blob(p,'set crown gemstone',[.053,.081,.041],[x,.169-(Math.abs(x)*.23),-.337+Math.abs(x)*.23],plasticP(id.includes('ruby')?0xa04658:0x38383f),{},4,8);
    }
    return;
  }
  if(shape==='costume') {
    if(id==='angel_wings') {
      for (const s of [-1,1]) for(let i=0;i<7;i++) {
        const r=.15+i*.038,z=-.29+i*.083;
        cutShape(p,'layered white feathers',[[s*.056,z+.094],[s*.138,z-.063],[s*r,z-.159],[s*(r+.047),z-.078],[s*.223,z+.089]],.021,white,.011+i*.011);
      }
    } else path(p,'curled costume tail',[[-.405,.057,.16],[-.23,.086,-.046],[.031,.073,-.184],[.255,.059,-.154],[.37,.056,-.041],[.368,.049,.101]],.061,id.startsWith('leather')?rubber:knitP(d.color));
    return;
  }
  if(id==='altered_necklace') {
    const heart=[[0,.017],[-.057,-.055],[-.153,-.066],[-.224,-.014],[-.246,.077],[-.184,.195],[0,.371],[.181,.195],[.247,.079],[.22,-.016],[.149,-.065],[.053,-.051]];
    cutShape(p,'heart-shaped silver locket',heart,.063,silver);
    cutShape(p,'black and white miniature setting',heart.map(([x,z])=>[x*.71,(z-.117)*.74+.117]),.012,steelP(0x747777),.062);
    blob(p,'miniature photograph silhouette',[.046,.007,.052],[0,.076,.074],white,{},3,8);
    path(p,'fine silver chain',[[0,.049,.016],[-.235,.033,-.109],[-.231,.027,-.297],[-.116,.023,-.411],[.137,.026,-.427],[.254,.03,-.29],[.224,.038,-.116],[0,.049,.016]],.012,silver);
    return;
  }
  if(id==='priest_collar'||id==='collar_playboy') {
    const bow=id==='collar_playboy';
    cutShape(p,'white detached collar',oval(0,0,.43,.244,14),.056,bow?white:plasticP(0xe7e1d3),0,[oval(0,-.014,.334,.155,14)]);
    if(bow) {
      for(const sign of [-1,1]) cutShape(p,'black bow tie wing',[[0,.205],[sign*.182,.135],[sign*.201,.328],[0,.275]],.029,black,.055);
      bevel(p,'bow tie knot',[-.039,.056,.201,.039,.1,.278],.011,black);
    }
    return;
  }
  if(id==='pearl_collar'||id==='gold_hair_beads') {
    const pearl=id==='pearl_collar';
    for(let j=0;j<(pearl?17:6);j++){
      const a=j*Math.PI*2/(pearl?17:6),x=pearl?.357*Math.cos(a):(j-2.5)*.146,z=pearl?.255*Math.sin(a):j%2*.069;
      blob(p,'strung bead',[.051,.049,.05],[x,.052,z],pearl?plasticP(0xe8d7b5):gold,{},3,9);
    }
    return;
  }
  if(id==='platinum_hairpin') return supplyWear.pin(p,{...d,color:0xb7b8b2});
  if(id.includes('medal')) {
    const first=id.startsWith('gold'),metal=first?gold:silver;
    cyl(p,'award medallion','y',[0,.04,.162],.245,.08,16,metal);
    top(p,'award placement',[-.143,.014,.143,.289],.083,label(first?0x9a8252:0x828d93,first?'1st':'2nd',d.key));
    path(p,'flat award ribbon',[[-.114,.026,.004],[-.187,.03,-.276],[-.029,.033,-.413],[.147,.028,-.338],[.07,.027,-.022]],.045,clothP(first?0x657f8c:0x9b5f64));
    return;
  }
  if(id.includes('cufflinks')){
    supplyWear.accessory(p,{...d,color:0xa8aeb0,shape:'cufflink'});
    for(const x of [-.242,.242]) profile(p,'inset faceted stone',[[.1,.133],[.117,.139],[.092,.179],[0,.179]],plasticP(id.startsWith('ruby')?0xa64c60:0x3b3d44),{at:[x,0],sides:10});
    return;
  }
  supplyWear.accessory(p,{...d,shape:'dental'});
}
function wallet(p,d) {
  if (d.id==='wallet_photo') {
    p.box('photograph card',[-.414,0,-.288,.413,.018,.289],paperP(0xe6ded0));
    top(p,'printed family photograph',[-.362,-.242,.362,.163],.021,(ctx,x,y,w,h)=>{
      ctx.fillStyle='#a7b1a0';ctx.fillRect(x,y,w,h);
      ctx.fillStyle='#6e826b';ctx.fillRect(x,y+h*.51,w,h*.49);
      for(const [i,xx] of [.3,.49,.67].entries()){
        const yy=.37+(i===1?.07:0);
        ctx.fillStyle=['#796c5a','#655d64','#8d725d'][i];ctx.fillRect(x+w*(xx-.057),y+h*(yy+.13),w*.114,h*.36);
        ctx.fillStyle='#c3aa83';ctx.fillRect(x+w*(xx-.039),y+h*yy,w*.078,h*.136);
      }
    });
    return;
  }
  const color=d.id==='wallet_duct_tape'?0x818885:d.color;
  supplyWear.accessory(p,{...d,color,shape:'wallet'});
  if(d.id==='wallet_duct_tape') for (const x of [-.258,-.121,.015,.151,.267])
    path(p,'overlapping tape seam',[[x,.065,-.215],[x+.023,.07,.005],[x-.014,.065,.207]],.006,steelP(0x8e9290));
  if(d.id==='wallet_travel') path(p,'neck strap',[[-.327,.059,-.215],[-.413,.037,-.336],[-.213,.031,-.474],[.23,.034,-.473],[.401,.04,-.338],[.32,.058,-.214]],.015,black);
}

export const marketWear={armor,carry,cloth,coat,dress,face,foot,handwear,head,jewel,pants,suit,wallet};
