'use client';

import React, { useEffect, useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { AgendaItem, addAgendaItem, loadSelectedPlanDate } from '@/lib/agenda';

const planningSchema = z.object({
  retoComunitario: z.string().optional(),
  vistaRapida: z.array(z.object({
    dia: z.string(),
    tema_central: z.string(),
    recurso_sep_clave: z.string(),
    competencia_nem: z.string(),
  })),
  diaADia: z.array(z.object({
    dia: z.string(),
    tiemposEstimados: z.string().optional(),
    inicio: z.string(),
    desarrollo: z.object({
      visual: z.string().optional(),
      auditiva: z.string().optional(),
      kinestesica: z.string().optional(),
    }).or(z.string()).optional(),
    cierre: z.string(),
    materiales: z.object({
      principal: z.string().optional(),
      sustentable: z.string().optional(),
    }).optional(),
    material_estandar: z.string().optional(),
    material_eco_ally: z.string().optional(),
    conaliteg_cita: z.string().optional()
  })),
  anexoMateriales: z.string().optional()
});

function getBusinessDays(startDateStr: string, count: number) {
  const dates = [];
  const [y, m, day] = startDateStr.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  
  while (dates.length < count) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      const yy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yy}-${mm}-${dd}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export default function PlannerPage() {
  const renderContent = (content: any) => {
    if (!content) return null;
    if (typeof content === 'string') return content;
    if (typeof content === 'object') {
      if (content.visual || content.auditiva || content.kinestesica) {
        return (
          <ul className="list-disc pl-4 mt-1 font-normal">
            {content.visual && <li><strong>Visual:</strong> {typeof content.visual === 'string' ? content.visual : JSON.stringify(content.visual)}</li>}
            {content.auditiva && <li><strong>Auditiva:</strong> {typeof content.auditiva === 'string' ? content.auditiva : JSON.stringify(content.auditiva)}</li>}
            {content.kinestesica && <li><strong>Kinestésica:</strong> {typeof content.kinestesica === 'string' ? content.kinestesica : JSON.stringify(content.kinestesica)}</li>}
          </ul>
        );
      }
      if (content.principal || content.sustentable) {
        return (
          <ul className="list-disc pl-4 mt-1 font-normal">
            {content.principal && <li><strong>Principal:</strong> {typeof content.principal === 'string' ? content.principal : JSON.stringify(content.principal)}</li>}
            {content.sustentable && <li><strong>Eco-Ally:</strong> {typeof content.sustentable === 'string' ? content.sustentable : JSON.stringify(content.sustentable)}</li>}
          </ul>
        );
      }
      return <pre className="whitespace-pre-wrap text-xs mt-1 font-normal">{JSON.stringify(content, null, 2)}</pre>;
    }
    return String(content);
  };

  const [fase, setFase] = useState('Fase 4: Primaria (3º y 4º)');
  const [duracion, setDuracion] = useState('Semanal');
  const [proyecto, setProyecto] = useState('');
  const [campoFormativo, setCampoFormativo] = useState('Lenguajes');
  const [metodologia, setMetodologia] = useState('Aprendizaje Basado en Proyectos Comunitarios');
  const [tema, setTema] = useState('');
  const [principio, setPrincipio] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasSavedPlan, setHasSavedPlan] = useState(false);

  const { object, submit, isLoading, error } = useObject({
    api: '/api/planner/generate',
    schema: planningSchema,
  });

  useEffect(() => {
    const storedDate = loadSelectedPlanDate();
    if (storedDate) {
      setSelectedDate(storedDate);
    } else {
      setSelectedDate(new Date().toISOString().slice(0, 10));
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem('selectedPlanDate', selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (object && !isLoading && selectedDate && !hasSavedPlan) {
      let daysCount = 5;
      if (duracion === 'Quincenal') daysCount = 10;
      if (duracion === 'Mensual') daysCount = 20;

      const datesToCover = getBusinessDays(selectedDate, daysCount);

      datesToCover.forEach((dateStr, index) => {
        const diaData = object.diaADia?.[index] || null;
        const newPlan: AgendaItem = {
          id: `${Date.now()}-${dateStr}-${index}`,
          date: dateStr,
          type: 'planeacion',
          title: tema || proyecto || 'Planeación Generada',
          description: `Día ${index + 1}: Fase: ${fase}. ${campoFormativo} - ${metodologia}`,
          metadata: {
            fase,
            proyecto,
            campoFormativo,
            metodologia,
            tema,
            principio,
            object: diaData ? { diaADia: [diaData] } : object, // Only store the specific day's data if possible
          },
          createdAt: new Date().toISOString(),
        };
        addAgendaItem(newPlan);
      });

      setSaveMessage('Planeación distribuida en el calendario.');
      setHasSavedPlan(true);
      window.setTimeout(() => setSaveMessage(''), 5000);
    }
  }, [object, isLoading, selectedDate, hasSavedPlan, fase, proyecto, campoFormativo, metodologia, tema, principio, duracion]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    if (!selectedDate) {
      setSaveMessage('Selecciona la fecha de inicio para la planeación.');
      return;
    }
    setHasSavedPlan(false);
    submit({ fase, duracion, proyecto, campoFormativo, metodologia, tema, principio });
  };

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h2 className="text-4xl font-light text-white tracking-tight">
          Nueva <span className="font-bold text-turquoise-neon">Planeación</span>
        </h2>
        <p className="text-lg text-gray-400 font-light max-w-2xl">
          Configura tu proyecto. La IA cruzará tus datos con la currícula de la NEM para entregarte una secuencia didáctica lista para aplicar.
        </p>
      </section>

      <form onSubmit={handleGenerate} className="bg-volcanic-800/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-glass grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Fase (Nivel Educativo)</label>
          <select value={fase} onChange={e => setFase(e.target.value)} className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turquoise-neon transition-colors">
            <option>Fase 1: Inicial (Maternal)</option>
            <option>Fase 2: Preescolar (1º a 3º)</option>
            <option>Fase 3: Primaria (1º y 2º)</option>
            <option>Fase 4: Primaria (3º y 4º)</option>
            <option>Fase 5: Primaria (5º y 6º)</option>
            <option>Fase 6: Secundaria (1º a 3º)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Duración</label>
          <select value={duracion} onChange={e => setDuracion(e.target.value)} className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turquoise-neon transition-colors">
            <option>Semanal</option>
            <option>Quincenal</option>
            <option>Mensual</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de inicio</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turquoise-neon transition-colors"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Proyecto de la NEM</label>
          <select required value={proyecto} onChange={e => setProyecto(e.target.value)} className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turquoise-neon transition-colors">
            <option value="" disabled>Selecciona un proyecto general...</option>
            <option value="El ciclo del agua en nuestra comunidad">El ciclo del agua en nuestra comunidad</option>
            <option value="Cuidado del medio ambiente y reciclaje">Cuidado del medio ambiente y reciclaje</option>
            <option value="Salud, bienestar y alimentación sana">Salud, bienestar y alimentación sana</option>
            <option value="Diversidad e inclusión en el aula">Diversidad e inclusión en el aula</option>
            <option value="Cultura de paz y prevención de la violencia">Cultura de paz y prevención de la violencia</option>
            <option value="Nuestras raíces: Historia y cultura local">Nuestras raíces: Historia y cultura local</option>
            <option value="Pensamiento científico: Fenómenos naturales">Pensamiento científico: Fenómenos naturales</option>
            <option value="Expresión artística y emociones">Expresión artística y emociones</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Campo Formativo</label>
          <select value={campoFormativo} onChange={e => setCampoFormativo(e.target.value)} className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turquoise-neon transition-colors">
            <option>Lenguajes</option>
            <option>Saberes y Pensamiento Científico</option>
            <option>Ética, Naturaleza y Sociedades</option>
            <option>De lo Humano y lo Comunitario</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Metodología Sociocrítica</label>
          <select value={metodologia} onChange={e => setMetodologia(e.target.value)} className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turquoise-neon transition-colors">
            <option>Aprendizaje Basado en Proyectos Comunitarios</option>
            <option>Aprendizaje Basado en Indagación (STEAM)</option>
            <option>Aprendizaje Basado en Problemas (ABP)</option>
            <option>Aprendizaje de Servicio (AS)</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Tema Específico / Contenido</label>
          <input required type="text" value={tema} onChange={e => setTema(e.target.value)} placeholder="Ej. Los estados de la materia, Fracciones, Revolución Mexicana..." className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turquoise-neon transition-colors" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Eje Articulador (Opcional)</label>
          <input type="text" value={principio} onChange={e => setPrincipio(e.target.value)} placeholder="Ej. Inclusión, Pensamiento Crítico, Interculturalidad crítica..." className="w-full bg-volcanic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turquoise-neon transition-colors" />
        </div>
        <div className="md:col-span-2 pt-4 flex flex-col gap-3 items-end">
          <button disabled={isLoading || !selectedDate} type="submit" className="bg-turquoise-neon text-volcanic-900 font-bold px-8 py-3 rounded-xl hover:bg-white hover:text-turquoise-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Generando Magia...' : 'Generar Planeación'}
          </button>
          {!selectedDate ? (
            <p className="text-sm text-yellow-300">Selecciona una fecha de inicio antes de generar.</p>
          ) : null}
        </div>
      </form>
      {saveMessage ? (
        <div className="rounded-3xl bg-emerald-100 border border-emerald-200 p-6 text-sm text-emerald-800">
          {saveMessage}
        </div>
      ) : null}

      {/* Loading State / Skeleton */}
      {isLoading && !object && (
        <div className="space-y-6">
          <h3 className="text-xl text-turquoise-neon font-semibold animate-pulse">Analizando currículum NEM y recuperando PDAs...</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-volcanic-800 border border-turquoise-neon/20 animate-pulse flex flex-col justify-center items-center">
                <div className="w-12 h-2 bg-turquoise-neon/40 rounded mb-2"></div>
                <div className="w-24 h-4 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-48 rounded-2xl bg-volcanic-800 border border-turquoise-neon/10 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
            <div className="h-48 rounded-2xl bg-volcanic-800 border border-turquoise-neon/10 animate-[pulse_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-6 text-red-700">
          <strong>Error:</strong> {typeof error === 'string' ? error : error?.message || 'No se pudo generar la planeación. Por favor intenta de nuevo.'}
        </div>
      )}

      {hasSubmitted && !isLoading && !object && !error && (
        <div className="rounded-3xl bg-yellow-500/10 border border-yellow-500/20 p-6 text-yellow-700">
          No se generó ningún resultado aún. Revisa tu conexión o intenta de nuevo con otros datos.
        </div>
      )}

      {/* Results Rendering */}
      {object?.vistaRapida && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-2xl font-semibold text-white">Vista Rápida (At-a-Glance)</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {object.vistaRapida.map((dia, idx) => (
              <div key={idx} className="bg-volcanic-800/80 p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-turquoise-neon/50 transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-turquoise-neon to-gold-pale"></div>
                <p className="text-sm font-bold text-gray-400 mb-2">{dia?.dia}</p>
                <p className="text-lg font-bold text-white leading-tight mb-4">{dia?.tema_central}</p>
                <p className="text-xs text-turquoise-neon mb-1">{dia?.recurso_sep_clave}</p>
                <p className="text-xs text-gray-500">{dia?.competencia_nem}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {object?.retoComunitario && (
        <section className="space-y-4 pt-8 border-t border-white/10">
          <h3 className="text-xl font-semibold text-white">Reto Comunitario General</h3>
          <p className="text-gray-300 bg-volcanic-800/50 p-6 rounded-2xl border border-white/5">{object.retoComunitario}</p>
        </section>
      )}

      {object?.diaADia && (
        <section className="space-y-6 pt-8 border-t border-white/10">
          <h3 className="text-2xl font-semibold text-white mb-6">Desarrollo Día a Día</h3>
          <div className="space-y-6">
            {object.diaADia.map((dia, idx) => (
              <div key={idx} className="bg-volcanic-800/50 rounded-3xl p-8 border border-white/5">
                <h4 className="text-2xl font-bold text-turquoise-neon mb-2 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-turquoise-neon/20 flex items-center justify-center mr-3 text-sm">{idx + 1}</span>
                  {dia?.dia}
                </h4>
                {dia?.tiemposEstimados && <p className="text-gray-400 text-sm mb-6 ml-11">Tiempos Estimados: {dia.tiemposEstimados}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-5 border-l-2 border-gold-pale">
                      <p className="text-xs font-bold text-gold-pale uppercase tracking-wider mb-2">Inicio</p>
                      <div className="text-sm text-gray-300">{renderContent(dia?.inicio)}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-5 border-l-2 border-turquoise-neon">
                      <p className="text-xs font-bold text-turquoise-neon uppercase tracking-wider mb-2">Desarrollo</p>
                      <div className="text-sm text-gray-300">{renderContent(dia?.desarrollo)}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-5 border-l-2 border-white/30">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cierre</p>
                      <div className="text-sm text-gray-300">{renderContent(dia?.cierre)}</div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="bg-volcanic-900 rounded-2xl p-6 border border-white/5 relative">
                      <div className="absolute top-0 right-0 bg-turquoise-neon text-volcanic-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">Eco-Ally</div>
                      <h5 className="font-semibold text-white mb-4">Materiales Recomendados</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Principal</p>
                          <p className="text-sm text-gray-300">{dia?.materiales?.principal || dia?.material_estandar}</p>
                        </div>
                        <div>
                          <p className="text-xs text-turquoise-neon mb-1">Alternativa Sustentable (&lt;$50 MXN)</p>
                          <p className="text-sm text-white">{dia?.materiales?.sustentable || dia?.material_eco_ally}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-volcanic-900 rounded-2xl p-6 border border-white/5 flex items-start space-x-4">
                      <div className="text-gold-pale pt-1">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Referencia CONALITEG Oficial</p>
                        <p className="text-sm text-gray-200">{dia?.conaliteg_cita}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {object?.anexoMateriales && (
        <section className="space-y-4 pt-8 border-t border-white/10">
          <h3 className="text-xl font-semibold text-white">Anexo de Materiales y Actividades</h3>
          <p className="text-gray-300 bg-volcanic-800/50 p-6 rounded-2xl border border-white/5 whitespace-pre-wrap">{object.anexoMateriales}</p>
        </section>
      )}
    </div>
  );
}
