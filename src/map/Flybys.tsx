import planeUrl from '../assets/art/plane.svg?url'
import './Flybys.css'

/**
 * A plane crossing the map. Three of them share one long cycle with staggered
 * delays, so what the player sees is a single plane taking a different route
 * each time: high and eastbound, low and westbound, then across the middle.
 *
 * The routes are geographic, and the plane rides inside the zoom transform, so
 * zooming carries it off the edge with the rest of the map instead of leaving
 * it hanging in the middle of the screen.
 */

/** [lon, lat] waypoints. They zigzag on purpose — a straight line reads as a
    sprite sliding across the screen rather than a plane flying. */
const HIGH_ROUTE: [number, number][] = [
  [-30, 62], [-19, 67], [-7, 62.5], [5, 68], [17, 63], [29, 68.5], [42, 64], [54, 67],
]
const LOW_ROUTE: [number, number][] = [
  [52, 36], [40, 32.5], [27, 37], [15, 32.5], [2, 37], [-11, 33], [-24, 37.5], [-34, 34],
]
const MID_ROUTE: [number, number][] = [
  [-32, 44], [-20, 52], [-7, 45], [7, 53], [20, 46], [33, 54], [46, 47], [56, 51],
]

type Project = (coords: [number, number]) => [number, number] | null

/** A smooth path through the waypoints, in projected pixels. */
function routePath(points: [number, number][], project: Project): string {
  const pts = points.map(project).filter((p): p is [number, number] => p !== null)
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    d += ` Q${prev[0]} ${prev[1]} ${(prev[0] + curr[0]) / 2} ${(prev[1] + curr[1]) / 2}`
  }
  const last = pts[pts.length - 1]
  d += ` L${last[0]} ${last[1]}`
  return d
}

export function Flybys({ project }: { project: Project }) {
  const high = routePath(HIGH_ROUTE, project)
  const low = routePath(LOW_ROUTE, project)
  const mid = routePath(MID_ROUTE, project)
  if (!high || !low || !mid) return null

  return (
    <g className="flybys" aria-hidden="true">
      <image
        className="flyby-plane plane-high"
        href={planeUrl}
        width={40}
        height={40}
        x={-20}
        y={-20}
        style={{ offsetPath: `path("${high}")` }}
      />
      <image
        className="flyby-plane plane-low"
        href={planeUrl}
        width={34}
        height={34}
        x={-17}
        y={-17}
        style={{ offsetPath: `path("${low}")` }}
      />
      <image
        className="flyby-plane plane-mid"
        href={planeUrl}
        width={38}
        height={38}
        x={-19}
        y={-19}
        style={{ offsetPath: `path("${mid}")` }}
      />
    </g>
  )
}
