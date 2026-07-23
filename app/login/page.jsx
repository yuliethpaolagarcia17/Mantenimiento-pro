'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconWrench, IconMail, IconLock, IconShieldCheck, IconBox, IconAlertTriangle, IconAlertCircle } from '../components/Icons'

const FEATURES = [
  { icon: IconBox, title: 'Hoja de vida por equipo', desc: 'Toda la información técnica y su historial, accesible con un código QR.' },
  { icon: IconAlertTriangle, title: 'Alertas automáticas', desc: 'Te avisamos antes de que un mantenimiento venza o un equipo falle.' },
  { icon: IconShieldCheck, title: 'Trazabilidad completa', desc: 'Cada intervención queda registrada: técnico, fecha, costo y detalle.' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errores, setErrores] = useState({})

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
    const nuevosErrores = {
      email: email.trim() ? '' : 'Ingresa tu correo electrónico.',
      password: password ? '' : 'Ingresa tu contraseña.',
    }
    if (Object.values(nuevosErrores).some(Boolean)) {
      setErrores(nuevosErrores)
      return
    }
    setErrores({})
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
    <main className="min-h-screen grid lg:grid-cols-2 bg-slate-950">
      {/* Panel de marca */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-cyan-900 p-12 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -top-24 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="animate-float absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" style={{ animationDelay: '2s' }} />
          <div className="animate-float absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" style={{ animationDelay: '4s' }} />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
        </div>

        <div className="relative flex items-center gap-2.5 animate-fade-up">
          <span className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner shadow-white/10 ring-1 ring-white/20">
            <IconWrench className="h-5 w-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            MantenPro
          </span>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight max-w-md" style={{ fontFamily: 'var(--font-display)' }}>
            Mantenimiento preventivo, sin fricción.
          </h1>
          <p className="mt-4 text-blue-100/80 text-base max-w-sm leading-relaxed">
            Centraliza equipos, planes y trazabilidad en una sola plataforma pensada para equipos técnicos.
          </p>

          <div className="mt-10 flex flex-col gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="flex items-start gap-3.5 animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
                <span className="h-9 w-9 rounded-lg bg-white/10 ring-1 ring-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-medium text-white text-sm">{f.title}</p>
                  <p className="text-blue-100/70 text-sm mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-blue-100/50 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          © {new Date().getFullYear()} MantenPro — Plataforma de mantenimiento preventivo
        </p>
      </div>

      {/* Panel de formulario */}
      <div className="relative flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="animate-float absolute -top-20 -left-16 h-64 w-64 rounded-full bg-blue-300/25 blur-3xl" />
          <div className="animate-float absolute bottom-0 -right-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="flex flex-col items-center mb-8 lg:hidden animate-fade-up">
            <div className="h-14 w-14 rounded-2xl bg-brand-gradient text-white flex items-center justify-center mb-4 shadow-elevate">
              <IconWrench className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>MantenPro</h1>
            <p className="text-slate-500 mt-1 text-sm">Sistema de mantenimiento preventivo</p>
          </div>

          <div className="hidden lg:block mb-8 animate-fade-up">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Bienvenido de nuevo
            </h2>
            <p className="text-slate-500 mt-1.5 text-sm">Ingresa tus credenciales para acceder a tu panel.</p>
          </div>

          <div className="card p-8 shadow-elevate-lg animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {error && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-3 rounded-xl mb-5 text-sm animate-fade-in ring-1 ring-inset ring-rose-600/10">
                <IconAlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div>
                <label className="label-field">Correo electrónico</label>
                <div className="relative">
                  <IconMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrores({ ...errores, email: '' }) }}
                    onKeyDown={handleKeyDown}
                    placeholder="tu@correo.com"
                    className={`input-field pl-10 ${errores.email ? 'input-field-error' : ''}`}
                  />
                </div>
                {errores.email && <p className="error-text"><IconAlertCircle className="h-3.5 w-3.5 shrink-0" />{errores.email}</p>}
              </div>
              <div>
                <label className="label-field">Contraseña</label>
                <div className="relative">
                  <IconLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrores({ ...errores, password: '' }) }}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••••"
                    className={`input-field pl-10 ${errores.password ? 'input-field-error' : ''}`}
                  />
                </div>
                {errores.password && <p className="error-text"><IconAlertCircle className="h-3.5 w-3.5 shrink-0" />{errores.password}</p>}
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn btn-primary btn-md w-full mt-2"
              >
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Acceso restringido al personal autorizado de mantenimiento.
          </p>
        </div>
      </div>
    </main>
  )
}
