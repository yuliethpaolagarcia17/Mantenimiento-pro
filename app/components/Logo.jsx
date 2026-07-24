import Link from 'next/link'
import { IconLogoMark } from './Icons'

export default function Logo({ compact = false, onClick, className = '', markClassName = 'h-9 w-9', wordmarkClassName = '' }) {
  return (
    <Link href="/" onClick={onClick} className={`flex items-center gap-2.5 group ${className}`}>
      <span className={`bg-brand-gradient ${markClassName} rounded-xl text-white flex items-center justify-center shrink-0 shadow-elevate transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}>
        <IconLogoMark className="h-[55%] w-[55%]" />
      </span>
      {!compact && (
        <span className={`font-semibold text-slate-900 dark:text-slate-100 tracking-tight text-lg ${wordmarkClassName}`} style={{ fontFamily: 'var(--font-display)' }}>
          Manten<span className="text-brand-gradient">Pro</span>
        </span>
      )}
    </Link>
  )
}
