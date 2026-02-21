import { createContext, useContext, ReactNode } from 'react';
import { getTranslation, translations } from '@/lib/i18n';

type TranslationType = typeof translations.en;

interface LanguageContextType {
  language: 'en';
  setLanguage: (lang: 'en') => void;
  t: TranslationType;
  dir: 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const value: LanguageContextType = {
    language: 'en',
    setLanguage: () => {},
    t: getTranslation('en'),
    dir: 'ltr',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for components outside provider
    return {
      language: 'en' as const,
      setLanguage: () => {},
      t: getTranslation('en'),
      dir: 'ltr' as const,
    };
  }
  return context;
}
