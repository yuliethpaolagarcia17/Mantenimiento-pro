'use client'
import { useEffect, useState } from 'react'
import { IconSun, IconMoon } from './Icons'

export default function ThemeToggle() {
  const [montado, setMontado] = useState(false)
  const [oscuro, setOscuro] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con el tema ya aplicado por el script anti-parpadeo en <head>, no se puede conocer en el servidor
    setOscuro(document.documentElement.classList.contains('dark'))
    setMontado(true)
  }, [])

  function alternar() {
    const nuevoOscuro = !oscuro
    setOscuro(nuevoOscuro)
    document.documentElement.classList.toggle('dark', nuevoOscuro)
    localStorage.setItem('theme', nuevoOscuro ? 'dark' : 'light')
  }

  const mostrarSol = montado && oscuro

  return (
    <button
      onClick={alternar}
      aria-label={mostrarSol ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={mostrarSol ? 'Modo claro' : 'Modo oscuro'}
      className="flex items-center justify-center h-9 w-9 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
    >
      {mostrarSol ? <IconSun className="h-4.5 w-4.5" /> : <IconMoon className="h-4.5 w-4.5" />}
    </button>
  )
}
