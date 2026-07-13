export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="text-center py-16 px-6 bg-white border border-dashed border-slate-300 rounded-2xl">
      <div className="text-4xl mb-3 opacity-60">{icon}</div>
      <p className="font-body font-semibold text-navy mb-1">{title}</p>
      {subtitle && <p className="font-body text-sm text-slate max-w-md mx-auto mb-4">{subtitle}</p>}
      {actionLabel && (
        <button
          onClick={onAction}
          className="font-body font-semibold text-sm text-white bg-blue hover:bg-blue-light rounded-lg px-5 py-2.5 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
