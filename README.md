# cdda-cubeclysm-3d

**Cubeclysm**: blocky 3D models for
[Cataclysm: Dark Days Ahead](https://github.com/CleverRaven/Cataclysm-DDA), one per CDDA id.

An engine-neutral model library. It holds glTF models and `meshset.json`, the file that binds them
to CDDA ids, plus the tools that generate them. It contains no engine code; each engine reads what
it supports. Cataclysm-Vox (a 3D CDDA renderer, to be open-sourced) renders it, and
[cdda-voxel-studio](https://github.com/WangYuLei5433/cdda-voxel-studio) previews and checks it.

- **Style:** Unturned-like blocky low poly. Every body part is a box: a big cube head on a short
  neck, mitten hands, box limbs. Faces are printed toy-figure faces mixed from parts, and clothes
  are a pixel texture. Worn gear and mutations are 3D blocks: helmets, masks, vests, cuffs, bone
  spikes, tubes. Liquids, gas and pulsing are a looping effect animation.
- **Faithful to CDDA:** each model follows its monster's official description, and its size
  follows the official `volume`.
- **Licence:** CC BY-SA 3.0, like CDDA. The DEADWOOD weapons are CC BY 4.0 and the code is MIT
  ([LICENSE.md](LICENSE.md), [CREDITS.md](CREDITS.md)).

## Coverage

| | Count |
| --- | --- |
| Zombies bound to their CDDA id | 82 of 327 zombie-species monsters (humanoid, variant, military, acid, mutant, burnt, child, electric, explosive and ferrous groups) |
| Characters | `player_male`/`npc_male`, `player_female`/`npc_female` |
| Weapons and items (DEADWOOD) | 17: `glock_19`, `sw629`, `hk_mp5`, `modular_m4_carbine`, `m249`, `remington_870`, `remington_700`, `m134`, `AT4`, `flamethrower`, `bat`, `fire_ax`, `morningstar`, `katana`, `grenade`, `1st_aid_box`, `kevlar` |
| Unbound candidates | 24 archetype zombies, 22 hair-style samples, 9 survivors (to browse and try on) |

Next: the remaining humanoid zombies (55), then the fungal and dusted ones, then the other
mutants and the animals. Body animations (`Idle`, `Walk`, `Attack`, `Death`) come last, once the
humanoids are done; twitching and spasms in the descriptions wait for them.

## Using it

`meshset.json` is the contract: each entry binds an `id` to a `file`, with placement
(`height`, `fit`, `scale`, `offset`, rotations) and attribution (`author`, `license`, `source`).
The set declares `"match": "exact"`: a model binds its exact id only and never spreads to other
objects through `looks_like` or a built-in type.

| Convention | Rule |
| --- | --- |
| Units | 1 unit = 1 tile = 1 m |
| Axes and origin | +Y up, facing −Z (north), origin at the feet, standing on y = 0 |
| Rig | `root › body › head`; `body › shoulders › upper_arm.L/R › forearm.L/R › hand.L/R`; `body › thigh.L/R › shin.L/R`. The parts are rigid boxes on these joints. |
| Texture | One atlas per model, embedded in the `.glb` (nearest filtering). A ×4 `.png` sits beside it for repainting. |
| Effects | A looping clip named `FX` (2.4 s) that moves only `fx_*` nodes, never a joint. Play it on top of any body animation, or ignore it. |
| Body animations | Not shipped yet. When added, they will be named `Idle`, `Walk`, `Attack`, `Death`. |

To preview in cdda-voxel-studio, link the library into the studio's `vendor/mesh/`:

```sh
ln -s "$PWD" ../cdda-voxel-studio/vendor/mesh/cdda-cubeclysm-3d
```

## Layout

| Path | Content |
| --- | --- |
| `meshset.json` | The "Cubeclysm" set: bound models and unbound candidates |
| `models/cubeclysm/` | `monsters/`, `characters/`, `candidates/`: `.glb` and its atlas `.png`, named after the CDDA id |
| `models/deadwood/` | Weapons and items from DEADWOOD — Last Light |
| `tools/cubeclysm/` | The generator: recipes (`page/recipes.js`), body builder, gear, faces, hair, effects |
| `tools/deadwood/` | DEADWOOD export, and `select.mjs`, which binds built models into `meshset.json` |
| `docs/standard.zh.md` | **Design and constraints** (the current standard) |
| `docs/proposal.zh.md` | The original proposal (a discussion draft) |
| `.claude/skills/cubeclysm/` | The Claude Code skill for making models in this style, with the CDDA check and preview scripts |

## Building

```sh
npm install
node tools/cubeclysm/build.mjs --only mon_zombie,mon_zombie_fat   # recipes → sources/cubeclysm/ (headless Chromium)
node tools/deadwood/select.mjs                                     # bind built models into meshset.json
python3 .claude/skills/cubeclysm/scripts/cdda_check.py mon_zombie  # official description and size vs the model
node .claude/skills/cubeclysm/scripts/preview.mjs --out sheet.png mon_zombie   # render check in the studio
```

The check script expects cdda-voxel-studio and a CDDA checkout beside this folder. To point it
elsewhere, set `STUDIO` and `CDDA`.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [design standard](docs/standard.zh.md). In short:
one model per CDDA id, checked against the official description and volume, with worn items as 3D
blocks; CC BY-SA 3.0; a pull request with a studio screenshot.
