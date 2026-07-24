'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconHome, IconBox, IconWrench, IconClock, IconQrCode, IconX, IconChevronLeft } from './Icons'
import Logo from './Logo'

const links = [
  { href: '/', label: 'Dashboard', icon: IconHome },
  { href: '/equipos', label: 'Equipos', icon: IconBox },
  { href: '/mantenimientos', label: 'Plan de mant.', icon: IconWrench },
  { href: '/historial', label: 'Historial', icon: IconClock },
  { href: '/escanear', label: 'Escanear QR', icon: IconQrCode },
]

export default function Sidebar({ open, onClose, colapsado, onToggleColapso }) {
  const pathname = usePathname()
  const ocultarEnDesktop = colapsado ? 'lg:hidden' : ''

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 ${colapsado ? 'lg:w-20' : 'lg:w-64'} shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 transition-[transform,width] duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className={`flex items-center gap-2.5 px-5 h-16 border-b border-slate-100 dark:border-slate-800/60 shrink-0 ${colapsado ? 'lg:justify-center lg:px-0' : 'justify-between'}`}>
          <Logo onClick={onClose} markClassName="h-8 w-8 rounded-lg" wordmarkClassName={ocultarEnDesktop} />
          <button onClick={onClose} className={`lg:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${colapsado ? 'hidden' : ''}`}>
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className={`section-eyebrow px-3 mb-2 ${ocultarEnDesktop}`}>Principal</p>
          <div className="flex flex-col gap-0.5">
            {links.map(link => {
              const active = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  title={colapsado ? link.label : undefined}
                  className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${colapsado ? 'lg:justify-center' : ''} ${
                    active ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-blue-600" />}
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className={ocultarEnDesktop}>{link.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <button
          onClick={onToggleColapso}
          className="hidden lg:flex items-center gap-2 mx-3 mb-4 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shrink-0"
        >
          <IconChevronLeft className={`h-4.5 w-4.5 shrink-0 transition-transform duration-300 ${colapsado ? 'rotate-180 mx-auto' : ''}`} />
          <span className={ocultarEnDesktop}>Contraer</span>
        </button>
      </aside>
    </>
  )
}
