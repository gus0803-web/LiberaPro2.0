import { createClient } from './supabase/client';

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

// Now asynchronous!
export async function loadAgendaItems(): Promise<AgendaItem[]> {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return [];

    const { data, error } = await supabase
      .from('agenda_items')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching agenda items from Supabase:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      date: row.date,
      type: row.type as AgendaItemType,
      title: row.title,
      description: row.description || '',
      metadata: row.metadata || {},
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Unexpected error loading agenda items:', error);
    return [];
  }
}

export async function addAgendaItem(item: AgendaItem): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return false;

    const { error } = await supabase
      .from('agenda_items')
      .insert({
        user_id: userData.user.id,
        date: item.date,
        type: item.type,
        title: item.title,
        description: item.description,
        metadata: item.metadata,
        created_at: item.createdAt || new Date().toISOString()
      });

    if (error) {
      console.error('Error adding agenda item:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error adding agenda item:', error);
    return false;
  }
}

export async function deleteAgendaItem(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('agenda_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting agenda item:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error deleting agenda item:', error);
    return false;
  }
}

const SELECTED_PLAN_DATE_KEY = 'selectedPlanDate';

export function loadSelectedPlanDate(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(SELECTED_PLAN_DATE_KEY) || '';
}

export function saveSelectedPlanDate(date: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTED_PLAN_DATE_KEY, date);
}

// UI helper functions remain synchronous
export function getAgendaItemColor(type: AgendaItemType) {
  switch (type) {
    case 'planeacion': return 'border-blue-300/80 bg-blue-50 text-blue-900';
    case 'recordatorio': return 'border-amber-300/80 bg-amber-50 text-amber-900';
    case 'material': return 'border-emerald-300/80 bg-emerald-50 text-emerald-900';
    case 'junta': return 'border-purple-300/80 bg-purple-50 text-purple-900';
    case 'examen': return 'border-red-300/80 bg-red-50 text-red-900';
    case 'tarea': return 'border-orange-300/80 bg-orange-50 text-orange-900';
    case 'evento': return 'border-pink-300/80 bg-pink-50 text-pink-900';
    default: return 'border-slate-200 bg-slate-50 text-slate-900';
  }
}

export function typeLabel(type: AgendaItemType, isEs: boolean) {
  switch (type) {
    case 'planeacion': return isEs ? 'Planeación' : 'Lesson Plan';
    case 'recordatorio': return isEs ? 'Recordatorio' : 'Reminder';
    case 'material': return isEs ? 'Material' : 'Material';
    case 'junta': return isEs ? 'Junta' : 'Meeting';
    case 'examen': return isEs ? 'Examen' : 'Exam';
    case 'tarea': return isEs ? 'Tarea' : 'Homework';
    case 'evento': return isEs ? 'Evento Especial' : 'Special Event';
    default: return type;
  }
}

function safeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|\\s]+/g, '_').slice(0, 80);
}

export function buildAgendaItemText(item: AgendaItem) {
  const lines = [
    `${item.title}`,
    `Fecha: ${item.date}`,
    `Tipo: ${item.type}`,
    '',
    item.description || '',
  ];

  if (item.metadata?.object?.sesiones) {
    lines.push('', '--- SECUENCIAS DIDÁCTICAS ---');
    const sesiones = item.metadata.object.sesiones;
    sesiones.forEach((sesion: any, index: number) => {
      lines.push(`\nSESIÓN ${index + 1}`);
      if (sesion.contenido) lines.push(`CONTENIDO:\n${sesion.contenido}`);
      if (sesion.pda) lines.push(`PDA:\n${sesion.pda}`);
      if (sesion.fasesMetodologicas) {
        lines.push(`FASES Y ACTIVIDADES:\n${sesion.fasesMetodologicas}`);
      }
      if (sesion.adecuacionesTEA && sesion.adecuacionesTEA !== 'N/A') {
        lines.push(`ADECUACIONES TEA:\n${sesion.adecuacionesTEA}`);
      }
      if (sesion.evaluacionFormativa) lines.push(`EVALUACIÓN:\n${sesion.evaluacionFormativa}`);
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
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');
  
  const stripMarkdown = (text: string) => {
    return text
      .replace(/\\*\\*/g, '') // remove bold **
      .replace(/__/g, '') // remove bold __
      .replace(/\\*/g, '') // remove italic *
      .replace(/#/g, '') // remove headings #
      .replace(/---/g, '') // remove horizontal rules
      .replace(/>/g, '') // remove blockquotes
      .replace(/`/g, ''); // remove backticks
  };

  const renderValue = (val: any) => {
    if (!val) return 'N/A';
    if (typeof val === 'string') return stripMarkdown(val);
    return stripMarkdown(JSON.stringify(val));
  };

  let doc;

  if (item.metadata?.object?.datosIdentificacion) {
    const obj = item.metadata.object;
    const datos = obj.datosIdentificacion;
    const elems = obj.elementosCurriculares;
    const fases = Array.isArray(obj.fases) ? obj.fases : (Array.isArray(obj.sesiones) ? obj.sesiones : []);
    
    const createCell = (text: string, isHeader: boolean = false, bgColor?: string, colSpan: number = 1, textColor?: string) => {
      const paragraphs = String(text).split('\n').map(line => 
        new Paragraph({ children: [new TextRun({ text: line, bold: isHeader, size: 22, color: textColor })] })
      );
      return new TableCell({
        columnSpan: colSpan,
        shading: bgColor ? { fill: bgColor } : undefined,
        margins: { top: 150, bottom: 150, left: 150, right: 150 },
        children: paragraphs,
      });
    };

    const sections = [];
    
    // Header Title
    sections.push(new Paragraph({
      text: "PLANEACIÓN DIDÁCTICA NEM",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }));

    // Info Table
    sections.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [4000, 4000, 4000, 4118],
      rows: [
        new TableRow({
          children: [
            createCell('Nombre del Docente:', true, "f8fafc"),
            createCell(renderValue(datos.nombreDocente)),
            createCell('Grado y Grupo:', true, "f8fafc"),
            createCell(item.metadata.schoolGroup || renderValue(datos.gradoYGrupo)),
          ]
        }),
        new TableRow({
          children: [
            createCell('Fase:', true, "f8fafc"),
            createCell(renderValue(datos.fase)),
            createCell('Periodo de aplicación:', true, "f8fafc"),
            createCell(renderValue(datos.periodoAplicacion)),
          ]
        }),
        new TableRow({
          children: [
            createCell('Campo Formativo:', true, "e0f2fe"),
            createCell(renderValue(elems.camposFormativos), false, "ffffff", 3),
          ]
        }),
        new TableRow({
          children: [
            createCell('Metodología:', true, "e0f2fe"),
            createCell(renderValue(elems.metodologia), false, "ffffff", 3),
          ]
        }),
        new TableRow({
          children: [
            createCell('Problemática:', true, "e0f2fe"),
            createCell(renderValue(elems.problematica), false, "ffffff", 3),
          ]
        })
      ]
    }));
    sections.push(new Paragraph({ spacing: { after: 300 } }));

    // Curriculum Table
    const contenidoText = elems.contenidos || (fases[0]?.contenido) || 'N/A';
    const pdaText = elems.pda || (fases[0]?.pda) || 'N/A';
    const ejesText = elems.ejesArticuladores || (fases[0]?.ejesArticuladores) || 'N/A';
    const escenarioText = elems.escenario || (fases[0]?.escenario) || 'N/A';

    sections.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [4000, 4000, 4000, 4118],
      rows: [
        new TableRow({
          children: [
            createCell('CONTENIDO(S)', true, "1e3a8a", 1, "ffffff"),
            createCell('PROCESOS DE DESARROLLO DE APRENDIZAJE (PDA)', true, "1e3a8a", 1, "ffffff"),
            createCell('EJES ARTICULADORES', true, "1e3a8a", 1, "ffffff"),
            createCell('ESCENARIO', true, "1e3a8a", 1, "ffffff")
          ]
        }),
        new TableRow({
          children: [
            createCell(renderValue(contenidoText)),
            createCell(renderValue(pdaText)),
            createCell(renderValue(ejesText)),
            createCell(renderValue(escenarioText))
          ]
        })
      ]
    }));
    sections.push(new Paragraph({ spacing: { after: 300 } }));

    // Activities Table
    const actRows = [
      new TableRow({
        children: [
          createCell('ACTIVIDADES DE APRENDIZAJE', true, "10b981", 1, "ffffff"),
          createCell('RECURSOS MATERIALES', true, "10b981", 1, "ffffff"),
          createCell('EVALUACIÓN FORMATIVA', true, "10b981", 1, "ffffff")
        ]
      })
    ];

    fases.forEach((faseObj: any, idx: number) => {
      const titulo = faseObj.titulo || `Fase/Sesión ${idx + 1}`;
      const actividades = faseObj.actividades || faseObj.fasesMetodologicas || 'N/A';
      const actCellContent = `[${titulo}]\n\n${actividades}`;
      
      actRows.push(new TableRow({
        children: [
          createCell(renderValue(actCellContent)),
          createCell(renderValue(faseObj.recursosYMateriales || faseObj.recursos || 'N/A')),
          createCell(renderValue(faseObj.evaluacionFormativa || faseObj.evaluacion || 'N/A'))
        ]
      }));

      if (faseObj.adecuacionesTEA && faseObj.adecuacionesTEA !== 'N/A') {
        actRows.push(new TableRow({
          children: [
            createCell('ADECUACIONES TEA:\n' + renderValue(faseObj.adecuacionesTEA), false, "fffbeb", 3)
          ]
        }));
      }
    });

    sections.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [8118, 4000, 4000],
      rows: actRows
    }));

    doc = new Document({
      sections: [{ 
        properties: {
          page: {
            size: {
              orientation: "landscape",
            },
            margin: {
              top: 360,
              right: 360,
              bottom: 360,
              left: 360,
            },
          },
        },
        children: sections 
      }]
    });

  } else {
    doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: item.title, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: `Fecha: ${item.date}` }),
          new Paragraph({ text: item.description || '' }),
          new Paragraph({ text: item.metadata?.materialContent || '' }),
        ]
      }]
    });
  }

  Packer.toBlob(doc).then((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = url;
    fileDownload.download = `${safeFilename(item.title)}-${item.date}.docx`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    URL.revokeObjectURL(url);
  });
}

export function printAgendaItem(item: AgendaItem) {
  if (typeof window === 'undefined') return;
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  const renderValue = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return JSON.stringify(val);
  };

  let contentHtml = '';
  if (item.metadata?.object?.datosIdentificacion) {
    const obj = item.metadata.object;
    const datos = obj.datosIdentificacion;
    const elems = obj.elementosCurriculares;
    const sesiones = Array.isArray(obj.sesiones) ? obj.sesiones : [obj.sesiones];
    
    contentHtml = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; text-transform: uppercase;">PLANEACIÓN DIDÁCTICA NEM</h2>
      </div>
      <table width="100%" border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
        <tr><td><strong>Docente:</strong></td><td>${renderValue(datos.nombreDocente)}</td><td><strong>Fase:</strong></td><td>${renderValue(datos.fase)}</td></tr>
        <tr><td><strong>Grado y Grupo:</strong></td><td>${item.metadata.schoolGroup || renderValue(datos.gradoYGrupo)}</td><td><strong>Periodo:</strong></td><td>${renderValue(datos.periodoAplicacion)}</td></tr>
      </table>
      <table width="100%" border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
        <tr><td width="25%"><strong>Campo Formativo:</strong></td><td>${renderValue(elems.camposFormativos)}</td></tr>
        <tr><td><strong>Metodología:</strong></td><td>${renderValue(elems.metodologia)}</td></tr>
        <tr><td><strong>Problemática:</strong></td><td>${renderValue(elems.problematica)}</td></tr>
      </table>
    `;

    contentHtml += sesiones.map((sesion: any, idx: number) => `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h3 style="border-bottom: 2px solid #000;">SESIÓN ${idx + 1}</h3>
        <table width="100%" border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin-bottom: 10px;">
          <tr><td width="25%"><strong>Contenido</strong></td><td>${renderValue(sesion.contenido)}</td></tr>
          <tr><td><strong>PDA</strong></td><td>${renderValue(sesion.pda)}</td></tr>
          <tr><td><strong>Ejes Articuladores</strong></td><td>${renderValue(sesion.ejesArticuladores)}</td></tr>
          <tr><td><strong>Libros y Escenario</strong></td><td>${renderValue(sesion.librosYEscenario)}</td></tr>
        </table>
        <table width="100%" border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin-bottom: 10px;">
          <tr><td colspan="2" style="text-align:center;"><strong>SECUENCIA DIDÁCTICA</strong></td></tr>
          <tr><td width="15%"><strong>INICIO</strong></td><td style="white-space: pre-wrap;">${renderValue(sesion.secuenciaDidactica?.inicio)}</td></tr>
          <tr><td><strong>DESARROLLO</strong></td><td style="white-space: pre-wrap;">${renderValue(sesion.secuenciaDidactica?.desarrollo)}</td></tr>
          <tr><td><strong>CIERRE</strong></td><td style="white-space: pre-wrap;">${renderValue(sesion.secuenciaDidactica?.cierre)}</td></tr>
          ${sesion.adecuacionesTEA && sesion.adecuacionesTEA !== 'N/A' ? `<tr><td style="color: #b45309;"><strong>ADECUACIONES TEA</strong></td><td style="color: #78350f; white-space: pre-wrap;">${renderValue(sesion.adecuacionesTEA)}</td></tr>` : ''}
        </table>
        <table width="100%" border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin-bottom: 10px;">
          <tr><td width="25%"><strong>Recursos</strong></td><td>${renderValue(sesion.recursosYMateriales)}</td></tr>
          <tr><td><strong>Evaluación</strong></td><td>${renderValue(sesion.evaluacionFormativa)}</td></tr>
        </table>
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
