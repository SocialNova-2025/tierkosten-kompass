/**
 * copy.en.ts â English UI copy
 *
 * Mirrors the structure of copy.de.ts exactly.
 * Legal disclaimer: All texts comply with the same constraints as the German copy.
 */
import type { AppCopy } from './copy.de'

export const EN: AppCopy = {
  onboarding: {
    title: 'Before we start',
    body:
      'TierKosten Kompass helps you assess how urgent a situation is ' +
      'and what it might cost. ' +
      'This app does not provide a diagnosis and does not replace a vet. ' +
      'In an emergency, please contact a vet or emergency service immediately.',
    cta: "Got it, let's go",
    dataPrivacy: 'Privacy & Legal',
  },

  home: {
    label: 'TierKosten Kompass',
    headline: "What's going on with your pet?",
    subline: 'Before the vet bill surprises you.',
    tagline: '60-second check Â· Assess urgency Â· Understand costs',
    features: [
      ['01', 'How urgent is it?', 'Clear guidance â green, yellow, or red.'],
      ['02', 'What might it cost?', 'Three realistic cost scenarios.'],
      ['03', 'Find a vet or emergency service', 'Map opens near you instantly.'],
    ],
    startCta: 'Start quick check â',
    schutzCta: 'Check coverage gaps',
  },

  petProfile: {
    title: 'Your pet',
    subtitle: 'Just 4 fields Â· under 30 seconds',
    speciesLabel: 'Species',
    dog: 'Dog',
    cat: 'Cat',
    nameLabel: "Your pet's name",
    namePlaceholder: 'e.g. Bruno',
    nameHint: "This is your dog's or cat's name.",
    ageLabel: 'Age (years)',
    agePlaceholder: 'e.g. 5',
    weightLabel: 'Weight (kg)',
    weightPlaceholder: 'e.g. 22',
    insuranceLabel: 'Insurance in place?',
    yes: 'Yes',
    no: 'No',
    cityLabel: 'City or postcode',
    cityOptional: '(optional)',
    cityHint: 'Used only for finding nearby emergency vets.',
    cta: 'Continue â',
  },

  symptomGrid: {
    title: (petName: string) => `What are you observing in ${petName}?`,
    hint: 'Select up to 3 observations.',
    primaryBadge: 'Primary observation',
    selectedCount: (n: number) => `${n} / 3 selected`,
    cta: 'Continue â',
    minHint: 'Please select at least 1 observation.',
    maxHint: 'Maximum 3 observations. Remove one to add another.',
    redFlagHint:
      'This observation may be a possible warning sign. ' +
      'It may require immediate help and is weighted more strongly in the check. ' +
      'This does not automatically mean it is an emergency.',
  },

  checkFlow: {
    stepNames: ['Safety check', 'Duration', 'General condition'],
    step1Title: 'First things first',
    step1Sub: "Let's make sure nothing urgent is missed.",
    reqHint: 'Please answer all required questions',
    step2Title: 'Since when and how severe?',
    step2Sub: 'Rough answers are perfectly fine.',
    step3Title: (petName: string) => `How is ${petName} doing otherwise?`,
    step3Sub: 'Last questions â then you have your result.',
    btnResult: 'Show result â',
    q_urin_label: (petName: string) => `Can ${petName} urinate?`,
    q_urin_normal: 'Yes, normally',
    q_urin_troepfchen: 'Only drops',
    q_urin_gar_nicht: 'Not at all',
    q_atem_label: (petName: string) => `How is ${petName} breathing?`,
    q_atem_unauffaellig: 'Normal / unremarkable',
    q_atem_leicht: 'Slightly abnormal',
    q_atem_stark: 'Strongly abnormal',
    q_blut_label: 'Is blood visible?',
    q_blut_nein: 'No',
    q_blut_wenig: 'A little',
    q_blut_viel: 'A lot',
    q_unfall_label: 'Was there an accident or fall?',
    q_unfall_nein: 'No',
    q_unfall_ja: 'Yes',
    q_gift_label: 'Suspicion of poisoning or foreign object?',
    q_gift_nein: 'No',
    q_gift_unklar: 'Unclear',
    q_gift_ja: 'Yes',
    q_dauer_label: (petName: string) => `How long has ${petName} been showing this?`,
    q_dauer_lt12: 'Less than 12 hours',
    q_dauer_h12_24: '12â24 hours',
    q_dauer_t1_3: '1â3 days',
    q_dauer_laenger: 'More than 3 days',
    q_staerke_label: 'How severe is it?',
    q_staerke_leicht: 'Mild',
    q_staerke_mittel: 'Moderate',
    q_staerke_stark: 'Severe',
    q_haeufig_label: 'How often does it occur?',
    q_haeufig_einmalig: 'Once',
    q_haeufig_mehrmals: 'Several times',
    q_haeufig_anhaltend: 'Ongoing / continuous',
    q_belastet_label: (petName: string) => `Is ${petName} still using the leg?`,
    q_belastet_normal: 'Yes, normally',
    q_belastet_teilweise: 'Partially only',
    q_belastet_gar_nicht: 'Not at all',
    q_frisst_label: (petName: string) => `Is ${petName} eating?`,
    q_frisst_normal: 'Normally',
    q_frisst_weniger: 'Less than usual',
    q_frisst_gar_nicht: 'Not at all',
    q_trinkt_label: (petName: string) => `Is ${petName} drinking?`,
    q_trinkt_normal: 'Normally',
    q_trinkt_weniger: 'Less than usual',
    q_trinkt_gar_nicht: 'Not at all',
    q_verhalten_label: 'Any changes in behaviour?',
    q_verhalten_nein: 'No, normal',
    q_verhalten_etwas: 'Somewhat (guarded, restless)',
    q_verhalten_deutlich: 'Clearly different (lethargic, very restless)',
    q_schmerz_label: (petName: string) => `Does ${petName} appear to be in pain?`,
    q_schmerz_nein: 'No',
    q_schmerz_vielleicht: 'Maybe',
    q_schmerz_ja: 'Yes',
  },

  results: {
    selectedSymptomsLabel: 'Selected observations',
    resultFor: 'Result for',
  },

  urgencyCard: {
    petFallback: 'your pet',
    gruen: {
      micro: 'Assessment',
      sub: 'Monitor',
      title: 'No emergency currently apparent',
      body: (name: string) =>
        `Your answers do not suggest an acute emergency. Watch ${name} closely and document any changes.`,
      warn: (name: string) =>
        `Go to a vet immediately if ${name} becomes very lethargic, stops eating or drinking, ` +
        `blood becomes visible, or symptoms get significantly worse.`,
    },
    gelb: {
      micro: 'Assessment',
      sub: 'See a vet soon',
      title: 'Vet check recommended',
      body: (name: string) => `Please have ${name} examined by a vet soon. Do not wait too long.`,
      warn: (name: string) =>
        `Go to an emergency vet immediately if the condition worsens quickly, ` +
        `blood becomes visible, or ${name} becomes very lethargic.`,
    },
    rot: {
      micro: 'Urgent',
      sub: 'Act immediately',
      title: 'Act now immediately',
      body: 'Your answers may indicate an emergency. Please contact an emergency vet or animal clinic right now. Do not wait.',
    },
    whenToAct: 'When to act immediately:',
  },

  appShell: {
    screenPetProfile: 'Pet Profile',
    screenSymptoms: 'Symptoms',
    screenStep: (n: number, total: number) => `Step ${n} / ${total}`,
    screenResult: 'Result',
    screenRecord: 'Pet Record',
  },

  disclaimer: (petName: string) =>
    `TierKosten Kompass does not provide a diagnosis and does not replace a vet. ` +
    `The assessment is a guide based on your answers. ` +
    `When in doubt, always have ${petName} examined by a vet.`,

  settings: {
    title: 'Settings',
    demosLabel: 'Load demo cases',
    demosDesc: 'Load predefined examples to experience all screens.',
    languageLabel: 'Sprache / Language',
    legalLabel: 'Legal',
    dataLabel: 'Data',
    clearAll: 'Delete all local data',
    footer: 'TierKosten Kompass does not provide a diagnosis and does not replace a veterinarian.',
  },

  common: {
    next: 'Continue â',
    later: 'Later',
    done: 'Done',
    langDe: 'Deutsch',
    langEn: 'English',
    required: '*',
    optional: '(optional)',
  },
}
