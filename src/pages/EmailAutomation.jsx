import { useEffect, useMemo, useState } from 'react'
import { Mail, RefreshCw, Eye } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { apiFetch } from '../lib/api'
import MetricCard from '../components/MetricCard'
import EmptyState from '../components/EmptyState'
import EmailPreviewModal from '../components/EmailPreviewModal'

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

// Fixed status -> chart color mapping (matches the badge colors above).
const STATUS_CHART_COLORS = {
  active: '#2563EB',
  replied: '#16A34A',
  completed_no_reply: '#94A3B8',
  failed: '#DC2626',
}

const STEP_LABELS = ['Not sent', 'Initial sent', 'Follow-up 1', 'Follow-up 2', 'Follow-up 3', 'Follow-up 4']

const EMAIL_TYPE_LABELS = { initial: 'Initial', followup_1: 'Follow-up 1', followup_2: 'Follow-up 2', followup_3: 'Follow-up 3', followup_4: 'Follow-up 4' }

const CARD_FILTERS = {
  initial_sent: 'initial',
  followups_sent: 'followups',
  replied: 'replied',
  reply_rate: 'replied',
  active: 'active',
  completed_no_reply: 'completed_no_reply',
}

function formatDay(day) {
  return new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function EmailAutomation() {
  const [stats, setStats] = useState(null)
  const [sequences, setSequences] = useState([])
  const [timeseries, setTimeseries] = useState([])
  const [sends, setSends] = useState([])
  const [sendsLoading, setSendsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(null) // null | 'initial' | 'followups' | 'replied' | 'active' | 'completed_no_reply'
  const [previewId, setPreviewId] = useState(null)

  function refresh() {
    setLoading(true)
    Promise.all([
      apiFetch('/email-automation/stats'),
      apiFetch('/email-automation/sequences'),
      apiFetch('/email-automation/timeseries'),
    ]).then(([s, seq, ts]) => {
      setStats(s)
      setSequences(seq || [])
      setTimeseries(ts || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const isSentEmailsFilter = filter === 'initial' || filter === 'followups'

  useEffect(() => {
    if (!isSentEmailsFilter) return
    setSendsLoading(true)
    apiFetch(`/email-automation/sends?email_type=${filter}`)
      .then((rows) => setSends(rows || []))
      .catch(() => setSends([]))
      .finally(() => setSendsLoading(false))
  }, [filter])

  function toggleFilter(key) {
    const value = CARD_FILTERS[key]
    setFilter((f) => (f === value ? null : value))
  }

  const chartData = useMemo(() => timeseries.map((r) => ({ ...r, label: formatDay(r.day) })), [timeseries])

  const statusBreakdown = useMemo(() => {
    if (!stats) return []
    return [
      { status: 'active', label: STATUS_LABELS.active, n: stats.active || 0 },
      { status: 'replied', label: STATUS_LABELS.replied, n: stats.replied || 0 },
      { status: 'completed_no_reply', label: STATUS_LABELS.completed_no_reply, n: stats.completed_no_reply || 0 },
      { status: 'failed', label: STATUS_LABELS.failed, n: stats.failed || 0 },
    ].filter((row) => row.n > 0)
  }, [stats])

  const filteredSequences = useMemo(() => {
    if (!filter || isSentEmailsFilter) return sequences
    return sequences.filter((s) => s.status === filter)
  }, [sequences, filter, isSentEmailsFilter])

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
        <MetricCard label="Initial Sent" value={stats?.initial_sent} onClick={() => toggleFilter('initial_sent')} active={filter === 'initial'} />
        <MetricCard label="Follow-ups Sent" value={stats?.followups_sent} onClick={() => toggleFilter('followups_sent')} active={filter === 'followups'} />
        <MetricCard label="Replied" value={stats?.replied} onClick={() => toggleFilter('replied')} active={filter === 'replied'} />
        <MetricCard label="Reply Rate" value={stats ? `${stats.reply_rate}%` : undefined} onClick={() => toggleFilter('reply_rate')} active={filter === 'replied'} />
        <MetricCard label="Active Sequences" value={stats?.active} onClick={() => toggleFilter('active')} active={filter === 'active'} />
        <MetricCard label="No Reply (Done)" value={stats?.completed_no_reply} onClick={() => toggleFilter('completed_no_reply')} active={filter === 'completed_no_reply'} />
      </div>

      {/* Overview charts - only shown with no card selected, so the drill-down list/table below is the focus once one is */}
      {!filter && !loading && (chartData.length > 0 || statusBreakdown.length > 0) && (
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          {chartData.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="font-body font-semibold text-sm text-navy mb-3">Emails Sent Over Time</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <ChartTooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="initial_sent" name="Initial" stackId="sent" fill="#2563EB" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="followups_sent" name="Follow-ups" stackId="sent" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {statusBreakdown.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="font-body font-semibold text-sm text-navy mb-3">Sequence Status Breakdown</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusBreakdown} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={110} />
                    <ChartTooltip />
                    <Bar dataKey="n" name="Sequences" radius={[0, 4, 4, 0]}>
                      {statusBreakdown.map((row) => (
                        <Cell key={row.status} fill={STATUS_CHART_COLORS[row.status]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="font-body text-slate">Loading...</p>
      ) : isSentEmailsFilter ? (
        <SentEmailsTable rows={sends} loading={sendsLoading} onView={setPreviewId} />
      ) : filteredSequences.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={filter ? 'No sequences match this filter' : 'No email sequences yet'}
          subtitle={filter ? undefined : 'Sequences enroll automatically once leads with an email address are found.'}
        />
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
              {filteredSequences.map((s) => (
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

      {previewId && <EmailPreviewModal sendId={previewId} onClose={() => setPreviewId(null)} />}
    </div>
  )
}

function SentEmailsTable({ rows, loading, onView }) {
  if (loading) return <p className="font-body text-slate">Loading...</p>
  if (rows.length === 0) {
    return <EmptyState icon={Mail} title="No emails sent in this category yet" />
  }
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Business</p></th>
            <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Subject</p></th>
            <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Step</p></th>
            <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Sent</p></th>
            <th className="text-left px-4 py-2.5"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Replied</p></th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
              <td className="px-4 py-3.5">
                <p className="font-body font-semibold text-navy">{r.business_name}</p>
                <p className="font-body text-xs text-slate">{r.niche} · {r.city}, {r.country}</p>
              </td>
              <td className="px-4 py-3.5">
                <p className="font-body text-navy max-w-xs truncate">{r.subject}</p>
                <p className="font-body text-xs text-slate">{r.to_email}</p>
              </td>
              <td className="px-4 py-3.5">
                <span className="font-mono text-xs text-slate-500">{EMAIL_TYPE_LABELS[r.email_type] || r.email_type}</span>
              </td>
              <td className="px-4 py-3.5">
                <span className="font-mono text-xs text-slate-400">{new Date(r.sent_at).toLocaleString()}</span>
              </td>
              <td className="px-4 py-3.5">
                <span className="font-mono text-xs text-slate-400">{r.replied_at ? new Date(r.replied_at).toLocaleString() : '—'}</span>
              </td>
              <td className="px-4 py-3.5 text-right">
                <button
                  onClick={() => onView(r.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue hover:text-blue-light"
                >
                  <Eye size={13} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
