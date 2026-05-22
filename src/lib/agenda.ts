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

  if (item.metadata?.object?.diaADia) {
    lines.push('', '--- DESGLOSE DEL DÍA ---');
    const dias = Array.isArray(item.metadata.object.diaADia) ? item.metadata.object.diaADia : [item.metadata.object.diaADia];
    dias.forEach((dia: any, index: number) => {
      lines.push(`\nDía ${index + 1}: ${dia.dia || ''}`);
      if (dia.inicio) lines.push(`INICIO:\n${dia.inicio}`);
      if (dia.desarrollo) lines.push(`DESARROLLO:\n${dia.desarrollo}`);
      if (dia.cierre) lines.push(`CIERRE:\n${dia.cierre}`);
      if (dia.material_estandar) lines.push(`MATERIALES:\n${dia.material_estandar}`);
      if (dia.material_eco_ally) lines.push(`MATERIALES ECO:\n${dia.material_eco_ally}`);
      if (dia.conaliteg_cita) lines.push(`LIBRO DE TEXTO (CONALITEG):\n${dia.conaliteg_cita}`);
    });
  } else if (item.metadata?.object) {
    lines.push('', 'Detalles adicionales:');
    lines.push(typeof item.metadata.object === 'string' ? item.metadata.object : JSON.stringify(item.metadata.object, null, 2));
  } else if (item.metadata?.materialContent) {
    lines.push('', '--- MATERIAL GENERADO ---');
    lines.push(item.metadata.materialContent);
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
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  let contentHtml = '';
  if (item.metadata?.object?.diaADia) {
    const dias = Array.isArray(item.metadata.object.diaADia) ? item.metadata.object.diaADia : [item.metadata.object.diaADia];
    contentHtml = dias.map((dia: any, idx: number) => `
      <div style="margin-bottom: 2rem; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;">
        <h3 style="margin-top:0; color:#2563eb;">Día ${idx + 1} - ${dia.dia || ''}</h3>
        ${dia.tiemposEstimados ? `<p style="color: #64748b; font-size: 0.9em; margin-top: -0.5rem; margin-bottom: 1rem;"><strong>Tiempos Estimados:</strong> ${dia.tiemposEstimados}</p>` : ''}
        <p><strong>Inicio:</strong><br/>${dia.inicio}</p>
        <p><strong>Desarrollo:</strong><br/>
          ${dia.desarrollo && typeof dia.desarrollo === 'object' ? `
            <ul>
              ${dia.desarrollo.visual ? `<li><strong>Visual:</strong> ${dia.desarrollo.visual}</li>` : ''}
              ${dia.desarrollo.auditiva ? `<li><strong>Auditiva:</strong> ${dia.desarrollo.auditiva}</li>` : ''}
              ${dia.desarrollo.kinestesica ? `<li><strong>Kinestésica:</strong> ${dia.desarrollo.kinestesica}</li>` : ''}
            </ul>
          ` : dia.desarrollo || ''}
        </p>
        <p><strong>Cierre:</strong><br/>${dia.cierre}</p>
        <p><strong>Materiales:</strong><br/>
          ${dia.materiales && typeof dia.materiales === 'object' ? `
            <ul>
              ${dia.materiales.principal ? `<li><strong>Principal:</strong> ${dia.materiales.principal}</li>` : ''}
              ${dia.materiales.sustentable ? `<li><strong>Sustentable:</strong> ${dia.materiales.sustentable}</li>` : ''}
            </ul>
          ` : dia.material_estandar || ''}
        </p>
        <p><strong>Libro (Conaliteg):</strong><br/>${dia.conaliteg_cita || ''}</p>
      </div>
    `).join('');
  } else if (item.metadata?.materialContent) {
    contentHtml = `<pre style="white-space:pre-wrap; font-family:Arial;">${item.metadata.materialContent}</pre>`;
  } else {
    contentHtml = `<pre style="white-space:pre-wrap; font-family:Arial;">${item.description || ''}</pre>`;
  }

  printWindow.document.write(`<!doctype html><html><head><title>${item.title}</title><style>@page{size:letter;margin:1in;}body{font-family:Arial, sans-serif;padding:24px;color:#111;}h1{font-size:24px;margin-bottom:0.5rem;color:#1e293b;}p{margin:0.5rem 0; line-height: 1.5;}</style></head><body><h1>${item.title}</h1><p><strong>Fecha:</strong> ${item.date}</p><p><strong>Tipo:</strong> ${item.type}</p><hr/>${contentHtml}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
