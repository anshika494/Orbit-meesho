import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { TRANSLATIONS } from '../data/translations';

const LanguageContext = createContext(null);

// Only languages with real entries in translations.js belong here — a
// selector option that doesn't actually change any text would be worse
// than not offering it. speechLang is the BCP-47 tag passed to the
// browser's SpeechRecognition API so voice input listens in the right
// language too.
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', speechLang: 'en-IN' },
  { code: 'hi', label: 'हिंदी', speechLang: 'hi-IN' },
];

const STORAGE_KEY = 'orbit-language';

function getInitialLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && TRANSLATIONS[stored]) return stored;
  } catch (e) {
    /* localStorage unavailable (private browsing etc.) — fall back below */
  }
  return 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((code) => {
    if (!TRANSLATIONS[code]) return;
    setLanguageState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      /* ignore persistence failure — language still applies for this session */
    }
  }, []);

  const t = useCallback(
    (key) => TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? key,
    [language]
  );

  const speechLang = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.speechLang ?? 'en-IN';

  const value = useMemo(
    () => ({ language, setLanguage, t, speechLang, languages: SUPPORTED_LANGUAGES }),
    [language, setLanguage, t, speechLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
