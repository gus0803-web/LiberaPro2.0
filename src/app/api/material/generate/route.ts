import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

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
Basado en la siguiente planeación, crea un "Material de Apoyo" para el alumno.
Esto puede ser una hoja de trabajo, un cuestionario, un formato de lectura, o una actividad práctica.
Asegúrate de que el material sea directamente aplicable para la sesión.
No agregues saludos ni despedidas, solo devuelve el contenido del material en formato Markdown (texto claro con viñetas, negritas y títulos).

TÍTULO DE LA PLANEACIÓN: ${planTitle}
DESCRIPCIÓN: ${planDescription}
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
