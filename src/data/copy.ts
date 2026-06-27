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

/** Insurance disclaimer – shown at top of gap check */
export const insuranceHint =
  'Dieser Check ersetzt keine Versicherungsberatung – er zeigt mögliche Lücken. ' +
  'Für eine verbindliche Prüfung wirst du – nur mit deiner Einwilligung – ' +
  'an einen lizenzierten Partner weitergeleitet.'

/** DSGVO consent texts – both required, never pre-selected */
export const consentShareText =
  'Ich willige ein, dass meine angegebenen Kontakt- und Tierdaten zum Zweck einer ' +
  'Schutz-/Versicherungsanfrage an einen lizenzierten Partner weitergegeben werden. ' +
  'Diese Einwilligung kann ich jederzeit mit Wirkung für die Zukunft widerrufen. ' +
  'Weitere Infos in der Datenschutzerklärung.'

export const consentContactText =
  'Ich willige ein, dass mich der Partner zur Bearbeitung meiner Anfrage per Telefon ' +
  'und/oder E-Mail kontaktiert. Auch diese Einwilligung kann ich jederzeit widerrufen.'

/** Lead confirmation – shown after successful submission */
export const leadConfirmation =
  'Danke – deine Anfrage ist eingegangen. Ein lizenzierter Partner meldet sich ' +
  'innerhalb von 1–2 Werktagen, um deinen Schutz zu prüfen. Es entsteht dir ' +
  'dadurch keine Verpflichtung. Du kannst deine Einwilligung jederzeit widerrufen.'

/** Onboarding disclaimer – kein Schutz/Insurance-Bezug */
export const onboardingText =
  'TierKosten Kompass hilft dir einzuschätzen, wie dringend es ist ' +
  'und was es ungefähr kosten kann. ' +
  'Die App stellt keine Diagnose und ersetzt keinen Tierarzt. ' +
  'Im Notfall wende dich bitte sofort an einen Tierarzt oder Notdienst.'
