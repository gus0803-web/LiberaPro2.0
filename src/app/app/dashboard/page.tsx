'use client';
import React, { useState } from 'react';
import { PlanificarIcon } from '@/components/icons/NeoAztecIcons';

// Mock data for the daily checklist
const dailyPlan = [
  { id: 1, time: '08:00 AM', title: 'Actividad Detonadora: Lluvia de Ideas', description: 'Preguntar a los alumnos qué saben sobre el ciclo del agua.', completed: true, type: 'inicio' },
  { id: 2, time: '09:00 AM', title: 'Desarrollo: Maqueta con materiales reciclados', description: 'Usar botellas PET (Eco-Ally) para simular la evaporación.', completed: false, type: 'desarrollo' },
  { id: 3, time: '11:30 AM', title: 'Pausa Activa', description: 'Ejercicio de estiramiento de 5 minutos.', completed: false, type: 'pausa' },
  { id: 4, time: '12:00 PM', title: 'Cierre: Reflexión Grupal', description: 'Los alumnos escriben 3 cosas que aprendieron en su cuaderno.', completed: false, type: 'cierre' },
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState(dailyPlan);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Cabecera del Dashboard */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-white tracking-tight drop-shadow-md">
            Buenas tardes, Maestro.
          </h2>
          <p className="text-sm text-gray-200 font-medium max-w-sm leading-relaxed drop-shadow">
            Tu planeación del día está lista. Llevas un <span className="font-bold text-turquoise-neon">{progress}%</span> de progreso.
          </p>
        </div>
        
        {/* Badge de usuario */}
        <div className="flex items-center space-x-3 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl shadow-glass">
          <div className="w-8 h-8 rounded-lg bg-gold-pale/20 border border-gold-pale/50 flex items-center justify-center">
            <svg className="w-4 h-4 text-gold-pale" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 6 6 .5-4.5 4 1.5 6-6-3.5L6 18.5l1.5-6-4.5-4 6-.5z" /></svg>
          </div>
          <span className="text-sm font-semibold text-white">Nahui Ollin</span>
        </div>
      </div>

      {/* Planeador Interactivo (Checklist Diario) */}
      <section className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <PlanificarIcon className="w-6 h-6 mr-3 text-turquoise-neon" />
            Checklist Diario
          </h3>
          <div className="px-4 py-1.5 rounded-full bg-turquoise-neon/20 border border-turquoise-neon/40 text-turquoise-neon text-sm font-semibold">
            Proyecto: El Ciclo del Agua
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              className={`group flex items-start space-x-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                task.completed 
                  ? 'bg-turquoise-neon/5 border-turquoise-neon/30 opacity-70' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {/* Checkbox custom */}
              <div className={`mt-1 w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
                task.completed 
                  ? 'bg-turquoise-neon text-black' 
                  : 'border-2 border-gray-400 group-hover:border-turquoise-neon'
              }`}>
                {task.completed && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-xs font-bold text-gold-pale">{task.time}</span>
                  <h4 className={`text-lg font-semibold transition-colors ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {task.title}
                  </h4>
                </div>
                <p className={`text-sm ${task.completed ? 'text-gray-500' : 'text-gray-300'}`}>
                  {task.description}
                </p>
              </div>
              
              {/* Badge type */}
              <div className="hidden md:block">
                <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider font-bold ${
                  task.type === 'inicio' ? 'bg-blue-500/20 text-blue-300' :
                  task.type === 'desarrollo' ? 'bg-purple-500/20 text-purple-300' :
                  task.type === 'cierre' ? 'bg-green-500/20 text-green-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {task.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
