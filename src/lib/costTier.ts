/**
 * costTier.ts – Derives a cost tier from existing check answers.
 *
 * CONSTRAINTS (hard):
 * - Does NOT change urgency logic (calcScore / isRedFlag / calcUrgency untouched)
 * - Does NOT invent real GOT prices or guarantee any price
 * - Ranges are conservative Orientierungswerte, not Preisgarantien
 * - Emergency cases never show a false narrow range
 *
 * Supported symptoms with per-symptom rules:
 *   humpeln     → low | medium | high | emergency
 *   frisst_nicht → medium | high | emergency  (no "low" — any eating refusal matters)
 *   erbrechen   → low | medium | high | emergency
 *   urin_katze  → emergency (always)
 *   default     → derived from urgencyScore
 */
import type { CheckAnswers, Pet } from '../types'

// ── Types ──────────────────────────────────────────────────────────────────

export type CostTier = 'low' | 'medium' | 'high' | 'emergency'

export interface CostTierResult {
  tier: CostTier
  /** Wahrscheinlicher Bereich, z. B. "ca. 130–280 €". null when tier = emergency. */
  range: string | null
  /** Short reasoning why this range was chosen. */
  reasoning: string
  /** Escalation note – always shown regardless of tier. */
  escalation: string
  /** Cost driver chips. */
  drivers: string[]
}

// ── Per-symptom tier lookup table ──────────────────────────────────────────

type TierDisplay = {
  range: string | null
  reasoning: string
  escalation: string
  drivers: string[]
}

const TIER_DATA: Record<string, Partial<Record<CostTier, TierDisplay>>> = {
  humpeln: {
    low: {
      range: 'ca. 50–130 €',
      reasoning:
        'Deine Angaben deuten auf eine leichte Lahmheit ohne Unfall hin – Untersuchung und einfache Schmerztherapie sind wahrscheinlich.',
      escalation:
        'Wird Röntgen, Sedierung oder eine Nachkontrolle nötig, liegt es deutlich höher.',
      drivers: ['Schmerztherapie', 'Röntgen (wenn nötig)', 'Nachkontrolle'],
    },
    medium: {
      range: 'ca. 130–300 €',
      reasoning:
        'Deine Angaben sprechen eher für eine orthopädische Untersuchung mit möglicher Bildgebung und Schmerztherapie.',
      escalation:
        'Bei Sedierung, OP-Verdacht, Spezialisierung oder Nachkontrollen kann es deutlich darüber liegen.',
      drivers: ['Röntgen / Bildgebung', 'Schmerztherapie', 'Sedierung (ggf.)', 'Nachkontrolle'],
    },
    high: {
      range: 'ca. 280–700 €',
      reasoning:
        'Deine Angaben deuten auf eine schwerwiegendere Lahmheit hin – Röntgen, ggf. Sedierung und weiterführende Diagnostik sind wahrscheinlich.',
      escalation:
        'Bei OP-Verdacht, stationärer Behandlung oder Notdienst kann es deutlich darüber liegen.',
      drivers: ['Röntgen / CT', 'Sedierung / Narkose', 'Weiterführende Diagnostik', 'OP-Vorbereitung', 'Nachkontrolle'],
    },
    emergency: {
      range: null,
      reasoning:
        'Bei schwerem Verletzungsbild oder Notfall lassen sich die Kosten nicht eng eingrenzen.',
      escalation:
        'Notfallambulanzen, Narkose, Chirurgie und stationäre Behandlung können die Kosten stark erhöhen – häufig deutlich vierstellig.',
      drivers: ['Notfallzuschlag', 'Röntgen / CT', 'Narkose / OP', 'Stationär'],
    },
  },

  frisst_nicht: {
    medium: {
      range: 'ca. 90–230 €',
      reasoning:
        'Deine Angaben sprechen eher für Untersuchung, ggf. Blutbild und Medikamente.',
      escalation:
        'Wenn Ultraschall, Infusion oder eine stationäre Beobachtung nötig werden, liegt es deutlich höher.',
      drivers: ['Blutbild / Labor', 'Medikamente', 'Ultraschall (ggf.)'],
    },
    high: {
      range: 'ca. 220–650 €',
      reasoning:
        'Deine Angaben deuten auf einen ernsteren Zustand hin – Diagnostik, Ultraschall und ggf. Infusion sind wahrscheinlich.',
      escalation:
        'Stationäre Behandlung, Narkose oder weiterführende Diagnostik können deutlich darüber liegen.',
      drivers: ['Blutbild / Labor', 'Ultraschall', 'Infusion', 'Medikamente', 'Stationär (ggf.)'],
    },
    emergency: {
      range: null,
      reasoning:
        'Bei sehr schlechtem Allgemeinzustand oder Red-Flag-Befunden sind die Kosten nicht eng vorhersehbar.',
      escalation:
        'Notfallversorgung, Intensivdiagnostik und stationäre Behandlung können deutlich vierstellig werden.',
      drivers: ['Notfallzuschlag', 'Blutbild / Labor', 'Ultraschall', 'Infusion', 'Stationär'],
    },
  },

  erbrechen: {
    low: {
      range: 'ca. 40–110 €',
      reasoning:
        'Einmaliges Erbrechen bei gutem Allgemeinzustand – Untersuchung und kurze Beobachtung sind wahrscheinlich ausreichend.',
      escalation:
        'Werden Kotprobe, Blutbild oder Medikamente nötig, liegt es höher.',
      drivers: ['Kotprobe (ggf.)', 'Medikamente (ggf.)'],
    },
    medium: {
      range: 'ca. 100–250 €',
      reasoning:
        'Mehrmaliges Erbrechen mit leichter Veränderung – Kotprobe, Blutbild und ggf. Medikamente sind wahrscheinlich.',
      escalation:
        'Bei Infusion, Ultraschall oder Notdienst liegt es deutlich höher.',
      drivers: ['Labor / Kotprobe', 'Medikamente', 'Infusion (ggf.)'],
    },
    high: {
      range: 'ca. 250–560 €',
      reasoning:
        'Anhaltendes Erbrechen oder deutliche Veränderung des Allgemeinzustands – Diagnostik, Infusion und ggf. stationäre Beobachtung sind wahrscheinlich.',
      escalation:
        'Bei Giftverdacht, Notdienst oder chirurgischem Eingriff kann es deutlich darüber liegen.',
      drivers: ['Blutbild / Labor', 'Ultraschall', 'Infusion', 'Notdienst (ggf.)', 'Stationär (ggf.)'],
    },
    emergency: {
      range: null,
      reasoning:
        'Bei Giftverdacht, starkem Blutverlust oder schwerem Zustand sind die Kosten nicht eng vorhersehbar.',
      escalation:
        'Notfallversorgung, Giftelimination und stationäre Behandlung können deutlich vierstellig werden.',
      drivers: ['Notfallzuschlag', 'Labor', 'Infusion', 'Magenspülung / Aktivkohle', 'Stationär'],
    },
  },

  urin_katze: {
    emergency: {
      range: null,
      reasoning:
        'Eine Katze, die nicht urinieren kann, ist immer ein Notfall – die Kosten lassen sich nicht eng eingrenzen.',
      escalation:
        'Notfallklinik, Katheter, Nierenwert-Labor und stationäre Behandlung sind die Regel – je nach Verlauf bis in den oberen vierstelligen Bereich.',
      drivers: ['Notfallzuschlag (nachts)', 'Katheter / Entlastung', 'Labor / Nierenwerte', 'Stationär'],
    },
  },
}

/** Default display data when no symptom-specific rule exists */
const DEFAULT_TIER_DATA: Record<CostTier, TierDisplay> = {
  low: {
    range: 'ca. 50–130 €',
    reasoning:
      'Deine Angaben deuten auf einen leichten Befund hin – Untersuchung und ggf. einfache Behandlung.',
    escalation:
      'Bei weiterführender Diagnostik, Medikamenten oder Nachkontrollen liegt es höher.',
    drivers: ['Diagnostik (ggf.)', 'Medikamente (ggf.)', 'Nachkontrolle'],
  },
  medium: {
    range: 'ca. 120–320 €',
    reasoning:
      'Deine Angaben sprechen eher für Untersuchung und mögliche Diagnostik.',
    escalation:
      'Weitere Diagnostik, Medikamente, Notdienst oder Nachkontrollen können deutlich darüber liegen.',
    drivers: ['Diagnostik', 'Medikamente', 'Nachkontrolle', 'Notdienst (ggf.)'],
  },
  high: {
    range: 'ca. 300–700 €',
    reasoning:
      'Deine Angaben deuten auf einen ernsteren Befund hin – weiterführende Diagnostik und ggf. stationäre Behandlung sind wahrscheinlich.',
    escalation:
      'Narkose, Chirurgie, Notdienst oder stationäre Behandlung können deutlich darüber liegen.',
    drivers: ['Diagnostik', 'Medikamente', 'Notdienst (ggf.)', 'Stationär (ggf.)'],
  },
  emergency: {
    range: null,
    reasoning:
      'Bei Notfall oder schwerem Befund lassen sich die Kosten nicht eng eingrenzen.',
    escalation:
      'Notfallbehandlung, Narkose, Chirurgie und stationäre Behandlung können deutlich vierstellig werden.',
    drivers: ['Notfallzuschlag', 'Diagnostik', 'Narkose / OP', 'Stationär'],
  },
}

// ── Tier classifiers per symptom ──────────────────────────────────────────

function tierForHumpeln(answers: CheckAnswers, redFlag: boolean): CostTier {
  if (redFlag) return 'emergency'
  if (
    answers.Q_BELASTET === 'gar_nicht' ||
    answers.Q_STAERKE === 'stark' ||
    answers.Q_UNFALL === 'ja'
  ) return 'high'
  if (
    answers.Q_STAERKE === 'mittel' ||
    answers.Q_DAUER === 'h12_24' ||
    answers.Q_DAUER === 't1_3' ||
    answers.Q_DAUER === 'laenger' ||
    answers.Q_BELASTET === 'teilweise'
  ) return 'medium'
  return 'low'
}

function tierForFrisstNicht(answers: CheckAnswers, redFlag: boolean, pet?: Pet | null): CostTier {
  if (redFlag) return 'emergency'
  // Very poor combined state → emergency-level cost
  if (answers.Q_TRINKT === 'gar_nicht' && answers.Q_VERHALTEN === 'deutlich') return 'emergency'
  // High: gar nicht fressen, trinkt wenig, deutlich verändert, altes Tier
  if (
    answers.Q_FRISST === 'gar_nicht' ||
    answers.Q_TRINKT === 'weniger' ||
    answers.Q_TRINKT === 'gar_nicht' ||
    answers.Q_VERHALTEN === 'deutlich' ||
    (pet != null && pet.ageYears > 10)
  ) return 'high'
  return 'medium'
}

function tierForErbrechen(answers: CheckAnswers, redFlag: boolean): CostTier {
  if (redFlag) return 'emergency'
  if (
    answers.Q_HAEUFIG === 'anhaltend' ||
    answers.Q_VERHALTEN === 'deutlich' ||
    answers.Q_BLUT === 'wenig' ||
    answers.Q_GIFT === 'unklar'
  ) return 'high'
  if (
    answers.Q_HAEUFIG === 'mehrmals' ||
    answers.Q_TRINKT === 'weniger' ||
    answers.Q_VERHALTEN === 'etwas'
  ) return 'medium'
  return 'low'
}

function tierForDefault(redFlag: boolean, urgencyScore: number): CostTier {
  if (redFlag) return 'emergency'
  if (urgencyScore >= 12) return 'high'
  if (urgencyScore >= 5) return 'medium'
  return 'low'
}

// ── Main export ───────────────────────────────────────────────────────────

/**
 * Derive cost tier and display data from existing check answers.
 *
 * @param symptomId     Primary symptom ID (from session.symptomId)
 * @param answers       User answers (from session.answers)
 * @param redFlag       Whether the session triggered a red-flag override
 * @param pet           Pet profile (used for age-based adjustments)
 * @param urgencyScore  Numeric urgency score (used for default/fallback tier)
 */
export function calcCostTier(
  symptomId: string,
  answers: CheckAnswers,
  redFlag: boolean,
  pet?: Pet | null,
  urgencyScore = 0,
): CostTierResult {
  let tier: CostTier

  switch (symptomId) {
    case 'humpeln':
      tier = tierForHumpeln(answers, redFlag)
      break
    case 'frisst_nicht':
      tier = tierForFrisstNicht(answers, redFlag, pet)
      break
    case 'erbrechen':
      tier = tierForErbrechen(answers, redFlag)
      break
    case 'urin_katze':
      // Always emergency — no urine = immediate danger for cats
      tier = 'emergency'
      break
    default:
      tier = tierForDefault(redFlag, urgencyScore)
  }

  const symptomData = TIER_DATA[symptomId]
  const display: TierDisplay =
    (symptomData?.[tier]) ?? DEFAULT_TIER_DATA[tier]

  return { tier, ...display }
}
