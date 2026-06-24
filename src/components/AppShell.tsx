import type { NavTab, Screen } from '../types'
import { BottomNav } from './BottomNav'

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

export function AppShell({
  screen,
  activeTab,
  onTab,
  onBack,
  onSettings,
  children,
  noNav = false,
}: AppShellProps) {
  const title = TITLES[screen]

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="hdr">
        <div style={{ width: 38, display: 'flex', alignItems: 'center' }}>
          {onBack && (
            <button className="hdr-back" onClick={onBack} aria-label="Zurück">
              ←
            </button>
          )}
        </div>

        <div style={{ flex: 1, textAlign: 'center' }}>
          {title ? (
            <span className="hdr-title">{title}</span>
          ) : (
            <span className="hdr-logo">
              <em>TierKosten</em>Kompass
            </span>
          )}
        </div>

        <div style={{ width: 38, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="hdr-gear"
            onClick={onSettings}
            aria-label="Einstellungen"
          >
            <i className="ti ti-settings" aria-hidden="true" style={{ fontSize: 16 }} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="main">{children}</main>

      {/* Bottom nav */}
      {!noNav && <BottomNav activeTab={activeTab} onTab={onTab} />}
    </div>
  )
}
