'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Shield, Settings, LogOut, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { AgendaItem, loadAgendaItems } from '@/lib/agenda';
import { useTheme } from '@/components/ThemeProvider';

export function TopBarActions({ initial, isAdmin, creditsAvailable = 120 }: { initial: string; isAdmin: boolean; creditsAvailable?: number }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [reminders, setReminders] = useState<AgendaItem[]>([]);
  const { language } = useTheme();
  const isEs = language === 'es';

  useEffect(() => {
    const fetchReminders = async () => {
      const items = await loadAgendaItems();
      const todayStr = new Date().toISOString().slice(0, 10);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);

      const activeReminders = items.filter(
        item => item.type === 'recordatorio' && (item.date === todayStr || item.date === tomorrowStr)
      );
      setReminders(activeReminders);
    };
    fetchReminders();
    
    // Set up an interval to refresh reminders
    const interval = setInterval(fetchReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {/* Credits Counter */}
      <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/50 border border-white/60 shadow-sm">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isEs ? 'Créditos' : 'Credits'}</span>
        <span className="text-sm font-bold text-indigo-600">{creditsAvailable} <span className="text-slate-400 font-medium">/ 120</span></span>
      </div>

      {isAdmin && (
        <Link href="/admin" title="Admin HQ" className="hidden sm:flex w-10 h-10 rounded-full bg-slate-900 items-center justify-center border border-slate-700 hover:bg-slate-800 transition-colors shadow-md">
          <Shield className="w-5 h-5 text-gold-pale" />
        </Link>
      )}

      {/* Bell / Notifications Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="hidden sm:flex w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-white/60 hover:bg-white/80 transition-colors relative"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {reminders.length > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute top-12 right-0 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">{isEs ? 'Recordatorios' : 'Reminders'}</h3>
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{reminders.length}</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {reminders.length > 0 ? (
                reminders.map(rem => (
                  <div key={rem.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <p className="text-sm font-bold text-slate-700">{rem.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{rem.description}</p>
                    <div className="flex items-center space-x-2 mt-2 text-[10px] font-semibold text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{rem.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center flex flex-col items-center justify-center text-slate-400">
                  <Calendar className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">{isEs ? 'No tienes recordatorios próximos.' : 'No upcoming reminders.'}</p>
                </div>
              )}
            </div>
            <Link href="/app/calendar" className="block w-full text-center py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-bold text-indigo-600 border-t border-slate-100">
              {isEs ? 'Ir a la Agenda' : 'Go to Agenda'}
            </Link>
          </div>
        )}
      </div>

      <Link href="/app/settings" className="hidden sm:flex w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-white/60 hover:bg-white/80 transition-colors">
        <Settings className="w-5 h-5 text-slate-700" />
      </Link>
      
      <Link href="/login" title="Logout" className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center border border-white/60 hover:bg-white/80 transition-colors">
        <LogOut className="w-5 h-5 text-slate-700" />
      </Link>
      
      <div 
        className="hidden sm:flex w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden items-center justify-center transition-colors"
        style={{ backgroundColor: 'var(--app-font-color)' }}
      >
        <span className="text-white font-bold text-sm">{initial}</span>
      </div>
    </div>
  );
}
