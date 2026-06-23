import { useState } from 'react'
import type { Pet, Species } from '../types'
import { T } from '../styles/tokens'
import { BTN } from '../styles/tokens'

interface PetProfileFormProps {
  initial?: Pet | null
  onDone: (pet: Pet) => void
}

export function PetProfileForm({ initial, onDone }: PetProfileFormProps) {
  const [species, setSpecies] = useState<Species>(initial?.species ?? 'hund')
  const [name, setName]       = useState(initial?.name ?? '')
  const [age, setAge]         = useState(initial?.ageYears?.toString() ?? '')
  const [weight, setWeight]   = useState(initial?.weightKg?.toString() ?? '')
  const [ins, setIns]         = useState(initial?.hasInsurance ?? false)

  const ageNum    = Number(age)
  const weightNum = Number(weight)
  const valid     = name.trim().length > 0 && ageNum > 0 && ageNum <= 30 && weightNum > 0 && weightNum <= 120

  const inp: React.CSSProperties = {
    width: '100%', padding: '0 14px', height: 46, borderRadius: 11,
    fontSize: 14, border: `1.5px solid ${T.border}`, background: '#fff',
    color: T.text, fontFamily: 'inherit', outline: 'none',
  }

  const segBtn = (active: boolean): React.CSSProperties => ({
    padding: 12, borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', border: `1.5px solid ${active ? T.primary : T.border}`,
    background: '#fff', color: active ? T.primary : T.muted, width: '100%',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>Dein Tier</h2>
        <p style={{ fontSize: 12, color: T.muted }}>Nur 5 Angaben · unter 30 Sekunden</p>
      </div>

      {/* Species */}
      <div>
        <div className="flbl">Tierart</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button style={segBtn(species === 'hund')} onClick={() => setSpecies('hund')}>Hund</button>
          <button style={segBtn(species === 'katze')} onClick={() => setSpecies('katze')}>Katze</button>
        </div>
      </div>

      {/* Name */}
      <div>
        <div className="flbl">Name <span style={{ color: T.red }}>*</span></div>
        <input
          style={inp}
          placeholder="Name des Tieres"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* Age + Weight in 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div className="flbl">Alter (Jahre) <span style={{ color: T.red }}>*</span></div>
          <input style={inp} type="number" placeholder="z. B. 5" value={age} onChange={e => setAge(e.target.value)} />
        </div>
        <div>
          <div className="flbl">Gewicht (kg) <span style={{ color: T.red }}>*</span></div>
          <input style={inp} type="number" placeholder="z. B. 22" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
      </div>

      {/* Insurance */}
      <div>
        <div className="flbl">Versicherung vorhanden? <span style={{ color: T.red }}>*</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button style={segBtn(ins === true)}  onClick={() => setIns(true)}>Ja</button>
          <button style={segBtn(ins === false)} onClick={() => setIns(false)}>Nein</button>
        </div>
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
          })
        }}
      >
        Weiter →
      </button>
    </div>
  )
}
