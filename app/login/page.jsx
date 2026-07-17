'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconWrench, IconMail, IconLock } from '../components/Icons'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Si llegamos aquí con ?logout=true, cerramos sesión
    const params = new URLSearchParams(window.location.search)
    if (params.get('logout') === 'true') {
      supabase.auth.signOut().then(() => {
        localStorage.clear()
        sessionStorage.clear()
        window.location.replace('/login')
      })
    }
  }, [])

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos')
    } else {
      window.location.replace('/')
    }
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50 flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="animate-float absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-sky-300/25 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="animate-float absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 animate-fade-up">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
            <IconWrench className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">MantenPro</h1>
          <p className="text-gray-500 mt-1 text-sm">Sistema de mantenimiento preventivo</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-indigo-950/10 border border-gray-200 p-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm animate-fade-in">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Correo electrónico
              </label>
              <div className="relative">
                <IconMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="tu@correo.com"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Contraseña
              </label>
              <div className="relative">
                <IconLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                />
              </div>
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-2.5 rounded-lg font-medium text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
