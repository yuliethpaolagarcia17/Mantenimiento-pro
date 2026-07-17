'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconBox } from '../../components/Icons'

export default function NuevoEquipo() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: '',
    marca: '',
    modelo: '',
    serial: '',
    ubicacion: '',
    responsable: '',
    estado: 'operativo',
    fecha_compra: '',
    proveedor: '',
    garantia_hasta: '',
    costo_compra: '',
    notas: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function actualizar(campo, valor) {
    setForm({ ...form, [campo]: valor })
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      setError('El nombre del equipo es obligatorio.')
      return
    }
    setGuardando(true)
    setError('')
    try {
      const datos = { ...form }
      if (!datos.fecha_compra) datos.fecha_compra = null
      if (!datos.garantia_hasta) datos.garantia_hasta = null
      datos.costo_compra = datos.costo_compra ? Number(datos.costo_compra) : null
      const { error } = await supabase.from('equipos').insert([datos])
      if (error) throw error
      router.push('/equipos')
    } catch (e) {
      setError('No se pudo guardar: ' + e.message)
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <Link href="/equipos" className="text-sm text-gray-500 hover:text-gray-900 font-medium inline-flex items-center gap-1 group w-fit">
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> Volver a equipos
      </Link>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mt-4 p-6 sm:p-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <IconBox className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-semibold text-gray-900">Agregar equipo</h1>
        </div>
        {error && (
          <p className="mb-5 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg animate-fade-in">{error}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo etiqueta="Nombre" valor={form.nombre} onChange={(v) => actualizar('nombre', v)} />
          <Campo etiqueta="Marca" valor={form.marca} onChange={(v) => actualizar('marca', v)} />
          <Campo etiqueta="Modelo" valor={form.modelo} onChange={(v) => actualizar('modelo', v)} />
          <Campo etiqueta="Serial" valor={form.serial} onChange={(v) => actualizar('serial', v)} />
          <Campo etiqueta="Ubicación" valor={form.ubicacion} onChange={(v) => actualizar('ubicacion', v)} />
          <Campo etiqueta="Responsable" valor={form.responsable} onChange={(v) => actualizar('responsable', v)} />
          <Campo tipo="select" etiqueta="Estado" valor={form.estado} onChange={(v) => actualizar('estado', v)}>
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">En mantenimiento</option>
            <option value="fuera de servicio">Fuera de servicio</option>
          </Campo>
          <Campo tipo="date" etiqueta="Fecha de compra" valor={form.fecha_compra} onChange={(v) => actualizar('fecha_compra', v)} />
          <Campo etiqueta="Proveedor" valor={form.proveedor} onChange={(v) => actualizar('proveedor', v)} />
          <Campo tipo="date" etiqueta="Garantía hasta" valor={form.garantia_hasta} onChange={(v) => actualizar('garantia_hasta', v)} />
          <Campo tipo="number" etiqueta="Costo de compra" valor={form.costo_compra} onChange={(v) => actualizar('costo_compra', v)} />
          <div className="sm:col-span-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5 block">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => actualizar('notas', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            />
          </div>
        </div>
        <button
          onClick={guardar}
          disabled={guardando}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all disabled:opacity-60"
        >
          {guardando ? 'Guardando...' : 'Guardar equipo'}
        </button>
      </div>
    </div>
  )
}

function Campo({ etiqueta, valor, onChange, tipo = 'text', children }) {
  const inputClass = "w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5 block">{etiqueta}</label>
      {tipo === 'select' ? (
        <select value={valor} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          {children}
        </select>
      ) : (
        <input
          type={tipo}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  )
}