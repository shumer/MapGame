import boatUrl from '../assets/art/decor/boat.svg?url'
import carUrl from '../assets/art/decor/car.svg?url'
import './Travellers.css'

/**
 * A boat and a car that wander the map along routes that make sense: the boat
 * keeps to open water, the car to land. Both follow a path built from real
 * coordinates, so they move with the map rather than sliding over it.
 *
 * The plane and the birds stay in screen space (see Flybys) — they are in the
 * air, and the air is everywhere.
 */

/** Open water: out of the Atlantic, through Gibraltar, along the Mediterranean. */
const SEA_ROUTE: [number, number][] = [
  [-14, 43], [-11.5, 39.5], [-9.8, 36.6], [-6.2, 35.95], [-4.4, 36.05],
  [-1, 36.4], [3, 37.1], [6.5, 37.8], [9.5, 37.9], [12.5, 36.9],
  [15.6, 35.8], [19, 34.9], [23, 34.5], [26, 34.8],
]

/** Overland, roughly the old road east: France, Germany, Czechia, Poland. */
const LAND_ROUTE: [number, number][] = [
  [-1.5, 47.5], [2.4, 48.2], [6.1, 49.1], [9.2, 48.8],
  [12.5, 49.5], [16.6, 49.2], [19.9, 50.1], [23.5, 50.5],
]

type Project = (coords: [number, number]) => [number, number] | null

/** A smooth path through the points, in projected pixels. */
function routePath(points: [number, number][], project: Project): string {
  const pts = points.map(project).filter((p): p is [number, number] => p !== null)
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cx = (prev[0] + curr[0]) / 2
    const cy = (prev[1] + curr[1]) / 2
    d += ` Q${prev[0]} ${prev[1]} ${cx} ${cy}`
  }
  const last = pts[pts.length - 1]
  d += ` L${last[0]} ${last[1]}`
  return d
}

export function Travellers({ project }: { project: Project }) {
  const sea = routePath(SEA_ROUTE, project)
  const land = routePath(LAND_ROUTE, project)
  if (!sea || !land) return null

  return (
    <g className="travellers" aria-hidden="true">
      <image
        className="traveller traveller-boat"
        href={boatUrl}
        width={26}
        height={26}
        x={-13}
        y={-13}
        style={{ offsetPath: `path("${sea}")` }}
      />
      <image
        className="traveller traveller-car"
        href={carUrl}
        width={16}
        height={16}
        x={-8}
        y={-8}
        style={{ offsetPath: `path("${land}")` }}
      />
    </g>
  )
}
