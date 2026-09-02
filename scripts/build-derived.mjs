// Derives per-country data from the map, one continent at a time: the frame to
// zoom to, and the list of nearby countries used to pick believable wrong
// answers. Output is keyed by continent, because a country's neighbours and its
// map colour depend on which set it is being drawn in.
import fs from 'node:fs'
import { feature, neighbors } from 'topojson-client'
import { geoBounds, geoCentroid, geoDistance } from 'd3-geo'
import { CONTINENTS, membersOf, topoPath } from './continents.mjs'

const NEAR_COUNT = 6
const PALETTE_SIZE = 6

const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))
const out = {}

for (const continent of CONTINENTS) {
buildContinent(continent)
}

function buildContinent(continent) {
// Everything outside this window is an overseas territory as far as this set is
// concerned: it should not drag the zoom frame across an ocean.
const WINDOW = continent.window
const MANUAL_FOCUS = continent.manualFocus ?? {}
// Borders the topology cannot supply, because the country is too small to have
// survived quantization as a polygon. Applied both ways.
const MANUAL_BORDERS = continent.manualBorders ?? {}

const members = membersOf(data.countries, continent.id)
const topo = JSON.parse(fs.readFileSync(topoPath(continent.id), 'utf8'))
const geoms = topo.objects.countries.geometries
const feats = feature(topo, topo.objects.countries).features

const byId = new Map(feats.map((f) => [f.properties.id, f]))
const isoByUn = new Map(members.map((c) => [c.un, c.iso]))

// Land borders come straight from the shared arcs in the topology.
const adjacency = neighbors(geoms)
const landNeighbors = new Map()
geoms.forEach((g, i) => {
  const iso = isoByUn.get(g.properties.id)
  if (!iso) return
  landNeighbors.set(
    iso,
    adjacency[i]
      .map((j) => isoByUn.get(geoms[j].properties.id))
      .filter((n) => n && n !== iso),
  )
})

// The mainland part of a country: inside this set's window, and not a speck.
// Both filters exist to stop an outlying islet from stretching the zoom frame.
function mainlandParts(f) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  const box = (poly) => {
    const lons = poly[0].map((p) => p[0])
    const lats = poly[0].map((p) => p[1])
    return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)]
  }
  const spans = polys.map((poly) => {
    const [x0, y0, x1, y1] = box(poly)
    return (x1 - x0) * (y1 - y0)
  })
  const biggest = Math.max(...spans)
  const inside = polys.filter((poly, i) => {
    const [x0, y0, x1, y1] = box(poly)
    const inWindow = x1 >= WINDOW.lon[0] && x0 <= WINDOW.lon[1] && y1 >= WINDOW.lat[0] && y0 <= WINDOW.lat[1]
    return inWindow && spans[i] >= biggest * 0.005
  })
  return { type: 'MultiPolygon', coordinates: inside.length ? inside : polys }
}

const derived = {}
const centroids = new Map()

// A set that collects the others inherits their zoom frames rather than
// working them out again from a worldwide window, which would frame France
// from French Guiana to Réunion.
const inherited = (iso) => {
  if (!continent.collects) return null
  for (const other of CONTINENTS) {
    if (other.id === continent.id) continue
    const focus = out[other.id]?.[iso]?.focus
    if (focus) return focus
  }
  return null
}

for (const c of members) {
  const f = byId.get(c.un)
  // A microstate with no polygon is anchored on its capital instead.
  const focus = MANUAL_FOCUS[c.iso] ??
    inherited(c.iso) ??
    (f
      ? geoBounds(mainlandParts(f)).flat()
      : [c.capitalCoords[0] - 0.5, c.capitalCoords[1] - 0.4, c.capitalCoords[0] + 0.5, c.capitalCoords[1] + 0.4])

  centroids.set(c.iso, f ? geoCentroid(mainlandParts(f)) : c.capitalCoords)
  derived[c.iso] = { focus: focus.map((n) => +n.toFixed(3)) }
}

// Nearby countries: land borders first, then the closest by centroid distance.
for (const c of members) {
  const here = centroids.get(c.iso)
  const byDistance = members
    .filter((o) => o.iso !== c.iso)
    .map((o) => [o.iso, geoDistance(here, centroids.get(o.iso))])
    .sort((a, b) => a[1] - b[1])
    .map(([iso]) => iso)

  const land = [...new Set([
    ...(landNeighbors.get(c.iso) ?? []),
    ...(MANUAL_BORDERS[c.iso] ?? []),
    ...Object.entries(MANUAL_BORDERS).filter(([, v]) => v.includes(c.iso)).map(([k]) => k),
  ])]
  derived[c.iso].near = [...new Set([...land, ...byDistance])].slice(0, NEAR_COUNT)
  derived[c.iso].borders = land
}

// Map colouring: give every country one of a few palette slots so that no two
// countries sharing a border get the same one. Greedy over the most-connected
// countries first, which is what keeps it down to a handful of colours.
const order = members
  .map((c) => c.iso)
  .sort((a, b) => derived[b].borders.length - derived[a].borders.length)

// Nearness is not symmetric: New Zealand is among Australia's six closest
// countries but Australia is not among New Zealand's, because Tonga and Fiji
// are nearer. For colouring it has to work both ways round.
const nearBoth = new Map(members.map((c) => [c.iso, new Set(derived[c.iso].near)]))
for (const [iso, set] of nearBoth) {
  for (const other of set) nearBoth.get(other)?.add(iso)
}

order.forEach((iso, i) => {
  // Islands have no borders to clash over, so the greedy pass would give every
  // one of them slot zero. They avoid their nearest neighbours instead, which
  // is what stops Australia and New Zealand coming out the same colour.
  const avoid = derived[iso].borders.length
    ? derived[iso].borders
    : [...(nearBoth.get(iso) ?? [])]
  const taken = new Set(avoid.map((n) => derived[n]?.color).filter((v) => v !== undefined))
  let slot = derived[iso].borders.length ? 0 : i % PALETTE_SIZE
  let tries = 0
  while (taken.has(slot) && tries++ < PALETTE_SIZE) slot = (slot + 1) % PALETTE_SIZE
  derived[iso].color = slot
})

const clashes = members.flatMap((c) =>
  derived[c.iso].borders
    .filter((n) => derived[n].color === derived[c.iso].color)
    .map((n) => `${c.iso}-${n}`),
)

out[continent.id] = derived

const wide = Object.entries(derived).filter(([, d]) => d.focus[2] - d.focus[0] > 30)
console.log(`${continent.id}: ${Object.keys(derived).length} entries, ${new Set(Object.values(derived).map((d) => d.color)).size} colour slots`)
if (clashes.length) console.log(`  neighbours sharing a colour: ${clashes.join(', ')}`)
const nolands = Object.entries(derived).filter(([, d]) => !d.borders.length).map(([iso]) => iso)
if (nolands.length) console.log(`  no land borders: ${nolands.join(', ')}`)
if (wide.length) console.log(`  focus wider than 30 deg: ${wide.map(([iso, d]) => `${iso} ${d.focus.join(',')}`).join(' | ')}`)
}

fs.writeFileSync('src/data/derived.json', JSON.stringify(out, null, 2) + '\n')
