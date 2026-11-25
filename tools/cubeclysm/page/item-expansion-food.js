import { blob, loop, pile, rng, speckle, stoneP } from './item-kit.js';
import { V, bevel, clothP, cyl, fill, flat, front, label, outline, paperP, path, plasticP, poly, shade, top, tube } from './common-loot-kit.js';
import { produce } from './item-expansion-produce.js';
import { soup } from './item-expansion-soups.js';
import { drawCannedFood } from './common-loot-canned.js';

const shell = (p, name, ratios, color, at = [0, 0, 0]) => {
  const [x, y, z] = ratios;
  blob(p, name, ratios, [at[0], at[1] + y, at[2]], plasticP(color), {}, 5, 10);
};

function crumbs(p,d) {
  const r = rng(d.id);
  if (/^spicebush_berries/.test(d.id)) {
    produce.berries(p,d);
    return;
  }
  if (d.id==='sprinkles') {
    const colors=[0xd37067,0x7195a1,0xcfaa52,0x87a665,0xbc83ad];
    for(let i=0;i<19;i++) {
      const x=(r()-.5)*.75,z=(r()-.5)*.75;
      tube(p,'colored sugar strand',V(x,.028,z),V(x+.044,.028,z+.021),.018,.018,6,plasticP(colors[i%colors.length]));
    }
    return;
  }
  if(d.id==='chem_agar') {
    for(let i=0;i<10;i++) {
      const a=i*2.4, dist=.34*Math.sqrt(i/10), x=Math.cos(a)*dist, z=Math.sin(a)*dist;
      outline(p,'clear agar flake',[[x-.067,z],[x-.025,z-.045],[x+.07,z-.019],[x+.043,z+.051]],.012,plasticP(shade(0xd1dcd0,.88+r()*.16)),.006*(i%4));
    }
    return;
  }
  if(d.id==='corn'||d.id==='popcorn_cob') return produce.corn(p,d);
  if(d.id==='empty_corn_cob') {
    cyl(p,'cob core','x',[0,.15,0],.14,.90,10,plasticP(0xb69b62),{},.093);
    return;
  }
  if (d.family === 'powder') {
    pile(p,'loose material',.46,.18,stoneP(d.color),d.id);
    return;
  }
  const seed = d.family === 'seed';
  for (let i=0;i<(seed?9:12);i++) {
    const a=i*2.4, dist=.37*Math.sqrt(i/12), size=(seed?.05:.08)+r()*.043;
    const black=d.id==='seed_canola';
    const color=black?0x3f3837:d.color;
    shell(p,'grain '+i,[size,size*(black?.83:seed?.43:.69),size*(black?1.04:seed?1.44:1.1)],shade(color,.74+r()*.42),[Math.sin(a)*dist,0,Math.cos(a)*dist]);
  }
}

function bread(p,d) {
  const round = /bun|roll/.test(d.name.toLowerCase());
  const flatBread = /flatbread|tortilla/.test(d.name.toLowerCase());
  const cracker = d.family === 'cracker';
  const crust=plasticP(flatBread?0xc5a373:0xa47745);
  const x=round?.39:.31, y=flatBread||cracker?.09:.29, z=.48;
  if(/tortilla/.test(d.id)) cyl(p,'round flatbread','y',[0,.023,0],.46,.046,14,crust);
  else bevel(p,'baked crust',[-x,0,-z,x,y,z],.06,crust);
  if(!flatBread && !cracker) for (let k=-1;k<=1;k++) {
    const cz=k*.23;
    path(p,'scored seam '+k,[[-x*.67,y,cz-.052],[0,y+.011,cz],[x*.65,y,cz+.060]],.023,plasticP(0xd6ad77));
  }
  if (cracker) for(let k=0;k<8;k++) {
    const x=(k%4-1.5)*.125,z=(Math.floor(k/4)-.5)*.25;
    cyl(p,'docking mark','y',[x,y+.001,z],.022,.004,6,flat(0x7c6243));
  }
}

function meat(p,d) {
  const n=d.name.toLowerCase(), cooked=/cooked|fried|deviled|onion/.test(n);
  const color = cooked ? 0x81533f : /tainted|putrid/.test(n) ? 0x687054 : /mi-go/.test(n) ? 0xc97893 : /poultry|fish|lobster|mollusk/.test(n) ? 0xcc8b78 : 0xa4514d;
  if (/desiccated/.test(n)) {
    outline(p,'drained strip of muscle',[[-.44,-.08],[-.30,-.16],[.28,-.11],[.47,.019],[.32,.17],[-.31,.145]],.065,plasticP(0x704944));
    for(let k=0;k<4;k++) path(p,'wrinkled muscle fiber',[[-.35,.065,-.073+k*.047],[-.10,.081,-.052+k*.047],[.34,.067,-.032+k*.046]],.012,plasticP(0x875d4d));
    return;
  }
  if (/heart/.test(n)) {
    shell(p,'muscular body',[.32,.29,.45],color);
    for(const x of [-.14,.05,.17]) tube(p,'vessel',V(x,.39,-.22),V(x,.61,-.38),.064,.051,7,plasticP(shade(color,1.15)));
    return;
  }
  if (/kidney/.test(n)) {
    path(p,'curved kidney',[[-.23,.15,-.28],[.11,.17,-.31],[.26,.17,0],[.18,.16,.26],[-.11,.14,.34]],.14,plasticP(color));
    return;
  }
  const thin = /fillet|liver/.test(n);
  const h=thin?.14:.23;
  outline(p,thin?'fillet or lobe':'cut of meat',[[-.42,-.24],[-.12,-.43],[.40,-.21],[.48,.16],[.14,.40],[-.42,.33]],h,plasticP(color));
  path(p,cooked?'browned edge':'pale outer edge',[[-.41,h,-.22],[-.14,h,-.40],[.21,h,-.27],[.39,h,-.15]],.027,plasticP(cooked?0x684635:0xd8b091));
}

function sandwich(p,d) {
  const bun=/burger|\bsub\b/.test(d.name.toLowerCase());
  const bread=plasticP(0xc9a36e);
  if(bun) {
    bevel(p,'bottom bread',[-.44,0,-.41,.44,.11,.41],.08,bread);
    bevel(p,'top bun',[-.44,.28,-.42,.44,.45,.42],.11,bread);
  } else {
    const slice=[[-.42,-.34],[-.21,-.45],[.41,-.40],[.44,.37],[-.37,.40]];
    outline(p,'lower slice',slice,.10,bread);
    outline(p,'upper slice',slice,.12,bread,.25);
  }
  const n=d.name.toLowerCase();
  const filling=/cheese/.test(n)?0xe3b259:/jelly/.test(n)||d.id==='sandwich_pbj'?0x94546e:/fluff|egg salad/.test(n)?0xded0a8:/vegg/.test(n)?0x9f5540:/chicken|fish/.test(n)?0xc59170:0x8b5948;
  p.box('filling',[-.42,.106,-.35,.42,.235,.37],plasticP(filling));
  if (/cheese|reuben|vegg|deluxe/.test(n)) p.box('second filling',[-.39,.206,-.39,.40,.241,.40],plasticP(/cheese|reuben/.test(n)?0xe6b365:0x768a4a));
  if (/grilled/.test(n)) for (const x of [-.19,0,.19]) p.box('toasted stripe',[x-.016,.371,-.27,x+.018,.376,.24],plasticP(0xa47643));
}

function pouch(p,d) {
  const color = d.family==='ration'?0x9e8959:d.color;
  bevel(p,'sealed flexible pouch',[-.31,0,-.46,.31,.15,.46],.05,plasticP(color));
  for(const z of [-.44,.44]) p.box('sealing strip',[-.32,.018,z-.025,.32,.060,z+.025],plasticP(shade(color,.65)));
  top(p,'printed panel',[-.22,-.34,.22,.34],.151,label(shade(color,.8),d.name,d.key));
}

function chocolate(p,d) {
  const ration=d.id==='chocolate_military';
  const h=ration?.171:.106, width=ration?.248:.183;
  const dark=plasticP(ration?0x654b3a:0x6a4235);
  const mold=plasticP(ration?0x785943:0x845040);
  const wrapper=paperP(ration?0x818354:0xab4b4e);
  bevel(p,'solid chocolate bar',[-.47,0,-width,.46,h,width],.022,dark);
  for(const z of [-width*.48,width*.48]) for(let k=0;k<4;k++) {
    const x=.025+k*.106;
    bevel(p,'molded chocolate segment',[x-.048,h-.019,z-width*.43,x+.048,h+.023,z+width*.43],.011,mold);
  }
  bevel(p,'paper wrapped half',[-.493,0,-width-.018,.052,h+.026,width+.018],.014,wrapper);
  bevel(p,'crimped paper end',[-.497,.015,-width-.02,-.453,h+.02,width+.02],.012,wrapper);
  const yLabel=h+.027, zLabel=width*.86;
  const face=[V(.037,yLabel,-zLabel),V(-.442,yLabel,-zLabel),V(-.442,yLabel,zLabel),V(.037,yLabel,zLabel)];
  poly(p,'printed chocolate wrapper',face,V(0,1,0),(ctx,x,y,w,depth)=>{
    fill(ctx,x,y,w,depth,ration?0x727751:0xa04850);
    fill(ctx,x,y+depth*.73,w,depth*.11,ration?0xb0a374:0xc88f63);
    ctx.fillStyle='#f1dfb3';
    ctx.font=`bold ${Math.round(depth*.19)}px sans-serif`;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('CHOCOLATE',x+w/2,y+depth*.55,w*.94);
    if (ration) {
      ctx.font=`bold ${Math.round(depth*.125)}px sans-serif`;
      ctx.fillText('RATION BAR',x+w/2,y+depth*.27,w*.83);
    }
  },{ppm:120});
}

function fries(p,d) {
  const cheese=d.id==='cheese_fries';
  const rand=rng(d.id);
  const fried=0xe3ac55;
  if (cheese) {
    const tray=paperP(0xcab18a);
    bevel(p,'paper tray floor',[-.47,0,-.306,.47,.044,.306],.03,tray);
    for(const z of [-.302,.302]) bevel(p,'paper tray side',[-.468,.03,z-.016,.468,.142,z+.016],.012,tray);
    for(const x of [-.451,.451]) bevel(p,'paper tray end',[x-.025,.028,-.309,x+.025,.127,.309],.012,tray);
  } else {
    const red=paperP(0xb25043);
    bevel(p,'red paper fry scoop',[-.333,0,-.207,.333,.279,.192],.04,red);
    bevel(p,'high folded back',[-.348,.19,.148,.348,.443,.203],.022,red);
    front(p,'gold accent on fry carton',[-.247,.068,.247,.223],-.2077,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0xac4e44);
      fill(ctx,x+w*.24,y+h*.20,w*.52,h*.47,0xe3b66a);
      fill(ctx,x+w*.31,y+h*.30,w*.38,h*.26,0xb56546);
    },{ppm:90});
  }
  for(let k=0;k<(cheese?24:20);k++) {
    const x=(rand()-.5)*(cheese?.69:.52),z=(rand()-.5)*(cheese?.425:.26);
    const parent=p.group('potato strip angle',cheese
      ? {at:[x,.064+k%4*.036,z],rotY:(rand()-.5)*3.1}
      : {at:[x,.22,z],rotX:(rand()-.5)*.76,rotZ:(rand()-.5)*.73});
    const paint=plasticP(shade(fried,.89+rand()*.24));
    bevel(p,'squared potato strip',cheese?[-.127,0,-.038,.139,.046,.036]:
      [-.039,0,-.039,.036,.33+rand()*.23,.037],.011,paint,{parent});
  }
  if (cheese) {
    const melt=plasticP(0xeeb33b);
    for(const z of [-.135,.03,.176]) {
      path(p,'melted cheese ribbons',[[-.31,.167,z],[-.215,.197,z-.048],[-.06,.209,z+.036],
        [.062,.212,z-.031],[.225,.206,z+.041],[.294,.164,z]],.031,melt);
    }
  }
}

function cornDog(p,d) {
  const frozen=d.id==='corndogs_frozen', home=d.id==='corndogs_homemade';
  const crust=frozen?0xcaa370:home?0xbb7845:0xc98a48;
  const batter=speckle(d.id,crust,[shade(crust,.81),frozen?0xe5dfcf:shade(crust,1.23)],.36);
  blob(p,'oval battered sausage',[.375,.137,.141],[-.106,.140,0],batter,{},6,13);
  bevel(p,'flat wood stick',[.185,.102,-.034,.487,.139,.034],.013,plasticP(0xb89668));
  if (home) {
    for(let k=0;k<6;k++) {
      blob(p,'irregular fried batter bulbs',[.076,.044,.056],[-.329+k*.09,.239-k%2*.021,.039*Math.sin(k)],
        batter,{},3,7);
    }
  } else if (frozen) {
    for(const [x,z] of [[-.33,0],[-.24,.051],[-.15,-.063],[-.02,.012],[.08,.05]]) {
      blob(p,'pale frost crystal',[.021,.009,.023],[x,.266,z],flat(0xe2d9bd),{},3,6);
    }
  }
}

const treats = {
  chocolate, chocolate_military:chocolate,
  fries, cheese_fries:fries,
  corndogs_cooked:cornDog, corndogs_frozen:cornDog, corndogs_homemade:cornDog,
  cookies(p) {
    const dough=speckle('golden baked cookie',0xb98b54,[0xd9ab68,0x9b7047],.33);
    const outlinePoints=Array.from({length:13},(_,i)=>{
      const a=i*2*Math.PI/13,r=.449+i%3*.016;
      return [r*Math.cos(a),r*Math.sin(a)];
    });
    outline(p,'uneven baked cookie edge',outlinePoints,.104,dough);
    outline(p,'golden cookie surface',outlinePoints.map(([x,z])=>[x*.89,z*.89]),.037,dough,.100);
    const rand=rng('cookie chocolate chips');
    for(let k=0;k<13;k++) {
      const a=k*2.4,r=.347*Math.sqrt(k/13),s=.029+rand()*.015;
      blob(p,'small dark chocolate chip',[s,.021,s*.83],[r*Math.cos(a),.133,r*Math.sin(a)],plasticP(0x674737),{},3,6);
    }
  },
  caramel_apple(p) {
    blob(p,'red crown of caramel apple',[.299,.304,.291],[-.157,.304,0],plasticP(0xa74337),{},6,12);
    blob(p,'thick amber caramel coating',[.327,.287,.324],[-.157,.287,0],plasticP(0xb67a46),{},6,12);
    for(let k=0;k<7;k++) {
      const a=k*2.4;
      blob(p,'soft caramel at apple shoulder',[.082,.060,.071],[-.156+.160*Math.cos(a),.516+.019*Math.sin(k),.175*Math.sin(a)],
        plasticP(k%2?0xb57241:0xc1844e),{},3,7);
    }
    tube(p,'wooden apple stick',V(.028,.488,.013),V(.491,.526,.043),.029,.024,7,plasticP(0xc1a070));
  },
  candy_bracelet(p) {
    loop(p,'cotton bracelet thread',[0,.055,0],.383,.013,flat(0xdbcdb5),{},18);
    const colors=[0xdbaf97,0xe0c978,0x9dba9d,0xc49dbb,0xd7ac83,0xa6bfd2];
    for(let k=0;k<17;k++) {
      const a=k*2*Math.PI/17,s=.074;
      blob(p,'pastel compressed candy bead',[s,.054,s],[Math.cos(a)*.381,.054,Math.sin(a)*.381],
        plasticP(colors[k%colors.length]),{},3,8);
    }
  },
  chocpretzels(p) {
    const glaze=plasticP(0x674739);
    const coords=[[-.238,-.128],[-.278,.043],[-.183,.203],[0,.245],[.181,.203],[.274,.046],
      [.228,-.112],[.10,-.167],[-.02,-.079],[-.12,.063],[-.229,.081],[-.233,-.066],[-.157,-.16],[-.06,-.131],
      [.118,.063],[.229,.083]];
    for(const [x,z,turn] of [[-.21,-.124,-.23],[.205,.116,.30]]) {
      const c=Math.cos(turn),s=Math.sin(turn);
      path(p,'bent chocolate-coated pretzel twist',coords.map(([u,v])=>[x+c*u-s*v,.046,z+s*u+c*v]),.042,glaze);
    }
  },
  choc_waffles(p) {
    const crust=plasticP(0xa26941), baked=speckle('waffle chocolate chips',0xbb8151,[0x704637,0xd39a60],.25);
    bevel(p,'chocolate waffle base',[-.465,0,-.387,.465,.102,.387],.034,crust);
    for(let i=0;i<6;i++) {
      const x=-.423+i*.169;
      bevel(p,'baked waffle rib',[x-.026,.089,-.354,x+.026,.144,.354],.011,baked);
    }
    for(let i=0;i<5;i++) {
      const z=-.348+i*.174;
      bevel(p,'crossed waffle rib',[-.426,.090,z-.027,.427,.146,z+.026],.011,baked);
    }
    path(p,'amber syrup line',[[-.357,.144,-.226],[-.193,.153,-.12],[.029,.154,-.082],[.101,.145,.108],[.335,.152,.23]],.019,plasticP(0xd4a05f));
  },
  crepe_plain(p) {
    const arc=Array.from({length:15},(_,i)=>{
      const a=i*Math.PI/14;
      return [Math.cos(a)*.481,Math.sin(a)*.434-.202];
    });
    const crepe=speckle('browned crepe patches',0xd7aa6c,[0xaf7948,0xe3ba81],.33);
    outline(p,'thin folded lower crepe layer',arc,.024,plasticP(0xb38252));
    outline(p,'thin folded upper crepe layer',arc.map(([x,z])=>[x*.978,z+.011]),.027,crepe,.023);
    path(p,'soft rolled crepe crease',[[-.411,.039,-.192],[-.21,.054,-.195],[.03,.050,-.187],[.291,.050,-.195],[.445,.037,-.181]],.012,crepe);
  },
};

const fruitCans = {
  can_peach:[.041,.072], can_pineapple:[.042,.066], apple_canned:[.033,.051], can_coconut:[.037,.082],
};

export const food = {
  treat(p,d) {
    const can=fruitCans[d.id];
    if (can) drawCannedFood(p,d,...can);
    else treats[d.id](p,d);
  },
  grain:crumbs, seed:crumbs,
  powder:crumbs, bread, cracker:bread, meat, sandwich, ration:pouch,
  egg: (p,d)=>shell(p,'egg shell',[.35,.33,.48],d.id==='egg_robin'?0x87bac9:d.color),
  mushroom(p,d) {
    if(d.id==='mushroom_ketchup') {
      const condiment=plasticP(0x785549);
      cyl(p,'condiment bottle','y',[0,.37,0],.19,.74,12,condiment);
      cyl(p,'flared neck','y',[0,.784,0],.19,.088,12,condiment,{},.081);
      cyl(p,'sealed cap','y',[0,.853,0],.086,.057,10,plasticP(0xd6ccb0));
      return;
    }
    cyl(p,'stem','y',[0,.17,0],.11,.34,8,plasticP(0xdac6a9),.085);
    if (/morel/.test(d.id)) {
      shell(p,'conical honeycomb cap',[.248,.29,.229],0x987948,[0,.26,0]);
      for(let k=0;k<18;k++) {
        const a=k*2.4, y=.38+(k%6)*.062, r=.17+(k%3)*.021;
        blob(p,'dark pit',[.044,.034,.041],[Math.cos(a)*r,y,Math.sin(a)*r],plasticP(0x6c5134),{},3,7);
      }
      return;
    }
    shell(p,'cap',[.43,.17,.41],d.color,[0,.28,0]);
    cyl(p,'gill underside','y',[0,.291,0],.35,.035,12,paperP(0xd2ba95));
  },
  bowl:soup,
  tablet(p,d) {
    const long = /naproxen|tramadol|caplet/.test(d.id);
    if(long) bevel(p,'oblong tablet',[-.43,0,-.23,.43,.21,.23],.10,plasticP(d.color));
    else cyl(p,'pressed tablet','y',[0,.11,0],.43,.22,12,paperP(d.color));
    top(p,'score',[-.019,-.19,.019,.19],.221,flat(shade(d.color,.66)));
  },
};

