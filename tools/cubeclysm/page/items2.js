// Cubeclysm items, batch 2: the census's visible items from 50% to 80% (docs/census.zh.md),
// low-poly with painted textures (item-kit.js). One model per CDDA id, after its description and
// size (volume, longest side). Novels are 18 cm paperbacks (CDDA: longest side 18 cm, 662 ml), each
// with its own cover; folded clothes lie as they would in a drawer.
import {
  CUT, GLASS, STEEL, V, band, barkP, bevel, blob, book, can, clothP, coil, crumple, cyl, denimP, fill, flat, flatHandle, folded, hull, knitP,
  layers, loop, lump, pane, qbox, paperP, pile, plasticP, printP, rng, shade, sheet, speckle, steelP, stoneP, tube, woodP,
} from './item-kit.js';

// --- cover motifs -------------------------------------------------------------------------------
const disc = (hex, cx = .5, cy = .38, r = .16) => (ctx, x, y, w, h) => { const R = Math.min(w, h) * r; for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) if (i * i + j * j <= R * R) fill(ctx, Math.round(x + w * cx + i), Math.round(y + h * cy + j), 1, 1, hex); };
const stripes = (hex, n = 3) => (ctx, x, y, w, h) => { for (let k = 0; k < n; k++) fill(ctx, x, y + Math.round(h * (.12 + k * .1)), w, Math.max(1, Math.round(h * .04)), hex); };
const stars = (hex, seed) => (ctx, x, y, w, h) => { const r = rng(seed); for (let k = 0; k < 14; k++) fill(ctx, x + Math.round(r() * w), y + Math.round(r() * h * .55), 1, 1, hex); };
const diag = (hex) => (ctx, x, y, w, h) => { for (let i = 0; i < Math.min(w, h) * .55; i++) fill(ctx, x + Math.round(w * .15) + i, y + Math.round(h * .1) + Math.round(i * .8), 2, 2, hex); };
const shape = (hex, pts) => (ctx, x, y, w, h) => { for (const [a, b, c, d] of pts) fill(ctx, x + Math.round(w * a), y + Math.round(h * b), Math.max(1, Math.round(w * c)), Math.max(1, Math.round(h * d)), hex); };

const NOVEL = { L: .18, W: .11 };
const thick = (ml, L = .18, W = .11) => +(ml / 1e6 / (L * W)).toFixed(3);
const B = (id, desc, o) => ({ id, desc, build: (p) => book(p, o) });
/** Clothes: folded, `knit` for knitwear, `denim`; the rest of the options go to folded(). */
const F = (id, desc, { color, knit = false, denim = false, ...o }) => ({ id, desc, build: (p) => folded(p, { color, paint: knit ? knitP(color) : denim ? denimP(color) : clothP(color), ...o }) });

const RECIPES = [
  // Books --------------------------------------------------------------------------------------
  B('novel_drama', 'A real book for real adults.  (Paperback, 18 cm, 662 ml.)', { ...NOVEL, T: thick(662), color: 0x6a3a5a, motif: disc(0xe8c8a0) }),
  B('novel_mystery', 'A detective investigates an unusual murder in a secluded location.  (Paperback: a dark cover, a lone house.)', { ...NOVEL, T: thick(662), color: 0x2a3440, motif: shape(0xd8c070, [[.4, .25, .2, .2], [.47, .3, .06, .06]]) }),
  B('novel_pulp', 'A hardboiled detective tale filled with hard hitting action and intrigue.  (Paperback: lurid yellow and red.)', { ...NOVEL, T: thick(662), color: 0xd8a020, title: 0xb82020, motif: diag(0x2a1a1a) }),
  B('novel_crime', 'After their diamond heist goes wrong, the surviving criminals begin to suspect that one of them is a police informant.  (Paperback: black with a diamond.)', { ...NOVEL, T: thick(662), color: 0x1e1e22, title: 0xd83030, motif: shape(0xd8e8f0, [[.42, .3, .16, .1], [.46, .22, .08, .08]]) }),
  B('novel_coa', 'A classic tale about growing up, portraying one young man\'s funny and poignant experiences with life, love, and sex.  (Paperback, 500 ml.)', { ...NOVEL, T: thick(500), color: 0xc84a2a, motif: shape(0x2a2a2a, [[.45, .2, .1, .3]]) }),
  B('novel_war', 'A thrilling narrative of survival in a prisoner of war camp during the Second World War.  (Paperback: olive, barbed wire.)', { ...NOVEL, T: thick(662), color: 0x5a6a3a, motif: stripes(0x2a2a20, 2) }),
  B('novel_war2', 'A story about a Bosnian citizen who goes through many hardships and near death during the breakup of Yugoslavia.  (Paperback: grey with a red band.)', { ...NOVEL, T: thick(662), color: 0x6a6a68, title: 0xe8e4dc, motif: stripes(0xa82a2a, 1) }),
  B('novel_fantasy', 'Basic sword & sorcery.  (A thick paperback, 1 L: green, a sword.)', { ...NOVEL, T: thick(1000), color: 0x2a5a3a, title: 0xd8b84a, motif: shape(0xd0d8e0, [[.48, .12, .04, .4], [.4, .44, .2, .03]]) }),
  B('novel_thriller', 'A suspenseful tale of betrayal and revenge.  (Paperback: black and red.)', { ...NOVEL, T: thick(662), color: 0x1a1a1e, title: 0xc82a2a, motif: diag(0xc82a2a) }),
  B('novel_horror', 'Maybe not the best reading material considering the situation.  (Paperback: black, a red skull.)', { ...NOVEL, T: thick(662), color: 0x121214, title: 0xb81818, motif: disc(0xd8d0c0, .5, .35, .14) }),
  B('novel_swash', 'An exciting seventeenth century tale of how an enslaved Irish doctor and his comrades-in-chains escape and become heroic pirates.  (Paperback, 750 ml: sea blue, a sail.)', { ...NOVEL, T: thick(750), color: 0x2a5a8a, motif: shape(0xf0e8d0, [[.42, .15, .16, .3]]) }),
  B('novel_sports', 'The dramatic tale of a small-time boxer who gets a rare chance to fight the heavy-weight champion.  (Paperback: red, a glove.)', { ...NOVEL, T: thick(662), color: 0xb82a2a, title: 0xf0f0f0, motif: disc(0x8a1a1a, .5, .35, .13) }),
  B('novel_crime2', 'A story about three people in the fictional city of Los Santos: a gangster, an upper-class man, and a psychopath.  (Paperback: sunset orange, palm.)', { ...NOVEL, T: thick(662), color: 0xe08a3a, title: 0x2a1a3a, motif: shape(0x2a3a1a, [[.48, .15, .03, .35], [.38, .15, .24, .05]]) }),
  B('novel_satire', 'A political satire of the pre-apocalypse world.  (Paperback: white, a cartoon.)', { ...NOVEL, T: thick(662), color: 0xe8e4d8, title: 0x2a4a8a, motif: disc(0xe8a030, .5, .35, .12) }),
  B('novel_spy', 'A tale of intrigue and espionage among Nazis, no, Commies, no, Iraqis!  (Paperback: grey, a silhouette.)', { ...NOVEL, T: thick(662), color: 0x4a4e54, motif: shape(0x1a1a1a, [[.44, .15, .12, .35], [.42, .14, .16, .05]]) }),
  B('novel_adventure', 'The stirring tale of a race against time, in search of a lost city located in the heart of the African continent.  (Paperback: jungle green and gold.)', { ...NOVEL, T: thick(662), color: 0x3a6a2a, title: 0xe8c84a, motif: shape(0xc8a048, [[.38, .3, .24, .1], [.44, .22, .12, .08]]) }),
  B('novel_buddy', 'A gripping tale of two friends struggling to survive on the streets of New York City.  (Paperback, 500 ml: a city skyline.)', { ...NOVEL, T: thick(500), color: 0x3a5a7a, motif: shape(0x1a2a3a, [[.15, .3, .1, .2], [.3, .22, .12, .28], [.48, .26, .1, .24], [.65, .2, .14, .3]]) }),
  B('novel_romance', 'Drama and mild smut.  (Paperback: pink, a heart.)', { ...NOVEL, T: thick(662), color: 0xe08aa8, title: 0xf8f0f0, motif: disc(0xc82a4a, .5, .35, .12) }),
  B('novel_western', 'The classic tale of a gunfighting stranger who comes to a small settlement.  (Paperback: dusty tan, a hat.)', { ...NOVEL, T: thick(662), color: 0xc8a068, title: 0x5a2a1a, motif: shape(0x4a2a1a, [[.36, .3, .28, .04], [.44, .2, .12, .1]]) }),
  B('novel_scifi', 'Aliens, ray guns, and space ships.  (Paperback: deep purple, stars and a planet.)', { ...NOVEL, T: thick(662), color: 0x2a1a4a, title: 0x8ad8e8, motif: (c, x, y, w, h) => { stars(0xf0f0f0, 'scifi')(c, x, y, w, h); disc(0xd87a3a, .62, .3, .1)(c, x, y, w, h); } }),
  B('novel_road', 'A tale about a group of friends who wander the USA in the 1960s against a backdrop of jazz, poetry and drug use.  (Paperback, 500 ml: a road.)', { ...NOVEL, T: thick(500), color: 0xd8c08a, title: 0x2a2a2a, motif: shape(0x3a3a3a, [[.4, .12, .2, .45], [.49, .15, .02, .4]]) }),
  B('novel_tragedy', 'The story of two young lovers whose feuding families threaten to keep them apart.  (A thick paperback, 1 L: wine red.)', { ...NOVEL, T: thick(1000), color: 0x6a1a24, title: 0xe8d8b0, motif: disc(0xe8d8b0, .5, .32, .08) }),
  B('poetry_book', 'A collection of poetry by various authors from around the world, including writings by Dickinson, Goethe, Thoreau, and Yeats.  (Hardcover anthology, 500 ml.)', { L: .2, W: .13, T: thick(500, .2, .13), color: 0x3a5a8a, hard: true, title: 0xd8c070 }),
  B('classic_literature', 'A book of classic literature, timeless and enjoyable but a bit dense to read.  (Hardcover, 750 ml: oxblood with gilt.)', { L: .22, W: .15, T: thick(750, .22, .15), color: 0x5a1a1a, hard: true, title: 0xd8b84a, motif: stripes(0xd8b84a, 2) }),
  B('plays_book', 'A collection of plays by various authors from around the world, including scripts by Wilde, Beckett, Checkov, and Shakespeare.  (Hardcover, 750 ml.)', { L: .22, W: .15, T: thick(750, .22, .15), color: 0x2a3a2a, hard: true, title: 0xd8b84a, motif: disc(0xd8b84a, .5, .35, .1) }),
  B('essay_book', 'A collection of essays by various authors from around the world, including works by Churchill, Mailer, Eco, and Voltaire.  (Hardcover, 750 ml.)', { L: .22, W: .15, T: thick(750, .22, .15), color: 0x1a2a4a, hard: true, title: 0xe8e0c8 }),
  { id: 'book_binder', desc: 'A book binder.  With a pen and some paper you could copy some recipes from books into it.  (A grey ring binder.)', build: (p) => {
    book(p, { L: .3, W: .27, T: .045, color: 0x8a8e94, hard: true, title: 0xf0f0f0 });
    for (const x of [-.08, 0, .08]) cyl(p, `ring${x}`, 'z', [x, .0225, .128], .012, .006, 8, steelP(), STEEL);
  } },
  { id: 'book_ruined', desc: 'A ruined book.  Someone has thoroughly ruined this book by ripping pages out and covering the remainder in… is that paint?  (1.5 L: a torn hardcover splashed with paint.)', build: (p) => {
    book(p, { L: .23, W: .16, T: .035, color: 0x5a4a3a, hard: true, title: 0x8a7a6a, motif: (c, x, y, w, h) => { disc(0xc83a2a, .3, .6, .2)(c, x, y, w, h); disc(0x3a8a3a, .7, .3, .15)(c, x, y, w, h); } });
    const r = rng('torn');
    for (let k = 0; k < 3; k++) { const g = p.group(`torn${k}`, { at: [.12 + r() * .05, .002 + k * .002, (r() - .5) * .12], rotY: r() * 3 }); sheet(p, `torn${k}`, .09, .07, .001, paperP(), { parent: g }); }
  } },
  { id: 'book_pieces', desc: 'Scraps of paper that used to be part of a book.  Completely useless now.  (Torn printed pages in a heap.)', build: (p) => {
    const r = rng('pieces');
    for (let k = 0; k < 7; k++) { const g = p.group(`page${k}`, { at: [(r() - .5) * .1, .001 + k * .0015, (r() - .5) * .08], rotY: r() * 6, rotX: (r() - .5) * .2 }); sheet(p, `page${k}`, .07 + r() * .05, .05 + r() * .05, .001, printP(), { parent: g }); }
  } },
  // Clothes ------------------------------------------------------------------------------------
  F('undershirt', 'A simple white undershirt.  Worn beneath your regular clothes, it provides a little extra warmth.  (Folded.)', { color: 0xf0eee8, w: .27, d: .22, h: .02, collar: 0xe0ded8 }),
  F('tshirt', 'A short-sleeved cotton shirt.  (Folded: white.)', { color: 0xeeeeea, w: .3, d: .24, h: .028, collar: 0xdcdcd6 }),
  F('long_undertop', 'A long underwear top that helps to maintain body temperature.  (Folded, waffle knit, light grey.)', { color: 0xc8c8c4, knit: true, w: .3, d: .24, h: .028, collar: 0xb8b8b4 }),
  F('long_underpants', 'A pair of long underwear that help to maintain body temperature.  (Folded, waffle knit, light grey.)', { color: 0xc8c8c4, knit: true, w: .3, d: .2, h: .026, waist: 0xb0b0ac, legs: true }),
  F('longshirt', 'A long-sleeved cotton shirt.  (Folded: blue, collar and buttons.)', { color: 0x3a5a9a, w: .3, d: .25, h: .032, collar: 0x2e4a84, buttons: 4 }),
  F('dress_shirt', 'A button-down shirt with long sleeves and a pocket on the front.  Looks professional!  (Folded: white, collar, buttons, pocket.)', { color: 0xf2f2f0, w: .3, d: .25, h: .032, collar: 0xe4e4e2, buttons: 4, pocket: 0xe8e8e6 }),
  F('polo_shirt', 'A short-sleeved cotton shirt, slightly thicker than a t-shirt.  (Folded: light red polo, collar, two buttons.)', { color: 0xd86060, w: .3, d: .25, h: .034, collar: 0xc85050, buttons: 2 }),
  F('jersey', 'A lightweight, breathable shirt made from synthetic fabric, designed for athletic performance and team identification.  (Folded: team colours, a stripe.)', { color: 0x2a6ac8, w: .3, d: .25, h: .022, collar: 0xf0f0f0, stripe: 0xf0f0f0 }),
  F('sweatshirt', 'A thick cotton shirt.  (3.5 L: a thick folded light red sweatshirt.)', { color: 0xd87070, knit: true, w: .34, d: .28, h: .06, collar: 0xc86060 }),
  F('sweater', 'A warm wool sweater.  (Folded, blue knit.)', { color: 0x3a5a8a, knit: true, w: .32, d: .27, h: .055, collar: 0x2e4a74 }),
  { id: 'hoodie', desc: 'A sweatshirt with a hood and a "kangaroo pocket" in the front for storage.  (Folded: dark grey, the hood on top, white drawstrings.)', build: (p) => {
    folded(p, { color: 0x4a4c50, paint: knitP(0x4a4c50), w: .34, d: .28, h: .065, hood: true, pocket: 0x3e4044 });
    for (const s of [-1, 1]) tube(p, `string${s}`, V(s * .02, .07, -.07), V(s * .03, .067, .0), .0025, .0025, 4, flat(0xeeeeea));
  } },
  F('jeans', 'A pair of jeans with two deep pockets.  (Folded denim.)', { color: 0x4a6a9a, denim: true, w: .34, d: .27, h: .05, waist: 0x3e5a86, legs: true, pocket: 0x3e5a86 }),
  F('pants', 'A pair of khaki pants.  Slightly warmer than jeans.  (Folded khaki.)', { color: 0xb09a70, w: .34, d: .27, h: .045, waist: 0x9a8660, legs: true }),
  F('shorts', 'A pair of khaki shorts.  (Folded.)', { color: 0xb09a70, w: .28, d: .23, h: .035, waist: 0x9a8660, legs: true }),
  { id: 'shorts_cargo', desc: 'A pair of shorts lined with pockets, offering decent storage.  (Folded, flapped cargo pockets on the legs.)', build: (p) => {
    folded(p, { color: 0x8a8a7a, paint: clothP(0x8a8a7a), w: .3, d: .25, h: .042, waist: 0x7a7a6a, legs: true, pocket: 0x7a7a6a });
    for (const x of [-.1, .07]) { bevel(p, `cargo${x}`, [x, .042, .02, x + .07, .042 + .006, .09], .002, clothP(0x7e7e6e)); bevel(p, `flap${x}`, [x - .003, .042 + .006, .015, x + .073, .042 + .009, .035], .001, flat(0x6e6e5e)); }
  } },
  F('b_shorts', 'A pair of basketball shorts.  Comfortable and light.  (Folded: cyan with a side stripe.)', { color: 0x2aa8b8, w: .3, d: .25, h: .028, waist: 0x1a8898, stripe: 0xf0f0f0 }),
  F('briefs', 'A pair of briefs.  Comfortable underwear worn by men.  (Folded white.)', { color: 0xf0f0ee, w: .18, d: .15, h: .014, waist: 0xd8d8d6 }),
  F('under_armor_shorts', 'Nylon sportswear that clings to your upper legs, aiding muscle tone and wicking away sweat.  (Folded, dark grey.)', { color: 0x3a3c40, w: .22, d: .18, h: .014, waist: 0x2a2c30 }),
  F('towel', 'A large, fluffy towel.  It could be used to dry yourself.  (Folded: cyan with stripes.)', { color: 0x3ab0c0, knit: true, w: .35, d: .25, h: .06, stripe: 0xf0f0f0 }),
  F('dish_towel', 'A dish towel, useful for cleaning hard surfaces.  (Folded: white with a red stripe.)', { color: 0xf0eee8, w: .22, d: .2, h: .01, stripe: 0xc83a3a }),
  F('pillowcase', 'A simple cotton pillowcase.  (Folded white.)', { color: 0xf2f0ec, w: .4, d: .3, h: .012 }),
  { id: 'sheet_cotton', desc: 'A 12-inch by 24-inch sheet of cotton fabric, suitable for making clothing.  (30 × 60 cm, lying flat, dark grey.)', build: (p) => { sheet(p, 'sheet', .3, .6, .003, clothP(0x55575c)); } },
  { id: 'outfit_storage', desc: 'A bundle of presses, coat hangars, and other miscellaneous items needed to store and keep a good change of clothes.  (Longest side 150 cm in CDDA: a zipped garment bag on its hangers.)', build: (p) => {
    bevel(p, 'bag', [-.72, 0, -.27, .72, .06, .27], .03, clothP(0x3a3c40));
    bevel(p, 'zip', [-.7, .06, -.006, .62, .064, .006], .002, steelP(0x8a8e92), STEEL);
    for (const z of [-.06, .06]) {
      tube(p, `hookstem${z}`, V(.7, .04, z), V(.8, .04, z), .004, .004, 5, steelP(), STEEL);
      tube(p, `hookcurve${z}`, V(.8, .04, z), V(.84, .04, z + .03), .004, .004, 5, steelP(), STEEL);
      tube(p, `hooktip${z}`, V(.84, .04, z + .03), V(.82, .04, z + .05), .004, .004, 5, steelP(), STEEL);
    }
    tube(p, 'bar', V(.66, .062, -.2), V(.66, .062, .2), .006, .006, 5, steelP(0x8a8e92), STEEL);
  } },
  // Pens, sticks, wires --------------------------------------------------------------------------
  { id: 'pen', desc: 'A fine metal pen, of much better quality than a disposable model.  (13 cm, steel, clip.)', build: (p) => {
    cyl(p, 'barrel', 'x', [0, .0055, 0], .0055, .12, 8, steelP(0x9a9ea4), STEEL);
    cyl(p, 'tip', 'x', [.065, .0055, 0], .0055, .012, 8, steelP(), STEEL, .0015);
    bevel(p, 'clip', [-.06, .0095, -.0015, -.025, .0115, .0015], .0005, steelP(), STEEL);
  } },
  ...[['black_pen', 0x1e1e20, 'black'], ['blue_pen', 0x1a3ab0, 'blue']].map(([id, ink, name]) => ({ id, desc: `A disposable ballpoint pen, offers a smooth writing experience on paper.  This one is ${name}.  (13 cm: clear hexagonal barrel, ${name} cap and plug.)`, build: (p) => {
    cyl(p, 'barrel', 'x', [0, .0045, 0], .0045, .11, 6, flat(0xe0e8ec), GLASS);
    cyl(p, 'refill', 'x', [0, .0045, 0], .0015, .1, 6, flat(ink));
    cyl(p, 'cap', 'x', [-.05, .0048, 0], .0048, .03, 6, plasticP(ink));
    cyl(p, 'tip', 'x', [.06, .0045, 0], .0045, .012, 6, flat(0xe0e8ec), GLASS, .0012);
  } })),
  { id: 'pencil', desc: 'A sharpened HB Number 2 graphite pencil, equipped with an eraser.  (13 cm: yellow hexagon, eraser, sharpened.)', build: (p) => {
    cyl(p, 'body', 'x', [0, .0037, 0], .0037, .1, 6, plasticP(0xe8b820));
    cyl(p, 'tip', 'x', [.06, .0037, 0], .0037, .02, 6, woodP(0xd8b080), {}, .0008);
    cyl(p, 'ferrule', 'x', [-.054, .0037, 0], .0039, .008, 8, steelP(0xc0b080), STEEL);
    cyl(p, 'eraser', 'x', [-.063, .0037, 0], .0036, .01, 8, flat(0xe08a90));
  } },
  { id: 'permanent_marker', desc: 'A King Size™ industrial-strength permanent marker, about halfway between a typical marker and a can of spray paint in size.  (15 cm, black, a white label band.)', build: (p) => {
    cyl(p, 'body', 'x', [0, .013, 0], .013, .11, 10, band(0x1e1e20, 0xf0f0f0, .3, .7));
    cyl(p, 'cap', 'x', [.07, .013, 0], .014, .04, 10, plasticP(0x1e1e20));
  } },
  { id: 'chopsticks', desc: 'One of the most popular eating utensils in the world.  (A pair, 23 cm.)', build: (p) => {
    for (const z of [-.008, .008]) tube(p, `stick${z}`, V(-.115, .004, z), V(.115, .003, z * .4), .004, .0018, 6, woodP(0xd8c8a8));
  } },
  { id: 'plastic_straw', desc: 'A plastic straw, for drinking things and littering.  (20 cm, striped.)', build: (p) => {
    cyl(p, 'straw', 'x', [0, .003, 0], .003, .2, 6, layers(flat(0xf0f0f0), (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 6) fill(ctx, x + i, y, 3, h, 0xd83a3a); }));
  } },
  { id: 'nail', desc: 'A pin-shaped piece of steel.  It can be used to construct various things with a hammer.  (Longest side 115 mm: a few loose nails.)', build: (p) => {
    for (const [k, z, a] of [[0, 0, 0], [1, .015, .3], [2, -.014, -.2]]) {
      const g = p.group(`nail${k}`, { at: [0, .003, z], rotY: a });
      cyl(p, `shank${k}`, 'x', [0, 0, 0], .0022, .1, 6, steelP(0xa0a4a8), { parent: g, metal: true }, .0022);
      cyl(p, `point${k}`, 'x', [.0525, 0, 0], .0022, .015, 6, steelP(), { parent: g, metal: true }, .0002);
      cyl(p, `head${k}`, 'x', [-.051, 0, 0], .005, .002, 8, steelP(), { parent: g, metal: true });
    }
  } },
  { id: 'string_36', desc: 'A 3-foot (or about 90 cm) long piece of cotton string.  (A loose coil.)', build: (p) => { coil(p, 'loop', .045, .0015, 3, flat(0xd8d0bc)); } },
  { id: 'string_6', desc: 'A 6-inch (or about 15 cm) long piece of cotton string.  (A short curled piece.)', build: (p) => {
    const pts = [V(-.07, .0015, 0), V(-.03, .0015, .015), V(.01, .0015, -.005), V(.05, .0015, .012), V(.075, .0015, -.004)];
    for (let i = 0; i + 1 < pts.length; i++) tube(p, `seg${i}`, pts[i], pts[i + 1], .0015, .0015, 4, flat(0xd8d0bc));
  } },
  { id: 'hc_wire', desc: 'A length of strong wire made of high carbon steel.  Often used in industrial machinery and springs.  (A tight dark coil.)', build: (p) => { coil(p, 'wire', .05, .002, 4, steelP(0x6a6e72), STEEL); } },
  { id: 'lc_wire', desc: 'A length of thin, relatively stiff wire made of mild steel.  Ubiquitously found in everyday applications such as chain link fences.  (A loose bright coil.)', build: (p) => { coil(p, 'wire', .06, .0015, 3, steelP(0xb8bcc0), STEEL); } },
  { id: 'spring', desc: 'A large, heavy-duty spring.  Expands with significant force when compressed.  (750 ml: a coil spring 20 cm long, lying.)', build: (p) => {
    const g = p.group('spring', { at: [0, .05, 0], rotZ: Math.PI / 2 });
    for (let t = 0; t < 8; t++) for (let k = 0; k < 10; k++) {
      const a0 = (k / 10) * 2 * Math.PI, a1 = ((k + 1) / 10) * 2 * Math.PI, y0 = -.1 + (t + k / 10) * .025, y1 = -.1 + (t + (k + 1) / 10) * .025;
      tube(p, `c${t}-${k}`, V(Math.cos(a0) * .045, y0, Math.sin(a0) * .045), V(Math.cos(a1) * .045, y1, Math.sin(a1) * .045), .006, .006, 5, steelP(0x7a7e82), { parent: g, metal: true });
    }
  } },
  { id: 'stick', desc: 'A respectable length of wood, just big enough to wrap your hand around.  Relatively straight and makes a decent melee weapon.  (Longest side 130 cm, straight.)', build: (p) => {
    tube(p, 'stick', V(-.65, .021, 0), V(.65, .019, .008), .021, .018, 7, barkP(0x6a4a2e));
    cyl(p, 'end', 'x', [.651, .019, .008], .015, .002, 7, woodP(0xb08a5a));
  } },
  { id: 'pine_bough', desc: 'A branch from a pine tree, oozing sticky sap and bristling with prickly needles.  (A 40 cm branch with needle tufts.)', build: (p) => {
    tube(p, 'branch', V(-.2, .015, 0), V(.2, .012, .02), .009, .005, 6, barkP(0x5a3e28));
    const r = rng('bough');
    const needles = layers(flat(0x2e5a2a), (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 2) fill(ctx, x + i, y, 1, h, 0x3e7a36); });
    for (let k = 0; k < 14; k++) for (const a of [-1.1, -.5, .5, 1.1]) {
      const x = -.18 + k * .027, g = p.group(`spray${k}${a}`, { at: [x, .012 + Math.abs(a) * .002, .006 * k * .15], rotY: a + (r() - .5) * .3, rotZ: (r() - .5) * .3 });
      hull(p, `spray${k}${a}`, [V(0, 0, -.005), V(0, 0, .005), V(.045, 0, -.009), V(.045, 0, .009), V(.06, 0, 0), V(0, .008, 0), V(.045, .006, 0)], needles, { parent: g });
    }
  } },
  // Wood, stone, metal -----------------------------------------------------------------------
  { id: 'wood_block', desc: 'A small 2x2x5 inches block of wood, primarily used for carving out small wooden objects.  (5 × 5 × 13 cm.)', build: (p) => { bevel(p, 'block', [-.065, 0, -.025, .065, .05, .025], .003, woodP(0xc09a68)); } },
  { id: '2x4', desc: 'A flat, thick plank of wood, like a 2 by 4 or similar piece of dimensional lumber.  (Longest side 122 cm: 122 × 8.9 × 3.8 cm.)', build: (p) => {
    bevel(p, 'plank', [-.61, 0, -.0445, .61, .038, .0445], .002, woodP(0xd0b080));
    for (const x of [-.3, .25]) cyl(p, `knot${x}`, 'y', [x, .0381, .01], .008, .0005, 8, flat(0x8a6a40));
  } },
  { id: 'rock_flaking', desc: 'A rock the size of a baseball which chips in a semi-predictable way if struck, leaving a sharp edge.  (8 cm flint: dark, conchoidal facets.)', build: (p) => { lump(p, 'flint', [.042, .028, .034], stoneP(0x4a4e54), 'flint'); } },
  { id: 'rock_large', desc: 'A large, heavy rock, big enough to be used as a primitive anvil or shaped into larger stone items.  (Longest side 30 cm, 6 L.)', build: (p) => { lump(p, 'rock', [.15, .07, .12], stoneP(0x8a7a62), 'rocklarge'); } },
  { id: 'ceramic_shard', desc: 'A broken ceramic shard.  It is relatively heavy for its size and has a somewhat sharp edge, but it\'s too irregular to cut properly.  (8 cm: a curved, jagged piece of a glazed white plate with its blue rim.)', build: (p) => {
    const outline = [[-.04, -.012], [-.018, -.03], [.012, -.022], [.04, -.03], [.034, .004], [.018, .03], [-.012, .018], [-.036, .026]];
    // A thin flat piece (a hull would fill a curved one solid), lying a little tilted on its rim.
    const g = p.group('shard', { at: [0, .004, 0], rotX: .12 });
    hull(p, 'shard', outline.flatMap(([x, z]) => [V(x, 0, z), V(x, .0045, z)]), flat(0xf2f2ee), { parent: g });
    hull(p, 'rim', [[-.036, .026], [-.012, .018], [.018, .03], [-.012, .012]].flatMap(([x, z]) => [V(x, .0045, z), V(x, .0058, z)]), flat(0x3a5aa8), { parent: g });
  } },
  { id: 'sheet_metal_small', desc: 'A small sheet of mild steel.  (Longest side 20 cm.)', build: (p) => { sheet(p, 'sheet', .2, .14, .002, steelP(0xa8b0b8), STEEL); } },
  { id: 'lc_steel_chunk', desc: 'A misshapen chunk of mild steel.  Makes a decent weapon in a pinch, and is also useful for some crafting recipes.  (62 ml.)', build: (p) => { lump(p, 'chunk', [.03, .015, .022], steelP(0x8a8e92), 'lcchunk', STEEL); } },
  { id: 'scrap_aluminum', desc: 'A handful of small pieces of aluminum, usable for crafting or repairs.  (Bright bent offcuts.)', build: (p) => {
    const r = rng('alu');
    for (let k = 0; k < 5; k++) { const g = p.group(`bit${k}`, { at: [(r() - .5) * .07, .001 + k * .003, (r() - .5) * .05], rotY: r() * 3, rotZ: (r() - .5) * .5 }); sheet(p, `bit${k}`, .02 + r() * .02, .012 + r() * .015, .0015, steelP(0xd8dce0), { parent: g, metal: true }); }
  } },
  { id: 'wooden_bead', desc: 'A wooden bead.  It can be used to craft inscribable jewelry or create a beaded curtain door.  (A few 12 mm beads.)', build: (p) => {
    for (const [k, x, z] of [[0, 0, 0], [1, .016, .006], [2, -.012, .012]]) { blob(p, `bead${k}`, [.006, .005, .006], [x, .005, z], woodP(0xa87a4a)); cyl(p, `hole${k}`, 'y', [x, .0101, z], .0018, .0005, 6, flat(0x3a2a1a)); }
  } },
  // Natural ----------------------------------------------------------------------------------
  { id: 'seed_wheat', desc: 'A pile of dry wheatberries, designated for planting.  (250 ml: a heap of golden grains.)', build: (p) => {
    pile(p, 'heap', .07, .035, layers(flat(0xb88a40), (ctx, x, y, w, h) => { for (let j = 0; j < h; j += 2) for (let i = (j / 2) % 2 ? 1 : 0; i < w; i += 3) fill(ctx, x + i, y + j, 2, 1, 0xd0a458); }), 'wheat');
  } },
  { id: 'acorns', desc: 'A handful of acorns, still in their shells.  (A handful of capped acorns.)', build: (p) => {
    const r = rng('acorn');
    for (let k = 0; k < 6; k++) {
      const x = (r() - .5) * .07, z = (r() - .5) * .06, g = p.group(`acorn${k}`, { at: [x, .009, z], rotZ: Math.PI / 2 + (r() - .5) * .6, rotY: r() * 6 });
      blob(p, `nut${k}`, [.009, .013, .009], [0, -.003, 0], speckle('acorn', 0x9a6a2a, [0xa87a3a], .2), { parent: g });
      blob(p, `cap${k}`, [.01, .006, .01], [0, .008, 0], speckle('cap', 0x6a4a2a, [0x5a3a1a, 0x7a5a3a], .6), { parent: g });
    }
  } },
  { id: 'hickory_nut', desc: 'A handful of hard nuts from a hickory tree, still in their shells.  (A handful of pale ridged nuts.)', build: (p) => {
    const r = rng('hickory');
    for (let k = 0; k < 6; k++) blob(p, `nut${k}`, [.014, .012, .012], [(r() - .5) * .07, .012, (r() - .5) * .06], speckle('hickory', 0xb89a70, [0x9a7a54, 0xc8aa80], .45));
  } },
  { id: 'juniper', desc: 'A handful of female juniper cones, for making gin and adding earthy flavors to food.  (A handful of dusty blue berries.)', build: (p) => {
    const r = rng('juniper');
    for (let k = 0; k < 12; k++) blob(p, `berry${k}`, [.004, .004, .004], [(r() - .5) * .05, .004 + (r() < .3 ? .005 : 0), (r() - .5) * .045], speckle('juniper', 0x4a6a9a, [0x7a8ab0, 0x3a5a8a], .4), {}, 3, 6);
  } },
  { id: 'pinecone', desc: 'A spiny pod from a pine tree.  (A 9 cm cone of scales, lying.)', build: (p) => {
    const g = p.group('cone', { at: [0, .025, 0], rotZ: Math.PI / 2 });
    for (let k = 0; k < 6; k++) { const y = -.035 + k * .014, r = .022 * Math.sin(((k + .5) / 6) * Math.PI) + .006; cyl(p, `tier${k}`, 'y', [0, y, 0], r, .012, 8, layers(flat(0x7a4e2a), (ctx, x, yy, w, h) => { for (let i = 0; i < w; i += 3) fill(ctx, x + i, yy, 1, h, 0x4a2e18); }), { parent: g }, r * .7); }
  } },
  { id: 'potato', desc: 'A potato, mildly toxic and not very tasty raw.  Delicious and filling when properly cooked.  (232 ml.)', build: (p) => { blob(p, 'potato', [.045, .026, .033], [0, .026, 0], layers(speckle('potato', 0xb08a5a, [0xa07a4a, 0xc09a6a], .4), (ctx, x, y, w, h) => { const r = rng(`eyes${w}`); for (let k = 0; k < 4; k++) fill(ctx, x + Math.round(r() * w), y + Math.round(r() * h), 1, 1, 0x5a3a1a); }), {}, 4, 9); lump(p, 'knob', [.014, .012, .014], speckle('potato', 0xb08a5a, [0xa07a4a], .4), 'knob', {}, [.03, .018, .01]); } },
  { id: 'onion', desc: 'An aromatic onion used in cooking.  Cutting these up can make your eyes sting!  (A white onion, 7 cm.)', build: (p) => {
    blob(p, 'bulb', [.035, .03, .035], [0, .03, 0], layers(flat(0xece2c8), (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 4) fill(ctx, x + i, y, 1, h, 0xd8c8a0); }));
    cyl(p, 'tip', 'y', [0, .066, 0], .008, .014, 6, flat(0xc8b080), {}, .002);
    cyl(p, 'root', 'y', [0, .003, 0], .01, .004, 6, flat(0x8a7a5a));
  } },
  { id: 'cig_butt', desc: 'What was once a wonderfully addictive tube of dried tobacco leaf is now just a smelly piece of trash.  (A 3 cm butt: orange filter, crushed ash end.)', build: (p) => {
    cyl(p, 'filter', 'x', [-.007, .004, 0], .004, .015, 8, speckle('filter', 0xd8963a, [0xe0a04a, 0xc8862a], .5));
    cyl(p, 'paper', 'x', [.01, .0038, 0], .0038, .018, 8, band(0xf0ece4, 0x3a3a3a, .0, .2), {}, .0035);
  } },
  { id: 'feces_bird', desc: 'Bird droppings, feathers, and soiled bits of rubbish.  (White-streaked droppings and a grey feather.)', build: (p) => {
    const r = rng('birdpoo');
    for (let k = 0; k < 4; k++) blob(p, `drop${k}`, [.01, .004, .008], [(r() - .5) * .06, .003, (r() - .5) * .05], speckle('poo', 0xe8e4d8, [0x7a6a4a, 0xc8c0b0], .5), {}, 2, 7);
    pane(p, 'feather', [V(-.03, .003, .02), V(.03, .003, .03), V(.035, .003, .036), V(-.025, .003, .03)], .001, flat(0x8a8a90));
  } },
  { id: 'material_soil', desc: 'A pile of loosely-packed, slightly damp loamy soil.  (5 L: a dark heap 30 cm across.)', build: (p) => { pile(p, 'heap', .15, .08, speckle('soil', 0x4a3424, [0x5a4030, 0x3a281a, 0x6a5038], .6), 'soil'); } },
  { id: 'sugar', desc: 'Sweet, sweet sugar.  Bad for your teeth and surprisingly not very tasty on its own.  (A small white heap.)', build: (p) => { pile(p, 'heap', .04, .018, speckle('sugar', 0xf4f2ec, [0xffffff, 0xdcdad4], .5), 'sugar'); } },
  { id: 'water', desc: 'Water, the stuff of life.  (Spilt: a shallow puddle.)', build: (p) => { crumple(p, 'puddle', .14, .1, .003, flat(0x6a9ab8), 'puddle', GLASS); } },
  // Bags, paper, sheets ----------------------------------------------------------------------
  { id: 'bag_garbage', desc: 'A hefty plastic bag, made to carry lots of trash.  It\'s sturdy and water-resistant.  (Empty, crumpled black bag with tie.)', build: (p) => {
    crumple(p, 'bag', .22, .15, .03, plasticP(0x1e1e22), 'garbage');
    tube(p, 'tie', V(.2, .006, -.02), V(.24, .004, -.005), .008, .005, 5, plasticP(0x1e1e22));
  } },
  { id: 'plastic_shopping_bag', desc: 'A bag used to carry groceries home.  (A white bag, its handles at one end, a printed smile.)', build: (p) => {
    crumple(p, 'bag', .16, .12, .03, layers(flat(0xf0f0ee), (ctx, x, y, w, h) => fill(ctx, x + Math.round(w * .4), y + Math.round(h * .5), Math.round(w * .2), 1, 0xc83a3a)), 'shopping');
    for (const s of [-1, 1]) tube(p, `handle${s}`, V(.14, .005, s * .04), V(.22, .004, s * .03), .005, .005, 4, flat(0xe8e8e6));
    tube(p, 'loop', V(.22, .004, -.03), V(.22, .004, .03), .005, .005, 4, flat(0xe8e8e6));
  } },
  { id: 'bag_zipper_gallon', desc: 'A resealable, watertight transparent plastic bag, extra-large size.  (Gallon size: 27 × 28 cm, clear, the seal strip.)', build: (p) => {
    sheet(p, 'bag', .27, .26, .006, flat(0xe4eef2), GLASS);
    bevel(p, 'seal', [-.135, 0, .124, .135, .007, .14], .002, band(0x3a6ad0, 0xd8e4f8, .45, .55));
  } },
  { id: 'shrink_wrap', desc: 'Polymer plastic material, that shrinks tightly over whatever it is covering.  Disposable.  (Used: balled up into a clear wad.)', build: (p) => { lump(p, 'wad', [.045, .03, .04], flat(0xe8f0f2), 'shrink', GLASS); } },
  { id: 'plastic_sheet_small', desc: 'A small sheet of flexible plastic, like a cut-up garbage bag.  (A flat piece, 25 cm.)', build: (p) => { crumple(p, 'sheet', .12, .1, .006, plasticP(0x2a2a2e), 'plsheet'); } },
  { id: 'wrapper', desc: 'Just a piece of butcher\'s paper.  Good for starting fires.  (A crumpled sheet.)', build: (p) => { crumple(p, 'paper', .1, .08, .02, paperP(0xe8dcc0), 'wrapper'); } },
  { id: 'wrapper_foil', desc: 'A piece of aluminum foil, large enough to wrap around something.  (A crumpled, shiny sheet.)', build: (p) => { crumple(p, 'foil', .09, .07, .018, steelP(0xd8dce0), 'foil', STEEL); } },
  { id: 'cup_foil', desc: 'An improvised foldable cup made from aluminum foil.  (A shallow crimped foil cup, open.)', build: (p) => {
    // Double-sided (the cut-out material), so the crimped wall shows from inside and out.
    cyl(p, 'wall', 'y', [0, .017, 0], .026, .034, 14, layers(steelP(0xd0d4d8), (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 3) fill(ctx, x + i, y, 1, h, 0xa8acb0); }), { cutout: true, open: true }, .036);
    cyl(p, 'bottom', 'y', [0, .001, 0], .026, .002, 14, steelP(0xc0c4c8), STEEL);
  } },
  { id: 'paper', desc: 'A piece of paper.  Can be used to start fires.  (Longest side 297 mm: an A4 sheet.)', build: (p) => { sheet(p, 'paper', .297, .21, .0008, paperP()); } },
  { id: 'flyer', desc: 'A scrap of paper.  (A small torn printed scrap.)', build: (p) => { sheet(p, 'scrap', .1, .07, .0008, printP()); } },
  { id: 'flyer_evac', desc: 'A FEMA-issued flyer as to potential evacuations that\'ll occur and what to do when it starts.  (A letter-size flyer, blue header.)', build: (p) => { sheet(p, 'flyer', .28, .215, .0008, layers(printP(0xf4f4f0, 0x5a5a5a), (ctx, x, y, w, h) => fill(ctx, x, y, w, Math.round(h * .18), 0x1a3a7a))); } },
  { id: 'cardboard', desc: 'A piece of cardboard.  (A flat corrugated piece, 30 × 25 cm.)', build: (p) => { sheet(p, 'card', .3, .25, .004, layers(speckle('cb', 0xb08a58, [0xa07c4c], .3), (ctx, x, y, w, h) => { for (let i = 1; i < w; i += 4) fill(ctx, x + i, y, 1, h, 0xa47e50); })); } },
  { id: 'box_snack', desc: 'A small cardboard box for housing snacks.  Sized so you can take it on the go.  (Longest side 12 cm, 550 ml.)', build: (p) => {
    qbox(p, 'box', [-.06, 0, -.035, .06, .13, .035], layers(flat(0xe8a020), (ctx, x, y, w, h) => { fill(ctx, x, y + Math.round(h * .3), w, Math.round(h * .25), 0xc82a2a); fill(ctx, x + Math.round(w * .35), y + Math.round(h * .62), Math.round(w * .3), Math.round(h * .2), 0xf0e0b0); }));
  } },
  { id: 'box_paper_small', desc: 'A very small paper box.  (210 ml: 8 × 5 × 5 cm, white.)', build: (p) => { bevel(p, 'box', [-.04, 0, -.025, .04, .052, .025], .0015, paperP(0xf0f0ec)); } },
  { id: 'bag_paper_powder', desc: 'A small but sturdy paper bag.  Rock solid when packed full with powder.  (A folded small white paper bag.)', build: (p) => {
    bevel(p, 'bag', [-.05, 0, -.035, .05, .012, .035], .003, paperP(0xf0ece2));
    bevel(p, 'fold', [.035, .012, -.035, .05, .016, .035], .002, paperP(0xe4e0d6));
  } },
  { id: 'matches', desc: 'A small book of matches with a coarse strike surface on the outside flap for lighting them.  (A blue matchbook, 5 × 4 cm.)', build: (p) => {
    bevel(p, 'book', [-.025, 0, -.02, .025, .006, .02], .001, layers(flat(0x2a4aa8), (ctx, x, y, w, h) => fill(ctx, x + Math.round(w * .8), y, Math.round(w * .2), h, 0x5a4a3a)));
  } },
  // Containers --------------------------------------------------------------------------------
  { id: 'bottle_glass', desc: 'A watertight glass bottle, holds 750 mL of liquid.  (Longest side 29 cm: a green wine bottle, lying.)', build: (p) => {
    const g = p.group('bottle', { at: [0, .038, 0], rotZ: -Math.PI / 2 });
    cyl(p, 'body', 'y', [0, -.04, 0], .037, .2, 12, flat(0x3a7a4a), { ...GLASS, parent: g });
    cyl(p, 'shoulder', 'y', [0, .08, 0], .037, .04, 12, flat(0x3a7a4a), { ...GLASS, parent: g }, .014);
    cyl(p, 'neck', 'y', [0, .125, 0], .014, .05, 10, flat(0x3a7a4a), { ...GLASS, parent: g });
    cyl(p, 'lip', 'y', [0, .148, 0], .016, .006, 10, flat(0x2a5a3a), { parent: g });
  } },
  { id: 'jug_plastic', desc: 'A standard plastic jug used for milk and household cleaning chemicals.  (Longest side 28 cm: a translucent gallon jug, handle and cap.)', build: (p) => {
    bevel(p, 'body', [-.075, 0, -.075, .075, .22, .075], .02, flat(0xe8ecee), GLASS);
    cyl(p, 'neck', 'y', [-.035, .235, -.035], .02, .03, 10, flat(0xe8ecee), GLASS);
    cyl(p, 'cap', 'y', [-.035, .255, -.035], .022, .015, 10, plasticP(0x2a6ad0));
    hull(p, 'handle', [V(.02, .17, .04), V(.06, .17, .065), V(.02, .26, .03), V(.05, .255, .05), V(.03, .17, .03), V(.07, .17, .055)], flat(0xe0e6e8), GLASS);
  } },
  { id: 'jar_glass_sealed', desc: 'A half-liter glass jar with a metal screw top lid, used for canning.  (Longest side 127 mm: clear jar, metal lid.)', build: (p) => {
    cyl(p, 'jar', 'y', [0, .058, 0], .042, .116, 12, flat(0xd8ecf0), GLASS);
    cyl(p, 'lid', 'y', [0, .121, 0], .039, .012, 12, steelP(0xc0a860), STEEL);
  } },
  { id: 'cup_plastic', desc: 'A small, vacuum-formed cup.  (A clear tapered cup.)', build: (p) => { cyl(p, 'cup', 'y', [0, .045, 0], .028, .09, 12, flat(0xe0eef2), { ...GLASS, open: false }, .036); } },
  { id: 'ceramic_mug', desc: 'A small, <color> ceramic coffee cup.  (Longest side 12 cm: a yellow mug with a handle.)', build: (p) => {
    cyl(p, 'mug', 'y', [0, .048, 0], .042, .096, 12, plasticP(0xe8c040));
    cyl(p, 'coffee', 'y', [0, .0965, 0], .036, .001, 12, flat(0x3a2414));
    for (const [k, y0, y1, x0, x1] of [[0, .075, .085, .04, .065], [1, .02, .03, .04, .065], [2, .02, .085, .06, .07]]) bevel(p, `handle${k}`, [x0, y0, -.007, x1, y1, .007], .003, plasticP(0xe8c040));
  } },
  { id: 'condiment_bottle_sealed', desc: 'An inverted plastic bottle for condiments.  Preserves its contents from rot until opened.  (Longest side 22 cm: standing on its cap.)', build: (p) => {
    cyl(p, 'cap', 'y', [0, .012, 0], .022, .024, 10, plasticP(0xf0f0f0));
    cyl(p, 'body', 'y', [0, .12, 0], .032, .19, 10, layers(plasticP(0x8a3a1a), (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * .35), w, Math.round(h * .3), 0xf0e8d0)), {}, .03);
  } },
  { id: 'bottle_plastic_seasoning_small', desc: 'A small plastic bottle, the kind seasoning comes in.  (Longest side 14 cm: a shaker cap.)', build: (p) => {
    cyl(p, 'body', 'y', [0, .055, 0], .025, .11, 10, band(0xf0f0ec, 0xc83a2a, .3, .7));
    cyl(p, 'cap', 'y', [0, .124, 0], .027, .028, 10, layers(plasticP(0xf0f0f0), (ctx, x, y, w, h) => { for (let i = 2; i < w; i += 4) fill(ctx, x + i, y + 2, 1, 1, 0x5a5a5a); }));
  } },
  { id: 'bottle_glass_seasoning_small', desc: 'A small glass bottle, the kind seasoning comes in.  (Longest side 72 mm: clear jar, black cap.)', build: (p) => {
    cyl(p, 'body', 'y', [0, .028, 0], .02, .056, 10, flat(0xdcecf0), GLASS);
    cyl(p, 'spice', 'y', [0, .02, 0], .017, .036, 10, speckle('spice', 0xa84a1a, [0xc85a2a], .5));
    cyl(p, 'cap', 'y', [0, .064, 0], .021, .016, 10, plasticP(0x1e1e20));
  } },
  { id: 'bottle_bathroom', desc: 'A squeezable bottle used to hold various liquid soaps.  (Longest side 18 cm: a flat light cyan bottle, flip cap.)', build: (p) => {
    bevel(p, 'body', [-.035, 0, -.02, .035, .15, .02], .015, band(plasticP(0x7ac8d8), 0xf0f0f0, .35, .6));
    cyl(p, 'cap', 'y', [0, .165, 0], .018, .03, 10, plasticP(0xf0f0f0));
  } },
  { id: 'eyedrops', desc: 'Sterile saline eye drops.  Can be used to treat dry eyes, or to wash out contaminants.  (A tiny white dropper bottle.)', build: (p) => {
    cyl(p, 'body', 'y', [0, .02, 0], .011, .04, 8, band(0xf0f0f0, 0x3a8ad0, .3, .65));
    cyl(p, 'tip', 'y', [0, .048, 0], .009, .016, 8, plasticP(0xf0f0f0), {}, .002);
  } },
  { id: 'can_drink', desc: 'An aluminum can, like what soda comes in.  (A 12 oz can: 12.2 cm, red with a white wave.)', build: (p) => { can(p, { r: .033, h: .122, label: layers(flat(0xc82a2a), (ctx, x, y, w, h) => fill(ctx, x, y + Math.round(h * .45), w, Math.round(h * .12), 0xf0f0f0)), ring: true }); } },
  { id: 'can_food', desc: 'A small tin can, like what tuna comes in.  (Longest side 8 cm: a flat tin, blue label.)', build: (p) => { can(p, { r: .042, h: .04, label: band(0x2a5aa8, 0xf0e0a0, .3, .7) }); } },
  { id: 'can_medium', desc: 'A medium tin can, like what soup comes in.  (Longest side 10 cm: red and white soup label.)', build: (p) => { can(p, { r: .037, h: .1, label: band(0xc82a2a, 0xf0f0ec, .5, 1) }); } },
  { id: 'nanomaterial', desc: 'A steel canister containing carbon, iron, titanium, copper, and other elements in specifically engineered atomic-scale configurations.  (300 ml: a sealed steel canister with a warning band.)', build: (p) => {
    cyl(p, 'can', 'y', [0, .055, 0], .03, .11, 12, band(steelP(0xb8bcc0), 0xd8b020, .4, .55), STEEL);
    cyl(p, 'lid', 'y', [0, .113, 0], .028, .008, 12, steelP(0x8a8e92), STEEL);
  } },
  { id: 'candle', desc: 'A thick wax candle.  It doesn\'t provide very much light, but it can burn for quite a long time.  (Longest side 102 mm: white pillar candle.)', build: (p) => {
    cyl(p, 'wax', 'y', [0, .046, 0], .032, .092, 12, speckle('wax', 0xf0ece0, [0xe8e2d4], .2));
    cyl(p, 'wick', 'y', [0, .097, 0], .0015, .01, 4, flat(0x1a1a1a));
  } },
  // Tools and utensils ---------------------------------------------------------------------------
  ...[['plastic_knife', 'A plastic butter knife.  It\'s actually a bit sharper than its metal counterpart, but that doesn\'t make it any more effective as a weapon.', 'knife'], ['plastic_spoon', 'A plastic disposable spoon.  Easier to bend than the metal variety.', 'spoon'], ['plastic_fork', 'A plastic disposable fork.  Great for picnic lunches in the post-apocalyptic wasteland.', 'fork']].map(([id, desc, kind]) => ({ id, desc: `${desc}  (Longest side 15 cm, white plastic.)`, build: (p) => {
    const pl = plasticP(0xf0f0ec);
    flatHandle(p, 'handle', -.075, .02, .005, .006, .003, pl);
    if (kind === 'knife') hull(p, 'blade', [V(.02, 0, -.005), V(.02, 0, .006), V(.075, 0, -.004), V(.073, 0, .007), V(.02, .002, -.005), V(.02, .002, .006), V(.075, .002, -.004), V(.073, .002, .007)], pl);
    if (kind === 'spoon') { const pts = []; for (let k = 0; k < 10; k++) { const a = (k / 10) * 2 * Math.PI; pts.push(V(.048 + Math.cos(a) * .026, .009, Math.sin(a) * .017), V(.048 + Math.cos(a) * .015, 0, Math.sin(a) * .009)); } hull(p, 'bowl', pts, pl); }
    if (kind === 'fork') { flatHandle(p, 'head', .02, .045, .006, .011, .003, pl); for (let k = 0; k < 4; k++) { const z = -.009 + k * .006; bevel(p, `tine${k}`, [.045, 0, z - .0014, .075, .0028, z + .0014], .0005, pl); } }
  } })),
  { id: 'plastic_spoon_kids', desc: 'A plastic spoon designed for use by children.  (A short, chunky spoon in bright colours.)', build: (p) => {
    flatHandle(p, 'handle', -.06, .015, .008, .007, .006, plasticP(0x3ab0e0));
    const pts = []; for (let k = 0; k < 10; k++) { const a = (k / 10) * 2 * Math.PI; pts.push(V(.04 + Math.cos(a) * .022, .01, Math.sin(a) * .015), V(.04 + Math.cos(a) * .012, 0, Math.sin(a) * .008)); }
    hull(p, 'bowl', pts, plasticP(0xe8c040));
  } },
  { id: 'scissors', desc: 'A long pair of heavy-duty scissors.  You can use them to cut things such as fabric or plastic apart.  (Longest side 18 cm: crossed steel blades, red finger loops.)', build: (p) => {
    for (const [k, a] of [[0, .07], [1, -.07]]) {
      const g = p.group(`half${k}`, { at: [0, .003 + k * .003, 0], rotY: a });
      hull(p, `blade${k}`, [V(0, 0, -.005), V(0, 0, .005), V(.1, 0, 0), V(0, .002, -.005), V(0, .002, .005), V(.1, .002, 0)], steelP(), { parent: g, metal: true });
      bevel(p, `shank${k}`, [-.035, 0, -.004, 0, .003, .004], .001, plasticP(0xc83a3a), { parent: g });
      loop(p, `loop${k}`, [-.06, .002, (k ? 1 : -1) * .024], .018, .004, plasticP(0xc83a3a), { parent: g });
    }
    cyl(p, 'pivot', 'y', [0, .005, 0], .004, .01, 6, steelP(), STEEL);
  } },
  { id: 'bottle_opener', desc: 'A simple lever for popping open bottles.  (Longest side 18 cm, flat steel.)', build: (p) => {
    flatHandle(p, 'handle', -.09, .05, .012, .016, .003, steelP(), STEEL);
    hull(p, 'head', [V(.05, 0, -.02), V(.05, 0, .02), V(.09, 0, -.016), V(.09, 0, .012), V(.05, .003, -.02), V(.05, .003, .02), V(.09, .003, -.016), V(.09, .003, .012)], steelP(), STEEL);
    pane(p, 'hole', [V(.06, .0032, -.008), V(.078, .0032, -.008), V(.078, .0032, .006), V(.06, .0032, .006)], .0004, flat(0x2a2a2a));
  } },
  { id: 'corkscrew', desc: 'Many a pleasant date has been ruined by forgetting this important tool.  (Longest side 23 cm: a winged corkscrew, lying.)', build: (p) => {
    cyl(p, 'body', 'x', [0, .018, 0], .018, .12, 10, steelP(0xc8ccd0), STEEL);
    for (const s of [-1, 1]) hull(p, `wing${s}`, [V(-.06, .012, s * .015), V(-.02, .012, s * .015), V(-.08, .012, s * .075), V(-.06, .012, s * .08), V(-.06, .024, s * .015), V(-.02, .024, s * .015), V(-.08, .024, s * .075)], steelP(), STEEL);
    for (let k = 0; k < 5; k++) tube(p, `worm${k}`, V(.06 + k * .012, .018 + (k % 2 ? .006 : -.006), 0), V(.072 + k * .012, .018 + (k % 2 ? -.006 : .006), 0), .002, .002, 4, steelP(), STEEL);
  } },
  { id: 'peeler', desc: 'A simple tool for peeling the outer skin off fruits and veggies without stabbing yourself.  (Longest side 19 cm: black handle, steel blade.)', build: (p) => {
    flatHandle(p, 'handle', -.095, .02, .011, .012, .012, plasticP(0x2a2a2c));
    bevel(p, 'blade', [.02, .002, -.006, .095, .006, .006], .002, steelP(), STEEL);
  } },
  { id: 'knife_large', desc: 'A large kitchen knife (CDDA: large kitchen knife; longest side 30 cm): a broad chef\'s blade and a black riveted handle.', build: (p) => {
    flatHandle(p, 'handle', -.15, -.03, .011, .012, .014, plasticP(0x1e1e20));
    for (const x of [-.13, -.09, -.05]) cyl(p, `rivet${x}`, 'y', [x, .014, 0], .0022, .001, 6, steelP(), STEEL);
    hull(p, 'blade', [V(-.03, 0, -.014), V(-.03, 0, .024), V(.11, 0, .016), V(.15, 0, -.006), V(-.03, .003, -.014), V(-.03, .003, .024), V(.11, .003, .016), V(.15, .003, -.006)], layers(steelP(0xd4d8dc), (ctx, x, y, w) => fill(ctx, x, y, w, 1, 0xf0f4f8)), STEEL);
  } },
  { id: 'hammer', desc: 'A demagnetized steel claw hammer with a wooden grip.  (Longest side 25 cm, lying.)', build: (p) => {
    bevel(p, 'grip', [-.13, 0, -.013, .08, .022, .013], .008, woodP(0xb08850));
    bevel(p, 'head', [.08, 0, -.05, .11, .03, .03], .003, steelP(0x6a6e72), STEEL);
    hull(p, 'claw', [V(.08, .003, -.05), V(.11, .003, -.05), V(.09, .005, -.1), V(.1, .005, -.1), V(.08, .027, -.05), V(.11, .027, -.05)], steelP(0x6a6e72), STEEL);
    cyl(p, 'face', 'z', [.095, .015, .04], .014, .02, 8, steelP(0x8a8e92), STEEL);
  } },
  { id: 'brush', desc: 'A simple scrub brush for cleaning hard objects.  (Longest side 14 cm: a wooden back, stiff bristles.)', build: (p) => {
    bevel(p, 'back', [-.07, .02, -.03, .07, .04, .03], .006, woodP(0xc09a68));
    bevel(p, 'bristles', [-.065, 0, -.026, .065, .022, .026], .002, layers(flat(0xd8c8a0), (ctx, x, y, w, h) => { for (let i = 0; i < w; i += 2) fill(ctx, x + i, y, 1, h, 0xb8a880); }));
  } },
  { id: 'sponge', desc: 'A cleaning aid made of soft, porous material.  (A yellow sponge with a green scrub layer.)', build: (p) => {
    bevel(p, 'sponge', [-.05, 0, -.035, .05, .025, .035], .005, layers(flat(0xe8d040), (ctx, x, y, w, h) => { const r = rng(`pores${w}${h}`); for (let k = 0; k < w * h / 12; k++) fill(ctx, x + Math.round(r() * w), y + Math.round(r() * h), 1, 1, 0xc0a828); }));
    bevel(p, 'scrub', [-.05, .025, -.035, .05, .033, .035], .002, speckle('scrub', 0x2a7a3a, [0x3a8a4a, 0x1a6a2a], .5));
  } },
  { id: 'soap', desc: 'A cleansing agent shaped into a bar.  (A white bar, 9 × 6 cm.)', build: (p) => { bevel(p, 'bar', [-.045, 0, -.03, .045, .024, .03], .01, layers(flat(0xf0eee8), (ctx, x, y, w, h) => fill(ctx, x + Math.round(w * .3), y + Math.round(h * .45), Math.round(w * .4), 1, 0xc8c4bc))); } },
  { id: 'battery_charger', desc: 'A small device for recharging batteries, given a source of electricity.  (A light blue charger with battery bays and a cord.)', build: (p) => {
    bevel(p, 'body', [-.06, 0, -.04, .06, .03, .04], .006, plasticP(0x7aa8d0));
    for (const z of [-.02, .005]) bevel(p, `bay${z}`, [-.045, .029, z, .045, .031, z + .015], .001, flat(0x2a2a2c));
    tube(p, 'cord', V(.06, .01, 0), V(.16, .005, .04), .003, .003, 5, flat(0x1e1e20));
  } },
  { id: 'flashlight', desc: 'A typical household flashlight with a plastic handle, powered by batteries.  (Longest side 136 mm, blue, lying.)', build: (p) => {
    cyl(p, 'body', 'x', [-.02, .016, 0], .016, .1, 10, plasticP(0x2a5ab0));
    cyl(p, 'head', 'x', [.05, .022, 0], .022, .036, 10, plasticP(0x2a5ab0), {}, .022);
    cyl(p, 'lens', 'x', [.0685, .022, 0], .018, .002, 10, flat(0xf0f0d8), { glow: true });
    bevel(p, 'switch', [-.01, .03, -.005, .01, .034, .005], .001, flat(0x1e1e20));
  } },
];

export const ITEMS2 = RECIPES.map((r) => ({ ...r, dir: 'items', ppm: 512, source: 'tools/cubeclysm/page/items2.js' }));
