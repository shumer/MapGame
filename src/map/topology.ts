import { feature } from 'topojson-client'
import type { Feature, MultiPolygon, Polygon } from 'geojson'
import type { Region } from '../data'

// Every generated topology, so a set can be loaded by name and only the one
// being played is fetched.
const topoUrls = import.meta.glob('../data/*.topo.json', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface CountryShape extends Feature<Polygon | MultiPolygon> {
  properties: { id: string; playable: boolean }
}

const cache = new Map<Region, Promise<CountryShape[]>>()

/** Loads a continent's map once and hands the same shapes to every caller. */
export function loadShapes(region: Region): Promise<CountryShape[]> {
  const existing = cache.get(region)
  if (existing) return existing

  const url = topoUrls[`../data/${region}.topo.json`]
  if (!url) return Promise.reject(new Error(`no map built for "${region}"`))

  const loading = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`map failed to load: ${r.status}`)
      return r.json()
    })
    .then((topo) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fc = feature(topo, topo.objects.countries) as any
      return fc.features as CountryShape[]
    })
  cache.set(region, loading)
  return loading
}
