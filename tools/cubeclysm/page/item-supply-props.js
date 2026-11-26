import { blob, coil, lump, loop, pile, speckle, stoneP, woodP } from './item-kit.js';
import { GLASS, V, bevel, clothP, cyl, fill, flat, label, lid, path, plasticP, poly, ring, rubber, shade, steelP, top, tube } from './common-loot-kit.js';
import { cutShape, oval, profile } from './item-workshop-kit.js';
import { workshopParts } from './item-workshop-parts.js';
import { workshopTools } from './item-workshop-tools.js';

const steel=steelP(0xa4aaa7), iron=steelP(0x63676a), brass=steelP(0xb29761);
const cream=plasticP(0xe4dbc5), dark=plasticP(0x49484a), wood=woodP(0xa27c51), glass=flat(0xa5c0be);

function stock(p,d) {
  const {id,shape,color}=d;
  if(shape==='gem'){
    const tone={diamond:0xc0d3d5,pearl:0xe5d5c6,opal:0xb2b5a4,emerald:0x638f79}[id]??color;
    if(id==='pearl') blob(p,'iridescent pearl',[.38,.364,.364],[0,.356,0],plasticP(tone),{},5,12);
    else if(id==='opal') lump(p,'polished opal',[.411,.183,.303],speckle(id,tone,[0x8ba5a4,0xdaab87,0x9b9ab8,0xd4d1a8],.49),id);
    else profile(p,'faceted gemstone',[[0,0],[.102,.04],[.343,.231],[.425,.306],[.255,.432],[0,.432]],plasticP(tone),{sides:id==='emerald'?6:8,scale:[1,id==='emerald'?.74:1]});
  } else if(id==='manhole_cover'){
    cyl(p,'cast manhole lid','y',[0,.067,0],.434,.133,18,iron);
    ring(p,'rolled edge',.375,.432,.135,steel,[0,0],18);
    for(let x=-.269;x<=.28;x+=.088) for(let z=-.268;z<=.28;z+=.088) if(Math.hypot(x,z)<.354)
      p.box('raised tread', [x-.024,.13,z-.015,x+.024,.151,z+.015],iron);
  } else if(id==='circsaw_blade'){
    const edge=Array.from({length:72},(_,i)=>{
      const a=i*Math.PI/36,r=i%3===1?.435:.388;
      return [Math.cos(a)*r,Math.sin(a)*r];
    });
    cutShape(p,'toothed saw disc',edge,.032,steel,0,[oval(0,0,.092,.092)]);
  } else if(id==='magnet'){
    cutShape(p,'horseshoe magnet',[[ -.33,.322],[-.33,-.118],[-.26,-.28],[0,-.377],[.26,-.28],[.33,-.118],[.33,.321],[.174,.321],[.174,-.083],[.102,-.171],[-.102,-.171],[-.174,-.083],[-.174,.321]],.104,plasticP(0xa25954));
    for(const x of [-.252,.252]) p.box('bare pole tip',[x-.074,0,.254,x+.074,.108,.338],steel);
  } else if(id==='yarn') {
    blob(p,'ball of yarn',[.337,.291,.33],[0,.289,0],clothP(color),{},4,12);
    for(const x of [-.08,0,.093]) path(p,'wrapped yarn strand',[[x,.071,-.285],[x+.04,.288,-.327],[x+.061,.522,-.175],[x+.026,.547,.169]],.016,clothP(shade(color,.83)));
    path(p,'loose yarn end',[[.198,.114,.23],[.334,.031,.311],[.422,.025,.257],[.368,.025,.116]],.015,clothP(color));
  } else if(id==='tanbark'){
    cutShape(p,'irregular slab of bark',[[-.426,-.277],[-.27,-.35],[.257,-.313],[.418,-.165],[.374,.309],[.051,.347],[-.246,.282],[-.417,.135]],.059,woodP(0x81604a));
    for(let n=0;n<8;n++){
      const x=(n-3.5)*.089;
      path(p,'bark ridge',[[x,.059,-.253],[x-.029,.079,-.114],[x+.026,.069,.057],[x-.035,.073,.249]],.015,woodP(n%2?0x88654b:0x6b523f));
    }
  } else if(id==='tin'){
    const powder=speckle(id,0xa5a6a1,[0x919491,0xbabcb7,0x959da0],.57);
    pile(p,'loose fine tin powder',.425,.119,powder,id);
    for(const [x,z] of [[-.309,-.11],[.226,-.185],[.148,.238]])
      lump(p,'powder spill',[.112,.016,.076],powder,id+x,{},[x,.005,z]);
  } else if(id==='scrap_bronze'){
    for(const [x,z,r] of [[-.186,-.113,.21],[.214,-.12,.18],[-.027,.17,.212]])
      lump(p,'bronze scrap chunk',[r,.107,r*.82],steelP(0xb2825c),id+x,{metal:true},[x,0,z]);
  } else if(id==='ash'){
    pile(p,'loose gray ash',.416,.117,stoneP(0x90918c),id);
    for(const [x,z] of [[-.091,.127],[.158,-.153],[-.234,-.078]]) lump(p,'char fragment',[.061,.031,.036],stoneP(0x5a5755),id+x,{},[x,.039,z]);
  } else if(shape==='gasket'){
    for(const [x,z,r] of [[-.201,-.156,.191],[.198,.081,.161],[-.12,.252,.118]])
      cutShape(p,'plastic gasket',oval(x,z,r,r,14),.018,rubber,.01,[oval(x,z,r*.60,r*.60,14)]);
  } else if(shape==='hardware') {
    if(id==='filter_air'||id==='filter_liquid'){
      const square=id==='filter_air';
      if(square){
        bevel(p,'molded filter frame',[-.424,0,-.301,.424,.103,.302],.028,plasticP(0x55585b));
        for(let i=0;i<12;i++) p.box('pleated filter paper',[-.363+i*.062,.093,-.253,-.324+i*.062,.13,.253],cream);
      } else {
        const canSteel=steelP(0x7d9297);
        cyl(p,'steel oil filter can','z',[0,.204,0],.195,.737,14,canSteel,{metal:true});
        cyl(p,'rolled seam','z',[0,.204,-.344],.204,.062,14,steel);
        cyl(p,'closed domed end','z',[0,.204,.351],.188,.048,14,canSteel,{},.163);
        for(let n=0;n<8;n++){
          const a=Math.PI*n/4;
          cyl(p,'dark inlet recess','z',[.121*Math.cos(a),.204+.121*Math.sin(a),-.378],.022,.013,8,dark);
        }
        cyl(p,'threaded center recess','z',[0,.204,-.381],.049,.015,10,iron,{open:true});
      }
    } else if(id==='fanblade_metal') {
      cyl(p,'drive hub','y',[0,.074,0],.102,.148,12,iron);
      for(let n=0;n<4;n++){
        const a=n*Math.PI/2;
        const blade=[[.053,-.026],[.224,-.108],[.409,-.08],[.393,.10],[.208,.159],[.093,.061]];
        cutShape(p,'pressed fan blade',blade.map(([x,z])=>[x*Math.cos(a)-z*Math.sin(a),x*Math.sin(a)+z*Math.cos(a)]),.042,steel,.057);
      }
    } else if(id==='block_and_tackle'){
      for(const x of [-.15,.15]) {
        cyl(p,'pulley body','z',[x,.143,0],.139,.218,13,iron);
        cyl(p,'rope sheave','z',[x,.143,.123],.103,.045,12,steel);
      }
      path(p,'tackle loop',[[.132,.068,-.106],[.303,.048,-.269],[.183,.037,-.364],[-.139,.037,-.363],[-.297,.048,-.271],[-.141,.067,-.105]],.023,clothP(0xad9268));
    } else {
      const cap=plasticP(0xe1d8bb), blue=plasticP(0x6a9fb0);
      tube(p,'molded plastic valve body',V(-.365,.091,0),V(.365,.091,0),.066,.066,10,cap);
      for(const x of [-.298,.297]) cyl(p,'plastic hose lip','x',[x,.09,0],.076,.045,10,cap,{open:true});
      cyl(p,'plastic valve stem','y',[0,.107,0],.099,.212,10,cap);
      bevel(p,'blue turning lever',[-.139,.194,-.062,.139,.243,.062],.017,blue);
    }
  } else if(id==='hd_valve'||id==='hd_pipe'||id==='hd_pipe_fittings'){
    const long=id==='hd_pipe', fittings=id==='hd_pipe_fittings';
    const pos=fittings?[-.181,.17]:[0];
    for(const x of pos){
      const length=long?.425:.242;
      const layout=p.group('pipe axis',{at:[x,.161,0],rotX:Math.PI/2});
      const section=[[.091,-length],[.165,-length],[.165,-length+.038],[.15,-length+.059],[.15,length-.059],
        [.165,length-.039],[.165,length],[.091,length],[.091,-length]];
      profile(p,'thick-bore pipe',section,steel,{parent:layout,sides:14,metal:true});
    }
    if(fittings) {
      cyl(p,'tee branch','x',[-.07,.161,.034],.113,.183,11,steel,{open:true});
      cyl(p,'hexagonal loose cap','y',[.191,.091,-.329],.115,.114,6,iron);
    }
    if(id==='hd_valve') {
      cyl(p,'valve stem','y',[0,.25,0],.045,.31,10,steel);
      loop(p,'valve hand wheel',[0,.411,0],.143,.019,iron,{},12);
    }
  } else if(/glass_pane|kevlar|ceramic/.test(id)){
    const isGlass=id.includes('glass');
    const paint=isGlass?glass:id==='ceramic_armor'?plasticP(0xa39883):clothP(0xa49362);
    const edge=[[-.433,-.303],[.433,-.303],[.433,.305],[-.433,.305]];
    if(isGlass) {
      bevel(p,'thick laminated glass panel',[-.431,0,-.302,.431,.096,.302],.017,paint,GLASS);
      for(const y of [.028,.053,.074]) p.box('lamination edge',[-.418,y,-.306,.418,y+.005,-.299],glass,GLASS);
    } else if(id==='sheet_kevlar_layered'){
      for(let n=0;n<16;n++) cutShape(p,'woven lamina',edge,.006,clothP(n%2?0xa49362:0x968658),n*.0055);
    } else bevel(p,'single ceramic plate',[-.42,0,-.287,.42,.073,.288],.027,paint);
    
  } else {
    const tones={chunk_feldspar:0xb4a58e,material_shrd_limestone:0xb0a897,scrap_bronze:0xb2825c,tin:0xa9aaa8,chunk_sulfur:0xc6ac63,chunk_borax:0xc9c2b2};
    workshopParts.stock(p,{...d,color:tones[id]??color});
  }
}

function home(p,d) {
  const {id,shape,color}=d;
  if(shape==='fabric') {
    const paint=clothP(id==='g_carpet'?0x617753:0xc2a054);
    const inner=clothP(id==='g_carpet'?0x899078:0x9f8a5c);
    cyl(p,'rolled carpet','x',[0,.142,.081],.142,.857,16,paint);
    for(const x of [-.432,.432]) cyl(p,'exposed roll edge','x',[x,.145,.079],.118,.017,16,inner);
    for(const x of [-.445,.445]) cyl(p,'dark roll core','x',[x,.145,.079],.036,.029,12,dark,{open:true});
    cutShape(p,'unrolled carpet edge',[[-.408,.121],[.408,.121],[.408,.389],[-.408,.389]],.025,paint);
    return;
  }
  if(shape==='table') {
    if(/spork|foon/.test(id)){
      const paint=id==='spork'?steel:cream;
      bevel(p,'utensil grip',[-.057,0,.007,.057,.042,.417],.013,paint);
      const bowl=[[-.096,.021],[-.15,-.172],[-.126,-.334],[-.075,-.401],[.078,-.401],[.132,-.333],[.145,-.167],[.093,.013]];
      cutShape(p,'shallow scoop',bowl,.036,paint,.009);
      for(const x of [-.085,-.034,.026,.083]) p.box('fork tine',[x-.017,.012,-.44,x+.019,.046,-.337],paint);
    } else {
      profile(p,'shallow plate or screen',[[0,0],[.291,0],[.4,.042],[.427,.087],[.387,.093],[.359,.053],[0,.025]],steel,{sides:17,metal:true});
      if(id==='splatter_guard') {
        for(let i=-6;i<=6;i++){
          const x=i*.052,z=Math.sqrt(.353**2-x*x);
          tube(p,'mesh filament',V(x,.043,-z),V(x,.043,z),.006,.006,6,iron);
        }
        bevel(p,'guard handle',[.333,.022,-.044,.522,.067,.045],.021,dark);
      }
    }
  } else if(shape==='clock'){
    const alarm=id==='alarmclock';
    cyl(p,'clock case','z',[0,.354,0],.346,.183,15,plasticP(color));
    cyl(p,'clock dial','z',[0,.357,-.096],.292,.026,15,cream);
    path(p,'clock hands',[[-.108,.432,-.113],[0,.357,-.113],[.151,.448,-.113]],.013,dark);
    for(let n=0;n<12;n++){
      const a=n*Math.PI/6;
      cyl(p,'hour mark','z',[.238*Math.cos(a),.357+.238*Math.sin(a),-.112],.013,.01,7,iron);
    }
    if(alarm) {
      for(const x of [-.219,.219]) {
        blob(p,'alarm bell',[.105,.094,.091],[x,.657,0],steel,{},3,10);
        bevel(p,'clock foot',[x-.065,0,-.088,x+.07,.079,.10],.029,steel);
      }
      path(p,'carry loop',[[-.098,.594,0],[-.066,.731,0],[.067,.731,0],[.099,.595,0]],.019,steel);
    }
  } else if(shape==='writing') {
    if(id==='eraser') {
      bevel(p,'rubber eraser',[-.342,0,-.203,.339,.127,.204],.029,plasticP(0xb76f6e));
      top(p,'paper sleeve',[-.181,-.171,.185,.169],.129,label(0x9d8767,'ERASER',d.key));
    } else {
      bevel(p,'pencil sharpener body',[-.25,0,-.31,.25,.137,.311],.041,steel);
      cyl(p,'pencil opening','z',[0,.075,-.283],.071,.037,10,dark);
      bevel(p,'blade mount',[-.102,.116,-.178,.101,.152,.197],.016,iron);
    }
  } else workshopParts.home(p,d);
}

function toy(p,d){
  const {id,shape,color}=d;
  if(shape==='tabletop') {
    if(id==='connect_four'){
      const blue=plasticP(0x5b7894), red=plasticP(0xaf5a52), yellow=plasticP(0xc5a255);
      bevel(p,'upright game stand',[-.439,0,-.115,.439,.071,.114],.019,blue);
      for(const x of [-.401,.401]) bevel(p,'vertical game frame',[x-.021,.045,-.057,x+.021,.662,.058],.012,blue);
      for(let row=0;row<=6;row++){
        const y=.077+row*.092;
        p.box('horizontal grid bar',[-.396,y-.012,-.028,.396,y+.012,.028],blue);
      }
      for(let col=0;col<=7;col++){
        const x=-.378+col*.108;
        p.box('vertical grid bar',[x-.012,.074,-.031,x+.012,.64,.031],blue);
      }
      for(const [col,row] of [[0,0],[1,0],[2,0],[3,0],[3,1],[4,0],[4,1],[4,2],[5,0]]){
        const x=-.324+col*.108,y=.123+row*.092;
        cyl(p,'inset game disc','z',[x,y,0],.043,.058,12,(col+row)%2?red:yellow);
      }
      bevel(p,'instruction leaflet',[-.216,0,.179,.211,.026,.379],.009,cream);
      top(p,'rule booklet',[-.196,.201,.18,.343],.027,label(0x6d819a,'FOUR IN A ROW',d.key));
      return;
    }
    if(/^dnd(?:_|$)/.test(id)){
      const tint=id==='dnd_2'?0x6a7557:id==='dnd_3'?0x9b7653:0x655e75;
      const motif=id==='dnd_2'?'WAYFINDER':id==='dnd_3'?'DAWN OF MAN':'BLOBS AND BANDITS';
      bevel(p,'roleplaying rulebook',[-.399,0,-.301,.397,.086,.298],.019,cream);
      bevel(p,'printed rulebook cover',[-.411,.077,-.305,.411,.105,.307],.009,plasticP(tint));
      top(p,'printed original game cover',[-.371,-.272,.372,.278],.108,label(tint,motif,d.key));
      for(const [x,z] of [[.26,.161],[.15,.23],[-.26,.191]]) {
        profile(p,'game die',[[0,.109],[.035,.109],[.05,.145],[.031,.174],[0,.174]],plasticP(shade(tint,1.33)),{sides:6,at:[x,z]});
      }
      return;
    }
    if(id==='chess') return workshopParts.toy(p,{...d,id:'small_chess'});
    if(id==='shogi'||id==='othello'||id==='battleship'){
      const shogi=id==='shogi', naval=id==='battleship', board=plasticP(naval?0x5b778a:0x607d64);
      bevel(p,'divided game board',[-.426,0,-.306,.425,.101,.305],.028,shogi?wood:board);
      const grid=shogi?flat(0x745844):flat(naval?0x819ca2:0x9aa98d);
      for(let n=0;n<9;n++){
        const x=-.367+n*.092,z=-.264+n*.066;
        top(p,'grid stripe',[x-.002,-.265,x+.003,.265],.103,grid);
        top(p,'grid stripe',[-.369,z-.002,.366,z+.003],.104,grid);
      }
      for(const [i,[x,z]] of [[-.227,-.139],[.139,-.008],[.223,.143],[-.146,.147]].entries()){
        if(shogi) cutShape(p,'pentagonal shogi tile',[[x-.036,z+.03],[x+.036,z+.03],[x+.026,z-.018],[x,z-.043],[x-.027,z-.018]],.035,cream,.104);
        else if(naval) bevel(p,'miniature ship',[x-.077,.104,z-.024,x+.074,.144,z+.027],.014,steel);
        else cyl(p,'reversible game disc','y',[x,.122,z],.038,.035,12,i%2?cream:dark);
      }
      if(naval) bevel(p,'upright divider board',[-.402,.093,-.024,.402,.383,.025],.015,board);
      return;
    }
    const gameNames={monopoly:'PROPERTY',dnd:'ADVENTURE',dnd_2:'ADVENTURE II',dnd_3:'ADVENTURE III',catan:'ISLAND',clue:'MYSTERY',scrabble:'WORD GAME',pictionary:'DRAW & GUESS',battleship:'NAVAL GAME',ouija:'SPIRIT BOARD'};
    const paint=plasticP(color);
    bevel(p,'board game base',[-.425,0,-.312,.425,.105,.312],.031,wood);
    top(p,'printed game board',[-.391,-.277,.391,.277],.107,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0xcbba94);
      if(id==='catan') {
        for(let row=0;row<3;row++) for(let col=0;col<4;col++){
          const cx=x+(col*.19+.17+(row%2)*.085)*w,cy=y+(row*.236+.212)*h;
          ctx.beginPath();
          for(let k=0;k<6;k++){
            const a=k*Math.PI/3+Math.PI/6;
            const u=cx+Math.cos(a)*w*.111,v=cy+Math.sin(a)*h*.13;
            if(k===0) ctx.moveTo(u,v); else ctx.lineTo(u,v);
          }
          ctx.closePath();
          ctx.fillStyle=['#b79551','#81935f','#946f55','#618581'][(row+col)%4];
          ctx.fill();
        }
      } else if(id==='ouija'){
        ctx.textAlign='center';
        ctx.font=`bold ${Math.max(6,Math.floor(h*.114))}px serif`;
        ctx.fillStyle='#695047';
        ctx.fillText('A B C D E F G H I J K L M',x+w*.5,y+h*.31,w*.83);
        ctx.fillText('N O P Q R S T U V W X Y Z',x+w*.5,y+h*.51,w*.84);
        ctx.fillText('1 2 3 4 5 6 7 8 9 0',x+w*.5,y+h*.77,w*.67);
      } else {
        for(let k=0;k<8;k++) {
          fill(ctx,x+k*w/8,y,w*.07,h*.20,colFor(k));
          fill(ctx,x+k*w/8,y+h*.8,w*.07,h*.20,colFor(k+3));
        }
        label(color,gameNames[id]??d.name,d.key)(ctx,x+w*.16,y+h*.26,w*.69,h*.46);
      }
    });
    if(id==='scrabble'){
      for(let k=0;k<6;k++) bevel(p,'wood letter tile',[-.322+k*.105,.107,.175,-.259+k*.105,.145,.242],.007,cream);
    } else if(id==='ouija'){
      cutShape(p,'planchette',[[ -.118,.16],[-.101,.042],[.031,-.071],[.158,.047],[.182,.15]],.042,paint,.113,[oval(.042,.086,.035,.038)]);
    } else for(const [x,z] of [[-.24,-.144],[.206,.105]]) {
      cyl(p,'move counter','y',[x,.12,z],.047,.04,10,paint);
    }
    return;
  }
  if(shape==='plush'){
    if(id==='toy_figurine'){
      const shell=plasticP(color);
      cyl(p,'collectible display plinth','y',[0,.05,0],.219,.099,12,dark);
      bevel(p,'upright figurine body',[-.105,.102,-.102,.105,.462,.101],.039,shell);
      blob(p,'plastic head',[.102,.106,.092],[0,.547,-.012],cream,{},4,10);
      for(const x of [-.111,.111]) path(p,'molded arm',[[x,.392,-.019],[x*1.64,.334,-.041],[x*1.69,.243,-.043]],.039,shell);
      return;
    }
    const fabric=clothP(id==='talking_doll'?0x9b697f:id==='creepy_doll'?0x746365:color);
    const skin=plasticP(0xc2a487);
    bevel(p,'small toy torso',[-.159,.029,-.191,.159,.143,.131],.054,fabric);
    blob(p,'toy head',[.153,.094,.123],[0,.106,-.282],skin,{},4,10);
    for(const s of [-1,1]) {
      path(p,'doll arm',[[s*.13,.083,-.153],[s*.218,.067,-.013],[s*.201,.064,.138]],.053,fabric);
      path(p,'doll leg',[[s*.082,.075,.075],[s*.092,.076,.226],[s*.101,.056,.358]],.066,fabric);
      blob(p,'eye',[.022,.012,.019],[s*.047,.198,-.294],dark,{},3,6);
    }
    if(id==='talking_doll') ring(p,'pull loop',.039,.061,.157,cream,[0,.021],12);
    return;
  }
  if(id==='shuttlecock'){
    blob(p,'rounded cork tip',[.12,.104,.12],[0,.104,0],cream,{},4,10);
    profile(p,'feather cage',[[.11,.13],[.136,.196],[.255,.485],[.247,.496],[.229,.456],[.108,.196]],plasticP(0xddd4c1),{sides:14});
    for(let n=0;n<12;n++){
      const a=n*Math.PI/6;
      tube(p,'quill shaft',V(.099*Math.cos(a),.147,.099*Math.sin(a)),V(.252*Math.cos(a),.489,.252*Math.sin(a)),.013,.009,7,cream);
    }
  } else if(id==='disc_golf'){
    profile(p,'dense flying disc',[[0,0],[.328,0],[.431,.027],[.448,.044],[.428,.081],[.314,.095],[0,.095]],plasticP(color),{sides:18});
    ring(p,'target ring print',.221,.241,.097,plasticP(shade(color,.67)),[0,0],18);
  } else if(id==='puck'){
    cyl(p,'rubber hockey puck','y',[0,.082,0],.418,.164,16,rubber);
    top(p,'puck top',[-.15,-.125,.152,.129],.084+.082,label(0x555653,'HOCKEY',d.key));
  } else if(id==='glowstick_dead'){
    cyl(p,'spent translucent tube','z',[0,.075,0],.075,.809,12,plasticP(0x849b78),GLASS);
    for(const z of [-.394,.395]) cyl(p,'sealed tube end','z',[0,.075,z],.078,.047,10,plasticP(0x708460));
  } else if(id==='pom_poms'){
    for(const x of [-.227,.227]) {
      blob(p,'tinsel tuft',[.188,.145,.21],[x,.133,-.138],x<0?clothP(0xa75350):steelP(0xb9b9aa),{},4,11);
      for(let n=0;n<10;n++){
        const a=n*Math.PI/5;
        tube(p,'ribbon strand',V(x,.101,-.136),V(x+.194*Math.cos(a),.137+n%3*.038,-.138+.204*Math.sin(a)),.018,.005,6,n%2?steel:clothP(0xae5655));
      }
      cyl(p,'grip','z',[x,.072,.125],.047,.288,10,dark);
    }
  } else if(id==='cane'||id==='wizard_cane'||id==='hockey_stick'){
    tube(p,'tapered shaft',V(0,.04,-.401),V(0,.047,.423),.029,.025,10,wood);
    if(id==='hockey_stick') cutShape(p,'curved hockey blade',[[ -.033,.339],[.061,.401],[.24,.415],[.301,.36],[.244,.322],[.033,.31]],.033,wood,.021);
    else path(p,'metal headpiece',[[0,.041,-.364],[.01,.055,-.449],[.098,.054,-.477],[.174,.052,-.427],[.159,.05,-.345]],.036,steel);
    if(id==='wizard_cane') blob(p,'white light orb',[.085,.077,.085],[.132,.067,-.417],plasticP(0xdcded2),{},4,11);
  } else if(id==='magic_8_ball'||id==='beach_volleyball'){
    const magic=id==='magic_8_ball';
    blob(p,'ball',[.428,.428,.428],[0,.431,0],plasticP(magic?0x444148:0xd8d5bb),{},5,14);
    if(magic) {
      cyl(p,'white number inset','y',[0,.866,0],.129,.026,14,cream);
      top(p,'number 8',[-.092,-.073,.094,.072],.88,label(0xd8cebe,'8',d.key));
    } else {
      const bands=[0xd3a456,0x688da1,0xb86968,0xd4c5a0];
      for(let n=0;n<16;n++) {
        const a=n*Math.PI/8,b=a+.167;
        const shellSection=[[-.922,.167],[-.68,.317],[-.37,.4],[0,.429],[.37,.4],[.68,.317],[.922,.167]];
        for(let j=0;j<shellSection.length-1;j++) {
          const [y,r]=shellSection[j],[Y,R]=shellSection[j+1];
          const point=(t,u,v)=>V(Math.cos(t)*v,u*.439+.432,Math.sin(t)*v);
          poly(p,'colored volleyball panel',[point(a,y,r),point(b,y,r),point(b,Y,R),point(a,Y,R)],V(Math.cos(a),0,Math.sin(a)),plasticP(bands[Math.floor(n/4)]));
        }
      }
    }
  } else workshopParts.toy(p,d);
}
const colFor=k=>[0x8e9b69,0xb37466,0xb79961,0x738a94][k%4];

function instrument(p,d){
  const {id,shape,color}=d;
  if(id==='ukulele'){
    const body=[[-.104,-.111],[-.179,-.094],[-.205,-.04],[-.199,.037],[-.165,.089],[-.165,.149],[-.212,.203],[-.246,.267],[-.229,.347],[-.169,.4],[-.083,.42],[.083,.42],[.169,.4],[.229,.347],[.246,.267],[.212,.203],[.165,.149],[.165,.089],[.199,.037],[.205,-.04],[.179,-.094],[.104,-.111]];
    cutShape(p,'curved wooden sound box',body,.087,wood);
    cyl(p,'sound-hole inset','y',[0,.089,.104],.07,.007,12,dark);
    bevel(p,'neck',[-.053,.046,-.475,.054,.096,-.083],.016,wood);
    bevel(p,'headstock',[-.075,.055,-.518,.075,.113,-.365],.018,wood);
    for(const x of [-.036,-.012,.012,.036]) tube(p,'string',V(x,.106,-.431),V(x,.097,.277),.004,.004,6,steel);
    p.box('bridge',[-.075,.085,.232,.076,.114,.279],dark);
  } else if(id==='cow_bell'){
    cutShape(p,'flared bell body',[[ -.158,-.29],[.158,-.29],[.261,.31],[-.261,.31]],.17,brass);
    p.box('shadowed bell mouth',[-.207,.029,.311,.207,.142,.321],dark);
    p.box('rolled bell lip',[-.26,.151,.295,.26,.177,.326],brass);
    tube(p,'clapper',V(.01,.124,.278),V(.031,.072,.358),.026,.025,8,iron);
    path(p,'mounting loop',[[-.101,.122,-.236],[-.099,.229,-.255],[.106,.23,-.252],[.103,.125,-.236]],.026,iron);
  } else if(id==='microphone_xlr_generic'){
    cyl(p,'microphone handle','z',[0,.11,.071],.105,.622,12,plasticP(color));
    blob(p,'woven grille',[.157,.136,.163],[0,.134,-.31],speckle(id,0x9da3a0,[0x777f80,0xbfc0b5],.56),{},4,13);
    cyl(p,'grille ring','z',[0,.12,-.212],.133,.044,12,steel);
    for(const [x,y] of [[ -.031,.105],[.031,.105],[0,.14]]) cyl(p,'connector pin','z',[x,y,.395],.011,.043,7,steel);
    cutShape(p,'loose microphone clip',oval(.241,.141,.098,.113,10),.046,dark,.006,[oval(.241,.141,.063,.072,10)]);
  } else if(shape==='audio'){
    path(p,'neck bracket',[[-.314,.036,.197],[-.381,.039,-.043],[-.267,.043,-.312],[.267,.043,-.312],[.381,.04,-.042],[.314,.036,.195]],.022,steel);
    bevel(p,'harmonica mouthpiece',[-.235,.028,.149,.235,.107,.246],.017,steel);
    for(let i=0;i<9;i++) p.box('dark reed opening',[-.188+i*.045,.059,.242,-.163+i*.045,.089,.25],dark);
  }
}
function artifact(p,d) {
  if(d.id==='art_snake') return coil(p,'twisting polished rod',.406,.049,1.82,steelP(d.color),{},d.id);
  if(d.id==='art_klein'){
    profile(p,'curved glass flask',[[0,0],[.293,0],[.323,.068],[.278,.379],[.12,.49],[.077,.542],[.067,.744],[.05,.745],[.055,.525],[.208,.438],[.258,.089],[0,.049]],glass,GLASS);
    path(p,'returning glass neck',[[0,.723,0],[.145,.797,0],[.272,.712,0],[.232,.55,0],[.09,.403,0],[-.054,.316,0]],.051,glass,GLASS);
    return;
  }
  if(d.id==='art_irrational'){
    for(const [x,z,y] of [[0,0,0],[-.147,.109,.11],[.142,-.11,.219]]) bevel(p,'offset cubic facet',[x-.22,y,z-.217,x+.22,y+.247,z+.217],.033,stoneP(shade(d.color,.84+y)));
    return;
  }
  if(d.id==='art_crescent'){
    const vertices=[];
    for(let i=0;i<=12;i++){
      const a=.105+i*Math.PI*1.40/12;
      vertices.push([.426*Math.cos(a),.426*Math.sin(a)]);
    }
    for(let i=12;i>=0;i--){
      const a=.105+i*Math.PI*1.40/12;
      vertices.push([.285*Math.cos(a)+.064,.302*Math.sin(a)-.026]);
    }
    cutShape(p,'crescent stone',vertices,.078,stoneP(0x9c8b7d));
  } else {
    const rock=[[-.383,-.16],[-.286,-.311],[.132,-.347],[.362,-.208],[.394,.112],[.248,.3],[-.152,.326],[-.348,.214]];
    cutShape(p,'angular carved stone',rock,.184,stoneP(0x928b7b));
    for(const [x,z] of [[-.12,-.091],[.132,.081]]) {
      const spiral=Array.from({length:22},(_,i)=>{
        const a=i*.405,r=.008+i*.006;
        return [x+Math.cos(a)*r,.19,z+Math.sin(a)*r];
      });
      path(p,'darker spiral marking',spiral,.009,stoneP(0x706b5f));
    }
  }
}

function handtool(p,d){
  const {id,shape,color}=d;
  if(id==='press'){
    p.box('press foot',[-.34,0,-.252,.34,.07,.254],iron);
    for(const x of [-.253,.253]) p.box('upright frame',[x-.037,.069,-.171,x+.037,.73,.17],steel);
    p.box('upper crossbar',[-.294,.668,-.172,.292,.729,.171],iron);
    p.box('press table',[-.247,.229,-.18,.247,.277,.18],iron);
    cyl(p,'central ram','y',[0,.491,0],.071,.381,12,steel);
    path(p,'long lever',[[.029,.578,.019],[.258,.583,-.103],[.384,.632,-.213]],.022,iron);
  } else if(id==='flint_steel'){
    lump(p,'flint nodule',[.225,.116,.237],stoneP(0x645c57),id,{},[-.163,0,-.09]);
    path(p,'steel striker',[[.151,.048,-.258],[.319,.048,-.133],[.357,.049,.057],[.213,.045,.259],[.055,.049,.204]],.033,steel);
  } else if(id==='luthier_toolset'){
    bevel(p,'open instrument tool roll',[-.41,0,-.305,.412,.054,.305],.024,clothP(0x8c6d57));
    for(const x of [-.254,-.088,.08,.25]) {
      cyl(p,'specialty file grip','z',[x,.091,.108],.047,.248,10,wood);
      tube(p,'file shaft',V(x,.087,-.001),V(x,.087,-.25),.019,.012,8,steel);
    }
  } else if(id==='knife_swissarmy'||id==='boxcutter'||id==='knife_folding'||id==='camping_multitool'){
    const paint=plasticP(id==='knife_swissarmy'?0xa55a51:id==='boxcutter'?0xba8e53:color);
    bevel(p,'closed folding tool case',[-.129,0,-.395,.129,.105,.403],.039,paint);
    p.box('folded metal liner',[-.115,.038,-.357,.115,.066,.351],steel);
    for(const z of [-.314,.319]) cyl(p,'pivot','y',[0,.105,z],.033,.016,9,steel);
    if(id==='boxcutter') bevel(p,'retract slider',[-.057,.095,-.156,.061,.143,.045],.013,rubber);
    if(id==='camping_multitool') path(p,'carry loop',[[0,.046,.366],[-.09,.043,.428],[-.056,.045,.49],[.06,.048,.488],[.09,.045,.431],[0,.045,.369]],.017,steel);
  } else workshopTools.handtool(p,{...d,id:shape==='shears'&&id==='scissors_child'?'kevlar_shears':id});
}

function stationery(p,d) {
  const {id,shape,color}=d;
  if(shape==='note') {
    const tone={lab_postit_tech:0xc97c73,lab_postit_blob:0x9da5a4,lab_postit_bio:0xdcc369}[id]??color;
    cutShape(p,'colored sticky memo',[[-.374,-.36],[.373,-.36],[.373,.363],[-.374,.363]],.017,flat(tone));
    top(p,'adhesive band',[-.371,-.351,.371,-.279],.019,flat(shade(tone,.92)));
    return;
  }
  if(shape==='brochure'){
    const covers={
      grocerybrochure:[0x8a7351,'GROCERIES'],historybrochure:[0x7c6459,'LOCAL HISTORY'],
      nightlifepamphlet:[0x655d79,'NIGHTLIFE'],evac_pamphlet:[0x92614f,'EMERGENCY SHELTER'],
      technologybrochure:[0x507581,'ELECTRONICS'],buylocalpamphlet:[0x668064,'BUY LOCAL'],
      getactivepamphlet:[0x78834e,'GET ACTIVE'],petpamphlet:[0x88779a,'PETS & CARE'],
    };
    const [tint,title]=covers[id]??[color,d.name];
    bevel(p,'folded three-panel leaflet',[-.331,0,-.429,.331,.034,.428],.009,cream);
    p.box('folded leaf edge',[-.327,.02,.397,.323,.043,.428],cream);
    top(p,'typeset and illustrated leaflet cover',[-.306,-.401,.305,.382],.044,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0xe4dbc4);
      label(tint,title,d.key)(ctx,x+w*.08,y+h*.09,w*.83,h*.37);
      for(let k=0;k<3;k++){
        const cell=x+w*(.098+k*.275);
        fill(ctx,cell,y+h*.52,w*.21,h*.17,shade(tint,1.28));
        fill(ctx,cell+w*.062,y+h*.55,w*.087,h*.102,shade(tint,.75));
        fill(ctx,cell,y+h*.73,w*.205,1,tint);
        fill(ctx,cell,y+h*.79,w*.164,1,tint);
      }
    });
    return;
  }
  if(id.startsWith('subway')||id==='survivormap'){
    const survivor=id==='survivormap', maintenance=id==='subwaymap';
    const base=flat(survivor?0xd5c9aa:maintenance?0xaababb:0xe2dace);
    bevel(p,'folded route chart',[-.432,0,-.306,.432,.025,.306],.007,base);
    top(p,'schematic routes',[-.392,-.275,.39,.272],.027,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,survivor?0xd5c9aa:maintenance?0xaababb:0xe2dace);
      const units=[
        [[.09,.23],[.38,.23],[.54,.41],[.85,.41]],
        [[.15,.68],[.31,.48],[.52,.48],[.69,.24],[.91,.24]],
        [[.07,.53],[.31,.53],[.43,.72],[.79,.72],[.9,.61]],
      ];
      for(const [i,route] of units.entries()){
        ctx.strokeStyle=['#946258','#5b7a77','#6f6f93'][i];ctx.lineWidth=survivor?1:2;
        ctx.beginPath();
        route.forEach(([a,b],k)=>k===0?ctx.moveTo(x+w*a,y+h*b):ctx.lineTo(x+w*a,y+h*b));
        ctx.stroke();
        for(const [a,b] of route) fill(ctx,x+w*a-1,y+h*b-1,3,3,survivor?0x77554b:0xe1d7be);
      }
      if(survivor) for(const [a,b] of [[.22,.35],[.64,.57],[.77,.23]]) {
        ctx.strokeStyle='#985e55';ctx.beginPath();ctx.arc(x+w*a,y+h*b,2.5,0,Math.PI*2);ctx.stroke();
      }
    });
    return;
  }
  if(id.startsWith('lab_file_')){
    bevel(p,'official protocol sheet',[-.289,0,-.419,.29,.018,.419],.004,cream);
    top(p,'department insignia and printed lines',[-.254,-.383,.254,.383],.021,(ctx,x,y,w,h)=>{
      fill(ctx,x,y,w,h,0xddd5bd);
      ctx.strokeStyle='#6a8e87';ctx.lineWidth=1.3;
      for(const angle of [0,Math.PI/3,Math.PI*2/3]) {
        ctx.beginPath();ctx.ellipse(x+w*.5,y+h*.25,w*.23,h*.069,angle,0,Math.PI*2);ctx.stroke();
      }
      fill(ctx,x+w*.474,y+h*.195,w*.057,h*.106,0x826457);
      if(id==='lab_file_psych') fill(ctx,x+w*.399,y+h*.235,w*.208,h*.031,0x826457);
      else fill(ctx,x+w*.432,y+h*.255,w*.136,h*.062,0x826457);
      for(let i=0;i<8;i++) fill(ctx,x+w*.16,y+h*(.415+i*.056),w*(.60-(i%3)*.063),Math.max(1,h*.014),0x8b7c67);
    });
    return;
  }
  if(!id.startsWith('missing_poster')) return workshopParts.paper(p,d);
  const paper=flat(0xdfd3b5), animal=id.endsWith('_cat');
  cutShape(p,'missing poster sheet',[[-.309,-.432],[.309,-.432],[.309,.43],[-.309,.43]],.018,paper);
  top(p,'printed portrait and heading',[-.276,-.399,.276,.399],.021,(ctx,x,y,w,h)=>{
    fill(ctx,x,y,w,h,0xdfd3b5);
    ctx.fillStyle='#514947';
    ctx.font=`bold ${Math.max(6,Math.floor(w*.137))}px monospace`;
    ctx.fillText('MISSING',x+w*.13,y+h*.13,w*.77);
    fill(ctx,x+w*.15,y+h*.21,w*.70,h*.46,animal?0x9d9e82:id.endsWith('child')?0xa9a68d:0x899b98);
    if(animal){
      fill(ctx,x+w*.24,y+h*.42,w*.36,h*.12,0xb08862);
      fill(ctx,x+w*.53,y+h*.32,w*.192,h*.18,0xb08862);
      for(const dx of [.54,.66]) fill(ctx,x+w*dx,y+h*.276,w*.054,h*.069,0x8b6b56);
    } else {
      fill(ctx,x+w*.402,y+h*.277,w*.207,h*.244,0x6c5d52);
      fill(ctx,x+w*.423,y+h*.343,w*.162,h*.154,0xcaa17f);
      fill(ctx,x+w*.313,y+h*.522,w*.387,h*.142,id.endsWith('child')?0x9a664e:0x67747a);
    }
    for(let n=0;n<4;n++) fill(ctx,x+w*.15,y+h*(.73+n*.05),w*(.67-.06*n),Math.max(1,h*.017),0x817364);
  });
}
function optics(p,d){
  const axis=p.group('door lens axis',{at:[0,.119,0],rotX:Math.PI/2});
  profile(p,'brass door peep tube',[[.067,-.371],[.105,-.371],[.136,-.329],[.132,-.24],[.096,-.209],[.096,.296],[.142,.32],[.142,.375],
    [.093,.381],[.071,.315],[.067,-.371]],brass,{parent:axis,sides:14,metal:true});
  cyl(p,'small convex lens','z',[0,.118,.365],.083,.024,14,glass,GLASS);
}
function handle(p,d){
  if(d.id==='e_tool'){
    const olive=plasticP(0x656b55);
    cutShape(p,'folding steel spade blade',[[ -.127,-.09],[-.21,-.331],[-.125,-.415],[0,-.447],[.125,-.415],[.211,-.333],[.129,-.09]],.045,steel);
    cyl(p,'folding pivot','x',[0,.049,-.104],.053,.259,11,iron);
    tube(p,'collapsed handle tube',V(0,.059,-.076),V(0,.066,.321),.036,.034,10,olive);
    path(p,'loop grip',[[0,.061,.245],[-.113,.061,.338],[-.097,.061,.417],[.1,.061,.417],[.115,.061,.335],[0,.061,.245]],.026,olive);
    return;
  }
  if(d.id==='shovel_snow'){
    cutShape(p,'stamped snow scoop',[[ -.287,-.441],[.288,-.441],[.309,-.291],[.257,-.118],[-.256,-.118],[-.307,-.289]],.029,steel);
    for(const x of [-.241,-.121,0,.121,.241]) path(p,'pressed metal rib',[[x,.03,-.402],[x*.93,.046,-.254],[x*.89,.03,-.134]],.011,steel);
    tube(p,'snow shovel shaft',V(0,.048,-.179),V(0,.044,.426),.028,.025,9,wood);
    path(p,'D grip',[[0,.043,.361],[-.094,.04,.427],[-.075,.044,.471],[.071,.044,.471],[.095,.04,.428],[0,.043,.361]],.022,iron);
    return;
  }
  workshopTools.handle(p,{...d,id:d.id==='claw_bar'?'crowbar':d.id});
}
export const supplyProps={ stock,home,toy,instrument,artifact,handtool,handle,optics,paper:stationery };
