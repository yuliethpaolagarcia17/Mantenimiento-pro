'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HojaVida({ params }) {
  const [equipo, setEquipo] = useState(null)
  const [mantenimientos, setMantenimientos] = useState([])

  useEffect(() => {
    async function cargar() {
      const { data: eq } = await supabase
        .from('equipos')
        .select('*')
        .eq('id', params.id)
        .single()
      setEquipo(eq)

      const { data: mant } = await supabase
        .from('mantenimientos')
        .select('*')
        .eq('equipo_id', params.id)
        .order('created_at', { ascending: false })
      setMantenimientos(mant || [])
    }
    cargar()
  }, [params.id])

  if (!equipo) return <div className="p-8">Cargando...</div>

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">{equipo.nombre}</h1>
      <span className={`text-sm px-3 py-1 rounded-full font-medium ${
        equipo.estado === 'operativo' ? 'bg-green-100 text-green-700' :
        equipo.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-700' :
        'bg-red-100 text-red-700'
      }`}>{equipo.estado}</span>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="font-bold text-lg mb-4">Información del equipo</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Marca', equipo.marca],
            ['Modelo', equipo.modelo],
            ['Serial', equipo.serial],
            ['Ubicación', equipo.ubicacion],
            ['Responsable', equipo.responsable],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">{label}</div>
              <div className="font-medium">{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="font-bold text-lg mb-4">Historial de mantenimientos</h2>
        {mantenimientos.length === 0 ? (
          <p className="text-gray-500">No hay mantenimientos registrados.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {mantenimientos.map(m => (
              <div key={m.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="font-medium">{m.tipo}</div>
                <div className="text-sm text-gray-500">{m.tecnico} · {new Date(m.fecha).toLocaleDateString('es-CO')}</div>
                <div className="text-sm text-gray-600">{m.descripcion}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <a href="/equipos" className="text-blue-700">← Volver a equipos</a>
      </div>
    </main>
  )
}