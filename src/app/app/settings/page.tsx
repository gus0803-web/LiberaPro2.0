'use client';
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Settings, Globe, Palette, Type } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage, fontColor, setFontColor } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const colorOptions = [
    { label: 'Azul', value: '#1d4ed8' as const },
    { label: 'Rojo', value: '#dc2626' as const },
    { label: 'Naranja', value: '#f97316' as const },
    { label: 'Verde', value: '#16a34a' as const },
    { label: 'Morado', value: '#7c3aed' as const },
    { label: 'Magenta', value: '#be185d' as const },
    { label: 'Negro', value: '#111827' as const },
  ];
  
  const isEs = language === 'es';
  const t = {
    title: isEs ? 'Configuración' : 'Settings',
    appearance: isEs ? 'Apariencia' : 'Appearance',
    language: isEs ? 'Idioma' : 'Language',
    fontSettings: isEs ? 'Configuración de Fuentes' : 'Font Settings',
    fontColorLabel: isEs ? 'Color de Letras' : 'Text Color',
    fontColorDesc: isEs ? 'Elige el color para todo el texto en la aplicación' : 'Choose the text color for the entire app',
    themes: {
      dawn: isEs ? 'Amanecer (Claro)' : 'Dawn (Light)',
      festive: isEs ? 'Festivo (Tradicional)' : 'Festive (Traditional)',
      muertos: isEs ? 'Día de Muertos' : 'Day of the Dead',
      playa: isEs ? 'Playa (Relajante)' : 'Beach (Relaxing)',
      space: isEs ? 'Espacio (Oscuro)' : 'Space (Dark)',
      mitierra: isEs ? 'Mi Tierra (Paisaje)' : 'My Land (Landscape)'
    },
    langEs: 'Español',
    langEn: 'English',
  };

  const themeOptions = [
    { id: 'dawn', label: t.themes.dawn },
    { id: 'festive', label: t.themes.festive },
    { id: 'muertos', label: t.themes.muertos },
    { id: 'playa', label: t.themes.playa },
    { id: 'space', label: t.themes.space },
    { id: 'mitierra', label: t.themes.mitierra },
  ] as const;

  if (!isClient) {
    return null;
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center space-x-4 mb-8">
        <Settings className="w-10 h-10 text-[var(--app-font-color)]" />
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Language Settings */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-[var(--app-font-color)]">{t.language}</h2>
          </div>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => setLanguage('es')}
              className={`px-6 py-3 rounded-xl border font-bold transition-all text-left ${language === 'es' ? 'bg-blue-500 text-white border-blue-600 shadow-md' : 'bg-white/50 text-slate-700 border-white/60 hover:bg-white/80'}`}
            >
              {t.langEs}
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-6 py-3 rounded-xl border font-bold transition-all text-left ${language === 'en' ? 'bg-blue-500 text-white border-blue-600 shadow-md' : 'bg-white/50 text-slate-700 border-white/60 hover:bg-white/80'}`}
            >
              {t.langEn}
            </button>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-bold text-[var(--app-font-color)]">{t.appearance}</h2>
          </div>
          <div className="flex flex-col space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {themeOptions.map((option) => (
              <button 
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={`px-6 py-3 rounded-xl border font-bold transition-all text-left flex justify-between items-center ${theme === option.id ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-pink-600 shadow-md' : 'bg-white/50 text-slate-700 border-white/60 hover:bg-white/80'}`}
              >
                <span>{option.label}</span>
                {theme === option.id && <span>✨</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Font Color Settings */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Type className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-[var(--app-font-color)]">{t.fontSettings}</h2>
          </div>
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-slate-600 font-medium">{t.fontColorDesc}</p>
            <div className="grid grid-cols-7 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFontColor(option.value)}
                  className={`h-12 rounded-lg border-2 transition-all flex items-center justify-center font-bold text-xs ${fontColor === option.value ? 'border-slate-900 scale-105 ring-2 ring-offset-1 ring-slate-400' : 'border-transparent hover:border-slate-300'}`}
                  style={{ 
                    backgroundColor: option.value,
                    color: 'white',
                  }}
                  title={option.label}
                >
                  A
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
