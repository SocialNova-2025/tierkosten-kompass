import type { Pet, CheckSession } from '../types'
import { T, BTN } from '../styles/tokens'
import { getSymptomById } from '../data/symptoms'

const URG_LABEL = { gruen: 'Beobachten', gelb: 'Zeitnah Tierarzt', rot: 'Sofort handeln' }
const URG_COLOR = { gruen: T.green, gelb: T.amber, rot: T.red }

interface MiniPetRecordProps {
  pet: Pet | null
  sessions: CheckSession[]
  onNewCheck: () => void
  onEdit: () => void
  onSchutz: () => void
}

export function MiniPetRecord({ pet, sessions, onNewCheck, onEdit, onSchutz }: MiniPetRecordProps) {
  if (!pet) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: 14, background: T.pLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '36px auto 18px',
          }}
        >
          <i className="ti ti-file-plus" aria-hidden="true" style={{ fontSize: 24, color: T.primary }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text, textAlign: 'center' }}>
          Noch kein Tierprofil angelegt
        </h2>
        <p style={{ fontSize: 13, color: T.muted, textAlign: 'center', lineHeight: 1.6 }}>
          Starte deinen ersten Check und speichere die wichtigsten Angaben für den nächsten Tierarztbesuch.
        </p>
        <button ref={el => { if (el) el.style.cssText = BTN.primary }} onClick={onNewCheck}>
          Ersten Check starten
        </button>
      </div>
    )
  }

  const initials = pet.name.slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Pet card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: 12, background: T.pLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: T.primary,
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{pet.name}</div>
              <div style={{ fontSize: 12, color: T.muted }}>
                {pet.species === 'hund' ? 'Hund' : 'Katze'} · {pet.ageYears} J. · {pet.weightKg} kg
              </div>
            </div>
          </div>
          <button
            style={{ fontSize: 12, fontWeight: 600, color: T.primary, background: T.pLight, border: 'none', borderRadius: 7, padding: '5px 11px', cursor: 'pointer' }}
            onClick={onEdit}
          >
            Bearbeiten
          </button>
        </div>

        <div style={{ height: 1, background: T.border, marginBottom: 12 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {[
            ['Vorerkrankungen', 'Keine angegeben'],
            ['Medikamente', 'Keine angegeben'],
            ['Versicherung', pet.hasInsurance ? 'Vorhanden' : 'Nicht vorhanden'],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions */}
      <div>
        <div className="flbl">Letzte Checks</div>
        {sessions.length === 0 ? (
          <div className="card">
            <p style={{ fontSize: 13, color: T.muted, textAlign: 'center', padding: '10px 0', margin: 0 }}>
              Noch keine Checks – starte deinen ersten.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...sessions].reverse().map(s => {
              const sym = getSymptomById(s.symptomId)
              return (
                <div key={s.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{sym?.label ?? s.symptomId}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{new Date(s.createdAt).toLocaleDateString('de-DE')}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: URG_COLOR[s.urgency] }}>
                    {URG_LABEL[s.urgency]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Docs placeholder */}
      <div className="card" style={{ opacity: .45 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <i className="ti ti-folder" aria-hidden="true" style={{ fontSize: 20, color: T.muted }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Dokumente</div>
            <div style={{ fontSize: 12, color: T.muted }}>Bald verfügbar</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button ref={el => { if (el) el.style.cssText = BTN.primary }} onClick={onNewCheck}>
          Neuen Akut-Check starten
        </button>
        <button ref={el => { if (el) el.style.cssText = BTN.outline }} onClick={onSchutz}>
          Versicherungsschutz prüfen
        </button>
      </div>
    </div>
  )
}
