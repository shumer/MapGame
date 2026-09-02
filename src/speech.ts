import { speechLocale, type Lang } from './data'

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

export function speak(text: string, lang: Lang) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voice = voiceFor(lang)
  if (voice) u.voice = voice
  u.lang = speechLocale[lang]
  // Slightly slow and a touch high: easier for a child to follow.
  u.rate = 0.92
  u.pitch = 1.05
  window.speechSynthesis.speak(u)
}

export const stopSpeaking = () => window.speechSynthesis?.cancel()
