import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang, Region } from '../data'
import { DEFAULT_CONTINENT } from '../data'
import { setMuted } from '../sound'
import { setVoiceMuted } from '../speech'
import { stopSpeaking } from '../speech'

/**
 * Three steps rather than on/off. The voice is the part that wears thin first
 * for a grown-up in the room, and it is worth being able to drop just that
 * while the game keeps its chimes.
 */
export type SoundMode = 'full' | 'effects' | 'silent'

interface SoundState {
  mode: SoundMode
  /** Kept for the persisted state written by earlier versions. */
  muted: boolean
  cycleSound: () => void
}

const NEXT: Record<SoundMode, SoundMode> = {
  full: 'effects',
  effects: 'silent',
  silent: 'full',
}

interface ContinentState {
  /** The set being played. Chosen on its own screen, kept between sessions so
      a child who is working through Asia does not land back in Europe. */
  continent: Region
  setContinent: (continent: Region) => void
}

/** Remembered per device, like the language. */
export const useContinent = create<ContinentState>()(
  persist(
    (set) => ({
      continent: DEFAULT_CONTINENT,
      setContinent: (continent) => set({ continent }),
    }),
    { name: 'mapgame-continent' },
  ),
)

interface LangState {
  /** Language chosen on the start screen, applied to whoever plays next. */
  lang: Lang
  setLang: (lang: Lang) => void
}

/** Remembered per device: the flag picked on the start screen stays picked. */
export const useLang = create<LangState>()(
  persist(
    (set) => ({
      lang: 'ru',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'mapgame.lang' },
  ),
)

/** Sound preference, remembered per device rather than per player. */
export const useSound = create<SoundState>()(
  persist(
    (set, get) => ({
      mode: 'full',
      muted: false,
      cycleSound: () => {
        const mode = NEXT[get().mode]
        setMuted(mode === 'silent')
        setVoiceMuted(mode !== 'full')
        // Silence whatever is mid-sentence, rather than only the next line.
        if (mode !== 'full') stopSpeaking()
        set({ mode, muted: mode === 'silent' })
      },
    }),
    {
      name: 'mapgame.sound',
      version: 2,
      migrate: (state) => {
        const old = state as { muted?: boolean; mode?: SoundMode }
        return { ...old, mode: old.mode ?? (old.muted ? 'silent' : 'full') } as SoundState
      },
      onRehydrateStorage: () => (state) => {
        const mode = state?.mode ?? 'full'
        setMuted(mode === 'silent')
        setVoiceMuted(mode !== 'full')
      },
    },
  ),
)
