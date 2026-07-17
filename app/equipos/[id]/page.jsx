'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { IconWrench } from '../../components/Icons'

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

  if (cargando) return <p className="p-8 text-gray-400 text-sm">Cargando equipo...</p>
  if (!equipo) return <p className="p-8 text-gray-400 text-sm">Equipo no encontrado</p>

  const estadoColor =
    equipo.estado === 'operativo'
      ? 'bg-emerald-50 text-emerald-700'
      : equipo.estado === 'mantenimiento'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-red-50 text-red-700'

  const estadoDot =
    equipo.estado === 'operativo'
      ? 'bg-emerald-500'
      : equipo.estado === 'mantenimiento'
      ? 'bg-amber-500'
      : 'bg-red-500'

  const urlEquipo =
    typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <Link href="/equipos" className="text-sm text-gray-500 hover:text-gray-900 font-medium inline-flex items-center gap-1 group w-fit">
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> Volver a equipos
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mt-4 p-6 sm:p-8 animate-fade-up">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{equipo.nombre}</h1>
            <p className="text-gray-500 mt-1 text-sm">Hoja de vida del equipo</p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${estadoColor}`}>
            <span className={`h-2 w-2 rounded-full ${estadoDot}`} />
            {equipo.estado}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <Dato etiqueta="Marca" valor={equipo.marca} />
          <Dato etiqueta="Modelo" valor={equipo.modelo} />
          <Dato etiqueta="Serial" valor={equipo.serial} />
          <Dato etiqueta="Ubicación" valor={equipo.ubicacion} />
          <Dato etiqueta="Responsable" valor={equipo.responsable} />
          <Dato etiqueta="Fecha de compra" valor={equipo.fecha_compra || 'No registrada'} />
          <Dato etiqueta="Proveedor" valor={equipo.proveedor || 'No registrado'} />
          <Dato etiqueta="Garantía hasta" valor={equipo.garantia_hasta || 'No registrada'} />
          <Dato etiqueta="Costo de compra" valor={equipo.costo_compra ? `$${equipo.costo_compra}` : 'No registrado'} />
        </div>

        {equipo.notas && (
          <div className="mt-7 pt-6 border-t border-gray-100">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">Notas</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{equipo.notas}</p>
          </div>
        )}

        <div className="mt-7 pt-6 border-t border-gray-100">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">
            Historial de mantenimientos ({historial.length})
          </p>
          {historial.length === 0 ? (
            <p className="text-gray-500 text-sm">Este equipo no tiene mantenimientos registrados.</p>
          ) : (
            <div className="space-y-2">
              {historial.map(h => (
                <div key={h.id} className="bg-gray-50 rounded-xl p-4 flex justify-between items-start gap-4 hover:bg-indigo-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{h.tipo}</p>
                    {h.tecnico && <p className="text-sm text-gray-500 mt-0.5">Técnico: {h.tecnico}</p>}
                    {h.descripcion && <p className="text-sm text-gray-500 mt-0.5">{h.descripcion}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                      {new Date(h.fecha).toLocaleDateString('es-CO')}
                    </span>
                    {h.costo && <p className="text-emerald-600 font-medium mt-1 text-sm">${h.costo}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-7 pt-6 border-t border-gray-100">
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="p-3 bg-white border border-gray-200 rounded-xl shrink-0 shadow-sm">
              <QRCodeCanvas value={urlEquipo} size={130} />
            </div>
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5">
                <IconWrench className="h-3.5 w-3.5" />
                Acceso instantáneo con código QR
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Cada equipo tiene un código QR único. Al escanearlo desde el celular, el técnico
                accede de inmediato a esta hoja de vida — sin buscar papeles ni carpetas.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 pt-6 border-t border-gray-100 flex justify-center gap-3">
          <Link
            href={`/equipos/${id}/editar`}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all"
          >
            Editar equipo
          </Link>
          <button
            onClick={eliminar}
            disabled={eliminando}
            className="text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {eliminando ? 'Eliminando...' : 'Eliminar equipo'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{etiqueta}</p>
      <p className="text-sm text-gray-900 mt-1">{valor}</p>
    </div>
  )
}
