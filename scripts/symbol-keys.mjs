// The symbol keys that src/ui/symbols.tsx actually draws, read from the source
// so the validator fails when data references a symbol nobody drew.
import fs from 'node:fs'

const source = fs.readFileSync('src/ui/symbols.tsx', 'utf8')
export const SYMBOL_KEYS = [...source.matchAll(/^ {2}([a-z][a-zA-Z]*): \(/gm)].map((m) => m[1])
