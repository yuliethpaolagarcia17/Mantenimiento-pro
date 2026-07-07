'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Equipos() {
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase.from('equipos').select('*')
        if (error) throw error
        setEquipos(data)
      } catch (e) {
        console.error('Error cargando equipos:', e)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  if (cargando) return <p className="p-8 text-gray-500">Cargando equipos...</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Equipos</h1>
          <Link href="/equipos/nuevo" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Agregar equipo
          </Link>
        </div>
        {equipos.length === 0 ? (
          <p className="text-gray-500">No hay equipos registrados todavia.</p>
        ) : (
          <div className="space-y-3">
            {equipos.map((eq) => (
              <Link key={eq.id} href={`/equipos/${eq.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{eq.nombre}</p>
                    <p className="text-sm text-gray-500">{eq.marca} · {eq.modelo} · {eq.ubicacion}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${eq.estado === 'operativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {eq.estado}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}