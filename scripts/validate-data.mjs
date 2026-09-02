// Checks countries.json against the built maps, the derived data and the flag
// set. Run after build-map / build-derived; exits non-zero on anything that
// would break the game at runtime, or teach a child something wrong.
import fs from 'node:fs'
import { feature } from 'topojson-client'
import { SYMBOL_KEYS } from './symbol-keys.mjs'
import { geoContains, geoArea, geoDistance } from 'd3-geo'
import { CONTINENTS, membersOf, topoPath } from './continents.mjs'

// Below this a country is a few pixels wide on screen and needs a marker
// with an enlarged hit area instead of a clickable polygon.
const MICRO_AREA = 1e-4

const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))
const animalData = JSON.parse(fs.readFileSync('src/data/animals.json', 'utf8'))
const derivedAll = JSON.parse(fs.readFileSync('src/data/derived.json', 'utf8'))
const continentIds = new Set(CONTINENTS.map((c) => c.id))

/** Distance from a point to the nearest vertex of a shape, in kilometres. */
const nearestKm = (feature, point) => {
  const rings =
    feature.geometry.type === 'Polygon'
      ? feature.geometry.coordinates
      : feature.geometry.coordinates.flat()
  let best = Infinity
  for (const ring of rings) {
    for (const vertex of ring) best = Math.min(best, geoDistance(vertex, point))
  }
  return Math.round(best * 6371)
}

const problems = []
const notes = []
const seen = new Set()

// Checks that hold wherever a country is drawn, done once per country.
for (const c of data.countries) {
  const tag = `${c.iso} ${c.name.en}`

  for (const key of [`iso:${c.iso}`, `un:${c.un}`]) {
    if (seen.has(key)) problems.push(`${tag}: duplicate ${key}`)
    seen.add(key)
  }

  for (const lang of ['ru', 'pl', 'en']) {
    for (const field of ['name', 'capital']) {
      if (!c[field]?.[lang]?.trim()) problems.push(`${tag}: empty ${field}.${lang}`)
    }
    // The written fact is optional, but a fact in one language only is a bug:
    // a child playing in Polish would get a blank line where the others get a
    // sentence.
    if (c.fact && !c.fact[lang]?.trim()) problems.push(`${tag}: fact missing in ${lang}`)
    for (const story of c.stories ?? []) {
      if (!story[lang]?.trim()) problems.push(`${tag}: a story is missing in ${lang}`)
    }
  }

  if (![1, 2, 3].includes(c.fame)) problems.push(`${tag}: bad fame ${c.fame}`)

  if (c.symbol && !SYMBOL_KEYS.includes(c.symbol)) {
    problems.push(`${tag}: no symbol named "${c.symbol}"`)
  }

  const [lon, lat] = c.capitalCoords ?? []
  if (!(lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90)) {
    problems.push(`${tag}: bad capitalCoords ${c.capitalCoords}`)
  }

  if (!fs.existsSync(`node_modules/flag-icons/flags/4x3/${c.iso.toLowerCase()}.svg`)) {
    problems.push(`${tag}: no flag svg`)
  }

  if (!c.regions?.length) problems.push(`${tag}: belongs to no continent`)
  for (const r of c.regions ?? []) {
    if (!continentIds.has(r)) problems.push(`${tag}: unknown continent "${r}"`)
  }

  for (const flag of ['micro', 'landlocked', 'island']) {
    if (typeof c[flag] !== 'boolean') problems.push(`${tag}: ${flag} must be true or false`)
  }
  if (c.landlocked && c.island) problems.push(`${tag}: both landlocked and an island`)
}

// Everything that depends on which map the country is drawn on: a country can
// be in two sets, with different neighbours and a different colour in each.
for (const continent of CONTINENTS) {
  const derived = derivedAll[continent.id] ?? {}
  const members = membersOf(data.countries, continent.id)
  const topo = JSON.parse(fs.readFileSync(topoPath(continent.id), 'utf8'))
  const byId = new Map(feature(topo, topo.objects.countries).features.map((f) => [f.properties.id, f]))

  if (!members.length) problems.push(`${continent.id}: no countries in the set`)

  for (const c of members) {
    const tag = `${c.iso} ${c.name.en} (${continent.id})`
    const d = derived[c.iso]

    if (!d) {
      problems.push(`${tag}: missing derived entry`)
    } else {
      if (d.near.length < 3) problems.push(`${tag}: only ${d.near.length} nearby countries`)
      if (d.near.includes(c.iso)) problems.push(`${tag}: listed as its own neighbour`)
      const [x0, y0, x1, y1] = d.focus
      if (!(x1 > x0 && y1 > y0)) problems.push(`${tag}: bad focus box ${d.focus}`)
      const [lon, lat] = c.capitalCoords
      if (lon < x0 - 1 || lon > x1 + 1 || lat < y0 - 1 || lat > y1 + 1) {
        problems.push(`${tag}: capital outside its own focus box`)
      }
      for (const n of d.borders) {
        if (derived[n]?.color === d.color) problems.push(`${tag}: same map colour as ${n}`)
      }
    }

    const f = byId.get(c.un)
    if (!f) {
      // Expected only for a microstate: it gets drawn as a marker on its capital.
      if (!c.micro) problems.push(`${tag}: no polygon and not marked micro`)
      else notes.push(`${tag}: no polygon, drawn as marker`)
      continue
    }

    if (!geoContains(f, c.capitalCoords)) {
      // A coarse grid moves a coastline by a few kilometres, and a capital on
      // the shore ends up just outside its own country. That is the map being
      // rounded, not the data being wrong: what this check is really for is a
      // capital dropped in the wrong country entirely.
      const km = nearestKm(f, c.capitalCoords)
      // A microstate is drawn as a marker on its capital rather than as a
      // polygon, and an atoll a few hundred metres wide barely survives the
      // grid at all, so its outline is not something to measure against.
      if (km > 60 && !c.micro) problems.push(`${tag}: capital ${km} km outside its polygon`)
      else notes.push(`${tag}: capital ${km} km outside the rounded coastline`)
    }

    // Between these two the call is a judgement one: an island chain of that
    // size is drawn small on one map and just tappable on another, and the
    // grid a set uses moves the number either way.
    const area = geoArea(f)
    const borderline = area > MICRO_AREA / 2 && area < MICRO_AREA * 3
    if (!borderline && (area < MICRO_AREA) !== c.micro) {
      problems.push(`${tag}: micro=${c.micro} but area=${area.toExponential(2)}`)
    }
  }

  // The scenery belongs in open water. A compass sitting on Kazakhstan reads
  // as a bug to a child looking closely, and nobody notices a stray wave until
  // they do.
  const decor = continent.decor
  const spots = [
    ['compass', decor.compass],
    ['boat', decor.boat],
    ['whale', decor.whale],
    ...decor.waves.map((w, i) => [`wave ${i}`, w]),
  ]
  for (const [what, point] of spots) {
    const on = [...byId.values()].find((f) => geoContains(f, point))
    if (on) problems.push(`${continent.id}: ${what} sits on land (${on.properties.id}) at ${point}`)
  }

  const strays = Object.keys(derived).filter((iso) => !members.some((c) => c.iso === iso))
  if (strays.length) {
    problems.push(`${continent.id}: derived has entries for countries not in the set: ${strays.join(', ')}`)
  }
}

// Animals. A wrong fact here is repeated out loud by a child, so the checks
// are about honesty as much as about shape: an animal that lives nowhere
// cannot be asked about, and one that lives everywhere cannot be a question.
const isoSet = new Set(data.countries.map((c) => c.iso))
const seenAnimals = new Set()
const iconOwners = new Map()

for (const a of animalData.animals) {
  const tag = `animal ${a.id}`
  if (seenAnimals.has(a.id)) problems.push(`${tag}: duplicate id`)
  seenAnimals.add(a.id)

  for (const lang of ['ru', 'pl', 'en']) {
    if (!a.name?.[lang]?.trim()) problems.push(`${tag}: no name in ${lang}`)
  }

  if (!SYMBOL_KEYS.includes(a.id)) problems.push(`${tag}: no picture named "${a.id}"`)

  if (!a.livesIn?.length) problems.push(`${tag}: lives nowhere`)
  for (const iso of a.livesIn ?? []) {
    if (!isoSet.has(iso)) problems.push(`${tag}: unknown country ${iso}`)
  }
  // Half the world is not an answer to anything.
  if ((a.livesIn?.length ?? 0) > data.countries.length / 3) {
    problems.push(`${tag}: lives in ${a.livesIn.length} countries, too many to ask about`)
  }

  if (a.iconOf) {
    if (!isoSet.has(a.iconOf)) problems.push(`${tag}: unknown iconOf ${a.iconOf}`)
    if (!a.livesIn?.includes(a.iconOf)) problems.push(`${tag}: iconOf ${a.iconOf} is not in livesIn`)
    const taken = iconOwners.get(a.iconOf)
    if (taken) problems.push(`${tag}: ${a.iconOf} already stands for ${taken}`)
    iconOwners.set(a.iconOf, a.id)
  }
}

// Every country in the round needs wrong answers that are honestly wrong.
const CHOICES = 4
for (const c of data.countries) {
  const here = animalData.animals.filter((a) => a.livesIn.includes(c.iso))
  if (!here.length) continue
  const elsewhere = animalData.animals.filter((a) => !a.livesIn.includes(c.iso))
  if (elsewhere.length < CHOICES - 1) {
    problems.push(`${c.iso}: only ${elsewhere.length} animals that do not live there`)
  }
}

console.log(`animals: ${animalData.animals.length}, covering ${new Set(animalData.animals.flatMap((a) => a.livesIn)).size} countries`)
console.log(`countries: ${data.countries.length}`)
console.log(`fame: ${[1, 2, 3].map((n) => `${n}=${data.countries.filter((c) => c.fame === n).length}`).join('  ')}`)
console.log(`micro: ${data.countries.filter((c) => c.micro).map((c) => c.iso).join(', ')}`)
for (const continent of CONTINENTS) {
  console.log(`${continent.id}: ${membersOf(data.countries, continent.id).length} countries`)
}
if (notes.length) console.log('\n' + notes.map((n) => '  note: ' + n).join('\n'))
if (problems.length) {
  console.log('\nFAIL\n' + problems.map((p) => '  ' + p).join('\n'))
  process.exit(1)
}
console.log('\nOK')
