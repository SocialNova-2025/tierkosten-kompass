/**
 * TierKosten Kompass – localStorage helper
 *
 * Single point of truth for all localStorage access.
 * All functions are crash-safe: corrupt data → null (app falls back to defaults).
 *
 * Keys used (all prefixed with "tkk_"):
 *   tkk_pet       – Pet object (or absent)
 *   tkk_sessions  – CheckSession[] array
 *   tkk_leads     – PersistedLead[] array
 */

// ── Key constants ─────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  PET:      'tkk_pet',
  SESSIONS: 'tkk_sessions',
  LEADS:    'tkk_leads',
} as const

// ── Generic helpers ───────────────────────────────────────────────────────

/**
 * Read a JSON value from localStorage.
 * Returns null if the key is absent, storage is unavailable, or JSON is invalid.
 */
export function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * Write a JSON value to localStorage.
 * Silently ignores failures (private mode, quota exceeded, etc.).
 */
export function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable – no crash, just no persistence
  }
}

/**
 * Remove a single key from localStorage.
 */
export function lsRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently ignore
  }
}

/**
 * Remove all tkk_* keys from localStorage (full app reset).
 */
export function lsClearAll(): void {
  Object.values(STORAGE_KEYS).forEach(lsRemove)
}
