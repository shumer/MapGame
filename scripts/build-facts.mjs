// Derives factual statements about each country from the map itself, so they
// cannot drift out of step with the data or be quietly wrong: neighbour counts,
// coastline, size ranking, extremes. Written into derived.json alongside the
// rest, and rendered through templates in src/i18n/facts.ts.
import fs from 'node:fs'
import { feature } from 'topojson-client'
import { geoArea, geoBounds, geoCentroid } from 'd3-geo'
import { CONTINENTS, membersOf, topoPath } from './continents.mjs'

const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))
const derivedAll = JSON.parse(fs.readFileSync('src/data/derived.json', 'utf8'))

for (const continent of CONTINENTS) {
buildContinent(continent)
}

fs.writeFileSync('src/data/derived.json', JSON.stringify(derivedAll, null, 2) + '\n')

function buildContinent(continent) {
const members = membersOf(data.countries, continent.id)
const derived = derivedAll[continent.id]
const topo = JSON.parse(fs.readFileSync(topoPath(continent.id), 'utf8'))
const byId = new Map(feature(topo, topo.objects.countries).features.map((f) => [f.properties.id, f]))

/** Steradians to square kilometres. */
const EARTH_AREA_KM2 = 510_072_000 / (4 * Math.PI)

const stats = members.map((c) => {
  const f = byId.get(c.un)
  const area = f ? geoArea(f) * EARTH_AREA_KM2 : 0
  const bounds = f ? geoBounds(f) : null
  const centre = f ? geoCentroid(f) : c.capitalCoords
  return {
    iso: c.iso,
    area,
    borders: derived[c.iso].borders,
    north: derived[c.iso].focus[3],
    south: derived[c.iso].focus[1],
    west: derived[c.iso].focus[0],
    east: derived[c.iso].focus[2],
    capitalLat: c.capitalCoords[1],
    capitalLon: c.capitalCoords[0],
    centre,
    bounds,
    micro: c.micro,
  }
})

const bySize = [...stats].sort((a, b) => b.area - a.area)

/** Whether a country is landlocked or an island is stated in countries.json
 *  rather than worked out from geometry, which is far less reliable at this
 *  resolution: a fjord or a strait can read either way. */
const LANDLOCKED = new Set(members.filter((c) => c.landlocked).map((c) => c.iso))
const ISLANDS = new Set(members.filter((c) => c.island).map((c) => c.iso))

const facts = {}
for (const s of stats) {
  const list = []
  const sizeRank = bySize.findIndex((x) => x.iso === s.iso) + 1

  if (s.borders.length === 0) {
    list.push({ kind: 'noNeighbours' })
  } else {
    list.push({ kind: 'neighbours', count: s.borders.length })
    if (s.borders.length >= 7) list.push({ kind: 'manyNeighbours', count: s.borders.length })
  }

  if (ISLANDS.has(s.iso)) list.push({ kind: 'island' })
  else if (LANDLOCKED.has(s.iso)) list.push({ kind: 'landlocked' })
  else list.push({ kind: 'coast' })

  if (sizeRank <= 3) list.push({ kind: 'biggest', rank: sizeRank })
  if (sizeRank > stats.length - 3) list.push({ kind: 'smallest', rank: stats.length - sizeRank + 1 })
  if (!s.micro) list.push({ kind: 'area', km2: Math.round(s.area / 1000) * 1000 })

  // Extremes, computed over the set rather than asserted.
  const northernmost = [...stats].sort((a, b) => b.north - a.north)[0]
  const southernmost = [...stats].sort((a, b) => a.south - b.south)[0]
  const westernmost = [...stats].sort((a, b) => a.west - b.west)[0]
  const easternmost = [...stats].sort((a, b) => b.east - a.east)[0]
  if (northernmost.iso === s.iso) list.push({ kind: 'northernmost' })
  if (southernmost.iso === s.iso) list.push({ kind: 'southernmost' })
  if (westernmost.iso === s.iso) list.push({ kind: 'westernmost' })
  if (easternmost.iso === s.iso) list.push({ kind: 'easternmost' })

  const capitalNorth = [...stats].sort((a, b) => b.capitalLat - a.capitalLat)[0]
  const capitalSouth = [...stats].sort((a, b) => a.capitalLat - b.capitalLat)[0]
  if (capitalNorth.iso === s.iso) list.push({ kind: 'northernCapital' })
  if (capitalSouth.iso === s.iso) list.push({ kind: 'southernCapital' })

  facts[s.iso] = list
}

for (const [iso, list] of Object.entries(facts)) {
  derived[iso].facts = list
}

const counts = Object.values(facts).map((f) => f.length)
console.log(
  `${continent.id}: ${counts.reduce((a, b) => a + b, 0)} facts across ${counts.length} countries, ` +
    `${Math.min(...counts)}-${Math.max(...counts)} each`,
)
}
