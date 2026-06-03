export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
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
            <p>privacidad@liberapro.mx</p>
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
  );
}
