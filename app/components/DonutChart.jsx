export default function DonutChart({ data, size = 168, thickness = 20, centerValue, centerLabel }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  let acumulado = 0

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
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
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          )
        })}
      </svg>
      {centerValue !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
            {centerValue}
          </span>
          {centerLabel && <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}
