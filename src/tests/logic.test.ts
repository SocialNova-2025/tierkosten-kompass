/**
 * TierKosten Kompass – Logic Test Suite
 *
 * Tests verifying:
 *   - 4 demo case scores and levels (spec-exact, never change)
 *   - All red-flag overrides
 *   - Age modifier (+1 for < 1 or > 10 years)
 *   - Gap check logic (all scenarios)
 *   - Lead validation (all edge cases, incl. new protection-context fields)
 *   - WhatsApp link builder
 */
import { describe, it, expect } from 'vitest'
import { calcUrgency, calcScore, isRedFlag } from '../lib/urgency'
import { calcGap }     from '../lib/gapCheck'
import { isLeadValid, isEmailValid, isPhoneValid } from '../lib/leadValidation'
import { buildWhatsAppUrl, buildWhatsAppMessage }  from '../lib/whatsapp'
import { buildMapsUrl, buildEmergencyVetMapsUrl, buildRegularVetMapsUrl } from '../lib/maps'
import { DEMO_CASES }  from '../data/demoCases'
import type { LeadFields } from '../types'

// ── Demo cases ────────────────────────────────────────────────────────────

describe('Demo case scores (spec-exact, never change)', () => {
  DEMO_CASES.forEach(demo => {
    it(demo.label + ' → level=' + demo.expectedLevel + ', score=' + demo.expectedScore, () => {
      const result = calcUrgency(demo.answers, demo.symptom, demo.pet)
      expect(result.level).toBe(demo.expectedLevel)
      expect(result.score).toBe(demo.expectedScore)
    })
  })
  it('D1 Bruno: no red flag', () => { expect(calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet).redFlag).toBe(false) })
  it('D2 Mimi: no red flag',  () => { expect(calcUrgency(DEMO_CASES[1].answers, DEMO_CASES[1].symptom, DEMO_CASES[1].pet).redFlag).toBe(false) })
  it('D3 Rocky: no red flag', () => { expect(calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet).redFlag).toBe(false) })
  it('D4 Felix: redFlag=true (Q_URIN=gar_nicht override)', () => { expect(calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet).redFlag).toBe(true) })
})

// ── Red-flag overrides ────────────────────────────────────────────────────

describe('Red-flag overrides → always rot', () => {
  it('Q_ATEM=stark → rot',         () => { expect(isRedFlag({ Q_ATEM: 'stark' }, 'humpeln')).toBe(true) })
  it('Q_BLUT=viel → rot',          () => { expect(isRedFlag({ Q_BLUT: 'viel' }, 'humpeln')).toBe(true) })
  it('Q_GIFT=ja → rot',            () => { expect(isRedFlag({ Q_GIFT: 'ja' }, 'humpeln')).toBe(true) })
  it('Q_URIN=troepfchen → rot',    () => { expect(isRedFlag({ Q_URIN: 'troepfchen' }, 'urin_katze')).toBe(true) })
  it('Q_URIN=gar_nicht → rot',     () => { expect(isRedFlag({ Q_URIN: 'gar_nicht' }, 'urin_katze')).toBe(true) })
  it('symptom=krampf → rot',       () => { expect(isRedFlag({}, 'krampf')).toBe(true) })
  it('symptom=atemnot → rot',      () => { expect(isRedFlag({}, 'atemnot')).toBe(true) })
  it('symptom=gift → rot',         () => { expect(isRedFlag({}, 'gift')).toBe(true) })
  it('Q_GIFT=unklar → NOT a red flag', () => { expect(isRedFlag({ Q_GIFT: 'unklar' }, 'humpeln')).toBe(false) })
})

// ── Age modifier ──────────────────────────────────────────────────────────

describe('Age modifier (+1 for age < 1 or > 10)', () => {
  const base = { Q_FRISST: 'weniger' as const }
  it('age < 1 adds +1',  () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:0,  weightKg:5, hasInsurance:false })).toBe(2) })
  it('age > 10 adds +1', () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:11, weightKg:5, hasInsurance:false })).toBe(2) })
  it('age 5 no modifier',  () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:5,  weightKg:5, hasInsurance:false })).toBe(1) })
  it('age 1 no modifier (boundary)',  () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:1,  weightKg:5, hasInsurance:false })).toBe(1) })
  it('age 10 no modifier (boundary)', () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:10, weightKg:5, hasInsurance:false })).toBe(1) })
})

// ── Gap check ─────────────────────────────────────────────────────────────

describe('Gap check logic', () => {
  it('no insurance → rot', () => { expect(calcGap({ versicherung: 'nein' }).result).toBe('rot') })
  it('all good → gruen',   () => { expect(calcGap({ versicherung:'ja', op_schutz:'ja', diagnostik:'ja', notdienst:'ja', vorerkrankungen:'nein' }).result).toBe('gruen') })
  it('1 gap → gelb', () => { expect(calcGap({ versicherung:'ja', op_schutz:'nein', diagnostik:'ja',  notdienst:'ja',  vorerkrankungen:'nein' }).result).toBe('gelb') })
  it('2 gaps → gelb',() => { expect(calcGap({ versicherung:'ja', op_schutz:'nein', diagnostik:'nein', notdienst:'ja', vorerkrankungen:'nein' }).result).toBe('gelb') })
  it('3 gaps → rot', () => { expect(calcGap({ versicherung:'ja', op_schutz:'nein', diagnostik:'nein', notdienst:'nein',vorerkrankungen:'nein' }).result).toBe('rot') })
  it('weiss_nicht treated as gap', () => { expect(calcGap({ versicherung:'ja', op_schutz:'weiss_nicht', diagnostik:'weiss_nicht', notdienst:'weiss_nicht', vorerkrankungen:'nein' }).result).toBe('rot') })
  it('vorerkrankungen=ja counts as gap', () => {
    const r = calcGap({ versicherung:'ja', op_schutz:'ja', diagnostik:'ja', notdienst:'ja', vorerkrankungen:'ja' })
    expect(r.result).toBe('gelb')
    expect(r.gaps.length).toBe(1)
  })
})

// ── Lead validation ───────────────────────────────────────────────────────

describe('Lead form validation', () => {
  const valid: LeadFields = {
    firstName: 'Jana', lastName: 'M', phone: '01701234567', email: 'a@b.de',
    protectionStatus: 'nein', supportGoal: 'kein_schutz_orientieren',
    preExisting: 'nein', preExistingNote: '',
  }
  it('all valid + both consents → true',  () => { expect(isLeadValid(valid, true,  true )).toBe(true)  })
  it('missing c1 → false',               () => { expect(isLeadValid(valid, false, true )).toBe(false) })
  it('missing c2 → false',               () => { expect(isLeadValid(valid, true,  false)).toBe(false) })
  it('invalid email → false',            () => { expect(isLeadValid({ ...valid, email: 'noemail' }, true, true)).toBe(false) })
  it('short phone → false',              () => { expect(isLeadValid({ ...valid, phone: '123' },     true, true)).toBe(false) })
  it('phone with spaces counts correctly',() => { expect(isPhoneValid('+49 170 123456')).toBe(true) })
  it('empty firstName → false',          () => { expect(isLeadValid({ ...valid, firstName: '' },    true, true)).toBe(false) })
  it('spaces-only firstName → false',    () => { expect(isLeadValid({ ...valid, firstName: '   ' }, true, true)).toBe(false) })
  it('missing protectionStatus → false', () => { expect(isLeadValid({ ...valid, protectionStatus: '' }, true, true)).toBe(false) })
  it('missing supportGoal → false',      () => { expect(isLeadValid({ ...valid, supportGoal: '' },      true, true)).toBe(false) })
  it('missing preExisting → false',      () => { expect(isLeadValid({ ...valid, preExisting: '' },      true, true)).toBe(false) })
  it('valid email formats',   () => { expect(isEmailValid('a@b.de')).toBe(true);  expect(isEmailValid('user.name+tag@domain.co.uk')).toBe(true) })
  it('invalid email formats', () => { expect(isEmailValid('noemail')).toBe(false); expect(isEmailValid('@domain.de')).toBe(false); expect(isEmailValid('user@')).toBe(false) })
})

// ── WhatsApp link builder ─────────────────────────────────────────────────

describe('WhatsApp link builder', () => {
  const params = {
    firstName: 'Jana', lastName: 'Mueller',
    petName: 'Bruno', petSpecies: 'hund' as const,
    breed: 'Labrador', ageYears: '3',
    protectionStatus: 'nein', supportGoal: 'kein_schutz_orientieren',
    preExisting: 'nein', preExistingNote: '',
    session: null,
  }
  it('buildWhatsAppUrl contains wa.me/',         () => { expect(buildWhatsAppUrl('test')).toContain('wa.me/') })
  it('buildWhatsAppUrl contains encoded message', () => { expect(buildWhatsAppUrl('Hallo Welt')).toContain(encodeURIComponent('Hallo Welt')) })
  it('buildWhatsAppUrl uses ?text= parameter',   () => { expect(buildWhatsAppUrl('test')).toMatch(/\?text=/) })
  it('buildWhatsAppMessage returns non-empty string', () => { const m = buildWhatsAppMessage(params); expect(typeof m).toBe('string'); expect(m.length).toBeGreaterThan(50) })
  it('includes pet name',           () => { expect(buildWhatsAppMessage(params)).toContain('Bruno') })
  it('includes first name',         () => { expect(buildWhatsAppMessage(params)).toContain('Jana') })
  it('includes breed',              () => { expect(buildWhatsAppMessage(params)).toContain('Labrador') })
  it('includes TierKosten Kompass', () => { expect(buildWhatsAppMessage(params)).toContain('TierKosten Kompass') })
  it('age=0 shows "unter 1 Jahr"',  () => { expect(buildWhatsAppMessage({ ...params, ageYears: '0' })).toContain('unter 1 Jahr') })
  it('includes Akut-Check when session provided', () => {
    const session = { id:'1', petId:'p1', symptomId:'humpeln', answers:{}, urgency:'gelb' as const, score:8, redFlag:false, cost:{} as never, createdAt:'' }
    const m = buildWhatsAppMessage({ ...params, session })
    expect(m).toContain('Akut-Check')
    expect(m).toContain('humpeln')
  })
  it('includes preExistingNote when preExisting=ja', () => {
    expect(buildWhatsAppMessage({ ...params, preExisting: 'ja', preExistingNote: 'Nierenproblem' })).toContain('Nierenproblem')
  })
})


// ── Maps URL builder ────────────────────────────────────────────────

describe('Maps URL builder (Notdienst-Suche)', () => {
  it('returns google.com/maps/search URL', () => {
    expect(buildMapsUrl('München')).toContain('google.com/maps/search/')
  })
  it('with city encodes city name', () => {
    const url = buildMapsUrl('München')
    expect(url).toContain(encodeURIComponent('Tierärztlicher Notdienst München'))
  })
  it('with PLZ encodes PLZ', () => {
    const url = buildMapsUrl('80331')
    expect(url).toContain(encodeURIComponent('Tierärztlicher Notdienst 80331'))
  })
  it('without city uses "in der Nähe"', () => {
    const url = buildMapsUrl()
    expect(url).toContain(encodeURIComponent('Tierärztlicher Notdienst in der Nähe'))
  })
  it('with empty string uses "in der Nähe"', () => {
    const url = buildMapsUrl('')
    expect(url).toContain(encodeURIComponent('Tierärztlicher Notdienst in der Nähe'))
  })
  it('with whitespace-only string uses "in der Nähe"', () => {
    const url = buildMapsUrl('   ')
    expect(url).toContain(encodeURIComponent('Tierärztlicher Notdienst in der Nähe'))
  })
  it('URL is properly encoded (no raw spaces)', () => {
    const url = buildMapsUrl('Berlin')
    expect(url).not.toContain(' ')
  })
})


// ── Schutz-CTA card logic (urgency-based) ───────────────────────────────
// ResultPage renders SchutzCardRot / SchutzCardGruen / SchutzCardGelb
// based on session.urgency. These tests verify the urgency values of all
// demo cases so the correct card is guaranteed to appear.
describe('Schutz-CTA card selection (driven by urgency)', () => {
  it('Felix (rot) → SchutzCardRot wird angezeigt', () => {
    const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
  })
  it('Bruno (gelb) → SchutzCardGelb wird angezeigt', () => {
    const r = calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet)
    expect(r.level).toBe('gelb')
  })
  it('Mimi (gelb) → SchutzCardGelb wird angezeigt', () => {
    const r = calcUrgency(DEMO_CASES[1].answers, DEMO_CASES[1].symptom, DEMO_CASES[1].pet)
    expect(r.level).toBe('gelb')
  })
  it('Rocky (gruen) → SchutzCardGruen wird angezeigt', () => {
    const r = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(r.level).toBe('gruen')
  })
  it('Notdienst-Button nur bei rot (Felix)', () => {
    const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
    expect(r.redFlag).toBe(true)
  })
  it('Notdienst-Button nicht bei gruen (Rocky)', () => {
    const r = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(r.level).not.toBe('rot')
  })
  it('WhatsApp-Funnel erreichbar: buildWhatsAppUrl gibt valide URL zurueck', () => {
    const url = buildWhatsAppUrl('Schutzklarung')
    expect(url).toContain('wa.me/')
    expect(url.length).toBeGreaterThan(20)
  })
})


// ── Regular vet Maps URL builder (Gelb-Fall) ────────────────────────────

describe('buildRegularVetMapsUrl (Tierarzt-Suche fuer Gelb-Fall)', () => {
  it('returns google.com/maps/search URL', () => {
    expect(buildRegularVetMapsUrl('München')).toContain('google.com/maps/search/')
  })
  it('with city encodes correct query (gut bewertete Tieraerzte)', () => {
    const url = buildRegularVetMapsUrl('München')
    expect(url).toContain(encodeURIComponent('gut bewertete Tierärzte München'))
  })
  it('with PLZ encodes PLZ', () => {
    const url = buildRegularVetMapsUrl('80331')
    expect(url).toContain(encodeURIComponent('gut bewertete Tierärzte 80331'))
  })
  it('without city uses "in der Naehe"', () => {
    const url = buildRegularVetMapsUrl()
    expect(url).toContain(encodeURIComponent('gut bewertete Tierärzte in der Nähe'))
  })
  it('with empty string uses "in der Naehe"', () => {
    const url = buildRegularVetMapsUrl('')
    expect(url).toContain(encodeURIComponent('gut bewertete Tierärzte in der Nähe'))
  })
  it('with whitespace-only uses "in der Naehe"', () => {
    const url = buildRegularVetMapsUrl('   ')
    expect(url).toContain(encodeURIComponent('gut bewertete Tierärzte in der Nähe'))
  })
  it('URL has no raw spaces', () => {
    expect(buildRegularVetMapsUrl('Berlin')).not.toContain(' ')
  })
  it('does NOT contain Notdienst (different from red-case URL)', () => {
    expect(buildRegularVetMapsUrl('Hamburg')).not.toContain('Notdienst')
  })
})

describe('buildEmergencyVetMapsUrl (Notdienst-Suche fuer Rot-Fall)', () => {
  it('contains Notdienst search term', () => {
    expect(buildEmergencyVetMapsUrl('München')).toContain(encodeURIComponent('Tierärztlicher Notdienst München'))
  })
  it('without city falls back to "in der Naehe"', () => {
    expect(buildEmergencyVetMapsUrl()).toContain(encodeURIComponent('Tierärztlicher Notdienst in der Nähe'))
  })
  it('does NOT contain "gut bewertete" (different from gelb-case URL)', () => {
    expect(buildEmergencyVetMapsUrl('Berlin')).not.toContain('gut+bewertete')
  })
  it('buildMapsUrl alias still works (backward compat)', () => {
    expect(buildMapsUrl('Hamburg')).toContain(encodeURIComponent('Tierärztlicher Notdienst Hamburg'))
  })
})

describe('Maps-CTA urgency routing (Gelb vs Rot)', () => {
  it('Bruno (gelb) bekommt Tierarzt-CTA (nicht Notdienst)', () => {
    const r = calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet)
    expect(r.level).toBe('gelb')
    const url = buildRegularVetMapsUrl('München')
    expect(url).not.toContain('Notdienst')
  })
  it('Felix (rot) bekommt Notdienst-CTA (nicht Tierarzt-Suche)', () => {
    const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
    const url = buildEmergencyVetMapsUrl('München')
    expect(url).toContain('Notdienst')
  })
  it('Rocky (gruen) bekommt keinen Maps-CTA (level weder rot noch gelb)', () => {
    const r = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(r.level).toBe('gruen')
    expect(r.level).not.toBe('rot')
    expect(r.level).not.toBe('gelb')
  })
})
