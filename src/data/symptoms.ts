import type { Symptom } from '../types'

export const SYMPTOMS: Symptom[] = [
  { id: 'erbrechen',    label: 'Erbrechen',             icon: '🤢' },
  { id: 'durchfall',    label: 'Durchfall',              icon: '💧' },
  { id: 'humpeln',      label: 'Humpeln / Lahmheit',     icon: '🦴' },
  { id: 'frisst_nicht', label: 'Frisst nicht',           icon: '🍽️' },
  { id: 'trinkt_nicht', label: 'Trinkt nicht / viel',    icon: '💦' },
  { id: 'atemnot',      label: 'Atemprobleme',           icon: '🫁' },
  { id: 'blut',         label: 'Blut im Kot / Urin',     icon: '🩸' },
  { id: 'gift',         label: 'Vergiftungsverdacht',    icon: '⚠️' },
  { id: 'unfall',       label: 'Unfall / Sturz',         icon: '🏥' },
  { id: 'krampf',       label: 'Krampfanfall',           icon: '⚡' },
  // Species-specific: only shown for cats
  { id: 'urin_katze',   label: 'Kann nicht urinieren',   icon: '🚫', species: 'katze' },
  { id: 'schmerz',      label: 'Starke Schmerzen',       icon: '😣' },
  { id: 'schwaeche',    label: 'Schwäche / Apathie',     icon: '😔' },
  { id: 'sonstiges',    label: 'Sonstiges',              icon: '❓' },
]

/** Filter symptoms for the given species */
export function getSymptomsForSpecies(
  species: 'hund' | 'katze',
): Symptom[] {
  return SYMPTOMS.filter(s => !s.species || s.species === species)
}

export function getSymptomById(id: string): Symptom | undefined {
  return SYMPTOMS.find(s => s.id === id)
}
