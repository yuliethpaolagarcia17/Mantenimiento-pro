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
  'Otro',
]

export const ROLES = ['Administrador', 'Técnico', 'Consulta']

export const MARCAS_COMUNES = [
  'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Apple', 'Samsung', 'LG',
  'Epson', 'BenQ', 'Canon', 'Sony',
]

export const RAM_COMUNES = ['2GB', '4GB', '8GB', '16GB', '32GB', '64GB']

export const SISTEMAS_OPERATIVOS = [
  'Windows 10', 'Windows 11', 'Windows Server', 'Linux', 'macOS', 'ChromeOS', 'Sin sistema operativo',
]

export const DISCOS_COMUNES = [
  '128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD',
  '500GB HDD', '1TB HDD', '2TB HDD',
]

export const UBICACIONES_EQUIPO = [
  'Recepción',
  'Oficina administrativa',
  'Sala de juntas',
  'Sala de servidores',
  'Departamento de TI',
  'Aula / Salón de clase',
  'Laboratorio de cómputo',
  'Biblioteca',
  'Auditorio',
  'Bodega / Almacén',
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
