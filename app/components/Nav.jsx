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
      className={`glass-panel sticky top-0 z-20 border-b px-4 sm:px-8 transition-shadow duration-300 ${
        scrolled ? 'border-slate-200 shadow-[0_1px_0_0_rgba(15,23,42,0.04),0_12px_28px_-18px_rgba(15,23,42,0.3)]' : 'border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="bg-brand-gradient h-9 w-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-elevate transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
            <IconWrench className="h-4.5 w-4.5" />
          </span>
          <span className="font-semibold text-lg text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Manten<span className="text-brand-gradient">Pro</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 text-sm bg-slate-900/[0.03] rounded-2xl p-1 border border-slate-900/[0.04]">
          {links.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl font-medium transition-all duration-200 ${
                  active
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
