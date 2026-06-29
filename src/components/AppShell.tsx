import type { NavTab, Screen } from '../types'
import { BottomNav } from './BottomNav'
import { useCopy } from '../lib/LanguageContext'

interface AppShellProps {
  screen: Screen
  activeTab: NavTab
  onTab: (tab: NavTab) => void
  onBack?: () => void
  onSettings: () => void
  children: React.ReactNode
  noNav?: boolean
}

/** TK monogram â inline SVG rounded square with white "TK" letters */
function TKMonogram() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="30" height="30" rx="7" fill="#0A7A73" />
      <text
        x="15"
        y="20"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.5"
      >
        TK
      </text>
    </svg>
  )
}

export function AppShell({ screen, activeTab, onTab, onBack, onSettings, children, noNav = false }: AppShellProps) {
  const copy = useCopy()
  const cs   = copy.appShell

  const TITLES: Partial<Record<Screen, string>> = {
    P2:  cs.screenPetProfile,
    P3:  cs.screenSymptoms,
    P4a: cs.screenStep(1, 3),
    P4b: cs.screenStep(2, 3),
    P4c: cs.screenStep(3, 3),
    P6:  cs.screenResult,
    P11: cs.screenRecord,
  }

  const title = TITLES[screen]

  return (
    <div className="app-shell">
      <header className="hdr">
        <div style={{ width: 38, display: 'flex', alignItems: 'center' }}>
          {onBack && <button className="hdr-back" onClick={onBack} aria-label="ZurÃ¼ck">â</button>}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {title ? (
            <span className="hdr-title">{title}</span>
          ) : (
            <>
              <TKMonogram />
              <span className="hdr-logo">TierKosten Kompass</span>
            </>
          )}
        </div>
        <div style={{ width: 38, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
