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
  X,
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
  const [formDate, setFormDate] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthLabel, setMonthLabel] = useState<string>('');

  const isEs = language === 'es';

  useEffect(() => {
    async function fetchAgenda() {
      const storedItems = await loadAgendaItems();
      setAgendaItems(storedItems);

      const storedDate = loadSelectedPlanDate();
      if (storedDate) {
        setSelectedDate(storedDate);
      } else if (storedItems.length > 0) {
        setSelectedDate(storedItems[0].date);
      } else {
        setSelectedDate(getTodayDate());
      }
    }
    fetchAgenda();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      saveSelectedPlanDate(selectedDate);
      setFormDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    setFormDate(getTodayDate());
  }, []);

  useEffect(() => {
    setMonthLabel(
      calendarMonth.toLocaleString(isEs ? 'es-ES' : 'en-US', {
        month: 'long',
        year: 'numeric',
      })
    );
  }, [calendarMonth, isEs]);

  const dayItems = useMemo(
    () => agendaItems.filter((item) => item.date === selectedDate),
    [agendaItems, selectedDate]
  );

  const days = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  const selectedDateHasItems = dayItems.length > 0;

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


  const handleAddItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formDate) return;

    const autoTitle = typeLabel(createType, isEs);

    const item: AgendaItem = {
      id: `${Date.now()}-${formDate}-${createType}`,
      date: formDate,
      type: createType,
      title: autoTitle,
      description: '',
      metadata: {},
      createdAt: new Date().toISOString(),
    };

    setFormMessage(isEs ? 'Guardando en la nube...' : 'Saving to cloud...');
    const success = await addAgendaItem(item);
    if (success) {
      setAgendaItems(prev => [...prev, item]);
      setFormMessage(isEs ? 'Item agregado a tu agenda.' : 'Item added to your agenda.');
      window.setTimeout(() => setFormMessage(''), 3000);
    } else {
      setFormMessage(isEs ? 'Error al guardar. Intenta de nuevo.' : 'Error saving. Try again.');
      window.setTimeout(() => setFormMessage(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(isEs ? '¿Estás seguro de eliminar este elemento?' : 'Are you sure you want to delete this item?')) {
      const success = await deleteAgendaItem(id);
      if (success) {
        setAgendaItems(prev => prev.filter(item => item.id !== id));
        if (previewId === id) {
          setPreviewId(null);
        }
      }
    }
  };

  const handlePreviewToggle = (id: string) => {
    setPreviewId((current) => (current === id ? null : id));
  };

  const handlePrint = (item: AgendaItem) => {
    printAgendaItem(item);
  };

  // monthLabel is managed by useEffect to avoid hydration mismatch

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

      <div className="space-y-6">
        <section>
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
                    onClick={() => {
                      setSelectedDate(cell.dateKey || getTodayDate());
                      setIsModalOpen(true);
                    }}
                    className={`group min-h-[120px] flex flex-col items-start rounded-3xl border p-3 transition ${isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'} ${isToday ? 'ring-2 ring-blue-200' : ''}`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-sm font-semibold text-slate-800">{cell.value}</span>
                    </div>
                    <div className="flex flex-col gap-1 w-full max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                      {agendaItems.filter(i => i.date === cell.dateKey).map(item => {
                        const typeColors: Record<string, string> = {
                          planeacion: 'bg-blue-100 text-blue-800',
                          material: 'bg-emerald-100 text-emerald-800',
                          junta: 'bg-purple-100 text-purple-800',
                          recordatorio: 'bg-amber-100 text-amber-800',
                          examen: 'bg-red-100 text-red-800',
                          tarea: 'bg-orange-100 text-orange-800',
                          evento: 'bg-pink-100 text-pink-800',
                        };
                        const colorClass = typeColors[item.type] || 'bg-slate-100 text-slate-800';
                        return (
                          <div key={item.id} className={`text-[10px] truncate w-full px-2 py-1 rounded font-bold text-left ${colorClass}`}>
                             {renderContent(item.title)}
                          </div>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6">

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{isEs ? 'Fecha' : 'Date'}</label>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{isEs ? 'Tipo' : 'Type'}</label>
                  <select value={createType} onChange={(e) => setCreateType(e.target.value as AgendaItemType)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <option value="recordatorio">{isEs ? 'Recordatorio' : 'Reminder'}</option>
                    <option value="material">{isEs ? 'Material' : 'Material'}</option>
                    <option value="junta">{isEs ? 'Junta' : 'Meeting'}</option>
                    <option value="examen">{isEs ? 'Examen' : 'Exam'}</option>
                    <option value="tarea">{isEs ? 'Tarea' : 'Homework'}</option>
                    <option value="evento">{isEs ? 'Evento Especial' : 'Special Event'}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4">
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white hover:bg-blue-700 transition-colors w-full sm:w-auto">
                  <PlusCircle className="w-4 h-4" />
                  {isEs ? 'Agregar' : 'Add'}
                </button>
                {formMessage ? <p className="text-sm font-medium text-emerald-600">{formMessage}</p> : null}
              </div>
            </form>
          </div>
        </section>

      {/* Modal Resumen del Día */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">{isEs ? 'Resumen del Día' : 'Daily Summary'}</p>
                  <h3 className="text-xl font-bold text-slate-900">{selectedDate}</h3>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
              {selectedDateHasItems ? (
                <div className="space-y-4">
                  {dayItems.map((item) => (
                    <article key={item.id} className={`rounded-3xl border p-5 shadow-sm bg-white ${getAgendaItemColor(item.type)}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] font-bold text-slate-500">{typeLabel(item.type, isEs)}</p>
                          <h4 className="mt-1 text-lg font-bold text-slate-900">{renderContent(item.title)}</h4>
                          {item.description && <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{renderContent(item.description)}</div>}
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
                            <button type="button" onClick={() => handlePrint(item)} className="rounded-full border border-slate-200 bg-white/50 p-2 text-slate-700 hover:bg-white transition-colors">
                              <Printer className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDelete(item.id)} className="rounded-full border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {previewId === item.id ? (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
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
                                {isEs ? 'Descargar Material (.docx)' : 'Download Material (.docx)'}
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
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-sm text-slate-500 flex items-center justify-center h-full min-h-[200px]">
                  {isEs
                    ? 'No hay actividades registradas para este día.'
                    : 'No activities recorded for this day.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
