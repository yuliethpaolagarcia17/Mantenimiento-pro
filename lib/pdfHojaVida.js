import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const AZUL = [37, 99, 235]
const CIAN = [8, 145, 178]
const SLATE_900 = [15, 23, 42]
const SLATE_600 = [71, 85, 105]
const SLATE_400 = [148, 163, 184]
const SLATE_200 = [226, 232, 240]
const SLATE_50 = [248, 250, 252]

const ESTADO_LABEL = {
  operativo: 'Operativo',
  mantenimiento: 'En mantenimiento',
  'fuera de servicio': 'Fuera de servicio',
  retirado: 'Retirado',
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t)
}

function bandaGradiente(doc, x, y, w, h) {
  const pasos = 60
  const anchoPaso = w / pasos
  for (let i = 0; i < pasos; i++) {
    const t = i / (pasos - 1)
    doc.setFillColor(lerp(AZUL[0], CIAN[0], t), lerp(AZUL[1], CIAN[1], t), lerp(AZUL[2], CIAN[2], t))
    doc.rect(x + i * anchoPaso, y, anchoPaso + 0.5, h, 'F')
  }
}

export function generarPdfHojaVida({ equipo, historial, qrDataUrl }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margen = 15
  const anchoUtil = 210 - margen * 2
  let y

  const alturaHeader = 42
  bandaGradiente(doc, 0, 0, 210, alturaHeader)
  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(11)
  doc.text('MANTENPRO', margen, 13)
  doc.setFontSize(20)
  doc.text(equipo.nombre, margen, 25)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  const subtitulo = [equipo.categoria, ESTADO_LABEL[equipo.estado] || equipo.estado].filter(Boolean).join('   ·   ')
  doc.text(subtitulo, margen, 33)

  if (qrDataUrl) {
    const qrTam = 24
    const qrX = 210 - margen - qrTam
    const qrY = (alturaHeader - qrTam) / 2
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(qrX - 2, qrY - 2, qrTam + 4, qrTam + 4, 2, 2, 'F')
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrTam, qrTam)
  }

  y = alturaHeader + 10

  function saltoPaginaSiNecesario(margenInferior = 20) {
    if (y > 297 - margenInferior) {
      doc.addPage()
      y = 20
    }
  }

  function tituloSeccion(texto) {
    saltoPaginaSiNecesario(35)
    doc.setFillColor(...AZUL)
    doc.rect(margen, y - 4.2, 2.2, 6, 'F')
    doc.setTextColor(...SLATE_900)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(11.5)
    doc.text(texto, margen + 5, y)
    y += 7
  }

  function cajaCampos(pares) {
    const filas = pares.filter(([, v]) => v)
    if (filas.length === 0) {
      doc.setFont(undefined, 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(...SLATE_400)
      doc.text('Sin información registrada.', margen, y)
      y += 10
      return
    }
    const colAncho = anchoUtil / 2
    const filaAlto = 12
    const numFilas = Math.ceil(filas.length / 2)
    const alturaBox = numFilas * filaAlto + 6
    doc.setDrawColor(...SLATE_200)
    doc.setFillColor(...SLATE_50)
    doc.roundedRect(margen, y, anchoUtil, alturaBox, 2, 2, 'FD')
    filas.forEach(([etiqueta, valor], i) => {
      const col = i % 2
      const fila = Math.floor(i / 2)
      const x = margen + 6 + col * colAncho
      const yy = y + 8 + fila * filaAlto
      doc.setFont(undefined, 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...SLATE_400)
      doc.text(etiqueta.toUpperCase(), x, yy)
      doc.setFont(undefined, 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...SLATE_900)
      const texto = doc.splitTextToSize(String(valor), colAncho - 10)
      doc.text(texto[0], x, yy + 5.5)
    })
    y += alturaBox + 8
  }

  tituloSeccion('Información general')
  cajaCampos([
    ['Categoría', equipo.categoria],
    ['Marca', equipo.marca],
    ['Modelo', equipo.modelo],
    ['Serial', equipo.serial],
    ['Ubicación', equipo.ubicacion],
    ['Responsable', equipo.responsable],
  ])

  if (equipo.ram || equipo.sistema_operativo || equipo.disco) {
    tituloSeccion('Especificaciones técnicas')
    cajaCampos([
      ['RAM', equipo.ram],
      ['Sistema operativo', equipo.sistema_operativo],
      ['Disco', equipo.disco],
    ])
  }

  tituloSeccion('Compra y garantía')
  cajaCampos([
    ['Fecha de compra', equipo.fecha_compra],
    ['Proveedor', equipo.proveedor],
    ['Garantía hasta', equipo.garantia_hasta],
    ['Costo de compra', equipo.costo_compra ? `$${equipo.costo_compra}` : ''],
  ])

  if (equipo.notas) {
    tituloSeccion('Notas')
    doc.setFont(undefined, 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...SLATE_600)
    const lineas = doc.splitTextToSize(equipo.notas, anchoUtil)
    saltoPaginaSiNecesario(lineas.length * 5 + 15)
    doc.text(lineas, margen, y)
    y += lineas.length * 5 + 8
  }

  tituloSeccion(`Historial de mantenimientos (${historial.length})`)
  if (historial.length === 0) {
    doc.setFont(undefined, 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...SLATE_400)
    doc.text('Este equipo no tiene mantenimientos registrados.', margen, y)
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margen, right: margen },
      head: [['Fecha', 'Tipo', 'Técnico', 'Descripción', 'Costo']],
      body: historial.map(h => [
        new Date(h.fecha).toLocaleDateString('es-CO'),
        h.tipo || '—',
        h.tecnico || '—',
        h.anulado ? `(Anulado) ${h.descripcion || ''}`.trim() : (h.descripcion || '—'),
        h.costo ? `$${h.costo}` : '—',
      ]),
      styles: { fontSize: 8.5, textColor: SLATE_900, cellPadding: 3 },
      headStyles: { fillColor: AZUL, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SLATE_50 },
      columnStyles: { 3: { cellWidth: 62 } },
    })
  }

  const totalPaginas = doc.internal.getNumberOfPages()
  const fechaGenerado = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setDrawColor(...SLATE_200)
    doc.line(margen, 289, 210 - margen, 289)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...SLATE_400)
    doc.text(`Generado el ${fechaGenerado} · MantenPro`, margen, 293)
    doc.text(`Página ${i} de ${totalPaginas}`, 210 - margen, 293, { align: 'right' })
  }

  return doc
}
