import { SYMBOLS } from './symbols'
import './CountrySymbol.css'

export interface CountrySymbolProps {
  /** Key from the country data. */
  symbol: string
  size?: number
}

/** The drawn hint for a country: its animal, landmark or best-known thing. */
export function CountrySymbol({ symbol, size = 64 }: CountrySymbolProps) {
  const art = SYMBOLS[symbol]
  if (!art) return null
  return (
    <svg className="country-symbol" width={size} height={size} viewBox="0 0 64 64" role="presentation">
      {art}
    </svg>
  )
}
