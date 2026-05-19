'use client';

import React, { useState } from 'react';
import fpPromise from '@fingerprintjs/fingerprintjs';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Lógica real de Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 2. Generar Fingerprint
      const fp = await fpPromise.load();
      const result = await fp.get();
      const fingerprintHash = result.visitorId;

      // 3. Validar dispositivo con nuestra API
      const res = await fetch('/api/auth/verify-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: fingerprintHash })
      });

      const data = await res.json();

      if (!res.ok || !data.allowed) {
        throw new Error(data.error || 'Límite de dispositivos alcanzado.');
      }

      // 4. Si todo está bien, redirigir al Dashboard
      window.location.href = '/app/dashboard';
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-volcanic-900 flex items-center justify-center bg-[url('/noise.png')] bg-repeat relative">
      <div className="absolute inset-0 bg-glass-gradient pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md p-10 bg-volcanic-800/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,242,254,0.1)]">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Libera<span className="text-turquoise-neon">Pro</span>
          </h1>
          <p className="text-gray-400">Inicia sesión en tu cuenta Premium</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Correo Institucional</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turquoise-neon transition-colors" placeholder="maestro@escuela.edu.mx" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turquoise-neon transition-colors" placeholder="••••••••" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-turquoise-neon text-volcanic-900 font-bold px-8 py-3 rounded-xl hover:bg-white hover:text-turquoise-neon transition-all disabled:opacity-50 flex justify-center items-center">
            {loading ? (
              <span className="w-5 h-5 border-2 border-volcanic-900 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Ingresar al Concierge'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
