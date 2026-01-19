'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/translations';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Detect browser/device language preference
 * Returns 'es' if Spanish is detected, 'en' otherwise
 */
function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  
  // Check navigator.languages (array of preferred languages) first
  const languages = navigator.languages || [navigator.language];
  
  for (const lang of languages) {
    // Check if any preferred language starts with 'es' (Spanish)
    if (lang?.toLowerCase().startsWith('es')) {
      return 'es';
    }
    // If English is found first, return English
    if (lang?.toLowerCase().startsWith('en')) {
      return 'en';
    }
  }
  
  // Default to English if no match
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. First check for saved preference in localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
    
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      // User has a saved preference - use it
      setLanguage(savedLanguage);
    } else {
      // 2. No saved preference - detect from browser/device settings
      const detectedLanguage = detectBrowserLanguage();
      setLanguage(detectedLanguage);
      // Save the detected language as their preference
      localStorage.setItem('preferredLanguage', detectedLanguage);
    }
    
    setIsInitialized(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
