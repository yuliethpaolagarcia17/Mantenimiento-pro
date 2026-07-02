'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { QRCodeSVG as QRCode } from 'qrcode.react'

export default function Equipos() {
  const [equipos, setEquipos] = useState([])
  const [form, setForm] = useState({
    nombre: '', marca: '', modelo: '',
    serial: '', ubicacion: '', responsable: '', estado: 'operativo'
  })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [qrEquipo, setQrEquipo] = useState(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await supabase.from('equipos').select('*')
    setEquipos(data || [])
  }

  async function guardar() {
    await supabase.from('equipos').insert([form])
    setForm({ nombre: '', marca: '', modelo: '', serial: '', ubicacion: '', responsable: '', estado: 'operativo' })
    setMostrarForm(false)
    cargar()
  }

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Equipos registrados</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg">
          + Agregar equipo
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="font-bold text-lg mb-4">Nuevo equipo</h2>
          <div className="grid grid-cols-2 gap-4">
            {['nombre','marca','modelo','serial','ubicacion','responsable'].map(campo => (
              <input key={campo} placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                value={form[campo]}
                onChange={e => setForm({...form, [campo]: e.target.value})}
                className="border p-2 rounded" />
            ))}
            <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}
              className="border p-2 rounded">
              <option value="operativo">Operativo</option>
              <option value="mantenimiento">En mantenimiento</option>
              <option value="fuera de servicio">Fuera de servicio</option>
            </select>
          </div>
          <button onClick={guardar}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg">
            Guardar equipo
          </button>
        </div>
      )}

      {qrEquipo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="font-bold text-xl mb-4">{qrEquipo.nombre}</h2>
            <QRCode value={`localhost:3000/equipos/${qrEquipo.id}`} size={200} />
            <p className="text-gray-500 mt-2">{qrEquipo.ubicacion}</p>
            <button onClick={() => setQrEquipo(null)}
              className="mt-4 bg-gray-200 px-4 py-2 rounded">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {equipos.length === 0 ? (
        <p className="text-gray-500">No hay equipos registrados aún.</p>
      ) : (
        <div className="grid gap-4">
          {equipos.map(e => (
            <div key={e.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">{e.nombre}</h2>
                <p className="text-gray-500">{e.ubicacion}</p>
                <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">{e.estado}</span>
              </div>
              <button onClick={() => setQrEquipo(e)}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
                Ver QR
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}