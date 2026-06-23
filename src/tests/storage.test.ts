/**
 * TierKosten Kompass – Storage helper tests
 *
 * Runs in Vitest with environment: 'node'.
 * localStorage is not available in Node; we stub it to verify
 * that all helpers are crash-safe under all conditions.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { lsGet, lsSet, lsRemove, lsClearAll, STORAGE_KEYS } from '../lib/storage'

// ── Minimal localStorage stub ─────────────────────────────────────────────
// Vitest runs in node by default; jsdom is not required here because
// we're testing the helper's own crash-safety logic.

type Store = Record<string, string>

function makeStorage(initial: Store = {}): Storage {
  const store: Store = { ...initial }
  return {
    getItem:    (k) => store[k] ?? null,
    setItem:    (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
    clear:      () => { for (const k in store) delete store[k] },
    get length() { return Object.keys(store).length },
    key:        (i) => Object.keys(store)[i] ?? null,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('STORAGE_KEYS', () => {
  it('all keys start with tkk_', () => {
    for (const k of Object.values(STORAGE_KEYS)) {
      expect(k.startsWith('tkk_')).toBe(true)
    }
  })

  it('exports PET, SESSIONS, LEADS', () => {
    expect(STORAGE_KEYS.PET).toBe('tkk_pet')
    expect(STORAGE_KEYS.SESSIONS).toBe('tkk_sessions')
    expect(STORAGE_KEYS.LEADS).toBe('tkk_leads')
  })
})

describe('lsGet – crash safety (no real localStorage in node)', () => {
  it('returns null when localStorage is unavailable', () => {
    // In a node environment localStorage is undefined → lsGet must not throw
    const result = lsGet<{ x: number }>('any_key')
    expect(result).toBeNull()
  })

  it('returns null for non-existent keys (stub)', () => {
    const ls = makeStorage()
    const orig = (globalThis as Record<string, unknown>).localStorage
    ;(globalThis as Record<string, unknown>).localStorage = ls
    expect(lsGet('missing_key')).toBeNull()
    ;(globalThis as Record<string, unknown>).localStorage = orig
  })

  it('returns parsed value when key exists (stub)', () => {
    const ls = makeStorage({ my_key: JSON.stringify({ score: 42 }) })
    const orig = (globalThis as Record<string, unknown>).localStorage
    ;(globalThis as Record<string, unknown>).localStorage = ls
    expect(lsGet<{ score: number }>('my_key')).toEqual({ score: 42 })
    ;(globalThis as Record<string, unknown>).localStorage = orig
  })

  it('returns null for corrupt JSON (stub)', () => {
    const ls = makeStorage({ bad_key: '{not valid json' })
    const orig = (globalThis as Record<string, unknown>).localStorage
    ;(globalThis as Record<string, unknown>).localStorage = ls
    expect(lsGet('bad_key')).toBeNull()
    ;(globalThis as Record<string, unknown>).localStorage = orig
  })
})

describe('lsSet – crash safety', () => {
  it('does not throw when localStorage is unavailable (node)', () => {
    expect(() => lsSet('any_key', { data: 1 })).not.toThrow()
  })

  it('stores and retrieves a value (stub)', () => {
    const ls = makeStorage()
    const orig = (globalThis as Record<string, unknown>).localStorage
    ;(globalThis as Record<string, unknown>).localStorage = ls
    lsSet('test_key', [1, 2, 3])
    expect(lsGet<number[]>('test_key')).toEqual([1, 2, 3])
    ;(globalThis as Record<string, unknown>).localStorage = orig
  })
})

describe('lsRemove – crash safety', () => {
  it('does not throw when localStorage is unavailable (node)', () => {
    expect(() => lsRemove('any_key')).not.toThrow()
  })

  it('removes a key (stub)', () => {
    const ls = makeStorage({ to_delete: '"value"' })
    const orig = (globalThis as Record<string, unknown>).localStorage
    ;(globalThis as Record<string, unknown>).localStorage = ls
    lsRemove('to_delete')
    expect(lsGet('to_delete')).toBeNull()
    ;(globalThis as Record<string, unknown>).localStorage = orig
  })
})

describe('lsClearAll – crash safety', () => {
  it('does not throw when localStorage is unavailable (node)', () => {
    expect(() => lsClearAll()).not.toThrow()
  })

  it('removes all tkk_ keys (stub)', () => {
    const ls = makeStorage({
      [STORAGE_KEYS.PET]:      '"pet"',
      [STORAGE_KEYS.SESSIONS]: '[]',
      [STORAGE_KEYS.LEADS]:    '[]',
      other_key: '"untouched"',
    })
    const orig = (globalThis as Record<string, unknown>).localStorage
    ;(globalThis as Record<string, unknown>).localStorage = ls
    lsClearAll()
    expect(lsGet(STORAGE_KEYS.PET)).toBeNull()
    expect(lsGet(STORAGE_KEYS.SESSIONS)).toBeNull()
    expect(lsGet(STORAGE_KEYS.LEADS)).toBeNull()
    // Non-tkk key must remain untouched
    expect(lsGet('other_key')).toBe('untouched')
    ;(globalThis as Record<string, unknown>).localStorage = orig
  })
})

describe('App start with empty storage', () => {
  it('lsGet returns null (safe default) for all app keys', () => {
    // In node environment all calls return null → app falls back to defaults
    expect(lsGet(STORAGE_KEYS.PET)).toBeNull()
    expect(lsGet(STORAGE_KEYS.SESSIONS)).toBeNull()
    expect(lsGet(STORAGE_KEYS.LEADS)).toBeNull()
  })
})
