'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { KeyRound, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, Clock, Calendar, AlertCircle, Volume2, X, Phone, Mail, FileText, Share2, QrCode, Plus } from 'lucide-react';
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
  reactions?: Record<string, number>;
}

export default function FamiliasPortalPage() {
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [linkedSalons, setLinkedSalons] = useState<SalonInfo[]>([]);
  const [activeSalonIndex, setActiveSalonIndex] = useState(0);
  const [isAddingCode, setIsAddingCode] = useState(false);

  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const activeSalonInfo = linkedSalons[activeSalonIndex] || null;

  // Cargar aulas vinculadas desde localStorage al montar
  useEffect(() => {
    localStorage.setItem('liberapro_user_type', 'family');
    
    let loadedSalons: SalonInfo[] = [];
    const savedArray = localStorage.getItem('liberapro_parent_linked_salons');
    if (savedArray) {
      try {
        loadedSalons = JSON.parse(savedArray);
      } catch (e) {}
    } else {
      // Migración desde el sistema viejo de un solo código
      const savedSingle = localStorage.getItem('liberapro_parent_linked_salon');
      if (savedSingle) {
        try {
          loadedSalons = [JSON.parse(savedSingle)];
          localStorage.setItem('liberapro_parent_linked_salons', JSON.stringify(loadedSalons));
        } catch (e) {}
      }
    }

    if (loadedSalons.length > 0) {
      setLinkedSalons(loadedSalons);
    } else {
      setIsAddingCode(true); // Mostrar formulario inicial
    }
  }, []);

  // Recargar mensajes al cambiar de salón activo
  useEffect(() => {
    if (!activeSalonInfo) return;

    let isMounted = true;
    let channel: any;
    setRealtimeStatus('connecting');

    const loadMessagesAndSubscribe = async (info: SalonInfo) => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('parent_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (data && data.length > 0) {
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
              created_at: m.created_at,
              reactions: m.reactions || {}
            }));
            setMessages(formatted);
          } else {
            setMessages([{
              id: 'welcome-1',
              category: 'recordatorio',
              title: `¡Aula Vinculada: ${info.gradeGroup}!`,
              details: `Tu dispositivo ha quedado vinculado.`,
              formatted_content: `📌 *AULA CONECTADA EXITOSAMENTE*\n\nEstimado tutor de ${info.studentName}:\n\nTu dispositivo está enlazado con el código *${info.linkCode}*.\n\nTan pronto como el docente publique una tarea o aviso, aparecerá aquí.`,
              created_at: new Date().toISOString()
            }]);
          }
        } else {
          setMessages([{
            id: 'welcome-1',
            category: 'recordatorio',
            title: `¡Aula Vinculada: ${info.gradeGroup}!`,
            details: `Tu dispositivo ha quedado vinculado.`,
            formatted_content: `📌 *AULA CONECTADA EXITOSAMENTE*\n\nEstimado tutor de ${info.studentName}:\n\nTu dispositivo está enlazado con el código *${info.linkCode}*.\n\n*Atentamente,*\nDirección Escolar`,
            created_at: new Date().toISOString()
          }]);
        }
      } catch (e) {}

      // Suscribirse
      try {
        channel = supabase
          .channel(`familias-${info.linkCode}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'parent_messages' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newMsg = payload.new as any;
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
                    created_at: newMsg.created_at || new Date().toISOString(),
                    reactions: newMsg.reactions || {}
                  };
                  setMessages(prev => [msgObj, ...prev]);
                  if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([200, 100, 200]);
                }
              } else if (payload.eventType === 'UPDATE') {
                 // Actualizar reacciones
                 setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, reactions: payload.new.reactions } : m));
              }
            }
          )
          .subscribe((status) => {
            if (isMounted) setRealtimeStatus('connected');
          });
      } catch (e) {}
    };

    loadMessagesAndSubscribe(activeSalonInfo);

    return () => {
      isMounted = false;
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [activeSalonInfo]);

  const normalizeCode = (code: string) => code.trim().toUpperCase();

  const handleLinkCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCodeInput.trim()) return;

    if (linkedSalons.length >= 3) {
      setErrorMsg('Solo puedes vincular un máximo de 3 alumnos/aulas.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    const cleanCode = normalizeCode(linkCodeInput);

    // Evitar duplicados
    if (linkedSalons.some(s => s.linkCode === cleanCode)) {
      setErrorMsg('Este código ya está vinculado en tu dispositivo.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data } = await supabase
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
        const updatedSalons = [...linkedSalons, info];
        setLinkedSalons(updatedSalons);
        localStorage.setItem('liberapro_parent_linked_salons', JSON.stringify(updatedSalons));
        setActiveSalonIndex(updatedSalons.length - 1);
        setIsAddingCode(false);
        setLinkCodeInput('');
      } else {
        // Buscar localmente
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
            const updatedSalons = [...linkedSalons, localInfo];
            setLinkedSalons(updatedSalons);
            localStorage.setItem('liberapro_parent_linked_salons', JSON.stringify(updatedSalons));
            setActiveSalonIndex(updatedSalons.length - 1);
            setIsAddingCode(false);
            setLinkCodeInput('');
            return;
          }
        }
        setErrorMsg('Código de Enlace no encontrado. Verifica el código entregado por tu maestro(a).');
      }
    } catch (err: any) {
      setErrorMsg('Error al verificar el código. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlink = (indexToRemove: number) => {
    if (confirm('¿Estás seguro de que quieres desvincular este código? Dejarás de recibir avisos.')) {
      const updatedSalons = linkedSalons.filter((_, i) => i !== indexToRemove);
      setLinkedSalons(updatedSalons);
      localStorage.setItem('liberapro_parent_linked_salons', JSON.stringify(updatedSalons));
      
      if (updatedSalons.length === 0) {
        setIsAddingCode(true);
        setActiveSalonIndex(0);
        setMessages([]);
      } else {
        setActiveSalonIndex(Math.max(0, indexToRemove - 1));
      }
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    // 1. Optimistic update
    setMessages(prev => prev.map(m => {
      if (m.id === messageId && !m.id.startsWith('welcome-')) {
        const current = m.reactions || {};
        return {
          ...m,
          reactions: { ...current, [emoji]: (current[emoji] || 0) + 1 }
        };
      }
      return m;
    }));

    if (messageId.startsWith('welcome-')) return; // No guardar reacciones de mensajes locales

    // 2. Base de datos
    try {
      const supabase = createClient();
      const { data } = await supabase.from('parent_messages').select('reactions').eq('id', messageId).single();
      const current = data?.reactions || {};
      const newReactions = { ...current, [emoji]: (current[emoji] || 0) + 1 };
      
      await supabase.from('parent_messages').update({ reactions: newReactions }).eq('id', messageId);
    } catch (e) {
      console.error('Error al enviar reacción');
    }
  };

  const getCategoryBadge = (category: ParentMessage['category']) => {
    switch (category) {
      case 'materiales': return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">🎨 Materiales</span>;
      case 'tareas': return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">📝 Tarea</span>;
      case 'actividades': return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">🌟 Actividades</span>;
      default: return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">📌 Recordatorio</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans">
      
      {/* Top Header */}
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
          <span>Volver al Inicio</span>
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">LiberaPro Familias</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto my-auto py-6 space-y-6">

        {/* Tabs de Alumnos / Selector */}
        {linkedSalons.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {linkedSalons.map((salon, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveSalonIndex(i);
                  setIsAddingCode(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  activeSalonIndex === i && !isAddingCode
                    ? 'bg-emerald-600 text-white shadow-emerald-900/50' 
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {salon.studentName?.split(' ')[0] || salon.gradeGroup}
              </button>
            ))}
            
            {linkedSalons.length < 3 && (
              <button
                onClick={() => setIsAddingCode(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  isAddingCode 
                    ? 'bg-emerald-600 text-white shadow-emerald-900/50' 
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-3 h-3" /> Agregar
              </button>
            )}
          </div>
        )}

        {/* Formulario de Vinculación */}
        {isAddingCode ? (
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto">
                👨‍👩‍👧
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Vincular Alumno
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Ingresa el Código de Enlace entregado por tu maestro(a) para sincronizar avisos.
              </p>
            </div>

            <form onSubmit={handleLinkCodeSubmit} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  Código de Enlace
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
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Vincular Aula</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : activeSalonInfo && (

          /* Feed de Avisos Activo */
          <div className="space-y-6 animate-in slide-in-from-bottom-2">
            
            {/* Header del Aula Vinculada */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1 flex items-center gap-1">
                  🏫 {activeSalonInfo.schoolName}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {activeSalonInfo.gradeGroup} <span className="text-slate-400 font-normal"> — {activeSalonInfo.shift}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>👤 <strong>Alumno:</strong> {activeSalonInfo.studentName}</span>
                  <button 
                    type="button" 
                    onClick={() => handleUnlink(activeSalonIndex)}
                    className="text-rose-400 hover:underline text-[11px] ml-2"
                  >
                    Desvincular
                  </button>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-mono self-end">
                  <span className={`w-2 h-2 rounded-full ${realtimeStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span>{realtimeStatus === 'connected' ? 'TIEMPO REAL ACTIVO' : 'CONECTANDO...'}</span>
                </div>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2 self-end"
                >
                  <Share2 className="w-3 h-3" />
                  Invitar Maestra(o)
                </button>
              </div>
            </div>

            {/* Listado de Comunicados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  Publicaciones y Avisos ({messages.length})
                </h4>
              </div>

              {messages.map((msg) => (
                <article 
                  key={msg.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-3">
                    <div className="space-y-1">
                      {getCategoryBadge(msg.category)}
                      <h5 className="text-lg font-bold text-white leading-snug">{msg.title}</h5>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.due_date && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-amber-300 flex items-center gap-2 font-medium">
                      <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span><strong>Fecha / Evento:</strong> {msg.due_date}</span>
                    </div>
                  )}

                  <div className="pt-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed">
                      {msg.formatted_content}
                    </pre>
                  </div>

                  {/* Reacciones */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/50">
                    {[
                      { emoji: '👍', key: 'thumb' },
                      { emoji: '❤️', key: 'heart' },
                      { emoji: '👏', key: 'clap' },
                      { emoji: '✅', key: 'check' }
                    ].map(r => (
                      <button 
                        key={r.key}
                        onClick={() => handleReaction(msg.id, r.key)}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span className="text-base leading-none">{r.emoji}</span>
                        <span className="text-slate-400 font-bold">{msg.reactions?.[r.key] || 0}</span>
                      </button>
                    ))}
                  </div>

                </article>
              ))}
              
              {messages.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Aún no hay avisos para este salón.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-3xl w-full mx-auto text-center text-[11px] text-slate-400 border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 LiberaPro Familias</span>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-emerald-400 transition-colors underline">Política Privacidad</button>
          <span>•</span>
          <button onClick={() => setActiveLegalModal('terms')} className="hover:text-emerald-400 transition-colors underline">Términos</button>
          <span>•</span>
          <button onClick={() => setActiveLegalModal('contact')} className="hover:text-emerald-400 transition-colors underline">Contacto</button>
        </div>
      </footer>

      {/* MODAL INVITACIÓN MAESTROS */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl relative text-center">
            
            <button 
              type="button" 
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Invita a tu Maestra(o)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recomienda <strong>LiberaPro</strong> para recibir avisos sin compartir números de teléfono personales.
              </p>

              <div className="bg-white p-4 rounded-2xl inline-block mx-auto">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://www.liberapro.mx" 
                  alt="QR Code LiberaPro"
                  className="w-40 h-40"
                />
              </div>
              <p className="text-[10px] text-slate-500">Muestra este código para que lo escaneen</p>

              <div className="border-t border-slate-800 pt-4 mt-2">
                <a 
                  href="mailto:?subject=Invitación a LiberaPro&body=Hola Maestra/o, le comparto la plataforma LiberaPro (https://www.liberapro.mx) para generar listas de asistencia, planeaciones y mandarnos avisos escolares de forma segura."
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                >
                  <Mail className="w-4 h-4" />
                  Enviar por Correo Electrónico
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LEGAL */}
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
                  Política de Privacidad
                </h3>
                <div className="text-xs text-slate-300 space-y-2">
                  <p>1. <strong>Privacidad Telefónica:</strong> Los docentes no comparten su celular.</p>
                  <p>2. <strong>Uso de Datos:</strong> El Código vincula el dispositivo con el aula.</p>
                  <p>3. <strong>Seguridad:</strong> Datos cifrados con Supabase Realtime.</p>
                </div>
              </div>
            )}
            
            {activeLegalModal === 'terms' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Términos de Uso
                </h3>
                <div className="text-xs text-slate-300 space-y-2">
                  <p>1. <strong>Uso Autorizado:</strong> Canal para comunicados y tareas escolares.</p>
                  <p>2. <strong>Código:</strong> Único por alumno/aula. Protéjalo.</p>
                </div>
              </div>
            )}

            {activeLegalModal === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  Contacto
                </h3>
                <div className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono">
                  <p>soporte@liberapro.mx</p>
                </div>
              </div>
            )}

            <button 
              type="button" 
              onClick={() => setActiveLegalModal(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Volver</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
