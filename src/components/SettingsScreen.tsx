import type { DemoCase } from '../types'
import { T } from '../styles/tokens'
import { useLanguage } from '../lib/LanguageContext'
import type { Lang } from '../lib/LanguageContext'

interface SettingsScreenProps {
  demos: DemoCase[]
  onLoadDemo: (index: number) => void
  onClearAll: () => void
}

const LEGAL_LINKS = ['Datenschutzerklärung', 'Impressum', 'Haftungsausschluss', 'Nutzungsbedingungen']

export function SettingsScreen({ demos, onLoadDemo, onClearAll }: SettingsScreenProps) {
  const { lang, setLang, copy } = useLanguage()
  const c = copy.settings

  const langBtn = (l: Lang): React.CSSProperties => ({
    padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    border: `1.5px solid ${lang === l ? T.primary : T.border}`,
    background: '#fff', color: lang === l ? T.primary : T.muted, flex: 1,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>{c.title}</h2>

      <div className="card">
        <div className="flbl">{c.demosLabel}</div>
        <p style={{ fontSize: 13, color: T.muted, margin: '0 0 12px', lineHeight: 1.5 }}>{c.demosDesc}</p>
        {demos.map((d, i) => (
          <button key={d.label} style={{
            width: '100%', textAlign: 'left', padding: '11px 0', fontSize: 13, fontWeight: 500,
            color: T.text, background: 'none', border: 'none',
            borderBottom: i < demos.length - 1 ? `1px solid ${T.border}` : 'none',
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }} onClick={() => onLoadDemo(i)}>
            <span>{d.label}</span>
            <span style={{ color: T.muted }}>→</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="flbl">{c.languageLabel}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={langBtn('de')} onClick={() => setLang('de')}>{copy.common.langDe}</button>
          <button style={langBtn('en')} onClick={() => setLang('en')}>{copy.common.langEn}</button>
        </div>
      </div>

      <div className="card">
        <div className="flbl">{c.legalLabel}</div>
        {LEGAL_LINKS.map((l, i) => (
          <div key={l} style={{
            padding: '10px 0', borderBottom: i < LEGAL_LINKS.length - 1 ? `1px solid ${T.border}` : 'none',
            fontSize: 13, color: T.text, display: 'flex', justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <span>{l}</span>
            <span style={{ color: T.muted }}>→</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flbl">{c.dataLabel}</div>
        <button style={{ fontSize: 13, color: T.red, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontFamily: 'inherit', fontWeight: 600 }} onClick={onClearAll}>
          {c.clearAll}
        </button>
      </div>

      <p style={{ fontSize: 11, color: T.muted, textAlign: 'center' }}>{c.footer}</p>
    </div>
  )
}
