import { V, blob, hull, flat, shade, fur, skin, chain, sides, ink, ivory } from './fauna-kit.js';

/** The muzzle and paws carry the details that separate similar-sized mammals. */
export function mammalFace(p, { id, type, frame, infection, hx, hy, hz, ny, nz, light }) {
  const whiskered = frame === 'rabbit' || ['sewer_rat', 'black_rat', 'lab_rat', 'raccoon', 'otter', 'muskrat'].includes(type);
  if (whiskered && !infection) {
    const whisker = flat(type === 'lab_rat' ? 0x987e73 : 0xd0bda4);
    const pad = flat(0xb49b81);
    for (const s of sides) {
      const x = s * hx * .42;
      if (frame === 'rabbit') blob(p, 'whisker-pad' + s, [hx * .30, hx * .19, hx * .24], [x, ny - hx * .08, nz + .025], light, {}, 3, 7);
      for (let i = 0; i < 3; i++) {
        const a = [x, ny - hx * (.025 + i * .093), nz + .028 + i * .023];
        const b = [s * hx * (1.08 + i * .13), a[1] + hx * (.25 - i * .15), a[2] - hx * .37];
        const c = [s * hx * (1.54 + i * .11), b[1] - hx * .13, b[2] + hx * .14];
        chain(p, 'whisker' + s + i, [a, b, c], [hx * .023, hx * .018, hx * .004], i === 0 ? pad : whisker, 4);
      }
    }
  }
  if (['dog_rottweiler','fox_red','fox_gray','dog_gshepherd'].includes(type) && !infection) {
    const tan = fur(type === 'dog_rottweiler' ? 0xaa6944 : type === 'fox_red' ? 0xb76338 : 0x8a6850, id + '-cheek');
    for (const s of sides) {
      blob(p, 'cheek-pattern' + s, [hx*.27,hx*.26,hx*.35], [s*hx*.63,ny-.033,nz+.065], tan, {}, 3, 7);
      if (type === 'dog_rottweiler') blob(p, 'tan-eyebrow' + s, [hx*.16,hx*.095,hx*.17], [s*hx*.85,hy+.068,hz-.031], tan, {}, 2, 7);
    }
  }
  if (type === 'opossum') {
    for (const s of sides) blob(p,'dark-ear-rim'+s,[.029,.031,.036],[s*hx*.77,hy+hx*.75,hz+.089],ink,{},3,7);
    blob(p,'pink-nose',[hx*.32,hx*.20,.022],[0,ny+.016,nz-.031],flat(0x9f646b),{},3,7);
  }
  if (type === 'raccoon') {
    skin(p,'pale-mask-bridge',[[0,ny+.053,nz+.043,.042,.04],[0,hy+.069,hz-.024,.065,.062],[0,hy+.10,hz+.06,.062,.061]],light,8);
  }
}

export function mammalFeet(p, type, frame, toe, radial, rear, coat) {
  if (type === 'raccoon' || type === 'opossum' || type === 'otter' || type === 'beaver') {
    const webbed = rear && (type === 'beaver' || type === 'otter');
    for (let i = -2; i <= 2; i++) {
      const x = toe[0] + i * radial * .30, y = radial * .20;
      const z = toe[2] - radial * (1.56 - Math.abs(i) * .14);
      chain(p, 'splayed-digit' + toe[0] + rear + i, [[x,y,toe[2]-.045],[x+i*radial*.10,y*.65,z]], [radial*.17,radial*.075],coat,5);
      if (webbed) blob(p,'webbing'+toe[0]+i,[radial*.21,radial*.16,radial*.29],[x,y,toe[2]-radial*.93],coat,{},2,6);
    }
  }
  if (frame === 'bear' || frame === 'pig') {
    const points = frame === 'bear' ? [-.53, -.18, .18, .53] : [-.27, .27];
    for (const k of points) {
      const x=toe[0]+k*radial;
      chain(p,'claw-or-cleft-hoof'+toe[0]+rear+k,[[x,radial*.36,toe[2]-radial*.65],[x,radial*.17,toe[2]-radial*1.36]],
        [radial*(frame==='bear'?.17:.25),radial*.09],frame==='bear'?ivory:ink,5);
    }
  }
}

export function mammalInfection(p, { id, infection, h, d, z, bw, hx, hy, hz, ny, nz, raw, bone, coat }) {
  const fluid=flat(infection==='acid'?0xb2c448:0x221d2a);
  if (!['ziger','zougar'].includes(id) && ['oil','hindlegs','maw','rot','gaunt','bull'].includes(infection)) {
    for (const s of sides) {
      const x=s*hx*.95;
      const a=[x,hy+.009,hz-.03], b=[x*1.03,hy-.054,hz-.058], c=[x*.78,hy-.135,hz-.119];
      chain(p,'oily-eye-track'+s,[a,b,c],[hx*.121,hx*.094,hx*.024],fluid,6);
    }
  }
  if (infection==='twisted') {
    const slime=fur(0x777b50,id+'-neck-runoff');
    for (const s of sides) for (let i=0;i<3;i++){
      const zz=hz+.14+.075*i, x=s*hx*(.68+i*.13);
      chain(p,'neck-slime-rivulet'+s+i,[[x,hy+.061,zz],[x*1.18,hy-.045,zz+.014],
        [x*1.13,hy-.18,zz+.077],[x*.96,hy-.29,zz+.14]],[.026,.029,.018,.005],slime,6);
    }
  }
  if (infection==='skeleton') {
    skin(p,'exposed-vertebral-column',[[0,h+.10,-z*.68,.059,.042],[0,h+.156,-z*.25,.066,.057],[0,h+.137,z*.31,.056,.047],
      [0,h+.078,z*.77,.039,.044]],bone,8);
    for(let i=0;i<6;i++) blob(p,'vertebra'+i,[.071,.069,.053],[0,h+.164,z*(-.59+i*.23)],bone,{},3,7);
    for(const s of sides) chain(p,'black-sinew'+s,[[s*bw*.31,h+.13,-z*.67],[s*bw*.67,h+.09,-z*.19],
      [s*bw*.49,h+.12,z*.14],[s*bw*.58,h+.07,z*.70]],[.023,.023,.021,.010],fluid,6);
  }
  if (['acid','oil','rot','char','ragged'].includes(infection)) {
    const cavity=fur(infection==='acid'?0x5c623e:infection==='char'?0x120e18:0x49303b,id+'-cavity');
    for (const s of sides) for (let i=0;i<3;i++) {
      const y=h-d*(.29+i*.16), zz=z*(-.48+i*.39), x=s*bw*(.93-i*.041);
      const size=i===1?1.20:1;
      hull(p,'torn-hide-rim'+s+i,[V(x*.92,y-.07*size,zz-.08),V(x*1.08,y+.025,zz-.098*size),V(x*1.06,y+.11*size,zz+.005),
        V(x*1.02,y-.025,zz+.096*size),V(x*.94,y-.091*size,zz+.061),V(x*.87,y+.07,zz-.014)],raw);
      blob(p,'dark-wound-pocket'+s+i,[.027,.064*size,.069*size],[x*1.074,y+.009,zz+.009],cavity,{},3,8);
      if (infection!=='char') chain(p,'loose-tissue'+s+i,[[x*1.10,y+.006,zz],[x*1.15,y-.066,zz+.014],[x*1.08,y-.127,zz+.023]],[.027,.020,.007],infection==='acid'?fluid:raw,6);
    }
  }
  if (infection==='rot') {
    for (const s of sides) for (let i=0;i<3;i++) {
      const y=h+.041-i*.047, zz=-z*.41+i*.21, x=s*bw*1.13;
      blob(p,'green-blowfly'+s+i,[.018,.027,.037],[x,y,zz],flat(0x567740),{ metal:true },2,7);
      for(const wing of sides) blob(p,'fly-wing'+s+i+wing,[.009,.017,.026],[x+s*.018,y+.017,zz+wing*.022],flat(0x969e8b),{},2,5);
    }
  }
  if (infection==='brute'||infection==='hulk') {
    for(const s of sides) for(let i=0;i<3;i++){
      const zz=z*(-.65+i*.43), x=s*bw*(.63+i*.082);
      skin(p,'swollen-back-muscle'+s+i,[[x,h+d*.45,zz-.11,.062,.071],[x*1.13,h+d*.67,zz,.076,.083],
        [x*1.05,h+d*.53,zz+.21,.054,.061]],i%2?coat:raw,8);
    }
  }
  if (infection==='thorns') {
    const vine=fur(0x6d7753,id+'-vine'), silver=flat(0xb1b9b3);
    for(const s of sides){
      const center=[s*(hx*.66+.30),hy+hx*.70+.252,hz+.35];
      const coil=Array.from({length:8},(_,i)=>{
        const a=i*1.51;
        return [center[0]+s*i*.039,center[1]+i*.018+Math.cos(a)*.056,center[2]+Math.sin(a)*.066];
      });
      chain(p,'silver-antler-vine'+s,coil,coil.map((_,i)=>.038-i*.0033),vine,6);
      for (const i of [2,4,6]) {
        const [x,y,zz]=coil[i];
        chain(p,'vine-thorn'+s+i,[[x,y,zz],[x+s*.032,y+.053,zz-.078],[x+s*.054,y+.046,zz-.14]],[.020,.014,.002],vine,5);
        blob(p,'silver-sap-bead'+s+i,[.016,.027,.017],[x,y-.043,zz],silver,{ metal:true },3,7);
      }
    }
  }
  if (infection==='skull') {
    for (const s of sides) {
      const x=s*hx*.64;
      hull(p,'fused-skull-cheek'+s,[V(x,ny-.111,nz+.03),V(x*1.48,hy-.027,hz-.009),V(x*1.26,hy+.028,hz+.09),V(x*.75,ny-.071,nz-.019),V(x*.82,hy+.08,hz-.075)],bone);
      blob(p,'recessed-skull-eye'+s,[.025,.050,.054],[s*hx*1.023,hy+.037,hz-.027],ink,{},3,7);
    }
  }
}
