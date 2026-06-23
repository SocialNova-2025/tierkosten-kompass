import { useState } from 'react'
import type { Pet, CheckSession, LeadFields, PersistedLead } from '../types'
import { T, BTN } from '../styles/tokens'
import { ConsentCheckbox } from './ConsentCheckbox'
import { consentShareText, consentContactText } from '../data/copy'
import { isLeadValid, isEmailValid, isPhoneValid } from '../lib/leadValidation'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../lib/whatsapp'
import { lsGet, lsSet, STORAGE_KEYS } from '../lib/storage'

interface LeadFormProps {
  pet: Pet | null
  session: CheckSession | null
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
  protectionStatus: '', supportGoal: '', preExisting: '', preExistingNote: '',
}

function isAgeValid(v: string): boolean {
  const n = Number(v)
  return v.trim() !== '' && !isNaN(n) && n >= 0 && n <= 25
}

const PROTECTION_OPTIONS = [
  { v: 'ja' as const,           label: 'Ja, vorhanden' },
  { v: 'nein' as const,         label: 'Noch nicht vorhanden' },
  { v: 'nicht_sicher' as const, label: 'Nicht sicher' },
]

const SUPPORT_GOAL_OPTIONS = [
  { v: 'verstehen_ob_passend' as const,    label: 'Ich möchte verstehen, ob mein Tier passend abgesichert ist' },
  { v: 'kein_schutz_orientieren' as const, label: 'Ich habe noch keinen Schutz und möchte mich orientieren' },
  { v: 'hat_schutz_einordnen' as const,    label: 'Ich habe bereits Schutz und möchte ihn einordnen' },
  { v: 'unsicher' as const,                label: 'Ich bin mir unsicher' },
]

const PRE_EXISTING_OPTIONS = [
  { v: 'nein' as const,         label: 'Nein' },
  { v: 'ja' as const,           label: 'Ja' },
  { v: 'nicht_sicher' as const, label: 'Nicht sicher' },
]

export function LeadForm({ pet, session, onSubmit, onCancel }: LeadFormProps) {
  const [f, setF]   = useState<LeadFields>(INITIAL_FIELDS)
  const [c1, setC1] = useState(false)
  const [c2, setC2] = useState(false)
  const set = (k: keyof LeadFields, v: string) => setF(p => ({ ...p, [k]: v }))

  const [petInfo, setPetInfo] = useState<PetInfo>({
    name:     pet?.name    ?? '',
    species:  pet?.species ?? '',
    breed:    pet?.breed   ?? '',
    ageYears: pet ? String(pet.ageYears) : '',
  })
  const setPetField = <K extends keyof PetInfo>(k: K, v: PetInfo[K]) =>
    setPetInfo(p => ({ ...p, [k]: v }))

  const [fullEdit, setFullEdit] = useState(!pet)

  const emailOk = f.email ? isEmailValid(f.email) : true
  const phoneOk = f.phone ? isPhoneValid(f.phone) : true

  const petInfoComplete =
    petInfo.name.trim().length > 0 &&
    (petInfo.species === 'hund' || petInfo.species === 'katze') &&
    petInfo.breed.trim().length > 0 &&
    isAgeValid(petInfo.ageYears)

  const valid = isLeadValid(f, c1, c2) && petInfoComplete

  const inp: React.CSSProperties = {
    width: '100%', padding: '0 14px', height: 46, borderRadius: 11,
    fontSize: 14, border: `1.5px solid ${T.border}`, background: '#fff',
    color: T.text, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  const segBtn = (active: boolean): React.CSSProperties => ({
    width: '100%', padding: '12px 14px', borderRadius: 11, textAlign: 'left',
    fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    border: `1.5px solid ${active ? T.primary : T.border}`,
    background: '#fff', color: active ? T.primary : T.text,
  })

  const ageLabel = petInfo.ageYears === '0'
    ? 'unter 1 Jahr'
    : petInfo.ageYears ? `${petInfo.ageYears} Jahre` : '–'

  const petBlock = (pet && !fullEdit) ? (
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
      {!pet.breed && (
        <div>
          <div className="flbl">Rasse <span style={{ color: T.red }}>*</span></div>
          <input style={inp} placeholder="z.B. Labrador, Mischling, Unbekannt" value={petInfo.breed} onChange={e => setPetField('breed', e.target.value)} />
          <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Auch „Mischling" oder „Unbekannt" ist vollkommen in Ordnung.</div>
        </div>
      )}
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
        {!pet ? 'Damit wir dich passend zuordnen können, brauchen wir ein paar Angaben zu deinem Vierbeiner.' : 'Bitte überprüfe oder ergänze die Angaben zu deinem Vierbeiner.'}
      </div>
      <div>
        <div className="flbl">Name des Vierbeiners <span style={{ color: T.red }}>*</span></div>
        <input style={inp} placeholder="z.B. Bruno" value={petInfo.name} onChange={e => setPetField('name', e.target.value)} />
      </div>
      <div>
        <div className="flbl">Tierart <span style={{ color: T.red }}>*</span></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['hund', 'katze'] as const).map(s => (
            <button key={s} style={{ flex: 1, padding: '12px 0', borderRadius: 11, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${petInfo.species === s ? T.primary : T.border}`, background: '#fff', color: petInfo.species === s ? T.primary : T.text }} onClick={() => setPetField('species', s)}>
              {s === 'hund' ? 'Hund' : 'Katze'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flbl">Rasse <span style={{ color: T.red }}>*</span></div>
        <input style={inp} placeholder="z.B. Labrador, Mischling, Unbekannt" value={petInfo.breed} onChange={e => setPetField('breed', e.target.value)} />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Auch „Mischling" oder „Unbekannt" ist vollkommen in Ordnung.</div>
      </div>
      <div>
        <div className="flbl">Alter (Jahre) <span style={{ color: T.red }}>*</span></div>
        <input style={inp} type="number" min="0" max="25" placeholder="z.B. 3" value={petInfo.ageYears} onChange={e => setPetField('ageYears', e.target.value)} />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>0 eingeben für unter 1 Jahr · max. 25 Jahre</div>
        {petInfo.ageYears && !isAgeValid(petInfo.ageYears) && (
          <div style={{ fontSize: 12, color: T.red, marginTop: 3 }}>Bitte ein gültiges Alter eingeben (0–25 Jahre)</div>
        )}
      </div>
      {pet && fullEdit && (
        <button style={{ fontSize: 13, fontWeight: 600, borderRadius: 9, padding: '9px 14px', border: 'none', cursor: petInfoComplete ? 'pointer' : 'default', fontFamily: 'inherit', background: T.pLight, color: petInfoComplete ? T.primary : T.muted }} onClick={() => { if (petInfoComplete) setFullEdit(false) }} disabled={!petInfoComplete}>
          Angaben übernehmen ✓
        </button>
      )}
    </div>
  )

  const handleWhatsApp = () => {
    if (!valid) return
    const msg = buildWhatsAppMessage({
      firstName: f.firstName, lastName: f.lastName,
      petName: petInfo.name, petSpecies: petInfo.species,
      breed: petInfo.breed, ageYears: petInfo.ageYears,
      weightKg: pet?.weightKg,
      protectionStatus: f.protectionStatus, supportGoal: f.supportGoal,
      preExisting: f.preExisting, preExistingNote: f.preExistingNote,
      session,
    })
    const url = buildWhatsAppUrl(msg)
    const lead: PersistedLead = {
      id: Date.now().toString(), submittedAt: new Date().toISOString(),
      status: 'whatsapp_opened', fields: { ...f },
      petSnapshot: pet ? { ...pet } : null,
      petName: petInfo.name.trim(), petSpecies: petInfo.species as 'hund' | 'katze',
      breed: petInfo.breed.trim(), petAgeYears: Number(petInfo.ageYears),
      sessionSnapshot: session, whatsAppMessage: msg,
      consent1: c1, consent2: c2,
    }
    const existing = lsGet<PersistedLead[]>(STORAGE_KEYS.LEADS) ?? []
    lsSet(STORAGE_KEYS.LEADS, [...existing, lead])
    window.open(url, '_blank', 'noopener,noreferrer')
    onSubmit()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>Beratung per WhatsApp erhalten</h2>
        <p style={{ fontSize: 13, color: T.muted }}>Fülle kurz die Angaben aus. Danach öffnet sich WhatsApp mit einer vorbereiteten Nachricht. Du sendest sie selbst ab und ein Beratungspartner meldet sich anschließend per WhatsApp bei dir.</p>
      </div>
      <div style={{ background: T.pLight, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: T.primary, lineHeight: 1.6 }}>
        Du füllst das Formular aus, öffnest WhatsApp und sendest die vorbereitete Nachricht selbst ab. Danach meldet sich ein Beratungspartner per WhatsApp bei dir.
      </div>
      <div>
        <div className="flbl" style={{ marginBottom: 8 }}>Angaben zu deinem Vierbeiner</div>
        {petBlock}
      </div>
      <div style={{ height: 1, background: T.border }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div><div className="flbl">Vorname <span style={{ color: T.red }}>*</span></div><input style={inp} placeholder="Jana" value={f.firstName} onChange={e => set('firstName', e.target.value)} /></div>
        <div><div className="flbl">Nachname <span style={{ color: T.red }}>*</span></div><input style={inp} placeholder="Müller" value={f.lastName} onChange={e => set('lastName', e.target.value)} /></div>
      </div>
      <div>
        <div className="flbl">WhatsApp / Telefon <span style={{ color: T.red }}>*</span></div>
        <input style={inp} type="tel" placeholder="+49 170 1234567" value={f.phone} onChange={e => set('phone', e.target.value)} />
        {f.phone && !phoneOk && <div style={{ fontSize: 12, color: T.red, marginTop: 3 }}>Bitte gültige Telefonnummer eingeben</div>}
      </div>
      <div>
        <div className="flbl">E-Mail <span style={{ color: T.red }}>*</span></div>
        <input style={inp} type="email" placeholder="jana@beispiel.de" value={f.email} onChange={e => set('email', e.target.value)} />
        {f.email && !emailOk && <div style={{ fontSize: 12, color: T.red, marginTop: 3 }}>Bitte gültige E-Mail-Adresse eingeben</div>}
      </div>
      <div style={{ height: 1, background: T.border }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>Damit der Beratungspartner dich gut einordnen kann, noch ein paar kurze Fragen zur aktuellen Situation.</div>
        <div>
          <div className="flbl">Aktueller Schutz <span style={{ color: T.red }}>*</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {PROTECTION_OPTIONS.map(o => (<button key={o.v} style={segBtn(f.protectionStatus === o.v)} onClick={() => set('protectionStatus', o.v)}>{o.label}</button>))}
          </div>
        </div>
        <div>
          <div className="flbl">Wobei möchtest du Unterstützung? <span style={{ color: T.red }}>*</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {SUPPORT_GOAL_OPTIONS.map(o => (<button key={o.v} style={segBtn(f.supportGoal === o.v)} onClick={() => set('supportGoal', o.v)}>{o.label}</button>))}
          </div>
        </div>
        <div>
          <div className="flbl">Bekannte Vorerkrankungen oder laufende Beschwerden? <span style={{ color: T.red }}>*</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {PRE_EXISTING_OPTIONS.map(o => (<button key={o.v} style={segBtn(f.preExisting === o.v)} onClick={() => set('preExisting', o.v)}>{o.label}</button>))}
          </div>
          {f.preExisting === 'ja' && (
            <div style={{ marginTop: 10 }}>
              <div className="flbl" style={{ color: T.muted }}>Kurze Angabe, falls du möchtest (optional)</div>
              <textarea style={{ width: '100%', padding: '10px 14px', borderRadius: 11, fontSize: 14, border: `1.5px solid ${T.border}`, background: '#fff', color: T.text, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 60 } as React.CSSProperties} placeholder="z.B. Nierenproblem, Hauterkrankung, Allergie…" value={f.preExistingNote} onChange={e => set('preExistingNote', e.target.value)} rows={2} />
            </div>
          )}
        </div>
      </div>
      <div style={{ height: 1, background: T.border }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="flbl">Einwilligungen (beide erforderlich)</div>
        <ConsentCheckbox text={consentShareText}   checked={c1} onChange={setC1} />
        <ConsentCheckbox text={consentContactText} checked={c2} onChange={setC2} />
        {(!c1 || !c2) && <p style={{ fontSize: 12, color: T.muted }}>Beide Einwilligungen sind erforderlich, um WhatsApp zu öffnen.</p>}
      </div>
      <div style={{ fontSize: 12, background: T.pLight, borderRadius: 9, padding: '9px 13px', color: T.primary, fontWeight: 600, textAlign: 'center' }}>
        Orientierung zuerst · Beratung nur auf Wunsch
      </div>
      <button ref={el => { if (el) el.style.cssText = valid ? BTN.primary : BTN.primaryDisabled }} disabled={!valid} onClick={valid ? handleWhatsApp : undefined}>
        Beratung per WhatsApp starten →
      </button>
      <button ref={el => { if (el) el.style.cssText = BTN.ghost }} onClick={onCancel}>Abbrechen</button>
      <p style={{ fontSize: 11, color: T.muted, textAlign: 'center' }}>Kein automatisches Absenden · Du entscheidest selbst</p>
    </div>
  )
}
