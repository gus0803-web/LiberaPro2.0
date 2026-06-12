import React from 'react';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Settings, Bell, LogOut, Shield } from 'lucide-react';
import Image from 'next/image';

import { TopNav } from '@/components/TopNav';
import { AppFooter } from '@/components/AppFooter';
import { TopBarActions } from '@/components/TopBarActions';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email || '';
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single();
  const nameToUse = profile?.full_name || userEmail;
  const initial = nameToUse ? nameToUse.charAt(0).toUpperCase() : 'U';
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image src="/logo-512.png" alt="LiberaPro Logo" fill sizes="3rem" className="object-contain object-center scale-[1.15]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">LiberaPro</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Education</span>
              </div>
            </div>

            {/* Centered Nav Links */}
            <TopNav />

            {/* Right Side Icons & Profile */}
            <TopBarActions initial={initial} isAdmin={isAdmin} creditsAvailable={120} />
          </header>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col relative">
            <div className="flex-1">
              {children}
            </div>
            {/* Footer moved inside scrolling area so it doesn't take up fixed space on mobile */}
            <div className="mt-8">
              <AppFooter />
            </div>
          </div>
        </main>

        {/* Feedback Tab moved to AppFooter */}
      </div>
    </ThemeProvider>
  )
}
