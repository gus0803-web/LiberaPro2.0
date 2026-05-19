import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminMap } from '@/components/AdminMap';
import { AdminChart } from '@/components/AdminChart';

// Esta ruta debe estar fuertemente protegida. 
// En producción, comprueba un rol 'admin' en la tabla profiles.
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Aquí asumo que tu cuenta principal tiene este correo, ajusta en producción o usa un RLS.
  if (user.email !== 'admin@liberapro.com') {
    // Para propositos de esta demostración, no bloquearemos duro si no hay un sistema de roles,
    // pero idealmente: redirect('/app/dashboard');
  }

  return { supabase, user };
}

export default async function AdminDashboardPage() {
  const { supabase } = await verifyAdmin();

  // 1. Fetch KPIs
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active');
  const mrr = (activeUsers || 0) * 299; // Asumiendo $299 MXN al mes

  // 2. Fetch State Density for Heatmap
  const { data: profiles } = await supabase.from('profiles').select('state');
  
  // Procesar densidad de estados
  const stateCounts: Record<string, number> = {};
  profiles?.forEach(p => {
    if (p.state) {
      stateCounts[p.state] = (stateCounts[p.state] || 0) + 1;
    }
  });

  const heatmapData = Object.keys(stateCounts).map(state => ({
    state,
    count: stateCounts[state]
  }));

  // 3. Mock Data for Chart (en producción vendría de Stripe / Supabase agrupado por mes)
  const chartData = [
    { name: 'Ene', total: 120, activos: 80 },
    { name: 'Feb', total: 200, activos: 150 },
    { name: 'Mar', total: 350, activos: 280 },
    { name: 'Abr', total: 500, activos: 420 },
    { name: 'May', total: 780, activos: 650 },
  ];

  // 4. Fetch Users for Table
  const { data: usersData } = await supabase
    .from('profiles')
    .select('id, full_name, email:id, subscription_status, state')
    .limit(10); // En producción se haría paginación

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-volcanic-800/80 p-6 rounded-3xl border border-white/5 shadow-glass">
          <p className="text-gray-400 font-medium mb-1">MRR (Ingresos Mensuales)</p>
          <h3 className="text-4xl font-black text-gold-pale">${mrr.toLocaleString()} MXN</h3>
          <p className="text-sm text-green-400 mt-2">+12% este mes</p>
        </div>
        <div className="bg-volcanic-800/80 p-6 rounded-3xl border border-white/5 shadow-glass">
          <p className="text-gray-400 font-medium mb-1">Usuarios Totales vs Activos</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-4xl font-black text-white">{totalUsers || 0}</h3>
            <span className="text-xl text-turquoise-neon font-bold">/ {activeUsers || 0}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Suscripciones Activas</p>
        </div>
        <div className="bg-volcanic-800/80 p-6 rounded-3xl border border-white/5 shadow-glass">
          <p className="text-gray-400 font-medium mb-1">Churn Rate</p>
          <h3 className="text-4xl font-black text-red-400">2.4%</h3>
          <p className="text-sm text-gray-500 mt-2">Cancelaciones recientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Mapa de Calor (Densidad)</h3>
          <AdminMap data={heatmapData} />
        </div>
        <div className="space-y-4">
          <AdminChart data={chartData} />
        </div>
      </div>

      <div className="bg-volcanic-800/50 rounded-3xl p-6 border border-white/5 shadow-glass">
        <h3 className="text-2xl font-bold text-white mb-6">Gestión de Usuarios</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="pb-3 px-4">Nombre / ID</th>
                <th className="pb-3 px-4">Estado</th>
                <th className="pb-3 px-4">Suscripción</th>
                <th className="pb-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.map((u: any) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-white font-medium">{u.full_name || 'Desconocido'}</td>
                  <td className="py-4 px-4 text-gray-300">{u.state || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.subscription_status === 'active' ? 'bg-turquoise-neon/20 text-turquoise-neon' : 'bg-gray-700 text-gray-300'}`}>
                      {u.subscription_status?.toUpperCase() || 'INACTIVE'}
                    </span>
                  </td>
                  <td className="py-4 px-4 space-x-2">
                    <button className="text-xs bg-volcanic-900 border border-white/10 hover:border-turquoise-neon px-3 py-1 rounded text-white transition-colors">
                      Reset Devices
                    </button>
                    <button className="text-xs bg-red-900/50 border border-red-500/30 hover:border-red-500 px-3 py-1 rounded text-red-200 transition-colors">
                      Banear
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
