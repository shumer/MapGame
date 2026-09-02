// Derives per-country data from the map: the frame to zoom to, and the list of
// nearby countries used to pick believable wrong answers.
import fs from 'node:fs'
import { feature, neighbors } from 'topojson-client'
import { geoBounds, geoCentroid, geoContains, geoDistance } from 'd3-geo'

// Everything outside this window is an overseas territory as far as the Europe
// set is concerned: it should not drag the zoom frame across the Atlantic.
const WINDOW = { lon: [-25, 45], lat: [34, 72] }

// Russia spans a third of the globe, so the window trick is not enough.
const MANUAL_FOCUS = { RU: [19, 43, 60, 68] }

// Borders that the topology cannot supply, because the country is too small to
// have survived quantization as a polygon. Applied both ways.
const MANUAL_BORDERS = { VA: ['IT'] }

const NEAR_COUNT = 6

const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))
const topo = JSON.parse(fs.readFileSync('src/data/europe.topo.json', 'utf8'))
const geoms = topo.objects.countries.geometries
const feats = feature(topo, topo.objects.countries).features

const byId = new Map(feats.map((f) => [f.properties.id, f]))
const isoByUn = new Map(data.countries.map((c) => [c.un, c.iso]))

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

// The mainland part of a country: inside the Europe window, and not a speck.
// Both filters exist to stop an outlying islet from stretching the zoom frame.
function europeanParts(f) {
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

for (const c of data.countries) {
  const f = byId.get(c.un)
  // A microstate with no polygon is anchored on its capital instead.
  const focus = MANUAL_FOCUS[c.iso]
    ? MANUAL_FOCUS[c.iso]
    : f
      ? geoBounds(europeanParts(f)).flat()
      : [c.capitalCoords[0] - 0.5, c.capitalCoords[1] - 0.4, c.capitalCoords[0] + 0.5, c.capitalCoords[1] + 0.4]

  centroids.set(c.iso, f ? geoCentroid(europeanParts(f)) : c.capitalCoords)
  derived[c.iso] = { focus: focus.map((n) => +n.toFixed(3)) }
}

// Nearby countries: land borders first, then the closest by centroid distance.
for (const c of data.countries) {
  const here = centroids.get(c.iso)
  const byDistance = data.countries
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

/**
 * Decoy points for the "point at the capital" round: places inside the country
 * that are not its capital. Generated here rather than at play time because it
 * needs the geometry, and because a decoy that lands in the sea or in a
 * neighbour would make the question unfair.
 */
const DECOYS_WANTED = 6

for (const c of data.countries) {
  const f = byId.get(c.un)
  const decoys = []
  if (f) {
    // The mainland frame, not the raw bounds: for Russia the latter reaches
    // Kamchatka and the sweep lands almost entirely outside Europe.
    const [x0, y0, x1, y1] = derived[c.iso].focus
    const span = Math.max(x1 - x0, y1 - y0)
    // Far enough from the capital to be a real choice, far enough from each
    // other not to overlap on screen. Scaled to the country's own size.
    const minFromCapital = Math.max(0.25, span * 0.16)
    const minApart = Math.max(0.2, span * 0.13)

    // A fixed sweep rather than random sampling, so the set is stable between
    // builds and the same question always looks the same.
    const steps = 26
    for (let i = 0; i < steps && decoys.length < DECOYS_WANTED; i++) {
      for (let j = 0; j < steps && decoys.length < DECOYS_WANTED; j++) {
        const lon = x0 + ((x1 - x0) * (i + 0.5)) / steps
        const lat = y0 + ((y1 - y0) * (j + 0.5)) / steps
        const point = [lon, lat]
        if (!geoContains(f, point)) continue
        if (geoDistance(point, c.capitalCoords) * 57.3 < minFromCapital) continue
        if (decoys.some((d) => geoDistance(point, d) * 57.3 < minApart)) continue
        decoys.push([+lon.toFixed(3), +lat.toFixed(3)])
      }
    }
  }
  derived[c.iso].decoys = decoys
}

const tooFew = data.countries.filter((c) => derived[c.iso].decoys.length < 3)

// Map colouring: give every country one of a few palette slots so that no two
// countries sharing a border get the same one. Greedy over the most-connected
// countries first, which is what keeps it down to a handful of colours.
const PALETTE_SIZE = 6
const order = data.countries
  .map((c) => c.iso)
  .sort((a, b) => derived[b].borders.length - derived[a].borders.length)

for (const iso of order) {
  const taken = new Set(derived[iso].borders.map((n) => derived[n]?.color).filter((v) => v !== undefined))
  let slot = 0
  while (taken.has(slot) && slot < PALETTE_SIZE - 1) slot++
  derived[iso].color = slot
}

const clashes = data.countries.flatMap((c) =>
  derived[c.iso].borders
    .filter((n) => derived[n].color === derived[c.iso].color)
    .map((n) => `${c.iso}-${n}`),
)

fs.writeFileSync('src/data/derived.json', JSON.stringify(derived, null, 2) + '\n')

const wide = Object.entries(derived).filter(([, d]) => d.focus[2] - d.focus[0] > 30)
console.log(`derived entries: ${Object.keys(derived).length}`)
console.log(`decoy capitals: countries with fewer than 3: ${tooFew.map((c) => `${c.iso}(${derived[c.iso].decoys.length})`).join(', ') || 'none'}`)
console.log(`colour slots used: ${new Set(Object.values(derived).map((d) => d.color)).size}, neighbours sharing a colour: ${clashes.length ? clashes.join(', ') : 'none'}`)
console.log(`landlocked-by-data (no land borders): ${Object.entries(derived).filter(([, d]) => !d.borders.length).map(([iso]) => iso).join(', ')}`)
console.log(`focus wider than 30 deg: ${wide.map(([iso, d]) => `${iso} ${d.focus.join(',')}`).join(' | ') || 'none'}`)
console.log('samples:')
for (const iso of ['PL', 'FR', 'RU', 'VA', 'IS', 'MT']) {
  console.log(`  ${iso.padEnd(3)} focus ${derived[iso].focus.join(', ')}  near ${derived[iso].near.join(',')}`)
}
