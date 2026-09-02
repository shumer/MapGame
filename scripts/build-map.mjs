// Builds a trimmed TopoJSON for the Europe set from the full 10m world atlas.
// Keeps the playable countries plus a ring of neighbours drawn as inert backdrop.
import fs from 'node:fs'
import { feature } from 'topojson-client'
import topojsonServer from 'topojson-server'
import { geoArea } from 'd3-geo'

const { topology } = topojsonServer

// Coordinate grid. Coarser means a smaller file and more collapsed islets.
const QUANT = Number(process.env.QUANT ?? 1e4)

// Neighbours shown greyed out so the Europe frame does not end in nothing.
const BACKDROP = [
  '792', '504', '012', '788', '434', '818', '760', '422', '376', '368',
  '364', '268', '051', '031', '398', '795', '860', '304', '400', '682',
]

// Natural Earth carries Kosovo with no ISO numeric code, so it matches neither
// list and leaves a hole in the Balkans with the sea showing through. It is not
// one of the playable countries, so it joins the backdrop under its own id.
const BACKDROP_BY_NAME = new Map([['Kosovo', 'XKX']])

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

const playable = new Set(data.countries.map((c) => c.un))
const backdrop = new Set(BACKDROP)
const idOf = (f) =>
  BACKDROP_BY_NAME.get(f.properties.name) ?? String(f.id).padStart(3, '0')
const keep = world.features.filter((f) => {
  const id = idOf(f)
  return playable.has(id) || backdrop.has(id) || BACKDROP_BY_NAME.has(f.properties.name)
})

for (const f of keep) {
  const id = idOf(f)
  f.properties = { id, playable: playable.has(id) }
}

// Quantize, then clean up what quantization flattened, then quantize again from
// the cleaned shapes. Removing a feature shifts the bounding box and therefore
// the grid, so this repeats until nothing else collapses.
const dropped = new Set()
let features = keep
let out
for (let pass = 0; pass < 5; pass++) {
  out = topology({ countries: { type: 'FeatureCollection', features } }, QUANT)
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
fs.writeFileSync('src/data/europe.topo.json', JSON.stringify(out))

const kb = (fs.statSync('src/data/europe.topo.json').size / 1024).toFixed(0)
console.log(`quantization: ${QUANT.toExponential()}`)
console.log(`features: ${features.length} (playable ${playable.size}, backdrop ${keep.length - playable.size})`)
if (dropped.size) {
  const all = [...dropped]
  const lost = all.filter((id) => playable.has(id))
  console.log(`dropped entirely: ${all.join(', ')}${lost.length ? `  <- playable, needs a marker: ${lost.join(', ')}` : ''}`)
}
console.log(`src/data/europe.topo.json: ${kb} KB`)
