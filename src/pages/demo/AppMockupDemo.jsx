import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import TabButton from '../../components/TabButton'

export default function AppMockupDemo() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [status, setStatus] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState([])
  const pollRef = useRef(null)

  useEffect(() => {
    apiFetch('/demo/app-mockup/created').then(setCreated).catch(() => {})
    return () => clearInterval(pollRef.current)
  }, [tab])

  function pollStatus(purchaseId, token) {
    pollRef.current = setInterval(async () => {
      try {
        const s = await apiFetch(`/demo/app-mockup/${purchaseId}/status`)
        if (s.fulfillment_status === 'completed') {
          clearInterval(pollRef.current)
          setPreviewUrl(`https://api.automationgini.com/preview?preview=${token}&page=index`)
          setStatus('App mockup ready!')
          setLoading(false)
        }
      } catch {}
    }, 8000)
  }

  async function buildMockup() {
    if (!selectedLead) return
    setLoading(true)
    setPreviewUrl('')
    setStatus('Building your interactive app mockup... usually takes 2-3 minutes.')
    try {
      const result = await apiFetch('/demo/app-mockup', { method: 'POST', body: JSON.stringify({ lead_id: selectedLead.id }) })
      pollStatus(result.purchase_id, result.preview_token)
    } catch (e) {
      setStatus(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Mobile App Mockup</h1>
      <p className="font-body text-slate mb-6">An interactive, phone-frame preview of what a real app for this business could look like.</p>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}>🆕 Build New</TabButton>
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}>📋 Mockups Created</TabButton>
      </div>

      {tab === 'new' ? (
        <div className="space-y-4">
          <LeadPicker onSelect={setSelectedLead} />
          {selectedLead && (
            <button disabled={loading} onClick={buildMockup} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors">
              📱 Build App Mockup
            </button>
          )}
          {status && <p className="font-body text-sm text-slate">{status}</p>}
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-block font-body font-semibold text-sm text-white bg-blue rounded-lg px-5 py-2.5">
              View Interactive Mockup →
            </a>
          )}
        </div>
      ) : created.length === 0 ? (
        <EmptyState icon="📱" title="No app mockups yet" subtitle="Once you build one for a client, it'll show up here." />
      ) : (
        <div className="space-y-3">
          {created.map((m) => (
            <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body font-semibold text-navy">{m.business_name}</p>
                <p className="font-body text-sm text-slate">{m.niche} · {m.city}</p>
              </div>
              <a href={`https://api.automationgini.com/preview?preview=${m.preview_token}&page=index`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue bg-blue/10 rounded-lg px-3 py-1.5">View</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
