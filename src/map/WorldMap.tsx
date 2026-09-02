import { useEffect, useMemo, useState } from 'react'
import { countries, countryByUn, derived } from '../data'
import { buildPaths, createPath, createProjection } from './projection'
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
  /** Called with an ISO code when a playable country is tapped. */
  onPick?: (iso: string) => void
  interactive?: boolean
}

/** Screen box of a shape under the current projection, used for zooming. */
type Boxes = Map<string, [number, number, number, number]>

export function WorldMap({
  correct = [],
  wrong = [],
  highlight = null,
  spotlight,
  focus = null,
  capital = null,
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
      return { paths: new Map<string, string>(), boxes: new Map() as Boxes, capitals: new Map<string, [number, number]>() }
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
  const { focusBox, reset } = map

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

  const transform = `translate(${map.view.x} ${map.view.y}) scale(${map.view.k})`
  const capitalPoint = capital ? capitals.get(capital) : null

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
          <g transform={transform} className="lands">
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
                    style={{ strokeWidth: 1.4 / map.view.k }}
                    onPointerUp={() => pick(c.iso)}
                  />
                )
              })}
          </g>

          {/* Markers sit outside the zoom transform so they keep their size. */}
          <g className="markers">
            {countries
              .filter((c) => c.micro)
              .map((c) => {
                const p = capitals.get(c.iso)
                if (!p) return null
                // Once zoomed in far enough that the real shape is clickable,
                // the marker would only cover it up.
                const box = boxes.get(c.un)
                const onScreen = box ? Math.max(box[2] - box[0], box[3] - box[1]) * map.view.k : 0
                if (onScreen > 26) return null
                const x = p[0] * map.view.k + map.view.x
                const y = p[1] * map.view.k + map.view.y
                if (x < -20 || y < -20 || x > width + 20 || y > height + 20) return null
                return (
                  <g key={c.iso} className={`micro is-${state(c.iso)}`} onPointerUp={() => pick(c.iso)}>
                    <circle className="micro-hit" cx={x} cy={y} r={16} />
                    <circle className={`micro-dot tone-${derived[c.iso].color}`} cx={x} cy={y} r={5.5} />
                  </g>
                )
              })}

            {capitalPoint && (
              <g className="capital">
                <circle
                  cx={capitalPoint[0] * map.view.k + map.view.x}
                  cy={capitalPoint[1] * map.view.k + map.view.y}
                  r={9}
                  className="capital-halo"
                />
                <circle
                  cx={capitalPoint[0] * map.view.k + map.view.x}
                  cy={capitalPoint[1] * map.view.k + map.view.y}
                  r={4}
                  className="capital-dot"
                />
              </g>
            )}
          </g>
        </svg>
      )}
      {!shapes && <div className="worldmap-loading">Карта загружается…</div>}
    </div>
  )
}
