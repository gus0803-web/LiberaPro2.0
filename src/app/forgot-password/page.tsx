'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);
    
    const supabase = createClient();
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/app/settings`,
      });

      if (resetError) throw resetError;

      setMessage('Password reset link sent! Please check your email.');
    } catch (err: any) {
      setError(err.message || 'Error sending reset link. Please try again.');
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

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/90 p-10 flex flex-col items-center">
          
          {/* LiberaPro Logo */}
          <div className="mb-6 relative w-20 h-20 shadow-lg shadow-teal-900/10 rounded-3xl overflow-hidden">
            <Image src="/login-logo-v3.png" alt="LiberaPro Logo" fill className="object-cover" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Reset Password</h1>
          <p className="text-sm font-medium text-slate-500 text-center mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {message && (
            <div className="w-full bg-green-50 text-green-600 border border-green-200 p-3 rounded-lg text-sm mb-4 text-center font-medium">
              {message}
            </div>
          )}

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

            <button
              type="submit"
              disabled={isLoading || !!message}
              className="w-full py-4 mt-2 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/50 w-full text-center">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              ← Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
