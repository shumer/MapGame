import planeUrl from '../assets/art/plane.svg?url'
import './Flybys.css'

/**
 * A plane crossing the map. Three of them share one long cycle with staggered
 * delays, so what the player sees is a single plane taking a different route
 * each time: high and eastbound, low and westbound, then across the middle.
 * Screen space is right for it — it reads as flying over the map rather than
 * travelling on it.
 */
export function Flybys() {
  return (
    <div className="flybys" aria-hidden="true">
      <img className="flyby flyby-plane plane-high" src={planeUrl} alt="" />
      <img className="flyby flyby-plane plane-low" src={planeUrl} alt="" />
      <img className="flyby flyby-plane plane-mid" src={planeUrl} alt="" />
    </div>
  )
}
