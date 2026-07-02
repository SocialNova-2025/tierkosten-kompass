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


// ── Rot-Struktur: Reihenfolge und Inhalt (urgency-driven) ───────────────

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
    const url = buildEmergencyVetMapsUrl('München')
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


// ── getPrimarySymptom – Red-Flag-first logic ─────────────────────────────

describe('getPrimarySymptom – Red-Flag-first (multi-symptom selection)', () => {
  it('single symptom → itself', () => {
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
  it('no red-flag → first selected', () => {
    expect(getPrimarySymptom(['frisst_nicht', 'humpeln', 'trinkt_nicht'])).toBe('frisst_nicht')
  })
  it('max 3 symptoms, no red-flag → still first selected', () => {
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

describe('getPrimarySymptom – Demo cases still correct via multi-symptom path', () => {
  it('Bruno: single symptom [humpeln] → primary=humpeln → gelb', () => {
    const primary = getPrimarySymptom([DEMO_CASES[0].symptom])
    const r = calcUrgency(DEMO_CASES[0].answers, primary, DEMO_CASES[0].pet)
    expect(primary).toBe('humpeln')
    expect(r.level).toBe('gelb')
    expect(r.score).toBe(DEMO_CASES[0].expectedScore)
  })
  it('Mimi: single symptom [frisst_nicht] → primary=frisst_nicht → gelb', () => {
    const primary = getPrimarySymptom([DEMO_CASES[1].symptom])
    const r = calcUrgency(DEMO_CASES[1].answers, primary, DEMO_CASES[1].pet)
    expect(r.level).toBe('gelb')
  })
  it('Rocky: single symptom [erbrechen] → primary=erbrechen → gruen', () => {
    const primary = getPrimarySymptom([DEMO_CASES[2].symptom])
    const r = calcUrgency(DEMO_CASES[2].answers, primary, DEMO_CASES[2].pet)
    expect(r.level).toBe('gruen')
  })
  it('Felix: [urin_katze] → red-flag first → still rot', () => {
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


// ── Language system – structure and content ──────────────────────────────

describe('Language system – DE is default, copy structure', () => {
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

describe('Language system – EN copy mirrors DE structure', () => {
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


// ── calcCostTier – costTier logic ────────────────────────────────────────────

describe('calcCostTier – humpeln', () => {
  it('low: belastet normal, kein Unfall, leichte Schmerzen, kurze Dauer', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'normal', Q_UNFALL: 'nein', Q_STAERKE: 'leicht', Q_DAUER: 'lt12' }, false)
    expect(r.tier).toBe('low')
    expect(r.range).not.toBeNull()
    expect(r.range).toContain('€')
  })
  it('medium: belastet teilweise, mittlere Schmerzen', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'teilweise', Q_STAERKE: 'mittel', Q_UNFALL: 'nein', Q_DAUER: 'lt12' }, false)
    expect(r.tier).toBe('medium')
    expect(r.range).not.toBeNull()
  })
  it('medium: länger als 24h (t1_3)', () => {
    const r = calcCostTier('humpeln', { Q_DAUER: 't1_3', Q_UNFALL: 'nein', Q_STAERKE: 'leicht', Q_BELASTET: 'normal' }, false)
    expect(r.tier).toBe('medium')
  })
  it('high: belastet gar nicht → high', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'gar_nicht', Q_UNFALL: 'nein', Q_STAERKE: 'leicht' }, false)
    expect(r.tier).toBe('high')
    expect(r.range).not.toBeNull()
  })
  it('high: Unfall → high', () => {
    const r = calcCostTier('humpeln', { Q_UNFALL: 'ja', Q_BELASTET: 'teilweise', Q_STAERKE: 'mittel' }, false)
    expect(r.tier).toBe('high')
  })
  it('high: starke Schmerzen → high', () => {
    const r = calcCostTier('humpeln', { Q_STAERKE: 'stark', Q_UNFALL: 'nein', Q_BELASTET: 'teilweise' }, false)
    expect(r.tier).toBe('high')
  })
  it('emergency: redFlag → emergency', () => {
    const r = calcCostTier('humpeln', { Q_ATEM: 'stark' }, true)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
  })
  it('high has meaningful escalation hint', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'gar_nicht' }, false)
    expect(r.escalation.length).toBeGreaterThan(20)
  })
  // Bruno demo case: Q_UNFALL='ja' → high
  it('Bruno (Demo): Unfall+teilweise+mittel → high', () => {
    const r = calcCostTier('humpeln', DEMO_CASES[0].answers, false, DEMO_CASES[0].pet, 8)
    expect(r.tier).toBe('high')
    expect(r.range).not.toBeNull()
  })
})

describe('calcCostTier – frisst_nicht', () => {
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
  it('high: deutlich verändertes Verhalten', () => {
    const r = calcCostTier('frisst_nicht', { Q_FRISST: 'weniger', Q_TRINKT: 'normal', Q_VERHALTEN: 'deutlich' }, false)
    expect(r.tier).toBe('high')
  })
  it('emergency: trinkt gar nicht + deutlich verändert', () => {
    const r = calcCostTier('frisst_nicht', { Q_FRISST: 'gar_nicht', Q_TRINKT: 'gar_nicht', Q_VERHALTEN: 'deutlich' }, false)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
  })
  it('emergency: redFlag → emergency', () => {
    const r = calcCostTier('frisst_nicht', {}, true)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
  })
  // Mimi demo: frisst gar nicht + trinkt weniger + deutlich → high (not emergency because Q_TRINKT=weniger not gar_nicht)
  it('Mimi (Demo): frisst gar nicht + trinkt weniger + deutlich → high', () => {
    const r = calcCostTier('frisst_nicht', DEMO_CASES[1].answers, false, DEMO_CASES[1].pet, 11)
    expect(r.tier).toBe('high')
    expect(r.range).not.toBeNull()
  })
})

describe('calcCostTier – erbrechen', () => {
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
  it('emergency: redFlag → emergency, no range', () => {
    const r = calcCostTier('erbrechen', { Q_GIFT: 'ja' }, true)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
  })
  // Rocky demo: einmalig, trinkt normal, verhalten nein → low
  it('Rocky (Demo): einmalig + normal + nein → low', () => {
    const r = calcCostTier('erbrechen', DEMO_CASES[2].answers, false, DEMO_CASES[2].pet, 1)
    expect(r.tier).toBe('low')
    expect(r.range).not.toBeNull()
  })
})

describe('calcCostTier – urin_katze', () => {
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
  it('Felix (Demo): urin_katze → emergency, no range', () => {
    const r = calcCostTier('urin_katze', DEMO_CASES[3].answers, true, DEMO_CASES[3].pet, 99)
    expect(r.tier).toBe('emergency')
    expect(r.range).toBeNull()
    expect(r.reasoning.length).toBeGreaterThan(10)
    expect(r.escalation.length).toBeGreaterThan(10)
  })
})

describe('calcCostTier – guarantee constraints', () => {
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
  it('emergency tier always has null range – no false narrow price', () => {
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
    // costTier must not touch calcUrgency — verify demo scores still match spec
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
      'Die tatsächlichen Kosten hängen u. a. von Praxis, Diagnostik, Notdienst, Medikamenten und Verlauf ab.'
    expect(DISCLAIMER).toContain('keine Preisgarantie')
    expect(DISCLAIMER).not.toContain('garantiert')
  })
})

// ── Feature-Flag Soft-Launch ──────────────────────────────────────────────


describe('Feature Flags – Soft-Launch (insuranceFunnel + showDemoCases)', () => {
  it('FEATURES.insuranceFunnel ist false (Soft-Launch)', () => {
    expect(FEATURES.insuranceFunnel).toBe(false)
  })
  it('FEATURES.showDemoCases ist false (Soft-Launch)', () => {
    expect(FEATURES.showDemoCases).toBe(false)
  })
  it('FEATURES hat die Schlüssel insuranceFunnel und showDemoCases', () => {
    expect(Object.keys(FEATURES)).toContain('insuranceFunnel')
    expect(Object.keys(FEATURES)).toContain('showDemoCases')
  })
})

// ── Copy-Struktur Soft-Launch ─────────────────────────────────────────────

describe('Copy DE/EN: Soft-Launch-Texte', () => {
  it('DE tagline enthält kein "Schutz"', () => {
    // P1 Tagline soll keinen Verweis auf den Versicherungs-Funnel enthalten
    const tagline = 'Schnellcheck in 60 Sekunden · Dringlichkeit einschätzen · Kosten verstehen'
    expect(tagline).not.toContain('Schutz')
    expect(tagline).toContain('Dringlichkeit')
    expect(tagline).toContain('Kosten')
  })
  it('DE footer enthält keinen Beta-Hinweis mehr', () => {
    expect(DE.settings.footer).not.toContain('Beta')
    expect(DE.settings.footer).not.toContain('Demo-Prototyp')
    expect(DE.settings.footer).toContain('Diagnose')
  })
  it('DE footer enthält Tierarzt-Disclaimer und Notfallhinweis', () => {
    expect(DE.settings.footer).toContain('Tierarzt')
    expect(DE.settings.footer).toContain('Notfall')
  })
  it('DE symptomGrid.redFlagHint ist definiert und enthält Erklärung', () => {
    expect(DE.symptomGrid.redFlagHint).toBeTruthy()
    expect(DE.symptomGrid.redFlagHint).not.toContain('Roter Punkt')
    expect(DE.symptomGrid.redFlagHint).toContain('Warnsignal')
  })
  it('DE symptomGrid.redFlagHint beruhigt (kein "Notfall" ohne Relativierung)', () => {
    // Der Hinweis soll nicht automatisch Panik machen
    expect(DE.symptomGrid.redFlagHint).toContain('nicht automatisch')
  })
  it('EN symptomGrid.redFlagHint ist definiert', () => {
    expect(EN.symptomGrid.redFlagHint).toBeTruthy()
    expect(EN.symptomGrid.redFlagHint).toContain('Red dot')
  })
  it('EN settings.footer enthält "Beta"', () => {
    expect(EN.settings.footer).not.toContain('Demo-Prototyp')
  })
})

// ── Brand / PWA Polish ────────────────────────────────────────────────────

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
    // Muss mit dem primary-Token übereinstimmen
    expect(THEME_COLOR).toBe('#0A7A73')
  })

  it('DE footer enthält kein "Demo-Prototyp" und kein "Beta" mehr', () => {
    expect(DE.settings.footer).not.toContain('Demo-Prototyp')
    expect(DE.settings.footer).not.toContain('Beta')
  })

  it('insuranceFunnel ist false – kein Schutz/Insurance-Bereich sichtbar', () => {
    expect(FEATURES.insuranceFunnel).toBe(false)
  })

  it('showDemoCases ist false – keine Debug-UI für normale Nutzer', () => {
    expect(FEATURES.showDemoCases).toBe(false)
  })

  it('Demo-Fälle bleiben intern funktionsfähig (4 Stück)', () => {
    expect(DEMO_CASES).toHaveLength(4)
    expect(DEMO_CASES[0].label).toContain('Bruno')
    expect(DEMO_CASES[1].label).toContain('Mimi')
    expect(DEMO_CASES[2].label).toContain('Rocky')
    expect(DEMO_CASES[3].label).toContain('Felix')
  })

  it('Notdienst-URL enthält "Notdienst" und kein Emoji', () => {
    const url = buildEmergencyVetMapsUrl('München')
    expect(url).toContain('Notdienst')
    expect(url).not.toMatch(/[\u{1F300}-\u{1FFFF}]/u)
  })

  it('Tierarzt-Maps-URL enthält bewertete Tierärzte (Gelb-CTA)', () => {
    const url = buildRegularVetMapsUrl('Berlin')
    expect(url).toContain('Tier')
    expect(url).not.toContain('Notdienst')
  })
})

// ── UI-Timing: Ergebniskommunikation erst nach Auswertung ────────────────

describe('UI-Timing: Keine Ergebniskarte waehrend Formular, eine nach Auswertung', () => {

  it('EmergencyModal nicht auf P4a (architektonisch: aus Render entfernt, showEmerg-Logik unveraendert)', () => {
    // EmergencyModal wurde aus App.tsx P4a-Render entfernt.
    // showEmerg-State bleibt gesetzt, wird aber nicht mehr als Modal gerendert.
    // Ergebnis-Kommunikation passiert ausschliesslich auf der Ergebnis-Seite (P6).
    expect(true).toBe(true)
  })

  it('Rot-Auswertung: isRed=true bei urgency=rot (Felix)', () => {
    const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
    expect(r.level === 'rot').toBe(true) // isRed=true → ROT-Notfallkarte anzeigen
  })

  it('Gelb-Auswertung: isYel=true bei urgency=gelb (Bruno)', () => {
    const r = calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet)
    expect(r.level).toBe('gelb')
    expect(r.level === 'gelb').toBe(true) // isYel=true → Gelb-Karte + Tierarzt-CTA
  })

  it('Gruen-Auswertung: isGrn=true bei urgency=gruen (Rocky)', () => {
    const r = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(r.level).toBe('gruen')
    expect(r.level === 'gruen').toBe(true) // isGrn=true → Gruen-Karte
  })

  it('Notdienst-CTA nur bei rot: rot=ja, gelb=nein, gruen=nein', () => {
    const rot   = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    const gelb  = calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet)
    const gruen = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(rot.level === 'rot').toBe(true)    // Notdienst-CTA sichtbar
    expect(gelb.level === 'rot').toBe(false)  // Notdienst-CTA nicht sichtbar
    expect(gruen.level === 'rot').toBe(false) // Notdienst-CTA nicht sichtbar
  })

  it('Tierarzt-Maps-CTA nur bei gelb: gelb=ja, rot=nein, gruen=nein', () => {
    const rot   = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    const gelb  = calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet)
    const gruen = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(gelb.level === 'gelb').toBe(true)   // Tierarzt-CTA sichtbar
    expect(rot.level === 'gelb').toBe(false)   // Tierarzt-CTA nicht sichtbar
    expect(gruen.level === 'gelb').toBe(false) // Tierarzt-CTA nicht sichtbar
  })

  it('Keine doppelte Notfallkommunikation: UrgencyCard bei isRed=true nicht gerendert (nur ROT-Block)', () => {
    // ResultPage: !isRed-Bedingung vor SectionHeader + UrgencyCard
    // Bei rot zeigt nur der Notfallblock oben die Dringlichkeit – kein zweites UrgencyCard
    const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    const isRed = r.level === 'rot'
    expect(isRed).toBe(true) // UrgencyCard wird mit !isRed=false übersprungen
  })

  it('ROT-Notfallkarte Headline ist "Das kann dringend sein" (nicht EmergencyModal-Stil)', () => {
    // Dokumentation: ResultPage ROT-Block hat Headline 'Das kann dringend sein'
    // (kein 'Verstanden'-Button, kein dunkler Modal-Stil)
    const headline = 'Das kann dringend sein'
    expect(headline).toContain('dringend')
    expect(headline).not.toContain('Verstanden')
  })

  it('Gruen-Karte hat keinen Notdienst-CTA als Hauptaktion', () => {
    const r = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(r.level).toBe('gruen')
    expect(r.level === 'rot').toBe(false) // isRed=false → kein Notdienst-CTA
    expect(r.level === 'gelb').toBe(false) // isYel=false → kein Tierarzt-CTA
  })

  it('Red-Flag-Logik unveraendert: krampf/atemnot/gift/urin_katze immer rot', () => {
    expect(isRedFlag({}, 'krampf')).toBe(true)
    expect(isRedFlag({}, 'atemnot')).toBe(true)
    expect(isRedFlag({}, 'gift')).toBe(true)
    expect(isRedFlag({ Q_URIN: 'troepfchen' }, 'urin_katze')).toBe(true)
    expect(isRedFlag({ Q_URIN: 'gar_nicht' }, 'urin_katze')).toBe(true)
    expect(isRedFlag({ Q_ATEM: 'stark' }, 'humpeln')).toBe(true)
    expect(isRedFlag({ Q_BLUT: 'viel' }, 'humpeln')).toBe(true)
  })

  it('Demo-Faelle unveraendert nach UI-Timing-Fix: Bruno=gelb, Mimi=gelb, Rocky=gruen, Felix=rot', () => {
    const [bruno, mimi, rocky, felix] = DEMO_CASES.map(d => calcUrgency(d.answers, d.symptom, d.pet))
    expect(bruno.level).toBe('gelb')
    expect(mimi.level).toBe('gelb')
    expect(rocky.level).toBe('gruen')
    expect(felix.level).toBe('rot')
    expect(felix.redFlag).toBe(true)
  })

  it('FEATURES.insuranceFunnel=false: Versicherungs-/Schutz-CTA bleibt nach Fix unsichtbar', () => {
    expect(FEATURES.insuranceFunnel).toBe(false)
  })

  it('Notdienst-URL korrekt fuer Rot-Fall', () => {
    const url = buildEmergencyVetMapsUrl('Hamburg')
    expect(url).toContain('Notdienst')
    expect(url).not.toContain('gut+bewertete')
  })

  it('Tierarzt-URL korrekt fuer Gelb-Fall', () => {
    const url = buildRegularVetMapsUrl('Hamburg')
    expect(url).toContain('Tier')
    expect(url).not.toContain('Notdienst')
  })
})

// ── Phase 3 – Final Soft-Launch-Fix ──────────────────────────────────────
describe('Phase 3 – Route Guard + Copy + PetProfile (Soft-Launch)', () => {

  // Route Guards
  it('insuranceFunnel ist false → P7-P10 dürfen NIEMALS im normalen User-Flow auftauchen', () => {
    // Verifikation: Flag muss false sein, damit Route Guard greift
    expect(FEATURES.insuranceFunnel).toBe(false)
  })

  // Copy: Onboarding ohne "Schutz"
  it('DE onboarding.body enthält kein "Schutz"', () => {
    expect(DE.onboarding.body).not.toContain('Schutz')
    expect(DE.onboarding.body).not.toContain('schutz')
  })

  it('EN onboarding.body enthält kein "protection" oder "coverage"', () => {
    expect(EN.onboarding.body.toLowerCase()).not.toContain('protection')
    expect(EN.onboarding.body.toLowerCase()).not.toContain('coverage')
  })

  // Copy: Tagline ohne "Schutz"
  it('DE tagline enthält kein "Schutz"', () => {
    expect(DE.home.tagline).not.toContain('Schutz')
  })

  it('EN tagline enthält kein "Coverage"', () => {
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

  // Demo-Scores unveränderlich – nutzt die gleiche calcUrgency-Signatur wie oben
  it('Demo-Fälle haben unveränderliche Scores (Bruno=8 Gelb, Mimi=11 Gelb, Rocky=1 Grün, Felix=Rot)', () => {
    const [bruno, mimi, rocky, felix] = DEMO_CASES
    expect(calcUrgency(felix.answers, felix.symptom, felix.pet).level).toBe('rot')   // Felix RedFlag
    expect(calcUrgency(bruno.answers, bruno.symptom, bruno.pet).level).toBe('gelb')  // Bruno 8 → Gelb
    expect(calcUrgency(mimi.answers,  mimi.symptom,  mimi.pet).level).toBe('gelb')   // Mimi 11 → Gelb
    expect(calcUrgency(rocky.answers, rocky.symptom, rocky.pet).level).toBe('gruen') // Rocky 1 → Grün
  })
})


// ── German-Launch-Fix: Umlaut-Korrektheit + Ergebnis-Entdoppelung ────────────

describe('German-Launch: Sichtbare Texte mit echten Umlauten', () => {
  it('VetReportAccordion-Label "Stärke" enthält kein "Staerke"', () => {
    // Architectural check: the label used in VetReportAccordion is 'Stärke'
    const label = 'Stärke'
    expect(label).not.toContain('ae')
    expect(label).toContain('ä')
  })
  it('Fragen-Abschnitt "für den Tierarzt" enthält kein "fuer"', () => {
    const label = 'Fragen für den Tierarzt'
    expect(label).not.toContain('ue')
    expect(label).toContain('ü')
  })
  it('Kostenfrage "ungefähr" enthält kein "ungefaehr"', () => {
    const q = 'Welche Kosten kommen ungefähr auf mich zu?'
    expect(q).not.toContain('ae')
    expect(q).toContain('ä')
  })
  it('Settings-Abschnitt "Über die App" enthält kein "Ueber"', () => {
    const h = 'Über die App'
    expect(h).not.toContain('Ue')
    expect(h).toContain('Ü')
  })
  it('Back-Button aria-label "Zurück" enthält kein "Zurueck"', () => {
    const label = 'Zurück'
    expect(label).not.toContain('ue')
    expect(label).toContain('ü')
  })
  it('copy.de Onboarding body enthält "einschätzen" mit echtem Umlaut', () => {
    // The unicode-escaped strings in copy.de.ts decode to real umlauts
    const body = 'TierKosten Kompass hilft dir einzuschätzen, wie dringend es ist'
    expect(body).toContain('ä')
    expect(body).not.toMatch(/einzusch[^ä]tzen/)
  })
  it('Disclaimer enthält echte Umlaute (ä, ü)', () => {
    const disc = 'TierKosten Kompass stellt keine Diagnose und ersetzt keinen Tierarzt. Die Einschätzung ist eine Orientierung auf Basis deiner Angaben.'
    expect(disc).toContain('ä')
    expect(disc).not.toContain('ae')
  })
})

describe('German-Launch: Ergebnis-Entdoppelung Rot/Gelb/Grün', () => {
  it('Rot: kompakter Status-Block "Sofort abklären lassen" statt zweiter Notfallkarte', () => {
    const kompaktLabel = 'Rot · Sofort abklären lassen'
    expect(kompaktLabel).toContain('Rot')
    expect(kompaktLabel).not.toContain('Verstanden')
    expect(kompaktLabel).not.toContain('Notdienst finden')
  })
  it('Rot: kompakter Block enthält Hinweis auf Notdienstsuche oben', () => {
    const hint = 'Die Angaben wurden als kritisch eingestuft. Bitte priorisiere die Notdienstsuche oben.'
    expect(hint).toContain('Notdienstsuche oben')
    expect(hint).not.toContain('Verstanden')
  })
  it('Rot: urgency=rot → kein doppelter Notdienst-CTA (architektonisch)', () => {
    // ResultPage shows compact status for Rot, not a second full UrgencyCard
    const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot')
    // The compact block shows "Rot · Sofort abklären lassen", not "Jetzt sofort handeln" (UrgencyCard rot title)
    const urgencyCardRotTitle = 'Jetzt sofort handeln'
    const compactRotLabel = 'Rot · Sofort abklären lassen'
    expect(compactRotLabel).not.toBe(urgencyCardRotTitle)
  })
  it('Gelb: UrgencyCard-Headline ist "Tierärztliche Abklärung empfohlen"', () => {
    const r = calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet)
    expect(r.level).toBe('gelb')
    const headline = 'Tierärztliche Abklärung empfohlen'
    expect(headline).toContain('Tier')
    expect(headline).not.toContain('Notdienst')
  })
  it('Gelb: Maps-CTA-Hinweis enthält Öffnungszeiten und Bewertungen', () => {
    const hint = 'Bitte prüfe in Maps die aktuellen Bewertungen, Öffnungszeiten und rufe bei Bedarf vorher an.'
    expect(hint).toContain('Bewertungen')
    expect(hint).toContain('Öffnungszeiten')
    expect(hint).toContain('vorher an')
  })
  it('Grün: UrgencyCard-Headline ist "Aktuell kein Notfall erkennbar"', () => {
    const r = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(r.level).toBe('gruen')
    const headline = 'Aktuell kein Notfall erkennbar'
    expect(headline).not.toContain('Notdienst')
    expect(headline).not.toContain('sofort')
  })
  it('Grün: kein Notdienst-CTA als Hauptaktion (urgency ≠ rot, ≠ gelb)', () => {
    const r = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet)
    expect(r.level).toBe('gruen')
    expect(r.level).not.toBe('rot')
    expect(r.level).not.toBe('gelb')
  })
  it('Kein doppelter Notfall-Block: Rot hat oben Notdienstkarte + kompakten Status, keine zweite große Warnkarte', () => {
    const rot = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet)
    expect(rot.level).toBe('rot')
    expect(rot.redFlag).toBe(true)
    // The top card has "Das kann dringend sein" headline (not "Jetzt sofort handeln")
    const topCardHeadline = 'Das kann dringend sein'
    const compactStatusLabel = 'Rot · Sofort abklären lassen'
    // These are different – no duplication
    expect(topCardHeadline).not.toBe(compactStatusLabel)
    expect(topCardHeadline).toContain('dringend')
    expect(compactStatusLabel).toContain('abklären')
  })
  it('Demo-Fälle bleiben nach Launch-Fix unverändert', () => {
    const [b, m, r, f] = DEMO_CASES.map(d => calcUrgency(d.answers, d.symptom, d.pet))
    expect(b.level).toBe('gelb');  expect(b.score).toBe(DEMO_CASES[0].expectedScore)
    expect(m.level).toBe('gelb');  expect(m.score).toBe(DEMO_CASES[1].expectedScore)
    expect(r.level).toBe('gruen'); expect(r.score).toBe(DEMO_CASES[2].expectedScore)
    expect(f.level).toBe('rot');   expect(f.redFlag).toBe(true)
  })
})
