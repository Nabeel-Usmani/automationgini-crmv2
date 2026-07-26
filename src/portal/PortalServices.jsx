import { useEffect, useState } from 'react'
import { Plus, Pencil, Archive, ClipboardList } from 'lucide-react'
import { listServices, createService, updateService, deactivateService } from '../lib/portalApi'
import EmptyState from '../components/EmptyState'

export default function PortalServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = closed, 'new' = creating, or a service object to edit
  const [status, setStatus] = useState('')

  function load() {
    setLoading(true)
    listServices().then(setServices).catch((e) => setStatus(e.message)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleDeactivate(id) {
    if (!window.confirm('Remove this service? Existing appointments referencing it are unaffected.')) return
    try {
      await deactivateService(id)
      load()
    } catch (e) {
      setStatus(e.message)
    }
  }

  const activeServices = services.filter((s) => s.active)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-semibold text-2xl text-navy mb-1">Services</h1>
          <p className="font-body text-slate">What your customers can book.</p>
        </div>
        <button onClick={() => setEditing('new')} className="flex items-center gap-1.5 font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-4 py-2 transition-colors">
          <Plus size={14} /> Add Service
        </button>
      </div>

      {editing && (
        <ServiceForm
          service={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}

      {status && <p className="font-body text-sm text-red-600 mb-4">{status}</p>}

      {loading ? (
        <p className="font-body text-slate">Loading...</p>
      ) : activeServices.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No services yet" subtitle="Add a service so customers know what they're booking." />
      ) : (
        <div className="space-y-3">
          {activeServices.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body font-semibold text-navy">{s.name}</p>
                <p className="font-body text-sm text-slate">{s.duration_minutes} min{s.price_cents != null ? ` · $${(s.price_cents / 100).toFixed(2)}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(s)} className="flex items-center gap-1 text-xs font-semibold text-navy bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => handleDeactivate(s.id)} className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline">
                  <Archive size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ServiceForm({ service, onCancel, onSaved }) {
  const [name, setName] = useState(service?.name || '')
  const [duration, setDuration] = useState(service?.duration_minutes || 30)
  const [price, setPrice] = useState(service?.price_cents != null ? (service.price_cents / 100).toFixed(2) : '')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) { setStatus('Name is required.'); return }
    if (!duration || duration <= 0) { setStatus('Duration must be a positive number of minutes.'); return }
    setSaving(true)
    setStatus('')
    const payload = { name: name.trim(), duration_minutes: Number(duration), price_cents: price ? Math.round(Number(price) * 100) : null }
    try {
      if (service) await updateService(service.id, payload)
      else await createService(payload)
      onSaved()
    } catch (err) {
      setStatus(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (min)" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (optional)" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
      </div>
      {status && <p className="font-body text-sm text-red-600">{status}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg px-4 py-2 transition-colors">
          {saving ? 'Saving...' : service ? 'Save Changes' : 'Add Service'}
        </button>
        <button type="button" onClick={onCancel} className="font-body text-sm text-slate">Cancel</button>
      </div>
    </form>
  )
}
