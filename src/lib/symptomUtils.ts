/**
 * symptomUtils.ts
 *
 * Helpers for multi-symptom selection logic.
 * primarySymptom = Red-Flag symptom first; otherwise first selected.
 */

/** Symptom IDs that always trigger a red-flag override in urgency.ts */
export const RED_FLAG_SYMPTOM_IDS: ReadonlySet<string> = new Set([
  'krampf',
  'atemnot',
  'gift',
  'urin_katze',
])

/**
 * Determine the primary symptom from a list of selected symptom IDs.
 *
 * Rules:
 *  1. If any selected symptom is in RED_FLAG_SYMPTOM_IDS → use it (first match wins).
 *  2. Otherwise → use the first symptom in the selection order.
 *
 * Precondition: selected.length >= 1
 */
export function getPrimarySymptom(selected: string[]): string {
  const redFlag = selected.find(id => RED_FLAG_SYMPTOM_IDS.has(id))
  return redFlag ?? selected[0]
}

/** Max allowed multi-select count */
export const MAX_SYMPTOMS = 3
