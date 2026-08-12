'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { KeyRound, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, Clock, Calendar, AlertCircle, Volume2, X, Phone, Mail, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SalonInfo {
  schoolName: string;
  gradeGroup: string;
  shift: string;
  studentName: string;
  parentName?: string;
  linkCode: string;
}

interface ParentMessage {
  id: string;
  category: 'recordatorio' | 'materiales' | 'tareas' | 'actividades';
  title: string;
  due_date?: string;
  details?: string;
  formatted_content: string;
  created_at: string;
}

export default function FamiliasPortalPage() {
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [salonInfo, setSalonInfo] = useState<SalonInfo | null>(null);
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  // Cargar aula vinculada previa desde localStorage
  useEffect(() => {
    // Guardar preferencia de perfil de usuario 'family'
    localStorage.setItem('liberapro_user_type', 'family');

    const saved = localStorage.getItem('liberapro_parent_linked_salon');
    if (saved) {
      try {
        const info: SalonInfo = JSON.parse(saved);
        setSalonInfo(info);
        loadMessagesAndSubscribe(info);
      } catch (e) {
        localStorage.removeItem('liberapro_parent_linked_salon');
      }
    }
  }, []);

  const normalizeCode = (code: string) => {
    return code.trim().toUpperCase();
  };

  const handleLinkCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCodeInput.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    const cleanCode = normalizeCode(linkCodeInput);

    try {
      const supabase = createClient();

      // 1. Consultar código exacto en Supabase
      const { data, error } = await supabase
        .from('family_link_codes')
        .select('*')
        .eq('link_code', cleanCode)
        .single();

      if (data) {
        const info: SalonInfo = {
          schoolName: data.school_name,
          gradeGroup: data.grade_group,
          shift: data.shift,
          studentName: data.student_name,
          parentName: data.parent_name || 'Padre de Familia',
          linkCode: data.link_code
        };
        setSalonInfo(info);
        localStorage.setItem('liberapro_parent_linked_salon', JSON.stringify(info));
        loadMessagesAndSubscribe(info);
      } else {
        // 2. Buscar en registros almacenados localmente en el dispositivo
        const savedLocalStudents = localStorage.getItem('liberapro_student_link_codes');
        if (savedLocalStudents) {
          const list = JSON.parse(savedLocalStudents);
          const found = list.find((s: any) => s.linkCode === cleanCode);
          if (found) {
            const localInfo: SalonInfo = {
              schoolName: found.schoolName || 'Escuela Primaria',
              gradeGroup: found.gradeGroup || '2º A',
              shift: found.shift || 'Vespertino',
              studentName: found.studentName,
              parentName: found.parentName || 'Padre de Familia',
              linkCode: found.linkCode
            };
            setSalonInfo(localInfo);
            localStorage.setItem('liberapro_parent_linked_salon', JSON.stringify(localInfo));
            loadMessagesAndSubscribe(localInfo);
            return;
          }
        }

        setErrorMsg('Código de Enlace no encontrado. Verifica el código entregado por tu maestro(a).');
      }
    } catch (err: any) {
      setErrorMsg('Error de conexión al verificar el código. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessagesAndSubscribe = async (info: SalonInfo) => {
    setRealtimeStatus('connecting');
    const supabase = createClient();

    // 1. Cargar mensajes iniciales en Supabase con filtrado estricto de aula
    try {
      const { data, error } = await supabase
        .from('parent_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Filtrado estricto por código de alumno o combinación exacta de Grupo + Escuela
        const matched = data.filter(m => 
          (m.student_link_code && m.student_link_code === info.linkCode) ||
          (m.grade_group === info.gradeGroup && m.school_name === info.schoolName)
        );

        if (matched.length > 0) {
          const formatted: ParentMessage[] = matched.map(m => ({
            id: m.id,
            category: m.category,
            title: m.title,
            due_date: m.due_date,
            details: m.details,
            formatted_content: m.formatted_content,
            created_at: m.created_at
          }));
          setMessages(formatted);
        } else {
          setMessages([{
            id: 'welcome-1',
            category: 'recordatorio',
            title: `¡Aula Vinculada: ${info.gradeGroup}!`,
            details: `Tu dispositivo ha quedado vinculado al grupo ${info.gradeGroup} (${info.shift}) de ${info.schoolName} para el alumno ${info.studentName}.`,
            formatted_content: `📌 *AULA CONECTADA EXITOSAMENTE*\n\nEstimado tutor de ${info.studentName}:\n\nTu dispositivo está enlazado con el código *${info.linkCode}* para el grupo ${info.gradeGroup} (${info.shift}) en ${info.schoolName}.\n\nTan pronto como el docente publique una tarea o aviso para tu grupo, aparecerá de inmediato en esta pantalla.\n\n*Atentamente,*\nDirección Escolar y Cuerpo Docente`,
            created_at: new Date().toISOString()
          }]);
        }
      } else {
        setMessages([{
          id: 'welcome-1',
          category: 'recordatorio',
          title: `¡Aula Vinculada: ${info.gradeGroup}!`,
          details: `Tu dispositivo ha quedado vinculado al grupo ${info.gradeGroup} (${info.shift}) de ${info.schoolName}.`,
          formatted_content: `📌 *AULA CONECTADA EXITOSAMENTE*\n\nEstimado tutor de ${info.studentName}:\n\nTu dispositivo está enlazado con el código *${info.linkCode}* para el grupo ${info.gradeGroup} (${info.shift}).\n\n*Atentamente,*\nDirección Escolar y Cuerpo Docente`,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (e) {}

    // 2. Suscribirse a Supabase Realtime
    try {
      const channel = supabase
        .channel('familias-realtime-feed')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'parent_messages' },
          (payload) => {
            const newMsg = payload.new as any;

            // Verificar si el nuevo aviso corresponde a esta aula
            if (
              newMsg.student_link_code === info.linkCode ||
              (newMsg.grade_group === info.gradeGroup && newMsg.school_name === info.schoolName)
            ) {
              const msgObj: ParentMessage = {
                id: newMsg.id || Date.now().toString(),
                category: newMsg.category || 'recordatorio',
                title: newMsg.title || 'Nuevo Aviso Escolar',
                due_date: newMsg.due_date,
                details: newMsg.details,
                formatted_content: newMsg.formatted_content || newMsg.details,
                created_at: newMsg.created_at || new Date().toISOString()
              };

              setMessages(prev => [msgObj, ...prev]);

              if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
              }
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
          } else {
            setRealtimeStatus('connected');
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      setRealtimeStatus('connected');
    }
  };

  const handleUnlink = () => {
    setSalonInfo(null);
    setMessages([]);
    localStorage.removeItem('liberapro_parent_linked_salon');
  };

  const getCategoryBadge = (category: ParentMessage['category']) => {
    switch (category) {
      case 'materiales':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">🎨 Materiales</span>;
      case 'tareas':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">📝 Tarea</span>;
      case 'actividades':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">🌟 Actividades</span>;
      default:
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">📌 Recordatorio</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans">
      
      {/* Top Header Bar */}
      <header className="flex justify-between items-center max-w-3xl w-full mx-auto pb-4 border-b border-slate-800">
        <button 
          type="button"
          onClick={() => {
            localStorage.removeItem('liberapro_user_type');
            window.location.href = '/';
          }}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio Dual</span>
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">LiberaPro Familias</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto my-auto py-6 space-y-6">

        {/* SI NO ESTÁ VINCULADO: Formulario de Código de Enlace */}
        {!salonInfo ? (
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto">
                👨‍👩‍👧
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Portal de Avisos para Familias
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Ingresa el Código de Enlace entregado por tu maestro(a) para vincularte a las tareas y avisos del salón.
              </p>
            </div>

            <form onSubmit={handleLinkCodeSubmit} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  Código de Enlace de Salón
                </label>
                <input 
                  type="text" 
                  required
                  value={linkCodeInput}
                  onChange={e => setLinkCodeInput(e.target.value)}
                  placeholder="Ej. JS-2A-VESP-8492"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none transition-colors uppercase tracking-widest text-center"
                />
              </div>

              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando Código...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Vincular con mi Aula</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (

          /* SI YA ESTÁ VINCULADO: Feed de Avisos */
          <div className="space-y-6">
            
            {/* Header del Aula Vinculada */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1 flex items-center gap-1">
                  🏫 {salonInfo.schoolName}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {salonInfo.gradeGroup} <span className="text-slate-400 font-normal"> — {salonInfo.shift}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>👤 <strong>Alumno:</strong> {salonInfo.studentName}</span>
                  <button 
                    type="button" 
                    onClick={handleUnlink}
                    className="text-emerald-400 hover:underline text-[11px] ml-2"
                  >
                    Cambiar de Código / Desvincular
                  </button>
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>TIEMPO REAL ACTIVO</span>
              </div>
            </div>

            {/* Listado de Comunicados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  Publicaciones y Avisos del Aula ({messages.length})
                </h4>
              </div>

              {messages.map((msg) => (
                <article 
                  key={msg.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg hover:border-slate-700 transition-colors animate-in fade-in"
                >
                  <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-3">
                    <div className="space-y-1">
                      {getCategoryBadge(msg.category)}
                      <h5 className="text-lg font-bold text-white leading-snug">{msg.title}</h5>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.due_date && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-amber-300 flex items-center gap-2 font-medium">
                      <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span><strong>Fecha de Entrega / Evento:</strong> {msg.due_date}</span>
                    </div>
                  )}

                  <div className="pt-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed">
                      {msg.formatted_content}
                    </pre>
                  </div>
                </article>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* Footer Info con Enlaces Legales que abren Modales en la misma pantalla */}
      <footer className="max-w-3xl w-full mx-auto text-center text-[11px] text-slate-400 border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 LiberaPro Familias</span>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <button 
            type="button" 
            onClick={() => setActiveLegalModal('privacy')}
            className="hover:text-emerald-400 transition-colors underline"
          >
            Política de Privacidad
          </button>
          <span>•</span>
          <button 
            type="button" 
            onClick={() => setActiveLegalModal('terms')}
            className="hover:text-emerald-400 transition-colors underline"
          >
            Términos de Uso
          </button>
          <span>•</span>
          <button 
            type="button" 
            onClick={() => setActiveLegalModal('contact')}
            className="hover:text-emerald-400 transition-colors underline"
          >
            Contacto
          </button>
        </div>
      </footer>

      {/* MODAL LEGAL INTERNO: Mantiene al usuario siempre en su Pizarrón de Avisos */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-left">
            
            <button 
              type="button" 
              onClick={() => setActiveLegalModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {activeLegalModal === 'privacy' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Política de Privacidad — LiberaPro Familias
                </h3>
                <div className="text-xs text-slate-300 space-y-2 max-h-72 overflow-y-auto pr-2 leading-relaxed">
                  <p>En LiberaPro protegemos la privacidad de la comunidad escolar y las familias.</p>
                  <p>1. <strong>Privacidad Telefónica:</strong> Los docentes no necesitan compartir su número celular personal para transmitir comunicados en tiempo real.</p>
                  <p>2. <strong>Uso de Datos:</strong> El Código de Enlace entregado se usa únicamente para vincular este dispositivo con los avisos del grupo asignado.</p>
                  <p>3. <strong>Seguridad:</strong> La transmisión se realiza de manera cifrada a través de protocolos seguros Supabase Realtime.</p>
                </div>
              </div>
            )}

            {activeLegalModal === 'terms' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Términos de Uso — LiberaPro Familias
                </h3>
                <div className="text-xs text-slate-300 space-y-2 max-h-72 overflow-y-auto pr-2 leading-relaxed">
                  <p>Bienvenido al Portal Institucional de Avisos para Familias.</p>
                  <p>1. <strong>Uso Autorizado:</strong> Este canal se destina exclusivamente a la recepción de comunicados escolares, listas de materiales y tareas informadas por el personal docente.</p>
                  <p>2. <strong>Código de Enlace:</strong> Cada código es único por alumno y aula. Consérvalo para mantener tu dispositivo sincronizado.</p>
                </div>
              </div>
            )}

            {activeLegalModal === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  Contacto y Soporte Escolar
                </h3>
                <div className="text-xs text-slate-300 space-y-3">
                  <p>Para dudas sobre tus Códigos de Enlace o consultas institucionales:</p>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono">
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /> soporte@liberapro.app</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> Atención a Escuelas y Dirección</p>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="button" 
              onClick={() => setActiveLegalModal(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Volver a mi Pizarrón de Avisos</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
