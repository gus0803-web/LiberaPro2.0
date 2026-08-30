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
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, TableLayoutType } = require('docx');
  
  const stripMarkdown = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/---/g, '')
      .replace(/>/g, '')
      .replace(/`/g, '');
  };

  const renderValue = (val: any) => {
    if (!val) return 'N/A';
    if (typeof val === 'string') return stripMarkdown(val);
    return stripMarkdown(JSON.stringify(val));
  };

  const templateBase64 = localStorage.getItem('liberapro_custom_template');
  if (templateBase64 && item.metadata?.object) {
    try {
      const PizZip = require('pizzip');
      const Docxtemplater = require('docxtemplater');

      const binary_string = window.atob(templateBase64.split(',')[1]);
      const len = binary_string.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      
      const zip = new PizZip(bytes.buffer);
      const docTemplater = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      
      const obj = item.metadata.object;
      const datos = obj.datosIdentificacion || {};
      
      const data = {
        tema: obj.proyectoIntegrador?.titulo || '',
        metodologia: obj.proyectoIntegrador?.metodologia || '',
        proposito: obj.proyectoIntegrador?.proposito || '',
        fase: datos.fase || '',
        docente: datos.nombreDocente || '',
        escuela: datos.escuela || '',
        cct: datos.cct || '',
        turno: datos.turno || '',
        director: datos.director || '',
        grado: datos.gradoYGrupo || '',
        periodo: datos.periodoAplicacion || '',
        mes: datos.mesPlan || '',
        justificacion: obj.justificacionYDiagnostico || '',
        evaluacion: obj.estrategiaEvaluacion || '',
        fases: (obj.fasesMetodologia || []).map((f: any) => {
          let actividadesStr = '';
          if (f.fase && Array.isArray(f.momentos)) {
            actividadesStr = f.momentos.map((m: any) => `• ${m.nombreMomento}\n${m.actividadesIntegradas}`).join('\n\n');
          } else if (f.activacion || f.construccion || f.metacognicion) {
            actividadesStr = `• Activación: ${f.activacion}\n\n• Acción y Construcción: ${f.construccion}\n\n• Reflexión / Metacognición: ${f.metacognicion}`;
          } else {
            actividadesStr = f.actividades || f.fasesMetodologicas || '';
          }
          return {
            ...f,
            actividades: actividadesStr,
            faseNormalizada: f.fase || f.pasoMetodologia || ''
          };
        }),
        estructura: obj.estructuraCurricular || []
      };

      docTemplater.render(data);
      const out = docTemplater.getZip().generate({
          type: "blob",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(out);
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = url;
      fileDownload.download = `${safeFilename(item.title)}-${item.date}.docx`;
      fileDownload.click();
      document.body.removeChild(fileDownload);
      URL.revokeObjectURL(url);
      return; 
    } catch (error) {
      console.error("Error generating custom document:", error);
      alert("Error con tu formato personalizado. Generando formato estándar...");
    }
  }

  let doc;

  if (item.metadata?.object?.datosIdentificacion || item.metadata?.object?.secuenciasDidacticas) {
    const obj = item.metadata.object;
    const datos = obj.datosIdentificacion || {};
    const justificacion = obj.justificacionYDiagnostico || obj.justificacion || '';
    const proyecto = obj.proyectoIntegrador || {};
    const currList = Array.isArray(obj.estructuraCurricular) ? obj.estructuraCurricular : [];
    const fasesMetodologia = Array.isArray(obj.fasesMetodologia) ? obj.fasesMetodologia : [];
    const evaluacion = obj.estrategiaEvaluacion || '';
    const anexos = Array.isArray(obj.anexosListasCotejo) ? obj.anexosListasCotejo : [];
    const referenciasLibrosSEP = Array.isArray(obj.referenciasLibrosSEP) ? obj.referenciasLibrosSEP : [];
    const firmas = obj.firmas || {};
    
    const createCell = (text: string, isHeader: boolean = false, bgColor?: string, colSpan: number = 1, textColor?: string, widthPct?: number) => {
      const lines = String(text || '').split('\n');
      const paragraphs = lines.map(line => 
        new Paragraph({ 
          children: [new TextRun({ text: line, bold: isHeader, size: 20, color: textColor || "111827" })],
          spacing: { after: 60, before: 60 }
        })
      );
      return new TableCell({
        columnSpan: colSpan,
        shading: bgColor ? { fill: bgColor } : undefined,
        margins: { top: 120, bottom: 120, left: 150, right: 150 },
        width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
        children: paragraphs,
      });
    };

    const children: any[] = [];
    
    // Header Title
    children.push(new Paragraph({
      children: [new TextRun({ text: "SECRETARÍA DE EDUCACIÓN PÚBLICA", bold: true, size: 28, color: "1e3a8a" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 }
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: renderValue(datos.escuela || "Escuela Primaria"), bold: true, size: 22, color: "0f172a" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 }
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: `Planeación Didáctica - ${renderValue(datos.mesPlan || "Diagnóstico e Integración")}`, italic: true, size: 22, color: "0284c7" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }));

    // Info Table
    children.push(new Table({
      width: { size: 10800, type: WidthType.DXA },
      columnWidths: [2160, 3240, 2160, 3240],
      layout: TableLayoutType.AUTOFIT,
      rows: [
        new TableRow({
          children: [
            createCell('Docente Titular:', true, "f1f5f9", 1, undefined, 20),
            createCell(renderValue(datos.nombreDocente), false, undefined, 1, undefined, 30),
            createCell('Grado y Grupo:', true, "f1f5f9", 1, undefined, 20),
            createCell(renderValue(datos.gradoYGrupo), false, undefined, 1, undefined, 30),
          ]
        }),
        new TableRow({
          children: [
            createCell('Fase Curricular:', true, "f1f5f9"),
            createCell(renderValue(datos.fase)),
            createCell('Turno:', true, "f1f5f9"),
            createCell(renderValue(datos.turno || 'Matutino')),
          ]
        }),
        new TableRow({
          children: [
            createCell('Director(a):', true, "f1f5f9"),
            createCell(renderValue(datos.director)),
            createCell('CCT:', true, "f1f5f9"),
            createCell(renderValue(datos.cct)),
          ]
        }),
        new TableRow({
          children: [
            createCell('Periodo:', true, "f1f5f9"),
            createCell(renderValue(datos.periodoAplicacion), false, undefined, 3),
          ]
        })
      ]
    }));
    children.push(new Paragraph({ spacing: { after: 240 } }));

    // Sección 1: Justificación Pedagógica y Diagnóstico Inicial
    children.push(new Paragraph({
      children: [new TextRun({ text: "1. Justificación Pedagógica y Diagnóstico Inicial", bold: true, size: 26, color: "0369a1" })],
      spacing: { before: 300, after: 120 }
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: renderValue(justificacion), size: 21 })],
      spacing: { after: 240 }
    }));

    // Sección 2: Proyecto Integrador
    if (proyecto.titulo || proyecto.metodologia) {
      children.push(new Paragraph({
        children: [new TextRun({ text: "2. Proyecto Integrador", bold: true, size: 26, color: "0369a1" })],
        spacing: { before: 300, after: 120 }
      }));
      children.push(new Paragraph({
        children: [
          new TextRun({ text: "• Título del Proyecto: ", bold: true, size: 21 }),
          new TextRun({ text: renderValue(proyecto.titulo), size: 21 })
        ],
        spacing: { after: 60 }
      }));
      children.push(new Paragraph({
        children: [
          new TextRun({ text: "• Metodología Principal: ", bold: true, size: 21 }),
          new TextRun({ text: renderValue(proyecto.metodologia), size: 21 })
        ],
        spacing: { after: 60 }
      }));
      children.push(new Paragraph({
        children: [
          new TextRun({ text: "• Propósito del Proyecto: ", bold: true, size: 21 }),
          new TextRun({ text: renderValue(proyecto.proposito), size: 21 })
        ],
        spacing: { after: 240 }
      }));
    }

    // Sección 3: Estructura Curricular
    if (currList.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: "3. Estructura Curricular: Campos Formativos, Contenidos y PDA", bold: true, size: 26, color: "0369a1" })],
        spacing: { before: 300, after: 120 }
      }));
      
      const currRows = [
        new TableRow({
          children: [
            createCell('Campo Formativo', true, "1e293b", 1, "ffffff", 20),
            createCell('Contenido Contextualizado', true, "1e293b", 1, "ffffff", 30),
            createCell('Proceso de Desarrollo de Aprendizaje (PDA)', true, "1e293b", 1, "ffffff", 30),
            createCell('Ejes Articuladores', true, "1e293b", 1, "ffffff", 20),
          ]
        })
      ];

      currList.forEach((c: any) => {
        currRows.push(new TableRow({
          children: [
            createCell(renderValue(c.campoFormativo), true, "f8fafc"),
            createCell(renderValue(c.contenidoContextualizado)),
            createCell(renderValue(c.pda)),
            createCell(renderValue(c.ejesArticuladores)),
          ]
        }));
      });

      children.push(new Table({
        width: { size: 10800, type: WidthType.DXA },
        columnWidths: [2160, 3240, 3240, 2160],
        layout: TableLayoutType.AUTOFIT,
        rows: currRows
      }));
      children.push(new Paragraph({ spacing: { after: 240 } }));
    }

    // Sección 4: Fases Metodológicas
    if (fasesMetodologia.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: "4. Desarrollo del Proyecto por Fases Metodológicas", bold: true, size: 26, color: "0369a1" })],
        spacing: { before: 300, after: 200 }
      }));

      fasesMetodologia.forEach((f: any) => {
        let faseCampo = '';
        let actText = '';
        
        if (f.fase && Array.isArray(f.momentos)) {
          faseCampo = renderValue(f.fase);
          actText = f.momentos.map((m: any) => `• ${renderValue(m.nombreMomento)}\n${renderValue(m.actividadesIntegradas)}`).join('\n\n');
        } else {
          faseCampo = `${renderValue(f.pasoMetodologia)}\n${renderValue(f.camposFormativosInvolucrados)}`;
          if (f.activacion || f.construccion || f.metacognicion) {
            actText = `• Activación: ${renderValue(f.activacion)}\n\n• Acción y Construcción: ${renderValue(f.construccion)}\n\n• Reflexión / Metacognición: ${renderValue(f.metacognicion)}`;
          } else {
            actText = renderValue(f.actividades || f.fasesMetodologicas || '');
          }
        }

        const recursos = renderValue(f.materialesYRecursos || f.recursos || 'N/A');

        children.push(new Paragraph({
          children: [new TextRun({ text: faseCampo, bold: true, size: 24, color: "0f172a" })],
          spacing: { before: 120, after: 120 }
        }));
        
        const actLines = actText.split('\n');
        actLines.forEach(line => {
          children.push(new Paragraph({
            children: [new TextRun({ text: line, size: 22 })],
            spacing: { after: 60 }
          }));
        });
        
        children.push(new Paragraph({
          children: [
            new TextRun({ text: "Materiales y Recursos: ", bold: true, size: 22, color: "166534" }),
            new TextRun({ text: recursos, size: 22 })
          ],
          spacing: { before: 120, after: 240 }
        }));
      });
    }

    // Sección 5: Estrategia de Evaluación Formativa
    if (evaluacion) {
      children.push(new Paragraph({
        children: [new TextRun({ text: "5. Estrategia de Evaluación Diagnóstica y Formativa", bold: true, size: 26, color: "0369a1" })],
        spacing: { before: 300, after: 120 }
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: renderValue(evaluacion), size: 21 })],
        spacing: { after: 240 }
      }));
    }

    // Sección 6: Anexos - Listas de Cotejo
    if (anexos.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: "6. Anexos: Listas de Cotejo para la Evaluación Formativa", bold: true, size: 26, color: "0369a1" })],
        spacing: { before: 300, after: 120 }
      }));

      anexos.forEach((anexo: any) => {
        children.push(new Paragraph({
          children: [new TextRun({ text: renderValue(anexo.tituloAnexo), bold: true, size: 21 })],
          spacing: { before: 120, after: 80 }
        }));

        const anexoRows = [
          new TableRow({
            children: [
              createCell('Criterio de Evaluación', true, "334155", 1, "ffffff", 70),
              createCell('Sí', true, "334155", 1, "ffffff", 15),
              createCell('No', true, "334155", 1, "ffffff", 15),
            ]
          })
        ];

        (anexo.criterios || []).forEach((crit: any) => {
          anexoRows.push(new TableRow({
            children: [
              createCell(renderValue(crit.criterio)),
              createCell(renderValue(crit.si || ''), false, undefined, 1, undefined, 15),
              createCell(renderValue(crit.no || ''), false, undefined, 1, undefined, 15),
            ]
          }));
        });

        children.push(new Table({
          width: { size: 10800, type: WidthType.DXA },
          columnWidths: [7560, 1620, 1620],
          layout: TableLayoutType.AUTOFIT,
          rows: anexoRows
        }));
        
        if (anexo.nivelesDesempeno && anexo.nivelesDesempeno.length > 0) {
          children.push(new Paragraph({ spacing: { before: 120, after: 60 } }));
          const nivelesRows = [
            new TableRow({
              children: [
                createCell('Nivel de Desempeño', true, "f1f5f9", 1, undefined, 30),
                createCell('Descripción', true, "f1f5f9", 1, undefined, 70),
              ]
            })
          ];
          
          anexo.nivelesDesempeno.forEach((nivel: any) => {
            nivelesRows.push(new TableRow({
              children: [
                createCell(renderValue(nivel.nivel), true),
                createCell(renderValue(nivel.descripcion))
              ]
            }));
          });
          
          children.push(new Table({
            width: { size: 10800, type: WidthType.DXA },
            columnWidths: [3240, 7560],
            layout: TableLayoutType.AUTOFIT,
            rows: nivelesRows
          }));
        }
        
        children.push(new Paragraph({ spacing: { after: 180 } }));
      });
    }

    // Sección 7: Referencias Pedagógicas y Libros SEP
    if (referenciasLibrosSEP.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: "7. Referencias a Libros de la SEP", bold: true, size: 26, color: "0369a1" })],
        spacing: { before: 300, after: 120 }
      }));
      
      const refRows = [
        new TableRow({
          children: [
            createCell('Libro', true, "1e293b", 1, "ffffff", 30),
            createCell('Actividad / Proyecto Relacionado', true, "1e293b", 1, "ffffff", 45),
            createCell('Páginas', true, "1e293b", 1, "ffffff", 25),
          ]
        })
      ];
      
      referenciasLibrosSEP.forEach((ref: any) => {
        const searchUrl = `https://libros.conaliteg.gob.mx/busqueda?q=${encodeURIComponent(ref.actividadRelacionada || obj.proyectoIntegrador?.titulo || '')}`;
        refRows.push(new TableRow({
          children: [
            createCell(renderValue(ref.libro), true, "f8fafc"),
            new TableCell({
              columnSpan: 1,
              margins: { top: 120, bottom: 120, left: 150, right: 150 },
              children: [
                new Paragraph({ children: [new TextRun({ text: renderValue(ref.actividadRelacionada), size: 20 })], spacing: { after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: `Enlace de Búsqueda Conaliteg:\n${searchUrl}`, size: 18, color: "2563eb" })] })
              ]
            }),
            createCell(renderValue(ref.paginas))
          ]
        }));
      });

      children.push(new Table({
        width: { size: 10800, type: WidthType.DXA },
        columnWidths: [3240, 4860, 2700],
        layout: TableLayoutType.AUTOFIT,
        rows: refRows
      }));
      children.push(new Paragraph({ spacing: { after: 240 } }));
    }

    // Firmas Oficiales
    children.push(new Paragraph({ spacing: { before: 400 } }));
    children.push(new Table({
      width: { size: 10800, type: WidthType.DXA },
      columnWidths: [5400, 5400],
      layout: TableLayoutType.AUTOFIT,
      rows: [
        new TableRow({
          children: [
            createCell(`______________________________\nProfesor(a) de Grupo\n${renderValue(firmas.docente || datos.nombreDocente)}`, false, undefined, 1, undefined, 50),
            createCell(`______________________________\nDirector(a) de la Escuela\n${renderValue(firmas.director || datos.director)}`, false, undefined, 1, undefined, 50),
          ]
        })
      ]
    }));

    doc = new Document({
      sections: [{ 
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children
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

export function downloadCustomFormatGuide() {
  if (typeof window === 'undefined') return;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Guía de Etiquetas para Formatos Personalizados",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Instrucciones de Uso:", bold: true, size: 24 }),
          ],
          spacing: { before: 200, after: 120 }
        }),
        new Paragraph({
          text: "1. Abre el documento oficial de planeación que usa tu escuela.",
          spacing: { after: 120 }
        }),
        new Paragraph({
          text: "2. Busca los espacios en blanco donde normalmente escribes la información.",
          spacing: { after: 120 }
        }),
        new Paragraph({
          text: "3. Reemplaza esos espacios vacíos copiando y pegando las etiquetas exactas de la lista de abajo (incluyendo las llaves dobles {{ }}).",
          spacing: { after: 120 }
        }),
        new Paragraph({
          text: "4. Guarda tu documento y súbelo en la sección de Ajustes de LiberaPro.",
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Etiquetas Disponibles:", bold: true, size: 24 }),
          ],
          spacing: { before: 200, after: 120 }
        }),
        new Paragraph({ text: "{{docente}} - Nombre del maestro", spacing: { after: 100 } }),
        new Paragraph({ text: "{{escuela}} - Nombre de la escuela", spacing: { after: 100 } }),
        new Paragraph({ text: "{{cct}} - Clave del Centro de Trabajo", spacing: { after: 100 } }),
        new Paragraph({ text: "{{turno}} - Matutino / Vespertino", spacing: { after: 100 } }),
        new Paragraph({ text: "{{director}} - Nombre del director(a)", spacing: { after: 100 } }),
        new Paragraph({ text: "{{grado}} - Grado y Grupo (Ej. 2° A)", spacing: { after: 100 } }),
        new Paragraph({ text: "{{fase}} - Fase NEM", spacing: { after: 100 } }),
        new Paragraph({ text: "{{periodo}} - Periodo de aplicación", spacing: { after: 100 } }),
        new Paragraph({ text: "{{mes}} - Mes del plan", spacing: { after: 300 } }),
        new Paragraph({ text: "{{tema}} - Título del Proyecto", spacing: { after: 100 } }),
        new Paragraph({ text: "{{metodologia}} - Metodología elegida", spacing: { after: 100 } }),
        new Paragraph({ text: "{{proposito}} - Propósito del proyecto", spacing: { after: 100 } }),
        new Paragraph({ text: "{{justificacion}} - Justificación y Diagnóstico", spacing: { after: 100 } }),
        new Paragraph({ text: "{{evaluacion}} - Estrategia de Evaluación", spacing: { after: 400 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "Para listar las Fases de la Metodología (Secuencia Integrada):", bold: true, size: 24 }),
          ],
          spacing: { before: 200, after: 120 }
        }),
        new Paragraph({
          text: "Debes envolver la sección de actividades entre las etiquetas {#fases} y {/fases}. El sistema repetirá todo lo que esté adentro por cada fase del proyecto.",
          spacing: { after: 120 }
        }),
        new Paragraph({ text: "{#fases}", bold: true }),
        new Paragraph({ text: "Paso/Fase: {{pasoMetodologia}}" }),
        new Paragraph({ text: "Campos Formativos Involucrados: {{camposFormativosInvolucrados}}" }),
        new Paragraph({ text: "Activación: {{activacion}}" }),
        new Paragraph({ text: "Acción y Construcción: {{construccion}}" }),
        new Paragraph({ text: "Reflexión / Metacognición: {{metacognicion}}" }),
        new Paragraph({ text: "Materiales y Recursos: {{materialesYRecursos}}" }),
        new Paragraph({ text: "{/fases}", bold: true, spacing: { after: 400 } }),
      ]
    }]
  });

  Packer.toBlob(doc).then((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = url;
    fileDownload.download = `Guia_Formatos_Personalizados_LiberaPro.docx`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    URL.revokeObjectURL(url);
  });
}
