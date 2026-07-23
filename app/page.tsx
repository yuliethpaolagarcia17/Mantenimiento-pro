'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { IconLayers, IconCheckCircle, IconWrench, IconXCircle, IconAlertTriangle, IconArrowRight, IconUser, IconClock } from './components/Icons'
import DonutChart from './components/DonutChart'

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

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

type Alerta = {
  id: string | number
  tipo: string
  proxima_fecha: string
  equipos?: { nombre: string; ubicacion?: string | null } | null
}

export default function Home() {
  const [stats, setStats] = useState({ total: 0, operativos: 0, mantenimiento: 0, fuera: 0, asignados: 0, pendientes: 0 })
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase.from('equipos').select('*')
      if (error) console.error('Error cargando equipos:', error)
      if (data) {
        setStats(prev => ({
          ...prev,
          total: data.length,
          operativos: data.filter(e => e.estado === 'operativo').length,
          mantenimiento: data.filter(e => e.estado === 'mantenimiento').length,
          fuera: data.filter(e => e.estado === 'fuera de servicio').length,
          asignados: data.filter(e => e.responsable && e.responsable.trim()).length,
        }))
      }
    }

    async function cargarAlertas() {
      const hoy = new Date()
      const en7dias = new Date()
      en7dias.setDate(hoy.getDate() + 7)
      const { data, error } = await supabase
        .from('planes_mantenimiento')
        .select('*, equipos(nombre, ubicacion)')
        .lte('proxima_fecha', en7dias.toISOString().split('T')[0])
        .order('proxima_fecha', { ascending: true })
      if (error) console.error('Error cargando alertas:', error)
      setAlertas(data || [])
      setStats(prev => ({ ...prev, pendientes: new Set((data || []).map(a => a.equipo_id)).size }))
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

  function urgencia(fecha: string) {
    const hoy = new Date()
    const f = new Date(fecha)
    const diff = Math.round((f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'vencido'
    if (diff <= 3) return 'urgente'
    return 'proximo'
  }

  function textoAlerta(fecha: string) {
    const hoy = new Date()
    const f = new Date(fecha)
    const diff = Math.round((f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'Vencido'
    if (diff === 0) return 'Vence hoy'
    return `En ${diff} días`
  }

  const ESTILO_URGENCIA: Record<string, { icono: string; badge: string }> = {
    vencido: { icono: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400', badge: 'badge-rose' },
    urgente: { icono: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400', badge: 'badge-amber' },
    proximo: { icono: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400', badge: 'badge-emerald' },
  }

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-sm">
          <span className="h-4 w-4 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-blue-500 animate-spin" />
          Cargando...
        </div>
      </div>
    )
  }

  const pct = (n: number) => (stats.total ? Math.round((n / stats.total) * 100) : 0)

  const statCards = [
    { label: 'Total equipos', value: stats.total, icon: IconLayers, iconClass: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800', nota: 'equipos registrados', notaClass: 'text-slate-400 dark:text-slate-500' },
    { label: 'Operativos', value: stats.operativos, icon: IconCheckCircle, iconClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40', nota: `${pct(stats.operativos)}% del total`, notaClass: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'En mantenimiento', value: stats.mantenimiento, icon: IconWrench, iconClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40', nota: `${pct(stats.mantenimiento)}% del total`, notaClass: 'text-amber-600 dark:text-amber-400' },
    { label: 'Fuera de servicio', value: stats.fuera, icon: IconXCircle, iconClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40', nota: `${pct(stats.fuera)}% del total`, notaClass: 'text-rose-600 dark:text-rose-400' },
    { label: 'Asignados', value: stats.asignados, icon: IconUser, iconClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40', nota: `${pct(stats.asignados)}% del total`, notaClass: 'text-blue-600 dark:text-blue-400' },
    { label: 'Pendientes de revisión', value: stats.pendientes, icon: IconClock, iconClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40', nota: 'próximos 7 días', notaClass: 'text-cyan-600 dark:text-cyan-400' },
  ]

  const distribucion = [
    { label: 'Operativos', value: stats.operativos, color: '#10b981' },
    { label: 'En mantenimiento', value: stats.mantenimiento, color: '#f59e0b' },
    { label: 'Fuera de servicio', value: stats.fuera, color: '#f43f5e' },
  ]

  const hoy = new Date()

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 w-full">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>Dashboard general</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Resumen del estado de tus equipos · {MESES[hoy.getMonth()]} {hoy.getFullYear()}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="card card-hover group p-5 animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className={`icon-tile h-9 w-9 mb-3 transition-transform duration-200 group-hover:scale-110 ${card.iconClass}`}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
                <AnimatedNumber value={card.value} />
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">{card.label}</div>
              <div className={`text-xs font-medium mt-2 ${card.notaClass}`}>{card.nota}</div>
            </div>
          )
        })}
      </div>

      {stats.total > 0 && (
        <div className="card p-6 sm:p-7 mb-8 animate-fade-up flex flex-col sm:flex-row items-center gap-8">
          <DonutChart data={distribucion} />
          <div className="flex-1 w-full">
            <h2 className="section-eyebrow mb-4">Distribución de equipos</h2>
            <div className="flex flex-col gap-3">
              {distribucion.map(d => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{d.label}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{d.value}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-10 text-right tabular-nums">{pct(d.value)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="section-eyebrow">Mantenimientos próximos</h2>
        {alertas.length > 0 && <span className="badge-slate">{alertas.length}</span>}
      </div>

      {alertas.length === 0 ? (
        <div className="card border-dashed p-8 text-center flex flex-col items-center animate-fade-up mb-8">
          <p className="text-slate-500 dark:text-slate-400 text-sm">No hay mantenimientos programados para los próximos 7 días.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-8">
          {alertas.map((a, i) => {
            const estilo = ESTILO_URGENCIA[urgencia(a.proxima_fecha)]
            return (
              <div
                key={a.id}
                className="card card-hover flex items-center gap-4 p-4 animate-fade-up"
                style={{ animationDelay: `${0.1 + i * 0.04}s` }}
              >
                <span className={`icon-tile h-10 w-10 shrink-0 ${estilo.icono}`}>
                  <IconAlertTriangle className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{a.equipos?.nombre}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{a.tipo}{a.equipos?.ubicacion ? ` · ${a.equipos.ubicacion}` : ''}</p>
                </div>
                <span className={`shrink-0 ${estilo.badge}`}>{textoAlerta(a.proxima_fecha)}</span>
              </div>
            )
          })}
        </div>
      )}

      <Link href="/equipos" className="btn btn-secondary btn-md mx-auto flex w-fit">
        Ver todos los equipos
        <IconArrowRight className="h-4 w-4" />
      </Link>
    </main>
  )
}
