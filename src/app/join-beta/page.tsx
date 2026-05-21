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
    if (normalizedEmail === 'gus0803@gmail.com') {
      setError('No uses el correo administrador para la beta. Usa otro email o inicia sesión con tu cuenta de administrador.');
      setIsLoading(false);
      return;
    }

    const tempPassword = generateTempPassword();
    const supabase = createClient();

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: tempPassword,
        options: {
          data: {
            full_name: formData.name,
            school: formData.school,
            beta_tester: true,
          },
        },
      });

      if (signUpError) {
        const message = signUpError.message?.toString() || '';
        if (/already registered|already exists|duplicate/i.test(message)) {
          setError('An account already exists for that email. Please log in or use Forgot Password.');
          return;
        }
        if (signUpError.status === 429) {
          setError('Too many requests. Please wait a few minutes and try again.');
          return;
        }
        throw signUpError;
      }

      if (data?.user?.id) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ beta_tester: true, beta_expires_at: expiresAt })
          .eq('id', data.user.id);

        if (profileError) {
          throw profileError;
        }
      }

      setTemporaryPassword(tempPassword);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Unable to create beta access. Please try again.');
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
          <div className="mb-6 relative w-20 h-20 shadow-lg shadow-green-900/20 rounded-3xl overflow-hidden">
            <Image src="/login-logo.png" alt="LiberaPro Logo" fill sizes="5rem" className="object-cover" />
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Join the Beta Test</h1>
          <p className="text-sm font-medium text-slate-400 text-center mb-8">
            Ingresa tus datos para crear un acceso temporal. Esta contraseña expira en 7 días.
          </p>

          {isSubmitted ? (
            <div className="w-full space-y-4 text-center">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>
              <h2 className="text-xl font-bold text-white">Temporary Access Created</h2>
              <p className="text-sm text-slate-400">
                Your account was created successfully. Use the email below and the generated password to sign in.
              </p>

              <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 p-5 text-left">
                <p className="text-sm text-slate-400 mb-3">Email</p>
                <div className="text-white font-semibold break-all">{formData.email}</div>
                <p className="text-sm text-slate-400 mt-4 mb-3">Temporary password</p>
                <div className="text-white font-semibold break-all">{temporaryPassword}</div>
              </div>

              <p className="text-sm text-slate-400">
                After logging in, go to your account settings to change your password.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-5">
              {error && (
                <div className="w-full bg-red-50 text-red-500 border border-red-200 p-3 rounded-lg text-sm mb-4 text-center font-medium">
                  {error}
                </div>
              )}
              <div className="w-full bg-slate-900/70 border border-slate-700/80 p-4 rounded-3xl text-sm text-slate-300">
                Esta contraseña temporal es válida por 7 días. Después de iniciar sesión, cámbiala lo antes posible.
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  required
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
                {isLoading ? 'Creating access...' : 'Request Access'}
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
