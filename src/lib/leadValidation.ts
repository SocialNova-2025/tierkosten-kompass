import type { LeadFields } from '../types'

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/** Strips non-digits before checking length (allows +49 170 123456 format) */
export function isPhoneValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

/**
 * Full lead form validation.
 * All of the following must be true for the WhatsApp CTA to become active:
 *   - firstName:        non-empty (after trim)
 *   - lastName:         non-empty (after trim)
 *   - phone:            >= 10 digits when non-digits stripped
 *   - email:            valid email format
 *   - protectionStatus: one of ja | nein | nicht_sicher (not empty)
 *   - supportGoal:      one of the four options (not empty)
 *   - preExisting:      one of nein | ja | nicht_sicher (not empty)
 *   - c1 + c2:          both consent checkboxes checked
 */
export function isLeadValid(
  fields: LeadFields,
  c1: boolean,
  c2: boolean,
): boolean {
  return (
    fields.firstName.trim().length > 0 &&
    fields.lastName.trim().length > 0 &&
    isPhoneValid(fields.phone) &&
    isEmailValid(fields.email) &&
    fields.protectionStatus !== '' &&
    fields.supportGoal !== '' &&
    fields.preExisting !== '' &&
    c1 &&
    c2
  )
}
