import type { Lang } from '../data'

/**
 * Renders the facts derived in scripts/build-facts.mjs. They are computed from
 * the map rather than written by hand, so they cannot quietly disagree with it
 * which matters more here than anywhere: a wrong fact teaches a child
 * something wrong, and they will repeat it.
 */
export interface DerivedFact {
  kind: string
  count?: number
  rank?: number
  km2?: number
}

/** Russian needs three forms; Polish two beyond the singular. */
const ruPlural = (n: number, one: string, few: string, many: string) => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

const plPlural = (n: number, one: string, few: string, many: string) => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (n === 1) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

/** "441 метр", "154 метра", "777 метров" -- and the Polish equivalents. */
const metres = (n: number, lang: Lang) => {
  const shown = groupDigits(n, lang)
  if (lang === 'ru') return `${shown} ${ruPlural(n, 'метр', 'метра', 'метров')}`
  if (lang === 'pl') return `${shown} ${plPlural(n, 'metr', 'metry', 'metrów')}`
  return `${shown} ${n === 1 ? 'metre' : 'metres'}`
}

const groupDigits = (n: number, lang: Lang) =>
  n.toLocaleString(lang === 'ru' ? 'ru-RU' : lang === 'pl' ? 'pl-PL' : 'en-GB')

type Renderer = (fact: DerivedFact, lang: Lang) => string

const RENDER: Record<string, Renderer> = {
  neighbours: ({ count = 0 }, lang) => {
    if (lang === 'ru') return `У этой страны ${count} ${ruPlural(count, 'сосед', 'соседа', 'соседей')}`
    if (lang === 'pl') return `Ten kraj ma ${count} ${plPlural(count, 'sąsiada', 'sąsiadów', 'sąsiadów')}`
    return `This country has ${count} neighbour${count === 1 ? '' : 's'}`
  },
  manyNeighbours: ({ count = 0 }, lang) => {
    if (lang === 'ru') return `Соседей больше, чем у большинства: целых ${count}`
    if (lang === 'pl') return `Sąsiadów ma więcej niż większość: aż ${count}`
    return `More neighbours than most: ${count} of them`
  },
  noNeighbours: (_f, lang) =>
    lang === 'ru'
      ? 'У неё нет сухопутных соседей'
      : lang === 'pl'
        ? 'Nie ma żadnych sąsiadów na lądzie'
        : 'It has no neighbours by land',
  island: (_f, lang) =>
    lang === 'ru'
      ? 'Это остров'
      : lang === 'pl'
        ? 'To wyspa'
        : 'It is an island',
  landlocked: (_f, lang) =>
    lang === 'ru'
      ? 'У неё нет выхода к морю'
      : lang === 'pl'
        ? 'Nie ma dostępu do morza'
        : 'It has no coast at all',
  coast: (_f, lang) =>
    lang === 'ru'
      ? 'У неё есть выход к морю'
      : lang === 'pl'
        ? 'Ma dostęp do morza'
        : 'It has a sea coast',
  biggest: ({ rank = 1 }, lang) => {
    if (lang === 'ru') return rank === 1 ? 'Самая большая страна в наборе' : `Одна из самых больших, ${rank}-я по площади`
    if (lang === 'pl') return rank === 1 ? 'Największy kraj w zestawie' : `Jeden z największych, ${rank}. co do wielkości`
    return rank === 1 ? 'The largest country in the set' : `One of the largest, ${rank}${rank === 2 ? 'nd' : 'rd'} by area`
  },
  smallest: ({ rank = 1 }, lang) => {
    if (lang === 'ru') return rank === 1 ? 'Самая маленькая страна в наборе' : 'Одна из самых маленьких'
    if (lang === 'pl') return rank === 1 ? 'Najmniejszy kraj w zestawie' : 'Jeden z najmniejszych'
    return rank === 1 ? 'The smallest country in the set' : 'One of the smallest'
  },
  area: ({ km2 = 0 }, lang) => {
    const n = groupDigits(km2, lang)
    if (lang === 'ru') return `Площадь примерно ${n} км²`
    if (lang === 'pl') return `Powierzchnia to około ${n} km²`
    return `About ${n} km² in area`
  },
  northernmost: (_f, lang) =>
    lang === 'ru' ? 'Забирается севернее всех' : lang === 'pl' ? 'Sięga najdalej na północ' : 'Reaches furthest north',
  southernmost: (_f, lang) =>
    lang === 'ru' ? 'Забирается южнее всех' : lang === 'pl' ? 'Sięga najdalej na południe' : 'Reaches furthest south',
  westernmost: (_f, lang) =>
    lang === 'ru' ? 'Забирается западнее всех' : lang === 'pl' ? 'Sięga najdalej na zachód' : 'Reaches furthest west',
  easternmost: (_f, lang) =>
    lang === 'ru' ? 'Забирается восточнее всех' : lang === 'pl' ? 'Sięga najdalej na wschód' : 'Reaches furthest east',
  northernCapital: (_f, lang) =>
    lang === 'ru'
      ? 'Её столица самая северная в наборе'
      : lang === 'pl'
        ? 'Jej stolica leży najdalej na północ'
        : 'Its capital is the northernmost here',
  southernCapital: (_f, lang) =>
    lang === 'ru'
      ? 'Её столица самая южная в наборе'
      : lang === 'pl'
        ? 'Jej stolica leży najdalej na południe'
        : 'Its capital is the southernmost here',
}

export function renderFact(fact: DerivedFact, lang: Lang): string | null {
  const render = RENDER[fact.kind]
  return render ? render(fact, lang) : null
}

/** Facts pulled from Wikidata by scripts/fetch-facts.mjs. */
export interface WikiFacts {
  population?: number
  elevation?: number
  inception?: number
  peak_ru?: string
  peak_pl?: string
  peak_en?: string
  currency_ru?: string
  currency_pl?: string
  currency_en?: string
  language_ru?: string
  language_pl?: string
  language_en?: string
  /** Metres below sea level, and what is down there. */
  depth?: number
  low_ru?: string
  low_pl?: string
  low_en?: string
  /** Only set for the countries that drive on the left. */
  leftHandTraffic?: boolean
}

/** Rounded to something a child can hold: millions, or hundreds of thousands. */
function roundPeople(n: number, lang: Lang): string {
  if (n >= 1_000_000_000) {
    const b = Math.round(n / 100_000_000) / 10
    const fraction = b % 1 !== 0
    const shown = fraction ? b.toFixed(1).replace('.', lang === 'en' ? '.' : ',') : String(b)
    if (lang === 'ru') return `${shown} ${fraction ? 'миллиарда' : ruPlural(b, 'миллиард', 'миллиарда', 'миллиардов')}`
    if (lang === 'pl') return `${shown} ${fraction ? 'miliarda' : plPlural(b, 'miliard', 'miliardy', 'miliardów')}`
    return `${shown} billion`
  }
  if (n >= 1_000_000) {
    const m = Math.round(n / 100_000) / 10
    const fraction = m % 1 !== 0
    const shown = fraction ? m.toFixed(1).replace('.', lang === 'en' ? '.' : ',') : String(m)
    // A fraction takes the genitive singular in both Slavic languages:
    // "5,4 миллиона", not "5,4 миллионов".
    if (lang === 'ru') return `${shown} ${fraction ? 'миллиона' : ruPlural(m, 'миллион', 'миллиона', 'миллионов')}`
    if (lang === 'pl') return `${shown} ${fraction ? 'miliona' : plPlural(m, 'milion', 'miliony', 'milionów')}`
    return `${shown} million`
  }
  return groupDigits(Math.round(n / 1000) * 1000, lang)
}

export function renderWikiFacts(w: WikiFacts, lang: Lang): string[] {
  const out: string[] = []

  if (w.population) {
    const people = roundPeople(w.population, lang)
    out.push(
      lang === 'ru'
        ? `Здесь живёт около ${people} человек`
        : lang === 'pl'
          ? `Mieszka tu około ${people} ludzi`
          : `About ${people} people live here`,
    )
  }

  const peak = w[`peak_${lang}`]
  if (peak && w.elevation) {
    const m = metres(w.elevation, lang)
    out.push(
      lang === 'ru'
        ? `Самая высокая гора: ${peak}, ${m}`
        : lang === 'pl'
          ? `Najwyższa góra to ${peak}, ${m}`
          : `Its highest mountain is ${peak}, ${m}`,
    )
  }

  const language = w[`language_${lang}`]
  if (language) {
    // Wikidata capitalises some language names; Russian and Polish do not.
    const bare = language
      .replace(/\s*\([^)]*\)\s*$/, '')
      .replace(/ (язык|language|język)$/i, '')
      .replace(/^język /i, '')
    const name = lang === 'en' ? bare : bare[0].toLowerCase() + bare.slice(1)
    out.push(
      lang === 'ru'
        ? `Государственный язык: ${name}`
        : lang === 'pl'
          ? `Językiem urzędowym jest ${name}`
          : `The official language is ${name}`,
    )
  }

  const low = w[`low_${lang}`]
  if (low && w.depth) {
    const m = metres(Math.abs(w.depth), lang)
    out.push(
      lang === 'ru'
        ? `Самое низкое место: ${low}, на ${m} ниже уровня моря`
        : lang === 'pl'
          ? `Najniższe miejsce to ${low}, ${m} poniżej poziomu morza`
          // Colon rather than "is": these names come without their article.
          : `Its lowest place: ${low}, ${m} below sea level`,
    )
  }

  if (w.leftHandTraffic) {
    out.push(
      lang === 'ru'
        ? 'Машины здесь ездят по левой стороне дороги'
        : lang === 'pl'
          ? 'Samochody jeżdżą tu lewą stroną drogi'
          : 'Cars here drive on the left',
    )
  }

  const currency = w[`currency_${lang}`]
  if (currency) {
    out.push(
      lang === 'ru'
        ? `Здесь платят: ${currency}`
        : lang === 'pl'
          ? `Płaci się tu: ${currency}`
          : `It pays in ${currency}`,
    )
  }

  if (w.inception) {
    out.push(
      lang === 'ru'
        ? `В нынешнем виде существует с ${w.inception} года`
        : lang === 'pl'
          ? `W obecnym kształcie istnieje od ${w.inception} roku`
          : `In its present form since ${w.inception}`,
    )
  }

  return out
}
