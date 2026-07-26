'use client'
import { useEffect, useState } from 'react'
import { supabase, SUPABASE_URL } from '@/lib/supabase'
import { obtenerPerfilActual } from '@/lib/perfil'
import { ROLES } from '@/lib/constantes'
import { IconUsers, IconShieldCheck, IconArchive, IconRotateCcw, IconInbox } from '../components/Icons'

const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0]
const URL_PANEL_USUARIOS = `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/users`

export default function Usuarios() {
  const [miPerfil, setMiPerfil] = useState(null)
  const [perfiles, setPerfiles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardandoId, setGuardandoId] = useState(null)

  async function cargarPerfiles() {
    const { data, error } = await supabase.from('perfiles').select('*').order('nombre', { ascending: true })
    if (error) console.error('Error cargando perfiles:', error)
    setPerfiles(data || [])
  }

  useEffect(() => {
    async function cargar() {
      const perfil = await obtenerPerfilActual()
      setMiPerfil(perfil)
      if (perfil?.rol === 'Administrador') {
        await cargarPerfiles()
      }
      setCargando(false)
    }
    cargar()
  }, [])

  async function cambiarRol(id, rol) {
    setGuardandoId(id)
    const { error } = await supabase.from('perfiles').update({ rol }).eq('id', id)
    if (error) {
      alert('No se pudo actualizar el rol: ' + error.message)
    } else {
      setPerfiles(prev => prev.map(p => p.id === id ? { ...p, rol } : p))
    }
    setGuardandoId(null)
  }

  async function alternarAcceso(perfil) {
    const nuevoEstado = !perfil.activo
    const mensaje = nuevoEstado
      ? '¿Reactivar el acceso de este usuario?'
      : '¿Retirar el acceso de este usuario? Su cuenta y su historial quedan registrados, solo pierde acceso al sistema.'
    if (!confirm(mensaje)) return
    setGuardandoId(perfil.id)
    const { error } = await supabase.from('perfiles').update({ activo: nuevoEstado }).eq('id', perfil.id)
    if (error) {
      alert('No se pudo actualizar: ' + error.message)
    } else {
      setPerfiles(prev => prev.map(p => p.id === perfil.id ? { ...p, activo: nuevoEstado } : p))
    }
    setGuardandoId(null)
  }

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-sm">
          <span className="h-4 w-4 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-blue-500 animate-spin" />
          Cargando usuarios...
        </div>
      </div>
    )
  }

  if (miPerfil?.rol !== 'Administrador') {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-8 w-full">
        <div className="card border-dashed p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="icon-tile h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <IconShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Acceso restringido</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-sm">
            Solo los usuarios con rol <b>Administrador</b> pueden gestionar usuarios y roles. Tu rol actual es <b>{miPerfil?.rol || 'sin asignar'}</b>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 w-full">
      <div className="flex items-center gap-3 mb-6 animate-fade-up">
        <span className="icon-tile h-11 w-11 bg-brand-gradient text-white shadow-elevate shrink-0">
          <IconUsers className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>Gestión de usuarios</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{perfiles.length} {perfiles.length === 1 ? 'usuario registrado' : 'usuarios registrados'}</p>
        </div>
      </div>

      <div className="card p-4 sm:p-5 mb-6 flex items-start gap-3 bg-blue-50/60 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40 animate-fade-up">
        <IconShieldCheck className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900 dark:text-blue-300 leading-relaxed">
          Para agregar un nuevo usuario, créalo desde el{' '}
          <a href={URL_PANEL_USUARIOS} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
            Panel de Supabase → Authentication
          </a>
          . En cuanto inicie sesión por primera vez, aparecerá aquí automáticamente para asignarle un rol.
        </p>
      </div>

      {perfiles.length === 0 ? (
        <div className="card border-dashed p-10 text-center flex flex-col items-center animate-fade-up">
          <span className="icon-tile h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <IconInbox className="h-6 w-6" />
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">No hay usuarios registrados todavía.</p>
        </div>
      ) : (
        <div className="card overflow-hidden animate-fade-up">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Nombre</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Correo</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Rol</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Estado</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {perfiles.map(p => {
                const esUnoMismo = p.id === miPerfil.id
                return (
                  <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{p.nombre || '—'}</span>
                      {esUnoMismo && <span className="badge-slate ml-2">Tú</span>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{p.correo}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={p.rol}
                        disabled={guardandoId === p.id || esUnoMismo}
                        onChange={(e) => cambiarRol(p.id, e.target.value)}
                        className="input-field py-1.5 text-sm w-auto disabled:opacity-50"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={p.activo ? 'badge-emerald' : 'badge-rose'}>{p.activo ? 'Activo' : 'Retirado'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {esUnoMismo ? (
                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                      ) : (
                        <button
                          onClick={() => alternarAcceso(p)}
                          disabled={guardandoId === p.id}
                          className={`btn btn-sm ${p.activo ? 'btn-danger-ghost' : 'btn-secondary'} disabled:opacity-50`}
                        >
                          {p.activo ? <IconArchive className="h-3.5 w-3.5" /> : <IconRotateCcw className="h-3.5 w-3.5" />}
                          {p.activo ? 'Retirar acceso' : 'Reactivar'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
