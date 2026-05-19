'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminChart = ({ data }: { data: any[] }) => {
  return (
    <div className="w-full h-full min-h-[300px] bg-volcanic-800/50 rounded-3xl p-6 border border-white/5 shadow-glass">
      <h3 className="text-xl font-bold text-white mb-6">Crecimiento de Usuarios</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FDE047" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FDE047" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Area type="monotone" dataKey="total" stroke="#FDE047" fillOpacity={1} fill="url(#colorTotal)" name="Usuarios Totales" />
          <Area type="monotone" dataKey="activos" stroke="#00f2fe" fillOpacity={1} fill="url(#colorActive)" name="Suscripciones Activas" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
