'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import {
  CalendarDays,
  CheckCircle2,
  ArrowLeft,
  Eye,
  Printer,
  Trash2,
  Download,
  PlusCircle,
  Bell,
  FileText,
} from 'lucide-react';
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

const weekDays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

function formatDateKey(date: string) {
  return date;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildCalendarDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ type: 'blank' | 'day'; value?: number; dateKey?: string }> = [];
  for (let index = 0; index < firstDay; index += 1) {
    cells.push({ type: 'blank' });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const value = day;
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ type: 'day', value, dateKey });
  }

  return cells;
}

export default function CalendarPage() {
  const { language } = useTheme();
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [createType, setCreateType] = useState<AgendaItemType>('recordatorio');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const isEs = language === 'es';

  useEffect(() => {
    const storedItems = loadAgendaItems();
    setAgendaItems(storedItems);

    const storedDate = loadSelectedPlanDate();
    if (storedDate) {
      setSelectedDate(storedDate);
    } else if (storedItems.length > 0) {
      setSelectedDate(storedItems[0].date);
    } else {
      setSelectedDate(getTodayDate());
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      saveSelectedPlanDate(selectedDate);
    }
  }, [selectedDate]);

  const dayItems = useMemo(
    () => agendaItems.filter((item) => item.date === selectedDate),
    [agendaItems, selectedDate]
  );

  const days = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  const selectedDateHasItems = dayItems.length > 0;

  const handleAddItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim()) {
      setFormMessage(isEs ? 'Agrega un título para continuar.' : 'Add a title to continue.');
      return;
    }

    const item: AgendaItem = {
      id: `${Date.now()}-${selectedDate}-${createType}`,
      date: selectedDate,
      type: createType,
      title: newTitle,
      description: newDescription,
      metadata: {},
      createdAt: new Date().toISOString(),
    };

    const updated = addAgendaItem(item);
    setAgendaItems(updated);
    setNewTitle('');
    setNewDescription('');
    setFormMessage(isEs ? 'Item agregado a tu agenda.' : 'Item added to your agenda.');
    window.setTimeout(() => setFormMessage(''), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = deleteAgendaItem(id);
    setAgendaItems(updated);
    if (previewId === id) {
      setPreviewId(null);
    }
  };

  const handlePreviewToggle = (id: string) => {
    setPreviewId((current) => (current === id ? null : id));
  };

  const handlePrint = (item: AgendaItem) => {
    printAgendaItem(item);
  };

  const monthLabel = calendarMonth.toLocaleString(isEs ? 'es-ES' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const agendaDates = useMemo(() => Array.from(new Set(agendaItems.map((item) => item.date))), [agendaItems]);

  return (
    <div className="h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{isEs ? 'Calendario' : 'Calendar'}</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            {isEs
              ? 'Crea y organiza tus planeaciones, recordatorios y materiales desde esta agenda diaria.'
              : 'Create and organize your lesson plans, reminders, and materials from this daily agenda.'}
          </p>
        </div>
        <Link href="/app/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {isEs ? 'Volver al Dashboard' : 'Back to Dashboard'}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{isEs ? 'Mes' : 'Month'}</p>
                <h2 className="text-2xl font-semibold text-slate-900">{monthLabel}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700 hover:bg-slate-100"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700 hover:bg-slate-100"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.25em] text-slate-500 mb-4">
              {weekDays.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((cell, index) => {
                if (cell.type === 'blank') {
                  return <div key={`blank-${index}`} className="h-14 rounded-2xl bg-slate-100" />;
                }

                const hasItems = agendaItems.some((item) => item.date === cell.dateKey);
                const isSelected = selectedDate === cell.dateKey;
                const isToday = cell.dateKey === getTodayDate();

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => setSelectedDate(cell.dateKey || getTodayDate())}
                    className={`group min-h-[120px] flex flex-col items-start rounded-3xl border p-3 transition ${isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'} ${isToday ? 'ring-2 ring-blue-200' : ''}`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-sm font-semibold text-slate-800">{cell.value}</span>
                    </div>
                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                      {agendaItems.filter(i => i.date === cell.dateKey).slice(0, 3).map(item => (
                        <div key={item.id} className="text-[10px] truncate w-full px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium text-left">
                           {item.title}
                        </div>
                      ))}
                      {agendaItems.filter(i => i.date === cell.dateKey).length > 3 && (
                        <div className="text-[10px] text-slate-500 font-medium text-left px-2">
                          +{agendaItems.filter(i => i.date === cell.dateKey).length - 3} más
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {isEs
                ? 'Selecciona un día para ver tus actividades ancladas y crear nuevos recordatorios o materiales.'
                : 'Select a day to see your pinned activities and create new reminders or materials.'}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{isEs ? 'Agregar a tu agenda' : 'Add to your agenda'}</p>
                <h3 className="text-lg font-semibold text-slate-900">{isEs ? 'Nueva entrada' : 'New entry'}</h3>
              </div>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{isEs ? 'Tipo' : 'Type'}</label>
                <select value={createType} onChange={(e) => setCreateType(e.target.value as AgendaItemType)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="recordatorio">{isEs ? 'Recordatorio' : 'Reminder'}</option>
                  <option value="material">{isEs ? 'Material' : 'Material'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{isEs ? 'Título' : 'Title'}</label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder={isEs ? 'Ej. Traer materiales reciclables' : 'E.g. Bring recycled materials'} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{isEs ? 'Descripción' : 'Description'}</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200" rows={4} placeholder={isEs ? 'Notas o instrucciones para el día seleccionado' : 'Notes or instructions for the selected day'} />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  <PlusCircle className="w-4 h-4" />
                  {isEs ? 'Agregar' : 'Add'}
                </button>
                {formMessage ? <p className="text-sm text-slate-600">{formMessage}</p> : null}
              </div>
            </form>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{isEs ? 'Agenda del Día' : 'Day Agenda'}</p>
                <h3 className="text-xl font-semibold text-slate-900">{selectedDate}</h3>
              </div>
            </div>

            {selectedDateHasItems ? (
              <div className="space-y-4">
                {dayItems.map((item) => (
                  <article key={item.id} className={`rounded-3xl border p-5 shadow-sm ${getAgendaItemColor(item.type)}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{typeLabel(item.type, isEs)}</p>
                        <h4 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h4>
                        <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{item.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-slate-700">
                        <button type="button" onClick={() => handlePreviewToggle(item.id)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                          <Eye className="w-4 h-4" />
                          {isEs ? 'Vista' : 'Preview'}
                        </button>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => downloadAgendaItem(item)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100">
                            <Download className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handlePrint(item)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100">
                            <Printer className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleDelete(item.id)} className="rounded-full border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {previewId === item.id ? (
                      <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-800 mb-2">{isEs ? 'Contenido' : 'Content'}</p>
                        <pre className="whitespace-pre-wrap text-sm leading-6">{item.description || (item.metadata?.object ? JSON.stringify(item.metadata.object, null, 2) : '')}</pre>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                {isEs
                  ? 'No hay actividades para este día. Agrega una nueva entrada o selecciona otro día.'
                  : 'No activities for this day. Add a new entry or select another day.'}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{isEs ? 'Resumen' : 'Summary'}</p>
                <h3 className="text-lg font-semibold text-slate-900">{isEs ? 'Tus días en orden' : 'Your day in order'}</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {isEs
                ? 'Crea recordatorios y materiales aquí. Todos los documentos descargables se pueden abrir en Windows y Mac, y la impresión se genera en tamaño carta.'
                : 'Create reminders and materials here. All downloadable documents open on Windows and Mac, and printing will use letter size.'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
