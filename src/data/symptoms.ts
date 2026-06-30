import type { Symptom } from '../types'

/** Inline SVG icon strings - line style, 26x26 display, 24x24 viewBox, stroke-width 1.75 */
const S = (d: string) =>
  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${d}</svg>`

const ICONS: Record<string, string> = {
  erbrechen: S('<circle cx="12" cy="9" r="5"/><line x1="12" y1="14" x2="12" y2="20"/><polyline points="9 17 12 20 15 17"/>'),
  durchfall: S('<path d="M8 3C8 3 4 8 4 11a4 4 0 0 0 8 0C12 8 8 3 8 3z"/><path d="M16 8c0 0-4 5-4 8a4 4 0 0 0 8 0C20 13 16 8 16 8z"/>'),
  humpeln: S('<ellipse cx="12" cy="15" rx="5" ry="4"/><circle cx="8.5" cy="9.5" r="1.5"/><circle cx="12" cy="7.5" r="1.5"/><circle cx="15.5" cy="9.5" r="1.5"/>'),
  frisst_nicht: S('<path d="M4 11h16"/><path d="M6 11c0 4 2.7 7 6 7s6-3 6-7"/><line x1="6" y1="5" x2="18" y2="19"/>'),
  trinkt_nicht: S('<path d="M5 3h14l-2 16H7L5 3z"/><line x1="5" y1="19" x2="19" y2="19"/><line x1="9" y1="9" x2="9" y2="14"/><line x1="15" y1="9" x2="15" y2="14"/>'),
  atemnot: S('<path d="M12 5v6"/><path d="M9 8C7 8 4 10 4 13.5A4.5 4.5 0 0 0 8.5 18c1.5 0 2.5-.7 2.5-2V9"/><path d="M15 8c2 0 5 2 5 5.5A4.5 4.5 0 0 1 15.5 18c-1.5 0-2.5-.7-2.5-2V9"/>'),
  blut: S('<path d="M12 3C12 3 5 11 5 15a7 7 0 0 0 14 0C19 11 12 3 12 3z"/>'),
  gift: S('<path d="M10.3 4.5L2 19h20L13.7 4.5a2 2 0 0 0-3.4 0z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r=".75" fill="currentColor" stroke="none"/>'),
  unfall: S('<rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>'),
  krampf: S('<polyline points="13 2 4.5 13 11 13 11 22 19.5 11 13 11 13 2"/>'),
  urin_katze: S('<path d="M12 3C12 3 6 10 6 14a6 6 0 0 0 12 0C18 10 12 3 12 3z"/><line x1="9" y1="11" x2="15" y2="17"/><line x1="15" y1="11" x2="9" y2="17"/>'),
  schmerz: S('<circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="7.8" y2="7.8"/><line x1="16.2" y1="16.2" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="7.8" y2="16.2"/><line x1="16.2" y1="7.8" x2="19.1" y2="4.9"/>'),
  schwaeche: S('<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M18 11h4v2h-4"/><line x1="6" y1="12" x2="10" y2="12"/>'),
  sonstiges: S('<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".75" fill="currentColor" stroke="none"/>'),
}

export const SYMPTOMS: Symptom[] = [
  { id: 'erbrechen',    label: 'Erbrechen',             icon: ICONS.erbrechen },
  { id: 'durchfall',    label: 'Durchfall',              icon: ICONS.durchfall },
  { id: 'humpeln',      label: 'Humpeln / Lahmheit',     icon: ICONS.humpeln },
  { id: 'frisst_nicht', label: 'Frisst nicht',           icon: ICONS.frisst_nicht },
  { id: 'trinkt_nicht', label: 'Trinkt nicht / viel',    icon: ICONS.trinkt_nicht },
  { id: 'atemnot',      label: 'Atemprobleme',           icon: ICONS.atemnot },
  { id: 'blut',         label: 'Blut im Kot / Urin',     icon: ICONS.blut },
  { id: 'gift',         label: 'Vergiftungsverdacht',    icon: ICONS.gift },
  { id: 'unfall',       label: 'Unfall / Sturz',         icon: ICONS.unfall },
  { id: 'krampf',       label: 'Krampfanfall',           icon: ICONS.krampf },
  // Visible for all species (ID kept for red-flag logic compatibility)
  { id: 'urin_katze',   label: 'Kann nicht urinieren',   icon: ICONS.urin_katze },
  { id: 'schmerz',      label: 'Starke Schmerzen',       icon: ICONS.schmerz },
  { id: 'schwaeche',    label: 'Schwäche / Apathie',     icon: ICONS.schwaeche },
  { id: 'sonstiges',    label: 'Sonstiges',              icon: ICONS.sonstiges },
]

export function getSymptomsForSpecies(species: 'hund' | 'katze'): Symptom[] {
  return SYMPTOMS.filter(s => !s.species || s.species === species)
}

export function getSymptomById(id: string): Symptom | undefined {
  return SYMPTOMS.find(s => s.id === id)
}
