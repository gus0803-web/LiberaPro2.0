'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

export function AppFooter() {
  const { language } = useTheme();
  const isEs = language === 'es';

  return (
    <footer className="shrink-0 border-t border-white/20 px-4 sm:px-8 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        {/* Left - Copyright */}
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} LiberaPro. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
        </p>

        {/* Right - Legal Links */}
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-slate-700 transition-colors underline-offset-2 hover:underline">
            {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/terms" className="hover:text-slate-700 transition-colors underline-offset-2 hover:underline">
            {isEs ? 'Términos de Uso' : 'Terms of Use'}
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/contact" className="hover:text-slate-700 transition-colors underline-offset-2 hover:underline">
            {isEs ? 'Contacto' : 'Contact'}
          </Link>
        </div>
      </div>

      {/* LFPDPPP Compliance Notice */}
      <p className="mt-2 text-[10px] text-slate-400 text-center leading-relaxed max-w-4xl mx-auto">
        {isEs
          ? 'LiberaPro cumple con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Sus datos personales son tratados de forma confidencial y no serán compartidos con terceros sin su consentimiento expreso. Para ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación u Oposición), contáctenos a través de nuestro formulario de contacto.'
          : 'LiberaPro complies with Mexico\'s Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP). Your personal data is treated confidentially and will not be shared with third parties without your express consent. To exercise your ARCO rights (Access, Rectification, Cancellation or Opposition), contact us through our contact form.'}
      </p>
    </footer>
  );
}
