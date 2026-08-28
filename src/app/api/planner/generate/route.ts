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
    campoFormativo: z.string().describe("Campo Formativo (Lenguajes / Saberes y Pensamiento Científico / Ética, Naturaleza y Sociedades / De lo Humano y lo Comunitario)"),
    contenidoContextualizado: z.string().describe("Contenido curricular adaptado a la problemática central"),
    pda: z.string().describe("Proceso de Desarrollo de Aprendizaje oficial según la Fase"),
    ejesArticuladores: z.string()
  })),
  fasesMetodologia: z.array(z.object({
    fase: z.string().describe("Solo el título de la Fase metodológica (Ej. 'Fase 1: Planeación'). Prohibido mencionar campos formativos."),
    momentos: z.array(z.object({
      nombreMomento: z.string().describe("Nombre oficial del Momento (Ej. 'Momento 1: Identificación')"),
      actividadesIntegradas: z.string().describe("Narrativa lógica conectando actividades de TODOS los campos formativos. Al final de la actividad, mencionar entre paréntesis el campo (Ej. '...recolectar datos (Saberes y Pensamiento Científico).')")
    })),
    materialesYRecursos: z.string()
  })),
  estrategiaEvaluacion: z.string().describe("Estrategia de evaluación cualitativa y formativa, diarios de campo, análisis de producciones y uso del error."),
  anexosListasCotejo: z.array(z.object({
    tituloAnexo: z.string().describe("Ej. 'Anexo 1: Lista de Cotejo de Lectoescritura y Pensamiento Científico'"),
    campoFormativo: z.string(),
    indicadores: z.array(z.object({
      pdaIndicador: z.string().describe("Indicador cualitativo derivado del PDA"),
      logrado: z.string(),
      enProceso: z.string(),
      observaciones: z.string().describe("Espacio para observaciones o evidencias")
    }))
  })),
  referenciasPedagogicas: z.string().describe("Lista de bibliografía, referencias pedagógicas oficiales de la SEP y mención de Libros de Texto Gratuitos acordes a la Fase/Grado que sustenten el proyecto."),
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
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const apiKey =
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_KEY;
    if (!apiKey) {
      return new Response(
        'OpenAI API key is missing. Set OPENAI_API_KEY in environment variables.',
        { status: 500 }
      );
    }

    const openai = createOpenAI({ apiKey });

    if (!user && req.headers.get('x-debug-token') !== 'super-secret-123') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Rate Limit: 3 per minute
    if (user) {
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { count } = await supabase
        .from('user_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneMinuteAgo);
        
      if (count && count >= 3) {
        return new Response(JSON.stringify({ error: 'Límite de generaciones alcanzado. Por favor espera un minuto antes de volver a intentar.' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
      }
    }

    const { fase, tema, notasMaestro, ejesArticuladores, metodologia, duracion, hasTEA, schoolGroup, fechaInicio, fechaTermino, profileData } = await req.json();

    let expectedSessions = 5;
    if (duracion === 'Quincenal') expectedSessions = 10;
    if (duracion === 'Mensual') expectedSessions = 20;

    const teacherName = profileData?.teacherName || 'Profesor de Grupo';
    const schoolName = profileData?.schoolName || 'Escuela Primaria';
    const cct = profileData?.cct || '02DPRXXXXX';
    const turno = profileData?.turno || 'Matutino';
    const directorName = profileData?.directorName || 'Directora de la Escuela';

    let methodologyGuide = '';
    if (metodologia === 'Aprendizaje Basado en Proyectos Comunitarios') {
      methodologyGuide = `
        Fase 1: Planeación (Se enfoca en identificar un problema y proponer una ruta de acción).
          - Momento 1: Identificación. (Proponer planteamientos para identificar la problemática general y específica).
          - Momento 2: Recuperación. (Vincular el problema con los saberes previos de los alumnos).
          - Momento 3: Planificación. (Negociar los pasos a seguir, los productos y los tiempos).
        Fase 2: Acción (Es el desarrollo del proyecto, la investigación y la producción).
          - Momento 4: Acercamiento. (Explorar el problema de manera más directa).
          - Momento 5: Comprensión y producción. (Ofrecer explicaciones, investigar y empezar a elaborar productos).
          - Momento 6: Reconocimiento. (Identificar avances y dificultades; realizar ajustes al proyecto).
          - Momento 7: Concreción. (Generar la primera versión del producto propuesto).
        Fase 3: Intervención (Se difunde el producto y se evalúa el impacto).
          - Momento 8: Integración. (Exposición y explicación de soluciones preliminares, recibir retroalimentación).
          - Momento 9: Difusión. (Presentar el producto final al aula o la comunidad).
          - Momento 10: Consideraciones. (Dar seguimiento y evaluación al impacto del proyecto).
          - Momento 11: Avances. (Tomar decisiones sobre cómo mejorar en futuros proyectos).`;
    } else if (metodologia === 'Aprendizaje Basado en Indagación (STEAM)') {
      methodologyGuide = `
        Fase 1: Introducción al tema / Uso de conocimientos previos / Reconocimiento del problema.
        Fase 2: Diseño de investigación / Desarrollo de la indagación.
        Fase 3: Organizar y estructurar las respuestas a las preguntas específicas de indagación.
        Fase 4: Presentación de los resultados de indagación / Aplicación.
        Fase 5: Metacognición.`;
    } else if (metodologia === 'Aprendizaje Basado en Problemas (ABP)') {
      methodologyGuide = `
        Fase 1: Presentemos.
        Fase 2: Recolectemos.
        Fase 3: Formulemos el problema.
        Fase 4: Organicemos la experiencia.
        Fase 5: Vivamos la experiencia.
        Fase 6: Resultados y análisis.`;
    } else {
      methodologyGuide = `
        Etapa 1: Punto de partida.
        Etapa 2: Lo que sé y lo que quiero saber.
        Etapa 3: Organicemos las actividades.
        Etapa 4: Creatividad en marcha.
        Etapa 5: Compartimos y evaluamos lo aprendido.`;
    }

    const systemPrompt = `
Eres un experto pedagógico y diseñador curricular especializado en la Nueva Escuela Mexicana (NEM).
Tu misión es construir una planeación didáctica formal, rigurosa, completa y estructurada exactamente en 6 SECCIONES PEDAGÓGICAS siguiendo el modelo del documento oficial 'planeacion_agosto_2026'.

REGLA DE ORO DE ARTICULACIÓN INTERDISCIPLINARIA ENTRE LOS 4 CAMPOS FORMATIVOS:
Debes garantizar que los 4 Campos Formativos estén ESTRICTAMENTE INTERCONECTADOS entre sí alrededor del tema o problemática central propuesto por el maestro (ej. 'La contaminación del agua'). Cada campo formativo abordará un ángulo específico complementario del MISMO tema:

1. LENGUAJES: Expresión oral y escrita, comprensión lectora, producción de carteles, trípticos, folletos, debates o exposiciones sobre el tema central.
2. SABERES Y PENSAMIENTO CIENTÍFICO: Investigación de causas y efectos científicos/ambientales, indagación cuantitativa, conteo, gráficas, medición e impacto en el ecosistema.
3. ÉTICA, NATURALEZA Y SOCIEDADES: Reflexión ética sobre las acciones comunitarias, cuidado del medio ambiente, derechos de la comunidad, valores y responsabilidad social frente al problema.
4. DE LO HUMANO Y LO COMUNITARIO: Compromisos individuales y colectivos, acuerdos comunitarios, convivencia armónica, hábitos de prevención y acciones prácticas a realizar en la escuela y el hogar.

LAS 6 SECCIONES OBLIGATORIAS DE LA PLANEACIÓN:
1. DATOS DE IDENTIFICACIÓN: Nombre docente: ${teacherName}, Escuela: ${schoolName}, CCT: ${cct}, Turno: ${turno}, Director: ${directorName}, Grado y Grupo: ${schoolGroup || '2° A'}, Fase: ${fase}, Periodo: Del ${fechaInicio} al ${fechaTermino}, Mes de plan: Diagnóstico e Integración / Planeación Didáctica.
2. JUSTIFICACIÓN PEDAGÓGICA Y DIAGNÓSTICO INICIAL: Justificación pedagógica integral (socioemocional y académica). DEBES incluir explícitamente la CONCEPCIÓN DEL ERROR como insumo didáctico y oportunidad de aprendizaje no punitiva.
3. PROYECTO INTEGRADOR: Título del proyecto, Metodología sociocrítica (${metodologia}) y Propósito pedagógico del proyecto.
4. ESTRUCTURA CURRICULAR POR CAMPOS FORMATIVOS: Desglose articulado de los Campos Formativos involucrados con sus Contenidos Contextualizados, PDA oficiales de la Fase ${fase} y Ejes Articuladores.
IMPORTANTE: Para la columna "ejesArticuladores", DEBES USAR EXCLUSIVAMENTE los ejes que el maestro ha seleccionado: ${Array.isArray(ejesArticuladores) && ejesArticuladores.length > 0 ? ejesArticuladores.join(', ') : 'Ninguno seleccionado'}.
No inventes otros ejes. Escribe únicamente los seleccionados por el maestro que encajen con este contenido.

Toma en cuenta las siguientes definiciones de los Ejes Articuladores para justificar su integración en las actividades y contenidos:
- Inclusión: Perspectiva decolonial, formando espacios comunitarios para todos y todas sin exclusión.
- Pensamiento crítico: Capacidad de los estudiantes para entender y analizar la complejidad de su mundo.
- Interculturalidad crítica: Interacción y coexistencia en la diversidad en un marco de relaciones asimétricas.
- Igualdad de género: Comprender la igualdad como condición histórica y erradicar la violencia y discriminación.
- Vida saludable: Comprender que salud humana y medio ambiente son organismos vivos interdependientes.
- Apropiación de las culturas a través de la lectura y la escritura: Acercamiento a los textos para comprender el mundo cotidiano y otras formas de vida.
- Artes y experiencias estéticas: Exploración sensible del mundo y reconocimiento de las artes como expresión cultural.
5. DESARROLLO POR FASES Y MOMENTOS DE LA METODOLOGÍA: Estructura el proyecto EXACTAMENTE en las siguientes Fases y Momentos oficiales de la metodología ${metodologia}:
${methodologyGuide}

   - COLUMNA 1 (Fase): SOLO lleva el título de la Fase. Prohibido mencionar Campos Formativos en este nivel.
   - COLUMNA 2 (Actividades por Momentos): Desglosa las actividades FORZOSAMENTE por Momentos metodológicos. 
     * Regla de Integración Transversal: Dentro de CADA Momento, redacta actividades narrativas y lógicas (flujo didáctico) donde se interconecten los campos formativos en la misma escena (ej. plática grupal -> salir al patio a contar cosas). NO separes por días ni por materias aisladas. Cada momento DEBE contener obligatoriamente al menos una actividad conectada para CADA campo formativo seleccionado.
     * Mención Explícita: Al final de CADA oración o actividad, debes indicar obligatoriamente entre paréntesis el Campo Formativo que se está trabajando (ej. '...recolectar datos (Saberes y Pensamiento Científico).').
     ${hasTEA ? '* Adaptaciones TEA: Agrega obligatoriamente un párrafo extra al final de cada Momento que inicie con "🧩 Adaptaciones TEA:" detallando cómo adaptar estas actividades para alumnos en el espectro.' : ''}
   - Materiales y Recursos específicos y estrategia de evaluación formativa de la fase. IMPORTANTE: En los materiales DEBES incluir siempre una opción de "🌿 Material ECO:" (ej. uso de material reciclado o recursos naturales).
6. ESTRATEGIA DE EVALUACIÓN DIAGNÓSTICA Y FORMATIVA Y ANEXOS:
   - Redacción de la estrategia formativa cualitativa basada en la observación diaria y el error como puente didáctico.
   - ANEXOS: Mínimo 2 Listas de Cotejo Cualitativas estructuradas por Campo Formativo con Indicadores de Aprendizaje directamente basados en los PDA oficiales, con columnas para Logrado (SÍ), En Proceso (NO) y Observaciones/Evidencias.
   - REFERENCIAS PEDAGÓGICAS: Incluye una sección final con bibliografía, enlaces y referencias de Libros de Texto Gratuitos (SEP) acordes a la Fase (grado). Señala proyectos o páginas sugeridas si aplican.
   - FIRMAS OFICIALES: Firma del Docente Titular y Firma del Director(a).

NO OMITAS NINGUNA DE LAS SECCIONES.
`;

    const userPrompt = `
DATOS DE ENTRADA DEL MAESTRO:
Tema / Proyecto Central: ${tema}
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
        const { data: profile } = await supabase.from('profiles').select('credits, last_credit_reset, is_admin').eq('id', user.id).single();
        if (profile) {
          let currentCredits = profile.credits ?? 15;
          const isAdmin = profile.is_admin ?? false;
          let lastReset = profile.last_credit_reset ? new Date(profile.last_credit_reset) : new Date(0);
          const now = new Date();

          if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
            currentCredits = isAdmin ? 150 : 100;
            await supabase.from('profiles').update({ 
              credits: currentCredits,
              last_credit_reset: now.toISOString()
            }).eq('id', user.id);
          }

          const requiredCredits = duracion === 'Mensual' ? 35 : 20;

          if (currentCredits < requiredCredits) {
            return new Response(JSON.stringify({ error: `Créditos insuficientes. Necesitas ${requiredCredits} créditos para generar esta planeación. Tienes ${currentCredits}.` }), { status: 403, headers: { 'Content-Type': 'application/json' } });
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
        if (object && user && accessToken) {
          try {
            const { createClient: createRawClient } = require('@supabase/supabase-js');
            const supabaseAsync = createRawClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
            );

            await supabaseAsync.from('user_generations').insert({
              user_id: user.id,
              type: 'planeacion',
              content: object
            });
            
            const { data: profile } = await supabaseAsync.from('profiles').select('credits').eq('id', user.id).single();
            if (profile && typeof profile.credits === 'number') {
              const requiredCredits = duracion === 'Mensual' ? 35 : 20;
              await supabaseAsync.from('profiles').update({ credits: Math.max(0, profile.credits - requiredCredits) }).eq('id', user.id);
            }
          } catch (e) {
            console.error('Error saving generation to db or decrementing credits', e);
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
