'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { FeedbackModal } from './FeedbackTab';

export function AppFooter() {
  const { language } = useTheme();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const isEs = language === 'es';

  return (
    <footer className="shrink-0 border-t border-slate-200 px-4 sm:px-8 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-800">
        {/* Left - Copyright */}
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} LiberaPro. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
        </p>

        {/* Right - Legal Links */}
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-black transition-colors underline-offset-2 hover:underline">
            {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
          </Link>
          <span className="text-slate-400">|</span>
          <Link href="/app/collaborations" className="hover:text-black transition-colors underline-offset-2 hover:underline">
            {isEs ? 'Directorio de Colaboradores' : 'Collaborators Directory'}
          </Link>
          <span className="text-slate-400">|</span>
          <Link href="/terms" className="hover:text-black transition-colors underline-offset-2 hover:underline">
            {isEs ? 'Términos de Uso' : 'Terms of Use'}
          </Link>
          <span className="text-slate-400">|</span>
          <button onClick={() => setIsFeedbackOpen(true)} className="hover:text-black transition-colors underline-offset-2 hover:underline">
            {isEs ? 'Sugerencias' : 'Feedback'}
          </button>
          <span className="text-slate-400">|</span>
          <Link href="/contact" className="hover:text-black transition-colors underline-offset-2 hover:underline">
            {isEs ? 'Contacto' : 'Contact'}
          </Link>
        </div>
      </div>

      {/* LFPDPPP Compliance Notice */}
      <p className="mt-2 text-[10px] text-slate-500 text-center leading-relaxed max-w-4xl mx-auto">
        {isEs
          ? 'LiberaPro cumple con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Sus datos personales son tratados de forma confidencial y no serán compartidos con terceros sin su consentimiento expreso. Para ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación u Oposición), contáctenos a través de nuestro formulario de contacto.'
          : 'LiberaPro complies with Mexico\'s Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP). Your personal data is treated confidentially and will not be shared with third parties without your express consent. To exercise your ARCO rights (Access, Rectification, Cancellation or Opposition), contact us through our contact form.'}
      </p>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </footer>
  );
}
