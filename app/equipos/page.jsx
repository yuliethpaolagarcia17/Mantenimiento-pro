'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { IconBox, IconPlus, IconInbox, IconArrowRight } from '../components/Icons'

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

  function estadoIconBg(estado) {
    if (estado === 'operativo') return 'bg-emerald-50 text-emerald-600'
    if (estado === 'mantenimiento') return 'bg-amber-50 text-amber-600'
    return 'bg-red-50 text-red-600'
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Equipos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{equipos.length} {equipos.length === 1 ? 'equipo registrado' : 'equipos registrados'}</p>
        </div>
        <Link
          href="/equipos/nuevo"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200"
        >
          <IconPlus className="h-4 w-4" />
          Agregar equipo
        </Link>
      </div>

      {cargando ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-[74px] rounded-xl bg-white border border-gray-100 overflow-hidden relative">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
            </div>
          ))}
        </div>
      ) : equipos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="h-12 w-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
            <IconInbox className="h-6 w-6" />
          </span>
          <p className="text-gray-500 text-sm">No hay equipos registrados todavía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {equipos.map((eq, i) => (
            <Link
              key={eq.id}
              href={`/equipos/${eq.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <span className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${estadoIconBg(eq.estado)}`}>
                <IconBox className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-medium text-gray-900 truncate">{eq.nombre}</p>
                <p className="text-sm text-gray-500 truncate">{eq.marca} · {eq.modelo} · {eq.ubicacion}</p>
              </div>
              <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${estadoColor(eq.estado)}`}>
                {eq.estado}
              </span>
              <IconArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
