'use client';
import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Users } from 'lucide-react';

export default function StudentsPage() {
  const { language } = useTheme();
  const isEs = language === 'es';
  
  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-12 shadow-sm text-center max-w-md">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
          {isEs ? 'Estudiantes' : 'Students'}
        </h1>
        <p className="text-slate-600 font-medium">
          {isEs ? 'Esta página está en construcción. Próximamente podrás gestionar a tus estudiantes aquí.' : 'This page is under construction. You will soon be able to manage your students here.'}
        </p>
      </div>
    </div>
  );
}
