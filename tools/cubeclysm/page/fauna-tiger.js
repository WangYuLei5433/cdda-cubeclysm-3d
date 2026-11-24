import { fill } from './paint.js';
import { blob, fur, markings, shade, sides, skin } from './fauna-kit.js';
import { felineHead } from './fauna-feline-head.js';
import { mammalTail } from './fauna-mammal-tails.js';

// The flank markings use the full length and angle of the body rather than individual
// atlas faces. Each stripe has its own waviness, taper and small difference between sides.
const stripeCenters = [.112,.207,.311,.405,.516,.616,.730,.822,.924];
function tigerFur(ctx,x,y,w,h,label) {
  const [ring,facet]=label.split(':').map(Number);
  fill(ctx,x,y,w,h,0xc68648);
  if(label==='cap') return;
  for(let dy=0;dy<h;dy++) for(let dx=0;dx<w;dx++){
    const angle=(facet+(dx+.5)/w)*Math.PI/6;
    const altitude=Math.sin(angle);
    const v=(ring+1-(dy+.5)/h)/6;
    const belly=altitude<-.54+.092*Math.sin(v*19.4);
    const stripe=stripeCenters.some((c,i)=>{
      const s=Math.cos(angle), start=-.57+.30*Math.sin(i*2.23);
      if (altitude<start) return false;
      const center=c+.031*Math.sin(angle*2.14+i*1.72)+.019*s*(i%2?1:-1);
      const width=(.013+.012*(.5+.5*Math.sin(i*4.01)))*Math.min(1.05,.36+(altitude-start)*.92);
      return Math.abs(v-center)<width;
    });
    const color=stripe?0x332529:belly?0xe8dcc6:altitude>.65?0xbc713a:0xcd8b4b;
    fill(ctx,x+dx,y+dy,1,1,color);
  }
}

export function tiger(p) {
  const id='tiger', base=0xcb8545, underside=0xe8ddca;
  const coat=fur(base,'tiger-flanks');
  const pale=fur(underside,'tiger-belly');
  const paw=fur(0xba7b44,'tiger-paws');
  const y=.76,z=.823,w=.252,d=.250;
  skin(p,'heavy-shoulders-and-flexible-back',[
    [0,y+.020,-z*1.035,w*.69,d*.79],[0,y+.045,-z*.78,w*.91,d*1.05],
    [0,y+.041,-z*.43,w*1.10,d*1.16],[0,y-.025,z*.00,w,d*1.04],
    [0,y-.011,z*.39,w*.79,d*.78],[0,y+.015,z*.70,w*.89,d*.80],
    [0,y+.013,z*1.004,w*.46,d*.48],
  ],tigerFur,12);
  const hy=.906,hz=-1.041;
  skin(p,'muscular-low-neck',[
    [0,y-.041,-z*.64,w*.84,d*.87],[0,y+.025,-z*.91,.217,.241],
    [0,hy-.039,hz+.145,.180,.203],
  ],markings('tiger-neck',base,underside,'bands',0x36282b),10);
  skin(p,'pale-throat',[
    [0,y-.205,-z*.66,.130,.053],[0,y-.170,-z*.96,.145,.073],
    [0,hy-.144,hz+.099,.129,.065],
  ],pale,8);
  felineHead(p,{id,type:id,y:hy,z:hz,radius:.204,base,under:underside,iris:0xb69a56});

  for (const s of sides) {
    for (const rear of [false,true]) {
      const stagger=s*(rear?-.102:.097);
      const z0=(rear?z*.65:-z*.65)+stagger, x=s*w*(rear?.77:.68);
      const knee=[x*1.07,rear?.506:.440,z0+(rear?-.145:-.018)];
      const hock=[x*1.02,rear?.269:.240,z0+(rear?.118:.031)];
      const foot=[x*1.02,.075,z0+(rear?.008:-.078)];
      const striping=markings('tiger-leg'+s+rear,base,shade(base,.91),'bands',0x3b2b2a,9);
      skin(p,(rear?'muscular-haunch':'deep-shoulder-and-foreleg')+s,[
        [x*.79,y+(rear?.050:.086),z0,rear?.136:.121,rear?.174:.149],
        [x*.99,y*.81,z0-.059,.119,.142],[...knee,.094,.109],
        [...hock,.061,.065],[...foot,.073,.085],
      ],striping,9);
      blob(p,'broad-padded-paw'+s+rear,[.087,.075,.119],foot,paw,{},3,9);
      for(let i=-1;i<=1;i++) blob(p,'rounded-toe'+s+rear+i,[.032,.030,.045],
        [foot[0]+i*.047,.033,foot[2]-.083],paw,{},2,7);
    }
  }
  mammalTail(p,{id,type:id,style:'rings',y,z,depth:d,length:.85,rise:.13,coat,light:pale});
}
