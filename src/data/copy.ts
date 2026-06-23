/**
 * Microcopy – verbindlich aus der Prototyp-Spezifikation.
 *
 * Alle Texte dienen der Orientierung und stellen keine medizinische
 * Diagnose, Preisgarantie oder Versicherungsberatung dar.
 */

/** Medical disclaimer – interpolate pet name */
export const disclaimer = (petName: string): string =>
  `TierKosten Kompass stellt keine Diagnose und ersetzt keinen Tierarzt. ` +
  `Die Einschätzung ist eine Orientierung auf Basis deiner Angaben. ` +
  `Bitte lass ${petName} im Zweifel immer tierärztlich abklären.`

/** Cost disclaimer – shown below every cost section */
export const costHint =
  'Die gezeigten Beträge sind grobe Kostenkorridore – keine Preisgarantie. ' +
  'Die tatsächlichen Kosten hängen von Befund, Praxis, GOT-Satz, Notdienst, ' +
  'Diagnostik und Behandlungsumfang ab.'

/** Emergency notice – shown for red-flag cases */
export const emergencyNotice =
  'Deine Angaben können auf einen Notfall hindeuten. ' +
  'Bitte kontaktiere jetzt sofort einen tierärztlichen Notdienst oder eine Tierklinik. ' +
  'Warte damit nicht.'

/** Schutzklärung intro – shown at top of gap check */
export const insuranceHint =
  'Dein Ergebnis zeigt, welche Kosten entstehen können. ' +
  'Wenn du möchtest, kannst du prüfen lassen, ob dein Tier für solche Fälle ' +
  'passend abgesichert ist. Dieser Check ersetzt keine verbindliche Beratung.'

/** DSGVO consent texts – both required, never pre-selected */
export const consentShareText =
  'Ich bin damit einverstanden, dass meine Angaben zur Zuordnung und ' +
  'Schutzklärung an einen passenden Beratungspartner weitergegeben werden. ' +
  'Diese Einwilligung kann ich jederzeit mit Wirkung für die Zukunft widerrufen. ' +
  'Weitere Infos in der Datenschutzerklärung.'

export const consentContactText =
  'Ich bin damit einverstanden, dass mich ein passender Beratungspartner ' +
  'per WhatsApp oder telefonisch kontaktiert. ' +
  'Auch diese Einwilligung kann ich jederzeit widerrufen.'

/** Lead confirmation – shown after successful submission */
export const leadConfirmation =
  'Wir haben deine Angaben erhalten. Ein passender Beratungspartner meldet ' +
  'sich per WhatsApp bei dir und hilft dir, die Schutzmöglichkeiten für dein ' +
  'Tier einzuordnen. Es ist keine Sofortentscheidung nötig.'

/** Onboarding disclaimer */
export const onboardingText =
  'TierKosten Kompass hilft dir einzuschätzen, wie dringend es ist, ' +
  'was es ungefähr kosten kann und ob dein Schutz passt. ' +
  'Die App stellt keine Diagnose und ersetzt keinen Tierarzt. ' +
  'Im Notfall wende dich bitte sofort an einen Tierarzt oder Notdienst.'
