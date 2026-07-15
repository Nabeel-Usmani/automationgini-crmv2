import { useState } from 'react'

export default function FilterPopover({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const allSelected = options.length > 0 && selected.length === options.length
  const summary = options.length === 0 ? '—'
    : allSelected ? 'All'
    : selected.length === 0 ? 'None'
    : selected.length === 1 ? selected[0]
    : `${selected.length} selected`

  const visible = search ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase())) : options
  const exactMatch = options.find((o) => o.toLowerCase() === search.toLowerCase().trim())

  function toggle(opt) {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt])
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-body text-navy hover:border-blue transition-colors"
      >
        <span className="truncate">{label ? `${label}: ${summary}` : summary}</span>
        <span className="text-slate-400 ml-2">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3">
            <div className="flex gap-2 mb-2">
              <button onClick={() => onChange([...options])} className="flex-1 text-xs font-semibold text-slate bg-slate-50 hover:bg-slate-100 rounded-lg py-1.5">Select all</button>
              <button onClick={() => onChange([])} className="flex-1 text-xs font-semibold text-slate bg-slate-50 hover:bg-slate-100 rounded-lg py-1.5">Clear all</button>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 mb-2 font-body"
            />
            {exactMatch && (
              <button
                onClick={() => { onChange([exactMatch]); setOpen(false) }}
                className="w-full text-xs font-semibold text-blue bg-blue/10 hover:bg-blue/20 rounded-lg py-1.5 mb-2"
              >
                ✅ Show only "{exactMatch}"
              </button>
            )}
            <div className="max-h-56 overflow-y-auto space-y-1">
              {visible.map((opt) => (
                <label key={opt} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-slate-50 cursor-pointer text-sm font-body text-navy">
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="accent-blue" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
