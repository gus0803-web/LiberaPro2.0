'use client';
import React, { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Calendar, Clock, CheckCircle2, Circle, MoreHorizontal, Settings, Users, BookOpen, AlertCircle, Bell } from 'lucide-react';

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, Mrs. Sarah Davies!
          </h1>
          <span className="text-xl">🌅</span>
          <span className="text-sm font-semibold text-slate-500 bg-white/50 px-3 py-1 rounded-full border border-white/60">
            (5:01 AM - 11:30 AM)
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center space-x-2"
          >
            <span>✨ Toggle Festive Theme</span>
          </button>
          <button className="px-4 py-2 bg-white/60 border border-white/80 text-slate-800 font-bold rounded-xl shadow-sm hover:bg-white/80 transition-all text-sm flex items-center space-x-2">
            <span className="text-lg">+</span>
            <span>New Plan</span>
          </button>
          <button className="px-4 py-2 bg-white/60 border border-white/80 text-slate-800 font-bold rounded-xl shadow-sm hover:bg-white/80 transition-all text-sm flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>View Agenda</span>
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
                <span>Thursday, October 26, 2023</span>
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
                <span className="font-bold text-slate-800">October</span>
                <button className="text-slate-400 hover:text-slate-800">&gt;</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
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
              <h3 className="font-bold text-slate-800 text-lg">Reminders</h3>
              <Bell className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">Grade Exams 7B</span>
                <span className="font-bold text-slate-900 bg-white/50 px-2 py-1 rounded-md">by 3 PM</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">Parent Meeting</span>
                <span className="font-bold text-slate-900 bg-white/50 px-2 py-1 rounded-md">10:15 AM</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">Submit Attendance</span>
                <span className="font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">Now</span>
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
                Prep
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">8:30 AM</div>
              <div className="flex-1 bg-sky-50 border border-sky-100 rounded-2xl p-4 shadow-sm text-sky-900 font-medium">
                Homeroom
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">9:00 AM</div>
              <div className="flex-1 bg-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                <h4 className="font-bold text-blue-900">History 7B</h4>
                <p className="text-sm text-blue-800 mt-1">Topic: Medieval Europe</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">10:00 AM</div>
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm text-slate-700 font-medium">
                Recess/Prep
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">10:30 AM</div>
              <div className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                <h4 className="font-bold text-amber-900">English 8A</h4>
                <p className="text-sm text-amber-800 mt-1">Theme: Creative Writing</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 text-right text-sm font-bold text-slate-500 pt-3">11:15 AM</div>
              <div className="flex-1 bg-orange-50 border border-orange-100 rounded-2xl p-4 shadow-sm text-orange-900 font-medium">
                Staff Meeting
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checklist & Stats */}
        <div className="space-y-6">
          {/* Lesson Plan Checklist */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-xl">Lesson Plan Checklist</h3>
              <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Today's Lesson Plan:</p>
              <p className="text-lg font-bold text-slate-900">History 7B (9:00 AM)</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-slate-500 line-through">Review Homework</span>
                </div>
                <span className="text-sm font-bold text-slate-400">(5m)</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-slate-500 line-through">Intro: Medieval Europe</span>
                </div>
                <span className="text-sm font-bold text-slate-400">(15m)</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Group Activity: Manor Life</span>
                </div>
                <span className="text-sm font-bold text-slate-500">(25m)</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Key Terms Discussion</span>
                </div>
                <span className="text-sm font-bold text-slate-500">(10m)</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Assessment: Map Quiz</span>
                </div>
                <span className="text-sm font-bold text-slate-500">(5m)</span>
              </div>
            </div>
          </div>

          {/* Quick Stats row */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Attendance</p>
                <div className="flex items-end space-x-2">
                  <span className="text-3xl font-black text-slate-900">95%</span>
                  <span className="text-xs font-bold text-green-500 mb-1">+2%</span>
                </div>
             </div>
             <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Homework Due</p>
                <div className="flex items-end space-x-2">
                  <span className="text-3xl font-black text-slate-900">87%</span>
                  <AlertCircle className="w-4 h-4 text-orange-500 mb-1.5" />
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
