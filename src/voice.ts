import { speak, canSpeak, isVoiceMuted } from './speech'
import { isMuted } from './sound'
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

/**
 * Guards against the same line firing twice in a row within a moment — React's
 * development mode runs effects twice, and a doubled "off we go" is audible.
 */
let lastKey = ''
let lastAt = 0
const REPEAT_GUARD_MS = 700

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
 * back to. Resolves when the line has finished, so a caller can follow it with
 * another one instead of talking over it.
 */
export function say(key: string, text: string, lang: Lang): Promise<void> {
  if (isMuted() || isVoiceMuted()) return Promise.resolve()

  const now = Date.now()
  if (key === lastKey && now - lastAt < REPEAT_GUARD_MS) return Promise.resolve()
  lastKey = key
  lastAt = now

  const url = recordings.get(`${lang}/${key}`)
  if (!url) return canSpeak(lang) ? speak(text, lang) : Promise.resolve()

  stopVoice()
  const audio = new Audio(url)
  current = audio

  return new Promise((resolve) => {
    audio.addEventListener('ended', () => resolve(), { once: true })
    audio.addEventListener('error', () => resolve(), { once: true })
    // Autoplay can still be refused; falling back keeps the game audible.
    audio.play().catch(() => {
      if (canSpeak(lang)) speak(text, lang).then(resolve)
      else resolve()
    })
  })
}
