import { useState } from 'react'
import type { CheckSession, Pet } from '../types'
import { FEATURES } from '../config/features'
import { T } from '../styles/tokens'
import { getSymptomById } from '../data/symptoms'
import { useCopy } from '../lib/LanguageContext'

const DUR: Record<string, string> = {
  lt12: '< 12 Std.', h12_24: '12â24 Std.', t1_3: '1â3 Tage', laenger: '> 3 Tage',
}
const STM: Record<string, string> = { leicht: 'leicht', mittel: 'mittel', stark: 'stark' }
const FN: Record<string, string>  = { normal: 'normal', weniger: 'weniger als sonst', gar_nicht: 'gar nicht' }
const SC: Record<string, string>  = { nein: 'nein', vielleicht: 'vielleicht', ja: 'ja' }

interface VetReportAccordionProps {
  session: CheckSession
  pet: Pet
}

export function VetReportAccordion({ session, pet }: VetReportAccordionProps) {
  const [open, setOpen] = useState(false)
  const copy = useCopy()
  const sym  = getSymptomById(session.symptomId)
  const a    = session.answers

  /** Safe pet name fallback */
  const petName = pet.name || copy.urgencyCard.petFallback

  const rows: [string, string][] = [
    ['Tier', `${petName} Â· ${pet.species === 'hund' ? 'Hund' : 'Katze'} Â· ${pet.ageYears} J. Â· ${pet.weightKg} kg`],
    // Versicherungszeile nur sichtbar wenn insuranceFunnel aktiv
    ...(FEATURES.insuranceFunnel
      ? [['Versicherung', pet.hasInsurance ? 'vorhanden' : 'nicht vorhanden'] as [string, string]]
      : []),
    ['Symptom', sym?.label ?? '-'],
    ...(a.Q_DAUER  ? [['Seit',     DUR[a.Q_DAUER] ?? ''] as [string, string]] : []),
    ...(a.Q_STAERKE? [['StÃ¤rke',   STM[a.Q_STAERKE] ?? ''] as [string, string]] : []),
    ...(a.Q_FRISST ? [['Fressen',  FN[a.Q_FRISST] ?? ''] as [string, string]] : []),
    ...(a.Q_TRINKT ? [['Trinken',  FN[a.Q_TRINKT] ?? ''] as [string, string]] : []),
    ...(a.Q_SCHMERZ? [['Schmerzen',SC[a.Q_SCHMERZ] ?? ''] as [string, string]] : []),
  ]

  const questions = [
    'Welche Untersuchung empfehlen Sie zuerst?',
    'Welche Kosten kommen ungefÃ¤hr auf mich zu?',
    'Gibt es einen Kostenvoranschlag?',
    'Wann sollte ich mich melden, wenn es keine Besserung gibt?',
  ]

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 13, overflow: 'hidden' }}>
      <button
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: T.pLight,
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 700,
          color: T.primary,
          fontFamily: 'inherit',
        }}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span>Vorbereitungsbericht</span>
        <span>{open ? 'â²' : 'â¼'}</span>
      </button>

      {open && (
        <div style={{ padding: '14px 16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Data table */}
          <div>
            {rows.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: `1px solid ${T.border}`,
                  fontSize: 13,
                }}
              >
                <span style={{ color: T.muted }}>{k}</span>
                <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: T.border }} />

          {/* Questions */}
          <div>
            <div className="flbl">Fragen fÃ¼r den Tierarzt</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: T.text, lineHeight: 1.7 }}>
              {questions.map(q => <li key={q}>{q}</li>)}
            </ul>
          </div>

          {/* Disclaimer */}
          <div style={{ background: '#F3F7F7', borderRadius: 10, padding: '10px 13px', fontSize: 12, lineHeight: 1.6, color: T.muted, fontStyle: 'italic' }}>
            {copy.disclaimer(petName)}
          </div>
        </div>
      )}
    </div>
  )
}
