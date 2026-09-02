import compassUrl from '../assets/art/decor/compass.svg?url'
import whaleUrl from '../assets/art/decor/whale.svg?url'
import boatUrl from '../assets/art/decor/boat.svg?url'

import type { Continent } from '../data'

/**
 * Decoration for the empty water, the way a children's atlas fills it: a
 * compass rose, wave ticks, a boat and a whale. Each continent names its own
 * [lon, lat] spots, chosen to be open water in every direction, so they sit in
 * real sea and move with the map. Inert, so they never swallow a tap meant for
 * a country.
 */


type Project = (coords: [number, number]) => [number, number] | null

export function SeaDecor({ project, continent }: { project: Project; continent: Continent }) {
  const at = (coords: readonly [number, number]) => project([coords[0], coords[1]])
  const spots = continent.decor
  const compass = at(spots.compass)
  const boat = at(spots.boat)
  const whale = at(spots.whale)

  return (
    <g className="sea-decor" aria-hidden="true">
      {spots.waves.map((spot, i) => {
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
