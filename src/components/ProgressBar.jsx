export default function ProgressBar({ done, total, className = '' }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-blue rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-slate-400 tabular-nums">{pct}%</span>
    </div>
  )
}
