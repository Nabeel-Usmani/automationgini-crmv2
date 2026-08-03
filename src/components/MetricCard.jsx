export default function MetricCard({ label, value, onClick, active }) {
  const content = (
    <>
      <p className={`font-mono text-[11px] uppercase tracking-wide mb-1 ${active ? 'text-blue' : 'text-slate-400'}`}>{label}</p>
      <p className="font-display font-semibold text-xl text-navy">{value ?? '—'}</p>
    </>
  )

  if (!onClick) {
    return <div className="bg-white border border-slate-200 rounded-2xl p-4">{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full bg-white border rounded-2xl p-4 transition-colors hover:border-blue/50 cursor-pointer ${
        active ? 'border-blue ring-2 ring-blue/20' : 'border-slate-200'
      }`}
    >
      {content}
    </button>
  )
}
