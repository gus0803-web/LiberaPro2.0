'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { FileBarChart, Printer, Calendar as CalendarIcon, Download, Clock } from 'lucide-react';
import { loadAgendaItems, AgendaItem } from '@/lib/agenda';

export default function ReportsPage() {
  const { language } = useTheme();
  const isEs = language === 'es';
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAgendaItems().then(data => {
      setItems(data);
      setIsLoading(false);
    });
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const planesEsteMes = items.filter(item => {
    if (item.type !== 'planeacion') return false;
    const d = new Date(item.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSesiones = planesEsteMes.reduce((acc, plan) => {
    const sesiones = plan.metadata?.object?.sesiones;
    if (Array.isArray(sesiones)) return acc + sesiones.length;
    return acc;
  }, 0);

  const horasAhorradas = planesEsteMes.length * 2;

  const handlePrint = () => {
    window.print();
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando métricas...</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 print:hidden">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
            <FileBarChart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Reporte Administrativo</h1>
            <p className="text-slate-500 font-medium mt-1">Genera un informe detallado para entregar a Dirección o Supervisión</p>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
        >
          <Printer className="w-5 h-5" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Printable Area */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Reporte de Desempeño y Planeación</h2>
            <p className="text-lg text-slate-600 mt-2 font-medium">Ciclo Escolar en curso | Mes: {monthNames[currentMonth]} {currentYear}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Generado por</p>
            <p className="text-xl font-bold text-slate-800">Plataforma LiberaPro NEM</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileBarChart className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900">{planesEsteMes.length}</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Planeaciones Entregadas</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900">{totalSesiones}</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Sesiones Diseñadas</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900">{horasAhorradas} <span className="text-lg text-slate-500">hrs</span></h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Trabajo Administrativo Equivalente</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">✓</span>
            Desglose de Planeaciones del Mes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Grupo / Escuela</th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Tema / Proyecto</th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Fase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planesEsteMes.map(plan => {
                  const ident = plan.metadata?.object?.datosIdentificacion;
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium text-slate-900">{plan.date}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{plan.metadata?.schoolGroup || ident?.gradoYGrupo || 'N/A'}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-slate-800">{plan.title}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{ident?.fase || 'N/A'}</td>
                    </tr>
                  );
                })}
                {planesEsteMes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">No hay planeaciones generadas este mes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-slate-400 text-sm">
          <p>Este documento es generado automáticamente por el sistema y tiene validez administrativa para comprobar el avance curricular bajo el marco de la Nueva Escuela Mexicana.</p>
        </div>
      </div>
    </div>
  );
}
