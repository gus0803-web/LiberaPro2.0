const fs = require('fs');
const file = 'src/app/app/calendar/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStart = `<section className="grid grid-cols-1 lg:grid-cols-2 gap-6">`;
const targetIndex = content.indexOf(targetStart);
if (targetIndex !== -1) {
  content = content.substring(0, targetIndex) + `<section className="grid grid-cols-1 gap-6">
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
                    <article key={item.id} className={\`rounded-3xl border p-5 shadow-sm bg-white \${getAgendaItemColor(item.type)}\`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] font-bold text-slate-500">{typeLabel(item.type, isEs)}</p>
                          <h4 className="mt-1 text-lg font-bold text-slate-900">{item.title}</h4>
                          {item.description && <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{item.description}</p>}
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
                              {(Array.isArray(item.metadata.object.diaADia) ? item.metadata.object.diaADia : [item.metadata.object.diaADia]).map((dia, i) => (
                                <div key={i} className="border-l-4 border-blue-500 pl-4 py-1">
                                  <h5 className="font-bold text-blue-700">{dia.dia || \`Día \${i + 1}\`}</h5>
                                  {dia.inicio && <p className="mt-2 text-xs"><strong>Inicio:</strong> {dia.inicio}</p>}
                                  {dia.desarrollo && <p className="mt-2 text-xs"><strong>Desarrollo:</strong> {dia.desarrollo}</p>}
                                  {dia.cierre && <p className="mt-2 text-xs"><strong>Cierre:</strong> {dia.cierre}</p>}
                                  {dia.material_estandar && <p className="mt-2 text-xs"><strong>Materiales:</strong> {dia.material_estandar}</p>}
                                  {dia.conaliteg_cita && <p className="mt-2 text-xs"><strong>Libro:</strong> {dia.conaliteg_cita}</p>}
                                </div>
                              ))}
                            </div>
                          ) : item.metadata?.materialContent ? (
                            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                              {item.metadata.materialContent}
                            </div>
                          ) : (
                            <pre className="whitespace-pre-wrap text-sm leading-6 overflow-x-auto">{item.description}</pre>
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
`;
  fs.writeFileSync(file, content);
  console.log("Replaced successfully");
} else {
  console.log("Target not found");
}
