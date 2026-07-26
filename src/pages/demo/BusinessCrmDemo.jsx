import { useEffect, useState } from 'react'
import { Plus, ClipboardList, Sparkles, ExternalLink, Calendar } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import TabButton from '../../components/TabButton'
import BookingLink from '../../components/BookingLink'

export default function BusinessCrmDemo() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [status, setStatus] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [created, setCreated] = useState([])

  useEffect(() => { apiFetch('/demo/business-crm/created').then(setCreated).catch(() => {}) }, [tab])

  async function runDemo() {
    if (!selectedLead) { setStatus('Select a lead first.'); return }
    setRunning(true)
    setStatus('')
    setResult(null)
    try {
      const r = await apiFetch('/demo/business-crm', { method: 'POST', body: JSON.stringify({ lead_id: selectedLead.id }) })
      setResult(r)
      apiFetch('/demo/business-crm/created').then(setCreated).catch(() => {})
    } catch (e) {
      setStatus(e.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Business CRM Demo</h1>
      <p className="font-body text-slate mb-6">
        A real, free, working staff portal + public booking page pre-loaded with sample data - show a prospect exactly what they'd get before asking them to buy.
      </p>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}><Plus size={14} /> Build New Demo</TabButton>
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}><ClipboardList size={14} /> Demos Created</TabButton>
      </div>

      {tab === 'new' ? (
        <div className="space-y-4">
          <LeadPicker onSelect={setSelectedLead} />
          <button onClick={runDemo} disabled={running} className="flex items-center gap-1.5 font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors">
            <Sparkles size={14} /> {running ? 'Creating demo...' : 'Create Live Demo'}
          </button>
          {status && <p className="font-body text-sm text-slate">{status}</p>}
          {result && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
              <p className="font-body text-sm font-semibold text-navy mb-1">Demo ready!</p>
              {result.slug && <BookingLink slug={result.slug} />}
              {result.portal_login_url && (
                <a href={result.portal_login_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-blue hover:underline">
                  <ExternalLink size={12} /> Staff portal login
                </a>
              )}
              {result.staff_email && (
                <p className="font-mono text-xs text-slate mt-2">
                  Login: {result.staff_email} / {result.staff_password}
                </p>
              )}
            </div>
          )}
        </div>
      ) : created.length === 0 ? (
        <EmptyState icon={Calendar} title="No demos built yet" subtitle="Once you create one for a lead, it'll show up here." />
      ) : (
        <div className="space-y-3">
          {created.map((w) => (
            <div key={w.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="font-body font-semibold text-navy">{w.business_name}</p>
              <p className="font-body text-sm text-slate mb-2">{w.lead_business_name}</p>
              <BookingLink slug={w.slug} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
