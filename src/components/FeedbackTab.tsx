'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { language } = useTheme();
  const isEs = language === 'es';
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback submitted:', { rating, feedback });
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFeedback('');
      setRating(null);
      onClose();
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEs ? '¿Cómo podemos mejorar?' : 'How can we improve?'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEs ? 'Tu opinión es muy valiosa para nosotros.' : 'Your feedback is very valuable to us.'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              {isEs ? '¿Qué tan satisfecho estás con LiberaPro?' : 'How satisfied are you with LiberaPro?'}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-12 h-12 rounded-xl text-xl transition-all ${
                    rating && rating >= star
                      ? 'bg-yellow-400 text-white shadow-md scale-105'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isEs ? 'Categoría' : 'Category'}
            </label>
            <div className="flex flex-wrap gap-2">
              {(isEs
                ? ['Error / Bug', 'Sugerencia', 'Planeaciones', 'Materiales', 'Interfaz', 'Otro']
                : ['Bug / Error', 'Suggestion', 'Lesson Plans', 'Materials', 'Interface', 'Other']
              ).map((cat) => (
                <button key={cat} type="button" className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-200">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isEs ? 'Cuéntanos más' : 'Tell us more'}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={isEs ? 'Escribe tu comentario aquí...' : 'Write your feedback here...'}
              className="flex-1 min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            />
          </div>

          {sent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-emerald-700 font-bold text-sm">
                {isEs ? '¡Gracias por tu sugerencia! 🙌' : 'Thank you for your feedback! 🙌'}
              </p>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!feedback.trim()}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isEs ? 'Enviar Sugerencia' : 'Send Feedback'}
            </button>
          )}
        </form>
      </div>
    </>
  );
}
