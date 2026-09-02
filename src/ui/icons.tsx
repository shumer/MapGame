/**
 * Interface icons, drawn rather than typed: emoji render differently on every
 * device, and a speaker glyph in particular came out looking like a screw.
 */

export function SpeakerIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="presentation" style={{ display: 'block' }}>
      <path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z" fill="currentColor" />
      <path
        d="M15.4 9.2a4 4 0 0 1 0 5.6M17.9 6.6a7.6 7.6 0 0 1 0 10.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/** Sound on, voice off: the speaker keeps one arc and loses the second. */
export function SpeakerQuietIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="presentation" style={{ display: 'block' }}>
      <path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z" fill="currentColor" />
      <path d="M15.4 9.2a4 4 0 0 1 0 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M18.4 8.4l4.2 7.2M22.6 8.4l-4.2 7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}

export function SpeakerOffIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="presentation" style={{ display: 'block' }}>
      <path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z" fill="currentColor" />
      <path
        d="M16 9.5l5 5M21 9.5l-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function HomeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="presentation" style={{ display: 'block' }}>
      <path d="M12 3.4l9 7.4h-2.6V20h-4.6v-5.3h-3.6V20H5.6v-9.2H3z" fill="currentColor" />
    </svg>
  )
}

/** Shown on the reveal card after a correct answer. */
export function TickIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="presentation" style={{ display: 'block' }}>
      <path
        d="M4.5 12.6l5 5L19.5 7"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/** Shown on the reveal card after a miss: pointing at the answer, not scolding. */
export function ArrowIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="presentation" style={{ display: 'block' }}>
      <path
        d="M4 12h14M12.5 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/** A wrong pick, on the button itself. */
export function CrossIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="presentation" style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.16" />
      <path
        d="M8 8l8 8M16 8l-8 8"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
