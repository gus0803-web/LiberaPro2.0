'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Bell, CheckCircle2, Circle, Download, Eye, FileText, MoreHorizontal, Printer, Trash2, Calendar } from 'lucide-react';
import {
  AgendaItem,
  AgendaItemType,
  addAgendaItem,
  downloadAgendaItem,
  getAgendaItemColor,
  loadAgendaItems,
  loadSelectedPlanDate,
  printAgendaItem,
  saveAgendaItems,
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
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialMessage, setMaterialMessage] = useState('');

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
    const loadedAgenda = loadAgendaItems();
    setAgendaItems(loadedAgenda);

    const storedDate = loadSelectedPlanDate();
    const defaultDate = storedDate || loadedAgenda[0]?.date || pinnedPlanDates[0].date;
    setSelectedDate(defaultDate);

    const storedChecks = localStorage.getItem(`checklist-${defaultDate}`);
    if (storedChecks) {
      setCheckedItems(JSON.parse(storedChecks));
    }
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    saveSelectedPlanDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;
    localStorage.setItem(`checklist-${selectedDate}`, JSON.stringify(checkedItems));
  }, [selectedDate, checkedItems]);

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
  }, []);

  const greeting = isEs
    ? `¡Buenos días, ${userName ?? 'Profesor(a)'}!`
    : `Good morning, ${userName ?? 'Teacher'}!`;

  const t = {
    newPlan: isEs ? 'Nueva Planeación' : 'New Plan',
    viewAgenda: isEs ? 'Ver Agenda' : 'View Agenda',
    date: isEs ? 'Jueves, 26 de Octubre, 2023' : 'Thursday, October 26, 2023',
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

  const selectedPlaneacion = planeacionItems[0];

  const agendaDates = agendaItems.length > 0
    ? Array.from(new Set(agendaItems.map((item) => item.date))).sort()
    : pinnedPlanDates.map((plan) => plan.date);

  useEffect(() => {
    if (selectedPlaneacion?.id) {
      setSelectedPlaneacionId(selectedPlaneacion.id);
    }
  }, [selectedPlaneacion]);

  const planTasks = useMemo(() => {
    const tasksFromPlan = selectedPlaneacion?.metadata?.object?.diaADia
      ? (selectedPlaneacion.metadata.object.diaADia as any[]).flatMap((day: any) => [day.inicio, day.desarrollo, day.cierre])
      : [];
    const tasks = tasksFromPlan.filter(Boolean) as string[];
    return tasks.length > 0 ? (Array.from(new Set(tasks)) as string[]) : planChecklist;
  }, [selectedPlaneacion, planChecklist]);

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlaneacionId) {
      setMaterialMessage(isEs ? 'Selecciona una planeación anclada para crear material.' : 'Choose a pinned plan to create material.');
      return;
    }

    if (!materialTitle.trim()) {
      setMaterialMessage(isEs ? 'Agrega un título para el material.' : 'Add a title for the material.');
      return;
    }

    const selectedPlan = planeacionItems.find((item) => item.id === selectedPlaneacionId) ?? planeacionItems[0];
    if (!selectedPlan) {
      setMaterialMessage(isEs ? 'No hay una planeación válida seleccionada.' : 'No valid plan selected.');
      return;
    }

    const newMaterial: AgendaItem = {
      id: `${Date.now()}-${selectedDate}-material`,
      date: selectedDate,
      type: 'material',
      title: materialTitle,
      description: materialDescription || `${isEs ? 'Material para' : 'Material for'} ${selectedPlan.title}`,
      metadata: { linkedPlanId: selectedPlan.id },
      createdAt: new Date().toISOString(),
    };

    const updated = addAgendaItem(newMaterial);
    setAgendaItems(updated);
    setMaterialMessage(isEs ? 'Material guardado en calendario.' : 'Material saved to calendar.');
    setMaterialTitle('');
    setMaterialDescription('');
    window.setTimeout(() => setMaterialMessage(''), 4000);
  };

  const handlePreviewToggle = (id: string) => {
    setSelectedPlaneacionId(id);
  };

  const handleDeleteItem = (id: string) => {
    const updated = loadAgendaItems().filter((item) => item.id !== id);
    saveAgendaItems(updated);
    setAgendaItems(updated);
  };

  const taskList = planTasks;

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Greeting */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: fontColor }}>
          {greeting}
        </h1>
        <p className="text-sm font-semibold text-slate-500">{t.date}</p>
      </div>

      {/* Main Layout: Left | Center | Right (1:2:1) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-6 items-stretch flex-1">
        
        {/* LEFT COLUMN: Time Boxes */}
        <div className="lg:col-span-1 h-full">
          <div className="space-y-3 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">{isEs ? 'Horario' : 'Schedule'}</h3>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">{selectedDate}</span>
            </div>
            {selectedDayItems.length > 0 ? (
              <div className="space-y-4">
                {selectedDayItems.map((item) => (
                  <div key={item.id} className={`rounded-3xl border p-4 shadow-sm ${getAgendaItemColor(item.type)}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{typeLabel(item.type, isEs)}</p>
                        <h4 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h4>
                        <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{item.description}</p>
                      </div>
                      <span className="text-xs text-slate-600">{new Date(item.createdAt).toLocaleTimeString(isEs ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                {isEs
                  ? 'No hay actividades ancladas para este día. Añade items en el calendario.'
                  : 'No pinned activities for this day. Add items in the calendar.'}
              </div>
            )}
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
                        {dateObj.toLocaleDateString(isEs ? 'es-ES' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{isEs ? 'Planeación vinculada' : 'Linked plan'}</label>
                <select value={selectedPlaneacionId} onChange={(e) => setSelectedPlaneacionId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  {planeacionItems.length > 0 ? (
                    planeacionItems.map((plan) => (
                      <option key={plan.id} value={plan.id}>{plan.title}</option>
                    ))
                  ) : (
                    <option value="">{isEs ? 'No hay planeaciones ancladas para este día' : 'No pinned plans for this day'}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.materialTitle}</label>
                <input
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  type="text"
                  placeholder={isEs ? 'Ej. Guía de lectura' : 'E.g. Reading guide'}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.selectMaterialType}</label>
                <textarea
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                  rows={4}
                  placeholder={isEs ? 'Describe el material que necesitas' : 'Describe the material you need'}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <button
                onClick={handleCreateMaterial}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                {isEs ? 'Guardar material' : 'Save material'}
              </button>

              {materialMessage ? (
                <div className="rounded-3xl bg-emerald-100 border border-emerald-200 p-4 text-sm text-emerald-800">
                  {materialMessage}
                </div>
              ) : null}
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {isEs
                ? 'Los materiales creados se guardan en tu calendario y pueden descargarse o imprimirse en tamaño carta.'
                : 'Created materials are stored in your calendar and can be downloaded or printed in letter size.'}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">{isEs ? 'Materiales del día' : 'Today’s materials'}</h3>
              {materialItems.length > 0 ? (
                <div className="space-y-4">
                  {materialItems.map((item) => (
                    <div key={item.id} className={`rounded-3xl border p-4 ${getAgendaItemColor(item.type)}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-base font-semibold text-slate-900">{item.title}</h4>
                          <p className="text-sm text-slate-700 mt-1">{item.description}</p>
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
                  <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
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
                            <h4 className="mt-2 text-base font-semibold text-slate-900">{item.title}</h4>
                            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{item.description}</p>
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
                  <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>{t.lessonPlanChecklist}</span>
                  </h3>
                  <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.todaysPlan}</p>
                  <p className="text-lg font-bold text-slate-900">{selectedPlaneacion?.title || (isEs ? 'Planeación del día' : "Today's Pinned Plan")}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedDate ? `${isEs ? 'Fecha seleccionada:' : 'Selected date:'} ${selectedDate}` : ''}</p>
                </div>
                <div className="space-y-3">
                  {taskList.map((item) => (
                    <label key={item} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!checkedItems[item]}
                          onChange={() => setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }))}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={checkedItems[item] ? 'text-slate-400 line-through text-sm' : 'text-slate-700 text-sm'}>{item}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{checkedItems[item] ? (isEs ? 'Completado' : 'Done') : (isEs ? 'Pendiente' : 'Pending')}</span>
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
