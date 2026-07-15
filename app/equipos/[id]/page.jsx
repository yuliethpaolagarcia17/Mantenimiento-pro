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
    cargar()
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
