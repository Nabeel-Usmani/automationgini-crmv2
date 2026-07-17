import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import PlatformOwnerAuth from '../components/PlatformOwnerAuth'
import TabButton from '../components/TabButton'

function CreateOwnerForm({ onCreated }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone_number: '', company_name: '', plan_name: 'Free' })
  const [status, setStatus] = useState('')

  async function submit() {
    if (!form.email || !form.password || !form.full_name || !form.company_name) {
      setStatus('Email, password, name, and company are required.')
      return
    }
    setStatus('Creating...')
    try {
      await apiFetch('/admin/agency-owners', { method: 'POST', body: JSON.stringify(form) })
      setStatus('Created!')
      setForm({ email: '', password: '', full_name: '', phone_number: '', company_name: '', plan_name: 'Free' })
      onCreated()
      setTimeout(() => { setOpen(false); setStatus('') }, 1000)
    } catch (e) {
      setStatus(e.message)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-4 py-2.5 transition-colors mb-6">
        + Create Agency Owner
      </button>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 space-y-3">
      <p className="font-body font-semibold text-navy mb-1">New Agency Owner</p>
      <div className="grid grid-cols-2 gap-3">
        <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="Phone number (optional)" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Company name" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <select value={form.plan_name} onChange={(e) => setForm({ ...form, plan_name: e.target.value })} className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body">
          <option>Free</option><option>Starter</option><option>Pro</option><option>Agency</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={submit} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-4 py-2 transition-colors">Create</button>
        <button onClick={() => setOpen(false)} className="font-body text-sm text-slate">Cancel</button>
        {status && <p className="font-body text-sm text-slate">{status}</p>}
      </div>
    </div>
  )
}

function AgentsModal({ owner, onClose }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    apiFetch(`/admin/agency-owners/${owner.id}/agents`).then(setData).catch(() => {})
  }, [owner])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-display font-semibold text-lg text-navy">Agents under {owner.full_name}</p>
          <button onClick={onClose} className="text-slate text-xl leading-none">&times;</button>
        </div>
        {!data ? (
          <p className="font-body text-sm text-slate">Loading...</p>
        ) : data.agents.length === 0 ? (
          <p className="font-body text-sm text-slate-400">No agents created yet.</p>
        ) : (
          <div className="space-y-2">
            {data.agents.map((a) => (
              <div key={a.id} className="border border-slate-100 rounded-lg px-4 py-2.5">
                <p className="font-body font-semibold text-sm text-navy">{a.full_name}</p>
                <p className="font-body text-xs text-slate">{a.email} {a.phone_number ? `· ${a.phone_number}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AgencyOwnersContent() {
  const [tab, setTab] = useState('listing')
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOwner, setSelectedOwner] = useState(null)

  function load() {
    setLoading(true)
    apiFetch('/admin/agency-owners').then(setOwners).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const maxAgents = Math.max(1, ...owners.map((o) => Number(o.agents_created)))

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Agency Owners</h1>
      <p className="font-body text-slate mb-6">{owners.length} agency owner{owners.length === 1 ? '' : 's'} on the platform.</p>

      <CreateOwnerForm onCreated={load} />

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'listing'} onClick={() => setTab('listing')}>📋 Agency Owner Listing</TabButton>
        <TabButton active={tab === 'distribution'} onClick={() => setTab('distribution')}>📊 Agency Owner Distribution</TabButton>
      </div>

      {loading ? (
        <p className="font-body text-slate">Loading...</p>
      ) : tab === 'listing' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-2.5">Name</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-2.5">Email</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-2.5">Phone</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-2.5">Company</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-2.5">Plan</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-slate-500 px-4 py-2.5">Agents</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.id} onClick={() => setSelectedOwner(o)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 cursor-pointer">
                  <td className="px-4 py-3 font-body font-semibold text-navy">{o.full_name}</td>
                  <td className="px-4 py-3 font-body text-slate">{o.email}</td>
                  <td className="px-4 py-3 font-body text-slate">{o.phone_number || '—'}</td>
                  <td className="px-4 py-3 font-body text-slate">{o.company_name}</td>
                  <td className="px-4 py-3 font-body text-slate">{o.plan_name}</td>
                  <td className="px-4 py-3 font-body text-slate">{o.agents_created}</td>
                </tr>
              ))}
              {owners.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center font-body text-slate-400">No agency owners yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="font-body font-semibold text-navy mb-4">Agents Created per Agency Owner</p>
          <div className="space-y-3">
            {owners.map((o) => (
              <div key={o.id} onClick={() => setSelectedOwner(o)} className="cursor-pointer">
                <div className="flex items-center justify-between text-sm font-body mb-1">
                  <span className="text-navy font-semibold">{o.full_name} <span className="text-slate-400 font-normal">({o.company_name})</span></span>
                  <span className="text-slate">{o.agents_created} agent{Number(o.agents_created) === 1 ? '' : 's'}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue rounded-full transition-all" style={{ width: `${(Number(o.agents_created) / maxAgents) * 100}%` }} />
                </div>
              </div>
            ))}
            {owners.length === 0 && <p className="font-body text-sm text-slate-400">No agency owners yet.</p>}
          </div>
        </div>
      )}

      {selectedOwner && <AgentsModal owner={selectedOwner} onClose={() => setSelectedOwner(null)} />}
    </div>
  )
}

export default function AgencyOwners() {
  return (
    <PlatformOwnerAuth>
      <AgencyOwnersContent />
    </PlatformOwnerAuth>
  )
}
