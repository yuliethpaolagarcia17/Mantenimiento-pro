'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { QRCodeCanvas } from 'qrcode.react'
import {
  IconWrench, IconTag, IconBox, IconMapPin, IconUser, IconCalendar,
  IconBuilding, IconShieldCheck, IconDollarSign, IconFileText, IconEdit, IconClock,
  IconArchive, IconRotateCcw, IconDownload, IconCpu, IconHardDrive
} from '../../components/Icons'
import HistorialItem from '../../components/HistorialItem'
import { ICONO_POR_CATEGORIA, IconCategoriaDefault } from '../../components/CategoriaEquipo'

export default function HojaVida({ params }) {
  const { id } = use(params)
  const [equipo, setEquipo] = useState(null)
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [actualizandoEstado, setActualizandoEstado] = useState(false)
  const [generandoPDF, setGenerandoPDF] = useState(false)

  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase
          .from('equipos')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        setEquipo(data)
      } catch (e) {
        console.error('Error cargando equipo:', e)
      } finally {
        setCargando(false)
      }
    }
    async function cargarHistorial() {
      const { data, error } = await supabase
        .from('historial_mantenimientos')
        .select('*')
        .eq('equipo_id', id)
        .order('fecha', { ascending: false })
      if (error) console.error('Error cargando historial:', error)
      setHistorial(data || [])
    }
    cargar()
    cargarHistorial()
  }, [id])

  async function retirar() {
    const estaRetirado = equipo.estado === 'retirado'
    const mensaje = estaRetirado
      ? '¿Reactivar este equipo?'
      : '¿Retirar este equipo? Quedará registrado en la base de datos con su historial completo, pero dejará de figurar como activo.'
    if (!confirm(mensaje)) return
    setActualizandoEstado(true)
    const nuevoEstado = estaRetirado ? 'operativo' : 'retirado'
    const { error } = await supabase.from('equipos').update({ estado: nuevoEstado }).eq('id', id)
    if (error) {
      alert('No se pudo actualizar el estado: ' + error.message)
      setActualizandoEstado(false)
      return
    }
    setEquipo({ ...equipo, estado: nuevoEstado })
    setActualizandoEstado(false)
  }

  async function descargarPDF() {
    setGenerandoPDF(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const margen = 15
      let y = 20

      function salto(alto = 7) {
        y += alto
        if (y > 280) {
          doc.addPage()
          y = 20
        }
      }
      function titulo(texto) {
        doc.setFontSize(13)
        doc.setFont(undefined, 'bold')
        doc.text(texto, margen, y)
        doc.setFont(undefined, 'normal')
        doc.setFontSize(10)
        salto(8)
      }
      function fila(etiqueta, valor) {
        doc.setTextColor(100)
        doc.text(`${etiqueta}:`, margen, y)
        doc.setTextColor(20)
        doc.text(String(valor || 'No registrado'), margen + 45, y)
        salto(6.5)
      }

      doc.setFontSize(17)
      doc.setFont(undefined, 'bold')
      doc.text('Hoja de vida del equipo', margen, y)
      salto(9)
      doc.setFontSize(11)
      doc.setTextColor(80)
      doc.text(equipo.nombre, margen, y)
      doc.setTextColor(20)
      salto(10)

      titulo('Información general')
      fila('Categoría', equipo.categoria)
      fila('Marca', equipo.marca)
      fila('Modelo', equipo.modelo)
      fila('Serial', equipo.serial)
      fila('Ubicación', equipo.ubicacion)
      fila('Responsable', equipo.responsable)
      fila('Estado', equipo.estado)
      salto(4)

      titulo('Especificaciones técnicas')
      fila('RAM', equipo.ram)
      fila('Sistema operativo', equipo.sistema_operativo)
      fila('Disco', equipo.disco)
      salto(4)

      titulo('Compra y garantía')
      fila('Fecha de compra', equipo.fecha_compra)
      fila('Proveedor', equipo.proveedor)
      fila('Garantía hasta', equipo.garantia_hasta)
      fila('Costo de compra', equipo.costo_compra ? `$${equipo.costo_compra}` : '')
      salto(4)

      if (equipo.notas) {
        titulo('Notas')
        const lineas = doc.splitTextToSize(equipo.notas, 180)
        doc.text(lineas, margen, y)
        salto(lineas.length * 5.5 + 4)
      }

      titulo(`Historial de mantenimientos (${historial.length})`)
      if (historial.length === 0) {
        doc.setTextColor(100)
        doc.text('Este equipo no tiene mantenimientos registrados.', margen, y)
        doc.setTextColor(20)
        salto(6.5)
      } else {
        historial.forEach(h => {
          fila('Fecha', new Date(h.fecha).toLocaleDateString('es-CO'))
          fila('Tipo', h.tipo)
          fila('Técnico', h.tecnico)
          if (h.descripcion) fila('Descripción', h.descripcion)
          if (h.costo) fila('Costo', `$${h.costo}`)
          doc.setDrawColor(220)
          doc.line(margen, y - 2, 195, y - 2)
          salto(3)
        })
      }

      doc.save(`hoja-de-vida-${equipo.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    } catch (e) {
      console.error('Error generando PDF:', e)
      alert('No se pudo generar el PDF.')
    }
    setGenerandoPDF(false)
  }

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-sm">
          <span className="h-4 w-4 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-blue-500 animate-spin" />
          Cargando equipo...
        </div>
      </div>
    )
  }
  if (!equipo) return <p className="p-8 text-slate-400 dark:text-slate-500 text-sm">Equipo no encontrado</p>

  const estadoBadge =
    equipo.estado === 'operativo' ? 'badge-emerald'
    : equipo.estado === 'mantenimiento' ? 'badge-amber'
    : equipo.estado === 'retirado' ? 'badge-slate'
    : 'badge-rose'

  const estadoDot =
    equipo.estado === 'operativo' ? 'bg-emerald-500'
    : equipo.estado === 'mantenimiento' ? 'bg-amber-500'
    : equipo.estado === 'retirado' ? 'bg-slate-400'
    : 'bg-rose-500'

  const estaRetirado = equipo.estado === 'retirado'

  const urlEquipo =
    typeof window !== 'undefined' ? window.location.href : ''

  const IconCategoria = ICONO_POR_CATEGORIA[equipo.categoria] || IconCategoriaDefault

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 w-full">
      <Link href="/equipos" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium inline-flex items-center gap-1 group w-fit">
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> Volver a equipos
      </Link>

      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card p-6 sm:p-8 animate-fade-up">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <span className="icon-tile h-12 w-12 bg-brand-gradient text-white shadow-elevate shrink-0">
                  <IconCategoria className="h-5.5 w-5.5" />
                </span>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>{equipo.nombre}</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">{equipo.categoria || 'Hoja de vida del equipo'}</p>
                </div>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1.5 ${estadoBadge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${estadoDot}`} />
                {equipo.estado}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <Dato icon={IconCategoria} etiqueta="Categoría" valor={equipo.categoria || 'No registrada'} />
              <Dato icon={IconTag} etiqueta="Marca" valor={equipo.marca} />
              <Dato icon={IconBox} etiqueta="Modelo" valor={equipo.modelo} />
              <Dato icon={IconFileText} etiqueta="Serial" valor={equipo.serial} />
              <Dato icon={IconMapPin} etiqueta="Ubicación" valor={equipo.ubicacion} />
              <Dato icon={IconUser} etiqueta="Responsable" valor={equipo.responsable} />
              <Dato icon={IconCalendar} etiqueta="Fecha de compra" valor={equipo.fecha_compra || 'No registrada'} />
              <Dato icon={IconBuilding} etiqueta="Proveedor" valor={equipo.proveedor || 'No registrado'} />
              <Dato icon={IconShieldCheck} etiqueta="Garantía hasta" valor={equipo.garantia_hasta || 'No registrada'} />
              <Dato icon={IconDollarSign} etiqueta="Costo de compra" valor={equipo.costo_compra ? `$${equipo.costo_compra}` : 'No registrado'} />
            </div>

            {(equipo.ram || equipo.sistema_operativo || equipo.disco) && (
              <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <p className="section-eyebrow mb-4">Especificaciones técnicas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <Dato icon={IconCpu} etiqueta="RAM" valor={equipo.ram || 'No registrada'} />
                  <Dato icon={IconBox} etiqueta="Sistema operativo" valor={equipo.sistema_operativo || 'No registrado'} />
                  <Dato icon={IconHardDrive} etiqueta="Disco" valor={equipo.disco || 'No registrado'} />
                </div>
              </div>
            )}

            {equipo.notas && (
              <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <p className="section-eyebrow mb-2">Notas</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{equipo.notas}</p>
              </div>
            )}

            <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-3">
              <Link href={`/equipos/${id}/editar`} className="btn btn-primary btn-md">
                <IconEdit className="h-4 w-4" />
                Editar equipo
              </Link>
              <button onClick={descargarPDF} disabled={generandoPDF} className="btn btn-secondary btn-md">
                <IconDownload className="h-4 w-4" />
                {generandoPDF ? 'Generando...' : 'Descargar PDF'}
              </button>
              <button onClick={retirar} disabled={actualizandoEstado} className={`btn btn-md ${estaRetirado ? 'btn-secondary' : 'btn-danger-ghost'}`}>
                {estaRetirado ? <IconRotateCcw className="h-4 w-4" /> : <IconArchive className="h-4 w-4" />}
                {actualizandoEstado ? 'Actualizando...' : estaRetirado ? 'Reactivar equipo' : 'Retirar equipo'}
              </button>
            </div>
          </div>

          <div className="card p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <p className="section-eyebrow mb-4">
              Historial de mantenimientos ({historial.length})
            </p>
            {historial.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">Este equipo no tiene mantenimientos registrados.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {historial.map(h => (
                  <HistorialItem key={h.id} registro={h} ubicacion={equipo.ubicacion} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card p-6 flex flex-col items-center text-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wide mb-4">
              <IconWrench className="h-3.5 w-3.5" />
              Código QR
            </div>
            <div className="p-3 bg-white border border-slate-200 dark:border-slate-800 rounded-xl shrink-0 shadow-sm">
              <QRCodeCanvas value={urlEquipo} size={150} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-4">
              Escanéalo desde el celular para acceder de inmediato a esta hoja de vida, sin buscar papeles ni carpetas.
            </p>
          </div>

          <div className="card p-6 bg-gradient-to-br from-blue-600 to-cyan-700 text-white animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <span className="icon-tile h-9 w-9 bg-white/15 ring-1 ring-white/20 mb-3">
              <IconClock className="h-4.5 w-4.5" />
            </span>
            <p className="font-medium text-sm">Próximo mantenimiento</p>
            <p className="text-blue-100/80 text-xs mt-1 leading-relaxed">
              Consulta o programa el siguiente plan para este equipo desde la sección de mantenimientos.
            </p>
            <Link href="/mantenimientos" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 transition-colors px-3 py-2 rounded-lg">
              Ir a mantenimientos →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dato({ icon: Icon, etiqueta, valor }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{etiqueta}</p>
        <p className="text-sm text-slate-900 dark:text-slate-100 mt-0.5 truncate">{valor}</p>
      </div>
    </div>
  )
}
