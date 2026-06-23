import { useState } from 'react'
import type { CheckSession, Pet } from '../types'
import { T, BTN } from '../styles/tokens'
import { UrgencyCard } from './UrgencyCard'
import { CostScenarioCard } from './CostScenarioCard'
import { CostDrivers } from './CostDrivers'
import { VetReportAccordion } from './VetReportAccordion'
import { getSymptomById } from '../data/symptoms'
import { disclaimer, costHint } from '../data/copy'
import { buildEmergencyVetMapsUrl, buildRegularVetMapsUrl } from '../lib/maps'

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

function SchutzCardGruen({ onSchutz }: { onSchutz: () => void }) {
  return (
    <div style={{ background: T.pLight, borderRadius: 13, border: '1px solid ' + T.border, padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Für zukünftige Fälle vorsorgen</div>
      <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.6 }}>
        Auch kleinere Fälle können sich summieren. Wenn du möchtest, kannst du einordnen lassen, ob dein Tier grundsätzlich passend abgesichert ist.
      </p>
      <button
        onClick={onSchutz}
        style={{ width: '100%', padding: '11px 0', borderRadius: 11, background: 'transparent', border: '1.5px solid ' + T.primary, color: T.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Schutz passend einordnen
      </button>
    </div>
  )
}

function SchutzCardGelb({ onSchutz }: { onSchutz: () => void }) {
  return (
    <div style={{ background: T.pLight, borderRadius: 13, border: '1.5px solid ' + T.primary, padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>Kostenrisiko erkannt</div>
      <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6 }}>
        Dein Ergebnis zeigt, dass Diagnostik oder Behandlungskosten entstehen können. Eine kurze Schutzklärung kann helfen, besser einzuordnen, ob dein Tier passend abgesichert ist.
      </p>
      <button ref={el => { if (el) el.style.cssText = BTN.primary }} onClick={onSchutz}>
        Schutzklärung per WhatsApp starten
      </button>
      <p style={{ fontSize: 11, color: T.muted, margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
        Keine Sofortentscheidung nötig — Beratung nur auf Wunsch.
      </p>
    </div>
  )
}

function SchutzCardRot({ onSchutz }: { onSchutz: () => void }) {
  return (
    <div style={{ background: '#fff', borderRadius: 13, border: '1px solid ' + T.border, padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Nach dem Notfall: Schutzlage einordnen</div>
      <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.6 }}>
        Wenn die akute Versorgung geklärt ist, kann eine Schutzklärung sinnvoll sein — besonders, wenn hohe Kosten entstehen können.
      </p>
      <button
        onClick={onSchutz}
        style={{ width: '100%', padding: '11px 0', borderRadius: 11, background: 'transparent', border: '1.5px solid ' + T.primary, color: T.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Nach dem Notfall Schutz einordnen
      </button>
      <p style={{ fontSize: 11, color: T.muted, margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
        Bitte kümmere dich zuerst um die tierärztliche Versorgung.
      </p>
    </div>
  )
}

export function ResultPage({ session, pet, onSchutz, onNewCheck, onSave, alreadySaved }: ResultPageProps) {
  const sym                               = getSymptomById(session.symptomId)
  const [localCity, setLocalCity]         = useState('')
  const [localCityYel, setLocalCityYel]   = useState('')
  const isRed = session.urgency === 'rot'
  const isGrn = session.urgency === 'gruen'
  const isYel = session.urgency === 'gelb'
  const band  = BAND_LABEL[session.cost.band] ?? 'mittel'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 16 }}>

      {/* Emergency banner - always first for ROT */}
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

      {/* 1 - Urgency */}
      <SectionHeader label="1 · Dringlichkeit" />
      <UrgencyCard level={session.urgency} petName={pet.name} />

      {/* Notdienst-CTA - nur bei ROT */}
      {isRed && (
        <div style={{ borderRadius: 12, background: T.redLight, border: '1px solid ' + T.redBorder, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!pet.city && (
            <input
              style={{ width: '100%', padding: '0 12px', height: 38, borderRadius: 9, fontSize: 13, border: '1.5px solid ' + T.border, background: '#fff', color: T.text, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Stadt oder PLZ (optional)"
              value={localCity}
              onChange={e => setLocalCity(e.target.value)}
            />
          )}
          <button
            onClick={() => {
              const city = pet.city || localCity.trim() || undefined
              window.open(buildEmergencyVetMapsUrl(city), '_blank', 'noopener,noreferrer')
            }}
            style={{ width: '100%', padding: '13px 0', borderRadius: 11, background: T.red, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Jetzt Notdienst in der Nähe finden
          </button>
          <p style={{ fontSize: 12, color: T.muted, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            Bitte rufe dort direkt an und prüfe, ob aktuell ein Notdienst verfügbar ist.
          </p>
        </div>
      )}

      {/* Tierarzt-CTA - nur bei GELB */}
      {isYel && (
        <div style={{ borderRadius: 12, background: T.amberLight, border: '1px solid ' + T.amberBorder, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!pet.city && (
            <input
              style={{ width: '100%', padding: '0 12px', height: 38, borderRadius: 9, fontSize: 13, border: '1.5px solid ' + T.border, background: '#fff', color: T.text, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Stadt oder PLZ (optional)"
              value={localCityYel}
              onChange={e => setLocalCityYel(e.target.value)}
            />
          )}
          <button
            onClick={() => {
              const city = pet.city || localCityYel.trim() || undefined
              window.open(buildRegularVetMapsUrl(city), '_blank', 'noopener,noreferrer')
            }}
            style={{ width: '100%', padding: '13px 0', borderRadius: 11, background: T.amber, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Gut bewertete Tierärzte in deiner Umgebung finden
          </button>
          <p style={{ fontSize: 12, color: T.muted, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            Bitte prüfe in Maps die aktuellen Bewertungen, Öffnungszeiten und rufe bei Bedarf vorher an.
          </p>
        </div>
      )}

      <div style={{ background: '#F3F7F7', borderRadius: 10, padding: '10px 13px', fontSize: 12, lineHeight: 1.65, color: T.muted, fontStyle: 'italic' }}>
        {disclaimer(pet.name)}
      </div>

      {/* 2 - Measures */}
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

      {/* 3 - Costs */}
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

      {/* Schutz-Card - szenarioabhaengig, immer sichtbar */}
      {isRed  && <SchutzCardRot  onSchutz={onSchutz} />}
      {!isRed && isGrn  && <SchutzCardGruen onSchutz={onSchutz} />}
      {!isRed && !isGrn && <SchutzCardGelb  onSchutz={onSchutz} />}

      {/* Secondary actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
