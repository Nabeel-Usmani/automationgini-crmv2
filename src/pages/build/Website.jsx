import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import TabButton from '../../components/TabButton'

export default function BuildWebsite() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [status, setStatus] = useState('')
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [created, setCreated] = useState([])

  useEffect(() => { apiFetch('/build/website/created').then(setCreated).catch(() => {}) }, [tab])

  async function submit(productType) {
    if (!selectedLead) return
    setStatus('Starting checkout...')
    try {
      const result = await apiFetch('/build/website/checkout', {
        method: 'POST', body: JSON.stringify({ lead_id: selectedLead.id, product_type: productType }),
      })
      if (result.checkout_url) { setCheckoutUrl(result.checkout_url); setStatus('') }
      else setStatus('Checkout isn\u2019t fully configured yet (Stripe keys pending).')
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Build My Website</h1>
      <p className="font-body text-slate mb-6">Deliver the real files once your client says yes to the free preview.</p>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}>🆕 Build New</TabButton>
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}>📋 Sites Created</TabButton>
      </div>

      {tab === 'new' ? (
        <div className="space-y-4">
          <LeadPicker onSelect={setSelectedLead} />
          <div className="flex gap-3">
            <button onClick={() => submit('website_html')} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-5 py-2.5 transition-colors">$75 — Normal Architecture</button>
            <button onClick={() => submit('website_react')} className="font-body font-semibold text-sm text-navy bg-white border border-slate-200 hover:border-blue rounded-lg px-5 py-2.5 transition-colors">$150 — Modern Architecture</button>
          </div>
          {status && <p className="font-body text-sm text-slate">{status}</p>}
          {checkoutUrl && <a href={checkoutUrl} className="inline-block font-body font-semibold text-sm text-white bg-blue rounded-lg px-5 py-2.5">Proceed to Payment →</a>}
        </div>
      ) : created.length === 0 ? (
        <EmptyState icon="🌐" title="No websites built yet" subtitle="Once you build one for a client, it'll show up here." />
      ) : (
        <div className="space-y-3">
          {created.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body font-semibold text-navy">{s.business_name}</p>
                <p className="font-body text-sm text-slate">{s.niche} · {s.city} · {s.payment_status}</p>
              </div>
              <a href={`https://crm-leads-enterprise.onrender.com/?preview=${s.preview_token}&page=index`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue bg-blue/10 rounded-lg px-3 py-1.5">View</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
