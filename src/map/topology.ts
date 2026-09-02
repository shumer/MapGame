import { feature } from 'topojson-client'
import type { Feature, MultiPolygon, Polygon } from 'geojson'
import topoUrl from '../data/europe.topo.json?url'

export interface CountryShape extends Feature<Polygon | MultiPolygon> {
  properties: { id: string; playable: boolean }
}

let cache: Promise<CountryShape[]> | null = null

/** Loads the map once and hands the same shapes to every caller. */
export function loadShapes(): Promise<CountryShape[]> {
  cache ??= fetch(topoUrl)
    .then((r) => {
      if (!r.ok) throw new Error(`map failed to load: ${r.status}`)
      return r.json()
    })
    .then((topo) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fc = feature(topo, topo.objects.countries) as any
      return fc.features as CountryShape[]
    })
  return cache
}
