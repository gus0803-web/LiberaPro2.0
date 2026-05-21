'use client';
import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Calendar, Clock, CheckCircle2, Circle, MoreHorizontal, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { theme, language } = useTheme();

  const isEs = language === 'es';

  const t = {
    greeting: isEs ? '¡Buenos días, Profesora Erendira Mendez!' : 'Good morning, Mrs. Erendira Mendez!',
    time: isEs ? '(5:01 AM - 11:30 AM)' : '(5:01 AM - 11:30 AM)',
    newPlan: isEs ? 'Nueva Planeación' : 'New Plan',
    viewAgenda: isEs ? 'Ver Agenda' : 'View Agenda',
    date: isEs ? 'Jueves, 26 de Octubre, 2023' : 'Thursday, October 26, 2023',
    month: isEs ? 'Octubre' : 'October',
    reminders: isEs ? 'Recordatorios' : 'Reminders',
    gradeExams: isEs ? 'Calificar Exámenes 7B' : 'Grade Exams 7B',
    by3pm: isEs ? 'para las 3 PM' : 'by 3 PM',
    parentMeeting: isEs ? 'Junta de Padres' : 'Parent Meeting',
    submitAttendance: isEs ? 'Subir Asistencia' : 'Submit Attendance',
    now: isEs ? 'Ahora' : 'Now',
    prep: isEs ? 'Preparación' : 'Prep',
    homeroom: isEs ? 'Asesoría' : 'Homeroom',
    historyTitle: isEs ? 'Historia 7B' : 'History 7B',
    historyTopic: isEs ? 'Tema: Europa Medieval' : 'Topic: Medieval Europe',
    recess: isEs ? 'Recreo' : 'Recess/Prep',
    englishTitle: isEs ? 'Inglés 8A' : 'English 8A',
    englishTopic: isEs ? 'Tema: Escritura Creativa' : 'Theme: Creative Writing',
    staffMeeting: isEs ? 'Junta de Consejo' : 'Staff Meeting',
    lessonPlanChecklist: isEs ? 'Lista de Planeación' : 'Lesson Plan Checklist',
    todaysPlan: isEs ? 'Planeación de Hoy:' : "Today's Lesson Plan:",
    reviewHomework: isEs ? 'Revisar Tarea' : 'Review Homework',
    introMedieval: isEs ? 'Intro: Europa Medieval' : 'Intro: Medieval Europe',
    groupActivity: isEs ? 'Actividad: La Vida Feudal' : 'Group Activity: Manor Life',
    keyTerms: isEs ? 'Discusión de Conceptos' : 'Key Terms Discussion',
    mapQuiz: isEs ? 'Quiz: Mapa' : 'Assessment: Map Quiz',
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t.greeting}
          </h1>
          <span className="text-3xl hidden md:inline-block">🌅</span>
          <span className="text-sm font-semibold text-slate-500 bg-white/50 px-3 py-1 rounded-full border border-white/60 hidden lg:inline-block">
            {t.time}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="hidden md:flex px-4 py-2 bg-white/60 border border-white/80 text-slate-800 font-bold rounded-xl shadow-sm hover:bg-white/80 transition-all text-sm items-center space-x-2">
            <span className="text-lg">+</span>
            <span>{t.newPlan}</span>
          </button>
          <button className="hidden md:flex px-4 py-2 bg-white/60 border border-white/80 text-slate-800 font-bold rounded-xl shadow-sm hover:bg-white/80 transition-all text-sm items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{t.viewAgenda}</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Calendar & Reminders */}
        <div className="space-y-6">
          {/* Calendar Widget */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>{t.date}</span>
              </h2>
              <div className="flex space-x-1">
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors"><Calendar className="w-4 h-4 text-slate-500" /></button>
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors"><Clock className="w-4 h-4 text-slate-500" /></button>
              </div>
            </div>
            
            {/* Fake Calendar Grid */}
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50">
              <div className="flex justify-between items-center mb-4 px-2">
                <button className="text-slate-400 hover:text-slate-800">&lt;</button>
                <span className="font-bold text-slate-800">{t.month}</span>
                <button className="text-slate-400 hover:text-slate-800">&gt;</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-slate-700">
                <div className="py-1"></div><div className="py-1"></div><div className="py-1">1</div><div className="py-1">2</div><div className="py-1">3</div><div className="py-1">4</div><div className="py-1">5</div>
                <div className="py-1">6</div><div className="py-1">7</div><div className="py-1">8</div><div className="py-1">9</div><div className="py-1">10</div><div className="py-1">11</div><div className="py-1">12</div>
                <div className="py-1">13</div><div className="py-1">14</div><div className="py-1">15</div><div className="py-1">16</div><div className="py-1">17</div><div className="py-1">18</div><div className="py-1">19</div>
                <div className="py-1">20</div><div className="py-1">21</div><div className="py-1">22</div><div className="py-1">23</div><div className="py-1">24</div><div className="py-1">25</div>
                <div className="py-1 bg-blue-500 text-white rounded-lg shadow-sm">26</div>
                <div className="py-1">27</div><div className="py-1">28</div><div className="py-1">29</div><div className="py-1">30</div>
              </div>
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-lg">{t.reminders}</h3>
              <AlertCircle className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">{t.gradeExams}</span>
                <span className="font-bold text-slate-900 bg-white/50 px-2 py-1 rounded-md">{t.by3pm}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">{t.parentMeeting}</span>
                <span className="font-bold text-slate-900 bg-white/50 px-2 py-1 rounded-md">10:15 AM</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">{t.submitAttendance}</span>
                <span className="font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">{t.now}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Daily Agenda */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            {/* Agenda Items */}
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">8:00 AM</div>
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm text-blue-900 font-medium">
                {t.prep}
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">8:30 AM</div>
              <div className="flex-1 bg-sky-50 border border-sky-100 rounded-2xl p-4 shadow-sm text-sky-900 font-medium">
                {t.homeroom}
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">9:00 AM</div>
              <div className="flex-1 bg-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                <h4 className="font-bold text-blue-900">{t.historyTitle}</h4>
                <p className="text-sm text-blue-800 mt-1">{t.historyTopic}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">10:00 AM</div>
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm text-slate-700 font-medium">
                {t.recess}
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">10:30 AM</div>
              <div className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                <h4 className="font-bold text-amber-900">{t.englishTitle}</h4>
                <p className="text-sm text-amber-800 mt-1">{t.englishTopic}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">11:15 AM</div>
              <div className="flex-1 bg-orange-50 border border-orange-100 rounded-2xl p-4 shadow-sm text-orange-900 font-medium">
                {t.staffMeeting}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checklist */}
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-xl">{t.lessonPlanChecklist}</h3>
              <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.todaysPlan}</p>
              <p className="text-lg font-bold text-slate-900">{t.historyTitle} (9:00 AM)</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-slate-500 line-through">{t.reviewHomework}</span>
                </div>
                <span className="text-sm font-bold text-slate-400">(5m)</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-slate-500 line-through">{t.introMedieval}</span>
                </div>
                <span className="text-sm font-bold text-slate-400">(15m)</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{t.groupActivity}</span>
                </div>
                <span className="text-sm font-bold text-slate-500">(25m)</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{t.keyTerms}</span>
                </div>
                <span className="text-sm font-bold text-slate-500">(10m)</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{t.mapQuiz}</span>
                </div>
                <span className="text-sm font-bold text-slate-500">(5m)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
