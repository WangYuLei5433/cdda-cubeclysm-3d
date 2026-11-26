import { blob, knitP, loop, speckle, woodP } from './item-kit.js';
import { GLASS, V, bevel, clothP, cyl, fill, flat, front, label, path, plasticP, poly, ring, rubber, shade, steelP, top, tube } from './common-loot-kit.js';
import { cutShape, oval, profile } from './item-workshop-kit.js';
import { workshopWear } from './item-workshop-wear.js';

const cream=clothP(0xe1d7bc);
const silver=steelP(0xaab0ad);
const gold=steelP(0xb69b5c);
const brown=clothP(0x80604e);
const dark=clothP(0x4c4544);
const trim=clothP(0x413e3f);

function uniform(p,d) {
  const {id,shape}=d;
  const wet=id.startsWith('wetsuit');
  const lab=/xedra|hazmat|cleansuit/.test(id);
  const wader=id==='fishing_waders';
  const linen=id==='mummy_jumpsuit';
  const short=shape==='short';
  const color=id==='wetsuit_spring_sleeveless'?0x427188:wet?0x424851:id==='technician_coveralls_h'?0x8c7651
    :id==='xedra_enviro_suit'?0x986e50:id==='hazmat_suit'?0xc8b060:id==='jumpsuit'?0xc48450:linen?0xb7ab94:d.color;
  const paint=wet||lab||wader?plasticP(color):clothP(color);
  const h=lab?.049:id==='technician_coveralls_h'?.061:.034;
  const bib=wader?-.29:-.42;
  const torso=[[-.148,bib],[-.085,bib-.035],[-.036,bib+.028],[.036,bib+.028],[.085,bib-.035],[.148,bib],[.114,-.22],[.16,-.098],[-.16,-.098],[-.114,-.22]];
  const sealed=shape==='sealed';
  cutShape(p,'suit torso',torso,h,paint);
  const end=short?.104:.454;
  for(const s of [-1,1]) {
    const leg=[[.013,-.121],[.158,-.131],[.132,end],[.059,end]];
    cutShape(p,'integral trouser leg',leg.map(([x,z])=>[s*x,z]),h*.88,paint);
    if(!short&&!wader) {
      const sleeve=id==='jumpsuit'?[[.13,-.410],[.209,-.429],[.284,-.321],[.212,-.265],[.131,-.311]]
        :[[.129,-.41],[.205,-.436],[.322,-.144],[.254,-.107],[.132,-.312]];
      cutShape(p,'sleeve',sleeve.map(([x,z])=>[s*x,z]),h*.91,paint);
      if(id!=='jumpsuit') {
        const x=s*.269;
        top(p,'cuff seam',[x-.026,-.142,x+.032,-.129],h*.92,trim);
      }
    }
    if(wader) {
      path(p,'suspender',[[s*.095,.019,-.211],[s*.112,.021,-.373],[s*.137,.02,-.504],[s*.189,.019,-.366]],.021,brown);
      bevel(p,'rubber wader boot',[s*.098-.059,0,.373,s*.098+.059,.079,.491],.028,rubber);
    }
    if(id==='bodysuit_lycra'||id==='zentai'){
      const x=s*.097;
      bevel(p,'integral fabric foot',[x-.039,.005,.401,x+.039,.059,.496],.02,paint);
    }
    if(sealed && lab) bevel(p,'sealed cuff or boot',[s*.097-.047,.005,.366,s*.097+.047,.066,.474],.022,trim);
    if(/coveralls|xedra/.test(id)) {
      const x=s*.074;
      bevel(p,'utility pocket',[x-.036,h-.005,-.251,x+.036,h+.014,-.174],.008,clothP(shade(color,.79)));
    }
  }
  path(p,'sealed front zipper',[[0,h,-.363],[.009,h+.003,-.232],[.005,h,-.116]],.008,trim);
  if(id==='technician_coveralls_h') for(const x of [-.104,.104])
    bevel(p,'padded canvas knee',[x-.041,h*.79,.17,x+.039,h+.009,.273],.009,clothP(shade(color,.79)));
  if(wader) bevel(p,'large chest pocket',[-.117,h-.007,-.26,.119,h+.027,-.149],.017,plasticP(shade(color,.77)));
  if(/hazmat|cleansuit|zentai/.test(id)) {
    if(id==='zentai') blob(p,'closed stretch fabric head covering',[.087,.048,.102],[0,.054,-.466],paint,{},4,11);
    else cutShape(p,'attached hood',oval(0,-.45,.095,.091),.056,paint,.012,[oval(0,-.461,.066,.052)]);
    if(id==='hazmat_suit') top(p,'sealed hood window',[-.058,-.505,.058,-.425],.072,flat(0x718c87),GLASS);
  }
  if(wet) for(const s of [-1,1]) path(p,'neoprene side panel',[[s*.102,h,-.366],[s*.083,h,-.24],[s*.128,h*.89,-.144],[s*.101,h*.89,end-.035]],.011,plasticP(0x5f8996));
  if(linen) for(const z of [-.334,-.285,-.192,-.082,.037,.15,.264,.345]) {
    const width=z<-.1?.116:.14;
    for(const sign of [-1,1]) path(p,'wrapped linen strip',[[sign*.029,h,z],[sign*width,h-.001,z+.025]],.009,cream);
  }
  if(id==='xedra_enviro_suit') {
    const orange=plasticP(0xc48656);
    for(const x of [-.111,.111]) path(p,'orange flight suit panel',[[x,.05,-.393],[x*.85,.051,-.25],[x*1.18,.047,-.09]],.015,orange);
    poly(p,'back unit lettering',[V(-.12,-.002,-.344),V(.12,-.002,-.344),V(.12,-.002,-.21),V(-.12,-.002,-.21)],V(0,-1,0),label(0x875846,'X.E.D.R.A',d.key));
    top(p,'white shoulder patch',[.124,-.393,.204,-.329],h+.002,cream);
  }
}

function coat(p,d) {
  const {id,shape}=d;
  if(id==='mummy_dress') {
    const cloth=clothP(0xc6b79c);
    cutShape(p,'short dress',[[ -.17,-.331],[-.075,-.366],[0,-.286],[.075,-.366],[.17,-.331],[.106,-.101],[.178,.288],[-.179,.288],[-.106,-.101]],.038,cloth);
    for(let n=0;n<8;n++) {
      const z=-.277+n*.076;
      path(p,'printed wrap fold',[[-.103,.039,z],[.014,.044,z+.028],[.121,.039,z+.055]],.009,cream);
    }
    return;
  }
  if(id==='nun_habit') {
    cutShape(p,'full-length habit',[[ -.198,-.39],[-.093,-.429],[.093,-.429],[.198,-.39],[.16,-.059],[.32,.441],[-.32,.441],[-.16,-.059]],.05,clothP(0x403b43));
    cutShape(p,'white wimple',[[ -.125,-.38],[-.096,-.48],[.104,-.48],[.141,-.38],[.094,-.284],[-.091,-.284]],.061,cream,.035,[oval(0,-.385,.075,.046)]);
    path(p,'waist cord',[[-.18,.051,-.087],[.18,.051,-.087],[.152,.04,.102]],.01,cream);
    return;
  }
  const color={haori:0x3c3542,jacket_evac:0xc2854d,apron_cotton:0xc4b69f,waist_apron_short:0x52656a,military_poncho:0x646e51,military_poncho_liner:0x7b7758,cloak_leather:0x6d4b3c,cloak_fur:0x96775e,house_coat:0xa68483}[id]??d.color;
  if(id==='waist_apron_short') {
    cutShape(p,'waist apron',[[ -.279,-.278],[.279,-.278],[.33,.244],[-.33,.244]],.034,clothP(color));
    bevel(p,'front pocket',[-.122,.033,-.058,.117,.055,.119],.009,clothP(shade(color,.76)));
    path(p,'waist ties',[[ -.28,.026,-.252],[-.422,.026,-.293],[-.435,.024,-.167]],.019,trim);
    path(p,'waist ties',[[.28,.026,-.252],[.414,.026,-.294],[.444,.024,-.183]],.019,trim);
    return;
  }
  if(id==='haori') {
    const textile=clothP(color);
    for(const s of [-1,1]) {
      const panel=[[.05,-.408],[.205,-.413],[.295,-.305],[.437,-.04],[.325,.111],[.238,.045],[.244,.429],[.108,.429],[.066,-.139]]
        .map(([x,z])=>[x*s,z]);
      cutShape(p,'unfastened haori panel',panel,.049,textile);
      path(p,'embroidery edging',[[s*.094,.054,-.36],[s*.065,.054,-.143],[s*.106,.052,.345]],.008,gold);
      for(const z of [.135,.20,.265]) top(p,'sparse embroidered leaf',[s*.179-.017,z,s*.179+.017,z+.023],.051,gold);
    }
    return;
  }
  if(id==='military_poncho_liner'){
    const quilt=clothP(0x747558);
    bevel(p,'folded quilted liner',[-.427,0,-.311,.427,.081,.311],.045,quilt);
    for(const x of [-.288,-.144,0,.144,.288]) path(p,'quilt stitch',[[x-.038,.081,-.277],[x+.019,.082,-.14],[x-.028,.084,-.002],[x+.039,.082,.138],[x-.037,.08,.275]],.007,clothP(0x535747));
    for(const x of [-.391,.39]) for(const z of [-.257,.246])
      path(p,'liner attachment tie',[[x,.034,z],[x*1.19,.028,z+.025],[x*1.18,.02,z+.081]],.011,quilt);
    return;
  }
  const mapped=id==='house_coat'?'robe':id==='jacket_evac'?'jacket_windbreaker':id==='coat_light_winter'?'jacket_windbreaker':id==='jacket_army_modern'?'jacket_army':id==='keikogi'?'judo_gi':id;
  workshopWear.coat(p,{...d,id:mapped,color,shape:id==='house_coat'?'long':shape});
  if(id==='military_poncho'){
    for(const x of [-.351,.351]) for(const z of [.177,.289]) ring(p,'liner grommet',.012,.024,.051,silver,[x,z],9);
    path(p,'hood cinch cord',[[ -.112,.052,-.332],[-.119,.056,-.189],[-.054,.04,-.126]],.009,trim);
  }
  if(id==='jacket_army_modern') for(const x of [-.137,.137]){
    const camo=speckle(id,0x687157,[0x494d42,0x95906c,0x7c7958],.44);
    cutShape(p,'angled breast pocket',[[x-.061,-.112],[x+.042,-.158],[x+.065,-.067],[x-.048,-.026]],.016,camo,.043);
    bevel(p,'loop field',[x-.046,.04,-.216,x+.053,.056,-.172],.005,trim);
  }
  if(id==='jacket_evac') for(const x of [-.125,.126]) top(p,'high-visibility shoulder marking',[x-.047,-.17,x+.047,-.142],.061,cream);
  if(/trenchcoat.*fur|duster.*fur|cloak_fur|^coat_fur/.test(id)) {
    const fur=knitP(shade(color,1.28));
    path(p,'thick fur collar',[[-.152,.064,-.258],[-.061,.082,-.209],[.069,.083,-.209],[.148,.064,-.263]],.031,fur);
  }
}

function hats(p,d) {
  const {id,shape,color}=d;
  if(id==='cowboy_hat') {
    const hide=clothP(0x866345);
    profile(p,'wide western brim',[[.195,.113],[.44,.075],[.467,.09],[.462,.116],[.396,.141],[.228,.143]],hide,{sides:16,scale:[1,1.15]});
    for(const x of [-.39,.39]) path(p,'rolled side brim',[[x,.109,-.288],[x*1.12,.137,-.097],[x*1.12,.146,.132],[x,.112,.291]],.022,hide);
    profile(p,'pinched crown',[[.274,.113],[.294,.171],[.258,.381],[.214,.421],[.101,.395],[0,.391]],hide,{scale:[.88,1.13]});
    cyl(p,'leather hatband','y',[0,.186,0],.258,.056,14,brown,{open:true});
    return;
  }
  if(id==='hat_hunting'||id==='hat_fur') {
    const plaid=(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0x99514b);
      for(let i=1;i<w;i+=6) fill(ctx,x+i,y,2,h,0x6a4142);
      for(let j=1;j<h;j+=7) fill(ctx,x,y+j,w,2,0xca7c68);
    };
    const fur=knitP(0x9b806a), paint=id==='hat_fur'?fur:plaid;
    profile(p,'rounded crown',[[.304,.095],[.338,.173],[.314,.282],[.235,.369],[0,.396]],paint,{scale:[.94,1.03]});
    for(const x of [-.30,.30]) bevel(p,'ear flap',[x-.060,0,-.121,x+.060,.209,.194],.042,fur);
    if(id==='hat_hunting') cutShape(p,'peak',[[-.259,-.113],[-.211,-.385],[.206,-.385],[.262,-.113]],.04,plaid,.087);
    else bevel(p,'fur forehead trim',[-.219,.112,-.347,.219,.202,-.236],.047,fur);
    return;
  }
  if(/^(beret|kufi|kippah|porkpie|turban|hat_sombrero|bowhat)/.test(id)) {
    const cloth=knitP(color);
    const profiles={
      beret:[[.26,.018],[.302,.04],[.389,.106],[.397,.175],[.29,.248],[.13,.271],[0,.275]],
      kufi:[[.28,0],[.315,.017],[.317,.227],[.263,.252],[0,.254]],
      kippah:[[.339,0],[.348,.021],[.301,.12],[.185,.188],[0,.207]],
      porkpie:[[.265,.049],[.421,.026],[.421,.062],[.363,.096],[.283,.086],[.274,.285],[.239,.298],[.198,.265],[0,.267]],
      turban:[[.29,.018],[.352,.101],[.345,.242],[.27,.317],[.118,.369],[0,.37]],
      hat_sombrero:[[.31,.091],[.49,.05],[.55,.083],[.52,.129],[.413,.147],[.282,.128],[.201,.425],[.118,.47],[0,.47]],
      bowhat:[[.278,.066],[.425,.037],[.456,.052],[.424,.09],[.293,.085],[.28,.252],[.219,.356],[.123,.392],[0,.394]],
    };
    profile(p,'shaped hat crown and brim',profiles[id]??profiles.beret,cloth,{sides:16});
    if(id.startsWith('beret')) cyl(p,'center tab','y',[.049,.283,-.015],.025,.026,8,cloth);
    if(id==='turban') for(const r of [.22,.27,.31]) loop(p,'wrapped cloth layer',[0,.304-(r-.22)*2.2,0],r,.026,cloth,{},14);
    if(id==='hat_sombrero') {
      ring(p,'brim embroidery',.403,.465,.135,gold,[0,0],16);
      for(let n=0;n<18;n++){
        const a=n*Math.PI/9;
        tube(p,'white embroidery stitch',V(.415*Math.cos(a),.137,.415*Math.sin(a)),V(.455*Math.cos(a+.07),.137,.455*Math.sin(a+.07)),.005,.005,6,cream);
      }
      path(p,'thin chin cord',[[ -.307,.09,.202],[-.32,.031,.37],[0,.025,.525],[.319,.032,.368],[.307,.089,.2]],.012,cream);
    }
    return;
  }
  if(id==='cowl_wool') {
    const wool=knitP(color);
    const hood=[[-.196,-.365],[.188,-.365],[.316,-.198],[.331,.213],[.168,.378],[-.193,.378],[-.34,.229],[-.324,-.199]];
    cutShape(p,'bulky knit neck loop',hood,.068,wool,0,[oval(0,-.058,.225,.221,12)]);
    path(p,'folded knit edge',[[-.292,.057,.134],[-.204,.086,.298],[0,.088,.332],[.221,.083,.293],[.292,.057,.131]],.032,wool);
    return;
  }
  if(id==='swim_cap') {
    profile(p,'rubber swim cap',[[.304,0],[.33,.038],[.311,.216],[.233,.304],[.15,.337],[0,.347]],plasticP(0x547c8e),{scale:[1,1.17]});
    path(p,'cap seam',[[0,.071,-.36],[0,.282,-.24],[0,.347,-.039],[0,.302,.239],[0,.115,.369]],.008,plasticP(0x84a4a6));
    return;
  }
  if(shape==='helmet') {
    const football=id==='helmet_football', ball=id==='helmet_ball', fire=id==='firehelmet';
    const tac=id==='tac_helmet', steelHelm=id==='helmet_army_outdated';
    const paint=steelHelm?steelP(0x6b7065):plasticP(tac?0x40454a:fire?0xb45346:football?0x58728e:ball?0x415a76:color);
    profile(p,'helmet shell',[[.309,.082],[.346,.135],[.346,.269],[.291,.388],[.197,.453],[0,.47]],paint,{scale:[.96,steelHelm?1.13:1.03]});
    if(tac) {
      for(const x of [-.324,.324]){
        bevel(p,'side accessory rail',[x-.031,.127,-.178,x+.031,.216,.179],.013,trim);
        for(const z of [-.119,-.043,.033,.108]) p.box('rail grooves',[x-.034,.16,z-.009,x+.034,.196,z+.008],silver);
      }
      bevel(p,'front mount cap',[-.074,.218,-.379,.074,.324,-.317],.018,trim);
    }
    if(football) {
      path(p,'face guard',[[-.27,.167,-.128],[-.219,.076,-.321],[-.119,.04,-.441],[.119,.04,-.441],[.219,.076,-.321],[.27,.167,-.128]],.025,silver);
      path(p,'upper cage bar',[[-.239,.144,-.284],[-.158,.13,-.408],[.154,.13,-.408],[.236,.144,-.281]],.02,silver);
      bevel(p,'football visor',[-.184,.177,-.366,.185,.265,-.32],.018,flat(0x84a5ae),GLASS);
    } else {
      const depth=fire?.41:ball?.462:.35;
      cutShape(p,'helmet rim',[[-.294,.252],[-.341,-.179],[-.155,-depth],[.154,-depth],[.341,-.179],[.294,.252]],.048,paint,.069);
      if(ball) for(const x of [-.30,.30]) bevel(p,'ear flap',[x-.044,0,-.082,x+.044,.147,.137],.028,paint);
      if(fire) {
        bevel(p,'front shield',[-.123,.205,-.387,.123,.357,-.325],.026,gold);
        front(p,'shield insignia',[-.085,.233,.085,.328],-.389,label(0xa15a47,'FIRE',d.key));
      }
    }
    return;
  }
  const idMap={cowl_wool:'balclava',wetsuit_hood:'hood_rain',thermal_mask:'mask_ski',nomex_hood:'balclava',helmet_liner:'hat_knit'};
  workshopWear.headwear(p,{...d,id:idMap[id]??id,color:id==='wetsuit_hood'?0x454852:color});
  if(id==='thermal_mask'){
    bevel(p,'battery pouch',[.123,.046,.222,.227,.103,.331],.016,trim);
    path(p,'covered lead',[[.162,.067,.239],[.2,.071,.166],[.243,.069,.059]],.009,trim);
  }
}

function boots(p,d) {
  const {id,color}=d;
  for(const x of [-.235,.235]) {
    if(id==='swim_fins') {
      cutShape(p,'flexible fin',[[x-.14,.127],[x-.158,-.05],[x-.194,-.451],[x-.119,-.476],[x+.159,-.463],[x+.185,-.159],[x+.117,.167]],.031,plasticP(color));
      bevel(p,'rubber foot pocket',[x-.106,0,-.172,x+.105,.132,.341],.045,rubber);
      path(p,'rubber heel strap',[[x-.098,.083,.247],[x-.08,.111,.411],[x+.083,.111,.411],[x+.1,.081,.247]],.019,rubber);
    } else if(id==='geta') {
      bevel(p,'wood sandal sole',[x-.124,.087,-.423,x+.124,.128,.384],.013,woodP(0xa68159));
      for(const z of [-.171,.198]) p.box('raised wooden tooth',[x-.104,0,z-.057,x+.102,.087,z+.057],woodP(0x927251));
      path(p,'thong strap',[[x-.114,.127,.082],[x-.061,.202,-.071],[x,.154,-.25],[x+.061,.202,-.071],[x+.114,.127,.082]],.021,cream);
    } else {
      const boot=id==='wetsuit_booties';
      const paint=boot?rubber:clothP(id==='tabi_gi'?0xc8bdaa:color);
      bevel(p,'low shaped sole',[x-.123,0,-.395,x+.123,.043,.326],.023,rubber);
      const split=boot||id==='tabi_gi';
      if(split) {
        bevel(p,'split toe',[x-.117,.028,-.391,x+.017,.104,-.138],.027,paint);
        bevel(p,'big toe pocket',[x+.034,.027,-.378,x+.105,.103,-.138],.022,paint);
      }
      bevel(p,'shoe or boot upper',[x-.113,.028,split?-.161:-.384,x+.112,boot?.171:.128,.31],.044,paint);
      if(id==='cleats') for(const z of [-.30,-.15,.16,.27]) for(const dx of [-.064,.064])
        cyl(p,'molded cleat','y',[x+dx,-.021,z],.024,.054,8,rubber,{},.016);
    }
  }
}

function carry(p,d) {
  const {id,color}=d;
  if(id==='case_violin'||id==='laptop_hard_case'||id==='golf_bag'||id==='bootsheath') {
    const violin=id==='case_violin', laptop=id==='laptop_hard_case', golf=id==='golf_bag';
    const paint=plasticP(color), edge=plasticP(shade(color,.65));
    const shape=violin?[[-.09,-.46],[.076,-.46],[.145,-.134],[.244,.093],[.254,.321],[.168,.449],[-.167,.449],[-.242,.317],[-.22,.101],[-.136,-.136]]
      :laptop?[[-.431,-.303],[.431,-.303],[.431,.303],[-.431,.303]]
      :[[-.118,-.435],[.13,-.435],[.194,.301],[.113,.434],[-.138,.431],[-.195,.311]];
    cutShape(p,'fitted carrying shell',shape,golf?.281:.149,golf?clothP(color):paint);
    const z=violin?.11:.12, x=violin?.229:.17;
    path(p,'carry handle',[[x,.092,z-.106],[x+.074,.098,z-.067],[x+.074,.098,z+.067],[x,.092,z+.106]],.024,edge);
    if(golf) {
      ring(p,'divider collar',.093,.139,.283,edge,[0,-.287],12);
      bevel(p,'long accessory pocket',[-.122,.269,-.092,.121,.329,.355],.029,clothP(shade(color,.77)));
      for(const x of [-.132,.135]) path(p,'fold-away support leg',[[x,.139,-.239],[x*1.29,.108,.02],[x*1.4,.072,.28]],.02,silver);
      path(p,'shoulder sling',[[ -.187,.046,-.224],[-.286,.033,-.097],[-.274,.04,.224],[-.152,.072,.348]],.025,trim);
    } else for(const z of [-.125,.205]) bevel(p,'case latch',[x-.006,.052,z,x+.035,.116,z+.055],.008,silver);
    return;
  }
  const map={bigback:'backpack_hiking',molle_pack:'backpack_hiking',backpack_hunting:'backpack_hiking',gas_mask_pouch:'ammo_pouch',legpouch_large:'leg_bag',ankle_wallet_pouch:'leg_bag'};
  workshopWear.carry(p,{...d,id:map[id]??id});
  if(id==='molle_pack') for(const z of [-.123,-.041,.041,.121])
    path(p,'load-bearing webbing',[[-.194,.326,z],[.197,.326,z]],.013,trim);
}

function cloth(p,d) {
  const {id,color}=d;
  if(id==='hammock_net') {
    const rope=clothP(0xa29c75);
    for(let n=-7;n<=7;n++){
      const x=n*.036;
      path(p,'lengthwise net cord',[[0,.032,-.471],[x*.71,.05,-.307],[x,.026,0],[x*.71,.05,.306],[0,.032,.468]],.006,rope);
    }
    for(let n=-6;n<=6;n++){
      const z=n*.044,w=.253-Math.abs(z)*.29;
      path(p,'crosswise net cord',[[ -w,.037,z],[0,.026,z],[w,.037,z]],.007,rope);
    }
    return;
  }
  if(id==='veil_wedding') {
    const edge=[[-.325,-.208],[-.22,-.318],[.083,-.353],[.328,-.229],[.384,.243],[.23,.319],[-.267,.333],[-.392,.259]];
    for(let k=0;k<=10;k++) {
      const z=-.24+k*.049;
      path(p,'lace line',[[ -.285,.025,z],[-.129,.031,z+.038],[.079,.03,z-.021],[.31,.023,z+.032]],.006,cream);
    }
    for(const x of [-.245,-.147,-.049,.049,.147,.245]) path(p,'fine drop weave',[[x,.023,-.273],[x*.85,.032,-.017],[x*1.13,.025,.286]],.005,cream);
    path(p,'scalloped veil edge',[...edge,edge[0]].map(([x,z])=>[x,.025,z]),.014,cream);
    return;
  }
  if(id==='tallit_katan') {
    const panel=[[-.228,-.31],[-.093,-.336],[0,-.251],[.093,-.336],[.223,-.31],[.251,.353],[-.249,.353]];
    cutShape(p,'woven four-cornered shirt',panel,.039,cream);
    for(const z of [-.251,.252]) top(p,'woven dark stripe',[-.218,z,.215,z+.033],.041,trim);
    for(const x of [-.226,.226]) for(const z of [-.297,.331])
      path(p,'corner fringe',[[x,.031,z],[x*1.26,.021,z*1.11],[x*1.57,.016,z*1.13]],.01,cream);
    return;
  }
  const flag=id.includes('flag');
  const textile=clothP(flag?0xb66361:color);
  bevel(p,'folded textile',[-.403,0,-.335,.403,id==='veil_wedding'?.037:.07,.335],.021,textile);
  const y=id==='veil_wedding'?.038:.071;
  if(id==='pride_flag') {
    for(const [i,c] of [0xaa5756,0xc18b53,0xd7b761,0x6f926b,0x587e9b,0x8e6d94].entries())
      top(p,'rainbow stripe',[-.384,-.309+i*.102,.384,-.207+i*.102],y,clothP(c));
  } else if(flag) {
    top(p,'national flag field',[-.386,-.31,.386,.31],y,clothP(0xcac3a9));
    top(p,'center mark',[-.12,-.089,.122,.12],y+.001,clothP(0xad565e));
  } else {
    for(const z of [-.209,-.176,.176,.209]) top(p,'woven edge stripe',[-.385,z,.385,z+.018],y,clothP(id==='veil_wedding'?0xe9e2d0:0x596979));
    for(const x of [-.32,-.17,.12,.3]) path(p,'knotted fringe',[[x,.029,.325],[x+.027,.016,.39]],.007,cream);
  }
}

function armor(p,d) {
  const {id,shape,color}=d;
  if(shape==='pair') {
    if(id==='armguard_cut_resistant'){
      const cover=knitP(0xbda97a);
      for(const x of [-.236,.236]){
        cutShape(p,'long protective sleeve',[[x-.118,-.369],[x+.12,-.369],[x+.154,.364],[x-.15,.364]],.055,cover,0,[oval(x+.051,-.261,.033,.07,8)]);
        p.box('wrist binding',[x-.114,.034,-.386,x+.122,.059,-.35],trim);
      }
    } else if(/splint/.test(id)) {
      const w=id==='leg_splint'?.313:.179;
      bevel(p,'contoured wrap',[-w,0,-.405,w,.122,.407],.057,clothP(0x84766c));
      for(const x of [-w*.73,w*.73]) bevel(p,'rigid splint stay',[x-.037,.094,-.389,x+.037,.156,.39],.022,silver);
      for(const z of [-.292,-.049,.223]) path(p,'securing strap',[[-w,.059,z],[-w*.69,.164,z],[w*.69,.163,z],[w,.059,z]],.028,trim);
    } else workshopWear.armor(p,d);
    return;
  }
  const football=id==='football_armor', web=id.includes('load_bearing'), heavy=/heavy|level_3|riot/.test(id);
  if(id==='armor_riot'){
    const body=plasticP(0x46474c);
    cutShape(p,'riot torso plate',[[ -.211,-.348],[.21,-.348],[.236,-.19],[.177,.129],[-.172,.128],[-.231,-.191]],.104,body);
    for(const x of [-.144,.144]) {
      bevel(p,'segmented shin armor',[x-.065,.022,.158,x+.065,.112,.429],.029,body);
      bevel(p,'upper arm shell',[x*2.09-.062,.023,-.322,x*2.09+.069,.118,-.098],.029,body);
      bevel(p,'standalone knee pad',[x-.057,.015,.131,x+.057,.108,.238],.035,trim);
    }
    return;
  }
  const paint=plasticP(football?0x777f91:color);
  cutShape(p,'vest body',[[ -.24,-.372],[-.125,-.386],[-.07,-.214],[.07,-.214],[.125,-.386],[.239,-.372],[.351,-.169],[.285,.433],[-.285,.433],[-.351,-.169]],heavy?.137:.079,clothP(color));
  if(football||heavy) for(const x of [-.278,.278])
    bevel(p,'shoulder pad',[x-.087,.037,-.30,x+.087,.167,-.097],.049,paint);
  if(web) for(const z of [-.047,.028,.103,.174]) path(p,'webbing row',[[-.245,.087,z],[.245,.087,z]],.012,trim);
  else bevel(p,'front protection panel',[-.224,.084,-.131,.225,heavy?.196:.122,.255],.043,paint);
  for(const x of [-.271,.271]) path(p,'adjustment strap',[[x,.055,-.073],[x*1.15,.068,.019],[x*.93,.065,.199]],.027,trim);
  if(web||heavy) for(const x of [-.16,0,.16])
    bevel(p,'front utility compartment',[x-.069,.073,.193,x+.069,heavy?.191:.136,.35],.019,paint);
}

function facewear(p,d) {
  const {id}=d;
  if(id==='glasses_monocle') {
    cyl(p,'monocle rim','y',[0,.061,0],.265,.089,14,silver,{open:true});
    cyl(p,'round monocle lens','y',[0,.059,0],.248,.031,14,flat(0xadc3c5),GLASS);
    path(p,'monocle cord',[[.243,.065,0],[.371,.025,.089],[.40,.023,.269],[.229,.024,.389],[.074,.025,.317]],.017,trim);
  } else if(id==='eclipse_glasses') {
    cutShape(p,'folded paper frame',[[-.428,-.161],[.428,-.161],[.428,.112],[-.428,.112]],.034,cream);
    for(const x of [-.204,.204]) top(p,'solar filter',[x-.142,-.119,x+.142,.079],.037,rubber);
    for(const x of [-.417,.417]) path(p,'folding paper arm',[[x,.04,.077],[x*.91,.025,.218],[x*.55,.022,.309]],.022,cream);
  } else if(id==='mask_skull'||id==='foodperson_mask') {
    const skull=id==='mask_skull';
    const face=[[-.272,-.399],[.267,-.399],[.353,-.274],[.321,.187],[.196,.386],[-.184,.386],[-.317,.187],[-.353,-.261]];
    cutShape(p,'molded character mask',face,.083,plasticP(skull?0xe1d9c7:0xd4a765),0,[-.141,.141].map(x=>oval(x,-.146,.084,.062)));
    if(skull) {
      cutShape(p,'skull nose opening shadow',[[-.056,.018],[.057,.018],[0,.13]],.009,rubber,.084);
      for(let i=0;i<7;i++) p.box('sculpted tooth divider',[-.138+i*.044,.083,.195,-.121+i*.044,.096,.31],rubber);
    } else {
      path(p,'smiling mascot mouth',[[-.16,.09,.103],[0,.093,.181],[.161,.09,.103]],.023,rubber);
      for(const x of [-.187,.187]) top(p,'mascot cheek',[x-.049,.056,x+.049,.12],.085,plasticP(0xc07953));
    }
    path(p,'mask tie',[[-.29,.05,.011],[-.42,.024,.17],[-.30,.019,.293],[.29,.019,.293],[.42,.025,.172],[.29,.05,.014]],.019,trim);
  } else if(id==='rebreather') {
    const face=[[ -.201,-.19],[-.118,-.334],[.118,-.334],[.201,-.188],[.261,.094],[.192,.254],[-.192,.254],[-.261,.094]];
    cutShape(p,'low-profile mouth and nose mask',face,.112,rubber);
    cyl(p,'front valve cover','y',[0,.13,.015],.11,.073,13,plasticP(0x657477));
    for(const x of [-.195,.195]) {
      cyl(p,'side coupling','x',[x,.081,.061],.071,.128,11,silver);
      path(p,'breathing loop',[[x,.084,.06],[x*1.72,.076,.092],[x*1.91,.049,.266],[x*1.43,.04,.399],[x*.69,.062,.412]],.038,trim);
    }
    path(p,'adjustable head strap',[[ -.205,.055,-.06],[-.348,.033,-.087],[-.374,.03,.14],[-.253,.024,.324],[.248,.024,.324],[.371,.03,.14],[.349,.033,-.087],[.205,.056,-.06]],.016,trim);
  } else if(d.family==='mask') {
    cutShape(p,'full-face gasket',[[ -.28,-.303],[-.15,-.403],[.153,-.403],[.29,-.285],[.33,.095],[.203,.318],[-.207,.318],[-.337,.091]],.095,rubber);
    bevel(p,'single wide face visor',[-.234,.076,-.361,.236,.175,-.038],.044,flat(0x69888b),GLASS);
    cyl(p,'front filter housing','y',[0,.143,.164],.124,.135,13,rubber);
    ring(p,'ribbed filter rim',.083,.12,.214,silver,[0,.164],13);
    for(const x of [-.255,.255]) for(const z of [-.237,-.005,.181])
      path(p,'strap anchor',[[x,.045,z],[x*1.38,.035,z+.071],[x*1.53,.027,z+.114]],.017,trim);
  } else workshopWear.glasses(p,{...d,id:id==='ar_glasses_basic'?'ar_glasses_advanced':'glasses_safety'});
}

function accessory(p,d) {
  const {id,shape,color,key,name}=d;
  const metal=/gold|bronze/.test(id)?gold:silver;
  const paint=clothP(color);
  if(id==='rubber_harness_dog'){
    cutShape(p,'dog rain cover',[[ -.175,-.314],[-.084,-.339],[.082,-.336],[.171,-.309],[.291,.058],[.269,.396],[-.269,.396],[-.289,.056]],.046,plasticP(0xbca356));
    path(p,'welded spine seam',[[0,.045,-.312],[0,.048,.006],[0,.048,.385]],.009,plasticP(0x8c7c4a));
    for(const x of [-.242,.242]) path(p,'belly fastening strap',[[x,.028,.076],[x*1.41,.019,.144],[x*1.39,.023,.224]],.018,trim);
    return;
  }
  if(id==='lanyard'){
    const plastic=flat(0xa7c4c4);
    bevel(p,'clear ID sleeve',[-.206,0,-.151,.205,.034,.335],.011,plastic,GLASS);
    p.box('sleeve opening lip',[-.192,.022,-.151,.194,.042,-.126],silver);
    path(p,'neck strap',[[0,.044,-.14],[-.225,.026,-.229],[-.207,.025,-.4],[0,.026,-.448],[.209,.025,-.403],[.223,.025,-.228],[0,.044,-.14]],.018,paint);
    return;
  }
  if(shape==='medallion') {
    const cross=id.startsWith('holy_symbol');
    const medallionMetal=id==='holy_symbol'?gold:metal;
    const wooden=id.endsWith('_wood');
    if(cross) {
      const body=wooden?woodP(0xa98760):medallionMetal;
      p.box('pendant arm',[-.218,0,-.11,.218,.061,.011],body);
      p.box('pendant stem',[-.061,0,-.233,.061,.061,.344],body);
    } else {
      const tag=id==='dog_tag_dog';
      if(tag) bevel(p,'stamped tag',[-.169,0,-.239,.166,.076,.29],.060,metal);
      else cyl(p,'medallion','y',[0,.042,.142],.251,.085,16,metal);
      top(p,'engraving',[-.124,-.029,.123,.237],.086,label(shade(color,.77),tag?'TAG':name,key));
    }
    const necklace=[[-.005,.052,-.17],[-.174,.042,-.261],[-.224,.027,-.411],[0,.027,-.477],[.226,.027,-.413],[.172,.04,-.261],[0,.052,-.17]];
    if(id==='bronze_medal') {
      path(p,'folded award ribbon',[[0,.047,-.083],[.155,.043,-.25],[.109,.036,-.409],[-.03,.036,-.464],[-.164,.039,-.297],[0,.047,-.083]],.044,clothP(0x875e5c));
    } else path(p,'pendant loop',necklace,.017,wooden?brown:medallionMetal);
    return;
  }
  if(shape==='card'||shape==='bills'||shape==='wallet') {
    const card=shape==='card', wallet=shape==='wallet', money=shape==='bills';
    const x=card?.423:.397,z=card?.257:wallet?.281:.215,h=card?.027:wallet?.096:.111;
    const moneyColor=0xa3a782;
    const cardTint=id.includes('gold')?0xb49854:id.includes('platinum')?0x9293a2:color;
    const base=card?plasticP(cardTint):wallet?clothP(color):clothP(moneyColor);
    bevel(p,'card or folded wallet',[-x,0,-z,x,h,z],card?.009:.039,base);
    if(wallet) {
      p.box('wallet folded edge',[-x*.91,.042,z-.031,x*.91,.064,z+.003],trim);
      for(const dz of [-.171,-.12]) path(p,'topstitch',[[-.309,h,dz],[.23,h,dz]],.005,silver);
    } else if(money) {
      for(const y of [.032,.066,.094]) p.box('banknote edge',[-x,y,-z-.004,x,y+.007,z+.004],cream);
      const band={money_strap_one:0x648b9e,money_strap_five:0xab5c55,money_strap_twenty:0x8e7297}[id];
      p.box('colored currency strap',[-.089,0,-z-.011,.094,h+.008,z+.012],clothP(band));
      top(p,'denomination band',[-.088,-.142,.092,.15],h+.009,label(band,id.endsWith('five')?'5':id.endsWith('one')?'1':'20',key));
    } else {
      top(p,'card printing',[-.341,-.192,.343,.201],h+.002,label(shade(cardTint,.78),name,key));
      if(id.startsWith('id_')) p.box('lanyard slot',[-.051,.021,-.244,.051,.036,-.211],trim);
    }
    return;
  }
  if(shape==='coin'||shape==='cufflink') {
    const coin=shape==='coin';
    for(const x of coin?[0]:[-.242,.242]) {
      const r=coin?.413:.167;
      cyl(p,'metal disc','y',[x,.065,0],r,.127,16,metal);
      ring(p,'raised border',r*.82,r,.133,metal,[x,0],16);
      if(coin) top(p,'coin relief',[x-.26,-.263,x+.26,.257],.129,(ctx,x,y,w,h)=>{
        const goldCoin=id==='coin_gold';
        fill(ctx,x,y,w,h,goldCoin?0xbb9f64:0xa9aaa4);
        const shade=goldCoin?0x957a4c:0x7c8686;
        if(goldCoin){
          fill(ctx,x+w*.21,y+h*.326,w*.56,h*.238,shade);
          fill(ctx,x+w*.63,y+h*.4,w*.195,h*.214,shade);
          fill(ctx,x+w*.28,y+h*.541,w*.075,h*.173,shade);
          fill(ctx,x+w*.591,y+h*.536,w*.079,h*.173,shade);
        } else {
          fill(ctx,x+w*.362,y+h*.25,w*.258,h*.211,shade);
          fill(ctx,x+w*.533,y+h*.34,w*.14,h*.091,shade);
          fill(ctx,x+w*.395,y+h*.44,w*.194,h*.17,shade);
          fill(ctx,x+w*.281,y+h*.59,w*.393,h*.116,shade);
        }
      });
      else bevel(p,'cufflink pin',[x-.050,.023,.113,x+.049,.100,.375],.019,metal);
      if(id.includes('intricate')) for(const z of [-.075,.07]) cyl(p,'engraved decoration','y',[x,.142,z],.042,.019,8,gold);
    }
    return;
  }
  if(shape==='strap'||shape==='collar'||shape==='tie') {
    const tie=shape==='tie', harness=id.includes('harness');
    if(tie&&id!=='obi_gi') {
      cutShape(p,'tapered necktie',[[ -.075,-.398],[.078,-.398],[.026,-.263],[.126,.333],[0,.427],[-.126,.333],[-.026,-.263]],.035,paint);
      bevel(p,'clip-on knot',[-.077,.027,-.419,.077,.084,-.301],.024,clothP(0x59758d));
      for(const z of [-.24,-.124,-.008,.115,.241,.317]) path(p,'silver diagonal stripe',[[ -.028,.037,z],[.028,.037,z+.043]],.007,silver);
      return;
    }
    if(id==='obi_gi') {
      bevel(p,'folded black sash',[-.436,0,-.149,.435,.08,.149],.026,clothP(0x424045));
      bevel(p,'overlapped sash fold',[-.288,.066,-.147,.313,.095,.146],.018,trim);
      path(p,'hem seam',[[-.396,.082,.126],[0,.096,.127],[.405,.082,.129]],.006,clothP(0x676064));
      return;
    }
    if(id==='bootstrap') {
      cutShape(p,'concealment pouch',[[-.25,-.265],[.176,-.279],[.244,-.218],[.092,.259],[-.235,.288]],.141,trim);
      path(p,'ankle fastening strap',[[.119,.059,-.085],[.34,.044,-.118],[.468,.045,.036],[.371,.044,.201],[.106,.057,.189]],.037,brown);
      return;
    }
    const strap=shape==='collar'&&/fur/.test(id)?knitP(color):paint;
    const rim=id==='obi_gi'?.051:.036;
    path(p,'looped strap',[[-.321,.051,-.212],[-.423,.05,-.036],[-.305,.05,.255],[.322,.05,.256],[.42,.05,-.037],[.319,.05,-.21]],rim,strap);
    if(id==='bookstrap') {
      path(p,'carrier handle',[[ -.322,.048,-.21],[-.18,.102,-.26],[-.108,.172,-.28],[.113,.172,-.28],[.185,.101,-.26],[.321,.049,-.21]],.029,strap);
    } else {
      for(const s of [-1,1]) path(p,'strap end',[[s*.319,.05,-.21],[s*.208,.055,-.28],[s*.061,.058,-.263]],.031,strap);
      bevel(p,'strap keeper',[-.081,.031,-.305,.081,.103,-.225],.021,metal);
    }
    if(id==='bandolier_wrist') for(const x of [-.208,-.106,0,.106,.208])
      cyl(p,'empty stitched loop','z',[x,.072,.246],.032,.078,8,trim,{open:true});
    if(harness) {
      for(const x of [-.235,.235]) path(p,'harness side webbing',[[x,.061,-.242],[x,.08,.067],[x,.061,.267]],.029,strap);
      path(p,'central strap',[[-.239,.067,.051],[0,.081,.02],[.239,.067,.052]],.029,strap);
    }
    if(/fur_collar|leather_collar/.test(id)){
      path(p,'bell loop',[[0,.07,.237],[0,.062,.294],[0,.049,.311]],.011,gold);
      blob(p,'small hanging bell',[.051,.043,.053],[0,.043,.345],gold,{},4,10);
    }
    return;
  }
  if(shape==='key') {
    cyl(p,'key bow','y',[0,.036,.285],.144,.072,12,metal,{open:true});
    ring(p,'bow rim',.071,.144,.073,metal,[0,.285],12);
    cutShape(p,'key blade',[[-.046,.268],[.055,.268],[.052,-.371],[-.038,-.421],[-.063,-.319],[-.135,-.316],[-.132,-.211],[-.066,-.207]],.054,metal);
    return;
  }
  if(shape==='zip') {
    bevel(p,'cloth pencil case',[-.421,0,-.176,.421,.115,.176],.057,paint);
    p.box('zip track',[-.385,.103,-.019,.387,.123,.019],trim);
    p.box('zipper pull',[-.387,.117,-.034,-.242,.142,.029],metal);
    return;
  }
  if(shape==='dental') {
    const fang=id==='vampire_fangs';
    const material=fang?plasticP(0xded3bd):metal;
    path(p,'dental curve',[[-.342,.056,.12],[-.302,.067,-.088],[-.171,.065,-.222],[0,.063,-.257],[.171,.065,-.222],[.3,.069,-.087],[.342,.055,.12]],.046,material);
    for(const x of [-.222,-.110,0,.110,.222])
      bevel(p,'tooth cap',[x-.043,.029,-.259+Math.abs(x)*.51,x+.044,fang&&Math.abs(x)>.18?.187:.123,-.162+Math.abs(x)*.51],.022,material);
    return;
  }
  if(id==='clown_nose'){
    profile(p,'hollow red clown nose',[[.184,0],[.293,0],[.351,.096],[.354,.232],[.295,.342],[.182,.411],[0,.431],[0,.284],[.119,.274],[.171,.184],[.184,0]],plasticP(0xc25d57),{sides:16});
    return;
  }
  path(p,'costume headband',[[-.364,.044,.197],[-.36,.045,-.102],[-.241,.045,-.324],[0,.046,-.368],[.246,.045,-.319],[.361,.045,-.101],[.366,.045,.197]],.037,trim);
  for(const s of [-1,1]) {
    cutShape(p,'pointed costume ear',[[s*.123,-.253],[s*.303,-.457],[s*.373,-.206]],.083,paint,.042);
    cutShape(p,'ear lining',[[s*.192,-.249],[s*.293,-.369],[s*.325,-.235]],.014,clothP(0xb68a87),.125);
  }
}

function watch(p,d) {
  if(d.id==='pocketwatch') {
    const metal=gold;
    cyl(p,'watch body','y',[0,.086,-.034],.305,.169,16,metal);
    ring(p,'polished bezel',.239,.308,.174,metal,[0,-.034],16);
    cyl(p,'dial','y',[0,.163,-.034],.235,.02,16,flat(0xd8cfb8));
    top(p,'watch hands',[-.101,-.073,.097,.133],.175,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0xd8cfb8);
      fill(ctx,x+w*.46,y+h*.1,w*.061,h*.44,0x454448);
      fill(ctx,x+w*.46,y+h*.49,w*.39,h*.05,0x454448);
    });
    path(p,'watch chain',[[0,.074,.257],[.146,.041,.353],[.319,.033,.373],[.414,.031,.214]],.014,metal);
    return;
  }
  if(d.id==='fitness_band'){
    bevel(p,'slim exercise wristband',[-.092,0,-.445,.092,.035,.444],.016,rubber);
    bevel(p,'rounded tracker body',[-.106,.026,-.183,.106,.072,.18],.023,rubber);
    top(p,'slim activity display',[-.066,-.134,.067,.13],.074,label(0x34454c,'72',d.key));
    return;
  }
  const advanced=/smart|game/.test(d.id);
  workshopWear.watch(p,{...d,id:advanced?'smart_watch':d.id==='sf_watch'?'gold_watch':'silver_watch'});
  if(d.id==='sf_watch') ring(p,'engraved silver bezel',.146,.183,.122,silver,[0,0],16);
  if(d.id==='diving_watch') ring(p,'thick dive bezel',.166,.203,.124,silver,[0,0],14);
  if(d.id==='smart_watch_adv') {
    bevel(p,'raised protective display rim',[-.187,.096,-.178,.187,.128,.179],.019,plasticP(0x3b454c));
    top(p,'advanced touchscreen',[-.151,-.139,.151,.142],.13,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0x273f49);
      fill(ctx,x+w*.12,y+h*.16,w*.77,h*.1,0x8caea4);
      for(let i=0;i<6;i++) fill(ctx,x+w*(.138+i*.122),y+h*(.66-(i%3)*.11),w*.078,h*(.17+i%3*.11),0x75a391);
    });
  }
  if(d.id==='game_watch') for(const z of [-.06,.055]) cyl(p,'game control','y',[-.136,.104,z],.022,.016,8,plasticP(0x9e5655));
}

function gloves(p,d) {
  if(d.id!=='gloves_wool_fingerless') {
    workshopWear.gloves(p,d);
    if(d.id==='gloves_tactical'||d.id==='thermal_gloves') for(const x of [-.223,.223]) {
      bevel(p,'reinforced knuckle panel',[x-.097,.044,-.149,x+.093,.064,-.097],.009,trim);
      bevel(p,'adjustable cuff tab',[x-.06,.037,.267,x+.073,.061,.328],.009,trim);
    }
    return;
  }
  const wool=knitP(d.color);
  for(const x of [-.222,.222]) {
    bevel(p,'wool palm',[x-.128,0,-.121,x+.126,.06,.231],.025,wool);
    for(let n=0;n<4;n++) {
      const finger=x+(n-1.5)*.055;
      cyl(p,'open finger cuff','z',[finger,.044,-.122],.027,.102,9,wool,{open:true});
    }
    cyl(p,'open thumb cuff','z',[x+(x<0?-.124:.124),.041,-.049],.035,.079,9,wool,{open:true});
  }
}
function earphones(p,d) {
  if(d.id!=='attachable_ear_muffs') {
    workshopWear.earphones(p,{...d,color:0x626f59});
    bevel(p,'battery compartment',[.429,.147,-.056,.482,.218,.061],.013,plasticP(0x51534d));
    return;
  }
  for(const x of [-.248,.248]){
    cyl(p,'ear cup','y',[x,.075,0],.148,.15,13,plasticP(d.color));
    cyl(p,'cushion edge','y',[x,.16,0],.139,.035,12,rubber,{open:true});
    path(p,'helmet rail clip',[[x,.12,.112],[x,.169,.198],[x,.25,.294]],.024,silver);
    bevel(p,'mounting plate',[x-.062,.225,.275,x+.063,.291,.357],.018,trim);
  }
}
function costumeDress(p,d) {
  const {id,color}=d, bee=id==='bee_dress', cheer=id==='cheerleader_dress';
  const tint=bee?0x4b4743:cheer?0x4c6d97:color;
  const textile=clothP(tint), hem=id==='long_dress_sleeved'?.449:.292;
  const dress=[[-.149,-.296],[-.086,-.356],[-.043,-.282],[.043,-.282],[.086,-.356],[.149,-.296],[.11,-.099],[.245,hem],[-.245,hem],[-.11,-.099]];
  cutShape(p,'dress outline',dress,.043,textile);
  if(id==='long_dress_sleeved') {
    for(const side of [-1,1]) cutShape(p,'long cotton sleeve',[[.134,-.3],[.216,-.339],[.367,-.081],[.291,-.018],[.14,-.205]].map(([x,z])=>[side*x,z]),.038,textile);
  } else if(bee) {
    const yellow=clothP(0xc5a64b), wing=flat(0xb6c4b4);
    for(const [z,w] of [[-.235,.118],[-.112,.111],[.038,.139],[.184,.197]])
      top(p,'golden bee stripe',[-w,z,w,z+.05],.045,yellow);
    for(const side of [-1,1]) {
      bevel(p,'translucent costume wing',[side>0?.101:-.342,.019,-.184,side>0?.342:-.101,.041,.102],.008,wing,GLASS);
      path(p,'hood antenna',[[side*.054,.07,-.329],[side*.081,.109,-.415],[side*.134,.104,-.468]],.014,trim);
    }
    cutShape(p,'bee costume hood',oval(0,-.346,.097,.078),.039,trim,.051,[oval(0,-.351,.058,.048)]);
  } else {
    for (const [z,w] of [[-.178,.11],[.168,.183],[.229,.205]]) top(p,'white uniform stripe',[-w,z,w,z+.025],.044,cream);
    top(p,'cheer lettering',[-.112,-.264,.112,-.194],.046,label(tint,'CHEERS',d.key));
  }
}
function pants(p,d) {
  if(d.id==='chaps_cut_resistant') return workshopWear.pants(p,d);
  const hakama=d.id==='hakama_gi';
  const fabric=hakama?clothP(0x444047):plasticP(0x48515a);
  p.box('waist band',[-.238,0,-.391,.238,.041,-.304],trim);
  for(const s of [-1,1]){
    const leg=hakama?[[.006,-.311],[.227,-.309],[.289,.416],[.051,.416]]:[[.013,-.324],[.213,-.317],[.137,.417],[.043,.41]];
    cutShape(p,'trouser leg',leg.map(([x,z])=>[s*x,z]),.037,fabric);
    if(hakama) for(const x of [.081,.154,.204]) path(p,'pressed fabric pleat',[[s*x,.039,-.279],[s*x*1.22,.039,.375]],.008,clothP(0x565052));
    else path(p,'neoprene seam',[[s*.189,.032,-.278],[s*.158,.038,.072],[s*.123,.038,.38]],.008,plasticP(0x6a888f));
  }
}
function pin(p,d){
  const metal=d.id==='gold_hairpin'?gold:silver;
  path(p,'folded wire hairpin',[[-.419,.034,-.04],[.371,.034,-.04],[.442,.034,.011],[.369,.034,.071],[-.391,.034,.073]],.025,metal);
  if(d.id==='gold_hairpin') for(const x of [-.351,-.275,-.194]) cyl(p,'bead decoration','y',[x,.061,.031],.036,.042,9,gold);
}
export const supplyWear={ accessory, suit:uniform, coat, headwear:hats, shoe:boots, carry, cloth, armor, glasses:facewear, mask:facewear, watch, gloves, earphones, dress:costumeDress,pants,pin };
