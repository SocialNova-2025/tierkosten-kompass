/**
 * copy.de.ts - German UI copy (default language)
 *
 * All texts comply with the hard constraints:
 * - No diagnosis, no price guarantee, no insurance recommendation
 * - No forbidden words in Schutzfunnel
 */

export interface AppCopy {
  onboarding: { title: string; body: string; cta: string; dataPrivacy: string }
  home: { label: string; headline: string; subline: string; tagline: string; features: Array<[string, string, string]>; startCta: string; schutzCta: string }
  petProfile: { title: string; subtitle: string; speciesLabel: string; dog: string; cat: string; nameLabel: string; namePlaceholder: string; nameHint: string; ageLabel: string; agePlaceholder: string; weightLabel: string; weightPlaceholder: string; insuranceLabel: string; yes: string; no: string; cityLabel: string; cityOptional: string; cityHint: string; cta: string }
  symptomGrid: { title: (petName: string) => string; hint: string; primaryBadge: string; selectedCount: (n: number) => string; cta: string; minHint: string; maxHint: string; redFlagHint: string }
  checkFlow: { stepNames: [string, string, string]; step1Title: string; step1Sub: string; reqHint: string; step2Title: string; step2Sub: string; step3Title: (petName: string) => string; step3Sub: string; btnResult: string; q_urin_label: (petName: string) => string; q_urin_normal: string; q_urin_troepfchen: string; q_urin_gar_nicht: string; q_atem_label: (petName: string) => string; q_atem_unauffaellig: string; q_atem_leicht: string; q_atem_stark: string; q_blut_label: string; q_blut_nein: string; q_blut_wenig: string; q_blut_viel: string; q_unfall_label: string; q_unfall_nein: string; q_unfall_ja: string; q_gift_label: string; q_gift_nein: string; q_gift_unklar: string; q_gift_ja: string; q_dauer_label: (petName: string) => string; q_dauer_lt12: string; q_dauer_h12_24: string; q_dauer_t1_3: string; q_dauer_laenger: string; q_staerke_label: string; q_staerke_leicht: string; q_staerke_mittel: string; q_staerke_stark: string; q_haeufig_label: string; q_haeufig_einmalig: string; q_haeufig_mehrmals: string; q_haeufig_anhaltend: string; q_belastet_label: (petName: string) => string; q_belastet_normal: string; q_belastet_teilweise: string; q_belastet_gar_nicht: string; q_frisst_label: (petName: string) => string; q_frisst_normal: string; q_frisst_weniger: string; q_frisst_gar_nicht: string; q_trinkt_label: (petName: string) => string; q_trinkt_normal: string; q_trinkt_weniger: string; q_trinkt_gar_nicht: string; q_verhalten_label: string; q_verhalten_nein: string; q_verhalten_etwas: string; q_verhalten_deutlich: string; q_schmerz_label: (petName: string) => string; q_schmerz_nein: string; q_schmerz_vielleicht: string; q_schmerz_ja: string }
  results: { selectedSymptomsLabel: string; resultFor: string }
  urgencyCard: { petFallback: string; gruen: { micro: string; sub: string; title: string; body: (name: string) => string; warn: (name: string) => string }; gelb: { micro: string; sub: string; title: string; body: (name: string) => string; warn: (name: string) => string }; rot: { micro: string; sub: string; title: string; body: string }; whenToAct: string }
  appShell: { screenPetProfile: string; screenSymptoms: string; screenStep: (n: number, total: number) => string; screenResult: string; screenRecord: string }
  disclaimer: (petName: string) => string
  settings: { title: string; demosLabel: string; demosDesc: string; languageLabel: string; legalLabel: string; dataLabel: string; clearAll: string; footer: string }
  common: { next: string; later: string; done: string; langDe: string; langEn: string; required: string; optional: string }
}

export const DE: AppCopy = {
  onboarding: {
    title: 'Kurz vorab',
    body: 'TierKosten Kompass hilft dir einzusch\u00e4tzen, wie dringend es ist und was es ungef\u00e4hr kosten kann. Die App stellt keine Diagnose und ersetzt keinen Tierarzt. Im Notfall wende dich bitte sofort an einen Tierarzt oder Notdienst.',
    cta: "Verstanden, los geht's",
    dataPrivacy: 'Datenschutz & Hinweise',
  },
  home: {
    label: 'TierKosten Kompass',
    headline: 'Was ist mit deinem Tier los?',
    subline: 'Bevor dich die Tierarztrechnung \u00fcberrascht.',
    tagline: 'Schnellcheck in 60 Sekunden \u00b7 Dringlichkeit einsch\u00e4tzen \u00b7 Kosten verstehen',
    features: [
      ['01', 'Wie dringend ist es?', 'Klare Handlungsempfehlung \u2013 gr\u00fcn, gelb oder rot.'],
      ['02', 'Was kostet es ungef\u00e4hr?', 'Drei realistische Kostenszenarien.'],
      ['03', 'Tierarzt oder Notdienst finden', 'Karte \u00f6ffnet direkt in deiner N\u00e4he.'],
    ],
    startCta: 'Akut-Check starten ->',
    schutzCta: 'Schutzl\u00fccke erkennen',
  },
  petProfile: {
    title: 'Dein Tier',
    subtitle: 'Nur 4 Angaben \u00b7 unter 30 Sekunden',
    speciesLabel: 'Tierart',
    dog: 'Hund',
    cat: 'Katze',
    nameLabel: 'Name deines Vierbeiners',
    namePlaceholder: 'z. B. Bruno',
    nameHint: 'Gemeint ist der Name deines Hundes oder deiner Katze.',
    ageLabel: 'Alter (Jahre)',
    agePlaceholder: 'z. B. 5',
    weightLabel: 'Gewicht (kg)',
    weightPlaceholder: 'z. B. 22',
    insuranceLabel: 'Versicherung vorhanden?',
    yes: 'Ja',
    no: 'Nein',
    cityLabel: 'Stadt oder PLZ',
    cityOptional: '(optional)',
    cityHint: 'Wird nur f\u00fcr die Notdienst-Suche verwendet.',
    cta: 'Weiter ->',
  },
  symptomGrid: {
    title: (petName: string) => `Was beobachtest du bei ${petName}?`,
    hint: 'W\u00e4hle bis zu 3 Beobachtungen aus.',
    primaryBadge: 'Hauptbeobachtung',
    selectedCount: (n: number) => `${n} / 3 ausgew\u00e4hlt`,
    cta: 'Weiter ->',
    minHint: 'Bitte mindestens 1 Beobachtung ausw\u00e4hlen.',
    maxHint: 'Maximal 3 Beobachtungen m\u00f6glich. Entferne eine Auswahl, um eine andere hinzuzuf\u00fcgen.',
    redFlagHint: 'Roter Punkt: Diese Beobachtung kann ein m\u00f6gliches Warnsignal sein. Sie kann sofortige Hilfe erfordern und wird im Check besonders ber\u00fccksichtigt. Das bedeutet nicht automatisch, dass ein Notfall vorliegt.',
  },
  checkFlow: {
    stepNames: ['Sicherheitscheck', 'Verlauf', 'Allgemeinzustand'],
    step1Title: 'Zuerst das Wichtigste',
    step1Sub: 'Damit wir nichts Dringendes \u00fcbersehen.',
    reqHint: 'Bitte alle Pflichtfragen beantworten',
    step2Title: 'Seit wann und wie stark?',
    step2Sub: 'Grobe Angaben reichen v\u00f6llig aus.',
    step3Title: (petName: string) => `Wie geht es ${petName} sonst?`,
    step3Sub: 'Letzte Fragen \u2013 dann hast du dein Ergebnis.',
    btnResult: 'Ergebnis anzeigen ->',
    q_urin_label: (petName: string) => `Kann ${petName} Urin absetzen?`,
    q_urin_normal: 'Ja, normal',
    q_urin_troepfchen: 'Nur Tr\u00f6pfchen',
    q_urin_gar_nicht: 'Gar nicht',
    q_atem_label: (petName: string) => `Wie atmet ${petName}?`,
    q_atem_unauffaellig: 'Unauff\u00e4llig / normal',
    q_atem_leicht: 'Leicht auff\u00e4llig',
    q_atem_stark: 'Stark auff\u00e4llig',
    q_blut_label: 'Ist Blut sichtbar?',
    q_blut_nein: 'Nein',
    q_blut_wenig: 'Wenig',
    q_blut_viel: 'Viel',
    q_unfall_label: 'Gab es einen Unfall oder Sturz?',
    q_unfall_nein: 'Nein',
    q_unfall_ja: 'Ja',
    q_gift_label: 'Verdacht auf Gift oder Fremdobjekt?',
    q_gift_nein: 'Nein',
    q_gift_unklar: 'Unklar',
    q_gift_ja: 'Ja',
    q_dauer_label: (petName: string) => `Seit wann zeigt ${petName} das?`,
    q_dauer_lt12: 'Weniger als 12 Stunden',
    q_dauer_h12_24: '12-24 Stunden',
    q_dauer_t1_3: '1-3 Tage',
    q_dauer_laenger: 'L\u00e4nger als 3 Tage',
    q_staerke_label: 'Wie stark ist es?',
    q_staerke_leicht: 'Leicht',
    q_staerke_mittel: 'Mittel',
    q_staerke_stark: 'Stark',
    q_haeufig_label: 'Wie oft tritt es auf?',
    q_haeufig_einmalig: 'Einmalig',
    q_haeufig_mehrmals: 'Mehrmals',
    q_haeufig_anhaltend: 'Anhaltend / dauerhaft',
    q_belastet_label: (petName: string) => `Belastet ${petName} das Bein noch?`,
    q_belastet_normal: 'Ja, normal',
    q_belastet_teilweise: 'Nur teilweise',
    q_belastet_gar_nicht: 'Gar nicht',
    q_frisst_label: (petName: string) => `Frisst ${petName}?`,
    q_frisst_normal: 'Normal',
    q_frisst_weniger: 'Weniger als sonst',
    q_frisst_gar_nicht: 'Gar nicht',
    q_trinkt_label: (petName: string) => `Trinkt ${petName}?`,
    q_trinkt_normal: 'Normal',
    q_trinkt_weniger: 'Weniger als sonst',
    q_trinkt_gar_nicht: 'Gar nicht',
    q_verhalten_label: 'Verhalten ver\u00e4ndert?',
    q_verhalten_nein: 'Nein, normal',
    q_verhalten_etwas: 'Etwas (schont sich, unruhig)',
    q_verhalten_deutlich: 'Deutlich(apathisch, sehr unruhig)',
    q_schmerz_label: (petName: string) => `Wirkt ${petName} schmerzhaft?`,
    q_schmerz_nein: 'Nein',
    q_schmerz_vielleicht: 'Vielleicht',
    q_schmerz_ja: 'Ja',
  },
  results: {
    selectedSymptomsLabel: 'Ausgew\u00e4hlte Beobachtungen',
    resultFor: 'Ergebnis f\u00fcr',
  },
  urgencyCard: {
    petFallback: 'deinem Tier',
    gruen: {
      micro: 'Einsch\u00e4tzung',
      sub: 'Beobachten',
      title: 'Aktuell kein Notfall erkennbar',
      body: (name: string) => `Deb�e Aggaben deuten nicht auf einen akuten Notfall hin. Beobachte ${name} aufmerksam und dokumentiere den Verlauf.`,
      warn: (name: string) => `Sofort zum Tierarzt, wenn ${name} sehr schlapp wird, nicht mehr frisst oder trinkt, Blut sichtbar ist oder die Symptome deutlich schlimmer werden.`,
    },
    gelb: {
      micro: 'Einsch\u00e4tzung',
      sub: 'Zeitnah zum Tierarzt',
      title: 'Tier\u00e4rztliche Abkl\u00e4rung empfohlen',
      body: (name: string) => `Bitte lass ${name} zeitnah vom Tierarzt untersuchen. Warte nicht zu lange.`,
      warn: (name: string) => `Sofort zum Notdienst, wenn sich der Zustand rasch verschlechtert, Blut sichtbar wird oder ${name} sehr schlapp wirkt.`,
    },
    rot: {
      micro: 'Dringend',
      sub: 'Sofort handeln',
      title: 'Jetzt sofort handeln',
      body: 'Deine Angaben k\u00f6nnen auf einen Notfall hindeuten. Bitte kontaktiere jetzt sofort einen tier\u00e4rztlichen Notdienst oder eine Tierklinik. Warte damit nicht.',
    },
    whenToAct: 'Wann sofort handeln:',
  },
  appShell: {
    screenPetProfile: 'Tierprofil',
    screenSymptoms: 'Symptome',
    screenStep: (n: number, total: number) => `Schritt ${n} / ${total}`,
    screenResult: 'Ergebnis',
    screenRecord: 'Tierakte',
  },
  disclaimer: (petName: string) =>
    `TierKosten Kompass stellt keine Diagnose und ersetzt keinen Tierarzt. ` +
    `Die Einsch\u00e4tzung ist eine Orientierung auf Basis deiner Angaben. ` +
    `Bitte lass ${petName} im Zweifel immer tier\u00e4rztlich abkl\u00e4ren.`,
  settings: {
    title: 'Einstellungen',
    demosLabel: 'Demo-F\u00e4lle laden',
    demosDesc: 'Lade vordefinierte Beispiele, um alle Screens zu erleben.',
    languageLabel: 'Sprache / Language',
    legalLabel: 'Rechtliches',
    dataLabel: 'Daten',
    clearAll: 'Alle lokalen Daten l\u00f6schen',
    footer: 'TierKosten Kompass Beta \u00b7 ohne Gew\u00e4hr \u00b7 Kein medizinischer Rat. Stellt keine Diagnose und ersetzt keinen Tierarzt.',
  },
  common: {
    next: 'Weiter ->',
    later: 'Sp\u00e4ter',
    done: 'Fertig',
    langDe: 'Deutsch',
    langEn: 'English',
    required: '*',
    optional: '(optional)',
  },
}
