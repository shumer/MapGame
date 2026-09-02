import { animals, animalsOf, countriesOf, countriesWithAnimals, derivedOf, type Country, type Region } from '../data'
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

/** The countries a given preset is allowed to ask about, within one set. */
export function poolFor(preset: Preset, region: Region): Country[] {
  return countriesOf(region).filter((c) => c.fame <= preset.maxFame)
}

export function poolForMode(preset: Preset, mode: GameMode, region: Region): Country[] {
  // Only countries with an animal can be asked about in the animal round.
  if (mode === 'animals') {
    return countriesWithAnimals(region).filter((c) => c.fame <= preset.maxFame)
  }
  return poolFor(preset, region)
}

/** The continents an animal is found on, used to keep the widespread ones out
    of the wrong answers. */
const continentsOf = (animal: (typeof animals)[number]): Set<Region> => {
  const out = new Set<Region>()
  for (const iso of animal.livesIn) {
    const country = countriesOf('world').find((c) => c.iso === iso)
    for (const r of country?.regions ?? []) if (r !== 'world') out.add(r)
  }
  return out
}

/**
 * "Where does the orangutan live?" Picks an animal of this country and then
 * countries that it does not live in, so exactly one option on the list is
 * right. Returns null when no such set can be built.
 */
function reverseAnimalQuestion(
  target: Country,
  pool: Country[],
  count: number,
  region: Region,
): { options: string[]; askedAnimal: string } | null {
  const derived = derivedOf(region)
  const candidates = shuffle(animalsOf(target.iso).map((a) => a.id))
  for (const id of candidates) {
    const animal = animals.find((a) => a.id === id)
    if (!animal) continue
    const lives = new Set(animal.livesIn)
    // Neighbours first: "where does the lion live" is a real question when the
    // other options are African too.
    const near = derived[target.iso].near.filter((iso) => !lives.has(iso))
    const rest = pool.map((c) => c.iso).filter((iso) => !lives.has(iso) && !near.includes(iso))
    const wrong = [...shuffle(near), ...shuffle(rest)].slice(0, count)
    if (wrong.length === count) {
      return { options: shuffle([target.iso, ...wrong]), askedAnimal: id }
    }
  }
  return null
}

/** How few countries make the animal round repetitive rather than a round. */
export const ANIMAL_MIN_POOL = 6

/**
 * Wrong animals for "who lives here".
 *
 * The obvious rule -- offer anything not listed for this country -- is not
 * honest enough. The lists say where an animal is known for living, not
 * everywhere it exists, so hippos and crocodiles are absent from Ethiopia's
 * list while being perfectly real there. A child who knows that would be told
 * they are wrong, which is the worst thing this game can do.
 *
 * So a wrong answer has to be wrong by continent: an animal that lives nowhere
 * in the set the question is being asked in. Then "not in Ethiopia" is backed
 * by "not in Africa at all", which is a claim the data can actually support.
 */
function animalOptions(target: Country, count: number, kind: Preset['distractors']): string[] {
  const here = animalsOf(target.iso)
  const right = pickOne(here)

  // Measured against the country's own continent rather than the set being
  // played: in the world set every animal lives somewhere in it, so nothing
  // would ever be foreign.
  const home = target.regions.find((r) => r !== 'world') ?? target.regions[0]
  const inRegion = new Set(countriesOf(home).map((c) => c.iso))

  // Widespread animals make bad wrong answers even when the data does not list
  // them here: owls, foxes and snakes live nearly everywhere, so "the owl does
  // not live in Congo" is a claim the game cannot honestly make. Only animals
  // tied to one or two continents are offered as wrong.
  const foreign = animals.filter(
    (a) => !a.livesIn.some((iso) => inRegion.has(iso)) && continentsOf(a).size <= 2,
  )

  // For the older child, prefer wrong answers of the same kind of creature, so
  // the choice is about geography rather than about spotting the odd one out.
  const sameSize = foreign.filter((a) => a.livesIn.length >= 4)
  const preferred = kind === 'near' && sameSize.length >= count ? sameSize : foreign
  const wrong = shuffle(preferred.map((a) => a.id)).slice(0, count)
  return shuffle([right.id, ...wrong])
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
 * hard; 'far' picks countries from the other end of the continent, so a five
 * year old is choosing between two obviously different things.
 */
function distractors(
  target: Country,
  pool: Country[],
  count: number,
  kind: Preset['distractors'],
  region: Region,
): string[] {
  const derived = derivedOf(region)
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

export function buildQuestion(
  mode: GameMode,
  target: Country,
  pool: Country[],
  preset: Preset,
  region: Region,
): Question {
  if (mode === 'locate') {
    return { mode, target: target.iso, options: [] }
  }
  if (mode === 'animals') {
    // Two directions, mixed inside a round. The reverse one does not need an
    // animal that lives in one country only: it needs a set of options where
    // exactly one country is a place this animal lives. The lion can be asked
    // about as long as Kenya is the only lion country on the list.
    if (preset.showText && Math.random() < 0.4) {
      const reverse = reverseAnimalQuestion(target, pool, preset.choices - 1, region)
      if (reverse) return { mode, target: target.iso, ...reverse }
    }
    const options = animalOptions(target, preset.choices - 1, preset.distractors)
    const answer = options.find((id) => animalsOf(target.iso).some((a) => a.id === id))
    return { mode, target: target.iso, options, answer }
  }
  const wrong = distractors(target, pool, preset.choices - 1, preset.distractors, region)
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
