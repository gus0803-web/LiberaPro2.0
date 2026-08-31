'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { FeedbackModal } from './FeedbackTab';

export function AppFooter({ dark = false }: { dark?: boolean }) {
  const { language } = useTheme();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const isEs = language === 'es';

  return (
    <footer className={`shrink-0 border-t px-4 sm:px-8 py-4 ${dark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-800'}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left - Copyright */}
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} LiberaPro. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
        </p>

        {/* Right - Legal Links */}
        <div className="flex items-center gap-4">
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className={`transition-colors underline-offset-2 hover:underline ${dark ? 'hover:text-white' : 'hover:text-black'}`}>
            {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
          </Link>
          <span className={dark ? 'text-slate-700' : 'text-slate-400'}>|</span>
          <Link href="/app/collaborations" target="_blank" rel="noopener noreferrer" className={`transition-colors underline-offset-2 hover:underline ${dark ? 'hover:text-white' : 'hover:text-black'}`}>
            {isEs ? 'Directorio de Colaboradores' : 'Collaborators Directory'}
          </Link>
          <span className={dark ? 'text-slate-700' : 'text-slate-400'}>|</span>
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className={`transition-colors underline-offset-2 hover:underline ${dark ? 'hover:text-white' : 'hover:text-black'}`}>
            {isEs ? 'Términos de Uso' : 'Terms of Use'}
          </Link>
          <span className={dark ? 'text-slate-700' : 'text-slate-400'}>|</span>
          <button onClick={() => setIsFeedbackOpen(true)} className={`transition-colors underline-offset-2 hover:underline ${dark ? 'hover:text-white' : 'hover:text-black'}`}>
            {isEs ? 'Sugerencias' : 'Feedback'}
          </button>
          <span className={dark ? 'text-slate-700' : 'text-slate-400'}>|</span>
          <Link href="/contact" target="_blank" rel="noopener noreferrer" className={`transition-colors underline-offset-2 hover:underline ${dark ? 'hover:text-white' : 'hover:text-black'}`}>
            {isEs ? 'Contacto' : 'Contact'}
          </Link>
        </div>
      </div>

      {/* LFPDPPP Compliance Notice */}
      <p className={`mt-2 text-[10px] text-center leading-relaxed max-w-4xl mx-auto ${dark ? 'text-slate-600' : 'text-slate-500'}`}>
        {isEs
          ? 'LiberaPro cumple con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Sus datos personales son tratados de forma confidencial y no serán compartidos con terceros sin su consentimiento expreso. Para ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación u Oposición), contáctenos a través de nuestro formulario de contacto.'
          : 'LiberaPro complies with Mexico\'s Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP). Your personal data is treated confidentially and will not be shared with third parties without your express consent. To exercise your ARCO rights (Access, Rectification, Cancellation or Opposition), contact us through our contact form.'}
      </p>

      <p className={`mt-4 mb-2 text-center text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
        Owned and operated by LINC-SUITE HOLDINGS
      </p>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </footer>
  );
}
