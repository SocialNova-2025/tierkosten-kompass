import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { lsGet, lsSet } from './storage'
import { DE } from '../data/copy.de'
import { EN } from '../data/copy.en'
import type { AppCopy } from '../data/copy.de'

// ── Types ─────────────────────────────────────────────────────────────────
export type Lang = 'de' | 'en'
export type { AppCopy }

const LANG_STORAGE_KEY = 'tkk_lang'

// ── Context ───────────────────────────────────────────────────────────────
interface LanguageCtx {
  lang: Lang
  setLang: (l: Lang) => void
  copy: AppCopy
}

const LanguageContext = createContext<LanguageCtx>({
  lang: 'de',
  setLang: () => {},
  copy: DE,
})

// ── Provider ──────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => lsGet<Lang>(LANG_STORAGE_KEY) ?? 'de',
  )

  const setLang = useCallback((l: Lang) => {
    lsSet(LANG_STORAGE_KEY, l)
    setLangState(l)
  }, [])

  const copy: AppCopy = lang === 'de' ? DE : EN

  return (
    <LanguageContext.Provider value={{ lang, setLang, copy }}>
      {children}
    </LanguageContext.Provider>
  )
}

// ── Hooks ─────────────────────────────────────────────────────────────────
/** Returns { lang, setLang, copy } */
export function useLanguage(): LanguageCtx {
  return useContext(LanguageContext)
}

/** Convenience: returns just the copy object for current language */
export function useCopy(): AppCopy {
  return useContext(LanguageContext).copy
}
