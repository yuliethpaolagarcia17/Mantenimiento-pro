export default function DonutChart({ data, size = 168, thickness = 20 }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  let acumulado = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={thickness}
        className="stroke-slate-100 dark:stroke-slate-800"
      />
      {total > 0 && data.map((d) => {
        if (!d.value) return null
        const frac = d.value / total
        const dash = frac * circumference
        const offset = -acumulado * circumference
        acumulado += frac
        return (
          <circle
            key={d.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        )
      })}
    </svg>
  )
}
