import { useEffect, useState } from 'react'
import { ContinentScreen } from './screens/ContinentScreen'
import { GameScreen } from './screens/GameScreen'
import { MenuScreen } from './screens/MenuScreen'
import { ResultScreen } from './screens/ResultScreen'
import { StartScreen } from './screens/StartScreen'
import { ZooScreen } from './screens/ZooScreen'
import { SymbolGallery } from './screens/SymbolGallery'
import { t } from './i18n/ui'
import { useActiveProfile, useProfiles } from './store/profiles'
import { useContinent, useLang } from './store/settings'
import type { GameMode } from './game/types'

type Screen =
  | { name: 'continent' }
  | { name: 'menu' }
  | { name: 'zoo' }
  | { name: 'game'; mode: GameMode }
  | { name: 'result'; mode: GameMode; score: number; total: number; isBest: boolean }

export function App() {
  const profile = useActiveProfile()
  const startLang = useLang((s) => s.lang)
  // The tab title and the document language follow whoever is playing: the
  // title was baked into index.html and stayed Russian in a Polish game.
  const lang = profile?.uiLang ?? startLang
  useEffect(() => {
    document.title = t('appName', lang)
    document.documentElement.lang = lang
  }, [lang])
  const { continent: region, setContinent } = useContinent()
  const finishRound = useProfiles((s) => s.finishRound)
  const [screen, setScreen] = useState<Screen>({ name: 'menu' })
  const selectProfile = useProfiles((s) => s.select)

  // Development-only view of every drawn country hint.
  if (typeof window !== 'undefined' && window.location.hash === '#symbols') return <SymbolGallery />

  if (!profile) return <StartScreen onReady={() => setScreen({ name: 'continent' })} />

  if (screen.name === 'continent') {
    return (
      <ContinentScreen
        profile={profile}
        current={region}
        onPick={(picked) => {
          setContinent(picked)
          setScreen({ name: 'menu' })
        }}
        onBack={() => selectProfile(null)}
      />
    )
  }


  if (screen.name === 'zoo') {
    return <ZooScreen profile={profile} region={region} onExit={() => setScreen({ name: 'menu' })} />
  }

  if (screen.name === 'game') {
    return (
      <GameScreen
        // Remounts on replay so the round starts clean.
        key={`${screen.mode}-${profile.rounds}`}
        profile={profile}
        mode={screen.mode}
        region={region}
        onExit={() => setScreen({ name: 'menu' })}
        onDone={(score, total) => {
          const isBest = score > (profile.best[screen.mode] ?? 0)
          finishRound(profile.id, screen.mode, score)
          setScreen({ name: 'result', mode: screen.mode, score, total, isBest })
        }}
      />
    )
  }

  if (screen.name === 'result') {
    return (
      <ResultScreen
        profile={profile}
        score={screen.score}
        total={screen.total}
        isBest={screen.isBest}
        onAgain={() => setScreen({ name: 'game', mode: screen.mode })}
        onHome={() => setScreen({ name: 'menu' })}
      />
    )
  }

  return (
    <MenuScreen
      profile={profile}
      region={region}
      onPlay={(mode) => setScreen({ name: 'game', mode })}
      onChangeRegion={() => setScreen({ name: 'continent' })}
      onZoo={() => setScreen({ name: 'zoo' })}
    />
  )
}
