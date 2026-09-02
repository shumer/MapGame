// Checks countries.json against the built map, the derived data and the flag set.
// Run after build-map / build-derived; exits non-zero on anything that would
// break the game at runtime.
import fs from 'node:fs'
import { feature } from 'topojson-client'
import { SYMBOL_KEYS } from './symbol-keys.mjs'
import { geoContains, geoArea } from 'd3-geo'

// Below this a country is a few pixels wide on screen and needs a marker
// with an enlarged hit area instead of a clickable polygon.
const MICRO_AREA = 1e-4

const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))
const derived = JSON.parse(fs.readFileSync('src/data/derived.json', 'utf8'))
const topo = JSON.parse(fs.readFileSync('src/data/europe.topo.json', 'utf8'))
const byId = new Map(feature(topo, topo.objects.countries).features.map((f) => [f.properties.id, f]))

const problems = []
const notes = []
const seen = new Set()

for (const c of data.countries) {
  const tag = `${c.iso} ${c.name.en}`

  for (const key of [`iso:${c.iso}`, `un:${c.un}`]) {
    if (seen.has(key)) problems.push(`${tag}: duplicate ${key}`)
    seen.add(key)
  }

  for (const lang of ['ru', 'pl', 'en']) {
    for (const field of ['name', 'capital', 'fact']) {
      if (!c[field]?.[lang]?.trim()) problems.push(`${tag}: empty ${field}.${lang}`)
    }
  }

  if (![1, 2, 3].includes(c.fame)) problems.push(`${tag}: bad fame ${c.fame}`)

  if (!SYMBOL_KEYS.includes(c.symbol)) problems.push(`${tag}: no symbol named "${c.symbol}"`)

  const [lon, lat] = c.capitalCoords ?? []
  if (!(lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90)) {
    problems.push(`${tag}: bad capitalCoords ${c.capitalCoords}`)
  }

  if (!fs.existsSync(`node_modules/flag-icons/flags/4x3/${c.iso.toLowerCase()}.svg`)) {
    problems.push(`${tag}: no flag svg`)
  }

  const d = derived[c.iso]
  if (!d) {
    problems.push(`${tag}: missing derived entry`)
  } else {
    if (d.near.length < 3) problems.push(`${tag}: only ${d.near.length} nearby countries`)
    if (d.near.includes(c.iso)) problems.push(`${tag}: listed as its own neighbour`)
    const [x0, y0, x1, y1] = d.focus
    if (!(x1 > x0 && y1 > y0)) problems.push(`${tag}: bad focus box ${d.focus}`)
    if (lon < x0 - 1 || lon > x1 + 1 || lat < y0 - 1 || lat > y1 + 1) {
      problems.push(`${tag}: capital outside its own focus box`)
    }
  }

  const f = byId.get(c.un)
  if (!f) {
    // Expected only for a microstate: it gets drawn as a marker on its capital.
    if (!c.micro) problems.push(`${tag}: no polygon and not marked micro`)
    else notes.push(`${tag}: no polygon, drawn as marker`)
    continue
  }

  if (!geoContains(f, c.capitalCoords)) problems.push(`${tag}: capital outside polygon`)

  const area = geoArea(f)
  if ((area < MICRO_AREA) !== c.micro) {
    problems.push(`${tag}: micro=${c.micro} but area=${area.toExponential(2)}`)
  }
}

// The boat must stay on water and the car on land, along the whole route and
// not merely at its corners: a straight leg can cut across a coastline.
const travellers = fs.readFileSync('src/map/Travellers.tsx', 'utf8')
/** Reads a `const NAME: [number, number][] = [...]` literal. The type
    annotation contains brackets of its own, so the end is found by balance
    rather than by the first closing bracket. */
const routeOf = (name) => {
  const start = travellers.indexOf(`const ${name}`)
  if (start < 0) return []
  const open = travellers.indexOf('= [', start) + 2
  let depth = 0
  let end = open
  for (let i = open; i < travellers.length; i++) {
    if (travellers[i] === '[') depth++
    else if (travellers[i] === ']' && --depth === 0) {
      end = i
      break
    }
  }
  const body = travellers.slice(open, end)
  return [...body.matchAll(/\[\s*(-?[\d.]+),\s*(-?[\d.]+)\s*\]/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ])
}
const landFeatures = feature(topo, topo.objects.countries).features
const onLand = (p) => landFeatures.some((f) => geoContains(f, p))
const walkRoute = (pts) => {
  const out = []
  for (let i = 1; i < pts.length; i++) {
    for (let t = 0; t <= 1; t += 0.05) {
      out.push([
        pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
        pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t,
      ])
    }
  }
  return out
}

const seaRoute = routeOf('SEA_ROUTE')
const landRoute = routeOf('LAND_ROUTE')
if (seaRoute.length < 2 || landRoute.length < 2) {
  problems.push('could not read the traveller routes from src/map/Travellers.tsx')
} else {
  const aground = walkRoute(seaRoute).filter(onLand)
  const adrift = walkRoute(landRoute).filter((p) => !onLand(p))
  if (aground.length) problems.push(`boat route crosses land at ${aground.length} sampled points`)
  if (adrift.length) problems.push(`car route crosses water at ${adrift.length} sampled points`)
}

const orphans = Object.keys(derived).filter((iso) => !data.countries.some((c) => c.iso === iso))
if (orphans.length) problems.push(`derived has entries for unknown countries: ${orphans.join(', ')}`)

console.log(`countries: ${data.countries.length}`)
console.log(`fame: ${[1, 2, 3].map((n) => `${n}=${data.countries.filter((c) => c.fame === n).length}`).join('  ')}`)
console.log(`micro: ${data.countries.filter((c) => c.micro).map((c) => c.iso).join(', ')}`)
if (notes.length) console.log('\n' + notes.map((n) => '  note: ' + n).join('\n'))
if (problems.length) {
  console.log('\nFAIL\n' + problems.map((p) => '  ' + p).join('\n'))
  process.exit(1)
}
console.log('\nOK')
