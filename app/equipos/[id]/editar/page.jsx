'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconBox, IconTag, IconShieldCheck, IconFileText, IconAlertTriangle } from '../../../components/Icons'

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
          proveedor: data.proveedor || '',
          garantia_hasta: data.garantia_hasta || '',
          costo_compra: data.costo_compra ?? '',
          notas: data.notas || '',
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
      const { error } = await supabase.from('equipos').update(datos).eq('id', id)
      if (error) throw error
      router.push(`/equipos/${id}`)
    } catch (e) {
      setError('No se pudo guardar: ' + e.message)
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-400 text-sm">
          <span className="h-4 w-4 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
          Cargando equipo...
        </div>
      </div>
    )
  }
  if (!form) return <p className="p-8 text-slate-400 text-sm">Equipo no encontrado</p>

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 w-full">
      <Link href={`/equipos/${id}`} className="text-sm text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1 group w-fit">
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> Volver a la hoja de vida
      </Link>

      <div className="flex items-center gap-3 mt-4 mb-6 animate-fade-up">
        <span className="icon-tile h-11 w-11 bg-brand-gradient text-white shadow-elevate shrink-0">
          <IconBox className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Editar equipo</h1>
          <p className="text-sm text-slate-500 mt-0.5">Actualiza la información de {form.nombre || 'este equipo'}.</p>
        </div>
      </div>

      {error && (
        <p className="mb-5 text-rose-600 text-sm bg-rose-50 px-4 py-3 rounded-xl animate-fade-in flex items-center gap-2 ring-1 ring-inset ring-rose-600/10">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <section className="card p-6 sm:p-7 animate-fade-up">
          <div className="flex items-center gap-2 mb-5">
            <IconTag className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-900">Información general</h2>
          </div>
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
          </div>
        </section>

        <section className="card p-6 sm:p-7 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 mb-5">
            <IconShieldCheck className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-900">Compra y garantía</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo tipo="date" etiqueta="Fecha de compra" valor={form.fecha_compra} onChange={(v) => actualizar('fecha_compra', v)} />
            <Campo etiqueta="Proveedor" valor={form.proveedor} onChange={(v) => actualizar('proveedor', v)} />
            <Campo tipo="date" etiqueta="Garantía hasta" valor={form.garantia_hasta} onChange={(v) => actualizar('garantia_hasta', v)} />
            <Campo tipo="number" etiqueta="Costo de compra" valor={form.costo_compra} onChange={(v) => actualizar('costo_compra', v)} />
          </div>
        </section>

        <section className="card p-6 sm:p-7 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-5">
            <IconFileText className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-900">Notas</h2>
          </div>
          <textarea
            value={form.notas}
            onChange={(e) => actualizar('notas', e.target.value)}
            className="input-field"
            rows={4}
          />
        </section>

        <div className="flex justify-end">
          <button onClick={guardar} disabled={guardando} className="btn btn-primary btn-md">
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Campo({ etiqueta, valor, onChange, tipo = 'text', children }) {
  return (
    <div>
      <label className="label-field">{etiqueta}</label>
      {tipo === 'select' ? (
        <select value={valor} onChange={(e) => onChange(e.target.value)} className="input-field">
          {children}
        </select>
      ) : (
        <input
          type={tipo}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )}
    </div>
  )
}
