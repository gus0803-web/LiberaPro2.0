'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center p-4">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/80 p-10 flex flex-col items-center">
          
          {/* LiberaPro Logo */}
          <div className="w-20 h-20 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-6">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">LiberaPro</h1>
          <p className="text-sm font-semibold text-slate-500 text-center mb-8 uppercase tracking-wide">
            Maestros Modernos Lidereando la Educación en México
          </p>

          {error && (
            <div className="w-full bg-red-50 text-red-500 border border-red-200 p-3 rounded-lg text-sm mb-4 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white/50 border border-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="profesor@escuela.edu.mx"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                required
                maxLength={17}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white/50 border border-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Max 17 characters"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/50 w-full text-center">
            <a href="#" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Join the Beta Test →
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
