import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import TabButton from '../../components/TabButton'

export default function BuildVoiceAgent() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [byokKey, setByokKey] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [status, setStatus] = useState('')
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [created, setCreated] = useState([])

  useEffect(() => { apiFetch('/build/voice-agent/created').then(setCreated).catch(() => {}) }, [tab])

  async function submit() {
    if (!selectedLead || !byokKey.trim()) { setStatus('Enter the client\u2019s Vapi API key first.'); return }
    setStatus('Starting checkout...')
    try {
      const result = await apiFetch('/build/voice-agent/checkout', {
        method: 'POST',
        body: JSON.stringify({ lead_id: selectedLead.id, byok_key: byokKey.trim(), custom_instructions: customInstructions.trim() || null }),
      })
      if (result.checkout_url) { setCheckoutUrl(result.checkout_url); setStatus('') }
      else setStatus('Checkout isn\u2019t fully configured yet (Stripe keys pending).')
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Build My Voice Agent</h1>
      <p className="font-body text-slate mb-6">A permanent, production-ready inbound AI receptionist — $50 one-time, client's own Vapi account.</p>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}>🆕 Build New</TabButton>
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}>📋 Agents Created</TabButton>
      </div>

      {tab === 'new' ? (
        <div className="space-y-4">
          <LeadPicker onSelect={setSelectedLead} requirePhone />
          <input value={byokKey} onChange={(e) => setByokKey(e.target.value)} type="password" placeholder="Client's Vapi API Key" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
          <textarea value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} placeholder="Custom instructions (optional)" rows={3} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
          <button onClick={submit} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-5 py-2.5 transition-colors">Charge $50 & Build Voice Agent</button>
          {status && <p className="font-body text-sm text-slate">{status}</p>}
          {checkoutUrl && <a href={checkoutUrl} className="inline-block font-body font-semibold text-sm text-white bg-blue rounded-lg px-5 py-2.5">Proceed to Payment →</a>}
        </div>
      ) : created.length === 0 ? (
        <EmptyState icon="🤖" title="No voice agents built yet" subtitle="Once you build one for a client, it'll show up here." />
      ) : (
        <div className="space-y-3">
          {created.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="font-body font-semibold text-navy">{a.business_name}</p>
              <p className="font-body text-sm text-slate mb-2">{a.niche} · {a.city}</p>
              {a.fulfillment_detail?.vapi_phone_number && (
                <p className="font-mono text-xs text-green-700">📞 Live: {a.fulfillment_detail.vapi_phone_number}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
