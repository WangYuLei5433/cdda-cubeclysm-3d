import { V, blob, hull, flat, shade, sides, ink, ivory, fur, chain, skin, markings, eye, blade } from './fauna-kit.js';

const shellColors = {
  ant:[0x893d2c,0x522922], ant_small:[0xa54c32,0x623128], ant_soldier:[0x87352d,0x4a2826], ant_queen:[0x782f2b,0x522823],
  ant_acid:[0x835843,0x4b3430], ant_acid_soldier:[0x694834,0x382824], ant_acid_queen:[0x78523d,0x523a32],
  wasp:[0x443932,0xd1a137], wasp_guard:[0x554137,0xc79539], wasp_small:[0x28242b,0xe4b646],
  wasp_small_guard:[0x342e33,0xb89545], wasp_queen:[0x3a2f32,0xd2a446],
  bee:[0x393034,0xe1ac45], bee_small:[0x614639,0xc48e41], bee_mega:[0x2b2730,0xe1dbce], dermatik:[0x3d514e,0xa25e66],
};
function hymenopteran(p,id) {
  const [base,accent]=shellColors[id], winged=!id.startsWith('ant'), bee=id.startsWith('bee'), dermatik=id==='dermatik';
  const queen=id.endsWith('queen'), soldier=id.includes('soldier')||id.endsWith('guard'), acid=id.includes('acid');
  const y=bee?.53:winged?.77:queen?.54:.49;
  const w=queen?(acid?.31:.40):bee?.34:acid?.235:.205, h=queen?.32:bee?.30:acid?.255:.194;
  const length=queen?(acid?1.36:1.10):bee?.76:winged?.83:.70, head=soldier?.226:.17;
  const shell=fur(base,id+'-shell'), dark=fur(shade(base,.52),id+'-dark'), leg=fur(shade(base,1.13),id+'-legs');
  skin(p,'jointed-thorax',[[0,y,-.43,soldier?.15:.12,.14],[0,y+.04,-.27,bee?.297:queen&&!acid?.31:.185,bee?.234:queen?.258:.178],
    [0,y+.023,-.06,bee?.18:.15,.17],[0,y,.17,.095,.09]],shell,8);
  const waist=bee ? .136 : .052;
  skin(p,'narrow-petiole',[[0,y,-.02,waist+.029,waist+.026],[0,y-.04,.15,waist,waist*.92],[0,y-.06,.31,waist+.037,waist+.024]],dark,8);
  skin(p,'segmented-gaster',[[0,y-.068,.25,w*.48,h*.40],[0,y-.047,.36,w*.87,h*.84],
    [0,y-.074,length*.70,w,h],[.028,y-.077,length*.94,w*.73,h*.75],[.046,y-.127,length*(queen?1.40:1.17),w*.24,h*.29]],
    markings(id,base,shade(base,.68),winged?'rings':'bands',winged?accent:shade(base,1.19)));
  skin(p,'head',[[0,y+.005,-.71,head*.58,.099],[0,y+.04,-.62,head,.154],
    [0,y+.022,-.50,head*.91,.142],[0,y+.002,-.38,head*.62,.097]],shell,8);
  for(const s of sides) {
    const ant=[s*head*.39,y+.092,-.63], elbow=[s*(head+.06),y+.28,-.825];
    chain(p,'elbowed-antenna'+s,[ant,elbow,[s*(head+.14),y+.225,-1.03]],[.028,.018,.006],leg,6);
    const r=bee?.131:winged?.104:.062;
    blob(p,'compound-eye'+s,[r*.61,r,r*.77],[s*head*.88,y+.089,-.593],fur(dermatik?0x744953:0x231f2a,id+'-eye'),{},4,10);
    if (!bee) chain(p,'mandible'+s,[[s*head*.52,y-.064,-.64],[s*(head*(soldier?1.18:.8)),y-.087,-.82],
      [s*head*.31,y-.103,-(soldier?1.06:.9)],[s*.012,y-.116,-(soldier?1.04:.85)]],[soldier?.068:.043,.041,.016,.005],dark,6);
    if (bee) {
      const pollen=fur(id==='bee_mega'?0xa59e91:0xd3a257,id+'-pollen');
      blob(p,'pollen-basket'+s,[.084,.079,.10],[s*.405,y*.57,.102],pollen,{},3,8);
      chain(p,'short-mouthpart'+s,[[s*.054,y-.055,-.627],[s*.062,y-.103,-.758],[s*.019,y-.13,-.775]],[.036,.024,.007],dark,6);
    }
    for(let i=0;i<3;i++){
      const z=-.32+i*.161, spread=(soldier?.48:.39)+i*.041, reach=(i-1)*.276;
      const a=[s*.12,y-.061,z], b=[s*spread*.76,y+(winged?.04:.13),z+reach*.46],
        c=[s*spread,y*.37,z+reach*.80], d=[s*(spread+.091),.014,z+reach*1.23];
      chain(p,'six-jointed-legs'+s+i,[a,b,c,d],[.050,.042,.026,.009],leg,6);
      blob(p,'leg-knee'+s+i,[.041,.040,.043],b,shell,{},2,7);
    }
    if (winged) {
      for(let i=0;i<2;i++){
        const root=[s*.13,y+.124-i*.042,-.24+i*.18], span=(bee?.67:dermatik?.81:.76)*(i===0?1:.77);
        const tip=[s*span,y+(bee?.26:.45)-i*.14,.68+i*.23], shoulder=[s*(span+.07),y+(bee?.19:.31)-i*.11,.38+i*.215];
        const edge=[s*.37,y+.17-i*.035,.59+i*.17];
        const wing=fur(i===0?0xd4d4c8:0xbdbfb7,id+'-wing'+i);
        blade(p,'wing'+s+i,root,shoulder,tip,edge,wing,.012,{ glass:true });
        for(let j=0;j<3;j++){
          const t=j*.24;
          chain(p,'wing-vein'+s+i+j,[[root[0],root[1]+.008,root[2]],
            [shoulder[0]+(tip[0]-shoulder[0])*t,shoulder[1]+(tip[1]-shoulder[1])*t+.008,shoulder[2]+(tip[2]-shoulder[2])*t]],
            [.012,.004],leg,4);
        }
      }
    }
    if (bee || id==='ant_soldier' || id==='ant_acid_soldier'){
      for(let i=0;i<7;i++){
        const j=i/7, z=-.34+j*.45, x=s*(.135+Math.sin(j*Math.PI)*.069);
        chain(p,'bristle'+s+i,[[x,y+.102,z],[x+s*.046,y+.16,z+.022]],[.012,.002],fur(bee?accent:0xb5815f,id),4);
      }
    }
    if (acid&&soldier) chain(p,'armored-head-crest'+s,[[s*.075,y+.114,-.58],[s*.112,y+.25,-.53],[s*.131,y+.32,-.37]],[.061,.043,.006],shell,6);
  }
  if (acid||winged) {
    const a=[.046,y-.127,length*(queen?1.40:1.17)];
    if (winged) {
      const f=dermatik?.65:id==='bee_mega'?.48:queen?.125:.29;
      chain(p,dermatik?'ovipositor':'stinger',[a,[.068,a[1]-.072,a[2]+f*.47],[.091,a[1]-.14,a[2]+f]],[.068,.034,.003],dark,7);
    }
    if (acid&&!queen) {
      p.faunaFx = { kind: 'drip', points: [[a[0],a[1]-.065,a[2]+.034]], color: 0xa6b94b, size: .031, drop: .22, n: 2 };
      blob(p,'acid-opening',[.069,.055,.028],a,dark,{},3,8);
      chain(p,'acid-bead',[ [a[0],a[1]-.016,a[2]+.019],[a[0]+.01,a[1]-.114,a[2]+.033] ],[.033,.017],flat(0x9ea350),6);
    }
  }
  if (queen) for(let i=0;i<4;i++){
    blob(p,'egg'+i,[.076,.081,.123],[(i%2-.5)*.21,.081,length*.84+Math.floor(i/2)*.19],fur(0xe2d7be,'egg'),{},3,8);
  }
}

function spider(p,id) {
  const cellar=id.includes('cellar'), jumping=id.includes('jumping'), widow=id.includes('widow'), wolf=id.includes('wolf'), large=id==='spider_web';
  const color=cellar?0xa28b6e:jumping?0x4c4147:widow?0x27262f:wolf?0x775240:large?0xa2a09b:0x888581;
  const w=cellar?.10:jumping?.225:widow?.259:wolf?.229:.206;
  const y=cellar?.53:jumping?.36:widow?.39:.43, a=cellar?.84:jumping?.57:widow?.68:wolf?.70:.77;
  const coat=fur(color,id), dark=fur(shade(color,.62),id+'-tips'), band=fur(shade(color,1.27),id+'-joints');
  skin(p,'abdomen',[[0,y-.062,.02,w*.47,w*.39],[0,y+.002,.19,w*.86,w*.81],[0,y+.031,.38,w,w*.94],
    [0,y+.008,.54,w*.73,w*.65],[0,y-.026,cellar?.57:.73,w*.24,w*.25]],markings(id,color,shade(color,.74),widow?'':wolf?'lines':'spots'));
  blob(p,'cephalothorax',[jumping?.219:.141,w*.68+.035,cellar?.18:.25],[0,y-.011,-.16],coat,{},4,10);
  for (const s of sides) {
    for(let i=0;i<4;i++){
      const z0=-.29+i*.129, dz=(i-1.5)*.19, span=a*(.83+.08*Math.sin(i*1.23))*(jumping&&i===0?1.18:1);
      const r=cellar?.018:jumping&&i===0?.063:wolf?.051:.042;
      const a0=[s*.105,y-.008,z0], b=[s*span*.58,y+(cellar?.155:jumping&&i===0?.16:.23),z0+dz*.62],
        c=[s*span*.83,y*.48,z0+dz], toe=[s*span,.013,z0+dz*1.76];
      chain(p,'walking-leg'+s+i,[a0,b,c,toe],[r,r*.77,r*.49,r*.19],coat,6);
      blob(p,'leg-joint'+s+i,[r,r*.8,r],b,band,{},2,6);
      if(wolf||jumping) for(let j=1;j<=3;j++){
        const t=j*.20, hx=b[0]+(c[0]-b[0])*t, hy=b[1]+(c[1]-b[1])*t, hz=b[2]+(c[2]-b[2])*t;
        chain(p,'leg-hair'+s+i+j,[[hx,hy,hz],[hx+s*.03,hy+.045,hz+.037]],[.008,.002],band,4);
      }
    }
    const eyeR=jumping?.073:wolf?.058:cellar?.024:.043;
    for(let j=0;j<4;j++){
      const x=s*(.052+j*(cellar?.016:.027)), yy=y+(jumping?.061:.043)-(j%2)*.027, zz=(cellar?-.321:-.392)+j*.026;
      blob(p,'forward-eye'+s+j,[eyeR*(1-j*.13),eyeR*(1-j*.13),eyeR*.72],[x,yy,zz],j===0?fur(0x2e2730,id):ink,{},3,8);
      if(j===0) blob(p,'eye-glint'+s,[eyeR*.17,eyeR*.18,eyeR*.11],[x-.009,yy+eyeR*.29,zz-eyeR*.71],flat(0xb8a9a4),{},2,5);
    }
    chain(p,'chelicera'+s,[[s*.078,y-.064,-.29],[s*.111,y-.132,-.43],[s*.051,y-.214,-.485]],
      [cellar?.036:.063,.036,.004],dark,7);
  }
  if(widow){
    const y0=y+.145;
    hull(p,'hourglass-upper',[V(-.062,y0,.01),V(.062,y0,.01),V(0,y0+.019,.098),V(0,y0-.028,.063)],flat(0xd04c47));
    hull(p,'hourglass-lower',[V(0,y0+.012,.069),V(-.067,y0-.025,.172),V(.067,y0-.025,.172),V(0,y0-.054,.108)],flat(0xd04c47));
    const red=flat(0xd44e45);
    blade(p,'hourglass-upper-outline',[-.088,y+.266,.324],[.088,y+.266,.324],[.026,y+.281,.389],[-.026,y+.281,.389],red,.013);
    blade(p,'hourglass-lower-outline',[-.022,y+.282,.382],[.022,y+.282,.382],[.092,y+.266,.453],[-.092,y+.266,.453],red,.013);
  }
}

function crawlingInsect(p,id){
  const grub=id==='dermatik_larva', silver=id.startsWith('silverfish'), nymph=id.endsWith('nymph');
  const base=grub?0xdac9ad:silver?0x939693:0x6f4232, under=grub?0xbfa98c:silver?0xb9b2a9:0x9e704f;
  const y=grub?.25:silver?.20:.27, length=nymph?.62:1.0, w=grub?.26:silver?.18:.25;
  const body=fur(base,id), dark=fur(shade(base,.61),id+'-dark'), pale=fur(under,id+'-belly');
  if(grub){
    for(let i=0;i<8;i++){
      const r=w*(1-Math.abs(i-3.2)*.13), z=-.49+i*.144, x=Math.sin(i*.47)*.069;
      blob(p,'grub-segment'+i,[r,r*.88,.137],[x,y+Math.sin(i*.41)*.07,z],i%2?body:pale,{},3,9);
    }
    blob(p,'head-capsule',[.15,.12,.147],[0,y,-.58],fur(0xc0a382,id+'-head'),{},4,9);
    for(const s of sides){
      hull(p,'spade-mandible'+s,[V(s*.036,y-.018,-.61),V(s*.15,y-.05,-.68),V(s*.142,y-.074,-.83),
        V(s*.048,y-.095,-.90),V(s*.008,y-.067,-.82),V(s*.067,y-.022,-.81)],dark);
    }
    return;
  }
  const head=-length*.54, thorax=-length*.21;
  skin(p,'flattened-armored-body',[[0,y,head,w*.55,w*.52],[0,y+.02,thorax-.051,w*.83,w*.64],
    [0,y+.013,thorax+.12,w,w*.66],[0,y+.007,length*.26,w*.84,w*.55],
    [0,y-.027,length*.46,w*(silver?.61:.76),w*.39],[.014,y-.051,length*.60,w*(silver?.10:.36),w*.21]],
    markings(id,base,under,silver?'bands':'lines',silver?0x656e70:0x4e342e));
  blob(p,'head',[w*.56,w*.45,.118],[0,y-.039,head-.03],dark,{},3,8);
  if(!silver){
    for(const s of sides){
      skin(p,'wing-cover'+s,[[s*w*.29,y+w*.21,thorax-.07,w*.43,.039],[s*w*.43,y+w*.46,thorax+.171,w*.51,.060],
        [s*w*.44,y+w*.36,length*.36,w*.37,.048],[s*w*.21,y+w*.12,length*.58,w*.15,.025]],fur(shade(base,1.26),id+'-elytron'),8);
    }
  }
  for(const s of sides){
    eye(p,'eye'+s,[s*w*.50,y+.003,head-.061],silver?.026:.036);
    chain(p,'long-antenna'+s,[[s*w*.31,y-.008,head-.10],[s*w*1.19,y+.123,head-.26],
      [s*w*1.85,y+.098,head-.49],[s*w*2.05,y+.051,head-.67]],[.023,.018,.011,.003],body,5);
    for(let i=0;i<3;i++){
      const z=thorax+i*.132, spread=w*(1.40+i*.24), r=silver?.03:.049;
      const a=[s*w*.57,y-.058,z], b=[s*spread,y+.029,z+(i-1)*.12], c=[s*spread*1.09,.068,z+(i-1)*.23],
        d=[s*spread*1.21,.017,z+(i-1)*.28+.065];
      chain(p,'leg'+s+i,[a,b,c,d],[r,r*.72,r*.54,r*.18],body,6);
      if (!silver) for(let j=0;j<3;j++) chain(p,'tibia-spine'+s+i+j,[[b[0]+(c[0]-b[0])*j*.29,b[1]+(c[1]-b[1])*j*.29,b[2]+(c[2]-b[2])*j*.29],
        [b[0]+(c[0]-b[0])*j*.29+s*.024,b[1]+(c[1]-b[1])*j*.29+.032,b[2]+(c[2]-b[2])*j*.29+.055]],[.013,.002],dark,4);
    }
  }
  if (silver) {
    for(let k=0;k<6;k++){
      const z=length*(-.18+k*.127), f=(1-k*.087);
      skin(p,'overlapping-silver-scale'+k,[[0,y+.089*f,z-.074,w*.79*f,.034],
        [0,y+.135*f,z-.026,w*.94*f,.051],[0,y+.103*f,z+.081,w*.87*f,.022]],
        fur(shade(base,1.09+(k%2)*.15),id+'-scale'+k),8);
    }
  }
  if (silver) for(let i=-1;i<=1;i++){
    const far=i===0?1.22:1.07;
    skin(p,'three-separated-terminal-filaments'+i,[[i*.024,y-.054,length*.51,.025,.023],
      [i*.053,y-.053,length*.64,.023,.021],[i*.137,y-.021,length*.84,.017,.017],
      [i*.211,y+.025,length*far,.010,.010],[i*.228,y+.039,length*(far+.12),.004,.005]],body,7);
  }
  if (!silver) for (const s of sides) {
    chain(p,'short-cerci'+s,[[s*.067,y-.051,length*.53],[s*.111,y-.047,length*.65],
      [s*.155,y-.053,length*.739]],[.022,.017,.005],dark,5);
  }

}
export function arthropod(p,id){
  if (id.startsWith('spider_')) spider(p,id);
  else if (id in shellColors) hymenopteran(p,id);
  else crawlingInsect(p,id);
}
