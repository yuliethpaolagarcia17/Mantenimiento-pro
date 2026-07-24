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
  'Proyector',
  'Televisor',
]

export const UBICACIONES_EQUIPO = [
  'Aula',
  'Laboratorio',
  'Biblioteca',
  'Sala de profesores',
  'Auditorio',
  'Oficina administrativa',
  'Recepción',
  'Sala de juntas',
  'Cafetería',
  'Otro',
]

export function etiquetaEquipo(e) {
  const partes = []
  if (e.categoria && e.categoria !== e.nombre) partes.push(`[${e.categoria}]`)
  partes.push(e.nombre)
  if (e.ubicacion) partes.push(`— ${e.ubicacion}`)
  return partes.join(' ')
}
