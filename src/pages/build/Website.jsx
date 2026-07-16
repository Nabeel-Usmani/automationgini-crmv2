import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import TabButton from '../../components/TabButton'
import TemplateGallery from '../../components/TemplateGallery'

const DEFAULT_PAGES = [
  { page_key: 'index', page_title: 'Home' },
  { page_key: 'about', page_title: 'About' },
  { page_key: 'services', page_title: 'Services' },
  { page_key: 'contact', page_title: 'Contact' },
]

const SUGGESTED_EXTRA_PAGES = ['Gallery', 'Pricing', 'Team', 'Blog', 'Testimonials', 'FAQ']

const ARCHITECTURES = [
  { value: 'website_html', label: 'Normal Architecture', price: '$75' },
  { value: 'website_react', label: 'Modern Architecture', price: '$150' },
  { value: 'website_react_video', label: '🎬 Modern Architecture + Embedded Video', price: '$150' },
]

function slugify(title) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function BuildWebsite() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [architecture, setArchitecture] = useState('website_html')
  const [templateId, setTemplateId] = useState(null)
  const [logoDataUri, setLogoDataUri] = useState(null)
  const [logoName, setLogoName] = useState('')
  const [pageCount, setPageCount] = useState(4)
  const [pages, setPages] = useState(DEFAULT_PAGES.map((p) => ({ ...p, use_default_content: true, custom_content: '' })))
  const [newPageTitle, setNewPageTitle] = useState('')
  const [status, setStatus] = useState('')
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [created, setCreated] = useState([])

  useEffect(() => { apiFetch('/build/website/created').then(setCreated).catch(() => {}) }, [tab])

  function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setLogoName(file.name)
    const reader = new FileReader()
    reader.onload = () => setLogoDataUri(reader.result)
    reader.readAsDataURL(file)
  }

  function addPage(title) {
    if (!title.trim() || pages.length >= pageCount) return
    const key = slugify(title)
    if (pages.some((p) => p.page_key === key)) return
    setPages((p) => [...p, { page_key: key, page_title: title.trim(), use_default_content: true, custom_content: '' }])
    setNewPageTitle('')
  }

  function removePage(key) {
    setPages((p) => p.filter((pg) => pg.page_key !== key))
  }

  function updatePage(key, field, value) {
    setPages((p) => p.map((pg) => (pg.page_key === key ? { ...pg, [field]: value } : pg)))
  }

  async function submit() {
    if (!selectedLead) { setStatus('Select a lead first.'); return }
    if (pages.length === 0) { setStatus('Add at least one page.'); return }
    setStatus('Starting checkout...')
    try {
      const result = await apiFetch('/build/website/checkout', {
        method: 'POST',
        body: JSON.stringify({
          lead_id: selectedLead.id,
          product_type: architecture,
          template_id: templateId,
          logo_data_uri: logoDataUri,
          pages: pages.map((p) => ({
            page_key: p.page_key,
            page_title: p.page_title,
            use_default_content: p.use_default_content,
            custom_content: p.use_default_content ? null : p.custom_content,
          })),
        }),
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
        <div className="space-y-5">
          <LeadPicker onSelect={setSelectedLead} />

          {/* Architecture */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="font-body font-semibold text-navy mb-3">Architecture</p>
            <div className="space-y-2">
              {ARCHITECTURES.map((a) => (
                <label key={a.value} className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer transition-colors ${architecture === a.value ? 'border-blue bg-blue/5' : 'border-slate-200'}`}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="architecture" checked={architecture === a.value} onChange={() => setArchitecture(a.value)} className="accent-blue" />
                    <span className="font-body text-sm text-navy">{a.label}</span>
                  </span>
                  <span className="font-mono text-sm text-slate">{a.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Template */}
          <TemplateGallery selectedId={templateId} onSelect={setTemplateId} />

          {/* Logo */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="font-body font-semibold text-navy mb-1">Business Logo</p>
            <p className="font-body text-xs text-slate-400 mb-3">Optional — if provided, it replaces the text business name in the site header.</p>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm font-body" />
            {logoDataUri && (
              <div className="flex items-center gap-3 mt-3">
                <img src={logoDataUri} alt="Logo preview" className="h-10 object-contain" />
                <span className="text-xs font-body text-slate">{logoName}</span>
                <button onClick={() => { setLogoDataUri(null); setLogoName('') }} className="text-xs font-semibold text-red-600">Remove</button>
              </div>
            )}
          </div>

          {/* Page count + pages */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="font-body font-semibold text-navy mb-1">Number of Pages: {pageCount}</p>
            <input type="range" min="1" max="8" value={pageCount} onChange={(e) => setPageCount(Number(e.target.value))} className="w-full accent-blue mb-4" />

            <div className="space-y-3">
              {pages.map((p) => (
                <div key={p.page_key} className="border border-slate-200 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body font-semibold text-sm text-navy">{p.page_title}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-body text-slate cursor-pointer">
                        <input type="checkbox" checked={p.use_default_content} onChange={(e) => updatePage(p.page_key, 'use_default_content', e.target.checked)} className="accent-blue" />
                        Use default AI content
                      </label>
                      {!DEFAULT_PAGES.some((d) => d.page_key === p.page_key) && (
                        <button onClick={() => removePage(p.page_key)} className="text-xs font-semibold text-red-600">Remove</button>
                      )}
                    </div>
                  </div>
                  {!p.use_default_content && (
                    <textarea
                      value={p.custom_content}
                      onChange={(e) => updatePage(p.page_key, 'custom_content', e.target.value)}
                      placeholder="Paste your own content for this page — our AI will organize and polish it into the page design, keeping your facts and wording."
                      rows={4}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body"
                    />
                  )}
                </div>
              ))}
            </div>

            {pages.length < pageCount && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-2">Add a page ({pages.length}/{pageCount})</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SUGGESTED_EXTRA_PAGES.filter((s) => !pages.some((p) => p.page_key === slugify(s))).map((s) => (
                    <button key={s} onClick={() => addPage(s)} className="text-xs font-semibold text-navy bg-slate-100 hover:bg-slate-200 rounded-full px-3 py-1">+ {s}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addPage(newPageTitle)}
                    placeholder="Custom page title..."
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 font-body"
                  />
                  <button onClick={() => addPage(newPageTitle)} className="font-body font-semibold text-sm text-white bg-navy rounded-lg px-4 py-2">Add</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={submit} className="w-full font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg py-3 transition-colors">
            Continue to Checkout — {ARCHITECTURES.find((a) => a.value === architecture)?.price}
          </button>
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
              <a href={`https://automationgini-api.onrender.com/preview?preview=${s.preview_token}&page=index`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue bg-blue/10 rounded-lg px-3 py-1.5">View</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
