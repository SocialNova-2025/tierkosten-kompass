import type { GapAnswers, GapResult } from '../types'

/**
 * Calculate insurance gap result from user answers.
 *
 * Rules:
 * - No insurance → always ROT with one gap
 * - 'weiss_nicht' is treated the same as 'nein' (a gap)
 * - 0 gaps  → gruen
 * - 1–2 gaps → gelb
 * - ≥3 gaps → rot
 */
export function calcGap(answers: GapAnswers): GapResult {
  if (answers.versicherung === 'nein') {
    return {
      result: 'rot',
      gaps: ['Keine Tierkrankenversicherung vorhanden'],
    }
  }

  const gaps: string[] = []

  if (answers.op_schutz !== 'ja') {
    gaps.push('OP-Schutz unklar oder nicht vorhanden')
  }
  if (answers.diagnostik !== 'ja') {
    gaps.push('Diagnostik evtl. nicht abgedeckt')
  }
  if (answers.notdienst !== 'ja') {
    gaps.push('Notdienst-/GOT-Erstattung unklar')
  }
  if (answers.vorerkrankungen === 'ja') {
    gaps.push('Vorerkrankungen bekannt – mögliche Ausschlüsse')
  }

  const result =
    gaps.length === 0
      ? 'gruen'
      : gaps.length >= 3
        ? 'rot'
        : 'gelb'

  return { result, gaps }
}
