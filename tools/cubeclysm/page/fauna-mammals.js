import { V, blob, hull, flat, shade, sides, ink, ivory, fur, chain, skin, markings, eye, blade } from './fauna-kit.js';
import { bevel } from './lowpoly.js';
import { rng } from './paint.js';
import { dairyCow } from './fauna-cow.js';
import { domesticPig } from './fauna-pig.js';
import { moose } from './fauna-moose.js';
import { domesticSheep } from './fauna-sheep.js';
import { tiger } from './fauna-tiger.js';
import { felineHead } from './fauna-feline-head.js';
import { domesticDogBreed } from './fauna-dog-breeds.js';
import { dogTail } from './fauna-dog-tail.js';
import { mammalTail } from './fauna-mammal-tails.js';
import { mammalFace, mammalFeet, mammalInfection } from './fauna-mammal-details.js';

// Body profiles use a common length unit. [shoulder, width, torso depth, neck rise,
// head width, muzzle length, ear height, tail length, tail rise, foot radius].
const frames = {
  cat: [.49,.19,.20,.11,.13,.12,.145,.67,.38,.058],
  dog: [.69,.20,.22,.155,.145,.24,.17,.50,.15,.063],
  bear: [.63,.36,.36,.04,.245,.17,.18,.09,0,.14],
  pig: [.62,.28,.29,-.08,.18,.28,.15,.23,.09,.078],
  rodent: [.29,.20,.20,.02,.13,.19,.09,.53,-.12,.067],
  rabbit: [.28,.21,.255,.16,.14,.10,.43,.12,.03,.08],
  mustelid: [.34,.16,.17,.03,.125,.17,.075,.47,-.05,.052],
  horse: [1.12,.27,.29,.58,.155,.32,.18,.61,-.51,.075],
  moose: [1.29,.30,.31,.26,.195,.38,.18,.14,-.05,.093],
  deer: [1.04,.19,.23,.41,.13,.24,.22,.19,.06,.061],
  cattle: [1.01,.34,.37,.13,.215,.28,.15,.53,-.39,.093],
  goat: [.80,.195,.245,.25,.13,.19,.16,.17,.12,.061],
  sheep: [.76,.30,.30,.23,.145,.22,.155,.18,-.09,.06],
  llama: [1.02,.26,.28,.71,.13,.17,.23,.31,-.13,.066],
};

// [frame, dorsal, ventral, coat, ear style, tail style, anatomy overrides]
const mammals = {
  bear: ['bear',0x232129,0x45404a,'','round','bob'],
  beaver: ['rodent',0x6d4532,0x9b694b,'','round','paddle',{ shoulder:.40,width:.27,depth:.24,muzzle:.15,tail:.76 }],
  black_rat: ['rodent',0x2b272d,0x4c4548,'','round','bare',{ width:.16,tail:.85 }],
  boar_wild: ['pig',0x44342f,0x51413a,'','point','curl',{ wild:true,back:.18 }],
  bobcat: ['cat',0x745138,0xd1b294,'spots','tuft','bob',{ tail:.13,foot:.073 }],
  cat: ['cat',0x5c615f,0xa0a798,'patches','point','whip'],
  cat_bengal: ['cat',0xa27342,0xe2bd83,'spots','point','whip',{ length:1.08 }],
  cat_black: ['cat',0x231f2a,0x302b36,'','point','whip',{ iris:0x84c83c }],
  cat_calico: ['cat',0xe3d9cb,0xe0d9ca,'calico','point','whip',{ accent:0x854525 }],
  cat_chonker: ['cat',0xc68a47,0xe7c187,'bands','point','brush',{ width:.29,depth:.29,ruff:true }],
  cat_devon_rex: ['cat',0xaa8d77,0xcab09a,'','point','whip',{ ear:.265,head:.115,iris:0xb6bf49 }],
  cat_isherwood: ['cat',0x5b514b,0xc1aea2,'bands','point','whip'],
  cat_longhair: ['cat',0x79645f,0xb5a08d,'','point','brush',{ ruff:true,width:.22 }],
  cat_maine_coon: ['cat',0x645046,0xb39875,'bands','tuft','brush',{ ruff:true,width:.24,length:1.13 }],
  cat_persian: ['cat',0xd9c9b3,0xede1d2,'','round','brush',{ ruff:true,muzzle:.04,head:.175,ear:.085 }],
  cat_siamese: ['cat',0xdac19f,0xe8d7b4,'','point','whip',{ points:0x3f2f32,iris:0x70add5,ear:.19 }],
  cat_sphynx: ['cat',0xac827e,0xc69d94,'bands','point','bare',{ ear:.23,head:.12,accent:0x896365 }],
  cat_tabby: ['cat',0x8a7862,0xc7ae8b,'bands','point','rings',{ accent:0x41362d }],
  chipmunk: ['rodent',0x895a36,0xdbba86,'lines','round','brush',{ width:.16,tail:.38,rise:.32,accent:0x2f251d }],
  cougar: ['cat',0xa87951,0xd1b491,'','round','whip',{ length:1.15,shoulder:.66,head:.15,foot:.075 }],
  cow: ['cattle',0xe0d9c7,0xd3c5b0,'patches','leaf','switch',{ accent:0x262528 }],
  coyote: ['dog',0x8d7760,0xc8b899,'','point','brush',{ width:.155,ear:.225,muzzle:.28 }],
  deer: ['deer',0x8c603a,0xd4ba94,'','leaf','flag',{ antlers:'rack' }],
  dog: ['dog',0x9b7954,0xbb9d79,'','flop','whip',{ head:.163 }],
  dog_auscattle: ['dog',0x60656d,0xa3825a,'spots','point','whip',{ width:.205,muzzle:.20 }],
  dog_bcollie: ['dog',0x26242d,0xdcd6c7,'','half','brush',{ ruff:true,points:0x37343a,blaze:true }],
  dog_bull: ['dog',0xd2c4b1,0xf1e3ce,'patches','half','bob',{ shoulder:.57,width:.29,head:.216,muzzle:.085,accent:0x97694c }],
  dog_chihuahua: ['dog',0xc18d5d,0xe1b98e,'','point','curl',{ width:.13,ear:.29,head:.15,muzzle:.11 }],
  dog_dachshund: ['dog',0x482f28,0xa56a42,'','flop','whip',{ shoulder:.36,length:1.25,muzzle:.25,ear:.23 }],
  dog_gpyrenees: ['dog',0xe5e2d6,0xd4cbb4,'','half','brush',{ width:.265,ruff:true,ear:.12 }],
  dog_gshepherd: ['dog',0x443536,0xb48253,'','point','brush',{ ear:.235,muzzle:.25,points:0x553a31 }],
  dog_pitbullmix: ['dog',0x64606a,0xa7a0a4,'','half','whip',{ width:.255,head:.2,muzzle:.145,blaze:true }],
  dog_rottweiler: ['dog',0x282627,0x51342a,'','flop','bob',{ width:.24,head:.185,muzzle:.13,points:0xa66b44 }],
  dog_samoyed: ['dog',0xe3e5df,0xd7dbd7,'','point','curl',{ width:.245,ruff:true,ear:.13,rise:.47 }],
  dog_wad: ['dog',0x22202b,0x322d36,'','flop','brush',{ ruff:true,muzzle:.255,iris:0x755233 }],
  ferret: ['mustelid',0xb39679,0xe0c9ac,'','round','whip',{ length:1.18,mask:0x4e3a34 }],
  fox_gray: ['dog',0x80736f,0xc0825a,'','point','brush',{ width:.143,head:.12,ear:.235,points:0x493c39 }],
  fox_red: ['dog',0xb26030,0xe6cfae,'','point','brush',{ width:.148,head:.115,muzzle:.27,ear:.24,points:0x382b29,flag:0xe9d9bb }],
  goat: ['goat',0xb59d7e,0xe3d3bb,'patches','leaf','flag',{ horns:'goat',beard:true }],
  groundhog: ['rodent',0x77513b,0xa27956,'','round','brush',{ width:.26,depth:.235,tail:.30 }],
  hare: ['rabbit',0x877468,0xe2d9c5,'','rabbit','bob',{ ear:.47,foot:.10 }],
  horse: ['horse',0x6b4434,0x85624c,'','point','switch',{ mane:true,blaze:true }],
  lab_rat: ['rodent',0xe8dcd2,0xeaded7,'','round','bare',{ iris:0xd06f78,tail:.76 }],
  lemming: ['rodent',0x826842,0xa98f62,'','round','bob',{ width:.25,head:.165,ear:.044,tail:.07 }],
  llama: ['llama',0xb19774,0xdac9ad,'','leaf','flag',{ ruff:true,ear:.28 }],
  mink: ['mustelid',0x382928,0x51403a,'','round','whip',{ length:1.12 }],
  mole: ['rodent',0x403d46,0x53505a,'','none','bare',{ digger:true,tail:.18,head:.10,muzzle:.27,iris:0x090809 }],
  moose: ['moose',0x49372c,0x6c5443,'','leaf','bob',{ antlers:'palm',beard:true }],
  muskrat: ['rodent',0x705343,0x967762,'','round','bare',{ tail:.72,ear:.052 }],
  opossum: ['rodent',0x827e7a,0xb4aca2,'','round','bare',{ points:0xe2cfc0,muzzle:.26,tail:.78,ear:.12 }],
  otter: ['mustelid',0x674c39,0xb39c77,'','round','whip',{ width:.205,tail:.66,head:.145 }],
  porcupine: ['rodent',0x54402e,0x82664b,'','round','bob',{ quills:true,width:.265,tail:.28 }],
  rabbit: ['rabbit',0xa19b91,0xd9cdc0,'patches','rabbit','bob'],
  raccoon: ['rodent',0x817974,0xb2a79b,'','round','rings',{ shoulder:.40,width:.235,mask:0x292630,tail:.64 }],
  reindeer: ['deer',0x776455,0xc9bba3,'','leaf','flag',{ antlers:'crown',ruff:true,foot:.082 }],
  sewer_rat: ['rodent',0x756055,0x968274,'','round','bare',{ tail:.93,width:.19 }],
  sheep: ['sheep',0xd6c9b2,0xb3a68f,'','leaf','bob',{ horns:'ram',ruff:true,points:0x49434a }],
  shrew: ['rodent',0x694f47,0x9a7b69,'','round','bare',{ muzzle:.30,tail:.36,ear:.05,width:.135 }],
  skunk: ['mustelid',0x28232b,0x343039,'stripe','round','brush',{ accent:0xe6e1d4,rise:.53,tail:.56 }],
  squirrel: ['rodent',0x8d8680,0xd6c3a6,'','round','brush',{ rise:.64,tail:.55,width:.156 }],
  squirrel_red: ['rodent',0xaa5e3d,0xdac3a8,'','tuft','brush',{ rise:.59,tail:.64,width:.15 }],
  tiger: ['cat',0xc2803e,0xe3d2af,'bands','round','rings',{ accent:0x33272b,width:.25,depth:.25,head:.185,foot:.10 }],
  weasel: ['mustelid',0x875634,0xd9c3a6,'','round','whip',{ width:.127,length:1.22 }],
  wild_rabbit: ['rabbit',0x7f614a,0xcfb699,'','rabbit','bob',{ ear:.34,flag:0xe8dfcb }],
  wolf: ['dog',0x6e6a62,0xada090,'','point','brush',{ ruff:true,head:.164,muzzle:.3 }],
};

const undead = {
  dog_zombie_cop: ['dog_gshepherd','vest'], dog_zombie_rot: ['dog_rottweiler','cysts'],
  dog_skeleton: ['dog','skeleton'], dog_zombie_brute: ['dog_rottweiler','brute'], dog_zombie_hulk: ['dog_bull','hulk'],
  zeer: ['deer','twisted'], zeindeer: ['reindeer','gaunt'], ziger: ['tiger','maw'], zllama: ['llama','ragged'],
  zolf: ['wolf','maw'], zombear: ['bear','oil'], zombear_acidic: ['bear','acid'], zombeaver: ['beaver','ribs'],
  zombie_goat: ['goat','gaunt'], zombie_horse: ['horse','bone'], zombie_horse_black: ['horse','char'],
  zombie_horse_white: ['horse','bile'], zombie_pig: ['boar_wild','oil'], zombie_sheep: ['sheep','ragged'],
  zombull: ['cow','bull'], zoose: ['moose','rot'], zoose_thorny: ['moose','thorns'], zougar: ['cougar','hindlegs'],
  zow: ['cow','gaunt'], zpig_brute: ['boar_wild','skull'],
};

function antlers(p, x, y, z, style, juvenile, thorny) {
  const horn = fur(thorny ? 0x676c53 : 0xb09773, style);
  const f = juvenile ? .39 : 1;
  const spread = style === 'palm' ? .57 : .32;
  for (const s of sides) {
    const a = [s*x,y,z], b = [s*(x+spread*f*.46),y+.26*f,z+.1*f], c = [s*(x+spread*f),y+(.4+(style==='crown'?.16:0))*f,z+.27*f];
    chain(p,'antler-beam'+s,[a,b,c],[.058*f,.046*f,.012*f],horn);
    if (style === 'palm') {
      hull(p,'palmated-antler'+s,[V(...b),V(...c),V(s*(x+.48*f),y+.16*f,z+.55*f),V(s*(x+.36*f),y+.29*f,z+.69*f),
        V(s*(x+.62*f),y+.44*f,z+.41*f),V(s*(x+.46*f),y+.36*f,z+.16*f),
        V(s*(x+.66*f),y+.37*f,z+.53*f)],horn);
    }
    for (let i=0;i<(style==='crown'?5:3);i++) {
      const t=(i+1)/(style==='crown'?6:4);
      const base=b.map((q,k)=>q+(c[k]-q)*t);
      const tip=[base[0]+s*(.03+i*.018)*f,base[1]+(.16+i*.042)*f,base[2]+(i%2?.13:-.1)*f];
      chain(p,'antler-tine'+s+i,[base,tip],[.033*f,.006*f],horn,5);
      if (thorny) chain(p,'wrapped-thorn'+s+i,[base,[base[0]+s*.08,base[1]+.025,base[2]-.16],tip],[.041,.021,.004],fur(0x687d4b,'vine'),5);
    }
  }
}

function earShape(p, kind, x, y, z, height, base, inner) {
  const s = Math.sign(x);
  if (kind === 'none') return;
  if (kind === 'round') {
    blob(p,'rounded-ear'+s,[height*.60,height*.64,height*.33],[x,y+height*.26,z],base,{},3,7);
    blob(p,'ear-cup'+s,[height*.39,height*.45,height*.13],[x,y+height*.30,z-height*.28],inner,{},2,6);
    return;
  }
  if (kind === 'flop') {
    skin(p,'pendulous-ear'+s,[[x,y,z+.032,height*.32,height*.25],
      [x+s*height*.31,y-height*.38,z-.005,height*.39,height*.18],
      [x+s*height*.34,y-height*.79,z-.051,height*.34,height*.14],
      [x+s*height*.24,y-height*.99,z-.066,height*.13,height*.065]],base,7);
    return;
  }
  if (kind === 'rabbit') {
    skin(p,'upright-rabbit-ear'+s,[[x,y,z,.050,.037],[x+s*height*.17,y+height*.38,z+.018,.073,.039],
      [x+s*height*.23,y+height*.78,z+.047,.058,.028],[x+s*height*.23,y+height*.99,z+.057,.019,.013]],base,8);
    skin(p,'inner-rabbit-ear'+s,[[x+s*height*.07,y+height*.13,z-.03,.030,.012],[x+s*height*.17,y+height*.4,z-.025,.049,.012],
      [x+s*height*.23,y+height*.77,z+.013,.040,.010],[x+s*height*.22,y+height*.92,z+.039,.009,.007]],inner,8);
    return;
  }
  const a=[x-s*height*.3,y,z-.052], b=[x+s*height*.34,y,z-.02];
  const tip = kind==='leaf' ? [x+s*height*.81,y+height*.56,z+.055] :
    kind==='half' ? [x+s*height*.36,y+height*.40,z-.066] : [x+s*height*.23,y+height,z+.025];
  hull(p,'ear'+s,[V(...a),V(...b),V(...tip),V(x,y+.04,z+.064)],base);
  const center=[(a[0]+b[0]+tip[0])/3,(a[1]+b[1]+tip[1])/3,(a[2]+b[2]+tip[2])/3-.007];
  const inset=q=>V(...q.map((v,k)=>center[k]+(v-center[k])*.59-(k===2?.006:0)));
  hull(p,'inner-ear'+s,[inset(a),inset(b),inset(tip),V(center[0],center[1],center[2]+.01)],inner);
  if (kind==='tuft') chain(p,'ear-tuft'+s,[tip,[tip[0]+s*.025,tip[1]+.048,tip[2]+.01]],[.019,.002],ink,5);
}

function bat(p) {
  const furP=fur(0x625043,'bat');
  blob(p,'furred-body',[.145,.235,.17],[0,.29,0],furP,{},4,9);
  blob(p,'snub-face',[.107,.104,.105],[0,.39,-.164],furP,{},3,8);
  blob(p,'nose',[.06,.038,.043],[0,.364,-.244],ink,{},3,7);
  blade(p,'tail-membrane',[-.112,.102,.080],[.112,.102,.080],[.074,.086,.212],[-.074,.086,.212],fur(0x62494c,'bat-tail-membrane'),.011);
  skin(p,'tail-within-membrane',[[0,.17,.071,.025,.022],[.002,.102,.139,.018,.014],[.008,.085,.236,.006,.007]],furP,7);
  for (const s of sides) {
    eye(p,'small-eye'+s,[s*.082,.417,-.217],.023);
    earShape(p,'round',s*.077,.478,-.161,.15,furP,flat(0x885d59));
    const shoulder=[s*.12,.39,-.051], elbow=[s*.29,.485,-.035], wrist=[s*.50,.67,-.161], tip=[s*.98,.31,.091];
    const membrane=fur(0x574147,'bat-membrane');
    chain(p,'wing-arm'+s,[shoulder,elbow,wrist,tip],[.054,.036,.023,.006],furP,6);
    blade(p,'inner-wing'+s,shoulder,elbow,wrist,[s*.119,.158,.177],membrane,.014);
    const tips=[[s*.119,.158,.177],[s*.315,.122,.37],[s*.546,.165,.415],[s*.775,.222,.321],tip];
    for(let i=0;i<tips.length-1;i++){
      const a=tips[i], b=tips[i+1];
      const notch=a.map((x,k)=>(x+b[k])*.5+(k===1?.075:k===2?-.095:0));
      hull(p,'scalloped-web'+s+i,[V(...wrist),V(...a),V(...notch),V(wrist[0],wrist[1]-.013,wrist[2]+.007)],membrane);
      hull(p,'scalloped-web-tip'+s+i,[V(...wrist),V(...notch),V(...b),V(wrist[0],wrist[1]-.013,wrist[2]+.007)],membrane);
      chain(p,'wing-finger'+s+i,[wrist,b],[.014,.004],furP,5);
    }
    chain(p,'wing-thumb'+s,[wrist,[wrist[0]+s*.045,wrist[1]+.057,wrist[2]-.059]],[.018,.003],ivory,5);
    chain(p,'perched-foot'+s,[[s*.065,.19,.07],[s*.104,.048,.10],[s*.119,.014,.027]],[.031,.028,.018],furP,5);
  }
}

export function mammal(p, id) {
  if (id === 'cow') { dairyCow(p); return; }
  if (id === 'sheep' || id === 'sheep_lamb') { domesticSheep(p, id === 'sheep_lamb'); return; }
  if (id === 'tiger') { tiger(p); return; }
  if (id === 'pig' || id === 'pig_piglet') { domesticPig(p, id === 'pig_piglet'); return; }
  if (/^(tusked_)?moose(_calf)?$/.test(id)) { moose(p, id); return; }
  if (id==='bat') { bat(p); return; }
  if (domesticDogBreed(p, id)) return;
  const infection=undead[id]?.[1];
  const type=undead[id]?.[0] ?? id.replace(/_(kitten|kit|pup|cub|piglet|calf|fawn|kid|baby|foal|lamb|police)$/,'');
  const juvenile=type!==id && !infection && id!=='horse_police';
  const [frame,base,under,pattern,ears,tail,options={}] = mammals[type];
  const [h0,w0,d0,n0,head0,m0,e0,t0,r0,f0]=frames[frame];
  const { shoulder=h0,width=w0,depth=d0,length=1,head=head0,muzzle=m0,ear=e0,tail:tailLength=t0,rise=r0,foot=f0,
    accent,points,ruff,antlers:antlerStyle,horns,beard,mane,blaze,mask,quills,tusk,digger,wild,back=0,flag,iris=0x785d42 }=options;
  const z=length*(juvenile?.45:.49), hooved=['horse','moose','deer','cattle','goat','sheep','llama','pig'].includes(frame);
  const starving=id==='cat_chonker_kitten';
  const h=shoulder*(juvenile?(hooved?.93:.70):1), bw=width*(starving?.60:1)*(infection==='hulk'?1.52:infection==='brute'||infection==='bile'?1.29:juvenile?1.03:1);
  const d=depth*(starving?.63:infection==='bile'?1.38:infection==='gaunt'?.83:1), hy=h+n0*(juvenile?.72:1)+(infection==='bull'?-.09:0);
  const hx=head*(juvenile?1.25:1)*(infection==='hulk'?1.2:1), hz=-z-.18-(frame==='llama'?.07:0);
  const mr=muzzle*(juvenile?.76:1), nz=hz-mr, ny=hy-(hooved?.115:.038);
  const color=infection==='char'?0x28232b:infection==='bile'?0xabad85:infection==='twisted'?0xa7a896:infection==='acid'?0x79744a:infection==='skeleton'?0x968671:infection?shade(base,.71):base;
  const juvenilePattern = ['deer','cougar'].includes(type) ? 'spots' : wild ? 'lines' : type==='cat_calico'?'calico-kitten':pattern;
  const bodyPaint=markings(id,color,infection?shade(under,.64):under,juvenile?juvenilePattern:pattern,juvenile&&wild?0xb69a72:accent);
  const coat=fur(color,id), light=fur(infection?shade(under,.67):under,id+'-underside');
  const darkFace = ['dog_rottweiler','dog_gshepherd','fox_red','fox_gray'].includes(type);
  const end=fur(infection==='bone'||infection==='skull'||infection==='skeleton'?0xcfc2a2:darkFace?color:points??color,id+'-face');
  const black=fur(0x25232a,id+'-dark');
  const bone=fur(0xd4c9ad,id+'-bone');
  const raw=fur(0x81484b,id+'-flesh');
  const darkRaw=fur(0x392531,id+'-wound');
  const zombie=['skeleton','bone','skull'].includes(infection);
  skin(p,'torso',[[0,h+.035,-z*.98,bw*.71,d*.77],[0,h+.058+back,-z*.66,bw*.99,d*(frame==='bear'?1.16:1)],
    [0,h-.022,-z*.16,bw*(infection==='skeleton'?.53:1),d*(infection==='skeleton'?.59:1.04)],
    [0,h-.011,z*.40,bw*.90,d*.92],[0,h,z*.78,bw*.72,d*.80],[0,h-.018,z*.97,bw*.47,d*.58]],bodyPaint);
  skin(p,'neck',[[0,h,-z*.69,bw*.67,d*.69],[0,(h+hy)*.5+.025,-z*.94,hx*.94,(h+hy)*.05+hx*.38],
    [0,hy,hz+.09,hx*.74,hx*.76]],coat,8);
  const feline=frame==='cat';
  if (feline) {
    felineHead(p,{ id,type,y:hy,z:hz+.020,radius:hx,base:color,under,iris,young:juvenile,infection });
  } else {
    skin(p,'head',[[0,ny,nz,hx*.50,hx*.5],[0,ny+.019,nz+mr*.3,hx*.67,hx*.60],
      [0,hy,hz,hx,hx*.89],[0,hy+.026,hz+.117,hx*.86,hx*.84],[0,hy+.008,hz+.185,hx*.46,hx*.49]],end,10);
    if (frame==='bear') blob(p,'wide-muzzle',[hx*.68,hx*.45,.118],[0,ny-.024,nz+.034],light,{},3,8);
    const lip=hooved?fur(shade(points??under,.68),id+'-lips'):black;
    blob(p,'nose',[hx*(frame==='pig'?.7:.48),hx*(frame==='pig'?.36:.23),.033],[0,ny+.012,nz-.004],lip,{},3,8);
    mammalFace(p, { id, type, frame, infection, hx, hy, hz, ny, nz, light });
    if (blaze) blob(p,'forehead-blaze',[hx*.26,hx*.42,.05],[0,hy+hx*.54,hz-.04],light,{},3,7);
  }
  for (const s of sides) {
    if (frame==='bear') blob(p,'shoulder-muscle'+s,[bw*.49,d*.79,.27],[s*bw*.51,h+.11,-z*.69],coat,{},3,9);
    if (!feline) {
      if (mask) blob(p,'eye-mask'+s,[hx*.21,hx*.36,hx*.56],[s*hx*.90,hy+.028,hz-.023],flat(mask),{},3,8);
      eye(p,'eye'+s,[s*hx*(mask?1.04:.94),hy+.031,hz-(hooved?.013:mr*.06)],hx*(id==='mole'?.075:infection==='hindlegs'?.34:.20),infection?0x090809:iris);
      earShape(p,ears,s*hx*.66,hy+hx*.65,hz+.095,ear*(juvenile?1.08:1),end,fur(0x936761,id+'-ear'));
    }
    const step=s*(juvenile?.042:.071);
    for (const backLeg of [false,true]) {
      const lz=(backLeg?z*.68:-z*.71)+step, lx=bw*.68;
      const scale=(infection==='hulk'?1.67:backLeg&&infection==='hindlegs'?1.57:1);
      const radial=foot*scale*(frame==='rabbit'&&backLeg?1.33:1);
      const knee=[s*lx*1.12,h*(frame==='rabbit'&&backLeg?.89:.53),lz+(backLeg?-.12:.015)];
      const ankle=[s*(lx+(infection==='twisted'?.10:0)),h*.22,lz+(backLeg?.092:.02)];
      const toe=[s*lx*(infection==='twisted'?1.34:1.08),radial*.51,lz+(infection==='twisted'?s*.14:-.048)];
      skin(p,(backLeg?'hind':'front')+'-leg'+s,[[s*lx,h+.065,lz,radial*1.33,radial*1.68],
        [...knee,radial*1.02,radial*.93],[...ankle,radial*.62,radial*.65],[...toe,radial*.74,radial*.76]],zombie?bone:backLeg&&infection==='hindlegs'?raw:coat,8);
      blob(p,(hooved?'hoof':'paw')+s+backLeg,[radial*(digger?1.45:frame==='cat'?1.0:.87),toe[1],radial*(digger||frame==='rabbit'&&backLeg?1.67:1.23)],toe,hooved?black:points?fur(points,id+'-points'):light,{},3,8);
      mammalFeet(p, type, frame, toe, radial, backLeg, coat);
      if (digger) for (let i=-1;i<=1;i++) chain(p,'digging-claw'+s+i,[ [toe[0]+i*.046,.028,toe[2]-.040],[toe[0]+i*.052,.016,toe[2]-.13] ],[.021,.007],ivory,5);
    }
    if (tusk || wild || infection==='skull') {
      const f=tusk??(infection==='skull'?.235:.115), a=[s*hx*.53,ny-.048,nz+.066];
      chain(p,'tusk'+s,[a,[s*hx*.86,ny-f*.48,nz-f*.17],[s*hx*1.04,ny+f*.40,nz-f*.38]],[f*.20,f*.123,.005],ivory,7);
    }
    if (type==='beaver') bevel(p,'incisor'+s,[s*.035-.023,ny-.086,nz-.033,s*.035+.023,ny-.024,nz+.02],.006,fur(infection?0xb47a46:0xdca264,id+'-incisor'));
    if (horns || infection==='bull') {
      const origin=[s*hx*.71,hy+hx*.50,hz+.115];
      const f=juvenile?.43:1;
      if (horns==='ram') {
        const spiral=[origin];
        for(let k=0;k<7;k++){
          const a=k*.83;
          spiral.push([s*(hx+(.048+k*.016)*f),hy+Math.cos(a)*(.18-k*.011)*f,hz+.075+Math.sin(a)*(.19-k*.013)*f]);
        }
        chain(p,'ram-horn'+s,spiral,spiral.map((_,i)=>Math.max(.007,(.075-i*.009)*f)),bone,7);
      } else if(infection==='bull') {
        chain(p,'bull-horn'+s,[origin,[s*(hx+.15),hy+.08,hz+.095],[s*(hx+.30),hy+.14,hz-.04],[s*(hx+.33),hy+.27,hz-.15]],[.084,.069,.028,.004],bone,8);
      } else chain(p,'back-swept-horn'+s,[origin,[s*(hx+.043*f),hy+.19*f,hz+.19*f],[s*(hx+.09*f),hy+.26*f,hz+.34*f]],[.043*f,.027*f,.004],bone,7);
    }
  }
  if (antlerStyle && (!juvenile || type==='reindeer')) antlers(p,hx*.66,hy+hx*.7,hz+.13,antlerStyle,juvenile,infection==='thorns');
  if (beard) skin(p,'beard',[[0,ny-.047,nz+.093,.086,.048],[0,ny-.213,nz+.13,.055,.034],[0,ny-.28,nz+.18,.009,.012]],light,7);
  if (mane || wild) {
    for(let i=0;i<7;i++){
      const t=i/6, y=wild?h+d*(juvenile?.59:.93)+back*(1-t)*(juvenile?.4:.69):hy+hx*.56+(h+d*.6-hy)*t, a=wild?-z*.5+t*z:hz+.16+t*.53;
      hull(p,'mane-lock'+i,[V(-.055,y-.047,a-.08),V(.061,y-.051,a-.07),V(.09,y-.23,a+.15),V(-.072,y-.14,a+.14),V(.026,y+(juvenile&&wild?.044:.071),a+.031)],black);
    }
  }
  if (ruff&&!starving) for (const s of sides) for(let i=0;i<5;i++){
    const t=i*.063, x=s*(bw*.66+t*.38), y=h+.13-t*.97;
    hull(p,'ruff-lock'+s+i,[V(x,y,hz+.19+i*.04),V(x+s*.045,y-.088,hz+.28+i*.045),V(x+s*.07,y-t*.65,hz+.34+i*.045),V(x-s*.08,y+.09,hz+.31+i*.04)],i%2?coat:light);
  }
  const tailPaint=tail==='bare'?fur(0xa9847b,id+'-bare-tail'):coat;
  if (id === 'dog' || id.startsWith('dog_')) {
    dogTail(p, infection ? id : type, { y: h, z, depth: d, pup: juvenile, paint: infection==='skeleton'?bone:tailPaint });
  } else {
    mammalTail(p,{ id,type,style:tail,y:h,z,depth:d,length:tailLength*(juvenile?.82:1),rise,coat,light:flag?flat(flag):light });
  }
  if (quills) {
    const rand=rng(id);
    for(let i=0;i<28;i++){
      const a=(i%7+1)*Math.PI/8, zz=-z*.52+z*(Math.floor(i/7)*.41+rand()*.19);
      const x=Math.cos(a)*bw*.82, y=h+.032+Math.sin(a)*d*.89;
      chain(p,'quill'+i,[[x,y,zz],[x*1.53,y+.06,zz+.13],[x*1.86,y+.09,zz+.23+rand()*.1]],[.025,.018,.002],i%3?bone:black,5);
    }
  }
  if (['sheep','llama'].includes(frame) && infection!=='bone') {
    const wool=fur(infection?0x98806f:frame==='sheep'?0xd4c8ad:0xb59c77,id+'-wool');
    for(const s of sides) for(let i=0;i<7;i++){
      const zz=z*(-.77+(i%4)*.45), yy=h+d*(i<4?.61:.04), xx=s*bw*(i<4?.69:.89);
      if(infection==='ragged'&&i%3===1) continue;
      blob(p,'dense-wool-lock'+s+i,[.105,.128,.143],[xx,yy,zz],wool,{},3,7);
    }
  }
  if (id==='horse_police' || infection==='vest') {
    const vest=fur(id==='horse_police'?0x313742:0x252b34,id+'-armor');
    skin(p,'armored-harness',[[0,h+.03,-z*.70,bw*.95,d*.89],[0,h+.056,-z*.49,bw*1.055,d*1.075],
      [0,h+.029,-z*.06,bw*1.049,d*1.08],[0,h+.018,z*.15,bw*.92,d*1.04]],vest);
    for (const s of sides) {
      const x=s*bw*.99;
      bevel(p,'ballistic-side-panel'+s,[x-.034,h-.04,-z*.57,x+.034,h+.103,z*.08],.023,black);
      bevel(p,'reflective-id-patch'+s,[x+s*.035-.009,h+.008,-z*.45,x+s*.035+.009,h+.042,-z*.12],.004,flat(0xc3c5b5));
      if (infection==='vest') {
        const buckle=flat(0xb5ac87), nylon=fur(0x34363e,id+'-nylon');
        chain(p,'angled-kevlar-strap'+s,[[s*bw*.60,h+.20,-z*.54],[s*bw*.95,h+.11,-z*.72],[s*bw*.88,h-.105,-z*.83]],
          [.042,.041,.039],nylon,6);
        bevel(p,'harness-buckle'+s,[x+s*.04-.015,h+.025,-z*.66-.041,x+s*.04+.015,h+.085,-z*.66+.041],.008,buckle);
        chain(p,'back-grab-handle'+s,[[s*.06,h+d,z*.09],[s*.06,h+d+.085,-z*.016],[s*.06,h+d+.079,-z*.23],
          [s*.06,h+d,-z*.29]],[.024,.022,.022,.025],nylon,6);
      }
    }
  }
  if (!infection) return;
  mammalInfection(p, { id, infection, h, d, z, bw, hx, hy, hz, ny, nz, raw, bone, coat });
  if (infection==='char') {
    p.faunaFx = { kind: 'puff', points: sides.flatMap(s => [
      [s*bw*.92,h-d*.46,-z*.38], [s*bw*.86,h-d*.51,z*.19],
    ]), color: 0x29252e, size: .096, rise: .66, n: 3 };
  }
  if (infection==='cysts') {
    p.faunaFx = { kind: 'drip', points: sides.map(s => [s*bw*1.04,h+.11,-z*.12]), color: 0x686d3e, size: .036, drop: .28, n: 2 };
  }
  if (infection==='bile') {
    const gel=fur(0x8e9e48,id+'-bile');
    blob(p,'visible-bile-level',[bw*.69,d*.49,z*.72],[0,h-d*.70,z*.07],gel,{},4,10);
    blob(p,'stretched-glossy-membrane',[bw*.74,d*.57,z*.77],[0,h-d*.68,z*.07],flat(0xd5d6ad),{ glass:true },4,10);
    blob(p,'stretched-bile-reservoir',[bw*.93,d*.85,z*.76],[.015,h-.108,z*.09],fur(0xa5a64f,id+'-bile'),{},4,11);
    for (const s of sides) chain(p,'green-belly-vein'+s,[[s*bw*.42,h-d+.02,-z*.61],[s*bw*.87,h-d*.4,-z*.24],[s*bw*.95,h+.002,z*.15],[s*bw*.75,h+.14,z*.58]],[.023,.025,.021,.008],fur(0x626f40,id+'-vein'),6);
  }
  if (infection==='cysts') {
    for (const s of sides) for(let i=0;i<9;i++){
      const a=i*.54, z0=-z*.80+i*z*.20, x=s*bw*(.68+.24*Math.cos(a)), y=h+d*(.57+.23*Math.sin(a));
      blob(p,'chain-cyst'+s+i,[.082,.091,.067],[x,y,z0],fur(i%3?0x807047:0x57573b,id+i),{},3,7);
      if(i%2===0) chain(p,'ulcer-seep'+s+i,[[x+s*.044,y-.024,z0],[x+s*.036,y-.123,z0+.012]],[.023,.01],flat(0x718044),5);
    }
  } else {
    const woundColor=infection==='acid'?0xb1b548:infection==='char'?0x1c1820:infection==='rot'?0x7d8844:0x79414b;
    for (const s of sides) {
      for(let i=0;i<(zombie||infection==='ribs'?6:4);i++){
        const z0=-z*.45+i*z*.18, x=s*bw*(.97-.025*i), y=h+.05-Math.abs(2-i)*.026;
        if (i%2===0 || zombie) blob(p,'torn-flank'+s+i,[.034,d*.42,.085],[x,y,z0],fur(woundColor,id+i),{},3,7);
        if (zombie || ['ribs','rot','gaunt','ragged'].includes(infection)) chain(p,'exposed-rib'+s+i,[[x*.81,y+.135,z0-.043],[x*1.10,y+.014,z0],[x*.87,y-.13,z0+.046]],[.023,.026,.013],bone,6);
      }
      const gape=!feline&&['maw','hulk','brute','ribs','rot','bone','skull'].includes(infection);
      const fang = infection==='hulk'?.12:infection==='brute'?.085:.057;
      if (gape) {
        blob(p,'open-mouth'+s,[hx*.49,hx*.34,mr*.44+.034],[s*hx*.28,ny-.052,nz+.045],darkRaw,{},3,8);
        chain(p,'angular-lower-jaw'+s,[[s*hx*.55,ny-.02,nz+mr*.72],[s*hx*.49,ny-.112,nz+.026],[s*hx*.22,ny-.084,nz-.005]],[.042,.054,.031],zombie?bone:raw,6);
        for(let j=0;j<3;j++) chain(p,'tooth'+s+j,[[s*hx*(.29+j*.14),ny-.025,nz+j*.045],[s*hx*(.32+j*.13),ny-fang*(1-j*.13),nz+j*.046-.012]],[.021+j*.002,.003],ivory,5);
      }
      if (!feline && ['twisted','oil','maw','ribs','ragged','acid','rot'].includes(infection)) chain(p,'seeping-drool'+s,[[s*hx*.39,ny-.025,nz-.026],[s*hx*.49,ny-.102,nz-.041],[s*hx*.55,ny-.167,nz-.027]],[.025,.020,.004],flat(infection==='acid'||infection==='ragged'?0x8c993d:0x262332),5);
      if (infection==='thorns') for(let i=0;i<7;i++){
        const z0=-z*.8+i*z*.22, x=s*bw*(.70+(i%3)*.11), y=h+d*(.64+.19*(i%2));
        chain(p,'thorn-vine'+s+i,[[x*.7,y-.15,z0-.07],[x*1.12,y+.02,z0],[x*.92,y+.14,z0+.19]],[.035,.027,.018],fur(0x555e3b,id),6);
        chain(p,'thorn'+s+i,[[x*1.12,y+.02,z0],[x*1.31,y+.15,z0-.039]],[.031,.003],bone,5);
      }
    }
  }
}
