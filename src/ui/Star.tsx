/** A drawn star. The ★ glyph renders differently on every platform. */
export function Star({ size = 16, filled = true }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="presentation" style={{ display: 'block' }}>
      <path
        d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 2}
        strokeLinejoin="round"
      />
    </svg>
  )
}
