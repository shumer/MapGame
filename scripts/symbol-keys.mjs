// Every symbol key the game can actually render, from both sources: the SVG
// files under src/assets/art/symbols, and the shapes drawn in src/ui/symbols.tsx.
// The validator uses this to catch data that points at a symbol nobody supplies.
import fs from 'node:fs'

const FILES_DIR = 'src/assets/art/symbols'

const fromFiles = fs.existsSync(FILES_DIR)
  ? fs.readdirSync(FILES_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', ''))
  : []

const source = fs.readFileSync('src/ui/symbols.tsx', 'utf8')
const fromCode = [...source.matchAll(/^ {2}([a-z][a-zA-Z]*): \(/gm)].map((m) => m[1])

export const SYMBOL_KEYS = [...new Set([...fromFiles, ...fromCode])]
