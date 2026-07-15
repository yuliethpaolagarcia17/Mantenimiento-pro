'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
    const { data } = await supabase.from('equipos').select('*')
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
    const { data } = await supabase
      .from('planes_mantenimiento')
      .select('*, equipos(nombre)')
      .lte('proxima_fecha', en7dias.toISOString().split('T')[0])
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
    if (diff < 0) return 'bg-red-100 border-red-400 text-red-700'
    if (diff <= 7) return 'bg-yellow-100 border-yellow-400 text-yellow-700'
    return 'bg-green-100 border-green-400 text-green-700'
  }

  function textoAlerta(fecha: string) {
    const hoy = new Date()
    const f = new Date(fecha)
    const diff = Math.round((f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return '⚠️ Vencido'
    if (diff === 0) return '🔴 Vence hoy'
    return `🟡 Vence en ${diff} días`
  }

  if (cargando) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">MantenPro</h1>
          <p className="text-gray-500">Sistema de Mantenimiento Preventivo</p>
        </div>
        <button onClick={cerrarSesion} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
          Cerrar sesión
        </button>
      </div>

      {alertas.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-lg text-red-600 mb-3">🔔 Alertas de mantenimiento</h2>
          <div className="flex flex-col gap-2">
            {alertas.map(a => (
              <div key={a.id} className={`border-l-4 p-3 rounded-lg ${colorAlerta(a.proxima_fecha)}`}>
                <div className="font-medium">{a.equipos?.nombre} — {a.tipo}</div>
                <div className="text-sm">{textoAlerta(a.proxima_fecha)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-4xl font-bold text-blue-700">{stats.total}</div>
          <div className="text-gray-500 mt-1">Total equipos</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-4xl font-bold text-green-600">{stats.operativos}</div>
          <div className="text-gray-500 mt-1">Operativos</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-4xl font-bold text-yellow-500">{stats.mantenimiento}</div>
          <div className="text-gray-500 mt-1">En mantenimiento</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-4xl font-bold text-red-500">{stats.fuera}</div>
          <div className="text-gray-500 mt-1">Fuera de servicio</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <a href="/equipos" className="block bg-blue-700 text-white text-center py-3 rounded-lg text-lg font-medium">Ver todos los equipos →</a>
        <a href="/mantenimientos" className="block bg-white border border-blue-700 text-blue-700 text-center py-3 rounded-lg text-lg font-medium">Plan de mantenimiento →</a>
        <a href="/historial" className="block bg-white border border-blue-700 text-blue-700 text-center py-3 rounded-lg text-lg font-medium">Historial →</a>
      </div>
    </main>
  )
}