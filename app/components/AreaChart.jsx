export default function AreaChart({ data, color = '#2563eb', height = 140, viewWidth = 480 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const padTop = 16
  const padBottom = 28
  const usable = height - padTop - padBottom
  const stepX = data.length > 1 ? viewWidth / (data.length - 1) : 0

  const points = data.map((d, i) => {
    const x = i * stepX
    const y = padTop + usable - (d.value / max) * usable
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L ${viewWidth},${height - padBottom} L 0,${height - padBottom} Z`
  const gradId = `areaGrad-${color.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${viewWidth} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(f => (
        <line
          key={f}
          x1="0" x2={viewWidth}
          y1={padTop + usable * f} y2={padTop + usable * f}
          className="stroke-slate-100 dark:stroke-slate-800"
          strokeWidth="1"
        />
      ))}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-out" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} className="drop-shadow-sm" />
      ))}
      {data.map((d, i) => (
        <text
          key={d.label}
          x={points[i].x}
          y={height - 8}
          textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
          className="fill-slate-400 dark:fill-slate-500"
          style={{ fontSize: 11 }}
        >
          {d.label}
        </text>
      ))}
    </svg>
  )
}
