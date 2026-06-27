import { useState } from 'react'
import type { Pet, Species } from '../types'
import { FEATURES } from '../config/features'
import { T } from '../styles/tokens'
import { BTN } from '../styles/tokens'
import { useCopy } from '../lib/LanguageContext'

interface PetProfileFormProps {
  initial?: Pet | null
  onDone: (pet: Pet) => void
}

export function PetProfileForm({ initial, onDone }: PetProfileFormProps) {
  const copy = useCopy()
  const c    = copy.petProfile

  const [species, setSpecies] = useState<Species>(initial?.species ?? 'hund')
  const [name, setName]       = useState(initial?.name ?? '')
  const [age, setAge]         = useState(initial?.ageYears?.toString() ?? '')
  const [weight, setWeight]   = useState(initial?.weightKg?.toString() ?? '')
  const [ins, setIns]         = useState(initial?.hasInsurance ?? false)
  const [city, setCity]       = useState(initial?.city ?? '')

  const ageNum    = Number(age)
  const weightNum = Number(weight)
  const valid     = name.trim().length > 0 && ageNum > 0 && ageNum <= 30 && weightNum > 0 && weightNum <= 120

  const inp: React.CSSProperties = {
    width: '100%', padding: '0 14px', height: 46, borderRadius: 11,
    fontSize: 14, border: '1.5px solid ' + T.border, background: '#fff',
    color: T.text, fontFamily: 'inherit', outline: 'none',
  }

  const segBtn = (active: boolean): React.CSSProperties => ({
    padding: 12, borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', border: '1.5px solid ' + (active ? T.primary : T.border),
    background: '#fff', color: active ? T.primary : T.muted, width: '100%',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>{c.title}</h2>
        <p style={{ fontSize: 12, color: T.muted }}>{c.subtitle}</p>
      </div>

      {/* Species */}
      <div>
        <div className="flbl">{c.speciesLabel}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button style={segBtn(species === 'hund')}  onClick={() => setSpecies('hund')}>{c.dog}</button>
          <button style={segBtn(species === 'katze')} onClick={() => setSpecies('katze')}>{c.cat}</button>
        </div>
      </div>

      {/* Name */}
      <div>
        <div className="flbl">{c.nameLabel} <span style={{ color: T.red }}>{copy.common.required}</span></div>
        <input
          style={inp}
          placeholder={c.namePlaceholder}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{c.nameHint}</div>
      </div>

      {/* Age + Weight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div className="flbl">{c.ageLabel} <span style={{ color: T.red }}>{copy.common.required}</span></div>
          <input style={inp} type="number" placeholder={c.agePlaceholder} value={age} onChange={e => setAge(e.target.value)} />
        </div>
        <div>
          <div className="flbl">{c.weightLabel} <span style={{ color: T.red }}>{copy.common.required}</span></div>
          <input style={inp} type="number" placeholder={c.weightPlaceholder} value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
      </div>

      {/* Versicherungsfrage – nur sichtbar wenn insuranceFunnel aktiv.
          hasInsurance bleibt im Pet-Modell erhalten (Default: false) */}
      {FEATURES.insuranceFunnel && (
        <div>
          <div className="flbl">{c.insuranceLabel} <span style={{ color: T.red }}>{copy.common.required}</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button style={segBtn(ins === true)}  onClick={() => setIns(true)}>{c.yes}</button>
            <button style={segBtn(ins === false)} onClick={() => setIns(false)}>{c.no}</button>
          </div>
        </div>
      )}

      {/* Stadt/PLZ – optional */}
      <div>
        <div className="flbl">
          {c.cityLabel}{' '}
          <span style={{ fontSize: 11, fontWeight: 400, color: T.muted }}>{c.cityOptional}</span>
        </div>
        <input
          style={inp}
          placeholder="z. B. München oder 80331"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{c.cityHint}</div>
      </div>

      {/* Submit */}
      <button
        ref={el => { if (el) el.style.cssText = valid ? BTN.primary : BTN.primaryDisabled }}
        disabled={!valid}
        onClick={() => {
          if (!valid) return
          onDone({
            id: initial?.id ?? Date.now().toString(),
            species,
            name: name.trim(),
            ageYears: ageNum,
            weightKg: weightNum,
            hasInsurance: ins,
            ...(city.trim() ? { city: city.trim() } : {}),
          })
        }}
      >
        {c.cta}
      </button>
    </div>
  )
}
