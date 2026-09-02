import planeUrl from '../assets/art/plane.svg?url'
import birdUrl from '../assets/art/decor/bird.svg?url'
import './Flybys.css'

/**
 * Things that pass overhead: a plane and a pair of birds. They are in the air,
 * so screen space is right for them — they read as flying over the map rather
 * than travelling on it. Anything that belongs on the ground or the water is in
 * Travellers instead, on a route that respects the coastline.
 */
export function Flybys() {
  return (
    <div className="flybys" aria-hidden="true">
      <img className="flyby flyby-plane" src={planeUrl} alt="" />
      <img className="flyby flyby-bird flyby-bird-a" src={birdUrl} alt="" />
      <img className="flyby flyby-bird flyby-bird-b" src={birdUrl} alt="" />
    </div>
  )
}
