'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { IconWrench } from './Icons'

export default function Footer() {
  const pathname = usePathname()
  if (pathname === '/login') return null

  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="bg-brand-gradient h-7 w-7 rounded-lg text-white flex items-center justify-center shrink-0">
            <IconWrench className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">MantenPro</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Mantenimiento preventivo, sin fricción.</p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/equipos" className="hover:text-blue-600 transition-colors">Equipos</Link>
          <Link href="/mantenimientos" className="hover:text-blue-600 transition-colors">Mantenimientos</Link>
          <Link href="/historial" className="hover:text-blue-600 transition-colors">Historial</Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            Sistema operativo
          </span>
          <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
          <p className="text-xs text-slate-400 dark:text-slate-500">© {year} MantenPro</p>
        </div>
      </div>
    </footer>
  )
}
