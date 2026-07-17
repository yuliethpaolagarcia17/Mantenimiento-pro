'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { IconPlus, IconInbox, IconClock, IconX, IconAlertTriangle, IconTrash } from '../components/Icons'

export default function Historial() {
  const [equipos, setEquipos] = useState([])
  const [historial, setHistorial] = useState([])
  const [form, setForm] = useState({
    equipo_id: '', tipo: '', descripcion: '',
    tecnico: '', fecha: '', costo: ''
  })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarEquipos()
    cargarHistorial()
  }, [])

  async function cargarEquipos() {
    const { data, error } = await supabase.from('equipos').select('*')
    if (error) console.error('Error cargando equipos:', error)
    setEquipos(data || [])
  }

  async function cargarHistorial() {
    const { data, error } = await supabase
      .from('historial_mantenimientos')
      .select('*, equipos(nombre)')
      .order('fecha', { ascending: false })
    if (error) console.error('Error cargando historial:', error)
    setHistorial(data || [])
  }

  async function guardar() {
    if (!form.equipo_id || !form.tipo || !form.fecha) {
      setError('Selecciona un equipo, el tipo y la fecha antes de guardar.')
      return
    }
    setGuardando(true)
    setError('')
    const { error } = await supabase.from('historial_mantenimientos').insert([form])
    if (error) {
      setError('No se pudo guardar: ' + error.message)
      setGuardando(false)
      return
    }
    setForm({ equipo_id: '', tipo: '', descripcion: '', tecnico: '', fecha: '', costo: '' })
    setMostrarForm(false)
    setGuardando(false)
    cargarHistorial()
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este registro del historial?')) return
    const { error } = await supabase.from('historial_mantenimientos').delete().eq('id', id)
    if (error) {
      alert('No se pudo eliminar: ' + error.message)
      return
    }
    cargarHistorial()
  }

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8 w-full">
      <div className="flex justify-between items-center mb-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Historial de mantenimientos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{historial.length} {historial.length === 1 ? 'registro' : 'registros'}</p>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="btn btn-primary btn-md">
          {mostrarForm ? <IconX className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
          {mostrarForm ? 'Cerrar' : 'Registrar mantenimiento'}
        </button>
      </div>

      {mostrarForm && (
        <div className="card p-6 sm:p-7 mb-6 animate-fade-up">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Nuevo registro</h2>
          {error && (
            <p className="mb-4 text-rose-600 text-sm bg-rose-50 px-4 py-3 rounded-xl animate-fade-in flex items-center gap-2 ring-1 ring-inset ring-rose-600/10">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Equipo</label>
              <select value={form.equipo_id}
                onChange={e => setForm({...form, equipo_id: e.target.value})}
                className="input-field">
                <option value="">Seleccionar equipo</option>
                {equipos.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Tipo de mantenimiento</label>
              <input value={form.tipo}
                onChange={e => setForm({...form, tipo: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">Técnico responsable</label>
              <input value={form.tecnico}
                onChange={e => setForm({...form, tecnico: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">Fecha</label>
              <input type="date" value={form.fecha}
                onChange={e => setForm({...form, fecha: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">Costo (opcional)</label>
              <input value={form.costo}
                onChange={e => setForm({...form, costo: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">Descripción</label>
              <input value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                className="input-field" />
            </div>
          </div>
          <button onClick={guardar} disabled={guardando} className="btn btn-primary btn-md mt-5">
            {guardando ? 'Guardando...' : 'Guardar registro'}
          </button>
        </div>
      )}

      {historial.length === 0 ? (
        <div className="card border-dashed p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="icon-tile h-12 w-12 rounded-full bg-slate-100 text-slate-400 mb-3">
            <IconInbox className="h-6 w-6" />
          </span>
          <p className="text-slate-500 text-sm">No hay registros de mantenimiento aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historial.map((h, i) => (
            <div
              key={h.id}
              className="card card-hover p-5 animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="icon-tile h-10 w-10 bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                    <IconClock className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-medium text-slate-900">{h.equipos?.nombre}</h2>
                    <p className="text-slate-600 text-sm mt-0.5">{h.tipo}</p>
                    {h.tecnico && <p className="text-slate-500 text-sm">Técnico: {h.tecnico}</p>}
                    {h.descripcion && <p className="text-slate-500 text-sm">{h.descripcion}</p>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="badge-indigo">
                    {new Date(h.fecha).toLocaleDateString('es-CO')}
                  </span>
                  {h.costo && (
                    <p className="text-emerald-600 font-medium mt-1 text-sm">${h.costo}</p>
                  )}
                  <button onClick={() => eliminar(h.id)}
                    className="flex items-center gap-1 mt-2 text-rose-600 text-xs font-medium hover:underline ml-auto">
                    <IconTrash className="h-3 w-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1 group">
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> Volver al dashboard
        </Link>
      </div>
    </main>
  )
}
