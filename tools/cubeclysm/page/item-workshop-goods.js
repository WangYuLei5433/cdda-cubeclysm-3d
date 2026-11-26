import { blob, can as foodTin, lump, pile, woodP } from './item-kit.js';
import { GLASS, V, bevel, clothP, cyl, fill, flat, front, label, lid, outline, paperP, path, plasticP, ring, rubber, shade, steelP, top, tube } from './common-loot-kit.js';

import { cutShape, profile, oval } from './item-workshop-kit.js';

const steel = steelP(0xa3aaa8);
const cream = plasticP(0xe6deca);
const glass = flat(0x9bbdbe);
const base = plasticP(0x42454c);

function bottle(p,d) {
  const {id,shape,color} = d;
  const painted = plasticP(color);
  if (shape==='canteen') {
    const wood = id==='canteen_wood';
    const hip = id==='flask_hip';
    const bladder = id==='camelbak';
    const width = hip?.30:.34;
    const material = wood?woodP(0x9a7249):hip?steel:painted;
    if(bladder) {
      bevel(p,'flat bladder',[-width,0,-.105,width,.69,.113],.063,plasticP(0x7b969e));
      bevel(p,'outer pocket',[-.254,.086,-.153,.255,.47,-.097],.026,painted);
      p.box('sealed edge',[-.258,.414,-.160,.258,.439,-.139],base);
    } else if (wood||hip) {
      bevel(p,'flattened flask',[-width,0,-.19,width,.68,.19],hip?.067:.109,material);
    } else {
      profile(p,'molded canteen',[[0,0],[.21,0],[.303,.08],[.368,.243],[.352,.483],[.268,.62],[.158,.686],[.093,.695]],material,{scale:[1,.53]});
      path(p,'joined canteen seam',[[-.287,.073,-.034],[-.372,.293,-.029],[-.299,.561,-.032]],.011,painted);
    }
    lid(p,'screw cap',.116,.66,.115,hip?steel:base);
    if (wood) for (const y of [.17,.51]) p.box('metal hoop',[-width,y,-.194,width,y+.035,.194],steel);
    if (wood || id==='2lcanteen') path(p,'carry strap',[[-.32,.41,0],[-.45,.34,.12],[-.43,.13,.20],[-.27,.062,.23]],.018,clothP(0x7e7755));
    if (bladder) path(p,'drinking hose',[[.115,.741,0],[.31,.70,0],[.40,.45,.04],[.43,.21,-.01]],.025,base);
    if (hip) p.box('retained cap arm',[.102,.61,-.010,.157,.765,.035],steel);
    return;
  }
  if (shape==='glass') {
    profile(p,'conical flask',[[0,0],[.302,0],[.34,.04],[.329,.10],[.132,.541],[.112,.601],[.112,.696],[.088,.696],[.087,.599],[.106,.537],[.305,.081],[.293,.031],[0,.031]],glass,GLASS);
    lid(p,'rubber stopper',.109,.671,.085,base);
    return;
  }
  if (shape==='plastic') {
    const jug = id==='jug_plastic_glue';
    bevel(p,jug?'glue jug':'flexible plastic pouch',[jug?-.34:-.263,0,-.19,jug?.34:.263,.69,.19],.078,jug?cream:painted);
    lid(p,'threaded cap',.103,.665,.133,base);
    if (jug) path(p,'jug handle',[[.21,.51,0],[.405,.54,0],[.417,.69,0],[.26,.71,0]],.057,cream);
    else for(const y of [.16,.30,.44]) p.box('accordion fold',[-.243,y,-.194,.243,y+.024,-.162],plasticP(shade(color,.81)));
    return;
  }
  const spray = shape==='sprayer';
  cyl(p,'bottle body','y',[0,.337,0],spray?.218:.205,.674,12,spray?cream:steel);
  lid(p,'shoulder',.204,.662,.06,spray?cream:steel);
  lid(p,spray?'atomizer':'screw cap',spray?.119:.202,.71,.16,spray?painted:base);
  if (spray) p.box('nozzle',[-.041,.812,-.137,.041,.867,-.094],base);
  else if (id==='thermos') lid(p,'cap edge',.208,.709,.029,steel);
  front(p,'product label',[-.092,.18,.092,.53],-.205,label(color,d.name,d.key));
}

function tub(p,d) {
  const basket = d.id==='basket_laundry';
  const color = basket?0x9bb6b0:d.color;
  const shell=plasticP(color);
  const depth=basket?.29:.37;
  const rim=basket?.33:.50;
  p.box('flat bottom',[-.39,0,-depth,.39,.042,depth],shell);
  for (const s of [-1,1]) {
    p.box('end wall',[s*.382-.026,.04,-depth,s*.382+.026,rim,depth],shell);
    if (basket) {
      for(let k=0;k<9;k++) {
        const x=-.365+k*.091;
        p.box('vent rib',[x,.051,s*depth-.018,x+.031,rim,s*depth+.018],shell);
      }
      p.box('top rail',[-.425,rim-.040,s*depth-.039,.425,rim+.020,s*depth+.039],shell);
    } else p.box('side wall',[-.39,.04,s*depth-.025,.39,rim,s*depth+.025],shell);
  }
  if (!basket) path(p,'swing handle',[[-.391,.41,0],[-.478,.412,-.117],[-.374,.406,-.435],[.378,.406,-.435],[.478,.412,-.117],[.391,.41,0]],.021,steel);
}

function cup(p,d) {
  const id=d.id, wine=id==='wine_glass', clear=wine||id==='shot_glass';
  const foam=id==='styrofoam_cup', sippy=id==='sippy_cup';
  const paint=clear?glass:foam?cream:plasticP(d.color);
  const opts=clear?GLASS:{};
  const bottom=wine?.315:0;
  const height=wine?.44:foam?.69:sippy?.55:.60;
  const foot=wine?.127:.32;
  const rim=wine?.307:.38;
  if (wine) {
    lid(p,'glass foot',.23,0,.033,glass);
    cyl(p,'stem','y',[0,.171,0],.050,.303,12,glass,opts);
  }
  profile(p,'hollow cup bowl',[[0,bottom],[foot*.92,bottom],[foot,bottom+.052],[rim,bottom+height],
    [rim-.038,bottom+height],[foot-.047,bottom+.072],[0,bottom+.072]],paint,opts);
  if (foam || sippy) {
    lid(p,'snap lid',rim+.024,bottom+height-.023,.058,foam?cream:base);
    if(foam) path(p,'straw',[[.04,.70,-.02],[.04,.88,-.02],[.081,.953,-.02]],.024,plasticP(0xc66e71));
    else {
      bevel(p,'sipping spout',[-.088,.572,-.27,.088,.699,-.096],.039,plasticP(d.color));
      for(const s of [-1,1]) path(p,'handle',[[s*.30,.50,0],[s*.468,.49,0],[s*.444,.26,0],[s*.34,.22,0]],.039,plasticP(d.color));
    }
  }
  if (id==='tin_cup') path(p,'bent cup handle',[[.34,.49,0],[.478,.48,0],[.47,.18,0],[.326,.15,0]],.030,paint);
}

function pot(p,d) {
  const {id}=d, flower=id.includes('flower'), strainer=id==='colander_steel';
  const dutch=id==='dutch_oven', cast=dutch||id==='iron_pot';
  const color=cast?0x414145:flower?(id.startsWith('clay')?0xa4654d:0x565a49):0xa5aaac;
  const paint=flower?plasticP(color):steelP(color);
  const bottom=flower?.215:strainer?.25:.333;
  const radius=flower?.376:.38;
  const height=flower?.57:strainer?.29:id==='pot_canning'?.64:.47;
  if (strainer) {
    const mesh=steelP(0xa1a9aa);
    lid(p,'foot ring',.196,0,.040,mesh);
    const gauges = [[.169,.042],[.226,.097],[.278,.156],[.324,.217],[.368,.277],[radius,.305]];
    for(const [r,y] of gauges) cyl(p,'horizontal mesh strands','y',[0,y,0],r,.014,20,mesh,{open:true});
    for(let n=0;n<28;n++) {
      const a=n*Math.PI/14;
      path(p,'radial mesh strands',gauges.map(([r,y])=>[r*Math.cos(a+y*.76),y,r*Math.sin(a+y*.76)]),.007,mesh);
    }
    profile(p,'rolled rim',[[.352,.285],[.382,.285],[.404,.309],[.384,.323],[.350,.314]],mesh,{sides:20});
  } else {
    profile(p,'open vessel',[[0,0],[bottom*.94,0],[bottom,.047],[radius,height-.03],[radius+.018,height],
      [radius-.026,height+.009],[bottom-.030,.077],[0,.077]],paint,{metal:!flower});
  }
  if (!flower) for(const side of [-1,1])
    path(p,'side handle',[[side*.355,height-.10,-.118],[side*.485,height-.08,-.086],[side*.485,height-.08,.086],[side*.355,height-.10,.118]],.028,paint);
  if (dutch || id==='pot_canning') {
    profile(p,'domed lid',[[0,height],[radius+.012,height],[radius+.015,height+.024],[radius*.91,height+.048],[radius*.36,height+.079],[0,height+.081]],paint,{metal:true});
    lid(p,'handle knob',.066,height+.079,.064,base);
  }
  if(flower) {
    profile(p,'rolled flowerpot lip',[[radius-.043,height-.068],[radius+.013,height-.069],[radius+.026,height],[radius-.034,height+.007]],paint);
    if(id==='clay_pot_flower') lid(p,'clay drain recess',.037,.078,.004,plasticP(0x744739));
  }
}

function vessel(p,d) {
  if (d.shape==='cup') return cup(p,d);
  if (d.shape==='tub') return tub(p,d);
  if (d.shape==='pot') return pot(p,d);
  const plastic=d.id.endsWith('plastic');
  const tank=d.shape==='tank';
  const paint=plastic?plasticP(d.color):steelP(d.id==='jerrycan_big'?0x6b7358:0x939e9c);
  if (tank) {
    const jerry=d.id==='jerrycan_big';
    bevel(p,'stamped tank',[-.32,0,-.178,.32,.71,.178],.069,paint);
    for(const x of (jerry?[-.12,.015,.15]:[0])) path(p,'carrying handle',[[x-.073,.689,.03],[x-.073,.84,.03],[x+.071,.84,.03],[x+.071,.689,.03]],.022,paint);
    cyl(p,'pouring cap','y',[.23,.738,-.023],.071,.062,10,base);
    if(jerry) for(const s of [-1,1]) path(p,'pressed reinforcement',[[-.21,.17,-.181],[.0,.35,-.184],[s*.209,.535,-.181]],.018,paint);
    return;
  }
  lid(p,'steel or plastic pail',.35,0,.65,paint);
  lid(p,'sealed lid',.371,.62,.048,paint);
  path(p,'bail handle',[[-.34,.53,0],[-.43,.52,-.14],[-.30,.51,-.39],[.30,.51,-.39],[.43,.52,-.14],[.34,.53,0]],.019,steel);
  front(p,'paint label',[-.16,.13,.16,.47],-.345,label(d.color,'PAINT',d.key));
}

function cylinder(p,d) {
  const propane=d.id.includes('propane');
  const large=d.id==='large_propane_tank'||d.id==='oxygen_cylinder';
  const liquid=d.id.startsWith('metal_tank');
  const color=propane?0xdad9cf:d.id==='oxygen_cylinder'?0x687f68:d.color;
  const barbecue = d.id==='medium_propane_tank';
  const r=barbecue?.291:large?.16:liquid?.28:.19;
  const h=barbecue?.52:large?.81:.61;
  const paint=steelP(color);
  cyl(p,'cylinder base','y',[0,.023,0],r*.93,.046,12,base);
  cyl(p,'seamed steel cylinder','y',[0,h*.5+.028,0],r,h,14,paint);
  cyl(p,'rounded shoulder','y',[0,h+.071,0],r,.09,14,paint,{},r*.54);
  lid(p,'valve fitting',r*.32,h+.112,.049,steel);
  if(barbecue) {
    profile(p,'rounded valve collar',[[.137,h+.096],[.157,h+.096],[.157,h+.202],[.139,h+.202]],paint,{sides:12});
    for(const x of [-.109,.109]) p.box('collar hand opening',[x-.042,h+.11,-.153,x+.042,h+.153,-.146],base);
  } else if(propane && large) for(const x of [-r*.61,r*.61])
    path(p,'valve guard',[[x,h+.09,-.08],[x,h+.18,-.045],[x,h+.18,.045],[x,h+.09,.08]],.021,paint);
  front(p,'contents marking',[-r*.65,h*.36,r*.65,h*.63],-r*.982,label(shade(color,.68),d.id==='oxygen_cylinder'?'O2':propane?'PROPANE':d.name,d.key));
}

function tubeGlass(p,id,at=[0,0,0]) {
  const [x,y,z]=at;
  const grad=id==='gradcylinder';
  const micro=id==='test_tube_micro';
  const open=id==='glass_tube_small'||grad;
  const r=grad?.088:micro?.079:.108;
  const h=grad?.77:micro?.58:.69;
  const paint=micro?plasticP(0xb2c9c0):glass;
  const opts=micro?{}:GLASS;
  cyl(p,'transparent tube','y',[x,y+h/2,z],r*.78,h,12,paint,{...opts,open:true},r);
  if (grad) {
    cyl(p,'graduated foot','y',[x,y+.026,z],.232,.053,10,paint,opts);
    for(let n=0;n<10;n++) p.box('graduation',[x-.025,y+.15+n*.056,z-r,x+.027+(n%2?.02:0),y+.16+n*.056,z-r+.009],base);
  } else {
    blob(p,'rounded test tube base',[r*.77,.049,r*.77],[x,y+.048,z],paint,opts,3,8);
    if (!open) cyl(p,'closure','y',[x,y+h+.042,z],r*1.09,.087,10,micro?cream:base);
    else ring(p,'open rim',r*.77,r,y+h,paint,[x,z],12);
  }
}

function lab(p,d) {
  const {id,shape}=d;
  const hard=plasticP(d.color);
  if (shape==='cylinder') return tubeGlass(p,id);
  if (shape==='slide') {
    bevel(p,'thin glass slide',[-.43,0,-.157,.43,.022,.157],.008,glass,GLASS);
    top(p,'frosted handling strip',[-.421,-.148,-.235,.148],.024,paperP(0xcad7d4));
    return;
  }
  if (shape==='tube') {
    cyl(p,'clear glass tube','x',[0,.072,0],.072,.84,12,glass,{...GLASS,open:true});
    if(id==='vacutainer') {
      cyl(p,'rubber seal','x',[.422,.072,0],.074,.051,12,plasticP(0x875e82));
      bevel(p,'sealed kit tray',[-.45,0,-.218,.45,.041,.218],.019,paperP(0xdbdccb));
    }
    return;
  }
  if(shape==='beaker') {
    const petri=id==='petri_dish';
    const h=petri?.098:.58;
    lid(p,'glass base',.325,0,.033,glass);
    cyl(p,'glass side','y',[0,h/2,0],.327,h,16,glass,{...GLASS,open:true},.349);
    ring(p,'glass rim',.315,.350,h,glass,[0,0],16);
    if(petri) cyl(p,'separate lid','y',[.104,.129,.035],.352,.028,16,glass,GLASS);
    else {
      path(p,'pour spout',[[.072,h,-.342],[.03,h,-.459],[-.071,h,-.34]],.024,glass,GLASS);
      for(let n=0;n<4;n++) front(p,'mark',[-.09,.13+n*.09,.055,.14+n*.09],-.343,cream);
    }
    return;
  }
  if(shape==='rack') {
    const micro=id.endsWith('micro'), count=micro?6:4, h=micro?.12:.28;
    p.box('rack base',[-.45,0,-.27,.45,.042,.27],hard);
    const holes=[];
    for(let n=0;n<count;n++) for(const z of (micro?[-.165,0,.165]:[-.135,.135])) {
      const x=(n-(count-1)*.5)*(.79/count);
      holes.push(oval(x,z,micro?.043:.075,micro?.054:.083,10));
    }
    const deck=[[-.45,-.27],[.45,-.27],[.45,.27],[-.45,.27]];
    cutShape(p,'rack deck with socket holes',deck,.047,hard,h-.048,holes);
    for(const x of [-.428,.428]) p.box('rack end',[x-.021,.034,-.27,x+.021,h-.047,.27],hard);
    return;
  }
  if(shape==='stand' && id==='stand_ring') {
    bevel(p,'weighted foot',[-.30,0,-.22,.30,.055,.22],.014,base);
    cyl(p,'vertical support','y',[.16,.452,.03],.027,.83,10,steel);
    tube(p,'clamp arm',V(.16,.61,.03),V(-.154,.61,.03),.026,.026,8,steel);
    ring(p,'retort ring',.106,.141,.61,steel,[-.154,.03],10);
    return;
  }
  bevel(p,'supply tray',[-.42,0,-.34,.42,.08,.34],.033,hard);
  if(id==='chemistry_set') {
    const at = [-.18,-.065];
    profile(p,'small conical flask',[[0,.075],[.105,.075],[.123,.098],[.052,.256],[.051,.329],[.032,.33],[.032,.257],[.097,.105],[0,.105]],glass,{...GLASS,at,sides:12});
    profile(p,'glass measuring cup',[[0,.077],[.086,.077],[.091,.214],[.075,.214],[.069,.099],[0,.099]],glass,{...GLASS,at:[-.291,.194],sides:10});
    bevel(p,'portable hot plate',[.064,.079,-.251,.352,.158,.077],.021,base);
    cyl(p,'burner','y',[.199,.168,-.102],.102,.035,12,steel);
    path(p,'coiled tubing',[[.321,.087,.183],[.237,.094,.265],[.091,.092,.262],[.032,.091,.194],[.141,.095,.151],[.239,.097,.195]],.015,base);
    p.box('tray side',[-.421,.046,-.335,-.376,.134,.335],hard);
    p.box('tray front',[-.419,.043,-.341,.418,.131,-.301],hard);
  } else for(const z of [-.20,0,.20]) {
    path(p,'loose clamp',[[-.25,.12,z-.07],[-.32,.12,z],[ -.23,.12,z+.08],[.34,.12,z+.08]],.026,steel);
  }
}

function bag(p,d) {
  const {id,color}=d;
  const sealed=/vacuum|bag_iv/.test(id);
  const long=id.startsWith('bag_chips');
  const w=id==='bag_chips_small'?.255:id==='bag_chips_large'?.35:.29;
  const h=sealed?.049:id==='dry_bag_large'?.24:.093;
  const contents=id==='plastic_bag_vac';
  const paint=sealed||contents?glass:/nylon|dry/.test(id)?clothP(color):plasticP(long?({bag_chips_small:0xa3554d,bag_chips_medium:0xc1924b,bag_chips_large:0x538681})[id]:color);
  bevel(p,'sealed pouch',[-w,0,-.406,w,h,.406],h*.38,paint,sealed||contents?GLASS:{});
  for (const z of [-.413,.413]) p.box('sealed ends',[-w,.006,z-.031,w,.045,z+.031],paint);
  if(long || /heatpack|mre/.test(id)) {
    const ink=long?({bag_chips_small:0xa3554d,bag_chips_medium:0xc1924b,bag_chips_large:0x538681})[id]:id==='mre_package'?0x6c664b:0xa4615a;
    top(p,'printed sleeve',[-w*.86,-.34,w*.86,.34],h+.002,label(ink,long?'CHIPS':id==='mre_package'?'MRE':'HEAT PACK',d.key));
  }
  if(contents) {
    for(const [x,z] of [[-.132,-.191],[.15,-.082],[-.116,.125],[.12,.236]])
      bevel(p,'vacuum-packed contents',[x-.073,.011,z-.066,x+.073,.042,z+.068],.013,plasticP(0xb38a56));
  }
  if(id==='bag_iv') {
    cyl(p,'port','z',[.086,.035,.446],.035,.100,8,cream);
    top(p,'medical label',[-.19,-.18,.19,.15],.055,label(0xaab19c,'IV',d.key));
  }
}

function box(p,d) {
  const {id,shape,color}=d;
  if(id==='plastic_bag_vac') return bag(p,d);
  if(id==='misc_repairkit'||id==='hair_dye_kit') {
    const repair=id==='misc_repairkit';
    const shell=repair?base:plasticP(color);
    bevel(p,'opened carrying case',[-.44,0,-.315,.44,.071,.32],.029,shell);
    p.box('back rim',[-.441,.058,.259,.441,.163,.32],shell);
    bevel(p,'hinged lid',[-.44,.074,.279,.44,.169,.425],.034,shell);
    for(const x of [-.41,.41]) p.box('end rim',[x-.024,.053,-.302,x+.024,.141,.28],shell);
    if(repair) {
      bevel(p,'precision tool grip',[-.291,.071,-.153,-.171,.139,.178],.021,plasticP(0xc18a5d));
      tube(p,'closed tool tip',V(-.23,.1,-.17),V(-.23,.1,-.248),.014,.012,8,steel);
      for(const x of [.027,.112,.197,.282]) tube(p,'narrow repair tool',V(x,.091,-.211),V(x+.023,.094,.123),.02,.017,8,steel);
    } else {
      cyl(p,'dye tube','z',[-.189,.131,-.037],.066,.353,10,cream);
      cyl(p,'applicator handle','z',[.208,.110,-.067],.029,.41,8,base);
      p.box('brush head',[.141,.075,.102,.278,.136,.211],base);
      for(let k=0;k<5;k++) p.box('bristles',[.15+k*.024,.079,.195,.164+k*.024,.127,.257],plasticP(0x967a6b));
    }
    return;
  }
  if(id==='mess_kit') {
    profile(p,'stacked cook pot',[[0,0],[.283,0],[.329,.063],[.349,.226],[.323,.242],[.289,.069],[0,.069]],steel,{metal:true});
    profile(p,'fitted pan lid',[[0,.213],[.355,.213],[.358,.235],[.324,.278],[0,.29]],steel,{metal:true});
    path(p,'folded wire handle',[[-.288,.188,-.076],[-.468,.165,-.078],[-.478,.165,.075],[-.29,.186,.08]],.021,base);
    return;
  }
  const packed=id.includes('tent_kit');
  const phone=id.includes('phone');
  const tin=id==='mess_kit'||id==='toolbox_workshop_empty';
  const large=id==='large_tent_kit';
  const h=phone?.09:large?.292:packed?.186:.23;
  const z=phone?.34:large?.233:packed?.154:.30;
  const x=phone?.20:.44;
  const paint=packed?clothP(color):tin?steelP(color):plasticP(color);
  bevel(p,'case body',[-x,0,-z,x,h,z],packed?.093:.041,paint);
  if (phone) {
    top(p,'sealing window',[-.151,-.275,.151,.281],h+.002,glass,GLASS);
    for (const x of [-.178,.178]) p.box('rim clamp',[x-.022,.037,-.13,x+.022,h+.024,.08],base);
  } else if(packed) {
    for(const x of [-.23,.23]) path(p,'compression strap',[[x,.064,-z],[x,h+.029,-z*.68],[x,h+.029,z*.68],[x,.064,z]],.023,base);
  } else {
    p.box('lid seam',[-x*.91,h*.71,-z-.003,x*.91,h*.76,-z+.005],base);
    for(const x of [-.23,.23]) p.box('latch',[x-.037,h*.63,-z-.029,x+.037,h*.91,-z+.01],tin?steel:base);
    if(shape==='case'||tin) path(p,'carry handle',[[-.12,h*.62,-z],[ -.082,h*.61,-z-.11],[.082,h*.61,-z-.11],[.12,h*.62,-z]],.020,base);
    else top(p,'box label',[-.36,-.23,.36,.23],h+.002,label(color,d.name,d.key));
  }
}

function aquarium(p,d) {
  const tall=d.id==='aquarium_medium', h=tall?.53:.399, z=tall?.28:.245;
  p.box('bottom frame',[-.45,0,-z,.45,.041,z],base);
  for(const x of [-.437,.437]) p.box('glass end',[x-.010,.042,-z,x+.010,h,z],glass,GLASS);
  for(const edge of [-z,z]) {
    p.box('glass wall',[-.445,.041,edge-.008,.445,h,edge+.008],glass,GLASS);
    p.box('upper frame',[-.45,h-.017,edge-.018,.45,h+.017,edge+.018],base);
  }
  for(const x of [-.438,.438]) p.box('upper end',[x-.018,h-.017,-z,x+.018,h+.017,z],base);
}

function cake(p,d) {
  const cocoa=d.shape==='dark', party=d.shape==='icing';
  const frosting=plasticP(cocoa?0x573b32:party?0xf0dfbf:0xd58b93);
  const edge=[[-.31,.35],[-.28,.41],[.28,.41],[.31,.35],[.024,-.44],[-.024,-.44]];
  for(let k=0;k<5;k++) outline(p,k%2?'frosting layer':'sponge layer',edge,k%2?.042:.069,k%2?frosting:paperP(cocoa?0x805044:0xcb9e64),k*.058);
  outline(p,'iced top',edge,d.shape==='pink'?.114:.064,frosting,.301);
  if(cocoa||party) outline(p,'outer buttercream arc',[[-.298,.341],[-.28,.419],[.28,.419],[.298,.341]],.349,frosting);
  if(party) for(const x of [-.23,-.12,0,.12,.23])
    blob(p,'white buttercream rosette',[.047,.038,.055],[x,.365,.354],frosting,{},3,8);
  if (party) for(let k=0;k<21;k++) {
    const z=-.24+(k*17%56)*.010;
    const x=((k*19%37)-18)*.021*(z+.47);
    p.box('sugar sprinkle',[x-.019,.356,z-.008,x+.021,.369,z+.012],plasticP([0xb85c60,0xe7b858,0x6b8694,0x73916d][k%4]));
  }
  if (d.shape==='pink') top(p,'icing lettering',[-.158,.16,.158,.30],.417,(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0xd58b93);
    ctx.font=`bold ${Math.max(5,Math.floor(h*.76))}px monospace`;
    ctx.fillStyle='#f5dfa9';
    ctx.textBaseline='middle';
    ctx.fillText('GUFF',x+w*.08,y+h*.52,w*.84);
  });
  if(cocoa) for(let k=0;k<5;k++) blob(p,'chocolate rosette',[.037,.029,.037],[(k-2)*.10,.36,.347],frosting,{},3,7);
}

function slab(p,d) {
  const tofu=d.shape==='cheese';
  const fat=plasticP(0xe3c5a3);
  const body=plasticP(d.color);
  const smoked = d.id==='bacon_uncut';
  const edge=smoked?[[-.46,-.241],[.398,-.232],[.46,-.146],[.442,.194],[-.389,.233],[-.46,.148]]
    :[[-.39,-.32],[.21,-.37],[.435,-.23],[.398,.34],[-.234,.32],[-.42,.13]];
  if(tofu) bevel(p,'firm tofu block',[-.43,0,-.34,.43,.32,.34],.037,body);
  else {
    const step=smoked?.033:.054;
    for (let k=0;k<6;k++) outline(p,k%2?'fat streak':'cut meat',edge,step+.004,k%2?fat:body,k*step);
    const rind=plasticP(smoked?0x88573f:0xe4b18c);
    outline(p,'outer rind',edge,smoked?.053:.038,rind,step*6);
    if(smoked) for(const z of [-.119,.018,.128]) path(p,'smoked rind grain',[[-.38,.242,z],[-.117,.252,z+.024],[.31,.247,z-.021]],.012,rind);
  }
}

function sausage(p,d) {
  const pale=d.shape==='pale';
  const shape=Array.from({length:13},(_,i)=>{
    const t=i/12;
    return [-.414+t*.828,pale?.106:.118,-Math.sin(t*Math.PI)*(pale?.137:.206)];
  });
  const casing=plasticP(d.color);
  path(p,'curved casing',shape,pale?.091:.108,casing);
  for(const [x,y,z] of [shape[0],shape.at(-1)]) {
    blob(p,'rounded end',pale?[.092,.092,.092]:[.108,.106,.106],[x,y,z],casing,{},3,9);
    if(d.shape!=='pale') blob(p,'twist in casing',[.032,.037,.032],[x*1.22,y,z+.042],plasticP(shade(d.color,.65)),{},3,7);
  }
}

function oyster(p,d) {
  if (d.shape==='snails') {
    for(const [x,z] of [[-.24,-.21],[.25,-.09],[0,.26]]) {
      blob(p,'snail shell',[.18,.17,.17],[x,.17,z],woodP(0xa47e5b),{},4,9);
      loopShell(p,x,z);
    }
    return;
  }
  const shape=[[-.31,-.22],[-.13,-.43],[.12,-.37],[.25,-.21],[.35,.14],[.18,.35],[-.15,.38],[-.337,.13]];
  outline(p,'lower shell',shape,.13,woodP(0x8a8775));
  outline(p,'upper shell',shape.map(([x,z])=>[x*.94,z*.95]),.071,woodP(0xa8a08d),.124);
  for(const x of [-.18,-.081,.034,.153]) path(p,'shell rib',[[x*.45,.185,-.26],[x,.209,.034],[x*1.16,.185,.289]],.019,woodP(0xaaa18d));
}

function loopShell(p,x,z) {
  const points=Array.from({length:13},(_,k)=>{
    const a=k*.68,r=.022+k*.011;
    return [x+Math.cos(a)*r,.271, z+Math.sin(a)*r];
  });
  path(p,'shell spiral',points,.016,woodP(0x765c48));
}

function fodder(p,d) {
  const hay=woodP(0xaf965b);
  bevel(p,'packed fodder',[-.43,0,-.30,.43,.43,.30],.092,hay);
  for(let n=0;n<16;n++) {
    const z=-.268+(n*41%59)/102,x=-.365+(n*29%70)/108;
    path(p,'dry stem',[[x,.396,z],[x+.12,.45,z+.037],[x+.17,.432,z+.063]],.012,hay);
  }
  for(const x of [-.24,.24]) path(p,'twine',[[x,.021,-.31],[x,.414,-.31],[x,.46,-.23],[x,.46,.23],[x,.41,.31],[x,.021,.31]],.014,woodP(0x7e7850));
}

function pods(p,d) {
  const green=plasticP(d.color);
  if(d.id==='seed_hops') {
    for(const z of [-.25,0,.25]) path(p,'root cutting',[[-.35,.041,z],[ -.12,.052,z+.081],[.12,.065,z+.032],[.36,.036,z-.08]],.040,woodP(0x967555));
    return;
  }
  if(d.id==='pea_pods') {
    // This snapshot's description says shredded kale, despite the item's display name.
    const greens = [0x4f734d,0x68824d,0x466446,0x799158];
    for(let n=0;n<20;n++) {
      const a=n*2.39996;
      const r=.082+Math.sqrt(n/20)*.316;
      const [x,z]=[Math.cos(a)*r,Math.sin(a)*r*.77];
      const turn=1+n*.74;
      const edge=[[-.063,-.03],[-.029,-.029],[0,-.049],[.037,-.034],[.074,-.041],[.046,-.003],[.066,.027],[.012,.017],[-.029,.041],[-.026,.008]];
      const leaf=edge.map(([u,v])=>[x+u*Math.cos(turn)-v*Math.sin(turn),z+u*Math.sin(turn)+v*Math.cos(turn)]);
      cutShape(p,'chopped leaf',leaf,.015,plasticP(greens[n%greens.length]),(n%4)*.009);
      tube(p,'short leaf rib',V(x-.026,(n%4)*.009+.015,z),V(x+.024,(n%4)*.009+.019,z+.013),.005,.004,6,plasticP(0x93a46d));
    }
    return;
  }
  for(const [x,z] of [[-.15,-.26],[.15,.0],[-.12,.25]]) {
    blob(p,'seed pod',[d.id==='pea_pods'?.31:.23,.115,.109],[x,.115,z],green,{},4,9);
    if(d.id==='cholla_bud') {
      for(let n=0;n<7;n++) {
        const a=n*Math.PI*2/7;
        blob(p,'blunt cactus bud scale',[.032,.021,.027],[x+.139*Math.cos(a),.199,z+.06*Math.sin(a)],plasticP(shade(d.color,1.22)),{},3,7);
      }
    } else if(d.id==='hops') for(const a of [-.123,0,.123]) blob(p,'pale bract',[.09,.052,.058],[x+a,.201,z],plasticP(0xa1ae67),{},3,7);
    else path(p,'pod seam',[[x-.22,.115,z],[x-.08,.193,z-.065],[x+.11,.197,z-.053],[x+.245,.113,z]],.016,plasticP(shade(d.color,1.18)));
  }
}

function cutlets(p,d) {
  const {id,shape}=d;
  if(id==='froglegs') {
    for(const s of [-1,1]) {
      const x=s*.224;
      blob(p,'meaty thigh',[.119,.119,.264],[x,.12,-.13],plasticP(0xc88c7c),{},4,8);
      path(p,'lower leg',[[x,.096,.04],[x+.047,.105,.19],[x-.019,.076,.402]],.066,plasticP(0xc69483));
    }
    return;
  }
  if(id==='brain'||id==='lung') {
    const brain=id==='brain', flesh=plasticP(brain?0xba8582:0xc3858c);
    for(const side of [-1,1]) {
      const x=side*.176;
      if(brain) {
        blob(p,'rounded cortex',[.202,.226,.343],[x,.225,.009],flesh,{},5,12);
        for(const z of [-.19,-.061,.075,.197]) path(p,'cortex fold',[[x-.146,.265,z],[x-.102,.352,z-.072],[x+.014,.433,z-.036],[x+.121,.346,z+.043]],.019,plasticP(0xa86d6d));
      } else {
        cutShape(p,'tapered lobe',[[.035,-.33],[.111,-.36],[.273,-.23],[.366,.13],[.321,.314],[.213,.374],[.044,.29]]
          .map(([a,b])=>[a*side,b]),.108,flesh);
        blob(p,'spongy tissue',[.126,.123,.25],[x,.127,.086],flesh,{},4,11);
      }
    }
    return;
  }
  const organ=shape==='organs', single=id==='fish_scrap';
  const tone=id==='brain'?0xbc8580:id==='lung'?0xc17e82:id.includes('lobster')?0xc98973:d.color;
  const paint=plasticP(tone);
  const where=single?[[0,0]]:organ?[[-.187,-.03],[.188,.042]]:[[-.25,-.15],[.229,-.214],[-.17,.219],[.177,.219]];
  for(const [x,z] of where) lump(p,organ?'section of organ':'dry piece',[single?.42:organ?.246:.19,organ?.19:single?.15:.081,single?.26:organ?.35:.168],paint,d.id+x,{},[x,0,z]);
}

function breakfast(p) {
  const toast=plasticP(0xb27d43);
  for(let k=0;k<3;k++) cyl(p,'fluffy pancake','y',[k*.014,.043+k*.081,k*.018],.425-k*.014,.082,14,toast);
  blob(p,'maple syrup',[.238,.015,.205],[.04,.249,-.008],plasticP(0xa66c39),{},3,10);
  bevel(p,'butter pat',[-.088,.248,-.102,.055,.287,.038],.013,cream);
}

function drink(p,d) {
  const {color,shape}=d;
  if (shape==='water') {
    const clear=d.id==='water_clean';
    const paint=plasticP(clear?0x729eab:color);
    outline(p,'shallow spilled water',[[-.43,-.079],[-.30,-.26],[.10,-.34],[.33,-.21],[.435,.083],[.27,.266],[-.133,.31],[-.38,.205]],.019,paint);
    for (const [x,z] of [[-.23,-.09],[.22,.094]]) top(p,'surface reflection',[x-.075,z-.014,x+.075,z+.014],.020,flat(clear?0xb4d5d6:0xa49c67));
    return;
  }
  if (shape==='soda') return foodTin(p,{r:.228,h:.83,label:label(color,d.name,d.key),ring:true});
  if (d.id==='oj') {
    bevel(p,'juice carton',[-.213,0,-.198,.213,.70,.198],.025,paperP(0xd8b26c));
    bevel(p,'folded carton top',[-.213,.66,-.20,.213,.803,.199],.051,paperP(0xe1c089));
    lid(p,'carton cap',.060,.79,.052,cream);
    front(p,'orange juice label',[-.167,.123,.167,.60],-.2,label(color,'ORANGE JUICE',d.key));
    return;
  }
  cyl(p,'drink bottle','y',[0,.29,0],.208,.58,12,plasticP(color));
  cyl(p,'tapered shoulder','y',[0,.642,0],.208,.124,12,plasticP(color),{},.095);
  lid(p,'neck',.095,.702,.080,plasticP(color));
  lid(p,'cap',.102,.78,.059,cream);
  front(p,'drink label',[-.097,.18,.097,.50],-.208,label(shade(color,.76),d.name,d.key));
}

export const workshopGoods = {
  bottle,vessel,cylinder,lab,box,bag,aquarium,
  rings(p) {
    const depth = .008;
    for (const x of [-.30,0,.30]) for (const z of [-.15,.15]) {
      ring(p,'plastic holder',.119,.155,depth,cream,[x,z],14);
      cyl(p,'outer edge','y',[x,depth/2,z],.155,depth,14,cream,{open:true},.155,0);
    }
  },
  balloon(p,d) {
    outline(p,'deflated latex',[[-.14,-.36],[.12,-.36],[.259,-.176],[.218,.15],[.076,.29],[.047,.39],[-.038,.39],[-.076,.27],[-.223,.14],[-.251,-.09]],.054,plasticP(d.color));
    cyl(p,'rolled opening','z',[.006,.033,.398],.065,.046,10,plasticP(shade(d.color,.77)),{open:true});
  },
  cake,slab,sausage,oyster,fodder,pods,cutlets,breakfast,drink,
  can(p,d) {
    const sardine=d.id==='can_sardine';
    if(sardine) {
      bevel(p,'sardine tin',[-.442,0,-.275,.442,.196,.275],.071,steel);
      bevel(p,'rolled tin lid',[-.444,.177,-.282,.444,.218,.282],.050,steel);
      top(p,'sardine label',[-.382,-.20,.382,.20],.220,label(0x52737e,'SARDINES',d.key));
      ring(p,'pull tab',.043,.077,.227,steel,[.252,.056],9);
    } else foodTin(p,{r:.36,h:.53,label:label(0x8e614b,'CHICKEN',d.key),ring:true});
  },
  egg(p) { blob(p,'elongated egg',[.135,.116,.439],[0,.116,0],cream,{},4,10); },
  candy(p) {
    for(const [z,color] of [[-.242,0xc56b79],[-.058,0x8fa268],[.133,0xbe9e61],[.297,0x749ea3]]) {
      cyl(p,'paper candy stick','x',[.005,.046,z],.046,.822,8,paperP(color));
      for(const x of [-.397,.397]) cyl(p,'sealed tip','x',[x,.046,z],.047,.036,8,cream);
    }
  },
};
