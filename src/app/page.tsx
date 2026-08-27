'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, Zap, BookOpen, Users, Presentation, Award } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  // MEMORIA DE TIPO DE USUARIO: Redirección automática al perfil recordado
  useEffect(() => {
    const savedType = localStorage.getItem('liberapro_user_type');
    if (savedType === 'teacher') {
      router.push('/app/dashboard');
    } else if (savedType === 'family') {
      router.push('/familias');
    } else {
      setIsRedirecting(false);
    }
  }, [router]);

  const setTeacherUserType = () => {
    localStorage.setItem('liberapro_user_type', 'teacher');
  };

  const setFamilyUserType = () => {
    localStorage.setItem('liberapro_user_type', 'family');
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-[#060911] text-cyan-400 flex flex-col items-center justify-center space-y-4 font-sans">
        <Sparkles className="w-10 h-10 animate-spin" />
        <p className="text-sm font-mono tracking-widest text-slate-300">Cargando perfil recordado...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#060911] text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* SECTION 1: HERO (Original) */}
      <div className="min-h-screen flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">

      {/* BACKGROUND VARIATION 1C: Enlarge Corner Glows & White Neon Parameters */}
      {/* Top Right Cyber Prehispanic Network Vector & Enlarged Cyan/White Glow */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] pointer-events-none opacity-60">
        <svg viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M700 0H350L480 140L300 320L520 540L700 360V0Z" stroke="url(#cyan-white-grad)" strokeWidth="2.5" strokeDasharray="6 6" />
          <path d="M700 160L550 310L660 420" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
          <circle cx="480" cy="140" r="6" fill="#ffffff" />
          <circle cx="300" cy="320" r="6" fill="#38bdf8" />
          <circle cx="520" cy="540" r="6" fill="#c084fc" />
          <defs>
            <linearGradient id="cyan-white-grad" x1="700" y1="0" x2="300" y2="540" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute top-[-150px] right-[-150px] w-[500px] h-[500px] bg-cyan-400/25 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Bottom Left Cyber Vector & Enlarged Violet/White Glow */}
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] pointer-events-none opacity-60">
        <svg viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M0 700H350L210 560L390 380L170 160L0 330V700Z" stroke="url(#purple-white-grad)" strokeWidth="2.5" strokeDasharray="6 6" />
          <path d="M0 540L150 390L30 280" stroke="#c084fc" strokeWidth="1.5" opacity="0.8" />
          <circle cx="210" cy="560" r="6" fill="#c084fc" />
          <circle cx="390" cy="380" r="6" fill="#ffffff" />
          <circle cx="170" cy="160" r="6" fill="#38bdf8" />
          <defs>
            <linearGradient id="purple-white-grad" x1="0" y1="700" x2="390" y2="160" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c084fc" />
              <stop offset="0.5" stopColor="#ffffff" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-50px] w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <header className="flex justify-between items-center max-w-6xl w-full mx-auto z-10">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Libera<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400">Pro</span>
        </h1>

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
          
          {/* Card 1: Acceso Docentes */}
          <Link 
            href="/login" 
            onClick={setTeacherUserType}
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

          {/* Card 2: Acceso Familias / Padres */}
          <Link 
            href="/familias" 
            onClick={setFamilyUserType}
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

      </div>
      
      {/* SECTION 2: TRANSITION (Fade-In Text) */}
      <section className="relative z-20 max-w-4xl mx-auto py-32 px-6 text-center">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          La Nueva Escuela Mexicana no tiene que significar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">menos tiempo libre.</span>
        </h2>
        <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
          Descubre cómo LiberaPro transforma tu labor docente eliminando la burocracia, para que vuelvas a enfocarte en lo que realmente importa: enseñar.
        </p>
      </section>

      {/* SECTION 3: STICKY SCROLL WORKFLOW */}
      <section className="relative z-20 max-w-6xl mx-auto py-24 px-6">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
          
          {/* Left Column: Sticky Icon */}
          <div className="hidden md:block w-1/3 relative">
            <div className="sticky top-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-950/30 border border-cyan-500/20 rounded-3xl flex items-center justify-center shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)] backdrop-blur-xl">
              <Sparkles className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
            </div>
          </div>

          {/* Right Column: Scrolling Cards */}
          <div className="w-full md:w-2/3 space-y-24 py-12">
            
            {/* Card 1 */}
            <div className="bg-[#120d24]/60 backdrop-blur-xl border border-cyan-500/20 p-8 sm:p-10 rounded-3xl hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Traductor Académico</h3>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                Convierte tus notas libres y contexto de grupo en planeaciones estructuradas con Ejes Articuladores y PDA oficiales. Nuestra inteligencia didáctica respeta tu autonomía mientras garantiza la alineación técnica.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#120d24]/60 backdrop-blur-xl border border-purple-500/20 p-8 sm:p-10 rounded-3xl hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Presentation className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Evaluación Formativa</h3>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                Generación de rúbricas y exámenes contextualizados a tu comunidad. Olvídate de buscar formatos; genera instrumentos de evaluación precisos en segundos, adaptados al nivel y campo formativo.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#120d24]/60 backdrop-blur-xl border border-blue-500/20 p-8 sm:p-10 rounded-3xl hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Muro Escolar Realtime</h3>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                Avisos a padres de familia sin necesidad de grupos de WhatsApp ni compartir tu número personal. Una plataforma unidireccional, segura y profesional para mantener a la comunidad conectada.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: IMPACT PARALLAX */}
      <section className="relative z-20 border-t border-slate-800/80 bg-gradient-to-b from-[#060911] to-[#0a0f1c] py-32 overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          <div className="flex-1">
            <h3 className="text-5xl sm:text-7xl font-black text-white tracking-tighter">0<span className="text-cyan-500 text-3xl sm:text-5xl"> Horas</span></h3>
            <p className="text-slate-400 mt-2 text-lg font-medium">perdidas en formatos burocráticos.</p>
          </div>
          <div className="hidden md:block w-px h-24 bg-slate-800"></div>
          <div className="flex-1">
            <h3 className="text-5xl sm:text-7xl font-black text-white tracking-tighter">100<span className="text-purple-500 text-3xl sm:text-5xl">%</span></h3>
            <p className="text-slate-400 mt-2 text-lg font-medium">Alineado a las 6 Fases de la NEM.</p>
          </div>
          <div className="hidden md:block w-px h-24 bg-slate-800"></div>
          <div className="flex-1">
            <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">Privacidad</h3>
            <p className="text-slate-400 mt-2 text-lg font-medium">Total para ti y tus estudiantes.</p>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="relative z-20 max-w-6xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-800/80 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono bg-[#060911]/80 backdrop-blur-md">
        <p>© 2026 LiberaPro</p>
        <div className="flex items-center gap-6 text-[11px]">
          <span className="flex items-center gap-1.5 text-cyan-400"><ShieldCheck className="w-4 h-4" /> Privacidad Docente 100%</span>
          <span className="flex items-center gap-1.5 text-purple-400"><Zap className="w-4 h-4" /> Realtime Active</span>
        </div>
      </footer>

    </div>
  );
}
