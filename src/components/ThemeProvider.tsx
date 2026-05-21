'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dawn' | 'festive' | 'muertos' | 'playa' | 'space' | 'mitierra';
type Language = 'es' | 'en';
type FontColor = '#1d4ed8' | '#dc2626' | '#f97316' | '#16a34a' | '#7c3aed' | '#be185d' | '#111827';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  fontColor: FontColor;
  setFontColor: (color: FontColor) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dawn');
  const [language, setLanguageState] = useState<Language>('es');
  const [fontColor, setFontColorState] = useState<FontColor>('#1d4ed8');

  useEffect(() => {
    // Load state from localStorage on mount
    const savedTheme = localStorage.getItem('liberapro_theme') as Theme;
    const validThemes = ['dawn', 'festive', 'muertos', 'playa', 'space', 'mitierra'];
    if (savedTheme && validThemes.includes(savedTheme)) {
      setThemeState(savedTheme);
    }

    const savedLanguage = localStorage.getItem('liberapro_language') as Language;
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }

    const savedFontColor = localStorage.getItem('liberapro_fontColor') as FontColor;
    const validColors = ['#1d4ed8', '#dc2626', '#f97316', '#16a34a', '#7c3aed', '#be185d', '#111827'];
    if (savedFontColor && validColors.includes(savedFontColor)) {
      setFontColorState(savedFontColor);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('liberapro_theme', newTheme);
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('liberapro_language', newLang);
  };

  const setFontColor = (newColor: FontColor) => {
    setFontColorState(newColor);
    localStorage.setItem('liberapro_fontColor', newColor);
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, language, setLanguage, fontColor, setFontColor }}>
      <div 
        className={`min-h-screen w-full transition-all duration-1000 bg-cover bg-center bg-no-repeat bg-fixed`}
        style={{
          backgroundImage: `url('/bg-${theme}.png')`,
          '--app-font-color': fontColor,
        } as React.CSSProperties & { '--app-font-color': string }}
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

