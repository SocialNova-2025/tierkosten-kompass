import type { UrgencyLevel } from '../types'
import { T } from '../styles/tokens'
import { useCopy } from '../lib/LanguageContext'

interface UrgencyCardProps {
  level: UrgencyLevel
  petName: string
}

const COLORS = {
  gruen: { c: T.green,  l: T.greenLight,  b: T.greenBorder  },
  gelb:  { c: T.amber,  l: T.amberLight,  b: T.amberBorder  },
  rot:   { c: T.red,    l: T.redLight,    b: T.redBorder    },
} as const

export function UrgencyCard({ level, petName }: UrgencyCardProps) {
  const copy = useCopy()
  const c    = copy.urgencyCard
  const st   = COLORS[level]

  /** Safe pet name â never show undefined / null / empty */
  const name = petName || c.petFallback

  const lvl = c[level]

  const body = level === 'rot'
    ? lvl.body
    : (lvl as typeof c.gruen).body(name)

  const warn = level !== 'rot'
    ? (lvl as typeof c.gruen).warn(name)
    : ''

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: `1.5px solid ${st.b}`, background: st.l }}>
      <div style={{ display: 'flex' }}>
        {/* Signature left rail */}
        <div style={{ width: 7, flexShrink: 0, background: st.c }} />
        <div style={{ padding: '16px 15px 16px 14px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: st.c, marginBottom: 1 }}>
            {lvl.micro}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: st.c, marginBottom: 5 }}>
            {lvl.sub}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', color: T.text, marginBottom: 9 }}>
            {lvl.title}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: T.text }}>
            {body}
          </div>
          {warn && (
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 9, background: 'rgba(0,0,0,.04)', fontSize: 13, lineHeight: 1.5, color: T.text }}>
              <strong>{c.whenToAct}</strong> {warn}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
