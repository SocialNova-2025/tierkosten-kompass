import { useState } from 'react'
import type { CheckSession, Pet, LeadIntent } from '../types'
import { FEATURES } from '../config/features'
import { T, BTN } from '../styles/tokens'
import { UrgencyCard } from './UrgencyCard'
import { CostDrivers } from './CostDrivers'
import { VetReportAccordion } from './VetReportAccordion'
import { getSymptomById } from '../data/symptoms'
import { disclaimer } from '../data/copy'
import { buildEmergencyVetMapsUrl, buildRegularVetMapsUrl } from '../lib/maps'
import { openExternal } from '../lib/openExternal'
import { useCopy } from '../lib/LanguageContext'
import { calcCostTier } from '../lib/costTier'

interface ResultPageProps {
  session: CheckSession
  pet: Pet
  /** Called when user selects "Ja + Formular" inside InsuranceFlow – App navigates to LeadForm */
  onFormFlow: (intent: LeadIntent) => void
  onNewCheck: () => void
  onSave: () => void
  alreadySaved: boolean
}

const DISCLAIMER =
  'Die Werte sind eine Orientierung, keine Preisgarantie. ' +
  'Die tatsächlichen Kosten hängen u. a. von Praxis, Diagnostik, Notdienst, Medikamenten und Verlauf ab.'

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

export function ResultPage({ session, pet, onFormFlow, onNewCheck, onSave, alreadySaved }: ResultPageProps) {
  const copy = useCopy()
  const sym                             = getSymptomById(session.symptomId)
  const [localCity, setLocalCity]       = useState('')
  const [localCityYel, setLocalCityYel] = useState('')
  const isRed = session.urgency === 'rot'
  const isYel = session.urgency === 'gelb'

  // Build label list for multi-symptom display
  const allSelected = session.selectedSymptoms ?? [session.symptomId]
  const showMulti   = allSelected.length > 1

  // Derive cost tier from existing answers — pure presentation, no score/urgency change
  const costTier = calcCostTier(
    session.symptomId,
    session.answers,
    session.redFlag,
    pet,
    session.score,
  )
  const isEmergencyCost = costTier.tier === 'emergency'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 16 }}>

      {/* ROT: Notfallblock – dominanter Einstieg, einzige rote Ergebniskarte */}
      {isRed && (
        <div style={{ borderRadius: 14, background: T.redLight, border: '1.5px solid ' + T.redBorder, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.red, flexShrink: 0 }} />
            <div style={{ fontWeight: 700, fontSize: 16, color: T.red, lineHeight: 1.3 }}>
              Das kann dringend sein
            </div>
          </div>
          <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.65 }}>
            Deine Angaben können auf einen Notfall hindeuten. Bitte kontaktiere jetzt sofort einen tierärztlichen Notdienst oder eine Tierklinik. Warte damit nicht.
          </p>
          {!pet.city && (
            <input
              style={{ width: '100%', padding: '0 13px', height: 40, borderRadius: 9, fontSize: 13, border: '1.5px solid ' + T.border, background: '#fff', color: T.text, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Stadt oder PLZ eingeben"
              value={localCity}
              onChange={e => setLocalCity(e.target.value)}
            />
          )}
          <button
            onClick={() => {
              const city = pet.city || localCity.trim() || undefined
              void openExternal(buildEmergencyVetMapsUrl(city))
            }}
            style={{ width: '100%', padding: '14px 0', borderRadius: 11, background: T.red, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-.01em' }}
          >
            Jetzt Notdienst in der Nähe finden
          </button>
          <p style={{ fontSize: 12, color: T.muted, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            Bitte ruf direkt an und prüfe, ob aktuell ein Notdienst verfügbar ist.
          </p>
        </div>
      )}

      {/* ROT: Vorbereitung – ruhiger, sekundär */}
      {isRed && (
        <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>Halte diese Infos bereit</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
            {[
              'Symptome und Zeitpunkt des Beginns',
              'Alter, Gewicht und bekannte Vorerkrankungen',
              'Medikamente, falls vorhanden',
              'Fotos oder Videos vom Verhalten, falls möglich',
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: 8, fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
                <span style={{ color: T.primary, fontWeight: 700, flexShrink: 0 }}>·</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <div style={{ paddingTop: isRed ? 4 : 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>
          Ergebnis für
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text, lineHeight: 1.2 }}>
          {pet.name} · {sym?.label ?? session.symptomId}
        </h2>
        {showMulti && (
          <p style={{ fontSize: 12, color: T.muted, margin: '5px 0 0', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600 }}>{copy.results.selectedSymptomsLabel}:</span>{' '}
            {allSelected.map(id => getSymptomById(id)?.label ?? id).join(' · ')}
          </p>
        )}
      </div>

      {/* 1 - Dringlichkeit */}
      <SectionHeader label="1 · Dringlichkeit" />
      {isRed ? (
        /* ROT: kompakter Status – dominante Einschätzung steht bereits oben */
        <div style={{ borderRadius: 12, background: '#fff1f2', border: '1px solid #fecdd3', padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '.08em', lineHeight: 1.3 }}>Rot · Sofort abklären lassen</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, lineHeight: 1.5 }}>Die Angaben wurden als kritisch eingestuft. Bitte priorisiere die Notdienstsuche oben.</div>
          </div>
        </div>
      ) : (
        <UrgencyCard level={session.urgency} petName={pet.name} />
      )}

      {/* GELB: Tierarzt-Maps-CTA */}
      {isYel && (
        <div style={{ borderRadius: 12, background: T.amberLight, border: '1px solid ' + T.amberBorder, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!pet.city && (
            <input
              style={{ width: '100%', padding: '0 13px', height: 40, borderRadius: 9, fontSize: 13, border: '1.5px solid ' + T.border, background: '#fff', color: T.text, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Stadt oder PLZ (optional)"
              value={localCityYel}
              onChange={e => setLocalCityYel(e.target.value)}
            />
          )}
          <button
            onClick={() => {
              const city = pet.city || localCityYel.trim() || undefined
              void openExternal(buildRegularVetMapsUrl(city))
            }}
            style={{ width: '100%', padding: '13px 0', borderRadius: 11, background: T.amber, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-.01em' }}
          >
            Gut bewertete Tierärzte in der Nähe finden
          </button>
          <p style={{ fontSize: 12, color: T.muted, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            Bitte prüfe in Maps die aktuellen Bewertungen, Öffnungszeiten und rufe bei Bedarf vorher an.
          </p>
        </div>
      )}

      {/* Disclaimer – immer sichtbar, ruhig */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, lineHeight: 1.65, color: T.muted }}>
        {disclaimer(pet.name)}
      </div>

      {/* 2 - Kosten-Orientierung (costTier-basiert) */}
      <SectionHeader label="2 · Kosten-Orientierung" />

      {isEmergencyCost ? (
        /* EMERGENCY: keine falsche enge Spanne */
        <div style={{ borderRadius: 13, background: T.redLight, border: '1.5px solid ' + T.redBorder, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase', color: T.red }}>
            Notfall / Klinik
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.red, lineHeight: 1.35 }}>
            Häufig deutlich höher — Kosten nicht eng vorhersehbar
          </div>
          <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6 }}>
            {costTier.reasoning}
          </p>
          <div style={{ borderTop: '1px solid ' + T.redBorder, paddingTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.red, marginBottom: 5 }}>
              Kann deutlich steigen durch:
            </div>
            <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.5 }}>
              {costTier.escalation}
            </p>
          </div>
          <CostDrivers drivers={costTier.drivers} />
        </div>
      ) : (
        /* NON-EMERGENCY: wahrscheinlicher Bereich laut Angaben */
        <div style={{ borderRadius: 13, background: T.pLight, border: '1px solid ' + T.pMid, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase', color: T.primary }}>
            Wahrscheinlicher Bereich laut deinen Angaben
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.03em', color: T.primary }}>
            {costTier.range}
          </div>
          <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6 }}>
            {costTier.reasoning}
          </p>
          <div style={{ borderTop: '1px solid ' + T.pMid, paddingTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Kann höher werden, wenn …
            </div>
            <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.55 }}>
              {costTier.escalation}
            </p>
          </div>
          <CostDrivers drivers={costTier.drivers} />
        </div>
      )}

      {/* Mögliche Maßnahmen */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px' }}>
        <div className="flbl">Mögliche Maßnahmen beim Tierarzt</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {session.cost.measures.map(m => (
            <div key={m} style={{ display: 'flex', gap: 10, fontSize: 13, color: T.text, lineHeight: 1.5 }}>
              <span style={{ color: T.primary, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
              <span>{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dauerhafter Kostenhinweis */}
      <div style={{ borderRadius: 10, padding: '10px 14px', fontSize: 12, lineHeight: 1.65, color: T.muted }}>
        {DISCLAIMER}
      </div>

      <VetReportAccordion session={session} pet={pet} />

      {/* 3 · Schutzlage einordnen – InsuranceFlow hinter Feature Flag (aktuell deaktiviert) */}
      {FEATURES.insuranceFunnel && (
        <SectionHeader label="3 · Schutzlage einordnen" />
      )}

      {/* Secondary actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
        {alreadySaved ? (
          <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: T.green, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <i className="ti ti-circle-check" aria-hidden="true" style={{ fontSize: 16 }} />
            In Tierakte gespeichert
          </div>
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
