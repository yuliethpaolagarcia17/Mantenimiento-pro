'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconTag, IconShieldCheck, IconFileText, IconAlertTriangle, IconCpu } from '../../components/Icons'
import Campo from '../../components/CampoFormulario'
import { ICONO_POR_CATEGORIA, IconCategoriaDefault } from '../../components/CategoriaEquipo'
import { CATEGORIAS_EQUIPO, UBICACIONES_EQUIPO } from '@/lib/constantes'
import { obtenerPerfilActual } from '@/lib/perfil'
import { puedeEditar } from '@/lib/permisos'
import AccesoRestringido from '../../components/AccesoRestringido'

export default function NuevoEquipo() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: '',
    categoria: '',
    marca: '',
    modelo: '',
    serial: '',
    ubicacion: '',
    responsable: '',
    estado: 'operativo',
    ram: '',
    sistema_operativo: '',
    disco: '',
    fecha_compra: '',
    proveedor: '',
    garantia_hasta: '',
    costo_compra: '',
    notas: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errorNombre, setErrorNombre] = useState('')
  const [sugerencias, setSugerencias] = useState({ marca: [], modelo: [], responsable: [], proveedor: [], ram: [], sistema_operativo: [], disco: [] })
  const [rol, setRol] = useState(null)

  useEffect(() => {
    async function cargarPerfil() {
      const perfil = await obtenerPerfilActual()
      setRol(perfil?.rol || '')
    }
    cargarPerfil()
    async function cargarSugerencias() {
      const { data, error } = await supabase.from('equipos').select('marca, modelo, responsable, proveedor, ram, sistema_operativo, disco')
      if (error) {
        console.error('Error cargando sugerencias:', error)
        return
      }
      const unicos = (campo) => [...new Set((data || []).map(e => e[campo]).filter(Boolean))].sort()
      setSugerencias({
        marca: unicos('marca'),
        modelo: unicos('modelo'),
        responsable: unicos('responsable'),
        proveedor: unicos('proveedor'),
        ram: unicos('ram'),
        sistema_operativo: unicos('sistema_operativo'),
        disco: unicos('disco'),
      })
    }
    cargarSugerencias()
  }, [])

  function actualizar(campo, valor) {
    setForm({ ...form, [campo]: valor })
    if (campo === 'nombre') setErrorNombre('')
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      setErrorNombre('El nombre del equipo es obligatorio.')
      setError('Completa los campos obligatorios antes de guardar.')
      return
    }
    setErrorNombre('')
    setGuardando(true)
    setError('')
    try {
      const datos = { ...form }
      if (!datos.fecha_compra) datos.fecha_compra = null
      if (!datos.garantia_hasta) datos.garantia_hasta = null
      datos.costo_compra = datos.costo_compra ? Number(datos.costo_compra) : null
      const { error } = await supabase.from('equipos').insert([datos])
      if (error) throw error
      router.push('/equipos')
    } catch (e) {
      setError('No se pudo guardar: ' + e.message)
      setGuardando(false)
    }
  }

  const IconCategoria = ICONO_POR_CATEGORIA[form.categoria] || IconCategoriaDefault

  if (rol !== null && !puedeEditar(rol)) {
    return <AccesoRestringido mensaje="Tu rol de Consulta solo permite ver la información, no registrar equipos nuevos." />
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 w-full">
      <Link href="/equipos" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium inline-flex items-center gap-1 group w-fit">
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> Volver a equipos
      </Link>

      <div className="flex items-center gap-3 mt-4 mb-6 animate-fade-up">
        <span className="icon-tile h-11 w-11 bg-brand-gradient text-white shadow-elevate shrink-0 transition-colors duration-200">
          <IconCategoria className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>Agregar equipo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Registra un nuevo activo en el inventario.</p>
        </div>
      </div>

      {error && (
        <p className="mb-5 text-rose-600 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-950/40 px-4 py-3 rounded-xl animate-fade-in flex items-center gap-2 ring-1 ring-inset ring-rose-600/10 dark:ring-rose-400/20">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <section className="card p-6 sm:p-7 animate-fade-up">
          <div className="flex items-center gap-2 mb-5">
            <IconTag className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Información general</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo etiqueta="Nombre" valor={form.nombre} onChange={(v) => actualizar('nombre', v)} requerido error={errorNombre} />
            <Campo tipo="select" etiqueta="Categoría" valor={form.categoria} onChange={(v) => actualizar('categoria', v)}>
              <option value="">Seleccionar categoría</option>
              {CATEGORIAS_EQUIPO.map(c => <option key={c} value={c}>{c}</option>)}
            </Campo>
            <Campo etiqueta="Marca" valor={form.marca} onChange={(v) => actualizar('marca', v)} sugerencias={sugerencias.marca} />
            <Campo etiqueta="Modelo" valor={form.modelo} onChange={(v) => actualizar('modelo', v)} sugerencias={sugerencias.modelo} />
            <Campo etiqueta="Serial" valor={form.serial} onChange={(v) => actualizar('serial', v)} />
            <Campo tipo="select" etiqueta="Ubicación" valor={form.ubicacion} onChange={(v) => actualizar('ubicacion', v)}>
              <option value="">Seleccionar ubicación</option>
              {UBICACIONES_EQUIPO.map(u => <option key={u} value={u}>{u}</option>)}
            </Campo>
            <Campo etiqueta="Responsable" valor={form.responsable} onChange={(v) => actualizar('responsable', v)} sugerencias={sugerencias.responsable} />
            <Campo tipo="select" etiqueta="Estado" valor={form.estado} onChange={(v) => actualizar('estado', v)}>
              <option value="operativo">Operativo</option>
              <option value="mantenimiento">En mantenimiento</option>
              <option value="fuera de servicio">Fuera de servicio</option>
            </Campo>
          </div>
        </section>

        <section className="card p-6 sm:p-7 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 mb-5">
            <IconCpu className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Especificaciones técnicas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo etiqueta="RAM" valor={form.ram} onChange={(v) => actualizar('ram', v)} sugerencias={sugerencias.ram} />
            <Campo etiqueta="Sistema operativo" valor={form.sistema_operativo} onChange={(v) => actualizar('sistema_operativo', v)} sugerencias={sugerencias.sistema_operativo} />
            <Campo etiqueta="Disco" valor={form.disco} onChange={(v) => actualizar('disco', v)} sugerencias={sugerencias.disco} />
          </div>
        </section>

        <section className="card p-6 sm:p-7 animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <div className="flex items-center gap-2 mb-5">
            <IconShieldCheck className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Compra y garantía</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo tipo="date" etiqueta="Fecha de compra" valor={form.fecha_compra} onChange={(v) => actualizar('fecha_compra', v)} />
            <Campo etiqueta="Proveedor" valor={form.proveedor} onChange={(v) => actualizar('proveedor', v)} sugerencias={sugerencias.proveedor} />
            <Campo tipo="date" etiqueta="Garantía hasta" valor={form.garantia_hasta} onChange={(v) => actualizar('garantia_hasta', v)} />
            <Campo tipo="number" etiqueta="Costo de compra" valor={form.costo_compra} onChange={(v) => actualizar('costo_compra', v)} />
          </div>
        </section>

        <section className="card p-6 sm:p-7 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-5">
            <IconFileText className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notas</h2>
          </div>
          <textarea
            value={form.notas}
            onChange={(e) => actualizar('notas', e.target.value)}
            className="input-field"
            rows={4}
            placeholder="Observaciones, condiciones especiales, accesorios incluidos..."
          />
        </section>

        <div className="flex justify-end">
          <button onClick={guardar} disabled={guardando} className="btn btn-primary btn-md">
            {guardando ? 'Guardando...' : 'Guardar equipo'}
          </button>
        </div>
      </div>
    </div>
  )
}
