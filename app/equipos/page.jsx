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

  function estadoColor(estado) {
    if (estado === 'operativo') return 'bg-emerald-50 text-emerald-700'
    if (estado === 'mantenimiento') return 'bg-amber-50 text-amber-700'
    return 'bg-red-50 text-red-700'
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Equipos</h1>
        <Link
          href="/equipos/nuevo"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Agregar equipo
        </Link>
      </div>

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando equipos...</p>
      ) : equipos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-500 text-sm">No hay equipos registrados todavía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {equipos.map((eq) => (
            <Link
              key={eq.id}
              href={`/equipos/${eq.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-base font-medium text-gray-900 truncate">{eq.nombre}</p>
                  <p className="text-sm text-gray-500 truncate">{eq.marca} · {eq.modelo} · {eq.ubicacion}</p>
                </div>
                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${estadoColor(eq.estado)}`}>
                  {eq.estado}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}