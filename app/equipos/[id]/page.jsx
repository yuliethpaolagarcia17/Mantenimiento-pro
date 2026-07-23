'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import {
  IconWrench, IconTag, IconBox, IconMapPin, IconUser, IconCalendar,
  IconBuilding, IconShieldCheck, IconDollarSign, IconFileText, IconEdit, IconTrash, IconClock
} from '../../components/Icons'
import HistorialItem from '../../components/HistorialItem'
import { ICONO_POR_CATEGORIA, IconCategoriaDefault } from '../../components/CategoriaEquipo'

export default function HojaVida({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [equipo, setEquipo] = useState(null)
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase
          .from('equipos')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        setEquipo(data)
      } catch (e) {
        console.error('Error cargando equipo:', e)
      } finally {
        setCargando(false)
      }
    }
    async function cargarHistorial() {
      const { data, error } = await supabase
        .from('historial_mantenimientos')
        .select('*')
        .eq('equipo_id', id)
        .order('fecha', { ascending: false })
      if (error) console.error('Error cargando historial:', error)
      setHistorial(data || [])
    }
    cargar()
    cargarHistorial()
  }, [id])

  async function eliminar() {
    if (!confirm('¿Eliminar este equipo? Esta acción no se puede deshacer.')) return
    setEliminando(true)
    const { error } = await supabase.from('equipos').delete().eq('id', id)
    if (error) {
      alert('No se pudo eliminar: ' + error.message)
      setEliminando(false)
      return
    }
    router.push('/equipos')
  }

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-sm">
          <span className="h-4 w-4 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-blue-500 animate-spin" />
          Cargando equipo...
        </div>
      </div>
    )
  }
  if (!equipo) return <p className="p-8 text-slate-400 dark:text-slate-500 text-sm">Equipo no encontrado</p>

  const estadoBadge =
    equipo.estado === 'operativo' ? 'badge-emerald'
    : equipo.estado === 'mantenimiento' ? 'badge-amber'
    : 'badge-rose'

  const estadoDot =
    equipo.estado === 'operativo' ? 'bg-emerald-500'
    : equipo.estado === 'mantenimiento' ? 'bg-amber-500'
    : 'bg-rose-500'

  const urlEquipo =
    typeof window !== 'undefined' ? window.location.href : ''

  const IconCategoria = ICONO_POR_CATEGORIA[equipo.categoria] || IconCategoriaDefault

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 w-full">
      <Link href="/equipos" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium inline-flex items-center gap-1 group w-fit">
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> Volver a equipos
      </Link>

      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card p-6 sm:p-8 animate-fade-up">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <span className="icon-tile h-12 w-12 bg-brand-gradient text-white shadow-elevate shrink-0">
                  <IconCategoria className="h-5.5 w-5.5" />
                </span>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>{equipo.nombre}</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">{equipo.categoria || 'Hoja de vida del equipo'}</p>
                </div>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1.5 ${estadoBadge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${estadoDot}`} />
                {equipo.estado}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <Dato icon={IconCategoria} etiqueta="Categoría" valor={equipo.categoria || 'No registrada'} />
              <Dato icon={IconTag} etiqueta="Marca" valor={equipo.marca} />
              <Dato icon={IconBox} etiqueta="Modelo" valor={equipo.modelo} />
              <Dato icon={IconFileText} etiqueta="Serial" valor={equipo.serial} />
              <Dato icon={IconMapPin} etiqueta="Ubicación" valor={equipo.ubicacion} />
              <Dato icon={IconUser} etiqueta="Responsable" valor={equipo.responsable} />
              <Dato icon={IconCalendar} etiqueta="Fecha de compra" valor={equipo.fecha_compra || 'No registrada'} />
              <Dato icon={IconBuilding} etiqueta="Proveedor" valor={equipo.proveedor || 'No registrado'} />
              <Dato icon={IconShieldCheck} etiqueta="Garantía hasta" valor={equipo.garantia_hasta || 'No registrada'} />
              <Dato icon={IconDollarSign} etiqueta="Costo de compra" valor={equipo.costo_compra ? `$${equipo.costo_compra}` : 'No registrado'} />
            </div>

            {equipo.notas && (
              <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <p className="section-eyebrow mb-2">Notas</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{equipo.notas}</p>
              </div>
            )}

            <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-3">
              <Link href={`/equipos/${id}/editar`} className="btn btn-primary btn-md">
                <IconEdit className="h-4 w-4" />
                Editar equipo
              </Link>
              <button onClick={eliminar} disabled={eliminando} className="btn btn-danger-ghost btn-md">
                <IconTrash className="h-4 w-4" />
                {eliminando ? 'Eliminando...' : 'Eliminar equipo'}
              </button>
            </div>
          </div>

          <div className="card p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <p className="section-eyebrow mb-4">
              Historial de mantenimientos ({historial.length})
            </p>
            {historial.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">Este equipo no tiene mantenimientos registrados.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {historial.map(h => (
                  <HistorialItem key={h.id} registro={h} ubicacion={equipo.ubicacion} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card p-6 flex flex-col items-center text-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wide mb-4">
              <IconWrench className="h-3.5 w-3.5" />
              Código QR
            </div>
            <div className="p-3 bg-white border border-slate-200 dark:border-slate-800 rounded-xl shrink-0 shadow-sm">
              <QRCodeCanvas value={urlEquipo} size={150} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-4">
              Escanéalo desde el celular para acceder de inmediato a esta hoja de vida, sin buscar papeles ni carpetas.
            </p>
          </div>

          <div className="card p-6 bg-gradient-to-br from-blue-600 to-cyan-700 text-white animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <span className="icon-tile h-9 w-9 bg-white/15 ring-1 ring-white/20 mb-3">
              <IconClock className="h-4.5 w-4.5" />
            </span>
            <p className="font-medium text-sm">Próximo mantenimiento</p>
            <p className="text-blue-100/80 text-xs mt-1 leading-relaxed">
              Consulta o programa el siguiente plan para este equipo desde la sección de mantenimientos.
            </p>
            <Link href="/mantenimientos" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 transition-colors px-3 py-2 rounded-lg">
              Ir a mantenimientos →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dato({ icon: Icon, etiqueta, valor }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{etiqueta}</p>
        <p className="text-sm text-slate-900 dark:text-slate-100 mt-0.5 truncate">{valor}</p>
      </div>
    </div>
  )
}
