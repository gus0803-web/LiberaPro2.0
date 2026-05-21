'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-bg-v3.png')" }}
    >
      {/* Decorative background overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/10 -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/90 p-10 flex flex-col items-center">
          
          {/* LiberaPro Logo */}
          <div className="mb-6 relative w-20 h-20 shadow-lg shadow-teal-900/10 rounded-3xl overflow-hidden">
            <Image src="/login-logo-v3.png" alt="LiberaPro Logo" fill className="object-cover" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Join the Beta Test</h1>
          <p className="text-sm font-medium text-slate-500 text-center mb-8">
            Enter your details below to request a temporary username and password to test the app.
          </p>

          {isSubmitted ? (
             <div className="w-full flex flex-col items-center space-y-4">
               <div className="w-16 h-16 bg-teal-500/20 text-teal-600 rounded-full flex items-center justify-center text-3xl">
                 ✓
               </div>
               <h2 className="text-xl font-bold text-slate-800">Request Received!</h2>
               <p className="text-center text-slate-500 text-sm">
                 Thank you, {formData.name}. We will review your request and send your temporary credentials to <b className="text-slate-800">{formData.email}</b> soon.
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
                  className="w-full px-5 py-4 rounded-xl bg-white/70 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-800 font-medium placeholder:text-slate-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-5 py-4 rounded-xl bg-white/70 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-800 font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">School Name</label>
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                  className="w-full px-5 py-4 rounded-xl bg-white/70 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-800 font-medium placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
