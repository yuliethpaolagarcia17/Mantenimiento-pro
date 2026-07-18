'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { IconMenu, IconBell, IconLogOut } from './Icons'

export default function Topbar({ onMenuClick }) {
  const [email, setEmail] = useState('')
  const [alertas, setAlertas] = useState([])
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [notisAbiertas, setNotisAbiertas] = useState(false)
  const menuRef = useRef(null)
  const notisRef = useRef(null)

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession()
      setEmail(session?.user?.email || '')

      const hoy = new Date()
      const en7dias = new Date()
      en7dias.setDate(hoy.getDate() + 7)
      const { data, error } = await supabase
        .from('planes_mantenimiento')
        .select('id, tipo, proxima_fecha, equipos(nombre)')
        .lte('proxima_fecha', en7dias.toISOString().split('T')[0])
        .order('proxima_fecha', { ascending: true })
        .limit(5)
      if (error) console.error('Error cargando notificaciones:', error)
      setAlertas(data || [])
    }
    cargar()
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false)
      if (notisRef.current && !notisRef.current.contains(e.target)) setNotisAbiertas(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

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

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 h-16 px-4 sm:px-8 bg-white/85 backdrop-blur-md border-b border-slate-200 shrink-0">
      <button onClick={onMenuClick} className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors">
        <IconMenu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <div className="relative" ref={notisRef}>
          <button
            onClick={() => setNotisAbiertas(v => !v)}
            className="relative flex items-center justify-center h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <IconBell className="h-4.5 w-4.5" />
            {alertas.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
          {notisAbiertas && (
            <div className="absolute right-0 mt-2 w-72 card shadow-elevate-lg p-2 animate-scale-in origin-top-right">
              <p className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Mantenimientos próximos</p>
              {alertas.length === 0 ? (
                <p className="px-2.5 py-3 text-sm text-slate-400">No hay alertas pendientes.</p>
              ) : (
                <div className="flex flex-col">
                  {alertas.map(a => (
                    <div key={a.id} className="px-2.5 py-2 rounded-lg hover:bg-slate-50">
                      <p className="text-sm font-medium text-slate-900 truncate">{a.equipos?.nombre}</p>
                      <p className="text-xs text-slate-500">{a.tipo} · {new Date(a.proxima_fecha).toLocaleDateString('es-CO')}</p>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/mantenimientos"
                onClick={() => setNotisAbiertas(false)}
                className="block mt-1 px-2.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
              <p className="px-2.5 py-1.5 text-xs text-slate-400 truncate">{email}</p>
              <button
                onClick={cerrarSesion}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-colors"
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
