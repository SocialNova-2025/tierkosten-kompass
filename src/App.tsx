import { useState, useCallback, useEffect } from 'react'
import type {
  Screen, NavTab, Pet, CheckAnswers, CheckSession, GapAnswers, GapResult,
} from './types'

// ── Components ────────────────────────────────────────────────────────────
import { AppShell }          from './components/AppShell'
import { PetProfileForm }    from './components/PetProfileForm'
import { SymptomGrid }       from './components/SymptomGrid'
import { QuestionGroup }     from './components/QuestionGroup'
import type { QuestionDef }  from './components/QuestionGroup'
import { ResultPage }        from './components/ResultPage'
import { EmergencyModal }    from './components/EmergencyModal'
import { InsuranceGapCheck } from './components/InsuranceGapCheck'
import { UrgencyCard }       from './components/UrgencyCard'
import { LeadForm }          from './components/LeadForm'
import { MiniPetRecord }     from './components/MiniPetRecord'
import { SettingsScreen }    from './components/SettingsScreen'

// ── Storage ───────────────────────────────────────────────────────────────
import { lsGet, lsSet, lsClearAll, STORAGE_KEYS } from './lib/storage'

// ── Logic & data ──────────────────────────────────────────────────────────
import { calcUrgency }  from './lib/urgency'
import { calcGap }      from './lib/gapCheck'
import { getCostData }  from './data/costs'
import { DEMO_CASES }   from './data/demoCases'
import { T, BTN }       from './styles/tokens'
import {
  insuranceHint, disclaimer, consentShareText, consentContactText, leadConfirmation,
} from './data/copy'
import { FEATURES }             from './config/features'
import { useCopy }              from './lib/LanguageContext'
import { RED_FLAG_SYMPTOM_IDS } from './lib/symptomUtils'

// ─────────────────────────────────────────────────────────────────────────
// HOME FEATURES – with insurance funnel (only used when flag is true)
const HOME_FEATURES_WITH_INSURANCE: [string, string, string][] = [
  ['01', 'Wie dringend ist es?',   'Klare Handlungsempfehlung – grün, gelb oder rot.'],
  ['02', 'Was kostet es ungefähr?', 'Drei realistische Kostenszenarien.'],
  ['03', 'Passt dein Schutz?',      'Mögliche Lücken im Versicherungsschutz.'],
]

// ─────────────────────────────────────────────────────────────────────────
// BACK MAP – evaluated at call-time so it sees current state
function getBackScreen(sc: Screen, hasPet: boolean, hasSession: boolean): Screen | null {
  const map: Partial<Record<Screen, Screen>> = {
    P2:  'P1',
    P3:  hasPet  ? 'P1' : 'P2',
    P4a: 'P3',
    P4b: 'P4a',
    P4c: 'P4b',
    P6:  'P3',
    P7:  hasSession ? 'P6' : 'P1',
    P8:  'P7',
    P9:  'P8',
    P10: 'P1',
    P11: 'P1',
  }
  return map[sc] ?? null
}

// ─────────────────────────────────────────────────────────────────────────
export default function App() {
  const copy = useCopy()

  // ── Core navigation state ────────────────────────────────────────────
  const [screen, setScreen]   = useState<Screen>('P0')
  const [tab, setTab]         = useState<NavTab>('start')
  const [settingsOpen, setSettings] = useState(false)

  // ── Domain state (initialised from localStorage where applicable) ────
  const [pet, setPet]                           = useState<Pet | null>(() => lsGet<Pet>(STORAGE_KEYS.PET))
  const [symptomId, setSymptomId]               = useState<string>('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [answers, setAnswers]                   = useState<CheckAnswers>({})
  const [session, setSession]                   = useState<CheckSession | null>(null)
  const [sessions, setSessions]                 = useState<CheckSession[]>(() => lsGet<CheckSession[]>(STORAGE_KEYS.SESSIONS) ?? [])
  const [sessSaved, setSessSaved]               = useState(false)
  const [showEmerg, setShowEmerg]               = useState(false)

  // ── Persist pet whenever it changes ──────────────────────────────────
  useEffect(() => {
    if (pet) lsSet(STORAGE_KEYS.PET, pet)
  }, [pet])

  // ── Persist sessions whenever they change ─────────────────────────────
  useEffect(() => {
    lsSet(STORAGE_KEYS.SESSIONS, sessions)
  }, [sessions])

  // ── Gap check state ───────────────────────────────────────────────────
  const [gapResult, setGapResult] = useState<GapResult | null>(null)

  // ─────────────────────────────────────────────────────────────────────
  const go = useCallback((sc: Screen) => {
    setScreen(sc)
    setSessSaved(false)
  }, [])

  const goHome = useCallback(() => {
    setScreen('P1')
    setTab('start')
    setSettings(false)
  }, [])

  const handleTab = useCallback((t: NavTab) => {
    setTab(t)
    setSettings(false)
    if (t === 'start') setScreen('P1')
    else if (t === 'check') {
      setAnswers({})
      setSymptomId('')
      setSelectedSymptoms([])
      setScreen(pet ? 'P3' : 'P2')
    } else {
      setScreen('P11')
    }
  }, [pet])

  const handleBack = useCallback(() => {
    const bk = getBackScreen(screen, !!pet, !!session)
    if (bk) go(bk)
    else goHome()
  }, [screen, pet, session, go, goHome])

  // ── Pet done ──────────────────────────────────────────────────────────
  const handlePetDone = useCallback((p: Pet) => {
    setPet(p)
    go('P3')
  }, [go])

  // ── Multi-symptom selected (called from SymptomGrid.onDone) ──────────
  const handleMultiSymptom = useCallback((syms: string[], primary: string) => {
    setSelectedSymptoms(syms)
    setSymptomId(primary)
    setAnswers({})
    setShowEmerg(false)
    if (syms.some(s => RED_FLAG_SYMPTOM_IDS.has(s))) setShowEmerg(true)
    go('P4a')
  }, [go])

  // ── Answer change (with live red-flag check) ──────────────────────────
  const handleAnswer = useCallback((key: keyof CheckAnswers, value: string) => {
    setAnswers(prev => {
      const next = { ...prev, [key]: value } as CheckAnswers
      if (
        (key === 'Q_ATEM' && value === 'stark') ||
        (key === 'Q_BLUT' && value === 'viel') ||
        (key === 'Q_GIFT' && value === 'ja') ||
        (key === 'Q_URIN' && (value === 'troepfchen' || value === 'gar_nicht'))
      ) setShowEmerg(true)
      return next
    })
  }, [])

  // ── Build session ─────────────────────────────────────────────────────
  const buildSession = useCallback((): CheckSession => {
    const { level, score, redFlag } = calcUrgency(answers, symptomId, pet)
    const cost = getCostData(symptomId)
    return {
      id: Date.now().toString(),
      petId: pet?.id ?? '',
      symptomId,
      selectedSymptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
      answers: { ...answers },
      urgency: level,
      score,
      redFlag,
      cost,
      createdAt: new Date().toISOString(),
    }
  }, [answers, symptomId, selectedSymptoms, pet])

  const handleComputeResult = useCallback(() => {
    const s = buildSession()
    setSession(s)
    go('P6')
  }, [buildSession, go])

  // ── P4a gate ──────────────────────────────────────────────────────────
  const canProceedP4a = !!(
    answers.Q_ATEM &&
    answers.Q_BLUT &&
    (symptomId !== 'urin_katze' || pet?.species !== 'katze' || answers.Q_URIN)
  )

  // ── P4b gate ──────────────────────────────────────────────────────────
  const canProceedP4b = !!(answers.Q_DAUER && answers.Q_STAERKE)

  // ── Save session ──────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (session && !sessions.find(s => s.id === session.id)) {
      setSessions(prev => [...prev, session])
      setSessSaved(true)
    }
  }, [session, sessions])

  // ── Load demo ─────────────────────────────────────────────────────────
  const handleLoadDemo = useCallback((idx: number) => {
    const demo = DEMO_CASES[idx]
    const p = { ...demo.pet }
    const { level, score, redFlag } = calcUrgency(demo.answers, demo.symptom, p)
    const cost = getCostData(demo.symptom)
    const s: CheckSession = {
      id: 'demo_' + Date.now(),
      petId: p.id,
      symptomId: demo.symptom,
      selectedSymptoms: [demo.symptom],
      answers: { ...demo.answers },
      urgency: level,
      score,
      redFlag,
      cost,
      createdAt: new Date().toISOString(),
    }
    setPet(p)
    setSymptomId(demo.symptom)
    setSelectedSymptoms([demo.symptom])
    setAnswers(demo.answers)
    setSession(s)
    setShowEmerg(redFlag)
    setSettings(false)
    setSessSaved(false)
    setTab('start')
    go('P6')
  }, [go])

  // ── Clear all ─────────────────────────────────────────────────────────
  const handleClearAll = useCallback(() => {
    lsClearAll()
    setPet(null)
    setSymptomId('')
    setSelectedSymptoms([])
    setAnswers({})
    setSession(null)
    setSessions([])
    setSessSaved(false)
    setShowEmerg(false)
    setGapResult(null)
    setSettings(false)
    setTab('start')
    setScreen('P1')
  }, [])

  // ─────────────────────────────────────────────────────────────────────
  // SCREEN RENDERING
  // ─────────────────────────────────────────────────────────────────────

  // Settings overlay
  if (settingsOpen) {
    return (
      <AppShell screen={screen} activeTab={tab} onTab={handleTab} onBack={() => setSettings(false)} onSettings={() => setSettings(false)}>
        <SettingsScreen
          demos={DEMO_CASES}
          onLoadDemo={handleLoadDemo}
          onClearAll={handleClearAll}
        />
      </AppShell>
    )
  }

  // P0 – Onboarding
  if (screen === 'P0') {
    const ob = copy.onboarding
    return (
      <AppShell screen="P0" activeTab={tab} onTab={handleTab} onSettings={() => setSettings(true)} noNav>
        <div style={{
          background: 'rgba(10,20,20,.72)', borderRadius: 14, padding: '20px 16px', marginBottom: 14,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: T.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', fontSize: 20, fontWeight: 700, color: '#fff',
          }}>TK</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 12 }}>
            {ob.title}
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,.9)', marginBottom: 18, textAlign: 'center' }}>
            {ob.body}
          </p>
          <button ref={el => { if (el) el.style.cssText = BTN.primary }} onClick={() => go('P1')}>
            {ob.cta}
          </button>
          <button ref={el => { if (el) el.style.cssText = BTN.textLink }}>
            {ob.dataPrivacy}
          </button>
        </div>
      </AppShell>
    )
  }

  // P1 – Start screen
  if (screen === 'P1') {
    const h = copy.home
    return (
      <AppShell screen="P1" activeTab={tab} onTab={handleTab} onSettings={() => setSettings(true)}>
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase', color: T.primary, marginBottom: 16 }}>
            {h.label}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-.03em', color: T.text, marginBottom: 10 }}>
            {h.headline}
          </h1>
          <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.5, marginBottom: 6 }}>
            {h.subline}
          </p>
          <p style={{ fontSize: 11, color: '#8FA8A8', letterSpacing: '.04em', textTransform: 'uppercase' }}>
            {h.tagline}
          </p>
        </div>

        {/* Value prop */}
        <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
          {(FEATURES.insuranceFunnel ? HOME_FEATURES_WITH_INSURANCE : h.features).map(([n, headline, sub], i) => (
            <div key={n} style={{ display: 'flex', gap: 14, padding: '14px 0', alignItems: 'flex-start', borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, minWidth: 22, paddingTop: 1 }}>{n}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{headline}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          ref={el => { if (el) el.style.cssText = BTN.primary }}
          onClick={() => { setAnswers({}); setSymptomId(''); setSelectedSymptoms([]); go(pet ? 'P3' : 'P2') }}
        >
          {h.startCta}
        </button>

        {/* Secondary – insurance funnel only */}
        {FEATURES.insuranceFunnel && (
          <button
            ref={el => { if (el) el.style.cssText = BTN.textLink }}
            onClick={() => go(pet ? 'P7' : 'P2')}
            style={{ marginTop: 6 } as React.CSSProperties}
          >
            {h.schutzCta}
          </button>
        )}
      </AppShell>
    )
  }

  // P2 – Pet profile
  if (screen === 'P2') {
    return (
      <AppShell screen="P2" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        <PetProfileForm initial={pet} onDone={handlePetDone} />
      </AppShell>
    )
  }

  // P3 – Symptom grid
  if (screen === 'P3') {
    if (!pet) { go('P2'); return null }
    return (
      <AppShell screen="P3" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        <SymptomGrid pet={pet} onDone={handleMultiSymptom} />
      </AppShell>
    )
  }

  // ── Question screens ──────────────────────────────────────────────────
  const cf = copy.checkFlow
  const petName = pet?.name ?? ''

  // P4a – Safety questions
  if (screen === 'P4a') {
    const isUrinKatze = symptomId === 'urin_katze' && pet?.species === 'katze'
    const urinQ: QuestionDef = {
      key: 'Q_URIN',
      required: true,
      label: cf.q_urin_label(petName),
      options: [
        { v: 'normal',     label: cf.q_urin_normal },
        { v: 'troepfchen', label: cf.q_urin_troepfchen },
        { v: 'gar_nicht',  label: cf.q_urin_gar_nicht },
      ],
    }
    const baseQs: QuestionDef[] = [
      {
        key: 'Q_ATEM', required: true,
        label: cf.q_atem_label(petName),
        options: [
          { v: 'unauffaellig', label: cf.q_atem_unauffaellig },
          { v: 'leicht',       label: cf.q_atem_leicht },
          { v: 'stark',        label: cf.q_atem_stark },
        ],
      },
      {
        key: 'Q_BLUT', required: true,
        label: cf.q_blut_label,
        options: [
          { v: 'nein',  label: cf.q_blut_nein },
          { v: 'wenig', label: cf.q_blut_wenig },
          { v: 'viel',  label: cf.q_blut_viel },
        ],
      },
      {
        key: 'Q_UNFALL',
        label: cf.q_unfall_label,
        options: [
          { v: 'nein', label: cf.q_unfall_nein },
          { v: 'ja',   label: cf.q_unfall_ja },
        ],
      },
      {
        key: 'Q_GIFT',
        label: cf.q_gift_label,
        options: [
          { v: 'nein',   label: cf.q_gift_nein },
          { v: 'unklar', label: cf.q_gift_unklar },
          { v: 'ja',     label: cf.q_gift_ja },
        ],
      },
    ]
    const qs = isUrinKatze ? [urinQ, ...baseQs] : baseQs

    return (
      <AppShell screen="P4a" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        {showEmerg && <EmergencyModal petName={petName} onContinue={() => setShowEmerg(false)} />}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <QuestionGroup
            title={cf.step1Title}
            subtitle={cf.step1Sub}
            questions={qs}
            answers={answers}
            onChange={handleAnswer}
            step={1}
            stepNames={cf.stepNames}
          />
          <button
            ref={el => { if (el) el.style.cssText = canProceedP4a ? BTN.primary : BTN.primaryDisabled }}
            disabled={!canProceedP4a}
            onClick={canProceedP4a ? () => go('P4b') : undefined}
          >
            {copy.common.next}
          </button>
          {!canProceedP4a && (
            <p style={{ fontSize: 12, color: T.muted, textAlign: 'center' }}>{cf.reqHint}</p>
          )}
        </div>
      </AppShell>
    )
  }

  // P4b – Progression questions
  if (screen === 'P4b') {
    const qs: QuestionDef[] = [
      {
        key: 'Q_DAUER', required: true,
        label: cf.q_dauer_label(petName),
        options: [
          { v: 'lt12',    label: cf.q_dauer_lt12 },
          { v: 'h12_24',  label: cf.q_dauer_h12_24 },
          { v: 't1_3',    label: cf.q_dauer_t1_3 },
          { v: 'laenger', label: cf.q_dauer_laenger },
        ],
      },
      {
        key: 'Q_STAERKE', required: true,
        label: cf.q_staerke_label,
        options: [
          { v: 'leicht', label: cf.q_staerke_leicht },
          { v: 'mittel', label: cf.q_staerke_mittel },
          { v: 'stark',  label: cf.q_staerke_stark },
        ],
      },
      {
        key: 'Q_HAEUFIG',
        label: cf.q_haeufig_label,
        options: [
          { v: 'einmalig',  label: cf.q_haeufig_einmalig },
          { v: 'mehrmals',  label: cf.q_haeufig_mehrmals },
          { v: 'anhaltend', label: cf.q_haeufig_anhaltend },
        ],
      },
      ...(symptomId === 'humpeln' ? [{
        key: 'Q_BELASTET' as keyof CheckAnswers,
        label: cf.q_belastet_label(petName),
        options: [
          { v: 'normal',    label: cf.q_belastet_normal },
          { v: 'teilweise', label: cf.q_belastet_teilweise },
          { v: 'gar_nicht', label: cf.q_belastet_gar_nicht },
        ],
      }] : []),
    ]

    return (
      <AppShell screen="P4b" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <QuestionGroup
            title={cf.step2Title}
            subtitle={cf.step2Sub}
            questions={qs}
            answers={answers}
            onChange={handleAnswer}
            step={2}
            stepNames={cf.stepNames}
          />
          <button
            ref={el => { if (el) el.style.cssText = canProceedP4b ? BTN.primary : BTN.primaryDisabled }}
            disabled={!canProceedP4b}
            onClick={canProceedP4b ? () => go('P4c') : undefined}
          >
            {copy.common.next}
          </button>
        </div>
      </AppShell>
    )
  }

  // P4c – General condition
  if (screen === 'P4c') {
    const qs: QuestionDef[] = [
      {
        key: 'Q_FRISST',
        label: cf.q_frisst_label(petName),
        options: [
          { v: 'normal',    label: cf.q_frisst_normal },
          { v: 'weniger',   label: cf.q_frisst_weniger },
          { v: 'gar_nicht', label: cf.q_frisst_gar_nicht },
        ],
      },
      {
        key: 'Q_TRINKT',
        label: cf.q_trinkt_label(petName),
        options: [
          { v: 'normal',    label: cf.q_trinkt_normal },
          { v: 'weniger',   label: cf.q_trinkt_weniger },
          { v: 'gar_nicht', label: cf.q_trinkt_gar_nicht },
        ],
      },
      {
        key: 'Q_VERHALTEN',
        label: cf.q_verhalten_label,
        options: [
          { v: 'nein',     label: cf.q_verhalten_nein },
          { v: 'etwas',    label: cf.q_verhalten_etwas },
          { v: 'deutlich', label: cf.q_verhalten_deutlich },
        ],
      },
      {
        key: 'Q_SCHMERZ',
        label: cf.q_schmerz_label(petName),
        options: [
          { v: 'nein',       label: cf.q_schmerz_nein },
          { v: 'vielleicht', label: cf.q_schmerz_vielleicht },
          { v: 'ja',         label: cf.q_schmerz_ja },
        ],
      },
    ]

    return (
      <AppShell screen="P4c" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <QuestionGroup
            title={cf.step3Title(petName)}
            subtitle={cf.step3Sub}
            questions={qs}
            answers={answers}
            onChange={handleAnswer}
            step={3}
            stepNames={cf.stepNames}
          />
          <button
            ref={el => { if (el) el.style.cssText = BTN.primary }}
            onClick={handleComputeResult}
          >
            {cf.btnResult}
          </button>
        </div>
      </AppShell>
    )
  }

  // P6 – Result (EmergencyModal removed: ResultPage handles the red-case UI)
  if (screen === 'P6') {
    if (!session || !pet) { go('P3'); return null }
    return (
      <AppShell screen="P6" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        <ResultPage
          session={session}
          pet={pet}
          onSchutz={() => go('P7')}
          onNewCheck={() => { setAnswers({}); setSymptomId(''); setSelectedSymptoms([]); go('P3') }}
          onSave={handleSave}
          alreadySaved={sessSaved}
        />
      </AppShell>
    )
  }

  // Route Guard – insurance funnel disabled
  if ((screen === 'P7' || screen === 'P8' || screen === 'P9' || screen === 'P10') && !FEATURES.insuranceFunnel) {
    if (session) { go('P6'); return null }
    go('P1'); return null
  }

  // P7 – Gap check
  if (screen === 'P7') {
    return (
      <AppShell screen="P7" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        <InsuranceGapCheck
          pet={pet}
          onDone={(g: GapAnswers) => { setGapResult(calcGap(g)); go('P8') }}
          onSkip={goHome}
        />
      </AppShell>
    )
  }

  // P8 – Gap result
  if (screen === 'P8') {
    const res = gapResult ?? { result: 'gelb' as const, gaps: [] }

    return (
      <AppShell screen="P8" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text }}>Dein Schutz-Check</h2>
          <UrgencyCard level={res.result} petName={pet?.name ?? 'dein Tier'} />
          {res.gaps.length > 0 && (
            <div className="card">
              <div className="flbl">Mögliche Lücken</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {res.gaps.map(g => (
                  <div key={g} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13, color: T.text, lineHeight: 1.5, padding: '4px 0' }}>
                    <span>⚠️</span><span>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ background: '#F3F7F7', borderRadius: 10, padding: '10px 13px', fontSize: 12, lineHeight: 1.6, color: T.muted, fontStyle: 'italic' }}>
            {insuranceHint}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button ref={el => { if (el) el.style.cssText = BTN.primary }} onClick={() => go('P9')}>
              Beratung per WhatsApp erhalten →
            </button>
            <button ref={el => { if (el) el.style.cssText = BTN.ghost }} onClick={goHome}>
              {copy.common.later}
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  // P9 – Lead form
  if (screen === 'P9') {
    return (
      <AppShell screen="P9" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        <LeadForm
          pet={pet}
          session={session}
          onSubmit={() => go('P10')}
          onCancel={() => go('P8')}
        />
      </AppShell>
    )
  }

  // P10 – Lead confirmation
  if (screen === 'P10') {
    return (
      <AppShell screen="P10" activeTab={tab} onTab={handleTab} onSettings={() => setSettings(true)} noNav>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '16px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.pLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
            <i className="ti ti-check" aria-hidden="true" style={{ fontSize: 28, color: T.primary }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: T.text, textAlign: 'center' }}>
            WhatsApp wurde geöffnet
          </h2>
          <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, textAlign: 'center', maxWidth: 280 }}>
            {leadConfirmation}
          </p>
          <button ref={el => { if (el) el.style.cssText = BTN.primary }} onClick={goHome} style={{ width: '100%' } as React.CSSProperties}>
            {copy.common.done}
          </button>
          <p style={{ fontSize: 11, color: T.muted, textAlign: 'center' }}>
            Einwilligung jederzeit widerrufbar · Keine Sofortentscheidung nötig
          </p>
        </div>
      </AppShell>
    )
  }

  // P11 – Tierakte
  if (screen === 'P11') {
    const petSessions = sessions.filter(s => s.petId === (pet?.id ?? ''))
    return (
      <AppShell screen="P11" activeTab={tab} onTab={handleTab} onSettings={() => setSettings(true)}>
        <MiniPetRecord
          pet={pet}
          sessions={petSessions}
          onNewCheck={() => { setAnswers({}); setSymptomId(''); setSelectedSymptoms([]); go(pet ? 'P3' : 'P2') }}
          onEdit={() => go('P2')}
          onSchutz={() => go('P7')}
        />
      </AppShell>
    )
  }

  return null
}
