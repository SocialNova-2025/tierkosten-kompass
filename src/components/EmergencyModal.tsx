import { T } from '../styles/tokens'
import { emergencyNotice } from '../data/copy'

interface EmergencyModalProps {
  petName: string
  onContinue: () => void
}

export function EmergencyModal({ petName: _petName, onContinue }: EmergencyModalProps) {
  return (
    <div
      style={{
        background: 'rgba(10,20,20,.72)',
        borderRadius: 14,
        padding: '20px 16px',
        marginBottom: 14,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        Das kann dringend sein
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.9)', lineHeight: 1.65, marginBottom: 14 }}>
        {emergencyNotice}
      </div>
      <div
        style={{
          background: 'rgba(255,255,255,.12)',
          borderRadius: 9,
          padding: '11px 13px',
          fontSize: 13,
          color: '#fff',
          lineHeight: 1.5,
          marginBottom: 12,
        }}
      >
        <strong style={{ display: 'block', marginBottom: 3 }}>Notdienst finden:</strong>
        Suche „Tierärztlicher Notdienst [deine Stadt]"
      </div>
      <button
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 11,
          fontSize: 13,
          fontWeight: 600,
          border: '1.5px solid rgba(255,255,255,.5)',
          color: '#fff',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
        onClick={onContinue}
      >
        Verstanden →
      </button>
    </div>
  )
}
