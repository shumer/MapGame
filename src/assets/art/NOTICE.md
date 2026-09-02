# Third-party artwork

All artwork in this directory comes from the [Noto Emoji](https://github.com/googlefonts/noto-emoji)
project by Google, used under the **Apache License 2.0**. A copy of the licence
is at https://www.apache.org/licenses/LICENSE-2.0

The files were edited only to remove the Illustrator preamble and editor-only
attributes; the artwork itself is unchanged. `scripts/fetch-art.mjs` is what
downloaded them, and records which glyph each file came from.

## What is used where

- `plane.svg` — the plane on the start screen.
- `decor/` — compass, whale and boat, drawn in the open sea on the map.
- `symbols/` — the per-country hints. Countries whose symbol has no Noto
  equivalent (stork, windmill, Eiffel Tower, Big Ben, lake, bridge, viking ship,
  amber, lego, dome, towers) keep the drawn versions in `src/ui/symbols.tsx`.

Everything else in the game — characters, mode icons, scenery, waves, map
styling — is drawn in code and belongs to this project.
