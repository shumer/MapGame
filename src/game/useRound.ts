import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { countryByIso } from '../data'
import { useProfiles } from '../store/profiles'
import { advance, buildQuestion, nextMode, pickTarget, poolFor } from './questions'
import { PRESETS, type Answer, type GameMode, type Profile, type Question } from './types'

/** Wrong tries on the map before the answer is simply shown. */
const LOCATE_TRIES = 2

/**
 * How often one country may come up within a single round. Spaced repetition
 * deliberately brings a missed country back, but three visits to the same place
 * in one journey reads as the game being stuck, not as revision.
 */
const MAX_PER_ROUND = 2

/**
 * How long a wrong answer stays on screen before the right one is revealed.
 * Long enough to see the button turn red and shake, and to hear it.
 */
const WRONG_ANSWER_PAUSE = 850

export type Phase = 'asking' | 'revealed' | 'done'

export interface RoundState {
  phase: Phase
  question: Question
  /** Answers given so far this round. */
  answers: Answer[]
  /** Wrong picks on the current question. */
  misses: string[]
  index: number
  total: number
  score: number
  answer: (iso: string) => void
  next: () => void
}

export function useRound(profile: Profile, mode: GameMode | 'mixed'): RoundState {
  const preset = PRESETS[profile.level]
  const saveProgress = useProfiles((s) => s.saveProgress)

  const pool = useMemo(() => poolFor(preset), [preset])
  // A round works off its own copy of the memory so repeats inside one round
  // are scheduled even before anything is written back to the profile.
  const memory = useRef({ ...profile.progress })
  const asked = useRef(0)
  /** How many times each country has come up this round. */
  const seenThisRound = useRef<Record<string, number>>({})

  // The first question of a round is always at index zero, so this does not
  // need to read the counter.
  const start = useCallback((): Question => {
    const chosen = mode === 'mixed' ? nextMode(preset, null) : mode
    const target = pickTarget(pool, profile.progress, 0, null)
    return buildQuestion(chosen, target, pool, preset)
  }, [mode, pool, preset, profile.progress])

  /** The countries still allowed this round. */
  const available = useCallback(() => {
    const left = pool.filter((c) => (seenThisRound.current[c.iso] ?? 0) < MAX_PER_ROUND)
    return left.length ? left : pool
  }, [pool])

  const [question, setQuestion] = useState<Question>(start)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [misses, setMisses] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>('asking')
  const revealTimer = useRef(0)

  useEffect(() => () => clearTimeout(revealTimer.current), [])

  const commit = useCallback(
    (picked: string, correct: boolean, attempts: number) => {
      const next = advance(memory.current[question.target], correct, asked.current)
      memory.current[question.target] = next
      saveProgress(profile.id, question.target, next)
      seenThisRound.current[question.target] = (seenThisRound.current[question.target] ?? 0) + 1
      setAnswers((a) => [...a, { question, picked, correct, attempts }])
      setPhase('revealed')
    },
    [profile.id, question, saveProgress],
  )

  const answer = useCallback(
    (iso: string) => {
      if (phase !== 'asking' || revealTimer.current) return
      if (iso === question.target) {
        commit(iso, misses.length === 0, misses.length + 1)
        return
      }

      const tried = [...new Set([...misses, iso])]
      setMisses(tried)

      // On the map a child gets another go with the region hinted.
      if (question.mode === 'locate' && tried.length < LOCATE_TRIES) return

      // Otherwise hold on the wrong answer for a moment: the button turns red
      // and shakes, the sound plays, and only then does the map give it away.
      revealTimer.current = window.setTimeout(() => {
        revealTimer.current = 0
        commit(iso, false, tried.length)
      }, WRONG_ANSWER_PAUSE)
    },
    [commit, misses, phase, question],
  )

  const next = useCallback(() => {
    clearTimeout(revealTimer.current)
    revealTimer.current = 0
    asked.current += 1
    if (asked.current >= preset.questionsPerRound) {
      setPhase('done')
      return
    }
    const chosen = mode === 'mixed' ? nextMode(preset, question.mode) : mode
    const target = pickTarget(available(), memory.current, asked.current, question.target)
    setQuestion(buildQuestion(chosen, target, pool, preset))
    setMisses([])
    setPhase('asking')
  }, [mode, pool, preset, question, available])

  return {
    phase,
    question,
    answers,
    misses,
    index: answers.length,
    total: preset.questionsPerRound,
    score: answers.filter((a) => a.correct).length,
    answer,
    next,
  }
}

/** Text a question should be read aloud as. */
export function questionSpeech(q: Question, lang: 'ru' | 'pl' | 'en'): string {
  const c = countryByIso(q.target)
  if (!c) return ''
  if (q.mode === 'flag') return ''
  return c.name[lang]
}
