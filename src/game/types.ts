import type { Lang } from '../data'

/** What a round asks for. */
export type GameMode = 'flag' | 'locate' | 'capital' | 'animals'

/** Which child is playing. The two presets differ in almost every setting. */
export type Level = 'little' | 'expert'

export interface Preset {
  /** Answer buttons shown, including the right one. */
  choices: number
  questionsPerRound: number
  /** Read the question out loud without being asked. */
  autoSpeak: boolean
  /** Written answers, or flags and pictures only. */
  showText: boolean
  modes: GameMode[]
  /** Wrong answers taken from nearby countries, or from far away. */
  distractors: 'near' | 'far'
  /** Highest fame tier to draw questions from: 1 is the best known. */
  maxFame: 1 | 2 | 3
}

export const PRESETS: Record<Level, Preset> = {
  little: {
    choices: 2,
    questionsPerRound: 8,
    autoSpeak: true,
    showText: false,
    modes: ['flag', 'locate', 'animals'],
    distractors: 'far',
    maxFame: 1,
  },
  expert: {
    choices: 4,
    questionsPerRound: 12,
    autoSpeak: false,
    showText: true,
    modes: ['flag', 'locate', 'animals', 'capital'],
    distractors: 'near',
    maxFame: 3,
  },
}

export interface Question {
  mode: GameMode
  /** ISO code of the country being asked about. */
  target: string
  /** ISO codes to show as answers, already shuffled. Empty for 'locate'.
      In the animal round these are animal ids instead, and `answer` says
      which one is right. */
  options: string[]
  /** The right option when it is not the country itself: the animal round. */
  answer?: string
}

export interface Answer {
  question: Question
  picked: string
  correct: boolean
  /** Wrong picks made before getting it right, if any. */
  attempts: number
}

/** Per-country memory, used to decide what to ask next. */
export interface CountryProgress {
  /** Correct answers in a row. Reset to zero on a miss. */
  streak: number
  seen: number
  missed: number
  /** Question index this country becomes due again. */
  dueAt: number
}

export interface Profile {
  id: string
  name: string
  /** Index into the avatar set. A child who cannot read picks by the face. */
  avatar: number
  level: Level
  /** Language of the buttons and labels. */
  uiLang: Lang
  /** Language the country names are learned in. */
  contentLang: Lang
  progress: Record<string, CountryProgress>
  best: Partial<Record<GameMode, number>>
  rounds: number
}
