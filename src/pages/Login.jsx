import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F7F5F0' }}
    >
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: '#FFFFFF' }}>
          {/* Logo / title */}
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-2xl"
              style={{ backgroundColor: '#E1F5EE' }}
            >
              📚
            </div>
            <h1
              className="text-3xl mb-1"
              style={{ fontFamily: '"DM Serif Display", serif', color: '#1a1a18' }}
            >
              Group 1 Tracker
            </h1>
            <p className="text-sm" style={{ color: '#6b6a65' }}>Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-shadow"
                style={{ borderColor: '#e5e7eb', backgroundColor: '#FAFAF9' }}
                onFocus={e => (e.target.style.borderColor = '#1D9E75')}
                onBlur={e  => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-shadow"
                style={{ borderColor: '#e5e7eb', backgroundColor: '#FAFAF9' }}
                onFocus={e => (e.target.style.borderColor = '#1D9E75')}
                onBlur={e  => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            {error && (
              <div
                className="text-sm rounded-xl px-4 py-3 flex items-start gap-2"
                style={{ backgroundColor: '#FAECE7', color: '#993C1D' }}
              >
                <span className="font-bold mt-0.5">!</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#1D9E75', color: '#ffffff' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#9ca3af' }}>
          Group 1 Exam Prep · Study Tracker
        </p>
      </div>
    </div>
  )
}
