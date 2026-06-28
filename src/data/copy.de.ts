/**
 * copy.de.ts – German UI copy (default language)
 *
 * All texts comply with the hard constraints:
 * – No diagnosis, no price guarantee, no insurance recommendation
 * – No forbidden words in Schutzfunnel (Anfrage, Angebot, Abschluss, kaufen, verkaufen)
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
    /** Ruhige Erklärung des roten Punktes (Warnsignal-Marker) */
    redFlagHint: string
  }
  results: {
    selectedSymptomsLabel: string
  }
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
      'TierKosten Kompass hilft dir einzuschätzen, wie dringend es ist ' +
      'und was es ungefähr kosten kann. ' +
      'Die App stellt keine Diagnose und ersetzt keinen Tierarzt. ' +
      'Im Notfall wende dich bitte sofort an einen Tierarzt oder Notdienst.',
    cta: "Verstanden, los geht's",
    dataPrivacy: 'Datenschutz & Hinweise',
  },

  home: {
    label: 'TierKosten Kompass',
    headline: 'Was ist mit deinem Tier los?',
    subline: 'Bevor dich die Tierarztrechnung überrascht.',
    tagline: 'Schnellcheck in 60 Sekunden · Dringlichkeit einschätzen · Kosten verstehen',
    features: [
      ['01', 'Wie dringend ist es?', 'Klare Handlungsempfehlung – grün, gelb oder rot.'],
      ['02', 'Was kostet es ungefähr?', 'Drei realistische Kostenszenarien.'],
      ['03', 'Tierarzt oder Notdienst finden', 'Karte öffnet direkt in deiner Nähe.'],
    ],
    startCta: 'Akut-Check starten →',
    schutzCta: 'Schutzlücke erkennen',
  },

  petProfile: {
    title: 'Dein Tier',
    subtitle: 'Nur 4 Angaben · unter 30 Sekunden',
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
    cityHint: 'Wird nur für die Notdienst-Suche verwendet.',
    cta: 'Weiter →',
  },

  symptomGrid: {
    title: (petName: string) => `Was beobachtest du bei ${petName}?`,
    hint: 'Wähle bis zu 3 Beobachtungen aus.',
    primaryBadge: 'Hauptbeobachtung',
    selectedCount: (n: number) => `${n} / 3 ausgewählt`,
    cta: 'Weiter →',
    minHint: 'Bitte mindestens 1 Beobachtung auswählen.',
    maxHint: 'Maximal 3 Beobachtungen möglich. Entferne eine Auswahl, um eine andere hinzuzufügen.',
    redFlagHint:
      'Roter Punkt = mögliches Warnsignal. Diese Beobachtungen können sofortige Hilfe erfordern ' +
      'und werden im Check besonders berücksichtigt. ' +
      'Das bedeutet nicht automatisch, dass ein Notfall vorliegt.',
  },

  results: {
    selectedSymptomsLabel: 'Ausgewählte Beobachtungen',
  },

  settings: {
    title: 'Einstellungen',
    demosLabel: 'Demo-Fälle laden',
    demosDesc: 'Lade vordefinierte Beispiele, um alle Screens zu erleben.',
    languageLabel: 'Sprache / Language',
    legalLabel: 'Rechtliches',
    dataLabel: 'Daten',
    clearAll: 'Alle lokalen Daten löschen',
    footer:
      'TierKosten Kompass · Beta · Alle Angaben ohne Gewähr · Kein medizinischer Rat',
  },

  common: {
    next: 'Weiter →',
    later: 'Später',
    done: 'Fertig',
    langDe: 'Deutsch',
    langEn: 'English',
    required: '*',
    optional: '(optional)',
  },
}
