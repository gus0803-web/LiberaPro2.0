import React from 'react';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Settings, Bell, Search, LogOut } from 'lucide-react';
import Image from 'next/image';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen text-slate-800 font-[family-name:var(--font-geist-sans)] p-4 md:p-8 overflow-hidden items-center justify-center">
        
        {/* Main Glass Panel */}
        <main className="w-full max-w-7xl h-[90vh] bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden relative">
          
          {/* Top Navigation Bar */}
          <header className="h-24 px-8 flex items-center justify-between border-b border-white/20 shrink-0">
            {/* Logo / Title Area */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                {/* Sun icon */}
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">LiberaPro</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Education</span>
              </div>
            </div>

            {/* Centered Nav Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/app/dashboard" className="text-slate-900 font-bold border-b-2 border-blue-500 pb-1">Home</Link>
              <Link href="/app/planner" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">Calendar</Link>
              <Link href="/app/students" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">Students</Link>
              <Link href="/app/gradebook" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">Gradebook</Link>
              <Link href="/app/reports" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">Reports</Link>
            </nav>

            {/* Right Side Icons & Profile */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search..." className="bg-white/50 border border-white/60 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 w-48 transition-all" />
              </div>
              <button className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center border border-white/60 hover:bg-white/80 transition-colors">
                <Bell className="w-5 h-5 text-slate-700" />
              </button>
              <Link href="/app/settings" className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center border border-white/60 hover:bg-white/80 transition-colors">
                <Settings className="w-5 h-5 text-slate-700" />
              </Link>
              <Link href="/login" title="Logout" className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center border border-white/60 hover:bg-white/80 transition-colors">
                <LogOut className="w-5 h-5 text-slate-700" />
              </Link>
              <Link href="/admin" title="Director HQ" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 hover:bg-slate-800 transition-colors">
                <span className="text-white font-bold text-xs">HQ</span>
              </Link>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                <span className="text-white font-bold text-sm">MD</span>
              </div>
            </div>
          </header>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-y-auto p-8 relative">
            {children}
          </div>

        </main>
      </div>
    </ThemeProvider>
  )
}
