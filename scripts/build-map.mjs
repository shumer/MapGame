// Builds a trimmed TopoJSON per continent from the full 10m world atlas. Each
// set keeps its playable countries plus a ring of neighbours drawn as inert
// backdrop, so the frame does not end in nothing.
import fs from 'node:fs'
import { feature } from 'topojson-client'
import topojsonServer from 'topojson-server'
import { geoArea } from 'd3-geo'
import { CONTINENTS, membersOf, topoPath } from './continents.mjs'

const { topology } = topojsonServer

// Coordinate grid. Coarser means a smaller file and more collapsed islets.
const QUANT = Number(process.env.QUANT ?? 1e4)

// Signed area of a ring. Zero means the ring collapsed onto a line or a point,
// which d3-geo goes on to read as a ring covering the whole sphere.
function ringArea(ring) {
  let a = 0
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return Math.abs(a / 2)
}

// Snapping to the grid can leave an outer ring wound the wrong way, which on a
// sphere means the ring covers everything except the shape. Flip those back.
function fixWinding(poly) {
  if (poly.length && geoArea({ type: 'Polygon', coordinates: [poly[0]] }) > 2 * Math.PI) {
    poly[0] = poly[0].slice().reverse()
  }
  return poly
}

// Drops rings that quantization flattened, and polygons left without an outer ring.
function dropCollapsedRings(geom) {
  const clean = (poly) => fixWinding(poly.filter((ring) => ring.length >= 4 && ringArea(ring) > 0))
  if (geom.type === 'Polygon') {
    const rings = clean(geom.coordinates)
    return rings.length ? { type: 'Polygon', coordinates: rings } : null
  }
  const polys = geom.coordinates.map(clean).filter((p) => p.length)
  return polys.length ? { type: 'MultiPolygon', coordinates: polys } : null
}

const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json', 'utf8'))
const world = feature(topo, topo.objects.countries)

console.log(`quantization: ${QUANT.toExponential()}`)

for (const continent of CONTINENTS) {
  // Natural Earth carries a few places with no ISO numeric code (Kosovo, for
  // one), so they match neither list and leave a hole with the sea showing
  // through. The config names them and gives them an id of their own.
  const byName = new Map(Object.entries(continent.backdropByName ?? {}))
  const playable = new Set(membersOf(data.countries, continent.id).map((c) => c.un))
  const backdrop = new Set(continent.backdrop)
  // Natural Earth leaves a few places without an ISO numeric code. Named ones
  // are listed in the config; the rest get an id from their name, so they stay
  // separate shapes instead of merging into one blob called "undefined".
  const idOf = (f) =>
    byName.get(f.properties.name) ??
    (f.id === undefined
      ? 'x-' + String(f.properties.name ?? 'unnamed').toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : String(f.id).padStart(3, '0'))

  const excluded = new Set(continent.exclude ?? [])
  const keep = world.features
    .filter((f) => {
      if (excluded.has(idOf(f))) return false
      if (continent.backdropRest) return true
      const id = idOf(f)
      return playable.has(id) || backdrop.has(id) || byName.has(f.properties.name)
    })
    .map((f) => {
      const id = idOf(f)
      return { ...f, properties: { id, playable: playable.has(id) } }
    })

  // Quantize, then clean up what quantization flattened, then quantize again
  // from the cleaned shapes. Removing a feature shifts the bounding box and so
  // the grid, which is why this repeats until nothing else collapses.
  // A world map is coarser on purpose: at that scale the extra detail cannot
  // be seen and would double what the tablet has to cache offline.
  const quant = continent.quant ?? QUANT
  const dropped = new Set()
  let features = keep
  let out
  for (let pass = 0; pass < 5; pass++) {
    out = topology({ countries: { type: 'FeatureCollection', features } }, quant)
    const expanded = feature(out, out.objects.countries).features
    const cleaned = []
    let changed = false
    for (const f of expanded) {
      const geometry = dropCollapsedRings(f.geometry)
      if (!geometry) {
        dropped.add(f.properties.id)
        changed = true
        continue
      }
      if (JSON.stringify(geometry) !== JSON.stringify(f.geometry)) changed = true
      cleaned.push({ type: 'Feature', id: f.properties.id, properties: f.properties, geometry })
    }
    features = cleaned
    if (!changed) break
  }

  // The file is written from `out`, which was built before the last pass
  // cleaned it, so a shape can be listed as dropped and still be in there.
  // Report only what actually failed to make it.
  const survived = new Set(features.map((f) => f.properties.id))
  for (const id of [...dropped]) if (survived.has(id)) dropped.delete(id)

  const path = topoPath(continent.id)
  fs.writeFileSync(path, JSON.stringify(out))
  const kb = (fs.statSync(path).size / 1024).toFixed(0)
  console.log(
    `${continent.id}: ${features.length} features (playable ${playable.size}, backdrop ${keep.length - playable.size}), ${kb} KB at ${quant.toExponential()}`,
  )
  if (dropped.size) {
    const all = [...dropped]
    const lost = all.filter((id) => playable.has(id))
    console.log(
      `  dropped entirely: ${all.join(', ')}${lost.length ? `  <- playable, needs a marker: ${lost.join(', ')}` : ''}`,
    )
  }
}
