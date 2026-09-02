// One-off fetcher for third-party artwork. The files it downloads are committed
// to the repository — the game must work offline, so nothing is fetched at
// runtime. Re-run it only when adding a new piece of art.
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg'

/** key -> Unicode codepoint of the Noto Emoji glyph. */
const SYMBOLS = {
  bear: '1f43b',
  bison: '1f9ac',
  deer: '1f98c',
  wolf: '1f43a',
  horse: '1f40e',
  bull: '1f402',
  owl: '1f989',
  eagle: '1f985',
  clover: '1f340',
  rose: '1f339',
  sunflower: '1f33b',
  grapes: '1f347',
  mountains: '1f3d4',
  volcano: '1f30b',
  boat: '26f5',
  castle: '1f3f0',
  columns: '1f3db',
  clock: '1f570',
  cheese: '1f9c0',
  chocolate: '1f36b',
  pizza: '1f355',
  pretzel: '1f968',
  crown: '1f451',
  racecar: '1f3ce',
  violin: '1f3bb',

  // Asia. Nothing here may repeat what is on the country's own flag: in the
  // flag round the symbol sits on the answer buttons, and a symbol that echoes
  // the flag hands the answer over. That rules out the eagle for Kazakhstan,
  // the dragon for Bhutan and Angkor Wat for Cambodia.
  panda: '1f43c',
  tiger: '1f405',
  elephant: '1f418',
  orangutan: '1f9a7',
  camel: '1f42a',
  lion: '1f981',
  dragon: '1f409',
  fish: '1f420',
  fuji: '1f5fb',
  island: '1f3dd',
  city: '1f3d9',
  mosque: '1f54c',
  hibiscus: '1f33a',
  tea: '1f375',
  fire: '1f525',
  judo: '1f94b',

  // Africa. Same rule: nothing that repeats the country's own flag. That rules
  // out the cedar for Lebanon, and any lion for a flag that carries one.
  pyramid: '1f5ff',
  giraffe: '1f992',
  zebra: '1f993',
  hippo: '1f99b',
  gorilla: '1f98d',
  rhino: '1f98f',
  monkey: '1f412',
  crocodile: '1f40a',
  flamingo: '1f9a9',
  penguin: '1f427',
  turtle: '1f422',
  cactus: '1f335',
  palm: '1f334',
  coffee: '2615',
  cocoa: '1f36b',
  diamond: '1f48e',
  drum: '1f941',
  desert: '1f3dc',

  // Oceania.
  kangaroo: '1f998',
  sheep: '1f411',
  shell: '1f41a',
  jellyfish: '1fabc',
  whale: '1f40b',
}

const DECOR = {
  compass: '1f9ed',
  whale: '1f40b',
  boat: '26f5',
  // The traveller at the head of the route on the map.
  walker: '1f6b6',
  // Wildlife that drifts across the map now and then.
  car: '1f697',
  bird: '1f426',
}

/** Strips the Illustrator preamble and editor-only attributes. */
function clean(svg) {
  return svg
    .replace(/<\?xml[^>]*\?>\s*/g, '')
    .replace(/<!--.*?-->\s*/gs, '')
    .replace(/ version="1\.1"/g, '')
    .replace(/ id="Layer_\d+"/g, '')
    .replace(/ x="0px" y="0px"/g, '')
    .replace(/ xml:space="preserve"/g, '')
    .replace(/ style="enable-background:[^"]*"/g, '')
    .replace(/\s+xmlns:xlink="[^"]*"/g, '')
    .replace(/\n\t+/g, ' ')
    .trim()
}

async function grab(codepoint) {
  const res = await fetch(`${BASE}/emoji_u${codepoint}.svg`)
  if (!res.ok) return null
  const body = await res.text()
  return body.includes('<svg') ? clean(body) : null
}

async function run(map, dir) {
  fs.mkdirSync(dir, { recursive: true })
  const got = []
  const missing = []
  for (const [name, cp] of Object.entries(map)) {
    const svg = await grab(cp)
    if (!svg) {
      missing.push(`${name} (${cp})`)
      continue
    }
    fs.writeFileSync(path.join(dir, `${name}.svg`), svg + '\n')
    got.push(name)
  }
  return { got, missing }
}

const symbols = await run(SYMBOLS, 'src/assets/art/symbols')
const decor = await run(DECOR, 'src/assets/art/decor')

console.log(`symbols: ${symbols.got.length} fetched`)
if (symbols.missing.length) console.log(`  not in Noto: ${symbols.missing.join(', ')}`)
console.log(`decor: ${decor.got.length} fetched`)
if (decor.missing.length) console.log(`  not in Noto: ${decor.missing.join(', ')}`)
