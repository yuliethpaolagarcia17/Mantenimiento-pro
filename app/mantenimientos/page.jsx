'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
    if (diff < 0) return 'bg-red-100 text-red-700'
    if (diff < 7) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Plan de mantenimiento</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="bg-blue-700 text-white px-4 py-2 rounded-lg">
          + Agregar plan
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="font-bold text-lg mb-4">Nuevo plan de mantenimiento</h2>
          {error && (
            <p className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <select value={form.equipo_id} onChange={e => setForm({...form, equipo_id: e.target.value})} className="border p-2 rounded">
              <option value="">Seleccionar equipo</option>
              {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
            <input placeholder="Tipo de mantenimiento" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="border p-2 rounded" />
            <select value={form.frecuencia} onChange={e => setForm({...form, frecuencia: e.target.value})} className="border p-2 rounded">
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
            <input type="date" value={form.proxima_fecha} onChange={e => setForm({...form, proxima_fecha: e.target.value})} className="border p-2 rounded" />
            <input placeholder="Técnico responsable" value={form.tecnico} onChange={e => setForm({...form, tecnico: e.target.value})} className="border p-2 rounded" />
            <input placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="border p-2 rounded" />
          </div>
          <button onClick={guardar}
            disabled={guardando}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Guardar plan'}
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {planes.length === 0 ? (
          <p className="text-gray-500">No hay planes de mantenimiento aún.</p>
        ) : (
          planes.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg">{p.equipos?.nombre}</h2>
                  <p className="text-gray-500">{p.tipo} · {p.frecuencia}</p>
                  <p className="text-gray-500 text-sm">Técnico: {p.tecnico}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${colorFecha(p.proxima_fecha)}`}>
                    {new Date(p.proxima_fecha).toLocaleDateString('es-CO')}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => completar(p)} className="bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">
                      Completar
                    </button>
                    <button onClick={() => eliminar(p.id)} className="text-red-600 text-sm">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-6"><a href="/" className="text-blue-700">← Volver al dashboard</a></div>
    </main>
  )
}
