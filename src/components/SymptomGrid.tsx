import type { Pet } from '../types'
import { T } from '../styles/tokens'
import { getSymptomsForSpecies } from '../data/symptoms'

interface SymptomGridProps {
  pet: Pet
  onSelect: (symptomId: string) => void
}

export function SymptomGrid({ pet, onSelect }: SymptomGridProps) {
  const list = getSymptomsForSpecies(pet.species)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>
          Was beobachtest du bei {pet.name}?
        </h2>
        <p style={{ fontSize: 13, color: T.muted }}>
          Wähle, was am besten passt – Details kommen gleich.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {list.map(s => (
          <button
            key={s.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '13px 8px',
              borderRadius: 13,
              border: `1.5px solid ${T.border}`,
              background: '#fff',
              cursor: 'pointer',
              minHeight: 78,
              gap: 6,
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = T.primary
              ;(e.currentTarget as HTMLButtonElement).style.background = T.pLight
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = T.border
              ;(e.currentTarget as HTMLButtonElement).style.background = '#fff'
            }}
            onClick={() => onSelect(s.id)}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{s.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.text, textAlign: 'center', lineHeight: 1.3 }}>
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
