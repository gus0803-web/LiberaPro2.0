import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>No autorizado</div>;
  }

  // 1. Obtener Dispositivos
  const { data: devices } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', user.id)
    .order('last_active', { ascending: false });

  // 2. Obtener Perfil / Suscripción
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Server Action para eliminar dispositivo
  async function removeDevice(formData: FormData) {
    'use server';
    const deviceId = formData.get('deviceId') as string;
    if (!deviceId) return;
    
    const supabaseAction = await createClient();
    const { data: { user: actionUser } } = await supabaseAction.auth.getUser();
    if (!actionUser) return;

    await supabaseAction
      .from('user_devices')
      .delete()
      .eq('id', deviceId)
      .eq('user_id', actionUser.id);
      
    revalidatePath('/app/settings');
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <section className="space-y-2">
        <h2 className="text-3xl font-light text-white tracking-tight">
          Configuración de <span className="font-bold text-turquoise-neon">Cuenta</span>
        </h2>
        <p className="text-gray-400 font-light">Gestiona tus dispositivos de acceso y el estado de tu suscripción premium.</p>
      </section>

      {/* Subscription Card */}
      <section className="bg-volcanic-800/50 rounded-3xl p-8 border border-white/5 shadow-glass">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <svg className="w-6 h-6 mr-3 text-gold-pale" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Suscripción LiberaPro
        </h3>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-volcanic-900 rounded-2xl border border-white/5">
          <div>
            <p className="text-sm text-gray-400 mb-1">Estado Actual</p>
            <p className="text-2xl font-black text-white capitalize flex items-center">
              {profile?.subscription_status === 'active' ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-turquoise-neon mr-2 animate-pulse"></span>
                  Activa (Premium)
                </>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  Inactiva
                </>
              )}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <button className="bg-white/5 border border-white/10 text-white px-6 py-2 rounded-xl hover:bg-white/10 transition-all font-medium text-sm">
              Descargar Facturas
            </button>
            <button className="bg-gold-pale text-volcanic-900 px-6 py-2 rounded-xl hover:bg-white transition-all font-bold text-sm">
              Gestionar en Stripe
            </button>
          </div>
        </div>
      </section>

      {/* Device Management Card */}
      <section className="bg-volcanic-800/50 rounded-3xl p-8 border border-white/5 shadow-glass">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 flex items-center">
              <svg className="w-6 h-6 mr-3 text-turquoise-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Dispositivos Registrados
            </h3>
            <p className="text-sm text-gray-400">Por seguridad de tu cuenta, el límite es de 2 dispositivos activos.</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-turquoise-neon">{devices?.length || 0}</span>
            <span className="text-xl text-gray-500"> / 2</span>
          </div>
        </div>

        <div className="space-y-4">
          {devices && devices.length > 0 ? (
            devices.map((device) => (
              <div key={device.id} className="flex justify-between items-center p-5 bg-volcanic-900 rounded-2xl border border-white/5">
                <div>
                  <p className="font-medium text-white break-all">ID: {device.fingerprint_hash.substring(0, 16)}...</p>
                  <p className="text-xs text-gray-500 mt-1">Último acceso: {new Date(device.last_active).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <form action={removeDevice}>
                  <input type="hidden" name="deviceId" value={device.id} />
                  <button type="submit" className="text-red-400 hover:text-red-300 text-sm font-semibold hover:underline bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20 transition-all">
                    Eliminar Acceso
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm p-4 text-center border border-dashed border-white/10 rounded-2xl">
              No tienes dispositivos registrados. Inicia sesión en tus equipos para autorizarlos.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
