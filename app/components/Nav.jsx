'use client'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()
  if (pathname === '/login') return null

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center">
      <a href="/" className="font-bold text-lg">MantenPro</a>
      <div className="flex gap-4 text-sm">
        <a href="/" className="hover:underline">Dashboard</a>
        <a href="/equipos" className="hover:underline">Equipos</a>
        <a href="/mantenimientos" className="hover:underline">Mantenimientos</a>
        <a href="/historial" className="hover:underline">Historial</a>
      </div>
    </nav>
  )
}
