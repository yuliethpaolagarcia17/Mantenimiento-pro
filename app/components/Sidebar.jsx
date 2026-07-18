'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconHome, IconBox, IconWrench, IconClock, IconQrCode, IconX } from './Icons'

const links = [
  { href: '/', label: 'Dashboard', icon: IconHome },
  { href: '/equipos', label: 'Equipos', icon: IconBox },
  { href: '/mantenimientos', label: 'Plan de mant.', icon: IconWrench },
  { href: '/historial', label: 'Historial', icon: IconClock },
  { href: '/escanear', label: 'Escanear QR', icon: IconQrCode },
]

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between gap-2.5 px-5 h-16 border-b border-slate-100 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
            <span className="bg-brand-gradient h-8 w-8 rounded-lg text-white flex items-center justify-center shrink-0 shadow-elevate transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
              <IconWrench className="h-4 w-4" />
            </span>
            <span className="font-semibold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Manten<span className="text-brand-gradient">Pro</span>
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-700 transition-colors">
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="section-eyebrow px-3 mb-2">Principal</p>
          <div className="flex flex-col gap-0.5">
            {links.map(link => {
              const active = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-indigo-600" />}
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>
    </>
  )
}
