// Pulls structured facts from Wikidata for every country in the set. Only
// machine-readable values are taken — numbers, names, dates — and the wording
// is ours, so nothing is copied from an encyclopaedia. Results are committed;
// nothing is fetched at runtime.
//
// Re-run when the data should be refreshed: node scripts/fetch-facts.mjs
import fs from 'node:fs'

const UA = 'MapGame/1.0 (https://github.com/shumer/MapGame; educational children game)'
const OUT = 'src/data/country-facts.json'

const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))
const isoList = data.countries.map((c) => `"${c.iso}"`).join(' ')

/** Labels are requested per language rather than through the label service,
    which only serves one language at a time. */
const label = (variable, lang) =>
  `OPTIONAL { ?${variable} rdfs:label ?${variable}${lang} FILTER(LANG(?${variable}${lang}) = "${lang}") }`

const query = `
SELECT ?iso ?population ?elevation ?inception
       ?peakru ?peakpl ?peaken
       ?currencyru ?currencypl ?currencyen
       ?languageru ?languagepl ?languageen
WHERE {
  VALUES ?iso { ${isoList} }
  ?country wdt:P297 ?iso .
  OPTIONAL { ?country wdt:P1082 ?population }
  OPTIONAL { ?country wdt:P610 ?peak . OPTIONAL { ?peak wdt:P2044 ?elevation } }
  OPTIONAL { ?country wdt:P38 ?currency }
  OPTIONAL { ?country wdt:P37 ?language }
  OPTIONAL { ?country wdt:P571 ?inception }
  ${['ru', 'pl', 'en'].map((l) => label('peak', l)).join('\n  ')}
  ${['ru', 'pl', 'en'].map((l) => label('currency', l)).join('\n  ')}
  ${['ru', 'pl', 'en'].map((l) => label('language', l)).join('\n  ')}
}`

const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query)
const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } })
if (!res.ok) {
  console.error('Wikidata query failed:', res.status)
  process.exit(1)
}
const body = await res.json()

/** One country can come back several times; keep the richest row per field. */
const out = {}
for (const b of body.results.bindings) {
  const iso = b.iso.value
  const entry = (out[iso] ??= {})
  const take = (key, value) => {
    if (value && !entry[key]) entry[key] = value
  }
  take('population', b.population && Number(b.population.value))
  take('elevation', b.elevation && Math.round(Number(b.elevation.value)))
  take('inception', b.inception && Number(b.inception.value.slice(0, 4)))
  for (const lang of ['ru', 'pl', 'en']) {
    take(`peak_${lang}`, b[`peak${lang}`]?.value)
    take(`currency_${lang}`, b[`currency${lang}`]?.value)
    take(`language_${lang}`, b[`language${lang}`]?.value)
  }
}

// English stands in for a missing translation rather than dropping the fact;
// a name with no English either is unusable and goes.
for (const entry of Object.values(out)) {
  for (const field of ['peak', 'currency', 'language']) {
    const en = entry[`${field}_en`]
    if (!en) {
      for (const l of ['ru', 'pl', 'en']) delete entry[`${field}_${l}`]
      continue
    }
    for (const l of ['ru', 'pl']) entry[`${field}_${l}` ] ??= en
  }
  if (!entry.peak_en) delete entry.elevation
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')

const have = (field) => Object.values(out).filter((e) => e[field] !== undefined).length
console.log(`countries with data: ${Object.keys(out).length} / ${data.countries.length}`)
console.log(`population ${have('population')}, peak ${have('peak_ru')}, elevation ${have('elevation')}`)
console.log(`currency ${have('currency_ru')}, language ${have('language_ru')}, founded ${have('inception')}`)
