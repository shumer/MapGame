import planeUrl from '../assets/art/plane.svg?url'
import boatUrl from '../assets/art/decor/boat.svg?url'
import carUrl from '../assets/art/decor/car.svg?url'
import birdUrl from '../assets/art/decor/bird.svg?url'
import './Flybys.css'

/**
 * Things that wander across the map while the child is thinking: a plane, a
 * boat, a car, a pair of birds. They are decoration only — inert, above the
 * map but below the markers, and each spends most of its cycle off screen so
 * the map stays calm rather than busy.
 *
 * Deliberately in screen space rather than map coordinates: they read as
 * passing over the map, so they need not survive zooming.
 */
export function Flybys() {
  return (
    <div className="flybys" aria-hidden="true">
      <img className="flyby flyby-plane" src={planeUrl} alt="" />
      <img className="flyby flyby-boat" src={boatUrl} alt="" />
      <img className="flyby flyby-car" src={carUrl} alt="" />
      <img className="flyby flyby-bird flyby-bird-a" src={birdUrl} alt="" />
      <img className="flyby flyby-bird flyby-bird-b" src={birdUrl} alt="" />
    </div>
  )
}
