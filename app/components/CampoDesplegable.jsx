'use client'
import { useState } from 'react'
import { IconAlertCircle } from './Icons'

const OTRO = '__otro__'

export default function CampoDesplegable({ etiqueta, valor, onChange, opciones, requerido, error }) {
  const [eligiendoOtro, setEligiendoOtro] = useState(() => !!valor && !opciones.includes(valor))

  function manejarSelect(v) {
    if (v === OTRO) {
      setEligiendoOtro(true)
      onChange('')
    } else {
      onChange(v)
    }
  }

  const claseCampo = `input-field ${error ? 'input-field-error' : ''}`

  return (
    <div>
      <label className="label-field">
        {etiqueta}
        {requerido && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {eligiendoOtro ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            className={claseCampo}
            placeholder={`Escribe ${etiqueta.toLowerCase()}`}
            autoFocus
          />
          <button
            type="button"
            onClick={() => { setEligiendoOtro(false); onChange('') }}
            className="btn btn-secondary btn-sm shrink-0"
            title="Volver a elegir de la lista"
          >
            Lista
          </button>
        </div>
      ) : (
        <select value={valor || ''} onChange={(e) => manejarSelect(e.target.value)} className={claseCampo}>
          <option value="">Seleccionar {etiqueta.toLowerCase()}</option>
          {opciones.map(o => <option key={o} value={o}>{o}</option>)}
          <option value={OTRO}>Otro (especificar)</option>
        </select>
      )}
      {error && (
        <p className="error-text">
          <IconAlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
