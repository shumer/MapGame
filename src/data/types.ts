/** A language the game can show and speak country names in. */
export type Lang = 'ru' | 'pl' | 'en'

export type Localized = Record<Lang, string>

/** A playable set of countries. Europe is the one that exists today. */
export type Region = 'europe' | 'asia' | 'africa' | 'americas' | 'oceania' | 'world'

/** Only ever used to tell "far away" from "next door" when picking wrong
    answers, so the divisions are rough on purpose. */
export type Subregion =
  // Europe
  | 'west'
  | 'central'
  | 'east'
  | 'nordic'
  | 'baltic'
  | 'balkans'
  | 'south'
  // Asia. Named apart from the European ones so that in the world set China is
  // still "far away" from Ukraine.
  | 'east-asia'
  | 'south-asia'
  | 'southeast-asia'
  | 'central-asia'
  | 'middle-east'
  | 'caucasus'
  // Africa
  | 'north-africa'
  | 'west-africa'
  | 'east-africa'
  | 'central-africa'
  | 'southern-africa'

export interface Country {
  /** ISO 3166-1 alpha-2, also the flag icon name. */
  iso: string
  /** ISO 3166-1 numeric, links this entry to a polygon in the map topology. */
  un: string
  /** Every set this country appears in. Russia and Turkey are in two. */
  regions: Region[]
  subregion: Subregion
  /** 1 well known, 3 obscure. Questions start at 1 and work down. */
  fame: 1 | 2 | 3
  /** Too small to click as a polygon: drawn as a marker with a wide hit area. */
  micro: boolean
  /** Stated rather than derived: at this resolution a fjord or a strait can
      read either way, and a fact a child repeats had better be true. */
  landlocked: boolean
  island: boolean
  name: Localized
  capital: Localized
  /** [lon, lat] of the capital. */
  capitalCoords: [number, number]
  /** Key into the drawn symbol set: the country's animal, landmark or thing.
      Optional: not every country has an obvious one, and a wrong picture is
      worse than none. */
  symbol?: string
  /** A written fact. Optional, because the computed ones and the Wikidata ones
      cover a country that has none, and inventing 46 of them would be exactly
      the kind of half-true trivia this game avoids. */
  fact?: Localized
  /** Hand-written facts, fact-checked against sources. Present for the 23
      best-known countries; the rest rely on the computed ones. */
  stories?: Localized[]
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
  /** Facts computed from the map; rendered by src/i18n/facts.ts. */
  facts: { kind: string; count?: number; rank?: number; km2?: number }[]
}

/** Derived data is per set: in another continent a country has other
    neighbours and, because of the four-colour rule, another colour. */
export type DerivedData = Record<Region, Record<string, Derived>>

/** A continent as the game plays it: which slice of the world it frames, how
    that slice is projected, and where the scenery sits. Read from
    src/data/continents.json, the only place any of it is written down. */
export interface Continent {
  id: Region
  name: Localized
  /** Takes every country that belongs to any other set, so the world set fills
      itself as continents are added. */
  collects?: boolean
  /** [[minLon, minLat], [maxLon, maxLat]] the map is fitted to. */
  frame: [[number, number], [number, number]]
  projection: {
    /** Conic suits a set that stays on one side of the equator; Natural Earth
        is for one that crosses it. */
    type: 'conic' | 'naturalEarth1'
    parallels: [number, number]
    rotate: number
  }
  decor: {
    compass: [number, number]
    boat: [number, number]
    whale: [number, number]
    waves: [number, number][]
  }
  /** Geographic waypoints for the plane, one list per crossing. */
  flyRoutes: { high: [number, number][]; low: [number, number][]; mid: [number, number][] }
}
