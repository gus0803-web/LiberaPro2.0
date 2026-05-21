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
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-bg-v3.png')" }}
    >
      {/* Decorative background overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/10 -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/90 p-10 flex flex-col items-center">
          {/* LiberaPro Logo */}
          <div className="mb-6 relative w-20 h-20 shadow-lg shadow-teal-900/10 rounded-3xl overflow-hidden">
            <Image src="/login-logo-v3.png" alt="LiberaPro Logo" fill className="object-cover" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">LiberaPro</h1>
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
                className="w-full px-5 py-4 rounded-xl bg-white/70 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-800 font-medium placeholder:text-slate-400"
                placeholder="profesor@escuela.edu.mx"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                maxLength={17}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white/70 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-800 font-medium placeholder:text-slate-400"
                placeholder="Max 17 characters"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/50 w-full text-center">
            <Link href="/join-beta" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Join the Beta Test →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
