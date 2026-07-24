export default function BarList({ items, color = '#2563eb' }) {
  const max = Math.max(...items.map(i => i.value), 1)

  return (
    <div className="flex flex-col gap-3.5">
      {items.map(item => (
        <div key={item.label}>
          <div className="flex items-center justify-between gap-2 text-sm mb-1.5">
            <span className="text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums shrink-0">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
