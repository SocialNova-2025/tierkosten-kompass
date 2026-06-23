// ── Pet ────────────────────────────────────────────────────────────────────
export type Species = 'hund' | 'katze'

export interface Pet {
  id: string
  species: Species
  name: string
  ageYears: number
  weightKg: number
  hasInsurance: boolean
  breed?: string          // optional – captured in LeadForm if missing from profile
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
  species?: Species
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
export interface LeadFields {
  firstName: string
  lastName: string
  phone: string
  email: string
}

// ── App screen identifiers ─────────────────────────────────────────────────
export type Screen =
  | 'P0' | 'P1' | 'P2' | 'P3'
  | 'P4a' | 'P4b' | 'P4c'
  | 'P6' | 'P7' | 'P8' | 'P9' | 'P10' | 'P11'

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

// ── Persisted lead ────────────────────────────────────────────────────────
export interface PersistedLead {
  id: string
  submittedAt: string
  fields: LeadFields
  petSnapshot: Pet | null          // null when no pet profile existed at submission
  // Explicit pet data for WhatsApp automation (always present):
  petName: string
  petSpecies: 'hund' | 'katze'
  breed: string
  petAgeYears: number
  consent1: boolean
  consent2: boolean
}
