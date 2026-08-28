'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface Step {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: Step[] = [
  {
    targetId: 'tutorial-step-1',
    title: 'Bienvenido a LiberaPro',
    content: 'Este es tu Dashboard principal. Aquí podrás ver un resumen de tu actividad y créditos.',
    position: 'bottom',
  },
  {
    targetId: 'tutorial-step-2',
    title: 'Generador de Planeaciones',
    content: 'Crea nuevas planeaciones didácticas de forma rápida y sencilla.',
    position: 'bottom',
  },
  {
    targetId: 'tutorial-step-3',
    title: 'Créditos',
    content: 'Aquí verás cuántos créditos tienes disponibles. ¡Cada planeación utiliza algunos créditos!',
    position: 'bottom',
  },
];

export function InteractiveTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isActive) {
      updateTargetRect();
      window.addEventListener('resize', updateTargetRect);
      return () => window.removeEventListener('resize', updateTargetRect);
    }
  }, [isActive, currentStep]);

  const updateTargetRect = () => {
    const step = tutorialSteps[currentStep];
    const targetEl = document.getElementById(step.targetId);
    if (targetEl) {
      setTargetRect(targetEl.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishTutorial();
    }
  };

  const finishTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('liberapro_tutorial_completed', 'true');
  };

  if (!isActive) {
    return (
      <button 
        onClick={() => setIsActive(true)}
        className="fixed bottom-6 right-6 z-[9000] w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform hover:shadow-xl"
        title="Ver Tutorial"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>
    );
  }

  const step = tutorialSteps[currentStep];

  return (
    <>
      {/* Overlay Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-none z-[9998] transition-opacity" />

      {/* Target Highlight */}
      {targetRect && (
        <div 
          className="fixed z-[9998] rounded-xl border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] transition-all duration-300 pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Tooltip Dialog */}
      <div 
        className="fixed z-[9999] max-w-sm w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 text-white transition-all duration-300 animate-in fade-in zoom-in"
        style={{
          top: targetRect ? targetRect.bottom + 16 : '50%',
          left: targetRect ? Math.max(16, targetRect.left + (targetRect.width / 2) - 192) : '50%',
          transform: targetRect ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-lg">{step.title}</h3>
          </div>
          <button onClick={finishTutorial} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-slate-300 text-sm leading-relaxed mb-6">{step.content}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1.5">
            {tutorialSteps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-4 bg-emerald-500' : 'w-1.5 bg-slate-700'}`} />
            ))}
          </div>
          
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-transform hover:scale-105"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
            {currentStep !== tutorialSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  );
}
