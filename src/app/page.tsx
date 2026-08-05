import React from 'react';
import Link from 'next/link';
import { Sparkles, Users, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      
      {/* Background Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Brand */}
      <header className="flex justify-between items-center max-w-6xl w-full mx-auto z-10">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Libera<span className="text-emerald-400">Pro</span>
        </h1>
        <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          Plataforma Educativa NEM 2026
        </span>
      </header>

      {/* Hero Body */}
      <main className="max-w-4xl w-full mx-auto text-center my-auto py-12 space-y-8 z-10">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Inteligencia Didáctica & Comunicación en Tiempo Real
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Transformando la labor docente y la conexión con las <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">familias</span>.
        </h2>

        <p className="text-slate-300 text-base sm:text-xl font-light max-w-2xl mx-auto leading-relaxed">
          Planeaciones alineadas a la Nueva Escuela Mexicana, exámenes contextualizados y comunicación escolar instantánea sin compartir tu número de teléfono personal.
        </p>

        {/* Dual Access Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 max-w-3xl mx-auto text-left">
          
          {/* Card 1: Acceso Docentes */}
          <Link 
            href="/login" 
            className="group bg-slate-800/80 hover:bg-slate-800 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 p-8 rounded-3xl transition-all shadow-xl hover:shadow-2xl flex flex-col justify-between space-y-6 transform hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👨‍🏫
              </div>
              <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Acceso Docentes
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ingresa a tu panel para estructurar planeaciones didácticas en 6 fases, generar exámenes y publicar avisos a tus grupos.
              </p>
            </div>
            <div className="flex items-center text-sm font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Ingresar al Panel Maestro</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>

          {/* Card 2: Acceso Familias / Padres */}
          <Link 
            href="/familias" 
            className="group bg-slate-800/80 hover:bg-slate-800 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 p-8 rounded-3xl transition-all shadow-xl hover:shadow-2xl flex flex-col justify-between space-y-6 transform hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👨‍👩‍👧
              </div>
              <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Acceso Familias / Padres
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ingresa con el Código de Enlace entregado por tu docente para consultar tareas, avisos y listas de materiales en tiempo real.
              </p>
            </div>
            <div className="flex items-center text-sm font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Entrar al Portal de Avisos</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 border-t border-white/10 pt-6 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2026 LiberaPro — Plataforma Educativa Oficial</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Privacidad 100% Garantizada</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-blue-400" /> Supabase Realtime Active</span>
        </div>
      </footer>

    </div>
  );
}
