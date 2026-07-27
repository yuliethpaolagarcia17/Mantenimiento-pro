'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { IconLayers, IconCheckCircle, IconWrench, IconXCircle, IconAlertTriangle, IconArrowRight, IconUser, IconClock, IconTrendUp, IconTag, IconMapPin, IconInbox, IconPlus, IconFileText, IconQrCode, IconCalendar } from './components/Icons'
import DonutChart from './components/DonutChart'
import BarList from './components/BarList'
import AreaChart from './components/AreaChart'

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
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

type Alerta = {
  id: string | number
  tipo: string
  proxima_fecha: string
  equipos?: { nombre: string; ubicacion?: string | null } | null
}

type Actividad = {
  id: string | number
  tipo: string
  descripcion?: string | null
  tecnico?: string | null
  fecha: string
  equipos?: { nombre: string } | null
}

function nombreDesdeEmail(email: string) {
  if (!email) return ''
  const local = email.split('@')[0]
  return local.charAt(0).toUpperCase() + local.slice(1)
}

function tiempoRelativo(fecha: string) {
  const hoy = new Date()
  const f = new Date(fecha)
  const diffDias = Math.round((hoy.getTime() - f.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDias <= 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  if (diffDias < 30) {
    const semanas = Math.floor(diffDias / 7)
    return `Hace ${semanas} semana${semanas > 1 ? 's' : ''}`
  }
  return f.toLocaleDateString('es-CO')
}

function top5(lista: Record<string, string>[], campo: string) {
  const conteo: Record<string, number> = {}
  lista.forEach(e => {
    const v = (e[campo] || '').trim()
    if (v) conteo[v] = (conteo[v] || 0) + 1
  })
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }))
}

export default function Home() {
  const [stats, setStats] = useState({ total: 0, operativos: 0, mantenimiento: 0, fuera: 0, asignados: 0, pendientes: 0 })
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [marcasTop, setMarcasTop] = useState<{ label: string; value: number }[]>([])
  const [ubicacionesTop, setUbicacionesTop] = useState<{ label: string; value: number }[]>([])
  const [tendenciaMensual, setTendenciaMensual] = useState<{ label: string; value: number }[]>([])
  const [actividad, setActividad] = useState<Actividad[]>([])
  const [email, setEmail] = useState('')
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
        setMarcasTop(top5(data, 'marca'))
        setUbicacionesTop(top5(data, 'ubicacion'))
      }
    }

    async function cargarAlertas() {
      const hoy = new Date()
      const en7dias = new Date()
      en7dias.setDate(hoy.getDate() + 7)
      const { data, error } = await supabase
        .from('planes_mantenimiento')
        .select('*, equipos(nombre, ubicacion)')
        .eq('estado', 'activo')
        .lte('proxima_fecha', en7dias.toISOString().split('T')[0])
        .order('proxima_fecha', { ascending: true })
      if (error) console.error('Error cargando alertas:', error)
      setAlertas(data || [])
      setStats(prev => ({ ...prev, pendientes: new Set((data || []).map(a => a.equipo_id)).size }))
    }

    async function cargarActividad() {
      const { data, error } = await supabase
        .from('historial_mantenimientos')
        .select('id, tipo, descripcion, tecnico, fecha, equipos(nombre)')
        .eq('anulado', false)
        .order('fecha', { ascending: false })
        .limit(5)
      if (error) console.error('Error cargando actividad:', error)
      setActividad((data as unknown as Actividad[]) || [])
    }

    async function cargarTendenciaMensual() {
      const hoy = new Date()
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1)

      const meses: { key: string; label: string; value: number }[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
        meses.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MESES_CORTOS[d.getMonth()], value: 0 })
      }

      try {
        const { data, error } = await supabase
          .from('historial_mantenimientos')
          .select('fecha')
          .gte('fecha', inicio.toISOString().split('T')[0])
        if (error) throw error
        ;(data || []).forEach(h => {
          const f = new Date(h.fecha)
          const key = `${f.getFullYear()}-${f.getMonth()}`
          const mes = meses.find(m => m.key === key)
          if (mes) mes.value += 1
        })
      } catch (e) {
        console.error('Error cargando tendencia:', e)
      }
      setTendenciaMensual(meses.map(({ label, value }) => ({ label, value })))
    }

    async function verificarSesion() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.replace('/login')
        return
      }
      setEmail(session.user?.email || '')
      cargar()
      cargarAlertas()
      cargarActividad()
      cargarTendenciaMensual()
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

  const heroCards = [
    { label: 'Total equipos', value: stats.total, icon: IconLayers, gradient: 'from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800', glow: '#334155', nota: 'equipos registrados' },
    { label: 'Operativos', value: stats.operativos, icon: IconCheckCircle, gradient: 'from-emerald-500 to-emerald-600', glow: '#10b981', nota: `${pct(stats.operativos)}% del total`, notaClass: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Pendientes de revisión', value: stats.pendientes, icon: IconClock, gradient: 'from-cyan-500 to-cyan-600', glow: '#06b6d4', nota: 'próximos 7 días', notaClass: 'text-cyan-600 dark:text-cyan-400' },
  ]

  const secondaryCards = [
    { label: 'En mantenimiento', value: stats.mantenimiento, icon: IconWrench, gradient: 'from-amber-500 to-amber-600', nota: `${pct(stats.mantenimiento)}%` },
    { label: 'Fuera de servicio', value: stats.fuera, icon: IconXCircle, gradient: 'from-rose-500 to-rose-600', nota: `${pct(stats.fuera)}%` },
    { label: 'Asignados', value: stats.asignados, icon: IconUser, gradient: 'from-blue-500 to-blue-600', nota: `${pct(stats.asignados)}%` },
  ]

  const distribucion = [
    { label: 'Operativos', value: stats.operativos, color: '#10b981' },
    { label: 'En mantenimiento', value: stats.mantenimiento, color: '#f59e0b' },
    { label: 'Fuera de servicio', value: stats.fuera, color: '#f43f5e' },
  ]

  const hoy = new Date()
  const resumen = `Tienes ${stats.total} equipo${stats.total === 1 ? '' : 's'} registrado${stats.total === 1 ? '' : 's'}, ${stats.pendientes} con mantenimiento próximo${stats.fuera > 0 ? ` y ${stats.fuera} fuera de servicio` : ''}.`

  const accesosRapidos = [
    { label: 'Registrar equipo', href: '/equipos/nuevo', icon: IconPlus, iconClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Programar mantenimiento', href: '/mantenimientos', icon: IconWrench, iconClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Generar reporte PDF', href: '/reportes', icon: IconFileText, iconClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Escanear QR', href: '/escanear', icon: IconQrCode, iconClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40' },
  ]

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 w-full">
      <div className="mb-10 animate-fade-up flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>
            {email ? <>Bienvenido, <span className="text-brand-gradient">{nombreDesdeEmail(email)}</span></> : <>Dashboard <span className="text-brand-gradient">general</span></>}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5">{resumen}</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">{MESES[hoy.getMonth()]} {hoy.getFullYear()}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/15 dark:ring-emerald-400/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
          Datos en vivo
        </span>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {accesosRapidos.map((accion, i) => {
          const Icon = accion.icon
          return (
            <Link
              key={accion.label}
              href={accion.href}
              className="card card-hover group flex flex-col sm:flex-row items-center sm:items-center gap-3 p-4 animate-fade-up text-center sm:text-left"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <span className={`icon-tile h-10 w-10 shrink-0 transition-transform duration-300 group-hover:scale-110 ${accion.iconClass}`}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{accion.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Indicadores principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {heroCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="card-premium card-premium-hover group p-6 animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <span className="glow-orb -top-10 -right-8 h-32 w-32" style={{ backgroundColor: card.glow }} />
              <span className={`relative icon-tile h-13 w-13 mb-4 bg-gradient-to-br ${card.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                <Icon className="h-6 w-6" />
              </span>
              <div className="relative text-4xl sm:text-5xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                <AnimatedNumber value={card.value} />
              </div>
              <div className="relative text-slate-500 dark:text-slate-400 text-sm mt-2">{card.label}</div>
              <div className={`relative text-xs font-medium mt-2 ${card.notaClass ?? 'text-slate-400 dark:text-slate-500'}`}>{card.nota}</div>
            </div>
          )
        })}
      </div>

      {/* Indicadores secundarios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {secondaryCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="card card-hover group flex items-center gap-4 p-4 animate-fade-up"
              style={{ animationDelay: `${0.18 + i * 0.05}s` }}
            >
              <span className={`icon-tile h-11 w-11 shrink-0 bg-gradient-to-br ${card.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
                  <AnimatedNumber value={card.value} />
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs truncate">{card.label}</div>
              </div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">{card.nota}</span>
            </div>
          )
        })}
      </div>

      {/* Fila de analítica: distribución, marcas, ubicaciones */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="card-premium p-6 animate-fade-up flex flex-col items-center text-center" style={{ animationDelay: '0.24s' }}>
            <span className="glow-orb top-0 left-0 h-40 w-40" style={{ backgroundColor: '#2563eb' }} />
            <h2 className="section-eyebrow mb-5 self-start">Distribución de equipos</h2>
            <DonutChart data={distribucion} size={168} thickness={20} centerValue={stats.total} centerLabel="equipos" />
            <div className="relative flex flex-col gap-2 w-full mt-6">
              {distribucion.map(d => (
                <div key={d.label} className="flex items-center gap-2 text-left">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{d.label}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{d.value}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-9 text-right tabular-nums">{pct(d.value)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium p-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="icon-tile h-8 w-8 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <IconTag className="h-4 w-4" />
              </span>
              <h2 className="section-eyebrow">Equipos por marca</h2>
            </div>
            {marcasTop.length > 0 ? (
              <BarList items={marcasTop} color="#2563eb" />
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">Sin datos de marca aún.</p>
            )}
          </div>

          <div className="card-premium p-6 animate-fade-up" style={{ animationDelay: '0.36s' }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="icon-tile h-8 w-8 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                <IconMapPin className="h-4 w-4" />
              </span>
              <h2 className="section-eyebrow">Equipos por ubicación</h2>
            </div>
            {ubicacionesTop.length > 0 ? (
              <BarList items={ubicacionesTop} color="#06b6d4" />
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">Sin datos de ubicación aún.</p>
            )}
          </div>
        </div>
      )}

      {/* Tendencia mensual de mantenimientos */}
      <div className="card-premium p-6 sm:p-7 mb-10 animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="icon-tile h-8 w-8 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <IconTrendUp className="h-4 w-4" />
          </span>
          <h2 className="section-eyebrow">Mantenimientos por mes</h2>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Últimos 6 meses · basado en el historial registrado</p>
        <AreaChart data={tendenciaMensual} color="#2563eb" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="section-eyebrow">Mantenimientos próximos</h2>
        {alertas.length > 0 && <span className="badge-slate">{alertas.length}</span>}
      </div>

      {alertas.length === 0 ? (
        <div className="card border-dashed p-8 text-center flex flex-col items-center animate-fade-up mb-10">
          <span className="icon-tile h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <IconCalendar className="h-4.5 w-4.5" />
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">No hay mantenimientos programados para los próximos 7 días.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-10">
          {alertas.map((a, i) => {
            const estilo = ESTILO_URGENCIA[urgencia(a.proxima_fecha)]
            return (
              <div
                key={a.id}
                className="card card-hover flex items-center gap-4 p-4 animate-fade-up"
                style={{ animationDelay: `${0.46 + i * 0.04}s` }}
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

      {/* Actividad reciente */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-eyebrow">Actividad reciente</h2>
        {actividad.length > 0 && <span className="badge-slate">{actividad.length}</span>}
      </div>

      {actividad.length === 0 ? (
        <div className="card border-dashed p-8 text-center flex flex-col items-center animate-fade-up mb-10">
          <span className="icon-tile h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <IconInbox className="h-4.5 w-4.5" />
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Aún no hay mantenimientos registrados en el historial.</p>
        </div>
      ) : (
        <div className="relative flex flex-col gap-0 mb-10 pl-5">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800" />
          {actividad.map((h, i) => (
            <div
              key={h.id}
              className="relative flex items-start gap-4 py-3 animate-fade-up"
              style={{ animationDelay: `${0.55 + i * 0.05}s` }}
            >
              <span className="absolute -left-5 top-4 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-950" />
              <div className="min-w-0 flex-1 card card-hover p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    {h.tipo}{h.equipos?.nombre ? ` · ${h.equipos.nombre}` : ''}
                  </p>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">{tiempoRelativo(h.fecha)}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {h.descripcion || 'Sin descripción adicional'}{h.tecnico ? ` · ${h.tecnico}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link href="/equipos" className="btn btn-secondary btn-md mx-auto flex w-fit">
        Ver todos los equipos
        <IconArrowRight className="h-4 w-4" />
      </Link>
    </main>
  )
}
