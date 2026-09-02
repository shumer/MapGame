import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../data'
import type { CountryProgress, GameMode, Level, Profile } from '../game/types'

interface ProfileState {
  profiles: Profile[]
  activeId: string | null
  /** Starts (or resumes) the profile behind one of the two characters. */
  play: (level: Level, lang: Lang) => void
  select: (id: string | null) => void
  rename: (id: string, name: string) => void
  reset: (id: string) => void
  setLangs: (id: string, uiLang: Lang, contentLang: Lang) => void
  saveProgress: (id: string, iso: string, progress: CountryProgress) => void
  collectAnimal: (id: string, animalId: string) => void
  finishRound: (id: string, mode: GameMode, score: number) => void
}

/** One profile per character. The id is the level, so progress is kept apart. */
const blank = (level: Level): Profile => ({
  id: level,
  name: level === 'little' ? 'Малыш' : 'Знаток',
  avatar: level === 'little' ? 5 : 4,
  level,
  uiLang: 'ru',
  contentLang: 'ru',
  progress: {},
  best: {},
  rounds: 0,
})

const patch = (profiles: Profile[], id: string, fn: (p: Profile) => Profile) =>
  profiles.map((p) => (p.id === id ? fn(p) : p))

export const useProfiles = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeId: null,

      play: (level, lang) => {
        const existing = get().profiles.find((p) => p.id === level)
        if (!existing) set((s) => ({ profiles: [...s.profiles, { ...blank(level), uiLang: lang, contentLang: lang }] }))
        // The flag on the start screen wins over whatever this profile used last.
        else set((s) => ({ profiles: patch(s.profiles, level, (p) => ({ ...p, uiLang: lang, contentLang: lang })) }))
        set({ activeId: level })
      },

      select: (id) => set({ activeId: id }),

      rename: (id, name) =>
        set((s) => ({ profiles: patch(s.profiles, id, (p) => ({ ...p, name })) })),

      reset: (id) =>
        set((s) => ({
          profiles: patch(s.profiles, id, (p) => ({ ...p, progress: {}, best: {}, rounds: 0 })),
        })),

      setLangs: (id, uiLang, contentLang) =>
        set((s) => ({ profiles: patch(s.profiles, id, (p) => ({ ...p, uiLang, contentLang })) })),

      saveProgress: (id, iso, progress) =>
        set((s) => ({
          profiles: patch(s.profiles, id, (p) => ({ ...p, progress: { ...p.progress, [iso]: progress } })),
        })),

      /** An animal is collected by answering about it correctly, never by
          tapping it in the zoo: a collection you can fill in two minutes of
          tapping stops being worth filling. */
      collectAnimal: (id, animalId) =>
        set((s) => ({
          profiles: patch(s.profiles, id, (p) =>
            p.animalsSeen?.includes(animalId)
              ? p
              : { ...p, animalsSeen: [...(p.animalsSeen ?? []), animalId] },
          ),
        })),

      finishRound: (id, mode, score) =>
        set((s) => ({
          profiles: patch(s.profiles, id, (p) => ({
            ...p,
            rounds: p.rounds + 1,
            best: { ...p.best, [mode]: Math.max(p.best[mode] ?? 0, score) },
          })),
        })),
    }),
    { name: 'mapgame.profiles', version: 2 },
  ),
)

export const useActiveProfile = (): Profile | null => {
  const { profiles, activeId } = useProfiles()
  return profiles.find((p) => p.id === activeId) ?? null
}
