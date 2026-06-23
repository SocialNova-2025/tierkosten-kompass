import type { LeadFields } from '../types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmailValid(email: string): boolean {
  return EMAIL_RE.test(email)
}

/** Strips spaces before checking length (allows +49 170 123456 format) */
export function isPhoneValid(phone: string): boolean {
  return phone.replace(/\s/g, '').length >= 6
}

/**
 * Full lead form validation.
 * All of the following must be true for the submit button to become active:
 *   - firstName: non-empty (after trim)
 *   - lastName:  non-empty (after trim)
 *   - phone:     ≥6 digits/chars when spaces removed
 *   - email:     valid email format
 *   - desiredCover: selected
 *   - c1 (data sharing consent): checked
 *   - c2 (contact consent): checked
 *
 * contactTime is optional.
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
    fields.desiredCover !== '' &&
    c1 &&
    c2
  )
}
