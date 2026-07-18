import { IconUser, IconCalendar, IconMapPin, IconClock, IconTrash } from './Icons'

export default function HistorialItem({ registro, mostrarEquipo = false, ubicacion, onEliminar }) {
  const lugar = ubicacion ?? registro.equipos?.ubicacion

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <span className="icon-tile h-10 w-10 bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
            <IconClock className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {mostrarEquipo && <h3 className="font-medium text-slate-900">{registro.equipos?.nombre}</h3>}
              <span className="badge-indigo">{registro.tipo}</span>
            </div>
            {registro.descripcion && (
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{registro.descripcion}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-500">
              {registro.tecnico && (
                <span className="inline-flex items-center gap-1">
                  <IconUser className="h-3.5 w-3.5" /> {registro.tecnico}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <IconCalendar className="h-3.5 w-3.5" /> {new Date(registro.fecha).toLocaleDateString('es-CO')}
              </span>
              {lugar && (
                <span className="inline-flex items-center gap-1">
                  <IconMapPin className="h-3.5 w-3.5" /> {lugar}
                </span>
              )}
            </div>
          </div>
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
    </div>
  )
}
