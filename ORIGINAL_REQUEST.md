# Original User Request

## Initial Request — 2026-06-16T18:30:44-06:00

Actualizar el agente de IA generador de planeaciones didácticas de LiberaPro (una app Next.js para maestros de educación básica en México) para corregir 6 bugs críticos reportados por usuarios reales y agregar funcionalidad faltante para que las planeaciones cumplan con los requisitos institucionales de la SEP/NEM.

Working directory: /Users/gus0803/Downloads/LiberaPro 2.1/LiberaPro 2.0
Integrity mode: development

## Contexto Técnico Actual

Los archivos clave que deben modificarse son:

| Archivo | Rol |
|---------|-----|
| `src/app/api/planner/generate/route.ts` | API endpoint que llama a GPT-4o-mini con un Zod schema (`planningSchema`) y un system prompt. Usa `streamObject` de Vercel AI SDK. |
| `src/lib/nem-brain.ts` | "Cerebro pedagógico" inyectado al system prompt (principios NEM, formato DUA, PNCE). |
| `src/app/app/planner/page.tsx` | Formulario del planner (inputs: fase, duración, proyecto, metodología, tema, etc.) y lógica de guardado automático a Supabase. |
| `src/lib/agenda.ts` | Funciones de exportación DOCX (`downloadAgendaItem`) y texto plano (`buildAgendaItemText`), además de impresión (`printAgendaItem`). |

**Tecnologías:** Next.js 16.2.6 con Turbopack, TypeScript strict, Vercel AI SDK (`@ai-sdk/react`, `@ai-sdk/openai`), Zod schemas, Supabase (auth + DB), deployed en Vercel.

**Restricción crítica:** La app se despliega con `next build` en Vercel. Cada push a `main` dispara un deploy automático. **El build DEBE pasar sin errores TypeScript.** Verificar con `next build` antes de considerar el trabajo completo.

## Requirements

### R1. Corregir numeración duplicada de días en la descarga DOCX y la ventana de impresión

En `src/lib/agenda.ts`, la función `downloadAgendaItem` (línea ~248) genera el encabezado `Día ${idx + 1} - ${renderValue(dia.dia)}`. Pero `dia.dia` ya viene del AI con formato "Día 1: ¿Quién vive aquí?", produciendo "Día 1 - Día 1: ¿Quién vive aquí?". Lo mismo ocurre en `printAgendaItem` (línea ~332).

Corregir ambas funciones para que, si `dia.dia` ya contiene una referencia a "Día" (por regex), se use directamente sin anteponer otro "Día N". Si no la contiene, se antepone "Día N -".

---

### R2. Generar la cantidad correcta de días según la duración seleccionada

El system prompt en `route.ts` dice "Quincenal = 10 días, Mensual = 20 días", pero GPT-4o-mini frecuentemente ignora esta instrucción y solo genera 5 días.

Reforzar la instrucción en el prompt de manera más agresiva. Agregar en el `planningSchema` (Zod) un `.describe()` que indique la cantidad esperada. Considerar agregar una validación post-generación en el `onFinish` callback que logee una advertencia si el conteo de días es incorrecto.

La cantidad de días esperada es:
- Semanal = 5 días exactos
- Quincenal = 10 días exactos
- Mensual = 20 días exactos

---

### R3. Incluir los pasos específicos de cada metodología en la planeación generada

En `src/lib/nem-brain.ts`, agregar una sección nueva (`METHODOLOGY_STEPS` o similar) que defina los pasos canónicos de cada metodología disponible en el planner:

- **Aprendizaje Basado en Proyectos Comunitarios (ABProC):** 1) Identificación del problema comunitario, 2) Investigación y diagnóstico, 3) Diseño del proyecto, 4) Ejecución, 5) Evaluación y difusión
- **Aprendizaje Basado en Indagación (STEAM):** 1) Pregunta detonadora, 2) Exploración e investigación, 3) Experimentación, 4) Análisis de resultados, 5) Comunicación de hallazgos
- **Aprendizaje Basado en Problemas (ABP):** 1) Presentación del problema, 2) Análisis y lluvia de ideas, 3) Investigación individual/grupal, 4) Propuesta de solución, 5) Reflexión y evaluación
- **Aprendizaje de Servicio (AS):** 1) Diagnóstico comunitario, 2) Planeación del servicio, 3) Ejecución, 4) Reflexión, 5) Celebración y difusión

El system prompt debe instruir al AI a:
1. Indicar explícitamente en qué paso/fase de la metodología se encuentra cada día
2. Agregar un campo nuevo al Zod schema por día: `pasoMetodologia` (string) que indique el paso

El DOCX descargado debe mostrar este campo como una fila adicional en la tabla de cada día.

---

### R4. Agregar instrumentos de evaluación a la planeación generada

El `planningSchema` no tiene campo para instrumentos de evaluación. Los supervisores lo requieren.

Agregar al Zod schema de cada día un campo `instrumentoEvaluacion` (string) que liste el o los instrumentos a usar ese día. El prompt debe instruir al AI a seleccionar instrumentos apropiados de entre: Rúbrica, Lista de Cotejo, Escala Estimativa, Portafolio de Evidencias, Registro Anecdótico, Autoevaluación, Coevaluación, Heteroevaluación.

El DOCX descargado debe mostrar este campo como una fila adicional en la tabla de cada día. La ventana de impresión también.

---

### R5. Incluir Contenidos y PDAs en el encabezado de la planeación

Agregar campos al Zod schema a nivel global (no por día):
- `contenidos`: array de strings — los contenidos curriculares trabajados
- `pda`: array de strings — los Procesos de Desarrollo de Aprendizaje

El prompt debe instruir al AI a listar explícitamente qué contenidos y PDAs se trabajarán. Si el usuario proporcionó contenidos/PDAs personalizados (ver R6), el AI debe usarlos como base.

En el DOCX descargado, estos campos deben aparecer como filas adicionales en la tabla del encabezado institucional (junto con Docente, Escuela, Fechas, etc.), formateados como lista con viñetas.

---

### R6. Agregar un selector tipo "tags" para contenidos/PDAs personalizados

En `src/app/app/planner/page.tsx`, agregar un componente de input tipo "tags" donde el maestro pueda escribir y agregar uno por uno los contenidos y/o PDAs que desea trabajar. Cada tag se agrega con Enter o un botón "+", y se puede eliminar con una "x".

Este campo es **opcional**. Su contenido se envía al API como un array de strings (`contenidosPersonalizados`) y se inyecta en el prompt para que el AI construya la planeación alrededor de esos contenidos específicos.

El componente debe seguir el mismo estilo visual del formulario existente (rounded-xl, border-slate-200, bg-white, etc.).

---

## Acceptance Criteria

### Numeración de Días
- [ ] La descarga DOCX no muestra "Día 1 - Día 1" (sin duplicación)
- [ ] La ventana de impresión tampoco muestra numeración duplicada
- [ ] Si `dia.dia` no contiene "Día", se antepone correctamente

### Cantidad de Días
- [ ] Una planeación "Semanal" produce exactamente 5 elementos en `diaADia`
- [ ] Una planeación "Quincenal" produce exactamente 10 elementos en `diaADia`
- [ ] Se logea un warning en `onFinish` si la cantidad de días no coincide con la esperada

### Metodología con Pasos
- [ ] Cada día de la planeación tiene un campo `pasoMetodologia` visible
- [ ] El DOCX descargado muestra el paso de la metodología por día
- [ ] `nem-brain.ts` contiene la definición de pasos para las 4 metodologías

### Instrumentos de Evaluación
- [ ] Cada día incluye un campo `instrumentoEvaluacion` en el schema
- [ ] El DOCX descargado muestra los instrumentos de evaluación por día
- [ ] La ventana de impresión también los muestra

### Contenidos y PDAs
- [ ] El schema tiene campos globales `contenidos` y `pda` (arrays de strings)
- [ ] El DOCX descargado muestra Contenidos y PDAs en el encabezado institucional

### Input de Contenidos/PDAs con Tags
- [ ] El formulario del planner tiene un componente de tags para contenidos/PDAs
- [ ] Los tags se pueden agregar con Enter y eliminar con "x"
- [ ] El array se envía al API y se inyecta en el prompt
- [ ] El campo es opcional (no bloquea la generación si está vacío)

### No-Regresión
- [ ] `next build` compila sin errores TypeScript
- [ ] Solo se modifican: `route.ts`, `planner/page.tsx`, `agenda.ts`, `nem-brain.ts`
- [ ] Las planeaciones existentes en Supabase siguen siendo legibles y descargables (backward compatibility del schema)
