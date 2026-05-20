'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dawn' | 'festive';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dawn');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('liberapro_theme') as Theme;
    if (savedTheme && (savedTheme === 'dawn' || savedTheme === 'festive')) {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('liberapro_theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dawn' ? 'festive' : 'dawn');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div 
        className={`min-h-screen w-full transition-all duration-1000 bg-cover bg-center bg-no-repeat bg-fixed`}
        style={{
          backgroundImage: `url('/bg-${theme}.png')`
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
