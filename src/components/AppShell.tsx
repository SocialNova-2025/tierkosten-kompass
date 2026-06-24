import type { NavTab, Screen } from '../types'
import { BottomNav } from './BottomNav'
import { useLanguage } from '../lib/LanguageContext'

interface AppShellProps {
  screen: Screen
  activeTab: NavTab
  onTab: (tab: NavTab) => void
  onBack?: () => void
  onSettings: () => void
  children: React.ReactNode
  noNav?: boolean
}

const TITLES: Partial<Record<Screen, string>> = {
  P2:  'Tierprofil',
  P3:  'Symptome',
  P4a: 'Schritt 1 / 3',
  P4b: 'Schritt 2 / 3',
  P4c: 'Schritt 3 / 3',
  P6:  'Ergebnis',
  P7:  'Schutz-Check',
  P8:  'Schutz-Ergebnis',
  P9:  'Beratung starten',
  P10: 'Bestätigung',
  P11: 'Tierakte',
}

export function AppShell({ screen, activeTab, onTab, onBack, onSettings, children, noNav = false }: AppShellProps) {
  const { lang, setLang } = useLanguage()
  const title = TITLES[screen]

  return (
    <div className="app-shell">
      <header className="hdr">
        <div style={{ width: 38, display: 'flex', alignItems: 'center' }}>
          {onBack && <button className="hdr-back" onClick={onBack} aria-label="Zurück">←</button>}
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          {title ? (
            <span className="hdr-title">{title}</span>
          ) : (
            <span className="hdr-logo"><em>TierKosten</em>Kompass</span>
          )}
        </div>
        <div style={{ width: 76, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
            aria-label="Sprache wechseln"
            style={{
              fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 6,
              border: '1px solid currentColor', cursor: 'pointer', background: 'transparent',
              color: 'var(--hdr-fg, #1A2A2A)', fontFamily: 'inherit', letterSpacing: '.04em',
              lineHeight: 1, opacity: 0.65,
            }}
          >
            {lang === 'de' ? 'EN' : 'DE'}
          </button>
          <button className="hdr-gear" onClick={onSettings} aria-label="Einstellungen">
            <i className="ti ti-settings" aria-hidden="true" style={{ fontSize: 16 }} />
          </button>
        </div>
      </header>
      <main className="main">{children}</main>
      {!noNav && <BottomNav activeTab={activeTab} onTab={onTab} />}
    </div>
  )
}
