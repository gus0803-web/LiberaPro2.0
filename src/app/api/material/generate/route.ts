import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { FULL_AI_BRAIN } from '@/lib/nem-brain';

export const maxDuration = 60; // Permite que la función se ejecute por más tiempo (Vercel Hobby = 10s o 60s en Pro)

export async function POST(req: Request) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_KEY;

    if (!apiKey) {
      return new Response('OpenAI API key is missing.', { status: 500 });
    }

    const openai = createOpenAI({ apiKey });
    const body = await req.json();
    const { planTitle, planDescription, planData } = body;

    const prompt = `
Eres un asistente educativo experto del sistema NEM (Nueva Escuela Mexicana).
Basado en la siguiente planeación, crea un "Material de Apoyo Académico" EXCEPCIONAL y COMPLETO para el alumno.
No me des un resumen de la clase. Necesito el material LISTO PARA IMPRIMIR que el alumno va a resolver o leer.

Aquí tienes tu CEREBRO PEDAGÓGICO INYECTADO (Aplica siempre estas reglas y usa el estilo PNCE de la SEP):
<cerebro_nem>
${FULL_AI_BRAIN}
</cerebro_nem>

Si la clase es teórica, genera: Una guía de lectura detallada con 5 preguntas de comprensión.
Si la clase es práctica, genera: Una hoja de trabajo (worksheet) con ejercicios, espacios para responder, o instrucciones de laboratorio paso a paso.
Si la clase es de evaluación, genera: Un cuestionario tipo examen o una rúbrica de autoevaluación.

Formatea todo usando HTML básico limpio:
- Usa <h2> y <h3> para títulos y subtítulos.
- Usa <ul> y <li> para listas e instrucciones.
- Usa <p> para párrafos y <br> para saltos de línea.
- Usa <strong> para resaltar.
- Usa líneas (_____) para que el alumno escriba sus respuestas.
- NO uses Markdown (como #, **, *). Solo devuelve el código HTML directo sin envolver en etiquetas de código markdown (no uses \`\`\`html).

TÍTULO DE LA PLANEACIÓN: ${planTitle}
DESCRIPCIÓN DE LA CLASE: ${planDescription}
DATOS DEL DÍA: ${JSON.stringify(planData)}
`;

    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: prompt,
    });

    return new Response(JSON.stringify({ content: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating material:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}
