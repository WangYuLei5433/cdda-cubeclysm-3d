import { blob, denimP, knitP, loop, speckle } from './item-kit.js';
import { GLASS, V, bevel, clothP, cyl, fill, flat, label, outline, path, plasticP, rubber, shade, steelP, top, tube } from './common-loot-kit.js';
import { wear } from './common-loot-wear.js';
import { cutShape, oval, profile } from './item-workshop-kit.js';

const ivory = clothP(0xe1dac8);
const metal = steelP(0xa1a4a2);
const colors = { coat_lab: 0xdfddd2, karate_gi: 0xe9e5d8, judo_gi: 0xe3e0d6, thawb: 0xe7e0d0, cassock: 0x373434, jacket_jean: 0x557189, vest_jean: 0x587389, tacjacket: 0x62664a, jacket_army: 0x696a47 };

function weave(color, pattern) {
  return (ctx, x, y, w, h) => {
    clothP(color)(ctx, x, y, w, h, 'top');
    for (let a = 0; a < w; a += 6) fill(ctx, x + a, y, 2, h, shade(color, .78));
    for (let b = 0; b < h; b += 6) fill(ctx, x, y + b, w, 2, shade(color, pattern === 'plaid' ? 1.23 : .87));
  };
}

function coat(p, d) {
  const { id, shape } = d;
  if (/^wool_suit/.test(id) || ['suit', 'tux'].includes(id)) return suit(p, { ...d, shape: 'slim' });
  const color = colors[id] ?? d.color;
  const long = /long|fur/.test(shape) || /duster|trenchcoat|yukata|kimono/.test(id);
  const vest = shape === 'vest';
  const wrap = shape === 'wrap' || id === 'robe';
  const h = /winter|ski|fur/.test(id) ? .085 : .043;
  const end = /coat_winter|peacoat/.test(id) ? .25 : id === 'coat_faux_fur' ? .31
    : /kimono|thawb|greatcoat|duster|cassock/.test(id) ? .53 : long ? .44 : .245;
  const edge = clothP(shade(color, .70));
  const leather = /leather/.test(id);
  const cloth = id === 'tacjacket' ? speckle(id,color,[0x4c533e,0x747955,0x8c805b],.48)
    : /flannel/.test(id) ? weave(color, 'plaid')
    : /jean/.test(id) ? denimP(color) : /wool|peacoat|fur/.test(id) ? knitP(color)
    : leather || shape==='shell' || id==='apron_plastic' ? plasticP(color) : clothP(color);
  if (shape === 'bib') {
    outline(p, 'apron panel', [[-.16,-.31],[.16,-.31],[.19,-.11],[.36,.08],[.34,.43],[-.34,.43],[-.36,.08],[-.19,-.11]], .028, cloth);
    path(p, 'neck loop', [[-.13,.012,-.31],[-.15,.015,-.43],[.02,.018,-.46],[.13,.015,-.40],[.13,.012,-.31]], .019, edge);
    for (const sign of [-1,1]) path(p, 'waist tie', [[sign*.30,.016,.056],[sign*.43,.02,.17],[sign*.34,.015,.29]], .012, edge);
    return;
  }
  if (shape === 'cape') {
    const poncho = id === 'poncho';
    const rain = id === 'folding_poncho';
    const hem = poncho ? .32 : .49;
    const paint = poncho ? knitP(color) : rain ? plasticP(color) : cloth;
    cutShape(p, 'draped cape', [[-.16,-.37],[.16,-.37],[.32,-.25],[.46,hem-.11],[.23,hem],[-.23,hem],[-.46,hem-.11],[-.32,-.25]],
      rain ? .017 : h, paint, 0, poncho ? [oval(0,-.18,.115,.102)] : []);
    if (!poncho) {
      fabricHood(p, 'folded hood', -.043, paint, edge);
      path(p, rain?'sealed hem':'neck tie', [[-.145,.040,-.21],[0,.046,-.15],[.145,.04,-.21]], .011, edge);
      if (!rain) p.box('cloak clasp',[-.027,.051,-.175,.027,.071,-.137],metal);
    }
    return;
  }
  const half = long ? .26 : .22;
  cutShape(p, 'coat body', [[-.20,-.263],[-.091,-.28],[0,-.192],[.091,-.28],[.20,-.263],
    [.192,-.156],[.22,.06],[half,end],[.018,end],[0,end-.065],[-.018,end],[-half,end],[-.22,.06],[-.192,-.156]], h, cloth);
  for (const side of [-1,1]) {
    if (!vest) {
      const wideCuff = wrap || id==='thawb';
      const z0 = wideCuff ? .024 : .108;
      const z1 = wideCuff ? .242 : .181;
      const sleeve = [[.175,-.248],[.276,-.262],[wideCuff?.452:.421,z0],[wideCuff?.29:.314,z1],[.235,-.075],[.176,-.114]];
      cutShape(p,'sleeve',sleeve.map(([x,z]) => [x*side,z]),h*.86,id==='jacket_varsity'?ivory:cloth);
      path(p,'cuff',[[side*(wideCuff?.31:.327),h*.79,z1-.013],[side*(wideCuff?.435:.405),h*.79,z0+.006]],.016,edge);
    }
    if (id === 'jacket_varsity') {
      const x = side*.132;
      top(p,'rib knit pocket welt',[x-.037,.022,x+.037,.041],h+.001,ivory);
    }
    if (!/thawb|cassock/.test(id)) outline(p, 'lapel', [[.03,.012],[.07,-.215],[.155,-.207],[.121,-.106]].map(([x,z]) => [x*side,z]), .009, edge, h);
    const pockets = /thawb|cassock|robe/.test(id) ? 0 : /duster|tacjacket|army|vest/.test(id) ? 2 : 1;
    for (let n=0; n<pockets; n++) {
      const z = (long ? .102 : .087) - n*.193;
      const x = side*.133, w = /ski|duster|winter|peacoat|greatcoat/.test(id) ? .065 : .045;
      bevel(p,'patch pocket',[x-w,h-.002,z,x+w,h+.019,z+.085],.009,clothP(shade(color,leather?.83:.92)));
      p.box('pocket welt',[x-w,h+.015,z-.008,x+w,h+.023,z+.011],edge);
    }
  }
  if (wrap) {
    path(p, 'crossed lapel', [[-.13,h,-.21],[-.085,h+.012,-.092],[.135,h+.012,.12]], .015, edge);
    const sash = clothP(id.endsWith('_gi') ? 0xe5dbbf : id==='kimono' ? 0xb29162 : shade(color,.52));
    p.box('tied sash',[-.215,h,.065,.215,h+.021,id==='kimono'?.144:.109],sash);
    bevel(p,'sash knot',[-.041,h+.018,.063,.04,h+.041,.113],.008,sash);
    path(p,'sash ends',[[.0,h+.038,.089],[-.047,h+.026,.161],[-.087,h+.018,.216]],.016,sash);
  } else {
    const zip = /jacket|tac/.test(id) && id !== 'jacket_varsity';
    if (zip) p.box('zipper track', [-.009,h,-.15,.009,h+.008,end-.015], metal);
    else for (let k=0;k<(id==='cassock'?7:4);k++) {
      for (const x of /peacoat|greatcoat/.test(id) ? [-.063,.063] : [.023])
        cyl(p, 'button', 'y', [x,h+.006,-.075+k*(end+.035)/(id==='cassock'?7:4)], .013,.012,8,edge);
    }
  }
  if (/jacket_light|windbreaker|coat_winter|ski_jacket/.test(id)) {
    fabricHood(p,'hood',-.009,cloth,edge);
  }
  if (id === 'coat_winter' || id === 'ski_jacket') {
    for (const z of [-.135,-.043,.049,.141]) {
      for (const side of [-1,1]) {
        const x = side*.106;
        bevel(p,'quilted insulation',[x-.091,h-.014,z,x+.091,h+.018,z+.082],.013,cloth);
      }
    }
  }
  if (id === 'jacket_army') {
    path(p,'waist drawstring',[[-.21,h,.095],[-.144,h+.006,.059],[.136,h+.006,.059],[.218,h,.09]],.008,edge);
    for (const x of [-.18,.18]) path(p,'drawstring end',[[x,h+.009,.064],[x*.91,h+.017,.146],[x*1.07,h+.01,.176]],.006,edge);
  }
  if (id === 'cassock') p.box('clerical collar',[-.054,.021,-.246,.054,.060,-.222],ivory);
  if (id === 'tacjacket') {
    for (const x of [-.15,.08]) for (const z of [-.105,-.069,-.033])
      p.box('attachment webbing',[x,h+.002,z,x+.073,h+.014,z+.011],edge);
  }
  if (id === 'coat_lab') {
    bevel(p,'pocket protector',[.075,h,-.16,.153,h+.028,-.071],.007,plasticP(0xada9a0));
    for(const x of [.093,.121]) p.box('pocket pen',[x,h+.023,-.173,x+.013,h+.039,-.091],plasticP(0x536b83));
  }
}

function fabricHood(p, name, offset, paint, lining) {
  const rim = oval(0,-.342+offset,.124,.110,12);
  cutShape(p,name,rim,.068,paint,.007,[oval(0,-.344+offset,.080,.066,10)]);
  path(p,'hood facing',[[-.087,.070,-.333+offset],[0,.079,-.279+offset],[.087,.070,-.333+offset]],.014,lining);
}

function suit(p, d) {
  const { id, shape, color } = d;
  const h = id === 'touring_suit' ? .057 : .032;
  const denim = id === 'denim_overalls';
  const uniform = id === 'suit' || id === 'tux';
  const leather = id === 'touring_suit';
  const fabric = denim ? denimP(0x57758a) : id === 'wool_suit' ? weave(color, 'plaid') : leather ? plasticP(0x57464b) : clothP(color);
  const edge = clothP(shade(color,.67));
  const shoulder = denim ? [[-.112,-.381],[-.111,-.501],[-.060,-.501],[-.060,-.395],[.061,-.395],[.061,-.499],[.112,-.499],[.112,-.38]]
    : [[-.141,-.410],[-.083,-.462],[-.049,-.375],[.049,-.375],[.083,-.462],[.141,-.410]];
  const waist = shape==='short' ? [[.112,-.24],[.163,-.178],[.069,-.141],[.025,-.090],[-.025,-.090],[-.069,-.141],[-.163,-.178],[-.112,-.24]]
    : [[.108,-.21],[.141,-.115],[-.141,-.115],[-.108,-.21]];
  cutShape(p,'tailored torso',[...shoulder,...waist],h,fabric);
  for (const s of [-1,1]) {
    if (shape !== 'short' && id !== 'unitard' && !denim) outline(p, 'sleeve', [[.108,-.43],[.167,-.448],[.317,-.105],[.263,-.080],[.107,-.29]].map(([x,z]) => [s*x,z]), h*.94, fabric);
    if (shape !== 'short') {
      outline(p, 'trouser leg', [[.013,-.14],[.139,-.145],[.132,.43],[.054,.46]].map(([x,z]) => [s*x,z]), h*.94, fabric);
      if (leather) {
        const x = .088*s;
        bevel(p,'knee pad',[x-.044,h-.005,.17,x+.044,h+.035,.28],.018,rubber);
        bevel(p,'shoulder guard',[s*.22-.045,h-.005,-.362,s*.22+.045,h+.043,-.274],.019,rubber);
        bevel(p,'elbow guard',[s*.275-.041,h-.006,-.201,s*.275+.041,h+.025,-.151],.016,rubber);
      }
    }
  }
  if (uniform) {
    outline(p, 'shirt bib', [[-.068,-.443],[.068,-.443],[0,-.218]], .006, ivory, h);
    if (id === 'tux') cutShape(p,'bow tie',[[-.060,-.421],[0,-.402],[.060,-.423],[.054,-.374],[0,-.388],[-.054,-.373]],.014,edge,h+.009);
    else cutShape(p,'neck tie',[[-.025,-.420],[.025,-.420],[.014,-.386],[.031,-.264],[0,-.236],[-.031,-.264],[-.014,-.386]],.011,edge,h+.008);
    for (const side of [-1,1]) outline(p,'suit lapel',[[.087,-.414],[.119,-.394],[.071,-.332],[.050,-.276],[.035,-.322]].map(([x,z])=>[x*side,z]),.009,edge,h);
    if (id === 'tux') for (const side of [-1,1]) top(p,'satin trouser stripe',[side*.119-.007,-.08,side*.119+.007,.36],h+.001,edge);
  } else if (denim) {
    p.box('bib pocket',[-.067,h,-.31,.067,h+.018,-.19],denimP(0x496577));
    for (const x of [-.07,.07]) cyl(p,'bib clasp','y',[x,h+.013,-.385],.015,.012,8,metal);
  } else if (id === 'union_suit') {
    for (let k=0;k<5;k++) path(p,'lacing',[[-.032,h,-.36+k*.034],[.030,h+.01,-.34+k*.034]],.005,ivory);
  } else if (id === 'flag_swimsuit') {
    for (const z of [-.31,-.26,-.21,-.16]) top(p,'white stripe',[-.096,z,.096,z+.024],h+.001,ivory);
    top(p,'blue panel',[-.104,-.40,.104,-.317],h+.001,clothP(0x4a5d85));
  } else p.box('center seam',[-.009,h,-.411,.009,h+.007,-.169],edge);
  if (/^thermal/.test(id)) {
    bevel(p,'power pocket',[.063,h,-.11,.136,h+.021,-.056],.008,rubber);
    if (id === 'thermal_outfit') {
      bevel(p,'thermal hood',[-.074,.005,-.539,.074,.062,-.408],.026,fabric);
      for (const x of [-.091,.091]) bevel(p,'enclosed foot',[x-.043,.006,.372,x+.046,.043,.49],.022,fabric);
    }
  }
  if (id === 'wool_suit_devil') {
    const parent = p.group('hood', {at:[0,0,-.38]});
    blob(p,'red hood',[.111,.056,.092],[0,.056,-.101],fabric,{parent},3,8);
    for (const x of [-.073,.073]) tube(p,'costume horn',V(x,.07,-.47),V(x*1.32,.176,-.50),.027,.006,7,edge);
    path(p,'costume tail',[[.07,.028,.016],[.17,.028,.11],[.23,.029,.225],[.19,.022,.31]],.014,fabric);
    outline(p,'pointed tail tip',[[.15,.285],[.24,.30],[.19,.363]],.023,edge,.01);
  }
}

function dress(p, d) {
  const qipao = d.id === 'cheongsam';
  const long = d.id === 'long_dress' || qipao;
  const end = long ? .46 : .29;
  const w = qipao ? .169 : .29;
  const paint = qipao ? speckle(d.id,d.color,[shade(d.color,.8),shade(d.color,1.26)],.24) : clothP(d.color);
  const skirt = [[-.105,-.086],[.105,-.086],[w,.18],[w,end],[w-.022,end-.127],[w-.056,end],[-w+.05,end],[-w,.18]];
  cutShape(p,'skirt panel',skirt,.037,paint);
  const shoulder = qipao
    ? [[-.203,-.234],[-.164,-.327],[-.083,-.344],[0,-.284],[.083,-.344],[.164,-.327],[.203,-.234]]
    : [[-.146,-.199],[-.137,-.338],[-.098,-.347],[-.087,-.224],[.087,-.224],[.098,-.347],[.137,-.338],[.146,-.199]];
  cutShape(p,'fitted bodice',[...shoulder,[.109,-.052],[-.109,-.052]],.049,paint);
  if (qipao) {
    const piping = clothP(0xdbb770);
    path(p,'standing collar',[[-.087,.060,-.299],[-.052,.076,-.357],[.057,.076,-.357],[.088,.061,-.299]],.020,piping);
    path(p,'asymmetric fastening',[[0,.052,-.289],[.068,.053,-.243],[.123,.056,-.184],[.102,.053,-.097]],.008,piping);
    for (let n=0;n<4;n++) p.box('frog closure',[n*.018,.049,-.284+n*.029,n*.018+.039,.057,-.276+n*.029],piping);
  } else {
    top(p,'gathered waist',[-.104,-.079,.104,-.053],.051,clothP(shade(d.color,.76)));
    for (const x of [-.081,0,.081]) path(p,'fabric fold',[[x,.032,-.048],[x*1.64,.035,.144],[x*2.65,.038,end-.016]],.008,paint);
  }
}

function pants(p, d) {
  if (d.id === 'zubon_gi') return wear.pants(p, {...d,color:0xe2ded2});
  if (d.id === 'breeches') return wear.pants(p,d);
  if (d.id === 'tights') {
    const h = .019, knit = knitP(d.color);
    p.box('elastic waistband',[-.176,0,-.44,.176,.026,-.374],knit);
    p.box('knit seat',[-.153,0,-.38,.153,h,-.21],knit);
    for (const side of [-1,1]) {
      cutShape(p,'slim closed foot',[[.01,-.26],[.14,-.25],[.121,.285],[.149,.392],[.117,.448],[.048,.418],[.045,.303]]
        .map(([x,z])=>[x*side,z]),h,knit);
    }
    return;
  }
  const fabric = d.id === 'motorbike_pants' ? denimP(0x4d6883) : clothP(0x42403f);
  p.box('waist belt',[-.25,0,-.39,.25,.05,-.32],rubber);
  for (const s of [-1,1]) {
    outline(p,'leg panel',[[.028,-.34],[.24,-.34],[.17,.44],[.035,.43]].map(([x,z])=>[x*s,z]),.044,fabric);
    const x=.105*s;
    if (d.id === 'motorbike_pants') {
      bevel(p,'integral knee pad',[x-.052,.044,.13,x+.052,.083,.25],.017,rubber);
      const hip=s*.177;
      bevel(p,'padded flank',[hip-.046,.043,-.29,hip+.046,.081,-.137],.018,rubber);
    }
    else path(p,'leg closure',[[s*.192,.033,-.27],[s*.152,.039,.11],[s*.149,.044,.40]],.010,metal);
  }
}

function skirt(p,d) {
  if (d.id === 'skirt_leather') return wear.skirt(p,d);
  const kilt = d.id.includes('kilt');
  const color = kilt ? d.color : 0xaf4750;
  const paint = d.id === 'kilt' ? weave(color,'plaid') : clothP(color);
  const hem = d.id.endsWith('short') ? .13 : .29;
  outline(p,'pleated skirt',[[-.23,-.18],[.23,-.18],[.36,hem],[-.36,hem]],.033,paint);
  p.box('waist band',[-.236,0,-.184,.236,.051,-.13],clothP(shade(color,.68)));
  for (const x of [-.19,-.08,.08,.19]) path(p,'pleat',[[x,.031,-.12],[x*1.49,.035,hem-.015]],.008,paint);
  if (!kilt) top(p,'white hem stripe',[-.29,hem-.061,.29,hem-.031],.035,ivory);
  else if(d.id==='kilt') {
    path(p,'sporran strap',[[-.205,.052,-.141],[0,.061,-.059],[.204,.053,-.141]],.013,clothP(0x645344));
    bevel(p,'sporran pouch',[-.083,.036,-.07,.083,.104,.074],.029,clothP(0x906b51));
    for (const x of [-.046,0,.046]) tube(p,'sporran tassels',V(x,.09,.042),V(x,.075,.101),.008,.012,7,ivory);
  }
}

function headwear(p,d) {
  const { id,shape,color } = d;
  const cloth = /knit|ski|fur|clava/.test(id) ? knitP(color) : clothP(color);
  if (shape === 'lamp') {
    loop(p,'elastic head strap',[0,.026,0],.36,.027,cloth,{},14);
    bevel(p,'lamp body',[-.15,.004,-.48,.15,.154,-.29],.033,rubber);
    cyl(p,'LED bezel','z',[0,.083,-.476],.059,.021,10,metal);
    cyl(p,'LED lens','z',[0,.083,-.492],.043,.014,10,plasticP(0xe5e3c4));
    return;
  }
  if (id === 'helmet_bike') {
    const shell=plasticP(0x648ba2);
    profile(p,'tapered foam shell',[[.30,.072],[.358,.133],[.347,.223],[.291,.315],[.203,.373],[0,.389]],shell,{scale:[.88,1.22],at:[0,.013]});
    for (const x of [-.137,0,.137]) path(p,'long ventilation groove',[[x,.255,-.281],[x,.345,-.178],[x,.369,-.041],[x,.334,.114]],.024,rubber);
    for (const side of [-1,1]) path(p,'chin strap',[[side*.237,.094,-.084],[side*.268,.033,.118],[side*.117,.025,.26]],.019,rubber);
    return;
  }
  if (shape === 'helmet') {
    const motorcycle = id === 'helmet_motor', papr = id.includes('papr');
    blob(p,'molded helmet shell',[.32,.30,.35],[0,.295,.02],plasticP(color),{},4,12);
    if (motorcycle || papr) {
      bevel(p,'chin guard',[-.242,0,-.355,.242,.145,.041],.062,rubber);
      const weld=id.includes('welding');
      if (papr) {
        const shield=plasticP(0xa8cdd2);
        bevel(p,'transparent full-face shield',[-.281,.055,-.376,.281,.421,-.325],.025,shield,GLASS);
        path(p,'shield mounting band',[[-.277,.379,-.352],[0,.427,-.381],[.277,.379,-.352]],.023,rubber);
        if(weld) {
          bevel(p,'secondary flip-down mask',[-.211,.119,-.418,.221,.363,-.374],.021,plasticP(0x55635e));
          bevel(p,'dark welding window',[-.156,.239,-.431,.157,.33,-.414],.008,plasticP(0x212f2d));
        }
        path(p,'rear air hose',[[.13,.26,.321],[.21,.170,.425],[.39,.069,.475],[.46,.055,.31],[.432,.05,.026]],.033,rubber);
      } else {
        bevel(p,'wraparound glareproof visor',[-.274,.17,-.365,.274,.337,-.286],.037,plasticP(0x354f60),GLASS);
        for(const x of [-.223,.223]) cyl(p,'visor pivot','x',[x*1.23,.275,-.185],.052,.044,9,metal);
      }
    } else {
      const brim = id === 'hat_hard' ? .475 : .33;
      outline(p,'lower rim',[[-.31,.10],[-.28,-.24],[-.16,-brim],[.16,-brim],[.28,-.24],[.31,.10],[.22,.24],[-.22,.24]],.049,plasticP(shade(color,.88)));
      if (id === 'hat_hard') path(p,'crown ridge',[[0,.30,-.295],[0,.49,-.20],[0,.57,-.012],[0,.47,.22]],.021,plasticP(shade(color,1.17)));
    }
    return;
  }
  if (shape === 'knit') {
    if (/mask|clava|hood/.test(id)) {
      const rain=id==='hood_rain';
      const cutouts=id==='mask_ski'
        ? [oval(-.104,-.055,.077,.052),oval(.104,-.055,.077,.052),oval(0,.117,.064,.041)]
        : [oval(0,rain?-.105:-.095,rain?.192:.188,rain?.189:.095,12)];
      const silhouette=[[-.23,-.31],[-.116,-.385],[.118,-.382],[.23,-.306],[.32,-.144],[.28,.17],[.202,.376],[-.164,.376],[-.284,.238],[-.321,-.117]];
      cutShape(p,rain?'waterproof hood shell':'knitted face covering',silhouette,rain?.094:.058,rain?plasticP(color):cloth,0,cutouts);
      p.box('neck hem',[-.162,0,.319,.199,.069,.391],rain?plasticP(shade(color,.74)):knitP(shade(color,.76)));
      if (rain) for(const x of [-.226,.226]) path(p,'hood drawcord',[[x,.074,-.058],[x*.92,.057,.119],[x*.86,.039,.247]],.013,rubber);
    } else {
      const fur=id==='hat_faux_fur', wool=id==='hat_knit';
      const h=fur?.514:wool?.392:.312;
      const cuff=fur?.158:wool?.11:.054;
      profile(p,'fabric crown',[[.289,.03],[.307,cuff*.72],[.32,cuff*1.04],[.321,h*.55],[.263,h*.82],[.183,h*.96],[0,h]],cloth,{sides:14});
      profile(p,'turn-up cuff',[[.274,0],[.33,0],[.338,cuff],[.305,cuff+.007],[.29,.02]],fur?knitP(shade(color,1.13)):knitP(shade(color,.85)),{sides:14});
    }
    return;
  }
  if (shape === 'cap') {
    const long = id === 'hat_ball';
    const golf = id==='hat_golf';
    const cap = golf ? weave(0x706858,'plaid') : id==='hat_newsboy'?knitP(0x5f5754):clothP(color);
    blob(p,'soft cap crown',[long?.312:.345,long?.235:golf?.132:.171,.333],[0,.188,.073],cap,{},4,12);
    if(long) {
      path(p,'rear adjustment strap',[[-.126,.061,.321],[0,.049,.373],[.124,.063,.321]],.020,clothP(shade(color,.74)));
      p.box('strap buckle',[-.031,.041,.360,.031,.072,.393],metal);
    }
    outline(p,'curved peak',[[-.285,.022],[-.24,-.267],[-.132,long?-.56:-.44],[.132,long?-.56:-.44],[.24,-.267],[.285,.022]],.040,cap);
    if (!golf) cyl(p,'covered button','y',[0,long?.421:.363,.069],.035,.025,8,cap);
    return;
  }
  const straw = id==='straw_hat', boonie=id==='hat_boonie', topHat=shape==='top';
  const hat = straw?knitP(0xc4a167):cloth;
  const h = topHat?.613:id==='fedora'?.421:straw?.317:.279;
  const r = topHat?.361:boonie?.422:.464;
  const brim = [[.256,.056],[r*.91,.024],[r,.034],[r,.063],[r*.90,.076],[.269,.093]];
  profile(p,'shaped hat brim',brim,hat,{scale:id==='fedora'?[.91,1.13]:[1,1],sides:16});
  profile(p,'hat crown',[[.273,.056],[.294,h*.45],[id==='fedora'?.239:.270,h-.031],[.201,h],[0,h]],hat,{sides:14});
  cyl(p,'hatband','y',[0,.136,0],.293,.064,14,clothP(shade(color,.65)),{open:true});
  if(id==='fedora') path(p,'creased crown',[[0,h-.014,-.193],[.042,h-.004,-.091],[.042,h-.004,.13],[0,h-.014,.188]],.013,clothP(shade(color,.71)));
  if(boonie) path(p,'chin cord',[[-.251,.044,0],[-.334,.025,.29],[0,.022,.49],[.331,.025,.29],[.251,.044,0]],.012,clothP(0x5b6043));
}

function mask(p,d) {
  const {id,shape,color} = d;
  const h = shape==='filter' ? .18 : .24;
  const paint = plasticP(shape==='hockey' ? 0xe3dfcf : color);
  const hockey = shape==='hockey';
  const eyeHoles = hockey ? [-.146,.146].map(x=>oval(x,-.164,.095,.056)) : [];
  const vents = hockey ? [.067,.161,.247].flatMap(z=>[-.117,0,.117].map(x=>oval(x,z,.025,.022,7))) : [];
  const shapePoints = shape==='filter'
    ? [[-.289,-.09],[-.188,-.139],[-.105,-.268],[.105,-.268],[.188,-.139],[.289,-.09],[.341,.11],[.21,.319],[-.21,.319],[-.341,.11]]
    : [[-.36,-.21],[-.28,-.41],[.28,-.41],[.36,-.21],[.28,.34],[.15,.46],[-.15,.46],[-.28,.34]];
  cutShape(p,'contoured face shell',shapePoints,hockey?.077:h,paint,0,[...eyeHoles,...vents]);
  path(p,'strap',[[-.30,.05,.08],[-.36,.04,.25],[-.25,.04,.39],[.25,.04,.39],[.36,.04,.25],[.30,.05,.08]],.024,rubber);
  if (shape==='welding') bevel(p,'dark welding window',[-.215,h,-.315,.215,h+.048,-.048],.015,plasticP(0x3e5050));
  if (shape==='filter') {
    const positions = id==='mask_gas_half' ? [-.19,.19] : [0];
    for (const x of positions) {
      cyl(p,'filter housing','y',[x,h+.045,.12],.12,.107,10,rubber);
      cyl(p,'filter face','y',[x,h+.103,.12],.089,.022,10,plasticP(shade(color,1.22)));
    }
    if (id==='papr_half_mask') path(p,'air hose',[[.12,.11,.26],[.24,.065,.37],[.38,.058,.46],[.46,.047,.32]],.031,rubber);
  }
}

function goggles(p,d) {
  if (d.id==='sunglasses_bifocal') return wear.glasses(p,d);
  const swim = d.id==='goggles_swim';
  const safety = d.id==='glasses_safety';
  const paint = plasticP(swim?0x47798b:safety?0x8fadb0:0x333a42);
  const lens = plasticP(swim?0x629cae:0xa8c7c8);
  if (safety) {
    bevel(p,'wraparound safety shield',[-.343,.017,-.115,.343,.229,-.062],.021,lens,GLASS);
    path(p,'reinforced brow',[[-.34,.233,-.081],[0,.246,-.112],[.34,.233,-.081]],.018,paint);
  } else for (const x of [-.19,.19]) {
    if(swim) {
      cyl(p,'rubber eyecup','z',[x,.119,-.103],.105,.121,12,paint,{open:true});
      cyl(p,'goggle lens','z',[x,.119,-.158],.097,.025,12,lens,GLASS);
    } else {
      bevel(p,'AR lens',[x-.136,.052,-.116,x+.136,.201,-.074],.013,lens,GLASS);
      p.box('display brow',[x-.143,.186,-.121,x+.143,.218,-.063],paint);
      p.box('temple electronics',[x-.052,.149,-.070,x+.052,.229,.071],paint);
    }
  }
  tube(p,'bridge',V(-.089,.151,-.122),V(.089,.151,-.122),.023,.023,8,paint);
  if (swim) path(p,'elastic strap',[[-.282,.113,-.09],[-.361,.066,.121],[-.243,.026,.31],[.235,.026,.31],[.359,.066,.121],[.283,.113,-.09]],.021,paint);
  else for (const x of [-.334,.334])
    path(p,'arms',[[x,.213,-.077],[x,.180,.107],[x*.81,.113,.251]],.018,paint);
}

function gloves(p,d) {
  const rubberized = /rubber|wetsuit/.test(d.id);
  const paint = rubberized ? plasticP(d.color) : clothP(d.color);
  const h = d.id==='gloves_winter' ? .085 : /golf|liner/.test(d.id) ? .030 : .047;
  for (const side of [-1,1]) {
    const center = .223 * side;
    outline(p,'glove palm',[[center-.130,-.12],[center+.13,-.12],[center+.11,.235],[center-.11,.235]],h,paint);
    for (let k=0;k<4;k++) {
      const x = center + (k-1.5)*.06;
      bevel(p,'finger',[x-.028,.008,-.28-(k===1?.038:0),x+.028,h*.84,-.057],.019,paint);
    }
    bevel(p,'thumb',[center+side*.128-.041,.003,-.089,center+side*.128+.041,h,.081],.019,paint);
    p.box('cuff',[center-.112,0,.207,center+.112,h*.82,rubberized?.40:.32],clothP(shade(d.color,.78)));
    if (d.id==='gloves_golf') {
      p.box('wrist closure',[center-.06,h,.168,center+.084,h+.009,.241],rubber);
      for (const x of [-.062,0,.061]) for (const z of [-.083,-.023,.043])
        cyl(p,'breather perforation','y',[center+x,h+.003,z],.008,.004,7,metal);
    }
  }
}

function shoe(p,d) {
  const skate = d.shape==='skate' && d.id!=='roller_shoes_off';
  const sneaker = d.id==='roller_shoes_off';
  const espadrille = d.id==='espadrilles';
  const sandal = d.shape==='sandal';
  const wheels = skate && d.id!=='roller_shoes_off';
  const h = wheels ? .143 : .016;
  const paint = /straw|bast|espadrilles/.test(d.id) ? knitP(0xbfa273) : clothP(d.color);
  for (const x of [-.211,.211]) {
    bevel(p,'shaped sole',[x-.132,h,-.45,x+.132,h+.062,.39],.036,espadrille?knitP(0xb59768):rubber);
    if (sandal && d.id==='flip_flops_exp') {
      path(p,'thong strap',[[x-.116,h+.043,.065],[x-.066,h+.12,-.08],[x,h+.112,-.247],[x+.064,h+.12,-.08],[x+.116,h+.043,.065]],.022,paint);
    } else if (sandal) {
      for (const z of [-.24,-.1]) path(p,'woven strap',[[x-.122,h+.045,z],[x-.057,h+.135,z],[x+.055,h+.135,z],[x+.122,h+.045,z]],.024,paint);
      if(d.id==='leathersandals') path(p,'heel strap',[[x-.118,h+.07,.178],[x-.103,h+.123,.312],[x+.098,h+.123,.312],[x+.119,h+.069,.177]],.023,paint);
      else for(const z of [.14,.20,.26]) path(p,'woven sole cord',[[x-.119,h+.058,z],[x+.118,h+.058,z]],.008,paint);
    } else {
      bevel(p,'stitched vamp',[x-.122,h+.048,-.434,x+.122,h+.187,.37],.050,paint);
      bevel(p,'open ankle',[x-.102,h+.172,.039,x+.102,h+(skate?.42:.21),.355],.035,paint);
      top(p,'insole opening',[x-.076,.09,x+.076,.305],h+(skate?.421:.211),rubber);
      if (sneaker) bevel(p,'closed heel wheel cover',[x-.059,h-.009,.18,x+.058,h+.029,.32],.014,rubber);
      if (skate||sneaker) for (const z of [-.18,-.093,-.006]) path(p,'lace',[[x-.067,h+.186,z],[x+.067,h+.19,z+.018]],.009,ivory);
    }
    if (wheels) {
      p.box('wheel frame',[x-.042,.075,-.321,x+.042,.18,.310],metal);
      for (const z of (d.id==='rollerskates'?[-.23,.23]:[-.28,-.091,.091,.28])) {
        for (const off of (d.id==='rollerskates'?[-.068,.068]:[0])) cyl(p,'urethane wheel','x',[x+off,.069,z],.069,.063,10,plasticP(d.id==='rollerskates'?0x9b544e:0x60646a));
      }
    }
  }
}

function carry(p,d) {
  const {id,shape,color} = d;
  const fabric = id==='backpack_denim' ? denimP(color) : clothP(color);
  const trim = clothP(shade(color,.64));
  if (id==='dry_bag'||id==='dive_bag') {
    const mesh=id==='dive_bag';
    const shell = mesh ? (ctx,x,y,w,h)=>{
      ctx.clearRect(x,y,w,h);
      const step=Math.max(4,Math.floor(w/11));
      for(let i=0;i<w;i+=step) fill(ctx,x+i,y,1,h,color);
      for(let j=0;j<h;j+=step) fill(ctx,x,y+j,w,1,color);
    } : plasticP(color);
    bevel(p,'rounded dry or mesh bag',[-.288,0,-.375,.288,.248,.322],.096,shell,{cutout:mesh});
    for(const x of [-.178,.178]) path(p,'backpack strap',[[x,.038,-.31],[x*1.24,.031,-.10],[x*1.22,.028,.21],[x,.04,.32]],.028,trim);
    if(mesh) path(p,'drawcord mouth',[[-.23,.189,-.31],[0,.236,-.376],[.22,.189,-.31],[.31,.134,-.389]],.026,trim);
    else bevel(p,'rolled waterproof closure',[-.284,.122,-.377,.284,.249,-.274],.039,trim);
    return;
  }
  if (shape==='quiver' || id==='sheath') {
    const sheath = id==='sheath';
    cyl(p,sheath?'leather sleeve':'tapered quiver','z',[0,.132,0],sheath?.063:.126,.83,9,fabric,{open:true},.145);
    cyl(p,'closed sole','z',[0,.132,.414],sheath?.063:.126,.031,9,trim);
    cyl(p,'reinforced open lip','z',[0,.132,-.422],sheath?.083:.155,.055,9,trim,{open:true});
    path(p,'carry strap',[[-.102,.107,-.28],[-.218,.029,-.12],[-.222,.029,.19],[-.106,.104,.30]],.021,trim);
    return;
  }
  if (id.endsWith('holster')) {
    const body = id==='holster' ? clothP(0x745140) : clothP(0x515658);
    outline(p,'open molded holster',[[-.32,-.36],[.22,-.39],[.31,-.23],[.12,.035],[.061,.39],[-.26,.39],[-.29,.13]],.167,body);
    path(p,'retention strap',[[.21,.046,-.31],[.33,.11,-.257],[.19,.207,-.19],[.047,.19,-.10]],.034,body);
    cyl(p,'strap snap','y',[.116,.195,-.145],.038,.022,9,metal);
    return;
  }
  const long = shape==='duffel', pack = shape==='pack', hard = id==='suitcase_l';
  const h = long ? .33 : pack ? .23 : .19;
  const x = long||hard ? .44 : id==='chestrig'?.43:.32;
  const z = long ? .24 : .42;
  bevel(p,'bag shell',[-x,0,-z,x,h,z],long?.12:.075,hard?plasticP(color):fabric);
  p.box('zipper',[-x*.87,h-.021,z-.014,x*.87,h+.005,z+.003],trim);
  if (pack) {
    const slots = id==='chestrig' ? [-.27,0,.27] : [0];
    for (const s of slots) bevel(p,'front pocket',[s-(slots.length===1?.205:.115),h-.014,-.148,s+(slots.length===1?.205:.115),h+.10,.21],.030,fabric);
    if (id==='petpack') {
      const frame=plasticP(0x658184);
      bevel(p,'pet carrier frame',[-.212,h+.062,-.183,.212,h+.136,.214],.039,frame);
      top(p,'vent mesh',[-.166,-.139,.166,.175],h+.138,(ctx,x,y,w,h)=>{
        fill(ctx,x,y,w,h,0x35474f);
        for(let i=2;i<w;i+=4) fill(ctx,x+i,y,1,h,0x7b9596);
        for(let j=2;j<h;j+=4) fill(ctx,x,y+j,w,1,0x7b9596);
      });
    }
  }
  for (const side of [-1,1]) {
    const sx = x*.59*side;
    path(p,'webbing strap',[[sx,h*.7,-z],[sx,h+.039,-z*.52],[sx,h+.047,z*.54],[sx,h*.7,z]],.023,trim);
    if (hard) cyl(p,'luggage wheel','x',[sx,.049,z+.012],.058,.058,10,rubber);
  }
  path(p,'carry handle',[[-.13,h*.8,-z],[ -.095,h*.8,-z-.072],[.095,h*.8,-z-.072],[.13,h*.8,-z]],.016,trim);
  if(id==='camera_bag') {
    bevel(p,'side pocket',[.263,.027,-.113,.385,.182,.137],.038,fabric);
    path(p,'long shoulder strap',[[-.31,.093,-.109],[-.395,.044,-.309],[-.309,.025,-.442],[.309,.025,-.442],[.383,.046,-.313],[.312,.093,-.102]],.021,trim);
  }
  if(id==='leg_bag') for(const z of [-.129,.153]) path(p,'adjustable thigh strap',[[-.25,.084,z],[-.41,.052,z],[.41,.052,z],[.25,.084,z]],.026,trim);
  if(id==='ammo_pouch') bevel(p,'foldover pouch flap',[-.25,h-.028,-.29,.25,h+.029,-.067],.018,trim);
  if(hard) for(const x of [-.23,-.11,.11,.23]) p.box('molded hard-case rib',[x-.012,h-.008,-.31,x+.012,h+.017,.31],plasticP(shade(color,1.15)));
  if (long) {
    path(p,'bridging grab handle',[[-.182,h,.053],[-.128,h+.084,.055],[.128,h+.084,.055],[.182,h,.053]],.022,trim);
    if (id==='dry_duffelbag') bevel(p,'sealed roll closure',[-.389,.261,.151,.389,.344,.238],.037,plasticP(shade(color,.70)));
  }
}

function cloth(p,d) {
  const paint = clothP(d.color);
  const hem = clothP(shade(d.color,.71));
  if (d.id==='hammock') {
    cutShape(p,'gathered canvas sling',[[0,-.339],[.21,-.254],[.294,-.151],[.294,.145],[.20,.266],[0,.335],[-.20,.266],[-.294,.145],[-.294,-.151],[-.21,-.254]],.043,paint);
    for(const s of [-1,1]) for(const x of [-.19,-.09,0,.09,.19])
      path(p,'suspension rope',[[x,.041,s*(.312-Math.abs(x)*.35)],[x*.62,.034,s*.387],[0,.038,s*.52]],.012,ivory);
    return;
  }
  if (d.shape==='roll' && d.id!=='sleeping_bag') {
    cyl(p,'rolled fabric','x',[0,.16,0],.158,.86,14,paint);
    for (const x of [-.25,.25]) cyl(p,'compression strap','x',[x,.16,0],.165,.061,14,hem);
    for (const x of [-.443,.443]) cyl(p,'roll core','x',[x,.16,0],.097,.023,10,hem);
    return;
  }
  const foil = d.id==='emer_blanket';
  const long = d.id==='sleeping_bag';
  const h = long ? .13 : .062;
  const w = long ? .23 : .42;
  bevel(p,'folded textile',[-w,0,-.45,w,h,.45],.026,foil?steelP(0xc8aa62):paint);
  if (d.id==='american_flag') {
    top(p,'printed flag',[-w,-.445,w,.445],h+.001,(ctx,x,y,w,h)=>{
      for(let n=0;n<13;n++) fill(ctx,x,y+n*h/13,w,h/13,n%2?0xe5ddc9:0xad4e4a);
      fill(ctx,x,y,w*.42,h*7/13,0x435477);
      for(let j=0;j<9;j++) for(let i=0;i<(j%2?5:6);i++)
        fill(ctx,x+w*.035+(i+(j%2)*.5)*w*.069,y+h*.028+j*h*.058,1,1,0xe7e4d7);
    });
  } else {
    for (const z of [-.31,0,.28]) path(p,'sewn fold',[[-w*.95,h,z],[w*.95,h,z]],.009,hem);
    if (d.id==='electric_blanket') path(p,'power cable',[[w*.8,h,.34],[.46,.035,.4],[.49,.025,.27]],.015,rubber);
    if (d.id==='tarp') for (const x of [-.36,.36]) for (const z of [-.39,.39]) loop(p,'grommet',[x,h+.004,z],.025,.007,metal,{},8);
    if (long) {
      cutShape(p,'padded hood',oval(0,-.314,.201,.136),.072,hem,h-.019,[oval(0,-.317,.137,.079)]);
      p.box('side zipper',[-.203,.112,-.236,-.188,.139,.393],hem);
    }
    if(d.id==='keffiyeh') {
      top(p,'woven check',[-.388,-.416,.388,.41],h+.001,weave(0xd6cdb5,'plaid'));
      for(let k=0;k<11;k++){
        const x=(k-5)*.071;
        path(p,'knotted fringe',[[x,.035,.423],[x+.009,.029,.472]],.007,ivory);
      }
    }
  }
}

function armor(p,d) {
  if(d.id==='motorbike_armor') {
    const mesh = plasticP(0x51565a);
    coat(p,{...d,id:'jacket_leather',shape:'leather',color:0x52545c});
    for(const s of [-1,1]) {
      const x=s*.262;
      bevel(p,'molded shoulder pad',[x-.096,.033,-.245,x+.096,.101,-.13],.029,mesh);
      const elbow=s*.341;
      bevel(p,'molded elbow pad',[elbow-.053,.027,.018,elbow+.053,.095,.106],.026,mesh);
    }
    return;
  }
  const pair = d.shape==='pair';
  const cover = /leg|arm/.test(d.id) ? .39 : .22;
  const paint = plasticP(d.color);
  for (const x of pair ? [-.23,.23] : [0]) {
    const w = pair ? .144 : .32;
    bevel(p,'padded backing',[x-w,0,-cover,x+w,.15,cover],.06,clothP(shade(d.color,.76)));
    bevel(p,'shaped guard',[x-w*.88,.12,-cover*.77,x+w*.88,.24,cover*.7],.051,d.id==='toecaps'?metal:paint);
    for (const z of [-cover*.76,cover*.65]) path(p,'adjustable strap',[[x-w,.052,z],[x-w-.042,.041,z+.01],[x+w+.04,.044,z+.017],[x+w,.055,z]],.024,rubber);
  }
  if (!pair) {
    for (const x of [-.20,.20]) bevel(p,'shoulder strap',[x-.07,.022,-.47,x+.07,.12,-.13],.023,rubber);
    top(p,'vest front panel',[-.22,-.15,.22,.13],.241,label(shade(d.color,.85),d.name,d.key));
  }
}

function earphones(p,d) {
  const shell = plasticP(d.color);
  path(p,'arched headband',[[-.365,.245,0],[-.334,.522,0],[-.211,.71,0],[0,.77,0],[.211,.71,0],[.334,.522,0],[.365,.245,0]],.049,shell);
  for (const x of [-.38,.38]) {
    cyl(p,'ear cup','x',[x,.194,0],.182,.127,12,shell);
    cyl(p,'cushion','x',[x*.82,.194,0],.168,.062,12,rubber,{open:true});
  }
}

function watch(p,d) {
  const smart = d.id==='smart_watch';
  const paint = steelP(d.id==='gold_watch'?0xc39954:0xaeb2ae);
  bevel(p,'wrist strap',[-.118,0,-.46,.118,.042,.46],.018,smart?rubber:paint);
  for (const z of [-.38,-.30,.24,.32,.40]) p.box('bracelet segment',[-.118,.025,z,.118,.051,z+.017],smart?plasticP(0x48474e):metal);
  if (smart) bevel(p,'rectangular screen',[-.19,.034,-.18,.19,.104,.18],.029,plasticP(0x232f3b));
  else cyl(p,'watch bezel','y',[0,.073,0],.182,.087,14,paint);
  top(p,'watch face',[-.087,-.08,.087,.08],smart?.106:.118,(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,smart?0x243e4b:0x45454a);
    fill(ctx,x+w*.47,y+h*.17,w*.09,h*.35,0xe7e8dd);
    fill(ctx,x+w*.47,y+h*.46,w*.30,h*.07,0xe7e8dd);
  });
}

function pin(p,d) {
  const paint = steelP(d.id==='copper_hairpin'?0xb97652:0xb7b7ad);
  path(p,'spring pin',[[-.43,.028,-.035],[.38,.028,-.035],[.46,.028,.015],[.39,.028,.071],[-.39,.028,.071]],.022,paint);
  if (d.id!=='copper_hairpin') bevel(p,'decorative clip',[-.39,.044,-.071,.176,.106,.105],.028,d.id==='fc_hairpin'?plasticP(0xcd7d9b):paint);
  if (/fc_|barrette/.test(d.id)) for (const x of [-.25,-.11,.035]) {
    for (const z of [-.031,.051]) blob(p,'petal',[.034,.021,.024],[x,.113,z],plasticP(0xe5a8ad),{},3,6);
    cyl(p,'flower center','y',[x,.122,.009],.024,.018,8,plasticP(0xe3c173));
  }
}

function corset(p,d) {
  const h = d.id==='corset_waist' ? .27 : .43;
  const paint=clothP(0x3d3439);
  outline(p,'shaped leather panel',[[-.38,-h],[-.13,-h*.84],[0,-h],[.13,-h*.84],[.38,-h],[.30,0],[.40,h],[-.40,h],[-.30,0]],.071,paint);
  for (const side of [-1,1]) {
    path(p,'stitched boning',[[side*.23,.071,-h*.88],[side*.19,.074,.018],[side*.26,.071,h*.89]],.014,clothP(0x70575b));
    for (let n=0;n<5;n++) cyl(p,'eyelet','y',[side*.067,.078,(n-2)*h*.35],.019,.013,8,metal);
  }
  for(let n=0;n<4;n++) path(p,'crossed lacing',[[-.066,.09,(n-2)*h*.35],[.066,.09,(n-1)*h*.35]],.010,clothP(0x95716c));
}

export const workshopWear = {
  coat,suit,dress,pants,skirt,intimates:wear.intimates,corset,headwear,mask,glasses:goggles,
  gloves,shoe,carry,cloth,armor,earphones,watch,pin,
};
