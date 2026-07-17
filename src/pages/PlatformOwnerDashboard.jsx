import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts'
import { apiFetch } from '../lib/api'
import PlatformOwnerAuth from '../components/PlatformOwnerAuth'
import { countryCentroid } from '../lib/countryCentroids'

function StatCard({ label, value, sub, live }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1 flex items-center gap-1.5">
        {label}
        {live && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
      </p>
      <p className="font-display font-semibold text-2xl text-navy">{value}</p>
      {sub && <p className="font-body text-xs text-slate mt-1">{sub}</p>}
    </div>
  )
}

function CountryMap({ title, points, color }) {
  const mapped = points.map((p) => ({ ...p, coords: countryCentroid(p.country_code) })).filter((p) => p.coords)
  const maxN = Math.max(1, ...points.map((p) => p.n))
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 overflow-hidden">
      <p className="font-body font-semibold text-sm text-navy mb-3">{title}</p>
      <div className="h-64 rounded-xl overflow-hidden">
        <MapContainer center={[20, 10]} zoom={1.5} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          {mapped.map((p) => (
            <CircleMarker
              key={p.country_code}
              center={p.coords}
              radius={6 + (p.n / maxN) * 18}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}
            >
              <Tooltip>{p.country_name || p.country_code} — {p.n}</Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      {points.length === 0 && <p className="font-body text-xs text-slate-400 mt-2">No location data yet.</p>}
    </div>
  )
}

function DashboardHome() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  function load() {
    apiFetch('/admin/users-overview').then(setOverview).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000) // refresh "active now" every 30s
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="px-8 py-8"><p className="font-body text-slate">Loading...</p></div>

  const byCountry = overview?.users_by_country || []
  const activeByCountry = overview?.active_users_by_country || []
  const chartData = byCountry.map((c) => ({ name: c.country_code, n: c.n }))

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Platform Home</h1>
      <p className="font-body text-slate mb-6">Live view of everyone using AutomationGini right now.</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Total Users" value={overview?.total_users ?? 0} />
        <StatCard label="Active Now" value={overview?.active_now ?? 0} sub="Active in the last 5 minutes" live />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8">
        <p className="font-body font-semibold text-sm text-navy mb-3">Users by Country</p>
        <div className="h-64">
          {chartData.length === 0 ? (
            <p className="font-body text-xs text-slate-400">No location data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={50} />
                <ChartTooltip />
                <Bar dataKey="n" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CountryMap title="All Users by Location" points={byCountry} color="#2563EB" />
        <CountryMap title="Active Users by Location" points={activeByCountry} color="#16A34A" />
      </div>
    </div>
  )
}

export default function PlatformOwnerDashboard() {
  return (
    <PlatformOwnerAuth>
      <DashboardHome />
    </PlatformOwnerAuth>
  )
}
