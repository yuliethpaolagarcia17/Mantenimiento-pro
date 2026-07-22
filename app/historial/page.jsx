'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { TIPOS_MANTENIMIENTO } from '@/lib/constantes'
import { IconPlus, IconInbox, IconX, IconAlertTriangle } from '../components/Icons'
import HistorialItem from '../components/HistorialItem'

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
      .select('*, equipos(nombre, ubicacion)')
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

  const tecnicos = useMemo(() => {
    const nombres = [
      ...historial.map(h => h.tecnico),
      ...equipos.map(e => e.responsable),
    ].filter(Boolean)
    return [...new Set(nombres)].sort()
  }, [historial, equipos])

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
              <label className="label-field">Equipo (¿dónde?)</label>
              <select value={form.equipo_id}
                onChange={e => setForm({...form, equipo_id: e.target.value})}
                className="input-field">
                <option value="">Seleccionar equipo</option>
                {equipos.map(e => (
                  <option key={e.id} value={e.id}>{e.categoria ? `[${e.categoria}] ` : ''}{e.nombre}{e.ubicacion ? ` — ${e.ubicacion}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Tipo de mantenimiento (¿qué?)</label>
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="input-field">
                <option value="">Seleccionar tipo</option>
                {TIPOS_MANTENIMIENTO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Técnico responsable (¿quién?)</label>
              <input value={form.tecnico}
                onChange={e => setForm({...form, tecnico: e.target.value})}
                className="input-field" list="tecnicos-historial" placeholder="Selecciona o escribe uno nuevo" />
              <datalist id="tecnicos-historial">
                {tecnicos.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <label className="label-field">Fecha (¿cuándo?)</label>
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
                className="input-field" placeholder="Detalle de lo realizado" />
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
            <div key={h.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}>
              <HistorialItem registro={h} mostrarEquipo onEliminar={eliminar} />
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
