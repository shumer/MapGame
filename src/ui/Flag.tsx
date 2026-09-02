import './Flag.css'

const files = import.meta.glob('../assets/flags/*.svg', { eager: true, query: '?url', import: 'default' })

const urls: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const iso = path.split('/').pop()!.replace('.svg', '').toUpperCase()
  urls[iso] = url as string
}

export interface FlagProps {
  iso: string
  /** Accessible label. Omit on decorative flags shown next to their own name. */
  label?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Flag({ iso, label, size = 'md' }: FlagProps) {
  const url = urls[iso]
  if (!url) return null
  return (
    <img
      className={`flag flag-${size}`}
      src={url}
      alt={label ?? ''}
      role={label ? undefined : 'presentation'}
      draggable={false}
    />
  )
}
