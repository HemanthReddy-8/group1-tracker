import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Tracker from './pages/Tracker'
import Monitor from './pages/Monitor'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F7F5F0' }}
      >
        <div className="text-sm" style={{ color: '#6b6a65' }}>Loading…</div>
      </div>
    )
  }

  const isAdmin = session?.user?.email === ADMIN_EMAIL

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            !session
              ? <Navigate to="/login" replace />
              : isAdmin
              ? <Navigate to="/monitor" replace />
              : <Navigate to="/tracker" replace />
          }
        />

        {/* User tracker */}
        <Route
          path="/tracker"
          element={
            !session
              ? <Navigate to="/login" replace />
              : <Tracker session={session} />
          }
        />

        {/* Admin monitor */}
        <Route
          path="/monitor"
          element={
            !session
              ? <Navigate to="/login" replace />
              : !isAdmin
              ? <Navigate to="/tracker" replace />
              : <Monitor session={session} />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
