import { IconAlertCircle } from './Icons'

export default function Campo({ etiqueta, valor, onChange, tipo = 'text', children, sugerencias, requerido, error }) {
  const listId = sugerencias ? `lista-${etiqueta.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined
  const claseCampo = `input-field ${error ? 'input-field-error' : ''}`

  return (
    <div>
      <label className="label-field">
        {etiqueta}
        {requerido && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {tipo === 'select' ? (
        <select value={valor} onChange={(e) => onChange(e.target.value)} className={claseCampo}>
          {children}
        </select>
      ) : (
        <>
          <input
            type={tipo}
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            className={claseCampo}
            list={listId}
            placeholder={sugerencias ? 'Selecciona o escribe uno nuevo' : undefined}
          />
          {sugerencias && sugerencias.length > 0 && (
            <datalist id={listId}>
              {sugerencias.map(s => <option key={s} value={s} />)}
            </datalist>
          )}
        </>
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
