/**
 * openExternal — öffnet eine URL im systemseitigen Browser.
 *
 * Auf nativen Plattformen (iOS / Android via Capacitor) wird das
 * Capacitor Browser Plugin verwendet, das eine SFSafariViewController
 * (iOS) bzw. einen Chrome Custom Tab (Android) öffnet. Der Nutzer
 * kann mit einem Tipp zur App zurückwechseln.
 *
 * Im Web / PWA wird window.open(_blank) als Fallback genutzt.
 *
 * Sicherheitshinweis: Keine API-Keys, kein Tracking, keine
 * personenbezogenen Daten werden übertragen.
 */
export async function openExternal(url: string): Promise<void> {
  try {
    // window.Capacitor wird vom Capacitor-Runtime injiziert —
    // auf dem Web ist es undefined.
    const cap = (window as unknown as { Capacitor?: { isNativePlatform(): boolean } }).Capacitor
    if (cap?.isNativePlatform?.()) {
      // Dynamischer Import: nur auf nativen Plattformen geladen.
      // Im Web-Bundle wird dieser Branch nie ausgeführt.
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({ url })
      return
    }
  } catch {
    // @capacitor/browser nicht verfügbar oder Fehler — Fallback
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
