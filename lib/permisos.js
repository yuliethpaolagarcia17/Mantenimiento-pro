export function puedeEditar(rol) {
  return rol === 'Administrador' || rol === 'Técnico'
}

export function puedeAdministrar(rol) {
  return rol === 'Administrador'
}
