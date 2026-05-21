'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

export function TopNav() {
  const { language } = useTheme();
  const pathname = usePathname();
  const isEs = language === 'es';

  const links = [
    { href: '/app/dashboard', labelEn: 'Home', labelEs: 'Inicio' },
    { href: '/app/planner', labelEn: 'Lesson Plans', labelEs: 'Planeaciones' },
    { href: '/app/calendar', labelEn: 'Calendar', labelEs: 'Calendario' },
    { href: '/app/reports', labelEn: 'Reports', labelEs: 'Reportes' },
    { href: '/app/scanner', labelEn: 'Scanner', labelEs: 'Escáner' },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href}
            href={link.href} 
            className={`${isActive ? 'text-slate-900 font-bold border-b-2 border-blue-500 pb-1' : 'text-slate-600 font-medium hover:text-slate-900 transition-colors'}`}
          >
            {isEs ? link.labelEs : link.labelEn}
          </Link>
        );
      })}
    </nav>
  );
}
