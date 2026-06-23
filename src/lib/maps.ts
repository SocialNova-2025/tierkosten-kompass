/**
 * TierKosten Kompass – Maps helper
 *
 * Generates a Google Maps search URL for "Tierärztlicher Notdienst".
 * No API key needed – opens a regular Maps search in the browser.
 *
 * Strategy: We do NOT maintain a clinic database or call any API.
 * Instead we hand the user off to a live Maps search so they always
 * see current opening hours and emergency status.
 */

const MAPS_BASE = 'https://www.google.com/maps/search/'

/**
 * buildMapsUrl(city?)
 *
 * @param city - Stadt oder PLZ (z.B. "München" oder "80331").
 *               Optional – falls leer, wird "in der Nähe" verwendet
 *               (Maps nutzt dann den Standort des Nutzers).
 *
 * @returns Vollständige, URL-kodierte Google-Maps-Suchadresse.
 */
export function buildMapsUrl(city?: string): string {
  const c = city?.trim()
  const query = c
    ? 'Tierärztlicher Notdienst ' + c
    : 'Tierärztlicher Notdienst in der Nähe'
  return MAPS_BASE + encodeURIComponent(query)
}
