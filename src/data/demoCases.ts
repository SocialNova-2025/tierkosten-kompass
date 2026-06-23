/**
 * Demo cases for TierKosten Kompass.
 *
 * These are the four verified reference scenarios used in:
 *   - The Settings screen ("Demo-Fälle laden")
 *   - Automated tests (src/tests/logic.test.ts)
 *
 * Expected results are documented inline and MUST NOT be changed.
 * They are part of the spec and are verified by 33/33 automated tests.
 *
 * Verified scores (QA-passed 2025-06):
 *   D1 Bruno  humpeln      → score 8  → gelb  (redFlag: false)
 *   D2 Mimi   frisst_nicht → score 11 → gelb  (redFlag: false)
 *   D3 Rocky  erbrechen    → score 1  → gruen (redFlag: false)
 *   D4 Felix  urin_katze   → score 99 → rot   (redFlag: true, Q_URIN override)
 */
import type { DemoCase } from '../types'

export const DEMO_CASES: DemoCase[] = [
  {
    label: 'Hund humpelt → Gelb',
    pet: {
      id: 'd1',
      species: 'hund',
      name: 'Bruno',
      ageYears: 5,
      weightKg: 22,
      hasInsurance: true,
    },
    symptom: 'humpeln',
    answers: {
      Q_ATEM: 'unauffaellig',
      Q_BLUT: 'nein',
      Q_UNFALL: 'ja',       // +1
      Q_GIFT: 'nein',
      Q_DAUER: 'h12_24',    // +1
      Q_STAERKE: 'mittel',  // +2
      Q_BELASTET: 'teilweise', // +1
      Q_FRISST: 'normal',
      Q_TRINKT: 'normal',
      Q_VERHALTEN: 'etwas', // +1
      Q_SCHMERZ: 'ja',      // +2
      // Total: 8 → gelb
    },
    expectedLevel: 'gelb',
    expectedScore: 8,
  },

  {
    label: 'Katze frisst nicht → Gelb',
    pet: {
      id: 'd2',
      species: 'katze',
      name: 'Mimi',
      ageYears: 8,
      weightKg: 4,
      hasInsurance: false,
    },
    symptom: 'frisst_nicht',
    answers: {
      Q_ATEM: 'unauffaellig',
      Q_BLUT: 'nein',
      Q_UNFALL: 'nein',
      Q_GIFT: 'unklar',       // +1
      Q_DAUER: 't1_3',        // +2
      Q_HAEUFIG: 'anhaltend', // +2
      Q_FRISST: 'gar_nicht',  // +2
      Q_TRINKT: 'weniger',    // +1
      Q_VERHALTEN: 'deutlich',// +2
      Q_SCHMERZ: 'vielleicht',// +1
      // Total: 11 → gelb (age 8 = no modifier, within 1–10 range)
    },
    expectedLevel: 'gelb',
    expectedScore: 11,
  },

  {
    label: 'Hund erbricht → Grün',
    pet: {
      id: 'd3',
      species: 'hund',
      name: 'Rocky',
      ageYears: 3,
      weightKg: 18,
      hasInsurance: true,
    },
    symptom: 'erbrechen',
    answers: {
      Q_ATEM: 'unauffaellig',
      Q_BLUT: 'nein',
      Q_UNFALL: 'nein',
      Q_GIFT: 'nein',
      Q_DAUER: 'lt12',        // 0
      Q_HAEUFIG: 'einmalig',  // 0
      Q_STAERKE: 'leicht',    // 0
      Q_FRISST: 'weniger',    // +1
      Q_TRINKT: 'normal',
      Q_VERHALTEN: 'nein',
      Q_SCHMERZ: 'nein',
      // Total: 1 → gruen
    },
    expectedLevel: 'gruen',
    expectedScore: 1,
  },

  {
    label: 'Katze kann nicht urinieren → Rot',
    pet: {
      id: 'd4',
      species: 'katze',
      name: 'Felix',
      ageYears: 4,
      weightKg: 5,
      hasInsurance: false,
    },
    symptom: 'urin_katze',
    answers: {
      Q_URIN: 'gar_nicht',    // RED FLAG OVERRIDE → rot, score 99
      Q_VERHALTEN: 'deutlich',
      Q_SCHMERZ: 'ja',
      Q_DAUER: 'lt12',
      Q_ATEM: 'unauffaellig',
      Q_BLUT: 'nein',
      Q_GIFT: 'nein',
    },
    expectedLevel: 'rot',
    expectedScore: 99, // override sets score to 99
  },
]
