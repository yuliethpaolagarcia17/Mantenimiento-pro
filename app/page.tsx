'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [stats, setStats] = useState({
    total: 0, operativos: 0, mantenimiento: 0, fuera: 0
  })
  const router = useRouter()

  useEffect(() => {
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
    cargar()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">MantenPro</h1>
          <p className="text-gray-500">Sistema de Mantenimiento Preventivo</p>
        </div>
        <button onClick={cerrarSesion}
          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
          Cerrar sesión
        </button>
      </div>

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
        <a href="/equipos" className="block bg-blue-700 text-white text-center py-3 rounded-lg text-lg font-medium">
          Ver todos los equipos →
        </a>
        <a href="/mantenimientos" className="block bg-white border border-blue-700 text-blue-700 text-center py-3 rounded-lg text-lg font-medium">
          Plan de mantenimiento →
        </a>
      </div>
    </main>
  )
}