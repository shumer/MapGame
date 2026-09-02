import { useEffect } from 'react'
import type { Lang } from '../data'
import { LANG_NAMES, t } from '../i18n/ui'
import { useProfiles } from '../store/profiles'
import { useLang } from '../store/settings'
import { PRESETS, type Level } from '../game/types'
import { Flag } from '../ui/Flag'
import { Kid } from '../ui/Kid'
import { PlayBadge } from '../ui/PlayBadge'
import { Scenery } from '../ui/Scenery'
import { Star } from '../ui/Star'
import { sounds } from '../sound'
import { canSpeak, speak } from '../speech'
import { say } from '../voice'
import './StartScreen.css'

const LEVELS: Level[] = ['little', 'expert']

/** The flag stands in for the language: a child picks it without reading. */
const LANG_FLAG: Record<Lang, string> = { ru: 'RU', pl: 'PL', en: 'GB' }
const LANGS: Lang[] = ['ru', 'pl', 'en']

export function StartScreen({ onReady }: { onReady: () => void }) {
  const { profiles, play } = useProfiles()
  const { lang, setLang } = useLang()

  // Asked once, on arrival: the child who cannot read needs to be told what
  // this screen wants from her. Browsers refuse audio before a gesture, so
  // this is silent on a cold load and speaks on the way back from a round.
  useEffect(() => {
    const timer = setTimeout(() => say('who-plays', t('whoPlays', lang), lang), 500)
    return () => clearTimeout(timer)
  }, [lang])

  const start = (level: Level) => {
    sounds.tap()
    // Named aloud on the way in, so a child who cannot read hears which
    // character they just chose.
    if (canSpeak(lang)) speak(t(level === 'little' ? 'levelLittle' : 'levelExpert', lang), lang)
    play(level, lang)
    onReady()
  }

  const pickLang = (l: Lang) => {
    setLang(l)
    sounds.tap()
    if (canSpeak(l)) speak(LANG_NAMES[l], l)
  }

  return (
    <div className="start">
      <Scenery />

      <div className="start-inner">
        <h1 className="start-title">{t('appName', lang)}</h1>
        <p className="start-lead">{t('whoPlays', lang)}</p>

        <div className="kids">
          {LEVELS.map((level) => {
            const saved = profiles.find((p) => p.id === level)
            const learned = saved
              ? Object.values(saved.progress).filter((p) => p.streak >= 3).length
              : 0
            return (
              <button key={level} className={`kid-card kid-${level}`} onClick={() => start(level)}>
                <span className="kid-art">
                  <Kid level={level} />
                </span>
                <span className="kid-name">
                  {t(level === 'little' ? 'levelLittle' : 'levelExpert', lang)}
                </span>
                <span className="kid-hint">
                  {t(level === 'little' ? 'levelLittleHint' : 'levelExpertHint', lang)}
                </span>
                <span className={`kid-progress ${learned > 0 ? '' : 'is-empty'}`}>
                  <Star size={14} />
                  {learned} / {PRESETS[level].maxFame === 1 ? 23 : 45}
                </span>
                <PlayBadge />
              </button>
            )
          })}
        </div>

        {/* Language lives here, as flags: the choice sticks between sessions and
            applies to whichever character plays next. */}
        <div className="langs">
          <span className="langs-label">{t('langContent', lang)}</span>
          <div className="langs-row">
            {LANGS.map((l) => (
              <button
                key={l}
                className={`lang-pick ${lang === l ? 'is-on' : ''}`}
                onClick={() => pickLang(l)}
                aria-pressed={lang === l}
                aria-label={LANG_NAMES[l]}
              >
                <Flag iso={LANG_FLAG[l]} size="md" />
                <span className="lang-tick" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
