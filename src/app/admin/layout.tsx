import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-gray-200 selection:bg-gold-pale/30 overflow-hidden font-[family-name:var(--font-geist-mono)]">
      
      {/* Sidebar Admin Monolito */}
      <aside className="w-64 flex-shrink-0 bg-[#0F0F0F] border-r border-white/5 h-screen flex flex-col pt-8 pb-4 relative z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
        
        {/* Línea dorada superior */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold-pale to-transparent opacity-50"></div>

        <div className="mb-10 px-6">
          <h1 className="text-xl font-bold tracking-widest text-white uppercase flex items-center space-x-3">
            <div className="w-6 h-6 border border-gold-pale/50 flex items-center justify-center">
               <div className="w-2 h-2 bg-gold-pale animate-pulse"></div>
            </div>
            <span>Libera<span className="text-gray-500">Pro</span></span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.2em] ml-9">Admin Control</p>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded border border-white/5 text-white hover:border-gold-pale/50 transition-all group">
            <svg className="w-4 h-4 text-gold-pale" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span className="font-semibold text-sm tracking-wider uppercase">Overview</span>
          </Link>
          <Link href="/admin/users" className="flex items-center space-x-3 px-4 py-3 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <span className="font-medium text-sm tracking-wider uppercase">Users</span>
          </Link>
          <Link href="/admin/billing" className="flex items-center space-x-3 px-4 py-3 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            <span className="font-medium text-sm tracking-wider uppercase">Billing</span>
          </Link>
        </nav>

        <div className="px-4 mt-auto">
           <Link href="/app/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
            <span className="font-medium text-xs tracking-wider uppercase">Exit to App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-[#0A0A0A]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
