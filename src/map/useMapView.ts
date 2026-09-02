import { useCallback, useEffect, useRef, useState } from 'react'

export interface View {
  k: number
  x: number
  y: number
}

const IDENTITY: View = { k: 1, x: 0, y: 0 }
const MIN_K = 1
const MAX_K = 14
/** Below this a pointer gesture counts as a tap, not a drag. */
const TAP_SLOP = 6

const clampK = (k: number) => Math.min(MAX_K, Math.max(MIN_K, k))

/** Keeps the map from being dragged off screen. */
function clampView(v: View, width: number, height: number): View {
  const slackX = Math.max(0, (v.k - 1) * width) / 2 + width * 0.15
  const slackY = Math.max(0, (v.k - 1) * height) / 2 + height * 0.15
  const cx = (width * (1 - v.k)) / 2
  const cy = (height * (1 - v.k)) / 2
  return {
    k: v.k,
    x: Math.min(cx + slackX, Math.max(cx - slackX, v.x)),
    y: Math.min(cy + slackY, Math.max(cy - slackY, v.y)),
  }
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export interface MapView {
  /** Read during render for the initial paint; not updated mid-gesture. */
  view: View
  /** Always current, including mid-gesture. */
  viewRef: React.RefObject<View>
  /**
   * Called on every view change, inside the frame that produced it. This is how
   * the map moves: the SVG carries ~2 MB of path data, and re-rendering that
   * through React on every pointer move is what made panning stutter.
   */
  subscribe: (fn: (view: View) => void) => () => void
  reset: (animated?: boolean) => void
  /** Frames a screen-space box, in the projected pixel coordinates of the map. */
  focusBox: (box: [number, number, number, number], padding?: number, maxScale?: number) => void
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    onWheel: (e: React.WheelEvent) => void
  }
  /** Set by the last pointer gesture: false right after a drag or pinch. */
  wasTap: () => boolean
}

export function useMapView(width: number, height: number, enabled = true): MapView {
  const [view, setViewState] = useState<View>(IDENTITY)

  const viewRef = useRef<View>(view)
  const listeners = useRef(new Set<(v: View) => void>())

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const start = useRef<{ view: View; x: number; y: number; dist: number } | null>(null)
  const travelled = useRef(0)
  const frame = useRef(0)
  const settle = useRef(0)

  const subscribe = useCallback((fn: (v: View) => void) => {
    listeners.current.add(fn)
    fn(viewRef.current)
    return () => {
      listeners.current.delete(fn)
    }
  }, [])

  /**
   * Publishes a new view. Listeners run immediately; React state catches up on
   * a trailing timeout, so anything that genuinely needs a re-render (hiding
   * decoration when zoomed in, for instance) still happens, just not per frame.
   */
  const publish = useCallback((next: View) => {
    viewRef.current = next
    for (const fn of listeners.current) fn(next)
    clearTimeout(settle.current)
    settle.current = window.setTimeout(() => setViewState(next), 90)
  }, [])

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      clearTimeout(settle.current)
    },
    [],
  )

  const animate = useCallback(
    (to: View) => {
      cancelAnimationFrame(frame.current)
      const from = { ...viewRef.current }
      if (Math.abs(from.k - to.k) < 0.001 && Math.abs(from.x - to.x) < 0.5 && Math.abs(from.y - to.y) < 0.5) {
        return
      }
      const t0 = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / 520)
        const e = easeInOut(t)
        publish({
          k: from.k + (to.k - from.k) * e,
          x: from.x + (to.x - from.x) * e,
          y: from.y + (to.y - from.y) * e,
        })
        if (t < 1) frame.current = requestAnimationFrame(step)
      }
      frame.current = requestAnimationFrame(step)
    },
    [publish],
  )

  const focusBox = useCallback(
    (box: [number, number, number, number], padding = 0.22, maxScale = MAX_K) => {
      const [x0, y0, x1, y1] = box
      const bw = Math.max(1, x1 - x0)
      const bh = Math.max(1, y1 - y0)
      // Capped on purpose: a small country filling the screen tells a child
      // nothing about where in Europe it actually is.
      const k = Math.min(maxScale, clampK(Math.min(width / bw, height / bh) * (1 - padding)))
      const cx = (x0 + x1) / 2
      const cy = (y0 + y1) / 2
      animate(clampView({ k, x: width / 2 - k * cx, y: height / 2 - k * cy }, width, height))
    },
    [animate, width, height],
  )

  const reset = useCallback(
    (animated = true) => (animated ? animate(IDENTITY) : publish(IDENTITY)),
    [animate, publish],
  )

  const gap = () => {
    const [a, b] = [...pointers.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }
  const middle = () => {
    const pts = [...pointers.current.values()]
    const sx = pts.reduce((s, p) => s + p.x, 0) / pts.length
    const sy = pts.reduce((s, p) => s + p.y, 0) / pts.length
    return { x: sx, y: sy }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!enabled) return
    cancelAnimationFrame(frame.current)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    travelled.current = 0
    const mid = middle()
    start.current = {
      view: viewRef.current,
      x: mid.x,
      y: mid.y,
      dist: pointers.current.size === 2 ? gap() : 0,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!enabled || !pointers.current.has(e.pointerId) || !start.current) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const s = start.current
    const mid = middle()
    travelled.current = Math.max(travelled.current, Math.hypot(mid.x - s.x, mid.y - s.y))

    let k = s.view.k
    if (pointers.current.size === 2 && s.dist > 0) {
      k = clampK(s.view.k * (gap() / s.dist))
      travelled.current = TAP_SLOP + 1
    }
    // Keep the point the gesture started on under the fingers.
    const scale = k / s.view.k
    publish(
      clampView(
        { k, x: mid.x - (s.x - s.view.x) * scale, y: mid.y - (s.y - s.view.y) * scale },
        width,
        height,
      ),
    )
  }

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) {
      start.current = null
      // A gesture just ended: let React see where the map came to rest.
      setViewState(viewRef.current)
    } else {
      // A finger lifted out of a pinch: restart from the remaining one.
      const mid = middle()
      start.current = { view: viewRef.current, x: mid.x, y: mid.y, dist: 0 }
    }
  }

  const onWheel = (e: React.WheelEvent) => {
    if (!enabled) return
    cancelAnimationFrame(frame.current)
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const current = viewRef.current
    const k = clampK(current.k * Math.exp(-e.deltaY * 0.0022))
    const scale = k / current.k
    publish(
      clampView({ k, x: mx - (mx - current.x) * scale, y: my - (my - current.y) * scale }, width, height),
    )
  }

  return {
    view,
    viewRef,
    subscribe,
    reset,
    focusBox,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onWheel },
    wasTap: () => travelled.current <= TAP_SLOP,
  }
}
