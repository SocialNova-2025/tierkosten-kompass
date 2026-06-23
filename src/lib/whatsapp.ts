import type { CheckSession } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp-Konfiguration
// ↓ Bitte die Nummer hier eintragen – ohne Pluszeichen, ohne Leerzeichen
// Format: Ländervorwahl + Nummer, z.B. '491701234567' für +49 170 1234567
// ─────────────────────────────────────────────────────────────────────────────
export const WHATSAPP_PHONE_NUMBER = '491234567890' // ← Platzhalter – bitte vor dem Live-Gang austauschen!

// ── Label-Mappings ────────────────────────────────────────────────────────────

const PROTECTION_LABEL: Record<string, string> = {
  ja:           'Ja, vorhanden',
  nein:         'Noch nicht vorhanden',
  nicht_sicher: 'Nicht sicher',
}

const SUPPORT_GOAL_LABEL: Record<string, string> = {
  verstehen_ob_passend:    'Ich möchte verstehen, ob mein Tier passend abgesichert ist',
  kein_schutz_orientieren: 'Ich habe noch keinen Schutz und möchte mich orientieren',
  hat_schutz_einordnen:    'Ich habe bereits Schutz und möchte ihn einordnen',
  unsicher:                'Ich bin mir unsicher',
}

const PRE_EXISTING_LABEL: Record<string, string> = {
  nein:         'Nein',
  ja:           'Ja',
  nicht_sicher: 'Nicht sicher',
}

const URGENCY_LABEL: Record<string, string> = {
  gruen: 'Grün – Beobachten',
  gelb:  'Gelb – Zeitnah Tierarzt',
  rot:   'Rot – Sofort handeln',
}

// ── Message params ────────────────────────────────────────────────────────────

export interface WhatsAppMessageParams {
  firstName: string
  lastName: string
  petName: string
  petSpecies: 'hund' | 'katze' | ''
  breed: string
  ageYears: string
  weightKg?: number
  protectionStatus: string
  supportGoal: string
  preExisting: string
  preExistingNote: string
  session: CheckSession | null
}

// ── Builders ─────────────────────────────────────────────────────────────────

export function buildWhatsAppMessage(p: WhatsAppMessageParams): string {
  const speciesLabel = p.petSpecies === 'hund' ? 'Hund' : p.petSpecies === 'katze' ? 'Katze' : '–'
  const ageLabel     = p.ageYears === '0' ? 'unter 1 Jahr' : p.ageYears ? p.ageYears + ' Jahre' : '–'
  const weightInfo   = p.weightKg ? ' · ' + p.weightKg + ' kg' : ''

  const lines: string[] = [
    'Hallo, ich möchte den Schutz für meinen Vierbeiner einordnen lassen.',
    '',
    'Meine Angaben:',
    'Vorname: ' + p.firstName,
    'Nachname: ' + p.lastName,
    'Vierbeiner: ' + (p.petName || '–') + ' (' + speciesLabel + ' · ' + (p.breed || '–') + ' · ' + ageLabel + weightInfo + ')',
    'Aktueller Schutz: ' + (PROTECTION_LABEL[p.protectionStatus] ?? '–'),
    'Unterstützung: ' + (SUPPORT_GOAL_LABEL[p.supportGoal] ?? '–'),
  ]

  const preLabel = PRE_EXISTING_LABEL[p.preExisting] ?? '–'
  const preNote  = p.preExisting === 'ja' && p.preExistingNote.trim()
    ? ' – ' + p.preExistingNote.trim()
    : ''
  lines.push('Vorerkrankungen/Beschwerden: ' + preLabel + preNote)

  if (p.session) {
    lines.push('')
    lines.push('Akut-Check:')
    lines.push('Symptom: ' + p.session.symptomId)
    lines.push('Dringlichkeit: ' + (URGENCY_LABEL[p.session.urgency] ?? p.session.urgency))
    lines.push('Score: ' + p.session.score)
    lines.push('Red Flag: ' + (p.session.redFlag ? 'Ja' : 'Nein'))
  }

  lines.push('')
  lines.push('Ich bin über den TierKosten Kompass gekommen.')

  return lines.join('\n')
}

export function buildWhatsAppUrl(message: string): string {
  return 'https://wa.me/' + WHATSAPP_PHONE_NUMBER + '?text=' + encodeURIComponent(message)
}
