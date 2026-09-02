import type { ReactNode } from 'react'

/**
 * A drawn hint for each country: its animal, landmark or best-known thing.
 * Meant as a memory hook, not a puzzle - a child who has seen the stork next to
 * Poland twice starts recognising the country by it.
 *
 * All symbols share a 64x64 box and a flat, three-or-four-colour style.
 */

export const SYMBOLS: Record<string, ReactNode> = {
  bear: (
    <>
      <circle cx="18" cy="20" r="8" fill="#8a5a3c" />
      <circle cx="46" cy="20" r="8" fill="#8a5a3c" />
      <circle cx="18" cy="20" r="4" fill="#b98a68" />
      <circle cx="46" cy="20" r="4" fill="#b98a68" />
      <ellipse cx="32" cy="36" rx="22" ry="20" fill="#8a5a3c" />
      <ellipse cx="32" cy="44" rx="12" ry="10" fill="#e3c3a3" />
      <ellipse cx="32" cy="39" rx="5" ry="4" fill="#4a2f20" />
      <circle cx="24" cy="31" r="3.4" fill="#2f1d13" />
      <circle cx="40" cy="31" r="3.4" fill="#2f1d13" />
      <circle cx="25.2" cy="29.8" r="1.2" fill="#fff" />
      <circle cx="41.2" cy="29.8" r="1.2" fill="#fff" />
      <path d="M27 47q5 4 10 0" stroke="#4a2f20" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),

  bison: (
    <>
      {/* Head-on: heavy shaggy head, low horns, big hump - nothing like a bear. */}
      <path d="M32 12q16 0 20 12t-6 20l-14 4-14-4q-10-8-6-20t20-12z" fill="#6b4f3a" />
      <path d="M12 26q-8-4-6-10 8-2 12 6z" fill="#e8dcc6" />
      <path d="M52 26q8-4 6-10-8-2-12 6z" fill="#e8dcc6" />
      <path d="M18 22q-6-2-6-8 6 0 8 6z" fill="#cfc2a8" />
      <path d="M46 22q6-2 6-8-6 0-8 6z" fill="#cfc2a8" />
      <path d="M22 40h20l-4 14-6 4-6-4z" fill="#4f3a2a" />
      <ellipse cx="32" cy="50" rx="7" ry="5" fill="#2c1e15" />
      <circle cx="29" cy="49" r="1.6" fill="#6b5a4a" />
      <circle cx="35" cy="49" r="1.6" fill="#6b5a4a" />
      <circle cx="23" cy="30" r="3.4" fill="#241a12" />
      <circle cx="41" cy="30" r="3.4" fill="#241a12" />
      <circle cx="24.2" cy="28.8" r="1.2" fill="#fff" />
      <circle cx="42.2" cy="28.8" r="1.2" fill="#fff" />
      <path d="M26 16q4 6 12 4" stroke="#4f3a2a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  ),

  deer: (
    <>
      <path d="M18 16l-6-8M18 16l-9 1M18 16l-2-9M46 16l6-8M46 16l9 1M46 16l2-9" stroke="#8a6a4a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="32" cy="38" rx="15" ry="19" fill="#b07f4f" />
      <ellipse cx="18" cy="24" rx="6" ry="8" fill="#b07f4f" transform="rotate(-20 18 24)" />
      <ellipse cx="46" cy="24" rx="6" ry="8" fill="#b07f4f" transform="rotate(20 46 24)" />
      <ellipse cx="32" cy="48" rx="8" ry="7" fill="#e0c3a0" />
      <ellipse cx="32" cy="46" rx="4" ry="3" fill="#5c3f2a" />
      <circle cx="25" cy="34" r="3.2" fill="#3a2718" />
      <circle cx="39" cy="34" r="3.2" fill="#3a2718" />
      <circle cx="26.2" cy="32.8" r="1.1" fill="#fff" />
      <circle cx="40.2" cy="32.8" r="1.1" fill="#fff" />
    </>
  ),

  wolf: (
    <>
      <path d="M14 22l2-14 12 8zM50 22l-2-14-12 8z" fill="#7d8a94" />
      <path d="M17 20l1-8 7 5zM47 20l-1-8-7 5z" fill="#f0b0b0" />
      <ellipse cx="32" cy="34" rx="18" ry="16" fill="#8e9ba6" />
      <path d="M32 40l-9 6q9 8 18 0z" fill="#dfe6ea" />
      <path d="M28 46h8l-4 4z" fill="#dfe6ea" />
      <ellipse cx="32" cy="41" rx="4" ry="3" fill="#3c454d" />
      <circle cx="25" cy="31" r="3.2" fill="#f2b134" />
      <circle cx="39" cy="31" r="3.2" fill="#f2b134" />
      <circle cx="25" cy="31" r="1.4" fill="#2c343a" />
      <circle cx="39" cy="31" r="1.4" fill="#2c343a" />
    </>
  ),

  horse: (
    <>
      {/* Head in profile with a flowing mane: the clearest horse at small size. */}
      <path d="M40 10q10 2 10 14l-2 12q-1 6-7 8l-10 3-6 12-8-2 6-16q-4-6-2-14 2-14 19-17z" fill="#b5773f" />
      <path d="M40 10q-10-4-16 4-6 6-6 14 6-10 12-12 6-2 10-6z" fill="#5c3a1f" />
      <path d="M26 18q-8 2-10 12 6-6 12-6z" fill="#5c3a1f" />
      <path d="M44 12l3-8 4 8z" fill="#b5773f" />
      <path d="M50 34q4 2 4 6l-8 2z" fill="#9c6233" />
      <ellipse cx="47" cy="38" rx="3.4" ry="2.6" fill="#6b4225" />
      <circle cx="42" cy="22" r="3.2" fill="#2f1d13" />
      <circle cx="43.2" cy="20.8" r="1.2" fill="#fff" />
      <path d="M30 40l-4 18" stroke="#5c3a1f" strokeWidth="4" strokeLinecap="round" />
    </>
  ),

  bull: (
    <>
      {/* Wide upswept horns and a nose ring: unmistakably a bull. */}
      <path d="M14 22Q2 20 4 10q10-2 14 8z" fill="#f2ece0" />
      <path d="M50 22Q62 20 60 10q-10-2-14 8z" fill="#f2ece0" />
      <path d="M32 14q16 0 18 14t-6 20l-12 4-12-4q-10-6-6-20t18-14z" fill="#4a423d" />
      <path d="M22 42h20l-3 12-7 4-7-4z" fill="#8a7d74" />
      <ellipse cx="27" cy="50" rx="2.2" ry="2.8" fill="#2a2523" />
      <ellipse cx="37" cy="50" rx="2.2" ry="2.8" fill="#2a2523" />
      <path d="M32 54a5 5 0 0 0 0 8" stroke="#f2b134" strokeWidth="2.6" fill="none" />
      <circle cx="24" cy="32" r="3.6" fill="#fff" />
      <circle cx="40" cy="32" r="3.6" fill="#fff" />
      <circle cx="24" cy="32" r="1.9" fill="#1f1b19" />
      <circle cx="40" cy="32" r="1.9" fill="#1f1b19" />
      <path d="M26 20q6 4 12 0" stroke="#3a332f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  ),

  owl: (
    <>
      <ellipse cx="32" cy="36" rx="19" ry="21" fill="#9a7b5a" />
      <path d="M13 24q2-12 8-10t5 8zM51 24q-2-12-8-10t-5 8z" fill="#9a7b5a" />
      <circle cx="24" cy="30" r="9" fill="#f4ecdf" />
      <circle cx="40" cy="30" r="9" fill="#f4ecdf" />
      <circle cx="24" cy="30" r="5" fill="#f2b134" />
      <circle cx="40" cy="30" r="5" fill="#f2b134" />
      <circle cx="24" cy="30" r="2.6" fill="#2b2118" />
      <circle cx="40" cy="30" r="2.6" fill="#2b2118" />
      <path d="M32 36l-4 5h8z" fill="#e08a3c" />
      <path d="M22 48q10 6 20 0" stroke="#7d6146" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  ),

  stork: (
    <>
      {/* Standing white bird: long red beak, long red legs, black wing tips. */}
      <path d="M20 46q-6-10 2-18t18-4l6 4-4 8q2 12-6 16z" fill="#fbfbf9" />
      <path d="M22 44q10 6 18 0-2 8-10 8t-8-8z" fill="#33333a" />
      <circle cx="42" cy="20" r="8" fill="#fbfbf9" />
      <path d="M49 19l15 3-15 4z" fill="#e2494a" />
      <circle cx="44" cy="17" r="2.2" fill="#2f2f33" />
      <circle cx="44.8" cy="16.2" r="0.8" fill="#fff" />
      <path d="M28 50v10M34 50v10" stroke="#e2494a" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M26 60h8M32 60h8" stroke="#e2494a" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M38 26q-8-2-14 2" stroke="#e6e6e2" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),

  eagle: (
    <>
      {/* Head in profile: hooked yellow beak and a fierce brow read instantly. */}
      <path d="M12 34q0-18 18-20 16-2 20 10l4 10-8 4-2 10q-4 8-16 8T12 44z" fill="#6f6f78" />
      <path d="M14 30q4-14 18-14 12 0 16 8-10-4-20 0t-14 6z" fill="#f4f2ee" />
      <path d="M30 20q-14 2-16 14 8-8 18-8z" fill="#fff" />
      <path d="M50 30l12 4-10 5-3-4z" fill="#f2b134" />
      <path d="M52 39l-3-4 5-1z" fill="#d99b24" />
      <circle cx="42" cy="28" r="4.4" fill="#f9d26b" />
      <circle cx="42" cy="28" r="2.2" fill="#241f1a" />
      <circle cx="43" cy="27" r="0.9" fill="#fff" />
      <path d="M34 22q6-2 10 1" stroke="#4a4a52" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M20 50q8 8 18 4" stroke="#5c5c66" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  ),

  clover: (
    <>
      <path d="M32 34q-14-14-2-20 8-4 2 8" fill="#4faa5c" />
      <path d="M32 34q14-14 2-20-8-4-2 8" fill="#5cba69" />
      <path d="M32 34q-16 8-8 18 6 6 8-6" fill="#57b263" />
      <path d="M32 34q16 8 8 18-6 6-8-6" fill="#4aa356" />
      <path d="M32 34q2 14 8 22" stroke="#3d8a48" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),

  rose: (
    <>
      <path d="M32 44q-14-2-14-14 0-12 14-12t14 12q0 12-14 14z" fill="#e2494a" />
      <path d="M32 38q-8-2-8-8t8-8 8 8-8 8z" fill="#f2757a" />
      <circle cx="32" cy="30" r="3.6" fill="#c03340" />
      <path d="M32 44v14" stroke="#4f9a52" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 50q-10-4-12 4 8 4 12-4z" fill="#5cba69" />
    </>
  ),

  sunflower: (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx="32" cy="14" rx="4.5" ry="9" fill="#f2b134" transform={`rotate(${i * 30} 32 30)`} />
      ))}
      <circle cx="32" cy="30" r="10" fill="#6b4a2a" />
      <circle cx="32" cy="30" r="6" fill="#8a6238" />
      <path d="M32 40v18" stroke="#4f9a52" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 50q10-6 12 2-8 4-12-2z" fill="#5cba69" />
    </>
  ),

  grapes: (
    <>
      <path d="M34 16q6-8 14-6-4 8-12 8z" fill="#5cba69" />
      <path d="M32 12v8" stroke="#8a6a4a" strokeWidth="3" strokeLinecap="round" />
      {[
        [24, 26], [40, 26], [32, 26],
        [20, 36], [28, 36], [36, 36], [44, 36],
        [24, 46], [32, 46], [40, 46],
        [28, 55], [36, 55],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="6" fill={i % 3 === 0 ? '#8a5fb0' : '#7d4fa5'} />
      ))}
    </>
  ),

  mountains: (
    <>
      <path d="M4 52l16-30 12 20 8-14 20 24z" fill="#7d8fa0" />
      <path d="M20 22l7 13H13zM52 52L40 32l-5 8 7 12z" fill="#f2f6f8" />
      <circle cx="48" cy="14" r="7" fill="#ffd97a" />
      <path d="M2 52h60" stroke="#5f7080" strokeWidth="3" strokeLinecap="round" />
    </>
  ),

  volcano: (
    <>
      <path d="M6 54l18-26h16l18 26z" fill="#6b625c" />
      <path d="M24 28h16l6 9q-14 6-28 0z" fill="#e2494a" />
      <path d="M28 26q-2-10 4-14-2 8 4 10-1 4 2 4z" fill="#f2b134" />
      <circle cx="22" cy="14" r="3.4" fill="#e2685f" />
      <circle cx="44" cy="10" r="2.6" fill="#f2b134" />
      <path d="M4 54h56" stroke="#4f4842" strokeWidth="3" strokeLinecap="round" />
    </>
  ),

  lake: (
    <>
      <path d="M4 46q10-6 20 0t20 0 16-4v14H4z" fill="#5fb0d4" />
      <ellipse cx="32" cy="40" rx="14" ry="6" fill="#7cc47f" />
      <path d="M28 40V26h8v14z" fill="#f4ecdf" />
      <path d="M32 18l6 8H26z" fill="#e2685f" />
      <path d="M32 12v6" stroke="#8a6a4a" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 52h12M40 56h14" stroke="#fff" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
    </>
  ),

  boat: (
    <>
      <path d="M8 44h48l-8 12H16z" fill="#e2685f" />
      <path d="M32 42V10" stroke="#8a6a4a" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 12l16 24H32z" fill="#f4f4f2" />
      <path d="M30 16L16 36h14z" fill="#dfe8ee" />
      <path d="M6 58q8-4 14 0t14 0 14 0 10-2" stroke="#5fb0d4" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),

  castle: (
    <>
      <path d="M10 56V26h12v30zM42 56V26h12v30z" fill="#b9a892" />
      <path d="M22 56V34h20v22z" fill="#cbbca6" />
      <path d="M10 26h4v-6h4v6h4v-6h4v6M42 26h4v-6h4v6h4v-6h4v6" stroke="#9c8a74" strokeWidth="0" fill="#b9a892" />
      <path d="M10 20h3v6h-3zM17 20h3v6h-3zM44 20h3v6h-3zM51 20h3v6h-3z" fill="#b9a892" />
      <path d="M26 44h12v12H26z" fill="#6b4a2a" />
      <circle cx="16" cy="34" r="2.6" fill="#6b4a2a" />
      <circle cx="48" cy="34" r="2.6" fill="#6b4a2a" />
      <path d="M32 34V22" stroke="#8a6a4a" strokeWidth="2" />
      <path d="M32 22l10 3-10 3z" fill="#e2494a" />
    </>
  ),

  bridge: (
    <>
      <path d="M4 52h56" stroke="#5fb0d4" strokeWidth="6" strokeLinecap="round" />
      <path d="M6 44q26-32 52 0" stroke="#e0d3ba" strokeWidth="7" fill="none" />
      <path d="M6 44q26-26 52 0" stroke="#f6efdd" strokeWidth="3" fill="none" />
      <path d="M4 40h8v14H4zM52 40h8v14h-8z" fill="#cbbca6" />
      <path d="M8 52q8-4 16 0t16 0 16 0" stroke="#8fd0e8" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  ),

  windmill: (
    <>
      <path d="M22 58l6-30h8l6 30z" fill="#e8dcc6" />
      <path d="M26 40h12" stroke="#c9b89a" strokeWidth="3" />
      <path d="M32 26l-6-8h12z" fill="#e2494a" />
      <g stroke="#8a6a4a" strokeWidth="3.4" strokeLinecap="round">
        <path d="M32 22L12 8M32 22l20 14M32 22L18 42M32 22L46 2" />
      </g>
      <circle cx="32" cy="22" r="4" fill="#6b4a2a" />
      <path d="M28 46h8v12h-8z" fill="#8a6a4a" />
    </>
  ),

  eiffel: (
    <>
      <path d="M32 4l4 10h-8z" fill="#9c8a74" />
      <path d="M28 14h8v10h-8z" fill="#b0a08a" />
      <path d="M24 24h16l4 14H20z" fill="#9c8a74" />
      <path d="M20 38h24l10 20H10z" fill="#b0a08a" />
      <path d="M22 38q10 16 4 20M42 38q-10 16-4 20" stroke="#8a7a66" strokeWidth="2.5" fill="none" />
      <path d="M18 48h28" stroke="#8a7a66" strokeWidth="3" />
      <path d="M26 24h12" stroke="#8a7a66" strokeWidth="2.5" />
    </>
  ),

  bigben: (
    <>
      <path d="M24 58V22h16v36z" fill="#c9a978" />
      <path d="M22 22h20l-10-8z" fill="#8a6a4a" />
      <path d="M32 8v6" stroke="#8a6a4a" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="32" cy="34" r="9" fill="#f6efdd" stroke="#8a6a4a" strokeWidth="2.4" />
      <path d="M32 34V28M32 34l5 3" stroke="#3c3630" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M26 48h12M26 53h12" stroke="#a98a5c" strokeWidth="2.4" />
    </>
  ),

  columns: (
    <>
      <path d="M8 20h48l-24-12z" fill="#e6ddc9" />
      <path d="M10 20h44v5H10z" fill="#d6cbb2" />
      <path d="M16 25h6v26h-6zM29 25h6v26h-6zM42 25h6v26h-6z" fill="#f2ece0" />
      <path d="M8 51h48v6H8z" fill="#d6cbb2" />
      <path d="M18 25v26M31 25v26M44 25v26" stroke="#ded3bd" strokeWidth="1.5" />
    </>
  ),

  dome: (
    <>
      <path d="M14 58V34h36v24z" fill="#e6ddc9" />
      <path d="M32 8q16 8 16 26H16q0-18 16-26z" fill="#cfd9d4" />
      <path d="M32 4v6" stroke="#f2b134" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="6" r="3" fill="#f2b134" />
      <path d="M26 44h12v14H26z" fill="#8a6a4a" />
      <circle cx="20" cy="42" r="3" fill="#b0a894" />
      <circle cx="44" cy="42" r="3" fill="#b0a894" />
      <path d="M32 12v22" stroke="#b9c4be" strokeWidth="2" />
    </>
  ),

  towers: (
    <>
      <path d="M4 58l10-24 10 24zM27 58l10-30 10 30z" fill="#9aa8a0" />
      <path d="M44 58l10-20 10 20z" fill="#9aa8a0" />
      <path d="M10 40h8v18h-8zM33 38h8v20h-8zM50 44h8v14h-8z" fill="#b9c4be" />
      <path d="M14 30v-6M37 24v-6M54 34v-6" stroke="#8a6a4a" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 24l8 2-8 2zM37 18l8 2-8 2zM54 28l8 2-8 2z" fill="#e2494a" />
    </>
  ),

  clock: (
    <>
      <circle cx="32" cy="32" r="24" fill="#e8dcc6" />
      <circle cx="32" cy="32" r="19" fill="#3f6b8a" />
      <circle cx="32" cy="32" r="12" fill="#f2b134" />
      <path d="M32 32V20M32 32l9 6" stroke="#3c3630" strokeWidth="3" strokeLinecap="round" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <circle key={a} cx="32" cy="10" r="1.8" fill="#f6efdd" transform={`rotate(${a} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="2.6" fill="#3c3630" />
    </>
  ),

  cheese: (
    <>
      <path d="M6 46l40-22 12 8v14H6z" fill="#f2c94c" />
      <path d="M6 46l40-22v14L6 60z" fill="#f6d76b" opacity="0.001" />
      <path d="M46 24v14l12 8V32z" fill="#e0b53c" />
      <circle cx="20" cy="42" r="4" fill="#e0b53c" />
      <circle cx="34" cy="46" r="3" fill="#e0b53c" />
      <circle cx="28" cy="36" r="2.4" fill="#e0b53c" />
      <circle cx="44" cy="44" r="2.6" fill="#e0b53c" />
    </>
  ),

  chocolate: (
    <>
      <path d="M12 18h40v34H12z" fill="#6b4028" />
      <path d="M12 18l6-6h40l-6 6zM52 18l6-6v34l-6 6z" fill="#8a5636" />
      <g stroke="#4f2e1c" strokeWidth="2.4">
        <path d="M25 18v34M39 18v34M12 30h40M12 41h40" />
      </g>
    </>
  ),

  pizza: (
    <>
      <path d="M32 6l24 44H8z" fill="#f2c94c" />
      <path d="M32 14l18 34H14z" fill="#e2685f" />
      <circle cx="26" cy="34" r="3.4" fill="#c0392b" />
      <circle cx="38" cy="30" r="3.4" fill="#c0392b" />
      <circle cx="32" cy="42" r="3.4" fill="#c0392b" />
      <circle cx="22" cy="44" r="2.6" fill="#f6efdd" />
      <circle cx="42" cy="42" r="2.6" fill="#f6efdd" />
      <path d="M8 50h48" stroke="#d9a441" strokeWidth="5" strokeLinecap="round" />
    </>
  ),

  pretzel: (
    <>
      <path
        d="M32 50q-16 0-16-12t12-14q8-2 8 8t-8 12q-10 2-14-6"
        stroke="#b5762f"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M32 50q16 0 16-12t-12-14q-8-2-8 8t8 12q10 2 14-6"
        stroke="#c98a3c"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="22" cy="30" r="1.6" fill="#f6efdd" />
      <circle cx="42" cy="34" r="1.6" fill="#f6efdd" />
      <circle cx="32" cy="46" r="1.6" fill="#f6efdd" />
    </>
  ),

  lego: (
    <>
      <path d="M10 26h44v26H10z" fill="#e2494a" />
      <path d="M10 26l6-6h44l-6 6zM54 26l6-6v26l-6 6z" fill="#f2686a" />
      <circle cx="20" cy="20" r="6" fill="#f2686a" />
      <circle cx="34" cy="20" r="6" fill="#f2686a" />
      <circle cx="48" cy="20" r="6" fill="#f2686a" />
      <path d="M14 20h6M28 20h6M42 20h6" stroke="#c03340" strokeWidth="2" />
    </>
  ),

  amber: (
    <>
      <path d="M32 8l18 12-6 30-24 6-14-18 6-24z" fill="#e8a33d" />
      <path d="M32 16l12 8-4 20-16 4-9-12 4-16z" fill="#f2b95c" />
      <ellipse cx="30" cy="30" rx="4" ry="6" fill="#8a5a1f" transform="rotate(20 30 30)" />
      <path d="M28 24l-3-4M33 26l4-3" stroke="#8a5a1f" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="40" cy="20" r="3" fill="#fff" opacity="0.45" />
    </>
  ),

  crown: (
    <>
      <path d="M10 44l-4-26 12 10 14-18 14 18 12-10-4 26z" fill="#f2b134" />
      <path d="M10 44h44v8H10z" fill="#e0a02c" />
      <circle cx="6" cy="18" r="4" fill="#e2494a" />
      <circle cx="58" cy="18" r="4" fill="#e2494a" />
      <circle cx="32" cy="10" r="4" fill="#5cba69" />
      <circle cx="22" cy="38" r="3" fill="#e2494a" />
      <circle cx="42" cy="38" r="3" fill="#3f8fbf" />
    </>
  ),

  racecar: (
    <>
      <path d="M6 40h52v8H6z" fill="#e2494a" />
      <path d="M18 40l6-12h16l6 12z" fill="#f2686a" />
      <path d="M24 30h14l3 8H21z" fill="#8fd0e8" />
      <circle cx="18" cy="50" r="8" fill="#3c3630" />
      <circle cx="46" cy="50" r="8" fill="#3c3630" />
      <circle cx="18" cy="50" r="3.4" fill="#b0a894" />
      <circle cx="46" cy="50" r="3.4" fill="#b0a894" />
      <path d="M6 40l-4-4h6z" fill="#c03340" />
    </>
  ),

  violin: (
    <>
      <path d="M32 56q-12 0-12-12 0-6 4-9-4-3-4-8 0-9 12-9t12 9q0 5-4 8 4 3 4 9 0 12-12 12z" fill="#a9502a" />
      <path d="M32 20v30" stroke="#f6efdd" strokeWidth="2" />
      <path d="M28 34q-3 4 0 8M36 34q3 4 0 8" stroke="#6b3418" strokeWidth="2" fill="none" />
      <path d="M30 18V6h4v12z" fill="#8a4020" />
      <path d="M30 6q-4-4 0-4t4 4z" fill="#6b3418" />
      <path d="M29 22v26M35 22v26" stroke="#f2ece0" strokeWidth="1.2" />
    </>
  ),

  viking: (
    <>
      <path d="M6 42h52q-6 14-26 14T6 42z" fill="#8a5a3c" />
      <path d="M6 42q-4-10 2-12 4 4 6 0" stroke="#6b4530" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M58 42q4-10-2-12-4 4-6 0" stroke="#6b4530" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M32 40V12" stroke="#6b4530" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M16 14h32v18H16z" fill="#f4f4f2" />
      <path d="M16 20h32M16 26h32" stroke="#e2494a" strokeWidth="5" />
      {[14, 24, 34, 44].map((x) => (
        <circle key={x} cx={x + 3} cy="46" r="3" fill="#f2b134" />
      ))}
    </>
  ),
}
