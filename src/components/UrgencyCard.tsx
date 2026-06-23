import type { UrgencyLevel } from '../types'
import { T } from '../styles/tokens'

interface UrgencyCardProps {
  level: UrgencyLevel
  petName: string
}

const STATUS = {
  gruen: {
    c: T.green, l: T.greenLight, b: T.greenBorder,
    micro: 'Einschätzung', sub: 'Beobachten',
    title: 'Aktuell kein Notfall erkennbar',
  },
  gelb: {
    c: T.amber, l: T.amberLight, b: T.amberBorder,
    micro: 'Einschätzung', sub: 'Zeitnah zum Tierarzt',
    title: 'Tierärztliche Abklärung empfohlen',
  },
  rot: {
    c: T.red, l: T.redLight, b: T.redBorder,
    micro: 'Dringend', sub: 'Sofort handeln',
    title: 'Jetzt sofort handeln',
  },
} as const

export function UrgencyCard({ level, petName }: UrgencyCardProps) {
  const st = STATUS[level]

  const body = {
    gruen: `Deine Angaben deuten nicht auf einen akuten Notfall hin. Beobachte ${petName} aufmerksam und dokumentiere den Verlauf.`,
    gelb:  `Bitte lass ${petName} zeitnah vom Tierarzt untersuchen. Warte nicht zu lange.`,
    rot:   'Deine Angaben können auf einen Notfall hindeuten. Bitte kontaktiere jetzt sofort einen tierärztlichen Notdienst oder eine Tierklinik. Warte damit nicht.',
  }[level]

  const warn = {
    gruen: `Sofort zum Tierarzt, wenn ${petName} sehr schlapp wird, nicht mehr frisst oder trinkt, Blut sichtbar ist oder die Symptome deutlich schlimmer werden.`,
    gelb:  `Sofort zum Notdienst, wenn sich der Zustand rasch verschlechtert, Blut sichtbar wird oder ${petName} sehr schlapp wirkt.`,
    rot:   '',
  }[level]

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: `1.5px solid ${st.b}`, background: st.l }}>
      <div style={{ display: 'flex' }}>
        {/* Signature left rail */}
        <div style={{ width: 7, flexShrink: 0, background: st.c }} />
        <div style={{ padding: '16px 15px 16px 14px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: st.c, marginBottom: 1 }}>
            {st.micro}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: st.c, marginBottom: 5 }}>
            {st.sub}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', color: T.text, marginBottom: 9 }}>
            {st.title}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: T.text }}>
            {body}
          </div>
          {warn && (
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 9, background: 'rgba(0,0,0,.04)', fontSize: 13, lineHeight: 1.5, color: T.text }}>
              <strong>Wann sofort handeln:</strong> {warn}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
