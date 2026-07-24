export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  const isComponent = typeof Icon === 'function'
  return (
    <div className="text-center py-16 px-6 bg-white border border-dashed border-slate-300 rounded-2xl">
      <div className={`mb-3 flex items-center justify-center ${isComponent ? 'text-slate-300' : 'text-4xl opacity-60'}`}>
        {isComponent ? <Icon size={36} strokeWidth={1.5} /> : Icon}
      </div>
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
