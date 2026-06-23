/**
 * Demo-Kostenkorridore – Orientierungswerte, keine echten GOT-Preise.
 *
 * Diese Werte dienen ausschließlich der Orientierung und stellen keine
 * Preisgarantie dar. Tatsächliche Kosten hängen von Befund, Praxis,
 * GOT-Satz, Notdienst, Diagnostik und Behandlungsumfang ab.
 */
import type { CostData } from '../types'

const COSTS: Record<string, CostData> = {
  humpeln: {
    band: 'mittel',
    measures: [
      'Allgemeine Untersuchung',
      'Orthopädische Untersuchung',
      'Ggf. Schmerztherapie durch die Praxis',
      'Ggf. Röntgen',
      'Ggf. leichte Sedierung',
      'Ggf. Nachkontrolle',
    ],
    basis: {
      label: 'Basisfall',
      info: 'Untersuchung + einfache Behandlung',
      range: '40–80 €',
    },
    wahrscheinlich: {
      label: 'Wahrscheinlicher Fall',
      info: 'Orthopädische Untersuchung, ggf. Röntgen, Schmerztherapie',
      range: '120–250 €',
    },
    erhoeht: {
      label: 'Erhöhter Fall',
      info: 'Sedierung, OP-Verdacht, Nachkontrolle',
      range: '300–800 €+',
    },
    drivers: ['Röntgen / Bildgebung', 'Sedierung', 'Nachkontrolle'],
  },

  frisst_nicht: {
    band: 'hoch',
    measures: [
      'Allgemeine Untersuchung',
      'Ggf. Blutuntersuchung',
      'Ggf. Ultraschall',
      'Ggf. Medikamente durch die Praxis',
      'Ggf. Infusion bei Austrocknung',
    ],
    basis: {
      label: 'Basisfall',
      info: 'Untersuchung + einfache Behandlung',
      range: '40–80 €',
    },
    wahrscheinlich: {
      label: 'Wahrscheinlicher Fall',
      info: 'Blutuntersuchung, Ultraschall, ggf. Medikamente',
      range: '150–350 €',
    },
    erhoeht: {
      label: 'Erhöhter Fall',
      info: 'Infusion, stationäre Behandlung, weitere Diagnostik',
      range: '400–1.000 €+',
    },
    drivers: ['Blutbild / Labor', 'Ultraschall', 'Infusion', 'Stationär'],
  },

  erbrechen: {
    band: 'niedrig',
    measures: [
      'Allgemeine Untersuchung',
      'Ggf. Kotprobe',
      'Ggf. Blutuntersuchung',
      'Ggf. Medikamente durch die Praxis',
      'Ggf. Infusion',
    ],
    basis: {
      label: 'Basisfall',
      info: 'Untersuchung + einfache Behandlung',
      range: '30–70 €',
    },
    wahrscheinlich: {
      label: 'Wahrscheinlicher Fall',
      info: 'Kotprobe, Blutbild, ggf. Medikamente',
      range: '90–200 €',
    },
    erhoeht: {
      label: 'Erhöhter Fall',
      info: 'Infusion, Ultraschall, Notdienst bei Eskalation',
      range: '250–600 €+',
    },
    drivers: ['Labor', 'Bildgebung', 'Notdienst (bei Eskalation)'],
  },

  urin_katze: {
    band: 'sehr_hoch',
    measures: [
      'Notfalluntersuchung',
      'Blasen-Check (Abtasten / Ultraschall)',
      'Ggf. Katheter / Entlastung',
      'Ggf. Labor (Nierenwerte)',
      'Ggf. stationäre Behandlung',
    ],
    basis: {
      label: 'Basisfall',
      info: 'Notfalluntersuchung inkl. Notdienstzuschlag',
      range: '120–250 €',
    },
    wahrscheinlich: {
      label: 'Wahrscheinlicher Fall',
      info: 'Blasen-Check, Katheter / Entlastung, Labor',
      range: '400–900 €',
    },
    erhoeht: {
      label: 'Erhöhter Fall',
      info: 'Stationäre Behandlung, Komplikationen',
      range: '1.000–2.500 €+',
    },
    drivers: [
      'Notdienst nachts',
      'Katheter / Entlastung',
      'Labor',
      'Stationär',
    ],
  },
}

/** Fallback for symptoms without specific cost data */
const DEFAULT_COST: CostData = {
  band: 'mittel',
  measures: [
    'Allgemeine Untersuchung',
    'Ggf. Diagnostik',
    'Ggf. Medikamente durch die Praxis',
  ],
  basis: {
    label: 'Basisfall',
    info: 'Untersuchung + einfache Behandlung',
    range: '40–100 €',
  },
  wahrscheinlich: {
    label: 'Wahrscheinlicher Fall',
    info: 'Diagnostik und ggf. Medikamente',
    range: '100–300 €',
  },
  erhoeht: {
    label: 'Erhöhter Fall',
    info: 'Weiterführende Diagnostik, Notdienst, stationär',
    range: '300–800 €+',
  },
  drivers: ['Diagnostik', 'Notdienst (bei Bedarf)', 'Medikamente'],
}

export function getCostData(symptomId: string): CostData {
  return COSTS[symptomId] ?? DEFAULT_COST
}

export { COSTS, DEFAULT_COST }
