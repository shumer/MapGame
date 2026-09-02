import { useEffect, useRef, useState } from 'react'
import { geoCircle, geoOrthographic, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import globeData from '../data/globe.json'
import type { Region } from '../data'
import './Globe.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const raw = globeData as any
const land = feature(raw.land, raw.land.objects.land)
const centres = raw.centres as Record<string, [number, number]>

/** Degrees per second while nobody has chosen anything. */
const DRIFT = 6
/** How long the turn towards a chosen continent takes. */
const TURN_MS = 900

const shortestTurn = (from: number, to: number) => {
  const delta = ((to - from + 540) % 360) - 180
  return from + delta
}

/**
 * A slowly turning Earth. Only the coarse land outline is drawn, because the
 * geometry is reprojected on every frame: the country maps take 107 ms a frame
 * and this takes two.
 *
 * Turns to face `facing` when it changes, which is what carries a child from
 * "here is the world" to "here is the part of it we are going to".
 */
export function Globe({
  facing,
  size = 200,
  onSettled,
}: {
  facing: Region | null
  size?: number
  onSettled?: () => void
}) {
  const [rotation, setRotation] = useState<[number, number]>([-15, -20])
  const frame = useRef(0)
  const settle = useRef(onSettled)

  // Kept in a ref so a changing callback does not restart the animation, and
  // written in an effect rather than during render.
  useEffect(() => {
    settle.current = onSettled
  }, [onSettled])

  useEffect(() => {
    const target = facing ? centres[facing] : null
    const start = performance.now()
    let from: [number, number] | null = null

    const step = (now: number) => {
      setRotation((current) => {
        if (!target) {
          // Nothing chosen: drift east, the way a globe on a desk is nudged.
          return [current[0] - (DRIFT * 16.7) / 1000, current[1]]
        }
        from ??= current
        const t = Math.min(1, (now - start) / TURN_MS)
        // Ease out, so it arrives rather than stops.
        const e = 1 - Math.pow(1 - t, 3)
        const lon = shortestTurn(from[0], -target[0])
        const lat = -target[1]
        if (t >= 1) settle.current?.()
        return [from[0] + (lon - from[0]) * e, from[1] + (lat - from[1]) * e]
      })
      frame.current = requestAnimationFrame(step)
    }

    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [facing])

  const projection = geoOrthographic()
    .clipAngle(90)
    .rotate([rotation[0], rotation[1]])
    .fitSize([size, size], { type: 'Sphere' })
  const path = geoPath(projection)

  const here = facing ? centres[facing] : null
  const spot = here ? geoCircle().center(here).radius(22)() : null

  return (
    <svg className="globe" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="presentation">
      <path className="globe-sea" d={path({ type: 'Sphere' }) ?? undefined} />
      <path className="globe-land" d={path(land) ?? undefined} />
      {spot && <path className="globe-spot" d={path(spot) ?? undefined} />}
      {/* A soft edge, so the sphere reads as round rather than as a flat disc. */}
      <circle className="globe-edge" cx={size / 2} cy={size / 2} r={size / 2 - 1} />
    </svg>
  )
}
