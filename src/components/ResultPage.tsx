import { useState } from 'react'
import type { CheckSession, Pet } from '../types'
import { T, BTN } from '../styles/tokens'
import { UrgencyCard } from './UrgencyCard'
import { CostDrivers } from './CostDrivers'
import { VetReportAccordion } from './VetReportAccordion'
import { getSymptomById } from '../data/symptoms'
import { disclaimer } from '../data/copy'
import { buildEmergencyVetMapsUrl, buildRegularVetMapsUrl } from '../lib/maps'
import { useCopy } from '../lib/LanguageContext'
import { calcCostTier } from '../lib/costTier'
import { FEATURES } from '../config/features'

interface ResultPageProps {
  session: CheckSession
  pet: Pet
  onSchutz: () => void
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

function SchutzCardGruen({ onSchutz }: { onSchutz: () => void }) {
  return (
    <div style={{ background: T.pLight, borderRadius: 13, border: '1px solid ' + T.border, padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Für zukünftige Fälle vorsorgen</div>
      <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.6 }}>
        Auch kleinere Fälle können sich summieren. Wenn du möchtest, kannst du einordnen lassen, ob dein Tier grundsätzlich passend abgesichert ist.
      </p>
      <button onClick={onSchutz} style={{ width: '100%', padding: '11px 0', borderRadius: 11, background: 'transparent', border: '1.5px solid ' + T.primary, color: T.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
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
      <button onClick={onSchutz} style={{ width: '100%', padding: '11px 0', borderRadius: 11, background: 'transparent', border: '1.5px solid ' + T.primary, color: T.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        Nach dem Notfall Schutz einordnen
      </button>
      <p style={{ fontSize: 11, color: T.muted, margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
        Bitte kümmere dich zuerst um die tierärztliche Versorgung.
      </p>
    </div>
  )
}

export function ResultPage({ session, pet, onSchutz, onNewCheck, onSave, alreadySaved }: ResultPageProps) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 16 }}>

      {/* ROT: Notfallblock mit integrierter Notdienst-Suche */}
      {isRed && (
        <div style={{ borderRadius: 13, background: T.redLight, border: '1.5px solid ' + T.redBorder, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: T.red }}>Das kann dringend sein</div>
          <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6 }}>
            Deine Angaben können auf einen Notfall hindeuten. Bitte kontaktiere jetzt sofort einen tierärztlichen Notdienst oder eine Tierklinik. Warte damit nicht.
          </p>
          {!pet.city && (
            <input
              style={{ width: '100%', padding: '0 12px', height: 38, borderRadius: 9, fontSize: 13, border: '1.5px solid ' + T.border, background: '#fff', color: T.text, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
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
            style={{ width: '100%', padding: '13px 0', borderRadius: 11, background: T.red, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Jetzt Notdienst in der Nähe finden
          </button>
          <p style={{ fontSize: 12, color: T.muted, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            Bitte rufe dort direkt an und prüfe, ob aktuell ein Notdienst verfügbar ist.
          </p>
        </div>
      )}

      {/* ROT: Was du jetzt vorbereiten kannst */}
      {isRed && (
        <div style={{ background: '#F3F7F7', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Was du jetzt vorbereiten kannst</div>
          <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.5 }}>
            Während du den Notdienst kontaktierst, halte diese Informationen bereit.
          </p>
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 13, color: T.text, lineHeight: 1.75 }}>
            <li>Symptome und Zeitpunkt des Beginns</li>
            <li>Alter, Gewicht und bekannte Vorerkrankungen</li>
            <li>Medikamente, falls vorhanden</li>
            <li>Fotos oder Videos vom Verhalten, falls hilfreich</li>
          </ul>
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
        {showMulti && (
          <p style={{ fontSize: 12, color: T.muted, margin: '4px 0 0', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600 }}>{copy.results.selectedSymptomsLabel}:</span>{' '}
            {allSelected.map(id => getSymptomById(id)?.label ?? id).join(' · ')}
          </p>
        )}
      </div>

      {/* 1 - Dringlichkeit */}
      <SectionHeader label="1 · Dringlichkeit" />
      <UrgencyCard level={session.urgency} petName={pet.name} />

      {/* GELB: Tierarzt-Maps-CTA */}
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

      {/* Maßnahmen (bleibt als Kontext, kompakt) */}
      <div style={{ background: '#F3F7F7', borderRadius: 10, padding: '10px 13px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
          Mögliche Maßnahmen
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {session.cost.measures.map(m => (
            <div key={m} style={{ display: 'flex', gap: 8, fontSize: 12, color: T.text }}>
              <span style={{ color: T.primary, fontWeight: 700, flexShrink: 0 }}>→</span>
              <span>{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dauerhafter Kostenhinweis */}
      <div style={{ background: '#F3F7F7', borderRadius: 10, padding: '10px 13px', fontSize: 12, lineHeight: 1.65, color: T.muted, fontStyle: 'italic' }}>
        {DISCLAIMER}
      </div>

      <div style={{ height: 1, background: T.border }} />
      <VetReportAccordion session={session} pet={pet} />
      <div style={{ height: 1, background: T.border }} />

      {/* Schutz-Card – nur wenn insuranceFunnel aktiv */}
      {FEATURES.insuranceFunnel && isRed  && <SchutzCardRot  onSchutz={onSchutz} />}
      {FEATURES.insuranceFunnel && !isRed && isGrn  && <SchutzCardGruen onSchutz={onSchutz} />}
      {FEATURES.insuranceFunnel && !isRed && !isGrn && <SchutzCardGelb  onSchutz={onSchutz} />}

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
