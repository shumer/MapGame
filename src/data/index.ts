import animalsRaw from './animals.json'
import raw from './countries.json'
import derivedRaw from './derived.json'
import wikiRaw from './country-facts.json'
import type { Animal, AnimalData, Country, CountryData, DerivedData, Lang, Region } from './types'
import { continentById } from './continents'

export * from './types'
export * from './continents'

// JSON imports widen tuples to arrays, so the shape is asserted rather than checked.
// scripts/validate-data.mjs is what actually guarantees it.
/** Every country the game knows, across all sets. */
export const countries = (raw as CountryData).countries
export const derived = derivedRaw as unknown as DerivedData

/**
 * The countries of one set, in data order.
 *
 * A set marked `collects` takes everybody who belongs to any other set, so the
 * world set fills itself: adding a continent adds it to the world too.
 */
export const countriesOf = (region: Region): Country[] =>
  continentById(region).collects
    ? countries.filter((c) => c.regions.length > 0)
    : countries.filter((c) => c.regions.includes(region))

/** Map-dependent data for one set: neighbours, zoom frames, colours, facts. */
export const derivedOf = (region: Region) => derived[region]

/** Every animal the game knows about. */
export const animals = (animalsRaw as AnimalData).animals

const livesInIso = new Map<string, Animal[]>()
for (const animal of animals) {
  for (const iso of animal.livesIn) {
    const list = livesInIso.get(iso) ?? []
    list.push(animal)
    livesInIso.set(iso, list)
  }
}

/** The animals that live in a country, in data order. */
export const animalsOf = (iso: string): Animal[] => livesInIso.get(iso) ?? []

/** Countries with at least one animal, which is what the animal round asks about. */
export const countriesWithAnimals = (region: Region): Country[] =>
  countriesOf(region).filter((c) => livesInIso.has(c.iso))

/** Facts pulled from Wikidata, keyed by ISO code. See scripts/fetch-facts.mjs. */
export const wikiFacts = wikiRaw as Record<string, Record<string, string | number | boolean>>

const byIso = new Map(countries.map((c) => [c.iso, c]))
const byUn = new Map(countries.map((c) => [c.un, c]))

export const countryByIso = (iso: string): Country | undefined => byIso.get(iso)
export const countryByUn = (un: string): Country | undefined => byUn.get(un)

/** Sorted so a round can start with the countries a child is likeliest to know. */
export const byFame = (region: Region, fame: 1 | 2 | 3): Country[] =>
  countriesOf(region).filter((c) => c.fame === fame)

export const speechLocale: Record<Lang, string> = {
  ru: 'ru-RU',
  pl: 'pl-PL',
  en: 'en-GB',
}
