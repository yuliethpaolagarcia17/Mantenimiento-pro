'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { TIPOS_MANTENIMIENTO, etiquetaEquipo } from '@/lib/constantes'
import { IconPlus, IconInbox, IconWrench, IconX, IconAlertTriangle, IconAlertCircle, IconCalendar, IconMapPin, IconUser, IconArchive, IconRotateCcw } from '../components/Icons'
import { obtenerPerfilActual } from '@/lib/perfil'
import { puedeEditar, puedeAdministrar } from '@/lib/permisos'

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
  const [errores, setErrores] = useState({})
  const [vista, setVista] = useState('activos')
  const [rol, setRol] = useState('')

  useEffect(() => {
    cargarEquipos()
    cargarPlanes()
    async function cargarPerfil() {
      const perfil = await obtenerPerfilActual()
      setRol(perfil?.rol || '')
    }
    cargarPerfil()
  }, [])

  async function cargarEquipos() {
    const { data, error } = await supabase.from('equipos').select('*')
    if (error) console.error('Error cargando equipos:', error)
    setEquipos(data || [])
  }

  async function cargarPlanes() {
    const { data, error } = await supabase
      .from('planes_mantenimiento')
      .select('*, equipos(nombre, ubicacion)')
      .order('proxima_fecha', { ascending: true })
    if (error) console.error('Error cargando planes:', error)
    setPlanes(data || [])
  }

  async function guardar() {
    const nuevosErrores = {
      equipo_id: form.equipo_id ? '' : 'Selecciona un equipo.',
      tipo: form.tipo ? '' : 'Selecciona un tipo.',
      proxima_fecha: form.proxima_fecha ? '' : 'Indica la próxima fecha.',
    }
    if (Object.values(nuevosErrores).some(Boolean)) {
      setErrores(nuevosErrores)
      setError('Completa los campos obligatorios antes de guardar.')
      return
    }
    setErrores({})
    setGuardando(true)
    setError('')
    const { error } = await supabase.from('planes_mantenimiento').insert([{ ...form, estado: 'activo' }])
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
      const { error } = await supabase.from('planes_mantenimiento').update({ estado: 'completado' }).eq('id', plan.id)
      if (error) {
        alert('El mantenimiento quedó registrado, pero no se pudo cerrar el plan: ' + error.message)
        return
      }
    }
    cargarPlanes()
  }

  async function cancelar(id) {
    if (!confirm('¿Cancelar este plan de mantenimiento? Quedará registrado, pero dejará de aparecer como activo.')) return
    const { error } = await supabase.from('planes_mantenimiento').update({ estado: 'cancelado' }).eq('id', id)
    if (error) {
      alert('No se pudo cancelar: ' + error.message)
      return
    }
    cargarPlanes()
  }

  async function reactivar(id) {
    const { error } = await supabase.from('planes_mantenimiento').update({ estado: 'activo' }).eq('id', id)
    if (error) {
      alert('No se pudo reactivar: ' + error.message)
      return
    }
    cargarPlanes()
  }

  function badgeFecha(fecha) {
    const diff = (new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return 'badge-rose'
    if (diff < 7) return 'badge-amber'
    return 'badge-emerald'
  }

  const tecnicos = useMemo(() => {
    const nombres = [
      ...planes.map(p => p.tecnico),
      ...equipos.map(e => e.responsable),
    ].filter(Boolean)
    return [...new Set(nombres)].sort()
  }, [planes, equipos])

  const planesActivos = useMemo(() => planes.filter(p => (p.estado || 'activo') === 'activo'), [planes])
  const planesFinalizados = useMemo(() => planes.filter(p => p.estado === 'cancelado' || p.estado === 'completado'), [planes])
  const planesVisibles = vista === 'activos' ? planesActivos : planesFinalizados

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8 w-full">
      <div className="flex justify-between items-center mb-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>Plan de mantenimiento</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{planesActivos.length} {planesActivos.length === 1 ? 'plan activo' : 'planes activos'}</p>
        </div>
        {puedeEditar(rol) && (
          <button onClick={() => setMostrarForm(!mostrarForm)} className="btn btn-primary btn-md">
            {mostrarForm ? <IconX className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
            {mostrarForm ? 'Cerrar' : 'Agregar plan'}
          </button>
        )}
      </div>

      <div className="flex gap-1.5 mb-6 animate-fade-up">
        <button
          onClick={() => setVista('activos')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${vista === 'activos' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'}`}
        >
          Activos ({planesActivos.length})
        </button>
        <button
          onClick={() => setVista('finalizados')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${vista === 'finalizados' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'}`}
        >
          Finalizados ({planesFinalizados.length})
        </button>
      </div>

      {mostrarForm && (
        <div className="card p-6 sm:p-7 mb-6 animate-fade-up">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Nuevo plan</h2>
          {error && (
            <p className="mb-4 text-rose-600 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-950/40 px-4 py-3 rounded-xl animate-fade-in flex items-center gap-2 ring-1 ring-inset ring-rose-600/10 dark:ring-rose-400/20">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Equipo (¿dónde?)<span className="text-rose-500 ml-0.5">*</span></label>
              <select value={form.equipo_id} onChange={e => { setForm({...form, equipo_id: e.target.value}); setErrores({...errores, equipo_id: ''}) }} className={`input-field ${errores.equipo_id ? 'input-field-error' : ''}`}>
                <option value="">Seleccionar equipo</option>
                {equipos.map(e => <option key={e.id} value={e.id}>{etiquetaEquipo(e)}</option>)}
              </select>
              {errores.equipo_id && <p className="error-text"><IconAlertCircle className="h-3.5 w-3.5 shrink-0" />{errores.equipo_id}</p>}
            </div>
            <div>
              <label className="label-field">Tipo de mantenimiento (¿qué?)<span className="text-rose-500 ml-0.5">*</span></label>
              <select value={form.tipo} onChange={e => { setForm({...form, tipo: e.target.value}); setErrores({...errores, tipo: ''}) }} className={`input-field ${errores.tipo ? 'input-field-error' : ''}`}>
                <option value="">Seleccionar tipo</option>
                {TIPOS_MANTENIMIENTO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errores.tipo && <p className="error-text"><IconAlertCircle className="h-3.5 w-3.5 shrink-0" />{errores.tipo}</p>}
            </div>
            <div>
              <label className="label-field">Frecuencia</label>
              <select value={form.frecuencia} onChange={e => setForm({...form, frecuencia: e.target.value})} className="input-field">
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            <div>
              <label className="label-field">Próxima fecha (¿cuándo?)<span className="text-rose-500 ml-0.5">*</span></label>
              <input type="date" value={form.proxima_fecha} onChange={e => { setForm({...form, proxima_fecha: e.target.value}); setErrores({...errores, proxima_fecha: ''}) }} className={`input-field ${errores.proxima_fecha ? 'input-field-error' : ''}`} />
              {errores.proxima_fecha && <p className="error-text"><IconAlertCircle className="h-3.5 w-3.5 shrink-0" />{errores.proxima_fecha}</p>}
            </div>
            <div>
              <label className="label-field">Técnico responsable (¿quién?)</label>
              <input value={form.tecnico} onChange={e => setForm({...form, tecnico: e.target.value})} className="input-field" list="tecnicos-mant" placeholder="Selecciona o escribe uno nuevo" />
              <datalist id="tecnicos-mant">
                {tecnicos.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <label className="label-field">Descripción</label>
              <input value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="input-field" />
            </div>
          </div>
          <button onClick={guardar} disabled={guardando} className="btn btn-primary btn-md mt-5">
            {guardando ? 'Guardando...' : 'Guardar plan'}
          </button>
        </div>
      )}

      {planesVisibles.length === 0 ? (
        <div className="card border-dashed p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="icon-tile h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <IconInbox className="h-6 w-6" />
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {vista === 'activos' ? 'No hay planes de mantenimiento activos.' : 'No hay planes cancelados o completados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {planesVisibles.map((p, i) => (
            <div
              key={p.id}
              className="card card-hover p-5 animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <div className="flex justify-between items-center gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="icon-tile h-10 w-10 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                    <IconWrench className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-medium text-slate-900 dark:text-slate-100">{p.equipos?.nombre}</h2>
                      <span className="badge-slate">{p.frecuencia}</span>
                      {p.estado === 'cancelado' && <span className="badge-rose">Cancelado</span>}
                      {p.estado === 'completado' && <span className="badge-emerald">Completado</span>}
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{p.tipo}</span>
                    {p.descripcion && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{p.descripcion}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {p.tecnico && (
                        <span className="inline-flex items-center gap-1"><IconUser className="h-3.5 w-3.5" /> {p.tecnico}</span>
                      )}
                      {p.equipos?.ubicacion && (
                        <span className="inline-flex items-center gap-1"><IconMapPin className="h-3.5 w-3.5" /> {p.equipos.ubicacion}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 ${badgeFecha(p.proxima_fecha)}`}>
                    <IconCalendar className="h-3 w-3" />
                    {new Date(p.proxima_fecha).toLocaleDateString('es-CO')}
                  </span>
                  <div className="flex gap-1.5">
                    {vista === 'activos' ? (
                      <>
                        {puedeEditar(rol) && (
                          <button onClick={() => completar(p)} className="btn btn-secondary btn-sm">
                            Completar
                          </button>
                        )}
                        {puedeAdministrar(rol) && (
                          <button onClick={() => cancelar(p.id)} className="btn btn-danger-ghost btn-sm">
                            <IconArchive className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                        )}
                      </>
                    ) : (
                      p.estado === 'cancelado' && puedeAdministrar(rol) && (
                        <button onClick={() => reactivar(p.id)} className="btn btn-secondary btn-sm">
                          <IconRotateCcw className="h-3.5 w-3.5" />
                          Reactivar
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8">
        <Link href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium inline-flex items-center gap-1 group">
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> Volver al dashboard
        </Link>
      </div>
    </main>
  )
}
