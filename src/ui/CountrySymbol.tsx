import { SYMBOLS } from './symbols'
import './CountrySymbol.css'

// Noto Emoji artwork, committed under src/assets/art/symbols. Where a country's
// symbol exists there it is used; the rest fall back to the drawn set.
const files = import.meta.glob('../assets/art/symbols/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const urls: Record<string, string> = {}
for (const [file, url] of Object.entries(files)) {
  urls[file.split('/').pop()!.replace('.svg', '')] = url as string
}

export interface CountrySymbolProps {
  /** Key from the country data. Countries without an obvious symbol have none,
      and render nothing rather than a picture that means something else. */
  symbol?: string
  size?: number
}

/** The drawn hint for a country: its animal, landmark or best-known thing. */
export function CountrySymbol({ symbol, size = 64 }: CountrySymbolProps) {
  if (!symbol) return null
  const url = urls[symbol]
  if (url) {
    return <img className="country-symbol" src={url} width={size} height={size} alt="" />
  }

  const art = SYMBOLS[symbol]
  if (!art) return null
  return (
    <svg className="country-symbol" width={size} height={size} viewBox="0 0 64 64" role="presentation">
      {art}
    </svg>
  )
}
