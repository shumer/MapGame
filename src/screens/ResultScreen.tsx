import { useEffect } from 'react'
import { t } from '../i18n/ui'
import type { Profile } from '../game/types'
import { sounds } from '../sound'
import { Avatar } from '../ui/Avatar'
import { Confetti } from '../ui/Confetti'
import './ResultScreen.css'

interface Props {
  profile: Profile
  score: number
  total: number
  isBest: boolean
  onAgain: () => void
  onHome: () => void
}

/** Three stars at nine tenths, two at two thirds, one for finishing at all. */
function starsFor(score: number, total: number): number {
  const share = score / total
  if (share >= 0.9) return 3
  if (share >= 0.66) return 2
  return 1
}

export function ResultScreen({ profile, score, total, isBest, onAgain, onHome }: Props) {
  const ui = profile.uiLang
  const stars = starsFor(score, total)

  useEffect(() => {
    sounds.fanfare(stars)
  }, [stars])

  return (
    <div className="result">
      {/* Two rounds of poppers, so the finish feels bigger than one answer. */}
      <Confetti trigger={1} count={90} />
      <Confetti trigger={2} count={90} mode="burst" />

      <Avatar index={profile.avatar ?? 0} size={92} />
      <div className="stars" aria-label={`${stars}/3`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={i < stars ? 'star is-on' : 'star'}
            style={{ animationDelay: `${i * 160}ms` }}
          >
            ★
          </span>
        ))}
      </div>

      <h2 className="result-title">{t('roundDone', ui)}</h2>
      <p className="result-score">
        <b>{score}</b> {t('scoreOf', ui)} {total}
      </p>
      {isBest && <p className="result-best">{t('newBest', ui)}</p>}

      <div className="result-actions">
        <button className="btn btn-ghost" onClick={onHome}>
          {t('home', ui)}
        </button>
        <button className="btn btn-primary" onClick={onAgain}>
          {t('again', ui)}
        </button>
      </div>
    </div>
  )
}
