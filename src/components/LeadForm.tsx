import { useState } from 'react'
import type { Pet, LeadFields, PersistedLead } from '../types'
import { T, BTN } from '../styles/tokens'
import { ConsentCheckbox } from './ConsentCheckbox'
import { consentShareText, consentContactText } from '../data/copy'
import { isLeadValid, isEmailValid, isPhoneValid } from '../lib/leadValidation'
import { lsGet, lsSet, STORAGE_KEYS } from '../lib/storage'

interface LeadFormProps {
  pet: Pet | null
  onSubmit: () => void
  onCancel: () => void
}

interface PetInfo {
  name: string
  species: 'hund' | 'katze' | ''
  breed: string
  ageYears: string
}

const INITIAL_FIELDS: LeadFields = {
  firstName: '', lastName: '', phone: '', email: '',
}

function isAgeValid(v: string): boolean {
  const n = Number(v)
  return v.trim() !== '' && !isNaN(n) && n >= 0 && n <= 25
}

export function LeadForm({ pet, onSubmit, onCancel }: LeadFormProps) {
  const [f, setF]   = useState<LeadFields>(INITIAL_FIELDS)
  const [c1, setC1] = useState(false)
  const [c2, setC2] = useState(false)
  const set = (k: keyof LeadFields, v: string) => setF(p => ({ ...p, [k]: v }))

  // Pet info – pre-filled from existing profile where available
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: pet?.name ?? '',
    species: pet?.species ?? '',
    breed: pet?.breed ?? '',
    ageYears: pet ? String(pet.ageYears) : '',
  })
  const setPetField = <K extends keyof PetInfo>(k: K, v: PetInfo[K]) =>
    setPetInfo(p => ({ ...p, [k]: v }))

  // Full-edit mode: starts open when no pet profile exists
  const [fullEdit, setFullEdit] = useState(!pet)

  const emailOk = f.email ? isEmailValid(f.email) : true
  const phoneOk = f.phone ? isPhoneValid(f.phone) : true

  const petInfoComplete =
    petInfo.name.trim().length > 0 &&
    (petInfo.species === 'hund' || petInfo.species === 'katze') &&
    petInfo.breed.trim().length > 0 &&
    isAgeValid(petInfo.ageYears)

  const valid = isLeadValid(f, c1, c2) && petInfoComplete

  const handleSubmit = () => {
    if (!valid) return
    const lead: PersistedLead = {
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      fields: { ...f },
      petSnapshot: pet ? { ...pet } : null,
      petName: petInfo.name.trim(),
      petSpecies: petInfo.species as 'hund' | 'katze',
      breed: petInfo.breed.trim(),
      petAgeYears: Number(petInfo.ageYears),
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
    color: T.text, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  // ── Age display helper ───────────────────────────────────────────────
  const ageLabel = petInfo.ageYears === '0'
    ? 'unter 1 Jahr'
    : petInfo.ageYears ? `${petInfo.ageYears} Jahre` : '–'

  // ── Pet data block ───────────────────────────────────────────────────
  const petBlock = (pet && !fullEdit) ? (
    // COMPACT VIEW – pet profile exists, not in edit mode
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="card card-teal">
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase', color: T.primary, marginBottom: 6 }}>
          Für die Zuordnung nutzen wir
        </div>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8 }}>
          {petInfo.name} · {petInfo.species === 'hund' ? 'Hund' : 'Katze'} · {petInfo.breed || '–'} · {ageLabel}
          {pet.weightKg > 0 && <span style={{ color: T.muted }}> · {pet.weightKg} kg</span>}
        </div>
        <button
          style={{ fontSize: 12, color: T.primary, background: 'none', border: 'none', padding: '6px 0 0', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontWeight: 500 }}
          onClick={() => setFullEdit(true)}
        >
          Angaben ändern
        </button>
      </div>

      {/* Inline breed field if missing from profile */}
      {!pet.breed && (
        <div>
          <div className="flbl">Rasse <span style={{ color: T.red }}>*</span></div>
          <input
            style={inp}
            placeholder="z.B. Labrador, Mischling, Unbekannt"
            value={petInfo.breed}
            onChange={e => setPetField('breed', e.target.value)}
          />
          <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>
            Auch „Mischling" oder „Unbekannt" ist vollkommen in Ordnung.
          </div>
        </div>
      )}
    </div>
  ) : (
    // FULL EDIT / ENTRY FORM
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
        {!pet
          ? 'Damit wir dich passend zuordnen können, brauchen wir ein paar Angaben zu deinem Vierbeiner.'
          : 'Bitte überprüfe oder ergänze die Angaben zu deinem Vierbeiner.'}
      </div>

      {/* Name */}
      <div>
        <div className="flbl">Name des Vierbeiners <span style={{ color: T.red }}>*</span></div>
        <input
          style={inp} placeholder="z.B. Bruno"
          value={petInfo.name} onChange={e => setPetField('name', e.target.value)}
        />
      </div>

      {/* Species */}
      <div>
        <div className="flbl">Tierart <span style={{ color: T.red }}>*</span></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['hund', 'katze'] as const).map(s => (
            <button
              key={s}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 11, fontSize: 14,
                fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                border: `1.5px solid ${petInfo.species === s ? T.primary : T.border}`,
                background: '#fff', color: petInfo.species === s ? T.primary : T.text,
              }}
              onClick={() => setPetField('species', s)}
            >
              {s === 'hund' ? 'Hund' : 'Katze'}
            </button>
          ))}
        </div>
      </div>

      {/* Breed */}
      <div>
        <div className="flbl">Rasse <span style={{ color: T.red }}>*</span></div>
        <input
          style={inp} placeholder="z.B. Labrador, Mischling, Unbekannt"
          value={petInfo.breed} onChange={e => setPetField('breed', e.target.value)}
        />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>
          Auch „Mischling" oder „Unbekannt" ist vollkommen in Ordnung.
        </div>
      </div>

      {/* Age */}
      <div>
        <div className="flbl">Alter (Jahre) <span style={{ color: T.red }}>*</span></div>
        <input
          style={inp} type="number" min="0" max="25" placeholder="z.B. 3"
          value={petInfo.ageYears}
          onChange={e => setPetField('ageYears', e.target.value)}
        />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>
          0 eingeben für unter 1 Jahr · max. 25 Jahre
        </div>
        {petInfo.ageYears && !isAgeValid(petInfo.ageYears) && (
          <div style={{ fontSize: 12, color: T.red, marginTop: 3 }}>
            Bitte ein gültiges Alter eingeben (0–25 Jahre)
          </div>
        )}
      </div>

      {/* "Übernehmen" button when editing existing pet */}
      {pet && fullEdit && (
        <button
          style={{
            fontSize: 13, fontWeight: 600, borderRadius: 9, padding: '9px 14px',
            border: 'none', cursor: petInfoComplete ? 'pointer' : 'default',
            fontFamily: 'inherit', background: T.pLight,
            color: petInfoComplete ? T.primary : T.muted,
          }}
          onClick={() => { if (petInfoComplete) setFullEdit(false) }}
          disabled={!petInfoComplete}
        >
          Angaben übernehmen ✓
        </button>
      )}
    </div>
  )

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

      {/* Pet data block */}
      <div>
        <div className="flbl" style={{ marginBottom: 8 }}>Angaben zu deinem Vierbeiner</div>
        {petBlock}
      </div>

      <div style={{ height: 1, background: T.border }} />

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

      {/* Consents */}
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

      {/* Submit */}
      <button
        ref={el => { if (el) el.style.cssText = valid ? BTN.primary : BTN.primaryDisabled }}
        disabled={!valid}
        onClick={valid ? handleSubmit : undefined}
      >
        Beratung per WhatsApp erhalten →
      </button>

      <button ref={el => { if (el) el.style.cssText = BTN.ghost }} onClick={onCancel}>
        Abbrechen
      </button>

      <p style={{ fontSize: 11, color: T.muted, textAlign: 'center' }}>
        Deine Angaben werden nur zur Zuordnung und Kontaktaufnahme für die Schutzklärung genutzt.
      </p>
    </div>
  )
}
