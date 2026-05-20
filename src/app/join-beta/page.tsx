'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function JoinBetaPage() {
  const [formData, setFormData] = useState({ name: '', email: '', school: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mocking an API call to save beta request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white/80 p-10 flex flex-col items-center">
          
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Join the Beta Test</h1>
          <p className="text-sm font-medium text-slate-500 text-center mb-8">
            Enter your details below to request a temporary username and password to test the app.
          </p>

          {isSubmitted ? (
             <div className="w-full flex flex-col items-center space-y-4">
               <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-3xl">
                 ✓
               </div>
               <h2 className="text-xl font-bold text-slate-800">Request Received!</h2>
               <p className="text-center text-slate-600 text-sm">
                 Thank you, {formData.name}. We will review your request and send your temporary credentials to <b>{formData.email}</b> soon.
               </p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 rounded-xl bg-white/50 border border-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-5 py-4 rounded-xl bg-white/50 border border-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">School Name</label>
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                  className="w-full px-5 py-4 rounded-xl bg-white/50 border border-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Request Access'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200/50 w-full text-center">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              ← Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
