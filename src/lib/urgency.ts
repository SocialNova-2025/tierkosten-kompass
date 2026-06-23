import type { CheckAnswers, Pet, UrgencyResult } from '../types'

/**
 * Red-flag override – returns true if any condition mandates immediate ROT.
 * Order matters: checked before score calculation.
 */
export function isRedFlag(answers: CheckAnswers, symptomId: string): boolean {
  if (answers.Q_ATEM === 'stark') return true
  if (answers.Q_BLUT === 'viel') return true
  if (answers.Q_GIFT === 'ja') return true
  if (answers.Q_URIN === 'troepfchen' || answers.Q_URIN === 'gar_nicht') return true
  if (symptomId === 'krampf') return true
  if (symptomId === 'atemnot') return true
  if (symptomId === 'gift') return true
  if (
    symptomId === 'urin_katze' &&
    (answers.Q_URIN === 'troepfchen' || answers.Q_URIN === 'gar_nicht')
  ) return true
  return false
}

/**
 * Calculate the numeric urgency score from answers.
 * Does NOT apply red-flag override – call isRedFlag first.
 *
 * Thresholds (spec-exact, never change):
 *   0–4  → gruen
 *   5–11 → gelb
 *   ≥12  → rot
 */
export function calcScore(answers: CheckAnswers, pet?: Pet | null): number {
  let s = 0

  // Safety questions
  if (answers.Q_ATEM === 'leicht') s += 3
  if (answers.Q_BLUT === 'wenig') s += 2
  if (answers.Q_UNFALL === 'ja') s += 1
  if (answers.Q_GIFT === 'unklar') s += 1

  // Duration
  if (answers.Q_DAUER === 'h12_24') s += 1
  if (answers.Q_DAUER === 't1_3') s += 2
  if (answers.Q_DAUER === 'laenger') s += 1

  // Severity
  if (answers.Q_STAERKE === 'mittel') s += 2
  if (answers.Q_STAERKE === 'stark') s += 3

  // Frequency
  if (answers.Q_HAEUFIG === 'mehrmals') s += 1
  if (answers.Q_HAEUFIG === 'anhaltend') s += 2

  // Limping-specific
  if (answers.Q_BELASTET === 'teilweise') s += 1
  if (answers.Q_BELASTET === 'gar_nicht') s += 3

  // General condition
  if (answers.Q_FRISST === 'weniger') s += 1
  if (answers.Q_FRISST === 'gar_nicht') s += 2
  if (answers.Q_TRINKT === 'weniger') s += 1
  if (answers.Q_TRINKT === 'gar_nicht') s += 2
  if (answers.Q_VERHALTEN === 'etwas') s += 1
  if (answers.Q_VERHALTEN === 'deutlich') s += 2
  if (answers.Q_SCHMERZ === 'vielleicht') s += 1
  if (answers.Q_SCHMERZ === 'ja') s += 2

  // Age modifier
  if (pet && (pet.ageYears < 1 || pet.ageYears > 10)) s += 1

  return s
}

/**
 * Main entry point: returns urgency level, numeric score, and redFlag flag.
 *
 * Spec-exact thresholds (never change):
 *   score 0–4  → 'gruen'
 *   score 5–11 → 'gelb'
 *   score ≥12  → 'rot'
 */
export function calcUrgency(
  answers: CheckAnswers,
  symptomId: string,
  pet?: Pet | null,
): UrgencyResult {
  if (isRedFlag(answers, symptomId)) {
    return { level: 'rot', score: 99, redFlag: true }
  }
  const score = calcScore(answers, pet)
  const level = score <= 4 ? 'gruen' : score <= 11 ? 'gelb' : 'rot'
  return { level, score, redFlag: false }
}
