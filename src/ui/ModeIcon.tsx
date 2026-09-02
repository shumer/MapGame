import type { GameMode } from '../game/types'

/** Drawn icons rather than emoji: they render the same on every device. */
export function ModeIcon({ mode }: { mode: GameMode }) {
  if (mode === 'flag') {
    return (
      <svg viewBox="0 0 48 48" className="mode-icon" role="presentation">
        <path d="M13 6v38" stroke="#8a6a4a" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M15 9h24l-5 8 5 8H15z" fill="#e2685f" />
        <path d="M15 17h24" stroke="#fff" strokeWidth="2.5" opacity="0.6" />
      </svg>
    )
  }
  if (mode === 'locate') {
    return (
      <svg viewBox="0 0 48 48" className="mode-icon" role="presentation">
        <path d="M6 14l12-5 12 5 12-5v29l-12 5-12-5-12 5z" fill="#a9d9c2" />
        <path d="M18 9v29M30 14v29" stroke="#7fbfa4" strokeWidth="2.5" />
        <path d="M27 12c-5 0-9 4-9 9 0 6.5 9 15 9 15s9-8.5 9-15c0-5-4-9-9-9z" fill="#e2494a" />
        <circle cx="27" cy="21" r="3.6" fill="#fff" />
      </svg>
    )
  }
  if (mode === 'flagCapital') {
    // A flag with a star beside it: the flag asks, the capital answers.
    return (
      <svg viewBox="0 0 48 48" className="mode-icon" role="presentation">
        <path d="M10 8v34" stroke="#8a6a4a" strokeWidth="4" strokeLinecap="round" />
        <path d="M12 11h18l-4 6 4 6H12z" fill="#3f8fbf" />
        <path d="M35 24l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2-6.5-3.4-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1z" fill="#f2b134" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 48" className="mode-icon" role="presentation">
      <path d="M8 34h32v6H8z" fill="#c9b8e6" />
      <path d="M11 34l3-14 6 6 4-12 4 12 6-6 3 14z" fill="#f2b134" />
      <circle cx="24" cy="10" r="3.4" fill="#e2685f" />
      <circle cx="13" cy="17" r="2.6" fill="#e2685f" />
      <circle cx="35" cy="17" r="2.6" fill="#e2685f" />
    </svg>
  )
}
