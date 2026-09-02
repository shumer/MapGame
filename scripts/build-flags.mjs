// Copies just the flags this build needs. Importing the flag-icons stylesheet
// would pull every country in the world into the bundle.
import fs from 'node:fs'

const DEST = 'src/assets/flags'
const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))

fs.rmSync(DEST, { recursive: true, force: true })
fs.mkdirSync(DEST, { recursive: true })

let bytes = 0
for (const c of data.countries) {
  const name = `${c.iso.toLowerCase()}.svg`
  fs.copyFileSync(`node_modules/flag-icons/flags/4x3/${name}`, `${DEST}/${name}`)
  bytes += fs.statSync(`${DEST}/${name}`).size
}

console.log(`flags: ${data.countries.length} files, ${(bytes / 1024).toFixed(0)} KB -> ${DEST}`)
