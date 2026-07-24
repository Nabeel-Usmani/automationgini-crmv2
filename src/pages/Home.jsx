import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { MapPin, Clapperboard, Phone, SlidersHorizontal, Map as MapIcon, BarChart3 } from 'lucide-react'
import { getDashboardSummary, getFilterOptions, getCityCoordinates } from '../lib/api'
import 'leaflet/dist/leaflet.css'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

export default function Home({ user }) {
  const [filters, setFilters] = useState({ date_from: '', date_to: '', niche: '', country: '', city: '' })
  const [options, setOptions] = useState({ niches: [], countries: [], cities: [] })
  const [summary, setSummary] = useState(null)
  const [coords, setCoords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCities, setSelectedCities] = useState(null) // null = "all selected" (default)

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {})
    getCityCoordinates().then(setCoords).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    getDashboardSummary(filters)
      .then((s) => { setSummary(s); setSelectedCities(null) }) // reset to "all selected" on new data
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filters])

  const update = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.value }))

  const cityLeadCounts = summary?.leads_by_city || []
  const maxCount = Math.max(1, ...cityLeadCounts.map((c) => c.n))
  const cityKey = (c) => `${c.city}|${c.country}`

  function toggleCity(key) {
    setSelectedCities((prev) => {
      // First click after "all selected": start a fresh selection with just this one
      const allKeys = cityLeadCounts.map(cityKey)
      const current = prev === null ? new Set(allKeys) : new Set(prev)
      if (prev === null) {
        return new Set([key])
      }
      if (current.has(key)) {
        current.delete(key)
      } else {
        current.add(key)
      }
      // If everything ends up selected again, go back to "all" (null) for simplicity
      if (current.size === allKeys.length) return null
      return current
    })
  }

  const isSelected = (c) => selectedCities === null || selectedCities.has(cityKey(c))

  const mapPoints = cityLeadCounts
    .map((c) => {
      const match = coords.find((co) => co.city === c.city && co.country === c.country)
      return match ? { ...c, lat: match.lat, lng: match.lng } : null
    })
    .filter(Boolean)

  const mapCenter = mapPoints.length ? [mapPoints[0].lat, mapPoints[0].lng] : [20, 0]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="max-w-6xl mx-auto px-8 py-8"
    >
      <motion.div variants={fadeUp}>
        <h1 className="font-display font-semibold text-2xl text-navy mb-1">
          {user?.role === 'agent' ? 'Your Overview' : 'Overview'}
        </h1>
        <p className="font-body text-slate mb-6">
          {user?.role === 'agent' ? 'Your own activity across leads, demos, and calls.' : 'Everything across your account.'}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-1.5 mb-4">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <span className="font-mono text-[11px] uppercase tracking-wide text-slate-400">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">From</label>
            <input type="date" value={filters.date_from} onChange={update('date_from')} className="w-full text-sm border border-slate-200 rounded-xl px-2.5 py-2 font-body focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-shadow" />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">To</label>
            <input type="date" value={filters.date_to} onChange={update('date_to')} className="w-full text-sm border border-slate-200 rounded-xl px-2.5 py-2 font-body focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-shadow" />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Niche</label>
            <select value={filters.niche} onChange={update('niche')} className="w-full text-sm border border-slate-200 rounded-xl px-2.5 py-2 font-body focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-shadow">
              <option value="">All</option>
              {options.niches.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Country</label>
            <select value={filters.country} onChange={update('country')} className="w-full text-sm border border-slate-200 rounded-xl px-2.5 py-2 font-body focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-shadow">
              <option value="">All</option>
              {options.countries.map((c) => <option key={c.country} value={c.country}>{c.country}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">City</label>
            <select value={filters.city} onChange={update('city')} className="w-full text-sm border border-slate-200 rounded-xl px-2.5 py-2 font-body focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-shadow">
              <option value="">All</option>
              {options.cities.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={stagger} className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Leads Extracted" value={summary?.leads_extracted} loading={loading} icon={MapPin} tint="blue" />
        <MetricCard label="Demos Created" value={summary?.demos_created} loading={loading} icon={Clapperboard} tint="amber" />
        <MetricCard label="Calls Made" value={summary?.calls_made} loading={loading} icon={Phone} tint="navy" />
      </motion.div>

      <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-5">
        {/* Map */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body font-semibold text-sm text-navy flex items-center gap-1.5">
              <MapIcon size={15} className="text-slate-400" />
              Leads by Location
            </p>
            {selectedCities !== null && (
              <button onClick={() => setSelectedCities(null)} className="text-xs font-semibold text-blue hover:underline">
                Show all
              </button>
            )}
          </div>
          <div className="h-72 rounded-xl overflow-hidden">
            <MapContainer center={mapCenter} zoom={mapPoints.length ? 4 : 2} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {mapPoints.map((p) => {
                const active = isSelected(p)
                return (
                  <CircleMarker
                    key={cityKey(p)}
                    center={[p.lat, p.lng]}
                    radius={6 + (p.n / maxCount) * 18}
                    pathOptions={{
                      color: active ? '#2563EB' : '#CBD5E1',
                      fillColor: active ? '#2563EB' : '#CBD5E1',
                      fillOpacity: active ? 0.6 : 0.25,
                    }}
                    eventHandlers={{ click: () => toggleCity(cityKey(p)) }}
                  >
                    <Tooltip>{p.city}, {p.country} — {p.n} leads</Tooltip>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="font-body font-semibold text-sm text-navy mb-3 flex items-center gap-1.5">
            <BarChart3 size={15} className="text-slate-400" />
            Top Cities <span className="font-body font-normal text-xs text-slate-400">(click to highlight on map)</span>
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityLeadCounts.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={90} />
                <ChartTooltip />
                <Bar
                  dataKey="n"
                  radius={[0, 4, 4, 0]}
                  onClick={(data) => toggleCity(cityKey(data))}
                  cursor="pointer"
                >
                  {cityLeadCounts.slice(0, 8).map((c) => (
                    <Cell key={cityKey(c)} fill={isSelected(c) ? '#2563EB' : '#CBD5E1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const TINTS = {
  blue: 'bg-blue/10 text-blue',
  amber: 'bg-amber/10 text-amber-600',
  navy: 'bg-navy/10 text-navy',
}

function MetricCard({ label, value, loading, icon: Icon, tint }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="bg-white border border-slate-200 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[11px] uppercase tracking-wide text-slate-400">{label}</span>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${TINTS[tint]}`}>
          <Icon size={14} strokeWidth={2.25} />
        </span>
      </div>
      <p className="font-display font-semibold text-3xl text-navy">
        {loading ? '—' : (value ?? 0)}
      </p>
    </motion.div>
  )
}
