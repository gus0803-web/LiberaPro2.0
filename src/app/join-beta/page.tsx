'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

function generateTempPassword() {
  return `Beta-${Math.random().toString(36).slice(2, 8)}-${Math.random().toString(36).slice(2, 5)}`;
}

export default function JoinBetaPage() {
  const [formData, setFormData] = useState({ name: '', email: '', school: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const normalizedEmail = formData.email.trim().toLowerCase();
    
    // Opcional: Impedir que el admin se una a la lista
    if (normalizedEmail === 'gus0803@gmail.com') {
      setError('Usa tu cuenta de administrador en la página de Login.');
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { error: insertError } = await supabase
        .from('beta_waitlist')
        .insert({
          full_name: formData.name,
          email: normalizedEmail,
          school: formData.school,
          status: 'pending'
        });

      if (insertError) {
        if (insertError.code === '23505' || /duplicate/i.test(insertError.message)) {
          setError('Este correo ya está en la lista de espera.');
          return;
        }
        throw insertError;
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar la solicitud. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-slate-900/30 -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-slate-700/80 p-10 flex flex-col items-center">
          <div className="mb-6 relative w-24 h-24 flex items-center justify-center">
            <Image src="/logo-512.png" alt="LiberaPro Logo" fill sizes="6rem" className="object-contain object-center scale-[1.15]" />
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Únete a la Lista de Espera</h1>
          <p className="text-sm font-medium text-slate-400 text-center mb-8">
            El acceso a LiberaPro es únicamente por invitación. Déjanos tus datos y te contactaremos en cuanto se libere un lugar.
          </p>

          {isSubmitted ? (
            <div className="w-full space-y-4 text-center">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ✓
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¡Gracias por tu interés!</h2>
              <p className="text-sm text-slate-400 mb-6">
                Te hemos añadido a nuestra lista de espera. Revisa tu correo electrónico, nos pondremos en contacto contigo pronto.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all mt-4"
              >
                Volver a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-5">
              {error && (
                <div className="w-full bg-red-50 text-red-500 border border-red-200 p-3 rounded-lg text-sm mb-4 text-center font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white font-medium placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  maxLength={100}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white font-medium placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">School Name</label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white font-medium placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Unirse a la Lista de Espera'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-700/50 w-full text-center">
            <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
              ← Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
