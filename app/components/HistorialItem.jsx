import { IconClock, IconTrash } from './Icons'

function Fila({ label, valor, negrilla }) {
  if (!valor) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-28 shrink-0 text-slate-400 dark:text-slate-500">{label}:</span>
      <span className={negrilla ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}>{valor}</span>
    </div>
  )
}

export default function HistorialItem({ registro, mostrarEquipo = false, ubicacion, onEliminar }) {
  const lugar = ubicacion ?? registro.equipos?.ubicacion

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="icon-tile h-9 w-9 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
            <IconClock className="h-4 w-4" />
          </span>
          {mostrarEquipo && <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">{registro.equipos?.nombre}</h3>}
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-2">
          {registro.costo && <span className="badge-emerald">${registro.costo}</span>}
          {onEliminar && (
            <button
              onClick={() => onEliminar(registro.id)}
              className="flex items-center gap-1 text-rose-600 text-xs font-medium hover:underline"
            >
              <IconTrash className="h-3 w-3" />
              Eliminar
            </button>
          )}
        </div>
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-1.5">
        <Fila label="Tipo mant." valor={registro.tipo} negrilla />
        <Fila label="Descripción" valor={registro.descripcion} />
        <Fila label="Técnico" valor={registro.tecnico} />
        <Fila label="Fecha" valor={new Date(registro.fecha).toLocaleDateString('es-CO')} />
        <Fila label="Ubicación" valor={lugar} />
      </div>
    </div>
  )
}
