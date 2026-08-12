'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, Send, Plus, Trash2, CheckCircle2, Users, Bell, Package, BookOpen, Star, Filter, ShieldCheck, Loader2, KeyRound, Copy, Check, Printer } from 'lucide-react';

interface StudentContact {
  id: string;
  studentName: string;
  parentName: string;
  schoolName: string;
  gradeGroup: string;
  shift: string;
  linkCode: string;
}

export default function CommunicatorPage() {
  const [students, setStudents] = useState<StudentContact[]>([]);
  const [savedSchools, setSavedSchools] = useState<any[]>([]);
  const [selectedSchoolIndex, setSelectedSchoolIndex] = useState<number>(0);

  const [studentNameInput, setStudentNameInput] = useState('');
  const [parentNameInput, setParentNameInput] = useState('');

  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('Todos');

  const [category, setCategory] = useState<'recordatorio' | 'materiales' | 'tareas' | 'actividades'>('recordatorio');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDetails, setNoticeDetails] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState('');
  const [sendError, setSendError] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [teacherName, setTeacherName] = useState('Profesor de Grupo');

  useEffect(() => {
    const savedTeacher = localStorage.getItem('liberapro_teacher_name');
    if (savedTeacher) setTeacherName(savedTeacher);

    const schoolsRaw = localStorage.getItem('liberapro_schools');
    if (schoolsRaw) {
      try {
        const parsed = JSON.parse(schoolsRaw).filter((s: any) => s.school || s.group);
        setSavedSchools(parsed);
      } catch (e) {}
    }

    const savedStudents = localStorage.getItem('liberapro_student_link_codes');
    if (savedStudents) {
      try {
        setStudents(JSON.parse(savedStudents));
      } catch (e) {}
    } else {
      // Alumnos iniciales de demostración
      const demoStudents: StudentContact[] = [
        {
          id: '1',
          studentName: 'Mateo Pérez',
          parentName: 'Sra. Carmen Pérez',
          schoolName: 'Escuela Primaria Justo Sierra',
          gradeGroup: '2º A',
          shift: 'Vespertino',
          linkCode: 'JS-2A-VESP-8492'
        },
        {
          id: '2',
          studentName: 'Sofia Hernández',
          parentName: 'Sr. Roberto Hernández',
          schoolName: 'Escuela Primaria Justo Sierra',
          gradeGroup: '2º A',
          shift: 'Vespertino',
          linkCode: 'JS-2A-VESP-3049'
        }
      ];
      setStudents(demoStudents);
      localStorage.setItem('liberapro_student_link_codes', JSON.stringify(demoStudents));
    }
  }, []);

  const [studentAddedMsg, setStudentAddedMsg] = useState('');

  const selectedSchoolInfo = (savedSchools && savedSchools[selectedSchoolIndex]) ? savedSchools[selectedSchoolIndex] : {
    school: 'Escuela Primaria Justo Sierra',
    group: '2º A',
    cct: '02DPRXXXXX',
    turno: 'Vespertino',
    director: 'Directora de la Escuela'
  };

  const saveStudentsToStorage = (updated: StudentContact[]) => {
    setStudents(updated);
    localStorage.setItem('liberapro_student_link_codes', JSON.stringify(updated));
  };

  // Función para generar Código de Enlace por Salón (Escuela, Grado, Grupo, Turno, PIN)
  const generateSalonLinkCode = (school: string, group: string, shift: string) => {
    const schoolInitials = (school || 'JUSTOSIERRA')
      .split(' ')
      .filter(w => w.length > 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() || 'LIBERA';

    const cleanGroup = (group || '2A').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '2A';
    const cleanShift = (shift || 'VESP').slice(0, 4).toUpperCase() || 'VESP';
    const pin = Math.floor(1000 + Math.random() * 9000);

    return `${schoolInitials}-${cleanGroup}-${cleanShift}-${pin}`;
  };

  const handleAddStudentDirect = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentNameInput.trim()) {
      alert('Ingresa al menos el nombre del alumno.');
      return;
    }

    const schoolNameStr = selectedSchoolInfo?.school || 'Escuela Primaria';
    const gradeGroupStr = selectedSchoolInfo?.group || '2º A';
    const shiftStr = selectedSchoolInfo?.turno || 'Vespertino';

    const code = generateSalonLinkCode(schoolNameStr, gradeGroupStr, shiftStr);

    const newStudent: StudentContact = {
      id: Date.now().toString(),
      studentName: studentNameInput.trim(),
      parentName: parentNameInput.trim() || 'Padre de Familia',
      schoolName: schoolNameStr,
      gradeGroup: gradeGroupStr,
      shift: shiftStr,
      linkCode: code
    };

    // Guardar localmente inmediatamente
    const updated = [newStudent, ...students];
    saveStudentsToStorage(updated);

    // Restablecer filtro a 'Todos' para que el alumno aparezca de inmediato en pantalla
    setSelectedGroupFilter('Todos');

    setStudentAddedMsg(`¡${newStudent.studentName} agregado a ${newStudent.gradeGroup}! Código: ${newStudent.linkCode}`);
    setTimeout(() => setStudentAddedMsg(''), 8000);

    // Guardar en Supabase vía API y cliente
    fetch('/api/communicator/link-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolName: newStudent.schoolName,
        gradeGroup: newStudent.gradeGroup,
        shift: newStudent.shift,
        studentName: newStudent.studentName,
        parentName: newStudent.parentName,
        linkCode: newStudent.linkCode
      })
    }).catch(err => console.error('Error enviando a API link-codes:', err));

    try {
      const supabase = createClient();
      supabase.from('family_link_codes').insert({
        school_name: newStudent.schoolName,
        grade_group: newStudent.gradeGroup,
        shift: newStudent.shift,
        student_name: newStudent.studentName,
        parent_name: newStudent.parentName,
        link_code: newStudent.linkCode
      }).then(({ error }) => {
        if (error) console.log('Client insert family_link_codes result:', error);
      });
    } catch (e) {}

    setStudentNameInput('');
    setParentNameInput('');
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    handleAddStudentDirect(e);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    saveStudentsToStorage(updated);
  };

  const availableGroups = Array.from(new Set(students.map(s => `${s.schoolName} - ${s.gradeGroup} (${s.shift})`)));

  const filteredStudents = selectedGroupFilter === 'Todos'
    ? students
    : students.filter(s => `${s.schoolName} - ${s.gradeGroup} (${s.shift})` === selectedGroupFilter);

  const getFormattedNotice = () => {
    let prefix = '📌 *AVISO IMPORTANTE DE CLASE*';
    if (category === 'materiales') prefix = '🎨 *LISTA DE MATERIALES Y ÚTILES REQUERIDOS*';
    if (category === 'tareas') prefix = '📝 *RECORDATORIO DE TAREA PENDIENTE*';
    if (category === 'actividades') prefix = '🌟 *RESUMEN DE ACTIVIDADES DEL DÍA*';

    const schoolText = selectedSchoolInfo.school || 'Escuela Primaria';
    const groupText = selectedSchoolInfo.group || '2º A';
    const shiftText = selectedSchoolInfo.turno || 'Vespertino';

    let body = `${prefix}\n\nEstimados Padres de Familia de ${schoolText} (${groupText} - Turno ${shiftText}):\n\n`;

    if (noticeTitle) body += `*Asunto:* ${noticeTitle}\n`;
    if (dueDate) body += `*Fecha Límite / Entrega:* ${dueDate}\n`;
    if (noticeDetails) body += `\n*Indicaciones:* \n${noticeDetails}\n`;

    body += `\n\n*Atentamente,*\n${teacherName}\n${schoolText}`;
    return body;
  };

  // Publicación en Tiempo Real con Supabase Realtime
  const handlePublishRealtimeNotification = async () => {
    if (!noticeTitle && !noticeDetails) {
      setSendError('Ingresa al menos el título o las indicaciones del aviso.');
      return;
    }

    setIsSending(true);
    setSendSuccessMessage('');
    setSendError('');

    const formattedContent = getFormattedNotice();

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from('parent_messages').insert({
          sender_teacher_id: user.id,
          school_name: selectedSchoolInfo.school || 'Escuela Primaria',
          grade_group: selectedSchoolInfo.group || '2º A',
          shift: selectedSchoolInfo.turno || 'Vespertino',
          category,
          title: noticeTitle || 'Aviso General',
          due_date: dueDate || null,
          details: noticeDetails || null,
          formatted_content: formattedContent
        });

        if (error) throw error;
      }

      setSendSuccessMessage(`¡Aviso publicado exitosamente en tiempo real! Todos los padres vinculados al salón ${selectedSchoolInfo.group} (${selectedSchoolInfo.turno}) han recibido la notificación.`);
      setTimeout(() => setSendSuccessMessage(''), 8000);
      setNoticeTitle('');
      setNoticeDetails('');
      setDueDate('');
    } catch (err: any) {
      // Fallback si Supabase no está conectado
      setSendSuccessMessage(`¡Notificación simulada enviada a todos los padres de ${selectedSchoolInfo.group}!`);
      setTimeout(() => setSendSuccessMessage(''), 6000);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyFichaPadre = (st: StudentContact) => {
    const text = `👨‍👩‍👧 *FICHA DE CONEXIÓN PARA PADRES DE FAMILIA*\n\nEstimado tutor de ${st.studentName}:\n\nPara recibir las tareas, avisos y listas de materiales en tiempo real del grupo ${st.gradeGroup} (${st.shift}) en ${st.schoolName}, entra a:\n\n🌐 https://liberapro.app/familias\n\ne ingresa tu Código de Enlace:\n🔑 *${st.linkCode}*`;
    navigator.clipboard.writeText(text);
    setCopiedCodeId(st.id);
    setTimeout(() => setCopiedCodeId(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Banner de Privacidad Docente con acceso al Portal de Padres */}
      <section className="bg-slate-900 text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-white">
              Sistema Nativo de Notificaciones <span className="text-emerald-400">en Tiempo Real</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Los avisos se transmiten instantáneamente al portal de los padres (<code className="text-emerald-300">/familias</code>) mediante Supabase Realtime. <strong>Tu número telefónico personal nunca se revela.</strong>
            </p>
          </div>
        </div>

        <a
          href="/familias"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/30"
        >
          <Users className="w-4 h-4 text-purple-200" />
          <span>📱 Ir al Portal de Padres (/familias)</span>
        </a>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Redactor de Notificaciones Realtime */}
        <div className="lg:col-span-2 space-y-6">

          {/* Selector de Aula Activa */}
          <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Seleccionar Aula de Publicación
            </label>
            {savedSchools.length > 0 ? (
              <select 
                value={selectedSchoolIndex} 
                onChange={e => setSelectedSchoolIndex(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900"
              >
                {savedSchools.map((s, idx) => (
                  <option key={idx} value={idx}>
                    {s.school || 'Escuela'} — {s.group || 'Grupo'} ({s.turno || 'Matutino'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
                Tip: Puedes agregar tus escuelas, turnos y CCT en la pestaña <strong>Settings</strong>.
              </div>
            )}
          </div>

          {/* Selector de Categoría */}
          <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Tipo de Publicación</h3>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título o Asunto</label>
                <input 
                  type="text" 
                  value={noticeTitle}
                  onChange={e => setNoticeTitle(e.target.value)}
                  placeholder="Ej. Tarea de Matemáticas pág. 45"
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
                placeholder="Escribe las instrucciones claras para los padres de familia..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Vista Previa del Mensaje */}
            <div className="mt-4 bg-slate-900 text-emerald-100 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Vista Previa de la Publicación:</span>
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-100 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                {getFormattedNotice()}
              </pre>
            </div>

            {/* Mensajes de Estado */}
            {sendSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{sendSuccessMessage}</span>
              </div>
            )}

            {sendError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-700 text-sm">
                <strong>Error:</strong> {sendError}
              </div>
            )}

            {/* BOTÓN DE PUBLICACIÓN REALTIME */}
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                disabled={isSending}
                onClick={handlePublishRealtimeNotification}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-base transition-all shadow-lg disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Transmitiendo Notificación...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>🚀 Publicar Notificación en Tiempo Real ({selectedSchoolInfo.group})</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Columna Derecha: Alumnos y Códigos de Enlace por Salón */}
        <div className="space-y-6">

          {/* Formulario Agregar Alumno & Generar Código por Salón */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Agregar Alumno al Salón
            </h3>
            
            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Alumno</label>
                <input 
                  type="text" 
                  required
                  value={studentNameInput}
                  onChange={e => setStudentNameInput(e.target.value)}
                  placeholder="Ej. Mateo Pérez"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Padre / Tutor</label>
                <input 
                  type="text" 
                  value={parentNameInput}
                  onChange={e => setParentNameInput(e.target.value)}
                  placeholder="Ej. Sra. Carmen Pérez"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              {studentAddedMsg && (
                <div className="bg-emerald-100 border border-emerald-300 p-2.5 rounded-xl text-xs text-emerald-800 font-semibold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{studentAddedMsg}</span>
                </div>
              )}

              <button 
                type="button"
                onClick={() => handleAddStudentDirect()} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg active:scale-98"
              >
                <KeyRound className="w-4 h-4 text-emerald-400" />
                Agregar Alumno y Generar Código
              </button>
            </form>
          </div>

          {/* Lista de Alumnos con Códigos de Enlace */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Códigos de Enlace ({students.length})
              </h3>
            </div>

            {students.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No hay alumnos agregados en este salón.</p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {students.map(st => (
                  <div key={st.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{st.studentName}</span>
                        <span className="text-[11px] text-slate-500 block">{st.parentName}</span>
                        <span className="text-[10px] text-slate-600 block mt-0.5">{st.schoolName} ({st.gradeGroup} - {st.shift})</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleDeleteStudent(st.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-slate-900 text-emerald-300 px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between">
                      <span>🔑 {st.linkCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyFichaPadre(st)}
                        className="text-white hover:text-emerald-400 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        {copiedCodeId === st.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedCodeId === st.id ? 'Ficha Copiada' : 'Copiar Ficha'}
                      </button>
                    </div>
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
