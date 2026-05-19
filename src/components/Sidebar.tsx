import React from 'react';
import Link from 'next/link';
import { PlanificarIcon, ExamenesIcon, MaterialIcon, MochilaIcon } from './icons/NeoAztecIcons';

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-volcanic-900/80 backdrop-blur-md border-r border-white/5 h-screen flex flex-col p-6 sticky top-0">
      {/* Logo */}
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Libera<span className="text-turquoise-neon">Pro</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4">
        <Link href="/app/dashboard" className="flex items-center space-x-4 px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white group hover:bg-white/10 transition-all">
          <PlanificarIcon className="w-6 h-6 text-turquoise-neon group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-lg">Planificar</span>
        </Link>
        <Link href="/app/exams" className="flex items-center space-x-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
          <ExamenesIcon className="w-6 h-6 group-hover:text-turquoise-neon group-hover:scale-110 transition-all" />
          <span className="font-medium text-lg">Exámenes</span>
        </Link>
        <Link href="/app/material" className="flex items-center space-x-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
          <MaterialIcon className="w-6 h-6 group-hover:text-turquoise-neon group-hover:scale-110 transition-all" />
          <span className="font-medium text-lg">Materiales</span>
        </Link>
        <Link href="/app/saved" className="flex items-center space-x-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
          <MochilaIcon className="w-6 h-6 group-hover:text-turquoise-neon group-hover:scale-110 transition-all" />
          <span className="font-medium text-lg">Mi Mochila</span>
        </Link>
      </nav>

      {/* User Profile / Settings stub */}
      <div className="mt-auto">
        <div className="flex items-center space-x-3 px-4 py-3 bg-volcanic-800 rounded-xl border border-white/5">
          <div className="w-10 h-10 rounded-full bg-turquoise-neon/20 flex items-center justify-center border border-turquoise-neon/50">
            <span className="text-turquoise-neon font-bold">M</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Maestro</p>
            <p className="text-xs text-gray-400">Jalisco</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
