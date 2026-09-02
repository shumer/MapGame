// Fetches the skeleton of a new country set from Wikidata: ISO numeric code,
// the country name and its capital in all three languages, and the capital's
// coordinates. Only machine-readable values are taken.
//
// The output is a starting point, not a finished set: fame, symbol, subregion
// and the written fact are judgement calls and stay hand-written. Nothing is
// fetched at runtime.
//
//   node scripts/fetch-set.mjs AF AM AZ ... > /tmp/asia.json
import process from 'node:process'

const UA = 'MapGame/1.0 (https://github.com/shumer/MapGame; educational children game)'
const LANGS = ['ru', 'pl', 'en']

const codes = process.argv.slice(2).map((c) => c.toUpperCase())
if (!codes.length) {
  console.error('usage: node scripts/fetch-set.mjs <ISO alpha-2 codes>')
  process.exit(1)
}

const label = (v, lang) =>
  `OPTIONAL { ?${v} rdfs:label ?${v}${lang} FILTER(LANG(?${v}${lang}) = "${lang}") }`

const query = `
SELECT ?iso ?un ?coords
       ?countryru ?countrypl ?countryen
       ?capitalru ?capitalpl ?capitalen
WHERE {
  VALUES ?iso { ${codes.map((c) => `"${c}"`).join(' ')} }
  ?country wdt:P297 ?iso .
  OPTIONAL { ?country wdt:P299 ?un }
  OPTIONAL {
    ?country p:P36 ?capitalStatement .
    ?capitalStatement ps:P36 ?capital .
    # Skip historical capitals, which are stated with an end date.
    FILTER NOT EXISTS { ?capitalStatement pq:P582 ?ended }
    OPTIONAL { ?capital wdt:P625 ?coords }
    ${LANGS.map((l) => label('capital', l)).join('\n    ')}
  }
  ${LANGS.map((l) => label('country', l)).join('\n  ')}
}`

// The public endpoint throttles and times out; a 502 or 504 means try again,
// not give up.
const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query)
let res
for (let attempt = 1; attempt <= 4; attempt++) {
  res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } })
  if (res.ok) break
  if (attempt === 4) {
    console.error('Wikidata query failed:', res.status)
    process.exit(1)
  }
  await new Promise((r) => setTimeout(r, attempt * 4000))
}
const body = await res.json()

/** "Point(35.2 31.7)" -> [35.2, 31.7], rounded the way the data file keeps it. */
const point = (wkt) => {
  const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(wkt ?? '')
  return m ? [Number(Number(m[1]).toFixed(4)), Number(Number(m[2]).toFixed(4))] : null
}

const out = new Map()
for (const b of body.results.bindings) {
  const iso = b.iso.value
  const entry = out.get(iso) ?? { iso, un: null, name: {}, capital: {}, capitalCoords: null }
  entry.un ??= b.un?.value ?? null
  entry.capitalCoords ??= point(b.coords?.value)
  for (const lang of LANGS) {
    entry.name[lang] ??= b[`country${lang}`]?.value
    entry.capital[lang] ??= b[`capital${lang}`]?.value
  }
  out.set(iso, entry)
}

// Report what came back incomplete rather than writing a half-empty entry
// silently: a missing Polish capital is exactly the kind of gap that survives
// into the game and shows a child a blank button.
const missing = []
for (const code of codes) {
  const e = out.get(code)
  if (!e) {
    missing.push(`${code}: nothing found`)
    continue
  }
  if (!e.un) missing.push(`${code}: no ISO numeric code`)
  if (!e.capitalCoords) missing.push(`${code}: no capital coordinates`)
  for (const lang of LANGS) {
    if (!e.name[lang]) missing.push(`${code}: no country name in ${lang}`)
    if (!e.capital[lang]) missing.push(`${code}: no capital name in ${lang}`)
  }
}
if (missing.length) console.error('gaps:\n  ' + missing.join('\n  '))

console.log(JSON.stringify([...out.values()], null, 2))
