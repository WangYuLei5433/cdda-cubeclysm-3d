import { CatmullRomCurve3 } from 'three';
import { fishTail } from './fauna-fish-tails.js';
import { V, blob, hull, flat, shade, sides, ink, ivory, fur, chain, skin, markings, eye, blade } from './fauna-kit.js';
import { rng } from './paint.js';

// [body, belly, markings, width, height, snout length]
const frogs = {
  bullfrog:[0x627747,0xb6ae78,'spots',.32,.24,.32],
  foul:[0x67613a,0xb3a16c,'spots',.34,.22,.31],
  fowler:[0x877657,0xb9aa81,'spots',.28,.22,.29],
  freedom:[0x876048,0xc9ae81,'patches',.28,.23,.28],
  gray:[0x92948b,0xc6c29e,'patches',.245,.21,.28],
  green:[0x5b7546,0xd0b97c,'spots',.27,.19,.31],
  jumbo:[0x889668,0xd7c487,'spots',.26,.25,.26],
  leo:[0x938a61,0xc5b587,'spots',.28,.185,.32],
  mink:[0x799561,0xadbf8a,'spots',.26,.19,.28],
  odd:[0x776957,0xb2a177,'spots',.36,.225,.32],
  palette:[0xaa845d,0xd6ae7c,'palette',.26,.185,.26],
  pattern:[0xa6a59d,0xc0bbad,'static',.285,.22,.28],
  peeper:[0xa77c56,0xd7b789,'',.245,.175,.22],
  pickerel:[0x9c8055,0xc9ad69,'spots',.255,.183,.28],
  shift:[0x687b4a,0xa89e73,'patches',.255,.20,.25],
  spade:[0x827659,0xb7ac79,'patches',.32,.21,.24],
  strange:[0x628051,0xb7ac7c,'spots',.31,.24,.29],
  tail:[0x708a49,0xc0b579,'spots',.28,.20,.31],
  vocal:[0x977353,0xcbb089,'spots',.28,.22,.27],
  wood:[0x966f56,0xd4ba95,'',.255,.193,.28],
};
const tadpoles = {
  bullfrog:[0x706951,0xa69b74,.29,.16], foul:[0x78634b,0xb09975,.31,.083],
  fowler:[0x3f3933,0x6c5f47,.26,.073], freedom:[0x4c3a31,0x795747,.27,.072],
  gray:[0x827161,0xb7a183,.21,.22,0xbb553c], green:[0x687a4c,0xc7b870,.29,.14],
  leo:[0x756d60,0xa09374,.285,.21], mink:[0x887052,0xb6a07a,.29,.23],
  odd:[0x7b684d,0xc1aa7f,.305,.067], pattern:[0x827d78,0xc5beb3,.285,.12],
  peeper:[0x292731,0x373339,.18,.09], pickerel:[0xb2a06b,0xd9c498,.225,.105],
  shift:[0x76634d,0xc5a470,.265,.205,0xd74639], spade:[0x837961,0xb5aa85,.30,.12],
  strange:[0x697744,0xc0b476,.31,.14], vocal:[0x28262e,0x383040,.24,.14],
  wood:[0x84644c,0xb49a7d,.25,.13],
};
function tadpole(p,id,key) {
  const [body,belly,w,fin,tailTip]=tadpoles[key];
  const y=.255, point=key==='pickerel'||key==='wood';
  const dark=fur(shade(body,.72),id);
  skin(p,'tadpole-body',[[0,y+(key==='wood'?.11:.02),-.43,w*(point?.35:.62),.102],[0,y+.012,-.27,w*.96,.182],
    [0,y,0,w,.205],[0,y+.01,.21,w*.68,.12],[0,y+.022,.31,w*.35,.066]],markings(id,body,belly,key==='pattern'?'static':key==='peeper'?'':'spots'));
  const narrow=['foul','odd','freedom','fowler'].includes(key);
  const length=narrow?1.26:key==='peeper'?.91:key==='mink'?1.11:key==='gray'?1.04:1;
  const spine = new CatmullRomCurve3([V(0,y+.022,.19),V(.031,y+.027,.42),
    V((narrow?.105:.186),y+.045,.73*length),V(narrow?.191:.236,y+.064,.94*length),V(.25,y+.083,1.13*length)]);
  const tail = Array.from({length:9},(_,i)=>spine.getPointAt(i/8));
  skin(p,'tail-muscle',tail.map((pt,i)=>{
    const s=(1-i*.117);
    return [...pt,Math.max(.005,w*.55*s*s),Math.max(.008,.094*s)];
  }),dark,8,true);
  const height = t => Math.max(.002,fin*Math.sin(Math.PI*t)**(key==='mink'?.64:narrow?1.45:.98)*(.77+t*.31));
  for(let i=0;i<tail.length-1;i++){
    const a=tail[i], b=tail[i+1], t=i/(tail.length-1), f=height(t), nf=height(t+.125);
    const top=tailTip?(i<4?0xa87949:i<6?tailTip:key==='gray'?0xd75f35:0xe3a541):shade(body,1.16);
    const finPaint=key==='gray'&&i>4?markings(id+'-orange-fin',top,top,'spots',0x4d3839):fur(top,id+'-dorsal-fin');
    blade(p,'dorsal-tail-fin'+i,[...a],[...b],[b.x,b.y+nf,b.z],[a.x,a.y+f,a.z],finPaint,.009);
    blade(p,'ventral-tail-fin'+i,[...a],[...b],[b.x,b.y-nf*.61,b.z],[a.x,a.y-f*.61,a.z],fur(shade(top,1.1),id+i),.009);
  }
  for (const s of sides) eye(p,'eye'+s,[s*w*(key==='spade'?.96:key==='pickerel'?.66:.85),y+.105,-.289],key==='spade'?.052:.034,0x554633);
  if (id==='foul_bigtad') for(let i=0;i<7;i++) blob(p,'tadpole-wart'+i,[.049,.041,.046],[(i%3-1)*.12,y+.171, -.24+Math.floor(i/3)*.12],dark,{},3,7);
}

function frog(p,id,key) {
  const [base,under,pattern,w0,h0,muzzle]=frogs[key];
  const huge=id.includes('megafrog'), giant=id.includes('giganfrog'), large=id.includes('bigfrog'), many=id.endsWith('_worm');
  const toad=['foul','fowler','freedom','odd','spade'].includes(key), w=w0*(huge?1.5:giant?1.19:1), h=h0*(huge?1.43:giant?1.24:1), y=.13+h*.86;
  const gills=key==='pattern', bark=key==='shift', tusked=key==='foul'&&giant, beaked=key==='foul'&&huge;
  const gut=fur(under,id+'-belly'), coat=fur(base,id), dark=fur(shade(base,.54),id+'-dark');
  const skinPaint=markings(id,base,under,pattern,key==='leo'?0x514039:key==='mink'?0x2d3e30:undefined);
  skin(p,'broad-body',[[0,y+.025,-.36,w*.73,h*.72],[0,y+.043,-.22,w*.99,h*.81],[0,y,-.026,w,h],
    [0,y-.014,.23,w*.89,h*.83],[0,y-.06,.44,w*.48,h*.49]],skinPaint);
  skin(p,'wide-upper-jaw',[[0,y-.01,-.35-muzzle,w*.67,h*.285],[0,y+.004,-.35-muzzle*.73,w*.88,h*.39],
    [0,y+.03,-.38,w,h*.56],[0,y+.072,-.229,w*.82,h*.71]],skinPaint);
  skin(p,'gular-jaw',[[0,y-.055,-.35-muzzle*.98,w*.61,h*.193],[0,y-.078,-.43,w*.91,h*.27],
    [0,y-.068,-.27,w*.76,h*.42]],gut,8);
  if (key==='vocal'||id==='pattern_giganfrog') {
    blob(p,'inflated-throat',[w*.81,h*.72,.20],[0,y-.105,-.43],fur(key==='vocal'?0xd7b381:0x798e78,id+'-sac'),{},4,9);
  }
  if (key==='peeper'||key==='vocal') for (const s of sides) {
    chain(p,'dorsal-cross'+s,[[s*w*.58,y+h*.56,-.17],[0,y+h*.98,.018],[-s*w*.47,y+h*.65,.20]],[.019,.02,.012],dark,5);
  }
  if (id==='tail_frog') {
    skin(p,'broad-horizontal-paddle',[[0,y-.027,.24,w*.53,h*.48],[.011,y-.071,.53,w*.63,h*.48],
      [.071,y-.093,.81,w*.85,h*.49],[.171,y-.112,1.06,w*.82,h*.43],
      [.272,y-.128,1.25,w*.50,h*.32],[.331,y-.124,1.357,w*.11,h*.12]],skinPaint,10);
  }
  if (id==='strange_frog') {
    skin(p,'short-vestigial-tail',[[0,y-.052,.28,w*.36,h*.36],[.013,y-.073,.474,.066,.061],
      [.036,y-.102,.568,.037,.033],[.043,y-.119,.601,.009,.012]],coat,8);
  }
  for(const s of sides){
    const ix=s*w*.72, iz=-.43, iy=y+h*.5;
    blob(p,'joined-eye-orbit'+s,[w*.31,h*.46,.126],[ix*.92,iy-.036,iz+.027],bark?dark:coat,{},3,8);
    blob(p,'upper-eyelid'+s,[w*.25,h*.26,.083],[ix*1.03,iy+h*.26,iz-.018],coat,{},3,8);
    if (key==='wood') blob(p,'dark-eye-mask'+s,[.071,.071,.129],[ix*1.09,iy-.025,iz+.026],dark,{},3,7);
    eye(p,'bulging-eye'+s,[ix*1.17,iy+h*.24,iz-.056],w*(huge?.225:.245),gills?0x413b42:toad?0xa5834a:giant?0xc7933d:0x7f763f,key==='spade');
    const lx=s*w*.83, radius=(large&&key==='jumbo')?.115:.071;
    const hip=[lx,y-.021,.23], knee=[s*w*1.34,y*.56,.025], ankle=[s*w*1.48,.046,.28], foot=[s*w*1.16,.025,.46];
    skin(p,'folded-hind-leg'+s,[[...hip,radius*1.41,radius*1.33],[...knee,radius,radius*.95],
      [...ankle,radius*.54,radius*.60],[...foot,.021,.021]],coat,8);
    const wrist=[s*w*1.01,.043,-.38];
    chain(p,'front-leg'+s,[[lx*.78,y-.014,-.258],[s*w*.98,y*.53,-.19],wrist],[.057,.045,.023],coat,6);
    for(let i=0;i<4;i++) for(const [j,a] of [[0,wrist],[1,foot]]){
      const b=[a[0]+s*(i-1.39)*.048,.012,a[2]+(j?.14:-.14)-i*.013];
      chain(p,'splayed-toe'+s+j+i,[a,[a[0]+s*(i-1.39)*.033,.023,(a[2]+b[2])*.50],b],[.018,.014,.007],coat,5);
      if (['gray','vocal','jumbo','shift','peeper'].includes(key)) blob(p,'toe-pad'+s+j+i,[.021,.01,.017],b,coat,{},2,6);
    }
    if (key==='spade') blade(p,'digging-spade'+s,[foot[0]-.05,.017,foot[2]-.04],[foot[0]+.03,.016,foot[2]-.03],[foot[0]+.055,.008,foot[2]+.11],[foot[0]-.029,.009,foot[2]+.09],dark,.015);
    if (gills) for(let k=0;k<4;k++){
      const a=[s*w*.71,y-.046+k*.049,-.325+k*.026];
      chain(p,'external-gill'+s+k,[a,[a[0]+s*.091,a[1]-.03,a[2]+.019],[a[0]+s*.107,a[1]-.067,a[2]+.102]],[.031,.026,.006],fur(giant?0x76b690:0x916b7b,id+k),6);
    }
    if (many) for(let k=0;k<(key==='leo'?5:4);k++){
      const a=[s*w*.82,y,.15+k*.069], lift=key==='wood'?.27:.09;
      chain(p,'extra-hip-limb'+s+k,[a,[s*(w+.13+k*.019),y+lift+(k%2)*.042,a[2]-.065],[s*(w+.17+k*.025),Math.max(.026,y*.25-k*.014),a[2]+.10]],[.049,.030,.011],k%2?coat:gut,6);
    }
    if (tusked||beaked) for(let i=0;i<(tusked?3:2);i++){
      const a=[s*w*(.45+i*.19),y+h*(.02+i*.18),-.35-muzzle*.85+i*.046];
      chain(p,(tusked?'face-tusk':'eye-bone')+s+i,[a,[a[0]+s*.07,a[1]-.13+i*.084,a[2]-.06],[a[0]+s*.1,a[1]+.083+i*.063,a[2]-.17]],[.067,.045,.005],ivory,7);
    }
  }
  if (beaked) {
    hull(p,'bone-beak',[V(-w*.71,y,-.54),V(w*.71,y,-.54),V(-w*.39,y+.127,-.69),V(w*.40,y+.127,-.67),V(.004,y-.067,-.87)],ivory);
  }
  const random=rng(id);
  if (toad||bark||giant||huge) for(let i=0;i<(bark?18:12);i++){
    const a=random()*Math.PI, z=-.18+random()*.48, scale=(.75+random()*.7)*(huge?1.32:1), x=Math.cos(a)*w*.86;
    const yy=y+Math.sin(a)*h*(.82-Math.abs(z)*.44);
    if (bark) blade(p,'camouflage-leaf'+i,[x-.025,yy,z],[x+.025,yy,z],[x+.047,yy+.10*scale,z+.095],[x,yy+.11*scale,z+.15],i%2?coat:dark,.017);
    else blob(p,'dorsal-wart'+i,[.043*scale,.043*scale,.054*scale],[x,yy,z],i%3?coat:dark,{},2,7);
  }
  if (id==='foul_bigfrog') {
    p.faunaFx = { kind: 'puff', points: sides.map(s => [s*w*.77,y+h*.72,.17]), color: 0x77794b, size: .061, rise: .28, n: 3 };
  }
  if (id==='pattern_bigfrog'||id==='pattern_giganfrog') for (let i=0;i<7;i++){
    const a=(i+.6)*Math.PI/7.6;
    blob(p,'luminescent-mark'+i,[.024,.028,.039],[Math.cos(a)*w*.98,y+Math.sin(a)*h*.98,-.028+(i%3)*.065],flat(giant?0x8acbaa:0x728b69),{glow:true},2,6);
  }
}

function snake(p,id) {
  const rattler=id.startsWith('rattlesnake'), sewer=id==='sewer_snake', eel=id==='fish_eel', baby=/_s$|_baby$/.test(id), mega=id.endsWith('mega');
  const base=sewer?0xc8b088:eel?0x5e6250:rattler?0x8a7759:id.startsWith('garter')?0x5e684a:0x72534b;
  const under=sewer?0xe3cf9f:eel?0x9b9a72:rattler?0xc6b08d:0xb09771;
  const timber=id==='rattlesnake'||id==='rattlesnake_s';
  const form=mega?.19:eel?.085:rattler?.111:.076;
  const y=eel?.20:mega?.205:.117, hy=y+(eel?.05:mega?.43:baby?.09:rattler?.22:.105), z=-.61;
  const coils=mega||rattler&&!timber&&!baby;
  const anchors=eel
    ? [[0,hy,z],[.12,y+.02,-.22],[.19,y-.012,.13],[.04,y+.045,.49],[-.15,y+.073,.82],[-.12,y+.08,1.17]]
    : coils
      ? [[0,hy,z],[.29,y+.13,-.41],[.42,y,-.01],[.15,y,.30],[-.27,y,.18],[-.46,y,.42],[-.25,y,.72],[.1,y,.70],[.26,y-.02,.51]]
      : [[0,hy,z],[.19,y+.018,-.39],[.31,y,-.16],[.16,y,.10],[-.14,y,.24],[-.39,y-.014,.48],[-.26,y-.032,.72],[.053,y-.043,.81],[.24,y-.054,.67]];
  const spline=new CatmullRomCurve3(anchors.map(pt=>V(...pt)));
  const profile=Array.from({length:22},(_,i)=>{
    const t=i/21, p=spline.getPointAt(t), taper=1-.84*t**2.05;
    const r=form*taper*(i===0?.89:1);
    return [...p,r,r*(eel?.85:1)];
  });
  const markingsType=rattler?'bands':id.startsWith('garter')?'lines':sewer?'spots':'';
  skin(p,'continuous-curled-body',profile,markings(id,base,under,markingsType,rattler?0x554335:sewer?0xb19c6b:0xc6ba7c),10,true);
  const head=fur(base,id), width=form*(rattler?1.38:1.04), snout=z-(mega?.29:.17);
  skin(p,'head',[[0,hy-.026,snout,width*.53,form*.43],[0,hy+.025,snout+.065,width*.76,form*.61],
    [0,hy+.013,z-.021,width,form*.68],[0,hy,z+.077,width*.55,form*.67]],head,8);
  for(const s of sides) {
    eye(p,'eye'+s,[s*width*.81,hy+form*.31,z-.045],form*.27,eel?0x544e37:0x9e7d42,rattler);
    if (mega) {
      skin(p,'exposed-jaw-tendon'+s,[[s*width*.56,hy-.09,snout+.13,.054,.04],
        [s*width*1.03,hy-.131,z-.042,.06,.044],[s*width*.82,hy+.037,z+.074,.036,.028]],fur(0x794c4c,id+'-tendon'),7);
    }
    if(mega) for(let i=0;i<4;i++){
      const y0=hy-form*.3+i*.013;
      chain(p,'hollow-fang'+s+i,[[s*width*(.41+i*.13),y0,snout+i*.037],[s*width*(.49+i*.13),y0-.12,snout+i*.039-.014],[s*width*(.45+i*.11),y0-.17,snout+i*.047+.027]],[.035,.028,.005],ivory,6);
    }
  }
  if(rattler&&!baby){
    const end=V(...profile.at(-1).slice(0,3));
    const prior=V(...profile.at(-2).slice(0,3));
    const tangent=end.clone().sub(prior).normalize();
    const f=form*(mega?.635:.42), slots=mega?7:5;
    for(let i=0;i<slots;i++){
      const t=i/(slots-1), center=end.clone().addScaledVector(tangent,f*(.41+i*1.17));
      center.y += f*(.17+i*.40);
      const at=(k,w,h)=>[...center.clone().addScaledVector(tangent,k*f),w*f,h*f];
      const width=1-t*.57;
      skin(p,'interlocked-rattle'+i,[at(-.73,width*.66,width*.56),at(-.28,width,width*.81),
        at(.36,width*.88,width*.79),at(.65,width*.65,width*.60)],
        fur(shade(0xa68d68,.95+(i%2)*.12),id+i),8);
    }
  } else if (eel) {
    for (let i=1;i<profile.length;i++){
      const [x,y,z,,h]=profile[i-1], [nx,ny,nz,,nh]=profile[i];
      const spread=Math.sin(Math.PI*(i-.32)/(profile.length+.5))*.085+.009;
      const next=Math.sin(Math.PI*(i+.68)/(profile.length+.5))*.085+.009;
      blade(p,'continuous-dorsal-ribbon'+i,[x,y+h*.59,z],[nx,ny+nh*.59,nz],[nx,ny+nh*.73+next,nz],[x,y+h*.73+spread,z],head,.008);
      if (i>=6) blade(p,'returning-anal-fin'+i,[x,y-h*.59,z],[nx,ny-nh*.59,nz],
        [nx,Math.max(.018,ny-nh*.71-next*.57),nz],[x,Math.max(.018,y-h*.71-spread*.57),z],head,.006);
    }
  }

}

function turtle(p,id) {
  const snap=id.includes('snapping'), baby=id.endsWith('_baby');
  const shell=fur(snap?0x5f6247:0x414a44,id+'-carapace'), skinP=fur(snap?0x797d60:0x515d4e,id+'-skin');
  const rim=fur(snap?0x817659:0xb1583a,id+'-rim'), under=fur(snap?0x8f8263:0xb89a61,id+'-plastron');
  const w= snap?.36:.39, py=.22, length=baby?.49:.55;
  skin(p,'domed-carapace',[[0,py-.014,-length,w*.57,.105],[0,py+.034,-length*.54,w*.90,.172],
    [0,py+.034,0,w,.216],[0,py+.012,length*.65,w*.77,.154],[0,py-.022,length,w*.39,.081]],shell,12);
  skin(p,'plastron',[[0,py-.058,-length*.68,w*.61,.051],[0,py-.056,0,w*.87,.067],
    [0,py-.059,length*.65,w*.59,.045]],under,10);
  for(let k=0;k<12;k++){
    const a=k*Math.PI/6, b=a+.52, r=Math.cos(a), q=Math.sin(a);
    chain(p,'shell-margin'+k,[[r*w,py+.019,q*length],[Math.cos(b)*w,py+.023,Math.sin(b)*length]],[.029,.024],rim,6);
  }
  for(let k=0;k<5;k++) for (let j=-1;j<=1;j++) {
    const z=-length*.64+k*length*.32, x=j*w*.46, y=py+.136+Math.sin(Math.PI*(k+1)/6)*.098-Math.abs(j)*.045;
    hull(p,'scute'+j+k,[V(x-.10,y-.03,z-.033),V(x-.07,y-.025,z+.089),V(x+.08,y-.027,z+.084),V(x+.097,y-.04,z-.041),
      V(x,y+.016+(snap?.048:0),z-.025)],fur(shade(snap?0x68694b:0x565f4d,.91+k*.055+(j===0?.1:0)),id+j+k));
  }
  skin(p,'neck',[[0,py-.062,-.34,.126,.099],[0,.185,-.57,.105,.075],[0,.224,-.75,.12,.076]],skinP,8);
  skin(p,'head',[[0,.22,-.94,snap?.129:.102,.063],[0,.247,-.855,snap?.152:.122,.091],[0,.239,-.686,.116,.083]],skinP,8);
  if (!snap) {
    for(const s of sides) for(let i=0;i<5;i++){
      const z=-length*.72+i*length*.34, x=s*w*(.79+Math.sin((i+1)*Math.PI/6)*.14);
      chain(p,'orange-marginal-mark'+s+i,[[x*.92,py+.09,z-.033],[x*1.05,py+.051,z-.006],[x*.99,py+.014,z+.020]],
        [.013,.016,.009],rim,5);
    }
  }
  if(snap) chain(p,'hooked-beak',[[0,.228,-.901],[0,.205,-.982],[0,.182,-.969]],[.069,.041,.006],ink,6);
  for(const s of sides){
    eye(p,'eye'+s,[s*(snap?.133:.103),.282,-.847],.029,0x917044,true);
    for (const z of [-.34,.31]){
      chain(p,'bent-leg'+s+z,[[s*w*.54,.16,z],[s*w*1.12,.096,z+.037],[s*w*1.16,.028,z-.07]],[.091,.065,.037],skinP,7);
      for(let i=0;i<3;i++) chain(p,'claw'+s+z+i,[[s*w*1.12+(i-1)*.034,.037,z-.076],[s*w*1.22+(i-1)*.032,.014,z-.16]],[.019,.006],snap?ivory:rim,5);
    }
    if(!snap) for(let i=0;i<2;i++) chain(p,'orange-neck-stripe'+s+i,[[s*.108,.197+i*.035,-.71],[s*.129,.215+i*.034,-.819],[s*.096,.215+i*.026,-.907]],[.010,.012,.005],rim,5);
  }
  const tailProfile=snap
    ? [[0,.144,length*.52,.085,.073],[.024,.128,length*.88,.074,.071],
       [.082,.088,length+.122,.058,.054],[.161,.063,length+.32,.042,.038],
       [.249,.052,length+.502,.029,.028],[.284,.058,length+.659,.009,.012]]
    : [[0,.142,length*.62,.058,.057],[.036,.118,length*.90,.042,.041],
       [.082,.081,length+.10,.026,.030],[.105,.062,length+.207,.009,.012]];
  skin(p,snap?'long-ridged-tail':'short-tapered-tail',tailProfile,skinP,9);
  if(snap) {
    const armor=fur(0x686a50,id+'-tail-scute');
    for(let i=1;i<tailProfile.length-1;i++){
      const [x,y,z,r,h]=tailProfile[i];
      hull(p,'joined-tail-keel'+i,[V(x-r*.57,y+h*.52,z-.044),V(x+r*.50,y+h*.52,z-.041),
        V(x+.005,y+h*1.27,z+.011),V(x,y+h*.40,z+.079)],armor);
    }
  }

}

function skink(p,id) {
  const baby=id.endsWith('_baby'), base=baby?0x443a34:0x66513b;
  const coat=fur(base,id), under=fur(0xbca786,id+'-belly');
  skin(p,'lizard-body',[[0,.19,-.58,.095,.078],[0,.197,-.44,.16,.115],[0,.175,-.18,.145,.094],
    [0,.173,.13,.144,.101],[0,.145,.41,.098,.074]],markings(id,base,0xad9670,'lines',0xd3bb89));
  const back=fur(baby?0x526db6:0x82725a,id+'-tail');
  const tailPaint=(ctx,x,y,w,h,side)=>(side.startsWith('0:')?coat:back)(ctx,x,y,w,h,side);
  skin(p,'long-tapered-tail',[[0,.146,.285,.102,.073],[.022,.143,.441,.088,.064],[.071,.127,.602,.072,.053],
    [.153,.101,.794,.054,.044],[.237,.077,.996,.040,.033],[.257,.059,1.193,.027,.026],
    [.238,.058,1.348,.014,.016],[.186,.076,1.441,.004,.005]],tailPaint,8);
  skin(p,'wedge-head',[[0,.173,-.81,.073,.038],[0,.191,-.71,.119,.070],[0,.214,-.52,.139,.092]],coat,8);
  for (const s of sides){
    eye(p,'eye'+s,[s*.115,.241,-.662],.026,0xa28855);
    for(const z of [-.35,.26]){
      const a=[s*.25,.026,z+(z<0?-.055:.09)];
      chain(p,'short-leg'+s+z,[[s*.11,.149,z],[s*.251,.10,z+.068],a],[.052,.038,.022],coat,6);
      for (let j=0;j<4;j++) chain(p,'toe'+s+z+j,[a,[a[0]+s*(.022+j*.027),.012,a[2]-.071+j*.023]],[.012,.004],under,5);
    }
  }
}

const fishSpecies = {
  fish_brook_trout:[0x5f6851,0xb28a5d,.17,.27,1.11,'spots',0xe2b570],
  fish_bullhead:[0x605344,0xb8a082,.24,.22,.84,'',0x705742],
  fish_goldfish:[0xd88334,0xeab45e,.21,.33,.80,'',0xf1a341],
  fish_lbass:[0x64724e,0xc1b99c,.18,.28,1.16,'bands',0x3d493b],
  fish_pike:[0x606c4e,0xa9a079,.17,.215,1.52,'spots',0xb9b27c],
  fish_salmon:[0x747f88,0xc7cbcb,.16,.27,1.21,'spots',0x484a52],
  fish_whitefish:[0x778384,0xc3c0b1,.15,.26,1.11,'',0x5f6d68],
  ocean_zhark:[0x667175,0xc2c1b4,.32,.34,1.42,'spots',0x866264],
  zhark:[0x6b716b,0xa9a99b,.36,.37,1.27,'spots',0x8b6660],
};
export function fish(p,id){
  if(id==='fish_eel') { snake(p,id); return; }
  const [base,under,w,h,l,pattern,accent]=fishSpecies[id];
  const shark=id==='zhark'||id==='ocean_zhark';
  const bull=id==='zhark', pike=id==='fish_pike', bass=id==='fish_lbass', gold=id==='fish_goldfish';
  const y=h*.96, hz=-l*.58;
  const fins=fur(shade(base,.75),id+'-fins'), light=fur(under,id+'-under');
  skin(p,'tapered-fish-body',[[0,y+.015,-l*.75,w*.49,h*.44],[0,y+.025,hz,w*.81,h*.77],[0,y+.014,-l*.32,w,h*.95],
    [0,y,0,w*.91,h],[0,y+.019,l*.42,w*.57,h*.65],[.033,y+.033,l*.75,w*.23,h*.26]],markings(id,base,under,pattern,accent),10);
  if(pike||shark||bass){
    const reach=pike?.98:bull?.84:shark?.93:.79, muzzle=pike?.50:bull?.78:shark?.38:.65;
    skin(p,'species-specific-snout',[[0,y-.028,-l*reach,w*muzzle,h*(pike?.15:.28)],[0,y+.018,-l*.76,w*.75,h*.38],
      [0,y+.04,hz,w*.83,h*.57]],fur(base,id),8);
  }
  if (shark) {
    const reach=bull?.83:.91;
    skin(p,'dark-mouth-interior',[[0,y-h*.29,-l*reach,w*.43,.043],[0,y-h*.39,-l*.73,w*.63,.077],
      [0,y-h*.41,-l*.52,w*.68,.045]],fur(0x392831,id+'-maw'),8);
  }
  fishTail(p,id,w,h,l,y,base,fins);
  const nz=id==='fish_pike'?.31:shark?-.19:-.14;
  blade(p,'dorsal-fin',[0,y+h*.82,l*nz],[0,y+h*(shark?1.97:1.5),l*(nz+.11)],[0,y+h*(shark?1.41:1.34),l*(nz+.32)],[0,y+h*.75,l*(nz+.42)],fins,.036);
  if (bass || gold || pike) {
    const ridge=(bass?[-.39,-.28,-.17,-.06]:gold?[-.29,-.15,-.01,.13]:[.16,.24,.32,.40]);
    for(let i=0;i<ridge.length;i++){
      const z=l*ridge[i], root=y+h*(pike?.72:.84);
      chain(p,'dorsal-ray'+i,[[0,root,z],[0,root+h*(.57-i*.085),z+l*.08]],[.014,.005],fins,5);
      if(i<ridge.length-1) blade(p,'dorsal-web'+i,[0,root,z],[0,root+h*(.57-i*.085),z+l*.08],
        [0,root+h*(.485-i*.085),l*(ridge[i+1]+.08)],[0,root,l*ridge[i+1]],fins,.018);
    }
  }
  if(!shark&&['fish_whitefish','fish_salmon','fish_brook_trout','fish_bullhead'].includes(id)) blade(p,'adipose-fin',[0,y+h*.62,l*.36],[0,y+h*.92,l*.45],[0,y+h*.70,l*.55],[0,y+h*.37,l*.57],fins,.019);
  for(const s of sides) {
    eye(p,'eye'+s,[s*w*.74,y+h*.29,hz-.04],shark?.042:.033,shark?0x090809:0x907445);
    blade(p,'pectoral-fin'+s,[s*w*.74,y-h*.28,-l*.4],[s*w*(shark?2.28:1.38),Math.max(.016,y-h*.89),-l*.12],
      [s*w*(shark?2.06:1.22),Math.max(.013,y-h*.94),l*.22],[s*w*.91,y-h*.44,-l*.18],fins,.025);
    blade(p,'pelvic-fin'+s,[s*w*.54,y-h*.57,l*.04],[s*w*1.24,.012,l*.25],[s*w*.94,.014,l*.36],[s*w*.45,y-h*.64,l*.28],fins,.018);
    for(let i=0;i<(shark?5:1);i++){
      const z=hz+l*.22+i*.045;
      chain(p,'gill-slit'+s+i,[[s*w*.89,y+h*.31,z],[s*w*.99,y,z-.031],[s*w*.81,y-h*.35,z]],[.011,.018,.011],ink,5);
    }
    if (id==='fish_bullhead') for(let j=0;j<3;j++){
      chain(p,'barbel'+s+j,[[s*w*.43,y-(j*.057),hz-.105],[s*w*(1.00+j*.14),y-j*.065,hz-.09],[s*w*(1.42+j*.07),y-j*.07+.05,hz+.07]],[.019,.012,.003],light,5);
    }
    if (shark||pike||bass){
      const x=s*w*.42,z=-l*(shark?.81:bass?.755:.88);
      chain(p,'open-jaw'+s,[[s*w*.67,y-.035,hz],[x,y-h*.31,z],[x*.64,y-h*.22,z-.055]],[.059,.072,.037],light,7);
      for(let k=0;k<(bass?0:shark?8:6);k++){
        const a=[x+s*k*w*.044,y-.026,z+k*.044];
        chain(p,'tooth'+s+k,[a,[a[0]+s*.006,a[1]-h*(shark?.25:.16),a[2]]],[shark?.024:.009,.002],ivory,5);
      }
    }
  }
}
export function herptile(p,id) {
  if (id.startsWith('turtle_')) turtle(p,id);
  else if (id.startsWith('skink_')) skink(p,id);
  else if (id.includes('snake')) snake(p,id);
  else {
    const key=id.split('_')[0];
    if (id.endsWith('tadpole') || id.endsWith('bigtad')) tadpole(p,id,key);
    else frog(p,id,key);
  }
}
