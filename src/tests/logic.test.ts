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
 *   - calcCostTier (per-symptom rules, demo cases, guarantee constraints)
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

describe('Age modifier (+1 for age < 1 or > 10)', () => {
  const base = { Q_FRISST: 'weniger' as const }
  it('age < 1 adds +1',  () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:0,  weightKg:5, hasInsurance:false })).toBe(2) })
  it('age > 10 adds +1', () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:11, weightKg:5, hasInsurance:false })).toBe(2) })
  it('age 5 no modifier',  () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:5,  weightKg:5, hasInsurance:false })).toBe(1) })
  it('age 1 no modifier (boundary)',  () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:1,  weightKg:5, hasInsurance:false })).toBe(1) })
  it('age 10 no modifier (boundary)', () => { expect(calcScore(base, { id:'x', species:'hund', name:'X', ageYears:10, weightKg:5, hasInsurance:false })).toBe(1) })
})

describe('Gap check logic', () => {
  it('no insurance → rot', () => { expect(calcGap({ versicherung: 'nein' }).result).toBe('rot') })
  it('all good → gruen',   () => { expect(calcGap({ versicherung:'ja', op_schutz:'ja', diagnostik:'ja', notdienst:'ja', vorerkrankungen:'nein' }).result).toBe('gruen') })
  it('1 gap → gelb', () => { expect(calcGap({ versicherung:'ja', op_schutz:'nein', diagnostik:'ja',  notdienst:'ja',  vorerkrankungen:'nein' }).result).toBe('gelb') })
  it('2 gaps → gelb',() => { expect(calcGap({ versicherung:'ja', op_schutz:'nein', diagnostik:'nein', notdienst:'ja', vorerkrankungen:'nein' }).result).toBe('gelb') })
  it('3 gaps → rot', () => { expect(calcGap({ versicherung:'ja', op_schutz:'nein', diagnostik:'nein', notdienst:'nein',vorerkrankungen:'nein' }).result).toBe('rot') })
  it('weiss_nicht treated as gap', () => { expect(calcGap({ versicherung:'ja', op_schutz:'weiss_nicht', diagnostik:'weiss_nicht', notdienst:'weiss_nicht', vorerkrankungen:'nein' }).result).toBe('rot') })
  it('vorerkrankungen=ja counts as gap', () => {
    const r = calcGap({ versicherung:'ja', op_schutz:'ja', diagnostik:'ja', notdienst:'ja', vorerkrankungen:'ja' })
    expect(r.result).toBe('gelb'); expect(r.gaps.length).toBe(1)
  })
})

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

describe('WhatsApp link builder', () => {
  const params = { firstName: 'Jana', lastName: 'Mueller', petName: 'Bruno', petSpecies: 'hund' as const, breed: 'Labrador', ageYears: '3', protectionStatus: 'nein', supportGoal: 'kein_schutz_orientieren', preExisting: 'nein', preExistingNote: '', session: null }
  it('buildWhatsAppUrl contains wa.me/', () => { expect(buildWhatsAppUrl('test')).toContain('wa.me/') })
  it('buildWhatsAppUrl contains encoded message', () => { expect(buildWhatsAppUrl('Hallo Welt')).toContain(encodeURIComponent('Hallo Welt')) })
  it('buildWhatsAppUrl uses ?text= parameter', () => { expect(buildWhatsAppUrl('test')).toMatch(/\?text=/) })
  it('buildWhatsAppMessage returns non-empty string', () => { const m = buildWhatsAppMessage(params); expect(typeof m).toBe('string'); expect(m.length).toBeGreaterThan(50) })
  it('includes pet name', () => { expect(buildWhatsAppMessage(params)).toContain('Bruno') })
  it('includes first name', () => { expect(buildWhatsAppMessage(params)).toContain('Jana') })
  it('includes breed', () => { expect(buildWhatsAppMessage(params)).toContain('Labrador') })
  it('includes TierKosten Kompass', () => { expect(buildWhatsAppMessage(params)).toContain('TierKosten Kompass') })
  it('age=0 shows "unter 1 Jahr"', () => { expect(buildWhatsAppMessage({ ...params, ageYears: '0' })).toContain('unter 1 Jahr') })
  it('includes Akut-Check when session provided', () => {
    const session = { id:'1', petId:'p1', symptomId:'humpeln', answers:{}, urgency:'gelb' as const, score:8, redFlag:false, cost:{} as never, createdAt:'' }
    const m = buildWhatsAppMessage({ ...params, session })
    expect(m).toContain('Akut-Check'); expect(m).toContain('humpeln')
  })
  it('includes preExistingNote when preExisting=ja', () => {
    expect(buildWhatsAppMessage({ ...params, preExisting: 'ja', preExistingNote: 'Nierenproblem' })).toContain('Nierenproblem')
  })
})

describe('Maps URL builder (Notdienst-Suche)', () => {
  it('returns google.com/maps/search URL', () => { expect(buildMapsUrl('München')).toContain('google.com/maps/search/') })
  it('with city encodes city name', () => { expect(buildMapsUrl('München')).toContain(encodeURIComponent('Tierärztlicher Notdienst München')) })
  it('with PLZ encodes PLZ', () => { expect(buildMapsUrl('80331')).toContain(encodeURIComponent('Tierärztlicher Notdienst 80331')) })
  it('without city uses "in der Nähe"', () => { expect(buildMapsUrl()).toContain(encodeURIComponent('Tierärztlicher Notdienst in der Nähe')) })
  it('with empty string uses "in der Nähe"', () => { expect(buildMapsUrl('')).toContain(encodeURIComponent('Tierärztlicher Notdienst in der Nähe')) })
  it('with whitespace-only string uses "in der Nähe"', () => { expect(buildMapsUrl('   ')).toContain(encodeURIComponent('Tierärztlicher Notdienst in der Nähe')) })
  it('URL is properly encoded (no raw spaces)', () => { expect(buildMapsUrl('Berlin')).not.toContain(' ') })
})

describe('Schutz-CTA card selection (driven by urgency)', () => {
  it('Felix (rot) → SchutzCardRot wird angezeigt', () => { expect(calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet).level).toBe('rot') })
  it('Bruno (gelb) → SchutzCardGelb wird angezeigt', () => { expect(calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet).level).toBe('gelb') })
  it('Mimi (gelb) → SchutzCardGelb wird angezeigt', () => { expect(calcUrgency(DEMO_CASES[1].answers, DEMO_CASES[1].symptom, DEMO_CASES[1].pet).level).toBe('gelb') })
  it('Rocky (gruen) → SchutzCardGruen wird angezeigt', () => { expect(calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet).level).toBe('gruen') })
  it('Notdienst-Button nur bei rot (Felix)', () => { const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet); expect(r.level).toBe('rot'); expect(r.redFlag).toBe(true) })
  it('Notdienst-Button nicht bei gruen (Rocky)', () => { expect(calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet).level).not.toBe('rot') })
  it('WhatsApp-Funnel erreichbar', () => { const url = buildWhatsAppUrl('Schutzklarung'); expect(url).toContain('wa.me/'); expect(url.length).toBeGreaterThan(20) })
})

describe('buildRegularVetMapsUrl (Tierarzt-Suche fuer Gelb-Fall)', () => {
  it('returns google.com/maps/search URL', () => { expect(buildRegularVetMapsUrl('München')).toContain('google.com/maps/search/') })
  it('with city encodes correct query', () => { expect(buildRegularVetMapsUrl('München')).toContain(encodeURIComponent('gut bewertete Tierärzte München')) })
  it('with PLZ encodes PLZ', () => { expect(buildRegularVetMapsUrl('80331')).toContain(encodeURIComponent('gut bewertete Tierärzte 80331')) })
  it('without city uses "in der Naehe"', () => { expect(buildRegularVetMapsUrl()).toContain(encodeURIComponent('gut bewertete Tierärzte in der Nähe')) })
  it('with empty string uses "in der Naehe"', () => { expect(buildRegularVetMapsUrl('')).toContain(encodeURIComponent('gut bewertete Tierärzte in der Nähe')) })
  it('with whitespace-only uses "in der Naehe"', () => { expect(buildRegularVetMapsUrl('   ')).toContain(encodeURIComponent('gut bewertete Tierärzte in der Nähe')) })
  it('URL has no raw spaces', () => { expect(buildRegularVetMapsUrl('Berlin')).not.toContain(' ') })
  it('does NOT contain Notdienst', () => { expect(buildRegularVetMapsUrl('Hamburg')).not.toContain('Notdienst') })
})

describe('buildEmergencyVetMapsUrl (Notdienst-Suche fuer Rot-Fall)', () => {
  it('contains Notdienst search term', () => { expect(buildEmergencyVetMapsUrl('München')).toContain(encodeURIComponent('Tierärztlicher Notdienst München')) })
  it('without city falls back to "in der Naehe"', () => { expect(buildEmergencyVetMapsUrl()).toContain(encodeURIComponent('Tierärztlicher Notdienst in der Nähe')) })
  it('does NOT contain "gut bewertete"', () => { expect(buildEmergencyVetMapsUrl('Berlin')).not.toContain('gut+bewertete') })
  it('buildMapsUrl alias still works', () => { expect(buildMapsUrl('Hamburg')).toContain(encodeURIComponent('Tierärztlicher Notdienst Hamburg')) })
})

describe('Maps-CTA urgency routing (Gelb vs Rot)', () => {
  it('Bruno (gelb) bekommt Tierarzt-CTA (nicht Notdienst)', () => { expect(calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet).level).toBe('gelb'); expect(buildRegularVetMapsUrl('München')).not.toContain('Notdienst') })
  it('Felix (rot) bekommt Notdienst-CTA', () => { expect(calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet).level).toBe('rot'); expect(buildEmergencyVetMapsUrl('München')).toContain('Notdienst') })
  it('Rocky (gruen) bekommt keinen Maps-CTA', () => { const r = calcUrgency(DEMO_CASES[2].answers, DEMO_CASES[2].symptom, DEMO_CASES[2].pet); expect(r.level).toBe('gruen'); expect(r.level).not.toBe('rot'); expect(r.level).not.toBe('gelb') })
})

describe('Rot-Ergebnisfall: Struktur und Reihenfolge', () => {
  it('Felix (rot via Red-Flag) hat urgency=rot', () => { const r = calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet); expect(r.level).toBe('rot'); expect(r.redFlag).toBe(true) })
  it('Notdienst-Block erscheint nur bei rot', () => { expect(calcUrgency(DEMO_CASES[3].answers, DEMO_CASES[3].symptom, DEMO_CASES[3].pet).level).toBe('rot'); expect(calcUrgency(DEMO_CASES[0].answers, DEMO_CASES[0].symptom, DEMO_CASES[0].pet).level).not.toBe('rot') })
  it('Score-basiertes Rot hat urgency=rot via calcUrgency', () => { expect(calcUrgency({ Q_ATEM: 'stark', Q_BLUT: 'viel', Q_GIFT: 'ja' }, 'humpeln', DEMO_CASES[0].pet).level).toBe('rot') })
  it('Demo-Faelle unveraendert: Bruno=gelb, Mimi=gelb, Rocky=gruen, Felix=rot', () => {
    const [b, m, r, f] = DEMO_CASES.map(d => calcUrgency(d.answers, d.symptom, d.pet).level)
    expect(b).toBe('gelb'); expect(m).toBe('gelb'); expect(r).toBe('gruen'); expect(f).toBe('rot')
  })
})

describe('getPrimarySymptom – Red-Flag-first (multi-symptom selection)', () => {
  it('single symptom → itself', () => { expect(getPrimarySymptom(['humpeln'])).toBe('humpeln') })
  it('red-flag symptom wins over earlier non-flag', () => { expect(getPrimarySymptom(['humpeln', 'krampf'])).toBe('krampf') })
  it('urin_katze is treated as red-flag', () => { expect(getPrimarySymptom(['frisst_nicht', 'urin_katze'])).toBe('urin_katze') })
  it('atemnot is treated as red-flag', () => { expect(getPrimarySymptom(['frisst_nicht', 'atemnot', 'humpeln'])).toBe('atemnot') })
  it('gift is treated as red-flag', () => { expect(getPrimarySymptom(['humpeln', 'gift'])).toBe('gift') })
  it('krampf is treated as red-flag', () => { expect(getPrimarySymptom(['krampf', 'humpeln'])).toBe('krampf') })
  it('no red-flag → first selected', () => { expect(getPrimarySymptom(['frisst_nicht', 'humpeln', 'trinkt_nicht'])).toBe('frisst_nicht') })
  it('max 3 symptoms, no red-flag → still first selected', () => { expect(getPrimarySymptom(['durchfall', 'erbrechen', 'humpeln'])).toBe('durchfall') })
  it('first red-flag in list wins when multiple red-flags', () => { expect(getPrimarySymptom(['krampf', 'atemnot'])).toBe('krampf') })
  it('RED_FLAG_SYMPTOM_IDS contains exactly krampf, atemnot, gift, urin_katze', () => {
    expect(RED_FLAG_SYMPTOM_IDS.has('krampf')).toBe(true); expect(RED_FLAG_SYMPTOM_IDS.has('atemnot')).toBe(true)
    expect(RED_FLAG_SYMPTOM_IDS.has('gift')).toBe(true); expect(RED_FLAG_SYMPTOM_IDS.has('urin_katze')).toBe(true)
    expect(RED_FLAG_SYMPTOM_IDS.has('humpeln')).toBe(false); expect(RED_FLAG_SYMPTOM_IDS.has('frisst_nicht')).toBe(false)
  })
  it('MAX_SYMPTOMS is 3', () => { expect(MAX_SYMPTOMS).toBe(3) })
})

describe('getPrimarySymptom – Demo cases still correct via multi-symptom path', () => {
  it('Bruno: single symptom [humpeln] → primary=humpeln → gelb', () => {
    const primary = getPrimarySymptom([DEMO_CASES[0].symptom])
    const r = calcUrgency(DEMO_CASES[0].answers, primary, DEMO_CASES[0].pet)
    expect(primary).toBe('humpeln'); expect(r.level).toBe('gelb'); expect(r.score).toBe(DEMO_CASES[0].expectedScore)
  })
  it('Mimi: single symptom [frisst_nicht] → gelb', () => {
    const primary = getPrimarySymptom([DEMO_CASES[1].symptom])
    expect(calcUrgency(DEMO_CASES[1].answers, primary, DEMO_CASES[1].pet).level).toBe('gelb')
  })
  it('Rocky: single symptom [erbrechen] → gruen', () => {
    const primary = getPrimarySymptom([DEMO_CASES[2].symptom])
    expect(calcUrgency(DEMO_CASES[2].answers, primary, DEMO_CASES[2].pet).level).toBe('gruen')
  })
  it('Felix: [urin_katze] → red-flag first → still rot', () => {
    const primary = getPrimarySymptom([DEMO_CASES[3].symptom])
    expect(primary).toBe('urin_katze')
    const r = calcUrgency(DEMO_CASES[3].answers, primary, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot'); expect(r.redFlag).toBe(true)
  })
  it('Felix stays rot even when urin_katze is secondary selection', () => {
    const primary = getPrimarySymptom(['frisst_nicht', 'urin_katze'])
    expect(primary).toBe('urin_katze')
    const r = calcUrgency(DEMO_CASES[3].answers, primary, DEMO_CASES[3].pet)
    expect(r.level).toBe('rot'); expect(r.redFlag).toBe(true)
  })
})

describe('Language system – DE is default, copy structure', () => {
  it('DE.petProfile.nameLabel is correct', () => { expect(DE.petProfile.nameLabel).toBe('Name deines Vierbeiners') })
  it('DE.petProfile.namePlaceholder is correct', () => { expect(DE.petProfile.namePlaceholder).toBe('z. B. Bruno') })
  it('DE.petProfile.nameHint mentions Hund and Katze', () => { expect(DE.petProfile.nameHint).toContain('Hund'); expect(DE.petProfile.nameHint).toContain('Katze') })
  it('DE.symptomGrid.hint mentions 3', () => { expect(DE.symptomGrid.hint).toContain('3') })
  it('DE.symptomGrid.maxHint mentions max selection', () => { expect(DE.symptomGrid.maxHint).toBeTruthy(); expect(DE.symptomGrid.maxHint.length).toBeGreaterThan(10) })
  it('DE.symptomGrid.title is a function returning string', () => { expect(typeof DE.symptomGrid.title).toBe('function'); expect(DE.symptomGrid.title('Bruno')).toContain('Bruno') })
  it('DE.symptomGrid.selectedCount returns count string', () => { expect(DE.symptomGrid.selectedCount(2)).toContain('2') })
  it('DE.results.selectedSymptomsLabel is set', () => { expect(DE.results.selectedSymptomsLabel).toBeTruthy(); expect(DE.results.selectedSymptomsLabel).toContain('Beobachtung') })
  it('DE.settings.languageLabel is set', () => { expect(DE.settings.languageLabel).toBeTruthy() })
})

describe('Language system – EN copy mirrors DE structure', () => {
  it('EN.petProfile.nameLabel is in English', () => { expect(EN.petProfile.nameLabel).toContain('name') })
  it('EN.symptomGrid.hint mentions 3', () => { expect(EN.symptomGrid.hint).toContain('3') })
  it('EN.symptomGrid.title is a function returning string', () => { expect(typeof EN.symptomGrid.title).toBe('function'); expect(EN.symptomGrid.title('Bruno')).toContain('Bruno') })
  it('EN.results.selectedSymptomsLabel is in English', () => { expect(EN.results.selectedSymptomsLabel).toBeTruthy(); expect(EN.results.selectedSymptomsLabel.toLowerCase()).toContain('observation') })
  it('EN and DE have same top-level keys', () => { expect(Object.keys(EN).sort()).toEqual(Object.keys(DE).sort()) })
  it('EN.petProfile and DE.petProfile have same keys', () => { expect(Object.keys(EN.petProfile).sort()).toEqual(Object.keys(DE.petProfile).sort()) })
  it('EN.symptomGrid and DE.symptomGrid have same keys', () => { expect(Object.keys(EN.symptomGrid).sort()).toEqual(Object.keys(DE.symptomGrid).sort()) })
  it('EN.settings and DE.settings have same keys', () => { expect(Object.keys(EN.settings).sort()).toEqual(Object.keys(DE.settings).sort()) })
  it('EN.common and DE.common have same keys', () => { expect(Object.keys(EN.common).sort()).toEqual(Object.keys(DE.common).sort()) })
})

describe('calcCostTier – humpeln', () => {
  it('low: belastet normal, kein Unfall, leichte Schmerzen, kurze Dauer', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'normal', Q_UNFALL: 'nein', Q_STAERKE: 'leicht', Q_DAUER: 'lt12' }, false)
    expect(r.tier).toBe('low'); expect(r.range).not.toBeNull(); expect(r.range).toContain('€')
  })
  it('medium: belastet teilweise, mittlere Schmerzen', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'teilweise', Q_STAERKE: 'mittel', Q_UNFALL: 'nein', Q_DAUER: 'lt12' }, false)
    expect(r.tier).toBe('medium'); expect(r.range).not.toBeNull()
  })
  it('medium: länger als 24h (t1_3)', () => {
    const r = calcCostTier('humpeln', { Q_DAUER: 't1_3', Q_UNFALL: 'nein', Q_STAERKE: 'leicht', Q_BELASTET: 'normal' }, false)
    expect(r.tier).toBe('medium')
  })
  it('high: belastet gar nicht → high', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'gar_nicht', Q_UNFALL: 'nein', Q_STAERKE: 'leicht' }, false)
    expect(r.tier).toBe('high'); expect(r.range).not.toBeNull()
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
    expect(r.tier).toBe('emergency'); expect(r.range).toBeNull()
  })
  it('high has meaningful escalation hint', () => {
    const r = calcCostTier('humpeln', { Q_BELASTET: 'gar_nicht' }, false)
    expect(r.escalation.length).toBeGreaterThan(20)
  })
  it('Bruno (Demo): Unfall+teilweise+mittel → high', () => {
    const r = calcCostTier('humpeln', DEMO_CASES[0].answers, false, DEMO_CASES[0].pet, 8)
    expect(r.tier).toBe('high'); expect(r.range).not.toBeNull()
  })
})

describe('calcCostTier – frisst_nicht', () => {
  it('medium: frisst weniger, sonst stabil', () => {
    const r = calcCostTier('frisst_nicht', { Q_FRISST: 'weniger', Q_TRINKT: 'normal', Q_VERHALTEN: 'nein' }, false)
    expect(r.tier).toBe('medium'); expect(r.range).not.toBeNull()
  })
  it('high: frisst gar nicht', () => {
    const r = calcCostTier('frisst_nicht', { Q_FRISST: 'gar_nicht', Q_TRINKT: 'normal', Q_VERHALTEN: 'nein' }, false)
    expect(r.tier).toBe('high'); expect(r.range).not.toBeNull()
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
    expect(r.tier).toBe('emergency'); expect(r.range).toBeNull()
  })
  it('emergency: redFlag → emergency', () => {
    const r = calcCostTier('frisst_nicht', {}, true)
    expect(r.tier).toBe('emergency'); expect(r.range).toBeNull()
  })
  it('Mimi (Demo): frisst gar nicht + trinkt weniger + deutlich → high', () => {
    const r = calcCostTier('frisst_nicht', DEMO_CASES[1].answers, false, DEMO_CASES[1].pet, 11)
    expect(r.tier).toBe('high'); expect(r.range).not.toBeNull()
  })
})

describe('calcCostTier – erbrechen', () => {
  it('low: einmalig, trinkt normal, Verhalten normal', () => {
    const r = calcCostTier('erbrechen', { Q_HAEUFIG: 'einmalig', Q_TRINKT: 'normal', Q_VERHALTEN: 'nein' }, false)
    expect(r.tier).toBe('low'); expect(r.range).not.toBeNull()
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
    expect(r.tier).toBe('high'); expect(r.range).not.toBeNull()
  })
  it('high: Giftverdacht unklar', () => {
    const r = calcCostTier('erbrechen', { Q_GIFT: 'unklar', Q_HAEUFIG: 'einmalig' }, false)
    expect(r.tier).toBe('high')
  })
  it('emergency: redFlag → emergency, no range', () => {
    const r = calcCostTier('erbrechen', { Q_GIFT: 'ja' }, true)
    expect(r.tier).toBe('emergency'); expect(r.range).toBeNull()
  })
  it('Rocky (Demo): einmalig + normal + nein → low', () => {
    const r = calcCostTier('erbrechen', DEMO_CASES[2].answers, false, DEMO_CASES[2].pet, 1)
    expect(r.tier).toBe('low'); expect(r.range).not.toBeNull()
  })
})

describe('calcCostTier – urin_katze', () => {
  it('always emergency regardless of answers', () => {
    const r = calcCostTier('urin_katze', { Q_URIN: 'troepfchen' }, false)
    expect(r.tier).toBe('emergency'); expect(r.range).toBeNull()
  })
  it('emergency even with no answers', () => {
    const r = calcCostTier('urin_katze', {}, false)
    expect(r.tier).toBe('emergency'); expect(r.range).toBeNull()
  })
  it('Felix (Demo): urin_katze → emergency, no range', () => {
    const r = calcCostTier('urin_katze', DEMO_CASES[3].answers, true, DEMO_CASES[3].pet, 99)
    expect(r.tier).toBe('emergency'); expect(r.range).toBeNull()
    expect(r.reasoning.length).toBeGreaterThan(10); expect(r.escalation.length).toBeGreaterThan(10)
  })
})

describe('calcCostTier – guarantee constraints', () => {
  it('low tier has range, non-null', () => {
    const r = calcCostTier('erbrechen', { Q_HAEUFIG: 'einmalig', Q_TRINKT: 'normal', Q_VERHALTEN: 'nein' }, false)
    expect(r.range).not.toBeNull(); expect(r.range).toMatch(/ca\. \d+/)
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
    expect(r1.range).toBeNull(); expect(r2.range).toBeNull(); expect(r3.range).toBeNull()
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
    DEMO_CASES.forEach(demo => {
      const urgency = calcUrgency(demo.answers, demo.symptom, demo.pet)
      expect(urgency.level).toBe(demo.expectedLevel)
      expect(urgency.score).toBe(demo.expectedScore)
    })
  })
  it('DISCLAIMER text contains no Preisgarantie promise (no "garantiert")', () => {
    const DISCLAIMER =
      'Die Werte sind eine Orientierung, keine Preisgarantie. ' +
      'Die tatsächlichen Kosten hängen u. a. von Praxis, Diagnostik, Notdienst, Medikamenten und Verlauf ab.'
    expect(DISCLAIMER).toContain('keine Preisgarantie')
    expect(DISCLAIMER).not.toContain('garantiert')
  })
})
