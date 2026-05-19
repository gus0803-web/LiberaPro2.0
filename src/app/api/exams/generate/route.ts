import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

const examSchema = z.object({
  tipoEvaluacion: z.enum(['rubrica', 'examen']),
  titulo: z.string().describe("Título de la evaluación"),
  instrucciones: z.string().describe("Instrucciones claras para el alumno"),
  rubrica: z.array(z.object({
    criterio: z.string().describe("Criterio a evaluar (Ej. Trabajo en equipo)"),
    sobresaliente: z.string().describe("Nivel sobresaliente"),
    satisfactorio: z.string().describe("Nivel satisfactorio"),
    en_proceso: z.string().describe("Nivel en proceso")
  })).optional().describe("Rellenar solo si el formato es Rúbrica de Proyecto"),
  examen: z.array(z.object({
    pregunta: z.string().describe("Pregunta reflexiva o conceptual"),
    tipo: z.enum(['opcion_multiple', 'abierta', 'relacionar']),
    opciones: z.array(z.string()).optional().describe("Array de 3 o 4 opciones (solo si es opción múltiple)"),
    respuesta_correcta: z.string().describe("La respuesta correcta (oculta al alumno)")
  })).optional().describe("Rellenar solo si el formato es Examen Reflexivo")
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { formato } = await req.json(); // "rubrica" | "examen"

    // 1. Obtener la última planeación generada por el usuario
    const { data: history, error: historyError } = await supabase
      .from('user_generations')
      .select('content')
      .eq('user_id', user.id)
      .eq('type', 'planeacion')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (historyError || !history) {
      return new Response('No se encontró una planeación previa. Genera una planeación primero.', { status: 404 });
    }

    const planeacionContext = JSON.stringify(history.content);

    // 2. Generación Estructurada
    const systemPrompt = `
      Eres un Maestro Experto Evaluador de la Nueva Escuela Mexicana.
      Tu tarea es generar una evaluación formativa basada EXACTAMENTE en esta planeación previa del docente:
      <planeacion>
      ${planeacionContext}
      </planeacion>
      
      El usuario ha solicitado el formato: ${formato === 'rubrica' ? 'Rúbrica de Proyecto' : 'Examen Reflexivo'}.
      Adapta el contenido para evaluar los aprendizajes esperados, el tema central y los proyectos de esta planeación específica.
      Genera contenido apropiado, con lenguaje claro y enfoque en la NEM.
    `;

    const result = await streamObject({
      model: openai('gpt-4o'),
      schema: examSchema,
      system: systemPrompt,
      prompt: `Genera la evaluación en el formato: ${formato}.`,
      async onFinish({ object }) {
        if (object) {
          try {
            await supabase.from('user_generations').insert({
              user_id: user.id,
              type: 'examen',
              content: object
            });
          } catch (e) {
            console.error('Error saving exam to db', e);
          }
        }
      }
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Error generating exam:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
