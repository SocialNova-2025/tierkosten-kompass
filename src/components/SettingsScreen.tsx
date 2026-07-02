import type { DemoCase } from '../types'
import { useCopy } from '../lib/LanguageContext'
import { FEATURES } from '../config/features'

interface Props {
  demos?: DemoCase[]
  onLoadDemo: (idx: number) => void
  onClearAll: () => void
}

export function SettingsScreen({ demos, onLoadDemo, onClearAll }: Props) {
  const copy = useCopy()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 16px' }}>
      <section>
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Über die App
        </h3>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            {copy.settings.footer}
          </p>
        </div>
      </section>

      {FEATURES.showDemoCases && demos && demos.length > 0 && (
        <section>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            {copy.settings.demosLabel}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {demos.map((d, idx) => (
              <button
                key={d.label}
                onClick={() => onLoadDemo(idx)}
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
                {d.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          {copy.settings.dataLabel}
        </h3>
        <button
          onClick={onClearAll}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '14px',
            color: '#e11d48',
          }}
        >
          {copy.settings.clearAll}
        </button>
      </section>
    </div>
  )
}
