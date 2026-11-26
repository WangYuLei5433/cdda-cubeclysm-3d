import { blob, can, lump } from './item-kit.js';
import { bevel, cyl, front, label, lid, paperP, path, plasticP, shade, steelP, top } from './common-loot-kit.js';
import { cutShape, oval, profile } from './item-workshop-kit.js';
import { supplyGoods } from './item-supply-goods.js';

const paper = paperP(0xe2d5ae);
const brass = steelP(0xb7a377);
const steel = steelP(0xa6a7a5);
const crust = plasticP(0xb68145);
const cream = plasticP(0xead6a0);
const leaf = plasticP(0x678451);
const tomato = plasticP(0xba5140);
const cocoa = plasticP(0x634232);
const coolerColors = {
  creamsoda:0xc49d63, zerotropical:0x629172, zeromdew:0x4186ae, energy_drink:0x69516d,
  sparkling_peach:0xd68b76, sparkling_pomegranate:0x9b485d, V8:0xac5548,
  pineapple_juice:0xd1aa55, cranberry_juice:0xa04854, apple_cider:0xac753d, sports_drink:0x558cb8,
  wine_chardonnay:0x8f9255, wine_riesling:0xa7a46e, bristol_sherry:0x46587e,
};
const packTint = {
  cereal:0x9f534d,cereal2:0xa48049,cereal3:0xad8a4b,cereal_fp1:0x5b7792,
  milk_powder:0x708ca3,cheese_powder:0xc28c42,powder_eggs:0xc3a254,
  lemonade_powder:0xb0a24c,grapeade_powder:0x765b82,orangeade_powder:0xbe7d4e,
  oat_milk:0xae8f66,almond_milk:0x8d7ca0,soy_milk:0x689065,milk_choc:0x80554a,
  mustard:0xc1a23d,sauerkraut:0x8f9860,salsa:0xb75942,hot_sauce:0xa4493e,coffee_syrup:0x604039,
  can_spam:0x426786,can_herring:0x59868c,can_tuna:0x6c8b97,pork_beans:0xa76a4e,
};

function dry(p,d) {
  const {id,shape,key,name}=d;
  const color=packTint[id]??{
    protein_powder:0x726f87,soup_instant_vegetable_powder:0x7b926a,soup_instant_chicken_noodle_powder:0xae874e,
    yogurt_starter_culture:0x829597,gelatin_dessert_powder:0xc48387,mre_bag_small:0x6d776a,
    mre_bag_dessert:0x97705f,mre_bag_spread:0x887a55,mre_bag_jam:0x8c5b67,
  }[id]??d.color;
  if (shape==='carton') {
    const milk=/milk|cream/.test(id);
    const w=milk?.20:.298, z=milk?.166:.119;
    bevel(p,'printed carton',[-w,0,-z,w,.746,z],.014,paperP(color));
    if (milk) {
      p.box('folded carton seam',[-w,.745,-.042,w,.803,.043],paper);
      cyl(p,'screw cap','y',[.114,.80,-.014],.052,.055,12,plasticP(shade(color,1.36)));
    } else p.box('sealed cereal box flaps',[-w,.74,-z,w,.763,z],paperP(shade(color,1.12)));
    front(p,'product illustration and wordmark',[-w+.018,.108,w-.018,.679],-z-.003,label(color,name,key));
    return;
  }
  if (shape==='tea') {
    const tint=id.includes('fruit')?0xa54d64:id.includes('green')?0x658951:id.includes('chamomile')?0xbda05e:0x9c8756;
    if (!id.endsWith('_bag')&&!id.includes('_bag_')) {
      for (let i=0;i<19;i++) {
        const a=i*2.4,r=.37*Math.sqrt(i/19);
        blob(p,'curled dried tea leaf',[.085,.027,.044],[r*Math.cos(a),.026+(i%4)*.013,r*Math.sin(a)],plasticP(shade(tint,.66+(i%5)*.09)),{},3,7);
      }
      return;
    }
    bevel(p,'porous paper sachet',[-.362,0,-.31,.139,.072,.305],.038,paperP(0xd1c295));
    top(p,'tea fines visible through paper',[-.305,-.242,.078,.249],.074,paperP(shade(tint,1.28)));
    path(p,'cotton string',[[.105,.055,-.163],[.235,.029,-.244],[.336,.026,-.137],[.311,.026,.029]],.012,paper);
    p.box('tag',[.202,.001,.015,.433,.026,.21],paperP(tint));
    top(p,'printed tag',[.211,.024,.424,.201],.028,label(tint,name,key));
    return;
  }
  if (shape==='loose') {
    const ground=id.includes('coffee'), flatFood=/cracklins|pretzel/.test(id);
    const chestnut=id==='chestnut_roasted', seed=id==='pistachio_roasted', peanut=id==='peanut';
    const base=ground?0x745039:id.includes('pistachio')?0x96a267:id.includes('popcorn')?0xe4cea1:0xab8356;
    for (let i=0;i<(ground?28:11);i++) {
      const a=i*2.4,r=.375*Math.sqrt(i/(ground?28:11)), x=Math.cos(a)*r,z=Math.sin(a)*r*.84;
      if (id==='pretzels'){
        const y=.023+i%3*.036;
        cutShape(p,'crisp pretzel ring',oval(x,z,.121,.101,11),.035,crust,y,[oval(x,z,.077,.061,10)]);
        for(const s of [-1,1]) path(p,'crossed pretzel dough',[[x-s*.085,y+.036,z-.05],[x,y+.048,z+.024],[x+s*.045,y+.037,z+.063]],.017,crust);
      }
      else if(chestnut||seed||peanut) {
        const y=.043+i%3*.018;
        if(chestnut){
          blob(p,'brown roasted chestnut',[.093,.064,.076],[x,y,z],plasticP(0x8d5940),{},4,9);
          path(p,'split nut skin',[[x-.07,y+.062,z],[x,y+.068,z+.006],[x+.052,y+.052,z-.041]],.009,cream);
        } else if(seed) {
          for(const s of [-1,1]) blob(p,'split pistachio shell',[.072,.039,.032],[x,y,z+s*.029],cream,{},4,8);
          blob(p,'green kernel',[.065,.037,.024],[x,y+.016,z],leaf,{},3,8);
        } else for(const s of [-1,1]) blob(p,'paired lobes of shelled peanut',[.047,.036,.038],[x+s*.034,y,z],crust,{},3,8);
      }
      else blob(p,ground?'roasted grounds':'snack pieces',[ground?.048:.087,flatFood?.041:.06,ground?.053:.063],[x,.041+i%3*.026,z],plasticP(shade(base,.74+(i%5)*.105)),{},4,8);
    }
    return;
  }
  if (shape==='candy') {
    if (/candycigarette|licorice/.test(id)) {
      for (const z of [-.18,-.06,.065,.198])
        cyl(p,'long candy stick','x',[z*.22,.046,z],.042,.744+z*.21,8,id==='licorice'?plasticP(0x413039):cream);
    } else if (/^candy$|mintpatties|neccowafers|gum|maple_candy/.test(id)) {
      for (const [x,z,h] of [[-.19,-.11,.07],[.191,-.012,.082],[.038,.21,.061]]) {
        const map={candy:[0x633c2c,0x975236,0x623e32],gum:[0xd6b57e,0xd08c9d,0x8baa86],mintpatties:[0x543e36,0x725044,0x655047],neccowafers:[0xc88a8c,0xc99f6d,0xb5ad92],maple_candy:[0xc9925e,0xd5a56e,0xaf794f]};
        const idx=x<0?0:z<0?1:2;
        if (id==='gum') bevel(p,'rounded gum tablet',[x-.14,0,z-.087,x+.14,.083,z+.087],.028,plasticP(map[id][idx]));
        else profile(p,'moulded candy',[[0,0],[.099,0],[.136,.02],[.141,h],[.123,h+.008],[0,h+.008]],plasticP(map[id][idx]),{at:[x,z],sides:id==='maple_candy'?8:14});
      }
    } else {
      const chocolate=/maltballs|coffee|cow_candy/.test(id);
      for (let i=0;i<9;i++) {
        const a=i*2.4,r=.334*Math.sqrt(i/9);
        const colors=chocolate?[0x674737,0x794f39,0x553a30]:[0xa85055,0xd3a65f,0x77945e,0x8a6b9d,0xca825b];
        const x=Math.cos(a)*r,z=Math.sin(a)*r,y=i%3*.024;
        const paint=plasticP(colors[i%colors.length]);
        if(id==='candy3') bevel(p,'fruit chew tablet',[x-.065,y,z-.056,x+.066,y+.082,z+.056],.022,paint);
        else if(id==='candy4') for(const s of [-1,0,1]) blob(p,'gummy candy silhouette',[.051,.038,.057],[x+s*.037,y+.039,z+Math.abs(s)*.033],paint,{},3,8);
        else if(id==='candy_coated_peanuts') for(const s of [-1,1]) blob(p,'coated peanut lobe',[.046,.044,.038],[x+s*.035,y+.043,z],paint,{},3,8);
        else blob(p,'bite-sized sweet',[.085,id==='maltballs'?.075:.045,.074],[x,.062+y,z],paint,{},3,9);
      }
    }
    return;
  }
  if (id==='fruit_leather') {
    for (const [x,y,z] of [[-.07,0,-.09],[.038,.047,.018],[.103,.09,.126]])
      bevel(p,'dried fruit sheet',[x-.335,y,z-.142,x+.335,y+.048,z+.141],.018,plasticP(0x874751));
    return;
  }
  const narrow=id==='protein_bar_zero';
  const w=narrow?.422:.365,z=narrow?.13:.254;
  bevel(p,'filled laminated sachet',[-w,0,-z,w,.106,z],.038,plasticP(color));
  for (const x of [-w,w]) p.box('crimped closure',[x-.021,.024,-z,x+.021,.063,z],plasticP(shade(color,.83)));
  top(p,'printed sachet panel',[-w+.054,-z+.032,w-.042,z-.031],.109,label(color,name,key));
}

function marketDrink(p,d) {
  const {id,shape,name,key}=d, color=coolerColors[id]??d.color;
  if (shape==='soda') return supplyGoods.drink(p,{...d,color});
  if (id==='milkshake_fastfood') {
    const tint=0xb4776d;
    profile(p,'printed fast food paper cup',[[0,0],[.139,0],[.181,.062],[.254,.676],[.24,.69],[0,.69]],paperP(tint));
    lid(p,'opaque snap-on lid',.257,.668,.055,paper);
    path(p,'straight striped straw',[[.009,.721,0],[.019,.867,-.03]],.019,plasticP(0xb55663));
    front(p,'takeout cup print',[-.129,.225,.129,.48],-.242,label(tint,'SHAKE',key));
    return;
  }
  if (shape==='shake') {
    const tint=id.includes('choc')?0x99694f:id.includes('lemon')?0xd6bd68:id.includes('protein')?0xac727b:0xe1c5a3;
    profile(p,'tapered cold-drink cup',[[0,0],[.17,0],[.18,.024],[.269,.577],[.262,.598],[0,.598]],plasticP(tint),{sides:14});
    profile(p,'domed cover',[[.253,.548],[.278,.568],[.272,.622],[.212,.692],[.105,.716],[0,.714]],plasticP(shade(tint,1.23)));
    path(p,'bent drinking straw',[[.057,.69,-.036],[.102,.827,-.036],[.171,.851,-.039]],.021,plasticP(id.includes('choc')?0xdaaa84:0xa86275));
    if (id.includes('deluxe')) for (const [x,z] of [[-.09,-.077],[-.07,.095],[.03,.02]])
      blob(p,'fruit and candy topping',[.038,.035,.033],[x,.718,z],tomato,{},3,8);
    front(p,'cup mark',[-.083,.187,.103,.374],-.251,label(color,name,key));
    return;
  }
  const wine=shape==='wine', juice=shape==='juice';
  if(id==='bristol_sherry'||id==='whiskey'){
    const sherry=id==='bristol_sherry',body=plasticP(sherry?0x3e536e:0xad7648);
    bevel(p,'rectangular glass bottle',[-.21,0,-.145,.21,.601,.144],sherry?.069:.047,body);
    bevel(p,'sloping square shoulders',[-.207,.505,-.139,.207,.681,.138],.057,body);
    lid(p,'short neck',.092,.632,.155,body);
    lid(p,'bottle closure',.108,.773,.05,plasticP(sherry?0xa39c79:0x626264));
    front(p,'pressed paper label',[-.161,.178,.163,.456],-.148,label(color,name,key));
    return;
  }
  const r=wine?.166:juice?.244:.22, neck=wine?.077:juice?.102:.086;
  const y=juice?.506:.625;
  const material=plasticP(wine?shade(color,.68):juice?color:0xa87542);
  profile(p,'shaped drink bottle',[[0,0],[r*.81,0],[r,.042],[r,y-.025],[r*.86,y+.039],[neck,y+.109],[neck,.811],[0,.811]],material,{sides:juice?12:16});
  lid(p,wine?'foil capsule':'cap',neck*1.11,.794,.079,plasticP(shade(color,1.32)));
  front(p,'paper front label',[-r*.58,.213,r*.58,.538],-r-.004,label(color,name,key));
  if (wine) cyl(p,'neck foil band','y',[0,.772,0],neck*1.036,.057,14,brass,{open:true});
  if (juice) for (const h of [.083,.146]) cyl(p,'moulded grip ring','y',[0,h,0],r+.005,.016,12,plasticP(shade(color,.89)),{open:true});
}

function marketPreserve(p,d) {
  const {id,shape,key,name}=d,color=packTint[id]??d.color;
  if (shape==='tin') {
    if (/can_spam|can_herring/.test(id)) {
      const h=id==='can_spam'?.367:.193;
      bevel(p,'rounded shouldered tin',[-.421,0,-.258,.421,h,.258],.054,steel);
      bevel(p,'printed wrapper',[-.419,.038,-.259,.419,h-.033,.26],.042,plasticP(color));
      bevel(p,'beaded pull-top lid',[-.428,h-.018,-.267,.428,h+.013,.267],.053,steel);
      cutShape(p,'pull tab',oval(.154,.015,.069,.039),.017,steel,h+.014,[oval(.154,.015,.039,.018)]);
      front(p,'contents label',[-.324,.046,.327,h-.029],-.261,label(color,name,key));
      return;
    }
    const h=id==='can_tuna'?.278:.539,r=id==='can_tuna'?.357:.286;
    can(p,{r,h,label:plasticP(color),ring:true});
    front(p,'contents label',[-r*.59,h*.19,r*.59,h*.83],-r-.003,label(color,name,key));
    return;
  }
  if (shape==='pot') {
    if (id.includes('gelatin')) {
      profile(p,'moulded fruit gelatin',[[0,0],[.32,0],[.347,.057],[.293,.262],[.246,.309],[.173,.333],[0,.333]],plasticP(0xbd536f),{sides:10});
      return;
    }
    profile(p,'dairy tub',[[0,0],[.253,0],[.289,.048],[.337,.353],[0,.353]],plasticP(0xe5daca));
    lid(p,'foil and plastic lid',.345,.341,.047,plasticP(color));
    top(p,'pot lid print',[-.20,-.177,.20,.173],.392,label(color,name,key));
    return;
  }
  const narrow=/hot_sauce|syrup/.test(id),r=narrow?.193:.286,neck=narrow?.083:.223;
  const h=narrow?.723:.58;
  profile(p,'glass preserving vessel',[[0,0],[r*.81,0],[r,.048],[r,h-.137],[r*.93,h-.092],[neck,h-.047],[neck,h],[0,h]],plasticP(color),{sides:16});
  lid(p,'threaded preserving lid',neck*1.09,h-.017,.062,plasticP(shade(color,1.45)));
  front(p,'preserving label',[-r*.56,.167,r*.56,h-.159],-r-.005,label(shade(color,.83),name,key));
  if (id==='sauerkraut') for (const [x,y] of [[-.149,.421],[.043,.411],[.036,.46],[.115,.44]])
    path(p,'pale cabbage shreds',[[x,y,-.231],[x+.067,y+.024,-.221]],.012,cream);
}

const pieSlice=[[-.455,-.22],[-.256,-.297],[.042,-.25],[.43,.086],[-.377,.243],[-.453,.113]];
function bakedSlice(p,d) {
  const {id,shape}=d, pizza=shape==='pizza';
  const whole=id==='pizza_veggy';
  const points=whole?oval(0,0,.444,.418,14):pieSlice;
  const h=pizza?.084:.154;
  cutShape(p,'baked crust',points,h,crust);
  const inset=points.map(([x,z])=>[x*.89+.019,z*.875]);
  const filling=pizza?tomato:id==='pie_maple'?plasticP(0x956138):id==='pie'?plasticP(0xa35353):id==='pie_veggy'?plasticP(0x8b8953):plasticP(0x885c44);
  cutShape(p,'exposed filling',inset,.038,filling,h-.004);
  if (pizza) {
    cutShape(p,'melted cheese',inset.map(([x,z])=>[x*.93,z*.88]),.016,cream,h+.027);
    const spots=whole?[[-.23,-.14],[.17,-.21],[.22,.13],[-.05,.06],[-.16,.228]]:[[-.27,-.071],[-.15,.021],[-.045,-.102],[.077,.033],[-.237,.099]];
    for (const [i,[x,z]] of spots.entries()) {
      if (id==='pizza_cheese') blob(p,'brown cheese blister',[.042,.014,.039],[x,h+.037,z],crust,{},3,8);
      else if (whole||id==='pizza_supreme'&&i%2) path(p,'sliced green vegetable',[[x-.044,h+.049,z],[x,h+.054,z+.055],[x+.05,h+.046,z+.023]],.019,leaf);
      else cyl(p,'meaty topping','y',[x,h+.045,z],id==='pizza_supreme'?.056:.037,.024,9,plasticP(0x92483e));
    }
    if (!whole) path(p,'raised crust edge',[[-.41,h,-.212],[-.42,h+.023,-.019],[-.38,h,.193]],.042,crust);
    return;
  }
  if (id!=='pie_maple') for (const [a,b] of [[[-.36,-.166],[.005,.15]],[[-.35,-.043],[-.09,.165]],[[-.274,-.224],[.16,.105]],[[-.396,.071],[.131,-.078]]])
    path(p,'woven pastry strip',[[a[0],h+.06,a[1]],[b[0],h+.06,b[1]]],.022,crust);
}
function serving(p,d) {
  const {id,shape,key}=d;
  const hue={
    tuna_noodle_casserole:0xb5a071,hot_corn_casserole:0xc19a48,cheesy_spinach_casserole:0x87924c,lazy_lobster_casserole:0xbb7950,
    ravioli:0xb57144,curry_meat:0x987144,curry_veggy:0xb18c4c,chili:0x9f5037,veggy_salad:0x658851,insta_salad:0x83935d,
    soup_dumplings:0xc8ab74,cooked_pumpkin:0xd19045,
  }[id]??0xb28f5a;
  const flatServing=shape==='casserole';
  if (flatServing) {
    bevel(p,'cut casserole portion',[-.373,0,-.274,.373,.182,.274],.043,plasticP(hue));
    bevel(p,'browned baked crust',[-.371,.161,-.27,.372,.221,.27],.043,plasticP(shade(hue,.85)));
  } else {
    profile(p,'earthenware bowl',[[0,0],[.226,0],[.278,.032],[.395,.188],[.409,.239],[.387,.241],[.364,.196],[.258,.07],[0,.07]],paperP(0xb3a38d));
    profile(p,'meal in bowl',[[0,.086],[.258,.086],[.362,.183],[.355,.205],[0,.205]],plasticP(hue));
  }
  for (let i=0;i<15;i++) {
    const a=i*2.3999,r=.29*Math.sqrt(i/15),x=Math.cos(a)*r,z=Math.sin(a)*r*.76;
    const paint=plasticP(i%4===0?0x7d9257:shade(hue,.77+(i%5)*.14));
    if (id==='ravioli') bevel(p,'square pasta pocket',[x-.062,.204,z-.049,x+.063,.251,z+.048],.016,cream);
    else if (/salad/.test(id)) cutShape(p,'torn leafy slice',[[x-.062,z-.025],[x+.072,z-.042],[x+.053,z+.066],[x-.051,z+.034]],.021,i%5===0?tomato:paint,.201+i%4*.023);
    else blob(p,'pieces in cooked dish',[id==='soup_dumplings'?.067:.048,.034,.051],[x,.225+i%3*.013,z],paint,{},3,8);
  }
  if (id==='cooked_pumpkin') lump(p,'mashed pumpkin mound',[.29,.085,.23],plasticP(hue),key,{},[0,.184,0]);
}
function sweet(p,d) {
  const {id}=d;
  const color={icecream_choc:0x926756,icecream_fruit:0xd8a3a4,icecream_sorbet:0xc98278,snowcone:0xa3bdcb,icecream_custard:0xe1c37c,icecream_yogurt:0xe8ded3}[id]??0xe4d1ab;
  const cone=id==='snowcone';
  profile(p,cone?'waxed paper cone':'dessert dish',[[0,0],[cone?.057:.158,0],[cone?.103:.204,.08],[.284,.33],[.271,.359],[.245,.348],[0,.1]],paperP(cone?0xbe6a75:0xa99d93));
  blob(p,'frozen scoop',[.256,.191,.25],[0,.388,0],plasticP(color),{},5,12);
  if (/candy|fruit|snowcone/.test(id)) for (const [x,z] of [[-.111,-.054],[.102,-.09],[.03,.123],[-.047,.046]])
    blob(p,'flavor and topping flecks',[.032,.026,.033],[x,.535,z],plasticP(cone?0xbc7091:id.includes('candy')?0x81523d:0xc66c69),{},3,8);
  if (/custard|yogurt|gelato/.test(id)) path(p,'scoop ridges',[[-.182,.478,.043],[-.101,.539,.058],[0,.579,.037],[.117,.53,.029]],.022,plasticP(shade(color,.86)));
}
function meal(p,d) {
  const {id,shape,key}=d;
  if (shape==='pizza'||shape==='pie') return bakedSlice(p,d);
  if (shape==='bowl'||shape==='casserole'||id==='cooked_pumpkin') return serving(p,d);
  if (shape==='cold') return sweet(p,d);
  if (id==='crispycran') return marketDrink(p,{...d,shape:'juice',color:0xa45f72});
  if (id==='confit_meat') {
    profile(p,'shallow preserving pot',[[0,0],[.28,0],[.329,.044],[.368,.237],[.341,.241],[.31,.155],[0,.155]],plasticP(0x8f7766));
    profile(p,'pale cooking fat surface',[[0,.146],[.312,.146],[.335,.211],[0,.211]],cream);
    for(const [i,[x,z]] of [[-.129,-.05],[.142,.087],[-.045,.119]].entries()) lump(p,'pieces of confit',[.124,.064,.111],plasticP(0xa57456),key+i,{},[x,.19,z]);
    return;
  }
  if (id==='onion_rings') {
    for (const [x,z,y,r] of [[-.18,-.09,0,.209],[.177,.068,0,.204],[-.013,.138,.075,.142]])
      cutShape(p,'battered onion loop',oval(x,z,r,r*.89,12),.074,crust,y,[oval(x,z,r*.56,r*.51,11)]);
    return;
  }
  if (id.includes('nachos')) {
    for (const [i,[x,z]] of [[-.208,-.08],[.18,-.138],[.02,.146],[-.125,.184],[.125,.046]].entries())
      cutShape(p,'triangular tortilla chip',[[x-.16,z-.052],[x+.127,z-.114],[x+.057,z+.15]],.028,plasticP(shade(0xd0a453,.81+i*.08)),i*.037);
    return;
  }
  if (/hotdogs|porkstick/.test(id)) {
    if (id!=='hotdogs_frozen'&&id!=='porkstick') bevel(p,'split bun',[-.425,0,-.162,.426,.177,.159],.068,crust);
    const r=id==='porkstick'?.068:.105;
    cyl(p,'sausage','x',[0,id==='hotdogs_cooked'? .178:r,0],r,.807,12,plasticP(id.endsWith('frozen')?0xb77876:0x965449));
    return;
  }
  if (shape==='sandwich') {
    if (id==='junk_burrito') {
      bevel(p,'rolled flour tortilla',[-.414,0,-.154,.418,.251,.154],.086,cream);
      for (const x of [-.29,.27]) path(p,'folded tortilla ends',[[x,.06,-.14],[x+.042,.248,-.053],[x,.233,.134]],.015,crust);
      return;
    }
    const bread=id==='blt'?[[ -.37,-.26],[.35,-.26],[.386,.206],[.26,.27],[-.27,.278],[-.393,.194]]:oval(0,0,.376,.32,13);
    cutShape(p,'bottom bread',bread,.105,crust);
    cutShape(p,'cooked filling',bread.map(([x,z])=>[x*.94,z*.93]),.098,plasticP(0x80513a),.09);
    cutShape(p,'lettuce',bread.map(([x,z],i)=>[x*(.93+i%2*.12),z]),.039,leaf,.174);
    for(const x of [-.132,.134]) cyl(p,'tomato slices','y',[x,.219,0],.13,.047,11,tomato);
    if (id==='cheeseburger') cutShape(p,'melted cheese',[[-.315,-.239],[.346,-.193],[.269,.245],[-.29,.248]],.028,cream,.215);
    if(id==='blt') cutShape(p,'upper toast',bread,.085,crust,.233);
    else blob(p,'rounded bun crown',[.362,.141,.31],[0,.30,0],plasticP(0xbe915b),{},5,13);
    return;
  }
  if (shape==='cheese') {
    if (id==='mozzarella_cheese') blob(p,'ball of mozzarella',[.338,.241,.323],[0,.215,0],plasticP(0xeee5cd),{},5,13);
    else {
      cutShape(p,'pecorino wedge',pieSlice,.281,plasticP(0xe0c486));
      path(p,'dark cheese rind',[[-.413,.284,-.204],[-.433,.284,.088],[-.364,.29,.211]],.032,plasticP(0x967446));
    }
    return;
  }
  if (id==='sushi_veggyroll') {
    for (const [x,z] of [[-.18,-.135],[.191,-.056],[-.05,.187]]) {
      cyl(p,'green nori wrap','y',[x,.131,z],.152,.257,14,plasticP(0x46604b));
      cyl(p,'compressed rice','y',[x,.261,z],.129,.021,14,cream);
      for(const [dx,dz,c] of [[-.041,.013,0xd09557],[.047,.033,0x6e9758],[.001,-.044,0xa9b978]])
        p.box('chopped vegetables',[x+dx-.031,.265,z+dz-.033,x+dx+.031,.289,z+dz+.032],plasticP(c));
    }
    return;
  }
  if (id==='sourdough_bread') {
    blob(p,'sourdough crust',[.44,.265,.305],[0,.227,0],crust,{},5,14);
    for (const x of [-.19,0,.181]) path(p,'scored flour seam',[[x-.067,.394,-.192],[x-.021,.472,-.03],[x+.061,.464,.119]],.024,cream);
    return;
  }
  if (id==='frozen_dinner') {
    bevel(p,'compartmented frozen dinner tray',[-.43,0,-.298,.43,.133,.298],.055,steel);
    for(const [x,z,w,hue] of [[-.183,.005,.17,0x9f7064],[.178,-.146,.148,0xadab72],[.178,.148,.15,0xbca680]])
      bevel(p,'frozen portion',[x-w,.12,z-.125,x+w,.203,z+.128],.033,plasticP(hue));
    return;
  }
  if (id==='lasagne_raw'||id==='toasterpastryfrozen') {
    for(const [i,z] of [-.117,.103].entries()) {
      bevel(p,'flat pastry or pasta sheet',[-.387,.034*i,z-.173,.391,.052+i*.044,z+.174],.018,cream);
      if(id==='toasterpastryfrozen') top(p,'pale solid frosting',[-.311,z-.105,.301,z+.107],.098,paperP(0xe8ddd1));
      else for(const x of [-.377,.379]) path(p,'crimped pasta border',Array.from({length:11},(_,j)=>[x+(j%2)*.02,.057+i*.043,z-.16+j*.031]),.018,crust);
    }
    return;
  }
  if (id==='fried_mozzarella_sticks') {
    for(const [x,z,y] of [[-.114,-.18,0],[.033,.066,0],[.096,.209,.088]])
      bevel(p,'breaded cheese stick',[x-.29,y,z-.074,x+.298,y+.104,z+.074],.034,crust);
    return;
  }
  if (id==='brownie'||id==='pemmican') {
    bevel(p,id==='brownie'?'brownie crumb':'tallow and dried meat bar',[-.369,0,-.264,.369,.201,.264],.038,id==='brownie'?cocoa:plasticP(0x987b67));
    for(const [i,[x,z]] of [[-.18,-.09],[.177,.068],[-.013,.138],[.08,-.132],[-.19,.14]].entries())
      lump(p,'visible crumb flecks',[.048,.025,.039],plasticP(id==='brownie'?0x8b6147:0x8e474f),key+i,{},[x,.201,z]);
    return;
  }
  if (id==='chicken_fried') {
    lump(p,'crisp chicken thigh',[.32,.176,.248],crust,key,{},[-.098,0,.012]);
    lump(p,'crisp drumstick',[.21,.135,.114],crust,key+1,{},[.244,0,-.038]);
    cyl(p,'bone tip','x',[.413,.085,-.038],.044,.102,9,cream);
    return;
  }
  for (const [i,[x,z]] of [[-.159,-.067],[.162,.115]].entries())
    lump(p,'cooked meat and fat',[.242,.112,.172],plasticP(0xaa7962),key+i,{},[x,0,z]);
}

export const marketFood={dry, marketDrink, marketPreserve, meal};
