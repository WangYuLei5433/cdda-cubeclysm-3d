# Contributing

Thanks for helping model the Cataclysm. The full rules are in the
[design standard](docs/standard.zh.md). This is the short version.

## How changes come in

- Anyone can clone and use the library.
- Only maintainers push to `main`. Everyone else forks, works on a branch, and opens a pull
  request.
- A maintainer reviews every pull request against the checklist below, then merges it.

## What a model needs

1. **One CDDA id, checked against the official data.** Run
   `python3 .claude/skills/cubeclysm/scripts/cdda_check.py <id>`. Follow the description, and size
   the model to the official `volume`: the model-to-target ratio the script prints should be about
   0.75–1.45.
2. **The Cubeclysm style:** boxes, a big head on a short neck, mitten hands, a mixed printed face,
   clothes painted on the atlas.
3. **Worn items and mutations as 3D blocks,** not just paint.
4. **Effects only on `fx_*` nodes,** in the looping `FX` clip. Never animate a joint for an effect.
5. **Standing on y = 0,** facing −Z (north), 1 unit = 1 m.
6. **An entry in `meshset.json`** with `author`, `license` and `source`. A model built from a
   recipe gets this from `node tools/deadwood/select.mjs`.

## Licence

By contributing you confirm that the work is your own and that you release it under CC BY-SA 3.0.
For an outside model, give its source, and confirm it is under a compatible licence (such as CC0 or
CC BY), with its attribution kept in `CREDITS.md`. We cannot accept any of the following:

- models or textures from commercial games, or extracted from them;
- NC (non-commercial) or ND (no-derivatives) material;
- anything derived from either of the above.
