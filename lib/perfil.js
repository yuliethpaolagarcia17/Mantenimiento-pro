import { supabase } from './supabase'

export async function obtenerPerfilActual() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from('perfiles').select('*').eq('id', user.id).maybeSingle()
  if (error) {
    console.error('Error cargando perfil:', error)
    return null
  }
  if (data) return data

  const nuevo = {
    id: user.id,
    correo: user.email || '',
    nombre: (user.email || '').split('@')[0],
    rol: 'Consulta',
  }
  const { data: creado, error: errorCrear } = await supabase.from('perfiles').insert([nuevo]).select().single()
  if (errorCrear) {
    console.error('Error creando perfil:', errorCrear)
    return nuevo
  }
  return creado
}
