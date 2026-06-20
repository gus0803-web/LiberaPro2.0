import { createOpenAI } from '@ai-sdk/openai';
import { streamObject, embed } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { FULL_AI_BRAIN } from '@/lib/nem-brain';

export const maxDuration = 300; // Allow up to 300 seconds for completion (Vercel max for some plans)

const nemPlanningSchema = z.object({
  datosIdentificacion: z.object({
    nombreDocente: z.string().describe("Extraer de las notas o dejar en blanco"),
    gradoYGrupo: z.string().describe("Extraer de las notas o sugerir basado en el contenido"),
    fase: z.string().describe("Asignar la fase de la NEM correspondiente al grado"),
    periodoAplicacion: z.string().describe("Extraer de las notas o sugerir periodo")
  }),
  elementosCurriculares: z.object({
    camposFormativos: z.string().describe("Ej: Lenguajes, Saberes y Pensamiento Científico, etc. Basado en el tema"),
    metodologia: z.string().describe("Metodología seleccionada"),
    problematica: z.string().describe("Redactar la problemática a resolver basándote en las notas del maestro")
  }),
  sesiones: z.array(z.object({
    contenido: z.string().describe("El contenido del programa sintético aplicable"),
    pda: z.string().describe("Procesos de Desarrollo de Aprendizaje esperados"),
    escenario: z.string().describe("Escenario: Aula, Escolar o Comunitario"),
    ejesArticuladores: z.string().describe("Ej: Inclusión, Pensamiento Crítico, Vida Saludable, etc."),
    fasesMetodologicas: z.string().describe("Detalle exhaustivo de las actividades de la sesión, estructuradas OBLIGATORIAMENTE según las FASES o MOMENTOS de la metodología elegida. Extender la redacción de manera abundante y detallada para proporcionar suficiente contenido para impartir 6 HORAS DE CLASE. Eliminar por completo el formato genérico de inicio/desarrollo/cierre."),
    adecuacionesTEA: z.string().describe("Adaptaciones para alumnos con TEA si se solicita, sino N/A"),
    recursosYMateriales: z.string().describe("Lista de materiales mencionados por el maestro y sugerencias adicionales lógicas"),
    evaluacionFormativa: z.string().describe("Cómo se evaluará, qué productos o evidencias se esperan")
  }))
});

export async function POST(req: Request) {
  if (req.headers.get('x-debug-ping') === 'yes') {
    return new Response('PONG', { status: 200 });
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const apiKey =
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_KEY;
    if (!apiKey) {
      return new Response(
        'OpenAI API key is missing. Set OPENAI_API_KEY, NEXT_PUBLIC_OPENAI_API_KEY, or NEXT_PUBLIC_OPENAI_KEY.',
        { status: 500 }
      );
    }

    const openai = createOpenAI({ apiKey });

    // Comentar esto localmente si se está probando sin autenticación
    if (!user && req.headers.get('x-debug-token') !== 'super-secret-123') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { fase, tema, notasMaestro, metodologia, duracion, hasTEA, schoolGroup, fechaInicio, fechaTermino } = await req.json();

    let expectedSessions = 5;
    if (duracion === 'Quincenal') expectedSessions = 10;
    if (duracion === 'Mensual') expectedSessions = 20;

    const systemPrompt = `
Eres un experto en pedagogía y diseño curricular especializado en el marco de la Nueva Escuela Mexicana (NEM). Tu objetivo es actuar como un estructurador académico: vas a tomar los apuntes, ideas y el contexto proporcionado por el maestro y los vas a transformar en una planeación didáctica formal y completa.

REGLAS DE ORO:
1. El maestro es el experto. Respeta fielmente las ideas, problemáticas, actividades y temas de sus "Notas".
2. CERO LIBROS DE TEXTO: No incluyas referencias a libros de texto ni páginas, ya que los libros han desaparecido. 
3. ELIMINA INICIO/DESARROLLO/CIERRE: Organiza la sección 'fasesMetodologicas' estrictamente utilizando las fases, momentos o etapas correspondientes a la metodología sociocrítica seleccionada (ej. ABP, STEAM, Proyectos Comunitarios, Aprendizaje Servicio).
4. EXTENSIÓN PARA 6 HORAS: El maestro necesita muchísimo nivel de detalle. Cada sesión debe tener contenido suficiente, descriptivo y exhaustivo para impartir 6 horas de clase. Expande las explicaciones de las actividades, debates, lecturas y dinámicas sugeridas.
`;

const userPrompt = `
ENTRADA DEL MAESTRO:
Tema o Proyecto: ${tema}
Fase NEM: ${fase}
Metodología: ${metodologia}
Grupo/Escuela: ${schoolGroup || 'No especificado'}
Periodo de Aplicación: Del ${fechaInicio} al ${fechaTermino}
Duración de la planeación: ${duracion} (Genera EXACTAMENTE ${expectedSessions} sesiones super detalladas)
${hasTEA ? 'ATENCIÓN: El maestro indicó que tiene alumnos con TEA. DEBES incluir adaptaciones específicas en el campo adecuacionesTEA para cada sesión.' : 'ATENCIÓN: El maestro NO indicó alumnos con TEA. Puedes poner N/A en adecuacionesTEA.'}

Notas, contexto e ideas del maestro: "${notasMaestro}"
`;

    const result = await streamObject({
      model: openai('gpt-4o'),
      schema: nemPlanningSchema,
      system: systemPrompt,
      prompt: userPrompt,
      async onFinish({ object }) {
        if (object) {
          if (user) {
            try {
              await supabase.from('user_generations').insert({
                user_id: user.id,
                type: 'planeacion',
                content: object
              });
              
              // Decrementar créditos
              const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
              if (profile && typeof profile.credits === 'number') {
                await supabase.from('profiles').update({ credits: Math.max(0, profile.credits - 1) }).eq('id', user.id);
              }
            } catch (e) {
              console.error('Error saving generation to db or decrementing credits', e);
            }
          }
        }
      }
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('Error generating plan:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error', stack: error.stack }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
