import { useEffect, useState } from 'react'
import { Plus, ClipboardList, Calendar, Trash2, Copy, Check, ExternalLink, Sparkles } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import TabButton from '../../components/TabButton'

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Vancouver', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore',
  'Australia/Sydney', 'UTC',
]

function BookingLink({ slug }) {
  const [copied, setCopied] = useState(false)
  const url = `https://automationgini.com/book/${slug}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked in some contexts - the link is still
      // visible and selectable, so this is a nicety, not a hard requirement.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-blue hover:underline">
        <ExternalLink size={12} /> {url}
      </a>
      <button onClick={copy} className="text-slate-400 hover:text-navy">
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  )
}

export default function BuildBusinessCrm() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [businessName, setBusinessName] = useState('')
  const [ownerFullName, setOwnerFullName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')
  const [services, setServices] = useState([{ name: '', duration_minutes: 30, price_cents: '' }])
  const [status, setStatus] = useState('')
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [created, setCreated] = useState([])

  const [demoLead, setDemoLead] = useState(null)
  const [demoStatus, setDemoStatus] = useState('')
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoResult, setDemoResult] = useState(null)
  const [demos, setDemos] = useState([])

  useEffect(() => { apiFetch('/build/business-crm/created').then(setCreated).catch(() => {}) }, [tab])
  useEffect(() => { if (tab === 'demo') apiFetch('/demo/business-crm/created').then(setDemos).catch(() => {}) }, [tab])

  async function runDemo() {
    if (!demoLead) { setDemoStatus('Select a lead first.'); return }
    setDemoRunning(true)
    setDemoStatus('')
    setDemoResult(null)
    try {
      const result = await apiFetch('/demo/business-crm', { method: 'POST', body: JSON.stringify({ lead_id: demoLead.id }) })
      setDemoResult(result)
      apiFetch('/demo/business-crm/created').then(setDemos).catch(() => {})
    } catch (e) {
      setDemoStatus(e.message)
    } finally {
      setDemoRunning(false)
    }
  }

  function handleSelectLead(lead) {
    setSelectedLead(lead)
    if (!businessName) setBusinessName(lead.business_name || '')
  }

  function updateService(i, field, value) {
    setServices((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
  }

  function addService() {
    setServices((prev) => [...prev, { name: '', duration_minutes: 30, price_cents: '' }])
  }

  function removeService(i) {
    setServices((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function submit() {
    if (!selectedLead) { setStatus('Select a lead first.'); return }
    if (!businessName.trim() || !ownerFullName.trim() || !ownerEmail.trim()) {
      setStatus('Business name, owner name, and owner email are required.')
      return
    }
    const cleanServices = services
      .filter((s) => s.name.trim())
      .map((s) => ({
        name: s.name.trim(),
        duration_minutes: Number(s.duration_minutes) || 30,
        price_cents: s.price_cents ? Math.round(Number(s.price_cents) * 100) : null,
      }))
    setStatus('Starting checkout...')
    try {
      const result = await apiFetch('/build/business-crm/checkout', {
        method: 'POST',
        body: JSON.stringify({
          lead_id: selectedLead.id,
          business_name: businessName.trim(),
          owner_full_name: ownerFullName.trim(),
          owner_email: ownerEmail.trim(),
          timezone,
          services: cleanServices,
        }),
      })
      if (result.checkout_url) { setCheckoutUrl(result.checkout_url); setStatus('') }
      else setStatus('Checkout isn’t fully configured yet (Stripe keys pending).')
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Build My Business CRM</h1>
      <p className="font-body text-slate mb-6">
        A staff portal + public booking page for a client's business - they manage appointments, their customers self-book.
      </p>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}><Plus size={14} /> Build New</TabButton>
        <TabButton active={tab === 'demo'} onClick={() => setTab('demo')}><Sparkles size={14} /> Try a Demo</TabButton>
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}><ClipboardList size={14} /> Businesses Created</TabButton>
      </div>

      {tab === 'demo' ? (
        <div className="space-y-4">
          <LeadPicker key="demo" onSelect={setDemoLead} />
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="font-body font-semibold text-navy mb-1">Instant Free Demo</p>
            <p className="font-body text-xs text-slate-400 mb-3">
              Spins up a real, working staff portal and public booking page pre-loaded with sample data - show the
              prospect exactly what they'd get before asking them to buy. No charge, no setup required from them.
            </p>
            <button onClick={runDemo} disabled={demoRunning} className="flex items-center gap-1.5 font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors">
              <Sparkles size={14} /> {demoRunning ? 'Creating demo...' : 'Create Live Demo'}
            </button>
            {demoStatus && <p className="font-body text-sm text-slate mt-3">{demoStatus}</p>}
            {demoResult && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
                <p className="font-body text-sm font-semibold text-navy">Demo ready!</p>
                {demoResult.slug && <BookingLink slug={demoResult.slug} />}
                {demoResult.portal_login_url && (
                  <a href={demoResult.portal_login_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-blue hover:underline">
                    <ExternalLink size={12} /> Staff portal login
                  </a>
                )}
              </div>
            )}
          </div>

          {demos.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400">Previous Demos</p>
              {demos.map((w) => (
                <div key={w.id} className="bg-white border border-slate-200 rounded-2xl p-4">
                  <p className="font-body font-semibold text-navy">{w.business_name}</p>
                  <p className="font-body text-sm text-slate mb-2">{w.lead_business_name}</p>
                  <BookingLink slug={w.slug} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === 'new' ? (
        <div className="space-y-4">
          <LeadPicker key="new" onSelect={handleSelectLead} />

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="font-body font-semibold text-navy mb-1">Business Details</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business name" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body">
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
              <input value={ownerFullName} onChange={(e) => setOwnerFullName(e.target.value)} placeholder="Owner's full name" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
              <input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} type="email" placeholder="Owner's email (their staff login)" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="font-body font-semibold text-navy mb-1">Services</p>
            <p className="font-body text-xs text-slate-400 mb-3">What their customers will be able to book. They can add more later from their own portal.</p>
            <div className="space-y-2">
              {services.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={s.name}
                    onChange={(e) => updateService(i, 'name', e.target.value)}
                    placeholder="Service name"
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 font-body"
                  />
                  <input
                    type="number" min="1" value={s.duration_minutes}
                    onChange={(e) => updateService(i, 'duration_minutes', e.target.value)}
                    placeholder="Minutes"
                    className="w-28 text-sm border border-slate-200 rounded-lg px-3 py-2 font-body"
                  />
                  <input
                    type="number" min="0" step="0.01" value={s.price_cents}
                    onChange={(e) => updateService(i, 'price_cents', e.target.value)}
                    placeholder="Price (optional)"
                    className="w-32 text-sm border border-slate-200 rounded-lg px-3 py-2 font-body"
                  />
                  {services.length > 1 && (
                    <button onClick={() => removeService(i)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addService} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-navy bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5">
              <Plus size={12} /> Add another service
            </button>
          </div>

          <button onClick={submit} className="w-full font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg py-3 transition-colors">
            Continue to Checkout
          </button>
          {status && <p className="font-body text-sm text-slate">{status}</p>}
          {checkoutUrl && <a href={checkoutUrl} className="inline-block font-body font-semibold text-sm text-white bg-blue rounded-lg px-5 py-2.5">Proceed to Payment →</a>}
        </div>
      ) : created.length === 0 ? (
        <EmptyState icon={Calendar} title="No business CRMs built yet" subtitle="Once you build one for a client, it'll show up here." />
      ) : (
        <div className="space-y-3">
          {created.map((w) => (
            <div key={w.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-body font-semibold text-navy">{w.business_name}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {w.status}
                </span>
              </div>
              <p className="font-body text-sm text-slate mb-2">{w.lead_business_name} · {w.timezone}</p>
              <BookingLink slug={w.slug} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
