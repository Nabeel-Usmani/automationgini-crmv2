import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import MetricCard from '../../components/MetricCard'
import TabButton from '../../components/TabButton'

export default function WebsiteDemo() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [status, setStatus] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [created, setCreated] = useState([])
  const [billing, setBilling] = useState(null)
  const pollRef = useRef(null)

  useEffect(() => {
    apiFetch('/billing/summary').then(setBilling).catch(() => {})
    apiFetch('/demo/website/created').then(setCreated).catch(() => {})
    return () => clearInterval(pollRef.current)
  }, [tab])

  function pollStatus(purchaseId, token) {
    pollRef.current = setInterval(async () => {
      try {
        const s = await apiFetch(`/demo/website/${purchaseId}/status`)
        setProgress(s)
        if (s.fulfillment_status === 'completed') {
          clearInterval(pollRef.current)
          setPreviewUrl(`https://crm-leads-enterprise.onrender.com/?preview=${token}&page=index`)
          setStatus('Preview ready!')
          setLoading(false)
        }
      } catch {}
    }, 8000)
  }

  async function buildPreview(productType = 'website_html') {
    if (!selectedLead) return
    setLoading(true)
    setPreviewUrl('')
    setStatus('Building your live preview... this takes a couple of minutes, feel free to check the "Sites Created" tab later instead of waiting here.')
    try {
      const result = await apiFetch('/demo/website', { method: 'POST', body: JSON.stringify({ lead_id: selectedLead.id, product_type: productType }) })
      pollStatus(result.purchase_id, result.preview_token)
    } catch (e) {
      setStatus(e.message)
      setLoading(false)
    }
  }

  const cap = billing?.caps?.mockup
  const used = billing?.usage_this_month?.mockup ?? 0

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Website Mockup Demo</h1>
      <p className="font-body text-slate mb-6">Build a real, free 4-page live preview before anyone pays.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Plan" value={billing?.plan_name} />
        <MetricCard label="Mockups Used" value={cap ? `${used} / ${cap}` : used} />
        <MetricCard label="Remaining" value={cap ? Math.max(0, cap - used) : 'Unlimited'} />
      </div>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}>🆕 Build New Demo</TabButton>
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}>📋 Demos Created</TabButton>
      </div>

      {tab === 'new' ? (
        <div className="space-y-4">
          <LeadPicker onSelect={setSelectedLead} />
          <div className="flex gap-3">
            <button disabled={loading} onClick={() => buildPreview('website_html')} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors">Build Mockup (Normal Architecture)</button>
            <button disabled={loading} onClick={() => buildPreview('website_react')} className="font-body font-semibold text-sm text-navy bg-white border border-slate-200 hover:border-blue disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors">Build Mockup (Modern Architecture)</button>
          </div>
          {status && <p className="font-body text-sm text-slate">{status}</p>}
          {progress && progress.fulfillment_status !== 'completed' && (
            <p className="font-mono text-xs text-slate-400">{progress.pages_done.length} / {progress.pages_total} pages generated so far...</p>
          )}
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-block font-body font-semibold text-sm text-white bg-blue hover:bg-blue-light rounded-lg px-5 py-2.5 transition-colors">
              🔗 Open Live Preview
            </a>
          )}
        </div>
      ) : created.length === 0 ? (
        <EmptyState icon="🌐" title="No website previews built yet" subtitle="Build one from the tab above to see it listed here." />
      ) : (
        <div className="space-y-3">
          {created.map((d) => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body font-semibold text-navy">{d.business_name}</p>
                <p className="font-body text-sm text-slate">{d.niche} · {d.city}</p>
              </div>
              {d.fulfillment_status === 'completed' ? (
                <a href={`https://crm-leads-enterprise.onrender.com/?preview=${d.preview_token}&page=index`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue bg-blue/10 rounded-lg px-3 py-1.5">
                  Open Preview
                </a>
              ) : (
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 rounded-lg px-3 py-1.5">Still building...</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
