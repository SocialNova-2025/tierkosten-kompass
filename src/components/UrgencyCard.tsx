import type { UrgencyLevel } from '../types'
import { T } from '../styles/tokens'
import { useCopy } from '../lib/LanguageContext'

interface UrgencyCardProps {
  level: UrgencyLevel
  petName: string
}

const COLORS: Record<UrgencyLevel, { bg: string; border: string; badge: string; text: string }> = {
  rot:  { bg: '#FEF2F2', border: '#FECACA', badge: '#DC2626', text: '#991B1B' },
  gelb: { bg: '#FFFBEB', border: '#FDE68A', badge: '#D97706', text: '#92400E' },
  gruen: { bg: '#F0FDF4', border: '#BBF7D0', badge: '#16A34A', text: '#14532D' },
}

export function UrgencyCard({ level, petName }: UrgencyCardProps) {
  const c = useCopy()
  const lvl = c.urgencyCard[level]
  const col = COLORS[level]
  const name = petName || 'dein Tier'

  // body may be a string (rot) or a function (gruen/gelb) – resolve to string
  const rawBody = lvl.body
  const body = typeof rawBody === 'function' ? rawBody(name) : rawBody

  return (
    <div style={{
      background: col.bg, border: `1.5px solid ${col.border}`,
      borderRadius: 14, padding: '16px', marginBottom: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{
          background: col.badge, color: '#fff',
          fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
          padding: '3px 10px', borderRadius: 99,
        }}>
          {lvl.badge}
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: col.text }}>{lvl.title}</span>
      </div>
      <p style={{ fontSize: 13, color: col.text, lineHeight: 1.6, margin: 0 }}>{body}</p>
    </div>
  )
}
