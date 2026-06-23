import { T } from '../styles/tokens'

interface CostDriversProps {
  drivers: string[]
}

export function CostDrivers({ drivers }: CostDriversProps) {
  return (
    <div>
      <div className="flbl">Mögliche Kostentreiber</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {drivers.map(d => (
          <span
            key={d}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '5px 11px',
              borderRadius: 20,
              background: T.pLight,
              color: T.primary,
            }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}
