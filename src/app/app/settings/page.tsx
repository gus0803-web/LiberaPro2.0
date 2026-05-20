'use client';
import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Settings, Globe, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage } = useTheme();
  
  const isEs = language === 'es';
  const t = {
    title: isEs ? 'Configuración' : 'Settings',
    appearance: isEs ? 'Apariencia' : 'Appearance',
    language: isEs ? 'Idioma' : 'Language',
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

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center space-x-4 mb-8">
        <Settings className="w-10 h-10 text-slate-800" />
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Language Settings */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-800">{t.language}</h2>
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
            <h2 className="text-xl font-bold text-slate-800">{t.appearance}</h2>
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

      </div>
    </div>
  );
}
