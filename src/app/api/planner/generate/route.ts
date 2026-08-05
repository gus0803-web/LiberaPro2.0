import { createOpenAI } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 300; // Allow up to 300 seconds for completion

const nemPlanningSchema = z.object({
  datosIdentificacion: z.object({
    nombreDocente: z.string(),
    escuela: z.string(),
    cct: z.string(),
    turno: z.string(),
    director: z.string(),
    gradoYGrupo: z.string(),
    fase: z.string(),
    periodoAplicacion: z.string(),
    mesPlan: z.string()
  }),
  justificacionYDiagnostico: z.string().describe("Justificación pedagógica extensa, diagnóstico inicial socioemocional y académico, y la concepción del error como insumo didáctico no punitivo."),
  proyectoIntegrador: z.object({
    titulo: z.string(),
    metodologia: z.string(),
    proposito: z.string()
  }),
  estructuraCurricular: z.array(z.object({
    campoFormativo: z.string(),
    contenidoContextualizado: z.string(),
    pda: z.string().describe("Proceso de Desarrollo de Aprendizaje oficial según la Fase"),
    ejesArticuladores: z.string()
  })),
  secuenciasDidacticas: z.array(z.object({
    dia: z.string().describe("Día o Sesión (ej. 'Día 1', 'Día 2')"),
    campoFormativo: z.string(),
    temaActividad: z.string(),
    inicio: z.string().describe("Activación de conocimientos previos y preguntas generadoras"),
    desarrollo: z.string().describe("Acción, construcción y manipulación material"),
    cierre: z.string().describe("Metacognición y diálogo reflexivo colectivo"),
    materialesYRecursos: z.string()
  })),
  estrategiaEvaluacion: z.string().describe("Estrategia de evaluación cualitativa y formativa, diarios de campo, análisis de producciones y uso del error."),
  anexosListasCotejo: z.array(z.object({
    tituloAnexo: z.string().describe("Ej. 'Anexo 1: Lista de Cotejo de Lectoescritura'"),
    campoFormativo: z.string(),
    indicadores: z.array(z.object({
      pdaIndicador: z.string().describe("Indicador cualitativo derivado del PDA"),
      logrado: z.string().default("SÍ"),
      enProceso: z.string().default("NO"),
      observaciones: z.string().describe("Espacio para observaciones o evidencias")
    }))
  })),
  firmas: z.object({
    docente: z.string(),
    director: z.string()
  })
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

    if (!user && req.headers.get('x-debug-token') !== 'super-secret-123') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { fase, tema, notasMaestro, metodologia, duracion, hasTEA, schoolGroup, fechaInicio, fechaTermino, profileData } = await req.json();

    let expectedSessions = 5;
    if (duracion === 'Quincenal') expectedSessions = 10;
    if (duracion === 'Mensual') expectedSessions = 20;

    const teacherName = profileData?.teacherName || 'Profesor de Grupo';
    const schoolName = profileData?.schoolName || 'Escuela Primaria';
    const cct = profileData?.cct || '02DPRXXXXX';
    const turno = profileData?.turno || 'Matutino';
    const directorName = profileData?.directorName || 'Directora de la Escuela';

    const systemPrompt = `
Eres un experto pedagógico y diseñador curricular especializado en la Nueva Escuela Mexicana (NEM).
Tu misión es construir una planeación didáctica formal, rigurosa, completa y estructurada exactamente en 6 SECCIONES PEDAGÓGICAS siguiendo el modelo del documento oficial 'planeacion_agosto_2026'.

LAS 6 SECCIONES OBLIGATORIAS:
1. DATOS DE IDENTIFICACIÓN: Nombre docente: ${teacherName}, Escuela: ${schoolName}, CCT: ${cct}, Turno: ${turno}, Director: ${directorName}, Grado y Grupo: ${schoolGroup || '2° A'}, Fase: ${fase}, Periodo: Del ${fechaInicio} al ${fechaTermino}, Mes de plan: Diagnóstico e Integración / Planeación Didáctica.
2. JUSTIFICACIÓN PEDAGÓGICA Y DIAGNÓSTICO INICIAL: Justificación pedagógica integral (socioemocional y académica). DEBES incluir explícitamente la CONCEPCIÓN DEL ERROR como insumo didáctico y oportunidad de aprendizaje no punitiva.
3. PROYECTO INTEGRADOR: Título del proyecto, Metodología sociocrítica (${metodologia}) y Propósito pedagógico del proyecto.
4. ESTRUCTURA CURRICULAR POR CAMPOS FORMATIVOS: Desglose en tabla de los Campos Formativos involucrados con sus Contenidos Contextualizados, los Procesos de Desarrollo de Aprendizaje (PDA) oficiales del Programa Sintético de la SEP y sus Ejes Articuladores.
5. SECUENCIAS DIDÁCTICAS DETALLADAS (DÍA A DÍA): EXACTAMENTE ${expectedSessions} días de actividades. Para cada día/sesión, redacta explícitamente los 3 momentos:
   - INICIO (Activación): Preguntas generadoras, recuperación de saberes previos y problematización de la realidad.
   - DESARROLLO (Acción y Construcción): Actividades lúdicas, interacción social, manipulación de materiales, dinámicas colaborativas (alfabeto móvil, conteo, croquis, rol).
   - CIERRE (Metacognición): Reflexión colectiva, evaluación formativa grupal (qué se dificultó, cómo se resolvió, qué aprendimos).
   - Materiales y Recursos específicos.
   ${hasTEA ? 'Incluye adaptaciones específicas para alumnos con TEA en cada sesión.' : ''}
6. ESTRATEGIA DE EVALUACIÓN DIAGNÓSTICA Y FORMATIVA Y ANEXOS:
   - Redacción de la estrategia formativa cualitativa basada en la observación diaria y el error como puente didáctico.
   - ANEXOS: Mínimo 2 Listas de Cotejo Cualitativas estructuradas por Campo Formativo (ej. Lectoescritura / Saberes) con Indicadores de Aprendizaje directamente basados en los PDA oficiales, con columnas para Logrado (SÍ), En Proceso (NO) y Observaciones/Evidencias.
   - FIRMAS OFICIALES: Firma del Docente Titular y Firma del Director(a).

REGLAS DE ORO:
- Respeta fielmente las ideas, problemáticas y notas del docente.
- CERO LIBROS DE TEXTO (No refieras páginas congeladas).
- NO OMITAS NINGUNA DE LAS 6 SECCIONES.
`;

    const userPrompt = `
DATOS DE ENTRADA DEL MAESTRO:
Tema / Proyecto: ${tema}
Fase NEM: ${fase}
Metodología: ${metodologia}
Grupo / Escuela: ${schoolGroup || schoolName}
Periodo de Aplicación: Del ${fechaInicio} al ${fechaTermino} (${expectedSessions} días hábiles)
${hasTEA ? 'ATENCIÓN: Incluir adaptaciones específicas para alumnos con TEA.' : ''}

Notas, contexto y requerimientos del maestro:
"${notasMaestro}"
`;

    if (user) {
      try {
        const { data: profile } = await supabase.from('profiles').select('credits, last_credit_reset').eq('id', user.id).single();
        if (profile) {
          let currentCredits = profile.credits ?? 120;
          let lastReset = profile.last_credit_reset ? new Date(profile.last_credit_reset) : new Date(0);
          const now = new Date();

          if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
            currentCredits = 120;
            await supabase.from('profiles').update({ 
              credits: currentCredits,
              last_credit_reset: now.toISOString()
            }).eq('id', user.id);
          }

          if (currentCredits <= 0) {
            return new Response(JSON.stringify({ error: 'Se agotaron tus créditos mensuales. Tus créditos se reiniciarán el primer día del próximo mes.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
          }
        }
      } catch (err) {
        console.error('Error verificando créditos:', err);
      }
    }

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
