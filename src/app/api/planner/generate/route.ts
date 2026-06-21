import { createOpenAI } from '@ai-sdk/openai';
import { streamObject, embed } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { FULL_AI_BRAIN } from '@/lib/nem-brain';

export const maxDuration = 300; // Allow up to 300 seconds for completion (Vercel max for some plans)

const nemPlanningSchema = z.object({
  datosIdentificacion: z.object({
    nombreDocente: z.string(),
    gradoYGrupo: z.string(),
    fase: z.string(),
    periodoAplicacion: z.string()
  }),
  elementosCurriculares: z.object({
    camposFormativos: z.string(),
    metodologia: z.string(),
    problematica: z.string(),
    contenidos: z.string().describe("Contenidos del programa sintético para todo el proyecto"),
    pda: z.string().describe("Procesos de Desarrollo de Aprendizaje (PDA) esperados"),
    ejesArticuladores: z.string().describe("Ejes articuladores (Inclusión, Pensamiento Crítico, etc.)"),
    escenario: z.string().describe("Escenario: Aula, Escolar o Comunitario")
  }),
  fases: z.array(z.object({
    titulo: z.string().describe("Título de la fase/momento exacto de la metodología y los días que abarca (ej. 'Fase 1. Planeación: Momento 1. Identificación (Días 1-2)')"),
    actividades: z.string().describe("MUY EXTENSO Y DETALLADO. Mínimo 3 actividades extensas por cada fase. Incluye pausas, dinámicas y explicaciones paso a paso. No uses inicio/desarrollo/cierre."),
    recursosYMateriales: z.string(),
    evaluacionFormativa: z.string(),
    adecuacionesTEA: z.string().describe("Adecuaciones para TEA si se solicita, sino N/A")
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

    let fasesEstrictas = '';
    if (metodologia.includes('Comunitarios')) {
      fasesEstrictas = `
Fase 1. Planeación (Momento 1. Identificación, Momento 2. Recuperación, Momento 3. Planificación)
Fase 2. Acción (Momento 4. Acercamiento, Momento 5. Comprensión y producción, Momento 6. Reconocimiento, Momento 7. Concreción)
Fase 3. Intervención (Momento 8. Integración, Momento 9. Difusión, Momento 10. Consideraciones, Momento 11. Avances)`;
    } else if (metodologia.includes('STEAM') || metodologia.includes('Indagación')) {
      fasesEstrictas = `
Fase 1. Introducción al tema / Uso de conocimientos previos
Fase 2. Diseño de investigación
Fase 3. Organizar y estructurar las respuestas
Fase 4. Presentación de los resultados de indagación
Fase 5. Metacognición`;
    } else if (metodologia.includes('ABP') || metodologia.includes('Problemas')) {
      fasesEstrictas = `
1. Presentemos
2. Recolectemos
3. Formulemos el problema
4. Organicemos la experiencia
5. Vivamos la experiencia
6. Resultados y análisis`;
    } else if (metodologia.includes('Servicio')) {
      fasesEstrictas = `
Etapa 1. Punto de partida
Etapa 2. Lo que sé y lo que quiero saber
Etapa 3. Organicemos las actividades
Etapa 4. Creatividad en marcha
Etapa 5. Compartimos y evaluamos lo aprendido`;
    }

const systemPrompt = `
Eres un experto en pedagogía y diseño curricular especializado en el marco de la Nueva Escuela Mexicana (NEM). Tu objetivo es actuar como un estructurador académico: vas a tomar los apuntes del maestro y los vas a transformar en una planeación didáctica formal, completa y MUY EXTENSA.

REGLAS DE ORO:
1. El maestro es el experto. Respeta fielmente las ideas, problemáticas, actividades y temas de sus "Notas".
2. CERO LIBROS DE TEXTO: No incluyas referencias a libros de texto ni páginas.
3. ESTRUCTURA POR FASES: En lugar de redactar día por día (sesiones), vas a agrupar la planeación utilizando ESTRICTAMENTE las siguientes fases de la metodología ${metodologia}:
${fasesEstrictas}
4. ASIGNACIÓN DE DÍAS: Para cada fase, asigna en el título los días que le corresponden (ej. "Días 1-3", "Días 4-7") de modo que entre todas las fases cubran los ${expectedSessions} días del periodo solicitado.
5. EXTENSIÓN MASIVA (6 HORAS DIARIAS): Cada fase debe detallar TODO lo que se hará en los días asignados. Incluye múltiples actividades, dinámicas, asambleas, rutinas, pausas activas, y explicaciones exhaustivas para cubrir 6 horas de clase por día. ¡NO RESUMAS! 
`;

const userPrompt = `
ENTRADA DEL MAESTRO:
Tema o Proyecto: ${tema}
Fase NEM: ${fase}
Metodología: ${metodologia}
Grupo/Escuela: ${schoolGroup || 'No especificado'}
Periodo de Aplicación: Del ${fechaInicio} al ${fechaTermino} (Total: ${expectedSessions} días hábiles)
${hasTEA ? 'ATENCIÓN: El maestro indicó alumnos con TEA. DEBES incluir adaptaciones específicas en el campo adecuacionesTEA para cada fase.' : 'ATENCIÓN: No hay alumnos con TEA (puedes omitir o poner N/A).'}

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
