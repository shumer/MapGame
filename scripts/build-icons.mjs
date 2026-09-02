// Draws the app icon from the same map the game uses, so the icon is the
// actual outline of Europe rather than a generic globe.
import fs from 'node:fs'
import { feature } from 'topojson-client'
import { geoConicConformal, geoPath } from 'd3-geo'
import sharp from 'sharp'

const SIZE = 512
const SEA = '#cfe9f4'
const LAND = '#2f7d76'
const BACKDROP = '#b9d7e4'
const PIN = '#e2494a'

const topo = JSON.parse(fs.readFileSync('src/data/europe.topo.json', 'utf8'))
const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))
const shapes = feature(topo, topo.objects.countries).features

// Tighter than the in-game frame: the icon is small, so it shows the core only.
const coordinates = []
for (let lon = -12; lon <= 34; lon += 2) {
  for (let lat = 35; lat <= 66; lat += 2) coordinates.push([lon, lat])
}
const projection = geoConicConformal()
  .parallels([40, 62])
  .rotate([-12, 0])
  .fitSize([SIZE * 0.92, SIZE * 0.92], { type: 'MultiPoint', coordinates })
projection.translate([projection.translate()[0] + SIZE * 0.04, projection.translate()[1] + SIZE * 0.04])

const path = geoPath(projection)
const draw = (playable) =>
  shapes
    .filter((s) => s.properties.playable === playable)
    .map((s) => path(s))
    .filter(Boolean)
    .join(' ')

const warsaw = projection(data.countries.find((c) => c.iso === 'PL').capitalCoords)

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${SEA}"/>
  <path d="${draw(false)}" fill="${BACKDROP}" stroke="${SEA}" stroke-width="2" stroke-linejoin="round"/>
  <path d="${draw(true)}" fill="${LAND}" stroke="${SEA}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="${warsaw[0].toFixed(1)}" cy="${warsaw[1].toFixed(1)}" r="26" fill="${PIN}" stroke="#fff" stroke-width="9"/>
</svg>`

fs.mkdirSync('public', { recursive: true })

const png = sharp(Buffer.from(svg))
await png.clone().resize(192, 192).png().toFile('public/icon-192.png')
await png.clone().resize(512, 512).png().toFile('public/icon-512.png')
await png.clone().resize(64, 64).png().toFile('public/favicon.png')
// Maskable icons get cropped to a circle on Android: pad so nothing important
// falls outside the safe area.
await sharp(Buffer.from(svg))
  .resize(410, 410)
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: SEA })
  .png()
  .toFile('public/icon-maskable.png')

console.log('icons: public/icon-192.png, icon-512.png, icon-maskable.png, favicon.png')
