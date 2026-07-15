'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditarEquipo({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [form, setForm] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase
          .from('equipos')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        setForm({
          nombre: data.nombre || '',
          marca: data.marca || '',
          modelo: data.modelo || '',
          serial: data.serial || '',
          ubicacion: data.ubicacion || '',
          responsable: data.responsable || '',
          estado: data.estado || 'operativo',
          fecha_compra: data.fecha_compra || '',
        })
      } catch (e) {
        console.error('Error cargando equipo:', e)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  function actualizar(campo, valor) {
    setForm({ ...form, [campo]: valor })
  }

  async function guardar() {
    setGuardando(true)
    setError('')
    try {
      const datos = { ...form }
      if (!datos.fecha_compra) datos.fecha_compra = null
      const { error } = await supabase.from('equipos').update(datos).eq('id', id)
      if (error) throw error
      router.push(`/equipos/${id}`)
    } catch (e) {
      setError('No se pudo guardar: ' + e.message)
      setGuardando(false)
    }
  }

  if (cargando) return <p className="p-8 text-gray-500">Cargando equipo...</p>
  if (!form) return <p className="p-8 text-gray-500">Equipo no encontrado</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/equipos/${id}`} className="text-blue-600 hover:underline text-sm">
          ← Volver a la hoja de vida
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar equipo</h1>
          {error && (
            <p className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo etiqueta="Nombre" valor={form.nombre} onChange={(v) => actualizar('nombre', v)} />
            <Campo etiqueta="Marca" valor={form.marca} onChange={(v) => actualizar('marca', v)} />
            <Campo etiqueta="Modelo" valor={form.modelo} onChange={(v) => actualizar('modelo', v)} />
            <Campo etiqueta="Serial" valor={form.serial} onChange={(v) => actualizar('serial', v)} />
            <Campo etiqueta="Ubicación" valor={form.ubicacion} onChange={(v) => actualizar('ubicacion', v)} />
            <Campo etiqueta="Responsable" valor={form.responsable} onChange={(v) => actualizar('responsable', v)} />
            <div>
              <label className="text-xs uppercase tracking-wide text-gray-400">Estado</label>
              <select
                value={form.estado}
                onChange={(e) => actualizar('estado', e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="operativo">Operativo</option>
                <option value="mantenimiento">En mantenimiento</option>
                <option value="fuera de servicio">Fuera de servicio</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-gray-400">Fecha de compra</label>
              <input
                type="date"
                value={form.fecha_compra}
                onChange={(e) => actualizar('fecha_compra', e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <button
            onClick={guardar}
            disabled={guardando}
            className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Campo({ etiqueta, valor, onChange }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-gray-400">{etiqueta}</label>
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2"
      />
    </div>
  )
}
