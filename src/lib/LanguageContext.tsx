import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { lsSet } from './storage'
import { DE } from '../data/copy.de'
import { EN } from '../data/copy.en'
import type { AppCopy } from '../data/copy.de'

export type Lang = 'de' | 'en'
export type { AppCopy }

const LANG_STORAGE_KEY = 'tkk_lang'

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

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Locked to German for launch -- ignores any stored language preference
  const [lang, setLangState] = useState<Lang>('de')

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

export function useLanguage(): LanguageCtx {
  return useContext(LanguageContext)
}

export function useCopy(): AppCopy {
  return useContext(LanguageContext).copy
}
