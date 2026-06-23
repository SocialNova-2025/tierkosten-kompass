import type { LeadFields } from '../types'

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isPhoneValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

export function isLeadValid(
  fields: LeadFields,
  consent1: boolean,
  consent2: boolean,
): boolean {
  return (
    fields.firstName.trim().length > 0 &&
    fields.lastName.trim().length > 0 &&
    isPhoneValid(fields.phone) &&
    isEmailValid(fields.email) &&
    consent1 &&
    consent2
  )
  // desiredCover check removed – the advisory partner clarifies cover type via WhatsApp
}
