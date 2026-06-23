import { T } from '../styles/tokens'

interface ConsentCheckboxProps {
  text: string
  checked: boolean
  onChange: (v: boolean) => void
}

export function ConsentCheckbox({ text, checked, onChange }: ConsentCheckboxProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 11,
        padding: '13px 14px',
        borderRadius: 11,
        border: `1.5px solid ${checked ? T.primary : T.border}`,
        background: '#fff',
        cursor: 'pointer',
      }}
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={e => e.key === ' ' && onChange(!checked)}
    >
      <div
        style={{
          width: 19,
          height: 19,
          borderRadius: 5,
          flexShrink: 0,
          marginTop: 1,
          border: `1.5px solid ${checked ? T.primary : '#C0D8D8'}`,
          background: checked ? T.primary : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <svg width="11" height="9" fill="none" viewBox="0 0 11 9">
            <path d="M1 4.5l3 3L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 12, lineHeight: 1.55, color: T.text }}>
        {text}
      </span>
    </div>
  )
}
