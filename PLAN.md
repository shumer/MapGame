# MapGame — plan and status

A browser game for children learning the countries, flags and capitals of
Europe. Static, offline-capable, no backend.

## Status

Done: stages 0-5 and 7, plus most of the polish in stage 6. The game is
playable end to end in all three rounds, works offline and installs as an app.

Remaining: deployment, and the extensions in stage 8.

## Players

Two profiles with genuinely different mechanics, picked by tapping a character:

| | Little one (5, cannot read) | Expert (11, reads well) |
|---|---|---|
| Options | 2 | 4 |
| Text | minimal, everything spoken | full |
| Flag round | country spoken, answers are flags | flag shown, answers are names |
| Question read aloud | automatically | on request |
| Rounds available | flags, find on the map | all rounds |
| Capitals | off | on |
| Distractors | distant regions, obviously different | neighbours, similar flags |
| Round length | 8 questions | 12 questions |
| Result | stars and confetti | stars, score, best run |
| A miss | no penalty, the answer is simply shown | the same, and it returns sooner |

Profiles live in localStorage, one per character.

## Country sets

Europe first (45 countries). Later sets: Asia, Africa, North America, South
America, Oceania, the whole world. Within a set, questions start from the
best-known countries, ordered by the `fame` field (1-3).

## Languages

Russian, Polish and English, chosen by flag on the start screen and remembered
per device.

## Rounds

1. **Flag to country.** A flag is shown, the answer is picked from names. The
   country lights up on the map when answered.
2. **Country to flag.** The reverse, used automatically for a child who cannot
   read.
3. **Find on the map.** The name is given, the child taps the country.
4. **Capital.** The country is named and highlighted on the map; the answer is
   picked from capitals. The capital appears as a dot when answered.
5. **Point at the capital.** The country is highlighted, the child taps the
   right dot among several. Not built yet.

## Decisions

- **A miss never punishes.** No negative score, no red cross. The right answer
  is shown on the map, named aloud, and scheduled to come back.
- **Spaced repetition.** Each country carries a streak counter. After a miss it
  returns in 3 questions, then 8, 20, 45, 90.
- **Finite sessions.** A round of 8-12 questions with a result screen, not an
  endless stream.
- **Small countries.** Auto-zoom on the region for a microstate, an enlarged hit
  area (~16px radius), and the neighbourhood highlighted after the first wrong
  tap.
- **A card after every answer.** Flag, name, capital, a drawn symbol, one fact,
  and a listen button.
- **Drawn hints.** Every country has a symbol — its animal, landmark or
  best-known thing — shown beside the question and on the answer card.

## Stack

| What | With |
|---|---|
| Base | Vite + React + TypeScript |
| Map | d3-geo + topojson-client + world-atlas (Natural Earth), rendered as SVG |
| Map style | own CSS: pastel fills, thick rounded coastline, Nunito |
| Flags | the 45 in use, copied from `flag-icons` at build time |
| State | zustand, persisted to localStorage |
| Speech | Web Speech API, ru-RU / pl-PL / en-GB |
| Sound | synthesised with Web Audio, no audio files |
| Offline | vite-plugin-pwa |
| Hosting | GitHub Pages or Netlify |

Tile maps (MapLibre, Leaflet) are deliberately not used: heavy, network-bound,
and clicking a country is harder.

**Speech risk:** system voice quality varies by device and Polish voices are
missing on some. If it disappoints, pre-generate mp3 files into the offline
cache.

## Data format

`src/data/countries.json`, one entry per country:

```json
{
  "iso": "PL",
  "un": "616",
  "region": "europe",
  "subregion": "central",
  "fame": 1,
  "micro": false,
  "name": { "ru": "Польша", "pl": "Polska", "en": "Poland" },
  "capital": { "ru": "Варшава", "pl": "Warszawa", "en": "Warsaw" },
  "capitalCoords": [21.0122, 52.2297],
  "symbol": "stork",
  "fact": { "ru": "...", "pl": "...", "en": "..." }
}
```

`un` is the numeric ISO 3166-1 code, which links the entry to a polygon in the
topology. `micro: true` marks a country too small to tap, drawn as a marker.

## Stages

- [x] **0. Data.** 45 countries, three languages, a validator, a map built from
  Natural Earth 10m.
- [x] **1. Frame.** Vite + React + TS, profiles in localStorage, level and
  language selection.
- [x] **2. Map.** `<WorldMap>`: gestures, capped auto-zoom, microstate markers,
  capital dot.
- [x] **3. Engine.** Question selection, distractors by adjacency or distance,
  spaced repetition.
- [x] **4. Rounds.** Flags (both directions), find on the map with a regional
  hint, capitals. A card after each answer.
- [x] **5. Speech and sound.** Web Speech API plus synthesised sounds, praise
  spoken on a correct answer.
- [x] **6. Presentation.** Painted start screen with two characters, drawn
  country symbols, confetti poppers, animations, tablet layout.
- [x] **7. PWA.** Manifest, 1.7 MB offline cache, icons drawn from the map.
- [ ] **8. Extensions.** The "point at the capital" round, the remaining
  continents, two-player mode on one device.
