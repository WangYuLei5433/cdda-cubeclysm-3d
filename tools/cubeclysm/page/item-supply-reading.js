import { coverDesign, reading } from './item-expansion-reading.js';
import { V, bevel, steelP, tube } from './common-loot-kit.js';

const palettes={
  burgundy:['#663b43','#f1dfaa','#c39359','#8a5b5b'],
  navy:['#344c67','#f1e2bc','#caa066','#65788d'],
  olive:['#525a44','#f4e7c1','#c6a35c','#798365'],
  ochre:['#8a663f','#f4e6c3','#5f7566','#a88a5e'],
  linen:['#d3b78c','#52483b','#976a53','#ae8e6a'],
  charcoal:['#42434c','#f2e6cc','#b88d61','#6e6770'],
  plum:['#5d495f','#f0dfbb','#c49171','#8f7290'],
  teal:['#3e6870','#f1e8c9','#cf9966','#71938f'],
  gray:['#777772','#f5eed8','#bca581','#a49c8a'],
};

// The cover is original artwork. The item description determines format and visible details.
const editions={
  family_cookbook:{binding:'binder',palette:'linen',art:'table',label:'FAMILY RECIPES',layout:'emblem',width:.163,thickness:.051},
  cookbook_native:{detail:'hard',palette:'ochre',art:'table',label:'NATIVE CUISINE',layout:'illustratedTop',width:.155,thickness:.042},
  cookbook_turkish:{palette:'teal',art:'table',layout:'fullBleed',width:.154},
  book_nonf_hard_sports_bike:{palette:'navy',art:'mountains',layout:'fullBleed',width:.176,thickness:.039},
  book_nonf_hard_sports_morg:{palette:'olive',art:'court',layout:'framed',width:.114,thickness:.013},
  book_nonf_hard_homemk_nyparti:{palette:'plum',art:'photo',layout:'fullBleed',width:.173},
  book_nonf_hard_homemk_plantshome:{palette:'olive',art:'local',layout:'illustratedTop',width:.162},
  manual_rifle:{palette:'olive',art:'handbook',label:'FIELD MANUAL',layout:'columns',thickness:.028},
  manual_stabbing:{palette:'olive',art:'handbook',label:'FIELD MANUAL',layout:'twoTone',thickness:.026},
  manual_traps_mil:{palette:'olive',art:'handbook',label:'FIELD MANUAL',layout:'spineBand',thickness:.032},
  manual_melee:{detail:'hard',palette:'charcoal',art:'handbook',layout:'framed'},
  recipe_bullets:{binding:'latch',detail:'hard',palette:'gray',art:'handbook',layout:'twoTone'},
  recipe_labchem:{binding:'binder',palette:'charcoal',art:'lab',label:'RESTRICTED',layout:'columns',width:.152,thickness:.044},
  manual_brawl:{binding:'spiral',palette:'gray',art:'court',label:'PHOTOCOPIED EDITION',layout:'columns',width:.15,thickness:.011},
  holybook_catechism1:{palette:'linen',layout:'framed'}, holybook_granth:{palette:'navy',layout:'emblem'},
  holybook_tanakh:{palette:'teal',layout:'emblem'}, holybook_tripitaka:{palette:'ochre',layout:'framed'},
  book_judaica_siddur:{palette:'burgundy',layout:'framed'}, holybook_hadith:{palette:'olive',layout:'emblem'},
  holybook_kojiki:{palette:'linen',layout:'emblem'}, holybook_mormon:{palette:'navy',layout:'framed'},
  holybook_wicca:{palette:'charcoal',art:'occult',layout:'emblem'}, holybook_wicca2:{palette:'plum',art:'occult',layout:'framed'},
  holybook_bible2:{palette:'burgundy',layout:'emblem'}, holybook_catechism2:{palette:'charcoal',layout:'framed',thickness:.046},
  holybook_catechism8:{palette:'plum',layout:'emblem'}, holybook_orthodox:{detail:'soft',palette:'navy',layout:'twoTone'},
  holybook_egypt:{palette:'ochre',art:'desert',layout:'illustratedTop'}, holybook_egypt2:{palette:'olive',art:'archive',layout:'twoTone'},
  holybook_nag_hammadi:{palette:'burgundy',art:'archive',layout:'framed'},
  decoy_anarch:{palette:'teal',art:'map',layout:'illustratedTop',label:'TRAVEL GUIDE'},
  textbook_anarch:{palette:'teal',art:'map',layout:'illustratedTop',label:'TRAVEL GUIDE'},
  tailor_japanese:{palette:'plum',art:'stitch',layout:'illustratedTop'},
  vinegar_maker:{palette:'ochre',art:'table',layout:'columns'},
  textbook_speech:{palette:'navy',art:'portrait',layout:'framed'},
  textbook_business:{palette:'teal',art:'diagram',layout:'spineBand'},
  book_pneumatics:{palette:'navy',art:'tools',layout:'columns'},
  survival_book:{palette:'olive',art:'mountains',layout:'illustratedTop'},
  sweets_book:{palette:'linen',art:'table',layout:'emblem',width:.156},
  theater_props:{palette:'plum',art:'tools',layout:'twoTone'},
};

export function supplyReading(p,d) {
  const edition=editions[d.id];
  if (!edition) return reading(p,d);
  const {binding, palette, art, label, layout, ...format}=edition;
  const base=coverDesign(d);
  const cover={...base,palette:palettes[palette],art:art??base.art,label:label??base.label};
  reading(p,{...d,detail:format.detail??(binding==='binder'?'hard':d.detail)},{...format,cover,layout});
  const pageEdge=(format.width??.137)/2;
  const thickness=format.thickness??.03;
  const metal=steelP(0xb3b2ad);
  if(binding==='binder'||binding==='spiral'){
    const count=binding==='spiral'?11:3, pitch=binding==='spiral'?.016:.059;
    for(let i=0;i<count;i++) {
      const x=(i-(count-1)*.5)*pitch;
      const y=binding==='spiral'?thickness+.002:thickness+.001;
      tube(p,'binding ring',V(x,y,pageEdge-.005),V(x,y-.003,pageEdge+.006),.0012,.0012,6,metal);
      tube(p,'binding edge',V(x,y-.003,pageEdge+.006),V(x,.003,pageEdge+.006),.0012,.0012,6,metal);
    }
  } else if(binding==='latch'){
    bevel(p,'latched cover clasp',[-.014,.007,-pageEdge-.003,.014,.021,-pageEdge+.003],.003,metal);
  }
}
