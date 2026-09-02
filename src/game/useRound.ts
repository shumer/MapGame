import { useCallback, useMemo, useRef, useState } from 'react'
import { countryByIso } from '../data'
import { useProfiles } from '../store/profiles'
import { advance, buildQuestion, nextMode, pickTarget, poolFor } from './questions'
import { PRESETS, type Answer, type GameMode, type Profile, type Question } from './types'

/** Wrong tries on the map before the answer is simply shown. */
const LOCATE_TRIES = 2

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

  // The first question of a round is always at index zero, so this does not
  // need to read the counter.
  const start = useCallback((): Question => {
    const chosen = mode === 'mixed' ? nextMode(preset, null) : mode
    const target = pickTarget(pool, profile.progress, 0, null)
    return buildQuestion(chosen, target, pool, preset)
  }, [mode, pool, preset, profile.progress])

  const [question, setQuestion] = useState<Question>(start)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [misses, setMisses] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>('asking')

  const commit = useCallback(
    (picked: string, correct: boolean, attempts: number) => {
      const next = advance(memory.current[question.target], correct, asked.current)
      memory.current[question.target] = next
      saveProgress(profile.id, question.target, next)
      setAnswers((a) => [...a, { question, picked, correct, attempts }])
      setPhase('revealed')
    },
    [profile.id, question, saveProgress],
  )

  const answer = useCallback(
    (iso: string) => {
      if (phase !== 'asking') return
      if (iso === question.target) {
        commit(iso, misses.length === 0, misses.length + 1)
        return
      }
      const tried = [...new Set([...misses, iso])]
      setMisses(tried)
      // On the map a child gets another go with the region hinted; a wrong
      // button answer is final, and the right one is shown straight away.
      if (question.mode === 'locate' && tried.length < LOCATE_TRIES) return
      commit(iso, false, tried.length)
    },
    [commit, misses, phase, question],
  )

  const next = useCallback(() => {
    asked.current += 1
    if (asked.current >= preset.questionsPerRound) {
      setPhase('done')
      return
    }
    const chosen = mode === 'mixed' ? nextMode(preset, question.mode) : mode
    const target = pickTarget(pool, memory.current, asked.current, question.target)
    setQuestion(buildQuestion(chosen, target, pool, preset))
    setMisses([])
    setPhase('asking')
  }, [mode, pool, preset, question])

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
