'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidLink, setIsValidLink] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URL(window.location.href).searchParams
    const maybeError = params.get('error_description') || params.get('error')
    if (maybeError) {
      setError(decodeURIComponent(maybeError))
      setIsValidLink(false)
      return
    }

    const verifyResetLink = async () => {
      setIsLoading(true)
      const supabase = createClient()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setError(sessionError.message || 'Unable to verify reset link. Please request a new reset email.')
        setIsValidLink(false)
      } else if (sessionData?.session) {
        setIsValidLink(true)
        setMessage('Enter a new password to complete your reset.')
      } else {
        setError('No valid reset session found. Request a new password reset link.')
        setIsValidLink(false)
      }
      setIsLoading(false)
    }

    verifyResetLink()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message || 'Unable to update password. Please try again.')
    } else {
      setMessage('Your password has been reset successfully. You can now sign in.')
      setPassword('')
      setConfirm('')
      setIsValidLink(false)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/login-bg.png')" }}>
      <div className="absolute top-0 left-0 w-full h-full bg-slate-900/30 -z-10 pointer-events-none"></div>
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-slate-700/80 p-10 flex flex-col items-center">
          <div className="mb-6 relative w-20 h-20 shadow-lg shadow-green-900/20 rounded-3xl overflow-hidden">
            <img src="/logo-pluma.png" alt="LiberaPro Logo" className="object-cover object-center scale-[1.1] w-full h-full" />
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Reset Your Password</h1>
          <p className="text-sm font-medium text-slate-400 text-center mb-8">
            {isValidLink ? 'Set a new password for your account.' : 'Follow the instructions to request a new password reset link.'}
          </p>

          {message && (
            <div className="w-full bg-green-50 text-green-600 border border-green-200 p-3 rounded-lg text-sm mb-4 text-center font-medium">
              {message}
            </div>
          )}

          {error && (
            <div className="w-full bg-red-50 text-red-500 border border-red-200 p-3 rounded-lg text-sm mb-4 text-center font-medium">
              {error}
            </div>
          )}

          {isValidLink ? (
            <form onSubmit={handleSubmit} className="w-full space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white font-medium placeholder:text-slate-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white font-medium placeholder:text-slate-500"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <Link href="/forgot-password" className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all">
              Request a New Link
            </Link>
          )}

          <div className="mt-8 pt-6 border-t border-slate-700/50 w-full text-center">
            <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
