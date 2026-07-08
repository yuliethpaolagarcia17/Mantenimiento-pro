'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos')
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">MantenPro</h1>
        <p className="text-gray-500 mb-6">Inicia sesión para continuar</p>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <input type="email" placeholder="Correo electrónico"
            value={email} onChange={e => setEmail(e.target.value)}
            className="border p-3 rounded-lg" />
          <input type="password" placeholder="Contraseña"
            value={password} onChange={e => setPassword(e.target.value)}
            className="border p-3 rounded-lg" />
          <button onClick={handleLogin} disabled={loading}
            className="bg-blue-700 text-white py-3 rounded-lg font-medium">
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>
        </div>
      </div>
    </main>
  )
}
