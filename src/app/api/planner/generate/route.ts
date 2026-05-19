import { openai } from '@ai-sdk/openai';
import { streamObject, embed } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60; // Allow up to 60 seconds for completion

const planningSchema = z.object({
  vistaRapida: z.array(z.object({
    dia: z.string().describe("Día de la semana, ej. Lunes"),
    tema_central: z.string().max(30).describe("Máximo 5 palabras"),
    recurso_sep_clave: z.string(),
    competencia_nem: z.string(),
  })).describe("Vista rápida At-a-Glance de la semana"),
  diaADia: z.array(z.object({
    dia: z.string(),
    inicio: z.string().describe("Actividad detonadora de inicio"),
    desarrollo: z.string().describe("Actividad principal"),
    cierre: z.string().describe("Evaluación o reflexión de cierre"),
    material_estandar: z.string().describe("Material de aula normal"),
    material_eco_ally: z.string().describe("Material sustentable/reciclado menor a 50 MXN (Ej. botellas, cartón)"),
    conaliteg_cita: z.string().describe("Referencia exacta en formato [Nombre del Libro] - Pág [X]")
  })).describe("Desglose riguroso día a día de la planeación")
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Comentar esto localmente si se está probando sin autenticación
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { fase, proyecto, principio, duracion, campoFormativo, metodologia, tema } = await req.json();

    // 1. Generar Embedding para la consulta RAG
    const query = `Fase: ${fase}. Campo Formativo: ${campoFormativo}. Tema: ${tema}. Proyecto: ${proyecto}. Principio: ${principio}.`;
    
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
      Eres un Maestro Experto con 20 años de experiencia en la educación pública mexicana. 
      Estás planeando para un maestro que necesita practicidad absoluta.
      
      Utiliza el siguiente contexto RAG extraído del currículo de la NEM para alinear tu respuesta a la Nueva Escuela Mexicana:
      <contexto>
      ${contextText}
      </contexto>
      
      Parámetros estrictos de la planeación:
      - Campo Formativo: ${campoFormativo}
      - Metodología Sociocrítica: ${metodologia}
      - Eje Articulador principal: ${principio}
      - Duración: ${duracion}
      
      Prioriza la metodología indicada y asegúrate de que las opciones 'Eco-Ally' sean realistas para zonas con bajos recursos.
    `;

    const result = await streamObject({
      model: openai('gpt-4o'),
      schema: planningSchema,
      system: systemPrompt,
      prompt: `Genera la planeación estructurada para el tema/contenido: "${tema}" dentro del proyecto general: "${proyecto}". Aplica la metodología de ${metodologia}.`,
      async onFinish({ object }) {
        if (object) {
          try {
            await supabase.from('user_generations').insert({
              user_id: user.id,
              type: 'planeacion',
              content: object
            });
          } catch (e) {
            console.error('Error saving generation to db', e);
          }
        }
      }
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Error generating plan:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
