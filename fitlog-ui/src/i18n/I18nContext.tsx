import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { en } from './en';

export type Lang = 'tr' | 'en';

/**
 * Turkish is the source language: the Turkish text itself is the key, so untranslated
 * strings simply fall back to Turkish. Pages are migrated one at a time with t('...').
 */
const dictionaries: Record<Lang, Record<string, string>> = { tr: {}, en };

const STORAGE_KEY = 'fitlog-lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'tr' || saved === 'en') return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate; `{name}` placeholders are filled from vars. */
  t: (text: string, vars?: Record<string, string | number>) => string;
  /** BCP-47 locale for dates/numbers. */
  locale: string;
}

const I18nContext = createContext<I18nValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const t = useCallback(
    (text: string, vars?: Record<string, string | number>) => {
      let out = dictionaries[lang][text] ?? text;
      if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
      return out;
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t, locale: lang === 'tr' ? 'tr-TR' : 'en-GB' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
