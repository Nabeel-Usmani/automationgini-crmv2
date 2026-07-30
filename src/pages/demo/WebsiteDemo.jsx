import { useEffect, useRef, useState } from 'react'
import { Plus, ClipboardList, Clapperboard, ExternalLink, Globe } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import MetricCard from '../../components/MetricCard'
import TabButton from '../../components/TabButton'
import TemplateGallery from '../../components/TemplateGallery'

function ProgressBar({ done, total, className = '' }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-blue rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-slate-400 tabular-nums">{pct}%</span>
    </div>
  )
}

export default function WebsiteDemo() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [templateId, setTemplateId] = useState(null)
  const [status, setStatus] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [created, setCreated] = useState([])
  const [billing, setBilling] = useState(null)
  const pollRef = useRef(null)
  const listPollRef = useRef(null)

  useEffect(() => {
    apiFetch('/billing/summary').then(setBilling).catch(() => {})

    function loadCreated() {
      apiFetch('/demo/website/created').then((rows) => {
        if (!Array.isArray(rows)) return
        setCreated(rows)
        const stillBuilding = rows.some((r) => r.fulfillment_status !== 'completed')
        clearInterval(listPollRef.current)
        if (tab === 'created' && stillBuilding) {
          listPollRef.current = setInterval(loadCreated, 8000)
        }
      }).catch(() => {})
    }
    loadCreated()

    return () => {
      clearInterval(pollRef.current)
      clearInterval(listPollRef.current)
    }
  }, [tab])

  function pollStatus(purchaseId, token) {
    pollRef.current = setInterval(async () => {
      try {
        const s = await apiFetch(`/demo/website/${purchaseId}/status`)
        setProgress(s)
        if (s.fulfillment_status === 'completed') {
          clearInterval(pollRef.current)
          setPreviewUrl(`https://api.automationgini.com/preview?preview=${token}&page=index`)
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
      const result = await apiFetch('/demo/website', { method: 'POST', body: JSON.stringify({ lead_id: selectedLead.id, product_type: productType, template_id: templateId }) })
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
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}><Plus size={14} /> Build New Demo</TabButton>
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}><ClipboardList size={14} /> Demos Created</TabButton>
      </div>

      {tab === 'new' ? (
        <div className="space-y-4">
          <LeadPicker onSelect={setSelectedLead} />
          <TemplateGallery selectedId={templateId} onSelect={setTemplateId} />
          <div className="flex gap-3">
            <button disabled={loading} onClick={() => buildPreview('website_html')} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors">Build Mockup (Normal Architecture)</button>
            <button disabled={loading} onClick={() => buildPreview('website_react')} className="font-body font-semibold text-sm text-navy bg-white border border-slate-200 hover:border-blue disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors">Build Mockup (Modern Architecture)</button>
            <button disabled={loading} onClick={() => buildPreview('website_react_video')} className="flex items-center gap-2 font-body font-semibold text-sm text-white bg-gradient-to-r from-navy to-blue hover:opacity-90 disabled:opacity-60 rounded-lg px-5 py-2.5 transition-opacity">
              <Clapperboard size={15} /> Build Mockup (Modern Architecture + Embedded Video)
            </button>
          </div>
          {status && <p className="font-body text-sm text-slate">{status}</p>}
          {progress && progress.fulfillment_status !== 'completed' && (
            <div className="max-w-xs">
              <ProgressBar done={progress.pages_done.length} total={progress.pages_total} />
              <p className="font-mono text-xs text-slate-400 mt-1">{progress.pages_done.length} / {progress.pages_total} pages generated so far...</p>
            </div>
          )}
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-body font-semibold text-sm text-white bg-blue hover:bg-blue-light rounded-lg px-5 py-2.5 transition-colors">
              <ExternalLink size={15} /> Open Live Preview
            </a>
          )}
        </div>
      ) : created.length === 0 ? (
        <EmptyState icon={Globe} title="No website previews built yet" subtitle="Build one from the tab above to see it listed here." />
      ) : (
        <div className="space-y-3">
          {created.map((d) => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body font-semibold text-navy">{d.business_name}</p>
                <p className="font-body text-sm text-slate">{d.niche} · {d.city}</p>
              </div>
              {d.fulfillment_status === 'completed' ? (
                <a href={`https://api.automationgini.com/preview?preview=${d.preview_token}&page=index`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue bg-blue/10 rounded-lg px-3 py-1.5">
                  Open Preview
                </a>
              ) : (
                <div className="w-36">
                  <ProgressBar done={d.pages_done} total={d.pages_total} />
                  <p className="font-body text-xs text-amber-700 mt-1 text-right">Building... ({d.pages_done}/{d.pages_total})</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
