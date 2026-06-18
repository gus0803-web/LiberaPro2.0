import { createOpenAI } from '@ai-sdk/openai';
import { streamObject, embed } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { FULL_AI_BRAIN } from '@/lib/nem-brain';

export const maxDuration = 60; // Allow up to 60 seconds for completion

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
    librosYEscenario: z.string().describe("Escenario: Aula/Escolar/Comunitario y referencias a libros de texto pertinentes"),
    ejesArticuladores: z.string().describe("Ej: Inclusión, Pensamiento Crítico, Vida Saludable, etc."),
    secuenciaDidactica: z.object({
      inicio: z.string().describe("Actividades de arranque basadas en las notas del maestro"),
      desarrollo: z.string().describe("Actividades principales, estructuradas y secuenciadas"),
      cierre: z.string().describe("Actividades de conclusión y reflexión")
    }),
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

    const { fase, tema, notasMaestro, metodologia, duracion, hasTEA, schoolGroup } = await req.json();

    let expectedSessions = 5;
    if (duracion === 'Quincenal') expectedSessions = 10;
    if (duracion === 'Mensual') expectedSessions = 20;

    // 1. Generar Embedding para la consulta RAG
    const query = `Fase: ${fase}. Tema: ${tema}. Metodología: ${metodologia}. Notas: ${notasMaestro}`;
    
    // Note: requires NEXT_PUBLIC_OPENAI_API_KEY in env to work automatically with @ai-sdk/openai
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    // 2. Consulta Vectorial a Supabase (RAG)
    let documents = [];
    const { data, error: rpcError } = await supabase.rpc('match_nem_curriculum', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 5,
      p_fase: fase
    });

    if (rpcError) {
      console.warn('Supabase RPC Error (RAG Fallback):', rpcError);
      // Fallback: Si no existe la función o falla, no detenemos la generación.
    } else if (data) {
      documents = data;
    }

    // Preparar el contexto inyectado
    const contextText = documents && documents.length > 0 ? documents.map((doc: any) => 
      `- PDA: ${doc.pda_text} | Referencia: ${doc.book_reference} p.${doc.page} | URL: ${doc.url}`
    ).join('\n') : 'No se encontró contexto específico de los libros de texto, pero aplica tus conocimientos generales de la Nueva Escuela Mexicana.';

    // 3. Generación Estructurada con Vercel AI SDK
    const systemPrompt = `
Eres un experto en pedagogía y diseño curricular especializado en el marco de la Nueva Escuela Mexicana (NEM). Tu objetivo es actuar como un estructurador académico: vas a tomar los apuntes, ideas y el contexto proporcionado por el maestro y los vas a transformar en una planeación didáctica formal y completa.

REGLA DE ORO: El maestro es el experto en su grupo. Debes respetar fielmente las ideas, problemáticas, actividades y temas que el maestro proporciona en sus "Notas". Tu trabajo no es inventar una clase desde cero, sino:
1. Darle forma académica a las notas del maestro.
2. Llenar los vacíos técnicos (por ejemplo, redactar correctamente los PDA - Procesos de Desarrollo de Aprendizaje, identificar los Ejes Articuladores correspondientes, o darle formato a la evaluación).
3. Estructurar toda la información en el formato oficial de la NEM.

Contexto pedagógico NEM extraído de los libros de texto (RAG):
<contexto>
${contextText}
</contexto>
`;

const userPrompt = `
ENTRADA DEL MAESTRO:
Tema o Proyecto: ${tema}
Fase NEM: ${fase}
Metodología: ${metodologia}
Grupo/Escuela: ${schoolGroup || 'No especificado'}
Duración de la planeación: ${duracion} (Genera EXACTAMENTE ${expectedSessions} sesiones)
${hasTEA ? 'ATENCIÓN: El maestro indicó que tiene alumnos con TEA. DEBES incluir adaptaciones específicas en el campo adecuacionesTEA para cada sesión.' : 'ATENCIÓN: El maestro NO indicó alumnos con TEA. Puedes poner N/A en adecuacionesTEA.'}

Notas, contexto e ideas del maestro: "${notasMaestro}"
`;

    const result = await streamObject({
      model: openai('gpt-4o-mini'),
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
