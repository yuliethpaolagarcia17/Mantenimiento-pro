import { IconShieldCheck } from './Icons'

export default function AccesoRestringido({ mensaje = 'No tienes permiso para acceder a esta sección.' }) {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 w-full">
      <div className="card border-dashed p-10 text-center flex flex-col items-center animate-fade-up">
        <span className="icon-tile h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
          <IconShieldCheck className="h-6 w-6" />
        </span>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Acceso restringido</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-sm">{mensaje}</p>
      </div>
    </div>
  )
}
