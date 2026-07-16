import { useEffect, useState } from 'react'
import { apiFetch, getMe, getToken } from '../lib/api'
import UserMenu from '../components/UserMenu'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      <p className="font-display font-semibold text-2xl text-navy">{value}</p>
      {sub && <p className="font-body text-xs text-slate mt-1">{sub}</p>}
    </div>
  )
}

export default function PlatformOwnerDashboard() {
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [overview, setOverview] = useState(null)
  const [tenants, setTenants] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      window.location.href = 'https://automationgini-website.onrender.com/login'
      return
    }
    getMe().then(setUser).catch((e) => setAuthError(e.message))
  }, [])

  useEffect(() => {
    if (!user) return
    if (!user.is_platform_owner) { setAuthError('Not authorized.'); return }
    Promise.all([
      apiFetch('/admin/overview'),
      apiFetch('/admin/tenants'),
      apiFetch('/admin/activity'),
    ])
      .then(([o, t, a]) => { setOverview(o); setTenants(t); setActivity(a) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-red-600">{authError}</p>
      </div>
    )
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-slate">Loading platform overview...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
        <p className="font-display font-semibold text-navy">⚡ AutomationGini — Platform Owner</p>
        <UserMenu user={user} />
      </header>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <h1 className="font-display font-semibold text-2xl text-navy mb-1">Platform Overview</h1>
        <p className="font-body text-slate mb-6">Across all tenants, agents, and revenue.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Tenants" value={overview?.total_tenants ?? '—'} />
          <StatCard label="Agents" value={overview?.total_agents ?? '—'} />
          <StatCard label="Total Leads" value={overview?.total_leads?.toLocaleString() ?? '—'} sub={`${overview?.leads_last_30_days ?? 0} in last 30 days`} />
          <StatCard label="Total Revenue" value={`$${(overview?.total_revenue ?? 0).toLocaleString()}`} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Plan breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="font-body font-semibold text-navy mb-3">Tenants by Plan</p>
            <div className="space-y-2">
              {(overview?.plan_breakdown || []).map((p) => (
                <div key={p.plan_name} className="flex items-center justify-between text-sm font-body">
                  <span className="text-navy">{p.plan_name}</span>
                  <span className="text-slate font-mono">{p.n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Usage last 30 days */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="font-body font-semibold text-navy mb-3">Usage — Last 30 Days</p>
            <div className="space-y-2">
              {(overview?.usage_last_30_days || []).map((u) => (
                <div key={u.event_type} className="flex items-center justify-between text-sm font-body">
                  <span className="text-navy capitalize">{u.event_type.replace('_', ' ')}</span>
                  <span className="text-slate">{u.n} <span className="font-mono text-xs text-slate-400">(~${Number(u.est_cost).toFixed(2)})</span></span>
                </div>
              ))}
              {(!overview?.usage_last_30_days || overview.usage_last_30_days.length === 0) && (
                <p className="text-sm font-body text-slate-400">No usage recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Tenants table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <p className="font-body font-semibold text-navy">Tenants</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-5 py-2.5">Company</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-5 py-2.5">Plan</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-5 py-2.5">Status</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-5 py-2.5">Agents</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-5 py-2.5">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-body font-semibold text-navy">{t.company_name}</td>
                  <td className="px-5 py-3 font-body text-slate">{t.plan_name}</td>
                  <td className="px-5 py-3 font-body text-slate capitalize">{t.subscription_status}</td>
                  <td className="px-5 py-3 font-body text-slate">{t.agent_count}</td>
                  <td className="px-5 py-3 font-body text-slate">${Number(t.revenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <p className="font-body font-semibold text-navy">Recent Activity</p>
          </div>
          <div className="divide-y divide-slate-100">
            {activity.length === 0 && <p className="px-5 py-4 text-sm font-body text-slate-400">No purchases yet.</p>}
            {activity.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between text-sm font-body">
                <div>
                  <span className="text-navy font-semibold">{a.company_name}</span>
                  <span className="text-slate"> — {a.product_type} {a.business_name ? `for ${a.business_name}` : ''}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{a.payment_status}</span>
                  <span className="font-mono text-xs text-slate-400">${a.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
