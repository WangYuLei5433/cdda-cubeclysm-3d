# Cubeclysm

The CDDA model library.

A shared, engine-neutral library of 3D models for
[Cataclysm: Dark Days Ahead](https://github.com/CleverRaven/Cataclysm-DDA). It holds model files and
the binding files that tie them to CDDA ids. It contains no engine code. Each engine reads what it
supports.

- **Main style: Cubeclysm.** A blocky low-poly zombie-survival look. Every body part is a box:
  a cube head on a short neck, mitten hands, box limbs and torso. Faces and clothes are a 2D
  pixel texture, with a printed toy-figure face and clothes in a few flat colour blocks. Each model
  ships with its texture atlas (`.png`) beside it, ready to repaint.
- **Reference and source:** the Frisson models of
  [DEADWOOD — Last Light](https://github.com/cedricbernadac/deadwood-open) (CC BY 4.0). Cubeclysm
  characters are rebuilt from them, and the originals stay in the pool as the reference. Weapons and
  items are DEADWOOD originals for now.
- **Preview and checks:** [cdda-voxel-studio](../cdda-voxel-studio). Link this folder into the
  studio's `vendor/mesh/`:

  ```sh
  ln -s "$PWD" ../cdda-voxel-studio/vendor/mesh/cdda-cubeclysm-3d               # Cubeclysm
  ln -s "$PWD/sources/deadwood/export" ../cdda-voxel-studio/vendor/mesh/deadwood-pool  # the DEADWOOD reference
  ```

  The studio's model library then shows two sets. "Cubeclysm" holds every Cubeclysm model: the
  ones bound to CDDA ids, plus unbound candidates to browse and try on. "DEADWOOD 参考" holds the
  originals.

The proposal behind the library is in [docs/proposal.zh.md](docs/proposal.zh.md).

## Layout

| Path | Content |
| --- | --- |
| `meshset.json` | Binds CDDA ids to mesh files. `"match": "exact"`: exact ids only. |
| `models/cubeclysm/` | Cubeclysm characters and zombies (`.glb` + texture atlas `.png`), named after the CDDA id they are for; `candidates/` holds the unbound ones (listed in the same set, without an id). |
| `tools/cubeclysm/` | The Cubeclysm builder: zombies made from recipes (body type, clothes, 3D gear, odd features), each following its CDDA description. |
| `models/deadwood/` | Weapons and items from DEADWOOD — Last Light. |
| `sources/deadwood/` | Provenance: the source's asset credits; `export/` (not committed) is the full export pool. |
| `tools/deadwood/` | The export and selection tools; `page/cubeclysm.js` is the Cubeclysm rebuild (its proportions are constants at the top). |
| `docs/` | The proposal. |

## Conventions

- 1 model unit = 1 tile = 1 metre; +Y up; models face −Z (north).
- The engine stands each model on the ground, centred on its tile; `fit`, `height` and `scale` in
  `meshset.json` set its size (see the studio's README for every field).
- Humanoid joints are named `head`, `shoulders`, `upper_arm.L/.R`, `thigh.L/.R`, `shin.L/.R`, so
  the parts can be animated as rigid blocks.
- Flat shading is baked in: face normals, vertex colours, no textures.

## Strict binding

A model is bound to a CDDA id only when it clearly is that object, one model per id. The set
declares `"match": "exact"`, so its models never spread to other objects through `looks_like` or
a built-in type: `mon_zombie` gets the DEADWOOD zombie, `mon_zombie_fat` does not.

The bindings and the reason for each are in
[tools/deadwood/mapping.json](tools/deadwood/mapping.json).

To bind a new one, open the object in the studio and use **Try on** to try models from the
"Cubeclysm 备选" set on it. When one fits, **Copy mapping entry**, paste the line into the right
group of `mapping.json`, write its `why`, and run `node tools/deadwood/select.mjs`. A `pool` of the
form `"cubeclysm:<file>"` refers to the Cubeclysm set.

| Group | CDDA ids |
| --- | --- |
| Characters | `player_male`, `npc_male`, `player_female`, `npc_female` |
| Zombies | `mon_zombie`, `mon_zombie_runner`, `mon_zombie_brute`, `mon_zombie_crawler`, `mon_zombie_soldier`, `mon_zombie_miner`, `mon_zombie_medical`, `mon_zombie_shrieker` |
| Firearms | `glock_19`, `sw629`, `hk_mp5`, `modular_m4_carbine`, `m249`, `remington_870`, `remington_700`, `m134`, `AT4`, `flamethrower` |
| Melee | `bat`, `fire_ax`, `morningstar`, `katana` |
| Other items | `grenade`, `1st_aid_box`, `kevlar` |

## Cubeclysm zombies from recipes

`tools/cubeclysm/page/recipes.js` describes each zombie from its CDDA description. A recipe sets:

- a **body type**: standard, fat, tough, child, lanky, elongated, brute, giant or crawler. Each type
  sets the torso, limbs, head and height.
- the **clothes**: style, colours, sleeves, gloves, camo, reflective trim, straps.
- the **wear**: tears, blood, soot, festering wounds, veins.
- the **face**: oily black eyes, rage, hungry, gnawing, swollen, jawless and so on.
- the **3D gear and features**: police cap and duty belt, fire helmet with mask and air tank,
  combat helmet and plate carrier, hazmat hood with respirator, a backpack, a fat belly, a muscle
  hump, lumps, a swollen chest, jaw stumps, acid drips.

`node tools/cubeclysm/build.mjs` builds every recipe into `sources/cubeclysm/zombies/` (a `.glb`
and its texture atlas). `node tools/deadwood/select.mjs` then binds each one to its id in the
Cubeclysm set. A recipe is the decision to model that object, so a new recipe needs no
`mapping.json` line.

### Archetypes (unbound candidates)

`tools/cubeclysm/page/archetypes.js` holds 24 archetype zombies. They are not bound to any CDDA
id; they are there to browse and to try on objects. Each one is dressed as what its name says,
with clothes and 3D props:

- **Wanderers:** the hermit (beard, ragged coat), the widow (black dress and veil), the farmer
  (straw hat, plaid shirt, overalls), the elder (cardigan, glasses), the teen (hoodie,
  headphones), the crooked, the sewn (stitched skin) and the cracked skull.
- **Enraged:** the screamer, the grinder, the brawler (leather jacket, taped fists), the heavy, the
  lanky, the fury (glowing red eyes), the torn (missing forearm) and the fever (hospital gown).
- **Revenants:** the undertaker (black suit, top hat), the drowned (bloated, seaweed), the miner,
  the bride (wedding dress, veil, bouquet), the soldier (beret, dog tags), the crone (shawl, long
  skirt, cane), the surgeon (scrubs, cap, mask) and the farmhand (cap, bandana).

`select.mjs` lists them, under their names, as the zombie candidates of the Cubeclysm set.

### Faces and hair

Faces are mixed from parts, and each part is a PNG of its own in
`tools/cubeclysm/faces/<category>/<name>.png`, listed in `faces.json`. There are four categories:
`eyes` (10), `brows` (7), `mouth` (10) and `marks` (10: scars, blood, bruises, rot, veins, a
bandage, coal dust, stubble). A recipe picks one part per category and any number of marks:
`face: { eyes: 'one_eyed', brows: 'flat', mouth: 'frown_teeth', marks: ['blood_forehead'] }`.

Humans have their own parts, named `h_…`. There are 10 eyes, each with a white sclera and an
iris in the recipe's `eye` colour (dot, iris, almond, tired, narrow, wide, lashes, happy, wink,
heavy lids). There are 7 brows, 8 mouths (smile, grin, neutral, smirk, sad, talking, lips,
gritted) and 12 marks: moustache, goatee, full beard, freckles, blush, mole, wrinkles, lip scar,
eyeliner, dimples, nose and stubble. `page/humans.js` uses them on the player and NPC models and
on nine survivors, with varied skin tones.

Parts use key colours that are filled in for each zombie: magenta = eye colour, green = eye
sockets, blue = brows, red = wrinkles and lids. To repaint a part, edit its PNG; to add a part,
add a PNG and its line in `faces.json`. `build.mjs --seed-faces` redraws every PNG from
`page/faces.js`, which overwrites any edits.

Hair is 3D (`page/hair.js`), one style per recipe (`hairStyle`). There are 22 styles: bald, buzz,
short, messy, spiky, long, ponytail, bob, mohawk, afro, bun, pigtails, braid, side part, slicked
back, undercut, curtains, dreadlocks, top knot, wild, receding and balding. The Cubeclysm set
lists one sample zombie per style ("发型 · …") so the styles can be browsed.

Batch 1 covers 14 zombies (15 with the miner): `mon_zombie`, `_fat`, `_tough`, `_child`, `_runner`, `_crawler`,
`_brute`, `_hulk`, `_cop`, `_fireman`, `_soldier`, `_hazmat`, `_shrieker` and `_acidic`.

## Updating the DEADWOOD models

```sh
npm install
# a deadwood-open checkout with public/*.js and public/frisson/ (a sparse checkout is enough)
node tools/deadwood/export.mjs --source ../deadwood-open                    # DEADWOOD originals → sources/deadwood/export/
node tools/deadwood/export.mjs --source ../deadwood-open --only cubeclysm   # Cubeclysm characters and zombies → …/export/cubeclysm/
node tools/deadwood/select.mjs                                              # copies the bound ones, rewrites meshset.json
```

`export.mjs` builds each model with the game's own assembly code (MIT) in a headless browser,
with no network access beyond a local server. Characters, zombies (4 builds × 24 heads), weapons
in their ground pose, and pickups come out exactly as the game draws them. `select.mjs` copies the
models listed in `mapping.json`. To browse the whole pool in the studio, link
`sources/deadwood/export` into `vendor/mesh/` as well; it has its own unbound `meshset.json`.

## Licences

See [LICENSE.md](LICENSE.md) and [CREDITS.md](CREDITS.md).
