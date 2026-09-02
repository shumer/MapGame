import raw from './countries.json'
import derivedRaw from './derived.json'
import wikiRaw from './country-facts.json'
import type { Country, CountryData, DerivedData, Lang } from './types'

export * from './types'

// JSON imports widen tuples to arrays, so the shape is asserted rather than checked.
// scripts/validate-data.mjs is what actually guarantees it.
export const countries = (raw as CountryData).countries
export const derived = derivedRaw as unknown as DerivedData

/** Facts pulled from Wikidata, keyed by ISO code. See scripts/fetch-facts.mjs. */
export const wikiFacts = wikiRaw as Record<string, Record<string, string | number>>

const byIso = new Map(countries.map((c) => [c.iso, c]))
const byUn = new Map(countries.map((c) => [c.un, c]))

export const countryByIso = (iso: string): Country | undefined => byIso.get(iso)
export const countryByUn = (un: string): Country | undefined => byUn.get(un)

/** Sorted so a round can start with the countries a child is likeliest to know. */
export const byFame = (fame: 1 | 2 | 3): Country[] => countries.filter((c) => c.fame === fame)

export const speechLocale: Record<Lang, string> = {
  ru: 'ru-RU',
  pl: 'pl-PL',
  en: 'en-GB',
}
