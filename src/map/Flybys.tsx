import planeUrl from '../assets/art/plane.svg?url'
import type { Continent } from '../data'
import './Flybys.css'

/**
 * A plane crossing the map. Three of them share one long cycle with staggered
 * delays, so what the player sees is a single plane taking a different route
 * each time: high and eastbound, low and westbound, then across the middle.
 *
 * The routes are geographic and come from the continent config, and the plane
 * rides inside the zoom transform, so zooming carries it off the edge with the
 * rest of the map instead of leaving it hanging in the middle of the screen.
 * They zigzag on purpose: a straight line reads as a sprite sliding across the
 * screen rather than a plane flying.
 */

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

export function Flybys({ project, continent }: { project: Project; continent: Continent }) {
  const high = routePath(continent.flyRoutes.high, project)
  const low = routePath(continent.flyRoutes.low, project)
  const mid = routePath(continent.flyRoutes.mid, project)
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
