import { useEffect, useState } from 'react'
import { Target, Archive, Trash2, Phone, Ban, Globe, Layers, RefreshCw } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import FilterPopover from '../../components/FilterPopover'
import EmptyState from '../../components/EmptyState'
import ProgressBar from '../../components/ProgressBar'
import useActiveSearchJobs from '../../hooks/useActiveSearchJobs'

const STATUS_OPTIONS = ['New', 'Called', 'Interested', 'Not Interested', 'Follow-up']

const STATUS_COLORS = {
  'New': 'bg-slate-100 text-slate',
  'Called': 'bg-blue/10 text-blue',
  'Interested': 'bg-green-100 text-green-700',
  'Not Interested': 'bg-red-100 text-red-700',
  'Follow-up': 'bg-amber-100 text-amber-800',
}

const TIER_COLORS = {
  'Hot': 'bg-red-100 text-red-700',
  'Warm': 'bg-amber-100 text-amber-800',
  'Cold': 'bg-slate-100 text-slate',
}

// A category with everything (or nothing yet) selected stays "All" as new
// values show up; a category the user has narrowed keeps their picks but
// still gains newly-discovered values so fresh leads aren't hidden.
function mergeFilterOptions(prevOptions, prevFilters, newOptions) {
  const mergeCategory = (prevOpts, prevSel, newOpts) => {
    const hadAllSelected = prevOpts.length === 0 || prevSel.length === prevOpts.length
    if (hadAllSelected) return newOpts
    const newlyAdded = newOpts.filter((o) => !prevOpts.includes(o))
    return [...prevSel.filter((s) => newOpts.includes(s)), ...newlyAdded]
  }
  return {
    niches: mergeCategory(prevOptions.niches, prevFilters.niches, newOptions.niches),
    countries: mergeCategory(prevOptions.countries, prevFilters.countries, newOptions.countries),
    cities: mergeCategory(prevOptions.cities, prevFilters.cities, newOptions.cities),
    statuses: mergeCategory(prevOptions.statuses, prevFilters.statuses, newOptions.statuses),
  }
}

export default function OtherPlatformsLeads() {
  const [leads, setLeads] = useState([])
  const [options, setOptions] = useState({ niches: [], countries: [], cities: [], statuses: STATUS_OPTIONS })
  const [filters, setFilters] = useState({ niches: [], countries: [], cities: [], statuses: [] })
  const [phoneFilter, setPhoneFilter] = useState('all')
  const [websiteFilter, setWebsiteFilter] = useState('all')
  const [emailFilter, setEmailFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [businessSearch, setBusinessSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllVisible() {
    setSelectedIds(new Set(filtered.map((l) => l.id)))
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  async function bulkArchive() {
    const ids = Array.from(selectedIds)
    setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)))
    clearSelection()
    try {
      await apiFetch('/leads/bulk-archive', { method: 'POST', body: JSON.stringify({ lead_ids: ids }) })
    } catch {
      refresh()
    }
  }

  async function bulkDelete() {
    const ids = Array.from(selectedIds)
    if (!window.confirm(`Delete ${ids.length} lead(s)? This can't be undone.`)) return
    setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)))
    clearSelection()
    try {
      await apiFetch('/leads/bulk-delete', { method: 'POST', body: JSON.stringify({ lead_ids: ids }) })
    } catch {
      refresh()
    }
  }
  const [loading, setLoading] = useState(true)

  function refresh() {
    setLoading(true)
    apiFetch('/leads?channel=other_platforms').then((data) => setLeads(data || [])).catch(() => {}).finally(() => setLoading(false))
  }

  function loadFilterOptions() {
    apiFetch('/leads/filter-options?channel=other_platforms').then((o) => {
      setFilters((prevFilters) => mergeFilterOptions(options, prevFilters, o))
      setOptions(o)
    }).catch(() => {})
  }

  useEffect(() => {
    apiFetch('/leads/filter-options?channel=other_platforms').then((o) => {
      setOptions(o)
      setFilters({ niches: o.niches, countries: o.countries, cities: o.cities, statuses: o.statuses })
    }).catch(() => {})
  }, [])

  useEffect(() => { refresh() }, [])

  function refreshAll() {
    refresh()
    loadFilterOptions()
  }

  const jobs = useActiveSearchJobs(refreshAll)

  const filtered = leads.filter((l) =>
    (filters.niches.length === 0 || filters.niches.includes(l.niche)) &&
    (filters.countries.length === 0 || filters.countries.includes(l.country)) &&
    (filters.cities.length === 0 || filters.cities.includes(l.city)) &&
    (filters.statuses.length === 0 || filters.statuses.includes(l.call_status)) &&
    (!businessSearch.trim() || l.business_name.toLowerCase().includes(businessSearch.trim().toLowerCase())) &&
    (phoneFilter === 'all' || (phoneFilter === 'has' ? !!l.phone_number : !l.phone_number)) &&
    (websiteFilter === 'all' || (websiteFilter === 'has' ? l.website_status !== 'NO WEBSITE DETECTED' : l.website_status === 'NO WEBSITE DETECTED')) &&
    (emailFilter === 'all' || (emailFilter === 'has' ? !!l.email : !l.email)) &&
    (tierFilter === 'all' || l.qualification_tier === tierFilter)
  )

  async function callLead(lead) {
    try { await apiFetch(`/dashboard/log-call?lead_id=${lead.id}`, { method: 'POST' }) } catch {}
    window.open(`tel:${lead.phone_number}`, '_blank')
  }

  async function changeStatus(leadId, status) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, call_status: status } : l)))
    try {
      await apiFetch(`/leads/${leadId}/status?status=${encodeURIComponent(status)}`, { method: 'POST' })
    } catch {
      refresh()
    }
  }

  async function deleteLead(leadId, businessName) {
    if (!window.confirm(`Delete "${businessName}"? This can't be undone.`)) return
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
    try {
      await apiFetch(`/leads/${leadId}`, { method: 'DELETE' })
    } catch {
      refresh()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Other Platforms Leads</h1>
      <p className="font-body text-slate mb-6">Every lead sourced from Yelp, Facebook, BBB, and other B2B/B2C platforms, filterable by location and niche.</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <FilterPopover label="Niche" options={options.niches} selected={filters.niches} onChange={(v) => setFilters((f) => ({ ...f, niches: v }))} />
        <FilterPopover label="Country" options={options.countries} selected={filters.countries} onChange={(v) => setFilters((f) => ({ ...f, countries: v }))} />
        <FilterPopover label="City" options={options.cities} selected={filters.cities} onChange={(v) => setFilters((f) => ({ ...f, cities: v }))} />
      </div>

      {jobs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 space-y-2.5">
          {jobs.map((j) => (
            <div key={j.search_id}>
              <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                {j.niche} · {j.city} {j.status === 'running' ? '· searching...' : j.status === 'failed' ? '· failed to start' : '· done'}
              </p>
              <ProgressBar done={j.leads_found ?? 0} total={j.target_leads} />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-3">
          <p className="font-mono text-xs text-slate-400">{filtered.length} of {leads.length} leads shown</p>
          <button
            onClick={refreshAll}
            disabled={loading}
            title="Refresh leads"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate bg-white border border-slate-200 hover:border-blue hover:text-blue disabled:opacity-60 rounded-lg px-3 py-1.5 transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-navy text-white rounded-xl px-4 py-2.5 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{selectedIds.size} selected</span>
            {selectedIds.size < filtered.length && (
              <button onClick={selectAllVisible} className="text-xs font-semibold text-blue-light hover:underline">
                Select all {filtered.length}
              </button>
            )}
            <button onClick={clearSelection} className="text-xs font-semibold text-white/70 hover:text-white hover:underline">
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={bulkArchive} className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5">
              <Archive size={13} /> Archive
            </button>
            <button onClick={bulkDelete} className="flex items-center gap-1.5 text-xs font-semibold bg-red-500/80 hover:bg-red-500 rounded-lg px-3 py-1.5">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="font-body text-slate">Loading...</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Layers} title="No leads match your filters" subtitle="Try widening your filters, or run a new Other Platforms search." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={(e) => (e.target.checked ? selectAllVisible() : clearSelection())}
                    className="accent-blue"
                  />
                </th>
                <th className="text-left px-4 py-2.5">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500 mb-1">Business</p>
                  <input
                    value={businessSearch}
                    onChange={(e) => setBusinessSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1 font-body"
                  />
                </th>
                <th className="text-left px-4 py-2.5">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500 mb-1">Phone</p>
                  <select value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)} className="text-xs border border-slate-200 rounded px-1.5 py-1 font-body">
                    <option value="all">All</option>
                    <option value="has">Has phone</option>
                    <option value="none">No phone</option>
                  </select>
                </th>
                <th className="text-left px-4 py-2.5">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500 mb-1">Website</p>
                  <select value={websiteFilter} onChange={(e) => setWebsiteFilter(e.target.value)} className="text-xs border border-slate-200 rounded px-1.5 py-1 font-body">
                    <option value="all">All</option>
                    <option value="has">Has website</option>
                    <option value="none">No website</option>
                  </select>
                </th>
                <th className="text-left px-4 py-2.5">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500 mb-1">Email</p>
                  <select value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} className="text-xs border border-slate-200 rounded px-1.5 py-1 font-body">
                    <option value="all">All</option>
                    <option value="has">Has email</option>
                    <option value="none">No email</option>
                  </select>
                </th>
                <th className="text-left px-4 py-2.5">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500 mb-1">Qualification</p>
                  <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="text-xs border border-slate-200 rounded px-1.5 py-1 font-body">
                    <option value="all">All</option>
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </select>
                </th>
                <th className="text-left px-4 py-2.5">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500 mb-1">Status</p>
                  <FilterPopover label="" options={options.statuses} selected={filters.statuses} onChange={(v) => setFilters((f) => ({ ...f, statuses: v }))} />
                </th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      className="accent-blue"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-body font-semibold text-navy">{lead.business_name}</p>
                    <p className="font-body text-xs text-slate">{lead.niche} · {lead.city}, {lead.country}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    {lead.phone_number ? (
                      <button
                        onClick={() => callLead(lead)}
                        className="flex items-center gap-1.5 font-body text-sm text-navy hover:text-blue transition-colors"
                      >
                        <Phone size={13} /> {lead.phone_number}
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {lead.website_status === 'NO WEBSITE DETECTED' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2.5 py-1">
                        <Ban size={12} /> No Website
                      </span>
                    ) : (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-body text-sm text-blue hover:underline"
                      >
                        <Globe size={13} /> Visit site
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
                    {lead.social_links && (
                      <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {lead.social_links.split(',').filter(Boolean).length} social profile{lead.social_links.split(',').filter(Boolean).length === 1 ? '' : 's'} found
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {lead.qualification_tier ? (
                      <span
                        title={lead.qualification_notes || ''}
                        className={`inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 ${TIER_COLORS[lead.qualification_tier] || 'bg-slate-100 text-slate'}`}
                      >
                        {lead.qualification_tier}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={lead.call_status}
                      onChange={(e) => changeStatus(lead.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer ${STATUS_COLORS[lead.call_status] || 'bg-slate-100 text-slate'}`}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => deleteLead(lead.id, lead.business_name)}
                      title="Delete this lead"
                      className="text-slate-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
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
