import { useEffect, useState } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { apiFetch } from '../lib/api'
import MetricCard from '../components/MetricCard'
import EmptyState from '../components/EmptyState'

const STATUS_LABELS = {
  active: 'In sequence',
  replied: 'Replied',
  completed_no_reply: 'No reply (done)',
  failed: 'Failed',
}

const STATUS_COLORS = {
  active: 'bg-blue/10 text-blue',
  replied: 'bg-green-100 text-green-700',
  completed_no_reply: 'bg-slate-100 text-slate',
  failed: 'bg-red-100 text-red-700',
}

const STEP_LABELS = ['Not sent', 'Initial sent', 'Follow-up 1', 'Follow-up 2', 'Follow-up 3', 'Follow-up 4']

export default function EmailAutomation() {
  const [stats, setStats] = useState(null)
  const [sequences, setSequences] = useState([])
  const [loading, setLoading] = useState(true)

  function refresh() {
    setLoading(true)
    Promise.all([
      apiFetch('/email-automation/stats'),
      apiFetch('/email-automation/sequences'),
    ]).then(([s, seq]) => {
      setStats(s)
      setSequences(seq || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display font-semibold text-2xl text-navy">Email Automation</h1>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate bg-white border border-slate-200 hover:border-blue hover:text-blue disabled:opacity-60 rounded-lg px-3 py-1.5 transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
      <p className="font-body text-slate mb-6">
        Automated outreach to every lead with an email address — a personalized website mockup for leads with no
        website, a chatbot demo for leads that have one — followed up automatically every 24 hours (up to 4 times)
        until they reply.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard label="Initial Sent" value={stats?.initial_sent} />
        <MetricCard label="Follow-ups Sent" value={stats?.followups_sent} />
        <MetricCard label="Replied" value={stats?.replied} />
        <MetricCard label="Reply Rate" value={stats ? `${stats.reply_rate}%` : undefined} />
        <MetricCard label="Active Sequences" value={stats?.active} />
        <MetricCard label="No Reply (Done)" value={stats?.completed_no_reply} />
      </div>

      {loading ? (
        <p className="font-body text-slate">Loading...</p>
      ) : sequences.length === 0 ? (
        <EmptyState icon={Mail} title="No email sequences yet" subtitle="Sequences enroll automatically once leads with an email address are found." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Business</p></th>
                <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Sequence</p></th>
                <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Progress</p></th>
                <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Status</p></th>
                <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Last Sent</p></th>
                <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Replied</p></th>
              </tr>
            </thead>
            <tbody>
              {sequences.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3.5">
                    <p className="font-body font-semibold text-navy">{s.business_name}</p>
                    <p className="font-body text-xs text-slate">{s.niche} · {s.city}, {s.country}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-slate-500">
                      {s.sequence_type === 'website_demo' ? 'Website mockup' : 'Chatbot demo'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-slate-500">{STEP_LABELS[s.step] || `Step ${s.step}`}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 ${STATUS_COLORS[s.status] || 'bg-slate-100 text-slate'}`}>
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-slate-400">{s.last_sent_at ? new Date(s.last_sent_at).toLocaleString() : '—'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-slate-400">{s.replied_at ? new Date(s.replied_at).toLocaleString() : '—'}</span>
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
