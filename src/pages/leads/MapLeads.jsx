import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import FilterPopover from '../../components/FilterPopover'
import EmptyState from '../../components/EmptyState'

export default function MapLeads() {
  const [leads, setLeads] = useState([])
  const [options, setOptions] = useState({ niches: [], countries: [], cities: [], statuses: [] })
  const [filters, setFilters] = useState({ niches: [], countries: [], cities: [], statuses: [] })
  const [highPotentialOnly, setHighPotentialOnly] = useState(false)
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
    (filters.statuses.length === 0 || filters.statuses.includes(l.call_status)) &&
    (!highPotentialOnly || l.is_high_potential)
  )

  async function callLead(lead) {
    try { await apiFetch(`/dashboard/log-call?lead_id=${lead.id}`, { method: 'POST' }) } catch {}
    window.open(`tel:${lead.phone_number}`, '_blank')
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Map Leads</h1>
      <p className="font-body text-slate mb-6">Every lead scraped from Google Maps, filterable by location and niche.</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <FilterPopover label="Niche" options={options.niches} selected={filters.niches} onChange={(v) => setFilters((f) => ({ ...f, niches: v }))} />
        <FilterPopover label="Country" options={options.countries} selected={filters.countries} onChange={(v) => setFilters((f) => ({ ...f, countries: v }))} />
        <FilterPopover label="City" options={options.cities} selected={filters.cities} onChange={(v) => setFilters((f) => ({ ...f, cities: v }))} />
        <FilterPopover label="Status" options={options.statuses} selected={filters.statuses} onChange={(v) => setFilters((f) => ({ ...f, statuses: v }))} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setHighPotentialOnly((v) => !v)}
          className={`flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors ${
            highPotentialOnly ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-white border border-slate-200 text-slate hover:border-amber-300'
          }`}
        >
          🎯 High-Potential Only
        </button>
        <p className="font-mono text-xs text-slate-400">{filtered.length} of {leads.length} leads shown</p>
      </div>

      {loading ? (
        <p className="font-body text-slate">Loading...</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🗺️" title="No leads match your filters" subtitle="Try widening your filters, or run a new search." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-3">Business</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-3">Rating</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-3">Phone</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-3">Website</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-3">Email</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {lead.is_high_potential && (
                        <span title="High potential: 1-15 reviews, under 4 stars" className="text-amber-500">🎯</span>
                      )}
                      <div>
                        <p className="font-body font-semibold text-navy">{lead.business_name}</p>
                        <p className="font-body text-xs text-slate">{lead.niche} · {lead.city}, {lead.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {lead.total_score ? (
                      <span className="font-mono text-xs text-amber-600">★ {lead.total_score} ({lead.review_count})</span>
                    ) : (
                      <span className="font-mono text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {lead.phone_number ? (
                      <button
                        onClick={() => callLead(lead)}
                        className="flex items-center gap-1.5 font-body text-sm text-navy hover:text-blue transition-colors"
                      >
                        📞 {lead.phone_number}
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {lead.website_status === 'NO WEBSITE DETECTED' ? (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2.5 py-1">🚫 No Website</span>
                    ) : (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noreferrer"
                        className="font-body text-sm text-blue hover:underline"
                      >
                        🌐 Visit site
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="font-body text-sm text-blue hover:underline">
                        {lead.email}
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${lead.source === 'custom_url' ? 'bg-blue/10 text-blue' : 'bg-slate-100 text-slate'}`}>
                      {lead.call_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
