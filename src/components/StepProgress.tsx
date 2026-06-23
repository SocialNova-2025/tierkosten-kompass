import { T } from '../styles/tokens'

interface StepProgressProps {
  step: number
  names: string[]
}

export function StepProgress({ step, names }: StepProgressProps) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 4 }}>
        {names.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 2,
              borderRadius: 2,
              background: i < step ? T.primary : T.border,
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
        Schritt {step} von {names.length} – {names[step - 1]}
      </div>
    </div>
  )
}
