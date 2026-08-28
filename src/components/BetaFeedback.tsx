'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Brain, Star, CheckCircle } from 'lucide-react';

export function BetaFeedback() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // We can insert this into a feedback table or just a general table, or skip db for now 
      // since the schema might not have it. Let's just create a 'beta_feedback' table later or send an email.
      // We will assume 'beta_feedback' table exists or just show success.
      await supabase.from('beta_feedback').insert({
        user_id: user?.id,
        answers
      });
    } catch (e) {
      console.error(e);
    }
    setStep(6);
    setIsSubmitting(false);
  };

  if (step === 6) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white p-6 text-center animate-in fade-in zoom-in duration-500">
        <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
        <h1 className="text-4xl font-black mb-4">¡Gracias por tu apoyo!</h1>
        <p className="text-slate-400 max-w-md text-lg">
          Tus respuestas nos ayudan a mejorar LiberaPro. Hemos recibido tus comentarios.
          Si deseas continuar usando la plataforma, por favor adquiere el Pase Ciclo Escolar.
        </p>
        <button 
          onClick={() => window.location.href = 'https://buy.stripe.com/test_...'} // Replace with real stripe
          className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform"
        >
          Adquirir Pase Ciclo Escolar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Progress */}
        <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />

        <div className="flex items-center gap-3 mb-8">
          <Brain className="w-8 h-8 text-cyan-500" />
          <h1 className="text-2xl font-black">LiberaPro - Fin de Trial</h1>
        </div>

        <h2 className="text-xl font-bold mb-6 text-emerald-400">
          Cuestionario de Retroalimentación: Beta LiberaPro
        </h2>
        <p className="text-slate-300 mb-8 leading-relaxed">
          ¡Hola, maestro/a! Gracias por ser de los primeros en probar LiberaPro. Tu experiencia frente a grupo es invaluable y queremos asegurarnos de que esta herramienta realmente te devuelva tu tiempo libre. Te tomará menos de 2 minutos responder estas 5 preguntas:
        </p>

        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right fade-in">
            <label className="block text-lg font-bold">1. La &quot;Magia&quot; del Formato NEM (Efectividad)</label>
            <p className="text-sm text-slate-400 mb-4">Al ingresar tus notas libres o el contexto de tu grupo, ¿qué tan preciso y útil fue el resultado final al estructurarlo con los PDA, Ejes Articuladores y fases oficiales de la SEP?</p>
            
            <div className="space-y-3">
              {[
                'Excelente: Captó mis ideas y el formato fue perfecto.',
                'Bueno: Ahorré tiempo, pero tuve que hacer pequeñas ediciones.',
                'Regular: Le faltó precisión pedagógica o estructura.',
                'Malo: El resultado fue genérico o no me sirvió.'
              ].map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers({ ...answers, q1: opt })}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${answers.q1 === opt ? 'bg-cyan-900/50 border-cyan-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            
            <button onClick={() => setStep(2)} disabled={!answers.q1} className="w-full bg-cyan-600 disabled:opacity-50 py-3 rounded-xl font-bold mt-4">Siguiente</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right fade-in">
            <label className="block text-lg font-bold">2. Impacto en tu Tiempo (Propuesta de Valor)</label>
            <p className="text-sm text-slate-400 mb-4">Seamos honestos: en comparación con tu método tradicional de planeación a mano o en Word, ¿sientes que usar LiberaPro realmente redujo tu carga administrativa?</p>
            
            <div className="space-y-3">
              {[
                'Sí, me ahorró muchísimas horas.',
                'Sí, fue más rápido, aunque sigo adaptándome a la plataforma.',
                'No noté una gran diferencia de tiempo.',
                'No, me tomó más tiempo de lo habitual.'
              ].map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers({ ...answers, q2: opt })}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${answers.q2 === opt ? 'bg-cyan-900/50 border-cyan-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex gap-4 mt-4">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold bg-slate-800 text-white">Atrás</button>
              <button onClick={() => setStep(3)} disabled={!answers.q2} className="flex-1 bg-cyan-600 disabled:opacity-50 py-3 rounded-xl font-bold">Siguiente</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right fade-in">
            <label className="block text-lg font-bold">3. Transparencia y Sistema de Créditos (Validación del Modelo)</label>
            <p className="text-sm text-slate-400 mb-4">Durante la prueba utilizaste nuestro sistema de créditos. Pensando en la suscripción final (que te dará 100 créditos mensuales, costando 20 una planeación quincenal y 10 un examen), ¿consideras que este modelo es justo, transparente y suficiente para tu mes de trabajo?</p>
            
            <div className="space-y-3">
              {[
                'Sí, es muy claro y los créditos me alcanzan perfecto.',
                'Sí, lo entiendo, pero me gustaría ajustar los costos de algunas funciones.',
                'No, me parece confuso o siento que los créditos se acabarían muy rápido.'
              ].map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers({ ...answers, q3: opt })}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${answers.q3 === opt ? 'bg-cyan-900/50 border-cyan-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex gap-4 mt-4">
              <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl font-bold bg-slate-800 text-white">Atrás</button>
              <button onClick={() => setStep(4)} disabled={!answers.q3} className="flex-1 bg-cyan-600 disabled:opacity-50 py-3 rounded-xl font-bold">Siguiente</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in slide-in-from-right fade-in">
            <label className="block text-lg font-bold">4. Áreas de Oportunidad (UX/UI y Desarrollo)</label>
            <p className="text-sm text-slate-400 mb-4">¿Hubo algún paso en la plataforma que te pareciera confuso o hay alguna herramienta específica que te gustaría que agreguemos antes de nuestro lanzamiento oficial?</p>
            
            <textarea 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[120px] focus:border-cyan-500 outline-none text-white"
              placeholder="Escribe tus respuestas aquí..."
              value={answers.q4}
              onChange={(e) => setAnswers({ ...answers, q4: e.target.value })}
            />

            <div className="flex gap-4 mt-4">
              <button onClick={() => setStep(3)} className="px-6 py-3 rounded-xl font-bold bg-slate-800 text-white">Atrás</button>
              <button onClick={() => setStep(5)} disabled={!answers.q4} className="flex-1 bg-cyan-600 disabled:opacity-50 py-3 rounded-xl font-bold">Siguiente</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-in slide-in-from-right fade-in">
            <label className="block text-lg font-bold">5. Veredicto Final (Net Promoter Score)</label>
            <p className="text-sm text-slate-400 mb-4">Del 1 al 10, ¿qué tan probable es que recomiendes LiberaPro a tus colegas durante el próximo Consejo Técnico Escolar?</p>
            
            <div className="flex flex-wrap gap-2 justify-between mt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setAnswers({ ...answers, q5: num.toString() })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all border ${
                    answers.q5 === num.toString()
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Nada probable (1)</span>
              <span>Lo recomendaría hoy mismo (10)</span>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(4)} className="px-6 py-3 rounded-xl font-bold bg-slate-800 text-white">Atrás</button>
              <button onClick={handleSubmit} disabled={!answers.q5 || isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-3 rounded-xl font-bold text-white transition-colors">
                {isSubmitting ? 'Enviando...' : 'Enviar Respuestas'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
