import raw from './continents.json'
import type { Continent, Region } from './types'

/** The playable sets, in the order they are offered to a child. */
export const continents = (raw as { continents: unknown[] }).continents as unknown as Continent[]

const byId = new Map(continents.map((c) => [c.id, c]))

export const continentById = (id: Region): Continent => {
  const found = byId.get(id)
  if (!found) throw new Error(`no continent named "${id}"`)
  return found
}

/** The set a fresh profile starts on. */
export const DEFAULT_CONTINENT: Region = 'europe'
