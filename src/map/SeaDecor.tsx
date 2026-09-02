import compassUrl from '../assets/art/decor/compass.svg?url'
import whaleUrl from '../assets/art/decor/whale.svg?url'
import boatUrl from '../assets/art/decor/boat.svg?url'

/**
 * Decoration for the empty water, the way a children's atlas fills it: a
 * compass rose, wave ticks, a boat and a whale. Placed in geographic
 * coordinates so they sit in real open sea and move with the map, and made
 * inert so they never swallow a tap meant for a country.
 */

/** [lon, lat] spots chosen to be open water in every direction. */
const SPOTS = {
  compass: [-23, 35.5],
  boat: [-13, 38.5],
  whale: [-15.5, 58.5],
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

export function SeaDecor({ project }: { project: Project }) {
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

      {compass && <image href={compassUrl} x={compass[0] - 19} y={compass[1] - 19} width={38} height={38} />}
      {boat && <image href={boatUrl} x={boat[0] - 17} y={boat[1] - 17} width={34} height={34} />}
      {whale && <image href={whaleUrl} x={whale[0] - 22} y={whale[1] - 22} width={44} height={44} />}
    </g>
  )
}
