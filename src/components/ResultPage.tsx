import { useState } from 'react'
import type { CheckSession, Pet, LeadIntent } from '../types'
import { FEATURES } from '../config/features'
import { T, BTN } from '../styles/tokens'
import { UrgencyCard } from './UrgencyCard'
import { CostDrivers } from './CostDrivers'
import { VetReportAccordion } from './VetReportAccordion'
import { InsuranceFlow } from './InsuranceFlow'
import { getSymptomById } from '../data/symptoms'
import { disclaimer } from '../data/copy'
import { buildEmergencyVetMapsUrl, buildRegularVetMapsUrl } from '../lib/maps'
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
  const isGrn = session.urgency === 'gruen'
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
              window.open(buildEmergencyVetMapsUrl(city), '_blank', 'noopener,noreferrer')
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

      {/* 1 - Dringlichkeit: bei Rot übernimmt der Notfallblock oben diese Rolle */}
      {!isRed && <SectionHeader label="1 · Dringlichkeit" />}
      {!isRed && <UrgencyCard level={session.urgency} petName={pet.name} />}

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
              window.open(buildRegularVetMapsUrl(city), '_blank', 'noopener,noreferrer')
            }}
            style={{ width: '100%', padding: '13px 0', borderRadius: 11, background: T.amber, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-.01em' }}
          >
            Gut bewertete Tierärzte in der Nähe finden
          </button>
          <p style={{ fontSize: 12, color: T.muted, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            Öffnungszeiten und Bewertungen bitte in Maps prüfen.
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
            <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, marginBottom: 5 }}>
              Kann steigen durch:
            </div>
            <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.5 }}>
              {costTier.escalation}
            </p>
          </div>
          <CostDrivers drivers={costTier.drivers} />
        </div>
      )}
    </div>

    {/* 4 - Nächste Schritte */}
    <SectionHeader label="4 · Nächste Schritte" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {session.urgency === 'rot' && (
        <div style={{ borderRadius: 12, background: '#fff5f5', border: '1px solid #ffcccc', padding: 16, fontSize: 13, color: '#7f1d1e', lineHeight: 1.6 }}>
        <strong>Sofortmaßnahme:</strong> Rufe deinen Tierarzt an oder fahre direkt in die nächste Tierkosten oder Klinik.
      </div>
      )}
      {session.urgency === 'gelb' && (
        <div style={{ borderRadius: 12, background: '#fffbe6', border: '1px solid #fad377', padding: 16, fontSize: 13, color: '664500', lineHeight: 1.6 }}>
        <strong>Empfehlung:</strong> Termin in den nächsten 24�'48 Stunden beim Tierarzt buchen.
      </div>
      )}
      {session.urgency === 'gruen' && (
        <div style={{ borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 16, fontSize: 13, color: '#14532d', lineHeight: 1.6 }}>
        <strong>Tipp:</strong> Beobachte dein Tier in den nächsten 24 Stunden genau. Bei Veränderung des Zustands Tierarzt aufsuchen.
      </div>
      )}
    </div>

    {/* 5 - Schutzlage einordnen */}    <SectionHeader label="5 · Schutzlage einordnen" />
    <div style={{ borderRadius: 13, background: T.card, border: '1px solid ' + T.border, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.7 }}>
        Eine Tierkrankenversicherung kann bei unerwarteten Tierarztkosten eine wichtige rolle spielen. Ob wie viel sie übernimmt, hängt von deinem Vertrag ab, nur dein Versicherer kann dir darüber verbindliche Auskunft geben.
      </p>
      <p style={{ fontSize: 12, color: T.subtext, margin: 0, lineHeight: 1.7 }}>
        ✫ Dieser Hinweis darf nicht als Versicherungsberatung verstanden werden.
      </p>
    </div>

    <div style={{ height: 40 }} />
  </div>
);

export default ResultPage;
