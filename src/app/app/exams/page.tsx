'use client';

import React, { useState, useRef } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { useReactToPrint } from 'react-to-print';
import { ExamPreview } from '@/components/ExamPreview';

// El mismo esquema para uso en el cliente
const examSchema = z.object({
  tipoEvaluacion: z.enum(['rubrica', 'examen']),
  titulo: z.string(),
  instrucciones: z.string(),
  rubrica: z.array(z.object({
    criterio: z.string(),
    sobresaliente: z.string(),
    satisfactorio: z.string(),
    en_proceso: z.string()
  })).optional(),
  examen: z.array(z.object({
    pregunta: z.string(),
    tipo: z.enum(['opcion_multiple', 'abierta', 'relacionar']),
    opciones: z.array(z.string()).optional(),
    respuesta_correcta: z.string()
  })).optional()
});

export default function ExamsPage() {
  const [formato, setFormato] = useState('rubrica');
  const printRef = useRef<HTMLDivElement>(null);

  const { object, submit, isLoading, error } = useObject({
    api: '/api/exams/generate',
    schema: examSchema,
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ formato });
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Evaluacion_LiberaPro',
  });

  return (
    <div className="space-y-8">
      <section className="space-y-4 print:hidden">
        <h2 className="text-4xl font-light text-white tracking-tight">
          Generador de <span className="font-bold text-gold-pale">Evaluaciones</span>
        </h2>
        <p className="text-lg text-gray-400 font-light max-w-2xl">
          Elige el formato. La IA analizará tu última planeación generada para estructurar una evaluación perfectamente alineada.
        </p>
      </section>

      <form onSubmit={handleGenerate} className="bg-volcanic-800/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-glass flex flex-col md:flex-row items-end gap-6 print:hidden">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-300 mb-2">Formato de Evaluación</label>
          <select value={formato} onChange={e => setFormato(e.target.value)} className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-pale transition-colors">
            <option value="rubrica">Rúbrica de Proyecto</option>
            <option value="examen">Examen Reflexivo</option>
          </select>
        </div>
        <button disabled={isLoading} type="submit" className="bg-gold-pale text-volcanic-900 font-bold px-8 py-3 rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
          {isLoading ? 'Analizando...' : 'Generar Evaluación'}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl print:hidden">
          {error.message.includes('404') ? 'Aún no tienes una planeación. Ve a "Planificar" y genera una primero.' : 'Ocurrió un error al generar la evaluación.'}
        </div>
      )}

      {/* Workspace Area */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && !object && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-volcanic-900/80 backdrop-blur-sm rounded-xl min-h-[500px] print:hidden">
            <div className="w-16 h-16 border-4 border-gold-pale border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gold-pale font-medium animate-pulse">Sincronizando con tu última planeación...</p>
          </div>
        )}

        {/* Paper Preview */}
        <div className={`transition-opacity duration-500 ${!object && !isLoading ? 'opacity-0 hidden' : 'opacity-100'} print:block`}>
          
          {/* Action Bar */}
          <div className="flex justify-end mb-4 print:hidden">
            <button 
              onClick={() => handlePrint()}
              disabled={isLoading || !object}
              className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Imprimir / PDF</span>
            </button>
          </div>

          <div className="overflow-x-auto pb-10">
            <ExamPreview ref={printRef} data={object} />
          </div>
        </div>
      </div>
    </div>
  );
}
