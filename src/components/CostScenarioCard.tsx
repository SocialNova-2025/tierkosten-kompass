import type { CostScenario } from '../types'
import { T } from '../styles/tokens'

interface CostScenarioCardProps {
  scenario: CostScenario
  tier: 0 | 1 | 2
}

const TIER_CONFIG = [
  { bw: '2px', c: '#374151', bg: '#F9FAFB', bb: '#E2E8EA', fs: 19 },
  { bw: '4px', c: T.primary,  bg: T.pLight,  bb: T.pMid,   fs: 21 },
  { bw: '6px', c: T.red,      bg: T.redLight, bb: T.redBorder, fs: 23 },
] as const

export function CostScenarioCard({ scenario, tier }: CostScenarioCardProps) {
  const cfg = TIER_CONFIG[tier]

  return (
    <div
      style={{
        borderLeft: `${cfg.bw} solid ${cfg.c}`,
        borderTop: `1px solid ${cfg.bb}`,
        borderRight: `1px solid ${cfg.bb}`,
        borderBottom: `1px solid ${cfg.bb}`,
        borderRadius: 13,
        background: cfg.bg,
        padding: '16px 18px',
        marginBottom: 10,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase', color: cfg.c, marginBottom: 5 }}>
        {scenario.label}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.45, color: T.muted, marginBottom: 12 }}>
        {scenario.info}
      </div>
      <div style={{ fontSize: cfg.fs, fontWeight: 700, letterSpacing: '-.03em', color: cfg.c }}>
        ca. {scenario.range}
      </div>
      <div style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4, color: T.muted }}>
        Demo-Orientierungswert · keine Preisgarantie
      </div>
    </div>
  )
}
