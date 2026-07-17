'use client'
import { useEffect, useState } from 'react'
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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (pathname === '/login') return null

  return (
    <nav
      className={`bg-white/75 backdrop-blur-md border-b px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-10 transition-shadow duration-300 ${
        scrolled ? 'border-gray-200 shadow-[0_1px_0_0_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.25)]' : 'border-transparent'
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5 group">
        <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
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
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors duration-200 ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{link.label}</span>
              {active && (
                <span className="absolute left-3 right-3 -bottom-[13px] h-0.5 rounded-full bg-indigo-600 hidden sm:block" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
