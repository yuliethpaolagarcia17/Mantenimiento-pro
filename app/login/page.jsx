'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl mb-4 shadow-sm shadow-indigo-200">
            M
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">MantenPro</h1>
          <p className="text-gray-500 mt-1 text-sm">Sistema de mantenimiento preventivo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="tu@correo.com"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}