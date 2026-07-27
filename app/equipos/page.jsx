'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { IconPlus, IconInbox, IconArrowRight, IconSearch, IconMapPin, IconEdit, IconChevronLeft } from '../components/Icons'
import { ICONO_POR_CATEGORIA, IconCategoriaDefault } from '../components/CategoriaEquipo'
import { obtenerPerfilActual } from '@/lib/perfil'
import { puedeEditar } from '@/lib/permisos'

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'operativo', label: 'Operativos' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
  { value: 'fuera de servicio', label: 'Fuera de servicio' },
  { value: 'retirado', label: 'Retirados' },
]

const POR_PAGINA = 8

export default function Equipos() {
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [pagina, setPagina] = useState(1)
  const [rol, setRol] = useState('')

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
    async function cargarPerfil() {
      const perfil = await obtenerPerfilActual()
      setRol(perfil?.rol || '')
    }
    cargar()
    cargarPerfil()
  }, [])

  function estadoBadge(estado) {
    if (estado === 'operativo') return 'badge-emerald'
    if (estado === 'mantenimiento') return 'badge-amber'
    if (estado === 'retirado') return 'badge-slate'
    return 'badge-rose'
  }

  function estadoIconBg(estado) {
    if (estado === 'operativo') return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
    if (estado === 'mantenimiento') return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
    if (estado === 'retirado') return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
    return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
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

  const totalPaginas = Math.max(1, Math.ceil(equiposFiltrados.length / POR_PAGINA))
  const equiposPagina = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA
    return equiposFiltrados.slice(inicio, inicio + POR_PAGINA)
  }, [equiposFiltrados, pagina])

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>Equipos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{equipos.length} {equipos.length === 1 ? 'equipo registrado' : 'equipos registrados'}</p>
        </div>
        {puedeEditar(rol) && (
          <Link href="/equipos/nuevo" className="btn btn-primary btn-md">
            <IconPlus className="h-4 w-4" />
            Agregar equipo
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }}
            placeholder="Buscar por nombre, marca, modelo o ubicación..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => { setFiltro(f.value); setPagina(1) }}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                filtro === f.value
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
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
            <div key={i} className="h-[76px] rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 overflow-hidden relative">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent" />
            </div>
          ))}
        </div>
      ) : equipos.length === 0 ? (
        <div className="card border-dashed p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="icon-tile h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <IconInbox className="h-6 w-6" />
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">No hay equipos registrados todavía.</p>
          {puedeEditar(rol) && (
            <Link href="/equipos/nuevo" className="btn btn-primary btn-sm mt-4">
              <IconPlus className="h-3.5 w-3.5" />
              Agregar el primero
            </Link>
          )}
        </div>
      ) : equiposFiltrados.length === 0 ? (
        <div className="card border-dashed p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="icon-tile h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <IconSearch className="h-6 w-6" />
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Ningún equipo coincide con la búsqueda.</p>
        </div>
      ) : (
        <>
          {/* Tabla en desktop */}
          <div className="hidden md:block card overflow-hidden animate-fade-up">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Equipo</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Marca / Modelo</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Ubicación</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Estado</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equiposPagina.map(eq => {
                  const IconCategoria = ICONO_POR_CATEGORIA[eq.categoria] || IconCategoriaDefault
                  return (
                    <tr key={eq.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href={`/equipos/${eq.id}`} className="flex items-center gap-3 group">
                          <span className={`icon-tile h-9 w-9 shrink-0 transition-transform duration-200 group-hover:scale-110 ${estadoIconBg(eq.estado)}`}>
                            <IconCategoria className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{eq.nombre}</p>
                            {eq.categoria && <p className="text-xs text-slate-400 dark:text-slate-500">{eq.categoria}</p>}
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{[eq.marca, eq.modelo].filter(Boolean).join(' · ') || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                        {eq.ubicacion ? (
                          <span className="inline-flex items-center gap-1"><IconMapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> {eq.ubicacion}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={estadoBadge(eq.estado)}>{eq.estado}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {puedeEditar(rol) && (
                            <Link href={`/equipos/${eq.id}/editar`} title="Editar" className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
                              <IconEdit className="h-4 w-4" />
                            </Link>
                          )}
                          <Link href={`/equipos/${eq.id}`} title="Ver hoja de vida" className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
                            <IconArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas en mobile */}
          <div className="md:hidden space-y-3">
            {equiposPagina.map((eq, i) => {
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
                      <p className="text-base font-medium text-slate-900 dark:text-slate-100 truncate">{eq.nombre}</p>
                      {eq.categoria && <span className="badge-slate shrink-0">{eq.categoria}</span>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      {eq.marca} · {eq.modelo}
                      {eq.ubicacion && (
                        <span className="inline-flex items-center gap-0.5 text-slate-400 dark:text-slate-500">
                          <IconMapPin className="h-3 w-3 shrink-0" /> {eq.ubicacion}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`shrink-0 ${estadoBadge(eq.estado)}`}>
                    {eq.estado}
                  </span>
                  <IconArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
                </Link>
              )
            })}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Página {pagina} de {totalPaginas} · {equiposFiltrados.length} resultados
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="btn btn-secondary btn-sm disabled:opacity-40"
                >
                  <IconChevronLeft className="h-3.5 w-3.5" />
                  Anterior
                </button>
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="btn btn-secondary btn-sm disabled:opacity-40"
                >
                  Siguiente
                  <IconArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
