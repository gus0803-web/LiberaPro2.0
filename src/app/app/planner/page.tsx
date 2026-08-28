'use client';

import React, { useEffect, useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { AgendaItem, addAgendaItem, loadSelectedPlanDate, downloadAgendaItem } from '@/lib/agenda';
import { Download, Sparkles, CheckCircle2, FileText, Calendar, BookOpen, Layers, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

const nemPlanningSchema = z.object({
  datosIdentificacion: z.object({
    nombreDocente: z.string(),
    escuela: z.string(),
    cct: z.string(),
    turno: z.string(),
    director: z.string(),
    gradoYGrupo: z.string(),
    fase: z.string(),
    periodoAplicacion: z.string(),
    mesPlan: z.string()
  }),
  justificacionYDiagnostico: z.string(),
  proyectoIntegrador: z.object({
    titulo: z.string(),
    metodologia: z.string(),
    proposito: z.string()
  }),
  estructuraCurricular: z.array(z.object({
    campoFormativo: z.string(),
    contenidoContextualizado: z.string(),
    pda: z.string(),
    ejesArticuladores: z.string()
  })),
  fasesMetodologia: z.array(z.object({
    fase: z.string(),
    momentos: z.array(z.object({
      nombreMomento: z.string(),
      actividadesIntegradas: z.string()
    })),
    materialesYRecursos: z.string()
  })),
  estrategiaEvaluacion: z.string(),
  anexosListasCotejo: z.array(z.object({
    tituloAnexo: z.string(),
    campoFormativo: z.string(),
    indicadores: z.array(z.object({
      pdaIndicador: z.string(),
      logrado: z.string(),
      enProceso: z.string(),
      observaciones: z.string()
    }))
  })),
  referenciasPedagogicas: z.string(),
  firmas: z.object({
    docente: z.string(),
    director: z.string()
  })
});

function isMexicanHoliday(d: Date) {
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();
  const dayOfWeek = d.getDay();

  if (month === 1 && day === 1) return true;
  if (month === 5 && day === 1) return true;
  if (month === 9 && day === 16) return true;
  if (month === 12 && day === 25) return true;
  if (month === 2 && dayOfWeek === 1 && day <= 7) return true;
  if (month === 3 && dayOfWeek === 1 && day >= 15 && day <= 21) return true;
  if (month === 11 && dayOfWeek === 1 && day >= 15 && day <= 21) return true;
  return false;
}

function getBusinessDays(startDateStr: string, count: number) {
  const dates = [];
  const [y, m, day] = startDateStr.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  
  while (dates.length < count) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isMexicanHoliday(d)) {
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
  const [docenteName, setDocenteName] = useState('Profesor de Grupo');
  const [savedSchools, setSavedSchools] = useState<any[]>([]);

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
  const [camposFormativos, setCamposFormativos] = useState<string[]>(['Lenguajes', 'Saberes y Pensamiento Científico']);
  const [ejesArticuladores, setEjesArticuladores] = useState<string[]>([]);
  const [metodologia, setMetodologia] = useState('Aprendizaje Basado en Proyectos Comunitarios');
  const [tema, setTema] = useState('');
  const [notasMaestro, setNotasMaestro] = useState('');
  
  const [duracion, setDuracion] = useState('Quincenal');
  const [hasTEA, setHasTEA] = useState(false);
  const [schoolGroupIndex, setSchoolGroupIndex] = useState<number>(0);

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

  const selectedSchoolInfo = savedSchools[schoolGroupIndex] || {
    school: 'Escuela Primaria Justo Sierra',
    group: '2º Grado "A"',
    cct: '02DPRXXXXX',
    turno: 'Matutino',
    director: 'Directora de la Escuela'
  };

  const [isAnchoring, setIsAnchoring] = useState(false);

  const handleAnchorToCalendar = async () => {
    if (!object || !selectedDate) return;
    setIsAnchoring(true);
    let expectedSessions = 5;
    if (duracion === 'Quincenal') expectedSessions = 10;
    if (duracion === 'Mensual') expectedSessions = 20;
    
    const datesToCover = getBusinessDays(selectedDate, expectedSessions);
    const manualEndInput = document.getElementById('manual-end-date') as HTMLInputElement;
    const finalEndDate = manualEndInput?.value || getEndDateStr(selectedDate, expectedSessions);
    
    const fullPlanObject = {
      datosIdentificacion: {
        ...object?.datosIdentificacion,
        nombreDocente: docenteName || selectedSchoolInfo.school || 'N/A',
        periodoAplicacion: `Del ${selectedDate} al ${finalEndDate}`
      },
      justificacionYDiagnostico: object?.justificacionYDiagnostico,
      proyectoIntegrador: object?.proyectoIntegrador,
      estructuraCurricular: object?.estructuraCurricular,
      fasesMetodologia: object?.fasesMetodologia,
      estrategiaEvaluacion: object?.estrategiaEvaluacion,
      anexosListasCotejo: object?.anexosListasCotejo,
      referenciasPedagogicas: object?.referenciasPedagogicas,
      firmas: object?.firmas
    };

    const promises = datesToCover.map((dateStr, index) => {
      const newPlan: AgendaItem = {
        id: `${Date.now()}-${dateStr}-${index}`,
        date: dateStr,
        type: 'planeacion',
        title: tema || 'Planeación Oficial NEM',
        description: `Proyecto: ${tema} (${fase} - ${metodologia})`,
        metadata: {
          fase,
          tema,
          metodologia,
          schoolGroup: selectedSchoolInfo.group || '2º A',
          duracion,
          hasTEA,
          object: fullPlanObject,
        },
        createdAt: new Date().toISOString(),
      };
      return addAgendaItem(newPlan);
    });

    setSaveMessage('Guardando planeación oficial en el calendario...');
    const results = await Promise.all(promises);
    if (results.every(r => r)) {
      setSaveMessage('Planeación distribuida y guardada en el calendario.');
    } else {
      setSaveMessage('Error parcial al guardar en la nube.');
    }
    setHasSavedPlan(true);
    router.refresh();
    setIsAnchoring(false);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setDebugError('');
    if (!selectedDate) {
      setSaveMessage('Selecciona la fecha de inicio para la planeación.');
      return;
    }
    setHasSavedPlan(false);
    
    let expectedSessions = 5;
    if (duracion === 'Quincenal') expectedSessions = 10;
    if (duracion === 'Mensual') expectedSessions = 20;
    const fechaTermino = getEndDateStr(selectedDate, expectedSessions);

    const notasCompletas = `Campos Formativos Seleccionados: ${camposFormativos.join(', ')}\nEjes Articuladores Seleccionados: ${ejesArticuladores.join(', ')}\n\nNotas e indicaciones del docente:\n${notasMaestro}`;
    
    submit({ 
      fase, 
      tema, 
      notasMaestro: notasCompletas,
      ejesArticuladores, 
      metodologia, 
      duracion, 
      hasTEA, 
      schoolGroup: `${selectedSchoolInfo.school || 'Escuela'} - ${selectedSchoolInfo.group || 'Grupo'}`,
      fechaInicio: selectedDate,
      fechaTermino,
      profileData: {
        teacherName: docenteName,
        schoolName: selectedSchoolInfo.school,
        cct: selectedSchoolInfo.cct,
        turno: selectedSchoolInfo.turno,
        directorName: selectedSchoolInfo.director
      }
    });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
          Estructurador <span className="font-bold text-blue-600">Académico NEM</span>
        </h2>
        <p className="text-sm text-slate-500 font-light max-w-2xl">
          Genera planeaciones didácticas completas y rigurosas alineadas a la Nueva Escuela Mexicana con el formato oficial de 6 secciones.
        </p>
      </section>

      <form onSubmit={handleGenerate} className="bg-white/60 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-white/60 shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Escuela / Grupo (Perfil Docente)</label>
          {savedSchools.length > 0 ? (
            <select 
              value={schoolGroupIndex} 
              onChange={e => setSchoolGroupIndex(Number(e.target.value))} 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
            >
              {savedSchools.map((s, idx) => (
                <option key={idx} value={idx}>
                  {s.school ? `${s.school} (${s.group || 'Sin grupo'})` : `Escuela ${idx + 1}`}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              Puedes configurar tus escuelas y CCT en la pestaña <strong>Settings</strong>. Se usarán datos predeterminados.
            </div>
          )}
        </div>

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

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Campos Formativos Involucrados</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border border-slate-200 rounded-xl p-3">
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
                <span className="text-xs sm:text-sm text-slate-700 group-hover:text-slate-900 font-medium">{campo}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ejes Articuladores</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-white border border-slate-200 rounded-xl p-3">
            {['Inclusión', 'Pensamiento Crítico', 'Interculturalidad Crítica', 'Igualdad de Género', 'Vida Saludable', 'Apropiación de las culturas a través de la lectura y la escritura', 'Artes y experiencias estéticas'].map(eje => (
              <label key={eje} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={ejesArticuladores.includes(eje)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEjesArticuladores(prev => [...prev, eje]);
                    } else {
                      setEjesArticuladores(prev => prev.filter(c => c !== eje));
                    }
                  }}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs sm:text-sm text-slate-700 group-hover:text-slate-900 font-medium leading-tight">{eje}</span>
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
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Duración del Proyecto</label>
          <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={duracion} onChange={(e) => setDuracion(e.target.value)}>
            <option value="Quincenal">Quincenal (10 Días Hábiles) - 20 Créditos</option>
            <option value="Mensual">Mensual (20 Días Hábiles) - 35 Créditos</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha de Inicio</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tema o Título del Proyecto</label>
          <input 
            type="text" 
            required 
            value={tema} 
            onChange={e => setTema(e.target.value)} 
            placeholder="Ej. Nuestra historia en el aula: organizando el regreso a clases" 
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" 
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notas, Diagnóstico y Requerimientos del Maestro</label>
          <textarea
            required
            rows={4}
            value={notasMaestro}
            onChange={e => setNotasMaestro(e.target.value)}
            placeholder="Describe la problemática, saberes previos, enfoque socioemocional o actividades particulares que deseas incluir..."
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
            <span className="text-sm font-semibold text-slate-700">Incluir adecuaciones específicas para alumnos con Trastorno del Espectro Autista (TEA)</span>
          </label>
        </div>
        
        <div className="sm:col-span-2 pt-2 flex justify-end">
          <button 
            disabled={isLoading || !selectedDate || !tema || !notasMaestro} 
            type="submit" 
            className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {isLoading ? 'Generando Planeación Didáctica...' : 'Generar Planeación Oficial (6 Secciones)'}
          </button>
        </div>
      </form>

      {saveMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-sm text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">¡Planeación Didáctica Generada Exitosamente!</p>
            <p>{saveMessage}</p>
          </div>
        </div>
      )}

      {isLoading && !object && (
        <div className="space-y-6">
          <h3 className="text-xl text-blue-600 font-semibold animate-pulse">Estructurando planeación en 6 fases pedagógicas...</h3>
          <div className="h-64 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse"></div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-700">
          <strong>Error:</strong> {typeof error === 'string' ? error : error?.message || 'No se pudo generar la planeación. Por favor intenta de nuevo.'}
        </div>
      )}

      {/* Render 6 Official Sections */}
      {object && (
        <div className="space-y-8 pt-4">

          {/* Sección 1: Encabezado & Datos de Identificación */}
          {object.datosIdentificacion && (
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white p-6">
                <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Secretaría de Educación Pública</div>
                <h3 className="text-2xl font-bold mt-1">{object.datosIdentificacion.escuela || selectedSchoolInfo.school || 'Escuela Primaria'}</h3>
                <p className="text-slate-300 text-sm mt-1">Planeación Didáctica - {object.datosIdentificacion.mesPlan || 'Agosto 2026'}</p>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-slate-50">
                <div><span className="text-slate-500 block text-xs uppercase font-semibold">Docente</span><span className="font-semibold">{object.datosIdentificacion.nombreDocente}</span></div>
                <div><span className="text-slate-500 block text-xs uppercase font-semibold">Grado y Grupo</span><span className="font-semibold">{object.datosIdentificacion.gradoYGrupo}</span></div>
                <div><span className="text-slate-500 block text-xs uppercase font-semibold">CCT</span><span className="font-semibold">{object.datosIdentificacion.cct}</span></div>
                <div><span className="text-slate-500 block text-xs uppercase font-semibold">Turno</span><span className="font-semibold">{object.datosIdentificacion.turno}</span></div>
                <div><span className="text-slate-500 block text-xs uppercase font-semibold">Fase</span><span className="font-semibold">{object.datosIdentificacion.fase}</span></div>
                <div><span className="text-slate-500 block text-xs uppercase font-semibold">Director(a)</span><span className="font-semibold">{object.datosIdentificacion.director}</span></div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block text-xs uppercase font-semibold">Periodo</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold">Del {selectedDate} al</span>
                    <input 
                      type="date" 
                      title="Fecha de Término Real"
                      className="text-sm font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        // We will update the DOM visually, but to be robust, we need to ensure this gets picked up by the download/anchor handlers.
                        // We can add an id to read it, or use a state. Let's use a standard input with id.
                      }}
                      id="manual-end-date"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Sección 1: Justificación Pedagógica y Diagnóstico Inicial */}
          {object.justificacionYDiagnostico && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h4 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                1. Justificación Pedagógica y Diagnóstico Inicial
              </h4>
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                {object.justificacionYDiagnostico}
              </p>
            </section>
          )}

          {/* Sección 2: Proyecto Integrador */}
          {object.proyectoIntegrador && (
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6 shadow-sm space-y-3">
              <h4 className="text-lg font-bold text-blue-950 flex items-center gap-2 border-b border-blue-200 pb-2">
                <Layers className="w-5 h-5 text-blue-700" />
                2. Proyecto Integrador de Aprendizaje
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><strong className="text-blue-900">Título del Proyecto:</strong> <p className="text-slate-800 font-semibold">{object.proyectoIntegrador.titulo}</p></div>
                <div><strong className="text-blue-900">Metodología Principal:</strong> <p className="text-slate-800 font-semibold">{object.proyectoIntegrador.metodologia}</p></div>
                <div className="sm:col-span-2"><strong className="text-blue-900">Propósito del Proyecto:</strong> <p className="text-slate-800 mt-0.5">{object.proyectoIntegrador.proposito}</p></div>
              </div>
            </section>
          )}

          {/* Sección 3: Estructura Curricular por Campos Formativos */}
          {object.estructuraCurricular && object.estructuraCurricular.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h4 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                3. Estructura Curricular: Campos Formativos, Contenidos y PDA
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-slate-200">
                  <thead className="bg-slate-800 text-white text-xs uppercase">
                    <tr>
                      <th className="p-3 border border-slate-700">Campo Formativo</th>
                      <th className="p-3 border border-slate-700">Contenido Contextualizado</th>
                      <th className="p-3 border border-slate-700">Proceso de Desarrollo de Aprendizaje (PDA)</th>
                      <th className="p-3 border border-slate-700">Ejes Articuladores</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {object.estructuraCurricular.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 border border-slate-200 font-bold text-slate-900">{item?.campoFormativo}</td>
                        <td className="p-3 border border-slate-200 text-slate-700">{item?.contenidoContextualizado}</td>
                        <td className="p-3 border border-slate-200 text-slate-700">{item?.pda}</td>
                        <td className="p-3 border border-slate-200 text-slate-600">{item?.ejesArticuladores}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Sección 4: Secuencias Didácticas Detalladas */}
          {object.fasesMetodologia && object.fasesMetodologia.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h4 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                4. Desarrollo del Proyecto por Fases Metodológicas
              </h4>
              <div className="space-y-4">
                {object.fasesMetodologia.map((faseItemRaw, idx) => {
                  const faseItem = faseItemRaw as any;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-1">
                        <span className="font-bold text-blue-700 text-sm">{faseItem?.fase || faseItem?.pasoMetodologia}</span>
                      </div>
                      <div className="space-y-2 text-sm pt-1">
                        {faseItem?.momentos && Array.isArray(faseItem.momentos) ? (
                          faseItem.momentos.map((momento: any, mIdx: number) => (
                            <div key={mIdx}>
                              <strong className="text-blue-800 block mb-0.5">• {momento.nombreMomento}</strong>
                              <p className="text-slate-700 leading-snug">{momento.actividadesIntegradas}</p>
                            </div>
                          ))
                        ) : null}
                        <div className="bg-slate-50 p-2 rounded-md mt-2">
                          <p className="text-slate-700 text-xs"><strong>Materiales y Recursos:</strong> {faseItem?.materialesYRecursos}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sección 5: Evaluación Formativa */}
          {object.estrategiaEvaluacion && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h4 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                5. Estrategia de Evaluación Diagnóstica y Formativa
              </h4>
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                {object.estrategiaEvaluacion}
              </p>
            </section>
          )}

          {/* Sección 6: Anexos - Listas de Cotejo */}
          {object.anexosListasCotejo && object.anexosListasCotejo.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h4 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                6. Anexos: Listas de Cotejo para la Evaluación Formativa
              </h4>
              {object.anexosListasCotejo.map((anexo, idx) => (
                <div key={idx} className="space-y-3">
                  <h5 className="font-bold text-slate-800 text-sm">{anexo?.tituloAnexo} ({anexo?.campoFormativo})</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse border border-slate-200">
                      <thead className="bg-slate-100 text-slate-800">
                        <tr>
                          <th className="p-2.5 border border-slate-200">Indicador de Aprendizaje (PDA Relacionado)</th>
                          <th className="p-2.5 border border-slate-200 text-center w-24">Logrado (SÍ)</th>
                          <th className="p-2.5 border border-slate-200 text-center w-24">En Proceso (NO)</th>
                          <th className="p-2.5 border border-slate-200">Observaciones / Evidencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {anexo?.indicadores?.map((ind, indIdx) => (
                          <tr key={indIdx}>
                            <td className="p-2.5 border border-slate-200 text-slate-800 font-medium">{ind?.pdaIndicador}</td>
                            <td className="p-2.5 border border-slate-200 text-center font-bold text-emerald-600">{ind?.logrado || 'SÍ'}</td>
                            <td className="p-2.5 border border-slate-200 text-center text-slate-400">{ind?.enProceso || 'NO'}</td>
                            <td className="p-2.5 border border-slate-200 text-slate-500">{ind?.observaciones || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Sección 7: Referencias Pedagógicas */}
          {object.referenciasPedagogicas && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 mt-6">
              <h4 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                7. Referencias Pedagógicas (SEP)
              </h4>
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                {object.referenciasPedagogicas}
              </p>
            </section>
          )}

          {/* Warning Message */}
          {!hasSavedPlan && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-medium mt-8">
              ⚠️ Atención: Si abandonas esta página sin descargar la planeación o anclarla al calendario, tu información se perderá y tendrás que gastar créditos para generar una nueva.
            </div>
          )}

          {/* Botones Descargar y Anclar */}
          <div className="pt-4 flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={handleAnchorToCalendar}
              disabled={isAnchoring || hasSavedPlan}
              className="bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-lg text-base disabled:opacity-50"
            >
              <Calendar className="w-5 h-5" />
              {isAnchoring ? 'Anclando...' : hasSavedPlan ? 'Anclado al Calendario' : 'Anclar al Calendario'}
            </button>
            <button 
              type="button"
              onClick={() => {
                let expectedSessions = 5;
                if (duracion === 'Quincenal') expectedSessions = 10;
                if (duracion === 'Mensual') expectedSessions = 20;
                const manualEndInput = document.getElementById('manual-end-date') as HTMLInputElement;
                const finalEndDate = manualEndInput?.value || getEndDateStr(selectedDate, expectedSessions);

                const masterItem: AgendaItem = {
                  id: `master-download-${Date.now()}`,
                  date: selectedDate || new Date().toISOString().slice(0, 10),
                  type: 'planeacion',
                  title: tema || 'Planeación Oficial NEM',
                  description: `Proyecto Integrador: ${tema}`,
                  metadata: { 
                    object: {
                      ...object,
                      datosIdentificacion: {
                        ...(object.datosIdentificacion || {}),
                        nombreDocente: docenteName,
                        escuela: selectedSchoolInfo.school,
                        cct: selectedSchoolInfo.cct,
                        turno: selectedSchoolInfo.turno,
                        director: selectedSchoolInfo.director,
                        gradoYGrupo: selectedSchoolInfo.group,
                        periodoAplicacion: `Del ${selectedDate} al ${finalEndDate}`
                      }
                    }, 
                    selectedDate 
                  },
                  createdAt: new Date().toISOString()
                };
                downloadAgendaItem(masterItem);
                setHasSavedPlan(true); // Treat download as a save to dismiss warning
              }} 
              className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg text-base"
            >
              <Download className="w-5 h-5" />
              Descargar Planeación Oficial (.docx)
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
