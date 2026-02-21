import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, getDirection, translations } from '@/lib/i18n';

type TranslationType = typeof translations.ar;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getDefaultLanguageForPath(): Language {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    // Registration/landing page and referral pages default to Arabic
    // Admin, dashboard, and login pages default to English
    if (path === '/admin' || path.startsWith('/admin') || 
        path === '/dashboard' || path.startsWith('/dashboard') ||
        path === '/login' || path.startsWith('/login')) {
      return 'en';
    }
    // All other pages (/, /landing, /ref/:code) default to Arabic
    return 'ar';
  }
  return 'ar';
}

function isArabicDefaultPage(): boolean {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    // English pages
    if (path === '/admin' || path.startsWith('/admin') || 
        path === '/dashboard' || path.startsWith('/dashboard') ||
        path === '/login' || path.startsWith('/login')) {
      return false;
    }
    return true;
  }
  return true;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const isArabicPage = isArabicDefaultPage();
      const storageKey = isArabicPage ? 'foorsa-language-landing' : 'foorsa-language-app';
      
      const saved = localStorage.getItem(storageKey) as Language;
      if (saved && ['ar', 'fr', 'en'].includes(saved)) {
        return saved;
      }
      
      const defaultLang = getDefaultLanguageForPath();
      localStorage.setItem(storageKey, defaultLang);
      return defaultLang;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      const isArabicPage = isArabicDefaultPage();
      const storageKey = isArabicPage ? 'foorsa-language-landing' : 'foorsa-language-app';
      localStorage.setItem(storageKey, lang);
    }
  };

  useEffect(() => {
    document.documentElement.dir = getDirection(language);
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: getTranslation(language),
    dir: getDirection(language),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
