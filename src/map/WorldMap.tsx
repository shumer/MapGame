import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Confetti } from '../ui/Confetti'
import { countries, countryByUn, derived } from '../data'
import { buildPaths, createPath, createProjection } from './projection'
import { SeaDecor } from './SeaDecor'
import walkerUrl from '../assets/art/decor/walker.svg?url'
import { loadShapes, type CountryShape } from './topology'
import { useMapView } from './useMapView'
import { useSize } from './useSize'
import './WorldMap.css'

export interface WorldMapProps {
  /** Countries painted as the right answer. */
  correct?: string[]
  /** Countries painted as a wrong pick. */
  wrong?: string[]
  /** The country the question is about, marked while it is still being asked. */
  highlight?: string | null
  /** Everything not listed here is dimmed. Empty or undefined dims nothing. */
  spotlight?: string[]
  /** Zooms to this country, or back out when null. */
  focus?: string | null
  /** Draws a dot on this country's capital. */
  capital?: string | null
  /** Countries already answered this round, in order, each appearing once.
      Drawn as a dotted route with a flag on every stop — the journey the game
      is named after, which the map was otherwise not showing at all. */
  trail?: string[]
  /** Where the traveller stands: usually the last stop, but a revisited
      country puts him back on a flag that is already planted. */
  travellerAt?: string | null
  /** Any change fires confetti over the focused country. Zero fires nothing. */
  celebrate?: number
  /** Called with an ISO code when a playable country is tapped. */
  onPick?: (iso: string) => void
  interactive?: boolean
}

/** Screen box of a shape under the current projection, used for zooming. */
type Boxes = Map<string, [number, number, number, number]>

/** Past this zoom the sea decoration is more clutter than charm. */
const DECOR_MAX_SCALE = 3
/** A microstate marker gives way once its real shape is big enough to tap. */
const MARKER_MAX_SIZE = 26

export function WorldMap({
  correct = [],
  wrong = [],
  highlight = null,
  spotlight,
  focus = null,
  capital = null,
  trail = [],
  travellerAt = null,
  celebrate = 0,
  onPick,
  interactive = true,
}: WorldMapProps) {
  const { ref, width, height } = useSize<HTMLDivElement>()
  const [shapes, setShapes] = useState<CountryShape[] | null>(null)

  useEffect(() => {
    let alive = true
    loadShapes().then((s) => alive && setShapes(s))
    return () => {
      alive = false
    }
  }, [])

  const projection = useMemo(
    () => (width && height ? createProjection(width, height) : null),
    [width, height],
  )

  const { paths, boxes, capitals } = useMemo(() => {
    if (!shapes || !projection) {
      return {
        paths: new Map<string, string>(),
        boxes: new Map() as Boxes,
        capitals: new Map<string, [number, number]>(),
      }
    }
    const path = createPath(projection)
    const paths = buildPaths(shapes, path)

    const boxes: Boxes = new Map()
    for (const s of shapes) {
      const [[x0, y0], [x1, y1]] = path.bounds(s)
      boxes.set(s.properties.id, [x0, y0, x1, y1])
    }

    // Focus boxes come from the derived mainland frame, not the raw geometry,
    // so overseas territories do not pull the zoom out to the Atlantic.
    const capitals = new Map<string, [number, number]>()
    for (const c of countries) {
      const p = projection(c.capitalCoords)
      if (p) capitals.set(c.iso, [p[0], p[1]])
      const [w, s, e, n] = derived[c.iso].focus
      const a = projection([w, s])
      const b = projection([e, n])
      if (a && b) {
        boxes.set(
          c.un,
          [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])],
        )
      }
    }
    return { paths, boxes, capitals }
  }, [shapes, projection])

  const map = useMapView(width, height, interactive)
  const { focusBox, reset, subscribe } = map

  const landsRef = useRef<SVGGElement>(null)
  const markersRef = useRef(new Map<string, SVGGElement>())
  const decorRef = useRef<SVGGElement>(null)
  const capitalRef = useRef<SVGGElement>(null)
  const trailRef = useRef<SVGGElement>(null)

  // Screen box per country, for placing the route without searching an array.
  const trailBoxes = useMemo(() => {
    const out = new Map<string, [number, number, number, number]>()
    for (const c of countries) {
      const box = boxes.get(c.un)
      if (box) out.set(c.iso, box)
    }
    return out
  }, [boxes])

  // Screen box per microstate, resolved once instead of searched per frame.
  const microBoxes = useMemo(() => {
    const out = new Map<string, [number, number, number, number]>()
    for (const c of countries) {
      const box = boxes.get(c.un)
      if (c.micro && box) out.set(c.iso, box)
    }
    return out
  }, [boxes])

  const setMarker = useCallback((iso: string, el: SVGGElement | null) => {
    if (el) markersRef.current.set(iso, el)
    else markersRef.current.delete(iso)
  }, [])

  /**
   * The map moves here rather than through React: the country paths carry
   * megabytes of geometry, and re-rendering them on every pointer move is what
   * made panning and pinching stutter. Only the transform changes per frame.
   */
  useEffect(
    () =>
      subscribe((v) => {
        landsRef.current?.setAttribute('transform', `translate(${v.x} ${v.y}) scale(${v.k})`)
        decorRef.current?.style.setProperty('opacity', v.k > DECOR_MAX_SCALE ? '0' : '1')

        // The route is redrawn per frame rather than re-rendered: it is a
        // dozen points, and this keeps React out of the gesture loop.
        const route = trailRef.current
        if (route) {
          const pts = trail
            .map((iso) => {
              const b = trailBoxes.get(iso)
              return b ? [((b[0] + b[2]) / 2) * v.k + v.x, ((b[1] + b[3]) / 2) * v.k + v.y] : null
            })
            .filter((p): p is number[] => p !== null)

          // Curved rather than straight, and alternating which way it bows, so
          // the route wanders like the dotted path on a children's map instead
          // of looking like a flight plan.
          let d = ''
          pts.forEach((p, i) => {
            if (i === 0) {
              d = `M${p[0]} ${p[1]}`
              return
            }
            const prev = pts[i - 1]
            const dx = p[0] - prev[0]
            const dy = p[1] - prev[1]
            const len = Math.hypot(dx, dy) || 1
            const bend = (i % 2 ? 1 : -1) * len * 0.16
            const cx = (prev[0] + p[0]) / 2 - (dy / len) * bend
            const cy = (prev[1] + p[1]) / 2 + (dx / len) * bend
            d += ` Q${cx} ${cy} ${p[0]} ${p[1]}`
          })
          route.querySelectorAll('.trail-line').forEach((el) => el.setAttribute('d', d))

          const stops = route.querySelectorAll('.trail-stop')
          stops.forEach((el, i) => {
            const p = pts[i]
            if (p) el.setAttribute('transform', `translate(${p[0]} ${p[1]})`)
          })

          // No rotation and no CSS transition: the traveller stands upright,
          // and a transition here would make him lag behind the map on every
          // pan and pinch rather than only when he moves on.
          const walker = route.querySelector('.trail-walker') as SVGGElement | null
          const standing = travellerAt ? trailBoxes.get(travellerAt) : null
          const head = standing
            ? [((standing[0] + standing[2]) / 2) * v.k + v.x, ((standing[1] + standing[3]) / 2) * v.k + v.y]
            : pts[pts.length - 1]
          if (walker && head) {
            walker.setAttribute('transform', `translate(${head[0]} ${head[1]})`)
          }
        }

        const cap = capital ? capitals.get(capital) : null
        if (cap && capitalRef.current) {
          capitalRef.current.setAttribute(
            'transform',
            `translate(${cap[0] * v.k + v.x} ${cap[1] * v.k + v.y})`,
          )
        }

        for (const [iso, el] of markersRef.current) {
          const p = capitals.get(iso)
          if (!p) continue
          const x = p[0] * v.k + v.x
          const y = p[1] * v.k + v.y
          el.setAttribute('transform', `translate(${x} ${y})`)

          const box = microBoxes.get(iso)
          const onScreen = box ? Math.max(box[2] - box[0], box[3] - box[1]) * v.k : 0
          const offScreen = x < -20 || y < -20 || x > width + 20 || y > height + 20
          el.style.setProperty(
            'display',
            offScreen || onScreen > MARKER_MAX_SIZE ? 'none' : '',
          )
        }
      }),
    [subscribe, capitals, microBoxes, trailBoxes, trail, travellerAt, capital, width, height],
  )

  useEffect(() => {
    if (!width || !height || !boxes.size) return
    if (!focus) {
      reset()
      return
    }
    const country = countries.find((c) => c.iso === focus)
    const box = country && boxes.get(country.un)
    if (box) focusBox(box, country?.micro ? 0.72 : 0.5, country?.micro ? 12 : 8)
  }, [focus, boxes, width, height, focusBox, reset])

  const state = (iso: string) => {
    if (correct.includes(iso)) return 'correct'
    if (wrong.includes(iso)) return 'wrong'
    if (highlight === iso) return 'focus'
    if (spotlight?.length && !spotlight.includes(iso)) return 'dim'
    return 'plain'
  }

  const pick = (iso: string) => {
    if (!interactive || !onPick || !map.wasTap()) return
    onPick(iso)
  }

  const capitalPoint = capital ? capitals.get(capital) : null

  // Where the celebration should come from: the country currently framed.
  const burstAt = useMemo(() => {
    const box = focus ? trailBoxes.get(focus) : null
    if (!box) return null
    const v = map.viewRef.current
    return { x: ((box[0] + box[2]) / 2) * v.k + v.x, y: ((box[1] + box[3]) / 2) * v.k + v.y }
    // The view is read at reveal time, when the zoom has already settled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, trailBoxes, celebrate])

  return (
    <div className="worldmap" ref={ref}>
      {width > 0 && height > 0 && shapes && (
        <svg
          width={width}
          height={height}
          className={interactive ? 'worldmap-svg is-interactive' : 'worldmap-svg'}
          {...map.handlers}
        >
          <rect className="sea" width={width} height={height} />
          <g ref={landsRef} className="lands">
            {/* Sea decoration sits under the countries, so a piece that strays
                onto a coast is covered rather than sitting on top of it. */}
            {projection && (
              <g ref={decorRef} className="sea-decor-layer">
                <SeaDecor project={(c) => projection(c) ?? null} />
              </g>
            )}

            {shapes
              .filter((s) => !s.properties.playable)
              .map((s) => (
                <path key={s.properties.id} className="backdrop" d={paths.get(s.properties.id)} />
              ))}

            {shapes
              .filter((s) => s.properties.playable)
              .map((s) => {
                const c = countryByUn(s.properties.id)
                if (!c) return null
                return (
                  <path
                    key={c.iso}
                    className={`country tone-${derived[c.iso].color} is-${state(c.iso)}`}
                    d={paths.get(s.properties.id)}
                    onPointerUp={() => pick(c.iso)}
                  />
                )
              })}
          </g>

          {/* The route travelled so far, outside the zoom transform so the
              flags and the plane keep their size. */}
          {trail.length > 0 && (
            <g className="trail" ref={trailRef} aria-hidden="true">
              {/* Two strokes: a wide pale one so the route survives the pastel
                  countries underneath, and the dotted line on top. */}
              <path className="trail-line trail-line-under" />
              <path className="trail-line trail-line-over" />
              {trail.map((iso, i) => (
                <g className="trail-stop" key={`${iso}-${i}`}>
                  <circle className="trail-base" r="3.4" />
                  <path className="trail-pole" d="M0 1v-17" />
                  <path className="trail-flag" d="M1-16h11l-3 4.2L12-7.6H1z" />
                </g>
              ))}
              {/* The traveller at the head of the route, standing on the last
                  country reached. Noto Emoji art, see src/assets/art/NOTICE.md. */}
              <g className="trail-walker">
                <ellipse className="walker-shadow" cx="0" cy="1" rx="10" ry="3.5" />
                <image href={walkerUrl} x={-16} y={-32} width={32} height={32} />
              </g>
            </g>
          )}

          {/* Markers sit outside the zoom transform so they keep their size. */}
          <g className="markers">
            {countries
              .filter((c) => c.micro)
              .map((c) => (
                <g
                  key={c.iso}
                  ref={(el) => setMarker(c.iso, el)}
                  className={`micro is-${state(c.iso)}`}
                  onPointerUp={() => pick(c.iso)}
                >
                  <circle className="micro-hit" r={16} />
                  <circle className={`micro-dot tone-${derived[c.iso].color}`} r={5.5} />
                </g>
              ))}

            {capitalPoint && (
              <g
                className="capital"
                ref={capitalRef}
                transform={`translate(${capitalPoint[0] * map.view.k + map.view.x} ${
                  capitalPoint[1] * map.view.k + map.view.y
                })`}
              >
                <circle r={9} className="capital-halo" />
                <circle r={4} className="capital-dot" />
              </g>
            )}
          </g>
        </svg>
      )}
      {celebrate > 0 && (
        <Confetti trigger={celebrate} originPx={burstAt} count={90} inline />
      )}
      {!shapes && <div className="worldmap-loading">Карта загружается…</div>}
    </div>
  )
}
