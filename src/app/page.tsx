import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, BookOpen, Users, GraduationCap, Presentation, HeartHandshake, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
      
      {/* BACKGROUND VARIATION 1C: Cyber-Prehispánico Vector Accents & Glows */}
      {/* Top Right Cyber Prehispanic Network Vector & Cyan Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-40">
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M500 0H250L350 100L220 230L380 390L500 270V0Z" stroke="url(#cyan-grad)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M500 120L400 220L480 300" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
          <circle cx="350" cy="100" r="4" fill="#22d3ee" />
          <circle cx="220" cy="230" r="4" fill="#a855f7" />
          <circle cx="380" cy="390" r="4" fill="#06b6d4" />
          <defs>
            <linearGradient id="cyan-grad" x1="500" y1="0" x2="220" y2="390" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Bottom Left Cyber Vector & Violet Glow */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none opacity-40">
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M0 500H250L150 400L280 270L120 110L0 230V500Z" stroke="url(#purple-grad)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M0 380L100 280L20 200" stroke="#a855f7" strokeWidth="1" opacity="0.6" />
          <circle cx="150" cy="400" r="4" fill="#a855f7" />
          <circle cx="280" cy="270" r="4" fill="#22d3ee" />
          <circle cx="120" cy="110" r="4" fill="#a855f7" />
          <defs>
            <linearGradient id="purple-grad" x1="0" y1="500" x2="280" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a855f7" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="flex justify-between items-center max-w-6xl w-full mx-auto z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#090e1a] rounded-[14px] flex items-center justify-center font-extrabold text-cyan-400 text-xl">
              L
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Libera<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Pro</span>
          </h1>
        </div>

        <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-1.5 rounded-full shadow-inner">
          Plataforma Educativa NEM 2026
        </span>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-5xl w-full mx-auto text-center my-auto py-8 sm:py-12 space-y-8 z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-950">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Inteligencia Didáctica & Comunicación en Tiempo Real</span>
        </div>

        {/* Title */}
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
          Transformando la labor docente y la conexión con las <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">
            familias
          </span>.
        </h2>

        <p className="text-slate-400 text-sm sm:text-lg font-normal max-w-2xl mx-auto leading-relaxed">
          Planeaciones alineadas a la Nueva Escuela Mexicana, exámenes contextualizados y comunicación escolar instantánea sin compartir tu número de teléfono personal.
        </p>

        {/* DUAL SELECTION CARDS - With Vector Icons from Mockup 1C */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-4 max-w-4xl mx-auto text-left">
          
          {/* Card 1: Acceso Docentes (Mockup 1C Vector Icon: Presentation / GraduationCap) */}
          <Link 
            href="/login" 
            className="group relative bg-[#0d1424]/80 hover:bg-[#0f172a] backdrop-blur-2xl border border-cyan-500/30 hover:border-cyan-400 p-8 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-cyan-500/20 flex flex-col justify-between space-y-6 transform hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-950 to-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10 group-hover:scale-110 transition-transform">
                <Presentation className="w-8 h-8 text-cyan-400" />
              </div>
              
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                  Panel para Maestros
                </span>
                <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                  Acceso Docentes
                </h3>
              </div>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Ingresa a tu panel para estructurar planeaciones didácticas en 6 fases, generar exámenes y publicar avisos a tus grupos.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-cyan-400" /> Planeación 6 Fases
                </span>
                <span className="bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                  <Award className="w-3 h-3 text-cyan-400" /> Exámenes NEM
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-cyan-400 pt-2 border-t border-slate-800/80 relative z-10">
              <span>Ingresar al Panel Maestro</span>
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Acceso Familias / Padres (Mockup 1C Vector Icon: Users / HeartHandshake) */}
          <Link 
            href="/familias" 
            className="group relative bg-[#120d24]/80 hover:bg-[#160f2e] backdrop-blur-2xl border border-purple-500/30 hover:border-purple-400 p-8 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/20 flex flex-col justify-between space-y-6 transform hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-950 to-slate-900 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-purple-400" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">
                  Portal de Avisos Escolares
                </span>
                <h3 className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">
                  Acceso Familias / Padres
                </h3>
              </div>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Ingresa con el Código de Enlace entregado por tu docente para consultar tareas, avisos y listas de materiales en tiempo real.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" /> Supabase Realtime
                </span>
                <span className="bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" /> Sin Contraseñas
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-purple-400 pt-2 border-t border-slate-800/80 relative z-10">
              <span>Entrar al Portal de Avisos</span>
              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-slate-950 transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

        </div>

      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-800/80 pt-6 z-10 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono">
        <p>© 2026 LiberaPro — Plataforma Oficial Educativa</p>
        <div className="flex items-center gap-6 text-[11px]">
          <span className="flex items-center gap-1.5 text-cyan-400"><ShieldCheck className="w-4 h-4" /> Privacidad Docente 100%</span>
          <span className="flex items-center gap-1.5 text-purple-400"><Zap className="w-4 h-4" /> Realtime Active</span>
        </div>
      </footer>

    </div>
  );
}
