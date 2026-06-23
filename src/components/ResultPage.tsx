import { useState } from 'react'
import type { CheckSession, Pet } from '../types'
import { T, BTN } from '../styles/tokens'
import { UrgencyCard } from './UrgencyCard'
import { CostScenarioCard } from './CostScenarioCard'
import { CostDrivers } from './CostDrivers'
import { VetReportAccordion } from './VetReportAccordion'
import { getSymptomById } from '../data/symptoms'
import { disclaimer, costHint } from '../data/copy'

interface ResultPageProps {
  session: CheckSession
  pet: Pet
  onSchutz: () => void
  onNewCheck: () => void
  onSave: () => void
  alreadySaved: boolean
}

const BAND_LABEL: Record<string, string> = {
  niedrig: 'niedrig', mittel: 'mittel', hoch: 'hoch', sehr_hoch: 'sehr hoch',
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 6px' }}>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  )
}

export function ResultPage({ session, pet, onSchutz, onNewCheck, onSave, alreadySaved }: ResultPageProps) {
  const sym    = getSymptomById(session.symptomId)
  const isRed  = session.urgency === 'rot'
  const isGrn  = session.urgency === 'gruen'
  const band   = BAND_LABEL[session.cost.band] ?? 'mittel'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 16 }}>

      {/* Emergency banner – always first for ROT */}
      {isRed && (
        <div style={{ background: T.red, color: '#fff', borderRadius: 13, padding: '14px 16px', textAlign: 'center', fontWeight: 700, fontSize: 14, lineHeight: 1.4 }}>
          Bitte jetzt sofort einen Notdienst oder eine Tierklinik kontaktieren
        </div>
      )}

      {/* Title */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 3 }}>
          Ergebnis für
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>
          {pet.name} · {sym?.label ?? session.symptomId}
        </h2>
      </div>

      {/* 1 – Urgency */}
      <SectionHeader label="1 · Dringlichkeit" />
      <UrgencyCard level={session.urgency} petName={pet.name} />
      <div style={{ background: '#F3F7F7', borderRadius: 10, padding: '10px 13px', fontSize: 12, lineHeight: 1.65, color: T.muted, fontStyle: 'italic' }}>
        {disclaimer(pet.name)}
      </div>

      {/* 2 – Measures */}
      <SectionHeader label="2 · Mögliche Maßnahmen" />
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {session.cost.measures.map(m => (
            <div key={m} style={{ display: 'flex', gap: 9, fontSize: 13, color: T.text }}>
              <span style={{ color: T.primary, fontWeight: 700 }}>→</span>
              <span>{m}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: T.border, margin: '9px 0' }} />
        <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.5 }}>
          Was wirklich nötig ist, entscheidet die Tierärztin / der Tierarzt nach Untersuchung.
        </p>
      </div>

      {/* 3 – Costs */}
      <SectionHeader label="3 · Kosten-Orientierung" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="flbl" style={{ marginBottom: 0 }}>Kosten-Orientierung</div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: isRed ? T.red : T.primary, color: '#fff' }}>
          Risiko: {band}
        </span>
      </div>
      <p style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>
        Drei Szenarien – je nachdem, was beim Tierarzt nötig wird:
      </p>
      <CostScenarioCard scenario={session.cost.basis}         tier={0} />
      <CostScenarioCard scenario={session.cost.wahrscheinlich} tier={1} />
      <CostScenarioCard scenario={session.cost.erhoeht}        tier={2} />

      <CostDrivers drivers={session.cost.drivers} />

      <div style={{ background: '#F3F7F7', borderRadius: 10, padding: '10px 13px', fontSize: 12, lineHeight: 1.65, color: T.muted, fontStyle: 'italic' }}>
        {costHint}
      </div>

      <div style={{ height: 1, background: T.border }} />

      {/* Report accordion */}
      <VetReportAccordion session={session} pet={pet} />

      <div style={{ height: 1, background: T.border }} />

      {/* CTAs – order and weight depend on urgency */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isRed ? (
          <>
            <div style={{ background: T.redLight, border: `1px solid ${T.redBorder}`, borderRadius: 13, padding: 14, textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.red, margin: '0 0 3px' }}>Notfall hat Vorrang</p>
              <p style={{ fontSize: 12, color: T.text, margin: 0, lineHeight: 1.5 }}>
                Bitte zuerst den Notdienst kontaktieren. Den Schutz-Check kannst du danach erledigen.
              </p>
            </div>
            <button ref={el => { if (el) el.style.cssText = BTN.ghost }} onClick={onSchutz}>
              Schutz später einordnen (nach dem Notfall)
            </button>
          </>
        ) : isGrn ? (
          <button
            style={{ width: '100%', padding: 12, borderRadius: 13, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.muted, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={onSchutz}
          >
            Für zukünftige Fälle: Schutzlücke einordnen →
          </button>
        ) : (
          <button ref={el => { if (el) el.style.cssText = BTN.outline }} onClick={onSchutz}>
            Schutzlücke verstehen & einordnen
          </button>
        )}

        {alreadySaved ? (
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: T.green, padding: '6px 0' }}>
            In Tierakte gespeichert
          </p>
        ) : (
          <button ref={el => { if (el) el.style.cssText = BTN.outline }} onClick={onSave}>
            In Tierakte speichern
          </button>
        )}

        <button ref={el => { if (el) el.style.cssText = BTN.ghost }} onClick={onNewCheck}>
          Neuen Check starten
        </button>
      </div>
    </div>
  )
}
