import { useEffect, useMemo } from 'react'
import { countryByIso, derived } from '../data'
import { PRESETS, type GameMode, type Profile } from '../game/types'
import { useRound } from '../game/useRound'
import { praise, t } from '../i18n/ui'
import { WorldMap } from '../map/WorldMap'
import { canSpeak, speak, stopSpeaking } from '../speech'
import { sounds } from '../sound'
import { useSound } from '../store/settings'
import { ArrowIcon, CrossIcon, HomeIcon, SpeakerIcon, SpeakerOffIcon, TickIcon } from '../ui/icons'
import { CountrySymbol } from '../ui/CountrySymbol'
import { Flag } from '../ui/Flag'
import './GameScreen.css'

interface Props {
  profile: Profile
  mode: GameMode | 'mixed'
  onExit: () => void
  onDone: (score: number, total: number) => void
}

export function GameScreen({ profile, mode, onExit, onDone }: Props) {
  const preset = PRESETS[profile.level]
  const round = useRound(profile, mode)
  const { question, phase, misses } = round
  const { muted, toggleMuted } = useSound()
  const lang = profile.contentLang
  const ui = profile.uiLang

  const target = countryByIso(question.target)!
  const speakable = canSpeak(lang)

  // The little one cannot read: the question is spoken as soon as it appears.
  useEffect(() => {
    if (phase !== 'asking' || !preset.autoSpeak || !speakable) return
    const timer = setTimeout(() => speak(target.name[lang], lang), 260)
    return () => clearTimeout(timer)
  }, [question, phase, preset.autoSpeak, speakable, target, lang])

  const lastAnswer = round.answers[round.answers.length - 1]
  // Derived, not stored: the same answer always gets the same word.
  const cheer = praise(ui, round.answers.length)
  useEffect(() => {
    if (phase !== 'revealed' || !lastAnswer) return
    const timers: number[] = []

    if (lastAnswer.correct) {
      sounds.correct()
      if (speakable) {
        speak(cheer, ui)
        // Long enough for the cheer to finish before the country is named.
        timers.push(window.setTimeout(() => speak(target.name[lang], lang), 1000))
      }
    } else {
      sounds.reveal()
      if (speakable) timers.push(window.setTimeout(() => speak(target.name[lang], lang), 340))
    }

    return () => timers.forEach(clearTimeout)
  }, [phase, lastAnswer, speakable, target, lang, ui, cheer])

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
  }, [question.mode, phase, misses.length, target])

  const revealed = phase === 'revealed'

  /** Every country visited this round, in order, for the route on the map. */
  const trail = useMemo(
    () => round.answers.map((a) => a.question.target),
    [round.answers],
  )
  // A child who cannot read gets the flag question the other way round: the
  // country is spoken aloud and the answers are flags, so nothing needs reading.
  const flagsAsAnswers = question.mode === 'flag' && !preset.showText
  const prompt =
    question.mode === 'flag'
      ? t('askFlag', ui)
      : question.mode === 'locate'
        ? t('askLocate', ui)
        : t('askCapital', ui)

  const optionLabel = (iso: string) => {
    const c = countryByIso(iso)!
    return question.mode === 'capital' ? c.capital[lang] : c.name[lang]
  }

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
        <button
          className="btn btn-ghost btn-round mute"
          onClick={toggleMuted}
          aria-label={muted ? 'Включить звук' : 'Выключить звук'}
        >
          {muted ? <SpeakerOffIcon size={22} /> : <SpeakerIcon size={22} />}
        </button>
        {preset.showText && <div className="score">{round.score}</div>}
      </header>

      <div className="game-map">
        <WorldMap
          correct={revealed ? [target.iso] : []}
          wrong={misses}
          // In the capitals round the country itself is not the answer, so
          // showing it on the map only helps: the child sees where they are.
          highlight={
            !revealed && (question.mode === 'capital' || flagsAsAnswers) ? target.iso : null
          }
          spotlight={hintRegion}
          focus={revealed || question.mode === 'capital' ? target.iso : null}
          capital={revealed ? target.iso : null}
          trail={trail}
          celebrate={revealed && lastAnswer?.correct ? round.score : 0}
          onPick={question.mode === 'locate' && phase === 'asking' ? round.answer : undefined}
          interactive
        />
      </div>

      <section className={`game-panel ${revealed ? 'is-revealed' : ''}`} key={round.answers.length}>
        {!revealed && (
          <>
            {question.mode === 'flag' && !flagsAsAnswers ? (
              <div className="ask-flag">
                {preset.showText && <p className="ask-pill">{prompt}</p>}
                <span className="flag-card">
                  <Flag iso={target.iso} size="xl" label={t('askFlag', ui)} />
                </span>
              </div>
            ) : (
              <div className={`ask-line ${flagsAsAnswers ? 'is-picture' : ''}`}>
                {question.mode === 'capital' && <Flag iso={target.iso} size="md" />}
                <CountrySymbol symbol={target.symbol} size={flagsAsAnswers ? 116 : 84} />
                <div className="ask-copy">
                  <p className="ask-text">{target.name[lang]}</p>
                  {!flagsAsAnswers && <p className="ask-sub">{prompt}</p>}
                </div>
                {speakable && (
                  <button
                    className={`btn btn-ghost btn-round speak ${flagsAsAnswers ? 'is-big' : ''}`}
                    onClick={() => speak(target.name[lang], lang)}
                    aria-label={t('listen', ui)}
                  >
                    <SpeakerIcon size={flagsAsAnswers ? 30 : 22} />
                    {preset.showText && <span>{t('listen', ui)}</span>}
                  </button>
                )}
              </div>
            )}

            {question.mode !== 'locate' && (
              <div className={`options options-${question.options.length} ${flagsAsAnswers ? 'is-flags' : ''}`}>
                {question.options.map((iso) => {
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
                          <CountrySymbol symbol={option.symbol} size={34} />
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
              <CountrySymbol symbol={target.symbol} size={64} />
            </div>
            <div className="reveal-text">
              <b className="reveal-name">{target.name[lang]}</b>
              <span className="reveal-capital">
                {t('capitalIs', ui)}: {target.capital[lang]}
              </span>
              {preset.showText && <p className="reveal-fact">{target.fact[lang]}</p>}
            </div>
            <div className="reveal-actions">
              {speakable && (
                <button
                  className="btn btn-ghost btn-round"
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
