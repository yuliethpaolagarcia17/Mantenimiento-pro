'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { IconMenu, IconBell, IconLogOut, IconSearch, IconBox, IconX, IconPlus, IconFileText } from './Icons'
import ThemeToggle from './ThemeToggle'
import { obtenerPerfilActual } from '@/lib/perfil'

export default function Topbar({ onMenuClick }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState('')
  const [alertas, setAlertas] = useState([])
  const [equipos, setEquipos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAbierta, setBusquedaAbierta] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [notisAbiertas, setNotisAbiertas] = useState(false)
  const [ahora, setAhora] = useState(null)
  const menuRef = useRef(null)
  const notisRef = useRef(null)
  const busquedaRef = useRef(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- la hora actual no se puede conocer en el servidor, se sincroniza al montar
    setAhora(new Date())
    const id = setInterval(() => setAhora(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession()
      setEmail(session?.user?.email || '')

      const perfil = await obtenerPerfilActual()
      setRol(perfil?.rol || '')

      const hoy = new Date()
      const en7dias = new Date()
      en7dias.setDate(hoy.getDate() + 7)
      const { data, error } = await supabase
        .from('planes_mantenimiento')
        .select('id, tipo, proxima_fecha, equipos(nombre)')
        .eq('estado', 'activo')
        .lte('proxima_fecha', en7dias.toISOString().split('T')[0])
        .order('proxima_fecha', { ascending: true })
        .limit(5)
      if (error) console.error('Error cargando notificaciones:', error)
      setAlertas(data || [])

      const { data: dataEquipos, error: errorEquipos } = await supabase.from('equipos').select('id, nombre, categoria, ubicacion')
      if (errorEquipos) console.error('Error cargando equipos:', errorEquipos)
      setEquipos(dataEquipos || [])
    }
    cargar()
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false)
      if (notisRef.current && !notisRef.current.contains(e.target)) setNotisAbiertas(false)
      if (busquedaRef.current && !busquedaRef.current.contains(e.target)) setBusquedaAbierta(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const resultados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return []
    return equipos
      .filter(e => [e.nombre, e.categoria, e.ubicacion].some(v => (v || '').toLowerCase().includes(q)))
      .slice(0, 6)
  }, [busqueda, equipos])

  function irAEquipo(id) {
    setBusqueda('')
    setBusquedaAbierta(false)
    router.push(`/equipos/${id}`)
  }

  async function cerrarSesion() {
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (e) {
      console.error('Error al cerrar sesión:', e)
    }
    localStorage.clear()
    sessionStorage.clear()
    window.location.replace('/login')
  }

  const iniciales = email ? email.slice(0, 2).toUpperCase() : '··'
  const fechaTexto = ahora ? (() => {
    const f = ahora.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
    return f.charAt(0).toUpperCase() + f.slice(1)
  })() : ''
  const horaTexto = ahora ? ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 h-16 px-4 sm:px-8 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0">
      <button onClick={onMenuClick} className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
        <IconMenu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-sm" ref={busquedaRef}>
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setBusquedaAbierta(true) }}
          onFocus={() => setBusquedaAbierta(true)}
          placeholder="Buscar equipo..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-9 pr-8 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
        />
        {busqueda && (
          <button
            onClick={() => { setBusqueda(''); setBusquedaAbierta(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        )}

        {busquedaAbierta && busqueda && (
          <div className="absolute left-0 right-0 mt-2 card shadow-elevate-lg p-2 animate-scale-in origin-top max-h-80 overflow-y-auto">
            {resultados.length === 0 ? (
              <p className="px-2.5 py-3 text-sm text-slate-400 dark:text-slate-500">Ningún equipo coincide con &quot;{busqueda}&quot;.</p>
            ) : (
              resultados.map(e => (
                <button
                  key={e.id}
                  onClick={() => irAEquipo(e.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left"
                >
                  <span className="icon-tile h-8 w-8 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                    <IconBox className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{e.nombre}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">{[e.categoria, e.ubicacion].filter(Boolean).join(' · ')}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {ahora && (
        <div className="hidden xl:flex flex-col items-end leading-tight shrink-0 mr-1">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{horaTexto}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{fechaTexto}</span>
        </div>
      )}

      <Link
        href="/equipos/nuevo"
        className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shrink-0"
        title="Registrar un nuevo equipo"
      >
        <IconPlus className="h-4 w-4" />
        <span className="hidden lg:inline">Nuevo equipo</span>
      </Link>

      <Link
        href="/reportes"
        className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shrink-0"
        title="Generar reporte de equipos"
      >
        <IconFileText className="h-4 w-4" />
        <span className="hidden lg:inline">Reporte</span>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="relative" ref={notisRef}>
          <button
            onClick={() => setNotisAbiertas(v => !v)}
            className="relative flex items-center justify-center h-9 w-9 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <IconBell className="h-4.5 w-4.5" />
            {alertas.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
          {notisAbiertas && (
            <div className="absolute right-0 mt-2 w-72 card shadow-elevate-lg p-2 animate-scale-in origin-top-right">
              <p className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Mantenimientos próximos</p>
              {alertas.length === 0 ? (
                <p className="px-2.5 py-3 text-sm text-slate-400 dark:text-slate-500">No hay alertas pendientes.</p>
              ) : (
                <div className="flex flex-col">
                  {alertas.map(a => (
                    <div key={a.id} className="px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{a.equipos?.nombre}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.tipo} · {new Date(a.proxima_fecha).toLocaleDateString('es-CO')}</p>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/mantenimientos"
                onClick={() => setNotisAbiertas(false)}
                className="block mt-1 px-2.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
              >
                Ver plan de mantenimiento →
              </Link>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto(v => !v)}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-brand-gradient text-white text-xs font-semibold shadow-elevate transition-transform hover:scale-105"
          >
            {iniciales}
          </button>
          {menuAbierto && (
            <div className="absolute right-0 mt-2 w-56 card shadow-elevate-lg p-2 animate-scale-in origin-top-right">
              <div className="px-2.5 py-1.5">
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{email}</p>
                {rol && <span className="badge-blue mt-1.5">{rol}</span>}
              </div>
              <button
                onClick={cerrarSesion}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <IconLogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
