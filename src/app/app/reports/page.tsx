'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { FileBarChart, Printer, Calendar as CalendarIcon, Download, Clock, School, CheckCircle2, CheckSquare, Square, Filter } from 'lucide-react';
import { loadAgendaItems, AgendaItem } from '@/lib/agenda';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, HeadingLevel } from 'docx';

export default function ReportsPage() {
  const { language } = useTheme();
  const isEs = language === 'es';
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Estado para la selección múltiple de meses (índices 0 a 11)
  const [selectedMonths, setSelectedMonths] = useState<number[]>([currentMonthIndex]);

  useEffect(() => {
    loadAgendaItems().then(data => {
      setItems(data);
      setIsLoading(false);
    });
  }, []);

  const toggleMonth = (monthIndex: number) => {
    if (selectedMonths.includes(monthIndex)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter(m => m !== monthIndex));
      }
    } else {
      setSelectedMonths([...selectedMonths, monthIndex].sort((a, b) => a - b));
    }
  };

  const selectAllMonths = () => {
    if (selectedMonths.length === 12) {
      setSelectedMonths([currentMonthIndex]);
    } else {
      setSelectedMonths([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    }
  };

  // Filtrar planeaciones según los meses seleccionados por el docente
  const planesFiltrados = items.filter(item => {
    if (item.type !== 'planeacion') return false;
    const d = new Date(item.date);
    return selectedMonths.includes(d.getMonth());
  });

  const totalSesiones = planesFiltrados.reduce((acc, plan) => {
    const sesiones = plan.metadata?.object?.secuenciasDidacticas || plan.metadata?.object?.sesiones;
    if (Array.isArray(sesiones)) return acc + sesiones.length;
    return acc + 5;
  }, 0);

  const horasAhorradas = planesFiltrados.length * 2;

  // AGRUPACIÓN POR SALÓN (GRADO Y GRUPO)
  const groupedBySalon: Record<string, AgendaItem[]> = {};
  planesFiltrados.forEach(plan => {
    const ident = plan.metadata?.object?.datosIdentificacion;
    const groupKey = plan.metadata?.schoolGroup || ident?.gradoYGrupo || 'Salón General (2º A)';
    if (!groupedBySalon[groupKey]) {
      groupedBySalon[groupKey] = [];
    }
    groupedBySalon[groupKey].push(plan);
  });

  // Si no hay agrupaciones pero hay items
  if (Object.keys(groupedBySalon).length === 0 && planesFiltrados.length > 0) {
    groupedBySalon['Salón 2º A'] = planesFiltrados;
  }

  const handlePrint = () => {
    window.print();
  };

  // Nombres de los meses seleccionados formateados
  const selectedMonthsLabel = selectedMonths.length === 12
    ? 'Todo el Ciclo Escolar (12 Meses)'
    : selectedMonths.map(m => monthNames[m]).join(', ');

  // EXPORTACIÓN A ARCHIVO WORD (.docx) MULTIMES REAL
  const handleExportDocx = async () => {
    setIsExportingDocx(true);

    try {
      const rows: TableRow[] = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Fecha", bold: true, color: "FFFFFF" })] })], shading: { fill: "1E293B" } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Salón / Grupo", bold: true, color: "FFFFFF" })] })], shading: { fill: "1E293B" } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tema / Proyecto Integrador", bold: true, color: "FFFFFF" })] })], shading: { fill: "1E293B" } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Fase NEM", bold: true, color: "FFFFFF" })] })], shading: { fill: "1E293B" } }),
          ]
        })
      ];

      Object.entries(groupedBySalon).forEach(([salonName, planList]) => {
        rows.push(
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 4,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: `📍 SALÓN: ${salonName} (${planList.length} Planeaciones)`, bold: true, color: "0F766E" })]
                  })
                ],
                shading: { fill: "F0FDF4" }
              })
            ]
          })
        );

        planList.forEach(plan => {
          const ident = plan.metadata?.object?.datosIdentificacion;
          rows.push(
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(plan.date || 'Sin fecha')] }),
                new TableCell({ children: [new Paragraph(salonName)] }),
                new TableCell({ children: [new Paragraph(plan.title || 'Proyecto Integrador')] }),
                new TableCell({ children: [new Paragraph(ident?.fase || 'Fase 3')] }),
              ]
            })
          );
        });
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "REPORTE ADMINISTRATIVO DE DESEMPEÑO Y PLANEACIÓN NEM",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER
              }),
              new Paragraph({
                text: `Ciclo Escolar ${currentYear} | Meses Seleccionados: ${selectedMonthsLabel}`,
                alignment: AlignmentType.CENTER
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Total Planeaciones: ${planesFiltrados.length}  |  Total Sesiones: ${totalSesiones}  |  Horas Ahorradas: ${horasAhorradas} hrs`, bold: true })
                ]
              }),
              new Paragraph({ text: "" }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                text: "Documento oficial generado por la Plataforma LiberaPro NEM para comprobación curricular ante Dirección y Supervisión Escolar.",
                alignment: AlignmentType.CENTER
              })
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Administrativo_${selectedMonths.length}_Meses_${currentYear}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al exportar archivo DOCX:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando métricas de reportes por salón...</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 print:hidden">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
            <FileBarChart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Reporte Administrativo por Salón</h1>
            <p className="text-slate-500 font-medium mt-1">Selecciona uno o múltiples meses para consultar y descargar tu informe de avance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {isExportingDocx ? 'Generando Archivo...' : 'Descargar Archivo Word (.docx)'}
          </button>

          <button 
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
          >
            <Printer className="w-5 h-5" />
            Imprimir / Vista Previa
          </button>
        </div>
      </div>

      {/* SELECTOR MÚLTIPLE DE MESES */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            Seleccionar Mes(es) a Consultar y Exportar:
          </label>
          
          <button
            type="button"
            onClick={selectAllMonths}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors"
          >
            {selectedMonths.length === 12 ? 'Deseleccionar Todos' : 'Seleccionar Todo el Ciclo Escolar (12 Meses)'}
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {monthNames.map((mName, idx) => {
            const isSelected = selectedMonths.includes(idx);
            return (
              <button
                key={mName}
                type="button"
                onClick={() => toggleMonth(idx)}
                className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between gap-1.5 ${isSelected ? 'bg-emerald-900 text-white border-emerald-800 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                <span>{mName}</span>
                {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Printable Report Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Reporte de Desempeño y Avance Curricular</h2>
            <p className="text-base text-slate-600 mt-2 font-medium">
              Ciclo Escolar {currentYear} | <strong>Meses Seleccionados:</strong> <span className="text-emerald-700 font-bold">{selectedMonthsLabel}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Generado por</p>
            <p className="text-xl font-bold text-slate-800">Plataforma LiberaPro NEM</p>
          </div>
        </div>

        {/* Métricas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileBarChart className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900">{planesFiltrados.length}</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Planeaciones Entregadas</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900">{totalSesiones}</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Sesiones Diseñadas</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900">{horasAhorradas} <span className="text-lg text-slate-500">hrs</span></h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Trabajo Administrativo Ahorrado</p>
          </div>
        </div>

        {/* LISTADO DE ACTIVIDADES AGRUPADAS POR SALÓN (GRADO Y GRUPO) */}
        <div className="space-y-8">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 border-b pb-4">
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">✓</span>
            Desglose de Actividades por Salón ({selectedMonthsLabel})
          </h3>

          {Object.keys(groupedBySalon).length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay planeaciones generadas para los meses seleccionados.</p>
          ) : (
            Object.entries(groupedBySalon).map(([salonName, planList]) => (
              <div key={salonName} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <School className="w-5 h-5 text-emerald-600" />
                    Salón / Grupo: <span className="text-emerald-700 font-extrabold">{salonName}</span>
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                    {planList.length} Planeaciones
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th className="py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tema / Proyecto Integrador</th>
                        <th className="py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Fase NEM</th>
                        <th className="py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60">
                      {planList.map(plan => {
                        const ident = plan.metadata?.object?.datosIdentificacion;
                        return (
                          <tr key={plan.id} className="hover:bg-white transition-colors">
                            <td className="py-3 px-3 text-xs font-medium text-slate-900">{plan.date}</td>
                            <td className="py-3 px-3 text-xs font-bold text-slate-800">{plan.title}</td>
                            <td className="py-3 px-3 text-xs text-slate-600">{ident?.fase || 'Fase 3'}</td>
                            <td className="py-3 px-3 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aplicada
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-slate-400 text-xs">
          <p>Este documento oficial es generado por la Plataforma LiberaPro NEM para comprobar el avance curricular por Salón ante Dirección y Supervisión Escolar.</p>
        </div>
      </div>
    </div>
  );
}
