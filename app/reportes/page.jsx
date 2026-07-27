'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { IconLogoMark, IconFileText } from '../components/Icons'

const ESTADO_LABEL = {
  operativo: 'Operativo',
  mantenimiento: 'En mantenimiento',
  'fuera de servicio': 'Fuera de servicio',
  retirado: 'Retirado',
}

export default function Reportes() {
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [generadoPor, setGeneradoPor] = useState('')

  useEffect(() => {
    async function verificarSesion() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          window.location.replace('/login')
          return
        }
        setGeneradoPor(session.user?.email || '')
        const { data, error } = await supabase.from('equipos').select('*').order('nombre', { ascending: true })
        if (error) throw error
        setEquipos(data || [])
      } catch (e) {
        console.error('Error cargando el reporte:', e)
      } finally {
        setCargando(false)
      }
    }
    verificarSesion()
  }, [])

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-2.5 text-slate-400 text-sm">
          <span className="h-4 w-4 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
          Generando reporte...
        </div>
      </div>
    )
  }

  const total = equipos.length
  const operativos = equipos.filter(e => e.estado === 'operativo').length
  const mantenimiento = equipos.filter(e => e.estado === 'mantenimiento').length
  const fuera = equipos.filter(e => e.estado === 'fuera de servicio').length
  const fechaGenerado = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 backdrop-blur-sm px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> Volver al dashboard
        </Link>
        <button onClick={() => window.print()} className="btn btn-primary btn-md">
          <IconFileText className="h-4 w-4" />
          Imprimir / Guardar como PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 print:px-0 print:py-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-brand-gradient h-10 w-10 rounded-xl text-white flex items-center justify-center shrink-0">
            <IconLogoMark className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>MantenPro</h1>
            <p className="text-xs text-slate-400">Reporte de equipos</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-8">
          Generado el {fechaGenerado}{generadoPor ? ` por ${generadoPor}` : ''}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 print:gap-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-semibold tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>{total}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total equipos</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-semibold tabular-nums text-emerald-600" style={{ fontFamily: 'var(--font-display)' }}>{operativos}</div>
            <div className="text-xs text-slate-500 mt-0.5">Operativos</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-semibold tabular-nums text-amber-600" style={{ fontFamily: 'var(--font-display)' }}>{mantenimiento}</div>
            <div className="text-xs text-slate-500 mt-0.5">En mantenimiento</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-semibold tabular-nums text-rose-600" style={{ fontFamily: 'var(--font-display)' }}>{fuera}</div>
            <div className="text-xs text-slate-500 mt-0.5">Fuera de servicio</div>
          </div>
        </div>

        {total === 0 ? (
          <p className="text-sm text-slate-400">No hay equipos registrados todavía.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="text-left font-semibold py-2 pr-3">Equipo</th>
                <th className="text-left font-semibold py-2 pr-3">Marca / Modelo</th>
                <th className="text-left font-semibold py-2 pr-3">Ubicación</th>
                <th className="text-left font-semibold py-2 pr-3">Responsable</th>
                <th className="text-left font-semibold py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map(e => (
                <tr key={e.id} className="border-b border-slate-200 break-inside-avoid">
                  <td className="py-2 pr-3">
                    <span className="font-medium text-slate-900">{e.nombre}</span>
                    {e.categoria && <span className="block text-xs text-slate-400">{e.categoria}</span>}
                  </td>
                  <td className="py-2 pr-3 text-slate-600">{[e.marca, e.modelo].filter(Boolean).join(' ') || '—'}</td>
                  <td className="py-2 pr-3 text-slate-600">{e.ubicacion || '—'}</td>
                  <td className="py-2 pr-3 text-slate-600">{e.responsable || '—'}</td>
                  <td className="py-2 text-slate-600">{ESTADO_LABEL[e.estado] || e.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mt-10 text-xs text-slate-300 print:hidden">MantenPro — Plataforma de mantenimiento preventivo</p>
      </div>
    </main>
  )
}
