# Journey around the World

*Путешествие по миру - the title the game shows itself.*

A browser game for learning the countries, flags and capitals of the world.
The Europe set is the one that exists today; more continents follow.
Works offline, installs on a tablet as an app, and sends nothing anywhere.

## Running it

```bash
npm install
npm run dev
```

`npm run build` produces a static site in `dist/` that can be served from any
static host.

To try it on a tablet or phone on the same Wi-Fi, without deploying anything:

```bash
npm run dev:lan
```

Vite then prints a `http://<your-ip>:5173` address to open on the device.

Every push to `main` runs the checks (`.github/workflows/ci.yml`), but the
published site only changes when a release is published
(`.github/workflows/deploy.yml`), so what the kids are playing stays put until
you decide to ship. To ship:

```
npm version <patch|minor> --no-git-tag-version
git commit -am "Release x.y.z" && git push
gh release create vx.y.z --title "vx.y.z" --notes "what changed"
```

The repository needs Pages enabled once, with the source set to GitHub
Actions.

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
