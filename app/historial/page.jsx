'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Historial de mantenimientos</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg">
          + Registrar mantenimiento
        </button>
      </div>
      {mostrarForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="font-bold text-lg mb-4">Nuevo registro</h2>
          {error && (
            <p className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <select value={form.equipo_id}
              onChange={e => setForm({...form, equipo_id: e.target.value})}
              className="border p-2 rounded">
              <option value="">Seleccionar equipo</option>
              {equipos.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
            <input placeholder="Tipo de mantenimiento"
              value={form.tipo}
              onChange={e => setForm({...form, tipo: e.target.value})}
              className="border p-2 rounded" />
            <input placeholder="Técnico responsable"
              value={form.tecnico}
              onChange={e => setForm({...form, tecnico: e.target.value})}
              className="border p-2 rounded" />
            <input type="date" value={form.fecha}
              onChange={e => setForm({...form, fecha: e.target.value})}
              className="border p-2 rounded" />
            <input placeholder="Costo (opcional)"
              value={form.costo}
              onChange={e => setForm({...form, costo: e.target.value})}
              className="border p-2 rounded" />
            <input placeholder="Descripción"
              value={form.descripcion}
              onChange={e => setForm({...form, descripcion: e.target.value})}
              className="border p-2 rounded" />
          </div>
          <button onClick={guardar}
            disabled={guardando}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Guardar registro'}
          </button>
        </div>
      )}
      {historial.length === 0 ? (
        <p className="text-gray-500">No hay registros de mantenimiento aún.</p>
      ) : (
        <div className="grid gap-4">
          {historial.map(h => (
            <div key={h.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-lg">{h.equipos?.nombre}</h2>
                  <p className="text-gray-600">{h.tipo}</p>
                  <p className="text-gray-500 text-sm">Técnico: {h.tecnico}</p>
                  <p className="text-gray-500 text-sm">{h.descripcion}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {new Date(h.fecha).toLocaleDateString('es-CO')}
                  </span>
                  {h.costo && (
                    <p className="text-green-600 font-medium mt-1">${h.costo}</p>
                  )}
                  <button onClick={() => eliminar(h.id)}
                    className="block mt-2 text-red-600 text-sm">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6">
        <a href="/" className="text-blue-700">← Volver al dashboard</a>
      </div>
    </main>
  )
}