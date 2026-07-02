'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Equipos() {
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase.from('equipos').select('*')
        if (error) throw error
        setEquipos(data)
      } catch (e) {
        console.error('Error cargando equipos:', e)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  if (cargando) return <p>Cargando equipos...</p>

  return (
    <div>
      <h1>Equipos</h1>
      <ul>
        {equipos.map((eq) => (
          <li key={eq.id}>
            <Link href={`/equipos/${eq.id}`}>{eq.nombre}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
