'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const supabase = createClient();
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const userId = data?.user?.id;
      if (userId) {
        // Guard against cases where the DB schema hasn't been migrated yet
        // and the `beta_tester` column does not exist.
        let profile: any = null
        let profileError: any = null
        try {
          const res = await supabase
            .from('profiles')
            .select('beta_tester, beta_expires_at')
            .eq('id', userId)
            .single()
          profile = res.data
          profileError = res.error
        } catch (err: any) {
          profileError = err
        }

        if (profileError) {
          const msg = (profileError.message || String(profileError)).toLowerCase()
          if (msg.includes('beta_tester') || msg.includes('column') || msg.includes('does not exist')) {
            console.warn('[Login] profiles.beta_tester column missing; allowing login')
            profile = { beta_tester: false, beta_expires_at: null }
          } else {
            throw profileError
          }
        }

        if (profile?.beta_tester && profile.beta_expires_at && new Date(profile.beta_expires_at) <= new Date()) {
          await supabase.auth.signOut();
          throw new Error('Tu acceso beta ha expirado. Solicita otro acceso o usa otro correo.');
        }
      }

      // If login is successful, redirect based on email
      if (email === 'gus0803@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/app/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error signing in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-[#111111] bg-[url('/login-bg.png')]"
    >
      {/* Animated golden background patterns (Desktop Only) */}
      <div className="absolute inset-0 pointer-events-none -z-10 hidden md:block">
        <div className={"absolute top-16 left-10 w-28 h-28 rounded-full bg-amber-400/10 blur-2xl " + (isLoading ? 'pattern-dark-1' : 'opacity-40')} />
        <div className={"absolute top-24 right-16 w-20 h-20 rounded-full bg-amber-300/10 blur-2xl " + (isLoading ? 'pattern-dark-2' : 'opacity-30')} />
        <div className={"absolute bottom-24 left-20 w-24 h-24 rounded-full bg-amber-500/10 blur-3xl " + (isLoading ? 'pattern-dark-3' : 'opacity-30')} />
        <div className={"absolute bottom-16 right-12 w-16 h-16 rounded-full bg-amber-400/10 blur-2xl " + (isLoading ? 'pattern-dark-4' : 'opacity-30')} />
      </div>
      
      {/* Darken & Desaturate Overlay for Mobile to lower golden tones, keep Desktop normal */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-950/70 backdrop-saturate-[0.3] md:backdrop-saturate-100 md:bg-slate-900/40 -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="group w-full flex flex-col items-center md:bg-slate-900/70 md:backdrop-blur-2xl md:rounded-[2.5rem] md:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] md:border md:border-slate-700/60 md:p-10 md:opacity-80 md:transition-opacity md:duration-300 md:ease-out hover:opacity-100 focus-within:opacity-100">
          
          {/* LiberaPro Logo */}
          <div className="mb-6 relative w-32 h-32 rounded-[1.5rem] bg-[#123120] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] overflow-hidden transform-gpu transition-transform duration-300 hover:-translate-y-1 flex items-center justify-center">
            <Image src="/logo-pluma-transparente.png" alt="LiberaPro Logo" fill sizes="8rem" className="object-contain object-center scale-[1.15]" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 hidden md:block">LiberaPro</h1>
          <p className="text-xs md:text-sm font-semibold text-slate-400 text-center mb-8 uppercase tracking-wide">
            Maestros Modernos Lidereando la Educación en México
          </p>

          {error && (
            <div className="w-full bg-red-50 text-red-500 border border-red-200 p-3 rounded-lg text-sm mb-4 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-transparent border border-slate-600/50 md:bg-slate-800/50 md:border-slate-700 focus:ring-2 focus:ring-blue-500 md:focus:border-blue-500 transition-all text-white font-medium placeholder:text-slate-500"
                placeholder="profesor@escuela.edu.mx"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                maxLength={32}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-transparent border border-slate-600/50 md:bg-slate-800/50 md:border-slate-700 focus:ring-2 focus:ring-blue-500 md:focus:border-blue-500 transition-all text-white font-medium placeholder:text-slate-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-cyan-800/90 hover:bg-cyan-700 md:bg-gradient-to-r md:from-blue-600 md:to-indigo-600 md:hover:from-blue-700 md:hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-black/20 md:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 md:border-t md:border-slate-700/50 w-full flex flex-col items-center space-y-4">
            <Link href="/join-beta" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
              Join the Beta Test →
            </Link>
            
            {/* Link para demostración - Reemplaza el href con el enlace real */}
            <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-2 rounded-full px-2 py-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              <span>¿Necesitas una demostración?</span>
            </a>

            <div className="flex items-center space-x-4 pt-4">
              {/* Link para LinkedIn - Reemplaza el href con tu enlace real */}
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800/80 md:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50 md:border-slate-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              {/* Link para Instagram - Reemplaza el href con tu enlace real */}
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800/80 md:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50 md:border-slate-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            </div>

            {/* Mobile App Download Button */}
            <div className="pt-8 pb-4 w-full flex md:hidden justify-center relative z-20">
              <button 
                type="button"
                onClick={() => alert('Próximamente disponible en App Store y Google Play')}
                className="w-full max-w-[240px] py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-3"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                <span>Baja la App</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
