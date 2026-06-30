import type { DemoCase } from '../types'
import { useCopy } from '../lib/LanguageContext'
import { FEATURES } from '../config/features'

interface Props {
  onBack: () => void
  onLoadDemo?: (d: DemoCase) => void
}

export function SettingsScreen({ onBack, onLoadDemo }: Props) {
  const copy = useCopy()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 16px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={onBack}
          aria-label="Zalueck"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '20px', color: '#64748b' }}>
          &#1000;;
        </button>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
          {copy.settings.title}
        </span>
      </header>

      <main style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            {copy.settings.aboutTitle}
          </h3>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              {copy.settings.aboutText}
            </p>
          </div>
        </section>

        {FEATURES.showDemoCases && onLoadDemo && (
          <section>
            <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              {copy.settings.demoTitle}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['bruno', 'mimi', 'rocky', 'felix'] as DemoCase[]).map(d => (
                <button
                  key={d}
                  onClick={() => onLoadDemo!(d)}
                  style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    color: '#1e293b',
                  }}
                >
                  Demo: {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
