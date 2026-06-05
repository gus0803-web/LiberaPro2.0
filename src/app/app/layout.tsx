import React from 'react';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Settings, Bell, LogOut, Shield } from 'lucide-react';
import Image from 'next/image';

import { TopNav } from '@/components/TopNav';
import { AppFooter } from '@/components/AppFooter';
import { FeedbackTab } from '@/components/FeedbackTab';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email || '';
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';
  const isAdmin = userEmail === 'gus0803@gmail.com';

  return (
    <ThemeProvider>
      <div className="flex min-h-screen text-[var(--app-font-color)] font-[family-name:var(--font-geist-sans)] p-4 md:p-8 overflow-hidden items-center justify-center">
        
        {/* Main Glass Panel */}
        <main className="w-full max-w-7xl h-[90vh] bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden relative">
          
          {/* Top Navigation Bar */}
          <header className="h-16 sm:h-24 px-4 sm:px-8 flex items-center justify-between border-b border-white/20 shrink-0">
            {/* Logo / Title Area */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 relative rounded-2xl overflow-hidden shadow-lg shadow-slate-900/20">
                <Image src="/logo-pluma-transparente.png" alt="LiberaPro Logo" fill sizes="3rem" className="object-contain object-center scale-[1.1]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">LiberaPro</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Education</span>
              </div>
            </div>

            {/* Centered Nav Links */}
            <TopNav />

            {/* Right Side Icons & Profile */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isAdmin && (
                <Link href="/admin" title="Admin HQ" className="hidden sm:flex w-10 h-10 rounded-full bg-slate-900 items-center justify-center border border-slate-700 hover:bg-slate-800 transition-colors shadow-md">
                  <Shield className="w-5 h-5 text-gold-pale" />
                </Link>
              )}
              <button className="hidden sm:flex w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-white/60 hover:bg-white/80 transition-colors">
                <Bell className="w-5 h-5 text-slate-700" />
              </button>
              <Link href="/app/settings" className="hidden sm:flex w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-white/60 hover:bg-white/80 transition-colors">
                <Settings className="w-5 h-5 text-slate-700" />
              </Link>
              <Link href="/login" title="Logout" className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center border border-white/60 hover:bg-white/80 transition-colors">
                <LogOut className="w-5 h-5 text-slate-700" />
              </Link>
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white shadow-sm overflow-hidden items-center justify-center">
                <span className="text-white font-bold text-sm">{initial}</span>
              </div>
            </div>
          </header>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
            {children}
          </div>

          {/* Footer */}
          <AppFooter />

        </main>

        {/* Feedback Tab */}
        <FeedbackTab />
      </div>
    </ThemeProvider>
  )
}
