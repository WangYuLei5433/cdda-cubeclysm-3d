# Credits

## DEADWOOD — Last Light

*"DEADWOOD — Last Light" by Cédric Bernadac, CC BY 4.0*:
<https://github.com/cedricbernadac/deadwood-open>

- Files: everything under `models/deadwood/` and `models/cubeclysm/`.
- Source: `public/frisson/` (survivors, heads, bodies, weapons, pickups) at the commit recorded in
  each `meshset.json` entry's `source`. The original credits are kept in
  [sources/deadwood/ASSETS.md](sources/deadwood/ASSETS.md).
- Changes: each model was assembled from its parts by the game's own code, then rebuilt for this
  library. Joints were renamed, flat shading baked in, game-only helpers removed, and weapons put
  in their ground pose. Sizes are set in `meshset.json`.
- Cubeclysm (`models/cubeclysm/`): the characters and zombies were restyled as boxes. Their
  clothes are sampled from the original colours, and their faces are newly drawn. This is an
  adaptation of the work above, under the same CC BY 4.0 licence.
