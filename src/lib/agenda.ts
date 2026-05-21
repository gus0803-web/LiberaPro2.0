'use client';

export type AgendaItemType = 'planeacion' | 'recordatorio' | 'material' | 'junta' | 'examen' | 'tarea' | 'evento';

export type AgendaItem = {
  id: string;
  date: string;
  type: AgendaItemType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
};

const AGENDA_STORAGE_KEY = 'agendaItems';
const LEGACY_PLANEACIONES_KEY = 'savedPlaneaciones';
const SELECTED_PLAN_DATE_KEY = 'selectedPlanDate';

export function loadAgendaItems(): AgendaItem[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(AGENDA_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as AgendaItem[];
    } catch (error) {
      console.warn('Unable to parse agenda items from storage', error);
    }
  }

  const legacy = localStorage.getItem(LEGACY_PLANEACIONES_KEY);
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy) as Array<any>;
      const converted = parsed.map((plan) => ({
        id: plan.id || `${Date.now()}-${plan.date}`,
        date: plan.date || new Date().toISOString().slice(0, 10),
        type: 'planeacion' as AgendaItemType,
        title: plan.title || plan.proyecto || 'Planeación Generada',
        description: plan.description || `Fase: ${plan.fase || ''} ${plan.campoFormativo || ''}`.trim(),
        metadata: { ...plan },
        createdAt: plan.generatedAt || new Date().toISOString(),
      }));
      saveAgendaItems(converted);
      return converted;
    } catch (error) {
      console.warn('Unable to parse legacy savedPlaneaciones', error);
    }
  }

  return [];
}

export function saveAgendaItems(items: AgendaItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(items));
}

export function addAgendaItem(item: AgendaItem) {
  const existing = loadAgendaItems();
  const updated = [item, ...existing.filter((current) => current.id !== item.id)];
  saveAgendaItems(updated);
  return updated;
}

export function deleteAgendaItem(id: string) {
  const existing = loadAgendaItems();
  const updated = existing.filter((item) => item.id !== id);
  saveAgendaItems(updated);
  return updated;
}

export function getAgendaForDate(date: string) {
  return loadAgendaItems().filter((item) => item.date === date);
}

export function loadSelectedPlanDate(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(SELECTED_PLAN_DATE_KEY) || '';
}

export function saveSelectedPlanDate(date: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTED_PLAN_DATE_KEY, date);
}

export function getAgendaItemColor(type: AgendaItemType) {
  switch (type) {
    case 'planeacion':
      return 'border-blue-300/80 bg-blue-50 text-blue-900';
    case 'recordatorio':
      return 'border-amber-300/80 bg-amber-50 text-amber-900';
    case 'material':
      return 'border-emerald-300/80 bg-emerald-50 text-emerald-900';
    case 'junta':
      return 'border-purple-300/80 bg-purple-50 text-purple-900';
    case 'examen':
      return 'border-red-300/80 bg-red-50 text-red-900';
    case 'tarea':
      return 'border-orange-300/80 bg-orange-50 text-orange-900';
    case 'evento':
      return 'border-pink-300/80 bg-pink-50 text-pink-900';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-900';
  }
}

export function typeLabel(type: AgendaItemType, isEs: boolean) {
  switch (type) {
    case 'planeacion':
      return isEs ? 'Planeación' : 'Lesson Plan';
    case 'recordatorio':
      return isEs ? 'Recordatorio' : 'Reminder';
    case 'material':
      return isEs ? 'Material' : 'Material';
    case 'junta':
      return isEs ? 'Junta' : 'Meeting';
    case 'examen':
      return isEs ? 'Examen' : 'Exam';
    case 'tarea':
      return isEs ? 'Tarea' : 'Homework';
    case 'evento':
      return isEs ? 'Evento Especial' : 'Special Event';
    default:
      return type;
  }
}

function safeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 80);
}

export function buildAgendaItemText(item: AgendaItem) {
  const lines = [
    `${item.title}`,
    `Fecha: ${item.date}`,
    `Tipo: ${item.type}`,
    '',
    item.description || '',
  ];

  if (item.metadata?.object) {
    lines.push('', 'Detalles adicionales:');
    lines.push(JSON.stringify(item.metadata.object, null, 2));
  }

  return lines.join('\n');
}

export function downloadAgendaItem(item: AgendaItem) {
  if (typeof window === 'undefined') return;
  const text = buildAgendaItemText(item);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${safeFilename(item.title)}-${item.date}.txt`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export function printAgendaItem(item: AgendaItem) {
  if (typeof window === 'undefined') return;
  const content = buildAgendaItemText(item)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  printWindow.document.write(`<!doctype html><html><head><title>${item.title}</title><style>@page{size:letter;margin:1in;}body{font-family:Arial, sans-serif;padding:24px;color:#111;}h1{font-size:24px;margin-bottom:0.5rem;}p{margin:0.5rem 0;}pre{white-space:pre-wrap;font-size:14px;line-height:1.5;}</style></head><body><h1>${item.title}</h1><p><strong>Fecha:</strong> ${item.date}</p><p><strong>Tipo:</strong> ${item.type}</p><hr/><pre>${content}</pre></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
