import { speechLocale, type Lang } from './data'
import { isMuted } from './sound'

/** Set separately from the effects, so the voice can be dropped on its own. */
let voiceOff = false
export const setVoiceMuted = (value: boolean) => {
  voiceOff = value
}
export const isVoiceMuted = () => voiceOff

let voices: SpeechSynthesisVoice[] = []

function refresh() {
  voices = window.speechSynthesis?.getVoices() ?? []
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refresh()
  window.speechSynthesis.addEventListener('voiceschanged', refresh)
}

/** Best available voice for a language, preferring a local one. */
function voiceFor(lang: Lang): SpeechSynthesisVoice | undefined {
  const locale = speechLocale[lang].toLowerCase()
  const code = locale.slice(0, 2)
  const matches = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(code))
  return (
    matches.find((v) => v.lang.toLowerCase().replace('_', '-') === locale && v.localService) ??
    matches.find((v) => v.localService) ??
    matches[0]
  )
}

/** True when the device can actually pronounce this language. */
export const canSpeak = (lang: Lang): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && !!voiceFor(lang)

/** Resolves when the utterance finishes, so lines can be chained rather than
    talked over. Resolves immediately when there is nothing to say. */
export function speak(text: string, lang: Lang): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve()
  if (isMuted() || voiceOff) return Promise.resolve()

  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voice = voiceFor(lang)
  if (voice) u.voice = voice
  u.lang = speechLocale[lang]
  // Slightly slow and a touch high: easier for a child to follow.
  u.rate = 0.92
  u.pitch = 1.05

  return new Promise((resolve) => {
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}

export const stopSpeaking = () => window.speechSynthesis?.cancel()
