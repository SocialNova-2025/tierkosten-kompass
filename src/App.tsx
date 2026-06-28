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
  onboardingText, insuranceHint, disclaimer,
  consentShareText, consentContactText, leadConfirmation,
} from './data/copy'
import { FEATURES } from './config/features'

// ─────────────────────────────────────────────────────────────────────────
// HOME FEATURES – base (no insurance funnel)
const HOME_FEATURES_BASE: [string, string, string][] = [
  ['01', 'Wie dringend ist es?',         'Klare Handlungsempfehlung – grün, gelb oder rot.'],
  ['02', 'Was kostet es ungefähr?',       'Drei realistische Kostenszenarien.'],
  ['03', 'Tierarzt oder Notdienst finden', 'Karte öffnet direkt in deiner Nähe.'],
]
const HOME_FEATURES_WITH_INSURANCE: [string, string, string][] = [
  ['01', 'Wie dringend ist es?',   'Klare Handlungsempfehlung – grün, gelb oder rot.'],
  ['02', 'Was kostet es ungefähr?', 'Drei realistische Kostenszenarien.'],
  ['03', 'Passt dein Schutz?',      'Mögliche Lücken im Versicherungsschutz.'],
]

// ─────────────────────────────────────────────────────────────────────────
// STEP NAMES (shared across P4a / P4b / P4c)
const STEP_NAMES = ['Sicherheitscheck', 'Verlauf', 'Allgemeinzustand']

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
  // ── Core navigation state ────────────────────────────────────────────
  const [screen, setScreen]   = useState<Screen>('P0')
  const [tab, setTab]         = useState<NavTab>('start')
  const [settingsOpen, setSettings] = useState(false)

  // ── Domain state (initialised from localStorage where applicable) ────
  const [pet, setPet]             = useState<Pet | null>(() => lsGet<Pet>(STORAGE_KEYS.PET))
  const [symptomId, setSymptomId] = useState<string>('')
  const [answers, setAnswers]     = useState<CheckAnswers>({})
  const [session, setSession]     = useState<CheckSession | null>(null)
  const [sessions, setSessions]   = useState<CheckSession[]>(() => lsGet<CheckSession[]>(STORAGE_KEYS.SESSIONS) ?? [])
  const [sessSaved, setSessSaved] = useState(false)
  const [showEmerg, setShowEmerg] = useState(false)

  // ── Persist pet whenever it changes ──────────────────────────────────
  useEffect(() => {
    if (pet) lsSet(STORAGE_KEYS.PET, pet)
    // Note: deletion on null happens inside handleClearAll
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

  // ── Symptom selected ──────────────────────────────────────────────────
  const handleSymptom = useCallback((sid: string) => {
    setSymptomId(sid)
    setAnswers({})
    if (['krampf', 'atemnot', 'gift'].includes(sid)) setShowEmerg(true)
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
      answers: { ...answers },
      urgency: level,
      score,
      redFlag,
      cost,
      createdAt: new Date().toISOString(),
    }
  }, [answers, symptomId, pet])

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
      answers: { ...demo.answers },
      urgency: level,
      score,
      redFlag,
      cost,
      createdAt: new Date().toISOString(),
    }
    setPet(p)
    setSymptomId(demo.symptom)
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
    // 1. Wipe localStorage first so no stale data survives a reload
    lsClearAll()
    // 2. Reset all React state to defaults
    setPet(null)
    setSymptomId('')
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
            Kurz vorab
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,.9)', marginBottom: 18, textAlign: 'center' }}>
            {onboardingText}
          </p>
          <button ref={el => { if (el) el.style.cssText = BTN.primary }} onClick={() => go('P1')}>
            Verstanden, los geht's
          </button>
          <button ref={el => { if (el) el.style.cssText = BTN.textLink }}>
            Datenschutz & Hinweise
          </button>
        </div>
      </AppShell>
    )
  }

  // P1 – Start screen
  if (screen === 'P1') {
    return (
      <AppShell screen="P1" activeTab={tab} onTab={handleTab} onSettings={() => setSettings(true)}>
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase', color: T.primary, marginBottom: 16 }}>
            TierKosten Kompass
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-.03em', color: T.text, marginBottom: 10 }}>
            Was ist mit deinem Tier los?
          </h1>
          <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.5, marginBottom: 6 }}>
            Bevor dich die Tierarztrechnung überrascht.
          </p>
          <p style={{ fontSize: 11, color: '#8FA8A8', letterSpacing: '.04em', textTransform: 'uppercase' }}>
            Schnellcheck in 60 Sekunden · Dringlichkeit · Kostenrisiko
          </p>
        </div>

        {/* Value prop */}
        <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
          {(FEATURES.insuranceFunnel ? HOME_FEATURES_WITH_INSURANCE : HOME_FEATURES_BASE).map(([n, h, s], i, arr) => (
            <div key={n} style={{ display: 'flex', gap: 14, padding: '14px 0', alignItems: 'flex-start', borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, minWidth: 22, paddingTop: 1 }}>{n}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{h}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Primary CTA – dominant */}
        <button
          ref={el => { if (el) el.style.cssText = BTN.primary }}
          onClick={() => { setAnswers({}); setSymptomId(''); go(pet ? 'P3' : 'P2') }}
        >
          Akut-Check starten →
        </button>

        {/* Secondary – subordinate text link (insurance funnel only) */}
        {FEATURES.insuranceFunnel && (
          <button
            ref={el => { if (el) el.style.cssText = BTN.textLink }}
            onClick={() => go(pet ? 'P7' : 'P2')}
            style={{ marginTop: 6 } as React.CSSProperties}
          >
            Schutzlücke erkennen
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
        <SymptomGrid pet={pet} onSelect={handleSymptom} />
      </AppShell>
    )
  }

  // ── Question screens ──────────────────────────────────────────────────

  // P4a – Safety questions
  if (screen === 'P4a') {
    const isUrinKatze = symptomId === 'urin_katze' && pet?.species === 'katze'
    const urinQ: QuestionDef = {
      key: 'Q_URIN',
      required: true,
      label: `Kann ${pet?.name ?? 'dein Tier'} Urin absetzen?`,
      options: [
        { v: 'normal', label: 'Ja, normal' },
        { v: 'troepfchen', label: 'Nur Tröpfchen' },
        { v: 'gar_nicht', label: 'Gar nicht' },
      ],
    }
    const baseQs: QuestionDef[] = [
      {
        key: 'Q_ATEM', required: true,
        label: `Wie atmet ${pet?.name ?? 'dein Tier'}?`,
        options: [
          { v: 'unauffaellig', label: 'Unauffällig / normal' },
          { v: 'leicht', label: 'Leicht auffällig' },
          { v: 'stark', label: 'Stark auffällig' },
        ],
      },
      {
        key: 'Q_BLUT', required: true,
        label: 'Ist Blut sichtbar?',
        options: [{ v: 'nein', label: 'Nein' }, { v: 'wenig', label: 'Wenig' }, { v: 'viel', label: 'Viel' }],
      },
      {
        key: 'Q_UNFALL',
        label: 'Gab es einen Unfall oder Sturz?',
        options: [{ v: 'nein', label: 'Nein' }, { v: 'ja', label: 'Ja' }],
      },
      {
        key: 'Q_GIFT',
        label: 'Verdacht auf Gift oder Fremdobjekt?',
        options: [{ v: 'nein', label: 'Nein' }, { v: 'unklar', label: 'Unklar' }, { v: 'ja', label: 'Ja' }],
      },
    ]
    const qs = isUrinKatze ? [urinQ, ...baseQs] : baseQs

    return (
      <AppShell screen="P4a" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        {showEmerg && <EmergencyModal petName={pet?.name ?? 'dein Tier'} onContinue={() => setShowEmerg(false)} />}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <QuestionGroup
            title="Zuerst das Wichtigste"
            subtitle="Damit wir nichts Dringendes übersehen."
            questions={qs}
            answers={answers}
            onChange={handleAnswer}
            step={1}
            stepNames={STEP_NAMES}
          />
          <button
            ref={el => { if (el) el.style.cssText = canProceedP4a ? BTN.primary : BTN.primaryDisabled }}
            disabled={!canProceedP4a}
            onClick={canProceedP4a ? () => go('P4b') : undefined}
          >
            Weiter →
          </button>
          {!canProceedP4a && (
            <p style={{ fontSize: 12, color: T.muted, textAlign: 'center' }}>Bitte alle Pflichtfragen beantworten</p>
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
        label: `Seit wann zeigt ${pet?.name ?? 'dein Tier'} das?`,
        options: [
          { v: 'lt12', label: 'Weniger als 12 Stunden' },
          { v: 'h12_24', label: '12–24 Stunden' },
          { v: 't1_3', label: '1–3 Tage' },
          { v: 'laenger', label: 'Länger als 3 Tage' },
        ],
      },
      {
        key: 'Q_STAERKE', required: true,
        label: 'Wie stark ist es?',
        options: [{ v: 'leicht', label: 'Leicht' }, { v: 'mittel', label: 'Mittel' }, { v: 'stark', label: 'Stark' }],
      },
      {
        key: 'Q_HAEUFIG',
        label: 'Wie oft tritt es auf?',
        options: [{ v: 'einmalig', label: 'Einmalig' }, { v: 'mehrmals', label: 'Mehrmals' }, { v: 'anhaltend', label: 'Anhaltend / dauerhaft' }],
      },
      ...(symptomId === 'humpeln' ? [{
        key: 'Q_BELASTET' as keyof CheckAnswers,
        label: `Belastet ${pet?.name ?? 'dein Tier'} das Bein noch?`,
        options: [
          { v: 'normal', label: 'Ja, normal' },
          { v: 'teilweise', label: 'Nur teilweise' },
          { v: 'gar_nicht', label: 'Gar nicht' },
        ],
      }] : []),
    ]

    return (
      <AppShell screen="P4b" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <QuestionGroup
            title="Seit wann und wie stark?"
            subtitle="Grobe Angaben reichen völlig aus."
            questions={qs}
            answers={answers}
            onChange={handleAnswer}
            step={2}
            stepNames={STEP_NAMES}
          />
          <button
            ref={el => { if (el) el.style.cssText = canProceedP4b ? BTN.primary : BTN.primaryDisabled }}
            disabled={!canProceedP4b}
            onClick={canProceedP4b ? () => go('P4c') : undefined}
          >
            Weiter →
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
        label: `Frisst ${pet?.name ?? 'dein Tier'}?`,
        options: [{ v: 'normal', label: 'Normal' }, { v: 'weniger', label: 'Weniger als sonst' }, { v: 'gar_nicht', label: 'Gar nicht' }],
      },
      {
        key: 'Q_TRINKT',
        label: `Trinkt ${pet?.name ?? 'dein Tier'}?`,
        options: [{ v: 'normal', label: 'Normal' }, { v: 'weniger', label: 'Weniger als sonst' }, { v: 'gar_nicht', label: 'Gar nicht' }],
      },
      {
        key: 'Q_VERHALTEN',
        label: 'Verhalten verändert?',
        options: [
          { v: 'nein', label: 'Nein, normal' },
          { v: 'etwas', label: 'Etwas (schont sich, unruhig)' },
          { v: 'deutlich', label: 'Deutlich (apathisch, sehr unruhig)' },
        ],
      },
      {
        key: 'Q_SCHMERZ',
        label: `Wirkt ${pet?.name ?? 'dein Tier'} schmerzhaft?`,
        options: [{ v: 'nein', label: 'Nein' }, { v: 'vielleicht', label: 'Vielleicht' }, { v: 'ja', label: 'Ja' }],
      },
    ]

    return (
      <AppShell screen="P4c" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <QuestionGroup
            title={`Wie geht es ${pet?.name ?? 'deinem Tier'} sonst?`}
            subtitle="Letzte Fragen – dann hast du dein Ergebnis."
            questions={qs}
            answers={answers}
            onChange={handleAnswer}
            step={3}
            stepNames={STEP_NAMES}
          />
          <button
            ref={el => { if (el) el.style.cssText = BTN.primary }}
            onClick={handleComputeResult}
          >
            Ergebnis anzeigen →
          </button>
        </div>
      </AppShell>
    )
  }

  // P6 – Result
  if (screen === 'P6') {
    if (!session || !pet) { go('P3'); return null }
    return (
      <AppShell screen="P6" activeTab={tab} onTab={handleTab} onBack={handleBack} onSettings={() => setSettings(true)}>
        {showEmerg && <EmergencyModal petName={pet.name} onContinue={() => setShowEmerg(false)} />}
        <ResultPage
          session={session}
          pet={pet}
          onSchutz={() => go('P7')}
          onNewCheck={() => { setAnswers({}); setSymptomId(''); go('P3') }}
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
          onDone={g => { setGapResult(calcGap(g)); go('P8') }}
          onSkip={goHome}
        />
      </AppShell>
    )
  }

  // P8 – Gap result
  if (screen === 'P8') {
    const res = gapResult ?? { result: 'gelb' as const, gaps: [] }
    const titles = {
      gruen: 'Schutz wirkt grundsätzlich solide',
      gelb:  'Mögliche Lücken – prüfen lassen',
      rot:   'Erhöhtes Kostenrisiko',
    }
    const bodies = {
      gruen: 'Deine Angaben deuten auf einen soliden Grundschutz hin.',
      gelb:  'Deine Angaben zeigen mögliche Lücken. Eine unverbindliche Prüfung lohnt sich.',
      rot:   `${pet?.name ?? 'Dein Tier'} ist möglicherweise nicht oder unzureichend abgesichert.`,
    }

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
              Später
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  // P9 – Lead form (pet may be null; LeadForm handles the full entry flow)
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
            Fertig
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
          onNewCheck={() => { setAnswers({}); setSymptomId(''); go(pet ? 'P3' : 'P2') }}
          onEdit={() => go('P2')}
          onSchutz={() => go('P7')}
        />
      </AppShell>
    )
  }

  return null
}
