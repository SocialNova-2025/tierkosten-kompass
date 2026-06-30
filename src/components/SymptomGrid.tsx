import { useState } from 'react'
import type { Pet } from '../types'
import { T, BTN } from '../styles/tokens'
import { getSymptomsForSpecies } from '../data/symptoms'
import { getPrimarySymptom, RED_FLAG_SYMPTOM_IDS, MAX_SYMPTOMS } from '../lib/symptomUtils'
import { useCopy } from '../lib/LanguageContext'

interface SymptomGridProps {
  pet: Pet
  onDone: (selectedSymptoms: string[], primarySymptom: string) => void
}

export function SymptomGrid({ pet, onDone }: SymptomGridProps) {
  const copy = useCopy()
  const c    = copy.symptomGrid

  const list = getSymptomsForSpecies(pet.species)
  const [selected, setSelected] = useState<string[]>([])
  const [infoOpen, setInfoOpen] = useState<string | null>(null)

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

  /** Safe pet name for title */
  const petDisplayName = pet.name || copy.urgencyCard.petFallback

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text, margin: 0 }}>
          {c.title(petDisplayName)}
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
            <div
              key={s.id}
              role="button"
              tabIndex={isBlocked ? -1 : 0}
              aria-pressed={isSelected}
              aria-disabled={isBlocked}
              onClick={() => !isBlocked && toggle(s.id)}
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ' ') && !isBlocked) toggle(s.id)
              }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '13px 8px', borderRadius: 13,
                border: `1.5px solid ${isSelected ? T.primary : T.border}`,
                background: isSelected ? T.pLight : isBlocked ? '#f5f5f5' : '#fff',
                cursor: isBlocked ? 'not-allowed' : 'pointer',
                minHeight: 78, gap: 6, fontFamily: 'inherit', position: 'relative',
                opacity: isBlocked ? 0.5 : 1, transition: 'all 0.15s',
                userSelect: 'none',
              }}
              onMouseEnter={e => {
                if (!isBlocked && !isSelected) {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = T.primary
                  ;(e.currentTarget as HTMLDivElement).style.background   = T.pLight
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = T.border
                  ;(e.currentTarget as HTMLDivElement).style.background   = isBlocked ? '#f5f5f5' : '#fff'
                }
              }}
            >
              {/* Per-card reddish info icon - only for red-flag tiles */}
              {isRedFlag && (
                <button
                  onClick={e => { e.stopPropagation(); setInfoOpen(s.id) }}
                  aria-label={`Info: ${s.label}`}
                  tabIndex={isBlocked ? -1 : 0}
                  style={{
                    position: 'absolute', top: 5, right: 5,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(220,38,38,0.06)',
                    border: '1.5px solid #DC2626',
                    color: '#B91C1C', fontSize: 10, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1, padding: 0, flexShrink: 0,
                  }}
                >
                  i
                </button>
              )}

              {showPrimBadge && (
                <span style={{
                  position: 'absolute', top: 5, left: 6,
                  fontSize: 9, fontWeight: 700, letterSpacing: '.04em',
                  color: T.primary, textTransform: 'uppercase',
                }}>
                  {c.primaryBadge}
                </span>
              )}

              <span
                style={{ display: 'inline-flex', width: 26, height: 26, color: isSelected ? T.primary : T.muted }}
                dangerouslySetInnerHTML={{ __html: s.icon }}
              />
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: isSelected ? T.primary : T.text,
                textAlign: 'center', lineHeight: 1.3,
              }}>
                {s.label}
              </span>

              {isSelected && (
                <span style={{ position: 'absolute', bottom: 5, right: 6, fontSize: 10, color: T.primary, fontWeight: 700 }}>v</span>
              )}
            </div>
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

      {/* Per-card Red-Flag Info Popup */}
      {infoOpen && (
        <>
          <div
            onClick={() => setInfoOpen(null)}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
              background: 'rgba(0,0,0,0.30)', zIndex: 50,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Warnsignal: Erklaerung"
            style={{
              position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
              width: 'min(320px, calc(100vw - 32px))',
              background: '#fff', borderRadius: 14,
              padding: '14px 16px 16px',
              boxShadow: '0 8px 28px rgba(0,0,0,0.18)', zIndex: 51,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setInfoOpen(null)}
                aria-label="Schliessen"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: T.muted, fontSize: 15, lineHeight: 1, padding: '2px 4px',
                  fontFamily: 'inherit',
                }}
              >
                x
              </button>
            </div>
            <p style={{ fontSize: 13, color: T.text, lineHeight: 1.65, margin: '0 0 2px' }}>
              {c.redFlagHint}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
