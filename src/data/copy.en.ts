/**
 * copy.en.ts – English UI copy
 * Mirrors the structure of copy.de.ts exactly.
 */
import type { AppCopy } from './copy.de'

export const EN: AppCopy = {
  onboarding: {
    title: 'Before we start',
    body:
      'PetCost Compass helps you assess how urgent a situation is, ' +
      'what it might cost, and whether your protection fits. ' +
      'This app does not provide a diagnosis and does not replace a vet. ' +
      'In an emergency, please contact a vet or emergency service immediately.',
    cta: "Got it, let's go",
    dataPrivacy: 'Privacy & Legal',
  },
  home: {
    label: 'PetCost Compass',
    headline: "What's going on with your pet?",
    subline: 'Before the vet bill surprises you.',
    tagline: '60-second check · Urgency · Cost risk · Coverage',
    features: [
      ['01', 'How urgent is it?', 'Clear guidance – green, yellow, or red.'],
      ['02', 'What might it cost?', 'Three realistic cost scenarios.'],
      ['03', 'Is your coverage right?', 'Possible gaps in your insurance.'],
    ],
    startCta: 'Start quick check →',
    schutzCta: 'Check coverage gaps',
  },
  petProfile: {
    title: 'Your pet',
    subtitle: 'Just 5 fields · under 30 seconds',
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
    cta: 'Continue →',
  },
  symptomGrid: {
    title: (petName: string) => `What are you observing in ${petName}?`,
    hint: 'Select up to 3 observations.',
    primaryBadge: 'Primary observation',
    selectedCount: (n: number) => `${n} / 3 selected`,
    cta: 'Continue →',
    minHint: 'Please select at least 1 observation.',
    maxHint: 'Maximum 3 observations. Remove one to add another.',
  },
  results: {
    selectedSymptomsLabel: 'Selected observations',
  },
  settings: {
    title: 'Settings',
    demosLabel: 'Load demo cases',
    demosDesc: 'Load predefined examples to experience all screens.',
    languageLabel: 'Sprache / Language',
    legalLabel: 'Legal',
    dataLabel: 'Data',
    clearAll: 'Delete all local data',
    footer:
      'PetCost Compass · Demo prototype · All information without warranty · No medical advice',
  },
  common: {
    next: 'Continue →',
    later: 'Later',
    done: 'Done',
    langDe: 'Deutsch',
    langEn: 'English',
    required: '*',
    optional: '(optional)',
  },
}
