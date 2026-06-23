import type { DemoCase } from '../types'
import { T, BTN } from '../styles/tokens'

interface SettingsScreenProps {
  demos: DemoCase[]
  onLoadDemo: (index: number) => void
  onClearAll: () => void
}

const LEGAL_LINKS = ['Datenschutzerklärung', 'Impressum', 'Haftungsausschluss', 'Nutzungsbedingungen']

export function SettingsScreen({ demos, onLoadDemo, onClearAll }: SettingsScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>Einstellungen</h2>

      {/* Demo cases */}
      <div className="card">
        <div className="flbl">Demo-Fälle laden</div>
        <p style={{ fontSize: 13, color: T.muted, margin: '0 0 12px', lineHeight: 1.5 }}>
          Lade vordefinierte Beispiele, um alle Screens zu erleben.
        </p>
        {demos.map((d, i) => (
          <button
            key={d.label}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '11px 0',
              fontSize: 13,
              fontWeight: 500,
              color: T.text,
              background: 'none',
              border: 'none',
              borderBottom: i < demos.length - 1 ? `1px solid ${T.border}` : 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            onClick={() => onLoadDemo(i)}
          >
            <span>{d.label}</span>
            <span style={{ color: T.muted }}>→</span>
          </button>
        ))}
      </div>

      {/* Legal */}
      <div className="card">
        <div className="flbl">Rechtliches</div>
        {LEGAL_LINKS.map((l, i) => (
          <div
            key={l}
            style={{
              padding: '10px 0',
              borderBottom: i < LEGAL_LINKS.length - 1 ? `1px solid ${T.border}` : 'none',
              fontSize: 13,
              color: T.text,
              display: 'flex',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <span>{l}</span>
            <span style={{ color: T.muted }}>→</span>
          </div>
        ))}
      </div>

      {/* Data */}
      <div className="card">
        <div className="flbl">Daten</div>
        <button
          style={{ fontSize: 13, color: T.red, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontFamily: 'inherit', fontWeight: 600 }}
          onClick={onClearAll}
        >
          Alle lokalen Daten löschen
        </button>
      </div>

      <p style={{ fontSize: 11, color: T.muted, textAlign: 'center' }}>
        TierKosten Kompass · Demo-Prototyp · Alle Angaben ohne Gewähr · Kein medizinischer Rat
      </p>
    </div>
  )
}
