import { useState } from 'react'
import { apiFetch } from '../lib/api'

export default function Search() {
  const [niche, setNiche] = useState('')
  const [city, setCity] = useState('')
  const [maxLeads, setMaxLeads] = useState(100)
  const [status, setStatus] = useState('')

  async function submit() {
    if (!niche.trim() || !city.trim()) { setStatus('Enter both a niche and a city.'); return }
    setStatus('Starting search...')
    try {
      const result = await apiFetch('/search/run', { method: 'POST', body: JSON.stringify({ niche: niche.trim(), city: city.trim(), max_leads: maxLeads }) })
      setStatus(result.message)
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Run New Search</h1>
      <p className="font-body text-slate mb-6">Scans multiple sub-areas of a city automatically to find real, verified local businesses.</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Niche</label>
          <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Dental, HVAC, Solar" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Miami, Dallas" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Max leads: {maxLeads}</label>
          <input type="range" min="20" max="100" step="20" value={maxLeads} onChange={(e) => setMaxLeads(Number(e.target.value))} className="w-full accent-blue" />
        </div>
        <button onClick={submit} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-5 py-2.5 transition-colors">🔍 Run Search</button>
        {status && <p className="font-body text-sm text-slate">{status}</p>}
      </div>
    </div>
  )
}
