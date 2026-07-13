export default function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`text-sm font-body font-semibold px-4 py-2 rounded-lg transition-colors ${active ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate hover:border-blue'}`}>
      {children}
    </button>
  )
}
