import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import TabButton from '../../components/TabButton'

export default function BuildChatbot() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [instructions, setInstructions] = useState('')
  const [status, setStatus] = useState('')
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [created, setCreated] = useState([])

  useEffect(() => { apiFetch('/build/chatbot/created').then(setCreated).catch(() => {}) }, [tab])

  async function submit() {
    if (!selectedLead) return
    setStatus('Starting checkout...')
    try {
      const result = await apiFetch('/build/chatbot/checkout', {
        method: 'POST', body: JSON.stringify({ lead_id: selectedLead.id, system_prompt: instructions.trim() || null }),
      })
      if (result.checkout_url) { setCheckoutUrl(result.checkout_url); setStatus('') }
      else setStatus('Checkout isn\u2019t fully configured yet (Stripe keys pending).')
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Build My Chatbot</h1>
      <p className="font-body text-slate mb-6">$29/month, 100 conversations included — works on sites we build or ones they already have.</p>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}>🆕 Build New</TabButton>
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}>📋 Chatbots Created</TabButton>
      </div>

      {tab === 'new' ? (
        <div className="space-y-4">
          <LeadPicker onSelect={setSelectedLead} />
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Custom instructions (optional)" rows={3} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
          <button onClick={submit} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-5 py-2.5 transition-colors">Subscribe & Get the Script — $29/mo</button>
          {status && <p className="font-body text-sm text-slate">{status}</p>}
          {checkoutUrl && <a href={checkoutUrl} className="inline-block font-body font-semibold text-sm text-white bg-blue rounded-lg px-5 py-2.5">Proceed to Payment →</a>}
        </div>
      ) : created.length === 0 ? (
        <EmptyState icon="💬" title="No active chatbot subscriptions yet" subtitle="Once you build one for a client, it'll show up here." />
      ) : (
        <div className="space-y-3">
          {created.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="font-body font-semibold text-navy">{c.business_name}</p>
              <p className="font-mono text-xs text-slate-400 mb-2">Renews {c.current_period_end || 'monthly'}</p>
              <code className="block bg-slate-50 rounded-lg p-2 text-xs font-mono overflow-x-auto">
                {`<script src="https://crm-leads-enterprise.onrender.com/chatbot-widget.js" data-chatbot-token="${c.chatbot_token}"></script>`}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
