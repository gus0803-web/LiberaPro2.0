'use client';

import React, { useEffect, useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { AgendaItem, addAgendaItem, loadSelectedPlanDate, downloadAgendaItem } from '@/lib/agenda';
import { Download } from 'lucide-react';

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
    actividades: z.string(),
    actividadesTEA: z.string().optional(),
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
  const [metodologia, setMetodologia] = useState('Aprendizaje Basado en Proyectos Comunitarios');
  const [tema, setTema] = useState('');
  const [principio, setPrincipio] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [hasTEA, setHasTEA] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [availableSchools, setAvailableSchools] = useState<any[]>([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasSavedPlan, setHasSavedPlan] = useState(false);

  const [debugError, setDebugError] = useState<string>('');

  const { object, submit, isLoading, error } = useObject({
    api: '/api/planner/generate',
    schema: planningSchema,
    onError: (err) => {
      console.error('useObject error:', err);
      setDebugError(err.message || String(err));
    }
  });

  useEffect(() => {
    const storedDate = loadSelectedPlanDate();
    if (storedDate) {
      setSelectedDate(storedDate);
    } else {
      setSelectedDate(new Date().toISOString().slice(0, 10));
    }
    const schools = JSON.parse(localStorage.getItem('liberapro_schools') || '[]');
    const valid = schools.filter((s: any) => s.school || s.group);
    setAvailableSchools(valid);
    if (valid.length > 0) setSelectedSchool(`${valid[0].school} - ${valid[0].group}`);
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

      const savePlans = async () => {
        const promises = datesToCover.map((dateStr, index) => {
          const diaData = object.diaADia?.[index] || null;
          const newPlan: AgendaItem = {
            id: `${Date.now()}-${dateStr}-${index}`,
            date: dateStr,
            type: 'planeacion',
            title: tema || proyecto || 'Planeación Generada',
            description: `Día ${index + 1}: Fase: ${fase}. NEM 4 Campos - ${metodologia}`,
            metadata: {
              fase,
              proyecto,
              metodologia,
              tema,
              principio,
              hasTEA,
              selectedSchool,
              object: diaData ? { diaADia: [diaData] } : object, // Only store the specific day's data if possible
            },
            createdAt: new Date().toISOString(),
          };
          return addAgendaItem(newPlan);
        });

        setSaveMessage('Guardando planeación en la nube...');
        const results = await Promise.all(promises);
        if (results.every(r => r)) {
          setSaveMessage('Planeación distribuida y guardada en el calendario.');
        } else {
          setSaveMessage('Error parcial al guardar en la nube.');
        }
        setHasSavedPlan(true);
        window.setTimeout(() => setSaveMessage(''), 5000);
      };
      savePlans();
    }
  }, [object, isLoading, selectedDate, hasSavedPlan, fase, proyecto, metodologia, tema, principio, duracion, hasTEA, selectedSchool]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setDebugError('');
    if (!selectedDate) {
      setSaveMessage('Selecciona la fecha de inicio para la planeación.');
      return;
    }
    setHasSavedPlan(false);
    submit({ fase, duracion, proyecto, metodologia, tema, principio, hasTEA, selectedSchool });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h2 className="text-2xl sm:text-4xl font-light text-slate-900 tracking-tight">
          Nueva <span className="font-bold text-blue-600">Planeación</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-500 font-light max-w-2xl">
          Configura tu proyecto. La IA cruzará tus datos con la currícula de la NEM para entregarte una secuencia didáctica lista para aplicar.
        </p>
      </section>

      <form onSubmit={handleGenerate} className="bg-white/60 backdrop-blur-md p-4 sm:p-8 rounded-3xl border border-white/60 shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fase (Nivel Educativo)</label>
          <select value={fase} onChange={e => setFase(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors">
            <option>Fase 1: Inicial (Maternal)</option>
            <option>Fase 2: Preescolar (1º a 3º)</option>
            <option>Fase 3: Primaria (1º y 2º)</option>
            <option>Fase 4: Primaria (3º y 4º)</option>
            <option>Fase 5: Primaria (5º y 6º)</option>
            <option>Fase 6: Secundaria (1º a 3º)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Duración</label>
          <select value={duracion} onChange={e => setDuracion(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors">
            <option>Semanal</option>
            <option>Quincenal</option>
            <option>Mensual</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha de inicio</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Escuela y Grupo (Perfil)</label>
          <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors">
            <option value="">Sin especificar (General)</option>
            {availableSchools.map((s, idx) => (
              <option key={idx} value={`${s.school} - ${s.group}`}>{s.school} - {s.group}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Proyecto de la NEM</label>
          <select required value={proyecto} onChange={e => setProyecto(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors">
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
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Metodología Sociocrítica</label>
          <select value={metodologia} onChange={e => setMetodologia(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors">
            <option>Aprendizaje Basado en Proyectos Comunitarios</option>
            <option>Aprendizaje Basado en Indagación (STEAM)</option>
            <option>Aprendizaje Basado en Problemas (ABP)</option>
            <option>Aprendizaje de Servicio (AS)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Eje Articulador (Opcional)</label>
          <select value={principio} onChange={e => setPrincipio(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors">
            <option value="">Selecciona un eje articulador...</option>
            <option>Inclusión</option>
            <option>Pensamiento Crítico</option>
            <option>Interculturalidad crítica</option>
            <option>Igualdad de género</option>
            <option>Vida saludable</option>
            <option>Apropiación de las culturas a través de la lectura y la escritura</option>
            <option>Artes y experiencias estéticas</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Situación específica del aula (Opcional)</label>
          <input type="text" value={tema} onChange={e => setTema(e.target.value)} placeholder="Ej. Los estados de la materia, Fracciones, Revolución Mexicana..." className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors placeholder:text-slate-400" />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <input type="checkbox" id="tea-checkbox" checked={hasTEA} onChange={e => setHasTEA(e.target.checked)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
          <label htmlFor="tea-checkbox" className="text-sm font-semibold text-blue-900 cursor-pointer">
            Incluir adaptaciones para alumnos con TEA (Trastorno del Espectro Autista)
          </label>
        </div>
        <div className="sm:col-span-2 pt-2 flex flex-col gap-3 items-end">
          <button disabled={isLoading || !selectedDate} type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Generando Magia...' : 'Generar Planeación'}
          </button>
          {!selectedDate ? (
            <p className="text-sm text-amber-600">Selecciona una fecha de inicio antes de generar.</p>
          ) : null}
        </div>
      </form>
      {saveMessage ? (
        <div className="rounded-3xl bg-emerald-100 border border-emerald-200 p-6 text-sm text-emerald-800 space-y-2">
          <p className="font-bold">¡Planeación Generada Exitosamente!</p>
          <p>{saveMessage}</p>
          {saveMessage.includes('distribuida') && (
            <p className="font-medium text-emerald-900 mt-2">La planeación fue generada tomando en cuenta los cuatro campos formativos de la NEM.</p>
          )}
        </div>
      ) : null}

      {/* Loading State / Skeleton */}
      {isLoading && !object && (
        <div className="space-y-6">
          <h3 className="text-xl text-blue-600 font-semibold animate-pulse">Analizando currículum NEM y recuperando PDAs...</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 sm:h-32 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex flex-col justify-center items-center">
                <div className="w-12 h-2 bg-blue-200 rounded mb-2"></div>
                <div className="w-20 h-3 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">
          <strong>Error:</strong> {typeof error === 'string' ? error : error?.message || 'No se pudo generar la planeación. Por favor intenta de nuevo.'}
        </div>
      )}

      {hasSubmitted && !isLoading && !object && !error && !debugError && (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 text-amber-700">
          No se generó ningún resultado aún. Revisa tu conexión o intenta de nuevo con otros datos.
        </div>
      )}

      {debugError && (
        <div className="rounded-3xl bg-red-100 border border-red-300 p-6 text-red-800">
          <strong>Debug Error:</strong> {debugError}
        </div>
      )}

      {/* Results Rendering */}
      {object?.vistaRapida && (
        <section className="space-y-4">
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">Vista Rápida (At-a-Glance)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {object.vistaRapida.map((dia, idx) => (
              <div key={idx} className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-400"></div>
                <p className="text-xs font-bold text-slate-400 mb-1">{dia?.dia}</p>
                <div className="text-sm font-bold text-slate-900 leading-tight mb-2">{renderContent(dia?.tema_central)}</div>
                <p className="text-[10px] text-blue-600 mb-0.5">{dia?.recurso_sep_clave}</p>
                <p className="text-[10px] text-slate-400">{dia?.competencia_nem}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {object?.retoComunitario && (
        <section className="space-y-3 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Reto Comunitario General</h3>
          <div className="text-sm text-slate-700 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">{renderContent(object.retoComunitario)}</div>
        </section>
      )}

      {object?.diaADia && (
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">Desarrollo Día a Día</h3>
          <div className="space-y-4">
            {object.diaADia.map((dia, idx) => (
              <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                <h4 className="text-lg sm:text-xl font-bold text-blue-700 mb-1 flex items-center">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2 text-xs font-bold">{idx + 1}</span>
                  <div className="inline-block">{renderContent(dia?.dia)}</div>
                </h4>
                {dia?.tiemposEstimados && <div className="text-slate-500 text-xs mb-4 ml-9">Tiempos Estimados: {renderContent(dia.tiemposEstimados)}</div>}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                  <div className="space-y-3">
                    <div className="bg-slate-50/80 rounded-xl p-4 border-l-4 border-blue-500">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Actividades de Aprendizaje</p>
                      <div className="text-xs text-slate-700 whitespace-pre-wrap">{renderContent(dia?.actividades)}</div>
                    </div>
                    {dia?.actividadesTEA && (
                      <div className="bg-amber-50/80 rounded-xl p-4 border-l-4 border-amber-500 relative">
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl">Inclusión</div>
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Actividades TEA</p>
                        <div className="text-xs text-amber-900 whitespace-pre-wrap">{renderContent(dia?.actividadesTEA)}</div>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200 relative">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl">Eco-Ally</div>
                      <h5 className="font-semibold text-slate-800 text-sm mb-3">Materiales Recomendados</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-slate-500 mb-0.5">Principal</p>
                          <div className="text-xs text-slate-700">{renderContent(dia?.materiales?.principal || dia?.material_estandar)}</div>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-600 mb-0.5">Alternativa Sustentable (&lt;$50 MXN)</p>
                          <div className="text-xs text-slate-800">{renderContent(dia?.materiales?.sustentable || dia?.material_eco_ally)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50/80 rounded-xl p-4 border border-purple-100 flex items-start space-x-3">
                      <div className="text-purple-500 pt-0.5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 mb-0.5">Referencia CONALITEG Oficial</p>
                        <p className="text-xs text-slate-700">{dia?.conaliteg_cita}</p>
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
        <section className="space-y-3 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Anexo de Materiales y Actividades</h3>
          <div className="text-sm text-slate-700 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 whitespace-pre-wrap">{renderContent(object.anexoMateriales)}</div>
        </section>
      )}

      {object && (
        <div className="pt-8 pb-4 flex justify-center sm:justify-end">
          <button 
            type="button"
            onClick={() => {
              const masterItem: AgendaItem = {
                id: `master-download-${Date.now()}`,
                date: selectedDate || new Date().toISOString().slice(0, 10),
                type: 'planeacion',
                title: tema || proyecto || 'Planeación Completa',
                description: `Documento Maestro: ${fase}. NEM 4 Campos - ${metodologia}`,
                metadata: { object: object, hasTEA, selectedSchool, selectedDate, duracion },
                createdAt: new Date().toISOString()
              };
              downloadAgendaItem(masterItem);
            }} 
            className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            Descargar Planeación Completa (.docx)
          </button>
        </div>
      )}
    </div>
  );
}
