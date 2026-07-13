import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function LeadPicker({ onSelect, requirePhone = false, onCustomListingCreated }) {
  const [leads, setLeads] = useState([])
  const [sourceFilter, setSourceFilter] = useState('all')
  const [selectedId, setSelectedId] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [customPhone, setCustomPhone] = useState('')
  const [customLoading, setCustomLoading] = useState(false)
  const [customMessage, setCustomMessage] = useState('')

  function refresh() {
    apiFetch('/leads').then((data) => setLeads(data || [])).catch(() => {})
  }

  useEffect(() => { refresh() }, [])

  const filtered = leads
    .filter((l) => sourceFilter === 'all' || l.source === sourceFilter)
    .filter((l) => !requirePhone || (l.phone_number && l.phone_number.trim()))

  useEffect(() => {
    if (filtered.length && !selectedId) setSelectedId(String(filtered[0].id))
  }, [filtered.length])

  async function submitCustomListing() {
    if (!customUrl.trim()) return
    setCustomLoading(true)
    setCustomMessage('')
    try {
      const result = await apiFetch('/leads/custom-listing', {
        method: 'POST',
        body: JSON.stringify({ url: customUrl.trim(), manual_phone: customPhone.trim() || null }),
      })
      setCustomMessage(`Created: ${result.business_name || 'Listing'}`)
      refresh()
      if (result.id) {
        setSelectedId(String(result.id))
        onCustomListingCreated?.(result.id)
      }
    } catch (e) {
      setCustomMessage(e.message)
    } finally {
      setCustomLoading(false)
    }
  }

  const selectedLead = leads.find((l) => String(l.id) === selectedId)

  useEffect(() => {
    if (selectedLead) onSelect(selectedLead)
  }, [selectedId])

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowCustom((s) => !s)}
        className="text-sm font-body font-semibold text-navy bg-white border border-slate-200 rounded-lg px-3.5 py-2 hover:border-blue transition-colors"
      >
        🔗 Add Custom Listing (any business URL) {showCustom ? '▴' : '▾'}
      </button>

      {showCustom && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-body text-slate">Not from our platform? Paste any business website and we'll build a lead from it.</p>
          <input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-body"
          />
          <input
            value={customPhone}
            onChange={(e) => setCustomPhone(e.target.value)}
            placeholder="Phone (only if we can't find one on the site)"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-body"
          />
          <button
            onClick={submitCustomListing}
            disabled={customLoading}
            className="text-sm font-body font-semibold text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg px-4 py-2 transition-colors"
          >
            {customLoading ? 'Reading the site...' : 'Create Listing'}
          </button>
          {customMessage && <p className="text-xs font-body text-slate">{customMessage}</p>}
        </div>
      )}

      <div className="flex gap-2">
        {['all', 'platform', 'custom_url'].map((s) => (
          <button
            key={s}
            onClick={() => setSourceFilter(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              sourceFilter === s ? 'bg-navy text-white' : 'bg-slate-100 text-slate hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? 'All' : s === 'platform' ? '🗺️ Gini Leads' : '🔗 Custom Leads'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm font-body text-slate">No leads yet — run a search or add a custom listing above.</p>
      ) : (
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body"
        >
          {filtered.map((l) => (
            <option key={l.id} value={l.id}>{l.business_name} — {l.niche} · {l.city}</option>
          ))}
        </select>
      )}
    </div>
  )
}
