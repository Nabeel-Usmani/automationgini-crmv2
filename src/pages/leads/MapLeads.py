import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import FilterPopover from '../../components/FilterPopover'
import EmptyState from '../../components/EmptyState'

export default function MapLeads() {
  const [leads, setLeads] = useState([])
  const [options, setOptions] = useState({ niches: [], countries: [], cities: [], statuses: [] })
  const [filters, setFilters] = useState({ niches: [], countries: [], cities: [], statuses: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/leads/filter-options').then((o) => {
      setOptions(o)
      setFilters({ niches: o.niches, countries: o.countries, cities: o.cities, statuses: o.statuses })
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    apiFetch('/leads').then((data) => setLeads(data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = leads.filter((l) =>
    (filters.niches.length === 0 || filters.niches.includes(l.niche)) &&
    (filters.countries.length === 0 || filters.countries.includes(l.country)) &&
    (filters.cities.length === 0 || filters.cities.includes(l.city)) &&
    (filters.statuses.length === 0 || filters.statuses.includes(l.call_status))
  )

  async function callLead(lead) {
    try { await apiFetch(`/dashboard/log-call?lead_id=${lead.id}`, { method: 'POST' }) } catch {}
    window.open(`tel:${lead.phone_number}`, '_blank')
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Map Leads</h1>
      <p className="font-body text-slate mb-6">Every lead scraped from Google Maps, filterable by location and niche.</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <FilterPopover label="Niche" options={options.niches} selected={filters.niches} onChange={(v) => setFilters((f) => ({ ...f, niches: v }))} />
        <FilterPopover label="Country" options={options.countries} selected={filters.countries} onChange={(v) => setFilters((f) => ({ ...f, countries: v }))} />
        <FilterPopover label="City" options={options.cities} selected={filters.cities} onChange={(v) => setFilters((f) => ({ ...f, cities: v }))} />
        <FilterPopover label="Status" options={options.statuses} selected={filters.statuses} onChange={(v) => setFilters((f) => ({ ...f, statuses: v }))} />
      </div>

      <p className="font-mono text-xs text-slate-400 mb-3">{filtered.length} of {leads.length} leads shown</p>

      {loading ? (
        <p className="font-body text-slate">Loading...</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🗺️" title="No leads match your filters" subtitle="Try widening your filters, or run a new search." />
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div key={lead.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="font-body font-semibold text-navy">{lead.business_name}</p>
                <p className="font-body text-sm text-slate">{lead.niche} · {lead.city}, {lead.country}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {lead.total_score && <span className="text-xs font-mono text-amber-600">★ {lead.total_score} ({lead.review_count})</span>}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lead.source === 'custom_url' ? 'bg-blue/10 text-blue' : 'bg-slate-100 text-slate'}`}>
                    {lead.source === 'custom_url' ? 'Custom' : 'Gini'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-body text-sm text-navy">{lead.website_status === 'NO WEBSITE DETECTED' ? '🚫 No website' : `🌐 ${lead.website_status}`}</p>
                  <p className="font-mono text-xs text-slate-400">{lead.call_status}</p>
                </div>
                {lead.phone_number && (
                  <button
                    onClick={() => callLead(lead)}
                    className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-4 py-2 transition-colors"
                  >
                    📞 Call
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
