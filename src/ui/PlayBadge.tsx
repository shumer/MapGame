import './PlayBadge.css'

/**
 * The one symbol a child recognises before they can read. Sits on the bottom
 * edge of a character card so it is obvious the card is a choice, not a picture.
 */
export function PlayBadge() {
  return (
    <span className="play-badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" role="presentation">
        <path d="M9 6.5l9 5.5-9 5.5z" fill="currentColor" />
      </svg>
    </span>
  )
}
