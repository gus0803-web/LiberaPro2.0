'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dawn' | 'festive';
type Language = 'es' | 'en';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dawn');
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    // Load state from localStorage on mount
    const savedTheme = localStorage.getItem('liberapro_theme') as Theme;
    if (savedTheme && (savedTheme === 'dawn' || savedTheme === 'festive')) {
      setThemeState(savedTheme);
    }

    const savedLanguage = localStorage.getItem('liberapro_language') as Language;
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('liberapro_theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dawn' ? 'festive' : 'dawn');
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('liberapro_language', newLang);
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, toggleTheme, language, setLanguage }}>
      <div 
        className={`min-h-screen w-full transition-all duration-1000 bg-cover bg-center bg-no-repeat bg-fixed`}
        style={{
          backgroundImage: `url('/bg-${theme}.png')`
        }}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

