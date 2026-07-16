'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'

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

  if (cargando) return <p className="p-8 text-gray-500">Cargando equipo...</p>
  if (!equipo) return <p className="p-8 text-gray-500">Equipo no encontrado</p>

  const estadoColor =
    equipo.estado === 'operativo'
      ? 'bg-green-100 text-green-700'
      : equipo.estado === 'mantenimiento'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700'

  const urlEquipo =
    typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/equipos" className="text-blue-600 hover:underline text-sm">
          ← Volver a equipos
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{equipo.nombre}</h1>
              <p className="text-gray-500 mt-1">Hoja de vida del equipo</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoColor}`}>
              {equipo.estado}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Notas</p>
              <p className="text-base text-gray-900 whitespace-pre-wrap">{equipo.notas}</p>
            </div>
          )}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">
              Historial de mantenimientos ({historial.length})
            </p>
            {historial.length === 0 ? (
              <p className="text-gray-500 text-sm">Este equipo no tiene mantenimientos registrados.</p>
            ) : (
              <div className="space-y-3">
                {historial.map(h => (
                  <div key={h.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{h.tipo}</p>
                      {h.tecnico && <p className="text-sm text-gray-500">Técnico: {h.tecnico}</p>}
                      {h.descripcion && <p className="text-sm text-gray-500">{h.descripcion}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {new Date(h.fecha).toLocaleDateString('es-CO')}
                      </span>
                      {h.costo && <p className="text-green-600 font-medium mt-1 text-sm">${h.costo}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">
              Código QR del equipo
            </p>
            <QRCodeCanvas value={urlEquipo} size={160} />
            <p className="text-xs text-gray-400 mt-3">
              Escanea para abrir esta hoja de vida
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center gap-3">
            <Link
              href={`/equipos/${id}/editar`}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Editar equipo
            </Link>
            <button
              onClick={eliminar}
              disabled={eliminando}
              className="bg-red-50 text-red-600 px-5 py-2 rounded-lg hover:bg-red-100 disabled:opacity-50"
            >
              {eliminando ? 'Eliminando...' : 'Eliminar equipo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{etiqueta}</p>
      <p className="text-base text-gray-900 mt-1">{valor}</p>
    </div>
  )
}