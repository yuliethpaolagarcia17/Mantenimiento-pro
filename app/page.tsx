'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [stats, setStats] = useState({ total: 0, operativos: 0, mantenimiento: 0, fuera: 0 })
  const [alertas, setAlertas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    verificarSesion()
  }, [])

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
    { label: 'Total equipos', value: stats.total, color: 'text-gray-900', bar: 'bg-gray-300' },
    { label: 'Operativos', value: stats.operativos, color: 'text-emerald-600', bar: 'bg-emerald-500' },
    { label: 'En mantenimiento', value: stats.mantenimiento, color: 'text-amber-500', bar: 'bg-amber-500' },
    { label: 'Fuera de servicio', value: stats.fuera, color: 'text-red-500', bar: 'bg-red-500' },
  ]

  const links = [
    { href: '/equipos', title: 'Equipos', desc: 'Ver e inventario completo' },
    { href: '/mantenimientos', title: 'Plan de mantenimiento', desc: 'Programar y dar seguimiento' },
    { href: '/historial', title: 'Historial', desc: 'Mantenimientos realizados' },
  ]

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">MantenPro</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de mantenimiento preventivo</p>
        </div>
        <button
          onClick={cerrarSesion}
          className="text-sm text-gray-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

      {alertas.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-500">
            Alertas de mantenimiento
          </h2>
          <div className="flex flex-col gap-2">
            {alertas.map(a => (
              <div key={a.id} className={`border-l-4 p-4 rounded-lg flex items-center justify-between ${colorAlerta(a.proxima_fecha)}`}>
                <div>
                  <div className="font-medium text-gray-900">{a.equipos?.nombre}</div>
                  <div className="text-sm text-gray-600">{a.tipo}</div>
                </div>
                <span className="text-sm font-medium text-gray-700">{textoAlerta(a.proxima_fecha)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 overflow-hidden relative">
            <div className={`absolute top-0 left-0 right-0 h-1 ${card.bar}`} />
            <div className={`text-3xl font-semibold ${card.color}`}>{card.value}</div>
            <div className="text-gray-500 text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-500">
        Accesos rápidos
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{link.title}</span>
              <span className="text-gray-300 group-hover:text-indigo-500 transition-colors">→</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
