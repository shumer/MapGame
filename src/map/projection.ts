import { geoConicConformal, geoNaturalEarth1, geoPath } from 'd3-geo'
import type { GeoProjection, GeoPath } from 'd3-geo'
import type { Continent } from '../data'
import type { CountryShape } from './topology'

/**
 * A conic projection standing in for the Lambert one used on school maps:
 * Scandinavia keeps its real size instead of ballooning as it does on Mercator,
 * and the shapes children learn here match the atlas they will see. Each
 * continent brings its own frame and standard parallels, because one pair
 * cannot serve both the Arctic and the equator.
 */
export function createProjection(
  width: number,
  height: number,
  continent: Continent,
): GeoProjection {
  // Fit to a grid of points rather than a rectangle: a conic projection bends
  // parallels, and fitting a four-corner polygon sends it through its own
  // singularity and collapses the scale to nothing.
  const [[minLon, minLat], [maxLon, maxLat]] = continent.frame
  const coordinates: [number, number][] = []
  for (let lon = minLon; lon <= maxLon; lon += 2) {
    for (let lat = minLat; lat <= maxLat; lat += 2) {
      coordinates.push([lon, lat])
    }
  }
  const frame = { type: 'MultiPoint' as const, coordinates }

  const projection =
    continent.projection.type === 'conic'
      ? geoConicConformal().parallels(continent.projection.parallels)
      : // A conic projection needs both standard parallels on the same side of
        // the equator. A set that crosses it gets Natural Earth, which holds
        // shapes recognisably from the tropics to the Arctic.
        geoNaturalEarth1()

  return projection.rotate([continent.projection.rotate, 0]).fitSize([width, height], frame)
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
