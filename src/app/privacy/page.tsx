export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8 overflow-hidden relative">
      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 p-8 md:p-12 my-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Política de Privacidad / Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          <p><strong>Última actualización:</strong> Junio 2026</p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">Aviso de Privacidad (LFPDPPP)</h2>
          <p>
            En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), 
            LiberaPro informa que los datos personales recabados serán utilizados exclusivamente para los siguientes fines:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Proveer los servicios educativos contratados.</li>
            <li>Identificación y autenticación de usuarios.</li>
            <li>Generación de planeaciones didácticas y materiales educativos.</li>
            <li>Comunicaciones relacionadas con el servicio.</li>
            <li>Mejora continua de la plataforma.</li>
          </ul>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">Derechos ARCO</h2>
          <p>
            Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales (derechos ARCO). 
            Para ejercer cualquiera de estos derechos, puede enviar una solicitud a través de nuestro formulario de contacto 
            o al correo electrónico: <strong>TBD</strong>
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">Datos Recopilados</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nombre completo.</li>
            <li>Correo electrónico.</li>
            <li>Datos de uso de la plataforma (planeaciones generadas, materiales creados).</li>
          </ul>
          <p>
            No recopilamos datos sensibles. No compartimos su información con terceros sin su consentimiento expreso, 
            salvo obligación legal.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">Seguridad</h2>
          <p>
            LiberaPro implementa medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales 
            contra daño, pérdida, alteración, destrucción, uso, acceso o tratamiento no autorizado.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">Cambios al Aviso de Privacidad</h2>
          <p>
            LiberaPro se reserva el derecho de modificar el presente aviso de privacidad. Cualquier cambio será notificado 
            a través de la plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}
