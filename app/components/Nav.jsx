'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/equipos', label: 'Equipos' },
  { href: '/mantenimientos', label: 'Mantenimientos' },
  { href: '/historial', label: 'Historial' },
]

export default function Nav() {
  const pathname = usePathname()
  if (pathname === '/login') return null

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-10">
      <Link href="/" className="font-semibold text-lg text-gray-900 tracking-tight">
        Manten<span className="text-indigo-600">Pro</span>
      </Link>
      <div className="flex gap-1 text-sm">
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}