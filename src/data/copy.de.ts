/**
 * copy.de.ts â German UI copy (default language)
 *
 * All texts comply with the hard constraints:
 * â No diagnosis, no price guarantee, no insurance recommendation
 * â No forbidden words in Schutzfunnel (Anfrage, Angebot, Abschluss, kaufen, verkaufen)
 */

export interface AppCopy {
  onboarding: {
    title: string
    body: string
    cta: string
    dataPrivacy: string
  }
  home: {
    label: string
    headline: string
    subline: string
    tagline: string
    features: Array<[string, string, string]>
    startCta: string
    schutzCta: string
  }
  petProfile: {
    title: string
    subtitle: string
    speciesLabel: string
    dog: string
    cat: string
    nameLabel: string
    namePlaceholder: string
    nameHint: string
    ageLabel: string
    agePlaceholder: string
    weightLabel: string
    weightPlaceholder: string
    insuranceLabel: string
    yes: string
    no: string
    cityLabel: string
    cityOptional: string
    cityHint: string
    cta: string
  }
  symptomGrid: {
    title: (petName: string) => string
    hint: string
    primaryBadge: string
    selectedCount: (n: number) => string
    cta: string
    minHint: string
    maxHint: string
    /** Ruhige ErklÃ¤rung des Info-Icons (Warnsignal-Marker) */
    redFlagHint: string
  }
  /** Check-Flow: P4a / P4b / P4c question texts */
  checkFlow: {
    stepNames: [string, string, string]
    // P4a
    step1Title: string
    step1Sub: string
    reqHint: string
    // P4b
    step2Title: string
    step2Sub: string
    // P4c
    step3Title: (petName: string) => string
    step3Sub: string
    btnResult: string
    // Q_URIN (katze only)
    q_urin_label: (petName: string) => string
    q_urin_normal: string
    q_urin_troepfchen: string
    q_urin_gar_nicht: string
    // Q_ATEM
    q_atem_label: (petName: string) => string
    q_atem_unauffaellig: string
    q_atem_leicht: string
    q_atem_stark: string
    // Q_BLUT
    q_blut_label: string
    q_blut_nein: string
    q_blut_wenig: string
    q_blut_viel: string
    // Q_UNFALL
    q_unfall_label: string
    q_unfall_nein: string
    q_unfall_ja: string
    // Q_GIFT
    q_gift_label: string
    q_gift_nein: string
    q_gift_unklar: string
    q_gift_ja: string
    // Q_DAUER
    q_dauer_label: (petName: string) => string
    q_dauer_lt12: string
    q_dauer_h12_24: string
    q_dauer_t1_3: string
    q_dauer_laenger: string
    // Q_STAERKE
    q_staerke_label: string
    q_staerke_leicht: string
    q_staerke_mittel: string
    q_staerke_stark: string
    // Q_HAEUFIG
    q_haeufig_label: string
    q_haeufig_einmalig: string
    q_haeufig_mehrmals: string
    q_haeufig_anhaltend: string
    // Q_BELASTET (humpeln only)
    q_belastet_label: (petName: string) => string
    q_belastet_normal: string
    q_belastet_teilweise: string
    q_belastet_gar_nicht: string
    // Q_FRISST
    q_frisst_label: (petName: string) => string
    q_frisst_normal: string
    q_frisst_weniger: string
    q_frisst_gar_nicht: string
    // Q_TRINKT
    q_trinkt_label: (petName: string) => string
    q_trinkt_normal: string
    q_trinkt_weniger: string
    q_trinkt_gar_nicht: string
    // Q_VERHALTEN
    q_verhalten_label: string
    q_verhalten_nein: string
    q_verhalten_etwas: string
    q_verhalten_deutlich: string
    // Q_SCHMERZ
    q_schmerz_label: (petName: string) => string
    q_schmerz_nein: string
    q_schmerz_vielleicht: string
    q_schmerz_ja: string
  }
  results: {
    selectedSymptomsLabel: string
    resultFor: string
  }
  /** UrgencyCard â all visible text, fully i18n */
  urgencyCard: {
    petFallback: string
    gruen: {
      micro: string
      sub: string
      title: string
      body: (name: string) => string
      warn: (name: string) => string
    }
    gelb: {
      micro: string
      sub: string
      title: string
      body: (name: string) => string
      warn: (name: string) => string
    }
    rot: {
      micro: string
      sub: string
      title: string
      body: string
    }
    whenToAct: string
  }
  /** AppShell screen titles */
  appShell: {
    screenPetProfile: string
    screenSymptoms: string
    screenStep: (n: number, total: number) => string
    screenResult: string
    screenRecord: string
  }
  /** Legal disclaimer â interpolated with pet name */
  disclaimer: (petName: string) => string
  settings: {
    title: string
    demosLabel: string
    demosDesc: string
    languageLabel: string
    legalLabel: string
    dataLabel: string
    clearAll: string
    footer: string
  }
  common: {
    next: string
    later: string
    done: string
    langDe: string
    langEn: string
    required: string
    optional: string
  }
}

export const DE: AppCopy = {
  onboarding: {
    title: 'Kurz vorab',
    body:
      'TierKosten Kompass hilft dir einzuschÃ¤tzen, wie dringend es ist ' +
      'und was es ungefÃ¤hr kosten kann. ' +
      'Die App stellt keine Diagnose und ersetzt keinen Tierarzt. ' +
      'Im Notfall wende dich bitte sofort an einen Tierarzt oder Notdienst.',
    cta: "Verstanden, los geht's",
    dataPrivacy: 'Datenschutz & Hinweise',
  },

  home: {
    label: 'TierKosten Kompass',
    headline: 'Was ist mit deinem Tier los?',
    subline: 'Bevor dich die Tierarztrechnung Ã¼berrascht.',
    tagline: 'Schnellcheck in 60 Sekunden Â· Dringlichkeit einschÃ¤tzen Â· Kosten verstehen',
    features: [
      ['01', 'Wie dringend ist es?', 'Klare Handlungsempfehlung â grÃ¼n, gelb oder rot.'],
      ['02', 'Was kostet es ungefÃ¤hr?', 'Drei realistische Kostenszenarien.'],
      ['03', 'Tierarzt oder Notdienst finden', 'Karte Ã¶ffnet direkt in deiner NÃ¤he.'],
    ],
    startCta: 'Akut-Check starten â',
    schutzCta: 'SchutzlÃ¼cke erkennen',
  },

  petProfile: {
    title: 'Dein Tier',
    subtitle: 'Nur 4 Angaben Â· unter 30 Sekunden',
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
    cityHint: 'Wird nur fÃ¼r die Notdienst-Suche verwendet.',
    cta: 'Weiter â',
  },

  symptomGrid: {
    title: (petName: string) => `Was beobachtest du bei ${petName}?`,
    hint: 'WÃ¤hle bis zu 3 Beobachtungen aus.',
    primaryBadge: 'Hauptbeobachtung',
    selectedCount: (n: number) => `${n} / 3 ausgewÃ¤hlt`,
    cta: 'Weiter â',
    minHint: 'Bitte mindestens 1 Beobachtung auswÃ¤hlen.',
    maxHint: 'Maximal 3 Beobachtungen mÃ¶glich. Entferne eine Auswahl, um eine andere hinzuzufÃ¼gen.',
    redFlagHint:
      'Diese Beobachtung kann ein mÃ¶gliches Warnsignal sein. ' +
      'Sie kann sofortige Hilfe erfordern und wird im Check besonders berÃ¼cksichtigt. ' +
      'Das bedeutet nicht automatisch, dass ein Notfall vorliegt.',
  },

  checkFlow: {
    stepNames: ['Sicherheitscheck', 'Verlauf', 'Allgemeinzustand'],
    step1Title: 'Zuerst das Wichtigste',
    step1Sub: 'Damit wir nichts Dringendes Ã¼bersehen.',
    reqHint: 'Bitte alle Pflichtfragen beantworten',
    step2Title: 'Seit wann und wie stark?',
    step2Sub: 'Grobe Angaben reichen vÃ¶llig aus.',
    step3Title: (petName: string) => `Wie geht es ${petName} sonst?`,
    step3Sub: 'Letzte Fragen â dann hast du dein Ergebnis.',
    btnResult: 'Ergebnis anzeigen â',
    q_urin_label: (petName: string) => `Kann ${petName} Urin absetzen?`,
    q_urin_normal: 'Ja, normal',
    q_urin_troepfchen: 'Nur TrÃ¶pfchen',
    q_urin_gar_nicht: 'Gar nicht',
    q_atem_label: (petName: string) => `Wie atmet ${petName}?`,
    q_atem_unauffaellig: 'UnauffÃ¤llig / normal',
    q_atem_leicht: 'Leicht auffÃ¤llig',
    q_atem_stark: 'Stark auffÃ¤llig',
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
    q_dauer_h12_24: '12â24 Stunden',
    q_dauer_t1_3: '1â3 Tage',
    q_dauer_laenger: 'LÃ¤nger als 3 Tage',
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
    q_verhalten_label: 'Verhalten verÃ¤ndert?',
    q_verhalten_nein: 'Nein, normal',
    q_verhalten_etwas: 'Etwas (schont sich, unruhig)',
    q_verhalten_deutlich: 'Deutlich (apathisch, sehr unruhig)',
    q_schmerz_label: (petName: string) => `Wirkt ${petName} schmerzhaft?`,
    q_schmerz_nein: 'Nein',
    q_schmerz_vielleicht: 'Vielleicht',
    q_schmerz_ja: 'Ja',
  },

  results: {
    selectedSymptomsLabel: 'AusgewÃ¤hlte Beobachtungen',
    resultFor: 'Ergebnis fÃ¼r',
  },

  urgencyCard: {
    petFallback: 'deinem Tier',
    gruen: {
      micro: 'EinschÃ¤tzung',
      sub: 'Beobachten',
      title: 'Aktuell kein Notfall erkennbar',
      body: (name: string) =>
        `Deine Angaben deuten nicht auf einen akuten Notfall hin. Beobachte ${name} aufmerksam und dokumentiere den Verlauf.`,
      warn: (name: string) =>
        `Sofort zum Tierarzt, wenn ${name} sehr schlapp wird, nicht mehr frisst oder trinkt, ` +
        `Blut sichtbar ist oder die Symptome deutlich schlimmer werden.`,
    },
    gelb: {
      micro: 'EinschÃ¤tzung',
      sub: 'Zeitnah zum Tierarzt',
      title: 'TierÃ¤rztliche AbklÃ¤rung empfohlen',
      body: (name: string) => `Bitte lass ${name} zeitnah vom Tierarzt untersuchen. Warte nicht zu lange.`,
      warn: (name: string) =>
        `Sofort zum Notdienst, wenn sich der Zustand rasch verschlechtert, ` +
        `Blut sichtbar wird oder ${name} sehr schlapp wirkt.`,
    },
    rot: {
      micro: 'Dringend',
      sub: 'Sofort handeln',
      title: 'Jetzt sofort handeln',
      body: 'Deine Angaben kÃ¶nnen auf einen Notfall hindeuten. Bitte kontaktiere jetzt sofort einen tierÃ¤rztlichen Notdienst oder eine Tierklinik. Warte damit nicht.',
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
    `Die EinschÃ¤tzung ist eine Orientierung auf Basis deiner Angaben. ` +
    `Bitte lass ${petName} im Zweifel immer tierÃ¤rztlich abklÃ¤ren.`,

  settings: {
    title: 'Einstellungen',
    demosLabel: 'Demo-FÃ¤lle laden',
    demosDesc: 'Lade vordefinierte Beispiele, um alle Screens zu erleben.',
    languageLabel: 'Sprache / Language',
    legalLabel: 'Rechtliches',
    dataLabel: 'Daten',
    clearAll: 'Alle lokalen Daten lÃ¶schen',
    footer: 'TierKosten Kompass stellt keine Diagnose und ersetzt keinen Tierarzt.',
  },

  common: {
    next: 'Weiter â',
    later: 'SpÃ¤ter',
    done: 'Fertig',
    langDe: 'Deutsch',
    langEn: 'English',
    required: '*',
    optional: '(optional)',
  },
}
