/**
 * Game sounds, synthesised rather than loaded. A handful of short notes weigh
 * nothing, need no files in the offline cache, and never arrive late.
 */

let ctx: AudioContext | null = null
let muted = false

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  // Created on the first gesture: browsers refuse to start audio before one.
  ctx ??= new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface Note {
  /** Hz. */
  freq: number
  /** Seconds from the start of the sound. */
  at: number
  length?: number
  gain?: number
  type?: OscillatorType
}

function play(notes: Note[]) {
  if (muted) return
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + 0.01

  for (const n of notes) {
    const osc = ac.createOscillator()
    const env = ac.createGain()
    const start = t0 + n.at
    const length = n.length ?? 0.16
    const peak = n.gain ?? 0.18

    osc.type = n.type ?? 'sine'
    osc.frequency.setValueAtTime(n.freq, start)
    // Short attack, exponential tail: reads as a soft chime rather than a beep.
    env.gain.setValueAtTime(0.0001, start)
    env.gain.exponentialRampToValueAtTime(peak, start + 0.012)
    env.gain.exponentialRampToValueAtTime(0.0001, start + length)

    osc.connect(env).connect(ac.destination)
    osc.start(start)
    osc.stop(start + length + 0.02)
  }
}

// Notes are named by pitch so the intervals stay obvious when tuning them.
const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5
const A4 = 440
const F4 = 349.23

export const sounds = {
  /** Rising major triad: unambiguous "yes" without being shrill. */
  correct: () =>
    play([
      { freq: C5, at: 0 },
      { freq: E5, at: 0.09 },
      { freq: G5, at: 0.18, length: 0.26 },
    ]),

  /** Two soft low notes. Deliberately gentle: a miss is not a failure here. */
  wrong: () =>
    play([
      { freq: A4, at: 0, gain: 0.12, type: 'triangle' },
      { freq: F4, at: 0.11, length: 0.22, gain: 0.12, type: 'triangle' },
    ]),

  /** Played when the answer is revealed on the map. */
  reveal: () => play([{ freq: G5, at: 0, length: 0.3, gain: 0.1, type: 'triangle' }]),

  /** End of round, one note per star. */
  fanfare: (stars: number) =>
    play(
      [C5, E5, G5, C6].slice(0, Math.max(2, stars + 1)).map((freq, i) => ({
        freq,
        at: i * 0.13,
        length: i === stars ? 0.5 : 0.2,
        gain: 0.16,
      })),
    ),

  tap: () => play([{ freq: C5, at: 0, length: 0.07, gain: 0.07, type: 'triangle' }]),
}

export const setMuted = (value: boolean) => {
  muted = value
}
export const isMuted = () => muted
