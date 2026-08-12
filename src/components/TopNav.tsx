'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { Menu, X, Home, BookOpen, Calendar, FileBarChart, ScanLine, Megaphone, Users } from 'lucide-react';

export function TopNav() {
  const { language } = useTheme();
  const pathname = usePathname();
  const isEs = language === 'es';
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/app/dashboard', labelEn: 'Home', labelEs: 'Inicio', icon: Home },
    { href: '/app/planner', labelEn: 'Lesson Plans', labelEs: 'Planeaciones', icon: BookOpen },
    { href: '/app/calendar', labelEn: 'Calendar', labelEs: 'Calendario', icon: Calendar },
    { href: '/app/communicator', labelEn: 'Avisos', labelEs: 'Avisos', icon: Megaphone },
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

        {/* ACCESO DIRECTO AL PORTAL DE PADRES DE FAMILIA */}
        <Link
          href="/familias"
          target="_blank"
          className="text-xs font-bold text-purple-950 bg-purple-100 hover:bg-purple-200 border border-purple-300 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Users className="w-3.5 h-3.5 text-purple-600" />
          <span>Portal de Padres</span>
        </Link>
      </nav>

      {/* Mobile Hamburger Button */}
      <div className="md:hidden flex items-center gap-2">
        <Link
          href="/familias"
          target="_blank"
          className="text-[11px] font-bold text-purple-950 bg-purple-100 border border-purple-300 px-2.5 py-1 rounded-full flex items-center gap-1"
        >
          <Users className="w-3 h-3 text-purple-600" />
          <span>Padres</span>
        </Link>

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

            <Link 
              href="/familias"
              target="_blank"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-purple-50 text-purple-800 font-bold"
            >
              <Users className="w-5 h-5 text-purple-600" />
              <span>Ver Portal de Padres</span>
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
