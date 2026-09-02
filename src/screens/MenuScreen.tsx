import { continentById, countriesOf, countriesWithAnimals, type Lang, type Region } from '../data'
import { ANIMAL_MIN_POOL } from '../game/questions'
import { PRESETS, type GameMode, type Profile } from '../game/types'
import { LANG_NAMES, t, type UiKey } from '../i18n/ui'
import { useProfiles } from '../store/profiles'
import { sounds } from '../sound'
import { Kid } from '../ui/Kid'
import { Star } from '../ui/Star'
import { ModeIcon } from '../ui/ModeIcon'
import './MenuScreen.css'

const MODE_LABEL: Record<GameMode, UiKey> = {
  flag: 'modeFlag',
  locate: 'modeLocate',
  capital: 'modeCapital',
  animals: 'modeAnimals',
}
const MODE_HINT: Record<GameMode, UiKey> = {
  flag: 'modeFlagHint',
  locate: 'modeLocateHint',
  capital: 'modeCapitalHint',
  animals: 'modeAnimalsHint',
}
const LANGS: Lang[] = ['ru', 'pl', 'en']

export function MenuScreen({
  profile,
  region,
  onPlay,
  onChangeRegion,
  onZoo,
}: {
  profile: Profile
  region: Region
  onPlay: (mode: GameMode) => void
  onChangeRegion: () => void
  onZoo: () => void
}) {
  const { select, setLangs } = useProfiles()
  const ui = profile.uiLang
  const preset = PRESETS[profile.level]

  // A country counts as learned once it has been answered right three times.
  // Counted within the current set: finishing Europe should read as finished,
  // not as a fifth of the world.
  const inSet = countriesOf(region)
  const learned = inSet.filter((c) => (profile.progress[c.iso]?.streak ?? 0) >= 3).length
  const pool = inSet.filter((c) => c.fame <= preset.maxFame).length

  // A set with only a handful of animals turns the round into the same three
  // questions, so the mode simply is not offered there.
  const animalPool = countriesWithAnimals(region).filter((c) => c.fame <= preset.maxFame).length
  const modes = preset.modes.filter((m) => m !== 'animals' || animalPool >= ANIMAL_MIN_POOL)

  return (
    <div className="menu">
      <header className="menu-head">
        <div className="menu-kid">
          <Kid level={profile.level} />
        </div>
        <div className="menu-who">
          <p className="menu-hello">
            {t(profile.level === 'little' ? 'levelLittle' : 'levelExpert', ui)}
          </p>
          <div className="menu-bar" aria-label={`${learned} / ${pool}`}>
            <span style={{ width: `${Math.round((learned / pool) * 100)}%` }} />
          </div>
          <p className="menu-learned">
            {t('learned', ui)}: <b>{learned}</b> / {pool}
          </p>
        </div>
        <button className="btn btn-ghost btn-round" onClick={() => select(null)}>
          {t('back', ui)}
        </button>
      </header>

      {/* Which part of the world this is. Tapping it goes back to the picture
          chooser, which is how a child who cannot read gets around. */}
      <button className="menu-place" onClick={onChangeRegion}>
        <b>{continentById(region).name[ui]}</b>
        <span>{t('changePlace', ui)}</span>
      </button>

      <div className="menu-modes">
        {modes.map((mode) => (
          <button
            key={mode}
            className="mode-card"
            onClick={() => {
              sounds.tap()
              onPlay(mode)
            }}
          >
            <ModeIcon mode={mode} />
            <span className="mode-text">
              <b>{t(MODE_LABEL[mode], ui)}</b>
              {/* The flag round runs backwards for a child who cannot read. */}
              <span>
                {t(mode === 'flag' && !preset.showText ? 'modeFlagHintLittle' : MODE_HINT[mode], ui)}
              </span>
            </span>
            {profile.best[mode] !== undefined && (
              <span className="mode-best">
                <Star size={16} />
                {profile.best[mode]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* The zoo is not a mode: nothing is asked and nothing is scored, so it
          sits apart from the round cards rather than among them. */}
      {animalPool > 0 && (
        <button className="zoo-card-link" onClick={onZoo}>
          <ModeIcon mode="animals" />
          <span className="mode-text">
            <b>{t('zoo', ui)}</b>
            <span>{t('zooHint', ui)}</span>
          </span>
        </button>
      )}

      {/* Language settings live here rather than on the start screen: it is a
          grown-up's control, and the start screen belongs to the child. */}
      <details className="menu-settings">
        <summary>{t('langContent', ui)}: {LANG_NAMES[profile.contentLang]}</summary>
        <div className="menu-setting">
          <span className="field-label">{t('langUi', ui)}</span>
          <div className="chip-row">
            {LANGS.map((l) => (
              <button
                key={l}
                className={`chip ${profile.uiLang === l ? 'is-on' : ''}`}
                onClick={() => setLangs(profile.id, l, profile.contentLang)}
              >
                {LANG_NAMES[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="menu-setting">
          <span className="field-label">{t('langContent', ui)}</span>
          <div className="chip-row">
            {LANGS.map((l) => (
              <button
                key={l}
                className={`chip ${profile.contentLang === l ? 'is-on' : ''}`}
                onClick={() => setLangs(profile.id, profile.uiLang, l)}
              >
                {LANG_NAMES[l]}
              </button>
            ))}
          </div>
        </div>
      </details>
    </div>
  )
}
