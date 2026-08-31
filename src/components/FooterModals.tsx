'use client';

import React, { useState } from 'react';
import { X, Users, MapPin, Search } from 'lucide-react';

const mockTeachers = [
  { id: 1, name: 'Erendira Mendez', state: 'Aguascalientes', title: 'Doctora en Educación', collaborationType: 'Desarollo de Contenidos' },
  { id: 2, name: 'Erika Macias', state: 'Aguascalientes', title: 'Maestra en Educación', collaborationType: 'Desarollo de Contenidos' },
  { id: 3, name: 'Alejandra Macias', state: 'Aguascalientes', title: 'Maestra de ensenanza de Segundo Idioma', collaborationType: 'Diseño Curricular' },
  { id: 4, name: 'TBD', state: 'Jalisco', title: 'Docente de Grupo', collaborationType: 'Proyectos Comunitarios' },
  { id: 5, name: 'Gustavo Arellano', state: 'CDMX', title: 'CEO', collaborationType: 'Dirección General' },
];
const states = Array.from(new Set(mockTeachers.map(t => t.state))).sort();

function ModalWrapper({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export function PrivacyModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Política de Privacidad">
      <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700">
        <p><strong>Última actualización:</strong> Junio 2026</p>
        <h3 className="font-bold text-lg mt-6 text-slate-900">Aviso de Privacidad (LFPDPPP)</h3>
        <p>En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), LiberaPro informa que los datos personales recabados serán utilizados exclusivamente para los siguientes fines:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Proveer los servicios educativos contratados.</li>
          <li>Identificación y autenticación de usuarios.</li>
          <li>Generación de planeaciones didácticas y materiales educativos.</li>
          <li>Comunicaciones relacionadas con el servicio.</li>
          <li>Mejora continua de la plataforma.</li>
        </ul>
        
        <h3 className="font-bold text-lg mt-6 text-slate-900">Derechos ARCO</h3>
        <p>Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales (derechos ARCO). Para ejercer cualquiera de estos derechos, puede enviar una solicitud a través del formulario de contacto o al correo electrónico: <strong>informacion@liberapro.mx</strong></p>
        
        <h3 className="font-bold text-lg mt-6 text-slate-900">Datos Recopilados</h3>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Nombre completo.</li>
          <li>Correo electrónico.</li>
          <li>Datos de uso de la plataforma (planeaciones generadas, materiales creados).</li>
        </ul>
        <p className="mt-4">No recopilamos datos sensibles. No compartimos su información con terceros sin su consentimiento expreso, salvo obligación legal.</p>
        
        <h3 className="font-bold text-lg mt-6 text-slate-900">Seguridad</h3>
        <p>LiberaPro implementa medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción, uso, acceso o tratamiento no autorizado.</p>
      </div>
    </ModalWrapper>
  );
}

export function TermsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Términos de Uso">
      <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700">
        <p><strong>Última actualización:</strong> Junio 2026</p>
        
        <h3 className="font-bold text-lg mt-6 text-slate-900">1. Aceptación de los Términos</h3>
        <p>Al acceder y utilizar LiberaPro, usted acepta estar sujeto a estos Términos de Uso y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido el uso o acceso a esta plataforma.</p>
        
        <h3 className="font-bold text-lg mt-6 text-slate-900">2. Uso de la Plataforma</h3>
        <p>Se concede permiso para utilizar temporalmente la plataforma de LiberaPro para la generación de materiales educativos y planeaciones exclusivamente para uso personal y no comercial. Esta es una concesión de licencia, no una transferencia de título, y bajo esta licencia usted no puede:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Modificar o copiar el software de la plataforma.</li>
          <li>Utilizar los materiales generados para fines comerciales externos sin autorización.</li>
          <li>Intentar descompilar o realizar ingeniería inversa de cualquier software contenido en la plataforma LiberaPro.</li>
          <li>Transferir su cuenta o los materiales a otra persona o "espejar" los materiales en cualquier otro servidor.</li>
        </ul>
        
        <h3 className="font-bold text-lg mt-6 text-slate-900">3. Responsabilidad del Contenido</h3>
        <p>LiberaPro asiste en la creación de planeaciones didácticas basándose en las metodologías oficiales de la Nueva Escuela Mexicana (NEM). Sin embargo, la revisión, validación y aplicación final de las planeaciones y materiales generados es responsabilidad exclusiva del docente titular.</p>
        
        <h3 className="font-bold text-lg mt-6 text-slate-900">4. Limitaciones</h3>
        <p>En ningún caso LiberaPro o sus proveedores serán responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o beneficios, o debido a la interrupción del negocio) que surja del uso o la incapacidad de utilizar los materiales en la plataforma de LiberaPro.</p>
      </div>
    </ModalWrapper>
  );
}

export function ContactModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Contacto">
      <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700">
        <p>¿Tienes dudas, comentarios o necesitas soporte? Estamos aquí para ayudarte.</p>
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 mt-6">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Correo Electrónico</h3>
            <p className="m-0">soporte@liberapro.mx</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Protección de Datos Personales (ARCO)</h3>
            <p className="m-0">informacion@liberapro.mx</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Horario de Atención</h3>
            <p className="m-0">Lunes a Viernes, 9:00 AM - 6:00 PM (Hora Centro de México)</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-8">
          En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), 
          cualquier solicitud relacionada con derechos ARCO será atendida en un plazo máximo de 20 días hábiles.
        </p>
      </div>
    </ModalWrapper>
  );
}

export function CollaboratorsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [selectedState, setSelectedState] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = mockTeachers.filter(t => {
    const matchState = selectedState ? t.state === selectedState : true;
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchState && matchSearch;
  });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Directorio de Colaboración">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="relative min-w-[200px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
          >
            <option value="">Todos los Estados</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeachers.map(teacher => (
          <div key={teacher.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                {teacher.name.charAt(0)}
              </div>
              <span className="bg-white text-slate-600 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-slate-200">
                <MapPin className="w-3 h-3" /> {teacher.state}
              </span>
            </div>
            <h3 className="font-bold text-slate-900">{teacher.name}</h3>
            <div className="mt-2 space-y-1 text-xs">
              <p className="text-slate-500"><strong>Título:</strong> {teacher.title}</p>
              <p className="text-slate-500"><strong>Rol:</strong> {teacher.collaborationType}</p>
            </div>
          </div>
        ))}
        {filteredTeachers.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500">
            No se encontraron colaboradores.
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
