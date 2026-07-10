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
  // At this point Q_URIN is narrowed to 'normal' | undefined — no further urin checks needed
  return false
}

/**
 * Calculates a weighted urgency score (0–100) from check answers.
 */
export function calcScore(answers: CheckAnswers, symptomId: string): number {
  let score = 0

  // Breathing
  if (answers.Q_ATEM === 'stark') score += 30
  else if (answers.Q_ATEM === 'leicht') score += 15

  // Blood
  if (answers.Q_BLUT === 'viel') score += 25
  else if (answers.Q_BLUT === 'wenig') score += 10

  // Accident / fall
  if (answers.Q_UNFALL === 'ja') score += 15

  // Poison / foreign object
  if (answers.Q_GIFT === 'ja') score += 25
  else if (answers.Q_GIFT === 'unklar') score += 10

  // Duration
  if (answers.Q_DAUER === 'lt12') score += 10
  else if (answers.Q_DAUER === 'h12_24') score += 15
  else if (answers.Q_DAUER === 't1_3') score += 8
  else if (answers.Q_DAUER === 'laenger') score += 5

  // Severity
  if (answers.Q_STAERKE === 'stark') score += 20
  else if (answers.Q_STAERKE === 'mittel') score += 10

  // Frequency
  if (answers.Q_HAEUFIG === 'anhaltend') score += 10
  else if (answers.Q_HAEUFIG === 'mehrmals') score += 5

  // Appetite
  if (answers.Q_FRISST === 'gar_nicht') score += 10
  else if (answers.Q_FRISST === 'weniger') score += 5

  // Drinking
  if (answers.Q_TRINKT === 'gar_nicht') score += 10
  else if (answers.Q_TRINKT === 'weniger') score += 5

  // Behaviour
  if (answers.Q_VERHALTEN === 'deutlich') score += 15
  else if (answers.Q_VERHALTEN === 'etwas') score += 7

  // Pain
  if (answers.Q_SCHMERZ === 'ja') score += 15
  else if (answers.Q_SCHMERZ === 'vielleicht') score += 7

  // Limping – limb not used
  if (answers.Q_BELASTET === 'gar_nicht') score += 15
  else if (answers.Q_BELASTET === 'teilweise') score += 7

  return Math.min(score, 100)
}

/**
 * Main entry point: returns urgency level + score + red-flag flag.
 */
export function calcUrgency(
  answers: CheckAnswers,
  symptomId: string,
  _pet?: Pet | null,
): UrgencyResult {
  const redFlag = isRedFlag(answers, symptomId)
  const score   = calcScore(answers, symptomId)

  let level: UrgencyResult['level']
  if (redFlag || score >= 55) level = 'rot'
  else if (score >= 25)      level = 'gelb'
  else                        level = 'gruen'

  return { level, score, redFlag }
}
