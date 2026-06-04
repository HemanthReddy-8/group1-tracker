export default function StatsGrid({ stats }) {
  return (
    <div className={`grid gap-3 ${stats.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl p-3 text-center shadow-sm"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="text-lg font-semibold" style={{ color: '#1a1a18' }}>{s.value}</div>
          <div className="text-xs mt-0.5" style={{ color: '#6b6a65' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
