import { useState } from 'react'
import type { Pet } from '../types'
import { T } from '../styles/tokens'
import { BTN } from '../styles/tokens'
import { getSymptomsForSpecies } from '../data/symptoms'
import { getPrimarySymptom, RED_FLAG_SYMPTOM_IDS, MAX_SYMPTOMS } from '../lib/symptomUtils'
import { useCopy } from '../lib/LanguageContext'

interface SymptomGridProps {
  pet: Pet
  /** Called with the final selection when user confirms (≥1, ≤3 items). */
  onDone: (selectedSymptoms: string[], primarySymptom: string) => void
}

export function SymptomGrid({ pet, onDone }: SymptomGridProps) {
  const copy = useCopy()
  const c    = copy.symptomGrid

  const list = getSymptomsForSpecies(pet.species)
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= MAX_SYMPTOMS) return prev
      return [...prev, id]
    })
  }

  const primary    = selected.length > 0 ? getPrimarySymptom(selected) : null
  const canConfirm = selected.length >= 1
  const atMax      = selected.length >= MAX_SYMPTOMS

  const handleDone = () => {
    if (!canConfirm) return
    onDone(selected, getPrimarySymptom(selected))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>
          {c.title(pet.name)}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>{c.hint}</p>
          {selected.length > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: atMax ? T.primary : T.muted,
              background: atMax ? T.pLight : 'transparent',
              border: atMax ? '1px solid ' + T.primary : 'none',
              borderRadius: 20, padding: atMax ? '2px 8px' : '0',
              transition: 'all 0.15s',
            }}>
              {c.selectedCount(selected.length)}
            </span>
          )}
        </div>
        {atMax && (
          <p style={{ fontSize: 11, color: T.primary, margin: 0, fontWeight: 500 }}>
            {c.maxHint}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {list.map(s => {
          const isSelected    = selected.includes(s.id)
          const isPrimary     = primary === s.id
          const isRedFlag     = RED_FLAG_SYMPTOM_IDS.has(s.id)
          const isBlocked     = atMax && !isSelected
          const showPrimBadge = isPrimary && selected.length > 1

          return (
            <button
              key={s.id}
              disabled={isBlocked}
              onClick={() => toggle(s.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '13px 8px', borderRadius: 13,
                border: `1.5px solid ${isSelected ? T.primary : T.border}`,
                background: isSelected ? T.pLight : isBlocked ? '#f5f5f5' : '#fff',
                cursor: isBlocked ? 'not-allowed' : 'pointer',
                minHeight: 78, gap: 6, fontFamily: 'inherit', position: 'relative',
                opacity: isBlocked ? 0.5 : 1, transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!isBlocked && !isSelected) {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = T.primary
                  ;(e.currentTarget as HTMLButtonElement).style.background   = T.pLight
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = T.border
                  ;(e.currentTarget as HTMLButtonElement).style.background   = isBlocked ? '#f5f5f5' : '#fff'
                }
              }}
            >
              {isRedFlag && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: T.red }} />
              )}
              {showPrimBadge && (
                <span style={{ position: 'absolute', top: 5, left: 6, fontSize: 9, fontWeight: 700, letterSpacing: '.04em', color: T.primary, textTransform: 'uppercase' }}>
                  {c.primaryBadge}
                </span>
              )}
              <span style={{ fontSize: 22, lineHeight: 1 }}>{s.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? T.primary : T.text, textAlign: 'center', lineHeight: 1.3 }}>
                {s.label}
              </span>
              {isSelected && (
                <span style={{ position: 'absolute', bottom: 5, right: 6, fontSize: 10, color: T.primary, fontWeight: 700 }}>✓</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        ref={el => { if (el) el.style.cssText = canConfirm ? BTN.primary : BTN.primaryDisabled }}
        disabled={!canConfirm}
        onClick={handleDone}
      >
        {c.cta}
      </button>

      {selected.length === 0 && (
        <p style={{ fontSize: 11, color: T.muted, textAlign: 'center', margin: 0 }}>{c.minHint}</p>
      )}
    </div>
  )
}
