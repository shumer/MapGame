// Pulls structured facts from Wikidata for every country in the data. Only
// machine-readable values are taken -- numbers, names, dates -- and the wording
// is ours, so nothing is copied from an encyclopaedia. Results are committed;
// nothing is fetched at runtime.
//
// Re-run when the data should be refreshed: npm run data:wiki
import fs from 'node:fs'

const UA = 'MapGame/1.0 (https://github.com/shumer/MapGame; educational children game)'
const OUT = 'src/data/country-facts.json'
const LANGS = ['ru', 'pl', 'en']

// The public endpoint times out on a query that asks for everything at once,
// so the work is split into small queries over small batches of countries, and
// a 502/504 is retried rather than treated as a failure.
const BATCH = 12
const TRIES = 4

const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))
const out = {}

/** Labels are requested per language rather than through the label service,
    which only serves one language at a time. */
const label = (v, lang) =>
  `OPTIONAL { ?${v} rdfs:label ?${v}${lang} FILTER(LANG(?${v}${lang}) = "${lang}") }`

async function ask(query) {
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query)
  for (let attempt = 1; attempt <= TRIES; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' },
    })
    if (res.ok) return (await res.json()).results.bindings
    if (attempt === TRIES) throw new Error(`Wikidata answered ${res.status}`)
    await new Promise((r) => setTimeout(r, attempt * 4000))
  }
  return []
}

/** Keeps the first value seen: one country can come back on several rows.
    Wikidata labels carry disambiguating brackets -- "Hachirogata (lake)" --
    which read as a mistake in a sentence read out to a child. */
const take = (iso, key, value) => {
  if (value === undefined || value === null || value === '') return
  const clean = typeof value === 'string' ? value.replace(/\s*\([^)]*\)\s*$/, '').trim() : value
  if (clean === '') return
  const entry = (out[iso] ??= {})
  entry[key] ??= clean
}

/** Each pass is deliberately small. Asking for peaks, currencies and lowest
    points in one query is what made the endpoint give up. */
const PASSES = [
  {
    name: 'numbers',
    select: '?iso ?population ?inception',
    where: `
  OPTIONAL { ?country wdt:P1082 ?population }
  OPTIONAL { ?country wdt:P571 ?inception }`,
    read: (iso, b) => {
      take(iso, 'population', b.population && Number(b.population.value))
      take(iso, 'inception', b.inception && Number(b.inception.value.slice(0, 4)))
    },
  },
  {
    // Only the unusual side is worth telling a child about, so this asks for
    // left-hand traffic alone: a country that comes back has it, and one that
    // does not is simply absent.
    name: 'driving side',
    select: '?iso',
    where: `
  ?country wdt:P1622 wd:Q11920728 .`,
    read: (iso) => take(iso, 'leftHandTraffic', true),
  },
  {
    name: 'highest point',
    select: '?iso ?elevation ?peakru ?peakpl ?peaken',
    where: `
  ?country wdt:P610 ?peak .
  OPTIONAL { ?peak wdt:P2044 ?elevation }
  ${LANGS.map((l) => label('peak', l)).join('\n  ')}`,
    read: (iso, b) => {
      take(iso, 'elevation', b.elevation && Math.round(Number(b.elevation.value)))
      for (const l of LANGS) take(iso, `peak_${l}`, b[`peak${l}`]?.value)
    },
  },
  {
    name: 'lowest point',
    select: '?iso ?depth ?lowru ?lowpl ?lowen',
    where: `
  ?country wdt:P1589 ?low .
  OPTIONAL { ?low wdt:P2044 ?depth }
  ${LANGS.map((l) => label('low', l)).join('\n  ')}`,
    read: (iso, b) => {
      // Kept only when it is actually below sea level, and not when it is a
      // trench on the sea floor: Wikidata gives Greece the Calypso Deep at
      // -5269 m, which is not a place anybody stands.
      const depth = b.depth && Number(b.depth.value)
      if (depth && depth < 0 && depth > -500) take(iso, 'depth', Math.round(depth))
      for (const l of LANGS) take(iso, `low_${l}`, b[`low${l}`]?.value)
    },
  },
  {
    name: 'currency',
    select: '?iso ?currencyru ?currencypl ?currencyen',
    where: `
  ?country wdt:P38 ?currency .
  ${LANGS.map((l) => label('currency', l)).join('\n  ')}`,
    read: (iso, b) => {
      for (const l of LANGS) take(iso, `currency_${l}`, b[`currency${l}`]?.value)
    },
  },
  {
    name: 'language',
    select: '?iso ?languageru ?languagepl ?languageen',
    where: `
  ?country wdt:P37 ?language .
  ${LANGS.map((l) => label('language', l)).join('\n  ')}`,
    read: (iso, b) => {
      for (const l of LANGS) take(iso, `language_${l}`, b[`language${l}`]?.value)
    },
  },
]

for (const pass of PASSES) {
  for (let i = 0; i < data.countries.length; i += BATCH) {
    const batch = data.countries.slice(i, i + BATCH)
    const isoList = batch.map((c) => `"${c.iso}"`).join(' ')
    const rows = await ask(`
SELECT ${pass.select} WHERE {
  VALUES ?iso { ${isoList} }
  ?country wdt:P297 ?iso .${pass.where}
}`)
    for (const b of rows) pass.read(b.iso.value, b)
    process.stderr.write(`  ${pass.name}: ${Math.min(i + BATCH, data.countries.length)}/${data.countries.length}\r`)
  }
  process.stderr.write(`  ${pass.name}: done${' '.repeat(20)}\n`)
}

// English stands in for a missing translation rather than dropping the fact;
// a name with no English either is unusable and goes.
for (const entry of Object.values(out)) {
  for (const field of ['peak', 'low', 'currency', 'language']) {
    const en = entry[`${field}_en`]
    if (!en) {
      for (const l of LANGS) delete entry[`${field}_${l}`]
      continue
    }
    for (const l of ['ru', 'pl']) entry[`${field}_${l}`] ??= en
  }
  if (!entry.peak_en) delete entry.elevation
  if (!entry.low_en) delete entry.depth
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')

const have = (field) => Object.values(out).filter((e) => e[field] !== undefined).length
console.log(`countries with data: ${Object.keys(out).length} / ${data.countries.length}`)
console.log(`population ${have('population')}, peak ${have('peak_ru')}, elevation ${have('elevation')}`)
console.log(`currency ${have('currency_ru')}, language ${have('language_ru')}, founded ${have('inception')}`)
console.log(`below sea level ${have('depth')}, left-hand traffic ${have('leftHandTraffic')}`)
