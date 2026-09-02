import { useEffect, useMemo } from 'react'
import { animals, countryByIso, derivedOf, wikiFacts, type Region } from '../data'
import { PRESETS, type GameMode, type Profile } from '../game/types'
import { useRound } from '../game/useRound'
import { consolation, consolationKey, praise, praiseKey, t } from '../i18n/ui'
import { renderFact, renderWikiFacts, type WikiFacts } from '../i18n/facts'
import { WorldMap } from '../map/WorldMap'
import { canSpeak, speak, stopSpeaking } from '../speech'
import { say, stopVoice } from '../voice'
import type { GameMode as Mode } from '../game/types'
import { sounds } from '../sound'
import { useSound } from '../store/settings'
import {
  ArrowIcon,
  CrossIcon,
  HomeIcon,
  SpeakerIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
  TickIcon,
} from '../ui/icons'
import { CountrySymbol } from '../ui/CountrySymbol'
import { Flag } from '../ui/Flag'
import './GameScreen.css'

interface Props {
  profile: Profile
  mode: GameMode | 'mixed'
  region: Region
  onExit: () => void
  onDone: (score: number, total: number) => void
}

export function GameScreen({ profile, mode, region, onExit, onDone }: Props) {
  const preset = PRESETS[profile.level]
  const derived = derivedOf(region)
  const round = useRound(profile, mode, region)
  const { question, phase, misses } = round
  const { mode: soundMode, cycleSound } = useSound()
  const lang = profile.contentLang
  const ui = profile.uiLang

  const target = countryByIso(question.target)!

  const speakable = canSpeak(lang)

  /** Recorded prompt for each round type; spoken once, at the round's start. */
  const promptKey = (mode: Mode, picturesOnly: boolean) =>
    mode === 'locate'
      ? 'where-is-it'
      : mode === 'capital'
        ? 'which-capital'
        : picturesOnly
          ? 'find-flag'
          : 'whose-flag'

  // The little one cannot read: the question is spoken as soon as it appears.
  // The first question of a round opens with the spoken prompt, then the
  // country. After that only the country is named: hearing the same
  // instruction twelve times over is not help, it is noise.
  const first = round.answers.length === 0
  useEffect(() => {
    if (phase !== 'asking') return
    const timers: number[] = []

    let cancelled = false
    const nameIt = () => {
      if (!cancelled && preset.autoSpeak && speakable) speak(target.name[lang], lang)
    }

    if (first) {
      // Opening the round: greeting, then the prompt, then the country — each
      // waiting for the one before rather than racing it.
      say('start-01', t('play', ui), ui)
        .then(() => (cancelled ? null : say(promptKey(question.mode, flagsAsAnswers), prompt, ui)))
        .then(nameIt)
    } else {
      timers.push(window.setTimeout(nameIt, 260))
    }

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, phase])

  const lastAnswer = round.answers[round.answers.length - 1]
  // Derived, not stored: the same answer always gets the same word.
  const cheer = praise(ui, round.answers.length)
  const commiseration = consolation(ui, round.answers.length)
  useEffect(() => {
    if (phase !== 'revealed' || !lastAnswer) return
    const timers: number[] = []

    let cancelled = false
    const line = lastAnswer.correct
      ? (sounds.correct(), say(praiseKey(round.answers.length), cheer, ui))
      : (sounds.reveal(), say(consolationKey(round.answers.length), commiseration, ui))

    // The country is named only once the reaction has finished speaking.
    line.then(() => {
      if (!cancelled && speakable) speak(target.name[lang], lang)
    })

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      stopVoice()
      stopSpeaking()
    }
  }, [phase, lastAnswer, speakable, target, lang, ui, cheer, commiseration, round.answers.length])

  // Every wrong pick sounds, whether it ends the question or not.
  const missCount = misses.length
  useEffect(() => {
    if (missCount > 0) sounds.wrong()
  }, [missCount])

  useEffect(() => stopSpeaking, [])

  useEffect(() => {
    if (phase === 'done') onDone(round.score, round.total)
  }, [phase, onDone, round.score, round.total])

  // One wrong try on the map lights up the neighbourhood as a hint.
  const hintRegion = useMemo(() => {
    if (question.mode !== 'locate' || phase !== 'asking' || misses.length === 0) return undefined
    return [target.iso, ...derived[target.iso].near]
  }, [question.mode, phase, misses.length, target, derived])

  const revealed = phase === 'revealed'

  /**
   * Stops on the route: each country once, in the order it was first reached.
   * A country can legitimately come up twice in a round, but planting a second
   * flag on it would read as a bug.
   */
  const trail = useMemo(
    () => [...new Set(round.answers.map((a) => a.question.target))],
    [round.answers],
  )

  /**
   * A fact about the country. Only for the older child: the little one cannot
   * read it. Rotates per question rather than per render.
   */
  const fact = useMemo(() => {
    if (!preset.showText) return null
    const fromMap = (derived[target.iso].facts ?? [])
      .map((f) => renderFact(f, lang))
      .filter((x): x is string => Boolean(x))
    const fromWiki = renderWikiFacts((wikiFacts[target.iso] ?? {}) as WikiFacts, lang)
    // Written facts first: they are the interesting ones. The computed ones
    // fill in for countries that have none.
    const written = [target.fact?.[lang], ...(target.stories ?? []).map((s) => s[lang])].filter(
      (x): x is string => Boolean(x),
    )
    const all = [...written, ...fromWiki, ...fromMap]
    if (!all.length) return null
    return all[(round.answers.length + target.iso.charCodeAt(0)) % all.length]
  }, [preset.showText, target.iso, target.stories, target.fact, lang, round.answers.length, derived])

  /** The traveller stands where the last answer was, revisit or not. */
  const travellerAt = round.answers[round.answers.length - 1]?.question.target ?? null
  // A child who cannot read gets the flag question the other way round: the
  // country is spoken aloud and the answers are flags, so nothing needs reading.
  const flagsAsAnswers = question.mode === 'flag' && !preset.showText
  /** The rounds that put a flag on the panel and words on the buttons. The
      capitals round names no country: the flag is the only clue, so it asks
      whose flag this is and what its capital is at once. */
  const showsFlag = question.mode === 'flag' ? !flagsAsAnswers : question.mode === 'capital'
  const prompt =
    question.mode === 'flag'
      ? t('askFlag', ui)
      : question.mode === 'locate'
        ? t('askLocate', ui)
        : question.mode === 'animals'
          ? t('whoLivesHere', ui)
          : t('askCapital', ui)

  const optionLabel = (iso: string) => {
    const c = countryByIso(iso)!
    return question.mode === 'capital' ? c.capital[lang] : c.name[lang]
  }

  const animalById = (id: string) => animals.find((a) => a.id === id)
  const isAnimals = question.mode === 'animals'
  /** The animal round the other way round: the creature is the question. */
  const asked = question.askedAnimal ? animalById(question.askedAnimal) : null

  return (
    <div className={`game mode-${question.mode}`}>
      <header className="game-bar">
        <button className="btn btn-ghost btn-round home" onClick={onExit} aria-label={t('home', ui)}>
          <HomeIcon size={22} />
          <span className="home-label">{t('home', ui)}</span>
        </button>
        <div className="pips" aria-label={`${round.index} / ${round.total}`}>
          {Array.from({ length: round.total }, (_, i) => (
            <span
              key={i}
              className={
                i < round.answers.length
                  ? round.answers[i].correct
                    ? 'pip is-hit'
                    : 'pip is-miss'
                  : i === round.answers.length
                    ? 'pip is-now'
                    : 'pip'
              }
            />
          ))}
        </div>
        {/* One button, three steps: everything, effects only, silence. */}
        <button
          className={`btn btn-ghost btn-round btn-icon mute is-${soundMode}`}
          onClick={cycleSound}
          aria-label={t(
            soundMode === 'full' ? 'soundFull' : soundMode === 'effects' ? 'soundEffects' : 'soundOff',
            ui,
          )}
          title={t(
            soundMode === 'full' ? 'soundFull' : soundMode === 'effects' ? 'soundEffects' : 'soundOff',
            ui,
          )}
        >
          {soundMode === 'full' ? (
            <SpeakerIcon size={22} />
          ) : soundMode === 'effects' ? (
            <SpeakerQuietIcon size={22} />
          ) : (
            <SpeakerOffIcon size={22} />
          )}
        </button>
        {preset.showText && <div className="score">{round.score}</div>}
      </header>

      <div className="game-map">
        <WorldMap
          region={region}
          correct={revealed ? [target.iso] : []}
          wrong={misses}
          // In the capitals round the country itself is not the answer, so
          // showing it on the map only helps: the child sees where they are.
          // The animal round asks about a named country, so it is marked from
          // the start: the question is which creature lives there.
          highlight={!revealed && (flagsAsAnswers || (isAnimals && !asked)) ? target.iso : null}
          spotlight={hintRegion}
          focus={revealed || (isAnimals && !asked) ? target.iso : null}
          capital={revealed ? target.iso : null}
          trail={trail}
          travellerAt={travellerAt}
          celebrate={revealed && lastAnswer?.correct ? round.score : 0}
          onPick={question.mode === 'locate' && phase === 'asking' ? round.answer : undefined}
          interactive
        />
      </div>

      <section
        className={`game-panel ${revealed ? 'is-revealed' : ''}`}
        key={round.answers.length}
      >
        {!revealed && (
          <>
            {asked ? (
              <div className="ask-animal">
                {preset.showText && <p className="ask-pill">{t('whereLives', ui)}</p>}
                <span className="animal-card">
                  <CountrySymbol symbol={asked.id} size={168} />
                </span>
                <p className="ask-text">{asked.name[lang]}</p>
              </div>
            ) : showsFlag ? (
              <div className="ask-flag">
                {preset.showText && <p className="ask-pill">{prompt}</p>}
                <span className="flag-card">
                  <Flag iso={target.iso} size="xl" label={t('askFlag', ui)} />
                </span>
              </div>
            ) : (
              <div className={`ask-line ${flagsAsAnswers ? 'is-picture' : ''}`}>
                {(question.mode === 'capital' || isAnimals) && <Flag iso={target.iso} size="md" />}
                {/* Never in the animal round: for half the countries the
                    symbol IS the animal being asked about. */}
                {!isAnimals && (
                  <CountrySymbol symbol={target.symbol} size={flagsAsAnswers ? 116 : 84} />
                )}
                <div className="ask-copy">
                  <p className="ask-text">{target.name[lang]}</p>
                  {!flagsAsAnswers && <p className="ask-sub">{prompt}</p>}
                </div>
                {speakable && (
                  <button
                    className={`btn btn-ghost btn-round speak ${
                      preset.showText ? '' : 'btn-icon'
                    } ${flagsAsAnswers ? 'is-big' : ''}`}
                    onClick={() => speak(target.name[lang], lang)}
                    aria-label={t('listen', ui)}
                  >
                    <SpeakerIcon size={flagsAsAnswers ? 30 : 22} />
                    {preset.showText && <span>{t('listen', ui)}</span>}
                  </button>
                )}
              </div>
            )}

            {/* Only in the round that names the country. Everywhere else the
                question is a flag, and a fact naming the language or the
                national dish would simply answer it. */}
            {fact && question.mode === 'locate' && <p className="fact-line">{fact}</p>}

            {question.mode !== 'locate' && (
              <div
                className={`options options-${question.options.length} ${
                  flagsAsAnswers ? 'is-flags' : ''
                } ${isAnimals ? 'is-animals' : ''}`}
              >
                {isAnimals &&
                  !asked &&
                  question.options.map((id) => {
                    const animal = animalById(id)
                    if (!animal) return null
                    return (
                      <button
                        key={id}
                        className={`option option-animal ${misses.includes(id) ? 'is-out' : ''}`}
                        disabled={misses.includes(id)}
                        onClick={() => round.answer(id)}
                      >
                        <CountrySymbol symbol={animal.id} size={preset.showText ? 76 : 128} />
                        {preset.showText && <span>{animal.name[lang]}</span>}
                        {misses.includes(id) && <CrossIcon size={22} />}
                      </button>
                    )
                  })}
                {(!isAnimals || asked) &&
                  question.options.map((iso) => {
                  const option = countryByIso(iso)!
                  return (
                    <button
                      key={iso}
                      className={`option ${misses.includes(iso) ? 'is-out' : ''}`}
                      disabled={misses.includes(iso)}
                      onClick={() => round.answer(iso)}
                    >
                      {flagsAsAnswers ? (
                        <Flag iso={iso} size="lg" />
                      ) : (
                        <>
                          {/* Only when the options are countries. On a list of
                              capitals the country's symbol both gives the answer
                              away — it is shown beside the question too — and
                              labels a city with a country's badge. */}
                          {question.mode === 'flag' && (
                            <CountrySymbol symbol={option.symbol} size={34} />
                          )}
                          <span>{optionLabel(iso)}</span>
                          {misses.includes(iso) && <CrossIcon size={22} />}
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}

        {revealed && (
          <div className="reveal">
            {/* The outcome, stated before the facts. A miss gets amber and an
                arrow rather than red: the button already went red, and telling
                a child off twice for one mistake is not the point. */}
            <div className={`reveal-banner ${lastAnswer?.correct ? 'is-win' : 'is-miss'}`}>
              {lastAnswer?.correct ? <TickIcon size={22} /> : <ArrowIcon size={22} />}
              <span>{lastAnswer?.correct ? cheer : t('thisIsIt', ui)}</span>
            </div>

            <div className="reveal-art">
              <Flag iso={target.iso} size="lg" label={target.name[lang]} />
              {/* The animal that was the answer, rather than the country's own
                  symbol, which in this round would often be the same picture. */}
              <CountrySymbol
                symbol={isAnimals ? (asked?.id ?? question.answer) : target.symbol}
                size={64}
              />
            </div>
            <div className="reveal-text">
              <b className="reveal-name">{target.name[lang]}</b>
              {isAnimals && (question.answer || asked) && (
                <span className="reveal-capital">
                  {(asked ?? animalById(question.answer!))?.name[lang]} {t('livesIn', ui)}
                </span>
              )}
              {!isAnimals && (
                <span className="reveal-capital">
                  {t('capitalIs', ui)}: {target.capital[lang]}
                </span>
              )}
              {preset.showText && fact && <p className="reveal-fact">{fact}</p>}
            </div>
            <div className="reveal-actions">
              {speakable && (
                <button
                  className="btn btn-ghost btn-round btn-icon"
                  onClick={() => speak(`${target.name[lang]}. ${target.capital[lang]}`, lang)}
                  aria-label={t('listen', ui)}
                >
                  <SpeakerIcon size={22} />
                </button>
              )}
              <button className="btn btn-primary" onClick={round.next}>
                {t('next', ui)}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
