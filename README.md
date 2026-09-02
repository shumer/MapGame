# Journey across Europe

*Путешествие по Европе — the title the game shows itself.*

A browser game for learning the countries, flags and capitals of Europe.
Works offline, installs on a tablet as an app, and sends nothing anywhere.

## Running it

```bash
npm install
npm run dev
```

`npm run build` produces a static site in `dist/` that can be served from any
static host.

## Data

The single hand-written source is `src/data/countries.json`: names, capitals
and facts in three languages. Everything else is generated from it:

```bash
npm run data
```

That builds the map (`europe.topo.json`), the derived data (`derived.json`:
zoom frames, neighbours, map colouring), copies the flags in use, and validates
the result. The validator fails if a capital falls outside its country's
border, a translation is missing, a flag file is absent, a country references a
symbol nobody drew, or two bordering countries were given the same colour.

The steps can be run individually: `npm run data:map`, `data:derived`,
`data:flags`, `data:check`.

App icons are drawn from the same map: `node scripts/build-icons.mjs`.

A page for proofreading the translations: `node scripts/build-review-page.mjs out.html`.

A single self-contained HTML file with the whole game: `SINGLE_FILE=1 npx vite build`.

## Third-party artwork

The plane on the start screen is the small airplane from Google's
[Noto Emoji](https://github.com/googlefonts/noto-emoji), used under the Apache
2.0 licence. See `src/assets/art/NOTICE.md`. Everything else — characters,
country symbols, icons, scenery — is drawn in code.

## How it is put together

- `src/data` — data and types.
- `src/map` — the projection (conformal conic, the one school maps of Europe
  use), topology loading, gesture zoom, and the map component.
- `src/game` — level presets, question and distractor selection, spaced
  repetition, round state.
- `src/screens` — start, menu, game, result.
- `src/store` — profiles and device settings in localStorage.
- `src/ui` — flags, characters, drawn country symbols, confetti.
- `scripts` — data, icon and page generation.

## Two levels

|  | Little one | Expert |
|---|---|---|
| Options | 2 | 4 |
| Flag round | country spoken aloud, answers are flags | flag shown, answers are names |
| Capitals | no | yes |
| Distractors | from distant regions | neighbours |
| Round | 8 questions | 12 questions |
| Countries | 23 best known | all 45 |

The level is chosen by tapping a character on the start screen and changes
almost everything about how the game behaves.
