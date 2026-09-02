import './Kid.css'

/**
 * Cartoon characters for the start screen, drawn chibi-style: an oversized head,
 * a small body, big eyes with highlights, and an open smile. Realistic
 * proportions and small dot eyes made them look eerie rather than friendly.
 * The two read as "smaller" and "bigger" through head-to-body ratio and pose.
 */

function Face({
  cx,
  cy,
  r,
  skin,
  eyeGap = 15,
  eyeY = 6,
}: {
  cx: number
  cy: number
  r: number
  skin: string
  eyeGap?: number
  eyeY?: number
}) {
  const ey = cy + eyeY
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={skin} />
      {/* Ears. */}
      <circle cx={cx - r + 2} cy={cy + 6} r={r * 0.17} fill={skin} />
      <circle cx={cx + r - 2} cy={cy + 6} r={r * 0.17} fill={skin} />

      {/* Big eyes: white, dark iris, two highlights. */}
      <ellipse cx={cx - eyeGap} cy={ey} rx="9" ry="10.5" fill="#fff" />
      <ellipse cx={cx + eyeGap} cy={ey} rx="9" ry="10.5" fill="#fff" />
      <circle cx={cx - eyeGap} cy={ey + 1} r="6.4" fill="#3b2b23" />
      <circle cx={cx + eyeGap} cy={ey + 1} r="6.4" fill="#3b2b23" />
      <circle cx={cx - eyeGap + 2.4} cy={ey - 2} r="2.6" fill="#fff" />
      <circle cx={cx + eyeGap + 2.4} cy={ey - 2} r="2.6" fill="#fff" />
      <circle cx={cx - eyeGap - 2.6} cy={ey + 4} r="1.3" fill="#fff" opacity="0.8" />
      <circle cx={cx + eyeGap - 2.6} cy={ey + 4} r="1.3" fill="#fff" opacity="0.8" />

      {/* Raised eyebrows read as delighted. */}
      <path
        d={`M${cx - eyeGap - 8} ${ey - 14}q8-5 16-1`}
        stroke="#8a6a52"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${cx + eyeGap - 8} ${ey - 15}q8-4 16 1`}
        stroke="#8a6a52"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Open smile with a tongue. */}
      <path d={`M${cx - 13} ${ey + 16}q13 16 26 0z`} fill="#7d3b3b" />
      <path d={`M${cx - 7} ${ey + 25}q7 6 13-1z`} fill="#ef7f8f" />
      <path d={`M${cx - 13} ${ey + 16}q13 16 26 0`} stroke="#7d3b3b" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      {/* Round cheeks. */}
      <circle cx={cx - r * 0.62} cy={ey + 12} r="7" fill="#f58f95" opacity="0.5" />
      <circle cx={cx + r * 0.62} cy={ey + 12} r="7" fill="#f58f95" opacity="0.5" />
      <circle cx={cx} cy={ey + 9} r="3" fill="#e8a98d" opacity="0.55" />
    </>
  )
}

export function Kid({ level }: { level: 'little' | 'expert' }) {
  if (level === 'little') {
    return (
      <svg className="kid" viewBox="0 0 152 210" role="presentation">
        <ellipse cx="72" cy="202" rx="32" ry="6" fill="#2c4a52" opacity="0.12" />

        {/* Short round legs, feet turned out. */}
        <path d="M62 168v14a7 7 0 0 0 14 0v-14z" fill="#f2c49b" />
        <path d="M80 168v14a7 7 0 0 0 14 0v-14z" fill="#f2c49b" />
        <ellipse cx="66" cy="190" rx="13" ry="9" fill="#e2685f" />
        <ellipse cx="90" cy="190" rx="13" ry="9" fill="#e2685f" />

        {/* Little dress, wide at the hem. */}
        <path d="M78 124c-15 0-22 8-25 21l-4 20c9 5 19 7 29 7s20-2 29-7l-4-20c-3-13-10-21-25-21z" fill="#f47fb1" />
        <circle cx="78" cy="146" r="4" fill="#fff" opacity="0.75" />
        <circle cx="64" cy="158" r="3.4" fill="#fff" opacity="0.6" />
        <circle cx="92" cy="158" r="3.4" fill="#fff" opacity="0.6" />

        {/* Sausage arms: one down, one up holding the balloon. */}
        <path d="M56 132q-9 8-11 20" stroke="#f2c49b" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M100 130q10-6 16-16" stroke="#f2c49b" strokeWidth="13" strokeLinecap="round" fill="none" />

        {/* Huge head with pigtails. */}
        <circle cx="30" cy="76" r="15" fill="#efb14a" />
        <circle cx="118" cy="76" r="15" fill="#efb14a" />
        <circle cx="30" cy="76" r="6.5" fill="#f2585f" />
        <circle cx="118" cy="76" r="6.5" fill="#f2585f" />
        <Face cx={74} cy={72} r={42} skin="#f7cfa8" eyeGap={17} eyeY={2} />
        {/* Fringe drawn over the forehead. */}
        <path d="M32 68c0-25 19-40 42-40s42 15 42 40c-7-14-13-19-22-21-13 8-30 9-45 3-8 4-13 8-17 18z" fill="#efb14a" />
        <path d="M74 28c-6-8-2-14 4-14-3 5 0 9 4 11z" fill="#efb14a" />

        {/* Balloon last, so nothing draws over it. */}
        <path d="M129 44q-6 34-16 62" stroke="#9ab6bf" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <ellipse cx="130" cy="30" rx="17" ry="20" fill="#f2585f" />
        <ellipse cx="123" cy="23" rx="5.5" ry="7.5" fill="#fff" opacity="0.5" />
        <path d="M130 50l-4 6h8z" fill="#c8434a" />
      </svg>
    )
  }

  return (
    <svg className="kid" viewBox="0 0 150 210" role="presentation">
      <ellipse cx="74" cy="202" rx="34" ry="6" fill="#2c4a52" opacity="0.12" />

      {/* Backpack peeking out behind the shoulders. */}
      <rect x="50" y="118" width="52" height="46" rx="16" fill="#f0a93f" />

      {/* Longer legs than the little one, still rounded. */}
      <path d="M62 170v16a7 7 0 0 0 14 0v-16z" fill="#3f4a7a" />
      <path d="M80 170v16a7 7 0 0 0 14 0v-16z" fill="#3f4a7a" />
      <ellipse cx="66" cy="192" rx="13" ry="9" fill="#2f3a5a" />
      <ellipse cx="90" cy="192" rx="13" ry="9" fill="#2f3a5a" />

      <path d="M78 118c-14 0-22 8-22 21v28c7 4 14 6 22 6s15-2 22-6v-28c0-13-8-21-22-21z" fill="#3f9ad0" />
      <path d="M66 120q12 12 24 0" stroke="#2f80ad" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M68 121l-6 30M88 121l6 30" stroke="#d1902c" strokeWidth="6" strokeLinecap="round" />

      {/* One arm waving, one holding an open map. */}
      <path d="M56 130q-11 4-16 14" stroke="#f0cba4" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M100 128q12-8 14-22" stroke="#f0cba4" strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="115" cy="102" r="9" fill="#f0cba4" />

      <g transform="rotate(-8 52 156)">
        <rect x="22" y="140" width="62" height="34" rx="5" fill="#f9f2e0" stroke="#cbb896" strokeWidth="3" />
        <path d="M53 140v34" stroke="#e4d9bd" strokeWidth="2.5" />
        <path d="M28 164q6-5 11-9t10-8" stroke="#8ecb8c" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M60 168q9-6 18-8" stroke="#e2685f" strokeWidth="2.6" strokeDasharray="1 5" strokeLinecap="round" fill="none" />
        <circle cx="78" cy="158" r="3.4" fill="#e2494a" />
      </g>

      {/* Head is big, but noticeably smaller than the little one's. */}
      <Face cx={78} cy={76} r={36} skin="#f0cba4" eyeGap={15} eyeY={3} />
      {/* Cap: the clearest silhouette difference between the two. */}
      <path d="M43 72c0-20 16-32 35-32s35 12 35 32v2H43z" fill="#4f9f76" />
      <path d="M113 70c11 0 19 4 23 9-7 4-16 5-23 4z" fill="#3f8a63" />
      <path d="M42 74h72" stroke="#3f8a63" strokeWidth="4" strokeLinecap="round" />
      <circle cx="78" cy="44" r="5" fill="#3f8a63" />
    </svg>
  )
}
