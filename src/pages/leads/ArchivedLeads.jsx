import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import EmptyState from '../../components/EmptyState'

export default function ArchivedLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState(new Set())

  function refresh() {
    setLoading(true)
    apiFetch('/leads/archived').then((data) => setLeads(data || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function bulkUnarchive() {
    const ids = Array.from(selectedIds)
    setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)))
    setSelectedIds(new Set())
    try {
      await apiFetch('/leads/bulk-unarchive', { method: 'POST', body: JSON.stringify({ lead_ids: ids }) })
    } catch {
      refresh()
    }
  }

  async function bulkDelete() {
    const ids = Array.from(selectedIds)
    if (!window.confirm(`Permanently delete ${ids.length} lead(s)? This can't be undone.`)) return
    setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)))
    setSelectedIds(new Set())
    try {
      await apiFetch('/leads/bulk-delete', { method: 'POST', body: JSON.stringify({ lead_ids: ids }) })
    } catch {
      refresh()
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Archived Leads</h1>
      <p className="font-body text-slate mb-6">Leads you've archived — restore them anytime, or delete permanently.</p>

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-navy text-white rounded-xl px-4 py-2.5 mb-4">
          <span className="text-sm font-semibold">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={bulkUnarchive} className="text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5">
              ↩️ Restore
            </button>
            <button onClick={bulkDelete} className="text-xs font-semibold bg-red-500/80 hover:bg-red-500 rounded-lg px-3 py-1.5">
              🗑️ Delete Permanently
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="font-body text-slate">Loading...</p>
      ) : leads.length === 0 ? (
        <EmptyState icon="📦" title="No archived leads" subtitle="Leads you archive from Map Leads will show up here." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 w-8"></th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-3">Business</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-3">City</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3.5">
                    <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="accent-blue" />
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-body font-semibold text-navy">{lead.business_name}</p>
                    <p className="font-body text-xs text-slate">{lead.niche}</p>
                  </td>
                  <td className="px-4 py-3.5 font-body text-sm text-slate">{lead.city}, {lead.country}</td>
                  <td className="px-4 py-3.5 font-body text-sm text-slate">{lead.phone_number || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
