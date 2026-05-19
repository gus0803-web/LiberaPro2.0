import React from 'react';
import Link from 'next/link';
import { PlanificarIcon, ExamenesIcon, MaterialIcon, MochilaIcon } from '@/components/icons/NeoAztecIcons';
import DynamicBackground from '@/components/DynamicBackground';

// Subcomponente: El botón gigante de la cuadrícula izquierda
const GiantNavButton = ({ href, icon: Icon, title, description, active = false }: any) => (
  <Link href={href} className="group flex flex-col items-center justify-center p-8 transition-all hover:-translate-y-1">
    <div className={`relative mb-6 ${active ? 'text-turquoise-neon' : 'text-gray-400 group-hover:text-gold-pale'}`}>
      <Icon className="w-32 h-32 stroke-[1px] transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(230,200,138,0.5)]" />
      {active && (
        <div className="absolute inset-0 bg-turquoise-neon/20 blur-3xl -z-10 rounded-full"></div>
      )}
    </div>
    <h3 className="text-2xl font-bold text-white tracking-wide mb-1 text-center">{title}</h3>
    <p className="text-sm text-gray-500 text-center max-w-[200px] leading-tight">{description}</p>
  </Link>
);

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen text-white selection:bg-turquoise-neon/30 overflow-hidden font-[family-name:var(--font-geist-sans)]">
      <DynamicBackground />
      
      {/* LADO IZQUIERDO: Navegación Principal Neo-Azteca (45% width) */}
      <aside className="w-[45%] h-screen relative flex flex-col pt-12 pb-8 px-8 xl:px-16 border-r border-white/5 z-0">
        
        {/* Marca de agua estilo calendario azteca (CSS SVG background) */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 30%, #0a1114 70%), url("data:image/svg+xml,%3Csvg width=\'800\' height=\'800\' viewBox=\'0 0 800 800\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'400\' cy=\'400\' r=\'300\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\' stroke-dasharray=\'10 10\'/%3E%3Ccircle cx=\'400\' cy=\'400\' r=\'200\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'4\'/%3E%3Cpath d=\'M400 100 L450 200 L350 200 Z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\'/%3E%3Cpath d=\'M400 700 L450 600 L350 600 Z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\'/%3E%3Cpath d=\'M100 400 L200 350 L200 450 Z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\'/%3E%3Cpath d=\'M700 400 L600 350 L600 450 Z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\'/%3E%3C/svg%3E")', backgroundPosition: 'center', backgroundSize: '120%', backgroundRepeat: 'no-repeat' }}></div>
        
        {/* Gradiente verde esmeralda sutil */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-turquoise-neon/5 to-transparent pointer-events-none"></div>

        {/* Logo Superior */}
        <div className="flex items-center space-x-3 z-10 mb-auto">
          <div className="w-10 h-10 border-2 border-turquoise-neon rounded-br-xl rounded-tl-xl flex items-center justify-center relative">
            <div className="absolute top-1 left-1 w-2 h-2 bg-gold-pale rounded-full animate-pulse"></div>
            <div className="w-4 h-4 border-b-2 border-r-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-none">
              Libera<span className="text-turquoise-neon font-light">Pro</span>
            </h1>
            <p className="text-xs text-gray-400 font-medium">Tu Asistente de Planificación Inteligente</p>
          </div>
        </div>

        {/* Cuadrícula 2x2 de Navegación */}
        <div className="grid grid-cols-2 gap-8 xl:gap-12 z-10 mt-12 mb-auto">
          <GiantNavButton 
            href="/app/planner" 
            icon={PlanificarIcon} 
            title="Planificar" 
            description="Crear Planeación (ABP, STEAM...)" 
            active={true}
          />
          <GiantNavButton 
            href="/app/exams" 
            icon={ExamenesIcon} 
            title="Exámenes" 
            description="Evaluación Formativa" 
          />
          <GiantNavButton 
            href="/app/material" 
            icon={MaterialIcon} 
            title="Material Didáctico" 
            description="Recursos CONALITEG/SEP" 
          />
          <GiantNavButton 
            href="/app/saved" 
            icon={MochilaIcon} 
            title="Mi 'Mochila'" 
            description="(Saved Plans)" 
          />
        </div>
      </aside>

      {/* LADO DERECHO: El Panel de Cristal (55% width) */}
      <main className="w-[55%] h-screen p-8 relative flex flex-col justify-center">
        <div className="absolute inset-0 bg-turquoise-neon/5 blur-[100px] rounded-full mix-blend-screen opacity-50 pointer-events-none"></div>
        
        {/* El Contenedor de Cristal */}
        <div className="w-full h-full max-h-[90vh] bg-[#11181c]/80 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative z-10">
          
          {/* Header del Cristal */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
            <div className="flex items-center space-x-2 text-gray-300">
              <PlanificarIcon className="w-5 h-5 text-turquoise-neon" />
              <span className="font-semibold tracking-wide">LiberaPro</span>
            </div>
            <div className="text-sm font-medium text-gray-500">
              {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Mini Sidebar Vertical dentro del cristal */}
            <nav className="w-56 border-r border-white/5 bg-black/20 flex flex-col py-6">
              <div className="space-y-1">
                <Link href="/app/planner" className="flex items-center space-x-3 px-6 py-3 border-l-2 border-turquoise-neon bg-white/5 text-white">
                  <PlanificarIcon className="w-5 h-5 text-turquoise-neon" />
                  <span className="font-medium text-sm">Planificar</span>
                </Link>
                <Link href="/app/exams" className="flex items-center space-x-3 px-6 py-3 border-l-2 border-transparent text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <ExamenesIcon className="w-5 h-5" />
                  <span className="font-medium text-sm">Exámenes</span>
                </Link>
                <Link href="/app/material" className="flex items-center space-x-3 px-6 py-3 border-l-2 border-transparent text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <MaterialIcon className="w-5 h-5" />
                  <span className="font-medium text-sm">Material Didáctico</span>
                </Link>
                <Link href="/app/saved" className="flex items-center space-x-3 px-6 py-3 border-l-2 border-transparent text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <MochilaIcon className="w-5 h-5" />
                  <span className="font-medium text-sm">Tiempo Liberado</span>
                </Link>
              </div>
              <div className="mt-auto px-6">
                <div className="flex items-center space-x-3 text-gray-500 hover:text-white cursor-pointer transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="font-medium text-sm">Smart Club</span>
                </div>
              </div>
            </nav>

            {/* Área de Contenido Dinámico */}
            <div className="flex-1 overflow-y-auto p-10 relative">
              {children}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
