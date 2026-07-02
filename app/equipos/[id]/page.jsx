'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HojaVida({ params }) {
  const [equipo, setEquipo] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase
          .from('equipos')
          .select('*')
          .eq('id', params.id)
          .single()
        if (error) throw error
        setEquipo(data)
      } catch (e) {
        console.error('Error cargando equipo:', e)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [params.id])

  if (cargando) return <p>Cargando equipo...</p>
  if (!equipo) return <p>Equipo no encontrado</p>

  return (
    <div>
      <h1>{equipo.nombre}</h1>
    </div>
  )
}