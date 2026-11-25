import { denimP, knitP, loop } from './item-kit.js';
import {
  GLASS, V, bevel, cement, clothP, cyl, fill, flat, outline, path, plasticP, rubber, shade, steelP, top, tube,
} from './common-loot-kit.js';
import { drawShorts, shortsStyles } from './shorts.js';
import { drawBadge } from './badges.js';

function bag(p,d) {
  const { id,color }=d;
  const suitcase=id==='suitcase_m';
  const briefcase=/briefcase|suitcase/.test(id);
  const rigid=briefcase || id==='straw_basket';
  const duffel=id==='duffelbag';
  const tall=/backpack|slingpack|runner_bag/.test(id);
  const w=suitcase?.56:briefcase?.46:duffel?.45:id==='runner_bag'?.215:tall?.29:id==='fanny'?.24:.26;
  const z=suitcase?.196:briefcase?.145:duffel?.118:tall?.203:.095;
  const h=suitcase?.163:briefcase?.100:duffel?.20:tall?.12:.084;
  const base=id==='straw_basket'?0xa6885d:id==='backpack_leather'||id==='purse'?0x74503a:color;
  const body=rigid?plasticP(base):clothP(base);
  const trim=clothP(shade(base,.69));
  if (id==='straw_basket') {
    cyl(p,'woven foot','y',[0,.022,0],.122,.044,12,body);
    cyl(p,'woven wall','y',[0,.092,0],.122,.142,12,body,{cutout:true,open:true},.153);
    path(p,'basket handle',[[0,.143,-.13],[0,.23,-.092],[0,.267,0],[0,.23,.092],[0,.143,.13]],.010,trim);
    return;
  }
  bevel(p,'bag body',[-w/2,0,-z,w/2,h,z],rigid?.012:Math.min(.025,h*.26),body);
  const seam=h*.86;
  p.box('zipper or closure',[-w*.41,seam,z-.003,w*.41,seam+.005,z+.001],trim);
  if (tall) {
    bevel(p,'front pocket',[-w*.36,h*.82,-z*.66,w*.36,h*1.16,z*.17],.012,clothP(shade(base,1.15)));
    if (id==='slingpack') {
      path(p,'single diagonal sling',[[-w*.30,.023,-z*.73],[-w*.29,.008,-z-.014],
        [w*.29,.008,z+.014],[w*.31,.024,z*.80]],.009,trim);
    } else for (const x of [-w*.24,w*.24]) {
      path(p,`shoulder harness ${x}`,[[x,.018,-z*.82],[x,.008,-z-.013],[x,.008,z+.014],[x,.024,z*.83]],.008,trim);
      if (id==='runner_bag') p.box(`reflector ${x}`,[x-.009,h+.022,-z*.30,x+.009,h+.025,z*.14],clothP(0xd6c599));
    }
  }
  if (id==='mbag' || id==='purse') {
    path(p,'shoulder strap',[[-w*.42,h*.63,0],[-w*.62,h*.62,-z*.60],[-w*.51,h*.54,-z-.077],[w*.41,h*.54,-z-.074],[w*.61,h*.62,-z*.73],[w*.43,h*.64,0]],.005,trim);
    p.box('buckle',[-.014,h*.81,z-.007,.014,h*.92,z+.008],cement);
  } else if (id==='fanny') {
    path(p,'waist strap',[[-w*.41,.022,0],[-w*.62,.012,-z*.79],[-w*.28,.012,-z-.048],[w*.28,.012,-z-.048],[w*.63,.012,-z*.76],[w*.41,.022,0]],.006,trim);
  } else if (suitcase) {
    for (const x of [-w*.34,w*.34]) {
      cyl(p,`roller ${x}`,'x',[x,.023,z+.012],.023,.017,12,rubber);
      p.box(`bumper ${x}`,[x-.016,.025,z-.025,x+.016,.069,z+.014],rubber);
    }
    path(p,'luggage handle',[[-w*.19,h*.68,-z],[-w*.18,h*.68,-z-.036],[w*.18,h*.68,-z-.036],[w*.19,h*.68,-z]],.007,trim);
  } else if (duffel || briefcase) {
    path(p,'carry handle',[[-w*.20,h,0],[-w*.16,h+.034,0],[w*.16,h+.034,0],[w*.20,h,0]],.008,trim);
    for (const x of [-w*.31,w*.31]) p.box(`webbing ${x}`,[x-.007,h-.003,-z*.78,x+.007,h+.003,z*.78],trim);
  }
}

function fabric(p,d) {
  const {id,color}=d;
  if (id==='pillow' || id==='down_pillow') {
    const down=id==='down_pillow';
    const outer=clothP(down?0xe2d7bd:0xc5c5b1), seam=clothP(down?0x978b75:0x7d8680);
    const r=down?.078:.070, length=down?.40:.38;
    cyl(p,'rolled pillow','x',[0,r,0],r,length,14,outer);
    for (const x of [-length*.32,length*.32]) cyl(p,`fabric tie ${x}`,'x',[x,r,0],r+.001,.019,14,seam);
    path(p,'folded linen edge',[[-length*.495,r*.72,0],[-length*.496,r*.80,.030],
      [-length*.497,r*1.12,.025],[-length*.498,r*1.19,-.013],[-length*.50,r*.91,-.023]],.004,seam);
    return;
  }
  if (id.startsWith('tie')) {
    const z=id==='tie_bow'?.034:id==='tie_skinny'?.22:.27;
    const w=id==='tie_bow'?.06:id==='tie_skinny'?.022:.038;
    const tieColor=id==='tie_bow'?0x39373a:id==='tie_skinny'?0x6d6a68:0x4c694b;
    const fabricPaint=id==='tie_skinny' ? (ctx,x,y,w,h) => {
      fill(ctx,x,y,w,h,0x343438);
      for(let j=0;j<h;j+=3) for(let i=0;i<w;i+=3) if((i+j)%6===0) fill(ctx,x+i,y+j,3,3,0xd4d0bd);
    } : clothP(tieColor);
    for (const s of [-1,1]) {
      const points=id==='tie_bow'?[[0,-.009],[s*w,-.025],[s*w,.025],[0,.009]]
        : [[0,-z*.66],[s*w*.32,-z*.63],[s*w,z*.53],[0,z*.65]];
      outline(p,`silk panel ${s}`,points,.004,fabricPaint);
    }
    const knotZ=id==='tie_bow'?0:-z*.58;
    bevel(p,'knot',[-.013,.001,knotZ-.007,.013,.010,knotZ+.007],.003,clothP(shade(tieColor,.78)));
    return;
  }
  const scarf=/bandana|scarf/.test(id);
  const w=scarf?.21:.43;
  const z=scarf?(id.includes('long')?.249:.15):.17;
  const h=scarf?.013:id==='sheet'?.016:.069;
  const base=color;
  const paint=/knit|scarf/.test(id)?knitP(base):clothP(base);
  bevel(p,'folded textile',[-w/2,0,-z,w/2,h,z],Math.min(h*.33,.028),paint);
  top(p,'hem or woven pattern',[-w*.45,-z*.89,w*.45,z*.89],h+.0005,(ctx,x,y,w,h)=>{
    paint(ctx,x,y,w,h);
    const border=Math.max(1,Math.round(h*.045));
    fill(ctx,x,y,w,border,shade(base,.72));
    fill(ctx,x,y+h-border,w,border,shade(base,.72));
    if (id.includes('quilt')) {
      for (let j=0;j<5;j++) for (let k=0;k<6;k++) {
        const c=[base,shade(base,.78),shade(base,1.22),0xad8762][(j*7+k*3+d.key)%4];
        fill(ctx,x+k*w/6+1,y+j*h/5+1,w/6-1,h/5-1,c);
      }
    }
  });
  if (scarf && !/bandana|headscarf/.test(id)) {
    for (let k=0;k<9;k++) {
      const x=(k/8-.5)*w*.81;
      p.box(`tassel ${k}`,[x-.003,0,z-.004,x+.003,.004,z+.014],paint);
    }
  }
}

function shirt(p,d) {
  const { id,color }=d;
  const straps=/halter|camisole/.test(id);
  const sleeveless=straps||/waistcoat|sleeveless/.test(id);
  const hoodie=id.includes('hoodie');
  const longCoat=id==='coat_rain';
  const short=/under_armor|cropped/.test(id);
  const tail=longCoat?.28:id.includes('tunic')?.255:straps?.108:id.includes('cropped')?.101:.176;
  const h=/thermal|wool/.test(id)?.028:.014;
  const base=id==='denim_shirt'?0x59778e:longCoat?0xc59549:color;
  const cloth=id==='denim_shirt'?denimP(base):id.includes('wool')?knitP(base):clothP(base);
  const edge=clothP(shade(base,.77));
  outline(p,'shirt torso',[[-.135,-.11],[.135,-.11],[.15,tail],[-.15,tail]],h,cloth);
  for (const s of [-1,1]) {
    const points=sleeveless?[[.060,-.097],[.119,-.097],[.118,-.165],[.087,-.182]]
      : [[.106,-.108],[.17,-.15],[short?.208:.23,short?-.058:tail*.76],[short?.163:.177,short?-.028:tail*.85]];
    outline(p,`sleeve or strap ${s}`,points.map(([x,z])=>[x*s,z]),h,cloth);
    if (/waistcoat|denim|rain/.test(id)) {
      const x=s*.072;
      top(p,`patch pocket ${s}`,[x-.036,-.022,x+.036,.038],h+.0005,edge);
    }
  }
  if (/^turtleneck/.test(id)) {
    bevel(p,'raised rib-knit neck',[-.061,.002,-.162,.061,h+.026,-.108],.010,knitP(shade(base,.81)));
  } else if (!straps) {
    const z=-.127;
    path(p,'bound collar',[[-.077,h,z],[ -.046,h,z+.030],[0,h,z+.047],[.046,h,z+.030],[.077,h,z]],.007,edge);
  }
  if (id==='wool_hoodie') {
    outline(p,'kangaroo pocket',[[-.082,.060],[.082,.060],[.056,.121],[-.056,.121]],.008,edge,h);
  }
  if (hoodie || longCoat) {
    outline(p,'folded hood',[[-.073,-.06],[-.07,-.162],[.01,-.193],[.09,-.147],[.067,-.072]],.020,edge,h);
  }
  if (/waistcoat|denim|rain/.test(id)) {
    for (let k=0;k<4;k++) cyl(p,`button ${k}`,'y',[.005,h+.002,-.057+k*.042],.0045,.003,8,cement);
  }
}

function pants(p,d) {
  const i=d.id;
  if (Object.hasOwn(shortsStyles,i)) return drawShorts(p,i);
  const base=i.includes('jeans')?0x526b82:i==='pants_leather'?0x39393c:i.includes('leather')?0x665148:d.color;
  const twill=i.includes('jeans')?denimP(base):clothP(base);
  const paint=i==='pants_checkered' ? (ctx,x,y,w,h) => {
    twill(ctx,x,y,w,h);
    for(let row=0;row<Math.floor(h/5);row++) for(let col=0;col<Math.floor(w/5);col++) {
      if ((row+col)%2===0) fill(ctx,x+col*5,y+row*5,5,5,shade(base,.65));
    }
  } : twill;
  const short=/shorts|briefs|trunks|hot_pants/.test(i);
  const skinny=/skinny|leggings/.test(i);
  const cuff=short?.13:i==='pants_ski'?.39:.33;
  const h=short?.015:.023;
  p.box('seat',[-.14,0,-.157,.14,h,-.042],paint);
  for (const s of [-1,1]) {
    outline(p,`leg ${s}`,[[.007,-.066],[.14,-.069],[skinny?.090:.122,cuff],[skinny?.037:.024,cuff-.011]]
      .map(([x,z])=>[x*s,z]),h,paint);
    if (/ski|tactical/.test(i)) {
      const x=s*.073;
      bevel(p,`cargo pocket ${s}`,[x-.035,h,.01,x+.035,h+.009,.083],.003,clothP(shade(base,.82)));
    }
    if (i==='jeans_ripped') {
      const x=s*.067;
      top(p,`frayed slit ${s}`,[x-.025,cuff*.63,x+.025,cuff*.63+.013],h+.0005,clothP(0xb6a08c));
    }
  }
  p.box('waistband',[-.142,0,-.158,.142,h+.003,-.126],clothP(shade(base,.78)));
  cyl(p,'front snap','y',[0,h+.003,-.134],.004,.002,8,cement);
}

function skirt(p,d) {
  const base=d.id.includes('denim')?0x577082:d.color;
  const hem=d.id.includes('long')?.31:d.id==='nanoskirt'?.018:d.id==='garter_belt'?.053:.14;
  const h=.011;
  const paint=clothP(base);
  outline(p,'pleated panel',[[-.12,-.104],[.12,-.104],[.171,hem],[-.171,hem]],h,paint);
  p.box('waistband',[-.123,0,-.104,.123,h+.003,-.078],clothP(shade(base,.73)));
  for (const s of [-1,1]) {
    path(p,`pleat ${s}`,[[s*.059,h,-.071],[s*.095,h,hem-.003]],.0016,clothP(shade(base,.76)));
    if (d.id==='garter_belt') {
      p.box(`garter ribbon ${s}`,[s*.1-.008,0,hem,s*.1+.008,.004,hem+.063],paint);
      p.box(`metal clasp ${s}`,[s*.1-.009,0,hem+.059,s*.1+.009,.004,hem+.071],cement);
    }
  }
}

function intimates(p,d) {
  const paint=clothP(d.id==='swim_briefs'?0x4b6d92:d.color);
  if (/bra|top/.test(d.id)) {
    for (const s of [-1,1]) {
      const parent=p.group(`cup ${s}`,{at:[s*.052,0,0],rotY:s*.14});
      bevel(p,'shaped cup',[-.051,0,-.031,.051,.028,.037],.012,paint,{parent});
      path(p,'strap',[[s*.066,.007,-.012],[s*.091,.006,-.087],[s*.063,.006,-.108]],.004,paint);
    }
    const band=clothP(shade(d.color,.71));
    p.box('underband',[-.121,0,.028,.121,d.id==='sports_bra'?.014:.008,.041],band);
    if (d.id==='bikini_top') {
      path(p,'ties',[[-.076,.005,.032],[-.090,.002,.067],[-.041,.003,.078],[0,.003,.060]],.0025,band);
    }
  } else {
    outline(p,'briefs panel',[[-.12,-.057],[.12,-.057],[.052,.042],[.037,.078],[-.037,.078],[-.052,.042]],.009,paint);
    p.box('elastic band',[-.124,0,-.057,.124,.011,-.041],clothP(shade(d.color,.75)));
  }
}

function pair(p,d) {
  const i=d.id;
  const shoe=/heels|boots|sneakers|dress_shoes|flip_flops/.test(i);
  const hand=/gloves|mittens/.test(i);
  const base=i==='gloves_leather'?0x3b3934:/boots|dress_shoes/.test(i)?0x51453b:i==='gloves_medical'?0x8ea9ac:i==='long_glove_white'?0xe5decf:d.color;
  const paint=/wool|warmers|socks|mittens/.test(i)?knitP(base):clothP(base);
  for (const s of [-1,1]) {
    const parent=p.group(`paired piece ${s}`,{at:[s*(shoe?.071:.061),0,s*.014],rotY:s*.11});
    const opts={parent};
    if (shoe) {
      const height=i==='boots'?.165:i==='flip_flops'?.018:i==='heels'?.075:.070;
      if (i==='heels') {
        bevel(p,'forefoot',[-.049,0,-.138,.049,.032,-.018],.007,paint,opts);
        tube(p,'sloping arch',V(0,.024,-.038),V(0,.071,.094),.030,.027,6,paint,opts);
        bevel(p,'heel cup',[-.043,.061,.047,.043,.097,.123],.009,paint,opts);
        tube(p,'slim heel',V(0,.004,.108),V(0,.071,.095),.008,.014,6,paint,opts);
        continue;
      }
      bevel(p,'sole',[-.05,0,-.139,.05,.017,.133],.007,rubber,opts);
      if (i==='flip_flops') {
        path(p,'toe strap',[[-.045,.018,-.036],[0,.034,-.062],[.043,.018,-.036]],.004,paint,opts);
        continue;
      }
      bevel(p,'upper and toe box',[-.046,.013,-.132,.046,.051,.125],.014,paint,opts);
      bevel(p,'collar',[-.043,.041,-.043,.043,height,.121],.010,paint,opts);
      if (/boots|sneakers/.test(i)) {
        for (let k=0;k<4;k++) {
          const z=-.064+k*.015;
          const y = z < -.041 ? .049 : height - .004;
          tube(p,`lace ${k}`,V(-.021,y,z),V(.021,y+.002,z+.003),.0026,.0026,5,clothP(0xa99f89),opts);
        }
      }
    } else if (hand) {
      const long=i==='long_glove_white';
      const cuff=long?.16:.062;
      bevel(p,'palm and cuff',[-.038,0,-.044,.038,.016,cuff],.006,paint,opts);
      tube(p,'thumb',V(s*.029,.009,-.013),V(s*.061,.008,-.038),.011,.006,6,paint,opts);
      if (i==='mittens') {
        bevel(p,'mitten tip',[-.035,.001,-.095,.035,.017,-.031],.007,paint,opts);
      } else for (let k=0;k<4;k++) {
        const x=(k-1.5)*.018;
        bevel(p,`finger ${k}`,[x-.007,0,-.079-(k===1?.013:0),x+.007,.014,-.033],.004,paint,opts);
      }
      p.box('rib cuff',[-.040,.010,cuff-.035,.040,.019,cuff],knitP(shade(base,.72)),opts);
    } else {
      const long=i==='stockings'?.215:.13;
      bevel(p,'knitted leg',[-.047,0,-long,.047,.022,.089],.007,paint,opts);
      p.box('binding',[-.049,.011,-long,.049,.025,-long+.028],knitP(shade(base,.74)),opts);
      if (i==='thermal_socks') {
        bevel(p,'heating module',[-.033,.02,-long+.011,-.004,.031,-long+.039],.003,rubber,opts);
      }
      if (i.includes('socks')||i==='stockings') {
        bevel(p,'toe',[-.046,0,.025,.071,.021,.093],.007,paint,opts);
      }
    }
  }
}

function glasses(p,d) {
  const dark=d.id.includes('sun') || d.id.startsWith('fitover');
  const wide=d.id.startsWith('fitover')?.032:.027;
  const frame=plasticP(dark?0x4a3f35:shade(d.color,.72));
  for (const s of [-1,1]) {
    const c=s*.039;
    const paint=flat(dark?0x556669:0xb4c9c7);
    bevel(p,`lens ${s}`,[c-wide,.004,-.006,c+wide,.038,.001],.002,paint,GLASS);
    path(p,`lens rim ${s}`,[[c-wide,.008,-.007],[c-wide,.038,-.007],[c+wide,.038,-.007],[c+wide,.008,-.007],[c-wide,.008,-.007]],.0024,frame);
    path(p,`folded temple ${s}`,[[s*.065,.032,0],[s*.062,.029,.035],[s*.038,.012,.058],[s*.014,.008,.062]],.0026,frame);
    if (d.id.includes('bifocal')) {
      p.box(`bifocal line ${s}`,[c-wide+.007,.014,-.007,c+wide-.007,.0148,-.0065],flat(0x789294));
    }
  }
  tube(p,'bridge',V(-.017,.033,-.006),V(.017,.033,-.006),.0025,.0025,8,frame);
}

function jewelry(p,d) {
  const i=d.id;
  const metal=steelP(i.startsWith('gold')?0xbc9856:i.startsWith('copper')?0xad6d45:0x999790);
  if (i==='hairpin') {
    path(p,'spring pin',[[-.022,.002,-.003],[.016,.002,-.003],[.021,.002,0],[.017,.002,.004],[-.021,.002,.005]],.0014,metal);
  } else if (i==='pin_badge') {
    drawBadge(p,i);
  } else {
    const bracelet=i.includes('bracelet');
    loop(p,'band',[0,bracelet?.005:.002,0],bracelet?.027:.009,.0018,bracelet?clothP(d.color):metal,{},12);
    if (i==='ring_signet') bevel(p,'engraved gold signet',[-.007,.002,-.014,.007,.006,-.004],.0015,steelP(0xb99a57));
    if (i==='bracelet_friendship') {
      for (let k=0;k<12;k++) {
        const a=k*Math.PI/6;
        cyl(p,`colorful clasp ${k}`,'y',[Math.cos(a)*.027,.005,Math.sin(a)*.027],.0029,.006,6,
          plasticP([0xa36a68,0xc6a06b,0x6c8e86,0x7b7195][k%4]));
      }
    }
    if (i==='bead_bracelet') {
      for (let k=0;k<12;k++) {
        const a=k*Math.PI/6;
        cyl(p,`bead ${k}`,'y',[Math.cos(a)*.027,.004,Math.sin(a)*.027],.004,.008,6,plasticP(shade(d.color,k%2?.65:1.3)));
      }
    }
  }
}

export const wear = {
  pack:bag, purse:bag, fabric, shirt, pants, skirt, intimates, pair, glasses, jewel:jewelry,
};
