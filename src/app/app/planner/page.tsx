'use client';

import React, { useEffect, useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { AgendaItem, addAgendaItem, loadSelectedPlanDate, downloadAgendaItem } from '@/lib/agenda';
import { Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

const nemPlanningSchema = z.object({
  datosIdentificacion: z.object({
    nombreDocente: z.string(),
    gradoYGrupo: z.string(),
    fase: z.string(),
    periodoAplicacion: z.string()
  }),
  elementosCurriculares: z.object({
    camposFormativos: z.string(),
    metodologia: z.string(),
    problematica: z.string(),
    contenidos: z.string(),
    pda: z.string(),
    ejesArticuladores: z.string(),
    escenario: z.string()
  }),
  fases: z.array(z.object({
    titulo: z.string(),
    actividades: z.string(),
    recursosYMateriales: z.string(),
    evaluacionFormativa: z.string(),
    adecuacionesTEA: z.string()
  }))
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

function getEndDateStr(startDateStr: string, count: number) {
  if (!startDateStr || count <= 0) return '';
  const dates = getBusinessDays(startDateStr, count);
  return dates[dates.length - 1];
}

export default function PlannerPage() {
  const renderContent = (content: any) => {
    if (!content) return null;
    if (typeof content === 'string') return content;
    return <pre className="whitespace-pre-wrap text-xs mt-1 font-normal">{JSON.stringify(content, null, 2)}</pre>;
  };

  const router = useRouter();
  const [docenteName, setDocenteName] = useState('N/A');
  const [savedSchools, setSavedSchools] = useState<{school: string, group: string}[]>([]);

  useEffect(() => {
    const savedName = localStorage.getItem('liberapro_teacher_name');
    if (savedName) setDocenteName(savedName);

    const schoolsRaw = localStorage.getItem('liberapro_schools');
    if (schoolsRaw) {
      try {
        const parsed = JSON.parse(schoolsRaw).filter((s: any) => s.school || s.group);
        setSavedSchools(parsed);
      } catch(e) {}
    }
  }, []);

  const [fase, setFase] = useState('Fase 3: Primaria (1º y 2º)');
  const [camposFormativos, setCamposFormativos] = useState<string[]>(['Lenguajes']);
  const [metodologia, setMetodologia] = useState('Aprendizaje Basado en Proyectos Comunitarios');
  const [tema, setTema] = useState('');
  const [notasMaestro, setNotasMaestro] = useState('');
  
  const [duracion, setDuracion] = useState('Semanal');
  const [hasTEA, setHasTEA] = useState(false);
  const [schoolGroup, setSchoolGroup] = useState('');

  const [selectedDate, setSelectedDate] = useState('');
  
  const [saveMessage, setSaveMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasSavedPlan, setHasSavedPlan] = useState(false);
  const [debugError, setDebugError] = useState<string>('');

  const { object, submit, isLoading, error } = useObject({
    api: '/api/planner/generate',
    schema: nemPlanningSchema,
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
  }, []);

  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem('selectedPlanDate', selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (object?.fases && !isLoading && selectedDate && !hasSavedPlan) {
      let expectedSessions = 5;
      if (duracion === 'Quincenal') expectedSessions = 10;
      if (duracion === 'Mensual') expectedSessions = 20;
      
      const datesToCover = getBusinessDays(selectedDate, expectedSessions);

      const savePlans = async () => {
        const fullPlanObject = {
          datosIdentificacion: {
            ...object.datosIdentificacion,
            nombreDocente: docenteName || object.datosIdentificacion?.nombreDocente || 'N/A',
            periodoAplicacion: `Del ${selectedDate} al ${getEndDateStr(selectedDate, expectedSessions)}`
          },
          elementosCurriculares: object.elementosCurriculares,
          fases: object.fases
        };

        const promises = datesToCover.map((dateStr, index) => {
          const newPlan: AgendaItem = {
            id: `${Date.now()}-${dateStr}-${index}`,
            date: dateStr,
            type: 'planeacion',
            title: tema || 'Planeación NEM',
            description: `Planeación Proyecto: Fase ${fase} - ${metodologia}`,
            metadata: {
              fase,
              tema,
              metodologia,
              schoolGroup,
              duracion,
              hasTEA,
              object: fullPlanObject,
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
        router.refresh();
        window.setTimeout(() => setSaveMessage(''), 5000);
      };
      savePlans();
    }
  }, [object, isLoading, selectedDate, hasSavedPlan, fase, tema, metodologia, schoolGroup, duracion, hasTEA]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setDebugError('');
    if (!selectedDate) {
      setSaveMessage('Selecciona la fecha de inicio para la planeación.');
      return;
    }
    setHasSavedPlan(false);
    
    // Calcular días y fecha término
    let expectedSessions = 5;
    if (duracion === 'Quincenal') expectedSessions = 10;
    if (duracion === 'Mensual') expectedSessions = 20;
    const fechaTermino = getEndDateStr(selectedDate, expectedSessions);

    // El backend concatenará todo. Solo le pasamos lo estructurado.
    const notasCompletas = `Campos Formativos Seleccionados: ${camposFormativos.join(', ')}\n\nNotas adicionales:\n${notasMaestro}`;
    
    submit({ 
      fase, 
      tema, 
      notasMaestro: notasCompletas, 
      metodologia, 
      duracion, 
      hasTEA, 
      schoolGroup,
      fechaInicio: selectedDate,
      fechaTermino
    });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
          Estructurador <span className="font-bold text-blue-600">Académico NEM</span>
        </h2>
        <p className="text-sm text-slate-500 font-light max-w-2xl">
          Ingresa tus apuntes y contexto. El AI se encargará de darles la estructura oficial.
        </p>
      </section>

      <form onSubmit={handleGenerate} className="bg-white/60 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/60 shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fase (Nivel Educativo)</label>
          <select value={fase} onChange={e => setFase(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors">
            <option>Fase 1: Inicial (Maternal)</option>
            <option>Fase 2: Preescolar (1º a 3º)</option>
            <option>Fase 3: Primaria (1º y 2º)</option>
            <option>Fase 4: Primaria (3º y 4º)</option>
            <option>Fase 5: Primaria (5º y 6º)</option>
            <option>Fase 6: Secundaria (1º a 3º)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Campos Formativos</label>
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1.5 overflow-y-auto">
            {['Lenguajes', 'Saberes y Pensamiento Científico', 'Ética, Naturaleza y Sociedades', 'De lo Humano y lo Comunitario'].map(campo => (
              <label key={campo} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={camposFormativos.includes(campo)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCamposFormativos(prev => [...prev, campo]);
                    } else {
                      setCamposFormativos(prev => prev.filter(c => c !== campo));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{campo}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Metodología Sociocrítica</label>
          <select value={metodologia} onChange={e => setMetodologia(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors">
            <option>Aprendizaje Basado en Proyectos Comunitarios</option>
            <option>Aprendizaje Basado en Indagación (STEAM)</option>
            <option>Aprendizaje Basado en Problemas (ABP)</option>
            <option>Aprendizaje de Servicio (AS)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Escuela / Grupo</label>
          {savedSchools.length > 0 ? (
            <select value={schoolGroup} onChange={e => setSchoolGroup(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all">
              <option value="">No especificado</option>
              {savedSchools.map((s, idx) => {
                const text = `${s.school || ''} ${s.group ? `- ${s.group}` : ''}`.trim();
                return <option key={idx} value={text}>{text}</option>;
              })}
            </select>
          ) : (
            <input type="text" value={schoolGroup} onChange={e => setSchoolGroup(e.target.value)} placeholder="Ej. Esc. Patria - 1º A" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all" />
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Duración</label>
          <select value={duracion} onChange={e => setDuracion(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all">
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
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tema o Proyecto</label>
          <input type="text" required value={tema} onChange={e => setTema(e.target.value)} placeholder="Ej. El ciclo del agua en la comunidad" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notas, contexto e ideas del maestro</label>
          <textarea
            required
            rows={5}
            value={notasMaestro}
            onChange={e => setNotasMaestro(e.target.value)}
            placeholder="Escribe aquí de qué trata la clase, problemáticas de tu grupo, actividades que ya tienes pensadas, o cualquier idea suelta..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors resize-y placeholder:text-slate-400"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={hasTEA} 
              onChange={(e) => setHasTEA(e.target.checked)} 
              className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-slate-700">Incluir adaptaciones para alumnos con Trastorno del Espectro Autista (TEA)</span>
          </label>
        </div>
        
        <div className="sm:col-span-2 pt-2 flex flex-col gap-3 items-end">
          <button disabled={isLoading || !selectedDate || !tema || !notasMaestro} type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Estructurando...' : 'Generar Planeación Oficial'}
          </button>
        </div>
      </form>

      {saveMessage ? (
        <div className="rounded-3xl bg-emerald-100 border border-emerald-200 p-6 text-sm text-emerald-800 space-y-2">
          <p className="font-bold">¡Planeación Generada Exitosamente!</p>
          <p>{saveMessage}</p>
        </div>
      ) : null}

      {/* Loading State / Skeleton */}
      {isLoading && !object && (
        <div className="space-y-6">
          <h3 className="text-xl text-blue-600 font-semibold animate-pulse">Traduciendo tus notas a formato NEM...</h3>
          <div className="h-64 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse"></div>
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
      {object?.datosIdentificacion && (
        <section className="space-y-4 pt-4">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Datos de Identificación</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block text-xs uppercase">Docente</span><span className="font-semibold">{renderContent(object.datosIdentificacion.nombreDocente)}</span></div>
              <div><span className="text-slate-500 block text-xs uppercase">Grado y Grupo</span><span className="font-semibold">{renderContent(object.datosIdentificacion.gradoYGrupo)}</span></div>
              <div><span className="text-slate-500 block text-xs uppercase">Fase</span><span className="font-semibold">{renderContent(object.datosIdentificacion.fase)}</span></div>
              <div><span className="text-slate-500 block text-xs uppercase">Periodo de Aplicación</span><span className="font-semibold">{renderContent(object.datosIdentificacion.periodoAplicacion)}</span></div>
            </div>
          </div>
        </section>
      )}

      {object?.elementosCurriculares && (
        <section className="space-y-4">
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm">
            <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-200 pb-2">Elementos Curriculares</h3>
            <div className="space-y-3 text-sm">
              <p><strong className="text-blue-800">Campos Formativos:</strong> {renderContent(object.elementosCurriculares.camposFormativos)}</p>
              <p><strong className="text-blue-800">Metodología:</strong> {renderContent(object.elementosCurriculares.metodologia)}</p>

              <div className="mt-2 bg-white p-3 rounded-xl border border-blue-100">
                <strong className="text-blue-800 block mb-1">Problemática:</strong>
                <span className="text-slate-700">{renderContent(object.elementosCurriculares.problematica)}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {object?.fases && object.fases.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Fases Metodológicas y Actividades</h3>
          <div className="space-y-8">
            {object.fases.map((faseItem, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      {idx + 1}
                    </div>
                    {faseItem?.titulo || `Fase ${idx + 1}`}
                  </h4>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Actividades de Aprendizaje</h5>
                    {renderContent(faseItem?.actividades)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Recursos</h5>
                      {renderContent(faseItem?.recursosYMateriales)}
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Evaluación Formativa</h5>
                      {renderContent(faseItem?.evaluacionFormativa)}
                    </div>
                  </div>
                  {faseItem?.adecuacionesTEA && faseItem.adecuacionesTEA !== 'N/A' && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <h5 className="text-sm font-semibold text-amber-800 uppercase tracking-wider mb-2">Adecuaciones TEA</h5>
                      {renderContent(faseItem?.adecuacionesTEA)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
                title: tema || 'Planeación Completa',
                description: `Documento Maestro: ${fase} - ${metodologia}`,
                metadata: { 
                  object: {
                    ...object,
                    datosIdentificacion: {
                      ...(object.datosIdentificacion || {}),
                      nombreDocente: docenteName,
                      gradoYGrupo: schoolGroup || object.datosIdentificacion?.gradoYGrupo
                    }
                  }, 
                  selectedDate 
                },
                createdAt: new Date().toISOString()
              };
              downloadAgendaItem(masterItem);
            }} 
            className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            Descargar Planeación Oficial (.docx)
          </button>
        </div>
      )}
    </div>
  );
}
