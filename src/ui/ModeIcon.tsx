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
  if (mode === 'animals') {
    // A paw on a globe. An animal's face would read as one particular animal;
    // a paw reads as "this is about creatures" at any size.
    return (
      <svg viewBox="0 0 48 48" className="mode-icon" role="presentation">
        <circle cx="24" cy="25" r="18" fill="#a9d9c2" />
        <path
          d="M7.2 19.5h9M31.5 19.5h9.3M6.6 31.5h8.4M30.5 31.5h10.2"
          stroke="#fbfdfc"
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M24 23.2c4.6 0 8.4 3.4 8.4 7.3 0 3.1-2.4 4.9-5.4 4.9h-6c-3 0-5.4-1.8-5.4-4.9 0-3.9 3.8-7.3 8.4-7.3z"
          fill="#8a6a4a"
        />
        <ellipse cx="14.6" cy="21.4" rx="3.1" ry="4.1" fill="#8a6a4a" transform="rotate(-22 14.6 21.4)" />
        <ellipse cx="20.2" cy="16.4" rx="3.2" ry="4.3" fill="#8a6a4a" transform="rotate(-8 20.2 16.4)" />
        <ellipse cx="27.8" cy="16.4" rx="3.2" ry="4.3" fill="#8a6a4a" transform="rotate(8 27.8 16.4)" />
        <ellipse cx="33.4" cy="21.4" rx="3.1" ry="4.1" fill="#8a6a4a" transform="rotate(22 33.4 21.4)" />
      </svg>
    )
  }

  // Capitals: a flag asking, a star answering.
  return (
    <svg viewBox="0 0 48 48" className="mode-icon" role="presentation">
      <path d="M10 8v34" stroke="#8a6a4a" strokeWidth="4" strokeLinecap="round" />
      <path d="M12 11h18l-4 6 4 6H12z" fill="#3f8fbf" />
      <path d="M35 24l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2-6.5-3.4-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1z" fill="#f2b134" />
    </svg>
  )
}
