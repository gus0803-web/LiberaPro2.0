import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8 overflow-hidden relative">
      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 p-8 md:p-12 my-8">
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Términos de Uso / Terms of Use</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          <p><strong>Última actualización:</strong> Junio 2026</p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar LiberaPro, usted acepta estar sujeto a estos términos y condiciones de uso. 
            Si no está de acuerdo con alguno de estos términos, no deberá usar la plataforma.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">2. Descripción del Servicio</h2>
          <p>
            LiberaPro es una plataforma de tecnología educativa que utiliza inteligencia artificial para generar 
            planeaciones didácticas, materiales de apoyo y herramientas de gestión docente alineadas con la 
            Nueva Escuela Mexicana (NEM).
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">3. Uso Permitido</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>El servicio es exclusivamente para fines educativos.</li>
            <li>El usuario es responsable del uso y revisión del contenido generado por la IA.</li>
            <li>Queda prohibida la reventa o redistribución comercial del contenido generado.</li>
            <li>El usuario se compromete a no intentar vulnerar la seguridad de la plataforma.</li>
          </ul>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">4. Propiedad Intelectual</h2>
          <p>
            El contenido generado por la IA es propiedad del usuario que lo generó. La plataforma, su diseño, 
            código y marca son propiedad exclusiva de LiberaPro.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">5. Limitación de Responsabilidad</h2>
          <p>
            LiberaPro no garantiza que el contenido generado por inteligencia artificial sea libre de errores. 
            El usuario es responsable de revisar y adaptar todo el material antes de su aplicación en el aula.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8">6. Legislación Aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será 
            sometida a la jurisdicción de los tribunales competentes de la Ciudad de México.
          </p>
        </div>
      </div>
    </div>
  );
}
