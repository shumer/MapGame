import { countries, derived, type Country } from '../data'
import type { CountryProgress, GameMode, Preset, Question } from './types'

/** How many questions later a country comes back, by how well it is known. */
const SPACING = [3, 8, 20, 45, 90]

export const spacingFor = (streak: number) => SPACING[Math.min(streak, SPACING.length - 1)]

const shuffle = <T>(list: T[]): T[] => {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const pickOne = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

export const emptyProgress = (): CountryProgress => ({ streak: 0, seen: 0, missed: 0, dueAt: 0 })

/** The countries a given preset is allowed to ask about. */
export function poolFor(preset: Preset): Country[] {
  return countries.filter((c) => c.fame <= preset.maxFame)
}

export function poolForMode(preset: Preset, _mode: GameMode): Country[] {
  return poolFor(preset)
}

/**
 * Picks what to ask next. Countries that were missed come back soonest; when
 * nothing is due, an unseen country is introduced, easiest tier first.
 */
export function pickTarget(
  pool: Country[],
  progress: Record<string, CountryProgress>,
  index: number,
  avoid: string | null,
): Country {
  const options = pool.filter((c) => c.iso !== avoid)
  const candidates = options.length ? options : pool

  const due = candidates
    .filter((c) => {
      const p = progress[c.iso]
      return p && p.seen > 0 && p.dueAt <= index
    })
    .sort((a, b) => (progress[a.iso].dueAt - progress[b.iso].dueAt) || (progress[a.iso].streak - progress[b.iso].streak))

  if (due.length) return due[0]

  const unseen = candidates.filter((c) => !progress[c.iso]?.seen)
  if (unseen.length) {
    const easiest = Math.min(...unseen.map((c) => c.fame))
    return pickOne(unseen.filter((c) => c.fame === easiest))
  }

  // Everything is known and nothing is due yet: revisit the weakest.
  const weakest = [...candidates].sort(
    (a, b) => (progress[a.iso]?.streak ?? 0) - (progress[b.iso]?.streak ?? 0),
  )
  return pickOne(weakest.slice(0, Math.max(3, Math.ceil(weakest.length / 4))))
}

/**
 * Wrong answers. 'near' picks neighbours, which makes the question genuinely
 * hard; 'far' picks countries from other parts of Europe, so a five year old
 * is choosing between two obviously different things.
 */
function distractors(target: Country, pool: Country[], count: number, kind: Preset['distractors']): string[] {
  const others = pool.filter((c) => c.iso !== target.iso)
  if (kind === 'near') {
    const near = derived[target.iso].near.filter((iso) => others.some((c) => c.iso === iso))
    const rest = shuffle(others.map((c) => c.iso).filter((iso) => !near.includes(iso)))
    return [...shuffle(near), ...rest].slice(0, count)
  }
  const far = others.filter(
    (c) => c.subregion !== target.subregion && !derived[target.iso].borders.includes(c.iso),
  )
  return shuffle((far.length >= count ? far : others).map((c) => c.iso)).slice(0, count)
}

export function buildQuestion(mode: GameMode, target: Country, pool: Country[], preset: Preset): Question {
  if (mode === 'locate') {
    return { mode, target: target.iso, options: [] }
  }
  const wrong = distractors(target, pool, preset.choices - 1, preset.distractors)
  return { mode, target: target.iso, options: shuffle([target.iso, ...wrong]) }
}

/** Progress after an answer: a miss brings the country back within a few turns. */
export function advance(
  current: CountryProgress | undefined,
  correct: boolean,
  index: number,
): CountryProgress {
  const p = current ?? emptyProgress()
  const streak = correct ? p.streak + 1 : 0
  return {
    streak,
    seen: p.seen + 1,
    missed: p.missed + (correct ? 0 : 1),
    dueAt: index + (correct ? spacingFor(streak) : SPACING[0]),
  }
}

export const nextMode = (preset: Preset, previous: GameMode | null): GameMode => {
  const options = preset.modes.filter((m) => m !== previous)
  return pickOne(options.length ? options : preset.modes)
}
