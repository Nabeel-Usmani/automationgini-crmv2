export default function MetricCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      <p className="font-display font-semibold text-xl text-navy">{value ?? '—'}</p>
    </div>
  )
}
