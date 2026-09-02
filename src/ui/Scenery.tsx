import planeUrl from '../assets/art/plane.svg?url'
import './Scenery.css'

/**
 * The start screen backdrop, deliberately split into independently positioned
 * pieces. A single SVG scaled with "slice" loses the sun on a narrow screen and
 * cuts the plane in half on a tablet; each piece here is placed in percentages
 * so it always lands where it was meant to.
 */
export function Scenery() {
  return (
    <div className="scenery" aria-hidden="true">
      <svg className="scenery-sun" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="42" fill="#ffe08a" opacity="0.4" />
        <circle cx="60" cy="60" r="30" fill="#ffdc74" />
      </svg>

      <svg className="scenery-cloud scenery-cloud-a" viewBox="0 0 160 70">
        <g fill="#fff">
          <ellipse cx="60" cy="42" rx="46" ry="24" />
          <ellipse cx="100" cy="34" rx="34" ry="21" />
          <ellipse cx="28" cy="36" rx="28" ry="18" />
        </g>
      </svg>
      <svg className="scenery-cloud scenery-cloud-b" viewBox="0 0 120 56">
        <g fill="#fff">
          <ellipse cx="46" cy="34" rx="36" ry="19" />
          <ellipse cx="78" cy="28" rx="26" ry="15" />
        </g>
      </svg>

      {/* A compact plane with a short dotted trail, parked in the top-left
          corner. A full-width route kept colliding with the title on every
          screen short enough to matter. The plane itself is Noto Emoji art,
          see src/assets/art/NOTICE.md. */}
      <div className="scenery-plane">
        <svg className="scenery-trail" viewBox="0 0 120 60">
          <path
            d="M4 50C28 36 50 42 74 26"
            stroke="#8fb8c9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="2 14"
            fill="none"
            opacity="0.85"
          />
        </svg>
        <img className="scenery-plane-art" src={planeUrl} alt="" />
      </div>

      {/* Hills stretch freely: they are organic shapes, distortion is invisible. */}
      <svg className="scenery-hills" viewBox="0 0 800 220" preserveAspectRatio="none">
        <path d="M0 84c150-46 260 22 400 6s200-56 400-30v160H0z" fill="#a9d9a4" />
        <path d="M0 140c170-38 290 18 440 4s220-40 360-20v96H0z" fill="#8ecb8c" />
      </svg>
      <svg className="scenery-bushes" viewBox="0 0 800 120" preserveAspectRatio="none">
        <g fill="#6fb573">
          <circle cx="90" cy="72" r="22" />
          <circle cx="120" cy="82" r="15" />
          <circle cx="700" cy="86" r="20" />
          <circle cx="672" cy="94" r="13" />
        </g>
      </svg>
    </div>
  )
}
