// Shared access to src/data/continents.json: every build script works one
// continent at a time, and this is where the list comes from.
import fs from 'node:fs'

const raw = JSON.parse(fs.readFileSync('src/data/continents.json', 'utf8'))

/** The playable sets, in the order they are offered. */
export const CONTINENTS = raw.continents

export const continentById = (id) => CONTINENTS.find((c) => c.id === id)

/** Path of the generated topology for a set. */
export const topoPath = (id) => `src/data/${id}.topo.json`

/**
 * The countries belonging to a set, in the order they appear in the data.
 *
 * A set marked `collects` takes everybody who belongs to any other set, so the
 * world set fills itself: adding Africa adds it to the world too, with nothing
 * to remember and nothing to keep in step.
 */
export const membersOf = (countries, id) => {
  const set = continentById(id)
  if (set?.collects) return countries.filter((c) => c.regions.length > 0)
  return countries.filter((c) => c.regions.includes(id))
}
