/**
 * TierKosten Kompass - Maps helper
 *
 * Generates Google Maps search URLs for vet-related searches.
 * No API key needed - opens a regular Maps search in the browser.
 *
 * Strategy: We do NOT maintain a clinic database or call any API.
 * Instead we hand the user off to a live Maps search so they always
 * see current opening hours, ratings and availability.
 */

const MAPS_BASE = 'https://www.google.com/maps/search/'

/**
 * buildEmergencyVetMapsUrl(city?)
 * Rot-Fall: Suche nach tieraerztlichem Notdienst.
 *
 * @param city - Stadt oder PLZ (z.B. 'Muenchen' oder '80331').
 *               Optional - falls leer, wird 'in der Naehe' verwendet.
 * @returns URL-kodierte Google-Maps-Suchadresse.
 */
export function buildEmergencyVetMapsUrl(city?: string): string {
  const c = city?.trim()
  const query = c
    ? 'Tierärztlicher Notdienst ' + c
    : 'Tierärztlicher Notdienst in der Nähe'
  return MAPS_BASE + encodeURIComponent(query)
}

/** Backward-compat alias - bestehende Imports bleiben gueltig */
export const buildMapsUrl = buildEmergencyVetMapsUrl

/**
 * buildRegularVetMapsUrl(city?)
 * Gelb-Fall: Suche nach gut bewerteten Tieraerzten (keine Notdienst-Suche).
 *
 * @param city - Stadt oder PLZ. Optional.
 * @returns URL-kodierte Google-Maps-Suchadresse.
 */
export function buildRegularVetMapsUrl(city?: string): string {
  const c = city?.trim()
  const query = c
    ? 'gut bewertete Tierärzte ' + c
    : 'gut bewertete Tierärzte in der Nähe'
  return MAPS_BASE + encodeURIComponent(query)
}
