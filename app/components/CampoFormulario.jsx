export default function Campo({ etiqueta, valor, onChange, tipo = 'text', children, sugerencias }) {
  const listId = sugerencias ? `lista-${etiqueta.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined

  return (
    <div>
      <label className="label-field">{etiqueta}</label>
      {tipo === 'select' ? (
        <select value={valor} onChange={(e) => onChange(e.target.value)} className="input-field">
          {children}
        </select>
      ) : (
        <>
          <input
            type={tipo}
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            className="input-field"
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
    </div>
  )
}
