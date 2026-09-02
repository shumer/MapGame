import { derived } from '../data'

/**
 * Decoration for the empty water, the way a children's atlas fills it: a
 * compass rose, wave ticks, a boat and a whale. Placed in geographic
 * coordinates so they sit in real open sea and move with the map, and made
 * inert so they never swallow a tap meant for a country.
 */

/** [lon, lat] spots chosen to be open water in every direction. */
const SPOTS = {
  compass: [-19.5, 45.5],
  boat: [-13, 38.5],
  whale: [-11.5, 57.5],
  waves: [
    [-21, 51],
    [-16, 49],
    [-9.5, 45.5],
    [-15.5, 42],
    [-8, 34.5],
    [2.5, 36.2],
    [17.5, 34.6],
    [28.5, 34.2],
    [5.5, 55.5],
    [1, 61],
    [13, 63.5],
    [20.5, 57.5],
    [30.5, 61.5],
    [36.5, 43.5],
    [-5, 63],
  ],
} as const

type Project = (coords: [number, number]) => [number, number] | null

export function SeaDecor({ project, scale }: { project: Project; scale: number }) {
  // Decoration is drawn at map scale, so it shrinks as the map zooms in; past a
  // certain zoom it would be huge and in the way, so it fades out instead.
  if (scale > 3) return null

  const at = (coords: readonly [number, number]) => project([coords[0], coords[1]])
  const compass = at(SPOTS.compass)
  const boat = at(SPOTS.boat)
  const whale = at(SPOTS.whale)

  return (
    <g className="sea-decor" aria-hidden="true">
      {SPOTS.waves.map((spot, i) => {
        const p = at(spot)
        if (!p) return null
        return (
          <path
            key={i}
            className="wave"
            d={`M${p[0] - 9} ${p[1]}q4.5-4 9 0t9 0`}
            transform={`rotate(${(i % 3) * 4 - 4} ${p[0]} ${p[1]})`}
          />
        )
      })}

      {compass && (
        <g className="compass" transform={`translate(${compass[0]} ${compass[1]})`}>
          <circle className="compass-ring" r="17" />
          <circle className="compass-ring-inner" r="12" />
          <path className="compass-needle-n" d="M0-16L4.5 0 0 4-4.5 0z" />
          <path className="compass-needle-s" d="M0 16L4.5 0 0-4-4.5 0z" />
          <circle className="compass-pin" r="2.4" />
          <path className="compass-tick" d="M-17 0h5M12 0h5" />
        </g>
      )}

      {boat && (
        <g className="boat" transform={`translate(${boat[0]} ${boat[1]})`}>
          <path className="boat-hull" d="M-11 4h22l-4 6h-14z" />
          <path className="boat-mast" d="M0 3V-9" />
          <path className="boat-sail" d="M1-9l8 11H1z" />
          <path className="boat-sail-back" d="M-1-8l-7 10h7z" />
        </g>
      )}

      {whale && (
        <g className="whale" transform={`translate(${whale[0]} ${whale[1]})`}>
          <path className="whale-body" d="M-12 2q3-7 11-7t10 6q-4 4-11 4t-10-3z" />
          <path className="whale-tail" d="M11 1l7-5 1 8z" />
          <path className="whale-spout" d="M-3-6q-1-5 1-7M-1-6q2-4 4-5" />
          <circle className="whale-eye" cx="-5" cy="-1" r="1.2" />
        </g>
      )}
    </g>
  )
}

/** Countries whose colour slot is unused, kept so the palette stays honest. */
export const PALETTE_SLOTS = new Set(Object.values(derived).map((d) => d.color))
