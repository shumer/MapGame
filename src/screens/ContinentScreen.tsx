import outlinesRaw from '../data/outlines.json'
import { continents, countriesOf, type Region } from '../data'
import { t } from '../i18n/ui'
import { PRESETS, type Profile } from '../game/types'
import { sounds } from '../sound'
import { Star } from '../ui/Star'
import './ContinentScreen.css'

interface Outline {
  width: number
  height: number
  land: string
  backdrop: string
}

const outlines = outlinesRaw as Record<string, Outline>

/**
 * Where to travel next. Each set is a card showing the actual shape of the
 * continent, drawn from the same map the game plays on, because the little one
 * cannot read the names and a silhouette is something she can recognise.
 */
export function ContinentScreen({
  profile,
  current,
  onPick,
  onBack,
}: {
  profile: Profile
  current: Region
  onPick: (region: Region) => void
  onBack: () => void
}) {
  const ui = profile.uiLang
  const preset = PRESETS[profile.level]

  return (
    <div className="continents">
      <header className="continents-head">
        <h1 className="continents-title">{t('whereTo', ui)}</h1>
        <button className="btn btn-ghost btn-round" onClick={onBack}>
          {t('back', ui)}
        </button>
      </header>

      <div className="continents-grid">
        {continents.map((c) => {
          const outline = outlines[c.id]
          const inSet = countriesOf(c.id)
          const pool = inSet.filter((x) => x.fame <= preset.maxFame).length
          const learned = inSet.filter((x) => (profile.progress[x.iso]?.streak ?? 0) >= 3).length

          return (
            <button
              key={c.id}
              className={`continent-card ${c.id === current ? 'is-current' : ''}`}
              onClick={() => {
                sounds.tap()
                onPick(c.id)
              }}
            >
              <svg
                className="continent-map"
                viewBox={`0 0 ${outline.width} ${outline.height}`}
                role="presentation"
              >
                <path className="continent-backdrop" d={outline.backdrop} />
                <path className="continent-land" d={outline.land} />
              </svg>
              <span className="continent-name">{c.name[ui]}</span>
              <span className="continent-count">
                {learned > 0 && <Star size={14} />}
                {learned > 0 ? `${learned} / ${pool}` : `${pool}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
