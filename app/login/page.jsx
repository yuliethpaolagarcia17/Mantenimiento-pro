'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  IconLogoMark, IconMail, IconLock, IconShieldCheck, IconClock, IconQrCode,
  IconBell, IconFileText, IconWrench, IconAlertTriangle, IconAlertCircle,
  IconEye, IconEyeOff,
} from '../components/Icons'

const FEATURES = [
  { icon: IconClock, title: 'Historial completo', desc: 'Cada intervención de cada equipo, siempre a la mano.' },
  { icon: IconQrCode, title: 'Escaneo por QR', desc: 'Accede a la ficha de un equipo en segundos.' },
  { icon: IconBell, title: 'Recordatorios automáticos', desc: 'Te avisamos antes de que un mantenimiento venza.' },
  { icon: IconFileText, title: 'Reportes inteligentes', desc: 'Resúmenes listos para imprimir o compartir.' },
  { icon: IconShieldCheck, title: 'Seguridad de la información', desc: 'Acceso protegido y trazabilidad de cada cambio.' },
  { icon: IconWrench, title: 'Preventivo y correctivo', desc: 'Planifica y registra ambos tipos de mantenimiento.' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errores, setErrores] = useState({})
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [recordarme, setRecordarme] = useState(false)

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

  function olvideContrasena() {
    alert('Para restablecer tu contraseña, contacta a tu administrador de MantenPro.')
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-slate-950">
      {/* Panel de marca */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-800 p-12 text-white">
        {/* Fondo: orbes, partículas y figuras geométricas */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -top-24 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="animate-float absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" style={{ animationDelay: '2s' }} />
          <div className="animate-float absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" style={{ animationDelay: '4s' }} />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          {/* Figuras geométricas transparentes */}
          <div className="absolute top-16 right-16 h-40 w-40 rounded-[2.5rem] border border-white/10 rotate-12" />
          <div className="absolute bottom-24 right-40 h-24 w-24 rounded-full border border-white/10" />
          <div className="absolute top-1/3 left-10 h-16 w-16 border border-white/10 rotate-45" />
          <div className="absolute bottom-1/3 left-1/2 h-28 w-28 rounded-2xl border border-cyan-200/10 -rotate-12" />
        </div>

        {/* Marca */}
        <div className="relative flex items-center gap-3 animate-fade-up">
          <span className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner shadow-white/10 ring-1 ring-white/25">
            <IconLogoMark className="h-6 w-6" />
          </span>
          <span className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Manten<span className="text-cyan-200">Pro</span>
          </span>
        </div>

        {/* Ilustración minimalista: panel de monitoreo */}
        <div className="relative mx-auto my-8 hidden xl:block animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <IlustracionMonitoreo />
        </div>

        {/* Mensaje principal + beneficios */}
        <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight max-w-md" style={{ fontFamily: 'var(--font-display)' }}>
            Gestiona el mantenimiento de tus equipos con total control.
          </h1>
          <p className="mt-4 text-blue-100/80 text-base max-w-md leading-relaxed">
            Centraliza inventario, historial, mantenimientos y reportes desde una sola plataforma moderna, rápida y segura.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group flex items-start gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm px-3.5 py-3 transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5 animate-fade-up"
                style={{ animationDelay: `${0.22 + i * 0.07}s` }}
              >
                <span className="h-8 w-8 rounded-lg bg-white/10 ring-1 ring-white/15 flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm leading-tight">{f.title}</p>
                  <p className="text-blue-100/65 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
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
      <div className="relative flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/60 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.5]"
            style={{ backgroundImage: 'radial-gradient(rgba(15,23,42,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
          <div className="animate-float absolute -top-20 -left-16 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl lg:hidden" />
          <div className="animate-float absolute bottom-0 -right-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl lg:hidden" style={{ animationDelay: '2s' }} />
          <div className="animate-float absolute top-10 right-10 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl hidden lg:block" />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="flex flex-col items-center mb-8 lg:hidden animate-fade-up">
            <div className="h-14 w-14 rounded-2xl bg-brand-gradient text-white flex items-center justify-center mb-4 shadow-elevate">
              <IconLogoMark className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>MantenPro</h1>
            <p className="text-slate-500 mt-1 text-sm text-center">Gestiona el mantenimiento de tus equipos con total control.</p>
          </div>

          <div className="hidden lg:block mb-8 animate-fade-up">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Bienvenido de nuevo
            </h2>
            <p className="text-slate-500 mt-1.5 text-sm">Ingresa tus credenciales para acceder a tu panel.</p>
          </div>

          <div
            className="relative rounded-3xl bg-white/75 backdrop-blur-xl ring-1 ring-white/70 border border-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-18px_rgba(37,99,235,0.22)] p-7 sm:p-8 animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

            {error && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-3 rounded-xl mb-5 text-sm animate-fade-in ring-1 ring-inset ring-rose-600/10">
                <IconAlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div>
                <label className="label-field">Correo electrónico</label>
                <div className="relative group">
                  <IconMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrores({ ...errores, email: '' }) }}
                    onKeyDown={handleKeyDown}
                    placeholder="tu@correo.com"
                    className={`input-field pl-10 bg-white/90 focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)] ${errores.email ? 'input-field-error' : ''}`}
                  />
                </div>
                {errores.email && <p className="error-text"><IconAlertCircle className="h-3.5 w-3.5 shrink-0" />{errores.email}</p>}
              </div>
              <div>
                <label className="label-field">Contraseña</label>
                <div className="relative group">
                  <IconLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrores({ ...errores, password: '' }) }}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••••"
                    className={`input-field pl-10 pr-10 bg-white/90 focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)] ${errores.password ? 'input-field-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {mostrarPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                  </button>
                </div>
                {errores.password && <p className="error-text"><IconAlertCircle className="h-3.5 w-3.5 shrink-0" />{errores.password}</p>}
              </div>

              <div className="flex items-center justify-between text-sm -mt-1">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={recordarme}
                    onChange={(e) => setRecordarme(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-400 focus:ring-offset-0"
                  />
                  Recordarme
                </label>
                <button type="button" onClick={olvideContrasena} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn btn-primary btn-md w-full mt-1 hover:shadow-[0_0_0_4px_rgba(37,99,235,0.15),0_8px_12px_-6px_rgba(15,23,42,0.06),0_24px_48px_-18px_rgba(37,99,235,0.3)]"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Acceso restringido al personal autorizado de mantenimiento.{' '}
            <a href="mailto:yuliethpaolagarcia17@gmail.com?subject=Soporte%20MantenPro" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
              Contactar al administrador
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

function IlustracionMonitoreo() {
  return (
    <svg width="300" height="210" viewBox="0 0 300 210" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pantalla" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
      </defs>

      {/* Órbitas punteadas */}
      <circle cx="150" cy="95" r="92" stroke="white" strokeOpacity="0.12" strokeDasharray="2 6" />
      <circle cx="150" cy="95" r="70" stroke="white" strokeOpacity="0.08" strokeDasharray="2 6" />

      {/* Pantalla / dashboard central */}
      <rect x="70" y="45" width="160" height="102" rx="12" fill="url(#pantalla)" stroke="white" strokeOpacity="0.35" />
      <rect x="86" y="61" width="128" height="10" rx="3" fill="white" fillOpacity="0.25" />
      <rect x="86" y="61" width="70" height="10" rx="3" fill="white" fillOpacity="0.55" />

      {/* Barras tipo gráfico */}
      <rect x="86" y="88" width="14" height="34" rx="3" fill="white" fillOpacity="0.3" />
      <rect x="106" y="98" width="14" height="24" rx="3" fill="white" fillOpacity="0.45" />
      <rect x="126" y="80" width="14" height="42" rx="3" fill="white" fillOpacity="0.6" />
      <rect x="146" y="92" width="14" height="30" rx="3" fill="white" fillOpacity="0.4" />

      {/* Línea de monitoreo (pulso) */}
      <path d="M172 108 h10 l6 -16 l8 24 l6 -12 l6 8 h16" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Base del monitor */}
      <rect x="140" y="147" width="20" height="10" rx="2" fill="white" fillOpacity="0.3" />
      <rect x="122" y="157" width="56" height="6" rx="3" fill="white" fillOpacity="0.3" />

      {/* Insignia flotante: mantenimiento (llave) */}
      <g transform="translate(38,140)">
        <circle cx="16" cy="16" r="16" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.35" />
        <path d="M20.2 9.9a5.6 5.6 0 0 0-7.5 7.5L8.4 21.7l2 2 4.3-4.3a5.6 5.6 0 0 0 7.5-7.5l-3.5 3.5-2.7-2.7 3.5-3.5Z" fill="white" fillOpacity="0.75" />
      </g>

      {/* Insignia flotante: seguridad (escudo) */}
      <g transform="translate(246,132)">
        <circle cx="16" cy="16" r="16" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.35" />
        <path d="M16 6.5 23 9v6c0 5-3 8-7 9-4-1-7-4-7-9V9l7-2.5Z" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1.6" />
        <path d="m12.6 15.6 2.2 2.2 4.4-4.6" stroke="white" strokeOpacity="0.9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Insignia flotante: qr */}
      <g transform="translate(228,18)">
        <circle cx="15" cy="15" r="15" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.35" />
        <rect x="8" y="8" width="6" height="6" rx="1" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1.4" />
        <rect x="17" y="8" width="6" height="6" rx="1" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1.4" />
        <rect x="8" y="17" width="6" height="6" rx="1" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1.4" />
        <path d="M18.5 18.5h2v2M22.5 18.5v3M20 22.5h2.5" stroke="white" strokeOpacity="0.8" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Puntos de conexión */}
      <circle cx="70" cy="95" r="2.5" fill="#a5f3fc" />
      <circle cx="230" cy="95" r="2.5" fill="#a5f3fc" />
      <circle cx="150" cy="45" r="2.5" fill="#a5f3fc" />
    </svg>
  )
}
