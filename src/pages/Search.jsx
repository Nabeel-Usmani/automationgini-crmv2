import { useEffect, useRef, useState } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { apiFetch } from '../lib/api'
import ProgressBar from '../components/ProgressBar'
import useActiveSearchJobs, { trackSearchJobs } from '../hooks/useActiveSearchJobs'

const PLATFORM_OPTIONS = ['Yelp', 'Facebook', 'Instagram', 'BBB', 'Nextdoor', 'Angi', 'Thumbtack', 'LinkedIn']

export default function Search() {
  const [niche, setNiche] = useState('')
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('US')
  const [countryQuery, setCountryQuery] = useState('')
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [cityQuery, setCityQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [selectedCities, setSelectedCities] = useState([])
  const [maxLeads, setMaxLeads] = useState(20)
  const [searchMode, setSearchMode] = useState('google_maps')
  const [minReviews, setMinReviews] = useState(1)
  const [maxReviews, setMaxReviews] = useState(15)
  const [maxRating, setMaxRating] = useState(4)
  const [platforms, setPlatforms] = useState([])
  const [businessType, setBusinessType] = useState('both')
  const [presenceGap, setPresenceGap] = useState('weak_presence')
  const [businessSize, setBusinessSize] = useState('any')
  const [minContactability, setMinContactability] = useState(true)
  const [reputationSignal, setReputationSignal] = useState(false)
  const [geoScope, setGeoScope] = useState('city')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const jobs = useActiveSearchJobs()

  useEffect(() => {
    apiFetch('/search/countries').then((list) => {
      setCountries(list)
      const initial = list.find((c) => c.iso2 === country)
      if (initial) setCountryQuery(`${initial.emoji} ${initial.name}`)
    }).catch(() => {})
  }, [])

  function selectCountry(c) {
    setCountry(c.iso2)
    setCountryQuery(`${c.emoji} ${c.name}`)
    setCountryDropdownOpen(false)
  }

  const filteredCountries = countryQuery.trim()
    ? countries.filter((c) => c.name.toLowerCase().includes(countryQuery.trim().toLowerCase()))
    : countries

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

  function togglePlatform(p) {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  }

  async function submit() {
    if (!niche.trim()) { setStatus('Enter a niche first.'); return }
    if (selectedCities.length === 0) { setStatus('Select at least one city.'); return }
    if (searchMode === 'other_platforms' && platforms.length === 0) { setStatus('Select at least one platform.'); return }
    setLoading(true)
    setStatus('Starting search...')
    try {
      const result = await apiFetch('/search/run', {
        method: 'POST',
        body: JSON.stringify({
          niche: niche.trim(), country, cities: selectedCities, max_leads: maxLeads,
          search_mode: searchMode,
          min_reviews: minReviews, max_reviews: maxReviews, max_rating: maxRating,
          platforms, business_type: businessType, presence_gap: presenceGap,
          business_size: businessSize, min_contactability: minContactability,
          reputation_signal: reputationSignal, geo_scope: geoScope,
        }),
      })
      setStatus(result.message)
      if (result.jobs?.length) {
        trackSearchJobs(result.jobs.map((j) => ({ ...j, niche: niche.trim(), target_leads: maxLeads })))
      }
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

        <div className="relative">
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Country</label>
          <input
            value={countryQuery}
            onChange={(e) => { setCountryQuery(e.target.value); setCountryDropdownOpen(true) }}
            onFocus={() => setCountryDropdownOpen(true)}
            placeholder="Type to search countries..."
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body"
          />
          {countryDropdownOpen && filteredCountries.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setCountryDropdownOpen(false)} />
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                {filteredCountries.slice(0, 50).map((c) => (
                  <button
                    key={c.iso2}
                    onClick={() => selectCountry(c)}
                    className="w-full text-left px-3 py-2 text-sm font-body text-navy hover:bg-slate-50"
                  >
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Cities (select multiple)</label>
          {selectedCities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedCities.map((c) => (
                <span key={c} className="flex items-center gap-1.5 text-xs font-semibold text-navy bg-slate-100 rounded-full px-3 py-1">
                  {c}
                  <button onClick={() => removeCity(c)} className="text-slate-400 hover:text-red-600"><X size={12} /></button>
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

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Search Mode</label>
          <select value={searchMode} onChange={(e) => setSearchMode(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body bg-white">
            <option value="google_maps">Google Maps</option>
            <option value="other_platforms">Other B2B, B2C Platforms</option>
          </select>
        </div>

        {searchMode === 'google_maps' ? (
          <>
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
          </>
        ) : (
          <>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Platforms</label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORM_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors ${platforms.includes(p) ? 'bg-navy text-white border-navy' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Business Type</label>
                <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body bg-white">
                  <option value="both">B2B & B2C</option>
                  <option value="b2b">B2B only</option>
                  <option value="b2c">B2C only</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Business Size</label>
                <select value={businessSize} onChange={(e) => setBusinessSize(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body bg-white">
                  <option value="any">Any size</option>
                  <option value="solo">Solo / owner-operator</option>
                  <option value="small_team">Small team</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Online Presence Gap</label>
                <select value={presenceGap} onChange={(e) => setPresenceGap(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body bg-white">
                  <option value="no_website">No website at all</option>
                  <option value="weak_presence">Weak presence overall</option>
                  <option value="no_social">No social media</option>
                  <option value="any">Any</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Geo Scope</label>
                <select value={geoScope} onChange={(e) => setGeoScope(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body bg-white">
                  <option value="city">City only</option>
                  <option value="metro">Metro area</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-body text-navy">
                <input type="checkbox" checked={minContactability} onChange={(e) => setMinContactability(e.target.checked)} className="accent-blue" />
                Require a phone number or email
              </label>
              <label className="flex items-center gap-2 text-sm font-body text-navy">
                <input type="checkbox" checked={reputationSignal} onChange={(e) => setReputationSignal(e.target.checked)} className="accent-blue" />
                Prefer businesses with some reputation signal elsewhere
              </label>
            </div>
          </>
        )}

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Max leads per city: {maxLeads}</label>
          <input type="range" min="20" max="100" step="20" value={maxLeads} onChange={(e) => setMaxLeads(Number(e.target.value))} className="w-full accent-blue" />
        </div>

        <button disabled={loading} onClick={submit} className="w-full flex items-center justify-center gap-2 font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg py-3 transition-colors">
          <SearchIcon size={16} /> Run Search
        </button>
        {status && <p className="font-body text-sm text-slate">{status}</p>}

        {jobs.length > 0 && (
          <div className="space-y-2 pt-1">
            {jobs.map((j) => (
              <div key={j.search_id}>
                <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                  {j.city} {j.status === 'running' ? '· searching...' : j.status === 'failed' ? '· failed to start' : '· done'}
                </p>
                <ProgressBar done={j.leads_found ?? 0} total={j.target_leads} />
              </div>
            ))}
            <p className="font-body text-xs text-slate">New leads will appear on the Map Leads page as they're found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
