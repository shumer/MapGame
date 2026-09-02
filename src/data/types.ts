/** A language the game can show and speak country names in. */
export type Lang = 'ru' | 'pl' | 'en'

export type Localized = Record<Lang, string>

export type Region = 'europe'

export type Subregion = 'west' | 'central' | 'east' | 'nordic' | 'baltic' | 'balkans' | 'south'

export interface Country {
  /** ISO 3166-1 alpha-2, also the flag icon name. */
  iso: string
  /** ISO 3166-1 numeric, links this entry to a polygon in the map topology. */
  un: string
  region: Region
  subregion: Subregion
  /** 1 well known, 3 obscure. Questions start at 1 and work down. */
  fame: 1 | 2 | 3
  /** Too small to click as a polygon: drawn as a marker with a wide hit area. */
  micro: boolean
  name: Localized
  capital: Localized
  /** [lon, lat] of the capital. */
  capitalCoords: [number, number]
  /** Key into the drawn symbol set: the country's animal, landmark or thing. */
  symbol: string
  fact: Localized
}

export interface CountryData {
  version: number
  countries: Country[]
}

export interface Derived {
  /** [minLon, minLat, maxLon, maxLat] of the mainland, for zooming in. */
  focus: [number, number, number, number]
  /** Countries to draw wrong answers from: land borders first, then nearest. */
  near: string[]
  /** Land borders only. */
  borders: string[]
  /** Palette slot, picked so that no two bordering countries share one. */
  color: number
}

export type DerivedData = Record<string, Derived>
