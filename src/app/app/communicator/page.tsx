'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Plus, Trash2, Copy, Check, Users, User, Bell, Package, BookOpen, Star, Phone } from 'lucide-react';

interface Contact {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  group: string;
}

export default function CommunicatorPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState('2º A');

  const [category, setCategory] = useState<'recordatorio' | 'materiales' | 'tareas' | 'actividades'>('recordatorio');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDetails, setNoticeDetails] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [teacherName, setTeacherName] = useState('Profesor de Grupo');
  const [schoolName, setSchoolName] = useState('Escuela Primaria');

  useEffect(() => {
    const savedContacts = localStorage.getItem('liberapro_contacts');
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch (e) {}
    } else {
      // Contactos de demostración
      const demoContacts: Contact[] = [
        { id: '1', studentName: 'Mateo González', parentName: 'Sra. Carmen González', phone: '5215512345678', group: '2º A' },
        { id: '2', studentName: 'Sofia Hernández', parentName: 'Sr. Roberto Hernández', phone: '5215587654321', group: '2º A' }
      ];
      setContacts(demoContacts);
      localStorage.setItem('liberapro_contacts', JSON.stringify(demoContacts));
    }

    const savedTeacher = localStorage.getItem('liberapro_teacher_name');
    if (savedTeacher) setTeacherName(savedTeacher);

    const savedSchools = localStorage.getItem('liberapro_schools');
    if (savedSchools) {
      try {
        const parsed = JSON.parse(savedSchools);
        if (parsed[0]?.school) setSchoolName(parsed[0].school);
      } catch (e) {}
    }
  }, []);

  const saveContactsToStorage = (updated: Contact[]) => {
    setContacts(updated);
    localStorage.setItem('liberapro_contacts', JSON.stringify(updated));
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !phone) return;

    // Normalizar número de teléfono (quitar espacios o guiones)
    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
      cleanPhone = `521${cleanPhone}`;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      studentName,
      parentName: parentName || 'Padre de Familia',
      phone: cleanPhone,
      group: group || 'General'
    };

    const updated = [...contacts, newContact];
    saveContactsToStorage(updated);

    setStudentName('');
    setParentName('');
    setPhone('');
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    saveContactsToStorage(updated);
  };

  const getFormattedMessage = (targetContact?: Contact) => {
    let prefix = '📌 *AVISO IMPORTANTE PARA PADRES DE FAMILIA*';
    if (category === 'materiales') prefix = '🎨 *LISTA DE MATERIALES Y ÚTILES REQUERIDOS*';
    if (category === 'tareas') prefix = '📝 *RECORDATORIO DE TAREA PENDIENTE*';
    if (category === 'actividades') prefix = '🌟 *RESUMEN DE ACTIVIDADES Y LOGROS DEL DÍA*';

    const greeting = targetContact 
      ? `Estimado(a) ${targetContact.parentName} (Tutor/a de ${targetContact.studentName}):`
      : `Estimados Padres de Familia y Tutores del grupo ${group}:`;

    let body = `${prefix}\n\n${greeting}\n\n`;

    if (noticeTitle) {
      body += `*Asunto:* ${noticeTitle}\n`;
    }

    if (dueDate) {
      body += `*Fecha límite / Entrega:* ${dueDate}\n`;
    }

    if (noticeDetails) {
      body += `\n*Detalles:* \n${noticeDetails}\n`;
    }

    body += `\n\nQuedo a su disposición para cualquier duda o aclaración.\n\n*Atentamente,*\n${teacherName}\n${schoolName}`;

    return body;
  };

  const handleCopyGroupMessage = () => {
    const msg = getFormattedMessage();
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendIndividualWhatsApp = (contact: Contact) => {
    const msg = getFormattedMessage(contact);
    const encodedMsg = encodeURIComponent(msg);
    const url = `https://wa.me/${contact.phone}?text=${encodedMsg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-emerald-600" />
          Comunicación <span className="font-bold text-emerald-600">WhatsApp para Padres</span>
        </h2>
        <p className="text-sm text-slate-500 font-light max-w-2xl">
          Crea avisos, recordatorios, listas de materiales y tareas estructurados para enviar a padres de familia vía WhatsApp grupal o individual.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda & Centro: Redactor de Avisos */}
        <div className="lg:col-span-2 space-y-6">

          {/* Selector de Categoría */}
          <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Tipo de Notificación</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setCategory('recordatorio')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${category === 'recordatorio' ? 'bg-amber-500 text-white border-amber-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                <Bell className="w-5 h-5" />
                Recordatorio
              </button>
              <button
                type="button"
                onClick={() => setCategory('materiales')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${category === 'materiales' ? 'bg-purple-600 text-white border-purple-700 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                <Package className="w-5 h-5" />
                Materiales
              </button>
              <button
                type="button"
                onClick={() => setCategory('tareas')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${category === 'tareas' ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                <BookOpen className="w-5 h-5" />
                Tareas
              </button>
              <button
                type="button"
                onClick={() => setCategory('actividades')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${category === 'actividades' ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                <Star className="w-5 h-5" />
                Actividades
              </button>
            </div>
          </div>

          {/* Formulario de Redacción */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Contenido del Aviso</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título o Asunto Principal</label>
                <input 
                  type="text" 
                  value={noticeTitle}
                  onChange={e => setNoticeTitle(e.target.value)}
                  placeholder="Ej. Traer recorte de periódico o Firma de recados"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de Entrega / Evento</label>
                <input 
                  type="text" 
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  placeholder="Ej. Mañana Viernes 10 de Agosto"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Detalles de las Indicaciones</label>
              <textarea 
                rows={5}
                value={noticeDetails}
                onChange={e => setNoticeDetails(e.target.value)}
                placeholder="Escribe aquí las instrucciones detalladas para los padres..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Vista Previa del Mensaje Formatado WhatsApp */}
            <div className="mt-4 bg-emerald-950 text-emerald-100 p-4 rounded-2xl border border-emerald-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Vista Previa de Formato WhatsApp:</span>
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-emerald-50 leading-relaxed bg-emerald-900/50 p-3 rounded-xl border border-emerald-800">
                {getFormattedMessage(contacts.find(c => c.id === selectedContactId))}
              </pre>
            </div>

            {/* Acciones de Envío Grupal */}
            <div className="pt-2 flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={handleCopyGroupMessage}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm transition-all shadow-md"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? '¡Copiado para WhatsApp!' : 'Copiar Comunicado Grupal'}
              </button>
            </div>

          </div>

        </div>

        {/* Columna Derecha: Lista de Distribución de Contactos */}
        <div className="space-y-6">

          {/* Formulario Agregar Contacto */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Agregar Alumno / Tutor
            </h3>
            
            <form onSubmit={handleAddContact} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Alumno</label>
                <input 
                  type="text" 
                  required
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Ej. Mateo Pérez"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Padre / Tutor</label>
                <input 
                  type="text" 
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  placeholder="Ej. Sra. Ana Pérez"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono / WhatsApp</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10 dígitos o +52"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Grupo</label>
                  <input 
                    type="text" 
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    placeholder="Ej. 2º A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Guardar Contacto
              </button>
            </form>
          </div>

          {/* Lista de Contactos & Envío Individual */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Lista de Distribución ({contacts.length})
              </h3>
            </div>

            {contacts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No hay contactos guardados aún.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {contacts.map(c => (
                  <div key={c.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{c.studentName}</span>
                        <span className="text-[11px] text-slate-500 block">{c.parentName} ({c.group})</span>
                        <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {c.phone}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleDeleteContact(c.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Eliminar contacto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendIndividualWhatsApp(c)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Enviar por WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
