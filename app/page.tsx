'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [stats, setStats] = useState({
    total: 0, operativos: 0, mantenimiento: 0, fuera: 0
  })

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

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">MantenPro</h1>
      <p className="text-gray-500 mb-8">Sistema de Mantenimiento Preventivo</p>

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

      <a href="/equipos" className="block bg-blue-700 text-white text-center py-3 rounded-lg text-lg font-medium">
        Ver todos los equipos →
      </a>
    </main>
  )
}