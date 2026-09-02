import { useState } from 'react'
import {
  animals,
  animalsOf,
  continentById,
  countryByIso,
  countriesWithAnimals,
  type Region,
} from '../data'
import { t } from '../i18n/ui'
import type { Profile } from '../game/types'
import { WorldMap } from '../map/WorldMap'
import { speak } from '../speech'
import { sounds } from '../sound'
import { CountrySymbol } from '../ui/CountrySymbol'
import { Flag } from '../ui/Flag'
import { HomeIcon } from '../ui/icons'
import './ZooScreen.css'

/**
 * The map with nothing asked of it: tap a country, see who lives there, hear
 * their names. No score, no round, no progress dots -- the missing dots are
 * how a child who cannot read can tell this is the place where nothing is
 * being tested.
 */
export function ZooScreen({
  profile,
  region,
  onExit,
}: {
  profile: Profile
  region: Region
  onExit: () => void
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const [showAlbum, setShowAlbum] = useState(false)
  const collected = new Set(profile.animalsSeen ?? [])
  const ui = profile.uiLang
  const lang = profile.contentLang
  const country = picked ? countryByIso(picked) : null
  const here = picked ? animalsOf(picked) : []
  const known = new Set(countriesWithAnimals(region).map((c) => c.iso))

  return (
    <div className="zoo">
      <header className="game-bar">
        <button className="btn btn-ghost btn-round home" onClick={onExit} aria-label={t('home', ui)}>
          <HomeIcon size={22} />
          <span className="home-label">{t('home', ui)}</span>
        </button>
        <span className="zoo-title">{continentById(region).name[ui]}</span>
        <button
          className={`btn btn-ghost album-toggle ${showAlbum ? 'is-on' : ''}`}
          onClick={() => setShowAlbum((v) => !v)}
        >
          {t('album', ui)} <b>{collected.size}</b> / {animals.length}
        </button>
      </header>

      {showAlbum && (
        <section className="album">
          {animals.map((a) => {
            const met = collected.has(a.id)
            return (
              <span key={a.id} className={`album-cell ${met ? 'is-met' : ''}`}>
                <CountrySymbol symbol={a.id} size={44} />
                {met && <span>{a.name[lang]}</span>}
              </span>
            )
          })}
        </section>
      )}

      {!showAlbum && <div className="zoo-map">
        <WorldMap
          region={region}
          highlight={picked}
          focus={picked}
          onPick={(iso) => {
            sounds.tap()
            setPicked(iso)
            const c = countryByIso(iso)
            if (c) speak(c.name[lang], lang)
          }}
        />
      </div>}

      {!showAlbum && country && (
        <section className="zoo-card">
          <div className="zoo-head">
            <Flag iso={country.iso} size="md" />
            <b>{country.name[lang]}</b>
            <button
              className="btn btn-ghost btn-round zoo-close"
              onClick={() => setPicked(null)}
              aria-label={t('back', ui)}
            >
              ×
            </button>
          </div>

          {here.length > 0 ? (
            <div className="zoo-animals">
              {here.slice(0, 6).map((a) => (
                <button key={a.id} className="zoo-animal" onClick={() => speak(a.name[lang], lang)}>
                  <CountrySymbol symbol={a.id} size={64} />
                  <span>{a.name[lang]}</span>
                </button>
              ))}
            </div>
          ) : (
            // Not "no animals here", which reads as the game being broken: the
            // country simply shows what it always shows.
            <div className="zoo-animals">
              <span className="zoo-empty">
                <CountrySymbol symbol={country.symbol} size={64} />
              </span>
            </div>
          )}
        </section>
      )}

      {!showAlbum && !country && (
        <p className="zoo-hint">{known.size > 0 ? t('tapCountry', ui) : ''}</p>
      )}
    </div>
  )
}
