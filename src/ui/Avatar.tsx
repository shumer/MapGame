import { LOOKS, type Look } from './avatars'
import './Avatar.css'

function Hair({ look }: { look: Look }) {
  const { hair, style } = look
  switch (style) {
    case 'bob':
      return (
        <>
          <path d="M22 46c0-16 10-26 28-26s28 10 28 26v14c0 4-3 6-6 5-2-9-4-14-8-16-6 4-22 5-30 0-3 3-5 8-6 16-4 1-6-1-6-5V46z" fill={hair} />
        </>
      )
    case 'curly':
      return (
        <g fill={hair}>
          <circle cx="34" cy="30" r="12" />
          <circle cx="50" cy="24" r="13" />
          <circle cx="66" cy="30" r="12" />
          <circle cx="26" cy="42" r="9" />
          <circle cx="74" cy="42" r="9" />
        </g>
      )
    case 'ponytail':
      return (
        <>
          <path d="M24 44c0-15 11-24 26-24s26 9 26 24v4c-4-8-8-12-14-13-8 5-20 6-30 2-4 2-6 5-8 11v-4z" fill={hair} />
          <circle cx="79" cy="52" r="11" fill={hair} />
        </>
      )
    case 'buzz':
      return <path d="M25 45c0-15 11-24 25-24s25 9 25 24v2c-6-6-14-9-25-9s-19 3-25 9v-2z" fill={hair} />
    case 'long':
      return (
        <>
          <path d="M20 48c0-17 12-28 30-28s30 11 30 28v26c0 3-2 5-5 5s-5-2-5-5V52c-8 5-32 5-40 0v22c0 3-2 5-5 5s-5-2-5-5V48z" fill={hair} />
        </>
      )
    default:
      return <path d="M24 46c0-16 11-26 26-26s26 10 26 26v2c-3-7-7-11-12-13-9 4-20 5-30 1-4 2-8 5-10 12v-2z" fill={hair} />
  }
}

export interface AvatarProps {
  index: number
  size?: number
  /** Draws the selected ring. */
  selected?: boolean
}

export function Avatar({ index, size = 96, selected = false }: AvatarProps) {
  const look = LOOKS[index % LOOKS.length]
  return (
    <svg
      className={`avatar ${selected ? 'is-selected' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="presentation"
    >
      <circle cx="50" cy="50" r="50" fill={look.bg} />
      {/* Shoulders, clipped by the disc. */}
      <path d="M50 66c-16 0-28 10-31 24 8 6 19 10 31 10s23-4 31-10c-3-14-15-24-31-24z" fill={look.shirt} />
      <ellipse cx="50" cy="49" rx="22" ry="24" fill={look.skin} />
      <Hair look={look} />
      <circle cx="42" cy="49" r="3.4" fill="#33261f" />
      <circle cx="58" cy="49" r="3.4" fill="#33261f" />
      <circle cx="43.2" cy="47.8" r="1.1" fill="#fff" />
      <circle cx="59.2" cy="47.8" r="1.1" fill="#fff" />
      <path d="M43 59c2 3.6 5 5.4 7 5.4s5-1.8 7-5.4" stroke="#a8524a" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <circle cx="34" cy="56" r="4" fill="#f0a0a0" opacity="0.55" />
      <circle cx="66" cy="56" r="4" fill="#f0a0a0" opacity="0.55" />
    </svg>
  )
}
