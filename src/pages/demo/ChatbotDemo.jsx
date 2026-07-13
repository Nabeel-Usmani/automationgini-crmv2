import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import MetricCard from '../../components/MetricCard'
import TabButton from '../../components/TabButton'

export default function ChatbotDemo() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [status, setStatus] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState([])
  const [billing, setBilling] = useState(null)

  useEffect(() => {
    apiFetch('/billing/summary').then(setBilling).catch(() => {})
    apiFetch('/demo/chatbot/created').then(setCreated).catch(() => {})
  }, [tab])

  async function buildDemo() {
    if (!selectedLead) return
    setLoading(true)
    setStatus('Reading their site and building a personalized chatbot...')
    try {
      const result = await apiFetch('/demo/chatbot', { method: 'POST', body: JSON.stringify({ lead_id: selectedLead.id }) })
      const token = result.session_token || result.chatbot_token
      setDemoUrl(`https://crm-leads-enterprise.onrender.com/?chatbot_demo=${token}`)
      setStatus('Chatbot demo is ready!')
    } catch (e) {
      setStatus(e.message)
    } finally {
      setLoading(false)
    }
  }

  const cap = billing?.caps?.chatbot_demo
  const used = billing?.usage_this_month?.chatbot_demo ?? 0

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Chatbot Demo</h1>
      <p className="font-body text-slate mb-6">Build a live, personalized chatbot — opens in a new tab, safe to share.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Plan" value={billing?.plan_name} />
        <MetricCard label="Chatbot Demos Used" value={cap ? `${used} / ${cap}` : used} />
        <MetricCard label="Remaining" value={cap ? Math.max(0, cap - used) : 'Unlimited'} />
      </div>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}>🆕 Build New Demo</TabButton>
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}>📋 Demos Created</TabButton>
      </div>

      {tab === 'new' ? (
        <div className="space-y-4">
          <LeadPicker onSelect={setSelectedLead} />
          <button disabled={loading} onClick={buildDemo} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors">
            💬 Start Chatbot Demo
          </button>
          {status && <p className="font-body text-sm text-slate">{status}</p>}
          {demoUrl && (
            <a href={demoUrl} target="_blank" rel="noreferrer" className="inline-block font-body font-semibold text-sm text-white bg-blue hover:bg-blue-light rounded-lg px-5 py-2.5 transition-colors">
              🔗 Open Demo (new tab)
            </a>
          )}
        </div>
      ) : created.length === 0 ? (
        <EmptyState icon="💬" title="No chatbot demos built yet" subtitle="Build one from the tab above to see it listed here." />
      ) : (
        <div className="space-y-3">
          {created.map((d) => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body font-semibold text-navy">{d.business_name}</p>
                <p className="font-mono text-xs text-slate-400">Expires {d.demo_expires_at}</p>
              </div>
              <a href={`https://crm-leads-enterprise.onrender.com/?chatbot_demo=${d.chatbot_token}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue bg-blue/10 rounded-lg px-3 py-1.5">
                Open Demo
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
