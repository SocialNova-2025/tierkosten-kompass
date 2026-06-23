import { useState } from 'react'
import type { Pet, GapAnswers } from '../types'
import { T, BTN } from '../styles/tokens'
import { insuranceHint } from '../data/copy'

interface InsuranceGapCheckProps {
  pet: Pet | null
  onDone: (answers: GapAnswers) => void
  onSkip: () => void
}

type YesNo = 'ja' | 'nein'
type YesNoMaybe = 'ja' | 'nein' | 'weiss_nicht'

export function InsuranceGapCheck({ pet, onDone, onSkip }: InsuranceGapCheckProps) {
  const [g, setG] = useState<GapAnswers>({
    versicherung: pet?.hasInsurance ? 'ja' : 'nein',
  })
  const set = <K extends keyof GapAnswers>(k: K, v: GapAnswers[K]) =>
    setG(prev => ({ ...prev, [k]: v }))

  const segBtns = <T extends string>(opts: { v: T; label: string }[], cur: T | undefined, onSelect: (v: T) => void) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {opts.map(o => (
        <button
          key={o.v}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 11, textAlign: 'left',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            border: `1.5px solid ${cur === o.v ? T.primary : T.border}`,
            background: '#fff', color: cur === o.v ? T.primary : T.text,
          }}
          onClick={() => onSelect(o.v)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )

  const insOpts: { v: YesNo; label: string }[] = [{ v: 'ja', label: 'Ja' }, { v: 'nein', label: 'Nein' }]
  const triOpts: { v: YesNoMaybe; label: string }[] = [{ v: 'ja', label: 'Ja' }, { v: 'nein', label: 'Nein' }, { v: 'weiss_nicht', label: 'Weiß nicht' }]
  const voropts: { v: YesNo; label: string }[] = [{ v: 'nein', label: 'Nein' }, { v: 'ja', label: 'Ja' }]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Intro card */}
      <div className="card card-teal">
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.primary, marginBottom: 6 }}>
          Schutz-Check
        </div>
        <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.5 }}>{insuranceHint}</p>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>
        Passt dein Schutz zu solchen Kosten?
      </h2>

      {/* Q1: Versicherung */}
      <div>
        <div className="flbl">Versicherung vorhanden?</div>
        {segBtns(insOpts, g.versicherung, v => set('versicherung', v))}
      </div>

      {/* Conditional follow-up questions */}
      {g.versicherung === 'ja' && (
        <>
          <div>
            <div className="flbl">OP-Schutz vorhanden?</div>
            {segBtns(triOpts, g.op_schutz, v => set('op_schutz', v))}
          </div>
          <div>
            <div className="flbl">Diagnostik enthalten? (Labor, Röntgen, Ultraschall)</div>
            {segBtns(triOpts, g.diagnostik, v => set('diagnostik', v))}
          </div>
          <div>
            <div className="flbl">Notdienst-/GOT-Erstattung enthalten?</div>
            {segBtns(triOpts, g.notdienst, v => set('notdienst', v))}
          </div>
          <div>
            <div className="flbl">Vorerkrankungen bei {pet?.name ?? 'deinem Tier'} bekannt?</div>
            {segBtns(voropts, g.vorerkrankungen, v => set('vorerkrankungen', v))}
          </div>
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button ref={el => { if (el) el.style.cssText = BTN.primary }} onClick={() => onDone(g)}>
          Auswertung anzeigen →
        </button>
        <button ref={el => { if (el) el.style.cssText = BTN.ghost }} onClick={onSkip}>
          Überspringen
        </button>
      </div>
    </div>
  )
}
