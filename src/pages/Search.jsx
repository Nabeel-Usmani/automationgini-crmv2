import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function Search() {
  const [niche, setNiche] = useState('')
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('US')
  const [cityQuery, setCityQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [selectedCities, setSelectedCities] = useState([])
  const [maxLeads, setMaxLeads] = useState(20)
  const [minReviews, setMinReviews] = useState(1)
  const [maxReviews, setMaxReviews] = useState(15)
  const [maxRating, setMaxRating] = useState(4)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    apiFetch('/search/countries').then(setCountries).catch(() => {})
  }, [])

  useEffect(() => {
    setSelectedCities([])
    setCityQuery('')
    setCitySuggestions([])
  }, [country])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (cityQuery.trim().length < 2) { setCitySuggestions([]); return }
    debounceRef.current = setTimeout(() => {
      apiFetch(`/search/cities-autocomplete?country=${country}&query=${encodeURIComponent(cityQuery)}`)
        .then(setCitySuggestions)
        .catch(() => setCitySuggestions([]))
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [cityQuery, country])

  function addCity(city) {
    if (!selectedCities.includes(city)) setSelectedCities((c) => [...c, city])
    setCityQuery('')
    setCitySuggestions([])
  }

  function removeCity(city) {
    setSelectedCities((c) => c.filter((x) => x !== city))
  }

  async function submit() {
    if (!niche.trim()) { setStatus('Enter a niche first.'); return }
    if (selectedCities.length === 0) { setStatus('Select at least one city.'); return }
    setLoading(true)
    setStatus('Starting search...')
    try {
      const result = await apiFetch('/search/run', {
        method: 'POST',
        body: JSON.stringify({
          niche: niche.trim(), country, cities: selectedCities, max_leads: maxLeads,
          min_reviews: minReviews, max_reviews: maxReviews, max_rating: maxRating,
        }),
      })
      setStatus(result.message)
    } catch (e) {
      setStatus(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Run New Search</h1>
      <p className="font-body text-slate mb-6">Scans multiple sub-areas of each city automatically to find real, verified local businesses matching your target profile.</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Niche</label>
          <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Dental, HVAC, Landscaping" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body">
            {countries.map((c) => <option key={c.iso2} value={c.iso2}>{c.emoji} {c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Cities (select multiple)</label>
          {selectedCities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedCities.map((c) => (
                <span key={c} className="flex items-center gap-1.5 text-xs font-semibold text-navy bg-slate-100 rounded-full px-3 py-1">
                  {c}
                  <button onClick={() => removeCity(c)} className="text-slate-400 hover:text-red-600">✕</button>
                </span>
              ))}
            </div>
          )}
          <div className="relative">
            <input
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Start typing a city..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body"
            />
            {citySuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                {citySuggestions.map((s) => (
                  <button
                    key={s.full_text}
                    onClick={() => addCity(s.city)}
                    className="w-full text-left px-3 py-2 text-sm font-body text-navy hover:bg-slate-50"
                  >
                    {s.full_text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Min Reviews</label>
            <input type="number" min="0" value={minReviews} onChange={(e) => setMinReviews(Number(e.target.value))} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Max Reviews</label>
            <input type="number" min="0" value={maxReviews} onChange={(e) => setMaxReviews(Number(e.target.value))} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Max Rating (under this many stars)</label>
          <input type="number" min="0" max="5" step="0.1" value={maxRating} onChange={(e) => setMaxRating(Number(e.target.value))} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
          <p className="text-xs font-body text-slate-400 mt-1">Businesses with no website always pass through regardless of these criteria.</p>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Max leads per city: {maxLeads}</label>
          <input type="range" min="20" max="100" step="20" value={maxLeads} onChange={(e) => setMaxLeads(Number(e.target.value))} className="w-full accent-blue" />
        </div>

        <button disabled={loading} onClick={submit} className="w-full font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg py-3 transition-colors">
          🔍 Run Search
        </button>
        {status && <p className="font-body text-sm text-slate">{status}</p>}
      </div>
    </div>
  )
}
