'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { Menu, X, Home, BookOpen, Calendar, FileBarChart, ScanLine, Megaphone, Crown, Presentation, ShieldCheck } from 'lucide-react';

export function TopNav() {
  const { language } = useTheme();
  const pathname = usePathname();
  const isEs = language === 'es';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDirectorModal, setShowDirectorModal] = useState(false);

  const links = [
    { href: '/app/dashboard', labelEn: 'Home', labelEs: 'Inicio', icon: Home },
    { href: '/app/planner', labelEn: 'Lesson Plans', labelEs: 'Planeaciones', icon: BookOpen },
    { href: '/app/calendar', labelEn: 'Calendar', labelEs: 'Calendario', icon: Calendar },
    { href: '/app/communicator', labelEn: 'Notices', labelEs: 'Avisos', icon: Megaphone },
    { href: '/app/reports', labelEn: 'Reports', labelEs: 'Reportes', icon: FileBarChart },
    { href: '/app/scanner', labelEn: 'Scanner', labelEs: 'Escáner', icon: ScanLine },
  ];

  return (
    <>
      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center space-x-6">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`${isActive ? 'text-slate-900 font-bold border-b-2 border-emerald-600 pb-1' : 'text-slate-600 font-medium hover:text-slate-900 transition-colors'}`}
            >
              {isEs ? link.labelEs : link.labelEn}
            </Link>
          );
        })}

        {/* NAVEGACIÓN DIRECTOR / ADMINISTRACIÓN INSIDE APP */}
        <button
          type="button"
          onClick={() => setShowDirectorModal(true)}
          className="text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Crown className="w-3.5 h-3.5 text-amber-600" />
          <span>Navegación Director</span>
        </button>
      </nav>

      {/* Mobile Hamburger Button */}
      <div className="md:hidden flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowDirectorModal(true)}
          className="text-[11px] font-bold text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1"
        >
          <Crown className="w-3 h-3 text-amber-600" />
          <span>Director</span>
        </button>

        <button 
          className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center border border-white/60 hover:bg-white/80 transition-colors z-50"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-24 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-white/40 shadow-lg z-40 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col p-4 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-800 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isEs ? link.labelEs : link.labelEn}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* MODAL DE NAVEGACIÓN DIRECTOR (gus0803@gmail.com) */}
      {showDirectorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-left">
            
            <button 
              type="button" 
              onClick={() => setShowDirectorModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Crown className="w-4 h-4 text-amber-600" />
                Módulo de Dirección y Administración
              </div>
              <h3 className="text-2xl font-black text-slate-900">Navegación Institucional</h3>
              <p className="text-xs text-slate-500">Selecciona el módulo al que deseas dirigirte:</p>
            </div>

            <div className="space-y-3">
              <Link
                href="/app/dashboard"
                onClick={() => setShowDirectorModal(false)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 flex items-center gap-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">1. Plataforma de Maestro</h4>
                  <p className="text-xs text-slate-500">Diseño de planeaciones en 6 fases y exámenes NEM</p>
                </div>
              </Link>

              <Link
                href="/app/reports"
                onClick={() => setShowDirectorModal(false)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 flex items-center gap-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <FileBarChart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-800">2. Panel de Director / Reportes por Salón</h4>
                  <p className="text-xs text-slate-500">Supervisar planeaciones entregadas por grupo y exportar Word (.docx)</p>
                </div>
              </Link>

              <Link
                href="/app/communicator"
                onClick={() => setShowDirectorModal(false)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 flex items-center gap-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700">3. Módulo de Avisos y Comunicados</h4>
                  <p className="text-xs text-slate-500">Publicar avisos a padres y generar códigos por salón</p>
                </div>
              </Link>

              <Link
                href="/admin"
                onClick={() => setShowDirectorModal(false)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 flex items-center gap-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700">4. Panel de Administración de Licencias</h4>
                  <p className="text-xs text-slate-500">Gestión de usuarios y dispositivos registrados</p>
                </div>
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
