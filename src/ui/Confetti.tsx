import { useEffect, useRef } from 'react'
import './Confetti.css'

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  /** Radians. */
  spin: number
  spinRate: number
  w: number
  h: number
  color: string
  life: number
}

const COLORS = ['#e2685f', '#f2b134', '#4fbf7a', '#3f8fbf', '#c86aa0', '#8f7ae5', '#f28a45']

const GRAVITY = 0.28
const DRAG = 0.992

export interface ConfettiProps {
  /** Any change to this value fires a burst. Zero fires nothing. */
  trigger: number
  count?: number
  /**
   * 'poppers' fires two angled streams from the bottom corners, the way party
   * poppers actually go off. 'burst' is a single fountain from the middle.
   */
  mode?: 'poppers' | 'burst'
  /** Fountain origin in canvas pixels, overriding the mode's own position. */
  originPx?: { x: number; y: number } | null
  /** Positions the canvas over its parent instead of the whole viewport. */
  inline?: boolean
}

/**
 * A party popper. Runs on canvas because a few hundred moving pieces as DOM
 * nodes would drop frames on a tablet, and stops itself once they settle.
 */
export function Confetti({ trigger, count = 110, mode = 'poppers', originPx = null, inline = false }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pieces = useRef<Piece[]>([])
  const frame = useRef(0)

  useEffect(() => {
    if (!trigger) return
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const { clientWidth: w, clientHeight: h } = canvas
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Each popper aims up and inwards; a single burst just goes up.
    const sources = originPx
      ? [{ x: originPx.x, y: originPx.y, aim: -Math.PI / 2 }]
      : mode === 'poppers'
        ? [
            { x: w * 0.06, y: h * 0.97, aim: -Math.PI / 2 + 0.62 },
            { x: w * 0.94, y: h * 0.97, aim: -Math.PI / 2 - 0.62 },
          ]
        : [{ x: w * 0.5, y: h * 0.82, aim: -Math.PI / 2 }]

    for (let i = 0; i < count; i++) {
      const src = sources[i % sources.length]
      const angle = src.aim + (Math.random() - 0.5) * 0.75
      const speed = 15 + Math.random() * 14
      pieces.current.push({
        x: src.x + (Math.random() - 0.5) * 20,
        y: src.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spin: Math.random() * Math.PI,
        spinRate: (Math.random() - 0.5) * 0.34,
        w: 7 + Math.random() * 6,
        h: 9 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      })
    }

    cancelAnimationFrame(frame.current)
    const step = () => {
      ctx.clearRect(0, 0, w, h)
      let alive = 0

      for (const p of pieces.current) {
        if (p.life <= 0) continue
        p.vy += GRAVITY
        p.vx *= DRAG
        p.vy *= DRAG
        p.x += p.vx
        p.y += p.vy
        p.spin += p.spinRate
        if (p.y > h + 40) p.life = 0
        else p.life -= 0.004
        if (p.life <= 0) continue
        alive++

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.spin)
        ctx.globalAlpha = Math.min(1, p.life * 2)
        ctx.fillStyle = p.color
        // Squashing the height as it spins fakes a paper strip turning over.
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.spin)))
        ctx.restore()
      }

      if (alive > 0) frame.current = requestAnimationFrame(step)
      else {
        pieces.current = []
        ctx.clearRect(0, 0, w, h)
      }
    }
    frame.current = requestAnimationFrame(step)

    return () => cancelAnimationFrame(frame.current)
  }, [trigger, count, mode, originPx])

  return <canvas className={inline ? 'confetti is-inline' : 'confetti'} ref={canvasRef} aria-hidden="true" />
}
