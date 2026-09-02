import { speak, canSpeak } from './speech'
import type { Lang } from './data'

/**
 * Spoken lines. Recorded audio is used when a file exists for the language and
 * key; otherwise the device's own speech synthesis reads the text. That way the
 * game works fully before a single line has been recorded, and each recording
 * that lands quietly replaces the synthetic voice.
 *
 * Files live in src/assets/voice/<lang>/<key>.(m4a|mp3), see docs/voice-script.md.
 */
const files = import.meta.glob('./assets/voice/*/*.{m4a,mp3}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const recordings = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  const parts = path.split('/')
  const lang = parts[parts.length - 2]
  const key = parts[parts.length - 1].replace(/\.(m4a|mp3)$/, '')
  recordings.set(`${lang}/${key}`, url as string)
}

/** Reused so a rapid sequence of lines does not stack up players. */
let current: HTMLAudioElement | null = null

export const hasRecording = (key: string, lang: Lang) => recordings.has(`${lang}/${key}`)

export function stopVoice() {
  if (current) {
    current.pause()
    current.currentTime = 0
    current = null
  }
}

/**
 * Plays a line. `key` picks the recording; `text` is what the synthesiser falls
 * back to. Returns true when a recording was used.
 */
export function say(key: string, text: string, lang: Lang): boolean {
  const url = recordings.get(`${lang}/${key}`)
  if (!url) {
    if (canSpeak(lang)) speak(text, lang)
    return false
  }
  stopVoice()
  const audio = new Audio(url)
  current = audio
  // Autoplay can still be refused; falling back keeps the game audible.
  audio.play().catch(() => {
    if (canSpeak(lang)) speak(text, lang)
  })
  return true
}

/** Picks one of a numbered set, e.g. praise-01..praise-06. */
export function sayOneOf(keys: string[], texts: string[], lang: Lang): boolean {
  const i = Math.floor(Math.random() * keys.length)
  return say(keys[i], texts[i] ?? texts[0], lang)
}
