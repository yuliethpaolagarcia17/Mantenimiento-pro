'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { QRCodeCanvas } from 'qrcode.react'

export default function HojaVida({ params }) {
  const { id } = use(params)
  const [equipo, setEquipo] = useState(null)
  const [cargando, setCargando] = useState(true)

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

  if (cargando) return <p className="p-8 text-gray-500">Cargando equipo...</p>
  if (!equipo) return <p className="p-8 text-gray-500">Equipo no encontrado</p>

  const estadoColor =
    equipo.estado === 'operativo'
      ? 'bg-green-100 text-green-700'
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
