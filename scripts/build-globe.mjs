// The globe on the continent screen spins, which means its geometry is
// reprojected on every frame. That rules out the country maps: 245 shapes take
// 107 ms a frame. This is the coarse land outline instead, one shape, about
// two milliseconds, and it only ever has to look like the Earth from far away.
//
// Also works out where each continent sits, so the globe can turn to face it.
import fs from 'node:fs'
import { feature } from 'topojson-client'
import { geoCentroid } from 'd3-geo'
import { CONTINENTS, membersOf, topoPath } from './continents.mjs'

const land = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json', 'utf8'))
const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))

// Averaging every country puts North America in the Caribbean, because that is
// where most of its countries are, and Oceania out in the empty Pacific.
const MANUAL_CENTRE = { namerica: [-100, 40], oceania: [140, -22] }

const centres = {}
for (const continent of CONTINENTS) {
  const topo = JSON.parse(fs.readFileSync(topoPath(continent.id), 'utf8'))
  const shapes = feature(topo, topo.objects.countries).features
  const members = new Set(membersOf(data.countries, continent.id).map((c) => c.un))
  const playable = shapes.filter((f) => members.has(f.properties.id))

  // Averaging centroids rather than taking the centroid of everything at once:
  // a set spanning the antimeridian would otherwise centre on the wrong side.
  const points = playable.map((f) => geoCentroid(f)).filter((p) => Number.isFinite(p[0]))
  const mean = points.reduce(
    (acc, [lon, lat]) => {
      const rad = (lon * Math.PI) / 180
      return [acc[0] + Math.cos(rad), acc[1] + Math.sin(rad), acc[2] + lat]
    },
    [0, 0, 0],
  )
  const lon = (Math.atan2(mean[1] / points.length, mean[0] / points.length) * 180) / Math.PI
  const lat = mean[2] / points.length
  centres[continent.id] =
    MANUAL_CENTRE[continent.id] ?? [Number(lon.toFixed(1)), Number(lat.toFixed(1))]
}

fs.writeFileSync('src/data/globe.json', JSON.stringify({ land, centres }) + '\n')

const kb = (fs.statSync('src/data/globe.json').size / 1024).toFixed(0)
console.log(`globe: ${kb} KB`)
for (const [id, c] of Object.entries(centres)) console.log(`  ${id}: ${c.join(', ')}`)
