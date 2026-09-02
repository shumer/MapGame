import { countries } from '../data'
import { CountrySymbol } from '../ui/CountrySymbol'

/**
 * Development view for checking every drawn hint at once. Reached at #symbols;
 * it is never linked from the game itself.
 */
export function SymbolGallery() {
  return (
    <div style={{ padding: 20, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
      {countries.map((c) => (
        <div
          key={c.iso}
          style={{
            background: 'var(--surface)',
            borderRadius: 16,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CountrySymbol symbol={c.symbol} size={72} />
          <b style={{ fontSize: 14 }}>{c.name.ru}</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{c.symbol}</span>
        </div>
      ))}
    </div>
  )
}
