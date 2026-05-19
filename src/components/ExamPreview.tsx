import React from 'react';

export const ExamPreview = React.forwardRef<HTMLDivElement, { data: any }>(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      className="bg-white text-black p-10 max-w-4xl mx-auto shadow-2xl min-h-[1056px] print:shadow-none print:p-0 print:m-0"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Encabezado Institucional (Print-Ready) */}
      <div className="border-2 border-black p-4 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold uppercase mb-2">Escuela Primaria / Secundaria</h1>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="border-b border-black pb-1">
                <span className="font-bold mr-2">Alumno:</span>
              </div>
              <div className="border-b border-black pb-1">
                <span className="font-bold mr-2">Fecha:</span>
              </div>
              <div className="border-b border-black pb-1">
                <span className="font-bold mr-2">Grado y Grupo:</span>
              </div>
              <div className="border-b border-black pb-1">
                <span className="font-bold mr-2">Docente:</span>
              </div>
            </div>
          </div>
          <div className="w-32 ml-4 border-2 border-black h-24 flex flex-col">
            <div className="bg-gray-200 border-b-2 border-black text-center font-bold text-xs py-1">CALIFICACIÓN</div>
            <div className="flex-1 flex items-center justify-center text-3xl font-bold">
              {/* Espacio para la calificación */}
            </div>
          </div>
        </div>
        <div className="text-center font-bold uppercase tracking-widest text-lg border-t-2 border-black pt-2">
          {data.titulo || 'Evaluación de Proyecto NEM'}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="mb-6">
        <p className="font-bold text-sm mb-1">Instrucciones:</p>
        <p className="text-sm italic">{data.instrucciones}</p>
      </div>

      {/* Rúbrica */}
      {data.tipoEvaluacion === 'rubrica' && data.rubrica && (
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left w-1/4">Criterio a Evaluar</th>
              <th className="border border-black p-2 text-center w-1/4">Sobresaliente (3 pts)</th>
              <th className="border border-black p-2 text-center w-1/4">Satisfactorio (2 pts)</th>
              <th className="border border-black p-2 text-center w-1/4">En Proceso (1 pt)</th>
            </tr>
          </thead>
          <tbody>
            {data.rubrica.map((item: any, idx: number) => (
              <tr key={idx} className="break-inside-avoid">
                <td className="border border-black p-3 font-bold">{item.criterio}</td>
                <td className="border border-black p-3 text-sm">{item.sobresaliente}</td>
                <td className="border border-black p-3 text-sm">{item.satisfactorio}</td>
                <td className="border border-black p-3 text-sm">{item.en_proceso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Examen Reflexivo */}
      {data.tipoEvaluacion === 'examen' && data.examen && (
        <div className="space-y-8">
          {data.examen.map((item: any, idx: number) => (
            <div key={idx} className="break-inside-avoid">
              <p className="font-bold text-sm mb-3">
                {idx + 1}. {item.pregunta}
              </p>
              
              {item.tipo === 'opcion_multiple' && item.opciones && (
                <div className="ml-4 space-y-2">
                  {item.opciones.map((opcion: string, oIdx: number) => (
                    <div key={oIdx} className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full border border-black"></div>
                      <span className="text-sm">{opcion}</span>
                    </div>
                  ))}
                </div>
              )}

              {item.tipo === 'abierta' && (
                <div className="mt-4 space-y-6">
                  <div className="border-b border-gray-400 w-full"></div>
                  <div className="border-b border-gray-400 w-full"></div>
                  <div className="border-b border-gray-400 w-full"></div>
                </div>
              )}

              {item.tipo === 'relacionar' && item.opciones && (
                <div className="ml-4 grid grid-cols-2 gap-4">
                  {item.opciones.map((opcion: string, oIdx: number) => (
                    <div key={oIdx} className="flex items-center space-x-2">
                      <div className="w-6 h-6 border border-black"></div>
                      <span className="text-sm">{opcion}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* La respuesta correcta solo se muestra en pantalla, NO en la impresión de alumnos */}
              <div className="mt-2 text-xs text-gray-400 print:hidden">
                Respuesta esperada: {item.respuesta_correcta}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ExamPreview.displayName = 'ExamPreview';
