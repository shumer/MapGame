import type { Lang } from '../data'
import { t } from '../i18n/ui'
import { useProfiles } from '../store/profiles'
import { useLang } from '../store/settings'
import { PRESETS, type Level } from '../game/types'
import { Flag } from '../ui/Flag'
import { Kid } from '../ui/Kid'
import { sounds } from '../sound'
import './StartScreen.css'

const LEVELS: Level[] = ['little', 'expert']

/** The flag stands in for the language: a child picks it without reading. */
const LANG_FLAG: Record<Lang, string> = { ru: 'RU', pl: 'PL', en: 'GB' }
const LANGS: Lang[] = ['ru', 'pl', 'en']

/** Painted backdrop: sky, clouds, hills and a plane trailing a dotted route. */
function Scenery() {
  return (
    <svg className="scenery" viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe4f5" />
          <stop offset="100%" stopColor="#e7f3f8" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#sky)" />

      <circle cx="648" cy="76" r="44" fill="#ffe08a" />
      <circle cx="648" cy="76" r="60" fill="#ffe08a" opacity="0.35" />

      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="200" cy="92" rx="44" ry="25" />
        <ellipse cx="238" cy="84" rx="32" ry="21" />
        <ellipse cx="166" cy="84" rx="28" ry="18" />
        <ellipse cx="452" cy="60" rx="36" ry="20" />
        <ellipse cx="484" cy="54" rx="26" ry="16" />
        <ellipse cx="330" cy="132" rx="28" ry="15" opacity="0.75" />
      </g>

      {/* Dotted flight path with a little plane at the end. The whole route
          stays well inside the frame, which is cropped on wide screens. */}
      <path
        d="M170 258C240 214 300 268 372 236S520 196 606 214"
        stroke="#8fb8c9"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 14"
        fill="none"
        opacity="0.85"
      />
      <g transform="translate(612 214) rotate(-8)">
        <path d="M0 0l-26-8 4 8-4 8 26-8z" fill="#e2685f" />
        <path d="M-12-2l-6-14 8 2 6 12z" fill="#c8534b" />
      </g>

      {/* Rolling hills. */}
      <path d="M0 350c120-40 210 20 320 6s180-60 300-40 180 44 180 44v140H0z" fill="#a9d9a4" />
      <path d="M0 402c140-34 250 16 380 4s230-42 420-24v118H0z" fill="#8ecb8c" />
      <g fill="#6fb573">
        <circle cx="96" cy="392" r="20" />
        <circle cx="120" cy="400" r="14" />
        <circle cx="700" cy="404" r="18" />
        <circle cx="676" cy="412" r="12" />
      </g>
    </svg>
  )
}

export function StartScreen({ onReady }: { onReady: () => void }) {
  const { profiles, play } = useProfiles()
  const { lang, setLang } = useLang()

  const start = (level: Level) => {
    sounds.tap()
    play(level, lang)
    onReady()
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
                <Kid level={level} />
                <span className="kid-name">{t(level === 'little' ? 'levelLittle' : 'levelExpert', lang)}</span>
                <span className="kid-hint">
                  {t(level === 'little' ? 'levelLittleHint' : 'levelExpertHint', lang)}
                </span>
                {learned > 0 && (
                  <span className="kid-progress">
                    ★ {learned} / {PRESETS[level].maxFame === 1 ? 23 : 45}
                  </span>
                )}
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
                onClick={() => {
                  setLang(l)
                  sounds.tap()
                }}
                aria-pressed={lang === l}
                aria-label={l}
              >
                <Flag iso={LANG_FLAG[l]} size="md" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
