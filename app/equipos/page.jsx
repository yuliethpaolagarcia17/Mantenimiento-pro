'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { IconPlus, IconInbox, IconArrowRight, IconSearch, IconMapPin } from '../components/Icons'
import { ICONO_POR_CATEGORIA, IconCategoriaDefault } from '../components/CategoriaEquipo'

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'operativo', label: 'Operativos' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
  { value: 'fuera de servicio', label: 'Fuera de servicio' },
]

export default function Equipos() {
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')

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

  function estadoBadge(estado) {
    if (estado === 'operativo') return 'badge-emerald'
    if (estado === 'mantenimiento') return 'badge-amber'
    return 'badge-rose'
  }

  function estadoIconBg(estado) {
    if (estado === 'operativo') return 'bg-emerald-50 text-emerald-600'
    if (estado === 'mantenimiento') return 'bg-amber-50 text-amber-600'
    return 'bg-rose-50 text-rose-600'
  }

  const equiposFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return equipos.filter(eq => {
      const coincideFiltro = filtro === 'todos' || eq.estado === filtro
      if (!coincideFiltro) return false
      if (!q) return true
      return [eq.nombre, eq.marca, eq.modelo, eq.ubicacion, eq.categoria].some(v => (v || '').toLowerCase().includes(q))
    })
  }, [equipos, busqueda, filtro])

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Equipos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{equipos.length} {equipos.length === 1 ? 'equipo registrado' : 'equipos registrados'}</p>
        </div>
        <Link href="/equipos/nuevo" className="btn btn-primary btn-md">
          <IconPlus className="h-4 w-4" />
          Agregar equipo
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, marca, modelo o ubicación..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                filtro === f.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-[76px] rounded-xl bg-white border border-slate-100 overflow-hidden relative">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
            </div>
          ))}
        </div>
      ) : equipos.length === 0 ? (
        <div className="card border-dashed p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="icon-tile h-12 w-12 rounded-full bg-slate-100 text-slate-400 mb-3">
            <IconInbox className="h-6 w-6" />
          </span>
          <p className="text-slate-500 text-sm">No hay equipos registrados todavía.</p>
          <Link href="/equipos/nuevo" className="btn btn-primary btn-sm mt-4">
            <IconPlus className="h-3.5 w-3.5" />
            Agregar el primero
          </Link>
        </div>
      ) : equiposFiltrados.length === 0 ? (
        <div className="card border-dashed p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="icon-tile h-12 w-12 rounded-full bg-slate-100 text-slate-400 mb-3">
            <IconSearch className="h-6 w-6" />
          </span>
          <p className="text-slate-500 text-sm">Ningún equipo coincide con la búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {equiposFiltrados.map((eq, i) => {
            const IconCategoria = ICONO_POR_CATEGORIA[eq.categoria] || IconCategoriaDefault
            return (
              <Link
                key={eq.id}
                href={`/equipos/${eq.id}`}
                className="card card-hover flex items-center gap-4 p-5 group animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
              >
                <span className={`icon-tile h-11 w-11 shrink-0 transition-transform duration-200 group-hover:scale-110 ${estadoIconBg(eq.estado)}`}>
                  <IconCategoria className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-medium text-slate-900 truncate">{eq.nombre}</p>
                    {eq.categoria && <span className="badge-slate shrink-0">{eq.categoria}</span>}
                  </div>
                  <p className="text-sm text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    {eq.marca} · {eq.modelo}
                    {eq.ubicacion && (
                      <span className="inline-flex items-center gap-0.5 text-slate-400">
                        <IconMapPin className="h-3 w-3 shrink-0" /> {eq.ubicacion}
                      </span>
                    )}
                  </p>
                </div>
                <span className={`shrink-0 ${estadoBadge(eq.estado)}`}>
                  {eq.estado}
                </span>
                <IconArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
