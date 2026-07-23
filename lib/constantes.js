export const TIPOS_MANTENIMIENTO = [
  'Preventivo',
  'Correctivo',
  'Predictivo',
  'Inspección',
  'Calibración',
  'Otro',
]

export const CATEGORIAS_EQUIPO = [
  'Computador',
  'Portátil',
  'Televisor',
  'Proyector',
  'Celular',
  'Tablet',
  'Impresora',
  'Aire acondicionado',
  'Red y conectividad',
  'Cámara de seguridad',
  'Audio y video',
  'Otro',
]

export function etiquetaEquipo(e) {
  const partes = []
  if (e.categoria && e.categoria !== e.nombre) partes.push(`[${e.categoria}]`)
  partes.push(e.nombre)
  if (e.ubicacion) partes.push(`— ${e.ubicacion}`)
  return partes.join(' ')
}
