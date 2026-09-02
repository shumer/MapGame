import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../data'
import { setMuted } from '../sound'

interface SoundState {
  muted: boolean
  toggleMuted: () => void
}

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
      muted: false,
      toggleMuted: () => {
        const next = !get().muted
        setMuted(next)
        set({ muted: next })
      },
    }),
    {
      name: 'mapgame.sound',
      onRehydrateStorage: () => (state) => setMuted(state?.muted ?? false),
    },
  ),
)
