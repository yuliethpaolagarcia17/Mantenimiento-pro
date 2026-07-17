'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { IconPlus, IconInbox, IconWrench } from '../components/Icons'

const DIAS_POR_FRECUENCIA = {
  diario: 1,
  semanal: 7,
  mensual: 30,
  trimestral: 90,
  semestral: 180,
  anual: 365,
}

export default function Mantenimientos() {
  const [equipos, setEquipos] = useState([])
  const [planes, setPlanes] = useState([])
  const [form, setForm] = useState({ equipo_id: '', tipo: '', frecuencia: 'mensual', proxima_fecha: '', tecnico: '', descripcion: '' })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarEquipos()
    cargarPlanes()
  }, [])

  async function cargarEquipos() {
    const { data, error } = await supabase.from('equipos').select('*')
    if (error) console.error('Error cargando equipos:', error)
    setEquipos(data || [])
  }

  async function cargarPlanes() {
    const { data, error } = await supabase
      .from('planes_mantenimiento')
      .select('*, equipos(nombre)')
      .order('proxima_fecha', { ascending: true })
    if (error) console.error('Error cargando planes:', error)
    setPlanes(data || [])
  }

  async function guardar() {
    if (!form.equipo_id || !form.tipo || !form.proxima_fecha) {
      setError('Selecciona un equipo, el tipo y la próxima fecha antes de guardar.')
      return
    }
    setGuardando(true)
    setError('')
    const { error } = await supabase.from('planes_mantenimiento').insert([form])
    if (error) {
      setError('No se pudo guardar: ' + error.message)
      setGuardando(false)
      return
    }
    setForm({ equipo_id: '', tipo: '', frecuencia: 'mensual', proxima_fecha: '', tecnico: '', descripcion: '' })
    setMostrarForm(false)
    setGuardando(false)
    cargarPlanes()
  }

  async function completar(plan) {
    const hoy = new Date().toISOString().split('T')[0]
    const { error: errorHistorial } = await supabase.from('historial_mantenimientos').insert([{
      equipo_id: plan.equipo_id,
      tipo: plan.tipo,
      descripcion: 'Mantenimiento programado completado',
      tecnico: plan.tecnico || '',
      fecha: hoy
    }])
    if (errorHistorial) {
      alert('No se pudo registrar el mantenimiento: ' + errorHistorial.message)
      return
    }

    const dias = DIAS_POR_FRECUENCIA[plan.frecuencia]
    if (dias) {
      const siguiente = new Date()
      siguiente.setDate(siguiente.getDate() + dias)
      const { error } = await supabase.from('planes_mantenimiento')
        .update({ proxima_fecha: siguiente.toISOString().split('T')[0] })
        .eq('id', plan.id)
      if (error) {
        alert('El mantenimiento quedó registrado, pero no se pudo reprogramar el plan: ' + error.message)
        return
      }
    } else {
      const { error } = await supabase.from('planes_mantenimiento').delete().eq('id', plan.id)
      if (error) {
        alert('El mantenimiento quedó registrado, pero no se pudo cerrar el plan: ' + error.message)
        return
      }
    }
    cargarPlanes()
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este plan de mantenimiento?')) return
    const { error } = await supabase.from('planes_mantenimiento').delete().eq('id', id)
    if (error) {
      alert('No se pudo eliminar: ' + error.message)
      return
    }
    cargarPlanes()
  }

  function colorFecha(fecha) {
    const diff = (new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return 'bg-red-50 text-red-700'
    if (diff < 7) return 'bg-amber-50 text-amber-700'
    return 'bg-emerald-50 text-emerald-700'
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  const labelClass = "text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5 block"

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Plan de mantenimiento</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all">
          <IconPlus className={`h-4 w-4 transition-transform duration-200 ${mostrarForm ? 'rotate-45' : ''}`} />
          {mostrarForm ? 'Cerrar' : 'Agregar plan'}
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 animate-fade-up">
          <h2 className="font-semibold text-gray-900 mb-4">Nuevo plan</h2>
          {error && (
            <p className="mb-4 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg animate-fade-in">{error}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Equipo</label>
              <select value={form.equipo_id} onChange={e => setForm({...form, equipo_id: e.target.value})} className={inputClass}>
                <option value="">Seleccionar equipo</option>
                {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tipo de mantenimiento</label>
              <input value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Frecuencia</label>
              <select value={form.frecuencia} onChange={e => setForm({...form, frecuencia: e.target.value})} className={inputClass}>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Próxima fecha</label>
              <input type="date" value={form.proxima_fecha} onChange={e => setForm({...form, proxima_fecha: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Técnico responsable</label>
              <input value={form.tecnico} onChange={e => setForm({...form, tecnico: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <input value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className={inputClass} />
            </div>
          </div>
          <button onClick={guardar}
            disabled={guardando}
            className="mt-5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all disabled:opacity-60">
            {guardando ? 'Guardando...' : 'Guardar plan'}
          </button>
        </div>
      )}

      {planes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="h-12 w-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
            <IconInbox className="h-6 w-6" />
          </span>
          <p className="text-gray-500 text-sm">No hay planes de mantenimiento aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {planes.map((p, i) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <IconWrench className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-medium text-gray-900">{p.equipos?.nombre}</h2>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="text-gray-500 text-sm">{p.tipo}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500 font-medium">{p.frecuencia}</span>
                    </div>
                    {p.tecnico && <p className="text-gray-500 text-sm mt-1">Técnico: {p.tecnico}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colorFecha(p.proxima_fecha)}`}>
                    {new Date(p.proxima_fecha).toLocaleDateString('es-CO')}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => completar(p)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                      Completar
                    </button>
                    <button onClick={() => eliminar(p.id)} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 font-medium">← Volver al dashboard</Link>
      </div>
    </main>
  )
}
