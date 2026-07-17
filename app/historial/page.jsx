'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconPlus, IconInbox, IconClock } from '../components/Icons'

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

  const inputClass = "w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  const labelClass = "text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5 block"

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Historial de mantenimientos</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all">
          <IconPlus className={`h-4 w-4 transition-transform duration-200 ${mostrarForm ? 'rotate-45' : ''}`} />
          {mostrarForm ? 'Cerrar' : 'Registrar mantenimiento'}
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 animate-fade-up">
          <h2 className="font-semibold text-gray-900 mb-4">Nuevo registro</h2>
          {error && (
            <p className="mb-4 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg animate-fade-in">{error}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Equipo</label>
              <select value={form.equipo_id}
                onChange={e => setForm({...form, equipo_id: e.target.value})}
                className={inputClass}>
                <option value="">Seleccionar equipo</option>
                {equipos.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tipo de mantenimiento</label>
              <input value={form.tipo}
                onChange={e => setForm({...form, tipo: e.target.value})}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Técnico responsable</label>
              <input value={form.tecnico}
                onChange={e => setForm({...form, tecnico: e.target.value})}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={form.fecha}
                onChange={e => setForm({...form, fecha: e.target.value})}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Costo (opcional)</label>
              <input value={form.costo}
                onChange={e => setForm({...form, costo: e.target.value})}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <input value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                className={inputClass} />
            </div>
          </div>
          <button onClick={guardar}
            disabled={guardando}
            className="mt-5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all disabled:opacity-60">
            {guardando ? 'Guardando...' : 'Guardar registro'}
          </button>
        </div>
      )}

      {historial.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="h-12 w-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
            <IconInbox className="h-6 w-6" />
          </span>
          <p className="text-gray-500 text-sm">No hay registros de mantenimiento aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historial.map((h, i) => (
            <div
              key={h.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <IconClock className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-medium text-gray-900">{h.equipos?.nombre}</h2>
                    <p className="text-gray-600 text-sm mt-0.5">{h.tipo}</p>
                    {h.tecnico && <p className="text-gray-500 text-sm">Técnico: {h.tecnico}</p>}
                    {h.descripcion && <p className="text-gray-500 text-sm">{h.descripcion}</p>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                    {new Date(h.fecha).toLocaleDateString('es-CO')}
                  </span>
                  {h.costo && (
                    <p className="text-emerald-600 font-medium mt-1 text-sm">${h.costo}</p>
                  )}
                  <button onClick={() => eliminar(h.id)}
                    className="block mt-2 text-red-600 text-xs font-medium hover:underline">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900 font-medium">← Volver al dashboard</a>
      </div>
    </main>
  )
}
