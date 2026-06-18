'use client';

import React, { useState } from 'react';
import { Users, MapPin, Search } from 'lucide-react';

const mockTeachers = [
  { id: 1, name: 'María García', state: 'Jalisco', phase: 'Fase 4', method: 'Proyectos Comunitarios' },
  { id: 2, name: 'Juan Pérez', state: 'Nuevo León', phase: 'Fase 5', method: 'STEAM' },
  { id: 3, name: 'Ana López', state: 'CDMX', phase: 'Fase 3', method: 'ABP' },
  { id: 4, name: 'Carlos Ruiz', state: 'Jalisco', phase: 'Fase 6', method: 'Proyectos Comunitarios' },
  { id: 5, name: 'Laura Torres', state: 'Yucatán', phase: 'Fase 2', method: 'Aprendizaje de Servicio' },
];

const states = Array.from(new Set(mockTeachers.map(t => t.state))).sort();

export default function CollaborationsPage() {
  const [selectedState, setSelectedState] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = mockTeachers.filter(t => {
    const matchState = selectedState ? t.state === selectedState : true;
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchState && matchSearch;
  });

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
          <Users className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Directorio de Colaboración</h1>
          <p className="text-slate-500 font-medium mt-1">Conecta con maestros de la Nueva Escuela Mexicana por estado</p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map(teacher => (
          <div key={teacher.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {teacher.name.charAt(0)}
              </div>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {teacher.state}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{teacher.name}</h3>
            <div className="mt-3 space-y-1">
              <p className="text-sm text-slate-500"><strong>Fase:</strong> {teacher.phase}</p>
              <p className="text-sm text-slate-500"><strong>Metodología:</strong> {teacher.method}</p>
            </div>
            <button className="w-full mt-5 bg-indigo-50 text-indigo-700 font-semibold py-2 rounded-xl hover:bg-indigo-100 transition-colors">
              Conectar
            </button>
          </div>
        ))}
        {filteredTeachers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No se encontraron maestros con esos filtros.
          </div>
        )}
      </div>
    </div>
  );
}
