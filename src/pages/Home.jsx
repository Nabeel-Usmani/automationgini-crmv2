import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts'
import { getDashboardSummary, getFilterOptions, getCityCoordinates } from '../lib/api'
import 'leaflet/dist/leaflet.css'

export default function Home({ user }) {
  const [filters, setFilters] = useState({ date_from: '', date_to: '', niche: '', country: '', city: '' })
  const [options, setOptions] = useState({ niches: [], countries: [], cities: [] })
  const [summary, setSummary] = useState(null)
  const [coords, setCoords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {})
    getCityCoordinates().then(setCoords).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    getDashboardSummary(filters)
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filters])

  const update = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.value }))

  const cityLeadCounts = summary?.leads_by_city || []
  const maxCount = Math.max(1, ...cityLeadCounts.map((c) => c.n))

  const mapPoints = cityLeadCounts
    .map((c) => {
      const match = coords.find((co) => co.city === c.city && co.country === c.country)
      return match ? { ...c, lat: match.lat, lng: match.lng } : null
    })
    .filter(Boolean)

  const mapCenter = mapPoints.length ? [mapPoints[0].lat, mapPoints[0].lng] : [20, 0]

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">
        {user?.role === 'agent' ? 'Your Overview' : 'Overview'}
      </h1>
      <p className="font-body text-slate mb-6">
        {user?.role === 'agent' ? 'Your own activity across leads, demos, and calls.' : 'Everything across your account.'}
      </p>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">From</label>
          <input type="date" value={filters.date_from} onChange={update('date_from')} className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 font-body" />
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">To</label>
          <input type="date" value={filters.date_to} onChange={update('date_to')} className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 font-body" />
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Niche</label>
          <select value={filters.niche} onChange={update('niche')} className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 font-body">
            <option value="">All</option>
            {options.niches.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Country</label>
          <select value={filters.country} onChange={update('country')} className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 font-body">
            <option value="">All</option>
            {options.countries.map((c) => <option key={c.country} value={c.country}>{c.country}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">City</label>
          <select value={filters.city} onChange={update('city')} className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 font-body">
            <option value="">All</option>
            {options.cities.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
          </select>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Leads Extracted" value={summary?.leads_extracted} loading={loading} icon="🗺️" />
        <MetricCard label="Demos Created" value={summary?.demos_created} loading={loading} icon="🎬" />
        <MetricCard label="Calls Made" value={summary?.calls_made} loading={loading} icon="📞" />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Map */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 overflow-hidden">
          <p className="font-body font-semibold text-sm text-navy mb-3">Leads by Location</p>
          <div className="h-72 rounded-xl overflow-hidden">
            <MapContainer center={mapCenter} zoom={mapPoints.length ? 4 : 2} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {mapPoints.map((p) => (
                <CircleMarker
                  key={`${p.city}-${p.country}`}
                  center={[p.lat, p.lng]}
                  radius={6 + (p.n / maxCount) * 18}
                  pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.5 }}
                >
                  <Tooltip>{p.city}, {p.country} — {p.n} leads</Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="font-body font-semibold text-sm text-navy mb-3">Top Cities</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityLeadCounts.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={90} />
                <ChartTooltip />
                <Bar dataKey="n" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, loading, icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] uppercase tracking-wide text-slate-400">{label}</span>
        <span>{icon}</span>
      </div>
      <p className="font-display font-semibold text-3xl text-navy">
        {loading ? '—' : (value ?? 0)}
      </p>
    </div>
  )
}
