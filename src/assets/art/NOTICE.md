# Third-party artwork

Most artwork here comes from the [Noto Emoji](https://github.com/googlefonts/noto-emoji)
project by Google, used under the **Apache License 2.0** (a copy is at
https://www.apache.org/licenses/LICENSE-2.0). `scripts/fetch-art.mjs` is what
downloaded those, and records which glyph each file came from.

Four symbols come from Wikimedia Commons instead, because Noto has no
equivalent and the hand-drawn versions were not recognisable:

| file | source | licence |
|---|---|---|
| `symbols/eiffel.svg` | Eiffel tower.svg | public domain |
| `symbols/stork.svg` | Ciconia, Stork, Storch, Ooievaar, Gólya.svg | CC0 |
| `symbols/windmill.svg` | World landmarks icons - Holland windmill.svg | CC0 |
| `symbols/bigben.svg` | World landmarks icons - Big Ben.svg | CC0 |

Every file was edited only to strip the editor preamble and unused metadata;
the artwork itself is unchanged.

## What is used where

- `plane.svg` — the plane on the start screen.
- `decor/` — compass, whale and boat in the open sea, and the traveller who
  stands at the head of the route on the map.
- `symbols/` — the per-country hints. Seven symbols with no free equivalent
  anywhere (lake, bridge, viking ship, amber, lego, dome, towers) are still
  drawn in `src/ui/symbols.tsx`.

Everything else in the game — characters, mode icons, scenery, waves, map
styling — is drawn in code and belongs to this project.
