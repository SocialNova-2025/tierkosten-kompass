# TierKosten Kompass

Mobile Web-App (PWA) für Hunde- und Katzenhalter in Deutschland.  
Hilft im Akutmoment – ohne Diagnose zu stellen.

**Was die App tut:**
- Dringlichkeit einschätzen (Grün / Gelb / Rot)
- Mögliche Tierarztkosten als Orientierung zeigen
- Versicherungs- / Schutzlücken sichtbar machen
- Optionales Lead-Formular für eine unverbindliche Schutzprüfung

**Was die App ausdrücklich nicht tut:**  
Keine Diagnose, keine Behandlungsempfehlung, keine Medikamentendosierung,  
keine Preisgarantie, keine verbindliche Versicherungsberatung.

---

## Lokale Entwicklung

```bash
npm install
npm run dev       # http://localhost:5173
npm run test      # Vitest – alle Tests (53 erwartet)
npm run build     # TypeScript-Check + Vite-Build → dist/
npm run preview   # lokale Vorschau des Builds
```

Anforderungen: **Node ≥ 18**, npm ≥ 9

---

## Vercel Deployment

### Einmalig: Repo verbinden

1. Projekt als Git-Repository anlegen und zu GitHub / GitLab / Bitbucket pushen
2. [vercel.com](https://vercel.com) → **Add New Project** → Repo auswählen

### Vercel Einstellungen

Vercel erkennt das Projekt automatisch als Vite-App (via `vercel.json`).  
Alle Werte sind bereits konfiguriert – nichts manuell eintragen nötig:

| Einstellung | Wert |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | 18.x oder 20.x (LTS) |

### Environment Variables

**Keine erforderlich.** Die App läuft vollständig ohne Backend und ohne externe APIs.  
Alle Daten werden lokal im `localStorage` des Browsers gespeichert (`tkk_pet`, `tkk_sessions`, `tkk_leads`).

### Deploy auslösen

Nach dem Verbinden des Repos deployed Vercel automatisch bei jedem Push auf den Haupt-Branch.  
Preview-Deployments werden für jeden weiteren Branch / Pull Request automatisch erstellt.

---

## Technischer Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build-Tool | Vite 5 |
| Styling | Reines CSS (`src/styles/global.css`) – kein Tailwind |
| Icons | Tabler Icons (CDN) |
| Tests | Vitest (Node-Umgebung, kein jsdom nötig) |
| Persistenz | localStorage (client-only) |
| Hosting | Vercel (statisches Deployment) |

---

## Projektstruktur

```
src/
  App.tsx                  # Haupt-State + Navigation (Screen-basiert)
  types.ts                 # Alle TypeScript-Types
  components/              # UI-Komponenten (rein presentational)
  data/                    # Statische Inhalte (Symptome, Kosten, Texte, Demo-Fälle)
  lib/                     # Logik (Urgency, Gap-Check, Lead-Validierung, Storage)
  styles/                  # global.css + Design-Tokens
  tests/                   # Vitest-Tests (logic.test.ts, storage.test.ts)
public/
  manifest.json            # PWA-Manifest
```

## Demo-Fälle (unveränderlich, QA-geprüft)

| Fall | Tier | Symptom | Score | Stufe |
|---|---|---|---|---|
| Bruno | Hund | Humpelt | 8 | 🟡 Gelb |
| Mimi | Katze | Frisst nicht | 11 | 🟡 Gelb |
| Rocky | Hund | Erbricht | 1 | 🟢 Grün |
| Felix | Katze | Kann nicht urinieren | 99 | 🔴 Rot (Red-Flag Override) |

Laden über: **Einstellungen → Demo-Fälle laden**
