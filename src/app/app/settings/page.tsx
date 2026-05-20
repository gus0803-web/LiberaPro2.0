'use client';
import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Settings, Globe, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme, language, setLanguage } = useTheme();
  
  const isEs = language === 'es';
  const t = {
    title: isEs ? 'Configuración' : 'Settings',
    appearance: isEs ? 'Apariencia' : 'Appearance',
    language: isEs ? 'Idioma' : 'Language',
    themeDawn: isEs ? 'Amanecer (Claro)' : 'Dawn (Light)',
    themeFestive: isEs ? 'Festivo (Tradicional)' : 'Festive (Traditional)',
    langEs: 'Español',
    langEn: 'English',
  };

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
          <div className="flex flex-col space-y-4">
            <button 
              onClick={toggleTheme}
              className={`px-6 py-3 rounded-xl border font-bold transition-all text-left flex justify-between items-center ${theme === 'dawn' ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-pink-600 shadow-md' : 'bg-white/50 text-slate-700 border-white/60 hover:bg-white/80'}`}
            >
              <span>{t.themeDawn}</span>
              {theme === 'dawn' && <span>✨</span>}
            </button>
            <button 
              onClick={toggleTheme}
              className={`px-6 py-3 rounded-xl border font-bold transition-all text-left flex justify-between items-center ${theme === 'festive' ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-pink-600 shadow-md' : 'bg-white/50 text-slate-700 border-white/60 hover:bg-white/80'}`}
            >
              <span>{t.themeFestive}</span>
              {theme === 'festive' && <span>✨</span>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
