// Turns the single-file build into a page the Artifact tool can publish: it
// wraps content in its own <html>/<head>/<body>, so those tags must be stripped.
import fs from 'node:fs'

const OUT = process.argv[2] ?? 'artifact.html'
const src = fs.readFileSync('dist-single/index.html', 'utf8')

const head = src.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? ''
const body = src.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? ''

// Drop what the wrapper already provides; keep the title, fonts and styles.
const keptHead = head
  .replace(/<meta charset[^>]*>/gi, '')
  .replace(/<meta name="viewport"[^>]*>/gi, '')
  .replace(/<link rel="icon"[^>]*>/gi, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>/gi, '')
  .trim()

const html = `${keptHead}
<style>
  /* The artifact wrapper supplies the body; the game expects a full-height root. */
  html, body { height: 100%; margin: 0; }
  #root { height: 100%; }
</style>
${body.trim()}
`

fs.writeFileSync(OUT, html)
console.log(`${OUT}: ${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB`)
