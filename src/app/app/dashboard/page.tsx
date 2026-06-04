'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Bell, CheckCircle2, Circle, Download, Eye, FileText, MoreHorizontal, Printer, Trash2, Calendar, Loader2 } from 'lucide-react';
import {
  AgendaItem,
  AgendaItemType,
  addAgendaItem,
  deleteAgendaItem,
  downloadAgendaItem,
  getAgendaItemColor,
  loadAgendaItems,
  loadSelectedPlanDate,
  printAgendaItem,
  saveSelectedPlanDate,
  typeLabel,
} from '@/lib/agenda';

function getUserDisplayName(user: any) {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return metadata.full_name || metadata.name || user.email || null;
}

export default function DashboardPage() {
  const { fontColor, language } = useTheme();
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [selectedPlaneacionId, setSelectedPlaneacionId] = useState<string>('');
  const [materialMessage, setMaterialMessage] = useState('');
  const [newlyCreatedMaterialId, setNewlyCreatedMaterialId] = useState<string | null>(null);
  const [isGeneratingMaterial, setIsGeneratingMaterial] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [currentDateString, setCurrentDateString] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const isEs = language === 'es';
  const pinnedPlanDates = [
    { date: '2026-05-21', label: isEs ? 'Lunes 21 Mayo' : 'Mon, May 21' },
    { date: '2026-05-22', label: isEs ? 'Martes 22 Mayo' : 'Tue, May 22' },
    { date: '2026-05-23', label: isEs ? 'Miércoles 23 Mayo' : 'Wed, May 23' },
  ];
  const planChecklist = [
    isEs ? 'Revisar Tarea' : 'Review Homework',
    isEs ? 'Intro: Europa Medieval' : 'Intro: Medieval Europe',
    isEs ? 'Actividad: La Vida Feudal' : 'Group Activity: Manor Life',
    isEs ? 'Discusión de Conceptos' : 'Key Terms Discussion',
    isEs ? 'Quiz: Mapa' : 'Assessment: Map Quiz',
  ];

  useEffect(() => {
    async function fetchAgenda() {
      const loadedAgenda = await loadAgendaItems();
      setAgendaItems(loadedAgenda);

      const storedDate = loadSelectedPlanDate();
      const defaultDate = storedDate || loadedAgenda[0]?.date || pinnedPlanDates[0].date;
      setSelectedDate(defaultDate);
      setIsMounted(true);
    }
    fetchAgenda();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    saveSelectedPlanDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setCurrentDateString(
      new Date().toLocaleDateString(isEs ? 'es-ES' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    );
  }, [isEs]);


  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) return;

        let name = getUserDisplayName(user);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (!profileError && profile?.full_name) {
          name = profile.full_name;
        }

        if (name) {
          setUserName(name);
        }
      } catch (err) {
        console.error('Unable to load user name', err);
      }
    };

    loadUser();

    // PWA Service Worker Registration & Install Prompt
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('Service Worker registration failed', err));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt' as any, handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt' as any, handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  const greeting = isEs
    ? `¡Buenos días, ${userName ?? 'Profesor(a)'}!`
    : `Good morning, ${userName ?? 'Teacher'}!`;

  const t = {
    newPlan: isEs ? 'Nueva Planeación' : 'New Plan',
    viewAgenda: isEs ? 'Ver Agenda' : 'View Agenda',
    date: currentDateString,
    month: isEs ? 'Octubre' : 'October',
    reminders: isEs ? 'Recordatorios' : 'Reminders',
    gradeExams: isEs ? 'Calificar Exámenes 7B' : 'Grade Exams 7B',
    by3pm: isEs ? 'para las 3 PM' : 'by 3 PM',
    parentMeeting: isEs ? 'Junta de Padres' : 'Parent Meeting',
    submitAttendance: isEs ? 'Subir Asistencia' : 'Submit Attendance',
    now: isEs ? 'Ahora' : 'Now',
    prep: isEs ? 'Preparación' : 'Prep',
    homeroom: isEs ? 'Asesoría' : 'Homeroom',
    historyTitle: isEs ? 'Historia 7B' : 'History 7B',
    historyTopic: isEs ? 'Tema: Europa Medieval' : 'Topic: Medieval Europe',
    recess: isEs ? 'Recreo' : 'Recess/Prep',
    englishTitle: isEs ? 'Inglés 8A' : 'English 8A',
    englishTopic: isEs ? 'Tema: Escritura Creativa' : 'Theme: Creative Writing',
    staffMeeting: isEs ? 'Junta de Consejo' : 'Staff Meeting',
    lessonPlanChecklist: isEs ? 'Lista de Planeación' : 'Lesson Plan Checklist',
    todaysPlan: isEs ? 'Planeación de Hoy:' : "Today's Lesson Plan:",
    reviewHomework: isEs ? 'Revisar Tarea' : 'Review Homework',
    introMedieval: isEs ? 'Intro: Europa Medieval' : 'Intro: Medieval Europe',
    groupActivity: isEs ? 'Actividad: La Vida Feudal' : 'Group Activity: Manor Life',
    keyTerms: isEs ? 'Discusión de Conceptos' : 'Key Terms Discussion',
    mapQuiz: isEs ? 'Quiz: Mapa' : 'Assessment: Map Quiz',
    crearMaterial: isEs ? 'Crear Material' : 'Create Material',
    selectSubject: isEs ? 'Selecciona Asignatura' : 'Select Subject',
    selectActivityType: isEs ? 'Tipo de Actividad' : 'Activity Type',
    selectMaterialType: isEs ? 'Tipo de Material' : 'Material Type',
    materialTitle: isEs ? 'Título del Material' : 'Material Title',
    generate: isEs ? 'Generar' : 'Generate',
  };

  const selectedDayItems = useMemo(
    () => agendaItems.filter((item) => item.date === selectedDate),
    [agendaItems, selectedDate]
  );

  const planeacionItems = useMemo(
    () => agendaItems.filter((item) => item.type === 'planeacion'),
    [agendaItems]
  );

  const recordatorioItems = useMemo(
    () => selectedDayItems.filter((item) => item.type === 'recordatorio'),
    [selectedDayItems]
  );

  const materialItems = useMemo(
    () => selectedDayItems.filter((item) => item.type === 'material'),
    [selectedDayItems]
  );

  const selectedPlaneacion = useMemo(() => {
    if (selectedPlaneacionId) {
      const found = planeacionItems.find(p => p.id === selectedPlaneacionId && p.date === selectedDate);
      if (found) return found;
    }
    return planeacionItems.find(p => p.date === selectedDate) ?? planeacionItems[0];
  }, [planeacionItems, selectedDate, selectedPlaneacionId]);

  const agendaDates = agendaItems.length > 0
    ? Array.from(new Set(agendaItems.map((item) => item.date))).sort()
    : pinnedPlanDates.map((plan) => plan.date);

  useEffect(() => {
    const saved = localStorage.getItem('liberapro_checklist_memory');
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleCheckTask = (taskName: string) => {
    const key = `${selectedDate}-${taskName}`;
    setCheckedItems((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('liberapro_checklist_memory', JSON.stringify(next));
      return next;
    });
  };

  const planTasks = useMemo(() => {
    let tasksFromPlan: any[] = [];
    if (selectedPlaneacion?.metadata?.object?.diaADia) {
      const dias = Array.isArray(selectedPlaneacion.metadata.object.diaADia) 
        ? selectedPlaneacion.metadata.object.diaADia 
        : [selectedPlaneacion.metadata.object.diaADia];
      
      tasksFromPlan = dias.flatMap((day: any) => {
        const parts = [day.inicio, day.cierre];
        if (day.desarrollo) {
          if (typeof day.desarrollo === 'object') {
            parts.push(day.desarrollo.visual, day.desarrollo.auditiva, day.desarrollo.kinestesica);
          } else {
            parts.push(day.desarrollo);
          }
        }
        return parts;
      });
    }
    const tasks = tasksFromPlan.filter(item => Boolean(item) && typeof item === 'string') as string[];
    return tasks.length > 0 ? (Array.from(new Set(tasks)) as string[]) : planChecklist;
  }, [selectedPlaneacion, planChecklist]);

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPlan = selectedPlaneacionId 
      ? planeacionItems.find((item) => item.id === selectedPlaneacionId) 
      : selectedPlaneacion;

    if (!selectedPlan) {
      setMaterialMessage(isEs ? 'No hay una planeación válida seleccionada.' : 'No valid plan selected.');
      return;
    }

    setIsGeneratingMaterial(true);
    setMaterialMessage(isEs ? 'Generando material con Inteligencia Artificial...' : 'Generating material with AI...');

    try {
      const response = await fetch('/api/material/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTitle: selectedPlan.title,
          planDescription: selectedPlan.description,
          planData: selectedPlan.metadata?.object || {}
        })
      });

      if (!response.ok) throw new Error('Error en IA');
      const data = await response.json();

      const newMaterial: AgendaItem = {
        id: `${Date.now()}-${selectedDate}-material`,
        date: selectedDate,
        type: 'material',
        title: `LiberaPro-${selectedDate}-Leccion`,
        description: `Material de apoyo para la planeación: ${selectedPlan.title}`,
        metadata: { linkedPlanId: selectedPlan.id, materialContent: data.content },
        createdAt: new Date().toISOString(),
      };

      const success = await addAgendaItem(newMaterial);
      if (success) {
        setAgendaItems(prev => [...prev, newMaterial]);
        setNewlyCreatedMaterialId(newMaterial.id);
        setPreviewId(newMaterial.id); // Auto-open preview!
        setMaterialMessage(isEs ? '¡Material generado y guardado en calendario!' : 'Material generated and saved!');
      } else {
        setMaterialMessage(isEs ? 'Error al guardar el material en la nube.' : 'Error saving material to cloud.');
      }
    } catch (error) {
      setMaterialMessage(isEs ? 'Error al generar material.' : 'Error generating material.');
    } finally {
      setIsGeneratingMaterial(false);
      window.setTimeout(() => setMaterialMessage(''), 4000);
    }
  };

  const handlePreviewToggle = (id: string) => {
    setPreviewId(prev => prev === id ? null : id);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm(isEs ? '¿Seguro que deseas borrar este item?' : 'Are you sure you want to delete this item?')) {
      const success = await deleteAgendaItem(id);
      if (success) {
        setAgendaItems(prev => prev.filter(item => item.id !== id));
      }
    }
  };

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

  const taskList = planTasks;

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: fontColor }}>
            {greeting}
          </h1>
          <p className="text-sm font-semibold text-slate-500">{t.date}</p>
        </div>
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-4 h-4" />
            {isEs ? 'Instalar App' : 'Install App'}
          </button>
        )}
      </div>

      {/* Main Layout: Left | Center | Right (1:2:1) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-6 items-stretch flex-1">
        
        {/* LEFT COLUMN: Time Boxes */}
        <div className="lg:col-span-1 h-full">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 shrink-0">
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{isEs ? 'Resumen del Día' : 'Daily Summary'}</p>
                <h3 className="text-xl font-semibold text-slate-900">{selectedDate || t.date}</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {selectedDayItems.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayItems.map((item) => (
                    <article key={item.id} className={`rounded-3xl border p-5 shadow-sm ${getAgendaItemColor(item.type)}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] font-bold text-slate-500">{typeLabel(item.type, isEs)}</p>
                          <h4 className="mt-1 text-lg font-bold text-slate-900">{renderContent(item.title)}</h4>
                          <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{renderContent(item.description)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-slate-700 shrink-0">
                          <button type="button" onClick={() => handlePreviewToggle(item.id)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white transition-colors">
                            <Eye className="w-4 h-4" />
                            {isEs ? 'Vista' : 'Preview'}
                          </button>
                          <div className="flex items-center gap-2 mt-2">
                            <button type="button" onClick={() => downloadAgendaItem(item)} className="rounded-full border border-slate-200 bg-white/50 p-2 text-slate-700 hover:bg-white transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => printAgendaItem(item)} className="rounded-full border border-slate-200 bg-white/50 p-2 text-slate-700 hover:bg-white transition-colors">
                              <Printer className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDeleteItem(item.id)} className="rounded-full border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {previewId === item.id ? (
                        <div className="mt-5 rounded-3xl border border-white/40 bg-white/60 p-4 text-sm text-[var(--app-font-color)]">
                          <p className="font-bold text-slate-900 mb-2">{isEs ? 'Contenido' : 'Content'}</p>
                          {item.metadata?.object?.diaADia ? (
                            <div className="space-y-4">
                              {item.metadata.object.retoComunitario && (
                                <div className="mb-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                  <h4 className="font-bold text-blue-800 mb-2">Reto Comunitario General</h4>
                                  <div className="text-sm text-slate-700">{renderContent(item.metadata.object.retoComunitario)}</div>
                                </div>
                              )}
                              {(Array.isArray(item.metadata.object.diaADia) ? item.metadata.object.diaADia : [item.metadata.object.diaADia]).map((dia: any, i: number) => (
                                <div key={i} className="border-l-4 border-blue-500 pl-4 py-1">
                                  <h5 className="font-bold text-blue-700">{renderContent(dia.dia) || `Día ${i + 1}`}</h5>
                                  {dia.tiemposEstimados && <div className="mt-1 text-xs text-slate-500 font-medium">Tiempos Estimados: {renderContent(dia.tiemposEstimados)}</div>}
                                  {dia.inicio && <div className="mt-2 text-xs"><strong>Inicio:</strong> {renderContent(dia.inicio)}</div>}
                                  {dia.desarrollo && <div className="mt-2 text-xs"><strong>Desarrollo:</strong> {renderContent(dia.desarrollo)}</div>}
                                  {dia.cierre && <div className="mt-2 text-xs"><strong>Cierre:</strong> {renderContent(dia.cierre)}</div>}
                                  {(dia.materiales || dia.material_estandar) && <div className="mt-2 text-xs"><strong>Materiales:</strong> {renderContent(dia.materiales || dia.material_estandar)}</div>}
                                  {dia.conaliteg_cita && <div className="mt-2 text-xs"><strong>Libro:</strong> {renderContent(dia.conaliteg_cita)}</div>}
                                </div>
                              ))}
                              {item.metadata.object.anexoMateriales && (
                                <div className="mt-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                  <h4 className="font-bold text-emerald-800 mb-2">Anexo de Materiales y Actividades</h4>
                                  <div className="text-sm text-slate-700 whitespace-pre-wrap">{renderContent(item.metadata.object.anexoMateriales)}</div>
                                </div>
                              )}
                            </div>
                          ) : item.metadata?.materialContent ? (
                            <div className="prose prose-sm max-w-none text-slate-700 flex flex-col">
                              <div dangerouslySetInnerHTML={{ __html: item.metadata.materialContent }} />
                              <button onClick={() => downloadAgendaItem(item)} className="mt-6 bg-emerald-600 text-white rounded-xl px-5 py-3 font-bold w-fit flex items-center gap-2 hover:bg-emerald-700 transition-colors">
                                <Download className="w-5 h-5" />
                                {isEs ? 'Descargar PDF del Material' : 'Download Material PDF'}
                              </button>
                            </div>
                          ) : (
                            <pre className="whitespace-pre-wrap text-sm leading-6 overflow-x-auto">{renderContent(item.description)}</pre>
                          )}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 text-center h-full flex items-center justify-center">
                  {isEs
                    ? 'No hay actividades para este día. Añade items en el calendario.'
                    : 'No activities for this day. Add a new entry from the calendar.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Crear Material */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{t.crearMaterial}</p>
                  <h2 className="text-xl font-bold text-slate-900">{isEs ? 'Materiales anclados' : 'Pinned Materials'}</h2>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{isEs ? 'Día seleccionado' : 'Selected day'}</label>
                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  {agendaDates.map((date) => {
                    const dateObj = new Date(`${date}T00:00:00`);
                    return (
                      <option key={date} value={date}>
                        {isMounted ? dateObj.toLocaleDateString(isEs ? 'es-ES' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : date}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{isEs ? 'Planeación vinculada' : 'Linked plan'}</label>
                <select value={selectedPlaneacion?.id || ''} onChange={(e) => setSelectedPlaneacionId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  {planeacionItems.length > 0 ? (
                    planeacionItems.filter(p => p.date === selectedDate).length > 0 
                      ? planeacionItems.filter(p => p.date === selectedDate).map((plan) => (
                          <option key={plan.id} value={plan.id}>{plan.title}</option>
                        ))
                      : <option value="">No hay planeaciones vinculadas a este día</option>
                  ) : (
                    <option value="">{isEs ? 'No hay planeaciones ancladas para este día' : 'No pinned plans for this day'}</option>
                  )}
                </select>
              </div>

              {/* Inputs eliminados por solicitud del usuario. Solo se usa fecha y planeación. */}

              <button
                onClick={handleCreateMaterial}
                disabled={isGeneratingMaterial}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingMaterial ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isEs ? 'Generando...' : 'Generating...'}
                  </>
                ) : (
                  isEs ? 'Generar material' : 'Generate material'
                )}
              </button>

              {materialMessage ? (
                <div className="rounded-3xl bg-emerald-100 border border-emerald-200 p-4 flex items-center justify-between gap-4">
                  <span className="text-sm text-emerald-800">{materialMessage}</span>
                  {newlyCreatedMaterialId && (
                    <button onClick={() => setPreviewId(newlyCreatedMaterialId)} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors font-bold text-xs whitespace-nowrap shadow-sm">
                      <Eye className="w-4 h-4" />
                      {isEs ? 'Ver Documento' : 'Preview Document'}
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {isEs
                ? 'Los materiales creados se guardan en tu calendario y pueden descargarse o imprimirse en tamaño carta.'
                : 'Created materials are stored in your calendar and can be downloaded or printed in letter size.'}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--app-font-color)] mb-4">{isEs ? 'Materiales del día' : 'Today’s materials'}</h3>
              {materialItems.length > 0 ? (
                <div className="space-y-4">
                  {materialItems.map((item) => (
                    <div key={item.id} className={`rounded-3xl border p-4 ${getAgendaItemColor(item.type)}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-base font-semibold text-slate-900">{renderContent(item.title)}</h4>
                          <div className="text-sm text-slate-700 mt-1">{renderContent(item.description)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => downloadAgendaItem(item)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100">
                            <Download className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => printAgendaItem(item)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100">
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">{isEs ? 'Aún no has creado materiales para este día.' : 'No materials created for this day yet.'}</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recordatorios + Lista Planeación */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--app-font-color)] text-lg flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    <span>{t.reminders}</span>
                  </h3>
                </div>
                {recordatorioItems.length > 0 ? (
                  <div className="space-y-4">
                    {recordatorioItems.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-amber-100 bg-amber-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">{typeLabel(item.type, isEs)}</p>
                            <h4 className="mt-2 text-base font-semibold text-slate-900">{renderContent(item.title)}</h4>
                            <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{renderContent(item.description)}</div>
                          </div>
                          <button type="button" onClick={() => handleDeleteItem(item.id)} className="rounded-full border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                    {isEs
                      ? 'No hay recordatorios para este día. Usa el calendario para agregarlos.'
                      : 'No reminders for this day. Use the calendar to add them.'}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[var(--app-font-color)] text-lg flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>{t.lessonPlanChecklist}</span>
                  </h3>
                  <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.todaysPlan}</p>
                  <p className="text-lg font-bold text-slate-900">{renderContent(selectedPlaneacion?.title) || (isEs ? 'Planeación del día' : "Today's Pinned Plan")}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedDate ? `${isEs ? 'Fecha seleccionada:' : 'Selected date:'} ${selectedDate}` : ''}</p>
                </div>
                <div className="space-y-3">
                  {taskList.map((item) => (
                    <label key={item} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!checkedItems[`${selectedDate}-${item}`]}
                          onChange={() => handleCheckTask(item)}
                          className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                        />
                        <span className={`text-sm font-medium transition-colors ${checkedItems[`${selectedDate}-${item}`] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {item}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{checkedItems[`${selectedDate}-${item}`] ? (isEs ? 'Completado' : 'Done') : (isEs ? 'Pendiente' : 'Pending')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
