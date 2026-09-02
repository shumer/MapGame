import { geoConicConformal, geoPath } from 'd3-geo'
import type { GeoProjection, GeoPath } from 'd3-geo'
import type { CountryShape } from './topology'

/** The slice of the world the Europe set is framed to. */
export const EUROPE_FRAME: [[number, number], [number, number]] = [
  [-26, 33],
  [46, 72],
]

/**
 * A conic projection standing in for the Lambert one used on school maps of
 * Europe: Scandinavia keeps its real size instead of ballooning as it does on
 * Mercator, and the shapes children learn here match the atlas they will see.
 */
export function createProjection(width: number, height: number): GeoProjection {
  // Fit to a grid of points rather than a rectangle: a conic projection bends
  // parallels, and fitting a four-corner polygon sends it through its own
  // singularity and collapses the scale to nothing.
  const coordinates: [number, number][] = []
  for (let lon = EUROPE_FRAME[0][0]; lon <= EUROPE_FRAME[1][0]; lon += 2) {
    for (let lat = EUROPE_FRAME[0][1]; lat <= EUROPE_FRAME[1][1]; lat += 2) {
      coordinates.push([lon, lat])
    }
  }
  const frame = { type: 'MultiPoint' as const, coordinates }

  return geoConicConformal()
    .parallels([40, 65])
    .rotate([-12, 0])
    .fitSize([width, height], frame)
}

export function createPath(projection: GeoProjection): GeoPath {
  return geoPath(projection)
}

/** Screen-space paths for every shape, computed once per projection. */
export function buildPaths(shapes: CountryShape[], path: GeoPath): Map<string, string> {
  const out = new Map<string, string>()
  for (const s of shapes) {
    const d = path(s)
    if (d) out.set(s.properties.id, d)
  }
  return out
}
