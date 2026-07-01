import React from 'react'
import type { NavTab, Screen } from '../types'

interface Props {
  children: React.ReactNode
  screen: Screen
  activeTab: NavTab
  onTab: (t: NavTab) => void
  onBack?: () => void
  onSettings: () => void
  noNav?: boolean
}

const NAV_LABELS: Record<NavTab, string> = {
  start: 'Start',
  check: 'Akut',
  akte: 'Akte',
}

function TKMonogram() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="30" rx="7" fill="#0A7A73" />
      <text
        x="15"
        y="20"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="#ffffff"
      >TK</text>
    </svg>
  )
}

export function AppShell({ children, activeTab, screen: _screen, onTab, onBack, onSettings, noNav }: Props) {
  return (
    // Desktop background layer — full viewport width, centers the app column
    <div style={{ minHeight: '100vh', background: '#dce8e5', display: 'flex', justifyContent: 'center' }}>
      {/* App container — max 440px on desktop, 100% on mobile */}
      <div style={{ width: '100%', maxWidth: '440px', background: '#f8fafc', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0px 16px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: '0',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Zurueck"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px 4px 4px',
                fontSize: '16px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              &lt;-
            </button>
          ) : (
            <TKMonogram />
          )}
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
            TierKosten Kompass
          </span>
        </div>
        <button
          onClick={onSettings}
          aria-label="Einstellungen"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: noNav ? '0' : '72px', paddingLeft: '20px', paddingRight: '20px' }}>
        {children}
      </main>

      {!noNav && (
        <nav style={{
          position: 'fixed',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          height: '72px',
          zIndex: 100,
        }}>
          {(['start', 'check', 'akte'] as NavTab[]).map(tab => {
            const active = tab === activeTab
            const label = NAV_LABELS[tab]
            return (
              <button
                key={tab}
                onClick={() => onTab(tab)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  color: active ? '#0A7A73' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: active ? '600' : '400',
                }}
              >
                {label}
              </button>
            )
          })}
        </nav>
      )}
      </div>
    </div>
  )
}
