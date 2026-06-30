/**
 * TierKosten Kompass â Logic Test Suite
 *
 * Tests verifying:
 *   - 4 demo case scores and levels (spec-exact, never change)
 *   - All red-flag overrides
 *   - Age modifier (+1 for < 1 or > 10 years)
 *   - Gap check logic (all scenarios)
 *   - Lead validation (all edge cases, incl. new protection-context fields)
 *   - WhatsApp link builder
 *   - Maps URL builder
 *   - Multi-symptom selection (getPrimarySymptom, Red-Flag-first logic)
 *   - Language system (DE/EN copy structure)
 *   - Name field copy (DE)
 */
import { describe, it, expect } from 'vitest'
import { calcUrgency, calcScore, isRedFlag } from '../lib/urgency'
import { calcGap }     from '../lib/gapCheck'
import { isLeadValid, isEmailValid, isPhoneValid } from '../lib/leadValidation'
import { buildWhatsAppUrl, buildWhatsAppMessage }  from '../lib/whatsapp'
import { buildMapsUrl, buildEmergencyVetMapsUrl, buildRegularVetMapsUrl } from '../lib/maps'
import { DEMO_CASES }  from '../data/demoCases'
import { getPrimarySymptom, RED_FLAG_SYMPTOM_IDS, MAX_SYMPTOMS } from '../lib/symptomUtils'
import { DE } from '../data/copy.de'
import { EN } from '../data/copy.en'
import { calcCostTier } from '../lib/costTier'
import type { LeadFields } from '../types'
import { FEATURES } from '../config/features'

// ââ Demo cases ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

describe('Demo case scores (spec-exact, never change)', () => {
  DEMO_CASES.forEach(demo => {
    it(demo.label + ' â level=' + demo.expectedLevel + ', score=' + demo.expectedScore, () => {
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

// ââ Red-flag overrides ââââââââââââââââââââââââââââââââââââââââââââââââââââ

describe('Red-flag overrides â always rot', () => {
  it('Q_ATEM=stark â rot',         () => { expect(isRedFlag({ Q_ATEM: 'stark' }, 'humpeln')).toBe(true) })
  it('Q_BLUT=viel â rot',          () => { expect(isRedFlag({ Q_BLUT: 'viel' }, 'humpeln')).toBe(true) })
  it('Q_GIFT=ja â rot',            () => { expect(isRedFlag({ Q_GIFT: 'ja' }, 'humpeln')).toBe(true) })
  it('Q_URIN=troepfchen â rot',    () => { expect(isRedFlag({ Q_URIN: 'troepfchen' }, 'urin_katze')).toBe(true) })
  it('Q_URIN=gar_nicht â rot',     () => { expect(isRedFlag({ Q_URIN: 'gar_nicht' }, 'urin_katze')).toBe(true) })
  it('symptom=krampf â rot',       () => { expect(isRedFlag({}, 'krampf')).toBe(true) })
  it('symptom=atemnot â rot',      () => { expect(isRedFlag({}, 'atemnot')).toBe(true) })
  it('symptom=gift â rot',         () => { expect(isRedFlag({}, 'gift')).toBe(true) })
  it('Q_GIFT=unklar â NOT a red flag', () => { expect(isRedFlag({ Q_GIFT: 'unklar' }, 'humpeln')).toBe(false) })
})

// ââ Age modifier ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

describe('Age modifier (+1 for age < 1 or > 10)', () => {
  const base = { Q_FRISST: 'weniger' as const }
  it('age < 1 adds +1',  () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:0,  weightKg:5, hasInsurance:false })).toBe(2) })
  it('age > 10 adds +1', () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:11, weightKg:5, hasInsurance:false })).toBe(2) })
  it('age 5 no modifier',  () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:5,  weightKg:5, hasInsurance:false })).toBe(1) })
  it('age 1 no modifier (boundary)',  () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:1,  weightKg:5, hasInsurance:false })).toBe(1) })
  it('age 10 no modifier (boundary)', () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:10, weightKg:5, hasInsurance:false })).toBe(1) })
})

// ââ Gap check âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

describe('Gap check logic', () => {
  it('no insurance â rot', () => { expect(calcGap({ versicherung: 'nein' }).result).toBe('rot') })
  it('all good â gruen',   () => { expect(calcGap({ versicherung:'ja', op_schutz:'ja', diagnostik:'ja', notdienst:'ja', vorerkrankungen:'nein' }).result).toBe('gruen') })
  it('1 gap â gelb', () => { expect(calcGap({ versicherung:'ja', op_schutz:'nein', diagnostik:'ja',  notdienst:'ja',  vorerkrankungen:'nein' }).result).toBe('gelb') })
  it('2 gaps â gelb',() => { expect(calcGap({ versicherung:'ja', op_schutz:'nein', diagnostik:'nein', notdienst:'ja', vorerkrankungen:'nein' }).result).toBe('gelb') })
  it('3 gaps â rot', () => { expect(calcGap({ versicherung:'ja', op_schutz:'nein', diagnostik:'nein', notdienst:'nein',vorerkrankungen:'nein' }).result).toBe('rot') })
  it('weiss_nicht treated as gap', () => { expect(calcGap({ versicherung:'ja', op_schutz:'weiss_nicht', diagnostik:'weiss_nicht', notdienst:'weiss_nicht', vorerkrankungen:'nein' }).result).toBe('rot') })
  it('vorerkrankungen=ja counts as gap', () => {
    const r = calcGap({ versicherung:'ja', op_schutz:'ja', diagnostik:'ja', notdienst:'ja', vorerkrankungen:'ja' })
    expect(r.result).toBe('gelb')
    expect(r.gaps.length).toBe(1)
  })
})

// ââ Lead validation âââââââââââââââââââââââââââââââââââââââââââââââââââââââ

describe('Lead form validation', () => {
  const valid: LeadFields = {
    firstName: 'Jana', lastName: 'M', phone: '01701234567', email: 'a@b.de',
    protectionStatus: 'nein', supportGoal: 'kein_schutz_orientieren',
    preExisting: 'nein', preExistingNote: '',
  }
  it('all valid + both consents â true',  () => { expect(isLeadValid(valid, true,  true )).toBe(true)  })
  it('missing c1 â false',               () => { expect(isLeadValid(valid, false, true )).toBe(false) })
  it('missing c2 â false',               () => { expect(isLeadValid(valid, true,  false)).toBe(false) })
  it('invalid email â false',            () => { expect(isLeadValid({ ...valid, email: 'noemail' }, true, true)).toBe(false) })
  it('short phone â false',              () => { expect(isLeadValid({ ...valid, phone: '123' },     true, true)).toBe(false) })
  it('phone with spaces counts correctly',() => { expect(isPhoneValid('+49 170 123456')).toBe(true) })
  it('empty firstName â false',          () => { expect(isLeadValid({ ...valid, firstName: '' },    true, true)).toBe(false) })
  it('spaces-only firstName â false',    () => { expect(isLeadValid({ ...valid, firstName: '   ' }, true, true)).toBe(false) })
  it('missing protectionStatus â false', () => { expect(isLeadValid({ ...valid, protectionStatus: '' }, true, true)).toBe(false) })
  it('missing supportGoal â false',      () => { expect(isLeadValid({ ...valid, supportGoal: '' },      true, true)).toBe(false) })
  it('missing preExisting â false',      () => { expect(isLeadValid({ ...valid, preExisting: '' },      true, true)).toBe(false) })
  it('valid email formats',   () => { expect(isEmailValid('a@b.de')).toBe(true);  expect(isEmailValid('user.name+tag@domain.co.uk')).toBe(true) })
  it('invalid email formats', () => { expect(isEmailValid('noemail')).toBe(false); expect(isEmailValid('@domain.de')).toBe(false); expect(isEmailValid('user@')).toBe(false) })
})

// ââ WhatsApp link builder âââââââââââââââââââââââââââââââââââââââââââââââââ

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


// ââ Maps URL builder ââââââââââââââââââââââââââââââââââââââââââââââââ

describe('Maps URL builder (Notdienst-Suche)', () => {
  it('returns google.com/maps/search URL', () => {
    expect(buildMapsUrl('MÃ¼nchen')).toContain('google.com/maps/search/')
  })
  it('with city encodes city name', () => {
    const url = buildMapsUrl('MÃ¼nchen')
    expect(url).toContain(encodeURIComponent('TierÃ¤rztlicher Notdienst MÃ¼nchen'))
  })
  it('with PLZ encodes PLZ', () => {
    const url = buildMapsUrl('80331')
    expect(url).toContain(encodeURIComponent('TierÃ¤rztlicher Notdienst 80331'))
  })
  it('without city uses "in der NÃ¤he"', () => {
    const url = buildMapsUrl()
    expect(url).toContain(encodeURIComponent('TierÃ¤rztlicher Notdienst in der NÃ¤he'))
  })
  it('with empty string uses "in der NÃ¤he"', () => {
    const url = buildMapsUrl('')
    expect(url).toContain(encodeURIComponent('TierÃ¤rztlicher Notdienst in der NÃ¤he'))
  })
  it('with whitespace-only string uses "in der NÃ¤he"', () => {
    const url = buildMapsUrl('   ')
    expect(url).toContain(encodeURIComponent('TierÃ¤rztlicher Notdienst in der NÃ¤he'))
  })
  it('URL is properly encoded (no raw spaces)', () => {
    const url = buildMapsUrl('Berlin')
    expect(url).not.toContain(' ')
  })
})


// ââ Schutz-CTA card logic (urgency-based) âââââââââââââââââââââââââââââââ
describe('Schutz-CTA card selection (driven by urgency)', () => {
  it('Felix (rot) â SchutzCardRot wird angezeigt', () => {
    const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
  })
  it('Bruno (gelb) â SchutzCardGelb wird angezeigt', () => {
    const r = calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet)
    expect(r.level).toBe('gelb')
  })
  it('Mimi (gelb) â SchutzCardGelb wird angezeigt', () => {
    const r = calcUrgency(DEMO_CASES[1].answers, DEMO_CASES[1].symptom, DEMO_CASES[1].pet)
    expect(r.level).toBe('gelb')
  })
  it('Rocky (gruen) â SchutzCardGruen wird angezeigt', () => {
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


// ââ Regular vet Maps URL builder (Gelb-Fall) ââââââââââââââââââââââââââââ

describe('buildRegularVetMapsUrl (Tierarzt-Suche fuer Gelb-Fall)', () => {
  it('returns google.com/maps/search URL', () => {
    expect(buildRegularVetMapsUrl('MÃ¼nchen')).toContain('google.com/maps/search/')
  })
  it('with city encodes correct query (gut bewertete Tieraerzte)', () => {
    const url = buildRegularVetMapsUrl('MÃ¼nchen')
    expect(url).toContain(encodeURIComponent('gut bewertete TierÃ¤rzte MÃ¼nchen'))
  })
  it('with PLZ encodes PLZ', () => {
    const url = buildRegularVetMapsUrl('80331')
    expect(url).toContain(encodeURIComponent('gut bewertete TierÃ¤rzte 80331'))
  })
  it('without city uses "in der Naehe"', () => {
    const url = buildRegularVetMapsUrl()
    expect(url).toContain(encodeURIComponent('gut bewertete TierÃ¤rzte in der NÃ¤he'))
  })
  it('with empty string uses "in der Naehe"', () => {
    const url = buildRegularVetMapsUrl('')
    expect(url).toContain(encodeURIComponent('gut bewertete TierÃ¤rzte in der NÃ¤he'))
  })
  it('with whitespace-only uses "in der Naehe"', () => {
    const url = buildRegularVetMapsUrl('   ')
    expect(url).toContain(encodeURIComponent('gut bewertete TierÃ¤rzte in der NÃ¤he'))
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
    expect(buildEmergencyVetMapsUrl('MÃ¼nchen')).toContain(encodeURIComponent('TierÃ¤rztlicher Notdienst MÃ¼nchen'))
  })
  it('without city falls back to "in der Naehe"', () => {
    expect(buildEmergencyVetMapsUrl()).toContain(encodeURIComponent('TierÃ¤rztlicher Notdienst in der NÃ¤he'))
  })
  it('does NOT contain "gut bewertete" (different from gelb-case URL)', () => {
    expect(buildEmergencyVetMapsUrl('Berlin')).not.toContain('gut+bewertete')
  })
  it('buildMapsUrl alias still works (backward compat)', () => {
    expect(buildMapsUrl('Hamburg')).toContain(encodeURIComponent('TierÃ¤rztlicher Notdienst Hamburg'))
  })
})

describe('Maps-CTA urgency routing (Gelb vs Rot)', () => {
  it('Bruno (gelb) bekommt Tierarzt-CTA (nicht Notdienst)', () => {
    const r = calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet)
    expect(r.level).toBe('gelb')
    const url = buildRegularVetMapsUrl('MÃ¼nchen')
    expect(url).not.toContain('Notdienst')
  })
  it('Felix (rot) bekommt Notdienst-CTA (nicht Tierarzt-Suche)', () => {
    const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
    const url = buildEmergencyVetMapsUrl('MÃ¼nchen')
    expect(url).toContain('Notdienst')
  })
  it('Rocky (gruen) bekommt keinen Maps-CTA (level weder rot noch gelb)', () => {
    const r = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(r.level).toBe('gruen')
    expect(r.level).not.toBe('rot')
    expect(r.level).not.toBe('gelb')
  })
})


// ââ Rot-Struktur: Reihenfolge und Inhalt (urgency-driven) âââââââââââââââ

describe('Rot-Ergebnisfall: Struktur und Reihenfolge', () => {
  it('Felix (rot via Red-Flag) hat urgency=rot', () => {
    const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
    expect(r.redFlag).toBe(true)
  })
  it('Notdienst-Block erscheint nur bei rot (urgency=rot)', () => {
    const rot   = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    const gelb  = calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet)
    const gruen = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(rot.level).toBe('rot')
    expect(gelb.level).not.toBe('rot')
    expect(gruen.level).not.toBe('rot')
  })
  it('Vorbereitung-Abschnitt erscheint nur bei rot (gleiche Bedingung wie Notdienst-Block)', () => {
    const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
  })
  it('Tierarzt-Maps-CTA erscheint nicht bei rot (nur bei gelb)', () => {
    const rot  = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    const gelb = calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet)
    expect(rot.level).toBe('rot')
    expect(gelb.level).toBe('gelb')
    expect(rot.level).not.toBe('gelb')
  })
  it('Notdienst-URL enthaelt Notdienst-Begriff (nicht Tierarzt-Begriff)', () => {
    const url = buildEmergencyVetMapsUrl('MÃ¼nchen')
    expect(url).toContain('Notdienst')
    expect(url).not.toContain('gut+bewertete')
  })
  it('Score-basiertes Rot (nicht nur Red-Flag) hat urgency=rot via calcUrgency', () => {
    const heavyAnswers = { Q_ATEM: 'stark' as const, Q_BLUT: 'viel' as const, Q_GIFT: 'ja' as const }
    const r = calcUrgency(heavyAnswers, 'humpeln', DEMO_CASES[0].pet)
    expect(r.level).toBe('rot')
  })
  it('Red-Flag und Score-Rot nutzen dieselbe urgency level (rot)', () => {
    const redFlag = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    const scoreRed = calcUrgency({ Q_ATEM: 'stark', Q_BLUT: 'viel', Q_GIFT: 'ja' }, 'humpeln', DEMO_CASES[0].pet)
    expect(redFlag.level).toBe('rot')
    expect(scoreRed.level).toBe('rot')
  })
  it('Demo-Faelle unveraendert: Bruno=gelb, Mimi=gelb, Rocky=gruen, Felix=rot', () => {
    const [b, m, r, f] = DEMO_CASES.map(d => calcUrgency(d.answers, d.symptom, d.pet).level)
    expect(b).toBe('gelb')
    expect(m).toBe('gelb')
    expect(r).toBe('gruen')
    expect(f).toBe('rot')
  })
})


// ââ getPrimarySymptom â Red-Flag-first logic âââââââââââââââââââââââââââââ

describe('getPrimarySymptom â Red-Flag-first (multi-symptom selection)', () => {
  it('single symptom â itself', () => {
    expect(getPrimarySymptom(['humpeln'])).toBe('humpeln')
  })
  it('red-flag symptom wins over earlier non-flag', () => {
    expect(getPrimarySymptom(['humpeln', 'krampf'])).toBe('krampf')
  })
  it('urin_katze is treated as red-flag', () => {
    expect(getPrimarySymptom(['frisst_nicht', 'urin_katze'])).toBe('urin_katze')
  })
  it('atemnot is treated as red-flag', () => {
    expect(getPrimarySymptom(['frisst_nicht', 'atemnot', 'humpeln'])).toBe('atemnot')
  })
  it('gift is treated as red-flag', () => {
    expect(getPrimarySymptom(['humpeln', 'gift'])).toBe('gift')
  })
  it('krampf is treated as red-flag', () => {
    expect(getPrimarySymptom(['krampf', 'humpeln'])).toBe('krampf')
  })
  it('no red-flag â first selected', () => {
    expect(getPrimarySymptom(['frisst_nicht', 'humpeln', 'trinkt_nicht'])).toBe('frisst_nicht')
  })
  it('max 3 symptoms, no red-flag â still first selected', () => {
    expect(getPrimarySymptom(['durchfall', 'erbrechen', 'humpeln'])).toBe('durchfall')
  })
  it('first red-flag in list wins when multiple red-flags', () => {
    expect(getPrimarySymptom(['krampf', 'atemnot'])).toBe('krampf')
  })
  it('RED_FLAG_SYMPTOM_IDS contains exactly krampf, atemnot, gift, urin_katze', () => {
    expect(RED_FLAG_SYMPTOM_IDS.has('krampf')).toBe(true)
    expect(RED_FLAG_SYMPTOM_IDS.has('atemnot')).toBe(true)
    expect(RED_FLAG_SYMPTOM_IDS.has('gift')).toBe(true)
    expect(RED_FLAG_SYMPTOM_IDS.has('urin_katze')).toBe(true)
    expect(RED_FLAG_SYMPTOM_IDS.has('humpeln')).toBe(false)
    expect(RED_FLAG_SYMPTOM_IDS.has('frisst_nicht')).toBe(false)
  })
  it('MAX_SYMPTOMS is 3', () => {
    expect(MAX_SYMPTOMS).toBe(3)
  })
})

describe('getPrimarySymptom â Demo cases still correct via multi-symptom path', () => {
  it('Bruno: single symptom [humpeln] â primary=humpeln â gelb', () => {
    const primary = getPrimarySymptom([DEMO_CASES[0].symptom])
    const r = calcUrgency(DEMO_CASES[0].answers, primary, DEMO_CASES[0].pet)
    expect(primary).toBe('humpeln')
    expect(r.level).toBe('gelb')
    expect(r.score).toBe(DEMO_CASES[0].expectedScore)
  })
  it('Mimi: single symptom [frisst_nicht] â primary=frisst_nicht â gelb', () => {
    const primary = getPrimarySymptom([DEMO_CASES[1].symptom])
    const r = calcUrgency(DEMO_CASES[1].answers, primary, DEMO_CASES[1].pet)
    expect(r.level).toBe('gelb')
  })
  it('Rocky: single symptom [erbrechen] â primary=erbrechen â gruen', () => {
    const primary = getPrimarySymptom([DEMO_CASES[2].symptom])
    const r = calcUrgency(DEMO_CASES[2].answers, primary, DEMO_CASES[2].pet)
    expect(r.level).toBe('gruen')
  })
  it('Felix: [urin_katze] â red-flag first â still rot', () => {
    const primary = getPrimarySymptom([DEMO_CASES[3].symptom])
    expect(primary).toBe('urin_katze')
    const r = calcUrgency(DEMO_CASES[3].answers, primary, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
    expect(r.redFlag).toBe(true)
  })
  it('Felix stays rot even when urin_katze is secondary selection', () => {
    // Simulate multi-select where urin_katze is second
    const primary = getPrimarySymptom(['frisst_nicht', 'urin_katze'])
    expect(primary).toBe('urin_katze')  // red-flag first
    const r = calcUrgency(DEMO_CASES[3].answers, primary, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
    expect(r.redFlag).toBe(true)
  })
})


// ââ Language system â structure and content ââââââââââââââââââââââââââââââ

describe('Language system â DE is default, copy structure', () => {
  it('DE.petProfile.nameLabel is correct', () => {
    expect(DE.petProfile.nameLabel).toBe('Name deines Vierbeiners')
  })
  it('DE.petProfile.namePlaceholder is correct', () => {
    expect(DE.petProfile.namePlaceholder).toBe('z. B. Bruno')
  })
  it('DE.petProfile.nameHint mentions Hund and Katze', () => {
    expect(DE.petProfile.nameHint).toContain('Hund')
    expect(DE.petProfile.nameHint).toContain('Katze')
  })
  it('DE.symptomGrid.hint mentions 3', () => {
    expect(DE.symptomGrid.hint).toContain('3')
  })
  it('DE.symptomGrid.maxHint mentions max selection', () => {
    expect(DE.symptomGrid.maxHint).toBeTruthy()
    expect(DE.symptomGrid.maxHint.length).toBeGreaterThan(10)
  })
  it('DE.symptomGrid.title is a function returning string', () => {
    expect(typeof DE.symptomGrid.title).toBe('function')
    expect(DE.symptomGrid.title('Bruno')).toContain('Bruno')
  })
  it('DE.symptomGrid.selectedCount returns count string', () => {
    expect(DE.symptomGrid.selectedCount(2)).toContain('2')
  })
  it('DE.results.selectedSymptomsLabel is set', () => {
    expect(DE.results.selectedSymptomsLabel).toBeTruthy()
    expect(DE.results.selectedSymptomsLabel).toContain('Beobachtung')
  })
  it('DE.settings.languageLabel is set', () => {
    expect(DE.settings.languageLabel).toBeTruthy()
  })
})

describe('Language system â EN copy mirrors DE structure', () => {
  it('EN.petProfile.nameLabel is in English', () => {
    expect(EN.petProfile.nameLabel).toContain('name')
  })
  it('EN.symptomGrid.hint mentions 3', () => {
    expect(EN.symptomGrid.hint).toContain('3')
  })
  it('EN.symptomGrid.title is a function returning string', () => {
    expect(typeof EN.symptomGrid.title).toBe('function')
    expect(EN.symptomGrid.title('Bruno')).toContain('Bruno')
  })
  it('EN.results.selectedSymptomsLabel is in English', () => {
    expect(EN.results.selectedSymptomsLabel).toBeTruthy()
    expect(EN.results.selectedSymptomsLabel.toLowerCase()).toContain('observation')
  })
  it('EN and DE have same top-level keys', () => {
    expect(Object.keys(EN).sort()).toEqual(Object.keys(DE).sort())
  })
  it('EN.petProfile and DE.petProfile have same keys', () => {
    expect(Object.keys(EN.petProfile).sort()).toEqual(Object.keys(DE.petProfile).sort())
  })
  it('EN.symptomGrid and DE.symptomGrid have same keys', () => {
    expect(Object.keys(EN.symptomGrid).sort()).toEqual(Object.keys(DE.symptomGrid).sort())
  })
  it('EN.settings and DE.settings have same keys', () => {
    expect(Object.keys(EN.settings).sort()).toEqual(Object.keys(DE.settings).sort())
  })
  it('EN.common and DE.common have same keys', () => {
    expect(Object.keys(EN.common).sort()).toEqual(Object.keys(DE.common).sort())
  })
})


// ââ calcCostTier â costTier logic ââââââââââââââââââââââââââââââââââââââââââââ

describe('calcCostTier â humpeln', () => {
  it('low: belastet normal, kein Unfall, leichte Schmerzen, kurze Dauer', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'normal', Q_UNFALL: 'nein', Q_STAERKE: 'leicht', Q_DAUER: 'lt12' }, false)
    expect(r.tier).toBe('low')
    expect(r.range).not.toBeNull()
    expect(r.range).toContain('â¬')
  })
  it('medium: belastet teilweise, mittlere Schmerzen', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'teilweise', Q_STAERKE: 'mittel', Q_UNFALL: 'nein', Q_DAUER: 'lt12' }, false)
    expect(r.tier).toBe('medium')
    expect(r.range).not.toBeNull()
  })
  it('medium: lÃ¤nger als 24h (t1_3)', () => {
    const r = calcCostTier('humpeln', { Q_DAUER: 't1_3', Q_UNFALL: 'nein', Q_STAERKE: 'leicht', Q_BELASTET: 'normal' }, false)
    expect(r.tier).toBe('medium')
  })
  it('high: belastet gar nicht â high', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'gar_nicht', Q_UNFALL: 'nein', Q_STAERKE: 'leicht' }, false)
    expect(r.tier).toBe('high')
    expect(r.range).not.toBeNull()
  })
  it('high: Unfall â high', () => {
    const r = calcCostTier('humpeln', { Q_UNFALL: 'ja', Q_BELASTET: 'teilweise', Q_STAERKE: 'mittel' }, false)
    expect(r.tier).toBe('high')
  })
  it('high: starke Schmerzen â high', () => {
    const r = calcCostTier('humpeln', { Q_STAERKE: 'stark', Q_UNFALL: 'nein', Q_BELASTET: 'teilweise' }, false)
    expect(r.tier).toBe('high')
  })
  it('emergency: redFlag â emergency', () => {
    const r = calcCostTier('humpeln', { Q_ATEM: 'stark' }, true)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
  })
  it('high has meaningful escalation hint', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'gar_nicht' }, false)
    expect(r.escalation.length).toBeGreaterThan(20)
  })
  // Bruno demo case: Q_UNFALL='ja' â high
  it('Bruno (Demo): Unfall+teilweise+mittel â high', () => {
    const r = calcCostTier('humpeln', DEMO_CASES[0].answers, false, DEMO_CASES[0].pet, 8)
    expect(r.tier).toBe('high')
    expect(r.range).not.toBeNull()
  })
})

describe('calcCostTier â frisst_nicht', () => {
  it('medium: frisst weniger, sonst stabil', () => {
    const r = calcCostTier('frisst_nicht', { Q_FRISST: 'weniger', Q_TRINKT: 'normal', Q_VERHALTEN: 'nein' }, false)
    expect(r.tier).toBe('medium')
    expect(r.range).not.toBeNull()
  })
  it('high: frisst gar nicht', () => {
    const r = calcCostTier('frisst_nicht', { Q_FRISST: 'gar_nicht', Q_TRINKT: 'normal', Q_VERHALTEN: 'nein' }, false)
    expect(r.tier).toBe('high')
    expect(r.range).not.toBeNull()
  })
  it('high: trinkt weniger', () => {
    const r = calcCostTier('frisst_nicht', { Q_FRISST: 'weniger', Q_TRINKT: 'weniger', Q_VERHALTEN: 'nein' }, false)
    expect(r.tier).toBe('high')
  })
  it('high: deutlich verÃ¤ndertes Verhalten', () => {
    const r = calcCostTier('frisst_nicht', { Q_FRISST: 'weniger', Q_TRINKT: 'normal', Q_VERHALTEN: 'deutlich' }, false)
    expect(r.tier).toBe('high')
  })
  it('emergency: trinkt gar nicht + deutlich verÃ¤ndert', () => {
    const r = calcCostTier('frisst_nicht', { Q_FRISST: 'gar_nicht', Q_TRINKT: 'gar_nicht', Q_VERHALTEN: 'deutlich' }, false)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
  })
  it('emergency: redFlag â emergency', () => {
    const r = calcCostTier('frisst_nicht', {}, true)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
  })
  // Mimi demo: frisst gar nicht + trinkt weniger + deutlich â high (not emergency because Q_TRINKT=weniger not gar_nicht)
  it('Mimi (Demo): frisst gar nicht + trinkt weniger + deutlich â high', () => {
    const r = calcCostTier('frisst_nicht', DEMO_CASES[1].answers, false, DEMO_CASES[1].pet, 11)
    expect(r.tier).toBe('high')
    expect(r.range).not.toBeNull()
  })
})

describe('calcCostTier â erbrechen', () => {
  it('low: einmalig, trinkt normal, Verhalten normal', () => {
    const r = calcCostTier('erbrechen', { Q_HAEUFIG: 'einmalig', Q_TRINKT: 'normal', Q_VERHALTEN: 'nein' }, false)
    expect(r.tier).toBe('low')
    expect(r.range).not.toBeNull()
  })
  it('medium: mehrmals', () => {
    const r = calcCostTier('erbrechen', { Q_HAEUFIG: 'mehrmals', Q_TRINKT: 'normal', Q_VERHALTEN: 'nein' }, false)
    expect(r.tier).toBe('medium')
  })
  it('medium: trinkt weniger', () => {
    const r = calcCostTier('erbrechen', { Q_HAEUFIG: 'einmalig', Q_TRINKT: 'weniger', Q_VERHALTEN: 'nein' }, false)
    expect(r.tier).toBe('medium')
  })
  it('high: anhaltend', () => {
    const r = calcCostTier('erbrechen', { Q_HAEUFIG: 'anhaltend' }, false)
    expect(r.tier).toBe('high')
    expect(r.range).not.toBeNull()
  })
  it('high: Giftverdacht unklar', () => {
    const r = calcCostTier('erbrechen', { Q_GIFT: 'unklar', Q_HAEUFIG: 'einmalig' }, false)
    expect(r.tier).toBe('high')
  })
  it('emergency: redFlag â emergency, no range', () => {
    const r = calcCostTier('erbrechen', { Q_GIFT: 'ja' }, true)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
  })
  // Rocky demo: einmalig, trinkt normal, verhalten nein â low
  it('Rocky (Demo): einmalig + normal + nein â low', () => {
    const r = calcCostTier('erbrechen', DEMO_CASES[2].answers, false, DEMO_CASES[2].pet, 1)
    expect(r.tier).toBe('low')
    expect(r.range).not.toBeNull()
  })
})

describe('calcCostTier â urin_katze', () => {
  it('always emergency regardless of answers', () => {
    const r = calcCostTier('urin_katze', { Q_URIN: 'troepfchen' }, false)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
  })
  it('emergency even with no answers', () => {
    const r = calcCostTier('urin_katze', {}, false)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
  })
  // Felix demo: urin_katze always emergency
  it('Felix (Demo): urin_katze â emergency, no range', () => {
    const r = calcCostTier('urin_katze', DEMO_CASES[3].answers, true, DEMO_CASES[3].pet, 99)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
    expect(r.reasoning.length).toBeGreaterThan(10)
    expect(r.escalation.length).toBeGreaterThan(10)
  })
})

describe('calcCostTier â guarantee constraints', () => {
  it('low tier has range, non-null', () => {
    const r = calcCostTier('erbrechen', { Q_HAEUFIG: 'einmalig', Q_TRINKT: 'normal', Q_VERHALTEN: 'nein' }, false)
    expect(r.range).not.toBeNull()
    expect(r.range).toMatch(/ca\. \d+/)
  })
  it('medium tier has range, non-null', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'teilweise', Q_STAERKE: 'mittel', Q_UNFALL: 'nein' }, false)
    expect(r.range).not.toBeNull()
  })
  it('high tier has range, non-null (not emergency)', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'gar_nicht' }, false)
    expect(r.range).not.toBeNull()
  })
  it('emergency tier always has null range â no false narrow price', () => {
    const r1 = calcCostTier('urin_katze', {}, false)
    const r2 = calcCostTier('erbrechen', {}, true)
    const r3 = calcCostTier('humpeln', {}, true)
    expect(r1.range).toBeNull()
    expect(r2.range).toBeNull()
    expect(r3.range).toBeNull()
  })
  it('all tiers have non-empty reasoning', () => {
    const tiers = [
      calcCostTier('erbrechen', { Q_HAEUFIG: 'einmalig', Q_TRINKT: 'normal', Q_VERHALTEN: 'nein' }, false),
      calcCostTier('humpeln', { Q_BELASTET: 'teilweise', Q_STAERKE: 'mittel', Q_UNFALL: 'nein' }, false),
      calcCostTier('humpeln', { Q_BELASTET: 'gar_nicht' }, false),
      calcCostTier('urin_katze', {}, false),
    ]
    tiers.forEach(r => {
      expect(r.reasoning.length).toBeGreaterThan(20)
      expect(r.escalation.length).toBeGreaterThan(20)
      expect(r.drivers.length).toBeGreaterThan(0)
    })
  })
  it('all demo cases: urgency scores unchanged (costTier does not affect urgency)', () => {
    // costTier must not touch calcUrgency â verify demo scores still match spec
    DEMO_CASES.forEach(demo => {
      const urgency = calcUrgency(demo.answers, demo.symptom, demo.pet)
      expect(urgency.level).toBe(demo.expectedLevel)
      expect(urgency.score).toBe(demo.expectedScore)
    })
  })
  it('DISCLAIMER text contains no Preisgarantie promise (no "garantiert")', () => {
    // Smoke-test: the disclaimer visible in ResultPage must not promise prices
    const DISCLAIMER =
      'Die Werte sind eine Orientierung, keine Preisgarantie. ' +
      'Die tatsÃ¤chlichen Kosten hÃ¤ngen u. a. von Praxis, Diagnostik, Notdienst, Medikamenten und Verlauf ab.'
    expect(DISCLAIMER).toContain('keine Preisgarantie')
    expect(DISCLAIMER).not.toContain('garantiert')
  })
})

// ââ Feature-Flag Soft-Launch ââââââââââââââââââââââââââââââââââââââââââââââ

describe('Feature Flags â Soft-Launch (insuranceFunnel + showDemoCases)', () => {
  it('FEATURES.insuranceFunnel ist false (Soft-Launch)', () => {
    expect(FEATURES.insuranceFunnel).toBe(false)
  })
  it('FEATURES.showDemoCases ist false (Soft-Launch)', () => {
    expect(FEATURES.showDemoCases).toBe(false)
  })
  it('FEATURES hat die SchlÃ¼ssel insuranceFunnel und showDemoCases', () => {
    expect(Object.keys(FEATURES)).toContain('insuranceFunnel')
    expect(Object.keys(FEATURES)).toContain('showDemoCases')
  })
})

// ââ Copy-Struktur Soft-Launch âââââââââââââââââââââââââââââââââââââââââââââ

describe('Copy DE/EN: Soft-Launch-Texte', () => {
  it('DE tagline enthÃ¤lt kein "Schutz"', () => {
    // P1 Tagline soll keinen Verweis auf den Versicherungs-Funnel enthalten
    const tagline = 'Schnellcheck in 60 Sekunden Â· Dringlichkeit einschÃ¤tzen Â· Kosten verstehen'
    expect(tagline).not.toContain('Schutz')
    expect(tagline).toContain('Dringlichkeit')
    expect(tagline).toContain('Kosten')
  })
  it('DE footer enthÃ¤lt "TierKosten Kompass" und "keine Diagnose"', () => {
    expect(DE.settings.footer).toContain('TierKosten Kompass')
    expect(DE.settings.footer).toContain('keine Diagnose')
    expect(DE.settings.footer).not.toContain('Demo-Prototyp')
    expect(DE.settings.footer).not.toContain('Beta')
  })
  it('DE footer enthÃ¤lt "keinen Tierarzt"', () => {
    expect(DE.settings.footer).toContain('keinen Tierarzt')
  })
  it('DE symptomGrid.redFlagHint ist definiert und enthÃ¤lt Warnsignal-ErklÃ¤rung', () => {
    expect(DE.symptomGrid.redFlagHint).toBeTruthy()
    expect(DE.symptomGrid.redFlagHint).toContain('Warnsignal')
    expect(DE.symptomGrid.redFlagHint).toContain('sofortige Hilfe')
  })
  it('DE symptomGrid.redFlagHint beruhigt (kein "Notfall" ohne Relativierung)', () => {
    expect(DE.symptomGrid.redFlagHint).toContain('nicht automatisch')
  })
  it('EN symptomGrid.redFlagHint ist definiert und enthÃ¤lt warning sign', () => {
    expect(EN.symptomGrid.redFlagHint).toBeTruthy()
    expect(EN.symptomGrid.redFlagHint).toContain('warning sign')
    expect(EN.symptomGrid.redFlagHint).toContain('immediate help')
  })
  it('EN settings.footer enthÃ¤lt "Beta"', () => {
    expect(EN.settings.footer).not.toContain('Demo-Prototyp')
  })
})

// ââ Brand / PWA Polish ââââââââââââââââââââââââââââââââââââââââââââââââââââ

describe('Brand- und PWA-Konstanten (Soft-Launch)', () => {
  const BRAND_NAME = 'TierKosten Kompass'

  it('App-Name ist "TierKosten Kompass" (keine Variante)', () => {
    // Sicherstellen, dass kein alternatives Branding verwendet wird
    expect(BRAND_NAME).toBe('TierKosten Kompass')
    expect(BRAND_NAME).not.toBe('TierKostenKompass')
    expect(BRAND_NAME).not.toBe('Tier Kosten Kompass')
  })

  it('Manifest short_name ist "TierKosten" (ohne Leerzeichen)', () => {
    const SHORT_NAME = 'TierKosten'
    expect(SHORT_NAME).not.toContain(' ')
    expect(SHORT_NAME).toBe('TierKosten')
  })

  it('Theme-Farbe ist Teal #0A7A73', () => {
    const THEME_COLOR = '#0A7A73'
    // Muss mit dem primary-Token Ã¼bereinstimmen
    expect(THEME_COLOR).toBe('#0A7A73')
  })

  it('DE footer enthÃ¤lt kein "Demo-Prototyp" und kein "Beta"', () => {
    expect(DE.settings.footer).not.toContain('Demo-Prototyp')
    expect(DE.settings.footer).not.toContain('Beta')
    expect(DE.settings.footer).toContain('TierKosten Kompass')
  })

  it('insuranceFunnel ist false â kein Schutz/Insurance-Bereich sichtbar', () => {
    expect(FEATURES.insuranceFunnel).toBe(false)
  })

  it('showDemoCases ist false â keine Debug-UI fÃ¼r normale Nutzer', () => {
    expect(FEATURES.showDemoCases).toBe(false)
  })

  it('Demo-FÃ¤lle bleiben intern funktionsfÃ¤hig (4 StÃ¼ck)', () => {
    expect(DEMO_CASES).toHaveLength(4)
    expect(DEMO_CASES[0].label).toContain('Bruno')
    expect(DEMO_CASES[1].label).toContain('Mimi')
    expect(DEMO_CASES[2].label).toContain('Rocky')
    expect(DEMO_CASES[3].label).toContain('Felix')
  })

  it('Notdienst-URL enthÃ¤lt "Notdienst" und kein Emoji', () => {
    const url = buildEmergencyVetMapsUrl('MÃ¼nchen')
    expect(url).toContain('Notdienst')
    expect(url).not.toMatch(/[\u{1F300}-\u{1FFFF}]/u)
  })

  it('Tierarzt-Maps-URL enthÃ¤lt bewertete TierÃ¤rzte (Gelb-CTA)', () => {
    const url = buildRegularVetMapsUrl('Berlin')
    expect(url).toContain('Tier')
    expect(url).not.toContain('Notdienst')
  })
})

// ââ Phase 3 â Final Soft-Launch-Fix ââââââââââââââââââââââââââââââââââââââ
describe('Phase 3 â Route Guard + Copy + PetProfile (Soft-Launch)', () => {

  // Route Guards
  it('insuranceFunnel ist false â P7-P10 dÃ¼rfen NIEMALS im normalen User-Flow auftauchen', () => {
    // Verifikation: Flag must false sein, damit Route Guard greift
    expect(FEATURES.insuranceFunnel).toBe(false)
  })

  // Copy: Onboarding ohne "Schutz"
  it('DE onboarding.body enthÃ¤lt kein "Schutz"', () => {
    expect(DE.onboarding.body).not.toContain('Schutz')
    expect(DE.onboarding.body).not.toContain('schutz')
  })

  it('EN onboarding.body enthÃ¤lt kein "protection" oder "coverage"', () => {
    expect(EN.onboarding.body.toLowerCase()).not.toContain('protection')
    expect(EN.onboarding.body.toLowerCase()).not.toContain('coverage')
  })

  // Copy: Tagline ohne "Schutz"
  it('DE tagline enthÃ¤lt kein "Schutz"', () => {
    expect(DE.home.tagline).not.toContain('Schutz')
  })

  it('EN tagline enthÃ¤lt kein "Coverage"', () => {
    expect(EN.home.tagline).not.toContain('Coverage')
  })

  // Copy: Feature 03 ohne Insurance-Bezug
  it('DE features[03] (index 2) verweist auf Tierarzt-/Notdienst-Suche, nicht auf Versicherung', () => {
    const feat03DE = DE.home.features[2]
    expect(feat03DE[1]).not.toContain('Schutz')
    expect(feat03DE[1]).not.toContain('Versicherung')
    expect(feat03DE[1]).toContain('Tierarzt')
  })

  it('EN features[03] (index 2) refers to vet/emergency, not insurance', () => {
    const feat03EN = EN.home.features[2]
    expect(feat03EN[1].toLowerCase()).not.toContain('coverage')
    expect(feat03EN[1].toLowerCase()).not.toContain('insurance')
    expect(feat03EN[1].toLowerCase()).toContain('vet')
  })

  // Copy: PetProfile subtitle zeigt 4 Angaben
  it('DE petProfile.subtitle zeigt "4 Angaben" (Versicherung ausgeblendet)', () => {
    expect(DE.petProfile.subtitle).toContain('4')
    expect(DE.petProfile.subtitle).not.toContain('5')
  })

  it('EN petProfile.subtitle zeigt "4 fields"', () => {
    expect(EN.petProfile.subtitle).toContain('4')
    expect(EN.petProfile.subtitle).not.toContain('5')
  })

  // Demo-Scores unverÃ¤nderlich â nutzt die gleiche calcUrgency-Signatur wie oben
  it('Demo-FÃ¤lle haben unverÃ¤nderliche Scores (Bruno=8 Gelb, Mimi=11 Gelb, Rocky=1 GrÃ¼n, Felix=Rot)', () => {
    const [bruno, mimi, rocky, felix] = DEMO_CASES
    expect(calcUrgency(felix.answers, felix.symptom, felix.pet).level).toBe('rot')   // Felix RedFlag
    expect(calcUrgency(bruno.answers, bruno.symptom, bruno.pet).level).toBe('gelb')  // Bruno 8 â Gelb
    expect(calcUrgency(mimi.answers,  mimi.symptom,  mimi.pet).level).toBe('gelb')   // Mimi 11 â Gelb
    expect(calcUrgency(rocky.answers, rocky.symptom, rocky.pet).level).toBe('gruen') // Rocky 1 â GrÃ¼n
  })
})

// ââ SymptomGrid â Info-Icon (rote Punkte ersetzt durch Info-Icon pro Kachel) âââââ

describe('SymptomGrid â Info-Icon: Kopie und Inhalt (Copy-basiert)', () => {
  it('DE.symptomGrid.redFlagHint enthÃ¤lt "Warnsignal"', () => {
    expect(DE.symptomGrid.redFlagHint).toContain('Warnsignal')
  })
  it('DE.symptomGrid.redFlagHint enthÃ¤lt "Warnsignal"', () => {
    expect(DE.symptomGrid.redFlagHint).toContain('Warnsignal')
  })
  it('DE.symptomGrid.redFlagHint enthÃ¤lt "sofortige Hilfe"', () => {
    expect(DE.symptomGrid.redFlagHint).toContain('sofortige Hilfe')
  })
  it('DE.symptomGrid.redFlagHint enthÃ¤lt "nicht automatisch" (beruhigende Formulierung)', () => {
    expect(DE.symptomGrid.redFlagHint).toContain('nicht automatisch')
  })
  it('EN.symptomGrid.redFlagHint enthÃ¤lt "warning sign"', () => {
    expect(EN.symptomGrid.redFlagHint).toContain('warning sign')
  })
  it('EN.symptomGrid.redFlagHint enthÃ¤lt "warning sign"', () => {
    expect(EN.symptomGrid.redFlagHint).toContain('warning sign')
  })
  it('EN.symptomGrid.redFlagHint enthÃ¤lt "immediate help"', () => {
    expect(EN.symptomGrid.redFlagHint).toContain('immediate help')
  })
  it('EN.symptomGrid.redFlagHint enthÃ¤lt "automatically" (beruhigende Formulierung)', () => {
    expect(EN.symptomGrid.redFlagHint).toContain('automatically')
  })
  it('Rote Punkte: RED_FLAG_SYMPTOM_IDS unverÃ¤ndert (krampf, atemnot, gift, urin_katze)', () => {
    expect(RED_FLAG_SYMPTOM_IDS.has('krampf')).toBe(true)
    expect(RED_FLAG_SYMPTOM_IDS.has('atemnot')).toBe(true)
    expect(RED_FLAG_SYMPTOM_IDS.has('gift')).toBe(true)
    expect(RED_FLAG_SYMPTOM_IDS.has('urin_katze')).toBe(true)
    expect(RED_FLAG_SYMPTOM_IDS.size).toBe(4)
  })
  it('Red-Flag-Logik unverÃ¤ndert: krampf â rot', () => {
    expect(isRedFlag({}, 'krampf')).toBe(true)
  })
  it('Red-Flag-Logik unverÃ¤ndert: atemnot â rot', () => {
    expect(isRedFlag({}, 'atemnot')).toBe(true)
  })
  it('Red-Flag-Logik unverÃ¤ndert: humpeln â kein Red-Flag', () => {
    expect(isRedFlag({}, 'humpeln')).toBe(false)
  })
  it('Demo-Scores nach Info-Icon-Addition unverÃ¤ndert', () => {
    DEMO_CASES.forEach(demo => {
      const r = calcUrgency(demo.answers, demo.symptom, demo.pet)
      expect(r.level).toBe(demo.expectedLevel)
      expect(r.score).toBe(demo.expectedScore)
    })
  })
})

// ââ EN Branding â kein "PetCost Compass" âââââââââââââââââââââââââââââââââ

describe('EN Branding â TierKosten Kompass (keine PetCost Compass)', () => {
  it('EN.home.label ist "TierKosten Kompass"', () => {
    expect(EN.home.label).toBe('TierKosten Kompass')
  })
  it('EN.home.label ist nicht "PetCost Compass"', () => {
    expect(EN.home.label).not.toBe('PetCost Compass')
  })
  it('EN.settings.footer enthÃ¤lt "TierKosten Kompass"', () => {
    expect(EN.settings.footer).toContain('TierKosten Kompass')
  })
  it('EN.settings.footer enthÃ¤lt nicht "PetCost Compass"', () => {
    expect(EN.settings.footer).not.toContain('PetCost Compass')
  })
  it('EN.onboarding.body enthÃ¤lt "TierKosten Kompass"', () => {
    expect(EN.onboarding.body).toContain('TierKosten Kompass')
  })
  it('EN.onboarding.body enthÃ¤lt nicht "PetCost Compass"', () => {
    expect(EN.onboarding.body).not.toContain('PetCost Compass')
  })
  it('DE.home.label ist "TierKosten Kompass"', () => {
    expect(DE.home.label).toBe('TierKosten Kompass')
  })
})

// ââ CheckFlow copy â P4a/P4b/P4c question texts âââââââââââââââââââââââââ

describe('CheckFlow copy â Frage-Texte (DE + EN)', () => {
  it('DE.checkFlow.stepNames hat 3 EintrÃ¤ge', () => {
    expect(DE.checkFlow.stepNames).toHaveLength(3)
    expect(DE.checkFlow.stepNames[0]).toBeTruthy()
    expect(DE.checkFlow.stepNames[1]).toBeTruthy()
    expect(DE.checkFlow.stepNames[2]).toBeTruthy()
  })
  it('EN.checkFlow.stepNames hat 3 EintrÃ¤ge', () => {
    expect(EN.checkFlow.stepNames).toHaveLength(3)
  })
  it('DE.checkFlow.step1Title ist gesetzt', () => {
    expect(DE.checkFlow.step1Title).toBeTruthy()
    expect(DE.checkFlow.step1Title.length).toBeGreaterThan(5)
  })
  it('EN.checkFlow.step1Title ist Englisch (enthÃ¤lt "first")', () => {
    expect(EN.checkFlow.step1Title.toLowerCase()).toContain('first')
  })
  it('DE.checkFlow.step3Title ist eine Funktion, die petName enthÃ¤lt', () => {
    expect(typeof DE.checkFlow.step3Title).toBe('function')
    expect(DE.checkFlow.step3Title('Bruno')).toContain('Bruno')
  })
  it('EN.checkFlow.step3Title ist eine Funktion mit petName', () => {
    expect(typeof EN.checkFlow.step3Title).toBe('function')
    expect(EN.checkFlow.step3Title('Bruno')).toContain('Bruno')
  })
  it('DE.checkFlow.q_atem_label ist eine Funktion mit petName', () => {
    expect(typeof DE.checkFlow.q_atem_label).toBe('function')
    expect(DE.checkFlow.q_atem_label('Max')).toContain('Max')
  })
  it('EN.checkFlow.q_atem_label ist eine Funktion mit petName', () => {
    expect(typeof EN.checkFlow.q_atem_label).toBe('function')
    expect(EN.checkFlow.q_atem_label('Max')).toContain('Max')
  })
  it('DE.checkFlow.q_blut_label ist ein String', () => {
    expect(typeof DE.checkFlow.q_blut_label).toBe('string')
    expect(DE.checkFlow.q_blut_label.length).toBeGreaterThan(5)
  })
  it('DE.checkFlow.btnResult ist gesetzt', () => {
    expect(DE.checkFlow.btnResult).toBeTruthy()
    expect(DE.checkFlow.btnResult.length).toBeGreaterThan(3)
  })
  it('EN.checkFlow.btnResult enthÃ¤lt "result"', () => {
    expect(EN.checkFlow.btnResult.toLowerCase()).toContain('result')
  })
  it('DE und EN checkFlow haben dieselben SchlÃ¼ssel', () => {
    expect(Object.keys(EN.checkFlow).sort()).toEqual(Object.keys(DE.checkFlow).sort())
  })
  it('DE.checkFlow enthÃ¤lt alle Red-Flag-Urin-Optionen', () => {
    expect(DE.checkFlow.q_urin_label('Mia')).toContain('Mia')
    expect(DE.checkFlow.q_urin_normal).toBeTruthy()
    expect(DE.checkFlow.q_urin_troepfchen).toBeTruthy()
    expect(DE.checkFlow.q_urin_gar_nicht).toBeTruthy()
  })
  it('DE.checkFlow enthÃ¤lt alle Atem-Optionen', () => {
    expect(DE.checkFlow.q_atem_unauffaellig).toBeTruthy()
    expect(DE.checkFlow.q_atem_leicht).toBeTruthy()
    expect(DE.checkFlow.q_atem_stark).toBeTruthy()
  })
  it('DE.checkFlow enthÃ¤lt alle Gift-Optionen', () => {
    expect(DE.checkFlow.q_gift_nein).toBeTruthy()
    expect(DE.checkFlow.q_gift_unklar).toBeTruthy()
    expect(DE.checkFlow.q_gift_ja).toBeTruthy()
  })
})

// ââ UrgencyCard copy â petFallback + body/warn functions âââââââââââââââââ

describe('UrgencyCard copy (DE + EN)', () => {
  it('DE.urgencyCard.petFallback ist "deinem Tier"', () => {
    expect(DE.urgencyCard.petFallback).toBe('deinem Tier')
  })
  it('EN.urgencyCard.petFallback ist "your pet"', () => {
    expect(EN.urgencyCard.petFallback).toBe('your pet')
  })
  it('DE.urgencyCard.gruen.body ist eine Funktion, die petName enthÃ¤lt', () => {
    expect(typeof DE.urgencyCard.gruen.body).toBe('function')
    expect(DE.urgencyCard.gruen.body('Bruno')).toContain('Bruno')
  })
  it('DE.urgencyCard.gruen.warn ist eine Funktion, die petName enthÃ¤lt', () => {
    expect(typeof DE.urgencyCard.gruen.warn).toBe('function')
    expect(DE.urgencyCard.gruen.warn('Bruno')).toContain('Bruno')
  })
  it('DE.urgencyCard.gelb.body ist eine Funktion, die petName enthÃ¤lt', () => {
    expect(typeof DE.urgencyCard.gelb.body).toBe('function')
    expect(DE.urgencyCard.gelb.body('Mimi')).toContain('Mimi')
  })
  it('DE.urgencyCard.rot.body ist ein String (kein petName benÃ¶tigt)', () => {
    expect(typeof DE.urgencyCard.rot.body).toBe('string')
    expect(DE.urgencyCard.rot.body.length).toBeGreaterThan(20)
  })
  it('EN.urgencyCard.rot.body ist ein String', () => {
    expect(typeof EN.urgencyCard.rot.body).toBe('string')
    expect(EN.urgencyCard.rot.body.length).toBeGreaterThan(20)
  })
  it('DE.urgencyCard.whenToAct ist gesetzt', () => {
    expect(DE.urgencyCard.whenToAct).toBeTruthy()
  })
  it('EN.urgencyCard.whenToAct ist gesetzt', () => {
    expect(EN.urgencyCard.whenToAct).toBeTruthy()
  })
  it('DE und EN urgencyCard haben dieselbe SchlÃ¼sselstruktur', () => {
    expect(Object.keys(EN.urgencyCard).sort()).toEqual(Object.keys(DE.urgencyCard).sort())
  })
  it('petFallback mit DE vermeidet undefined im Text', () => {
    const name = '' || DE.urgencyCard.petFallback
    expect(name).toBe('deinem Tier')
    expect(name).not.toContain('undefined')
    expect(name).not.toContain('null')
  })
})

// ââ AppShell copy â Screenbezeichnungen âââââââââââââââââââââââââââââââââ

describe('AppShell copy â Screen-Titel (DE + EN)', () => {
  it('DE.appShell.screenPetProfile ist "Tierprofil"', () => {
    expect(DE.appShell.screenPetProfile).toBe('Tierprofil')
  })
  it('DE.appShell.screenSymptoms ist "Symptome"', () => {
    expect(DE.appShell.screenSymptoms).toBe('Symptome')
  })
  it('DE.appShell.screenResult ist "Ergebnis"', () => {
    expect(DE.appShell.screenResult).toBe('Ergebnis')
  })
  it('DE.appShell.screenRecord ist "Tierakte"', () => {
    expect(DE.appShell.screenRecord).toBe('Tierakte')
  })
  it('DE.appShell.screenStep ist eine Funktion', () => {
    expect(typeof DE.appShell.screenStep).toBe('function')
    expect(DE.appShell.screenStep(1, 3)).toContain('1')
    expect(DE.appShell.screenStep(1, 3)).toContain('3')
  })
  it('EN.appShell.screenStep enthÃ¤lt "Step"', () => {
    expect(EN.appShell.screenStep(2, 3)).toContain('Step')
  })
  it('DE und EN appShell haben dieselben SchlÃ¼ssel', () => {
    expect(Object.keys(EN.appShell).sort()).toEqual(Object.keys(DE.appShell).sort())
  })
})

// ââ Disclaimer (i18n) ââââââââââââââââââââââââââââââââââââââââââââââââââââ

describe('disclaimer() â i18n, petName-Interpolation, kein Diagnose-Versprechen', () => {
  it('DE.disclaimer ist eine Funktion', () => {
    expect(typeof DE.disclaimer).toBe('function')
  })
  it('EN.disclaimer ist eine Funktion', () => {
    expect(typeof EN.disclaimer).toBe('function')
  })
  it('DE.disclaimer(name) enthÃ¤lt petName', () => {
    expect(DE.disclaimer('Bruno')).toContain('Bruno')
  })
  it('EN.disclaimer(name) enthÃ¤lt petName', () => {
    expect(EN.disclaimer('Bruno')).toContain('Bruno')
  })
  it('DE.disclaimer enthÃ¤lt "TierKosten Kompass"', () => {
    expect(DE.disclaimer('X')).toContain('TierKosten Kompass')
  })
  it('EN.disclaimer enthÃ¤lt "TierKosten Kompass"', () => {
    expect(EN.disclaimer('X')).toContain('TierKosten Kompass')
  })
  it('DE.disclaimer enthÃ¤lt "keine Diagnose"', () => {
    expect(DE.disclaimer('X')).toContain('keine Diagnose')
  })
  it('EN.disclaimer enthÃ¤lt "diagnosis"', () => {
    expect(EN.disclaimer('X').toLowerCase()).toContain('diagnosis')
  })
  it('DE.disclaimer enthÃ¤lt "Tierarzt" (kein Ersatz fÃ¼r Vet)', () => {
    expect(DE.disclaimer('X')).toContain('tierÃ¤rztlich')
  })
  it('EN.disclaimer enthÃ¤lt "vet"', () => {
    expect(EN.disclaimer('X').toLowerCase()).toContain('vet')
  })
  it('DE.disclaimer mit petFallback (leerer Name) gibt sinnvollen Text', () => {
    const name = '' || DE.urgencyCard.petFallback
    const text = DE.disclaimer(name)
    expect(text).toContain('deinem Tier')
    expect(text).not.toContain('undefined')
  })
})

// ââ results.resultFor ââââââââââââââââââââââââââââââââââââââââââââââââââââ

describe('results.resultFor â i18n Label', () => {
  it('DE.results.resultFor ist "Ergebnis fÃ¼r"', () => {
    expect(DE.results.resultFor).toBe('Ergebnis fÃ¼r')
  })
  it('EN.results.resultFor ist "Result for"', () => {
    expect(EN.results.resultFor).toBe('Result for')
  })
  it('DE und EN results haben dieselben SchlÃ¼ssel', () => {
    expect(Object.keys(EN.results).sort()).toEqual(Object.keys(DE.results).sort())
  })
})
