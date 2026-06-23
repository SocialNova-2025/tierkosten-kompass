import type { CheckAnswers } from '../types'
import { T } from '../styles/tokens'
import { StepProgress } from './StepProgress'

export interface QuestionDef {
  key: keyof CheckAnswers
  label: string
  required?: boolean
  options: { v: string; label: string }[]
}

interface QuestionGroupProps {
  title: string
  subtitle: string
  questions: QuestionDef[]
  answers: CheckAnswers
  onChange: (key: keyof CheckAnswers, value: string) => void
  step: number
  stepNames: string[]
}

export function QuestionGroup({
  title,
  subtitle,
  questions,
  answers,
  onChange,
  step,
  stepNames,
}: QuestionGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <StepProgress step={step} names={stepNames} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text, lineHeight: 1.2 }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, color: T.muted }}>{subtitle}</p>
      </div>

      {questions.map(q => (
        <div key={q.key}>
          <div className="flbl">
            {q.label}{q.required && <span style={{ color: T.red }}> *</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {q.options.map(opt => {
              const active = answers[q.key] === opt.v
              return (
                <button
                  key={opt.v}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 11,
                    textAlign: 'left',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    border: `1.5px solid ${active ? T.primary : T.border}`,
                    background: '#fff',
                    color: active ? T.primary : T.text,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onClick={() => onChange(q.key, opt.v)}
                >
                  <span>{opt.label}</span>
                  {active && (
                    <span
                      style={{
                        width: 17,
                        height: 17,
                        borderRadius: '50%',
                        background: T.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="9" height="7" fill="none" viewBox="0 0 9 7">
                        <path d="M1 3.5l2 2L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
