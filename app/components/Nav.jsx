'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { IconHome, IconBox, IconWrench, IconClock } from './Icons'

const links = [
  { href: '/', label: 'Dashboard', icon: IconHome },
  { href: '/equipos', label: 'Equipos', icon: IconBox },
  { href: '/mantenimientos', label: 'Mantenimientos', icon: IconWrench },
  { href: '/historial', label: 'Historial', icon: IconClock },
]

export default function Nav() {
  const pathname = usePathname()
  if (pathname === '/login') return null

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-10">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
          <IconWrench className="h-4 w-4" />
        </span>
        <span className="font-semibold text-lg text-gray-900 tracking-tight">
          Manten<span className="text-indigo-600">Pro</span>
        </span>
      </Link>
      <div className="flex gap-1 text-sm">
        {links.map((link) => {
          const active = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
