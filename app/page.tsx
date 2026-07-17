'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { IconLayers, IconCheckCircle, IconWrench, IconXCircle, IconArrowRight, IconAlertTriangle, IconBox, IconClock, IconLogOut, IconSparkle } from './components/Icons'

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const from = prev.current
    const to = value
    if (from === to) return
    const duration = 600
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    prev.current = to
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <>{display}</>
}

function saludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

type Alerta = {
  id: string | number
  tipo: string
  proxima_fecha: string
  equipos?: { nombre: string } | null
}

export default function Home() {
  const [stats, setStats] = useState({ total: 0, operativos: 0, mantenimiento: 0, fuera: 0 })
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase.from('equipos').select('*')
      if (error) console.error('Error cargando equipos:', error)
      if (data) {
        setStats({
          total: data.length,
          operativos: data.filter(e => e.estado === 'operativo').length,
          mantenimiento: data.filter(e => e.estado === 'mantenimiento').length,
          fuera: data.filter(e => e.estado === 'fuera de servicio').length
        })
      }
    }

    async function cargarAlertas() {
      const hoy = new Date()
      const en7dias = new Date()
      en7dias.setDate(hoy.getDate() + 7)
      const { data, error } = await supabase
        .from('planes_mantenimiento')
        .select('*, equipos(nombre)')
        .lte('proxima_fecha', en7dias.toISOString().split('T')[0])
      if (error) console.error('Error cargando alertas:', error)
      setAlertas(data || [])
    }

    async function verificarSesion() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.replace('/login')
        return
      }
      cargar()
      cargarAlertas()
      setCargando(false)
    }

    verificarSesion()
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

  function colorAlerta(fecha: string) {
    const hoy = new Date()
    const f = new Date(fecha)
    const diff = (f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return 'border-red-400 bg-red-50'
    if (diff <= 7) return 'border-amber-400 bg-amber-50'
    return 'border-emerald-400 bg-emerald-50'
  }

  function textoAlerta(fecha: string) {
    const hoy = new Date()
    const f = new Date(fecha)
    const diff = Math.round((f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'Vencido'
    if (diff === 0) return 'Vence hoy'
    return `Vence en ${diff} días`
  }

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    )
  }

  const statCards = [
    { label: 'Total equipos', value: stats.total, icon: IconLayers, iconClass: 'text-gray-600 bg-gray-100', bar: 'bg-gray-400' },
    { label: 'Operativos', value: stats.operativos, icon: IconCheckCircle, iconClass: 'text-emerald-600 bg-emerald-50', bar: 'bg-emerald-500' },
    { label: 'En mantenimiento', value: stats.mantenimiento, icon: IconWrench, iconClass: 'text-amber-600 bg-amber-50', bar: 'bg-amber-500' },
    { label: 'Fuera de servicio', value: stats.fuera, icon: IconXCircle, iconClass: 'text-red-600 bg-red-50', bar: 'bg-red-500' },
  ]

  const links = [
    { href: '/equipos', title: 'Equipos', desc: 'Ver e inventario completo', icon: IconBox },
    { href: '/mantenimientos', title: 'Plan de mantenimiento', desc: 'Programar y dar seguimiento', icon: IconWrench },
    { href: '/historial', title: 'Historial', desc: 'Mantenimientos realizados', icon: IconClock },
  ]

  const pctOperativo = stats.total ? Math.round((stats.operativos / stats.total) * 100) : 0

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-800 p-6 sm:p-8 mb-8 animate-fade-up shadow-lg shadow-indigo-950/10">
        <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-sky-400/20 blur-2xl" />
        <div className="relative flex justify-between items-start gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-100 uppercase tracking-wide mb-2">
              <IconSparkle className="h-3.5 w-3.5" />
              {saludo()}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">MantenPro</h1>
            <p className="text-indigo-200 text-sm mt-1">Sistema de mantenimiento preventivo</p>
          </div>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-1.5 text-sm text-indigo-100 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            <IconLogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>

        {stats.total > 0 && (
          <div className="relative mt-6">
            <div className="flex items-center justify-between text-xs text-indigo-100 mb-1.5">
              <span>Equipos operativos</span>
              <span className="font-semibold">{pctOperativo}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] duration-700 ease-out"
                style={{ width: `${pctOperativo}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {alertas.length > 0 && (
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-500">
            Alertas de mantenimiento
          </h2>
          <div className="flex flex-col gap-2">
            {alertas.map(a => (
              <div key={a.id} className={`border-l-4 p-4 rounded-lg flex items-center justify-between gap-3 ${colorAlerta(a.proxima_fecha)}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <IconAlertTriangle className="h-4 w-4 shrink-0 opacity-70" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{a.equipos?.nombre}</div>
                    <div className="text-sm text-gray-600 truncate">{a.tipo}</div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 shrink-0">{textoAlerta(a.proxima_fecha)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="group relative overflow-hidden bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
            >
              <span className={`absolute top-0 left-0 right-0 h-1 ${card.bar} opacity-70`} />
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg mb-3 transition-transform duration-200 group-hover:scale-110 ${card.iconClass}`}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="text-3xl font-semibold text-gray-900 tabular-nums">
                <AnimatedNumber value={card.value} />
              </div>
              <div className="text-gray-500 text-sm mt-1">{card.label}</div>
            </div>
          )
        })}
      </div>

      <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-500">
        Accesos rápidos
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {links.map((link, i) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group animate-fade-up"
              style={{ animationDelay: `${0.3 + i * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-transform duration-200 group-hover:scale-110">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <IconArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="font-medium text-gray-900 mt-3">{link.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{link.desc}</p>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
