import { useState } from 'react'
import type { Pet, LeadFields, PersistedLead } from '../types'
import { T, BTN } from '../styles/tokens'
import { ConsentCheckbox } from './ConsentCheckbox'
import { consentShareText, consentContactText } from '../data/copy'
import { isLeadValid, isEmailValid, isPhoneValid } from '../lib/leadValidation'
import { lsGet, lsSet, STORAGE_KEYS } from '../lib/storage'

interface LeadFormProps {
  pet: Pet
  onSubmit: () => void
  onCancel: () => void
}

const INITIAL_FIELDS: LeadFields = {
  firstName: '', lastName: '', phone: '', email: '',
}

export function LeadForm({ pet, onSubmit, onCancel }: LeadFormProps) {
  const [f, setF]   = useState<LeadFields>(INITIAL_FIELDS)
  const [c1, setC1] = useState(false)  // never pre-selected
  const [c2, setC2] = useState(false)  // never pre-selected

  const set = (k: keyof LeadFields, v: string) => setF(p => ({ ...p, [k]: v }))

  const emailOk = f.email ? isEmailValid(f.email) : true
  const phoneOk = f.phone ? isPhoneValid(f.phone) : true
  const valid   = isLeadValid(f, c1, c2)

  const handleSubmit = () => {
    if (!valid) return
    // Persist lead locally (no backend yet)
    const lead: PersistedLead = {
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      fields: { ...f },
      petSnapshot: { ...pet },
      consent1: c1,
      consent2: c2,
    }
    const existing = lsGet<PersistedLead[]>(STORAGE_KEYS.LEADS) ?? []
    lsSet(STORAGE_KEYS.LEADS, [...existing, lead])
    onSubmit()
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '0 14px', height: 46, borderRadius: 11,
    fontSize: 14, border: `1.5px solid ${T.border}`, background: '#fff',
    color: T.text, fontFamily: 'inherit', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>
          Beratung per WhatsApp erhalten
        </h2>
        <p style={{ fontSize: 13, color: T.muted }}>
          Deine Angaben helfen dabei, dich einem passenden Beratungspartner zuzuordnen.
          Dieser kontaktiert dich per WhatsApp und klärt mit dir, welcher Schutz zu
          deinem Tier passen könnte.
        </p>
      </div>

      {/* Trust list */}
      <div className="card card-teal">
        <div className="flbl">So läuft es ab</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {[
            ['Orientierung zuerst', 'Du entscheidest selbst – keine Sofortentscheidung nötig.'],
            ['Beratung auf Wunsch', 'Der Beratungspartner erklärt dir deine Möglichkeiten – ohne Druck.'],
            ['Kontakt nur mit deiner Einwilligung', 'Deine Daten werden erst nach Bestätigung weitergegeben.'],
          ].map(([h, b]) => (
            <div key={h} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.primary, marginTop: 7, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 1 }}>{h}</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{b}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-filled pet data */}
      <div className="card card-teal">
        <div className="flbl" style={{ marginBottom: 6 }}>Tierdaten (vorausgefüllt)</div>
        <div style={{ fontSize: 13, color: T.text }}>
          {pet.name} · {pet.species === 'hund' ? 'Hund' : 'Katze'} · {pet.ageYears} J. · {pet.weightKg} kg · Versicherung: {pet.hasInsurance ? 'Ja' : 'Nein'}
        </div>
      </div>

      {/* Name row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div className="flbl">Vorname <span style={{ color: T.red }}>*</span></div>
          <input style={inp} placeholder="Jana" value={f.firstName} onChange={e => set('firstName', e.target.value)} />
        </div>
        <div>
          <div className="flbl">Nachname <span style={{ color: T.red }}>*</span></div>
          <input style={inp} placeholder="Müller" value={f.lastName} onChange={e => set('lastName', e.target.value)} />
        </div>
      </div>

      {/* Phone */}
      <div>
        <div className="flbl">WhatsApp / Telefon <span style={{ color: T.red }}>*</span></div>
        <input style={inp} type="tel" placeholder="+49 170 1234567" value={f.phone} onChange={e => set('phone', e.target.value)} />
        {f.phone && !phoneOk && <div style={{ fontSize: 12, color: T.red, marginTop: 3 }}>Bitte gültige Telefonnummer eingeben</div>}
      </div>

      {/* Email */}
      <div>
        <div className="flbl">E-Mail <span style={{ color: T.red }}>*</span></div>
        <input style={inp} type="email" placeholder="jana@beispiel.de" value={f.email} onChange={e => set('email', e.target.value)} />
        {f.email && !emailOk && <div style={{ fontSize: 12, color: T.red, marginTop: 3 }}>Bitte gültige E-Mail-Adresse eingeben</div>}
      </div>

      {/* Consents – never pre-selected */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="flbl">Einwilligungen (beide erforderlich)</div>
        <ConsentCheckbox text={consentShareText}   checked={c1} onChange={setC1} />
        <ConsentCheckbox text={consentContactText} checked={c2} onChange={setC2} />
        {(!c1 || !c2) && (
          <p style={{ fontSize: 12, color: T.muted }}>
            Beide Einwilligungen sind erforderlich, um dich mit einem Beratungspartner zu verbinden.
          </p>
        )}
      </div>

      {/* Trust badge */}
      <div style={{ fontSize: 12, background: T.pLight, borderRadius: 9, padding: '9px 13px', color: T.primary, fontWeight: 600, textAlign: 'center' }}>
        Orientierung zuerst · Beratung nur auf Wunsch
      </div>

      {/* Submit – primary when valid, disabled when not */}
      <button
        ref={el => { if (el) el.style.cssText = valid ? BTN.primary : BTN.primaryDisabled }}
        disabled={!valid}
        onClick={valid ? handleSubmit : undefined}
      >
        Beratung per WhatsApp erhalten →
      </button>

      <button style={{ cssText: BTN.ghost } as React.CSSProperties}
        ref={el => { if (el) el.style.cssText = BTN.ghost }}
        onClick={onCancel}
      >
        Abbrechen
      </button>

      <p style={{ fontSize: 11, color: T.muted, textAlign: 'center' }}>
        Deine Angaben werden nur zur Zuordnung und Kontaktaufnahme für die Schutzklärung genutzt.
      </p>
    </div>
  )
}
