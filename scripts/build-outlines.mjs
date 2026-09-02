// Draws a small silhouette of each continent, so the set can be chosen from a
// picture rather than from a word. The five year old cannot read the names.
//
// Output is a path per set in a fixed viewBox, written into src/data/
// outlines.json and rendered by the continent screen.
import fs from 'node:fs'
import { feature } from 'topojson-client'
import { geoConicConformal, geoNaturalEarth1 } from 'd3-geo'
import { CONTINENTS, topoPath } from './continents.mjs'

const W = 120
const H = 84

const out = {}
for (const continent of CONTINENTS) {
  const topo = JSON.parse(fs.readFileSync(topoPath(continent.id), 'utf8'))
  const shapes = feature(topo, topo.objects.countries).features

  const [[minLon, minLat], [maxLon, maxLat]] = continent.frame
  const coordinates = []
  for (let lon = minLon; lon <= maxLon; lon += 2) {
    for (let lat = minLat; lat <= maxLat; lat += 2) coordinates.push([lon, lat])
  }
  const base =
    continent.projection.type === 'conic'
      ? geoConicConformal().parallels(continent.projection.parallels)
      : geoNaturalEarth1()
  const projection = base
    .rotate([continent.projection.rotate, 0])
    .fitSize([W, H], { type: 'MultiPoint', coordinates })

  // Full geometry at this size is a megabyte of noise, so the rings are
  // thinned in pixel space: points closer together than half a pixel cannot
  // show, and an island smaller than a couple of pixels is a speck.
  const MIN_STEP = 0.6
  const MIN_RING_AREA = 1.5

  const ringPath = (ring) => {
    const pts = []
    for (const coord of ring) {
      const p = projection(coord)
      if (!p) continue
      const last = pts[pts.length - 1]
      if (last && Math.abs(p[0] - last[0]) < MIN_STEP && Math.abs(p[1] - last[1]) < MIN_STEP) continue
      pts.push(p)
    }
    if (pts.length < 4) return ''
    let area = 0
    for (let i = 0, n = pts.length - 1; i < n; i++) {
      area += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]
    }
    if (Math.abs(area / 2) < MIN_RING_AREA) return ''
    const at = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`
    return `M${at(pts[0])}` + pts.slice(1).map((p) => `L${at(p)}`).join('') + 'Z'
  }

  const draw = (playable) =>
    shapes
      .filter((s) => s.properties.playable === playable)
      .flatMap((s) =>
        s.geometry.type === 'Polygon' ? [s.geometry.coordinates] : s.geometry.coordinates,
      )
      .flatMap((poly) => poly.map(ringPath))
      .filter(Boolean)
      .join('')

  out[continent.id] = { width: W, height: H, land: draw(true), backdrop: draw(false) }
  const kb = ((out[continent.id].land.length + out[continent.id].backdrop.length) / 1024).toFixed(1)
  console.log(`${continent.id}: outline ${kb} KB`)
}

fs.writeFileSync('src/data/outlines.json', JSON.stringify(out) + '\n')
