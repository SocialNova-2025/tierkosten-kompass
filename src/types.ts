// ── Pet ────────────────────────────────────────────────────────────────────
export type Species = 'hund' | 'katze'

export interface Pet {
  id: string
  species: Species
  name: string
  ageYears: number
  weightKg: number
  hasInsurance: boolean
}

// ── Urgency ────────────────────────────────────────────────────────────────
export type UrgencyLevel = 'gruen' | 'gelb' | 'rot'

export interface UrgencyResult {
  level: UrgencyLevel
  score: number
  redFlag: boolean
}

// ── Answers (question keys) ────────────────────────────────────────────────
export interface CheckAnswers {
  Q_ATEM?: 'unauffaellig' | 'leicht' | 'stark'
  Q_BLUT?: 'nein' | 'wenig' | 'viel'
  Q_UNFALL?: 'nein' | 'ja'
  Q_GIFT?: 'nein' | 'unklar' | 'ja'
  Q_URIN?: 'normal' | 'troepfchen' | 'gar_nicht'
  Q_DAUER?: 'lt12' | 'h12_24' | 't1_3' | 'laenger'
  Q_STAERKE?: 'leicht' | 'mittel' | 'stark'
  Q_HAEUFIG?: 'einmalig' | 'mehrmals' | 'anhaltend'
  Q_BELASTET?: 'normal' | 'teilweise' | 'gar_nicht'
  Q_FRISST?: 'normal' | 'weniger' | 'gar_nicht'
  Q_TRINKT?: 'normal' | 'weniger' | 'gar_nicht'
  Q_VERHALTEN?: 'nein' | 'etwas' | 'deutlich'
  Q_SCHMERZ?: 'nein' | 'vielleicht' | 'ja'
}

// ── Cost data ──────────────────────────────────────────────────────────────
export type CostBand = 'niedrig' | 'mittel' | 'hoch' | 'sehr_hoch'

export interface CostScenario {
  label: string
  info: string
  range: string
}

export interface CostData {
  band: CostBand
  measures: string[]
  basis: CostScenario
  wahrscheinlich: CostScenario
  erhoeht: CostScenario
  drivers: string[]
}

// ── Session (one completed check) ─────────────────────────────────────────
export interface CheckSession {
  id: string
  petId: string
  symptomId: string
  answers: CheckAnswers
  urgency: UrgencyLevel
  score: number
  redFlag: boolean
  cost: CostData
  createdAt: string
}

// ── Symptoms ───────────────────────────────────────────────────────────────
export interface Symptom {
  id: string
  label: string
  icon: string
  species?: Species   // undefined means shown for both
}

// ── Gap check ─────────────────────────────────────────────────────────────
export interface GapAnswers {
  versicherung?: 'ja' | 'nein'
  op_schutz?: 'ja' | 'nein' | 'weiss_nicht'
  diagnostik?: 'ja' | 'nein' | 'weiss_nicht'
  notdienst?: 'ja' | 'nein' | 'weiss_nicht'
  vorerkrankungen?: 'nein' | 'ja'
}

export interface GapResult {
  result: UrgencyLevel
  gaps: string[]
}

// ── Lead form ─────────────────────────────────────────────────────────────
export type DesiredCover = 'op' | 'voll' | 'unsicher'
export type ContactTime = 'morgens' | 'mittags' | 'nachmittags' | 'egal'

export interface LeadFields {
  firstName: string
  lastName: string
  phone: string
  email: string
  desiredCover: DesiredCover | ''
  contactTime: ContactTime | ''
}

// ── App screen identifiers ─────────────────────────────────────────────────
export type Screen =
  | 'P0'   // Onboarding disclaimer
  | 'P1'   // Start
  | 'P2'   // Pet profile
  | 'P3'   // Symptom grid
  | 'P4a'  // Questions: safety
  | 'P4b'  // Questions: progression
  | 'P4c'  // Questions: condition
  | 'P6'   // Result
  | 'P7'   // Insurance gap check
  | 'P8'   // Gap result
  | 'P9'   // Lead form
  | 'P10'  // Lead confirmation
  | 'P11'  // Mini pet record

export type NavTab = 'start' | 'check' | 'akte'

// ── Demo case ─────────────────────────────────────────────────────────────
export interface DemoCase {
  label: string
  pet: Pet
  symptom: string
  answers: CheckAnswers
  expectedLevel: UrgencyLevel
  expectedScore: number
}

// ── Persisted lead (local-only until backend exists) ──────────────────────
export interface PersistedLead {
  id: string           // timestamp-based unique id
  submittedAt: string  // ISO string
  fields: LeadFields
  petSnapshot: Pet     // snapshot of pet data at time of submission
  consent1: boolean
  consent2: boolean
}
