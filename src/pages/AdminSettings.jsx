import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import PlatformOwnerAuth from '../components/PlatformOwnerAuth'

function AdminSettingsContent({ user }) {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [status, setStatus] = useState('')

  function load() {
    setLoading(true)
    apiFetch('/admin/platform-admins').then(setAdmins).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function grantAccess() {
    if (!newEmail.trim()) return
    setStatus('Granting access...')
    try {
      await apiFetch('/admin/platform-admins', { method: 'POST', body: JSON.stringify({ email: newEmail.trim() }) })
      setStatus('Done!')
      setNewEmail('')
      load()
    } catch (e) {
      setStatus(e.message)
    }
  }

  async function revoke(id) {
    if (!window.confirm('Remove platform admin access for this account?')) return
    try {
      await apiFetch(`/admin/platform-admins/${id}`, { method: 'DELETE' })
      load()
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Admin Settings</h1>
      <p className="font-body text-slate mb-6">Grant or remove platform admin access.</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <p className="font-body font-semibold text-navy mb-1">Add a Platform Admin</p>
        <p className="font-body text-xs text-slate-400 mb-3">The person must already have a regular account (have them sign up first) — enter the email they used.</p>
        <div className="flex gap-2">
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="their-email@example.com"
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body"
          />
          <button onClick={grantAccess} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-4 py-2.5 transition-colors">Grant Access</button>
        </div>
        {status && <p className="font-body text-sm text-slate mt-2">{status}</p>}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="font-body font-semibold text-navy">Current Platform Admins</p>
        </div>
        {loading ? (
          <p className="px-5 py-4 font-body text-sm text-slate">Loading...</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {admins.map((a) => (
              <div key={a.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="font-body font-semibold text-sm text-navy">{a.full_name}</p>
                  <p className="font-body text-xs text-slate">{a.email}</p>
                </div>
                {a.id !== user.id && (
                  <button onClick={() => revoke(a.id)} className="text-xs font-semibold text-red-600 hover:underline">Remove</button>
                )}
                {a.id === user.id && <span className="text-xs font-semibold text-slate-400">You</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminSettings() {
  return (
    <PlatformOwnerAuth>
      {(user) => <AdminSettingsContent user={user} />}
    </PlatformOwnerAuth>
  )
}
