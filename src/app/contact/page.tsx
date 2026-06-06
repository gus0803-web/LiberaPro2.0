import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8 overflow-hidden relative">
      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 p-8 md:p-12 my-8">
        <Link href="/app/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Contacto / Contact</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          <p>
            ¿Tienes dudas, comentarios o necesitas soporte? Estamos aquí para ayudarte.
          </p>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">Correo Electrónico</h3>
              <p>soporte@liberapro.mx</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Protección de Datos Personales (ARCO)</h3>
              <p>informacion@liberapro.mx</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Horario de Atención</h3>
              <p>Lunes a Viernes, 9:00 AM - 6:00 PM (Hora Centro de México)</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-8">
            En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), 
            cualquier solicitud relacionada con derechos ARCO será atendida en un plazo máximo de 20 días hábiles.
          </p>
        </div>
      </div>
    </div>
  );
}
