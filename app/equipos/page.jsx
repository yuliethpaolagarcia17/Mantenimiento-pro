'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HojaVida({ params }) {
  const [equipo, setEquipo] = useState(null)
  const [planes, setPlanes] = useState([])

  useEffect(() => {
    async function cargar() {
      const { data: eq } = await supabase
        .from('equipos')
        .select('*')
        .eq('id', params.id)
        .single()
      setEquipo(eq)

      const { data: pl } = await supabase
        .from('planes_mantenimiento')
        .select('*')
        .eq('equipo_id', params.id)
        .order('created_at', { ascending: false })
      setPlanes(pl || [])
    }
    cargar()
  }, [params.id])

  if (!equipo) return (
    <div className="p-8 text-center">
      <p className="text-gray-500">Cargando equipo...</p>
    </div>
  )

  return (
    <main className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-700 mb-1">{equipo.nombre}</h1>
      <span className={`text-sm px-3 py-1 rounded-full font-medium ${
        equipo.estado === 'operativo' ? 'bg-green-100 text-green-700' :
        equipo.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-700' :
        'bg-red-100 text-red-700'
      }`}>{equipo.estado}</span>

      <div className="bg-white p-4 rounded-lg shadow mt-4">
        <h2 className="font-bold text-lg mb-3">Información del equipo</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Marca', equipo.marca],
            ['Modelo', equipo.modelo],
            ['Serial', equipo.serial],
            ['Ubicación', equipo.ubicacion],
            ['Responsable', equipo.responsable],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 p-2 rounded">
              <div className="text-xs text-gray-500">{label}</div>
              <div className="font-medium text-sm">{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mt-4">
        <h2 className="font-bold text-lg mb-3">Plan de mantenimiento</h2>
        {planes.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay planes registrados.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {planes.map(p => (
              <div key={p.id} className="border-l-4 border-blue-500 pl-3 py-1">
                <div className="font-medium text-sm">{p.tipo}</div>
                <div className="text-xs text-gray-500">{p.frecuencia} · Técnico: {p.tecnico}</div>
                <div className="text-xs text-gray-600">Próxima fecha: {new Date(p.proxima_fecha).toLocaleDateString('es-CO')}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <a href="/equipos" className="text-blue-700 text-sm">← Volver a equipos</a>
      </div>
    </main>
  )
}