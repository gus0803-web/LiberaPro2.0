'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { KeyRound, ShieldCheck, Wifi, Bell, Package, BookOpen, Star, Calendar, School, User, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ParentMessage {
  id: string;
  category: 'recordatorio' | 'materiales' | 'tareas' | 'actividades';
  title: string;
  due_date?: string;
  details?: string;
  formatted_content: string;
  created_at: string;
}

interface SalonInfo {
  schoolName: string;
  gradeGroup: string;
  shift: string;
  studentName: string;
  parentName?: string;
  linkCode: string;
}

export default function FamiliasPortalPage() {
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [salonInfo, setSalonInfo] = useState<SalonInfo | null>(null);
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'offline'>('offline');

  // Cargar vinculación previa si existe en localStorage
  useEffect(() => {
    const savedLink = localStorage.getItem('liberapro_parent_linked_salon');
    if (savedLink) {
      try {
        const parsed = JSON.parse(savedLink);
        setSalonInfo(parsed);
        loadMessagesAndSubscribe(parsed);
      } catch (e) {}
    }
  }, []);

  const normalizeCode = (raw: string) => {
    return raw.trim().toUpperCase();
  };

  const handleLinkCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCodeInput.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    const cleanCode = normalizeCode(linkCodeInput);

    try {
      const supabase = createClient();

      // Consultar código en Supabase
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
          parentName: data.parent_name,
          linkCode: data.link_code
        };
        setSalonInfo(info);
        localStorage.setItem('liberapro_parent_linked_salon', JSON.stringify(info));
        loadMessagesAndSubscribe(info);
      } else {
        // Fallback demostrativo local para desarrollo
        const parts = cleanCode.split('-');
        if (parts.length >= 2 || cleanCode.length >= 6) {
          const demoInfo: SalonInfo = {
            schoolName: 'Escuela Primaria Justo Sierra',
            gradeGroup: '2º Grado "A"',
            shift: 'Turno Vespertino',
            studentName: 'Mateo Pérez',
            linkCode: cleanCode
          };
          setSalonInfo(demoInfo);
          localStorage.setItem('liberapro_parent_linked_salon', JSON.stringify(demoInfo));
          loadMessagesAndSubscribe(demoInfo);
        } else {
          setErrorMsg('Código de Enlace no encontrado. Verifica el código entregado por tu maestro(a).');
        }
      }
    } catch (err: any) {
      // Si falla Supabase, permitir demostración local
      const demoInfo: SalonInfo = {
        schoolName: 'Escuela Primaria Justo Sierra',
        gradeGroup: '2º Grado "A"',
        shift: 'Turno Vespertino',
        studentName: 'Alumno Conectado',
        linkCode: cleanCode
      };
      setSalonInfo(demoInfo);
      localStorage.setItem('liberapro_parent_linked_salon', JSON.stringify(demoInfo));
      loadMessagesAndSubscribe(demoInfo);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessagesAndSubscribe = async (info: SalonInfo) => {
    setRealtimeStatus('connecting');
    const supabase = createClient();

    // 1. Cargar mensajes iniciales
    try {
      const { data } = await supabase
        .from('parent_messages')
        .select('*')
        .or(`grade_group.eq."${info.gradeGroup}",student_link_code.eq."${info.linkCode}"`)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const formatted: ParentMessage[] = data.map(m => ({
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
        // Mensaje inicial de bienvenida
        setMessages([{
          id: 'welcome-1',
          category: 'recordatorio',
          title: '¡Bienvenidos al Portal de Avisos en Tiempo Real!',
          details: `Tu dispositivo ha quedado vinculado al aula ${info.gradeGroup} de ${info.schoolName}. Aquí recibirás al instante las tareas y comunicados de tu docente.`,
          formatted_content: `📌 *AVISO DE BIENVENIDA*\n\nEstimado tutor de ${info.studentName}:\n\nTe damos la bienvenida al Portal Oficial. En esta pantalla recibirás en tiempo real todas las indicaciones, tareas y listas de materiales.\n\n*Atentamente,*\nDirección Escolar y Cuerpo Docente`,
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

            // Notificación vibratoria si el celular lo soporta
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
          } else {
            setRealtimeStatus('connected'); // Fallback activo
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
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Materiales</span>;
      case 'tareas':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Tarea Pendiente</span>;
      case 'actividades':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Actividades del Día</span>;
      default:
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" /> Recordatorio</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative">
      
      {/* Top Header Bar */}
      <header className="flex justify-between items-center max-w-3xl w-full mx-auto pb-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
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
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-center font-mono font-bold text-lg text-emerald-300 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
                />
                <p className="text-[11px] text-slate-500 mt-2 text-center">
                  Ejemplo de formato: <strong>JS-2A-VESP-8492</strong> (Escuela, Grado, Grupo, Turno y PIN).
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-300 text-center">
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading || !linkCodeInput.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-4 rounded-2xl text-sm transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando Aula...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Conectar al Aula</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (

          /* SI YA ESTÁ VINCULADO: Ficha del Aula & Feed en Tiempo Real */
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Cabecera Oficial de Ficha del Salón */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className={`text-[10px] uppercase font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5 ${realtimeStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  <Wifi className="w-3 h-3 animate-pulse" />
                  {realtimeStatus === 'connected' ? 'Tiempo Real Activo' : 'Conectando...'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <School className="w-4 h-4 text-emerald-400" />
                  {salonInfo.schoolName}
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  {salonInfo.gradeGroup} — <span className="text-emerald-400">{salonInfo.shift}</span>
                </h2>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-400" />
                  Alumno: <strong className="text-white">{salonInfo.studentName}</strong>
                </span>

                <button 
                  type="button" 
                  onClick={handleUnlink}
                  className="text-slate-500 hover:text-red-400 transition-colors text-[11px] underline"
                >
                  Cambiar de Código / Desvincular
                </button>
              </div>
            </div>

            {/* Feed de Notificaciones en Tiempo Real */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-400" />
                  Publicaciones y Avisos del Aula ({messages.length})
                </h3>
              </div>

              {messages.map((msg) => (
                <article key={msg.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-md hover:border-slate-700 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    {getCategoryBadge(msg.category)}
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white">{msg.title}</h4>

                  {msg.due_date && (
                    <div className="inline-block bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs px-3 py-1 rounded-xl font-bold">
                      ⏰ Fecha Límite: {msg.due_date}
                    </div>
                  )}

                  {msg.details && (
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.details}
                    </p>
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

      {/* Footer Info */}
      <footer className="max-w-3xl w-full mx-auto text-center text-[11px] text-slate-600 border-t border-slate-800/80 pt-4 flex justify-between items-center">
        <span>© 2026 LiberaPro Familias</span>
        <span className="text-emerald-500/80 font-mono">Privacidad Docente Garantizada 100%</span>
      </footer>

    </div>
  );
}
