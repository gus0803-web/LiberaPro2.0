'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Presentation, ShieldCheck, GraduationCap, Users, Bot, Code, FileText } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
    } else {
      // Fallback message for browsers that don't support it or if it's already installed
      alert('Para instalar la app, abre las opciones de tu navegador y selecciona "Agregar a inicio".');
    }
  };

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
    <div className="bg-[#111111] text-slate-100 font-sans relative overflow-clip">
      
      {/* SECTION 1: HERO (Original Login) */}
      <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-[url('/login-bg.png')] relative">
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
          <div className="mb-6 relative w-32 h-32 transform-gpu transition-transform duration-300 hover:-translate-y-1 flex items-center justify-center">
            <Image src="/logo-512.png" alt="LiberaPro Logo" fill sizes="8rem" className="object-contain object-center scale-[1.15]" />
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
              {/* Link para Facebook - Grupo */}
              <a href="https://www.facebook.com/profile.php?id=61593446267076" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800/80 md:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50 md:border-slate-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
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
                onClick={handleInstallClick}
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

      {/* SECTION 2: HERRAMIENTAS */}
      <section className="relative z-20 bg-[#111111] border-t border-slate-800/80 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-6">
              El único asistente virtual para tu ciclo escolar
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Descubre las herramientas diseñadas específicamente para agilizar y enriquecer tu labor diaria.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-amber-500/20 p-8 rounded-3xl hover:border-amber-400/50 transition-all">
              <BookOpen className="w-10 h-10 text-amber-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Planeación</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Generación de planeaciones estructuradas con ejes articuladores y PDA oficiales.</p>
            </div>
            <div className="bg-slate-900/50 border border-emerald-500/20 p-8 rounded-3xl hover:border-emerald-400/50 transition-all">
              <Presentation className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Evaluación</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Rúbricas e instrumentos precisos y contextualizados a tu comunidad escolar.</p>
            </div>
            <div className="bg-slate-900/50 border border-blue-500/20 p-8 rounded-3xl hover:border-blue-400/50 transition-all">
              <ShieldCheck className="w-10 h-10 text-blue-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Muro Escolar</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Comunicación segura y unidireccional con padres de familia sin usar tu número personal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: EQUIPO */}
      <section className="relative z-20 bg-slate-950 py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-16">
            Equipo que respaldan a LiberaPro
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6">
                <GraduationCap className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-slate-300 text-sm font-semibold leading-relaxed">
                Especialistas de gestión pedagógica con más de 45 años de experiencia combinada
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-amber-400" />
              </div>
              <p className="text-slate-300 text-sm font-semibold leading-relaxed">
                Comité de planeación y gestión pedagógica
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-cyan-400" />
              </div>
              <p className="text-slate-300 text-sm font-semibold leading-relaxed">
                Artificial intelligence experts and AI agent developers
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6">
                <Code className="w-10 h-10 text-blue-400" />
              </div>
              <p className="text-slate-300 text-sm font-semibold leading-relaxed">
                Equipo de codificación y web developers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DESARROLLO DEL PROYECTO BANNER */}
      <section className="relative z-20 bg-gradient-to-r from-amber-900/40 to-emerald-900/40 border-y border-slate-800 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-amber-200 mb-4">
            Desarrollo del proyecto para líderes en educación
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed font-medium">
            El proceso contó con la dirección de un Cuerpo Docente de Alta Especialización, integrado por maestros y doctores en educación.
          </p>
        </div>
      </section>

      {/* SECTION 5: MISION Y VISION */}
      <section className="relative z-20 bg-[#111111] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white">Misión y Visión</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-slate-900/40 border border-emerald-500/20 p-10 rounded-[2rem]">
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">Nuestra Misión</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Transformar y dignificar la labor docente mediante herramientas tecnológicas innovadoras que eliminen la burocracia administrativa, devolviendo a los maestros el tiempo para inspirar en el aula.
              </p>
            </div>
            <div className="bg-slate-900/40 border border-amber-500/20 p-10 rounded-[2rem]">
              <h3 className="text-2xl font-bold text-amber-400 mb-4">Nuestra Visión</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Consolidarnos como el aliado tecnológico número uno de la Nueva Escuela Mexicana en todo México, empoderando a las comunidades escolares a través de inteligencia artificial ética y alineada pedagógicamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: GALERIA DE PROYECTOS */}
      <section className="relative z-20 bg-slate-950 py-24 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Galería de Proyectos</h2>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
            Explora ejemplos reales de planeaciones didácticas generadas por nuestra Inteligencia Artificial para diferentes Fases.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {/* Si deseas cambiar los nombres de los botones en el futuro, solo edita el texto dentro de la etiqueta <span> de cada botón */}
            <button className="group bg-slate-900 border border-slate-700 hover:border-cyan-500 px-6 py-3 rounded-full flex items-center space-x-2 transition-all">
              <FileText className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 font-semibold group-hover:text-white">Ver Proyecto Fase 3</span>
            </button>
            <button className="group bg-slate-900 border border-slate-700 hover:border-cyan-500 px-6 py-3 rounded-full flex items-center space-x-2 transition-all">
              <FileText className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 font-semibold group-hover:text-white">Ver Proyecto Fase 4</span>
            </button>
            <button className="group bg-slate-900 border border-slate-700 hover:border-cyan-500 px-6 py-3 rounded-full flex items-center space-x-2 transition-all">
              <FileText className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 font-semibold group-hover:text-white">Ver Proyecto Fase 5</span>
            </button>
            <button className="group bg-slate-900 border border-slate-700 hover:border-cyan-500 px-6 py-3 rounded-full flex items-center space-x-2 transition-all">
              <FileText className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 font-semibold group-hover:text-white">Ver Proyecto Fase 6</span>
            </button>
            <button className="group bg-slate-900 border border-slate-700 hover:border-amber-500 px-6 py-3 rounded-full flex items-center space-x-2 transition-all">
              <FileText className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 font-semibold group-hover:text-white">Formato de Evaluación</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
