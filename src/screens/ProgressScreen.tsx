import { continentById, continents, countriesOf, type Region } from '../data'
import { PRESETS, type Profile } from '../game/types'
import { t } from '../i18n/ui'
import { WorldMap } from '../map/WorldMap'
import { HomeIcon } from '../ui/icons'
import { Star } from '../ui/Star'
import './ProgressScreen.css'

/** Answered right three times running: known well enough to count. */
const LEARNED = 3

/**
 * The world as this child has filled it in. Countries they know keep their
 * colour and the rest are blank land, so progress is something you look at
 * rather than a fraction you read.
 */
export function ProgressScreen({
  profile,
  region,
  onExit,
}: {
  profile: Profile
  region: Region
  onExit: () => void
}) {
  const ui = profile.uiLang
  const preset = PRESETS[profile.level]
  const inSet = countriesOf(region)
  const learned = inSet.filter((c) => (profile.progress[c.iso]?.streak ?? 0) >= LEARNED)
  const started = inSet.filter(
    (c) => (profile.progress[c.iso]?.seen ?? 0) > 0 && !learned.includes(c),
  )
  const pool = inSet.filter((c) => c.fame <= preset.maxFame)

  return (
    <div className="progress-screen">
      <header className="game-bar">
        <button className="btn btn-ghost btn-round home" onClick={onExit} aria-label={t('home', ui)}>
          <HomeIcon size={22} />
          <span className="home-label">{t('home', ui)}</span>
        </button>
        <span className="progress-count">
          <Star size={16} />
          <b>{learned.length}</b> / {pool.length}
        </span>
      </header>

      <div className="progress-map">
        <WorldMap
          region={region}
          learned={learned.map((c) => c.iso)}
          started={started.map((c) => c.iso)}
          interactive={false}
        />
      </div>

      {/* Every set at a glance, so a child can see where there is still world
          left to fill in. */}
      <div className="progress-sets">
        {continents.map((c) => {
          const set = countriesOf(c.id)
          const known = set.filter((x) => (profile.progress[x.iso]?.streak ?? 0) >= LEARNED).length
          const of = set.filter((x) => x.fame <= preset.maxFame).length
          return (
            <span key={c.id} className={`progress-set ${c.id === region ? 'is-current' : ''}`}>
              <b>{continentById(c.id).name[ui]}</b>
              <span className="progress-bar">
                <span style={{ width: `${Math.round((known / Math.max(1, of)) * 100)}%` }} />
              </span>
              <span className="progress-num">
                {known} / {of}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
